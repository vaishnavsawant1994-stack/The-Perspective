import Link from "next/link";
import type { AuthorProfileData } from "@/types";
import { PageContainer } from "@/components/layout/page-container";
import { Avatar } from "@/components/ui/avatar";

const initialsFor = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2);

export function AuthorProfileHeader({ profile }: { profile: AuthorProfileData }) {
  const { author, articles } = profile;

  return <PageContainer className="pb-10 pt-10 sm:pb-14 sm:pt-14 lg:pb-18 lg:pt-18" width="standard">
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <li><Link className="hover:text-accent" href="/">Home</Link></li>
        <li aria-hidden="true">/</li>
        <li><Link className="hover:text-accent" href="/perspective">The Perspective</Link></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{author.name}</li>
      </ol>
    </nav>
    <header className="mt-8 grid gap-8 border-b border-foreground pb-10 md:grid-cols-[11rem_minmax(0,1fr)] md:items-center md:gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14 lg:pb-14">
      <Avatar alt={`Portrait of ${author.name}`} className="size-36 rounded-none bg-foreground font-serif text-4xl text-white md:size-44 lg:size-56 lg:text-5xl" decorative={!author.avatar} initials={initialsFor(author.name)} sizes="(max-width: 767px) 144px, (max-width: 1023px) 176px, 224px" src={author.avatar?.src} />
      <div className="max-w-4xl">
        <p className="eyebrow text-accent">Contributor Profile</p>
        <h1 className="type-display-lg mt-4">{author.name}</h1>
        {author.role && <p className="mt-4 font-serif text-xl text-muted sm:text-2xl">{author.role} &amp; Contributor</p>}
        <p className="type-deck mt-6 max-w-3xl text-muted">{author.biography}</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[.11em] text-muted">
          <span>{articles.length} {articles.length === 1 ? "article" : "articles"}</span>
          {author.expertise?.map((area) => <span className="before:mr-3 before:text-border before:content-['/']" key={area}>{area}</span>)}
        </div>
      </div>
    </header>
  </PageContainer>;
}
