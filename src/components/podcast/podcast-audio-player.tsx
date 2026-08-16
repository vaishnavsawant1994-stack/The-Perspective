"use client";

import { useEffect, useState } from "react";
import { Pause, Play, RotateCcw, RotateCw, Volume2 } from "lucide-react";
import styles from "./podcast-episode-detail.module.css";

const totalSeconds = 52 * 60 + 16;

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  return `${String(minutes).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}

export function PodcastAudioPlayer() {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setCurrent((value) => value >= totalSeconds ? 0 : value + speed), 1000);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  return <div className={styles.audioControls}>
    <button aria-label={playing ? "Pause episode" : "Play episode"} className={styles.mainPlay} onClick={() => setPlaying((value) => !value)} type="button">{playing ? <Pause /> : <Play />}</button>
    <div className={styles.waveform} aria-hidden="true">{Array.from({ length: 84 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 19) % 70)}%` }} />)}</div>
    <div className={styles.progressRow}><time>{formatTime(Math.floor(current))}</time><input aria-label="Episode progress" max={totalSeconds} min="0" onChange={(event) => setCurrent(Number(event.target.value))} type="range" value={Math.floor(current)} /><time>52:16</time></div>
    <div className={styles.playerTools}><button onClick={() => setSpeed((value) => value === 2 ? 1 : value + .5)} type="button">{speed}x</button><button aria-label="Rewind 15 seconds" onClick={() => setCurrent((value) => Math.max(0, value - 15))} type="button"><RotateCcw />15</button><button aria-label="Forward 15 seconds" onClick={() => setCurrent((value) => Math.min(totalSeconds, value + 15))} type="button"><RotateCw />15</button><span><Volume2 /><input aria-label="Volume" defaultValue="70" max="100" min="0" type="range" /></span></div>
  </div>;
}
