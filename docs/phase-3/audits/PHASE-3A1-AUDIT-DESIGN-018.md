Correct. We continue strictly with the frozen **Design 018 — Proposal Builder / Proposal Detail**. No redesign, no additional screen, and no sequence change.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 018 — Proposal Builder / Proposal Detail

| Audit field                 | Classification                                                                                                                                            |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **018**                                                                                                                                                   |
| **Canonical name**          | **Proposal Builder / Proposal Detail**                                                                                                                    |
| **Product area**            | Sales / Commercial / Proposals                                                                                                                            |
| **User surface**            | Team Workspace                                                                                                                                            |
| **Screen class**            | Versioned Commercial Document Builder + Record Detail                                                                                                     |
| **Classification**          | **Unique Anchor — Versioned Commercial Document Workspace Family**                                                                                        |
| **Primary purpose**         | Build, review, approve, issue and track a commercial proposal tied to a Deal while preserving exactly which commercial version was presented and accepted |
| **Primary entity**          | **Proposal**                                                                                                                                              |
| **Core child entity**       | **ProposalVersion**                                                                                                                                       |
| **Supporting entities**     | Deal, Company, Contact, Product/Package, ProposalLineItem, User, ApprovalRequest, DocumentArtifact, Activity, Contract                                    |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                           |
| **Template family**         | `VersionedCommercialDocumentWorkspaceTemplate`                                                                                                            |
| **Auth**                    | Required internally; external/client access handled through explicit shared/portal mechanisms                                                             |
| **Permissions**             | Proposal read/create/edit/approve/send/acceptance-management + Deal/client scope                                                                          |
| **Implementation priority** | **Core / Critical**                                                                                                                                       |
| **Reuse level**             | **Extremely High**                                                                                                                                        |

---

# 1. Functional responsibility

Design 018 answers:

> **“What exactly are we offering this prospect, under what commercial terms, which version has been internally approved, which version did the prospect receive, and what happened after it was sent?”**

The canonical commercial chain is:

```text
Deal
Design 017
   ↓
Proposal
Design 018
   ↓
Internal approval if required
   ↓
Issued Proposal Version
   ↓
Viewed / client decision
   ↓
Accepted commercial version
   ↓
Contract preparation
```

The key rule is:

> **A Proposal is not merely an editable rich-text document. It is a versioned commercial business record.**

---

# 2. Proposal ≠ Proposal Version

This distinction is mandatory.

### Proposal

The logical commercial record.

Example:

**TechNova — Premium Magazine Proposal**

### ProposalVersion

One specific commercial version of that proposal.

```text
Proposal
│
├── Version 1
├── Version 2
├── Version 3
└── Version 4
```

Each version may differ in:

* price
* package
* benefits
* timeline
* scope
* payment terms
* content
* commercial conditions

Therefore:

```text
Proposal ≠ ProposalVersion
```

and client decisions must ultimately reference the exact version involved.

---

# 3. Why immutable versions are critical

Suppose Version 2 was sent with:

```text
Price: $1,000
Deliverables: A + B
Timeline: 30 days
```

The Sales team later edits the Proposal to:

```text
Price: $1,500
Deliverables: A + B + C
Timeline: 45 days
```

Version 2 must **not change retrospectively**.

Otherwise we lose the answer to:

> **What exactly did the client receive?**

The correct model is:

```text
Proposal
│
├── v2 — SENT — immutable
│
└── v3 — DRAFT — editable
```

---

# 4. Draft editing model

A draft Proposal Version can be edited.

Once issued/published/sent:

> **That exact version becomes immutable.**

Future edits should conceptually become:

```text
Sent v3
   ↓
Duplicate/create new draft
   ↓
Draft v4
   ↓
Edit
   ↓
Approval
   ↓
Send v4
```

Not:

```text
Open sent v3
↓
change price in place
```

---

# 5. Proposal lifecycle must not become one giant status

We need several distinct dimensions.

