import { NextResponse } from 'next/server';
import { z } from 'zod';
import { kickParticipant } from '@/lib/events';
import { getActor, handle, readJson } from '@/lib/identity';

export const dynamic = 'force-dynamic';

const bodySchema = z.object({ participantId: z.string().min(1) });

export const POST = handle(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = await getActor(req);
  const { participantId } = bodySchema.parse(await readJson(req));
  return NextResponse.json(await kickParticipant(params.id, actor, participantId));
});
