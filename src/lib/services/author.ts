import config from '@/lib/config';
import { backendFetch, buildQueryString, isDegradableError } from './http';
import type {
  AuthorProfile,
  AuthorListResponse,
  ArticlePreview,
  TutorialPreview,
  PaginatedResponse,
} from '@/lib/types';

interface BackendAuthor {
  id: number;
  name: string;
  slug: string;
  email?: string;
  avatar?: string | null;
  bio?: string | null;
  role?: string;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  createdAt: string;
  articlesCount: number;
  tutorialsCount: number;
  totalViews: number;
  joinedAt: string;
  expertise?: string[];
  featuredArticle?: {
    id: number;
    title: string;
    slug: string;
    summary?: string | null;
    publishedAt?: string | null;
    image?: {
      path: string;
      thumbnails?: {
        icon?: string;
        thumb?: string;
        cover?: string;
        large?: string;
      };
      alt?: string | null;
    } | null;
    mainCategory?: {
      id: number;
      title: string;
      slug: string;
    } | null;
  } | null;
  featuredTutorial?: {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    difficulty: string;
    estimatedTime: number;
    image?: {
      path: string;
      thumbnails?: {
        icon?: string;
        thumb?: string;
        cover?: string;
        large?: string;
      };
      alt?: string | null;
    } | null;
    mainCategory?: {
      id: number;
      title: string;
      slug: string;
    } | null;
  } | null;
  latestArticles?: Array<{
    id: number;
    title: string;
    slug: string;
    summary?: string | null;
    publishedAt?: string | null;
    image?: {
      path: string;
      thumbnails?: {
        icon?: string;
        thumb?: string;
        cover?: string;
        large?: string;
      };
      alt?: string | null;
    } | null;
    mainCategory?: {
      id: number;
      title: string;
      slug: string;
    } | null;
    readingTime?: number;
    viewsCount?: number;
  }>;
  latestTutorials?: Array<{
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    difficulty: string;
    estimatedTime: number;
    image?: {
      path: string;
      thumbnails?: {
        icon?: string;
        thumb?: string;
        cover?: string;
        large?: string;
      };
      alt?: string | null;
    } | null;
    mainCategory?: {
      id: number;
      title: string;
      slug: string;
    } | null;
    stepsCount?: number;
    publishedAt?: string | null;
    updatedAt?: string;
  }>;
  topCategories?: Array<{
    id: number;
    title: string;
    slug: string;
    postsCount?: number;
  }>;
  topTags?: Array<{
    id: number;
    title: string;
    slug: string;
    postsCount?: number;
  }>;
}

