import { COARSE_SLOTS, hourlySlots, slotOrder, type SlotConfig } from './slots';

export interface VoteRow {
  participantId: string;
  date: string;
  slot: string;
}

export interface SlotScore {
  date: string;
  slot: string;
  count: number;
  participantIds: string[];
}

type Index = Map<string, Map<string, Set<string>>>; // date -> slot -> participantIds

export function buildIndex(votes: VoteRow[]): Index {
  const idx: Index = new Map();
  for (const v of votes) {
    let bySlot = idx.get(v.date);
    if (!bySlot) idx.set(v.date, (bySlot = new Map()));
    let set = bySlot.get(v.slot);
    if (!set) bySlot.set(v.slot, (set = new Set()));
    set.add(v.participantId);
  }
  return idx;
}

const PERIODS = COARSE_SLOTS.filter((s) => s !== 'ALL_DAY');

/**
 * Who can actually make `slot` on `date`.
 * For coarse events an ALL_DAY vote means "free the whole day", so it counts toward every period.
 */
function attendeesAt(bySlot: Map<string, Set<string>> | undefined, slot: string, config: SlotConfig): Set<string> {
  const out = new Set<string>(bySlot?.get(slot) ?? []);
  if (config.slotMode === 'COARSE' && slot !== 'ALL_DAY') {
    for (const id of bySlot?.get('ALL_DAY') ?? []) out.add(id);
  }
  return out;
}

/** Best-slot overlap for each date; drives the heatmap shading. */
export function dateOverlaps(
  votes: VoteRow[],
  config: SlotConfig,
): { map: Map<string, { count: number; participantIds: string[] }>; max: number } {
  const idx = buildIndex(votes);
  const map = new Map<string, { count: number; participantIds: string[] }>();
  let max = 0;
  const slots = config.slotMode === 'COARSE' ? PERIODS : hourlySlots(config.hourStart, config.hourEnd);
  for (const [date, bySlot] of idx) {
    let best: Set<string> = new Set();
    for (const slot of slots) {
      const a = attendeesAt(bySlot, slot, config);
      if (a.size > best.size) best = a;
    }
    // ALL_DAY alone already feeds PERIODS; this covers any stray slots gracefully.
    if (best.size === 0) continue;
    map.set(date, { count: best.size, participantIds: [...best] });
    max = Math.max(max, best.size);
  }
  return { map, max };
}

/** Participants available on `date` for one specific slot (what the bottom sheet shows). */
export function slotAttendees(votes: VoteRow[], date: string, slot: string, config: SlotConfig): string[] {
  const bySlot = buildIndex(votes.filter((v) => v.date === date)).get(date);
  return [...attendeesAt(bySlot, slot, config)];
}

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

/** Number of distinct participants who have submitted at least one availability. */
export function voterCount(votes: VoteRow[]): number {
  return new Set(votes.map((v) => v.participantId)).size;
}

/**
 * Ranked best time slots, most overlap first.
 *  - coarse: ALL_DAY + periods; ties prefer the more inclusive ALL_DAY, and a slot whose
 *    attendee list is identical to one already picked for that date is skipped.
 *  - hourly: adjacent hours with identical attendees are merged ("18:00-21:00"); ties prefer longer runs.
 */
export function rankSlots(votes: VoteRow[], config: SlotConfig, limit = 3, minCount = 2): SlotScore[] {
  const idx = buildIndex(votes);
  const candidates: (SlotScore & { span: number })[] = [];

  for (const [date, bySlot] of idx) {
    if (config.slotMode === 'COARSE') {
      for (const slot of COARSE_SLOTS) {
        const a = [...attendeesAt(bySlot, slot, config)];
        if (a.length >= minCount) candidates.push({ date, slot, count: a.length, participantIds: a, span: 1 });
      }
    } else {
      const hours = hourlySlots(config.hourStart, config.hourEnd);
      let run: { start: number; end: number; ids: string[] } | null = null;
      const flush = () => {
        if (run && run.ids.length >= minCount) {
          const p = (n: number) => `${String(n).padStart(2, '0')}:00`;
          candidates.push({
            date,
            slot: `${p(run.start)}-${p(run.end)}`,
            count: run.ids.length,
            participantIds: run.ids,
            span: run.end - run.start,
          });
        }
        run = null;
      };
      hours.forEach((slot, i) => {
        const h = config.hourStart + i;
        const ids = [...(bySlot.get(slot) ?? [])];
        if (ids.length === 0) return flush();
        if (run && run.end === h && sameSet(run.ids, ids)) run.end = h + 1;
        else {
          flush();
          run = { start: h, end: h + 1, ids };
        }
      });
      flush();
    }
  }

  candidates.sort(
    (a, b) =>
      b.count - a.count ||
      b.span - a.span ||
      a.date.localeCompare(b.date) ||
      slotOrder(a.slot) - slotOrder(b.slot),
  );

  const picked: SlotScore[] = [];
  for (const c of candidates) {
    if (picked.length >= limit) break;
    if (config.slotMode === 'COARSE' && picked.some((p) => p.date === c.date && sameSet(p.participantIds, c.participantIds))) {
      continue;
    }
    picked.push({ date: c.date, slot: c.slot, count: c.count, participantIds: c.participantIds });
  }
  return picked;
}
