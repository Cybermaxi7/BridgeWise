/**
 * Lazy-loaded versions of heavy UI components.
 *
 * Use these instead of direct imports in pages/layouts so the components
 * are code-split into their own chunks and only downloaded when the page
 * is first rendered in the browser — never during SSR.
 *
 * Usage:
 *   import { LazyBridgeCompare, LazyBridgeStatus } from '@/components/lazy';
 */

import dynamic from 'next/dynamic';
import React from 'react';
import { QuoteSkeleton } from '../ui-lib/skeleton/QuoteSkeleton';
import { BridgeStatusSkeleton } from '../ui-lib/skeleton/BridgeStatusSkeleton';

// ---------------------------------------------------------------------------
// BridgeCompare — shows a grid of three quote skeletons while the JS loads
// ---------------------------------------------------------------------------

function BridgeCompareFallback() {
  return (
    <div className="bridge-compare">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuoteSkeleton />
        <QuoteSkeleton />
        <QuoteSkeleton />
      </div>
    </div>
  );
}

export const LazyBridgeCompare = dynamic(
  () => import('../BridgeCompare').then((mod) => mod.BridgeCompare),
  {
    ssr: false,
    loading: () => <BridgeCompareFallback />,
  },
);

// ---------------------------------------------------------------------------
// BridgeStatus — shows the status skeleton while the JS loads
// ---------------------------------------------------------------------------

export const LazyBridgeStatus = dynamic(
  () => import('../BridgeStatus').then((mod) => mod.BridgeStatus),
  {
    ssr: false,
    loading: () => <BridgeStatusSkeleton />,
  },
);
