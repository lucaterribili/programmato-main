import { User, Category, Tag, PaginatedResponse } from './common';
import type { ArticlePreview } from './article';
import type { TutorialPreview } from './tutorial';

export interface AuthorProfile extends User {
  articlesCount: number;
  tutorialsCount: number;
  totalViews: number;
  joinedAt: string;
  expertise?: string[];
  featuredArticle?: ArticlePreview | null;
  featuredTutorial?: TutorialPreview | null;
  latestArticles: ArticlePreview[];
  latestTutorials: TutorialPreview[];
  topCategories: Category[];
  topTags: Tag[];
}

export type AuthorListResponse = PaginatedResponse<AuthorProfile>;

export interface AuthorResponse {
  author: AuthorProfile;
}