'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { useToast } from '@/contexts/ToastContext';

export default function SettingsPage() {
  const { settings, isLoading, updateUserName } = useUserSettings();
  const { showToast, showError } = useToast();
  const [userName, setUserName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state with context when settings load
  useEffect(() => {
    if (!isLoading) {
      setUserName(settings.userName ?? '');
    }
  }, [isLoading, settings.userName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await updateUserName(userName.trim() || null);
      showToast('Settings saved');
    } catch {
      showError('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = (settings.userName ?? '') !== userName;

  return (
    <div className="min-h-screen pb-24">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-500 hover:text-emerald-800 font-bold transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Garden</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 mt-12">
        <h1 className="text-4xl font-serif font-bold text-stone-800 mb-2">
          Gardener&apos;s Profile
        </h1>
        <p className="text-stone-500 mb-12">
          Your name helps personalize how relationships appear in your grove.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Name */}
            <div>
              <label
                htmlFor="userName"
                className="block text-sm font-bold text-stone-600 uppercase tracking-widest mb-3"
              >
                Your Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                maxLength={100}
                autoCapitalize="words"
                className="w-full px-6 py-4 bg-white border border-stone-200 rounded-2xl text-lg focus:outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                placeholder="Enter your name"
              />
              <p className="text-stone-400 text-sm mt-2">
                When a contact&apos;s family member has your name, we&apos;ll show &quot;Your brother&quot; instead of &quot;{userName || 'Name'} &middot; brother&quot;.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSaving || !hasChanges}
              className="w-full py-5 bg-emerald-900 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
