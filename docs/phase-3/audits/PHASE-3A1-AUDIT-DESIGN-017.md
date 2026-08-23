Correct. I retrieved the exact frozen identity and neighboring sequence before continuing:

**Design 016 — Deals Pipeline → Design 017 — Deal Detail / Opportunity Workspace → Design 018 — Proposal Builder / Proposal Detail.**

So we continue strictly with:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 017 — Deal Detail / Opportunity Workspace

| Audit field                 | Classification                                                                                                                                                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**               | **017**                                                                                                                                                                                                                  |
| **Canonical name**          | **Deal Detail / Opportunity Workspace**                                                                                                                                                                                  |
| **Product area**            | Sales / Deals / Commercial Opportunity                                                                                                                                                                                   |
| **User surface**            | Team Workspace                                                                                                                                                                                                           |
| **Screen class**            | Record Detail / Opportunity 360 Workspace                                                                                                                                                                                |
| **Classification**          | **Unique Anchor — Entity Detail Workspace Family**                                                                                                                                                                       |
| **Primary purpose**         | Provide the complete operational record for one Deal: commercial context, stage, value, contacts, company, activity, meetings, follow-ups, proposals, files, notes, next actions and downstream commercial relationships |
| **Primary entity**          | **Deal**                                                                                                                                                                                                                 |
| **Supporting entities**     | Company, Contact, Lead, User/Owner, Meeting, FollowUp, Conversation, Campaign, Proposal, Contract, Invoice, Product/Package, Activity, File                                                                              |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                                                                          |
| **Template family**         | `EntityDetailWorkspaceTemplate` / `OpportunityDetailComposition`                                                                                                                                                         |
| **Auth**                    | Required                                                                                                                                                                                                                 |
| **Permissions**             | Deal read/edit/stage/action + related-record scopes                                                                                                                                                                      |
| **Implementation priority** | **Core / Critical**                                                                                                                                                                                                      |
| **Reuse level**             | **Extremely High**                                                                                                                                                                                                       |

---

# 1. Functional responsibility

Design 017 answers:

> **“For this specific commercial opportunity, what do we know, what has happened, what is happening now, what commercial artifacts exist, and what must happen next?”**

The relationship with Design 016 is:

```text
Design 016 — Deals Pipeline
          ↓
Select Deal
          ↓
Design 017 — Deal Detail / Opportunity Workspace
```

Design 016 handles **cross-deal pipeline management**.

Design 017 handles **one opportunity deeply**.

This separation should remain permanent.

---

# 2. This establishes the Entity Detail Workspace family

Design 017 introduces one of the most reusable architectures in the whole product.

Conceptually:

```text
InternalAppShell
      ↓
EntityDetailWorkspaceTemplate
      ↓
Deal Detail Composition
```

Later detailed records should reuse major portions of this architecture, including:

**Company 360**
**Contact 360**
**Lead 360**
**Client Detail**
**Project Detail**
**Contract Detail**
**Invoice Detail**
**Publication Detail**
**Integration Detail**

They remain different domain screens, but should not reinvent the page shell, tabs, contextual header, side summary, timeline or related-record patterns.

---

# 3. Canonical Deal Detail responsibilities

Without redesigning the approved UI, implementation should normalize around:

**Deal Header / Commercial Summary**

* deal name
* company/contact
* owner
* stage
* amount
* probability
* expected close
* health
* source
* product/package

**Primary actions**

* move stage
* schedule meeting
* create follow-up
* create proposal
* add note
* edit opportunity
* close won/lost where authorized

**Core detail areas**

* Overview
* Activity
* Contacts
* Meetings / Follow-ups
* Proposals
* Commercial information
* Files / Notes
* Related records

The exact tab labels remain aligned with the approved design.

---

# 4. Deal Header should use reusable Record Header infrastructure

We should extract a canonical:

```text
RecordHeader
├── Entity identity
├── Status/stage
├── Primary metadata
├── Owner
├── Key metrics
├── Primary CTA
├── Secondary actions
└── Breadcrumb/context
```

Design 017 configures that component for Deal-specific data.

Later Company, Contact, Lead, Contract, Invoice and Project detail pages can reuse the same infrastructure.

---

# 5. Deal ≠ Deal snapshot

The Deal record remains authoritative.

The detail page should not maintain separate copies of:

**value**
**stage**
**owner**
**probability**
**expected close**

inside different tabs or widgets.

