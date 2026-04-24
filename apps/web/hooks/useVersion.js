'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useVersion = useVersion;
exports.useLocalVersion = useLocalVersion;
const react_1 = require("react");
/**
 * Hook to fetch and display SDK/API version information
 */
function useVersion(options = {}) {
    const { apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000', refreshInterval = 0, enableLogging = false, } = options;
    const [version, setVersion] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const fetchVersion = async () => {
        try {
            const response = await fetch(`${apiUrl}/version`);
            if (!response.ok) {
                throw new Error(`Failed to fetch version: ${response.statusText}`);
            }
            const data = await response.json();
            setVersion(data);
            setError(null);
            if (enableLogging && data) {
                console.log(`🔗 BridgeWise SDK v${data.version} (${data.environment})`);
            }
        }
        catch (err) {
            const errorInstance = err instanceof Error ? err : new Error(String(err));
            setError(errorInstance);
            if (enableLogging) {
                console.error('❌ Failed to fetch SDK version:', errorInstance.message);
            }
        }
        finally {
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        fetchVersion();
        // Auto-refresh if interval is set
        if (refreshInterval > 0) {
            const intervalId = setInterval(fetchVersion, refreshInterval);
            return () => clearInterval(intervalId);
        }
    }, [apiUrl, refreshInterval]);
    return {
        version,
        loading,
        error,
        refetch: fetchVersion,
    };
}
/**
 * Get local SDK version from package (no API call)
 */
function useLocalVersion() {
    const [version, setVersion] = (0, react_1.useState)('0.0.1');
    (0, react_1.useEffect)(() => {
        // Try to get version from package.json
        try {
            // This will work in bundler environments
            const pkg = require('../package.json');
            setVersion(pkg.version || '0.0.1');
        }
        catch {
            // Fallback to default version
            setVersion('0.0.1');
        }
    }, []);
    return version;
}
//# sourceMappingURL=useVersion.js.map