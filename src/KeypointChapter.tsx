import { useState } from 'react'
import { argmax, blob, softArgmax, softmax } from './lib/softargmax'
import { HEADS } from './content/keypoints'
import { useLang } from './i18n'

const N = 16
const W = 640
const H = 160
const M = { l: 8, r: 8, t: 10, b: 24 }

const T = {
  en: {
    eyebrow: 'Keypoint heads',
    title: 'Ask for a coordinate, get a coordinate',
    intro:
      'A CNN turns an image into feature maps where one blob lights up on the object. Taking the strongest cell snaps the answer to the grid. Taking the expected position under a softmax keeps the part between two cells.',
    pos: 'True position of the blob',
    beta: 'Softmax sharpness β',
    cells: 'cells',
    plot: 'Bars: softmax weight of each of the 16 cells, the strongest cell in vermilion. Dashed line: true position. Teal line: soft-argmax.',
    arg: 'Strongest cell (argmax)',
    soft: 'Expected position (soft-argmax)',
    err: 'error',
    note: 'Push β up and the softmax puts all its weight on one cell, so soft-argmax turns back into argmax. In a network, β is learned.',
    table: 'The same idea in a trained pose network',
    cols: ['Head', 'Parameters', 'Error, median', 'Error, p95', 'Time per image'],
    heads: { flatten: 'Flatten the feature maps, then dense layers', softargmax: 'Spatial soft-argmax' },
    tableNote:
      'Same backbone and data; the soft-argmax head is 5× smaller, 2.6× faster and more accurate. Simulated overhead camera, 2000 validation images, PyTorch on CPU.',
    source1: 'mujoco-cube-pose-cnn README, finding 5',
    source2: 'Levine et al. 2016, spatial softmax (arXiv 1504.00702)',
  },
  ja: {
    eyebrow: 'キーポイントヘッド',
    title: '座標を求めるなら座標を出させる',
    intro:
      'CNN は画像を特徴マップに変え、物体の位置で 1 つの塊が明るくなります。最も強いセルを選ぶと、答えはグリッドに吸着します。softmax のもとでの期待位置を取ると、2 つのセルの間の情報が残ります。',
    pos: '塊の真の位置',
    beta: 'softmax の鋭さ β',
    cells: 'セル',
    plot: '棒: 16 セルそれぞれの softmax の重み (最も強いセルは朱色)。破線: 真の位置。青緑の線: soft-argmax。',
    arg: '最も強いセル (argmax)',
    soft: '期待位置 (soft-argmax)',
    err: '誤差',
    note: 'β を上げると softmax は 1 つのセルに全重みを置くので、soft-argmax は argmax に戻ります。ネットワークでは β も学習します。',
    table: '学習済みの姿勢推定ネットワークでの同じ考え方',
    cols: ['ヘッド', 'パラメータ数', '誤差 (中央値)', '誤差 (p95)', '画像 1 枚の時間'],
    heads: { flatten: '特徴マップを平坦化して全結合層', softargmax: '空間 soft-argmax' },
    tableNote:
      'バックボーンとデータは同じです。soft-argmax ヘッドは 5 分の 1 の大きさで 2.6 倍速く、より正確です。シミュレーションの真上カメラ、検証画像 2000 枚、CPU 上の PyTorch。',
    source1: 'mujoco-cube-pose-cnn README の知見 5',
    source2: 'Levine et al. 2016、spatial softmax (arXiv 1504.00702)',
  },
}

export function KeypointChapter() {
  const lang = useLang()
  const t = T[lang]
  const [x0, setX0] = useState(7.4)
  const [beta, setBeta] = useState(5)
  const f = blob(N, x0)
  const w = softmax(f, beta)
  const a = argmax(f)
  const s = softArgmax(f, beta)
  const cw = (W - M.l - M.r) / N
  const x = (c: number) => M.l + (c + 0.5) * cw
  const y = (v: number) => M.t + (1 - v) * (H - M.t - M.b)
  const wMax = Math.max(...w)
  return (
    <>
      <section className="intro chapter-break">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>
      <section className="panel" aria-label={t.title}>
        <div className="controls">
          <label htmlFor="kp-pos">
            {t.pos} <b className="num">{x0.toFixed(2)} {t.cells}</b>
            <input id="kp-pos" type="range" min={2} max={13} step={0.05} value={x0} onChange={(e) => setX0(Number(e.target.value))} />
          </label>
          <label htmlFor="kp-beta">
            {t.beta} <b className="num">{beta}</b>
            <input id="kp-beta" type="range" min={1} max={100} step={1} value={beta} onChange={(e) => setBeta(Number(e.target.value))} />
          </label>
        </div>
        <div className="table-scroll">
          <svg className="kp-plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t.plot}>
            {w.map((v, i) => (
              <rect key={i} className={i === a ? 'kp-cell top' : 'kp-cell'} x={x(i) - cw * 0.4} width={cw * 0.8} y={y(v / wMax)} height={y(0) - y(v / wMax)} />
            ))}
            <line className="kp-true" x1={x(x0)} x2={x(x0)} y1={M.t} y2={y(0)} />
            <line className="kp-soft" x1={x(s)} x2={x(s)} y1={M.t} y2={y(0)} />
            {[0, 5, 10, 15].map((c) => (
              <text key={c} className="kp-axis" x={x(c)} y={H - 6} textAnchor="middle">
                {c}
              </text>
            ))}
          </svg>
        </div>
        <p className="muted">{t.plot}</p>
        <dl className="readout">
          <div>
            <dt>{t.arg}</dt>
            <dd className="num">
              {a} ({t.err} {Math.abs(a - x0).toFixed(2)})
            </dd>
          </div>
          <div>
            <dt>{t.soft}</dt>
            <dd className="num">
              {s.toFixed(2)} ({t.err} {Math.abs(s - x0).toFixed(2)})
            </dd>
          </div>
        </dl>
        <p className="muted">{t.note}</p>
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
              {HEADS.map((h) => (
                <tr key={h.id}>
                  <th scope="row">{t.heads[h.id as 'flatten' | 'softargmax']}</th>
                  <td className="num">{h.params}</td>
                  <td className="num">{h.median.toFixed(2)} mm</td>
                  <td className="num">{h.p95.toFixed(2)} mm</td>
                  <td className="num">{h.ms.toFixed(2)} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="muted">{t.tableNote}</p>
        <p className="muted">
          <a href="https://github.com/AungKaung1928/mujoco-cube-pose-cnn" lang="en">
            {t.source1}
          </a>
          {' · '}
          <a href="https://arxiv.org/abs/1504.00702" lang="en">
            {t.source2}
          </a>
        </p>
      </section>
    </>
  )
}
