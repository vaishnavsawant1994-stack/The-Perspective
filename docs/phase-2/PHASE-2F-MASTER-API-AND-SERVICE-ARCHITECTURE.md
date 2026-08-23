# Phase 2F — Master API & Service Architecture

**Status:** Frozen API and service source of truth  
**Depends on:** Phase 2A routes, Phase 2B roles/scopes, Phase 2C entities, Phase 2D workflows, and Phase 2E UI families  
**Purpose:** Define how public, Team Workspace, Client Portal, worker, integration, and reporting surfaces read or change the canonical platform.

## 1. Architecture decision

The Perspective starts as a **modular monolith with explicit domain services**, a PostgreSQL transaction boundary, object storage for immutable asset versions, a transactional outbox, asynchronous workers, authorized search projections, and a separate analytics read model.

```text
Public Website         Team Workspace          Client Portal
      |                       |                       |
      +-----------------------+-----------------------+
                              |
                    Next.js application boundary
                              |
             Authentication + request-context policy
                              |
    +-------------------------+--------------------------+
    |                         |                          |
 Query application API   Command application API   File intent API
    |                         |                          |
    +------------------ domain services ----------------+
                              |
         PostgreSQL + outbox + object metadata registry
                 |                         |
              workers                 object storage
                 |
     integrations / search / analytics projections
```

Services may be extracted only for a measured scaling, isolation, ownership, or deployment need. Extraction must preserve canonical IDs, commands, events, authorization, idempotency, and audit evidence.

## 2. Non-negotiable rules

1. Backend authorization is authoritative; hidden navigation is not access control.
2. Protected operations resolve identity, active membership, organization, permission, scope, ownership, visibility, fields, and workflow guards.
3. Client APIs return explicit client-safe projections, never unrestricted Team Workspace rows.
4. Public APIs expose only currently visible published versions.
5. State changes use typed Phase 2D commands; generic patches cannot bypass transitions.
6. Sensitive writes use optimistic concurrency, idempotency where retry is possible, and audit evidence.
7. Signed, accepted, approved, paid, published, and delivered evidence is immutable or superseded.
8. Money is integer minor units plus ISO currency; timestamps are RFC 3339 UTC with explicit display timezone.
9. Lists use stable sorting and cursor pagination.
10. Large files use short-lived signed operations and immutable asset versions.
11. Metrics expose source, account/property, period, collection time, and verification state.
12. Asynchronous changes use the transactional outbox; webhooks are verified, stored, and deduplicated before processing.

## 3. API surfaces

| Surface | Namespace | Authentication | Projection |
|---|---|---|---|
| Team Workspace | `/api/v1/workspace/*` | Staff membership | Permission + scope + resource/field policy |
| Client Portal | `/api/v1/client/*` | Client membership | Client organization + `CLIENT_SHARED` serializer |
| Public editorial | `/api/v1/public/*` | Anonymous/member | Published public version only |
| Member experience | `/api/v1/member/*` | Reader/member | Ownership and entitlement |
| Upload/download | `/api/v1/files/*` | Surface session | Asset policy + signed intent |
| Provider webhooks | `/api/v1/webhooks/*` | Provider signature | Raw stored event + dedupe |
| Internal workers | Commands/events | Workload identity | Named worker authority |
| Operations | `/api/health/*` | Platform/network policy | No business data |

UI URLs under `/app`, `/client`, and public routes do not dictate API composition. APIs expose stable resources, projections, and commands.

## 4. Request context and authorization

```ts
type RequestContext = {
  requestId: string;
  traceId: string;
  identityId: string;
  activeMembershipId: string;
  ownerOrganizationId: string;
  clientOrganizationId?: string;
  roleIds: string[];
  permissions: string[];
  defaultScopes: Record<string, "ORG" | "DEPT" | "ASN" | "OWN" | "CLIENT" | "READ" | "NONE">;
  timezone: string;
  locale: string;
};
```

The server constructs this context from the authenticated session. A client may request a context switch but never supplies authoritative permissions or ownership filters.

Every protected operation evaluates:

```text
permission key + role scope + organization membership
+ record organization/client/project/department/assignment/owner
+ visibility and sensitivity + field policy
+ workflow stage and action authority + separation of duty
= allow or deny
```

## 5. Layering contract

```text
Route handler / server action
  -> schema parser and request context
  -> application query or command
  -> authorization policy
  -> domain service / aggregate
  -> repository transaction
  -> outbox + activity + audit
  -> response projection
```

