import type { LeadLifecycleState } from "./types";

const TERMINAL_STATES = new Set<LeadLifecycleState>([
  "DISQUALIFIED",
  "SUPPRESSED",
  "CONVERTED",
]);

const FORWARD_TRANSITIONS: Readonly<Record<LeadLifecycleState, readonly LeadLifecycleState[]>> = {
  NEW: ["EXTRACTED"],
  EXTRACTED: ["ENRICHMENT_PENDING"],
  ENRICHMENT_PENDING: ["ENRICHED"],
  ENRICHED: ["QUALIFICATION_PENDING"],
  QUALIFICATION_PENDING: ["QUALIFIED", "NURTURE", "DISQUALIFIED"],
  QUALIFIED: ["OUTREACH_READY", "NURTURE", "CONVERTED"],
  OUTREACH_READY: ["CONTACTED", "NURTURE"],
  CONTACTED: ["REPLIED", "NURTURE"],
  REPLIED: ["INTERESTED", "NURTURE", "DISQUALIFIED"],
  INTERESTED: ["NURTURE", "CONVERTED"],
  NURTURE: ["QUALIFICATION_PENDING"],
  DISQUALIFIED: [],
  SUPPRESSED: [],
  CONVERTED: [],
};

const DNC_ELIGIBLE = new Set<LeadLifecycleState>(
  Object.keys(FORWARD_TRANSITIONS)
    .filter((state) => !TERMINAL_STATES.has(state as LeadLifecycleState))
    .map((state) => state as LeadLifecycleState),
);

export function canTransitionLeadLifecycle(
  from: LeadLifecycleState,
  to: LeadLifecycleState,
) {
  if (from === to || TERMINAL_STATES.has(from)) return false;
  if (to === "SUPPRESSED") return DNC_ELIGIBLE.has(from);
  return FORWARD_TRANSITIONS[from].includes(to);
}

export function isTerminalLeadLifecycle(state: LeadLifecycleState) {
  return TERMINAL_STATES.has(state);
}