All widgets consume the same canonical Deal state.

---

# 6. Deal stage transition

Design 017 must use the **same canonical transition service established by Design 016**.

Therefore:

```text
Design 016 drag action
        ↓
DealTransitionService

Design 017 Move Stage action
        ↓
same DealTransitionService
```

There must not be:

```text
pipeline transition logic
```

and separately:

```text
detail-page transition logic
```

with different rules.

---

# 7. Deal lifecycle, stage, health and probability remain separate

Example:

```text
Lifecycle: OPEN
Stage: NEGOTIATION
Health: AT_RISK
Probability: 70%
```

These are different dimensions.

Design 017 should display them coherently but never collapse them into one `status`.

---

# 8. Deal commercial amount

Canonical fields conceptually include:

```text
amount
currency
```

Potential supporting fields may later include:

```text
expectedValue
discount
commercial terms
```

where genuinely supported.

All monetary values need currency-safe handling as established in Design 007.

---

# 9. Product / Package context

A Deal may reference:

```text
Product / Package
```

but the opportunity may require a commercial snapshot.

Conceptually:

```text
Deal
├── packageId
├── packageVersion / snapshot
├── commercial amount
└── negotiated terms
```

Why?

Because modifying the master Package later must not retroactively change a historical Deal.

---

# 10. Company relationship

Every Deal should link to the canonical Company where available.

```text
Deal
   ↓
Company
```

The Detail workspace can display company context such as:

**name**
**industry**
**website/domain**
**relationship state**

but Company-owned information remains authoritative in the Company record.

---

# 11. Contact relationships

One Deal can involve multiple Contacts.

Conceptually:

```text
Deal
├── Primary Contact
├── Decision Maker
├── Influencer
└── Other Contact
```

Role labels should be represented as Deal–Contact relationship metadata rather than duplicated Contact records.

---

# 12. Primary Contact ≠ only Contact

A simplistic model:

```text
deal.contactId
```

may be insufficient.

We should support the architectural possibility of:

```text
DealContact
├── dealId
├── contactId
├── role
├── isPrimary
└── metadata
```

Exact schema belongs to Phase 3D.

Design 017 establishes the need for multi-contact commercial context.

---

# 13. Lead provenance

If a Deal originated from a Lead:

```text
Lead
 ↓
Deal
```

the relationship remains visible.

Design 017 should allow users to trace:

> **Where did this opportunity come from?**

including:

**lead**
**source**
**campaign**
**meeting / conversation**

where lineage exists.

---

# 14. Deal source attribution

The Deal may expose a simplified source label.

But deeper provenance should support:

```text
original lead source
campaign
conversation/reply
meeting
manual creation
```

This enables later attribution reporting without reconstructing everything from timeline text.

---

# 15. Meetings tab/section

Meeting records shown inside Deal Detail must be canonical `Meeting` entities from Design 015.

Correct:

```text
Deal
 ↓
related Meetings query
```

Not:

```text
DealMeetingNote[]
```

as a second independent meeting model.

---

# 16. Follow-ups / Next Action

Likewise, Design 017 consumes canonical Follow-ups.

The Deal's **Next Action** should come from the Next Action Resolver established during Design 015:

```text
Deal
 ↓
open Meetings / FollowUps / actionable records
 ↓
NextActionResolver
 ↓
Next Action summary
```

This prevents conflicting next-action values across Designs 004, 016 and 017.

---

# 17. Activity timeline

Design 017 is an ideal place for the canonical `ActivityTimeline` component.

Potential events:

**Deal created**
**Owner assigned**
**Stage changed**
**Meeting scheduled**
**Reply received**
**Proposal created**
**Proposal sent**
**Value changed**
**Close date changed**
**Marked won/lost**

The timeline is a human-readable composition.

The underlying domain records remain authoritative.

---

# 18. Activity ≠ audit

Maintain the distinction:

### Activity timeline

Business-friendly narrative.

### Audit log

Security/compliance-oriented record with stronger metadata.

A Deal stage change can produce both.

Design 017 primarily consumes Activity.

Design 138 handles deeper audit operations.

---

# 19. Notes architecture

Deal notes should be canonical collaboration records.

Conceptually:

```text
Note
├── author
├── body
├── createdAt
├── editedAt
├── visibility
└── related Deal
```

Notes must not be stored by rewriting a giant `deal.notes` string.

---

# 20. Internal visibility

Deal notes and commercial strategy are internal by default.

