import { describe, expect, it } from 'vitest'
import { markPos } from './marks'

describe('markPos', () => {
  it('maps min, max and a middle value', () => {
    expect(markPos(0.2, 0.2, 1)).toBe(0)
    expect(markPos(1, 0.2, 1)).toBe(1)
    expect(markPos(7, 0, 14)).toBe(0.5)
  })
  it('clamps values outside the range', () => {
    expect(markPos(-3, 0, 14)).toBe(0)
    expect(markPos(20, 0, 14)).toBe(1)
  })
})