### Proposal record lifecycle

Conceptually:

```text
ACTIVE
ACCEPTED
REJECTED
CLOSED / ARCHIVED
```

where applicable.

### Version lifecycle

```text
DRAFT
APPROVED
ISSUED
SUPERSEDED
```

### Internal approval state

```text
NOT_REQUIRED
PENDING
APPROVED
REJECTED
```

### Delivery / recipient interaction

```text
NOT_SENT
SENT
DELIVERED
VIEWED
```

### Client decision

```text
PENDING
ACCEPTED
DECLINED
EXPIRED
```

Exact enums wait for Phase 3D.

The architectural requirement is:

> **Internal approval, sending state, viewing state and client acceptance must not all be represented by a single `proposal.status`.**

---

# 6. Internal approval ≠ client acceptance

This is particularly important.

```text
Internal Approval:
APPROVED

Client Decision:
PENDING
```

is perfectly valid.

Likewise:

```text
Internal Approval:
APPROVED

Client Decision:
DECLINED
```

These are completely different business decisions.

---

# 7. Proposal Builder regions

Without changing the approved design, implementation should normalize into reusable responsibilities.

### Proposal Header

* proposal identity
* related Deal
* Company / Contact
* owner
* version
* internal approval state
* sending/client state
* monetary total

### Builder content

Potential sections:

**Introduction / Executive Summary**
**Package / Offer**
**Scope / Deliverables**
**Pricing**
**Timeline**
**Benefits**
**Terms / Notes**

Exact sections remain tied to the approved design.

### Commercial line items

Structured package/product/pricing information.

### Preview

Represents exactly what the recipient will receive.

### Approval / send actions

* save draft
* request approval
* approve/reject if authorized
* preview
* send/share
* create new version

### History

* versions
* approvals
* sent/viewed activity
* decisions

---

# 8. Structured commercial data vs rich text

This is a major architectural requirement.

Do not represent the entire Proposal as:

```text
proposal.bodyHtml
```

with all pricing embedded invisibly in prose.

Important commercial information should be structured.

Conceptually:

```text
ProposalVersion
├── contentSections
├── lineItems
├── subtotal
├── discounts
├── total
├── currency
├── timeline
├── paymentTerms
└── additionalTerms
```

The builder can still support rich content, but canonical commercial data remains machine-readable.

---

# 9. Proposal line items

A reusable model might conceptually be:

```text
ProposalLineItem
├── title
├── description
├── quantity
├── unitPrice
├── amount
├── product/package reference
└── display order
```

Exact schema waits for Phase 3D.

This allows:

* reliable totals,
* reporting,
* Contract generation,
* Invoice generation,
* revenue attribution.

---

# 10. Product/package snapshot

Design 017 already established that master Product/Package data can change.

Therefore Proposal Version should not merely say:

```text
packageId = PREMIUM
```

and dynamically show today's package price/content forever.

Instead, issued versions need a commercial snapshot.

Conceptually:

```text
ProposalVersion
├── packageReference
└── packageSnapshot
     ├── name
     ├── deliverables
     ├── basePrice
     └── relevant terms
```

So if the master Package changes later, old Proposals remain historically correct.

---

# 11. Negotiated pricing

A Deal may start with:

```text
Package list price: $1,500
```

but the Proposal may offer:

```text
Negotiated price: $1,250
```

Therefore:

```text
Product price
≠
Deal amount necessarily
≠
Proposal offered total necessarily
```

Commercial lineage should preserve each context instead of silently overwriting master pricing.

---

# 12. Money precision

All Proposal calculations inherit the financial rules established in Design 007.

Use:

**currency-safe amount representation**

not casual floating-point calculations.

For example:

```text
subtotal
discount
tax where genuinely supported
total
currency
```

must be calculated canonically on the server as well as validated in the UI.

---

# 13. Client-side total is not authoritative

The builder may calculate totals instantly for UX.

