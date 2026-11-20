import { describe, expect, it } from 'vitest'
import { averagedFloor, metresPerPixel, silhouettePixels } from './camera'

describe('pinhole numbers match mujoco-cube-pose-cnn README', () => {
  const m = metresPerPixel(0.42, 45, 128)
  it('1 px = 2.72 mm (367.9 px/m)', () => {
    expect(m * 1000).toBeCloseTo(2.72, 2)
    expect(1 / m).toBeCloseTo(367.9, 0)
  })
  it('a 6 cm cube covers about 480 pixels and the averaged floor is about 0.12 mm', () => {
    const n = silhouettePixels(0.06, m)
    expect(n).toBeGreaterThan(470)
    expect(n).toBeLessThan(500)
    expect(averagedFloor(m, n) * 1000).toBeCloseTo(0.12, 2)
  })
  it('doubling the distance doubles the pixel size', () => {
    expect(metresPerPixel(0.84, 45, 128)).toBeCloseTo(2 * m, 10)
  })
})
