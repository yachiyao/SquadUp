import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'dashboard' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default function DashboardPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = useTranslations('dashboard');
  return (
    <div className="space-y-4">
      <h1 className="px-1 text-2xl font-extrabold">{t('title')}</h1>
      <DashboardClient />
    </div>
  );
}
