# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 089 — Lead Detail / Lead 360

Design 089 should become the **canonical Team Workspace Lead 360 composition surface** built around the stable Lead identity established by Design 011.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Lead ≠ LeadProfileProjection ≠ Contact ≠ Company ≠ LeadSource/Provenance ≠ Qualification ≠ LeadStatus ≠ Deal ≠ ActivityEvent ≠ Note ≠ Task ≠ FollowUp ≠ Meeting ≠ OutreachEnrollment/Conversation.**

The central implementation rule is:

> **Lead 360 composes current authorized CRM, person, company, acquisition, outreach, interaction and work context around one canonical Lead. It must never become a second Lead record or a giant mutable object containing copied Contact/Company profiles, source evidence, Deals, Outreach, Conversations, Tasks, Meetings, Notes and Activity. Each related domain remains canonical and independently authorized.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **089**                                                                                                                            |
| **Canonical name**                 | **Lead Detail / Lead 360**                                                                                                         |
| **Product area**                   | Team Workspace / CRM / Leads                                                                                                       |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                   |
| **Screen class**                   | Entity Detail / Cross-Domain CRM Lead 360 Workspace                                                                                |
| **Classification**                 | **Canonical Lead Entity Detail & Cross-Domain Sales Composition Anchor**                                                           |
| **Primary purpose**                | Present one permission-safe operational view of a canonical Lead and its current CRM, acquisition, outreach and conversion context |
| **Primary entity**                 | **Lead** — Design 011                                                                                                              |
| **Primary read model**             | **LeadProfileProjection / Lead360View**                                                                                            |
| **Contact dependency**             | Designs 086–087                                                                                                                    |
| **Company dependency**             | Designs 084–085                                                                                                                    |
| **Source/provenance dependency**   | Designs 008–010 / 081–083                                                                                                          |
| **List/segment dependency**        | Design 088                                                                                                                         |
| **Outreach dependency**            | Designs 012–014                                                                                                                    |
| **Meeting/follow-up dependency**   | Design 015                                                                                                                         |
| **Deal dependency**                | Designs 016–017                                                                                                                    |
| **Task dependency**                | Design 034                                                                                                                         |
| **Activity/Audit dependency**      | Activity projection / Design 039                                                                                                   |
| **Future conversion dependency**   | Design 106                                                                                                                         |
| **Primary query service**          | `Lead360QueryService`                                                                                                              |
| **Lead mutation service**          | `LeadService`                                                                                                                      |
| **Qualification service/resolver** | `LeadQualificationService` or equivalent                                                                                           |
| **Conversion lineage service**     | `LeadConversionService` or equivalent                                                                                              |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                    |
| **Auth**                           | Required                                                                                                                           |
| **Authorization**                  | Active OrganizationMembership + Lead access + independent source-section permissions                                               |
| **Implementation priority**        | **Critical Sales CRM / Conversion Lineage / Source Integrity**                                                                     |
| **Reuse level**                    | **Extremely High across CRM, Outreach, Deals, Tasks and Communications**                                                           |

Design 089 should answer:

> **“What is this canonical Lead, which Contact and Company does it currently relate to, how and where was it originally acquired, what is its current Lead-domain status/qualification/ownership, which Sales interactions and work surround it, and what downstream Deal/Client lineage exists?”**

Conceptually:

```text
Lead L-100
    │
    ├── Lead-owned profile/state
    ├── Contact
    ├── Company
    ├── Source / provenance
    ├── List / segment context
    ├── Outreach enrollments
    ├── Conversations
    ├── Meetings / FollowUps
    ├── Tasks
    ├── Notes
    ├── Deal / conversion lineage
    └── Activity
            │
            ↓
       Lead360View
       read composition
            │
            ↓
        Design 089
```

---

# 2. Reuse

## Design 011 remains the only canonical Lead identity

Design 089 must load the exact same:

```text
Lead.id = L-100
```

used by the canonical Lead CRM.

Do not create:

```text
Lead360
LeadDetailRecord
LeadProfileEntity
SalesLead360Record
```

as additional business entities.

A `Lead360View` is valid only as a **read composition**.

---

## Design 089 ≠ Contact 360

A Lead may reference a Contact, but:

```text
Lead
≠
Contact
```

Design 087 continues to own the Contact 360 composition.

Lead 360 should only consume a safe Contact summary/context.

---

## Design 089 ≠ Company 360

Same principle:

```text
Lead
≠
Company
```

Company current name/domain/industry come from the canonical Company domain.

The Lead should reference Company identity rather than own a duplicated Company profile.

---

## Reuse Designs 008–010 and 081–083 for acquisition provenance

Design 089 may show:

* acquisition source,
* source run,
* original observed values,
* enrichment evidence,
* CRM admission lineage.

But those remain acquisition/provenance records.

Lead 360 must not rewrite them.

---

## Reuse Design 088 for lists and segments

Lead 360 can show grouping context such as:

* static lists containing this Lead,
* current dynamic segments it matches,

if present in the frozen design.

But:

```text
List membership
≠
Lead status
```

and:

```text
Segment match
≠
Lead qualification
```

---

## Reuse Designs 012–014 for Outreach

An OutreachCampaign or Enrollment involving the Lead remains in the Outreach domain.

Lead 360 can compose:

* active enrollment,
* outreach status,
* replies/conversation context.

It must not copy campaign/enrollment state into the Lead itself.

---

## Reuse Design 015 for Meetings and FollowUps

Lead 360 may summarize:

* next FollowUp,
* upcoming Meeting,
* last Meeting.

They remain canonical Meeting/FollowUp records.

---

## Reuse Designs 016–017 for Deals

Lead conversion may result in a Deal.

The Deal is not a “new version” of Lead.

Correct:

```text
Lead
   ↓ conversion lineage
Deal
```

not:

```text
Lead row
→ transformed destructively into Deal row
```

---

## Reuse Design 034 for Tasks

Lead-related work stays as canonical Task records with typed Lead context.

---

## Notes remain separate contextual records

If frozen Design 089 includes notes:

```text
Note
→ context = Lead L-100
```

is correct.

A mutable `lead.notes` blob is not.

---

## Activity remains a projection

Lead Activity can compose meaningful source events.

It is not canonical Lead state and not Design 039 Audit.

---

# 3. Entities

## Lead

Lead remains the stable CRM Sales identity.

Conceptually:

