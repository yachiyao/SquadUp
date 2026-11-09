'use client';

import { CalendarCheck, Check, Crown, ShieldCheck, UserMinus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import { Avatar } from './ParticipantAvatar';
import { Badge, Card } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { rankSlots, type VoteRow } from '@/lib/scoring';
import type { SlotConfig } from '@/lib/slots';
import { useFormatters } from '@/lib/useFormatters';
import { cn } from '@/lib/utils';
import type { RoomData, RoomParticipant } from '@/types/room';

/** Read-only attendee roster shown to everyone who is not the authenticated host. */
export function AttendeeCard({ participants, meId, max }: { participants: RoomParticipant[]; meId: string | null; max: number }) {
  const t = useTranslations('host');
  return (
    <Card aria-labelledby="attendees-title">
      <h2 id="attendees-title" className="mb-3 text-lg font-bold">
        {t('attendees', { count: participants.length, max })}
      </h2>
      <ul className="divide-y divide-stone-100">
        {participants.map((p) => (
          <AttendeeRow key={p.id} p={p} isMe={p.id === meId} />
        ))}
      </ul>
    </Card>
  );
}

function AttendeeRow({ p, isMe, action }: { p: RoomParticipant; isMe: boolean; action?: React.ReactNode }) {
  const t = useTranslations('host');
  return (
    <li className="flex min-h-[56px] items-center gap-3 py-2">
      <Avatar person={p} className="h-9 w-9 text-sm" />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-ink">{p.nickname}</span>
        <span className="flex gap-1.5">
          {p.isHost && (
            <Badge tone="peach" className="px-2 py-0 text-[11px]">
              <Crown className="h-3 w-3" aria-hidden /> {t('hostBadge')}
            </Badge>
          )}
          {isMe && (
            <Badge tone="brand" className="px-2 py-0 text-[11px]">
              {t('you')}
            </Badge>
          )}
        </span>
      </span>
      {action}
    </li>
  );
}

interface Props {
  room: RoomData;
  votes: VoteRow[];
  config: SlotConfig;
  tally: Map<string, number>;
  onKick: (participantId: string) => Promise<void>;
  onFinalize: (input: { date: string; slot: string; locationOptionId: string | null }) => Promise<void>;
}

/** Authenticated-host panel: attendee list with Remove, plus Finalize Gathering. */
export function HostControls({ room, votes, config, tally, onKick, onFinalize }: Props) {
  const t = useTranslations('host');
  const f = useFormatters();
  const [kickTarget, setKickTarget] = useState<RoomParticipant | null>(null);
  const [kicking, setKicking] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [pick, setPick] = useState<string | null>(null);
  const [locPick, setLocPick] = useState<string | null>(null);

  const candidates = useMemo(() => rankSlots(votes, config, 6, 1), [votes, config]);
  const selected = candidates.find((c) => `${c.date}|${c.slot}` === pick) ?? candidates[0] ?? null;

  const needsLocationChoice = room.locations.length >= 2;
  const defaultLoc = useMemo(() => {
    let best: string | null = room.locations[0]?.id ?? null;
    let bestVotes = -1;
    for (const l of room.locations) {
      const v = tally.get(l.id) ?? 0;
      if (v > bestVotes) {
        best = l.id;
        bestVotes = v;
      }
    }
    return best;
  }, [room.locations, tally]);
  const chosenLoc = locPick ?? defaultLoc;

  async function confirmKick() {
    if (!kickTarget) return;
    setKicking(true);
    try {
      await onKick(kickTarget.id);
      setKickTarget(null);
    } catch {
      /* the caller already surfaced a toast; keep the dialog open so the host can retry */
    } finally {
      setKicking(false);
    }
  }

  async function confirmFinalize() {
    if (!selected) return;
    setFinalizing(true);
    try {
      await onFinalize({
        date: selected.date,
        slot: selected.slot,
        locationOptionId: needsLocationChoice ? chosenLoc : null,
      });
      setFinalizeOpen(false);
    } catch {
      /* toast shown by caller */
    } finally {
      setFinalizing(false);
    }
  }

  return (
    <Card aria-labelledby="host-title" className="border border-brand-100">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h2 id="host-title" className="flex items-center gap-2 text-lg font-bold">
          <ShieldCheck className="h-5 w-5 text-brand-600" aria-hidden />
          {t('title')}
        </h2>
        <Badge tone="brand">{t('attendeesShort', { count: room.participants.length, max: room.maxParticipants })}</Badge>
      </div>

      <ul className="divide-y divide-stone-100">
        {room.participants.map((p) => (
          <AttendeeRow
            key={p.id}
            p={p}
            isMe={p.id === room.meId}
            action={
              p.isHost || room.isFinalized ? null : (
                <Button
                  variant="danger"
                  size="sm"
                  aria-label={t('kickAria', { name: p.nickname })}
                  onClick={() => setKickTarget(p)}
                >
                  <UserMinus className="h-4 w-4" aria-hidden />
                  {t('kick')}
                </Button>
              )
            }
          />
        ))}
      </ul>

      {!room.isFinalized && (
        <Button className="mt-4 w-full" size="lg" onClick={() => setFinalizeOpen(true)}>
          <CalendarCheck className="h-5 w-5" aria-hidden />
          {t('finalize')}
        </Button>
      )}

      <Dialog open={kickTarget !== null} onOpenChange={(o) => !o && !kicking && setKickTarget(null)}>
        <DialogContent>
          <DialogTitle className="pr-8 text-lg font-bold">{t('kickTitle', { name: kickTarget?.nickname ?? '' })}</DialogTitle>
          <DialogDescription className="mt-2 text-sm text-ink-soft">{t('kickBody')}</DialogDescription>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={kicking}>
                {t('cancel')}
              </Button>
            </DialogClose>
            <Button variant="danger" loading={kicking} onClick={confirmKick}>
              {t('kickConfirm')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Drawer.Root open={finalizeOpen} onOpenChange={setFinalizeOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40" />
          <Drawer.Content
            aria-describedby={undefined}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-xl flex-col rounded-t-[2rem] bg-cream shadow-float outline-none"
          >
            <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-stone-300" aria-hidden />
            <div className="shrink-0 px-5 pb-2 pt-3">
              <Drawer.Title className="text-xl font-extrabold">{t('finalizeTitle')}</Drawer.Title>
              <p className="mt-1 text-sm text-ink-mute">{t('finalizeHint')}</p>
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-4 pb-4">
              <section>
                <h3 className="mb-2 px-1 text-sm font-bold text-ink-soft">{t('chooseSlot')}</h3>
                {candidates.length === 0 ? (
                  <p className="rounded-2xl bg-stone-50 px-4 py-5 text-center text-sm text-ink-mute">{t('noCandidates')}</p>
                ) : (
                  <div role="radiogroup" className="space-y-2">
                    {candidates.map((c) => {
                      const key = `${c.date}|${c.slot}`;
                      const on = selected && `${selected.date}|${selected.slot}` === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          role="radio"
                          aria-checked={!!on}
                          onClick={() => setPick(key)}
                          className={cn(
                            'flex min-h-[60px] w-full items-center gap-3 rounded-2xl border bg-white px-4 py-2 text-left',
                            on ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200',
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                              on ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300',
                            )}
                          >
                            {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{f.dateLong(c.date)}</span>
                            <span className="block text-sm text-ink-mute">{f.slotLabel(c.slot)}</span>
                          </span>
                          <Badge tone="brand">{t('people', { count: c.count })}</Badge>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {needsLocationChoice && (
                <section>
                  <h3 className="mb-2 px-1 text-sm font-bold text-ink-soft">{t('chooseLocation')}</h3>
                  <div role="radiogroup" className="space-y-2">
                    {room.locations.map((l) => {
                      const on = chosenLoc === l.id;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setLocPick(l.id)}
                          className={cn(
                            'flex min-h-[56px] w-full items-center gap-3 rounded-2xl border bg-white px-4 py-2 text-left',
                            on ? 'border-brand-500 ring-1 ring-brand-500' : 'border-stone-200',
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
                              on ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-300',
                            )}
                          >
                            {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                          </span>
                          <span className="min-w-0 flex-1 truncate font-semibold">{l.name}</span>
                          <Badge tone="peach">{t('votes', { count: tally.get(l.id) ?? 0 })}</Badge>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-stone-200/70 bg-cream px-4 pb-safe pt-3">
              <Drawer.Close asChild>
                <Button variant="outline" disabled={finalizing}>
                  {t('cancel')}
                </Button>
              </Drawer.Close>
              <Button disabled={!selected} loading={finalizing} onClick={confirmFinalize}>
                {t('finalizeConfirm')}
              </Button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </Card>
  );
}
