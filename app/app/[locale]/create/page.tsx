import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CreateEventForm } from '@/components/create/CreateEventForm';
import { routing } from '@/i18n/routing';

function localeCreatePath(locale: string): string {
  return locale === routing.defaultLocale ? '/create' : `/${locale}/create`;
}

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'create' });
  const languages = Object.fromEntries(routing.locales.map((l) => [l, localeCreatePath(l)]));

  return {
    title: t('pageTitle'),
    description: t('pageSubtitle'),
    alternates: {
      canonical: localeCreatePath(params.locale),
      languages: { ...languages, 'x-default': '/create' },
    },
  };
}

export default function CreatePage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = useTranslations('create');
  return (
    <div className="space-y-4">
      <div className="px-1">
        <h1 className="text-2xl font-extrabold">{t('pageTitle')}</h1>
        <p className="text-sm text-ink-soft">{t('pageSubtitle')}</p>
      </div>
      <CreateEventForm />
    </div>
  );
}
