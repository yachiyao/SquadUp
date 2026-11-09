import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { RoomClient } from '@/components/room/RoomClient';
import { getEventMeta } from '@/lib/events';

export const dynamic = 'force-dynamic';

type Props = { params: { locale: string; id: string } };

/** Dynamic Open Graph tags so LINE / Discord / Telegram previews show the event name and live headcount. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'og' });
  let meta: Awaited<ReturnType<typeof getEventMeta>> = null;
  try {
    meta = await getEventMeta(params.id);
  } catch {
    // DB hiccup: fall back to generic tags instead of failing the page.
  }
  if (!meta || meta.expired) {
    return { title: t('fallbackTitle'), robots: { index: false, follow: false } };
  }
  const description = meta.isFinalized
    ? t('descriptionFinalized', { host: meta.hostNickname })
    : t('description', { host: meta.hostNickname, count: meta.count, max: meta.max });
  return {
    title: meta.title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title: meta.title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title: meta.title, description },
  };
}

export default function GatheringPage({ params }: Props) {
  return <RoomClient id={params.id} />;
}
