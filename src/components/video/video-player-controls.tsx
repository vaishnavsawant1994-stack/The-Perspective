"use client";

import { useEffect, useState } from "react";
import { Captions, Expand, Pause, Play, Settings, Volume2 } from "lucide-react";
import styles from "./video-detail-page.module.css";

const totalSeconds = 48 * 60 + 35;

function time(value: number) {
  const minutes = Math.floor(value / 60);
  return `${String(minutes).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function VideoPlayerControls() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(318);
  const [captions, setCaptions] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setCurrent((value) => value >= totalSeconds ? 0 : value + speed), 1000);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  return <div className={styles.videoControls}>
    <input aria-label="Video progress" max={totalSeconds} min="0" onChange={(event) => setCurrent(Number(event.target.value))} type="range" value={Math.floor(current)} />
    <button aria-label={playing ? "Pause video" : "Play video"} onClick={() => setPlaying((value) => !value)} type="button">{playing ? <Pause /> : <Play />}</button>
    <button aria-label="Play next" onClick={() => setCurrent((value) => Math.min(totalSeconds, value + 30))} type="button"><Play /></button>
    <span><Volume2 /><input aria-label="Volume" defaultValue="70" max="100" min="0" type="range" /></span>
    <time>{time(Math.floor(current))} / 48:35</time>
    <button className={captions ? styles.activeControl : undefined} aria-label="Toggle captions" onClick={() => setCaptions((value) => !value)} type="button"><Captions /></button>
    <button onClick={() => setSpeed((value) => value === 2 ? 1 : value + .5)} type="button">{speed}x</button>
    <button aria-label="Player settings" type="button"><Settings /></button>
    <button aria-label="Picture in picture" type="button">▣</button>
    <button aria-label="Fullscreen" type="button"><Expand /></button>
  </div>;
}
