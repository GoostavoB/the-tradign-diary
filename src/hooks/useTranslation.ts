import { useTranslation as useI18nTranslation } from 'react-i18next';

/**
 * Custom hook for translations with simplified API
 * Wraps react-i18next useTranslation hook
 */
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();
  
  return {
    t,
    i18n,
    language: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
  };
};