interface BackendAuthorListResponse {
  content: BackendAuthor[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: { sorted: boolean; unsorted: boolean; empty: boolean };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

interface BackendAuthorResponse {
  author: BackendAuthor;
}

class AuthorService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly domain: string;

  constructor() {
    this.baseUrl = config.apiEndpoint;
    this.apiKey = config.apiKey;
    this.domain = config.domain;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'domain': this.domain,
    };
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await backendFetch(url, {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  private mapAuthor(backend: BackendAuthor): AuthorProfile {
    return {
      id: backend.id,
      name: backend.name,
      slug: backend.slug,
      email: backend.email,
      avatar: backend.avatar,
      bio: backend.bio,
      role: backend.role,
      socialLinks: backend.socialLinks?.map(link => ({
        platform: link.platform as NonNullable<AuthorProfile['socialLinks']>[number]['platform'],
        url: link.url,
      })),
      createdAt: backend.createdAt,
      articlesCount: backend.articlesCount,
      tutorialsCount: backend.tutorialsCount,
      totalViews: backend.totalViews,
      joinedAt: backend.joinedAt,
      expertise: backend.expertise,
      featuredArticle: backend.featuredArticle ? {
        id: backend.featuredArticle.id,
        title: backend.featuredArticle.title,
        slug: backend.featuredArticle.slug,
        summary: backend.featuredArticle.summary,
        publishedAt: backend.featuredArticle.publishedAt,
        image: backend.featuredArticle.image ? {
          path: backend.featuredArticle.image.path,
          thumbnails: backend.featuredArticle.image.thumbnails,
          alt: backend.featuredArticle.image.alt,
        } : null,
        mainCategory: backend.featuredArticle.mainCategory ? {
          id: backend.featuredArticle.mainCategory.id,
          title: backend.featuredArticle.mainCategory.title,
          slug: backend.featuredArticle.mainCategory.slug,
        } : null,
      } : null,
      featuredTutorial: backend.featuredTutorial ? {
        id: backend.featuredTutorial.id,
        title: backend.featuredTutorial.title,
        slug: backend.featuredTutorial.slug,
        description: backend.featuredTutorial.description,
        difficulty: backend.featuredTutorial.difficulty as TutorialPreview['difficulty'],
        estimatedTime: backend.featuredTutorial.estimatedTime,
        image: backend.featuredTutorial.image ? {
          path: backend.featuredTutorial.image.path,
          thumbnails: backend.featuredTutorial.image.thumbnails,
          alt: backend.featuredTutorial.image.alt,
        } : null,
        mainCategory: backend.featuredTutorial.mainCategory ? {
          id: backend.featuredTutorial.mainCategory.id,
          title: backend.featuredTutorial.mainCategory.title,
          slug: backend.featuredTutorial.mainCategory.slug,
        } : null,
      } : null,
      latestArticles: (backend.latestArticles ?? []).map(article => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary,
        publishedAt: article.publishedAt,
        image: article.image ? {
          path: article.image.path,
          thumbnails: article.image.thumbnails,
          alt: article.image.alt,
        } : null,
        mainCategory: article.mainCategory ? {
          id: article.mainCategory.id,
          title: article.mainCategory.title,
          slug: article.mainCategory.slug,
        } : null,
        readingTime: article.readingTime,
        viewsCount: article.viewsCount,
      })),
      latestTutorials: (backend.latestTutorials ?? []).map(tutorial => ({
        id: tutorial.id,
        title: tutorial.title,
        slug: tutorial.slug,
        description: tutorial.description,
        difficulty: tutorial.difficulty as TutorialPreview['difficulty'],
        estimatedTime: tutorial.estimatedTime,
        image: tutorial.image ? {
          path: tutorial.image.path,
          thumbnails: tutorial.image.thumbnails,
          alt: tutorial.image.alt,
        } : null,
        mainCategory: tutorial.mainCategory ? {
          id: tutorial.mainCategory.id,
          title: tutorial.mainCategory.title,
          slug: tutorial.mainCategory.slug,
        } : null,
        stepsCount: tutorial.stepsCount,
        publishedAt: tutorial.publishedAt,
        updatedAt: tutorial.updatedAt,
      })),
      topCategories: (backend.topCategories ?? []).map(cat => ({
        id: cat.id,
        title: cat.title,
        slug: cat.slug,
        postsCount: cat.postsCount,
      })),
      topTags: (backend.topTags ?? []).map(tag => ({
        id: tag.id,
        title: tag.title,
        slug: tag.slug,
        postsCount: tag.postsCount,
      })),
    };
  }

  /**
   * Get all authors with pagination.
   */
  async getAllAuthors(
    pageNumber: number = 1,
    pageSize: number = 12
  ): Promise<AuthorListResponse> {
    const query = buildQueryString({ pageNumber, pageSize });
    const endpoint = `/author/list${query}`;
    
    try {
      const response = await this.request<BackendAuthorListResponse>(endpoint);
      
      return {
        content: response.content.map(author => this.mapAuthor(author)),
        pagination: {
          pageNumber: response.pageable.pageNumber,
          pageSize: response.pageable.pageSize,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          hasNext: !response.last,
          hasPrevious: !response.first,
        },
      };
    } catch (error) {
      if (isDegradableError(error)) {
        return {
          content: [],
          pagination: {
            pageNumber: 1,
            pageSize,
            totalPages: 0,
            totalElements: 0,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get author by slug.
   */
  async getAuthorBySlug(slug: string): Promise<AuthorProfile | null> {
    try {
      const response = await this.request<BackendAuthorResponse>(`/author/${slug}`);
      return this.mapAuthor(response.author);
    } catch (error) {
      if (isDegradableError(error)) return null;
      throw error;
    }
  }

  /**
   * Get author's articles.
   */
  async getAuthorArticles(
    authorSlug: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<ArticlePreview>> {
    const query = buildQueryString({ pageNumber, pageSize });
    const endpoint = `/author/${authorSlug}/articles${query}`;
    
    try {
      const response = await this.request<BackendAuthorListResponse>(endpoint);
      return {
        content: response.content.map(author => ({
          id: author.id,
          title: author.name,
          slug: author.slug,
        })) as unknown as ArticlePreview[],
        pagination: {
          pageNumber: response.pageable.pageNumber,
          pageSize: response.pageable.pageSize,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          hasNext: !response.last,
          hasPrevious: !response.first,
        },
      };
    } catch (error) {
      if (isDegradableError(error)) {
        return {
          content: [],
          pagination: {
            pageNumber: 1,
            pageSize,
            totalPages: 0,
            totalElements: 0,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }
      throw error;
    }
  }

  /**
   * Get author's tutorials.
   */
  async getAuthorTutorials(
    authorSlug: string,
    pageNumber: number = 1,
    pageSize: number = 10
  ): Promise<PaginatedResponse<TutorialPreview>> {
    const query = buildQueryString({ pageNumber, pageSize });
    const endpoint = `/author/${authorSlug}/tutorials${query}`;
    
    try {
      const response = await this.request<BackendAuthorListResponse>(endpoint);
      return {
        content: response.content.map(author => ({
          id: author.id,
          title: author.name,
          slug: author.slug,
        })) as unknown as TutorialPreview[],
        pagination: {
          pageNumber: response.pageable.pageNumber,
          pageSize: response.pageable.pageSize,
          totalPages: response.totalPages,
          totalElements: response.totalElements,
          hasNext: !response.last,
          hasPrevious: !response.first,
        },
      };
    } catch (error) {
      if (isDegradableError(error)) {
        return {
          content: [],
          pagination: {
            pageNumber: 1,
            pageSize,
            totalPages: 0,
            totalElements: 0,
            hasNext: false,
            hasPrevious: false,
          },
        };
      }
      throw error;
    }
  }
}

const authorService = new AuthorService();
export default authorService;