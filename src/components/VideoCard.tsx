/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { Play } from 'lucide-react';
import type { Video } from '@/lib/types';
import { INTL_LOCALE, type Locale } from '@/lib/i18n/config';
import { localizedPath } from '@/lib/i18n/paths';
import { formatDuration } from '@/lib/video-format';

interface VideoCardProps {
  video: Video;
  playlistSlug: string;
  locale: Locale;
}

export function VideoCard({ video, playlistSlug, locale }: VideoCardProps) {
  const cover = video.image?.thumbnails?.cover ?? video.image?.path ?? video.thumbnailUrl;
  const duration = formatDuration(video.duration);
  const date = video.publishedAt
    ? new Date(video.publishedAt).toLocaleDateString(INTL_LOCALE[locale], { dateStyle: 'medium' })
    : null;
  return (
    <article className="article-card">
      <Link
        href={localizedPath(locale, `/video/${playlistSlug}/${video.slug}`)}
        className="article-card-link"
        aria-label={video.title}
      >
        <div className="article-media relative">
          {cover ? (
            <img src={cover} alt={video.title} loading="lazy" />
          ) : (
            <div className="article-media--empty h-full w-full">
              <Play size={38} strokeWidth={1.3} aria-hidden="true" />
            </div>
          )}
          {duration && (
            <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-xs text-white">
              {duration}
            </span>
          )}
        </div>
        <div className="article-body">
          {date && (
            <div className="article-meta">
              <span>{date}</span>
            </div>
          )}
          <h3 className="article-title">{video.title}</h3>
          {video.summary && <p className="article-excerpt">{video.summary.replace(/<[^>]+>/g, '')}</p>}
        </div>
      </Link>
    </article>
  );
}
