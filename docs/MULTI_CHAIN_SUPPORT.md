# Multi-Chain Support Implementation

## Overview
BridgeWise now supports multiple EVM-compatible chains including Ethereum, Polygon, BSC, Arbitrum, Optimism, and Base, plus Stellar network.

## Supported Chains

### EVM Chains

| Chain | Chain ID | Symbol | RPC URL | Explorer |
|-------|----------|--------|---------|----------|
| **Ethereum** | 1 | ETH | `RPC_ETHEREUM` env | https://etherscan.io |
| **Polygon** | 137 | MATIC | `RPC_POLYGON` env | https://polygonscan.com |
| **BSC** | 56 | BNB | `RPC_BSC` env | https://bscscan.com |
| **Arbitrum One** | 42161 | ETH | `RPC_ARBITRUM` env | https://arbiscan.io |
| **Optimism** | 10 | ETH | `RPC_OPTIMISM` env | https://optimistic.etherscan.io |
| **Base** | 8453 | ETH | `RPC_BASE` env | https://basescan.org |

### Non-EVM Chains

| Chain | Symbol | Network | Explorer |
|-------|--------|---------|----------|
| **Stellar** | XLM | Public | https://stellarscan.io |

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# RPC Endpoints (required)
RPC_ETHEREUM=https://eth.llamarpc.com
RPC_POLYGON=https://polygon-rpc.com
RPC_BSC=https://bsc-dataseed.binance.org
RPC_ARBITRUM=https://arb1.arbitrum.io/rpc
RPC_OPTIMISM=https://mainnet.optimism.io
RPC_BASE=https://mainnet.base.org
```

### Programmatic Configuration

```typescript
import { 
  getChainById, 
  EVM_CHAINS, 
  isValidBridgePair,
  getTransactionExplorerUrl 
} from '@bridgewise/api/config';

// Get chain configuration
const baseChain = getChainById('base');
console.log(baseChain?.name); // "Base"
console.log(baseChain?.chainId); // 8453
console.log(baseChain?.rpcUrl); // From env or default

// Validate bridge pair
const validation = isValidBridgePair('ethereum', 'base');
if (validation.valid) {
  console.log('Bridge pair is supported');
} else {
  console.error(validation.error);
}

// Get explorer URL
const txUrl = getTransactionExplorerUrl('base', '0x...');
console.log(txUrl); // https://basescan.org/tx/0x...
```

## Features by Chain

All supported chains include:

✅ **Cross-chain bridging** - Transfer tokens between chains
✅ **Real-time quotes** - Get live bridge rates
✅ **Fee estimation** - Accurate gas and bridge fees
✅ **Transaction tracking** - Monitor transfer status
✅ **Address validation** - Prevent invalid destinations

## Integration Examples

### Frontend Hook Usage

```typescript
import { useBridgeQuotes } from '@bridgewise/ui-components';

function BridgeForm() {
  const { quotes, updateParams } = useBridgeQuotes({
    initialParams: {
      amount: '100',
      sourceChain: 'ethereum',
      destinationChain: 'base', // New!
      sourceToken: 'USDC',
      destinationToken: 'USDC',
    },
  });

  return (
    <div>
      <select onChange={(e) => updateParams({ 
        destinationChain: e.target.value 
      })}>
        <option value="base">Base</option>
        <option value="arbitrum">Arbitrum</option>
        <option value="optimism">Optimism</option>
        {/* ... other chains */}
      </select>
      
      {quotes.map(quote => (
        <div key={quote.id}>
          {quote.bridgeName}: {quote.outputAmount}
        </div>
      ))}
    </div>
  );
}
```

### Backend Validation

```typescript
import { 
  getChainById, 
  isValidBridgePair,
  validateDestinationAddress 
} from '@bridgewise/ui-components';

