# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 123 — Project Archive / Completed Project Detail

Design 123 should become the **canonical Team Workspace historical Project composition, archived-project access, retained delivery evidence, and post-completion reference surface** for Projects whose active delivery lifecycle is finished.

It must reuse the exact canonical Project from Design 023 and the completed evidence established through Designs 111–122. It must not create a copied `ArchivedProject` data domain or flatten completed Project history into a static snapshot that loses Tasks, versions, Approvals, Change Requests, Handover, Retrospective, Activity, or Audit lineage.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Project ≠ ProjectCompletionRecord ≠ ProjectArchiveRecord ≠ ArchivedProjectDetailView ≠ ArchiveState ≠ Delete/Purge ≠ RetentionPolicy ≠ ClientAccess ≠ FinalHandover ≠ Retrospective ≠ Activity/Audit ≠ Current Mutable Project Workspace.**

The central implementation rule is:

> **Archiving changes how a completed Project is retained, surfaced, and ordinarily edited; it does not create a new Project identity, erase historical source records, rewrite completion evidence, delete files, revoke Client access, settle Finance, or collapse all Project history into a copied archive object. The same canonical Project ID and source-domain records must remain reconstructable. Archive is reversible only through an explicit governed restoration operation if restoration is supported; deletion/purge remains a completely separate retention action.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **123**                                                                                                                                                                                  |
| **Canonical name**                 | **Project Archive / Completed Project Detail**                                                                                                                                           |
| **Product area**                   | Team Workspace / Projects / Historical Records                                                                                                                                           |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                                         |
| **Screen class**                   | Historical Entity Detail Variant / Completed Project Reference Workspace                                                                                                                 |
| **Classification**                 | **Canonical Completed-Project Historical Composition, Archive-State & Retained-Evidence Anchor**                                                                                         |
| **Primary purpose**                | Present a completed/archived Project as a stable historical composition while retaining exact completion, delivery, approval, schedule, activity, commercial, and retrospective evidence |
| **Primary parent**                 | **Project** — Design 023                                                                                                                                                                 |
| **Completion evidence**            | **ProjectCompletionRecord** — Design 120                                                                                                                                                 |
| **Archive evidence**               | `ProjectArchiveRecord` or equivalent lifecycle-transition evidence                                                                                                                       |
| **Historical view**                | `ArchivedProjectDetailView`                                                                                                                                                              |
| **Task/Milestone history**         | Design 111                                                                                                                                                                               |
| **Project team/resource history**  | Design 112                                                                                                                                                                               |
| **Risk/Blocker history**           | Design 113                                                                                                                                                                               |
| **File/Deliverable history**       | Design 114                                                                                                                                                                               |
| **Approval history**               | Design 115                                                                                                                                                                               |
| **Client dependency history**      | Design 116                                                                                                                                                                               |
| **Change-control history**         | Design 117                                                                                                                                                                               |
| **Schedule/baseline history**      | Design 118                                                                                                                                                                               |
| **Activity/Audit history**         | Design 119 / Design 039                                                                                                                                                                  |
| **Closeout evidence**              | Design 120                                                                                                                                                                               |
| **Final Handover evidence**        | Design 121                                                                                                                                                                               |
| **Retrospective evidence**         | Design 122                                                                                                                                                                               |
| **Client Portal boundary**         | Designs 041–077                                                                                                                                                                          |
| **Reporting dependency**           | Designs 033 / 131–134                                                                                                                                                                    |
| **Analytics dependency**           | Design 038 / later 135–137                                                                                                                                                               |
| **Search dependency**              | Design 079                                                                                                                                                                               |
| **Primary query service**          | `ArchivedProjectDetailQueryService`                                                                                                                                                      |
| **Archive service**                | `ProjectArchiveService`                                                                                                                                                                  |
| **Historical composition service** | `ProjectHistoricalCompositionService`                                                                                                                                                    |
| **Retention resolver**             | `ProjectRetentionPolicyResolver`                                                                                                                                                         |
| **Restore service**                | `ProjectArchiveRestoreService` if restoration is supported                                                                                                                               |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                                          |
| **Auth**                           | Required                                                                                                                                                                                 |
| **Authorization**                  | Active OrganizationMembership + archive/history/source permissions                                                                                                                       |
| **Implementation priority**        | **Critical Historical Integrity / Retention / Reference Safety**                                                                                                                         |
| **Reuse level**                    | **Extremely High across reporting, renewals, analytics, Audit, client history and organizational learning**                                                                              |

Design 123 should answer:

> **“What was this Project, when and why did it complete, what exact Deliverables and versions were handed over, what Approvals and Change Requests occurred, what was the final schedule/outcome, what lessons were captured, what remains accessible historically, and what does ‘archived’ mean without rewriting any of those facts?”**

Canonical composition:

```text
Project PR-100
      │
      ├── ProjectCompletionRecord
      ├── Tasks / Milestones
      ├── Team / Resources
      ├── Risks / Blockers
      ├── Deliverables / exact versions
      ├── Approval history
      ├── Client Requests
      ├── Change Requests
      ├── Schedule baselines / actuals
      ├── Final Handover
      ├── Retrospective
      └── Activity / Audit
               │
               ↓
   ProjectHistoricalCompositionService
               │
               ↓
      ArchivedProjectDetailView

Same Project ID.
No cloned ArchivedProject.
```

---

# 2. Reuse

## Design 023 remains canonical Project identity

This is the strongest rule.

Correct:

```text
Project PR-100
ACTIVE
  ↓
COMPLETED
  ↓
ARCHIVED
```

Same:

```text
projectId = PR-100
```

throughout.

Do not create:

```text
ArchivedProject AP-100
```

as a copied replacement.

---

## Archived Project ≠ copied Project

Permanent.

Avoid:

```text
INSERT INTO archived_projects
SELECT * FROM projects...
DELETE FROM projects...
```

That pattern breaks:

* foreign keys;
* Activity lineage;
* Approval history;
* Deliverable references;
* Reporting;
* Search;
* Audit;
* Client access.

Archive should be a governed lifecycle/retention state over the existing canonical entity.

