import type { Metadata } from 'next';
import { articleService } from '@/lib/services';
import type { ArticleListResponse } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { Pagination } from '@/components/Pagination';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Tutti gli articoli e le guide tecniche pubblicate su Programmato: frontend, backend, architetture, tooling e carriera.',
};

const EMPTY_RESPONSE: ArticleListResponse = {
  content: [],
  pagination: {
    pageNumber: 1,
    pageSize: 12,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const params = await searchParams;
  const pageNumber = Math.max(1, Number(params.page) || 1);

  let response: ArticleListResponse = EMPTY_RESPONSE;

  try {
    response = params.category
      ? await articleService.getArticlesByCategory(params.category, pageNumber, 12)
      : await articleService.getAllArticles(pageNumber, 12);
  } catch (error) {
    console.error('Archivio articoli non disponibile:', error);
  }

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Archivio</span>
          <h1 className="page-title">Tutti gli articoli</h1>
          <p className="page-lede">
            Analisi, guide e appunti di mestiere scritti da sviluppatori. Cerca la profondità,
            non il titolo acchiappaclic.
          </p>
          {response.pagination.totalElements > 0 && (
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">
              {response.pagination.totalElements} articoli pubblicati
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
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
              <Pagination
                currentPage={response.pagination.pageNumber}
                totalPages={response.pagination.totalPages}
                basePath="/blog"
                query={{ category: params.category }}
              />
            </>
          ) : (
            <div className="empty-state">
              <span className="eyebrow">Nessun risultato</span>
              <h2 className="empty-state-title mt-3">Qui c’è ancora silenzio.</h2>
              <p className="empty-state-copy">
                Non ci sono articoli da mostrare in questo momento. Torna presto: la
                redazione è al lavoro.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
