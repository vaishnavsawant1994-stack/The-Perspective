# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 088 — Lead Lists / Segmentation Workspace

Design 088 should become the **canonical Team Workspace Lead grouping, segmentation, and evaluated-audience preparation surface** built on the canonical Lead identity established by Design 011.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Lead ≠ LeadList ≠ ListMembership ≠ SegmentDefinition ≠ SegmentEvaluation ≠ SavedView ≠ Filter ≠ CampaignAudience ≠ ProspectCandidate ≠ Contact/Company.**

The central implementation rule is:

> **Design 088 organizes and evaluates canonical Leads; it never creates another Lead database. Static LeadLists persist explicit Lead membership, dynamic Segments persist rules rather than copied Leads, SegmentEvaluations represent the result of those rules at a point in time, and any CampaignAudience/export requiring stable membership must pin an exact evaluated snapshot rather than silently changing when CRM data or segment rules change.**

---

# 1. Classification

| Audit field                     | Classification                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Design ID**                   | **088**                                                                                                |
| **Canonical name**              | **Lead Lists / Segmentation Workspace**                                                                |
| **Product area**                | Team Workspace / CRM / Leads / Segmentation                                                            |
| **User surface**                | **Authenticated Team Workspace**                                                                       |
| **Screen class**                | CRM Collection / Segmentation / Audience Preparation Workspace                                         |
| **Classification**              | **Lead Grouping, Dynamic Segmentation & Audience Snapshot Anchor**                                     |
| **Primary purpose**             | Organize canonical Leads into explicit lists or rule-driven segments without duplicating Lead identity |
| **Canonical Lead foundation**   | Design 011                                                                                             |
| **Company foundation**          | Designs 084–085                                                                                        |
| **Contact foundation**          | Designs 086–087                                                                                        |
| **Static grouping entity**      | **LeadList**                                                                                           |
| **Static membership entity**    | **ListMembership**                                                                                     |
| **Dynamic grouping entity**     | **SegmentDefinition**                                                                                  |
| **Evaluation entity**           | **SegmentEvaluation**                                                                                  |
| **Ephemeral criteria concept**  | **Filter**                                                                                             |
| **Saved query/view concept**    | **SavedView**                                                                                          |
| **Outreach handoff concept**    | **CampaignAudience / AudienceSnapshot**                                                                |
| **Pre-CRM exclusion**           | **ProspectCandidate** — Designs 008/083                                                                |
| **Outreach dependency**         | Designs 012–013 / later Campaign detail                                                                |
| **Detail companion**            | Design 089 — Lead Detail / Lead 360                                                                    |
| **Universal Search dependency** | Design 079                                                                                             |
| **Primary query service**       | `LeadSegmentationQueryService`                                                                         |
| **List service**                | `LeadListService`                                                                                      |
| **Segment engine**              | `LeadSegmentEvaluationService`                                                                         |
| **Audience snapshot service**   | `CampaignAudienceSnapshotService`                                                                      |
| **Auth**                        | Required                                                                                               |
| **Authorization**               | Active OrganizationMembership + Lead/list/segment/export/audience permissions                          |
| **Implementation priority**     | **Critical CRM Grouping / Audience Stability / Authorization Integrity**                               |
| **Reuse level**                 | **Extremely High across CRM and Outreach**                                                             |

Design 088 should answer:

> **“Which canonical Leads belong to this explicit list, which Leads currently satisfy this dynamic segment, why do they match, and which exact membership set should be handed downstream when a stable campaign/export audience is required?”**

Canonical model:

```text
                         CANONICAL LEADS
                               │
              ┌────────────────┴────────────────┐
              ↓                                 ↓
          LeadList                       SegmentDefinition
          static group                    dynamic rules
              │                                 │
              ↓                                 ↓
       ListMembership[]                 SegmentEvaluation
              │                                 │
              │                                 ↓
              │                          evaluated Lead IDs
              │                                 │
              └──────────────┬──────────────────┘
                             ↓
                     AudienceSnapshot
                   when stable membership
                         is required
                             │
                             ↓
                     Outreach / Export
```

---

# 2. Reuse

## Design 011 remains the only canonical Lead backend

Design 088 must reference:

```text
Lead L-100
Lead L-101
Lead L-102
```

from the canonical CRM.

It must never create:

```text
ListLead
SegmentLead
AudienceLead
FilteredLead
```

as parallel mutable Lead records.

---

## LeadList is a grouping object

Correct:

```text
LeadList LIST-10
├── Membership → Lead L-100
├── Membership → Lead L-104
└── Membership → Lead L-211
```

The Lead records remain owned by Design 011.

---

## LeadList ≠ Lead query result

A static list is deliberately persisted membership.

Running a filter temporarily and seeing 50 Leads does not automatically create a LeadList.

---

## Static membership ≠ dynamic segment membership

This distinction is foundational.

### Static LeadList

Membership changes only through explicit membership operations.

```text
Add Lead
Remove Lead
```

### Dynamic Segment

Membership changes because:

* Lead fields change,
* Company/Contact context changes,
* SegmentDefinition changes,
* evaluation time changes.

```text
SegmentDefinition
        ↓
Evaluate against current canonical data
        ↓
current matching Leads
```

Do not implement both as the same mutable list of Lead IDs.

---

## Reuse Companies and Contacts only as canonical filter context

A Segment may evaluate Lead-related attributes derived from:

* Lead,
* Contact,
* Company,

where frozen design supports those filters.

But:

```text
Company data
Contact data
```

remain canonical in Designs 084–087.

Do not copy them into segmentation tables merely to make filtering easier unless they are derived/materialized search projections.

---

## ProspectCandidate remains outside Design 088

This is strict.

```text
ProspectCandidate
     ↓
Design 083 CRM Admission
     ↓
Lead
     ↓
Design 088 Lists / Segments
```

A pre-CRM candidate must not be inserted into `ListMembership` as though it were a Lead.

If acquisition needs its own candidate grouping later, that is a separate concept—not a reason to weaken Lead identity here.

---

## Design 088 ≠ Design 079 Universal Search

Search answers:

> Which authorized entities match this retrieval query?

Segmentation answers:

> Which canonical Leads satisfy a governed CRM eligibility/filter definition?

Search result relevance is not segmentation membership.

---

## Design 088 ≠ SavedView

A SavedView can preserve how a user wants to view/filter a workspace.

A SegmentDefinition is a reusable business rule selecting Leads.

