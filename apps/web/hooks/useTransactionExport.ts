'use client';

import { useCallback, useState } from 'react';
import { exportTransactions, ExportFilters } from '../services/transaction-export.service';

export type ExportFormat = 'csv' | 'json';
export type { ExportFilters };

export interface UseTransactionExportOptions {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export interface UseTransactionExportReturn {
  /** Export transactions as CSV or JSON */
  export: (format: ExportFormat, filters?: ExportFilters) => Promise<void>;
  /** Whether an export is currently in progress */
  loading: boolean;
  /** Current export format being processed */
  currentFormat: ExportFormat | null;
  /** Last error that occurred during export */
  error: Error | null;
  /** Clear the error state */
  clearError: () => void;
}

/**
 * Hook for exporting transaction history
 * Provides functionality to download transaction data as CSV or JSON
 */
export function useTransactionExport(
  options?: UseTransactionExportOptions
): UseTransactionExportReturn {
  const [loading, setLoading] = useState(false);
  const [currentFormat, setCurrentFormat] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const exportData = useCallback(
    async (format: ExportFormat, filters?: ExportFilters) => {
      setLoading(true);
      setCurrentFormat(format);
      setError(null);

      try {
        await exportTransactions(format, filters);
        options?.onSuccess?.();
      } catch (err) {
        const errorInstance = err instanceof Error ? err : new Error(String(err));
        setError(errorInstance);
        options?.onError?.(errorInstance);
      } finally {
        setLoading(false);
        setCurrentFormat(null);
      }
    },
    [options]
  );

  return {
    export: exportData,
    loading,
    currentFormat,
    error,
    clearError,
  };
}