```text
Lead
├── id
├── organizationId
├── contactId where resolved
├── companyId where resolved
├── owner / assignment
├── Lead lifecycle/status
├── qualification state
├── acquisition lineage reference
├── createdAt
├── updatedAt
└── revision
```

Exact physical schema belongs to Phase 3D.

---

## Lead ≠ LeadProfileProjection

`Lead360View` may conceptually contain:

```text
Lead360View
├── lead
├── contactSummary
├── companySummary
├── provenanceSummary
├── qualificationSummary
├── listSegmentSummary
├── outreachSummary
├── communicationSummary
├── meetingFollowUpSummary
├── taskSummary
├── dealConversionSummary
├── noteSummary
├── activitySummary
└── sectionAvailability
```

This remains reconstructable/disposable.

---

## Lead ≠ Contact

Lead represents a Sales relationship/opportunity-to-engage state.

Contact represents the person.

The same Contact may historically or legitimately relate to multiple Lead contexts according to CRM policy.

---

## Lead Contact snapshot ≠ current Contact profile

At acquisition time, Source may have observed:

```text
Sarah Patel
VP Marketing
sarah@acme.com
```

Later canonical Contact becomes:

```text
Sarah Patel
CMO
sarah@globex.com
```

The Lead may display current Contact context, while acquisition provenance preserves what was observed historically.

Do not rewrite historical Lead source evidence.

---

## Lead ≠ Company

Permanent.

A Company can have multiple Leads.

---

## Company current profile ≠ Lead acquisition Company evidence

At acquisition:

```text
companyName = Acme Technologies
```

Later:

```text
canonical Company = Acme Intelligence
```

The current Lead can point to the same canonical Company while acquisition provenance retains the old observed value.

---

## LeadSource / Provenance

Lead source should not be one mutable string such as:

```text
lead.source = "LinkedIn"
```

when real lineage may be:

```text
Lead
  ↓
CRM Admission
  ↓
ProspectCandidate
  ↓
NormalizedRecord
  ↓
RawObservation
  ↓
ExtractionRun
  ↓
Source
```

---

## Lead source ≠ current Lead values

Permanent.

---

## Provenance ≠ qualification

A reliable Source does not automatically mean a qualified Lead.

---

## Provenance ≠ owner

Source origin and CRM responsibility are unrelated.

---

## Provenance survives manual CRM edits

Changing:

* Contact,
* Company,
* owner,
* status,
* qualification,

must not erase where the Lead originated.

---

## Qualification ≠ LeadStatus

This boundary should remain explicit.

Conceptually:

### LeadStatus

Represents Lead lifecycle/workflow state.

### Qualification

Represents whether/how strongly the Lead meets commercial criteria.

Therefore:

```text
LeadStatus
≠
Qualification
```

A Lead can be:

```text
Status = ACTIVE
Qualification = UNQUALIFIED
```

or another valid combination according to policy.

Exact enums belong to Phase 3D.

---

## Qualification ≠ Deal stage

Permanent.

A Lead qualification assessment is not:

```text
Deal.stage
```

---

## Qualification ≠ conversion

A qualified Lead may still not have a Deal.

---

## LeadStatus ≠ owner

Assignment/ownership is another dimension.

---

## Owner ≠ authorization

Critical.

The employee assigned to the Lead does not automatically gain permissions outside the role/resource authorization model.

---

## Reassignment ≠ Lead status change

A Lead can move:

```text
Alice → Bob
```

without lifecycle transition.

---

## Lead Status ≠ Outreach state

Permanent.

Example:

```text
Lead = QUALIFIED
Outreach enrollment = PAUSED
```

Both can coexist.

---

## Lead Status ≠ Conversation reply state

Permanent.

---

## Lead List membership

Static membership from Design 088 remains relationship data.

A Lead may belong to multiple lists.

---

## Removing list membership ≠ Lead status change

Permanent.

---

## Dynamic Segment match

Dynamic Segment membership remains evaluated context.

If Lead stops matching:

Lead lifecycle does not automatically change.

---

## Segment match ≠ qualification

A segment such as:

> German Technology CEOs

is grouping criteria.

It does not automatically qualify Lead commercially.

---

## OutreachEnrollment

Conceptually:

```text
Lead
   ↓
OutreachEnrollment
   ↓
Campaign / SequenceVersion
```

The enrollment remains an Outreach entity.

---

## One Lead can have multiple historical Campaign enrollments

Subject to campaign policy.

Do not store:

```text
lead.outreachStatus
```

as the only Outreach truth.

---

## Enrollment ≠ Campaign

Permanent.

---

## Enrollment state ≠ Lead state

Permanent.

---

## Message / Conversation

An outreach reply may result in canonical Conversation/Message records.

Those are not Lead fields.

---

## Message reply ≠ Lead status transition automatically

A domain policy may suggest or trigger a Lead action.

But the communication itself remains independent.

---

## Conversation participant ≠ Lead owner

Permanent.

---

## FollowUp

Lead-related FollowUp remains canonical.

---

## FollowUp completion ≠ Lead conversion

Permanent.

---

## Meeting

Meeting remains canonical interaction.

---

## Meeting completed ≠ qualification passed

Permanent.

---

## Meeting outcome may inform Lead state

If the frozen workflow includes outcome-driven status change, that must occur via explicit Lead-domain command/policy.

Meeting record itself does not silently rewrite Lead.

---

## Task

Lead Tasks remain canonical Task records.

---

## Task completion ≠ Lead closed

Permanent.

---

## Note

Lead Notes remain contextual authored records.

---

## Note ≠ source evidence

A Sales rep writing:

> Strong prospect

does not become acquisition provenance.

---

## Note ≠ qualification decision

Unless an explicit qualification action is recorded separately.

---

## Deal

Lead can result in or relate to a Deal.

Use explicit conversion/linkage.

Conceptually:

```text
LeadConversion
├── leadId
├── dealId
├── convertedAt
├── convertedBy
├── conversion context
└── source Lead revision
```

or equivalent lineage.

---

## Lead ≠ Deal

Permanent.

---

## Conversion ≠ destructive transformation

After conversion:

```text
Lead L-100
```

still exists as historical CRM lineage.

---

## Conversion can change Lead lifecycle, not identity

A Lead may move to a terminal/converted state according to canonical policy.

The Lead itself is retained.

---

## Deal changes do not rewrite historical Lead qualification

Later:

