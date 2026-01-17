'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MoreHorizontal,
  Flower2,
  Sprout,
  Leaf,
  Droplets,
  MapPin,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Users,
  Zap,
  Star,
  Wind,
  Plus,
} from 'lucide-react';
import InteractionTimeline from '@/components/InteractionTimeline';
import VoiceRecorder from '@/components/VoiceRecorder';
import VoicePreviewModal from '@/components/VoicePreviewModal';
import ConfirmationToast from '@/components/ConfirmationToast';
import EditableText from '@/components/EditableText';
import EditableCadence from '@/components/EditableCadence';
import EditablePreference from '@/components/EditablePreference';
import EditableFamilyMember from '@/components/EditableFamilyMember';
import EditableSeedling from '@/components/EditableSeedling';
import type {
  HealthStatus,
  Cadence,
  Socials,
  Preference,
  Interaction,
  Seedling,
  FamilyMember,
  AIExtraction,
  IngestPreviewResponse,
  Category,
  SeedlingStatus,
} from '@/types';

interface ContactData {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string | null;
  birthday: Date | null;
  cadence: Cadence;
  socials: Socials | null;
  health: HealthStatus;
  preferences: Preference[];
  interactions: Interaction[];
  seedlings: Seedling[];
  familyMembers: FamilyMember[];
}

interface ProfileClientProps {
  contact: ContactData;
}


const HEALTH_THEMES: Record<
  HealthStatus,
  {
    color: string;
    border: string;
    icon: React.ReactNode;
    text: string;
  }
> = {
  thriving: {
    color: 'bg-emerald-100',
    border: 'border-emerald-200',
    icon: <Flower2 className="w-5 h-5 text-emerald-700" />,
    text: 'text-emerald-800',
  },
  growing: {
    color: 'bg-emerald-50',
    border: 'border-emerald-100',
    icon: <Sprout className="w-5 h-5 text-emerald-600" />,
    text: 'text-emerald-700',
  },
  thirsty: {
    color: 'bg-lime-50/50',
    border: 'border-lime-100',
    icon: <Leaf className="w-5 h-5 text-lime-600" />,
    text: 'text-lime-700',
  },
  parched: {
    color: 'bg-orange-50',
    border: 'border-orange-100',
    icon: <Droplets className="w-5 h-5 text-orange-600" />,
    text: 'text-orange-700',
  },
};

