/**
 * @file EditableText.tsx
 * @description Inline editable text field. Click to edit, blur or Enter to save.
 * Used throughout the app for editing contact names, locations, preferences, etc.
 */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Pencil, Check, X, Loader2 } from 'lucide-react';

/** Props for EditableText component */
interface EditableTextProps {
  value: string | null;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  emptyClassName?: string;
  showEditIcon?: boolean;
  as?: 'span' | 'h1' | 'p';
}

export default function EditableText({
  value,
  onSave,
  placeholder = 'Click to add...',
  className = '',
  inputClassName = '',
  emptyClassName = 'text-stone-400 italic',
  showEditIcon = true,
  as: Component = 'span',
}: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditValue(value || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue === (value || '')) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Small delay to allow button clicks to register
            setTimeout(() => {
              if (isEditing && !isSaving) {
                handleSave();
              }
            }, 150);
          }}
          disabled={isSaving}
          className={`px-2 py-1 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputClassName}`}
          placeholder={placeholder}
        />
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
        ) : (
          <>
            <button
              onClick={handleSave}
              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-stone-400 hover:bg-stone-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleStartEdit}
      className={`group inline-flex items-center gap-2 text-left hover:bg-stone-50 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
    >
      <Component className={value ? '' : emptyClassName}>
        {value || placeholder}
      </Component>
      {showEditIcon && (
        <Pencil className="w-3.5 h-3.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </button>
  );
}
