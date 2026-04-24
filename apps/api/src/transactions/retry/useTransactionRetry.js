"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTransactionRetry = useTransactionRetry;
const react_1 = require("react");
function useTransactionRetry(transaction, retryService) {
    const [retrying, setRetrying] = (0, react_1.useState)(false);
    const [retryResult, setRetryResult] = (0, react_1.useState)(null);
    const [logs, setLogs] = (0, react_1.useState)([]);
    const [feedback, setFeedback] = (0, react_1.useState)({
        isRetrying: false,
        currentAttempt: transaction?.retryCount || 0,
        maxAttempts: transaction?.maxRetries || 3,
        lastError: transaction?.error,
    });
    const retry = (0, react_1.useCallback)(async () => {
        setRetrying(true);
        setFeedback(prev => ({
            ...prev,
            isRetrying: true,
            currentAttempt: prev.currentAttempt + 1,
        }));
        try {
            const result = await retryService.retryTransaction(transaction);
            setRetryResult(result);
            if (result) {
                setFeedback(prev => ({
                    ...prev,
                    isRetrying: false,
                    lastError: undefined,
                }));
            }
            else {
                setFeedback(prev => ({
                    ...prev,
                    isRetrying: false,
                    lastError: 'Max retries exceeded',
                }));
            }
        }
        catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            setFeedback(prev => ({
                ...prev,
                isRetrying: false,
                lastError: errorMsg,
            }));
        }
        setRetrying(false);
        setLogs(retryService.getRetryLogs(transaction.id));
    }, [transaction, retryService]);
    (0, react_1.useEffect)(() => {
        setLogs(retryService.getRetryLogs(transaction.id));
        setFeedback(prev => ({
            ...prev,
            currentAttempt: transaction?.retryCount || prev.currentAttempt,
            maxAttempts: transaction?.maxRetries || prev.maxAttempts,
            lastError: transaction?.error || prev.lastError,
        }));
    }, [transaction, retryService]);
    return {
        retrying,
        retryResult,
        logs,
        retry,
        feedback,
    };
}
//# sourceMappingURL=useTransactionRetry.js.map