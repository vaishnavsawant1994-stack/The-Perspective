Correct. We now cross the boundary from **prospect acquisition and data preparation** into the **canonical operational CRM**.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 011 — Leads / Lead CRM

| Audit field                 | Classification                                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**               | **011**                                                                                                                                                                                    |
| **Canonical name**          | **Leads / Lead CRM**                                                                                                                                                                       |
| **Product area**            | CRM / Sales                                                                                                                                                                                |
| **User surface**            | Team Workspace                                                                                                                                                                             |
| **Screen class**            | CRM List / Operational Record Workspace                                                                                                                                                    |
| **Classification**          | **Unique Anchor — CRM List Workspace Family**                                                                                                                                              |
| **Primary purpose**         | Manage canonical sales leads after they have been accepted into CRM, including ownership, qualification, status, prioritization, next actions and movement toward outreach/deal conversion |
| **Primary entity**          | **Lead**                                                                                                                                                                                   |
| **Supporting entities**     | Contact, Company, User/Owner, LeadSource, LeadList, Campaign, FollowUp, Meeting, Task, Deal, Activity, EnrichmentRecord                                                                    |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                                            |
| **Template family**         | `CrmListWorkspaceTemplate`                                                                                                                                                                 |
| **Auth**                    | Required                                                                                                                                                                                   |
| **Permissions**             | CRM + ownership/team/department scoped                                                                                                                                                     |
| **Implementation priority** | **Core / Critical**                                                                                                                                                                        |
| **Reuse level**             | **Extremely High**                                                                                                                                                                         |

---

# 1. Functional Responsibility

Design 011 answers:

> **“Which accepted prospects are now active sales leads, who owns them, how qualified are they, what has happened with them, and what should happen next?”**

This is fundamentally different from Designs 008–010.

```text
008 Lead Finder
      ↓
009 Extraction
      ↓
010 Enrichment
      ↓
Validation / Deduplication
      ↓
011 CANONICAL LEAD CRM
```

Once a record reaches Design 011, it has entered the managed business workflow.

That means it should now have canonical concepts such as:

**ownership**
**CRM status**
**qualification**
**source attribution**
**activity history**
**next action**
**campaign/outreach relationships**
**meeting/follow-up relationships**
**conversion history**

---

# 2. Candidate vs Lead

This distinction must now be formally frozen.

### Prospect Candidate

A discovered/acquired record that has **not yet become an operational CRM lead**.

### Lead

A canonical CRM business record accepted into the sales process.

Therefore:

```text
ProspectCandidate
      ↓
CRM admission
      ↓
Lead
```

After CRM admission, Designs 008–010 must not continue maintaining a competing permanent “lead” representation.

The CRM Lead becomes authoritative for sales workflow state.

---

# 3. Lead is Not the Same as Contact

This is another critical architectural distinction.

A **Contact** represents a person.

A **Lead** represents a sales opportunity/prospecting relationship or qualification record involving that person/company.

Conceptually:

```text
Company
  │
  ├── Contact A
  │      └── Lead 101
  │
  └── Contact B
         └── Lead 102
```

Potentially, depending on the final business rules, the same Contact could participate in multiple historical lead cycles over time.

Therefore:

> **Contact identity and Lead lifecycle must not be represented by the same database row.**

This becomes very important later for Designs 084–089.

---

# 4. Lead vs Deal

Likewise:

```text
Lead ≠ Deal
```

A Lead asks:

> **“Is this prospect qualified and worth pursuing?”**

A Deal asks:

> **“Is there now a defined commercial opportunity that we are actively progressing?”**

The canonical conversion should conceptually be:

```text
Lead
 ↓
Qualified / Commercial intent established
 ↓
Deal created
```

Creating a Deal should not necessarily delete the originating Lead.

The relationship and conversion history should remain traceable.

---

# 5. Canonical Lead CRM Regions

Without changing the approved design, implementation should normalize into several responsibilities.

### Page / Workspace Header

Typical controls:

**Create Lead**
**Import / Add Leads**
**Filters**
**Saved Views**
**Search**
**Bulk Actions**

### KPI / Summary Layer

Potential summaries:

**Total Leads**
**New**
**Qualified**
**Needs Follow-up**
**Engaged**
**Unassigned**
**Converted**

These should use canonical definitions.

### Lead Table / Record List

Priority information may include:

