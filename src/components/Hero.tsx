import Link from 'next/link';
import { ArrowRight, ArrowUpRight, FileCode2 } from 'lucide-react';
import type { ArticlePreview } from '@/lib/types';
import { formatDate } from '@/lib/services/content';
import imageService from '@/lib/services/image';

function AgentTrace() {
  return (
    <div className="hero-code" aria-hidden="true">
      <div className="hero-code-bar">
        <span className="hero-code-dot" />
        <span className="hero-code-dot" />
        <span className="hero-code-dot" />
        <span className="hero-code-file">agent.trace</span>
        <span className="trace-live">running</span>
      </div>
      <div className="trace-body">
        <p className="trace-line">
          <span className="trace-time">14:02:11</span>
          <span className="trace-op">plan</span>
          <span className="trace-text">3 passi · obiettivo: analizza i log di produzione</span>
        </p>
        <p className="trace-line">
          <span className="trace-time">14:02:12</span>
          <span className="trace-op trace-op--tool">tool</span>
          <span className="trace-text">logs.query(range=24h, service=api)</span>
        </p>
        <p className="trace-line">
          <span className="trace-time">14:02:19</span>
          <span className="trace-op">observe</span>
          <span className="trace-text">12 anomalie · 3 correlate a un deploy</span>
        </p>
        <p className="trace-line">
          <span className="trace-time">14:02:20</span>
          <span className="trace-op trace-op--tool">tool</span>
          <span className="trace-text">incident.open(severity=high, owner=oncall)</span>
        </p>
        <p className="trace-line">
          <span className="trace-time">14:02:21</span>
          <span className="trace-op trace-op--guard">guard</span>
          <span className="trace-text">rollback richiede approvazione umana</span>
        </p>
        <p className="trace-line">
          <span className="trace-time">14:02:23</span>
          <span className="trace-op trace-op--eval">eval</span>
          <span className="trace-text">
            24/25 task superati · <span className="trace-ok">score 0.96</span>
          </span>
        </p>
      </div>
      <p className="hero-code-caption">
        {'// ogni passo è un evento: osservabile, misurato, riproducibile'}
      </p>
    </div>
  );
}

export function Hero({ featured }: { featured?: ArticlePreview | null }) {
  const cover = featured
    ? imageService.getCoverImagePath(featured.image ?? null, featured.mainCategory?.image ?? null)
    : null;
  const date = featured?.publishedAt ? formatDate(featured.publishedAt) : null;

  return (
    <section className="hero">
      <div className="container-page hero-grid">
        <div>
          <span className="pill pill-accent">
            <span className="topbar-dot" aria-hidden="true" />
            Reference italiana su AI e agenti
          </span>

          <h1 className="hero-title">
            AI e agenti.
            <br />
            Dal prototipo alla <em>produzione</em>.
          </h1>

          <p className="hero-lede">
            Architetture, tool use, evals e sicurezza per sistemi autonomi. Programmato
            documenta ciò che regge davvero: trace, costi, failure mode e decisioni
            che puoi difendere davanti a un team.
          </p>

          <div className="hero-actions">
            <Link href="/blog" className="btn btn-primary btn-lg">
              Leggi le field notes
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/tutorial" className="btn btn-outline btn-lg">
              Apri i playbook
            </Link>
          </div>

          <div className="hero-proof">
            <div className="hero-avatars" aria-hidden="true">
              <span className="hero-avatar">LT</span>
              <span className="hero-avatar">MR</span>
              <span className="hero-avatar">GB</span>
            </div>
            <p>Scritto da chi costruisce agenti, non da chi li commenta.</p>
          </div>
        </div>

        <div>
          {featured ? (
            <Link href={`/blog/${featured.slug}`} className="hero-featured">
              <div className="hero-featured-media">
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt={featured.image?.alt ?? featured.title}
                    loading="eager"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FileCode2 size={54} strokeWidth={1.1} className="text-white/35" aria-hidden="true" />
                  </div>
                )}
                {featured.mainCategory && (
                  <span className="pill pill-light">{featured.mainCategory.title}</span>
                )}
              </div>
              <div className="hero-featured-body">
                <span className="eyebrow">In evidenza</span>
                <h2 className="hero-featured-title">{featured.title}</h2>
                {featured.summary && (
                  <p className="hero-featured-excerpt">{featured.summary}</p>
                )}
                <div className="hero-featured-foot">
                  <div className="article-meta">
                    {date && <span>{date}</span>}
                    {date && featured.readingTime && (
                      <span className="article-meta-dot" aria-hidden="true">•</span>
                    )}
                    {featured.readingTime && <span>{featured.readingTime} min</span>}
                  </div>
                  <span className="hero-featured-cta">
                    Leggi
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </div>
            </Link>
          ) : (
            <AgentTrace />
          )}
        </div>
      </div>
    </section>
  );
}
