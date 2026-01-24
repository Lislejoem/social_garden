'use client';

import { useState, useEffect } from 'react';
import { Cake, Pencil, Loader2, Check, X, PartyPopper, Plus } from 'lucide-react';
import {
  calculateAge,
  daysUntilBirthday,
  getZodiacSign,
  formatBirthday,
  formatBirthdayForInput,
  parseBirthdayFromInput,
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
          {/* Month and Day selectors */}
          <div className="flex gap-3">
            <select
              value={editMonth}
              onChange={(e) => setEditMonth(Number(e.target.value))}
              className="flex-1 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={editDay}
              onChange={(e) => setEditDay(Number(e.target.value))}
              className="w-24 px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
              className="w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm text-stone-600">I know the year</span>
          </label>

          {/* Year selector (only if include year is checked) */}
          {includeYear && (
            <input
              type="number"
              value={editYear}
              onChange={(e) => setEditYear(Number(e.target.value))}
              min={1900}
              max={new Date().getFullYear()}
              className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Year"
            />
          )}

          {/* Action buttons */}
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
            {hasBirthday && (
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
        <p className="text-lg font-medium text-stone-800">{displayDate}</p>
        <p className="text-stone-500 text-sm">
          {age !== null ? (
            <>{age} years old <span className="mx-2">·</span> </>
          ) : null}
          {zodiac.symbol} {zodiac.name}
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
