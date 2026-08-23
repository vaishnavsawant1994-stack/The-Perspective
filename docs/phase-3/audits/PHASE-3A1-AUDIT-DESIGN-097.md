# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 097 — Proposal Library / Proposal List

Design 097 should become the **canonical Team Workspace Proposal discovery, portfolio, status-summary, and commercial-document library surface** over the Proposal foundation already established by Design 018.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Proposal ≠ ProposalVersion ≠ ProposalTemplate ≠ ProposalListEntry ≠ Deal ≠ Company/Client/Contact ≠ CommercialLineItem ≠ PackageSnapshot ≠ ApprovalRequest ≠ Recipient/DeliveryState ≠ Acceptance ≠ Contract.**

The central implementation rule is:

> **The Proposal Library is a permission-safe collection projection over canonical Proposals. It must never create a second Proposal backend, flatten version history into one mutable document, treat current Deal/Company/package data as historical Proposal truth, or equate internal approval, external delivery, recipient viewing, acceptance, expiry, and Contract execution as one generic Proposal status.**

---

# 1. Classification

| Audit field                     | Classification                                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                   | **097**                                                                                                             |
| **Canonical name**              | **Proposal Library / Proposal List**                                                                                |
| **Product area**                | Team Workspace / Sales / Commercial Documents                                                                       |
| **User surface**                | **Authenticated Team Workspace**                                                                                    |
| **Screen class**                | Commercial Document Library / Collection Workspace                                                                  |
| **Classification**              | **Canonical Proposal Discovery, Version-Summary & Commercial Document Library Anchor**                              |
| **Primary purpose**             | Discover, filter and inspect canonical Proposals across Deals/Clients without duplicating Proposal or version state |
| **Primary entity**              | **Proposal** — Design 018                                                                                           |
| **Version entity**              | **ProposalVersion** — Design 018                                                                                    |
| **Library projection**          | **ProposalListEntry / ProposalSummaryView**                                                                         |
| **Template dependency**         | ProposalTemplate where supported by canonical Proposal domain                                                       |
| **Deal dependency**             | Designs 016–017 / 096                                                                                               |
| **Company dependency**          | Designs 084–085                                                                                                     |
| **Contact dependency**          | Designs 086–087                                                                                                     |
| **Client dependency**           | Design 021                                                                                                          |
| **Commercial-line dependency**  | Proposal line items / package snapshots established by Design 018                                                   |
| **Approval dependency**         | Design 029 / upcoming Design 098                                                                                    |
| **Contract dependency**         | Designs 019 / upcoming 099–100                                                                                      |
| **Asset/document dependency**   | Design 030 where rendered/generated artifact is stored                                                              |
| **Universal Search dependency** | Design 079                                                                                                          |
| **Primary query service**       | `ProposalLibraryQueryService`                                                                                       |
| **Mutation service**            | `ProposalService`                                                                                                   |
| **Version service**             | `ProposalVersionService`                                                                                            |
| **Projection**                  | `ProposalListEntry`                                                                                                 |
| **Parent shell**                | `InternalAppShell` — Design 001                                                                                     |
| **Auth**                        | Required                                                                                                            |
| **Authorization**               | Active OrganizationMembership + Proposal/document/commercial permissions                                            |
| **Implementation priority**     | **Critical Commercial Document Integrity / Version Lineage / Deal-to-Contract Handoff**                             |
| **Reuse level**                 | **Extremely High across Deals, Approvals, Contracts, Client Portal and reporting**                                  |

Design 097 should answer:

> **“Which canonical Proposals exist, which Deal/Client each belongs to, what the current Proposal lifecycle is, which exact version is latest/issued where relevant, what approval/delivery/acceptance context exists, and which Proposal should I open—without confusing the list projection with the actual Proposal or its immutable versions?”**

Canonical structure:

```text
Proposal
   │
   ├── ProposalVersion v1
   ├── ProposalVersion v2
   └── ProposalVersion v3
          │
          ├── CommercialLineItem snapshots
          ├── Package snapshots
          ├── recipient / issue context
          ├── approval reference
          └── rendered artifact
                  │
                  ↓
          ProposalListEntry
          permission-safe summary
                  │
                  ↓
           Design 097 Library
```

---

# 2. Reuse

## Design 018 remains the canonical Proposal domain

Design 097 must use the exact same:

```text
Proposal.id
```

established in Design 018.

Do not introduce:

```text
LibraryProposal
ProposalListProposal
ProposalSummaryRecord
SalesProposalDocument
```

as parallel mutable business entities.

`ProposalListEntry` is a read projection only.

---

## Proposal Library ≠ Proposal Builder

Design 018 remains responsible for detailed Proposal authoring/versioning.

Design 097 is responsible for:

* discovery,
* filtering,
* summarized commercial context,
* navigation into canonical Proposal work.

Do not recreate the Proposal builder inside each list row.

---

## Proposal ≠ ProposalVersion

Permanent.

Example:

```text
Proposal P-100
├── Version 1 — draft
├── Version 2 — internally approved
└── Version 3 — issued to client
```

Proposal is the stable commercial-document identity.

ProposalVersion is the exact content/commercial revision.

---

## Proposal list must not flatten all versions into one mutable proposal body

A library row may display:

> Latest version v3

or equivalent.

That does not mean v1/v2 ceased to exist.

---

## Current/latest version ≠ issued version necessarily

Critical.

Example:

```text
Latest draft version = v4
Latest issued version = v3
```

Both can coexist.

Design 097 must not casually display v4 values as though the client received them.

---

## Reuse Deal identity from Designs 016–017

Proposal may be associated with Deal D-100.

Correct:

```text
Deal D-100
    ↓
Proposal P-100
```

Proposal is not embedded Deal state.

