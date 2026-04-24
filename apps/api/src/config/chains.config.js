"use strict";
/**
 * Chain Configuration for BridgeWise
 * Defines supported blockchain networks and their properties
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STELLAR_CONFIG = exports.EVM_CHAINS = void 0;
exports.getAllChains = getAllChains;
exports.getChainById = getChainById;
exports.getEVMChainByChainId = getEVMChainByChainId;
exports.isEVMChain = isEVMChain;
exports.isStellarChain = isStellarChain;
exports.getSupportedSourceChains = getSupportedSourceChains;
exports.getSupportedDestinationChains = getSupportedDestinationChains;
exports.isValidBridgePair = isValidBridgePair;
exports.getChainRpcUrl = getChainRpcUrl;
exports.getChainExplorerUrl = getChainExplorerUrl;
exports.getTransactionExplorerUrl = getTransactionExplorerUrl;
exports.getAddressExplorerUrl = getAddressExplorerUrl;
/**
 * Supported EVM Chains
 */
exports.EVM_CHAINS = {
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
exports.STELLAR_CONFIG = {
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
function getAllChains() {
    return [
        ...Object.values(exports.EVM_CHAINS),
        exports.STELLAR_CONFIG,
    ];
}
/**
 * Get chain by ID
 */
function getChainById(chainId) {
    const evmChain = Object.values(exports.EVM_CHAINS).find(chain => chain.id === chainId.toLowerCase());
    if (evmChain) {
        return evmChain;
    }
    if (exports.STELLAR_CONFIG.id === chainId.toLowerCase()) {
        return exports.STELLAR_CONFIG;
    }
    return undefined;
}
/**
 * Get EVM chain by numeric chainId
 */
function getEVMChainByChainId(numericChainId) {
    return Object.values(exports.EVM_CHAINS).find(chain => chain.chainId === numericChainId);
}
/**
 * Check if chain is EVM
 */
function isEVMChain(chainId) {
    return chainId.toLowerCase() in exports.EVM_CHAINS;
}
/**
 * Check if chain is Stellar
 */
function isStellarChain(chainId) {
    return chainId.toLowerCase() === 'stellar';
}
/**
 * Get supported source chains for bridging
 */
function getSupportedSourceChains() {
    return getAllChains().filter(chain => chain.features.supportsBridging);
}
/**
 * Get supported destination chains for a given source chain
 */
function getSupportedDestinationChains(sourceChainId) {
    const sourceChain = getChainById(sourceChainId);
    if (!sourceChain) {
        return [];
    }
    // For now, all chains can bridge to each other
    // In production, you may want to restrict certain combinations
    return getAllChains().filter(chain => chain.id !== sourceChainId && chain.features.supportsBridging);
}
/**
 * Validate chain combination
 */
function isValidBridgePair(sourceChainId, destinationChainId) {
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
function getChainRpcUrl(chainId) {
    const chain = getChainById(chainId);
    return chain?.rpcUrl;
}
/**
 * Get chain explorer URL
 */
function getChainExplorerUrl(chainId) {
    const chain = getChainById(chainId);
    return chain?.explorerUrl;
}
/**
 * Build explorer URL for transaction
 */
function getTransactionExplorerUrl(chainId, txHash) {
    const chain = getChainById(chainId);
    if (!chain) {
        return undefined;
    }
    return `${chain.explorerUrl}/tx/${txHash}`;
}
/**
 * Build explorer URL for address
 */
function getAddressExplorerUrl(chainId, address) {
    const chain = getChainById(chainId);
    if (!chain) {
        return undefined;
    }
    if (chain.type === 'EVM') {
        return `${chain.explorerUrl}/address/${address}`;
    }
    else if (chain.type === 'Stellar') {
        return `${chain.explorerUrl}/account/${address}`;
    }
    return undefined;
}
//# sourceMappingURL=chains.config.js.map