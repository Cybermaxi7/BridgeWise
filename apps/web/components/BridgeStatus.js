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
exports.BridgeStatus = void 0;
const react_1 = __importStar(require("react"));
const useTransactionPersistence_1 = require("./ui-lib/hooks/useTransactionPersistence");
const ssr_1 = require("./ui-lib/utils/ssr");
const BridgeStatusSkeleton_1 = require("./ui-lib/skeleton/BridgeStatusSkeleton");
const BridgeStatus = ({ className = '' }) => {
    const isMounted = (0, ssr_1.useIsMounted)();
    const { state, clearState, updateState } = (0, useTransactionPersistence_1.useTransactionPersistence)();
    const [showDetails, setShowDetails] = (0, react_1.useState)(false);
    // Simulate bridge progress for demo purposes
    (0, react_1.useEffect)(() => {
        if (state.status === 'pending' && isMounted) {
            const progressInterval = setInterval(() => {
                updateState({
                    progress: Math.min(state.progress + 10, 90),
                    step: getProgressStep(state.progress)
                });
            }, 1000);
            // Complete the transaction after reaching 90%
            if (state.progress >= 90) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    updateState({
                        status: 'success',
                        progress: 100,
                        step: 'Transaction Complete',
                        txHash: '0x' + Math.random().toString(16).slice(2, 66)
                    });
                }, 1000);
            }
            return () => clearInterval(progressInterval);
        }
    }, [state.status, state.progress, updateState, isMounted]);
    const getProgressStep = (progress) => {
        if (progress < 20)
            return 'Initializing bridge...';
        if (progress < 40)
            return 'Approving token...';
        if (progress < 60)
            return 'Bridging assets...';
        if (progress < 80)
            return 'Confirming transaction...';
        if (progress < 100)
            return 'Finalizing bridge...';
        return 'Transaction Complete';
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'text-blue-600';
            case 'success': return 'text-green-600';
            case 'failed': return 'text-red-600';
            case 'partial': return 'text-yellow-600';
            default: return 'text-gray-600';
        }
    };
    const getStatusBgColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-blue-100';
            case 'success': return 'bg-green-100';
            case 'failed': return 'bg-red-100';
            case 'partial': return 'bg-yellow-100';
            default: return 'bg-gray-100';
        }
    };
    if (!isMounted) {
        return <BridgeStatusSkeleton_1.BridgeStatusSkeleton className={className}/>;
    }
    return (<div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Bridge Status</h3>
          <p className={`text-sm ${getStatusColor(state.status)}`}>
            {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
          </p>
        </div>
        {state.status !== 'idle' && (<button onClick={clearState} className="text-gray-400 hover:text-gray-600 transition-colors" aria-label="Clear status">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>)}
      </div>

      {/* Progress Bar */}
      {state.status === 'pending' && (<div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-medium text-gray-700">{state.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${state.progress}%` }}></div>
          </div>
        </div>)}

      {/* Current Step */}
      <div className={`p-4 rounded-lg mb-6 ${getStatusBgColor(state.status)}`}>
        <div className="flex items-center space-x-3">
          {state.status === 'pending' && (<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>)}
          {state.status === 'success' && (<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
            </svg>)}
          {state.status === 'failed' && (<svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>)}
          {state.status === 'partial' && (<svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>)}
          <div>
            <p className={`font-medium ${getStatusColor(state.status)}`}>
              {state.step}
            </p>
            <p className="text-sm text-gray-600">
              {state.status === 'pending' && 'Please keep this window open'}
              {state.status === 'success' && 'Your assets have been bridged successfully'}
              {state.status === 'failed' && 'Transaction failed. Please try again'}
              {state.status === 'partial' && 'Part of your transfer completed. See details below.'}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      {(state.status === 'success' || state.status === 'failed' || state.status === 'partial') && (<div className="border-t border-gray-100 pt-4">
          <button onClick={() => setShowDetails(!showDetails)} className="flex items-center justify-between w-full text-left mb-4 hover:text-gray-700 transition-colors">
            <span className="font-medium text-gray-900">Transaction Details</span>
            <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {showDetails && (<div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transaction ID</span>
                <span className="font-mono text-gray-900">{state.id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <span className={`font-medium ${getStatusColor(state.status)}`}>
                  {state.status.charAt(0).toUpperCase() + state.status.slice(1)}
                </span>
              </div>
              {state.txHash && (<div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transaction Hash</span>
                  <a href={`https://etherscan.io/tx/${state.txHash}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-mono text-xs">
                    {state.txHash.slice(0, 10)}...{state.txHash.slice(-8)}
                  </a>
                </div>)}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Timestamp</span>
                <span className="text-gray-900">
                  {new Date(state.timestamp).toLocaleString()}
                </span>
              </div>
              {state.status === 'partial' && state.partialInfo && (<>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Original Amount</span>
                    <span className="font-mono text-gray-900">{state.partialInfo.originalAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-mono text-green-600">{state.partialInfo.completedAmount} ({state.partialInfo.completedPercentage.toFixed(1)}%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Failed</span>
                    <span className="font-mono text-red-600">{state.partialInfo.failedAmount}</span>
                  </div>
                  {state.partialInfo.failedSteps.length > 0 && (<div className="mt-2">
                      <span className="text-sm text-gray-600">Failed Steps:</span>
                      <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                        {state.partialInfo.failedSteps.map((step, idx) => (<li key={idx}>{step}</li>))}
                      </ul>
                    </div>)}
                </>)}
            </div>)}
        </div>)}

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6">
        {state.status === 'failed' && (<>
            <button onClick={clearState} className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Start Over
            </button>
            <button onClick={() => {
                // Retry logic here
                updateState({
                    status: 'pending',
                    progress: 0,
                    step: 'Retrying...'
                });
            }} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Try Again
            </button>
          </>)}
        {state.status === 'partial' && (<>
            <button onClick={clearState} className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Dismiss
            </button>
            <button onClick={() => {
                // Retry failed steps
                updateState({
                    status: 'pending',
                    progress: 0,
                    step: 'Retrying failed steps...'
                });
            }} className="flex-1 py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium">
              Retry Failed Steps
            </button>
          </>)}
        {state.status === 'success' && (<>
            <button onClick={clearState} className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              New Bridge
            </button>
            <button onClick={() => {
                // View on explorer
                if (state.txHash) {
                    window.open(`https://etherscan.io/tx/${state.txHash}`, '_blank');
                }
            }} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              View on Explorer
            </button>
          </>)}
      </div>
    </div>);
};
exports.BridgeStatus = BridgeStatus;
//# sourceMappingURL=BridgeStatus.js.map