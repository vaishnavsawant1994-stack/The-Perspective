# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 099 — Contract Library / Contract List

Design 099 should become the **canonical Team Workspace Contract discovery, execution-summary, lineage, and agreement-library surface** over the Contract foundation already established by Design 019 and reused by Client Portal Designs 053 and 070.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Contract ≠ ContractVersion ≠ ContractTemplate ≠ ContractListEntry ≠ Proposal/ProposalVersion ≠ ContractParty ≠ Signer ≠ SignatureRequest ≠ SignatureEvent/Evidence ≠ Approval ≠ ContractLifecycle ≠ ExecutionState ≠ ExecutedArtifact.**

The central implementation rule is:

> **The Contract Library is a permission-safe collection projection over canonical Contracts. A Contract is the stable legal/commercial agreement identity; ContractVersions preserve exact terms; parties and signers remain separate; signature requests/events preserve execution evidence; and Proposal lineage, internal approval, signature progress, execution, expiry, cancellation, and generated artifacts must never be flattened into one generic mutable `status`.**

---

# 1. Classification

| Audit field                      | Classification                                                                                                                                                                 |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                    | **099**                                                                                                                                                                        |
| **Canonical name**               | **Contract Library / Contract List**                                                                                                                                           |
| **Product area**                 | Team Workspace / Sales / Contracts / Commercial Execution                                                                                                                      |
| **User surface**                 | **Authenticated Team Workspace**                                                                                                                                               |
| **Screen class**                 | Legal/Commercial Document Library / Collection Workspace                                                                                                                       |
| **Classification**               | **Canonical Contract Discovery, Version-Summary & Execution-Lifecycle Library Anchor**                                                                                         |
| **Primary purpose**              | Discover canonical Contracts, inspect their commercial/proposal lineage and current execution summary, and open the correct Contract without duplicating legal/execution state |
| **Primary entity**               | **Contract** — Design 019                                                                                                                                                      |
| **Version entity**               | **ContractVersion**                                                                                                                                                            |
| **List projection**              | **ContractListEntry / ContractSummaryView**                                                                                                                                    |
| **Template dependency**          | ContractTemplate, where canonical Contract workflow uses templates                                                                                                             |
| **Proposal dependency**          | Designs 018 / 097–098                                                                                                                                                          |
| **Deal dependency**              | Designs 016–017 / 096                                                                                                                                                          |
| **Company/Client dependency**    | Designs 021 / 084–085                                                                                                                                                          |
| **Party dependency**             | **ContractParty**                                                                                                                                                              |
| **Signer dependency**            | **Signer**                                                                                                                                                                     |
| **Signature dependency**         | **SignatureRequest + SignatureEvent/Evidence**                                                                                                                                 |
| **Approval dependency**          | Design 029 where applicable                                                                                                                                                    |
| **Executed artifact dependency** | Design 030 Asset/File infrastructure                                                                                                                                           |
| **Client Portal dependency**     | Designs 053 / 070                                                                                                                                                              |
| **Upcoming detail dependency**   | Design 100                                                                                                                                                                     |
| **Primary query service**        | `ContractLibraryQueryService`                                                                                                                                                  |
| **Contract service**             | `ContractService`                                                                                                                                                              |
| **Version service**              | `ContractVersionService`                                                                                                                                                       |
| **Execution service**            | `ContractExecutionService`                                                                                                                                                     |
| **Signature abstraction**        | `SignatureProviderService` / adapter registry                                                                                                                                  |
| **Parent shell**                 | `InternalAppShell` — Design 001                                                                                                                                                |
| **Auth**                         | Required                                                                                                                                                                       |
| **Authorization**                | Active OrganizationMembership + Contract/legal/commercial/signature permissions                                                                                                |
| **Implementation priority**      | **Critical Legal Lineage / Version Integrity / Signature Evidence / Commercial Handoff**                                                                                       |
| **Reuse level**                  | **Extremely High across Deals, Proposals, Client Portal, invoicing and onboarding**                                                                                            |

Design 099 should answer:

> **“Which canonical Contracts exist, which Deal/Proposal/Client each came from, which exact ContractVersion is current or issued, who the legal parties/signers are, what the current execution summary is, and which agreement should I open—without confusing the library projection with Contract identity or signature-provider state?”**

Canonical structure:

```text
Deal
  │
  ↓
Proposal
  │
  ↓
Accepted ProposalVersion
  │
  ↓
Contract
  │
  ├── ContractVersion v1
  ├── ContractVersion v2
  └── ContractVersion v3
           │
           ├── ContractParty[]
           ├── Signer[]
           ├── SignatureRequest[]
           ├── SignatureEvent[]
           └── ExecutedArtifact
                    │
                    ↓
             ContractListEntry
                    │
                    ↓
                Design 099
```

---

# 2. Reuse

## Design 019 remains the canonical Contract domain

Design 099 must use the exact canonical:

```text
Contract.id
```

established by Design 019.

Do not introduce:

```text
LibraryContract
ContractSummaryRecord
SignedContractRecord
ContractListContract
```

as parallel mutable business entities.

`ContractListEntry` is a read projection only.

---

## Design 053 remains the Client Portal Contract collection projection

Team Workspace and Client Portal must reference the **same Contract identity** where they represent the same agreement.

Correct:

```text
Contract C-100
   ├── Team library → Design 099
   └── Client portal → Design 053
```

Not two Contracts synchronized by application code.

---

## Design 070 remains the Client Contract detail/signing projection

Design 070 already established:

> **Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ SignatureRequest ≠ SignatureEvent/Evidence ≠ Approval ≠ ExecutedArtifact.**

Design 099 must preserve exactly that architecture in list form.

---

## Design 100 will specialize the same Contract

Design 100 must later open the same canonical `Contract.id` represented in Design 099.

Design 099 therefore cannot invent execution state that Design 100 independently recalculates differently.

---

## Proposal lineage reuse

Correct commercial lineage:

```text
Deal D1
  ↓
Proposal P1
  ↓
ProposalVersion PV3
  ↓ accepted
Contract C1
```

