import Link from 'next/link';
import { ArrowUpRight, Compass, PenLine, Workflow } from 'lucide-react';
import { homepageService } from '@/lib/services';
import type { HomepageData } from '@/lib/types';
import { Hero } from '@/components/Hero';
import { StatsBar } from '@/components/StatsBar';
import { SectionHeader } from '@/components/SectionHeader';
import { ArticleCard } from '@/components/ArticleCard';
import { TutorialCard } from '@/components/TutorialCard';
import { NewsletterCTA } from '@/components/NewsletterCTA';

export const revalidate = 300;

const FALLBACK_TOPICS = [
  'Agenti autonomi',
  'Tool use',
  'RAG',
  'Evals',
  'Osservabilità',
  'Multi-agent',
  'Sicurezza',
  'Costi e latenza',
];

const AGENT_LOOP = [
  {
    step: 'Plan',
    code: 'goal → steps',
    copy: 'Scomporre l’obiettivo in passi verificabili, con criteri di uscita espliciti.',
  },
  {
    step: 'Act',
    code: 'tool.call()',
    copy: 'Tool use su codice, browser, API e database. Permessi minimi, niente magia.',
  },
  {
    step: 'Observe',
    code: 'trace.emit()',
    copy: 'Ogni azione lascia un evento: stato, input, output, latenza e costo.',
  },
  {
    step: 'Evaluate',
    code: 'eval.run()',
    copy: 'Misurare prima del deploy: task reali, regressioni, guardrail e rollback.',
  },
];

const STANDARD = [
  {
    title: 'Eval prima della demo',
    copy: 'Una tecnica entra qui solo se è stata misurata su task reali, non su un prompt fortunato.',
  },
  {
    title: 'Trace o non esiste',
    copy: 'Se non possiamo ricostruire ogni passo di un agente, non è pronto per la produzione.',
  },
  {
    title: 'Produzione come benchmark',
    copy: 'Costi, latenza e failure mode contano quanto la qualità dell’output.',
  },
];

const NEWSLETTER_PROMPT = {
  title: 'Una mail a settimana sul mestiere degli agenti',
  description:
    'Pattern di orchestrazione, tool use, evals e casi reali. Cosa ha funzionato, cosa è esploso e perché. Zero hype, zero thread riciclati.',
  placeholder: 'La tua email',
  buttonText: 'Iscriviti',
  incentive: 'Una selezione settimanale, pensata per chi costruisce',
};

