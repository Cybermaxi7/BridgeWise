/**
 * Stellar Route Confidence Scoring — Scorer (Issue #474)
 *
 * Confidence blends two things:
 *  - **Quality**   — how good the route looks (success rate, availability).
 *  - **Certainty** — how much we trust that measurement (sample size, freshness,
 *                    stability).
 *
 * The final score is the quality pulled toward/away from neutral in proportion
 * to certainty:  `confidence = 0.5 + (quality - 0.5) * certainty`.
 *
 * This captures the intent of "recommendation certainty": a great route backed
 * by lots of fresh, stable data scores high; a poor route that we're *sure*
 * about scores low; and a route we have little data on stays near neutral
 * rather than being over-trusted. With no signals at all it returns 0.5.
 */

import {
  ConfidenceFactor,
  ConfidenceLevel,
  ConfidenceOptions,
  RouteConfidence,
  RouteReliabilitySignals,
} from './types';

const DEFAULT_FULL_SAMPLE = 50;
const DEFAULT_RECENCY_HALF_LIFE_MS = 6 * 60 * 60 * 1000; // 6 hours
const NEUTRAL_SCORE = 0.5;
/** Certainty assumed when no certainty signals are present (moderate damping). */
const DEFAULT_CERTAINTY = 0.5;

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

const weightedAverage = (factors: ConfidenceFactor[]): number => {
  const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
  if (totalWeight === 0) return NEUTRAL_SCORE;
  return factors.reduce((sum, f) => sum + f.value * f.weight, 0) / totalWeight;
};

/** Map a 0-1 confidence score to a discrete level. */
export function confidenceLevelFromScore(score: number): ConfidenceLevel {
  if (score >= 0.8) return 'very-high';
  if (score >= 0.6) return 'high';
  if (score >= 0.4) return 'moderate';
  if (score >= 0.2) return 'low';
  return 'very-low';
}

/** Analyze route reliability and calculate a confidence value + metadata. */
export function scoreRouteConfidence(
  signals: RouteReliabilitySignals,
  options: ConfidenceOptions = {},
): RouteConfidence {
  const fullSample = options.fullConfidenceSampleSize ?? DEFAULT_FULL_SAMPLE;
  const halfLife = options.recencyHalfLifeMs ?? DEFAULT_RECENCY_HALF_LIFE_MS;
  const now = signals.nowMs ?? Date.now();

  // --- Quality factors: how good the route looks ---
  const qualityFactors: ConfidenceFactor[] = [];

  const successRate = isNum(signals.successRate)
    ? signals.successRate
    : isNum(signals.failureRate)
      ? 1 - signals.failureRate
      : undefined;
  if (isNum(successRate)) {
    const value = clamp01(successRate);
    qualityFactors.push({
      key: 'reliability',
      label: 'Reliability',
      value,
      weight: 0.7,
      detail: `Observed success rate ${(value * 100).toFixed(0)}%`,
    });
  }
  if (isNum(signals.availability)) {
    const value = clamp01(signals.availability);
    qualityFactors.push({
      key: 'availability',
      label: 'Availability',
      value,
      weight: 0.3,
      detail: `Availability ${(value * 100).toFixed(0)}%`,
    });
  }

  // --- Certainty factors: how much we trust the measurement ---
  const certaintyFactors: ConfidenceFactor[] = [];

  if (isNum(signals.observationCount)) {
    const value = fullSample > 0 ? clamp01(signals.observationCount / fullSample) : 0;
    certaintyFactors.push({
      key: 'sampleSize',
      label: 'Sample size',
      value,
      weight: 0.5,
      detail: `${signals.observationCount} observation(s); saturates at ${fullSample}`,
    });
  }
  if (isNum(signals.lastUpdatedMs)) {
    const ageMs = Math.max(0, now - signals.lastUpdatedMs);
    const value = clamp01(Math.pow(0.5, ageMs / halfLife));
    certaintyFactors.push({
      key: 'recency',
      label: 'Data freshness',
      value,
      weight: 0.3,
      detail: `Metrics ~${Math.round(ageMs / 60000)} min old`,
    });
  }
  const samples = (signals.latencySamplesMs ?? []).filter(isNum);
  if (samples.length >= 2) {
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    let value = NEUTRAL_SCORE;
    if (mean > 0) {
      const variance = samples.reduce((a, b) => a + (b - mean) ** 2, 0) / samples.length;
      const coefficientOfVariation = Math.sqrt(variance) / mean;
      value = clamp01(1 - coefficientOfVariation);
    }
    certaintyFactors.push({
      key: 'stability',
      label: 'Latency stability',
      value,
      weight: 0.2,
      detail: `Coefficient of variation across ${samples.length} latency samples`,
    });
  }

  // No quality signal at all => we cannot assess the recommendation.
  if (qualityFactors.length === 0) {
    return {
      score: NEUTRAL_SCORE,
      level: confidenceLevelFromScore(NEUTRAL_SCORE),
      factors: certaintyFactors,
      summary: 'No route-quality signals available — neutral confidence.',
    };
  }

  const quality = clamp01(weightedAverage(qualityFactors));
  const certainty =
    certaintyFactors.length > 0 ? clamp01(weightedAverage(certaintyFactors)) : DEFAULT_CERTAINTY;
  const score = clamp01(NEUTRAL_SCORE + (quality - NEUTRAL_SCORE) * certainty);
  const level = confidenceLevelFromScore(score);

  return {
    score,
    level,
    factors: [...qualityFactors, ...certaintyFactors],
    summary: `${levelLabel(level)} confidence (${(score * 100).toFixed(0)}%)`,
  };
}

function levelLabel(level: ConfidenceLevel): string {
  switch (level) {
    case 'very-high':
      return 'Very high';
    case 'high':
      return 'High';
    case 'moderate':
      return 'Moderate';
    case 'low':
      return 'Low';
    case 'very-low':
      return 'Very low';
  }
}
