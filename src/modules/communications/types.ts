export const CAMPAIGN_STATES = [
  "DRAFT",
  "READY",
  "APPROVED",
  "SCHEDULED",
  "RUNNING",
  "PAUSED",
  "COMPLETED",
  "CANCELLED",
  "FAILED",
] as const;

export type CampaignState = (typeof CAMPAIGN_STATES)[number];

export const CAMPAIGN_RECIPIENT_STATES = [
  "QUEUED",
  "SENT",
  "DELIVERED",
  "OPENED",
  "CLICKED",
  "REPLIED",
  "BOUNCED",
  "UNSUBSCRIBED",
  "STOPPED",
  "CONVERTED",
] as const;

export type CampaignRecipientState =
  (typeof CAMPAIGN_RECIPIENT_STATES)[number];

export const CONVERSATION_STATES = [
  "OPEN",
  "PENDING_INTERNAL",
  "WAITING_EXTERNAL",
  "RESOLVED",
  "REOPENED",
  "ARCHIVED",
] as const;

export type ConversationState = (typeof CONVERSATION_STATES)[number];

export const MEETING_STATES = [
  "PROPOSED",
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
] as const;

export type MeetingState = (typeof MEETING_STATES)[number];

export type CommunicationsErrorCode =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STALE_WRITE"
  | "TRANSITION_DENIED"
  | "SAFETY_BLOCKED"
  | "TEMPLATE_UNAVAILABLE"
  | "SENDER_UNAVAILABLE";

export type CommunicationsResult<T> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "error"; readonly code: CommunicationsErrorCode };

export interface CreateSendingAccountInput {
  readonly provider: string;
  readonly address: string;
  readonly displayName?: string | null;
  readonly dailyLimit?: number | null;
  readonly hourlyLimit?: number | null;
}

export interface CreateSequenceInput {
  readonly name: string;
}

export interface AddSequenceStepInput {
  readonly sequenceId: string;
  readonly sequenceVersion: number;
  readonly position: number;
  readonly channel: string;
  readonly templateVersionId: string;
  readonly delaySeconds?: number;
  readonly conditions?: Readonly<Record<string, unknown>>;
  readonly stopRules?: Readonly<Record<string, unknown>>;
}

export interface CreateCampaignInput {
  readonly name: string;
  readonly leadListId: string;
  readonly sequenceId: string;
  readonly sendingAccountId: string;
  readonly schedule?: Readonly<Record<string, unknown>>;
}

export interface FreezeCampaignAudienceInput {
  readonly campaignId: string;
  readonly expectedRowVersion: number;
}

export interface PrepareCampaignInput {
  readonly campaignId: string;
  readonly expectedRowVersion: number;
}

export interface ApproveCampaignInput {
  readonly campaignId: string;
  readonly expectedRowVersion: number;
}

export interface ScheduleCampaignInput {
  readonly campaignId: string;
  readonly expectedRowVersion: number;
  readonly scheduledAt: Date;
}

export interface LaunchCampaignInput {
  readonly campaignId: string;
  readonly expectedRowVersion: number;
}

export interface PauseCampaignInput {
  readonly campaignId: string;
  readonly expectedRowVersion: number;
}

export interface PrepareRecipientDispatchInput {
  readonly campaignRecipientId: string;
  readonly now?: Date;
}

export interface PreparedDispatch {
  readonly campaignRecipientId: string;
  readonly campaignId: string;
  readonly sequenceStepId: string;
  readonly sendingAccountId: string;
  readonly channel: string;
  readonly destination: string;
  readonly normalizedDestination: string;
  readonly destinationHash: string;
  readonly templateVersionId: string;
  readonly templateContentHash: string;
  readonly subject: string | null;
  readonly body: string;
}

export interface RecordDeliveryEventInput {
  readonly campaignRecipientId: string;
  readonly sequenceStepId?: string | null;
  readonly messageId?: string | null;
  readonly provider: string;
  readonly externalEventId: string;
  readonly eventType:
    | "SENT"
    | "DELIVERED"
    | "OPENED"
    | "CLICKED"
    | "REPLIED"
    | "BOUNCED"
    | "UNSUBSCRIBED";
  readonly occurredAt: Date;
  readonly payloadHash?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CreateConversationInput {
  readonly channel: string;
  readonly subject?: string | null;
  readonly leadId?: string | null;
  readonly sendingAccountId?: string | null;
  readonly provider?: string | null;
  readonly providerThreadId?: string | null;
}

export interface RecordInboundMessageInput {
  readonly conversationId: string;
  readonly provider: string;
  readonly externalId: string;
  readonly bodyText: string;
  readonly receivedAt: Date;
}

export interface AddInternalNoteInput {
  readonly conversationId: string;
  readonly bodyText: string;
}

export interface TransitionConversationInput {
  readonly conversationId: string;
  readonly to: ConversationState;
  readonly expectedRowVersion: number;
}

export interface CreateMeetingInput {
  readonly title: string;
  readonly meetingType: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly timezone: string;
  readonly locationUrl?: string | null;
  readonly provider?: string | null;
  readonly externalEventId?: string | null;
}

export interface TransitionMeetingInput {
  readonly meetingId: string;
  readonly to: MeetingState;
  readonly expectedRowVersion: number;
}
