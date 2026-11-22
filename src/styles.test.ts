import { describe, expect, it } from 'vitest'
import { NODE_KINDS } from './content/pipeline'
import css from './index.css?raw'

// Reads the pipeline node colours straight from the stylesheet, per theme block, and checks WCAG AA (4.5:1)
// for both ways a node is drawn: hue text on its tint (unlit) and on-ink text on the hue (lit).
const block = (start: string) => css.slice(css.indexOf(start), css.indexOf('color-scheme', css.indexOf(start)))
const THEMES = { light: block(':root {'), dark: block(':root:not([data-theme=') }

const token = (src: string, name: string) => {
  const m = src.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6});`))
  if (!m) throw new Error(`--${name} missing`)
  return m[1]
}
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe('pipeline node colours meet AA in both themes', () => {
  for (const [theme, src] of Object.entries(THEMES)) {
    for (const k of NODE_KINDS) {
      it(`${theme} ${k}`, () => {
        expect(contrast(token(src, `k-${k}`), token(src, `k-${k}-bg`))).toBeGreaterThanOrEqual(4.5)
        expect(contrast(token(src, `k-${k}`), token(src, 'k-on-ink'))).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})
