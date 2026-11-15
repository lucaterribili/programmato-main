import { isDegradableError, buildQueryString } from './http';
import { apiGet, mapPagination, type RawPage } from './backend';
import { extractUntilFirstDot } from './content';
import type { SearchResponse, SearchResult } from '@/lib/types';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

interface RawSearchItem {
  id: number;
  type: string;
  slug: string;
  title: string;
  body?: string;
  publishedAt?: string | null;
  mainCategory?: { slug: string; title: string } | null;
}

class SearchService {
  async search(query: string, pageNumber = 1, pageSize = 10, locale: Locale = DEFAULT_LOCALE): Promise<SearchResponse> {
    try {
      const raw = await apiGet<RawPage<RawSearchItem>>(
        `/search/all${buildQueryString({ term: query, pageNumber, pageSize })}`,
        locale,
      );
      const results: SearchResult[] = (raw.content ?? []).map((r) => ({
        id: String(r.id),
        type: r.type === 'tutorial' ? 'tutorial' : 'article',
        title: r.title,
        slug: r.slug,
        description: r.body ? extractUntilFirstDot(r.body.replace(/<[^>]*>/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\]\([^)]*\)/g, ''), 220) : undefined,
        category: r.mainCategory?.title,
        publishedAt: r.publishedAt ?? undefined,
      }));
      return { results, pagination: mapPagination(raw, pageSize), query };
    } catch (error) {
      if (isDegradableError(error)) {
        return { results: [], pagination: mapPagination({ totalPages: 0 }, pageSize), query };
      }
      throw error;
    }
  }

  async getSuggestions(): Promise<SearchResult[]> {
    return [];
  }

  async getPopularSearches(): Promise<string[]> {
    return [];
  }
}

const searchService = new SearchService();
export default searchService;
