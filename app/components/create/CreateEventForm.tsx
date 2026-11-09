'use client';

import { Bookmark, BookmarkCheck, Lock, Minus, Plus, Trash2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';
import { createEventAction } from '@/app/actions';
import { Badge, Card } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { useRouter } from '@/i18n/navigation';
import { api, fetcher } from '@/lib/api';
import { getSavedNickname, getToken, rememberRoom, saveNickname } from '@/lib/clientStorage';
import { useErrorMessage } from '@/lib/useErrorMessage';
import { createEventSchema, fieldErrorsFrom, GUEST_EXPIRY_DAYS, MEMBER_EXPIRY_DAYS } from '@/lib/validation';
import { cn } from '@/lib/utils';

interface LocDraft {
  name: string;
  mapUrl: string;
  notes: string;
}
interface Spot extends LocDraft {
  id: string;
}

const emptyLoc = (): LocDraft => ({ name: '', mapUrl: '', notes: '' });

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; locked?: boolean }[];
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            'inline-flex h-11 min-w-[56px] items-center justify-center gap-1.5 rounded-2xl border px-4 text-sm font-semibold transition active:scale-[.97]',
            value === o.value ? 'border-brand-600 bg-brand-600 text-white' : 'border-stone-200 bg-white text-ink-soft hover:bg-stone-50',
            o.locked && 'border-dashed text-ink-mute',
          )}
        >
          {o.locked && <Lock className="h-3.5 w-3.5" aria-hidden />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

const selectClass =
  'h-12 w-full rounded-2xl border border-stone-200 bg-white px-3 text-base text-ink shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40';

export function CreateEventForm() {
  const t = useTranslations('create');
  const te = useTranslations('errors');
  const errorMessage = useErrorMessage();
  const router = useRouter();
  const { data: session } = useSession();
  const isMember = !!session?.user;

  const [title, setTitle] = useState('');
  const [nickname, setNickname] = useState('');
  const [locations, setLocations] = useState<LocDraft[]>([]);
  const [passcode, setPasscode] = useState('');
  const [capacity, setCapacity] = useState('20');
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [slotMode, setSlotMode] = useState<'COARSE' | 'HOURLY'>('COARSE');
  const [hourStart, setHourStart] = useState(9);
  const [hourEnd, setHourEnd] = useState(22);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  // Nickname: Google name for members, otherwise the last nickname used on this device.
  useEffect(() => {
    setNickname((cur) => cur || session?.user?.name?.slice(0, 24) || getSavedNickname());
  }, [session?.user?.name]);

  const { data: spotsData, mutate: mutateSpots } = useSWR<{ spots: Spot[] }>(isMember ? '/api/me/spots' : null, fetcher);
  const spots = spotsData?.spots ?? [];

  const fieldError = (path: string) => (errors[path] ? te(errors[path] as never) : undefined);

  function setLoc(i: number, patch: Partial<LocDraft>) {
    setLocations((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function applySpot(s: Spot) {
    setLocations((ls) => {
      if (ls.some((l) => l.name === s.name)) return ls;
      const spot = { name: s.name, mapUrl: s.mapUrl ?? '', notes: s.notes ?? '' };
      const emptyIdx = ls.findIndex((l) => !l.name.trim());
      if (emptyIdx >= 0) return ls.map((l, i) => (i === emptyIdx ? spot : l));
      return ls.length < 3 ? [...ls, spot] : ls;
    });
  }

  async function saveSpot(l: LocDraft) {
    try {
      await api('/api/me/spots', { method: 'POST', json: { name: l.name, mapUrl: l.mapUrl, notes: l.notes } });
      await mutateSpots();
      toast.success(t('spotSaved'));
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  function pickExpiry(days: number) {
    if (!isMember && !(GUEST_EXPIRY_DAYS as readonly number[]).includes(days)) {
      toast(t('memberExpiryHint'));
      return;
    }
    setExpiryDays(days);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const cap = capacity.trim();
    const payload = {
      title,
      hostNickname: nickname,
      locations: locations
        .filter((l) => l.name.trim() || l.mapUrl.trim() || l.notes.trim())
        .map((l) => ({ name: l.name, mapUrl: l.mapUrl, notes: l.notes })),
      passcode,
      maxParticipants: /^\d+$/.test(cap) ? Number(cap) : Number.NaN,
      expiryDays,
      slotMode,
      hourStart,
      hourEnd,
    };

    const parsed = createEventSchema.safeParse(payload);
    if (!parsed.success) {
      const fe = fieldErrorsFrom(parsed.error);
      setErrors(fe);
      const first = document.querySelector('[aria-invalid="true"], [data-field-error]') as HTMLElement | null;
      first?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      first?.focus?.();
      return;
    }
    setErrors({});

    setBusy(true);
    try {
      const res = await createEventAction(parsed.data, getToken());
      if (res.ok) {
        saveNickname(parsed.data.hostNickname);
        rememberRoom({ id: res.id, title: parsed.data.title });
        router.push(`/g/${res.id}?share=1`);
        return;
      }
      if (res.fieldErrors) setErrors(res.fieldErrors);
      toast.error(
        res.code === 'VALIDATION'
          ? te('validation')
          : res.fieldErrors?.expiryDays
            ? te('member_only_expiry')
            : te('generic'),
      );
    } catch {
      // Server Action could not reach the server
      toast.error(te('network'));
    } finally {
      setBusy(false);
    }
  }

  const expiryOptions = MEMBER_EXPIRY_DAYS.map((d) => ({
    value: d as number,
    label: t('days', { count: d }),
    locked: !isMember && !(GUEST_EXPIRY_DAYS as readonly number[]).includes(d),
  }));

  const hours = Array.from({ length: 25 }, (_, h) => h);

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <Card className="space-y-4">
        <Field label={t('titleLabel')} htmlFor="title" error={fieldError('title')}>
          <Input
            id="title"
            value={title}
            maxLength={80}
            invalid={!!errors.title}
            placeholder={t('titlePlaceholder')}
            enterKeyHint="next"
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <Field label={t('nicknameLabel')} htmlFor="hostNickname" error={fieldError('hostNickname')} hint={isMember ? undefined : t('nicknameHint')}>
          <Input
            id="hostNickname"
            value={nickname}
            maxLength={24}
            invalid={!!errors.hostNickname}
            placeholder={t('nicknamePlaceholder')}
            autoComplete="nickname"
            onChange={(e) => setNickname(e.target.value)}
          />
        </Field>
      </Card>

      <Card className="space-y-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold">
            {t('locationsLabel')} <span className="text-xs font-normal text-ink-mute">{t('optional')}</span>
          </h2>
          <p className="text-xs text-ink-mute">{t('locationsHint')}</p>
        </div>

        {isMember ? (
          spots.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold text-ink-soft">{t('savedSpots')}</p>
              <div className="flex flex-wrap gap-2">
                {spots.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => applySpot(s)}
                    className="inline-flex h-11 max-w-full items-center gap-1.5 rounded-full bg-peach-100 px-4 text-sm font-semibold text-peach-700 hover:bg-peach-200"
                  >
                    <Bookmark className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        ) : (
          <p className="rounded-2xl bg-stone-50 px-3 py-2 text-xs text-ink-mute">{t('spotsGuestHint')}</p>
        )}

        {locations.map((l, i) => {
          const saved = spots.some((s) => s.name === l.name.trim());
          return (
            <div key={i} className="space-y-2 rounded-2xl border border-stone-200 p-3">
              <div className="flex items-center justify-between">
                <Badge tone="peach">{t('locationN', { n: i + 1 })}</Badge>
                <div className="flex items-center gap-1">
                  {isMember && l.name.trim() && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t('saveSpot')}
                      disabled={saved}
                      onClick={() => saveSpot(l)}
                    >
                      {saved ? <BookmarkCheck className="h-5 w-5 text-brand-600" /> : <Bookmark className="h-5 w-5" />}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={t('removeLocation')}
                    onClick={() => setLocations((ls) => ls.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <Input
                aria-label={t('locationName')}
                value={l.name}
                maxLength={60}
                invalid={!!errors[`locations.${i}.name`]}
                placeholder={t('locationName')}
                onChange={(e) => setLoc(i, { name: e.target.value })}
              />
              {errors[`locations.${i}.name`] && (
                <p role="alert" className="text-sm text-red-600">
                  {fieldError(`locations.${i}.name`)}
                </p>
              )}
              <Input
                aria-label={t('locationMap')}
                value={l.mapUrl}
                type="url"
                inputMode="url"
                autoCapitalize="off"
                invalid={!!errors[`locations.${i}.mapUrl`]}
                placeholder={t('locationMap')}
                onChange={(e) => setLoc(i, { mapUrl: e.target.value })}
              />
              {errors[`locations.${i}.mapUrl`] && (
                <p role="alert" className="text-sm text-red-600">
                  {fieldError(`locations.${i}.mapUrl`)}
                </p>
              )}
              <Input
                aria-label={t('locationNotes')}
                value={l.notes}
                maxLength={120}
                placeholder={t('locationNotes')}
                onChange={(e) => setLoc(i, { notes: e.target.value })}
              />
            </div>
          );
        })}

        {locations.length < 3 && (
          <Button type="button" variant="peach" className="w-full" onClick={() => setLocations((ls) => [...ls, emptyLoc()])}>
            <Plus className="h-5 w-5" aria-hidden />
            {t('addLocation')} ({locations.length}/3)
          </Button>
        )}
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="mb-1.5 font-bold">{t('slotMode')}</h2>
          <Segmented
            label={t('slotMode')}
            value={slotMode}
            onChange={setSlotMode}
            options={[
              { value: 'COARSE', label: t('slotCoarse') },
              { value: 'HOURLY', label: t('slotHourly') },
            ]}
          />
          <p className="mt-1.5 text-xs text-ink-mute">{slotMode === 'COARSE' ? t('slotCoarseHint') : t('slotHourlyHint')}</p>
          {slotMode === 'HOURLY' && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label={t('hourFrom')} htmlFor="hourStart">
                <select id="hourStart" className={selectClass} value={hourStart} onChange={(e) => setHourStart(Number(e.target.value))}>
                  {hours.slice(0, 24).map((h) => (
                    <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('hourTo')} htmlFor="hourEnd" error={fieldError('hourEnd')}>
                <select id="hourEnd" className={selectClass} value={hourEnd} onChange={(e) => setHourEnd(Number(e.target.value))} aria-invalid={!!errors.hourEnd}>
                  {hours.slice(1).map((h) => (
                    <option key={h} value={h}>{`${String(h).padStart(2, '0')}:00`}</option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <Field label={t('capacityLabel')} htmlFor="capacity" hint={t('capacityHint')} error={fieldError('maxParticipants')}>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              aria-label={t('decrease')}
              onClick={() => setCapacity(String(Math.max(1, (Number(capacity) || 2) - 1)))}
            >
              <Minus className="h-5 w-5" />
            </Button>
            <Input
              id="capacity"
              value={capacity}
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={3}
              invalid={!!errors.maxParticipants}
              className="text-center text-lg font-bold"
              onChange={(e) => setCapacity(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12"
              aria-label={t('increase')}
              onClick={() => setCapacity(String(Math.min(20, (Number(capacity) || 0) + 1)))}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </Field>

        <div>
          <h2 className="mb-1.5 font-bold">{t('expiryLabel')}</h2>
          <Segmented label={t('expiryLabel')} value={expiryDays} onChange={pickExpiry} options={expiryOptions} />
          <p className="mt-1.5 text-xs text-ink-mute">{isMember ? t('expiryHintMember') : t('expiryHintGuest')}</p>
          {errors.expiryDays && (
            <p role="alert" data-field-error className="mt-1 text-sm text-red-600">
              {fieldError('expiryDays')}
            </p>
          )}
        </div>

        <Field label={t('passcodeLabel')} htmlFor="passcode" optional={t('optional')} hint={t('passcodeHint')} error={fieldError('passcode')}>
          <Input
            id="passcode"
            value={passcode}
            maxLength={8}
            autoComplete="off"
            autoCapitalize="off"
            invalid={!!errors.passcode}
            placeholder="••••"
            onChange={(e) => setPasscode(e.target.value.replace(/\s/g, ''))}
          />
        </Field>
      </Card>

      {!isMember && <p className="px-2 text-center text-xs text-ink-mute">{t('guestNote')}</p>}

      <Button type="submit" size="lg" className="w-full" loading={busy}>
        {t('submit')}
      </Button>
    </form>
  );
}
