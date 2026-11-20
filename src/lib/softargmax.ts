// 1-D spatial soft-argmax (Levine et al. 2016, arXiv 1504.00702, section 4.1): the expected
// coordinate under softmax(beta * feature) instead of the index of the largest feature.

/** Feature response of a blob centred at x0 (cells), width sigma, sampled at cell centres 0..n-1. */
export function blob(n: number, x0: number, sigma = 1.2): number[] {
  return Array.from({ length: n }, (_, i) => Math.exp(-((i - x0) ** 2) / (2 * sigma * sigma)))
}

export function softmax(f: readonly number[], beta: number): number[] {
  const m = Math.max(...f)
  const e = f.map((v) => Math.exp(beta * (v - m)))
  const s = e.reduce((a, b) => a + b, 0)
  return e.map((v) => v / s)
}

export function argmax(f: readonly number[]): number {
  return f.reduce((best, v, i) => (v > f[best] ? i : best), 0)
}

export function softArgmax(f: readonly number[], beta: number): number {
  return softmax(f, beta).reduce((acc, w, i) => acc + w * i, 0)
}
