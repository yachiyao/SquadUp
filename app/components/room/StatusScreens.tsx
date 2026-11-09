'use client';

import { AlertTriangle, CalendarX2, SearchX, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

function Screen({ icon, title, body, children }: { icon: React.ReactNode; title: string; body?: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto mt-12 flex max-w-sm flex-col items-center rounded-4xl bg-white px-6 py-10 text-center shadow-soft">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-peach-100 text-peach-600">{icon}</div>
      <h1 className="text-xl font-extrabold">{title}</h1>
      {body && <p className="mt-2 text-sm text-ink-soft">{body}</p>}
      <div className="mt-6 flex w-full flex-col gap-2">{children}</div>
    </div>
  );
}

export function ExpiredScreen({ title }: { title?: string }) {
  const t = useTranslations('status');
  return (
    <Screen icon={<CalendarX2 className="h-8 w-8" aria-hidden />} title={t('expiredTitle')} body={title ? t('expiredBodyNamed', { title }) : t('expiredBody')}>
      <Button asChild size="lg">
        <Link href="/create">{t('createNew')}</Link>
      </Button>
    </Screen>
  );
}

export function NotFoundScreen() {
  const t = useTranslations('status');
  return (
    <Screen icon={<SearchX className="h-8 w-8" aria-hidden />} title={t('notFoundTitle')} body={t('notFoundBody')}>
      <Button asChild size="lg" variant="soft">
        <Link href="/">{t('goHome')}</Link>
      </Button>
    </Screen>
  );
}

export function LoadErrorScreen({ offline, onRetry }: { offline: boolean; onRetry: () => void }) {
  const t = useTranslations('status');
  return (
    <Screen
      icon={offline ? <WifiOff className="h-8 w-8" aria-hidden /> : <AlertTriangle className="h-8 w-8" aria-hidden />}
      title={offline ? t('offlineTitle') : t('errorTitle')}
      body={offline ? t('offlineBody') : t('errorBody')}
    >
      <Button size="lg" onClick={onRetry}>
        {t('retry')}
      </Button>
    </Screen>
  );
}

export function RoomSkeleton() {
  return (
    <div className="space-y-4" aria-busy aria-live="polite">
      <div className="h-36 animate-pulse rounded-3xl bg-white shadow-soft" />
      <div className="h-24 animate-pulse rounded-3xl bg-white shadow-soft" />
      <div className="h-96 animate-pulse rounded-3xl bg-white shadow-soft" />
    </div>
  );
}
