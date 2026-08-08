import type { Metadata } from "next";
import { CategoryLandingPage } from "@/components/category/category-landing-page";
import { siteConfig } from "@/config/site";
import { businessContent } from "@/data/mock/business";

const description = "Business reporting and analysis from The Perspective, covering companies, the global economy, entrepreneurship, startups, strategy and the forces shaping modern enterprise.";

export const metadata: Metadata = {
  title: "Business",
  description,
  alternates: { canonical: "/business" },
  openGraph: { title: "Business | The Perspective", description, type: "website", url: "/business", siteName: siteConfig.name, images: [{ url: "/images/articles/global-growth.png", width:1536, height:1024, alt:"Business reporting and analysis from The Perspective" }] },
  twitter: { card:"summary_large_image", title:"Business | The Perspective", description, images:["/images/articles/global-growth.png"] },
};

export default function BusinessPage() {
  const majorStories = [businessContent.lead.primary, ...businessContent.lead.supporting, ...businessContent.topStories];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Business | The Perspective",
    description,
    url: `${siteConfig.url}/business`,
    mainEntity: { "@type": "ItemList", itemListElement: majorStories.map((article, index) => ({ "@type":"ListItem", position:index + 1, url:`${siteConfig.url}/article/${article.slug}`, name:article.title })) },
  };
  return <><script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" /><CategoryLandingPage content={businessContent} /></>;
}