export default async function Home() {
  // Se il backend non risponde la home degrada ai contenuti di fallback
  // (vedi homepageService.getBasic): meglio una home parziale che una pagina d'errore.
  const data: HomepageData = await homepageService.getBasic();

  const latest = data.latestArticles.slice(0, 5);
  const popular = data.popularArticles.slice(0, 4);
  const tutorials = data.latestTutorials.slice(0, 3);
  const topics = data.categories.length
    ? data.categories.slice(0, 8).map((category) => ({
        label: category.title,
        href: `/blog?category=${category.slug}`,
        count: category.postsCount,
      }))
    : FALLBACK_TOPICS.map((label) => ({ label, href: '/blog', count: undefined }));

  return (
    <>
      <Hero featured={data.featuredArticle} />
      <StatsBar stats={data.stats} />

      <section className="section" id="field-notes">
        <div className="container-page">
          <SectionHeader
            eyebrow="Field notes"
            title="AI e agenti, senza fumo"
            description="Analisi e casi reali su come gli agenti lavorano davvero: orchestrazione, tool use, evals, costi e failure mode. Solo sistemi che reggono in produzione."
            href="/blog"
            linkLabel="Tutte le field notes"
          />

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_19rem]">
            <div>
              {latest.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {latest.map((post, index) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                      variant={index === 0 ? 'featured' : 'default'}
                      className={index === 0 ? 'md:col-span-2' : ''}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="eyebrow">In preparazione</span>
                  <h3 className="empty-state-title mt-3">La prossima analisi è in lavorazione.</h3>
                  <p className="empty-state-copy">
                    Stiamo verificando i prossimi casi sul campo: agenti, tool e valutazioni.
                    Nel frattempo puoi sfogliare l’archivio.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link href="/blog" className="btn btn-primary btn-sm">
                      Vai all’archivio
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-8">
              {popular.length > 0 ? (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <Compass size={16} className="text-accent" aria-hidden="true" />
                    <h3 className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-navy">
                      I più letti
                    </h3>
                  </div>
                  <ol className="rank-list">
                    {popular.map((post, index) => (
                      <li className="rank-item" key={post.id}>
                        <span className="rank-number" aria-hidden="true">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <Link href={`/blog/${post.slug}`} className="rank-link">
                            <span className="rank-title">{post.title}</span>
                          </Link>
                          <div className="rank-meta">
                            {post.mainCategory?.title ?? 'Field note'}
                            {post.readingTime ? ` · ${post.readingTime} min` : ''}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="rounded-2xl border border-line bg-paper-soft p-6">
                <div className="mb-3 flex items-center gap-2">
                  <PenLine size={16} className="text-accent" aria-hidden="true" />
                  <span className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    Il principio
                  </span>
                </div>
                <p className="font-display text-xl leading-snug text-navy">
                  “Un agente senza eval è una demo con più passaggi.”
                </p>
                <p className="mt-4 text-sm text-muted">— La redazione di Programmato</p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section section-soft" id="agent-loop">
        <div className="container-page">
          <SectionHeader
            eyebrow="Il modello"
            title="Un agente non è un prompt. È un loop."
            description="Plan, act, observe, evaluate: quattro fasi che vanno progettate, strumentate e misurate. È qui che un prototipo diventa un sistema."
            href="/tutorial"
            linkLabel="Vai ai playbook"
          />

          <div className="loop-grid">
            {AGENT_LOOP.map((phase, index) => (
              <div key={phase.step} className="loop-step">
                <span className="loop-index">
                  {String(index + 1).padStart(2, '0')} · {phase.step}
                </span>
                <h3 className="loop-title">
                  {phase.step === 'Plan' && 'Pianifica'}
                  {phase.step === 'Act' && 'Agisci'}
                  {phase.step === 'Observe' && 'Osserva'}
                  {phase.step === 'Evaluate' && 'Valuta'}
                </h3>
                <p className="loop-copy">{phase.copy}</p>
                <code className="loop-code">{phase.code}</code>
              </div>
            ))}
          </div>
        </div>
      </section>

      {tutorials.length > 0 && (
        <section className="section" id="playbook">
          <div className="container-page">
            <SectionHeader
              eyebrow="Playbook"
              title="Costruisci agenti, passo per passo"
              description="Guide operative con codice: dal primo tool call a un sistema osservabile, valutato e pronto al deploy."
              href="/tutorial"
              linkLabel="Tutti i playbook"
            />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tutorials.map((tutorial) => (
                <TutorialCard key={tutorial.id} tutorial={tutorial} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section section-soft" id="competenze">
        <div className="container-page grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="eyebrow">Competenze</span>
            <h2 className="section-title">Le aree che seguiamo</h2>
            <p className="section-lede">
              Non tutto ciò che riguarda l’AI. Solo ciò che serve a mettere un agente
              in produzione e tenerlo sotto controllo.
            </p>
            <div className="chip-grid mt-7">
              {topics.map((topic) => (
                <Link key={topic.label} href={topic.href} className="chip">
                  {topic.label}
                  {typeof topic.count === 'number' && (
                    <span className="chip-count">{topic.count}</span>
                  )}
                </Link>
              ))}
            </div>

            <div className="mt-10 rounded-2xl border border-line bg-white p-6">
              <div className="flex items-center gap-2">
                <Workflow size={16} className="text-accent" aria-hidden="true" />
                <span className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  Tool use
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Un agente vale quanto i tool che sa usare. Documentiamo integrazioni reali:
                filesystem, browser, API interne, database, code execution e code review.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-white p-7">
            <span className="eyebrow">Lo standard</span>
            <ol className="mt-6 space-y-6">
              {STANDARD.map((item, index) => (
                <li key={item.title} className="flex gap-4">
                  <span className="font-display text-2xl font-semibold leading-none text-blue">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="font-sans text-[0.95rem] font-semibold text-navy">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.copy}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/chi-siamo" className="link-more mt-7 inline-flex">
              Conosci il progetto
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="newsletter">
        <NewsletterCTA prompt={NEWSLETTER_PROMPT} />
      </section>
    </>
  );
}
