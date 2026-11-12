import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

/** Link interni del backend: `entity://<tipo>/<slug>` → URL del sito. */
function entityPath(entity: string, slug: string): string {
  switch (entity) {
    case 'post':
    case 'article':
      return `/blog/${slug}`;
    case 'tutorial':
      return `/tutorial/${slug}`;
    case 'category':
      return `/blog?category=${slug}`;
    case 'tag':
      return `/blog?tag=${slug}`;
    default:
      return '/blog';
  }
}

/**
 * Render article/tutorial body content coming from the backend.
 * Il backend invia Markdown (a volte con HTML dentro); il risultato viene sanitizzato.
 */
export async function renderContent(raw?: string | null): Promise<string> {
  if (!raw) return '';

  const withLinks = raw.replace(
    /\]\(entity:\/\/([^/)\s]+)\/([^)\s]+)\)/g,
    (_, entity: string, slug: string) => `](${entityPath(entity, decodeURIComponent(slug))})`,
  );

  const html = await marked.parse(withLinks);

  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['target', 'rel'],
  });
}
