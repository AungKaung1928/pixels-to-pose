import { describe, expect, it } from 'vitest'
import { CHAPTER_IDS } from './route'
import { thumb } from './thumbs'

describe('overview thumbnails', () => {
  for (const id of CHAPTER_IDS) {
    it(`${id}: at least 2 bars in 0..1, tallest 1, at least one lit bar that exists`, () => {
      const { bars, lit } = thumb(id)
      expect(bars.length).toBeGreaterThanOrEqual(2)
      expect(bars.every((b) => b >= 0 && b <= 1)).toBe(true)
      expect(Math.max(...bars)).toBe(1)
      expect(lit.length).toBeGreaterThan(0)
      expect(lit.every((i) => Number.isInteger(i) && i >= 0 && i < bars.length)).toBe(true)
    })
  }
  it('keypoints lights the strongest cell, cell 7 at the opening setting', () => {
    expect(thumb('keypoints').lit).toEqual([7])
  })
  it('peaks at the opening setting keeps one cell: the two objects merge', () => {
    expect(thumb('peaks').lit).toHaveLength(1)
  })
})
