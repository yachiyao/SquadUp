import { NextResponse } from 'next/server';
import { z } from 'zod';
import { errors } from '@/lib/errors';
import { getActor, handle, readJson } from '@/lib/identity';
import { prisma } from '@/lib/prisma';
import { savedSpotSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

const MAX_SPOTS = 30;

export const GET = handle(async (req: Request) => {
  const actor = await getActor(req);
  if (!actor.userId) throw errors.unauthenticated();
  const spots = await prisma.savedSpot.findMany({
    where: { userId: actor.userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, mapUrl: true, notes: true },
  });
  return NextResponse.json({ spots }, { headers: { 'Cache-Control': 'no-store' } });
});

/** Save (or update, keyed by name) a frequent meetup spot. */
export const POST = handle(async (req: Request) => {
  const actor = await getActor(req);
  if (!actor.userId) throw errors.unauthenticated();
  const input = savedSpotSchema.parse(await readJson(req));
  const existing = await prisma.savedSpot.count({ where: { userId: actor.userId } });
  const already = await prisma.savedSpot.findUnique({ where: { userId_name: { userId: actor.userId, name: input.name } } });
  if (!already && existing >= MAX_SPOTS) throw errors.validation({ name: 'too_many' });
  const spot = await prisma.savedSpot.upsert({
    where: { userId_name: { userId: actor.userId, name: input.name } },
    update: { mapUrl: input.mapUrl ?? null, notes: input.notes ?? null },
    create: { userId: actor.userId, name: input.name, mapUrl: input.mapUrl ?? null, notes: input.notes ?? null },
    select: { id: true, name: true, mapUrl: true, notes: true },
  });
  return NextResponse.json({ spot });
});

export const DELETE = handle(async (req: Request) => {
  const actor = await getActor(req);
  if (!actor.userId) throw errors.unauthenticated();
  const { id } = z.object({ id: z.string().min(1) }).parse(await readJson(req));
  await prisma.savedSpot.deleteMany({ where: { id, userId: actor.userId } });
  return NextResponse.json({ ok: true });
});
