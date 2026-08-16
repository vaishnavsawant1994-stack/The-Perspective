"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HomepagePodcastCarousel({ children, trailing }: { children: ReactNode; trailing: ReactNode }) {
  const pausedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const episodes = Children.toArray(children);
  const episodeCount = episodes.length;

  const move = useCallback((nextDirection: -1 | 1) => {
    if (!episodeCount) return;
    setDirection(nextDirection);
    setActiveIndex((current) => (current + nextDirection + episodeCount) % episodeCount);
  }, [episodeCount]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      if (!pausedRef.current && document.visibilityState === "visible") move(1);
    }, 4400);
    return () => window.clearInterval(interval);
  }, [move]);

  const visibleEpisodes = Array.from(
    { length: Math.min(5, episodeCount) },
    (_, offset) => episodes[(activeIndex + offset) % episodeCount],
  );

  return <div
    className="home-podcast-carousel"
    onBlur={() => { pausedRef.current = false; }}
    onFocus={() => { pausedRef.current = true; }}
    onMouseEnter={() => { pausedRef.current = true; }}
    onMouseLeave={() => { pausedRef.current = false; }}
  >
    <div className={`home-podcast-carousel-window ${direction === 1 ? "is-next" : "is-previous"}`} key={`${activeIndex}-${direction}`}>
      <div aria-label="Podcast episodes, upper row" className="home-podcast-carousel-rail" role="region">{visibleEpisodes.slice(0, 3)}</div>
      <div className="home-podcast-secondary-row">
        <div className="home-podcast-lower-carousel">
          <div aria-label="Podcast episodes, lower row" className="home-podcast-carousel-rail" role="region">{visibleEpisodes.slice(3, 5)}</div>
          <div className="home-podcast-carousel-controls">
            <button aria-label="Previous podcast episode" onClick={() => move(-1)} type="button"><ChevronLeft aria-hidden="true" /></button>
            <button aria-label="Next podcast episode" onClick={() => move(1)} type="button"><ChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        {trailing}
      </div>
    </div>
  </div>;
}