But the final save/issue operation must calculate or validate commercial totals server-side.

Correct:

```text
UI preview total
      ↓
Submit
      ↓
Server canonical calculation
      ↓
Persist
```

The frontend must not be the sole authority for Proposal price.

---

# 14. Discount controls

If discounts exist, permission boundaries may be necessary.

For example:

```text
proposal.edit = allowed
discount.override = not allowed
```

A salesperson might create Proposal content without being able to approve a 50% discount.

Exact thresholds/policies belong later.

The architecture must support them.

---

# 15. Internal commercial approval

Proposal approval can be represented through the canonical Approval domain rather than an isolated boolean.

Conceptually:

```text
ProposalVersion
      ↓
ApprovalRequest
      ↓
Approver(s)
      ↓
Approved / Rejected
```

This enables:

* approver identity,
* timestamp,
* comments,
* audit history,
* policy-driven approvals.

---

# 16. Approval should be version-specific

This rule is critical.

If:

```text
Proposal v3
Approved
```

and someone creates:

```text
Proposal v4
with changed price
```

then:

> **v4 must not inherit v3's approval automatically.**

Conceptually:

```text
Approval → ProposalVersion v3
```

not merely:

```text
Approval → Proposal
```

unless the approved policy explicitly permits version-independent approval.

---

# 17. Material changes after approval

If a Draft Version changes after internal approval, the platform must decide whether approval becomes invalid.

A safe default architecture is:

```text
Draft approved
   ↓
material edit
   ↓
approval invalidated / new approval required
```

or prevent edits by creating another draft version.

This cannot be represented only through a visual green badge.

---

# 18. Preview vs issued document

The Preview is not yet an official client-facing artifact.

```text
Preview
≠
Issued Proposal
```

When a version is issued, the platform should produce or preserve the exact client-visible representation.

This may be:

* rendered HTML snapshot,
* PDF/document artifact,
* portal-rendered immutable version,

depending on implementation.

---

# 19. Document artifact

A useful canonical separation is:

```text
ProposalVersion
      ↓
RenderedDocumentArtifact
```

The ProposalVersion contains structured commercial data.

The artifact contains the generated representation shown/downloaded by the recipient.

This means regenerated artifacts can be traceable without making the PDF itself the only source of truth.

---

# 20. Sending ≠ acceptance

After issuance:

```text
Proposal Version
      ↓
SENT
      ↓
VIEWED
      ↓
CLIENT DECISION
```

A viewed Proposal is not an accepted Proposal.

Likewise:

```text
email delivered
≠
proposal viewed
```

These events should remain distinct.

---

# 21. Recipient tracking

The Proposal should know who it was issued to.

Conceptually:

```text
ProposalRecipient
├── contactId
├── email / delivery channel
├── issuedAt
├── viewedAt where supported
└── decision information where applicable
```

A Deal may have multiple Contacts, but client acceptance needs unambiguous authority and recipient context.

---

# 22. View tracking limitations

If view tracking is supported, it should be presented accurately.

For example:

> **Viewed**

should mean a canonical tracked event occurred.

It should not be inferred simply because an email was delivered.

Where privacy/security limitations make tracking uncertain, the UI should not overstate certainty.

---

# 23. Client acceptance must bind exact version

This is one of the most important rules in the entire audit.

Correct:

```text
Client accepts
Proposal Version v4
```

and the acceptance record preserves:

```text
proposalVersionId
actor/contact
timestamp
method
```

Incorrect:

```text
proposal.accepted = true
```

with no record of which terms were accepted.

---

# 24. Acceptance ≠ contract signature

Another mandatory distinction:

```text
Proposal Accepted
≠
Contract Signed
```

Proposal acceptance indicates:

> the client agrees with the commercial proposal sufficiently to progress.

Contract signature represents a separate legal execution event.

Therefore:

```text
Accepted Proposal
       ↓
Contract generation/preparation
       ↓
Contract signing
```

where applicable.

---

