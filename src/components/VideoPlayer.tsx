'use client';

import { useRef, useState } from 'react';

interface VideoPlayerProps {
  /** L'indirizzo del file (mp4/webm) servito da R2 o da un altro host. */
  src: string;
  title: string;
  poster?: string | null;
  labels: { speed: string; error: string; openInNewTab: string; unsupported: string };
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

function mimeOf(src: string): string | undefined {
  const path = src.split('?')[0].toLowerCase();
  if (path.endsWith('.webm')) return 'video/webm';
  if (path.endsWith('.ogv')) return 'video/ogg';
  if (path.endsWith('.mp4') || path.endsWith('.m4v')) return 'video/mp4';
  if (path.endsWith('.mov')) return 'video/quicktime';
  return undefined;
}

/**
 * Il lettore dei video che non stanno su YouTube (i file su Cloudflare R2): elemento `<video>` con i controlli del
 * browser (tastiera, schermo intero, accessibilità) e in più la velocità di riproduzione. I metadati si caricano subito
 * (durata, primo fotogramma), il video solo con il play.
 */
export function VideoPlayer({ src, title, poster, labels }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);
  const [failed, setFailed] = useState(false);

  const changeSpeed = (value: number) => {
    setSpeed(value);
    if (ref.current) ref.current.playbackRate = value;
  };

  if (failed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-black p-6 text-center text-white">
        <p>
          {labels.error}{' '}
          <a href={src} className="underline" target="_blank" rel="noopener noreferrer">
            {labels.openInNewTab}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
        <video
          ref={ref}
          className="h-full w-full"
          controls
          playsInline
          preload="metadata"
          poster={poster ?? undefined}
          aria-label={title}
          onError={() => setFailed(true)}
          onLoadedMetadata={() => {
            if (ref.current) ref.current.playbackRate = speed;
          }}
        >
          <source src={src} type={mimeOf(src)} />
          {labels.unsupported}
        </video>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 text-sm text-muted">
        <label htmlFor="video-speed">{labels.speed}</label>
        <select
          id="video-speed"
          value={speed}
          onChange={(e) => changeSpeed(Number(e.target.value))}
          className="rounded border border-current/30 bg-transparent px-2 py-1"
        >
          {SPEEDS.map((s) => (
            <option key={s} value={s}>
              {s}×
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
