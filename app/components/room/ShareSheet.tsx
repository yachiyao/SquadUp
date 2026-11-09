'use client';

import { Check, Copy, Share2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { eventUrl } from '@/lib/utils';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for non-secure contexts / older in-app browsers (LINE, FB…)
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  title: string;
}

export function ShareSheet({ open, onOpenChange, eventId, title }: Props) {
  const t = useTranslations('share');
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const url = typeof window === 'undefined' ? '' : eventUrl(eventId);

  useEffect(() => setCanShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function'), []);
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function onCopy() {
    if (await copyText(url)) {
      setCopied(true);
      toast.success(t('copied'));
    } else {
      toast.error(t('copyFailed'));
    }
  }

  async function onShare() {
    try {
      await navigator.share({ title, text: t('shareText', { title }), url });
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') toast.error(t('shareFailed'));
    }
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Drawer.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-xl flex-col rounded-t-[2rem] bg-cream px-5 pb-safe shadow-float outline-none"
        >
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-stone-300" aria-hidden />
          <Drawer.Title className="mt-4 text-xl font-extrabold">{t('title')}</Drawer.Title>
          <p className="mt-1 text-sm text-ink-mute">{t('subtitle')}</p>

          <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-3">
            <p className="mb-1 text-xs font-semibold text-ink-mute">{t('linkLabel')}</p>
            <input
              readOnly
              value={url}
              aria-label={t('linkLabel')}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full min-w-0 truncate bg-transparent text-base font-medium text-ink outline-none"
            />
          </div>

          <div className="mt-3 grid gap-2">
            <Button size="lg" onClick={onCopy}>
              {copied ? <Check className="h-5 w-5" aria-hidden /> : <Copy className="h-5 w-5" aria-hidden />}
              {copied ? t('copied') : t('copy')}
            </Button>
            {canShare && (
              <Button size="lg" variant="soft" onClick={onShare}>
                <Share2 className="h-5 w-5" aria-hidden />
                {t('share')}
              </Button>
            )}
            <a
              href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center rounded-2xl bg-[#06C755] text-lg font-semibold text-white active:scale-[.98]"
            >
              {t('line')}
            </a>
          </div>
          <Drawer.Close className="mb-2 mt-3 h-12 rounded-2xl text-base font-semibold text-ink-soft hover:bg-stone-100">{t('close')}</Drawer.Close>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
