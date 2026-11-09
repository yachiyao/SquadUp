import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh-TW', 'en', 'ja'],
  defaultLocale: 'zh-TW',
  // zh-TW (default) lives at /g/[id]; en/ja at /en/g/[id], /ja/g/[id].
  // Language is auto-detected (NEXT_LOCALE cookie → Accept-Language, which mirrors navigator.language).
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  'zh-TW': { short: '中', name: '繁體中文' },
  en: { short: 'EN', name: 'English' },
  ja: { short: '日', name: '日本語' },
};

/** BCP-47 tag handed to Intl.* for date formatting. */
export const INTL_LOCALE: Record<Locale, string> = { 'zh-TW': 'zh-TW', en: 'en-US', ja: 'ja-JP' };
