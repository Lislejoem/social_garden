'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Gift, Droplets } from 'lucide-react';
import ContactCard from '@/components/ContactCard';
import SearchBar from '@/components/SearchBar';
import VoiceRecorder from '@/components/VoiceRecorder';
import type { HealthStatus, Cadence, Socials } from '@/types';

interface ContactData {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string | null;
  cadence: Cadence;
  health: HealthStatus;
  lastContactFormatted: string;
  socials: Socials | null;
  preferencesPreview: string[];
}

interface DashboardClientProps {
  initialContacts: ContactData[];
}

export default function DashboardClient({
  initialContacts,
}: DashboardClientProps) {
  const router = useRouter();
  const [contacts, setContacts] = useState(initialContacts);
  const [filteredContacts, setFilteredContacts] = useState(initialContacts);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(lowerQuery) ||
        contact.location?.toLowerCase().includes(lowerQuery) ||
        contact.preferencesPreview.some((p) =>
          p.toLowerCase().includes(lowerQuery)
        )
    );
    setFilteredContacts(filtered);
  };

  const handleVoiceNote = async (transcript: string) => {
    const response = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rawInput: transcript }),
    });

    if (!response.ok) {
      throw new Error('Failed to process voice note');
    }

    // Refresh the page to show updated data
    router.refresh();
  };

  // Calculate stats
  const parchedCount = contacts.filter((c) => c.health === 'parched').length;
  const thirstyCount = contacts.filter((c) => c.health === 'thirsty').length;
  const needsWatering = parchedCount + thirstyCount;

  return (
    <div className="min-h-screen pb-24">
      <header className="max-w-7xl mx-auto px-6 pt-12 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-800">
            The Social Garden
          </h1>
          <p className="text-stone-500 mt-1">
            Cultivating {contacts.length} meaningful connection
            {contacts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <a
            href="/contact/new"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-3xl font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Plant New Contact</span>
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6">
        {/* Morning Digest Banner */}
        {contacts.length > 0 && (
          <div className="mb-12 bg-white border border-stone-100 rounded-6xl p-10 shadow-sm relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-emerald-700 font-bold text-[10px] uppercase tracking-[0.3em] mb-4 px-3 py-1 bg-emerald-50 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Garden Status
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-medium mb-6 leading-tight">
                  {needsWatering === 0 ? (
                    <>
                      Your garden is{' '}
                      <span className="text-emerald-700 italic underline decoration-emerald-100 underline-offset-8">
                        thriving
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      {needsWatering} plant{needsWatering !== 1 ? 's' : ''} need
                      {needsWatering === 1 ? 's' : ''}{' '}
                      <span className="text-orange-600 italic underline decoration-orange-100 underline-offset-8">
                        watering
                      </span>
                      .
                    </>
                  )}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {parchedCount > 0 && (
                    <div className="flex items-center gap-2 bg-orange-50 px-5 py-2.5 rounded-2xl border border-orange-100 text-sm font-medium text-orange-700">
                      <Droplets className="w-4 h-4" />
                      <span>{parchedCount} parched</span>
                    </div>
                  )}
                  {thirstyCount > 0 && (
                    <div className="flex items-center gap-2 bg-lime-50 px-5 py-2.5 rounded-2xl border border-lime-100 text-sm font-medium text-lime-700">
                      <Gift className="w-4 h-4" />
                      <span>{thirstyCount} getting thirsty</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/3" />
          </div>
        )}

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        {/* Contact Grid */}
        {filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredContacts.map((contact) => (
              <ContactCard key={contact.id} {...contact} />
            ))}

            {/* Add new contact card */}
            <a
              href="/contact/new"
              className="border-4 border-dashed border-stone-100 rounded-5xl p-10 flex flex-col items-center justify-center text-stone-300 hover:border-emerald-200 hover:text-emerald-700 hover:bg-emerald-50/30 transition-all group min-h-[350px]"
            >
              <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-stone-200 flex items-center justify-center mb-6 group-hover:border-emerald-300 group-hover:bg-white transition-all">
                <Plus className="w-8 h-8" />
              </div>
              <p className="font-serif text-xl italic text-stone-500">
                Plant a New Connection
              </p>
              <p className="text-xs font-sans uppercase tracking-[0.2em] mt-2 opacity-60">
                Add to your garden
              </p>
            </a>
          </div>
        ) : contacts.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-4xl bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-emerald-300" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-800 mb-2">
              Your garden is empty
            </h2>
            <p className="text-stone-500 mb-8 max-w-md mx-auto">
              Start planting connections by recording a voice note or adding
              someone manually.
            </p>
            <a
              href="/contact/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-900 text-white rounded-3xl font-bold shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Plant Your First Contact</span>
            </a>
          </div>
        ) : (
          // No search results
          <div className="text-center py-20">
            <p className="text-stone-500">
              No contacts match your search. Try a different query.
            </p>
          </div>
        )}
      </main>

      {/* Floating Voice Recorder */}
      <VoiceRecorder onTranscriptComplete={handleVoiceNote} />
    </div>
  );
}
