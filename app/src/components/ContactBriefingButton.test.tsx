import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContactBriefingButton from './ContactBriefingButton';

describe('ContactBriefingButton', () => {
  it('renders with correct text', () => {
    render(<ContactBriefingButton onClick={() => {}} />);

    expect(screen.getByRole('button', { name: /prep for chat/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<ContactBriefingButton onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows Sparkles icon', () => {
    render(<ContactBriefingButton onClick={() => {}} />);

    // Check for svg element (lucide-react icon)
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });
});
