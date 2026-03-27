/**
 * Token Icon Component
 * 
 * Displays token logo with automatic fetching from metadata service
 * Includes fallback to symbol-based placeholder
 */

import React, { useState } from 'react';
import { useTokenMetadata } from '../hooks/useTokenMetadata';

interface TokenIconProps {
  chainId: number;
  address: string;
  symbol?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg',
};

const placeholderColors: Record<string, string> = {
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
export const TokenIcon: React.FC<TokenIconProps> = ({
  chainId,
  address,
  symbol = '',
  size = 'md',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const { metadata, isLoading } = useTokenMetadata(chainId, address, {
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
    return (
      <div
        className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center animate-pulse ${className}`}
      >
        <span className="text-white font-medium">
          {displaySymbol.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  // Show logo if available
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={displaySymbol}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={handleError}
      />
    );
  }

  // Fallback to symbol placeholder
  return (
    <div
      className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center ${className}`}
    >
      <span className="text-white font-medium">
        {displaySymbol.slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
};

export default TokenIcon;