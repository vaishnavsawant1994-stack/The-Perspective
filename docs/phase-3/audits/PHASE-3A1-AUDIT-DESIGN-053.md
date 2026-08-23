# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 053 — Client Contracts

Design 053 should become the **canonical Client Portal contract collection and contract-status workspace** for legal/commercial agreements that the authenticated Client Portal member is explicitly authorized to view or act on.

It must reuse the canonical Contract infrastructure established by **Design 019** while keeping contract identity, versioning, approval, signing, signer identity, provider events, and legal execution state rigorously separated.

The governing boundary is:

> **Proposal ≠ Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ ApprovalRequest ≠ SignatureRequest ≠ SignatureEvent ≠ Contract Execution State.**

| Audit field                              | Classification                                                                                                                |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                            | **053**                                                                                                                       |
| **Canonical name**                       | **Client Contracts**                                                                                                          |
| **Product area**                         | Client Portal / Contracts / Commercial / Legal                                                                                |
| **User surface**                         | **Client Portal**                                                                                                             |
| **Screen class**                         | Client-Safe Contract Library / Execution Status Workspace                                                                     |
| **Classification**                       | **Portal Workspace Variant — Contract & Agreement Family**                                                                    |
| **Primary purpose**                      | Let authorized Client users discover, review and track Client-visible Contracts and enter the correct detail/signing workflow |
| **Primary canonical entity**             | **Contract**                                                                                                                  |
| **Version entity**                       | **ContractVersion**                                                                                                           |
| **Party entity**                         | **ContractParty**                                                                                                             |
| **Signer entity**                        | **Signer / ContractSigner**                                                                                                   |
| **Signing workflow**                     | **SignatureRequest**                                                                                                          |
| **Evidence/events**                      | **SignatureEvent**                                                                                                            |
| **Formal approval dependency**           | ApprovalRequest / ApprovalDecision — Designs 029/052                                                                          |
| **Proposal dependency**                  | Design 018                                                                                                                    |
| **Canonical Contract foundation**        | Design 019                                                                                                                    |
| **Future Contract library overlap**      | Design 099                                                                                                                    |
| **Future internal detail overlap**       | Design 100                                                                                                                    |
| **Client signing/detail specialization** | Design 070                                                                                                                    |
| **Finance relationship**                 | Design 054 / Designs 020, 101–103                                                                                             |
| **Renewal relationship**                 | Design 057                                                                                                                    |
| **Asset dependency**                     | Design 030 / 051                                                                                                              |
| **Parent shell**                         | `ClientPortalShell` — Design 002                                                                                              |
| **Primary read model**                   | `ClientContractsView`                                                                                                         |
| **Template family**                      | `ClientLegalDocumentLibraryTemplate`                                                                                          |
| **Composition**                          | `ClientContractsComposition`                                                                                                  |
| **Auth**                                 | Required                                                                                                                      |
| **Authorization**                        | Portal membership + Contract visibility + party/signer capability                                                             |
| **Implementation priority**              | **Critical Commercial / Legal**                                                                                               |
| **Reuse level**                          | **Extremely High with Design 019**                                                                                            |

The core architectural principle is:

> **A Client viewing a Contract does not automatically mean they are a Contract party, authorized signer, approver, or permitted to access every Contract version.**

---

# 1. Classification — Functional Responsibility

Design 053 should answer:

> **“Which agreements are associated with my authorized Client/account context, which exact Contract/version is current, what stage is each agreement in, whether anything requires action from me, and where can I safely open the Contract or continue signing?”**

Canonical architecture:

```text
Proposal
  ↓
Contract
  ↓
ContractVersion
  ↓
Contract Parties
  ↓
Signer configuration
  ↓
SignatureRequest
  ↓
Signature Events
  ↓
Execution Policy
  ↓
Contract Execution State
```

Design 053 primarily exposes the **collection/status layer**.

Detailed signing belongs later to **Design 070 — Client Contract Detail & Digital Signing**.

---

# 2. Reuse — Design 019 remains canonical

Design 019 already established the Contract domain.

Design 053 must reuse:

* Contract identity,
* ContractVersion,
* Contract parties,
* signer definitions,
* signature requests,
* signature events,
* version immutability,
* execution state,
* provider abstraction,
* Audit integration.

Correct:

```text
Canonical Contract Domain — Design 019
             │
      ┌──────┴──────┐
      ↓             ↓
Internal Contract   Client-safe Contract
Workspace           Workspace
Design 019          Design 053
```

There must not be a second `ClientContract` database.

---

# 3. Entities — Proposal ≠ Contract

Design 018 already established Proposal as a separate commercial document.

Correct flow can be:

```text
Proposal
   ↓ accepted / selected
Commercial handoff
   ↓
Contract
```

But a Proposal never simply becomes the same database row as the Contract.

---

# 4. Proposal acceptance ≠ Contract execution

A Client may accept commercial terms in a Proposal.

That does not mean:

> Contract Signed.

There can still be:

* legal drafting,
* ContractVersion creation,
* approval,
* signer routing,
* signatures.

---

# 5. Contract ≠ ContractVersion

