import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactCard from './ContactCard';

// Mock useToast
const mockShowToast = vi.fn();
const mockShowError = vi.fn();
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
    showError: mockShowError,
  }),
}));

describe('ContactCard', () => {
  const defaultProps = {
    id: 'contact-1',
    name: 'John Doe',
    avatarUrl: null,
    location: 'New York',
    cadence: 'REGULARLY' as const,
    health: 'growing' as const,
    lastContactFormatted: '2 days ago',
    socials: null,
    preferencesPreview: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const openMenu = () => {
    // Find the menu trigger button (the MoreHorizontal icon button)
    const menuButtons = screen.getAllByRole('button');
    const menuTrigger = menuButtons.find(btn => btn.getAttribute('aria-haspopup') === 'menu');
    if (menuTrigger) {
      fireEvent.click(menuTrigger);
    }
  };

  describe('hide action with callback', () => {
    it('calls onHidden callback after successful hide API call', async () => {
      const onHidden = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(<ContactCard {...defaultProps} onHidden={onHidden} />);

      openMenu();
      fireEvent.click(screen.getByText('Hide from Grove'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/contacts/${defaultProps.id}`,
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('hiddenAt'),
          })
        );
      });

      await waitFor(() => {
        expect(onHidden).toHaveBeenCalledWith(defaultProps.id);
      });

      expect(mockShowToast).toHaveBeenCalledWith(`${defaultProps.name} hidden from your grove`);
    });

    it('does not call onHidden when API fails', async () => {
      const onHidden = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      render(<ContactCard {...defaultProps} onHidden={onHidden} />);

      openMenu();
      fireEvent.click(screen.getByText('Hide from Grove'));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Failed to hide contact. Please try again.');
      });

      expect(onHidden).not.toHaveBeenCalled();
    });
  });

  describe('restore action with callback', () => {
    it('calls onRestored callback after successful restore API call', async () => {
      const onRestored = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(<ContactCard {...defaultProps} isHidden={true} onRestored={onRestored} />);

      openMenu();
      fireEvent.click(screen.getByText('Restore to Grove'));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/contacts/${defaultProps.id}`,
          expect.objectContaining({
            method: 'PUT',
            body: expect.stringContaining('null'),
          })
        );
      });

      await waitFor(() => {
        expect(onRestored).toHaveBeenCalledWith(defaultProps.id);
      });

      expect(mockShowToast).toHaveBeenCalledWith(`${defaultProps.name} restored to your grove`);
    });

    it('does not call onRestored when API fails', async () => {
      const onRestored = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      render(<ContactCard {...defaultProps} isHidden={true} onRestored={onRestored} />);

      openMenu();
      fireEvent.click(screen.getByText('Restore to Grove'));

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Failed to restore contact. Please try again.');
      });

      expect(onRestored).not.toHaveBeenCalled();
    });
  });

  describe('clickable card navigation', () => {
    it('renders as a link to the contact profile', () => {
      render(<ContactCard {...defaultProps} />);

      // The card should be wrapped in a link
      const cardLink = screen.getByRole('link', { name: /john doe/i });
      expect(cardLink).toHaveAttribute('href', '/contact/contact-1');
    });

    it('does not include "Open Profile" text', () => {
      render(<ContactCard {...defaultProps} />);

      expect(screen.queryByText('Open Profile')).not.toBeInTheDocument();
    });
  });

  describe('delete action with callback', () => {
    it('calls onDeleted callback after successful delete API call', async () => {
      const onDeleted = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      });

      render(<ContactCard {...defaultProps} onDeleted={onDeleted} />);

      openMenu();
      fireEvent.click(screen.getByText('Remove Permanently'));

      // Click confirm in dialog
      const confirmButton = screen.getByRole('button', { name: /remove permanently/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/contacts/${defaultProps.id}`,
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      await waitFor(() => {
        expect(onDeleted).toHaveBeenCalledWith(defaultProps.id);
      });

      expect(mockShowToast).toHaveBeenCalledWith(`${defaultProps.name} removed permanently`);
    });

    it('does not call onDeleted when API fails', async () => {
      const onDeleted = vi.fn();
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      render(<ContactCard {...defaultProps} onDeleted={onDeleted} />);

      openMenu();
      fireEvent.click(screen.getByText('Remove Permanently'));

      // Click confirm in dialog
      const confirmButton = screen.getByRole('button', { name: /remove permanently/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockShowError).toHaveBeenCalledWith('Failed to delete contact. Please try again.');
      });

      expect(onDeleted).not.toHaveBeenCalled();
    });
  });
});
