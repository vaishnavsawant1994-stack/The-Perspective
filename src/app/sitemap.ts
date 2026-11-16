import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { publishedPaths } from "@/modules/r9/projection";
import { unpublishedFictionalArticleSlugs } from "@/data/mock/articles";

export const dynamic = "force-dynamic";

const designedPaths = ["/", "/magazine", "/magazine/archive", "/magazine/premium", "/subscribe", "/newsletters", "/advertise", "/search", "/authors", "/personal-magazines", "/personal-magazines/discover", "/sitemap"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await publishedPaths();
  const unpublishedArticlePaths = new Set([...unpublishedFictionalArticleSlugs].map((slug) => `/article/${slug}`));
  const paths = [...new Set([...designedPaths, ...published])].filter((path) => !unpublishedArticlePaths.has(path));
  return paths.map((path) => ({
    url: new URL(path, siteConfig.url).href,
    changeFrequency: path.startsWith("/magazine/read/") || path.startsWith("/article/") ? "yearly" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
