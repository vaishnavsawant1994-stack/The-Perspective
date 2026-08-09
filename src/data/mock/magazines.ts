import type { Article, Magazine, MagazineIssue, MagazineIssueSection, MagazineLandingContent } from "@/types";
import { getArticleById } from "./articles";
import { magazineCategories } from "./categories";
import { getPersonById } from "./people";

export const magazines: readonly Magazine[] = [
  {
    id: "mag-perspective",
    title: "The Perspective",
    slug: "the-perspective",
    description: "A curated collection of ideas, leaders and stories designed to be read, kept and returned to.",
    category: magazineCategories[0],
    premium: false,
  },
];

const magazineId = magazines[0].id;
const section = (id: string, label: string, href: string, articleIds: readonly string[]): MagazineIssueSection => ({ id, label, href, articleIds });

export const magazineIssues: readonly MagazineIssue[] = [
  {
    id: "issue-august-2026",
    magazineId,
    title: "The Architects of Tomorrow",
    slug: "august-2026",
    issueNumber: 8,
    publicationDate: "2026-08-01",
    description: "Inside the minds building the next generation of companies, institutions and ideas.",
    coverHeadline: "The Architects of Tomorrow",
    coverKicker: "The annual ideas issue",
    coverStoryArticleId: "article-architects-of-tomorrow",
    featuredArticleIds: ["article-global-tech-founders", "article-50-leaders", "article-companies-growth-cycle", "article-ai-infrastructure-race", "article-new-architecture-global-leadership", "article-opinion-productivity"],
    sectionGroups: [
      section("leadership", "Leadership", "/leadership", ["article-architects-of-tomorrow", "article-new-architecture-global-leadership", "article-50-leaders", "article-boards-accountability"]),
      section("business", "Business", "/business", ["article-companies-growth-cycle", "article-professional-founder-archetype", "article-forces-global-economy"]),
      section("technology", "Technology", "/technology", ["article-ai-infrastructure-race", "article-ai-native", "article-data-centers-strategic"]),
      section("perspective", "The Perspective", "/perspective", ["article-opinion-productivity", "article-opinion-institutions-outlast-founders", "article-opinion-globalization-regional"]),
      section("culture", "Culture", "/search?q=culture&type=articles", ["article-quiet-luxury", "article-cities-executives", "article-five-books"]),
    ],
    theme: "Ideas & Influence",
    coverImage: { src: "/images/articles/global-leadership.png", alt: "Leaders gathering in a monumental contemporary atrium", width: 1536, height: 1024 },
    pageCount: 156,
    status: "published",
    featured: true,
  },
  {
    id: "issue-global-leaders-special-2026",
    magazineId,
    title: "The Global Leaders Issue",
    slug: "global-leaders-special-2026",
    issueNumber: 7,
    publicationDate: "2026-07-15",
    description: "Long-form interviews and analysis on leadership across institutions, regions and generations.",
    coverHeadline: "The Global Leaders Issue",
    coverKicker: "Premium edition",
    coverStoryArticleId: "article-50-leaders",
    featuredArticleIds: ["article-new-architecture-global-leadership", "article-interview-elena-rossi", "article-leaders-certainty-disappears"],
    sectionGroups: [section("leadership", "Leadership", "/leadership", ["article-50-leaders", "article-new-architecture-global-leadership", "article-interview-elena-rossi"])],
    theme: "Special Edition",
    coverImage: { src: "/images/articles/elena-rossi.png", alt: "Editorial portrait of Elena Rossi", width: 1024, height: 1536 },
    pageCount: 184,
    status: "published",
    premium: true,
  },
  {
    id: "issue-july-2026",
    magazineId,
    title: "The New Capital",
    slug: "july-2026",
    issueNumber: 7,
    publicationDate: "2026-07-01",
    description: "The investors, institutions and ideas changing how long-term value is built.",
    coverHeadline: "The New Capital",
    coverKicker: "Markets, ownership, ambition",
    coverStoryArticleId: "article-purpose-capital",
    featuredArticleIds: ["article-private-markets-financing", "article-investor-networks", "article-family-businesses"],
    sectionGroups: [section("business", "Business", "/business", ["article-purpose-capital", "article-private-markets-financing", "article-family-businesses"])],
    theme: "Business & Capital",
    coverImage: { src: "/images/articles/global-growth.png", alt: "People crossing a modern international research campus", width: 1536, height: 1024 },
    pageCount: 144,
    status: "published",
  },
  {
    id: "issue-june-2026",
    magazineId,
    title: "Leadership Redefined",
    slug: "june-2026",
    issueNumber: 6,
    publicationDate: "2026-06-01",
    description: "How executives and institutions are replacing certainty with clarity and capability.",
    coverHeadline: "Leadership Redefined",
    coverKicker: "The institution builders",
    coverStoryArticleId: "article-new-architecture-global-leadership",
    featuredArticleIds: ["article-decisions-pressure", "article-organizational-trust", "article-new-executive-mandate"],
    sectionGroups: [section("leadership", "Leadership", "/leadership", ["article-new-architecture-global-leadership", "article-decisions-pressure", "article-new-executive-mandate"])],
    theme: "Leadership",
    coverImage: { src: "/images/articles/future-leader.png", alt: "An emerging executive photographed beside a softly lit window", width: 1024, height: 1536 },
    pageCount: 132,
    status: "published",
  },
  {
    id: "issue-may-2026",
    magazineId,
    title: "The AI Economy",
    slug: "may-2026",
    issueNumber: 5,
    publicationDate: "2026-05-01",
    description: "The compute, capital and organizational choices behind artificial intelligence at scale.",
    coverHeadline: "The AI Economy",
    coverKicker: "Infrastructure becomes strategy",
    coverStoryArticleId: "article-ai-infrastructure-race",
    featuredArticleIds: ["article-infrastructure-ai-economy", "article-enterprise-ai-phase", "article-ai-agents-enterprise"],
    sectionGroups: [section("technology", "Technology", "/technology", ["article-ai-infrastructure-race", "article-infrastructure-ai-economy", "article-enterprise-ai-phase"])],
    theme: "Technology",
    coverImage: { src: "/images/articles/ai-infrastructure.png", alt: "An engineer walking through a large data center corridor", width: 1536, height: 1024 },
    pageCount: 148,
    status: "published",
  },
  {
    id: "issue-april-2026",
    magazineId,
    title: "Building Global",
    slug: "april-2026",
    issueNumber: 4,
    publicationDate: "2026-04-01",
    description: "Companies, corridors and founders redrawing the map of international growth.",
    coverHeadline: "Building Global",
    coverKicker: "A new geography of growth",
    coverStoryArticleId: "article-companies-rewriting-global-growth",
    featuredArticleIds: ["article-indian-companies-global", "article-southeast-asia-corridor", "article-global-tech-founders"],
    sectionGroups: [section("business", "Business", "/business", ["article-companies-rewriting-global-growth", "article-indian-companies-global", "article-southeast-asia-corridor"])],
    theme: "Global Business",
    coverImage: { src: "/images/articles/arjun-mehta.png", alt: "Arjun Mehta seated in a contemporary executive office", width: 1024, height: 1536 },
    pageCount: 136,
    status: "published",
  },
];

