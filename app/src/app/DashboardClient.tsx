'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Gift, Droplets, Settings } from 'lucide-react';
import Link from 'next/link';
import ContactCard from '@/components/ContactCard';
import SearchBar from '@/components/SearchBar';
import FilterPresets, { FilterType } from '@/components/FilterPresets';
import VoiceRecorder from '@/components/VoiceRecorder';
import PhotoCapture from '@/components/PhotoCapture';
import VoicePreviewModal from '@/components/VoicePreviewModal';
import { useToast } from '@/contexts/ToastContext';
import { useOfflineQueue } from '@/contexts/OfflineQueueContext';
import { celebrateInteraction } from '@/utils/celebrate';
import { hasUpcomingBirthday } from '@/lib/birthday';
import type { HealthStatus, Cadence, Socials, AIExtraction, IngestPreviewResponse } from '@/types';

interface ContactData {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string | null;
  birthday: Date | null;
  birthdayMonth: number | null;
  birthdayDay: number | null;
  cadence: Cadence;
  health: HealthStatus;
  lastContactFormatted: string;
  socials: Socials | null;
  preferencesPreview: string[];
  interactionSummaries: string[];
}

interface DashboardClientProps {
  initialContacts: ContactData[];
  filterCounts: {
    needsWater: number;
    upcomingBirthdays: number;
    hidden: number;
  };
}

