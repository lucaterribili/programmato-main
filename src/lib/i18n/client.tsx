'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Locale } from './config';
import type { Messages } from './messages';
import { format, pluralize } from './messages';
import { localizedPath } from './paths';

/** I testi che servono ai componenti client (il resto resta sul server). */
export type ClientMessages = Pick<Messages['common'], 'newsletter' | 'actions' | 'language' | 'header' | 'nav'>;

interface I18nValue {
  locale: Locale;
  messages: ClientMessages;
  /** URL equivalenti della pagina corrente nelle altre lingue (solo dove la traduzione esiste). */
  alternates: Partial<Record<Locale, string>>;
  setAlternates: (value: Partial<Record<Locale, string>>) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale;
  messages: ClientMessages;
  children: ReactNode;
}) {
  const [alternates, setAlternates] = useState<Partial<Record<Locale, string>>>({});
  const value = useMemo(() => ({ locale, messages, alternates, setAlternates }), [locale, messages, alternates]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n va usato dentro <I18nProvider>');
  return value;
}

export function useLocale(): Locale {
  return useI18n().locale;
}

/** Link interno nella lingua corrente: `useHref()('/blog/x')` → `/en/blog/x`. */
export function useHref(): (internalPath: string) => string {
  const locale = useLocale();
  return (internalPath: string) => localizedPath(locale, internalPath);
}

export { format, pluralize };
