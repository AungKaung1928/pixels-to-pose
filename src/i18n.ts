import { createContext, useContext } from 'react'

export type Lang = 'en' | 'ja'

const KEY = 'ptp-lang'

export const LangContext = createContext<Lang>('en')

export function useLang(): Lang {
  return useContext(LangContext)
}

// Saved choice first, then the browser language. Storage can throw in private windows.
export function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'en' || saved === 'ja') return saved
  } catch {
    // no storage: fall through
  }
  return typeof navigator !== 'undefined' && navigator.language.startsWith('ja') ? 'ja' : 'en'
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    // no storage: the choice lasts until reload
  }
}
