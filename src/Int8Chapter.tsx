import { useState } from 'react'
import { rows, source } from './content/int8'
import { useLang } from './i18n'

const T = {
  en: {
    eyebrow: 'Edge deployment',
    title: 'Shrink the detector',
    intro:
      'A learned detector finds objects in clutter far better than a hand-written pipeline, but on one CPU thread it is slower. Quantising it to 8-bit integers wins the time back. Pruning channels is the other lever, and it costs more accuracy.',
    threads: 'CPU threads',
    one: '1 thread',
    four: '4 threads',
    chart: 'Model time per image, milliseconds',
    classical: 'Dashed line: classical pipeline, 2.13 ms. Teal bars are faster than it.',
    noValue: 'not measured',
    table: 'All variants',
    cols: ['Variant', 'mAP@[.5:.95]', 'ms, 1 thread', 'ms, 4 threads', 'MB'],
    caveat:
      'Simulated cluttered table, 2000 validation images, 8992 objects. Model time only, batch 1, one idle x86 CPU; decoding adds 0.18 ms. Not measured on a Jetson or any accelerator. The classical time comes from another session: timed together in one process, classical took 1.80 ms, INT8 1.56 ms as a model and 1.94 ms end to end, so INT8 wins as a model but not end to end.',
  },
  ja: {
    eyebrow: 'エッジへの展開',
    title: '検出器を小さくする',
    intro:
      '学習した検出器は、手書きのパイプラインよりはるかによく散らかった物体を見つけますが、CPU 1 スレッドでは遅くなります。8 ビット整数への量子化でその時間を取り戻せます。もう 1 つの手段であるチャネルの枝刈りは、より多くの精度を失います。',
    threads: 'CPU スレッド数',
    one: '1 スレッド',
    four: '4 スレッド',
    chart: '画像 1 枚あたりのモデル時間 (ミリ秒)',
    classical: '破線: 古典的パイプライン 2.13 ms。青緑の棒はそれより速い構成です。',
    noValue: '未計測',
    table: 'すべての構成',
    cols: ['構成', 'mAP@[.5:.95]', 'ms (1 スレッド)', 'ms (4 スレッド)', 'MB'],
    caveat:
      'シミュレーションの散らかったテーブル、検証画像 2000 枚、物体 8992 個。モデル時間のみ、バッチ 1、アイドル状態の x86 CPU 1 台。デコードに 0.18 ms 加わります。Jetson やアクセラレータでは計測していません。古典的手法の時間は別のセッションで計測したものです。1 つのプロセスで同時に計測すると、古典的手法 1.80 ms、INT8 はモデルのみで 1.56 ms、end-to-end で 1.94 ms でした。INT8 はモデル単体では速いものの、end-to-end では古典的手法より遅くなります。',
  },
}

const MAX_MS = 4
const CLASSICAL_MS = rows.find((r) => r.id === 'classical')!.ms1

export function Int8Chapter() {
  const lang = useLang()
  const t = T[lang]
  const [four, setFour] = useState(false)
  const learned = rows.filter((r) => r.id !== 'classical')
  const pct = (ms: number) => `${(ms / MAX_MS) * 100}%`
  return (
    <>
    <section className="intro chapter-break">
      <p className="eyebrow">{t.eyebrow}</p>
      <h1>{t.title}</h1>
      <p>{t.intro}</p>
    </section>

    <section className="panel" aria-labelledby="chart-h">
      <h2 id="chart-h">{t.chart}</h2>
      <div className="seg" role="group" aria-label={t.threads}>
        <button id="threads-1" type="button" aria-pressed={!four} onClick={() => setFour(false)}>
          {t.one}
        </button>
        <button id="threads-4" type="button" aria-pressed={four} onClick={() => setFour(true)}>
          {t.four}
        </button>
      </div>
      <ul className="bars">
        {learned.map((r) => {
          const ms = four ? r.ms4 : r.ms1
          return (
            <li key={r.id}>
              <span className="bar-label">{r.label[lang]}</span>
              <span className="bar-track">
                {!four && <span className="bar-ref" style={{ left: pct(CLASSICAL_MS) }} />}
                {ms !== null && <span className={ms < CLASSICAL_MS ? 'bar win' : 'bar'} style={{ width: pct(ms) }} />}
              </span>
              <span className="bar-value num">{ms === null ? t.noValue : `${ms.toFixed(2)} ms`}</span>
            </li>
          )
        })}
      </ul>
      {!four && <p className="muted">{t.classical}</p>}
    </section>

    <section className="panel" aria-labelledby="table-h">
      <h2 id="table-h">{t.table}</h2>
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
            {rows.map((r) => (
              <tr key={r.id}>
                <th scope="row">{r.label[lang]}</th>
                <td className="num">{r.map.toFixed(4)}</td>
                <td className="num">{r.ms1.toFixed(2)}</td>
                <td className="num">{r.ms4 === null ? '—' : r.ms4.toFixed(2)}</td>
                <td className="num">{r.mb === null ? '—' : r.mb.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="muted">{t.caveat}</p>
      <p className="muted">
        <a href={source.ref} lang="en">
          {source.label}
        </a>
      </p>
    </section>
    </>
  )
}
