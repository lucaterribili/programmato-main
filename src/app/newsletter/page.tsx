import type { Metadata } from 'next';
import { Check, Inbox, ShieldCheck, Sparkles } from 'lucide-react';
import { NewsletterCTA } from '@/components/NewsletterCTA';
import { homepageService } from '@/lib/services';
import type { NewsletterPrompt } from '@/lib/types';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Newsletter',
  description:
    'Una mail a settimana con i migliori articoli, tutorial e appunti di mestiere dal mondo dello sviluppo software.',
};

export default async function NewsletterPage() {
  let prompt: NewsletterPrompt | undefined;

  try {
    const homepage = await homepageService.getBasic();
    prompt = homepage.newsletter;
  } catch (error) {
    console.error('Prompt newsletter non disponibile:', error);
  }

  const points = [
    {
      Icon: Inbox,
      title: 'Una mail, una volta a settimana',
      copy: 'Niente bombardamenti: solo una selezione curata, il giovedì mattina.',
    },
    {
      Icon: Sparkles,
      title: 'Contenuti che valgono il tempo',
      copy: 'Articoli profondi, tutorial pratici e una nota di contesto su cosa cambia davvero.',
    },
    {
      Icon: ShieldCheck,
      title: 'Zero spam, zero vendite',
      copy: 'Nessuna cessione di dati. Ti cancelli con un clic, quando vuoi.',
    },
  ];

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Newsletter</span>
          <h1 className="page-title">La posta del mestiere</h1>
          <p className="page-lede">
            Il modo più semplice per seguire Programmato senza inseguire gli algoritmi.
            Una mail a settimana, scritta da persone che scrivono codice.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page">
          <NewsletterCTA prompt={prompt} />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {points.map(({ Icon, title, copy }) => (
              <div key={title} className="rounded-2xl border border-line bg-white p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper-soft text-navy">
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-lg font-semibold text-navy">{title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{copy}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-start gap-3 rounded-2xl border border-line bg-paper-soft p-6 text-sm text-muted">
            <Check size={18} className="mt-0.5 flex-shrink-0 text-accent" aria-hidden="true" />
            <p>
              Iscrivendoti riceverai anche l’accesso alle guide pratiche della redazione.
              Puoi disiscriverti in qualsiasi momento dal link presente in ogni email.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
