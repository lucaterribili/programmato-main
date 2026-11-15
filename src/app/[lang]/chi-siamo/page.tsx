import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code2, Gauge, ShieldCheck, Workflow } from 'lucide-react';
import { toLocale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';
import { staticPageMetadata } from '@/lib/i18n/seo';

interface PageProps {
  params: Promise<{ lang: string }>;
}

const VALUE_ICONS = [Code2, Workflow, Gauge, ShieldCheck];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).about;
  return staticPageMetadata(locale, '/chi-siamo', t.metaTitle, t.metaDescription);
}

export default async function AboutPage({ params }: PageProps) {
  const locale = toLocale((await params).lang);
  const t = getMessages(locale).about;

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
          <div className="prose-page max-w-2xl">
            <h2>{t.whyHeading}</h2>
            <p>{t.why1}</p>
            <p>{t.why2}</p>

            <h2>{t.howHeading}</h2>
            <p>{t.how1}</p>
            <p>{t.how2}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {t.values.map(({ title, copy }, index) => {
              const Icon = VALUE_ICONS[index] ?? Code2;
              return (
                <div key={title} className="rounded-2xl border border-line bg-white p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-soft text-navy">
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold text-navy">{title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="eyebrow">{t.writeEyebrow}</span>
              <h2 className="section-title">{t.writeTitle}</h2>
              <p className="section-lede">{t.writeCopy}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={localizedPath(locale, '/contatti')} className="btn btn-primary">
                {t.contactUs}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
