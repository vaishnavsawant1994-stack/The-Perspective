import type { Metadata } from "next";
import { CategoryLandingPage } from "@/components/category/category-landing-page";
import { siteConfig } from "@/config/site";
import { technologyContent } from "@/data/mock/technology";
import { createCategoryStructuredData } from "@/lib/category-structured-data";

const description = "Technology reporting and analysis from The Perspective, covering artificial intelligence, enterprise technology, infrastructure, cybersecurity, startups and emerging innovation.";

export const metadata: Metadata = {
  title: "Technology",
  description,
  alternates: { canonical: "/technology" },
  openGraph: { title: "Technology | The Perspective", description, type: "website", url: "/technology", siteName: siteConfig.name, images: [{ url: "/images/articles/ai-infrastructure.png", width: 1536, height: 1024, alt: "Technology reporting and analysis from The Perspective" }] },
  twitter: { card: "summary_large_image", title: "Technology | The Perspective", description, images: ["/images/articles/ai-infrastructure.png"] },
};

export default function TechnologyPage() {
  const structuredData = createCategoryStructuredData(technologyContent, description);
  return <><script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" /><CategoryLandingPage content={technologyContent} /></>;
}
