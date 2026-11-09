'use client';

import { CheckCircle2, Lock, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { DateSlotBottomSheet } from '@/components/calendar/DateSlotBottomSheet';
import { HeatmapCalendar } from '@/components/calendar/HeatmapCalendar';
import { Badge, Card } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useNow, useOnline } from '@/hooks/useNow';
import { ApiError, api, fetcher } from '@/lib/api';
import { getSavedNickname, rememberRoom, saveNickname } from '@/lib/clientStorage';
import { toDateStr } from '@/lib/dates';
import { parseKey, sameSets, setWholeDay, slotKey, toggleSlot } from '@/lib/draft';
import type { VoteRow } from '@/lib/scoring';
import type { SlotConfig } from '@/lib/slots';
import { useErrorMessage } from '@/lib/useErrorMessage';
import { cn } from '@/lib/utils';
import type { RoomData } from '@/types/room';
import { AttendeeCard, HostControls } from './HostControls';
import { FinalizedCard } from './FinalizedCard';
import { LocationVoting } from './LocationVoting';
import type { Person } from './ParticipantAvatar';
import { PasscodeGate } from './PasscodeGate';
import { RoomHeader } from './RoomHeader';
import { ShareSheet } from './ShareSheet';
import { ExpiredScreen, LoadErrorScreen, NotFoundScreen, RoomSkeleton } from './StatusScreens';
import { Top3Leaderboard } from './Top3Leaderboard';

const POLL_MS = 12_000; // light polling (10–15s) + revalidate on focus / reconnect
const DRAFT_ME = 'draft-me';
const OPTIMISTIC_ME = 'optimistic-me';

