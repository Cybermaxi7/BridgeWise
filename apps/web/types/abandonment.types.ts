/**
 * Abandonment Tracking Types
 * 
 * Type definitions for quote abandonment tracking
 */

/**
 * Quote event types
 */
export enum QuoteEventType {
  QUOTE_REQUESTED = 'quote_requested',
  QUOTE_EXECUTED = 'quote_executed',
}

/**
 * Abandonment metrics
 */
export interface AbandonmentMetrics {
  totalQuotesRequested: number;
  totalQuotesExecuted: number;
  abandonmentRate: number;
  avgTimeToExecute?: number;
  byBridge?: Record<string, AbandonmentMetrics>;
  byChain?: Record<string, AbandonmentMetrics>;
  byToken?: Record<string, AbandonmentMetrics>;
}

/**
 * Abandonment event for export
 */
export interface AbandonmentEvent {
  eventType: QuoteEventType;
  sessionId: string;
  quoteId?: string;
  bridgeName?: string;
  sourceChain: string;
  destinationChain: string;
  sourceToken: string;
  destinationToken: string;
  amount: string;
  timestamp: string;
}

/**
 * Tracking statistics
 */
export interface AbandonmentStats {
  activeSessions: number;
  totalEvents: number;
}

/**
 * Local event storage type
 */
export interface LocalQuoteEvent {
  type: 'quote_requested' | 'quote_executed';
  sessionId: string;
  timestamp: string;
  data: {
    bridgeName?: string;
    sourceChain: string;
    destinationChain: string;
    sourceToken: string;
    destinationToken?: string;
    amount: string;
    quoteId?: string;
    transactionHash?: string;
  };
}