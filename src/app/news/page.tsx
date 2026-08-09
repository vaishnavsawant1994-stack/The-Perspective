import type { Metadata } from "next";
import { NewsLandingPage } from "@/components/news/news-landing-page";
import { siteConfig } from "@/config/site";
import { newsContent, newsStructuredArticles } from "@/data/mock/news";
import { createCollectionStructuredData } from "@/lib/category-structured-data";

const description = "Breaking developments, major stories and the topics shaping business, leadership, technology, markets and the global economy from The Perspective.";

export const metadata: Metadata = {
  title: "News",
  description,
  alternates: { canonical: "/news" },
  openGraph: { title: "News | The Perspective", description, type: "website", url: "/news", siteName: siteConfig.name, images: [{ url: "/images/articles/global-growth.png", width: 1536, height: 1024, alt: "News and major stories from The Perspective" }] },
  twitter: { card: "summary_large_image", title: "News | The Perspective", description, images: ["/images/articles/global-growth.png"] },
};

export default function NewsPage() {
  const structuredData = createCollectionStructuredData("News | The Perspective", "/news", description, newsStructuredArticles);
  return <><script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" /><NewsLandingPage content={newsContent} /></>;
}
