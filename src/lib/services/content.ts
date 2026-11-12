/**
 * Content processing utilities for articles, tutorials, and other text content.
 */

import type { TableOfContentsItem, FAQItem } from '@/lib/types';

/**
 * Extract text content until the first period (for excerpts).
 */
export function extractUntilFirstDot(text: string, maxLength: number = 200): string {
  if (!text) return '';
  const cleaned = text.replace(/<[^>]*>/g, '').trim();
  const firstDotIndex = cleaned.indexOf('.');
  if (firstDotIndex > 0 && firstDotIndex < maxLength) {
    return cleaned.substring(0, firstDotIndex + 1);
  }
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength).trim() + '...';
  }
  return cleaned;
}

/**
 * Extract first paragraph from HTML content.
 */
export function extractFirstParagraph(html: string): string {
  if (!html) return '';
  const match = html.match(/<p[^>]*>(.*?)<\/p>/i);
  if (match) {
    return match[1].replace(/<[^>]*>/g, '').trim();
  }
  return html.replace(/<[^>]*>/g, '').trim().substring(0, 300);
}

/**
 * Calculate reading time in minutes based on word count.
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  if (!text) return 0;
  const wordCount = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Generate table of contents from HTML headings.
 */
export function generateTableOfContents(html: string): TableOfContentsItem[] {
  if (!html) return [];
  const toc: TableOfContentsItem[] = [];
  const headingRegex = /<h([2-4])[^>]*id=["']([^"']+)["'][^>]*>(.*?)<\/h[2-4]>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const id = match[2];
    const text = match[3].replace(/<[^>]*>/g, '').trim();
    toc.push({ level, text, id });
  }
  return toc;
}

/**
 * Sanitize HTML for safe rendering (basic version).
 */
export function sanitizeHtml(html: string, allowedTags: string[] = []): string {
  if (!html) return '';
  // This is a basic implementation - in production use DOMPurify
  const defaultAllowed = ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'h2', 'h3', 'h4', 'img'];
  const allowed = [...new Set([...defaultAllowed, ...allowedTags])];
  const tagPattern = new RegExp(`<\/?(?!(${allowed.join('|')}))[a-zA-Z][^>]*>`, 'gi');
  return html.replace(tagPattern, '');
}

/**
 * Truncate HTML to a maximum number of characters, preserving tags.
 */
export function truncateHtml(html: string, maxLength: number): string {
  if (!html || html.length <= maxLength) return html;
  
  let result = '';
  let currentLength = 0;
  let inTag = false;
  let tagBuffer = '';
  
  for (let i = 0; i < html.length && currentLength < maxLength; i++) {
    const char = html[i];
    
    if (char === '<') {
      inTag = true;
      tagBuffer = '<';
    } else if (char === '>' && inTag) {
      inTag = false;
      tagBuffer += '>';
      result += tagBuffer;
      tagBuffer = '';
    } else if (inTag) {
      tagBuffer += char;
    } else {
      result += char;
      currentLength++;
    }
  }
  
  // Close any unclosed tags (basic approach)
  const openTags = result.match(/<([a-z]+)[^>]*>/gi) || [];
  const closeTags = result.match(/<\/([a-z]+)>/gi) || [];
  const openTagNames = openTags.map(t => t.match(/<([a-z]+)/i)?.[1]).filter((t): t is string => Boolean(t));
  const closeTagNames = closeTags.map(t => t.match(/<\/([a-z]+)/i)?.[1]).filter(Boolean);
  
  for (const tag of openTagNames.reverse()) {
    if (!closeTagNames.includes(tag) && !['br', 'hr', 'img', 'input'].includes(tag)) {
      result += `</${tag}>`;
    }
  }
  
  return result + (currentLength >= maxLength ? '...' : '');
}

/**
 * Extract FAQ items from structured content.
 */
export function extractFAQItems(content: string): FAQItem[] {
  const faqs: FAQItem[] = [];
  const faqRegex = /<details[^>]*>\s*<summary[^>]*>(.*?)<\/summary>\s*(.*?)\s*<\/details>/gis;
  let match;
  while ((match = faqRegex.exec(content)) !== null) {
    faqs.push({
      question: match[1].replace(/<[^>]*>/g, '').trim(),
      answer: match[2].trim(),
    });
  }
  return faqs;
}

/**
 * Convert markdown-like syntax to HTML (basic).
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  return markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(.*$)/gim, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

/**
 * Slugify a string for URLs.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Format date for display.
 */
export function formatDate(dateString: string | undefined | null, locale: string = 'it-IT'): string | null {
  if (!dateString) return null;
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return null;
  }
}

/**
 * Format relative time (e.g., "2 ore fa").
 */
export function formatRelativeTime(dateString: string | undefined | null, locale: string = 'it-IT'): string | null {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'ora';
    if (diffMins < 60) return `${diffMins} min fa`;
    if (diffHours < 24) return `${diffHours} ore fa`;
    if (diffDays < 7) return `${diffDays} giorni fa`;
    return formatDate(dateString, locale);
  } catch {
    return null;
  }
}

export const ContentService = {
  extractUntilFirstDot,
  extractFirstParagraph,
  calculateReadingTime,
  generateTableOfContents,
  sanitizeHtml,
  truncateHtml,
  extractFAQItems,
  markdownToHtml,
  slugify,
  formatDate,
  formatRelativeTime,
};

export default ContentService;