export type HealthStatus = 'thriving' | 'growing' | 'thirsty' | 'parched';
export type Cadence = 'OFTEN' | 'REGULARLY' | 'SELDOMLY' | 'RARELY';

// Thresholds in days for each cadence level
const THRESHOLDS: Record<Cadence, { thirsty: number; parched: number }> = {
  OFTEN: { thirsty: 10, parched: 14 },      // Every 7-10 days
  REGULARLY: { thirsty: 30, parched: 45 },  // Every 3-4 weeks
  SELDOMLY: { thirsty: 90, parched: 120 },  // Every 3 months
  RARELY: { thirsty: 180, parched: 365 },   // Every 6-12 months
};

export function calculateHealth(
  cadence: Cadence,
  lastInteractionDate: Date | null
): HealthStatus {
  if (!lastInteractionDate) {
    return 'parched';
  }

  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const threshold = THRESHOLDS[cadence];

  // Thriving: within half the "thirsty" threshold
  if (daysSince <= threshold.thirsty / 2) {
    return 'thriving';
  }

  // Growing: within the "thirsty" threshold
  if (daysSince <= threshold.thirsty) {
    return 'growing';
  }

  // Thirsty: past thirsty but not yet parched
  if (daysSince <= threshold.parched) {
    return 'thirsty';
  }

  // Parched: past the parched threshold
  return 'parched';
}

export function getLastInteractionDate(
  interactions: { date: Date }[]
): Date | null {
  if (interactions.length === 0) {
    return null;
  }

  return interactions.reduce((latest, interaction) => {
    return interaction.date > latest ? interaction.date : latest;
  }, interactions[0].date);
}

export function formatLastContact(date: Date | null): string {
  if (!date) {
    return 'Never contacted';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} ago`;
  }
}
