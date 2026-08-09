import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import type { ResolvedPersonalMagazineProfile } from "@/types";
import { PageContainer } from "@/components/layout/page-container";
import { PersonalMagazineCover } from "@/components/magazine/personal-magazine-cover";

export function PersonalMagazineHero({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  const { magazine, person, interview, coverImage } = profile;
  return <header className="border-b border-foreground bg-[#e5ded2]">
    <PageContainer className="pb-16 pt-7 sm:pb-20 sm:pt-9 lg:pb-24" width="standard">
      <nav aria-label="Breadcrumb" className="type-meta flex flex-wrap items-center gap-2 text-[#575146]"><Link className="hover:text-accent" href="/">Home</Link><span aria-hidden="true">/</span><Link className="hover:text-accent" href="/magazine">Magazine</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-foreground">{person.name}</span></nav>
      <div className="mt-10 grid gap-12 md:grid-cols-[minmax(15rem,.72fr)_minmax(0,1.28fr)] md:items-center md:gap-14 lg:gap-20">
        <div className="mx-auto w-[76%] max-w-md md:w-full"><PersonalMagazineCover className="sm:mt-0" coverHeadline={magazine.coverHeadline} coverImage={coverImage} editionLabel={magazine.editionLabel} index={0} person={person} priority /></div>
        <div><p className="eyebrow text-accent">Personal Magazine</p><h1 className="mt-5 font-serif text-[clamp(3.6rem,8vw,8.5rem)] leading-[.84] tracking-[-.06em]">{person.name}</h1><p className="mt-6 text-sm font-bold uppercase tracking-[.13em] text-[#575146]">{[person.title, person.company].filter(Boolean).join(" · ")}</p><p className="mt-9 max-w-4xl font-serif text-[clamp(2.1rem,4.7vw,5.1rem)] leading-[.92] tracking-[-.045em]">{magazine.coverHeadline}</p><p className="type-deck mt-7 max-w-3xl text-[#575146]">{magazine.introduction}</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link className="inline-flex min-h-12 items-center gap-2 bg-foreground px-5 text-sm font-bold text-white hover:bg-accent" href="#the-story">Explore the Story <ArrowDown aria-hidden="true" className="size-4" /></Link>{interview ? <Link className="inline-flex min-h-12 items-center gap-2 border border-foreground px-5 text-sm font-bold hover:bg-foreground hover:text-white" href={`/article/${interview.slug}`}>Read the Interview <ArrowRight aria-hidden="true" className="size-4" /></Link> : <Link className="inline-flex min-h-12 items-center gap-2 border border-foreground px-5 text-sm font-bold hover:bg-foreground hover:text-white" href="#contents">Explore the Edition <ArrowRight aria-hidden="true" className="size-4" /></Link>}</div>
          <div className="type-meta mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-[#aaa292] pt-5 text-[#575146]"><span>The Perspective</span><span>{magazine.publicationLabel}</span><span>{magazine.editionLabel}</span></div>
        </div>
      </div>
    </PageContainer>
  </header>;
}
