"use strict";
/**
 * Abandonment Tracking Service
 *
 * Frontend service for tracking quote events and fetching abandonment metrics
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackQuoteRequested = trackQuoteRequested;
exports.trackQuoteExecuted = trackQuoteExecuted;
exports.fetchAbandonmentMetrics = fetchAbandonmentMetrics;
exports.fetchAbandonmentEvents = fetchAbandonmentEvents;
exports.fetchAbandonmentStats = fetchAbandonmentStats;
exports.getLocalQuoteEvents = getLocalQuoteEvents;
exports.clearLocalQuoteEvents = clearLocalQuoteEvents;
exports.generateSessionId = generateSessionId;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
/**
 * Track a quote request event
 * Called when user fetches quotes from the bridge compare UI
 */
async function trackQuoteRequested(data) {
    try {
        // Store locally for client-side tracking
        const event = {
            type: 'quote_requested',
            sessionId: data.sessionId,
            timestamp: new Date().toISOString(),
            data,
        };
        // Store in localStorage for persistence across page navigation
        const events = JSON.parse(localStorage.getItem('quote_events') || '[]');
        events.push(event);
        // Keep last 100 events
        if (events.length > 100) {
            events.shift();
        }
        localStorage.setItem('quote_events', JSON.stringify(events));
        console.debug('Quote requested tracked:', data);
    }
    catch (error) {
        console.error('Failed to track quote request:', error);
    }
}
/**
 * Track a quote execution event
 * Called when user actually executes a transaction
 */
async function trackQuoteExecuted(data) {
    try {
        const event = {
            type: 'quote_executed',
            sessionId: data.sessionId,
            timestamp: new Date().toISOString(),
            data,
        };
        const events = JSON.parse(localStorage.getItem('quote_events') || '[]');
        events.push(event);
        if (events.length > 100) {
            events.shift();
        }
        localStorage.setItem('quote_events', JSON.stringify(events));
        console.debug('Quote executed tracked:', data);
    }
    catch (error) {
        console.error('Failed to track quote execution:', error);
    }
}
/**
 * Get abandonment metrics from the API
 */
async function fetchAbandonmentMetrics(params) {
    const queryParams = new URLSearchParams();
    if (params.startDate)
        queryParams.append('startDate', params.startDate);
    if (params.endDate)
        queryParams.append('endDate', params.endDate);
    if (params.bridgeName)
        queryParams.append('bridgeName', params.bridgeName);
    if (params.sourceChain)
        queryParams.append('sourceChain', params.sourceChain);
    if (params.destinationChain)
        queryParams.append('destinationChain', params.destinationChain);
    if (params.token)
        queryParams.append('token', params.token);
    if (params.groupBy)
        queryParams.append('groupBy', params.groupBy);
    const response = await fetch(`${API_BASE_URL}/analytics/abandonment/metrics?${queryParams.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}
/**
 * Get quote events from the API for export/analysis
 */
async function fetchAbandonmentEvents(params) {
    const queryParams = new URLSearchParams();
    if (params.startDate)
        queryParams.append('startDate', params.startDate);
    if (params.endDate)
        queryParams.append('endDate', params.endDate);
    if (params.eventType)
        queryParams.append('eventType', params.eventType);
    if (params.limit)
        queryParams.append('limit', params.limit.toString());
    const response = await fetch(`${API_BASE_URL}/analytics/abandonment/events?${queryParams.toString()}`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}
/**
 * Get tracking statistics
 */
async function fetchAbandonmentStats() {
    const response = await fetch(`${API_BASE_URL}/analytics/abandonment/stats`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
}
/**
 * Get local quote events (stored in localStorage)
 */
function getLocalQuoteEvents() {
    try {
        return JSON.parse(localStorage.getItem('quote_events') || '[]');
    }
    catch {
        return [];
    }
}
/**
 * Clear local quote events
 */
function clearLocalQuoteEvents() {
    localStorage.removeItem('quote_events');
}
/**
 * Generate a unique session ID for tracking
 */
function generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
//# sourceMappingURL=abandonment-tracking.service.js.map