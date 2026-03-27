/**
 * Token Metadata Service Unit Tests
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '../config/config.service';
import { TokenMetadataService } from './token-metadata.service';

describe('TokenMetadataService', () => {
  let service: TokenMetadataService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    axiosRef: {
      get: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenMetadataService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<TokenMetadataService>(TokenMetadataService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    service.clearCache();
    jest.clearAllMocks();
  });

  describe('getTokenMetadata', () => {
    it('should return metadata from known tokens for USDC on Ethereum', async () => {
      const result = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      expect(result).toBeDefined();
      expect(result.symbol).toBe('USDC');
      expect(result.name).toBe('USD Coin');
      expect(result.decimals).toBe(6);
      expect(result.chainId).toBe(1);
    });

    it('should return metadata for USDT on Ethereum', async () => {
      const result = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      });

      expect(result).toBeDefined();
      expect(result.symbol).toBe('USDT');
      expect(result.name).toBe('Tether USD');
    });

    it('should return native ETH for zero address', async () => {
      const result = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0x0000000000000000000000000000000000000000',
      });

      expect(result).toBeDefined();
      expect(result.symbol).toBe('ETH');
      expect(result.name).toBe('Ethereum');
      expect(result.decimals).toBe(18);
    });

    it('should return default metadata for unknown tokens', async () => {
      const result = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0x1234567890123456789012345678901234567890',
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('Unknown Token');
      expect(result.symbol).toBe('UNKNOWN');
      expect(result.decimals).toBe(18);
    });

    it('should return cached metadata on subsequent calls', async () => {
      const dto = {
        chainId: 1,
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      };

      const result1 = await service.getTokenMetadata(dto);
      const result2 = await service.getTokenMetadata(dto);

      expect(result1).toEqual(result2);
    });

    it('should handle Polygon chain correctly', async () => {
      const result = await service.getTokenMetadata({
        chainId: 137,
        tokenAddress: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      });

      expect(result).toBeDefined();
      expect(result.symbol).toBe('USDC');
      expect(result.chainId).toBe(137);
    });

    it('should handle case-insensitive token addresses', async () => {
      const result1 = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48',
      });

      const result2 = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      expect(result1.symbol).toBe(result2.symbol);
    });
  });

  describe('batchGetMetadata', () => {
    it('should fetch metadata for multiple tokens', async () => {
      const tokens = [
        { chainId: 1, tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }, // USDC
        { chainId: 1, tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7' }, // USDT
      ];

      const results = await service.batchGetMetadata(tokens);

      expect(results.size).toBe(2);
      expect(results.get('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')?.symbol).toBe('USDC');
      expect(results.get('0xdac17f958d2ee523a2206206994597c13d831ec7')?.symbol).toBe('USDT');
    });

    it('should handle mixed known and unknown tokens', async () => {
      const tokens = [
        { chainId: 1, tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' }, // Known: USDC
        { chainId: 1, tokenAddress: '0xunknown1234567890123456789012345678901234' }, // Unknown
      ];

      const results = await service.batchGetMetadata(tokens);

      expect(results.size).toBe(2);
      expect(results.get('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')?.symbol).toBe('USDC');
      expect(results.get('0xunknown1234567890123456789012345678901234')?.symbol).toBe('UNKNOWN');
    });
  });

  describe('cache operations', () => {
    it('should clear cache correctly', async () => {
      await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      const statsBefore = service.getCacheStats();
      expect(statsBefore.size).toBeGreaterThan(0);

      service.clearCache();

      const statsAfter = service.getCacheStats();
      expect(statsAfter.size).toBe(0);
    });

    it('should return cache statistics', async () => {
      await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      });

      const stats = service.getCacheStats();

      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hits');
    });
  });

  describe('external API integration', () => {
    it('should fetch from CoinGecko for unknown tokens', async () => {
      const mockCoinGeckoResponse = {
        name: 'Mock Token',
        symbol: 'MOCK',
        image: {
          small: 'https://example.com/logo.png',
          large: 'https://example.com/logo.png',
        },
        detail_platforms: {
          ethereum: {
            decimal_place: 18,
          },
        },
        market_data: {
          current_price: {
            usd: 1.5,
          },
          market_cap: {
            usd: 1000000,
          },
        },
        last_updated: '2024-01-15T10:30:00.000Z',
      };

      mockHttpService.axiosRef.get.mockResolvedValueOnce({
        data: mockCoinGeckoResponse,
      });

      const result = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xmock1234567890123456789012345678901234567',
      });

      expect(result.name).toBe('Mock Token');
      expect(result.symbol).toBe('MOCK');
      expect(result.logoUrl).toBe('https://example.com/logo.png');
    });

    it('should handle CoinGecko 404 gracefully', async () => {
      mockHttpService.axiosRef.get.mockRejectedValueOnce({
        response: { status: 404 },
      });

      const result = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xmock1234567890123456789012345678901234567',
      });

      // Should fall back to default metadata
      expect(result.name).toBe('Unknown Token');
    });

    it('should handle network errors gracefully', async () => {
      mockHttpService.axiosRef.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.getTokenMetadata({
        chainId: 1,
        tokenAddress: '0xmock1234567890123456789012345678901234567',
      });

      // Should fall back to default metadata
      expect(result.name).toBe('Unknown Token');
    });
  });

  describe('supported chains', () => {
    it('should support Arbitrum', async () => {
      const result = await service.getTokenMetadata({
        chainId: 42161,
        tokenAddress: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
      });

      expect(result).toBeDefined();
      expect(result.symbol).toBe('USDC');
    });

    it('should support Optimism', async () => {
      const result = await service.getTokenMetadata({
        chainId: 10,
        tokenAddress: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      });

      expect(result).toBeDefined();
      expect(result.symbol).toBe('USDC');
    });

    it('should support Avalanche', async () => {
      const result = await service.getTokenMetadata({
        chainId: 43114,
        tokenAddress: '0xb97ef9ef8734c71904d8002f8b6bc99dd83774d0',
      });

      expect(result).toBeDefined();
      expect(result.symbol).toBe('USDC');
    });

    it('should support BSC', async () => {
      const result = await service.getTokenMetadata({
        chainId: 56,
        tokenAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
      });

      expect(result).toBeDefined();
      expect(result.symbol).toBe('USDC');
    });
  });
});