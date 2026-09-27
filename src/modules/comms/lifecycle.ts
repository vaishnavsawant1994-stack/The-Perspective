import type {
  CampaignState,
  ConversationState,
  MeetingState,
  RecipientState,
} from "./types";

const CAMPAIGN_TRANSITIONS: Readonly<Record<CampaignState, readonly CampaignState[]>> = {
  DRAFT: ["READY", "CANCELLED"],
  READY: ["DRAFT", "APPROVED", "CANCELLED"],
  APPROVED: ["DRAFT", "SCHEDULED", "RUNNING", "CANCELLED"],
  SCHEDULED: ["RUNNING", "CANCELLED"],
  RUNNING: ["PAUSED", "COMPLETED", "CANCELLED", "FAILED"],
  PAUSED: ["RUNNING", "CANCELLED", "FAILED"],
  COMPLETED: [],
  CANCELLED: [],
  FAILED: [],
};

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

const MEETING_TRANSITIONS: Readonly<Record<MeetingState, readonly MeetingState[]>> = {
  PROPOSED: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["CONFIRMED", "CANCELLED", "NO_SHOW"],
  CONFIRMED: ["COMPLETED", "CANCELLED", "NO_SHOW"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

const RECIPIENT_RANK: Readonly<Record<RecipientState, number>> = {
  QUEUED: 0,
  SENT: 1,
  DELIVERED: 2,
  OPENED: 3,
  CLICKED: 4,
  REPLIED: 5,
  BOUNCED: 100,
  UNSUBSCRIBED: 100,
  STOPPED: 100,
  CONVERTED: 100,
};

export function canTransitionCampaign(from: CampaignState, to: CampaignState) {
  return CAMPAIGN_TRANSITIONS[from].includes(to);
}

export function canTransitionConversation(
  from: ConversationState,
  to: ConversationState,
) {
  return CONVERSATION_TRANSITIONS[from].includes(to);
}

export function canTransitionMeeting(from: MeetingState, to: MeetingState) {
  return MEETING_TRANSITIONS[from].includes(to);
}

export function canAdvanceRecipient(from: RecipientState, to: RecipientState) {
  if (RECIPIENT_RANK[from] >= 100) return false;
  if (RECIPIENT_RANK[to] >= 100) return true;
  return RECIPIENT_RANK[to] >= RECIPIENT_RANK[from];
}
