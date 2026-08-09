import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ResolvedPersonalMagazineProfile } from "@/types";
import { PageContainer } from "@/components/layout/page-container";

function OpeningStatement({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  return <div className="bg-[#171612] text-white"><PageContainer className="section-space" width="article"><section aria-labelledby="opening-statement-heading"><p className="eyebrow text-[#e7c785]">Editor’s note</p><h2 className="sr-only" id="opening-statement-heading">Opening editorial statement</h2><p className="mt-6 font-serif text-[clamp(2rem,4.2vw,4.4rem)] leading-[1.03] tracking-[-.035em] text-white/90">{profile.magazine.editorialOpening}</p></section></PageContainer></div>;
}

function StoryAndThemes({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  const { magazine } = profile;
  return <PageContainer className="section-space-lg" width="standard"><section aria-labelledby="personal-magazine-story-heading" className="grid gap-12 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,.65fr)] lg:gap-20" id="the-story">
    <div><p className="eyebrow text-accent">The Story</p><h2 className="type-display-lg mt-5" id="personal-magazine-story-heading">The work behind the public story.</h2><div className="mt-8 max-w-3xl space-y-6 font-serif text-[1.2rem] leading-8 text-[#36342f] sm:text-[1.35rem] sm:leading-9">{magazine.editorialNarrative.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></div>
    <aside aria-labelledby="personal-magazine-themes-heading" className="border-t-2 border-foreground"><p className="type-meta py-4 text-accent">The ideas shaping the journey</p><h3 className="sr-only" id="personal-magazine-themes-heading">Key themes</h3><ol>{magazine.themes.map((theme, index) => <li className="border-t border-border last:border-b" key={theme.id}><Link className="grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 py-3 hover:text-accent" href={theme.href}><span className="font-serif text-xl text-accent">{String(index + 1).padStart(2, "0")}</span><span className="font-serif text-xl">{theme.label}</span><ArrowRight aria-hidden="true" className="size-4" /></Link></li>)}</ol></aside>
  </section></PageContainer>;
}

function MagazineContents({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  const { magazine, interview } = profile;
  const baseItems = [{ label: "The Story", title: magazine.coverHeadline, href: "#the-story" }, ...(interview ? [{ label: "The Interview", title: interview.title, href: "#the-interview" }] : [])];
  const chapterItems = magazine.chapters.map((chapter) => ({ label: chapter.label, title: chapter.title, href: `#chapter-${chapter.id}` }));
  const items = [...baseItems, ...chapterItems, { label: "The Journey", title: "The chapters that shaped the work", href: "#the-journey" }, { label: "Digital Edition", title: "A publication designed for focused reading", href: "#digital-edition" }];
  return <div className="bg-[#eee8dd]" id="contents"><PageContainer className="section-space" width="standard"><section aria-labelledby="personal-magazine-contents-heading" className="grid gap-12 lg:grid-cols-[.55fr_1.45fr] lg:gap-20"><div><p className="eyebrow text-accent">In this edition</p><h2 className="type-display-lg mt-5" id="personal-magazine-contents-heading">Contents</h2><p className="mt-6 max-w-md text-sm leading-6 text-muted">A print-inspired guide to the ideas, decisions and editorial chapters in this Personal Magazine.</p></div><nav aria-label="Personal magazine contents"><ol className="border-t-2 border-foreground">{items.map((item, index) => <li className="border-b border-[#aaa292]" key={`${item.href}-${item.label}`}><Link className="grid min-h-20 grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-4 py-4 hover:text-accent" href={item.href}><span className="font-serif text-2xl text-accent">{String(index + 1).padStart(2, "0")}</span><span><span className="type-meta block text-muted">{item.label}</span><span className="mt-1 block font-serif text-xl sm:text-2xl">{item.title}</span></span><ArrowRight aria-hidden="true" className="size-4" /></Link></li>)}</ol></nav></section></PageContainer></div>;
}

function FeatureInterview({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  const interview = profile.interview;
  if (!interview) return null;
  const author = interview.authors[0];
  return <div className="bg-[#171612] text-white" id="the-interview"><PageContainer className="section-space-lg" width="standard"><section aria-labelledby="personal-magazine-interview-heading" className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-20">
    {interview.heroImage && <Link aria-label={`Read ${interview.title}`} className="relative block aspect-[4/5] overflow-hidden bg-[#292822]" href={`/article/${interview.slug}`}><Image alt={interview.heroImage.alt} className="object-cover" fill sizes="(max-width:1024px) 100vw, 42vw" src={interview.heroImage.src} /></Link>}
    <div><p className="eyebrow text-[#e7c785]">The Interview</p><h2 className="type-display-lg mt-5" id="personal-magazine-interview-heading">{interview.title}</h2><p className="type-deck mt-7 text-white/70">{interview.dek ?? interview.excerpt}</p><p className="type-meta mt-7 text-white/70">By <Link className="text-white underline-offset-4 hover:text-[#e7c785]" href={`/author/${author?.slug}`} style={{ textDecorationLine: "underline" }}>{author?.name ?? "The Perspective"}</Link> · {interview.readingMinutes} min read</p>{profile.person.quote && <blockquote className="mt-9 border-l-2 border-[#e7c785] pl-6 font-serif text-2xl leading-tight text-white/85">“{profile.person.quote}”</blockquote>}<Link className="mt-9 inline-flex min-h-12 items-center gap-2 bg-white px-5 text-sm font-bold text-foreground hover:bg-[#f3e6d0]" href={`/article/${interview.slug}`}>Read Full Interview <ArrowRight aria-hidden="true" className="size-4" /></Link></div>
  </section></PageContainer></div>;
}

function ChapterArticleLink({ profile, articleId }: { profile: ResolvedPersonalMagazineProfile; articleId?: string }) {
  if (!articleId) return null;
  const article = [...profile.featuredArticles, ...profile.relatedArticles].find((candidate) => candidate.id === articleId);
  if (!article) return null;
  return <Link className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-foreground text-sm font-bold hover:text-accent" href={`/article/${article.slug}`}>Related Perspective story <ArrowRight aria-hidden="true" className="size-4" /></Link>;
}

function JourneyAndChapters({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  const { magazine } = profile;
  return <>
    <PageContainer className="section-space-lg" width="standard"><section aria-labelledby="personal-magazine-journey-heading" id="the-journey"><header className="grid gap-6 border-t-2 border-foreground pt-5 lg:grid-cols-[.62fr_1.38fr]"><div><p className="eyebrow text-accent">The Journey</p><h2 className="type-display-lg mt-5" id="personal-magazine-journey-heading">A chronology without the résumé.</h2></div><p className="type-deck max-w-3xl text-muted">The stages are defined by changes in perspective, responsibility and ambition—not by invented dates or ceremonial milestones.</p></header><ol className="mt-12 grid lg:grid-cols-4">{magazine.milestones.map((milestone, index) => <li className="relative border-t border-border px-0 py-7 lg:border-l lg:border-t-0 lg:px-7" key={milestone.id}><span aria-hidden="true" className="absolute -top-1.5 left-0 size-3 rounded-full bg-accent lg:-left-1.5 lg:top-0" /><p className="type-meta text-accent">{String(index + 1).padStart(2, "0")} · {milestone.label}</p><h3 className="mt-5 font-serif text-3xl leading-none">{milestone.title}</h3><p className="mt-5 text-sm leading-6 text-muted">{milestone.description}</p></li>)}</ol></section></PageContainer>
    <div className="bg-surface-subtle"><PageContainer className="section-space-lg" width="standard"><section aria-labelledby="personal-magazine-chapters-heading" id="chapters"><p className="eyebrow text-accent">Chapters</p><h2 className="type-display-lg mt-5" id="personal-magazine-chapters-heading">The ideas, in sequence.</h2><div className="mt-12 border-t-2 border-foreground">{magazine.chapters.map((chapter) => <article className="grid gap-8 border-b border-border py-10 lg:grid-cols-[7rem_minmax(14rem,.65fr)_minmax(0,1.35fr)] lg:gap-12" id={`chapter-${chapter.id}`} key={chapter.id}><p className="font-serif text-5xl text-accent">{chapter.number}</p><div><p className="type-meta text-accent">{chapter.label}</p><h3 className="mt-4 font-serif text-4xl leading-none">{chapter.title}</h3><p className="mt-5 text-sm leading-6 text-muted">{chapter.description}</p><ChapterArticleLink articleId={chapter.articleId} profile={profile} /></div><div className="space-y-5 font-serif text-xl leading-8 text-[#45423b]">{chapter.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></article>)}</div></section></PageContainer></div>
  </>;
}

function IdeasHighlightAndGallery({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  const { magazine, person, gallery } = profile;
  const highlightArticleId = magazine.highlight.kind === "person-quote" ? magazine.highlight.articleId : undefined;
  const sourceArticle = highlightArticleId ? [profile.interview, ...profile.featuredArticles, ...profile.relatedArticles].find((article) => article?.id === highlightArticleId) : undefined;
  return <>
    <PageContainer className="section-space" width="standard"><section aria-labelledby="personal-magazine-ideas-heading" id="ideas"><header className="max-w-4xl"><p className="eyebrow text-accent">Ideas that define the work</p><h2 className="type-display-lg mt-5" id="personal-magazine-ideas-heading">Principles, not slogans.</h2></header><ol className="mt-12 grid gap-7 md:grid-cols-2">{magazine.principles.map((principle, index) => <li className="border-t-2 border-foreground py-7" key={principle.id}><p className="font-serif text-3xl text-accent">{String(index + 1).padStart(2, "0")}</p><h3 className="mt-6 font-serif text-3xl">{principle.title}</h3><p className="mt-4 max-w-xl text-sm leading-6 text-muted">{principle.description}</p></li>)}</ol></section></PageContainer>
    <div className="bg-accent text-white"><PageContainer className="section-space" width="article">{magazine.highlight.kind === "person-quote" ? <figure><p className="eyebrow text-white/75">In their words</p><blockquote><p className="mt-6 font-serif text-[clamp(2.4rem,5vw,5.5rem)] leading-[.98] tracking-[-.04em]">“{person.quote}”</p></blockquote><figcaption className="mt-8 text-sm text-white/80">{person.name}{sourceArticle ? <> · From <Link className="border-b border-white" href={`/article/${sourceArticle.slug}`}>{sourceArticle.title}</Link></> : null}</figcaption></figure> : <aside aria-labelledby="personal-magazine-takeaway-heading"><p className="eyebrow text-white/75">Editorial takeaway</p><h2 className="sr-only" id="personal-magazine-takeaway-heading">Editorial takeaway</h2><p className="mt-6 font-serif text-[clamp(2.4rem,5vw,5.5rem)] leading-[.98] tracking-[-.04em]">{magazine.highlight.text}</p></aside>}</PageContainer></div>
    <PageContainer className="section-space-lg" width="standard"><section aria-labelledby="personal-magazine-gallery-heading" id="gallery"><header className="grid gap-6 border-t-2 border-foreground pt-5 lg:grid-cols-[.62fr_1.38fr]"><div><p className="eyebrow text-accent">In Pictures</p><h2 className="type-display-lg mt-5" id="personal-magazine-gallery-heading">The editorial world around the story.</h2></div><p className="type-deck max-w-3xl text-muted">Existing Perspective imagery connects the person, their field and the wider ideas explored throughout this edition.</p></header><div className="mt-12 grid gap-6 md:grid-cols-2">{gallery.map((item, index) => <figure className={index === 0 ? "md:col-span-2" : ""} key={item.id}><div className={index === 0 ? "relative aspect-[16/8] overflow-hidden bg-surface-subtle" : "relative aspect-[4/3] overflow-hidden bg-surface-subtle"}><Image alt={item.image.alt} className="object-cover" fill sizes={index === 0 ? "(max-width:1360px) 100vw, 1360px" : "(max-width:768px) 100vw, 50vw"} src={item.image.src} /></div><figcaption className="mt-4 max-w-2xl text-sm leading-6 text-muted">{item.caption}</figcaption></figure>)}</div></section></PageContainer>
  </>;
}

export function PersonalMagazineEditorial({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  return <>
    <OpeningStatement profile={profile} />
    <StoryAndThemes profile={profile} />
    <MagazineContents profile={profile} />
    <FeatureInterview profile={profile} />
    <JourneyAndChapters profile={profile} />
    <IdeasHighlightAndGallery profile={profile} />
  </>;
}
