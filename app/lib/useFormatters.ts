'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';
import { parseDateStr } from './dates';
import { INTL_LOCALE, type Locale } from '@/i18n/routing';
import { slotRange } from './slots';

/** Locale-aware date / slot formatting. Dates are floating calendar dates, formatted in local time. */
export function useFormatters() {
  const locale = useLocale() as Locale;
  const t = useTranslations('slots');
  const intl = INTL_LOCALE[locale];

  return useMemo(() => {
    const short = new Intl.DateTimeFormat(intl, { month: 'short', day: 'numeric', weekday: 'short' });
    const long = new Intl.DateTimeFormat(intl, { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    const month = new Intl.DateTimeFormat(intl, { year: 'numeric', month: 'long' });
    const weekdayNarrow = new Intl.DateTimeFormat(intl, { weekday: 'narrow' });

    const slotLabel = (slot: string): string => {
      switch (slot) {
        case 'ALL_DAY':
          return t('ALL_DAY');
        case 'MORNING':
          return t('MORNING');
        case 'AFTERNOON':
          return t('AFTERNOON');
        case 'EVENING':
          return t('EVENING');
        default: {
          const r = slotRange(slot);
          return r ? `${r.start}–${r.end}` : slot;
        }
      }
    };
    const slotHint = (slot: string): string | null => {
      if (slot === 'ALL_DAY') return null;
      const r = slotRange(slot);
      return r && ['MORNING', 'AFTERNOON', 'EVENING'].includes(slot) ? `${r.start}–${r.end}` : null;
    };

    return {
      locale,
      intl,
      dateShort: (d: string) => short.format(parseDateStr(d)),
      dateLong: (d: string) => long.format(parseDateStr(d)),
      monthLabel: (d: Date) => month.format(d),
      weekdayNarrow: (d: Date) => weekdayNarrow.format(d),
      slotLabel,
      slotHint,
    };
  }, [intl, locale, t]);
}
