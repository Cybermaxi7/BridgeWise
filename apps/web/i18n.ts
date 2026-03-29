import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en',
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr'],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('i18next init failed', error);
    });
}

export default i18n;
