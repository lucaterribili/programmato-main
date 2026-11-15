import type { Metadata } from 'next';
import Link from 'next/link';
import { Github, Linkedin, Mail, MapPin, MessageSquare, PenLine, Twitter } from 'lucide-react';
import { toLocale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { staticPageMetadata } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string }>;
}

const SOCIALS = [
  { href: 'https://github.com/programmato', label: 'GitHub', Icon: Github },
  { href: 'https://twitter.com/programmato', label: 'Twitter', Icon: Twitter },
  { href: 'https://linkedin.com/company/programmato', label: 'LinkedIn', Icon: Linkedin },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).contact;
  return staticPageMetadata(locale, '/contatti', t.metaTitle, t.metaDescription);
}

export default async function ContactPage({ params }: PageProps) {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).contact;

  const contacts = [
    { Icon: Mail, ...t.channels.editorial, value: 'redazione@programmato.it' },
    { Icon: PenLine, ...t.channels.collab, value: 'collabora@programmato.it' },
    { Icon: MessageSquare, ...t.channels.privacy, value: 'privacy@programmato.it' },
  ];

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">{t.pill}</span>
          <h1 className="page-title">{t.title}</h1>
          <p className="page-lede">{t.lede}</p>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            {contacts.map(({ Icon, label, value, copy }) => (
              <div key={value} className="flex gap-4 rounded-2xl border border-line bg-white p-6">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-paper-soft text-navy">
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">{label}</p>
                  <a
                    href={`mailto:${value}`}
                    className="mt-1 block font-display text-xl font-semibold text-navy hover:text-sky"
                  >
                    {value}
                  </a>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-paper-soft p-6">
              <h2 className="font-display text-xl font-semibold text-navy">{t.whereHeading}</h2>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-blue" aria-hidden="true" />
                <span>{t.whereCopy}</span>
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-xl font-semibold text-navy">{t.socialHeading}</h2>
              <div className="mt-4 flex gap-2">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-circle"
                    aria-label={label}
                  >
                    <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-xl font-semibold text-navy">{t.beforeHeading}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                <li>{t.before1}</li>
                <li>{t.before2}</li>
                <li>{t.before3}</li>
              </ul>
              <Link href={localizedPath(locale, '/chi-siamo')} className="link-more mt-5 inline-flex">
                {t.aboutLink}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
