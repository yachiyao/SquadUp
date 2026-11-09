import { cookies } from 'next/headers';
import { buildIcs, icsFilename } from '@/lib/calendarExport';
import { errors } from '@/lib/errors';
import { assertAccess } from '@/lib/events';
import { getActor, handle } from '@/lib/identity';
import { unlockCookieName } from '@/lib/passcode';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** `.ics` download for a finalized gathering. */
export const GET = handle(async (req: Request, { params }: { params: { id: string } }) => {
  const actor = await getActor(req);
  await assertAccess(params.id, actor, cookies().get(unlockCookieName(params.id))?.value);

  const event = await prisma.event.findUnique({ where: { id: params.id }, include: { locations: true } });
  if (!event) throw errors.notFound();
  if (!event.isFinalized || !event.finalDate || !event.finalSlot) throw errors.validation({ event: 'not_finalized' });

  const loc = event.finalLocation ? event.locations.find((l) => l.name === event.finalLocation) : undefined;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
  const ics = buildIcs({
    uid: event.id,
    title: event.title,
    date: event.finalDate,
    slot: event.finalSlot,
    location: event.finalLocation,
    mapUrl: loc?.mapUrl,
    description: loc?.notes ?? undefined,
    url: `${origin}/g/${event.id}`,
  });

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="squad-up.ics"; filename*=UTF-8''${encodeURIComponent(icsFilename(event.title))}`,
      'Cache-Control': 'no-store',
    },
  });
});
