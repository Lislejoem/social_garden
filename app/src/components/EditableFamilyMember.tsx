'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2, Check, X, Loader2 } from 'lucide-react';
import type { FamilyMember } from '@/types';

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
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-400 font-bold shrink-0">
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
            className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            value={editRelation}
            onChange={(e) => setEditRelation(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Relation (e.g., spouse, sister)"
            className="px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
          ) : (
            <>
              <button
                onClick={handleSave}
                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 text-stone-400 hover:bg-stone-200 rounded-lg"
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
      className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50/50 hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100 group cursor-pointer"
      onClick={() => setIsEditing(true)}
    >
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-400 font-bold shrink-0">
        {member.name[0]?.toUpperCase()}
      </div>
      <div className="flex-1">
        <p className="font-bold text-stone-800">{member.name}</p>
        <p className="text-xs text-stone-400 uppercase tracking-widest">
          {member.relation}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
        disabled={isDeleting}
        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
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
