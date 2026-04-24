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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const dynamic_1 = __importDefault(require("next/dynamic"));
const react_1 = require("react");
const react_i18next_1 = require("react-i18next");
const ui_components_1 = require("@bridgewise/ui-components");
const TransactionHeartbeat = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require('@bridgewise/ui-components'))).then(m => m.TransactionHeartbeat), { ssr: false });
const BridgeStatus = (0, dynamic_1.default)(() => Promise.resolve().then(() => __importStar(require('@bridgewise/ui-components'))).then(m => m.BridgeStatus), { ssr: false });
const VersionDisplay_1 = __importDefault(require("../components/VersionDisplay"));
const LanguageSwitcher_1 = require("../components/LanguageSwitcher");
const customTheme = {
    primaryColor: '#22c55e',
    secondaryColor: '#0f172a',
    backgroundColor: '#020617',
    textColor: '#e5e7eb',
    borderRadius: '16px',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    spacingUnit: '0.9rem',
};
function TransactionDemo() {
    const { t } = (0, react_i18next_1.useTranslation)();
    const { state, updateState, startTransaction, clearState, executeBatch } = (0, ui_components_1.useTransaction)();
    const [batchResult, setBatchResult] = (0, react_1.useState)(null);
    // Simulate progress
    (0, react_1.useEffect)(() => {
        if (state.status !== 'pending')
            return;
        const interval = setInterval(() => {
            if (state.progress >= 100) {
                updateState({ status: 'success', progress: 100, step: 'Transfer Complete!' });
                clearInterval(interval);
                return;
            }
            let nextProgress = state.progress + 5;
            let nextStep = state.step;
            if (nextProgress > 20 && nextProgress < 40)
                nextStep = t('app.statusConfirming');
            if (nextProgress > 50 && nextProgress < 70)
                nextStep = t('app.statusBridging');
            if (nextProgress > 80)
                nextStep = t('app.statusFinalizing');
            updateState({ progress: Math.min(nextProgress, 100), step: nextStep });
        }, 800);
        return () => clearInterval(interval);
    }, [state, updateState, t]);
    return (<ui_components_1.BridgeWiseProvider theme={customTheme} defaultMode="dark">
      <div className="flex min-h-screen flex-col items-center justify-center gap-12 p-10 bg-zinc-50 dark:bg-black">
        <main className="flex flex-col items-center gap-8 max-w-3xl">
          <LanguageSwitcher_1.LanguageSwitcher />
          <h1 className="text-4xl font-bold text-center text-zinc-900 dark:text-zinc-100">
            {t('app.title')}
          </h1>

          <p className="max-w-xl text-center text-zinc-600 dark:text-zinc-400">
            {t('app.description')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button onClick={() => startTransaction('tx-' + Date.now())} className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition">
              {t('app.startTransaction')}
            </button>
            <button onClick={clearState} className="px-6 py-3 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition">
              {t('app.clearState')}
            </button>
            <button onClick={async () => {
            const result = await executeBatch([
                {
                    id: `batch-${Date.now()}-1`,
                    bridgeName: 'demo',
                    sourceChain: 'ethereum',
                    destinationChain: 'polygon',
                    sourceToken: 'ETH',
                    destinationToken: 'USDC',
                    amount: 1.23,
                    fee: 0.02,
                    slippagePercent: 0.5,
                    account: '0x000',
                    txHash: `0x${Math.random().toString(16).slice(2)}1`,
                },
                {
                    id: `batch-${Date.now()}-2`,
                    bridgeName: 'demo',
                    sourceChain: 'polygon',
                    destinationChain: 'ethereum',
                    sourceToken: 'USDC',
                    destinationToken: 'ETH',
                    amount: 10.5,
                    fee: 0.1,
                    slippagePercent: 0.5,
                    account: '0x000',
                    txHash: `0x${Math.random().toString(16).slice(2)}2`,
                },
                {
                    id: `batch-${Date.now()}-3`,
                    bridgeName: 'demo',
                    sourceChain: 'avax',
                    destinationChain: 'optimism',
                    sourceToken: 'USDC',
                    destinationToken: 'DAI',
                    amount: 50,
                    fee: 0.25,
                    slippagePercent: 0.5,
                    account: '0x000',
                    txHash: `0x${Math.random().toString(16).slice(2)}3`,
                },
            ]);
            setBatchResult(result.results);
        }} className="px-6 py-3 rounded-lg text-sm font-medium border border-blue-300 text-blue-700 dark:border-blue-500 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 active:scale-95 transition">
              Run Batch (3)
            </button>
          </div>

          {batchResult && (<div className="w-full rounded-lg border border-slate-300 bg-slate-50 p-4 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <h3 className="font-semibold mb-2">Batch result</h3>
              <ul className="space-y-1">
                {batchResult.map((item) => (<li key={item.id} className="flex justify-between">
                    <span>{item.id}</span>
                    <span>
                      {item.success ? '✅ success' : '❌ failed'}
                      {item.error ? `: ${item.error}` : ''}
                    </span>
                  </li>))}
              </ul>
            </div>)}

          <section className="grid w-full gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                {t('app.inlineStatusTitle')}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {t('app.inlineStatusText')}
              </p>
              <BridgeStatus txHash={state.txHash || '0x0000000000000000000000000000000000000000'} bridgeName="demo" sourceChain="ethereum" destinationChain="polygon" amount={123.45} token="USDC" slippagePercent={0.5} estimatedTimeSeconds={300} detailed/>
            </div>

            <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                {t('app.componentOverridesTitle')}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {t('app.componentOverridesText')}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {t('app.componentOverridesHint')}
              </p>
            </div>
          </section>

          {/* SDK Version Display */}
          <footer className="w-full flex justify-center mt-8">
            <VersionDisplay_1.default showDetails={false} enableLogging={true} onClick={(v) => console.log('Version clicked:', v)}/>
          </footer>

          <TransactionHeartbeat className="left-4 right-auto"/>
        </main>
      </div>
    </ui_components_1.BridgeWiseProvider>);
}
function Home() {
    return <TransactionDemo />;
}
//# sourceMappingURL=page.js.map