import { isDegradableError } from './http';
import { apiGet, mapImage, mapUser, type RawImage, type RawUser } from './backend';
import type { Playlist, PlaylistWithVideos, Video } from '@/lib/types';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';

interface RawPlaylist {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  image?: RawImage | null;
}

interface RawVideo {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  createdAt?: string | null;
  user?: RawUser | null;
  image?: RawImage | null;
  videoUrl?: string | null;
  duration?: string | number | null;
  embedUrl?: string | null;
  contentUrl?: string | null;
  thumbnailUrl?: string | null;
}

const FILE_URL = /\.(mp4|m4v|webm|ogv|mov)(\?.*)?$/i;

const mapPlaylist = (raw: RawPlaylist): Playlist => ({
  id: raw.id,
  title: raw.title,
  slug: raw.slug,
  description: raw.description ?? null,
  image: mapImage(raw.image),
});

const mapVideo = (raw: RawVideo): Video => ({
  id: raw.id,
  title: raw.title,
  slug: raw.slug,
  summary: raw.summary ?? null,
  publishedAt: raw.createdAt ?? null,
  author: mapUser(raw.user),
  image: mapImage(raw.image),
  videoUrl: raw.videoUrl ?? null,
  duration: raw.duration == null || raw.duration === '' ? null : String(raw.duration),
  embedUrl: raw.embedUrl ?? null,
  contentUrl: raw.contentUrl ?? null,
  thumbnailUrl: raw.thumbnailUrl ?? null,
});

/** L'indirizzo di un file riproducibile dal lettore del sito (mp4, webm…), se il video è un file; altrimenti null. */
export function fileUrlOf(video: Pick<Video, 'contentUrl' | 'videoUrl'>): string | null {
  if (video.contentUrl && FILE_URL.test(video.contentUrl)) return video.contentUrl;
  if (video.videoUrl && FILE_URL.test(video.videoUrl)) return video.videoUrl;
  return null;
}

/** L'indirizzo da incorporare in un iframe (YouTube in `youtube-nocookie`), se il video non è un file. */
export function embedUrlOf(video: Pick<Video, 'embedUrl' | 'videoUrl' | 'contentUrl'>): string | null {
  if (fileUrlOf(video)) return null;
  if (video.embedUrl) return video.embedUrl.replace('://www.youtube.com/embed/', '://www.youtube-nocookie.com/embed/');
  if (!video.videoUrl) return null;
  try {
    const u = new URL(video.videoUrl);
    const host = u.hostname.replace(/^www\./, '');
    const id = host === 'youtu.be' ? u.pathname.slice(1) : host === 'youtube.com' ? u.searchParams.get('v') : null;
    if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
  return null;
}

class VideoService {
  async getPlaylists(locale: Locale = DEFAULT_LOCALE): Promise<Playlist[]> {
    try {
      const raw = await apiGet<RawPlaylist[]>('/playlist/list', locale);
      return Array.isArray(raw) ? raw.map(mapPlaylist) : [];
    } catch (error) {
      if (isDegradableError(error)) return [];
      throw error;
    }
  }

  /** La playlist con i suoi video; 404 del backend → errore `HttpError` (la pagina fa `notFound()`). */
  async getPlaylist(slug: string, locale: Locale = DEFAULT_LOCALE): Promise<PlaylistWithVideos> {
    const raw = await apiGet<{ taxonomy: RawPlaylist; videos?: RawVideo[] }>(
      `/playlist/contents/${encodeURIComponent(slug)}`,
      locale,
    );
    return { playlist: mapPlaylist(raw.taxonomy), videos: (raw.videos ?? []).map(mapVideo) };
  }
}

const videoService = new VideoService();
export default videoService;
