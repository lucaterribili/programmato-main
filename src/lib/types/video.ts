import type { ImageData, User } from './common';

export interface Playlist {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  image: ImageData | null;
}

export interface Video {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  publishedAt: string | null;
  author: User | null;
  image: ImageData | null;
  /** L'indirizzo inserito nel pannello (YouTube, file su R2, altro). */
  videoUrl: string | null;
  /** Durata ISO 8601 (`PT4M13S`), se nota. */
  duration: string | null;
  embedUrl: string | null;
  contentUrl: string | null;
  thumbnailUrl: string | null;
}

export interface PlaylistWithVideos {
  playlist: Playlist;
  videos: Video[];
}
