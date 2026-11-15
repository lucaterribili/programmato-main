import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Compass, PenLine, Workflow } from 'lucide-react';
import { homepageService } from '@/lib/services';
import type { HomepageData } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { StatsBar } from '@/components/StatsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { ArticleCard } from '@/components/ArticleCard';
import { TutorialCard } from '@/components/TutorialCard';
import { NewsletterCTA } from '@/components/NewsletterCTA';
import { toLocale } from '@/lib/i18n/config';
import { format, getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { allLocales, openGraphBase, pageAlternates } from '@/lib/i18n/seo';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const { meta } = getMessages(locale);
  const alternates = pageAlternates({ locale, internalPath: '/', variants: allLocales('/') });
  return {
    title: { absolute: meta.siteTitle },
    description: meta.siteDescription,
    alternates,
    openGraph: { ...openGraphBase(locale), title: meta.siteTitle, description: meta.ogDescription, url: alternates.canonical as string },
  };
}

export default async function Home({ params }: PageProps) {
  const locale = toLocale((await params).lang);
  const { home: t, common } = getMessages(locale);
  const href = (path: string) => localizedPath(locale, path);

  // Se il backend non risponde la home degrada ai contenuti di fallback
  // (vedi homepageService.getBasic): meglio una home parziale che una pagina d'errore.
  const data: HomepageData = await homepageService.getBasic(locale);

  const latest = data.latestArticles.slice(0, 5);
  const popular = data.popularArticles.slice(0, 4);
  const tutorials = data.latestTutorials.slice(0, 3);
  const topics = data.categories.length
    ? data.categories.slice(0, 8).map((category) => ({
        label: category.title,
        href: href(`/blog?category=${category.slug}`),
        count: category.postsCount,
      }))
    : t.fallbackTopics.map((label) => ({ label, href: href('/blog'), count: undefined }));

  return (
    <>
      <Hero featured={data.featuredArticle} locale={locale} />
      <StatsBar stats={data.stats} locale={locale} />

      <section className="section" id="field-notes">
        <div className="container-page">
          <SectionHeader
            eyebrow={t.fieldNotes.eyebrow}
            title={t.fieldNotes.title}
            description={t.fieldNotes.description}
            href={href('/blog')}
            linkLabel={t.fieldNotes.link}
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div>
              {latest.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {latest.map((post, index) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                      locale={locale}
                      variant={index === 0 ? 'featured' : 'default'}
                      className={index === 0 ? 'md:col-span-2' : ''}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="eyebrow">{t.fieldNotes.emptyEyebrow}</span>
                  <h3 className="empty-state-title mt-3">{t.fieldNotes.emptyTitle}</h3>
                  <p className="empty-state-copy">{t.fieldNotes.emptyCopy}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href={href('/blog')} className="btn btn-primary btn-sm">
                      {t.fieldNotes.emptyCta}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-8">
              {popular.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Compass size={16} className="text-accent" aria-hidden="true" />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-navy">
                      {t.fieldNotes.popular}
                    </h3>
                  </div>
                  <ol className="rank-list">
                    {popular.map((post, index) => (
                      <li className="rank-item" key={post.id}>
                        <span className="rank-number" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <Link href={href(`/blog/${post.slug}`)} className="rank-link">
                            <span className="rank-title">{post.title}</span>
                          </Link>
                          <div className="rank-meta">
                            {post.mainCategory?.title ?? t.fieldNotes.defaultCategory}
                            {post.readingTime ? ` · ${format(common.cards.minutes, { n: post.readingTime })}` : ''}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="rounded-2xl border border-line bg-paper-soft p-6">
                <div className="mb-3 flex items-center gap-2">
                  <PenLine size={16} className="text-accent" aria-hidden="true" />
                  <span className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    {t.fieldNotes.principle}
                  </span>
                </div>
                <p className="font-display text-xl leading-snug text-navy">{t.fieldNotes.quote}</p>
                <p className="mt-4 text-sm text-muted">{t.fieldNotes.quoteBy}</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section-soft" id="agent-loop">
        <div className="container-page">
          <SectionHeader
            eyebrow={t.model.eyebrow}
            title={t.model.title}
            description={t.model.description}
            href={href('/tutorial')}
            linkLabel={t.model.link}
          />

          <div className="loop-grid">
            {t.model.phases.map((phase, index) => (
              <div key={phase.step} className="loop-step">
                <span className="loop-index">
                  {String(index + 1).padStart(2, '0')} · {phase.step}
                </span>
                <h3 className="loop-title">{phase.title}</h3>
                <p className="loop-copy">{phase.copy}</p>
                <code className="loop-code">{phase.code}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {tutorials.length > 0 && (
        <section className="section" id="playbook">
          <div className="container-page">
            <SectionHeader
              eyebrow={t.playbook.eyebrow}
              title={t.playbook.title}
              description={t.playbook.description}
              href={href('/tutorial')}
              linkLabel={t.playbook.link}
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section-soft" id="competenze">
        <div className="container-page grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="eyebrow">{t.skills.eyebrow}</span>
            <h2 className="section-title">{t.skills.title}</h2>
            <p className="section-lede">{t.skills.lede}</p>
            <div className="chip-grid mt-7">
              {topics.map((topic) => (
                <Link key={topic.label} href={topic.href} className="chip">
                  {topic.label}
                  {typeof topic.count === 'number' && <span className="chip-count">{topic.count}</span>}
                </Link>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-2">
                <Workflow size={16} className="text-accent" aria-hidden="true" />
                <span className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {t.skills.toolUseLabel}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{t.skills.toolUseCopy}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-7">
            <span className="eyebrow">{t.skills.standardEyebrow}</span>
            <ol className="mt-6 space-y-6">
              {t.skills.standard.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="font-display text-2xl font-semibold leading-none text-blue">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-sans text-[0.95rem] font-semibold text-navy">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href={href('/chi-siamo')} className="link-more mt-7 inline-flex">
              {t.skills.about}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="newsletter">
        <NewsletterCTA
          prompt={{
            title: t.newsletterPrompt.title,
            description: t.newsletterPrompt.description,
            incentive: t.newsletterPrompt.incentive,
          }}
        />
      </section>
    </>
  );
}