The Contract should retain exact Proposal/ProposalVersion lineage where applicable.

---

## Proposal ≠ Contract

Permanent.

Even if Contract initially derives terms from an accepted Proposal:

Contract becomes a distinct legal/commercial agreement entity with its own immutable versions and execution lifecycle.

---

## Proposal approval ≠ Contract approval/execution

Design 098 internal Proposal approval remains separate.

An internally approved Proposal does not mean a Contract exists.

---

## Proposal acceptance ≠ Contract signature

Permanent.

---

## Deal stage ≠ Contract lifecycle

Design 096 remains Deal-stage authority.

Contract state can inform Deal gates/closure policy.

It does not become Deal stage directly.

---

## Contract Library ≠ Signature provider dashboard

Design 099 may show normalized execution summary.

It must not expose provider-specific execution records as the Contract backend.

---

# 3. Entities

## Contract

`Contract` is the stable agreement identity.

Conceptually:

```text
Contract
├── id
├── organizationId
├── dealId
├── proposal lineage
├── client/company context
├── lifecycle
├── currentDraftVersionId
├── latestIssuedVersionId
├── executedVersionId where applicable
├── owner
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Contract ≠ ContractListEntry

Critical.

`ContractListEntry` may contain optimized summaries:

```text
ContractListEntry
├── contractId
├── reference/title
├── Company / Client
├── Deal summary
├── Proposal lineage summary
├── current/issued version
├── party summary
├── signer progress
├── execution summary
├── effective/expiry context
├── executed-artifact availability
└── updatedAt
```

but remains rebuildable/read-only.

---

## Contract ≠ ContractVersion

Permanent.

Example:

```text
Contract C-100
├── v1 — initial draft
├── v2 — revised terms
└── v3 — issued for signature
```

Contract remains stable.

Version records preserve exact terms.

---

## Latest draft ≠ latest issued ContractVersion

Critical.

Example:

```text
Issued = v3
Internal draft = v4
```

The Contract Library must not display v4 terms as though they are currently before the signers.

---

## Executed version ≠ latest draft

Even stronger.

Example:

```text
Executed version = v3
Current amendment draft = v4
```

The legally executed agreement remains v3 until a later governed version/amendment executes.

---

## Issued ContractVersion should be immutable

Once sent for signature:

do not mutate in place:

* legal terms,
* commercial terms,
* parties,
* signer requirements,
* effective dates,
* amount references,
* obligations.

Changes create a new ContractVersion / amendment flow as appropriate.

---

## Executed ContractVersion absolutely immutable

Permanent.

Executed terms are historical/legal evidence.

---

## ContractTemplate

If Contract templates are used:

```text
ContractTemplate
≠
Contract
≠
ContractVersion
```

Changing the reusable template cannot change existing ContractVersions.

---

## ContractParty

`ContractParty` represents the legal/commercial party to the agreement.

Conceptually:

```text
ContractParty
├── contractVersionId / agreement context
├── party type
├── canonical Company/Client reference where available
├── legal name snapshot
├── legal address snapshot
├── representative context
└── role
```

---

## ContractParty ≠ Company

Critical.

Current CRM Company identity can be linked.

But legal party evidence may need a version-bound snapshot.

---

## Current Company profile ≠ executed legal party snapshot

Example:

```text
At execution:
Acme Technologies Ltd.
123 Old Street

Later CRM:
Acme Global GmbH
456 New Street
```

The executed Contract must preserve the original legal-party evidence.

---

## ContractParty ≠ Signer

Permanent.

A party is bound by the agreement.

A Signer is a person authorized/required to sign on behalf of a party.

---

## One party may have multiple signers

Depending on signature policy.

---

## Signer

Conceptually:

```text
Signer
├── contractVersionId
├── partyId
├── person/contact reference where available
├── signer identity snapshot
├── signing role
├── signing order/group
└── eligibility/state
```

---

## Signer ≠ Contact

A Contact may be linked to a signer.

But Contract execution must preserve exact signer identity/evidence as it existed at signing time.

---

## Signer ≠ Portal User

Permanent.

A person signing through a secure signature flow does not automatically become a Client Portal user/member.

---

## Signer ≠ ContractParty

Permanent.

---

## Signer state ≠ Contract lifecycle

One signer completing does not necessarily execute the whole Contract.

---

## SignatureRequest

`SignatureRequest` represents a formal execution request for an exact ContractVersion/signing context.

Conceptually:

```text
SignatureRequest
├── contractVersionId
├── signer requirements
├── provider connection
├── provider envelope/request ID
├── requestedAt
├── expiry
└── lifecycle
```

---

## SignatureRequest ≠ ContractVersion

Permanent.

---

## SignatureRequest must pin exact ContractVersion

Absolute.

A request for v3 can never silently begin signing v4.

---

## Sending v4 for signature does not mutate request for v3

A new execution request/version lineage is required.

---

## SignatureEvent / Evidence

Provider callbacks/evidence may include:

* invitation sent,
* viewed,
* authenticated,
* signed,
* declined,
* expired,
* completed.

These remain signature-execution evidence.

---

## SignatureEvent ≠ Contract lifecycle directly

Canonical Contract execution state is resolved from:

* exact version,
* required signers,
* valid evidence,
* policy.

One provider event does not become the entire Contract state.

---

## Invitation sent ≠ viewed

Permanent.

---

## Viewed ≠ signed

Permanent.

---

## One signer signed ≠ Contract fully executed

Permanent unless only one signer is required.

---

## All required signatures present ≠ provider callback alone

Canonical resolver must verify the execution criteria.

---

## Signature provider “completed” ≠ trusted executed state blindly

Provider completion is strong evidence, but the platform should verify:

* expected ContractVersion,
* expected request/envelope,
* required signers,
* integrity/hash/evidence,

before recording canonical execution.

---

## ExecutionState

Execution should remain distinct from broad Contract lifecycle.

Conceptually:

```text
ExecutionState
├── Not Prepared
├── Ready
├── Sent for Signature
├── Partially Signed
├── Fully Signed / Verified
├── Declined
├── Expired
└── Failed / Needs Attention
```

Exact states follow Contract domain policy.

---

## ContractLifecycle ≠ ExecutionState

Possible:

```text
Contract lifecycle = ACTIVE
Execution state = FULLY SIGNED
```

or:

```text
Contract lifecycle = DRAFT
Execution state = NOT PREPARED
```

Do not overload one generic status.

---

## Executed Contract

Execution should bind:

```text
Contract
+
exact ContractVersion
+
valid signer evidence
+
execution time
+
executed artifact
```

---

## ExecutedArtifact

Conceptually:

```text
ContractVersion v3
      ↓
