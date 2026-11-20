import { useState } from 'react'
import { THRESHOLDS, iouShift, measured, passedThresholds } from './lib/iou'
import { useLang } from './i18n'

const W = 28 // px, median object side in the clutter-detect validation set

const T = {
  en: {
    eyebrow: 'Scoring a detector',
    title: 'What mAP sees that AP50 does not',
    intro:
      'A detection counts as correct when its box overlaps the true box enough (intersection over union, IoU). AP50 asks for IoU 0.5 only. AP@[.5:.95] averages ten thresholds up to 0.95, so it also scores how well the box is placed.',
    shift: 'Shift the predicted box by',
    px: 'px',
    plot: (d: number, iou: string) => `True box (outline) and predicted box shifted ${d} px, IoU ${iou}`,
    iou: 'IoU',
    passes: 'Counts as correct at these IoU thresholds',
    of: (k: number) => `${k} of 10`,
    table: 'Measured on the real evaluation code: every box shifted by d px',
    cols: ['Shift', 'IoU for a 28 px box', 'mAP@[.5:.95]', 'AP50'],
    note: 'At 4 px AP50 is still 1.0 while mAP has lost more than half. The measured mAP falls faster than the 28 px box suggests, partly because smaller objects lose more IoU for the same shift.',
    source: 'mujoco-clutter-detect README, metric checks (controlled degradation)',
  },
  ja: {
    eyebrow: '検出器の採点',
    title: 'AP50 には見えず mAP には見えるもの',
    intro:
      '検出は、予測ボックスが正解ボックスと十分に重なると (IoU、intersection over union) 正解と数えます。AP50 は IoU 0.5 だけを見ます。AP@[.5:.95] は 0.95 までの 10 個のしきい値を平均するので、ボックスの位置の良さも採点します。',
    shift: '予測ボックスをずらす量',
    px: 'px',
    plot: (d: number, iou: string) => `正解ボックス (枠線) と ${d} px ずらした予測ボックス、IoU ${iou}`,
    iou: 'IoU',
    passes: '正解と数えられる IoU しきい値',
    of: (k: number) => `10 個中 ${k} 個`,
    table: '実際の評価コードでの計測: すべてのボックスを d px ずらした場合',
    cols: ['ずれ', '28 px ボックスの IoU', 'mAP@[.5:.95]', 'AP50'],
    note: '4 px では AP50 はまだ 1.0 ですが、mAP は半分以上を失っています。計測した mAP が 28 px ボックスの計算より速く落ちる理由の一つは、小さい物体ほど同じずれで IoU を多く失うことです。',
    source: 'mujoco-clutter-detect README、メトリクスの検証 (制御した劣化)',
  },
}

export function MapChapter() {
  const t = T[useLang()]
  const [d, setD] = useState(4)
  const iou = iouShift(W, d)
  const passed = passedThresholds(iou)
  const S = 5 // svg px per image px
  const box = W * S
  return (
    <>
      <section className="intro chapter-break">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>
      <section className="panel" aria-label={t.title}>
        <div className="controls">
          <label htmlFor="map-shift">
            {t.shift} <b className="num">{d} {t.px}</b>
            <input id="map-shift" type="range" min={0} max={14} step={1} value={d} onChange={(e) => setD(Number(e.target.value))} />
          </label>
          <p className="verdict">
            {t.iou} <b className="num">{iou.toFixed(3)}</b>
          </p>
        </div>
        <svg className="map-boxes" viewBox={`0 0 ${box + 14 * S + 20} ${box + 20}`} role="img" aria-label={t.plot(d, iou.toFixed(3))}>
          <rect className="map-pred" x={10 + d * S} y={10} width={box} height={box} />
          <rect className="map-true" x={10} y={10} width={box} height={box} />
        </svg>
        <div>
          <p className="muted">
            {t.passes}: <b className="num">{t.of(passed.length)}</b>
          </p>
          <ul className="chips">
            {THRESHOLDS.map((th) => (
              <li key={th} className={passed.includes(th) ? 'chip on' : 'chip'}>
                {th.toFixed(2)}
              </li>
            ))}
          </ul>
        </div>
        <h2>{t.table}</h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {t.cols.map((c, i) => (
                  <th key={c} scope="col" className={i ? 'num' : undefined}>
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {measured.map((r) => (
                <tr key={r.d} className={r.d === d ? 'best' : undefined}>
                  <th scope="row" className="num">
                    {r.d} px
                  </th>
                  <td className="num">{iouShift(W, r.d).toFixed(3)}</td>
                  <td className="num">{r.map.toFixed(4)}</td>
                  <td className="num">{r.ap50.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">{t.note}</p>
        <p className="muted">
          <a href="https://github.com/AungKaung1928/mujoco-clutter-detect" lang="en">
            {t.source}
          </a>
        </p>
      </section>
    </>
  )
}
