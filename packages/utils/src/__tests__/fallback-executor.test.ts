/**
 * Tests for FallbackRouteExecutor
 *
 * @module fallback-executor.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  FallbackRouteExecutor,
  FallbackExecutionError,
  FallbackErrorCode,
  createFallbackExecutor,
  type FallbackStatusCallback,
  type RouteExecutorFn,
} from '../fallback-executor';
import { NormalizedRoute, BridgeProvider } from '../types';

// Mock route factory
function createMockRoute(
  id: string,
  adapter: BridgeProvider = 'hop',
  reliability: number = 0.95,
): NormalizedRoute {
  return {
    id,
    sourceChain: 'ethereum',
    destinationChain: 'polygon',
    tokenIn: 'USDC',
    tokenOut: 'USDC',
    totalFees: '1000000',
    estimatedTime: 120,
    hops: [],
    adapter,
    metadata: {
      inputAmount: '100000000',
      outputAmount: '99000000',
      fee: '1000000',
      feePercentage: 1,
      reliability,
    },
  };
}

describe('FallbackRouteExecutor', () => {
  let executor: FallbackRouteExecutor;
  let statusUpdates: Array<{
    currentStatus: string;
    currentRoute: NormalizedRoute;
    attemptNumber: number;
    totalRoutes: number;
    error?: Error;
  }>;

  beforeEach(() => {
    vi.useFakeTimers();
    statusUpdates = [];

    executor = new FallbackRouteExecutor({
      maxFallbackAttempts: 3,
      executionTimeout: 5000,
      fallbackDelayMs: 100,
      onStatusChange: (status) => statusUpdates.push(status),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    executor.reset();
  });

  describe('successful execution', () => {
    it('executes primary route successfully without fallback', async () => {
      const routes = [
        createMockRoute('route-1', 'hop'),
        createMockRoute('route-2', 'layerzero'),
      ];

      const executeFn: RouteExecutorFn = vi.fn().mockResolvedValue({
        success: true,
        transactionHash: '0xabc123',
      });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe('0xabc123');
      expect(result.route.id).toBe('route-1');
      expect(result.fallbacksUsed).toBe(0);
      expect(executeFn).toHaveBeenCalledTimes(1);
    });

    it('includes execution time in result', async () => {
      const routes = [createMockRoute('route-1')];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockImplementation(async () => {
          await new Promise((r) => setTimeout(r, 100));
          return { success: true, transactionHash: '0x123' };
        });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('fallback on failure', () => {
    it('switches to fallback route when primary fails', async () => {
      const routes = [
        createMockRoute('route-1', 'hop'),
        createMockRoute('route-2', 'layerzero'),
      ];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValueOnce({ success: false, error: 'Liquidity error' })
        .mockResolvedValueOnce({ success: true, transactionHash: '0xdef456' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe('0xdef456');
      expect(result.fallbacksUsed).toBe(1);
      expect(executeFn).toHaveBeenCalledTimes(2);
    });

    it('handles execution exceptions and falls back', async () => {
      const routes = [
        createMockRoute('route-1', 'hop'),
        createMockRoute('route-2', 'layerzero'),
      ];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true, transactionHash: '0x789' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.fallbacksUsed).toBe(1);
    });

    it('tries multiple fallbacks until success', async () => {
      const routes = [
        createMockRoute('route-1', 'hop'),
        createMockRoute('route-2', 'layerzero'),
        createMockRoute('route-3', 'stellar'),
      ];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValueOnce({ success: false, error: 'Error 1' })
        .mockResolvedValueOnce({ success: false, error: 'Error 2' })
        .mockResolvedValueOnce({ success: true, transactionHash: '0xfinal' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      const result = await resultPromise;

      expect(result.success).toBe(true);
      expect(result.fallbacksUsed).toBe(2);
      expect(executeFn).toHaveBeenCalledTimes(3);
    });

    it('throws ALL_ROUTES_FAILED when all routes fail', async () => {
      const routes = [
        createMockRoute('route-1', 'hop'),
        createMockRoute('route-2', 'layerzero'),
      ];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValue({ success: false, error: 'Failed' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toThrow(FallbackExecutionError);
      await expect(resultPromise).rejects.toMatchObject({
        code: FallbackErrorCode.ALL_ROUTES_FAILED,
      });
    });

    it('respects maxFallbackAttempts configuration', async () => {
      const executor = new FallbackRouteExecutor({
        maxFallbackAttempts: 2,
        fallbackDelayMs: 10,
      });

      const routes = [
        createMockRoute('route-1'),
        createMockRoute('route-2'),
        createMockRoute('route-3'),
        createMockRoute('route-4'),
      ];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValue({ success: false, error: 'Failed' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();

      await expect(resultPromise).rejects.toThrow(FallbackExecutionError);
      expect(executeFn).toHaveBeenCalledTimes(2); // Limited by maxFallbackAttempts
    });
  });

  describe('duplicate execution prevention', () => {
    it('prevents duplicate execution of the same route', async () => {
      const routes = [createMockRoute('route-1')];

      // Simulate a long-running execution
      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockImplementation(async () => {
          await new Promise((r) => setTimeout(r, 10000));
          return { success: true, transactionHash: '0x123' };
        });

      // Start first execution (don't await)
      const firstExecution = executor.executeWithFallback(routes, executeFn);

      // Attempt second execution immediately
      await vi.advanceTimersByTimeAsync(50);

      await expect(
        executor.executeWithFallback(routes, executeFn),
      ).rejects.toMatchObject({
        code: FallbackErrorCode.DUPLICATE_EXECUTION,
      });

      // Cleanup
      await vi.runAllTimersAsync();
      await firstExecution.catch(() => {}); // Ignore timeout
    });

    it('allows re-execution after completion', async () => {
      const routes = [createMockRoute('route-1')];

      const executeFn: RouteExecutorFn = vi.fn().mockResolvedValue({
        success: true,
        transactionHash: '0x123',
      });

      // First execution
      const result1Promise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      await result1Promise;

      // Reset to allow re-execution
      executor.reset();

      // Second execution should work
      const result2Promise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      const result2 = await result2Promise;

      expect(result2.success).toBe(true);
      expect(executeFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('status updates', () => {
    it('emits executing status on start', async () => {
      const routes = [createMockRoute('route-1')];

      const executeFn: RouteExecutorFn = vi.fn().mockResolvedValue({
        success: true,
        transactionHash: '0x123',
      });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(statusUpdates[0].currentStatus).toBe('executing');
      expect(statusUpdates[0].attemptNumber).toBe(1);
    });

    it('emits switching status on fallback', async () => {
      const routes = [createMockRoute('route-1'), createMockRoute('route-2')];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValueOnce({ success: false, error: 'Failed' })
        .mockResolvedValueOnce({ success: true, transactionHash: '0x123' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      await resultPromise;

      const switchingUpdates = statusUpdates.filter(
        (s) => s.currentStatus === 'switching',
      );
      expect(switchingUpdates.length).toBeGreaterThan(0);
    });

    it('emits completed status on success', async () => {
      const routes = [createMockRoute('route-1')];

      const executeFn: RouteExecutorFn = vi.fn().mockResolvedValue({
        success: true,
        transactionHash: '0x123',
      });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      await resultPromise;

      const completedUpdate = statusUpdates.find(
        (s) => s.currentStatus === 'completed',
      );
      expect(completedUpdate).toBeDefined();
    });

    it('emits failed status when all routes fail', async () => {
      const routes = [createMockRoute('route-1')];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValue({ success: false, error: 'Failed' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      await resultPromise.catch(() => {});

      const failedUpdate = statusUpdates.find(
        (s) => s.currentStatus === 'failed',
      );
      expect(failedUpdate).toBeDefined();
    });
  });

  describe('timeout handling', () => {
    it('times out slow executions', async () => {
      const executor = new FallbackRouteExecutor({
        executionTimeout: 100,
        maxFallbackAttempts: 1,
        fallbackDelayMs: 10,
      });

      const routes = [createMockRoute('route-1')];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockImplementation(async () => {
          await new Promise((r) => setTimeout(r, 5000));
          return { success: true, transactionHash: '0x123' };
        });

      const resultPromise = executor.executeWithFallback(routes, executeFn);

      // Advance past timeout
      await vi.advanceTimersByTimeAsync(150);

      await expect(resultPromise).rejects.toMatchObject({
        code: FallbackErrorCode.ALL_ROUTES_FAILED,
      });
    });
  });

  describe('empty routes', () => {
    it('throws NO_FALLBACK_AVAILABLE for empty routes array', async () => {
      const executeFn: RouteExecutorFn = vi.fn();

      await expect(
        executor.executeWithFallback([], executeFn),
      ).rejects.toMatchObject({
        code: FallbackErrorCode.NO_FALLBACK_AVAILABLE,
      });

      expect(executeFn).not.toHaveBeenCalled();
    });
  });

  describe('failed routes tracking', () => {
    it('tracks failed routes', async () => {
      const routes = [createMockRoute('route-1'), createMockRoute('route-2')];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValueOnce({ success: false, error: 'Failed' })
        .mockResolvedValueOnce({ success: true, transactionHash: '0x123' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      await resultPromise;

      expect(executor.hasRouteFailed('route-1')).toBe(true);
      expect(executor.hasRouteFailed('route-2')).toBe(false);
      expect(executor.getFailedRoutes()).toContain('route-1');
    });

    it('clears failed routes on reset', async () => {
      const routes = [createMockRoute('route-1')];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValue({ success: false, error: 'Failed' });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      await resultPromise.catch(() => {});

      expect(executor.hasRouteFailed('route-1')).toBe(true);

      executor.reset();

      expect(executor.hasRouteFailed('route-1')).toBe(false);
    });
  });

  describe('configuration updates', () => {
    it('allows runtime configuration updates', async () => {
      const routes = [
        createMockRoute('route-1'),
        createMockRoute('route-2'),
        createMockRoute('route-3'),
      ];

      const executeFn: RouteExecutorFn = vi
        .fn()
        .mockResolvedValue({ success: false, error: 'Failed' });

      // Update to only allow 1 attempt
      executor.updateConfig({ maxFallbackAttempts: 1 });

      const resultPromise = executor.executeWithFallback(routes, executeFn);
      await vi.runAllTimersAsync();
      await resultPromise.catch(() => {});

      expect(executeFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('createFallbackExecutor factory', () => {
    it('creates aggressive executor', () => {
      const executor = createFallbackExecutor('aggressive');
      expect(executor).toBeInstanceOf(FallbackRouteExecutor);
    });

    it('creates balanced executor', () => {
      const executor = createFallbackExecutor('balanced');
      expect(executor).toBeInstanceOf(FallbackRouteExecutor);
    });

    it('creates conservative executor', () => {
      const executor = createFallbackExecutor('conservative');
      expect(executor).toBeInstanceOf(FallbackRouteExecutor);
    });

    it('defaults to balanced scenario', () => {
      const executor = createFallbackExecutor();
      expect(executor).toBeInstanceOf(FallbackRouteExecutor);
    });
  });
});