Signature execution
      ↓
ExecutedArtifact
      ↓
Asset / FileVersion
```

The signed file is immutable evidence of the executed ContractVersion.

---

## ExecutedArtifact ≠ ContractVersion

Permanent.

The file represents the legal version.

It does not replace the structured ContractVersion/business lineage.

---

## Regenerated draft PDF ≠ executed artifact

Absolute.

---

## ExecutedArtifact replacement requires controlled evidence semantics

Never silently overwrite a signed file with a later PDF generation.

---

## Contract approval

If an internal approval gate is required before signature:

reuse Design 029 Approval engine and target the exact ContractVersion.

---

## Contract approval ≠ Signature

Permanent.

---

## Contract approved ≠ sent for signature

Permanent.

---

## Contract executed ≠ effective necessarily

A Contract may be fully signed but have:

```text
effectiveDate = future date
```

Therefore:

> **Execution ≠ Effective state.**

---

## Effective ≠ expired

Permanent.

---

## Expiry / term end

Contract term/expiration semantics belong to the executed legal terms.

Do not confuse:

* signature-request expiry,
* Contract term expiry,
* cancellation/termination.

These are distinct.

---

## SignatureRequest expired ≠ Contract expired

Critical.

---

## Contract termination/cancellation ≠ signature decline

Permanent.

---

## Proposal lineage

Contract should preserve exact source ProposalVersion where applicable.

Current Proposal edits never rewrite the Contract.

---

## Commercial snapshots

If Contract inherits:

* package,
* amount,
* benefits,
* payment terms,

from Proposal,

those must become exact ContractVersion content/snapshots.

The Contract must not dynamically read current Proposal/Product values forever.

---

# 4. Permissions

Design 099 should conceptually distinguish:

```text
contract.read
contract.create
contract.editDraft
contract.createVersion

contract.parties.read
contract.parties.manage

contract.signature.read
contract.signature.send
contract.signature.cancel

contract.execution.read

contract.downloadDraft
contract.downloadExecuted

contract.archive
```

Exact keys belong to Phase 3D.

---

## Contract list visibility ≠ full legal-content access

A user could potentially see:

> Contract exists for Globex

while legal clauses or executed artifacts remain restricted.

---

## Contract read ≠ edit

Permanent.

---

## Edit draft ≠ send for signature

Critical.

---

## Send for signature ≠ approval authority

Permanent.

---

## Contract owner ≠ signature authority

Permanent.

---

## Deal owner ≠ Contract edit/signature authority

Permanent.

---

## Proposal owner ≠ Contract execution authority

Permanent.

---

## ContractParty management ≠ Company management

Changing legal-party snapshot/version context does not grant permission to edit canonical CRM Company.

---

## Signer management ≠ Contact management

Permanent.

---

## Signature-send permission ≠ executed-artifact download permission

Potentially separate.

Signed legal artifacts can be especially sensitive.

---

## Client Portal access ≠ internal legal comments/access

Designs 053/070 must receive safe Contract projections only.

---

## Contract read ≠ signer action permission

A user who can view the Contract cannot impersonate a signer.

---

## Signer authorization must be purpose-bound

Signing identity comes from the signature provider/workflow evidence, not a browser-submitted Team user ID.

---

## Direct ContractVersion ID reauthorizes

Permanent.

---

## Direct ExecutedArtifact ID reauthorizes

Permanent.

---

## Direct provider envelope ID is not authorization

Absolute.

---

## Cross-tenant Contract/Party/Signer/Provider references prohibited

Absolute.

---

## Library counts must be permission-aware

Restricted Contracts must not leak through counts.

---

## Commercial/legal fields in sorting/filtering require permission

A user should not infer confidential contract value or expiry through side-channel filters.

---

# 5. States

Design 099 must keep **Contract lifecycle, ContractVersion state, internal approval, signature-request state, signer state, aggregate execution state, effectiveness, expiry/termination, and artifact state** independent.

### Contract lifecycle

Conceptually:

```text
Draft
In Execution
Executed
Active
Terminated / Cancelled
Archived
```

Exact canonical states belong to Phase 3D.

### ContractVersion

```text
Draft
Approved for Execution
Issued for Signature
Executed
Superseded
Historical
```

### Approval

Canonical Design 029 states.

### Signature request

```text
Not Created
Prepared
Sent
Viewed
In Progress
Completed
Declined
Expired
Cancelled
Failed
```

### Signer state

```text
Pending
Invited
Viewed
Signed
Declined
Expired
```

### Aggregate execution

```text
Not Started
Awaiting Signatures
Partially Signed
Fully Signed
Verified Executed
Execution Failed / Needs Review
```

### Effectiveness

```text
Not Effective Yet
Effective
Expired / Term Ended
Terminated
```

### Artifact

```text
Draft Artifact Available
Executed Artifact Available
Artifact Generating
Artifact Unavailable
```

These must never collapse into one `contract.status`.

---

## Draft ≠ pending signature

Permanent.

---

## Approved ≠ sent for signature

Permanent.

---

## Sent ≠ viewed

Permanent.

---

## Viewed ≠ signed

Permanent.

---

## One signer signed ≠ fully executed

Permanent.

---

## All signers signed ≠ effective immediately necessarily

Permanent.

---

## Executed ≠ active/effective automatically

Effective date may differ.

---

## Signature request expired ≠ Contract expired

Critical.

---

## Signer declined ≠ Deal lost

Permanent.

---

## Contract terminated ≠ Contract deleted

Permanent.

---

## New ContractVersion ≠ old executed Contract invalidated automatically

Critical.

If a future amendment/replacement exists, legal supersession must be explicit.

---

## Latest draft exists ≠ executed version changed

Permanent.

---

## Executed artifact unavailable ≠ Contract not executed

Critical.

Storage outage does not change legal execution truth.

---

## Signature provider unavailable ≠ Contract unsigned

Critical.

---

## Company service unavailable ≠ Contract has no party

Critical.

---

## Proposal service unavailable ≠ Contract has no lineage

Critical.

---

## Library empty ≠ Contract query failure

Permanent.

---

## State Coverage

Design 099 inherits Design 150 plus:

```text
Contract Library Loading
Contract Library Available
Contract Library Empty
Contract Library Restricted
Contract Library Partial

