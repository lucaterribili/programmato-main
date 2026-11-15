import type { Metadata } from 'next';
import Link from 'next/link';
import { tutorialService } from '@/lib/services';
import type { TutorialListResponse } from '@/lib/types';
import { TutorialCard } from '@/components/TutorialCard';
import { Pagination } from '@/components/Pagination';
import { LANGUAGE_NAME, toLocale } from '@/lib/i18n/config';
import { getMessages, pluralize } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { absoluteUrl, allLocales, openGraphBase, pageAlternates } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}

const EMPTY_RESPONSE: TutorialListResponse = {
  content: [],
  pagination: { pageNumber: 1, pageSize: 12, totalPages: 0, totalElements: 0, hasNext: false, hasPrevious: false },
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const pageNumber = Math.max(1, Number((await searchParams).page) || 1);
  const t = getMessages(locale).tutorial;
  const internalPath = pageNumber > 1 ? `/tutorial?page=${pageNumber}` : '/tutorial';
  const alternates = pageAlternates({
    locale,
    internalPath,
    variants: pageNumber > 1 ? undefined : allLocales('/tutorial'),
  });
  alternates.canonical = absoluteUrl(localizedPath(locale, internalPath));
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates,
    openGraph: { ...openGraphBase(locale), title: t.metaTitle, description: t.metaDescription, url: alternates.canonical },
  };
}

export default async function TutorialPage({ params, searchParams }: PageProps) {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).tutorial;
  const pageNumber = Math.max(1, Number((await searchParams).page) || 1);

  let response: TutorialListResponse = EMPTY_RESPONSE;

  try {
    response = await tutorialService.getAllTutorials(pageNumber, 12, locale);
  } catch (error) {
    console.error('Archivio tutorial non disponibile:', error);
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
                {response.content.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} locale={locale} />
                ))}
              </div>
              <Pagination
                locale={locale}
                currentPage={response.pagination.pageNumber}
                totalPages={response.pagination.totalPages}
                basePath="/tutorial"
              />
            </>
          ) : (
            <div className="empty-state">
              <span className="eyebrow">{t.emptyEyebrow}</span>
              <h2 className="empty-state-title mt-3">{t.emptyTitle}</h2>
              <p className="empty-state-copy">{locale === 'it' ? t.emptyCopy : t.emptyOtherLanguage}</p>
              {locale !== 'it' && (
                <Link href={localizedPath('it', '/tutorial')} hrefLang="it" lang="it" className="btn btn-outline btn-sm mt-6">
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
