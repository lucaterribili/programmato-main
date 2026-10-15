const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "http://localhost:9000/laravelbucket";

export function mediaUrl(path?: string): string | undefined {
  if (!path) return undefined;
  return `${MEDIA_BASE_URL}/${path}`;
}
