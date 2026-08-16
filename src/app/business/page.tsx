import type { Metadata } from "next";
import { CategoryLandingPage } from "@/components/category/category-landing-page";
import { BusinessRedesign } from "@/components/category/business-redesign";
import { siteConfig } from "@/config/site";
import { businessContent } from "@/data/mock/business";
import { createCategoryStructuredData } from "@/lib/category-structured-data";

const description = "Business reporting and analysis from The Perspective, covering companies, the global economy, entrepreneurship, startups, strategy and the forces shaping modern enterprise.";

export const metadata: Metadata = {
  title: "Business",
  description,
  alternates: { canonical: "/business" },
  openGraph: { title: "Business | The Perspective", description, type: "website", url: "/business", siteName: siteConfig.name, images: [{ url: "/images/articles/global-growth.png", width:1536, height:1024, alt:"Business reporting and analysis from The Perspective" }] },
  twitter: { card:"summary_large_image", title:"Business | The Perspective", description, images:["/images/articles/global-growth.png"] },
};

export default function BusinessPage() {
  const structuredData = createCategoryStructuredData(businessContent, description);
  return <><script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" /><BusinessRedesign content={businessContent} /><div id="current-business-experience"><CategoryLandingPage content={businessContent} /></div></>;
}
