"use client";

import { useState } from "react";
import { Check } from "lucide-react";

export function BriefingSubscribeButton({ alert = false, name }: { alert?: boolean; name: string }) {
  const [active, setActive] = useState(false);

  return (
    <button
      aria-label={`${active ? "Remove" : alert ? "Create" : "Subscribe to"} ${name}`}
      aria-pressed={active}
      data-active={active || undefined}
      onClick={() => setActive((current) => !current)}
      type="button"
    >
      {active ? <><Check aria-hidden="true" /> {alert ? "Alert created" : "Subscribed"}</> : alert ? "Create alert" : "Subscribe"}
    </button>
  );
}
