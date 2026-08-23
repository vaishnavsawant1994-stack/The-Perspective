# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 085 — Company Detail / Company 360

Design 085 should become the **canonical Team Workspace Company 360 composition surface** built on top of the stable Company identity established by Design 084.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Company ≠ CompanyProfileProjection ≠ ContactCompanyRelationship ≠ Contact ≠ Lead ≠ Deal ≠ ClientRelationship ≠ ActivityEvent ≠ Note ≠ Task ≠ CompanyDomain/Alias ≠ CompanyRelationship.**

The central implementation rule is:

> **Company 360 composes authorized information around one canonical Company. It must never become a second Company entity or a giant mutable object containing copied Contacts, Leads, Deals, Client state, Notes, Tasks, Activity, domains, aliases and company relationships. Every section remains sourced from its canonical domain and independently authorized.**

---

# 1. Classification

| Audit field                         | Classification                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                       | **085**                                                                                                              |
| **Canonical name**                  | **Company Detail / Company 360**                                                                                     |
| **Product area**                    | Team Workspace / CRM / Companies                                                                                     |
| **User surface**                    | **Authenticated Team Workspace**                                                                                     |
| **Screen class**                    | Entity Detail / Cross-Domain CRM 360 Workspace                                                                       |
| **Classification**                  | **Canonical Company Entity Detail & Cross-Domain Composition Anchor**                                                |
| **Primary purpose**                 | Present one complete, permission-safe operational view of a canonical Company and its related CRM/commercial context |
| **Primary entity**                  | **Company** — Design 084                                                                                             |
| **Profile/read projection**         | **CompanyProfileProjection / Company360View**                                                                        |
| **Contact relationship**            | **ContactCompanyRelationship**                                                                                       |
| **Contact entity**                  | Designs 086–087                                                                                                      |
| **Lead entity**                     | Design 011 / later 089                                                                                               |
| **Deal entity**                     | Designs 016–017                                                                                                      |
| **Client relationship**             | Design 021                                                                                                           |
| **Task dependency**                 | Design 034                                                                                                           |
| **Meeting/follow-up dependency**    | Design 015                                                                                                           |
| **Activity dependency**             | platform/domain Activity projection                                                                                  |
| **Audit dependency**                | Design 039 — separate                                                                                                |
| **Company identity evidence**       | CompanyDomain / CompanyAlias — Design 084                                                                            |
| **Company relationship dependency** | CompanyRelationship — Design 084                                                                                     |
| **Universal Search dependency**     | Design 079                                                                                                           |
| **Primary query service**           | `Company360QueryService`                                                                                             |
| **Profile service**                 | `CompanyProfileService`                                                                                              |
| **Parent shell**                    | `InternalAppShell` — Design 001                                                                                      |
| **Auth**                            | Required                                                                                                             |
| **Authorization**                   | Active OrganizationMembership + Company access + per-section source permissions                                      |
| **Implementation priority**         | **Critical CRM Composition / Relationship Integrity / Permission Isolation**                                         |
| **Reuse level**                     | **Extremely High across Company, Contact, Lead, Deal, Client and Work domains**                                      |

Design 085 should answer:

> **“What is this canonical Company, what current/historical business identity do we know about it, who is associated with it, which Leads/Deals/Client relationships exist, what work/activity surrounds it, and which of those sections is the current user actually authorized to inspect or act on?”**

Conceptually:

```text
Company CO-100
      │
      ├── Company profile
      ├── domains / aliases
      ├── Company relationships
      ├── Contact relationships
      ├── Leads
      ├── Deals
      ├── Client relationship
      ├── Tasks / follow-ups / meetings
      ├── Notes
      └── Activity
              │
              ↓
       Company360View
       read composition
              │
              ↓
          Design 085
```

---

# 2. Reuse

## Reuse Design 084 as the only Company identity

Design 085 must load:

```text
Company.id = CO-100
```

from the exact same canonical Company foundation used by Design 084.

Do not introduce:

```text
Company360
CompanyDetailEntity
CompanyProfileRecord
CRMAccount360
```

as new business identities.

A `Company360View` is acceptable as a **read model**.

A second mutable Company backend is not.

---

## Design 084 list and Design 085 detail must share one identity

Correct:

```text
Design 084 CompanyDirectoryEntry
        ↓ companyId
Design 085 Company360View
        ↓
Company CO-100
```

Any update to canonical Company identity should naturally appear in both projections.

---

## Reuse ContactCompanyRelationship

Contacts do not belong inside Company as embedded child documents.

Correct:

```text
Company
   ↑
ContactCompanyRelationship
   ↓
Contact
```

This preserves:

* current employment,
* historical employment,
* board/advisory relationships,
* title/department history,
* contact mobility.

---

## Design 085 ≠ Designs 086–087

Company 360 may summarize associated Contacts.

Contact CRM still owns:

* Contact identity,
* personal profile,
* communication data,
* Contact-specific history.

Design 085 should not create another Contact editing model.

---

## Reuse Design 011 for Lead state

Company 360 can compose Leads associated with the Company.

Lead lifecycle remains canonical in the Lead domain.

Do not store:

```text
company.leads = [...]
```

as copied mutable CRM state.

---

## Reuse Designs 016–017 for Deals

Company 360 can show:

* open Deals,
* won/lost Deals,
* latest Deal context,

but Deal remains a separate opportunity entity.

---

## Reuse Design 021 for Client relationship

If Company has become a Client:

```text
Company
   ↓
Client relationship/account
```

Company 360 may display that relationship.

It must not turn:

