/**
 * Stellar Route Confidence Scoring (Issue #474)
 *
 * Assign trust/certainty levels to route recommendations so users can assess
 * how reliable each recommendation is.
 *
 * @example
 * ```ts
 * import { attachRouteConfidence } from 'src/scoring/confidence/stellar';
 *
 * const ranked = attachRouteConfidence(routes);
 * ranked.forEach(r =>
 *   console.log(r.id, r.confidenceMeta.summary, r.confidenceMeta.factors),
 * );
 * ```
 */

export * from './types';
export { scoreRouteConfidence, confidenceLevelFromScore } from './confidence-scorer';
export {
  attachRouteConfidence,
  routeToReliabilitySignals,
  scoreRoute,
  type ConfidenceScorableRoute,
  type RouteWithConfidence,
} from './route-confidence';
