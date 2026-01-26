import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContactMenu from './ContactMenu';

describe('ContactMenu', () => {
  const defaultProps = {
    contactName: 'John Doe',
    onHide: vi.fn().mockResolvedValue(undefined),
    onDelete: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const openMenu = () => {
    const triggerButton = screen.getByRole('button', { expanded: false });
    fireEvent.click(triggerButton);
  };

  describe('menu trigger', () => {
    it('renders menu trigger button', () => {
      render(<ContactMenu {...defaultProps} />);

      const triggerButton = screen.getByRole('button');
      expect(triggerButton).toBeInTheDocument();
    });

    it('opens menu when trigger is clicked', () => {
      render(<ContactMenu {...defaultProps} />);

      openMenu();

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });
  });

  describe('hide/restore toggle', () => {
    it('shows "Hide from Garden" when isHidden is false', () => {
      render(<ContactMenu {...defaultProps} isHidden={false} />);

      openMenu();

      expect(screen.getByText('Hide from Garden')).toBeInTheDocument();
      expect(screen.queryByText('Restore to Garden')).not.toBeInTheDocument();
    });

    it('shows "Hide from Garden" when isHidden is not provided (defaults to false)', () => {
      render(<ContactMenu {...defaultProps} />);

      openMenu();

      expect(screen.getByText('Hide from Garden')).toBeInTheDocument();
    });

    it('shows "Restore to Garden" when isHidden is true', () => {
      const onRestore = vi.fn().mockResolvedValue(undefined);
      render(<ContactMenu {...defaultProps} isHidden={true} onRestore={onRestore} />);

      openMenu();

      expect(screen.getByText('Restore to Garden')).toBeInTheDocument();
      expect(screen.queryByText('Hide from Garden')).not.toBeInTheDocument();
    });
  });

  describe('hide action', () => {
    it('calls onHide when hide button is clicked', async () => {
      const onHide = vi.fn().mockResolvedValue(undefined);
      render(<ContactMenu {...defaultProps} onHide={onHide} isHidden={false} />);

      openMenu();
      fireEvent.click(screen.getByText('Hide from Garden'));

      await waitFor(() => {
        expect(onHide).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('restore action', () => {
    it('calls onRestore when restore button is clicked', async () => {
      const onRestore = vi.fn().mockResolvedValue(undefined);
      render(<ContactMenu {...defaultProps} isHidden={true} onRestore={onRestore} />);

      openMenu();
      fireEvent.click(screen.getByText('Restore to Garden'));

      await waitFor(() => {
        expect(onRestore).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('delete action', () => {
    it('shows delete option in menu', () => {
      render(<ContactMenu {...defaultProps} />);

      openMenu();

      expect(screen.getByText('Remove Permanently')).toBeInTheDocument();
    });

    it('opens confirmation dialog when delete is clicked', () => {
      render(<ContactMenu {...defaultProps} />);

      openMenu();
      fireEvent.click(screen.getByText('Remove Permanently'));

      expect(screen.getByText(`Remove ${defaultProps.contactName} permanently?`)).toBeInTheDocument();
    });

    it('calls onDelete after confirmation', async () => {
      const onDelete = vi.fn().mockResolvedValue(undefined);
      render(<ContactMenu {...defaultProps} onDelete={onDelete} />);

      openMenu();
      fireEvent.click(screen.getByText('Remove Permanently'));

      // Click confirm button in dialog
      const confirmButton = screen.getByRole('button', { name: /remove permanently/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledTimes(1);
      });
    });

    it('closes confirmation dialog when cancel is clicked', () => {
      render(<ContactMenu {...defaultProps} />);

      openMenu();
      fireEvent.click(screen.getByText('Remove Permanently'));

      expect(screen.getByText(`Remove ${defaultProps.contactName} permanently?`)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

      expect(screen.queryByText(`Remove ${defaultProps.contactName} permanently?`)).not.toBeInTheDocument();
    });
  });
});
