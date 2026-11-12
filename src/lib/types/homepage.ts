import { Category, Tag } from './common';
import type { ArticlePreview } from './article';
import type { TutorialPreview } from './tutorial';

export interface HomepageData {
  featuredArticle?: ArticlePreview | null;
  latestArticles: ArticlePreview[];
  popularArticles: ArticlePreview[];
  latestTutorials: TutorialPreview[];
  popularTutorials: TutorialPreview[];
  categories: Category[];
  popularTags: Tag[];
  stats?: HomepageStats;
  newsletter?: NewsletterPrompt;
}

export interface HomepageStats {
  totalArticles: number;
  totalTutorials: number;
  totalAuthors: number;
  totalViews: number;
  newsletterSubscribers?: number;
}

export interface NewsletterPrompt {
  title: string;
  description: string;
  placeholder: string;
  buttonText: string;
  incentive?: string;
}

export interface HomepageResponse {
  data: HomepageData;
}