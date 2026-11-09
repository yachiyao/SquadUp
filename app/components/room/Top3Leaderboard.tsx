'use client';

import { CalendarCheck, Trophy, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { AvatarChip, AvatarStack, type Person } from './ParticipantAvatar';
import { Card } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { rankSlots, voterCount, type VoteRow } from '@/lib/scoring';
import type { SlotConfig } from '@/lib/slots';
import { useFormatters } from '@/lib/useFormatters';
import { cn } from '@/lib/utils';

interface Props {
  votes: VoteRow[];
  config: SlotConfig;
  people: Map<string, Person>;
  meKey: string;
  onPickDate: (date: string) => void;
}

const MEDALS = ['bg-peach-200 text-peach-700', 'bg-stone-200 text-ink-soft', 'bg-peach-100 text-peach-600'];

/** Live Top 3. Recomputed from the vote list on every render, so kicks / edits update it instantly. */
export function Top3Leaderboard({ votes, config, people, meKey, onPickDate }: Props) {
  const t = useTranslations('top3');
  const f = useFormatters();
  const voters = voterCount(votes);
  const top = useMemo(() => rankSlots(votes, config, 3, 2), [votes, config]);

  // Needs at least two people who have voted before a ranking means anything.
  if (voters < 2) return null;

  return (
    <Card aria-labelledby="top3-title">
      <h2 id="top3-title" className="mb-3 flex items-center gap-2 text-lg font-bold">
        <Trophy className="h-5 w-5 text-peach-500" aria-hidden />
        {t('title')}
      </h2>

      {top.length === 0 ? (
        <p className="rounded-2xl bg-stone-50 px-4 py-5 text-center text-sm text-ink-mute">{t('noOverlap')}</p>
      ) : (
        <ol className="space-y-2">
          {top.map((item, i) => {
            const attendees = item.participantIds.map((id) => people.get(id)).filter(Boolean) as Person[];
            return (
              <li key={`${item.date}|${item.slot}`} className="flex items-stretch gap-2 rounded-2xl border border-stone-100 bg-stone-50/60">
                <button
                  type="button"
                  onClick={() => onPickDate(item.date)}
                  className="flex min-h-[60px] min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-2 text-left hover:bg-stone-50"
                >
                  <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-extrabold', MEDALS[i])}>{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink">{f.dateShort(item.date)}</span>
                    <span className="block truncate text-sm text-ink-mute">{f.slotLabel(item.slot)}</span>
                  </span>
                </button>

                <Popover>
                  <PopoverTrigger
                    aria-label={t('showAttendees', { count: item.count })}
                    className="flex min-w-[88px] items-center justify-end gap-2 rounded-2xl px-3 hover:bg-stone-50 focus-visible:ring-2 focus-visible:ring-brand-500"
                  >
                    <span className="hidden min-[380px]:block">
                      <AvatarStack people={attendees} max={3} />
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-sm font-bold text-brand-700">
                      <Users className="h-4 w-4" aria-hidden />
                      {item.count}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                      <CalendarCheck className="h-4 w-4 text-brand-600" aria-hidden />
                      {t('availableCount', { count: item.count })}
                    </p>
                    <div className="flex max-h-60 flex-wrap gap-1.5 overflow-y-auto">
                      {attendees.map((p) => (
                        <AvatarChip key={p.id} person={p} highlight={p.id === meKey} />
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