**Lead / Contact**
**Company**
**Title**
**Status**
**Qualification**
**Owner**
**Source**
**Last Activity**
**Next Action**
**Created / Updated**

### Filters

Examples:

**Owner**
**Status**
**Qualification**
**Source**
**Industry**
**Company**
**Location**
**Last Activity**
**Next Action Due**
**Created Date**

### Bulk Actions

Possible actions:

**Assign Owner**
**Add to Lead List**
**Change Status**
**Start Enrichment**
**Enroll in Outreach**
**Create Task**
**Archive / Disqualify**

All bulk actions must call canonical services.

---

# 6. Design 011 Introduces the CRM List Workspace Family

This is an important architectural milestone.

The reusable hierarchy becomes:

```text
Design Tokens
    ↓
Table / Filter / Search / Selection primitives
    ↓
CRM Record Components
    ↓
CrmListWorkspaceTemplate
    ↓
Design 011 — Leads / Lead CRM
```

This template will likely be reused substantially by later designs including:

**Design 084 — Company CRM / Company Directory**
**Design 086 — Contact CRM / Contact Directory**
**Design 088 — Lead Lists / Segmentation Workspace**
**Design 097 — Proposal Library**
**Design 099 — Contract Library**
**Design 101 — Invoice Library**

Not all belong to CRM semantically, but their **list-workspace architecture** can share major infrastructure.

---

# 7. Canonical Lead Lifecycle

We should avoid hard-coding dozens of ad-hoc statuses.

A conceptual lifecycle might separate:

### Lifecycle State

Examples:

```text
NEW
ACTIVE
QUALIFIED
DISQUALIFIED
CONVERTED
ARCHIVED
```

### Engagement State

Separately:

```text
NOT_CONTACTED
OUTREACH_ACTIVE
REPLIED
MEETING_BOOKED
```

### Priority / Qualification

Separately:

```text
LOW
MEDIUM
HIGH
```

or whatever final qualification model is approved.

The exact enums belong to Phase 3D.

The audit requirement is:

> **Do not use one giant Lead status field to represent lifecycle, outreach activity, qualification, priority and conversion simultaneously.**

---

# 8. Qualification vs Status

This distinction is especially important.

Example:

```text
Lifecycle: ACTIVE
Qualification: HIGH
Engagement: NOT_CONTACTED
```

Another:

```text
Lifecycle: ACTIVE
Qualification: MEDIUM
Engagement: REPLIED
```

Another:

```text
Lifecycle: DISQUALIFIED
Reason: NOT_RELEVANT
```

Qualification and workflow state therefore require distinct representations.

---

# 9. Disqualification Must Preserve Reason

A Lead should not simply disappear when marked unqualified.

Conceptually:

```text
Lead
├── lifecycle = DISQUALIFIED
├── reason
├── note
├── actor
└── timestamp
```

Possible reasons could include business-specific categories such as:

**Not a fit**
**Wrong person**
**No budget**
**Not interested**
**Duplicate**
**Invalid data**

Exact values should be frozen later.

The key requirement is **history preservation**.

---

# 10. Conversion Must Preserve Provenance

When a Lead becomes a Deal:

```text
Lead
  ↓
Converted
  ↓
Deal
```

The system should preserve:

**originating Lead ID**
**Contact**
**Company**
**source**
**owner**
**conversion timestamp**
**conversion actor**

This allows future reporting such as:

> Which sources generate the most Deals?

or:

> Which Lead campaigns generate the highest revenue?

without reconstructing history from activity logs.

---

# 11. Ownership Architecture

Every operational Lead should have an explicit ownership model.

Possibilities include:

```text
Owner User
Team
Department
```

At minimum, the implementation must be capable of determining:

> **Who is responsible for this Lead right now?**

The CRM should also distinguish:

**Unassigned**
from
**Assigned to inactive/deactivated user**

Those are operationally different states.

---

# 12. Assignment History

When ownership changes:

```text
Aisha → Daniel → Michael
```

the old assignment should not simply disappear.

Important assignment changes should generate activity/audit history.

This supports:

* sales accountability,
* handoff tracking,
* workload analytics,
* dispute resolution.

---

# 13. Source Attribution

Design 011 must retain the acquisition provenance built by Designs 008–010.

For example:

```text
Lead
├── originalSource
├── acquisitionBatch
├── extractedFrom
├── enrichedBy
└── admittedToCrmAt
```

The CRM can show a simplified source label, but the deeper lineage should remain available.

