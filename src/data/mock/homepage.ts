import { getArticleById } from "./articles";
import { getPersonById } from "./people";

const select = (ids: readonly string[]) => ids.map(getArticleById).filter((article) => article !== undefined);
export const homeContent = {
  breaking: select(["article-asian-markets-advance","article-manufacturers-invest","article-enterprise-ai-phase","article-modern-success"]),
  hero: { main:getArticleById("article-new-architecture-global-leadership")!, secondary:select(["article-companies-rewriting-global-growth","article-ai-infrastructure-race"]) },
  latest: { feature:getArticleById("article-market-memory")!, rows:select(["article-asian-markets-advance","article-manufacturers-invest","article-boards-succession","article-private-markets-record","article-enterprise-ai-phase"]) },
  editorsPicks: select(["article-50-leaders","article-investor-networks","article-long-term-boardroom"]),
  business: { feature:getArticleById("article-companies-growth-cycle")!, supporting:select(["article-industrial-strategy","article-private-companies-scale","article-family-businesses","article-geography-entrepreneurship"]) },
  leadership: { person:getPersonById("person-elena-rossi")!, supporting:select(["article-decisions-pressure","article-professional-founder","article-boards-accountability"]) },
  technology: { feature:getArticleById("article-ai-infrastructure")!, supporting:select(["article-ai-native","article-data-centers-strategic","article-cyber-spending","article-next-platform"]) },
  finance: select(["article-markets-optimism","article-private-credit","article-emerging-markets","article-wealth-technology"]),
  interview: getPersonById("person-marcus-chen")!,
  culture: select(["article-quiet-luxury","article-cities-executives","article-collecting-personal","article-modern-success","article-five-books"]),
  mostRead: select(["article-50-leaders","article-ai-infrastructure-race","article-investor-networks","article-family-businesses","article-cities-executives"]),
} as const;

export const markets = [
  { name:"S&P 500", value:"5,478.22", change:"+0.62%" }, { name:"NASDAQ", value:"17,862.23", change:"+0.81%" },
  { name:"FTSE 100", value:"8,269.10", change:"+0.34%" }, { name:"NIFTY 50", value:"24,415.60", change:"+0.48%" },
] as const;

export const opinions = [
  { author:"Dr. Maya Patel", role:"Economist", headline:"Why Productivity May Be Entering a New Golden Age", excerpt:"Technology matters most when institutions learn how to use it." },
  { author:"Daniel Brooks", role:"Investor", headline:"Private Markets Need Greater Transparency", excerpt:"Trust will determine whether a larger market becomes a better one." },
  { author:"Sophia Laurent", role:"Technology Strategist", headline:"AI Regulation Must Focus on Outcomes, Not Fear", excerpt:"Good rules begin with the harms we can define." },
  { author:"Oliver Grant", role:"Former CEO", headline:"Boards Are Asking the Wrong Questions About Innovation", excerpt:"The central question is not speed. It is organizational permission." },
] as const;
