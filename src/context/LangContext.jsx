import { createContext, useContext, useState } from 'react'
import translations from '../i18n/translations.js'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('ehs-lang') || 'en')

  const t = (key) => translations[lang]?.[key] ?? translations['en']?.[key] ?? key

  const toggle = () => {
    setLang((l) => {
      const next = l === 'en' ? 'th' : 'en'
      localStorage.setItem('ehs-lang', next)
      return next
    })
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t, toggle }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
