import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { I18nProvider, type ClientMessages } from '@/lib/i18n/client';
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { openGraphBase } from '@/lib/i18n/seo';
import '../globals.css';

// Solo le lingue del sito: qualunque altro prefisso è un 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Pick<LayoutProps, 'params'>): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const { meta } = getMessages(lang);

  return {
    title: { default: meta.siteTitle, template: '%s — Programmato' },
    description: meta.siteDescription,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://programmato.it'),
    // canonical e hreflang li imposta ogni pagina: una pagina senza traduzione non deve ereditare quelli della home.
    openGraph: {
      ...openGraphBase(lang),
      title: meta.siteTitle,
      description: meta.ogDescription,
    },
    twitter: { card: 'summary_large_image', title: 'Programmato', description: meta.ogDescription },
  };
}

export default async function RootLayout({ children, params }: Readonly<LayoutProps>) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const locale: Locale = lang;
  const messages = getMessages(locale);
  const { newsletter, actions, language, header, nav } = messages.common;
  const clientMessages: ClientMessages = { newsletter, actions, language, header, nav };

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink antialiased">
        <I18nProvider locale={locale} messages={clientMessages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only absolute left-4 top-4 z-[100] rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            {messages.common.skipToContent}
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer locale={locale} />
        </I18nProvider>
      </body>
    </html>
  );
}
