/**
 * Fallback Bridge Route Executor
 *
 * Automatically switches to alternative routes when the primary route fails.
 * Prevents duplicate executions and provides UI status updates.
 *
 * @module fallback-executor
 */

import { NormalizedRoute, BridgeProvider, ChainId } from './types';
import { RouteRanker, RankingWeights } from './ranker';

/**
 * Execution status for tracking fallback progress
 */
export type FallbackExecutionStatus =
  | 'idle'
  | 'executing'
  | 'switching'
  | 'completed'
  | 'failed';

/**
 * Error codes for fallback execution failures
 */
export const FallbackErrorCode = {
  EXECUTION_FAILED: 'EXECUTION_FAILED',
  ALL_ROUTES_FAILED: 'ALL_ROUTES_FAILED',
  DUPLICATE_EXECUTION: 'DUPLICATE_EXECUTION',
  NO_FALLBACK_AVAILABLE: 'NO_FALLBACK_AVAILABLE',
  TIMEOUT: 'TIMEOUT',
} as const;

export type FallbackErrorCodeType =
  (typeof FallbackErrorCode)[keyof typeof FallbackErrorCode];

/**
 * Error thrown during fallback execution
 */
export class FallbackExecutionError extends Error {
  code: FallbackErrorCodeType;
  route?: NormalizedRoute;
  attemptedRoutes: NormalizedRoute[];

  constructor(
    message: string,
    code: FallbackErrorCodeType,
    attemptedRoutes: NormalizedRoute[] = [],
    route?: NormalizedRoute,
  ) {
    super(message);
    this.name = 'FallbackExecutionError';
    this.code = code;
    this.route = route;
    this.attemptedRoutes = attemptedRoutes;
  }
}

/**
 * Result of a successful route execution
 */
export interface ExecutionResult {
  success: boolean;
  transactionHash?: string;
  route: NormalizedRoute;
  executionTimeMs: number;
  fallbacksUsed: number;
}

/**
 * Callback for status updates during fallback execution
 */
export interface FallbackStatusCallback {
  (status: {
    currentStatus: FallbackExecutionStatus;
    currentRoute: NormalizedRoute;
    attemptNumber: number;
    totalRoutes: number;
    error?: Error;
  }): void;
}

/**
 * Configuration for the FallbackRouteExecutor
 */
export interface FallbackExecutorConfig {
  /** Maximum number of fallback attempts (default: 3) */
  maxFallbackAttempts?: number;
  /** Timeout for each execution attempt in ms (default: 30000) */
  executionTimeout?: number;
  /** Delay between fallback attempts in ms (default: 1000) */
  fallbackDelayMs?: number;
  /** Whether to re-rank routes before fallback selection (default: true) */
  rerankOnFallback?: boolean;
  /** Custom ranking weights for fallback selection */
  fallbackRankingWeights?: Partial<RankingWeights>;
  /** Callback for status updates */
  onStatusChange?: FallbackStatusCallback;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<
  Omit<FallbackExecutorConfig, 'onStatusChange' | 'fallbackRankingWeights'>
> = {
  maxFallbackAttempts: 3,
  executionTimeout: 30000,
  fallbackDelayMs: 1000,
  rerankOnFallback: true,
};

/**
 * Route executor function signature
 */
export type RouteExecutorFn = (
  route: NormalizedRoute,
) => Promise<{ success: boolean; transactionHash?: string; error?: string }>;

/**
 * FallbackRouteExecutor
 *
 * Manages automatic fallback to alternative bridge routes when execution fails.
 * Prevents duplicate executions and provides real-time status updates.
 *
 * @example
 * ```typescript
 * const executor = new FallbackRouteExecutor({
 *   maxFallbackAttempts: 3,
 *   onStatusChange: (status) => console.log('Status:', status.currentStatus),
 * });
 *
 * const result = await executor.executeWithFallback(
 *   routes,
 *   async (route) => bridgeAdapter.execute(route)
 * );
 * ```
 */
export class FallbackRouteExecutor {
  private config: Required<
    Omit<FallbackExecutorConfig, 'onStatusChange' | 'fallbackRankingWeights'>
  >;
  private onStatusChange?: FallbackStatusCallback;
  private fallbackRankingWeights?: Partial<RankingWeights>;
  private ranker: RouteRanker;

  /** Track active executions to prevent duplicates */
  private activeExecutions: Map<
    string,
    { startTime: number; route: NormalizedRoute }
  > = new Map();

