/** Calendar-date helpers. Dates are floating "YYYY-MM-DD" strings (no timezone). */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const pad = (n: number) => String(n).padStart(2, '0');

export function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function toUtcDateStr(d: Date): string {
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function isValidDateStr(s: string): boolean {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function parseDateStr(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDaysStr(s: string, days: number): string {
  const [y, m, d] = s.split('-').map(Number);
  return toUtcDateStr(new Date(Date.UTC(y, m - 1, d + days)));
}

/** The calendar shows [today, today + 2 months). */
export const CALENDAR_MONTHS = 2;

/** Inclusive last selectable date for a viewer whose local "today" is `today`. */
export function calendarEnd(today: Date): Date {
  const end = new Date(today.getFullYear(), today.getMonth() + CALENDAR_MONTHS, today.getDate());
  end.setDate(end.getDate() - 1);
  return end;
}

/**
 * Server-side sanity window. Viewers live in different timezones, so accept anything
 * between yesterday (UTC) and ~2 months + 1 day ahead rather than a strict local window.
 */
export function isDateInServerWindow(date: string, now = new Date()): boolean {
  if (!isValidDateStr(date)) return false;
  const today = toUtcDateStr(now);
  return date >= addDaysStr(today, -1) && date <= addDaysStr(today, 63);
}

export function formatDuration(msLeft: number): { days: number; hours: number; minutes: number } {
  const total = Math.max(0, Math.floor(msLeft / 60000));
  return { days: Math.floor(total / 1440), hours: Math.floor((total % 1440) / 60), minutes: total % 60 };
}
