"use client";

import { useEffect, useState } from "react";
import { fetchQualifiedR6List } from "@/modules/r6/ui-client";
import {
  DealsPipeline,
  LeadCRM,
  MeetingsFollowups,
  OutreachHub,
  UnifiedInbox,
} from "@/components/workspace/commercial-screens";
import {
  CompanyDirectoryScreen,
  ContactDirectoryScreen,
  LeadListsScreen,
  SendingAccountsScreen,
} from "@/components/workspace/lead-acquisition-screens";

type Row = Record<string, unknown>;

function BoundSurface({
  surface,
  path,
  children,
}: {
  surface: string;
  path: string;
  children: React.ReactNode;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchQualifiedR6List<Row>(path)
      .then((items) => {
        if (!cancelled) setRows(items);
      })
      .catch(() => {
        if (!cancelled) setError("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return (
    <div data-r6-bound-surface={surface}>
      {error ? <p data-r6-bind-state="unavailable">Qualified list unavailable.</p> : null}
      {rows ? (
        <p data-r6-bind-count={String(rows.length)} hidden>
          {rows.length}
        </p>
      ) : null}
      {children}
    </div>
  );
}

export function BoundDealsPage() {
  return (
    <BoundSurface surface="deals" path="/api/v1/r6/deals">
      <DealsPipeline />
    </BoundSurface>
  );
}

export function BoundLeadsPage() {
  return (
    <BoundSurface surface="leads" path="/api/v1/r6/leads">
      <LeadCRM />
    </BoundSurface>
  );
}

export function BoundPipelinesPage() {
  return (
    <BoundSurface surface="pipelines" path="/api/v1/r6/commercial/pipelines">
      <DealsPipeline />
    </BoundSurface>
  );
}

export function BoundClientsPage() {
  return (
    <BoundSurface surface="clients" path="/api/v1/r6/clients">
      <DealsPipeline />
    </BoundSurface>
  );
}

export function BoundInboxPage() {
  return (
    <BoundSurface surface="inbox" path="/api/v1/r6/inbox/conversations">
      <UnifiedInbox />
    </BoundSurface>
  );
}

export function BoundMeetingsPage() {
  return (
    <BoundSurface surface="meetings" path="/api/v1/r6/meetings">
      <MeetingsFollowups />
    </BoundSurface>
  );
}

export function BoundCampaignsPage() {
  return (
    <BoundSurface surface="campaigns" path="/api/v1/r6/outreach/campaigns">
      <OutreachHub />
    </BoundSurface>
  );
}

export function BoundSequencesPage() {
  return (
    <BoundSurface surface="sequences" path="/api/v1/r6/outreach/sequences">
      <OutreachHub />
    </BoundSurface>
  );
}

export function BoundSendingAccountsPage() {
  return (
    <BoundSurface surface="sending-accounts" path="/api/v1/r6/outreach/sending-accounts">
      <SendingAccountsScreen />
    </BoundSurface>
  );
}

export function BoundCompaniesPage() {
  return (
    <BoundSurface surface="companies" path="/api/v1/r6/crm/companies">
      <CompanyDirectoryScreen />
    </BoundSurface>
  );
}

export function BoundContactsPage() {
  return (
    <BoundSurface surface="contacts" path="/api/v1/r6/crm/contacts">
      <ContactDirectoryScreen />
    </BoundSurface>
  );
}

export function BoundLeadListsPage() {
  return (
    <BoundSurface surface="lead-lists" path="/api/v1/r6/crm/lead-lists">
      <LeadListsScreen />
    </BoundSurface>
  );
}