  /** Track failed routes to avoid retrying */
  private failedRoutes: Set<string> = new Set();

  constructor(config: FallbackExecutorConfig = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    this.onStatusChange = config.onStatusChange;
    this.fallbackRankingWeights = config.fallbackRankingWeights;

    // Initialize ranker with fallback-optimized weights (prefer reliability)
    this.ranker = new RouteRanker(
      this.fallbackRankingWeights
        ? {
            ...{ costWeight: 0.2, latencyWeight: 0.2, reliabilityWeight: 0.6 },
            ...this.fallbackRankingWeights,
          }
        : { costWeight: 0.2, latencyWeight: 0.2, reliabilityWeight: 0.6 },
    );
  }

  /**
   * Execute a bridge route with automatic fallback on failure
   *
   * @param routes - Ranked list of available routes (primary first)
   * @param executeFn - Function to execute a route
   * @returns Execution result with the successful route
   * @throws FallbackExecutionError if all routes fail
   */
  async executeWithFallback(
    routes: NormalizedRoute[],
    executeFn: RouteExecutorFn,
  ): Promise<ExecutionResult> {
    if (routes.length === 0) {
      throw new FallbackExecutionError(
        'No routes available for execution',
        FallbackErrorCode.NO_FALLBACK_AVAILABLE,
        [],
      );
    }

    const attemptedRoutes: NormalizedRoute[] = [];
    const maxAttempts = Math.min(
      this.config.maxFallbackAttempts,
      routes.length,
    );
    let currentAttempt = 0;

    // Optionally re-rank routes for fallback prioritization
    const rankedRoutes = this.config.rerankOnFallback
      ? this.ranker.rankRoutes(routes)
      : routes;

    while (currentAttempt < maxAttempts) {
      const route = rankedRoutes[currentAttempt];

      // Skip previously failed routes
      if (this.failedRoutes.has(route.id)) {
        currentAttempt++;
        continue;
      }

      // Check for duplicate execution
      if (this.isExecutionActive(route.id)) {
        throw new FallbackExecutionError(
          `Route ${route.id} is already being executed`,
          FallbackErrorCode.DUPLICATE_EXECUTION,
          attemptedRoutes,
          route,
        );
      }

      // Update status
      this.emitStatus(
        currentAttempt === 0 ? 'executing' : 'switching',
        route,
        currentAttempt + 1,
        maxAttempts,
      );

      // Mark execution as active
      this.markExecutionActive(route);
      attemptedRoutes.push(route);

      const startTime = Date.now();

      try {
        const result = await this.executeWithTimeout(route, executeFn);

        if (result.success) {
          this.markExecutionComplete(route.id);
          this.emitStatus('completed', route, currentAttempt + 1, maxAttempts);

          return {
            success: true,
            transactionHash: result.transactionHash,
            route,
            executionTimeMs: Date.now() - startTime,
            fallbacksUsed: currentAttempt,
          };
        }

        // Execution returned failure (not exception)
        this.handleRouteFailure(
          route,
          new Error(result.error || 'Execution failed'),
        );
      } catch (error) {
        this.handleRouteFailure(route, error as Error);
      }

      // Emit error status
      this.emitStatus(
        'switching',
        route,
        currentAttempt + 1,
        maxAttempts,
        new Error(`Route ${route.adapter} failed, switching to fallback`),
      );

      // Wait before trying fallback
      if (currentAttempt < maxAttempts - 1) {
        await this.delay(this.config.fallbackDelayMs);
      }

      currentAttempt++;
    }

    // All routes failed
    this.emitStatus(
      'failed',
      rankedRoutes[rankedRoutes.length - 1],
      maxAttempts,
      maxAttempts,
      new Error('All fallback routes exhausted'),
    );

    throw new FallbackExecutionError(
      `All ${attemptedRoutes.length} routes failed`,
      FallbackErrorCode.ALL_ROUTES_FAILED,
      attemptedRoutes,
    );
  }

