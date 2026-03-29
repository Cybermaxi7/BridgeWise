'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const AVAILABLE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem('bridgewise-language');
    if (stored && stored !== i18n.language) {
      i18n.changeLanguage(stored);
    }
    setLoaded(true);
  }, [i18n]);

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLng = event.target.value;
    i18n.changeLanguage(nextLng);
    window.localStorage.setItem('bridgewise-language', nextLng);
  };

  if (!loaded) return null;

  return (
    <div className="mb-6 flex items-center gap-2">
      <label htmlFor="bridgewise-language-selector" className="font-medium text-zinc-800 dark:text-zinc-200">
        {t('app.language')}:
      </label>
      <select
        id="bridgewise-language-selector"
        value={i18n.language}
        onChange={handleChange}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        {AVAILABLE_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
