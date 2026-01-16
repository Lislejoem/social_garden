'use client';

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
  Clock,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  Users,
  Zap,
} from 'lucide-react';
import PreferenceBoard from '@/components/PreferenceBoard';
import InteractionTimeline from '@/components/InteractionTimeline';
import SeedlingBed from '@/components/SeedlingBed';
import VoiceRecorder from '@/components/VoiceRecorder';
import type {
  HealthStatus,
  Cadence,
  Socials,
  Preference,
  Interaction,
  Seedling,
  FamilyMember,
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

const CADENCE_LABELS: Record<Cadence, string> = {
  OFTEN: 'Often',
  REGULARLY: 'Regularly',
  SELDOMLY: 'Seldomly',
  RARELY: 'Rarely',
};

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

  const handleVoiceNote = async (transcript: string) => {
    const response = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rawInput: transcript,
        contactId: contact.id,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to process voice note');
    }

    router.refresh();
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

  // Extract topics from ALWAYS preferences (items that seem like interests)
  const topics = contact.preferences
    .filter((p) => p.category === 'ALWAYS')
    .filter((p) => p.content.length > 15) // Longer items are likely topics
    .slice(0, 5);

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
          <div className="flex items-center gap-3">
            <button className="p-2.5 text-stone-400 hover:text-stone-600">
              <MoreHorizontal />
            </button>
            <Link
              href={`/contact/${contact.id}/edit`}
              className="px-6 py-2.5 bg-emerald-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-900/10"
            >
              Edit Profile
            </Link>
          </div>
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
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-stone-800 tracking-tight">
                {contact.name}
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-stone-500">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-white border border-stone-100 rounded-full text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> {CADENCE_LABELS[contact.cadence]}
              </span>
              {contact.location && (
                <span className="flex items-center gap-1.5 text-sm">
                  <MapPin className="w-4 h-4 text-stone-300" /> {contact.location}
                </span>
              )}
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
              <div className="bg-white rounded-5xl p-8 border border-stone-100 shadow-sm relative overflow-hidden group">
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
                    <div
                      key={person.id}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50/50 hover:bg-stone-50 transition-colors border border-transparent hover:border-stone-100"
                    >
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-400 font-bold">
                        {person.name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{person.name}</p>
                        <p className="text-xs text-stone-400 uppercase tracking-widest">
                          {person.relation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Users className="w-24 h-24" />
                </div>
              </div>
            )}

            {/* Preference Board (Always/Never) */}
            <PreferenceBoard preferences={contact.preferences} />

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
            <SeedlingBed
              seedlings={contact.seedlings}
              contactId={contact.id}
              onAddSeedling={handleAddSeedling}
            />
          </div>
        </div>
      </main>

      {/* Floating Voice Recorder */}
      <VoiceRecorder onTranscriptComplete={handleVoiceNote} />
    </div>
  );
}
