import { NewsletterForm } from "@/components/layout/newsletter-form";

export function CategoryNewsletter({ eyebrow, title, description }: { eyebrow:string; title:string; description:string }) {
  return <section aria-labelledby="category-newsletter-heading" className="grid gap-10 lg:grid-cols-[1.1fr_.9fr] lg:items-end"><div><p className="eyebrow text-accent">{eyebrow}</p><h2 className="type-display-lg mt-5" id="category-newsletter-heading">{title}</h2><p className="type-deck mt-5 max-w-2xl text-muted">{description}</p></div><NewsletterForm buttonLabel="Join the Briefing" label="Delivered to your inbox" theme="light" /></section>;
}
