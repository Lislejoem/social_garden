'use client';

import { Star, Wind } from 'lucide-react';
import type { Preference } from '@/types';

interface PreferenceBoardProps {
  preferences: Preference[];
}

export default function PreferenceBoard({ preferences }: PreferenceBoardProps) {
  const alwaysPrefs = preferences.filter((p) => p.category === 'ALWAYS');
  const neverPrefs = preferences.filter((p) => p.category === 'NEVER');

  if (alwaysPrefs.length === 0 && neverPrefs.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Always */}
      <div className="bg-emerald-50/30 rounded-5xl p-8 border border-emerald-100/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white rounded-xl text-emerald-600 shadow-sm">
            <Star className="w-4 h-4 fill-current" />
          </div>
          <h3 className="text-xl font-serif font-bold text-emerald-900 italic">
            Always
          </h3>
        </div>
        {alwaysPrefs.length > 0 ? (
          <ul className="space-y-3">
            {alwaysPrefs.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 text-stone-700"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {item.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-400 text-sm italic">
            No preferences added yet
          </p>
        )}
      </div>

      {/* Never */}
      <div className="bg-stone-100/40 rounded-5xl p-8 border border-stone-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-white rounded-xl text-stone-400 shadow-sm">
            <Wind className="w-4 h-4" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-800 italic">
            Never
          </h3>
        </div>
        {neverPrefs.length > 0 ? (
          <ul className="space-y-3">
            {neverPrefs.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 text-stone-600 line-through decoration-stone-300"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                {item.content}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-stone-400 text-sm italic">
            Nothing to avoid recorded
          </p>
        )}
      </div>
    </div>
  );
}

