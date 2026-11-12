/* eslint-disable @typescript-eslint/no-unused-vars */
import { isDegradableError, buildQueryString } from './http';
import {
  apiGet, mapPage, mapPost, mapImage, emptyPage,
  type RawPage, type RawPost,
} from './backend';
import { calculateReadingTime, generateTableOfContents } from './content';
import type { Article, ArticleListResponse, ArticlePreview } from '@/lib/types';

class ArticleService {
  private mapArticle(raw: RawPost): Article {
    const preview = mapPost(raw);
    const meta = raw.metaData;
    return {
      ...preview,
      image: preview.image ?? mapImage(raw.mainCategory?.image),
      body: raw.body ?? '',
      readingTime: raw.body ? calculateReadingTime(raw.body) : undefined,
      updatedAt: raw.updatedAt ?? raw.publishedAt ?? '',
      status: 'published',
      seo: {
        title: meta?.metaTitle || raw.title,
        description: meta?.metaDescription || raw.summary || '',
        canonical: meta?.canonical || undefined,
        robots: { index: meta?.allowIndexing ?? true, follow: meta?.allowFollowing ?? true },
      },
      tableOfContents: raw.body ? generateTableOfContents(raw.body) : undefined,
    };
  }

  private async list(path: string, pageSize: number): Promise<ArticleListResponse> {
    try {
      return mapPage(await apiGet<RawPage<RawPost>>(path), mapPost);
    } catch (error) {
      if (isDegradableError(error)) return emptyPage(pageSize);
      throw error;
    }
  }

  getAllArticles(pageNumber = 1, pageSize = 10): Promise<ArticleListResponse> {
    return this.list(`/post/list${buildQueryString({ pageNumber, pageSize })}`, pageSize);
  }

  getArticlesByCategory(categorySlug: string, pageNumber = 1, pageSize = 10): Promise<ArticleListResponse> {
    return this.list(
      `/post/list/category/${encodeURIComponent(categorySlug)}${buildQueryString({ pageNumber, pageSize })}`,
      pageSize,
    );
  }

  async getArticlesByTag(tagSlug: string, pageNumber = 1, pageSize = 10): Promise<ArticleListResponse> {
    try {
      const res = await apiGet<{ posts: RawPage<RawPost> }>(
        `/tag/contents/${encodeURIComponent(tagSlug)}${buildQueryString({ pageNumber, pageSize })}`,
      );
      return mapPage(res.posts, mapPost);
    } catch (error) {
      if (isDegradableError(error)) return emptyPage(pageSize);
      throw error;
    }
  }

  /** Il backend non espone un endpoint per autore. */
  async getArticlesByAuthor(_authorSlug: string, _page = 1, pageSize = 10): Promise<ArticleListResponse> {
    return emptyPage(pageSize);
  }

  async getArticleBySlug(slug: string): Promise<Article | null> {
    try {
      return this.mapArticle(await apiGet<RawPost>(`/post/${encodeURIComponent(slug)}`));
    } catch (error) {
      if (isDegradableError(error)) return null;
      throw error;
    }
  }

  async getLatestArticles(limit = 10): Promise<ArticlePreview[]> {
    return (await this.getAllArticles(1, limit)).content;
  }

  async getPopularArticles(limit = 10): Promise<ArticlePreview[]> {
    return this.getLatestArticles(limit);
  }

  async getFeaturedArticle(): Promise<ArticlePreview | null> {
    return (await this.getLatestArticles(1))[0] ?? null;
  }

  async getRelatedArticles(slug: string, limit = 6): Promise<ArticlePreview[]> {
    try {
      const raw = await apiGet<RawPost[]>(`/post/related/${encodeURIComponent(slug)}${buildQueryString({ limit })}`);
      return raw.map(mapPost);
    } catch (error) {
      if (isDegradableError(error)) return [];
      throw error;
    }
  }
}

const articleService = new ArticleService();
export default articleService;
