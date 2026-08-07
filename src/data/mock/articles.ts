import type { Article, ImageAsset } from "@/types";
import { getAuthorById } from "./authors";
import { categories } from "./categories";

const images = {
  leadership: { src: "/images/articles/global-leadership.png", alt: "Global leaders in conversation inside a monumental contemporary atrium", width: 1536, height: 1024 },
  growth: { src: "/images/articles/global-growth.png", alt: "People crossing a modern international research campus", width: 1536, height: 1024 },
  technology: { src: "/images/articles/ai-infrastructure.png", alt: "An engineer walking through a large data center corridor", width: 1536, height: 1024 },
  portrait: { src: "/images/articles/elena-rossi.png", alt: "Elena Rossi seated for an editorial portrait", width: 1024, height: 1536 },
} satisfies Record<string, ImageAsset>;

type ArticleSeed = { id: string; title: string; excerpt: string; category: keyof typeof categories; author?: string; image?: keyof typeof images; minutes?: number; time?: string; premium?: boolean; breaking?: boolean; featured?: boolean; dek?: string };
const latestTimestamps: Record<string, string> = {
  "article-global-companies-reassess": "2026-08-07T12:42:00+05:30", "article-enterprise-ai-phase": "2026-08-07T12:18:00+05:30",
  "article-asian-markets-advance": "2026-08-07T11:54:00+05:30", "article-boards-succession": "2026-08-07T11:31:00+05:30",
  "article-ai-infrastructure": "2026-08-07T10:48:00+05:30", "article-manufacturers-invest": "2026-08-07T10:16:00+05:30",
  "article-private-markets-record": "2026-08-07T09:42:00+05:30", "article-markets-optimism": "2026-08-07T09:08:00+05:30",
  "article-professional-founder": "2026-08-07T08:36:00+05:30", "article-cyber-spending": "2026-08-07T08:04:00+05:30",
  "article-private-credit": "2026-08-07T07:32:00+05:30", "article-collecting-personal": "2026-08-07T07:05:00+05:30",
  "article-new-architecture-global-leadership": "2026-08-06T18:30:00+05:30", "article-companies-rewriting-global-growth": "2026-08-06T17:45:00+05:30",
  "article-ai-infrastructure-race": "2026-08-06T16:20:00+05:30", "article-emerging-markets": "2026-08-06T15:10:00+05:30",
  "article-family-businesses": "2026-08-06T13:40:00+05:30", "article-decisions-pressure": "2026-08-06T12:25:00+05:30",
  "article-quiet-luxury": "2026-08-06T11:00:00+05:30", "article-human-machine": "2026-08-06T09:35:00+05:30",
  "article-purpose-capital": "2026-08-05T17:20:00+05:30", "article-listening-leader": "2026-08-05T15:45:00+05:30",
  "article-cities-executives": "2026-08-05T13:15:00+05:30", "article-modern-success": "2026-08-05T10:30:00+05:30",
  "article-opinion-productivity": "2026-08-07T08:52:00+05:30", "article-opinion-private-markets": "2026-08-06T14:25:00+05:30",
  "article-opinion-ai-regulation": "2026-08-06T10:15:00+05:30", "article-opinion-board-innovation": "2026-08-05T12:10:00+05:30",
};
const makeArticle = (seed: ArticleSeed): Article => { const publishedAt = latestTimestamps[seed.id] ?? "2026-08-04T12:00:00+05:30"; return { id: seed.id, slug: seed.id.replace("article-", ""), title: seed.title, dek: seed.dek, excerpt: seed.excerpt, status: "published", category: categories[seed.category], authors: [getAuthorById(seed.author ?? "author-ava-morgan")], tags: [], heroImage: images[seed.image ?? "growth"], publishedAt, updatedAt: publishedAt, readingMinutes: seed.minutes ?? 7, displayTime: seed.time ?? "August 7, 2026", premium: seed.premium, breaking: seed.breaking, featured: seed.featured }; };

