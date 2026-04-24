'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransactionExport = useTransactionExport;
const react_1 = require("react");
const transaction_export_service_1 = require("../services/transaction-export.service");
/**
 * Hook for exporting transaction history
 * Provides functionality to download transaction data as CSV or JSON
 */
function useTransactionExport(options) {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [currentFormat, setCurrentFormat] = (0, react_1.useState)(null);
    const [error, setError] = (0, react_1.useState)(null);
    const clearError = (0, react_1.useCallback)(() => {
        setError(null);
    }, []);
    const exportData = (0, react_1.useCallback)(async (format, filters) => {
        setLoading(true);
        setCurrentFormat(format);
        setError(null);
        try {
            await (0, transaction_export_service_1.exportTransactions)(format, filters);
            options?.onSuccess?.();
        }
        catch (err) {
            const errorInstance = err instanceof Error ? err : new Error(String(err));
            setError(errorInstance);
            options?.onError?.(errorInstance);
        }
        finally {
            setLoading(false);
            setCurrentFormat(null);
        }
    }, [options]);
    return {
        export: exportData,
        loading,
        currentFormat,
        error,
        clearError,
    };
}
//# sourceMappingURL=useTransactionExport.js.map