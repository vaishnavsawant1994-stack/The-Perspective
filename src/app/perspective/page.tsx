import type { Metadata } from "next";
import { PerspectiveLandingPage } from "@/components/perspective/perspective-landing-page";
import { BlogsRedesign } from "@/components/perspective/blogs-redesign";
import { siteConfig } from "@/config/site";
import { perspectiveContent } from "@/data/mock/perspective";
import { createCollectionStructuredData } from "@/lib/category-structured-data";
import { getHomepageRedesignContent } from "@/lib/homepage-redesign";

const description = "Opinion, analysis and ideas from The Perspective's contributors, including economists, investors, executives, strategists and thinkers examining business, leadership, technology and society.";

export const metadata: Metadata = {
  title: { absolute: "The Perspective | Opinion, Analysis & Ideas" },
  description,
  alternates: { canonical: "/perspective" },
  openGraph: { title: "The Perspective | Opinion, Analysis & Ideas", description, type: "website", url: "/perspective", siteName: siteConfig.name, images: [{ url: "/images/articles/global-leadership.png", width: 1536, height: 1024, alt: "Opinion, analysis and ideas from The Perspective" }] },
  twitter: { card: "summary_large_image", title: "The Perspective | Opinion, Analysis & Ideas", description, images: ["/images/articles/global-leadership.png"] },
};

export default function PerspectivePage() {
  const structuredData = createCollectionStructuredData("The Perspective | Opinion, Analysis & Ideas", "/perspective", description, [perspectiveContent.lead.primary, ...perspectiveContent.lead.supporting, perspectiveContent.bigEssay, perspectiveContent.debate.point.article, perspectiveContent.debate.counterpoint.article]);
  const homepage = getHomepageRedesignContent();
  if (!homepage) throw new Error("Blogs page requires homepage editorial content.");
  return <><script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" /><BlogsRedesign content={perspectiveContent} homepage={homepage}/><PerspectiveLandingPage content={perspectiveContent} /></>;
}
