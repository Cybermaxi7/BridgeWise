/**
 * Token Metadata Controller
 * 
 * REST API endpoints for fetching token metadata
 */

import { Controller, Get, Query, ValidationPipe, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { TokenMetadataService, GetTokenMetadataDto } from './token-metadata.service';

@ApiTags('Token Metadata')
@Controller('tokens')
export class TokenMetadataController {
  constructor(private readonly tokenMetadataService: TokenMetadataService) {}

  @Get('metadata')
  @ApiOperation({
    summary: 'Get token metadata',
    description: 'Fetches token metadata (name, symbol, logo, decimals) for a given chain and token address',
  })
  @ApiQuery({ name: 'chainId', type: Number, description: 'Chain ID (e.g., 1 for Ethereum, 137 for Polygon)' })
  @ApiQuery({ name: 'address', type: String, description: 'Token contract address' })
  @ApiResponse({ status: 200, description: 'Token metadata retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getMetadata(
    @Query('chainId') chainId: string,
    @Query('address') address: string,
  ) {
    const metadata = await this.tokenMetadataService.getTokenMetadata({
      chainId: parseInt(chainId, 10),
      tokenAddress: address,
    });
    return metadata;
  }

  @Get('metadata/batch')
  @ApiOperation({
    summary: 'Batch get token metadata',
    description: 'Fetches metadata for multiple tokens at once',
  })
  @ApiQuery({ name: 'tokens', type: String, description: 'Comma-separated list of chainId:address pairs (e.g., "1:0x...,137:0x...")' })
  @ApiResponse({ status: 200, description: 'Token metadata batch retrieved successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async getBatchMetadata(@Query('tokens') tokens: string) {
    const tokenPairs = tokens.split(',').map((t) => {
      const [chainId, address] = t.split(':');
      return { chainId: parseInt(chainId, 10), tokenAddress: address };
    });

    const results = await this.tokenMetadataService.batchGetMetadata(tokenPairs);
    return Object.fromEntries(results);
  }

  @Get('cache/stats')
  @ApiOperation({
    summary: 'Get cache statistics',
    description: 'Returns current cache size and statistics',
  })
  async getCacheStats() {
    return this.tokenMetadataService.getCacheStats();
  }

  @Get('cache/clear')
  @ApiOperation({
    summary: 'Clear metadata cache',
    description: 'Clears all cached token metadata',
  })
  async clearCache() {
    this.tokenMetadataService.clearCache();
    return { message: 'Cache cleared successfully' };
  }
}