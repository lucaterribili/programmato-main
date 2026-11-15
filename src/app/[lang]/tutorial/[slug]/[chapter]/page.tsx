import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import tutorialService from '@/lib/services/tutorial';
import { renderContent } from '@/lib/render';
import { ArticleActions } from '@/components/ArticleActions';
import { LocaleAlternates } from '@/components/LocaleAlternates';
import config from '@/lib/config';
import { OG_LOCALE, toLocale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { contentVariants, pageAlternates } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string; slug: string; chapter: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug, chapter } = await params;
  const locale = toLocale(lang);
  const data = await tutorialService.getChapter(chapter, locale);
  if (!data) return { title: getMessages(locale).tutorial.metaTitle, robots: { index: false, follow: true } };

  const book = data.book?.slug ?? slug;
  const alternates = pageAlternates({
    locale,
    internalPath: `/tutorial/${book}/${chapter}`,
    variants: await contentVariants('tutorial', locale, chapter),
  });
  return {
    title: data.seoTitle,
    description: data.seoDescription || undefined,
    alternates,
    openGraph: { locale: OG_LOCALE[locale], url: alternates.canonical as string, title: data.title },
  };
}

export default async function TutorialChapterPage({ params }: PageProps) {
  const { lang, slug, chapter } = await params;
  const locale = toLocale(lang);
  const t = getMessages(locale).tutorial;
  const href = (path: string) => localizedPath(locale, path);

  const data = await tutorialService.getChapter(chapter, locale);
  if (!data) notFound();

  const html = await renderContent(data.body, locale);
  const book = data.book ?? { slug, title: t.backToGuide };
  const variants = await contentVariants('tutorial', locale, chapter);

  return (
    <>
      <LocaleAlternates variants={variants} />
      <header className="page-header">
        <div className="container-page">
          <Link href={href(`/tutorial/${book.slug}`)} className="link-more mb-6 inline-flex">
            <ArrowLeft size={14} aria-hidden="true" />
            {book.title}
          </Link>
          <h1 className="page-title max-w-4xl">{data.title}</h1>
          {data.description && <p className="page-lede max-w-3xl">{data.description}</p>}
        </div>
      </header>

      <section className="section">
        <div className="container-page max-w-3xl">
          <div id="article-content" className="prose-page" dangerouslySetInnerHTML={{ __html: html }} />
          <ArticleActions
            title={data.title}
            url={`${config.siteUrl.replace(/\/$/, '')}${href(`/tutorial/${book.slug}/${chapter}`)}`}
            contentId="article-content"
          />

          <nav className="mt-12 flex flex-wrap justify-between gap-4" aria-label={t.chapters} data-reader-hide>
            {data.prev ? (
              <Link href={href(`/tutorial/${book.slug}/${data.prev.slug}`)} className="link-more">
                <ArrowLeft size={14} aria-hidden="true" />
                {data.prev.title}
              </Link>
            ) : (
              <span />
            )}
            {data.next && (
              <Link href={href(`/tutorial/${book.slug}/${data.next.slug}`)} className="link-more">
                {data.next.title}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            )}
          </nav>
        </div>
      </section>
    </>
  );
}