This is critical for later analytics.

---

# 14. Lead Source vs Acquisition Method

These may not always be the same.

For example:

```text
Lead Source:
Conference Speaker List

Acquisition Method:
CSV Import
```

or:

```text
Lead Source:
Company Website

Acquisition Method:
Automated Extraction
```

The backend should avoid flattening every provenance concept into a single arbitrary `source` string.

---

# 15. Communication Eligibility

A Lead being present in CRM does **not** automatically mean it is allowed to receive outreach.

Conceptually:

```text
Lead exists
   ≠
Contact is outreach eligible
```

Communication eligibility may depend on:

* valid contact channel,
* suppression/unsubscribe state,
* data verification,
* organizational policy,
* campaign rules.

Design 011 may display an eligibility indicator, but the Outreach service should remain authoritative for sending.

---

# 16. Lead Scoring Boundary

If the platform uses lead scoring, the system should distinguish:

### Data completeness

How much information exists?

### Qualification

How well does the prospect fit business criteria?

### Engagement

How has the prospect interacted?

### Priority

How urgently should Sales act?

These may contribute to a future score, but they are not inherently the same thing.

Avoid one opaque:

> **Lead Score: 92**

unless its formula and meaning are canonically defined.

---

# 17. Search Architecture

Design 011 should reuse a common CRM search contract.

Conceptually:

```text
LeadListQuery
├── text
├── status
├── qualification
├── owner
├── source
├── company
├── industry
├── geography
├── activityRange
├── nextActionRange
├── createdRange
├── sort
├── cursor/page
└── pageSize
```

Filtering should be performed server-side for large datasets.

Do not load every lead into the browser and filter client-side.

---

# 18. Saved Views

A useful reusable capability introduced here is the **Saved View**.

Examples:

**My Leads**
**Unassigned Leads**
**Hot Leads**
**Needs Follow-up Today**
**No Activity in 14 Days**

A saved view should conceptually store:

```text
SavedView
├── owner / workspace
├── name
├── filters
├── sort
├── columns
└── visibility
```

This is different from a **Lead List**.

---

# 19. Saved View vs Lead List

This distinction is critical because Design 088 later introduces Lead Lists.

### Saved View

A **dynamic query**.

Example:

> All HIGH qualification leads owned by me.

Membership changes automatically when data changes.

### Lead List

A **business grouping/segment**, often explicit or rule-based depending on final implementation.

Therefore:

```text
Saved View ≠ Lead List
```

We should not build both concepts as the same database table merely because both appear as “lists” visually.

---

# 20. Data Table Architecture

Design 011 should establish the canonical enterprise table behavior used throughout the platform.

Reusable capabilities can include:

**Column sorting**
**Filtering**
**Column visibility**
**Bulk selection**
**Pagination/cursor navigation**
**Row actions**
**Saved views**
**Density options where approved**
**Persistent user preferences**

But page-specific columns remain configuration rather than custom table implementations.

Conceptually:

```text
DataTable
    +
LeadColumnDefinition
    =
Lead CRM Table
```

This will create major implementation savings later.

---

# 21. Row Action Architecture

Typical row actions can include:

**Open Lead**
**Assign**
**Add to List**
**Create Follow-up**
**Enroll in Campaign**
**Enrich**
**Disqualify**
**Convert to Deal**

These should call canonical services.

A table action must not implement a second version of Lead business logic.

---

# 22. Bulk Mutation Safety

Bulk changes need stronger safeguards than single-record changes.

For example:

> Change status for 2,000 leads

should not produce 2,000 uncontrolled browser requests.

Correct:

```text
Bulk Command
    ↓
Server-side operation/job
    ↓
Validation
    ↓
Permission check per scope
    ↓
Mutation
    ↓
Result summary
```

Depending on size, asynchronous processing may be appropriate.

---

# 23. Optimistic UI Boundary

Small, low-risk CRM actions may potentially use optimistic interfaces.

But important transitions such as:

**Convert to Deal**
**Bulk reassignment**
**Mass disqualification**

should wait for authoritative server confirmation.

The UI should never show a successful conversion merely because a local state variable changed.

---

# 24. Permission Architecture

Design 011 requires several permission dimensions.

Conceptually:

```text
lead.read
lead.create
lead.edit
lead.assign
lead.bulk_update
lead.disqualify
lead.convert
lead.export
```

Exact names belong to Phase 3D.

