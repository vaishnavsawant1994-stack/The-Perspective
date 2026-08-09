import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagazineReader } from "@/components/magazine/reader/magazine-reader";
import { MagazineTextReader } from "@/components/magazine/reader/magazine-text-reader";
import { siteConfig } from "@/config/site";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { clampMagazineReaderPage, createMagazineReaderStructuredData, getMagazineReaderBySlug, getReadableMagazineSlugs } from "@/lib/magazine-reader";

type MagazineReaderPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[]; view?: string | string[] }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getReadableMagazineSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: MagazineReaderPageProps): Promise<Metadata> {
  const { slug } = await params;
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
  const reader = getMagazineReaderBySlug(slug);
  if (!reader) notFound();

  const initialPage = clampMagazineReaderPage(query.page, reader.pageCount);
  const viewValue = Array.isArray(query.view) ? query.view[0] : query.view;
  const structuredData = createMagazineReaderStructuredData(reader);

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    {viewValue === "text" ? <MagazineTextReader initialPage={initialPage} reader={reader} /> : <MagazineReader initialPage={initialPage} reader={reader} />}
  </>;
}