export function RoomClient({ id }: { id: string }) {
  const t = useTranslations('room');
  const errorMessage = useErrorMessage();
  const online = useOnline();
  const { data: session } = useSession();

  const { data, error, mutate } = useSWR<RoomData, ApiError>(`/api/events/${id}`, fetcher<RoomData>, {
    refreshInterval: (latest) => (latest ? POLL_MS : 0),
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 2_000,
    keepPreviousData: true,
    onErrorRetry: (err, _key, _cfg, revalidate, { retryCount }) => {
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) return; // terminal states
      if (retryCount >= 6) return;
      setTimeout(() => revalidate({ retryCount }), Math.min(30_000, 2_000 * 2 ** retryCount));
    },
  });

  // ---- local draft (nothing is sent until "Submit") -------------------------------------------
  const [draftSlots, setDraftSlots] = useState<Set<string> | null>(null);
  const [draftNick, setDraftNick] = useState<string | null>(null);
  const [draftLoc, setDraftLoc] = useState<string | null | undefined>(undefined);
  const [defaultNick, setDefaultNick] = useState('');
  const [sheetDate, setSheetDate] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const nickRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDefaultNick(getSavedNickname() || session?.user?.name?.slice(0, 24) || '');
  }, [session?.user?.name]);

  useEffect(() => {
    if (data) rememberRoom({ id: data.id, title: data.title });
  }, [data?.id, data?.title]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Landing here straight after creating an event opens the share sheet once.
    const params = new URLSearchParams(window.location.search);
    if (params.get('share') === '1') {
      setShareOpen(true);
      params.delete('share');
      const qs = params.toString();
      window.history.replaceState(null, '', window.location.pathname + (qs ? `?${qs}` : ''));
    }
  }, []);

  // ---- derived state --------------------------------------------------------------------------
  const meId = data?.meId ?? null;
  const meKey = meId ?? DRAFT_ME;

  const config: SlotConfig | null = useMemo(
    () => (data ? { slotMode: data.slotMode, hourStart: data.hourStart, hourEnd: data.hourEnd } : null),
    [data],
  );

  const serverSlots = useMemo(
    () => new Set((data?.availabilities ?? []).filter((a) => a.participantId === meId).map((a) => slotKey(a.date, a.slot))),
    [data?.availabilities, meId],
  );
  const serverLoc = useMemo(
    () => data?.locationVotes.find((v) => v.participantId === meId)?.locationOptionId ?? null,
    [data?.locationVotes, meId],
  );
  const meParticipant = data?.participants.find((p) => p.id === meId) ?? null;

  const mine = draftSlots ?? serverSlots;
  const myLoc = draftLoc !== undefined ? draftLoc : serverLoc;
  const nickname = draftNick ?? meParticipant?.nickname ?? defaultNick;

  const dirty =
    (draftSlots !== null && !sameSets(draftSlots, serverSlots)) ||
    (draftLoc !== undefined && draftLoc !== serverLoc) ||
    (draftNick !== null && draftNick.trim() !== (meParticipant?.nickname ?? ''));

  /** Everyone's votes with the viewer's own pending selection swapped in → live heatmap/Top 3 preview. */
  const votes: VoteRow[] = useMemo(() => {
    if (!data) return [];
    const others = data.availabilities.filter((a) => a.participantId !== meId);
    const mineRows = [...mine].map((k) => ({ participantId: meKey, ...parseKey(k) }));
    return [...others, ...mineRows];
  }, [data, mine, meId, meKey]);

  const people = useMemo(() => {
    const map = new Map<string, Person>();
    data?.participants.forEach((p) => map.set(p.id, p));
    if (!meId && mine.size > 0) map.set(DRAFT_ME, { id: DRAFT_ME, nickname: nickname.trim() || t('you') });
    return map;
  }, [data?.participants, meId, mine.size, nickname, t]);

  const tally = useMemo(() => {
    const m = new Map<string, number>();
    data?.locations.forEach((l) => m.set(l.id, 0));
    data?.locationVotes.forEach((v) => {
      if (v.participantId !== meId) m.set(v.locationOptionId, (m.get(v.locationOptionId) ?? 0) + 1);
    });
    if (myLoc && m.has(myLoc)) m.set(myLoc, (m.get(myLoc) ?? 0) + 1);
    return m;
  }, [data?.locations, data?.locationVotes, meId, myLoc]);

  const now = useNow(30_000);

  // ---- mutations ------------------------------------------------------------------------------
  const refetchFresh = useCallback(() => api<RoomData>(`/api/events/${id}`), [id]);

  async function submit() {
    if (!data || !config) return;
    const nick = nickname.trim();
    if (!nick) {
      toast.error(t('nicknameRequired'));
      nickRef.current?.focus();
      nickRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    const today = toDateStr(new Date());
    const rows = [...mine].map(parseKey).filter((a) => a.date >= today);
    const locationOptionId = data.locations.length >= 2 ? myLoc : null;

    const optimistic: RoomData = {
      ...data,
      meId: meId ?? OPTIMISTIC_ME,
      participantCount: meId ? data.participantCount : data.participantCount + 1,
      participants: meId
        ? data.participants.map((p) => (p.id === meId ? { ...p, nickname: nick } : p))
        : [...data.participants, { id: OPTIMISTIC_ME, nickname: nick, isHost: false, image: null }],
      availabilities: [
        ...data.availabilities.filter((a) => a.participantId !== meId),
        ...rows.map((r) => ({ participantId: meId ?? OPTIMISTIC_ME, ...r })),
      ],
      locationVotes: [
        ...data.locationVotes.filter((v) => v.participantId !== meId),
        ...(locationOptionId ? [{ participantId: meId ?? OPTIMISTIC_ME, locationOptionId }] : []),
      ],
    };

    setSubmitting(true);
    try {
      await mutate(
        async () => {
          await api(`/api/events/${id}/submit`, { method: 'POST', json: { nickname: nick, availabilities: rows, locationOptionId } });
          return refetchFresh();
        },
        { optimisticData: optimistic, rollbackOnError: true, populateCache: true, revalidate: false },
      );
      saveNickname(nick);
      setDraftSlots(null);
      setDraftNick(null);
      setDraftLoc(undefined);
      toast.success(meId ? t('updated') : t('joined'));
    } catch (e) {
      // Draft is kept so nothing the user picked is lost; refresh to show the true headcount (e.g. now full).
      toast.error(errorMessage(e));
      void mutate();
    } finally {
      setSubmitting(false);
    }
  }

  async function kick(participantId: string) {
    if (!data) return;
    const target = data.participants.find((p) => p.id === participantId);
    const optimistic: RoomData = {
      ...data,
      participantCount: data.participantCount - 1,
      participants: data.participants.filter((p) => p.id !== participantId),
      availabilities: data.availabilities.filter((a) => a.participantId !== participantId),
      locationVotes: data.locationVotes.filter((v) => v.participantId !== participantId),
    };
    try {
      await mutate(
        async () => {
          await api(`/api/events/${id}/kick`, { method: 'POST', json: { participantId } });
          return refetchFresh();
        },
        { optimisticData: optimistic, rollbackOnError: true, populateCache: true, revalidate: false },
      );
      toast.success(t('kicked', { name: target?.nickname ?? '' }));
    } catch (e) {
      toast.error(errorMessage(e));
      void mutate();
      throw e;
    }
  }

  async function finalize(input: { date: string; slot: string; locationOptionId: string | null }) {
    if (!data) return;
    try {
      await mutate(
        async () => {
          await api(`/api/events/${id}/finalize`, { method: 'POST', json: input });
          return refetchFresh();
        },
        { rollbackOnError: true, populateCache: true, revalidate: false },
      );
      toast.success(t('finalizedToast'));
    } catch (e) {
      toast.error(errorMessage(e));
      void mutate();
      throw e;
    }
  }

  // ---- terminal / loading states --------------------------------------------------------------
  if (error?.code === 'NOT_FOUND') return <NotFoundScreen />;
  if (error?.code === 'EXPIRED') return <ExpiredScreen title={error.body.title} />;
  if (error?.code === 'PASSCODE_REQUIRED') {
    return (
      <PasscodeGate
        eventId={id}
        title={error.body.title}
        hostNickname={error.body.hostNickname}
        participantCount={error.body.participantCount}
        maxParticipants={error.body.maxParticipants}
        onUnlocked={() => void mutate()}
      />
    );
  }
  if (!data || !config) {
    if (error) return <LoadErrorScreen offline={!online || error.code === 'NETWORK'} onRetry={() => void mutate()} />;
    return <RoomSkeleton />;
  }
  if (new Date(data.expiresAt).getTime() <= now) return <ExpiredScreen title={data.title} />;

  const full = data.participantCount >= data.maxParticipants;
  const readOnlyReason: 'finalized' | 'full' | null = data.isFinalized ? 'finalized' : !meId && full ? 'full' : null;
  const readOnly = readOnlyReason !== null;
  const showSubmitBar = !readOnly && (dirty || !meId);
  const offlineBanner = !online || (error && error.code === 'NETWORK');

  return (
    <div className="space-y-4">
      {offlineBanner && (
        <div role="status" className="flex items-center gap-2 rounded-2xl bg-peach-100 px-4 py-3 text-sm font-medium text-peach-700">
          <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
          {t('offline')}
        </div>
      )}

      <RoomHeader room={data} onShare={() => setShareOpen(true)} />

      {data.isFinalized && (
        <>
          <FinalizedCard room={data} />
          <div role="status" className="flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-ink-soft">
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            {t('lockedBanner')}
          </div>
        </>
      )}

      {!data.isFinalized && full && !meId && (
        <div role="alert" className="rounded-2xl border border-peach-200 bg-peach-50 px-4 py-3 text-sm text-peach-700">
          <p className="font-bold">{t('full', { count: data.participantCount, max: data.maxParticipants })}</p>
          <p className="mt-0.5">{t('fullBody')}</p>
        </div>
      )}

      {!readOnly || meId ? (
        <Card aria-labelledby="resp-title">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="resp-title" className="text-lg font-bold">
              {t('yourResponse')}
            </h2>
            {meId && !dirty && (
              <Badge tone="brand">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                {t('inBadge')}
              </Badge>
            )}
            {dirty && <Badge tone="peach">{t('unsaved')}</Badge>}
          </div>
          <Field label={t('nickname')} htmlFor="nickname" hint={meId ? undefined : t('nicknameHint')}>
            <Input
              id="nickname"
              ref={nickRef}
              value={nickname}
              maxLength={24}
              disabled={data.isFinalized}
              autoComplete="nickname"
              enterKeyHint="done"
              placeholder={t('nicknamePlaceholder')}
              onChange={(e) => setDraftNick(e.target.value)}
            />
          </Field>
        </Card>
      ) : null}

      <Card className="p-3" aria-labelledby="cal-title">
        <div className="mb-3 px-1">
          <h2 id="cal-title" className="text-lg font-bold">
            {t('calendarTitle')}
          </h2>
          <p className="text-sm text-ink-mute">{readOnly ? t('calendarReadOnly') : t('calendarHint')}</p>
        </div>
        <HeatmapCalendar
          votes={votes}
          config={config}
          mine={mine}
          finalDate={data.final?.date}
          onSelectDate={(d) => setSheetDate(d)}
        />
      </Card>

      <Top3Leaderboard votes={votes} config={config} people={people} meKey={meKey} onPickDate={(d) => setSheetDate(d)} />

      <LocationVoting
        locations={data.locations}
        tally={tally}
        myChoice={myLoc}
        readOnly={readOnly}
        onChoose={(locId) => setDraftLoc(locId)}
      />

      {data.canManage ? (
        <HostControls room={data} votes={votes} config={config} tally={tally} onKick={kick} onFinalize={finalize} />
      ) : (
        <AttendeeCard participants={data.participants} meId={meId} max={data.maxParticipants} />
      )}

      <DateSlotBottomSheet
        date={sheetDate}
        onOpenChange={(o) => !o && setSheetDate(null)}
        config={config}
        votes={votes}
        mine={mine}
        people={people}
        meKey={meKey}
        readOnly={readOnly}
        readOnlyReason={readOnlyReason}
        onToggle={(date, slot) => setDraftSlots(toggleSlot(mine, date, slot, config))}
        onSetWholeDay={(date, on) => setDraftSlots(setWholeDay(mine, date, on, config))}
      />

      <ShareSheet open={shareOpen} onOpenChange={setShareOpen} eventId={data.id} title={data.title} />

      {showSubmitBar && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200/70 bg-cream/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-xl items-center gap-3 px-4 pb-safe pt-3">
            <p className={cn('min-w-0 flex-1 text-sm', mine.size ? 'font-semibold text-ink' : 'text-ink-mute')}>
              {mine.size ? t('selectedCount', { count: mine.size }) : t('selectHint')}
            </p>
            <Button size="lg" className="shrink-0" onClick={submit} loading={submitting} disabled={submitting}>
              {meId ? t('submitUpdate') : t('submitJoin')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