They may share filtering primitives but are not automatically the same entity.

---

## Design 088 ≠ Design 012 Outreach Campaign

A Lead list or Segment provides potential audience input.

The Campaign remains responsible for:

* campaign lifecycle,
* enrollment,
* delivery,
* channel eligibility,
* sequence/version,
* suppression,
* sending policy.

Permanent:

> **Segment membership ≠ Campaign enrollment.**

---

# 3. Entities

## Lead

The Lead remains canonical.

Nothing in Design 088 owns Lead:

* status,
* owner,
* qualification,
* Company,
* Contact,
* source,
* lifecycle.

Those values may be used for segmentation but remain source-domain truth.

---

## LeadList

`LeadList` represents an explicitly managed static collection.

Conceptually:

```text
LeadList
├── id
├── organizationId
├── name
├── description
├── owner / visibility
├── lifecycle
├── createdAt
└── revision
```

Exact physical schema belongs to Phase 3D.

---

## LeadList ≠ Lead

Permanent.

---

## LeadList ≠ ListMembership

The list defines the collection.

Membership records define which Leads belong to it.

---

## ListMembership

Conceptually:

```text
ListMembership
├── leadListId
├── leadId
├── addedAt
├── addedBy / source
└── membership state/history where required
```

At minimum:

```text
UNIQUE(leadListId, leadId)
```

or equivalent canonical uniqueness must prevent duplicate membership.

---

## Duplicate membership ≠ duplicate Lead

If user adds Lead L1 twice:

the second operation should be idempotent or return:

> Already in list.

It must never create another Lead.

---

## One Lead can belong to many LeadLists

Example:

```text
Lead L-100
├── C-Suite Prospects
├── US Technology
└── Q4 Priority Outreach
```

Valid.

---

## Removing from a list ≠ deleting Lead

Permanent.

Correct:

```text
DELETE / membership
```

conceptually.

Not:

```text
DELETE / Lead
```

---

## Removing membership ≠ disqualifying Lead

Permanent.

---

## Archiving/deleting list ≠ deleting Leads

Permanent.

At most it removes/deactivates the grouping and its membership relationships according to retention policy.

---

## List membership history may be operationally useful

If provenance matters:

```text
Lead added by Alice
Lead removed by Bob
```

can be retained through membership events/history.

Do not rewrite Lead Activity itself merely to represent list organization.

---

## SegmentDefinition

`SegmentDefinition` stores the **rule** describing a dynamic Lead population.

Conceptually:

```text
SegmentDefinition
├── id
├── organizationId
├── name
├── filterExpression
├── filterSchemaVersion
├── field-definition version/policy
├── owner / visibility
├── createdAt
├── updatedAt
└── revision
```

---

## SegmentDefinition ≠ segment members

Critical.

Correct:

```text
SegmentDefinition:
lead.status = QUALIFIED
AND company.industry = TECHNOLOGY
```

The Leads matching that rule are determined by evaluation.

Do not persist the evaluated members as the SegmentDefinition itself.

---

## SegmentDefinition must be version/revision aware

If rule changes:

```text
v1:
Country = Germany

v2:
Country = Germany
AND Lead status = Qualified
```

historical campaign snapshots based on v1 must remain explainable.

---

## Filter

A `Filter` can be an ephemeral user query state.

Example:

```text
status = QUALIFIED
owner = me
```

Applying that temporarily does not automatically create a Segment.

---

## Filter ≠ SegmentDefinition

Permanent.

---

## SavedView

SavedView can preserve:

* columns,
* sort,
* display mode,
* filters,

for user convenience.

That does not necessarily make it a business segment used in Outreach.

---

## SavedView ≠ SegmentDefinition

Permanent.

They may reuse a safe filter-expression language.

They retain different:

* ownership,
* lifecycle,
* execution purpose.

---

## SegmentEvaluation

`SegmentEvaluation` represents execution of a particular SegmentDefinition against canonical CRM state.

Conceptually:

```text
SegmentEvaluation
├── id
├── segmentDefinitionId
├── segmentRevision
├── evaluationContext
├── startedAt
├── completedAt
├── resultCount
├── result semantics
├── data/reference revision metadata
└── outcome
```

---

## SegmentEvaluation ≠ SegmentDefinition

Permanent.

---

## SegmentEvaluation ≠ CampaignAudience

The evaluation answers:

> What matched when this segment was evaluated?

A CampaignAudience answers:

> Which exact Leads are the governed downstream audience for this Campaign/export operation?

Often the latter will be derived from one evaluation but should be separately pinned where immutability/stability matters.

---

## Dynamic membership can change over time

Example:

### Monday

```text
Lead L1
status = QUALIFIED

→ matches Segment S1
```

### Wednesday

```text
Lead L1
status = DISQUALIFIED

→ no longer matches S1
```

That is expected.

Do not update the SegmentDefinition.

The canonical Lead changed.

---

## Segment membership is not a Lead field

Avoid:

```text
lead.segmentIds = [...]
```

as authoritative dynamic membership.

Dynamic membership is evaluated.

---

## Materialized dynamic membership is acceptable only as projection/cache

At scale, the backend may maintain:

```text
SegmentMembershipProjection
```

but it must be:

* source-derived,
* revision-aware,
* rebuildable,
* invalidated/re-evaluated,
* not manually edited as canonical dynamic truth.

---

## SegmentEvaluation should preserve exact definition revision

Critical for downstream repeatability.

---

## Evaluation result ≠ future result

Permanent.

---

## CampaignAudience / AudienceSnapshot

When an operation needs stable membership:

```text
Campaign
Export
scheduled batch
```

create/pin an exact evaluated set.

Conceptually:

```text
CampaignAudienceSnapshot
├── id
├── sourceType
│   ├── LEAD_LIST
│   └── SEGMENT
├── sourceId
├── sourceRevision / evaluationId
├── createdAt
├── createdBy
└── AudienceMember[]
```

---

## AudienceMember must reference canonical Lead

Conceptually:

```text
AudienceMember
├── audienceSnapshotId
├── leadId
└── inclusion metadata
```

Do not copy full mutable Lead into the audience table.

Snapshotting exact send fields may be justified separately for delivery evidence, but that is different from duplicating Lead identity.

---

## CampaignAudience snapshot ≠ Campaign enrollment

Design 012 established:

```text
Campaign
Sequence
Enrollment
Message
```

