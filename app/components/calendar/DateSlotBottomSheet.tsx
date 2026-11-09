'use client';

import { Check, Lock, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef } from 'react';
import { Drawer } from 'vaul';
import { AvatarChip, type Person } from '@/components/room/ParticipantAvatar';
import { isSelected } from '@/lib/draft';
import { slotAttendees, type VoteRow } from '@/lib/scoring';
import { slotsFor, type SlotConfig } from '@/lib/slots';
import { useFormatters } from '@/lib/useFormatters';
import { cn } from '@/lib/utils';

interface Props {
  date: string | null;
  onOpenChange: (open: boolean) => void;
  config: SlotConfig;
  /** Votes including the current user's draft (so chips update as they tap). */
  votes: VoteRow[];
  mine: Set<string>;
  people: Map<string, Person>;
  /** Id used for the current user inside `votes` (their participant id, or the draft placeholder). */
  meKey: string;
  readOnly: boolean;
  readOnlyReason?: 'full' | 'finalized' | null;
  onToggle: (date: string, slot: string) => void;
  onSetWholeDay: (date: string, on: boolean) => void;
}

export function DateSlotBottomSheet({
  date,
  onOpenChange,
  config,
  votes,
  mine,
  people,
  meKey,
  readOnly,
  readOnlyReason,
  onToggle,
  onSetWholeDay,
}: Props) {
  const t = useTranslations('sheet');
  const f = useFormatters();
  // Keep rendering the last date while the drawer animates closed.
  const lastDate = useRef<string | null>(null);
  if (date) lastDate.current = date;
  const shown = date ?? lastDate.current;
  const slots = slotsFor(config);

  return (
    <Drawer.Root open={date !== null} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[88dvh] w-full max-w-xl flex-col rounded-t-[2rem] bg-cream shadow-float outline-none"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-stone-300" aria-hidden />
          {shown && (
            <>
              <div className="shrink-0 px-5 pb-3 pt-3">
                <Drawer.Title className="text-xl font-extrabold text-ink">{f.dateLong(shown)}</Drawer.Title>
                <p className="mt-0.5 text-sm text-ink-mute">{readOnly ? t(readOnlyReason === 'finalized' ? 'readOnlyFinalized' : 'readOnlyFull') : t('hint')}</p>
              </div>

              <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 pb-4">
                {config.slotMode === 'HOURLY' && !readOnly && (
                  <div className="flex gap-2 pb-1">
                    <button
                      type="button"
                      onClick={() => onSetWholeDay(shown, true)}
                      className="h-11 rounded-full bg-brand-50 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-100"
                    >
                      {t('allHours')}
                    </button>
                    <button
                      type="button"
                      onClick={() => onSetWholeDay(shown, false)}
                      className="h-11 rounded-full bg-stone-100 px-4 text-sm font-semibold text-ink-soft hover:bg-stone-200"
                    >
                      {t('clear')}
                    </button>
                  </div>
                )}

                {slots.map((slot) => {
                  const selected = isSelected(mine, shown, slot, config);
                  const ids = slotAttendees(votes, shown, slot, config);
                  const attendees = ids.map((id) => people.get(id)).filter(Boolean) as Person[];
                  attendees.sort((a, b) => Number(b.id === meKey) - Number(a.id === meKey));
                  const hint = f.slotHint(slot);
                  return (
                    <div
                      key={slot}
                      className={cn(
                        'rounded-2xl border bg-white transition',
                        selected ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200',
                      )}
                    >
                      <button
                        type="button"
                        role="switch"
                        aria-checked={selected}
                        disabled={readOnly}
                        onClick={() => onToggle(shown, slot)}
                        className="flex min-h-[56px] w-full items-center gap-3 rounded-2xl px-4 py-2 text-left disabled:cursor-default"
                      >
                        <span
                          className={cn(
                            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition',
                            selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300 bg-white',
                          )}
                          aria-hidden
                        >
                          {selected && <Check className="h-4 w-4" strokeWidth={3} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-ink">{f.slotLabel(slot)}</span>
                          {hint && <span className="block text-xs text-ink-mute">{hint}</span>}
                        </span>
                        {readOnly && !attendees.length ? <Lock className="h-4 w-4 text-stone-300" aria-hidden /> : null}
                        <span className={cn('flex items-center gap-1 text-sm font-bold', attendees.length ? 'text-brand-700' : 'text-stone-300')}>
                          <Users className="h-4 w-4" aria-hidden />
                          {attendees.length}
                        </span>
                      </button>
                      {attendees.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                          {attendees.map((p) => (
                            <AvatarChip key={p.id} person={p} highlight={p.id === meKey} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="shrink-0 border-t border-stone-200/70 bg-cream px-4 pb-safe pt-3">
                <Drawer.Close className="h-12 w-full rounded-2xl bg-brand-600 text-base font-semibold text-white active:scale-[.98]">
                  {t('done')}
                </Drawer.Close>
              </div>
            </>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
