import type { Locale } from '../config';
import { it } from './it';
import { en, type Messages } from './en';
import { ru } from './ru';
import type { Plural } from './types';

export type { Messages, Plural };
export { plural } from './types';

const ALL: Record<Locale, Messages> = { it, en, ru };

export function getMessages(locale: Locale): Messages {
  return ALL[locale];
}

/** Sostituisce i segnaposto `{nome}` di un testo. */
export function format(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

/** Sceglie la forma plurale corretta per la lingua (russo: uno / pochi / molti) e sostituisce i segnaposto. */
export function pluralize(
  locale: Locale,
  forms: Plural,
  count: number,
  extra: Record<string, string | number> = {},
): string {
  const category = new Intl.PluralRules(locale).select(count) as keyof Plural;
  const template = forms[category] ?? forms.other;
  return format(template, { n: count, ...extra });
}
