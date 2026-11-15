/** Serializzazione XML di sitemap e indice, senza dipendenze. */
export interface RenderedUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  alternates: Array<{ hreflang: string; href: string }>;
}

export interface SitemapIndexEntry {
  loc: string;
  lastmod?: string;
}

export function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function urlEntry(url: RenderedUrl): string {
  const lines = [`    <loc>${xmlEscape(url.loc)}</loc>`];
  if (url.lastmod) lines.push(`    <lastmod>${xmlEscape(url.lastmod)}</lastmod>`);
  if (url.changefreq) lines.push(`    <changefreq>${url.changefreq}</changefreq>`);
  if (url.priority !== undefined) lines.push(`    <priority>${url.priority.toFixed(1)}</priority>`);
  for (const alternate of url.alternates) {
    lines.push(
      `    <xhtml:link rel="alternate" hreflang="${xmlEscape(alternate.hreflang)}" href="${xmlEscape(alternate.href)}"/>`,
    );
  }
  return `  <url>\n${lines.join('\n')}\n  </url>`;
}

export function renderUrlset(urls: readonly RenderedUrl[]): string {
  const parts = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];
  if (urls.length) parts.push(urls.map(urlEntry).join('\n'));
  parts.push('</urlset>');
  return parts.join('\n');
}

export function renderSitemapIndex(children: readonly SitemapIndexEntry[]): string {
  const body = children
    .map((child) => {
      const lines = [`    <loc>${xmlEscape(child.loc)}</loc>`];
      if (child.lastmod) lines.push(`    <lastmod>${xmlEscape(child.lastmod)}</lastmod>`);
      return `  <sitemap>\n${lines.join('\n')}\n  </sitemap>`;
    })
    .join('\n');
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    body,
    '</sitemapindex>',
  ].join('\n');
}