They should **never automatically become visible to Client Portal users**.

This boundary is particularly important once a Deal becomes a Client/Project.

---

# 21. Proposal relationship

Design 018 follows directly after this screen.

Correct hierarchy:

```text
Deal Detail
Design 017
      ↓
Create / Open Proposal
      ↓
Proposal Builder / Detail
Design 018
```

A Deal may have:

```text
0..N Proposal records
```

depending on final business requirements.

Deal Detail should summarize them, not embed an entirely separate proposal editor.

---

# 22. Proposal versioning

A Proposal itself may later contain versions/revisions.

Therefore:

```text
Deal
 ↓
Proposal
 ↓
ProposalVersion(s)
```

is cleaner than mutating one large proposal record repeatedly.

The exact version model is audited in Design 018.

Design 017 only needs stable references.

---

# 23. Contract relationship

When a Proposal progresses toward agreement:

```text
Deal
 ↓
Proposal
 ↓
Contract
```

Design 017 can display contract status once one exists.

But Contract lifecycle remains canonical in its own domain.

Do not use Deal stage as a substitute for Contract status.

---

# 24. Invoice relationship

Similarly:

```text
Deal
 ↓
Contract / Client commercial context
 ↓
Invoice
```

Deal Detail may show financial summaries where authorized.

But it should not independently mutate Invoice/payment state.

Finance permissions remain separate.

---

# 25. Commercial boundary

Sales users may be allowed to see:

**deal value**
**proposal amount**
**contract state**
**invoice payment status**

without necessarily seeing:

**processor transaction details**
**organization-wide finance analytics**
**refund controls**

Design 017 should support permission-sensitive related financial data.

---

# 26. Quick actions

Useful Deal Detail actions can include:

**Move Stage**
**Create Proposal**
**Schedule Meeting**
**Create Follow-up**
**Add Note**
**Edit Deal**
**Mark Won**
**Mark Lost**

Each action invokes canonical services.

None should implement isolated page-specific business logic.

---

# 27. Close Won must remain a controlled domain command

From both Design 016 and 017:

```text
Mark Won
   ↓
DealCommandService
   ↓
validation
   ↓
permission
   ↓
canonical transition
   ↓
conversion/handoff event
```

The Detail page should not directly create:

**Client**
**Project**
**Contract**
**Invoice**

inside arbitrary frontend callbacks.

---

# 28. Closed Won handoff

Later Design 106 explicitly covers:

**Client Conversion / Won Deal Handoff**.

Therefore the correct architecture is:

```text
Deal WON
   ↓
Handoff workflow
Design 106 / canonical service
   ↓
Client onboarding / Project creation
```

Design 017 may expose the resulting handoff status but should not duplicate that workflow.

---

# 29. Closed Lost behavior

The Deal remains inspectable after loss.

Design 017 should preserve:

**loss reason**
**loss date**
**loss actor**
**commercial history**
**activity**

rather than hide/delete the opportunity.

---

# 30. Reopen behavior

If Deal reopening is permitted, it must be a domain command with preserved closure history.

Example:

```text
Deal LOST
 ↓
Reopen
 ↓
OPEN
```

Activity should show both events.

---

# 31. Expected Close history

Expected close date often changes.

These changes matter for:

**forecast accuracy**
**sales-cycle analysis**
**deal health**

Important changes should therefore be captured in activity history rather than only storing the final date.

---

# 32. Deal health detail

Design 017 can explain *why* a Deal is At Risk.

Instead of only:

> At Risk

the underlying system should support derived signals such as:

**no activity in 12 days**
**expected close approaching**
**proposal not viewed**
**no next action**

where those metrics are supported.

The canonical Deal Health service remains authoritative.

---

# 33. Stalled opportunity detail

Likewise, a stalled Deal should surface actionable context.

Conceptually:

```text
Deal Health = STALLED
Reasons:
- 16 days in stage
- no meaningful activity
- no next action scheduled
```

The Detail workspace provides explanation; it does not compute the rules separately.

---

# 34. Record detail tabs as reusable infrastructure

Design 017 should formalize:

```text
RecordTabs
```

with:

* route/state synchronization,
* permission-aware visibility,
* lazy data loading,
* responsive behavior.

Later detail workspaces should reuse this rather than implementing custom tab systems repeatedly.

---

# 35. Lazy loading

A Deal Detail page should not need to load every proposal, meeting, file, activity and invoice before the header can render.

