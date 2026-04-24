import { Injectable } from '@nestjs/common';

/**
 * Error thrown when an invalid chain pair is provided for bridging.
 */
export class InvalidChainPairError extends Error {
  constructor(fromChainId: number, toChainId: number) {
    super(`Invalid chain pair: ${fromChainId} -> ${toChainId}`);
    this.name = 'InvalidChainPairError';
  }
}

/**
 * Validator for chain pairs in cross-chain transfers.
 * In a real application, the supported chains and compatible pairs would likely come from a configuration file or database.
 */
@Injectable()
export class ChainValidator {
  // Example supported chain IDs (these would typically come from config)
  private readonly supportedChains = new Set([
    1, // Ethereum Mainnet
    137, // Polygon
    56, // Binance Smart Chain
    42161, // Arbitrum One
    10, // Optimism
    // Add more as needed
  ]);

  // Example of incompatible pairs (if any). For simplicity, we assume all supported chains can bridge to each other.
  // If there were restrictions, we could maintain a set of incompatible pairs or a compatibility matrix.
  // private readonly incompatiblePairs = new Set([/* e.g., `${fromChainId}-${toChainId}` */]);

  /**
   * Validates that the given chain pair is supported for bridging.
   * @param fromChainId - The source chain ID
   * @param toChainId - The destination chain ID
   * @throws InvalidChainPairError if the chain pair is not supported
   */
  validateChainPair(fromChainId: number, toChainId: number): void {
    // Check if both chains are supported
    if (!this.supportedChains.has(fromChainId)) {
      throw new InvalidChainPairError(fromChainId, toChainId);
    }

    if (!this.supportedChains.has(toChainId)) {
      throw new InvalidChainPairError(fromChainId, toChainId);
    }

    // Optional: Check for same-chain transfers (if not allowed for bridging)
    if (fromChainId === toChainId) {
      throw new InvalidChainPairError(fromChainId, toChainId);
    }

    // Optional: Check for specific incompatible pairs
    // const pairKey = `${fromChainId}-${toChainId}`;
    // if (this.incompatiblePairs.has(pairKey)) {
    //   throw new InvalidChainPairError(fromChainId, toChainId);
    // }
  }

  /**
   * Checks if a chain ID is supported.
   * @param chainId - The chain ID to check
   * @returns true if the chain is supported, false otherwise
   */
  isChainSupported(chainId: number): boolean {
    return this.supportedChains.has(chainId);
  }

  /**
   * Gets the list of supported chain IDs.
   * @returns An array of supported chain IDs
   */
  getSupportedChains(): number[] {
    return Array.from(this.supportedChains);
  }
}
