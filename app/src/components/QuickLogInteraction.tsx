'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Users, Loader2, X, Send } from 'lucide-react';
import type { InteractionType, MessagePlatform, AIExtraction } from '@/types';
import { useToast } from '../contexts/ToastContext';

// Instagram icon (custom SVG)
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

// LinkedIn icon (custom SVG)
const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

interface QuickLogInteractionProps {
  contactId: string;
  contactName: string;
  onSuccess: () => void;
  onPreview: (data: {
    extraction: AIExtraction;
    existingContact: { id: string; name: string; location: string | null } | null;
    isNewContact: boolean;
    rawInput: string;
  }) => void;
}

/**
 * Builds a natural language description for AI processing from manual interaction data.
 * This format matches what the AI expects from voice note transcripts.
 */
function buildRawInput(
  type: InteractionType,
  platform: MessagePlatform,
  summary: string,
  contactName: string
): string {
  const typeDescriptions: Record<InteractionType, string> = {
    CALL: `Had a phone call with ${contactName}`,
    MESSAGE: platform === 'text'
      ? `Texted ${contactName}`
      : `Messaged ${contactName} on ${platform}`,
    MEET: `Met up with ${contactName}`,
    VOICE: `Talked with ${contactName}`,
  };

  return `${typeDescriptions[type]}. ${summary}`;
}

const INTERACTION_BUTTONS: {
  type: InteractionType;
  label: string;
  icon: typeof Phone;
  color: string;
  hoverColor: string;
}[] = [
  {
    type: 'CALL',
    label: 'Call',
    icon: Phone,
    color: 'text-blue-600',
    hoverColor: 'hover:bg-blue-50',
  },
  {
    type: 'MESSAGE',
    label: 'Message',
    icon: MessageSquare,
    color: 'text-emerald-600',
    hoverColor: 'hover:bg-emerald-50',
  },
  {
    type: 'MEET',
    label: 'Meet',
    icon: Users,
    color: 'text-purple-600',
    hoverColor: 'hover:bg-purple-50',
  },
];

const MESSAGE_PLATFORMS: {
  value: MessagePlatform;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { value: 'text', label: 'Text', icon: MessageSquare },
  { value: 'instagram', label: 'Instagram', icon: InstagramIcon },
  { value: 'telegram', label: 'Telegram', icon: Send },
  { value: 'linkedin', label: 'LinkedIn', icon: LinkedInIcon },
];

export default function QuickLogInteraction({
  contactId,
  contactName,
  onSuccess,
  onPreview,
}: QuickLogInteractionProps) {
  const [selectedType, setSelectedType] = useState<InteractionType | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<MessagePlatform>('text');
  const [summary, setSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showError } = useToast();

  const handleSelectType = (type: InteractionType) => {
    if (selectedType === type) {
      // Clicking same button again closes it
      setSelectedType(null);
      setSummary('');
      setSelectedPlatform('text');
    } else {
      setSelectedType(type);
      if (type !== 'MESSAGE') {
        setSelectedPlatform('text');
      }
    }
  };

  const handleSave = async () => {
    if (!selectedType) return;

    const summaryText = summary.trim();

    // If user entered a summary, use AI processing with preview
    if (summaryText) {
      setIsSaving(true);
      try {
        // Build a natural language description for AI
        const rawInput = buildRawInput(selectedType, selectedPlatform, summaryText, contactName);

        const response = await fetch('/api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rawInput,
            contactId,
            dryRun: true,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to process');
        }

        const preview = await response.json();

        // Pass to parent to show preview modal
        onPreview({
          extraction: preview.extraction,
          existingContact: preview.existingContact,
          isNewContact: preview.isNewContact,
          rawInput,
        });

        // Reset form
        setSelectedType(null);
        setSummary('');
        setSelectedPlatform('text');
      } catch {
        showError('Failed to process interaction. Please try again.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // No summary - direct save (existing behavior)
    setIsSaving(true);
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          type: selectedType,
          platform: selectedType === 'MESSAGE' ? selectedPlatform : undefined,
          summary: undefined, // Let API generate default
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create interaction');
      }

      // Reset state
      setSelectedType(null);
      setSummary('');
      setSelectedPlatform('text');
      onSuccess();
    } catch {
      showError('Failed to log interaction. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedType(null);
    setSummary('');
    setSelectedPlatform('text');
  };

  // Get display label for the interaction type
  const getTypeLabel = () => {
    if (selectedType === 'MESSAGE') {
      return selectedPlatform === 'text' ? 'text' : `${selectedPlatform} message`;
    }
    return selectedType?.toLowerCase() || '';
  };

  return (
    <div className="space-y-4">
      {/* Quick action buttons */}
      <div className="flex gap-2">
        {INTERACTION_BUTTONS.map(({ type, label, icon: Icon, color, hoverColor }) => (
          <button
            key={type}
            onClick={() => handleSelectType(type)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium text-sm
              border-2 transition-all
              ${
                selectedType === type
                  ? `${color} border-current bg-white shadow-sm`
                  : `text-stone-500 border-stone-200 ${hoverColor} hover:border-stone-300`
              }
            `}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Expanded summary form */}
      {selectedType && (
        <div className="bg-white rounded-3xl border border-stone-200 p-4 shadow-sm space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">
              Log a <span className="font-medium text-stone-700">{getTypeLabel()}</span> with{' '}
              <span className="font-medium text-stone-700">{contactName}</span>
            </p>
            <button
              onClick={handleCancel}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Platform selector for MESSAGE type */}
          {selectedType === 'MESSAGE' && (
            <div className="flex gap-2 flex-wrap">
              {MESSAGE_PLATFORMS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSelectedPlatform(value)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                    border transition-all
                    ${
                      selectedPlatform === value
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-stone-50 text-stone-500 border-stone-100 hover:bg-stone-100'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="What did you talk about? (optional)"
            rows={2}
            className="w-full px-4 py-3 text-stone-700 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none placeholder:text-stone-400"
            autoFocus
          />

          <div className="flex gap-2">
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
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-5 py-2.5 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
