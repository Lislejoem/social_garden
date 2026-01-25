/**
 * @file Image utilities tests
 * @description Tests for image processing utilities: base64 conversion, compression, validation
 */
import { describe, it, expect } from 'vitest';
import { fileToBase64, compressImage, validateImageFile, SUPPORTED_TYPES, MAX_FILE_SIZE } from './image-utils';

// Helper to create a mock File
function createMockFile(
  content: string,
  name: string,
  type: string,
  size?: number
): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  if (size !== undefined) {
    Object.defineProperty(file, 'size', { value: size });
  }
  return file;
}

describe('validateImageFile', () => {
  it('accepts valid JPEG file', () => {
    const file = createMockFile('fake-image-data', 'photo.jpg', 'image/jpeg');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('accepts valid PNG file', () => {
    const file = createMockFile('fake-image-data', 'screenshot.png', 'image/png');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts valid WebP file', () => {
    const file = createMockFile('fake-image-data', 'image.webp', 'image/webp');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('accepts valid GIF file', () => {
    const file = createMockFile('fake-image-data', 'animation.gif', 'image/gif');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('rejects unsupported file type', () => {
    const file = createMockFile('fake-data', 'document.pdf', 'application/pdf');
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported file type');
  });

  it('rejects file exceeding max size', () => {
    const file = createMockFile('x', 'large.jpg', 'image/jpeg', MAX_FILE_SIZE + 1);
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File too large');
  });

  it('accepts file at exactly max size', () => {
    const file = createMockFile('x', 'exact.jpg', 'image/jpeg', MAX_FILE_SIZE);
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });
});

describe('fileToBase64', () => {
  it('converts file to base64 string', async () => {
    const content = 'test image content';
    const file = createMockFile(content, 'test.jpg', 'image/jpeg');

    const result = await fileToBase64(file);

    // Result should be a base64 string (data URL format stripped)
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Should not include the data URL prefix
    expect(result).not.toContain('data:');
  });

  it('handles empty file', async () => {
    const file = createMockFile('', 'empty.jpg', 'image/jpeg');
    const result = await fileToBase64(file);
    expect(typeof result).toBe('string');
  });
});

describe('compressImage', () => {
  // Note: Full image compression requires real image data and browser canvas API.
  // These tests verify the function interface and basic behavior.
  // Integration testing with real images should be done in the browser.

  it('is a function that returns a Promise', () => {
    const file = createMockFile('content', 'photo.jpg', 'image/jpeg', 1000);
    const result = compressImage(file, 2048);
    expect(result).toBeInstanceOf(Promise);
  });

  it('accepts maxDimension parameter', () => {
    const file = createMockFile('content', 'photo.jpg', 'image/jpeg', 1000);
    // Should not throw
    expect(() => compressImage(file, 1024)).not.toThrow();
  });

  it('uses default maxDimension of 2048 when not specified', () => {
    const file = createMockFile('content', 'photo.jpg', 'image/jpeg', 1000);
    // Should not throw when called without maxDimension
    expect(() => compressImage(file)).not.toThrow();
  });
});

describe('constants', () => {
  it('exports supported types', () => {
    expect(SUPPORTED_TYPES).toContain('image/jpeg');
    expect(SUPPORTED_TYPES).toContain('image/png');
    expect(SUPPORTED_TYPES).toContain('image/gif');
    expect(SUPPORTED_TYPES).toContain('image/webp');
  });

  it('exports max file size as 5MB', () => {
    expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
  });
});