Contract Draft
Contract In Execution
Contract Executed
Contract Active
Contract Terminated / Cancelled
Contract Archived

Latest Draft Version Available
Latest Issued Version Available
Executed Version Available
Newer Draft Exists

Approval Pending
Approval Approved
Approval Rejected
Approval Service Unavailable

Signature Not Started
Signature Request Prepared
Signature Request Sent
Signature In Progress
Signature Partially Complete
Signature Fully Complete
Signature Declined
Signature Request Expired
Signature Cancelled
Signature Provider Unavailable

Signer Pending
Signer Invited
Signer Viewed
Signer Signed
Signer Declined

Contract Not Effective Yet
Contract Effective
Contract Term Ended
Contract Terminated

Draft Artifact Available
Executed Artifact Available
Executed Artifact Unavailable
Artifact Service Unavailable

Proposal Lineage Available
Proposal Lineage Restricted
Proposal Service Unavailable

Contract Updated Elsewhere
Contract Version Conflict
Partial Contract Summary Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize Contract discovery while preserving legal/execution semantics.

Conceptually:

```text
Contract Library
↓
Contract rows
   ├── Contract identity
   ├── Company / Client
   ├── Deal / Proposal lineage
   ├── version context
   ├── parties
   ├── execution state
   ├── signer progress
   ├── effective/term context
   └── available frozen action
```

Only fields/actions present in frozen Design 099 should render.

---

## Version context must remain clear

Where relevant, distinguish:

> Executed v3 · Draft v4 exists

rather than showing ambiguous:

> Current v4.

This is critical for legal clarity.

---

## Signer progress and Contract lifecycle should not share one badge

Correct:

```text
Contract: In Execution
Signatures: 2 of 3 complete
```

rather than:

> Status: 2/3.

---

## Signature-request expiry and Contract expiry need different labels

Never render both as simply:

> Expired.

Use contextual semantics.

---

## Proposal/Deal remain supporting context

A Contract row should not look like another Deal/Proposal row just because those references are displayed.

---

## Tablet

Following Design 152:

* Contract table can become structured rows/cards,
* Company/Client and Contract identity remain primary,
* execution/signer progress stays visible,
* legal/version details can stack,
* sensitive action buttons remain deliberate.

---

## Mobile

Priority:

```text
Contract
↓
Company / Client
↓
Contract lifecycle
↓
Version context
↓
Signature progress
↓
Effective / expiry context
↓
Proposal / Deal lineage
↓
Primary frozen action
```

Do not compress a wide legal-document table horizontally.

---

## Mobile signature state

Prefer:

> 2 of 3 required signatures complete

rather than an unlabeled progress bar.

---

## Accessibility

A Contract row could communicate:

> Contract Executive Brand Partnership for Globex. Issued version 3. Two of three required signers have signed. Contract not yet fully executed. Related Proposal version 4. Effective date not yet applicable.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Contract Library architecture

```text
Design 099
    ↓
Authenticated Workspace Context
    ↓
ContractLibraryQueryService
    │
    ├── Contract summary
    ├── latest draft version summary
    ├── latest issued version summary
    ├── executed version summary
    ├── Company / Client safe projection
    ├── Deal / Proposal lineage
    ├── party summary
    ├── signer progress
    ├── normalized execution state
    ├── effective/term summary
    └── artifact availability
    ↓
ContractListEntry[]
```

---

## Query anchors on canonical Contracts

Conceptually:

```text
getContracts(
    currentMembership,
    filters,
    sort,
    cursor
)
```

Always over the actor's authorized Contract universe.

---

## Explicit version references

Where the domain allows simultaneous states, list summaries should distinguish conceptually:

```text
latestDraftVersionId
latestIssuedVersionId
executedVersionId
```

rather than one ambiguous:

```text
currentVersionId
```

---

## ContractVersion creation

Material legal/commercial edits create new ContractVersions.

Protected/issued/executed versions cannot be modified through generic CRUD.

---

## Optimistic concurrency

Draft editing/versioning uses expected revision semantics.

---

## Proposal-to-Contract creation

Conceptually:

```text
createContractFromProposal(
    proposalId,
    acceptedProposalVersionId,
    idempotencyKey
)
```

should:

1. authorize;
2. verify exact ProposalVersion lineage;
3. validate client/party context;
4. verify no equivalent Contract already exists for the same handoff intent;
5. create Contract;
6. create initial ContractVersion snapshot;
7. preserve Proposal/Deal lineage;
8. emit event/Audit.

---

## Contract creation idempotency

Retry must not produce duplicate Contracts.

---

## Proposal terms become ContractVersion snapshot

Do not keep Contract dynamically reading mutable Proposal fields.

---

## Internal Contract approval

Where required:

```text
ApprovalRequest
subject = exact ContractVersion
```

through Design 029.

Approval v1 never transfers silently to v2.

---

## Signature preparation

Conceptually:

```text
prepareSignatureRequest(
    contractVersionId,
    expectedContractRevision,
    signingPolicy,
    idempotencyKey
)
```

should:

1. authorize;
2. load exact ContractVersion;
3. ensure version is immutable/executable;
4. verify applicable approval/readiness;
5. freeze/validate parties and signer requirements;
6. generate exact signature artifact;
7. compute/record content integrity evidence;
8. create SignatureRequest;
9. invoke provider adapter;
10. store provider request/envelope linkage.

