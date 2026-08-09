import Image from "next/image";
import Link from "next/link";
import type { PersonProfile } from "@/types";
import { cn } from "@/lib/utils";

function PersonalCoverArtwork({ person, index }: { person: PersonProfile; index: number }) {
  const fallbackImages = ["/images/articles/arjun-mehta.png", "/images/articles/global-leadership.png", "/images/articles/daniel-kim.png"];
  const image = person.portrait?.src ?? fallbackImages[index] ?? fallbackImages[0];
  return <>
    <Image alt={person.portrait?.alt ?? `Editorial cover artwork for ${person.name}`} className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" fill sizes="(max-width:640px) 76vw, 280px" src={image} />
    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/80" />
    <div className="absolute inset-x-0 top-0 p-[8%] text-white"><p className="font-serif text-xl">THE PERSPECTIVE</p><p className="mt-1 text-[.5rem] font-bold uppercase tracking-[.16em]">Personal Edition</p></div>
    <div className="absolute inset-x-0 bottom-0 p-[8%] text-white"><p className="text-[.6rem] font-bold uppercase tracking-[.13em] text-[#e7c785]">{person.title}</p><h3 className="mt-2 font-serif text-3xl leading-none">{person.name}</h3><p className="mt-3 text-sm leading-tight text-white/80">{person.headline}</p></div>
  </>;
}

export function PersonalMagazineCover({ person, index, href }: { person: PersonProfile; index: number; href?: string }) {
  const classes = cn("group relative block aspect-[3/4] overflow-hidden shadow-[0_18px_40px_rgb(0_0_0/20%)]", index === 1 && "sm:mt-10");
  const artwork = <PersonalCoverArtwork index={index} person={person} />;
  return href ? <Link aria-label={`Explore the personal magazine for ${person.name}`} className={classes} href={href}>{artwork}</Link> : <div className={classes}>{artwork}</div>;
}
