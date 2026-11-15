import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock3, ListChecks, Target, Wrench } from 'lucide-react';
import { tutorialService } from '@/lib/services';
import { renderContent } from '@/lib/render';
import { TutorialCard } from '@/components/TutorialCard';
import type { Tutorial } from '@/lib/types';
import { LocaleAlternates } from '@/components/LocaleAlternates';
import { OG_LOCALE, toLocale, type Locale } from '@/lib/i18n/config';
import { format, getMessages, pluralize } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { contentVariants, pageAlternates } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

/** `unavailable`: il backend non risponde (pagina d'errore temporanea); guida assente e non `unavailable` = 404. */
async function loadTutorial(slug: string, locale: Locale): Promise<{ tutorial: Tutorial | null; unavailable: boolean }> {
  try {
    return { tutorial: await tutorialService.getTutorialBySlug(slug, locale), unavailable: false };
  } catch (error) {
    console.error('Tutorial non disponibile:', error);
    return { tutorial: null, unavailable: true };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const { tutorial } = await loadTutorial(slug, locale);

  if (!tutorial) {
    return { title: getMessages(locale).tutorial.metaTitle, robots: { index: false, follow: true } };
  }

  const alternates = pageAlternates({
    locale,
    internalPath: `/tutorial/${slug}`,
    variants: await contentVariants('tutorial', locale, slug),
    canonical: tutorial.seo?.canonical,
  });

  return {
    title: tutorial.seo?.title || tutorial.title,
    description: tutorial.seo?.description || tutorial.description || undefined,
    alternates,
    openGraph: {
      locale: OG_LOCALE[locale],
      url: alternates.canonical as string,
      title: tutorial.title,
      description: tutorial.description || undefined,
    },
  };
}

export default async function TutorialPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const { tutorial: t, common } = getMessages(locale);
  const href = (path: string) => localizedPath(locale, path);
  const { tutorial, unavailable } = await loadTutorial(slug, locale);

  if (!tutorial) {
    if (!unavailable) notFound();
    return (
      <section className="section">
        <div className="container-page">
          <div className="empty-state">
            <span className="eyebrow">{common.notAvailable.eyebrow}</span>
            <h1 className="empty-state-title mt-3">{t.unavailableTitle}</h1>
            <p className="empty-state-copy">{t.unavailableCopy}</p>
            <Link href={href('/tutorial')} className="btn btn-primary btn-sm mt-6">
              {t.backToTutorials}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const steps = [...tutorial.steps].sort((a, b) => a.order - b.order);
  const renderedSteps = await Promise.all(
    steps.map(async (step) => ({
      ...step,
      html: await renderContent(step.content, locale),
    }))
  );
  const conclusion = await renderContent(tutorial.conclusion, locale);
  const variants = await contentVariants('tutorial', locale, slug);

  return (
    <>
      <LocaleAlternates variants={variants} />
      <header className="page-header">
        <div className="container-page">
          <Link href={href('/tutorial')} className="link-more mb-6 inline-flex">
            <ArrowLeft size={14} aria-hidden="true" />
            {t.allTutorials}
          </Link>

          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              {tutorial.difficulty && (
                <span className={`tutorial-difficulty tutorial-difficulty--${tutorial.difficulty}`}>
                  {common.cards.difficulty[tutorial.difficulty]}
                </span>
              )}
              {tutorial.estimatedTime ? (
                <span className="tutorial-time inline-flex items-center gap-1.5">
                  <Clock3 size={13} aria-hidden="true" />
                  {format(common.cards.minutes, { n: tutorial.estimatedTime })}
                </span>
              ) : null}
              {tutorial.stepsCount ? (
                <span className="tutorial-time inline-flex items-center gap-1.5">
                  <ListChecks size={13} aria-hidden="true" />
                  {pluralize(locale, t.steps, tutorial.stepsCount)}
                </span>
              ) : null}
            </div>

            <h1 className="page-title mt-5">{tutorial.title}</h1>
            {tutorial.description && <p className="page-lede">{tutorial.description}</p>}

            {tutorial.mainCategory && (
              <p className="mt-5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
                {tutorial.mainCategory.title}
              </p>
            )}
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="max-w-3xl">
            {(tutorial.objectives?.length || tutorial.prerequisites?.length) && (
              <div className="mb-10 grid gap-4 sm:grid-cols-2">
                {tutorial.objectives && tutorial.objectives.length > 0 && (
                  <div className="rounded-2xl border border-line bg-paper-soft p-5">
                    <div className="flex items-center gap-2">
                      <Target size={16} className="text-accent" aria-hidden="true" />
                      <h2 className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-navy">
                        {t.objectives}
                      </h2>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                      {tutorial.objectives.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {tutorial.prerequisites && tutorial.prerequisites.length > 0 && (
                  <div className="rounded-2xl border border-line bg-white p-5">
                    <div className="flex items-center gap-2">
                      <Wrench size={16} className="text-blue" aria-hidden="true" />
                      <h2 className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-navy">
                        {t.prerequisites}
                      </h2>
                    </div>
                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                      {tutorial.prerequisites.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-blue" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-12">
              {renderedSteps.map((step, index) => (
                <section key={step.id} id={`step-${index + 1}`}>
                  <div className="flex items-baseline gap-4">
                    <span className="font-display text-3xl font-semibold leading-none text-blue">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2 className="font-display text-2xl font-semibold leading-tight text-navy">
                      {step.title}
                    </h2>
                  </div>
                  {step.html && (
                    <div
                      className="prose-page mt-4"
                      dangerouslySetInnerHTML={{ __html: step.html }}
                    />
                  )}
                  {step.codeSnippets?.map((snippet, snippetIndex) => (
                    <div
                      key={`${step.id}-${snippetIndex}`}
                      className="mt-5 overflow-hidden rounded-xl border border-[#2a4862] bg-[#102838]"
                    >
                      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-2.5">
                        <span className="font-mono text-[0.7rem] text-white/60">
                          {snippet.filename || snippet.language}
                        </span>
                        <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-white/40">
                          {snippet.language}
                        </span>
                      </div>
                      <pre className="overflow-x-auto p-4 font-mono text-[0.82rem] leading-relaxed text-[#d7e5ec]">
                        <code>{snippet.code}</code>
                      </pre>
                      {snippet.description && (
                        <p className="border-t border-white/10 px-4 py-3 font-mono text-[0.7rem] leading-relaxed text-white/50">
                          {snippet.description}
                        </p>
                      )}
                    </div>
                  ))}
                </section>
              ))}
            </div>

            {conclusion && (
              <div className="mt-12 rounded-2xl border border-line bg-paper-soft p-6">
                <h2 className="font-display text-2xl font-semibold text-navy">{t.conclusion}</h2>
                <div
                  className="prose-page mt-3"
                  dangerouslySetInnerHTML={{ __html: conclusion }}
                />
              </div>
            )}
          </div>

          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {renderedSteps.length > 0 && (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ListChecks size={15} className="text-accent" aria-hidden="true" />
                  <h2 className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-navy">
                    {t.stepsIndex}
                  </h2>
                </div>
                <ol className="space-y-2 border-l border-line pl-4">
                  {renderedSteps.map((step, index) => (
                    <li key={step.id}>
                      <a
                        href={`#step-${index + 1}`}
                        className="text-sm leading-snug text-muted transition-colors hover:text-navy"
                      >
                        {index + 1}. {step.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tutorial.resources && tutorial.resources.length > 0 && (
              <div>
                <h2 className="mb-3 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-navy">
                  {t.resources}
                </h2>
                <ul className="space-y-2">
                  {tutorial.resources.map((resource) => (
                    <li key={resource.url}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted transition-colors hover:text-navy"
                      >
                        {resource.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {tutorial.relatedTutorials && tutorial.relatedTutorials.length > 0 && (
        <section className="section section-soft">
          <div className="container-page">
            <div className="section-head">
              <div>
                <span className="eyebrow">{t.keepLearning}</span>
                <h2 className="section-title">{t.related}</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tutorial.relatedTutorials.slice(0, 3).map((item) => (
                <TutorialCard key={item.id} tutorial={item} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
