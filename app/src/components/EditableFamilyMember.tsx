'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Trash2, Check, X, Loader2 } from 'lucide-react';
import type { FamilyMember } from '@/types';
import { useToast } from '../contexts/ToastContext';
import { useUserSettings } from '../contexts/UserSettingsContext';

/** Normalize a name for comparison (trim, lowercase, unicode normalize) */
function normalizeForMatch(name: string): string {
  return name.trim().toLowerCase().normalize('NFC');
}

interface EditableFamilyMemberProps {
  member: FamilyMember;
  onUpdate: (id: string, data: { name?: string; relation?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function EditableFamilyMember({
  member,
  onUpdate,
  onDelete,
}: EditableFamilyMemberProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(member.name);
  const [editRelation, setEditRelation] = useState(member.relation);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { showError } = useToast();
  const { settings, isLoading: isLoadingSettings } = useUserSettings();

  // Determine if this family member represents the current user
  const isUserMatch = useMemo(() => {
    // Always match "User" (the AI placeholder for the person recording)
    if (normalizeForMatch(member.name) === 'user') {
      return true;
    }
    // Also match if the name equals the userName from settings
    if (!isLoadingSettings && settings.userName) {
      return normalizeForMatch(settings.userName) === normalizeForMatch(member.name);
    }
    return false;
  }, [isLoadingSettings, settings.userName, member.name]);

  // Display name: use settings.userName if stored name is "User", otherwise use stored name
  const displayName = useMemo(() => {
    if (normalizeForMatch(member.name) === 'user' && settings.userName) {
      return settings.userName;
    }
    return member.name;
  }, [member.name, settings.userName]);

  useEffect(() => {
    if (isEditing && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmedName = editName.trim();
    const trimmedRelation = editRelation.trim();

    if (trimmedName === member.name && trimmedRelation === member.relation) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onUpdate(member.id, {
        name: trimmedName,
        relation: trimmedRelation,
      });
      setIsEditing(false);
    } catch {
      showError('Failed to save family member. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(member.name);
    setEditRelation(member.relation);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(member.id);
    } catch {
      showError('Failed to delete family member. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
      <div className="flex items-center gap-4 p-4 rounded-2xl glass-card border border-grove-primary/30">
        <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center text-ink-muted font-bold shrink-0">
          {editName[0]?.toUpperCase() || '?'}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <input
            ref={nameInputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Name"
            className="px-2 py-1 bg-white/50 border border-white/30 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-grove-primary"
          />
          <input
            type="text"
            value={editRelation}
            onChange={(e) => setEditRelation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Relation (e.g., spouse, sister)"
            className="px-2 py-1 bg-white/50 border border-white/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-grove-primary"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-ink-muted" />
          ) : (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 text-grove-primary hover:bg-grove-primary/10 rounded-lg soft-press"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-ink-muted hover:bg-white/30 rounded-lg soft-press"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-4 p-4 rounded-2xl bg-white/30 hover:bg-white/50 transition-colors border border-transparent hover:border-white/50 group cursor-pointer soft-press"
      onClick={() => setIsEditing(true)}
    >
      <div className="w-10 h-10 bg-white/60 rounded-xl flex items-center justify-center text-ink-muted font-bold shrink-0">
        {displayName[0]?.toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="font-bold text-ink-rich">
          {displayName}
          {isUserMatch && <span className="text-ink-muted font-normal"> (You)</span>}
        </p>
        <p className="text-xs text-ink-muted uppercase tracking-widest">
          {member.relation}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        disabled={isDeleting}
        className="p-1.5 text-ink-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
      >
        {isDeleting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Trash2 className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
