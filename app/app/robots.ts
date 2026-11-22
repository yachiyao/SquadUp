import type { MetadataRoute } from 'next';
import { appOrigin } from '@/lib/utils';

export default function robots(): MetadataRoute.Robots {
  const base = appOrigin().replace(/\/$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/en', '/ja', '/create', '/en/create', '/ja/create'],
        disallow: ['/api/', '/dashboard', '/en/dashboard', '/ja/dashboard', '/g/', '/en/g/', '/ja/g/'],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
