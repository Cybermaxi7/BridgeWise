"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenSearchAutocomplete = TokenSearchAutocomplete;
const react_1 = require("react");
function normalize(str) {
    return str.toLowerCase().trim();
}
function scoreToken(token, query) {
    const q = normalize(query);
    const sym = normalize(token.symbol);
    const name = normalize(token.name);
    const addr = normalize(token.address);
    if (sym === q)
        return 100;
    if (sym.startsWith(q))
        return 90;
    if (name.startsWith(q))
        return 80;
    if (sym.includes(q))
        return 70;
    if (name.includes(q))
        return 60;
    if (addr.startsWith(q))
        return 50;
    return 0;
}
function searchTokens(tokens, query) {
    if (!query.trim())
        return tokens.slice(0, 8);
    return tokens
        .map((t) => ({ token: t, score: scoreToken(t, query) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((x) => x.token);
}
function TokenLogo({ token, size = 24 }) {
    const [error, setError] = (0, react_1.useState)(false);
    if (token.logoURI && !error) {
        return (<img src={token.logoURI} alt={token.symbol} width={size} height={size} style={{ borderRadius: "50%", display: "block", flexShrink: 0 }} onError={() => setError(true)}/>);
    }
    return (<span aria-hidden="true" style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: "#374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.36,
            fontWeight: 700,
            color: "#e5e7eb",
            flexShrink: 0,
            fontFamily: "monospace",
        }}>
      {token.symbol.slice(0, 2).toUpperCase()}
    </span>);
}
/**
 * TokenSearchAutocomplete
 *
 * Fuzzy-searches a token list with keyboard navigation, accessible ARIA
 * listbox, and debounced input. Works with any token list compatible with
 * the Token interface (e.g. LiFi, 1inch, or BridgeWise's internal list).
 *
 * @example
 * <TokenSearchAutocomplete
 *   tokens={tokenList}
 *   value={selectedToken}
 *   onChange={setSelectedToken}
 *   placeholder="Search token…"
 * />
 */
function TokenSearchAutocomplete({ tokens, value, onChange, placeholder = "Search token…", disabled = false, className = "", debounceMs = 200, }) {
    const [query, setQuery] = (0, react_1.useState)("");
    const [debouncedQuery, setDebouncedQuery] = (0, react_1.useState)("");
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [activeIndex, setActiveIndex] = (0, react_1.useState)(-1);
    const inputRef = (0, react_1.useRef)(null);
    const listRef = (0, react_1.useRef)(null);
    const containerRef = (0, react_1.useRef)(null);
    const results = searchTokens(tokens, debouncedQuery);
    // Debounce query
    (0, react_1.useEffect)(() => {
        const t = setTimeout(() => setDebouncedQuery(query), debounceMs);
        return () => clearTimeout(t);
    }, [query, debounceMs]);
    // Reset active index when results change
    (0, react_1.useEffect)(() => setActiveIndex(-1), [debouncedQuery]);
    // Close on outside click
    (0, react_1.useEffect)(() => {
        const handler = (e) => {
            if (!containerRef.current?.contains(e.target))
                setIsOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);
    const select = (0, react_1.useCallback)((token) => {
        onChange?.(token);
        setQuery("");
        setIsOpen(false);
        inputRef.current?.blur();
    }, [onChange]);
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "Enter")
                setIsOpen(true);
            return;
        }
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setActiveIndex((i) => Math.min(i + 1, results.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setActiveIndex((i) => Math.max(i - 1, -1));
                break;
            case "Enter":
                e.preventDefault();
                if (activeIndex >= 0 && results[activeIndex]) {
                    select(results[activeIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                setActiveIndex(-1);
                break;
        }
    };
    // Scroll active item into view
    (0, react_1.useEffect)(() => {
        if (activeIndex >= 0 && listRef.current) {
            const item = listRef.current.children[activeIndex];
            item?.scrollIntoView({ block: "nearest" });
        }
    }, [activeIndex]);
    const listId = "bw-token-listbox";
    return (<>
      <style>{`
        .bw-token-search {
          position: relative;
          width: 100%;
          max-width: 360px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .bw-token-search__trigger {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          background: #fff;
          cursor: text;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .bw-token-search__trigger:focus-within {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px #6366f120;
        }
        .bw-token-search__trigger--disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .bw-token-search__selected {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-shrink: 0;
        }
        .bw-token-search__selected-symbol {
          font-weight: 600;
          font-size: 14px;
          color: #111827;
        }
        .bw-token-search__divider {
          width: 1px;
          height: 18px;
          background: #e5e7eb;
          flex-shrink: 0;
        }
        .bw-token-search__input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 14px;
          color: #111827;
          background: transparent;
          min-width: 0;
          font-family: inherit;
        }
        .bw-token-search__input::placeholder { color: #9ca3af; }
        .bw-token-search__input:disabled { cursor: not-allowed; }
        .bw-token-search__clear {
          background: none;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          font-size: 16px;
          padding: 0 2px;
          line-height: 1;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .bw-token-search__clear:hover { color: #374151; }

        /* Dropdown */
        .bw-token-search__dropdown {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          right: 0;
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          z-index: 200;
          overflow: hidden;
          animation: bw-dropdown-in 0.12s ease;
        }
        @keyframes bw-dropdown-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bw-token-search__list {
          list-style: none;
          margin: 0;
          padding: 6px;
          max-height: 280px;
          overflow-y: auto;
        }
        .bw-token-search__item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.1s;
        }
        .bw-token-search__item:hover,
        .bw-token-search__item--active {
          background: #f3f4f6;
        }
        .bw-token-search__item--selected {
          background: #eef2ff;
        }
        .bw-token-search__item-text { flex: 1; min-width: 0; }
        .bw-token-search__item-symbol {
          font-weight: 700;
          font-size: 13px;
          color: #111827;
        }
        .bw-token-search__item-name {
          font-size: 11px;
          color: #6b7280;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .bw-token-search__item-addr {
          font-size: 10px;
          color: #9ca3af;
          font-family: monospace;
        }
        .bw-token-search__empty {
          padding: 20px;
          text-align: center;
          color: #9ca3af;
          font-size: 13px;
        }
      `}</style>
      <div ref={containerRef} className={`bw-token-search ${className}`}>
        <div className={`bw-token-search__trigger${disabled ? " bw-token-search__trigger--disabled" : ""}`} onClick={() => !disabled && inputRef.current?.focus()}>
          {value && (<>
              <span className="bw-token-search__selected">
                <TokenLogo token={value} size={20}/>
                <span className="bw-token-search__selected-symbol">
                  {value.symbol}
                </span>
              </span>
              <div className="bw-token-search__divider"/>
            </>)}
          <input ref={inputRef} className="bw-token-search__input" value={query} onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
        }} onFocus={() => setIsOpen(true)} onKeyDown={handleKeyDown} placeholder={value ? `Change token…` : placeholder} disabled={disabled} autoComplete="off" role="combobox" aria-expanded={isOpen} aria-autocomplete="list" aria-controls={listId} aria-activedescendant={activeIndex >= 0
            ? `bw-token-item-${activeIndex}`
            : undefined}/>
          {query && (<button className="bw-token-search__clear" onClick={() => { setQuery(""); inputRef.current?.focus(); }} aria-label="Clear search" tabIndex={-1}>
              ×
            </button>)}
        </div>

        {isOpen && (<div className="bw-token-search__dropdown">
            <ul ref={listRef} id={listId} className="bw-token-search__list" role="listbox" aria-label="Token suggestions">
              {results.length === 0 ? (<li className="bw-token-search__empty" role="option" aria-selected={false}>
                  No tokens found
                </li>) : (results.map((token, i) => {
                const isSelected = value?.address === token.address && value?.chainId === token.chainId;
                const isActive = i === activeIndex;
                return (<li key={`${token.chainId}-${token.address}`} id={`bw-token-item-${i}`} className={[
                        "bw-token-search__item",
                        isActive ? "bw-token-search__item--active" : "",
                        isSelected ? "bw-token-search__item--selected" : "",
                    ].join(" ")} role="option" aria-selected={isSelected} onMouseDown={(e) => e.preventDefault()} onClick={() => select(token)}>
                      <TokenLogo token={token} size={28}/>
                      <div className="bw-token-search__item-text">
                        <div className="bw-token-search__item-symbol">
                          {token.symbol}
                        </div>
                        <div className="bw-token-search__item-name">
                          {token.name}
                        </div>
                        <div className="bw-token-search__item-addr">
                          {token.address.slice(0, 6)}…{token.address.slice(-4)}
                        </div>
                      </div>
                    </li>);
            }))}
            </ul>
          </div>)}
      </div>
    </>);
}
exports.default = TokenSearchAutocomplete;
//# sourceMappingURL=TokenSearchAutocomplete.js.map