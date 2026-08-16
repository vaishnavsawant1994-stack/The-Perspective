"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, Bookmark, ChevronLeft, ChevronRight, Lightbulb, Network,
  Pause, Play, UsersRound,
} from "lucide-react";
import type { HomepageRedesignContent } from "@/lib/homepage-redesign";

type HeroSlides = HomepageRedesignContent["heroSlides"];

const articleHref = (slug: string) => `/article/${slug}`;

export function HomepageHeroCarousel({ slides }: { slides: HeroSlides }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const active = slides[activeIndex] ?? slides[0];

  useEffect(() => {
    if (!playing || hovered || focusWithin || slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => setActiveIndex((current) => (current + 1) % slides.length), 6500);
    return () => window.clearInterval(interval);
  }, [focusWithin, hovered, playing, slides.length]);

  if (!active) return null;

  const showPrevious = () => setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % slides.length);
  const storyHref = articleHref(active.article.slug);

  return <section
    aria-label="Featured leadership stories"
    aria-roledescription="carousel"
    className="home-hero"
    onBlurCapture={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusWithin(false);
    }}
    onFocusCapture={() => setFocusWithin(true)}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
  >
    <div aria-atomic="true" aria-live={playing ? "off" : "polite"} className="home-hero-copy" key={`copy-${active.article.id}`}>
      <p className="home-kicker">{active.article.category.name}</p>
      <h1 id="homepage-hero-title">{active.article.title}</h1>
      <p className="home-hero-dek">{active.article.dek ?? active.article.excerpt}</p>
      <div className="home-byline">
        <span className="home-avatar"><Image alt="" fill sizes="40px" src={active.portrait.src} /></span>
        <p><b>{active.person.name}</b><span>{active.person.title}, {active.person.company} · {active.article.readingMinutes} min read</span></p>
      </div>
      <div className="home-hero-actions">
        <Link className="home-button home-button-gold" href={storyHref}>Read full story <ArrowRight aria-hidden="true" /></Link>
        <Link className="home-button home-button-outline" href={`${storyHref}#article-content`}><Play aria-hidden="true" /> Listen to article</Link>
        <Link aria-label={`Save ${active.article.title}`} className="home-square-button" href={`/search?q=${encodeURIComponent(active.article.title)}`}><Bookmark aria-hidden="true" /></Link>
      </div>
    </div>

    <div className="home-hero-visual" key={`visual-${active.article.id}`}>
      <Link aria-label={`Read ${active.article.title}`} className="home-hero-image" href={storyHref}>
        <Image alt={active.portrait.alt} fill priority={activeIndex === 0} sizes="(max-width: 767px) 92vw, 33vw" src={active.portrait.src} />
      </Link>
      <div aria-label="Featured story controls" className="home-hero-controls">
        <button aria-label="Previous featured story" onClick={showPrevious} type="button"><ChevronLeft aria-hidden="true" /></button>
        <div aria-label="Choose featured story" className="home-hero-dots" role="group">
          {slides.map((slide, index) => <button aria-label={`Show story ${index + 1}: ${slide.person.name}`} aria-pressed={index === activeIndex} key={slide.articleId} onClick={() => setActiveIndex(index)} type="button" />)}
        </div>
        <button aria-label="Next featured story" onClick={showNext} type="button"><ChevronRight aria-hidden="true" /></button>
        <button aria-label={playing ? "Pause automatic story rotation" : "Resume automatic story rotation"} onClick={() => setPlaying((value) => !value)} type="button">{playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}</button>
      </div>
    </div>

    <aside aria-atomic="true" aria-live={playing ? "off" : "polite"} className="home-insight-panel" key={`insights-${active.article.id}`}>
      <blockquote><span aria-hidden="true">“</span><p>{active.quote}</p><cite>— {active.person.name}<small>{active.person.company}</small></cite></blockquote>
      <div className="home-insights"><h2>Key insights</h2>{active.insights.map((insight, index) => {
        const Icon = [Lightbulb, Network, UsersRound][index] ?? Lightbulb;
        return <p key={insight}><Icon aria-hidden="true" />{insight}</p>;
      })}</div>
    </aside>
  </section>;
}