Scope may then restrict access by:

**Organization**
**Department**
**Team**
**Assigned Owner**
**Own Records**

For example:

### Sales Manager

May see team-wide Leads and reassign them.

### Sales Representative

May see primarily assigned Leads.

### Admin

May have organization-wide visibility.

### Other departments

Should not automatically gain Lead access.

---

# 25. View vs Export

As with Designs 008–010:

```text
READ ≠ EXPORT
```

Exporting CRM data can expose much more information than normal on-screen use.

Therefore exports require:

* explicit permission,
* organization scope,
* audit event,
* potentially volume limits.

---

# 26. Field-Level Restrictions

Some CRM fields may have different sensitivity.

A user could potentially see:

**Lead name, company, status**

but not necessarily:

**personal contact details or internal commercial notes**

depending on final policy.

Phase 3D will define whether field-level permissions are necessary.

Design 011 establishes that the architecture should not make them impossible.

---

# 27. Activity Architecture

Every Lead should eventually have a unified activity history.

Conceptually:

```text
LeadActivity
├── created
├── assignment changed
├── enriched
├── added to list
├── campaign enrolled
├── email sent
├── reply received
├── meeting booked
├── note added
├── status changed
├── qualified
├── disqualified
└── converted
```

Design 011 may show a compact last-activity indicator.

The deeper timeline belongs to Lead Detail later.

---

# 28. Next Action

The Lead CRM should prioritize actionability.

A useful canonical concept is:

```text
nextActionType
nextActionAt
nextActionOwner
```

or derive this from Tasks/FollowUps rather than duplicating it.

The important architectural rule is:

> **Do not maintain an arbitrary `next_action_text` field if canonical Tasks/Follow-ups already represent the actual work.**

Design 011 should consume the canonical next-action source.

---

# 29. Relationship to Design 089 — Lead Detail / Lead 360

This distinction must be explicit.

### Design 011 — Leads / Lead CRM

**Cross-record management workspace**

Answers:

> “Which leads need attention?”

### Design 089 — Lead Detail / Lead 360

**One Lead's complete record**

Answers:

> “What do we know about this Lead, what has happened, and what do we do next?”

Correct hierarchy:

```text
Design 011
Lead CRM
    ↓
Design 089
Lead 360
```

Do not merge them.

---

# 30. Relationship to Designs 084–087

Later CRM structure becomes:

```text
Company
  ↓
Contact
  ↓
Lead
```

with relational links rather than duplicated snapshots.

### Design 084

Company Directory

### Design 085

Company 360

### Design 086

Contact Directory

### Design 087

Contact 360

### Design 089

Lead 360

Design 011 should ultimately reuse those canonical Company and Contact entities rather than storing duplicate company/person fields independently.

---

# 31. Snapshot Fields May Still Be Necessary

There is one nuance.

If a Contact later changes companies, historical context may need preservation.

For example, a Lead created while:

```text
Sarah → VP at Acme
```

should not necessarily lose all historical context when Sarah later becomes:

```text
Sarah → CMO at Nova
```

Therefore some workflows may preserve historical relationship snapshots.

That architectural decision belongs to Phase 3D.

The important point is:

> **Canonical identity and historical context are separate concerns.**

---

# 32. Relationship to Outreach

Design 011 can trigger:

**Enroll in Campaign**

But Outreach owns:

* sending sequence,
* channel execution,
* delivery,
* replies,
* suppression,
* campaign progression.

The Lead CRM consumes outreach summary state.

It must not implement its own email engine.

---

# 33. Relationship to Meetings and Follow-ups

Likewise:

**Schedule Meeting**
should invoke canonical Meeting functionality.

**Create Follow-up**
should invoke canonical Follow-up/Task functionality.

The Lead record links to these outcomes.

No duplicate scheduler or task database should be embedded specifically for Lead CRM.

---

# 34. Relationship to Deal Conversion

A controlled conversion service should conceptually perform:

```text
Lead
 ↓
Eligibility / validation
 ↓
Create or link Deal
 ↓
Preserve Lead relationship
 ↓
Set conversion metadata
 ↓
Create activity/audit event
```

Potentially it may also carry:

* Company
* Contact
* owner
* commercial context

The exact transfer rules belong to Phase 3D.

---

# 35. Duplicate Lead Handling

A Contact may already have an active Lead.

When a user tries to create/import another:

```text
Contact X
already has Active Lead
```

