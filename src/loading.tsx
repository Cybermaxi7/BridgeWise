/**
 * BridgeWise Loading State System — Issue #132
 * Standardized loading components: Spinner, Skeleton, Overlay, Inline
 */
import React from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoadingSize    = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type LoadingVariant = 'spinner' | 'dots' | 'pulse' | 'skeleton';

interface LoadingBaseProps {
  size?:      LoadingSize;
  label?:     string;
  className?: string;
}

// ─── Size map ─────────────────────────────────────────────────────────────────

const sizeMap: Record<LoadingSize, { spinner: number; dot: number; text: string }> = {
  xs: { spinner: 12, dot: 4,  text: 'text-xs'  },
  sm: { spinner: 16, dot: 5,  text: 'text-sm'  },
  md: { spinner: 24, dot: 6,  text: 'text-sm'  },
  lg: { spinner: 36, dot: 8,  text: 'text-base' },
  xl: { spinner: 48, dot: 10, text: 'text-lg'  },
};

// ─── Spinner ──────────────────────────────────────────────────────────────────

export const Spinner: React.FC<LoadingBaseProps> = ({
  size = 'md', label = 'Loading…', className = '',
}) => {
  const { spinner } = sizeMap[size];
  return (
    <span
      role="status"
      aria-label={label}
      aria-live="polite"
      className={`bw-spinner ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        width={spinner}
        height={spinner}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ animation: 'bw-spin 0.8s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="bw-sr-only">{label}</span>
    </span>
  );
};

// ─── Dots ─────────────────────────────────────────────────────────────────────

export const LoadingDots: React.FC<LoadingBaseProps> = ({
  size = 'md', label = 'Loading…', className = '',
}) => {
  const { dot } = sizeMap[size];
  return (
    <span
      role="status"
      aria-label={label}
      aria-live="polite"
      className={`bw-dots ${className}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: dot / 2 }}
    >
      {[0, 1, 2].map(i => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            width: dot, height: dot,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            animation: `bw-bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <span className="bw-sr-only">{label}</span>
    </span>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?:     string | number;
  height?:    string | number;
  rounded?:   boolean | string;
  className?: string;
  count?:     number;
  gap?:       number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%', height = 16, rounded = false, className = '', count = 1, gap = 8,
}) => {
  const radius = rounded === true ? 9999 : rounded || 4;
  const items  = Array.from({ length: count });
  return (
    <span
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      style={{ display: 'flex', flexDirection: 'column', gap }}
    >
      {items.map((_, i) => (
        <span
          key={i}
          className={`bw-skeleton ${className}`}
          aria-hidden="true"
          style={{
            display: 'block',
            width: i === items.length - 1 && count > 1 ? '70%' : width,
            height,
            borderRadius: radius,
            background: 'var(--bw-skeleton-bg, #e2e8f0)',
            animation: 'bw-shimmer 1.5s ease-in-out infinite',
            backgroundSize: '200% 100%',
          }}
        />
      ))}
    </span>
  );
};

// ─── Skeleton presets ─────────────────────────────────────────────────────────

export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <Skeleton count={lines} height={14} gap={10} />
);

export const SkeletonCard: React.FC = () => (
  <div style={{ padding: 16, borderRadius: 12, border: '1px solid var(--bw-border)', gap: 12, display: 'flex', flexDirection: 'column' }}>
    <Skeleton width={48} height={48} rounded />
    <Skeleton height={16} width="60%" />
    <SkeletonText lines={2} />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5, cols = 4,
}) => (
  <div role="status" aria-label="Loading table data" style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, padding: '8px 0' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={14} width="80%" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 8, padding: '10px 0' }}>
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} height={13} width={c === 0 ? '90%' : '60%'} />
        ))}
      </div>
    ))}
  </div>
);

// ─── Overlay loader ───────────────────────────────────────────────────────────

interface LoadingOverlayProps extends LoadingBaseProps {
  visible:   boolean;
  children?: React.ReactNode;
  blur?:     boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible, children, size = 'lg', label = 'Loading…', blur = true,
}) => (
  <div style={{ position: 'relative', isolation: 'isolate' }}>
    {children}
    {visible && (
      <div
        role="status"
        aria-live="polite"
        aria-label={label}
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.8)',
          backdropFilter: blur ? 'blur(2px)' : undefined,
          borderRadius: 'inherit',
          zIndex: 10,
          animation: 'bw-fade-in 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Spinner size={size} label={label} />
          <span style={{ fontSize: 13, color: 'var(--bw-text-muted)', fontWeight: 500 }}>{label}</span>
        </div>
      </div>
    )}
  </div>
);

// ─── Inline loader (button states) ────────────────────────────────────────────

interface InlineLoaderProps {
  loading:   boolean;
  children:  React.ReactNode;
  size?:     LoadingSize;
  label?:    string;
}

export const InlineLoader: React.FC<InlineLoaderProps> = ({
  loading, children, size = 'sm', label = 'Loading…',
}) => (
  <>
    {loading
      ? <><Spinner size={size} label={label} /><span aria-hidden="true" style={{ marginLeft: 8 }}>{label}</span></>
      : children
    }
  </>
);

// ─── Page-level loading bar ───────────────────────────────────────────────────

export const LoadingBar: React.FC<{ visible: boolean }> = ({ visible }) => (
  <div
    role="progressbar"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label="Page loading"
    aria-hidden={!visible}
    style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 3, zIndex: 9999,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.3s ease',
      background: 'linear-gradient(90deg, var(--bw-accent), var(--bw-accent-light))',
      animation: visible ? 'bw-progress 2s ease-in-out infinite' : 'none',
    }}
  />
);

// ─── CSS keyframes (inject once) ─────────────────────────────────────────────

export function injectLoadingStyles(): void {
  if (document.getElementById('bw-loading-styles')) return;
  const style = document.createElement('style');
  style.id = 'bw-loading-styles';
  style.textContent = `
    @keyframes bw-spin     { to { transform: rotate(360deg); } }
    @keyframes bw-bounce   { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
    @keyframes bw-shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
    @keyframes bw-progress { 0%{width:0%} 50%{width:70%} 100%{width:95%} }
    @keyframes bw-fade-in  { from{opacity:0} to{opacity:1} }
    .bw-skeleton {
      background: linear-gradient(90deg,
        var(--bw-skeleton-bg,#e2e8f0) 25%,
        var(--bw-skeleton-shine,#f8fafc) 50%,
        var(--bw-skeleton-bg,#e2e8f0) 75%
      ) !important;
      background-size: 200% 100% !important;
    }
    .bw-sr-only {
      position:absolute;width:1px;height:1px;padding:0;
      overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
    }
    @media (prefers-reduced-motion: reduce) {
      .bw-spinner svg, .bw-dots span, .bw-skeleton { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}