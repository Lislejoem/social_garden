'use client';

import { useState, useRef, useEffect } from 'react';
import { Heart, Ban, Trash2, Check, X, Loader2 } from 'lucide-react';
import type { Preference, Category } from '@/types';

interface EditablePreferenceProps {
  preference: Preference;
  onUpdate: (id: string, data: { category?: Category; content?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function EditablePreference({
  preference,
  onUpdate,
  onDelete,
}: EditablePreferenceProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(preference.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const isAlways = preference.category === 'ALWAYS';

  const handleToggleCategory = async () => {
    setIsSaving(true);
    try {
      await onUpdate(preference.id, {
        category: isAlways ? 'NEVER' : 'ALWAYS',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContent = async () => {
    const trimmed = editContent.trim();
    if (trimmed === preference.content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(preference.id, { content: trimmed });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(preference.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveContent();
    } else if (e.key === 'Escape') {
      setEditContent(preference.content);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-2xl transition-colors group ${
        isAlways
          ? 'bg-emerald-50 hover:bg-emerald-100/70'
          : 'bg-red-50 hover:bg-red-100/70'
      }`}
    >
      {/* Category Toggle */}
      <button
        onClick={handleToggleCategory}
        disabled={isSaving}
        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
          isAlways
            ? 'text-emerald-600 hover:bg-emerald-200'
            : 'text-red-600 hover:bg-red-200'
        }`}
        title={`Switch to ${isAlways ? 'NEVER' : 'ALWAYS'}`}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isAlways ? (
          <Heart className="w-4 h-4" />
        ) : (
          <Ban className="w-4 h-4" />
        )}
      </button>

      {/* Content */}
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleSaveContent}
            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setEditContent(preference.content);
              setIsEditing(false);
            }}
            className="p-1 text-stone-400 hover:bg-stone-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="flex-1 text-left text-sm font-medium text-stone-700"
        >
          {preference.content}
        </button>
      )}

      {/* Delete Button */}
      {!isEditing && (
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
}
