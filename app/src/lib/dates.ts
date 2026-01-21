/**
 * @file Date Utilities
 * @description Helper functions for date parsing and formatting.
 * Handles timezone issues when working with HTML date inputs.
 */

/**
 * Parse a date string from input[type="date"] as local date.
 * Sets time to noon to avoid DST boundary issues.
 *
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object set to noon local time
 */
export function parseDateFromInput(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Format a Date for use in input[type="date"].
 * Uses local date parts to avoid timezone shift issues.
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateForInput(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse relative date expressions from natural language text.
 * Returns null if no relative date is found.
 *
 * Supported patterns:
 * - "today"
 * - "yesterday"
 * - "last week" / "a week ago"
 * - "last month"
 * - "X days ago" / "X weeks ago"
 * - "a few days ago" (treated as 3 days)
 *
 * @param text - Natural language text that may contain a relative date
 * @returns Date object set to noon local time, or null if no date found
 */
export function parseRelativeDate(text: string): Date | null {
  if (!text) return null;

  const lowerText = text.toLowerCase();
  const now = new Date();
  now.setHours(12, 0, 0, 0);

  // "today"
  if (/\btoday\b/.test(lowerText)) {
    return now;
  }

  // "yesterday"
  if (/\byesterday\b/.test(lowerText)) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return date;
  }

  // "last week" or "a week ago"
  if (/\b(last\s+week|a\s+week\s+ago)\b/.test(lowerText)) {
    const date = new Date(now);
    date.setDate(date.getDate() - 7);
    return date;
  }

  // "last month"
  if (/\blast\s+month\b/.test(lowerText)) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - 1);
    return date;
  }

  // "a few days ago" - treat as 3 days
  if (/\ba\s+few\s+days\s+ago\b/.test(lowerText)) {
    const date = new Date(now);
    date.setDate(date.getDate() - 3);
    return date;
  }

  // "X days ago"
  const daysAgoMatch = lowerText.match(/\b(\d+)\s+days?\s+ago\b/);
  if (daysAgoMatch) {
    const days = parseInt(daysAgoMatch[1], 10);
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  }

  // "X weeks ago"
  const weeksAgoMatch = lowerText.match(/\b(\d+)\s+weeks?\s+ago\b/);
  if (weeksAgoMatch) {
    const weeks = parseInt(weeksAgoMatch[1], 10);
    const date = new Date(now);
    date.setDate(date.getDate() - weeks * 7);
    return date;
  }

  return null;
}