```text
company.status = CLIENT
```

into the Client domain.

---

## Reuse Design 034 for Tasks

Company-related work may appear in the Company workspace.

The canonical object remains:

```text
Task
→ context = Company CO-100
```

not:

```text
Company.task1
Company.task2
```

---

## Reuse Design 015 for FollowUps and Meetings

Company 360 can summarize:

* upcoming Meeting,
* next FollowUp,
* last Meeting.

Those remain canonical Meeting/FollowUp entities.

---

## Notes remain separate domain records

If Company Notes are present in the frozen design:

conceptually:

```text
Note
├── contextType = COMPANY
├── contextId = CO-100
├── author
├── body
└── createdAt
```

or equivalent typed context.

Do not add arbitrary free-text `company.notes` as a mutable blob.

---

## Activity remains projection

Activity around Company can include:

* Company updated,
* Contact linked,
* Lead created,
* Deal advanced,
* Meeting occurred,
* Task completed.

Those events remain domain-derived activity.

Do not mutate Company merely to maintain an activity timeline.

---

## Audit remains separate from Activity

Design 039 remains governance evidence.

Company activity can show operationally useful events.

Audit retains:

* actor,
* exact operation,
* security/compliance context.

Do not expose raw AuditEvent payloads as the Company timeline.

---

## Reuse Design 079 Universal Search

Search result:

```text
sourceType = COMPANY
sourceId = CO-100
```

should resolve to this canonical Company detail.

Search index remains a projection.

---

# 3. Entities

## Company

Company remains the stable CRM identity.

Design 085 does not alter the boundary established in Design 084.

---

## Company ≠ CompanyProfileProjection

`CompanyProfileProjection` or `Company360View` is a composed read model.

Conceptually:

```text
Company360View
├── company
├── identitySummary
├── domainSummary
├── contactSummary
├── leadSummary
├── dealSummary
├── clientSummary
├── workSummary
├── activitySummary
└── sectionAvailability
```

This is not a new canonical record.

---

## CompanyProfileProjection should be disposable/rebuildable

If a cached/materialized 360 view is lost:

rebuild it from canonical Company and related domains.

No business data should be lost.

---

## Company profile data ≠ related-domain records

Company fields may include:

* canonical name,
* industry,
* website,
* location,
* size,
* description,

depending on frozen design.

They should not include copied mutable:

* Contact lifecycle,
* Deal state,
* Lead stage,
* Client onboarding status.

---

## CompanyDomain/Alias ≠ profile field strings only

Design 084 established domains/aliases as identity evidence.

Company 360 may display them.

It should not flatten all historical domain/alias evidence into one current `website` string.

---

## Current domain ≠ historical domain

Example:

```text
Current:
acme.com

Historical:
acme.ai
acme.io
```

The detail view can distinguish these if frozen.

Changing current domain must not erase historical evidence.

---

## Alias ≠ canonical current name

An alias helps:

* search,
* dedupe,
* historical recognition.

It should not silently replace current canonical display name.

---

## ContactCompanyRelationship

This is essential to Company 360.

Conceptually:

```text
ContactCompanyRelationship
├── contactId
├── companyId
├── relationship type
├── title
├── department
├── effective dates
├── current/historical state
└── provenance
```

---

## Current Contact ≠ historical Contact

Company 360 should be able to distinguish:

* currently employed,
* former employee,
* adviser/board relation,

if the data model supports it.

Do not delete old employment links just because the Contact changes Company.

---

## Company Contact list ≠ embedded Contacts

A Contact card/list entry on Company 360 is a read projection referencing:

```text
Contact.id
+
ContactCompanyRelationship.id
```

not a copied Contact record.

---

## Contact identity changes independently

If Contact changes:

* phone,
* email,
* name,

Company identity does not change.

---

## Lead

Company 360 may show multiple Leads.

Permanent:

```text
Company
≠
Lead
```

---

## Lead lifecycle remains separate

Examples:

```text
NEW
QUALIFIED
DISQUALIFIED
CONVERTED
```

or canonical Lead lifecycle.

Company remains the same.

---

## Lead owner ≠ Company owner necessarily

Sales ownership can differ.

Do not force one Company owner field to replace every Lead owner.

---

## Deal

A Company can have multiple Deals at different stages simultaneously.

```text
Company CO-100
├── Deal D1 — Proposal
├── Deal D2 — Won
└── Deal D3 — Lost
```

Company 360 should preserve this.

---

## Deal amount ≠ Company value

A Company's “pipeline/revenue summary,” if frozen, is derived.

Do not store one arbitrary:

```text
company.value
```

as a replacement for Deal/Invoice/Revenue domains.

---

## Deal won ≠ Company identity change

Permanent.

---

## ClientRelationship

Company 360 may surface:

```text
Client relationship exists
```

but Client remains a separate relationship/account.

---

## Company ≠ Client billing identity snapshots

Historical ContractParty/Invoice recipient snapshots remain immutable.

Current Company data must not replace historical billing/legal snapshots.

---

## Client relationship can begin/end while Company persists

Permanent.

---

## Company relationship ≠ Client relationship

`CompanyRelationship` means business-to-business relation.

`ClientRelationship` means our commercial/service relationship with the Company.

Do not conflate them.

---

## CompanyRelationship

Design 085 may summarize:

* parent,
* subsidiary,
* affiliate,

where frozen design supports it.

Those are edges between Companies.

---

## Related Company ≠ same Company

Permanent.

---

## Company hierarchy ≠ platform tenant hierarchy

Permanent.

---

## Task

