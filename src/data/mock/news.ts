import type { NewsDeskSection, NewsLandingContent, NewsTopicCluster } from "@/types";
import { buildSearchUrl } from "@/lib/search";
import { articles, getArticleById } from "./articles";

function requireArticle(id: string) {
  const article = getArticleById(id);
  if (!article) throw new Error(`News article not found: ${id}`);
  return article;
}

const selectArticles = (ids: readonly string[]) => ids.map(requireArticle);
const articleSearch = (query: string) => buildSearchUrl({ query, type: "articles" });

function topic(label: string, description: string, href: string, articleIds: readonly string[]): NewsTopicCluster {
  return { label, description, href, articles: selectArticles(articleIds) };
}

function desk(label: string, description: string, href: string, actionLabel: string, featureId: string, supportingIds: readonly string[]): NewsDeskSection {
  return { label, description, href, actionLabel, feature: requireArticle(featureId), supporting: selectArticles(supportingIds) };
}

export const newsContent: NewsLandingContent = {
  developing: selectArticles([
    "article-global-companies-reassess",
    "article-asian-markets-advance",
    "article-enterprise-ai-phase",
    "article-corporate-expansion-geography",
  ]),
  topStories: {
    lead: requireArticle("article-markets-optimism"),
    supporting: selectArticles(["article-ai-infrastructure-race", "article-companies-growth-cycle"]),
    headlines: selectArticles([
      "article-leaders-certainty-disappears",
      "article-opinion-globalization-regional",
      "article-middle-eastern-capital",
      "article-cybersecurity-board-priority",
    ]),
  },
  topics: [
    topic("Artificial Intelligence", "The infrastructure, economics and operating systems moving AI into production.", "/topic/artificial-intelligence", ["article-ai-infrastructure-race", "article-ai-infrastructure", "article-ai-agents-enterprise"]),
    topic("Global Economy", "Capital, industrial policy and the regional forces reorganizing global growth.", articleSearch("global economy"), ["article-forces-global-economy", "article-industrial-investment-strategy", "article-capital-spending-cycle"]),
    topic("Leadership", "How executives, boards and institutions are adapting authority to uncertainty.", "/leadership", ["article-new-architecture-global-leadership", "article-leaders-certainty-disappears", "article-boards-succession"]),
    topic("Markets", "Investment, capital movement and the expectations shaping the next cycle.", "/topic/global-markets", ["article-markets-optimism", "article-asian-markets-advance", "article-emerging-markets"]),
    topic("Startups", "The founders, capital disciplines and new company models worth following.", "/topic/startups", ["article-capital-efficient-startups", "article-ai-native", "article-global-tech-founders"]),
    topic("Future of Work", "Management, automation and the changing design of organizations and careers.", "/topic/future-of-work", ["article-multigenerational-workforce", "article-ai-augmented-decisions", "article-opinion-automation-organizations"]),
    topic("Cybersecurity", "Digital resilience is becoming a question of continuity, trust and governance.", "/topic/cybersecurity", ["article-cybersecurity-board-priority", "article-cyber-spending", "article-boards-cyber-risk"]),
    topic("Global Business", "Companies are building regional depth across a more multipolar commercial map.", articleSearch("global business"), ["article-companies-rewriting-global-growth", "article-indian-companies-global", "article-southeast-asia-corridor"]),
  ],
  coverage: [
    { label: "Business", description: "Companies, economy, entrepreneurship and global enterprise.", href: "/business" },
    { label: "Leadership", description: "CEOs, founders, management and governance.", href: "/leadership" },
    { label: "Technology", description: "AI, enterprise systems, infrastructure and emerging innovation.", href: "/technology" },
    { label: "The Perspective", description: "Opinion, essays and analysis from distinctive contributors.", href: "/perspective" },
  ],
  business: desk("Business", "Companies, capital and the productive economy.", "/business", "More Business", "article-global-companies-reassess", ["article-industrial-investment-strategy", "article-private-markets-financing", "article-supply-chain-strategies", "article-manufacturers-invest"]),
  leadership: desk("Leadership", "The people, decisions and institutions shaping modern authority.", "/leadership", "More Leadership", "article-interview-elena-rossi", ["article-boards-succession", "article-leaders-certainty-disappears", "article-organizational-trust", "article-executive-communication-discipline"]),
  technology: desk("Technology", "The systems, companies and infrastructure defining the next era.", "/technology", "More Technology", "article-ai-infrastructure-race", ["article-enterprise-ai-phase", "article-data-centers-strategic", "article-cybersecurity-board-priority", "article-enterprise-tech-budgets"]),
  markets: desk("Markets & Finance", "Capital allocation, investment cycles and the forces moving global markets.", "/topic/global-markets", "Explore Markets & Finance", "article-markets-optimism", ["article-asian-markets-advance", "article-private-markets-record", "article-private-credit", "article-emerging-markets"]),
  globalAffairs: desk("Global Affairs", "Trade, regional growth and the changing geography of international capital.", "/topic/global-affairs", "Explore Global Affairs", "article-opinion-globalization-regional", ["article-middle-eastern-capital", "article-southeast-asia-corridor", "article-indian-companies-global", "article-opinion-globalization-changing"]),
  trendingTopics: [
    { label: "Artificial Intelligence", href: "/topic/artificial-intelligence" },
    { label: "Productivity", href: "/topic/productivity" },
    { label: "Global Markets", href: "/topic/global-markets" },
    { label: "Leadership", href: "/leadership" },
    { label: "Data Centers", href: "/topic/data-centers" },
    { label: "Founders", href: "/topic/founders" },
    { label: "Industrial Strategy", href: "/topic/industrial-strategy" },
    { label: "Cybersecurity", href: "/topic/cybersecurity" },
  ],
  analysis: selectArticles(["article-forces-global-economy", "article-infrastructure-ai-economy", "article-new-executive-mandate", "article-opinion-productivity"]),
  mostRead: selectArticles(["article-50-leaders", "article-ai-infrastructure-race", "article-investor-networks", "article-family-businesses", "article-cities-executives"]),
  latestUpdates: articles
    .filter((article) => article.category.slug !== "opinion")
    .sort((left, right) => (right.publishedAt ?? right.updatedAt).localeCompare(left.publishedAt ?? left.updatedAt))
    .slice(0, 10),
  promotion: {
    kind: "premium",
    eyebrow: "The Perspective Premium",
    title: "Go beyond the daily headlines.",
    description: "Deeper reporting, interviews, magazine editions and analysis for readers who want more context.",
    primaryAction: { label: "Explore Premium", href: "/premium" },
    secondaryAction: { label: "View the Magazine", href: "/magazine" },
  },
};

export const newsStructuredArticles = [newsContent.topStories.lead, ...newsContent.topStories.supporting, ...newsContent.topStories.headlines];
