import { Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AuthButton } from './AuthButton';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Link } from '@/i18n/navigation';

export function Header({ devLogin }: { devLogin: boolean }) {
  const t = useTranslations('meta');
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/60 bg-cream/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-xl items-center justify-between gap-1 px-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 rounded-xl py-1 pr-2 focus-visible:ring-2 focus-visible:ring-brand-500">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
            <Users className="h-5 w-5" aria-hidden />
          </span>
          <span className="truncate text-lg font-extrabold tracking-tight text-ink">{t('appName')}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <LanguageSwitcher />
          <AuthButton devLogin={devLogin} />
        </div>
      </div>
    </header>
  );
}
