import Link from 'next/link';
import { Github, Linkedin, Mail, MapPin, Twitter } from 'lucide-react';

interface FooterProps {
  variant?: 'default' | 'minimal';
}

const EXPLORE_LINKS = [
  { href: '/blog', label: 'Field notes' },
  { href: '/tutorial', label: 'Playbook' },
  { href: '/author', label: 'Autori' },
  { href: '/search', label: 'Cerca nel sito' },
];

export function Footer({ variant = 'default' }: FooterProps) {
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
              <Link href="/" className="footer-logo" aria-label="Programmato — home">
                programmato<span className="brand-dot" aria-hidden="true">.</span>
              </Link>
              <p className="footer-tagline">
                Reference italiana su AI e agenti. Architetture, tool use, evals e casi
                reali per chi costruisce sistemi autonomi — non per chi li commenta.
              </p>

              <div className="footer-social">
                {socialLinks.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
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
              <h4 className="footer-heading">Esplora</h4>
              <ul className="footer-links">
                {EXPLORE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Programmato</h4>
              <ul className="footer-links">
                <li>
                  <Link href="/chi-siamo" className="footer-link">Manifesto</Link>
                </li>
                <li>
                  <Link href="/contatti" className="footer-link">Contatti</Link>
                </li>
                <li>
                  <Link href="/newsletter" className="footer-link">Newsletter</Link>
                </li>
                <li>
                  <a href="mailto:collabora@programmato.it" className="footer-link">
                    Collabora con noi
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Contatti</h4>
              <ul className="footer-contact">
                <li>
                  <Mail size={15} aria-hidden="true" />
                  <a href="mailto:redazione@programmato.it">redazione@programmato.it</a>
                </li>
                <li>
                  <MapPin size={15} aria-hidden="true" />
                  <span>Roma, Italia</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <div className="footer-small">
        <div className="container-page footer-small-inner">
          <div className="footer-small-links">
            <Link href="/privacy">Privacy</Link>
            <Link href="/cookie">Cookie</Link>
            <a href="mailto:redazione@programmato.it">Contatti</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
