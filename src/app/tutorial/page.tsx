import type { Metadata } from 'next';
import { tutorialService } from '@/lib/services';
import type { TutorialListResponse } from '@/lib/types';
import { TutorialCard } from '@/components/TutorialCard';
import { Pagination } from '@/components/Pagination';

export const metadata: Metadata = {
  title: 'Tutorial',
  description:
    'Guide pratiche passo-passo per imparare nuove tecnologie, con codice reale e obiettivi chiari.',
};

const EMPTY_RESPONSE: TutorialListResponse = {
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

export default async function TutorialPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const pageNumber = Math.max(1, Number(params.page) || 1);

  let response: TutorialListResponse = EMPTY_RESPONSE;

  try {
    response = await tutorialService.getAllTutorials(pageNumber, 12);
  } catch (error) {
    console.error('Archivio tutorial non disponibile:', error);
  }

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Officina</span>
          <h1 className="page-title">Guide tecniche</h1>
          <p className="page-lede">
            Tutorial passo-passo, dal primo comando al deploy. Codice reale, obiettivi
            chiari e nessun passaggio dato per scontato.
          </p>
          {response.pagination.totalElements > 0 && (
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">
              {response.pagination.totalElements} guide disponibili
            </p>
          )}
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          {response.content.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {response.content.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))}
              </div>
              <Pagination
                currentPage={response.pagination.pageNumber}
                totalPages={response.pagination.totalPages}
                basePath="/tutorial"
              />
            </>
          ) : (
            <div className="empty-state">
              <span className="eyebrow">In preparazione</span>
              <h2 className="empty-state-title mt-3">Le prossime guide stanno prendendo forma.</h2>
              <p className="empty-state-copy">
                Stiamo scrivendo nuovi tutorial. Torna a trovarci presto.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
