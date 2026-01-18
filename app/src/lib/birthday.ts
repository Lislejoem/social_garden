/**
 * @file Birthday Utilities
 * @description Helper functions for birthday calculations and zodiac signs.
 */

/**
 * Calculate age from a birthdate
 */
export function calculateAge(birthday: Date): number {
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate days until next birthday
 * Returns 0 if today is the birthday
 */
export function daysUntilBirthday(birthday: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const birthDate = new Date(birthday);
  const nextBirthday = new Date(
    today.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );

  // If birthday has passed this year, use next year
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }

  const diffTime = nextBirthday.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if birthday is within the next N days
 */
export function hasUpcomingBirthday(birthday: Date | null, withinDays: number = 30): boolean {
  if (!birthday) return false;
  const days = daysUntilBirthday(birthday);
  return days <= withinDays;
}

/**
 * Zodiac sign data
 */
interface ZodiacSign {
  name: string;
  symbol: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

const ZODIAC_SIGNS: ZodiacSign[] = [
  { name: 'Capricorn', symbol: '\u2651', startMonth: 12, startDay: 22, endMonth: 1, endDay: 19 },
  { name: 'Aquarius', symbol: '\u2652', startMonth: 1, startDay: 20, endMonth: 2, endDay: 18 },
  { name: 'Pisces', symbol: '\u2653', startMonth: 2, startDay: 19, endMonth: 3, endDay: 20 },
  { name: 'Aries', symbol: '\u2648', startMonth: 3, startDay: 21, endMonth: 4, endDay: 19 },
  { name: 'Taurus', symbol: '\u2649', startMonth: 4, startDay: 20, endMonth: 5, endDay: 20 },
  { name: 'Gemini', symbol: '\u264A', startMonth: 5, startDay: 21, endMonth: 6, endDay: 20 },
  { name: 'Cancer', symbol: '\u264B', startMonth: 6, startDay: 21, endMonth: 7, endDay: 22 },
  { name: 'Leo', symbol: '\u264C', startMonth: 7, startDay: 23, endMonth: 8, endDay: 22 },
  { name: 'Virgo', symbol: '\u264D', startMonth: 8, startDay: 23, endMonth: 9, endDay: 22 },
  { name: 'Libra', symbol: '\u264E', startMonth: 9, startDay: 23, endMonth: 10, endDay: 22 },
  { name: 'Scorpio', symbol: '\u264F', startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { name: 'Sagittarius', symbol: '\u2650', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
];

/**
 * Get zodiac sign for a birthday
 */
export function getZodiacSign(birthday: Date): { name: string; symbol: string } {
  const birthDate = new Date(birthday);
  const month = birthDate.getMonth() + 1; // 1-12
  const day = birthDate.getDate();

  for (const sign of ZODIAC_SIGNS) {
    // Handle Capricorn which spans year boundary
    if (sign.startMonth > sign.endMonth) {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay)
      ) {
        return { name: sign.name, symbol: sign.symbol };
      }
    } else {
      if (
        (month === sign.startMonth && day >= sign.startDay) ||
        (month === sign.endMonth && day <= sign.endDay) ||
        (month > sign.startMonth && month < sign.endMonth)
      ) {
        return { name: sign.name, symbol: sign.symbol };
      }
    }
  }

  // Fallback (should never happen)
  return { name: 'Unknown', symbol: '?' };
}

/**
 * Format birthday for display
 */
export function formatBirthday(birthday: Date): string {
  return new Date(birthday).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format birthday for input[type="date"]
 */
export function formatBirthdayForInput(birthday: Date): string {
  const d = new Date(birthday);
  return d.toISOString().split('T')[0];
}
