import { useState } from 'react'
import { averagedFloor, metresPerPixel, silhouettePixels } from './lib/camera'
import { Marks } from './components/Marks'
import { Steps } from './components/Steps'
import { DEFAULT } from './content/camera'
import { useLang } from './i18n'

const CUBE = 0.06 // m, cube side in the mujoco-cube-pose-cnn scene
const RESOLUTIONS = [64, 128, 192, 256]
const RESULTS = [
  { id: 'calibrated', mm: 1.91 },
  { id: 'cnn', mm: 0.59 },
]

const T = {
  en: {
    eyebrow: 'Camera model',
    title: 'How big is one pixel?',
    intro:
      'A camera looking straight down turns table millimetres into pixels at one fixed rate. That rate looks like an accuracy floor. It is not: an object covers many pixels, and a method that uses all of them can land well below one pixel.',
    dist: 'Lens to object',
    fov: 'Vertical field of view',
    res: 'Image size',
    pixel: 'One pixel covers',
    count: 'The cube (6 cm) covers',
    floor: 'Averaged quantisation floor',
    px: 'pixels',
    results: (calib: string, cnn: string) =>
      `Measured at the default setting: OpenCV with one calibrated scalar ${calib}, a 27k-parameter CNN ${cnn} median position error.`,
    belowPixel: 'Both are below one pixel.',
    reset: 'Back to the measured setting',
    steps: [
      'Distance and lens fix how much table one pixel covers.',
      'The 6 cm cube covers many pixels at once.',
      'Averaging over all of them divides the error by √(pixels covered).',
      'Both measured methods land below one pixel.',
    ],
    note: 'Floor = pixel size / √(pixels covered). It bounds quantisation only; lighting, blur and the method add their own error.',
    source: 'mujoco-cube-pose-cnn README (task definition and results) and scene.xml camera `top`',
  },
  ja: {
    eyebrow: 'カメラモデル',
    title: '1 ピクセルはどれくらいの大きさか',
    intro:
      '真上から見下ろすカメラは、テーブル上のミリメートルを一定の割合でピクセルに変えます。この割合は精度の下限に見えますが、そうではありません。物体は多くのピクセルを覆うので、それらをすべて使う手法は 1 ピクセルよりずっと小さい誤差に届きます。',
    dist: 'レンズから物体まで',
    fov: '垂直画角',
    res: '画像サイズ',
    pixel: '1 ピクセルが覆う長さ',
    count: 'キューブ (6 cm) が覆うピクセル',
    floor: '平均化した量子化の下限',
    px: 'ピクセル',
    results: (calib: string, cnn: string) =>
      `既定の設定での計測値: キャリブレーションしたスカラー 1 つを加えた OpenCV で ${calib}、27k パラメータの CNN で ${cnn} (位置誤差の中央値)。`,
    belowPixel: 'どちらも 1 ピクセル未満です。',
    reset: '計測した設定に戻す',
    steps: [
      '距離とレンズで、1 ピクセルが覆うテーブルの長さが決まります。',
      '6 cm のキューブは一度に多くのピクセルを覆います。',
      'そのすべてで平均すると、誤差は √(覆うピクセル数) で割られます。',
      '計測した 2 つの手法はどちらも 1 ピクセルより小さい誤差です。',
    ],
    note: '下限 = ピクセルの大きさ / √(覆うピクセル数)。量子化だけの下限で、照明、ぼけ、手法そのものの誤差は別に加わります。',
    source: 'mujoco-cube-pose-cnn README (タスク定義と結果)、scene.xml のカメラ `top`',
  },
}

export function CameraChapter() {
  const t = T[useLang()]
  const [d, setD] = useState(DEFAULT.d)
  const [fov, setFov] = useState(DEFAULT.fov)
  const [res, setRes] = useState(DEFAULT.res)
  const [step, setStep] = useState(0)
  const lit = (i: number) => step === i || undefined
  const m = metresPerPixel(d, fov, res)
  const n = silhouettePixels(CUBE, m)
  const floor = averagedFloor(m, n)
  const mm = (v: number) => `${(v * 1000).toFixed(2)} mm`
  const isDefault = d === DEFAULT.d && fov === DEFAULT.fov && res === DEFAULT.res
  return (
    <>
      <section className="intro">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1>{t.title}</h1>
        <p>{t.intro}</p>
      </section>
      <section className="panel" aria-label={t.title}>
        <Steps texts={t.steps} i={step} setI={setStep} />
        <div className="controls">
          <label htmlFor="cam-d">
            {t.dist} <b className="num">{d.toFixed(2)} m</b>
            <input id="cam-d" type="range" min={0.2} max={1} step={0.01} value={d} onChange={(e) => setD(Number(e.target.value))} />
            <Marks min={0.2} max={1} values={[DEFAULT.d]} />
          </label>
          <label htmlFor="cam-fov">
            {t.fov} <b className="num">{fov}°</b>
            <input id="cam-fov" type="range" min={20} max={90} step={1} value={fov} onChange={(e) => setFov(Number(e.target.value))} />
            <Marks min={20} max={90} values={[DEFAULT.fov]} />
          </label>
          <div className="seg" role="group" aria-label={t.res}>
            {RESOLUTIONS.map((r) => (
              <button key={r} id={`cam-res-${r}`} type="button" aria-pressed={res === r} onClick={() => setRes(r)}>
                {r} px
              </button>
            ))}
          </div>
        </div>
        <dl className="readout">
          <div data-lit={lit(0)}>
            <dt>{t.pixel}</dt>
            <dd className="num">{mm(m)}</dd>
          </div>
          <div data-lit={lit(1)}>
            <dt>{t.count}</dt>
            <dd className="num">
              {Math.round(n)} {t.px}
            </dd>
          </div>
          <div data-lit={lit(2)}>
            <dt>{t.floor}</dt>
            <dd className="num">{mm(floor)}</dd>
          </div>
        </dl>
        <p data-lit={lit(3)}>
          {t.results(`${RESULTS[0].mm} mm`, `${RESULTS[1].mm} mm`)}{' '}
          {isDefault ? (
            t.belowPixel
          ) : (
            <button
              id="cam-reset"
              type="button"
              className="link"
              onClick={() => {
                setD(DEFAULT.d)
                setFov(DEFAULT.fov)
                setRes(DEFAULT.res)
              }}
            >
              {t.reset}
            </button>
          )}
        </p>
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
