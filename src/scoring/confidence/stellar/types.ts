/**
 * Stellar Route Confidence Scoring — Types (Issue #474)
 *
 * Confidence is distinct from a route's quality/ranking score: it answers
 * "how much should a user trust this recommendation?" rather than "how good is
 * the route?". It is derived from the reliability of the underlying telemetry —
 * success rate, how many observations back it, how fresh it is, and how stable
 * the route has been.
 */

/** Discrete confidence band, suitable for display next to a recommendation. */
export type ConfidenceLevel = 'very-low' | 'low' | 'moderate' | 'high' | 'very-high';

/** Reliability telemetry used to derive a route's confidence. All optional —
 * the scorer averages over whatever signals are present. */
export interface RouteReliabilitySignals {
  /** Observed success rate, 0-1. */
  successRate?: number;
  /** Observed failure rate, 0-1 (used when `successRate` is absent). */
  failureRate?: number;
  /** Number of observations the metrics are based on (more => more certain). */
  observationCount?: number;
  /** Current availability, 0-1. */
  availability?: number;
  /** Representative latency in ms (informational). */
  latencyMs?: number;
  /** Recent latency samples in ms, used to gauge stability (variance). */
  latencySamplesMs?: number[];
  /** Epoch ms when the metrics were last refreshed (older => less certain). */
  lastUpdatedMs?: number;
  /** Injectable clock for deterministic tests; defaults to `Date.now()`. */
  nowMs?: number;
}

/** A single contributing signal in the confidence breakdown (the exposed
 * "confidence metadata"). */
export interface ConfidenceFactor {
  key: string;
  label: string;
  /** Normalized 0-1 contribution (1 = maximally supports confidence). */
  value: number;
  /** Relative weight applied when combining factors. */
  weight: number;
  /** Human-readable explanation of how the value was derived. */
  detail: string;
}

/** The computed confidence for a route. */
export interface RouteConfidence {
  /** Overall confidence, 0-1. */
  score: number;
  level: ConfidenceLevel;
  /** Per-factor breakdown — exposed so callers/UI can explain the score. */
  factors: ConfidenceFactor[];
  /** Short human summary, e.g. "High confidence (82%)". */
  summary: string;
}

/** Tuning knobs for the scorer. */
export interface ConfidenceOptions {
  /** Observation count at which sample-size confidence saturates (default 50). */
  fullConfidenceSampleSize?: number;
  /** Half-life (ms) for recency decay (default 6h). */
  recencyHalfLifeMs?: number;
}
