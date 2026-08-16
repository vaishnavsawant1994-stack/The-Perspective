export type PodcastShowConfig = {
  slug: string;
  title: string;
  strapline: string;
  description: string;
  host: string;
  hostRole: string;
  hostImage: string;
  heroImage: string;
  episodes: number;
  cadence: string;
  duration: string;
  topics: string[];
  episodeIds: string[];
  guestNames: string[];
  coverTone: string;
};

export const podcastShows: PodcastShowConfig[] = [
  {
    slug: "the-leadership-dialogues",
    title: "The Leadership Dialogues",
    strapline: "Conversations with leaders shaping business, technology and society.",
    description: "In-depth conversations with visionary leaders, innovators and changemakers about the choices that shape institutions and the future of work.",
    host: "Ananya Mehta",
    hostRole: "Editor-in-Chief, The Perspective",
    hostImage: "/images/authors/ananya-mehta-featured.png",
    heroImage: "/images/authors/ananya-mehta-featured.png",
    episodes: 48,
    cadence: "Weekly",
    duration: "45–60 min",
    topics: ["Leadership", "Business Strategy", "Innovation", "Future of Work", "AI & Technology", "Global Affairs", "Sustainability"],
    episodeIds: ["podcast-building", "podcast-purpose", "podcast-decisions", "podcast-trust", "podcast-mandate"],
    guestNames: ["Arjun Mehta", "Priya Iyer", "Daniel Kim", "Neha Sharma", "Rohit Bansal"],
    coverTone: "#06131a",
  },
  {
    slug: "the-founder-conversations",
    title: "The Founder Conversations",
    strapline: "The candid decisions behind enduring companies.",
    description: "Founders share the choices, setbacks and convictions behind the companies they are building for the long term.",
    host: "Vikram Oberoi",
    hostRole: "Founder & CEO, Envisage",
    hostImage: "/images/articles/marcus-chen.png",
    heroImage: "/images/articles/marcus-chen.png",
    episodes: 39,
    cadence: "Fortnightly",
    duration: "35–55 min",
    topics: ["Founders", "Startups", "Capital", "Culture", "Scale", "Innovation"],
    episodeIds: ["podcast-future", "podcast-building", "podcast-india", "podcast-capital", "podcast-purpose"],
    guestNames: ["Arjun Mehta", "Neha Sharma", "Rohit Bansal", "Kavya Iyer", "Aditya Nanda"],
    coverTone: "#160e0b",
  },
  {
    slug: "markets-decoded",
    title: "Markets Decoded",
    strapline: "Capital, economies and the signals behind the numbers.",
    description: "A clear weekly conversation about markets, investing, policy and the forces reshaping long-term value.",
    host: "Raghav Bahl",
    hostRole: "Economics Editor",
    hostImage: "/images/articles/arjun-mehta.png",
    heroImage: "/images/articles/arjun-mehta.png",
    episodes: 42,
    cadence: "Weekly",
    duration: "30–45 min",
    topics: ["Markets", "Economy", "Investing", "Capital", "Policy", "Global Affairs"],
    episodeIds: ["podcast-markets", "podcast-capital", "podcast-economy", "podcast-building", "podcast-trust"],
    guestNames: ["Neha Sharma", "Rohit Bansal", "Mira Kapoor", "David Owusu", "Arjun Mehta"],
    coverTone: "#0b1720",
  },
  {
    slug: "tech-frontiers",
    title: "Tech Frontiers",
    strapline: "The systems, builders and ideas defining what comes next.",
    description: "Engineers, researchers and executives explain the technologies moving from possibility to infrastructure.",
    host: "Devina Mehta",
    hostRole: "Technology Editor",
    hostImage: "/images/articles/future-leader.png",
    heroImage: "/images/articles/future-leader.png",
    episodes: 37,
    cadence: "Weekly",
    duration: "35–50 min",
    topics: ["Technology", "Artificial Intelligence", "Infrastructure", "Cybersecurity", "Research", "Future of Work"],
    episodeIds: ["podcast-compute", "podcast-decisions", "podcast-purpose", "podcast-india", "podcast-trust"],
    guestNames: ["Daniel Kim", "Kavya Iyer", "Arjun Mehta", "Noor Rahman", "Rohit Bansal"],
    coverTone: "#071322",
  },
  {
    slug: "women-who-lead",
    title: "Women Who Lead",
    strapline: "Stories of influence, institution building and impact.",
    description: "Women across business, technology and public life share the ideas and experiences that shaped their leadership.",
    host: "Nandini K.",
    hostRole: "Editorial Director",
    hostImage: "/images/articles/global-leadership.png",
    heroImage: "/images/articles/global-leadership.png",
    episodes: 31,
    cadence: "Fortnightly",
    duration: "35–55 min",
    topics: ["Women Leaders", "Leadership", "Culture", "Innovation", "Policy", "Entrepreneurship"],
    episodeIds: ["podcast-women", "podcast-purpose", "podcast-trust", "podcast-mandate", "podcast-india"],
    guestNames: ["Priya Iyer", "Neha Sharma", "Kavya Iyer", "Ananya Mehta", "Mira Kapoor"],
    coverTone: "#15101d",
  },
];

export function getPodcastShowBySlug(slug: string) {
  return podcastShows.find((show) => show.slug === slug);
}
