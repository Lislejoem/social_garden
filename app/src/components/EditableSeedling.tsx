'use client';

import { useState, useRef, useEffect } from 'react';
import { Sprout, Flower2, Trash2, Check, X, Loader2 } from 'lucide-react';
import type { Seedling, SeedlingStatus } from '@/types';
import { useToast } from '../contexts/ToastContext';

interface EditableSeedlingProps {
  seedling: Seedling;
  onUpdate: (id: string, data: { content?: string; status?: SeedlingStatus }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function EditableSeedling({
  seedling,
  onUpdate,
  onDelete,
}: EditableSeedlingProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(seedling.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { showError } = useToast();

  const isPlanted = seedling.status === 'PLANTED';

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSaveContent = async () => {
    const trimmed = editContent.trim();
    if (trimmed === seedling.content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(seedling.id, { content: trimmed });
      setIsEditing(false);
    } catch {
      showError('Failed to save seedling. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkPlanted = async () => {
    setIsSaving(true);
    try {
      await onUpdate(seedling.id, { status: 'PLANTED' });
    } catch {
      showError('Failed to mark seedling as planted. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(seedling.id);
    } catch {
      showError('Failed to delete seedling. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveContent();
    } else if (e.key === 'Escape') {
      setEditContent(seedling.content);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`p-4 glass-card transition-colors group ${
        isPlanted
          ? 'bg-grove-primary/10'
          : 'bg-grove-seedling/10 hover:bg-grove-seedling/15'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isPlanted ? 'bg-grove-primary/20 text-grove-primary' : 'bg-grove-seedling/20 text-grove-seedling'
          }`}
        >
          {isPlanted ? <Flower2 className="w-4 h-4" /> : <Sprout className="w-4 h-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-2 py-1 bg-white text-ink-rich border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-grove-primary"
              />
              <button
                onClick={handleSaveContent}
                className="p-1 text-grove-primary hover:bg-grove-primary/10 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setEditContent(seedling.content);
                  setIsEditing(false);
                }}
                className="p-1 text-stone-400 hover:bg-stone-200 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p
              onClick={() => !isPlanted && setIsEditing(true)}
              className={`text-sm font-medium ${
                isPlanted
                  ? 'text-grove-primary line-through opacity-70'
                  : 'text-ink-rich cursor-pointer'
              }`}
            >
              {seedling.content}
            </p>
          )}

          {/* Date */}
          <p className="text-xs text-ink-muted mt-1">
            {new Date(seedling.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Actions */}
        {!isEditing && !isPlanted && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={handleMarkPlanted}
              disabled={isSaving}
              className="p-1.5 text-grove-primary hover:bg-grove-primary/10 rounded-lg"
              title="Mark as planted"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Flower2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* Planted: only delete */}
        {!isEditing && isPlanted && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
