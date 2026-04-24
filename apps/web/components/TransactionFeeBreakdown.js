'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionFeeBreakdown = TransactionFeeBreakdown;
const react_1 = __importDefault(require("react"));
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatToken(amount, token) {
    return `${amount.toLocaleString('en-US', { maximumFractionDigits: 6 })} ${token}`;
}
function formatUsd(amount) {
    return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function FeeRow({ label, amount, token, tokenPriceUsd, highlight = false, sublabel, }) {
    const usdValue = tokenPriceUsd != null ? amount * tokenPriceUsd : null;
    return (<div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            padding: highlight ? '0.75rem 0 0' : '0.5rem 0',
            borderTop: highlight ? '1px solid rgba(229,231,235,0.12)' : undefined,
            marginTop: highlight ? '0.25rem' : undefined,
        }}>
      {/* Left */}
      <div>
        <span style={{
            fontSize: highlight ? '0.9rem' : '0.825rem',
            fontWeight: highlight ? 600 : 400,
            color: highlight
                ? 'var(--bw-text-color, #e5e7eb)'
                : 'rgba(229,231,235,0.65)',
        }}>
          {label}
        </span>
        {sublabel && (<p style={{
                margin: '0.15rem 0 0',
                fontSize: '0.7rem',
                color: 'rgba(229,231,235,0.35)',
            }}>
            {sublabel}
          </p>)}
      </div>

      {/* Right */}
      <div style={{ textAlign: 'right' }}>
        <span style={{
            fontSize: highlight ? '0.9rem' : '0.825rem',
            fontWeight: highlight ? 600 : 400,
            color: highlight
                ? 'var(--bw-primary-color, #22c55e)'
                : 'var(--bw-text-color, #e5e7eb)',
            fontVariantNumeric: 'tabular-nums',
        }}>
          {formatToken(amount, token)}
        </span>
        {usdValue != null && (<p style={{
                margin: '0.15rem 0 0',
                fontSize: '0.7rem',
                color: 'rgba(229,231,235,0.4)',
                fontVariantNumeric: 'tabular-nums',
            }}>
            ≈ {formatUsd(usdValue)}
          </p>)}
      </div>
    </div>);
}
function SkeletonRow() {
    return (<div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0',
        }}>
      <div style={skeletonStyle(120)}/>
      <div style={skeletonStyle(80)}/>
    </div>);
}
const skeletonStyle = (width) => ({
    height: '0.85rem',
    width,
    borderRadius: '4px',
    background: 'linear-gradient(90deg, rgba(229,231,235,0.08) 25%, rgba(229,231,235,0.14) 50%, rgba(229,231,235,0.08) 75%)',
    backgroundSize: '200% 100%',
    animation: 'bw-skeleton-shimmer 1.5s infinite',
});
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
/**
 * TransactionFeeBreakdown
 *
 * Displays a clear, itemised breakdown of all fees involved in a bridge
 * transaction: bridge protocol fee, estimated gas, optional slippage info,
 * and the total cost. Designed to slot into any BridgeWise UI surface.
 *
 * Usage:
 *   <TransactionFeeBreakdown
 *     bridgeFee={0.5}
 *     gasFee={0.12}
 *     token="USDC"
 *     tokenPriceUsd={1.0}
 *     slippagePercent={0.3}
 *   />
 */
function TransactionFeeBreakdown({ bridgeFee, gasFee, token, tokenPriceUsd, slippagePercent, isLoading = false, className, }) {
    const totalFee = bridgeFee + gasFee;
    return (<>
      {/* Keyframe injection — one-time, idempotent */}
      <style>{`
        @keyframes bw-skeleton-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className={className} style={{
            borderRadius: 'var(--bw-border-radius, 12px)',
            border: '1px solid rgba(229,231,235,0.1)',
            background: 'rgba(229,231,235,0.03)',
            padding: '1rem 1.25rem',
            fontFamily: 'var(--bw-font-family, system-ui, sans-serif)',
        }}>
        {/* Header */}
        <p style={{
            margin: '0 0 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'rgba(229,231,235,0.4)',
        }}>
          Fee Breakdown
        </p>

        {isLoading ? (<>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>) : (<>
            <FeeRow label="Bridge fee" sublabel="Charged by the bridge protocol" amount={bridgeFee} token={token} tokenPriceUsd={tokenPriceUsd}/>

            <FeeRow label="Estimated gas" sublabel="Network execution cost" amount={gasFee} token={token} tokenPriceUsd={tokenPriceUsd}/>

            {slippagePercent != null && (<div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                }}>
                <span style={{
                    fontSize: '0.825rem',
                    color: 'rgba(229,231,235,0.65)',
                }}>
                  Max slippage
                </span>
                <span style={{
                    fontSize: '0.825rem',
                    color: slippagePercent > 1
                        ? 'rgb(251,191,36)'
                        : 'rgba(229,231,235,0.8)',
                    fontVariantNumeric: 'tabular-nums',
                }}>
                  {slippagePercent.toFixed(2)}%
                </span>
              </div>)}

            {/* Total */}
            <FeeRow label="Total fees" amount={totalFee} token={token} tokenPriceUsd={tokenPriceUsd} highlight/>
          </>)}
      </div>
    </>);
}
exports.default = TransactionFeeBreakdown;
//# sourceMappingURL=TransactionFeeBreakdown.js.map