`Contract` is the stable agreement identity.

Example:

```text
Contract
"Executive Media Partnership Agreement"
```

Versions might be:

```text
ContractVersion v1
ContractVersion v2
ContractVersion v3
```

Formal legal actions must point to an exact ContractVersion.

---

# 6. Issued ContractVersion should become immutable

Once a ContractVersion is:

* sent,
* formally approved,
* presented for signature,
* signed,

it must not be edited in place.

A contractual text change creates:

```text
ContractVersion v4
```

not a mutation of v3.

---

# 7. “Current Contract” must resolve intentionally

Design 053 may display a current Client-visible Contract version.

But internally:

```text
latest stored version
≠
current issued version
≠
current executable version
```

A newer internal Draft version should not silently replace the version the Client was asked to sign.

---

# 8. Exact version binding is mandatory

Dangerous:

```text
SignatureRequest
→ contractId
→ load latest ContractVersion
```

Correct:

```text
SignatureRequest
→ ContractVersion CV-3
```

---

# 9. Signed v3 ≠ signed v4

If ContractVersion v3 is fully executed and v4 is later created:

```text
v3 = executed
v4 = unsigned / new amendment or replacement context
```

The v3 evidence remains historically valid.

Do not migrate signatures automatically.

---

# 10. Contract amendment ≠ silent replacement

A later legal change may become:

* new ContractVersion,
* Amendment,
* addendum,

depending on legal/business model.

Do not simply overwrite executed legal text.

Exact legal-domain structure belongs to Phase 3D.

---

# 11. ContractParty ≠ Signer

A Contract party might be:

> TechNova GmbH

while the signer is:

> Michael Weber, CEO.

Therefore:

```text
ContractParty
≠
Signer
```

The organization/legal entity and the human authorized to sign remain distinct.

---

# 12. Client account ≠ ContractParty automatically

The CRM/Portal Client organization may correspond to a legal party, but that mapping should be explicit.

A Contract could involve:

* parent company,
* subsidiary,
* individual executive,
* The Perspective legal entity.

Do not infer legal party solely from Portal organization name.

---

# 13. ContractParty legal identity

Conceptually a ContractParty may preserve:

```text
legal name
party role
registered details where required
contract address
```

These are Contract-context legal facts.

They are not merely copied live from mutable organization profile every time the Contract renders.

---

# 14. Contract snapshot semantics matter

If Client company address changes next month:

an executed Contract should still reproduce the party details that existed on the executed version.

Historical legal artifacts need snapshot semantics.

---

# 15. Signer ≠ Portal user automatically

A Portal user may view Contracts but not be legally designated to sign them.

Correct:

```text
ClientPortalMembership
       ↓ optional authorized mapping
ContractSigner
```

Do not infer signer authority from login access.

---

# 16. Client Portal Admin ≠ Signer

Design 062 Client Portal administrator may manage Client users.

That does not automatically confer legal signing authority.

---

# 17. Job title ≠ signing authority

A user labelled:

> CEO

should not automatically become a Contract signer.

Signing authority must be explicit.

---

# 18. Viewer ≠ Signer

A Client's Finance or Legal viewer can potentially inspect a Contract while another executive signs it.

Therefore:

```text
contract.read
≠
contract.sign
```

---

# 19. Signer ≠ Approver

A person can:

* formally approve business terms,
* legally sign,
* do both,
* do neither.

Approval and signature are different capabilities and evidence.

---

# 20. ApprovalRequest ≠ SignatureRequest

Design 052:

```text
ApprovalRequest
→ formal organizational decision
```

Contract signing:

```text
SignatureRequest
→ legally meaningful signing action
```

They may happen sequentially.

They are not the same workflow.

---

# 21. Contract approval may precede signing

Example:

```text
ContractVersion v3
↓
Internal Legal Approval
↓
Client Business Approval
↓
SignatureRequest
↓
Execution
```

The exact policy can vary.

Architecture must not conflate these stages.

---

# 22. ApprovalDecision ≠ SignatureEvent

A Client clicking:

> Approve contract terms

creates an ApprovalDecision if formal approval is requested.

A Client applying a legally meaningful signature creates Signature evidence.

The records remain separate.

---

# 23. SignatureRequest should be first-class

Conceptually:

```text
SignatureRequest
├── ContractVersion
├── provider / signing mechanism
├── signers
├── signing order
├── requestedAt
├── expiresAt where relevant
├── state
└── provider reference
```

Exact schema belongs to Phase 3D.

---

# 24. SignatureRequest ≠ signer

One SignatureRequest can involve multiple signers.

```text
SignatureRequest
├── Signer A
├── Signer B
└── Signer C
```

Do not store:

```text
contract.signerEmail
```

as the entire signing model.

---

# 25. Signer identity needs strong attribution

Signing evidence should preserve enough identity context to reconstruct:

> Who signed?

Potentially:

* linked Portal identity,
* name,
* email used for signing,
* party represented,
* provider signer ID,
* authentication method where legally/policy relevant.

Exact fields Phase 3D.

---

# 26. Signing order

If signatures are sequential:

