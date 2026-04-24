"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeProviderScore = exports.computeSuccessRate = void 0;
const MIN_ATTEMPTS_FOR_SCORE = 5;
const MAX_SCORE = 100;
const MIN_SCORE = 0;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
/**
 * Compute the observed success rate for a provider snapshot.
 * If there are no completed attempts, the success rate is 0.
 */
const computeSuccessRate = (snapshot) => {
    const totalAttempts = snapshot.successfulTransfers + snapshot.failedTransfers;
    if (totalAttempts <= 0) {
        return 0;
    }
    return parseFloat(((snapshot.successfulTransfers / totalAttempts) * 100).toFixed(2));
};
exports.computeSuccessRate = computeSuccessRate;
/**
 * Compute a provider score from success/failure data.
 * - Uses the success rate as the primary signal.
 * - Applies a small timeout penalty when timeout count is present.
 * - Returns a normalized 0-100 score.
 */
const computeProviderScore = (snapshot) => {
    const totalAttempts = snapshot.successfulTransfers + snapshot.failedTransfers;
    const successRate = (0, exports.computeSuccessRate)(snapshot);
    if (totalAttempts < MIN_ATTEMPTS_FOR_SCORE) {
        return {
            successRate,
            score: 0,
        };
    }
    const timeoutPenalty = snapshot.timeoutCount
        ? Math.min((snapshot.timeoutCount / totalAttempts) * 15, 10)
        : 0;
    const rawScore = successRate - timeoutPenalty;
    return {
        successRate,
        score: parseFloat(clamp(rawScore, MIN_SCORE, MAX_SCORE).toFixed(2)),
    };
};
exports.computeProviderScore = computeProviderScore;
//# sourceMappingURL=provider-score.js.map