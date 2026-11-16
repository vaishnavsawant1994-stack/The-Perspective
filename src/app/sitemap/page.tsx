import type { Metadata } from "next";
import { PublishedPathList } from "@/components/magazine/published/published-projection";
import { SitemapPage } from "@/components/utility/utility-pages";
import { publishedPaths } from "@/modules/r9/projection";
import { unpublishedFictionalArticleSlugs } from "@/data/mock/articles";

export const metadata: Metadata = { title: "Sitemap", alternates: { canonical: "/sitemap" }, robots: { index: true, follow: true } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const unpublishedArticlePaths = new Set([...unpublishedFictionalArticleSlugs].map((slug) => `/article/${slug}`));
  const paths = (await publishedPaths()).filter((path) => !unpublishedArticlePaths.has(path));
  return <>
    <PublishedPathList paths={paths} />
    <SitemapPage />
  </>;
}

