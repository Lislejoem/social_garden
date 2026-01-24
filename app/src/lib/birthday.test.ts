import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateAge,
  daysUntilBirthday,
  hasUpcomingBirthday,
  getZodiacSign,
  formatBirthday,
  formatBirthdayForInput,
  parseBirthdayFromInput,
} from './birthday';

describe('birthday', () => {
  const fixedNow = new Date(2025, 0, 20, 12, 0, 0); // Jan 20, 2025 at noon

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateAge', () => {
    it('returns null for null input', () => {
      expect(calculateAge(null)).toBeNull();
    });

    it('calculates correct age when birthday has passed this year', () => {
      const birthday = new Date(1990, 0, 15); // Jan 15, 1990 (before Jan 20)
      expect(calculateAge(birthday)).toBe(35);
    });

    it('calculates correct age when birthday has not passed this year', () => {
      const birthday = new Date(1990, 5, 15); // Jun 15, 1990 (after Jan 20)
      expect(calculateAge(birthday)).toBe(34);
    });

    it('returns 0 for a baby born this year', () => {
      const birthday = new Date(2025, 0, 10); // Jan 10, 2025
      expect(calculateAge(birthday)).toBe(0);
    });

    it('calculates age correctly on the exact birthday', () => {
      const birthday = new Date(1990, 0, 20); // Jan 20, 1990 (today)
      expect(calculateAge(birthday)).toBe(35);
    });

    it('calculates age correctly one day before birthday', () => {
      const birthday = new Date(1990, 0, 21); // Jan 21, 1990 (tomorrow)
      expect(calculateAge(birthday)).toBe(34);
    });
  });

  describe('daysUntilBirthday', () => {
    it('returns 0 when today is the birthday (Date overload)', () => {
      const birthday = new Date(1990, 0, 20); // Jan 20
      expect(daysUntilBirthday(birthday)).toBe(0);
    });

    it('returns 0 when today is the birthday (month/day overload)', () => {
      expect(daysUntilBirthday(1, 20)).toBe(0); // Jan 20
    });

    it('returns correct days for upcoming birthday this year', () => {
      const birthday = new Date(1990, 1, 14); // Feb 14
      expect(daysUntilBirthday(birthday)).toBe(25); // 25 days from Jan 20 to Feb 14
    });

    it('returns correct days for birthday that has passed (wraps to next year)', () => {
      const birthday = new Date(1990, 0, 10); // Jan 10 (already passed)
      // Next Jan 10 is 355 days away (Jan 20 2025 -> Jan 10 2026)
      expect(daysUntilBirthday(birthday)).toBe(355);
    });

    it('both overloads give same result for same date', () => {
      const birthday = new Date(1990, 6, 4); // Jul 4
      const dateResult = daysUntilBirthday(birthday);
      const monthDayResult = daysUntilBirthday(7, 4);
      expect(dateResult).toBe(monthDayResult);
    });

    it('returns 1 for tomorrow', () => {
      expect(daysUntilBirthday(1, 21)).toBe(1); // Jan 21
    });

    it('handles year-end birthday from early in year', () => {
      const birthday = new Date(1990, 11, 25); // Dec 25
      // Dec 25 is 339 days from Jan 20
      expect(daysUntilBirthday(birthday)).toBe(339);
    });
  });

  describe('hasUpcomingBirthday', () => {
    it('returns false for null input (Date overload)', () => {
      expect(hasUpcomingBirthday(null)).toBe(false);
    });

    it('returns false for null month/day', () => {
      expect(hasUpcomingBirthday(null, null)).toBe(false);
    });

    it('returns true when birthday is within threshold (Date overload)', () => {
      const birthday = new Date(1990, 1, 10); // Feb 10, 21 days away
      expect(hasUpcomingBirthday(birthday, 30)).toBe(true);
    });

    it('returns false when birthday is past threshold (Date overload)', () => {
      const birthday = new Date(1990, 2, 1); // Mar 1, 40 days away
      expect(hasUpcomingBirthday(birthday, 30)).toBe(false);
    });

    it('uses default 30 days when withinDays not specified', () => {
      const within30Days = new Date(1990, 1, 15); // Feb 15, 26 days
      const beyond30Days = new Date(1990, 2, 10); // Mar 10, 49 days
      expect(hasUpcomingBirthday(within30Days)).toBe(true);
      expect(hasUpcomingBirthday(beyond30Days)).toBe(false);
    });

    it('returns true when birthday is today', () => {
      const today = new Date(1990, 0, 20); // Jan 20
      expect(hasUpcomingBirthday(today, 30)).toBe(true);
    });

    it('returns true for birthday exactly at threshold', () => {
      // Feb 19 is 30 days from Jan 20
      const exactly30Days = new Date(1990, 1, 19);
      expect(hasUpcomingBirthday(exactly30Days, 30)).toBe(true);
    });

    it('works with month/day overload', () => {
      expect(hasUpcomingBirthday(2, 10, 30)).toBe(true); // Feb 10, 21 days
      expect(hasUpcomingBirthday(3, 1, 30)).toBe(false); // Mar 1, 40 days
    });
  });

  describe('getZodiacSign', () => {
    const zodiacTestCases = [
      { month: 1, day: 1, expected: 'Capricorn' },
      { month: 1, day: 19, expected: 'Capricorn' },
      { month: 1, day: 20, expected: 'Aquarius' },
      { month: 2, day: 18, expected: 'Aquarius' },
      { month: 2, day: 19, expected: 'Pisces' },
      { month: 3, day: 20, expected: 'Pisces' },
      { month: 3, day: 21, expected: 'Aries' },
      { month: 4, day: 19, expected: 'Aries' },
      { month: 4, day: 20, expected: 'Taurus' },
      { month: 5, day: 20, expected: 'Taurus' },
      { month: 5, day: 21, expected: 'Gemini' },
      { month: 6, day: 20, expected: 'Gemini' },
      { month: 6, day: 21, expected: 'Cancer' },
      { month: 7, day: 22, expected: 'Cancer' },
      { month: 7, day: 23, expected: 'Leo' },
      { month: 8, day: 22, expected: 'Leo' },
      { month: 8, day: 23, expected: 'Virgo' },
      { month: 9, day: 22, expected: 'Virgo' },
      { month: 9, day: 23, expected: 'Libra' },
      { month: 10, day: 22, expected: 'Libra' },
      { month: 10, day: 23, expected: 'Scorpio' },
      { month: 11, day: 21, expected: 'Scorpio' },
      { month: 11, day: 22, expected: 'Sagittarius' },
      { month: 12, day: 21, expected: 'Sagittarius' },
      { month: 12, day: 22, expected: 'Capricorn' },
      { month: 12, day: 31, expected: 'Capricorn' },
    ];

    zodiacTestCases.forEach(({ month, day, expected }) => {
      it(`returns ${expected} for ${month}/${day}`, () => {
        const result = getZodiacSign(month, day);
        expect(result.name).toBe(expected);
        expect(result.symbol).toBeTruthy();
      });
    });

    it('works with Date overload', () => {
      const birthday = new Date(1990, 6, 4); // Jul 4 (month is 0-indexed)
      const result = getZodiacSign(birthday);
      expect(result.name).toBe('Cancer');
    });

    it('returns symbol with name', () => {
      const result = getZodiacSign(3, 21);
      expect(result).toEqual({ name: 'Aries', symbol: '♈' });
    });
  });

  describe('formatBirthday', () => {
    it('formats full Date with year', () => {
      const birthday = new Date(2000, 0, 20);
      expect(formatBirthday(birthday)).toBe('January 20, 2000');
    });

    it('formats month/day without year', () => {
      expect(formatBirthday(1, 20)).toBe('January 20');
    });

    it('handles single-digit days', () => {
      expect(formatBirthday(3, 5)).toBe('March 5');
    });

    it('formats all months correctly', () => {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      months.forEach((monthName, index) => {
        expect(formatBirthday(index + 1, 15)).toBe(`${monthName} 15`);
      });
    });
  });

  describe('formatBirthdayForInput', () => {
    it('formats date as YYYY-MM-DD', () => {
      const birthday = new Date(2000, 0, 20); // Jan 20, 2000
      expect(formatBirthdayForInput(birthday)).toBe('2000-01-20');
    });

    it('pads single-digit months', () => {
      const birthday = new Date(1990, 4, 15); // May 15
      expect(formatBirthdayForInput(birthday)).toBe('1990-05-15');
    });

    it('pads single-digit days', () => {
      const birthday = new Date(1990, 11, 5); // Dec 5
      expect(formatBirthdayForInput(birthday)).toBe('1990-12-05');
    });
  });

  describe('parseBirthdayFromInput', () => {
    it('parses YYYY-MM-DD string to Date', () => {
      const result = parseBirthdayFromInput('2000-01-20');
      expect(result.getFullYear()).toBe(2000);
      expect(result.getMonth()).toBe(0); // January
      expect(result.getDate()).toBe(20);
    });

    it('sets time to noon to avoid DST issues', () => {
      const result = parseBirthdayFromInput('2000-03-15');
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('round-trip consistency', () => {
    it('format -> parse preserves date', () => {
      const original = new Date(1990, 5, 15, 12, 0, 0); // Jun 15, 1990
      const formatted = formatBirthdayForInput(original);
      const parsed = parseBirthdayFromInput(formatted);

      expect(parsed.getFullYear()).toBe(original.getFullYear());
      expect(parsed.getMonth()).toBe(original.getMonth());
      expect(parsed.getDate()).toBe(original.getDate());
    });

    it('parse -> format preserves string', () => {
      const original = '1985-12-25';
      const parsed = parseBirthdayFromInput(original);
      const formatted = formatBirthdayForInput(parsed);

      expect(formatted).toBe(original);
    });
  });
});
