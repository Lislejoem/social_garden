'use client';

import { useState } from 'react';
import { Phone, MessageSquare, Users, Loader2, X } from 'lucide-react';
import type { InteractionType } from '@/types';

interface QuickLogInteractionProps {
  contactId: string;
  contactName: string;
  onSuccess: () => void;
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
    type: 'TEXT',
    label: 'Text',
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

export default function QuickLogInteraction({
  contactId,
  contactName,
  onSuccess,
}: QuickLogInteractionProps) {
  const [selectedType, setSelectedType] = useState<InteractionType | null>(null);
  const [summary, setSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSelectType = (type: InteractionType) => {
    if (selectedType === type) {
      // Clicking same button again closes it
      setSelectedType(null);
      setSummary('');
    } else {
      setSelectedType(type);
    }
  };

  const handleSave = async () => {
    if (!selectedType) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactId,
          type: selectedType,
          summary: summary.trim() || undefined, // Let API generate default if empty
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create interaction');
      }

      // Reset state
      setSelectedType(null);
      setSummary('');
      onSuccess();
    } catch (error) {
      console.error('Failed to log interaction:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedType(null);
    setSummary('');
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
              Log a <span className="font-medium text-stone-700">{selectedType.toLowerCase()}</span> with{' '}
              <span className="font-medium text-stone-700">{contactName}</span>
            </p>
            <button
              onClick={handleCancel}
              className="p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

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
