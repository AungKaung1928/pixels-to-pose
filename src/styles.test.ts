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

// Text and marks that sit on the page ground or on a white frame: AA (4.5:1) in both themes.
describe('text tokens meet AA on ground and frame in both themes', () => {
  const FG = ['ink', 'ink-2', 'ink-3', 'accent', 'peak', 'series-1', 'focus']
  for (const [theme, src] of Object.entries(THEMES)) {
    for (const fg of FG) {
      for (const bg of ['bg', 'surface']) {
        it(`${theme} ${fg} on ${bg}`, () => {
          expect(contrast(token(src, fg), token(src, bg))).toBeGreaterThanOrEqual(4.5)
        })
      }
    }
    it(`${theme} on-accent on accent`, () => {
      expect(contrast(token(src, 'on-accent'), token(src, 'accent'))).toBeGreaterThanOrEqual(4.5)
    })
  }
})

// Header and overview strip: edge print on the film base.
describe('film edge print meets AA in both themes', () => {
  for (const [theme, src] of Object.entries(THEMES)) {
    for (const fg of ['on-film', 'on-film-2']) {
      it(`${theme} ${fg} on film`, () => {
        expect(contrast(token(src, fg), token(src, 'film'))).toBeGreaterThanOrEqual(4.5)
      })
    }
  }
})

// Vermilion means "the winning cell" and nothing else: its hex is only the --peak token, used only by the argmax cell.
describe('vermilion is reserved for the peak', () => {
  for (const [theme, src] of Object.entries(THEMES)) {
    it(`${theme}: the peak colour is defined once, as --peak`, () => {
      expect(src.split(token(src, 'peak')).length - 1).toBe(1)
    })
  }
  it('var(--peak) is used only by the argmax cell', () => {
    const users = [...css.matchAll(/([^{}]+)\{[^}]*var\(--peak\)/g)].map((m) => m[1].trim())
    expect(users).toEqual(['.kp-cell.top'])
  })
})

// Every animated selector is switched off again inside a prefers-reduced-motion block.
describe('reduced motion', () => {
  it('each animation has a reduced-motion override', () => {
    const reduced = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n')
    const animated = [...css.matchAll(/([^{}]+)\{[^}]*\banimation:(?!\s*none)[^;]+;/g)].map((m) => m[1].trim())
    expect(animated.length).toBeGreaterThan(0)
    for (const sel of animated) {
      expect(reduced, sel).toMatch(new RegExp(`${sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{[^}]*animation:\\s*none`))
    }
  })
})
