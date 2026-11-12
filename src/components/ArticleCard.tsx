/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import { FileCode2 } from 'lucide-react';
import type { ArticlePreview } from '@/lib/types';
import { formatDate } from '@/lib/services/content';
import imageService from '@/lib/services/image';

interface ArticleCardProps {
  post: ArticlePreview;
  variant?: 'default' | 'featured' | 'compact';
  className?: string;
}

function initials(name?: string | null): string {
  if (!name) return 'P';
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function ArticleCard({ post, variant = 'default', className = '' }: ArticleCardProps) {
  const href = `/blog/${post.slug}`;
  const cover = imageService.getCoverImagePath(
    post.image ?? null,
    post.mainCategory?.image ?? null
  );
  const date = post.publishedAt ? formatDate(post.publishedAt) : null;
  const avatar = post.author?.avatar ? imageService.getImageUrl(post.author.avatar) : null;
  const category = post.mainCategory?.title;

  return (
    <article className={`article-card article-card--${variant} ${className}`.trim()}>
      <Link href={href} className="article-card-link" aria-label={post.title}>
        <div className="article-media">
          {cover ? (
            <img src={cover} alt={post.image?.alt ?? post.title} loading="lazy" />
          ) : (
            <div className="article-media--empty h-full w-full">
              <FileCode2 size={variant === 'compact' ? 22 : 38} strokeWidth={1.3} aria-hidden="true" />
            </div>
          )}
          {category && variant !== 'compact' && (
            <span className="pill pill-light">{category}</span>
          )}
        </div>

        <div className="article-body">
          <div className="article-meta">
            {variant === 'compact' ? (
              <>
                {category && <span>{category}</span>}
                {category && date && <span className="article-meta-dot" aria-hidden="true">•</span>}
                {date && <span>{date}</span>}
              </>
            ) : (
              <>
                {date && <span>{date}</span>}
                {date && post.readingTime && (
                  <span className="article-meta-dot" aria-hidden="true">•</span>
                )}
                {post.readingTime && <span>{post.readingTime} min di lettura</span>}
                {!date && !post.readingTime && post.sourceDomain && <span>{post.sourceDomain}</span>}
              </>
            )}
          </div>

          <h3 className="article-title">{post.title}</h3>

          {variant !== 'compact' && post.summary && (
            <p className="article-excerpt">{post.summary}</p>
          )}

          {variant !== 'compact' && post.author && (
            <div className="article-foot">
              <span className="article-avatar">
                {avatar ? (
                  <img src={avatar} alt={post.author.name} loading="lazy" />
                ) : (
                  initials(post.author.name)
                )}
              </span>
              <span>{post.author.name}</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
