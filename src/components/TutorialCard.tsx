import Link from 'next/link';
import { Clock3, ListChecks } from 'lucide-react';
import type { TutorialPreview } from '@/lib/types';

const DIFFICULTY_LABEL: Record<NonNullable<TutorialPreview['difficulty']>, string> = {
  beginner: 'Base',
  intermediate: 'Intermedio',
  advanced: 'Avanzato',
};

interface TutorialCardProps {
  tutorial: TutorialPreview;
}

export function TutorialCard({ tutorial }: TutorialCardProps) {
  return (
    <article className="tutorial-card">
      {(tutorial.difficulty || tutorial.estimatedTime) && (
        <div className="tutorial-card-top">
          {tutorial.difficulty && (
            <span className={`tutorial-difficulty tutorial-difficulty--${tutorial.difficulty}`}>
              {DIFFICULTY_LABEL[tutorial.difficulty]}
            </span>
          )}
          {tutorial.estimatedTime ? (
            <span className="tutorial-time inline-flex items-center gap-1.5">
              <Clock3 size={13} strokeWidth={1.9} aria-hidden="true" />
              {tutorial.estimatedTime} min
            </span>
          ) : null}
        </div>
      )}

      <Link href={`/tutorial/${tutorial.slug}`} className="tutorial-body">
        {tutorial.mainCategory && (
          <span className="tutorial-kicker">{tutorial.mainCategory.title}</span>
        )}
        <h3 className="tutorial-title">{tutorial.title}</h3>
        {tutorial.description && (
          <p className="tutorial-description">{tutorial.description}</p>
        )}
        <div className="tutorial-steps">
          <ListChecks size={14} strokeWidth={1.9} aria-hidden="true" />
          {tutorial.stepsCount ? `${tutorial.stepsCount} passi` : 'Guida passo-passo'}
        </div>
      </Link>
    </article>
  );
}
