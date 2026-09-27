import type {
  CampaignRecipientState,
  CampaignState,
  ConversationState,
  MeetingState,
} from "./types";

const CAMPAIGN_TRANSITIONS: Readonly<
  Record<CampaignState, readonly CampaignState[]>
> = {
  DRAFT: ["READY", "CANCELLED"],
  READY: ["DRAFT", "APPROVED", "CANCELLED"],
  APPROVED: ["READY", "SCHEDULED", "RUNNING", "CANCELLED"],
  SCHEDULED: ["READY", "RUNNING", "CANCELLED"],
  RUNNING: ["PAUSED", "COMPLETED", "FAILED", "CANCELLED"],
  PAUSED: ["RUNNING", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: [],
};

export function canTransitionCampaign(
  from: CampaignState,
  to: CampaignState,
) {
  return from !== to && CAMPAIGN_TRANSITIONS[from].includes(to);
}

const CONVERSATION_TRANSITIONS: Readonly<
  Record<ConversationState, readonly ConversationState[]>
> = {
  OPEN: ["PENDING_INTERNAL", "WAITING_EXTERNAL", "RESOLVED", "ARCHIVED"],
  PENDING_INTERNAL: ["OPEN", "WAITING_EXTERNAL", "RESOLVED", "ARCHIVED"],
  WAITING_EXTERNAL: ["OPEN", "PENDING_INTERNAL", "RESOLVED", "ARCHIVED"],
  RESOLVED: ["REOPENED", "ARCHIVED"],
  REOPENED: ["PENDING_INTERNAL", "WAITING_EXTERNAL", "RESOLVED", "ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionConversation(
  from: ConversationState,
  to: ConversationState,
) {
  return from !== to && CONVERSATION_TRANSITIONS[from].includes(to);
}

const MEETING_TRANSITIONS: Readonly<Record<MeetingState, readonly MeetingState[]>> =
  {
    PROPOSED: ["SCHEDULED", "CANCELLED"],
    SCHEDULED: ["CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"],
    CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
    COMPLETED: [],
    CANCELLED: [],
    NO_SHOW: [],
  };

export function canTransitionMeeting(from: MeetingState, to: MeetingState) {
  return from !== to && MEETING_TRANSITIONS[from].includes(to);
}

const RECIPIENT_RANK: Readonly<Partial<Record<CampaignRecipientState, number>>> = {
  QUEUED: 0,
  SENT: 1,
  DELIVERED: 2,
  OPENED: 3,
  CLICKED: 4,
  REPLIED: 5,
};

const RECIPIENT_TERMINAL = new Set<CampaignRecipientState>([
  "REPLIED",
  "BOUNCED",
  "UNSUBSCRIBED",
  "STOPPED",
  "CONVERTED",
]);

export function canApplyRecipientEvidence(
  current: CampaignRecipientState,
  next: CampaignRecipientState,
) {
  if (current === next) return false;
  if (RECIPIENT_TERMINAL.has(current)) return false;
  if (RECIPIENT_TERMINAL.has(next)) return true;

  const currentRank = RECIPIENT_RANK[current];
  const nextRank = RECIPIENT_RANK[next];
  return currentRank !== undefined && nextRank !== undefined && nextRank > currentRank;
}
