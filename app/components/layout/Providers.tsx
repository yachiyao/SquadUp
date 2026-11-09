'use client';

import type { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { getSavedLocale } from '@/lib/clientStorage';
import { routing } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';

/**
 * First visit: the middleware already picked a locale from NEXT_LOCALE / Accept-Language
 * (= navigator.language). If the visitor previously chose a language manually (localStorage),
 * honour that choice on later visits.
 */
function LocaleSync() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = getSavedLocale();
    if (saved && saved !== locale && (routing.locales as readonly string[]).includes(saved)) {
      router.replace(pathname + window.location.search, { locale: saved as (typeof routing.locales)[number] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

export function Providers({ session, children }: { session: Session | null; children: React.ReactNode }) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus>
      <LocaleSync />
      {children}
      <Toaster
        position="top-center"
        offset={12}
        toastOptions={{
          classNames: {
            toast: '!rounded-2xl !font-sans !text-sm !shadow-md !border-stone-100',
          },
        }}
      />
    </SessionProvider>
  );
}
