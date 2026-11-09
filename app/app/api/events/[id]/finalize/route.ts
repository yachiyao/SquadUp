import { NextResponse } from 'next/server';
import { finalizeEvent } from '@/lib/events';
import { getActor, handle, readJson } from '@/lib/identity';
import { finalizeSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

export const POST = handle(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = await getActor(req);
  const input = finalizeSchema.parse(await readJson(req));
  return NextResponse.json(await finalizeEvent(params.id, actor, input));
});
