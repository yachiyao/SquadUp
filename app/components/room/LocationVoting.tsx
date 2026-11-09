'use client';

import { Check, ExternalLink, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card } from '@/components/ui/badge';
import type { RoomLocation } from '@/types/room';
import { cn } from '@/lib/utils';

interface Props {
  locations: RoomLocation[];
  /** Votes per location id, including the viewer's own pending vote. */
  tally: Map<string, number>;
  myChoice: string | null;
  onChoose: (locationId: string) => void;
  readOnly: boolean;
}

export const mapsHref = (l: Pick<RoomLocation, 'name' | 'mapUrl'>) =>
  l.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.name)}`;

function MapLink({ location }: { location: Pick<RoomLocation, 'name' | 'mapUrl'> }) {
  const t = useTranslations('locations');
  return (
    <a
      href={mapsHref(location)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-peach-100 px-4 text-sm font-semibold text-peach-700 hover:bg-peach-200"
    >
      {t('openMap')}
      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
    </a>
  );
}

export function LocationVoting({ locations, tally, myChoice, onChoose, readOnly }: Props) {
  const t = useTranslations('locations');

  return (
    <Card aria-labelledby="loc-title">
      <h2 id="loc-title" className="mb-3 flex items-center gap-2 text-lg font-bold">
        <MapPin className="h-5 w-5 text-peach-500" aria-hidden />
        {t('title')}
      </h2>

      {locations.length === 0 && (
        <div className="flex items-center gap-3 rounded-2xl bg-peach-50 px-4 py-4">
          <Badge tone="peach">TBD</Badge>
          <p className="font-medium text-peach-700">{t('tbd')}</p>
        </div>
      )}

      {locations.length === 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-peach-50 px-4 py-3">
          <div className="min-w-0">
            <p className="break-words font-semibold text-ink">{locations[0].name}</p>
            {locations[0].notes && <p className="break-words text-sm text-ink-mute">{locations[0].notes}</p>}
          </div>
          <MapLink location={locations[0]} />
        </div>
      )}

      {locations.length > 1 && (
        <div role="radiogroup" aria-label={t('title')} className="space-y-2.5">
          {(() => {
            const total = [...tally.values()].reduce((a, b) => a + b, 0);
            const top = Math.max(0, ...tally.values());
            return locations.map((l) => {
              const votes = tally.get(l.id) ?? 0;
              const selected = myChoice === l.id;
              const leading = votes > 0 && votes === top;
              return (
                <div
                  key={l.id}
                  className={cn(
                    'overflow-hidden rounded-2xl border bg-white transition',
                    selected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200',
                  )}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={readOnly}
                    onClick={() => onChoose(l.id)}
                    className="relative flex min-h-[64px] w-full items-center gap-3 px-4 py-3 text-left disabled:cursor-default"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                        selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300',
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words font-semibold text-ink">{l.name}</span>
                      {l.notes && <span className="block break-words text-sm text-ink-mute">{l.notes}</span>}
                    </span>
                    <span className="flex shrink-0 flex-col items-end">
                      <span className={cn('text-lg font-extrabold leading-none', leading ? 'text-brand-700' : 'text-ink-soft')}>{votes}</span>
                      <span className="text-[11px] text-ink-mute">{t('votes', { count: votes })}</span>
                    </span>
                  </button>
                  <div className="h-1 bg-stone-100" aria-hidden>
                    <div
                      className={cn('h-full transition-all duration-500', leading ? 'bg-brand-500' : 'bg-brand-200')}
                      style={{ width: total ? `${(votes / total) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className="flex justify-end px-3 py-1.5">
                    <a
                      href={mapsHref(l)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center gap-1 px-2 text-sm font-semibold text-peach-700 hover:underline"
                    >
                      {t('openMap')}
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                    </a>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}
    </Card>
  );
}
