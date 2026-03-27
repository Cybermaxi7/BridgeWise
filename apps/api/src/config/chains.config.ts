/**
 * Chain Configuration for BridgeWise
 * Defines supported blockchain networks and their properties
 */

export interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  type: 'EVM' | 'Stellar';
  isTestnet?: boolean;
  features: {
    supportsBridging: boolean;
    supportsQuotes: boolean;
    nativeCurrencyDecimals: number;
  };
}

/**
 * Supported EVM Chains
 */
export const EVM_CHAINS: Record<string, ChainConfig> = {
  ETHEREUM: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: process.env.RPC_ETHEREUM || 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    type: 'EVM',
    features: {
      supportsBridging: true,
      supportsQuotes: true,
      nativeCurrencyDecimals: 18,
    },
  },
  
  POLYGON: {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: process.env.RPC_POLYGON || 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    type: 'EVM',
    features: {
      supportsBridging: true,
      supportsQuotes: true,
      nativeCurrencyDecimals: 18,
    },
  },
  
  BSC: {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: process.env.RPC_BSC || 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    type: 'EVM',
    features: {
      supportsBridging: true,
      supportsQuotes: true,
      nativeCurrencyDecimals: 18,
    },
  },
  
  ARBITRUM: {
    id: 'arbitrum',
    name: 'Arbitrum One',
    symbol: 'ETH',
    chainId: 42161,
    rpcUrl: process.env.RPC_ARBITRUM || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    type: 'EVM',
    features: {
      supportsBridging: true,
      supportsQuotes: true,
      nativeCurrencyDecimals: 18,
    },
  },
  
  OPTIMISM: {
    id: 'optimism',
    name: 'Optimism',
    symbol: 'ETH',
    chainId: 10,
    rpcUrl: process.env.RPC_OPTIMISM || 'https://mainnet.optimism.io',
    explorerUrl: 'https://optimistic.etherscan.io',
    type: 'EVM',
    features: {
      supportsBridging: true,
      supportsQuotes: true,
      nativeCurrencyDecimals: 18,
    },
  },
  
  BASE: {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: 8453,
    rpcUrl: process.env.RPC_BASE || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    type: 'EVM',
    features: {
      supportsBridging: true,
      supportsQuotes: true,
      nativeCurrencyDecimals: 18,
    },
  },
};

/**
 * Stellar Network Configuration
 */
export const STELLAR_CONFIG: ChainConfig = {
  id: 'stellar',
  name: 'Stellar',
  symbol: 'XLM',
  chainId: 0, // Stellar doesn't use chainId
  rpcUrl: 'https://horizon.stellar.org',
  explorerUrl: 'https://stellarscan.io',
  type: 'Stellar',
  features: {
    supportsBridging: true,
    supportsQuotes: true,
    nativeCurrencyDecimals: 7,
  },
};

/**
 * Get all supported chains
 */
export function getAllChains(): ChainConfig[] {
  return [
    ...Object.values(EVM_CHAINS),
    STELLAR_CONFIG,
  ];
}

/**
 * Get chain by ID
 */
export function getChainById(chainId: string): ChainConfig | undefined {
  const evmChain = Object.values(EVM_CHAINS).find(
    chain => chain.id === chainId.toLowerCase()
  );
  
  if (evmChain) {
    return evmChain;
  }
  
  if (STELLAR_CONFIG.id === chainId.toLowerCase()) {
    return STELLAR_CONFIG;
  }
  
  return undefined;
}

/**
 * Get EVM chain by numeric chainId
 */
export function getEVMChainByChainId(numericChainId: number): ChainConfig | undefined {
  return Object.values(EVM_CHAINS).find(
    chain => chain.chainId === numericChainId
  );
}

/**
 * Check if chain is EVM
 */
export function isEVMChain(chainId: string): boolean {
  return chainId.toLowerCase() in EVM_CHAINS;
}

/**
 * Check if chain is Stellar
 */
export function isStellarChain(chainId: string): boolean {
  return chainId.toLowerCase() === 'stellar';
}

/**
 * Get supported source chains for bridging
 */
export function getSupportedSourceChains(): ChainConfig[] {
  return getAllChains().filter(chain => chain.features.supportsBridging);
}

/**
 * Get supported destination chains for a given source chain
 */
export function getSupportedDestinationChains(sourceChainId: string): ChainConfig[] {
  const sourceChain = getChainById(sourceChainId);
  if (!sourceChain) {
    return [];
  }
  
  // For now, all chains can bridge to each other
  // In production, you may want to restrict certain combinations
  return getAllChains().filter(
    chain => chain.id !== sourceChainId && chain.features.supportsBridging
  );
}

/**
 * Validate chain combination
 */
export function isValidBridgePair(
  sourceChainId: string,
  destinationChainId: string
): { valid: boolean; error?: string } {
  const sourceChain = getChainById(sourceChainId);
  const destChain = getChainById(destinationChainId);
  
  if (!sourceChain) {
    return {
      valid: false,
      error: `Unsupported source chain: ${sourceChainId}`,
    };
  }
  
  if (!destChain) {
    return {
      valid: false,
      error: `Unsupported destination chain: ${destinationChainId}`,
    };
  }
  
  if (!sourceChain.features.supportsBridging) {
    return {
      valid: false,
      error: `Source chain ${sourceChainId} does not support bridging`,
    };
  }
  
  if (!destChain.features.supportsBridging) {
    return {
      valid: false,
      error: `Destination chain ${destinationChainId} does not support bridging`,
    };
  }
  
  if (sourceChainId === destinationChainId) {
    return {
      valid: false,
      error: 'Source and destination chains must be different',
    };
  }
  
  return { valid: true };
}

/**
 * Get chain RPC URL
 */
export function getChainRpcUrl(chainId: string): string | undefined {
  const chain = getChainById(chainId);
  return chain?.rpcUrl;
}

/**
 * Get chain explorer URL
 */
export function getChainExplorerUrl(chainId: string): string | undefined {
  const chain = getChainById(chainId);
  return chain?.explorerUrl;
}

/**
 * Build explorer URL for transaction
 */
export function getTransactionExplorerUrl(
  chainId: string,
  txHash: string
): string | undefined {
  const chain = getChainById(chainId);
  if (!chain) {
    return undefined;
  }
  
  return `${chain.explorerUrl}/tx/${txHash}`;
}

/**
 * Build explorer URL for address
 */
export function getAddressExplorerUrl(
  chainId: string,
  address: string
): string | undefined {
  const chain = getChainById(chainId);
  if (!chain) {
    return undefined;
  }
  
  if (chain.type === 'EVM') {
    return `${chain.explorerUrl}/address/${address}`;
  } else if (chain.type === 'Stellar') {
    return `${chain.explorerUrl}/account/${address}`;
  }
  
  return undefined;
}
