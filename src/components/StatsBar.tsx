import type { HomepageStats } from '@/lib/types';

function compactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.0', '')}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace('.0', '')}k`;
  return String(value);
}

export function StatsBar({ stats }: { stats?: HomepageStats }) {
  const hasNumbers =
    stats &&
    (stats.totalArticles > 0 ||
      stats.totalTutorials > 0 ||
      stats.totalAuthors > 0 ||
      stats.totalViews > 0);

  const items = hasNumbers
    ? [
        { value: compactNumber(stats.totalArticles), label: 'Field notes' },
        { value: compactNumber(stats.totalTutorials), label: 'Playbook' },
        { value: compactNumber(stats.totalAuthors), label: 'Autori' },
        { value: compactNumber(stats.totalViews), label: 'Letture' },
      ]
    : [
        { value: '01', label: 'Field notes' },
        { value: '02', label: 'Playbook' },
        { value: '03', label: 'Evals' },
        { value: '04', label: 'Newsletter' },
      ];

  return (
    <section className="stats-bar" aria-label="Il portale in numeri">
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
