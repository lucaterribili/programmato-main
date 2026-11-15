import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';

interface PaginationProps {
  locale: Locale;
  currentPage: number;
  totalPages: number;
  /** Percorso interno della lista (`/blog`): si traduce nella lingua corrente. */
  basePath: string;
  query?: Record<string, string | undefined>;
}

export function Pagination({ locale, currentPage, totalPages, basePath, query = {} }: PaginationProps) {
  if (totalPages <= 1) return null;
  const t = getMessages(locale).common.pagination;
  const publicBase = localizedPath(locale, basePath);

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (page > 1) params.set('page', String(page));
    const queryString = params.toString();
    return queryString ? `${publicBase}?${queryString}` : publicBase;
  };

  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav className="pagination" aria-label={t.label}>
      {currentPage > 1 && (
        <Link href={hrefFor(currentPage - 1)} className="pagination-link" aria-label={t.previous} rel="prev">
          <ChevronLeft size={16} aria-hidden="true" />
        </Link>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={hrefFor(page)}
          className={`pagination-link${page === currentPage ? ' pagination-link--active' : ''}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link href={hrefFor(currentPage + 1)} className="pagination-link" aria-label={t.next} rel="next">
          <ChevronRight size={16} aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
