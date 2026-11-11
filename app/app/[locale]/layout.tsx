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

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'meta' });
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
    title: { default: t('title'), template: `%s | ${t('appName')}` },
    description: t('description'),
    applicationName: t('appName'),
    icons: {
      icon: 'https://duk.tw/4pgHe5.png',
      shortcut: 'https://duk.tw/4pgHe5.png',
      apple: 'https://duk.tw/4pgHe5.png',
    },
    openGraph: { siteName: t('appName'), title: t('title'), description: t('description'), type: 'website' },
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
