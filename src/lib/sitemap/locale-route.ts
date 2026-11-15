import config from '@/lib/config';
import type { Locale } from '@/lib/i18n/config';
import { buildLocaleSitemap } from './build';
import { xmlResponse } from './response';
import { renderUrlset } from './xml';

/** La sitemap di una lingua (`/sitemap-it.xml`, `/sitemap-en.xml`, `/sitemap-ru.xml`). */
export async function localeSitemapResponse(locale: Locale) {
  const { urls } = await buildLocaleSitemap(locale);
  return xmlResponse(renderUrlset(urls));
}

export const sitemapUrl = (locale: Locale) => `${config.siteUrl.replace(/\/+$/, '')}/sitemap-${locale}.xml`;
