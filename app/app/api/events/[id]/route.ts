import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getActor, handle } from '@/lib/identity';
import { getRoom } from '@/lib/events';
import { unlockCookieName } from '@/lib/passcode';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export const GET = handle(async (req: Request, { params }: Ctx) => {
  const actor = await getActor(req);
  const room = await getRoom(params.id, actor, cookies().get(unlockCookieName(params.id))?.value);
  return NextResponse.json(room, { headers: { 'Cache-Control': 'no-store' } });
});
