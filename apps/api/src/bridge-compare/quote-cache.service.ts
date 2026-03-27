import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { QuoteResponse, QuoteRequestParams } from './interfaces';

interface CacheEntry {
  response: QuoteResponse;
  storedAt: number; // ms since epoch
  ttl: number;      // ms
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number; // 0-1
}

// Quotes include live fees and slippage, so a short TTL keeps results fresh
// while still absorbing burst traffic (e.g. the frontend's 15-second auto-refresh).
const DEFAULT_TTL_MS = 30_000;

// Sweep expired entries every minute to keep memory bounded.
const CLEANUP_INTERVAL_MS = 60_000;

@Injectable()
export class QuoteCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QuoteCacheService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  private hits = 0;
  private misses = 0;

  onModuleInit(): void {
    this.cleanupTimer = setInterval(
      () => this.clearExpired(),
      CLEANUP_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }

  /**
   * Build a deterministic cache key from quote request parameters.
   * Amount is normalised to avoid floating-point key divergence.
   */
  buildKey(params: QuoteRequestParams): string {
    const amount = parseFloat(params.amount.toFixed(6));
    return [
      params.sourceToken.toUpperCase(),
      params.sourceChain.toLowerCase(),
      params.destinationChain.toLowerCase(),
      (params.destinationToken ?? params.sourceToken).toUpperCase(),
      amount,
      params.rankingMode,
    ].join(':');
  }

  /**
   * Return a cached response if one exists and has not expired, else null.
   */
  get(key: string): QuoteResponse | null {
    const entry = this.cache.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() - entry.storedAt > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    this.logger.debug(`Cache hit for key: ${key}`);
    return entry.response;
  }

  /**
   * Store a response in the cache.
   */
  set(key: string, response: QuoteResponse, ttlMs = DEFAULT_TTL_MS): void {
    this.cache.set(key, {
      response,
      storedAt: Date.now(),
      ttl: ttlMs,
    });
    this.logger.debug(`Cached response for key: ${key} (TTL ${ttlMs}ms)`);
  }

  /**
   * Remove all entries whose TTL has elapsed.
   */
  clearExpired(): void {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.storedAt > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      this.logger.debug(`Cleared ${removed} expired cache entries`);
    }
  }

  /** Evict everything — useful for testing or forced refreshes. */
  clear(): void {
    this.cache.clear();
  }

  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
    };
  }
}
