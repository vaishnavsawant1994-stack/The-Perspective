import type { Metadata } from "next";
import { LatestNewsPage } from "@/components/latest/latest-news-page";
import { latestArticles, latestInDepth, latestLeadArticles, latestMagazineIssue, latestMostRead } from "@/data/mock/latest";

const description = "Read the latest reporting, analysis and developments in business, leadership, technology, finance, markets, culture and global affairs from The Perspective.";
export const metadata: Metadata = {
  title: "Latest News",
  description,
  alternates: { canonical: "/latest" },
  openGraph: { title: "Latest News | The Perspective", description, type: "website", url: "/latest", images: [{ url: "/images/articles/global-growth.png", width:1536, height:1024, alt:"Latest News from The Perspective" }] },
  twitter: { card:"summary_large_image", title:"Latest News | The Perspective", description, images:["/images/articles/global-growth.png"] },
};

export default function LatestPage() {
  return <LatestNewsPage articles={latestArticles} inDepth={latestInDepth} leadArticles={latestLeadArticles} magazineIssue={latestMagazineIssue} mostRead={[...latestMostRead]} />;
}
