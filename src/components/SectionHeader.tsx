import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'Vedi tutto',
}: SectionHeaderProps) {
  return (
    <div className="section-head">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-lede">{description}</p>}
      </div>
      {href && (
        <Link href={href} className="link-more">
          {linkLabel}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
