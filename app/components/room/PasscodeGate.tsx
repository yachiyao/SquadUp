'use client';

import { Eye, EyeOff, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useErrorMessage } from '@/lib/useErrorMessage';
import { Link } from '@/i18n/navigation';

interface Props {
  eventId: string;
  title?: string;
  hostNickname?: string;
  participantCount?: number;
  maxParticipants?: number;
  onUnlocked: () => void;
}

/** Non-dismissible PIN / password modal shown before any room details load. */
export function PasscodeGate({ eventId, title, hostNickname, participantCount, maxParticipants, onUnlocked }: Props) {
  const t = useTranslations('passcode');
  const errorMessage = useErrorMessage();
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    try {
      await api(`/api/events/${eventId}/unlock`, { method: 'POST', json: { passcode: value } });
      onUnlocked();
    } catch (err) {
      setError(errorMessage(err));
      setValue('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open>
      <DialogContent hideClose onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
          <Lock className="h-7 w-7" aria-hidden />
        </div>
        <DialogTitle className="text-xl font-extrabold">{t('title')}</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-ink-soft">
          {title ? t('descriptionNamed', { title }) : t('description')}
        </DialogDescription>
        {hostNickname && participantCount !== undefined && maxParticipants !== undefined && (
          <p className="mt-1 text-xs text-ink-mute">
            {t('meta', { host: hostNickname, count: participantCount, max: maxParticipants })}
          </p>
        )}

        <form onSubmit={submit} className="mt-5 space-y-3">
          <div className="relative">
            <Input
              autoFocus
              type={show ? 'text' : 'password'}
              autoComplete="off"
              autoCapitalize="off"
              enterKeyHint="go"
              maxLength={64}
              value={value}
              invalid={!!error}
              aria-label={t('label')}
              placeholder={t('placeholder')}
              onChange={(e) => setValue(e.target.value)}
              className="pr-12 text-center text-lg tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? t('hide') : t('show')}
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-mute hover:bg-stone-100"
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" className="w-full" loading={busy} disabled={!value}>
            {t('unlock')}
          </Button>
          <Link href="/" className="flex h-11 items-center justify-center text-sm font-medium text-ink-mute hover:underline">
            {t('back')}
          </Link>
        </form>
      </DialogContent>
    </Dialog>
  );
}
