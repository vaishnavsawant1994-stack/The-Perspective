import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export function CategoryPageHeader({ label, title, description, supportingLine }: { label:string; title:string; description:string; supportingLine?:string }) {
  return <PageContainer className="pb-9 pt-10 sm:pb-12 sm:pt-14 lg:pb-14 lg:pt-18" width="standard">
    <nav aria-label="Breadcrumb"><ol className="flex items-center gap-2 text-xs text-muted"><li><Link className="hover:text-accent" href="/">Home</Link></li><li aria-hidden="true">/</li><li aria-current="page">{title}</li></ol></nav>
    <div className="mt-8 grid gap-7 border-b border-border pb-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:pb-10">
      <div><p className="eyebrow text-accent">{label}</p><h1 className="type-display-lg mt-3">{title}</h1></div>
      <div><p className="type-deck text-muted">{description}</p>{supportingLine && <p className="type-meta mt-5 text-muted">{supportingLine}</p>}</div>
    </div>
  </PageContainer>;
}
