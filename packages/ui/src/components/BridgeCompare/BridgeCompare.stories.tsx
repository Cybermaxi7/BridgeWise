import type { Meta, StoryObj } from '@storybook/react';
import BridgeCompare from './BridgeCompare';

const meta: Meta<typeof BridgeCompare> = {
  title: 'Components/BridgeCompare',
  component: BridgeCompare,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    routes: {
      control: 'object',
      description: 'Array of bridge routes to compare',
    },
    token: {
      control: 'text',
      description: 'Token symbol being transferred',
    },
    sourceChain: {
      control: 'select',
      options: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'stellar'],
      description: 'Source chain identifier',
    },
    destinationChain: {
      control: 'select',
      options: ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base', 'stellar'],
      description: 'Destination chain identifier',
    },
    gasEstimateApiBaseUrl: {
      control: 'text',
      description: 'Base URL for gas estimate API',
    },
    showBenchmarkComparison: {
      control: 'boolean',
      description: 'Whether to show benchmark comparison',
    },
    minLiquidityThreshold: {
      control: 'number',
      description: 'Minimum liquidity threshold for route filtering',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample routes data
const sampleRoutes = [
  {
    id: 'hop-eth-to-polygon',
    name: 'Hop Protocol',
    provider: 'hop',
    fee: 2.5,
    estimatedTime: 120,
    liquidity: 1000000,
    reliability: 0.95,
    slippage: 0.1,
  },
  {
    id: 'layerzero-eth-to-polygon',
    name: 'LayerZero',
    provider: 'layerzero',
    fee: 3.0,
    estimatedTime: 180,
    liquidity: 800000,
    reliability: 0.92,
    slippage: 0.15,
  },
  {
    id: 'stellar-eth-to-polygon',
    name: 'Stellar Bridge',
    provider: 'stellar',
    fee: 1.8,
    estimatedTime: 300,
    liquidity: 500000,
    reliability: 0.88,
    slippage: 0.2,
  },
];

// Default comparison
export const Default: Story = {
  args: {
    routes: sampleRoutes,
    token: 'USDC',
    sourceChain: 'ethereum',
    destinationChain: 'polygon',
    showBenchmarkComparison: true,
    minLiquidityThreshold: 100000,
  },
};

// ETH to Arbitrum
export const EthToArbitrum: Story = {
  args: {
    routes: sampleRoutes.map(route => ({
      ...route,
      id: `${route.provider}-eth-to-arbitrum`,
      fee: route.fee * 1.2,
      estimatedTime: route.estimatedTime * 1.1,
    })),
    token: 'ETH',
    sourceChain: 'ethereum',
    destinationChain: 'arbitrum',
    showBenchmarkComparison: true,
    minLiquidityThreshold: 50000,
  },
};

// Without benchmark
export const WithoutBenchmark: Story = {
  args: {
    routes: sampleRoutes,
    token: 'USDT',
    sourceChain: 'polygon',
    destinationChain: 'optimism',
    showBenchmarkComparison: false,
    minLiquidityThreshold: 200000,
  },
};

// High liquidity threshold
export const HighLiquidityThreshold: Story = {
  args: {
    routes: sampleRoutes,
    token: 'ARB',
    sourceChain: 'base',
    destinationChain: 'ethereum',
    showBenchmarkComparison: true,
    minLiquidityThreshold: 900000,
  },
};

// Single route
export const SingleRoute: Story = {
  args: {
    routes: [sampleRoutes[0]],
    token: 'OP',
    sourceChain: 'optimism',
    destinationChain: 'base',
    showBenchmarkComparison: true,
    minLiquidityThreshold: 0,
  },
};
