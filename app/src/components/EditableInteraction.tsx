'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, Check, X, MessageSquare, Send } from 'lucide-react';
import type { Interaction, InteractionType, MessagePlatform } from '@/types';

interface EditableInteractionProps {
  interaction: Interaction;
  onUpdate: (id: string, data: { summary?: string; date?: string; type?: InteractionType; platform?: MessagePlatform | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const INTERACTION_TYPES: { value: InteractionType; label: string }[] = [
  { value: 'CALL', label: 'Call' },
  { value: 'MESSAGE', label: 'Message' },
  { value: 'MEET', label: 'Meet' },
  { value: 'VOICE', label: 'Voice' },
];

const MESSAGE_PLATFORMS: { value: MessagePlatform; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'linkedin', label: 'LinkedIn' },
];

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDisplayLabel(type: InteractionType, platform?: MessagePlatform | null): string {
  if (type === 'MESSAGE' && platform) {
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  }
  return type;
}

export default function EditableInteraction({
  interaction,
  onUpdate,
  onDelete,
}: EditableInteractionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [editSummary, setEditSummary] = useState(interaction.summary);
  const [editDate, setEditDate] = useState(formatDateForInput(interaction.date));
  const [editType, setEditType] = useState<InteractionType>(interaction.type);
  const [editPlatform, setEditPlatform] = useState<MessagePlatform>(interaction.platform || 'text');

  // Reset platform when switching away from MESSAGE type
  useEffect(() => {
    if (editType !== 'MESSAGE') {
      setEditPlatform('text');
    }
  }, [editType]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(interaction.id, {
        summary: editSummary,
        date: editDate,
        type: editType,
        platform: editType === 'MESSAGE' ? editPlatform : null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update interaction:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditSummary(interaction.summary);
    setEditDate(formatDateForInput(interaction.date));
    setEditType(interaction.type);
    setEditPlatform(interaction.platform || 'text');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(interaction.id);
    } catch (error) {
      console.error('Failed to delete interaction:', error);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (showDeleteConfirm) {
    return (
      <div className="relative pl-8 pb-8 border-l-2 border-stone-100 last:border-0 last:pb-0">
        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-red-400 shadow-sm" />
        <div className="bg-red-50 p-5 rounded-3xl border border-red-100">
          <p className="text-stone-700 mb-4">Delete this interaction?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Yes, delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-4 py-2 bg-white text-stone-600 text-sm font-medium rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="relative pl-8 pb-8 border-l-2 border-stone-100 last:border-0 last:pb-0">
        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-emerald-400 shadow-sm" />
        <div className="bg-white p-5 rounded-3xl border border-emerald-200 shadow-sm space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as InteractionType)}
              className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {INTERACTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {editType === 'MESSAGE' && (
              <select
                value={editPlatform}
                onChange={(e) => setEditPlatform(e.target.value as MessagePlatform)}
                className="px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                {MESSAGE_PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            )}
          </div>
          <textarea
            value={editSummary}
            onChange={(e) => setEditSummary(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 text-stone-700 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            placeholder="What happened?"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 bg-white text-stone-600 text-sm font-medium rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative pl-8 pb-8 border-l-2 border-stone-100 last:border-0 last:pb-0">
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-emerald-400 shadow-sm" />
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          {formatDate(interaction.date)}
        </span>
        <span className="px-2 py-0.5 bg-stone-100 text-[10px] font-bold rounded-md text-stone-500">
          {getDisplayLabel(interaction.type, interaction.platform)}
        </span>
        <div className="flex-1" />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            title="Edit interaction"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete interaction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-stone-700 leading-relaxed bg-white p-5 rounded-3xl border border-stone-50 shadow-sm">
        {interaction.summary}
      </p>
    </div>
  );
}
