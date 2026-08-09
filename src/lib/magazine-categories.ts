import type { Article, MagazineCategory, MagazineCategoryContent, MagazineCategoryStory, MagazineIssue } from "@/types";
import { getArticleById } from "@/data/mock/articles";
import { magazineCategories } from "@/data/mock/magazine-categories";
import { getMagazineReaderIssueByIssueId } from "@/data/mock/magazine-readers";
import { getMagazineIssueArticles, magazineIssues } from "@/data/mock/magazines";
import { normalizeSearchQuery } from "@/lib/search-query";

const normalize = (value: string) => normalizeSearchQuery(value);

function includesKeyword(searchable: string, keyword: string) {
  const normalizedKeyword = normalize(keyword);
  if (!normalizedKeyword) return false;
  if (normalizedKeyword.length > 2) return searchable.includes(normalizedKeyword);
  return new Set(searchable.split(" ")).has(normalizedKeyword);
}

function issueArticleIds(issue: MagazineIssue) {
  return new Set([
    issue.coverStoryArticleId,
    ...issue.featuredArticleIds,
    ...issue.sectionGroups.flatMap((section) => section.articleIds),
  ]);
}

function articleMatchesCategory(article: Article, category: MagazineCategory) {
  if (category.articleCategorySlugs.includes(article.category.slug)) return true;
  const searchable = normalize([
    article.title,
    article.dek,
    article.excerpt,
    article.category.name,
    article.subcategory,
    ...article.tags.map((tag) => tag.name),
  ].filter(Boolean).join(" "));
  return category.articleKeywords.some((keyword) => includesKeyword(searchable, keyword));
}

function getIssueStoryContext(issue: MagazineIssue, article: Article): MagazineCategoryStory {
  const section = issue.sectionGroups.find((group) => group.articleIds.includes(article.id));
  return {
    article,
    issue,
    sectionLabel: section?.label ?? (issue.coverStoryArticleId === article.id ? "Cover Story" : "Issue Feature"),
  };
}

function getIssueStoryContexts(issue: MagazineIssue) {
  return getMagazineIssueArticles(issue).map((article) => getIssueStoryContext(issue, article));
}

export function getMagazineCategories() {
  return magazineCategories;
}

export function getMagazineCategoryBySlug(slug: string) {
  return magazineCategories.find((category) => category.slug === slug);
}

export function getMagazineCategoryHref(category: MagazineCategory) {
  return `/magazine/category/${category.slug}`;
}

export function getMagazineReaderHref(issue: MagazineIssue): string | null {
  return issue.readerAvailable && getMagazineReaderIssueByIssueId(issue.id)
    ? `/magazine/read/${issue.slug}`
    : null;
}

export function scoreMagazineIssueForCategory(issue: MagazineIssue, category: MagazineCategory) {
  let score = category.featuredIssueIds.includes(issue.id) ? 100 : 0;
  const normalizedTheme = normalize(issue.theme);
  const normalizedSections = issue.sectionGroups.map((section) => normalize(section.label));
  const issueText = normalize([issue.title, issue.coverHeadline, issue.coverKicker, issue.description, issue.theme].join(" "));

  if (category.issueThemeKeywords.some((keyword) => normalize(keyword) === normalizedTheme)) score += 50;
  if (category.sectionKeywords.some((keyword) => normalizedSections.includes(normalize(keyword)))) score += 30;
  if (category.issueThemeKeywords.some((keyword) => includesKeyword(issueText, keyword))) score += 20;
  if (category.includePremium && issue.premium) score += 70;

  if (!category.includePremium || score > 0) {
    for (const article of getMagazineIssueArticles(issue)) {
      if (articleMatchesCategory(article, category)) score += 10;
    }
  }
  return score;
}

export function getMagazineIssuesForCategory(category: MagazineCategory) {
  return magazineIssues
    .filter((issue) => issue.status === "published")
    .map((issue) => ({ issue, score: scoreMagazineIssueForCategory(issue, category) }))
    .filter(({ score }) => score >= 20)
    .sort((left, right) => right.score - left.score || right.issue.publicationDate.localeCompare(left.issue.publicationDate) || left.issue.slug.localeCompare(right.issue.slug))
    .map(({ issue }) => issue);
}

function getStoryForArticleId(articleId: string, issues: readonly MagazineIssue[]) {
  const article = getArticleById(articleId);
  if (!article) return undefined;
  const issue = [...issues]
    .sort((left, right) => right.publicationDate.localeCompare(left.publicationDate))
    .find((candidate) => issueArticleIds(candidate).has(article.id));
  return issue ? getIssueStoryContext(issue, article) : undefined;
}

export function getMagazineCategoryArticles(category: MagazineCategory, issues: readonly MagazineIssue[] = getMagazineIssuesForCategory(category)) {
  const chronologicalIssues = [...issues].sort((left, right) => right.publicationDate.localeCompare(left.publicationDate));
  const seen = new Set<string>();
  const matched: MagazineCategoryStory[] = [];
  const remaining: MagazineCategoryStory[] = [];

  for (const issue of chronologicalIssues) {
    for (const story of getIssueStoryContexts(issue)) {
      if (seen.has(story.article.id)) continue;
      seen.add(story.article.id);
      if (category.includePremium || articleMatchesCategory(story.article, category)) matched.push(story);
      else remaining.push(story);
    }
  }
  return [...matched, ...remaining];
}

