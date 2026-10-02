import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagazineReader } from "@/components/magazine/reader/magazine-reader";
import { MagazineReaderRedesign } from "@/components/magazine/reader/magazine-reader-redesign";
import { MagazineTextReader } from "@/components/magazine/reader/magazine-text-reader";
import { PublishedIssueReader, type PublishedIssue } from "@/components/magazine/published/published-issue-reader";
import { getPreviousMagazineIssues } from "@/data/mock/magazines";
import { siteConfig } from "@/config/site";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { clampMagazineReaderPage, createMagazineReaderStructuredData, getMagazineReaderBySlug, getReadableMagazineSlugs } from "@/lib/magazine-reader";
import { readPublic } from "@/modules/r9/commands";

type MagazineReaderPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[]; view?: string | string[] }>;
};

export const dynamicParams = true;

async function publishedIssue(slug: string) {
  try {
    const value = await readPublic("r9_public_issue", slug);
    if (!value || typeof value !== "object" || !("title" in value) || !("articles" in value)) return null;
    return value as PublishedIssue;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return getReadableMagazineSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: MagazineReaderPageProps): Promise<Metadata> {
  const { slug } = await params;
  const published = await publishedIssue(slug);
  if (published) {
    const path = `/magazine/read/${published.slug}`;
    const description = published.cover.dek || published.theme;
    return {
      title: { absolute: `${published.title} | The Perspective Magazine` },
      description,
      alternates: { canonical: path },
      openGraph: { title: published.title, description, type: "article" as const, url: path, siteName: siteConfig.name },
      twitter: { card: "summary_large_image" as const, title: published.title, description },
    };
  }
  const reader = getMagazineReaderBySlug(slug);
  if (!reader) notFound();
  const path = `/magazine/read/${reader.issue.slug}`;
  const issueDate = formatMagazineIssueDate(reader.issue.publicationDate);
  const title = `${reader.issue.title} — ${issueDate} | The Perspective Magazine`;
  const description = `Read the ${issueDate} digital edition of The Perspective, featuring ${reader.issue.title} and stories on leadership, business, technology and ideas.`;
  const images = reader.issue.coverImage ? [{ url: reader.issue.coverImage.src, width: reader.issue.coverImage.width, height: reader.issue.coverImage.height, alt: reader.issue.coverImage.alt }] : undefined;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { title, description, type: "article", url: path, siteName: siteConfig.name, publishedTime: reader.issue.publicationDate, images },
    twitter: { card: "summary_large_image", title, description, images: reader.issue.coverImage ? [reader.issue.coverImage.src] : undefined },
  };
}

export default async function MagazineReaderPage({ params, searchParams }: MagazineReaderPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const published = await publishedIssue(slug);
  if (published) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: published.title,
      description: published.cover.dek || published.theme,
      mainEntityOfPage: `/magazine/read/${published.slug}`,
    };
    return <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
      <PublishedIssueReader issue={published} />
    </>;
  }
  const reader = getMagazineReaderBySlug(slug);
  if (!reader) notFound();

  const initialPage = clampMagazineReaderPage(query.page, reader.pageCount);
  const viewValue = Array.isArray(query.view) ? query.view[0] : query.view;
  const structuredData = createMagazineReaderStructuredData(reader);

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    {viewValue === "text" ? <MagazineTextReader initialPage={initialPage} reader={reader} /> : <>
      <MagazineReaderRedesign initialPage={initialPage} previousIssues={getPreviousMagazineIssues(6)} reader={reader} />
      <MagazineReader initialPage={initialPage} reader={reader} />
    </>}
  </>;
}
