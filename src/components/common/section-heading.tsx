import { cn } from "@/lib/utils";

export function SectionHeading({ title, eyebrow, id, className }: { title: string; eyebrow?: string; id?: string; className?: string }) {
  return <div className={cn("mb-8 sm:mb-10", className)}>{eyebrow && <p className="eyebrow mb-3 text-accent">{eyebrow}</p>}<h2 id={id} className="editorial-heading">{title}</h2></div>;
}
