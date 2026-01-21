import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseDateFromInput, formatDateForInput, parseRelativeDate } from './dates';

describe('dates', () => {
  describe('parseDateFromInput', () => {
    it('parses YYYY-MM-DD string to local date at noon', () => {
      const result = parseDateFromInput('2025-01-20');

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(0); // January is 0
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(12); // Noon to avoid DST issues
    });

    it('handles different months correctly', () => {
      const result = parseDateFromInput('2025-12-25');

      expect(result.getFullYear()).toBe(2025);
      expect(result.getMonth()).toBe(11); // December is 11
      expect(result.getDate()).toBe(25);
    });

    it('handles single digit months and days in the input', () => {
      const result = parseDateFromInput('2025-03-05');

      expect(result.getMonth()).toBe(2); // March is 2
      expect(result.getDate()).toBe(5);
    });
  });

  describe('formatDateForInput', () => {
    it('formats Date to YYYY-MM-DD string', () => {
      const date = new Date(2025, 0, 20, 12, 0, 0); // Jan 20, 2025 at noon
      const result = formatDateForInput(date);

      expect(result).toBe('2025-01-20');
    });

    it('pads single digit months and days', () => {
      const date = new Date(2025, 2, 5, 12, 0, 0); // March 5, 2025
      const result = formatDateForInput(date);

      expect(result).toBe('2025-03-05');
    });

    it('handles dates from different timezones consistently', () => {
      // Simulate a date that came from the database as UTC string
      const utcDate = new Date('2025-01-20T00:00:00.000Z');
      const result = formatDateForInput(utcDate);

      // Should format using local date parts, not shift due to timezone
      const localDate = new Date(utcDate);
      const expected = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
      expect(result).toBe(expected);
    });
  });

  describe('round-trip consistency', () => {
    it('preserves the date through format -> parse cycle', () => {
      const original = new Date(2025, 0, 20, 12, 0, 0);
      const formatted = formatDateForInput(original);
      const parsed = parseDateFromInput(formatted);

      expect(parsed.getFullYear()).toBe(original.getFullYear());
      expect(parsed.getMonth()).toBe(original.getMonth());
      expect(parsed.getDate()).toBe(original.getDate());
    });

    it('preserves the date string through parse -> format cycle', () => {
      const original = '2025-06-15';
      const parsed = parseDateFromInput(original);
      const formatted = formatDateForInput(parsed);

      expect(formatted).toBe(original);
    });
  });

  describe('parseRelativeDate', () => {
    const fixedNow = new Date(2025, 0, 20, 12, 0, 0); // Jan 20, 2025 at noon (Monday)

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(fixedNow);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns null for non-relative date strings', () => {
      expect(parseRelativeDate('met for coffee')).toBeNull();
      expect(parseRelativeDate('had lunch with Sarah')).toBeNull();
      expect(parseRelativeDate('')).toBeNull();
    });

    it('parses "today"', () => {
      const result = parseRelativeDate('I saw them today');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(20);
      expect(result!.getMonth()).toBe(0);
    });

    it('parses "yesterday"', () => {
      const result = parseRelativeDate('Met them yesterday');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(19);
      expect(result!.getMonth()).toBe(0);
    });

    it('parses "last week"', () => {
      const result = parseRelativeDate('Called them last week');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(13);
      expect(result!.getMonth()).toBe(0);
    });

    it('parses "2 days ago"', () => {
      const result = parseRelativeDate('Texted 2 days ago');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(18);
    });

    it('parses "3 weeks ago"', () => {
      const result = parseRelativeDate('Had coffee 3 weeks ago');
      expect(result).not.toBeNull();
      // 3 weeks = 21 days before Jan 20 = Dec 30
      expect(result!.getDate()).toBe(30);
      expect(result!.getMonth()).toBe(11); // December
    });

    it('parses "a week ago"', () => {
      const result = parseRelativeDate('Saw them a week ago');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(13);
    });

    it('parses "a few days ago" as 3 days', () => {
      const result = parseRelativeDate('Texted a few days ago');
      expect(result).not.toBeNull();
      expect(result!.getDate()).toBe(17);
    });

    it('is case insensitive', () => {
      expect(parseRelativeDate('YESTERDAY')).not.toBeNull();
      expect(parseRelativeDate('Yesterday')).not.toBeNull();
      expect(parseRelativeDate('LAST WEEK')).not.toBeNull();
    });

    it('parses "last month"', () => {
      const result = parseRelativeDate('Met them last month');
      expect(result).not.toBeNull();
      expect(result!.getMonth()).toBe(11); // December
    });
  });
});
