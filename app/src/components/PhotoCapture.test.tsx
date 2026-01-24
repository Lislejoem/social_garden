/**
 * @file PhotoCapture component tests
 * @description Tests for the photo capture button and modal
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PhotoCapture from './PhotoCapture';

// Mock image-utils
vi.mock('@/lib/image-utils', () => ({
  validateImageFile: vi.fn(() => ({ valid: true })),
  fileToBase64: vi.fn(() => Promise.resolve('base64encodeddata')),
  compressImage: vi.fn((file) => Promise.resolve(file)),
  SUPPORTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024,
}));

import { validateImageFile, fileToBase64, compressImage } from '@/lib/image-utils';

describe('PhotoCapture', () => {
  const mockOnCapture = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders floating camera button', () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    expect(button).toBeInTheDocument();
  });

  it('opens modal when button is clicked', () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    expect(screen.getByText('Add Photo')).toBeInTheDocument();
  });

  it('shows drop zone in modal', () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    expect(screen.getByText(/Drop image here/i)).toBeInTheDocument();
  });

  it('closes modal when cancel is clicked', () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    expect(screen.getByText('Add Photo')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(screen.queryByText('Add Photo')).not.toBeInTheDocument();
  });

  it('closes modal when X button is clicked', () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(screen.queryByText('Add Photo')).not.toBeInTheDocument();
  });

  it('has file input for selecting images', () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('validates file when selected', async () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(validateImageFile).toHaveBeenCalledWith(file);
    });
  });

  it('shows error for invalid file', async () => {
    (validateImageFile as ReturnType<typeof vi.fn>).mockReturnValue({
      valid: false,
      error: 'File too large',
    });

    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('File too large')).toBeInTheDocument();
    });
  });

  it('shows image preview when valid file is selected', async () => {
    (validateImageFile as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true });

    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  it('has text input for additional context', () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    const textarea = screen.getByPlaceholderText(/Add context/i);
    expect(textarea).toBeInTheDocument();
  });

  it('calls onCapture with image data when process button is clicked', async () => {
    (validateImageFile as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true });
    (fileToBase64 as ReturnType<typeof vi.fn>).mockResolvedValue('base64data');
    (compressImage as ReturnType<typeof vi.fn>).mockImplementation((f) => Promise.resolve(f));

    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    // Select a file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    // Wait for preview to show
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });

    // Add context
    const textarea = screen.getByPlaceholderText(/Add context/i);
    fireEvent.change(textarea, { target: { value: 'Dinner with Sarah' } });

    // Click process button
    const processButton = screen.getByText('Process Photo');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockOnCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          base64: 'base64data',
          mimeType: 'image/jpeg',
        }),
        'Dinner with Sarah'
      );
    });
  });

  it('shows loading state while processing', async () => {
    (validateImageFile as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true });
    (fileToBase64 as ReturnType<typeof vi.fn>).mockResolvedValue('base64data');

    // Make onCapture return a promise that doesn't resolve immediately
    mockOnCapture.mockImplementation(() => new Promise(() => {}));

    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    // Select a file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });

    // Click process button
    const processButton = screen.getByText('Process Photo');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  it('disables process button when no file is selected', () => {
    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    const processButton = screen.getByText('Process Photo');
    expect(processButton).toBeDisabled();
  });

  it('clears selection when clear button is clicked', async () => {
    (validateImageFile as ReturnType<typeof vi.fn>).mockReturnValue({ valid: true });

    render(<PhotoCapture onCapture={mockOnCapture} />);

    const button = screen.getByTitle('Capture a photo');
    fireEvent.click(button);

    // Select a file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });

    // Click clear button
    const clearButton = screen.getByLabelText('Clear selection');
    fireEvent.click(clearButton);

    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
  });
});
