import { useEffect } from 'react'
import { useLang } from '../i18n'
import { CHAPTER_IDS, neighbours } from '../lib/route'
import type { ChapterId } from '../lib/route'

const TEXT = {
  en: { label: 'Chapter navigation', back: 'Back', next: 'Next', overview: 'Overview' },
  ja: { label: '章の移動', back: '前へ', next: '次へ', overview: '一覧' },
}

const hrefOf = (id: ChapterId | null) => (id ? `#/${id}` : '#/')

// Left and right arrow keys open the previous and next chapter, unless a form control has the keys (sliders).
function useArrowKeys(open: ChapterId) {
  useEffect(() => {
    const [prev, next] = neighbours(open)
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) return
      const el = e.target as HTMLElement
      if (el.closest('input, select, textarea, [contenteditable="true"]')) return
      if (e.key === 'ArrowLeft') window.location.hash = hrefOf(prev)
      else if (e.key === 'ArrowRight') window.location.hash = hrefOf(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])
}

export function ChapterNav({ open, labels }: { open: ChapterId; labels: Record<ChapterId, string> }) {
  const t = TEXT[useLang()]
  useArrowKeys(open)
  const [prev, next] = neighbours(open)
  const name = (id: ChapterId | null) => (id ? `${CHAPTER_IDS.indexOf(id) + 1} ${labels[id]}` : t.overview)
  return (
    <nav className="ch-nav" aria-label={t.label}>
      <a id="ch-back" href={hrefOf(prev)} rel="prev">
        <span className="ch-nav-dir">← {t.back}</span>
        <span className="ch-nav-name">{name(prev)}</span>
      </a>
      <a id="ch-next" href={hrefOf(next)} rel="next">
        <span className="ch-nav-dir">{t.next} →</span>
        <span className="ch-nav-name">{name(next)}</span>
      </a>
    </nav>
  )
}
