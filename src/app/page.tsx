import type { Metadata } from "next";
import { BreakingStrip } from "@/components/home/breaking-strip";
import { BriefingSection } from "@/components/home/briefing-section";
import { CategoryFeatureSection } from "@/components/home/category-feature-section";
import { CultureSection } from "@/components/home/culture-section";
import { EditorsPicks } from "@/components/home/editors-picks";
import { HomepageHero } from "@/components/home/homepage-hero";
import { InterviewFeature } from "@/components/home/interview-feature";
import { LatestSection } from "@/components/home/latest-section";
import { LeadershipSection } from "@/components/home/leadership-section";
import { MagazineSpotlight } from "@/components/home/magazine-spotlight";
import { MarketSection } from "@/components/home/market-section";
import { MostRead } from "@/components/home/most-read";
import { OpinionSection } from "@/components/home/opinion-section";
import { PersonalMagazineSection } from "@/components/home/personal-magazine-section";
import { PremiumSection } from "@/components/home/premium-section";
import { homeContent } from "@/data/mock/homepage";
import { magazineIssues } from "@/data/mock/magazines";
import { people } from "@/data/mock/people";
import { siteConfig } from "@/config/site";

const description = "The Perspective delivers premium journalism, executive interviews, global business insight, technology analysis and distinctive magazine storytelling.";
export const metadata: Metadata = {
  title: { absolute: "The Perspective | Business, Leadership, Technology & Global Ideas" },
  description,
  alternates: { canonical: "/" },
  openGraph: { title: "The Perspective | Business, Leadership, Technology & Global Ideas", description, type: "website", url: "/", siteName: siteConfig.name, images: [{ url: "/images/articles/global-leadership.png", width: 1536, height: 1024, alt: "The Perspective" }] },
  twitter: { card: "summary_large_image", title: "The Perspective | Business, Leadership, Technology & Global Ideas", description, images: ["/images/articles/global-leadership.png"] },
};

const businessLinks = [{label:"Companies",href:"/business/companies"},{label:"Economy",href:"/business/economy"},{label:"Entrepreneurship",href:"/business/entrepreneurship"},{label:"Startups",href:"/business/startups"},{label:"Global Business",href:"/business/global"}] as const;
const technologyLinks = [{label:"Artificial Intelligence",href:"/technology/ai"},{label:"Enterprise",href:"/technology/enterprise"},{label:"Startups",href:"/technology/startups"},{label:"Cybersecurity",href:"/technology/cybersecurity"},{label:"Future",href:"/technology/future"}] as const;

export default function Home() {
  const structuredData = { "@context":"https://schema.org", "@type":"WebSite", name:siteConfig.name, url:siteConfig.url, description, publisher:{ "@type":"Organization", name:siteConfig.name, url:siteConfig.url } };
  return <>
    <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
    <BreakingStrip articles={homeContent.breaking} />
    <HomepageHero main={homeContent.hero.main} secondary={homeContent.hero.secondary} />
    <LatestSection feature={homeContent.latest.feature} rows={homeContent.latest.rows} />
    <EditorsPicks articles={homeContent.editorsPicks} />
    <CategoryFeatureSection feature={homeContent.business.feature} href="/business" links={businessLinks} supporting={homeContent.business.supporting} title="Business" />
    <LeadershipSection person={homeContent.leadership.person} supporting={homeContent.leadership.supporting} />
    <CategoryFeatureSection feature={homeContent.technology.feature} href="/technology" links={technologyLinks} supporting={homeContent.technology.supporting} title="Technology" tone="muted" />
    <MarketSection articles={homeContent.finance} />
    <InterviewFeature person={homeContent.interview} />
    <MagazineSpotlight issue={magazineIssues[0]} />
    <OpinionSection />
    <CultureSection articles={homeContent.culture} />
    <MostRead articles={homeContent.mostRead} />
    <PersonalMagazineSection people={people.slice(2,5)} />
    <PremiumSection />
    <BriefingSection />
  </>;
}