```text
Signer A
   ↓
Signer B
   ↓
Signer C
```

the backend controls eligibility.

Design 053 should not infer signing order from UI position.

---

# 27. Parallel signing

Some agreements may allow parallel signing.

Signing policy belongs to Contract/Signature workflow configuration—not screen logic.

---

# 28. SignatureEvent is evidence

Conceptually SignatureEvents might record provider/business events such as:

```text
sent
viewed
signer authenticated
signature applied
declined
expired
completed
```

Exact provider vocabulary must be normalized.

These events should be append-oriented evidence.

---

# 29. Provider event ≠ Contract state

A provider may say:

> envelope viewed.

That does not make:

```text
Contract = VIEWED
```

the only canonical truth.

Provider events feed the application execution-state resolver.

---

# 30. Provider completed ≠ legally valid automatically without validation

The application should validate that:

* expected ContractVersion was signed,
* required signers acted,
* provider result is authentic,
* resulting signed artifact is captured.

Only then should canonical execution state resolve appropriately.

---

# 31. SignatureEvent ≠ SignatureRequest state

Individual provider events can be many.

The SignatureRequest has an aggregate lifecycle.

Keep them separate.

---

# 32. Signer state ≠ Contract execution state

Example:

```text
Signer A = SIGNED
Signer B = PENDING
Contract = NOT FULLY EXECUTED
```

One signature does not necessarily execute the agreement.

---

# 33. Partially signed ≠ fully signed

Multi-party execution requires explicit aggregate state.

Avoid a simple:

```text
contract.signed = true
```

Boolean.

---

# 34. Sent ≠ viewed

The Contract may be sent without being opened.

Keep states separate.

---

# 35. Viewed ≠ signed

A Client opening the Contract must not update it to Signed.

Obvious, but critical for legal evidence.

---

# 36. Signed ≠ executed necessarily

Depending on required signers:

```text
one signer signed
≠
all required signatures collected
```

Canonical execution state resolves through signing policy.

---

# 37. Executed ≠ effective necessarily

Some Contracts may have:

* execution date,
* effective date,
* start date.

These are different legal/business concepts.

Do not assume signature timestamp always equals business start date.

---

# 38. Contract lifecycle dimensions

Conceptually distinguish:

```text
Document lifecycle
Signature workflow
Execution outcome
Business term/effective period
```

Do not compress everything into one giant Contract status enum.

---

# 39. Draft ≠ Sent

An internal Draft ContractVersion must not appear as Client-signable.

Only an intentionally issued version should enter the Client workflow.

---

# 40. Sent ≠ Client Library permission globally

A Contract may be sent to one designated signer while another Client Portal member cannot view it.

Contract visibility remains explicit.

---

# 41. Expired ≠ declined

If SignatureRequest expires:

```text
EXPIRED
≠
DECLINED
```

The signer did not necessarily reject the agreement.

---

# 42. Cancelled ≠ declined

If The Perspective cancels/voids an outstanding SignatureRequest:

that does not mean the Client declined.

---

# 43. Superseded ≠ cancelled historically

If ContractVersion v3 is replaced by v4:

v3 may become superseded for execution purposes.

Its history remains traceable.

---

# 44. Declined needs actor evidence

If a signer formally declines:

preserve:

* signer,
* timestamp,
* ContractVersion,
* reason where collected.

Do not reduce the whole history to:

> Contract rejected.

---

# 45. Design 053 is collection/status first

Design 053 should primarily handle:

* Client-visible Contract list,
* Contract title/type,
* Project/account context,
* exact current issued version,
* signature/execution state,
* action required,
* dates,
* open detail/sign workflow.

Design 070 owns deep Contract detail/signing.

---

# 46. Design 070 relationship

Later frozen:

**Design 070 — Client Contract Detail & Digital Signing**

Expected architecture:

```text
Canonical Contract Domain
        │
        ├── Design 053
        │   Client Contract library/status
        │
        └── Design 070
            Exact Contract detail/signing
```

One Contract/Signature engine.

No merge decision now.

---

# 47. Design 099 relationship

Later:

**Design 099 — Contract Library / Contract List**

Expected internal/external pairing:

```text
Contract
  ├── Design 053 Client-safe library
  └── Design 099 Internal Contract library
```

One Contract domain.

---

# 48. Design 100 relationship

**Design 100 — Contract Detail / Signing & Execution Detail**

Design 100 provides the internal operational view of:

* parties,
* signer routing,
* execution status,
* provider status,
* activity.

Design 070 provides Client-safe detail/signing.

Again:

> one backend, different audience projections.

---

# 49. Design 018 Proposal relationship

Accepted Proposal can seed Contract creation.

But:

```text
ProposalVersion
≠
ContractVersion
```

Even if some text/terms are carried forward.

Lineage should preserve where Contract originated.

---

# 50. Commercial handoff lineage

Conceptually:

```text
ProposalVersion
↓ accepted
Contract created
↓
ContractVersion
```

This supports traceability without merging document types.

---

# 51. Proposal amount ≠ Contract amount automatically

If legal/commercial terms changed before signing:

Contract terms become authoritative for Contract execution.

