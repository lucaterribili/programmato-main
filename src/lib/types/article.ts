import { User, Category, Tag, ImageData, SEOData, PaginatedResponse } from './common';

export interface ArticlePreview {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  publishedAt?: string | null;
  image?: ImageData | null;
  mainCategory?: Category | null;
  author?: User | null;
  tags?: Tag[];
  readingTime?: number;
  viewsCount?: number;
  sourceDomain?: string;
  isOriginal?: boolean;
}

export interface Article extends ArticlePreview {
  body: string;
  content?: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  seo?: SEOData;
  relatedArticles?: ArticlePreview[];
  tableOfContents?: TableOfContentsItem[];
  faq?: FAQItem[];
}

export interface TableOfContentsItem {
  level: number;
  text: string;
  id: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export type ArticleListResponse = PaginatedResponse<ArticlePreview>;

export interface ArticleResponse {
  article: Article;
}

export interface RelatedArticlesResponse {
  articles: ArticlePreview[];
}