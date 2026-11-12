'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/blog', label: 'Field notes' },
  { href: '/tutorial', label: 'Playbook' },
  { href: '/chi-siamo', label: 'Manifesto' },
];

export function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));

  return (
    <header>
      <div className="topbar hidden md:block">
        <div className="container-page topbar-inner">
          <p className="topbar-note">
            <span className="topbar-dot" aria-hidden="true" />
            AI e agenti, dal prototipo alla produzione
          </p>
          <nav className="topbar-links" aria-label="Link secondari">
            <Link href="/chi-siamo">Manifesto</Link>
            <a href="mailto:redazione@programmato.it">redazione@programmato.it</a>
          </nav>
        </div>
      </div>

      <div className="masthead">
        <div className="container-page masthead-inner">
          <Link href="/" className="brand" aria-label="Programmato — home">
            programmato<span className="brand-dot" aria-hidden="true">.</span>
            <span className="brand-kicker">ai &amp; agents</span>
          </Link>

          <nav className="masthead-nav" aria-label="Navigazione principale">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link${isActive(item.href) ? ' nav-link--active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href="/search" className="icon-btn" aria-label="Cerca nel sito">
              <Search size={18} strokeWidth={1.9} aria-hidden="true" />
            </Link>

            <details className="mobile-menu md:hidden">
              <summary className="icon-btn" aria-label="Apri il menu">
                <Menu size={20} strokeWidth={1.9} aria-hidden="true" />
              </summary>
              <div className="mobile-menu-panel">
                {NAV_ITEMS.map((item) => (
                  <Link key={item.href} href={item.href}>
                    {item.label}
                  </Link>
                ))}
                <Link href="/search">Ricerca</Link>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
