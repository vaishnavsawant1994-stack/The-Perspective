import type { Article, PersonProfile, ResolvedPersonalMagazineProfile } from "@/types";
import { articles, getArticleById } from "@/data/mock/articles";
import { people } from "@/data/mock/people";
import { getResolvedPersonalMagazineByPersonId } from "@/lib/personal-magazines";

const interviewIds: Record<string, string> = {
  "anika-rao": "article-human-purpose-ai-world",
  "elena-rossi": "article-interview-elena-rossi",
  "marcus-chen": "article-interview-marcus-chen",
  "arjun-mehta": "article-business-interview-arjun-mehta",
  "daniel-kim": "article-technology-interview-daniel-kim",
  "sophia-reynolds": "article-purpose-capital",
};

const coverageIds: Record<string, readonly string[]> = {
  "anika-rao": ["article-human-purpose-ai-world", "article-ai-augmented-decisions", "article-organizational-trust", "article-enterprise-ai-phase"],
  "elena-rossi": ["article-interview-elena-rossi", "article-listening-leader", "article-decisions-pressure", "article-new-executive-mandate"],
  "marcus-chen": ["article-interview-marcus-chen", "article-professional-founder", "article-companies-growth-cycle", "article-founders-second-act"],
  "arjun-mehta": ["article-business-interview-arjun-mehta", "article-companies-growth-cycle", "article-industrial-investment-strategy", "article-boards-long-term-investment"],
  "daniel-kim": ["article-technology-interview-daniel-kim", "article-ai-infrastructure-race", "article-global-computing-capacity", "article-infrastructure-ai-economy"],
  "sophia-reynolds": ["article-purpose-capital", "article-private-markets-financing", "article-private-markets-record", "article-markets-investors-watching"],
};

function resolveArticles(ids: readonly string[]) {
  return ids.map(getArticleById).filter((article): article is Article => article !== undefined);
}

export type ExecutiveProfileContent = {
  person: PersonProfile;
  interview: Article;
  coverage: readonly Article[];
  relatedPeople: readonly PersonProfile[];
  personalMagazine?: ResolvedPersonalMagazineProfile;
};

export function getExecutiveProfileContent(person: PersonProfile): ExecutiveProfileContent {
  const mapped = resolveArticles(coverageIds[person.slug] ?? []);
  const interview = getArticleById(interviewIds[person.slug] ?? "") ?? mapped[0] ?? articles[0];
  const coverage = mapped.length >= 3 ? mapped : [interview, ...articles.filter((article) => article.category.slug === interview.category.slug && article.id !== interview.id).slice(0, 3)];
  return {
    person,
    interview,
    coverage,
    relatedPeople: people.filter((candidate) => candidate.id !== person.id).slice(0, 4),
    personalMagazine: getResolvedPersonalMagazineByPersonId(person.id),
  };
}
