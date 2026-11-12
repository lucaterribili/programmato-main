import { isDegradableError, buildQueryString } from './http';
import { apiGet, mapCategory, mapPage, mapPost, emptyPage, type RawCategory, type RawPage, type RawPost } from './backend';
import type { ArticlePreview, Category, PaginatedResponse, TutorialPreview } from '@/lib/types';

class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    try {
      return (await apiGet<RawCategory[]>('/category/list')).map(mapCategory);
    } catch (error) {
      if (isDegradableError(error)) return [];
      throw error;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return (await this.getAllCategories()).find((c) => c.slug === slug) ?? null;
  }

  async getCategoryContent(slug: string, pageNumber = 1, pageSize = 10): Promise<{
    category: Category | null;
    articles: PaginatedResponse<ArticlePreview>;
    tutorials: PaginatedResponse<TutorialPreview>;
  }> {
    try {
      const res = await apiGet<{ taxonomy: RawCategory; posts: RawPage<RawPost> }>(
        `/category/contents/${encodeURIComponent(slug)}${buildQueryString({ pageNumber, pageSize })}`,
      );
      return { category: mapCategory(res.taxonomy), articles: mapPage(res.posts, mapPost), tutorials: emptyPage(pageSize) };
    } catch (error) {
      if (isDegradableError(error)) {
        return { category: null, articles: emptyPage(pageSize), tutorials: emptyPage(pageSize) };
      }
      throw error;
    }
  }

  getRootCategories(): Promise<Category[]> {
    return this.getAllCategories();
  }
}

const categoryService = new CategoryService();
export default categoryService;