---

## ProjectCompletionRecord remains Design 120 authority

Archive consumes:

```text
ProjectCompletionRecord
```

to answer:

* when Project completed;
* who completed it;
* under which closeout policy;
* what requirements passed/overrode.

Archive does not recreate completion evidence.

---

## Completion ≠ Archive

Absolute.

Correct:

```text
Completed Aug 22

Archived Sep 30
```

Those are different business facts.

---

## Archive ≠ Delete

Critical.

### Archive

Retain Project/history but remove it from normal active operations.

### Delete/Purge

Destroy or irreversibly remove data under retention/privacy policy.

These must never share the same action.

---

## Archive ≠ Cancel

Permanent.

A cancelled Project is a lifecycle outcome.

An archived Project is a retention/operational state.

A cancelled Project might later also be archived under policy.

---

## Archive ≠ Inactive Client

Permanent.

Archiving one Project does not change the ClientRelationship.

---

## Archive ≠ Client Portal revocation

Critical.

Client access to:

* historical Deliverables;
* Handover;
* Reports;
* Contracts;

must be governed separately.

Archiving an internal Project must not silently revoke Client Portal rights.

---

## Design 121 remains Handover authority

Archived detail should show:

```text
FinalHandover H-20
```

with exact historical artifact versions.

It must not reconstruct:

> final files

from current Asset versions.

---

## Design 114 remains Deliverable/File authority

Archived Project detail references canonical:

```text
Deliverable
FileVersion
ProofVersion
ReportVersion
...
```

Historical versions remain exact.

---

## Archived ≠ “latest version”

For historical evidence:

```text
Deliverable D-10
Handed-over version = v7
Current Asset version = v9
```

Archive must preserve v7 as the actual delivered version.

---

## Design 115 remains Approval authority

Archive shows formal Approval history.

It never stores copied:

```text
archivedProject.approvals = [...]
```

as another mutable source.

---

## Design 117 remains Change-control authority

Archive composes:

* submitted versions;
* rejected versions;
* approved/applied versions;
* application evidence.

Do not reduce this to:

> Scope changed 3 times

as the only retained record.

---

## Design 118 remains schedule authority

Historical completed detail can show:

* original baseline;
* revised baselines;
* final forecast;
* actual dates;
* variance.

It must not derive schedule history from Activity prose.

---

## Design 119 remains Activity history

Archive consumes Activity.

It does not become the Activity store.

---

## Design 122 remains Retrospective authority

Archive surfaces the Retrospective and Lessons Learned.

Archiving does not:

* finalize it;
* delete it;
* publish lessons globally.

---

## Design 057 Renewal remains separate

Archived/completed Project can provide historical context for:

```text
RenewalOpportunity
```

but Archive cannot create renewal automatically.

---

# 3. Entities

## Project

The same stable canonical identity remains central.

Conceptually:

```text
Project
├── id
├── organizationId
├── lifecycle
├── archiveState / archivedAt?
├── completedAt? projection
└── revision
```

Exact physical storage belongs to Phase 3D.

---

## Project lifecycle ≠ Archive state necessarily

This distinction is worth preserving.

Potentially:

```text
Project lifecycle = COMPLETED
Archive state      = ARCHIVED
```

rather than overloading a single enum.

Why?

Because lifecycle answers:

> What happened to delivery?

Archive state answers:

> How is the completed record operationally retained/surfaced?

Phase 3D should decide whether these are one well-defined state machine or two orthogonal dimensions.

Do not collapse them prematurely.

---

## ProjectArchiveRecord

A durable archive-transition record is strongly useful.

Conceptually:

```text
ProjectArchiveRecord
├── id
├── projectId
├── archivedBy
├── archivedAt
├── reason?
├── sourceProjectRevision
├── retentionPolicyVersionId?
├── previousArchiveState
├── resultingArchiveState
└── correlationId
```

This records the archive decision.

---

## ProjectArchiveRecord ≠ ProjectCompletionRecord

Critical.

One proves:

> delivery completed.

The other proves:

> historical/operational archive action occurred.

---

## ArchiveRecord should be immutable evidence

If Project is restored and archived again:

preserve:

```text
ArchiveRecord #1
RestoreRecord #1
ArchiveRecord #2
```

rather than overwriting the original archive date.

---

## ArchivedProjectDetailView

A read projection only.

Conceptually:

```text
ArchivedProjectDetailView
├── Project summary
├── Completion evidence
├── Client/Company context
├── final Team
├── Tasks/Milestones summary
├── Risks/Blockers
├── Deliverables/Handover
├── Approvals
├── Client dependencies
├── Changes
├── schedule outcome
├── Retrospective
├── reports/publications
└── Activity/Audit summaries
```

It is rebuildable.

---

## Historical view ≠ snapshot clone

Critical.

A materialized historical view is acceptable for performance.

But its authority continues to come from canonical source records/evidence.

---

## Historical display snapshots

Some current entities can change after Project completion:

```text
Company name
Contact name
Employee title
Product/package label
```

Where historical semantics require exact past display context, use canonical historical snapshots already captured by:

* ContractVersion;
* ProposalVersion;
* InvoiceVersion;
* CompletionRecord;
* Handover;
* Actor snapshots.

Do not let current names rewrite legal/commercial history.

---

## Current client name ≠ historical contractual client snapshot

Permanent.

Archive can display both if useful:

> Current company: Acme Global
> Contracted as: Acme Media Ltd.

where canonical data supports it.

---

## ArchiveState

Conceptually:

```text
ACTIVE_RECORD
ARCHIVED
RESTORED
PURGE_PENDING?
```

Do not freeze exact enum now.

`PURGE_PENDING` should only exist if the product genuinely supports retention destruction workflows.

---

## Archive state ≠ Project lifecycle

Permanent architectural consideration.

---

## RetentionPolicy

Archive should respect a versioned retention policy if retention rules matter.

Conceptually:

```text
RetentionPolicy
└── RetentionPolicyVersion
```

may define:

* minimum retention duration;
* which evidence must remain;
* eventual purge eligibility;
* legal/contractual restrictions.

