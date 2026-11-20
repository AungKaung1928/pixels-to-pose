import { describe, expect, it } from 'vitest'
import { rows, speedup } from './int8'

const by = (id: string) => rows.find((r) => r.id === id)!

describe('INT8 chapter numbers (mujoco-clutter-detect README)', () => {
  it('ids are unique and every row has both languages', () => {
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length)
    for (const r of rows) expect(r.label.en && r.label.ja).toBeTruthy()
  })
  it('static INT8: 2.6x faster on one thread for -0.0010 mAP, under the classical 2.13 ms', () => {
    expect(speedup(by('fp32'), by('int8-static'))).toBeCloseTo(2.59, 2)
    expect(by('int8-static').map - by('fp32').map).toBeCloseTo(-0.001, 4)
    expect(by('int8-static').ms1).toBeLessThan(by('classical').ms1)
  })
  it('pruning costs more accuracy than INT8', () => {
    expect(by('prune50').map).toBeLessThan(by('int8-static').map - 0.06)
  })
})
