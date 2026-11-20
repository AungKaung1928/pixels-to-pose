import { describe, expect, it } from 'vitest'
import { argmax, blob, softArgmax, softmax } from './softargmax'

describe('soft-argmax', () => {
  it('softmax sums to 1', () => {
    expect(softmax([1, 2, 3], 4).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
  })
  it('argmax snaps to a whole cell: up to half a cell of error', () => {
    expect(argmax(blob(16, 7.4))).toBe(7)
  })
  it('soft-argmax recovers a sub-cell position', () => {
    expect(Math.abs(softArgmax(blob(16, 7.4), 5) - 7.4)).toBeLessThan(0.01)
  })
  it('very sharp softmax falls back to argmax', () => {
    expect(softArgmax(blob(16, 7.4), 2000)).toBeCloseTo(7, 3)
  })
})
