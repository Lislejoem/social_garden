import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  calculateHealth,
  getLastInteractionDate,
} from '@/lib/health';
import type { Cadence, Socials, AvatarSource } from '@/types';
import ProfileClient from './ProfileClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getContact(id: string) {
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      preferences: true,
      interactions: {
        orderBy: { date: 'desc' },
      },
      seedlings: {
        orderBy: { createdAt: 'desc' },
      },
      familyMembers: true,
    },
  });

  if (!contact) {
    return null;
  }

  const lastInteractionDate = getLastInteractionDate(
    contact.interactions.map((i) => ({ date: i.date }))
  );
  const health = calculateHealth(
    contact.cadence as Cadence,
    lastInteractionDate
  );

  // Parse socials JSON
  let socials: Socials | null = null;
  if (contact.socials) {
    try {
      socials = JSON.parse(contact.socials) as Socials;
    } catch {
      socials = null;
    }
  }

  return {
    id: contact.id,
    name: contact.name,
    avatarUrl: contact.avatarUrl,
    avatarSource: contact.avatarSource as AvatarSource | null,
    preferredAvatarSource: contact.preferredAvatarSource as AvatarSource | null,
    location: contact.location,
    birthday: contact.birthday,
    birthdayMonth: contact.birthdayMonth,
    birthdayDay: contact.birthdayDay,
    cadence: contact.cadence as Cadence,
    socials,
    health,
    preferences: contact.preferences.map((p) => ({
      id: p.id,
      category: p.category as 'ALWAYS' | 'NEVER',
      preferenceType: p.preferenceType as 'TOPIC' | 'PREFERENCE',
      content: p.content,
    })),
    interactions: contact.interactions.map((i) => ({
      id: i.id,
      date: i.date,
      type: i.type as 'CALL' | 'MESSAGE' | 'MEET' | 'VOICE',
      platform: i.platform as 'text' | 'instagram' | 'telegram' | 'linkedin' | null,
      summary: i.summary,
    })),
    seedlings: contact.seedlings.map((s) => ({
      id: s.id,
      content: s.content,
      status: s.status as 'ACTIVE' | 'PLANTED',
      createdAt: s.createdAt,
    })),
    familyMembers: contact.familyMembers.map((f) => ({
      id: f.id,
      name: f.name,
      relation: f.relation,
    })),
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { id } = await params;
  const contact = await getContact(id);

  if (!contact) {
    notFound();
  }

  return <ProfileClient contact={contact} />;
}
