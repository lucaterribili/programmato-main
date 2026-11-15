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
  const t = getMessages(locale).privacy;
  return staticPageMetadata(locale, '/privacy', t.metaTitle, t.metaDescription);
}

const MAIL = 'privacy@programmato.it';

export default async function PrivacyPage({ params }: PageProps) {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).privacy;

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
            <p>
              {t.s1Before}
              <a href={`mailto:${MAIL}`}>{MAIL}</a>.
            </p>

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

            <h2>{t.s3Title}</h2>
            <p>{t.s3Intro}</p>
            <ul>
              {t.s3Items.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  {item.text}
                </li>
              ))}
            </ul>

            <h2>{t.s4Title}</h2>
            <p>{t.s4}</p>

            <h2>{t.s5Title}</h2>
            <p>{t.s5}</p>

            <h2>{t.s6Title}</h2>
            <p>{t.s6}</p>

            <h2>{t.s7Title}</h2>
            <p>{t.s7a}</p>
            <p>
              {t.s7bBefore}
              <a href={`mailto:${MAIL}`}>{MAIL}</a>
              {t.s7bAfter}
            </p>

            <h2>{t.s8Title}</h2>
            <p>
              {t.s8Before}
              <Link href={localizedPath(locale, '/cookie')}>{t.s8Link}</Link>.
            </p>

            <h2>{t.s9Title}</h2>
            <p>{t.s9}</p>
          </div>
        </div>
      </section>
    </>
  );
}
