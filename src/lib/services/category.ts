import { isDegradableError, buildQueryString } from './http';
import { apiGet, mapCategory, mapPage, mapPost, emptyPage, type RawCategory, type RawPage, type RawPost } from './backend';
import type { ArticlePreview, Category, PaginatedResponse, TutorialPreview } from '@/lib/types';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

class CategoryService {
  async getAllCategories(locale: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    try {
      return (await apiGet<RawCategory[]>('/category/list', locale)).map(mapCategory);
    } catch (error) {
      if (isDegradableError(error)) return [];
      throw error;
    }
  }

  async getCategoryBySlug(slug: string, locale: Locale = DEFAULT_LOCALE): Promise<Category | null> {
    return (await this.getAllCategories(locale)).find((c) => c.slug === slug) ?? null;
  }

  async getCategoryContent(slug: string, pageNumber = 1, pageSize = 10, locale: Locale = DEFAULT_LOCALE): Promise<{
    category: Category | null;
    articles: PaginatedResponse<ArticlePreview>;
    tutorials: PaginatedResponse<TutorialPreview>;
  }> {
    try {
      const res = await apiGet<{ taxonomy: RawCategory; posts: RawPage<RawPost> }>(
        `/category/contents/${encodeURIComponent(slug)}${buildQueryString({ pageNumber, pageSize })}`,
        locale,
      );
      return { category: mapCategory(res.taxonomy), articles: mapPage(res.posts, mapPost), tutorials: emptyPage(pageSize) };
    } catch (error) {
      if (isDegradableError(error)) {
        return { category: null, articles: emptyPage(pageSize), tutorials: emptyPage(pageSize) };
      }
      throw error;
    }
  }

  getRootCategories(locale: Locale = DEFAULT_LOCALE): Promise<Category[]> {
    return this.getAllCategories(locale);
  }
}

const categoryService = new CategoryService();
export default categoryService;
