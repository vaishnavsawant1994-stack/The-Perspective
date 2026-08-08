import type { CategoryLandingContent } from "@/types";
import { MagazineSpotlight } from "@/components/home/magazine-spotlight";
import { PersonalMagazineSection } from "@/components/home/personal-magazine-section";
import { PageContainer } from "@/components/layout/page-container";
import { PersonFeature } from "@/components/person/person-feature";
import { CategoryEditorialSection } from "./category-editorial-section";
import { CategoryInDepth } from "./category-in-depth";
import { CategoryLatest } from "./category-latest";
import { CategoryLead } from "./category-lead";
import { CategoryNewsletter } from "./category-newsletter";
import { CategoryPageHeader } from "./category-page-header";
import { CategoryPeopleFeature } from "./category-people-feature";
import { CategoryRankedStories } from "./category-ranked-stories";
import { CategoryStoryGrid } from "./category-story-grid";
import { CategorySubnav } from "./category-subnav";

export function CategoryLandingPage({ content }: { content:CategoryLandingContent }) {
  return <>
    <CategoryPageHeader description={content.description} label={content.label} supportingLine={content.supportingLine} title={content.title} />
    <CategorySubnav items={content.subcategories} label={content.label} />
    <PageContainer className="section-space" width="standard"><CategoryLead primary={content.lead.primary} supporting={content.lead.supporting} /></PageContainer>
    <div className="bg-surface"><PageContainer className="section-space" width="standard"><CategoryStoryGrid articles={content.topStories} title={content.topStoriesTitle} /></PageContainer></div>
    {content.peopleFeature && <PageContainer className="section-space" width="standard"><CategoryPeopleFeature content={content.peopleFeature} /></PageContainer>}
    {content.editorialSections.map((section, index) => <div className={index % 2 === 1 ? "bg-surface-subtle" : undefined} key={section.id}><PageContainer className="section-space" width="standard"><CategoryEditorialSection section={section} /></PageContainer></div>)}
    <PageContainer className="section-space" width="wide"><CategoryInDepth article={content.inDepth} label={content.label} /></PageContainer>
    <div className="bg-accent-strong"><PageContainer className="section-space-lg" width="standard"><section aria-label={`The ${content.label} Interview`}><PersonFeature dark href={content.interviewHref} label={`The ${content.label} Interview`} person={content.interview} /></section></PageContainer></div>
    <PageContainer className="section-space" width="standard"><CategoryRankedStories articles={content.mostRead} label={content.label} /></PageContainer>
    <div className="bg-surface"><PageContainer className="section-space" width="standard"><CategoryLatest articles={content.latest} label={content.label} /></PageContainer></div>
    {content.promotion.kind === "magazine" ? <MagazineSpotlight issue={content.promotion.issue} /> : <PersonalMagazineSection people={content.promotion.people} />}
    <PageContainer className="section-space" width="standard"><CategoryNewsletter {...content.newsletter} /></PageContainer>
  </>;
}