* Deal won,
* Deal lost,
* Deal amount changed,

should not retroactively rewrite what the Lead looked like at conversion.

---

## Lead conversion ≠ Client creation necessarily

Lead → Deal and Deal → Client/handoff are distinct business boundaries.

Design 106 later owns won-deal/client handoff.

---

## Client conversion/handoff must preserve Lead lineage

Conceptually:

```text
Lead
 ↓
Deal
 ↓
Won/Handoff
 ↓
ClientRelationship
```

Each entity remains available historically.

---

## ActivityEvent

Lead Activity can include:

```text
Lead created
Lead assigned
Lead qualified
Status changed
Added to list
Outreach enrolled
Reply received
FollowUp completed
Meeting completed
Deal created
Note added
```

where authorized.

Each Activity entry preserves canonical source identity.

---

## ActivityEvent ≠ Lead state

Permanent.

---

## Activity ≠ Audit

Permanent.

---

## “Last contacted” is derived

If frozen Design 089 displays it:

define which events qualify.

Do not update it from arbitrary:

* Lead edit,
* list change,
* tag update.

---

## “Next action” is derived

If frozen design shows next action:

derive from canonical:

* FollowUp,
* Task,
* Meeting,
* workflow policy.

Do not store another generic mutable Lead action field unless it is the canonical source itself.

---

# 4. Permissions

Design 089 requires page-level Lead access plus independent section authorization.

Conceptually:

```text
canReadLead
canEditLead
canAssignLead
canChangeLeadStatus
canQualifyLead

canReadLeadContact
canReadLeadCompany
canReadLeadProvenance

canReadOutreach
canReadConversations
canReadMeetings
canReadFollowUps
canReadTasks
canReadDeals
canReadNotes
canReadActivity
```

---

## Lead access ≠ Contact full-profile access

A Lead user may see:

> Sarah Patel · CMO at Globex

without full access to all Contact PII/history.

---

## Lead access ≠ Company full-profile access

Same principle.

---

## Lead access ≠ provenance/raw evidence access

Raw observations can contain sensitive acquisition data.

A safe provenance summary may be visible without exposing full RawObservation payloads.

---

## Lead edit ≠ Contact edit

Permanent.

---

## Lead edit ≠ Company edit

Permanent.

---

## Lead edit ≠ Outreach campaign edit

Permanent.

---

## Lead status permission ≠ qualification permission

These can be separate.

---

## Lead owner change ≠ role/permission change

Assignment does not alter authorization roles.

---

## Lead owner ≠ sole viewer

Operational ownership and security scope are distinct.

---

## Lead view ≠ Deal view

A user can access the Lead while a related Deal may be confidential.

---

## Lead view ≠ Message/Conversation view

Conversation participants/permissions remain canonical.

---

## Lead view ≠ Notes access

Private Notes need independent audience rules.

---

## Lead view ≠ raw Audit access

Permanent.

---

## List/segment visibility ≠ Lead permission

Design 088 rules continue.

---

## Source permissions remain authoritative

Opening provenance/raw evidence must reauthorize Source/Observation access.

---

## Direct related IDs reauthorize

Opening:

* Contact,
* Company,
* Deal,
* Campaign,
* Conversation,
* Meeting,
* Task,

requires current canonical source authorization.

---

## Conversion permission is separate

Creating a Deal from Lead should require:

* Lead conversion capability,
* Deal creation capability,
* Company/Contact reference validity,

according to policy.

---

## Conversion cannot trust browser-supplied target identities blindly

Server revalidates:

* `leadId`,
* `companyId`,
* `contactId`,
* duplicate/deal policy.

---

## Cross-tenant conversion prohibited

Absolute.

---

## Bulk/list context cannot grant conversion authority

Being in a segment or list does not grant permission to convert the Lead.

---

## Activity filtering must be source-authorized

Do not leak:

> Contract signed

or:

> Deal worth $500k

through Lead Activity to unauthorized users.

---

# 5. States

Design 089 must keep **Lead lifecycle, qualification, ownership, source/provenance state, list/segment membership, Outreach state, interaction state, conversion state and section availability** separate.

### Lead lifecycle

Canonical domain-specific states, for example conceptually:

```text
New
Active
Qualified / Working
Disqualified
Converted
Archived
```

Exact enum must follow existing Lead domain, not be invented from this audit.

### Qualification

Conceptually independent:

```text
Not Assessed
In Assessment
Qualified
Unqualified
Needs Review
```

if supported.

### Ownership

```text
Assigned
Unassigned
Reassigned
```

### Provenance state

```text
Available
Partial
Restricted
Unavailable
Integrity Issue
```

### Conversion state

```text
Not Converted
Conversion In Progress
Converted
Conversion Failed
Conversion Requires Review
```

### Section availability

Every major related section:

```text
Loading
Available
Empty
Restricted
Unavailable
Failed
```

---

## Qualified ≠ converted

Permanent.

---

## Converted ≠ Deal won

Permanent.

---

## Deal won ≠ Client handoff complete

Permanent.

---

## Disqualified ≠ Contact deleted

Permanent.

---

## Disqualified ≠ Company inactive

Permanent.

---

## Lead archived ≠ Contact archived

Permanent.

---

## Lead owner changed ≠ Lead status changed

Permanent.

---

## Outreach failed ≠ Lead disqualified

Permanent.

---

## Message bounced ≠ Lead deleted

Permanent.

---

## No outreach history ≠ Outreach service unavailable

Critical.

---

## No Conversations ≠ Messaging service unavailable

Permanent.

---

## No Meetings ≠ Meetings service unavailable

Permanent.

---

## No Deal ≠ Deal service unavailable

Permanent.

---

## No provenance visible ≠ provenance does not exist

Critical.

---

## Segment evaluator unavailable ≠ Lead belongs to zero segments

Critical.

---

## Contact service unavailable ≠ Lead has no Contact

Critical.

---

## Company service unavailable ≠ Lead has no Company

Critical.

---

## Lead available + related service failure

The Lead must still render.

Example:

```text
Lead core       ✓
Contact         ✓
Company         ✓
Provenance      ✓
Outreach        ✕
Messages        ✓
Meetings        ✓
Tasks           ✓
Deals           ✕
Activity        ✓
```

Result:

> Lead 360 remains available with Outreach/Deals unavailable.

Not:

> Lead not found.

---

## Conversion failed ≠ Lead corrupted