- Route handlers translate HTTP and never own transition rules.
- Server actions call the same application layer and always re-authorize.
- Application services coordinate use cases and atomic transactions.
- Domain services own invariants, transitions, calculations, and exact-version binding.
- Repositories apply organization/resource filters by construction and use compare-and-swap.
- Provider adapters implement domain-owned ports; domain code does not import provider SDK types.

## 6. Logical service ownership

| Service | Owns |
|---|---|
| Identity & Session | Login, MFA, session, membership selection, recovery |
| Authorization Policy | Permission, scope, fields, workflow authority, separation of duty |
| Organization & Team | Departments, teams, employees, capacity, skills |
| Lead Intelligence | Sources, extraction, staging, enrichment, dedupe, qualification |
| CRM | Leads, companies, contacts, lists, ownership, scoring |
| Outreach | Campaigns, audience/sequence versions, sending rules |
| Communications | Inbox, messages, threads, replies, suppression |
| Calendar | Meetings, schedules, recurrence, availability, reminders |
| Commercial | Deals, products, proposals, contracts, renewals |
| Finance | Invoices, payments, allocations, credits, refunds, ledger |
| Client | Client 360, contacts, health, onboarding |
| Delivery | Projects, workflows, stages, milestones, tasks, dependencies |
| Editorial | Briefs, questionnaires, research, drafts, reviews |
| Magazine | Issues, covers, pages, layouts, proofs, reader builds |
| Podcast | Shows, episodes, guests, recordings, audio, transcript, clips |
| Video | Scripts, shoots, footage, edits, captions, thumbnails, clips |
| Events | Events, speakers, partners, agenda, registration, logistics |
| Asset | Files, immutable versions, rights, renditions, links |
| Approval | Requests, exact reviewed versions, steps, decisions |
| Publishing | Readiness, targets, schedules, jobs, release versions, live URLs |
| Distribution | Campaigns, channel items, copy, schedules, live evidence |
| Reporting | Reports, metrics, provenance, verification, immutable delivery |
| Analytics | Versioned read models, trends, comparisons, aggregates |
| Platform | Activity, notifications, automation, integrations, support, outbox |
| Audit | Append-only sensitive and security evidence |
| Search | Authorized indexed projections and suggestions |

These are code ownership boundaries inside the initial application, not independently deployed network services.

## 7. Contract standards

### Collection success

```json
{
  "data": [],
  "page": { "nextCursor": null, "hasMore": false },
  "meta": { "requestId": "req_...", "generatedAt": "2026-08-21T10:30:00Z" }
}
```

### Error response

Use `application/problem+json`:

```json
{
  "type": "https://api.theperspective.com/problems/workflow-guard-failed",
  "title": "Workflow guard failed",
  "status": 409,
  "code": "CONTRACT_SIGNATURE_REQUIRED",
  "detail": "The deal cannot move to WON until the required contract is signed.",
  "requestId": "req_...",
  "fieldErrors": []
}
```

| Status | Meaning |
|---:|---|
| 400 | Malformed request or unsupported filter |
| 401 | No valid session |
| 403 | Permission, scope, field, or action denied |
| 404 | Missing or intentionally concealed resource |
| 409 | Workflow, duplicate, or idempotency conflict |
| 412 | `If-Match` precondition failed |
| 422 | Field/domain validation failed |
| 429 | Caller/provider rate limit |
| 503 | Required dependency unavailable |

### Lists and concurrency

```text
?cursor=<opaque>&limit=25&sort=-updatedAt,title
&filter[status]=READY_TO_PUBLISH&filter[ownerId]=...
```

- Default limit 25; maximum interactive limit 100.
- Unknown filters/sorts return `400`.
- Mutable resources return `ETag`; dependent updates send `If-Match`.
- Stale versions return `412` with a safe refresh action.

### Idempotency

`Idempotency-Key` is required for conversions, invoices, payment/refund actions, approvals, publications, distributions, exports, sends, provider jobs, webhooks, and retryable worker commands. Reuse with a different normalized payload returns `409`.

## 8. Query and command shape

Draft/configuration fields may use CRUD. Lifecycles use commands:

```text
GET    /api/v1/workspace/deals/{dealId}
PATCH  /api/v1/workspace/deals/{dealId}
POST   /api/v1/workspace/deals/{dealId}/commands/move-stage
POST   /api/v1/workspace/deals/{dealId}/commands/mark-won

GET    /api/v1/workspace/approvals/{approvalId}
POST   /api/v1/workspace/approvals/{approvalId}/commands/approve
POST   /api/v1/workspace/approvals/{approvalId}/commands/request-changes
```

