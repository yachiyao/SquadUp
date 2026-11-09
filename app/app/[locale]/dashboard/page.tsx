import { useTranslations } from 'next-intl';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  return (
    <div className="space-y-4">
      <h1 className="px-1 text-2xl font-extrabold">{t('title')}</h1>
      <DashboardClient />
    </div>
  );
}
