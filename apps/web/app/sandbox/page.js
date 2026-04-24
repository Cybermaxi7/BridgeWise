'use client';
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SandboxPage;
const react_1 = __importStar(require("react"));
const useOfflineDetection_1 = require("../../hooks/useOfflineDetection");
// ─── Testnet configuration ──────────────────────────────────────────────────
const TESTNETS = [
    { id: 'goerli', name: 'Goerli (Ethereum testnet)', chainId: 5 },
    { id: 'mumbai', name: 'Mumbai (Polygon testnet)', chainId: 80001 },
    { id: 'fuji', name: 'Fuji (Avalanche testnet)', chainId: 43113 },
    { id: 'bsc-testnet', name: 'BSC Testnet', chainId: 97 },
];
// ─── Sample demo bridge flows ────────────────────────────────────────────────
const DEMO_FLOWS = [
    {
        id: 'usdc-eth-to-polygon',
        label: 'USDC: Goerli → Mumbai',
        sourceChain: 'goerli',
        destChain: 'mumbai',
        token: 'USDC',
        amount: '100',
        estimatedFee: '$0.12',
        estimatedTime: '~2 min',
        bridge: 'Across Protocol (testnet)',
    },
    {
        id: 'eth-to-avax',
        label: 'ETH: Goerli → Fuji',
        sourceChain: 'goerli',
        destChain: 'fuji',
        token: 'ETH',
        amount: '0.05',
        estimatedFee: '$0.08',
        estimatedTime: '~3 min',
        bridge: 'LayerZero (testnet)',
    },
    {
        id: 'bnb-to-polygon',
        label: 'BNB: BSC Testnet → Mumbai',
        sourceChain: 'bsc-testnet',
        destChain: 'mumbai',
        token: 'BNB',
        amount: '1',
        estimatedFee: '$0.05',
        estimatedTime: '~5 min',
        bridge: 'Stargate (testnet)',
    },
];
// ─── Component ───────────────────────────────────────────────────────────────
function SandboxPage() {
    const { isOffline } = (0, useOfflineDetection_1.useOfflineDetection)();
    const [activeFlow, setActiveFlow] = (0, react_1.useState)(null);
    const [flowStates, setFlowStates] = (0, react_1.useState)({});
    function updateFlow(id, updates) {
        setFlowStates((prev) => ({
            ...prev,
            [id]: { ...prev[id], ...updates },
        }));
    }
    function runFlow(flowId) {
        if (isOffline)
            return;
        setActiveFlow(flowId);
        updateFlow(flowId, { status: 'running', progress: 0, step: 'Initializing…', txHash: undefined });
        const steps = [
            { pct: 15, label: 'Approving token spend…' },
            { pct: 35, label: 'Submitting bridge transaction…' },
            { pct: 55, label: 'Waiting for source confirmation…' },
            { pct: 75, label: 'Relaying to destination chain…' },
            { pct: 90, label: 'Finalizing transfer…' },
            { pct: 100, label: 'Complete!' },
        ];
        let idx = 0;
        const tick = setInterval(() => {
            if (idx >= steps.length) {
                clearInterval(tick);
                const hash = '0x' + Math.random().toString(16).slice(2, 66);
                updateFlow(flowId, { status: 'success', progress: 100, step: 'Complete!', txHash: hash });
                setActiveFlow(null);
                return;
            }
            const s = steps[idx++];
            updateFlow(flowId, { progress: s.pct, step: s.label });
        }, 900);
    }
    function resetFlow(flowId) {
        setFlowStates((prev) => {
            const next = { ...prev };
            delete next[flowId];
            return next;
        });
    }
    return (<div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-10">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/40">
            SANDBOX
          </span>
          <span className="text-xs text-zinc-500">Testnet only — no real funds</span>
        </div>
        <h1 className="text-3xl font-bold mb-3">Dev Sandbox &amp; Demo Environment</h1>
        <p className="text-zinc-400 max-w-2xl">
          Test BridgeWise integrations safely using testnets. Run sample bridge flows,
          inspect transaction states, and verify your integration without touching mainnet assets.
        </p>
        {isOffline && (<p className="mt-4 text-sm text-yellow-400 bg-yellow-400/10 rounded-lg px-4 py-2 inline-block">
            You are offline. Demo flows are disabled until connection is restored.
          </p>)}
      </div>

      <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
        {/* Supported Testnets */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Supported Testnets</h2>
          <ul className="space-y-2">
            {TESTNETS.map((net) => (<li key={net.id} className="flex items-center justify-between rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm">
                <span className="font-medium text-zinc-100">{net.name}</span>
                <span className="font-mono text-zinc-500 text-xs">chainId: {net.chainId}</span>
              </li>))}
          </ul>
        </section>

        {/* Demo Flows */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-zinc-200">Sample Bridge Flows</h2>
          <ul className="space-y-4">
            {DEMO_FLOWS.map((flow) => {
            const state = flowStates[flow.id];
            const isRunning = state?.status === 'running';
            const isDone = state?.status === 'success' || state?.status === 'failed';
            return (<li key={flow.id} className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-zinc-100">{flow.label}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{flow.bridge}</p>
                    </div>
                    <span className="text-xs bg-zinc-800 rounded px-2 py-1 text-zinc-400 font-mono">
                      {flow.amount} {flow.token}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex gap-4 text-xs text-zinc-500 mb-3">
                    <span>Fee: {flow.estimatedFee}</span>
                    <span>Time: {flow.estimatedTime}</span>
                  </div>

                  {/* Progress */}
                  {(isRunning || isDone) && state && (<div className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-zinc-400">{state.step}</span>
                        <span className="text-zinc-500">{state.progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all duration-500 ${state.status === 'success'
                        ? 'bg-emerald-500'
                        : state.status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-blue-500'}`} style={{ width: `${state.progress}%` }}/>
                      </div>
                      {state.txHash && (<p className="mt-1 text-xs text-zinc-500 font-mono truncate">
                          tx: {state.txHash}
                        </p>)}
                    </div>)}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!isRunning && !isDone && (<button disabled={isOffline || activeFlow !== null} onClick={() => runFlow(flow.id)} className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 text-xs font-medium text-white transition-colors">
                        Run Flow
                      </button>)}
                    {isRunning && (<span className="flex-1 text-center text-xs text-blue-400 py-1.5 animate-pulse">
                        Running…
                      </span>)}
                    {isDone && (<>
                        <span className={`text-xs font-medium py-1.5 ${state.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {state.status === 'success' ? 'Success' : 'Failed'}
                        </span>
                        <button onClick={() => resetFlow(flow.id)} className="ml-auto rounded-lg bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors">
                          Reset
                        </button>
                      </>)}
                  </div>
                </li>);
        })}
          </ul>
        </section>
      </div>

      {/* Setup instructions */}
      <div className="max-w-4xl mx-auto mt-12 rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-lg font-semibold mb-3 text-zinc-200">Sandbox Setup</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-400">
          <li>
            Set <code className="bg-zinc-800 px-1 rounded text-zinc-300">BRIDGE_ENV=testnet</code> in
            your <code className="bg-zinc-800 px-1 rounded text-zinc-300">.env.local</code>.
          </li>
          <li>
            Connect a wallet to one of the supported testnets above and fund it via a faucet.
          </li>
          <li>Click <strong className="text-zinc-300">Run Flow</strong> on any demo flow to simulate an end-to-end bridge.</li>
          <li>Inspect transaction state changes in the BridgeStatus heartbeat (bottom of page).</li>
        </ol>
      </div>
    </div>);
}
//# sourceMappingURL=page.js.map