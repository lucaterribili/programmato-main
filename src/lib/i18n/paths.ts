import { DEFAULT_LOCALE, LOCALES, type Locale } from './config';

/**
 * Le sezioni del sito: la chiave è il nome della cartella in `src/app/[lang]` (italiano), i valori sono il segmento
 * pubblico in ciascuna lingua. Per l'italiano coincidono.
 */
export const SECTIONS = {
  blog: { it: 'blog', en: 'blog', ru: 'blog' },
  tutorial: { it: 'tutorial', en: 'tutorials', ru: 'uroki' },
  search: { it: 'search', en: 'search', ru: 'poisk' },
  'chi-siamo': { it: 'chi-siamo', en: 'about', ru: 'o-nas' },
  contatti: { it: 'contatti', en: 'contact', ru: 'kontakty' },
  privacy: { it: 'privacy', en: 'privacy', ru: 'konfidencialnost' },
  cookie: { it: 'cookie', en: 'cookie', ru: 'cookie' },
} as const satisfies Record<string, Record<Locale, string>>;

export type Section = keyof typeof SECTIONS;

function isSection(value: string): value is Section {
  return Object.prototype.hasOwnProperty.call(SECTIONS, value);
}

/** Il prefisso di lingua nell'URL: nessuno per l'italiano. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? '' : `/${locale}`;
}

/**
 * L'URL pubblico di un percorso interno (`/blog/mio-articolo`, `/tutorial/guida/capitolo?x=1`) in una lingua.
 * Il primo segmento si traduce; slug e query restano come sono.
 */
export function localizedPath(locale: Locale, internalPath: string): string {
  const match = /^([^?#]*)(\?[^#]*)?(#.*)?$/.exec(internalPath);
  const pure = match?.[1] ?? internalPath;
  const query = match?.[2] ?? '';
  const hash = match?.[3] ?? '';

  const segments = pure.split('/').filter(Boolean);
  if (segments.length > 0 && isSection(segments[0])) segments[0] = SECTIONS[segments[0]][locale];

  const base = segments.length === 0 ? localePrefix(locale) || '/' : `${localePrefix(locale)}/${segments.join('/')}`;
  return `${base}${query}${hash}`;
}

/** Il contrario: dai segmenti pubblici di una lingua (senza prefisso) al percorso interno italiano. */
export function internalSegments(locale: Locale, segments: string[]): string[] {
  if (segments.length === 0) return segments;
  const [first, ...rest] = segments;
  for (const section of Object.keys(SECTIONS) as Section[]) {
    if (SECTIONS[section][locale] === first) return [section, ...rest];
  }
  return segments;
}

/** Il percorso interno di una sezione italiana dato il segmento pubblico di qualunque lingua (per i redirect). */
export function allPublicSegments(section: Section): string[] {
  return LOCALES.map((l) => SECTIONS[section][l]);
}

/**
 * I segmenti interni (italiani) di un percorso, qualunque forma abbia: pubblico (`/en/about`, `/chi-siamo`) o interno
 * riscritto dal proxy (`/it/chi-siamo`, `/ru/chi-siamo`). `usePathname()` può restituire l'una o l'altra a seconda del
 * momento (render del server, navigazione dal client), quindi si normalizza qui.
 */
export function toInternalSegments(pathname: string, locale: Locale): string[] {
  const segments = pathname.split('/').filter(Boolean);
  const rest = segments.length > 0 && (LOCALES as readonly string[]).includes(segments[0]) ? segments.slice(1) : segments;
  return internalSegments(locale, rest);
}

/**
 * L'URL equivalente della pagina corrente in un'altra lingua, per il selettore. Le pagine fisse si traducono nel segmento;
 * per i contenuti (articoli, tutorial) lo slug cambia con la lingua e non si può indovinare: senza una variante nota si va
 * all'elenco della sezione.
 */
export function switchLocalePath(pathname: string, from: Locale, to: Locale): string {
  const internal = toInternalSegments(pathname, from);
  const isContentPage = (internal[0] === 'blog' || internal[0] === 'tutorial') && internal.length > 1;
  const target = isContentPage ? internal.slice(0, 1) : internal;
  return localizedPath(to, `/${target.join('/')}`);
}