Do not continue displaying Proposal values as if legally final without explicit lineage.

---

# 52. Design 052 Approval relationship

A Client Action may be:

> Approve Contract v3.

Another may later be:

> Sign Contract v3.

These are different source actions.

Design 047 must deduplicate correctly without conflating them.

---

# 53. Client Action Resolver

Potential actions include:

```text
Review Contract
Approve Contract
Sign Contract
```

depending on workflow.

Each action retains source lineage:

```text
ApprovalRequest
or
SignatureRequest
```

---

# 54. Dashboard consistency

Design 041 may show:

> Contract requires your attention.

It must derive from the canonical Approval/Signature workflow.

No dashboard-specific `contractActionRequired` Boolean.

---

# 55. Project Detail consistency

Design 043 can summarize:

* current Contract,
* signing status,

only if the Portal member has Contract access.

---

# 56. Project access ≠ Contract access

A marketing participant may see Project progress while legal Contract visibility remains restricted.

Therefore:

```text
portal.projects.read
≠
portal.contracts.read
```

---

# 57. Contract access ≠ Finance access

The Contract may contain commercial amounts.

But Contract visibility does not automatically grant access to invoice/payment operations in Design 054.

The domains may overlap in values while permissions remain separate.

---

# 58. Design 054 relationship

Contract may define:

* package price,
* billing schedule,
* payment milestones.

Invoices then operationalize billing.

Correct:

```text
Contract commercial terms
        ↓
Billing rules / invoice generation
        ↓
Invoice
```

But:

```text
Contract
≠
Invoice
```

---

# 59. Changing an Invoice does not rewrite Contract terms

Finance corrections/reconciliation remain Finance domain operations.

Executed Contract evidence stays stable.

---

# 60. Design 057 Renewal relationship

Renewal/Continuation should refer back to:

* current/previous Contract,
* term dates,
* renewal eligibility,
* commercial relationship.

Design 057 should create new continuation/renewal commercial workflow rather than rewriting the original executed Contract.

---

# 61. Renewal ≠ Contract extension by mutable end date

Dangerous:

```text
oldContract.endDate += 1 year
```

which destroys original terms.

Prefer explicit:

* renewal,
* extension,
* amendment,

with traceable legal relationship according to product model.

---

# 62. Design 106 handoff relationship

Later:

**Client Conversion / Won Deal Handoff**

can initiate Contract/onboarding process.

It should reference the canonical Contract domain rather than creating another Contract record structure.

---

# 63. Contract artifact storage

The rendered Contract PDF/document should reuse Design 030:

```text
ContractVersion
      ↓
Asset / exact FileVersion
```

The business ContractVersion and stored FileVersion remain linked but distinct.

---

# 64. Signed artifact must be preserved

After execution, preserve the exact signed artifact returned/generated through signing infrastructure.

Never reconstruct the final signed agreement later from:

> current Contract template + signature image.

---

# 65. Unsigned artifact ≠ executed artifact

Conceptually:

```text
ContractVersion v3 document
       ↓
Signature process
       ↓
Executed Contract Artifact
```

Both can be retained with lineage.

---

# 66. Signature image ≠ legal signature event

Do not model e-signing as:

```text
paste PNG signature onto PDF
```

alone.

Legally meaningful signing requires provider/process evidence appropriate to the product's legal requirements.

---

# 67. Signature provider abstraction

Design 019 already established provider abstraction.

The core Contract domain should not hard-code itself around one vendor.

Conceptually:

```text
SignatureProvider
├── provider request
├── provider signer mappings
├── webhook/event ingestion
└── signed artifact retrieval
```

while the application's Contract model remains provider-neutral.

---

# 68. Provider credentials stay internal

Client sees:

> Sign Contract.

Never:

* OAuth tokens,
* API keys,
* provider account secrets,
* webhook identifiers.

---

# 69. Webhook/event security

Provider events that alter signature/execution state must be:

* authenticated/verified,
* idempotently processed,
* correlated to known SignatureRequest/signers.

Do not trust arbitrary inbound event payloads.

---

# 70. Duplicate webhooks

Signing providers often retry webhooks.

The same event must not produce duplicate:

* signatures,
* Contract transitions,
* Audit events.

Idempotency is critical.

---

# 71. Out-of-order provider events

Events can arrive out of order.

Example:

```text
completed event
then delayed viewed event
```

The application should not regress Contract execution state.

Event timestamps/provider sequence and canonical state rules matter.

---

# 72. Provider outage ≠ Contract cancelled

If e-sign provider is unavailable:

the Contract still exists.

Correct:

> Signing is temporarily unavailable.

Not:

> Contract cancelled.

---

# 73. Signed artifact retrieval failure ≠ signature undone

If provider confirms execution but signed-document retrieval is temporarily delayed:

the execution evidence and artifact-availability state should remain distinct.

---

# 74. Contract document unavailable ≠ Contract missing

Rendering/download failure is a localized infrastructure state.

Do not return an empty Contract list.

---

# 75. Contract search

Design 053 can search authorized Client-visible Contracts by:

* title,
* Project,
* safe contract reference,
* state.

