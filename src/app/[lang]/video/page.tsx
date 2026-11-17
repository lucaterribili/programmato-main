import type { Metadata } from 'next';
import Link from 'next/link';
import { videoService } from '@/lib/services';
import { LANGUAGE_NAME, toLocale } from '@/lib/i18n/config';
import { getMessages, pluralize } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { allLocales, openGraphBase, pageAlternates } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).video;
  const alternates = pageAlternates({ locale, internalPath: '/video', variants: allLocales('/video') });
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates,
    openGraph: { ...openGraphBase(locale), title: t.metaTitle, description: t.metaDescription, url: alternates.canonical as string },
  };
}

export default async function VideoIndexPage({ params }: PageProps) {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).video;
  let playlists: Awaited<ReturnType<typeof videoService.getPlaylists>> = [];
  try {
    playlists = await videoService.getPlaylists(locale);
  } catch (error) {
    console.error('Playlist non disponibili:', error);
  }

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">{t.pill}</span>
          <h1 className="page-title">{t.title}</h1>
          <p className="page-lede">{t.lede}</p>
          {playlists.length > 0 && (
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">
              {pluralize(locale, t.count, playlists.length)}
            </p>
          )}
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          {playlists.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {playlists.map((playlist) => (
                <article key={playlist.id} className="tutorial-card">
                  <Link href={localizedPath(locale, `/video/${playlist.slug}`)} className="tutorial-body">
                    <h2 className="tutorial-title">{playlist.title}</h2>
                    {playlist.description && <p className="tutorial-description">{playlist.description}</p>}
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="eyebrow">{t.emptyEyebrow}</span>
              <h2 className="empty-state-title mt-3">{t.emptyTitle}</h2>
              <p className="empty-state-copy">{locale === 'it' ? t.emptyCopy : t.emptyOtherLanguage}</p>
              {locale !== 'it' && (
                <Link href={localizedPath('it', '/video')} hrefLang="it" lang="it" className="btn btn-outline btn-sm mt-6">
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
