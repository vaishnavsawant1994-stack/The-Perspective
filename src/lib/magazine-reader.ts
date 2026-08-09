import type { Article, MagazinePage, MagazineReaderArticle, MagazineReaderIssue, ResolvedMagazinePage, ResolvedMagazineReaderIssue } from "@/types";
import { getArticleById } from "@/data/mock/articles";
import { getMagazineReaderIssueByIssueId, magazineReaderIssues } from "@/data/mock/magazine-readers";
import { getMagazineIssueBySlug, magazineIssues } from "@/data/mock/magazines";
import { siteConfig } from "@/config/site";

function assertNever(value: never): never {
  throw new Error(`Unsupported magazine page: ${JSON.stringify(value)}`);
}

function getPageArticleId(page: MagazinePage): string | undefined {
  switch (page.type) {
    case "feature":
    case "article":
    case "image":
      return page.articleId;
    case "section":
      return page.imageArticleId;
    case "quote":
      return page.articleId;
    case "cover":
    case "contents":
    case "editorial":
    case "end":
      return undefined;
    default:
      return assertNever(page);
  }
}

function toReaderArticle(article: Article): MagazineReaderArticle {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    dek: article.dek,
    excerpt: article.excerpt,
    category: article.category,
    authors: article.authors.map(({ id, name, slug }) => ({ id, name, slug })),
    heroImage: article.heroImage,
  };
}

export function validateMagazineReaderIssue(readerIssue: MagazineReaderIssue) {
  const errors: string[] = [];
  const issue = magazineIssues.find((candidate) => candidate.id === readerIssue.issueId);
  if (!issue) return [`Reader issue ${readerIssue.issueId} has no MagazineIssue.`];
  if (!issue.readerAvailable) errors.push(`${issue.slug} has reader data but is not marked readerAvailable.`);
  if (readerIssue.pageCount !== readerIssue.pages.length) errors.push(`${issue.slug} pageCount does not match pages.length.`);

  const pageIds = new Set<string>();
  const pageNumbers = new Set<number>();
  const sectionIds = new Set(issue.sectionGroups.map((section) => section.id));

  readerIssue.pages.forEach((page, index) => {
    if (pageIds.has(page.id)) errors.push(`Duplicate page id: ${page.id}.`);
    if (pageNumbers.has(page.pageNumber)) errors.push(`Duplicate page number: ${page.pageNumber}.`);
    if (page.pageNumber !== index + 1) errors.push(`Page ${page.id} is not contiguous at position ${index + 1}.`);
    if (page.sectionId && !sectionIds.has(page.sectionId)) errors.push(`Page ${page.id} references unknown section ${page.sectionId}.`);

    const articleId = getPageArticleId(page);
    if (articleId && !getArticleById(articleId)) errors.push(`Page ${page.id} references unknown article ${articleId}.`);
    pageIds.add(page.id);
    pageNumbers.add(page.pageNumber);
  });

  return errors;
}

function resolveReaderIssue(readerIssue: MagazineReaderIssue): ResolvedMagazineReaderIssue {
  const issue = magazineIssues.find((candidate) => candidate.id === readerIssue.issueId);
  if (!issue) throw new Error(`Reader issue ${readerIssue.issueId} has no MagazineIssue.`);

  const errors = validateMagazineReaderIssue(readerIssue);
  if (errors.length > 0) throw new Error(`Invalid magazine reader data:\n${errors.join("\n")}`);

  const pages: ResolvedMagazinePage[] = readerIssue.pages.map((page) => {
    const articleId = getPageArticleId(page);
    const article = articleId ? getArticleById(articleId) : undefined;
    return { ...page, article: article ? toReaderArticle(article) : undefined, image: article?.heroImage };
  });

  return {
    issue,
    pageCount: readerIssue.pageCount,
    pages,
    contents: pages.filter((page) => page.includeInContents).map(({ id, label, pageNumber, sectionId }) => ({ id, label, pageNumber, sectionId })),
  };
}

export function getMagazineReaderBySlug(slug: string): ResolvedMagazineReaderIssue | undefined {
  const issue = getMagazineIssueBySlug(slug);
  if (!issue?.readerAvailable) return undefined;
  const readerIssue = getMagazineReaderIssueByIssueId(issue.id);
  return readerIssue ? resolveReaderIssue(readerIssue) : undefined;
}

export function getReadableMagazineSlugs() {
  return magazineIssues.filter((issue) => issue.readerAvailable && getMagazineReaderIssueByIssueId(issue.id)).map((issue) => issue.slug);
}

export function validateAllMagazineReaders() {
  return magazineReaderIssues.flatMap((readerIssue) => validateMagazineReaderIssue(readerIssue));
}

export function clampMagazineReaderPage(value: string | string[] | undefined, pageCount: number) {
  const candidate = Array.isArray(value) ? value[0] : value;
  const parsed = Number.parseInt(candidate ?? "1", 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(pageCount, Math.max(1, parsed));
}

export function createMagazineReaderStructuredData(reader: ResolvedMagazineReaderIssue) {
  const canonicalUrl = `${siteConfig.url}/magazine/read/${reader.issue.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "PublicationIssue",
    name: reader.issue.title,
    headline: reader.issue.coverHeadline,
    description: reader.issue.description,
    datePublished: reader.issue.publicationDate,
    issueNumber: reader.issue.issueNumber,
    url: canonicalUrl,
    image: reader.issue.coverImage ? new URL(reader.issue.coverImage.src, siteConfig.url).href : undefined,
    isPartOf: { "@type": "Periodical", name: "The Perspective Magazine", url: `${siteConfig.url}/magazine` },
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };
}
