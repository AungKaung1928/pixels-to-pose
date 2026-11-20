import { describe, expect, it } from 'vitest'
import { cheapest, methods, passing } from './detect'

describe('classical or learned (mujoco-cube-pose-cnn README)', () => {
  it('the fixed-hue rule never passes: it finds the cube in 10.9 % of images', () => {
    expect(passing(100, 'median').map((m) => m.id)).not.toContain('hue')
  })
  it('if 2 mm median is good enough, one calibrated scalar wins (0.06 ms vs 0.12 ms)', () => {
    expect(cheapest(2, 'median')?.id).toBe('calib')
  })
  it('the README says the speed gap shrinks from 11x to 3.8x with ONNX Runtime', () => {
    const by = (id: string) => methods.find((m) => m.id === id)!
    expect(by('softargmax').ms / by('calib').ms).toBeCloseTo(10.8, 1)
    expect(by('ort1').ms / by('calib').ms).toBeCloseTo(3.8, 1)
  })
  it('a tight p95 needs the CNN; nothing passes below 1.32 mm', () => {
    expect(cheapest(1.5, 'p95')?.id).toBe('ort8')
    expect(cheapest(1, 'p95')).toBeNull()
  })
})
