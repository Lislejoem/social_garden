/**
 * @file Birthday Utilities
 * @description Helper functions for birthday calculations and zodiac signs.
 * Supports both full birthdays (with year) and partial birthdays (month/day only).
 */

/**
 * Calculate age from a birthdate (requires year)
 * Returns null if birthday doesn't have a year
 */
export function calculateAge(birthday: Date | null): number | null {
  if (!birthday) return null;
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
 * Supports both full Date and month/day only
 */
export function daysUntilBirthday(birthday: Date): number;
export function daysUntilBirthday(month: number, day: number): number;
export function daysUntilBirthday(birthdayOrMonth: Date | number, day?: number): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let month: number;
  let dayOfMonth: number;

  if (typeof birthdayOrMonth === 'number') {
    // Month/day only
    month = birthdayOrMonth - 1; // Convert 1-12 to 0-11
    dayOfMonth = day!;
  } else {
    // Full Date
    const birthDate = new Date(birthdayOrMonth);
    month = birthDate.getMonth();
    dayOfMonth = birthDate.getDate();
  }

  const nextBirthday = new Date(today.getFullYear(), month, dayOfMonth);

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
 * Supports both full Date and month/day only
 */
export function hasUpcomingBirthday(birthday: Date | null, withinDays?: number): boolean;
export function hasUpcomingBirthday(month: number | null, day: number | null, withinDays?: number): boolean;
export function hasUpcomingBirthday(
  birthdayOrMonth: Date | number | null,
  dayOrWithinDays?: number | null,
  withinDays: number = 30
): boolean {
  if (birthdayOrMonth === null) return false;

  if (typeof birthdayOrMonth === 'number') {
    // Month/day only
    if (dayOrWithinDays === null || dayOrWithinDays === undefined) return false;
    const days = daysUntilBirthday(birthdayOrMonth, dayOrWithinDays);
    return days <= withinDays;
  } else {
    // Full Date
    const days = daysUntilBirthday(birthdayOrMonth);
    return days <= (dayOrWithinDays ?? 30);
  }
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
 * Supports both full Date and month/day only
 */
export function getZodiacSign(birthday: Date): { name: string; symbol: string };
export function getZodiacSign(month: number, day: number): { name: string; symbol: string };
export function getZodiacSign(birthdayOrMonth: Date | number, day?: number): { name: string; symbol: string } {
  let month: number;
  let dayOfMonth: number;

  if (typeof birthdayOrMonth === 'number') {
    month = birthdayOrMonth; // Already 1-12
    dayOfMonth = day!;
  } else {
    const birthDate = new Date(birthdayOrMonth);
    month = birthDate.getMonth() + 1; // 1-12
    dayOfMonth = birthDate.getDate();
  }

  for (const sign of ZODIAC_SIGNS) {
    // Handle Capricorn which spans year boundary
    if (sign.startMonth > sign.endMonth) {
      if (
        (month === sign.startMonth && dayOfMonth >= sign.startDay) ||
        (month === sign.endMonth && dayOfMonth <= sign.endDay)
      ) {
        return { name: sign.name, symbol: sign.symbol };
      }
    } else {
      if (
        (month === sign.startMonth && dayOfMonth >= sign.startDay) ||
        (month === sign.endMonth && dayOfMonth <= sign.endDay) ||
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
 * Supports both full Date and month/day only
 */
export function formatBirthday(birthday: Date): string;
export function formatBirthday(month: number, day: number): string;
export function formatBirthday(birthdayOrMonth: Date | number, day?: number): string {
  if (typeof birthdayOrMonth === 'number') {
    // Month/day only - create a date just for formatting
    const date = new Date(2000, birthdayOrMonth - 1, day!);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  }
  return new Date(birthdayOrMonth).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format birthday for input[type="date"]
 * Uses local date parts to avoid timezone shift issues
 */
export function formatBirthdayForInput(birthday: Date): string {
  const d = new Date(birthday);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a date string from input[type="date"] as local date
 * Sets time to noon to avoid DST boundary issues
 */
export function parseBirthdayFromInput(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}