---

## Deal stage ≠ Proposal lifecycle

Design 096 remains authoritative for Deal stage.

A Proposal may be:

> Sent

while Deal stage remains whatever canonical policy says.

The Proposal does not directly own pipeline truth.

---

## Reuse Company/Contact identities

Proposal list can show safe summaries such as:

* client/company,
* primary commercial contact,

where present in frozen design.

Those must resolve from canonical Company/Contact records.

---

## Current Company/Contact profile ≠ issued Proposal party snapshot

Critical.

A Proposal issued when:

```text
Sarah Patel
VP Marketing
Acme Ltd
```

must remain historically reconstructable even if current CRM later says:

```text
Sarah Patel
CMO
Globex
```

Library display can show current contextual identity where useful, but historical issued-document evidence remains version-bound.

---

## Reuse Client relationship from Design 021

Proposal can relate to a Client relationship or pre-client Deal context.

Proposal ≠ Client.

Accepted Proposal does not automatically mutate Company into Client unless downstream handoff policy explicitly does so.

---

## Reuse Design 029 Approval engine

If Proposal requires internal approval:

```text
ProposalVersion
      ↓
ApprovalRequest
```

Design 029 remains canonical.

Design 097 may show approval summary only.

---

## Internal approval ≠ client acceptance

Permanent.

---

## Reuse Design 030 for generated artifacts

If issued Proposal versions generate:

* PDF,
* downloadable commercial document,

those should use canonical Asset/FileVersion infrastructure.

ProposalVersion remains business content/version identity.

Rendered PDF is its artifact.

---

## Reuse Contract domain

Accepted Proposal may lead to Contract creation.

Correct:

```text
Proposal P1
   ↓
accepted ProposalVersion v3
   ↓
Contract C1
```

Contract remains a new canonical entity.

---

## Proposal acceptance ≠ Contract execution

Permanent.

Designs 019/099–100 remain Contract authority.

---

# 3. Entities

## Proposal

`Proposal` is the stable commercial proposal identity.

Conceptually:

```text
Proposal
├── id
├── organizationId
├── dealId
├── company/client context
├── lifecycle
├── current draft/latest version references
├── latest issued version reference
├── owner
├── createdAt
└── revision
```

Exact physical model belongs to Phase 3D.

---

## Proposal ≠ ProposalListEntry

Critical.

`ProposalListEntry` should contain optimized safe summary fields such as conceptually:

```text
ProposalListEntry
├── proposalId
├── display title/reference
├── Deal summary
├── Company/Client summary
├── owner summary
├── lifecycle
├── latest version summary
├── issued-version summary
├── approval summary
├── delivery/acceptance summary
├── amount/currency summary
├── updatedAt
└── section availability
```

It remains reconstructable.

---

## ProposalVersion

ProposalVersion is the exact commercial content revision.

Conceptually:

```text
ProposalVersion
├── id
├── proposalId
├── version number/revision
├── commercial snapshot
├── terms snapshot
├── recipient/party snapshot where required
├── authored content
├── createdBy
├── createdAt
├── version lifecycle
└── content fingerprint
```

---

## Issued ProposalVersion should be immutable

Permanent.

Once sent/issued externally:

* price,
* line items,
* package,
* terms,
* benefits,
* recipient data,
* expiry terms,

must not mutate in place.

Changes create a new version.

---

## Latest draft ≠ issued commercial truth

Critical.

Do not calculate library:

> Proposal amount = ₹100,000

from the latest unpublished draft if the client actually has an issued ₹80,000 version unless the UI explicitly labels which value is being shown.

The summary contract must define its source.

---

## CommercialLineItem

Line items remain version-bound commercial snapshots.

Conceptually:

```text
ProposalVersion
├── LineItem A
├── LineItem B
└── LineItem C
```

---

## Proposal line item ≠ Product/Package current definition

Critical.

If Package “Executive Magazine” changes from:

```text
$1,000
```

to:

```text
$1,500
```

later, an already-issued Proposal must preserve the original price/benefits.

---

## PackageSnapshot

ProposalVersion should preserve the exact offered package semantics where needed.

Do not dynamically render historical Proposals from current Product/Package data.

---

## Current package catalog ≠ historical proposal snapshot

Permanent.

---

## Proposal amount

Amount is derived from/persisted with the exact commercial version according to canonical money rules.

Do not create an unversioned mutable `proposal.amount` that rewrites historical issued totals.

---

## Currency

Currency belongs to commercial snapshot semantics.

Never sum Proposal totals across currencies naïvely in library aggregate views.

---

## ProposalTemplate

If Proposal Templates exist:

```text
ProposalTemplate
≠
Proposal
≠
ProposalVersion
```

A template is reusable source structure.

A ProposalVersion is customer/deal-specific commercial content.

---

## Template edit ≠ Proposal edit

Permanent.

---

## Proposal owner

Proposal owner is operational responsibility.

It does not equal:

* Deal owner necessarily,
* approval authority,
* authorization role.

---

## Proposal lifecycle

Potential canonical states may conceptually include:

```text
Draft
Ready
Issued/Sent
Accepted
Declined
Expired
Cancelled/Superseded
```

Exact enum remains Phase 3D/Design 018 truth.

Do not invent a second list-specific lifecycle.

---

## Proposal lifecycle ≠ version lifecycle

Example:

```text
Proposal lifecycle = SENT
Version v3 = ISSUED
Version v4 = DRAFT
```

Valid.

---

## Proposal lifecycle ≠ delivery state

Permanent.

A Proposal may be:

> Issued

while outbound delivery attempt is:

> Deferred

depending on issue/delivery semantics.

---

## Proposal lifecycle ≠ recipient view state

Permanent.

---

## Sent ≠ viewed

