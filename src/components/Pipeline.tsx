import { useEffect, useRef, useState } from 'react'
import { CHAPTER_NODE, EDGES, KIND_LABEL, NODES, NODE_KINDS } from '../content/pipeline'
import { useLang } from '../i18n'
import { CHAPTER_IDS } from '../lib/route'
import type { ChapterId } from '../lib/route'

const W = 98 // node box
const H = 44
const DX = 112 // pitch
const PAD = 8
const VW = PAD * 2 + (NODES.length - 1) * DX + W
const VH = PAD * 2 + H

const TEXT = {
  en: { fig: 'Where this chapter sits in the pipeline', pos: (i: number, n: number) => `Chapter ${i} of ${n}`, play: 'Play', pause: 'Pause', back: 'Previous chapter', next: 'Next chapter', legend: 'Colour key', go: 'Open the chapter on' },
  ja: { fig: 'この章がパイプラインのどこにあたるか', pos: (i: number, n: number) => `${n} 章中 ${i} 章`, play: '再生', pause: '一時停止', back: '前の章', next: '次の章', legend: '色の意味', go: '章を開く:' },
}

interface Props {
  open: ChapterId
  title: string // the open chapter's name, as in the contents list
}

export function Pipeline({ open, title }: Props) {
  const lang = useLang()
  const T = TEXT[lang]
  const [playing, setPlaying] = useState(false)
  const n = CHAPTER_IDS.length
  const at = CHAPTER_IDS.indexOf(open)
  const href = (i: number) => `#/${CHAPTER_IDS[(i + n) % n]}`
  const active = CHAPTER_NODE[open].node
  const x = (i: number) => PAD + i * DX
  const strip = useRef<HTMLDivElement>(null)

  // On a narrow screen the strip scrolls sideways: bring the lit node to the middle.
  useEffect(() => {
    const el = strip.current
    if (el) el.scrollLeft = x(NODES.findIndex((nd) => nd.id === active)) + W / 2 - el.clientWidth / 2
  }, [active])

  // Play opens the next chapter every 2.4 s and stops on the last one (Play there restarts from chapter 1).
  useEffect(() => {
    if (!playing) return
    const t = window.setTimeout(() => {
      if (at >= n - 1) setPlaying(false)
      else window.location.hash = href(at + 1)
    }, 2400)
    return () => window.clearTimeout(t)
  })

  return (
    <figure className="pipe" aria-label={T.fig}>
      <div className="pipe-scroll" ref={strip}>
        <svg viewBox={`0 0 ${VW} ${VH}`} width={VW} height={VH} role="group" aria-label={T.fig}>
          {EDGES.map(([a, b], i) => (
            <line
              key={`${a}-${b}`}
              x1={x(i) + W}
              y1={PAD + H / 2}
              x2={x(i + 1) - 3}
              y2={PAD + H / 2}
              className={b === active ? 'pipe-edge into' : 'pipe-edge'}
            />
          ))}
          {NODES.map((node, i) => {
            const on = node.id === active
            const ch = CHAPTER_IDS.find((c) => CHAPTER_NODE[c].node === node.id)
            const shape = (
              <>
                <rect x={x(i)} y={PAD} width={W} height={H} rx={4} />
                <text x={x(i) + W / 2} y={PAD + H / 2} dominantBaseline="central" textAnchor="middle">
                  {node[lang]}
                </text>
              </>
            )
            const cls = `pipe-node k-${node.kind}${on ? ' on' : ''}`
            return ch ? (
              <a key={node.id} id={`node-${node.id}`} href={`#/${ch}`} className={cls} aria-label={`${T.go} ${node[lang]}`} aria-current={on ? 'step' : undefined}>
                {shape}
              </a>
            ) : (
              <g key={node.id} id={`node-${node.id}`} className={cls}>
                {shape}
              </g>
            )
          })}
        </svg>
      </div>
      <figcaption className="pipe-caption" aria-live="polite">
        <span className="eyebrow">{T.pos(at + 1, n)}</span>
        <strong>{title}</strong>
        <span>{CHAPTER_NODE[open][lang]}</span>
      </figcaption>
      <div className="pipe-bar">
        <a id="pipe-back" className="pipe-btn" href={href(at - 1)} aria-label={T.back}>
          ←
        </a>
        <button
          id="pipe-play"
          type="button"
          className="pipe-btn primary"
          aria-pressed={playing}
          onClick={() => {
            if (!playing && at >= n - 1) window.location.hash = href(0)
            setPlaying(!playing)
          }}
        >
          {playing ? T.pause : T.play}
        </button>
        <a id="pipe-next" className="pipe-btn" href={href(at + 1)} aria-label={T.next}>
          →
        </a>
        <ul className="pipe-legend" aria-label={T.legend}>
          {NODE_KINDS.map((k) => (
            <li key={k} className={`k-${k}`}>
              {KIND_LABEL[k][lang]}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}