The service derives actor, authority, timestamps, state, side effects, and events. The request supplies only user facts, reason, expected version, and optional correlation.

## 9. Endpoint catalog

### Identity, organization, and access

```text
POST /api/v1/auth/login
POST /api/v1/auth/mfa/verify
POST /api/v1/auth/logout
POST /api/v1/auth/recovery/request
POST /api/v1/auth/recovery/complete
GET  /api/v1/workspace/session
GET/PATCH /api/v1/workspace/organizations/current
GET/POST  /api/v1/workspace/employees
GET/PATCH /api/v1/workspace/employees/{employeeId}
GET /api/v1/workspace/departments
GET /api/v1/workspace/teams
GET/POST /api/v1/workspace/roles
GET/PUT  /api/v1/workspace/roles/{roleId}/permissions
```

Role changes require `permission.manage`, reason, optimistic concurrency, separation-of-duty validation, and audit.

### CRM and lead intelligence

```text
GET/POST /api/v1/workspace/lead-searches
GET/POST /api/v1/workspace/extraction-jobs
POST /api/v1/workspace/extraction-jobs/{id}/commands/start|retry
GET  /api/v1/workspace/extraction-jobs/{id}/staged-records
POST /api/v1/workspace/staged-records/commands/approve
GET/POST /api/v1/workspace/enrichment-jobs
POST /api/v1/workspace/enrichment-jobs/{id}/commands/accept
GET/POST  /api/v1/workspace/leads
GET/PATCH /api/v1/workspace/leads/{leadId}
POST /api/v1/workspace/leads/{leadId}/commands/qualify|convert
GET/POST  /api/v1/workspace/companies
GET/PATCH /api/v1/workspace/companies/{companyId}
GET/POST  /api/v1/workspace/contacts
GET/PATCH /api/v1/workspace/contacts/{contactId}
GET/POST  /api/v1/workspace/lead-lists
```

### Outreach, inbox, and calendar

```text
GET/POST  /api/v1/workspace/outreach-campaigns
GET/PATCH /api/v1/workspace/outreach-campaigns/{campaignId}
POST /api/v1/workspace/outreach-campaigns/{id}/commands/submit|launch|pause
GET/POST /api/v1/workspace/outreach-campaigns/{id}/sequence-versions
GET /api/v1/workspace/conversations
GET /api/v1/workspace/conversations/{conversationId}
POST /api/v1/workspace/conversations/{id}/messages
POST /api/v1/workspace/conversations/{id}/internal-notes
POST /api/v1/workspace/conversations/{id}/commands/assign|snooze|resolve
GET/POST  /api/v1/workspace/calendar-events
GET/PATCH /api/v1/workspace/calendar-events/{eventId}
POST /api/v1/workspace/calendar-events/{id}/commands/reschedule|complete
GET /api/v1/workspace/availability
```

Dispatch rechecks sender health, audience version, suppression, rate, schedule, approval, and legal/consent rules.

### Commercial and finance

```text
GET/POST  /api/v1/workspace/deals
GET/PATCH /api/v1/workspace/deals/{dealId}
POST /api/v1/workspace/deals/{id}/commands/move-stage|mark-won
GET/POST /api/v1/workspace/deals/{id}/proposals
POST /api/v1/workspace/proposals/{id}/commands/request-approval|send|create-revision
GET/POST /api/v1/workspace/contracts
POST /api/v1/workspace/contracts/{id}/commands/send|create-amendment
GET/POST /api/v1/workspace/invoices
POST /api/v1/workspace/invoices/{id}/commands/approve|send|record-manual-payment
GET /api/v1/workspace/payments
POST /api/v1/workspace/payments/{id}/commands/refund
GET/POST /api/v1/workspace/renewal-opportunities
```

Payment state comes from verified provider/manual evidence and allocations. There is no generic `PATCH status=PAID`.

### Clients, projects, workflows, and tasks

