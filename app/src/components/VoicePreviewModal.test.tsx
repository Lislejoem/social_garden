import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoicePreviewModal from './VoicePreviewModal';
import type { AIExtraction } from '@/types';
import { INTERACTION_TYPES, PLATFORMS, TYPE_LABELS, PLATFORM_LABELS } from '@/lib/interactions';

describe('VoicePreviewModal', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  const baseExtraction: AIExtraction = {
    contactName: 'Sarah',
    interactionSummary: 'Had a great conversation',
    interactionType: 'MEET',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderModal = (extraction: AIExtraction = baseExtraction) => {
    return render(
      <VoicePreviewModal
        extraction={extraction}
        existingContact={null}
        isNewContact={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );
  };

  describe('interaction type selector', () => {
    it('renders all interaction type buttons from config', () => {
      renderModal();

      for (const type of INTERACTION_TYPES) {
        expect(screen.getByRole('button', { name: TYPE_LABELS[type] })).toBeInTheDocument();
      }
    });

    it('highlights the AI-inferred type as selected', () => {
      renderModal({ ...baseExtraction, interactionType: 'CALL' });

      const callButton = screen.getByRole('button', { name: TYPE_LABELS.CALL });
      expect(callButton).toHaveClass('bg-emerald-600');
    });

    it('allows changing interaction type', async () => {
      renderModal({ ...baseExtraction, interactionType: 'MEET' });

      // Click on CALL button
      const callButton = screen.getByRole('button', { name: TYPE_LABELS.CALL });
      fireEvent.click(callButton);

      // Verify CALL is now selected
      expect(callButton).toHaveClass('bg-emerald-600');

      // Submit and verify the type was changed
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(
          expect.objectContaining({ interactionType: 'CALL' })
        );
      });
    });

    it('defaults to VOICE when no type specified', () => {
      renderModal({ contactName: 'Sarah', interactionSummary: 'Test' });

      const voiceButton = screen.getByRole('button', { name: TYPE_LABELS.VOICE });
      expect(voiceButton).toHaveClass('bg-emerald-600');
    });
  });

  describe('platform selector', () => {
    it('shows platform selector only when MESSAGE type is selected', () => {
      renderModal({ ...baseExtraction, interactionType: 'MESSAGE' });

      // Platform selector should be visible
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('hides platform selector for non-MESSAGE types', () => {
      renderModal({ ...baseExtraction, interactionType: 'MEET' });

      // Platform selector should not be visible
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });

    it('renders all platform options from config', () => {
      renderModal({ ...baseExtraction, interactionType: 'MESSAGE' });

      const select = screen.getByRole('combobox');
      for (const platform of PLATFORMS) {
        expect(select).toContainHTML(PLATFORM_LABELS[platform]);
      }
    });

    it('shows AI-inferred platform as selected', () => {
      renderModal({
        ...baseExtraction,
        interactionType: 'MESSAGE',
        interactionPlatform: 'instagram',
      });

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('instagram');
    });

    it('defaults to text platform when MESSAGE selected but no platform specified', () => {
      renderModal({
        ...baseExtraction,
        interactionType: 'MESSAGE',
      });

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('text');
    });

    it('allows changing platform', async () => {
      renderModal({
        ...baseExtraction,
        interactionType: 'MESSAGE',
        interactionPlatform: 'text',
      });

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'telegram' } });

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            interactionType: 'MESSAGE',
            interactionPlatform: 'telegram'
          })
        );
      });
    });

    it('shows platform selector when switching to MESSAGE type', () => {
      renderModal({ ...baseExtraction, interactionType: 'MEET' });

      // Platform selector should not be visible initially
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

      // Click on MESSAGE button
      const messageButton = screen.getByRole('button', { name: TYPE_LABELS.MESSAGE });
      fireEvent.click(messageButton);

      // Platform selector should now be visible
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('hides platform selector when switching away from MESSAGE type', () => {
      renderModal({ ...baseExtraction, interactionType: 'MESSAGE' });

      // Platform selector should be visible initially
      expect(screen.getByRole('combobox')).toBeInTheDocument();

      // Click on CALL button
      const callButton = screen.getByRole('button', { name: TYPE_LABELS.CALL });
      fireEvent.click(callButton);

      // Platform selector should now be hidden
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    });
  });

  describe('data flow', () => {
    it('passes updated type and platform to onConfirm', async () => {
      renderModal({
        ...baseExtraction,
        interactionType: 'MEET',
      });

      // Change to MESSAGE
      const messageButton = screen.getByRole('button', { name: TYPE_LABELS.MESSAGE });
      fireEvent.click(messageButton);

      // Change platform to linkedin
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'linkedin' } });

      // Save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            contactName: 'Sarah',
            interactionSummary: 'Had a great conversation',
            interactionType: 'MESSAGE',
            interactionPlatform: 'linkedin',
          })
        );
      });
    });

    it('clears platform when switching from MESSAGE to another type', async () => {
      renderModal({
        ...baseExtraction,
        interactionType: 'MESSAGE',
        interactionPlatform: 'instagram',
      });

      // Change to CALL
      const callButton = screen.getByRole('button', { name: TYPE_LABELS.CALL });
      fireEvent.click(callButton);

      // Save
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(
          expect.objectContaining({
            interactionType: 'CALL',
            interactionPlatform: undefined,
          })
        );
      });
    });
  });
});
