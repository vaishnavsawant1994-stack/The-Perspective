import Image from "next/image";
import Link from "next/link";
import type { MagazineIssue } from "@/types";
import { cn } from "@/lib/utils";

export type MagazineCoverVariant = "large" | "standard" | "compact";

const coverSizes: Record<MagazineCoverVariant, string> = {
  large: "(max-width: 767px) 78vw, (max-width: 1279px) 38vw, 480px",
  standard: "(max-width: 767px) 72vw, 360px",
  compact: "(max-width: 639px) 42vw, (max-width: 1023px) 28vw, 240px",
};

function issueDate(issue: MagazineIssue) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(issue.publicationDate));
}

function CoverArtwork({ issue, priority, variant }: { issue: MagazineIssue; priority: boolean; variant: MagazineCoverVariant }) {
  const compact = variant === "compact";
  return <>
    {issue.coverImage ? <Image alt={issue.coverImage.alt} className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" fill priority={priority} sizes={coverSizes[variant]} src={issue.coverImage.src} /> : null}
    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/80" />
    <div className="absolute inset-x-0 top-0 p-[8%] text-white">
      <p className={cn("font-serif leading-none", compact ? "text-base sm:text-xl" : "text-[clamp(1.25rem,3vw,2.4rem)]")}>THE PERSPECTIVE</p>
      <p className={cn("mt-2 font-bold uppercase tracking-[.18em]", compact ? "text-[.42rem] sm:text-[.5rem]" : "text-[.55rem]")}>{issueDate(issue)} · Issue {String(issue.issueNumber).padStart(2, "0")}</p>
    </div>
    <div className="absolute inset-x-0 bottom-0 p-[8%] text-white">
      <p className={cn("font-bold uppercase tracking-[.16em] text-[#e7c785]", compact ? "text-[.45rem] sm:text-[.52rem]" : "text-[.6rem]")}>{issue.coverKicker}</p>
      <p className={cn("mt-3 font-serif leading-[.92] tracking-[-.04em]", compact ? "text-xl sm:text-2xl" : "text-[clamp(1.7rem,4vw,3.25rem)]")}>{issue.coverHeadline}</p>
    </div>
  </>;
}

export function MagazineCover({ issue, variant = "standard", href, priority = false, className }: { issue: MagazineIssue; variant?: MagazineCoverVariant; href?: string; priority?: boolean; className?: string }) {
  const classes = cn("group relative block aspect-[3/4] overflow-hidden bg-[#cec4b2] shadow-[0_18px_45px_rgb(0_0_0/20%)]", className);
  const artwork = <CoverArtwork issue={issue} priority={priority} variant={variant} />;
  return href
    ? <Link aria-label={`Explore ${issue.title} in The Perspective Magazine`} className={classes} href={href}>{artwork}</Link>
    : <div className={classes}>{artwork}</div>;
}
