import { getHomepageRedesignContent } from "@/lib/homepage-redesign";

const featuredVideoSlug = "indias-digital-decade-road-ahead";

export function getVideoSlug(articleSlug: string) {
  return articleSlug === "technology-interview-daniel-kim" ? featuredVideoSlug : articleSlug;
}

export function getVideoDetailContent(slug: string) {
  const homepage = getHomepageRedesignContent();
  if (!homepage) return undefined;
  const stories = [...homepage.videos, ...homepage.shorts].filter((story, index, all) => all.findIndex((item) => item.article.id === story.article.id) === index);
  const story = stories.find((item) => getVideoSlug(item.article.slug) === slug);
  if (!story) return undefined;
  return { story, videos: homepage.videos, shorts: homepage.shorts, homepage };
}

export function getVideoDetailParams() {
  const homepage = getHomepageRedesignContent();
  if (!homepage) return [];
  return [...homepage.videos, ...homepage.shorts]
    .map((story) => ({ slug: getVideoSlug(story.article.slug) }))
    .filter((item, index, all) => all.findIndex((candidate) => candidate.slug === item.slug) === index);
}

export type VideoDetailContent = NonNullable<ReturnType<typeof getVideoDetailContent>>;
