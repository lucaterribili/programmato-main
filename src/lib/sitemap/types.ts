/** Forma della risposta di `GET /sitemap` (contratto `entries`) del backend. */
export type CanonicalHost = 'NONE' | 'SELF' | 'OWNED' | 'EXTERNAL' | 'INVALID';

export interface SitemapAlternate {
  locale: string;
  slug: string | null;
  parentSlug: string | null;
  ancestorSlug: string | null;
}

export interface SitemapEntry {
  slug: string | null;
  parentSlug: string | null;
  ancestorSlug: string | null;
  lastmod: string | null;
  locale: string;
  canonical: string | null;
  canonicalHost: CanonicalHost;
  alternates?: SitemapAlternate[] | null;
}

export interface SitemapResponse {
  locales?: string[];
  entries?: Record<string, SitemapEntry[]>;
}

export type EntryType = 'post' | 'tutorial' | 'category';
