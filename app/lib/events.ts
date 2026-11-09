import type { Event } from '@prisma/client';
import type { z } from 'zod';
import type { RoomData } from '@/types/room';
import { assertOpen, findParticipant, withEventLock } from './concurrency';
import { isDateInServerWindow } from './dates';
import { DomainError, errors } from './errors';
import type { Actor } from './identity';
import { hashPasscode, isUnlockTokenValid } from './passcode';
import { prisma } from './prisma';
import { isCoarseSlot, isHourRange, type SlotConfig } from './slots';
import { GUEST_EXPIRY_DAYS, type CreateEventInput, type finalizeSchema } from './validation';

const DAY_MS = 86_400_000;

export const slotConfigOf = (e: Pick<Event, 'slotMode' | 'hourStart' | 'hourEnd'>): SlotConfig => ({
  slotMode: e.slotMode as SlotConfig['slotMode'],
  hourStart: e.hourStart,
  hourEnd: e.hourEnd,
});

/**
 * Create the event and the host's own participant row in one transaction, so the host occupies
 * slot 1 immediately without any second form submission.
 */
export async function createEvent(input: CreateEventInput, actor: Actor, now = new Date()): Promise<{ id: string }> {
  if (!actor.token) throw errors.validation({ token: 'required' });
  if (!actor.userId && !(GUEST_EXPIRY_DAYS as readonly number[]).includes(input.expiryDays)) {
    throw errors.validation({ expiryDays: 'member_only_expiry' });
  }
  const token = actor.token;
  const event = await prisma.event.create({
    data: {
      title: input.title,
      hostNickname: input.hostNickname,
      hostUserId: actor.userId,
      passcode: input.passcode ? hashPasscode(input.passcode) : null,
      maxParticipants: input.maxParticipants,
      slotMode: input.slotMode,
      hourStart: input.slotMode === 'HOURLY' ? input.hourStart : 9,
      hourEnd: input.slotMode === 'HOURLY' ? input.hourEnd : 22,
      expiresAt: new Date(now.getTime() + input.expiryDays * DAY_MS),
      locations: {
        create: input.locations.map((l, i) => ({ name: l.name, mapUrl: l.mapUrl ?? null, notes: l.notes ?? null, sort: i })),
      },
      participants: {
        create: { token, userId: actor.userId, nickname: input.hostNickname, isHost: true },
      },
    },
    select: { id: true },
  });
  return event;
}

export async function getRoom(eventId: string, actor: Actor, unlockCookie: string | undefined, now = new Date()): Promise<RoomData> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      locations: { orderBy: { sort: 'asc' } },
      participants: { orderBy: { joinedAt: 'asc' }, include: { user: { select: { image: true } } } },
      availabilities: true,
    },
  });
  if (!event) throw errors.notFound();
  if (event.expiresAt.getTime() <= now.getTime()) throw errors.expired({ title: event.title });

  const me = await findParticipant(prisma, eventId, actor);
  const canManage = !!actor.userId && event.hostUserId === actor.userId;

  if (event.passcode && !canManage && !me && !isUnlockTokenValid(eventId, event.passcode, unlockCookie)) {
    throw new DomainError('PASSCODE_REQUIRED', 401, {
      title: event.title,
      hostNickname: event.hostNickname,
      participantCount: event.participants.length,
      maxParticipants: event.maxParticipants,
    });
  }

  const votes = await prisma.locationVote.findMany({
    where: { participant: { eventId } },
    select: { participantId: true, locationOptionId: true },
  });

  const finalLocation = event.finalLocation
    ? event.locations.find((l) => l.name === event.finalLocation) ?? null
    : null;

  return {
    id: event.id,
    title: event.title,
    hostNickname: event.hostNickname,
    slotMode: event.slotMode as RoomData['slotMode'],
    hourStart: event.hourStart,
    hourEnd: event.hourEnd,
    maxParticipants: event.maxParticipants,
    participantCount: event.participants.length,
    expiresAt: event.expiresAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
    isFinalized: event.isFinalized,
    hasPasscode: !!event.passcode,
    final:
      event.isFinalized && event.finalDate && event.finalSlot
        ? {
            date: event.finalDate,
            slot: event.finalSlot,
            location: event.finalLocation
              ? {
                  name: event.finalLocation,
                  mapUrl: finalLocation?.mapUrl ?? null,
                  notes: finalLocation?.notes ?? null,
                }
              : null,
          }
        : null,
    participants: event.participants.map((p) => ({
      id: p.id,
      nickname: p.nickname,
      isHost: p.isHost,
      image: p.user?.image ?? null,
    })),
    availabilities: event.availabilities.map((a) => ({ participantId: a.participantId, date: a.date, slot: a.slot })),
    locations: event.locations.map((l) => ({ id: l.id, name: l.name, mapUrl: l.mapUrl, notes: l.notes })),
    locationVotes: votes,
    meId: me?.id ?? null,
    isMember: !!actor.userId,
    canManage,
  };
}

