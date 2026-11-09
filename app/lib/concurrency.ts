import type { Event, LocationOption, Participant, Prisma } from '@prisma/client';
import { addDaysStr, isDateInServerWindow, toUtcDateStr } from './dates';
import { errors } from './errors';
import type { Actor } from './identity';
import { prisma } from './prisma';
import { isValidSlot, type SlotConfig } from './slots';
import type { SubmitInput } from './validation';

export type Tx = Prisma.TransactionClient;

/**
 * Run `fn` inside a transaction that holds a row lock on the event (`SELECT … FOR UPDATE`).
 *
 * Every write that depends on the participant count (join, kick, finalize) goes through this, so
 * they are serialized per event: two people racing for the last seat are processed one after the
 * other and the second one sees count == max. Other events are unaffected.
 */
export async function withEventLock<T>(
  eventId: string,
  fn: (tx: Tx, event: Event & { locations: LocationOption[] }) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(
    async (tx) => {
      const locked = await tx.$queryRaw<{ id: string }[]>`SELECT "id" FROM "Event" WHERE "id" = ${eventId} FOR UPDATE`;
      if (locked.length === 0) throw errors.notFound();
      const event = await tx.event.findUniqueOrThrow({ where: { id: eventId }, include: { locations: true } });
      return fn(tx, event);
    },
    { maxWait: 5_000, timeout: 10_000 },
  );
}

export function assertOpen(event: Event, now = new Date()) {
  if (event.expiresAt.getTime() <= now.getTime()) throw errors.expired({ title: event.title });
  if (event.isFinalized) throw errors.finalized();
}

/** A participant is the same person if they match by account (any device) or by device token. */
export async function findParticipant(tx: Tx, eventId: string, actor: Actor): Promise<Participant | null> {
  if (actor.userId) {
    const byUser = await tx.participant.findFirst({ where: { eventId, userId: actor.userId } });
    if (byUser) return byUser;
  }
  if (actor.token) {
    return tx.participant.findUnique({ where: { eventId_token: { eventId, token: actor.token } } });
  }
  return null;
}

export interface SubmitResult {
  participantId: string;
  created: boolean;
  count: number;
  max: number;
}

/**
 * Atomic join / edit.
 *  1. event must exist, be unexpired and not finalized
 *  2. token (or account) already a participant? → edit in place, count unchanged
 *  3. otherwise require count < maxParticipants
 *  4. full → HTTP 409 "Event is already full (n/max)", nothing is written
 *  5. insert the participant and their votes, still under the same lock
 */
export async function submitResponse(eventId: string, actor: Actor, input: SubmitInput, now = new Date()): Promise<SubmitResult> {
  if (!actor.token) throw errors.validation({ token: 'required' });
  const token = actor.token;

  return withEventLock(eventId, async (tx, event) => {
    assertOpen(event, now);
    validatePayload(event, event.locations, input, now);

    let participant = await findParticipant(tx, eventId, { ...actor, token });
    let created = false;

    if (participant) {
      participant = await tx.participant.update({
        where: { id: participant.id },
        data: { nickname: input.nickname, ...(actor.userId && !participant.userId ? { userId: actor.userId } : {}) },
      });
    } else {
      const count = await tx.participant.count({ where: { eventId } });
      if (count >= event.maxParticipants) throw errors.full(count, event.maxParticipants);
      participant = await tx.participant.create({
        data: { eventId, token, nickname: input.nickname, userId: actor.userId },
      });
      created = true;
    }

    // Replace this participant's votes wholesale (idempotent for repeated submits).
    await tx.availability.deleteMany({ where: { participantId: participant.id } });
    const unique = new Map(input.availabilities.map((a) => [`${a.date}|${a.slot}`, a]));
    if (unique.size > 0) {
      await tx.availability.createMany({
        data: [...unique.values()].map((a) => ({ eventId, participantId: participant!.id, date: a.date, slot: a.slot })),
      });
    }

    await tx.locationVote.deleteMany({ where: { participantId: participant.id } });
    if (input.locationOptionId) {
      await tx.locationVote.create({ data: { participantId: participant.id, locationOptionId: input.locationOptionId } });
    }

    const count = await tx.participant.count({ where: { eventId } });
    return { participantId: participant.id, created, count, max: event.maxParticipants };
  });
}

function validatePayload(event: Event, locations: LocationOption[], input: SubmitInput, now: Date) {
  const config: SlotConfig = { slotMode: event.slotMode as SlotConfig['slotMode'], hourStart: event.hourStart, hourEnd: event.hourEnd };
  const earliest = addDaysStr(toUtcDateStr(now), -1);
  // Dates that have since slipped into the past are dropped silently so editing an old response never fails.
  input.availabilities = input.availabilities.filter((a) => a.date >= earliest);
  for (const a of input.availabilities) {
    if (!isDateInServerWindow(a.date, now)) throw errors.validation({ availabilities: 'invalid_date' });
    if (!isValidSlot(config, a.slot)) throw errors.validation({ availabilities: 'invalid_slot' });
  }
  if (input.locationOptionId && !locations.some((l) => l.id === input.locationOptionId)) {
    throw errors.validation({ locationOptionId: 'invalid_location' });
  }
  // With 0 or 1 candidate there is nothing to vote on.
  if (input.locationOptionId && locations.length < 2) {
    throw errors.validation({ locationOptionId: 'invalid_location' });
  }
}
