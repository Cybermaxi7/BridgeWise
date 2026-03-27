/**
 * Token Metadata Service
 * 
 * Automatically fetches and caches token metadata (name, symbol, logo, decimals)
 * from trusted sources.
 * 
 * Metadata Sources:
 * - Primary: CoinGecko API (free, rate-limited)
 * - Fallback: Local token registry with default values
 * 
 * Caching:
 * - In-memory cache with TTL (Time To Live)
 * - Cache key: `${chainId}:${tokenAddress}`
 */

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config/config.service';
import { CACHE_TTL_MS } from './token-metadata.constants';

/**
 * Token metadata interface
 */
export interface TokenMetadata {
  address: string;
  chainId: number;
  name: string;
  symbol: string;
  decimals: number;
  logoUrl: string | null;
  price?: number;
  marketCap?: number;
  lastUpdated: Date;
}

/**
 * Token metadata cache entry
 */
interface CacheEntry {
  metadata: TokenMetadata;
  timestamp: number;
}

/**
 * Request DTO for fetching token metadata
 */
export class GetTokenMetadataDto {
  chainId: number;
  tokenAddress: string;
}

/**
 * Token Metadata Service
 * 
 * Provides automatic fetching and caching of token metadata from external APIs.
 */
@Injectable()
export class TokenMetadataService {
  private readonly logger = new Logger(TokenMetadataService.name);
  private metadataCache: Map<string, CacheEntry> = new Map();
  private readonly cacheTtl: number;

