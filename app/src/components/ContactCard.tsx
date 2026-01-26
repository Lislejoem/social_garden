/**
 * @file ContactCard.tsx
 * @description Dashboard card displaying contact summary with health status.
 * Shows avatar, name, location, health indicator, and preference preview.
 */
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Flower2,
  Sprout,
  Leaf,
  Droplets,
  MapPin,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
} from 'lucide-react';
import type { HealthStatus, Cadence, Socials } from '@/types';
import { useToast } from '@/contexts/ToastContext';
import ContactMenu from './ContactMenu';

/** Props for ContactCard component */
interface ContactCardProps {
  id: string;
  name: string;
  avatarUrl: string | null;
  location: string | null;
  cadence: Cadence;
  health: HealthStatus;
  lastContactFormatted: string;
  socials: Socials | null;
  preferencesPreview: string[];
  isHidden?: boolean;
  /** Called after contact is successfully hidden */
  onHidden?: (id: string) => void;
  /** Called after contact is successfully restored */
  onRestored?: (id: string) => void;
  /** Called after contact is successfully deleted */
  onDeleted?: (id: string) => void;
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
    badge: string;
  }
> = {
  thriving: {
    color: 'bg-emerald-100',
    border: 'hover:border-emerald-400',
    icon: <Flower2 className="w-4 h-4 text-emerald-700" />,
    badge: 'bg-emerald-200 text-emerald-800',
  },
  growing: {
    color: 'bg-emerald-50',
    border: 'hover:border-emerald-200',
    icon: <Sprout className="w-4 h-4 text-emerald-600" />,
    badge: 'bg-emerald-100 text-emerald-700',
  },
  thirsty: {
    color: 'bg-lime-50/50',
    border: 'hover:border-lime-200',
    icon: <Leaf className="w-4 h-4 text-lime-600" />,
    badge: 'bg-lime-100 text-lime-700',
  },
  parched: {
    color: 'bg-orange-50',
    border: 'hover:border-orange-200',
    icon: <Droplets className="w-4 h-4 text-orange-600" />,
    badge: 'bg-orange-100 text-orange-700',
  },
};

const ContactCard = React.memo(function ContactCard({
  id,
  name,
  avatarUrl,
  location,
  cadence,
  health,
  lastContactFormatted,
  socials,
  preferencesPreview,
  isHidden = false,
  onHidden,
  onRestored,
  onDeleted,
}: ContactCardProps) {
  const { showToast, showError } = useToast();
  const theme = HEALTH_THEMES[health];

  const handleHide = async () => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiddenAt: new Date().toISOString() }),
      });
      if (!response.ok) throw new Error('Failed to hide contact');
      showToast(`${name} hidden from your garden`);
      onHidden?.(id);
    } catch {
      showError('Failed to hide contact. Please try again.');
    }
  };

  const handleRestore = async () => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hiddenAt: null }),
      });
      if (!response.ok) throw new Error('Failed to restore contact');
      showToast(`${name} restored to your garden`);
      onRestored?.(id);
    } catch {
      showError('Failed to restore contact. Please try again.');
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      showToast(`${name} removed permanently`);
      onDeleted?.(id);
    } catch {
      showError('Failed to delete contact. Please try again.');
    }
  };

  return (
    <div
      className={`relative group p-6 rounded-5xl transition-all duration-500 border-2 border-transparent ${theme.border} hover:shadow-2xl hover:shadow-emerald-900/5 ${theme.color}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-16 h-16 rounded-3xl object-cover shadow-inner ring-4 ring-white"
              />
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-stone-200 ring-4 ring-white flex items-center justify-center text-stone-500 text-xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-xl shadow-sm border border-stone-50">
              {theme.icon}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-800 leading-tight">
              {name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/60 text-stone-600">
                {CADENCE_LABELS[cadence]}
              </span>
              {location && (
                <span className="flex items-center gap-1 text-[10px] text-stone-400 font-sans uppercase tracking-widest">
                  <MapPin className="w-3 h-3" /> {location}
                </span>
              )}
            </div>
          </div>
        </div>
        <ContactMenu
          contactName={name}
          isHidden={isHidden}
          onHide={handleHide}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      </div>

      {/* Social & Contact Actions */}
      <div className="flex gap-2 mb-6">
        {socials?.instagram && (
          <a
            href={socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-white rounded-2xl text-stone-400 hover:text-emerald-700 hover:shadow-md transition-all"
          >
            <Instagram className="w-4 h-4" />
          </a>
        )}
        {socials?.linkedin && (
          <a
            href={socials.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2.5 bg-white rounded-2xl text-stone-400 hover:text-emerald-700 hover:shadow-md transition-all"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
        {socials?.phone && (
          <a
            href={`tel:${socials.phone}`}
            className="p-2.5 bg-white rounded-2xl text-stone-400 hover:text-emerald-700 hover:shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        )}
        {socials?.email && (
          <a
            href={`mailto:${socials.email}`}
            className="p-2.5 bg-white rounded-2xl text-stone-400 hover:text-emerald-700 hover:shadow-md transition-all"
          >
            <Mail className="w-4 h-4" />
          </a>
        )}
      </div>

      {/* Quick Preferences */}
      {preferencesPreview.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {preferencesPreview.slice(0, 3).map((pref, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-white/40 text-[11px] font-medium text-stone-600 rounded-xl border border-white/50"
            >
              {pref}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between text-[11px] text-stone-400 border-t border-stone-200/40 pt-4">
        <span className="flex items-center gap-1.5">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              health === 'parched'
                ? 'bg-orange-500 animate-pulse'
                : 'bg-emerald-400'
            }`}
          />
          Last seen {lastContactFormatted}
        </span>
        <Link
          href={`/contact/${id}`}
          className="font-bold text-stone-600 hover:text-emerald-800 transition-all uppercase tracking-tighter"
        >
          Open Profile
        </Link>
      </div>
    </div>
  );
});

export default ContactCard;
