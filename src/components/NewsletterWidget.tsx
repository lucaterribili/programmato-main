'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import newsletterService from '@/lib/services/newsletter';

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

/** La newsletter in piccolo, per la barra laterale degli articoli (stesso servizio del riquadro della home). */
export function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus({ kind: 'error', message: 'Inserisci un indirizzo email valido.' });
      return;
    }
    if (!consent) {
      setStatus({ kind: 'error', message: 'Serve il consenso al trattamento dei dati.' });
      return;
    }
    setStatus({ kind: 'loading' });
    try {
      const response = await newsletterService.subscribe({
        email: email.trim(),
        consent: true,
        source: 'article-sidebar',
        tags: ['programmato'],
      });
      if (response.success) {
        setStatus({
          kind: 'success',
          message: response.data?.requiresConfirmation
            ? 'Quasi fatto: controlla la posta per confermare.'
            : response.message || 'Iscrizione completata. A presto!',
        });
        setEmail('');
        setConsent(false);
      } else {
        setStatus({ kind: 'error', message: response.message || 'Iscrizione non disponibile, riprova più tardi.' });
      }
    } catch {
      setStatus({ kind: 'error', message: 'Servizio non disponibile. Riprova più tardi.' });
    }
  }

  return (
    <div className="rounded-2xl bg-navy p-5 text-white">
      <div className="flex items-center gap-2">
        <Mail size={15} className="text-accent" aria-hidden="true" />
        <h2 className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-white">Newsletter</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/80">
        Una mail a settimana con i migliori articoli e tutorial. Niente spam.
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <label htmlFor="sidebar-newsletter-email" className="sr-only">
          Indirizzo email
        </label>
        <input
          id="sidebar-newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="La tua email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status.kind === 'loading'}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 focus:border-accent focus:outline-none"
        />
        <label className="flex items-start gap-2 text-xs leading-snug text-white/70">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-0.5"
          />
          <span>
            Acconsento al trattamento dei dati secondo la{' '}
            <a href="/privacy" className="underline underline-offset-2 hover:text-white">
              privacy policy
            </a>
            .
          </span>
        </label>
        <button type="submit" disabled={status.kind === 'loading'} className="btn btn-accent btn-sm w-full justify-center">
          {status.kind === 'loading' ? 'Invio…' : 'Iscriviti'}
          <ArrowRight size={14} aria-hidden="true" />
        </button>
        {status.kind === 'success' && (
          <p className="text-xs text-emerald-300" role="status">
            {status.message}
          </p>
        )}
        {status.kind === 'error' && (
          <p className="text-xs text-red-300" role="alert">
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}
