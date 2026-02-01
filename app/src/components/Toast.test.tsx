import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Toast from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('success variant', () => {
    it('renders success message with grove-primary styling', () => {
      render(<Toast message="Saved successfully" type="success" onClose={() => {}} />);

      expect(screen.getByText('Saved successfully')).toBeInTheDocument();
      // Check for grove-primary background class on container
      const container = screen.getByText('Saved successfully').closest('div');
      expect(container).toHaveClass('bg-grove-primary/90');
    });

    it('shows Check icon for success', () => {
      render(<Toast message="Success" type="success" onClose={() => {}} />);

      // Check icon should be present (svg element)
      const toast = screen.getByText('Success').closest('div');
      expect(toast?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('error variant', () => {
    it('renders error message with red styling', () => {
      render(<Toast message="Failed to save" type="error" onClose={() => {}} />);

      expect(screen.getByText('Failed to save')).toBeInTheDocument();
      const container = screen.getByText('Failed to save').closest('div');
      expect(container).toHaveClass('bg-red-600/90');
    });

    it('shows AlertCircle icon for error', () => {
      render(<Toast message="Error" type="error" onClose={() => {}} />);

      const toast = screen.getByText('Error').closest('div');
      expect(toast?.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('auto-dismiss', () => {
    it('calls onClose after default duration for success (4000ms)', () => {
      const onClose = vi.fn();
      render(<Toast message="Success" type="success" onClose={onClose} />);

      expect(onClose).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Allow for exit animation (300ms)
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose after default duration for error (6000ms)', () => {
      const onClose = vi.fn();
      render(<Toast message="Error" type="error" onClose={onClose} />);

      act(() => {
        vi.advanceTimersByTime(4000);
      });

      // Should not have closed yet (error has longer duration)
      expect(onClose).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('uses custom duration when provided', () => {
      const onClose = vi.fn();
      render(<Toast message="Custom" type="success" onClose={onClose} duration={2000} />);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('manual close', () => {
    it('closes when X button is clicked', () => {
      const onClose = vi.fn();
      render(<Toast message="Test" type="success" onClose={onClose} />);

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry button', () => {
    it('shows retry button when onRetry is provided', () => {
      const onRetry = vi.fn();
      render(<Toast message="Failed" type="error" onClose={() => {}} onRetry={onRetry} />);

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('does not show retry button when onRetry is not provided', () => {
      render(<Toast message="Failed" type="error" onClose={() => {}} />);

      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', () => {
      const onRetry = vi.fn();
      render(<Toast message="Failed" type="error" onClose={() => {}} onRetry={onRetry} />);

      fireEvent.click(screen.getByRole('button', { name: /retry/i }));

      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });
});
