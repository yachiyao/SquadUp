'use client';

import { LayoutList, LogOut } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Link } from '@/i18n/navigation';

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.5 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.4 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.6l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
    </svg>
  );
}

export function AuthButton({ devLogin }: { devLogin: boolean }) {
  const t = useTranslations('nav');
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [devName, setDevName] = useState('');

  const callbackUrl = typeof window === 'undefined' ? '/' : window.location.href;

  if (status === 'loading' && !session) {
    return <div className="h-11 w-24 animate-pulse rounded-full bg-stone-100" aria-hidden />;
  }

  if (!session?.user) {
    if (devLogin) {
      return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full px-3.5">
              <GoogleG className="h-4 w-4" />
              {t('signIn')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-3">
            <Button variant="outline" className="w-full" onClick={() => signIn('google', { callbackUrl })}>
              <GoogleG className="h-4 w-4" /> {t('signInGoogle')}
            </Button>
            <form
              className="space-y-2 border-t border-stone-100 pt-3"
              onSubmit={async (e) => {
                e.preventDefault();
                await signIn('dev', { name: devName || 'Dev User', redirect: false });
                window.location.reload();
              }}
            >
              <p className="text-xs text-ink-mute">Dev login (development only)</p>
              <Input value={devName} onChange={(e) => setDevName(e.target.value)} placeholder="Dev User" />
              <Button type="submit" variant="soft" className="w-full">
                Dev login
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      );
    }
    return (
      <Button variant="outline" size="sm" className="rounded-full px-3.5" onClick={() => signIn('google', { callbackUrl })}>
        <GoogleG className="h-4 w-4" />
        {t('signIn')}
      </Button>
    );
  }

  const user = session.user;
  const initial = (user.name ?? user.email ?? '?').trim().charAt(0).toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={t('account')} className="flex h-11 w-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-brand-500">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" referrerPolicy="no-referrer" className="h-9 w-9 rounded-full object-cover ring-2 ring-white" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 font-bold text-white">{initial}</span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-60 space-y-1 p-2">
        <div className="px-3 py-2">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-ink-mute">{user.email}</p>
        </div>
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="flex h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-stone-50"
        >
          <LayoutList className="h-4 w-4 text-brand-600" /> {t('myEvents')}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-ink-soft hover:bg-stone-50"
        >
          <LogOut className="h-4 w-4" /> {t('signOut')}
        </button>
      </PopoverContent>
    </Popover>
  );
}