```text
GET/POST  /api/v1/workspace/clients
GET/PATCH /api/v1/workspace/clients/{clientId}
GET /api/v1/workspace/clients/{clientId}/overview
GET/POST /api/v1/workspace/client-onboardings
POST /api/v1/workspace/client-onboardings/{id}/commands/invite-portal|complete
GET/POST  /api/v1/workspace/projects
GET/PATCH /api/v1/workspace/projects/{projectId}
GET /api/v1/workspace/projects/{projectId}/overview
POST /api/v1/workspace/projects/{id}/commands/move-stage
GET/POST  /api/v1/workspace/tasks
GET/PATCH /api/v1/workspace/tasks/{taskId}
POST /api/v1/workspace/tasks/{id}/commands/move-status|block|complete
POST /api/v1/workspace/tasks/{id}/comments
GET /api/v1/workspace/workload
GET /api/v1/workspace/workflows/{workflowId}
```

### Editorial and specialized production

```text
GET/POST /api/v1/workspace/editorial-works
GET /api/v1/workspace/editorial-works/{id}/overview
GET/POST /api/v1/workspace/editorial-works/{id}/draft-versions
POST /api/v1/workspace/editorial-works/{id}/commands/submit-internal-review|request-client-review
GET/POST /api/v1/workspace/magazine-issues
GET /api/v1/workspace/magazine-issues/{id}/production-overview
GET/POST /api/v1/workspace/podcast-episodes
GET /api/v1/workspace/podcast-episodes/{id}/production-overview
GET/POST /api/v1/workspace/video-productions
GET /api/v1/workspace/video-productions/{id}/production-overview
GET/POST /api/v1/workspace/events
GET /api/v1/workspace/events/{id}/operations-overview
GET/POST /api/v1/workspace/events/{id}/agenda-items|registrations
```

Specialized services attach typed records to shared projects, workflows, tasks, assets, approvals, calendar, publishing, distribution, and reporting.

### Assets and approvals

```text
GET/POST /api/v1/workspace/assets
GET /api/v1/workspace/assets/{assetId}
POST /api/v1/workspace/assets/{assetId}/versions
POST /api/v1/files/upload-intents
POST /api/v1/files/upload-intents/{intentId}/complete
GET  /api/v1/files/{assetVersionId}/download-intent
GET/POST /api/v1/workspace/approval-requests
GET /api/v1/workspace/approval-requests/{approvalId}
POST /api/v1/workspace/approval-requests/{id}/commands/approve|request-changes|reject|reassign
```

Approval requests bind an immutable reviewed version ID and hash. Upload completion verifies key, checksum, size, type, actor, and intended resource.

### Publishing, distribution, reporting, and analytics

```text
GET /api/v1/workspace/publication-queue
GET/POST /api/v1/workspace/publications
GET /api/v1/workspace/publications/{id}/readiness
POST /api/v1/workspace/publications/{id}/commands/schedule|publish|retry|unpublish|create-correction
GET/POST /api/v1/workspace/distribution-campaigns
GET /api/v1/workspace/distribution-campaigns/{id}
POST /api/v1/workspace/distribution-items/{id}/commands/schedule|publish|retry|verify-live-url
GET/POST /api/v1/workspace/reports
GET /api/v1/workspace/reports/{id}
POST /api/v1/workspace/reports/{id}/commands/refresh-metrics|verify-metric|deliver
GET /api/v1/workspace/analytics
```

Publication/distribution commands are idempotent per target and immutable version. They retain provider ID, input version, response evidence, live URL, verification, and timestamp.

### Audit, settings, search, and notifications

```text
GET /api/v1/workspace/audit-events
GET /api/v1/workspace/audit-events/{eventId}
POST /api/v1/workspace/audit-events/{eventId}/flags
GET /api/v1/workspace/settings
PATCH /api/v1/workspace/settings/{group}
GET /api/v1/workspace/settings/history
GET/POST /api/v1/workspace/integrations
POST /api/v1/workspace/integrations/{id}/commands/test
GET /api/v1/workspace/search
GET /api/v1/workspace/notifications
POST /api/v1/workspace/notifications/{id}/commands/read
GET/PATCH /api/v1/workspace/notification-preferences
```

Audit bodies are immutable. A flag creates a related review record/event.

## 10. Client Portal boundary

```text
GET /api/v1/client/dashboard
GET /api/v1/client/projects
GET /api/v1/client/projects/{projectId}
GET /api/v1/client/messages
POST /api/v1/client/messages/{conversationId}/replies
GET /api/v1/client/tasks
POST /api/v1/client/tasks/{taskId}/commands/complete
GET /api/v1/client/questionnaires
POST /api/v1/client/questionnaires/{id}/responses
POST /api/v1/client/questionnaires/{id}/commands/submit
GET /api/v1/client/reviews
POST /api/v1/client/approval-requests/{id}/commands/approve|request-changes
GET /api/v1/client/assets
POST /api/v1/client/assets/upload-intents
GET /api/v1/client/contracts|invoices|payments
GET /api/v1/client/publications|distribution|reports|downloads
GET/POST /api/v1/client/support-cases
GET/PATCH /api/v1/client/profile
```

