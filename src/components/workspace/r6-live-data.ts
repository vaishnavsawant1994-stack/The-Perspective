"use client";

import { useEffect, useState } from "react";

export interface R6LeadRow {
  readonly id: string;
  readonly resourceId: string;
  readonly companyId: string | null;
  readonly contactId: string | null;
  readonly leadSourceId: string | null;
  readonly lifecycleState: string;
  readonly fitScore: string | null;
  readonly qualificationState: string | null;
  readonly lastActivityAt: string | null;
  readonly ownerMembershipId: string | null;
  readonly departmentId: string | null;
  readonly updatedAt: string;
}

export interface R6CampaignRow {
  readonly id: string;
  readonly resourceId: string;
  readonly name: string;
  readonly leadListId: string;
  readonly sequenceId: string;
  readonly sendingAccountId: string;
  readonly schedule: unknown;
  readonly status: string;
  readonly recipientCount: number;
  readonly sentCount: number;
  readonly replyCount: number;
  readonly positiveReplyCount: number;
  readonly audienceSnapshotHash: string | null;
  readonly approvedSnapshotHash: string | null;
  readonly rowVersion: number;
  readonly updatedAt: string;
}

export interface R6DealRow {
  readonly id: string;
  readonly resourceId: string;
  readonly companyId: string | null;
  readonly primaryContactId: string | null;
  readonly sourceLeadId: string | null;
  readonly pipelineId: string;
  readonly stageId: string;
  readonly amountMinor: string | null;
  readonly currency: string | null;
  readonly probability: string | null;
  readonly expectedCloseDate: string | null;
  readonly ownerMembershipId: string | null;
  readonly departmentId: string | null;
  readonly rowVersion: number;
  readonly updatedAt: string;
}

interface R6Collection<T> {
  readonly items: readonly T[];
}

export function useR6Collection<T>(url: string) {
  const [items, setItems] = useState<readonly T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(url, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`R6_API_${response.status}`);
        }

        const payload = (await response.json()) as R6Collection<T>;
        setItems(Array.isArray(payload.items) ? payload.items : []);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setItems([]);
        setError(cause instanceof Error ? cause.message : "R6_API_UNAVAILABLE");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [url]);

  return { items, loading, error };
}