  // Known token addresses for common chains (fallback registry)
  private readonly knownTokens: Map<string, TokenMetadata> = new Map([
    // Ethereum
    ['1:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', chainId: 1, name: 'USD Coin', symbol: 'USDC', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', lastUpdated: new Date() }],
    ['1:0xdac17f958d2ee523a2206206994597c13d831ec7', { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', chainId: 1, name: 'Tether USD', symbol: 'USDT', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', lastUpdated: new Date() }],
    ['1:0x0000000000000000000000000000000000000000', { address: '0x0000000000000000000000000000000000000000', chainId: 1, name: 'Ethereum', symbol: 'ETH', decimals: 18, logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', lastUpdated: new Date() }],
    ['1:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', { address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', chainId: 1, name: 'Wrapped Bitcoin', symbol: 'WBTC', decimals: 8, logoUrl: 'https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png', lastUpdated: new Date() }],
    // Polygon
    ['137:0x2791bca1f2de4661ed88a30c99a7a9449aa84174', { address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174', chainId: 137, name: 'USD Coin', symbol: 'USDC', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', lastUpdated: new Date() }],
    ['137:0xc2132d05d31c914a87c6611c10748aeb04b58e8f', { address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f', chainId: 137, name: 'Tether USD', symbol: 'USDT', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', lastUpdated: new Date() }],
    ['137:0x0000000000000000000000000000000000000000', { address: '0x0000000000000000000000000000000000000000', chainId: 137, name: 'MATIC', symbol: 'MATIC', decimals: 18, logoUrl: 'https://assets.coingecko.com/coins/images/4713/small/polygon.png', lastUpdated: new Date() }],
    // Arbitrum
    ['42161:0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', { address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', chainId: 42161, name: 'USD Coin', symbol: 'USDC', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', lastUpdated: new Date() }],
    ['42161:0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', { address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', chainId: 42161, name: 'Tether USD', symbol: 'USDT', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', lastUpdated: new Date() }],
    ['42161:0x0000000000000000000000000000000000000000', { address: '0x0000000000000000000000000000000000000000', chainId: 42161, name: 'Ethereum', symbol: 'ETH', decimals: 18, logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', lastUpdated: new Date() }],
    // Optimism
    ['10:0x7f5c764cbc14f9669b88837ca1490cca17c31607', { address: '0x7f5c764cbc14f9669b88837ca1490cca17c31607', chainId: 10, name: 'USD Coin', symbol: 'USDC', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', lastUpdated: new Date() }],
    ['10:0x94b008aa00579c1307b0ef2c499ad98a8ce58ed4', { address: '0x94b008aa00579c1307b0ef2c499ad98a8ce58ed4', chainId: 10, name: 'Tether USD', symbol: 'USDT', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', lastUpdated: new Date() }],
    ['10:0x0000000000000000000000000000000000000000', { address: '0x0000000000000000000000000000000000000000', chainId: 10, name: 'Ethereum', symbol: 'ETH', decimals: 18, logoUrl: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', lastUpdated: new Date() }],
    // Avalanche
    ['43114:0xb97ef9ef8734c71904d8002f8b6bc99dd83774d0', { address: '0xb97ef9ef8734c71904d8002f8b6bc99dd83774d0', chainId: 43114, name: 'USD Coin', symbol: 'USDC', decimals: 8, logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', lastUpdated: new Date() }],
    ['43114:0x9702230a6e5d3870a4126384e9d3c47c3c7cc7d0', { address: '0x9702230a6e5d3870a4126384e9d3c47c3c7cc7d0', chainId: 43114, name: 'Tether USD', symbol: 'USDT', decimals: 6, logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', lastUpdated: new Date() }],
    ['43114:0x0000000000000000000000000000000000000000', { address: '0x0000000000000000000000000000000000000000', chainId: 43114, name: 'Avalanche', symbol: 'AVAX', decimals: 18, logoUrl: 'https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png', lastUpdated: new Date() }],
    // BSC
    ['56:0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', { address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', chainId: 56, name: 'USD Coin', symbol: 'USDC', decimals: 18, logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', lastUpdated: new Date() }],
    ['56:0x55d398326f99059ff775485246999027b3197955', { address: '0x55d398326f99059ff775485246999027b3197955', chainId: 56, name: 'Tether USD', symbol: 'USDT', decimals: 18, logoUrl: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', lastUpdated: new Date() }],
    ['56:0x0000000000000000000000000000000000000000', { address: '0x0000000000000000000000000000000000000000', chainId: 56, name: 'BNB', symbol: 'BNB', decimals: 18, logoUrl: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png', lastUpdated: new Date() }],
    // Stellar (uses asset codes, not contract addresses)
    ['stellar:USDC:GDGQG5W7V3CVKQFVRXEFNDSK4MW63V5K2CFD2QHR7T5T7X74GZ4SXXXY', { address: 'USDC', chainId: 0, name: 'USD Coin', symbol: 'USDC', decimals: 7, logoUrl: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png', lastUpdated: new Date() }],
    ['stellar:XLM:GBDV2LRLY5YHT3UUJPCFR2LRDC5DGMYGY5ZQMTL3PX6C6C6G4LZX6LUCW', { address: 'XLM', chainId: 0, name: 'Stellar', symbol: 'XLM', decimals: 7, logoUrl: 'https://assets.coingecko.com/coins/images/100/small/Stellar_symbol_black_RGB.png', lastUpdated: new Date() }],
  ]);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.cacheTtl = CACHE_TTL_MS;
    this.logger.log('TokenMetadataService initialized');
  }

  /**
   * Get token metadata for a specific chain and token address
   * 
   * @param dto - Contains chainId and tokenAddress
   * @returns TokenMetadata object
   */
  async getTokenMetadata(dto: GetTokenMetadataDto): Promise<TokenMetadata> {
    const cacheKey = `${dto.chainId}:${dto.tokenAddress.toLowerCase()}`;

    // Check cache first
    const cached = this.metadataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached.metadata;
    }

    // Check known tokens (fallback registry)
    const knownToken = this.knownTokens.get(cacheKey);
    if (knownToken) {
      this.logger.debug(`Known token match for ${cacheKey}`);
      this.metadataCache.set(cacheKey, { metadata: knownToken, timestamp: Date.now() });
      return knownToken;
    }

    // Try to fetch from external API (CoinGecko)
    try {
      const metadata = await this.fetchFromExternalApi(dto.chainId, dto.tokenAddress);
      if (metadata) {
        this.metadataCache.set(cacheKey, { metadata, timestamp: Date.now() });
        return metadata;
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch metadata from external API: ${error.message}`);
    }

    // Return default metadata as last resort
    return this.getDefaultMetadata(dto.chainId, dto.tokenAddress);
  }

  /**
   * Fetch token metadata from external API (CoinGecko)
   */
  private async fetchFromExternalApi(chainId: number, tokenAddress: string): Promise<TokenMetadata | null> {
    const coingeckoPlatformId = this.getCoingeckoPlatformId(chainId);
    if (!coingeckoPlatformId) {
      return null;
    }

    try {
      // For Ethereum-compatible chains, we can search by contract address
      const url = `https://api.coingecko.com/api/v3/coins/${coingeckoPlatformId}/contract/${tokenAddress.toLowerCase()}`;
      
      const response = await this.httpService.axiosRef.get(url, {
        timeout: 5000,
      });

      const data = response.data;

      return {
        address: tokenAddress.toLowerCase(),
        chainId,
        name: data.name,
        symbol: data.symbol.toUpperCase(),
        decimals: data.detail_platforms?.[coingeckoPlatformId]?.decimal_place || 18,
        logoUrl: data.image?.small || data.image?.large || null,
        price: data.market_data?.current_price?.usd,
        marketCap: data.market_data?.market_cap?.usd,
        lastUpdated: new Date(data.last_updated),
      };
    } catch (error) {
      if (error.response?.status === 404) {
        this.logger.debug(`Token not found on CoinGecko: ${tokenAddress}`);
      } else {
        this.logger.warn(`CoinGecko API error: ${error.message}`);
      }
      return null;
    }
  }

  /**
   * Map chain ID to CoinGecko platform ID
   */
  private getCoingeckoPlatformId(chainId: number): string | null {
    const platformMap: Record<number, string> = {
      1: 'ethereum',
      5: 'ethereum', // Goerli
      56: 'binancesmartchain',
      137: 'polygon-pos',
      42161: 'arbitrum-one',
      10: 'optimism',
      43114: 'avalanche-c',
      25: 'cronos', // Coming soon
      1666600000: 'harmony-shard-0', // Coming soon
    };

    return platformMap[chainId] || null;
  }

  /**
   * Get default metadata for unknown tokens
   */
  private getDefaultMetadata(chainId: number, tokenAddress: string): TokenMetadata {
    // For native tokens (zero address)
    if (tokenAddress === '0x0000000000000000000000000000000000000000' || tokenAddress === '0x0') {
      return {
        address: tokenAddress,
        chainId,
        name: this.getNativeTokenName(chainId),
        symbol: this.getNativeTokenSymbol(chainId),
        decimals: 18,
        logoUrl: null,
        lastUpdated: new Date(),
      };
    }

    // Generic fallback for unknown tokens
    return {
      address: tokenAddress.toLowerCase(),
      chainId,
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 18,
      logoUrl: null,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get native token name for a chain
   */
  private getNativeTokenName(chainId: number): string {
    const names: Record<number, string> = {
      1: 'Ethereum',
      56: 'BNB Chain',
      137: 'Polygon',
      42161: 'Arbitrum',
      10: 'Optimism',
      43114: 'Avalanche',
    };
    return names[chainId] || 'Native Token';
  }

  /**
   * Get native token symbol for a chain
   */
  private getNativeTokenSymbol(chainId: number): string {
    const symbols: Record<number, string> = {
      1: 'ETH',
      56: 'BNB',
      137: 'MATIC',
      42161: 'ETH',
      10: 'ETH',
      43114: 'AVAX',
    };
    return symbols[chainId] || 'NATIVE';
  }

  /**
   * Batch fetch metadata for multiple tokens
   * 
   * @param tokens - Array of { chainId, tokenAddress }
   * @returns Map of token address to metadata
   */
  async batchGetMetadata(tokens: { chainId: number; tokenAddress: string }[]): Promise<Map<string, TokenMetadata>> {
    const results = new Map<string, TokenMetadata>();
    
    // Process in parallel with limit
    const promises = tokens.map(async (token) => {
      const metadata = await this.getTokenMetadata({
        chainId: token.chainId,
        tokenAddress: token.tokenAddress,
      });
      results.set(token.tokenAddress.toLowerCase(), metadata);
    });

    await Promise.all(promises);
    return results;
  }

  /**
   * Clear the metadata cache
   */
  clearCache(): void {
    this.metadataCache.clear();
    this.logger.log('Metadata cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hits: number } {
    return {
      size: this.metadataCache.size,
      hits: 0, // Could implement hit tracking if needed
    };
  }
}