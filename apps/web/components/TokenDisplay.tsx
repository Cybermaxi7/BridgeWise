/**
 * Token Display Component
 * 
 * Displays token information including name, symbol, and logo
 * Uses the token metadata service to fetch and display token data
 */

import React from 'react';
import { useTokenMetadata } from '../hooks/useTokenMetadata';
import { TokenIcon } from './TokenIcon';

interface TokenDisplayProps {
  chainId: number;
  address: string;
  showName?: boolean;
  showSymbol?: boolean;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

interface TokenDisplayData {
  name: string;
  symbol: string;
  logoUrl: string | null;
}

/**
 * TokenDisplay Component
 * 
 * Displays token information with automatic metadata fetching
 */
export const TokenDisplay: React.FC<TokenDisplayProps> = ({
  chainId,
  address,
  showName = true,
  showSymbol = true,
  showLogo = true,
  size = 'md',
  className = '',
}) => {
  const { metadata, isLoading, error } = useTokenMetadata(chainId, address, {
    enabled: !!address,
  });

  // Build display data
  const displayData: TokenDisplayData = {
    name: metadata?.name || 'Unknown Token',
    symbol: metadata?.symbol || 'UNKNOWN',
    logoUrl: metadata?.logoUrl || null,
  };

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        {showLogo && (
          <div className={`w-${size === 'sm' ? '6' : size === 'md' ? '8' : size === 'lg' ? '10' : '12'} h-${size === 'sm' ? '6' : size === 'md' ? '8' : size === 'lg' ? '10' : '12'} bg-gray-200 rounded-full animate-pulse`} />
        )}
        <div className="space-y-1">
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-12 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={`flex items-center space-x-2 text-red-500 ${className}`}>
        <span className="text-sm">Failed to load token</span>
      </div>
    );
  }

  // Render token display
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Token Logo */}
      {showLogo && (
        <TokenIcon
          chainId={chainId}
          address={address}
          symbol={displayData.symbol}
          size={size}
        />
      )}

      {/* Token Name and Symbol */}
      <div className="flex flex-col">
        {showName && (
          <span className="font-medium text-gray-900 text-sm leading-tight">
            {displayData.name}
          </span>
        )}
        {showSymbol && (
          <span className="text-xs text-gray-500">
            {displayData.symbol}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Compact token display - symbol only with optional logo
 */
export const TokenSymbol: React.FC<{
  chainId: number;
  address: string;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ chainId, address, showLogo = true, size = 'md', className = '' }) => {
  const { metadata, isLoading } = useTokenMetadata(chainId, address, {
    enabled: !!address,
  });

  const symbol = metadata?.symbol || '?';

  if (isLoading) {
    return (
      <div className={`flex items-center ${className}`}>
        {showLogo && (
          <div className={`w-${size === 'sm' ? '4' : size === 'md' ? '6' : '8'} h-${size === 'sm' ? '4' : size === 'md' ? '6' : '8'} bg-gray-200 rounded-full animate-pulse mr-2`} />
        )}
        <span className="text-gray-400">...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      {showLogo && (
        <TokenIcon chainId={chainId} address={address} symbol={symbol} size={size === 'sm' ? 'sm' : size === 'md' ? 'md' : 'lg'} className="mr-2" />
      )}
      <span className="font-medium">{symbol}</span>
    </div>
  );
};

export default TokenDisplay;