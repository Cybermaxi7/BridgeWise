'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineDetection } from '../hooks/useOfflineDetection';

export function OfflineBanner() {
  const { t } = useTranslation();
  const { isOffline, cache } = useOfflineDetection();

  if (!isOffline) return null;

  const cachedAt = cache?.cachedAt
    ? new Date(cache.cachedAt).toLocaleTimeString()
    : null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-3 bg-yellow-500 px-4 py-2 text-sm font-medium text-yellow-900 shadow-md"
    >
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
        />
      </svg>
      <span>
        {t('app.offline', {
          cached: cachedAt ? t('app.offlineCached', { when: cachedAt }) : t('app.offlineLimited'),
        })}
      </span>
    </div>
  );
}
