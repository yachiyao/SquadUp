'use client';

/**
 * Anonymous identity for Guests: one random UUID per browser/device kept in localStorage.
 * It is sent as `x-squad-token`; the server pairs it with the event id (unique per event).
 */
const TOKEN_KEY = 'squadup.token';
const NICK_KEY = 'squadup.nickname';
const LOCALE_KEY = 'squadup.locale';
const RECENT_KEY = 'squadup.recent';

let memoryToken: string | null = null;

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Fallback for very old / insecure-context browsers.
  const b = new Uint8Array(16);
  crypto.getRandomValues(b);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* private mode / quota: degrade gracefully */
  }
}

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  const existing = safeGet(TOKEN_KEY);
  if (existing) return existing;
  memoryToken ??= uuid();
  safeSet(TOKEN_KEY, memoryToken);
  return memoryToken;
}

export const getSavedNickname = () => (typeof window === 'undefined' ? '' : safeGet(NICK_KEY) ?? '');
export const saveNickname = (n: string) => safeSet(NICK_KEY, n);

export const getSavedLocale = () => (typeof window === 'undefined' ? null : safeGet(LOCALE_KEY));
export const saveLocale = (l: string) => safeSet(LOCALE_KEY, l);

export interface RecentRoom {
  id: string;
  title: string;
  at: number;
}

export function getRecentRooms(): RecentRoom[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(safeGet(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((r) => r && typeof r.id === 'string').slice(0, 8) : [];
  } catch {
    return [];
  }
}

export function rememberRoom(room: { id: string; title: string }) {
  const rest = getRecentRooms().filter((r) => r.id !== room.id);
  safeSet(RECENT_KEY, JSON.stringify([{ ...room, at: Date.now() }, ...rest].slice(0, 8)));
}

export function forgetRoom(id: string) {
  safeSet(RECENT_KEY, JSON.stringify(getRecentRooms().filter((r) => r.id !== id)));
}
