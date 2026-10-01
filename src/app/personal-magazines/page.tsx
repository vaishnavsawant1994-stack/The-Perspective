import type { Metadata } from "next";
import { PersonalMagazineCollectionPage } from "@/components/personal-magazine/personal-magazine-collection-page";
import { PersonalMagazinesRedesign } from "@/components/personal-magazine/personal-magazines-redesign";
import { PersonalMagazineDiscoveryRedesign } from "@/components/personal-magazine/personal-magazine-discovery-redesign";
import { PublishedShelfIndex } from "@/components/magazine/published/published-projection";
import { siteConfig } from "@/config/site";
import { getFeaturedPersonalMagazines, getSelectedPersonalMagazineStories, validatePersonalMagazineListing } from "@/lib/personal-magazine-listing";
import { createPersonalMagazineListingStructuredData } from "@/lib/personal-magazine-listing-structured-data";
import { getResolvedPersonalMagazineSummaries, searchPersonalMagazines, validatePersonalMagazineData } from "@/lib/personal-magazines";
import { getSearchDisplayQuery, normalizeSearchQuery, readSearchParameter } from "@/lib/search-query";
import { publishedShelves } from "@/modules/r9/projection";

type PersonalMagazinePageProps = {
  searchParams: Promise<{ q?: string | string[] }>;
};

const title = "Personal Magazines | The Perspective";
const description = "Explore Personal Magazines from The Perspective—editorial publications built around the journeys, ideas and work of founders, executives, investors and leaders.";

export async function generateMetadata({ searchParams }: PersonalMagazinePageProps): Promise<Metadata> {
  const parameters = await searchParams;
  const hasQuery = Boolean(normalizeSearchQuery(readSearchParameter(parameters.q)));
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/personal-magazines" },
    robots: { index: !hasQuery, follow: true },
    openGraph: { title, description, type: "website", url: "/personal-magazines", siteName: siteConfig.name, images: [{ url: "/images/articles/arjun-mehta.png", width: 1024, height: 1536, alt: "The Perspective Personal Magazine collection" }] },
    twitter: { card: "summary_large_image", title, description, images: ["/images/articles/arjun-mehta.png"] },
  };
}

export const dynamic = "force-dynamic";

export default async function PersonalMagazinesRoute({ searchParams }: PersonalMagazinePageProps) {
  const parameters = await searchParams;
  const rawQuery = readSearchParameter(parameters.q);
  const query = normalizeSearchQuery(rawQuery) ? getSearchDisplayQuery(rawQuery).slice(0, 120) : "";
  const allEditions = getResolvedPersonalMagazineSummaries();
  const featured = getFeaturedPersonalMagazines();
  const results = searchPersonalMagazines(query);
  const validationErrors = [...validatePersonalMagazineData(), ...validatePersonalMagazineListing()];
  if (validationErrors.length > 0) throw new Error(`Invalid Personal Magazine collection data:\n${validationErrors.join("\n")}`);
  const structuredData = createPersonalMagazineListingStructuredData(allEditions, description);
  const shelves = await publishedShelves();

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <PublishedShelfIndex shelves={shelves} />
    <PersonalMagazineDiscoveryRedesign editions={allEditions} />
    <PersonalMagazinesRedesign editions={allEditions} />
    <PersonalMagazineCollectionPage featured={featured} query={query} results={results} selectedStories={getSelectedPersonalMagazineStories()} totalCount={allEditions.length} />
  </>;
}
