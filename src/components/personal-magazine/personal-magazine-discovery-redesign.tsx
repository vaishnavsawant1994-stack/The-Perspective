import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CircleDollarSign,
  Cpu,
  Factory,
  GraduationCap,
  HeartPulse,
  Home,
  Search,
  Sparkles,
} from "lucide-react";
import { PersonalMagazineCover } from "@/components/magazine/personal-magazine-cover";
import { personalMagazineListing } from "@/data/mock/personal-magazine-listing";
import type {
  ImageAsset,
  PersonProfile,
  ResolvedPersonalMagazineSummary,
} from "@/types";
import styles from "./personal-magazine-discovery-redesign.module.css";

type DiscoveryProfile = {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string;
  image: ImageAsset;
  href: string;
  coverTitle: string;
  tag?: string;
};

const fallbackPeople: DiscoveryProfile[] = [
  [
    "neha-sharma",
    "Neha Sharma",
    "CEO",
    "Globalian",
    "Business",
    "/images/articles/elena-rossi.png",
    "Women Who Build",
  ],
  [
    "rohit-bansal",
    "Rohit Bansal",
    "Founder & Managing Partner",
    "Kairos Capital",
    "Investment",
    "/images/articles/marcus-chen.png",
    "Capital With Conviction",
  ],
  [
    "kavya-iyer",
    "Dr. Kavya Iyer",
    "Founder & CEO",
    "BioNova Labs",
    "Healthcare",
    "/images/authors/ananya-mehta-featured.png",
    "Science With Purpose",
  ],
  [
    "vikram-menon",
    "Vikram Menon",
    "Chairman",
    "Menon Group",
    "Real Estate",
    "/images/articles/daniel-kim.png",
    "Building Across Generations",
  ],
  [
    "sameer-agarwal",
    "Sameer Agarwal",
    "Co-Founder & CEO",
    "Finixia",
    "Finance",
    "/images/articles/marcus-chen.png",
    "The Builder's Discipline",
  ],
  [
    "meera-rao",
    "Meera Rao",
    "Founder",
    "GreenOrbit",
    "Sustainability",
    "/images/articles/elena-rossi.png",
    "A Greener Horizon",
  ],
  [
    "aditya-nanda",
    "Aditya Nanda",
    "CEO",
    "CloudOrbit",
    "Technology",
    "/images/articles/daniel-kim.png",
    "Engineering Global Scale",
  ],
  [
    "priya-subramanian",
    "Priya Subramanian",
    "Managing Director",
    "Subra Group",
    "Real Estate",
    "/images/authors/ananya-mehta-featured.png",
    "Leading With Clarity",
  ],
  [
    "rahul-deshpande",
    "Rahul Deshpande",
    "Founder & CEO",
    "InnoviaDrive",
    "Automotive",
    "/images/articles/arjun-mehta.png",
    "Industry Reimagined",
  ],
].map(([id, name, title, company, industry, src, coverTitle], index) => ({
  id,
  name,
  title,
  company,
  industry,
  coverTitle,
  href: `/search?q=${encodeURIComponent(name)}`,
  image: {
    src,
    alt: `${name}, ${title} at ${company}`,
    width: 1024,
    height: 1536,
  },
  tag: index === 0 || index === 5 ? "New" : index === 8 ? "Premium" : undefined,
})) as DiscoveryProfile[];

function fromEdition(
  edition: ResolvedPersonalMagazineSummary,
): DiscoveryProfile {
  return {
    id: edition.magazine.id,
    name: edition.person.name,
    title: edition.person.title ?? "Leader",
    company: edition.person.company ?? "Independent",
    industry: edition.person.expertise[0] ?? "Leadership",
    image: edition.coverImage ?? {
      src: "/images/articles/arjun-mehta.png",
      alt: edition.person.name,
      width: 1024,
      height: 1536,
    },
    href: `/personal-magazines/${edition.magazine.slug}`,
    coverTitle: edition.magazine.coverHeadline,
    tag: edition.magazine.slug === "arjun-mehta" ? "Featured" : undefined,
  };
}

function DiscoveryCover({
  profile,
  index,
}: {
  profile: DiscoveryProfile;
  index: number;
}) {
  const person: PersonProfile = {
    id: profile.id,
    name: profile.name,
    slug: profile.id,
    headline: profile.coverTitle,
    biography: `${profile.name} is featured in The Perspective Personal Magazine collection.`,
    portrait: profile.image,
    expertise: [profile.industry],
    title: profile.title,
    company: profile.company,
  };
  return (
    <article className={styles.profileCard}>
      <div>
        {profile.tag ? <b>{profile.tag}</b> : null}
        <PersonalMagazineCover
          className="sm:mt-0"
          coverHeadline={profile.coverTitle}
          coverImage={profile.image}
          editionLabel="Personal Magazine"
          href={profile.href}
          index={index % 3}
          person={person}
        />
      </div>
      <h3>
        <Link href={profile.href}>{profile.name}</Link>
      </h3>
      <p>{profile.title}</p>
      <span>{profile.company}</span>
      <small>{profile.industry}</small>
    </article>
  );
}

