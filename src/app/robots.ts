import type { MetadataRoute } from 'next';
import { LOCALES } from '@/lib/i18n/config';
import { SECTIONS, localePrefix } from '@/lib/i18n/paths';

export default function robots(): MetadataRoute.Robots {
  const base = (process.env.NEXT_PUBLIC_SITE_URL || 'https://programmato.it').replace(/\/+$/, '');
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // la ricerca interna, in ogni lingua (/search, /en/search, /ru/poisk)
        disallow: LOCALES.map((locale) => `${localePrefix(locale)}/${SECTIONS.search[locale]}`),
      },
    ],
    // l'indice e, per chi legge solo questo file, una sitemap per lingua
    sitemap: [`${base}/sitemap.xml`, ...LOCALES.map((locale) => `${base}/sitemap-${locale}.xml`)],
  };
}
