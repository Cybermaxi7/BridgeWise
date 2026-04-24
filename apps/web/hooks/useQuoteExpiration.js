"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useQuoteExpiration = useQuoteExpiration;
const react_1 = require("react");
function toMs(val) {
    return new Date(val).getTime();
}
function formatTime(seconds) {
    if (seconds <= 0)
        return "00:00";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
/**
 * useQuoteExpiration
 *
 * Tracks the remaining time for a quote and fires `onExpire` when time runs out.
 * Designed to integrate with BridgeWise quote API responses that include an
 * `expiresAt` field.
 *
 * @example
 * const { formattedTime, isCritical, isExpired } = useQuoteExpiration({
 *   expiresAt: quote.expiresAt,
 *   onExpire: () => refetchQuote(),
 * });
 */
function useQuoteExpiration({ expiresAt, onExpire, interval = 1000, }) {
    const [expiryMs, setExpiryMs] = (0, react_1.useState)(expiresAt ? toMs(expiresAt) : null);
    const getSecondsLeft = (0, react_1.useCallback)(() => {
        if (!expiryMs)
            return 0;
        return Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
    }, [expiryMs]);
    const [secondsLeft, setSecondsLeft] = (0, react_1.useState)(getSecondsLeft);
    const onExpireRef = (0, react_1.useRef)(onExpire);
    onExpireRef.current = onExpire;
    // Sync when expiresAt prop changes (new quote fetched)
    (0, react_1.useEffect)(() => {
        if (expiresAt)
            setExpiryMs(toMs(expiresAt));
    }, [expiresAt]);
    (0, react_1.useEffect)(() => {
        const s = getSecondsLeft();
        setSecondsLeft(s);
        if (s <= 0) {
            onExpireRef.current?.();
            return;
        }
        const id = setInterval(() => {
            const remaining = getSecondsLeft();
            setSecondsLeft(remaining);
            if (remaining <= 0) {
                clearInterval(id);
                onExpireRef.current?.();
            }
        }, interval);
        return () => clearInterval(id);
    }, [expiryMs, getSecondsLeft, interval]);
    const reset = (0, react_1.useCallback)((newExpiresAt) => {
        setExpiryMs(toMs(newExpiresAt));
    }, []);
    return {
        secondsLeft,
        isExpired: secondsLeft <= 0,
        isWarning: secondsLeft > 0 && secondsLeft <= 30,
        isCritical: secondsLeft > 0 && secondsLeft <= 10,
        formattedTime: formatTime(secondsLeft),
        reset,
    };
}
//# sourceMappingURL=useQuoteExpiration.js.map