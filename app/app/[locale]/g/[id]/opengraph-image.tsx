import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { getEventMeta } from '@/lib/events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const alt = 'Squad Up';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Fetch a subset of Noto Sans TC containing just the glyphs we draw (covers Latin, 繁中 and kana). */
async function loadFont(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@700&text=${encodeURIComponent(text)}`, {
        // An old UA makes Google return TTF, which satori can parse.
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1' },
        signal: AbortSignal.timeout(3000),
      })
    ).text();
    const url = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)?.[1];
    if (!url) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { locale: string; id: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'og' });
  const tm = await getTranslations({ locale: params.locale, namespace: 'meta' });
  const meta = await getEventMeta(params.id).catch(() => null);

  const title = meta && !meta.expired ? meta.title : t('fallbackTitle');
  const host = meta ? t('hostLine', { host: meta.hostNickname }) : '';
  const counter = meta && !meta.expired ? (meta.count >= meta.max ? t('fullLine', { count: meta.count, max: meta.max }) : t('countLine', { count: meta.count, max: meta.max })) : '';
  const app = tm('appName');
  const cta = t('cta');

  const font = await loadFont(`${title}${host}${counter}${app}${cta}0123456789/ ()`);
  const fontFamily = font ? 'NotoSansTC' : 'sans-serif';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#FAF9F5',
          padding: 64,
          fontFamily,
          color: '#2D3748',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <img
            src="https://duk.tw/4pgHe5.png"
            alt="Squad Up"
            width={72}
            height={72}
            style={{ width: 72, height: 72, borderRadius: 24, objectFit: 'cover' }}
          />
          <div style={{ fontSize: 44, fontWeight: 700 }}>{app}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: title.length > 18 ? 68 : 84, fontWeight: 700, lineHeight: 1.15, display: 'flex' }}>{title.slice(0, 48)}</div>
          {host && <div style={{ fontSize: 36, color: '#4A5568', display: 'flex' }}>{host}</div>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {counter ? (
            <div
              style={{
                display: 'flex',
                fontSize: 38,
                fontWeight: 700,
                background: meta && meta.count >= meta.max ? '#FFEEDB' : '#DDF1E5',
                color: meta && meta.count >= meta.max ? '#9A5519' : '#266549',
                padding: '16px 36px',
                borderRadius: 999,
              }}
            >
              {counter}
            </div>
          ) : (
            <div style={{ display: 'flex' }} />
          )}
          <div style={{ display: 'flex', fontSize: 34, color: '#2E7D5B', fontWeight: 700 }}>{cta}</div>
        </div>
      </div>
    ),
    {
      ...size,
      ...(font ? { fonts: [{ name: 'NotoSansTC', data: font, weight: 700 as const, style: 'normal' as const }] } : {}),
    },
  );
}
