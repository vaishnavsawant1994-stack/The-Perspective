import type { Metadata } from "next";
import { MagazineLandingPage } from "@/components/magazine/magazine-landing-page";
import { siteConfig } from "@/config/site";
import { getMagazineLandingContent } from "@/data/mock/magazines";
import { createMagazineStructuredData } from "@/lib/magazine-structured-data";

const description = "Explore The Perspective Magazine—curated issues featuring leadership, business, technology, interviews, essays and the ideas shaping tomorrow.";

export const metadata: Metadata = {
  title: "Magazine",
  description,
  alternates: { canonical: "/magazine" },
  openGraph: { title: "Magazine | The Perspective", description, type: "website", url: "/magazine", siteName: siteConfig.name, images: [{ url: "/images/articles/global-leadership.png", width: 1536, height: 1024, alt: "The Perspective Magazine" }] },
  twitter: { card: "summary_large_image", title: "Magazine | The Perspective", description, images: ["/images/articles/global-leadership.png"] },
};

export default function MagazinePage() {
  const content = getMagazineLandingContent();
  const structuredData = createMagazineStructuredData(content.magazine, [content.latestIssue, ...content.previousIssues, content.premiumIssue]);
  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <MagazineLandingPage content={content} />
  </>;
}
