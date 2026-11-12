import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Eye, FileText, Github, Globe, Linkedin, Twitter } from 'lucide-react';
import { authorService } from '@/lib/services';
import imageService from '@/lib/services/image';
import type { AuthorProfile } from '@/lib/types';
import { ArticleCard } from '@/components/ArticleCard';
import { TutorialCard } from '@/components/TutorialCard';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function loadAuthor(slug: string): Promise<AuthorProfile | null> {
  try {
    return await authorService.getAuthorBySlug(slug);
  } catch (error) {
    console.error('Autore non disponibile:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await loadAuthor(slug);

  if (!author) return { title: 'Autore' };

  return {
    title: author.name,
    description:
      author.bio ||
      `Articoli e tutorial di ${author.name} su Programmato.`,
  };
}

const SOCIAL_ICONS = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  website: Globe,
  youtube: Globe,
  stackoverflow: Globe,
} as const;

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const author = await loadAuthor(slug);

  if (!author) {
    return (
      <section className="section">
        <div className="container-page">
          <div className="empty-state">
            <span className="eyebrow">Profilo non disponibile</span>
            <h1 className="empty-state-title mt-3">Questo autore non c’è (ancora).</h1>
            <p className="empty-state-copy">
              Il profilo potrebbe essere stato spostato o il servizio editoriale potrebbe
              essere momentaneamente irraggiungibile.
            </p>
            <Link href="/author" className="btn btn-primary btn-sm mt-6">
              Torna agli autori
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const avatar = author.avatar ? imageService.getAvatarPath(author.avatar) : null;
  const articles = author.latestArticles ?? [];
  const tutorials = author.latestTutorials ?? [];

  return (
    <>
      <header className="page-header">
        <div className="container-page">
          <Link href="/author" className="link-more mb-6 inline-flex">
            <ArrowLeft size={14} aria-hidden="true" />
            Tutti gli autori
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-paper-soft font-mono text-lg font-semibold text-slate">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={author.name} className="h-full w-full object-cover" />
              ) : (
                initials(author.name)
              )}
            </span>
            <div>
              <span className="pill pill-accent">{author.role || 'Autore'}</span>
              <h1 className="page-title mt-3">{author.name}</h1>
              {author.bio && <p className="page-lede">{author.bio}</p>}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <FileText size={13} aria-hidden="true" />
              {author.articlesCount} articoli
            </span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen size={13} aria-hidden="true" />
              {author.tutorialsCount} tutorial
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye size={13} aria-hidden="true" />
              {author.totalViews.toLocaleString('it-IT')} letture
            </span>

            {author.socialLinks && author.socialLinks.length > 0 && (
              <span className="flex items-center gap-2">
                {author.socialLinks.map((link) => {
                  const Icon =
                    SOCIAL_ICONS[link.platform as keyof typeof SOCIAL_ICONS] ?? Globe;
                  return (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform}
                      className="text-muted transition-colors hover:text-navy"
                    >
                      <Icon size={15} aria-hidden="true" />
                    </a>
                  );
                })}
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container-page space-y-14">
          <div>
            <div className="section-head">
              <div>
                <span className="eyebrow">Firma</span>
                <h2 className="section-title">Articoli recenti</h2>
              </div>
              <Link href="/blog" className="link-more">
                Tutti gli articoli
              </Link>
            </div>

            {articles.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {articles.slice(0, 6).map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="eyebrow">In preparazione</span>
                <h3 className="empty-state-title mt-3">Nessun articolo pubblicato.</h3>
                <p className="empty-state-copy">
                  Questa firma sta lavorando alla prossima storia.
                </p>
              </div>
            )}
          </div>

          {tutorials.length > 0 && (
            <div>
              <div className="section-head">
                <div>
                  <span className="eyebrow">Officina</span>
                  <h2 className="section-title">Tutorial dell’autore</h2>
                </div>
                <Link href="/tutorial" className="link-more">
                  Tutti i tutorial
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tutorials.slice(0, 3).map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
