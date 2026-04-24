"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryFeedback = void 0;
const react_1 = __importStar(require("react"));
const RetryFeedback = ({ isRetrying, currentAttempt, maxAttempts, lastError, nextRetryIn, onRetry, }) => {
    const [timeRemaining, setTimeRemaining] = (0, react_1.useState)(nextRetryIn || 0);
    (0, react_1.useEffect)(() => {
        if (!nextRetryIn || !isRetrying)
            return;
        const interval = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 100) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 100;
            });
        }, 100);
        return () => clearInterval(interval);
    }, [nextRetryIn, isRetrying]);
    if (!isRetrying && !lastError) {
        return null;
    }
    const hasMoreRetries = currentAttempt < maxAttempts;
    const remainingRetries = maxAttempts - currentAttempt;
    const percentRetries = (currentAttempt / maxAttempts) * 100;
    return (<div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {isRetrying ? (<>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"/>
                <span className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                  Retrying Transaction
                </span>
              </div>
            </>) : lastError ? (<>
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="text-sm font-semibold text-red-900 dark:text-red-100">
                Retry Failed
              </span>
            </>) : null}
        </div>
        <span className="text-xs font-medium text-amber-700 dark:text-amber-200 bg-white dark:bg-amber-950 px-2 py-1 rounded">
          Attempt {currentAttempt} of {maxAttempts}
        </span>
      </div>

      {/* Error message */}
      {lastError && (<p className="text-sm text-amber-800 dark:text-amber-100 line-clamp-2">
          {lastError}
        </p>)}

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-1.5 bg-amber-200 dark:bg-amber-900/50 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300" style={{ width: `${percentRetries}%` }}/>
        </div>
        <div className="text-xs text-amber-700 dark:text-amber-200">
          {remainingRetries > 0 ? (<span>
              {remainingRetries === 1
                ? '1 retry remaining'
                : `${remainingRetries} retries remaining`}
            </span>) : (<span>No retries remaining - transaction failed</span>)}
        </div>
      </div>

      {/* Countdown */}
      {isRetrying && nextRetryIn && nextRetryIn > 0 && (<div className="text-xs text-amber-700 dark:text-amber-200 flex items-center gap-2">
          <span>Next retry in:</span>
          <span className="font-mono font-semibold text-amber-900 dark:text-amber-50">
            {Math.ceil(timeRemaining / 1000)}s
          </span>
        </div>)}

      {/* Spinner for retrying state */}
      {isRetrying && (<div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}/>
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}/>
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}/>
          </div>
          <span className="text-xs text-amber-700 dark:text-amber-200">Processing retry...</span>
        </div>)}

      {/* Action button when not retrying and has error */}
      {!isRetrying && lastError && hasMoreRetries && onRetry && (<button onClick={onRetry} className="w-full mt-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-md transition-colors duration-200">
          Retry Now
        </button>)}

      {/* Status when no retries remaining */}
      {!hasMoreRetries && (<div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded border border-red-300 dark:border-red-700">
          <p className="text-xs text-red-800 dark:text-red-200 font-medium">
            ❌ Transaction failed after {maxAttempts} attempts. Please contact support or try a different route.
          </p>
        </div>)}
    </div>);
};
exports.RetryFeedback = RetryFeedback;
//# sourceMappingURL=RetryFeedback.js.map