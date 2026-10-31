import type { Metadata } from "next";
import { PersonalMagazineDiscoveryRedesign } from "@/components/personal-magazine/personal-magazine-discovery-redesign";
import { siteConfig } from "@/config/site";
import { getResolvedPersonalMagazineSummaries, validatePersonalMagazineData } from "@/lib/personal-magazines";

const title = "Discover Personal Magazines | The Perspective";
const description = "Discover published Personal Magazines featuring founders, executives, investors and leaders, and explore their stories and ideas.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/personal-magazines/discover" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/personal-magazines/discover",
    siteName: siteConfig.name,
    images: [{ url: "/images/articles/arjun-mehta.png", width: 1024, height: 1536, alt: "Personal Magazine discovery catalogue" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/articles/arjun-mehta.png"],
  },
};

export const dynamic = "force-dynamic";

export default function PersonalMagazineDiscoveryPage() {
  const validationErrors = validatePersonalMagazineData();
  if (validationErrors.length > 0) {
    throw new Error(`Invalid Personal Magazine data:\n${validationErrors.join("\n")}`);
  }

  return (
    <PersonalMagazineDiscoveryRedesign
      discoveryOnly
      editions={getResolvedPersonalMagazineSummaries()}
    />
  );
}