# 25. Contract generation must use accepted commercial snapshot

When creating a Contract:

```text
Accepted ProposalVersion
          ↓
Contract creation service
          ↓
Commercial snapshot mapped into Contract
```

Do not generate the Contract from:

> **whatever the latest editable Proposal currently contains**

if the client accepted an earlier version.

---

# 26. Proposal-to-Contract lineage

We should preserve:

```text
Deal
 ↓
Proposal
 ↓
Accepted ProposalVersion
 ↓
Contract
```

This enables later users to answer:

> **Which Proposal terms produced this Contract?**

without manually comparing PDFs.

---

# 27. Contract is still independent

After Contract creation, changes to the Contract should not mutate the historical accepted Proposal.

Similarly, changing a Proposal later should not mutate the Contract.

They are linked records with independent lifecycles.

---

# 28. Deal-stage relationship

Proposal activity may affect Deal progression.

For example:

```text
Proposal Sent
```

may make:

```text
Deal → Proposal Sent stage
```

a logical transition.

But:

> **The Proposal service should emit canonical events; the Deal domain decides valid stage transitions.**

Do not directly set `deal.stage = ...` from arbitrary Proposal UI code.

---

# 29. Proposal rejection/decline

A declined Proposal does not necessarily mean:

```text
Deal = LOST
```

The Sales team might:

* revise terms,
* create a new Proposal Version,
* negotiate,
* send another offer.

Therefore:

```text
Proposal Decision: DECLINED
Deal: still OPEN / NEGOTIATION
```

can be valid.

Again, separate lifecycles are essential.

---

# 30. Expiration

If Proposal expiry is supported:

```text
expiresAt
```

should be an explicit commercial property.

Then:

```text
decision = PENDING
AND
expiresAt < now
```

can derive:

**Expired**

rather than manually setting inconsistent state.

A later new Proposal version can be issued without deleting the expired history.

---

# 31. Proposal templates

The builder may use reusable Proposal Templates.

Conceptually:

```text
ProposalTemplate
       ↓
Create Proposal Draft
       ↓
ProposalVersion
```

Once instantiated, Proposal commercial data should not remain dynamically dependent on the current mutable Template.

Changing the Template tomorrow must not modify an existing Proposal.

---

# 32. Template ≠ Proposal

This mirrors Outreach Templates:

```text
Template
= reusable starting structure

Proposal
= client/deal-specific commercial record
```

Do not build Proposals as live references that render current Template content indefinitely.

---

# 33. Rich-text safety

Any rich text included in Proposal content needs:

* canonical sanitization,
* supported formatting schema,
* safe rendering,
* predictable export.

The backend should not blindly persist arbitrary executable HTML.

A structured editor format or sanitized content model is preferable.

---

# 34. Reusable builder components

Design 018 can reuse some general builder primitives discovered in Design 013:

`BuilderHeader`
`SaveStateIndicator`
`VersionSelector`
`PropertiesPanel`
`ValidationSummary`
`PreviewMode`
`UnsavedChangesGuard`

But Proposal-specific components include:

`ProposalSectionEditor`
`ProposalLineItemsEditor`
`PricingSummary`
`PackageSelector`
`CommercialTermsEditor`
`ProposalVersionBadge`
`ApprovalStatePanel`
`RecipientPanel`
`ProposalActivityPanel`

---

# 35. Builder reuse does not mean shared domain engine

This is important.

Design 013 and 018 can share low-level UI concepts:

```text
Version selector
Save state
Preview
Builder shell
Validation
```

but:

```text
Outreach Sequence Version
≠
Proposal Version
```

and:

```text
Sequence execution engine
≠
Proposal commercial document service
```

Never force both into one generic “workflow document” database because their UI looks similar.

---

# 36. Entity Detail reuse

Design 018 also inherits major patterns from Design 017:

`RecordHeader`
`RecordTabs`
`ActivityTimeline`
`RelatedEntityCard`
`OwnerControl`

