"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function HomepagePersonalCarousel({ children, trailing }: { children: ReactNode; trailing: ReactNode }) {
  const pausedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<-1 | 1>(1);
  const profiles = Children.toArray(children);
  const profileCount = profiles.length;

  const move = useCallback((nextDirection: -1 | 1) => {
    if (!profileCount) return;
    setDirection(nextDirection);
    setActiveIndex((current) => (current + nextDirection + profileCount) % profileCount);
  }, [profileCount]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const interval = window.setInterval(() => {
      if (!pausedRef.current && document.visibilityState === "visible") move(1);
    }, 4600);
    return () => window.clearInterval(interval);
  }, [move]);

  const visibleProfiles = Array.from(
    { length: Math.min(7, profileCount) },
    (_, offset) => profiles[(activeIndex + offset) % profileCount],
  );

  return <div
    className="home-personal-carousel"
    onBlur={() => { pausedRef.current = false; }}
    onFocus={() => { pausedRef.current = true; }}
    onMouseEnter={() => { pausedRef.current = true; }}
    onMouseLeave={() => { pausedRef.current = false; }}
  >
    <div className={`home-personal-carousel-window ${direction === 1 ? "is-next" : "is-previous"}`} key={`${activeIndex}-${direction}`}>
      <div aria-label="Personal magazine profiles, upper row" className="home-personal-carousel-rail" role="region">{visibleProfiles.slice(0, 4)}</div>
      <div className="home-personal-secondary-row">
        <div className="home-personal-lower-carousel">
          <div aria-label="Personal magazine profiles, lower row" className="home-personal-carousel-rail" role="region">{visibleProfiles.slice(4, 7)}</div>
          <div className="home-personal-carousel-controls">
            <button aria-label="Previous personal magazine" onClick={() => move(-1)} type="button"><ChevronLeft aria-hidden="true" /></button>
            <button aria-label="Next personal magazine" onClick={() => move(1)} type="button"><ChevronRight aria-hidden="true" /></button>
          </div>
        </div>
        {trailing}
      </div>
    </div>
  </div>;
}
