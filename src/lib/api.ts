const REST_API_URL = process.env.REST_API_URL ?? "http://localhost:8080";

export type PostSummary = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  domain?: string;
  publishedAt?: string;
  image?: {
    thumbs?: {
      icon?: string;
      cover?: string;
      large?: string;
    };
  };
  mainCategory?: {
    title: string;
    slug: string;
  };
};

type PostPage = {
  content: PostSummary[];
};

type FetchLatestPostsParams = {
  domains: string[];
  language?: string;
  pageSize?: number;
};

export async function fetchLatestPosts({
  domains,
  language = "it",
  pageSize = 12,
}: FetchLatestPostsParams): Promise<PostSummary[]> {
  const params = new URLSearchParams({
    domains: domains.join(","),
    language,
    pageSize: String(pageSize),
  });

  try {
    const response = await fetch(`${REST_API_URL}/post/list/multi-domain?${params.toString()}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const page = (await response.json()) as PostPage;
    return page.content ?? [];
  } catch {
    return [];
  }
}