Therefore Design 018 is best understood as a hybrid:

```text
EntityDetailWorkspace
       +
VersionedDocumentBuilder
       =
Proposal Builder / Detail
```

This is a powerful reusable composition pattern.

---

# 37. Relationship to Design 097 — Proposal Library

Later Design 097 provides:

**Proposal Library / Proposal List**

It should use the **same canonical Proposal records**.

Expected architecture:

```text
Canonical Proposal Domain
        │
        ├── Design 018
        │   Builder / one Proposal
        │
        └── Design 097
            Cross-Proposal Library
```

No separate proposal database.

---

# 38. Relationship to Design 098 — Proposal Review / Approval Detail

Later Design 098 focuses on:

**Proposal Review / Approval Detail.**

This produces another important overlap flag.

Expected:

```text
ProposalVersion
      ↓
ApprovalRequest
      │
      ├── Design 018
      │   approval status / request initiation
      │
      └── Design 098
          deeper review and approval operation
```

### Audit decision

**SHARE ONE APPROVAL MODEL — DO NOT MERGE SCREENS YET.**

We audit Design 098 later before deciding final implementation composition.

---

# 39. Approval reuse across product

Proposal Approval should preferably use the same lower-level approval architecture that later supports:

* project approvals,
* editorial approvals,
* design approvals,
* contract approval,
* publishing approvals.

Potential shared abstraction:

```text
ApprovalRequest
├── subjectType
├── subjectVersion/reference
├── requestedBy
├── approver
├── state
├── decision
└── timestamp
```

Domain rules remain specific.

---

# 40. Permission architecture

Potential future permissions include:

```text
proposal.read
proposal.create
proposal.edit
proposal.create_version
proposal.request_approval
proposal.approve
proposal.send
proposal.cancel
proposal.export
```

Commercial controls may additionally require:

```text
proposal.discount_override
proposal.price_override
```

Exact names belong to Phase 3D.

Important separation:

```text
EDIT
≠
APPROVE
≠
SEND
```

---

# 41. Creator must not always self-approve

Where approval policy requires separation:

```text
Proposal author
      ≠
Proposal approver
```

The system must be capable of enforcing this.

The UI hiding the Approve button is insufficient.

The backend Approval service must enforce policy.

---

# 42. Deal permission vs Proposal permission

A user able to view a Deal may not necessarily be allowed to:

**edit the Proposal**
**change pricing**
**approve discounts**
**send Proposal**

Related-record permission is independent.

Design 018 queries and commands must enforce Proposal authority directly.

---

# 43. Client-facing visibility boundary

Internal Proposal information may include:

* margin notes,
* approval comments,
* pricing rationale,
* internal negotiation notes.

These must not automatically become part of the recipient-facing version.

Conceptually:

```text
Internal Metadata
       ≠
Client-facing Proposal Content
```

This separation should be structural.

---

# 44. Recipient-facing artifact security

If a Proposal can be shared externally through a secure link or Client Portal:

access should use:

* authorization/token rules,
* expiration where applicable,
* revocation where supported,
* exact-version binding.

A shared link must not simply expose:

```text
/proposals/123
```

to the public without access control.

---

# 45. Proposal export

Downloading Proposal PDF/document can expose confidential commercial information.

Export requires:

* proposal access permission,
* version-specific export,
* audit/event logging where appropriate.

Exporting v3 must produce v3—not whichever Draft is currently newest.

---

# 46. Version comparison

The architecture should make it possible to determine differences between versions.

Conceptually:

```text
v3 → v4
```

changes might include:

**price changed**
**deliverable added**
**timeline changed**

This does not necessarily require a new screen.

It can be supported through canonical version data and later review UX.

---

# 47. Concurrency

Two users may edit the same Draft.

Example:

```text
User A changes price
User B removes deliverable
```

A stale save must not silently overwrite the other user's work.

Proposal Drafts therefore need:

