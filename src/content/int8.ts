// Chapter: shrinking the detector. Numbers: mujoco-clutter-detect README, results table
// (hard/val, 2000 images, 8992 objects; model time, batch 1, one x86 box, idle; measured 2026-09-23).
// ms4 = null where the README has no 4-thread number.

export interface Row {
  id: string
  label: { en: string; ja: string }
  map: number
  ms1: number
  ms4: number | null
  mb: number | null
}

export const rows: Row[] = [
  { id: 'classical', label: { en: 'Classical pipeline (background subtraction + watershed)', ja: '古典的パイプライン (背景差分 + watershed)' }, map: 0.5322, ms1: 2.13, ms4: null, mb: null },
  { id: 'fp32', label: { en: 'fp32 detector, ONNX Runtime', ja: 'fp32 検出器、ONNX Runtime' }, map: 0.9107, ms1: 3.57, ms4: 1.52, mb: 1.53 },
  { id: 'int8-static', label: { en: 'INT8 static (calibrated activations)', ja: 'INT8 静的 (活性値をキャリブレーション)' }, map: 0.9097, ms1: 1.38, ms4: 0.61, mb: 0.42 },
  { id: 'int8-dynamic', label: { en: 'INT8 dynamic (weights only)', ja: 'INT8 動的 (重みのみ)' }, map: 0.9097, ms1: 1.82, ms4: 1.54, mb: 0.41 },
  { id: 'prune25', label: { en: 'Pruned 25 % of channels, fine-tuned', ja: 'チャネル 25 % を枝刈り、再学習' }, map: 0.8919, ms1: 2.84, ms4: null, mb: 1.02 },
  { id: 'prune50', label: { en: 'Pruned 50 % of channels, fine-tuned', ja: 'チャネル 50 % を枝刈り、再学習' }, map: 0.8454, ms1: 2.42, ms4: null, mb: 0.58 },
  { id: 'prune50-int8', label: { en: 'Pruned 50 % + INT8', ja: '50 % 枝刈り + INT8' }, map: 0.8411, ms1: 1.25, ms4: null, mb: 0.18 },
]

export const source = {
  label: 'mujoco-clutter-detect README, results table',
  ref: 'https://github.com/AungKaung1928/mujoco-clutter-detect',
}

export const speedup = (a: Row, b: Row) => a.ms1 / b.ms1
