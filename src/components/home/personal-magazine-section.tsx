import Link from "next/link";
import type { PersonProfile } from "@/types";
import { PersonalMagazineCover } from "@/components/magazine/personal-magazine-cover";
import { PageContainer } from "@/components/layout/page-container";
import { getResolvedPersonalMagazineByPersonId } from "@/lib/personal-magazines";

export function PersonalMagazineSection({ people, id, destination = "/personal-magazines", compact = false }: { people: readonly PersonProfile[]; id?: string; destination?: string | null; compact?: boolean }) {
  return <div className="bg-[#ded6c8]" id={id}><PageContainer className="section-space-lg"><section aria-labelledby="personal-magazines-heading" className="grid gap-14 lg:grid-cols-[.7fr_1.3fr] lg:items-center">
    <div><p className="eyebrow text-accent">Personal Magazines</p><h2 className={compact ? "mt-4 font-serif text-[clamp(2.35rem,3.8vw,4rem)] leading-[.92] tracking-[-.035em]" : "type-display-lg mt-5"} id="personal-magazines-heading">Your story.<br />Your magazine.</h2><p className={compact ? "mt-4 max-w-lg text-base leading-7 text-[#4d4a43]" : "type-body-lg mt-6 max-w-xl text-[#4d4a43]"}>The Perspective creates premium personal magazines for founders, executives, investors and leaders whose stories deserve more than a profile page.</p><div className={compact ? "mt-5 flex flex-wrap items-center gap-4 text-xs font-bold" : "mt-8 flex flex-wrap items-center gap-5 text-sm font-bold"}>{destination ? <Link className="inline-flex min-h-11 items-center border-b border-foreground" href={destination}>Explore Personal Magazines</Link> : <span className="inline-flex min-h-11 items-center border-b border-foreground">Personal Magazine Collection</span>}<span aria-disabled="true" className="inline-flex min-h-11 items-center border-b border-accent text-accent">Creation service coming soon</span></div></div>
    <div className="grid grid-cols-1 gap-5 xs:grid-cols-2 sm:grid-cols-3">{people.map((person, index) => {
      const profile = getResolvedPersonalMagazineByPersonId(person.id);
      const href = profile ? `/personal-magazines/${profile.magazine.slug}` : destination ?? undefined;
      return <PersonalMagazineCover coverHeadline={profile?.magazine.coverHeadline} coverImage={profile?.coverImage} editionLabel={profile?.magazine.editionLabel} href={href} index={index} key={person.id} person={person} />;
    })}</div>
  </section></PageContainer></div>;
}
