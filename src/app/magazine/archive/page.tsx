import type { Metadata } from "next";
import { MagazineArchivePage } from "@/components/magazine/archive/magazine-archive-page";
import { MagazineArchiveRedesign } from "@/components/magazine/archive/magazine-archive-redesign";
import { PublishedEditionBand } from "@/components/magazine/published/published-projection";
import { siteConfig } from "@/config/site";
import { getLatestMagazineIssue } from "@/data/mock/magazines";
import { filterMagazineIssues, getFeaturedArchiveIssue, getMagazineArchiveCounts, getMagazineArchiveThemes, getMagazineArchiveYears, getMagazineIssues, getPremiumMagazineIssues, getReaderAvailableIssues, parseMagazineArchiveFilter, parseMagazineArchiveQuery, parseMagazineArchiveYear, resolveMagazineArchiveIssues, validateMagazineArchiveData } from "@/lib/magazine-archive";
import { createMagazineArchiveStructuredData } from "@/lib/magazine-structured-data";
import { publishedCatalogue } from "@/modules/r9/projection";
import { readSearchParameter } from "@/lib/search-query";

type MagazineArchivePageProps = {
  searchParams: Promise<{
    q?: string | string[];
    year?: string | string[];
    type?: string | string[];
    sort?: string | string[];
  }>;
};

const description = "Browse past issues of The Perspective Magazine, including leadership, business, technology, Premium editions and digital issues.";

export async function generateMetadata({ searchParams }: MagazineArchivePageProps): Promise<Metadata> {
  const parameters = await searchParams;
  const hasArchiveState = Boolean(readSearchParameter(parameters.q).trim() || readSearchParameter(parameters.year).trim() || readSearchParameter(parameters.type).trim() || readSearchParameter(parameters.sort).trim());
  return {
    title: { absolute: "Magazine Archive | The Perspective" },
    description,
    alternates: { canonical: "/magazine/archive" },
    robots: { index: !hasArchiveState, follow: true },
    openGraph: { title: "Magazine Archive | The Perspective", description, type: "website", url: "/magazine/archive", siteName: siteConfig.name, images: [{ url: "/images/articles/global-growth.png", width: 1536, height: 1024, alt: "The Perspective Magazine Archive" }] },
    twitter: { card: "summary_large_image", title: "Magazine Archive | The Perspective", description, images: ["/images/articles/global-growth.png"] },
  };
}

export const dynamic = "force-dynamic";

export default async function MagazineArchiveRoute({ searchParams }: MagazineArchivePageProps) {
  const parameters = await searchParams;
  const state = {
    query: parseMagazineArchiveQuery(parameters.q),
    year: parseMagazineArchiveYear(parameters.year),
    type: parseMagazineArchiveFilter(parameters.type),
  } as const;
  const sort = readSearchParameter(parameters.sort) === "oldest" ? "oldest" : "latest";
  const issues = getMagazineIssues();
  const validationErrors = validateMagazineArchiveData();
  if (validationErrors.length > 0) throw new Error(`Invalid Magazine Archive data:\n${validationErrors.join("\n")}`);

  const latestIssue = getLatestMagazineIssue();
  if (!latestIssue) throw new Error("Magazine Archive requires a latest published issue.");
  const filteredIssues = [...filterMagazineIssues({ issues, ...state })];
  if (sort === "oldest") filteredIssues.reverse();
  const featuredIssue = getFeaturedArchiveIssue(issues);
  const resolvedIssues = resolveMagazineArchiveIssues(filteredIssues);
  const resolvedFeatured = resolveMagazineArchiveIssues([issues[0]])[0];
  if (!resolvedFeatured) throw new Error("Magazine Archive requires a featured issue.");
  const published = await publishedCatalogue();
  const structuredData = createMagazineArchiveStructuredData(issues);

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <PublishedEditionBand heading="Published and archived editions" issues={published} />
    <MagazineArchiveRedesign counts={getMagazineArchiveCounts(issues)} displayedIssues={resolvedIssues} featuredIssue={resolvedFeatured} sort={sort} state={state} years={getMagazineArchiveYears(issues)} />
    <MagazineArchivePage
      counts={getMagazineArchiveCounts(issues)}
      featuredIssue={featuredIssue ? resolveMagazineArchiveIssues([featuredIssue])[0] : undefined}
      filteredIssues={resolvedIssues}
      latestIssueId={latestIssue.id}
      premiumIssues={resolveMagazineArchiveIssues(getPremiumMagazineIssues(issues))}
      readerIssues={resolveMagazineArchiveIssues(getReaderAvailableIssues(issues))}
      state={state}
      themes={getMagazineArchiveThemes(issues)}
      years={getMagazineArchiveYears(issues)}
    />
  </>;
}
