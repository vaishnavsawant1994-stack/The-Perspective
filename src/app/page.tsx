import type { Metadata } from "next";
import { HomepageRedesign } from "@/components/home/homepage-redesign";
import { PublishedEditionBand } from "@/components/magazine/published/published-projection";
import { siteConfig } from "@/config/site";
import { getHomepageRedesignContent, validateHomepageRedesignData } from "@/lib/homepage-redesign";
import { publishedCatalogue } from "@/modules/r9/projection";

const description = "Independent business journalism, leadership interviews, market intelligence, technology analysis, magazines, podcasts and ideas for a wider point of view.";

export const metadata: Metadata = {
  title: { absolute: "The Perspective | News, Knowledge, Influence" },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title: "The Perspective | News, Knowledge, Influence",
    description,
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    images: [{ url: "/images/articles/global-leadership.png", width: 1536, height: 1024, alt: "The Perspective editorial newsroom" }],
  },
  twitter: { card: "summary_large_image", title: "The Perspective | News, Knowledge, Influence", description, images: ["/images/articles/global-leadership.png"] },
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const errors = validateHomepageRedesignData();
  if (errors.length > 0) throw new Error(`Invalid homepage data:\n${errors.join("\n")}`);
  const content = getHomepageRedesignContent();
  if (!content) throw new Error("The homepage editorial package is unavailable.");
  const published = await publishedCatalogue();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description,
    potentialAction: { "@type": "SearchAction", target: `${siteConfig.url}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
    <PublishedEditionBand heading="Published editions" issues={published} />
    <HomepageRedesign content={content} />
  </>;
}
