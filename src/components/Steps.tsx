import { useLang } from '../i18n'

const T = {
  en: { step: 'Step', back: 'Previous step', next: 'Next step' },
  ja: { step: 'ステップ', back: '前のステップ', next: '次のステップ' },
}

// Walks the reader through a chapter's parts in order; the chapter marks the part for step i with data-lit.
export function Steps({ texts, i, setI }: { texts: readonly string[]; i: number; setI: (i: number) => void }) {
  const t = T[useLang()]
  return (
    <div className="steps" role="group" aria-label={t.step}>
      <button id="step-back" type="button" aria-label={t.back} disabled={i === 0} onClick={() => setI(i - 1)}>
        ←
      </button>
      <p className="steps-text" aria-live="polite">
        <span className="steps-count">
          {t.step} {i + 1} / {texts.length}
        </span>{' '}
        {texts[i]}
      </p>
      <button id="step-next" type="button" aria-label={t.next} disabled={i === texts.length - 1} onClick={() => setI(i + 1)}>
        →
      </button>
    </div>
  )
}
