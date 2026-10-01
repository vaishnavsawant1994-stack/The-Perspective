import "server-only";

import { readPublic } from "./commands";

export type PublishedArticleCard = {
  slug: string;
  title: string;
  author: string;
  summary: string;
};

export type PublishedIssueCard = {
  slug: string;
  title: string;
  season: string;
  theme: string;
  availability: string;
  state: string;
  editionNumber: number;
  publishedAt?: string;
  cover: { headline: string; dek: string; alt: string };
  articles: PublishedArticleCard[];
};

export type PublishedShelfCard = {
  slug: string;
  name: string;
  principles: string;
  description: string;
  stories: Array<{ title: string; slug: string }>;
};

export function publicSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}

async function safeRead(functionName: string, argument: string | null) {
  try {
    return await readPublic(functionName, argument);
  } catch {
    return null;
  }
}

function isIssue(value: unknown): value is PublishedIssueCard {
  if (!value || typeof value !== "object" || !("title" in value) || !("slug" in value) || !("articles" in value)) return false;
  const issue = value as PublishedIssueCard;
  return issue.state === "ISSUE_PUBLISHED" || issue.state === "ISSUE_ARCHIVED";
}

export async function publishedPaths() {
  const value = await safeRead("r9_public_sitemap", null);
  if (!Array.isArray(value)) return [];
  return value.filter((path): path is string => typeof path === "string" && path.startsWith("/"));
}

export async function publishedCatalogue() {
  const paths = await publishedPaths();
  const slugs = paths.filter((path) => path.startsWith("/magazine/read/")).map((path) => decodeURIComponent(path.slice("/magazine/read/".length)));
  const issues = await Promise.all(slugs.map((slug) => safeRead("r9_public_issue", slug)));
  return issues.filter(isIssue);
}

export async function publishedPremium() {
  const catalogue = await publishedCatalogue();
  const listed = await safeRead("r9_public_premium", null);
  const allowed = new Set(Array.isArray(listed) ? listed.flatMap((item) => {
    if (!item || typeof item !== "object" || !("slug" in item)) return [];
    return [String((item as { slug: unknown }).slug)];
  }) : []);
  return catalogue.filter((issue) => issue.availability === "PREMIUM" && allowed.has(issue.slug));
}

export async function publishedSearch(query: string) {
  const value = await safeRead("r9_public_search", query);
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || !("slug" in item) || !("title" in item) || !("kind" in item)) return [];
    const hit = item as { slug: unknown; title: unknown; kind: unknown; publishedAt?: unknown; author?: unknown };
    if (hit.kind !== "issue" && hit.kind !== "article") return [];
    return [{
      slug: String(hit.slug),
      title: String(hit.title),
      kind: hit.kind,
      publishedAt: typeof hit.publishedAt === "string" ? hit.publishedAt : "",
      author: typeof hit.author === "string" ? hit.author : "",
    }];
  });
}

export async function publishedShelf(slug: string) {
  const value = await safeRead("r9_public_shelf", slug);
  if (!value || typeof value !== "object" || !("name" in value) || !("stories" in value)) return null;
  const shelf = value as PublishedShelfCard;
  return {
    slug: String(shelf.slug || slug),
    name: String(shelf.name),
    principles: String(shelf.principles ?? ""),
    description: String(shelf.description ?? ""),
    stories: Array.isArray(shelf.stories) ? shelf.stories.flatMap((story) => {
      if (!story || typeof story !== "object" || !("title" in story) || !("slug" in story)) return [];
      return [{ title: String(story.title), slug: String(story.slug) }];
    }) : [],
  };
}

export async function publishedShelves() {
  const value = await safeRead("r9_public_shelves", null);
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || !("slug" in item) || !("name" in item)) return [];
    return [{ slug: String((item as { slug: unknown }).slug), name: String((item as { name: unknown }).name) }];
  });
}
