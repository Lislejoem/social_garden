import { prisma } from '@/lib/prisma';
import {
  calculateHealth,
  getLastInteractionDate,
  formatLastContact,
} from '@/lib/health';
import type { Cadence, Socials } from '@/types';
import DashboardClient from './DashboardClient';

async function getContacts() {
  const contacts = await prisma.contact.findMany({
    include: {
      preferences: true,
      interactions: {
        orderBy: { date: 'desc' },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return contacts.map((contact) => {
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

    // Get preference previews (ALWAYS preferences only)
    const preferencesPreview = contact.preferences
      .filter((p) => p.category === 'ALWAYS')
      .slice(0, 3)
      .map((p) => p.content);

    return {
      id: contact.id,
      name: contact.name,
      avatarUrl: contact.avatarUrl,
      location: contact.location,
      cadence: contact.cadence as Cadence,
      health,
      lastContactFormatted: formatLastContact(lastInteractionDate),
      socials,
      preferencesPreview,
    };
  });
}

export default async function Home() {
  const contacts = await getContacts();

  return <DashboardClient initialContacts={contacts} />;
}
