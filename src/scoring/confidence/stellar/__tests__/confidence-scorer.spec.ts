/**
 * Stellar Route Confidence Scoring — Tests (Issue #474)
 */

import {
  attachRouteConfidence,
  confidenceLevelFromScore,
  scoreRouteConfidence,
  type RouteReliabilitySignals,
} from '../index';

const NOW = 1_700_000_000_000;

describe('confidenceLevelFromScore', () => {
  it('maps scores to bands', () => {
    expect(confidenceLevelFromScore(0.95)).toBe('very-high');
    expect(confidenceLevelFromScore(0.7)).toBe('high');
    expect(confidenceLevelFromScore(0.5)).toBe('moderate');
    expect(confidenceLevelFromScore(0.3)).toBe('low');
    expect(confidenceLevelFromScore(0.05)).toBe('very-low');
  });
});

describe('scoreRouteConfidence', () => {
  it('returns neutral confidence when no signals are present', () => {
    const result = scoreRouteConfidence({});
    expect(result.score).toBe(0.5);
    expect(result.level).toBe('moderate');
    expect(result.factors).toHaveLength(0);
    expect(result.summary).toMatch(/neutral confidence/i);
  });

  it('scores a strong, well-observed, fresh route highly', () => {
    const signals: RouteReliabilitySignals = {
      successRate: 0.99,
      observationCount: 200,
      availability: 0.98,
      latencySamplesMs: [100, 102, 98, 101],
      lastUpdatedMs: NOW,
      nowMs: NOW,
    };
    const result = scoreRouteConfidence(signals);
    expect(result.score).toBeGreaterThan(0.8);
    expect(result.level).toBe('very-high');
    expect(result.factors.map((f) => f.key)).toEqual(
      expect.arrayContaining(['reliability', 'sampleSize', 'recency', 'stability', 'availability']),
    );
  });

  it('lowers confidence for a poor success rate', () => {
    const result = scoreRouteConfidence({ successRate: 0.2, observationCount: 100 });
    expect(result.score).toBeLessThan(0.5);
  });

  it('treats failureRate as the inverse of successRate', () => {
    const a = scoreRouteConfidence({ successRate: 0.9 });
    const b = scoreRouteConfidence({ failureRate: 0.1 });
    expect(b.score).toBeCloseTo(a.score, 10);
  });

  it('rewards larger sample sizes (saturating)', () => {
    const few = scoreRouteConfidence({ successRate: 0.9, observationCount: 1 });
    const many = scoreRouteConfidence({ successRate: 0.9, observationCount: 100 });
    expect(many.score).toBeGreaterThan(few.score);
  });

  it('decays confidence as the metrics age (recency)', () => {
    const base: RouteReliabilitySignals = { successRate: 0.9, lastUpdatedMs: NOW, nowMs: NOW };
    const fresh = scoreRouteConfidence(base);
    const stale = scoreRouteConfidence({
      ...base,
      lastUpdatedMs: NOW - 24 * 60 * 60 * 1000, // 24h old
    });
    expect(stale.score).toBeLessThan(fresh.score);
  });

  it('penalizes unstable (high-variance) latency', () => {
    const stable = scoreRouteConfidence({ successRate: 0.9, latencySamplesMs: [100, 101, 99, 100] });
    const jittery = scoreRouteConfidence({ successRate: 0.9, latencySamplesMs: [50, 400, 80, 350] });
    expect(stable.score).toBeGreaterThan(jittery.score);
  });

  it('blends quality, then damps toward neutral when certainty is unknown', () => {
    const result = scoreRouteConfidence({ successRate: 0.8, availability: 0.6 });
    // quality = (0.8*0.7 + 0.6*0.3) = 0.74; no certainty signals => certainty 0.5
    // confidence = 0.5 + (0.74 - 0.5) * 0.5 = 0.62
    const quality = (0.8 * 0.7 + 0.6 * 0.3) / (0.7 + 0.3);
    const expected = 0.5 + (quality - 0.5) * 0.5;
    expect(result.score).toBeCloseTo(expected, 10);
  });

  it('drives confidence low for a poor route we are certain about', () => {
    // High sample size => high certainty => poor quality is fully reflected.
    const result = scoreRouteConfidence({ successRate: 0.1, observationCount: 500 });
    expect(result.score).toBeLessThan(0.2);
    expect(result.level).toBe('very-low');
  });
});

describe('attachRouteConfidence', () => {
  it('attaches confidence score + metadata to each route without mutating input', () => {
    const routes = [
      { id: 'a', successRate: 0.99, observationCount: 200, networkMetrics: { latencyMs: 100 } },
      { id: 'b', successRate: 0.3, observationCount: 5 },
    ];
    const annotated = attachRouteConfidence(routes);

    expect(annotated[0].id).toBe('a');
    expect(annotated[0].confidence).toBeGreaterThan(annotated[1].confidence);
    expect(annotated[0].confidenceMeta.factors.length).toBeGreaterThan(0);
    expect(annotated[0].confidenceMeta.level).toBeDefined();
    // input untouched
    expect('confidence' in routes[0]).toBe(false);
  });

  it('derives confidence from networkMetrics.failureRate when successRate is absent', () => {
    const [annotated] = attachRouteConfidence([{ networkMetrics: { failureRate: 0.05 } }]);
    expect(annotated.confidence).toBeGreaterThan(0.5);
  });
});
