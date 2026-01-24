/**
 * @file Image utilities
 * @description Utilities for processing images: base64 conversion, compression, validation
 *
 * @flow
 * 1. User selects/drops an image file
 * 2. validateImageFile() checks type and size
 * 3. compressImage() resizes if needed (max 2048x2048 for Claude vision)
 * 4. fileToBase64() converts to base64 for API transmission
 */

/** Supported image MIME types for Claude vision API */
export const SUPPORTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;

export type SupportedImageType = (typeof SUPPORTED_TYPES)[number];

/** Maximum file size before compression: 5MB */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Maximum image dimensions for Claude vision API */
export const MAX_DIMENSION = 2048;

/** JPEG compression quality (0-1) */
const COMPRESSION_QUALITY = 0.8;

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate an image file for upload.
 * Checks file type and size constraints.
 *
 * @param file - The File object to validate
 * @returns Object with valid boolean and optional error message
 */
export function validateImageFile(file: File): ValidationResult {
  // Check file type
  if (!SUPPORTED_TYPES.includes(file.type as SupportedImageType)) {
    return {
      valid: false,
      error: `Unsupported file type: ${file.type}. Supported: JPEG, PNG, GIF, WebP`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large: ${sizeMB}MB. Maximum: 5MB`,
    };
  }

  return { valid: true };
}

/**
 * Convert a File to a base64-encoded string.
 * Returns only the base64 data, without the data URL prefix.
 *
 * @param file - The File object to convert
 * @returns Promise resolving to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress and resize an image if needed.
 * Resizes to fit within maxDimension while maintaining aspect ratio.
 * Converts to JPEG for smaller file size when compression is applied.
 *
 * @param file - The image File to compress
 * @param maxDimension - Maximum width/height (default: 2048)
 * @returns Promise resolving to compressed File
 */
export async function compressImage(
  file: File,
  maxDimension: number = MAX_DIMENSION
): Promise<File> {
  // If we're in a non-browser environment (SSR), return original
  if (typeof window === 'undefined' || typeof Image === 'undefined') {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;

      // Check if resizing is needed
      if (width <= maxDimension && height <= maxDimension) {
        // No resize needed, return original
        resolve(file);
        return;
      }

      // Calculate new dimensions maintaining aspect ratio
      let newWidth = width;
      let newHeight = height;

      if (width > height) {
        if (width > maxDimension) {
          newHeight = Math.round((height * maxDimension) / width);
          newWidth = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          newWidth = Math.round((width * maxDimension) / height);
          newHeight = maxDimension;
        }
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = newWidth;
      canvas.height = newHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convert to blob (JPEG for better compression)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'));
            return;
          }

          // Create new File from blob
          const compressedFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        'image/jpeg',
        COMPRESSION_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}
