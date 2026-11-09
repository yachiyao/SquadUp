'use client';

import { Bookmark, ChevronRight, Plus, Trash2, Users } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { toast } from 'sonner';
import { Badge, Card } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { api, fetcher } from '@/lib/api';
import type { MyEventSummary } from '@/lib/events';
import { useErrorMessage } from '@/lib/useErrorMessage';
import { cn } from '@/lib/utils';

interface Spot {
  id: string;
  name: string;
  mapUrl: string | null;
  notes: string | null;
}

function EventRow({ e }: { e: MyEventSummary }) {
  const t = useTranslations('dashboard');
  return (
    <li>
      <Link
        href={`/g/${e.id}`}
        className={cn('flex min-h-[64px] items-center gap-3 py-2.5', e.expired && 'opacity-60')}
        aria-label={e.title}
      >
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">{e.title}</span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone={e.count >= e.max ? 'peach' : 'brand'} className="px-2 py-0.5">
              <Users className="h-3 w-3" aria-hidden /> {e.count}/{e.max}
            </Badge>
            {e.isFinalized && <Badge tone="brand" className="px-2 py-0.5">{t('finalized')}</Badge>}
            {e.expired && <Badge tone="stone" className="px-2 py-0.5">{t('expired')}</Badge>}
          </span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
      </Link>
    </li>
  );
}

export function DashboardClient() {
  const t = useTranslations('dashboard');
  const errorMessage = useErrorMessage();
  const { data: session, status } = useSession();
  const member = !!session?.user;

  const events = useSWR<{ hosted: MyEventSummary[]; joined: MyEventSummary[] }>(member ? '/api/me/events' : null, fetcher, {
    refreshInterval: 20_000,
  });
  const spots = useSWR<{ spots: Spot[] }>(member ? '/api/me/spots' : null, fetcher);

  if (status === 'loading') return <div className="h-40 animate-pulse rounded-3xl bg-white shadow-soft" aria-busy />;

  if (!member) {
    return (
      <Card className="text-center">
        <p className="mb-4 text-ink-soft">{t('signInPrompt')}</p>
        <Button size="lg" onClick={() => signIn('google', { callbackUrl: window.location.href })}>
          {t('signIn')}
        </Button>
      </Card>
    );
  }

  async function removeSpot(id: string) {
    try {
      await api('/api/me/spots', { method: 'DELETE', json: { id } });
      await spots.mutate();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  const hosted = events.data?.hosted ?? [];
  const joined = events.data?.joined ?? [];

  return (
    <div className="space-y-4">
      <Link href="/create" className={cn(buttonVariants({ size: 'lg' }), 'w-full')}>
        <Plus className="h-5 w-5" aria-hidden />
        {t('create')}
      </Link>

      {events.error && (
        <p role="alert" className="rounded-2xl bg-peach-100 px-4 py-3 text-sm text-peach-700">
          {errorMessage(events.error)}
        </p>
      )}

      <Card aria-labelledby="hosted-title">
        <h2 id="hosted-title" className="mb-1 text-lg font-bold">
          {t('hosted')}
        </h2>
        {events.isLoading ? (
          <div className="h-16 animate-pulse rounded-2xl bg-stone-50" />
        ) : hosted.length ? (
          <ul className="divide-y divide-stone-100">{hosted.map((e) => <EventRow key={e.id} e={e} />)}</ul>
        ) : (
          <p className="py-4 text-sm text-ink-mute">{t('emptyHosted')}</p>
        )}
      </Card>

      <Card aria-labelledby="joined-title">
        <h2 id="joined-title" className="mb-1 text-lg font-bold">
          {t('joined')}
        </h2>
        {events.isLoading ? (
          <div className="h-16 animate-pulse rounded-2xl bg-stone-50" />
        ) : joined.length ? (
          <ul className="divide-y divide-stone-100">{joined.map((e) => <EventRow key={e.id} e={e} />)}</ul>
        ) : (
          <p className="py-4 text-sm text-ink-mute">{t('emptyJoined')}</p>
        )}
      </Card>

      <Card aria-labelledby="spots-title">
        <h2 id="spots-title" className="mb-1 flex items-center gap-2 text-lg font-bold">
          <Bookmark className="h-5 w-5 text-peach-500" aria-hidden />
          {t('spots')}
        </h2>
        <p className="mb-2 text-xs text-ink-mute">{t('spotsHint')}</p>
        {spots.data?.spots.length ? (
          <ul className="divide-y divide-stone-100">
            {spots.data.spots.map((s) => (
              <li key={s.id} className="flex min-h-[52px] items-center gap-2">
                <span className="min-w-0 flex-1 truncate font-medium">{s.name}</span>
                <Button variant="ghost" size="icon" aria-label={t('deleteSpot', { name: s.name })} onClick={() => removeSpot(s.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-3 text-sm text-ink-mute">{t('emptySpots')}</p>
        )}
      </Card>
    </div>
  );
}
