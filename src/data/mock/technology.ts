import type { Article, CategoryLandingContent } from "@/types";
import { articles, getArticleById } from "./articles";
import { getPersonById } from "./people";

const selectArticles = (ids: readonly string[]) =>
  ids.map(getArticleById).filter((article): article is Article => article !== undefined);

const primary = getArticleById("article-ai-infrastructure-race") ??
  articles.find((article) => article.category.slug === "technology");
const daniel = getPersonById("person-daniel-kim");

if (!primary || !daniel) {
  throw new Error("The Technology category requires its infrastructure lead and Daniel Kim profile.");
}

export const technologyPageConfig = {
  slug: "technology",
  label: "Technology",
  title: "Technology",
  description: "Artificial intelligence, infrastructure, startups and the technologies reshaping business and society.",
  supportingLine: "Reporting and analysis on the systems, companies and ideas defining the next era of innovation.",
  subcategories: [
    { label: "All Technology", href: "/technology", active: true },
    { label: "Artificial Intelligence", href: "/technology/ai" },
    { label: "Enterprise", href: "/technology/enterprise" },
    { label: "Infrastructure", href: "/technology/infrastructure" },
    { label: "Cybersecurity", href: "/technology/cybersecurity" },
    { label: "Startups", href: "/technology/startups" },
    { label: "Future Tech", href: "/technology/future" },
  ],
  leadSupportingIds: ["article-enterprise-ai-phase", "article-data-centers-strategic", "article-ai-native"],
  topStoryIds: ["article-ai-infrastructure", "article-enterprise-tech-budgets", "article-cybersecurity-board-priority", "article-computing-investment-cycle"],
  sections: [
    {
      id: "artificial-intelligence",
      title: "Artificial Intelligence",
      description: "Deployment, economics and the organizational systems turning models into useful infrastructure.",
      eyebrow: "Models / Enterprise AI / Automation / Infrastructure",
      href: "/technology/ai",
      actionLabel: "More AI",
      layout: "feature-list",
      featureId: "article-ai-infrastructure",
      supportingIds: ["article-enterprise-ai-phase", "article-internal-ai-platforms", "article-foundation-model-economics", "article-ai-agents-enterprise", "article-ai-data-strategy"],
    },
    {
      id: "enterprise",
      title: "Enterprise",
      description: "How CIOs, platforms and operating teams are rebuilding the digital foundations of modern organizations.",
      eyebrow: "Cloud / Software / Automation",
      href: "/technology/enterprise",
      actionLabel: "More Enterprise",
      layout: "analysis",
      featureId: "article-enterprise-stack-intelligence",
      supportingIds: ["article-cios-cloud-economics", "article-automation-core-operations", "article-enterprise-software-consolidation", "article-technology-spending-board"],
    },
    {
      id: "infrastructure",
      title: "Infrastructure",
      description: "The physical systems, capital and supply chains behind the next generation of computing.",
      href: "/technology/infrastructure",
      actionLabel: "More Infrastructure",
      layout: "feature-list",
      featureId: "article-data-centers-strategic",
      supportingIds: ["article-global-computing-capacity", "article-semiconductors-industrial-strategy", "article-ai-energy-demand", "article-cloud-capital-intensive"],
    },
    {
      id: "cybersecurity",
      title: "Cybersecurity",
      description: "Digital resilience, institutional responsibility and the changing architecture of enterprise risk.",
      href: "/technology/cybersecurity",
      actionLabel: "More Cybersecurity",
      layout: "feature-list",
      featureId: "article-cyber-spending",
      supportingIds: ["article-boards-cyber-risk", "article-identity-security-perimeter", "article-ai-security-equation", "article-critical-infrastructure-threats"],
    },
    {
      id: "founders-startups",
      title: "Founders & Startups",
      description: "The companies and people building the next generation of technology.",
      href: "/technology/startups",
      actionLabel: "More Startups",
      layout: "people",
      featureId: "article-technology-interview-daniel-kim",
      supportingIds: ["article-ai-native", "article-capital-efficient-technology-startups", "article-next-software-giants"],
    },
    {
      id: "future-tech",
      title: "Future Tech",
      description: "Grounded reporting on emerging platforms moving from technical possibility toward practical use.",
      href: "/technology/future",
      actionLabel: "More Future Tech",
      layout: "regional",
      featureId: "article-next-platform",
      supportingIds: ["article-robotics-everyday-operations", "article-spatial-computing-enterprise", "article-advanced-manufacturing-tech", "article-quantum-practical-experiment"],
    },
  ],
  mostReadIds: ["article-ai-infrastructure-race", "article-ai-infrastructure", "article-data-centers-strategic", "article-ai-native", "article-next-platform"],
} as const;

const latest = articles
  .filter((article) => article.category.slug === technologyPageConfig.slug)
  .sort((left, right) => (right.publishedAt ?? "").localeCompare(left.publishedAt ?? ""))
  .slice(0, 8);

export const technologyContent: CategoryLandingContent = {
  slug: technologyPageConfig.slug,
  label: technologyPageConfig.label,
  title: technologyPageConfig.title,
  description: technologyPageConfig.description,
  supportingLine: technologyPageConfig.supportingLine,
  subcategories: technologyPageConfig.subcategories,
  lead: { primary, supporting: selectArticles(technologyPageConfig.leadSupportingIds) },
  topStoriesTitle: "Technology Today",
  topStories: selectArticles(technologyPageConfig.topStoryIds),
  editorialSections: technologyPageConfig.sections.flatMap((section) => {
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
  inDepth: getArticleById("article-infrastructure-ai-economy") ?? primary,
  interview: daniel,
  interviewHref: "/article/technology-interview-daniel-kim",
  mostRead: selectArticles(technologyPageConfig.mostReadIds),
  latest,
  newsletter: {
    eyebrow: "Essential Technology Intelligence",
    title: "The Technology Briefing",
    description: "Artificial intelligence, enterprise technology, infrastructure and the innovations shaping the next decade—curated by The Perspective technology desk.",
  },
  promotion: {
    kind: "premium",
    eyebrow: "The Perspective Premium",
    title: "Technology moves faster than headlines.",
    description: "Get deeper reporting, interviews and analysis on the companies and infrastructure shaping the next era.",
    primaryAction: { label: "Explore Premium", href: "/premium" },
    secondaryAction: { label: "View the Magazine", href: "/magazine" },
  },
};
