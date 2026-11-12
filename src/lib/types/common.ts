export interface User {
  id: number;
  name: string;
  slug: string;
  email?: string;
  avatar?: string | null;
  bio?: string | null;
  role?: string;
  socialLinks?: SocialLink[];
  createdAt?: string;
}

export interface SocialLink {
  platform: 'github' | 'linkedin' | 'twitter' | 'youtube' | 'stackoverflow' | 'website';
  url: string;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  image?: ImageData | null;
  color?: string;
  parentId?: number | null;
  children?: Category[];
  postsCount?: number;
}

export interface Tag {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  color?: string;
  postsCount?: number;
}

export interface ImageData {
  id?: number;
  path: string;
  filename?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
  thumbnails?: {
    icon?: string;
    thumb?: string;
    cover?: string;
    large?: string;
  };
  alt?: string | null;
  caption?: string | null;
}

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  structuredData?: Record<string, unknown>;
}

export interface Pagination {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  pagination: Pagination;
}

export interface SearchResult {
  id: string;
  type: 'article' | 'tutorial' | 'author' | 'category' | 'tag';
  title: string;
  slug: string;
  description?: string;
  image?: string;
  category?: string;
  tags?: string[];
  publishedAt?: string;
  relevanceScore?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  pagination: Pagination;
  query: string;
  facets?: SearchFacets;
}

export interface SearchFacets {
  categories: Array<{ slug: string; label: string; count: number }>;
  tags: Array<{ slug: string; label: string; count: number }>;
  authors: Array<{ slug: string; label: string; count: number }>;
  types: Array<{ type: string; count: number }>;
}