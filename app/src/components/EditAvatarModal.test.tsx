import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditAvatarModal from './EditAvatarModal';
import type { Socials, AvatarSource } from '@/types';

describe('EditAvatarModal', () => {
  const mockOnSave = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    currentAvatarUrl: null as string | null,
    currentAvatarSource: null as AvatarSource | null,
    preferredAvatarSource: null as AvatarSource | null,
    socials: null as Socials | null,
  };

  it('renders when isOpen is true', () => {
    render(<EditAvatarModal {...defaultProps} />);
    expect(screen.getByText('Edit Avatar')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<EditAvatarModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Edit Avatar')).not.toBeInTheDocument();
  });

  it('shows manual URL input field', () => {
    render(<EditAvatarModal {...defaultProps} />);
    expect(screen.getByPlaceholderText(/paste image url/i)).toBeInTheDocument();
  });

  it('displays current manual avatar URL in input', () => {
    render(
      <EditAvatarModal
        {...defaultProps}
        currentAvatarUrl="https://example.com/photo.jpg"
        currentAvatarSource="manual"
      />
    );
    const input = screen.getByPlaceholderText(/paste image url/i) as HTMLInputElement;
    expect(input.value).toBe('https://example.com/photo.jpg');
  });

  it('shows Fetch Gravatar button when email is available', () => {
    render(
      <EditAvatarModal
        {...defaultProps}
        socials={{ email: 'test@example.com' }}
      />
    );
    expect(screen.getByRole('button', { name: /fetch.*gravatar/i })).toBeInTheDocument();
  });

  it('hides Fetch Gravatar button when no email', () => {
    render(<EditAvatarModal {...defaultProps} socials={{ phone: '123-456' }} />);
    expect(screen.queryByRole('button', { name: /fetch.*gravatar/i })).not.toBeInTheDocument();
  });

  it('calls onSave with manual URL when saving', async () => {
    render(<EditAvatarModal {...defaultProps} />);

    const input = screen.getByPlaceholderText(/paste image url/i);
    fireEvent.change(input, { target: { value: 'https://example.com/new-photo.jpg' } });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        avatarUrl: 'https://example.com/new-photo.jpg',
        avatarSource: 'manual',
        preferredAvatarSource: 'manual',
      });
    });
  });

  it('calls onSave with gravatar source when Fetch Gravatar is clicked and saved', async () => {
    render(
      <EditAvatarModal
        {...defaultProps}
        socials={{ email: 'test@example.com' }}
      />
    );

    const fetchButton = screen.getByRole('button', { name: /fetch.*gravatar/i });
    fireEvent.click(fetchButton);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          avatarSource: 'gravatar',
        })
      );
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<EditAvatarModal {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onSave with null values when Clear Avatar is clicked', async () => {
    render(
      <EditAvatarModal
        {...defaultProps}
        currentAvatarUrl="https://example.com/photo.jpg"
        currentAvatarSource="manual"
      />
    );

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        avatarUrl: null,
        avatarSource: null,
        preferredAvatarSource: null,
      });
    });
  });

  it('shows preview image when valid URL is entered', async () => {
    render(<EditAvatarModal {...defaultProps} />);

    const input = screen.getByPlaceholderText(/paste image url/i);
    fireEvent.change(input, { target: { value: 'https://example.com/photo.jpg' } });

    // Preview should show the image
    await waitFor(() => {
      const previewImage = screen.getByAltText(/avatar preview/i);
      expect(previewImage).toBeInTheDocument();
      expect(previewImage).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });
  });
});
