'use client';

import { useTranslations } from 'next-intl';
import { memo, useMemo } from 'react';
import { calendarEnd, toDateStr } from '@/lib/dates';
import { datesWithSelection } from '@/lib/draft';
import { dateOverlaps, type VoteRow } from '@/lib/scoring';
import type { SlotConfig } from '@/lib/slots';
import { useFormatters } from '@/lib/useFormatters';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';

/** 5-step sage ramp. Level 0 (nobody) is a neutral surface, not part of the ramp. */
const RAMP = [
  { bg: '#DDF1E5', fg: '#194231' },
  { bg: '#B4DFC6', fg: '#194231' },
  { bg: '#7CC29E', fg: '#12301F' },
  { bg: '#3F9C71', fg: '#FFFFFF' },
  { bg: '#1F5C42', fg: '#FFFFFF' },
] as const;

export function heatLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 | 5 {
  if (count <= 0 || max <= 0) return 0;
  // With a single voter everything is "max"; keep it a friendly mid-green instead of the deepest shade.
  const t = max === 1 ? 0.5 : count / max;
  return Math.max(1, Math.min(5, Math.ceil(t * 5))) as 1 | 2 | 3 | 4 | 5;
}

interface Props {
  votes: VoteRow[];
  config: SlotConfig;
  /** Current user's (draft) selection – keys "date|slot". */
  mine: Set<string>;
  finalDate?: string | null;
  onSelectDate: (date: string) => void;
}

function monthsInRange(today: Date, end: Date): Date[] {
  const out: Date[] = [];
  const cursor = new Date(today.getFullYear(), today.getMonth(), 1);
  while (cursor <= end) {
    out.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return out;
}

function HeatmapCalendarImpl({ votes, config, mine, finalDate, onSelectDate }: Props) {
  const t = useTranslations('calendar');
  const f = useFormatters();
  const now = useNow(60_000);

  // "Today" in the viewer's own timezone; refreshed so the grid rolls over at midnight.
  const todayStr = toDateStr(new Date(now));
  const today = useMemo(() => {
    const [y, m, d] = todayStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [todayStr]);
  const endStr = toDateStr(calendarEnd(today));

  const { map: overlaps, max } = useMemo(() => dateOverlaps(votes, config), [votes, config]);
  const mineDates = useMemo(() => datesWithSelection(mine), [mine]);
  const months = useMemo(() => monthsInRange(today, calendarEnd(today)), [today]);
  const weekdays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => f.weekdayNarrow(new Date(2023, 0, 1 + i))), // 2023-01-01 is a Sunday
    [f],
  );

  return (
    <div>
      <div className="space-y-5">
        {months.map((monthStart) => {
          const year = monthStart.getFullYear();
          const month = monthStart.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const lead = monthStart.getDay();
          return (
            <div key={`${year}-${month}`}>
              <h3 className="mb-2 px-1 text-base font-bold text-ink">{f.monthLabel(monthStart)}</h3>
              <div className="grid grid-cols-7 gap-[3px]" role="grid" aria-label={f.monthLabel(monthStart)}>
                {weekdays.map((w, i) => (
                  <div key={i} className="pb-1 text-center text-xs font-medium text-ink-mute" aria-hidden>
                    {w}
                  </div>
                ))}
                {Array.from({ length: lead }, (_, i) => (
                  <div key={`b${i}`} aria-hidden />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const inRange = date >= todayStr && date <= endStr;
                  const info = overlaps.get(date);
                  const level = heatLevel(info?.count ?? 0, max);
                  const color = level ? RAMP[level - 1] : null;
                  const isToday = date === todayStr;
                  const isFinal = finalDate === date;
                  const mark = mineDates.has(date);

                  return (
                    <button
                      key={date}
                      type="button"
                      disabled={!inRange}
                      onClick={() => onSelectDate(date)}
                      aria-label={t('cellLabel', { date: f.dateLong(date), count: info?.count ?? 0 })}
                      style={color ? { backgroundColor: color.bg, color: color.fg } : undefined}
                      className={cn(
                        'relative flex aspect-square min-h-[44px] flex-col items-center justify-center rounded-xl text-sm font-semibold transition active:scale-95',
                        !color && 'bg-stone-50 text-ink-soft',
                        !inRange && 'cursor-default bg-transparent text-stone-300 active:scale-100',
                        isToday && 'ring-2 ring-peach-400 ring-offset-1',
                        isFinal && 'ring-2 ring-peach-500 ring-offset-2',
                        inRange && 'focus-visible:ring-2 focus-visible:ring-brand-600',
                      )}
                    >
                      <span className="leading-none">{day}</span>
                      {info && inRange && <span className="mt-0.5 text-[10px] font-bold leading-none opacity-80">{info.count}</span>}
                      {mark && inRange && (
                        <span aria-hidden className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-peach-400 ring-1 ring-white/80" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 px-1 text-xs text-ink-mute">
        <div className="flex items-center gap-1.5">
          <span>{t('legendFew')}</span>
          <span className="h-3.5 w-3.5 rounded bg-stone-100" aria-hidden />
          {RAMP.map((r) => (
            <span key={r.bg} className="h-3.5 w-3.5 rounded" style={{ backgroundColor: r.bg }} aria-hidden />
          ))}
          <span>{t('legendMany')}</span>
        </div>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-peach-400" aria-hidden />
          {t('legendMine')}
        </span>
      </div>
    </div>
  );
}

export const HeatmapCalendar = memo(HeatmapCalendarImpl);