Do not invent full records-management functionality if not needed in the frozen UI.

---

## Retention policy ≠ archive command

Permanent.

Archiving can happen today while retention requires keeping the record for years.

---

## Legal/compliance hold

If later required, it should block purge—not ordinary historical viewing.

Do not invent a new screen here.

---

## Restore / Unarchive

If supported:

```text
ProjectArchiveRestoreRecord
├── projectId
├── previousArchiveRecordId
├── restoredBy
├── restoredAt
├── reason
└── resultingArchiveState
```

or equivalent lifecycle evidence.

---

## Restore ≠ reopen completed Project

Critical.

This is subtle.

### Restore/unarchive

> Make the historical Project operationally visible again.

### Reopen Project

> Change Project lifecycle from Completed back to active delivery.

These are **not necessarily the same action**.

Example:

```text
Project lifecycle = COMPLETED
Archive state = ARCHIVED

Restore archive:
Project lifecycle = COMPLETED
Archive state = ACTIVE_RECORD
```

Still completed.

If new work is required:

Design 120's governed reopen logic handles lifecycle change.

---

## Archive reason

If stored:

it is administrative context.

It must not be confused with:

* Project cancellation reason;
* completion reason;
* Retrospective lesson.

---

# 4. Permissions

Design 123 should conceptually distinguish:

```text
projectArchive.read
projectArchive.archive
projectArchive.restore

completedProject.read
completedProject.readSensitive

projectHistory.read
projectAudit.read

projectRetention.read
projectRetention.manage
```

Exact permission names belong to Phase 3D.

---

## Project read ≠ archive Project

Absolute.

---

## Project completion permission ≠ Archive permission

Permanent.

The person authorized to mark delivery complete need not control retention.

---

## Archive permission ≠ reopen Project

Critical.

---

## Restore archive permission ≠ reopen delivery lifecycle

Permanent.

---

## Archive permission ≠ delete/purge permission

Absolute.

Deletion must be much more strongly governed if it exists.

---

## Historical Project read ≠ all source history access

A user might see:

> Final Contract signed

without permission to open sensitive Contract detail.

---

## Sensitive finance/legal history reauthorizes

Permanent.

---

## Activity read ≠ Audit read

Design 039 separation remains.

---

## Archive does not broaden permissions

A user who lacked access to Finance while the Project was active does not gain it because the Project is archived.

---

## Client Portal access remains independent

Archiving internal Team Workspace state cannot revoke or grant:

```text
ClientPortalMembership
ClientAssetAccess
ReportAccess
```

automatically.

---

## Direct archived Project ID reauthorizes

Permanent.

---

## Archived source links reauthorize

Permanent.

---

## Export historical Project may require separate permission

If the frozen design includes export/download-all.

Do not assume archive read implies bulk data export.

---

## Cross-tenant archive access prohibited

Absolute.

---

# 5. States

Design 123 must keep **Project lifecycle, Archive state, source-domain state, retention state, Client access, and historical-view availability** independent.

### Project lifecycle

Conceptually:

```text
Active
Completed
Cancelled
```

### Archive state

Conceptually:

```text
Not Archived
Archived
Restored
```

### Historical view

```text
Available
Partial
Restricted
Unavailable
```

### Retention

Conceptually:

```text
Retained
Eligible for Review
Purge Restricted
Unknown
```

only if retention management exists.

These must never collapse into one generic `archivedProject.status`.

---

## Completed ≠ Archived

Absolute.

---

## Archived ≠ Deleted

Absolute.

---

## Restored ≠ Reopened

Critical.

---

## Archived ≠ Read-only source records universally

The Project historical composition should ordinarily be non-mutating.

But underlying domains may still support separately governed actions such as:

* invoice payment;
* report access;
* Client downloads;
* renewal creation.

Archive cannot globally freeze unrelated business processes unless policy says so.

---

## Archived Project ≠ inaccessible Project

Permanent.

Authorized historical access remains.

---

## Archived Project ≠ invisible to Search

Search may hide Archived by default or require a filter.

But the canonical searchable entity remains.

---

## Archived Project ≠ excluded from Analytics

Historical analytics normally require it.

Filtering active vs archived is a query concern.

---

## Archived ≠ Client access revoked

Absolute.

---

## Archived ≠ Handover expired

Permanent.

---

## Archived ≠ Retrospective deleted

Permanent.

---

## Archived ≠ Finance cancelled

Absolute.

---

## Archive service unavailable ≠ Project deleted

Critical.

---

## Source service unavailable ≠ historical source absent

Permanent.

---

## Current source restricted ≠ history never existed

Permanent.

---

## State Coverage

Design 123 inherits Design 150 plus:

```text
Completed Project Detail Loading
Completed Project Detail Available
Completed Project Detail Restricted
Completed Project Detail Partial
Completed Project Detail Unavailable

Project Completed
Project Archived
Project Restored
Project Cancelled Historical

Archive Not Started
Archive Completed
Archive Failed
Archive Outcome Unknown

Completion Evidence Available
Completion Evidence Restricted
Completion Evidence Unavailable

Final Handover Available
Final Handover Restricted
Final Handover Unavailable

Deliverable History Available
Deliverable History Restricted
Deliverable History Unavailable

Approval History Available
Approval History Restricted
Approval History Unavailable

Activity Available
Activity Partial
Audit Restricted
Audit Unavailable

Retrospective Available
Retrospective Not Created
Retrospective Restricted
Retrospective Unavailable

Client Historical Access Active
Client Historical Access Restricted
Client Access State Unavailable

Retention Policy Available
Retention Policy Unknown
Purge Restricted where applicable

Archived Project Updated Elsewhere
Archive State Updated Elsewhere
Historical Source Updated / Corrected
Archive Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **historical outcome and retained evidence**, not active execution controls.

Conceptually:

```text
Completed / Archived Project
↓
Project outcome
   ├── completion date
   ├── Client
   ├── final delivery
   ├── final schedule outcome
   └── archived date/state
↓
Historical domains
   ├── Deliverables / Handover
   ├── Approvals
   ├── Tasks / Milestones
   ├── Client Requests
   ├── Changes
   ├── Risks / Blockers
   ├── Retrospective
   └── Activity / Audit
