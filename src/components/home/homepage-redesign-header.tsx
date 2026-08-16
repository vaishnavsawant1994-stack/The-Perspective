"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Bookmark, ChevronDown, Mail, Menu, Search, Sparkles, UserRound, X } from "lucide-react";

const navigation = [
  ["Home", "/"],
  ["News", "/latest"],
  ["Magazine", "/magazine"],
  ["Personal Magazines", "/personal-magazines"],
  ["Podcasts", "/podcasts"],
  ["Videos", "/videos"],
  ["Blogs", "/perspective"],
  ["Authors", "/authors"],
  ["Events & Summits", "/events"],
] as const;

export function HomepageRedesignHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setMenuOpen(false); };
    document.body.dataset.scrollLocked = "true";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      delete document.body.dataset.scrollLocked;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  function isCurrent(label: string) {
    if (label === "Home") return pathname === "/";
    if (label === "News") return pathname === "/news" || pathname === "/latest";
    if (label === "Magazine") return pathname === "/magazine" || pathname.startsWith("/magazine/");
    if (label === "Personal Magazines") return pathname === "/personal-magazines" || pathname.startsWith("/personal-magazines/");
    if (label === "Podcasts") return pathname === "/podcasts" || pathname.startsWith("/podcasts/");
    if (label === "Videos") return pathname === "/videos" || pathname.startsWith("/videos/");
    if (label === "Blogs") return pathname === "/perspective";
    if (label === "Authors") return pathname === "/authors" || pathname.startsWith("/author/");
    if (label === "Events & Summits") return pathname === "/events";
    return false;
  }

  return (
      <header className="home-head home-global-shell">
        <div className="home-utility">
          <div className="home-wrap home-utility-inner">
            <p>Monday, August 10, 2026</p><span aria-hidden="true" />
            <p>New Delhi <b>29°</b> ☀️</p><span aria-hidden="true" />
            <p>NIFTY <b>24,812.40</b> <em>+0.56%</em></p>
            <p>SENSEX <b>80,604.08</b> <em>+0.42%</em></p>
            <p>USD/INR <b>83.74</b> <strong>-0.09%</strong></p>
            <div className="home-utility-actions">
              <Link href="/search?q=India">Edition: India <ChevronDown aria-hidden="true" /></Link>
              <Link href="/search?q=English">English <ChevronDown aria-hidden="true" /></Link>
              <Link href="/newsletter">Newsletter <Mail aria-hidden="true" /></Link>
              <Link className="home-subscribe-small" href="/magazine/subscribe">Subscribe</Link>
            </div>
          </div>
        </div>

        <div className="home-masthead">
          <div className="home-wrap home-masthead-inner">
            <button aria-controls="home-site-menu" aria-expanded={menuOpen} aria-label={menuOpen ? "Close menu" : "Open menu"} className="home-icon-button" onClick={() => setMenuOpen((open) => !open)} type="button">{menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button>
            <form action="/search" className="home-search" role="search">
              <label className="sr-only" htmlFor="home-search-query">Search The Perspective</label>
              <input id="home-search-query" name="q" placeholder="Search news, people, companies…" />
              <button aria-label="Submit search" type="submit"><Search aria-hidden="true" /></button>
            </form>
            <Link aria-label="The Perspective home" className="home-wordmark" href="/">
              <span>The</span><b>Perspective</b><small>News. Knowledge. Influence.</small>
            </Link>
            <nav aria-label="Reader tools" className="home-reader-tools">
              <Link href="/search?q=AI"><Sparkles aria-hidden="true" />AI Search</Link>
              <Link href="/my-perspective/saved"><Bookmark aria-hidden="true" />Saved</Link>
              <Link className="home-alert-link" href="/my-perspective/notifications"><Bell aria-hidden="true" />Alerts<i aria-hidden="true" /></Link>
              <Link href="/my-perspective"><UserRound aria-hidden="true" />Vaishnav</Link>
            </nav>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="home-nav">
          <div className="home-wrap home-nav-inner">
            {navigation.map(([label, href]) => <Link aria-current={isCurrent(label) ? "page" : undefined} href={href} key={label}>{label}</Link>)}
            <Link aria-current={pathname === "/search" ? "page" : undefined} href="/search">More <ChevronDown aria-hidden="true" /></Link>
          </div>
        </nav>

        {menuOpen && <div aria-label="Site menu" aria-modal="true" className="home-menu-panel" id="home-site-menu" role="dialog">
          <div className="home-wrap home-menu-panel-inner">
            <div>
              <p className="home-menu-label">Explore The Perspective</p>
              <nav aria-label="Expanded primary navigation" className="home-menu-links">
                {navigation.map(([label, href]) => <Link aria-current={isCurrent(label) ? "page" : undefined} href={href} key={label} onClick={() => setMenuOpen(false)}>{label}</Link>)}
                <Link href="/search" onClick={() => setMenuOpen(false)}>More stories</Link>
              </nav>
            </div>
            <div>
              <p className="home-menu-label">Reader tools</p>
              <nav aria-label="Expanded reader tools" className="home-menu-links">
                <Link href="/search?q=AI" onClick={() => setMenuOpen(false)}>AI Search</Link>
                <Link href="/my-perspective/saved" onClick={() => setMenuOpen(false)}>Saved stories</Link>
                <Link href="/my-perspective/notifications" onClick={() => setMenuOpen(false)}>News alerts</Link>
                <Link href="/my-perspective" onClick={() => setMenuOpen(false)}>My Perspective</Link>
              </nav>
            </div>
            <div className="home-menu-cta">
              <p className="home-menu-label">The long view</p>
              <h2>Ideas worth keeping.</h2>
              <p>Read the latest magazine, explore the archive and unlock deeper editions.</p>
              <Link href="/magazine/subscribe" onClick={() => setMenuOpen(false)}>Subscribe to The Perspective</Link>
            </div>
          </div>
        </div>}
      </header>
  );
}
