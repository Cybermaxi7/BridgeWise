/**
 * Stellar Route Confidence Scoring — Route integration (Issue #474)
 *
 * Bridges a route-shaped object to the confidence scorer and attaches the
 * resulting confidence (score + metadata) so it can be displayed alongside
 * recommendations. Uses structural typing so it stays decoupled from the
 * route-ranker's `BridgeRoute` (which it is, however, compatible with).
 */

import { scoreRouteConfidence } from './confidence-scorer';
import { ConfidenceOptions, RouteConfidence, RouteReliabilitySignals } from './types';

/** Minimal route shape required to derive confidence. `BridgeRoute` satisfies
 * this structurally. */
export interface ConfidenceScorableRoute {
  successRate?: number;
  availability?: number;
  observationCount?: number;
  lastUpdatedMs?: number;
  latencySamplesMs?: number[];
  networkMetrics?: {
    failureRate?: number;
    availability?: number;
    latencyMs?: number;
  } | null;
}

/** A route annotated with its confidence score (0-1) and full metadata. */
export type RouteWithConfidence<T> = T & {
  confidence: number;
  confidenceMeta: RouteConfidence;
};

/** Project a route's fields onto the reliability signals the scorer expects. */
export function routeToReliabilitySignals(
  route: ConfidenceScorableRoute,
): RouteReliabilitySignals {
  return {
    successRate: route.successRate,
    failureRate: route.networkMetrics?.failureRate,
    availability: route.availability ?? route.networkMetrics?.availability,
    latencyMs: route.networkMetrics?.latencyMs,
    latencySamplesMs: route.latencySamplesMs,
    observationCount: route.observationCount,
    lastUpdatedMs: route.lastUpdatedMs,
  };
}

/** Compute confidence for a single route. */
export function scoreRoute(
  route: ConfidenceScorableRoute,
  options?: ConfidenceOptions,
): RouteConfidence {
  return scoreRouteConfidence(routeToReliabilitySignals(route), options);
}

/**
 * Attach confidence to each route for display with recommendations.
 *
 * Sets `confidence` (the 0-1 score — the same field `BridgeRoute` already
 * exposes) and `confidenceMeta` (the full breakdown). The input objects are
 * not mutated.
 */
export function attachRouteConfidence<T extends ConfidenceScorableRoute>(
  routes: T[],
  options?: ConfidenceOptions,
): RouteWithConfidence<T>[] {
  return routes.map((route) => {
    const confidenceMeta = scoreRoute(route, options);
    return { ...route, confidence: confidenceMeta.score, confidenceMeta };
  });
}
