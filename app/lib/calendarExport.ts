import { addDaysStr } from './dates';
import { slotRange } from './slots';

/**
 * Calendar export helpers (RFC 5545 .ics + Google Calendar template link).
 *
 * Gatherings are "floating" local-time events: 18:00 means 18:00 wherever the attendee is, so
 * DTSTART/DTEND carry no TZID/Z. ALL_DAY slots become all-day (VALUE=DATE) events.
 */
export interface CalendarEventInput {
  uid: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  /** ALL_DAY | MORNING | AFTERNOON | EVENING | HH:mm-HH:mm */
  slot: string;
  location?: string | null;
  mapUrl?: string | null;
  description?: string | null;
  url?: string | null;
}

const compactDate = (d: string) => d.replace(/-/g, '');

/** Local timestamp "YYYYMMDDTHHmmss"; handles an end of "24:00" by rolling to the next day. */
function localStamp(date: string, hhmm: string): string {
  let [h, m] = hhmm.split(':').map(Number);
  let d = date;
  if (h >= 24) {
    d = addDaysStr(date, 1);
    h -= 24;
  }
  return `${compactDate(d)}T${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
}

export function eventTiming(input: Pick<CalendarEventInput, 'date' | 'slot'>) {
  const range = slotRange(input.slot);
  if (!range) {
    return { allDay: true as const, start: compactDate(input.date), end: compactDate(addDaysStr(input.date, 1)) };
  }
  return {
    allDay: false as const,
    start: localStamp(input.date, range.start),
    end: localStamp(input.date, range.end),
  };
}

export const escapeIcsText = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold to ≤75 octets per line (continuation lines start with a space). UTF-8 aware. */
export function foldLine(line: string): string {
  const enc = new TextEncoder();
  if (enc.encode(line).length <= 75) return line;
  const parts: string[] = [];
  let cur = '';
  let curBytes = 0;
  let limit = 75;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (curBytes + b > limit) {
      parts.push(cur);
      cur = '';
      curBytes = 0;
      limit = 74; // leading space counts toward the 75
    }
    cur += ch;
    curBytes += b;
  }
  parts.push(cur);
  return parts.join('\r\n ');
}

const utcStamp = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function buildIcs(input: CalendarEventInput, now = new Date()): string {
  const t = eventTiming(input);
  const descParts = [input.description, input.mapUrl ? `Map: ${input.mapUrl}` : null, input.url ? `Details: ${input.url}` : null].filter(Boolean) as string[];

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Squad Up//Gathering//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${input.uid}@squadup`,
    `DTSTAMP:${utcStamp(now)}`,
    t.allDay ? `DTSTART;VALUE=DATE:${t.start}` : `DTSTART:${t.start}`,
    t.allDay ? `DTEND;VALUE=DATE:${t.end}` : `DTEND:${t.end}`,
    `SUMMARY:${escapeIcsText(input.title)}`,
    ...(input.location ? [`LOCATION:${escapeIcsText(input.location)}`] : []),
    ...(descParts.length ? [`DESCRIPTION:${escapeIcsText(descParts.join('\n'))}`] : []),
    ...(input.url ? [`URL:${input.url}`] : []),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

export function googleCalendarUrl(input: CalendarEventInput): string {
  const t = eventTiming(input);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${t.start}/${t.end}`,
  });
  const details = [input.description, input.mapUrl ? `Map: ${input.mapUrl}` : null, input.url].filter(Boolean).join('\n');
  if (details) params.set('details', details);
  if (input.location) params.set('location', input.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsFilename(title: string): string {
  const safe = title.replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim().slice(0, 60) || 'squad-up';
  return `${safe}.ics`;
}
