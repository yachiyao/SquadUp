'use client';

import { ArrowRight, KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from '@/i18n/navigation';
import { extractEventId } from '@/lib/utils';

/** "Enter a gathering code" – accepts a bare code or a pasted share link. */
export function JoinByCode() {
  const t = useTranslations('home');
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const id = extractEventId(value);
    if (!id) return setError(true);
    router.push(`/g/${id}`);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-4 shadow-soft">
      <label htmlFor="join-code" className="mb-2 flex items-center gap-2 font-bold">
        <KeyRound className="h-5 w-5 text-brand-600" aria-hidden />
        {t('joinTitle')}
      </label>
      <div className="flex gap-2">
        <Input
          id="join-code"
          value={value}
          invalid={error}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          placeholder={t('joinPlaceholder')}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
        />
        <Button type="submit" size="icon" className="h-12 w-12 shrink-0" aria-label={t('joinCta')}>
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {t('joinInvalid')}
        </p>
      )}
    </form>
  );
}