Task related to Company remains Task.

---

## Task completion ≠ Company state change

Unless source-domain business logic explicitly changes something else, completing:

> Follow up with Acme

does not mutate Company lifecycle.

---

## FollowUp ≠ Task

Design 015 boundary remains.

---

## Meeting ≠ ActivityEvent

Meeting is canonical scheduling/interaction entity.

Activity may project:

> Meeting completed.

These remain different.

---

## Note

If notes exist:

* Note has author,
* timestamp,
* visibility,
* context.

Note is not a Company field.

---

## Note ≠ ActivityEvent

Creating a Note can emit Activity.

The Note remains content; Activity remains projection.

---

## Note ≠ AuditEvent

Permanent.

---

## ActivityEvent

Company Activity can combine events from:

* Company,
* Contacts,
* Leads,
* Deals,
* Tasks,
* Meetings,
* Client relationship.

But every Activity entry should preserve canonical source reference.

---

## ActivityEvent ≠ source record

Permanent.

---

## Company 360 “last activity” is derived

If frozen design shows:

> Last activity 2 days ago

that should derive from canonical activity/event policy.

Do not update a mutable `company.lastActivityAt` inconsistently from every frontend interaction unless it is maintained as an explicit source-derived projection.

---

## Company 360 “next action” is also derived

If displayed:

> Next action: Follow up Friday

it should come from canonical Task/FollowUp/Meeting logic.

Do not create an independent Company next-action state.

---

## Company 360 owner

If Company has an explicit account/CRM owner, that is a Company-level responsibility relationship.

It must not automatically replace:

* Lead owner,
* Deal owner,
* Task assignee,
* Client success owner.

These may differ.

---

## Tags/segments ≠ Company identity

If frozen UI shows tags/categories:

they are classification metadata.

They do not determine Company identity or tenant access.

---

## Company score ≠ Company identity/state

If scoring exists in frozen design later:

keep score methodology separate from Company lifecycle.

Do not invent a score in this audit.

---

# 4. Permissions

Company 360 must be **section-authorized**, not just page-authorized.

Conceptually:

```text
canReadCompanyProfile
canReadCompanyContacts
canReadCompanyLeads
canReadCompanyDeals
canReadClientRelationship
canReadCompanyTasks
canReadCompanyNotes
canReadCompanyActivity
canManageCompanyIdentity
```

---

## Company access ≠ every section access

Critical.

A user may be able to see:

> Acme Corporation

without being authorized to see:

* confidential Deal values,
* Finance-related Client data,
* private Notes,
* restricted Contacts.

---

## Source permissions must remain authoritative

Examples:

### Contacts

Use Contact permissions.

### Leads

Use Lead permissions.

### Deals

Use Deal permissions.

### Client

Use Client permissions.

### Tasks

Use Task permissions.

### Notes

Use Note/context permissions.

---

## Company 360 must not load everything then hide it in frontend

Dangerous:

```text
GET company360
→ full Contacts
→ full Deals
→ full Client
→ browser hides restricted sections
```

Correct:

server-side section authorization before payload assembly.

---

## Sensitive aggregate leakage

Even summary counts can leak data.

Example:

> 3 confidential Deals

could reveal restricted Deal existence.

Counts must be permission-aware.

---

## Deal value visibility

A user may be able to know:

> Deal exists

without seeing:

> $150,000 value.

Use field-safe projections.

---

## Contact visibility

A user might access public business Contacts while restricted personal data remains hidden.

---

## Client relationship visibility

Client status and Portal information must not leak to users who only have generic Company CRM permission.

---

## Notes need visibility rules

If Notes support private/team visibility:

Company access alone cannot bypass Note-level audience restrictions.

---

## Activity entries inherit source authorization

Critical.

An Activity entry such as:

> Contract C-101 was signed

must not expose restricted Contract details to a user without Contract permission.

---

## Activity filtering must happen server-side

Do not send restricted activity then hide it.

---

## Direct related entity IDs reauthorize

Clicking:

* Contact,
* Lead,
* Deal,
* Task,

from Company 360 must perform fresh authorization.

---

## Company ownership ≠ permission ownership

A Company owner is operational CRM responsibility.

It must not grant themselves security permissions.

---

## Edit Company ≠ edit related Contact

Permanent.

---

## Edit Company ≠ edit Deal

Permanent.

---

## Edit Company ≠ edit Client

Permanent.

---

## Edit Company ≠ merge Company

Design 084 merge authority remains separate.

---

## Company notes creation ≠ Company edit

Separate permission where appropriate.

---

## Task creation ≠ Company edit

Separate.

---

## Company relationship management ≠ tenant admin

Permanent.

---

## Cross-tenant composition forbidden

All related entities loaded into Company 360 must belong to the same authorized tenant/workspace or valid tenant-safe cross-reference model.

No related object should be attached merely because its ID was supplied.

---

# 5. States

Design 085 must keep **Company lifecycle, profile completeness, related-domain state, section availability, relationship state, and composition/query state** independent.

### Company core lifecycle

```text
Active
Inactive
Archived
Merged
```

where applicable.

### Company profile quality

```text
Complete
Incomplete
Needs Review
Conflicting
```

where derived.

### Section loading state

```text
Loading
Available
Empty
Restricted
Unavailable
Failed
```

for each major related section.

### Contact relationship state

```text
Current
Historical
Unknown
```

### Lead summary state

Domain-specific.

### Deal summary state

Domain-specific.

### Client relationship state

```text
No Client Relationship
Client Relationship Exists
```

plus canonical Client lifecycle where authorized.

