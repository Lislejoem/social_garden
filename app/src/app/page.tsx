import { prisma } from '@/lib/prisma';
import {
  calculateHealth,
  getLastInteractionDate,
  formatLastContact,
} from '@/lib/health';
import { hasUpcomingBirthday } from '@/lib/birthday';
import type { Cadence, Socials, HealthStatus } from '@/types';
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
      birthday: contact.birthday,
      cadence: contact.cadence as Cadence,
      health,
      lastContactFormatted: formatLastContact(lastInteractionDate),
      socials,
      preferencesPreview,
    };
  });
}

function calculateFilterCounts(contacts: Awaited<ReturnType<typeof getContacts>>) {
  const needsWater = contacts.filter(
    (c) => c.health === 'thirsty' || c.health === 'parched'
  ).length;

  const upcomingBirthdays = contacts.filter(
    (c) => hasUpcomingBirthday(c.birthday, 30)
  ).length;

  return { needsWater, upcomingBirthdays };
}

export default async function Home() {
  const contacts = await getContacts();
  const filterCounts = calculateFilterCounts(contacts);

  return <DashboardClient initialContacts={contacts} filterCounts={filterCounts} />;
}
