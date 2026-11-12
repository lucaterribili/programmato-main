import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Search as SearchIcon } from 'lucide-react';
import { searchService } from '@/lib/services';
import type { SearchResponse, SearchResult } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Ricerca',
  description: 'Cerca articoli, tutorial, autori e argomenti su Programmato.',
};

const EMPTY_RESPONSE: SearchResponse = {
  results: [],
  pagination: {
    pageNumber: 1,
    pageSize: 10,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  },
  query: '',
};

const TYPE_LABEL: Record<SearchResult['type'], string> = {
  article: 'Articolo',
  tutorial: 'Tutorial',
  author: 'Autore',
  category: 'Categoria',
  tag: 'Tag',
};

function resultHref(result: SearchResult): string {
  switch (result.type) {
    case 'article':
      return `/blog/${result.slug}`;
    case 'tutorial':
      return `/tutorial/${result.slug}`;
    case 'author':
      return `/author/${result.slug}`;
    case 'category':
      return `/blog?category=${result.slug}`;
    case 'tag':
      return `/blog?tag=${result.slug}`;
    default:
      return '/blog';
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? '';

  let response: SearchResponse = EMPTY_RESPONSE;

  if (query) {
    try {
      response = await searchService.search(query, 1, 20);
    } catch (error) {
      console.error('Ricerca non disponibile:', error);
    }
  }

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Ricerca</span>
          <h1 className="page-title">Cerca nel portale</h1>
          <p className="page-lede">
            Articoli, tutorial, autori e argomenti. Scrivi cosa ti serve e premi invio.
          </p>

          <form action="/search" method="get" className="mt-8 flex max-w-2xl gap-2">
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
                placeholder="Es. Next.js, autenticazione, database…"
                aria-label="Cerca nel sito"
                className="w-full rounded-full border border-line-strong bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-navy focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Cerca
            </button>
          </form>
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          {!query && (
            <div className="empty-state">
              <span className="eyebrow">Da dove iniziare</span>
              <h2 className="empty-state-title mt-3">Cosa vuoi imparare oggi?</h2>
              <p className="empty-state-copy">
                Prova con un argomento, una tecnologia o il nome di un autore.
              </p>
            </div>
          )}

          {query && response.results.length === 0 && (
            <div className="empty-state">
              <span className="eyebrow">Nessun risultato</span>
              <h2 className="empty-state-title mt-3">Niente per “{query}”.</h2>
              <p className="empty-state-copy">
                Prova con una parola più generica, oppure sfoglia l’archivio.
              </p>
              <Link href="/blog" className="btn btn-outline btn-sm mt-6">
                Vai all’archivio
              </Link>
            </div>
          )}

          {query && response.results.length > 0 && (
            <>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">
                {response.pagination.totalElements || response.results.length} risultati per “{query}”
              </p>
              <div className="divide-y divide-line border-y border-line">
                {response.results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    href={resultHref(result)}
                    className="group flex items-start justify-between gap-6 py-5 no-underline"
                  >
                    <div>
                      <span className="pill">{TYPE_LABEL[result.type] ?? result.type}</span>
                      <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-navy transition-colors group-hover:text-sky">
                        {result.title}
                      </h2>
                      {result.description && (
                        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
                          {result.description}
                        </p>
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