These must not become one `company360.status`.

---

## Company core available + Deal service failed

Correct result:

```text
Company profile      ✓
Contacts             ✓
Leads                ✓
Deals                unavailable
Client relationship  ✓
```

The Company must still render.

---

## One related-domain failure ≠ Company missing

This is one of the strongest Design 085 requirements.

---

## Contact list empty ≠ Contact service failed

Permanent.

---

## Lead list empty ≠ Lead service failed

Permanent.

---

## Deal list empty ≠ Deal service failed

Permanent.

---

## No Client relationship ≠ Client service unavailable

Permanent.

---

## Restricted section ≠ empty section

Critical.

A user lacking Deal permission should not see:

> No Deals.

That falsely communicates business state.

Use:

* hidden section,
* permission state,
* safe restricted treatment

according to frozen design.

---

## Company archived ≠ Deals closed

Permanent.

---

## Company inactive ≠ Client inactive

Permanent.

---

## Company merged ≠ related history deleted

Permanent.

---

## Contact former employment ≠ Contact deleted

Permanent.

---

## Deal lost ≠ Company lost

Permanent.

---

## Lead converted ≠ Company converted

Permanent.

---

## Client relationship ended ≠ Company archived

Permanent.

---

## Note deleted/archived ≠ Company changed

Permanent.

---

## Task overdue ≠ Company unhealthy

Unless an explicit derived health model exists later.

Do not invent it here.

---

## Activity unavailable ≠ no activity

Permanent.

---

## Updated elsewhere

Company profile should detect concurrent edit conflicts.

Related sections should refresh/reconcile independently.

---

## State Coverage

Design 085 inherits Design 150 plus:

```text
Company Loading
Company Available
Company Restricted
Company No Longer Accessible
Company Archived
Company Merged

Company Profile Complete
Company Profile Incomplete
Company Needs Review
Company Data Conflict

Contacts Loading
Contacts Available
No Authorized Contacts
Contacts Restricted
Contacts Service Unavailable

Leads Loading
Leads Available
No Authorized Leads
Leads Restricted
Lead Service Unavailable

Deals Loading
Deals Available
No Authorized Deals
Deals Restricted
Deal Service Unavailable

Client Relationship Loading
Client Relationship Available
No Client Relationship
Client Relationship Restricted
Client Service Unavailable

Tasks / Follow-ups Loading
Work Available
No Current Work
Work Restricted
Work Service Unavailable

Notes Loading
Notes Available
No Notes
Notes Restricted
Notes Service Unavailable

Activity Loading
Activity Available
No Authorized Activity
Activity Restricted
Activity Service Unavailable

Company Updated Elsewhere
Related Data Changed
Partial Company 360 Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should use the frozen Company 360 composition while keeping **Company identity primary and related domains visibly secondary**.

Conceptually:

```text
Company identity / summary
↓
Company profile
↓
Cross-domain sections
   ├── Contacts
   ├── Leads
   ├── Deals
   ├── Client
   ├── Work
   ├── Notes
   └── Activity
```

Only sections present in the frozen design should render.

---

## Company header should not become a Deal header

The primary identity must remain:

> Company

even if the Company has a high-value Deal.

Do not visually make Deal stage/value the Company's identity.

---

## Contact summaries

Where Contact cards/rows appear:

show enough to identify:

* Contact,
* relationship/title,
* current/historical association,

without duplicating the full Contact 360.

---

## Deal summaries

Use canonical Deal state and values.

Do not invent Company-level Deal lifecycle.

---

## Client relationship summary

If frozen design shows Client context:

label it clearly as a relationship/account state.

Do not make the Company header itself say:

> Company status: Client Onboarding

as though Client lifecycle were Company lifecycle.

---

## Tablet

Following Design 152:

* 360 sections stack vertically,
* primary Company identity remains visible,
* Contacts/Leads/Deals become cards/lists,
* related sections preserve domain labels,
* actions remain source-specific.

---

## Mobile

Priority:

```text
Company
↓
Core identity
↓
Key Company profile
↓
Contacts
↓
Leads / Deals
↓
Client relationship
↓
Tasks / Notes
↓
Activity
```

The exact order follows the frozen mobile/reference system, not redesign here.

---

## Mobile should not flatten all related objects

Cards should retain labels such as:

* Contact,
* Lead,
* Deal,
* Task.

Do not turn every item into a generic Company activity card.

---

## Partial failure on mobile

If Deals fail:

show the rest of Company 360 normally.

Do not replace whole page with generic error.

---

## Long Company information

Support safe wrapping for:

* legal names,
* domains,
* addresses,
* relationship labels.

No horizontal overflow.

---

## Accessibility

A Company 360 surface should communicate logical landmarks such as:

* Company profile,
* Contacts,
* Leads,
* Deals,
* Client relationship,
* Work,
* Activity.

Related cards should expose their entity type semantically.

---

# 7. Backend Requirements

## Company 360 composition architecture

```text
Design 085
    ↓
Authenticated Workspace Context
    ↓
Company360QueryService
    │
    ├── CompanyProfileAdapter
    ├── CompanyIdentityAdapter
    ├── ContactRelationshipAdapter
    ├── LeadAdapter
    ├── DealAdapter
    ├── ClientRelationshipAdapter
    ├── WorkAdapter
    ├── NotesAdapter
    └── ActivityAdapter
    ↓
