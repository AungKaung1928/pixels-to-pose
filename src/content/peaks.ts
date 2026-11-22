// Decode time (max-pool, top-k, gather) from the mujoco-clutter-detect README.
export const DECODE_MS = 0.18

// The chapter's heatmap: an illustration (the real one is 48 x 48, stride 4 on a 192 px image).
// cells per side, blob width and score threshold in cells, opening separation of the two centres.
export const PEAK_GRID = { n: 12, sigma: 1, thr: 0.3, sep: 0.6 }