```

Only frozen Design 123 elements should render.

---

## Completed/Archived state should be obvious

Avoid making an archived Project look like an active editable Project 360.

The user should immediately understand:

> This is a historical Project record.

---

## Historical state vs current related state

Where useful:

> Project completed Aug 22
> Archived Sep 30
> Client relationship remains active

These must remain visually separated.

---

## Edit controls should be reduced

Ordinary operational controls such as:

* changing workflow stage;
* adding random Tasks;
* changing baseline;
* replacing final Handover versions;

should not appear as normal archive actions.

If source corrections/restoration exist, they should be deliberate governed actions.

---

## Exact delivery versions remain visible

Correct:

> Final Handover H-20 · Cover Proof v7

not:

> Current Cover Proof v9.

---

## Archive / restore controls

If present in the frozen design:

they should be clearly administrative and distinct from:

> Reopen Project.

---

## Tablet

Following Design 152:

* completion/archive summary remains top;
* historical domains stack;
* evidence counts/details collapse;
* source links remain touch-safe;
* administrative archive actions remain isolated.

---

## Mobile

Priority:

```text
Project name
↓
Completed / Archived state
↓
Completion date
↓
Final Handover
↓
Key Deliverables
↓
Schedule outcome
↓
Retrospective
↓
Historical activity
```

Do not recreate the entire active Project desktop layout in miniature.

---

## Mobile historical cues

Use persistent but compact cues such as:

> Archived historical record

rather than relying only on disabled controls.

---

## Accessibility

A historical Project could communicate:

> Project PR-100 completed on August 22 under closeout policy version 3 and was archived on September 30. Final Handover H-20 contained six Deliverables, including Magazine Cover Proof Version 7. This Project is archived and is presented as a historical record; normal delivery editing is unavailable.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical archive architecture

```text
Design 123
    ↓
Authenticated Workspace Context
    ↓
ArchivedProjectDetailQueryService
    │
    ├── ProjectAdapter
    ├── CompletionRecordAdapter
    ├── ArchiveRecordAdapter
    ├── Task/MilestoneAdapter
    ├── Team/ResourceAdapter
    ├── Risk/BlockerAdapter
    ├── Deliverable/HandoverAdapter
    ├── ApprovalAdapter
    ├── ClientRequestAdapter
    ├── ChangeRequestAdapter
    ├── ScheduleAdapter
    ├── RetrospectiveAdapter
    ├── ActivityAdapter
    └── AuditAdapter
    ↓