Permanent.

---

## Viewed ≠ accepted

Permanent.

---

## Accepted ≠ Contract signed

Permanent.

---

## Declined ≠ Deal lost automatically

Permanent.

A Deal may remain active for negotiation/revision.

---

## Expired ≠ Deal lost automatically

Permanent.

---

## Proposal expiry

Expiry should bind the issued ProposalVersion/issue context.

Editing a newer draft should not extend an already-issued version's expiry retrospectively.

---

## Acceptance

Acceptance must reference an exact ProposalVersion.

Conceptually:

```text
ProposalAcceptance
├── proposalId
├── proposalVersionId
├── acceptedBy / party evidence
├── acceptedAt
└── acceptance evidence
```

or equivalent.

---

## Acceptance ≠ generic Proposal flag

Avoid:

```text
proposal.accepted = true
```

without knowing which version was accepted.

---

## Acceptance of v3 ≠ acceptance of v4 draft

Critical.

---

## ApprovalRequest

Internal approval should also bind exact ProposalVersion.

Correct:

```text
ApprovalRequest
subject = ProposalVersion v3
```

not:

```text
subject = mutable Proposal P1
```

when commercial content can change.

---

## Approval of v2 ≠ approval of v3

Permanent.

---

## Approval ≠ issue/send

Permanent.

An approved version still requires explicit issuance/send if that is the workflow.

---

## Recipient / Party snapshot

Current CRM identity may be referenced, but issued-document evidence should preserve exact recipient/party details where required.

---

## Proposal recipient ≠ Contact lifecycle

A Contact merge/edit must not rewrite historical issued Proposal evidence.

---

## Rendered artifact

A generated PDF/file is a representation of exact ProposalVersion.

Conceptually:

```text
ProposalVersion v3
     ↓
GeneratedArtifact
     ↓
Asset / FileVersion
```

---

## PDF ≠ ProposalVersion

Permanent.

A PDF regeneration does not create a new commercial ProposalVersion unless business content changes.

---

## Proposal list grouping/filtering

Library filters such as:

* status,
* owner,
* Deal,
* Company,
* date,

if present in the frozen design, are query criteria.

They do not create another business entity.

---

## Saved view ≠ Proposal collection truth

If Design 097 eventually supports saved filters:

reuse SavedView semantics rather than creating ProposalList business records.

No new screen is introduced by this audit.

---

# 4. Permissions

Design 097 should conceptually distinguish:

```text
proposal.read
proposal.create
proposal.editDraft
proposal.createVersion
proposal.issue
proposal.cancel

proposal.commercial.read
proposal.commercial.edit

proposal.approval.read
proposal.acceptance.read

proposal.downloadArtifact

proposal.archive
```

Exact keys belong to Phase 3D.

---

## Proposal list visibility ≠ full Proposal content visibility

A user might be authorized to see:

> Proposal P-100 exists for Acme

without permission to read:

* all pricing,
* margins,
* private terms.

Library projection must be field-safe.

---

## Proposal read ≠ edit

Permanent.

---

## Edit draft ≠ issue Proposal

Critical.

Commercial authoring and external issuance should be separable capabilities.

---

## Issue ≠ approve

Permanent.

If approval is required, issuer cannot bypass Design 029 merely because they can send documents.

---

## Approval permission ≠ commercial edit permission

Permanent.

---

## Proposal read ≠ Deal edit

Permanent.

---

## Deal access ≠ Proposal full-commercial access

A user may access opportunity context but not pricing/terms.

---

## Proposal read ≠ Contract read

Permanent.

---

## Proposal acceptance visibility may be sensitive

Expose only to roles allowed to inspect client/legal commercial commitments.

---

## Current Company/Contact access ≠ historical party evidence automatically

Issued-document evidence needs Proposal permission.

---

## Artifact download ≠ Proposal metadata read

Downloading issued commercial documents may warrant a separate capability.

---

## List counts must be permission-aware

Example:

> 54 Proposals

must not count restricted Proposals if that would leak existence.

---

## Commercial totals must be permission-aware

A Sales user without financial/commercial-value permission must not infer hidden Proposal amounts through:

* aggregate totals,
* sorting,
* filters.

---

## Direct Proposal ID reauthorizes

Knowing ID grants nothing.

---

## Direct ProposalVersion ID reauthorizes

Permanent.

---

## Cross-tenant Proposal/Deal/Client references prohibited

Absolute.

---

## Issuance target must be validated server-side

Do not trust arbitrary:

```text
recipientContactId
email
dealId
```

without tenant/resource/purpose validation.

---

# 5. States

Design 097 must keep **Proposal lifecycle, ProposalVersion state, internal approval, issue/delivery state, recipient engagement, acceptance, expiry, and Contract lineage** independent.

### Proposal lifecycle

Canonical from Design 018.

### Version state

Conceptually:

```text
Draft
Approved for Issue
Issued
Superseded
Historical
```

Exact vocabulary Phase 3D.

### Approval state

```text
Not Required
Pending
Approved
Rejected
Withdrawn
Expired
```

through canonical Approval engine.

### Delivery state

```text
Not Issued
Queued
Sent/Provider Accepted
Delivered
Failed
Unknown
```

where delivery tracking exists.

### Recipient engagement

```text
Not Viewed
Viewed
```

where canonical tracking supports it.

### Acceptance

```text
Not Accepted
Accepted
Declined
Expired
Withdrawn/Superseded
```

according to Proposal policy.

### Contract linkage

```text
No Contract
Contract Created
Contract Executing
Contract Signed
```

as related-domain context only.

These must never collapse into one generic `proposal.status`.

---

## Draft ≠ pending approval

Permanent.

A draft can exist before approval request.

---

## Approved ≠ issued

Permanent.

