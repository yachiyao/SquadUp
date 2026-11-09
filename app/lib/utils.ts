import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Base URL for share links / OG (falls back to the current origin in the browser). */
export function appOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

/** Share links are locale-neutral (`/g/[id]`): the recipient's own language is auto-detected. */
export function eventUrl(id: string, origin = appOrigin()): string {
  return `${origin.replace(/\/$/, '')}/g/${id}`;
}

/** Accepts a bare code, `/g/<id>` or a full URL (with or without a locale prefix) and returns the id. */
export function extractEventId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  const m = /\/g\/([A-Za-z0-9_-]+)/.exec(s);
  const id = m ? m[1] : s;
  return /^[A-Za-z0-9_-]{6,64}$/.test(id) ? id : null;
}
