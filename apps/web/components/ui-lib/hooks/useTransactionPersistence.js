"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransactionPersistence = exports.updatePartialTransfer = exports.createPartialTransferInfo = void 0;
const react_1 = require("react");
const ssr_1 = require("../utils/ssr");
const STORAGE_KEY = 'bridgewise_tx_state';
const createPartialTransferInfo = (originalAmount, completedAmount, failedSteps, succeededSteps) => {
    const original = parseFloat(originalAmount || '0');
    const completed = parseFloat(completedAmount || '0');
    const failed = original - completed;
    return {
        originalAmount,
        completedAmount,
        failedAmount: failed.toString(),
        completedPercentage: original > 0 ? (completed / original) * 100 : 0,
        failedSteps,
        succeededSteps,
    };
};
exports.createPartialTransferInfo = createPartialTransferInfo;
const updatePartialTransfer = (prev, newCompletedAmount, step, failed) => {
    if (!prev.partialInfo) {
        return undefined;
    }
    const original = parseFloat(prev.partialInfo.originalAmount);
    const currentCompleted = parseFloat(prev.partialInfo.completedAmount);
    const newCompleted = failed ? currentCompleted : currentCompleted + parseFloat(newCompletedAmount);
    const failedSteps = failed ? [...prev.partialInfo.failedSteps, step] : prev.partialInfo.failedSteps;
    const succeededSteps = !failed ? [...prev.partialInfo.succeededSteps, step] : prev.partialInfo.succeededSteps;
    return (0, exports.createPartialTransferInfo)(prev.partialInfo.originalAmount, newCompleted.toString(), failedSteps, succeededSteps);
};
exports.updatePartialTransfer = updatePartialTransfer;
const useTransactionPersistence = () => {
    const [state, setState] = (0, react_1.useState)({
        id: '',
        status: 'idle',
        progress: 0,
        step: '',
        timestamp: 0,
    });
    // Load from storage on mount
    (0, react_1.useEffect)(() => {
        const stored = ssr_1.ssrLocalStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Optional: Expiry check (e.g. 24h)
                if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    setState(parsed);
                }
                else {
                    ssr_1.ssrLocalStorage.removeItem(STORAGE_KEY);
                }
            }
            catch (e) {
                console.error('Failed to load transaction state', e);
            }
        }
    }, []);
    // Save to storage whenever state changes
    (0, react_1.useEffect)(() => {
        if (state.status === 'idle') {
            // We might want to clear it if it's explicitly idle, or keep it if it's "history"
            // For now, let's only clear if we explicitly want to reset.
            // But if the user starts a new one, it overwrites.
            return;
        }
        // If completed/failed, we might want to keep it generic for a bit
        // But persistence is key.
        ssr_1.ssrLocalStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);
    const updateState = (0, react_1.useCallback)((updates) => {
        setState((prev) => ({ ...prev, ...updates, timestamp: Date.now() }));
    }, []);
    const clearState = (0, react_1.useCallback)(() => {
        setState({
            id: '',
            status: 'idle',
            progress: 0,
            step: '',
            timestamp: 0,
        });
        ssr_1.ssrLocalStorage.removeItem(STORAGE_KEY);
    }, []);
    const startTransaction = (0, react_1.useCallback)((id, originalAmount) => {
        const partialInfo = originalAmount
            ? (0, exports.createPartialTransferInfo)(originalAmount, '0', [], [])
            : undefined;
        setState({
            id,
            status: 'pending',
            progress: 0,
            step: 'Initializing...',
            timestamp: Date.now(),
            partialInfo,
        });
    }, []);
    const markPartialSuccess = (0, react_1.useCallback)((completedAmount, step) => {
        setState((prev) => {
            if (!prev.partialInfo)
                return prev;
            const newPartialInfo = (0, exports.updatePartialTransfer)(prev, completedAmount, step, false);
            return {
                ...prev,
                status: 'partial',
                partialInfo: newPartialInfo,
                timestamp: Date.now(),
            };
        });
    }, []);
    const markPartialFailure = (0, react_1.useCallback)((step) => {
        setState((prev) => {
            if (!prev.partialInfo)
                return prev;
            const newPartialInfo = (0, exports.updatePartialTransfer)(prev, '0', step, true);
            return {
                ...prev,
                status: 'partial',
                partialInfo: newPartialInfo,
                timestamp: Date.now(),
            };
        });
    }, []);
    const startRetry = (0, react_1.useCallback)((maxRetries = 3, backoffMs = 1000) => {
        setState((prev) => ({
            ...prev,
            retryInfo: {
                isRetrying: true,
                retryCount: (prev.retryInfo?.retryCount || 0) + 1,
                maxRetries,
                attempts: prev.retryInfo?.attempts || [],
                nextRetryAt: undefined,
            },
            status: 'pending',
            step: `Retrying... (Attempt ${(prev.retryInfo?.retryCount || 0) + 1}/${maxRetries})`,
            timestamp: Date.now(),
        }));
    }, []);
    const logRetryAttempt = (0, react_1.useCallback)((error) => {
        setState((prev) => {
            if (!prev.retryInfo)
                return prev;
            const newAttempts = [
                ...prev.retryInfo.attempts,
                {
                    attempt: prev.retryInfo.retryCount,
                    timestamp: Date.now(),
                    error,
                },
            ];
            return {
                ...prev,
                retryInfo: {
                    ...prev.retryInfo,
                    isRetrying: false,
                    attempts: newAttempts,
                },
                timestamp: Date.now(),
            };
        });
    }, []);
    const markRetrySuccess = (0, react_1.useCallback)(() => {
        setState((prev) => ({
            ...prev,
            status: 'success',
            retryInfo: prev.retryInfo ? {
                ...prev.retryInfo,
                isRetrying: false,
            } : undefined,
            step: 'Transaction completed successfully',
            timestamp: Date.now(),
        }));
    }, []);
    return {
        state,
        updateState,
        clearState,
        startTransaction,
        markPartialSuccess,
        markPartialFailure,
        startRetry,
        logRetryAttempt,
        markRetrySuccess,
    };
};
exports.useTransactionPersistence = useTransactionPersistence;
//# sourceMappingURL=useTransactionPersistence.js.map