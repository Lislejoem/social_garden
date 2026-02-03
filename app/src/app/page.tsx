import { prisma } from '@/lib/prisma';
import { requireUserId } from '@/lib/auth';
import {
  calculateHealth,
  getLastInteractionDate,
  formatLastContact,
} from '@/lib/health';
import { hasUpcomingBirthday } from '@/lib/birthday';
import type { Cadence, Socials } from '@/types';
import DashboardClient from './DashboardClient';

// Force dynamic rendering - always fetch fresh data from database
export const dynamic = 'force-dynamic';

async function getContacts(userId: string) {
  const contacts = await prisma.contact.findMany({
    where: { userId, hiddenAt: null },
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

    // Get interaction summaries for search (limit to recent 20 for performance)
    const interactionSummaries = contact.interactions
      .slice(0, 20)
      .map((i) => i.summary);

    return {
      id: contact.id,
      name: contact.name,
      avatarUrl: contact.avatarUrl,
      location: contact.location,
      birthday: contact.birthday,
      birthdayMonth: contact.birthdayMonth,
      birthdayDay: contact.birthdayDay,
      cadence: contact.cadence as Cadence,
      health,
      lastContactFormatted: formatLastContact(lastInteractionDate),
      socials,
      preferencesPreview,
      interactionSummaries,
    };
  });
}

function calculateFilterCounts(contacts: Awaited<ReturnType<typeof getContacts>>) {
  const needsWater = contacts.filter(
    (c) => c.health === 'thirsty' || c.health === 'parched'
  ).length;

  const upcomingBirthdays = contacts.filter((c) => {
    // Check full birthday first, then month/day only
    if (c.birthday) {
      return hasUpcomingBirthday(c.birthday, 30);
    }
    if (c.birthdayMonth && c.birthdayDay) {
      return hasUpcomingBirthday(c.birthdayMonth, c.birthdayDay, 30);
    }
    return false;
  }).length;

  return { needsWater, upcomingBirthdays };
}

async function getHiddenCount(userId: string) {
  return prisma.contact.count({
    where: { userId, hiddenAt: { not: null } },
  });
}

export default async function Home() {
  const userId = await requireUserId();
  const [contacts, hiddenCount] = await Promise.all([
    getContacts(userId),
    getHiddenCount(userId),
  ]);
  const filterCounts = {
    ...calculateFilterCounts(contacts),
    hidden: hiddenCount,
  };

  return <DashboardClient initialContacts={contacts} filterCounts={filterCounts} />;
}