**revision/version checks**

or another concurrency-control mechanism.

---

# 48. Autosave

Autosave can apply to Drafts.

But:

```text
AUTOSAVE ≠ ISSUE
AUTOSAVE ≠ APPROVE
```

It only persists working state.

Publishing/issuing a Proposal Version remains an explicit controlled operation.

---

# 49. Issue/send transaction

Sending should conceptually require:

```text
Draft complete
      ↓
Validation
      ↓
Approval policy satisfied
      ↓
Create/freeze issuable version
      ↓
Generate client artifact
      ↓
Recipient validation
      ↓
Send/share command
      ↓
Activity/audit
```

The exact sequence may vary, but issuance must be canonical and server-authoritative.

---

# 50. Validation requirements

Before Proposal issuance, canonical validation may check:

* Deal exists and is accessible
* recipient exists
* commercial total is valid
* currency exists
* required sections exist
* line items valid
* approval requirements satisfied
* version is issuable
* expiration/timeline is valid where supported

Frontend validation improves UX.

Backend validation determines truth.

---

# 51. Partial failure

Suppose:

```text
Proposal saved            ✓
Approval completed        ✓
PDF generation            ✓
Email sending             ✕
```

The system must not mark the Proposal as:

> Successfully delivered

merely because the artifact was created.

States should accurately show:

```text
Version issued
Delivery failed
```

with retry capability where appropriate.

---

# 52. Delivery retries

Repeated send attempts should not accidentally create different Proposal Versions unless the commercial content changed.

Retrying delivery of v4 means:

```text
send v4 again
```

not:

```text
create v5
```

This distinction simplifies history.

---

# 53. Idempotency

External send/share commands should be idempotent where possible.

Example:

```text
Send v4
 ↓
network timeout
 ↓
user retries
```

The platform should avoid accidentally generating duplicate delivery records or multiple unrelated artifacts.

---

# 54. Client acceptance race condition

Suppose the client accepts v4 while Sales has already started drafting v5.

That is valid.

The canonical accepted version remains:

```text
ACCEPTED = v4
```

The existence of Draft v5 must not magically transfer acceptance.

The system should clearly surface that a later draft exists but v4 is the accepted commercial version.

---

# 55. Multiple recipient decisions

If multiple client stakeholders can view a Proposal, the architecture needs explicit decision authority.

A viewer is not automatically an authorized accepter.

Potential model:

```text
ProposalRecipient
├── canView
└── canAccept
```

or equivalent policy.

Exact implementation belongs later.

---

# 56. Activity history

Important Proposal events include:

**Proposal created**
**Draft edited**
**Version created**
**Approval requested**
**Approval approved/rejected**
**Version issued**
**Proposal sent**
**Delivery failed**
**Proposal viewed**
**Proposal accepted**
**Proposal declined**
**Proposal expired**
**Contract created from accepted version**

These can feed Deal Activity and Proposal Activity.

---

# 57. Audit history

High-value audit events should preserve stronger metadata for:

**price changes**
**discount overrides**
**approval decisions**
**issuance**
**acceptance**
**Contract conversion**

Again:

**Activity ≠ Audit**

even if generated from the same domain event.

---

# 58. Responsive contract — Desktop

Desktop should preserve the approved builder/detail productivity layout:

**proposal structure + editing canvas + commercial/pricing controls + preview + version/approval context**

A wide workspace is appropriate here.

---

# 59. Responsive contract — Tablet

Following Design 152:

* editing stays 1–2 columns,
* section/navigation panels collapse,
* pricing remains readable,
* property panels become drawers,
* version/approval context remains visible,
* preview can switch into focused mode.

Touch interactions must not depend on hover.

---

# 60. Responsive contract — Mobile

Following Design 151, the Proposal should transform into a guided section-based editor:

```text
Proposal Summary
↓
Sections
↓
Pricing / Line Items
↓
Terms
↓
Review
↓
Preview / Approval / Send
```

