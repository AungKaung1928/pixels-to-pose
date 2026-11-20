// AP per IoU threshold (0.50 ... 0.95), mean over classes, from mujoco-clutter-detect
// runs/ap_by_iou.json (commit ef6e55c): the two scratch detectors scored on hard/val renders
// (2,000 images) and on 50 real HOPE photos (eval_real_hope.py, README Step 7).
export type Curve = { sim: number[]; real: number[]; simMap: number; realMap: number }

export const realGap: Record<'easy' | 'hard', Curve> = {
  easy: {
    simMap: 0.1798,
    realMap: 0.0002,
    sim: [0.3451, 0.326, 0.2976, 0.263, 0.2198, 0.1658, 0.1115, 0.0527, 0.0151, 0.0017],
    real: [0.0018, 0.0001, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  hard: {
    simMap: 0.9107,
    realMap: 0.0063,
    sim: [0.9899, 0.9899, 0.9899, 0.9899, 0.9898, 0.9896, 0.9854, 0.9759, 0.9054, 0.3017],
    real: [0.0218, 0.0164, 0.0119, 0.0075, 0.0027, 0.0012, 0.0008, 0.0004, 0, 0],
  },
}
