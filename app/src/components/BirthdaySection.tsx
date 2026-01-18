'use client';

import { useState } from 'react';
import { Cake, Pencil, Loader2, Check, X, PartyPopper, Plus } from 'lucide-react';
import {
  calculateAge,
  daysUntilBirthday,
  getZodiacSign,
  formatBirthday,
  formatBirthdayForInput,
} from '@/lib/birthday';

interface BirthdaySectionProps {
  birthday: Date | null;
  onSave: (birthday: Date | null) => Promise<void>;
}

export default function BirthdaySection({ birthday, onSave }: BirthdaySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editValue, setEditValue] = useState(birthday ? formatBirthdayForInput(birthday) : '');

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newBirthday = editValue ? new Date(editValue) : null;
      await onSave(newBirthday);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save birthday:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(birthday ? formatBirthdayForInput(birthday) : '');
    setIsEditing(false);
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await onSave(null);
      setEditValue('');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to clear birthday:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Empty state
  if (!birthday && !isEditing) {
    return (
      <div className="bg-white rounded-3xl border border-stone-100 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Cake className="w-5 h-5 text-stone-400" />
          <h3 className="text-lg font-serif font-bold text-stone-800">Birthday</h3>
        </div>
        <p className="text-stone-400 text-sm mb-4">No birthday set</p>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Birthday
        </button>
      </div>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Cake className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-serif font-bold text-stone-800">Birthday</h3>
        </div>
        <div className="space-y-4">
          <input
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-stone-600 text-sm font-medium rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            {birthday && (
              <button
                onClick={handleClear}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-red-600 text-sm font-medium rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors ml-auto"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Display mode
  const age = calculateAge(birthday);
  const daysUntil = daysUntilBirthday(birthday);
  const zodiac = getZodiacSign(birthday);
  const isToday = daysUntil === 0;
  const isSoon = daysUntil > 0 && daysUntil <= 30;

  return (
    <div className={`rounded-3xl border p-6 shadow-sm ${isToday ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Cake className={`w-5 h-5 ${isToday ? 'text-amber-600' : 'text-stone-400'}`} />
          <h3 className="text-lg font-serif font-bold text-stone-800">Birthday</h3>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          title="Edit birthday"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-medium text-stone-800">{formatBirthday(birthday)}</p>
        <p className="text-stone-500 text-sm">
          {age} years old <span className="mx-2">·</span> {zodiac.symbol} {zodiac.name}
        </p>

        {isToday ? (
          <div className="flex items-center gap-2 mt-3 text-amber-700 font-medium">
            <PartyPopper className="w-5 h-5" />
            <span>Happy Birthday!</span>
          </div>
        ) : isSoon ? (
          <div className="flex items-center gap-2 mt-3 text-emerald-700">
            <PartyPopper className="w-4 h-4" />
            <span className="text-sm">Birthday in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}!</span>
          </div>
        ) : (
          <p className="text-stone-400 text-sm mt-1">
            {daysUntil} days until next birthday
          </p>
        )}
      </div>
    </div>
  );
}
