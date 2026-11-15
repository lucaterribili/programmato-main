/**
 * Lingue del sito. L'italiano è la lingua di default e non ha prefisso nell'URL (`/blog`); le altre sì (`/en/blog`,
 * `/ru/blog`). Le cartelle di `src/app/[lang]` hanno nomi italiani: i segmenti pubblici delle altre lingue sono tradotti
 * (`/en/about`, `/ru/o-nas`) e il proxy li riscrive verso la cartella reale.
 */
export const LOCALES = ['it', 'en', 'ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'it';

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Lingua da un valore qualsiasi (header, cookie, parametro): quella di default se sconosciuto. */
export function toLocale(value: string | undefined | null): Locale {
  const lower = value?.toLowerCase();
  return isLocale(lower) ? lower : DEFAULT_LOCALE;
}

/** Il codice `hreflang` di ogni lingua. */
export const HREFLANG: Record<Locale, string> = { it: 'it', en: 'en', ru: 'ru' };

/** `og:locale`. */
export const OG_LOCALE: Record<Locale, string> = { it: 'it_IT', en: 'en_US', ru: 'ru_RU' };

/** Locale `Intl` per date e numeri. */
export const INTL_LOCALE: Record<Locale, string> = { it: 'it-IT', en: 'en-GB', ru: 'ru-RU' };

/** Il nome di ogni lingua, scritto nella lingua stessa (mai tradotto: chi cerca la propria lingua la riconosce). */
export const LANGUAGE_NAME: Record<Locale, string> = { it: 'Italiano', en: 'English', ru: 'Русский' };

/** Nome del cookie che ricorda la lingua scelta. */
export const LOCALE_COOKIE = 'language';
