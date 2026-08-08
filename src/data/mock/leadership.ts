import type { Article, CategoryLandingContent, PersonProfile } from "@/types";
import { articles, getArticleById } from "./articles";
import { getPersonById } from "./people";

const selectArticles = (ids: readonly string[]) =>
  ids.map(getArticleById).filter((article): article is Article => article !== undefined);

const selectPeople = (ids: readonly string[]) =>
  ids.map(getPersonById).filter((person): person is PersonProfile => person !== undefined);

const primary = getArticleById("article-new-architecture-global-leadership") ??
  articles.find((article) => article.category.slug === "leadership");
const elena = getPersonById("person-elena-rossi");
const marcus = getPersonById("person-marcus-chen");
const arjun = getPersonById("person-arjun-mehta");

if (!primary || !elena || !marcus || !arjun) {
  throw new Error("The Leadership category requires a lead story and its three interview profiles.");
}

export const leadershipPageConfig = {
  slug: "leadership",
  label: "Leadership",
  title: "Leadership",
  description: "Ideas, decisions and people shaping how organizations are built, led and transformed.",
  supportingLine: "Executive interviews, governance, management strategy and the changing nature of influence.",
  subcategories: [
    { label: "All Leadership", href: "/leadership", active: true },
    { label: "CEOs", href: "/leadership/ceos" },
    { label: "Founders", href: "/leadership/founders" },
    { label: "Management", href: "/leadership/management" },
    { label: "Boards & Governance", href: "/leadership/boards-governance" },
    { label: "Strategy", href: "/leadership/strategy" },
    { label: "Future Leaders", href: "/leadership/future-leaders" },
  ],
  lead: {
    supportingIds: [
      "article-boards-succession",
      "article-decisions-pressure",
      "article-professional-founder-archetype",
    ],
  },
  topStoryIds: [
    "article-leaders-certainty-disappears",
    "article-executive-communication-discipline",
    "article-organizational-trust",
    "article-multigenerational-workforce",
  ],
  sections: [
    {
      id: "management",
      title: "Management",
      description: "The operating disciplines behind clear decisions, resilient teams and useful authority.",
      href: "/leadership/management",
      actionLabel: "More Management",
      layout: "feature-list",
      featureId: "article-decisions-pressure",
      supportingIds: ["article-high-performing-teams", "article-fewer-priorities", "article-ai-augmented-decisions", "article-organizational-ambiguity"],
    },
    {
      id: "boards-governance",
      title: "Boards & Governance",
      description: "Oversight, succession and the responsibilities that shape enduring institutions.",
      href: "/leadership/boards-governance",
      actionLabel: "More Governance",
      layout: "regional",
      featureId: "article-boards-accountability",
      supportingIds: ["article-succession-agenda", "article-directors-ai-questions", "article-boards-founders", "article-governance-beyond-compliance"],
    },
    {
      id: "leadership-strategy",
      title: "Leadership Strategy",
      description: "How leaders allocate attention, build capability and turn a long view into present action.",
      eyebrow: "Attention / Capability / Timing",
      href: "/leadership/strategy",
      actionLabel: "More Strategy",
      layout: "analysis",
      featureId: "article-long-term-boardroom",
      supportingIds: ["article-allocating-attention", "article-strategy-organizational-capability", "article-executive-timing", "article-institutions-not-personal-brands"],
    },
    {
      id: "future-leaders",
      title: "Future Leaders",
      description: "The rising builders and operators changing what ambition, influence and stewardship mean.",
      href: "/leadership/future-leaders",
      actionLabel: "More Future Leaders",
      layout: "feature-list",
      featureId: "article-50-leaders",
      supportingIds: ["article-younger-executives-ambition", "article-operator-investors", "article-leadership-pipelines", "article-mission-driven-founders"],
    },
  ],
  mostReadIds: [
    "article-new-architecture-global-leadership",
    "article-boards-succession",
    "article-decisions-pressure",
    "article-professional-founder-archetype",
    "article-50-leaders",
  ],
} as const;

const latest = articles
  .filter((article) => article.category.slug === leadershipPageConfig.slug)
  .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""))
  .slice(0, 8);

export const leadershipContent: CategoryLandingContent = {
  slug: leadershipPageConfig.slug,
  label: leadershipPageConfig.label,
  title: leadershipPageConfig.title,
  description: leadershipPageConfig.description,
  supportingLine: leadershipPageConfig.supportingLine,
  subcategories: leadershipPageConfig.subcategories,
  lead: {
    primary,
    supporting: selectArticles(leadershipPageConfig.lead.supportingIds),
  },
  topStoriesTitle: "Leadership Today",
  topStories: selectArticles(leadershipPageConfig.topStoryIds),
  peopleFeature: {
    id: "ceos-founders",
    title: "CEOs & Founders",
    description: "Conversations with the people making consequential choices at the edge of change.",
    featured: { person: elena, href: "/article/interview-elena-rossi", label: "The CEO Interview" },
    supporting: [
      { person: marcus, href: "/article/interview-marcus-chen", label: "Founder Interview" },
      { person: arjun, href: "/article/business-interview-arjun-mehta", label: "Founder Interview" },
    ],
  },
  editorialSections: leadershipPageConfig.sections.flatMap((section) => {
    const feature = getArticleById(section.featureId);
    if (!feature) return [];
    return [{
      id: section.id,
      title: section.title,
      description: section.description,
      eyebrow: "eyebrow" in section ? section.eyebrow : undefined,
      href: section.href,
      actionLabel: section.actionLabel,
      layout: section.layout,
      feature,
      supporting: selectArticles(section.supportingIds),
    }];
  }),
  inDepth: getArticleById("article-new-executive-mandate") ?? primary,
  interview: marcus,
  interviewHref: "/article/interview-marcus-chen",
  mostRead: selectArticles(leadershipPageConfig.mostReadIds),
  latest,
  newsletter: {
    eyebrow: "Essential Leadership Intelligence",
    title: "The Leadership Briefing",
    description: "The most important ideas in executive leadership, management, governance and strategy, selected by The Perspective editors.",
  },
  promotion: { kind: "personal-magazines", people: selectPeople(["person-elena-rossi", "person-marcus-chen", "person-arjun-mehta"]) },
};
