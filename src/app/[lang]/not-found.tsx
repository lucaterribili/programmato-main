'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toLocale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';

/**
 * Pagina 404. `notFound()` non riceve i parametri e leggere gli header renderebbe dinamiche tutte le pagine: la lingua si
 * ricava dal prefisso dell'URL richiesto (`/en/...`, `/ru/...`; nessun prefisso = italiano).
 */
export default function NotFound() {
  const pathname = usePathname();
  const locale = toLocale(pathname.split('/')[1]);
  const t = getMessages(locale).notFound;

  return (
    <section className="section">
      <div className="container-page">
        <div className="empty-state">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1 className="empty-state-title mt-3">{t.title}</h1>
          <p className="empty-state-copy">{t.copy}</p>
          <Link href={localizedPath(locale, '/')} className="btn btn-primary btn-sm mt-6">
            {t.home}
          </Link>
        </div>
      </div>
    </section>
  );
}
