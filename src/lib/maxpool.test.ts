import { describe, expect, it } from 'vitest'
import { heatmap, peaks } from './maxpool'

describe('3x3 max-pool peaks', () => {
  it('finds two objects that sit far apart', () => {
    expect(peaks(heatmap(12, [[3, 5], [8, 5]], 1), 0.3)).toEqual([[3, 5], [8, 5]])
  })
  it('merges two objects in the same cell into one detection', () => {
    expect(peaks(heatmap(12, [[5, 5], [5.3, 5]], 1), 0.3)).toHaveLength(1)
  })
  it('keeps both cells when two adjacent centres tie', () => {
    expect(peaks(heatmap(12, [[5, 5], [6, 5]], 1), 0.3)).toEqual([[5, 5], [6, 5]])
  })
  it('loses an object whose centre is 1.3 cells away, in a different cell', () => {
    expect(peaks(heatmap(12, [[4, 6], [5.3, 6]], 1), 0.3)).toEqual([[4, 6]])
  })
  it('keeps both cells of a halfway tie: one object, two detections', () => {
    expect(peaks(heatmap(12, [[4, 6], [6.5, 6]], 1), 0.3)).toHaveLength(3)
  })
  it('drops a peak below the score threshold', () => {
    const h = heatmap(12, [[5, 5]], 1).map((r) => r.map((v) => v * 0.2))
    expect(peaks(h, 0.3)).toEqual([])
  })
})
