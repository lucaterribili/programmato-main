import type { Metadata } from 'next';
import Link from 'next/link';
import { toLocale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { staticPageMetadata } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).cookie;
  return staticPageMetadata(locale, '/cookie', t.metaTitle, t.metaDescription);
}

const MAIL = 'privacy@programmato.it';

export default async function CookiePage({ params }: PageProps) {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).cookie;

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">{t.pill}</span>
          <h1 className="page-title">{t.title}</h1>
          <p className="page-lede">{t.lede}</p>
          <p className="mt-5 font-mono text-[0.66rem] uppercase tracking-[0.1em] text-muted">{t.updated}</p>
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          <div className="prose-page max-w-3xl">
            <h2>{t.s1Title}</h2>
            <p>{t.s1}</p>

            <h2>{t.s2Title}</h2>
            <p>{t.s2Intro}</p>
            <ul>
              {t.s2Items.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  {item.text}
                </li>
              ))}
            </ul>
            <p>{t.s2Outro}</p>

            <h2>{t.s3Title}</h2>
            <p>{t.s3a}</p>
            <p>{t.s3b}</p>

            <h2>{t.s4Title}</h2>
            <p>{t.s4}</p>

            <h2>{t.s5Title}</h2>
            <p>
              {t.s5Before}
              <a href={`mailto:${MAIL}`}>{MAIL}</a>
              {t.s5Middle}
              <Link href={localizedPath(locale, '/privacy')}>{t.s5Link}</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
