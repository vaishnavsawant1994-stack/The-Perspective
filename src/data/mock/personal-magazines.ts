import type { PersonalMagazine } from "@/types";

export const personalMagazines = [
  {
    id: "personal-magazine-arjun-mehta",
    slug: "arjun-mehta",
    personId: "person-arjun-mehta",
    coverHeadline: "Building Beyond Borders",
    editionLabel: "The Builder's Edition",
    publicationLabel: "Personal Edition · 2026",
    introduction: "A long-form portrait of disciplined ambition, global company building and the decisions that turn entrepreneurial momentum into an enduring institution.",
    editorialOpening: "Some leaders build companies around a moment. Others use the moment to begin building an institution. Arjun Mehta's story is shaped by the second ambition: a belief that scale matters only when it creates the freedom to invest patiently, learn across markets and make decisions that remain coherent long after the immediate opportunity has passed. This edition follows the thinking behind that approach—from the discipline of choosing where to grow to the quieter work of designing an organization that can carry responsibility beyond its founder.",
    editorialNarrative: [
      "Arjun Mehta's public identity begins with company building, but the more revealing story is about the systems beneath expansion. Meridian Industries is presented here not as a collection of milestones, but as the result of repeated choices about capital, focus and the pace at which an organization should take on complexity.",
      "His perspective treats global ambition as an operating discipline. New markets create opportunity, but they also test whether a company understands its own standards clearly enough to reproduce them without flattening local judgment.",
      "Leadership changes as the institution grows. The founder's task moves from making every important decision to building the people, language and governance through which good decisions can continue without constant intervention.",
      "The next chapter is therefore less about expansion for its own sake than about durability: preserving the capacity to think in decades while remaining alert enough to renew the company when evidence changes.",
    ],
    themes: [
      { id: "arjun-global-business", label: "Global Business", href: "/business" },
      { id: "arjun-leadership", label: "Leadership", href: "/leadership" },
      { id: "arjun-founders", label: "Founders", href: "/topic/founders" },
      { id: "arjun-markets", label: "Global Markets", href: "/topic/global-markets" },
      { id: "arjun-long-view", label: "The Long View", href: "/perspective" },
    ],
    interviewArticleId: "article-business-interview-arjun-mehta",
    featuredArticleIds: ["article-companies-growth-cycle", "article-professional-founder-archetype", "article-boards-long-term-investment", "article-opinion-institutions-outlast-founders"],
    relatedArticleIds: ["article-global-companies-reassess", "article-corporate-expansion-geography", "article-industrial-investment-strategy", "article-global-tech-founders"],
    milestones: [
      { id: "arjun-early-chapter", label: "Early chapter", title: "Learning to see the whole system", description: "The formative idea was not simply to pursue growth, but to understand how capital, operations and trust reinforce one another." },
      { id: "arjun-building", label: "Building the company", title: "Turning ambition into operating discipline", description: "Expansion became a test of whether principles could travel across teams, markets and increasingly complex decisions." },
      { id: "arjun-global", label: "Global expansion", title: "Growing without losing coherence", description: "The company learned to combine a shared institutional standard with the judgment required by different local contexts." },
      { id: "arjun-next", label: "The next phase", title: "Designing for life beyond the founder", description: "The work now centers on deeper leadership capacity, durable governance and the freedom to keep thinking long term." },
    ],
    chapters: [
      { id: "arjun-building-chapter", number: "01", label: "Building", title: "Ambition needs an operating system", description: "How strategic intent becomes repeatable institutional practice.", body: ["Ideas create direction; operating choices determine whether the direction survives contact with scale.", "For Arjun, durable building means making priorities legible enough that teams can act with confidence without waiting for the founder's presence."], articleId: "article-companies-growth-cycle" },
      { id: "arjun-leading-chapter", number: "02", label: "Leading", title: "Authority should create more judgment", description: "Why the strongest leaders expand the decision-making capacity around them.", body: ["Leadership becomes more consequential as direct control becomes less useful.", "The institution grows when responsibility is distributed with clear standards, honest information and permission to challenge an inherited assumption."], articleId: "article-boards-long-term-investment" },
      { id: "arjun-expanding-chapter", number: "03", label: "Expanding", title: "Global scale begins with local clarity", description: "The discipline required to cross borders without imposing a single template.", body: ["A company cannot call itself global merely because it operates in many places.", "It becomes global when it can preserve its principles while learning from the markets, people and institutions that give each place its character."], articleId: "article-corporate-expansion-geography" },
      { id: "arjun-long-term-chapter", number: "04", label: "Thinking long term", title: "Patience must still answer to evidence", description: "The long view as an active discipline rather than a slogan.", body: ["Long-term thinking does not mean defending every old decision. It means creating enough perspective to distinguish temporary pressure from a genuine change in the facts.", "Durability comes from combining conviction with the willingness to renew the institution before renewal becomes unavoidable."], articleId: "article-opinion-institutions-outlast-founders" },
    ],
    principles: [
      { id: "arjun-principle-durability", title: "Build for durability", description: "Treat scale as a responsibility to strengthen the institution, not as the final measure of success." },
      { id: "arjun-principle-capital", title: "Let capital express the strategy", description: "The clearest priorities are revealed by where time, attention and investment actually go." },
      { id: "arjun-principle-clarity", title: "Make judgment repeatable", description: "An organization becomes stronger when its people understand how decisions are made, not only what was decided." },
      { id: "arjun-principle-renewal", title: "Preserve the ability to change", description: "Long horizons matter because they create room to adapt before urgency removes the choice." },
    ],
    highlight: { kind: "person-quote", articleId: "article-business-interview-arjun-mehta" },
    gallery: [
      { id: "arjun-gallery-portrait", articleId: "article-business-interview-arjun-mehta", caption: "The Business Interview: a conversation about patience, ambition and durable enterprise." },
      { id: "arjun-gallery-growth", articleId: "article-companies-growth-cycle", caption: "The networks, talent and regional depth shaping the next cycle of global growth." },
      { id: "arjun-gallery-strategy", articleId: "article-industrial-investment-strategy", caption: "Industrial ambition returns to the center of long-term strategy." },
    ],
  },
  {
    id: "personal-magazine-sophia-reynolds",
    slug: "sophia-reynolds",
    personId: "person-sophia-reynolds",
    coverHeadline: "Capital With Conviction",
    editionLabel: "The Investor's Edition",
    publicationLabel: "Personal Edition · 2026",
    introduction: "An editorial study of patient capital, strategic transformation and the judgment required to support ambitious companies without surrendering to the shortest horizon.",
    editorialOpening: "Capital is often described by its volume, speed or return. Sophia Reynolds begins somewhere else: with the quality of the judgment attached to it. Her work at Reynolds Capital is framed by patient capital and transformative companies, but the deeper subject of this edition is stewardship—how an investor decides which ambitions deserve time, which changes require conviction and when support must include an honest challenge. The result is a profile of influence exercised through questions, perspective and the willingness to remain engaged after the excitement of the original decision has passed.",
    editorialNarrative: [
      "Sophia Reynolds works at the intersection of strategy and capital, where every investment decision also becomes a view about how a company might change. Her approach emphasizes the quality of the transformation rather than the theatre of momentum.",
      "Patient capital is not passive capital. It requires a sharper understanding of what progress should look like, which signals matter and where additional time would strengthen the enterprise rather than postpone a necessary choice.",
      "That perspective makes partnership central. The useful investor brings pattern recognition and distance, but remains close enough to understand the operating reality behind a board presentation or market narrative.",
      "Her edition asks a wider question: how can capital help companies become more capable, more resilient and more ambitious without asking them to optimize every decision for the nearest measure of approval?",
    ],
    themes: [
      { id: "sophia-capital", label: "Patient Capital", href: "/search?q=Patient+Capital" },
      { id: "sophia-strategy", label: "Strategy", href: "/leadership" },
      { id: "sophia-transformation", label: "Transformation", href: "/business" },
      { id: "sophia-markets", label: "Global Markets", href: "/topic/global-markets" },
      { id: "sophia-private-markets", label: "Private Markets", href: "/search?q=Private+Markets" },
    ],
    featuredArticleIds: ["article-purpose-capital", "article-private-markets-financing", "article-boards-long-term-investment", "article-markets-investors-watching"],
    relatedArticleIds: ["article-private-markets-record", "article-capital-efficient-startups", "article-opinion-long-term-corporate-thinking", "article-markets-optimism"],
    milestones: [
      { id: "sophia-perspective", label: "Forming the perspective", title: "Looking beyond the transaction", description: "The central question became what kind of company an investment could help create, not only what a position might become worth." },
      { id: "sophia-partnership", label: "Building partnerships", title: "Combining distance with real engagement", description: "Effective stewardship required pattern recognition without losing sight of the specific people and operating choices inside each company." },
      { id: "sophia-transformation", label: "Transformation", title: "Supporting consequential change", description: "Patient capital created room for companies to rebuild capabilities that cannot be measured through a single reporting cycle." },
      { id: "sophia-next", label: "The next horizon", title: "Making conviction more accountable", description: "The next phase asks how long-term investors can pair patience with clearer evidence, governance and responsibility." },
    ],
    chapters: [
      { id: "sophia-conviction-chapter", number: "01", label: "Conviction", title: "A long horizon changes the questions", description: "Why patient capital needs a more exact definition of progress.", body: ["The benefit of time is not permission to avoid measurement. It is the ability to measure the work that actually creates enduring capability.", "Conviction becomes credible when it can explain what should improve, what evidence would challenge the thesis and why the company is worth sustained attention."], articleId: "article-purpose-capital" },
      { id: "sophia-partnership-chapter", number: "02", label: "Partnership", title: "Capital can carry perspective", description: "The investor's role beyond financing.", body: ["A useful partner helps leaders see choices in a wider field without pretending to operate the company for them.", "The work is to bring context, ask questions that sharpen the strategy and remain honest when confidence risks becoming attachment."], articleId: "article-private-markets-financing" },
      { id: "sophia-governance-chapter", number: "03", label: "Governance", title: "Patience requires accountability", description: "Long-term support works best with clear standards.", body: ["Patient ownership is strongest when governance makes learning visible and keeps responsibility connected to evidence.", "Boards and investors create trust when they distinguish temporary volatility from a persistent weakness in the underlying plan."], articleId: "article-boards-long-term-investment" },
      { id: "sophia-transformation-chapter", number: "04", label: "Transformation", title: "Change that survives the announcement", description: "Why operating capability matters more than transformation theatre.", body: ["The most important transformations are often quieter than their launch language.", "They endure because leadership, incentives and the allocation of capital all reinforce the same strategic direction."], articleId: "article-capital-efficient-startups" },
    ],
    principles: [
      { id: "sophia-principle-time", title: "Use time deliberately", description: "A longer horizon should make judgment more rigorous, not less accountable." },
      { id: "sophia-principle-partnership", title: "Stay close to the operating truth", description: "Perspective is useful only when it remains connected to how the company actually works." },
      { id: "sophia-principle-questions", title: "Ask questions that improve the strategy", description: "The best challenge gives leaders greater clarity rather than replacing their responsibility." },
      { id: "sophia-principle-change", title: "Back capability, not theatre", description: "Transformation matters when it changes what an organization can repeatedly do." },
    ],
    highlight: { kind: "editorial-takeaway", text: "Patient capital earns its name only when time is paired with judgment, evidence and the courage to keep asking what the company could become." },
    gallery: [
      { id: "sophia-gallery-capital", articleId: "article-purpose-capital", caption: "The long view: how investors are reconsidering the tyranny of the quarterly horizon." },
      { id: "sophia-gallery-partnership", articleId: "article-private-markets-financing", caption: "Private capital creates new choices—and a deeper responsibility for stewardship." },
      { id: "sophia-gallery-leadership", articleId: "article-50-leaders", caption: "Leadership across institutions, generations and changing markets." },
    ],
  },
  {
    id: "personal-magazine-daniel-kim",
    slug: "daniel-kim",
    personId: "person-daniel-kim",
    coverHeadline: "Engineering the Long Horizon",
    editionLabel: "The Technology Founder's Edition",
    publicationLabel: "Personal Edition · 2026",
    introduction: "A portrait of patient engineering, infrastructure thinking and the leadership required to build consequential technology before the market knows how to value it.",
    editorialOpening: "Technology culture rewards speed, but the systems that change industries are rarely built on speed alone. Daniel Kim's work at Northstar Labs begins with a different rhythm: patient engineering, careful infrastructure and an acceptance that consequential adoption takes longer than a demonstration. This edition explores the founder behind that discipline—the choices involved in building durable computing systems, the relationship between technical depth and commercial judgment, and the leadership challenge of keeping a team ambitious when the most important progress is measured in reliability rather than spectacle.",
    editorialNarrative: [
      "Daniel Kim's story is rooted in infrastructure: the layers of computing, energy, data and enterprise systems that make visible advances possible. Northstar Labs is presented through that lens, as a company concerned with what technology must reliably become before it can disappear into everyday use.",
      "The founder's challenge is to protect technical depth without mistaking complexity for value. Engineering becomes consequential when it connects a difficult system to a real constraint experienced by people, organizations or industries.",
      "That work requires a particular kind of patience. Markets often recognize a technology shift before they understand the infrastructure, operating change and trust required to carry it into production.",
      "Daniel's edition is therefore about the long horizon of innovation: building the underlying capability, choosing the right adoption boundary and leading a team through the distance between an impressive possibility and dependable reality.",
    ],
    themes: [
      { id: "daniel-technology", label: "Technology", href: "/technology" },
      { id: "daniel-ai", label: "Artificial Intelligence", href: "/topic/artificial-intelligence" },
      { id: "daniel-infrastructure", label: "Infrastructure", href: "/search?q=Infrastructure" },
      { id: "daniel-founders", label: "Founders", href: "/topic/founders" },
      { id: "daniel-leadership", label: "Leadership", href: "/leadership" },
    ],
    interviewArticleId: "article-technology-interview-daniel-kim",
    featuredArticleIds: ["article-ai-infrastructure-race", "article-infrastructure-ai-economy", "article-global-computing-capacity", "article-next-software-giants"],
    relatedArticleIds: ["article-enterprise-ai-phase", "article-computing-investment-cycle", "article-ai-data-strategy", "article-capital-efficient-technology-startups"],
    milestones: [
      { id: "daniel-foundation", label: "Technical foundation", title: "Starting with the systems beneath the product", description: "The early perspective centered on infrastructure as the place where computing ambition meets physical and operational reality." },
      { id: "daniel-lab", label: "Building Northstar", title: "Turning patient engineering into a company", description: "The work became organizational: assembling the judgment, tools and standards required to build dependable systems." },
      { id: "daniel-adoption", label: "Consequential adoption", title: "Moving from demonstration to use", description: "The company focused on the boundaries where reliability, economics and trust determine whether technology can enter real operations." },
      { id: "daniel-next", label: "The next layer", title: "Infrastructure for intelligence at scale", description: "The next phase connects compute, energy, enterprise architecture and leadership into a more durable foundation for adoption." },
    ],
    chapters: [
      { id: "daniel-engineering-chapter", number: "01", label: "Engineering", title: "Reliability is part of the idea", description: "Why technical ambition must include the conditions of real use.", body: ["A prototype proves that something can happen. An engineered system proves that it can keep happening under the constraints that matter.", "Daniel's approach treats reliability, cost and operational clarity as part of the invention rather than work to be added after attention arrives."], articleId: "article-infrastructure-ai-economy" },
      { id: "daniel-infrastructure-chapter", number: "02", label: "Infrastructure", title: "The invisible layer becomes strategic", description: "Compute, energy and enterprise systems move to the center.", body: ["Infrastructure determines which ambitions can become ordinary capabilities.", "As intelligence enters more workflows, the systems beneath it become questions of industrial capacity, organizational resilience and strategic independence."], articleId: "article-global-computing-capacity" },
      { id: "daniel-building-chapter", number: "03", label: "Building", title: "A technical company still needs a clear institution", description: "How standards and leadership preserve depth through growth.", body: ["Technical excellence does not automatically produce organizational clarity.", "The founder must connect difficult engineering choices to a shared understanding of the customer, the adoption boundary and the standard the company refuses to compromise."], articleId: "article-next-software-giants" },
      { id: "daniel-horizon-chapter", number: "04", label: "The long horizon", title: "Adoption has its own clock", description: "Why meaningful change often arrives later than the market expects.", body: ["A consequential system must fit into existing operations before it can change them.", "Patience is valuable when it is active: testing assumptions, improving reliability and learning which constraints are technical, economic or institutional."], articleId: "article-ai-infrastructure-race" },
    ],
    principles: [
      { id: "daniel-principle-reliability", title: "Make reliability visible", description: "The most important engineering work is often the work that prevents surprise." },
      { id: "daniel-principle-system", title: "Understand the whole system", description: "A technology becomes useful only when infrastructure, economics and operations can carry it together." },
      { id: "daniel-principle-patience", title: "Let adoption teach the roadmap", description: "Real use reveals which problems matter more clearly than spectacle does." },
      { id: "daniel-principle-depth", title: "Protect technical depth with clarity", description: "Teams stay ambitious when they understand why the difficult standard is strategically necessary." },
    ],
    highlight: { kind: "person-quote", articleId: "article-technology-interview-daniel-kim" },
    gallery: [
      { id: "daniel-gallery-portrait", articleId: "article-technology-interview-daniel-kim", caption: "The Technology Interview: Daniel Kim on patient engineering and consequential adoption." },
      { id: "daniel-gallery-infrastructure", articleId: "article-ai-infrastructure-race", caption: "Infrastructure becomes one of the defining strategic questions of the intelligence economy." },
      { id: "daniel-gallery-systems", articleId: "article-infrastructure-ai-economy", caption: "Compute, energy, capital and data converge beneath modern artificial intelligence." },
    ],
  },
] satisfies readonly PersonalMagazine[];

export const getPersonalMagazineBySlug = (slug: string) => personalMagazines.find((magazine) => magazine.slug === slug);
export const getPersonalMagazineByPersonId = (personId: string) => personalMagazines.find((magazine) => magazine.personId === personId);
export const getPersonalMagazineHrefByPersonId = (personId: string) => {
  const magazine = getPersonalMagazineByPersonId(personId);
  return magazine ? `/personal-magazines/${magazine.slug}` : undefined;
};
