import type { MagazineArchiveCounts, MagazineArchiveFilter, MagazineArchiveIssue, MagazineArchiveState, MagazineIssue } from "@/types";
import { getArticleById } from "@/data/mock/articles";
import { getMagazineReaderIssueByIssueId } from "@/data/mock/magazine-readers";
import { getLatestMagazineIssue, getMagazineIssueArticles, magazineIssues } from "@/data/mock/magazines";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import { getSearchDisplayQuery, normalizeSearchQuery, readSearchParameter } from "@/lib/search-query";

export const magazineArchiveFilters: readonly MagazineArchiveFilter[] = ["all", "reader", "premium"];

export const magazineArchiveFilterLabels: Readonly<Record<MagazineArchiveFilter, string>> = {
  all: "All Issues",
  reader: "Digital Reader",
  premium: "Premium Editions",
};

export function getMagazineIssues() {
  return [...magazineIssues]
    .filter((issue) => issue.status === "published")
    .sort((left, right) => right.publicationDate.localeCompare(left.publicationDate) || right.issueNumber - left.issueNumber || left.slug.localeCompare(right.slug));
}

export function getMagazineIssuesByYear(year: number, issues: readonly MagazineIssue[] = getMagazineIssues()) {
  return issues.filter((issue) => Number(issue.publicationDate.slice(0, 4)) === year);
}

export function getMagazineArchiveYears(issues: readonly MagazineIssue[] = getMagazineIssues()) {
  return [...new Set(issues.map((issue) => Number(issue.publicationDate.slice(0, 4))))].sort((left, right) => right - left);
}

export function getReaderAvailableIssues(issues: readonly MagazineIssue[] = getMagazineIssues()) {
  return issues.filter((issue) => issue.readerAvailable);
}

export function getPremiumMagazineIssues(issues: readonly MagazineIssue[] = getMagazineIssues()) {
  return issues.filter((issue) => issue.premium);
}

function issueSearchText(issue: MagazineIssue) {
  const articles = getMagazineIssueArticles(issue);
  return normalizeSearchQuery([
    issue.title,
    issue.coverHeadline,
    issue.coverKicker,
    issue.description,
    issue.theme,
    formatMagazineIssueDate(issue.publicationDate),
    issue.publicationDate.slice(0, 4),
    `issue ${issue.issueNumber}`,
    ...issue.sectionGroups.map((section) => section.label),
    ...articles.map((article) => article.title),
  ].join(" "));
}

export function searchMagazineIssues(query: string, issues: readonly MagazineIssue[] = getMagazineIssues()) {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) return issues;
  const tokens = normalizedQuery.split(" ");
  return issues.filter((issue) => {
    const searchable = issueSearchText(issue);
    const searchableWords = new Set(searchable.split(" "));
    return tokens.every((token) => token.length <= 2 ? searchableWords.has(token) : searchable.includes(token));
  });
}

export function filterMagazineIssues({ issues = getMagazineIssues(), query = "", year, type = "all" }: { issues?: readonly MagazineIssue[]; query?: string; year?: number; type?: MagazineArchiveFilter }) {
  let filtered = year ? getMagazineIssuesByYear(year, issues) : issues;
  if (type === "reader") filtered = filtered.filter((issue) => issue.readerAvailable);
  if (type === "premium") filtered = filtered.filter((issue) => issue.premium);
  return searchMagazineIssues(query, filtered);
}

export function getMagazineArchiveCounts(issues: readonly MagazineIssue[] = getMagazineIssues()): MagazineArchiveCounts {
  const byYear: Record<number, number> = {};
  for (const issue of issues) {
    const year = Number(issue.publicationDate.slice(0, 4));
    byYear[year] = (byYear[year] ?? 0) + 1;
  }
  return {
    all: issues.length,
    reader: getReaderAvailableIssues(issues).length,
    premium: getPremiumMagazineIssues(issues).length,
    byYear,
  };
}

export function parseMagazineArchiveFilter(value: string | string[] | undefined): MagazineArchiveFilter {
  const candidate = readSearchParameter(value).toLowerCase() as MagazineArchiveFilter;
  return magazineArchiveFilters.includes(candidate) ? candidate : "all";
}

export function parseMagazineArchiveYear(value: string | string[] | undefined) {
  const candidate = readSearchParameter(value).trim();
  return /^\d{4}$/.test(candidate) ? Number(candidate) : undefined;
}

export function parseMagazineArchiveQuery(value: string | string[] | undefined) {
  const displayQuery = getSearchDisplayQuery(readSearchParameter(value));
  return normalizeSearchQuery(displayQuery) ? displayQuery : "";
}

export function buildMagazineArchiveUrl(state: MagazineArchiveState, changes: Partial<{ query: string | null; year: number | null; type: MagazineArchiveFilter | null }> = {}) {
  const query = changes.query === undefined ? state.query : changes.query ?? "";
  const year = changes.year === undefined ? state.year : changes.year ?? undefined;
  const type = changes.type === undefined ? state.type : changes.type ?? "all";
  const parameters = new URLSearchParams();
  if (query) parameters.set("q", query);
  if (year) parameters.set("year", String(year));
  if (type !== "all") parameters.set("type", type);
  const suffix = parameters.toString();
  return suffix ? `/magazine/archive?${suffix}` : "/magazine/archive";
}

export function resolveMagazineArchiveIssues(issues: readonly MagazineIssue[]): readonly MagazineArchiveIssue[] {
  return issues.map((issue) => ({ issue, stories: getMagazineIssueArticles(issue).slice(0, 3) }));
}

export function getFeaturedArchiveIssue(issues: readonly MagazineIssue[] = getMagazineIssues()) {
  const latestIssue = getLatestMagazineIssue();
  return issues.find((issue) => issue.id !== latestIssue?.id && !issue.premium);
}

export function getMagazineArchiveThemes(issues: readonly MagazineIssue[] = getMagazineIssues()) {
  const counts = new Map<string, number>();
  for (const issue of issues) counts.set(issue.theme, (counts.get(issue.theme) ?? 0) + 1);
  return [...counts].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0])).map(([theme]) => theme);
}

export function validateMagazineArchiveData() {
  const errors: string[] = [];
  const ids = new Set<string>();
  const slugs = new Set<string>();
  const featuredIssues = magazineIssues.filter((issue) => issue.featured);

  for (const issue of magazineIssues) {
    if (ids.has(issue.id)) errors.push(`Duplicate magazine issue id: ${issue.id}.`);
    if (slugs.has(issue.slug)) errors.push(`Duplicate magazine issue slug: ${issue.slug}.`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(issue.publicationDate) || Number.isNaN(Date.parse(`${issue.publicationDate}T00:00:00Z`))) errors.push(`Invalid publication date for ${issue.slug}.`);
    if (issue.readerAvailable && !getMagazineReaderIssueByIssueId(issue.id)) errors.push(`${issue.slug} is readerAvailable without reader data.`);

    const articleIds = [issue.coverStoryArticleId, ...issue.featuredArticleIds, ...issue.sectionGroups.flatMap((section) => section.articleIds)];
    for (const articleId of new Set(articleIds)) if (!getArticleById(articleId)) errors.push(`${issue.slug} references unknown article ${articleId}.`);
    ids.add(issue.id);
    slugs.add(issue.slug);
  }

  if (featuredIssues.length !== 1) errors.push(`Expected one featured/latest issue marker, found ${featuredIssues.length}.`);
  return errors;
}
