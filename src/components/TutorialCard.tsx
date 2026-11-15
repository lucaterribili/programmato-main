import Link from 'next/link';
import { Clock3, ListChecks } from 'lucide-react';
import type { TutorialPreview } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { format, getMessages, pluralize } from '@/lib/i18n/messages';
import { localizedPath } from '@/lib/i18n/paths';

interface TutorialCardProps {
  tutorial: TutorialPreview;
  locale: Locale;
}

export function TutorialCard({ tutorial, locale }: TutorialCardProps) {
  const t = getMessages(locale).common.cards;
  return (
    <article className="tutorial-card">
      {(tutorial.difficulty || tutorial.estimatedTime) && (
        <div className="tutorial-card-top">
          {tutorial.difficulty && (
            <span className={`tutorial-difficulty tutorial-difficulty--${tutorial.difficulty}`}>
              {t.difficulty[tutorial.difficulty]}
            </span>
          )}
          {tutorial.estimatedTime ? (
            <span className="tutorial-time inline-flex items-center gap-1.5">
              <Clock3 size={13} strokeWidth={1.9} aria-hidden="true" />
              {format(t.minutes, { n: tutorial.estimatedTime })}
            </span>
          ) : null}
        </div>
      )}

      <Link href={localizedPath(locale, `/tutorial/${tutorial.slug}`)} className="tutorial-body">
        {tutorial.mainCategory && (
          <span className="tutorial-kicker">{tutorial.mainCategory.title}</span>
        )}
        <h3 className="tutorial-title">{tutorial.title}</h3>
        {tutorial.description && (
          <p className="tutorial-description">{tutorial.description}</p>
        )}
        <div className="tutorial-steps">
          <ListChecks size={14} strokeWidth={1.9} aria-hidden="true" />
          {tutorial.stepsCount ? pluralize(locale, t.steps, tutorial.stepsCount) : t.stepByStep}
        </div>
      </Link>
    </article>
  );
}
