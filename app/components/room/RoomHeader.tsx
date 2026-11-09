'use client';

import { Clock, Crown, Share2, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Badge, Card } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDuration } from '@/lib/dates';
import { useNow } from '@/hooks/useNow';
import type { RoomData } from '@/types/room';

/** Title, host, live capacity tracker and expiry countdown. */
export function RoomHeader({ room, onShare }: { room: RoomData; onShare: () => void }) {
  const t = useTranslations('room');
  const now = useNow(30_000);
  const msLeft = new Date(room.expiresAt).getTime() - now;
  const { days, hours, minutes } = formatDuration(msLeft);
  const full = room.participantCount >= room.maxParticipants;
  const urgent = msLeft < 24 * 3600_000;

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-extrabold leading-tight text-ink">{room.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-soft">
            <Crown className="h-4 w-4 shrink-0 text-peach-500" aria-hidden />
            <span className="truncate">{t('hostedBy', { name: room.hostNickname })}</span>
          </p>
        </div>
        <Button variant="soft" size="icon" onClick={onShare} aria-label={t('share')} className="shrink-0">
          <Share2 className="h-5 w-5" aria-hidden />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={full ? 'peach' : 'brand'} aria-live="polite">
          <Users className="h-3.5 w-3.5" aria-hidden />
          {full
            ? t('full', { count: room.participantCount, max: room.maxParticipants })
            : t('participants', { count: room.participantCount, max: room.maxParticipants })}
        </Badge>
        <Badge tone={urgent ? 'peach' : 'stone'}>
          <Clock className="h-3.5 w-3.5" aria-hidden />
          {days > 0 ? t('expiresInDays', { days, hours }) : t('expiresInHours', { hours, minutes })}
        </Badge>
      </div>
    </Card>
  );
}
