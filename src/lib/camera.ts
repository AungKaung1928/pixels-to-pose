// Pinhole camera looking straight down at a table (mujoco-cube-pose-cnn scene.xml: camera `top`,
// fovy 45 deg, 0.45 m above the table, cube top 0.42 m from the lens, 128 x 128 image).

/** Metres of table covered by one pixel at distance d (m), vertical field of view fovyDeg, image height px. */
export function metresPerPixel(d: number, fovyDeg: number, px: number): number {
  return (2 * d * Math.tan((fovyDeg * Math.PI) / 360)) / px
}

/** Pixels an object of side `side` (m) covers when seen face-on. */
export function silhouettePixels(side: number, mPerPx: number): number {
  return (side / mPerPx) ** 2
}

/** Quantisation floor of a position averaged over n pixels: one pixel / sqrt(n) (README of mujoco-cube-pose-cnn). */
export function averagedFloor(mPerPx: number, n: number): number {
  return mPerPx / Math.sqrt(n)
}