Do not display a miniature desktop document canvas.

Mobile should preserve the workflow even if desktop remains the preferred complex editing environment.

---

# 61. Mobile client preview

Client-facing preview should prioritize:

**Proposal identity**
**Company / sender**
**Offer**
**Deliverables**
**Price**
**Timeline**
**Terms**
**Decision action where permitted**

Internal controls must never leak into the external preview.

---

# 62. State coverage

Design 018 inherits Design 150 plus Proposal-specific states:

**New Proposal / Empty Draft**
**Draft Saving**
**Draft Saved**
**Unsaved Changes**
**Validation Failed**
**Approval Required**
**Approval Pending**
**Approval Rejected**
**Approved**
**Generating Artifact**
**Sending**
**Delivery Failed**
**Sent**
**Viewed**
**Accepted**
**Declined**
**Expired**
**Superseded Version**
**Concurrent Edit Conflict**
**Permission Restricted**
**Related Deal Unavailable**
**Partial Service Failure**

These states must remain semantically separate.

---

# 63. Positive states vs system failure

For example:

> **Proposal not viewed yet**

is a normal commercial state.

It is not the same as:

> **view tracking service unavailable**.

Likewise:

> **Client declined Proposal**

is a legitimate business outcome.

It is not an application error.

---

# 64. Backend architecture

Recommended structure:

```text
Proposal Builder / Detail
          ↓
Proposal Query / Command Layer
          ↓
Tenant + Permission Scope
          ↓
Proposal Domain
          │
          ├── Proposal
          ├── ProposalVersion
          ├── LineItems
          ├── Commercial snapshots
          └── Recipients
          │
          ├── Approval Service
          ├── Document Rendering Service
          ├── Delivery Service
          └── Acceptance Service
          ↓
Deal / Company / Contact
          ↓
Contract creation handoff
```

---

# 65. Read model vs commands

Design 018 can use a rich composed read model:

```text
ProposalWorkspaceView
```

containing:

* Proposal core
* current Draft
* version history
* Deal summary
* recipients
* approval state
* delivery/activity

But commands remain specific.

For example:

```text
updateProposalDraft()
requestApproval()
approveProposalVersion()
issueProposalVersion()
sendProposalVersion()
recordAcceptance()
createContractFromAcceptedProposal()
```

Do not mutate one giant workspace payload.

---

# 66. Backend requirements

| Requirement                           | Status                                  |
| ------------------------------------- | --------------------------------------- |
| Authentication                        | **Required**                            |
| Tenant isolation                      | **Critical**                            |
| Proposal RBAC                         | **Critical**                            |
| Canonical Proposal entity             | **Critical**                            |
| Immutable Proposal Versions           | **Critical**                            |
| Draft revision/concurrency protection | **Required**                            |
| Structured commercial data            | **Critical**                            |
| Product/package snapshots             | **Critical**                            |
| Currency-safe calculations            | **Critical**                            |
| Server-side pricing validation        | **Critical**                            |
| Approval workflow                     | **Critical where policy requires**      |
| Version-specific approval             | **Critical**                            |
| Document rendering                    | **Required if artifacts/PDF supported** |
| Version-specific delivery             | **Critical**                            |
| Recipient/access control              | **Critical**                            |
| View-event tracking                   | Optional/support-dependent              |
| Exact-version acceptance              | **Critical**                            |
| Deal linkage                          | **Critical**                            |
| Contract lineage                      | **Critical**                            |
| Idempotent issuance/delivery          | **Required**                            |
| Activity history                      | **Required**                            |
| Audit history                         | **Required**                            |
| Partial failure handling              | **Required**                            |

---

# 67. Main implementation risks

The Design 018 audit flags several critical risks:

**Mutable sent Proposal**
Changing a previously issued commercial offer in place.

**Status overload**
Internal approval, sent/viewed state and client acceptance combined in one status.

**Unstructured pricing**
Commercial totals buried only in rich text.

