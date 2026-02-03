'use client';

import { useState, useEffect } from 'react';
import { Pencil, Trash2, Loader2, Check, X } from 'lucide-react';
import type { Interaction, InteractionType, MessagePlatform } from '@/types';
import { formatDateForInput } from '@/lib/dates';

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
      <div className="relative pl-8 pb-8 border-l-2 border-white/50 last:border-0 last:pb-0">
        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-red-400 shadow-sm" />
        <div className="glass-card bg-red-500/10 p-5 rounded-2xl">
          <p className="text-ink-rich mb-4">Delete this interaction?</p>
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 soft-press disabled:opacity-50 flex items-center gap-2"
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
              className="px-4 py-2 bg-white/50 text-ink-muted text-sm font-medium rounded-xl hover:bg-white/70 soft-press disabled:opacity-50"
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
      <div className="relative pl-8 pb-8 border-l-2 border-white/50 last:border-0 last:pb-0">
        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-grove-primary shadow-sm" />
        <div className="glass-card border border-grove-primary/30 p-5 rounded-2xl space-y-4">
          <div className="flex gap-3 flex-wrap">
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="px-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-grove-primary bg-white/50"
            />
            <select
              value={editType}
              onChange={(e) => setEditType(e.target.value as InteractionType)}
              className="px-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-grove-primary bg-white/50"
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
                className="px-3 py-2 text-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-grove-primary bg-white/50"
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
            className="w-full px-4 py-3 text-ink-rich border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-grove-primary bg-white/50 resize-none"
            placeholder="What happened?"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-grove-primary text-white text-sm font-medium rounded-xl hover:bg-grove-primary-hover soft-press disabled:opacity-50 flex items-center gap-2"
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
              className="px-4 py-2 bg-white/50 text-ink-muted text-sm font-medium rounded-xl hover:bg-white/70 soft-press disabled:opacity-50 flex items-center gap-2"
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
    <div className="group relative pl-8 pb-8 border-l-2 border-white/50 last:border-0 last:pb-0">
      <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-grove-primary shadow-sm" />
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xs font-bold text-ink-muted uppercase tracking-widest">
          {formatDate(interaction.date)}
        </span>
        <span className="px-2 py-0.5 bg-white/50 text-[10px] font-bold rounded-md text-ink-muted">
          {getDisplayLabel(interaction.type, interaction.platform)}
        </span>
        <div className="flex-1" />
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 text-ink-muted hover:text-grove-primary hover:bg-white/30 rounded-lg soft-press transition-colors"
            title="Edit interaction"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="p-1.5 text-ink-muted hover:text-red-600 hover:bg-red-500/10 rounded-lg soft-press transition-colors"
            title="Delete interaction"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-ink-rich leading-relaxed glass-card p-5 rounded-2xl">
        {interaction.summary}
      </p>
    </div>
  );
}
