"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useOfflineDetection = useOfflineDetection;
const react_1 = require("react");
const ssr_1 = require("../components/ui-lib/utils/ssr");
const CACHE_KEY = 'bridgewise_offline_cache';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
function useOfflineDetection() {
    const [isOffline, setIsOffline] = (0, react_1.useState)(ssr_1.isBrowser ? !navigator.onLine : false);
    const [cache, setCache] = (0, react_1.useState)(() => {
        const stored = ssr_1.ssrLocalStorage.getItem(CACHE_KEY);
        if (!stored)
            return null;
        try {
            const parsed = JSON.parse(stored);
            if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) {
                ssr_1.ssrLocalStorage.removeItem(CACHE_KEY);
                return null;
            }
            return parsed;
        }
        catch {
            return null;
        }
    });
    (0, react_1.useEffect)(() => {
        if (!ssr_1.isBrowser)
            return;
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    const saveToCache = (0, react_1.useCallback)((data) => {
        setCache((prev) => {
            const next = {
                routes: data.routes ?? prev?.routes ?? [],
                quotes: data.quotes ?? prev?.quotes ?? [],
                cachedAt: Date.now(),
            };
            ssr_1.ssrLocalStorage.setItem(CACHE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);
    const clearCache = (0, react_1.useCallback)(() => {
        ssr_1.ssrLocalStorage.removeItem(CACHE_KEY);
        setCache(null);
    }, []);
    return { isOffline, cache, saveToCache, clearCache };
}
//# sourceMappingURL=useOfflineDetection.js.map