the system should not automatically generate another active duplicate unless business rules allow it.

Potential outcomes:

**Open existing Lead**
**Create separate Lead with explicit reason**
**Merge/import data into existing Lead**

The final rule must be canonical.

---

# 36. Archival vs Deletion

CRM Leads should generally not be physically deleted simply because the sales team no longer wants them.

A safer operational pattern is:

```text
Active
↓
Disqualified / Archived
```

Hard deletion should be restricted to appropriate administrative/data-compliance workflows.

This preserves historical reporting and relationships.

---

# 37. Reusable Component Mapping

Design 011 introduces or formalizes:

`CrmListWorkspace`
`DataTable`
`ColumnSelector`
`FilterBar`
`SavedViewSelector`
`BulkActionBar`
`EntityIdentityCell`
`OwnerCell`
`QualificationBadge`
`LeadStatusBadge`
`SourceBadge`
`LastActivityCell`
`NextActionCell`
`Pagination`
`RowActionMenu`

Plus shared states from Design 150.

This is one of the **highest-reuse component clusters** discovered so far.

---

# 38. Responsive Contract

### Desktop

Preserve high productivity:

**summary → filters/search → dense CRM table → bulk actions**

The table can expose the richest useful column set.

### Tablet — Design 152

Use:

* priority columns,
* horizontal overflow only where genuinely useful,
* filter drawer,
* compact toolbar,
* touch-friendly row actions,
* optional detail overlay.

### Mobile — Design 151

Transform Leads primarily into record cards:

**Contact / Company**
**Lead Status**
**Qualification**
**Owner**
**Last Activity**
**Next Action**

Primary actions can become:

**Open**
**Follow Up**
**More**

Do not squeeze the complete desktop table into 390px.

---

# 39. Mobile Bulk Selection

Bulk management should still remain possible where appropriate.

A mobile pattern can use:

```text
Select
↓
checkbox/card selection
↓
sticky bulk action bar
```

But dangerous mass actions should require explicit confirmation.

---

# 40. State Coverage

Design 011 inherits Design 150 and requires CRM-specific states:

**No Leads Yet**
**No Assigned Leads**
**No Results**
**No Results After Filters**
**Loading Leads**
**Refreshing**
**Bulk Operation Running**
**Partial Bulk Failure**
**Record Updated Elsewhere**
**Permission Restricted**
**Lead Archived**
**Lead Converted**
**Duplicate Detected**
**API Failure**

A filtered-empty state must differ from a genuinely empty CRM.

---

# 41. Concurrency Requirement

CRM records may be edited by multiple team members.

Example:

```text
User A opens Lead
User B reassigns Lead
User A attempts old update
```

The backend should prevent silent destructive overwrites.

Possible strategies include:

**updatedAt/version checks**
or another optimistic concurrency mechanism.

Exact implementation belongs later.

The audit establishes the requirement.

---

# 42. Backend Architecture

Recommended conceptual structure:

```text
Leads CRM UI
    ↓
Lead Query Service
    ↓
Permission / Scope Layer
    ↓
Canonical Lead Domain Service
    │
    ├── Create
    ├── Assign
    ├── Update lifecycle
    ├── Qualify
    ├── Disqualify
    ├── Convert
    └── Bulk actions
    ↓
Company / Contact relationships
    ↓
Activity + Audit
```

Read flow:

```text
Lead Query Service
 ├── Contact
 ├── Company
 ├── Owner
 ├── Source
 ├── Last Activity
 ├── Next Action
 └── Outreach / Deal summaries
```

---

# 43. Backend Requirements

| Requirement                       | Status                            |
| --------------------------------- | --------------------------------- |
| Authentication                    | **Required**                      |
| Tenant isolation                  | **Critical**                      |
| CRM RBAC                          | **Critical**                      |
| Ownership/team scopes             | **Critical**                      |
| Server-side search/filter         | **Required**                      |
| Pagination/cursors                | **Required**                      |
| Canonical Lead domain service     | **Critical**                      |
| Contact/Company relationships     | **Critical**                      |
| Duplicate prevention              | **Critical**                      |
| Conversion transaction            | **Critical**                      |
| Bulk-operation service            | **Required**                      |
| Activity history                  | **Required**                      |
| Audit history                     | **Required**                      |
| Concurrency protection            | **Required**                      |
| Export controls                   | **Required**                      |
| Soft archive/history preservation | **Recommended / likely required** |

