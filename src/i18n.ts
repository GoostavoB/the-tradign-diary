// src/i18n.ts
// REVISED VERSION - Initialize from URL, not localStorage

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en/translation.json';
import esTranslations from './locales/es/translation.json';
import ptTranslations from './locales/pt/translation.json';
import arTranslations from './locales/ar/translation.json';
import viTranslations from './locales/vi/translation.json';
import { getLanguageFromPath, isPublicRoute, type SupportedLanguage } from './utils/languageRouting';

const supportedLanguages: SupportedLanguage[] = ['en', 'es', 'pt', 'ar', 'vi'];

// ===================================================================
// FIX #1: Initialize from URL for public routes
// ===================================================================
function getInitialLanguage(): SupportedLanguage {
  const currentPath = window.location.pathname;
  
  // For public routes: URL is source of truth
  if (isPublicRoute(currentPath)) {
    const urlLang = getLanguageFromPath(currentPath);
    console.log(`[i18n] Public route detected, using URL language: ${urlLang}`);
    return urlLang;
  }
  
  // For protected routes: Use localStorage or browser preference
  const savedLang = localStorage.getItem('app-language');
  if (savedLang && supportedLanguages.includes(savedLang as SupportedLanguage)) {
    console.log(`[i18n] Protected route, using saved language: ${savedLang}`);
    return savedLang as SupportedLanguage;
  }
  
  const browserLang = navigator.language.split('-')[0] as SupportedLanguage;
  if (supportedLanguages.includes(browserLang)) {
    console.log(`[i18n] Using browser language: ${browserLang}`);
    return browserLang;
  }
  
  console.log('[i18n] Fallback to English');
  return 'en';
}

const initialLanguage = getInitialLanguage();

// Initialize i18n and wait for it to be ready
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations },
      pt: { translation: ptTranslations },
      ar: { translation: arTranslations },
      vi: { translation: viTranslations },
    },
    lng: initialLanguage, // ✅ Now uses URL for public routes
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    load: 'languageOnly',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    console.log(`[i18n] ✅ Initialized with language: ${i18n.language}`);
  });

// Development helper: Log missing keys
if (import.meta.env.DEV) {
  i18n.on('missingKey', (lngs, namespace, key, res) => {
    console.warn(`[i18n] Missing translation key: "${key}" for languages: ${lngs.join(', ')}`);
  });
}

export default i18n;
