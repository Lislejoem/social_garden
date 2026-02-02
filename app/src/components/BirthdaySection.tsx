'use client';

import { useState, useEffect } from 'react';
import { Cake, Pencil, Loader2, Check, X, PartyPopper, Plus } from 'lucide-react';
import {
  calculateAge,
  daysUntilBirthday,
  getZodiacSign,
  formatBirthday,
} from '@/lib/birthday';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface BirthdaySectionProps {
  birthday: Date | null;
  birthdayMonth: number | null;
  birthdayDay: number | null;
  onSave: (data: { birthday?: Date | null; birthdayMonth?: number | null; birthdayDay?: number | null }) => Promise<void>;
}

export default function BirthdaySection({ birthday, birthdayMonth, birthdayDay, onSave }: BirthdaySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [includeYear, setIncludeYear] = useState(!!birthday);
  const [editMonth, setEditMonth] = useState(birthday ? birthday.getMonth() + 1 : (birthdayMonth || 1));
  const [editDay, setEditDay] = useState(birthday ? birthday.getDate() : (birthdayDay || 1));
  const [editYear, setEditYear] = useState(birthday ? birthday.getFullYear() : new Date().getFullYear() - 30);

  // Determine if we have any birthday info
  const hasBirthday = birthday || (birthdayMonth && birthdayDay);

  // Reset edit state when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setIncludeYear(!!birthday);
      setEditMonth(birthday ? birthday.getMonth() + 1 : (birthdayMonth || 1));
      setEditDay(birthday ? birthday.getDate() : (birthdayDay || 1));
      setEditYear(birthday ? birthday.getFullYear() : new Date().getFullYear() - 30);
    }
  }, [isEditing, birthday, birthdayMonth, birthdayDay]);

  // Get days in selected month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const daysInMonth = getDaysInMonth(editMonth, editYear);

  // Adjust day if it exceeds days in month
  useEffect(() => {
    if (editDay > daysInMonth) {
      setEditDay(daysInMonth);
    }
  }, [editMonth, editYear, editDay, daysInMonth]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (includeYear) {
        // Save full birthday
        const newBirthday = new Date(editYear, editMonth - 1, editDay, 12, 0, 0);
        await onSave({ birthday: newBirthday, birthdayMonth: null, birthdayDay: null });
      } else {
        // Save month/day only
        await onSave({ birthday: null, birthdayMonth: editMonth, birthdayDay: editDay });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save birthday:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleClear = async () => {
    setIsSaving(true);
    try {
      await onSave({ birthday: null, birthdayMonth: null, birthdayDay: null });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to clear birthday:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Empty state
  if (!hasBirthday && !isEditing) {
    return (
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cake className="w-5 h-5 text-ink-muted" />
          <h3 className="text-lg font-serif font-bold text-ink-rich">Birthday</h3>
        </div>
        <p className="text-ink-muted text-sm mb-4">No birthday set</p>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-grove-primary bg-grove-primary/10 rounded-xl hover:bg-grove-primary/20 soft-press transition-colors"
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
      <div className="glass-card rounded-3xl border border-grove-primary/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Cake className="w-5 h-5 text-grove-primary" />
          <h3 className="text-lg font-serif font-bold text-ink-rich">Birthday</h3>
        </div>
        <div className="space-y-4">
          {/* Month and Day selectors */}
          <div className="flex gap-3">
            <select
              value={editMonth}
              onChange={(e) => setEditMonth(Number(e.target.value))}
              className="flex-1 px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-grove-primary bg-white/50"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={editDay}
              onChange={(e) => setEditDay(Number(e.target.value))}
              className="w-24 px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-grove-primary bg-white/50"
            >
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          {/* Include year checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeYear}
              onChange={(e) => setIncludeYear(e.target.checked)}
              className="w-5 h-5 rounded border-white/50 text-grove-primary focus:ring-grove-primary"
            />
            <span className="text-sm text-ink-muted">I know the year</span>
          </label>

          {/* Year selector (only if include year is checked) */}
          {includeYear && (
            <input
              type="number"
              value={editYear}
              onChange={(e) => setEditYear(Number(e.target.value))}
              min={1900}
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-grove-primary bg-white/50"
              placeholder="Year"
            />
          )}

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-grove-primary text-white text-sm font-medium rounded-xl hover:bg-grove-primary-hover soft-press disabled:opacity-50 transition-colors"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-ink-muted text-sm font-medium rounded-xl border border-white/30 hover:bg-white/30 soft-press disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            {hasBirthday && (
              <button
                onClick={handleClear}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-red-600 text-sm font-medium rounded-xl hover:bg-red-500/10 soft-press disabled:opacity-50 transition-colors ml-auto"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Display mode - determine what to show
  const hasFullBirthday = !!birthday;
  const month = hasFullBirthday ? birthday.getMonth() + 1 : birthdayMonth!;
  const day = hasFullBirthday ? birthday.getDate() : birthdayDay!;

  const age = hasFullBirthday ? calculateAge(birthday) : null;
  const daysUntil = hasFullBirthday ? daysUntilBirthday(birthday) : daysUntilBirthday(month, day);
  const zodiac = hasFullBirthday ? getZodiacSign(birthday) : getZodiacSign(month, day);
  const displayDate = hasFullBirthday ? formatBirthday(birthday) : formatBirthday(month, day);

  const isToday = daysUntil === 0;
  const isSoon = daysUntil > 0 && daysUntil <= 30;

  return (
    <div className={`glass-card rounded-3xl p-6 ${isToday ? 'bg-grove-peach/20 border border-grove-peach/30' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Cake className={`w-5 h-5 ${isToday ? 'text-grove-peach' : 'text-ink-muted'}`} />
          <h3 className="text-lg font-serif font-bold text-ink-rich">Birthday</h3>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="p-2 text-ink-muted hover:text-grove-primary hover:bg-white/30 rounded-lg soft-press transition-colors"
          title="Edit birthday"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-lg font-medium text-ink-rich">{displayDate}</p>
        <p className="text-ink-muted text-sm">
          {age !== null ? (
            <>{age} years old <span className="mx-2">·</span> </>
          ) : null}
          {zodiac.symbol} {zodiac.name}
        </p>

        {isToday ? (
          <div className="flex items-center gap-2 mt-3 text-grove-peach font-medium">
            <PartyPopper className="w-5 h-5" />
            <span>Happy Birthday!</span>
          </div>
        ) : isSoon ? (
          <div className="flex items-center gap-2 mt-3 text-grove-primary">
            <PartyPopper className="w-4 h-4" />
            <span className="text-sm">Birthday in {daysUntil} {daysUntil === 1 ? 'day' : 'days'}!</span>
          </div>
        ) : (
          <p className="text-ink-muted text-sm mt-1">
            {daysUntil} days until next birthday
          </p>
        )}
      </div>
    </div>
  );
}
