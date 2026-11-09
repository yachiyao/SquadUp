import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

/** Passcodes are short, so they are hashed (scrypt) and attempts are rate limited – never stored in plain text. */
export function hashPasscode(passcode: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(passcode, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPasscode(passcode: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const candidate = scryptSync(passcode, salt, 32);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

function secret(): string {
  const s = process.env.NEXTAUTH_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('NEXTAUTH_SECRET is required in production');
  return s || 'dev-only-secret';
}

/** Value of the `sq_unlock_<id>` cookie. Bound to the stored hash so changing the passcode invalidates it. */
export function unlockToken(eventId: string, storedHash: string): string {
  return createHmac('sha256', secret()).update(`${eventId}:${storedHash}`).digest('hex');
}

export function isUnlockTokenValid(eventId: string, storedHash: string, token: string | undefined): boolean {
  if (!token) return false;
  const expected = Buffer.from(unlockToken(eventId, storedHash));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

export const unlockCookieName = (eventId: string) => `sq_unlock_${eventId}`;