Authorization must apply before search.

---

# 76. Search metadata is sensitive

Even a filename/title like:

> Executive Renewal Agreement — $150,000

can leak commercial information.

Never allow unauthorized autocomplete/search hits.

---

# 77. Filters

Possible frozen filters:

```text
Needs Action
Pending
Signed / Executed
Expired
Project
```

These are query/presentation state.

Not separate Contract tables.

---

# 78. Current vs historical Contracts

A Client may have:

* active agreement,
* past executed Contract,
* superseded unsigned Contract version,
* expired signing request.

Design 053 needs clear collection semantics without deleting history.

---

# 79. Historical Contract visibility

If the Portal permits historical agreements:

show only the Client-visible/authorized history.

Internal Contract drafts must remain invisible.

---

# 80. Contract retention

Executed legal agreements generally require strong retention.

The architecture should make hard deletion difficult where legal/audit policy requires preservation.

Exact retention period belongs to legal/implementation policy.

---

# 81. Contract deletion ≠ signing-request cancellation

Cancelling a pending SignatureRequest should never physically delete the Contract or its version.

---

# 82. Access revocation

If a Client user's Portal access or Contract entitlement is revoked:

future Contract retrieval/signing stops immediately.

Historical legal evidence remains in the canonical Contract domain.

---

# 83. Signer revocation

If a designated signer is removed before signing:

the SignatureRequest requires controlled reassignment/cancellation/policy handling.

Do not just change the email field silently.

---

# 84. Signer replacement history

Where signer replacement is supported, preserve:

```text
old signer
new signer
changed by
changed at
reason where required
```

Legal execution workflows demand traceability.

---

# 85. Identity change after signing

If the person's Portal profile later changes name/title:

the historical signed Contract must remain reconstructable using signing-time identity evidence.

---

# 86. Permissions Architecture

Potential Phase 3D Client capabilities may conceptually include:

```text
portal.contracts.read
portal.contracts.download
portal.contracts.view_history
portal.contracts.sign
```

and separately:

```text
portal.approvals.decide
```

Exact names later.

---

# 87. Read ≠ download

A Client may be permitted to review a Contract in-browser without exporting the underlying document in some workflows.

Keep:

```text
contract.read
≠
contract.download
```

where product policy requires.

---

# 88. Read ≠ sign

Repeated because critical:

```text
contract.read
≠
contract.sign
```

---

# 89. Sign ≠ approve

Likewise:

```text
contract.sign
≠
approval.decide
```

---

# 90. Sign capability ≠ eligibility for every Contract

Even with broad:

```text
portal.contracts.sign
```

the user must still be the currently eligible Signer for that ContractVersion/SignatureRequest.

---

# 91. Contract party membership ≠ signer eligibility

A person working for a ContractParty organization is not automatically allowed to sign.

Explicit Signer configuration remains authoritative.

---

# 92. Download authorization must recheck current access

As with Design 051:

```text
download request
↓
authenticate
↓
authorize exact ContractVersion/artifact
↓
controlled download
```

Do not rely only on stale page rendering.

---

# 93. Contract activity

Design 063 can later show Client-safe events such as:

```text
Contract sent for signature
Contract signed by Client
Contract fully executed
```

Activity references Contract events.

It does not own Contract execution.

---

# 94. Notifications

Potential Notifications:

```text
Contract ready for review
Contract ready for signature
Signature reminder
Contract fully executed
Signature request expired
```

Notification read state remains independent from Contract/signing state.

---

# 95. Audit integration

Contract/signing is a high-value Audit domain.

Important events can feed Design 039:

```text
ContractVersionIssued
ContractSentForSignature
SignerAdded/Replaced
SignatureRecorded
SignatureDeclined
SignatureRequestCancelled
ContractExecuted
```

with actor/provider/correlation context.

---

# 96. Audit ≠ Signature evidence

Audit provides accountability.

SignatureEvent/provider evidence provides signing evidence.

Executed artifact provides legal document evidence.

These should reference each other but not be collapsed.

---

# 97. State Coverage

Design 053 inherits Design 150 plus Contract-specific states such as:

```text
Contracts Loading
Contracts Available

No Contracts
No Contracts Matching Filters

Contract Draft — internal, normally not Client-visible
Contract Issued
Contract Viewed

Approval Required
Approval Completed

Signature Required
Waiting for Another Signer
Partially Signed
Fully Signed / Executed

Signature Declined
Signature Request Expired
Signature Request Cancelled

ContractVersion Superseded
Historical Contract

Executed Artifact Available
Executed Artifact Processing / Temporarily Unavailable

Download Available
Download Restricted

Signing Provider Unavailable
Signature Status Syncing

Contract Restricted
Signer Not Authorized
Access Revoked

Contract Updated Elsewhere
Partial Service Failure
```

These are **not** one giant `contract.status`.

---

# 98. No Contracts ≠ service unavailable

If authorized query succeeds and returns none:

> No Contracts are currently available.

If Contract service fails:

> Contracts are temporarily unavailable.

---

# 99. No action ≠ waiting on another signer

A Contract can still be pending execution while the logged-in member has nothing to do.