A stronger architecture:

```text
Deal core record
      ↓
render shell/header
      ↓
tab/section queries load as needed
```

This improves performance and failure isolation.

---

# 36. Partial failure

For example:

```text
Deal Core        ✓
Meetings         ✓
Activity         ✓
Proposals        ✕
Finance Summary  ✓
```

The page should remain usable.

Only the affected Proposal section should show an error/retry state where technically possible.

This directly reuses Design 150.

---

# 37. Entity Detail Workspace component mapping

Design 017 should extract highly reusable components:

`RecordHeader`
`RecordStatusBlock`
`RecordMetricStrip`
`RecordTabs`
`RecordSummaryPanel`
`RelatedEntityCard`
`RelatedRecordsTable`
`ActivityTimeline`
`OwnerControl`
`NextActionCard`
`HealthIndicator`
`RecordActionMenu`
`InternalNotesPanel`
`FilesPanel`
`QuickCreateRelatedAction`

This becomes one of Phase 3A's biggest component consolidation opportunities.

---

# 38. New reusable family

Our master architecture now gains:

```text
Entity Detail / 360 Workspace Family
        │
        └── 017 Deal Detail / Opportunity Workspace
```

Later:

```text
085 Company 360
087 Contact 360
089 Lead 360
...
```

should reuse this family extensively.

---

# 39. Relationship to Design 096

Later Design 096 is:

**Deal Qualification / Deal Stage Detail.**

This introduces an important future overlap flag.

### Design 017

Broad complete Deal / Opportunity record.

### Design 096

Deeper stage/qualification-specific commercial workflow.

Expected relationship:

```text
Canonical Deal Domain
       │
       ├── Design 017
       │   Overall Deal 360
       │
       └── Design 096
           Qualification / stage-specific operation
```

### Audit decision

**DO NOT MERGE YET.**

Design 096 must be audited later before deciding whether it is a distinct workflow composition or implementation variant.

---

# 40. Relationship to Design 016

This is now a clean pair:

```text
Design 016
Deals Pipeline
Cross-record view
     ↓
Design 017
Deal Detail
Single-record view
```

Shared components:

**DealCard**
**StageBadge**
**HealthBadge**
**Owner**
**Probability**
**Next Action**

Shared services:

**Deal Query Service**
**Deal Command Service**
**Deal Transition Service**

Separate page templates:

**PipelineBoardTemplate**
vs
**EntityDetailWorkspaceTemplate**

---

# 41. Permission architecture

Potential capabilities:

```text
deal.read
deal.edit
deal.assign
deal.move
deal.close_won
deal.close_lost

deal.note.create
deal.file.read
deal.related_finance.read
```

Exact names belong to Phase 3D.

Related tabs must also respect downstream permissions.

For example:

A user permitted to read the Deal does **not automatically receive invoice-detail permission**.

---

# 42. Permission-aware tabs

Example:

```text
Overview        ✓
Activity        ✓
Meetings        ✓
Proposals       ✓
Contracts       ✓
Invoices        ✕
```

The server should not return restricted financial data merely because the UI hides the tab.

Authorization belongs in each query/service.

---

# 43. Scope inheritance

If a user cannot access a Deal, they must not access it indirectly through:

* global search,
* activity timeline,
* linked Meeting,
* Proposal route,
* quick drawer.

All surfaces should use a consistent permission model.

---

# 44. Record-level concurrency

Two Sales users may edit the same Deal.

Important changes need version/concurrency protection:

**amount**
**stage**
**probability**
**owner**
**expected close**

The system should reject stale destructive updates rather than silently overwrite them.

---

# 45. Edit form behavior

Deal edit forms should use server-side validation.

The frontend can validate for UX, but rules such as:

**amount valid**
**stage valid**
**owner permitted**
**expected close semantics**

must remain authoritative in backend/domain services.

---

# 46. Files / attachments

Deal-related files should reuse the canonical File system.

Potential examples:

**briefs**
**commercial documents**
**supporting client material**

The Deal record references files.

It should not store raw binary attachments directly in arbitrary Deal fields.

---

# 47. Search indexing

Deal Detail should be reachable from:

**Deals Pipeline**
**Global Search**
**Company Detail**
**Contact Detail**
**Lead Detail**
**Meeting**
**Proposal**

when permissions allow.

Exact route mapping belongs to Phase 3B.

---

# 48. Responsive contract — Desktop

