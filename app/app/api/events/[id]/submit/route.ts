import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { submitResponse } from '@/lib/concurrency';
import { assertAccess } from '@/lib/events';
import { getActor, handle, readJson, requireToken } from '@/lib/identity';
import { unlockCookieName } from '@/lib/passcode';
import { submitSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/**
 * Join or edit a response. 409 + `{ code: "FULL", count, max }` when the room is full,
 * 410 when expired, 423 when finalized. See lib/concurrency.ts for the transaction.
 */
export const POST = handle(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = await getActor(req);
  requireToken(actor);
  const input = submitSchema.parse(await readJson(req));
  await assertAccess(params.id, actor, cookies().get(unlockCookieName(params.id))?.value);
  const result = await submitResponse(params.id, actor, input);
  return NextResponse.json(result);
});
