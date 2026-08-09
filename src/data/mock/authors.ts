import type { Author } from "@/types";
const author = (id: string, name: string, role: string, biography: string, expertise?: string[]): Author => ({ id, name, slug: id.replace("author-", ""), role, biography, expertise });
export const authors: Author[] = [
  author("author-ava-morgan", "Ava Morgan", "Editor at Large", "Ava writes about leadership, institutions, and global influence."),
  author("author-amara-sen", "Amara Sen", "Senior Correspondent", "Amara reports on cities, public life, and how policy becomes lived experience."),
  author("author-julian-cross", "Julian Cross", "Business Editor", "Julian covers global companies, markets, and long-term capital."),
  author("author-noor-rahman", "Noor Rahman", "Technology Editor", "Noor examines the infrastructures and people shaping emerging technology."),
  author("author-lena-park", "Lena Park", "Culture Correspondent", "Lena reports on design, books, travel, and contemporary culture."),
  author("author-david-owusu", "David Owusu", "Markets Correspondent", "David writes about public markets and global investment flows."),
  author("author-maya-patel", "Dr. Maya Patel", "Economist", "Maya examines productivity, institutions and the economic consequences of technological change.", ["Economics", "Productivity", "Global policy"]),
  author("author-daniel-brooks", "Daniel Brooks", "Investor", "Daniel writes about private markets, long-term ownership and the responsibilities that accompany capital.", ["Investing", "Private markets", "Corporate governance"]),
  author("author-sophia-laurent", "Sophia Laurent", "Technology Strategist", "Sophia studies how technology policy, infrastructure and organizational choices shape responsible adoption.", ["Technology policy", "AI", "Infrastructure"]),
  author("author-oliver-grant", "Oliver Grant", "Former CEO", "Oliver writes about boards, innovation and the institutional work required to make strategy real.", ["Leadership", "Boards", "Organizational strategy"]),
  author("author-amara-okafor", "Amara Okafor", "Global Affairs Scholar", "Amara explores regional power, globalization and the institutions connecting economies and societies.", ["Global affairs", "Political economy", "Regionalization"]),
  author("author-julian-hart", "Julian Hart", "Management Writer", "Julian writes about founders, management systems and the design of organizations built to endure.", ["Management", "Institutions", "Founders"]),
];
export const getAuthorById = (id: string) => authors.find((item) => item.id === id) ?? authors[0];
