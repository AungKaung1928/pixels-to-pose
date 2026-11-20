// Peak picking with a 3x3 max-pool, the "NMS" of a centre-heatmap detector (CenterNet,
// Zhou et al. 2019, arXiv 1904.07850). mujoco-clutter-detect uses exactly this: a cell is a
// detection when it equals the max of its 3x3 neighbourhood and clears the score threshold
// (README, "3x3 max-pool is the NMS"). Ties keep every tied cell, as `hmax == heat` does.

/** n x n heatmap: per cell, the max over objects of a Gaussian at the object's centre (cell units). */
export function heatmap(n: number, centres: [number, number][], sigma: number): number[][] {
  return Array.from({ length: n }, (_, y) =>
    Array.from({ length: n }, (_, x) =>
      Math.max(0, ...centres.map(([cx, cy]) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / (2 * sigma * sigma)))),
    ),
  )
}

/** Cells equal to their 3x3 max and at least `thr`: the detections, as [x, y]. */
export function peaks(h: number[][], thr: number): [number, number][] {
  const out: [number, number][] = []
  const n = h.length
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const v = h[y][x]
      if (v < thr) continue
      let m = -Infinity
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const yy = y + dy
          const xx = x + dx
          if (yy >= 0 && yy < n && xx >= 0 && xx < n) m = Math.max(m, h[yy][xx])
        }
      if (v === m) out.push([x, y])
    }
  return out
}
