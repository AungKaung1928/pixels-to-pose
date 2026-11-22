// Loads the built site in headless Chrome and exits non-zero when a chapter is broken.
// Feature map: docs/FEATURES.md. Run through scripts/verify.sh (it builds first).
import { spawn, spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PORT = Number(process.env.VERIFY_PORT ?? 4181)
const BASE = `http://localhost:${PORT}/`
const OUT = join(ROOT, 'verify-out')

// One row per chapter: its anchor id and whether it draws an SVG figure.
const CHAPTERS = [
  { id: 'camera', svg: false },
  { id: 'detect', svg: false },
  { id: 'keypoints', svg: true },
  { id: 'map', svg: true },
  { id: 'peaks', svg: true },
  { id: 'real', svg: false },
  { id: 'int8', svg: false },
]

function findChrome() {
  const candidates = [
    process.env.CHROME,
    'google-chrome',
    'chromium',
    'chromium-browser',
    '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
  ].filter(Boolean)
  for (const c of candidates) {
    if (c.includes('/') ? existsSync(c) : spawnSync('which', [c]).status === 0) return c
  }
  throw new Error('no Chrome found: set CHROME=/path/to/chrome')
}

const CHROME = findChrome()
// A Windows Chrome started from WSL needs a Windows path for the screenshot file.
const chromePath = (p) =>
  CHROME.endsWith('.exe') ? spawnSync('wslpath', ['-w', p], { encoding: 'utf8' }).stdout.trim() : p

function load(path, { lang = 'en', shot } = {}) {
  const args = [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    `--lang=${lang}`, // Windows and macOS Chrome
    `--accept-lang=${lang}`, // Linux Chrome ignores --lang; this sets navigator.languages
    '--virtual-time-budget=4000',
    '--enable-logging=stderr',
    '--window-size=1280,1600',
  ]
  const env = { ...process.env, LANGUAGE: lang }
  const run = (extra) => spawnSync(CHROME, [...args, ...extra, BASE + path], { encoding: 'utf8', timeout: 60_000, env })
  // Chrome's first start can return no DOM at all; a broken page still returns one, so this retry hides no failure.
  let r = run(['--dump-dom'])
  if (!r.stdout) r = run(['--dump-dom'])
  if (shot) run([`--screenshot=${chromePath(join(OUT, shot))}`])
  const consoleErrors = (r.stderr ?? '')
    .split('\n')
    .filter((l) => /CONSOLE/.test(l) && /ERROR:CONSOLE|Uncaught|Error:/.test(l))
  return { dom: r.stdout ?? '', consoleErrors }
}

// The markup of the open chapter: inside <main>.
const mainOf = (dom) => dom.match(/<main>([\s\S]*)<\/main>/)?.[1] ?? ''
const h1Of = (html) => html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.trim() ?? ''

async function startServer() {
  const vite = spawn(join(ROOT, 'node_modules/.bin/vite'), ['preview', '--port', String(PORT), '--strictPort'], {
    cwd: ROOT,
    stdio: 'ignore',
  })
  for (let i = 0; i < 50; i++) {
    if (vite.exitCode !== null) break
    try {
      if ((await fetch(BASE)).ok) return vite
    } catch {
      // not listening yet
    }
    await new Promise((r) => setTimeout(r, 200))
  }
  vite.kill()
  throw new Error(`preview server did not start on port ${PORT} (run npm run build first; is the port taken?)`)
}

mkdirSync(OUT, { recursive: true })

// Phone width: headless Chrome cannot open a 390 px window on every platform, so a same-origin page holds the
// site (at the frame page's own hash) in a 390 px frame and prints the page's scroll width next to the frame's width, naming the element that
// sticks out furthest on overflow.
const FRAME = join(ROOT, 'dist', '_frame.html')
writeFileSync(
  FRAME,
  `<!doctype html><body style="margin:0"><iframe id="f" style="width:390px;height:844px;border:0"></iframe><script>
const f = document.getElementById('f')
f.onload = () => setTimeout(() => {
  const w = f.contentWindow
  const d = f.contentDocument.documentElement
  const contained = (el) => {
    for (let a = el.parentElement; a && a !== f.contentDocument.body; a = a.parentElement)
      if (w.getComputedStyle(a).overflowX !== 'visible') return true
    return false
  }
  let who = ''
  let far = d.clientWidth + 1
  if (d.scrollWidth > d.clientWidth)
    for (const el of f.contentDocument.body.querySelectorAll('*')) {
      const right = el.getBoundingClientRect().right
      if (right > far && !contained(el)) { far = right; who = el.tagName.toLowerCase() + '.' + [...el.classList].join('.') }
    }
  document.body.append('PHONE ' + d.scrollWidth + ' ' + d.clientWidth + ' ' + who + ' ')
}, 1000)
f.src = '/' + location.hash
</script>`,
)
const server = await startServer()
let failed = 0
let pages = 0
const report = (name, bad) => {
  pages++
  if (bad.length) failed++
  console.log(`${bad.length ? 'FAIL' : 'ok  '} ${name}${bad.length ? '\n     ' + bad.join('\n     ') : ''}`)
}

const phone = (hash, lang) => {
  const p = load('_frame.html' + hash, { lang, shot: lang === 'en' ? `${hash.slice(2) || 'overview'}-phone.png` : undefined })
  const m = p.dom.match(/PHONE (\d+) (\d+) ([^ ]*)/)
  if (!m) return ['390 px frame not measured']
  return Number(m[1]) > Number(m[2]) ? [`page is ${m[1]} px wide in a ${m[2]} px frame (sticks out furthest: ${m[3]})`] : []
}
// Contents list: one link per chapter, in order.
const contents = (dom) => {
  const links = [...dom.matchAll(/<a href="#\/([\w-]+)"/g)].map((m) => m[1])
  return links.join() === CHAPTERS.map((c) => c.id).join() ? [] : [`contents links ${links.join()}`]
}

try {
  // Overview: the empty hash, "#/" and an unknown chapter all land on it.
  for (const lang of ['en', 'ja']) {
    for (const hash of ['', '#/', '#/nope']) {
      const p = load(hash, { lang, shot: lang === 'en' && !hash ? 'overview.png' : undefined })
      const bad = [...p.consoleErrors.map((e) => `console: ${e.slice(-160)}`), ...contents(p.dom)]
      if (!/id="overview"/.test(p.dom)) bad.push('overview not shown')
      if (/class="chapter"/.test(p.dom)) bad.push('a chapter is open on the overview')
      report(`overview at "${hash}" (${lang})`, bad)
    }
    report(`overview at 390 px (${lang})`, phone('', lang))
  }
  const titles = []
  for (const ch of CHAPTERS) {
    const hash = `#/${ch.id}`
    const en = load(hash, { shot: `${ch.id}.png` })
    const ja = load(hash, { lang: 'ja' })
    const e = mainOf(en.dom)
    const bad = [...en.consoleErrors, ...ja.consoleErrors].map((x) => `console: ${x.slice(-160)}`)
    bad.push(...contents(en.dom))
    if (!e.includes(`class="chapter" id="${ch.id}"`)) bad.push(`chapter ${ch.id} is not the one open`)
    if (!new RegExp(`href="${hash}" aria-current="page"`).test(en.dom)) bad.push('contents does not mark this chapter')
    if (!h1Of(e)) bad.push('no chapter title (h1)')
    if (ch.svg && !/<svg/.test(e)) bad.push('no svg figure drawn')
    if (!/<(table|svg|input)/.test(e)) bad.push('no table, figure or control')
    if (h1Of(mainOf(ja.dom)) === h1Of(e)) bad.push(`title not translated in ja: "${h1Of(e)}"`)
    titles.push(h1Of(e))
    report(hash, bad)
    for (const lang of ['en', 'ja']) report(`${hash} at 390 px (${lang})`, phone(hash, lang))
  }
  // Each route opens its own chapter: a route wired to another chapter's component repeats that title.
  report('every chapter route shows its own title', new Set(titles).size === CHAPTERS.length ? [] : [`titles: ${titles.join(' | ')}`])
} finally {
  server.kill()
  rmSync(FRAME, { force: true })
}

console.log(`${pages - failed}/${pages} checks passed, screenshots in verify-out/`)
process.exit(failed ? 1 : 0)