These projections omit internal notes/review, margins, employee performance, CRM/prospect data, other clients, unrestricted finance, credentials, audit logs, and settings.

## 11. Public boundary

```text
GET /api/v1/public/home|latest|search
GET /api/v1/public/articles/{slug}
GET /api/v1/public/topics/{slug}
GET /api/v1/public/authors/{slug}
GET /api/v1/public/people/{slug}
GET /api/v1/public/magazines/{issueSlug}
GET /api/v1/public/podcasts/{showSlug}/episodes/{episodeSlug}
GET /api/v1/public/videos/{slug}
GET /api/v1/public/events/{slug}
```

Draft existence, internal IDs, review comments, and private assets are not discoverable through public errors, search, metadata, or caches.

## 12. Events and workers

```json
{
  "eventId": "evt_...",
  "eventType": "publication.published.v1",
  "occurredAt": "2026-08-21T10:30:00Z",
  "aggregateType": "publication",
  "aggregateId": "...",
  "aggregateVersion": 8,
  "ownerOrganizationId": "...",
  "clientOrganizationId": "...",
  "projectId": "...",
  "actor": { "type": "membership", "id": "..." },
  "correlationId": "...",
  "causationId": "...",
  "data": {}
}
```

- Payloads contain stable IDs and bounded facts, not full sensitive rows.
- Consumers deduplicate by `eventId`; ordering is per aggregate.
- Failures use exponential retry, dead-letter review, and controlled replay.
- Breaking event schemas create a new event version.

Worker families: extraction/enrichment, communication, media processing, publishing, distribution, reporting ingestion, notifications, SLA/automation, search projection, and controlled audit export.

## 13. Webhooks and provider integrations

1. Read raw bytes and verify provider signature/timestamp.
2. Resolve provider account and derive provider event ID.
3. Store immutable payload, allowed headers, verification, and receipt time.
4. Deduplicate by provider + account + event ID.
5. Acknowledge quickly, then process asynchronously.
6. Apply an idempotent domain command.
7. Record activity/audit when business state changes.

Unknown events are stored as unsupported, never silently discarded.

## 14. Files and media

```text
Authorize upload intent -> issue short-lived signed upload
-> direct object upload -> verify checksum/type/size
-> scan/quarantine -> create immutable asset version
-> create authorized resource link -> generate derivatives
```

Downloads are authorized per request. Client-shared names never reveal internal paths. Replacing a file creates a version; image/audio/video renditions are derivatives linked to the source version.

## 15. Search, analytics, and caching

Search documents carry organization, client, project, visibility, sensitivity, type, owner, department, and assignment filters. Client search uses a client-safe projection. Authorization filters are server-derived.

Every metric observation stores definition, subject, source/provider, account/property, period, value/unit, collection time, evidence reference, verification, verifier, and verification time.

| Data | Cache policy |
|---|---|
| Public published content | CDN by release version; tag invalidation |
| Public listings | Short CDN cache; publication-event invalidation |
| Team lists | Private short cache; never shared across identities |
| Client projections | Private client-scoped cache |
| Permissions/session | Short cache; immediate access-change invalidation |
| Finance/payment | No stale mutation decisions; cautious read cache |
| Analytics | Metric snapshot/version + filter tuple |
| Signed URLs | Never beyond signed expiry |

## 16. Security and observability

- HTTP-only same-site session cookies, session rotation, CSRF protection, and MFA for privileged policy.
- Schema validation at HTTP and domain boundaries; rich text sanitized.
- Redirects, object keys, sort fields, and query operators use allowlists.
- Secrets, tokens, payment data, provider payloads, and unnecessary PII are redacted from logs.
- Rate limits cover authentication, search/export, messages, enrichment, publishing, and provider commands.
- Structured telemetry includes request/trace/correlation, module, operation, status, duration, retry, dependency, and safe resource IDs.
- Sensitive commands atomically write actor, authority, reason, entity, allowlisted before/after, source, time, correlation, and result to append-only audit.

