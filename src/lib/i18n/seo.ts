import type { Metadata } from 'next';
import config from '@/lib/config';
import { fetchSitemapEntries } from '@/lib/sitemap/fetch';
import { internalPathOf } from '@/lib/sitemap/build';
import type { EntryType } from '@/lib/sitemap/types';
import { HREFLANG, LOCALES, OG_LOCALE, isLocale, type Locale } from './config';
import { localizedPath } from './paths';

const site = () => config.siteUrl.replace(/\/+$/, '');

export const absoluteUrl = (path: string): string => `${site()}${path}`;

/**
 * Il canonical impostato a mano nel pannello (per la singola lingua): URL assoluto, o percorso relativo al sito.
 * Vuoto o non interpretabile → null (si usa l'URL della pagina).
 */
export function editorialCanonical(canonical?: string | null): string | null {
  const raw = canonical?.trim();
  if (!raw) return null;
  try {
    return new URL(raw.startsWith('//') ? `https:${raw}` : raw, `${site()}/`).toString();
  } catch {
    return null;
  }
}

/** Percorsi interni di una pagina fissa in tutte le lingue. */
export function allLocales(internalPath: string): Partial<Record<Locale, string>> {
  return Object.fromEntries(LOCALES.map((l) => [l, internalPath])) as Partial<Record<Locale, string>>;
}

interface AlternatesInput {
  locale: Locale;
  /** Percorso interno della pagina nella lingua corrente (`/blog/mio-slug`). */
  internalPath: string;
  /** Percorsi interni delle varianti per lingua, dove esistono (la lingua corrente è sempre inclusa). */
  variants?: Partial<Record<Locale, string>>;
  /** Canonical editoriale della voce, se impostato. */
  canonical?: string | null;
}

/**
 * `canonical` + `hreflang` della pagina. Il canonical editoriale, se c'è, vince sull'URL della pagina; gli `hreflang`
 * elencano solo le lingue in cui la pagina esiste davvero (la traduzione non esiste = nessun link), più `x-default`.
 */
export function pageAlternates({ locale, internalPath, variants, canonical }: AlternatesInput): NonNullable<Metadata['alternates']> {
  const all: Partial<Record<Locale, string>> = { ...(variants ?? {}), [locale]: internalPath };
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    const path = all[l];
    if (path) languages[HREFLANG[l]] = absoluteUrl(localizedPath(l, path));
  }
  const defaultPath = all.it ? absoluteUrl(localizedPath('it', all.it)) : languages[HREFLANG[locale]];
  languages['x-default'] = defaultPath;

  return {
    canonical: editorialCanonical(canonical) ?? absoluteUrl(localizedPath(locale, internalPath)),
    languages,
  };
}

/**
 * Le varianti linguistiche di un contenuto, prese dalla sitemap del backend: lo slug cambia con la lingua, quindi non si può
 * derivare. Se la lettura fallisce restituisce solo la lingua corrente (niente `hreflang` inventati).
 */
export async function contentVariants(
  type: EntryType,
  locale: Locale,
  slug: string,
): Promise<Partial<Record<Locale, string>>> {
  try {
    const data = await fetchSitemapEntries();
    const entry = (data.entries?.[type] ?? []).find((e) => e.locale === locale && e.slug === slug);
    if (!entry) return {};
    const variants: Partial<Record<Locale, string>> = {};
    const self = internalPathOf(type, entry);
    if (self) variants[locale] = self;
    for (const alt of entry.alternates ?? []) {
      if (!isLocale(alt.locale)) continue;
      const path = internalPathOf(type, alt);
      if (path) variants[alt.locale] = path;
    }
    return variants;
  } catch {
    return {};
  }
}

/** Il blocco Open Graph comune: lingua, alternative, sito. Le pagine ci aggiungono titolo, descrizione e URL. */
export function openGraphBase(locale: Locale): NonNullable<Metadata['openGraph']> {
  return {
    type: 'website',
    locale: OG_LOCALE[locale],
    alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    siteName: 'Programmato',
  };
}

/** Metadati di una pagina fissa (uguale in tutte le lingue come struttura, tradotta nel testo). */
export function staticPageMetadata(
  locale: Locale,
  internalPath: string,
  title: string,
  description: string,
): Metadata {
  const alternates = pageAlternates({ locale, internalPath, variants: allLocales(internalPath) });
  return {
    title,
    description,
    alternates,
    openGraph: { ...openGraphBase(locale), title, description, url: alternates.canonical as string },
  };
}