Do not place it in their `ClientActionView` unless their action is currently required.

---

# 100. Viewed ≠ action completed

Opening the Contract does not resolve:

* ApprovalRequest,
* SignatureRequest.

---

# 101. Provider sync unknown ≠ unsigned

If provider synchronization is delayed:

do not display:

> Unsigned

as certain.

Use a synchronization/degraded state where needed.

---

# 102. Signed ≠ signed artifact immediately available

Execution evidence and document retrieval can complete at slightly different times.

Design 053 should not conflate them.

---

# 103. Responsive Behavior — Desktop

Desktop should preserve a clear Contract library:

```text
Client Contracts
↓
Summary / Action Required
↓
Search / Filters
↓
Contract List / Cards
    ├── Contract title
    ├── Project/context
    ├── current Client-visible version
    ├── parties / safe signer context
    ├── issued/effective dates where applicable
    ├── contract/signature state
    └── View / Review / Sign
↓
Executed / Historical Contracts
```

Design 053 remains a collection/status experience.

---

# 104. Responsive — Tablet

Following Design 152:

* Contract table converts to cards where needed,
* exact version/state remains visible,
* signer/action information stays prominent,
* legal/commercial metadata stacks cleanly,
* Contract detail opens in focused view.

---

# 105. Responsive — Mobile

Priority:

```text
Contracts
↓
Needs Your Action
↓
Contract Card
   ├── Contract title
   ├── Project
   ├── Exact version
   ├── State
   ├── Due/expiry where applicable
   └── Review / Sign
↓
Other Active Contracts
↓
Executed / History
```

No dense desktop legal table should be horizontally compressed.

---

# 106. Mobile signing safety

Before sending the Client into signing, clearly identify:

* Contract title,
* ContractVersion,
* legal party,
* their signer role where relevant.

Do not use an ambiguous repeated:

> Sign

button without context.

---

# 107. Accessibility

Contract state must use explicit labels such as:

> Signature required
> Waiting for The Perspective signature
> Fully executed August 18
> Signature request expired

Do not rely solely on colored status chips/icons.

---

# 108. Backend Query Model

Conceptually:

```text
ClientContractsView
├── current Portal membership
├── authorized Contracts
├── Client-visible ContractVersion summaries
├── safe ContractParty information
├── current Signer eligibility
├── Approval summary where applicable
├── SignatureRequest state
├── aggregate execution state
├── signed/executed artifact availability
├── Project/context
├── permitted actions
├── filters/pagination
└── partial-provider state
```

This is a Client-safe read composition.

---

# 109. ClientContractSummary

A compact DTO can conceptually contain:

```text
ClientContractSummary
├── contractId
├── contractVersionId
├── safe title/reference
├── Project/context
├── Client-visible parties
├── execution/signature state
├── current-user action requirement
├── relevant dates
├── signed artifact availability
└── available actions
```

No provider secrets or internal legal notes.

---

# 110. Mutation Architecture

Client-side high-value actions should remain explicit:

```text
decideApproval()             // when formal approval exists
beginContractSigning()
complete/sign through authorized flow
declineSignature()           // only if supported
```

Internal operations may include:

```text
createContractVersion()
issueContractVersion()
createSignatureRequest()
replaceSigner()
cancelSignatureRequest()
```

No generic Contract mega-PATCH.

---

# 111. Prohibited mutation

Avoid:

```text
PATCH /client/contracts/:id
{
  approved: true,
  signed: true,
  signer: "...",
  status: "active",
  projectStage: "next"
}
```

This would collapse:

* Approval,
* Signature,
* Contract,
* Project,
* signer identity

into one unsafe command.

---

# 112. Backend Architecture

```text
Design 053
    ↓
ClientPortalSessionContext
    ↓
Contract Authorization
    ↓
Contract Query Service
    ↓
Contract
    ↓
Client-visible ContractVersion
    │
    ├── Contract Parties
    ├── Signers
    ├── Approval summary
    ├── SignatureRequest
    ├── SignatureEvents
    └── Executed Artifact
    ↓
ClientContractsView
```

Signing path:

```text
Eligible Signer
    ↓
SignatureRequest
    ↓
Provider / signing mechanism
    ↓
SignatureEvent ingestion
    ↓
Signer state evaluation
    ↓
Contract execution policy
    ↓
Executed Contract state
    ↓
Signed artifact + Audit
```

---

# 113. Backend Requirements