export function getReaderIssuesForCategory(category: MagazineCategory, issues: readonly MagazineIssue[] = getMagazineIssuesForCategory(category)) {
  return issues.filter((issue) => getMagazineReaderHref(issue) !== null);
}

export function getPremiumIssuesForCategory(category: MagazineCategory, issues: readonly MagazineIssue[] = getMagazineIssuesForCategory(category)) {
  return issues.filter((issue) => issue.premium);
}

export function getRelatedMagazineCategories(category: MagazineCategory) {
  return category.relatedCategorySlugs.flatMap((slug) => {
    const related = getMagazineCategoryBySlug(slug);
    return related ? [related] : [];
  });
}

export function getMagazineArchiveThemeHref(theme: string) {
  const normalizedTheme = normalize(theme);
  const category = magazineCategories.find((candidate) => candidate.archiveThemeLabels.some((label) => normalize(label) === normalizedTheme));
  return category ? getMagazineCategoryHref(category) : `/magazine/archive?q=${encodeURIComponent(theme)}`;
}

export function getMagazineCategorySectionHref(sectionId: string, fallbackHref: string) {
  const category = getMagazineCategoryBySlug(sectionId);
  return category ? getMagazineCategoryHref(category) : fallbackHref;
}

export function getMagazineCategoryContent(category: MagazineCategory): MagazineCategoryContent {
  const matchingIssues = getMagazineIssuesForCategory(category).slice(0, 8);
  const featuredIssue = category.featuredIssueIds
    .map((id) => matchingIssues.find((issue) => issue.id === id))
    .find((issue) => issue !== undefined) ?? matchingIssues[0];
  if (!featuredIssue) throw new Error(`${category.name} Magazine category requires a featured issue.`);

  const featuredStories = category.featuredArticleIds.flatMap((id) => {
    const story = getStoryForArticleId(id, matchingIssues);
    return story ? [story] : [];
  }).slice(0, 6);
  const featuredIds = new Set(featuredStories.map((story) => story.article.id));
  const featuredIssueCandidates = getIssueStoryContexts(featuredIssue);
  const featuredIssueStories = [
    ...featuredIssueCandidates.filter((story) => !featuredIds.has(story.article.id)),
    ...featuredIssueCandidates.filter((story) => featuredIds.has(story.article.id)),
  ].slice(0, 3);
  const excludedStoryIds = new Set([
    ...featuredStories.map((story) => story.article.id),
    ...featuredIssueStories.map((story) => story.article.id),
  ]);
  const categoryStories = getMagazineCategoryArticles(category, matchingIssues);
  const primaryArchiveStories = categoryStories
    .filter((story) => !excludedStoryIds.has(story.article.id))
    .slice(0, 12);
  const archiveStories = primaryArchiveStories.length >= 5 ? primaryArchiveStories : [
    ...primaryArchiveStories,
    ...categoryStories.filter((story) => !featuredIds.has(story.article.id) && !primaryArchiveStories.some((selected) => selected.article.id === story.article.id)),
  ].slice(0, 12);

  return {
    category,
    featuredIssue,
    featuredIssueStories,
    featuredStories,
    matchingIssues,
    archiveStories,
    readerIssues: getReaderIssuesForCategory(category, matchingIssues),
    premiumIssues: getPremiumIssuesForCategory(category, matchingIssues),
    historicalIssues: matchingIssues.filter((issue) => issue.publicationDate < "2026-01-01").slice(0, 3),
    relatedCategories: getRelatedMagazineCategories(category),
    storyCount: categoryStories.length,
  };
}

export function validateMagazineCategoryData() {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const categorySlugs = new Set(magazineCategories.map((category) => category.slug));
  const issueIds = new Set(magazineIssues.map((issue) => issue.id));

  for (const category of magazineCategories) {
    if (ids.has(category.id)) errors.push(`Duplicate Magazine category id: ${category.id}.`);
    if (slugs.has(category.slug)) errors.push(`Duplicate Magazine category slug: ${category.slug}.`);
    for (const issueId of category.featuredIssueIds) if (!issueIds.has(issueId)) errors.push(`${category.slug} references unknown issue ${issueId}.`);
    for (const articleId of category.featuredArticleIds) if (!getArticleById(articleId)) errors.push(`${category.slug} references unknown article ${articleId}.`);
    for (const relatedSlug of category.relatedCategorySlugs) if (!categorySlugs.has(relatedSlug)) errors.push(`${category.slug} references unknown related category ${relatedSlug}.`);

    const matchingIssues = getMagazineIssuesForCategory(category);
    const minimumIssueCount = category.includePremium ? 2 : 3;
    if (matchingIssues.length < minimumIssueCount) errors.push(`${category.slug} has only ${matchingIssues.length} matching issues.`);
    if (getMagazineCategoryArticles(category, matchingIssues).length < 5) errors.push(`${category.slug} has fewer than five related stories.`);
    ids.add(category.id);
    slugs.add(category.slug);
  }
  return errors;
}
