"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bridge_core_1 = require("@bridgewise/bridge-core");
const stellarProvider = {
    name: 'Stellar',
    apiUrl: 'https://stellar-bridge.example.com/api',
};
const layerZeroProvider = {
    name: 'LayerZero',
    apiUrl: 'https://layerzero-bridge.example.com/api',
};
async function main() {
    console.log('--- Simulating API calls to Stellar ---');
    for (let i = 0; i < 10; i++) {
        console.log(`\nRequest #${i + 1}`);
        const response = await (0, bridge_core_1.callApi)({
            provider: stellarProvider,
            payload: { amount: 100, asset: 'USDC' },
        });
        console.log('Response:', response);
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    console.log('\n--- Simulating API calls to LayerZero ---');
    for (let i = 0; i < 10; i++) {
        console.log(`\nRequest #${i + 1}`);
        const response = await (0, bridge_core_1.callApi)({
            provider: layerZeroProvider,
            payload: { amount: 100, asset: 'USDC' },
        });
        console.log('Response:', response);
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
}
main().catch((error) => {
    console.error('An unexpected error occurred:', error);
});
//# sourceMappingURL=index.js.map