const resolveArticles = (ids: readonly string[]) => {
  const seen = new Set<string>();
  return ids.flatMap((id) => {
    const article = getArticleById(id);
    if (!article || seen.has(article.id)) return [];
    seen.add(article.id);
    return [article];
  });
};

export function getLatestMagazineIssue() {
  return [...magazineIssues]
    .filter((issue) => issue.status === "published" && !issue.premium)
    .sort((left, right) => right.publicationDate.localeCompare(left.publicationDate))[0];
}

export function getPreviousMagazineIssues(limit = 4) {
  const latestIssue = getLatestMagazineIssue();
  return [...magazineIssues]
    .filter((issue) => issue.status === "published" && !issue.premium && issue.id !== latestIssue?.id)
    .sort((left, right) => right.publicationDate.localeCompare(left.publicationDate))
    .slice(0, limit);
}

export function getFeaturedMagazineIssue() {
  return magazineIssues.find((issue) => issue.featured) ?? getLatestMagazineIssue();
}

export function getPremiumMagazineIssue() {
  return magazineIssues.find((issue) => issue.premium && issue.status === "published");
}

export function getMagazineIssueArticles(issue: MagazineIssue): readonly Article[] {
  return resolveArticles([issue.coverStoryArticleId, ...issue.featuredArticleIds, ...issue.sectionGroups.flatMap((group) => group.articleIds)]);
}

export function getMagazineIssueSections(issue: MagazineIssue) {
  return issue.sectionGroups.map(({ articleIds, ...group }) => ({ ...group, articles: resolveArticles(articleIds) })).filter((group) => group.articles.length > 0);
}

export function getMagazineLandingContent(): MagazineLandingContent {
  const magazine = magazines[0];
  const latestIssue = getLatestMagazineIssue();
  const premiumIssue = getPremiumMagazineIssue();
  if (!magazine || !latestIssue || !premiumIssue) throw new Error("Magazine landing requires a publication, latest issue, and premium issue.");

  const latestArticles = getMagazineIssueArticles(latestIssue);
  const coverStory = getArticleById(latestIssue.coverStoryArticleId) ?? latestArticles[0];
  if (!coverStory) throw new Error("Magazine landing requires a resolvable cover story.");

  const personalMagazineProfiles = ["person-arjun-mehta", "person-sophia-reynolds", "person-daniel-kim"]
    .map(getPersonById)
    .filter((person) => person !== undefined);

  return {
    magazine,
    latestIssue,
    coverStory,
    issueHighlights: latestArticles.filter((article) => article.id !== coverStory.id).slice(0, 6),
    issueSections: getMagazineIssueSections(latestIssue),
    previousIssues: getPreviousMagazineIssues(),
    premiumIssue,
    personalMagazineProfiles,
  };
}