/** Lightweight data for Open Graph tags / social cards (no participant details). */
export async function getEventMeta(eventId: string) {
  const e = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      title: true,
      hostNickname: true,
      maxParticipants: true,
      expiresAt: true,
      isFinalized: true,
      _count: { select: { participants: true } },
    },
  });
  if (!e) return null;
  return {
    title: e.title,
    hostNickname: e.hostNickname,
    count: e._count.participants,
    max: e.maxParticipants,
    expired: e.expiresAt.getTime() <= Date.now(),
    isFinalized: e.isFinalized,
  };
}

/** Guard for write/export endpoints on passcode-protected rooms (host, existing participants or unlocked cookie). */
export async function assertAccess(eventId: string, actor: Actor, unlockCookie: string | undefined) {
  const e = await prisma.event.findUnique({ where: { id: eventId }, select: { passcode: true, hostUserId: true } });
  if (!e) throw errors.notFound();
  if (!e.passcode) return;
  if (actor.userId && e.hostUserId === actor.userId) return;
  if (isUnlockTokenValid(eventId, e.passcode, unlockCookie)) return;
  if (await findParticipant(prisma, eventId, actor)) return;
  throw new DomainError('PASSCODE_REQUIRED', 401);
}

function requireHost(event: Event, actor: Actor) {
  if (!actor.userId) throw errors.unauthenticated();
  if (event.hostUserId !== actor.userId) throw errors.forbidden();
}

/**
 * Host removes a participant: their votes cascade away, the live headcount drops by one (the
 * seat is free again for the next joiner) and every client recomputes Top 3 from the new data.
 */
export async function kickParticipant(eventId: string, actor: Actor, participantId: string) {
  return withEventLock(eventId, async (tx, event) => {
    requireHost(event, actor);
    assertOpen(event);
    const target = await tx.participant.findFirst({ where: { id: participantId, eventId } });
    if (!target) throw errors.notFound();
    if (target.isHost || (target.userId && target.userId === event.hostUserId)) {
      throw new DomainError('CANNOT_KICK_HOST', 403);
    }
    await tx.participant.delete({ where: { id: target.id } });
    const count = await tx.participant.count({ where: { eventId } });
    return { count, max: event.maxParticipants };
  });
}

export async function finalizeEvent(eventId: string, actor: Actor, input: z.infer<typeof finalizeSchema>) {
  return withEventLock(eventId, async (tx, event) => {
    requireHost(event, actor);
    assertOpen(event);
    const config = slotConfigOf(event);
    const slotOk =
      config.slotMode === 'COARSE'
        ? isCoarseSlot(input.slot)
        : isHourRange(input.slot) &&
          Number(input.slot.slice(0, 2)) >= config.hourStart &&
          Number(input.slot.slice(6, 8)) <= config.hourEnd;
    if (!slotOk) throw errors.validation({ slot: 'invalid_slot' });
    if (!isDateInServerWindow(input.date)) throw errors.validation({ date: 'invalid_date' });

    let location: string | null = null;
    if (event.locations.length === 1) location = event.locations[0].name;
    else if (input.locationOptionId) {
      const l = event.locations.find((x) => x.id === input.locationOptionId);
      if (!l) throw errors.validation({ locationOptionId: 'invalid_location' });
      location = l.name;
    }

    await tx.event.update({
      where: { id: eventId },
      data: { isFinalized: true, finalDate: input.date, finalSlot: input.slot, finalLocation: location, finalizedAt: new Date() },
    });
    return { ok: true };
  });
}

export interface MyEventSummary {
  id: string;
  title: string;
  hostNickname: string;
  expiresAt: string;
  expired: boolean;
  isFinalized: boolean;
  count: number;
  max: number;
}

const summarize = (e: {
  id: string;
  title: string;
  hostNickname: string;
  expiresAt: Date;
  isFinalized: boolean;
  maxParticipants: number;
  _count: { participants: number };
}): MyEventSummary => ({
  id: e.id,
  title: e.title,
  hostNickname: e.hostNickname,
  expiresAt: e.expiresAt.toISOString(),
  expired: e.expiresAt.getTime() <= Date.now(),
  isFinalized: e.isFinalized,
  count: e._count.participants,
  max: e.maxParticipants,
});

const summarySelect = {
  id: true,
  title: true,
  hostNickname: true,
  expiresAt: true,
  isFinalized: true,
  maxParticipants: true,
  _count: { select: { participants: true } },
} as const;

export async function listMyEvents(userId: string): Promise<{ hosted: MyEventSummary[]; joined: MyEventSummary[] }> {
  const [hosted, joined] = await Promise.all([
    prisma.event.findMany({ where: { hostUserId: userId }, orderBy: { createdAt: 'desc' }, take: 100, select: summarySelect }),
    prisma.event.findMany({
      where: { participants: { some: { userId } }, NOT: { hostUserId: userId } },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: summarySelect,
    }),
  ]);
  return { hosted: hosted.map(summarize), joined: joined.map(summarize) };
}
