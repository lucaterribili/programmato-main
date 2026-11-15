'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n/client';
import type { Locale } from '@/lib/i18n/config';
import { localizedPath } from '@/lib/i18n/paths';

/**
 * Dichiara al selettore di lingua dove sta la stessa pagina nelle altre lingue (percorsi interni, uno per lingua in cui la
 * traduzione esiste). Le pagine di contenuto lo montano: lo slug cambia con la lingua e solo il backend lo sa.
 */
export function LocaleAlternates({ variants }: { variants: Partial<Record<Locale, string>> }) {
  const { setAlternates } = useI18n();
  const key = JSON.stringify(variants);

  useEffect(() => {
    const resolved: Partial<Record<Locale, string>> = {};
    for (const [locale, path] of Object.entries(variants) as [Locale, string][]) {
      resolved[locale] = localizedPath(locale, path);
    }
    setAlternates(resolved);
    return () => setAlternates({});
    // `key` rappresenta il contenuto di `variants`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, setAlternates]);

  return null;
}
