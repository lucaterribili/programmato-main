import { getPortalDomain } from "@/lib/config";
import { mediaUrl } from "@/lib/media";
import type { PostSummary } from "@/lib/api";

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", year: "numeric" }).format(
    new Date(iso)
  );
}

export function ArticleCard({ post }: { post: PostSummary }) {
  const outlet = getPortalDomain(post.domain);
  const cover = mediaUrl(post.image?.thumbs?.cover ?? post.image?.thumbs?.large);
  const date = formatDate(post.publishedAt);

  return (
    <article className={`article-card ${outlet?.theme ?? "flagship"}`}>
      {cover && (
        <div className="article-cover">
          <img src={cover} alt="" loading="lazy" />
        </div>
      )}
      <div className="article-body">
        <span className="article-meta">
          <span className="article-outlet">{outlet?.label ?? post.domain}</span>
          {date && <span className="article-date">{date}</span>}
        </span>
        <h3>{post.title}</h3>
        {post.summary && <p>{post.summary}</p>}
        {post.mainCategory && <span className="article-tag">{post.mainCategory.title}</span>}
      </div>
    </article>
  );
}