export default function DashboardClient({
  initialContacts,
  filterCounts,
}: DashboardClientProps) {
  const router = useRouter();
  const { showToast, showError } = useToast();
  const { isOnline, addToQueue, queueCount, getQueuedNotes, removeFromQueue } = useOfflineQueue();
  const [contacts, setContacts] = useState(initialContacts);
  const [hiddenContacts, setHiddenContacts] = useState<ContactData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const isProcessingQueueRef = useRef(false);
  const [isLoadingHidden, setIsLoadingHidden] = useState(false);

  // Preview modal state
  const [previewData, setPreviewData] = useState<{
    extraction: AIExtraction;
    existingContact: { id: string; name: string; location: string | null } | null;
    isNewContact: boolean;
    rawInput: string;
    imageData?: { base64: string; mimeType: string }; // Track if this came from a photo
    queuedNoteId?: string; // Track if this came from the queue
  } | null>(null);

  // Callback handlers for contact mutations (optimistic updates)
  const handleContactHidden = useCallback((contactId: string) => {
    // Find the contact being hidden
    const contact = contacts.find(c => c.id === contactId);
    if (contact) {
      // Remove from visible contacts
      setContacts(prev => prev.filter(c => c.id !== contactId));
      // Add to hidden contacts (so it shows if user switches to hidden filter)
      setHiddenContacts(prev => [...prev, contact]);
    }
  }, [contacts]);

  const handleContactRestored = useCallback((contactId: string) => {
    // Find the contact being restored
    const contact = hiddenContacts.find(c => c.id === contactId);
    if (contact) {
      // Remove from hidden contacts
      setHiddenContacts(prev => prev.filter(c => c.id !== contactId));
      // Add back to visible contacts
      setContacts(prev => [...prev, contact]);
    }
  }, [hiddenContacts]);

  const handleContactDeleted = useCallback((contactId: string) => {
    // Remove from both lists
    setContacts(prev => prev.filter(c => c.id !== contactId));
    setHiddenContacts(prev => prev.filter(c => c.id !== contactId));
  }, []);

  // Calculate filter counts locally from state
  const localFilterCounts = useMemo(() => ({
    needsWater: contacts.filter(c => c.health === 'thirsty' || c.health === 'parched').length,
    upcomingBirthdays: contacts.filter(c => {
      if (c.birthday) return hasUpcomingBirthday(c.birthday, 30);
      if (c.birthdayMonth && c.birthdayDay) return hasUpcomingBirthday(c.birthdayMonth, c.birthdayDay, 30);
      return false;
    }).length,
    hidden: hiddenContacts.length > 0 ? hiddenContacts.length : filterCounts.hidden,
  }), [contacts, hiddenContacts, filterCounts.hidden]);

  // Filter contacts based on search query and active filter
  const filteredContacts = useMemo(() => {
    // For hidden filter, use hidden contacts
    if (activeFilter === 'hidden') {
      let result = hiddenContacts;
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        result = result.filter(
          (contact) =>
            contact.name.toLowerCase().includes(lowerQuery) ||
            contact.location?.toLowerCase().includes(lowerQuery)
        );
      }
      return result;
    }

    let result = contacts;

    // Apply search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (contact) =>
          contact.name.toLowerCase().includes(lowerQuery) ||
          contact.location?.toLowerCase().includes(lowerQuery) ||
          contact.preferencesPreview.some((p) =>
            p.toLowerCase().includes(lowerQuery)
          ) ||
          contact.interactionSummaries.some((s) =>
            s.toLowerCase().includes(lowerQuery)
          )
      );
    }

    // Apply preset filter
    if (activeFilter === 'needsWater') {
      result = result.filter(
        (contact) => contact.health === 'thirsty' || contact.health === 'parched'
      );
    } else if (activeFilter === 'upcomingBirthdays') {
      result = result.filter((contact) => {
        // Check full birthday first, then month/day only
        if (contact.birthday) {
          return hasUpcomingBirthday(contact.birthday, 30);
        }
        if (contact.birthdayMonth && contact.birthdayDay) {
          return hasUpcomingBirthday(contact.birthdayMonth, contact.birthdayDay, 30);
        }
        return false;
      });
    }

    return result;
  }, [contacts, hiddenContacts, searchQuery, activeFilter]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = async (filter: FilterType) => {
    setActiveFilter(filter);

    // Fetch hidden contacts when hidden filter is selected
    if (filter === 'hidden' && hiddenContacts.length === 0) {
      setIsLoadingHidden(true);
      try {
        const response = await fetch('/api/contacts?hiddenOnly=true');
        if (response.ok) {
          const data = await response.json();
          // Transform API response to match ContactData format
          const transformedContacts: ContactData[] = data.map((contact: {
            id: string;
            name: string;
            avatarUrl: string | null;
            location: string | null;
            birthday: string | null;
            birthdayMonth: number | null;
            birthdayDay: number | null;
            cadence: Cadence;
            socials: string | null;
            preferences: { category: string; content: string }[];
            interactions: { date: string; summary: string }[];
          }) => ({
            id: contact.id,
            name: contact.name,
            avatarUrl: contact.avatarUrl,
            location: contact.location,
            birthday: contact.birthday ? new Date(contact.birthday) : null,
            birthdayMonth: contact.birthdayMonth,
            birthdayDay: contact.birthdayDay,
            cadence: contact.cadence,
            health: 'growing' as HealthStatus, // Hidden contacts don't need health status
            lastContactFormatted: 'Hidden',
            socials: contact.socials ? JSON.parse(contact.socials) : null,
            preferencesPreview: contact.preferences
              .filter((p: { category: string }) => p.category === 'ALWAYS')
              .slice(0, 3)
              .map((p: { content: string }) => p.content),
            interactionSummaries: contact.interactions
              .slice(0, 20)
              .map((i: { summary: string }) => i.summary),
          }));
          setHiddenContacts(transformedContacts);
        }
      } catch (error) {
        console.error('Failed to fetch hidden contacts:', error);
      } finally {
        setIsLoadingHidden(false);
      }
    }
  };

  const handleVoiceNote = async (transcript: string) => {
    // If offline, queue the transcript for later processing
    if (!isOnline) {
      await addToQueue(transcript);
      showToast('Saved offline. Will sync when you reconnect.');
      return;
    }

    // First, get a preview with dryRun
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: transcript, dryRun: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to process voice note');
      }

      const preview: IngestPreviewResponse = await response.json();

      // Show the preview modal
      setPreviewData({
        extraction: preview.extraction,
        existingContact: preview.existingContact || null,
        isNewContact: preview.isNewContact,
        rawInput: transcript,
      });
    } catch {
      // If fetch fails (e.g., network error), queue the transcript
      await addToQueue(transcript);
      showToast('Saved offline. Will sync when you reconnect.');
    }
  };

  const handlePhotoCapture = async (
    imageData: { base64: string; mimeType: string },
    context?: string
  ) => {
    // Photos require online connection (can't easily queue base64 data)
    if (!isOnline) {
      showError('Photo capture requires an internet connection.');
      return;
    }

    // Get a preview with dryRun
    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData,
          additionalContext: context,
          dryRun: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to process photo');
      }

      const preview: IngestPreviewResponse = await response.json();

      // Show the preview modal
      setPreviewData({
        extraction: preview.extraction,
        existingContact: preview.existingContact || null,
        isNewContact: preview.isNewContact,
        rawInput: context || '',
        imageData, // Store for final save
      });
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Failed to process photo');
    }
  };

  const handleConfirmSave = async (editedData: AIExtraction) => {
    if (!previewData) return;

    // Build request body - include imageData if this was a photo capture
    const requestBody: {
      rawInput?: string;
      imageData?: { base64: string; mimeType: string };
      additionalContext?: string;
      overrides: AIExtraction;
    } = {
      overrides: editedData,
    };

    if (previewData.imageData) {
      // Photo capture
      requestBody.imageData = previewData.imageData;
      if (previewData.rawInput) {
        requestBody.additionalContext = previewData.rawInput;
      }
    } else {
      // Voice note or text input
      requestBody.rawInput = previewData.rawInput;
    }

    const response = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error('Failed to save changes');
    }

    const result = await response.json();

    // If this was from the queue, remove it
    if (previewData.queuedNoteId) {
      await removeFromQueue(previewData.queuedNoteId);
    }

    // Close modal, celebrate, and show toast
    setPreviewData(null);
    celebrateInteraction();
    showToast(result.summary);

    // Refresh data
    router.refresh();

    // Process next queued item if any
    processNextQueuedNote();
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
    // If there are more queued notes, process the next one
    processNextQueuedNote();
  };

  // Process the next queued note by showing its preview modal
  const processNextQueuedNote = useCallback(async () => {
    if (isProcessingQueueRef.current || !isOnline) return;

    const notes = await getQueuedNotes();
    const pendingNotes = notes.filter(n => n.status === 'pending');

    if (pendingNotes.length === 0) return;

    isProcessingQueueRef.current = true;
    const note = pendingNotes[0];

    try {
      const response = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput: note.transcript, dryRun: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to process queued note');
      }

      const preview: IngestPreviewResponse = await response.json();

      // Show the preview modal with queue note ID
      setPreviewData({
        extraction: preview.extraction,
        existingContact: preview.existingContact || null,
        isNewContact: preview.isNewContact,
        rawInput: note.transcript,
        queuedNoteId: note.id,
      });
    } catch {
      showError('Failed to process queued note. Will retry later.');
    } finally {
      isProcessingQueueRef.current = false;
    }
  }, [isOnline, getQueuedNotes, showError]);

  // Auto-process queue when coming back online
  useEffect(() => {
    if (isOnline && queueCount > 0 && !previewData) {
      processNextQueuedNote();
    }
  }, [isOnline, queueCount, previewData, processNextQueuedNote]);

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
          <Link
            href="/settings"
            className="p-3 text-stone-400 hover:text-emerald-800 hover:bg-emerald-50 rounded-2xl transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </Link>
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

        {/* Filter Presets */}
        {contacts.length > 0 && (
          <div className="mt-4 mb-8">
            <FilterPresets
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              counts={localFilterCounts}
            />
          </div>
        )}

        {/* Contact Grid */}
        {filteredContacts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredContacts.map((contact) => (
              <ContactCard
                key={contact.id}
                {...contact}
                isHidden={activeFilter === 'hidden'}
                onHidden={handleContactHidden}
                onRestored={handleContactRestored}
                onDeleted={handleContactDeleted}
              />
            ))}

            {/* Add new contact card - only show when not filtering */}
            {activeFilter === 'all' && !searchQuery && (
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
            )}
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
          // No search/filter results
          <div className="text-center py-20">
            {activeFilter === 'hidden' && isLoadingHidden ? (
              <p className="text-stone-500">Loading hidden contacts...</p>
            ) : (
              <>
                <p className="text-stone-500">
                  {activeFilter === 'hidden'
                    ? 'No hidden contacts. Contacts you hide will appear here.'
                    : activeFilter !== 'all'
                    ? `No contacts match the "${activeFilter === 'needsWater' ? 'Needs Water' : 'Upcoming Birthdays'}" filter.`
                    : 'No contacts match your search. Try a different query.'}
                </p>
                {activeFilter !== 'all' && (
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="mt-4 text-emerald-700 font-medium hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Floating Photo Capture - positioned left of voice recorder */}
      <div className="fixed bottom-10 right-36 z-50">
        <PhotoCapture onCapture={handlePhotoCapture} />
      </div>

      {/* Floating Voice Recorder */}
      <VoiceRecorder onTranscriptComplete={handleVoiceNote} />

      {/* Preview Modal */}
      {previewData && (
        <VoicePreviewModal
          extraction={previewData.extraction}
          existingContact={previewData.existingContact}
          isNewContact={previewData.isNewContact}
          onConfirm={handleConfirmSave}
          onCancel={handleCancelPreview}
        />
      )}
    </div>
  );
}
