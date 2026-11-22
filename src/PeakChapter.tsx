import { useState } from 'react'
import { heatmap, peaks } from './lib/maxpool'
import { DECODE_MS, PEAK_GRID } from './content/peaks'
import { useLang } from './i18n'

const { n: N, sigma: SIGMA, thr: THR } = PEAK_GRID
const C = 24 // svg px per cell

const T = {
  en: {
    eyebrow: 'From heatmap to boxes',
    title: 'Max-pool is the NMS',
    intro:
      'A centre-heatmap detector predicts one score per cell. A cell becomes a detection when it is the largest value in its 3 x 3 neighbourhood and clears a score threshold. That one max-pool replaces the box-overlap suppression (NMS) other detectors need.',
    sep: 'Distance between the two object centres',
    cells: 'cells',
    found: 'Detections',
    of2: 'for 2 objects',
    plot: (s: string, k: number) => `Heatmap of two objects ${s} cells apart; ${k} peak(s) survive the 3 x 3 max-pool`,
    legend: 'Shade: score. Cross: true centre. Ring: a cell the max-pool keeps.',
    when: 'It fails when the centres are close enough that one bump outranks the cell under the other centre. With this blob width that happens below about 1.5 cells (exactly 1.0 is a tie, and ties keep both cells): two objects, one detection. The tie rule cuts the other way too: a centre exactly halfway between two cells (try 2.5) scores both equally, both are kept, and one object gives two detections.',
    real:
      `mujoco-clutter-detect places objects at least 0.075 m apart; its README states that this keeps every centre in its own cell, so peak picking there is exact and the pipeline has no box-overlap suppression at all. Decoding (max-pool, top-k, gather) takes ${DECODE_MS} ms.`,
    illus: `Grid size, blob width and the 0.3 threshold here are an illustration; the 0.075 m spacing and ${DECODE_MS} ms are from the repository.`,
    source: 'mujoco-clutter-detect README (detector design, latency); CenterNet, arXiv 1904.07850',
  },
  ja: {
    eyebrow: 'ヒートマップからボックスへ',
    title: 'Max-pool が NMS になる',
    intro:
      '中心ヒートマップ型の検出器は、セルごとに 1 つのスコアを出します。3 x 3 の近傍で最大かつスコアしきい値を超えるセルが検出になります。この 1 回の max-pool が、他の検出器が必要とするボックス重なりの抑制 (NMS) の代わりになります。',
    sep: '2 つの物体中心の距離',
    cells: 'セル',
    found: '検出数',
    of2: '(物体 2 個に対して)',
    plot: (s: string, k: number) => `${s} セル離れた 2 物体のヒートマップ。3 x 3 max-pool で残るピークは ${k} 個`,
    legend: '濃さ: スコア。バツ印: 真の中心。輪: max-pool で残るセル。',
    when: '中心同士が近く、一方の山がもう一方の中心のセルの値を上回ると失敗します。この山の幅では約 1.5 セル未満で起こります (ちょうど 1.0 は同値で、同値のセルは両方残ります)。物体 2 個に検出 1 個です。同値の規則は逆にも働きます。中心がちょうど 2 つのセルの中間にあると (2.5 を試してください) 両方のスコアが等しくなり、両方残って、1 個の物体が 2 個の検出になります。',
    real:
      `mujoco-clutter-detect では物体同士を 0.075 m 以上離して配置します。README によると、これで各中心が別のセルに入るため、ピーク抽出は厳密で、パイプラインにボックス重なりの抑制はまったくありません。デコード (max-pool、top-k、gather) は ${DECODE_MS} ms です。`,
    illus: `ここでのグリッドの大きさ、山の幅、しきい値 0.3 は説明用です。0.075 m の間隔と ${DECODE_MS} ms はリポジトリの値です。`,
    source: 'mujoco-clutter-detect README (検出器の設計、レイテンシ)、CenterNet arXiv 1904.07850',
  },
}

export function PeakChapter() {
  const t = T[useLang()]
  const [s, setS] = useState(PEAK_GRID.sep)
  const a = PEAK_GRID.first
  const b: [number, number] = [a[0] + s, a[1]]
  const h = heatmap(N, [a, b], SIGMA)
  const kept = peaks(h, THR)
  const cross = ([cx, cy]: [number, number], k: string) => {
    const X = (cx + 0.5) * C
    const Y = (cy + 0.5) * C
    return <path key={k} className="peak-centre" d={`M${X - 5} ${Y - 5}L${X + 5} ${Y + 5}M${X + 5} ${Y - 5}L${X - 5} ${Y + 5}`} />
  }
  return (
    <>
      <section className="intro">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>
      <section className="panel" aria-label={t.title}>
        <div className="controls">
          <label htmlFor="peak-sep">
            {t.sep} <b className="num">{s.toFixed(1)} {t.cells}</b>
            <input id="peak-sep" type="range" min={0} max={4} step={0.1} value={s} onChange={(e) => setS(Number(e.target.value))} />
          </label>
          <p className="verdict">
            {t.found} <b className="num">{kept.length}</b> {t.of2}
          </p>
        </div>
        <svg className="peak-grid" viewBox={`0 0 ${N * C} ${N * C}`} role="img" aria-label={t.plot(s.toFixed(1), kept.length)}>
          {h.map((row, y) =>
            row.map((v, x) => (
              <rect key={`${x}-${y}`} className="peak-cell" x={x * C} y={y * C} width={C} height={C} style={{ fillOpacity: v }} />
            )),
          )}
          {kept.map(([x, y]) => (
            <circle key={`k${x}-${y}`} className="peak-kept" cx={(x + 0.5) * C} cy={(y + 0.5) * C} r={C * 0.42} />
          ))}
          {cross(a, 'a')}
          {cross(b, 'b')}
        </svg>
        <p className="muted">{t.legend}</p>
        <p>{t.when}</p>
        <p>{t.real}</p>
        <p className="muted">{t.illus}</p>
        <p className="muted">
          <a href="https://github.com/AungKaung1928/mujoco-clutter-detect" lang="en">
            {t.source}
          </a>
        </p>
      </section>
    </>
  )
}
