"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useRetryFeedback = useRetryFeedback;
const react_1 = require("react");
const useTransactionPersistence_1 = require("./useTransactionPersistence");
/**
 * Hook to integrate transaction retry feedback with the transaction persistence state
 * Listens to retry service events and updates UI state accordingly
 */
function useRetryFeedback(transactionId, retryService) {
    const { startRetry, logRetryAttempt, markRetrySuccess, updateState } = (0, useTransactionPersistence_1.useTransactionPersistence)();
    const handleRetryStateChange = (0, react_1.useCallback)((state) => {
        const { isRetrying, currentAttempt, maxAttempts, error, nextRetryIn } = state;
        if (isRetrying) {
            if (currentAttempt === 1) {
                // First retry attempt
                startRetry(maxAttempts);
            }
            else {
                // Update step to show current attempt
                updateState({
                    step: `Retrying... (Attempt ${currentAttempt}/${maxAttempts})`,
                });
            }
            if (nextRetryIn && nextRetryIn > 0) {
                // Show countdown
                updateState({
                    step: `Retrying in ${Math.ceil(nextRetryIn / 1000)}s... (Attempt ${currentAttempt}/${maxAttempts})`,
                });
            }
        }
        else if (error) {
            // Retry failed
            logRetryAttempt(error);
        }
        else {
            // Retry succeeded
            markRetrySuccess();
        }
    }, [startRetry, logRetryAttempt, markRetrySuccess, updateState]);
    (0, react_1.useEffect)(() => {
        if (!retryService)
            return;
        // Register listener with retry service
        retryService.onRetryStateChange(transactionId, handleRetryStateChange);
        return () => {
            // Cleanup listener
            retryService.offRetryStateChange(transactionId);
        };
    }, [transactionId, retryService, handleRetryStateChange]);
    return {
        handleRetryStateChange,
    };
}
//# sourceMappingURL=useRetryFeedback.js.map