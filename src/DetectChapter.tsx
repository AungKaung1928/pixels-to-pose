import { useState } from 'react'
import { cheapest, methods } from './content/detect'
import type { Stat } from './content/detect'
import { useLang } from './i18n'

const T = {
  en: {
    eyebrow: 'Detection and pose',
    title: 'Classical or learned?',
    intro:
      'Find a cube on a table and report where it is. The cube changes colour, the light and the table shade change. Set the accuracy your robot needs and see which method is the cheapest one that delivers it.',
    tol: 'Allowed position error',
    stat: 'Judged on',
    median: 'median',
    p95: '95th percentile',
    pick: 'Cheapest method that passes:',
    none: 'None. No method in this table is that accurate.',
    cols: ['Method', 'Finds the cube', 'Error, median', 'Error, p95', 'Time per image', 'Passes'],
    yes: 'yes',
    no: 'no',
    note: 'The red-hue rule looks accurate on the images where it works (3.48 mm) but only finds the cube in 10.9 % of them: a wrong assumption fails silently. Half the CNN’s apparent lead over OpenCV was a calibration offset that one fitted number removes.',
    source: 'mujoco-cube-pose-cnn README, Results (hard regime, 2000 validation images, CPU)',
  },
  ja: {
    eyebrow: '検出と姿勢推定',
    title: '古典的手法か、学習か',
    intro:
      'テーブル上のキューブを見つけ、その位置を答えます。キューブの色、照明、テーブルの明るさは毎回変わります。ロボットに必要な精度を設定し、それを満たす最も安い手法を見てください。',
    tol: '許容する位置誤差',
    stat: '判定に使う値',
    median: '中央値',
    p95: '95 パーセンタイル',
    pick: '合格する最も安い手法:',
    none: 'なし。この表にそこまで正確な手法はありません。',
    cols: ['手法', 'キューブを見つける割合', '誤差 (中央値)', '誤差 (p95)', '画像 1 枚の時間', '合格'],
    yes: '合格',
    no: '不合格',
    note: '赤色相のルールは、うまくいった画像では正確に見えます (3.48 mm) が、キューブを見つけられるのは 10.9 % の画像だけです。誤った仮定は気づかれずに失敗します。OpenCV に対する CNN の見かけの優位の半分は、フィットした数値 1 つで消えるキャリブレーションのずれでした。',
    source: 'mujoco-cube-pose-cnn README の結果 (hard 条件、検証画像 2000 枚、CPU)',
  },
}

export function DetectChapter() {
  const lang = useLang()
  const t = T[lang]
  const [tol, setTol] = useState(2)
  const [stat, setStat] = useState<Stat>('median')
  const best = cheapest(tol, stat)
  return (
    <>
      <section className="intro chapter-break">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>
      <section className="panel" aria-label={t.title}>
        <div className="controls">
          <label htmlFor="det-tol">
            {t.tol} <b className="num">{tol.toFixed(2)} mm</b>
            <input id="det-tol" type="range" min={0.5} max={7} step={0.05} value={tol} onChange={(e) => setTol(Number(e.target.value))} />
          </label>
          <div className="seg" role="group" aria-label={t.stat}>
            {(['median', 'p95'] as const).map((s) => (
              <button key={s} id={`det-stat-${s}`} type="button" aria-pressed={stat === s} onClick={() => setStat(s)}>
                {t[s]}
              </button>
            ))}
          </div>
        </div>
        <p className="verdict">
          {t.pick} <b>{best ? `${best.label[lang]}, ${best.ms.toFixed(2)} ms` : t.none}</b>
        </p>
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
              {methods.map((m) => {
                const ok = m.detect === 1 && m[stat] <= tol
                return (
                  <tr key={m.id} className={best?.id === m.id ? 'best' : undefined}>
                    <th scope="row">{m.label[lang]}</th>
                    <td className="num">{(m.detect * 100).toFixed(1)} %</td>
                    <td className="num">{m.median.toFixed(2)} mm</td>
                    <td className="num">{m.p95.toFixed(2)} mm</td>
                    <td className="num">{m.ms.toFixed(2)} ms</td>
                    <td className={ok ? 'num pass' : 'num fail'}>{ok ? t.yes : t.no}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="muted">{t.note}</p>
        <p className="muted">
          <a href="https://github.com/AungKaung1928/mujoco-cube-pose-cnn" lang="en">
            {t.source}
          </a>
        </p>
      </section>
    </>
  )
}
