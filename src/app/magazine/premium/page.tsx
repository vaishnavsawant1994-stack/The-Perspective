import type { Metadata } from "next";
import { MagazinePremiumPage } from "@/components/magazine/premium/magazine-premium-page";
import { MagazinePremiumRedesign } from "@/components/magazine/premium/magazine-premium-redesign";
import { PublishedEditionBand } from "@/components/magazine/published/published-projection";
import { siteConfig } from "@/config/site";
import { getMagazinePremiumContent, validateMagazinePremiumData } from "@/lib/magazine-premium";
import { createMagazinePremiumStructuredData } from "@/lib/magazine-structured-data";
import { publishedPremium } from "@/modules/r9/projection";

const content = getMagazinePremiumContent();
const description = "Explore Premium editions of The Perspective Magazine, featuring deeper interviews, long-form analysis, special issues and exclusive editorial packages.";
const title = "Premium Magazine | The Perspective";
const cover = content.heroIssue.coverImage;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/magazine/premium" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/magazine/premium",
    siteName: siteConfig.name,
    images: cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] : undefined,
  },
  twitter: { card: "summary_large_image", title, description, images: cover ? [cover.src] : undefined },
};

export const dynamic = "force-dynamic";

export default async function MagazinePremiumRoute() {
  const validationErrors = validateMagazinePremiumData();
  if (validationErrors.length > 0) throw new Error(`Invalid Premium Magazine data:\n${validationErrors.join("\n")}`);
  const structuredData = createMagazinePremiumStructuredData(content.premiumIssues);
  const published = await publishedPremium();

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <PublishedEditionBand heading="Published premium editions" issues={published} />
    <MagazinePremiumRedesign content={content} />
    <MagazinePremiumPage content={content} />
  </>;
}
