"use strict";
// packages/ui/src/components/BridgeCompare.tsx
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
exports.BridgeCompare = void 0;
const react_1 = __importStar(require("react"));
const ssr_1 = require("./ui-lib/utils/ssr");
const RefreshIndicator_1 = require("./RefreshIndicator");
const QuoteCard_1 = require("./QuoteCard");
const RouteRiskWarning_1 = require("./bridge/RouteRiskWarning");
const skeleton_1 = require("./ui-lib/skeleton");
const sorting_1 = require("./ui-lib/sorting");
// Mock hook since @bridgewise/react may not be available
const useBridgeQuotes = (options) => {
    // Mock implementation for demo purposes
    const mockQuotes = [
        {
            id: '1',
            provider: 'LayerZero',
            estimatedTime: '~2 mins',
            outputAmount: '99.50',
            outputToken: 'USDC',
            sourceAmount: '100',
            sourceToken: 'USDC',
            sourceChain: 'Ethereum',
            destinationChain: 'Polygon',
            fees: { bridge: 0.50, gas: 2.00 },
            reliability: 95,
            speed: 2
        },
        {
            id: '2',
            provider: 'Hop Protocol',
            estimatedTime: '~3 mins',
            outputAmount: '99.20',
            outputToken: 'USDC',
            sourceAmount: '100',
            sourceToken: 'USDC',
            sourceChain: 'Ethereum',
            destinationChain: 'Polygon',
            fees: { bridge: 0.80, gas: 2.50 },
            reliability: 92,
            speed: 3
        },
        {
            id: '3',
            provider: 'Multichain',
            estimatedTime: '~5 mins',
            outputAmount: '98.80',
            outputToken: 'USDC',
            sourceAmount: '100',
            sourceToken: 'USDC',
            sourceChain: 'Ethereum',
            destinationChain: 'Polygon',
            fees: { bridge: 1.20, gas: 3.00 },
            reliability: 88,
            speed: 5
        }
    ];
    return {
        quotes: mockQuotes,
        isLoading: false,
        error: null,
        lastRefreshed: new Date(),
        isRefreshing: false,
        refresh: () => console.log('Refresh called'),
        updateParams: () => console.log('Update params called'),
        retryCount: 0,
        ...options
    };
};
const BridgeCompare = (props) => {
    const isMounted = (0, ssr_1.useIsMounted)();
    const { initialParams, onQuoteSelect, refreshInterval = 15000, autoRefresh = true } = props;
    const [selectedQuoteId, setSelectedQuoteId] = (0, react_1.useState)(null);
    const [showRefreshIndicator, setShowRefreshIndicator] = (0, react_1.useState)(false);
    const [sortBy, setSortBy] = (0, react_1.useState)('recommended');
    const [userHasSelected, setUserHasSelected] = (0, react_1.useState)(false);
    const { quotes, isLoading, error, lastRefreshed, isRefreshing, refresh, updateParams, retryCount } = useBridgeQuotes({
        initialParams,
        intervalMs: refreshInterval,
        autoRefresh,
        onRefreshStart: () => isMounted && setShowRefreshIndicator(true),
        onRefreshEnd: () => {
            if (isMounted) {
                setTimeout(() => setShowRefreshIndicator(false), 1000);
            }
        }
    });
    // Handle quote selection
    const handleQuoteSelect = (quoteId) => {
        if (isMounted) {
            setSelectedQuoteId(quoteId);
            setUserHasSelected(true); // Mark that user has manually selected
            onQuoteSelect?.(quoteId);
        }
    };
    // Handle sort change
    const handleSortChange = (newSortBy) => {
        setSortBy(newSortBy);
    };
    // Apply sorting to quotes
    const sortedQuotes = quotes.length > 0 ? (0, sorting_1.sortQuotes)((0, sorting_1.enhanceQuotesForSorting)(quotes), sortBy) : quotes;
    // Derive failure risk for the currently selected route
    const selectedQuote = sortedQuotes.find((q) => q.id === selectedQuoteId);
    const selectedRisk = selectedQuote?.failureRisk;
    const selectedRiskFactors = selectedQuote?.riskFactors ?? [];
    // Auto-select top-ranked route when quotes load or refresh
    // Only auto-select if user hasn't manually chosen a route
    (0, react_1.useEffect)(() => {
        if (sortedQuotes.length > 0 && !userHasSelected && isMounted) {
            const topRankedQuote = sortedQuotes[0];
            if (topRankedQuote && topRankedQuote.id !== selectedQuoteId) {
                setSelectedQuoteId(topRankedQuote.id);
                onQuoteSelect?.(topRankedQuote.id);
            }
        }
    }, [sortedQuotes, userHasSelected, isMounted, selectedQuoteId, onQuoteSelect]);
    // Format last refreshed time
    const getLastRefreshedText = () => {
        if (!lastRefreshed)
            return 'Never';
        const seconds = Math.floor((Date.now() - lastRefreshed.getTime()) / 1000);
        if (seconds < 60)
            return `${seconds}s ago`;
        if (seconds < 3600)
            return `${Math.floor(seconds / 60)}m ago`;
        return lastRefreshed.toLocaleTimeString();
    };
    return (<div className="bridge-compare">
      {/* Header with refresh controls and sorting */}
      <div className="bridge-compare__header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2>Bridge Routes</h2>
          <sorting_1.SortToggle currentSort={sortBy} onSortChange={handleSortChange} disabled={isLoading}/>
        </div>
        
        <div className="bridge-compare__refresh-controls">
          <RefreshIndicator_1.RefreshIndicator isRefreshing={isRefreshing} lastRefreshed={lastRefreshed} onClick={refresh} showAnimation={showRefreshIndicator}/>
          
          <div className="bridge-compare__refresh-info">
            <span className="bridge-compare__refresh-time">
              Updated: {getLastRefreshedText()}
            </span>
            {retryCount > 0 && (<span className="bridge-compare__retry-count">
                Retry {retryCount}/{3}
              </span>)}
          </div>
        </div>
      </div>

      {/* Selected route risk warning */}
      {selectedRisk && selectedRisk !== 'low' && (<div className="mb-4">
          <RouteRiskWarning_1.RouteRiskWarning failureRisk={selectedRisk} riskFactors={selectedRiskFactors}/>
        </div>)}

      {/* Error state */}
      {error && (<div className="bridge-compare__error" role="alert">
          <p>Failed to fetch quotes: {error.message}</p>
          <button onClick={refresh} disabled={isRefreshing}>
            Try Again
          </button>
        </div>)}

      {/* Loading skeleton - Enhanced with proper skeleton components */}
      {isLoading && quotes.length === 0 && (<div className="bridge-compare__skeleton grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (<skeleton_1.QuoteSkeleton key={i}/>))}
        </div>)}

      {/* Refreshing skeleton - Show when refreshing existing quotes */}
      {isRefreshing && quotes.length > 0 && (<div className="bridge-compare__refreshing-skeleton grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-50">
          {quotes.map((quote) => (<skeleton_1.QuoteSkeleton key={`refresh-${quote.id}`}/>))}
        </div>)}

      {/* Quotes grid */}
      {sortedQuotes.length > 0 && (<div className="bridge-compare__quotes-grid">
          {sortedQuotes.map((quote) => (<QuoteCard_1.QuoteCard key={quote.id} quote={quote} isSelected={selectedQuoteId === quote.id} onSelect={() => handleQuoteSelect(quote.id)} isRefreshing={isRefreshing && showRefreshIndicator}/>))}
        </div>)}

      {/* Empty state */}
      {!isLoading && quotes.length === 0 && !error && (<div className="bridge-compare__empty">
          <p>No bridge routes found for the selected parameters</p>
        </div>)}
    </div>);
};
exports.BridgeCompare = BridgeCompare;
//# sourceMappingURL=BridgeCompare.js.map