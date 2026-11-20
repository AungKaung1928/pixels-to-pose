// IoU of a w x h box and the same box shifted d px along x: (w - d) / (w + d) for 0 <= d < w
// (mujoco-clutter-detect README, metric checks). COCO AP@[.5:.95] averages AP over the IoU
// thresholds 0.50, 0.55, ..., 0.95.

export function iouShift(w: number, d: number): number {
  return d >= w ? 0 : (w - d) / (w + d)
}

export const THRESHOLDS = Array.from({ length: 10 }, (_, i) => Math.round((0.5 + 0.05 * i) * 100) / 100)

/** Thresholds a match with this IoU counts as correct at (small epsilon for float ties). */
export function passedThresholds(iou: number): number[] {
  return THRESHOLDS.filter((t) => iou >= t - 1e-9)
}

/** Measured on the real detector pipeline, every box shifted by d px (README table). */
export const measured = [
  { d: 0, map: 1.0, ap50: 1.0 },
  { d: 2, map: 0.7309, ap50: 1.0 },
  { d: 4, map: 0.4639, ap50: 1.0 },
  { d: 7, map: 0.1415, ap50: 0.6873 },
  { d: 12, map: 0.0057, ap50: 0.048 },
]
