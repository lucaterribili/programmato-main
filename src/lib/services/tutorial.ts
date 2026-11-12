/* eslint-disable @typescript-eslint/no-unused-vars */
import { isDegradableError, buildQueryString } from './http';
import {
  apiGet, mapPage, mapTutorialPreview, mapImage, mapUser, mapCategory, emptyPage,
  type RawPage, type RawTutorial,
} from './backend';
import type { Tutorial, TutorialListResponse, TutorialPreview, TutorialStep } from '@/lib/types';

export interface TutorialChapter {
  slug: string;
  title: string;
  description: string | null;
  body: string;
  seoTitle: string;
  seoDescription: string;
  book: { slug: string; title: string } | null;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
}

interface RawBook {
  tutorial: RawTutorial;
  childs?: RawTutorial[];
  image?: RawTutorial['image'];
  mainCategory?: RawTutorial['mainCategory'];
}

class TutorialService {
  /** Un tutorial è un "libro": introduzione + capitoli (`childs`), ognuno con la sua pagina. */
  private mapBook(raw: RawBook): Tutorial {
    const t = raw.tutorial;
    const chapters = raw.childs ?? [];
    const steps: TutorialStep[] = [];
    if (t.body) {
      steps.push({ id: 0, order: 0, title: 'Introduzione', content: t.body });
    }
    chapters.forEach((c, i) => {
      steps.push({
        id: i + 1,
        order: i + 1,
        title: c.title,
        content: `${c.description ?? ''}\n\n[Leggi il capitolo](/tutorial/${t.slug}/${c.slug})`,
      });
    });
    const meta = t.metaData;
    return {
      ...mapTutorialPreview({ ...t, mainCategory: t.mainCategory ?? raw.mainCategory, image: t.image ?? raw.image }),
      image: mapImage(raw.image) ?? mapImage(raw.mainCategory?.image),
      mainCategory: raw.mainCategory ? mapCategory(raw.mainCategory) : null,
      author: mapUser(t.user),
      stepsCount: chapters.length || undefined,
      steps,
      seo: {
        title: meta?.metaTitle || t.title,
        description: meta?.metaDescription || t.description || '',
        canonical: meta?.canonical || undefined,
      },
    };
  }

  private async list(path: string, pageSize: number): Promise<TutorialListResponse> {
    try {
      return mapPage(await apiGet<RawPage<RawTutorial>>(path), mapTutorialPreview);
    } catch (error) {
      if (isDegradableError(error)) return emptyPage(pageSize);
      throw error;
    }
  }

  getAllTutorials(pageNumber = 1, pageSize = 10): Promise<TutorialListResponse> {
    return this.list(`/tutorial/list/paginated${buildQueryString({ pageNumber, pageSize })}`, pageSize);
  }

  getTutorialsByCategory(categorySlug: string, pageNumber = 1, pageSize = 10): Promise<TutorialListResponse> {
    return this.list(
      `/tutorial/category/${encodeURIComponent(categorySlug)}${buildQueryString({ pageNumber, pageSize })}`,
      pageSize,
    );
  }

  /** Nessun endpoint per tag/autore sui tutorial. */
  async getTutorialsByTag(_tagSlug: string, _p = 1, pageSize = 10): Promise<TutorialListResponse> {
    return emptyPage(pageSize);
  }
  async getTutorialsByAuthor(_authorSlug: string, _p = 1, pageSize = 10): Promise<TutorialListResponse> {
    return emptyPage(pageSize);
  }

  async getTutorialBySlug(slug: string): Promise<Tutorial | null> {
    try {
      return this.mapBook(await apiGet<RawBook>(`/tutorial/book/${encodeURIComponent(slug)}`));
    } catch (error) {
      if (isDegradableError(error)) return null;
      throw error;
    }
  }

  /** Capitolo di un tutorial: corpo + navigazione precedente/successivo. */
  async getChapter(chapterSlug: string): Promise<TutorialChapter | null> {
    try {
      const raw = await apiGet<{
        tutorial: RawTutorial;
        parent?: RawTutorial | null;
        ancestor?: RawTutorial | null;
        prev?: RawTutorial | null;
        next?: RawTutorial | null;
      }>(`/tutorial/detail/${encodeURIComponent(chapterSlug)}`);
      const nav = (t?: RawTutorial | null) => (t ? { slug: t.slug, title: t.title } : null);
      const meta = raw.tutorial.metaData;
      return {
        slug: raw.tutorial.slug,
        title: raw.tutorial.title,
        description: raw.tutorial.description ?? null,
        body: raw.tutorial.body ?? '',
        seoTitle: meta?.metaTitle || raw.tutorial.title,
        seoDescription: meta?.metaDescription || raw.tutorial.description || '',
        book: nav(raw.ancestor ?? raw.parent),
        prev: nav(raw.prev),
        next: nav(raw.next),
      };
    } catch (error) {
      if (isDegradableError(error)) return null;
      throw error;
    }
  }

  async getLatestTutorials(limit = 10): Promise<TutorialPreview[]> {
    return (await this.getAllTutorials(1, limit)).content;
  }

  async getPopularTutorials(limit = 10): Promise<TutorialPreview[]> {
    return this.getLatestTutorials(limit);
  }
}

const tutorialService = new TutorialService();
export default tutorialService;
