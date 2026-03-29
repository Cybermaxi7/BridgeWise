'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useVersion, VersionData } from '../hooks/useVersion';

export interface VersionDisplayProps {
  /** Custom CSS class */
  className?: string;
  /** Show detailed information (default: false) */
  showDetails?: boolean;
  /** Enable logging to console on mount */
  enableLogging?: boolean;
  /** API base URL override */
  apiUrl?: string;
  /** Click handler for version badge */
  onClick?: (version: VersionData) => void;
}

/**
 * VersionDisplay Component
 * 
 * Displays the current SDK/API version in a stylish badge.
 * Supports light/dark themes and optional detailed view.
 */
export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  className = '',
  showDetails = false,
  enableLogging = true,
  apiUrl,
  onClick,
}) => {
  const { t } = useTranslation();
  const { version, loading, error } = useVersion({
    apiUrl,
    enableLogging,
  });

  const handleClick = () => {
    if (version && onClick) {
      onClick(version);
    }
  };

  if (loading) {
    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 ${className}`}
      >
        <svg
          className="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {t('app.loading')}
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 ${className}`}
      >
        v?.?.?
      </div>
    );
  }

  if (!version) {
    return null;
  }

  const getVersionColor = () => {
    switch (version.environment) {
      case 'production':
        return 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400';
      case 'staging':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      {/* Simple Badge */}
      {!showDetails ? (
        <button
          onClick={handleClick}
          className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            transition-all duration-200 hover:scale-105 cursor-pointer
            ${getVersionColor()}
          `}
          title={`BridgeWise SDK v${version.version} (${version.environment})`}
        >
          🔗 v{version.version}
        </button>
      ) : (
        /* Detailed View */
        <div
          className={`
            inline-block p-3 rounded-lg border text-sm
            bg-white dark:bg-gray-800
            border-gray-200 dark:border-gray-700
            shadow-sm
          `}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">🔗 BridgeWise SDK</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-medium ${getVersionColor()}`}
              >
                v{version.version}
              </span>
            </div>
            
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <dl className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <dt className="text-gray-500 dark:text-gray-400">API Version:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {version.apiVersion}
                </dd>
                
                <dt className="text-gray-500 dark:text-gray-400">Environment:</dt>
                <dd className="font-medium capitalize text-gray-900 dark:text-white">
                  {version.environment}
                </dd>
                
                {version.build && (
                  <>
                    <dt className="text-gray-500 dark:text-gray-400">Build:</dt>
                    <dd className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
                      {version.build}
                    </dd>
                  </>
                )}
                
                <dt className="text-gray-500 dark:text-gray-400">Updated:</dt>
                <dd className="font-medium text-gray-900 dark:text-white">
                  {new Date(version.timestamp).toLocaleDateString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionDisplay;
