import type { SearchCounts, SearchFilter, SearchResult, SearchResultType, SearchSort } from "@/types";
import { getPublicAuthors } from "@/data/mock/author-profiles";
import { articles, getArticleById } from "@/data/mock/articles";
import { getMagazineIssueArticles, magazineIssues, magazines } from "@/data/mock/magazines";
import { people } from "@/data/mock/people";
import { getSearchDisplayQuery, normalizeSearchQuery, readSearchParameter } from "@/lib/search-query";

export { getSearchDisplayQuery, normalizeSearchQuery, readSearchParameter } from "@/lib/search-query";

type WithoutScore<T> = T extends unknown ? Omit<T, "score"> : never;

type SearchIndexEntry = {
  result: WithoutScore<SearchResult>;
  titleText: string;
  primaryText: string;
  secondaryText: string;
  bodyText: string;
  allText: string;
  sourceOrder: number;
};

const PERSON_ARTICLE_IDS: Readonly<Record<string, string>> = {
  "person-elena-rossi": "article-interview-elena-rossi",
  "person-marcus-chen": "article-interview-marcus-chen",
  "person-arjun-mehta": "article-business-interview-arjun-mehta",
  "person-daniel-kim": "article-technology-interview-daniel-kim",
};

const FILTER_TO_TYPE: Readonly<Record<Exclude<SearchFilter, "all">, SearchResultType>> = {
  articles: "article",
  contributors: "contributor",
  people: "person",
  magazines: "magazine",
};

export const searchFilters: readonly SearchFilter[] = ["all", "articles", "contributors", "people", "magazines"];
export const searchSorts: readonly SearchSort[] = ["relevance", "newest"];

export const searchFilterLabels: Readonly<Record<SearchFilter, string>> = {
  all: "All",
  articles: "Articles",
  contributors: "Contributors",
  people: "People",
  magazines: "Magazines",
};

export const searchResultLabels: Readonly<Record<SearchResultType, string>> = {
  article: "Article",
  contributor: "Contributor",
  person: "Person",
  magazine: "Magazine",
};

export function parseSearchFilter(value: string | string[] | undefined): SearchFilter {
  const candidate = readSearchParameter(value).toLowerCase() as SearchFilter;
  return searchFilters.includes(candidate) ? candidate : "all";
}

export function parseSearchSort(value: string | string[] | undefined): SearchSort {
  const candidate = readSearchParameter(value).toLowerCase() as SearchSort;
  return searchSorts.includes(candidate) ? candidate : "relevance";
}

const normalized = (parts: readonly (string | undefined)[]) => normalizeSearchQuery(parts.filter(Boolean).join(" "));

const issueLabel = (publicationDate: string, issueNumber: number) => {
  const monthYear = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(publicationDate));
  return `Issue ${String(issueNumber).padStart(2, "0")} · ${monthYear}`;
};

function createSearchIndex(): readonly SearchIndexEntry[] {
  let sourceOrder = 0;
  const entries: SearchIndexEntry[] = [];

  for (const article of articles) {
    const author = article.authors[0];
    const titleText = normalizeSearchQuery(article.title);
    const primaryText = normalized([article.category.name, article.subcategory, author?.name, author?.role]);
    const secondaryText = normalized(article.tags.flatMap((tag) => [tag.name, tag.slug]));
    const bodyText = normalized([article.dek, article.excerpt, article.articleType]);
    entries.push({
      result: {
        id: article.id,
        type: "article",
        title: article.title,
        description: article.dek ?? article.excerpt,
        href: `/article/${article.slug}`,
        image: article.heroImage,
        category: article.category.name,
        subcategory: article.subcategory,
        authorName: author?.name ?? "The Perspective",
        authorSlug: author?.slug ?? "",
        publishedAt: article.publishedAt ?? article.updatedAt,
        readingMinutes: article.readingMinutes,
        premium: article.premium ?? false,
        breaking: article.breaking ?? false,
      },
      titleText,
      primaryText,
      secondaryText,
      bodyText,
      allText: `${titleText} ${primaryText} ${secondaryText} ${bodyText}`,
      sourceOrder: sourceOrder++,
    });
  }

  for (const author of getPublicAuthors()) {
    const titleText = normalizeSearchQuery(author.name);
    const primaryText = normalized([author.role, ...(author.expertise ?? [])]);
    const bodyText = normalizeSearchQuery(author.biography);
    entries.push({
      result: {
        id: author.id,
        type: "contributor",
        title: author.name,
        description: author.biography,
        href: `/author/${author.slug}`,
        image: author.avatar,
        role: author.role,
        expertise: author.expertise ?? [],
      },
      titleText,
      primaryText,
      secondaryText: "",
      bodyText,
      allText: `${titleText} ${primaryText} ${bodyText}`,
      sourceOrder: sourceOrder++,
    });
  }

  for (const person of people) {
    const destinationId = PERSON_ARTICLE_IDS[person.id];
    const destination = destinationId ? getArticleById(destinationId) : undefined;
    const titleText = normalizeSearchQuery(person.name);
    const primaryText = normalized([person.title, person.company, ...person.expertise]);
    const secondaryText = normalizeSearchQuery(person.headline);
    const bodyText = normalized([person.biography, person.quote]);
    entries.push({
      result: {
        id: person.id,
        type: "person",
        title: person.name,
        description: person.biography,
        href: destination ? `/article/${destination.slug}` : undefined,
        image: person.portrait,
        personId: person.id,
        role: person.title,
        company: person.company,
        expertise: person.expertise,
        actionLabel: destination ? "Read Interview" : undefined,
      },
      titleText,
      primaryText,
      secondaryText,
      bodyText,
      allText: `${titleText} ${primaryText} ${secondaryText} ${bodyText}`,
      sourceOrder: sourceOrder++,
    });
  }

  for (const issue of magazineIssues) {
    const magazine = magazines.find((candidate) => candidate.id === issue.magazineId);
    if (!magazine) continue;
    const label = issueLabel(issue.publicationDate, issue.issueNumber);
    const titleText = normalizeSearchQuery(issue.title);
    const issueArticles = getMagazineIssueArticles(issue);
    const primaryText = normalized([magazine.title, magazine.category.name, issue.theme, label, "magazine issue"]);
    const secondaryText = normalized(issueArticles.map((article) => article.title));
    const bodyText = normalized([magazine.description, issue.description]);
    entries.push({
      result: {
        id: issue.id,
        type: "magazine",
        title: issue.title,
        description: issue.description,
        href: "/magazine",
        image: issue.coverImage,
        magazineId: magazine.id,
        issueId: issue.id,
        issueLabel: label,
        publicationDate: issue.publicationDate,
        featuredStory: issueArticles[0]?.title ?? issue.title,
      },
      titleText,
      primaryText,
      secondaryText,
      bodyText,
      allText: `${titleText} ${primaryText} ${secondaryText} ${bodyText}`,
      sourceOrder: sourceOrder++,
    });
  }

  return entries;
}

