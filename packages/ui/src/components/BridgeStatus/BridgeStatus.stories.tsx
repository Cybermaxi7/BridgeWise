import type { Meta, StoryObj } from '@storybook/react';
import { BridgeStatus } from './BridgeStatus';

const meta: Meta<typeof BridgeStatus> = {
  title: 'Components/BridgeStatus',
  component: BridgeStatus,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    txHash: {
      control: 'text',
      description: 'Transaction hash for tracking',
    },
    bridgeName: {
      control: 'select',
      options: ['hop', 'layerzero', 'stellar', 'polygon'],
      description: 'Name of the bridge provider',
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
    amount: {
      control: 'number',
      description: 'Amount being transferred',
    },
    token: {
      control: 'text',
      description: 'Token symbol being transferred',
    },
    fee: {
      control: 'number',
      description: 'Optional transaction fee',
    },
    slippagePercent: {
      control: 'number',
      description: 'Optional slippage percentage',
    },
    estimatedTimeSeconds: {
      control: 'number',
      description: 'Estimated completion time in seconds',
    },
    detailed: {
      control: 'boolean',
      description: 'Whether to show detailed view with fees and slippage',
    },
    compact: {
      control: 'boolean',
      description: 'Whether to show compact/minimal view',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    txHash: '0x1234567890abcdef1234567890abcdef12345678',
    bridgeName: 'hop',
    sourceChain: 'ethereum',
    destinationChain: 'polygon',
    amount: 100,
    token: 'USDC',
    fee: 2.5,
    slippagePercent: 0.5,
    estimatedTimeSeconds: 120,
  },
};

// Pending transaction
export const Pending: Story = {
  args: {
    txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
    bridgeName: 'layerzero',
    sourceChain: 'ethereum',
    destinationChain: 'arbitrum',
    amount: 50,
    token: 'ETH',
    fee: 0.01,
    estimatedTimeSeconds: 180,
  },
};

// Confirmed transaction
export const Confirmed: Story = {
  args: {
    txHash: '0x7890abcdef1234567890abcdef1234567890abcd',
    bridgeName: 'stellar',
    sourceChain: 'stellar',
    destinationChain: 'ethereum',
    amount: 1000,
    token: 'XLM',
    destinationToken: 'USDC',
    fee: 0.1,
    estimatedTimeSeconds: 30,
  },
};

// Failed transaction
export const Failed: Story = {
  args: {
    txHash: '0x34567890abcdef1234567890abcdef1234567890',
    bridgeName: 'hop',
    sourceChain: 'polygon',
    destinationChain: 'optimism',
    amount: 200,
    token: 'USDT',
    fee: 5.0,
    slippagePercent: 2.5,
    estimatedTimeSeconds: 90,
  },
};

// Detailed view
export const Detailed: Story = {
  args: {
    txHash: '0x567890abcdef1234567890abcdef1234567890ab',
    bridgeName: 'layerzero',
    sourceChain: 'base',
    destinationChain: 'ethereum',
    amount: 75,
    token: 'ARB',
    fee: 1.2,
    slippagePercent: 1.2,
    estimatedTimeSeconds: 150,
    detailed: true,
  },
};

// Compact view
export const Compact: Story = {
  args: {
    txHash: '0x90abcdef1234567890abcdef1234567890abcdef',
    bridgeName: 'hop',
    sourceChain: 'optimism',
    destinationChain: 'base',
    amount: 500,
    token: 'OP',
    fee: 0.8,
    estimatedTimeSeconds: 60,
    compact: true,
  },
};

// High slippage warning
export const HighSlippage: Story = {
  args: {
    txHash: '0x234567890abcdef1234567890abcdef12345678',
    bridgeName: 'stellar',
    sourceChain: 'ethereum',
    destinationChain: 'stellar',
    amount: 25,
    token: 'USDC',
    fee: 3.0,
    slippagePercent: 3.5,
    estimatedTimeSeconds: 200,
    detailed: true,
  },
};
