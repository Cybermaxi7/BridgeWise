'use client';

import { ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';

export function I18nProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const storedLanguage = window.localStorage.getItem('bridgewise-language');
    if (storedLanguage && storedLanguage !== i18n.language) {
      i18n.changeLanguage(storedLanguage);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
