"use strict";
/**
 * Token Icon Component
 *
 * Displays token logo with automatic fetching from metadata service
 * Includes fallback to symbol-based placeholder
 */
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
exports.TokenIcon = void 0;
const react_1 = __importStar(require("react"));
const useTokenMetadata_1 = require("../hooks/useTokenMetadata");
const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg',
};
const placeholderColors = {
    USDC: 'bg-blue-500',
    USDT: 'bg-green-500',
    ETH: 'bg-gray-700',
    BTC: 'bg-orange-500',
    WBTC: 'bg-orange-600',
    BNB: 'bg-yellow-500',
    MATIC: 'bg-purple-600',
    AVAX: 'bg-red-500',
    XLM: 'bg-gray-400',
    default: 'bg-gray-400',
};
/**
 * TokenIcon Component
 *
 * Fetches and displays token logo with fallback to symbol placeholder
 */
const TokenIcon = ({ chainId, address, symbol = '', size = 'md', className = '', }) => {
    const [imgError, setImgError] = (0, react_1.useState)(false);
    const { metadata, isLoading } = (0, useTokenMetadata_1.useTokenMetadata)(chainId, address, {
        enabled: !!address,
    });
    // Determine the logo URL to use
    const logoUrl = metadata?.logoUrl && !imgError ? metadata.logoUrl : null;
    // Determine display symbol
    const displaySymbol = metadata?.symbol || symbol || '?';
    // Get background color based on symbol
    const bgColor = placeholderColors[displaySymbol.toUpperCase()] || placeholderColors.default;
    const sizeClass = sizeClasses[size];
    // Handle image load error
    const handleError = () => {
        setImgError(true);
    };
    // Show loading state
    if (isLoading && !logoUrl) {
        return (<div className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center animate-pulse ${className}`}>
        <span className="text-white font-medium">
          {displaySymbol.slice(0, 2).toUpperCase()}
        </span>
      </div>);
    }
    // Show logo if available
    if (logoUrl) {
        return (<img src={logoUrl} alt={displaySymbol} className={`${sizeClass} rounded-full object-cover ${className}`} onError={handleError}/>);
    }
    // Fallback to symbol placeholder
    return (<div className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center ${className}`}>
      <span className="text-white font-medium">
        {displaySymbol.slice(0, 2).toUpperCase()}
      </span>
    </div>);
};
exports.TokenIcon = TokenIcon;
exports.default = exports.TokenIcon;
//# sourceMappingURL=TokenIcon.js.map