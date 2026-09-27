export type CommsErrorCode =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STALE_WRITE"
  | "TRANSITION_DENIED"
  | "TEMPLATE_NOT_APPROVED"
  | "CONTACT_BLOCKED"
  | "SENDER_NOT_READY";

export type CommsResult<T> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "error"; readonly code: CommsErrorCode };

export type CampaignState =
  | "DRAFT"
  | "READY"
  | "APPROVED"
  | "SCHEDULED"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED"
  | "CANCELLED"
  | "FAILED";

export type RecipientState =
  | "QUEUED"
  | "SENT"
  | "DELIVERED"
  | "OPENED"
  | "CLICKED"
  | "REPLIED"
  | "BOUNCED"
  | "UNSUBSCRIBED"
  | "STOPPED"
  | "CONVERTED";

export type ConversationState =
  | "OPEN"
  | "PENDING_INTERNAL"
  | "WAITING_EXTERNAL"
  | "RESOLVED"
  | "REOPENED"
  | "ARCHIVED";

export type MeetingState =
  | "PROPOSED"
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

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
  readonly expectedSequenceVersion: number;
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

export interface AddCampaignRecipientInput {
  readonly campaignId: string;
  readonly leadId?: string | null;
  readonly contactId?: string | null;
}

export interface TransitionCampaignInput {
  readonly campaignId: string;
  readonly to: CampaignState;
  readonly expectedRowVersion: number;
  readonly audienceSnapshotHash?: string | null;
}

export interface EvaluateDispatchSafetyInput {
  readonly campaignRecipientId: string;
}

export interface RecordDeliveryEventInput {
  readonly campaignRecipientId?: string | null;
  readonly sequenceStepId?: string | null;
  readonly messageId?: string | null;
  readonly provider: string;
  readonly externalEventId: string;
  readonly eventType: string;
  readonly occurredAt: Date;
  readonly payloadHash?: string | null;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CreateConversationInput {
  readonly channel: string;
  readonly subject?: string | null;
  readonly leadId?: string | null;
  readonly dealId?: string | null;
  readonly clientAccountId?: string | null;
  readonly sendingAccountId?: string | null;
  readonly provider?: string | null;
  readonly providerThreadId?: string | null;
}

export interface TransitionConversationInput {
  readonly conversationId: string;
  readonly to: ConversationState;
  readonly expectedRowVersion: number;
}

export interface RecordMessageInput {
  readonly conversationId: string;
  readonly direction: "INBOUND" | "OUTBOUND" | "INTERNAL";
  readonly bodyText?: string | null;
  readonly provider?: string | null;
  readonly externalId?: string | null;
  readonly occurredAt?: Date;
  readonly internalNote?: boolean;
}

export interface CreateMeetingInput {
  readonly title: string;
  readonly meetingType: string;
  readonly startsAt: Date;
  readonly endsAt: Date;
  readonly timezone: string;
  readonly dealId?: string | null;
  readonly clientAccountId?: string | null;
}

export interface TransitionMeetingInput {
  readonly meetingId: string;
  readonly to: MeetingState;
  readonly expectedRowVersion: number;
}
