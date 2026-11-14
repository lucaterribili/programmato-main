import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  List,
} from 'lucide-react';
import { articleService } from '@/lib/services';
import { formatDate } from '@/lib/services/content';
import { renderContent } from '@/lib/render';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleActions } from '@/components/ArticleActions';
import { NewsletterWidget } from '@/components/NewsletterWidget';
import imageService from '@/lib/services/image';
import config from '@/lib/config';
import type { Article } from '@/lib/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadArticle(slug: string): Promise<Article | null> {
  try {
    return await articleService.getArticleBySlug(slug);
  } catch (error) {
    console.error('Articolo non disponibile:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await loadArticle(slug);

  if (!article) {
    return { title: 'Articolo' };
  }

  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.summary || undefined,
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.summary || undefined,
      publishedTime: article.publishedAt || undefined,
      images: article.image?.path ? [article.image.path] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await loadArticle(slug);

  if (!article) {
    return (
      <section className="section">
        <div className="container-page">
          <div className="empty-state">
            <span className="eyebrow">Contenuto non disponibile</span>
            <h1 className="empty-state-title mt-3">Questo articolo non c’è (ancora).</h1>
            <p className="empty-state-copy">
              Potrebbe essere stato spostato o il servizio editoriale potrebbe essere
              momentaneamente irraggiungibile.
            </p>
            <Link href="/blog" className="btn btn-primary btn-sm mt-6">
              Torna all’archivio
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const html = await renderContent(article.body || article.content);
  const cover = imageService.getCoverImagePath(
    article.image ?? null,
    article.mainCategory?.image ?? null
  );
  const date = article.publishedAt ? formatDate(article.publishedAt) : null;
  const authorAvatar = article.author?.avatar
    ? imageService.getImageUrl(article.author.avatar)
    : null;
  const toc = article.tableOfContents ?? [];

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <Link
            href="/blog"
            className="link-more mb-6 inline-flex"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Archivio
          </Link>

          <div className="max-w-4xl">
            {article.mainCategory && (
              <span className="pill pill-accent">{article.mainCategory.title}</span>
            )}
            <h1 className="page-title mt-5">{article.title}</h1>
            {article.summary && <p className="page-lede">{article.summary}</p>}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted">
              {article.author && (
                <span className="inline-flex items-center gap-2">
                  <span className="article-avatar">
                    {authorAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={authorAvatar} alt={article.author.name} />
                    ) : (
                      article.author.name.slice(0, 2).toUpperCase()
                    )}
                  </span>
                  {article.author.name}
                </span>
              )}
              {date && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={13} aria-hidden="true" />
                  {date}
                </span>
              )}
              {article.readingTime && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={13} aria-hidden="true" />
                  {article.readingTime} min
                </span>
              )}
              {article.viewsCount ? (
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={13} aria-hidden="true" />
                  {article.viewsCount} letture
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          {cover && (
            <div className="overflow-hidden rounded-2xl border border-line bg-paper-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt={article.image?.alt ?? article.title}
                className="aspect-[16/8] w-full object-cover"
              />
            </div>
          )}

          <div className="article-layout mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <article>
              {html ? (
                <>
                  <div
                    id="article-content"
                    className="prose-page prose-wide"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                  <div className="max-w-3xl">
                    <ArticleActions
                      title={article.title}
                      url={`${config.siteUrl}/blog/${article.slug}`}
                      contentId="article-content"
                      publishedAt={article.publishedAt}
                    />
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <span className="eyebrow">Testo in arrivo</span>
                  <h2 className="empty-state-title mt-3">Il contenuto non è ancora disponibile.</h2>
                  <p className="empty-state-copy">
                    La redazione sta completando questo articolo. Torna tra poco.
                  </p>
                </div>
              )}

              {article.faq && article.faq.length > 0 && (
                <div className="mt-12 max-w-3xl">
                  <h2 className="section-title text-2xl">Domande frequenti</h2>
                  <div className="mt-5 divide-y divide-line border-y border-line">
                    {article.faq.map((item) => (
                      <details key={item.question} className="group py-4">
                        <summary className="cursor-pointer list-none font-semibold text-navy">
                          {item.question}
                        </summary>
                        <div
                          className="prose-page mt-3 text-sm"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      </details>
                    ))}
                  </div>
                </div>
              )}
            </article>

            <aside
              className="space-y-8 lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto"
              data-reader-hide
            >
              {toc.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <List size={15} className="text-accent" aria-hidden="true" />
                    <h2 className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-navy">
                      In questo articolo
                    </h2>
                  </div>
                  <ul className="space-y-2 border-l border-line pl-4">
                    {toc.map((item) => (
                      <li
                        key={item.id}
                        style={{ paddingLeft: item.level > 2 ? '0.75rem' : undefined }}
                      >
                        <a
                          href={`#${item.id}`}
                          className="text-sm leading-snug text-muted transition-colors hover:text-navy"
                        >
                          {item.text}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {article.author && (
                <div className="rounded-2xl border border-line bg-paper-soft p-5">
                  <div className="flex items-center gap-3">
                    <span className="article-avatar h-11 w-11 text-sm">
                      {authorAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={authorAvatar} alt={article.author.name} />
                      ) : (
                        article.author.name.slice(0, 2).toUpperCase()
                      )}
                    </span>
                    <div>
                      <p className="font-semibold text-navy">{article.author.name}</p>
                      <p className="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted">
                        {article.author.role || 'Autore'}
                      </p>
                    </div>
                  </div>
                  {article.author.bio && (
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {article.author.bio}
                    </p>
                  )}
                </div>
              )}

              {article.tags && article.tags.length > 0 && (
                <div>
                  <h2 className="mb-3 font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-navy">
                    Argomenti
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link key={tag.id} href={`/blog?tag=${tag.slug}`} className="pill">
                        {tag.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <NewsletterWidget />
            </aside>
          </div>
        </div>
      </section>

      {article.relatedArticles && article.relatedArticles.length > 0 && (
        <section className="section section-soft" data-reader-hide>
          <div className="container-page">
            <div className="section-head">
              <div>
                <span className="eyebrow">Continua a leggere</span>
                <h2 className="section-title">Articoli correlati</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {article.relatedArticles.slice(0, 3).map((post) => (
                <ArticleCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
