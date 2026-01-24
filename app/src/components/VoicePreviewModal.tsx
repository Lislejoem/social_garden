/**
 * @file VoicePreviewModal.tsx
 * @description Editable preview modal for AI-extracted voice note data.
 * Allows users to review, modify, add, or remove extracted items before saving.
 *
 * @flow
 * 1. Receives AI extraction data from /api/ingest?dryRun=true
 * 2. User can edit contact name, location, interaction summary
 * 3. User can add/edit/remove preferences, family members, seedlings
 * 4. User can toggle preference category (ALWAYS <-> NEVER)
 * 5. On confirm, calls onConfirm with edited AIExtraction data
 *
 * @editing
 * Uses a field-based editing pattern:
 * - editingField: tracks which field is being edited (null when not editing)
 * - editValue: temporary value during editing
 * - startEdit(field, value): enters edit mode
 * - saveEdit(field): commits change to local state
 * - cancelEdit(): exits edit mode without saving
 */
'use client';

import { useState } from 'react';
import {
  X,
  Check,
  Loader2,
  User,
  MapPin,
  Heart,
  Ban,
  Users,
  Sprout,
  MessageSquare,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-react';
import type { AIExtraction, Category, InteractionType, MessagePlatform, PreferenceType } from '@/types';
import { INTERACTION_TYPES, PLATFORMS, TYPE_LABELS, PLATFORM_LABELS } from '@/lib/interactions';

/**
 * Props for VoicePreviewModal component
 */
interface VoicePreviewModalProps {
  /** Initial AI-extracted data from voice note */
  extraction: AIExtraction;
  /** Matched existing contact if updating (null for new contacts) */
  existingContact: { id: string; name: string; location: string | null } | null;
  /** Whether this will create a new contact */
  isNewContact: boolean;
  /** Save handler - receives edited extraction data */
  onConfirm: (data: AIExtraction) => Promise<void>;
  /** Cancel handler - closes modal without saving */
  onCancel: () => void;
}

export default function VoicePreviewModal({
  extraction,
  existingContact,
  isNewContact,
  onConfirm,
  onCancel,
}: VoicePreviewModalProps) {
  const [data, setData] = useState<AIExtraction>(extraction);
  const [isSaving, setIsSaving] = useState(false);

  // Editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onConfirm(data);
    } finally {
      setIsSaving(false);
    }
  };

  // Edit handlers
  const startEdit = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const saveEdit = (field: string) => {
    if (field === 'contactName') {
      setData({ ...data, contactName: editValue });
    } else if (field === 'location') {
      setData({ ...data, location: editValue || undefined });
    } else if (field === 'interactionSummary') {
      setData({ ...data, interactionSummary: editValue || undefined });
    }
    setEditingField(null);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Preference handlers
  const updatePreference = (index: number, content: string) => {
    const prefs = [...(data.preferences || [])];
    prefs[index] = { ...prefs[index], content };
    setData({ ...data, preferences: prefs });
  };

  const togglePreferenceCategory = (index: number) => {
    const prefs = [...(data.preferences || [])];
    const newCategory = prefs[index].category === 'ALWAYS' ? 'NEVER' : 'ALWAYS';
    prefs[index] = {
      ...prefs[index],
      category: newCategory,
      // NEVER preferences are always PREFERENCE type (can't have a "never" topic)
      preferenceType: newCategory === 'NEVER' ? 'PREFERENCE' : prefs[index].preferenceType,
    };
    setData({ ...data, preferences: prefs });
  };

  const togglePreferenceType = (index: number) => {
    const prefs = [...(data.preferences || [])];
    // Only allow toggle for ALWAYS preferences
    if (prefs[index].category === 'ALWAYS') {
      prefs[index] = {
        ...prefs[index],
        preferenceType: prefs[index].preferenceType === 'TOPIC' ? 'PREFERENCE' : 'TOPIC',
      };
      setData({ ...data, preferences: prefs });
    }
  };

  const removePreference = (index: number) => {
    const prefs = [...(data.preferences || [])];
    prefs.splice(index, 1);
    setData({ ...data, preferences: prefs });
  };

  const addPreference = (category: Category) => {
    const prefs = [...(data.preferences || [])];
    prefs.push({ category, content: '', preferenceType: 'PREFERENCE' as PreferenceType });
    setData({ ...data, preferences: prefs });
  };

  // Family member handlers
  const updateFamilyMember = (
    index: number,
    field: 'name' | 'relation',
    value: string
  ) => {
    const members = [...(data.familyMembers || [])];
    members[index] = { ...members[index], [field]: value };
    setData({ ...data, familyMembers: members });
  };

  const removeFamilyMember = (index: number) => {
    const members = [...(data.familyMembers || [])];
    members.splice(index, 1);
    setData({ ...data, familyMembers: members });
  };

  const addFamilyMember = () => {
    const members = [...(data.familyMembers || [])];
    members.push({ name: '', relation: '' });
    setData({ ...data, familyMembers: members });
  };

  // Seedling handlers
  const updateSeedling = (index: number, content: string) => {
    const seedlings = [...(data.seedlings || [])];
    seedlings[index] = content;
    setData({ ...data, seedlings });
  };

  const removeSeedling = (index: number) => {
    const seedlings = [...(data.seedlings || [])];
    seedlings.splice(index, 1);
    setData({ ...data, seedlings });
  };

  const addSeedling = () => {
    const seedlings = [...(data.seedlings || [])];
    seedlings.push('');
    setData({ ...data, seedlings });
  };

  const alwaysPrefs = (data.preferences || []).filter(
    (p) => p.category === 'ALWAYS'
  );
  const neverPrefs = (data.preferences || []).filter(
    (p) => p.category === 'NEVER'
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center p-4 md:items-center">
      <div className="bg-white rounded-4xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-serif text-xl font-bold">Review & Edit</h3>
            <p className="text-sm text-stone-500 mt-1">
              {isNewContact
                ? 'New contact will be created'
                : `Adding to ${existingContact?.name}`}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-xl hover:bg-stone-50 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Contact Info */}
          <section className="space-y-4">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" />
              Contact Info
            </h4>

            {/* Name */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500 w-20">Name</span>
              {editingField === 'contactName' ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('contactName');
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    onClick={() => saveEdit('contactName')}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-stone-400 hover:bg-stone-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit('contactName', data.contactName)}
                  className="flex-1 text-left px-3 py-2 rounded-xl hover:bg-stone-50 group flex items-center justify-between"
                >
                  <span className="font-medium">{data.contactName}</span>
                  <Pencil className="w-4 h-4 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500 w-20 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Location
              </span>
              {editingField === 'location' ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Add location..."
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit('location');
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <button
                    onClick={() => saveEdit('location')}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="p-2 text-stone-400 hover:bg-stone-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit('location', data.location || '')}
                  className="flex-1 text-left px-3 py-2 rounded-xl hover:bg-stone-50 group flex items-center justify-between"
                >
                  <span className={data.location ? '' : 'text-stone-400 italic'}>
                    {data.location || 'Add location...'}
                  </span>
                  <Pencil className="w-4 h-4 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </div>
          </section>

          {/* Preferences */}
          {((data.preferences && data.preferences.length > 0) ||
            alwaysPrefs.length > 0 ||
            neverPrefs.length > 0) && (
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Preferences
              </h4>

              {/* Always */}
              {alwaysPrefs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-emerald-600 font-medium uppercase tracking-wider">
                    Always
                  </span>
                  {data.preferences
                    ?.map((p, i) => ({ pref: p, index: i }))
                    .filter((item) => item.pref.category === 'ALWAYS')
                    .map(({ pref, index }) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-emerald-50 rounded-xl p-2"
                      >
                        <button
                          onClick={() => togglePreferenceCategory(index)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                          title="Switch to NEVER"
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          value={pref.content}
                          onChange={(e) =>
                            updatePreference(index, e.target.value)
                          }
                          className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                          placeholder="Enter preference..."
                        />
                        <button
                          onClick={() => togglePreferenceType(index)}
                          className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                            pref.preferenceType === 'TOPIC'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                          title={`Switch to ${pref.preferenceType === 'TOPIC' ? 'Preference' : 'Topic'}`}
                        >
                          {pref.preferenceType === 'TOPIC' ? 'Topic' : 'Pref'}
                        </button>
                        <button
                          onClick={() => removePreference(index)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Never */}
              {neverPrefs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-red-600 font-medium uppercase tracking-wider">
                    Never
                  </span>
                  {data.preferences
                    ?.map((p, i) => ({ pref: p, index: i }))
                    .filter((item) => item.pref.category === 'NEVER')
                    .map(({ pref, index }) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-red-50 rounded-xl p-2"
                      >
                        <button
                          onClick={() => togglePreferenceCategory(index)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Switch to ALWAYS"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          value={pref.content}
                          onChange={(e) =>
                            updatePreference(index, e.target.value)
                          }
                          className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                          placeholder="Enter preference..."
                        />
                        <button
                          onClick={() => removePreference(index)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Add preference buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => addPreference('ALWAYS')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 rounded-lg"
                >
                  <Plus className="w-3 h-3" />
                  Add Always
                </button>
                <button
                  onClick={() => addPreference('NEVER')}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Plus className="w-3 h-3" />
                  Add Never
                </button>
              </div>
            </section>
          )}

          {/* Family Members */}
          {data.familyMembers && data.familyMembers.length > 0 && (
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" />
                Family & Important People
              </h4>
              <div className="space-y-2">
                {data.familyMembers.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-stone-50 rounded-xl p-2"
                  >
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) =>
                        updateFamilyMember(index, 'name', e.target.value)
                      }
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium"
                      placeholder="Name..."
                    />
                    <span className="text-stone-300">·</span>
                    <input
                      type="text"
                      value={member.relation}
                      onChange={(e) =>
                        updateFamilyMember(index, 'relation', e.target.value)
                      }
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm text-stone-500"
                      placeholder="Relation..."
                    />
                    <button
                      onClick={() => removeFamilyMember(index)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addFamilyMember}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-stone-500 hover:bg-stone-100 rounded-lg"
              >
                <Plus className="w-3 h-3" />
                Add Person
              </button>
            </section>
          )}

          {/* Seedlings */}
          {data.seedlings && data.seedlings.length > 0 && (
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <Sprout className="w-4 h-4" />
                Seedlings (Follow-up Ideas)
              </h4>
              <div className="space-y-2">
                {data.seedlings.map((seedling, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-amber-50 rounded-xl p-2"
                  >
                    <Sprout className="w-4 h-4 text-amber-600 shrink-0" />
                    <input
                      type="text"
                      value={seedling}
                      onChange={(e) => updateSeedling(index, e.target.value)}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                      placeholder="Follow-up idea..."
                    />
                    <button
                      onClick={() => removeSeedling(index)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addSeedling}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-amber-600 hover:bg-amber-50 rounded-lg"
              >
                <Plus className="w-3 h-3" />
                Add Seedling
              </button>
            </section>
          )}

          {/* Interaction Summary */}
          {data.interactionSummary && (
            <section className="space-y-4">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Interaction Summary
              </h4>

              {/* Interaction Type Selector */}
              <div className="flex flex-wrap gap-2">
                {INTERACTION_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (type !== 'MESSAGE') {
                        // Clear platform when switching away from MESSAGE
                        setData({ ...data, interactionType: type, interactionPlatform: undefined });
                      } else {
                        // Set default platform when switching to MESSAGE
                        setData({ ...data, interactionType: type, interactionPlatform: data.interactionPlatform || 'text' });
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      (data.interactionType || 'VOICE') === type
                        ? 'bg-emerald-600 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>

              {/* Platform Selector (only for MESSAGE type) */}
              {(data.interactionType || 'VOICE') === 'MESSAGE' && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-stone-500">Platform:</span>
                  <select
                    value={data.interactionPlatform || 'text'}
                    onChange={(e) => setData({ ...data, interactionPlatform: e.target.value as MessagePlatform })}
                    className="px-3 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {PLATFORMS.map((platform) => (
                      <option key={platform} value={platform}>
                        {PLATFORM_LABELS[platform]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editingField === 'interactionSummary' ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-50 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit('interactionSummary')}
                      className="px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() =>
                    startEdit('interactionSummary', data.interactionSummary || '')
                  }
                  className="w-full text-left px-4 py-3 rounded-xl bg-stone-50 hover:bg-stone-100 group"
                >
                  <p className="text-sm text-stone-700">{data.interactionSummary}</p>
                  <span className="text-xs text-stone-400 mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className="w-3 h-3" />
                    Click to edit
                  </span>
                </button>
              )}
            </section>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-stone-100 flex gap-3 shrink-0">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-stone-100 text-stone-700 rounded-2xl font-bold hover:bg-stone-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !data.contactName.trim()}
            className="flex-1 py-4 bg-emerald-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
