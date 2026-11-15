import config from '@/lib/config';
import { backendFetch } from '@/lib/services/http';
import type { SitemapResponse } from './types';

/**
 * Le voci di sitemap di tutte le lingue del dominio, con canonical editoriale e varianti linguistiche (`alternates`).
 * Una sola chiamata alimenta sitemap, `hreflang` e selettore di lingua; la risposta si tiene in cache un'ora.
 */
export async function fetchSitemapEntries(types = 'post,tutorial,category'): Promise<SitemapResponse> {
  const url = `${config.apiEndpoint}/sitemap?types=${encodeURIComponent(types)}&legacy=false&allLocales=true`;
  const response = await backendFetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      domain: config.domain,
      language: 'it',
    },
    next: { revalidate: 3600 },
  } as RequestInit);
  return (await response.json()) as SitemapResponse;
}
