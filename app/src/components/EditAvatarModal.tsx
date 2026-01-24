'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Link2, User, Trash2 } from 'lucide-react';
import { getGravatarUrl, getAvailableAvatarSources } from '@/lib/avatar';
import type { Socials, AvatarSource } from '@/types';

interface AvatarSaveData {
  avatarUrl: string | null;
  avatarSource: AvatarSource | null;
  preferredAvatarSource: AvatarSource | null;
}

interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AvatarSaveData) => Promise<void>;
  currentAvatarUrl: string | null;
  currentAvatarSource: AvatarSource | null;
  preferredAvatarSource: AvatarSource | null;
  socials: Socials | null;
}

export default function EditAvatarModal({
  isOpen,
  onClose,
  onSave,
  currentAvatarUrl,
  currentAvatarSource,
  preferredAvatarSource: _preferredAvatarSource,
  socials,
}: EditAvatarModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [selectedSource, setSelectedSource] = useState<AvatarSource | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const availableSources = getAvailableAvatarSources(socials);
  const hasEmail = socials?.email;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSource(currentAvatarSource);
      setManualUrl(currentAvatarSource === 'manual' && currentAvatarUrl ? currentAvatarUrl : '');
      setImageError(false);

      // Set initial preview
      if (currentAvatarSource === 'manual' && currentAvatarUrl) {
        setPreviewUrl(currentAvatarUrl);
      } else if (currentAvatarSource === 'gravatar' && socials?.email) {
        setPreviewUrl(getGravatarUrl(socials.email));
      } else {
        setPreviewUrl(null);
      }
    }
  }, [isOpen, currentAvatarUrl, currentAvatarSource, socials]);

  // Update preview when manual URL changes
  useEffect(() => {
    if (selectedSource === 'manual' && manualUrl.trim()) {
      setPreviewUrl(manualUrl.trim());
      setImageError(false);
    }
  }, [manualUrl, selectedSource]);

  const handleFetchGravatar = () => {
    if (socials?.email) {
      const gravatarUrl = getGravatarUrl(socials.email);
      setSelectedSource('gravatar');
      setPreviewUrl(gravatarUrl);
      setManualUrl('');
      setImageError(false);
    }
  };

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url);
    if (url.trim()) {
      setSelectedSource('manual');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let saveData: AvatarSaveData;

      if (selectedSource === 'manual' && manualUrl.trim()) {
        saveData = {
          avatarUrl: manualUrl.trim(),
          avatarSource: 'manual',
          preferredAvatarSource: 'manual',
        };
      } else if (selectedSource === 'gravatar' && socials?.email) {
        saveData = {
          avatarUrl: getGravatarUrl(socials.email),
          avatarSource: 'gravatar',
          preferredAvatarSource: 'gravatar',
        };
      } else {
        saveData = {
          avatarUrl: null,
          avatarSource: null,
          preferredAvatarSource: null,
        };
      }

      await onSave(saveData);
      onClose();
    } catch (error) {
      console.error('Failed to save avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await onSave({
        avatarUrl: null,
        avatarSource: null,
        preferredAvatarSource: null,
      });
      onClose();
    } catch (error) {
      console.error('Failed to clear avatar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-serif font-bold text-stone-800">Edit Avatar</h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-stone-100 flex items-center justify-center overflow-hidden ring-4 ring-stone-200">
              {previewUrl && !imageError ? (
                <img
                  src={previewUrl}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <User className="w-16 h-16 text-stone-400" />
              )}
            </div>
            {imageError && (
              <p className="text-sm text-red-500">Failed to load image</p>
            )}
            {selectedSource && !imageError && (
              <p className="text-sm text-stone-500">
                Source: <span className="font-medium capitalize">{selectedSource}</span>
              </p>
            )}
          </div>

          {/* Gravatar Option */}
          {hasEmail && (
            <div className="space-y-2">
              <button
                onClick={handleFetchGravatar}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-colors ${
                  selectedSource === 'gravatar'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-stone-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-stone-700'
                }`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-18C8.134 4 5 7.134 5 11c0 2.76 1.6 5.14 3.92 6.28-.1-.85-.19-2.16.04-3.09.21-.84 1.35-5.29 1.35-5.29s-.34-.68-.34-1.68c0-1.58.92-2.76 2.06-2.76.97 0 1.44.73 1.44 1.6 0 .98-.62 2.44-.94 3.8-.27 1.13.57 2.05 1.68 2.05 2.02 0 3.57-2.13 3.57-5.2 0-2.72-1.95-4.62-4.74-4.62-3.23 0-5.12 2.42-5.12 4.92 0 .98.38 2.02.85 2.59.09.11.1.21.07.32-.09.35-.28 1.13-.32 1.29-.05.21-.17.26-.39.16-1.46-.68-2.37-2.81-2.37-4.52 0-3.68 2.67-7.06 7.7-7.06 4.04 0 7.18 2.88 7.18 6.73 0 4.01-2.53 7.24-6.04 7.24-1.18 0-2.29-.61-2.67-1.33l-.73 2.77c-.26 1.01-.97 2.28-1.44 3.05A12.01 12.01 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
                Fetch from Gravatar
              </button>
              <p className="text-xs text-stone-500 text-center">
                Using email: {socials?.email}
              </p>
            </div>
          )}

          {/* Manual URL Input */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <Link2 className="w-4 h-4 text-violet-600" />
              Manual URL
            </label>
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => handleManualUrlChange(e.target.value)}
              placeholder="Paste image URL..."
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                selectedSource === 'manual'
                  ? 'border-emerald-500 bg-emerald-50/50'
                  : 'border-stone-200'
              }`}
            />
          </div>

          {/* Future Social Integrations Note */}
          {(availableSources.includes('linkedin') || availableSources.includes('instagram')) && (
            <div className="p-4 bg-stone-50 rounded-xl">
              <p className="text-sm text-stone-500">
                <span className="font-medium">Coming soon:</span> Auto-fetch avatars from LinkedIn and Instagram when you connect these accounts.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t border-stone-100 bg-stone-50">
          <button
            onClick={handleClear}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2.5 text-red-600 text-sm font-medium rounded-xl border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 hover:bg-white disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