@Post('transactions')
async createTransaction(@Body() dto: CreateTransactionDto) {
  // Validate chains exist
  const sourceChain = getChainById(dto.sourceChain);
  const destChain = getChainById(dto.destinationChain);
  
  if (!sourceChain || !destChain) {
    throw new BadRequestException('Invalid chain');
  }
  
  // Validate bridge pair
  const pairValidation = isValidBridgePair(
    dto.sourceChain, 
    dto.destinationChain
  );
  
  if (!pairValidation.valid) {
    throw new BadRequestException(pairValidation.error);
  }
  
  // Validate destination address
  const addressValidation = validateDestinationAddress(
    dto.destinationAddress,
    dto.destinationChain
  );
  
  if (!addressValidation.isValid) {
    throw new BadRequestException(addressValidation.errorMessage);
  }
  
  // Proceed with transaction creation...
}
```

## Adding New Chains

### Step 1: Add Environment Variable

In `apps/api/src/config/env-schema.ts`:

```typescript
RPC_NEWCHAIN: {
  name: 'RPC_NEWCHAIN',
  type: 'url',
  required: true,
  description: 'NewChain RPC endpoint URL',
  example: 'https://rpc.newchain.io',
},
```

### Step 2: Add Chain Configuration

In `apps/api/src/config/chains.config.ts`:

```typescript
NEWCHAIN: {
  id: 'newchain',
  name: 'NewChain',
  symbol: 'NCN',
  chainId: 9999,
  rpcUrl: process.env.RPC_NEWCHAIN || 'https://rpc.newchain.io',
  explorerUrl: 'https://explorer.newchain.io',
  type: 'EVM',
  features: {
    supportsBridging: true,
    supportsQuotes: true,
    nativeCurrencyDecimals: 18,
  },
},
```

### Step 3: Update Address Validation

In `libs/ui-components/src/address-validation.ts`:

```typescript
const evmChains = [
  // ... existing chains
  'newchain', // Add here
];
```

### Step 4: Test

```typescript
// Test chain configuration
const chain = getChainById('newchain');
expect(chain).toBeDefined();
expect(chain?.chainId).toBe(9999);

// Test bridging
const validation = isValidBridgePair('ethereum', 'newchain');
expect(validation.valid).toBe(true);
```

## Testing

### Unit Tests

```typescript
import { 
  getChainById, 
  EVM_CHAINS, 
  isValidBridgePair 
} from '../chains.config';

describe('Chain Configuration', () => {
  it('should have Base chain configured', () => {
    const base = getChainById('base');
    
    expect(base).toBeDefined();
    expect(base?.chainId).toBe(8453);
    expect(base?.rpcUrl).toContain('base.org');
  });

  it('should validate Ethereum to Base bridge', () => {
    const result = isValidBridgePair('ethereum', 'base');
    expect(result.valid).toBe(true);
  });

  it('should reject same-chain bridge', () => {
    const result = isValidBridgePair('ethereum', 'ethereum');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('must be different');
  });
});
```

### Integration Tests

```typescript
describe('Multi-Chain Bridging', () => {
  it('should fetch quotes for Base chain', async () => {
    const response = await fetch(
      '/api/v1/quotes?' + new URLSearchParams({
        amount: '100',
        sourceChain: 'ethereum',
        destinationChain: 'base',
        sourceToken: 'USDC',
      })
    );
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.quotes).toHaveLength.greaterThan(0);
  });

  it('should create transaction to Optimism', async () => {
    const txData = {
      sourceChain: 'ethereum',
      destinationChain: 'optimism',
      amount: '100',
      destinationAddress: '0x...',
    };
    
    const response = await fetch('/api/v1/transactions', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
    
    expect(response.status).toBe(201);
  });
});
```

## Performance Considerations

### RPC Rate Limits
- Use multiple RPC endpoints with load balancing
- Implement exponential backoff on failures
- Cache chain metadata (not dynamic data)

### Gas Estimation
- Each chain has different gas characteristics
- L2s (Arbitrum, Optimism, Base) have lower fees
- Factor in L1 security costs for L2 bridges

## Security Considerations

1. **Validate Chain IDs**: Always verify numeric chainIds match expected values
2. **RPC Endpoint Security**: Use trusted RPC providers
3. **Bridge Contracts**: Verify bridge contract addresses for each chain
4. **Replay Protection**: Ensure transactions can't be replayed across chains

## Troubleshooting

### Issue: Chain not found
**Solution**: Check chain ID spelling, ensure configuration loaded

### Issue: RPC calls failing
**Solution**: Verify RPC endpoint in .env, check provider rate limits

### Issue: Bridge quotes empty
**Solution**: Verify bridge supports this chain pair, check liquidity

## Future Enhancements

1. **Additional L2s**: Add support for zkSync, Scroll, Linea
2. **Alternative VMs**: Solana, Cosmos SDK chains
3. **Chain-Specific Features**: 
   - Optimism bedrock features
   - Base Coinbase integration
   - Arbitrum nitro features
4. **Auto-Detection**: Detect user's connected chain from wallet

## Related Files

- `apps/api/src/config/chains.config.ts` - Main chain configuration
- `apps/api/src/config/env-schema.ts` - RPC environment variables
- `libs/ui-components/src/address-validation.ts` - Chain-specific validation
- `packages/utils/src/adapters/` - Chain adapters

## Resources

- [Ethereum Chain List](https://chainlist.org/)
- [Base Documentation](https://docs.base.org/)
- [Optimism Docs](https://docs.optimism.io/)
- [Arbitrum Docs](https://docs.arbitrum.io/)
