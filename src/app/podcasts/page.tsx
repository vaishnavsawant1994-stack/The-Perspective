import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PodcastsPage } from "@/components/podcast/podcasts-page";
import { siteConfig } from "@/config/site";
import { getHomepageRedesignContent } from "@/lib/homepage-redesign";

const title = "Podcasts | The Perspective";
const description = "Listen to The Perspective Podcasts: in-depth conversations with founders, leaders, investors and innovators shaping what comes next.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/podcasts" },
  openGraph: { title, description, type: "website", url: "/podcasts", siteName: siteConfig.name, images: [{ url: "/images/podcasts/naveen-malhotra-hero-final.png", width: 1122, height: 1402, alt: "The Perspective Podcasts" }] },
  twitter: { card: "summary_large_image", title, description, images: ["/images/podcasts/naveen-malhotra-hero-final.png"] },
};

export default function PodcastsRoute() {
  const content = getHomepageRedesignContent();
  if (!content) notFound();
  return <PodcastsPage content={content} />;
}