---

## Exact-version hashing

Before provider execution, record a digest/fingerprint of the precise signing artifact/content.

This assists with:

* provider callback verification,
* executed-artifact integrity,
* dispute/debugging.

---

## Signature provider abstraction

Use a provider-neutral interface conceptually:

```text
SignatureProviderAdapter
├── createRequest
├── cancelRequest
├── queryRequest
├── verifyWebhook
├── normalizeEvent
├── retrieveExecutedArtifact
└── reconcileExecution
```

Contract domain remains provider-independent.

---

## Provider-specific Contract entities prohibited

Do not create:

```text
DocuSignContract
AdobeSignContract
ProviderContract
```

as business sources of truth.

---

## Provider request ID namespace

Treat external identifiers as:

```text
provider
+
provider account/config
+
provider envelope/request ID
```

rather than globally unique.

---

## Webhook verification

Signature callbacks must be:

* cryptographically/provider verified where supported,
* replay-safe,
* tenant/provider-account bound,
* deduplicated,
* append-oriented.

---

## SignatureEvent idempotency

Repeated callback does not create duplicate signature decision/evidence.

---

## Out-of-order events

Provider callbacks may arrive out of order.

Canonical execution resolver must use:

* provider occurrence time,
* signer/request context,
* allowed state semantics,

not naïve arrival-order last-write-wins.

---

## Signer verification

A signed event must resolve to:

* expected request,
* expected ContractVersion,
* expected signer/party requirement,

before updating aggregate execution.

---

## Unknown signer ≠ accepted signer

Critical.

Quarantine/reconcile instead of attaching evidence to arbitrary signer.

---

## Aggregate execution resolver

Use centralized service:

```text
ContractExecutionResolver
```

that consumes:

```text
ContractVersion
+
SignatureRequest
+
required Signers
+
verified SignatureEvents
+
execution policy
```

and derives canonical execution state.

---

## Frontend must not determine “fully signed”

Absolute.

---

## Execution idempotency

When required signatures become complete:

transition to executed exactly once.

---

## ExecutedVersion pinning

On successful execution:

```text
contract.executedVersionId = exact ContractVersion
```

or equivalent immutable linkage.

Never resolve “executed version” as latest ContractVersion.

---

## ExecutedArtifact retrieval

Provider-signed artifact should be:

1. retrieved securely;
2. integrity-checked against execution context where possible;
3. stored in Design 030 Asset/File infrastructure;
4. marked as immutable executed evidence;
5. linked to exact executed ContractVersion.

---

## Executed artifact must not be overwritten

New retrieval/correction becomes a governed new FileVersion/evidence entry—not destructive replacement.

---

## Execution outcome unknown

If provider confirms incompletely or connection fails after completion:

use:

> Execution outcome unknown / reconciliation required

rather than sending another signature request automatically.

---

## Signature request retry

A timeout while creating provider envelope must be reconciled before creating another envelope.

This prevents duplicate signing invitations.

---

## Signature request expiry

Centralize its semantics.

Do not mix with Contract term expiry.

---

## Effective-state resolver

Conceptually:

```text
resolveContractEffectiveness(
    executed state,
    effectiveDate,
    termination state,
    term dates
)
```

should return current contract-effectiveness state.

---

## Timezone/date semantics

Legal effective/expiry dates need canonical date/time semantics.

Do not calculate them differently in:

* Team Workspace,
* Client Portal,
* invoicing/onboarding.

---

## Contract term changes

Executed Contract terms cannot be edited in place.

Amendments/new versions require explicit legal lineage.

Design 099 does not add an extra Amendment screen; it merely preserves the versioning architecture.

---

## List filtering/sorting

Server-side and permission-aware for frozen fields such as:

* lifecycle,
* execution state,
* Company/Client,
* owner,
* effective/expiry timing.

---

## Sensitive legal/commercial sort/filter side channels

If a field is restricted, users must not infer it through sorting or filtering.

---

## Client Portal consistency

Designs 053/070 consume the same:

```text
Contract
ContractVersion
Signer
ExecutionState
ExecutedArtifact
```

through strict client-safe projections.

No duplicated Portal signing backend.

---

## Billing/onboarding lineage

Later operational workflows may depend on executed Contract state.

They should consume canonical verified execution/effectiveness, not infer:

> signed

from a list badge or provider webhook directly.

---

## Search

Design 079 may index safe Contract metadata.

Do not broadly index:

* complete legal text,
* confidential clauses,
* signer evidence,
* executed signed artifacts.

---

## Activity

Useful operational events include:

```text
ContractCreated
ContractVersionCreated
ContractApproved
ContractSentForSignature
SignerViewed
SignerSigned
ContractExecutionVerified
ContractBecameEffective
ContractTerminated
```

Activity remains projection.

---

## Audit

Material legal/commercial actions require strong Audit evidence:

* version creation,
* internal approval,
* signature request,
* request cancellation,
* signer/party changes before execution,
* execution verification,
* termination/cancellation.

Provider raw events are evidence, not necessarily ordinary human Audit events.

---

## Events/outbox

Canonical events can include:

```text
ContractCreated
ContractVersionIssued
SignatureRequestCreated
SignatureEvidenceReceived
ContractExecuted
ContractEffective
ContractTerminated
```

for downstream:

* Client Portal,
* Deal gate/readiness,
* Invoice,
* Onboarding,
* Notifications.

---

## Caching

Contract Library cache should vary by:

```text
organizationMembershipId
authorizationRevision
query/filter/sort
Contract revision
ContractVersion references
execution revision
legal-access scope
```

Never one tenant-wide privileged cache.

---

## Pagination

Server-side cursor pagination at scale.

---

## N+1 prevention

Batch:

* Company/Client summaries,
* Proposal/Deal lineage,
* signer counts,
* execution summaries.

Do not fetch complete signature histories per row.

---

## Partial failure contract

Example:

```text
Contract core        ✓
Version summary      ✓
Company context      ✓
Proposal lineage     ✕
Signature provider   ✕
Execution projection ✓ from stored evidence
Artifact service     ✕
```

