"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionHeartbeat = void 0;
const react_1 = __importDefault(require("react"));
const useTransactionPersistence_1 = require("./ui-lib/hooks/useTransactionPersistence");
const ssr_1 = require("./ui-lib/utils/ssr");
const RetryFeedback_1 = require("./RetryFeedback");
const TransactionHeartbeat = () => {
    const isMounted = (0, ssr_1.useIsMounted)();
    const { state, clearState, startRetry } = (0, useTransactionPersistence_1.useTransactionPersistence)();
    if (!isMounted || state.status === 'idle') {
        return null;
    }
    const isSuccess = state.status === 'success';
    const isFailed = state.status === 'failed';
    const isPartial = state.status === 'partial';
    const isRetrying = state.retryInfo?.isRetrying || false;
    const handleRetry = () => {
        startRetry(state.retryInfo?.maxRetries || 3);
    };
    return (<div className="fixed bottom-4 right-4 z-50 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden font-sans transition-all duration-300 ease-in-out transform translate-y-0">
            <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        {isSuccess ? 'Transaction Complete' : isFailed || isRetrying ? 'Transaction Status' : isPartial ? 'Partial Transfer' : 'Bridging Assets...'}
                    </h3>
                    <button onClick={clearState} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Close">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Show retry feedback if retrying or has retry info */}
                {state.retryInfo && (<div className="mb-4 -mx-4 -mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
                        <RetryFeedback_1.RetryFeedback isRetrying={state.retryInfo.isRetrying} currentAttempt={state.retryInfo.retryCount} maxAttempts={state.retryInfo.maxRetries} lastError={state.retryInfo.attempts[state.retryInfo.attempts.length - 1]?.error} onRetry={handleRetry}/>
                    </div>)}

                <div className="flex items-center gap-3 mb-3">
                    <div className="relative flex-1">
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-500 ease-out ${isSuccess ? 'bg-green-500' : isFailed && !isRetrying ? 'bg-red-500' : isRetrying ? 'bg-amber-500' : isPartial ? 'bg-yellow-500' : 'bg-blue-600'}`} style={{ width: `${state.progress}%` }}/>
                        </div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-8 text-right">
                        {state.progress}%
                    </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {state.step}
                </p>

                {state.txHash && (<div className="mt-2 text-xs">
                        <a href={`#`} className="text-blue-500 hover:underline">View on explorer</a>
                    </div>)}
            </div>

            {/* status bar line at bottom */}
            <div className={`h-1 w-full ${isSuccess ? 'bg-green-500' : isFailed && !isRetrying ? 'bg-red-500' : isRetrying ? 'bg-amber-500 animate-pulse' : isPartial ? 'bg-yellow-500 animate-pulse' : 'bg-blue-600 animate-pulse'}`}/>
        </div>);
};
exports.TransactionHeartbeat = TransactionHeartbeat;
//# sourceMappingURL=TransactionHeartbeat.js.map