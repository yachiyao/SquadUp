import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { appOrigin } from '@/lib/utils';

function localizedUrl(base: string, locale: string, routePath: string): string {
  const prefix = locale === routing.defaultLocale ? '' : `/${locale}`;
  const cleanPath = routePath === '/' ? '' : routePath;
  return `${base}${prefix}${cleanPath}` || `${base}/`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appOrigin().replace(/\/$/, '');
  const routes = ['/', '/create'];
  const lastModified = new Date();

  return routes.flatMap((routePath) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, localizedUrl(base, locale, routePath)]),
    );
    return routing.locales.map((locale) => ({
      url: localizedUrl(base, locale, routePath),
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: routePath === '/' ? 1.0 : 0.8,
      alternates: { languages },
    }));
  });
}
