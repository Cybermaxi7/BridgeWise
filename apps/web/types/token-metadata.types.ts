/**
 * Token Metadata Types
 * 
 * Type definitions for token metadata
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
  lastUpdated: string;
}

export interface TokenMetadataRequest {
  chainId: number;
  address: string;
}

export interface BatchTokenMetadataRequest {
  tokens: string; // Comma-separated "chainId:address" pairs
}

export interface TokenMetadataCacheStats {
  size: number;
  hits: number;
}