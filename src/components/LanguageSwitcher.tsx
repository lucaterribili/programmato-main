'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Check, Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n/client';
import { HREFLANG, LANGUAGE_NAME, LOCALES, LOCALE_COOKIE, type Locale } from '@/lib/i18n/config';
import { localizedPath, switchLocalePath, toInternalSegments } from '@/lib/i18n/paths';

/** Ricorda la scelta: serve solo a riportare chi ritorna dall'esterno sulla home nella sua lingua. */
function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

/**
 * Selettore di lingua. È un `<details>` (funziona anche senza JavaScript) con un link per lingua: ogni link porta alla stessa
 * pagina nell'altra lingua, se esiste; per i contenuti senza traduzione, all'elenco della sezione.
 */
export function LanguageSwitcher() {
  const { locale, messages, alternates } = useI18n();
  const pathname = usePathname();

  return (
    <details className="lang-menu">
      <summary className="icon-btn lang-menu-trigger" aria-label={messages.language.menuAria}>
        <Globe size={17} strokeWidth={1.9} aria-hidden="true" />
        <span className="lang-menu-current">{HREFLANG[locale].toUpperCase()}</span>
      </summary>
      <ul className="lang-menu-panel">
        {LOCALES.map((target) => {
          const current = target === locale;
          const href = current
            ? localizedPath(locale, `/${toInternalSegments(pathname, locale).join('/')}`)
            : (alternates[target] ?? switchLocalePath(pathname, locale, target));
          return (
            <li key={target}>
              <Link
                href={href}
                hrefLang={HREFLANG[target]}
                lang={HREFLANG[target]}
                aria-current={current ? 'true' : undefined}
                className={`lang-menu-item${current ? ' lang-menu-item--current' : ''}`}
                onClick={() => rememberLocale(target)}
                prefetch={false}
              >
                <span>{LANGUAGE_NAME[target]}</span>
                {current && <Check size={14} aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