Design 099 still returns the Contract.

It should show:

* Proposal context unavailable,
* provider currently unavailable,
* executed artifact unavailable,

without falsely changing legal execution state.

---

## Backend Requirement Matrix

| Requirement                                             | Status                      |
| ------------------------------------------------------- | --------------------------- |
| Canonical Contract reuse from 019                       | **Critical**                |
| Contract/ContractVersion separation                     | **Critical**                |
| Contract/ContractListEntry separation                   | **Critical**                |
| Contract/Template separation                            | **Critical**                |
| Latest draft/latest issued/executed version distinction | **Critical**                |
| Issued-version immutability                             | **Critical**                |
| Executed-version immutability                           | **Critical**                |
| Historical versions preserved                           | **Critical**                |
| Proposal/Contract separation                            | **Critical**                |
| Exact ProposalVersion→Contract lineage                  | **Critical**                |
| Contract/Deal separation                                | **Critical**                |
| ContractParty/Company separation                        | **Critical**                |
| Historical legal-party snapshots                        | **Critical**                |
| ContractParty/Signer separation                         | **Critical**                |
| Signer/Contact separation                               | **Critical**                |
| Signer/PortalUser separation                            | **Critical**                |
| SignatureRequest/ContractVersion separation             | **Critical**                |
| SignatureRequest pins exact version                     | **Critical**                |
| SignatureEvent/Request separation                       | **Critical**                |
| Individual signer/aggregate execution separation        | **Critical**                |
| ContractLifecycle/ExecutionState separation             | **Critical**                |
| Execution/effectiveness separation                      | **Critical**                |
| Signature-request expiry/Contract expiry separation     | **Critical**                |
| ExecutedArtifact/ContractVersion separation             | **Critical**                |
| Executed artifact immutable storage                     | **Critical**                |
| Provider-neutral signature abstraction                  | **Critical**                |
| Provider webhook verification                           | **Critical**                |
| Webhook/event idempotency                               | **Critical**                |
| Out-of-order provider-event handling                    | **Critical**                |
| Signature request idempotency                           | **Critical**                |
| Unknown-outcome reconciliation                          | **Critical**                |
| Server-authoritative execution resolver                 | **Critical**                |
| Frontend “fully signed” calculation prohibited          | **Critical**                |
| Exact executedVersion linkage                           | **Critical**                |
| Contract approval/client signature separation           | **Critical**                |
| Contract approval binds exact ContractVersion           | **Critical where required** |
| Contract creation idempotency                           | **Critical**                |
| Design 030 Asset/File reuse                             | **Critical**                |
| Designs 053/070 Client Portal reuse                     | **Critical**                |
| Design 096 Deal-stage separation                        | **Critical**                |
| Designs 097–098 Proposal lineage reuse                  | **Critical**                |
| Design 100 execution-detail reuse                       | **Critical architecture**   |
| Permission-safe library projection                      | **Critical**                |
| Permission-aware counts/filters                         | **Critical**                |
| Cursor pagination                                       | **Required at scale**       |
| N+1 prevention                                          | **Critical**                |
| Audit/outbox integration                                | **Required**                |
| Partial dependency failure handling                     | **Critical**                |

---

# 8. Consolidation

Design 099 exposes major legal/commercial integrity risks if Contract identity, versioning and signature execution are flattened.

**Contract / ContractListEntry conflation**
Library projection becomes legal source truth.

**Contract / ContractVersion conflation**
Stable agreement and exact terms collapse.

**Latest draft / latest issued conflation**
Internal revision appears before signers.

**Latest draft / executed version conflation**
Unexecuted amendment appears legally binding.

**Contract / ContractTemplate conflation**
Template edits change existing agreements.

**Proposal / Contract conflation**
Accepted Proposal remains mutable legal agreement.

**Current Proposal / Contract snapshot conflation**
Proposal edits rewrite Contract terms.

**Proposal approved / Contract approved conflation**
Internal Proposal authorization becomes legal execution readiness.

**Proposal accepted / Contract signed conflation**
Client commercial acceptance becomes legal signature.

**Deal stage / Contract lifecycle conflation**
Opportunity status becomes legal-state truth.

**ContractParty / Company conflation**
Current CRM Company data rewrites executed legal party.

**ContractParty / Signer conflation**
Party identity and signing person collapse.

**Signer / Contact conflation**
Contact profile changes rewrite signer evidence.

**Signer / Portal User conflation**
Signing grants Portal membership.

**Signer viewed / signer signed conflation**
Engagement appears execution.

**One signer signed / fully executed conflation**
Partial completion becomes legal execution.

**SignatureRequest / ContractVersion conflation**
Provider envelope becomes agreement.

**SignatureRequest / Contract conflation**
Retry/reissue creates duplicate Contract identity.

**SignatureEvent / execution state conflation**
One webhook updates entire legal state.

**Provider “completed” / verified execution conflation**
External callback is trusted without version/signer verification.

**Provider request ID / globally unique ID conflation**
Cross-account collisions corrupt evidence.

**Webhook retry / duplicate signature evidence conflation**
Provider replay counts signer twice.

**Out-of-order webhook / execution regression conflation**
Signed Contract regresses to Viewed.

**Unknown signer / expected signer conflation**
Evidence attaches to wrong participant.

**Credential/provider state / Contract state conflation**
Provider outage makes Contract appear unsigned.

**ExecutionState / ContractLifecycle conflation**
“Fully signed” and “Active” become one field.

**Executed / effective conflation**
Future-effective agreement becomes active too soon.

**SignatureRequest expired / Contract expired conflation**
Expired invite is mistaken for expired legal term.

**Signer declined / Contract terminated conflation**
Pre-execution refusal becomes post-execution termination.

**Contract terminated / deleted conflation**
Historical legal agreement disappears.

**New draft / old executed Contract invalidation conflation**
Creating v4 silently supersedes executed v3.

**New signature request / old execution history replacement**
Legal evidence disappears during revision.

**ExecutedArtifact / ContractVersion conflation**
Signed PDF replaces structured agreement identity.

