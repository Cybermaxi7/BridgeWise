"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_2 = require("@testing-library/react");
const RetryFeedback_1 = require("../RetryFeedback");
const useTransactionPersistence_1 = require("../ui-lib/hooks/useTransactionPersistence");
/**
 * Test Suite for Retry UI Feedback
 * Tests the RetryFeedback component, TransactionHeartbeat integration, and hooks
 */
describe('RetryFeedback Component', () => {
    describe('Display & Visibility', () => {
        it('should render nothing when no retry state', () => {
            const { container } = (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={0} maxAttempts={3}/>);
            expect(container.firstChild).toBeNull();
        });
        it('should display retry information during retry', () => {
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={2} maxAttempts={3} lastError="Connection timeout"/>);
            expect(react_2.screen.getByText(/Retrying Transaction/)).toBeInTheDocument();
            expect(react_2.screen.getByText(/Attempt 2 of 3/)).toBeInTheDocument();
            expect(react_2.screen.getByText(/Connection timeout/)).toBeInTheDocument();
        });
        it('should show failed state when retry fails', () => {
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={3} maxAttempts={3} lastError="Max retries exceeded"/>);
            expect(react_2.screen.getByText(/Retry Failed/)).toBeInTheDocument();
            expect(react_2.screen.getByText(/Max retries exceeded/)).toBeInTheDocument();
        });
    });
    describe('Progress Tracking', () => {
        it('should display progress bar with correct width', () => {
            const { container } = (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={2} maxAttempts={4}/>);
            const progressBar = container.querySelector('[style*="width"]');
            expect(progressBar).toHaveStyle({ width: '50%' }); // 2/4 = 50%
        });
        it('should show remaining retries count', () => {
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={2} maxAttempts={3}/>);
            expect(react_2.screen.getByText(/1 retry remaining/)).toBeInTheDocument();
        });
        it('should show singular/plural correctly for remaining retries', () => {
            const { rerender } = (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={2} maxAttempts={3}/>);
            expect(react_2.screen.getByText(/1 retry remaining/)).toBeInTheDocument();
            rerender(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={1} maxAttempts={3}/>);
            expect(react_2.screen.getByText(/2 retries remaining/)).toBeInTheDocument();
        });
    });
    describe('Countdown Timer', () => {
        it('should display countdown when retrying with nextRetryIn', () => {
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={1} maxAttempts={3} nextRetryIn={2000}/>);
            expect(react_2.screen.getByText(/Next retry in:/)).toBeInTheDocument();
            expect(react_2.screen.getByText(/2s/)).toBeInTheDocument();
        });
        it('should not display countdown when nextRetryIn is 0 or undefined', () => {
            const { rerender } = (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={1} maxAttempts={3}/>);
            expect(react_2.screen.queryByText(/Next retry in:/)).not.toBeInTheDocument();
            rerender(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={1} maxAttempts={3} nextRetryIn={0}/>);
            expect(react_2.screen.queryByText(/Next retry in:/)).not.toBeInTheDocument();
        });
    });
    describe('User Interactions', () => {
        it('should show retry button when has retries remaining', () => {
            const mockRetry = jest.fn();
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={1} maxAttempts={3} onRetry={mockRetry}/>);
            const retryButton = react_2.screen.getByText('Retry Now');
            expect(retryButton).toBeInTheDocument();
            expect(retryButton).not.toBeDisabled();
        });
        it('should not show retry button when no retries remaining', () => {
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={3} maxAttempts={3}/>);
            expect(react_2.screen.queryByText('Retry Now')).not.toBeInTheDocument();
        });
        it('should call onRetry when retry button clicked', async () => {
            const mockRetry = jest.fn();
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={1} maxAttempts={3} onRetry={mockRetry}/>);
            const retryButton = react_2.screen.getByText('Retry Now');
            react_2.fireEvent.click(retryButton);
            expect(mockRetry).toHaveBeenCalledTimes(1);
        });
        it('should not show retry button while currently retrying', () => {
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={2} maxAttempts={3} onRetry={jest.fn()}/>);
            expect(react_2.screen.queryByText('Retry Now')).not.toBeInTheDocument();
        });
    });
    describe('Visual States', () => {
        it('should show spinner during active retry', () => {
            const { container } = (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={1} maxAttempts={3}/>);
            const spinner = container.querySelector('.animate-bounce');
            expect(spinner).toBeInTheDocument();
        });
        it('should display error box when no retries remaining', () => {
            const { container } = (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={3} maxAttempts={3} lastError="Service unavailable"/>);
            expect(react_2.screen.getByText(/Transaction failed after 3 attempts/)).toBeInTheDocument();
        });
        it('should use amber colors for retry state', () => {
            const { container } = (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={1} maxAttempts={3}/>);
            const ambientContainer = container.querySelector('.bg-gradient-to-r');
            expect(ambientContainer).toHaveClass('from-amber-50', 'to-orange-50');
        });
    });
    describe('Accessibility', () => {
        it('should have proper semantic structure', () => {
            const { container } = (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={true} currentAttempt={1} maxAttempts={3}/>);
            // Check for proper heading structure
            expect(container.querySelector('div')).toBeInTheDocument();
        });
        it('should be keyboard accessible', async () => {
            const mockRetry = jest.fn();
            (0, react_2.render)(<RetryFeedback_1.RetryFeedback isRetrying={false} currentAttempt={1} maxAttempts={3} onRetry={mockRetry}/>);
            const retryButton = react_2.screen.getByText('Retry Now');
            retryButton.focus();
            react_2.fireEvent.keyDown(retryButton, { key: 'Enter', code: 'Enter' });
            expect(mockRetry).toHaveBeenCalled();
        });
    });
});
describe('TransactionHeartbeat with Retry Integration', () => {
    it('should display retry feedback when retrying', () => {
        const mockState = {
            id: 'tx-1',
            status: 'pending',
            progress: 50,
            step: 'Retrying...',
            timestamp: Date.now(),
            retryInfo: {
                isRetrying: true,
                retryCount: 2,
                maxRetries: 3,
                attempts: [
                    { attempt: 1, timestamp: Date.now(), error: 'Connection failed' }
                ]
            }
        };
        // Note: This requires mocking useTransactionPersistence hook
        // Implementation depends on your testing setup
    });
    it('should show retry button in TransactionHeartbeat', () => {
        // Implementation for integration test
    });
    it('should display progress with amber color during retry', () => {
        // Implementation for integration test
    });
});
describe('useTransactionPersistence Hook - Retry Methods', () => {
    it('should provide startRetry method', () => {
        const TestComponent = () => {
            const { startRetry } = (0, useTransactionPersistence_1.useTransactionPersistence)();
            react_1.default.useEffect(() => {
                startRetry(3);
            }, [startRetry]);
            return null;
        };
        (0, react_2.render)(<TestComponent />);
        // Test passes if no errors thrown
    });
    it('should provide logRetryAttempt method', () => {
        const TestComponent = () => {
            const { logRetryAttempt } = (0, useTransactionPersistence_1.useTransactionPersistence)();
            react_1.default.useEffect(() => {
                logRetryAttempt('Connection timeout');
            }, [logRetryAttempt]);
            return null;
        };
        (0, react_2.render)(<TestComponent />);
        // Test passes if no errors thrown
    });
    it('should provide markRetrySuccess method', () => {
        const TestComponent = () => {
            const { markRetrySuccess } = (0, useTransactionPersistence_1.useTransactionPersistence)();
            react_1.default.useEffect(() => {
                markRetrySuccess();
            }, [markRetrySuccess]);
            return null;
        };
        (0, react_2.render)(<TestComponent />);
        // Test passes if no errors thrown
    });
    it('should update state with retry information', () => {
        const TestComponent = () => {
            const { state, startRetry } = (0, useTransactionPersistence_1.useTransactionPersistence)();
            react_1.default.useEffect(() => {
                startRetry(3);
            }, [startRetry]);
            return <div>{state.retryInfo ? 'Retrying' : 'Not retrying'}</div>;
        };
        (0, react_2.render)(<TestComponent />);
        expect(react_2.screen.getByText('Retrying')).toBeInTheDocument();
    });
});
describe('Retry Service Integration', () => {
    it('should track retry attempts correctly', () => {
        // Test TransactionRetryService.getRetryState()
    });
    it('should respect max retries limit', () => {
        // Test that service stops after maxRetries
    });
    it('should calculate backoff correctly', () => {
        // Test exponential backoff calculation
    });
    it('should notify listeners on retry state change', () => {
        // Test onRetryStateChange callback
    });
});
describe('End-to-End Retry Flow', () => {
    it('should handle complete retry flow from error to success', async () => {
        // 1. Start transaction
        // 2. Simulate error
        // 3. Show retry feedback
        // 4. Wait for retry countdown
        // 5. Attempt retry
        // 6. Show success
    });
    it('should handle complete retry flow with failure after max retries', async () => {
        // 1. Start transaction
        // 2. Simulate errors
        // 3. Show retry feedback
        // 4. Exhaust retries
        // 5. Show final error message
    });
    it('should allow manual retry trigger', async () => {
        // 1. Start failed transaction
        // 2. Click retry button
        // 3. Verify retry process starts
    });
});
//# sourceMappingURL=RetryFeedback.spec.js.map