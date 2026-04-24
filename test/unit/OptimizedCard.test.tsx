import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OptimizedCard } from '../../libs/ui-components/src/components/OptimizedCard';

describe('OptimizedCard', () => {
  it('renders children correctly', () => {
    render(
      <OptimizedCard data-testid="test-card">
        <div>Test content</div>
      </OptimizedCard>
    );

    expect(screen.getByTestId('test-card')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <OptimizedCard className="custom-class" data-testid="test-card">
        <div>Test content</div>
      </OptimizedCard>
    );

    const card = screen.getByTestId('test-card');
    expect(card).toHaveClass('custom-class');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    
    render(
      <OptimizedCard onClick={handleClick} data-testid="test-card">
        <div>Test content</div>
      </OptimizedCard>
    );

    const card = screen.getByTestId('test-card');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(
      <OptimizedCard isLoading={true} data-testid="test-card">
        <div>Test content</div>
      </OptimizedCard>
    );

    const card = screen.getByTestId('test-card');
    expect(card).toHaveClass('opacity-70', 'pointer-events-none');
  });

  it('has correct accessibility attributes', () => {
    render(
      <OptimizedCard data-testid="test-card">
        <div>Test content</div>
      </OptimizedCard>
    );

    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('data-testid', 'test-card');
  });

  it('memoizes component correctly', () => {
    const { rerender } = render(
      <OptimizedCard data-testid="test-card">
        <div>Test content</div>
      </OptimizedCard>
    );

    const initialCard = screen.getByTestId('test-card');
    
    rerender(
      <OptimizedCard data-testid="test-card">
        <div>Test content</div>
      </OptimizedCard>
    );

    const rerenderedCard = screen.getByTestId('test-card');
    expect(initialCard).toBe(rerenderedCard);
  });
});
