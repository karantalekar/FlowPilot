import { useAppSelector } from '@/lib/hooks'
import en from './locales/en.json'
import hi from './locales/hi.json'
import mr from './locales/mr.json'
import { Language } from './config'

type TranslationKey = string

const translations: Record<Language, any> = {
  en,
  hi,
  mr,
}

export function useTranslation() {
  const language = useAppSelector((state) => state.ui.language) as Language

  const t = (key: TranslationKey): string => {
    const keys = key.split('.')
    let value: any = translations[language] || translations['en']

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return { t, language }
}
