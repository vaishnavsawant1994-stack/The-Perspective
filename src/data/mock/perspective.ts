import type { Article, Author, PerspectiveContent } from "@/types";
import { articles, getArticleById } from "./articles";
import { authors } from "./authors";

const selectArticles = (ids: readonly string[]) => ids.map(getArticleById).filter((article): article is Article => article !== undefined);
const requireArticle = (id: string) => {
  const article = getArticleById(id);
  if (!article) throw new Error(`Perspective article not found: ${id}`);
  return article;
};
const requireAuthor = (id: string) => {
  const author = authors.find((candidate) => candidate.id === id);
  if (!author) throw new Error(`Perspective author not found: ${id}`);
  return author;
};
const columnist = (authorId: string, articleId: string): { author: Author; latestArticle: Article } => ({ author: requireAuthor(authorId), latestArticle: requireArticle(articleId) });

export const perspectiveContent: PerspectiveContent = {
  label: "Opinion & Ideas",
  title: "The Perspective",
  description: "Ideas, arguments and analysis from contributors examining the forces shaping business, leadership, technology and society.",
  supportingLine: "Independent viewpoints from economists, investors, executives, academics and thinkers.",
  topics: [
    { label: "All Perspectives", href: "/perspective", active: true },
    { label: "Business & Economy", href: "/perspective/business" },
    { label: "Leadership", href: "/perspective/leadership" },
    { label: "Technology & Society", href: "/perspective/technology" },
    { label: "Markets", href: "/perspective/markets" },
    { label: "Culture", href: "/perspective/culture" },
    { label: "Global Affairs", href: "/perspective/global-affairs" },
  ],
  lead: {
    primary: requireArticle("article-opinion-productivity"),
    supporting: selectArticles(["article-opinion-private-markets", "article-opinion-ai-regulation", "article-opinion-board-innovation"]),
  },
  featuredColumnists: [
    columnist("author-maya-patel", "article-opinion-productivity"),
    columnist("author-daniel-brooks", "article-opinion-private-markets"),
    columnist("author-sophia-laurent", "article-opinion-ai-regulation"),
    columnist("author-oliver-grant", "article-opinion-board-innovation"),
    columnist("author-amara-okafor", "article-opinion-globalization-regional"),
    columnist("author-julian-hart", "article-opinion-institutions-outlast-founders"),
  ],
  todayArguments: selectArticles([
    "article-opinion-fewer-strategic-priorities", "article-opinion-endless-expansion", "article-opinion-ai-economic-realism",
    "article-opinion-boards-technology-infrastructure", "article-opinion-globalization-changing", "article-opinion-productivity-organizational-design",
  ]),
  sections: [
    {
      id: "business-economy",
      title: "Business & Economy",
      feature: requireArticle("article-opinion-private-markets"),
      supporting: selectArticles(["article-opinion-industrial-policy-permanent", "article-opinion-growth-without-productivity", "article-opinion-family-owned-companies", "article-opinion-long-term-corporate-thinking"]),
    },
    {
      id: "leadership-governance",
      title: "Leadership & Governance",
      feature: requireArticle("article-opinion-board-innovation"),
      supporting: selectArticles(["article-opinion-leadership-institutional", "article-opinion-succession-earlier", "article-opinion-executive-visibility", "article-opinion-fewer-heroes"]),
    },
    {
      id: "technology-society",
      title: "Technology & Society",
      feature: requireArticle("article-opinion-ai-regulation"),
      supporting: selectArticles(["article-opinion-ai-models-debate", "article-opinion-technology-policy-infrastructure", "article-opinion-automation-organizations", "article-opinion-data-centers-political", "article-opinion-compute-access-divide"]),
    },
  ],
  bigEssay: requireArticle("article-opinion-institutions-outlast-founders"),
  debate: {
    topic: "Should Companies Move Faster on AI Adoption?",
    point: {
      label: "Point",
      article: requireArticle("article-opinion-ai-adoption-faster"),
      summary: "Organizations do not develop judgment about artificial intelligence from the sidelines. They develop it through bounded use: testing systems against real work, discovering where data fails and teaching teams when outputs deserve challenge. Delay can look prudent while capability gaps quietly widen. The responsible alternative is not uncontrolled deployment. It is deliberate participation—small enough to govern, consequential enough to learn from and sustained long enough to build institutional confidence. Companies that postpone this work may eventually buy better tools, but they will still lack the operating knowledge required to use them well.",
    },
    counterpoint: {
      label: "Counterpoint",
      article: requireArticle("article-opinion-ai-adoption-patience"),
      summary: "Technology adoption creates value only when complementary investments are ready: trustworthy data, redesigned processes, skilled managers and clear accountability. Moving before those foundations exist can convert experimentation into expensive confusion. The strongest economic case is therefore for sequenced adoption, not maximum speed. Institutions should begin where the problem is specific, the outcome measurable and the consequences reversible. Patience in this sense is active rather than passive. It directs scarce capital toward readiness, protects attention from fashionable pilots and makes later scale more credible because the organization understands what it is scaling.",
    },
  },
  contributorSpotlight: columnist("author-amara-okafor", "article-opinion-globalization-regional"),
  mostRead: selectArticles(["article-opinion-productivity", "article-opinion-private-markets", "article-opinion-ai-regulation", "article-opinion-board-innovation", "article-opinion-institutions-outlast-founders"]),
  latest: selectArticles(["article-opinion-productivity", "article-opinion-fewer-strategic-priorities", "article-opinion-endless-expansion", "article-opinion-ai-economic-realism", "article-opinion-boards-technology-infrastructure", "article-opinion-globalization-changing", "article-opinion-productivity-organizational-design", "article-opinion-private-markets"]),
  promotion: {
    kind: "premium",
    eyebrow: "The Perspective Premium",
    title: "Ideas require more than headlines.",
    description: "Access deeper essays, exclusive commentary, premium magazine editions and member-only analysis.",
    primaryAction: { label: "Explore Premium", href: "/premium" },
    secondaryAction: { label: "Read the Magazine", href: "/magazine" },
  },
  newsletter: {
    eyebrow: "Opinion, selected",
    title: "The Perspective Briefing",
    description: "The strongest arguments, essays and ideas from The Perspective—selected for readers who want context, not noise.",
  },
};

export const opinionArticles = articles.filter((article) => article.articleType === "opinion");
