/**
 * @file PhotoCapture.tsx
 * @description Floating photo capture button with modal for selecting/capturing images.
 * Supports file selection, camera capture on mobile, and drag-drop.
 *
 * @props
 * - onCapture: Callback with image data and optional context text
 *
 * @flow
 * 1. User clicks floating camera button
 * 2. Modal opens with file selection/drop zone
 * 3. User selects image and optionally adds context
 * 4. User clicks process to send to onCapture callback
 */
'use client';

import { useState, useRef, useCallback } from 'react';
import { Camera, X, Upload, Loader2, ImageIcon } from 'lucide-react';
import { validateImageFile, fileToBase64, compressImage } from '@/lib/image-utils';

interface ImageData {
  base64: string;
  mimeType: string;
}

interface PhotoCaptureProps {
  onCapture: (imageData: ImageData, context?: string) => Promise<void>;
}

export default function PhotoCapture({ onCapture }: PhotoCaptureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [context, setContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Compress image if needed
      const compressedFile = await compressImage(selectedFile);

      // Convert to base64
      const base64 = await fileToBase64(compressedFile);

      // Call onCapture
      await onCapture(
        {
          base64,
          mimeType: compressedFile.type,
        },
        context.trim() || undefined
      );

      // Close modal on success
      handleClose();
    } catch {
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    handleClear();
    setContext('');
    setIsExpanded(false);
  };

  const handleOpen = () => {
    setIsExpanded(true);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={handleOpen}
        className="w-14 h-14 glass-floating bg-ink-rich/80 text-white rounded-3xl flex items-center justify-center hover:scale-110 hover:rotate-6 soft-press transition-all"
        title="Capture a photo"
      >
        <Camera className="w-7 h-7" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-center p-4 md:items-center">
      <div className="glass-floating rounded-4xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-grove-primary" />
            <h3 className="font-serif text-xl font-bold">Add Photo</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-ink-muted hover:text-ink-rich rounded-xl hover:bg-white/20 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 glass-card bg-red-500/10 text-red-700 rounded-2xl text-sm">
              {error}
            </div>
          )}

          {/* Image preview or drop zone */}
          {previewUrl ? (
            <div className="relative mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-2xl"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-xl hover:bg-black/70 transition-all"
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mb-4 p-8 glass-card border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center min-h-[180px] ${
                isDragOver
                  ? 'border-grove-primary bg-grove-primary/10'
                  : 'border-white/40 hover:border-grove-primary/50 hover:bg-white/20'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center mb-4">
                {isDragOver ? (
                  <Upload className="w-8 h-8 text-grove-primary" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-ink-muted" />
                )}
              </div>
              <p className="text-ink-muted text-center">
                {isDragOver ? (
                  'Drop image here'
                ) : (
                  <>
                    <span className="text-grove-primary font-medium">Click to select</span>
                    {' or drop image here'}
                  </>
                )}
              </p>
              <p className="text-ink-muted/70 text-sm mt-1">
                JPEG, PNG, GIF, or WebP (max 5MB)
              </p>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Context input */}
          <div>
            <label className="block text-sm font-medium text-ink-rich mb-2">
              Add context (optional)
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Add context, e.g., 'Dinner at Sarah's favorite restaurant'"
              className="w-full p-4 glass-card border border-white/30 rounded-2xl text-ink-rich placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-grove-primary focus:border-transparent resize-none"
              rows={2}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-white/30 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 py-4 bg-white/50 text-ink-rich rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/70 soft-press transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleProcess}
            disabled={!selectedFile || isProcessing}
            className="flex-1 py-4 bg-grove-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-grove-primary-hover soft-press transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5" />
                Process Photo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
