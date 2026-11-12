import type { Metadata } from 'next';
import Link from 'next/link';
import { Github, Linkedin, Mail, MapPin, MessageSquare, PenLine, Twitter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contatti',
  description:
    'Scrivi alla redazione di Programmato: segnalazioni, proposte di articoli, collaborazioni e informazioni.',
};

const CONTACTS = [
  {
    Icon: Mail,
    label: 'Redazione',
    value: 'redazione@programmato.it',
    href: 'mailto:redazione@programmato.it',
    copy: 'Segnalazioni, correzioni, proposte di articoli.',
  },
  {
    Icon: PenLine,
    label: 'Collaborazioni',
    value: 'collabora@programmato.it',
    href: 'mailto:collabora@programmato.it',
    copy: 'Vuoi scrivere con noi? Raccontaci cosa sai fare e cosa vorresti raccontare.',
  },
  {
    Icon: MessageSquare,
    label: 'Privacy',
    value: 'privacy@programmato.it',
    href: 'mailto:privacy@programmato.it',
    copy: 'Richieste relative ai tuoi dati personali e alla newsletter.',
  },
];

const SOCIALS = [
  { href: 'https://github.com/programmato', label: 'GitHub', Icon: Github },
  { href: 'https://twitter.com/programmato', label: 'Twitter', Icon: Twitter },
  { href: 'https://linkedin.com/company/programmato', label: 'LinkedIn', Icon: Linkedin },
];

export default function ContactPage() {
  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <span className="pill pill-accent">Contatti</span>
          <h1 className="page-title">Parliamone</h1>
          <p className="page-lede">
            Una correzione, una proposta, una collaborazione o semplicemente una domanda
            tecnica: scegli il canale giusto e ti risponderemo appena possibile.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            {CONTACTS.map(({ Icon, label, value, href, copy }) => (
              <div
                key={label}
                className="flex gap-4 rounded-2xl border border-line bg-white p-6"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-paper-soft text-navy">
                  <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted">
                    {label}
                  </p>
                  <a
                    href={href}
                    className="mt-1 block font-display text-xl font-semibold text-navy hover:text-sky"
                  >
                    {value}
                  </a>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{copy}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-paper-soft p-6">
              <h2 className="font-display text-xl font-semibold text-navy">Dove siamo</h2>
              <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-muted">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-blue" aria-hidden="true" />
                <span>
                  La redazione è distribuita e lavora da remoto. La sede di riferimento è a
                  Roma, Italia.
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-xl font-semibold text-navy">Sui social</h2>
              <div className="mt-4 flex gap-2">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-circle"
                    aria-label={label}
                  >
                    <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-white p-6">
              <h2 className="font-display text-xl font-semibold text-navy">
                Prima di scrivere
              </h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                <li>Per le correzioni, indica l’articolo e il passaggio da verificare.</li>
                <li>
                  Per le proposte, manda un abstract di 5 righe e un link a qualcosa che hai
                  già scritto.
                </li>
                <li>
                  Per la newsletter, usa il link di disiscrizione presente in ogni email
                  oppure scrivi a privacy@programmato.it.
                </li>
              </ul>
              <Link href="/chi-siamo" className="link-more mt-5 inline-flex">
                Chi siamo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
