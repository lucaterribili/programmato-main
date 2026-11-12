import { User, Category, Tag, ImageData, SEOData, PaginatedResponse } from './common';

export interface TutorialStep {
  id: number;
  order: number;
  title: string;
  content: string;
  codeSnippets?: CodeSnippet[];
  estimatedTime?: number;
}

export interface CodeSnippet {
  language: string;
  code: string;
  filename?: string;
  description?: string;
  highlightLines?: number[];
}

export interface TutorialPreview {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  image?: ImageData | null;
  mainCategory?: Category | null;
  author?: User | null;
  tags?: Tag[];
  stepsCount?: number;
  publishedAt?: string | null;
  updatedAt?: string;
  isCompleted?: boolean;
}

export interface Tutorial extends TutorialPreview {
  prerequisites?: string[];
  objectives?: string[];
  steps: TutorialStep[];
  conclusion?: string;
  resources?: ResourceLink[];
  seo?: SEOData;
  relatedTutorials?: TutorialPreview[];
}

export interface ResourceLink {
  title: string;
  url: string;
  type: 'documentation' | 'github' | 'video' | 'article' | 'tool';
}

export type TutorialListResponse = PaginatedResponse<TutorialPreview>;

export interface TutorialResponse {
  tutorial: Tutorial;
}