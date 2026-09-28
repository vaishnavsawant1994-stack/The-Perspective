"use client";

import { useEffect, useState } from "react";
import { fetchQualifiedR6List } from "@/modules/r6/ui-client";
import { DealsPipeline, LeadCRM } from "@/components/workspace/commercial-screens";

type DealRow = {
  id?: string;
  pipelineId?: string;
  stageId?: string;
  amountMinor?: string | null;
  currency?: string | null;
};

type LeadRow = {
  id?: string;
  companyId?: string | null;
  status?: string;
};

export function BoundDealsPage() {
  const [rows, setRows] = useState<DealRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchQualifiedR6List<DealRow>("/api/v1/r6/deals")
      .then((items) => {
        if (!cancelled) setRows(items);
      })
      .catch(() => {
        if (!cancelled) setError("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-r6-bound-surface="deals">
      {error ? <p data-r6-bind-state="unavailable">Qualified deal list unavailable.</p> : null}
      {rows ? (
        <p data-r6-bind-count={String(rows.length)} hidden>
          {rows.length}
        </p>
      ) : null}
      <DealsPipeline />
    </div>
  );
}

export function BoundLeadsPage() {
  const [rows, setRows] = useState<LeadRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchQualifiedR6List<LeadRow>("/api/v1/r6/crm/leads".replace("/crm/leads", "/leads"))
      .then((items) => {
        if (!cancelled) setRows(items);
      })
      .catch(() => {
        if (!cancelled) setError("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-r6-bound-surface="leads">
      {error ? <p data-r6-bind-state="unavailable">Qualified lead list unavailable.</p> : null}
      {rows ? (
        <p data-r6-bind-count={String(rows.length)} hidden>
          {rows.length}
        </p>
      ) : null}
      <LeadCRM />
    </div>
  );
}
