import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Code2, Gauge, ShieldCheck, Workflow } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Manifesto',
  description:
    'Programmato è la reference italiana su AI e agenti: documentiamo sistemi autonomi che funzionano in produzione, con evals, trace e casi reali.',
};

const VALUES = [
  {
    Icon: Code2,
    title: 'Eval prima della demo',
    copy: 'Una tecnica entra qui solo se è stata misurata su task reali, non su un prompt fortunato.',
  },
  {
    Icon: Workflow,
    title: 'Trace o non esiste',
    copy: 'Ogni passo di un agente deve essere ricostruibile: input, tool call, output, latenza e costo.',
  },
  {
    Icon: Gauge,
    title: 'Produzione come benchmark',
    copy: 'Costi, latenza e failure mode contano quanto la qualità dell’output. Spesso di più.',
  },
  {
    Icon: ShieldCheck,
    title: 'Indipendenza',
    copy: 'Nessun contenuto sponsorizzato mascherato da analisi. Se collaboriamo con un brand, lo diciamo.',
  },
];

export default function AboutPage() {
  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Manifesto</span>
          <h1 className="page-title">Una reference sull’AI che va in produzione</h1>
          <p className="page-lede">
            Programmato nasce da un problema concreto: troppo contenuto su AI scritto per
            impressionare, troppo poco per far funzionare un agente. Documentiamo sistemi
            autonomi con lo stesso rigore con cui si scrive software.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="prose-page max-w-2xl">
            <h2>Perché agenti</h2>
            <p>
              Un modello risponde. Un agente agisce: pianifica, chiama tool, osserva il
              risultato e decide il passo successivo. È lì che nascono i problemi veri —
              permessi, contesto, costo per task, comportamento imprevisto in produzione.
            </p>
            <p>
              Per questo non pubblichiamo novità per il gusto di farlo. Scriviamo di
              orchestrazione, tool use, memoria, RAG, valutazione e sicurezza quando
              possiamo mostrarne le conseguenze su un sistema reale.
            </p>

            <h2>Come lavoriamo</h2>
            <p>
              Ogni playbook viene eseguito prima di essere pubblicato. Ogni affermazione
              sulle prestazioni di un agente è accompagnata da come è stata misurata: task,
              dataset, metrica e condizioni. Se un passaggio non funziona, non esce.
            </p>
            <p>
              Il team è distribuito e indipendente. Non abbiamo investitori che dettano
              l’agenda e non accettiamo contenuti che non firmeremmo.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {VALUES.map(({ Icon, title, copy }) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-soft text-navy">
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-navy">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container-page">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <span className="eyebrow">Scrivere con noi</span>
              <h2 className="section-title">Hai portato un agente in produzione?</h2>
              <p className="section-lede">
                Cerchiamo chi progetta, valuta e mantiene sistemi autonomi: architetti,
                ML engineer e sviluppatori che hanno visto cosa succede quando l’agente
                incontra utenti veri. Non serve essere famosi: serve avere qualcosa di
                verificabile da raccontare.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contatti" className="btn btn-primary">
                Contattaci
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
