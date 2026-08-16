"use client";

import { useState } from "react";
import { Check, Settings2 } from "lucide-react";

const options = ["Daily Briefing", "Business Briefing", "Technology Briefing", "Leadership Briefing"];

export function BriefingPreferences() {
  const [selected, setSelected] = useState(() => new Set([options[0], options[1]]));
  const [saved, setSaved] = useState(false);

  function toggle(option: string) {
    setSaved(false);
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(option)) next.delete(option); else next.add(option);
      return next;
    });
  }

  return (
    <div>
      <Settings2 aria-hidden="true" />
      <h2>Manage your preferences</h2>
      <p>You’re in control. Choose the topics and frequency that work for you.</p>
      <div>
        {options.map((option) => (
          <label key={option}>
            <input checked={selected.has(option)} onChange={() => toggle(option)} type="checkbox" />
            <span><Check aria-hidden="true" /></span>{option}
          </label>
        ))}
      </div>
      <button onClick={() => setSaved(true)} type="button">{saved ? "Preferences saved" : "Save preferences"}</button>
      <p aria-live="polite">{saved ? "Your briefing choices have been updated." : "Pause or unsubscribe at any time."}</p>
    </div>
  );
}
