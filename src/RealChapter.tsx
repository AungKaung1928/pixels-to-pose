import { useState } from 'react'
import { realGap } from './content/real'
import { THRESHOLDS } from './lib/iou'
import { useLang } from './i18n'

const T = {
  en: {
    eyebrow: 'Sim to real',
    title: 'Same detector, real photos',
    intro:
      'The clutter detector was trained only on renders. Here it meets 50 labelled photos of toy groceries (HOPE): cans count as cylinders, cardboard packs as boxes. The photos are cropped to the sim camera’s view, so objects come out at the sim’s own size, 28 px.',
    thr: 'IoU threshold',
    chart: (t: string) => `Average precision at IoU ${t}, renders against photos`,
    rows: {
      easy: 'Trained on one fixed look',
      hard: 'Trained with randomised colour, table and light',
    },
    sim: 'renders',
    real: 'photos',
    map: 'mAP@[.5:.95]',
    note: 'Randomisation is what makes the sim model robust inside the sim (0.18 → 0.91 on randomised renders). On photos both models are near zero at every threshold, and the randomised model finds only 9 % of objects at IoU 0.5 even when the class is ignored. Textured objects, a frozen pretrained backbone and distractors are coded as next tests; none is measured yet.',
    source: 'mujoco-clutter-detect README Step 7 and runs/ap_by_iou.json',
  },
  ja: {
    eyebrow: 'シミュレーションから実世界へ',
    title: '同じ検出器で実写真を見る',
    intro:
      'このクラッター検出器はレンダリング画像だけで学習しました。ここではおもちゃの食料品を写した 50 枚のラベル付き写真 (HOPE) で評価します。缶は円柱、紙箱は箱として数えます。写真はシミュレーションのカメラと同じ画角に切り出すので、物体の大きさはシミュレーションと同じ 28 px になります。',
    thr: 'IoU しきい値',
    chart: (t: string) => `IoU ${t} での平均適合率 (レンダリング画像と写真の比較)`,
    rows: {
      easy: '見た目を 1 つに固定して学習',
      hard: '色・テーブル・照明をランダム化して学習',
    },
    sim: 'レンダリング',
    real: '写真',
    map: 'mAP@[.5:.95]',
    note: 'ランダム化はシミュレーションの中では効きます (ランダム化したレンダリングで 0.18 → 0.91)。写真ではどちらのモデルもすべてのしきい値でほぼ 0 で、ランダム化したモデルでもクラスを無視した IoU 0.5 の再現率は 9 % です。テクスチャ付きの物体、事前学習済みバックボーンの固定、ディストラクタは次の検証として実装済みですが、まだ計測していません。',
    source: 'mujoco-clutter-detect README Step 7 と runs/ap_by_iou.json',
  },
}

export function RealChapter() {
  const t = T[useLang()]
  const [i, setI] = useState(0)
  const thr = THRESHOLDS[i].toFixed(2)
  return (
    <>
      <section className="intro chapter-break">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>
      <section className="panel" aria-labelledby="real-h">
        <div className="controls">
          <label htmlFor="real-thr">
            {t.thr} <b className="num">{thr}</b>
            <input id="real-thr" type="range" min={0} max={9} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} />
          </label>
        </div>
        <h2 id="real-h">{t.chart(thr)}</h2>
        {(['easy', 'hard'] as const).map((m) => (
          <div key={m} className="real-model">
            <h3>{t.rows[m]}</h3>
            <ul className="bars">
              {(['sim', 'real'] as const).map((k) => {
                const v = realGap[m][k][i]
                return (
                  <li key={k}>
                    <span className="bar-label">{t[k]}</span>
                    <span className="bar-track">
                      <span className={k === 'sim' ? 'bar win' : 'bar'} style={{ width: `${v * 100}%` }} />
                    </span>
                    <span className="bar-value num">{v.toFixed(4)}</span>
                  </li>
                )
              })}
            </ul>
            <p className="muted">
              {t.map}: {t.sim} <b className="num">{realGap[m].simMap.toFixed(4)}</b>, {t.real}{' '}
              <b className="num">{realGap[m].realMap.toFixed(4)}</b>
            </p>
          </div>
        ))}
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
