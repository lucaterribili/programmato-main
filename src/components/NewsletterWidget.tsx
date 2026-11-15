'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import newsletterService from '@/lib/services/newsletter';
import { useHref, useI18n } from '@/lib/i18n/client';

type Status =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string };

/** La newsletter in piccolo, per la barra laterale degli articoli (stesso servizio del riquadro della home). */
export function NewsletterWidget() {
  const { locale, messages } = useI18n();
  const t = messages.newsletter;
  const href = useHref();
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
      setStatus({ kind: 'error', message: t.needConsentShort });
      return;
    }
    setStatus({ kind: 'loading' });
    try {
      const response = await newsletterService.subscribe({
        email: email.trim(),
        consent: true,
        source: 'article-sidebar',
        tags: ['programmato', `lang-${locale}`],
      });
      if (response.success) {
        setStatus({
          kind: 'success',
          message: response.data?.requiresConfirmation
            ? t.confirmWidget
            : (locale === 'it' && response.message) || t.done,
        });
        setEmail('');
        setConsent(false);
      } else {
        setStatus({ kind: 'error', message: (locale === 'it' && response.message) || t.unavailable });
      }
    } catch {
      setStatus({ kind: 'error', message: t.serviceDownShort });
    }
  }

  return (
    <div className="rounded-2xl bg-navy p-5 text-white">
      <div className="flex items-center gap-2">
        <Mail size={15} className="text-accent" aria-hidden="true" />
        <h2 className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-white">{t.badge}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-white/80">
        {t.widgetCopy}
      </p>
      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-3">
        <label htmlFor="sidebar-newsletter-email" className="sr-only">
          {t.emailLabel}
        </label>
        <input
          id="sidebar-newsletter-email"
          type="email"
          autoComplete="email"
          placeholder={t.placeholder}
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
            {t.consentPrefix}{' '}
            <a href={href('/privacy')} className="underline underline-offset-2 hover:text-white">
              {t.privacyPolicy}
            </a>
            {t.consentSuffixWidget}
          </span>
        </label>
        <button type="submit" disabled={status.kind === 'loading'} className="btn btn-accent btn-sm w-full justify-center">
          {status.kind === 'loading' ? t.sending : t.button}
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
