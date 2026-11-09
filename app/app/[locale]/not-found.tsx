import { useTranslations } from 'next-intl';
import { buttonVariants } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

export default function NotFound() {
  const t = useTranslations('status');
  return (
    <div className="mx-auto mt-12 max-w-sm rounded-4xl bg-white px-6 py-10 text-center shadow-soft">
      <h1 className="text-xl font-extrabold">{t('notFoundTitle')}</h1>
      <p className="mt-2 text-sm text-ink-soft">{t('notFoundBody')}</p>
      <Link href="/" className={cn(buttonVariants({ size: 'lg', variant: 'soft' }), 'mt-6 w-full')}>
        {t('goHome')}
      </Link>
    </div>
  );
}
