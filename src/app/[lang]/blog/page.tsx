import type { Metadata } from 'next';
import Link from 'next/link';
import { articleService } from '@/lib/services';
import type { ArticleListResponse } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';
import { LANGUAGE_NAME, toLocale } from '@/lib/i18n/config';
import { getMessages, pluralize } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { absoluteUrl, allLocales, openGraphBase, pageAlternates } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
}

const EMPTY_RESPONSE: ArticleListResponse = {
  content: [],
  pagination: { pageNumber: 1, pageSize: 12, totalPages: 0, totalElements: 0, hasNext: false, hasPrevious: false },
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const { page, category } = await searchParams;
  const t = getMessages(locale).blog;
  const pageNumber = Math.max(1, Number(page) || 1);

  // Canonical: l'elenco con il suo filtro e la sua pagina; gli hreflang solo sull'elenco senza filtri (i filtri hanno
  // slug diversi per lingua).
  const query = [category ? `category=${encodeURIComponent(category)}` : '', pageNumber > 1 ? `page=${pageNumber}` : '']
    .filter(Boolean)
    .join('&');
  const internalPath = `/blog${query ? `?${query}` : ''}`;
  const alternates = pageAlternates({
    locale,
    internalPath,
    variants: category || pageNumber > 1 ? undefined : allLocales('/blog'),
  });
  alternates.canonical = absoluteUrl(localizedPath(locale, internalPath));

  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates,
    openGraph: { ...openGraphBase(locale), title: t.metaTitle, description: t.metaDescription, url: alternates.canonical },
  };
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const locale = toLocale((await params).lang);
  const query = await searchParams;
  const t = getMessages(locale).blog;
  const pageNumber = Math.max(1, Number(query.page) || 1);

  let response: ArticleListResponse = EMPTY_RESPONSE;

  try {
    response = query.category
      ? await articleService.getArticlesByCategory(query.category, pageNumber, 12, locale)
      : await articleService.getAllArticles(pageNumber, 12, locale);
  } catch (error) {
    console.error('Archivio articoli non disponibile:', error);
  }

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">{t.pill}</span>
          <h1 className="page-title">{t.title}</h1>
          <p className="page-lede">{t.lede}</p>
          {response.pagination.totalElements > 0 && (
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">
              {pluralize(locale, t.count, response.pagination.totalElements)}
            </p>
          )}
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          {response.content.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {response.content.map((post) => (
                  <ArticleCard key={post.id} post={post} locale={locale} />
                ))}
              </div>
              <Pagination
                locale={locale}
                currentPage={response.pagination.pageNumber}
                totalPages={response.pagination.totalPages}
                basePath="/blog"
                query={{ category: query.category }}
              />
            </>
          ) : (
            <div className="empty-state">
              <span className="eyebrow">{t.emptyEyebrow}</span>
              <h2 className="empty-state-title mt-3">{t.emptyTitle}</h2>
              <p className="empty-state-copy">{locale === 'it' ? t.emptyCopy : t.emptyOtherLanguage}</p>
              {locale !== 'it' && (
                <Link href={localizedPath('it', '/blog')} hrefLang="it" lang="it" className="btn btn-outline btn-sm mt-6">
                  {getMessages(locale).common.notAvailable.backToLanguage} {LANGUAGE_NAME.it}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
