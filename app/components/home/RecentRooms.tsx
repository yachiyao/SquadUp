'use client';

import { ChevronRight, History, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { forgetRoom, getRecentRooms, type RecentRoom } from '@/lib/clientStorage';

/** Rooms opened on this device (localStorage) for one-tap re-entry. */
export function RecentRooms() {
  const t = useTranslations('home');
  const [rooms, setRooms] = useState<RecentRoom[]>([]);

  useEffect(() => setRooms(getRecentRooms()), []);

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
            <button
              type="button"
              aria-label={t('forget')}
              onClick={() => {
                forgetRoom(r.id);
                setRooms(getRecentRooms());
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