| Requirement                                       | Status                    |
| ------------------------------------------------- | ------------------------- |
| Client Portal authentication                      | **Critical**              |
| Active Portal membership                          | **Critical**              |
| Client/account isolation                          | **Critical**              |
| Contract-level authorization                      | **Critical**              |
| Canonical Contract reuse                          | **Critical**              |
| Immutable ContractVersion                         | **Critical**              |
| Client/Internal version visibility separation     | **Critical**              |
| ContractParty model                               | **Critical**              |
| Signing-time party snapshot                       | **Critical**              |
| Signer model                                      | **Critical**              |
| Signer/Portal-user distinction                    | **Critical**              |
| Explicit signing eligibility                      | **Critical**              |
| SignatureRequest                                  | **Critical**              |
| SignatureEvent history                            | **Critical**              |
| Multi-signer aggregate execution logic            | **Critical**              |
| Signing-order policy where required               | **Critical**              |
| Approval/Signature separation                     | **Critical**              |
| Proposal/Contract separation                      | **Critical**              |
| Exact-version signing binding                     | **Critical**              |
| Signed artifact preservation                      | **Critical**              |
| Asset/FileVersion integration                     | **Critical**              |
| Provider abstraction                              | **Critical**              |
| Verified/idempotent provider event ingestion      | **Critical**              |
| Out-of-order event resilience                     | **Critical**              |
| Declined/expired/cancelled/superseded distinction | **Critical**              |
| Execution vs effective-date separation            | **Required**              |
| Client Action Resolver integration                | **Critical**              |
| Project/workflow integration                      | **Required**              |
| Finance linkage                                   | **Required**              |
| Renewal lineage                                   | **Required**              |
| Permission-safe search                            | **Critical**              |
| Secure document download                          | **Critical**              |
| Notification integration                          | **Required**              |
| Activity integration                              | **Required**              |
| Audit integration                                 | **Critical**              |
| Historical actor/signer preservation              | **Critical**              |
| Access/signer revocation handling                 | **Critical**              |
| Partial provider/artifact failure                 | **Critical**              |
| Design 019 backend reuse                          | **Critical**              |
| Designs 070/099/100 infrastructure reuse          | **Critical architecture** |

---

# 114. Consolidation — Main Implementation Risks

Design 053 exposes several especially high-risk errors.

**Proposal/Contract conflation**
Accepted Proposal row simply becomes Contract.

**Contract/ContractVersion conflation**
Legal document edited in place after issuance.

**Latest-version signing bug**
SignatureRequest resolves to newest ContractVersion instead of issued version.

**Signature migration bug**
Signatures from v3 automatically appear on v4.

**ContractParty/Client Organization conflation**
Mutable CRM organization profile becomes historical legal-party truth.

**ContractParty/Signer conflation**
Legal entity and human signatory become one record.

**Portal user/Signer conflation**
Any logged-in Client user can sign.

**Portal Admin/Signer conflation**
Team-access administrator gets legal authority.

**Job title/signing-authority conflation**
“CEO” automatically grants signing rights.

**Viewer/Signer conflation**
Read permission enables signature action.

**Approver/Signer conflation**
Business approval becomes digital signature.

**ApprovalDecision/SignatureEvent conflation**
One formal action is used as evidence for another.

**SignatureRequest/SignatureEvent conflation**
Provider events overwrite signing-workflow identity.

**Signer state/Contract state conflation**
First signature marks multi-party Contract fully executed.

**Signed/executed conflation**
One signer's signature interpreted as complete execution.

**Execution/effective-date conflation**
Signature timestamp becomes business start date automatically.

**Sent/viewed/signed conflation**
Simple document opening changes execution status.

**Expired/declined conflation**
No response interpreted as legal rejection.

**Cancelled/declined conflation**
Sender cancellation blamed on signer.

**Superseded/cancelled deletion**
Old Contract version/history disappears.

**Provider state/application state conflation**
Webhook field directly becomes canonical Contract status.

**Duplicate provider webhook processing**
One provider event generates multiple signature records.

**Out-of-order webhook regression**
Late “viewed” event regresses executed Contract.

**Provider outage/Contract cancellation conflation**
Integration failure alters legal lifecycle.

**Signed-artifact recreation**
Final Contract later reconstructed from template instead of preserving executed artifact.

**Signature-image/e-signature conflation**
Pasted image is treated as sufficient legal evidence.

**Project/Contract permission conflation**
Any Project viewer accesses legal documents.

**Contract/Finance permission conflation**
Contract access exposes invoice/payment operations automatically.

**Asset/Contract permission bypass**
Generic Client Files access reveals restricted Contracts.

**Renewal/original Contract mutation**
Renewal destroys original term history.

**Action-count duplication**
Approval and SignatureRequirements become duplicate generic Client Requests.

**Generic Contract PATCH**
One endpoint changes legal document, signature, approval and Project stage.

**Contract history/Audit conflation**
Business legal history and forensic Audit become one brittle record.

**053/070 duplicate Client Contract engines**
List and signing detail receive separate Contract backends.

**053/099/100 duplicate Contract domains**
Internal Contract library/detail create separate models.

No new design is required.

These are **legal-document identity, exact-version, signer authority, provider integration, execution, evidence, authorization, and retention requirements**.

# Design 053 Audit Verdict

## **PASS — CLIENT CONTRACT LIBRARY & LEGAL EXECUTION STATUS ANCHOR**

**Domain directive:** **Proposal ≠ Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ ApprovalRequest ≠ SignatureRequest ≠ SignatureEvent ≠ Contract Execution State.**

**Reuse directive:** Design 019 remains the single canonical Contract domain. Designs 053, 070, 099 and 100 must consume the same Contract/Version/Party/Signer/Signature infrastructure with different Client/internal projections.

