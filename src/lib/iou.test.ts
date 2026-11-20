import { describe, expect, it } from 'vitest'
import { THRESHOLDS, iouShift, measured, passedThresholds } from './iou'

describe('IoU under a shift (mujoco-clutter-detect README)', () => {
  it('matches the predicted IoU column for w = 28', () => {
    expect(iouShift(28, 2)).toBeCloseTo(0.867, 3)
    expect(iouShift(28, 4)).toBeCloseTo(0.75, 3)
    expect(iouShift(28, 7)).toBeCloseTo(0.6, 3)
    expect(iouShift(28, 12)).toBeCloseTo(0.4, 3)
    expect(iouShift(28, 30)).toBe(0)
  })
  it('ten COCO thresholds from 0.50 to 0.95', () => {
    expect(THRESHOLDS).toHaveLength(10)
    expect(THRESHOLDS[0]).toBe(0.5)
    expect(THRESHOLDS[9]).toBe(0.95)
  })
  it('a 4 px shift still passes 0.50 but fails 0.80 and up', () => {
    const p = passedThresholds(iouShift(28, 4))
    expect(p).toContain(0.5)
    expect(p).not.toContain(0.8)
  })
  it('AP50 is blind to a 4 px shift while mAP halves', () => {
    const r = measured.find((m) => m.d === 4)!
    expect(r.ap50).toBe(1)
    expect(r.map).toBeLessThan(0.5)
  })
})