The audience snapshot can be the candidate set from which eligible enrollments are created.

Not every audience Lead necessarily becomes enrolled.

---

## Segment membership ≠ sending eligibility

Critical.

A Lead can satisfy a segment but still be ineligible for Outreach because of:

* suppression,
* invalid address,
* channel policy,
* campaign exclusion,
* already enrolled,
* legal/compliance policy.

Those checks belong to the Outreach engine.

---

## Static LeadList can also feed an AudienceSnapshot

If a Campaign is launched from a static list:

pin membership at launch.

Do not assume future list changes silently alter the already-approved Campaign audience.

---

## Campaign audience must not mutate because source list changes later

Example:

```text
9:00 AM:
Campaign audience snapshot contains 500 Leads

10:00 AM:
10 Leads removed from source LeadList

Existing campaign snapshot:
still records original 500-member selection
```

Actual send eligibility can still suppress/remediate Leads under current delivery rules.

Historical audience intent remains stable.

---

## Export snapshot

If Design 088 supports export:

the export operation should similarly know the exact:

* filter/list/segment revision,
* authorized membership,
* time,
* actor.

A later CRM update does not retroactively alter an already generated export.

---

## Contact/Company fields used by Segment remain source data

Example:

```text
company.industry = SaaS
contact.title = CEO
```

If those canonical values change:

future dynamic evaluation can change.

Historical SegmentEvaluation remains historical.

---

## Segment count ≠ permanent member count

For dynamic segments:

```text
segment.currentCount
```

should be a projection/evaluation result with freshness metadata.

Do not treat it as a manually maintained canonical integer.

---

## Zero members ≠ evaluator failure

Critical.

---

## Unknown count ≠ zero

Critical.

---

## Segment evaluation ≠ Lead authorization

A Segment may evaluate candidate matches from the eligible authorized Lead universe.

Possession of a historical result does not become permanent permission to those Leads.

---

# 4. Permissions

Design 088 requires careful separation between grouping, evaluation, CRM visibility and audience/export authority.

Conceptually:

```text
lead.read

leadList.read
leadList.create
leadList.edit
leadList.membership.manage
leadList.archive

segment.read
segment.create
segment.edit
segment.evaluate

audience.create
audience.export
campaignAudience.use
```

Exact permission keys belong to Phase 3D.

---

## LeadList access ≠ Lead access

A user may know that a list exists without being entitled to every Lead inside it.

List queries must intersect memberships with current Lead authorization.

---

## Membership does not confer Lead permission

Critical.

```text
Lead L1 is in List A
```

does not mean every user who can see List A automatically receives full access to Lead L1 unless list visibility policy explicitly grants that—which should not be assumed.

---

## Adding Lead to list requires Lead authorization

The actor should be authorized to reference/manage that Lead under list policy.

---

## Removing Lead from list ≠ editing Lead

Separate permission.

---

## Segment evaluation must start from authorized Lead scope

Never:

```text
evaluate all tenant Leads
→ return restricted matches
→ frontend hides them
```

Evaluation must be permission-aware server-side.

---

## Segment result counts can leak restricted Leads

Example:

```text
User can access 50 Leads.
Tenant has 10,000.

Segment says:
8,142 matching Leads.
```

That leaks restricted CRM population.

Counts must use the permitted evaluation scope or a deliberately governed aggregate policy.

---

## Filter field authorization

A user should not be allowed to filter by a field they are not allowed to know if the resulting membership/count would leak that information.

Example:

> Contract amount > $100,000

should not become a Lead segment field for users without commercial permission merely because the query returns only Lead IDs.

---

## Segment field registry should be permission-aware

Each segmentable field needs conceptually:

```text
field key
data type
source domain
operators
required permission
normalization
version
```

---

## Segment definition sharing ≠ data access sharing

A shared SegmentDefinition:

> “Enterprise CEOs”

does not automatically grant access to all matching Leads.

Every evaluation uses current permissions/policy.

---

## Segment creator access can later change

A Segment created by Alice while she had broad Sales access must not remain a permanent access bypass after her role is reduced.

---

## Saved evaluation ≠ access token

Permanent.

---

## CampaignAudience snapshot ≠ permission token

A historical audience can preserve exact selection lineage while current downstream operations still enforce relevant current:

* Lead access,
* campaign permission,
* delivery eligibility.

---

## Export permission is high sensitivity

Export may expose:

* names,
* emails,
* phones,
* Companies,
* CRM metadata.

`segment.read` must not automatically equal `export.allData`.

---

## Export fields need separate authorization

A user might export:

* Lead name,
* Company,

but not:

* private phone,
* restricted email,
* internal notes.

---

## Static list visibility can differ from membership-management authority

A viewer can read List A without being allowed to add/remove Leads.

---

## Segment edit ≠ evaluate necessarily

In some roles an admin may configure a shared segment while another user evaluates/uses it.

Logical separation remains useful.

---

## Segment evaluation ≠ Campaign creation

Permanent.

---

## Segment use ≠ Campaign sending

Permanent.

---

## ProspectCandidate exclusion must be server enforced

A malicious request with:

```text
candidateId
```

must not create `ListMembership`.

Membership foreign keys/type constraints should point only to canonical Lead identity.

---

## Cross-tenant memberships prohibited

Absolute.

Both:

```text
LeadList.organizationId
Lead.organizationId
```

must resolve to the same authorized tenant.

---

## Direct membership/list/segment IDs reauthorize

Knowing IDs grants no access.

---

# 5. States

Design 088 must keep **Lead lifecycle, static list lifecycle, static membership state, segment-definition lifecycle, evaluation state, evaluation freshness and audience-snapshot state** separate.

### LeadList lifecycle

Conceptually:

```text
Active
Archived
```

where applicable.

### Static membership

```text
Member
Removed / Historical
```

if history retained.

### SegmentDefinition lifecycle

```text
Draft / Active
Invalid
Archived
```

depending on implementation/frozen design.

### Segment evaluation

```text
Not Evaluated
Queued
Evaluating
Succeeded
Partially Available
Failed
Cancelled
```

### Evaluation freshness

```text
Current
Stale
Needs Re-evaluation
Unknown
```

### Evaluation count

```text
Exact
Approximate
Capped
Unavailable
```

if backend does not always guarantee exact totals.

### Audience snapshot

```text
Preparing
Ready
Partially Prepared
Failed
Superseded / Historical
```

These must not become one `segment.status`.

---

