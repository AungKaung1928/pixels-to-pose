import { useEffect, useState } from 'react'
import { CameraChapter } from './CameraChapter'
import { DetectChapter } from './DetectChapter'
import { Int8Chapter } from './Int8Chapter'
import { KeypointChapter } from './KeypointChapter'
import { MapChapter } from './MapChapter'
import { PeakChapter } from './PeakChapter'
import { RealChapter } from './RealChapter'
import { Pipeline } from './components/Pipeline'
import { LangContext, initialLang, saveLang } from './i18n'
import type { Lang } from './i18n'
import { CHAPTER_IDS, parseRoute } from './lib/route'
import type { ChapterId } from './lib/route'

const T = {
  en: {
    lang: 'Language',
    contents: 'Chapters',
    toc: {
      camera: 'How big is one pixel?',
      detect: 'Classical or learned?',
      keypoints: 'Ask for a coordinate',
      map: 'What mAP sees',
      peaks: 'Max-pool is the NMS',
      real: 'Same detector, real photos',
      int8: 'Shrink the detector',
    },
  },
  ja: {
    lang: '表示言語',
    contents: '章',
    toc: {
      camera: '1 ピクセルの大きさ',
      detect: '古典的手法か、学習か',
      keypoints: '座標を出させる',
      map: 'mAP に見えるもの',
      peaks: 'Max-pool が NMS になる',
      real: '同じ検出器で実写真',
      int8: '検出器を小さくする',
    },
  },
}


const CHAPTERS: Record<ChapterId, () => React.JSX.Element> = {
  camera: CameraChapter,
  detect: DetectChapter,
  keypoints: KeypointChapter,
  map: MapChapter,
  peaks: PeakChapter,
  real: RealChapter,
  int8: Int8Chapter,
}

export default function App() {
  const [open, setOpen] = useState<ChapterId | null>(() => parseRoute(location.hash))
  useEffect(() => {
    const onHash = () => {
      setOpen(parseRoute(location.hash))
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  const Open = open ? CHAPTERS[open] : null
  const [lang, setLang] = useState<Lang>(initialLang)
  const t = T[lang]
  const pick = (l: Lang) => {
    setLang(l)
    saveLang(l)
    document.documentElement.lang = l
  }
  return (
    <LangContext.Provider value={lang}>
      <div className="page">
        <header className="top">
          <p className="brand">Pixels to Pose</p>
          <div className="lang" role="group" aria-label={t.lang}>
            {(['en', 'ja'] as const).map((l) => (
              <button key={l} id={`lang-${l}`} type="button" aria-pressed={lang === l} onClick={() => pick(l)}>
                {l === 'en' ? 'EN' : '日本語'}
              </button>
            ))}
          </div>
        </header>
        <nav aria-label={t.contents}>
          <ol className="toc">
            {CHAPTER_IDS.map((id) => (
              <li key={id}>
                <a href={`#/${id}`} aria-current={id === open ? 'page' : undefined}>
                  {t.toc[id]}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <main>
          {open && Open ? (
            <>
              <Pipeline open={open} title={t.toc[open]} />
              <div className="chapter" id={open}>
                <Open />
              </div>
            </>
          ) : (
            <section className="intro" id="overview">
              <h1>{t.contents}</h1>
            </section>
          )}
        </main>
      </div>
    </LangContext.Provider>
  )
}
