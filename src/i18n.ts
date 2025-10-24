import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import ptTranslations from './locales/pt/translation.json';
import arTranslations from './locales/ar/translation.json';
import viTranslations from './locales/vi/translation.json';

// Normalize language to base code (e.g., 'en-US' -> 'en')
const supportedLanguages = ['en', 'es', 'pt', 'ar', 'vi'] as const;
const rawLanguage = localStorage.getItem('app-language') || navigator.language || 'en';
const baseLanguage = rawLanguage.split('-')[0];
const savedLanguage = supportedLanguages.includes(baseLanguage as any) ? baseLanguage : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      es: {
        translation: esTranslations
      },
      pt: {
        translation: ptTranslations
      },
      ar: {
        translation: arTranslations
      },
      vi: {
        translation: viTranslations
      }
    },
    lng: savedLanguage,
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'pt', 'ar', 'vi'],
    load: 'languageOnly',
    defaultNS: 'translation',
    ns: ['translation'],
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Prevent suspense-related loading issues
    }
  });

// Debug check in development
if (process.env.NODE_ENV !== 'production') {
  console.debug('i18n initialized', {
    language: i18n.language,
    hasTranslations: i18n.exists('landing.benefits.fasterUploads.title')
  });
}

export default i18n;