const seeds: ArticleSeed[] = [
  { id:"article-global-companies-reassess", title:"Global Companies Reassess Growth Plans as Investment Accelerates", excerpt:"A new cycle of capital investment is reshaping corporate strategy across technology, manufacturing and infrastructure.", dek:"Executives are redirecting capital toward resilience, automation, and the next generation of industrial capacity.", category:"business", author:"author-julian-cross", image:"growth", minutes:8, breaking:true, featured:true },
  { id:"article-forces-global-economy", title:"The Forces Reshaping the Global Economy", excerpt:"Capital, technology, demographics, and industrial policy are converging into a new economic order.", category:"finance", author:"author-david-owusu", image:"leadership", minutes:14, premium:true, featured:true },
  { id:"article-new-architecture-global-leadership", title:"The New Architecture of Global Leadership", excerpt:"How founders, executives and investors are redefining influence in an increasingly fragmented world.", dek:"A generation of leaders is exchanging certainty for clarity—and building institutions designed to endure.", category:"leadership", image:"leadership", minutes:8, featured:true },
  { id:"article-companies-rewriting-global-growth", title:"Inside the Companies Rewriting the Rules of Global Growth", excerpt:"Ambitious companies are redrawing the map of scale, talent, and capital.", category:"business", author:"author-julian-cross", image:"growth", minutes:10 },
  { id:"article-ai-infrastructure-race", title:"The AI Infrastructure Race Is Just Beginning", excerpt:"The contest to power intelligence is becoming the defining industrial story of the decade.", category:"technology", author:"author-noor-rahman", image:"technology", premium:true, minutes:9 },
  { id:"article-purpose-capital", title:"Capital With a Longer Memory", excerpt:"A generation of investors is challenging the tyranny of the quarterly horizon.", category:"finance", author:"author-david-owusu", minutes:11 },
  { id:"article-market-memory", title:"What Markets Choose to Remember", excerpt:"The stories economies tell themselves can matter as much as the numbers.", category:"markets", author:"author-david-owusu", minutes:7 },
  { id:"article-founders-second-act", title:"The Founder’s Second Act", excerpt:"After scale comes the harder question: what is the company actually for?", category:"business", author:"author-julian-cross", minutes:6 },
  { id:"article-listening-leader", title:"The Leader Who Listens Before Speaking", excerpt:"Inside the quiet discipline reshaping high-performing organizations.", category:"leadership", image:"portrait", minutes:9 },
  { id:"article-human-machine", title:"The Human Shape of Our Machines", excerpt:"Technology reflects more of its makers than its polished surfaces suggest.", category:"technology", author:"author-noor-rahman", image:"technology", minutes:10 },
  { id:"article-asian-markets-advance", title:"Asian Markets Advance After Technology Rally", excerpt:"Regional benchmarks rose as semiconductor and infrastructure shares led gains.", category:"markets", author:"author-david-owusu", time:"18 min ago" },
  { id:"article-manufacturers-invest", title:"Global Manufacturers Increase Capital Investment", excerpt:"Factories are becoming strategic assets again.", category:"business", author:"author-julian-cross", time:"36 min ago" },
  { id:"article-boards-succession", title:"Boards Rethink Succession Planning for the AI Era", excerpt:"The next chief executive may need an unfamiliar combination of judgment and fluency.", category:"leadership", time:"1 hr ago" },
  { id:"article-private-markets-record", title:"Private Markets Attract Record Institutional Capital", excerpt:"Allocators are widening their search for durable returns.", category:"finance", author:"author-david-owusu", time:"2 hrs ago" },
  { id:"article-enterprise-ai-phase", title:"Enterprise AI Spending Enters a New Phase", excerpt:"Pilots are becoming permanent operating infrastructure.", category:"technology", author:"author-noor-rahman", time:"3 hrs ago" },
  { id:"article-50-leaders", title:"The 50 Leaders Shaping the Next Decade", excerpt:"The builders, reformers and original thinkers changing how power works.", category:"leadership", image:"leadership", premium:true },
  { id:"article-investor-networks", title:"Inside the Investor Networks Driving Global Innovation", excerpt:"A quiet web of capital is helping ideas travel further and faster.", category:"finance", author:"author-david-owusu", image:"growth" },
  { id:"article-long-term-boardroom", title:"Why Long-Term Thinking Is Returning to the Boardroom", excerpt:"Strategy is rediscovering patience as an operating advantage.", category:"strategy", image:"leadership" },
  { id:"article-companies-growth-cycle", title:"The Companies Defining the Next Global Growth Cycle", excerpt:"Scale is moving toward resilient networks, specialized talent, and regional depth.", category:"business", author:"author-julian-cross", image:"growth" },
  { id:"article-industrial-strategy", title:"The Return of Industrial Strategy", excerpt:"Governments and companies are learning to build together again.", category:"business" },
  { id:"article-private-companies-scale", title:"Private Companies Find New Paths to Global Scale", excerpt:"Patient capital and distributed teams are changing the expansion playbook.", category:"business" },
  { id:"article-family-businesses", title:"Why Family Businesses Are Attracting Investors", excerpt:"Long horizons and operating discipline are becoming prized assets.", category:"business", premium:true },
  { id:"article-geography-entrepreneurship", title:"The New Geography of Entrepreneurship", excerpt:"The next generation of companies is starting far beyond familiar hubs.", category:"business" },
  { id:"article-decisions-pressure", title:"How Great Leaders Make Decisions Under Pressure", excerpt:"The strongest judgment begins before the crisis arrives.", category:"leadership", image:"portrait" },
  { id:"article-professional-founder", title:"The Rise of the Professional Founder", excerpt:"A new generation is treating company-building as a lifelong craft.", category:"leadership" },
  { id:"article-boards-accountability", title:"Boards Enter a New Era of Accountability", excerpt:"Oversight is expanding from compliance toward consequence.", category:"leadership" },
  { id:"article-ai-infrastructure", title:"AI Moves From Experiment to Infrastructure", excerpt:"The most consequential systems are becoming invisible parts of daily operations.", category:"technology", author:"author-noor-rahman", image:"technology" },
  { id:"article-ai-native", title:"Inside the New Generation of AI-Native Companies", excerpt:"Their advantage starts with how work is designed.", category:"technology", author:"author-noor-rahman" },
  { id:"article-data-centers-strategic", title:"Data Centers Become Strategic Infrastructure", excerpt:"Compute capacity is now an issue of industrial policy.", category:"technology", author:"author-noor-rahman", image:"technology" },
  { id:"article-cyber-spending", title:"Cybersecurity Spending Accelerates Worldwide", excerpt:"Resilience is moving from the technology budget to the board agenda.", category:"technology" },
  { id:"article-next-platform", title:"The Next Computing Platform May Look Nothing Like the Last", excerpt:"Ambient systems are shifting the boundary between interface and environment.", category:"technology" },
  { id:"article-markets-optimism", title:"Markets Enter a New Phase of Optimism", excerpt:"Investors are balancing strong earnings with a more complicated global outlook.", category:"markets", author:"author-david-owusu" },
  { id:"article-private-credit", title:"Private Credit Becomes a Mainstream Asset Class", excerpt:"What began as an alternative is becoming core portfolio infrastructure.", category:"finance", author:"author-david-owusu" },
  { id:"article-emerging-markets", title:"Investors Reconsider the Role of Emerging Markets", excerpt:"Growth, reform, and demographics are reopening an old debate.", category:"markets" },
  { id:"article-wealth-technology", title:"Wealth Management Enters Its Technology Era", excerpt:"Personal advice is becoming both more digital and more human.", category:"finance" },
  { id:"article-quiet-luxury", title:"The Return of Quiet Luxury", excerpt:"Craft, provenance, and restraint are becoming the new signals of taste.", category:"design", author:"author-lena-park", image:"portrait" },
  { id:"article-cities-executives", title:"The Cities Executives Are Rediscovering", excerpt:"A different rhythm of ambition is remaking the map of work and life.", category:"travel", author:"author-lena-park", image:"growth" },
  { id:"article-collecting-personal", title:"Why Collecting Is Becoming Personal Again", excerpt:"Objects are returning to the center of how we tell our own stories.", category:"culture", author:"author-lena-park" },
  { id:"article-modern-success", title:"The New Definition of Modern Success", excerpt:"Achievement is being measured in time, attention, and autonomy.", category:"lifestyle", author:"author-lena-park" },
  { id:"article-five-books", title:"Five Books Leaders Are Reading This Month", excerpt:"New thinking on institutions, courage, technology, and the long view.", category:"books", author:"author-lena-park" },
  { id:"article-opinion-productivity", title:"Why Productivity May Be Entering a New Golden Age", excerpt:"Technology matters most when institutions learn how to use it.", category:"opinion", author:"author-ava-morgan", image:"leadership", minutes:5 },
  { id:"article-opinion-private-markets", title:"Private Markets Need Greater Transparency", excerpt:"Trust will determine whether a larger market becomes a better one.", category:"opinion", author:"author-david-owusu", image:"growth", minutes:6 },
  { id:"article-opinion-ai-regulation", title:"AI Regulation Must Focus on Outcomes, Not Fear", excerpt:"Good rules begin with the harms we can define and the incentives we can change.", category:"opinion", author:"author-noor-rahman", image:"technology", minutes:7 },
  { id:"article-opinion-board-innovation", title:"Boards Are Asking the Wrong Questions About Innovation", excerpt:"The central question is not speed. It is organizational permission.", category:"opinion", author:"author-ava-morgan", image:"portrait", minutes:5 },
];
export const articles: Article[] = seeds.map(makeArticle);
export const getArticleById = (id: string) => articles.find((article) => article.id === id);