ArchivedProjectDetailView
```

Archive mutation remains narrowly scoped.

---

## Archive eligibility

Conceptually:

```text
ProjectArchiveService.evaluateEligibility(projectId)
```

may validate:

* Project lifecycle appropriate for archive;
* no conflicting archive operation;
* organization retention rules;
* administrative conditions.

Do not invent mandatory business closeout requirements here—they belong to Design 120.

---

## Archive normally follows completion

Likely safe default:

```text
COMPLETED
→ eligible for archive
```

But if cancelled Projects can also archive, policy can support it.

Do not hard-code only one lifecycle path until Phase 3D.

---

## Archive command

Conceptually:

```text
archiveProject(
    projectId,
    reason?,
    expectedProjectRevision,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. load canonical Project;
3. validate archive eligibility;
4. resolve current retention policy if relevant;
5. change archive state/lifecycle representation;
6. create immutable ArchiveRecord;
7. emit Audit/outbox;
8. invalidate active/archive Project queries.

---

## Archive command should be small

Like completion, it should **not** be a giant destructive cross-domain transaction.

Ideal archive action:

```text
archive state change
+
ArchiveRecord
+
outbox
```

Not:

```text
delete Tasks
delete files
remove users
revoke client access
cancel invoices
copy all data
```

---

## Archive idempotency

Critical.

Repeated request must return the same logical archive transition.

No duplicate archive records for the same intent.

---

## Archive outcome unknown

If response is lost after commit:

reconcile by Project/idempotency key.

Do not archive twice.

---

## Archive record chronology

If Project is:

```text
archived
→ restored
→ archived again
```

preserve all transitions.

---

## Restore command

If supported:

```text
restoreArchivedProject(
    projectId,
    reason,
    expectedProjectRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. verify archived state;
3. change archive state only;
4. preserve Project lifecycle;
5. create restore evidence;
6. emit Audit/outbox.

---

## Restore ≠ Reopen

Absolute.

If user needs delivery work restarted:

```text
ProjectCompletionService.reopenProject(...)
```

or canonical lifecycle service handles that separately.

---

## Completed Project query projection

Design 123 should compose canonical source records.

Do not copy all Project domain data into:

```text
ArchivedProjectSnapshot JSON
```

as the only historical source.

---

## Snapshot use

Some immutable completion/archive summary snapshot is reasonable for:

* reporting resilience;
* historical labels;
* fast archival list rendering.

But source records remain authoritative.

---

## Historical Source Resolver

Conceptually:

```text
ProjectHistoricalCompositionService.compose(projectId)
```

should know:

* current Project;
* completion evidence;
* archive evidence;
* exact historical versions;
* permission-safe source availability.

---

## Historical versions must be pinned

Examples:

```text
Final Handover → ProofVersion v7
Approval → ProofVersion v7
Change Application → ChangeRequestVersion v3
Contract → ContractVersion CV-4
```

Never reconstruct historical Project from current "latest" versions.

---

## Source corrections

If authorized source-domain corrections happen after archive:

the ArchivedProjectDetailView may update its current historical projection.

But immutable evidence records remain preserved.

Example:

> an Activity projection bug is corrected.

That does not mean ArchiveRecord changes.

---

## Hard deletion prevention

Canonical records referenced by:

* CompletionRecord;
* FinalHandover;
* executed Contract;
* Approval history;
* Audit;

should not be casually hard-deleted merely because Project archived.

---

## Retention policy

If applicable:

```text
ProjectRetentionPolicyResolver.resolve(projectId)
```

can determine historical retention requirements.

Archive state should not itself schedule immediate purge unless explicitly defined.

---

## Purge/delete

If ever supported, it must be a **separate highly governed operation** with:

* retention validation;
* legal/compliance checks;
* reference handling;
* Audit;
* privacy policy.

Do not implement purge as:

```text
DELETE /project/:id
```

from Archive workspace.

---

## Search integration

Design 079 should retain the same canonical Project entity.

Search may support:

```text
state = archived
```

filters.

Do not create a separate search index entity type for copied ArchivedProject data unless it is purely projection metadata.

---

## Search default filtering

Active workspace searches may suppress archived Projects by default.

Universal Search can still find them if authorized/filter permits.

Exact UX belongs later.

---

## Analytics integration

Archived/completed Projects should normally remain in historical metrics.

Example:

* completed Projects per quarter;
* average cycle time;
* change rates;
* delivery performance.

Archive must not remove them from analytics datasets.

---

## Analytics `active` filter ≠ deletion

Permanent.

---

## Reporting integration

Reports must continue to resolve archived Project evidence.

A Project archive action cannot break:

* client reports;
* historical financial reports;
* completion reports.

---

## Client Portal integration

Client Project views may continue historical access according to:

```text
ClientProjectAccess
ClientAssetAccess
ReportAccess
```

not internal archive state alone.

---

## Client Portal closure policy

If business wants to remove Portal Project access after some period:

that is a separate client-access policy/action.

Do not infer it from Archive automatically.

---

## Finance integration

Invoices/Payments/Reconciliation remain active historical/financial records.

Archiving Project cannot:

* cancel open invoice;
* mark paid;
* hide receivable.

---

## Renewal integration

Design 057 may query archived Project history.

Archive remains valuable commercial context.

---

## Retrospective integration

Design 122 remains retained and searchable according to permissions.

Published organization-level lessons remain useful even if Project is archived.

---

## Activity integration

Design 119 can project:

```text
ProjectArchived
ProjectArchiveRestored
```

Activity remains projection.

---

## Audit

Archive and restore actions should strongly Audit:

```text
actor
projectId
previous archive state
new archive state
reason
retention policy context
timestamp
```

---

## Archive ≠ Audit retention event

Permanent.

The AuditEvent records the action; ArchiveRecord is business retention evidence.

---

## Notifications

If organization sends archive notifications:

Notification delivery does not determine archive success.

---

## Indexing after archive

Update:

* active Project lists;
* archived Project lists;
* search metadata;

through asynchronous projection invalidation.

Core archive transition must not depend on search index success.

---

## Project active dashboards

Designs 003–007/006 should exclude archived records according to dashboard semantics.

But historical dashboard metrics may still count them.

Use explicit query scopes.

---

## Source services after archive

Normal mutating Project operations should check archive state where appropriate.

For example:

```text
TaskService.create(projectId)
```

may reject creation for an archived completed Project.

But do not implement a blanket database prohibition that also prevents:

* Invoice payment;
* download;
* historical report access.

Each domain determines whether archive should block its mutation.

---

## ArchiveGuard

A centralized helper can provide:

```text
ProjectOperationalStateResolver
```

returning:

* active;
* completed historical;
* archived.

Source services can apply domain-specific policy.

---

## No UI-only read-only enforcement

Critical.

Server commands must reject unauthorized operational mutation against archived Projects when policy says so.

Disabled buttons alone are insufficient.

---

## Data retention after employee departure

Historical Project Team/actor references must remain resolvable even if employees are deactivated.

Do not delete historical staffing identity because Project archived.

---

## Data retention after Client rename

Same historical business lineage principle.

---

## Export

If frozen Design 123 includes historical export:

generate from canonical historical evidence and exact artifact references.

Do not export a mutable current-state approximation.

---

## Optimistic concurrency

Required for archive/restore operations.

Example:

```text
User A archives Project.
User B attempts reopen from stale completed screen.
```

Both must use current revision/state transition rules.

---

## Caching

Archived detail caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
projectRevision
completionRecordRevision
archiveRecordRevision
source-domain historical revisions
retrospectiveRevision
handoverRevision
```

---

## Immutable evidence caching

CompletionRecord, ArchiveRecord, issued Handover manifest and finalized versions can be strongly cached.

Current permission/access checks cannot.

---

## Performance

Use:

* Project historical summary projections;
* source-domain aggregate summaries;
* lazy detailed Activity/Audit pagination;
* exact Handover/Deliverable version references;
* batched historical-source resolution.

Avoid loading every historical Task event/FileVersion/AuditEvent at once.

---

## Partial failure contract

Example:

```text
Project core        ✓
Completion record   ✓
Archive record      ✓
Handover             ✓
Activity             ✓
Audit service        ✕
```

Correct:

> Archived Project detail is available; Project-scoped Audit evidence is temporarily unavailable.

Incorrect:

> No Audit history.

Another:

```text
Project             ✓
Handover             ✓
Artifact service     ✕
```

Correct:

> Handover H-20 historically contains six exact artifact versions; current artifact previews are temporarily unavailable.

Not:

> Final deliverables missing.

---

## Backend Requirement Matrix

| Requirement                                      | Status                            |
| ------------------------------------------------ | --------------------------------- |
| Same canonical Project ID from 023               | **Critical**                      |
| No cloned ArchivedProject entity                 | **Critical**                      |
| Completion/Archive separation                    | **Critical**                      |
| Archive/Delete separation                        | **Critical**                      |
| Archive/Cancel separation                        | **Critical**                      |
| Archive/Client access separation                 | **Critical**                      |
| Archive/Finance separation                       | **Critical**                      |
| Archive/Renewal separation                       | **Critical**                      |
| Archive/Handover separation                      | **Critical**                      |
| Archive/Retrospective separation                 | **Critical**                      |
| ArchiveState/Project lifecycle distinction       | **Critical architecture**         |
| Immutable ArchiveRecord                          | **Critical**                      |
| Historical archive/restore transitions preserved | **Critical**                      |
| Restore/Reopen separation                        | **Critical if restore supported** |
| Historical composition as read projection        | **Critical**                      |
| Source entities remain canonical                 | **Critical**                      |
| Exact historical version pinning                 | **Critical**                      |
| Design 120 CompletionRecord reuse                | **Critical**                      |
| Design 121 Handover reuse                        | **Critical**                      |
| Design 122 Retrospective reuse                   | **Critical**                      |
| Design 119 Activity reuse                        | **Critical**                      |
| Design 039 Audit reuse                           | **Critical**                      |
| Design 118 schedule/baseline reuse               | **Critical**                      |
| Design 117 ChangeRequest history reuse           | **Critical**                      |
| Design 115 Approval history reuse                | **Critical**                      |
| Design 114 Deliverable/FileVersion reuse         | **Critical**                      |
| Current names/historical snapshots separation    | **Critical**                      |
| Client Portal access independent                 | **Critical**                      |
| Archived records remain searchable               | **Critical architecture**         |
| Archived records retained in analytics           | **Critical architecture**         |
| Historical reports continue to resolve           | **Critical**                      |
| Finance continues independently                  | **Critical**                      |
| Server-side operational mutation guards          | **Critical**                      |
| Archive command idempotency                      | **Critical**                      |
| Archive optimistic concurrency                   | **Critical**                      |
| Unknown archive outcome reconciliation           | **Critical**                      |
| Archive kept as compact state transition         | **Critical architecture**         |
| No destructive cross-domain archive side effects | **Critical**                      |
| Retention policy reuse/versioning                | **Critical where applicable**     |
| Purge separate/high-governance action            | **Critical if purge exists**      |
| Cross-tenant archive isolation                   | **Critical**                      |
| Permission-safe historical composition           | **Critical**                      |
| Audit/outbox integration                         | **Required**                      |
| Partial dependency failure handling              | **Critical**                      |

---

# 8. Consolidation

Design 123 creates a major implementation risk if “Archive” is treated as copying a Project to another table and disabling its page.

**Project / ArchivedProject conflation**
Same business entity becomes two IDs.

**Archive / Project clone conflation**
All relations must be duplicated and drift.

**Archive / Delete conflation**
Historical Project disappears.

**Archive / Purge conflation**
Retention destruction becomes ordinary UI action.

**Archive / Cancel conflation**
Delivery outcome changes when record is stored historically.

**Completion / Archive conflation**
Project vanishes immediately after being completed.

**Archive date / Completion date conflation**
Operational retention and delivery history merge.

**Archive / Reopen conflation**
Restoring view restarts delivery work.

**Restore / Reopen conflation**
Completed lifecycle changes accidentally.

**Restore / new Project conflation**
Historical identity forks.

**ArchiveState / Project lifecycle conflation**
One vague status cannot distinguish delivery outcome and operational retention.

**Archived / immutable-everything conflation**
Valid independent Finance/download/report operations are blocked.

**Archived / unrestricted history conflation**
Sensitive source permissions disappear.

**Archive permission / completion permission conflation**
Delivery managers control retention automatically.

**Archive permission / delete permission conflation**
Ordinary admin can destroy records.

**Project read / historical Audit read conflation**
Sensitive compliance data leaks.

**Archived Project / static JSON snapshot conflation**
Canonical source history is lost.

**Snapshot / source truth conflation**
Historical projection becomes permanently stale.

**Current Client name / historical legal identity conflation**
Contract/completion displays rewrite history.

**Current employee title / historical actor conflation**
Past role attribution changes.

**Current Asset version / delivered artifact conflation**
Archive shows v9 when Client received v7.

**Current Package / historical agreed scope conflation**
Catalog changes alter completed Project.

**Current Contract / executed ContractVersion conflation**
Legal history becomes ambiguous.

**Archive / Final Handover conflation**
Historical storage is mistaken for client delivery.

**Archive / Retrospective conflation**
Lessons are deleted/finalized automatically.

**Archive / Activity conflation**
Historical view becomes another event store.

**Archive / Audit conflation**
Business archive transition substitutes compliance evidence.

**Archive / Client access revocation conflation**
Client loses legitimate final files.

**Archive / Portal deletion conflation**
Client memberships are removed.

**Archive / Finance closure conflation**
Outstanding invoices disappear or get cancelled.

**Archive / receivable exclusion conflation**
Historical Project hides unpaid balance.

**Archive / Renewal conflation**
Completed relationship context is lost or renewal starts automatically.

**Archive / Search deletion conflation**
Users cannot locate historical Project.

**Archive / Analytics exclusion conflation**
Historical metrics become incorrect.

**Archived / report removal conflation**
Past reports break.

**Archive / Task hard delete conflation**
Work history disappears.

**Archive / Team membership delete conflation**
Historical staffing disappears.

**Archive / Risk deletion conflation**
Lessons and historical exposure disappear.

**Archive / ClientRequest deletion conflation**
External dependency evidence disappears.

**Archive / ChangeRequest deletion conflation**
Scope-change history disappears.

**Archive / Approval deletion conflation**
Formal decision evidence disappears.

**Archive / Deliverable deletion conflation**
Handover lineage breaks.

**Archive / FileVersion purge conflation**
Delivered artifact becomes unreconstructable.

**Archive / Retrospective deletion conflation**
Continuous-learning history disappears.

**Archive / CompletionRecord duplication conflation**
Archived view invents another completion truth.

**ArchiveRecord / AuditEvent conflation**
Retention transition and governance log become one record.

**Archived source unavailable / source absent conflation**
Dependency outage is treated as missing history.

**Archived source restricted / source never existed conflation**
Permission becomes false historical gap.

**Strong cache / authorization conflation**
Historical page leaks after permission change.

**Project archive / Search index authority conflation**
Index state controls actual lifecycle.

**Archive index failure / archive failure conflation**
Core business action is rolled back unnecessarily.

**Generic `isArchived` boolean only**
No actor, time, reason, transition history, or restoration lineage.

**Generic archived-project JSON blob**
No exact source/version lineage.

**Archive mega-transaction**
Project, files, clients, invoices, Tasks and permissions mutate together.

**123/023 duplicate Project identity**
Active/archived project domains fork.

**123/039 duplicate Audit history**
Archive creates local audit store.

**123/057 duplicate Renewal lifecycle**
Archive decides continuation.

**123/079 duplicate search entity**
Archived Projects need separate copied index identity.

**123/111 duplicate Task history**
Archive stores Task snapshots as truth.

**123/114 duplicate Deliverable history**
Archive stores copied final files.

**123/115 duplicate Approval history**
Archive stores approval booleans.

**123/117 duplicate Change history**
Archive stores flattened scope summary.

**123/118 duplicate schedule history**
Archive manually stores dates.

**123/119 duplicate Activity history**
Completed detail owns timeline records.

**123/120 duplicate completion evidence**
Archive writes another completedAt.

**123/121 duplicate Handover manifest**
Archive reconstructs final package.

**123/122 duplicate Retrospective**
Lessons are copied into archive blob.

No additional screen is required.

These are **same-Project identity, archive-vs-completion, retention, historical composition, exact-version lineage, restore/reopen separation, client/finance independence, permissions, search/analytics retention, and non-destructive archival requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL COMPLETED-PROJECT HISTORICAL COMPOSITION, ARCHIVE-STATE & RETAINED-EVIDENCE ANCHOR**

**Domain directive:**
**Project ≠ ProjectCompletionRecord ≠ ProjectArchiveRecord ≠ ArchivedProjectDetailView ≠ ArchiveState ≠ Delete/Purge ≠ RetentionPolicy ≠ ClientAccess ≠ FinalHandover ≠ Retrospective ≠ Activity/Audit ≠ Current Mutable Project Workspace.**

**Identity directive:**
Design 023 remains the sole canonical Project identity before, during, after completion, and after archive. `Project PR-100` never becomes a second `ArchivedProject` entity.

**No-copy directive:**
archiving must not copy Project/source records into a separate authoritative archive database and delete the originals. Historical views may be materialized but remain rebuildable projections.

**Completion directive:**
Design 120 remains Project completion authority. Archive consumes immutable `ProjectCompletionRecord` evidence and never invents a second `completedAt`, completion policy, or completion decision.

**Archive directive:**
archive is a governed historical/operational state transition controlling how a completed Project is surfaced and normally edited. It is not a new delivery lifecycle.

**Completion/archive directive:**
`Completed` and `Archived` remain separately meaningful facts with separately preserved timestamps and actors.

**Archive-state directive:**
Phase 3D should preserve the semantic distinction between delivery lifecycle and archive/retention state even if ultimately represented through one rigorously defined state machine.

**Delete directive:**
Archive is never Delete/Purge. Destructive removal, if ever supported, requires a separately permissioned retention/privacy process with reference checks and Audit.

**Archive-record directive:**
each archive transition creates immutable evidence recording Project, actor, time, prior/resulting archive state, reason/context and applicable retention policy.

**Restore directive:**
if restore/unarchive is supported, it changes archive visibility/state and preserves original ArchiveRecord history. It does not automatically reopen completed delivery lifecycle.

**Reopen directive:**
Design 120's explicit governed reopen semantics remain responsible for changing a Completed Project back to active delivery. Restore and Reopen are never synonyms.

**Re-archive directive:**
Project archived, restored and archived again preserves each transition chronologically rather than overwriting the original archive date.

**Historical-composition directive:**
`ArchivedProjectDetailView` is a permission-safe composition over the canonical Project and source domains—not another writable historical entity.

**Version directive:**
completed Project history always resolves exact Proposal, Contract, Draft, Proof, File, Report, ChangeRequest and Handover versions. Current/latest objects cannot rewrite historical Project meaning.

**Handover directive:**
Design 121 remains formal FinalHandover authority. Archived detail must show the exact versions actually handed over rather than current Project files.

**Deliverable directive:**
Design 114 remains Deliverable/FileVersion authority. Archive does not copy, replace, delete, or promote artifact versions.

**Approval directive:**
Design 115/029 remain formal Approval authority. Archived Project detail consumes the canonical decision/version history.

**Change directive:**
Design 117 remains Project Change authority. Archive composes exact requested/approved/applied versions and never collapses them into an editable scope summary.

**Schedule directive:**
Design 118 remains schedule/baseline authority. Archived Project outcome reads canonical planned/forecast/actual history and final variance rather than storing independent archive dates.

**Activity directive:**
Design 119 remains chronological Project Activity authority. `ProjectArchived`/`ProjectRestored` become additional source events, not reasons to clone the event history.

**Audit directive:**
Design 039 remains canonical Audit. Archive/restore/purge-related governance actions create Audit evidence while ArchiveRecord remains separate business retention evidence.

**Retrospective directive:**
Design 122 remains canonical Retrospective/Lesson authority. Archiving preserves Retrospective content, evidence and improvement lineage and never finalizes or deletes it.

**Client directive:**
ClientRelationship remains independent from Project archive. Archiving one Project does not mark the Client inactive or terminate the account.

**Portal directive:**
Client Portal access remains governed by ClientProjectAccess, ClientAssetAccess and other explicit portal permissions. Internal archive state neither grants nor revokes Client access by itself.

**Finance directive:**
Invoices, Payments, Transactions and Reconciliation remain independently canonical after Project archive. Archiving cannot cancel balances, mark invoices settled, or hide receivables from Finance.

**Renewal directive:**
Design 057 may use archived/completed Project history as renewal context, but Archive never creates a renewal Deal, Contract or Project automatically.

**Search directive:**
Design 079 continues indexing the same canonical Project identity. Archived status can affect default visibility/filtering but never creates a second search entity or erases historical discoverability.

**Analytics directive:**
completed/archived Projects remain valid historical analytics inputs. “Active Projects” filters may exclude them, but Archive cannot delete them from metric history.

**Reporting directive:**
Project/client/financial reports continue resolving archived Project evidence. Historical report integrity cannot depend on an active Project screen.

**Operational-guard directive:**
server-side source commands should respect archived Project operational state where appropriate. UI-disabled buttons alone never enforce archival immutability.

**Domain-specific-mutation directive:**
archive does not globally freeze every related domain. Finance settlement, authorized historical downloads, reporting and other independently legitimate operations remain governed by their own services.

**Retention directive:**
if retention policy exists, Project archive pins/resolves the relevant policy without conflating “archived now” with “safe to purge now.”

**Historical-identity directive:**
employee/client/company/profile changes after Project completion cannot rewrite exact contractual, Handover, Completion or historical actor evidence.

**Hard-delete directive:**
records referenced by Completion, Handover, Approval, executed commercial documents or Audit require strong historical-reference protection and cannot be casually destroyed because the Project is archived.

**Idempotency directive:**
Archive and Restore commands are replay-safe. Network retries cannot create repeated archive transitions for one intent.

**Concurrency directive:**
archive/restore/reopen operations use current Project revisions/state-machine validation so stale screens cannot silently perform conflicting lifecycle actions.

**Outcome-unknown directive:**
if Archive may have committed but response was lost, reconcile through Project/idempotency lineage rather than repeat the mutation blindly.

**Compact-transition directive:**
Archive should remain a narrow atomic state transition + ArchiveRecord + outbox, not a giant cross-domain migration/deletion transaction.

**No-destructive-side-effect directive:**
Archive never automatically deletes Tasks, removes Team history, deletes files, revokes Portal users, cancels invoices, removes Reports, deletes Retrospective, or changes Handover/Approval state.

**Authorization directive:**
completed Project read, archive, restore, reopen, sensitive historical data, Audit and destructive retention permissions remain independently server-authorized.

**Tenant directive:**
Project, ArchiveRecord and every historical source remain tenant-scoped throughout archival composition.

**Caching directive:**
immutable completion/archive/Handover evidence may be strongly cached, but user authorization and source access must always remain permission-aware. Archive caching cannot leak historical data after permission changes.

**Partial-failure directive:**
Completion, Handover, Retrospective, Activity, Audit, Deliverable and other historical services can fail independently. Missing current source availability never means the historical event/artifact did not exist.

**Performance directive:**
use compact historical summary/read models, batched source-domain adapters, immutable evidence caching and lazy Activity/Audit/detail loading rather than duplicating the complete Project graph into an archive table.

**Future-reuse directive:**
Design **124 — Publishing Queue / Publication Management Workspace** must remain a completely separate operational publishing domain. Completed/archived Projects may reference Publications and verified release history, but archive state must never become Publication state and publication processing must never rely on reopening/copying an archived Project.

**Overlap directive:**
Designs **023, 039, 057, 079, 111–123** must preserve one continuous **canonical Project → completion evidence → final Handover → Retrospective → archive transition → historical composition/search/analytics/reporting** lineage while keeping source entities, client access, Finance, Approval, Activity/Audit, retention and archive state independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE COMPLETED-PROJECT ARCHIVE FOUNDATION — SAME CANONICAL PROJECT ID + DISTINCT COMPLETION AND ARCHIVE EVIDENCE + NON-DESTRUCTIVE ARCHIVE STATE + IMMUTABLE ARCHIVE/RESTORE TRANSITION HISTORY + REBUILDABLE HISTORICAL PROJECT COMPOSITION + EXACT VERSIONED DELIVERABLE/APPROVAL/CHANGE/SCHEDULE/HANDOVER REFERENCES + CLIENT/FINANCE/SEARCH/ANALYTICS INDEPENDENCE + SERVER-SIDE HISTORICAL MUTATION GUARDS + OPTIONAL VERSIONED RETENTION POLICY + SEPARATE HIGH-GOVERNANCE PURGE — AND NEVER ALLOW COPIED `ARCHIVEDPROJECT` ROWS, STATIC JSON SNAPSHOTS, “LATEST” ARTIFACTS, ARCHIVE BUTTONS, SEARCH FILTERS, CLIENT ACCESS CHANGES OR FILE MOVES TO SUBSTITUTE FOR OR REWRITE CANONICAL PROJECT, COMPLETION, HANDOVER, RETROSPECTIVE, AUDIT, FINANCE OR RETENTION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **123 / 153** |
| **PASS**                                   |                        **123** |
| **STANDARDIZE decisions**                  |                        **121** |
| **Potential implementation-overlap flags** |                        **114** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**123 / 153 = 80.4% audited.**

### Canonical completed/archived Project architecture after Design 123

```text
PROJECT PR-100
      │
      ├── ACTIVE
      │
      ↓
   COMPLETED
      │
      ├── CompletionRecord CR-1
      ├── FinalHandover H-20
      ├── Retrospective R-10
      └── canonical historical domains
      │
      ↓
   ARCHIVED
      │
      └── ArchiveRecord AR-1

Project ID remains PR-100.
```

The strongest identity rule is now explicit:

```text
Project PR-100
        ↓ archive

NOT:

copy → ArchivedProject AP-100
delete → Project PR-100

Correct:

PR-100 remains canonical.
Archive changes historical/
operational state only.
```

Completion and archive remain separate:

```text
Completed:
August 22

Archived:
September 30

These dates describe
two different actions.
```

Restore and reopen also remain separate:

```text
ARCHIVED + COMPLETED
        │
        ├── Restore Archive
        │      ↓
        │   visible historical
        │   Project again
        │
        │   lifecycle still COMPLETED
        │
        └── Reopen Project
               ↓
          governed lifecycle change
          back to active delivery
```

And historical versions never drift:

```text
Final Handover H-20:
Cover Proof v7

Current Asset today:
Cover Proof v9

Archived Project shows:

Delivered = v7
Current asset = v9 if relevant

v9 never rewrites
what the Client received.
```

Finally:

```text
ARCHIVED
   ≠
DELETED

ARCHIVED
   ≠
CLIENT ACCESS REVOKED

ARCHIVED
   ≠
INVOICE CANCELLED

ARCHIVED
   ≠
RETROSPECTIVE DELETED

ARCHIVED
   ≠
REMOVED FROM ANALYTICS

ARCHIVED
   ≠
PURGED
```

Archive means **retained historical Project**, not disappearance.

## Next Sequential Audit Target

### **Design 124 — Publishing Queue / Publication Management Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
