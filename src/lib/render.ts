import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { localizedPath } from '@/lib/i18n/paths';

/** Link interni del backend: `entity://<tipo>/<slug>` → URL del sito. */
function entityPath(entity: string, slug: string, locale: Locale): string {
  switch (entity) {
    case 'post':
    case 'article':
      return localizedPath(locale, `/blog/${slug}`);
    case 'tutorial':
      return localizedPath(locale, `/tutorial/${slug}`);
    case 'category':
      return localizedPath(locale, `/blog?category=${slug}`);
    case 'tag':
      return localizedPath(locale, `/blog?tag=${slug}`);
    default:
      return localizedPath(locale, '/blog');
  }
}

/** Altezza massima, in pixel, a cui si lascia ingrandire un diagramma per riempire la colonna. */
const MAX_DIAGRAM_HEIGHT = 1000;

/**
 * Mermaid scrive sull'SVG `max-width: <larghezza naturale>px`: un diagramma stretto resta una striscia piccola. Si porta il
 * limite a quanto serve per riempire la colonna, purché l'altezza non superi {@link MAX_DIAGRAM_HEIGHT} (un flusso
 * verticale non si ingrandisce fino a diventare lunghissimo); mai sotto la larghezza naturale, mai oltre la colonna.
 */
function fitDiagrams(html: string): string {
  return html.replace(/<svg\b[^>]*>/g, (tag) => {
    const box = /viewBox="\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/.exec(tag);
    if (!box) return tag;
    const width = parseFloat(box[1]);
    const height = parseFloat(box[2]);
    if (!(width > 0) || !(height > 0)) return tag;
    const limit = `max-width: min(100%, ${Math.round(Math.max(width, (MAX_DIAGRAM_HEIGHT * width) / height))}px);`;
    return /style="/.test(tag)
      ? tag.replace(/style="([^"]*)"/, (_m, css: string) => `style="${css.replace(/max-width:[^;]*;?\s*/g, '')}${limit}"`)
      : tag.replace(/<svg\b/, `<svg style="${limit}"`);
  });
}

/** Ogni tabella sta in un contenitore che scorre in orizzontale: su telefono una tabella larga non allarga la pagina. */
function wrapTables(html: string): string {
  return html.replace(/<table\b/g, '<div class="table-wrap"><table').replace(/<\/table>/g, '</table></div>');
}

/**
 * Render article/tutorial body content coming from the backend.
 * Il backend invia Markdown (a volte con HTML dentro); il risultato viene sanitizzato.
 */
export async function renderContent(raw?: string | null, locale: Locale = DEFAULT_LOCALE): Promise<string> {
  if (!raw) return '';

  const withLinks = raw.replace(
    /\]\(entity:\/\/([^/)\s]+)\/([^)\s]+)\)/g,
    (_, entity: string, slug: string) => `](${entityPath(entity, decodeURIComponent(slug), locale)})`,
  );

  const html = await marked.parse(withLinks);

  return wrapTables(
    fitDiagrams(
      DOMPurify.sanitize(html, {
        ADD_ATTR: ['target', 'rel'],
      }),
    ),
  );
}