const searchIndex = createSearchIndex();

const containsSearchTerm = (text: string, term: string) => term.length <= 2 ? ` ${text} `.includes(` ${term} `) : text.includes(term);

function scoreSearchEntry(entry: SearchIndexEntry, query: string, tokens: readonly string[]) {
  if (!tokens.every((token) => containsSearchTerm(entry.allText, token))) return 0;

  let score = 1;
  if (entry.titleText === query) score += 240;
  else if (entry.titleText.startsWith(query)) score += 160;
  else if (containsSearchTerm(entry.titleText, query)) score += 110;

  if (containsSearchTerm(entry.primaryText, query)) score += 70;
  if (containsSearchTerm(entry.secondaryText, query)) score += 45;
  if (containsSearchTerm(entry.bodyText, query)) score += 25;

  for (const token of tokens) {
    if (containsSearchTerm(entry.titleText, token)) score += 24;
    if (containsSearchTerm(entry.primaryText, token)) score += 14;
    if (containsSearchTerm(entry.secondaryText, token)) score += 9;
    if (containsSearchTerm(entry.bodyText, token)) score += 4;
  }

  if (tokens.length > 1 && tokens.every((token) => containsSearchTerm(entry.titleText, token))) score += 24;
  return score;
}

export function searchSite(queryValue: string, { sort = "relevance" }: { sort?: SearchSort } = {}): SearchResult[] {
  const query = normalizeSearchQuery(queryValue);
  if (!query) return [];
  const tokens = query.split(" ");
  const matches = searchIndex.flatMap((entry) => {
    const score = scoreSearchEntry(entry, query, tokens);
    return score > 0 ? [{ ...entry.result, score, sourceOrder: entry.sourceOrder } as SearchResult & { sourceOrder: number }] : [];
  });

  return matches.sort((left, right) => {
    if (sort === "newest") {
      if (left.type === "article" && right.type === "article") return right.publishedAt.localeCompare(left.publishedAt) || right.score - left.score;
      if (left.type === "article") return -1;
      if (right.type === "article") return 1;
    }
    return right.score - left.score || left.sourceOrder - right.sourceOrder;
  }).map((match) => {
    const result = { ...match } as SearchResult & { sourceOrder?: number };
    delete result.sourceOrder;
    return result;
  });
}

export function filterSearchResults(results: readonly SearchResult[], filter: SearchFilter) {
  if (filter === "all") return [...results];
  const type = FILTER_TO_TYPE[filter];
  return results.filter((result) => result.type === type);
}

export function getSearchCounts(results: readonly SearchResult[]): SearchCounts {
  return results.reduce<SearchCounts>((counts, result) => {
    counts.all += 1;
    if (result.type === "article") counts.articles += 1;
    if (result.type === "contributor") counts.contributors += 1;
    if (result.type === "person") counts.people += 1;
    if (result.type === "magazine") counts.magazines += 1;
    return counts;
  }, { all: 0, articles: 0, contributors: 0, people: 0, magazines: 0 });
}

export function buildSearchUrl({ query, type = "all", sort = "relevance" }: { query?: string; type?: SearchFilter; sort?: SearchSort }) {
  const parameters = new URLSearchParams();
  const displayQuery = query ? getSearchDisplayQuery(query) : "";
  if (displayQuery) parameters.set("q", displayQuery);
  if (type !== "all") parameters.set("type", type);
  if (sort !== "relevance") parameters.set("sort", sort);
  const queryString = parameters.toString();
  return queryString ? `/search?${queryString}` : "/search";
}
