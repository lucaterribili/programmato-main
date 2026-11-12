import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, PenLine } from 'lucide-react';
import { authorService } from '@/lib/services';
import imageService from '@/lib/services/image';
import type { AuthorListResponse } from '@/lib/types';
import { Pagination } from '@/components/Pagination';

export const metadata: Metadata = {
  title: 'Autori',
  description:
    'Le persone che scrivono su Programmato: sviluppatori, architetti e professionisti del software.',
};

const EMPTY_RESPONSE: AuthorListResponse = {
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

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default async function AuthorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const pageNumber = Math.max(1, Number(params.page) || 1);

  let response: AuthorListResponse = EMPTY_RESPONSE;

  try {
    response = await authorService.getAllAuthors(pageNumber, 12);
  } catch (error) {
    console.error('Elenco autori non disponibile:', error);
  }

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Redazione</span>
          <h1 className="page-title">Le persone dietro le pagine</h1>
          <p className="page-lede">
            Sviluppatori che scrivono di ciò che fanno ogni giorno. Nessun ghostwriter,
            nessun contenuto generato e dimenticato.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          {response.content.length > 0 ? (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {response.content.map((author) => {
                  const avatar = author.avatar
                    ? imageService.getAvatarPath(author.avatar)
                    : null;
                  return (
                    <article
                      key={author.id}
                      className="flex h-full flex-col rounded-2xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_22px_44px_-28px_rgba(15,37,55,0.5)]"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-soft font-mono text-sm font-semibold text-slate">
                          {avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatar}
                              alt={author.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            initials(author.name)
                          )}
                        </span>
                        <div className="min-w-0">
                          <h2 className="font-display text-xl font-semibold leading-tight text-navy">
                            {author.name}
                          </h2>
                          <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-muted">
                            {author.role || 'Autore'}
                          </p>
                        </div>
                      </div>

                      {author.bio && (
                        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted">
                          {author.bio}
                        </p>
                      )}

                      {author.expertise && author.expertise.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {author.expertise.slice(0, 4).map((topic) => (
                            <span key={topic} className="pill">
                              {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-4 text-xs text-muted">
                        <span className="font-mono uppercase tracking-[0.08em]">
                          {author.articlesCount} articoli · {author.tutorialsCount} tutorial
                        </span>
                        <Link
                          href={`/author/${author.slug}`}
                          className="link-more border-0 pb-0 text-[0.66rem]"
                        >
                          Profilo
                          <ArrowUpRight size={13} aria-hidden="true" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>

              <Pagination
                currentPage={response.pagination.pageNumber}
                totalPages={response.pagination.totalPages}
                basePath="/author"
              />
            </>
          ) : (
            <div className="empty-state">
              <span className="eyebrow">Redazione</span>
              <h2 className="empty-state-title mt-3">Le firme stanno arrivando.</h2>
              <p className="empty-state-copy">
                La redazione si sta presentando. Nel frattempo puoi leggere gli articoli
                già pubblicati.
              </p>
              <Link href="/blog" className="btn btn-primary btn-sm mt-6">
                Vai al blog
              </Link>
              <p className="mt-6 inline-flex items-center gap-2 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-muted">
                <PenLine size={13} aria-hidden="true" />
                Vuoi scrivere con noi? redazione@programmato.it
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