Desktop should preserve the full approved Deal 360 productivity experience:

**record header → commercial metrics/status → tabs/sections → main work area → contextual side information where designed**

This is the richest version.

---

# 49. Responsive contract — Tablet

Following Design 152:

* header metrics reflow,
* tabs may scroll,
* side summary becomes drawer/stacked section,
* related-record tables reduce priority columns,
* actions remain touch accessible.

Landscape can preserve more of the desktop composition.

---

# 50. Responsive contract — Mobile

Following Design 151:

```text
Deal Header
↓
Value / Stage / Health
↓
Primary Next Action
↓
Key contacts
↓
Activity
↓
Related sections
```

Tabs may become:

**horizontal scroll**
or
**section selector**.

A persistent desktop side panel should become a full-screen/detail section.

---

# 51. Mobile action hierarchy

Primary mobile actions should prioritize:

**Next Action**
**Move Stage**
**Schedule Meeting**
**Create Follow-up**

Secondary commercial/admin actions move to:

**More**

This prevents action overload.

---

# 52. State coverage

Design 017 inherits Design 150 plus Deal-specific states:

**Deal Loading**
**Deal Not Found**
**Deal Deleted/Archived**
**Deal Won**
**Deal Lost**
**Record Updated Elsewhere**
**Stage Transition Rejected**
**No Meetings**
**No Follow-ups**
**No Proposals**
**No Activity Yet**
**No Files**
**Related Service Failure**
**Permission Restricted**
**Partial Data Failure**

These should be section-aware rather than collapsing the entire page unnecessarily.

---

# 53. Deleted / archived behavior

If a Deal is archived or administratively unavailable:

**404** should not always be used.

The application should distinguish, where authorized:

**Record does not exist**
**Record archived**
**Permission denied**

Design 150 already defines the system-state language for this.

---

# 54. Backend architecture

Recommended structure:

```text
Deal Detail UI
      ↓
DealDetailQueryService
      ↓
Tenant + Permission Scope
      ↓
Canonical Deal
      │
      ├── Company / Contacts
      ├── Meetings / FollowUps
      ├── Activity
      ├── Proposals
      ├── Contract summary
      ├── Invoice summary
      └── Files / Notes
```

Commands:

```text
DealCommandService
├── Update
├── Assign
├── Move Stage
├── Close Won
├── Close Lost
├── Reopen
└── related action orchestration
```

---

# 55. Read model vs write model

Design 017 benefits from a composed read model:

```text
DealDetailView
```

but writes should still target canonical domain services.

Do not mutate a giant nested `DealDetailView` object.

Example:

```text
Read:
Deal + Company + Contacts + Activities + Proposal summary
```

but:

```text
Write stage:
DealTransitionService
```

and:

```text
Create meeting:
MeetingService
```

This separation prevents the Detail page from becoming a monolithic backend endpoint.

---

# 56. Backend requirements

| Requirement                          | Status                   |
| ------------------------------------ | ------------------------ |
| Authentication                       | **Required**             |
| Tenant isolation                     | **Critical**             |
| Deal RBAC                            | **Critical**             |
| Record-level scopes                  | **Critical**             |
| Canonical Deal entity                | **Critical**             |
| Deal detail read model               | **Required**             |
| Deal transition service              | **Critical**             |
| Company/Contact relations            | **Critical**             |
| Meeting/FollowUp integration         | **Required**             |
| Proposal relationship                | **Critical**             |
| Contract/invoice summary permissions | **Required**             |
| Currency-safe commercial data        | **Critical**             |
| Health derivation                    | **Required**             |
| Next Action resolver                 | **Required**             |
| Activity timeline                    | **Required**             |
| Internal notes                       | **Required if approved** |
| Files integration                    | **Required if approved** |
| Concurrency protection               | **Required**             |
| Partial-query failure handling       | **Required**             |
| Audit history                        | **Required**             |

---

# 57. Canonical Deal Detail metrics

The following should use the same definitions as Design 016:

**Deal Value**
**Probability**
**Weighted Value**
**Expected Close**
**Deal Age**
**Stage Age**
**Health**
**Next Action**

Do not recalculate these differently in the Detail workspace.

---

# 58. Relationship to Analytics

Design 017 may show contextual Deal intelligence.

But organization-wide:

**win rates**
**pipeline trends**
**sales forecasts**

belong to Dashboard/Analytics screens.

The Deal Detail should remain record-centric.

---

