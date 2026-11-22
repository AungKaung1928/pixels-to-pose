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

// The markup of one chapter: from its anchor to the next chapter's anchor.
function chapterHtml(dom, i) {
  const start = dom.indexOf(`id="${CHAPTERS[i].id}"`)
  if (start < 0) return null
  const next = CHAPTERS[i + 1] ? dom.indexOf(`id="${CHAPTERS[i + 1].id}"`, start) : -1
  return dom.slice(start, next < 0 ? undefined : next)
}

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
// site in a 390 px frame and prints the page's scroll width next to the frame's width, naming the element that
// sticks out furthest on overflow.
const FRAME = join(ROOT, 'dist', '_frame.html')
writeFileSync(
  FRAME,
  `<!doctype html><body style="margin:0"><iframe id="f" src="/" style="width:390px;height:844px;border:0"></iframe><script>
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

try {
  const en = load('', { shot: 'page.png' })
  const ja = load('', { lang: 'ja' })
  for (const [lang, page] of [['en', en], ['ja', ja]]) {
    report(`page loads (${lang})`, page.consoleErrors.map((e) => `console: ${e.slice(-160)}`))
    // Every contents link points at a chapter that exists.
    const links = [...page.dom.matchAll(/<a href="#([\w-]+)">/g)].map((m) => m[1])
    const bad = CHAPTERS.filter((c) => !links.includes(c.id)).map((c) => `no contents link to #${c.id}`)
    for (const id of links) if (!page.dom.includes(`id="${id}"`)) bad.push(`contents link #${id} has no target`)
    report(`contents (${lang})`, bad)
  }
  CHAPTERS.forEach((ch, i) => {
    const e = chapterHtml(en.dom, i)
    const j = chapterHtml(ja.dom, i)
    const bad = []
    if (e === null) bad.push(`no element id="${ch.id}"`)
    else {
      if (!h1Of(e)) bad.push('no chapter title (h1)')
      if (ch.svg && !/<svg/.test(e)) bad.push('no svg figure drawn')
      if (!/<(table|svg|input)/.test(e)) bad.push('no table, figure or control')
      if (j !== null && h1Of(j) === h1Of(e)) bad.push(`title not translated in ja: "${h1Of(e)}"`)
    }
    report(`#${ch.id}`, bad)
  })
  for (const lang of ['en', 'ja']) {
    const p = load('_frame.html', { lang, shot: lang === 'en' ? 'page-phone.png' : undefined })
    const m = p.dom.match(/PHONE (\d+) (\d+) ([^ ]*)/)
    const bad = !m ? ['390 px frame not measured'] : Number(m[1]) > Number(m[2]) ? [`page is ${m[1]} px wide in a ${m[2]} px frame (sticks out furthest: ${m[3]})`] : []
    report(`no sideways scroll at 390 px (${lang})`, bad)
  }
} finally {
  server.kill()
  rmSync(FRAME, { force: true })
}

console.log(`${pages - failed}/${pages} checks passed, screenshots in verify-out/`)
process.exit(failed ? 1 : 0)
