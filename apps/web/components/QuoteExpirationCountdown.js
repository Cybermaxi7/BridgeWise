"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuoteExpirationCountdown = QuoteExpirationCountdown;
const react_1 = require("react");
function getStatus(secondsLeft) {
    if (secondsLeft <= 0)
        return "expired";
    if (secondsLeft <= 10)
        return "critical";
    if (secondsLeft <= 30)
        return "warning";
    return "healthy";
}
function formatTime(seconds) {
    if (seconds <= 0)
        return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
function QuoteExpirationCountdown({ expiresAt, onExpire, onRefresh, className = "", }) {
    const getSecondsLeft = (0, react_1.useCallback)(() => {
        const expiry = new Date(expiresAt).getTime();
        return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
    }, [expiresAt]);
    const [secondsLeft, setSecondsLeft] = (0, react_1.useState)(getSecondsLeft);
    const status = getStatus(secondsLeft);
    (0, react_1.useEffect)(() => {
        setSecondsLeft(getSecondsLeft());
        const interval = setInterval(() => {
            const s = getSecondsLeft();
            setSecondsLeft(s);
            if (s <= 0) {
                clearInterval(interval);
                onExpire?.();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [expiresAt, getSecondsLeft, onExpire]);
    const statusConfig = {
        healthy: {
            label: "Quote valid",
            color: "bw-countdown--healthy",
            icon: "✓",
        },
        warning: {
            label: "Expiring soon",
            color: "bw-countdown--warning",
            icon: "⚠",
        },
        critical: {
            label: "Expiring now",
            color: "bw-countdown--critical",
            icon: "!",
        },
        expired: {
            label: "Quote expired",
            color: "bw-countdown--expired",
            icon: "✕",
        },
    };
    const cfg = statusConfig[status];
    const progress = status === "expired"
        ? 0
        : Math.min(1, secondsLeft / Math.max(1, getSecondsLeft() + 1));
    return (<>
      <style>{`
        .bw-countdown {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: 10px;
          border: 1.5px solid currentColor;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          background: transparent;
        }
        .bw-countdown__progress {
          position: absolute;
          inset: 0;
          transform-origin: left;
          opacity: 0.08;
          transition: transform 1s linear, background 0.3s;
        }
        .bw-countdown__icon {
          font-style: normal;
          font-size: 11px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid currentColor;
          flex-shrink: 0;
        }
        .bw-countdown__time {
          font-size: 15px;
          font-variant-numeric: tabular-nums;
          min-width: 42px;
        }
        .bw-countdown__label {
          font-family: system-ui, sans-serif;
          font-size: 11px;
          font-weight: 500;
          opacity: 0.75;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .bw-countdown__refresh {
          background: none;
          border: none;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 5px;
          font-size: 13px;
          opacity: 0.6;
          transition: opacity 0.2s;
          color: inherit;
          margin-left: 2px;
        }
        .bw-countdown__refresh:hover { opacity: 1; }

        /* Status colours */
        .bw-countdown--healthy {
          color: #16a34a;
          border-color: #16a34a44;
        }
        .bw-countdown--healthy .bw-countdown__progress { background: #16a34a; }

        .bw-countdown--warning {
          color: #d97706;
          border-color: #d9770644;
        }
        .bw-countdown--warning .bw-countdown__progress { background: #d97706; }

        .bw-countdown--critical {
          color: #dc2626;
          border-color: #dc262644;
          animation: bw-pulse 0.8s ease-in-out infinite alternate;
        }
        .bw-countdown--critical .bw-countdown__progress { background: #dc2626; }

        .bw-countdown--expired {
          color: #6b7280;
          border-color: #6b728044;
        }
        .bw-countdown--expired .bw-countdown__progress { background: #6b7280; }

        @keyframes bw-pulse {
          from { border-color: #dc262644; }
          to   { border-color: #dc2626cc; }
        }
      `}</style>
      <div className={`bw-countdown ${cfg.color} ${className}`} role="timer" aria-live="polite" aria-label={`${cfg.label}: ${formatTime(secondsLeft)}`}>
        <div className="bw-countdown__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true"/>
        <span className="bw-countdown__icon" aria-hidden="true">{cfg.icon}</span>
        <span className="bw-countdown__time">{formatTime(secondsLeft)}</span>
        <span className="bw-countdown__label">{cfg.label}</span>
        {(status === "expired" || status === "critical") && onRefresh && (<button className="bw-countdown__refresh" onClick={onRefresh} title="Refresh quote" aria-label="Refresh quote">
            ↺
          </button>)}
      </div>
    </>);
}
exports.default = QuoteExpirationCountdown;
//# sourceMappingURL=QuoteExpirationCountdown.js.map