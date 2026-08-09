import type { Article, MagazineIssue, MagazinePremiumPageContent, MagazinePremiumStory } from "@/types";
import { getArticleById } from "@/data/mock/articles";
import { magazinePremiumPageConfig } from "@/data/mock/magazine-premium";
import { getMagazineIssueArticles, getReadableMagazineIssues, magazineIssues } from "@/data/mock/magazines";
import { getMagazineReaderHref } from "@/lib/magazine-categories";

function issueArticleIds(issue: MagazineIssue) {
  return new Set([issue.coverStoryArticleId, ...issue.featuredArticleIds, ...issue.sectionGroups.flatMap((section) => section.articleIds)]);
}

function getStoryContext(issue: MagazineIssue, article: Article): MagazinePremiumStory {
  const section = issue.sectionGroups.find((group) => group.articleIds.includes(article.id));
  return { article, issue, sectionLabel: section?.label ?? (issue.coverStoryArticleId === article.id ? "Cover Story" : "Issue Feature") };
}

function resolveConfiguredStories(articleIds: readonly string[], issues: readonly MagazineIssue[]) {
  return articleIds.flatMap((articleId) => {
    const article = getArticleById(articleId);
    const issue = issues.find((candidate) => issueArticleIds(candidate).has(articleId));
    return article && issue ? [getStoryContext(issue, article)] : [];
  });
}

export function getPublishedPremiumMagazineIssues() {
  return [...magazineIssues]
    .filter((issue) => issue.status === "published" && issue.premium === true)
    .sort((left, right) => right.publicationDate.localeCompare(left.publicationDate) || right.issueNumber - left.issueNumber);
}

export function getPremiumReaderIssues(issues: readonly MagazineIssue[] = getPublishedPremiumMagazineIssues()) {
  return issues.filter((issue) => getMagazineReaderHref(issue) !== null);
}

export function getMagazinePremiumContent(): MagazinePremiumPageContent {
  const premiumIssues = getPublishedPremiumMagazineIssues();
  const heroIssue = premiumIssues.find((issue) => issue.id === magazinePremiumPageConfig.heroIssueId);
  const digitalReaderHref = getReadableMagazineIssues().map(getMagazineReaderHref).find((href) => href !== null);
  if (!heroIssue || !digitalReaderHref) throw new Error("Premium Magazine requires a hero issue and an available Magazine Reader destination.");

  const featuredStories = resolveConfiguredStories(magazinePremiumPageConfig.featuredArticleIds, premiumIssues);
  const voiceStories = resolveConfiguredStories(magazinePremiumPageConfig.voiceArticleIds, premiumIssues);
  const uniqueStoryIds = new Set(premiumIssues.flatMap((issue) => getMagazineIssueArticles(issue).map((article) => article.id)));

  return {
    heroIssue,
    heroStories: getMagazineIssueArticles(heroIssue).slice(0, 3).map((article) => getStoryContext(heroIssue, article)),
    premiumIssues,
    featuredStories,
    voiceStories,
    readerIssues: getPremiumReaderIssues(premiumIssues),
    archiveIssues: premiumIssues.filter((issue) => issue.id !== heroIssue.id),
    benefits: magazinePremiumPageConfig.benefits,
    themeLinks: magazinePremiumPageConfig.themeLinks,
    comparison: magazinePremiumPageConfig.comparison,
    digitalReaderHref,
    storyCount: uniqueStoryIds.size,
  };
}

export function validateMagazinePremiumData() {
  const errors: string[] = [];
  const premiumIssues = getPublishedPremiumMagazineIssues();
  const issueIds = new Set<string>();
  const issueSlugs = new Set<string>();
  const configuredStoryIds = [...magazinePremiumPageConfig.featuredArticleIds, ...magazinePremiumPageConfig.voiceArticleIds];
  const premiumArticleIds = new Set(premiumIssues.flatMap((issue) => [...issueArticleIds(issue)]));

  if (premiumIssues.length !== 2) errors.push(`Expected exactly two published Premium issues, found ${premiumIssues.length}.`);
  if (!premiumIssues.some((issue) => issue.id === magazinePremiumPageConfig.heroIssueId)) errors.push(`Unknown Premium hero issue: ${magazinePremiumPageConfig.heroIssueId}.`);
  if (new Set(configuredStoryIds).size !== configuredStoryIds.length) errors.push("Premium featured and voice story selections must be distinct.");
  if (magazinePremiumPageConfig.featuredArticleIds.length < 5 || magazinePremiumPageConfig.featuredArticleIds.length > 6) errors.push("Premium featured stories must contain five or six articles.");
  if (magazinePremiumPageConfig.voiceArticleIds.length < 2 || magazinePremiumPageConfig.voiceArticleIds.length > 3) errors.push("Premium voices must contain two or three articles.");

  for (const issue of premiumIssues) {
    if (issueIds.has(issue.id)) errors.push(`Duplicate Premium issue id: ${issue.id}.`);
    if (issueSlugs.has(issue.slug)) errors.push(`Duplicate Premium issue slug: ${issue.slug}.`);
    if (!issue.premium) errors.push(`${issue.slug} is listed on Premium without Premium status.`);
    if (issue.readerAvailable && !getMagazineReaderHref(issue)) errors.push(`${issue.slug} claims Reader availability without canonical Reader data.`);
    issueIds.add(issue.id);
    issueSlugs.add(issue.slug);
  }

  for (const articleId of configuredStoryIds) {
    if (!getArticleById(articleId)) errors.push(`Premium config references unknown article ${articleId}.`);
    else if (!premiumArticleIds.has(articleId)) errors.push(`Premium story ${articleId} is not related to a canonical Premium issue.`);
  }
  for (const theme of magazinePremiumPageConfig.themeLinks) if (!theme.href.startsWith("/magazine/")) errors.push(`Premium theme ${theme.id} must stay within Magazine discovery.`);
  return errors;
}