**Draft PDF / executed artifact conflation**
Unsigned regenerated document looks legally executed.

**Artifact unavailable / Contract unsigned conflation**
Storage outage rewrites legal truth.

**Artifact replacement / file overwrite conflation**
Signed evidence is destructively replaced.

**Contract approval / signature conflation**
Internal approval becomes signer action.

**Approved / sent for signature conflation**
Authorization triggers execution automatically.

**Contract owner / approver conflation**
Owner self-authorizes.

**Contract owner / signer authority conflation**
Internal assignee can sign on behalf of client.

**Deal owner / legal authority conflation**
Sales role gains Contract execution permission.

**Contract read / artifact download conflation**
Sensitive signed agreements leak.

**Contract read / signer action conflation**
Viewer impersonates signer.

**Provider envelope ID / authorization token conflation**
Guessing external ID grants access.

**Current Company access / legal-party evidence access conflation**
CRM permission reveals confidential Contract data.

**Contract list count / harmless metadata conflation**
Restricted legal activity leaks.

**Sort/filter by sensitive field / display permission conflation**
Users infer hidden values.

**Generic Contract CRUD / version command conflation**
PATCH rewrites issued/executed terms.

**Contract creation retry / duplicate Contract conflation**
Proposal handoff produces multiple agreements.

**Signature request retry / duplicate envelope conflation**
Client receives multiple legal-signing requests.

**Unknown provider outcome / retry immediately conflation**
Duplicate signing envelopes appear.

**Execution resolver / frontend signer-count logic conflation**
UI decides legal execution state.

**Client Portal Contract / Team Contract duplication**
053/070 and 099 diverge.

**Contract activity / legal truth conflation**
Timeline text substitutes execution evidence.

**Audit event / signature evidence conflation**
Compliance log substitutes provider signer proof.

**Cache by Contract ID only**
Executed-artifact/legal details leak to restricted users.

**099/019 duplicate Contract backend**
Existing Contract Workspace and Library disagree.

**099/053 duplicate Portal Contract list**
Team and Client contract identities diverge.

**099/070 duplicate signing backend**
Portal signing and Team execution use different requests.

**099/096 duplicate Deal-stage state**
Contract library controls Pipeline.

**099/097–098 duplicate Proposal lineage**
Contract list snapshots wrong Proposal version.

**099/100 duplicate Contract execution model**
List and Detail calculate different legal states.

No additional screen is required.

These are **Contract identity, exact-version lineage, legal-party snapshots, signer separation, provider-neutral signature execution, executed-artifact integrity, Proposal/Deal boundaries, permission-safe library queries, and historical legal-evidence requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL CONTRACT LIBRARY, VERSION-SUMMARY & EXECUTION-LIFECYCLE DISCOVERY ANCHOR**

**Domain directive:**
**Contract ≠ ContractVersion ≠ ContractTemplate ≠ ContractListEntry ≠ Proposal/ProposalVersion ≠ ContractParty ≠ Signer ≠ SignatureRequest ≠ SignatureEvent/Evidence ≠ Approval ≠ ContractLifecycle ≠ ExecutionState ≠ ExecutedArtifact.**

**Identity directive:**
Design 019 remains the sole canonical Contract foundation. Design 099 is a permission-safe collection projection over those exact Contract IDs and never introduces a second Team/Portal/legal Contract record.

**Projection directive:**
`ContractListEntry` is rebuildable from canonical Contract, version, party, signer, execution and lineage sources. It cannot own editable legal or execution truth.

**Version directive:**
Contract is stable identity; ContractVersion represents exact agreement terms. Latest draft, latest issued version and executed version remain independently identifiable whenever they differ.

**Immutability directive:**
issued ContractVersions are protected from material in-place edits, and executed ContractVersions are absolutely immutable. Revisions/amendments require explicit new-version/legal lineage.

**Executed-version directive:**
canonical execution pins the exact ContractVersion that was signed. A newer draft can never silently become the executed agreement.

**Proposal-lineage directive:**
Contract creation retains the exact accepted/approved ProposalVersion lineage where applicable. Later Proposal edits or catalog changes never rewrite Contract terms.

**Snapshot directive:**
Proposal-derived commercial values, package terms, legal-party details, signer requirements and agreement content become exact ContractVersion snapshots rather than dynamic references to current mutable CRM/Proposal state.

**Party directive:**
ContractParty remains a legal-party relation/snapshot distinct from canonical Company/Client identity. Current Company changes never rewrite executed legal-party evidence.

**Signer directive:**
Signer remains distinct from ContractParty, Contact, User and PortalMembership. A signer is an execution participant, not a CRM or authorization identity by implication.

**Signature-request directive:**
each SignatureRequest binds one exact ContractVersion and required signer configuration. A newer version requires a distinct governed execution request; existing requests never retarget silently.

**Provider directive:**
signature providers are adapters around canonical Contract execution. Provider envelopes/events never create provider-specific Contract business entities.

**Webhook directive:**
provider callbacks are verified, tenant/provider-account bound, append-oriented, deduplicated and replay-safe before they can contribute to canonical execution evidence.

**Ordering directive:**
out-of-order provider events are resolved by occurrence semantics and execution policy rather than arrival-order last-write-wins.

**Execution directive:**
individual signer states remain separate from aggregate Contract execution. Canonical `ContractExecutionResolver` verifies exact version + required signers + trusted evidence before recording fully executed state.

**Frontend directive:**
the frontend may display signer progress but must never be authoritative for “fully signed” or “executed.”

**Idempotency directive:**
Proposal→Contract creation, signature-request creation, provider callback ingestion, execution finalization and executed-artifact retrieval must all be replay-safe.

**Unknown-outcome directive:**
provider timeout/ambiguous completion becomes reconciliation-required state, not an automatic duplicate signature request or false execution failure.

**Artifact directive:**
the executed signed artifact is an immutable Asset/FileVersion linked to the exact executed ContractVersion. It never replaces ContractVersion as business truth and must never be destructively overwritten by a regenerated draft.

**Lifecycle directive:**
Contract lifecycle, execution state, signer state, effectiveness, signature-request expiry and Contract term expiration/termination remain separate dimensions.

