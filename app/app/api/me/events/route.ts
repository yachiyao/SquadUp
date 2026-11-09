import { NextResponse } from 'next/server';
import { errors } from '@/lib/errors';
import { listMyEvents } from '@/lib/events';
import { getActor, handle } from '@/lib/identity';

export const dynamic = 'force-dynamic';

export const GET = handle(async (req: Request) => {
  const actor = await getActor(req);
  if (!actor.userId) throw errors.unauthenticated();
  return NextResponse.json(await listMyEvents(actor.userId), { headers: { 'Cache-Control': 'no-store' } });
});
