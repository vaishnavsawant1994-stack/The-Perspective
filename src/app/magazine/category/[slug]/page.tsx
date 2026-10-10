import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MagazineCategoryPage } from "@/components/magazine/category/magazine-category-page";
import { MagazineCategoryRedesign } from "@/components/magazine/category/magazine-category-redesign";
import { PublishedEditionBand } from "@/components/magazine/published/published-projection";
import { siteConfig } from "@/config/site";
import { createMagazineCategoryStructuredData } from "@/lib/magazine-structured-data";
import { getMagazineCategories, getMagazineCategoryBySlug, getMagazineCategoryContent, validateMagazineCategoryData } from "@/lib/magazine-categories";
import { publicSlug, publishedCatalogue } from "@/modules/r9/projection";

type MagazineCategoryRouteProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getMagazineCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: MagazineCategoryRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getMagazineCategoryBySlug(slug);
  if (!category) notFound();
  const content = getMagazineCategoryContent(category);
  const path = `/magazine/category/${category.slug}`;
  const title = category.slug === "special-editions" ? "Special Editions | The Perspective Magazine" : `${category.name} Magazine | The Perspective`;
  const cover = content.featuredIssue.coverImage;
  const images = cover ? [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] : undefined;

  return {
    title: { absolute: title },
    description: category.metadataDescription,
    alternates: { canonical: path },
    openGraph: { title, description: category.metadataDescription, type: "website", url: path, siteName: siteConfig.name, images },
    twitter: { card: "summary_large_image", title, description: category.metadataDescription, images: cover ? [cover.src] : undefined },
  };
}

export const dynamic = "force-dynamic";

export default async function MagazineCategoryRoute({ params }: MagazineCategoryRouteProps) {
  const { slug } = await params;
  const category = getMagazineCategoryBySlug(slug);
  if (!category) notFound();

  const validationErrors = validateMagazineCategoryData();
  if (validationErrors.length > 0) throw new Error(`Invalid Magazine Category data:\n${validationErrors.join("\n")}`);
  const content = getMagazineCategoryContent(category);
  const structuredData = createMagazineCategoryStructuredData(category, content.matchingIssues);
  const published = (await publishedCatalogue()).filter((issue) => publicSlug(issue.theme) === slug || publicSlug(issue.season) === slug);

  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
    <PublishedEditionBand heading="Published editions in this section" issues={published} />
    <MagazineCategoryRedesign content={content} />
    <MagazineCategoryPage content={content} />
  </>;
}