A failed Deal creation should leave Lead identity intact and conversion retry/reconciliation possible.

---

## Conversion outcome unknown ≠ not converted

If downstream Deal creation outcome is uncertain:

reconcile before retrying to avoid duplicate Deals.

---

## State Coverage

Design 089 inherits Design 150 plus:

```text
Lead Loading
Lead Available
Lead Restricted
Lead Archived
Lead No Longer Accessible

Lead Profile Available
Lead Updated Elsewhere

Qualification Not Assessed
Qualification In Review
Qualification Available
Qualification Restricted
Qualification Service Unavailable

Owner Assigned
Owner Unassigned
Lead Reassigned

Provenance Available
Provenance Partial
Provenance Restricted
Provenance Unavailable
Provenance Integrity Issue

List Membership Available
No Static List Membership
Segment Context Available
Segment Context Stale
Segmentation Service Unavailable

Outreach Available
No Outreach History
Outreach Restricted
Outreach Service Unavailable

Conversations Available
No Authorized Conversations
Conversations Restricted
Messaging Service Unavailable

Meetings / FollowUps Available
No Current Interactions
Interactions Restricted
Interaction Service Unavailable

Tasks Available
No Current Tasks
Tasks Restricted
Task Service Unavailable

Deal Available
No Deal
Deal Restricted
Deal Service Unavailable

Conversion Not Started
Conversion In Progress
Conversion Completed
Conversion Failed
Conversion Outcome Unknown

Notes Available
No Notes
Notes Restricted
Notes Service Unavailable

Activity Available
No Authorized Activity
Activity Restricted
Activity Service Unavailable

Partial Lead 360 Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should make **Lead-owned Sales state primary**, while Contact/Company/source/outreach/work appear as related context.

Conceptually:

```text
Lead identity / status / qualification / owner
↓
Contact + Company context
↓
Source / provenance
↓
Sales engagement
   ├── Outreach
   ├── Conversations
   ├── Meetings
   ├── FollowUps
   └── Tasks
↓
Deal / conversion context
↓
Notes / Activity
```

Only frozen sections/actions should render.

---

## Lead identity must remain visually distinct

Do not make the header look like a Contact 360 simply because the Lead references a Contact.

The screen represents:

> Lead L-100

with Contact/Company context.

---

## Status, qualification and owner must not collapse into one badge

Example:

```text
Status: Active
Qualification: Qualified
Owner: Alice
```

are three dimensions.

---

## Source/provenance presentation

If frozen design shows source:

label it as origin/evidence.

Do not make Source look like current Company/Contact truth.

---

## Lists/segments should remain grouping context

A badge such as:

> Q4 Priority

must not visually look like Lead lifecycle/status.

---

## Outreach should retain its own state vocabulary

Examples:

* enrolled,
* paused,
* replied,

should remain Outreach semantics.

---

## Deal summary should remain clearly a related Deal

Do not display:

> Lead Stage: Proposal

when Proposal is actually the Deal's stage.

---

## Tablet

Following Design 152:

* Lead state remains near identity,
* Contact/Company context stacks compactly,
* interaction sections become cards/lists,
* provenance stays accessible without dominating,
* source-specific actions remain touch-safe.

---

## Mobile

Priority:

```text
Lead
↓
Lead status / qualification / owner
↓
Contact + Company
↓
Source / provenance
↓
Next interaction/work
↓
Outreach / Conversation
↓
Deal / conversion
↓
Notes / Activity
```

Exact ordering remains governed by the frozen responsive system.

---

## Mobile should not flatten all objects

Use explicit labels such as:

* Lead,
* Contact,
* Company,
* Deal,
* FollowUp.

Do not turn everything into generic feed cards.

---

## Partial failures remain local

If Deals fail:

the Lead/Contact/Company and remaining interaction context must still render.

---

## Accessibility

A Lead 360 could communicate:

> Lead for Sarah Patel at Globex. Lead status active. Qualification qualified. Assigned to Alice. Acquired from Executive Leadership Directory. One active outreach enrollment. Follow-up due tomorrow. No Deal created yet.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Lead 360 composition architecture

```text
Design 089
    ↓
Authenticated Workspace Context
    ↓
Lead360QueryService
    │
    ├── LeadProfileAdapter
    ├── QualificationAdapter
    ├── ContactAdapter
    ├── CompanyAdapter
    ├── ProvenanceAdapter
    ├── ListSegmentAdapter
    ├── OutreachAdapter
    ├── ConversationAdapter
    ├── MeetingFollowUpAdapter
    ├── TaskAdapter
    ├── DealConversionAdapter
    ├── NoteAdapter
    └── ActivityAdapter
    ↓