Operational dashboards cover API latency/error/saturation, database health, outbox age, worker lag/dead letters, webhook verification, provider health, media queues, search lag, and permission/security signals.

## 17. UI-family mapping

This maps all 151 Phase 2E routed screens through their reusable families.

| UI family | Queries | Commands |
|---|---|---|
| Team/Client shell | session, context, navigation, notifications, search | switch context, mark read |
| Auth | challenge, invite/recovery status | login, MFA, accept, recover |
| Dashboards | authorized aggregate projections | drill-down; resource commands only |
| Lead Finder / Pipeline jobs | searches, providers, jobs, staged rows | run, retry, approve, merge |
| Record list/detail | leads, companies, contacts, clients, employees | create, edit allowed fields, assign, archive |
| Campaign / Sequence | campaign, audience/version, performance | submit, approve, launch, pause, version |
| Inbox / Calendar | conversations, messages, availability, events | reply, note, assign, snooze, reschedule, complete |
| Commercial | deal, proposal, contract, invoice projections | guarded transition and immutable revision commands |
| Client / Onboarding | Client 360 and onboarding | invite, request input, complete gate |
| Project / Tasks | project/workflow/task/dependency/workload | move, block, assign, comment, complete |
| Editorial / Production | typed production + shared project systems | version, review, approve, publication-ready |
| Assets / Approvals | assets, versions, rights, exact-version review | upload/version/share, decide/reassign |
| Publishing / Distribution | readiness, schedules, jobs, evidence | schedule, publish, retry, verify, correct |
| Reporting / Analytics | reports, observations, provenance, aggregates | refresh, verify, deliver, export |
| Roles / Audit / Settings | policies, immutable events, config/history | policy update, review flag, config/test |
| Client variants | client-safe project/task/review/finance/report data | submit, comment, approve, upload, provider pay |

## 18. Implementation structure and tests

```text
src/
  app/api/v1/                 HTTP boundaries
  server/auth/                session and request context
  server/policy/              permission/scope/field/workflow authority
  server/application/         commands and queries
  server/domains/             explicit domain modules
  server/repositories/        organization-safe persistence
  server/projections/         workspace/client/public serializers
  server/integrations/        provider adapters
  server/observability/       telemetry and audit helpers
  workers/                    outbox consumers and scheduled jobs
  contracts/api/              request/response schemas
  contracts/events/           versioned event schemas
```

Required tests:

1. request/response contract tests;
2. every Phase 2D transition and guard;
3. all 17 roles across seven scope values;
4. organization/client isolation and client-field leakage;
5. state + history + outbox + audit atomicity;
6. webhook signature, dedupe, order, retry, unknown event;
7. idempotency and optimistic concurrency;
8. asset upload/scan/version authorization;
9. lead-to-renewal end-to-end path;
10. negative tests for cross-client access, self-escalation, skipped guards, wrong approval version, unsupported paid status, unapproved publication, changed-payload idempotency reuse, and audit mutation.

## 19. Delivery sequence

1. Session, request context, policy evaluator, problem envelope, request IDs.
2. Repositories, transaction manager, outbox, activity, and audit primitives.
3. Asset upload/version and exact-version resource binding.
4. CRM and lead workflow.
5. Outreach, communications, and calendar.
6. Commercial, finance, and verified payment webhooks.
7. Client, onboarding, project, task, and workflow.
8. Editorial and specialized production.
9. Approval, publishing, distribution, and reporting.
10. Client-safe and public published projections.
11. Search, analytics, automation, settings, and controlled export.
12. Performance, resilience, security, and disaster-recovery hardening.

Each slice includes authorization, audit, idempotency, observability, tests, and UI integration.

## 20. Acceptance

- [x] Versioned staff, client, public, file, webhook, and worker boundaries.
- [x] Domain ownership aligned with Phase 2C.
- [x] Query/command separation aligned with Phase 2D.
- [x] Organization/client/assignment/visibility/field/workflow authorization.
- [x] Error, pagination, filtering, concurrency, and idempotency standards.
- [x] Major-domain endpoint catalog.
- [x] Outbox/event, webhook, file, search, analytics, cache, audit, and observability rules.
- [x] Client-safe and public projection boundaries.
- [x] UI-family mapping covering the Phase 2E route set.
- [x] Test and delivery sequence.

Phase 2F is frozen. The next architecture phase is **Phase 2G — Implementation Roadmap**: engineering epics, migrations, test gates, deployment stages, and release criteria.
