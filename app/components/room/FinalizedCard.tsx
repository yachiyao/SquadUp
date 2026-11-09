'use client';

import { CalendarPlus, Download, ExternalLink, PartyPopper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { googleCalendarUrl } from '@/lib/calendarExport';
import { useFormatters } from '@/lib/useFormatters';
import { cn, eventUrl } from '@/lib/utils';
import type { RoomData } from '@/types/room';
import { mapsHref } from './LocationVoting';

/** Confirmed date / time / place with calendar export (Google Calendar link + .ics download). */
export function FinalizedCard({ room }: { room: RoomData }) {
  const t = useTranslations('final');
  const f = useFormatters();
  const fin = room.final;
  if (!fin) return null;

  const calendarInput = {
    uid: room.id,
    title: room.title,
    date: fin.date,
    slot: fin.slot,
    location: fin.location?.name,
    mapUrl: fin.location?.mapUrl,
    description: fin.location?.notes,
    url: eventUrl(room.id),
  };

  return (
    <Card className="border-2 border-brand-200 bg-gradient-to-b from-brand-50 to-white">
      <div className="mb-3 flex items-center gap-2 text-brand-700">
        <PartyPopper className="h-5 w-5" aria-hidden />
        <h2 className="text-lg font-extrabold">{t('title')}</h2>
      </div>
      <dl className="space-y-2.5">
        <div>
          <dt className="text-xs font-semibold text-ink-mute">{t('when')}</dt>
          <dd className="font-bold text-ink">
            {f.dateLong(fin.date)} · {f.slotLabel(fin.slot)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-ink-mute">{t('where')}</dt>
          <dd className="font-bold text-ink">
            {fin.location ? (
              <a
                href={mapsHref({ name: fin.location.name, mapUrl: fin.location.mapUrl })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-words text-peach-700 underline-offset-2 hover:underline"
              >
                {fin.location.name}
                <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
              </a>
            ) : (
              <span className="text-ink-soft">{t('tbd')}</span>
            )}
            {fin.location?.notes && <span className="mt-0.5 block text-sm font-normal text-ink-mute">{fin.location.notes}</span>}
          </dd>
        </div>
      </dl>
      <div className="mt-4 grid gap-2">
        <a
          href={googleCalendarUrl(calendarInput)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ size: 'lg' }))}
        >
          <CalendarPlus className="h-5 w-5" aria-hidden />
          {t('addGoogle')}
        </a>
        <a href={`/api/events/${room.id}/ics`} download className={cn(buttonVariants({ size: 'lg', variant: 'soft' }))}>
          <Download className="h-5 w-5" aria-hidden />
          {t('downloadIcs')}
        </a>
      </div>
    </Card>
  );
}
