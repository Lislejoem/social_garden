'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Gift, Droplets, Settings } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
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
    <div className="min-h-screen pb-24 grove-bg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="glass-container p-6 md:p-8">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold text-ink-rich">
                Grove
              </h1>
              <p className="text-ink-muted mt-1">
                Cultivating {contacts.length} meaningful connection
                {contacts.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <a
                href="/contact/new"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-grove-primary text-white rounded-3xl font-bold shadow-xl shadow-grove-primary/20 hover:bg-grove-primary-hover hover:-translate-y-0.5 soft-press transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Plant New Contact</span>
              </a>
              <Link
                href="/settings"
                className="p-3 text-ink-muted hover:text-grove-primary hover:bg-white/30 rounded-2xl transition-all"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-10 h-10',
                  },
                }}
              />
            </div>
          </header>

          <main>
        {/* Morning Digest Banner */}
        {contacts.length > 0 && (
          <div className="mb-12 glass-card rounded-4xl p-8 md:p-10 relative overflow-hidden group">
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 text-grove-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4 px-3 py-1 bg-grove-primary/10 rounded-full">
                  <div className="w-1.5 h-1.5 bg-grove-primary rounded-full animate-pulse" />
                  Grove Status
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-medium text-ink-rich mb-6 leading-tight">
                  {needsWatering === 0 ? (
                    <>
                      Your grove is{' '}
                      <span className="text-grove-primary italic underline decoration-grove-primary/20 underline-offset-8">
                        thriving
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      {needsWatering} plant{needsWatering !== 1 ? 's' : ''} need
                      {needsWatering === 1 ? 's' : ''}{' '}
                      <span className="text-grove-parched italic underline decoration-grove-parched/20 underline-offset-8">
                        watering
                      </span>
                      .
                    </>
                  )}
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  {parchedCount > 0 && (
                    <div className="flex items-center gap-2 bg-grove-parched/10 px-5 py-2.5 rounded-2xl border border-grove-parched/20 text-sm font-medium text-grove-parched">
                      <Droplets className="w-4 h-4" />
                      <span>{parchedCount} parched</span>
                    </div>
                  )}
                  {thirstyCount > 0 && (
                    <div className="flex items-center gap-2 bg-grove-thirsty/10 px-5 py-2.5 rounded-2xl border border-grove-thirsty/20 text-sm font-medium text-grove-thirsty">
                      <Gift className="w-4 h-4" />
                      <span>{thirstyCount} getting thirsty</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
                className="glass-card border-2 border-dashed border-white/50 rounded-3xl p-10 flex flex-col items-center justify-center text-ink-muted hover:border-grove-primary/40 hover:text-grove-primary hover:bg-white/30 soft-press transition-all group min-h-[350px]"
              >
                <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-white/50 flex items-center justify-center mb-6 group-hover:border-grove-primary/40 group-hover:bg-white/40 transition-all">
                  <Plus className="w-8 h-8" />
                </div>
                <p className="font-serif text-xl italic text-ink-muted group-hover:text-grove-primary">
                  Plant a New Connection
                </p>
                <p className="text-xs font-sans uppercase tracking-[0.2em] mt-2 opacity-60">
                  Add to your grove
                </p>
              </a>
            )}
          </div>
        ) : contacts.length === 0 ? (
          // Empty state
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-4xl bg-grove-primary/10 flex items-center justify-center mx-auto mb-6">
              <Plus className="w-12 h-12 text-grove-primary/50" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-ink-rich mb-2">
              Your grove is empty
            </h2>
            <p className="text-ink-muted mb-8 max-w-md mx-auto">
              Start planting connections by recording a voice note or adding
              someone manually.
            </p>
            <a
              href="/contact/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-grove-primary text-white rounded-3xl font-bold shadow-xl shadow-grove-primary/20 hover:bg-grove-primary-hover soft-press transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>Plant Your First Contact</span>
            </a>
          </div>
        ) : (
          // No search/filter results
          <div className="text-center py-20">
            {activeFilter === 'hidden' && isLoadingHidden ? (
              <p className="text-ink-muted">Loading hidden contacts...</p>
            ) : (
              <>
                <p className="text-ink-muted">
                  {activeFilter === 'hidden'
                    ? 'No hidden contacts. Contacts you hide will appear here.'
                    : activeFilter !== 'all'
                    ? `No contacts match the "${activeFilter === 'needsWater' ? 'Needs Water' : 'Upcoming Birthdays'}" filter.`
                    : 'No contacts match your search. Try a different query.'}
                </p>
                {activeFilter !== 'all' && (
                  <button
                    onClick={() => setActiveFilter('all')}
                    className="mt-4 text-grove-primary font-medium hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </>
            )}
          </div>
        )}
          </main>
        </div>
      </div>

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
