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
  discoveryOnly = false,
}: {
  editions: readonly ResolvedPersonalMagazineSummary[];
  discoveryOnly?: boolean;
}) {
  const canonical = editions.map(fromEdition);
  const featured = canonical.slice(0, 5);
  const latest = canonical.slice(5, 10);
  const hero = canonical[0];
  if (!hero) return null;
  const industryIcons = new Map<string, typeof Cpu>([
    ["Technology", Cpu],
    ["Finance", CircleDollarSign],
    ["Healthcare", HeartPulse],
    ["Industrial Strategy", Factory],
    ["Education", GraduationCap],
    ["Artificial Intelligence", Sparkles],
    ["Global Business", BriefcaseBusiness],
    ["Entrepreneurship", BriefcaseBusiness],
  ]);
  const industries = Array.from(
    new Set(canonical.map((edition) => edition.industry)),
  ).map((label) => [industryIcons.get(label) ?? BriefcaseBusiness, label] as const);
  const collections = [
    [
      "Top Founders",
      "Trailblazers building tomorrow's companies",
      "/images/articles/board-governance.png",
    ],
    [
      "Women Leaders",
      "Women redefining leadership and impact",
      "/images/articles/elena-rossi.png",
    ],
    [
      "Global Visionaries",
      "Leaders with a global perspective",
      "/images/articles/global-growth.png",
    ],
    [
      "Disruptors & Innovators",
      "Challenging the status quo and creating change",
      "/images/articles/ai-infrastructure.png",
    ],
    [
      "Next Gen Leaders",
      "The next generation of extraordinary leaders",
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
          Read the published profile and explore the stories and ideas in this
          edition.
        </span>
          <Link href={hero.href}>
            View magazine <ArrowRight aria-hidden="true" />
          </Link>
          <div>
            <p>Explore the published edition and its verified stories.</p>
          </div>
        </aside>
      </section>

      <section
        aria-labelledby="discover-personal-heading"
        className={styles.discoveryBar}
      >
        <h2 id="discover-personal-heading">Discover personal magazines</h2>
        {!discoveryOnly ? (
          <Link href="/personal-magazines/discover">Open the discovery catalogue</Link>
        ) : null}
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
          {latest.length > 0 ? (
            <section>
              <h2>More personal magazines</h2>
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
          ) : null}
        </main>
        <aside>
          <section>
            <h2>Explore by industry</h2>
            {industries.map(([Icon, label]) => (
              <Link
                href={`/personal-magazines?q=${encodeURIComponent(label)}`}
                key={label}
              >
                <Icon aria-hidden="true" />
                <span>
                  <b>{label}</b>
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
            <h2>Published editions</h2>
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
            {collections.map(([title, description, image]) => (
              <Link
                href={`/personal-magazines?q=${encodeURIComponent(title)}`}
                key={title}
              >
                <span>
                  <Image alt="" fill sizes="230px" src={image} />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
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
      </section>

      <section
        aria-labelledby="original-personal-heading"
        className={styles.originalIntro}
        id="original-personal-magazine-content"
      >
        <p>Explore the Personal Magazine collection</p>
        <h2 id="original-personal-heading">
          Original discovery and editorial experience
        </h2>
        <span>
          Search the collection or browse the editorial process, selected
          stories and frequently asked questions.
        </span>
      </section>
    </div>
  );
}