Company360View
```

This should be a read-composition layer.

---

## Query anchored on canonical Company ID

Conceptually:

```text
getCompany360(companyId, currentMembership)
```

First step:

```text
authorize Company
```

then independently authorize related sections.

---

## Do not create giant Company aggregate storage

Avoid:

```text
Company360Record
{
  company,
  contactsJson,
  leadsJson,
  dealsJson,
  clientJson,
  notesJson,
  activityJson
}
```

as canonical business truth.

A materialized read cache can exist if:

* source-derived,
* permission-safe,
* replayable,
* invalidated by source revisions.

---

## Company core query should survive related-service failures

The service should support:

```text
company
+
sections
+
sectionHealth
```

instead of all-or-nothing composition.

---

## Section result contract

Conceptually:

```text
SectionResult<T>
├── state
├── data
├── count semantics
├── freshness
└── permission/availability metadata
```

This avoids `[]` meaning:

* empty,
* unauthorized,
* failed,
* not loaded.

---

## Company profile service

Canonical Company mutations remain through `CompanyService`.

Company360QueryService should not invent a second mutation path.

---

## Contact adapter

Should query canonical ContactCompanyRelationship rows first, then safe Contact summaries.

Avoid querying Contact solely by:

```text
contact.companyName = company.name
```

because names can change and are not identity keys.

---

## Current/historical contact filtering

Use relationship dates/state.

Do not infer current employment solely from latest updated Contact.

---

## Lead adapter

Use canonical:

```text
Lead.companyId = companyId
```

or relationship abstraction.

Do not join only on company-name strings.

---

## Deal adapter

Use canonical Company/Deal relation.

Return permission-safe:

* stage,
* amount,
* owner,
* next step,

only where authorized.

---

## Client relationship adapter

Map:

```text
Company
→ ClientRelationship / ClientAccount
```

without mutating Company.

---

## Work adapter

Compose:

* Tasks,
* FollowUps,
* Meetings,

that explicitly reference Company context.

Do not infer work merely because Contact/Lead belongs to Company unless policy defines that relationship.

---

## Notes adapter

Use typed Company context and visibility filtering.

---

## Activity adapter

Activity projector should accept Company as one of its typed contexts and collect allowed domain events.

Every entry should preserve:

```text
sourceType
sourceId
occurredAt
safe actor
safe summary
```

---

## Activity dedupe

If the same source event appears through multiple association paths:

avoid duplicate Activity entries using source event identity.

---

## Activity ordering

Use canonical event time plus stable tie-breaker.

Do not depend on frontend sorting alone.

---

## Activity retention

Operational activity can have its own retention.

Do not depend on Audit retention.

---

## Snapshot vs live related data

Company 360 generally shows current related state.

Historical documents retain snapshots elsewhere.

Do not reconstruct legal/billing history from current Company profile.

---

## Aggregates

If Design 085 shows:

* total Contacts,
* open Leads,
* active Deals,
* won value,

define each metric centrally.

Example:

```text
activeDealCount
```

should have a governed stage/lifecycle definition.

---

## Money aggregation

If Deal values appear:

* currency-aware,
* decimal-safe,
* no naïve summing across currencies.

Do not invent currency conversion rules in this audit.

---

## Permission-aware aggregate query

Counts/values must include only records the user can aggregate under policy.

---

## “Latest” semantics

Fields like:

* latest Deal,
* last activity,
* last contact,
* next task

need explicit resolver definitions.

Never let each frontend section choose independently.

---

## Optimistic concurrency for Company edits

Design 084 requirement continues.

Company 360 editing the Company profile must send expected revision/version.

---

## Related-domain edits use source services

Examples:

```text
edit Contact → ContactService
advance Deal → DealService
complete Task → TaskService
add Note → NoteService
```

Never:

```text
PATCH /company360
{
  dealStage: ...
}
```

---

## Transaction boundaries

Cross-domain 360 actions should not create distributed mega-transactions.

Each source operation owns its transaction and emits events.

The 360 projection reconciles afterward.

---

## Event-driven invalidation

Useful events:

```text
CompanyUpdated
CompanyAliasChanged
CompanyDomainChanged

ContactCompanyRelationshipChanged
ContactUpdated

LeadCreated
LeadUpdated

DealCreated
DealStageChanged

ClientRelationshipChanged

TaskCreated
TaskCompleted
FollowUpUpdated
MeetingUpdated