**Proposal directive:** Proposal acceptance may initiate Contract creation but never turns the Proposal record itself into the legal Contract.

**Version directive:** ContractVersions become immutable once issued for approval/signature/execution; legal text changes always produce explicit new-version/amendment semantics.

**Exact-subject directive:** ApprovalRequests and SignatureRequests always bind to one exact ContractVersion. Neither signatures nor approvals automatically migrate to later versions.

**Party directive:** ContractParty represents the legal entity/individual party and preserves appropriate contract-time snapshot information independently from mutable CRM/Portal company data.

**Signer directive:** Signer is explicit and remains separate from Portal user, Client organization membership, job title and ContractParty.

**Authority directive:** Client Portal administration, Project access, Contract read access and signing authority remain independent concepts.

**Approval directive:** Design 052 formal Approval and Contract signing are separate workflows and evidence chains.

**Signature directive:** SignatureRequest identifies the signing workflow; SignatureEvents provide append-oriented evidence; individual signer state and aggregate Contract execution remain distinct.

**Execution directive:** partially signed, fully executed, expired, declined, cancelled and superseded remain distinct conditions/outcomes. A single Boolean `signed` is insufficient.

**Provider directive:** e-sign providers remain adapters. Verified/idempotent provider events feed the canonical Contract model but never replace it.

**Artifact directive:** the exact executed/signed Contract artifact must be preserved through Design 030's Asset/FileVersion infrastructure rather than reconstructed later.

**Finance directive:** Contract commercial terms and Invoice/Payment operations remain separate domains even when Finance derives from executed terms.

**Renewal directive:** Design 057 renewal/continuation must reference prior Contract lineage rather than silently modifying executed historical agreements.

**Action directive:** Design 047 surfaces Contract approval/signature actions through canonical ApprovalRequest/SignatureRequest lineage rather than a duplicate generic task state.

**Security directive:** Contract read, download, approve and sign remain independently authorized; knowing a Contract ID or belonging to the same Client account never grants signing authority.

**Audit directive:** Contract issuance, signer changes, signature events and execution are high-value Design 039 Audit activities while Signature evidence and Contract history remain domain records.

**Reliability directive:** contract missing, unauthorized, provider unavailable, artifact unavailable, status syncing, expired, cancelled, declined and fully executed remain separate states.

**Responsive directive:** desktop offers the comprehensive Client Contract library while mobile prioritizes contract identity → exact version → execution state → required action → safe review/sign entry.

**Overlap directive:** Designs **018–020, 029/052, 053–054, 057, 070, 099–100 and 106** must maintain explicit domain boundaries while sharing Contract identity/version, commercial lineage and controlled workflow integration.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE CONTRACT + CONTRACTVERSION + PARTY + SIGNER + SIGNATUREREQUEST + SIGNATUREEVENT + EXECUTION-STATE + EXECUTED-ARTIFACT INFRASTRUCTURE WITH PROVIDER ABSTRACTION AND STRICT APPROVAL/SIGNATURE SEPARATION — DO NOT BUILD SEPARATE CONTRACT OR DIGITAL-SIGNATURE BACKENDS FOR INTERNAL WORKSPACE, CLIENT PORTAL, CONTRACT DETAIL, RENEWAL OR BILLING.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **53 / 153** |
| **PASS**                                   |                         **53** |
| **STANDARDIZE decisions**                  |                         **51** |
| **Potential implementation-overlap flags** |                         **44** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**53 / 153 = 34.6% audited.**

### Canonical Contract architecture after Design 053

```text
             PROPOSAL — Design 018
                      │
               accepted/handoff
                      ↓
                  CONTRACT
                  Design 019
                      │
                      ↓
               CONTRACT VERSION
                      │
          ┌───────────┼─────────────┐
          ↓           ↓             ↓
       Parties     Approval      Signature
                       │             │
                ApprovalRequest   Signers
                ApprovalDecision     │
                                     ↓
                              SignatureRequest
                                     │
                                     ↓
                              SignatureEvents
                                     │
                                     ↓
                              Execution Policy
                                     │
                                     ↓
                              Executed Contract
                                     │
                                     ↓
                            Exact Signed Artifact
```

The audience architecture becomes:

```text
                 ONE CONTRACT DOMAIN
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
 Design 053          Design 070       Designs 099/100
 Client Library      Client Detail     Internal Library/
                     & Signing          Execution Detail
```

# Next Sequential Audit Target

## **Design 054 — Client Invoices & Payments**

Its frozen identity is already locked.

The next audit must preserve the core Finance boundary:

> **Invoice ≠ InvoiceVersion/Artifact ≠ InvoiceLine ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ Outstanding Balance.**

It must reconcile the canonical Finance foundation already established in **Design 020** with the Client Portal billing workspace while preserving:

* partial payments,
* multiple payments per invoice,
* outstanding vs overdue,
* currency precision,
* payment-provider abstraction,
* idempotent payment initiation,
* reconciliation as a separate financial process.

After Design 054 we continue strictly:

**055 Client Publishing & Distribution → 056 Client Reports & Downloads → 057 Client Renewal / Continuation Workspace → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
