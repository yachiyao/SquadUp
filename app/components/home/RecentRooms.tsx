'use client';

import { ChevronRight, History, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Link } from '@/i18n/navigation';
import { fetcher } from '@/lib/api';
import { forgetRoom, getRecentRooms, type RecentRoom } from '@/lib/clientStorage';
import type { MyEventSummary } from '@/lib/events';

/** Rooms opened on this device (localStorage) merged with signed-in member cloud history. */
export function RecentRooms() {
  const t = useTranslations('home');
  const { data: session } = useSession();
  const member = !!session?.user;
  const [localRooms, setLocalRooms] = useState<RecentRoom[]>([]);

  useEffect(() => setLocalRooms(getRecentRooms()), []);

  const cloudEvents = useSWR<{ hosted: MyEventSummary[]; joined: MyEventSummary[] }>(
    member ? '/api/me/events' : null,
    fetcher,
  );

  const { rooms, localIds } = useMemo(() => {
    const ids = new Set(localRooms.map((r) => r.id));
    if (!member || !cloudEvents.data) {
      return { rooms: localRooms, localIds: ids };
    }
    const merged: RecentRoom[] = [...localRooms];
    const seen = new Set(ids);
    const cloudList = [...cloudEvents.data.hosted, ...cloudEvents.data.joined].filter((e) => !e.expired);
    for (const ev of cloudList) {
      if (seen.has(ev.id)) continue;
      seen.add(ev.id);
      merged.push({ id: ev.id, title: ev.title, at: 0 });
      if (merged.length >= 8) break;
    }
    return { rooms: merged.slice(0, 8), localIds: ids };
  }, [localRooms, member, cloudEvents.data]);

  if (rooms.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white p-4 shadow-soft" aria-labelledby="recent-title">
      <h2 id="recent-title" className="mb-2 flex items-center gap-2 font-bold">
        <History className="h-5 w-5 text-peach-500" aria-hidden />
        {t('recentTitle')}
      </h2>
      <ul className="divide-y divide-stone-100">
        {rooms.map((r) => (
          <li key={r.id} className="flex items-center">
            <Link href={`/g/${r.id}`} className="flex min-h-[52px] min-w-0 flex-1 items-center justify-between gap-2 py-2">
              <span className="truncate font-medium">{r.title}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-stone-400" aria-hidden />
            </Link>
            {localIds.has(r.id) && (
              <button
                type="button"
                aria-label={t('forget')}
                onClick={() => {
                  forgetRoom(r.id);
                  setLocalRooms(getRecentRooms());
                }}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