NoteCreated
ActivityProjected
```

can invalidate affected Company 360 sections.

---

## Cache partitioning

Cache must vary by:

```text
organizationMembershipId
companyId
authorization revision
company revision
related-domain revisions
```

A Company 360 cached for a Sales Manager must not leak Deal/Client sections to a restricted employee.

---

## Section-level caching

Useful because different sections change at different rates.

For example:

* Company profile relatively stable,
* Activity changes frequently,
* Deals change operationally.

---

## N+1 prevention

Company 360 should use batched queries/projections.

Do not fetch:

* 50 Contacts individually,
* 30 Deals individually,
* 100 Activity source records individually.

---

## Pagination within sections

Large Companies may have:

* hundreds of Contacts,
* many Deals,
* long Activity.

Company 360 should use summary + paginated/lazy section loading according to frozen UI.

Do not load all history into initial page.

---

## Direct opening of related entities

Every source detail request reauthorizes.

Company 360's cached permission does not become a durable token.

---

## Company merge handling

If Company was merged in Design 084:

Company 360 should safely resolve:

```text
source company ID
→ merged target Company
```

or display governed merged state.

Do not show two active 360 views for one canonical identity indefinitely.

---

## Company archive handling

Archived Company remains viewable where permissions/history policy allow, but editing/action availability can differ.

---

## Partial failure contract

Example:

```text
Company       ✓
Contacts      ✓
Leads         ✓
Deals         ✕
Client        ✓
Tasks         ✓
Activity      ✕
```

Return:

```text
Company360View
+
sections {
  deals: unavailable,
  activity: unavailable
}
```

Do not return HTTP success with fake empty sections, and do not fail the entire Company if core identity is healthy.

---

## Search integration

Design 079 should index only canonical Company/source summaries.

Company360-specific composite data should not become a broad search document containing every sensitive related record.

---

## Audit integration

Company profile mutations continue Design 084 audit.

Related actions are audited by their own domains.

Company 360 should not duplicate every source AuditEvent simply because it launched the action.

---

## Backend Requirement Matrix

| Requirement                                 | Status                |
| ------------------------------------------- | --------------------- |
| Authenticated Team Workspace                | **Critical**          |
| Canonical Company ID from 084               | **Critical**          |
| Company360View as projection                | **Critical**          |
| No second Company entity                    | **Critical**          |
| Company/profile-projection separation       | **Critical**          |
| Company/Contact separation                  | **Critical**          |
| ContactCompanyRelationship reuse            | **Critical**          |
| Historical/current employment support       | **Critical**          |
| Company/Lead separation                     | **Critical**          |
| Company/Deal separation                     | **Critical**          |
| Company/ClientRelationship separation       | **Critical**          |
| Company/Task separation                     | **Critical**          |
| Company/Note separation                     | **Critical**          |
| Company/Activity separation                 | **Critical**          |
| Activity/Audit separation                   | **Critical**          |
| CompanyDomain/Alias reuse                   | **Critical**          |
| CompanyRelationship reuse                   | **Critical**          |
| Section-level source authorization          | **Critical**          |
| Server-side permission filtering            | **Critical**          |
| Permission-aware counts                     | **Critical**          |
| Restricted/empty/unavailable distinction    | **Critical**          |
| Company core independent of section failure | **Critical**          |
| Section health metadata                     | **Critical**          |
| Company 360 read-composition service        | **Critical**          |
| Source-specific mutations                   | **Critical**          |
| No generic Company360 mega-PATCH            | **Critical**          |
| Event-driven section invalidation           | **Required**          |
| Permission-safe caching                     | **Critical**          |
| Multi-tenant cache isolation                | **Critical**          |
| N+1 protection                              | **Critical**          |
| Section pagination/lazy loading             | **Required at scale** |
| Optimistic Company edit concurrency         | **Critical**          |
| Current/historical snapshot separation      | **Critical**          |
| Merge redirect/resolution                   | **Critical**          |
| Archived Company handling                   | **Required**          |
| Partial failure composition                 | **Critical**          |
| Design 079 safe search reuse                | **Critical**          |
| Design 086–087 Contact reuse                | **Critical**          |
| Design 011 Lead reuse                       | **Critical**          |
| Designs 016–017 Deal reuse                  | **Critical**          |
| Design 021 Client reuse                     | **Critical**          |
| Design 034 Task reuse                       | **Critical**          |
| Design 015 Meeting/FollowUp reuse           | **Critical**          |

---

# 8. Consolidation

Design 085 exposes a major risk of turning Company 360 into a second CRM backend.

**Company / Company360View conflation**
Read composition becomes mutable Company truth.

**Company profile / Company identity conflation**
Editing profile data accidentally changes identity relationships.

**Company / Contact conflation**
Contacts become nested Company records.

**ContactCompanyRelationship / Contact conflation**
Employment data is stored directly on Contact or Company without history.

**Current employment / historical employment conflation**
Job changes erase former relationships.

**Company / Lead conflation**
Lead pipeline state becomes Company state.

**Lead conversion / Company conversion conflation**
Company is mutated rather than retaining separate Client/Deal state.

**Company / Deal conflation**
Deal amount/stage becomes Company lifecycle.

**Deal lost / Company inactive conflation**
Business entity disappears because opportunity failed.

**Company / ClientRelationship conflation**
Client onboarding/billing state gets stored on Company.

**Client relationship end / Company archive conflation**
CRM history disappears when service relationship ends.

**Company / Task conflation**
Tasks become embedded Company status fields.

**Task completion / Company progress conflation**
Finishing one task changes Company lifecycle.

**Company / FollowUp conflation**
Sales next action becomes mutable Company field.

**Company / Meeting conflation**
Last/next meeting is embedded instead of derived.

**Company / Note conflation**
Free-text notes become one mutable Company blob.

**Company / ActivityEvent conflation**
Timeline entries become Company rows.

**Activity / Audit conflation**
Operational timeline leaks compliance/security evidence.

**Activity / source event conflation**
Deleting timeline entry changes source history.

**LastActivityAt / arbitrary UI interaction conflation**
Viewing Company updates its activity timestamp incorrectly.

**Next action / Company field conflation**
Task/FollowUp truth duplicated in Company.

**CompanyDomain / website string conflation**
Current website destroys historical identity evidence.

**Alias / canonical current name conflation**
Old name becomes present identity incorrectly.

**CompanyRelationship / ClientRelationship conflation**
Parent/subsidiary relation is treated as customer relationship.

**Related Company / same Company conflation**
Parent and subsidiary are merged.

**Company access / all-section access conflation**
Generic Company permission leaks Deals, Contacts or Client data.

**Company page permission / source permission conflation**
One role bypasses domain-specific security.

**Aggregate count / harmless metadata conflation**
Restricted Deal existence leaks through counts.

**Deal existence / Deal value permission conflation**
User sees confidential commercial values.

**Company ownership / authorization conflation**
Account owner becomes security administrator.

**Company edit / Contact edit conflation**
Company editor mutates Contact records.

**Company edit / Deal edit conflation**
CRM profile permission advances pipeline.

**Company edit / Client admin conflation**
Company user gains Client relationship administration.

**Company edit / merge authority conflation**
Routine edits perform destructive identity operations.

**Empty section / restricted section conflation**
User is told “No Deals” when they simply lack permission.

**Empty section / failed service conflation**
Outage appears as no Contacts/Leads/Activity.

**One section failure / entire Company failure conflation**
Deal service outage makes Company appear missing.

**Client service outage / no Client conflation**
Commercial relationship truth is misstated.

**Activity service outage / no activity conflation**
Timeline history appears empty.

**Derived summary / canonical state conflation**
Counts/latest values become editable fields.

**Company360 cache / permission token conflation**
Old cached view leaks revoked sections.

**Cache by companyId only**
Restricted employee receives Manager's 360 view.

**Company 360 giant JSON snapshot**
Related-domain data becomes stale duplicate truth.

**Mega PATCH across Company/Deal/Contact/Client**
Transaction ownership and permissions collapse.

**Distributed mega-transaction**
Editing one Company section tries to atomically mutate many independent domains.

**Current Company data / historical legal snapshot conflation**
Contracts/Invoices change when profile changes.

**Merged Company / duplicate active 360 conflation**
Old merged Company remains independently editable.

**Archived Company / deleted Company conflation**
Historical relationships become inaccessible.

**Search document / Company360 composition conflation**
Universal Search indexes restricted composite data.

**085/084 duplicate Company backend**
Directory and 360 disagree on Company identity.

**085/086–087 duplicate Contact data**
Company detail owns copied Contact profiles.

**085/011 duplicate Lead state**
Company detail invents Lead lifecycle.

**085/016–017 duplicate Deal state**
Company detail invents pipeline state.

**085/021 duplicate Client state**
Company detail owns onboarding/account lifecycle.

**085/034 duplicate Tasks**
Company notes/actions become generic embedded checklist.

No additional screen is required.

These are **cross-domain Company composition, relationship integrity, source ownership, section authorization, partial failure, current-vs-historical data, caching and mutation-boundary requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL COMPANY 360, CROSS-DOMAIN CRM COMPOSITION & RELATIONSHIP DETAIL ANCHOR**

**Domain directive:**
**Company ≠ CompanyProfileProjection ≠ ContactCompanyRelationship ≠ Contact ≠ Lead ≠ Deal ≠ ClientRelationship ≠ ActivityEvent ≠ Note ≠ Task ≠ CompanyDomain/Alias ≠ CompanyRelationship.**

**Identity directive:**
Design 084 remains the sole canonical Company identity foundation. Design 085 composes around that identity and never creates a second Company/Account/360 record.

**Projection directive:**
`Company360View` is a permission-safe read composition that can be cached or materialized but must remain rebuildable from canonical source domains and never directly editable as business truth.

**Profile directive:**
Company profile fields remain Company-owned. Related Contact, Lead, Deal, Client, Task, Note and Activity state must not be copied into mutable Company columns.

**Contact directive:**
Contacts remain canonical people, joined through explicit temporal `ContactCompanyRelationship` records. Current and historical employment/association survive Contact moves, Company rename and domain changes.

**Lead directive:**
Company 360 reads canonical Leads associated with the Company. Lead qualification/conversion/lifecycle never becomes Company lifecycle.

**Deal directive:**
Company 360 reads canonical Deals. Deal stage, value, win/loss and ownership remain Deal-domain state; one Company may have many concurrent historical/current Deals.

**Client directive:**
ClientRelationship/ClientAccount remains a separate commercial/service relationship. The Company persists before, during and after Client lifecycle transitions.

**Company-relationship directive:**
parent/subsidiary/affiliate or other CompanyRelationship edges remain separate from Client relationships and never imply identity equivalence or tenant hierarchy.

**Domain/Alias directive:**
CompanyDomain and CompanyAlias remain identity evidence/history. Company 360 may display them, but current domain/name changes never become new identity keys or erase historical evidence.

**Work directive:**
Tasks, FollowUps and Meetings remain source-domain entities using typed Company context. Company 360 may surface their current summaries/actions but never duplicates their lifecycle.

**Note directive:**
Company Notes remain authored contextual records with their own visibility and history rather than a mutable text blob embedded in Company.

**Activity directive:**
Company Activity is a cross-domain projection retaining source entity/event references. Activity entries never become Company fields or substitute for canonical source records.

**Audit directive:**
Design 039 remains governance evidence. Company 360 may show safe operational Activity while source-domain mutations continue producing their own Audit records.

**Authorization directive:**
access to the Company shell never implies access to every section. Contacts, Leads, Deals, Client relationship, Notes, Tasks and Activity are independently source-authorized before server composition.

**Aggregate directive:**
counts, latest-item summaries and value rollups are permission-aware projections. `0`, `restricted`, `unavailable`, and `not loaded` must never collapse into one value.

**Partial-failure directive:**
failure of Contacts, Leads, Deals, Client, Work, Notes or Activity services never makes the canonical Company disappear. Company 360 should return healthy core identity plus explicit per-section availability.

**Mutation directive:**
all actions launched from Company 360 invoke the canonical source service—`CompanyService`, `ContactService`, `LeadService`, `DealService`, `ClientService`, `TaskService`, `NoteService`, etc. A generic `PATCH Company360` mutation is prohibited.

**Transaction directive:**
Company 360 is not a distributed mega-transaction boundary. Each source domain owns its transaction and emits events; the 360 projection reconciles afterward.

**Concurrency directive:**
Company profile edits retain Design 084 optimistic-concurrency protection, while related domains independently enforce their own revisions and invariants.

**Historical-snapshot directive:**
current Company/profile changes never rewrite immutable Proposal, Contract, Invoice, Signer, Payment or other issued historical snapshots.

**Caching directive:**
Company 360 caches must vary by OrganizationMembership/authorization revision and relevant source revisions. Caching solely by Company ID is prohibited.

**Performance directive:**
use batched permission-safe adapters, section-level projections, lazy/paginated large sections and event-driven invalidation rather than N+1 fetching or giant duplicated Company JSON.

**Merge directive:**
if Design 084 merges a Company, Design 085 must resolve merged identity safely and prevent stale old Company 360 surfaces from remaining independently mutable.

**Archive directive:**
archived Companies preserve historical relationships and remain distinguishable from deleted/nonexistent records.

**Search directive:**
Design 079 continues to index only safe canonical Company/search metadata, not the entire permission-sensitive Company 360 composite.

**Future-reuse directive:**
Designs **086–087** must reuse the exact Contact/Company relationship model surfaced here; later Lead, Deal, Client and conversion/handoff screens continue sharing the same Company ID rather than creating parallel account entities.

**Overlap directive:**
Designs **011, 015–017, 021, 034, 039, 079, 083–087 and later 089/096/106** should all compose around one canonical Company identity while retaining their own domain entities and permissions.

**Consolidation directive:**
**STANDARDIZE ONE COMPANY 360 COMPOSITION FOUNDATION — CANONICAL COMPANY IDENTITY + PERMISSION-SAFE COMPANY PROFILE + TEMPORAL CONTACT-COMPANY RELATIONSHIPS + CANONICAL LEAD/DEAL/CLIENT REFERENCES + TYPED WORK/NOTE/ACTIVITY CONTEXT + DOMAIN/ALIAS/COMPANY-RELATIONSHIP EVIDENCE + SECTION-LEVEL AUTHORIZATION + PARTIAL-FAILURE-AWARE READ COMPOSITION — AND NEVER ALLOW THE 360 VIEW, EMBEDDED RELATED DATA, COUNTS, NOTES, ACTIVITY OR CLIENT/DEAL/LEAD STATE TO BECOME A SECOND MUTABLE COMPANY BACKEND.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **85 / 153** |
| **PASS**                                   |                         **85** |
| **STANDARDIZE decisions**                  |                         **83** |
| **Potential implementation-overlap flags** |                         **76** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**85 / 153 = 55.6% audited.**

### Canonical Company 360 architecture after Design 085

```text
                         COMPANY
                    canonical identity
                           │
          ┌────────────────┼─────────────────┐
          ↓                ↓                 ↓
   Identity/Profile    Domains/Aliases   Company Relations
          │
          └────────────────┼─────────────────┘
                           ↓
                    COMPANY 360 LAYER
                     read composition
                           │
     ┌─────────┬───────────┼───────────┬──────────┐
     ↓         ↓           ↓           ↓          ↓
 Contacts    Leads       Deals       Client      Work
     │         │           │           │          │
     ↓         ↓           ↓           ↓          ↓
 canonical  canonical   canonical    canonical   Tasks/
 Contacts    Leads       Deals       Client      FollowUps
                                                   │
                              ┌────────────────────┼─────────┐
                              ↓                    ↓         ↓
                            Notes               Activity   Meetings
