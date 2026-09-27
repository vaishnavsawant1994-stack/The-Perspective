export const LEAD_LIFECYCLE_STATES = [
  "NEW",
  "EXTRACTED",
  "ENRICHMENT_PENDING",
  "ENRICHED",
  "QUALIFICATION_PENDING",
  "QUALIFIED",
  "OUTREACH_READY",
  "CONTACTED",
  "REPLIED",
  "INTERESTED",
  "NURTURE",
  "DISQUALIFIED",
  "DO_NOT_CONTACT",
  "CONVERTED",
] as const;

export type LeadLifecycleState = (typeof LEAD_LIFECYCLE_STATES)[number];

export type CrmCoreErrorCode =
  | "TEAM_REQUIRED"
  | "INVALID"
  | "NOT_FOUND"
  | "CONFLICT"
  | "STALE_WRITE"
  | "TRANSITION_DENIED";

export type CrmCoreResult<T> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "error"; readonly code: CrmCoreErrorCode };

export interface CreateLeadSourceInput {
  readonly sourceType: string;
  readonly name: string;
  readonly baseUrl?: string | null;
  readonly complianceNotes?: string | null;
  readonly configuration?: Readonly<Record<string, unknown>>;
}

export interface CreateCompanyInput {
  readonly name: string;
  readonly legalName?: string | null;
  readonly domain?: string | null;
  readonly website?: string | null;
  readonly industry?: string | null;
  readonly sizeBand?: string | null;
  readonly revenueBand?: string | null;
  readonly country?: string | null;
}

export interface CreateContactInput {
  readonly companyId?: string | null;
  readonly personId?: string | null;
  readonly title?: string | null;
  readonly relationshipState?: string | null;
  readonly preferredChannel?: string | null;
  readonly emailOriginal?: string | null;
  readonly emailNormalized?: string | null;
  readonly phoneNormalized?: string | null;
}

export interface CreateLeadInput {
  readonly companyId?: string | null;
  readonly contactId?: string | null;
  readonly leadSourceId?: string | null;
  readonly sourceRecordKey?: string | null;
}

export interface CreateExtractionJobInput {
  readonly leadSourceId: string;
  readonly querySnapshot: Readonly<Record<string, unknown>>;
  readonly requestHash?: string | null;
  readonly requestedCount?: number;
}

export interface StageExtractedRecordInput {
  readonly extractionJobId: string;
  readonly sourceRecordKey: string;
  readonly rawPayload: Readonly<Record<string, unknown>>;
  readonly normalizedPayload: Readonly<Record<string, unknown>>;
  readonly provenanceUrl?: string | null;
  readonly confidence?: number | null;
}

export interface RequestEnrichmentInput {
  readonly targetResourceId: string;
  readonly provider: string;
  readonly requestedFields: readonly string[];
  readonly requestHash: string;
}

export interface RecordEnrichmentFactInput {
  readonly jobId: string;
  readonly targetResourceId: string;
  readonly fieldKey: string;
  readonly typedValue: unknown;
  readonly sourceUrl?: string | null;
  readonly confidence?: number | null;
  readonly observedAt: Date;
}

export interface CreateLeadListInput {
  readonly name: string;
  readonly listType?: "STATIC" | "DYNAMIC";
  readonly filterDefinition?: Readonly<Record<string, unknown>>;
}

export interface RecordQualificationInput {
  readonly leadId?: string | null;
  readonly dealId?: string | null;
  readonly criteriaVersion: string;
  readonly answers: Readonly<Record<string, unknown>>;
  readonly score?: number | null;
  readonly disposition: string;
}

export interface CreateDuplicateCandidateInput {
  readonly entityType: string;
  readonly leftResourceId: string;
  readonly rightResourceId: string;
  readonly confidence?: number | null;
  readonly reasons?: readonly string[];
}

export interface CreateSuppressionEntryInput {
  readonly channel: string;
  readonly normalizedDestinationHash: string;
  readonly reason: string;
  readonly source: string;
  readonly effectiveAt?: Date;
  readonly expiresAt?: Date | null;
}


export interface RecordLeadScoreInput {
  readonly leadId: string;
  readonly modelVersion: string;
  readonly score: number;
  readonly components?: Readonly<Record<string, unknown>>;
  readonly calculatedAt?: Date;
}

export interface TransitionLeadLifecycleInput {
  readonly leadId: string;
  readonly to: LeadLifecycleState;
  readonly expectedRowVersion: number;
  readonly reason?: string | null;
}

export interface SuppressLeadInput {
  readonly leadId: string;
  readonly expectedRowVersion: number;
  readonly channel: string;
  readonly normalizedDestinationHash: string;
  readonly reason: string;
  readonly source: string;
  readonly effectiveAt?: Date;
  readonly expiresAt?: Date | null;
}

export interface AddLeadListMemberInput {
  readonly leadListId: string;
  readonly leadId: string;
}

export interface RemoveLeadListMemberInput {
  readonly leadListId: string;
  readonly leadId: string;
}
