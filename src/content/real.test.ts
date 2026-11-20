import { describe, expect, it } from 'vitest'
import { THRESHOLDS } from '../lib/iou'
import { realGap } from './real'

const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length

describe('sim vs real AP curves (mujoco-clutter-detect runs/ap_by_iou.json)', () => {
  for (const [name, c] of Object.entries(realGap)) {
    it(`${name}: one value per IoU threshold`, () => {
      expect(c.sim).toHaveLength(THRESHOLDS.length)
      expect(c.real).toHaveLength(THRESHOLDS.length)
    })
    it(`${name}: mAP is the mean of its curve (4-digit rounding)`, () => {
      expect(Math.abs(mean(c.sim) - c.simMap)).toBeLessThan(2e-4)
      expect(Math.abs(mean(c.real) - c.realMap)).toBeLessThan(2e-4)
    })
    it(`${name}: AP never rises with a stricter threshold`, () => {
      for (const k of ['sim', 'real'] as const)
        for (let i = 1; i < 10; i++) expect(c[k][i]).toBeLessThanOrEqual(c[k][i - 1])
    })
  }
})
