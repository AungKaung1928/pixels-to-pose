// Chapter: classical or learned? Numbers: mujoco-cube-pose-cnn README, Results table
// (`hard` regime: random cube hue, light and table shade; val split, n = 2000; CPU only).

export interface Method {
  id: string
  label: { en: string; ja: string }
  params: number
  detect: number // fraction of images where the method finds the cube
  median: number // mm, position error
  p95: number // mm
  ms: number // latency per image
}

export const methods: Method[] = [
  { id: 'hue', label: { en: 'OpenCV, fixed red hue', ja: 'OpenCV、赤色の固定色相' }, params: 0, detect: 0.109, median: 3.48, p95: 6.07, ms: 0.06 },
  { id: 'sat', label: { en: 'OpenCV, most saturated blob', ja: 'OpenCV、最も彩度の高い領域' }, params: 0, detect: 1, median: 3.41, p95: 5.57, ms: 0.05 },
  { id: 'calib', label: { en: 'OpenCV + 1 calibrated scalar', ja: 'OpenCV + キャリブレーションしたスカラー 1 つ' }, params: 1, detect: 1, median: 1.91, p95: 2.89, ms: 0.06 },
  { id: 'flatten', label: { en: 'CNN, flatten head, PyTorch', ja: 'CNN、flatten ヘッド、PyTorch' }, params: 130_000, detect: 1, median: 0.75, p95: 2.0, ms: 1.7 },
  { id: 'softargmax', label: { en: 'CNN, soft-argmax head, PyTorch', ja: 'CNN、soft-argmax ヘッド、PyTorch' }, params: 27_000, detect: 1, median: 0.59, p95: 1.32, ms: 0.65 },
  { id: 'ort1', label: { en: 'Same CNN, ONNX Runtime, 1 thread', ja: '同じ CNN、ONNX Runtime、1 スレッド' }, params: 27_000, detect: 1, median: 0.59, p95: 1.32, ms: 0.23 },
  { id: 'ort8', label: { en: 'Same CNN, ONNX Runtime, 8 threads', ja: '同じ CNN、ONNX Runtime、8 スレッド' }, params: 27_000, detect: 1, median: 0.59, p95: 1.32, ms: 0.12 },
]

export type Stat = 'median' | 'p95'

/** Methods that always find the cube and stay within `tolMm` on the chosen statistic. */
export function passing(tolMm: number, stat: Stat): Method[] {
  return methods.filter((m) => m.detect === 1 && m[stat] <= tolMm)
}

/** The fastest passing method, or null when none passes. */
export function cheapest(tolMm: number, stat: Stat): Method | null {
  const p = passing(tolMm, stat)
  return p.length ? p.reduce((a, b) => (b.ms < a.ms ? b : a)) : null
}
