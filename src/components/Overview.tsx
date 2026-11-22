import { DEFAULT } from '../content/camera'
import { HEADS } from '../content/keypoints'
import { DECODE_MS } from '../content/peaks'
import { chapterKind } from '../content/pipeline'
import { methods } from '../content/detect'
import { rows, speedup } from '../content/int8'
import { realGap } from '../content/real'
import { useLang } from '../i18n'
import { Thumb } from './Thumb'
import { metresPerPixel } from '../lib/camera'
import { measured } from '../lib/iou'
import { CHAPTER_IDS } from '../lib/route'
import type { ChapterId } from '../lib/route'

// Every value is computed from the data the chapter itself shows; nothing here is typed by hand.
const row = (id: string) => rows.find((r) => r.id === id)!
const shift7 = measured.find((m) => m.d === 7)!
const classicalBest = Math.min(...methods.filter((m) => m.params === 0).map((m) => m.median))
const learned = methods.find((m) => m.id === 'softargmax')!.median

const VALUE: Record<ChapterId, string> = {
  camera: `${(metresPerPixel(DEFAULT.d, DEFAULT.fov, DEFAULT.res) * 1000).toFixed(2)} mm/px`,
  detect: `${classicalBest.toFixed(2)} → ${learned.toFixed(2)} mm`,
  keypoints: `${HEADS[0].median.toFixed(2)} → ${HEADS[1].median.toFixed(2)} mm`,
  map: `${shift7.ap50.toFixed(2)} / ${shift7.map.toFixed(2)}`,
  peaks: `${DECODE_MS} ms`,
  real: `${realGap.hard.simMap.toFixed(2)} → ${realGap.hard.realMap.toFixed(2)}`,
  int8: `${speedup(row('fp32'), row('int8-static')).toFixed(1)}×`,
}

const TEXT = {
  en: {
    intro: 'Seven steps from camera pixels to a scored pose. Each card shows one measured number; open a chapter to change the setting behind it.',
    note: {
      camera: `table width one pixel covers at ${DEFAULT.d} m, ${DEFAULT.res} px`,
      detect: 'median error: best classical → learned',
      keypoints: 'median error: flatten head → soft-argmax',
      map: `AP50 / mAP for a ${shift7.d} px box shift`,
      peaks: 'to decode peaks with a max-pool',
      real: 'mAP: renders → real photos',
      int8: 'faster with INT8, one CPU thread',
    },
  },
  ja: {
    intro: 'カメラの画素から評価済みの姿勢までの 7 ステップ。各カードは計測した数値を 1 つ示します。章を開くと、その数値の設定を変えられます。',
    note: {
      camera: `${DEFAULT.d} m、${DEFAULT.res} px で 1 画素が覆うテーブルの幅`,
      detect: '誤差の中央値: 最良の古典的手法 → 学習',
      keypoints: '誤差の中央値: flatten ヘッド → soft-argmax',
      map: `ボックスを ${shift7.d} px ずらしたときの AP50 / mAP`,
      peaks: 'max-pool でピークをデコードする時間',
      real: 'mAP: レンダリング → 実写真',
      int8: 'INT8 での高速化、CPU 1 スレッド',
    },
  },
}

export function Overview({ title, labels }: { title: string; labels: Record<ChapterId, string> }) {
  const lang = useLang()
  const t = TEXT[lang]
  return (
    <section className="overview" id="overview">
      <h1>{title}</h1>
      <p>{t.intro}</p>
      <ol className="ov-grid">
        {CHAPTER_IDS.map((id, i) => (
          <li key={id}>
            <a id={`card-${id}`} className={`ov-card k-${chapterKind(id)}`} href={`#/${id}`}>
              <Thumb id={id} />
              <span className="ov-index">{String(i + 1).padStart(2, '0')}</span>
              <span className="ov-title">{labels[id]}</span>
              <span className="ov-value num">{VALUE[id]}</span>
              <span className="ov-note">{t.note[id]}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