# 59. Main implementation risks

The audit flags:

**Deal 360 becoming a monolith**
Loading and mutating every related domain through one giant endpoint.

**Duplicate stage logic**
Design 016 and 017 enforcing different transitions.

**Related-record duplication**
Meetings, proposals or invoices copied into Deal-specific tables.

**Permission leakage**
Invoice/Contract information exposed merely because the Deal is visible.

**Next-action drift**
Deal Detail calculating a different next action from Sales Dashboard/Pipeline.

**Lost historical relationships**
Lead/Campaign/Meeting attribution dropped after conversion.

**Overgrown quick actions**
Detail page implementing miniature versions of Proposal, Meeting, Contract and Invoice workflows.

**Concurrency overwrite**
Multiple users silently replacing opportunity state.

**Package mutation drift**
Master Product changes altering historical Deal terms.

**Internal-note exposure**
Sales strategy leaking into downstream Client Portal experiences.

No redesign is required.

---

# Design 017 Audit Verdict

## **PASS — ENTITY DETAIL / OPPORTUNITY 360 ANCHOR**

**Template directive:** Design 017 establishes the canonical `EntityDetailWorkspaceTemplate` family for complex single-record workspaces.

**Domain directive:** The Deal remains the canonical commercial opportunity while Company, Contact, Lead, Meeting, Proposal, Contract and Invoice remain separate linked entities.

**Transition directive:** Design 016 and Design 017 share one Deal transition service.

**Relationship directive:** Deal Detail composes canonical related records instead of duplicating them.

**Next-action directive:** The opportunity consumes the canonical Meeting/Follow-up Next Action Resolver.

**Commercial directive:** Product/package context and negotiated commercial terms must preserve historical snapshots where master data may later change.

**Permission directive:** Related tabs and summaries enforce their own downstream permissions; Deal visibility does not imply unrestricted Finance/Contract visibility.

**History directive:** Ownership, stage, value, close-date and won/lost changes contribute to canonical Activity/Audit history.

**Performance directive:** Deal core data and related tab queries should support lazy/independent loading and partial failure.

**Responsive directive:** Desktop remains a rich 360 workspace; tablet/mobile progressively stack and prioritize opportunity context rather than shrinking the desktop layout.

**Consolidation directive:** **STANDARDIZE THIS ENTITY DETAIL ARCHITECTURE FOR COMPANY, CONTACT, LEAD, CLIENT, CONTRACT, INVOICE AND OTHER 360 WORKSPACES — DO NOT MERGE THEIR DOMAIN LOGIC OR APPROVED SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                           Count |
| ------------------------------------------ | ------------------------------: |
| **Audited**                                |                    **17 / 153** |
| **PASS**                                   |                          **17** |
| **STANDARDIZE decisions**                  |                          **15** |
| **Potential implementation-overlap flags** |                           **8** |
| **MERGE screen candidates**                | **0 pending later comparisons** |
| **FIX BEFORE CODE**                        |                           **0** |
| **New designs**                            |                           **0** |

### Reusable page families discovered

```text
InternalAppShell
│
├── Dashboard Family
│   └── 003–007
│
├── Data Acquisition Family
│   └── 008–009
│
├── Data Quality / Enrichment Family
│   └── 010
│
├── CRM List Workspace Family
│   └── 011
│
├── Campaign Operations Family
│   └── 012
│
├── Versioned Workflow Builder Family
│   └── 013
│
├── Unified Communication Workspace Family
│   └── 014
│
├── Action & Scheduling Workspace Family
│   └── 015
│
├── Pipeline Board Family
│   └── 016
│
└── Entity Detail / 360 Workspace Family
    └── 017
```

This is another major consolidation milestone:

> **Design 017 gives us the reusable foundation for many later “360 / Detail” screens. They should become different domain compositions of one structural Detail Workspace system, not dozens of independently engineered page layouts.**

# Next Sequential Audit Target

## **Phase 3A.1 — Design 018: Proposal Builder / Proposal Detail Audit**

The exact frozen next identity is **Design 018 — Proposal Builder / Proposal Detail**.

That audit should establish the canonical separation between **Proposal, Proposal Version, commercial line items/package snapshots, internal approval, client-facing document state, sending/viewing/acceptance state, Deal linkage and eventual Contract creation**, while preventing a Proposal from becoming merely a mutable rich-text document.

We continue with the identical audit contract and with **no redesign, no additional screen and no sequence change.**

