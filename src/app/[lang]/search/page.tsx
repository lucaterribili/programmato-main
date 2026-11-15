import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Search as SearchIcon } from 'lucide-react';
import { searchService } from '@/lib/services';
import type { SearchResponse, SearchResult } from '@/lib/types';
import { toLocale, type Locale } from '@/lib/i18n/config';
import { format, getMessages, pluralize } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { allLocales, pageAlternates } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ q?: string }>;
}

const EMPTY_RESPONSE: SearchResponse = {
  results: [],
  pagination: { pageNumber: 1, pageSize: 10, totalPages: 0, totalElements: 0, hasNext: false, hasPrevious: false },
  query: '',
};

function resultHref(locale: Locale, result: SearchResult): string {
  switch (result.type) {
    case 'article':
      return localizedPath(locale, `/blog/${result.slug}`);
    case 'tutorial':
      return localizedPath(locale, `/tutorial/${result.slug}`);
    case 'category':
      return localizedPath(locale, `/blog?category=${result.slug}`);
    case 'tag':
      return localizedPath(locale, `/blog?tag=${result.slug}`);
    default:
      return localizedPath(locale, '/blog');
  }
}

export async function generateMetadata({ params }: Pick<PageProps, 'params'>): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).search;
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    // I risultati di ricerca non si indicizzano (robots.txt li esclude già); le varianti servono al selettore di lingua.
    robots: { index: false, follow: true },
    alternates: pageAlternates({ locale, internalPath: '/search', variants: allLocales('/search') }),
  };
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).search;
  const query = (await searchParams).q?.trim() ?? '';

  let response: SearchResponse = EMPTY_RESPONSE;

  if (query) {
    try {
      response = await searchService.search(query, 1, 20, locale);
    } catch (error) {
      console.error('Ricerca non disponibile:', error);
    }
  }

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">{t.pill}</span>
          <h1 className="page-title">{t.title}</h1>
          <p className="page-lede">{t.lede}</p>

          <form action={localizedPath(locale, '/search')} method="get" className="mt-8 flex max-w-2xl gap-2">
            <div className="relative flex-1">
              <SearchIcon
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder={t.placeholder}
                aria-label={t.ariaLabel}
                className="w-full rounded-full border border-line-strong bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {t.button}
            </button>
          </form>
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          {!query && (
            <div className="empty-state">
              <span className="eyebrow">{t.startEyebrow}</span>
              <h2 className="empty-state-title mt-3">{t.startTitle}</h2>
              <p className="empty-state-copy">{t.startCopy}</p>
            </div>
          )}

          {query && response.results.length === 0 && (
            <div className="empty-state">
              <span className="eyebrow">{t.noResultsEyebrow}</span>
              <h2 className="empty-state-title mt-3">{format(t.noResultsTitle, { q: query })}</h2>
              <p className="empty-state-copy">{t.noResultsCopy}</p>
              <Link href={localizedPath(locale, '/blog')} className="btn btn-outline btn-sm mt-6">
                {t.goToArchive}
              </Link>
            </div>
          )}

          {query && response.results.length > 0 && (
            <>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">
                {pluralize(locale, t.resultsFor, response.pagination.totalElements || response.results.length, { q: query })}
              </p>
              <div className="divide-y divide-line border-y border-line">
                {response.results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={resultHref(locale, result)}
                    className="group flex items-start justify-between gap-6 py-5 no-underline"
                  >
                    <div>
                      <span className="pill">{t.types[result.type] ?? result.type}</span>
                      <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-navy transition-colors group-hover:text-sky">
                        {result.title}
                      </h2>
                      {result.description && (
                        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">{result.description}</p>
                      )}
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="mt-2 flex-shrink-0 text-muted transition-colors group-hover:text-accent"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
