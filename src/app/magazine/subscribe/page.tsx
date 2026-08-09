import type { Metadata } from "next";
import { MagazineSubscriptionPage } from "@/components/magazine/subscription/magazine-subscription-page";
import { siteConfig } from "@/config/site";
import { getMagazineSubscriptionContent, validateMagazineSubscriptionData } from "@/lib/magazine-subscription";
import { createMagazineSubscriptionStructuredData } from "@/lib/magazine-structured-data";

const content = getMagazineSubscriptionContent();
const title = "Subscribe | The Perspective Magazine";
const description = "Compare The Perspective Magazine subscription options for digital editions, archive access and Premium editorial experiences.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/magazine/subscribe" },
  openGraph: { title, description, type: "website", url: "/magazine/subscribe", siteName: siteConfig.name },
  twitter: { card: "summary_large_image", title, description },
};

export default function MagazineSubscriptionRoute() {
  const validationErrors = validateMagazineSubscriptionData();
  if (validationErrors.length > 0) throw new Error(`Invalid Magazine subscription data:\n${validationErrors.join("\n")}`);
  const structuredData = createMagazineSubscriptionStructuredData();
  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <MagazineSubscriptionPage content={content} />
  </>;
}
