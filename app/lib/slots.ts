/**
 * Slot model shared by server + client.
 *
 * COARSE events use the four fixed slots; HOURLY events expose one slot per hour
 * between `hourStart` (inclusive) and `hourEnd` (exclusive) formatted "HH:mm-HH:mm".
 * Ranges produced by the leaderboard (e.g. "18:00-21:00") use the same format.
 */
export const COARSE_SLOTS = ['ALL_DAY', 'MORNING', 'AFTERNOON', 'EVENING'] as const;
export type CoarseSlot = (typeof COARSE_SLOTS)[number];
export type SlotMode = 'COARSE' | 'HOURLY';

export interface SlotConfig {
  slotMode: SlotMode;
  hourStart: number;
  hourEnd: number;
}

/** Representative wall-clock windows used when a coarse slot is finalized (.ics / Google Calendar). */
export const COARSE_RANGES: Record<Exclude<CoarseSlot, 'ALL_DAY'>, [string, string]> = {
  MORNING: ['09:00', '12:00'],
  AFTERNOON: ['13:00', '17:00'],
  EVENING: ['18:00', '21:00'],
};

const pad = (n: number) => String(n).padStart(2, '0');
export const hourLabel = (h: number) => `${pad(h)}:00`;

export function hourlySlots(hourStart: number, hourEnd: number): string[] {
  const out: string[] = [];
  for (let h = hourStart; h < hourEnd; h++) out.push(`${hourLabel(h)}-${hourLabel(h + 1)}`);
  return out;
}

export function slotsFor(config: SlotConfig): string[] {
  return config.slotMode === 'HOURLY'
    ? hourlySlots(config.hourStart, config.hourEnd)
    : [...COARSE_SLOTS];
}

export function isCoarseSlot(slot: string): slot is CoarseSlot {
  return (COARSE_SLOTS as readonly string[]).includes(slot);
}

const RANGE_RE = /^([01]\d|2[0-3]):00-(0[1-9]|1\d|2[0-4]):00$/;

export function isHourRange(slot: string): boolean {
  const m = RANGE_RE.exec(slot);
  return !!m && Number(m[2]) > Number(m[1]);
}

export function isValidSlot(config: SlotConfig, slot: string): boolean {
  if (config.slotMode === 'COARSE') return isCoarseSlot(slot);
  const m = RANGE_RE.exec(slot);
  if (!m) return false;
  const [s, e] = [Number(m[1]), Number(m[2])];
  // Individual votes are exactly one hour inside the configured window.
  return e === s + 1 && s >= config.hourStart && e <= config.hourEnd;
}

/** "HH:mm" pair for a slot, or null for ALL_DAY. End may be "24:00". */
export function slotRange(slot: string): { start: string; end: string } | null {
  if (slot === 'ALL_DAY') return null;
  if (slot in COARSE_RANGES) {
    const [start, end] = COARSE_RANGES[slot as keyof typeof COARSE_RANGES];
    return { start, end };
  }
  const m = RANGE_RE.exec(slot);
  if (m) return { start: `${m[1]}:00`, end: `${m[2]}:00` };
  return null;
}

export function slotOrder(slot: string): number {
  const i = (COARSE_SLOTS as readonly string[]).indexOf(slot);
  return i >= 0 ? i : 10 + Number(slot.slice(0, 2));
}
