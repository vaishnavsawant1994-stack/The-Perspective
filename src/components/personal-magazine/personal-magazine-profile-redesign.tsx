import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  Clock3,
  Download,
  FileText,
  Globe2,
  GraduationCap,
  Lightbulb,
  Mail,
  MapPin,
  Play,
  Quote,
  Sparkles,
  Users,
} from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { PersonalMagazineCover } from "@/components/magazine/personal-magazine-cover";
import type { Article, ResolvedPersonalMagazineProfile } from "@/types";
import styles from "./personal-magazine-profile-redesign.module.css";

function articleHref(article: Article) {
  return `/article/${article.slug}`;
}

function StoryRow({ article }: { article: Article }) {
  return (
    <Link className={styles.storyRow} href={articleHref(article)}>
      {article.heroImage ? (
        <span>
          <Image
            alt={article.heroImage.alt}
            fill
            sizes="100px"
            src={article.heroImage.src}
          />
        </span>
      ) : null}
      <div>
        <h3>{article.title}</h3>
        <p>{article.excerpt}</p>
      </div>
    </Link>
  );
}

export function PersonalMagazineProfileRedesign({
  profile,
}: {
  profile: ResolvedPersonalMagazineProfile;
}) {
  const { person, magazine } = profile;
  const heroImage = person.portrait ?? profile.coverImage;
  const interviewImage = profile.interview?.heroImage ?? heroImage;
  const chapters = [
    ...magazine.chapters,
    ...profile.featuredArticles.slice(0, 2).map((article, index) => ({
      id: `featured-${article.id}`,
      number: String(magazine.chapters.length + index + 1).padStart(2, "0"),
      label: article.subcategory ?? article.category.name,
      title: article.title,
      description: article.excerpt,
      body: [] as string[],
      articleId: article.id,
    })),
  ];
  const location =
    person.slug === "arjun-mehta"
      ? "Mumbai, India"
      : person.slug === "daniel-kim"
        ? "Seoul · San Francisco"
        : "London · New York";
  const experience =
    person.slug === "arjun-mehta"
      ? "25+ years"
      : person.slug === "daniel-kim"
        ? "18+ years"
        : "20+ years";
  const education =
    person.slug === "arjun-mehta"
      ? "IIT Bombay · Stanford GSB"
      : person.slug === "daniel-kim"
        ? "KAIST · MIT"
        : "Oxford · Harvard Business School";
  const milestoneYears = ["1999", "2005", "2012", "2020"];
  const featureImages = chapters.map((chapter) => {
    const article = [
      ...profile.featuredArticles,
      ...profile.relatedArticles,
    ].find((item) => item.id === chapter.articleId);
    return (
      article?.heroImage ??
      profile.gallery[
        Number(chapter.number) % Math.max(profile.gallery.length, 1)
      ]?.image ??
      heroImage
    );
  });

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link href="/">Home</Link>
        <span>/</span>
        <Link href="/personal-magazines">Personal Magazines</Link>
        <span>/</span>
        <b>{person.name}</b>
      </div>

      <section
        aria-labelledby="profile-redesign-heading"
        className={styles.hero}
      >
        <div className={styles.heroCopy}>
          <p>Personal Magazine</p>
          <h1 id="profile-redesign-heading">{person.name}</h1>
          <h2>
            {person.title}
            {person.company ? `, ${person.company}` : ""}
          </h2>
          <h3>{magazine.coverHeadline}</h3>
          <span>{magazine.introduction}</span>
          <div>
            <Link href="#digital-personal-magazine">Read digital magazine</Link>
            <Link href="#personal-story">Explore his story</Link>
            <Link href="/personal-magazines/create">Create your magazine</Link>
          </div>
        </div>
        <div className={styles.heroPortrait}>
          {heroImage ? (
            <Image
              alt={heroImage.alt}
              fill
              priority
              sizes="500px"
              src={heroImage.src}
            />
          ) : null}
          <i />
        </div>
        <div className={styles.heroPublication}>
          <div className={styles.cover}>
            <PersonalMagazineCover
              coverHeadline={magazine.coverHeadline}
              coverImage={profile.coverImage}
              editionLabel={magazine.editionLabel}
              index={0}
              person={person}
              priority
            />
          </div>
          <div className={styles.openPage}>
            <small>A letter from</small>
            <h2>{person.name}</h2>
            <p>{magazine.editorialOpening.slice(0, 215)}…</p>
            {heroImage ? (
              <span>
                <Image alt="" fill sizes="180px" src={heroImage.src} />
              </span>
            ) : null}
          </div>
        </div>
        <aside>
          <h2>Profile at a glance</h2>
          <dl>
            <div>
              <BriefcaseBusiness aria-hidden="true" />
              <dt>Role</dt>
              <dd>
                {person.title}
                <br />
                {person.company}
              </dd>
            </div>
            <div>
              <Building2 aria-hidden="true" />
              <dt>Industry</dt>
              <dd>{person.expertise[0]}</dd>
            </div>
            <div>
              <Clock3 aria-hidden="true" />
              <dt>Experience</dt>
              <dd>{experience}</dd>
            </div>
            <div>
              <MapPin aria-hidden="true" />
              <dt>Headquarters</dt>
              <dd>{location}</dd>
            </div>
            <div>
              <Lightbulb aria-hidden="true" />
              <dt>Focus areas</dt>
              <dd>{person.expertise.join(" · ")}</dd>
            </div>
            <div>
              <GraduationCap aria-hidden="true" />
              <dt>Education</dt>
              <dd>{education}</dd>
            </div>
          </dl>
          <Link href="/personal-magazines">
            Download media kit <Download aria-hidden="true" />
          </Link>
        </aside>
      </section>

      <section aria-label="Magazine facts" className={styles.stats}>
        {[
          [BookOpen, "1", "Exclusive issue"],
          [FileText, "92", "Pages"],
          [BookOpen, String(chapters.length), "Chapters"],
          [Award, "12+", "Feature stories"],
          [Users, "5", "In-depth interviews"],
          [Sparkles, experience, "Years of leadership"],
        ].map(([Icon, value, label]) => {
          const ItemIcon = Icon as typeof BookOpen;
          return (
            <article key={label as string}>
              <ItemIcon aria-hidden="true" />
              <div>
                <b>{value as string}</b>
                <span>{label as string}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className={styles.storyJourney} id="personal-story">
        <article>
          <p>The story</p>
          <h2>Why this magazine exists</h2>
          <span>{magazine.editorialOpening}</span>
          <em>{person.name}</em>
          <b>{person.name}</b>
          <small>
            {person.title}, {person.company}
          </small>
        </article>
        <article>
          <p>Leadership journey</p>
          <ol>
            {magazine.milestones.map((milestone, index) => (
              <li key={milestone.id}>
                <b>{milestoneYears[index] ?? String(2020 + index)}</b>
                <span>
                  <strong>{milestone.title}</strong>
                  {milestone.description}
                </span>
              </li>
            ))}
          </ol>
        </article>
        <article className={styles.interview}>
          <p>Featured interview</p>
          <Link
            href={
              profile.interview
                ? articleHref(profile.interview)
                : "#personal-story"
            }
          >
            <span>
              {interviewImage ? (
                <Image
                  alt={interviewImage.alt}
                  fill
                  sizes="520px"
                  src={interviewImage.src}
                />
              ) : null}
              <i>
                <Play aria-hidden="true" />
              </i>
            </span>
            <small>Exclusive interview</small>
            <h2>
              {profile.interview?.title ??
                `In conversation with ${person.name}`}
            </h2>
            <p>{profile.interview?.excerpt ?? person.biography}</p>
            <b>Watch interview</b>
          </Link>
        </article>
      </section>

      <section
        aria-labelledby="inside-magazine-heading"
        className={styles.insideMagazine}
      >
        <aside>
          <p>Key achievements</p>
          {magazine.principles.map((principle, index) => {
            const Icon = [Award, BookOpen, Globe2, Building2][index] ?? Award;
            return (
              <article key={principle.id}>
                <Icon aria-hidden="true" />
                <div>
                  <h3>{principle.title}</h3>
                  <span>{principle.description}</span>
                </div>
              </article>
            );
          })}
          <Link href="#related-profile-stories">
            View full profile <ArrowRight aria-hidden="true" />
          </Link>
        </aside>
        <div>
          <header>
            <h2 id="inside-magazine-heading">Inside this magazine</h2>
            <span>
              {chapters.length} chapters documenting one defining journey.
            </span>
          </header>
          <div className={styles.chapterGrid}>
            {chapters.map((chapter, index) => (
              <article key={chapter.id}>
                {featureImages[index] ? (
                  <span>
                    <Image
                      alt={featureImages[index]?.alt ?? ""}
                      fill
                      sizes="210px"
                      src={featureImages[index]!.src}
                    />
                  </span>
                ) : null}
                <b>{chapter.number}</b>
                <h3>{chapter.title}</h3>
                <p>{chapter.description}</p>
              </article>
            ))}
          </div>
          <Link
            className={styles.contentsLink}
            href="#original-profile-content"
          >
            View full table of contents <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className={styles.galleryStories}>
        <article>
          <header>
            <h2>Featured stories from this issue</h2>
            <Link href="#original-profile-content">
              View all stories <ArrowRight aria-hidden="true" />
            </Link>
          </header>
          {profile.featuredArticles.slice(0, 4).map((article) => (
            <StoryRow article={article} key={article.id} />
          ))}
        </article>
        <article>
          <header>
            <h2>Image gallery</h2>
            <Link href="#original-profile-content">
              View full gallery <ArrowRight aria-hidden="true" />
            </Link>
          </header>
          <div>
            {profile.gallery
              .concat(profile.gallery)
              .slice(0, 6)
              .map((item, index) => (
                <Link
                  href={articleHref(item.article)}
                  key={`${item.id}-${index}`}
                >
                  <Image
                    alt={item.image.alt}
                    fill
                    sizes="180px"
                    src={item.image.src}
                  />
                </Link>
              ))}
          </div>
        </article>
        <blockquote>
          <Quote aria-hidden="true" />
          <p>
            “
            {(person.quote ?? magazine.highlight.kind === "editorial-takeaway")
              ? magazine.highlight.kind === "editorial-takeaway"
                ? magazine.highlight.text
                : "A meaningful story gives the future a clearer direction."
              : person.quote}
            ”
          </p>
          <cite>— {person.name}</cite>
          <span>● ○ ○ ○</span>
        </blockquote>
      </section>

      <section
        className={styles.relatedConversion}
        id="related-profile-stories"
      >
        <article>
          <header>
            <h2>Related coverage</h2>
            <Link href="#original-profile-content">
              View all coverage <ArrowRight aria-hidden="true" />
            </Link>
          </header>
          {profile.relatedArticles.slice(0, 3).map((article) => (
            <StoryRow article={article} key={article.id} />
          ))}
        </article>
        <article>
          <header>
            <h2>More personal magazines</h2>
            <Link href="/personal-magazines">
              View all <ArrowRight aria-hidden="true" />
            </Link>
          </header>
          <div>
            {profile.relatedProfiles.map((related) => (
              <Link
                href={`/personal-magazines/${related.magazine.slug}`}
                key={related.magazine.id}
              >
                {related.coverImage ? (
                  <span>
                    <Image
                      alt={related.coverImage.alt}
                      fill
                      sizes="180px"
                      src={related.coverImage.src}
                    />
                  </span>
                ) : null}
                <h3>{related.person.name}</h3>
                <p>{related.person.title}</p>
                <small>{related.magazine.editionLabel}</small>
              </Link>
            ))}
          </div>
        </article>
        <aside>
          <p>Your story. Your legacy.</p>
          <h2>Your Personal Magazine.</h2>
          <span>
            We design and publish exclusive magazines that showcase your
            journey, leadership and impact to the world.
          </span>
          <Link href="/personal-magazines/create">Create your magazine</Link>
          {heroImage ? (
            <div>
              <Image alt="" fill sizes="170px" src={heroImage.src} />
            </div>
          ) : null}
        </aside>
      </section>

      <section className={styles.digitalCta} id="digital-personal-magazine">
        <div className={styles.ctaCovers}>
          <PersonalMagazineCover
            coverHeadline={magazine.coverHeadline}
            coverImage={profile.coverImage}
            editionLabel={magazine.editionLabel}
            index={0}
            person={person}
          />
          {profile.relatedProfiles.slice(0, 1).map((related) => (
            <PersonalMagazineCover
              coverHeadline={related.magazine.coverHeadline}
              coverImage={related.coverImage}
              editionLabel={related.magazine.editionLabel}
              index={0}
              key={related.magazine.id}
              person={related.person}
            />
          ))}
        </div>
        <div>
          <p>Showcase your story.</p>
          <h2>Inspire the world.</h2>
          <span>
            Join leaders, innovators and changemakers who have published their
            Personal Magazine with The Perspective.
          </span>
          <Link href="/personal-magazines">Get started today</Link>
        </div>
        <ul>
          {[
            [
              Sparkles,
              "Exclusive Editorial",
              "Your story told with depth and authenticity.",
            ],
            [
              BookOpen,
              "Premium Design",
              "Beautiful print and digital magazine experiences.",
            ],
            [
              Globe2,
              "Global Reach",
              "Showcase your journey to influential audiences.",
            ],
            [
              Award,
              "Lasting Legacy",
              "A timeless record of your work and impact.",
            ],
          ].map(([Icon, title, copy]) => {
            const I = Icon as typeof Sparkles;
            return (
              <li key={title as string}>
                <I aria-hidden="true" />
                <b>{title as string}</b>
                <span>{copy as string}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.profileBriefing}>
        <div>
          <Mail aria-hidden="true" />
          <h2>The Perspective Briefing</h2>
          <p>
            Get stories, interviews and exclusive insights delivered every week.
          </p>
        </div>
        <NewsletterForm
          buttonLabel="Subscribe"
          label="Personal Magazine briefing"
          theme="light"
        />
      </section>

      <section
        aria-labelledby="original-profile-heading"
        className={styles.originalIntro}
      >
        <p>Complete personal edition</p>
        <h2 id="original-profile-heading">
          The original {person.name} magazine experience
        </h2>
        <span>
          The existing long-form story, chapter detail, principles, related
          coverage and full collection continue below.
        </span>
      </section>
      <div id="original-profile-content" />
    </div>
  );
}
