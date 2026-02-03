import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactBriefingModal from './ContactBriefingModal';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('ContactBriefingModal', () => {
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
    upcomingMilestones: ['Her birthday is coming up in June'],
  };

  it('does not render when closed', () => {
    render(
      <ContactBriefingModal
        isOpen={false}
        onClose={() => {}}
        contactId="123"
        contactName="Sarah"
      />
    );

    expect(screen.queryByText(/conversation prep/i)).not.toBeInTheDocument();
  });

  it('does not fetch when modal is closed', () => {
    render(
      <ContactBriefingModal
        isOpen={false}
        onClose={() => {}}
        contactId="123"
        contactName="Sarah"
      />
    );

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches briefing when modal opens', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, briefing: mockBriefing, fromCache: false }),
    });

    render(
      <ContactBriefingModal
        isOpen={true}
        onClose={() => {}}
        contactId="123"
        contactName="Sarah"
      />
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/contacts/123/briefing', {
        method: 'POST',
      });
    });
  });

  it('shows loading state during fetch', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <ContactBriefingModal
        isOpen={true}
        onClose={() => {}}
        contactId="123"
        contactName="Sarah"
      />
    );

    expect(screen.getByText(/generating briefing/i)).toBeInTheDocument();
  });

  it('displays briefing content on success', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, briefing: mockBriefing, fromCache: false }),
    });

    render(
      <ContactBriefingModal
        isOpen={true}
        onClose={() => {}}
        contactId="123"
        contactName="Sarah"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockBriefing.relationshipSummary)).toBeInTheDocument();
    });

    expect(screen.getByText('Started a new job at a startup')).toBeInTheDocument();
    expect(screen.getByText('How is your mom recovering?')).toBeInTheDocument();
    expect(screen.getByText('Her birthday is coming up in June')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Failed to generate briefing' }),
    });

    render(
      <ContactBriefingModal
        isOpen={true}
        onClose={() => {}}
        contactId="123"
        contactName="Sarah"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/failed to generate briefing/i)).toBeInTheDocument();
    });
  });

  it('shows "from cache" indicator when cached', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, briefing: mockBriefing, fromCache: true }),
    });

    render(
      <ContactBriefingModal
        isOpen={true}
        onClose={() => {}}
        contactId="123"
        contactName="Sarah"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/cached/i)).toBeInTheDocument();
    });
  });

  it('refresh button triggers forceRefresh fetch', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, briefing: mockBriefing, fromCache: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          briefing: { ...mockBriefing, relationshipSummary: 'Updated summary' },
          fromCache: false,
        }),
      });

    render(
      <ContactBriefingModal
        isOpen={true}
        onClose={() => {}}
        contactId="123"
        contactName="Sarah"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockBriefing.relationshipSummary)).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenLastCalledWith(
        '/api/contacts/123/briefing?forceRefresh=true',
        { method: 'POST' }
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Updated summary')).toBeInTheDocument();
    });
  });

  it('closes when X button is clicked', async () => {
    const handleClose = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, briefing: mockBriefing, fromCache: false }),
    });

    render(
      <ContactBriefingModal
        isOpen={true}
        onClose={handleClose}
        contactId="123"
        contactName="Sarah"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockBriefing.relationshipSummary)).toBeInTheDocument();
    });

    // Find all buttons and get the last one (the X close button)
    const closeButtons = screen.getAllByRole('button');
    // The X button is after the Refresh button, so find the one without text
    const closeButton = closeButtons.find(btn => !btn.textContent?.includes('Refresh'));
    if (closeButton) {
      fireEvent.click(closeButton);
    }

    expect(handleClose).toHaveBeenCalled();
  });

  it('closes when backdrop is clicked', async () => {
    const handleClose = vi.fn();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, briefing: mockBriefing, fromCache: false }),
    });

    render(
      <ContactBriefingModal
        isOpen={true}
        onClose={handleClose}
        contactId="123"
        contactName="Sarah"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(mockBriefing.relationshipSummary)).toBeInTheDocument();
    });

    // Click the backdrop
    const backdrop = document.querySelector('.bg-black\\/30');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(handleClose).toHaveBeenCalled();
  });
});