export default function ProfileClient({ contact }: ProfileClientProps) {
  const router = useRouter();
  const theme = HEALTH_THEMES[contact.health];

  // Preview modal state
  const [previewData, setPreviewData] = useState<{
    extraction: AIExtraction;
    existingContact: { id: string; name: string; location: string | null } | null;
    isNewContact: boolean;
    rawInput: string;
  } | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleVoiceNote = async (transcript: string) => {
    // First, get a preview with dryRun
    const response = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawInput: transcript,
        contactId: contact.id,
        dryRun: true,
      }),
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
  };

  const handleConfirmSave = async (editedData: AIExtraction) => {
    if (!previewData) return;

    const response = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawInput: previewData.rawInput,
        contactId: contact.id,
        overrides: editedData,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save changes');
    }

    const result = await response.json();

    // Close modal and show toast
    setPreviewData(null);
    setToastMessage(result.summary);

    // Refresh data
    router.refresh();
  };

  const handleCancelPreview = () => {
    setPreviewData(null);
  };

  const handleAddSeedling = async (content: string) => {
    const response = await fetch(`/api/contacts/${contact.id}/seedlings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error('Failed to add seedling');
    }

    router.refresh();
  };

  // Contact field handlers
  const handleUpdateContact = async (field: string, value: string) => {
    const response = await fetch(`/api/contacts/${contact.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update ${field}`);
    }

    router.refresh();
  };

  const handleUpdateCadence = async (cadence: Cadence) => {
    await handleUpdateContact('cadence', cadence);
  };

  // Preference handlers
  const handleUpdatePreference = async (
    id: string,
    data: { category?: Category; content?: string }
  ) => {
    const response = await fetch(`/api/preferences/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update preference');
    }

    router.refresh();
  };

  const handleDeletePreference = async (id: string) => {
    const response = await fetch(`/api/preferences/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete preference');
    }

    router.refresh();
  };

  // Family member handlers
  const handleUpdateFamilyMember = async (
    id: string,
    data: { name?: string; relation?: string }
  ) => {
    const response = await fetch(`/api/family-members/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update family member');
    }

    router.refresh();
  };

  const handleDeleteFamilyMember = async (id: string) => {
    const response = await fetch(`/api/family-members/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete family member');
    }

    router.refresh();
  };

  // Seedling handlers
  const handleUpdateSeedling = async (
    id: string,
    data: { content?: string; status?: SeedlingStatus }
  ) => {
    const response = await fetch(`/api/seedlings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update seedling');
    }

    router.refresh();
  };

  const handleDeleteSeedling = async (id: string) => {
    const response = await fetch(`/api/seedlings/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete seedling');
    }

    router.refresh();
  };

  // Extract topics from ALWAYS preferences (items that seem like interests)
  const topics = contact.preferences
    .filter((p) => p.category === 'ALWAYS')
    .filter((p) => p.content.length > 15) // Longer items are likely topics
    .slice(0, 5);

  const alwaysPrefs = contact.preferences.filter((p) => p.category === 'ALWAYS');
  const neverPrefs = contact.preferences.filter((p) => p.category === 'NEVER');
  const activeSeedlings = contact.seedlings.filter((s) => s.status === 'ACTIVE');

  return (
    <div className="min-h-screen pb-24">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-[#FDFCFB]/80 backdrop-blur-md border-b border-stone-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-stone-500 hover:text-emerald-800 font-bold transition-all group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Garden</span>
          </Link>
          <button className="p-2.5 text-stone-400 hover:text-stone-600">
            <MoreHorizontal />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 mt-12">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row gap-10 items-start md:items-center mb-16">
          <div className="relative">
            {contact.avatarUrl ? (
              <img
                src={contact.avatarUrl}
                alt={contact.name}
                className="w-32 h-32 md:w-48 md:h-48 rounded-6xl object-cover shadow-2xl ring-8 ring-white"
              />
            ) : (
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-6xl bg-stone-200 ring-8 ring-white flex items-center justify-center text-stone-400 text-4xl font-bold">
                {contact.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div
              className={`absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl border-2 ${theme.border}`}
            >
              {theme.icon}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <EditableText
                value={contact.name}
                onSave={(value) => handleUpdateContact('name', value)}
                className="text-4xl md:text-6xl font-serif font-bold text-stone-800 tracking-tight"
                inputClassName="text-4xl md:text-6xl font-serif font-bold text-stone-800 tracking-tight w-full"
                showEditIcon={false}
              />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-stone-500">
              <EditableCadence
                value={contact.cadence}
                onSave={handleUpdateCadence}
              />
              <span className="flex items-center gap-1.5 text-sm">
                <MapPin className="w-4 h-4 text-stone-300" />
                <EditableText
                  value={contact.location}
                  onSave={(value) => handleUpdateContact('location', value)}
                  placeholder="Add location..."
                  showEditIcon={false}
                />
              </span>
              <div className="h-4 w-px bg-stone-200 mx-2 hidden md:block" />
              <div className="flex items-center gap-3">
                {contact.socials?.instagram && (
                  <a
                    href={contact.socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Instagram className="w-5 h-5 hover:text-pink-600 cursor-pointer transition-colors" />
                  </a>
                )}
                {contact.socials?.linkedin && (
                  <a
                    href={contact.socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-5 h-5 hover:text-blue-600 cursor-pointer transition-colors" />
                  </a>
                )}
                {contact.socials?.email && (
                  <a href={`mailto:${contact.socials.email}`}>
                    <Mail className="w-5 h-5 hover:text-amber-600 cursor-pointer transition-colors" />
                  </a>
                )}
                {contact.socials?.phone && (
                  <a href={`tel:${contact.socials.phone}`}>
                    <Phone className="w-5 h-5 hover:text-emerald-600 cursor-pointer transition-colors" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: The Greenhouse Cheat Sheet */}
          <div className="lg:col-span-2 space-y-12">
            {/* Essential People */}
            {contact.familyMembers.length > 0 && (
              <div className="bg-white rounded-5xl p-8 border border-stone-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">
                    Important People
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.familyMembers.map((person) => (
                    <EditableFamilyMember
                      key={person.id}
                      member={person}
                      onUpdate={handleUpdateFamilyMember}
                      onDelete={handleDeleteFamilyMember}
                    />
                  ))}
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Users className="w-24 h-24" />
                </div>
              </div>
            )}

            {/* Preference Board (Always/Never) */}
            {(alwaysPrefs.length > 0 || neverPrefs.length > 0) && (
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
                    <div className="space-y-2">
                      {alwaysPrefs.map((pref) => (
                        <EditablePreference
                          key={pref.id}
                          preference={pref}
                          onUpdate={handleUpdatePreference}
                          onDelete={handleDeletePreference}
                        />
                      ))}
                    </div>
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
                    <div className="space-y-2">
                      {neverPrefs.map((pref) => (
                        <EditablePreference
                          key={pref.id}
                          preference={pref}
                          onUpdate={handleUpdatePreference}
                          onDelete={handleDeletePreference}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-400 text-sm italic">
                      Nothing to avoid recorded
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Topics of Interest */}
            {topics.length > 0 && (
              <div className="bg-white rounded-5xl p-8 border border-stone-100 shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold">
                    Topics They Care About
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {topics.map((topic) => (
                    <div
                      key={topic.id}
                      className="px-6 py-3 bg-stone-50 text-stone-700 rounded-2xl border border-stone-100 font-medium"
                    >
                      {topic.content}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interaction History (Summarized) */}
            <InteractionTimeline interactions={contact.interactions} />
          </div>

          {/* Right Column: The Seedling Bed */}
          <div className="space-y-8">
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
                    {activeSeedlings.length === 0 ? (
                      <p className="text-emerald-100/50 text-sm italic text-center py-4">
                        No seedlings planted yet. Add follow-up ideas!
                      </p>
                    ) : (
                      activeSeedlings.map((seedling) => (
                        <EditableSeedling
                          key={seedling.id}
                          seedling={seedling}
                          onUpdate={handleUpdateSeedling}
                          onDelete={handleDeleteSeedling}
                        />
                      ))
                    )}
                  </div>

                  <AddSeedlingButton onAdd={handleAddSeedling} />
                </div>

                {/* Decorative background element */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </main>

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

      {/* Confirmation Toast */}
      {toastMessage && (
        <ConfirmationToast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

// Local component for adding seedlings
function AddSeedlingButton({ onAdd }: { onAdd: (content: string) => Promise<void> }) {
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSaving(true);
    try {
      await onAdd(content.trim());
      setContent('');
      setIsAdding(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (isAdding) {
    return (
      <div className="mt-6 p-4 bg-white/10 rounded-2xl border border-white/20">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What should you follow up on?"
          className="w-full bg-transparent text-white placeholder:text-emerald-100/50 text-sm resize-none focus:outline-none"
          rows={3}
          autoFocus
        />
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              setIsAdding(false);
              setContent('');
            }}
            className="flex-1 py-2 text-xs font-bold uppercase tracking-widest text-emerald-100/70 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !content.trim()}
            className="flex-1 py-2 bg-emerald-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="w-full mt-8 py-4 bg-emerald-800 hover:bg-emerald-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
    >
      <Plus className="w-4 h-4" /> Add Seedling
    </button>
  );
}
