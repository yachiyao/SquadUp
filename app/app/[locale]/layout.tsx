import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Header } from '@/components/layout/Header';
import { Providers } from '@/components/layout/Providers';
import { getSession } from '@/lib/auth';
import { routing } from '@/i18n/routing';
import '../globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FAF9F5',
};

const OG_LOCALE: Record<string, string> = {
  'zh-TW': 'zh_TW',
  en: 'en_US',
  ja: 'ja_JP',
};

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  const ogLocale = OG_LOCALE[params.locale] ?? 'zh_TW';
  const alternateLocale = Object.values(OG_LOCALE).filter((l) => l !== ogLocale);

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
    title: { default: t('title'), template: `%s | ${t('appName')}` },
    description: t('description'),
    applicationName: t('appName'),
    keywords: ['揪一下', 'Squad Up', 'スコッドアップ', '線上揪團', '聚會協調', '約時間工具', 'group scheduling'],
    authors: [{ name: 'Cassell Teng' }],
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    icons: {
      icon: 'https://duk.tw/4pgHe5.png',
      shortcut: 'https://duk.tw/4pgHe5.png',
      apple: 'https://duk.tw/4pgHe5.png',
    },
    openGraph: {
      siteName: t('appName'),
      title: t('title'),
      description: t('description'),
      type: 'website',
      locale: ogLocale,
      alternateLocale,
      images: [{ url: 'https://duk.tw/4pgHe5.png', alt: t('appName') }],
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('description'),
      images: ['https://duk.tw/4pgHe5.png'],
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const locale = routing.locales.find((l) => l === params.locale);
  if (!locale) notFound();

  const [messages, session] = await Promise.all([getMessages(), getSession()]);
  const devLogin = process.env.NODE_ENV !== 'production' && process.env.DEV_LOGIN === 'true';

  return (
    <html lang={locale}>
      <body className="font-sans">
        <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
          <Providers session={session}>
            <Header devLogin={devLogin} />
            <main className="mx-auto w-full max-w-xl px-4 pb-24 pt-4">{children}</main>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
