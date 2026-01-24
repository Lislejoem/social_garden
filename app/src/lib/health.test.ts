import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateHealth,
  getLastInteractionDate,
  formatLastContact,
  type Cadence,
} from './health';

describe('health', () => {
  const fixedNow = new Date(2025, 0, 20, 12, 0, 0); // Jan 20, 2025 at noon

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateHealth', () => {
    it('returns parched when lastInteractionDate is null', () => {
      expect(calculateHealth('OFTEN', null)).toBe('parched');
      expect(calculateHealth('REGULARLY', null)).toBe('parched');
      expect(calculateHealth('SELDOMLY', null)).toBe('parched');
      expect(calculateHealth('RARELY', null)).toBe('parched');
    });

    describe('OFTEN cadence (thirsty=10, parched=14)', () => {
      const cadence: Cadence = 'OFTEN';

      it('returns thriving when days <= 5 (half of thirsty)', () => {
        const fourDaysAgo = new Date(2025, 0, 16);
        const fiveDaysAgo = new Date(2025, 0, 15);
        expect(calculateHealth(cadence, fourDaysAgo)).toBe('thriving');
        expect(calculateHealth(cadence, fiveDaysAgo)).toBe('thriving');
      });

      it('returns growing when 5 < days <= 10', () => {
        const sixDaysAgo = new Date(2025, 0, 14);
        const tenDaysAgo = new Date(2025, 0, 10);
        expect(calculateHealth(cadence, sixDaysAgo)).toBe('growing');
        expect(calculateHealth(cadence, tenDaysAgo)).toBe('growing');
      });

      it('returns thirsty when 10 < days <= 14', () => {
        const elevenDaysAgo = new Date(2025, 0, 9);
        const fourteenDaysAgo = new Date(2025, 0, 6);
        expect(calculateHealth(cadence, elevenDaysAgo)).toBe('thirsty');
        expect(calculateHealth(cadence, fourteenDaysAgo)).toBe('thirsty');
      });

      it('returns parched when days > 14', () => {
        const fifteenDaysAgo = new Date(2025, 0, 5);
        expect(calculateHealth(cadence, fifteenDaysAgo)).toBe('parched');
      });
    });

    describe('REGULARLY cadence (thirsty=30, parched=45)', () => {
      const cadence: Cadence = 'REGULARLY';

      it('returns thriving when days <= 15 (half of thirsty)', () => {
        const tenDaysAgo = new Date(2025, 0, 10);
        const fifteenDaysAgo = new Date(2025, 0, 5);
        expect(calculateHealth(cadence, tenDaysAgo)).toBe('thriving');
        expect(calculateHealth(cadence, fifteenDaysAgo)).toBe('thriving');
      });

      it('returns growing when 15 < days <= 30', () => {
        const sixteenDaysAgo = new Date(2025, 0, 4);
        const thirtyDaysAgo = new Date(2024, 11, 21);
        expect(calculateHealth(cadence, sixteenDaysAgo)).toBe('growing');
        expect(calculateHealth(cadence, thirtyDaysAgo)).toBe('growing');
      });

      it('returns thirsty when 30 < days <= 45', () => {
        const thirtyOneDaysAgo = new Date(2024, 11, 20);
        const fortyFiveDaysAgo = new Date(2024, 11, 6);
        expect(calculateHealth(cadence, thirtyOneDaysAgo)).toBe('thirsty');
        expect(calculateHealth(cadence, fortyFiveDaysAgo)).toBe('thirsty');
      });

      it('returns parched when days > 45', () => {
        const fiftDaysAgo = new Date(2024, 11, 1);
        expect(calculateHealth(cadence, fiftDaysAgo)).toBe('parched');
      });
    });

    describe('SELDOMLY cadence (thirsty=90, parched=120)', () => {
      const cadence: Cadence = 'SELDOMLY';

      it('returns thriving when days <= 45 (half of thirsty)', () => {
        const thirtyDaysAgo = new Date(2024, 11, 21);
        const fortyFiveDaysAgo = new Date(2024, 11, 6);
        expect(calculateHealth(cadence, thirtyDaysAgo)).toBe('thriving');
        expect(calculateHealth(cadence, fortyFiveDaysAgo)).toBe('thriving');
      });

      it('returns growing when 45 < days <= 90', () => {
        const fiftySixDaysAgo = new Date(2024, 10, 25);
        const ninetyDaysAgo = new Date(2024, 9, 22);
        expect(calculateHealth(cadence, fiftySixDaysAgo)).toBe('growing');
        expect(calculateHealth(cadence, ninetyDaysAgo)).toBe('growing');
      });

      it('returns thirsty when 90 < days <= 120', () => {
        const ninetyOneDaysAgo = new Date(2024, 9, 21);
        const oneHundredTwentyDaysAgo = new Date(2024, 8, 22);
        expect(calculateHealth(cadence, ninetyOneDaysAgo)).toBe('thirsty');
        expect(calculateHealth(cadence, oneHundredTwentyDaysAgo)).toBe('thirsty');
      });

      it('returns parched when days > 120', () => {
        const oneHundredThirtyDaysAgo = new Date(2024, 8, 12);
        expect(calculateHealth(cadence, oneHundredThirtyDaysAgo)).toBe('parched');
      });
    });

    describe('RARELY cadence (thirsty=180, parched=365)', () => {
      const cadence: Cadence = 'RARELY';

      it('returns thriving when days <= 90 (half of thirsty)', () => {
        const sixtyDaysAgo = new Date(2024, 10, 21);
        const ninetyDaysAgo = new Date(2024, 9, 22);
        expect(calculateHealth(cadence, sixtyDaysAgo)).toBe('thriving');
        expect(calculateHealth(cadence, ninetyDaysAgo)).toBe('thriving');
      });

      it('returns growing when 90 < days <= 180', () => {
        const ninetyOneDaysAgo = new Date(2024, 9, 21);
        const oneHundredEightyDaysAgo = new Date(2024, 6, 24);
        expect(calculateHealth(cadence, ninetyOneDaysAgo)).toBe('growing');
        expect(calculateHealth(cadence, oneHundredEightyDaysAgo)).toBe('growing');
      });

      it('returns thirsty when 180 < days <= 365', () => {
        const twoHundredDaysAgo = new Date(2024, 6, 4);
        const threeHundredSixtyFourDaysAgo = new Date(2024, 0, 21);
        expect(calculateHealth(cadence, twoHundredDaysAgo)).toBe('thirsty');
        expect(calculateHealth(cadence, threeHundredSixtyFourDaysAgo)).toBe('thirsty');
      });

      it('returns parched when days > 365', () => {
        const threeHundredSixtySixDaysAgo = new Date(2024, 0, 19);
        expect(calculateHealth(cadence, threeHundredSixtySixDaysAgo)).toBe('parched');
      });
    });

    it('returns thriving for today', () => {
      const today = new Date(2025, 0, 20);
      expect(calculateHealth('OFTEN', today)).toBe('thriving');
      expect(calculateHealth('REGULARLY', today)).toBe('thriving');
      expect(calculateHealth('SELDOMLY', today)).toBe('thriving');
      expect(calculateHealth('RARELY', today)).toBe('thriving');
    });
  });

  describe('getLastInteractionDate', () => {
    it('returns null for empty array', () => {
      expect(getLastInteractionDate([])).toBeNull();
    });

    it('returns the date when only one interaction', () => {
      const date = new Date(2025, 0, 15);
      const result = getLastInteractionDate([{ date }]);
      expect(result).toEqual(date);
    });

    it('returns the most recent date from unsorted array', () => {
      const oldest = new Date(2025, 0, 1);
      const middle = new Date(2025, 0, 10);
      const newest = new Date(2025, 0, 15);

      const interactions = [{ date: middle }, { date: oldest }, { date: newest }];
      const result = getLastInteractionDate(interactions);
      expect(result).toEqual(newest);
    });

    it('returns the most recent date from already sorted array', () => {
      const oldest = new Date(2025, 0, 1);
      const middle = new Date(2025, 0, 10);
      const newest = new Date(2025, 0, 15);

      const interactions = [{ date: newest }, { date: middle }, { date: oldest }];
      const result = getLastInteractionDate(interactions);
      expect(result).toEqual(newest);
    });
  });

  describe('formatLastContact', () => {
    it('returns "Never contacted" for null', () => {
      expect(formatLastContact(null)).toBe('Never contacted');
    });

    it('returns "Today" for today', () => {
      const today = new Date(2025, 0, 20);
      expect(formatLastContact(today)).toBe('Today');
    });

    it('returns "Yesterday" for yesterday', () => {
      const yesterday = new Date(2025, 0, 19);
      expect(formatLastContact(yesterday)).toBe('Yesterday');
    });

    it('returns "X days ago" for 2-6 days', () => {
      expect(formatLastContact(new Date(2025, 0, 18))).toBe('2 days ago');
      expect(formatLastContact(new Date(2025, 0, 14))).toBe('6 days ago');
    });

    it('returns "1 week ago" for 7-13 days', () => {
      expect(formatLastContact(new Date(2025, 0, 13))).toBe('1 week ago');
      expect(formatLastContact(new Date(2025, 0, 8))).toBe('1 week ago');
    });

    it('returns "X weeks ago" for 14-29 days', () => {
      expect(formatLastContact(new Date(2025, 0, 6))).toBe('2 weeks ago');
      expect(formatLastContact(new Date(2024, 11, 22))).toBe('4 weeks ago');
    });

    it('returns "1 month ago" for 30-59 days', () => {
      expect(formatLastContact(new Date(2024, 11, 21))).toBe('1 month ago');
      expect(formatLastContact(new Date(2024, 10, 23))).toBe('1 month ago');
    });

    it('returns "X months ago" for 60-364 days', () => {
      expect(formatLastContact(new Date(2024, 10, 20))).toBe('2 months ago');
      expect(formatLastContact(new Date(2024, 1, 20))).toBe('11 months ago');
    });

    it('returns "1 year ago" for 365-729 days', () => {
      expect(formatLastContact(new Date(2024, 0, 20))).toBe('1 year ago');
      expect(formatLastContact(new Date(2023, 1, 25))).toBe('1 year ago');
    });

    it('returns "X years ago" for 730+ days', () => {
      expect(formatLastContact(new Date(2023, 0, 19))).toBe('2 years ago');
      expect(formatLastContact(new Date(2020, 0, 20))).toBe('5 years ago');
    });
  });
});