**Effectiveness directive:**
fully signed does not necessarily mean currently effective. Effective date, term end and termination semantics must be resolved separately from signature completion.

**Approval directive:**
where internal Contract approval is required, Design 029 ApprovalRequest binds exact ContractVersion. Approval remains separate from signature and execution.

**Deal directive:**
Design 096 remains authoritative for Deal stage/lifecycle. Contract events can satisfy Deal gates or request explicit Deal commands but never directly become Pipeline state.

**Portal directive:**
Designs 053 and 070 consume the same canonical Contract, ContractVersion, signer and execution records through client-safe projections. Portal signing must not become a separate Contract engine.

**Authorization directive:**
Contract list visibility, legal-content read, drafting, versioning, party/signer management, signature sending, executed-artifact download and archival/termination capabilities remain independently server-authorized.

**Security directive:**
signer identity and signature evidence are derived from trusted execution/provider workflows rather than browser-supplied Team User/Contact IDs. Provider envelope IDs are never authorization credentials.

**Query directive:**
library filtering, sorting, counts and pagination operate server-side over the current actor's authorized Contract universe and must not leak restricted legal/commercial fields through aggregate or ordering side channels.

**Concurrency directive:**
draft/version mutations use optimistic concurrency; signature preparation verifies current version/revision before execution begins; executed versions cannot race with ordinary edits.

**Partial-failure directive:**
Contract core/version/execution evidence remains available when Proposal, Company, provider-health, storage or other supporting services fail. Dependency outages never silently become `No Contract`, `Unsigned`, `No Proposal`, or `No Artifact`.

**Search directive:**
Design 079 may index safe Contract metadata only. Confidential clauses, signer evidence and executed signed artifacts remain outside broad search unless separately governed.

**Caching directive:**
Contract Library caches vary by membership, authorization revision, query/filter/sort, Contract/version/execution revision and legal-access scope. A privileged legal view cannot be reused for lower-permission users.

**Performance directive:**
use cursor pagination, indexed Contract summary queries, batched Company/Proposal/Deal summaries and precomputed/rebuildable signer-progress projections rather than N+1 loading complete signature histories.

**Audit directive:**
material Contract/version creation, approval, signature requests, party/signer changes, execution verification, cancellation/termination and legal lifecycle changes generate appropriate Audit evidence, while provider SignatureEvents retain their own immutable execution provenance.

**Future-reuse directive:**
Design 100 must consume this exact Contract/ContractVersion/Signer/SignatureRequest/Execution foundation and specialize signing/execution detail without introducing another legal state model.

**Overlap directive:**
Designs **019, 029–030, 053, 070, 096–100** must share one continuous **Deal → ProposalVersion → Contract → ContractVersion → Parties/Signers → SignatureRequest/Evidence → Verified Execution → ExecutedArtifact** lineage while keeping Deal stage, Proposal state, legal versions, signature execution and artifact storage independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE CONTRACT LIBRARY FOUNDATION — CANONICAL CONTRACT IDENTITY + IMMUTABLE VERSIONED AGREEMENT TERMS + DISTINCT LATEST-DRAFT/LATEST-ISSUED/EXECUTED VERSION REFERENCES + EXACT PROPOSALVERSION LINEAGE + VERSION-BOUND LEGAL PARTY/SIGNER EVIDENCE + PROVIDER-NEUTRAL SIGNATUREREQUEST/EVENT INFRASTRUCTURE + SERVER-VERIFIED AGGREGATE EXECUTION + IMMUTABLE ASSET-BACKED EXECUTED ARTIFACTS + SEPARATE EFFECTIVENESS/TERM STATE + PERMISSION-SAFE PAGINATED LIBRARY PROJECTIONS — AND NEVER ALLOW CURRENT CRM VALUES, PROVIDER ENVELOPES, SIGNER COUNTS, GENERIC STATUS BADGES, NEWER DRAFTS OR STORAGE AVAILABILITY TO REWRITE THE HISTORICAL LEGAL AGREEMENT OR SUBSTITUTE FOR VERIFIED CONTRACT EXECUTION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **99 / 153** |
| **PASS**                                   |                         **99** |
| **STANDARDIZE decisions**                  |                         **97** |
| **Potential implementation-overlap flags** |                         **90** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**99 / 153 = 64.7% audited.**

### Canonical Contract architecture after Design 099

```text
                           DEAL
                            │
                            ↓
                         PROPOSAL
                            │
                            ↓
                 Accepted ProposalVersion
                            │
                            ↓
                         CONTRACT
                   stable agreement identity
                            │
             ┌──────────────┼──────────────┐
             ↓              ↓              ↓
            v1             v2             v3
                                      issued version
                                            │
                              ┌─────────────┼─────────────┐
                              ↓             ↓             ↓
                           Parties        Signers   SignatureRequest
                                                          │
                                                    SignatureEvents
                                                          │
                                                          ↓
                                             Verified Execution
                                                          │
                                                          ↓
                                                Executed Artifact
```

The critical version distinction is now explicit:

```text
Contract C-100

Executed version = v3
New internal draft = v4

v4 exists
    ≠
v4 executed

Executed legal agreement remains v3
until a governed later execution/amendment
changes that fact.
```

The party/signer distinction is equally strict:

```text
ContractParty
    = Globex GmbH

Signer
    = Sarah Patel
      signing on behalf of Globex GmbH

Company ≠ ContractParty ≠ Signer ≠ Contact
```

And signature execution remains a chain of evidence:

```text
Signature request sent
        ≠
Signer viewed

Signer viewed
        ≠
Signer signed

One signer signed
        ≠
Contract fully executed

All required valid signature evidence
        ↓
ContractExecutionResolver
        ↓
Verified executed ContractVersion
```

Finally:

```text
Signature request expired
        ≠
Contract term expired

Contract fully signed
        ≠
Contract currently effective

Executed artifact unavailable
        ≠
Contract unsigned
```

Each remains a separate canonical fact.

## Next Sequential Audit Target

### **Design 100 — Contract Detail / Signing & Execution Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
