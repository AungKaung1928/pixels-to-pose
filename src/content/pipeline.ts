import type { ChapterId } from '../lib/route'

// One pipeline, drawn at the top of every chapter with the same node positions; the open chapter lights its node.
export const NODE_KINDS = ['optics', 'pixels', 'learned', 'decode', 'output', 'eval'] as const
export type NodeKind = (typeof NODE_KINDS)[number]

export const KIND_LABEL: Record<NodeKind, { en: string; ja: string }> = {
  optics: { en: 'optics', ja: '光学' },
  pixels: { en: 'pixels', ja: '画素' },
  learned: { en: 'learned', ja: '学習' },
  decode: { en: 'decoding', ja: 'デコード' },
  output: { en: 'output', ja: '出力' },
  eval: { en: 'evaluation', ja: '評価' },
}

export const NODES = [
  { id: 'camera', kind: 'optics', en: 'Camera', ja: 'カメラ' },
  { id: 'image', kind: 'pixels', en: 'Image', ja: '画像' },
  { id: 'net', kind: 'learned', en: 'Detector', ja: '検出器' },
  { id: 'heatmap', kind: 'learned', en: 'Heatmap', ja: 'ヒートマップ' },
  { id: 'peaks', kind: 'decode', en: 'Peak pick', ja: 'ピーク抽出' },
  { id: 'pose', kind: 'output', en: 'Coordinates', ja: '座標' },
  { id: 'map', kind: 'eval', en: 'mAP', ja: 'mAP' },
] as const satisfies readonly { id: string; kind: NodeKind; en: string; ja: string }[]
export type NodeId = (typeof NODES)[number]['id']

// Data flows left to right through the nodes in this order.
export const EDGES: readonly [NodeId, NodeId][] = NODES.slice(1).map((n, i) => [NODES[i].id, n.id])

// Which part of the pipeline each chapter is about, and one line saying what that part does there.
export const CHAPTER_NODE: Record<ChapterId, { node: NodeId; en: string; ja: string }> = {
  camera: { node: 'camera', en: 'The lens and sensor fix how much of the table one pixel covers.', ja: 'レンズとセンサーが、1 画素がテーブルのどれだけを覆うかを決めます。' },
  detect: { node: 'net', en: 'A hand-written pipeline or a trained network finds the objects.', ja: '手書きのパイプラインか学習済みネットワークが物体を見つけます。' },
  keypoints: { node: 'pose', en: 'The heatmap becomes a coordinate: argmax or soft-argmax.', ja: 'ヒートマップを座標に変えます: argmax か soft-argmax。' },
  map: { node: 'map', en: 'mAP scores the boxes against ground truth at several IoU thresholds.', ja: 'mAP は複数の IoU しきい値で予測ボックスを正解と比べます。' },
  peaks: { node: 'peaks', en: 'A 3 x 3 max-pool keeps one peak per object.', ja: '3 x 3 の max-pool が物体ごとに 1 つのピークを残します。' },
  real: { node: 'image', en: 'The input changes from renders to real photos; the detector stays the same.', ja: '入力がレンダリングから実写真に変わり、検出器は同じままです。' },
  int8: { node: 'net', en: 'The same detector, quantised to 8-bit integers or pruned.', ja: '同じ検出器を 8 ビット整数に量子化、または枝刈りします。' },
}
