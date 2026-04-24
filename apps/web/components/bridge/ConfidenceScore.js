"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfidenceScore = void 0;
const react_1 = __importDefault(require("react"));
const LEVEL_CONFIG = {
    high: {
        label: 'High',
        barColor: 'bg-green-500',
        badgeColor: 'bg-green-100',
        textColor: 'text-green-700',
    },
    medium: {
        label: 'Medium',
        barColor: 'bg-yellow-400',
        badgeColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
    },
    low: {
        label: 'Low',
        barColor: 'bg-red-500',
        badgeColor: 'bg-red-100',
        textColor: 'text-red-700',
    },
};
const ConfidenceScore = ({ score, level, showBreakdown = false, feeScore, slippageScore, successRateScore, }) => {
    const config = LEVEL_CONFIG[level];
    return (<div className="space-y-1">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 font-medium">Confidence</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${config.badgeColor} ${config.textColor}`}>
            {config.label}
          </span>
        </div>
        <span className={`text-xs font-bold ${config.textColor}`}>
          {score.toFixed(0)}
          <span className="font-normal text-gray-400">/100</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${config.barColor}`} style={{ width: `${score}%` }}/>
      </div>

      {/* Optional breakdown */}
      {showBreakdown &&
            feeScore !== undefined &&
            slippageScore !== undefined &&
            successRateScore !== undefined && (<div className="pt-1 space-y-0.5">
            <BreakdownRow label="Fees" value={feeScore}/>
            <BreakdownRow label="Slippage" value={slippageScore}/>
            <BreakdownRow label="Success rate" value={successRateScore}/>
          </div>)}
    </div>);
};
exports.ConfidenceScore = ConfidenceScore;
const BreakdownRow = ({ label, value, }) => (<div className="flex items-center justify-between text-xs text-gray-500">
    <span>{label}</span>
    <span className="font-medium">{value.toFixed(0)}%</span>
  </div>);
//# sourceMappingURL=ConfidenceScore.js.map