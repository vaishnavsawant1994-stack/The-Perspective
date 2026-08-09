import type { Article, AuthorProfileConfig, AuthorProfileData, AuthorTopic } from "@/types";
import { getArticleById, getArticlesByAuthor } from "./articles";
import { authors, getAuthorBySlug } from "./authors";

const topic = (name: string, slug: string, description: string): AuthorTopic => ({ name, slug, description });

const curatedProfiles: readonly AuthorProfileConfig[] = [
  {
    authorId: "author-maya-patel",
    featuredArticleId: "article-opinion-productivity",
    essentialArticleIds: ["article-opinion-ai-economic-realism", "article-opinion-productivity-organizational-design", "article-opinion-ai-adoption-patience"],
    mostReadArticleIds: ["article-opinion-productivity", "article-opinion-growth-without-productivity", "article-opinion-automation-organizations"],
    topics: [
      topic("Economics", "economics", "How technology, capital and institutions shape economic outcomes."),
      topic("Productivity", "productivity", "The organizational choices that turn investment into durable progress."),
      topic("Global policy", "global-policy", "Policy decisions viewed through incentives, capacity and long-term growth."),
    ],
  },
  {
    authorId: "author-daniel-brooks",
    featuredArticleId: "article-opinion-private-markets",
    essentialArticleIds: ["article-opinion-long-term-corporate-thinking", "article-opinion-family-owned-companies", "article-opinion-endless-expansion"],
    mostReadArticleIds: ["article-opinion-private-markets", "article-opinion-endless-expansion", "article-opinion-family-owned-companies"],
    topics: [
      topic("Investing", "investing", "Capital allocation judged by evidence, stewardship and time horizon."),
      topic("Private markets", "private-markets", "The changing responsibilities of companies and long-term owners."),
      topic("Corporate governance", "corporate-governance", "How ownership structures influence accountability and renewal."),
    ],
  },
  {
    authorId: "author-sophia-laurent",
    featuredArticleId: "article-opinion-ai-regulation",
    essentialArticleIds: ["article-opinion-technology-policy-infrastructure", "article-opinion-ai-adoption-faster", "article-opinion-compute-access-divide"],
    mostReadArticleIds: ["article-opinion-ai-regulation", "article-opinion-ai-models-debate", "article-opinion-ai-adoption-faster"],
    topics: [
      topic("Technology policy", "technology-policy", "Rules and incentives designed around practical outcomes."),
      topic("Artificial intelligence", "artificial-intelligence", "Responsible adoption beyond benchmark races and spectacle."),
      topic("Infrastructure", "infrastructure", "The compute, energy and institutions beneath digital ambition."),
    ],
  },
  {
    authorId: "author-oliver-grant",
    featuredArticleId: "article-opinion-board-innovation",
    essentialArticleIds: ["article-opinion-leadership-institutional", "article-opinion-succession-earlier", "article-opinion-fewer-strategic-priorities"],
    mostReadArticleIds: ["article-opinion-board-innovation", "article-opinion-fewer-strategic-priorities", "article-opinion-boards-technology-infrastructure"],
    topics: [
      topic("Leadership", "leadership", "Leadership measured by the systems and judgment it leaves behind."),
      topic("Boards", "boards", "Governance that connects oversight with strategic understanding."),
      topic("Organizational strategy", "organizational-strategy", "Turning priorities into permission, capability and coordinated action."),
    ],
  },
  {
    authorId: "author-amara-okafor",
    featuredArticleId: "article-opinion-globalization-regional",
    essentialArticleIds: ["article-opinion-globalization-changing", "article-opinion-industrial-policy-permanent", "article-opinion-data-centers-political"],
    mostReadArticleIds: ["article-opinion-globalization-regional", "article-opinion-globalization-changing", "article-opinion-data-centers-political"],
    topics: [
      topic("Global affairs", "global-affairs", "Power and interdependence across changing international systems."),
      topic("Political economy", "political-economy", "The institutions connecting public choices and private investment."),
      topic("Regionalization", "regionalization", "How denser regional networks are reorganizing globalization."),
    ],
  },
  {
    authorId: "author-julian-hart",
    featuredArticleId: "article-opinion-institutions-outlast-founders",
    essentialArticleIds: ["article-opinion-fewer-heroes", "article-opinion-executive-visibility"],
    mostReadArticleIds: ["article-opinion-institutions-outlast-founders", "article-opinion-fewer-heroes", "article-opinion-executive-visibility"],
    topics: [
      topic("Management", "management", "The operating systems that make good work repeatable."),
      topic("Institutions", "institutions", "Organizations designed to endure beyond individual authority."),
      topic("Founders", "founders", "The transition from founder influence to institutional strength."),
    ],
  },
];

const resolveArticles = (ids: readonly string[], authoredArticles: readonly Article[], fallbackCount: number) => {
  const authoredIds = new Set(authoredArticles.map((article) => article.id));
  const resolved = ids.map(getArticleById).filter((article): article is Article => article !== undefined && authoredIds.has(article.id));
  return resolved.length > 0 ? resolved : authoredArticles.slice(0, fallbackCount);
};

const defaultTopics = (articles: readonly Article[]): readonly AuthorTopic[] => {
  const names = [...new Set(articles.map((article) => article.subcategory ?? article.category.name))].slice(0, 3);
  return names.map((name) => topic(
    name,
    name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    `Reporting and analysis from this contributor's published work on ${name.toLowerCase()}.`,
  ));
};

export const getAuthorProfileConfig = (authorId: string) => curatedProfiles.find((profile) => profile.authorId === authorId);

export const getPublicAuthors = () => authors.filter((author) => getArticlesByAuthor(author.id).length > 0);

export const getAuthorProfileBySlug = (slug: string): AuthorProfileData | undefined => {
  const author = getAuthorBySlug(slug);
  if (!author) return undefined;

  const authoredArticles = getArticlesByAuthor(author.id);
  if (authoredArticles.length === 0) return undefined;

  const config = getAuthorProfileConfig(author.id);
  const configuredFeature = config ? getArticleById(config.featuredArticleId) : undefined;
  const featuredArticle = configuredFeature?.authors.some((candidate) => candidate.id === author.id) ? configuredFeature : authoredArticles[0];
  const latestArticles = authoredArticles.slice(0, 5);
  const essentialArticles = config
    ? resolveArticles(config.essentialArticleIds, authoredArticles, 3)
    : authoredArticles.slice(0, 3);
  const mostReadArticles = config
    ? resolveArticles(config.mostReadArticleIds, authoredArticles, 5)
    : authoredArticles.slice(0, 5);

  return {
    author,
    articles: authoredArticles,
    featuredArticle,
    latestArticles,
    essentialArticles,
    mostReadArticles,
    topics: config?.topics ?? defaultTopics(authoredArticles),
  };
};