Lead360View
```

This is a read-composition layer.

---

## Query anchors on canonical Lead ID

Conceptually:

```text
getLead360(leadId, currentMembership)
```

First:

```text
authorize Lead
```

Then independently authorize each section.

---

## No giant `Lead360Record`

Avoid:

```text
Lead360Record {
  lead,
  contactJson,
  companyJson,
  provenanceJson,
  outreachJson,
  messagesJson,
  tasksJson,
  dealsJson,
  activityJson
}
```

as canonical storage.

A cached/materialized projection is acceptable only if:

* source-derived,
* rebuildable,
* revision-aware,
* permission-safe.

---

## Lead core must be independently loadable

Related service outage must not prevent retrieval of canonical Lead identity/state.

---

## Section result semantics

Use a concept such as:

```text
SectionResult<T>
├── availability
├── data
├── count/freshness semantics
└── authorization state
```

so `[]` never ambiguously means:

* empty,
* restricted,
* failed,
* not evaluated.

---

## Lead profile mutations use LeadService

Examples:

```text
assignLead()
changeLeadStatus()
updateLeadQualification()
archiveLead()
```

or equivalent targeted commands.

Avoid arbitrary generic database PATCH.

---

## Qualification service

Qualification should have explicit domain semantics.

If qualification is based on criteria:

preserve:

* assessment state,
* evaluated evidence,
* actor/system,
* evaluatedAt,
* policy/version,

where needed.

Do not infer qualification solely from segment membership or Deal creation.

---

## Owner reassignment

Use a narrow server command such as:

```text
reassignLead(leadId, assigneeId)
```

with:

* actor permission,
* target membership validation,
* tenant validation,
* Audit/activity event.

---

## Contact adapter

Fetch canonical Contact summary by `contactId`.

Do not copy or re-normalize person identity inside Lead domain.

---

## Company adapter

Same for Company.

---

## Contact/Company relinking

If Lead references the wrong Contact/Company and correction is required:

use explicit governed relinking commands preserving old evidence/history.

Do not silently rewrite acquisition provenance.

---

## Provenance adapter

Use canonical lineage from Designs 081–083.

It should distinguish:

### Current CRM

Current Contact/Company/Lead fields.

### Acquisition evidence

What was originally observed and admitted.

---

## Field provenance

Where frozen detail exposes origin, preserve field-level lineage rather than one generic source label.

---

## List/segment adapter

Static list membership can be queried directly.

Dynamic Segment membership should use current/latest valid evaluation or resolver with freshness.

Do not store `segmentIds` on Lead as canonical dynamic truth.

---

## Outreach adapter

Query canonical:

* Campaign enrollment,
* SequenceVersion,
* communication state.

Do not infer Outreach state from Lead Activity.

---

## Outreach eligibility ≠ Lead status

Keep evaluation inside Outreach service.

---

## Conversation adapter

Use canonical Conversation/Message relationships.

Do not fetch by current Contact email alone because historical address changes can break or misattribute messages.

---

## Meeting/FollowUp adapter

Use explicit Lead/Contact context relationships.

Do not infer every Contact Meeting automatically belongs to this Lead if the Contact has multiple commercial contexts.

This is important.

---

## Task adapter

Same principle.

A Task referencing the Contact or Company does not automatically become a Lead Task.

Use typed Lead context/relationship where required.

---

## Deal conversion service

Lead-to-Deal conversion should be a canonical idempotent operation.

Conceptually:

```text
convertLeadToDeal(
    leadId,
    expectedLeadRevision,
    conversionInput
)
```

should:

1. authorize conversion;
2. reload current Lead;
3. validate conversion eligibility;
4. validate Contact/Company references;
5. check existing conversion/Deal lineage;
6. create or reconcile canonical Deal;
7. create immutable conversion linkage;
8. transition Lead lifecycle if policy requires;
9. emit events/Audit;
10. return canonical Deal ID.

---

## Conversion idempotency

Double-click/retry must not create multiple Deals.

Use a stable conversion identity/idempotency constraint.

---

## Conversion outcome unknown

If the transaction/provider boundary is uncertain:

reconcile existing Deal/conversion before retry.

---

## Lead remains after conversion

Do not delete or replace Lead.

---

## Conversion snapshot

Preserve enough context to explain:

* Lead revision,
* qualification/status,
* owner,
* Contact/Company identity,

at conversion time.

This does not require copying entire mutable entities.

---

## Deal changes after conversion

Current Lead 360 may show current Deal state.

Historical conversion evidence remains pinned to conversion-time context where required.

---

## Client handoff

Later Design 106 should consume:

```text
Lead → Deal → ClientConversion/Handoff
```

without rewriting Lead or Deal identities.

---

## Notes adapter

Notes use typed Lead context and visibility policy.

---

## Activity adapter

Aggregate only meaningful authorized source events.

Every Activity row keeps:

```text
sourceType
sourceId
sourceEventId
occurredAt
safe actor
safe summary
```

---

## Activity deduplication

Same canonical event should not appear multiple times simply because it relates to:

* Lead,
* Contact,
* Company.

Use event identity/context policy.

---

## “Last contacted” resolver

Centralize eligible interaction types.

Possible sources depend on product policy:

* Message sent,
* reply received,
* Meeting completed.

Do not count internal note edits unless explicitly intended.

---

## “Next action” resolver

Reuse canonical Task/FollowUp/Meeting policy.

Avoid duplicated mutable `lead.nextAction`.

---

## Event-driven invalidation

Useful events include:

```text
LeadUpdated
LeadAssigned
LeadStatusChanged
LeadQualificationChanged

ContactUpdated
CompanyUpdated

LeadAddedToList
LeadRemovedFromList
SegmentEvaluationChanged

OutreachEnrollmentChanged
MessageCreated
FollowUpUpdated
MeetingUpdated
TaskUpdated

LeadConvertedToDeal
DealUpdated

