import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from '@/lib/i18n/config';
import { SECTIONS, internalSegments, localizedPath, type Section } from '@/lib/i18n/paths';

/**
 * Routing per lingua. Le pagine stanno in `src/app/[lang]/…` con cartelle italiane:
 *   /blog/x            → /it/blog/x          (italiano: nessun prefisso, riscrittura trasparente)
 *   /en/tutorials/x    → /en/tutorial/x      (segmenti tradotti → cartella reale)
 *   /it/blog/x         → /blog/x             (redirect 308: una sola URL per pagina)
 *   /en/chi-siamo      → /en/about           (redirect 308: il segmento italiano in un'altra lingua non è canonico)
 * La lingua scelta dall'utente vale solo sulla home: un link a una pagina specifica si apre sempre nella lingua del link.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  // /it e /it/... → senza prefisso
  if (first === DEFAULT_LOCALE) {
    const rest = segments.slice(1);
    const url = request.nextUrl.clone();
    url.pathname = rest.length ? `/${rest.join('/')}` : '/';
    return NextResponse.redirect(url, 308);
  }

  // /en/... e /ru/...
  if (isLocale(first)) {
    const locale: Locale = first;
    const rest = segments.slice(1);
    const internal = internalSegments(locale, rest);

    // Il segmento italiano usato in un'altra lingua (/en/chi-siamo): si porta al segmento tradotto.
    if (rest.length > 0 && internal[0] === rest[0]) {
      const section = (Object.keys(SECTIONS) as Section[]).find((s) => s === rest[0]);
      if (section && SECTIONS[section][locale] !== rest[0]) {
        const url = request.nextUrl.clone();
        url.pathname = localizedPath(locale, `/${[...rest].join('/')}`);
        return NextResponse.redirect(url, 308);
      }
    }

    const target = new URL(request.url);
    target.pathname = `/${locale}${internal.length ? `/${internal.join('/')}` : ''}`;
    return NextResponse.rewrite(target);
  }

  // Italiano, senza prefisso
  if (segments.length === 0) {
    // Home: chi ha scelto un'altra lingua la ritrova, ma solo arrivando dall'esterno (un clic interno su «Italiano»
    // deve poter tornare all'italiano anche prima che il cookie sia aggiornato).
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value?.toLowerCase();
    const fetchSite = request.headers.get('sec-fetch-site');
    const external = !fetchSite || fetchSite === 'none' || fetchSite === 'cross-site';
    if (external && preferred && isLocale(preferred) && preferred !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}`;
      return NextResponse.redirect(url, 307);
    }
  }

  const target = new URL(request.url);
  target.pathname = segments.length ? `/${DEFAULT_LOCALE}/${segments.join('/')}` : `/${DEFAULT_LOCALE}`;
  target.search = search;
  return NextResponse.rewrite(target);
}

export const config = {
  // Niente per asset, file statici, sitemap e robots: li servono direttamente.
  matcher: ['/((?!_next/|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|.*\\..*).*)'],
};