**Master-package drift**
Old Proposal terms changing when a Product/Package is edited.

**Approval inheritance bug**
A changed/new Proposal Version incorrectly inheriting approval.

**Acceptance ambiguity**
Storing `accepted=true` without identifying which version was accepted.

**Proposal/Contract conflation**
Treating Proposal acceptance as legal Contract signature.

**Frontend-authoritative pricing**
Browser calculations becoming the only commercial truth.

**Internal-note leakage**
Approval comments/negotiation notes appearing in client-facing output.

**Template mutation**
Changing a reusable Template alters historical Proposals.

**Send retry duplication**
Network retries creating multiple versions/delivery records.

**Deal-stage coupling**
Proposal UI directly changing Deal stage without domain validation.

**Monolithic document blob**
Making reporting, Contract generation and Invoice mapping impossible.

None require a new design.

They require correct versioned commercial architecture.

# Design 018 Audit Verdict

## **PASS — VERSIONED COMMERCIAL DOCUMENT WORKSPACE ANCHOR**

**Template directive:** Design 018 establishes the reusable `VersionedCommercialDocumentWorkspaceTemplate`, combining Entity Detail and Builder patterns.

**Domain directive:** **Proposal ≠ ProposalVersion ≠ ProposalTemplate ≠ Contract.**

**Version directive:** Sent/issued Proposal Versions are immutable; new commercial changes create new Draft Versions.

**Commercial-data directive:** Pricing, package, deliverables and core terms remain structured canonical data rather than existing only inside rich text.

**Snapshot directive:** Issued versions preserve Product/Package and commercial snapshots so master-data changes do not rewrite history.

**Approval directive:** Internal approval binds to the exact Proposal Version being approved.

**Client-decision directive:** Viewing, acceptance, rejection and expiration remain separate from internal approval and delivery state.

**Acceptance directive:** Client acceptance must identify the exact commercial Proposal Version accepted.

**Contract directive:** Contract generation uses the accepted Proposal Version as its commercial lineage source; Proposal acceptance does not equal Contract signature.

**Pricing directive:** Canonical server-side money calculation and currency-safe storage are mandatory.

**Permission directive:** Edit, commercial override, approve and send capabilities remain independently enforceable.

**Reuse directive:** Designs **018, 097 and 098** must share one canonical Proposal/version/approval domain; later Contract builders may reuse structural document components but retain independent legal semantics.

**Consolidation directive:** **STANDARDIZE VERSIONED DOCUMENT + APPROVAL INFRASTRUCTURE — DO NOT MERGE PROPOSAL BUILDER, PROPOSAL LIBRARY, PROPOSAL APPROVAL DETAIL OR CONTRACT SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **18 / 153** |
| **PASS**                                   |                         **18** |
| **STANDARDIZE decisions**                  |                         **16** |
| **Potential implementation-overlap flags** |                          **9** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Reusable page families discovered

```text
InternalAppShell
│
├── Dashboard Family                  003–007
├── Data Acquisition Family           008–009
├── Data Quality / Enrichment         010
├── CRM List Workspace                011
├── Campaign Operations               012
├── Versioned Workflow Builder        013
├── Unified Communication             014
├── Action & Scheduling               015
├── Pipeline Board                    016
├── Entity Detail / 360               017
└── Versioned Commercial Document
    └── 018 Proposal Builder / Detail
```

The commercial chain is now structurally clean:

```text
LEAD
  ↓
OUTREACH
  ↓
REPLY
  ↓
MEETING
  ↓
DEAL
  ↓
PROPOSAL
  │
  ├── Draft Version
  ├── Internal Approval
  ├── Issued Version
  └── Client Acceptance
  ↓
CONTRACT
  ↓
INVOICE / PAYMENT
  ↓
CLIENT HANDOFF
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 019 Audit**

We should again retrieve **Design 019's exact frozen identity from the approved 153-design inventory first** before applying the same audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