## List active ≠ Leads active

Permanent.

---

## Lead removed from list ≠ Lead archived

Permanent.

---

## List archived ≠ Lead archived

Permanent.

---

## Segment active ≠ evaluation current

A Segment can be valid but last evaluation stale.

---

## SegmentDefinition valid ≠ evaluation succeeded

Permanent.

---

## Evaluation failed ≠ segment invalid necessarily

A temporary Company service outage can fail evaluation while the rule remains valid.

---

## Segment invalid ≠ zero members

Critical.

Invalid rule is not empty result.

---

## Zero matching Leads ≠ failed evaluation

Permanent.

---

## Unknown result count ≠ zero

Permanent.

---

## Stale evaluation ≠ current membership

Permanent.

---

## Lead field change can invalidate current membership projection

Expected.

---

## Segment rule edit makes old evaluation historical

Old evaluation remains useful for lineage, but not as current membership.

---

## Static list membership does not become stale due to Lead field changes

The Lead can change status/Company and remain a member until explicitly removed.

That is exactly why static and dynamic groups must remain different.

---

## Audience snapshot ready ≠ all Leads sendable

Permanent.

Outreach eligibility runs separately.

---

## Audience member later disqualified ≠ historical audience snapshot rewritten

Permanent.

Current campaign execution can suppress it.

---

## Segment service unavailable ≠ LeadList unavailable

Static list operations should remain usable when dynamic evaluator fails, where backend dependencies permit.

---

## Company/Contact resolver failure

If a Segment depends on Company/Contact predicates and that source is unavailable:

do not silently evaluate those Leads as non-matches.

Use:

* partial/unavailable,
* deferred evaluation,
* explicit unknown policy.

---

## State Coverage

Design 088 inherits Design 150 plus:

```text
Lead Lists Loading
Lead Lists Available
Lead Lists Empty
Lead List Restricted

Lead List Active
Lead List Archived

Lead Membership Present
Lead Already in List
Lead Membership Removed

Segments Loading
Segments Available
Segments Empty

Segment Definition Valid
Segment Definition Invalid
Segment Definition Archived

Segment Not Evaluated
Segment Evaluation Queued
Segment Evaluating
Segment Evaluation Succeeded
Segment Evaluation Partially Available
Segment Evaluation Failed
Segment Evaluation Cancelled

Segment Evaluation Current
Segment Evaluation Stale
Segment Needs Re-evaluation
Segment Freshness Unknown

Zero Authorized Matches
Match Count Available
Match Count Approximate
Match Count Unavailable

Audience Snapshot Preparing
Audience Snapshot Ready
Audience Snapshot Partially Prepared
Audience Snapshot Failed

Lead No Longer Accessible
Lead No Longer Matches Dynamic Segment
Lead Remains in Static List
Source Field Service Unavailable

Partial Segmentation Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should clearly distinguish **static list management** from **dynamic segmentation**.

Conceptually:

```text
Lead Lists / Segments
↓
Collection selector
↓
Definition / summary
↓
Canonical Lead results
    ├── Lead identity
    ├── Contact
    ├── Company
    ├── Lead state
    ├── reason/context where frozen
    └── membership/action
```

Only fields and controls present in frozen Design 088 should render.

---

## Static vs dynamic must be visible

A user should understand whether:

### Static

> These Leads were explicitly added.

or:

### Dynamic

> These Leads currently match the configured rules.

Do not hide that distinction behind identical “list” terminology.

---

## Dynamic rule editor

If frozen design includes rule controls:

show typed fields/operators rather than free-form raw database queries.

The UX should not expose SQL/DSL internals.

---

## Result rows remain Leads

A Lead should still look like a Lead.

Do not render:

> Segment Member #124

as though membership were the person/opportunity identity.

---

## Company/Contact remain context

Example:

```text
Lead: Sarah Patel — Executive Profile
Contact: Sarah Patel
Company: Globex
```

where frozen model supports that structure.

Do not flatten all three into one row identity.

---

## Bulk actions

If frozen design supports:

* add to list,
* remove from list,
* export,
* use for campaign,

bulk operation must remain per-Lead permission and outcome aware.

---

## Tablet

Following Design 152:

* filter/rule panels collapse appropriately,
* Leads become compact rows/cards,
* static/dynamic type remains visible,
* selected segment context persists,
* bulk actions remain touch-safe.

---

## Mobile

Priority:

```text
List / Segment
↓
Type: Static or Dynamic
↓
Definition / membership summary
↓
Lead Card
   ├── Lead identity
   ├── Company / Contact context
   ├── Lead status
   └── membership / match context
```

Do not compress a complex desktop segmentation rule grid horizontally.

---

## Mobile rule editing

If rule editing is part of frozen mobile behavior:

use stacked field/operator/value groups.

Do not expose a tiny desktop query builder.

---

## Match explanation

If frozen design displays why a Lead matched, keep it concise and typed.

Example:

> Qualified · Germany · Technology

rather than exposing internal expression syntax.

---

## Accessibility

A result could communicate:

> Lead Sarah Patel at Globex. Member of static list Q4 Priority Outreach.

or:

> Lead Sarah Patel at Globex. Currently matches dynamic segment Enterprise Technology CEOs.

where canonical data supports it.

---

# 7. Backend Requirements

## Lead-list architecture

```text
LeadListService
    │
    ├── LeadList
    └── ListMembership
             │
             ↓
      canonical Lead IDs
