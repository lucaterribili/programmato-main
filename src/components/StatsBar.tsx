import type { HomepageStats } from '@/lib/types';
import type { Locale } from '@/lib/i18n/config';
import { getMessages } from '@/lib/i18n/messages';

function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.0', '')}k`;
  return String(value);
}

export function StatsBar({ stats, locale }: { stats?: HomepageStats; locale: Locale }) {
  const t = getMessages(locale).common.stats;
  const hasNumbers =
    stats &&
    (stats.totalArticles > 0 ||
      stats.totalTutorials > 0 ||
      stats.totalAuthors > 0 ||
      stats.totalViews > 0);

  const items = hasNumbers
    ? [
        { value: compactNumber(stats.totalArticles), label: t.fieldNotes },
        { value: compactNumber(stats.totalTutorials), label: t.playbook },
        { value: compactNumber(stats.totalAuthors), label: t.authors },
        { value: compactNumber(stats.totalViews), label: t.reads },
      ]
    : [
        { value: '01', label: t.fieldNotes },
        { value: '02', label: t.playbook },
        { value: '03', label: t.evals },
        { value: '04', label: t.newsletter },
      ];

  return (
    <section className="stats-bar" aria-label={t.aria}>
      <div className="container-page">
        <div className="stats-grid">
          {items.map((item) => (
            <div className="stat" key={item.label}>
              <span className="stat-value">{item.value}</span>
              <span className="stat-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
