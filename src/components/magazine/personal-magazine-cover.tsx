import Image from "next/image";
import Link from "next/link";
import type { ImageAsset, PersonProfile } from "@/types";
import { cn } from "@/lib/utils";

function PersonalCoverArtwork({ person, index, coverHeadline, coverImage, editionLabel, priority }: { person: PersonProfile; index: number; coverHeadline?: string; coverImage?: ImageAsset; editionLabel?: string; priority?: boolean }) {
  const fallbackImages = ["/images/articles/arjun-mehta.png", "/images/articles/global-leadership.png", "/images/articles/daniel-kim.png"];
  const image = coverImage ?? person.portrait;
  return <>
    <Image alt={image?.alt ?? `Editorial cover artwork for ${person.name}`} className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" fill priority={priority} sizes="(max-width:640px) 76vw, 360px" src={image?.src ?? fallbackImages[index] ?? fallbackImages[0]} />
    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
    <div className="absolute inset-x-0 top-0 p-[8%] text-white"><p className="font-serif text-xl">THE PERSPECTIVE</p><p className="mt-1 text-[.5rem] font-bold uppercase tracking-[.16em]">{editionLabel ?? "Personal Edition"}</p></div>
    <div className="absolute inset-x-0 bottom-0 p-[8%] text-white"><p className="text-[.6rem] font-bold uppercase tracking-[.13em] text-[#e7c785]">{person.title}</p><p className="mt-2 font-serif text-3xl leading-none">{person.name}</p><p className="mt-3 text-sm leading-tight text-white/80">{coverHeadline ?? person.headline}</p></div>
  </>;
}

export function PersonalMagazineCover({ person, index, href, coverHeadline, coverImage, editionLabel, priority, className }: { person: PersonProfile; index: number; href?: string; coverHeadline?: string; coverImage?: ImageAsset; editionLabel?: string; priority?: boolean; className?: string }) {
  const classes = cn("group relative block aspect-[3/4] overflow-hidden shadow-[0_18px_40px_rgb(0_0_0/20%)]", index === 1 && "sm:mt-10", className);
  const artwork = <PersonalCoverArtwork coverHeadline={coverHeadline} coverImage={coverImage} editionLabel={editionLabel} index={index} person={person} priority={priority} />;
  return href ? <Link aria-label={`Explore the personal magazine for ${person.name}`} className={classes} href={href}>{artwork}</Link> : <div className={classes}>{artwork}</div>;
}
