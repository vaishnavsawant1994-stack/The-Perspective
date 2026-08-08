import type { Article, CategoryLandingContent } from "@/types";
import { articles, getArticleById } from "./articles";
import { magazineIssues } from "./magazines";
import { getPersonById } from "./people";

const selectArticles = (ids: readonly string[]) =>
  ids.map(getArticleById).filter((article): article is Article => article !== undefined);

const primary = getArticleById("article-companies-growth-cycle") ??
  articles.find((article) => article.category.slug === "business");
const interview = getPersonById("person-arjun-mehta");
const magazineIssue = magazineIssues[0];

if (!primary || !interview || !magazineIssue) {
  throw new Error("The Business category requires a lead story, interview, and magazine issue.");
}

export const businessPageConfig = {
  slug: "business",
  label: "Business",
  title: "Business",
  description: "Companies, markets, entrepreneurship and the forces reshaping how the world does business.",
  supportingLine: "Reporting and analysis from The Perspective business desk.",
  subcategories: [
    { label: "All Business", href: "/business", active: true },
    { label: "Companies", href: "/business/companies" },
    { label: "Economy", href: "/business/economy" },
    { label: "Entrepreneurship", href: "/business/entrepreneurship" },
    { label: "Startups", href: "/business/startups" },
    { label: "Global Business", href: "/business/global" },
  ],
  lead: {
    primaryId: "article-companies-growth-cycle",
    supportingIds: [
      "article-industrial-investment-strategy",
      "article-private-companies-scale",
      "article-corporate-expansion-geography",
    ],
  },
  topStoryIds: [
    "article-family-businesses",
    "article-manufacturers-invest",
    "article-private-markets-financing",
    "article-supply-chain-strategies",
  ],
  sections: [
    {
      id: "companies",
      title: "Companies",
      description: "Strategy, transformation and the institutions building durable advantage.",
      href: "/business/companies",
      actionLabel: "More Companies",
      links: ["Corporate Strategy", "Industries", "Earnings", "Transformation"],
      layout: "feature-list",
      featureId: "article-companies-rewriting-global-growth",
      supportingIds: [
        "article-boards-long-term-investment",
        "article-vertical-integration",
        "article-corporate-restructuring",
        "article-brands-localization",
      ],
    },
    {
      id: "economy",
      title: "Economy",
      description: "The productive forces shaping investment, employment and long-term growth.",
      eyebrow: "Growth / Investment / Productivity",
      href: "/business/economy",
      actionLabel: "More Economy",
      layout: "analysis",
      featureId: "article-industrial-strategy",
      supportingIds: [
        "article-productivity-expectations",
        "article-capital-spending-cycle",
        "article-markets-investors-watching",
      ],
    },
    {
      id: "entrepreneurship",
      title: "Entrepreneurship",
      description: "Founders, startups and the operating ideas changing how companies are built.",
      eyebrow: "Startups / Founders / Growth",
      href: "/business/entrepreneurship",
      actionLabel: "More Entrepreneurship",
      layout: "people",
      featureId: "article-professional-founder-archetype",
      supportingIds: [
        "article-capital-efficient-startups",
        "article-geography-entrepreneurship",
        "article-global-tech-founders",
      ],
    },
    {
      id: "global-business",
      title: "Global Business",
      description: "Companies and capital moving across a more multipolar commercial landscape.",
      href: "/business/global",
      actionLabel: "More Global Business",
      layout: "regional",
      featureId: "article-indian-companies-global",
      supportingIds: [
        "article-middle-eastern-capital",
        "article-europe-industrial-champions",
        "article-southeast-asia-corridor",
      ],
    },
  ],
  inDepthId: "article-forces-global-economy",
  mostReadIds: [
    "article-companies-growth-cycle",
    "article-family-businesses",
    "article-industrial-strategy",
    "article-private-companies-scale",
    "article-geography-entrepreneurship",
  ],
} as const;

const latest = articles
  .filter((article) => article.category.slug === businessPageConfig.slug)
  .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""))
  .slice(0, 8);

export const businessContent: CategoryLandingContent = {
  slug: businessPageConfig.slug,
  label: businessPageConfig.label,
  title: businessPageConfig.title,
  description: businessPageConfig.description,
  supportingLine: businessPageConfig.supportingLine,
  subcategories: businessPageConfig.subcategories,
  lead: {
    primary,
    supporting: selectArticles(businessPageConfig.lead.supportingIds),
  },
  topStories: selectArticles(businessPageConfig.topStoryIds),
  editorialSections: businessPageConfig.sections.flatMap((section) => {
    const feature = getArticleById(section.featureId);
    if (!feature) return [];
    return [{
      id: section.id,
      title: section.title,
      description: section.description,
      eyebrow: "eyebrow" in section ? section.eyebrow : undefined,
      href: section.href,
      actionLabel: section.actionLabel,
      links: "links" in section
        ? section.links.map((label) => ({ label, href: `${section.href}#${label.toLowerCase().replaceAll(" ", "-")}` }))
        : undefined,
      layout: section.layout,
      feature,
      supporting: selectArticles(section.supportingIds),
    }];
  }),
  inDepth: getArticleById(businessPageConfig.inDepthId) ?? primary,
  interview,
  interviewHref: "/article/business-interview-arjun-mehta",
  mostRead: selectArticles(businessPageConfig.mostReadIds),
  latest,
  newsletter: {
    eyebrow: "Essential Business Intelligence",
    title: "The Business Briefing",
    description: "The most important developments in companies, markets, entrepreneurship and the global economy, selected by The Perspective business desk.",
  },
  magazineIssue,
};