---

# 44. Canonical Metrics

Lead metrics should eventually have centralized definitions:

**New Lead**
**Active Lead**
**Qualified Lead**
**Disqualified Lead**
**Converted Lead**
**Unassigned Lead**
**Lead Conversion Rate**
**Average Time to Qualification**

These definitions must be shared across:

**Design 004 — Sales Dashboard**
**Design 011 — Lead CRM**
**Design 089 — Lead 360**
**Analytics**
**Reporting**

No frontend screen should independently decide what counts as a Qualified Lead.

---

# 45. Main Implementation Risks

The audit flags:

**Candidate/Lead conflation**
Acquisition records becoming operational Leads prematurely.

**Contact/Lead conflation**
Treating a person and a sales lifecycle as the same entity.

**Status overload**
One field representing lifecycle, engagement and qualification.

**Duplicate CRM records**
Repeated import creating multiple Leads/Contacts.

**Lost conversion history**
Lead disappearing when Deal is created.

**Permission leakage**
Salespeople seeing organization-wide records without correct scope.

**Client-side filtering at scale**
Loading massive lead datasets into the browser.

**Duplicate business logic**
Table row actions implementing Lead transitions independently.

**Saved View / Lead List confusion**
Dynamic query and business segment treated as identical.

**Hard deletion**
Destroying Lead history and reporting provenance.

These require architecture discipline, not additional visual design.

# Design 011 Audit Verdict

## **PASS — CANONICAL CRM LIST WORKSPACE ANCHOR**

**Template directive:** Design 011 establishes the reusable `CrmListWorkspaceTemplate`, which should later power Company, Contact and other record-list experiences through configuration rather than duplicated table systems.

**Domain directive:** **ProspectCandidate ≠ Contact ≠ Lead ≠ Deal.**

**Lifecycle directive:** Lead lifecycle, qualification, engagement and priority remain separate concepts.

**Identity directive:** Leads link to canonical Company and Contact records rather than duplicating identity data unnecessarily.

**Conversion directive:** Lead-to-Deal conversion preserves provenance and historical linkage.

**Query directive:** Search, filtering, pagination and permission scope are server-side.

**Bulk-action directive:** High-volume Lead mutations use canonical backend operations/jobs rather than browser request loops.

**Permission directive:** Read, edit, assignment, conversion, bulk actions and export remain separately authorizable.

**History directive:** Assignment, lifecycle, qualification and conversion events contribute to canonical activity/audit history.

**Consolidation directive:** **STANDARDIZE THE LIST WORKSPACE ARCHITECTURE FOR LATER CRM/LIBRARY DESIGNS — DO NOT MERGE DESIGN 011 WITH LEAD DETAIL, CONTACT CRM, COMPANY CRM OR LEAD LISTS.**

# Phase 3A.1 — Running Audit

| Result                                     |                           Count |
| ------------------------------------------ | ------------------------------: |
| **Audited**                                |                    **11 / 153** |
| **PASS**                                   |                          **11** |
| **STANDARDIZE decisions**                  |                           **9** |
| **Potential implementation-overlap flags** |                           **2** |
| **MERGE screen candidates**                | **0 pending later comparisons** |
| **FIX BEFORE CODE**                        |                           **0** |
| **New designs**                            |                           **0** |

### Reusable architecture discovered so far

```text
Authenticated Presentation
│
├── 001 InternalAppShell
│   │
│   ├── Dashboard Family
│   │   └── 003–007
│   │
│   ├── Data Acquisition Family
│   │   ├── 008 Lead Finder
│   │   └── 009 Data Extraction
│   │
│   ├── Data Quality / Enrichment Family
│   │   └── 010 Contact / Data Enrichment
│   │
│   └── CRM List Workspace Family
│       └── 011 Leads / Lead CRM
│
└── 002 ClientPortalShell
```

The business-data transition is now formally clear:

```text
DISCOVER
Design 008
   ↓
EXTRACT
Design 009
   ↓
ENRICH
Design 010
   ↓
VALIDATE + DEDUPLICATE
   ↓
ADMIT TO CRM
   ↓
MANAGE CANONICAL LEAD
Design 011
   ↓
OUTREACH / MEETINGS / FOLLOW-UP
   ↓
DEAL
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 012 Audit**

We should again use **Design 012's exact frozen identity** from the approved 153-design inventory before auditing it, then apply the identical contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence changes.**