```

No Lead copies.

---

## Static membership commands

Prefer narrow operations such as:

```text
addLeadToList(listId, leadId)
removeLeadFromList(listId, leadId)
```

with:

* tenant validation,
* Lead authorization,
* membership uniqueness,
* idempotency,
* Audit/activity where appropriate.

---

## No generic embedded Lead array

Avoid:

```text
LeadList {
  leadsJson: [...]
}
```

as canonical membership storage.

Use proper relationships/indexes.

---

## Membership uniqueness

At database level:

```text
UNIQUE(organizationId, leadListId, leadId)
```

or equivalent tenant-safe relationship constraint.

---

## Bulk membership operations

For 1,000 Leads:

* authorize appropriately,
* dedupe input IDs,
* process safely,
* return per-record outcomes.

Do not create duplicate relationships.

---

## SegmentDefinition needs a safe typed expression model

Avoid storing user-controlled:

```text
WHERE ...
```

or arbitrary SQL/search DSL.

Use a governed AST/expression structure.

Conceptually:

```text
AND
├── LEAD.status EQUALS QUALIFIED
├── COMPANY.industry IN [...]
└── CONTACT.title CONTAINS "CEO"
```

---

## Segment field registry

A canonical registry should define:

```text
SegmentFieldDefinition
├── key
├── source domain
├── data type
├── allowed operators
├── required permission
├── nullable semantics
├── normalization rules
├── join strategy
└── schema version
```

This prevents frontend/backend rule drift.

---

## SegmentDefinition should pin expression/schema version

Critical.

Historical SegmentEvaluation must remain explainable after:

* fields renamed,
* operator semantics changed,
* CRM model evolved.

---

## Operator semantics must be precise

Examples:

```text
EQUALS
NOT_EQUALS
IN
CONTAINS
IS_EMPTY
GREATER_THAN
BEFORE
AFTER
```

should have explicit:

* null behavior,
* case handling,
* timezone behavior,
* multi-value behavior.

---

## Null ≠ empty string

Critical for segmentation.

---

## Unknown ≠ false

Example:

```text
Company industry unavailable
```

must not automatically mean:

> industry != Technology

unless the operator/policy explicitly defines that.

---

## Date/time segmentation

For:

* created date,
* follow-up date,
* last activity,

timezone semantics must be standardized.

---

## Dynamic relative filters

If frozen design supports:

> created in last 30 days

the SegmentDefinition stores the rule:

```text
createdAt >= now - 30d
```

not the concrete date forever unless intentionally snapshotted.

Therefore membership changes over time even without CRM edits.

---

## Evaluation service

Conceptually:

```text
evaluateSegment(
    segmentDefinitionId,
    actorContext,
    evaluationPurpose
)
```

should:

1. load exact SegmentDefinition revision;
2. validate definition/schema;
3. establish authorized Lead universe;
4. apply typed predicates;
5. enforce source-domain field permissions;
6. return canonical Lead IDs;
7. record evaluation metadata where persistence is needed.

---

## Evaluation should be server-side

Never download all Leads to browser and filter there.

---

## Authorization-before-evaluation

The query engine must operate on the allowed Lead universe.

It must not compute hidden Leads and remove them only afterward if counts/results could leak their existence.

---

## Segment evaluation query planner

At scale, support efficient joins/projections for:

* Lead,
* Contact,
* Company,

without arbitrary N+1 requests.

Potential strategies:

* relational indexed queries,
* authorized materialized CRM search projection,
* governed segmentation index.

Regardless of implementation, canonical records remain the source of truth.

---

## Segment index ≠ CRM source of truth

If a segmentation index is used:

it must be:

* reconstructable,
* permission-aware,
* revision/freshness aware,
* not independently mutable.

---

## Segment evaluation identity

When a result must be recorded:

```text
SegmentEvaluation
```

should pin:

* segment ID,
* segment revision,
* field-schema version,
* actor/policy context,
* evaluatedAt,
* result-count semantics,
* data/index freshness.

---

## Do not necessarily persist every exploratory evaluation

Interactive preview can be transient.

Persist evaluations when required for:

* Campaign lineage,
* export,
* scheduled workflow,
* audit/reproducibility.

---

## Current count cache

A segment can maintain a cached count, but it must include:

```text
evaluatedAt
freshness
```

No naked integer presented as eternally current.

---

## Dynamic membership materialization

If high-scale operations maintain:

```text
SegmentMembershipProjection
```

updates should respond to relevant events such as:

```text
LeadUpdated
ContactUpdated
ContactCompanyRelationshipChanged
CompanyUpdated
```

where those fields affect segment rules.

---

## Dependency-aware invalidation

Only segments using a changed field need invalidation/re-evaluation where optimization supports it.

Example:

```text
Company.industry changed
```

should invalidate segments depending on Company.industry.

---

## Segment rule change

Changing the rule increments revision and invalidates current evaluation.

Historical evaluations remain pinned to prior revision.

---

## Campaign audience snapshot service

When stable membership is required:

```text
createAudienceSnapshot(
    sourceType,
    sourceId,
    evaluationId/revision,
    currentActor
)
```

produces immutable/pinned Lead membership.

---

## Audience snapshot member uniqueness

```text
UNIQUE(audienceSnapshotId, leadId)
```

or equivalent.

---

## Audience snapshot should preserve inclusion lineage

For example:

```text
sourceSegmentId
segmentRevision
segmentEvaluationId
includedAt
```

This makes campaign origin reproducible.

---

## Audience snapshot ≠ current Lead state snapshot necessarily

The snapshot primarily pins membership.

If downstream legal/communication evidence requires exact:

* email,
* Company,
* personalization fields,

those should be captured by the Outreach/Message delivery/versioning domain at the appropriate time.

Do not solve all delivery history inside segmentation.

---

## Reauthorization before downstream use

Historical audience selection must not bypass current relevant authorization or campaign policy.

---

## Suppression/eligibility stage

The Outreach engine should perform something conceptually like:

```text
AudienceSnapshot
       ↓
CampaignEligibilityResolver
       ↓
eligible Enrollment candidates
```

Checks may include source-domain rules such as:

* active Lead,
* valid channel,
* suppression,
* already enrolled.

Design 088 must not own those outreach-specific states.

---

## Export service

If frozen Design 088 supports export:

```text
exportSegmentEvaluation(...)
```

must:

* authorize export,
* pin exact evaluation/audience membership,
* apply field-level permissions,
* log/audit material data export,
* avoid raw unrestricted CRM dump.

---

## SavedView reuse

If a SavedView and SegmentDefinition share filter grammar:

reuse the same low-level safe expression primitives.

Do not necessarily merge the two entities.

---

## Search/filter syntax reuse

Design 079 Search and Design 088 Segmentation may share:

* tokenization,
* field definitions,

where useful, but search relevance and segmentation boolean membership remain different engines.

---

## Audit

Material operations may include:

```text
LeadListCreated
LeadAddedToList
LeadRemovedFromList
SegmentCreated
SegmentDefinitionChanged
AudienceSnapshotCreated
LeadExportCreated
```

according to Audit policy.

High-volume evaluation reads need not flood Design 039.

---

## Activity ≠ Audit

List membership/activity may be operationally visible without becoming compliance truth.

---

## Event model

Useful events:

```text
LeadAddedToList
LeadRemovedFromList

SegmentDefinitionChanged
SegmentEvaluationCompleted

