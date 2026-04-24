"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCopyToClipboard = useCopyToClipboard;
exports.CopyButton = CopyButton;
exports.CopyTransactionDetails = CopyTransactionDetails;
const react_1 = require("react");
/**
 * useCopyToClipboard
 *
 * Wraps the Clipboard API with fallback for older browsers.
 * Returns a `copy(text)` function and a `status` state.
 */
function useCopyToClipboard({ resetAfterMs = 2000, } = {}) {
    const [status, setStatus] = (0, react_1.useState)("idle");
    const timerRef = (0, react_1.useRef)(null);
    const reset = (0, react_1.useCallback)(() => setStatus("idle"), []);
    const copy = (0, react_1.useCallback)(async (text) => {
        if (timerRef.current)
            clearTimeout(timerRef.current);
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(text);
            }
            else {
                // Legacy fallback
                const el = document.createElement("textarea");
                el.value = text;
                el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
                document.body.appendChild(el);
                el.select();
                const ok = document.execCommand("copy");
                document.body.removeChild(el);
                if (!ok)
                    throw new Error("execCommand copy failed");
            }
            setStatus("copied");
            timerRef.current = setTimeout(() => setStatus("idle"), resetAfterMs);
            return true;
        }
        catch {
            setStatus("error");
            timerRef.current = setTimeout(() => setStatus("idle"), resetAfterMs);
            return false;
        }
    }, [resetAfterMs]);
    return { copy, status, reset };
}
const SIZE_MAP = {
    sm: { padding: "4px 8px", fontSize: "11px", iconSize: "12px" },
    md: { padding: "6px 12px", fontSize: "13px", iconSize: "14px" },
    lg: { padding: "8px 16px", fontSize: "15px", iconSize: "16px" },
};
/**
 * CopyButton
 *
 * A self-contained button that copies `text` to clipboard and shows
 * visual feedback. Supports icon-only, text-only, and combined variants.
 *
 * @example
 * <CopyButton text={txHash} label="Copy TX hash" variant="full" />
 * <CopyButton text={address} variant="icon" size="sm" />
 */
function CopyButton({ text, label = "Copy", successLabel = "Copied!", size = "md", variant = "full", className = "", }) {
    const { copy, status } = useCopyToClipboard();
    const s = SIZE_MAP[size];
    const isCopied = status === "copied";
    const isError = status === "error";
    return (<>
      <style>{`
        .bw-copy-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1.5px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          font-family: system-ui, -apple-system, sans-serif;
          font-weight: 500;
          line-height: 1;
          transition: all 0.18s ease;
          background: transparent;
          color: #6b7280;
        }
        .bw-copy-btn:hover:not(:disabled) {
          background: #f3f4f6;
          color: #374151;
          border-color: #e5e7eb;
        }
        .bw-copy-btn:active:not(:disabled) { transform: scale(0.96); }
        .bw-copy-btn--copied {
          color: #16a34a !important;
          background: #f0fdf4 !important;
          border-color: #bbf7d0 !important;
        }
        .bw-copy-btn--error {
          color: #dc2626 !important;
          background: #fef2f2 !important;
          border-color: #fecaca !important;
        }
        .bw-copy-btn:disabled { cursor: default; opacity: 0.5; }
        .bw-copy-btn__icon { display: block; flex-shrink: 0; }
      `}</style>
      <button className={[
            "bw-copy-btn",
            isCopied ? "bw-copy-btn--copied" : "",
            isError ? "bw-copy-btn--error" : "",
            className,
        ].join(" ")} style={{ padding: s.padding, fontSize: s.fontSize }} onClick={() => copy(text)} disabled={isCopied} aria-label={isCopied ? successLabel : label} title={isCopied ? successLabel : `${label}: ${text}`}>
        {(variant === "icon" || variant === "full") && (<svg className="bw-copy-btn__icon" style={{ width: s.iconSize, height: s.iconSize }} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {isCopied ? (<path d="M2.5 8l3.5 3.5 7.5-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>) : (<>
                <rect x="5.5" y="5.5" width="8" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10.5 5.5V3.5a1 1 0 00-1-1h-7a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </>)}
          </svg>)}
        {(variant === "text" || variant === "full") && (<span>{isCopied ? successLabel : isError ? "Failed" : label}</span>)}
      </button>
    </>);
}
function isHashOrAddress(value) {
    return /^0x[0-9a-fA-F]{20,}$/.test(value) || value.length > 30;
}
function truncate(value, chars = 8) {
    if (value.length <= chars * 2 + 3)
        return value;
    return `${value.slice(0, chars)}…${value.slice(-chars)}`;
}
/**
 * CopyTransactionDetails
 *
 * Renders a structured list of transaction fields, each with an inline
 * copy button. Supports one-click "Copy all" for the full set.
 *
 * @example
 * <CopyTransactionDetails
 *   title="Transaction Details"
 *   details={[
 *     { label: "TX Hash", value: "0xabc…" },
 *     { label: "From",    value: "0x123…" },
 *     { label: "Amount",  value: "1.5 ETH" },
 *   ]}
 * />
 */
function CopyTransactionDetails({ details, title, className = "", }) {
    const { copy: copyAll, status: copyAllStatus } = useCopyToClipboard();
    const allText = details
        .map((d) => `${d.label}: ${d.value}`)
        .join("\n");
    return (<>
      <style>{`
        .bw-tx-details {
          font-family: system-ui, -apple-system, sans-serif;
          border: 1.5px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          background: #fff;
        }
        .bw-tx-details__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px 10px;
          border-bottom: 1px solid #f3f4f6;
          gap: 8px;
        }
        .bw-tx-details__title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          letter-spacing: 0.01em;
          text-transform: uppercase;
          opacity: 0.6;
        }
        .bw-tx-details__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .bw-tx-details__item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 16px;
          border-bottom: 1px solid #f9fafb;
        }
        .bw-tx-details__item:last-child { border-bottom: none; }
        .bw-tx-details__label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 500;
          flex-shrink: 0;
          min-width: 80px;
        }
        .bw-tx-details__value-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
          flex: 1;
          justify-content: flex-end;
        }
        .bw-tx-details__value {
          font-size: 13px;
          font-weight: 500;
          color: #111827;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
      <div className={`bw-tx-details ${className}`}>
        {(title || details.length > 1) && (<div className="bw-tx-details__header">
            {title && <span className="bw-tx-details__title">{title}</span>}
            {details.length > 1 && (<CopyButton text={allText} label="Copy all" successLabel="Copied!" size="sm" variant="full"/>)}
          </div>)}
        <ul className="bw-tx-details__list">
          {details.map((d, i) => {
            const shouldCopy = d.copyable ?? isHashOrAddress(d.value);
            return (<li key={i} className="bw-tx-details__item">
                <span className="bw-tx-details__label">{d.label}</span>
                <span className="bw-tx-details__value-wrap">
                  <span className="bw-tx-details__value" title={d.value}>
                    {isHashOrAddress(d.value) ? truncate(d.value) : d.value}
                  </span>
                  {shouldCopy && (<CopyButton text={d.value} label={`Copy ${d.label}`} size="sm" variant="icon"/>)}
                </span>
              </li>);
        })}
        </ul>
      </div>
    </>);
}
//# sourceMappingURL=CopyTransactionDetails.js.map