'use client';

import { Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { saveLocale } from '@/lib/clientStorage';
import { LOCALE_LABELS, routing, type Locale } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function choose(next: Locale) {
    saveLocale(next); // remembered across visits (see LocaleSync); next-intl also sets NEXT_LOCALE
    setOpen(false);
    if (next !== locale) router.replace(pathname + window.location.search, { locale: next });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label={t('language')}
        className="flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-ink-soft hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        <Globe className="h-[18px] w-[18px]" aria-hidden />
        {LOCALE_LABELS[locale].short}
      </PopoverTrigger>
      <PopoverContent className="w-44 p-1.5">
        <ul role="listbox" aria-label={t('language')}>
          {routing.locales.map((l) => (
            <li key={l}>
              <button
                role="option"
                aria-selected={l === locale}
                onClick={() => choose(l)}
                lang={l}
                className={cn(
                  'flex h-11 w-full items-center rounded-xl px-3 text-left text-sm font-medium hover:bg-stone-50',
                  l === locale && 'bg-brand-50 text-brand-700',
                )}
              >
                {LOCALE_LABELS[l].name}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
