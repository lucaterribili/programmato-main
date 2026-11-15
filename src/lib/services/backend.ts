/**
 * Client + mapper verso il backend reale (programmato-rest, via api-gateway).
 * Il contratto è quello usato anche da lucaterribili-next: liste Spring `Page`,
 * immagini con `thumbs`, autore in `user`, nessun tag/readingTime sui post.
 */
import config from '@/lib/config';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { backendFetch } from './http';
import { calculateReadingTime } from './content';
import type {
  ArticlePreview,
  Category,
  ImageData,
  Pagination,
  PaginatedResponse,
  Tag,
  TutorialPreview,
  User,
} from '@/lib/types';

/* ---------- forme grezze del backend ---------- */

export interface RawThumbs {
  cover?: string;
  icon?: string;
  large?: string;
  loop?: string;
  mediumIcon?: string;
  topCover?: string;
}
export interface RawImage {
  thumbs?: RawThumbs | null;
}
export interface RawCategory {
  id?: number;
  slug: string;
  title: string;
  description?: string | null;
  image?: RawImage | null;
}
export interface RawUser {
  id?: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
}
export interface RawMeta {
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonical?: string | null;
  allowIndexing?: boolean;
  allowFollowing?: boolean;
}
export interface RawPost {
  id: number;
  slug: string;
  title: string;
  summary?: string | null;
  body?: string;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  image?: RawImage | null;
  mainCategory?: RawCategory | null;
  user?: RawUser | null;
  metaData?: RawMeta | null;
}
export interface RawTutorial {
  id?: number;
  slug: string;
  title: string;
  description?: string | null;
  body?: string;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  image?: RawImage | null;
  mainCategory?: RawCategory | null;
  user?: RawUser | null;
  metaData?: RawMeta | null;
}
export interface RawPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

/* ---------- HTTP ---------- */

/**
 * GET al backend. `locale` va nell'header `language`: il backend risponde nella lingua richiesta (e solo con i contenuti
 * che hanno quella traduzione). La cache di Next distingue le richieste anche per header, quindi le lingue non si mescolano.
 */
export async function apiGet<T>(path: string, locale: Locale = DEFAULT_LOCALE): Promise<T> {
  const response = await backendFetch(`${config.apiEndpoint}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      domain: config.domain,
      language: locale,
    },
    next: { revalidate: config.revalidateSeconds },
  } as RequestInit);
  return (await response.json()) as T;
}

/* ---------- mapper ---------- */

export function mapImage(raw?: RawImage | null): ImageData | null {
  const t = raw?.thumbs;
  if (!t) return null;
  const path = t.large ?? t.cover ?? t.loop ?? t.mediumIcon ?? t.icon;
  if (!path) return null;
  return {
    path,
    thumbnails: {
      icon: t.icon,
      thumb: t.loop ?? t.mediumIcon ?? t.cover,
      cover: t.cover ?? t.large,
      large: t.large ?? t.cover,
    },
  };
}

export function mapCategory(raw: RawCategory): Category {
  return {
    id: raw.id ?? 0,
    title: raw.title,
    slug: raw.slug,
    description: raw.description ?? null,
    image: mapImage(raw.image),
  };
}

export function mapTag(raw: { id: number; slug: string; title: string; description?: string | null }): Tag {
  return { id: raw.id, slug: raw.slug, title: raw.title, description: raw.description ?? null };
}

export function mapUser(raw?: RawUser | null): User | null {
  if (!raw) return null;
  const name = raw.fullName || [raw.firstName, raw.lastName].filter(Boolean).join(' ') || 'Programmato';
  return { id: raw.id ?? 0, name, slug: '', avatar: raw.avatar ?? null };
}

export function mapPost(raw: RawPost): ArticlePreview {
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    summary: raw.summary ?? null,
    publishedAt: raw.publishedAt ?? raw.createdAt ?? null,
    image: mapImage(raw.image),
    mainCategory: raw.mainCategory ? mapCategory(raw.mainCategory) : null,
    author: mapUser(raw.user),
    readingTime: raw.body ? calculateReadingTime(raw.body) : undefined,
  };
}

export function mapTutorialPreview(raw: RawTutorial): TutorialPreview {
  return {
    id: raw.id ?? 0,
    title: raw.title,
    slug: raw.slug,
    description: raw.description ?? null,
    image: mapImage(raw.image),
    mainCategory: raw.mainCategory ? mapCategory(raw.mainCategory) : null,
    author: mapUser(raw.user),
    publishedAt: raw.publishedAt ?? raw.createdAt ?? null,
    updatedAt: raw.updatedAt,
  };
}

export function mapPage<R, T>(raw: RawPage<R>, map: (item: R) => T): PaginatedResponse<T> {
  return { content: (raw.content ?? []).map(map), pagination: mapPagination(raw) };
}

export function mapPagination(raw: Partial<RawPage<unknown>>, fallbackSize = 10): Pagination {
  const pageNumber = (raw.number ?? 0) + 1;
  const totalPages = raw.totalPages ?? 1;
  return {
    pageNumber,
    pageSize: raw.size ?? fallbackSize,
    totalPages,
    totalElements: raw.totalElements ?? 0,
    hasNext: pageNumber < totalPages,
    hasPrevious: pageNumber > 1,
  };
}

export function emptyPage<T>(pageSize = 10): PaginatedResponse<T> {
  return {
    content: [],
    pagination: { pageNumber: 1, pageSize, totalPages: 0, totalElements: 0, hasNext: false, hasPrevious: false },
  };
}
