"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBridgeStatus = useBridgeStatus;
exports.useBridgeStatuses = useBridgeStatuses;
exports.useOfflineBridges = useOfflineBridges;
const react_1 = require("react");
function useBridgeStatus(bridgeId) {
    const [status, setStatus] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchStatus = (0, react_1.useCallback)(async () => {
        if (!bridgeId)
            return;
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/bridge-compare/status/${bridgeId}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch status: ${response.statusText}`);
            }
            const data = await response.json();
            setStatus(data);
            setError(null);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            setStatus(null);
        }
        finally {
            setLoading(false);
        }
    }, [bridgeId]);
    (0, react_1.useEffect)(() => {
        fetchStatus();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchStatus, 30000);
        return () => clearInterval(interval);
    }, [fetchStatus]);
    return { status, loading, error, refetch: fetchStatus };
}
function useBridgeStatuses(bridgeIds) {
    const [statuses, setStatuses] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchStatuses = (0, react_1.useCallback)(async () => {
        setLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/bridge-compare/status`);
            if (!response.ok) {
                throw new Error(`Failed to fetch statuses: ${response.statusText}`);
            }
            const data = await response.json();
            // Filter by bridgeIds if provided
            const filtered = bridgeIds
                ? data.filter((s) => bridgeIds.includes(s.bridgeId))
                : data;
            setStatuses(filtered);
            setError(null);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setError(message);
            setStatuses([]);
        }
        finally {
            setLoading(false);
        }
    }, [bridgeIds]);
    (0, react_1.useEffect)(() => {
        fetchStatuses();
        // Poll for updates every 30 seconds
        const interval = setInterval(fetchStatuses, 30000);
        return () => clearInterval(interval);
    }, [fetchStatuses]);
    return { statuses, loading, error, refetch: fetchStatuses };
}
function useOfflineBridges() {
    const { statuses, loading, error, refetch } = useBridgeStatuses();
    const offlineBridges = statuses.filter((s) => s.status === 'offline');
    const degradedBridges = statuses.filter((s) => s.status === 'degraded');
    return {
        offlineBridges,
        degradedBridges,
        unavailableBridges: [...offlineBridges, ...degradedBridges],
        allStatuses: statuses,
        loading,
        error,
        refetch,
    };
}
//# sourceMappingURL=useBridgeStatus.js.map