---

## Issued ≠ delivered

Permanent.

---

## Delivered ≠ viewed

Permanent.

---

## Viewed ≠ accepted

Permanent.

---

## Accepted ≠ Contract created

Permanent.

---

## Contract created ≠ Contract signed

Permanent.

---

## Contract signed ≠ Proposal mutated

Permanent.

---

## Proposal expired ≠ Deal lost

Permanent.

---

## Proposal declined ≠ Deal lost

Permanent.

---

## Latest draft exists ≠ issued version superseded

Critical.

A newer draft does not automatically invalidate a currently issued version.

---

## New version issued ≠ old version deleted

Permanent.

Old version becomes historical/superseded according to policy.

---

## Approval rejected ≠ Proposal deleted

Permanent.

A new revised ProposalVersion may be created.

---

## Approval service unavailable ≠ approval not required

Critical.

---

## Contract service unavailable ≠ no Contract

Critical.

---

## Artifact service unavailable ≠ Proposal missing

Critical.

---

## Company service unavailable ≠ Proposal has no Company

Critical.

---

## Proposal Library empty ≠ query failed

Permanent.

---

## State Coverage

Design 097 inherits Design 150 plus:

```text
Proposal Library Loading
Proposal Library Available
Proposal Library Empty
Proposal Library Restricted
Proposal Library Partial

Proposal Available
Proposal Restricted
Proposal Archived
Proposal No Longer Accessible

Latest Draft Available
No Draft
Latest Issued Version Available
No Issued Version

Approval Not Required
Approval Pending
Approval Approved
Approval Rejected
Approval Restricted
Approval Service Unavailable

Proposal Not Issued
Proposal Issued
Delivery Pending
Proposal Delivered
Delivery Failed
Delivery Outcome Unknown

Proposal Not Viewed
Proposal Viewed
View State Unavailable

Proposal Not Accepted
Proposal Accepted
Proposal Declined
Proposal Expired
Proposal Superseded

No Contract
Contract Linked
Contract Context Restricted
Contract Service Unavailable

Artifact Available
Artifact Generating
Artifact Unavailable
Artifact Generation Failed

Proposal Updated Elsewhere
Proposal Version Conflict
Partial Proposal Summary Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize Proposal discovery while preserving document/version semantics.

Conceptually:

```text
Proposal Library
↓
Proposal rows
   ├── Proposal identity
   ├── Company / Client
   ├── Deal
   ├── owner
   ├── lifecycle
   ├── version context
   ├── approval / issue context
   ├── commercial total where authorized
   └── updated / issued timing
```

Only frozen-design fields/actions should render.

---

## Proposal identity and version context should remain distinct

Correct:

> Proposal P-104
> Issued v3 · Draft v4 exists

where frozen design supports this information.

Not:

> Version 4 proposal

without telling the user that v3 is the client-facing issued version.

---

## Approval, delivery and acceptance should not share one badge

Example:

```text
Approval: Approved
Delivery: Delivered
Client: Viewed
Acceptance: Pending
```

These can coexist.

---

## Deal stage should remain contextual

If shown:

> Deal: Negotiation

must clearly remain Deal-domain context, not Proposal status.

---

## Commercial amounts need currency semantics

Never show an aggregate sum across USD/EUR/etc. without defined conversion/reporting semantics.

Individual Proposal totals must display their original currency correctly.

---

## Tablet

Following Design 152:

* Proposal table can become compact rows/cards,
* Company/Deal context remains visible,
* Proposal lifecycle and version context remain distinct,
* commercial fields hide/reflow according to permission/responsive priority.

---

## Mobile

Priority:

```text
Proposal
↓
Company / Client
↓
Deal context
↓
Proposal lifecycle
↓
Issued/latest version
↓
Approval / acceptance
↓
Amount where authorized
↓
Primary frozen action
```

Do not compress a wide commercial-document table horizontally.

---

## Mobile should preserve exact version semantics

If only one version label can fit, prefer explicit:

> Issued v3

rather than ambiguous:

> v3.

---

## Partial failure

If Contract service is unavailable:

Proposal row/detail entry remains visible with:

> Contract status unavailable

rather than disappearing.

---

## Accessibility

A Proposal row could communicate:

> Proposal Executive Brand Package for Globex. Related Deal D-204. Issued version 3. Internal approval approved. Client acceptance pending. Total 12,000 euros.

where current authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Proposal Library architecture

```text
Design 097
    ↓
Authenticated Workspace Context
    ↓
ProposalLibraryQueryService
    │
    ├── Proposal summary
    ├── latest draft version summary
    ├── latest issued version summary
    ├── Deal safe summary
    ├── Company / Client safe summary
    ├── Approval summary
    ├── delivery / acceptance summary
    ├── Contract-link summary
    └── artifact availability
    ↓
