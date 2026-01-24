'use client';

import { useState } from 'react';
import { Sprout, Plus, ChevronRight } from 'lucide-react';
import type { Seedling } from '@/types';

interface SeedlingBedProps {
  seedlings: Seedling[];
  contactId: string;
  onAddSeedling?: (content: string) => Promise<void>;
}

export default function SeedlingBed({
  seedlings,
  onAddSeedling,
}: SeedlingBedProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newSeedling, setNewSeedling] = useState('');

  const activeSeedlings = seedlings.filter((s) => s.status === 'ACTIVE');

  const handleAdd = async () => {
    if (!newSeedling.trim() || !onAddSeedling) return;

    await onAddSeedling(newSeedling.trim());
    setNewSeedling('');
    setIsAdding(false);
  };

  return (
    <div className="sticky top-28">
      <div className="bg-emerald-900 rounded-5xl p-8 text-white shadow-2xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <Sprout className="w-6 h-6 text-emerald-300" />
            <h2 className="text-2xl font-serif font-bold text-white">
              The Seedling Bed
            </h2>
          </div>
          <p className="text-emerald-100/70 text-sm mb-8 italic">
            Future check-ins and ideas to nurture this connection.
          </p>

          <div className="space-y-4">
            {activeSeedlings.length === 0 && !isAdding ? (
              <p className="text-emerald-100/50 text-sm italic text-center py-4">
                No seedlings planted yet. Add follow-up ideas!
              </p>
            ) : (
              activeSeedlings.map((seed) => (
                <div
                  key={seed.id}
                  className="p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/15 transition-all cursor-pointer group"
                >
                  <p className="text-sm leading-relaxed mb-2">{seed.content}</p>
                  <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 flex items-center gap-1">
                      Mark Done <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}

            {isAdding && (
              <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                <textarea
                  value={newSeedling}
                  onChange={(e) => setNewSeedling(e.target.value)}
                  placeholder="What should you follow up on?"
                  className="w-full bg-transparent text-white placeholder:text-emerald-100/50 text-sm resize-none focus:outline-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-emerald-100/70 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdd}
                    className="flex-1 py-2 bg-emerald-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full mt-8 py-4 bg-emerald-800 hover:bg-emerald-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Seedling
            </button>
          )}
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
