import config from '@/lib/config';
import { HREFLANG, LOCALES, isLocale, type Locale } from '@/lib/i18n/config';
import { localizedPath } from '@/lib/i18n/paths';
import { fetchSitemapEntries } from './fetch';
import type { EntryType, SitemapAlternate, SitemapEntry } from './types';
import type { RenderedUrl } from './xml';

/** Le pagine fisse (percorsi interni): esistono in tutte le lingue. `/search` non entra: non va indicizzata. */
const STATIC_PATHS = ['/', '/blog', '/tutorial', '/chi-siamo', '/contatti', '/privacy', '/cookie'];

const SITE = () => config.siteUrl.replace(/\/+$/, '');

type PathParts = Pick<SitemapEntry | SitemapAlternate, 'slug' | 'parentSlug' | 'ancestorSlug'>;

/** Il percorso interno (italiano) di una voce; null se lo slug non è utilizzabile in un URL. */
export function internalPathOf(type: EntryType, entry: PathParts): string | null {
  const slug = entry.slug?.trim();
  if (!slug || /[/?#]/.test(slug)) return null;
  const encoded = encodeURIComponent(slug);
  switch (type) {
    case 'post':
      return `/blog/${encoded}`;
    case 'category':
      return `/blog?category=${encoded}`;
    case 'tutorial': {
      const book = entry.parentSlug ? entry.ancestorSlug ?? entry.parentSlug : null;
      return book ? `/tutorial/${encodeURIComponent(book)}/${encoded}` : `/tutorial/${encoded}`;
    }
  }
}

function normalizeHost(host: string): string {
  return host.toLowerCase().replace(/\.$/, '').replace(/^www\./, '');
}

/**
 * L'URL da mettere in sitemap per una voce. Il canonical editoriale (impostato per la singola lingua nel pannello) vince
 * sull'URL naturale quando punta alla stessa pagina del sito; se punta altrove (altro dominio, URL non valido) la voce non
 * è quella canonica e non va in sitemap. Il backend classifica solo l'host: il confronto sul percorso spetta qui.
 */
export function resolveLoc(entry: SitemapEntry, naturalPath: string): string | null {
  const natural = `${SITE()}${naturalPath}`;
  if (!entry.canonical?.trim() || entry.canonicalHost === 'NONE') return natural;
  if (entry.canonicalHost !== 'SELF') return null;
  try {
    const raw = entry.canonical.trim();
    const url = new URL(raw.startsWith('//') ? `https:${raw}` : raw, `${SITE()}/`);
    if (normalizeHost(url.host) !== normalizeHost(new URL(SITE()).host)) return null;
    return `${SITE()}${url.pathname === '/' ? '' : url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function toIso(value?: string | null): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

/** Le varianti linguistiche di una pagina come `hreflang`, con `x-default` sull'italiano (o sulla prima disponibile). */
export function hreflangLinks(pathsByLocale: Partial<Record<Locale, string>>): Array<{ hreflang: string; href: string }> {
  const links: Array<{ hreflang: string; href: string }> = [];
  for (const locale of LOCALES) {
    const path = pathsByLocale[locale];
    if (path) links.push({ hreflang: HREFLANG[locale], href: `${SITE()}${localizedPath(locale, path)}` });
  }
  const fallback = pathsByLocale.it ?? Object.values(pathsByLocale)[0];
  const fallbackLocale: Locale = pathsByLocale.it ? 'it' : (LOCALES.find((l) => pathsByLocale[l]) ?? 'it');
  if (fallback) links.push({ hreflang: 'x-default', href: `${SITE()}${localizedPath(fallbackLocale, fallback)}` });
  return links;
}

/** Le varianti di una voce: lei stessa più quelle in `alternates`, ciascuna col proprio slug. */
function entryVariants(type: EntryType, entry: SitemapEntry): Partial<Record<Locale, string>> {
  const variants: Partial<Record<Locale, string>> = {};
  const self = internalPathOf(type, entry);
  if (isLocale(entry.locale) && self) variants[entry.locale] = self;
  for (const alternate of entry.alternates ?? []) {
    if (!isLocale(alternate.locale)) continue;
    const path = internalPathOf(type, alternate);
    if (path) variants[alternate.locale] = path;
  }
  return variants;
}

const TYPE_CONFIG: Record<EntryType, { changefreq: RenderedUrl['changefreq']; priority: number }> = {
  post: { changefreq: 'weekly', priority: 0.8 },
  tutorial: { changefreq: 'monthly', priority: 0.8 },
  category: { changefreq: 'weekly', priority: 0.6 },
};

export interface LocaleSitemap {
  urls: RenderedUrl[];
  lastmod?: string;
}

/**
 * La sitemap di una lingua: pagine fisse + contenuti che esistono in quella lingua, ognuno con i suoi `hreflang`.
 * Se il backend non risponde si serve comunque la parte fissa (meglio una sitemap parziale che nessuna).
 */
export async function buildLocaleSitemap(locale: Locale): Promise<LocaleSitemap> {
  const urls = new Map<string, RenderedUrl>();

  for (const path of STATIC_PATHS) {
    const variants = Object.fromEntries(LOCALES.map((l) => [l, path])) as Record<Locale, string>;
    const loc = `${SITE()}${localizedPath(locale, path)}`;
    urls.set(loc, {
      loc,
      changefreq: path === '/' ? 'daily' : 'monthly',
      priority: path === '/' ? 1.0 : 0.6,
      alternates: hreflangLinks(variants),
    });
  }

  let lastmod: string | undefined;
  try {
    const data = await fetchSitemapEntries();
    for (const type of ['post', 'tutorial', 'category'] as const) {
      for (const entry of data.entries?.[type] ?? []) {
        if (entry.locale !== locale) continue;
        const natural = internalPathOf(type, entry);
        if (!natural) continue;
        const loc = resolveLoc(entry, localizedPath(locale, natural));
        if (!loc) continue;

        const entryLastmod = toIso(entry.lastmod);
        if (entryLastmod && (!lastmod || entryLastmod > lastmod)) lastmod = entryLastmod;

        const existing = urls.get(loc);
        if (existing) {
          if (entryLastmod && (!existing.lastmod || entryLastmod > existing.lastmod)) existing.lastmod = entryLastmod;
          continue;
        }
        urls.set(loc, {
          loc,
          ...(entryLastmod ? { lastmod: entryLastmod } : {}),
          ...TYPE_CONFIG[type],
          alternates: hreflangLinks(entryVariants(type, entry)),
        });
      }
    }
  } catch (error) {
    console.error(`Sitemap ${locale}: backend non disponibile`, error);
  }

  return { urls: [...urls.values()], lastmod };
}