ProposalListEntry[]
```

This is a read-composition/query layer.

---

## Query anchors on canonical Proposal records

Conceptually:

```text
getProposals(
    currentMembership,
    filters,
    sort,
    cursor
)
```

The browser must not specify another user's unrestricted organization scope.

---

## No giant ProposalList table

Avoid:

```text
ProposalListRecord {
  proposalJson,
  dealJson,
  companyJson,
  approvalJson,
  contractJson
}
```

as source truth.

Materialized/search projections are acceptable only if rebuildable and authorization-safe.

---

## Proposal list row should expose explicit version references

Conceptually:

```text
latestDraftVersionId
latestIssuedVersionId
```

rather than one ambiguous:

```text
currentVersionId
```

if the domain permits simultaneous draft + issued state.

This is important.

---

## Current-version resolver

If Design 018 already defines a canonical “current” version concept, preserve it—but do not use it to erase the distinction between:

* latest editable draft,
* latest approved,
* latest issued,
* accepted version.

---

## Version creation

Use canonical ProposalVersionService.

Editing a historically protected version should create a new version/revision.

---

## Optimistic concurrency

Proposal draft/version edits should use revision protection.

Two users cannot silently overwrite the same draft/commercial terms.

---

## Issuance

Conceptually:

```text
issueProposalVersion(
    proposalId,
    proposalVersionId,
    recipientContext,
    expectedProposalRevision,
    idempotencyKey
)
```

should:

1. authorize issuer;
2. validate exact ProposalVersion;
3. verify version is issueable;
4. evaluate required Approval state;
5. validate recipient/party context;
6. freeze exact commercial/party snapshot;
7. create/associate rendered artifact where required;
8. create issue/delivery record;
9. update Proposal lifecycle where policy requires;
10. emit event/Audit.

---

## Issuance idempotency

Double-click/network retry must not send the same Proposal twice unintentionally or create multiple issued-version records.

---

## Outcome unknown for external delivery

If provider/email delivery outcome is uncertain:

preserve:

> Delivery unknown

rather than assuming failed and issuing duplicate communication.

Delivery can reuse canonical Messaging/provider infrastructure where architecture requires.

---

## Version immutability after issue

Critical.

Once ProposalVersion is issued externally:

no direct mutation of:

* line items,
* amount,
* currency,
* recipient,
* terms,
* expiry,
* package benefits.

Revision creates a new ProposalVersion.

---

## Commercial snapshot generation

When creating a ProposalVersion:

resolve Product/Package/price data into a versioned snapshot.

Conceptually:

```text
Package
    ↓ snapshot at version creation
ProposalVersion
    ├── PackageSnapshot
    └── LineItems
```

Do not render an issued version from current Product data later.

---

## Money handling

Use decimal-safe money fields.

Conceptually:

```text
amount
currency
```

Never floating-point monetary arithmetic.

---

## Totals

Proposal totals should derive from exact version lines under one canonical calculation service.

Avoid frontend-only total formulas.

---

## Taxes/discounts

If present in frozen Proposal model:

they must be versioned calculation inputs/outputs.

Do not invent them here if absent.

---

## Approval integration

Before issuance where approval is required:

query canonical ApprovalRequest targeting exact ProposalVersion.

Do not check a mutable Proposal-level boolean.

---

## Acceptance integration

Acceptance must bind exact issued ProposalVersion.

Server validates:

* Proposal,
* version,
* intended party,
* current acceptance eligibility,
* supersession/expiry,
* idempotency.

---

## Expiry resolver

Centralize Proposal expiration semantics.

Do not let:

* list,
* Proposal Detail,
* Portal,

calculate expiration differently.

---

## “Expired” should derive from exact issued-version terms

Where expiry is time-based.

---

## Client Portal consistency

Design 053 is Contract portal, but any future/client-facing Proposal exposure must use the same Proposal/Version identity and safe issued-version projection.

No second client Proposal backend.

---

## Contract creation

If accepted Proposal leads to Contract:

```text
createContractFromProposal(
    proposalId,
    acceptedProposalVersionId
)
```

or equivalent should preserve exact lineage.

---

## Contract creation idempotency

Retry must not create duplicate Contracts for the same accepted Proposal/version/handoff intent.

---

## Contract should receive commercial snapshot lineage

Contract can copy/snapshot the relevant agreed terms into its own immutable ContractVersion.

It should not remain dynamically dependent on mutable Proposal drafts.

---

## Proposal-to-Contract lineage

Conceptually:

```text
Deal
 ↓
Proposal P1
 ↓
ProposalVersion v3
 ↓ Accepted
Acceptance A1
 ↓
Contract C1
 ↓
