import { isDegradableError } from './http';
import {
  apiGet, mapCategory, mapPost, mapTag, mapTutorialPreview,
  type RawCategory, type RawPost, type RawTutorial,
} from './backend';
import type { HomepageData } from '@/lib/types';

interface RawHomepage {
  categories?: RawCategory[];
  lastPosts?: RawPost[];
  popularPosts?: RawPost[];
  tutorials?: RawTutorial[];
}

const EMPTY: HomepageData = {
  featuredArticle: null,
  latestArticles: [],
  popularArticles: [],
  latestTutorials: [],
  popularTutorials: [],
  categories: [],
  popularTags: [],
};

class HomepageService {
  async getBasic(): Promise<HomepageData> {
    try {
      const [home, tags] = await Promise.all([
        apiGet<RawHomepage>('/homepage/basic'),
        apiGet<Array<{ id: number; slug: string; title: string }>>('/tag/list').catch(() => []),
      ]);
      const last = (home.lastPosts ?? []).map(mapPost);
      return {
        featuredArticle: last[0] ?? null,
        latestArticles: last.slice(1),
        popularArticles: (home.popularPosts ?? []).map(mapPost),
        latestTutorials: (home.tutorials ?? []).map(mapTutorialPreview),
        popularTutorials: [],
        categories: (home.categories ?? []).map(mapCategory),
        popularTags: tags.slice(0, 12).map(mapTag),
      };
    } catch (error) {
      // Backend non raggiungibile (o risorsa assente): la home degrada ai suoi
      // contenuti di fallback invece di far fallire il render.
      if (isDegradableError(error)) {
        console.warn('Homepage: backend non disponibile, contenuti di fallback.');
        return EMPTY;
      }
      throw error;
    }
  }

  getFull(): Promise<HomepageData> {
    return this.getBasic();
  }
}

const homepageService = new HomepageService();
export default homepageService;
