import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactBriefing from './ContactBriefing';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContactBriefing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBriefing = {
    relationshipSummary: 'Sarah is a close friend who loves outdoor activities.',
    recentHighlights: [
      'Started a new job at a startup',
      'Her mom had surgery recently',
    ],
    conversationStarters: [
      'How is your mom recovering?',
      'How is the new job going?',
    ],
    upcomingMilestones: [
      'Her birthday is coming up in June',
    ],
  };

  it('renders loading state initially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<ContactBriefing contactId="123" contactName="Sarah" />);

    expect(screen.getByText(/generating briefing/i)).toBeInTheDocument();
  });

  it('renders briefing data after successful fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, briefing: mockBriefing }),
    });

    render(<ContactBriefing contactId="123" contactName="Sarah" />);

    await waitFor(() => {
      expect(screen.getByText(mockBriefing.relationshipSummary)).toBeInTheDocument();
    });

    expect(screen.getByText('Started a new job at a startup')).toBeInTheDocument();
    expect(screen.getByText('How is your mom recovering?')).toBeInTheDocument();
  });

  it('renders error state on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to generate briefing' }),
    });

    render(<ContactBriefing contactId="123" contactName="Sarah" />);

    await waitFor(() => {
      expect(screen.getByText(/failed to generate briefing/i)).toBeInTheDocument();
    });
  });

  it('has refresh button that triggers new fetch', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, briefing: mockBriefing }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          briefing: { ...mockBriefing, relationshipSummary: 'Updated summary' },
        }),
      });

    render(<ContactBriefing contactId="123" contactName="Sarah" />);

    await waitFor(() => {
      expect(screen.getByText(mockBriefing.relationshipSummary)).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByText('Updated summary')).toBeInTheDocument();
    });

    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('handles empty briefing sections gracefully', async () => {
    const emptyBriefing = {
      relationshipSummary: 'Not much is known about John yet.',
      recentHighlights: [],
      conversationStarters: [],
      upcomingMilestones: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, briefing: emptyBriefing }),
    });

    render(<ContactBriefing contactId="456" contactName="John" />);

    await waitFor(() => {
      expect(screen.getByText(emptyBriefing.relationshipSummary)).toBeInTheDocument();
    });
  });
});
