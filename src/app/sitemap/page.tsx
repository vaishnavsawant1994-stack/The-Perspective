import type { Metadata } from "next";
import { PublishedPathList } from "@/components/magazine/published/published-projection";
import { SitemapPage } from "@/components/utility/utility-pages";
import { publishedPaths } from "@/modules/r9/projection";

export const metadata: Metadata = { title: "Sitemap", robots: { index: true, follow: true } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const paths = await publishedPaths();
  return <>
    <PublishedPathList paths={paths} />
    <SitemapPage />
  </>;
}

