'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import newsletterService from '@/lib/services/newsletter';
import type { NewsletterPrompt } from '@/lib/types';

interface NewsletterCTAProps {
  prompt?: NewsletterPrompt;
}

const DEFAULT_PROMPT: NewsletterPrompt = {
  title: 'Una mail, una volta a settimana. Solo roba buona.',
  description:
    'I migliori articoli e tutorial del portale, più una nota di contesto su cosa sta succedendo nel mondo dello sviluppo. Zero rumore, zero spam.',
  placeholder: 'La tua email',
  buttonText: 'Iscriviti',
  incentive: 'Accesso gratuito alle guide pratiche della redazione',
};

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function NewsletterCTA({ prompt }: NewsletterCTAProps) {
  const copy = { ...DEFAULT_PROMPT, ...(prompt ?? {}) };
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
      setStatus({
        kind: 'error',
        message: 'Serve il consenso al trattamento dei dati per iscriverti.',
      });
      return;
    }

    setStatus({ kind: 'loading' });

    try {
      const response = await newsletterService.subscribe({
        email: email.trim(),
        consent: true,
        source: 'homepage',
        tags: ['programmato'],
      });

      if (response.success) {
        setStatus({
          kind: 'success',
          message:
            response.data?.requiresConfirmation
              ? 'Quasi fatto: controlla la tua inbox per confermare l’iscrizione.'
              : response.message || 'Iscrizione completata. A presto!',
        });
        setEmail('');
        setConsent(false);
      } else {
        setStatus({
          kind: 'error',
          message: response.message || 'Iscrizione non disponibile, riprova più tardi.',
        });
      }
    } catch {
      setStatus({
        kind: 'error',
        message: 'Servizio momentaneamente non disponibile. Riprova più tardi.',
      });
    }
  }

  return (
    <section className="container-page" aria-labelledby="newsletter-title">
      <div className="newsletter-band">
        <div className="newsletter-grid">
          <div>
            <span className="pill pill-dark">
              <Sparkles size={12} aria-hidden="true" />
              Newsletter
            </span>
            <h2 id="newsletter-title" className="newsletter-title mt-4">
              {copy.title}
            </h2>
            <p className="newsletter-copy">{copy.description}</p>
            {copy.incentive && (
              <p className="newsletter-incentive">
                <Mail size={14} aria-hidden="true" />
                {copy.incentive}
              </p>
            )}
          </div>

          <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
            <div className="newsletter-input-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Indirizzo email
              </label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                className="newsletter-input"
                placeholder={copy.placeholder}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={status.kind === 'loading'}
                required
              />
              <button
                type="submit"
                className="btn btn-accent"
                disabled={status.kind === 'loading'}
              >
                {status.kind === 'loading' ? 'Invio…' : copy.buttonText}
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>

            <label className="newsletter-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <span>
                Acconsento al trattamento dei dati secondo la{' '}
                <a href="/privacy" className="underline underline-offset-2 hover:text-white">
                  privacy policy
                </a>
                . Puoi disiscriverti quando vuoi.
              </span>
            </label>

            {status.kind === 'success' && (
              <p className="newsletter-status newsletter-status--ok" role="status">
                {status.message}
              </p>
            )}
            {status.kind === 'error' && (
              <p className="newsletter-status newsletter-status--error" role="alert">
                {status.message}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
