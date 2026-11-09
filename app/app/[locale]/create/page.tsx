import { useTranslations } from 'next-intl';
import { CreateEventForm } from '@/components/create/CreateEventForm';

export default function CreatePage() {
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
