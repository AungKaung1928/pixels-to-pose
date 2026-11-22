// Two heads on the same backbone and data, from the mujoco-cube-pose-cnn README (finding 5).
export const HEADS = [
  { id: 'flatten', params: '130k', median: 0.75, p95: 2.0, ms: 1.7 },
  { id: 'softargmax', params: '27k', median: 0.59, p95: 1.32, ms: 0.65 },
]

// Setting the chapter opens on: blob position (cells) and softmax sharpness. Illustration, 16 cells.
export const KP_DEFAULT = { cells: 16, x0: 7.4, beta: 5 }
