// Presses real keys in headless Chrome (DevTools protocol) and exits non-zero when keyboard use is broken:
// arrow keys move between chapters, arrows inside a slider stay in the slider, Play walks the
// chapters and step buttons walk a chapter. Needs Node 22+ (built-in WebSocket) and a Chrome whose debug port this
// process can reach (Linux CI). Run after `npm run build`.
import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = 4182
const DEBUG = 9229
const BASE = `http://localhost:${PORT}/`
const CHROME = process.env.CHROME ?? 'google-chrome'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function until(what, probe) {
  for (let i = 0; i < 75; i++) {
    try {
      const v = await probe()
      if (v) return v
    } catch {
      // not up yet
    }
    await sleep(200)
  }
  throw new Error(`${what} did not start`)
}

if (typeof WebSocket === 'undefined') {
  console.error(`keys.mjs needs Node 22+ (built-in WebSocket); this is ${process.version}`)
  process.exit(2)
}

const profile = mkdtempSync(join(tmpdir(), 'keys-'))
const vite = spawn(join(ROOT, 'node_modules/.bin/vite'), ['preview', '--port', String(PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' })
const chrome = spawn(
  CHROME,
  ['--headless=new', '--disable-gpu', '--no-first-run', `--remote-debugging-port=${DEBUG}`, `--user-data-dir=${profile}`, '--window-size=1280,1600', 'about:blank'],
  { stdio: 'ignore' },
)

let failed = 0
let checks = 0
const report = (name, bad) => {
  checks++
  if (bad.length) failed++
  console.log(`${bad.length ? 'FAIL' : 'ok  '} ${name}${bad.length ? '\n     ' + bad.join('\n     ') : ''}`)
}

try {
  await until('preview server', async () => (await fetch(BASE)).ok)
  const target = await until('Chrome debug port', async () => {
    const list = await (await fetch(`http://127.0.0.1:${DEBUG}/json/list`)).json()
    return list.find((t) => t.type === 'page')
  })
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => {
    ws.onopen = res
    ws.onerror = rej
  })
  let id = 0
  const pending = new Map()
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  }
  const send = (method, params = {}) =>
    new Promise((res, rej) => {
      const n = ++id
      pending.set(n, (msg) => (msg.error ? rej(new Error(`${method}: ${msg.error.message}`)) : res(msg.result)))
      ws.send(JSON.stringify({ id: n, method, params }))
    })
  const js = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value
  const KEYS = { ArrowRight: 39, ArrowLeft: 37, Tab: 9 }
  const press = async (key) => {
    for (const type of ['rawKeyDown', 'keyUp']) {
      await send('Input.dispatchKeyEvent', { type, key, code: key, windowsVirtualKeyCode: KEYS[key], nativeVirtualKeyCode: KEYS[key] })
    }
    await sleep(150)
  }
  const open = async (hash) => {
    // A hash change keeps the old document (and its focus position); pass through a blank page for a fresh one.
    await send('Page.navigate', { url: 'about:blank' })
    await until('blank page', () => js(`location.href === 'about:blank'`))
    await send('Page.navigate', { url: BASE + hash })
    await until(`page ${hash}`, () => js(`!!document.querySelector('h1') && location.hash === '${hash}'`))
    await sleep(300)
  }
  await send('Page.enable')
  await send('Runtime.enable')

  // Arrow keys move between chapters; left from chapter 1 is the overview.
  await open('#/map')
  const seen = []
  for (const k of ['ArrowRight', 'ArrowLeft', 'ArrowLeft']) {
    await press(k)
    seen.push(await js('location.hash'))
  }
  const want = ['#/peaks', '#/map', '#/keypoints']
  report('arrow keys: right, left, left from #/map', seen.join() === want.join() ? [] : [`went ${seen.join(' → ')}, expected ${want.join(' → ')}`])
  await open('#/camera')
  await press('ArrowLeft')
  const home = await js(`location.hash + ' ' + !!document.getElementById('overview')`)
  report('arrow left from chapter 1 opens the overview', home === '#/ true' ? [] : [`got ${home}, expected #/ true`])

  // Arrows inside a slider move the slider, not the chapter.
  await open('#/keypoints')
  const before = await js(`(document.getElementById('kp-pos').focus(), document.getElementById('kp-pos').value)`)
  await press('ArrowRight')
  const after = await js(`location.hash + ' ' + document.getElementById('kp-pos').value`)
  report('arrow right in a slider stays in the chapter and moves the slider', after.startsWith('#/keypoints ') && after.split(' ')[1] !== before ? [] : [`slider ${before} → ${after}`])

  // The drag hint under the first slider shows until the reader moves a control, then goes.
  await open('#/keypoints')
  const hint = `getComputedStyle(document.getElementById('kp-pos').closest('label'), '::after').content`
  const shown = await js(hint)
  await js(`document.getElementById('kp-pos').focus()`)
  await press('ArrowRight')
  const gone = await js(hint)
  report('drag hint shown on open, gone after the first slider move', shown.includes('drag') && gone === 'none' ? [] : [`before: ${shown}, after: ${gone}`])

  // Play opens the next chapter after one beat (2.4 s), lights its node, and stops on the last chapter.
  await open('#/real')
  await js(`document.getElementById('pipe-play').click()`)
  await sleep(2800)
  const played = await js(`location.hash + ' ' + document.querySelector('.pipe-node[aria-current="step"]')?.id`)
  await sleep(2800)
  const stopped = await js(`location.hash + ' ' + document.getElementById('pipe-play').getAttribute('aria-pressed')`)
  report('Play: #/real → #/int8, lights the detector node, stops on the last chapter', [
    ...(played === '#/int8 node-net' ? [] : [`after one beat: ${played}, expected #/int8 node-net`]),
    ...(stopped === '#/int8 false' ? [] : [`after two beats: ${stopped}, expected #/int8 false`]),
  ])

  // Steps: Next three times on chapter 1 reaches step 4, lights the measured-results line, and disables Next.
  await open('#/camera')
  for (let k = 0; k < 3; k++) await js(`document.getElementById('step-next').click()`)
  await sleep(150)
  const stepped = await js(
    `[document.querySelector('.steps-count').textContent, document.querySelectorAll('[data-lit]').length, document.querySelector('[data-lit]')?.textContent.includes('1.91 mm'), document.getElementById('step-next').disabled].join(' | ')`,
  )
  report('Steps: Next ×3 on #/camera → step 4 / 4, results line lit, Next disabled', stepped === 'Step 4 / 4 | 1 | true | true' ? [] : [`got ${stepped}`])
} finally {
  chrome.kill()
  vite.kill()
  await sleep(300)
  rmSync(profile, { recursive: true, force: true })
}

console.log(`${checks - failed}/${checks} keyboard checks passed`)
process.exit(failed ? 1 : 0)
