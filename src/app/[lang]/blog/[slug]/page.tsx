import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
import { LocaleAlternates } from '@/components/LocaleAlternates';
import { INTL_LOCALE, OG_LOCALE, toLocale, type Locale } from '@/lib/i18n/config';
import { format, getMessages, pluralize } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { contentVariants, pageAlternates } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

/** `unavailable`: il backend non risponde (pagina d'errore temporanea); articolo assente e non `unavailable` = 404. */
async function loadArticle(slug: string, locale: Locale): Promise<{ article: Article | null; unavailable: boolean }> {
  try {
    return { article: await articleService.getArticleBySlug(slug, locale), unavailable: false };
  } catch (error) {
    console.error('Articolo non disponibile:', error);
    return { article: null, unavailable: true };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const { article } = await loadArticle(slug, locale);

  if (!article) {
    return { title: getMessages(locale).blog.articleMetaTitle, robots: { index: false, follow: true } };
  }

  const variants = await contentVariants('post', locale, slug);
  const alternates = pageAlternates({
    locale,
    internalPath: `/blog/${slug}`,
    variants,
    canonical: article.seo?.canonical,
  });
  const robots = article.seo?.robots;

  return {
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.summary || undefined,
    alternates,
    robots: robots ? { index: robots.index, follow: robots.follow } : undefined,
    openGraph: {
      type: 'article',
      locale: OG_LOCALE[locale],
      url: alternates.canonical as string,
      title: article.title,
      description: article.summary || undefined,
      publishedTime: article.publishedAt || undefined,
      images: article.image?.path ? [article.image.path] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const { blog: t, common } = getMessages(locale);
  const href = (path: string) => localizedPath(locale, path);
  const { article, unavailable } = await loadArticle(slug, locale);

  if (!article) {
    if (!unavailable) notFound();
    return (
      <section className="section">
        <div className="container-page">
          <div className="empty-state">
            <span className="eyebrow">{common.notAvailable.eyebrow}</span>
            <h1 className="empty-state-title mt-3">{t.unavailableTitle}</h1>
            <p className="empty-state-copy">{t.unavailableCopy}</p>
            <Link href={href('/blog')} className="btn btn-primary btn-sm mt-6">
              {t.backToArchive}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const html = await renderContent(article.body || article.content, locale);
  const cover = imageService.getCoverImagePath(
    article.image ?? null,
    article.mainCategory?.image ?? null
  );
  const date = article.publishedAt ? formatDate(article.publishedAt, INTL_LOCALE[locale]) : null;
  const authorAvatar = article.author?.avatar
    ? imageService.getImageUrl(article.author.avatar)
    : null;
  const toc = article.tableOfContents ?? [];
  const variants = await contentVariants('post', locale, slug);

  return (
    <>
      <LocaleAlternates variants={variants} />
      <header className="page-header">
        <div className="container-page">
          <Link href={href('/blog')} className="link-more mb-6 inline-flex">
            <ArrowLeft size={14} aria-hidden="true" />
            {t.archive}
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
                  {format(common.cards.minutes, { n: article.readingTime })}
                </span>
              )}
              {article.viewsCount ? (
                <span className="inline-flex items-center gap-1.5">
                  <Eye size={13} aria-hidden="true" />
                  {pluralize(locale, t.views, article.viewsCount)}
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
                      url={`${config.siteUrl.replace(/\/$/, '')}${localizedPath(locale, `/blog/${article.slug}`)}`}
                      contentId="article-content"
                      publishedAt={article.publishedAt}
                    />
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <span className="eyebrow">{t.textSoonEyebrow}</span>
                  <h2 className="empty-state-title mt-3">{t.textSoonTitle}</h2>
                  <p className="empty-state-copy">{t.textSoonCopy}</p>
                </div>
              )}

              {article.faq && article.faq.length > 0 && (
                <div className="mt-12 max-w-3xl">
                  <h2 className="section-title text-2xl">{t.faq}</h2>
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
                      {t.inThisArticle}
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
                        {article.author.role || t.authorFallbackRole}
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
                    {t.topics}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                      <Link key={tag.id} href={href(`/blog?tag=${tag.slug}`)} className="pill">
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
                <span className="eyebrow">{t.keepReading}</span>
                <h2 className="section-title">{t.related}</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {article.relatedArticles.slice(0, 3).map((post) => (
                <ArticleCard key={post.id} post={post} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