NoteCreated
```

---

## Permission-safe caching

Cache must vary by:

```text
organizationMembershipId
leadId
authorizationRevision
leadRevision
related-domain revisions
```

Never simply `leadId`.

---

## Section-level caching

Useful because:

* Lead profile changes moderately,
* Activity/messages change frequently,
* provenance changes rarely,
* Deal state changes independently.

---

## N+1 prevention

Use batched/source-specific summary queries.

Do not load:

* every Message,
* every Activity record,
* every list membership detail

individually in initial request.

---

## Section pagination

High-activity Leads can accumulate:

* messages,
* meetings,
* tasks,
* activity.

Use paginated/lazy section retrieval.

---

## Historical evidence vs current profile

The composition service should consciously expose:

```text
currentContactSummary
currentCompanySummary
```

separately from:

```text
originalAcquisitionEvidence
```

This prevents accidental historical rewrite.

---

## Merge handling

If Contact or Company has been merged:

Lead references should resolve to current canonical identity while preserving historical acquisition/source lineage.

---

## Lead archive behavior

Archived Lead can remain historically viewable where permissions allow.

Current outreach/conversion actions may be restricted.

---

## Partial failure contract

Example:

```text
Lead core       ✓
Contact         ✓
Company         ✓
Provenance      ✓
Lists           ✓
Segments        ✕
Outreach        ✓
Messages        ✕
Meetings        ✓
Tasks           ✓
Deal            ✓
Activity        ✓
```

Return:

```text
Lead360View
+
segments = unavailable
messages = unavailable
```

not global failure.

---

## Universal Search

Design 079 should index safe canonical Lead metadata.

Do not index the entire Lead360 composite containing:

* Messages,
* private Notes,
* sensitive Deal values,
* raw acquisition evidence.

---

## Audit

Material Lead mutations should be audited:

* assignment,
* status change,
* qualification,
* conversion,
* archive.

Source-domain actions remain audited in their own domain.

Do not duplicate every Meeting/Message/Task event as a Lead mutation AuditEvent.

---

## Backend Requirement Matrix

| Requirement                                     | Status                |
| ----------------------------------------------- | --------------------- |
| Authenticated Team Workspace                    | **Critical**          |
| Canonical Lead ID from 011                      | **Critical**          |
| Lead360View as read projection                  | **Critical**          |
| No second Lead entity                           | **Critical**          |
| Lead/Contact separation                         | **Critical**          |
| Lead/Company separation                         | **Critical**          |
| Current Contact/acquisition evidence separation | **Critical**          |
| Current Company/acquisition evidence separation | **Critical**          |
| Lead/provenance separation                      | **Critical**          |
| End-to-end acquisition lineage reuse            | **Critical**          |
| LeadStatus/Qualification separation             | **Critical**          |
| Qualification/Deal stage separation             | **Critical**          |
| Owner/status separation                         | **Critical**          |
| Owner/authorization separation                  | **Critical**          |
| List membership/Lead lifecycle separation       | **Critical**          |
| Segment match/qualification separation          | **Critical**          |
| Dynamic segment freshness awareness             | **Critical**          |
| OutreachEnrollment/Lead state separation        | **Critical**          |
| Conversation/Lead separation                    | **Critical**          |
| Meeting/FollowUp/Lead separation                | **Critical**          |
| Task/Lead separation                            | **Critical**          |
| Note/Lead profile separation                    | **Critical**          |
| Activity/Lead state separation                  | **Critical**          |
| Activity/Audit separation                       | **Critical**          |
| Lead/Deal separation                            | **Critical**          |
| Explicit Lead→Deal conversion lineage           | **Critical**          |
| Conversion idempotency                          | **Critical**          |
| Conversion concurrency safety                   | **Critical**          |
| Conversion preserves Lead                       | **Critical**          |
| Deal win/Lead conversion separation             | **Critical**          |
| Client handoff/Lead conversion separation       | **Critical**          |
| Historical conversion context                   | **Critical**          |
| Section-level source authorization              | **Critical**          |
| Field-safe Contact/Company projections          | **Critical**          |
| Provenance/raw-evidence permission separation   | **Critical**          |
| Restricted/empty/unavailable distinction        | **Critical**          |
| Lead core independent of section failure        | **Critical**          |
| Partial Lead360 composition                     | **Critical**          |
| Source-specific mutation services               | **Critical**          |
| No generic Lead360 mega-PATCH                   | **Critical**          |
| Optimistic concurrency                          | **Critical**          |
| Event-driven invalidation                       | **Required**          |
| Permission-safe caching                         | **Critical**          |
| Section-level caching                           | **Required at scale** |
| N+1 prevention                                  | **Critical**          |
| Section pagination/lazy loading                 | **Required at scale** |
| Design 079 safe search reuse                    | **Critical**          |
| Design 088 list/segment reuse                   | **Critical**          |
| Future Design 106 lineage reuse                 | **Critical**          |
| Audit integration                               | **Required**          |

---

# 8. Consolidation

Design 089 exposes substantial risk of turning Lead 360 into a monolithic Sales backend.

**Lead / Lead360View conflation**
Composite read model becomes canonical Lead truth.

**Lead / Contact conflation**
Person profile becomes Lead identity.

**Current Contact / historical acquisition evidence conflation**
Email/job changes rewrite how Lead was originally found.

**Lead / Company conflation**
Business account becomes Lead identity.

**Current Company / source Company evidence conflation**
Company rename rewrites acquisition history.

**LeadSource string / full provenance conflation**
Source lineage collapses into one label.

**Provenance / current CRM value conflation**
Manual edits are falsely attributed to Source.

**Provenance / qualification conflation**
“Good source” becomes “qualified Lead.”

**LeadStatus / Qualification conflation**
One enum mixes lifecycle and commercial fit.

**Qualification / Deal stage conflation**
Qualified becomes proposal/negotiation stage.

**Qualified / converted conflation**
Qualification automatically creates Deal.

**Lead owner / Lead status conflation**
Reassignment changes lifecycle.

**Lead owner / authorization conflation**
Assignee receives unrestricted CRM access.

**List membership / Lead status conflation**
Adding to “Priority” changes Lead lifecycle.

**Segment membership / qualification conflation**
Matching “CEOs” automatically qualifies Lead.

**Dynamic Segment membership / Lead field conflation**
Evaluation result becomes persistent Lead metadata.

**Lead / OutreachEnrollment conflation**
Campaign state becomes Lead state.

**Enrollment paused / Lead inactive conflation**
Outreach operation alters CRM lifecycle.

**Message reply / Lead status conflation**
Reply automatically changes Lead without governed policy.

**Message bounce / Lead deletion conflation**
Communication failure destroys CRM history.

**Conversation / Lead field conflation**
Messages are embedded into mutable Lead JSON.

**Current email / Conversation lookup conflation**
Historical replies disappear after Contact email changes.

**Meeting / Lead state conflation**
Scheduled Meeting means qualified Lead automatically.

**Meeting completed / FollowUp completed conflation**
Next action disappears incorrectly.

**FollowUp / Lead status conflation**
Finishing one FollowUp closes Lead.

**Task / Lead status conflation**
Internal work completion mutates CRM lifecycle.

**Task context / Contact context conflation**
Every Contact task is treated as Lead task.

**Note / Lead profile conflation**
Internal commentary becomes Lead business field.

**Note / provenance conflation**
Sales opinion becomes source evidence.

**Note / qualification conflation**
Free text becomes formal qualification decision.

**Lead / Deal conflation**
Conversion destructively transforms Lead into Deal.

**Lead deletion on conversion**
Acquisition/sales lineage disappears.

**Converted / Deal won conflation**
New opportunity is treated as closed-won.

**Deal stage / Lead stage conflation**
Proposal/Negotiation leaks into Lead lifecycle.

**Deal amount / Lead value conflation**
Opportunity amount becomes Lead identity metric.

**Deal changes / historical conversion rewrite conflation**
Current Deal state changes original conversion evidence.

**Lead conversion / Client conversion conflation**
Deal and Client handoff collapse into one mutation.

**Lead converted / Contact converted conflation**
Person identity inherits Lead state.

**Lead disqualified / Contact deletion conflation**
Known person disappears.

**Lead archived / Company archived conflation**
CRM business identity is lost.

**Activity / Lead state conflation**
Timeline entries become mutable Lead fields.

**Activity / Audit conflation**
Compliance evidence leaks into operational feed.

**Last contacted / any activity conflation**
Internal edit appears as sales interaction.

**Next action / Lead field conflation**
Task/FollowUp truth duplicated.

**Lead access / Contact PII access conflation**
Sales user sees all personal Contact data.

**Lead access / Deal value access conflation**
Commercially sensitive Deal data leaks.

**Lead page permission / Conversation permission conflation**
Private communication becomes visible.

**Lead page permission / provenance permission conflation**
Raw extraction data leaks.

**Lead edit / Contact edit conflation**
Sales workflow mutates person identity.

**Lead edit / Company edit conflation**
Lead user changes Company profile.

**Lead edit / Deal edit conflation**
Lead role advances pipeline.

**Lead edit / Outreach edit conflation**
CRM permission changes Campaign execution.

**Empty Deal section / Deal service failure conflation**
User sees “No Deal” during outage.

**No Messages / Messaging outage conflation**
Interaction history appears empty.

**No provenance / provenance restricted conflation**
User assumes source lineage was lost.

**Segment service unavailable / no segments conflation**
Grouping context is misstated.

**One related-domain failure / Lead missing conflation**
Outreach outage hides Lead.

**Lead360 giant JSON snapshot**
Contact/Company/Deal/Message state becomes stale duplicated truth.

**Generic Lead360 PATCH**
One endpoint bypasses domain-specific authorization.

**Distributed mega-transaction**
Simple Lead status update tries to synchronize Outreach/Deal/Contact systems.

**Cache keyed only by Lead**
Manager's sensitive Lead 360 leaks to restricted employee.

**Full Lead360 indexed in Universal Search**
Notes/messages/raw source data become searchable.

**Conversion retry / duplicate Deal creation**
Double action creates multiple Opportunities.

**Conversion outcome unknown / no Deal assumption**
Retry duplicates an already-created Deal.

**089/011 duplicate Lead backend**
Lead CRM list and Lead 360 diverge.

**089/084–087 duplicate Contact/Company profile data**
Lead owns stale CRM copies.

**089/088 duplicate segmentation state**
Lead page manually owns lists/segments.

**089/012–014 duplicate Outreach state**
Lead page invents campaign/message lifecycle.

**089/015 duplicate Meeting/FollowUp state**
Lead-specific interaction backend diverges.

**089/016–017 duplicate Deal backend**
Conversion creates embedded opportunity state.

**089/034 duplicate Task backend**
Lead “actions” become second task system.

No additional screen is required.

These are **Lead identity, source lineage, qualification/lifecycle separation, cross-domain composition, outreach/work boundaries, conversion lineage, permission isolation, and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL LEAD 360, SALES COMPOSITION & CONVERSION-LINEAGE ANCHOR**

**Domain directive:**
**Lead ≠ LeadProfileProjection ≠ Contact ≠ Company ≠ LeadSource/Provenance ≠ Qualification ≠ LeadStatus ≠ Deal ≠ ActivityEvent ≠ Note ≠ Task ≠ FollowUp ≠ Meeting ≠ OutreachEnrollment/Conversation.**

**Identity directive:**
Design 011 remains the sole canonical Lead identity. Design 089 composes around that Lead ID and never creates a separate Lead360/LeadProfile business record.

**Projection directive:**
`Lead360View` is a permission-safe, rebuildable composition of canonical source domains. Materialization/caching is allowed only as derived state.

**Contact directive:**
Contact remains its own canonical person identity. Lead 360 consumes current Contact context while historical source/acquisition values remain preserved separately.

**Company directive:**
Company remains its own canonical business identity. Company rename/domain changes update current context without rewriting the Lead's acquisition evidence.

**Provenance directive:**
Lead origin remains reconstructable through **Source → Run → RawObservation → NormalizedRecord → ProspectCandidate → CRM Admission → Lead**. One mutable `source` string must never replace this lineage.

**Historical-evidence directive:**
current Contact, Company, email, title, qualification, owner and Lead status changes never rewrite original acquisition evidence or historical issued/interaction records.

**Status directive:**
LeadStatus remains a Lead lifecycle dimension and must remain separate from Qualification, owner, Outreach enrollment, list membership, Deal stage and Client lifecycle.

**Qualification directive:**
qualification is a governed Lead-domain assessment with its own evidence/policy semantics. Segment membership, source quality, Meeting completion or Deal creation cannot silently substitute for qualification.

**Ownership directive:**
Lead ownership/assignment is operational responsibility, not lifecycle and not security authority. Reassignment never implicitly changes role/permissions.

**List/segment directive:**
Design 088 static list and dynamic segment relationships remain grouping/evaluation context. They never become Lead lifecycle, qualification or access-control state.

**Outreach directive:**
Designs 012–014 remain authoritative for Campaign, SequenceVersion, Enrollment, Conversation and Message state. Lead 360 only composes their authorized current/historical summaries.

**Communication directive:**
Messages/replies remain canonical communication evidence and do not automatically change Lead lifecycle unless an explicit Lead-domain workflow command/policy performs that transition.

**Meeting directive:**
Meeting remains a scheduled interaction entity. Meeting state never directly substitutes for Lead qualification/status.

**Follow-up directive:**
FollowUps remain canonical action records; completion or overdue state does not automatically close/convert the Lead.

**Task directive:**
Tasks remain Design 034 entities with typed Lead context. Internal work lifecycle never becomes Lead lifecycle.

**Note directive:**
Lead Notes remain authored contextual records with their own visibility. Notes are neither provenance nor formal qualification decisions unless a distinct governed action records that decision.

**Deal directive:**
Deal remains a separate canonical opportunity. Lead conversion creates an explicit immutable/reconstructable Lead→Deal lineage instead of destructively transforming the Lead.

**Conversion directive:**
conversion is idempotent, transactionally safe and revision-aware. Retried/double-clicked conversion must reconcile existing Deal lineage rather than create duplicates.

**Outcome-unknown directive:**
when conversion outcome is uncertain, the backend must reconcile Deal/conversion state before retrying. `Unknown` must never be treated as `No Deal`.

**Retention directive:**
converted/disqualified/archived Leads remain historical CRM identities preserving acquisition, interaction, qualification and conversion lineage.

**Client-handoff directive:**
later Design 106 must consume the existing Lead→Deal lineage and establish Client handoff/relationship without deleting or rewriting the Lead.

**Authorization directive:**
Lead page access never grants automatic access to full Contact/Company profiles, provenance/raw evidence, Outreach, Conversations, Deals, Notes, Tasks or Activity. Every section is independently server-authorized.

**Aggregate directive:**
last-contacted, next-action, list/segment context and interaction counts are derived from governed source semantics. `0`, `restricted`, `stale`, `unknown`, and `unavailable` remain distinct.

**Partial-failure directive:**
failure of Contact, Company, provenance, segmentation, Outreach, Messaging, Meetings, Tasks, Deals or Activity never makes the canonical Lead appear missing. Lead core and healthy sections remain available.

**Mutation directive:**
every action launched from Lead 360 goes through the canonical source service. A generic `PATCH Lead360` capable of mutating Lead, Contact, Deal, Campaign, Message, Task and Client state is prohibited.

**Transaction directive:**
Lead 360 is not a distributed mega-transaction boundary. Source domains commit independently and update the composed read model through events/invalidation.

**Concurrency directive:**
Lead status/qualification/assignment updates use optimistic revision protection, while conversion uses strong idempotency and transactional linkage to prevent duplicate downstream Deals.

**Caching directive:**
Lead 360 caching varies by OrganizationMembership, authorization revision, Lead revision and related-source revisions. Caching only by Lead ID is prohibited.

**Performance directive:**
use summary adapters, section-level caching, batched queries and lazy/paginated interaction history rather than loading every Message, Activity event, Meeting, Task and source record in the initial composition.

**Search directive:**
Design 079 may index safe canonical Lead metadata only. Full Lead360 contents—especially private Notes, Messages, raw acquisition evidence and confidential Deal values—must not become general search documents.

**Audit directive:**
Lead assignment, status, qualification, conversion and archive mutations generate appropriate Audit evidence. Outreach, Message, Meeting, Task and Deal actions remain audited by their own canonical domains.

**Future-detail directive:**
later CRM/Deal qualification, meeting/follow-up and won-deal handoff designs must consume the same Lead ID, Contact ID, Company ID and conversion lineage rather than creating feature-specific Lead copies.

**Overlap directive:**
Designs **008–017, 034, 079, 081–089 and later 090–096/106** must share one Lead identity and continuous Source→CRM→Outreach→Deal lineage while keeping Contact, Company, Campaign, Conversation, Meeting, FollowUp, Task and Deal canonical and separate.

**Consolidation directive:**
**STANDARDIZE ONE LEAD 360 COMPOSITION FOUNDATION — CANONICAL LEAD IDENTITY + DISTINCT LEADSTATUS/QUALIFICATION/OWNER STATE + CURRENT CONTACT/COMPANY REFERENCES + IMMUTABLE ACQUISITION PROVENANCE + STATIC/DYNAMIC GROUPING CONTEXT + SOURCE-OWNED OUTREACH/CONVERSATION/MEETING/FOLLOWUP/TASK RECORDS + EXPLICIT IDEMPOTENT LEAD→DEAL CONVERSION LINEAGE + SOURCE-REFERENCED ACTIVITY + SECTION-LEVEL AUTHORIZATION + PARTIAL-FAILURE-AWARE COMPOSITION — AND NEVER ALLOW THE 360 VIEW, CURRENT CRM PROFILE, LIST/SEGMENT MEMBERSHIP, OUTREACH STATE, NOTES, TASKS, MEETINGS OR DOWNSTREAM DEAL STATE TO BECOME A SECOND MUTABLE LEAD BACKEND OR ERASE THE LEAD'S HISTORICAL ORIGIN.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **89 / 153** |
| **PASS**                                   |                         **89** |
| **STANDARDIZE decisions**                  |                         **87** |
| **Potential implementation-overlap flags** |                         **80** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**89 / 153 = 58.2% audited.**

### Canonical Lead 360 architecture after Design 089

```text
                          LEAD
                  canonical CRM identity
                           │
        ┌──────────────────┼───────────────────┐
        ↓                  ↓                   ↓
 Lead status /       Qualification          Owner
 lifecycle
                           │
       ┌───────────────────┼────────────────────┐
       ↓                   ↓                    ↓
    Contact             Company            Provenance
       │                   │                    │
       └───────────────────┼────────────────────┘
                           ↓
                      LEAD 360
                   read composition
                           │
       ┌──────────┬────────┼────────┬──────────┐
       ↓          ↓        ↓        ↓          ↓
 Lists/Segments Outreach Messages Meetings   Tasks
                                       │
                                   FollowUps
                           │
                           ↓
                    Conversion lineage
                           │
                           ↓
                          Deal
                           │
                           ↓
                   later Client Handoff
