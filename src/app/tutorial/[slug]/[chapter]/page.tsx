import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import tutorialService from '@/lib/services/tutorial';
import { renderContent } from '@/lib/render';

interface PageProps {
  params: Promise<{ slug: string; chapter: string }>;
}

export const revalidate = 300;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { chapter } = await params;
  const data = await tutorialService.getChapter(chapter);
  if (!data) return { title: 'Tutorial' };
  return { title: data.seoTitle, description: data.seoDescription || undefined };
}

export default async function TutorialChapterPage({ params }: PageProps) {
  const { slug, chapter } = await params;
  const data = await tutorialService.getChapter(chapter);
  if (!data) notFound();

  const html = await renderContent(data.body);
  const book = data.book ?? { slug, title: 'Torna alla guida' };

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <Link href={`/tutorial/${book.slug}`} className="link-more mb-6 inline-flex">
            <ArrowLeft size={14} aria-hidden="true" />
            {book.title}
          </Link>
          <h1 className="page-title max-w-4xl">{data.title}</h1>
          {data.description && <p className="page-lede max-w-3xl">{data.description}</p>}
        </div>
      </header>

      <section className="section">
        <div className="container-page max-w-3xl">
          <div className="prose-page" dangerouslySetInnerHTML={{ __html: html }} />

          <nav className="mt-12 flex flex-wrap justify-between gap-4" aria-label="Capitoli">
            {data.prev ? (
              <Link href={`/tutorial/${book.slug}/${data.prev.slug}`} className="link-more">
                <ArrowLeft size={14} aria-hidden="true" />
                {data.prev.title}
              </Link>
            ) : <span />}
            {data.next && (
              <Link href={`/tutorial/${book.slug}/${data.next.slug}`} className="link-more">
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