AudienceSnapshotCreated
```

can drive projections or later Campaign workflows.

---

## Concurrency

### Static list

Two users adding same Lead concurrently must result in one membership.

### Segment edits

Use revision/optimistic concurrency so one editor does not silently overwrite another's criteria.

### Audience snapshot

Pin exact source revision/evaluation inside one controlled operation.

---

## Delete/archive semantics

### Delete/archive LeadList

Preserve Leads.

### Delete/archive SegmentDefinition

Preserve:

* Leads,
* historical evaluations required for Campaign/export provenance,
* AudienceSnapshots.

---

## Campaign history dependency

If Campaign C1 used Segment S1 revision 4:

later:

* editing S1,
* archiving S1,

must not make Campaign C1's audience lineage unreconstructable.

---

## Partial failure

Example:

```text
Lead core query       ✓
Contact attributes    ✓
Company attributes    ✕
```

For a Segment dependent on Company fields:

do not return:

> 0 matches.

Return failed/partial/unknown evaluation according to segment semantics.

A LeadList not requiring Company evaluation may remain usable.

---

## Backend Requirement Matrix

| Requirement                                               | Status                       |
| --------------------------------------------------------- | ---------------------------- |
| Authenticated Team Workspace                              | **Critical**                 |
| Canonical Lead reuse from 011                             | **Critical**                 |
| ProspectCandidate exclusion before CRM admission          | **Critical**                 |
| LeadList/Lead separation                                  | **Critical**                 |
| LeadList/ListMembership separation                        | **Critical**                 |
| Static/dynamic membership separation                      | **Critical**                 |
| One Lead → many lists                                     | **Critical**                 |
| Membership uniqueness                                     | **Critical**                 |
| Membership idempotency                                    | **Critical**                 |
| Remove membership/Lead deletion separation                | **Critical**                 |
| Archive list/Lead deletion separation                     | **Critical**                 |
| SegmentDefinition first-class model                       | **Critical**                 |
| SegmentDefinition/evaluated members separation            | **Critical**                 |
| Versioned SegmentDefinition                               | **Critical**                 |
| Safe typed expression AST                                 | **Critical**                 |
| No raw SQL/search DSL                                     | **Critical**                 |
| Segment field registry                                    | **Critical**                 |
| Field/operator schema versioning                          | **Critical**                 |
| Field-level permission gating                             | **Critical**                 |
| Null/unknown semantics                                    | **Critical**                 |
| Date/timezone semantics                                   | **Critical**                 |
| Dynamic relative-time filter support                      | **Required if present**      |
| SegmentEvaluation/Definition separation                   | **Critical**                 |
| Evaluation pinned to exact definition revision            | **Critical**                 |
| Authorized Lead universe before evaluation                | **Critical**                 |
| Permission-aware result counts                            | **Critical**                 |
| Server-side evaluation                                    | **Critical**                 |
| Contact/Company canonical filter joins                    | **Critical**                 |
| No duplicated Contact/Company fields as business truth    | **Critical**                 |
| Dynamic membership projection rebuildability              | **Critical if materialized** |
| Event-driven invalidation                                 | **Required at scale**        |
| Evaluation freshness metadata                             | **Critical**                 |
| Zero/unknown/failure separation                           | **Critical**                 |
| SavedView/SegmentDefinition separation                    | **Critical**                 |
| Filter/SegmentDefinition separation                       | **Critical**                 |
| CampaignAudience/SegmentEvaluation separation             | **Critical**                 |
| Stable AudienceSnapshot                                   | **Critical**                 |
| Audience member uniqueness                                | **Critical**                 |
| Audience snapshot provenance                              | **Critical**                 |
| Source list/segment later changes do not rewrite snapshot | **Critical**                 |
| Audience snapshot/current authorization separation        | **Critical**                 |
| Segment membership/campaign eligibility separation        | **Critical**                 |
| Outreach Enrollment remains Design 012 domain             | **Critical**                 |
| Export permission separate from segment read              | **Critical**                 |
| Field-safe exports                                        | **Critical**                 |
| Per-record bulk authorization                             | **Critical**                 |
| Tenant isolation                                          | **Critical**                 |
| Optimistic concurrency for segment edits                  | **Critical**                 |
| Static membership concurrency safety                      | **Critical**                 |
| Historical evaluation/audience retention                  | **Critical**                 |
| Design 079 search separation                              | **Critical**                 |
| Design 089 same Lead identity                             | **Critical**                 |
| Partial source-domain failure handling                    | **Critical**                 |

---

# 8. Consolidation

Design 088 creates a high risk of duplicating CRM Leads or making dynamic query results look permanent.

**Lead / LeadList conflation**
List becomes another Lead table.

**Lead / ListMembership conflation**
Membership lifecycle changes Lead lifecycle.

**LeadList / array-of-copied-Leads conflation**
Lead edits diverge between CRM and list.

**Duplicate list membership / duplicate Lead conflation**
Adding twice creates another Lead row.

**Remove from list / delete Lead conflation**
Organizational action destroys CRM record.

**Remove from list / disqualify Lead conflation**
Segmentation changes Sales lifecycle.

**Archive list / archive Leads conflation**
Deleting collection removes business records.

**One Lead / one list assumption**
Marketing/Sales grouping becomes artificially exclusive.

**Static list / dynamic segment conflation**
Explicit membership unexpectedly changes whenever Lead data changes.

**Dynamic segment / static membership conflation**
System writes permanent membership rows and stops re-evaluating rules.

**SegmentDefinition / SegmentEvaluation conflation**
Rule and one point-in-time result become the same record.

**Segment rule edit / historical evaluation rewrite**
Past campaign membership becomes unreconstructable.

**Segment count / permanent truth conflation**
Stale cached count is treated as current.

**Zero matches / evaluation failure conflation**
Outage appears as valid empty audience.

**Unknown count / zero conflation**
Missing source data looks like no Leads.

**Segment invalid / zero members conflation**
Broken criteria appear as successful empty result.

**Filter / SegmentDefinition conflation**
Every temporary filter creates business segmentation objects.

**SavedView / SegmentDefinition conflation**
UI preference becomes Campaign audience rule.

**SavedView visibility / Lead access conflation**
Sharing a view accidentally shares restricted Leads.

**Search / Segment conflation**
Relevance-ranked search results become deterministic audience membership.

**ProspectCandidate / Lead conflation**
Pre-CRM prospects enter Lead lists before admission.

**Contact / Lead conflation**
Contact attributes become copied Lead fields.

**Company / Lead conflation**
Company attributes become duplicated segmentation truth.

**Current Company field / historical SegmentEvaluation conflation**
Old audience changes when Company data changes.

**List member / Campaign enrollment conflation**
Every listed Lead gets automatically contacted.

**Segment member / campaign eligibility conflation**
Suppressed or invalid Leads bypass Outreach policy.

**SegmentEvaluation / CampaignAudience conflation**
Live segment keeps mutating a launched Campaign.

**Campaign audience / current segment conflation**
Editing a rule changes an already-approved audience silently.

**Static LeadList change / launched Campaign change conflation**
Removing a Lead from source list rewrites campaign history.

**AudienceSnapshot / Lead copy conflation**
Campaign stores parallel editable Lead profiles.

**Historical audience / permanent authorization conflation**
Revoked users retain access through old snapshots.

**Audience selection / sending truth conflation**
Pinned member set bypasses current suppression/channel rules.

**Segment read / export permission conflation**
Ordinary viewer can exfiltrate CRM PII.

**Result count / harmless metadata conflation**
Restricted Lead population leaks through counts.

**Filterable field / readable field conflation**
User infers confidential values from segmentation results.

**Segment creator's old permissions / current permissions conflation**
Saved rule becomes access escalation.

**Shared SegmentDefinition / shared data access conflation**
Rule visibility grants Lead visibility.

**Browser-side segmentation**
Server sends broad CRM data and frontend filters it.

**Raw SQL/DSL / filter definition conflation**
Segmentation becomes injection vector.

**Null / false conflation**
Unknown Company/Contact fields generate incorrect exclusions.

**Relative-time segment / static date conflation**
“Last 30 days” stops being dynamic.

**Materialized SegmentMembership / canonical truth conflation**
Cache becomes independently edited audience database.

**CRM event lag / current membership conflation**
Stale materialization silently drives Campaign audience.

**Static and dynamic membership same table without semantics**
Manual changes corrupt dynamic segments.

**List membership / Lead owner conflation**
Adding Lead changes sales ownership.

**Bulk operation / one authorization decision conflation**
Restricted Lead IDs slip into list/export.

**LeadList delete cascade**
Foreign-key configuration deletes Leads.

**Segment delete / audience history delete conflation**
Past Campaign provenance disappears.

**Campaign archive / segment rewrite conflation**
Historical delivery cannot explain why Lead was included.

**Export file / current CRM truth conflation**
Old export is mistaken for live Lead state.

**Company-service failure / no company matches conflation**
Segments silently exclude every Company-dependent Lead.

**088/011 duplicate Lead backend**
Lead CRM and segmentation diverge.

**088/079 duplicate search engine semantics**
Search relevance and boolean segmentation become one unreliable system.

**088/012 duplicate CampaignAudience/Enrollment backend**
Segmentation begins owning Outreach enrollment lifecycle.

**088/084–087 duplicate Company/Contact attributes**
Segmentation tables become stale CRM copies.

No additional screen is required.

These are **Lead identity, collection semantics, dynamic rule evaluation, permission-aware segmentation, evaluation reproducibility, Campaign audience stability, export security, and downstream Outreach-boundary requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL LEAD LIST, DYNAMIC SEGMENTATION & STABLE AUDIENCE PREPARATION ANCHOR**

**Domain directive:**
**Lead ≠ LeadList ≠ ListMembership ≠ SegmentDefinition ≠ SegmentEvaluation ≠ SavedView ≠ Filter ≠ CampaignAudience ≠ ProspectCandidate ≠ Contact/Company.**

**Lead directive:**
Design 011 remains the only canonical Lead model. Design 088 organizes Lead IDs and evaluates Lead rules; it never copies or replaces Lead business state.

**Pre-CRM directive:**
ProspectCandidates from Designs 008/083 cannot become LeadList or Segment members until explicit CRM admission produces a canonical Lead identity.

**Static-list directive:**
LeadList is a persistent grouping object and ListMembership is the explicit relationship between one list and one canonical Lead. One Lead may belong to many lists.

**Membership directive:**
adding/removing membership never creates, deletes, archives, qualifies or disqualifies a Lead. Membership operations are idempotent and uniquely constrained per list + Lead.

**List-lifecycle directive:**
archiving/deleting a LeadList removes or retires the collection only. Leads and their CRM history survive completely.

**Dynamic-segment directive:**
SegmentDefinition stores a versioned rule—not evaluated Lead IDs. Current membership is produced from canonical Lead/Contact/Company data by the segment engine.

**Static-vs-dynamic directive:**
static membership changes only through explicit membership commands; dynamic membership changes whenever relevant canonical data, time-relative conditions, or SegmentDefinition rules change.

**Filter directive:**
ephemeral Filter state remains separate from persistent SegmentDefinition. Applying a temporary CRM filter must never automatically create a reusable business segment.

**Saved-view directive:**
SavedView remains a user/workspace presentation/query preference unless explicitly promoted into a SegmentDefinition. Sharing a SavedView never grants Lead access.

**Expression directive:**
segment rules use a typed, versioned, server-controlled expression model and field registry. Raw SQL, arbitrary ORM predicates and raw search-engine DSL supplied by users are prohibited.

**Field directive:**
segmentable fields define source domain, type, operators, null semantics, normalization and required permission. A field the actor cannot safely inspect must not become a side channel through counts/membership.

**Company/Contact directive:**
segment predicates may consume authorized canonical Company and Contact projections from Designs 084–087 without copying those entities into segmentation as mutable truth.

**Evaluation directive:**
SegmentEvaluation represents execution of one exact SegmentDefinition revision against one governed authorized Lead universe at a point in time.

**Authorization directive:**
segment evaluation is server-side and permission-filtered before results/counts are exposed. Historical membership/evaluation records never become permanent Lead-access credentials.

**Freshness directive:**
dynamic evaluation/result projections carry evaluation time/revision/freshness. A stale SegmentEvaluation must never silently be presented as current membership.

**Null directive:**
`unknown`, `null`, `unavailable`, and `does not match` remain distinct according to typed operator semantics. Source-service failure cannot silently exclude Leads as if the predicate were false.

**Count directive:**
segment/list counts are permission-aware, with `0`, `unknown`, `approximate/capped`, and `unavailable` remaining distinguishable according to backend guarantees.

**Materialization directive:**
if dynamic SegmentMembership is materialized for performance, it remains a rebuildable/read-only projection maintained from canonical CRM events and never becomes manually edited membership truth.

**Audience directive:**
any downstream Campaign/export requiring stable membership creates/pins an exact `AudienceSnapshot` or equivalent evaluated membership set tied to source list/segment revision/evaluation.

**Snapshot directive:**
later edits to a SegmentDefinition, dynamic CRM fields, or static LeadList do not rewrite an already-created CampaignAudience snapshot or its historical inclusion lineage.

**Enrollment directive:**
CampaignAudience is still not Outreach Enrollment. Design 012 remains authoritative for enrollment, Sequence version, Message generation, suppression and channel-specific delivery.

**Eligibility directive:**
segment/list membership expresses selection only. Current Outreach eligibility—including suppression, communication validity, existing enrollment and channel policy—is evaluated separately before downstream sending.

**Export directive:**
exports pin exact authorized membership and apply separate export + field-level permissions. `segment.read` cannot implicitly become unrestricted CRM data export authority.

**Concurrency directive:**
static membership insertion uses unique transactional constraints; SegmentDefinition edits use optimistic revision control; audience creation pins one exact source/evaluation revision atomically.

**Historical-provenance directive:**
historical SegmentEvaluations and AudienceSnapshots needed to explain Campaigns/exports survive later segment edits or archival.

**Search directive:**
Design 079 Universal Search remains relevance-oriented entity discovery. Design 088 segmentation remains deterministic rule evaluation over Leads; neither engine substitutes for the other.

**Performance directive:**
use indexed canonical CRM joins or a governed rebuildable segmentation projection, server-side batch evaluation, stable pagination and dependency-aware invalidation rather than browser filtering or copied Lead/Company/Contact tables.

**Audit directive:**
material list/segment definition, membership, export and audience-snapshot operations can generate appropriate Audit evidence, while routine preview evaluations need not flood Design 039.

**Failure directive:**
Lead, Contact, Company and segment-evaluator dependencies may fail independently. A source failure must become explicit evaluation uncertainty/failure rather than a false zero-member segment.

**Next-detail directive:**
Design 089 must consume the same canonical Lead IDs shown in Design 088. Opening a Lead from a List/Segment goes to the canonical Lead detail domain, not to a list-specific copy.

**Overlap directive:**
Designs **011–013, 079, 083–089** must ultimately share one Lead identity and one governed audience-selection pipeline while keeping Lead CRM, static grouping, dynamic segmentation, Campaign audience and Outreach Enrollment distinct.

**Consolidation directive:**
**STANDARDIZE ONE LEAD GROUPING & SEGMENTATION FOUNDATION — CANONICAL LEAD REFERENCES + EXPLICIT STATIC LEADLIST/LISTMEMBERSHIP + VERSIONED DYNAMIC SEGMENTDEFINITION + TYPED PERMISSION-AWARE FILTER DSL + POINT-IN-TIME SEGMENTEVALUATION + REBUILDABLE MEMBERSHIP PROJECTIONS + IMMUTABLE/PINNED CAMPAIGNAUDIENCE SNAPSHOTS + SOURCE-DOMAIN REAUTHORIZATION — AND NEVER ALLOW LIST MEMBERSHIP, DYNAMIC MATCHES, SAVED VIEWS, SEARCH RESULTS, EXPORTS OR CAMPAIGN SELECTION TO CREATE DUPLICATE LEADS, ALTER LEAD LIFECYCLE, BYPASS CRM PERMISSIONS, OR SILENTLY CHANGE A HISTORICAL AUDIENCE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **88 / 153** |
| **PASS**                                   |                         **88** |
| **STANDARDIZE decisions**                  |                         **86** |
| **Potential implementation-overlap flags** |                         **79** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**88 / 153 = 57.5% audited.**

### Canonical Lead segmentation architecture after Design 088

```text
                           LEAD
                   canonical CRM identity
                            │
             ┌──────────────┴──────────────┐
             ↓                             ↓
         STATIC LIST                  DYNAMIC SEGMENT
             │                             │
             ↓                             ↓
       ListMembership              SegmentDefinition
      explicit membership             versioned rules
                                           │
                                           ↓
                                    SegmentEvaluation
                                           │
                                           ↓
                                      matching Lead IDs
             │                             │
             └──────────────┬──────────────┘
                            ↓
                     Audience Snapshot
                    point-in-time members
                            │
                            ↓
                    Campaign eligibility
                            │
                            ↓
                     Outreach Enrollment
