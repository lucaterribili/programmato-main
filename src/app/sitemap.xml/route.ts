import { LOCALES } from '@/lib/i18n/config';
import { buildLocaleSitemap } from '@/lib/sitemap/build';
import { sitemapUrl } from '@/lib/sitemap/locale-route';
import { xmlResponse } from '@/lib/sitemap/response';
import { renderSitemapIndex } from '@/lib/sitemap/xml';

export const revalidate = 3600;

/**
 * Indice delle sitemap: una per lingua. Da Search Console si può inviare questo indirizzo oppure ognuna delle tre
 * (`/sitemap-it.xml`, `/sitemap-en.xml`, `/sitemap-ru.xml`).
 */
export async function GET() {
  const children = await Promise.all(
    LOCALES.map(async (locale) => {
      const { lastmod } = await buildLocaleSitemap(locale);
      return { loc: sitemapUrl(locale), ...(lastmod ? { lastmod } : {}) };
    }),
  );
  return xmlResponse(renderSitemapIndex(children));
}
