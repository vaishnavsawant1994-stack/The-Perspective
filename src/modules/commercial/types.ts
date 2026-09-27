export type CommercialErrorCode =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STALE_WRITE"
  | "TRANSITION_DENIED"
  | "STAGE_NOT_ACTIVE"
  | "IDEMPOTENCY_CONFLICT";

export type CommercialResult<T> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "error"; readonly code: CommercialErrorCode };

export type R6DealStageClass =
  | "QUALIFIED"
  | "INTERESTED"
  | "DISCOVERY_SCHEDULED"
  | "DISCOVERY_COMPLETED"
  | "PROPOSAL_PREPARATION"
  | "LOST"
  | "ON_HOLD"
  | "FOLLOW_UP_LATER"
  | "DISQUALIFIED";

export interface PipelineStageInput {
  readonly key: string;
  readonly name: string;
  readonly position: number;
  readonly canonicalClass: R6DealStageClass;
  readonly probability?: number | null;
  readonly entryRules?: Readonly<Record<string, unknown>>;
  readonly exitRules?: Readonly<Record<string, unknown>>;
}

export interface CreateDealPipelineInput {
  readonly name: string;
  readonly version: number;
  readonly stages: readonly PipelineStageInput[];
}

export interface CreateDealInput {
  readonly pipelineId: string;
  readonly companyId?: string | null;
  readonly primaryContactId?: string | null;
  readonly sourceLeadId?: string | null;
  readonly amountMinor?: bigint | null;
  readonly currency?: string | null;
  readonly probability?: number | null;
  readonly expectedCloseDate?: Date | null;
}

export interface UpdateDealFieldsInput {
  readonly dealId: string;
  readonly expectedRowVersion: number;
  readonly amountMinor?: bigint | null;
  readonly currency?: string | null;
  readonly probability?: number | null;
  readonly expectedCloseDate?: Date | null;
}

export interface MoveDealInput {
  readonly dealId: string;
  readonly toStageId: string;
  readonly expectedRowVersion: number;
  readonly reason?: string | null;
}

export interface ConvertDealToClientInput {
  readonly dealId: string;
  readonly expectedRowVersion: number;
  readonly idempotencyKey: string;
}


export interface ConvertLeadToDealInput {
  readonly leadId: string;
  readonly expectedLeadRowVersion: number;
  readonly pipelineId: string;
  readonly stageId: string;
  readonly amountMinor?: bigint | null;
  readonly currency?: string | null;
  readonly probability?: number | null;
  readonly expectedCloseDate?: Date | null;
}


export interface AddClientRelationshipInput {
  readonly clientAccountId: string;
  readonly contactId: string;
  readonly relationshipRole: string;
  readonly isPrimary?: boolean;
  readonly isBilling?: boolean;
  readonly isApprover?: boolean;
  readonly isAdmin?: boolean;
}