ContractVersion v1
```

Every step remains identifiable.

---

## Contract state changes do not rewrite Proposal

Permanent.

---

## Library filtering

Server-side filtering/sorting should use approved searchable fields such as canonical:

* lifecycle,
* owner,
* Company,
* Deal,
* creation/issue timing,

where frozen Design 097 requires them.

Do not send all Proposals to browser and filter client-side.

---

## Sorting by amount

Must enforce financial-field permission before using sort/filter semantics if those could leak amounts.

---

## Counts and aggregates

Permission-aware.

`0`, `restricted`, and `unavailable` must remain distinct.

---

## Proposal search

Design 079 may index safe:

* Proposal reference/title,
* Company/Client,
* Deal,
* lifecycle,

where useful.

Do not index confidential terms/full proposal body broadly without explicit policy.

---

## Artifact service

Generated PDF/file should be tied to exact ProposalVersion.

Regenerating layout-only artifact from unchanged business content may produce another FileVersion/derivative without modifying ProposalVersion.

---

## Artifact hash/version lineage

Where useful:

```text
proposalVersionId
artifactFileVersionId
generatedAt
rendererVersion
```

supports reproducibility.

---

## Activity

Proposal events can include:

```text
ProposalCreated
ProposalVersionCreated
ProposalVersionApproved
ProposalVersionIssued
ProposalViewed
ProposalAccepted
ProposalDeclined
ProposalExpired
ContractCreatedFromProposal
```

Activity is a projection.

---

## Audit

Material actions such as:

* version creation,
* material edit,
* approval,
* issuance,
* cancellation,
* acceptance processing,
* Contract handoff,

should have appropriate Audit evidence.

---

## Events/outbox

Useful canonical events:

```text
ProposalCreated
ProposalVersionCreated
ProposalVersionIssued
ProposalAcceptanceRecorded
ProposalDeclined
ProposalExpired
ProposalSuperseded
```

can drive:

* library projections,
* notifications,
* Deal context,
* Contract handoff.

---

## Notification integration

Design 080 may notify:

* Proposal ready for approval,
* Proposal sent,
* Proposal viewed,
* Proposal accepted/declined/expired,

but Notification state never becomes Proposal state.

---

## Cache safety

Proposal library cache must vary by:

```text
organizationMembershipId
authorization revision
query/filter/sort
Proposal revisions
commercial-access level
```

Do not cache one privileged Proposal list for all Team users.

---

## Pagination

Use server-side cursor pagination at scale.

---

## N+1 prevention

Batch:

* Deal summaries,
* Company summaries,
* approval summaries,
* Contract linkage.

Do not issue one service call per Proposal row.

---

## Partial failure

Example:

```text
Proposal core       ✓
Version summary     ✓
Deal context        ✓
Company context     ✓
Approval            ✓
Artifact            ✕
Contract context    ✕
```

Library still returns the Proposal.

The affected fields become explicitly unavailable.

Not:

> Proposal missing.

---

## Backend Requirement Matrix

| Requirement                                      | Status                    |
| ------------------------------------------------ | ------------------------- |
| Canonical Proposal reuse from 018                | **Critical**              |
| Proposal/ProposalVersion separation              | **Critical**              |
| Proposal/ProposalListEntry separation            | **Critical**              |
| ProposalVersion/Template separation              | **Critical**              |
| Latest draft/latest issued distinction           | **Critical**              |
| Issued-version immutability                      | **Critical**              |
| Historical versions preserved                    | **Critical**              |
| Proposal/Deal separation                         | **Critical**              |
| Proposal/Company/Contact separation              | **Critical**              |
| Current CRM/historical party snapshot separation | **Critical**              |
| Proposal/Client separation                       | **Critical**              |
| Line items bound to ProposalVersion              | **Critical**              |
| Package snapshot/current package separation      | **Critical**              |
| Decimal-safe money                               | **Critical**              |
| Currency preservation                            | **Critical**              |
| Canonical total calculation                      | **Critical**              |
| Internal approval/client acceptance separation   | **Critical**              |
| Approval binds exact ProposalVersion             | **Critical**              |
| Acceptance binds exact issued ProposalVersion    | **Critical**              |
| Sent/viewed/accepted separation                  | **Critical**              |
| Accepted/Contract execution separation           | **Critical**              |
| Proposal expiry/Deal lifecycle separation        | **Critical**              |
| Generated artifact/ProposalVersion separation    | **Critical**              |
| Proposal issuance idempotency                    | **Critical**              |
| Acceptance idempotency                           | **Critical**              |
| Proposal→Contract handoff idempotency            | **Critical**              |
| Proposal→Contract exact lineage                  | **Critical**              |
| Generic version mutation prohibited after issue  | **Critical**              |
| Optimistic concurrency                           | **Critical**              |
| Permission-safe list projection                  | **Critical**              |
| Commercial-value field permissions               | **Critical**              |
| Permission-aware counts                          | **Critical**              |
| Server-side filtering/sorting                    | **Critical**              |
| Cursor pagination                                | **Required at scale**     |
| N+1 prevention                                   | **Critical**              |
| Design 029 Approval reuse                        | **Critical**              |
| Design 030 Asset/File reuse                      | **Required**              |
| Design 096 Deal-stage separation                 | **Critical**              |
| Design 098 review/approval reuse                 | **Critical architecture** |
| Designs 099–100 Contract reuse                   | **Critical architecture** |
| Audit/outbox integration                         | **Required**              |
| Partial dependency failure handling              | **Critical**              |

---

# 8. Consolidation

Design 097 exposes significant risk of flattening Proposal versioning and commercial-document history into a simple CRM list.

**Proposal / ProposalListEntry conflation**
List projection becomes business source truth.

**Proposal / ProposalVersion conflation**
Stable document identity and exact commercial revision collapse.

**Latest draft / latest issued version conflation**
Internal edits appear as client-facing terms.

**Latest version / accepted version conflation**
System cannot identify what the client accepted.

**Proposal / Template conflation**
Editing reusable template rewrites client documents.

**Template edit / issued Proposal edit conflation**
Historical proposal changes when template evolves.

**Proposal / Deal conflation**
Proposal status becomes pipeline stage.

**Proposal sent / Deal advanced conflation**
Document delivery mutates Deal workflow automatically.

**Proposal accepted / Deal won conflation**
Acceptance skips governed Deal closure.

**Proposal / Company conflation**
Company data copied into mutable Proposal truth.

**Current Contact / historical recipient conflation**
CRM edits rewrite who received the Proposal.

**Current Company / historical party conflation**
Company rename rewrites issued document evidence.

**Proposal / Client conflation**
Commercial document acceptance automatically creates Client identity.

**Line item / Product conflation**
Current Product edits change historical Proposal price.

**Package definition / PackageSnapshot conflation**
Benefits/terms drift after issuance.

**Mutable proposal.amount / versioned commercial total conflation**
Historical amounts become unreconstructable.

**Currency / numeric amount conflation**
Money loses currency semantics.

**Cross-currency aggregate / meaningful total conflation**
Library sums incompatible values.

**Proposal lifecycle / version lifecycle conflation**
Draft v4 changes status of issued v3.

**Internal approval / client acceptance conflation**
Employee approval appears as client commitment.

**Approval of Proposal / exact version conflation**
Approved v2 is used to send unapproved v3.

**Approval / issuance conflation**
Approval automatically sends document.

**Issued / delivered conflation**
Transport acceptance appears client delivery.

**Delivered / viewed conflation**
Delivery is treated as engagement.

**Viewed / accepted conflation**
Opening document creates commercial acceptance.

**Acceptance / mutable Proposal flag conflation**
System does not know which terms were agreed.

**Acceptance v3 / draft v4 conflation**
New draft silently supersedes agreed terms.

**Accepted / Contract executed conflation**
Proposal becomes legal agreement automatically.

**Contract / ProposalVersion conflation**
Contract dynamically follows proposal changes.

**Contract created / Contract signed conflation**
Handoff appears completed prematurely.

**Proposal expired / Deal lost conflation**
Document timing closes opportunity automatically.

**Proposal declined / Lead/Deal deletion conflation**
Commercial history disappears.

**New issued version / old-version deletion conflation**
Historical negotiations vanish.

**Rendered PDF / ProposalVersion conflation**
Layout regeneration creates false commercial revision.

**Artifact unavailable / Proposal missing conflation**
Storage outage hides business record.

**Proposal owner / Deal owner conflation**
Responsibility assignment changes another domain.

**Proposal owner / approval authority conflation**
Author self-approves through ownership.

**Proposal list access / pricing access conflation**
Commercial values leak through collection rows.

**Proposal count / harmless metadata conflation**
Restricted commercial activity leaks.

**Sort/filter by amount / field visibility conflation**
User infers confidential pricing without seeing column.

**Deal read / Proposal commercial access conflation**
Opportunity viewers see hidden terms.

**Proposal read / Contract read conflation**
Commercial document visibility leaks legal state.

**Proposal metadata read / artifact download conflation**
Sensitive PDF is downloadable by list viewer.

**Generic Proposal CRUD / version command conflation**
PATCH rewrites issued terms.

**Proposal issue retry / duplicate send conflation**
Double-click sends repeated commercial documents.

**Acceptance retry / duplicate acceptance conflation**
One acceptance records multiple commitments.

**Contract handoff retry / duplicate Contract conflation**
One accepted Proposal creates several Contracts.

**Proposal list filter / SavedView/business object conflation**
Presentation state becomes Proposal domain.

**Proposal search projection / source truth conflation**
Search index becomes editable commercial backend.

**Full Proposal content / general Search conflation**
Confidential terms leak through Design 079.

**Cache by organization only**
Privileged pricing data leaks to lower-permission users.

**N+1 Proposal context loading**
Large library becomes operationally expensive.

**097/018 duplicate Proposal backend**
Proposal Builder and Proposal Library disagree.

**097/029 duplicate Approval state**
Proposal list invents approval lifecycle.

**097/030 duplicate artifact backend**
Proposal stores files independently.

**097/096 duplicate Deal-state backend**
Proposal lifecycle starts controlling pipeline.

**097/098 duplicate Proposal review model**
List owns review/approval decisions.

**097/099–100 duplicate Contract lifecycle**
Proposal list starts representing legal execution as its own status.

No additional screen is required.

These are **Proposal identity, immutable versioning, commercial snapshot integrity, approval/acceptance separation, Deal/Contract lineage, permission-safe collection queries, artifact reuse, and historical-document requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROPOSAL LIBRARY, VERSION-SUMMARY & COMMERCIAL DOCUMENT DISCOVERY ANCHOR**

**Domain directive:**
**Proposal ≠ ProposalVersion ≠ ProposalTemplate ≠ ProposalListEntry ≠ Deal ≠ Company/Client/Contact ≠ CommercialLineItem ≠ PackageSnapshot ≠ ApprovalRequest ≠ Recipient/DeliveryState ≠ Acceptance ≠ Contract.**

**Identity directive:**
Design 018 remains the sole canonical Proposal foundation. Design 097 exposes a permission-safe collection/read projection over those same Proposal IDs and never creates a second Proposal entity.

**Projection directive:**
`ProposalListEntry` is optimized for discovery and can be rebuilt from Proposal/Version/Deal/approval/acceptance/Contract sources. It cannot own mutable commercial truth.

**Version directive:**
Proposal remains the stable identity while ProposalVersion represents exact commercial content. Historical versions survive all later edits and negotiation revisions.

**Draft/issued directive:**
latest editable draft, latest approved version, latest issued version and accepted version must remain distinguishable whenever they differ. A generic “current version” must never erase these semantics.

**Immutability directive:**
an issued ProposalVersion is immutable for commercial terms, line items, packages, party snapshots, pricing, currency, expiry and recipient evidence. Changes create a new ProposalVersion.

**Commercial-snapshot directive:**
line items and package terms are snapshotted into the exact ProposalVersion. Later Product/Package catalog changes never rewrite previously proposed terms.

**Money directive:**
all Proposal calculations are decimal-safe and currency-aware. Library aggregates must never naïvely combine different currencies or expose financially restricted values.

**CRM directive:**
Company, Contact, Client and Deal remain canonical domains. Proposal list/detail can show current contextual summaries while exact historical issued party/recipient snapshots remain version-bound.

**Historical-party directive:**
Contact email/title changes, Company rename/merge and later Client relationship changes never rewrite who received or was party to an issued Proposal.

**Deal directive:**
Design 096 remains authoritative for Deal stage/lifecycle. Proposal draft/sent/viewed/accepted/declined/expired state never silently changes Deal stage without an explicit governed Deal command.

**Approval directive:**
Design 029 remains canonical Approval infrastructure. Internal ApprovalRequest binds an exact ProposalVersion and remains distinct from issue, recipient viewing and client acceptance.

**Acceptance directive:**
client acceptance records the exact issued ProposalVersion, accepting party/evidence and time. A mutable `proposal.accepted=true` without version lineage is insufficient.

**Delivery directive:**
Proposal issued/sent, provider accepted, delivered, viewed and accepted remain separate state dimensions. Unknown delivery outcome must never be interpreted as confirmed failure/success.

**Expiry directive:**
Proposal expiry semantics belong to the exact issued context/version and remain separate from Deal lifecycle. Expiry does not automatically mean Deal lost.

**Artifact directive:**
generated PDF/file is an Asset/FileVersion representation of an exact ProposalVersion and never substitutes for the version itself. Artifact regeneration must not create false commercial revision history.

**Contract directive:**
Designs 019/099–100 remain canonical Contract infrastructure. Accepted ProposalVersion may explicitly seed a Contract/ContractVersion snapshot, but Proposal acceptance never equals Contract signing/execution.

**Handoff directive:**
Proposal→Contract lineage must preserve exact accepted ProposalVersion. Contract creation is idempotent and must not dynamically depend on later Proposal drafts.

**Ownership directive:**
Proposal owner remains operational responsibility and never implies Deal ownership, approval authority or broader authorization.

**Authorization directive:**
Proposal list access, full Proposal read, commercial values, drafting, issuing, approvals, acceptance information and artifact downloads remain separately server-authorized. Collection APIs must not send hidden commercial data merely for frontend hiding.

**Query directive:**
library filtering, sorting, counts and pagination occur server-side over the actor's authorized Proposal universe. Filters/sorts on sensitive fields cannot become information side channels.

**Concurrency directive:**
draft/version editing uses optimistic concurrency; issuance and acceptance use revision/idempotency controls so competing edits/actions cannot corrupt commercial history.

**Idempotency directive:**
Proposal issuance, acceptance recording and Proposal→Contract handoff must all be replay-safe. Network retry or double-click cannot create duplicate client sends, acceptances or Contracts.

**Partial-failure directive:**
Proposal core/version summary remains visible when Deal, Company, Approval, artifact or Contract services fail. `Unavailable` never silently becomes `No Approval`, `No Contract`, `No Artifact`, or Proposal-not-found.

**Search directive:**
Design 079 may index safe Proposal metadata but must not expose confidential full text, pricing, terms or commercial evidence beyond current authorization.

**Caching directive:**
Proposal Library caches vary by membership, authorization revision, query/filter/sort, Proposal revisions and commercial-access level. A privileged commercial list cannot be reused for lower-permission users.

**Performance directive:**
use cursor pagination, indexed Proposal summary queries, batched Deal/Company/Approval/Contract projections and derived summary fields rather than N+1 loading complete Proposal documents.

**Audit directive:**
material Proposal/version changes, approvals, issuance, acceptance processing, cancellation/supersession and Contract handoff generate appropriate Audit evidence while source domains retain their own canonical Audit history.

**Future-reuse directive:**
Design 098 must review/approve exact ProposalVersions from this same Proposal domain. Designs 099–100 must consume exact accepted Proposal lineage rather than inventing parallel Contract handoff state.

**Overlap directive:**
Designs **016–019, 029–030, 096–100** must share one continuous **Deal → Proposal → ProposalVersion → Approval → Issue/Acceptance → Contract** lineage while keeping commercial document, Approval, Deal stage, artifact, and legal execution lifecycles independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROPOSAL LIBRARY FOUNDATION — CANONICAL PROPOSAL IDENTITY + IMMUTABLE VERSIONED COMMERCIAL SNAPSHOTS + DISTINCT LATEST-DRAFT/LATEST-ISSUED/ACCEPTED VERSION REFERENCES + CANONICAL DEAL/COMPANY/CONTACT/CLIENT LINKS + EXACT APPROVAL/ISSUE/ACCEPTANCE LINEAGE + ASSET-BACKED RENDERED ARTIFACTS + IDEMPOTENT PROPOSAL→CONTRACT HANDOFF + PERMISSION-SAFE PAGINATED LIBRARY PROJECTIONS — AND NEVER ALLOW LIST ROWS, CURRENT CRM VALUES, CURRENT PACKAGE PRICING, GENERIC STATUS BADGES, DELIVERY TRACKING OR LATER DRAFTS TO REWRITE HISTORICAL PROPOSAL TERMS OR SUBSTITUTE FOR DEAL/CONTRACT STATE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **97 / 153** |
| **PASS**                                   |                         **97** |
| **STANDARDIZE decisions**                  |                         **95** |
| **Potential implementation-overlap flags** |                         **88** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**97 / 153 = 63.4% audited.**

### Canonical Proposal architecture after Design 097

```text
                         DEAL
                          │
                          ↓
                       PROPOSAL
                  stable document identity
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
       Version 1       Version 2        Version 3
                                          │
                                 exact commercial snapshot
                                          │
                      ┌───────────────────┼──────────────────┐
                      ↓                   ↓                  ↓
                 Line Items        Package Snapshot    Party Snapshot
                                          │
                                          ↓
                                      Approval
                                          │
                                          ↓
                                        Issue
                                          │
                              ┌───────────┼───────────┐
                              ↓           ↓           ↓
                          Delivered     Viewed      Accepted
                                                      │
                                                      ↓
                                                   CONTRACT
```

The version boundary is now strict:

```text
Proposal P-100

v3 = ISSUED TO CLIENT
$10,000

v4 = CURRENT INTERNAL DRAFT
$12,000

The library must not claim:
“Client Proposal = $12,000”

unless v4 is actually issued under the
canonical Proposal workflow.
```

The commercial snapshot rule is equally important:

```text
Package price today:
$1,500

Proposal v3 issued last month:
$1,000

v3 REMAINS $1,000.

Current catalog pricing never rewrites
historical ProposalVersion terms.
```

And the Proposal-to-Contract lineage remains explicit:

```text
Proposal P-100
      ↓
ProposalVersion v3
      ↓
Client accepts v3
      ↓
Acceptance A-1
      ↓
Contract C-200
      ↓
ContractVersion v1

Proposal acceptance
        ≠
Contract execution.
```

## Next Sequential Audit Target

### **Design 098 — Proposal Review / Approval Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
