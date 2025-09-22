import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enTranslations from './locales/en.json';
import bnTranslations from './locales/bn.json';

const resources = {
  en: {
    translation: enTranslations
  },
  bn: {
    translation: bnTranslations
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'bn', // Default language is Bengali
    fallbackLng: 'bn', // Fallback to Bengali instead of English
    debug: true, // Enable debug to see what's happening
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