  /**
   * Execute a route with timeout
   */
  private async executeWithTimeout(
    route: NormalizedRoute,
    executeFn: RouteExecutorFn,
  ): Promise<{ success: boolean; transactionHash?: string; error?: string }> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(
          new FallbackExecutionError(
            `Execution timeout after ${this.config.executionTimeout}ms`,
            FallbackErrorCode.TIMEOUT,
            [],
            route,
          ),
        );
      }, this.config.executionTimeout);
    });

    return Promise.race([executeFn(route), timeoutPromise]);
  }

  /**
   * Check if a route execution is already active
   */
  private isExecutionActive(routeId: string): boolean {
    const execution = this.activeExecutions.get(routeId);
    if (!execution) return false;

    // Check if execution has timed out (stale)
    const elapsed = Date.now() - execution.startTime;
    if (elapsed > this.config.executionTimeout * 2) {
      // Clean up stale execution
      this.activeExecutions.delete(routeId);
      return false;
    }

    return true;
  }

  /**
   * Mark a route execution as active
   */
  private markExecutionActive(route: NormalizedRoute): void {
    this.activeExecutions.set(route.id, {
      startTime: Date.now(),
      route,
    });
  }

  /**
   * Mark a route execution as complete
   */
  private markExecutionComplete(routeId: string): void {
    this.activeExecutions.delete(routeId);
  }

  /**
   * Handle a route execution failure
   */
  private handleRouteFailure(route: NormalizedRoute, error: Error): void {
    this.activeExecutions.delete(route.id);
    this.failedRoutes.add(route.id);

    console.error(
      `[FallbackRouteExecutor] Route ${route.id} (${route.adapter}) failed:`,
      error.message,
    );
  }

  /**
   * Emit status update to callback
   */
  private emitStatus(
    status: FallbackExecutionStatus,
    route: NormalizedRoute,
    attemptNumber: number,
    totalRoutes: number,
    error?: Error,
  ): void {
    this.onStatusChange?.({
      currentStatus: status,
      currentRoute: route,
      attemptNumber,
      totalRoutes,
      error,
    });
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Reset the executor state (clears failed routes and active executions)
   */
  reset(): void {
    this.failedRoutes.clear();
    this.activeExecutions.clear();
  }

  /**
   * Get the list of currently failed route IDs
   */
  getFailedRoutes(): string[] {
    return Array.from(this.failedRoutes);
  }

  /**
   * Check if a specific route has failed
   */
  hasRouteFailed(routeId: string): boolean {
    return this.failedRoutes.has(routeId);
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(config: Partial<FallbackExecutorConfig>): void {
    if (config.maxFallbackAttempts !== undefined) {
      this.config.maxFallbackAttempts = config.maxFallbackAttempts;
    }
    if (config.executionTimeout !== undefined) {
      this.config.executionTimeout = config.executionTimeout;
    }
    if (config.fallbackDelayMs !== undefined) {
      this.config.fallbackDelayMs = config.fallbackDelayMs;
    }
    if (config.rerankOnFallback !== undefined) {
      this.config.rerankOnFallback = config.rerankOnFallback;
    }
    if (config.onStatusChange !== undefined) {
      this.onStatusChange = config.onStatusChange;
    }
    if (config.fallbackRankingWeights !== undefined) {
      this.fallbackRankingWeights = config.fallbackRankingWeights;
      this.ranker = new RouteRanker({
        costWeight: 0.2,
        latencyWeight: 0.2,
        reliabilityWeight: 0.6,
        ...this.fallbackRankingWeights,
      });
    }
  }
}

/**
 * Create a pre-configured fallback executor for common scenarios
 */
export function createFallbackExecutor(
  scenario: 'aggressive' | 'balanced' | 'conservative' = 'balanced',
): FallbackRouteExecutor {
  const configs: Record<string, FallbackExecutorConfig> = {
    aggressive: {
      maxFallbackAttempts: 5,
      executionTimeout: 20000,
      fallbackDelayMs: 500,
      rerankOnFallback: true,
      fallbackRankingWeights: {
        costWeight: 0.1,
        latencyWeight: 0.3,
        reliabilityWeight: 0.6,
      },
    },
    balanced: {
      maxFallbackAttempts: 3,
      executionTimeout: 30000,
      fallbackDelayMs: 1000,
      rerankOnFallback: true,
      fallbackRankingWeights: {
        costWeight: 0.2,
        latencyWeight: 0.2,
        reliabilityWeight: 0.6,
      },
    },
    conservative: {
      maxFallbackAttempts: 2,
      executionTimeout: 45000,
      fallbackDelayMs: 2000,
      rerankOnFallback: false,
      fallbackRankingWeights: {
        costWeight: 0.3,
        latencyWeight: 0.1,
        reliabilityWeight: 0.6,
      },
    },
  };

  return new FallbackRouteExecutor(configs[scenario]);
}

export default FallbackRouteExecutor;