export function PersonalMagazineDiscoveryRedesign({
  editions,
}: {
  editions: readonly ResolvedPersonalMagazineSummary[];
}) {
  const canonical = editions.map(fromEdition);
  const featured = [
    canonical[0],
    fallbackPeople[0],
    canonical[1],
    fallbackPeople[1],
    canonical[2],
  ].filter(Boolean) as DiscoveryProfile[];
  const latest = fallbackPeople.slice(2, 7);
  const hero = canonical[0];
  if (!hero) return null;
  const industries = [
    [Cpu, "Technology", "128 Magazines"],
    [BriefcaseBusiness, "Business & Management", "156 Magazines"],
    [CircleDollarSign, "Finance", "82 Magazines"],
    [HeartPulse, "Healthcare", "74 Magazines"],
    [Factory, "Manufacturing", "68 Magazines"],
    [Home, "Real Estate", "61 Magazines"],
    [GraduationCap, "Education", "49 Magazines"],
    [Sparkles, "Energy", "37 Magazines"],
  ] as const;
  const collections = [
    [
      "Top Founders",
      "Trailblazers building tomorrow's companies",
      "76 Magazines",
      "/images/articles/board-governance.png",
    ],
    [
      "Women Leaders",
      "Women redefining leadership and impact",
      "62 Magazines",
      "/images/articles/elena-rossi.png",
    ],
    [
      "Global Visionaries",
      "Leaders with a global perspective",
      "58 Magazines",
      "/images/articles/global-growth.png",
    ],
    [
      "Disruptors & Innovators",
      "Challenging the status quo and creating change",
      "71 Magazines",
      "/images/articles/ai-infrastructure.png",
    ],
    [
      "Next Gen Leaders",
      "The next generation of extraordinary leaders",
      "43 Magazines",
      "/images/articles/future-leader.png",
    ],
  ] as const;

  return (
    <div className={styles.page}>
      <section
        aria-labelledby="discovery-redesign-heading"
        className={styles.hero}
      >
        <div className={styles.heroCopy}>
          <p>Personal Magazines</p>
          <h1 id="discovery-redesign-heading">
            Extraordinary People.
            <br />
            Stories Worth Preserving.
          </h1>
          <span>
            Discover personal magazines featuring founders, executives,
            investors and leaders whose journeys, ideas and achievements are
            shaping industries around the world.
          </span>
          <div>
            <Link href={hero.href}>View featured magazine</Link>
            <Link href={hero.href}>Read profile</Link>
            <Link href="/personal-magazines/create">Create your magazine</Link>
          </div>
        </div>
        <div className={styles.heroArt}>
          <div className={styles.heroPerson}>
            <Image
              alt={hero.image.alt}
              fill
              priority
              sizes="450px"
              src={hero.image.src}
            />
          </div>
          <div className={styles.heroCover}>
            <PersonalMagazineCover
              coverHeadline={hero.coverTitle}
              coverImage={hero.image}
              editionLabel="Personal Magazine"
              href={hero.href}
              index={0}
              person={{
                id: hero.id,
                name: hero.name,
                slug: hero.id,
                headline: hero.coverTitle,
                biography: "",
                portrait: hero.image,
                expertise: [hero.industry],
                title: hero.title,
                company: hero.company,
              }}
              priority
            />
          </div>
        </div>
        <aside>
          <p>Featured edition</p>
          <h2>{hero.name}</h2>
          <b>
            {hero.title}
            <br />
            {hero.company}
          </b>
          <span>
            An exclusive look inside the vision, leadership and innovation
            driving a global institution.
          </span>
          <Link href={hero.href}>
            View magazine <ArrowRight aria-hidden="true" />
          </Link>
          <div>
            <p>
              <BookIcon /> <strong>1</strong> Exclusive issue
            </p>
            <p>
              <FileIcon /> <strong>92</strong> Pages
            </p>
            <p>
              <LibraryIcon /> <strong>8</strong> Chapters
            </p>
          </div>
        </aside>
      </section>

      <section
        aria-labelledby="discover-personal-heading"
        className={styles.discoveryBar}
      >
        <h2 id="discover-personal-heading">Discover personal magazines</h2>
        <form action="/personal-magazines" method="get" role="search">
          <Search aria-hidden="true" />
          <input
            aria-label="Search Personal Magazines"
            name="q"
            placeholder="Search leaders, companies, industries or magazines…"
            type="search"
          />
          <button type="submit">Search</button>
        </form>
        <div className={styles.filters}>
          {[
            "All",
            "Founders",
            "CEOs",
            "Investors",
            "Technology",
            "Finance",
            "Healthcare",
            "Women Leaders",
            "Global Leaders",
          ].map((label) => (
            <Link
              className={label === "All" ? styles.activeFilter : ""}
              href={
                label === "All"
                  ? "/personal-magazines"
                  : `/personal-magazines?q=${encodeURIComponent(label)}`
              }
              key={label}
            >
              {label}
            </Link>
          ))}
          <select aria-label="Sort magazines" defaultValue="latest">
            <option value="latest">Latest</option>
            <option value="popular">Most popular</option>
          </select>
          <select aria-label="Filter by region" defaultValue="all">
            <option value="all">All regions</option>
            <option>India</option>
            <option>Global</option>
          </select>
        </div>
      </section>

      <section className={styles.catalogue}>
        <main>
          <section>
            <h2>Featured leaders</h2>
            <div className={styles.profileGrid}>
              {featured.map((profile, index) => (
                <DiscoveryCover
                  index={index}
                  key={profile.id}
                  profile={profile}
                />
              ))}
            </div>
          </section>
          <section>
            <h2>Latest personal magazines</h2>
            <div className={styles.profileGrid}>
              {latest.map((profile, index) => (
                <DiscoveryCover
                  index={index}
                  key={profile.id}
                  profile={profile}
                />
              ))}
            </div>
          </section>
        </main>
        <aside>
          <section>
            <h2>Explore by industry</h2>
            {industries.map(([Icon, label, count]) => (
              <Link
                href={`/personal-magazines?q=${encodeURIComponent(label)}`}
                key={label}
              >
                <Icon aria-hidden="true" />
                <span>
                  <b>{label}</b>
                  <small>{count}</small>
                </span>
              </Link>
            ))}
            <Link
              className={styles.allLink}
              href="#original-personal-magazine-content"
            >
              View all industries <ArrowRight aria-hidden="true" />
            </Link>
          </section>
          <section>
            <h2>Trending magazines</h2>
            {featured.map((profile, index) => (
              <Link href={profile.href} key={profile.id}>
                <strong>{String(index + 1).padStart(2, "0")}</strong>
                <Image alt="" height={46} src={profile.image.src} width={38} />
                <span>
                  <b>{profile.name}</b>
                  <small>
                    {profile.company}
                    <br />
                    {profile.industry}
                  </small>
                </span>
              </Link>
            ))}
            <Link
              className={styles.allLink}
              href="#original-personal-magazine-content"
            >
              View full trending list <ArrowRight aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </section>

      <section className={styles.collectionsCreate}>
        <div>
          <h2>Curated collections</h2>
          <div>
            {collections.map(([title, description, count, image]) => (
              <Link
                href={`/personal-magazines?q=${encodeURIComponent(title)}`}
                key={title}
              >
                <span>
                  <Image alt="" fill sizes="230px" src={image} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
                <b>{count}</b>
              </Link>
            ))}
          </div>
        </div>
        <aside id="create-personal-magazine">
          <p>Create your personal magazine</p>
          <h2>
            Your Story.
            <br />
            Your Legacy.
            <br />
            Your Magazine.
          </h2>
          <span>
            We design and publish exclusive magazines that showcase your
            journey, leadership and impact.
          </span>
          <Link href="/personal-magazines/create">Create your magazine</Link>
          <div>
            <Image
              alt={hero.image.alt}
              fill
              sizes="180px"
              src={hero.image.src}
            />
          </div>
        </aside>
      </section>

      <section className={styles.processFaq} id="how-personal-magazines-work">
        <article>
          <h2>How personal magazines work</h2>
          <ol>
            {personalMagazineListing.process.slice(0, 4).map((step, index) => (
              <li key={step.id}>
                <span>{index + 1}</span>
                <ArrowRight aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        </article>
        <article>
          <h2>Frequently asked questions</h2>
          {personalMagazineListing.faqs.slice(0, 5).map((faq) => (
            <details key={faq.id}>
              <summary>
                {faq.question}
                <span>+</span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
          <Link href="#original-personal-magazine-content">
            View all FAQs <ArrowRight aria-hidden="true" />
          </Link>
        </article>
        <blockquote>
          <p>
            “The Perspective team captured my journey with incredible depth and
            creativity. A magazine I’m truly proud to share.”
          </p>
          <div>
            <Image
              alt={hero.image.alt}
              height={64}
              src={hero.image.src}
              width={52}
            />
            <span>
              <b>— {hero.name}</b>
              <small>
                {hero.title}, {hero.company}
              </small>
            </span>
          </div>
        </blockquote>
      </section>

      <section
        aria-labelledby="original-personal-heading"
        className={styles.originalIntro}
      >
        <p>Complete Personal Magazine collection</p>
        <h2 id="original-personal-heading">
          Original discovery and editorial experience
        </h2>
        <span>
          The existing Personal Magazines design, searchable collection, full
          process, selected stories and complete FAQs continue below.
        </span>
      </section>
      <div id="original-personal-magazine-content" />
    </div>
  );
}

function BookIcon() {
  return <BookOpenIcon />;
}
function FileIcon() {
  return <FileTextIcon />;
}
function LibraryIcon() {
  return <LibraryBooksIcon />;
}
function BookOpenIcon() {
  return <span aria-hidden="true">▤</span>;
}
function FileTextIcon() {
  return <span aria-hidden="true">□</span>;
}
function LibraryBooksIcon() {
  return <span aria-hidden="true">▥</span>;
}
