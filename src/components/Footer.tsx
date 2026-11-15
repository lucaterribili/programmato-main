import Link from 'next/link';
import { Github, Linkedin, Mail, MapPin, Twitter } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';

interface FooterProps {
  locale: Locale;
  variant?: 'default' | 'minimal';
}

export function Footer({ locale, variant = 'default' }: FooterProps) {
  const { common } = getMessages(locale);
  const t = common.footer;
  const href = (path: string) => localizedPath(locale, path);

  const exploreLinks = [
    { href: href('/blog'), label: common.nav.fieldNotes },
    { href: href('/tutorial'), label: common.nav.playbook },
    { href: href('/search'), label: t.searchSite },
  ];

  const socialLinks = [
    { href: 'https://github.com/programmato', label: 'GitHub', Icon: Github },
    { href: 'https://twitter.com/programmato', label: 'Twitter', Icon: Twitter },
    { href: 'https://linkedin.com/company/programmato', label: 'LinkedIn', Icon: Linkedin },
  ];

  return (
    <footer className="footer">
      <div className="container-page footer-main">
        {variant === 'default' && (
          <div className="footer-grid">
            <div className="footer-brand">
              <Link href={href('/')} className="footer-logo" aria-label={common.header.homeAria}>
                programmato<span className="brand-dot" aria-hidden="true">.</span>
              </Link>
              <p className="footer-tagline">{t.tagline}</p>

              <div className="footer-social">
                {socialLinks.map(({ href: url, label, Icon }) => (
                  <a
                    key={label}
                    href={url}
                    className="social-circle"
                    aria-label={label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="footer-heading">{t.explore}</h4>
              <ul className="footer-links">
                {exploreLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">{t.aboutHeading}</h4>
              <ul className="footer-links">
                <li>
                  <Link href={href('/chi-siamo')} className="footer-link">{common.nav.manifesto}</Link>
                </li>
                <li>
                  <Link href={href('/contatti')} className="footer-link">{t.contacts}</Link>
                </li>
                <li>
                  <Link href={`${href('/')}#newsletter`} className="footer-link">{t.newsletter}</Link>
                </li>
                <li>
                  <a href="mailto:collabora@programmato.it" className="footer-link">
                    {t.collaborate}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">{t.contactsHeading}</h4>
              <ul className="footer-contact">
                <li>
                  <Mail size={15} aria-hidden="true" />
                  <a href="mailto:redazione@programmato.it">redazione@programmato.it</a>
                </li>
                <li>
                  <MapPin size={15} aria-hidden="true" />
                  <span>{t.location}</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="footer-small">
        <div className="container-page footer-small-inner">
          <div className="footer-small-links">
            <Link href={href('/privacy')}>{t.privacy}</Link>
            <Link href={href('/cookie')}>{t.cookie}</Link>
            <a href="mailto:redazione@programmato.it">{t.contacts}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
