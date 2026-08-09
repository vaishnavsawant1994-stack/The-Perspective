import { getTopicBySlug } from "@/data/mock/topics";
import { buildSearchUrl } from "@/lib/search";

const categoryDestinations: Readonly<Record<string, string>> = {
  business: "/business",
  leadership: "/leadership",
  technology: "/technology",
  opinion: "/perspective",
  "the-perspective": "/perspective",
};

const topicAliases: Readonly<Record<string, string>> = {
  ai: "artificial-intelligence",
  work: "future-of-work",
};

export function normalizeEditorialSlug(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function getEditorialDestination(label: string, slug = normalizeEditorialSlug(label)) {
  const normalizedSlug = normalizeEditorialSlug(slug);
  const topicSlug = topicAliases[normalizedSlug] ?? normalizedSlug;
  if (getTopicBySlug(topicSlug)) return `/topic/${topicSlug}`;
  if (categoryDestinations[normalizedSlug]) return categoryDestinations[normalizedSlug];
  return buildSearchUrl({ query: label });
}
