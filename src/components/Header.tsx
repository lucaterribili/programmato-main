'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';
import { useHref, useI18n } from '@/lib/i18n/client';
import { toInternalSegments } from '@/lib/i18n/paths';
import { LanguageSwitcher } from './LanguageSwitcher';

/** `showVideo`: la voce Video compare solo se il dominio ha almeno una playlist. */
export function Header({ showVideo = false }: { showVideo?: boolean }) {
  const pathname = usePathname();
  const href = useHref();
  const { locale, messages } = useI18n();
  const t = messages.header;

  const navItems = [
    { path: '/blog', label: messages.nav.fieldNotes },
    { path: '/tutorial', label: messages.nav.playbook },
    ...(showVideo ? [{ path: '/video', label: messages.nav.video }] : []),
    { path: '/chi-siamo', label: messages.nav.manifesto },
  ];

  // la sezione corrente, qualunque forma abbia il percorso (pubblico o riscritto dal proxy)
  const currentSection = toInternalSegments(pathname, locale)[0];
  const isActive = (target: string) => currentSection === target.replace(/^\//, '');

  return (
    <header>
      <div className="topbar hidden md:block">
        <div className="container-page topbar-inner">
          <p className="topbar-note">
            <span className="topbar-dot" aria-hidden="true" />
            {t.topbarNote}
          </p>
          <nav className="topbar-links" aria-label={t.secondaryLinks}>
            <Link href={href('/chi-siamo')}>{messages.nav.manifesto}</Link>
            <a href="mailto:redazione@programmato.it">redazione@programmato.it</a>
          </nav>
        </div>
      </div>

      <div className="masthead">
        <div className="container-page masthead-inner">
          <Link href={href('/')} className="brand" aria-label={t.homeAria}>
            programmato<span className="brand-dot" aria-hidden="true">.</span>
            <span className="brand-kicker">ai &amp; agents</span>
          </Link>

          <nav className="masthead-nav" aria-label={t.mainNav}>
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={href(item.path)}
                className={`nav-link${isActive(item.path) ? ' nav-link--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href={href('/search')} className="icon-btn" aria-label={t.searchAria}>
              <Search size={18} strokeWidth={1.9} aria-hidden="true" />
            </Link>

            <LanguageSwitcher />

            <details className="mobile-menu md:hidden">
              <summary className="icon-btn" aria-label={t.openMenu}>
                <Menu size={20} strokeWidth={1.9} aria-hidden="true" />
              </summary>
              <div className="mobile-menu-panel">
                {navItems.map((item) => (
                  <Link key={item.path} href={href(item.path)}>
                    {item.label}
                  </Link>
                ))}
                <Link href={href('/search')}>{t.search}</Link>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
