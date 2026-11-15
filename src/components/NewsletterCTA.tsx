'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import newsletterService from '@/lib/services/newsletter';
import type { NewsletterPrompt } from '@/lib/types';
import { useHref, useI18n } from '@/lib/i18n/client';

interface NewsletterCTAProps {
  prompt?: Partial<NewsletterPrompt>;
}

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

export function NewsletterCTA({ prompt }: NewsletterCTAProps) {
  const { locale, messages } = useI18n();
  const t = messages.newsletter;
  const href = useHref();
  const defaults: NewsletterPrompt = {
    title: t.defaultTitle,
    description: t.defaultDescription,
    placeholder: t.placeholder,
    buttonText: t.button,
    incentive: t.incentive,
  };
  const copy = { ...defaults, ...(prompt ?? {}) };
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !email.includes('@')) {
      setStatus({ kind: 'error', message: t.invalidEmail });
      return;
    }

    if (!consent) {
      setStatus({
        kind: 'error',
        message: t.needConsent,
      });
      return;
    }

    setStatus({ kind: 'loading' });

    try {
      const response = await newsletterService.subscribe({
        email: email.trim(),
        consent: true,
        source: 'homepage',
        tags: ['programmato', `lang-${locale}`],
      });

      if (response.success) {
        setStatus({
          kind: 'success',
          message:
            response.data?.requiresConfirmation
              ? t.confirmCta
              : (locale === 'it' && response.message) || t.done,
        });
        setEmail('');
        setConsent(false);
      } else {
        setStatus({
          kind: 'error',
          message: (locale === 'it' && response.message) || t.unavailable,
        });
      }
    } catch {
      setStatus({
        kind: 'error',
        message: t.serviceDown,
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
              {t.badge}
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
                {t.emailLabel}
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
                {status.kind === 'loading' ? t.sending : copy.buttonText}
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
                {t.consentPrefix}{' '}
                <a href={href('/privacy')} className="underline underline-offset-2 hover:text-white">
                  {t.privacyPolicy}
                </a>
                {t.consentSuffixCta}
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
