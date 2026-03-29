
'use client';

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BridgeWiseProvider,
  TransactionHeartbeat,
  useTransaction,
  BridgeStatus,
} from '@bridgewise/ui-components';
import VersionDisplay from '../components/VersionDisplay';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

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
  const { state, updateState, startTransaction, clearState } = useTransaction();

  // Simulate progress
  useEffect(() => {
    if (state.status !== 'pending') return;

    const interval = setInterval(() => {
      if (state.progress >= 100) {
        updateState({ status: 'success', progress: 100, step: 'Transfer Complete!' });
        clearInterval(interval);
        return;
      }

      let nextProgress = state.progress + 5;
      let nextStep = state.step;

      if (nextProgress > 20 && nextProgress < 40) nextStep = t('app.statusConfirming');
      if (nextProgress > 50 && nextProgress < 70) nextStep = t('app.statusBridging');
      if (nextProgress > 80) nextStep = t('app.statusFinalizing');

      updateState({ progress: Math.min(nextProgress, 100), step: nextStep });
    }, 800);

    return () => clearInterval(interval);
  }, [state, updateState, t]);

  const { t } = useTranslation();

  return (
    <BridgeWiseProvider theme={customTheme} defaultMode="dark">
      <div className="flex min-h-screen flex-col items-center justify-center gap-12 p-10 bg-zinc-50 dark:bg-black">
        <main className="flex flex-col items-center gap-8 max-w-3xl">
          <LanguageSwitcher />
          <h1 className="text-4xl font-bold text-center text-zinc-900 dark:text-zinc-100">
            {t('app.title')}
          </h1>

          <p className="max-w-xl text-center text-zinc-600 dark:text-zinc-400">
            {t('app.description')}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => startTransaction('tx-' + Date.now())}
              className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition"
            >
              {t('app.startTransaction')}
            </button>
            <button
              onClick={clearState}
              className="px-6 py-3 rounded-lg text-sm font-medium border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 transition"
            >
              {t('app.clearState')}
            </button>
          </div>

          <section className="grid w-full gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-4 shadow-sm">
              <h2 className="text-lg font-semibold mb-2 text-zinc-900 dark:text-zinc-50">
                {t('app.inlineStatusTitle')}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                {t('app.inlineStatusText')}
              </p>
              <BridgeStatus
                txHash={state.txHash || '0x0000000000000000000000000000000000000000'}
                bridgeName="demo"
                sourceChain="ethereum"
                destinationChain="polygon"
                amount={123.45}
                token="USDC"
                slippagePercent={0.5}
                estimatedTimeSeconds={300}
                detailed
              />
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
            <VersionDisplay 
              showDetails={false}
              enableLogging={true}
              onClick={(v) => console.log('Version clicked:', v)}
            />
          </footer>

          <TransactionHeartbeat className="left-4 right-auto" />
        </main>
      </div>
    </BridgeWiseProvider>
  );
}

export default function Home() {
  return <TransactionDemo />;
}
