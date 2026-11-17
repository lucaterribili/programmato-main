import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { videoService, isNotFoundError } from '@/lib/services';
import { embedUrlOf, fileUrlOf } from '@/lib/services/video';
import type { PlaylistWithVideos, Video } from '@/lib/types';
import { VideoPlayer } from '@/components/VideoPlayer';
import { VideoCard } from '@/components/VideoCard';
import config from '@/lib/config';
import { INTL_LOCALE, toLocale, type Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { absoluteUrl, openGraphBase, pageAlternates } from '@/lib/i18n/seo';
import { formatDuration, isoDuration } from '@/lib/video-format';

interface PageProps {
  params: Promise<{ lang: string; slug: string; video: string }>;
}

async function load(
  slug: string,
  videoSlug: string,
  locale: Locale,
): Promise<{ data: PlaylistWithVideos | null; video: Video | null; unavailable: boolean }> {
  try {
    const data = await videoService.getPlaylist(slug, locale);
    const video = data.videos.find((v) => v.slug === videoSlug || String(v.id) === videoSlug) ?? null;
    return { data, video, unavailable: false };
  } catch (error) {
    if (isNotFoundError(error)) return { data: null, video: null, unavailable: false };
    console.error('Video non disponibile:', error);
    return { data: null, video: null, unavailable: true };
  }
}

const abs = (url?: string | null) => {
  if (!url) return undefined;
  try {
    return new URL(url, `${config.siteUrl.replace(/\/+$/, '')}/`).toString();
  } catch {
    return undefined;
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug, video: videoSlug } = await params;
  const locale = toLocale(lang);
  const { video } = await load(slug, videoSlug, locale);
  if (!video) return { title: getMessages(locale).video.metaTitle, robots: { index: false, follow: true } };
  const alternates = pageAlternates({ locale, internalPath: `/video/${slug}/${video.slug}` });
  const description = video.summary?.replace(/<[^>]+>/g, '').slice(0, 300) || undefined;
  const cover = video.image?.thumbnails?.large ?? video.image?.path ?? video.thumbnailUrl;
  return {
    title: video.title,
    description,
    alternates,
    openGraph: {
      ...openGraphBase(locale),
      type: 'video.other',
      title: video.title,
      description,
      url: alternates.canonical as string,
      ...(cover ? { images: [{ url: abs(cover) as string }] } : {}),
    },
  };
}

export default async function VideoPage({ params }: PageProps) {
  const { lang, slug, video: videoSlug } = await params;
  const locale = toLocale(lang);
  const t = getMessages(locale).video;
  const { data, video, unavailable } = await load(slug, videoSlug, locale);

  if (!data || !video) {
    if (!unavailable) notFound();
    return (
      <section className="section">
        <div className="container-page">
          <div className="empty-state">
            <span className="eyebrow">{getMessages(locale).common.notAvailable.eyebrow}</span>
            <h1 className="empty-state-title mt-3">{t.unavailableTitle}</h1>
            <p className="empty-state-copy">{t.unavailableCopy}</p>
            <Link href={localizedPath(locale, `/video/${slug}`)} className="btn btn-primary btn-sm mt-6">
              {t.backToPlaylist}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const fileUrl = fileUrlOf(video);
  const embedUrl = embedUrlOf(video);
  const poster = video.image?.thumbnails?.large ?? video.image?.path ?? video.thumbnailUrl;
  const duration = formatDuration(video.duration);
  const date = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString(INTL_LOCALE[locale], { dateStyle: 'long' })
    : null;
  const others = data.videos.filter((v) => v.id !== video.id);
  const description = video.summary?.replace(/<[^>]+>/g, '') ?? '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.title,
    description: description || video.title,
    ...(poster ? { thumbnailUrl: abs(poster) } : {}),
    ...(video.publishedAt ? { uploadDate: video.publishedAt } : {}),
    ...(isoDuration(video.duration) ? { duration: isoDuration(video.duration) } : {}),
    ...(embedUrl ? { embedUrl } : {}),
    ...(fileUrl ? { contentUrl: fileUrl } : {}),
    url: absoluteUrl(localizedPath(locale, `/video/${slug}/${video.slug}`)),
  };

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <Link href={localizedPath(locale, `/video/${slug}`)} className="link-more mb-6 inline-flex">
            <ArrowLeft size={14} aria-hidden="true" />
            {data.playlist.title}
          </Link>
          <h1 className="page-title">{video.title}</h1>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.1em] text-muted">
            {[duration && `${t.duration} ${duration}`, date && `${t.published} ${date}`].filter(Boolean).join(' · ')}
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10">
          <div className="max-w-4xl">
            {fileUrl ? (
              <VideoPlayer
                src={fileUrl}
                title={video.title}
                poster={poster}
                labels={{ speed: t.speed, error: t.playerError, openInNewTab: t.openInNewTab, unsupported: t.noVideoSupport }}
              />
            ) : embedUrl ? (
              <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
                <iframe
                  src={embedUrl}
                  title={video.title}
                  className="h-full w-full"
                  loading="lazy"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : null}
            {description && <p className="mt-8 max-w-3xl whitespace-pre-line text-lg leading-relaxed">{description}</p>}
          </div>

          {others.length > 0 && (
            <div>
              <h2 className="mb-6 font-mono text-xs uppercase tracking-[0.1em] text-muted">{t.inThisPlaylist}</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {others.map((v) => (
                  <VideoCard key={v.id} video={v} playlistSlug={data.playlist.slug} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
