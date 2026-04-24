"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeStatusBadge = exports.BridgeDowntimeList = exports.BridgeDowntimeIndicator = void 0;
const react_1 = __importDefault(require("react"));
const BridgeDowntimeIndicator = ({ bridge, size = 'md', showLabel = true, showUptime = false, }) => {
    const isOffline = bridge.status === 'offline';
    const isDegraded = bridge.status === 'degraded';
    const isActive = bridge.status === 'active';
    const sizeClasses = {
        sm: {
            dot: 'w-2 h-2',
            text: 'text-xs',
            container: 'gap-1.5',
        },
        md: {
            dot: 'w-3 h-3',
            text: 'text-sm',
            container: 'gap-2',
        },
        lg: {
            dot: 'w-4 h-4',
            text: 'text-base',
            container: 'gap-2.5',
        },
    };
    const dotColor = isOffline
        ? 'bg-red-500'
        : isDegraded
            ? 'bg-yellow-500'
            : 'bg-green-500';
    const dotAnimation = isOffline
        ? 'animate-pulse'
        : isDegraded
            ? 'animate-pulse'
            : '';
    const statusText = isOffline
        ? 'Offline'
        : isDegraded
            ? 'Degraded'
            : 'Operational';
    const textColor = isOffline
        ? 'text-red-600 dark:text-red-400'
        : isDegraded
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-green-600 dark:text-green-400';
    const showTooltip = isOffline || isDegraded;
    return (<div className="relative">
      <div className={`flex items-center ${sizeClasses[size].container}`}>
        <div className={`${sizeClasses[size].dot} ${dotColor} rounded-full flex-shrink-0 ${dotAnimation}`} title={showTooltip && bridge.errorMessage ? bridge.errorMessage : ''}/>
        {showLabel && (<div className={`${sizeClasses[size].text} font-medium ${textColor}`}>
            {statusText}
          </div>)}
        {showUptime && (<div className={`${sizeClasses[size].text} text-slate-500 dark:text-slate-400`}>
            {Math.round(bridge.uptime)}%
          </div>)}
      </div>

      {/* Tooltip on hover */}
      {showTooltip && bridge.errorMessage && (<div className="absolute left-0 top-full mt-2 z-50 p-2 bg-slate-900 dark:bg-slate-950 text-white text-xs rounded shadow-lg max-w-xs pointer-events-none group-hover:pointer-events-auto invisible group-hover:visible" role="tooltip">
          {bridge.errorMessage}
        </div>)}
    </div>);
};
exports.BridgeDowntimeIndicator = BridgeDowntimeIndicator;
const BridgeDowntimeList = ({ bridges, showOnlyOffline = true, }) => {
    const displayBridges = showOnlyOffline
        ? bridges.filter((b) => b.status !== 'active')
        : bridges;
    if (displayBridges.length === 0) {
        return null;
    }
    return (<div className="space-y-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start gap-2">
        <div className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0 mt-0.5 animate-pulse"/>
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-red-900 dark:text-red-100">
            {displayBridges.length === 1 ? 'Bridge Unavailable' : 'Bridges Unavailable'}
          </h3>
          <p className="text-xs text-red-700 dark:text-red-300 mt-1">
            {displayBridges.length} bridge{displayBridges.length > 1 ? 's' : ''} currently{' '}
            {displayBridges.some((b) => b.status === 'offline') ? 'offline' : 'experiencing issues'}
          </p>
        </div>
      </div>

      <ul className="space-y-1 mt-2">
        {displayBridges.map((bridge) => (<li key={bridge.bridgeId} className="flex items-center justify-between text-xs">
            <span className="text-red-800 dark:text-red-200">{bridge.name}</span>
            <span className="text-red-600 dark:text-red-400">
              {bridge.status === 'offline' ? '⚠️ Offline' : '⚡ Degraded'}
            </span>
          </li>))}
      </ul>

      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
        Please check back soon or use alternative routes
      </p>
    </div>);
};
exports.BridgeDowntimeList = BridgeDowntimeList;
const BridgeStatusBadge = ({ status, showText = true, }) => {
    const bgColor = status === 'offline'
        ? 'bg-red-100 dark:bg-red-900/30'
        : status === 'degraded'
            ? 'bg-yellow-100 dark:bg-yellow-900/30'
            : 'bg-green-100 dark:bg-green-900/30';
    const textColor = status === 'offline'
        ? 'text-red-800 dark:text-red-200'
        : status === 'degraded'
            ? 'text-yellow-800 dark:text-yellow-200'
            : 'text-green-800 dark:text-green-200';
    const borderColor = status === 'offline'
        ? 'border-red-300 dark:border-red-700'
        : status === 'degraded'
            ? 'border-yellow-300 dark:border-yellow-700'
            : 'border-green-300 dark:border-green-700';
    const dotColor = status === 'offline'
        ? 'bg-red-500'
        : status === 'degraded'
            ? 'bg-yellow-500'
            : 'bg-green-500';
    const label = status === 'offline' ? 'Offline' : status === 'degraded' ? 'Degraded' : 'Operational';
    return (<div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${bgColor} ${borderColor}`}>
      <div className={`w-2 h-2 rounded-full ${dotColor} ${status !== 'active' ? 'animate-pulse' : ''}`}/>
      {showText && <span className={`text-xs font-medium ${textColor}`}>{label}</span>}
    </div>);
};
exports.BridgeStatusBadge = BridgeStatusBadge;
//# sourceMappingURL=BridgeDowntimeIndicator.js.map