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
    debug: process.env.NODE_ENV !== 'production',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Prevent suspense-related loading issues
    }
  });

// Debug check and validation in development
if (process.env.NODE_ENV !== 'production') {
  console.debug('i18n initialized', {
    language: i18n.language,
    hasTranslations: i18n.exists('landing.benefits.fasterUploads.title')
  });
  
  // Critical keys validation
  const criticalKeys = [
    // Landing page
    'landing.hero.titleShort',
    'landing.hero.subtitle',
    'landing.hero.benefits',
    'landing.hero.ctaPrimary',
    'landing.proofBar.activeTraders',
    'landing.proofBar.tradesAnalyzed',
    'landing.proofBar.averageRating',
    'landing.testimonials.sectionTitle',
    'landing.footer.securityBadge',
    
    // Navigation
    'navigation.home',
    'navigation.dashboard',
    'navigation.contact',
    'navigation.signIn',
    
    // Blog
    'blog.title',
    'blog.subtitle',
    'blog.searchPlaceholder',
    
    // Pricing
    'pricing.hero.title',
    'pricing.title',
    
    // Contact
    'contact.title',
    'contact.subtitle',
    
    // Common
    'common.save',
    'common.cancel',
    'common.loading'
  ];
  
  const missingKeys: string[] = [];
  
  criticalKeys.forEach(key => {
    if (!i18n.exists(key)) {
      missingKeys.push(key);
      console.error(`❌ MISSING CRITICAL TRANSLATION KEY: ${key}`);
    }
  });
  
  if (missingKeys.length > 0) {
    console.warn(`⚠️  ${missingKeys.length} critical translation keys are missing!`);
    console.warn('Missing keys:', missingKeys);
  } else {
    console.log('✅ All critical translation keys validated successfully');
  }
}

export default i18n;