```

Every branch remains canonical in its own domain.

The 360 layer only composes them.

The failure boundary is equally important:

```text
Company Profile   ✓
Contacts          ✓
Leads             ✓
Deals             ✕ unavailable
Client            ✓
Tasks             ✓
Activity          ✕ unavailable

RESULT:
Company 360 remains available
with Deals/Activity marked unavailable.

NOT:
“Company not found.”
```

And the mutation boundary remains:

```text
Company profile edit
→ CompanyService

Contact edit
→ ContactService

Deal stage change
→ DealService

Task complete
→ TaskService

Note create
→ NoteService

Company360View itself
→ NO GENERIC BUSINESS MUTATION
```

# Next Sequential Audit Target

## **Design 086 — Contact CRM / Contact Directory**

The next audit should preserve the Contact-domain boundary:

> **Contact ≠ User ≠ AuthenticationIdentity ≠ Company ≠ ContactCompanyRelationship ≠ Lead ≠ ClientContact/ClientPortalUser ≠ CommunicationAddress ≠ ContactAlias/ExternalIdentity ≠ ContactDirectoryProjection.**

It should reconcile Designs **083–085** with the upcoming Contact CRM while preserving:

* Contact is a stable CRM person identity, not an email address or Lead row,
* Contact ≠ platform User/AuthIdentity,
* Contact ≠ Client Portal membership/user,
* one Contact may have several emails, phones, social/external identities and historical Company relationships,
* changing employer must update relationship history rather than recreate Contact,
* one Company may have many Contacts and one Contact may have multiple historical/current Company relationships,
* duplicate Contact detection must not destructively merge people solely from name/email similarity,
* CRM admission from Design 083 must reuse canonical Contact identity where matched,
* Contact directory/search projections remain read models rather than a second Contact backend,
* historical Lead/Deal/Message/Contract evidence must survive Contact profile changes.

The sequence continues strictly with **Design 086 only next**, under the unchanged audit contract.
