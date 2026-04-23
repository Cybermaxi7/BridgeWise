import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface BridgeQuote {
  bridgeName: string;
  fromChain: number;
  toChain: number;
  token: string;
  inputAmount: number;
  outputAmount: number;
  totalFeeUSD: number;
  estimatedTimeSeconds: number;
  supported: boolean;
  error?: string;
}

export interface BridgeProvider {
  readonly name: string;
  readonly type: 'stellar' | 'evm';
  supportsRoute(fromChain: number, toChain: number, token: string): boolean;
  getQuote(fromChain: number, toChain: number, token: string, amount: number): Promise<BridgeQuote>;
}

@Injectable()
export class StellarBridgeProvider implements BridgeProvider {
  readonly name = 'StellarBridge';
  readonly type = 'stellar' as const;

  private readonly SUPPORTED_ASSETS = ['USDC', 'XLM', 'yXLM'];
  private readonly STELLAR_CHAIN_ID = 1001;

  supportsRoute(fromChain: number, toChain: number, token: string): boolean {
    return (
      (fromChain === this.STELLAR_CHAIN_ID || toChain === this.STELLAR_CHAIN_ID) &&
      this.SUPPORTED_ASSETS.includes(token)
    );
  }

  async getQuote(
    fromChain: number,
    toChain: number,
    token: string,
    amount: number,
  ): Promise<BridgeQuote> {
    if (!this.supportsRoute(fromChain, toChain, token)) {
      return {
        bridgeName: this.name,
        fromChain,
        toChain,
        token,
        inputAmount: amount,
        outputAmount: 0,
        totalFeeUSD: 0,
        estimatedTimeSeconds: 0,
        supported: false,
        error: 'Route not supported',
      };
    }

    const feeRate = 0.0003; // Stellar base fee is very low
    const totalFeeUSD = Math.max(amount * feeRate, 0.001);
    const outputAmount = amount - totalFeeUSD;

    return {
      bridgeName: this.name,
      fromChain,
      toChain,
      token,
      inputAmount: amount,
      outputAmount: parseFloat(outputAmount.toFixed(6)),
      totalFeeUSD: parseFloat(totalFeeUSD.toFixed(4)),
      estimatedTimeSeconds: 5,
      supported: true,
    };
  }
}

@Injectable()
export class EVMBridgeProvider implements BridgeProvider {
  readonly name = 'EVMBridge';
  readonly type = 'evm' as const;

  private readonly SUPPORTED_ROUTES: Array<[number, number, string[]]> = [
    [1, 137, ['USDC', 'USDT', 'WETH', 'DAI']],
    [1, 42161, ['USDC', 'USDT', 'WETH']],
    [1, 10, ['USDC', 'USDT', 'WETH']],
    [137, 42161, ['USDC', 'USDT']],
    [42161, 10, ['USDC', 'ETH']],
    [1, 8453, ['USDC', 'WETH']],
  ];

  supportsRoute(fromChain: number, toChain: number, token: string): boolean {
    return this.SUPPORTED_ROUTES.some(
      ([from, to, tokens]) =>
        from === fromChain && to === toChain && tokens.includes(token),
    );
  }

  async getQuote(
    fromChain: number,
    toChain: number,
    token: string,
    amount: number,
  ): Promise<BridgeQuote> {
    if (!this.supportsRoute(fromChain, toChain, token)) {
      return {
        bridgeName: this.name,
        fromChain,
        toChain,
        token,
        inputAmount: amount,
        outputAmount: 0,
        totalFeeUSD: 0,
        estimatedTimeSeconds: 0,
        supported: false,
        error: 'Route not supported',
      };
    }

    const gasFeeUSD = 2.5;
    const protocolFee = amount * 0.0005;
    const totalFeeUSD = gasFeeUSD + protocolFee;
    const outputAmount = amount - totalFeeUSD;

    return {
      bridgeName: this.name,
      fromChain,
      toChain,
      token,
      inputAmount: amount,
      outputAmount: parseFloat(outputAmount.toFixed(6)),
      totalFeeUSD: parseFloat(totalFeeUSD.toFixed(4)),
      estimatedTimeSeconds: 180,
      supported: true,
    };
  }
}

@Injectable()
export class BridgeProviderService {
  private readonly logger = new Logger(BridgeProviderService.name);
  private readonly providers = new Map<string, BridgeProvider>();

  constructor(
    private readonly stellarProvider: StellarBridgeProvider,
    private readonly evmProvider: EVMBridgeProvider,
  ) {
    this.register(stellarProvider);
    this.register(evmProvider);
  }

  register(provider: BridgeProvider): void {
    this.providers.set(provider.name, provider);
    this.logger.log(`Registered provider: ${provider.name} (${provider.type})`);
  }

  getProvider(name: string): BridgeProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`Bridge provider "${name}" not found`);
    }
    return provider;
  }

  listProviders(): BridgeProvider[] {
    return Array.from(this.providers.values());
  }

  async getQuotesForRoute(
    fromChain: number,
    toChain: number,
    token: string,
    amount: number,
  ): Promise<BridgeQuote[]> {
    const supported = this.listProviders().filter((p) =>
      p.supportsRoute(fromChain, toChain, token),
    );

    const quotes = await Promise.all(
      supported.map((p) => p.getQuote(fromChain, toChain, token, amount)),
    );

    return quotes.filter((q) => q.supported);
  }

  normalize(quotes: BridgeQuote[]): BridgeQuote[] {
    return quotes.sort((a, b) => a.totalFeeUSD - b.totalFeeUSD);
  }
}