```

The historical identity boundary remains:

```text
ACQUISITION TIME

Sarah Patel
VP Marketing
Acme Technologies
old@acme.com
Source A

        ↓ admitted

Lead L-100
```

Later:

```text
CURRENT CRM

Sarah Patel
CMO
Globex
new@globex.com
```

Lead L-100 can use the new current Contact/Company context.

But its original acquisition evidence remains exactly historical.

And conversion remains non-destructive:

```text
Lead L-100
    ↓
LeadConversion
    ↓
Deal D-200

Lead L-100 remains preserved.

Deal D-200 is a new canonical entity.

Deal D-200 later becoming Won/Lost
does not rewrite historical Lead identity or provenance.
```

# Next Sequential Audit Target

## **Design 090 — Outreach Campaign Detail / Campaign 360**

The next audit should preserve the campaign-detail boundary:

> **OutreachCampaign ≠ CampaignVersion/Configuration ≠ SequenceVersion ≠ AudienceSnapshot ≠ Enrollment ≠ Lead ≠ Message ≠ Conversation/Reply ≠ SendingAccount ≠ DeliveryAttempt/Event ≠ CampaignMetric/Aggregate.**

It should reconcile Designs **012–014 and 088–089** while preserving:

* Campaign 360 is a composition surface, not a second Campaign entity,
* Campaign configuration/version ≠ SequenceVersion,
* frozen audience snapshot ≠ live Segment/List membership,
* one Campaign can have many Lead Enrollments,
* Enrollment lifecycle ≠ Lead lifecycle,
* one Enrollment can produce many Messages/Delivery attempts,
* Campaign status ≠ Message delivery state,
* reply/conversation state remains canonical in Inbox/Messaging,
* SendingAccount/provider state remains separate,
* campaign metrics are derived aggregates and not operational source truth,
* retries/provider callbacks must remain idempotent,
* partial failure in Messages, provider delivery, metrics or audience services must not make the canonical Campaign appear missing.

The sequence continues strictly with **Design 090 only next**, under the unchanged audit contract.
