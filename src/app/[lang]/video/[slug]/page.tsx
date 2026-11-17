import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { videoService, isNotFoundError } from '@/lib/services';
import type { PlaylistWithVideos } from '@/lib/types';
import { VideoCard } from '@/components/VideoCard';
import { toLocale, type Locale } from '@/lib/i18n/config';
import { getMessages, pluralize } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { openGraphBase, pageAlternates } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string; slug: string }>;
}

/** `unavailable`: il backend non risponde (errore temporaneo); playlist assente e non `unavailable` = 404. */
async function load(slug: string, locale: Locale): Promise<{ data: PlaylistWithVideos | null; unavailable: boolean }> {
  try {
    return { data: await videoService.getPlaylist(slug, locale), unavailable: false };
  } catch (error) {
    if (isNotFoundError(error)) return { data: null, unavailable: false };
    console.error('Playlist non disponibile:', error);
    return { data: null, unavailable: true };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const { data } = await load(slug, locale);
  if (!data) return { title: getMessages(locale).video.metaTitle, robots: { index: false, follow: true } };
  const alternates = pageAlternates({ locale, internalPath: `/video/${slug}` });
  return {
    title: data.playlist.title,
    description: data.playlist.description || undefined,
    alternates,
    openGraph: {
      ...openGraphBase(locale),
      title: data.playlist.title,
      description: data.playlist.description || undefined,
      url: alternates.canonical as string,
    },
  };
}

export default async function PlaylistPage({ params }: PageProps) {
  const { lang, slug } = await params;
  const locale = toLocale(lang);
  const t = getMessages(locale).video;
  const { data, unavailable } = await load(slug, locale);

  if (!data) {
    if (!unavailable) notFound();
    return (
      <section className="section">
        <div className="container-page">
          <div className="empty-state">
            <span className="eyebrow">{getMessages(locale).common.notAvailable.eyebrow}</span>
            <h1 className="empty-state-title mt-3">{t.unavailableTitle}</h1>
            <p className="empty-state-copy">{t.unavailableCopy}</p>
            <Link href={localizedPath(locale, '/video')} className="btn btn-primary btn-sm mt-6">
              {t.backToVideos}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const { playlist, videos } = data;
  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <Link href={localizedPath(locale, '/video')} className="link-more mb-6 inline-flex">
            <ArrowLeft size={14} aria-hidden="true" />
            {t.backToVideos}
          </Link>
          <h1 className="page-title">{playlist.title}</h1>
          {playlist.description && <p className="page-lede">{playlist.description}</p>}
          {videos.length > 0 && (
            <p className="mt-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">
              {pluralize(locale, t.videos, videos.length)}
            </p>
          )}
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          {videos.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} playlistSlug={playlist.slug} locale={locale} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h2 className="empty-state-title">{t.emptyPlaylist}</h2>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