```

The critical static/dynamic distinction is:

```text
STATIC LIST

Lead added explicitly
        ↓
Lead stays in list
even if Lead fields change
until explicitly removed.
```

versus:

```text
DYNAMIC SEGMENT

Lead matches rule today
        ↓
Lead data changes
        ↓
Lead may stop matching tomorrow

No manual membership edit required.
```

And stable downstream execution requires:

```text
Dynamic Segment
      ↓
Evaluate at T1
      ↓
Audience Snapshot A1
      ↓
Campaign launched

Segment changes at T2

A1 DOES NOT CHANGE.
```

Current delivery eligibility can still change independently.

## Next Sequential Audit Target

### **Design 089 — Lead Detail / Lead 360**

The next audit should preserve the Lead-detail composition boundary:

> **Lead ≠ LeadProfileProjection ≠ Contact ≠ Company ≠ LeadSource/Provenance ≠ Qualification ≠ LeadStatus ≠ Deal ≠ ActivityEvent ≠ Note ≠ Task ≠ FollowUp ≠ Meeting ≠ OutreachEnrollment/Conversation.**

It should reconcile Design 011's canonical Lead identity with Designs 084–088 while preserving:

* Lead 360 is a composition surface, not a second Lead entity,
* Lead ≠ Contact and Lead ≠ Company,
* qualification/status/owner remain Lead-domain state,
* Company and Contact profile changes do not rewrite historical Lead acquisition evidence,
* Lead source/provenance remains distinct from current CRM values,
* list/segment membership remains grouping context rather than Lead lifecycle,
* conversion to Deal or Client does not destroy or rewrite the Lead,
* Tasks, FollowUps, Meetings, Outreach, Messages and Notes remain canonical source records,
* sensitive sections require independent source permissions,
* failure of one related domain must not make the canonical Lead appear missing.

The sequence continues strictly with **Design 089 only next**, under the unchanged audit contract.
