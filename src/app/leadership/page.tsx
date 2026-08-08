import type { Metadata } from "next";
import { CategoryLandingPage } from "@/components/category/category-landing-page";
import { siteConfig } from "@/config/site";
import { leadershipContent } from "@/data/mock/leadership";
import { createCategoryStructuredData } from "@/lib/category-structured-data";

const description = "Leadership insight from The Perspective, including CEO interviews, founders, management strategy, boards, governance and the people shaping tomorrow's organizations.";

export const metadata: Metadata = {
  title: "Leadership",
  description,
  alternates: { canonical: "/leadership" },
  openGraph: { title: "Leadership | The Perspective", description, type: "website", url: "/leadership", siteName: siteConfig.name, images: [{ url: "/images/articles/global-leadership.png", width: 1536, height: 1024, alt: "Leadership insight and interviews from The Perspective" }] },
  twitter: { card: "summary_large_image", title: "Leadership | The Perspective", description, images: ["/images/articles/global-leadership.png"] },
};

export default function LeadershipPage() {
  const structuredData = createCategoryStructuredData(leadershipContent, description);
  return <><script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" /><CategoryLandingPage content={leadershipContent} /></>;
}
