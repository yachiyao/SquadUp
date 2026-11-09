import { COARSE_SLOTS, hourlySlots, type SlotConfig } from './slots';

/** A participant's pending selection is a Set of "YYYY-MM-DD|SLOT" keys. */
export const slotKey = (date: string, slot: string) => `${date}|${slot}`;
export const parseKey = (key: string): { date: string; slot: string } => {
  const i = key.indexOf('|');
  return { date: key.slice(0, i), slot: key.slice(i + 1) };
};

const PERIODS = COARSE_SLOTS.filter((s) => s !== 'ALL_DAY');

/** Is `slot` on `date` part of the selection (ALL_DAY covers every coarse period)? */
export function isSelected(sel: Set<string>, date: string, slot: string, config: SlotConfig): boolean {
  if (sel.has(slotKey(date, slot))) return true;
  return config.slotMode === 'COARSE' && slot !== 'ALL_DAY' && sel.has(slotKey(date, 'ALL_DAY'));
}

/**
 * Toggle one slot, returning a new Set.
 * Coarse rules keep the selection canonical:
 *  - turning ALL_DAY on replaces the day's periods; turning it off clears the day
 *  - unticking a period while ALL_DAY is on leaves the other two periods
 *  - ticking all three periods collapses to ALL_DAY
 */
export function toggleSlot(sel: Set<string>, date: string, slot: string, config: SlotConfig): Set<string> {
  const next = new Set(sel);
  if (config.slotMode === 'HOURLY') {
    const k = slotKey(date, slot);
    next.has(k) ? next.delete(k) : next.add(k);
    return next;
  }

  const allDay = slotKey(date, 'ALL_DAY');
  if (slot === 'ALL_DAY') {
    if (next.has(allDay)) next.delete(allDay);
    else {
      PERIODS.forEach((p) => next.delete(slotKey(date, p)));
      next.add(allDay);
    }
    return next;
  }

  if (next.has(allDay)) {
    next.delete(allDay);
    PERIODS.filter((p) => p !== slot).forEach((p) => next.add(slotKey(date, p)));
    return next;
  }
  const k = slotKey(date, slot);
  next.has(k) ? next.delete(k) : next.add(k);
  if (PERIODS.every((p) => next.has(slotKey(date, p)))) {
    PERIODS.forEach((p) => next.delete(slotKey(date, p)));
    next.add(allDay);
  }
  return next;
}

/** Select (or clear) everything on a date: ALL_DAY for coarse events, every hour for hourly ones. */
export function setWholeDay(sel: Set<string>, date: string, on: boolean, config: SlotConfig): Set<string> {
  const next = new Set(sel);
  const slots = config.slotMode === 'COARSE' ? [...COARSE_SLOTS] : hourlySlots(config.hourStart, config.hourEnd);
  slots.forEach((s) => next.delete(slotKey(date, s)));
  if (on) {
    if (config.slotMode === 'COARSE') next.add(slotKey(date, 'ALL_DAY'));
    else slots.forEach((s) => next.add(slotKey(date, s)));
  }
  return next;
}

export function sameSets(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const x of a) if (!b.has(x)) return false;
  return true;
}

export function datesWithSelection(sel: Set<string>): Set<string> {
  return new Set([...sel].map((k) => parseKey(k).date));
}
