import { ArticleCard } from "@/components/ArticleCard";
import type { PostSummary } from "@/lib/api";

export function ContentGrid({ posts }: { posts: PostSummary[] }) {
  if (posts.length === 0) {
    return (
      <div className="empty-state">
        Nessun contenuto disponibile al momento — riprova più tardi.
      </div>
    );
  }

  return (
    <div className="content-grid">
      {posts.map((post) => (
        <ArticleCard key={`${post.domain}-${post.id}`} post={post} />
      ))}
    </div>
  );
}
