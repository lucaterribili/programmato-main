import type { MetadataRoute } from 'next';
import config from '@/lib/config';
import { apiGet } from '@/lib/services/backend';

export const revalidate = 3600;

interface SitemapEntry {
  slug: string;
  parentSlug?: string | null;
  ancestorSlug?: string | null;
  lastmod?: string | null;
}
interface BackendSitemap {
  categories?: SitemapEntry[];
  posts?: SitemapEntry[];
  tutorials?: SitemapEntry[];
}

const STATIC_PATHS = ['', '/blog', '/tutorial', '/chi-siamo', '/contatti', '/privacy', '/cookie'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = config.siteUrl.replace(/\/$/, '');
  const entry = (path: string, lastmod?: string | null): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    ...(lastmod ? { lastModified: new Date(lastmod) } : {}),
  });

  const urls = STATIC_PATHS.map((p) => entry(p));

  try {
    const data = await apiGet<BackendSitemap>('/sitemap');
    for (const c of data.categories ?? []) urls.push(entry(`/blog?category=${c.slug}`));
    for (const p of data.posts ?? []) urls.push(entry(`/blog/${p.slug}`, p.lastmod));
    for (const t of data.tutorials ?? []) {
      const book = t.parentSlug ? t.ancestorSlug ?? t.parentSlug : null;
      urls.push(entry(book ? `/tutorial/${book}/${t.slug}` : `/tutorial/${t.slug}`, t.lastmod));
    }
  } catch (error) {
    // Backend non raggiungibile: meglio una sitemap parziale (ISR la rigenera) che nessuna.
    console.error('Sitemap: backend non disponibile', error);
  }
  return urls;
}
