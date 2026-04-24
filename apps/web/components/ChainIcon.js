"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChainIcon = ChainIcon;
const chainIcons_1 = require("./chainIcons");
/**
 * ChainIcon
 *
 * Renders the icon (and optionally name) for a given chain ID.
 *
 * @example
 * <ChainIcon chainId={1} size={24} showName />
 * <ChainIcon chainId={137} size={32} />
 */
function ChainIcon({ chainId, size = 24, showName = false, showTooltip = true, className = "", }) {
    const chain = (0, chainIcons_1.getChainMeta)(chainId);
    return (<>
      <style>{`
        .bw-chain-icon {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          vertical-align: middle;
          position: relative;
        }
        .bw-chain-icon__img {
          display: block;
          flex-shrink: 0;
          border-radius: 50%;
          overflow: hidden;
          line-height: 0;
        }
        .bw-chain-icon__img svg {
          display: block;
          width: 100%;
          height: 100%;
        }
        .bw-chain-icon__name {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 0.875em;
          font-weight: 500;
          color: inherit;
          white-space: nowrap;
        }
        .bw-chain-icon[title]:hover::after {
          content: attr(title);
          position: absolute;
          bottom: calc(100% + 6px);
          left: 50%;
          transform: translateX(-50%);
          background: #1f2937;
          color: #f9fafb;
          font-size: 11px;
          font-family: system-ui, sans-serif;
          white-space: nowrap;
          padding: 3px 8px;
          border-radius: 5px;
          pointer-events: none;
          z-index: 100;
        }
      `}</style>
      <span className={`bw-chain-icon ${className}`} title={showTooltip && !showName ? chain.name : undefined} role="img" aria-label={chain.name}>
        <span className="bw-chain-icon__img" style={{ width: size, height: size }} dangerouslySetInnerHTML={{ __html: chain.svg }}/>
        {showName && (<span className="bw-chain-icon__name">{chain.name}</span>)}
      </span>
    </>);
}
exports.default = ChainIcon;
//# sourceMappingURL=ChainIcon.js.map