import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";

function SectionHeading({ title, href, action = "View all" }: { title: string; href: string; action?: string }) {
  return (
    <header className="home-section-heading">
      <h2>{title}</h2>
      <Link href={href}>{action} <ArrowRight aria-hidden="true" /></Link>
    </header>
  );
}

export function GlobalMembershipNewsletter() {
  return (
    <section aria-labelledby="global-newsletter-title" className="home-newsletter-card home-global-shell">
      <div className="home-newsletter-membership">
        <SectionHeading href="/magazine/premium" title="Membership that powers you" />
        <div className="home-memberships">
          <article><b>Free</b><h3>Reader</h3><p>Access articles and newsletters.</p><Link href="/search?q=sign+up">Sign up</Link></article>
          <article><b>Premium</b><h3>Member</h3><p>Ad-free reading and our full archive.</p><Link href="/magazine/premium">₹199 / month</Link></article>
          <article><b>Executive</b><h3>Member</h3><p>Research briefs and premium events.</p><Link href="/magazine/subscribe">₹349 / month</Link></article>
        </div>
      </div>
      <div className="home-newsletter-intro">
        <Mail aria-hidden="true" />
        <div><h2 id="global-newsletter-title">Stay informed.<br />Gain perspective.</h2><p>Get concise analysis and trusted insights delivered to your inbox.</p></div>
      </div>
      <div className="home-newsletter-form">
        <NewsletterForm buttonLabel="Subscribe →" label="Email newsletter signup" theme="light" />
        <p>Join 150,000+ readers worldwide. No spam, unsubscribe anytime.</p>
      </div>
    </section>
  );
}

const footerGroups = [
  { title: "Explore", links: [["Home", "/"], ["News", "/latest"], ["Personal Magazines", "/personal-magazines"], ["Podcasts", "/podcasts"], ["Videos", "/videos"], ["Blogs", "/perspective"], ["Events & Summits", "/events"], ["Magazine", "/magazine"]] },
  { title: "About us", links: [["About The Perspective", "/about"], ["Our Team", "/authors"], ["Careers", "/search?q=careers"], ["Contact us", "/contact"], ["Media Kit", "/search?q=media+kit"], ["Terms & Conditions", "/terms"]] },
  { title: "Resources", links: [["Newsletters", "/newsletter"], ["Newsroom", "/news"], ["Sitemap", "/sitemap"], ["Advertising", "/search?q=advertising"], ["Partnerships", "/search?q=partnerships"], ["Become an Author", "/search?q=author"]] },
  { title: "Support", links: [["Help Center", "/help"], ["My Support Requests", "/my-perspective/support"], ["FAQs", "/help#popular-questions"], ["Privacy Policy", "/privacy"], ["Community", "/community-guidelines"]] },
] as const;

export function GlobalPerspectiveFooter() {
  return (
    <footer className="home-footer home-global-shell">
      <div className="home-wrap">
        <div className="home-footer-grid">
          <div className="home-footer-brand">
            <Link className="home-wordmark home-footer-wordmark" href="/"><span>The</span><b>Perspective</b><small>News. Analysis. Perspective.</small></Link>
            <div className="home-footer-social">
              <a aria-label="Facebook" href="https://facebook.com" rel="noreferrer" target="_blank">f</a>
              <a aria-label="X" href="https://x.com" rel="noreferrer" target="_blank">X</a>
              <a aria-label="LinkedIn" href="https://linkedin.com" rel="noreferrer" target="_blank">in</a>
              <a aria-label="YouTube" href="https://youtube.com" rel="noreferrer" target="_blank">▶</a>
              <a aria-label="Instagram" href="https://instagram.com" rel="noreferrer" target="_blank">ig</a>
            </div>
          </div>
          {footerGroups.map((group) => <nav aria-label={group.title} key={group.title}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</nav>)}
          <div className="home-apps">
            <h2>App download</h2>
            <Link href="/search?q=app"><small>Download on the</small><b> App Store</b></Link>
            <Link href="/search?q=app"><small>Get it on</small><b>▶ Google Play</b></Link>
          </div>
        </div>
        <div className="home-footer-bottom"><p>© 2026 The Perspective. All rights reserved.</p><p>Designed in India. Read globally.</p></div>
      </div>
    </footer>
  );
}
