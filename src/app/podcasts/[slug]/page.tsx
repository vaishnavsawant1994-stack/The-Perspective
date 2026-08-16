import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PodcastShowDetail } from "@/components/podcast/podcast-show-detail";
import { PodcastsPage } from "@/components/podcast/podcasts-page";
import { siteConfig } from "@/config/site";
import { podcastShows } from "@/data/mock/podcast-shows";
import { getPodcastShowContent } from "@/lib/podcast-shows";

type PodcastShowRouteProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return podcastShows.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PodcastShowRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const content = getPodcastShowContent(slug);
  if (!content) return {};
  const title = `${content.show.title} Podcast | The Perspective`;
  const description = content.show.description;
  const url = `/podcasts/${content.show.slug}`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, type: "website", url, siteName: siteConfig.name, images: [{ url: content.show.heroImage, alt: content.show.title }] },
    twitter: { card: "summary_large_image", title, description, images: [content.show.heroImage] },
  };
}

export default async function PodcastShowRoute({ params }: PodcastShowRouteProps) {
  const { slug } = await params;
  const content = getPodcastShowContent(slug);
  if (!content) notFound();
  return <>
    <PodcastShowDetail content={content} />
    <section aria-labelledby="existing-podcast-content" style={{ borderTop: "1px solid #e8e2d9", marginTop: "48px", paddingTop: "42px" }}>
      <div style={{ margin: "0 auto 28px", maxWidth: "1440px", padding: "0 clamp(20px, 4vw, 64px)" }}>
        <p style={{ color: "#a75c13", fontSize: "12px", fontWeight: 800, letterSpacing: ".1em", margin: "0 0 8px", textTransform: "uppercase" }}>Continue exploring</p>
        <h2 id="existing-podcast-content" style={{ fontFamily: "var(--font-editorial), Georgia, serif", fontSize: "clamp(30px, 4vw, 52px)", margin: 0 }}>The complete Perspective podcast collection</h2>
      </div>
      <PodcastsPage content={content.homepage} includeBreaking={false} />
    </section>
  </>;
}
