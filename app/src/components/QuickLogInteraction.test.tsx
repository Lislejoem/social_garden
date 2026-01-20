import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import QuickLogInteraction from './QuickLogInteraction';
import type { InteractionType, MessagePlatform } from '@/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('QuickLogInteraction', () => {
  const mockOnSuccess = vi.fn();
  const mockOnPreview = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  const renderComponent = () => {
    return render(
      <QuickLogInteraction
        contactId="contact-123"
        contactName="Sarah"
        onSuccess={mockOnSuccess}
        onPreview={mockOnPreview}
      />
    );
  };

  describe('buildRawInput helper', () => {
    // These tests verify the raw input format passed to /api/ingest
    it('formats CALL type correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          preview: true,
          extraction: { contactName: 'Sarah', interactionSummary: 'Test' },
          existingContact: { id: 'contact-123', name: 'Sarah', location: null },
          isNewContact: false,
        }),
      });

      renderComponent();

      // Click Call button
      fireEvent.click(screen.getByRole('button', { name: /call/i }));

      // Enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Discussed the project timeline' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/ingest', expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('Had a phone call with Sarah'),
        }));
      });

      // Verify the body contains the summary
      const callArgs = mockFetch.mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      expect(body.rawInput).toContain('Discussed the project timeline');
    });

    it('formats MESSAGE with text platform correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          preview: true,
          extraction: { contactName: 'Sarah', interactionSummary: 'Test' },
          existingContact: { id: 'contact-123', name: 'Sarah', location: null },
          isNewContact: false,
        }),
      });

      renderComponent();

      // Click Message button
      fireEvent.click(screen.getByRole('button', { name: /message/i }));

      // Text platform is default, enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Quick check-in' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        const callArgs = mockFetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.rawInput).toContain('Texted Sarah');
        expect(body.rawInput).toContain('Quick check-in');
      });
    });

    it('formats MESSAGE with instagram platform correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          preview: true,
          extraction: { contactName: 'Sarah', interactionSummary: 'Test' },
          existingContact: { id: 'contact-123', name: 'Sarah', location: null },
          isNewContact: false,
        }),
      });

      renderComponent();

      // Click Message button
      fireEvent.click(screen.getByRole('button', { name: /message/i }));

      // Select instagram platform
      fireEvent.click(screen.getByRole('button', { name: /instagram/i }));

      // Enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Replied to her story' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        const callArgs = mockFetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.rawInput).toContain('Messaged Sarah on instagram');
        expect(body.rawInput).toContain('Replied to her story');
      });
    });

    it('formats MEET type correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          preview: true,
          extraction: { contactName: 'Sarah', interactionSummary: 'Test' },
          existingContact: { id: 'contact-123', name: 'Sarah', location: null },
          isNewContact: false,
        }),
      });

      renderComponent();

      // Click Meet button
      fireEvent.click(screen.getByRole('button', { name: /meet/i }));

      // Enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Had coffee downtown' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        const callArgs = mockFetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.rawInput).toContain('Met up with Sarah');
        expect(body.rawInput).toContain('Had coffee downtown');
      });
    });
  });

  describe('AI processing flow', () => {
    it('calls /api/ingest with dryRun when summary is provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          preview: true,
          extraction: {
            contactName: 'Sarah',
            interactionSummary: 'Discussed her new job',
            interactionType: 'CALL',
          },
          existingContact: { id: 'contact-123', name: 'Sarah', location: null },
          isNewContact: false,
        }),
      });

      renderComponent();

      // Click Call button
      fireEvent.click(screen.getByRole('button', { name: /call/i }));

      // Enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Discussed her new job' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/ingest', expect.objectContaining({
          method: 'POST',
        }));

        const callArgs = mockFetch.mock.calls[0];
        const body = JSON.parse(callArgs[1].body);
        expect(body.dryRun).toBe(true);
        expect(body.contactId).toBe('contact-123');
      });
    });

    it('calls onPreview with extraction data when AI processing succeeds', async () => {
      const mockExtraction = {
        contactName: 'Sarah',
        interactionSummary: 'Discussed her promotion at Google',
        interactionType: 'CALL' as InteractionType,
        preferences: [{ category: 'ALWAYS' as const, content: 'Excited about her career' }],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          preview: true,
          extraction: mockExtraction,
          existingContact: { id: 'contact-123', name: 'Sarah', location: 'Austin' },
          isNewContact: false,
        }),
      });

      renderComponent();

      // Click Call button
      fireEvent.click(screen.getByRole('button', { name: /call/i }));

      // Enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Discussed her promotion at Google' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockOnPreview).toHaveBeenCalledWith({
          extraction: mockExtraction,
          existingContact: { id: 'contact-123', name: 'Sarah', location: 'Austin' },
          isNewContact: false,
          rawInput: expect.stringContaining('Had a phone call with Sarah'),
        });
      });
    });

    it('resets form after calling onPreview', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          preview: true,
          extraction: { contactName: 'Sarah', interactionSummary: 'Test' },
          existingContact: { id: 'contact-123', name: 'Sarah', location: null },
          isNewContact: false,
        }),
      });

      renderComponent();

      // Click Call button
      fireEvent.click(screen.getByRole('button', { name: /call/i }));

      // Enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Test summary' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockOnPreview).toHaveBeenCalled();
      });

      // Form should be reset - expanded form should be closed
      expect(screen.queryByPlaceholderText(/what did you talk about/i)).not.toBeInTheDocument();
    });

    it('does not call onSuccess when using AI processing', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          preview: true,
          extraction: { contactName: 'Sarah', interactionSummary: 'Test' },
          existingContact: { id: 'contact-123', name: 'Sarah', location: null },
          isNewContact: false,
        }),
      });

      renderComponent();

      // Click Call button
      fireEvent.click(screen.getByRole('button', { name: /call/i }));

      // Enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Test summary' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockOnPreview).toHaveBeenCalled();
      });

      // onSuccess should NOT be called - that happens after preview modal confirms
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });

  describe('direct save flow (no summary)', () => {
    it('calls /api/interactions directly when no summary provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'interaction-1' }),
      });

      renderComponent();

      // Click Call button
      fireEvent.click(screen.getByRole('button', { name: /call/i }));

      // Don't enter a summary, just save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/interactions', expect.objectContaining({
          method: 'POST',
        }));
      });

      // Verify it's NOT /api/ingest
      expect(mockFetch).not.toHaveBeenCalledWith('/api/ingest', expect.anything());
    });

    it('calls onSuccess when direct save completes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'interaction-1' }),
      });

      renderComponent();

      // Click Meet button
      fireEvent.click(screen.getByRole('button', { name: /meet/i }));

      // Save without summary
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      // onPreview should NOT be called for direct saves
      expect(mockOnPreview).not.toHaveBeenCalled();
    });

    it('does not call onPreview when no summary provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'interaction-1' }),
      });

      renderComponent();

      // Click Call button
      fireEvent.click(screen.getByRole('button', { name: /call/i }));

      // Save without summary
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });

      expect(mockOnPreview).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('handles AI processing failure gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      renderComponent();

      // Click Call button
      fireEvent.click(screen.getByRole('button', { name: /call/i }));

      // Enter summary
      const textarea = screen.getByPlaceholderText(/what did you talk about/i);
      fireEvent.change(textarea, { target: { value: 'Test summary' } });

      // Click Save
      fireEvent.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalled();
      });

      // Form should still be usable (not stuck in saving state)
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();

      consoleError.mockRestore();
    });
  });
});
