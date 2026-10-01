import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { publishedPaths } from "@/modules/r9/projection";

export const dynamic = "force-dynamic";

const designedPaths = ["/", "/magazine", "/magazine/archive", "/magazine/premium", "/magazine/subscribe", "/search", "/authors", "/personal-magazines", "/sitemap"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await publishedPaths();
  const paths = [...new Set([...designedPaths, ...published])];
  return paths.map((path) => ({
    url: new URL(path, siteConfig.url).href,
    changeFrequency: path.startsWith("/magazine/read/") || path.startsWith("/article/") ? "yearly" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
