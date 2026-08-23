# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 100 — Contract Detail / Signing & Execution Detail

Design 100 should become the **canonical Team Workspace Contract 360 execution surface** for inspecting one Contract, its exact versions, legal parties, signers, signature requests, provider evidence, execution resolution, executed artifact, and current effectiveness—built directly on Design 019 and the collection foundation locked in Design 099.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ SignatureRequest ≠ SignatureEvent/Evidence ≠ Approval ≠ ExecutionState ≠ ExecutedArtifact ≠ EffectiveState/TermState ≠ Proposal/ProposalVersion ≠ Deal.**

The central implementation rule is:

> **Contract Detail is a composition and execution-control surface around one canonical Contract. Every signing action must target one exact immutable ContractVersion, every signer must belong to an explicit legal-party/signing requirement, provider callbacks remain evidence rather than legal truth by themselves, and canonical execution is established only after the platform verifies the expected version, signers, request, evidence, and executed artifact.**

---

# 1. Classification

| Audit field                       | Classification                                                                                                                                             |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                     | **100**                                                                                                                                                    |
| **Canonical name**                | **Contract Detail / Signing & Execution Detail**                                                                                                           |
| **Product area**                  | Team Workspace / Sales / Contracts / Commercial Execution                                                                                                  |
| **User surface**                  | **Authenticated Team Workspace**                                                                                                                           |
| **Screen class**                  | Entity Detail / Legal Execution / Signature Operations Workspace                                                                                           |
| **Classification**                | **Canonical Contract 360, Exact-Version Signing & Verified Execution Anchor**                                                                              |
| **Primary purpose**               | Inspect one Contract and safely govern version issuance, parties/signers, signature progress, execution verification, artifact evidence, and effectiveness |
| **Primary entity**                | **Contract** — Design 019                                                                                                                                  |
| **Version entity**                | **ContractVersion**                                                                                                                                        |
| **Legal-party entity**            | **ContractParty**                                                                                                                                          |
| **Signer entity**                 | **Signer**                                                                                                                                                 |
| **Signature workflow entity**     | **SignatureRequest**                                                                                                                                       |
| **Execution evidence**            | **SignatureEvent / SignatureEvidence**                                                                                                                     |
| **Approval dependency**           | Design 029 where required                                                                                                                                  |
| **Executed artifact**             | canonical Asset/FileVersion — Design 030                                                                                                                   |
| **Proposal lineage**              | Designs 018 / 097–098                                                                                                                                      |
| **Deal dependency**               | Designs 016–017 / 096                                                                                                                                      |
| **Library dependency**            | Design 099                                                                                                                                                 |
| **Client Portal dependency**      | Designs 053 / 070                                                                                                                                          |
| **Primary query service**         | `ContractDetailQueryService`                                                                                                                               |
| **Contract service**              | `ContractService`                                                                                                                                          |
| **Version service**               | `ContractVersionService`                                                                                                                                   |
| **Signature preparation service** | `ContractSignatureService`                                                                                                                                 |
| **Provider abstraction**          | `SignatureProviderService`                                                                                                                                 |
| **Execution resolver**            | `ContractExecutionResolver`                                                                                                                                |
| **Effectiveness resolver**        | `ContractEffectivenessResolver`                                                                                                                            |
| **Parent shell**                  | `InternalAppShell` — Design 001                                                                                                                            |
| **Auth**                          | Required                                                                                                                                                   |
| **Authorization**                 | Active OrganizationMembership + Contract/version/party/signature/execution/artifact permissions                                                            |
| **Implementation priority**       | **Critical Legal Integrity / Signature Evidence / Executed-Version Certification**                                                                         |
| **Reuse level**                   | **Extremely High across Proposals, Client Portal, Billing, Onboarding and Deal closeout**                                                                  |

Design 100 should answer:

> **“What exact Contract is this, which ContractVersion is being signed or has been executed, who are the legal parties and required signers, what trustworthy signature evidence exists, is execution actually complete and verified, which immutable signed artifact represents it, and is the agreement currently effective?”**

Canonical composition:

```text
Contract C-100
      │
      ├── ContractVersion v1
      ├── ContractVersion v2
      └── ContractVersion v3
                 │
                 ├── ContractParty[]
                 ├── Signer[]
                 ├── ApprovalRequest
                 └── SignatureRequest
                           │
                           ├── SignatureEvent[]
                           ├── signer evidence
                           └── provider evidence
                                   │
                                   ↓
                         ContractExecutionResolver
                                   │
                                   ↓
                         VERIFIED EXECUTION
                                   │
                                   ↓
                          ExecutedArtifact
                                   │
                                   ↓
                       Effectiveness / Term State
```

---

# 2. Reuse

## Design 019 remains the canonical Contract foundation

Design 100 must operate on the exact same:

```text
Contract.id
```

introduced by Design 019.

Do not create:

```text
SignedContract
ExecutedContract
ContractExecutionDetailRecord
LegalContract360
```

as parallel business entities.

---

## Design 099 remains Contract discovery

Design 099 produces summary/list projections.

Design 100 opens and composes the same canonical Contract.

Therefore:

```text
ContractListEntry
→ Contract.id
→ ContractDetailView
```

not:

```text
ContractListEntry
→ duplicated execution JSON
```

---

## Design 070 remains the client-safe signing/detail projection

Internal Design 100 and Portal Design 070 must use the same:

* Contract,
* ContractVersion,
* Signer,
* SignatureRequest,
* SignatureEvent,
* ExecutedArtifact.

Their permissions and presentation differ.

Their business records must not.

---

## Design 053 remains Client Contract collection reuse

Same Contract identity across Team and Client surfaces.

---

## Design 029 remains Approval authority

Where internal Contract approval is required:

```text
ApprovalRequest
subject = exact ContractVersion
```

Design 100 consumes that state.

It does not create:

```text
contract.approved = true
```

as a competing approval backend.

---

## Design 030 remains file/artifact authority

Draft renderings and executed signed files must use canonical Asset/FileVersion infrastructure.

Contract detail does not become another file-storage system.

---

## Designs 097–098 remain Proposal lineage authority

If Contract C1 was created from accepted ProposalVersion PV3:

```text
Proposal P1
   ↓
ProposalVersion PV3
   ↓
Acceptance
   ↓
Contract C1
```

Design 100 preserves this lineage.

It never dynamically rereads later Proposal drafts as Contract terms.

---

## Design 096 remains Deal-stage authority

Contract signing/execution can satisfy Deal closing conditions.

It cannot directly overwrite Deal stage without an explicit Deal-domain transition.

---

# 3. Entities

## Contract

`Contract` remains the stable legal/commercial agreement identity.

Conceptually:

```text
Contract
├── id
├── organizationId
├── Deal/Proposal lineage
├── client/company context
├── lifecycle
├── latestDraftVersionId
├── latestIssuedVersionId
├── executedVersionId
├── owner
├── createdAt
└── revision
```

Exact physical schema belongs to Phase 3D.

---

## Contract ≠ ContractDetailView

`ContractDetailView` is a permission-safe composition.

It may include:

```text
ContractDetailView
├── contract
├── selectedVersion
├── version history
├── parties
├── signers
├── approval summary
├── signature request
├── signer progress
├── verified execution
├── executed artifact
├── effectiveness
└── Proposal / Deal lineage
```

It is rebuildable and never canonical storage.

---

## ContractVersion

Every materially different agreement text/term set must be versioned.

Conceptually:

```text
ContractVersion
├── id
├── contractId
├── version
├── terms/content
├── commercial snapshot
├── legal-party snapshots
├── signer requirements
├── effective/term terms
├── createdBy
├── createdAt
└── fingerprint
```

---

## Draft version ≠ issued version

Permanent.

---

## Issued version ≠ executed version

Permanent.

Example:

```text
v3 = issued for signature
v4 = internal revised draft
```

Until v4 itself executes:

```text
executedVersionId ≠ v4
```

---

## Executed version is immutable

Absolute.

No ordinary edit can change:

* terms,
* commercial obligations,
* legal-party data,
* signer requirements,
* effective dates.

Future changes require explicit new-version/amendment lineage.

---

## ContractVersion fingerprint

Exact version integrity should be provable.

Conceptually:

```text
contentHash
artifactHash
rendererVersion
```

where appropriate.

This helps ensure that:

> the version reviewed, sent, signed, and stored is the same legal content.

---

## ContractParty

`ContractParty` represents the legal party bound by the agreement.

It must preserve legal identity snapshots at the applicable ContractVersion.

---

## ContractParty ≠ current Company

Permanent.

---

## Company merge/name change ≠ legal-party rewrite

Historical executed Contract continues to preserve:

* original legal name,
* address,
* jurisdictional details where applicable.

---

## ContractParty ≠ Signer

Permanent.

A signer acts for a party.

The signer is not the party itself.

---

## Signer

`Signer` represents a person required/authorized to sign one exact ContractVersion.

Conceptually:

```text
Signer
├── id
├── contractVersionId
├── contractPartyId
├── Contact reference where available
├── signer identity snapshot
├── role
├── required/optional state
├── signing order/group
└── execution state
```

---

## Signer ≠ Contact

Current Contact profile can be linked.

Historical signer identity/evidence remains immutable.

---

## Signer ≠ User

Permanent.

---

## Signer ≠ PortalMembership

Permanent.

Signing a Contract does not grant application access.

---

## Signer ≠ signature evidence

Signer is the required participant.

SignatureEvent/Evidence records what happened.

---

## Signer replacement before execution

If signer substitution is allowed:

it must be explicit, authorized, version/request-safe and historical.

Do not silently overwrite:

```text
Signer A
→ Signer B
```

after A has received/signed a request.

---

## Required signer ≠ optional observer

If the frozen workflow supports non-required recipients/witnesses, execution resolver must distinguish them.

Do not calculate completion from total recipients alone.

---

## SignatureRequest

A SignatureRequest represents one execution attempt/workflow against an exact ContractVersion.

Conceptually:

```text
SignatureRequest
├── id
├── contractVersionId
├── provider
├── provider request/envelope id
├── signer configuration
├── createdAt
├── expiresAt
├── lifecycle
└── revision
```

---

## SignatureRequest ≠ Contract

Permanent.

---

## SignatureRequest ≠ ContractVersion

Permanent.

---

## One ContractVersion may need more than one SignatureRequest historically

Examples:

* previous request expired,
* request cancelled,
* new governed request created.

History remains.

---

## Reissue ≠ overwrite previous request

Permanent.

---

## SignatureEvent / SignatureEvidence

Provider/internal execution evidence should preserve:

```text
SignatureEvent
├── signatureRequestId
├── signerId
├── provider event identity
├── event type
├── providerOccurredAt
├── receivedAt
├── verification status
├── identity/authentication evidence refs
└── safe provider metadata
```

---

## SignatureEvent ≠ signer current state

Current signer state is resolved from canonical evidence.

---

## Viewed event ≠ signed

Permanent.

---

## Signed event ≠ verified signature blindly

A callback has to be:

* authenticated,
* correctly linked,
* expected,
* content/version consistent.

---

## Provider event ≠ execution truth

Critical.

Canonical execution comes from the resolver.

---

## Signature evidence should be append-oriented

Do not rewrite prior provider evidence.

---

## Duplicate provider event ≠ duplicate signature

Permanent.

---

## Out-of-order provider event

Example:

```text
SIGNED occurred 10:01
VIEWED callback arrives 10:05
```

Signer state must not regress to Viewed.

---

## Approval

If internal approval is required:

```text
ApprovalRequest
subject = ContractVersion v3
```

Approval remains independent from signature execution.

---

## Approved v3 ≠ v4 approved

Permanent.

---

## Approval ≠ SignatureRequest

Permanent.

---

## Approved ≠ signed

Permanent.

---

## ExecutionState

Canonical execution should be derived from trusted evidence.

Conceptually:

```text
NOT_STARTED
AWAITING_SIGNATURES
PARTIALLY_SIGNED
FULLY_SIGNED_UNVERIFIED
VERIFIED_EXECUTED
DECLINED
EXPIRED_REQUEST
RECONCILIATION_REQUIRED
```

Exact enum belongs to Phase 3D.

---

## Fully signed ≠ verified executed necessarily

Important.

There can be an intermediate condition where all expected signer events exist but:

* artifact retrieval failed,
* evidence integrity is incomplete,
* provider reconciliation is required.

Therefore:

```text
ALL SIGNATURE EVENTS PRESENT
≠
VERIFIED_EXECUTED
```

---

## Verified execution

Canonical execution should require conceptually:

```text
exact ContractVersion
+
expected SignatureRequest
+
all required signer requirements satisfied
+
verified provider evidence
+
integrity checks
+
executed artifact evidence where required
```

---

## Execution time

Execution timestamp should be derived from canonical legal execution semantics, not:

* UI click time,
* last page load,
* artifact download time.

---

## ExecutedArtifact

The final signed artifact must be stored as immutable evidence.

Conceptually:

```text
ExecutedArtifact
├── contractVersionId
├── signatureRequestId
├── Asset/FileVersion
├── content hash
├── retrievedAt
├── provider evidence
└── immutable retention semantics
```

---

## ExecutedArtifact ≠ draft artifact

Absolute.

---

## ExecutedArtifact ≠ regenerated contract PDF

Absolute.

---

## Missing executed artifact ≠ unsigned

Critical.

Could be:

> verified execution, artifact retrieval unavailable.

That is a serious operational condition but not automatically a reversal of signature evidence.

---

## Artifact retrieval failure must remain explicit

Do not mark Contract “unsigned” because storage/provider download failed.

---

## ContractLifecycle

Broad Contract lifecycle remains separate from execution.

Conceptually:

```text
Draft
Preparing
In Execution
Executed
Active
Terminated
Archived
```

Exact vocabulary Phase 3D.

---

## Execution ≠ Effectiveness

Permanent.

A fully executed agreement can become effective later.

---

## EffectiveState / TermState

Conceptually:

```text
Not Effective Yet
Effective
Term Ending
Expired / Term Ended
Terminated
```

depending on terms.

---

## Effective date ≠ execution date

Permanent.

---

## Contract expiry ≠ SignatureRequest expiry

Absolute.

---

## Termination ≠ signer decline

Permanent.

---

## Proposal lineage

Exact accepted ProposalVersion remains historical source lineage.

Contract terms become independent legal terms once versioned.

---

## Proposal change after Contract creation

No effect on existing ContractVersion.

---

## Deal

Deal can reference Contract state.

Contract does not inherit Deal lifecycle.

---

## Executed Contract ≠ Deal won automatically

An explicit Deal transition/policy remains required.

---

## Billing/onboarding readiness

Later workflows may depend on:

* verified execution,
* effective state,
* required commercial terms.

They should consume canonical Contract state, not UI badges.

---

# 4. Permissions

Design 100 should conceptually distinguish:

```text
contract.read
contract.editDraft
contract.createVersion

contract.parties.read
contract.parties.manage

contract.signers.read
contract.signers.manage

contract.approval.read

contract.signature.prepare
contract.signature.send
contract.signature.cancel
contract.signature.resend

contract.execution.read
contract.execution.reconcile

contract.executedArtifact.read
contract.executedArtifact.download

contract.terminate
```

Exact permission keys belong to Phase 3D.

---

## Contract read ≠ edit

Permanent.

---

## Draft edit ≠ version issue

Permanent.

---

## Contract edit ≠ signer management

Permanent.

---

## Signer management ≠ Company/Contact management

Permanent.

---

## Signature preparation ≠ signature sending

Potentially separate authority.

---

## Signature sending ≠ execution verification override

Permanent.

---

## Contract owner ≠ signing authority

Permanent.

---

## Deal owner ≠ legal execution authority

Permanent.

---

## Portal user ≠ signer automatically

Permanent.

---

## Team user ≠ signer automatically

Permanent.

---

## Signer action must be authenticated separately

Signature provider/workflow must authenticate the external signer according to the relevant execution policy.

Team session alone cannot impersonate them.

---

## Signer identity cannot be browser-declared

Never trust:

```text
signedBy = contactId
```

from arbitrary frontend input.

---

## Execution reconciliation needs elevated permission

Manually resolving ambiguous execution is security/legal sensitive.

It should not be available to ordinary Contract viewers.

---

## Executed artifact may require stronger permission than Contract metadata

Permanent.

---

## Legal evidence visibility

Signature evidence may contain:

* IP,
* authentication metadata,
* provider evidence,
* timestamps.

It should not necessarily be visible to everyone who can read the Contract summary.

---

## Approval rationale access can remain separately restricted

Design 029 rules persist.

---

## Direct Contract ID reauthorizes

Permanent.

---

## Direct ContractVersion ID reauthorizes

Permanent.

---

## SignatureRequest/provider envelope ID grants no access

Absolute.

---

## ExecutedArtifact ID grants no access

Absolute.

---

## Cross-tenant signer/party/provider relationships prohibited

Absolute.

---

## Portal projection must strip internal evidence

Design 070 should never receive:

* internal approval rationale,
* internal notes,
* provider secrets,
* unrelated signer diagnostics.

---

# 5. States

Design 100 must keep **Contract lifecycle, ContractVersion lifecycle, approval, SignatureRequest lifecycle, individual signer state, aggregate execution, artifact state, effectiveness, and term state** separate.

### Contract lifecycle

Canonical domain state.

### ContractVersion

Conceptually:

```text
Draft
Approved for Execution
Issued
Executed
Superseded
Historical
```

### SignatureRequest

```text
Not Created
Prepared
Sent
Viewed / Active
Partially Completed
Completed
Declined
Expired
Cancelled
Failed
Reconciliation Required
```

### Individual signer

```text
Pending
Invited
Viewed
Signed
Declined
Expired
Authentication Failed / Needs Attention
```

where supported.

### Aggregate execution

```text
Not Started
Awaiting Signatures
Partially Signed
Fully Signed Unverified
Verified Executed
Execution Failed
Reconciliation Required
```

### Artifact

```text
Not Generated
Draft Artifact Available
Executed Artifact Pending
Executed Artifact Available
Executed Artifact Retrieval Failed
Artifact Restricted
```

### Effectiveness

```text
Not Effective Yet
Effective
Expired / Term Ended
Terminated
Unknown
```

These must never collapse into one generic `contract.status`.

---

## Prepared ≠ sent

Permanent.

---

## Sent ≠ viewed

Permanent.

---

## Viewed ≠ signed

Permanent.

---

## One signer signed ≠ Contract executed

Permanent.

---

## All signer UI rows say Signed ≠ server-verified execution

Critical.

---

## Executed artifact available ≠ Contract currently effective

Permanent.

---

## Contract executed ≠ Contract active forever

Permanent.

---

## Contract effective ≠ Deal won

Permanent.

---

## Signature request expired ≠ Contract expired

Permanent.

---

## Signature declined ≠ Contract terminated

Permanent.

---

## Provider unavailable ≠ unsigned

Critical.

---

## Artifact service unavailable ≠ execution failed

Critical.

---

## Approval service unavailable ≠ unapproved

Critical.

---

## Company service unavailable ≠ no ContractParty

Critical.

---

## Proposal service unavailable ≠ no lineage

Critical.

---

## Newer draft exists ≠ current execution invalid

Permanent.

---

## State Coverage

Design 100 inherits Design 150 plus:

```text
Contract Loading
Contract Available
Contract Restricted
Contract No Longer Accessible

Contract Draft
Contract Preparing
Contract In Execution
Contract Executed
Contract Active
Contract Terminated
Contract Archived

Version Draft
Version Approved for Execution
Version Issued
Version Executed
Version Superseded
Version Historical
Newer Draft Exists

Approval Not Required
Approval Pending
Approval Approved
Approval Rejected
Approval Service Unavailable

Signature Not Prepared
Signature Prepared
Signature Request Sent
Signature Request Active
Signature Request Partially Complete
Signature Request Complete
Signature Request Declined
Signature Request Expired
Signature Request Cancelled
Signature Provider Unavailable
Signature Reconciliation Required

Signer Pending
Signer Invited
Signer Viewed
Signer Signed
Signer Declined
Signer Needs Attention

Execution Not Started
Execution Awaiting Signatures
Execution Partially Signed
Execution Fully Signed Unverified
Execution Verified
Execution Failed
Execution Reconciliation Required

Executed Artifact Pending
Executed Artifact Available
Executed Artifact Retrieval Failed
Executed Artifact Restricted

Contract Not Effective Yet
Contract Effective
Contract Term Ended
Contract Terminated
Contract Effectiveness Unknown

Contract Updated Elsewhere
Contract Version Conflict
Signature State Updated Elsewhere
Partial Contract Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should make **exact ContractVersion and execution status** dominant.

Conceptually:

```text
Contract identity
↓
Version selector/history
↓
Selected exact version
↓
Legal parties
↓
Required signers
↓
SignatureRequest / execution progress
↓
Verified execution
↓
Executed artifact
↓
Effectiveness / term
↓
Proposal / Deal lineage
```

Only sections present in frozen Design 100 should render.

---

## Executed version must be unmistakable

If:

```text
Executed = v3
Draft = v4
```

the screen must never visually imply:

> Contract v4 is signed.

Exact-version labeling is mandatory.

---

## Signer progress ≠ execution badge

Correct:

> Required signers: 2/3 signed
> Execution: Awaiting final signature

Not:

> 67% executed

without explicit semantics.

---

## Approval and signing must use different labels

Correct:

> Internal approval: Approved
> Signing: 1 of 2 complete

Avoid generic:

> Approved.

---

## SignatureRequest expiry and Contract term expiry require separate labels

Never one ambiguous “Expired”.

---

## Provider status should remain secondary

The screen represents Contract execution—not DocuSign/Adobe/provider administration.

---

## Tablet

Following Design 152:

* Contract/version identity stays prominent,
* signer rows stack compactly,
* execution summary remains visible,
* artifact/effectiveness sections stack,
* provider diagnostics stay secondary.

---

## Mobile

Priority:

```text
Contract
↓
Exact selected/executed version
↓
Contract lifecycle
↓
Required signers
↓
Signing progress
↓
Verified execution
↓
Executed artifact
↓
Effective / term state
↓
Proposal / Deal context
```

Do not force desktop signer tables horizontally.

---

## Mobile legal actions

Where frozen design contains:

* send,
* cancel,
* resend,
* reconcile,

the exact ContractVersion and consequence must remain clear before confirmation.

---

## Accessibility

A Contract detail could communicate:

> Contract Executive Brand Partnership, version 3. Internal approval complete. Three required signers; two have signed. Contract is not yet fully executed. A newer internal draft version 4 exists and is not part of the current signature request.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Contract detail architecture

```text
Design 100
    ↓
Authenticated Workspace Context
    ↓
ContractDetailQueryService
    │
    ├── ContractAdapter
    ├── ContractVersionAdapter
    ├── PartyAdapter
    ├── SignerAdapter
    ├── ApprovalAdapter
    ├── SignatureRequestAdapter
    ├── SignatureEvidenceAdapter
    ├── ExecutionAdapter
    ├── ExecutedArtifactAdapter
    ├── EffectivenessAdapter
    └── Proposal/DealAdapter
    ↓
ContractDetailView
```

This is a read composition.

---

## Query anchors on canonical Contract ID

Conceptually:

```text
getContractDetail(
    contractId,
    selectedVersionId?,
    currentMembership
)
```

Every related section remains independently authorized.

---

## No giant ContractExecution record

Avoid source truth like:

```text
ContractExecutionDetail {
  contractJson,
  partiesJson,
  signersJson,
  providerJson,
  artifactJson
}
```

Materialized projections may exist only if rebuildable and source-revision-aware.

---

## Version selection

The server should distinguish:

```text
latestDraftVersion
latestIssuedVersion
executedVersion
selectedVersion
```

Explicitly.

Never derive all four from `MAX(versionNumber)`.

---

## Version immutability enforcement

Database/service layer must reject mutation of:

* issued immutable versions,
* executed versions.

Not just hide edit controls.

---

## Contract version fingerprint

Before issuing for signature, persist an integrity digest over the legal version/artifact.

Execution evidence should reference that fingerprint where provider integration permits.

---

## Signature preparation workflow

Conceptually:

```text
prepareContractForSignature(
    contractId,
    contractVersionId,
    expectedContractRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. verify exact ContractVersion;
3. verify version immutability/readiness;
4. verify required internal approval;
5. validate ContractParties;
6. validate Signers;
7. generate/freeze signing artifact;
8. compute content hash;
9. create canonical SignatureRequest intent;
10. emit Audit/outbox.

---

## Prepare ≠ send

Important.

Preparation and provider dispatch can remain separate if frozen workflow supports them.

---

## Signature send workflow

Conceptually:

```text
sendSignatureRequest(
    signatureRequestId,
    expectedRequestRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. load exact request/version;
3. confirm request is sendable;
4. resolve provider adapter;
5. create/reuse provider idempotency identity;
6. dispatch;
7. persist provider envelope/request ID;
8. record canonical state/evidence;
9. emit event/Audit.

---

## Signature request idempotency

Double-click/network timeout must not send multiple envelopes.

---

## Provider outcome unknown

If provider request may have succeeded but the response was lost:

```text
SignatureRequest = OUTCOME_UNKNOWN / RECONCILIATION_REQUIRED
```

Then reconcile before creating another provider request.

---

## Provider reconciliation

Conceptually:

```text
reconcileSignatureRequest(signatureRequestId)
```

using:

* provider request ID,
* idempotency key,
* signer set,
* artifact fingerprint.

---

## Provider adapter interface

Conceptually:

```text
SignatureProviderAdapter
├── createEnvelope/request
├── cancel
├── resend/remind where supported
├── fetchStatus
├── fetchRecipients
├── verifyWebhook
├── normalizeEvent
├── fetchExecutedArtifact
└── reconcile
```

Provider adapters do not own Contract lifecycle.

---

## Webhook ingestion

Canonical flow:

```text
Provider webhook
      ↓
verify signature/authenticity
      ↓
deduplicate/replay protect
      ↓
store provider evidence
      ↓
normalize event
      ↓
resolve ContractVersion / SignatureRequest / Signer
      ↓
append SignatureEvent
      ↓
recompute signer state
      ↓
ContractExecutionResolver
```

---

## Invalid provider callback

Must not mutate:

* signer state,
* Contract lifecycle,
* execution state.

---

## Unknown/unlinked provider callback

Quarantine/reconcile safely.

Never associate solely by signer email or Contract title.

---

## Provider event idempotency

Repeated event IDs/content fingerprints produce one canonical evidence event.

---

## Provider event ordering

Use provider occurrence time and state-machine semantics.

Do not let:

```text
Viewed callback
```

arriving after:

```text
Signed callback
```

regress signer state.

---

## Signer state resolver

Current signer progress is derived from valid evidence.

Do not store a mutable UI-controlled:

```text
signer.signed = true
```

without execution evidence.

---

## ContractExecutionResolver

Conceptually:

```text
resolveExecution(
    contractVersionId,
    signatureRequestId
)
```

should verify:

1. ContractVersion is exact expected version;
2. request belongs to it;
3. all required signers are satisfied;
4. no invalidated/revoked signature conditions exist;
5. provider evidence is verified;
6. artifact/content integrity is consistent;
7. provider completion/reconciliation is satisfactory;
8. execution policy requirements pass.

Only then emit:

```text
ContractExecutionVerified
```

---

## Execution finalization should be idempotent

Repeated webhook/reconciliation cannot execute Contract twice.

---

## Atomic executedVersion update

Within Contract domain:

```text
Contract.executedVersionId
+
ExecutionRecord/state
+
verified execution timestamp
```

must remain internally consistent.

---

## Executed artifact retrieval

After verified completion:

```text
fetchExecutedArtifact()
```

should:

1. identify exact provider request;
2. fetch provider-signed file;
3. verify expected artifact/version context;
4. compute hash;
5. store as immutable Asset/FileVersion;
6. link to execution evidence.

---

## Executed artifact retrieval can be asynchronous

Execution evidence may complete before signed artifact storage.

Therefore support:

```text
Execution = VERIFIED
ExecutedArtifact = PENDING
```

where legally/technically valid.

---

## Artifact retrieval retries must be idempotent

Do not create multiple unrelated “executed” files for the same execution.

Versioned retrieval/evidence may exist, but one canonical executed-artifact relation must remain clear.

---

## Artifact integrity mismatch

Critical state:

```text
EXECUTION / ARTIFACT RECONCILIATION REQUIRED
```

Do not mark safe/complete if hashes/version context disagree.

---

## Approval integration

`prepareContractForSignature()` must query exact ContractVersion ApprovalRequest where required.

Approval of an older version cannot satisfy current version.

---

## Party/signer changes after signature request

Once a request is issued:

material changes to parties/signers should normally require cancellation/supersession/new version or new request according to policy.

Do not silently mutate an in-flight envelope's canonical expectation.

---

## Signer replacement

Must produce explicit lineage:

```text
Signer A removed/replaced
Signer B added
```

with authorization and Audit.

If execution already occurred, signer evidence is immutable.

---

## Contract cancellation before execution

Cancelling execution request:

* preserves Contract/version,
* preserves prior request/events,
* prevents future signing action where applicable,
* does not delete evidence.

---

## Contract termination after execution

Different domain command from cancelling SignatureRequest.

Permanent distinction.

---

## Effectiveness resolver

Conceptually:

```text
resolveContractEffectiveness(
    verifiedExecution,
    effectiveDate,
    termEnd,
    termination/cancellation state
)
```

Do not infer:

```text
Executed → Effective
```

blindly.

---

## Scheduled effectiveness

Future-effective Contracts may need a scheduled transition/projection.

This is not a new screen.

It is backend state handling.

---

## Term expiration

Term expiration should derive from exact executed ContractVersion terms, not current settings.

---

## Proposal/Deal integration

Design 100 can expose:

* source ProposalVersion,
* current Deal context.

It must not mutate them directly.

---

## Deal close transition

If Contract execution satisfies a Deal closing gate:

```text
ContractExecutionVerified
    ↓
Deal gate invalidation/re-evaluation
```

Then an explicit Deal transition/policy acts.

Do not:

```text
Contract signed
→ Deal = Won
```

as hidden side effect.

---

## Billing/onboarding trigger safety

Downstream workflows must consume canonical:

```text
ContractExecutionVerified
ContractEffective
```

events according to their requirements.

Not provider callbacks directly.

---

## Outbox/events

Useful canonical events:

```text
ContractVersionPreparedForSignature
SignatureRequestCreated
SignatureRequestSent
SignerViewed
SignerSigned
SignatureRequestDeclined
SignatureRequestExpired
ContractExecutionVerified
ExecutedArtifactStored
ContractBecameEffective
ContractTermEnded
ContractTerminated
```

---

## Notification integration

Design 080 may notify:

* signature sent,
* signer completed,
* signature declined,
* execution completed,
* artifact available.

Notification state remains independent.

---

## Activity

Contract Activity may compose the above events.

Activity ≠ Audit ≠ SignatureEvidence.

---

## Audit

Strong Audit coverage should include:

* party/signer changes,
* version issue,
* internal approval,
* signature preparation/send/cancel,
* signer replacement,
* manual reconciliation,
* execution verification,
* termination.

Do not place raw provider secrets or excessive sensitive identity evidence in general Audit payloads.

---

## Search

Design 079 may index safe Contract metadata.

Do not index:

* signed legal file contents,
* full signature evidence,
* sensitive authentication evidence,

without separate policy.

---

## Permission-safe caching

Cache must vary by:

```text
organizationMembershipId
contractId
selectedVersionId
authorizationRevision
contractRevision
versionRevision
signatureRequestRevision
executionRevision
artifactRevision
```

Contract ID alone is insufficient.

---

## Performance

Use:

* exact version loads,
* batched party/signer queries,
* derived signer-progress summaries,
* lazy signature-event history,
* cached immutable legal-version/artifact metadata.

Avoid re-fetching complete provider history on every page load.

---

## Partial failure contract

Example:

```text
Contract core          ✓
Selected version       ✓
Parties                ✓
Signers                ✓
Provider live status   ✕
Stored signature events✓
Execution resolver     ✓
Executed artifact      ✕
Proposal context       ✕
```

Design 100 should still render:

> Contract and stored execution evidence available. Provider currently unavailable. Executed artifact unavailable. Proposal context unavailable.

Not:

> Contract unsigned.

And not:

> Contract missing.

---

## Backend Requirement Matrix

| Requirement                                              | Status                      |
| -------------------------------------------------------- | --------------------------- |
| Canonical Contract reuse from 019                        | **Critical**                |
| ContractDetailView as composition only                   | **Critical**                |
| Contract/ContractVersion separation                      | **Critical**                |
| latestDraft/latestIssued/executed version separation     | **Critical**                |
| issued version immutability                              | **Critical**                |
| executed version absolute immutability                   | **Critical**                |
| exact legal-content fingerprint                          | **Critical**                |
| ContractParty/Company separation                         | **Critical**                |
| historical legal-party snapshot                          | **Critical**                |
| ContractParty/Signer separation                          | **Critical**                |
| Signer/Contact separation                                | **Critical**                |
| Signer/User separation                                   | **Critical**                |
| Signer/PortalMembership separation                       | **Critical**                |
| signer identity snapshot/evidence                        | **Critical**                |
| SignatureRequest/exact ContractVersion binding           | **Critical**                |
| SignatureRequest/Contract separation                     | **Critical**                |
| multiple historical requests preserved                   | **Critical**                |
| provider abstraction                                     | **Critical**                |
| signature-request idempotency                            | **Critical**                |
| uncertain-send reconciliation                            | **Critical**                |
| verified webhook ingestion                               | **Critical**                |
| webhook replay protection                                | **Critical**                |
| provider-event deduplication                             | **Critical**                |
| out-of-order event handling                              | **Critical**                |
| SignatureEvent/signer state separation                   | **Critical**                |
| signer progress/aggregate execution separation           | **Critical**                |
| frontend execution calculation prohibited                | **Critical**                |
| server-authoritative execution resolver                  | **Critical**                |
| fully-signed/verified-executed separation                | **Critical**                |
| execution finalization idempotency                       | **Critical**                |
| atomic executedVersion linkage                           | **Critical**                |
| exact executed artifact linkage                          | **Critical**                |
| immutable Asset/FileVersion storage                      | **Critical**                |
| artifact retrieval idempotency                           | **Critical**                |
| artifact mismatch reconciliation                         | **Critical**                |
| approval exact-version reuse                             | **Critical where required** |
| approval/signature separation                            | **Critical**                |
| execution/effectiveness separation                       | **Critical**                |
| signature-request expiry/Contract term expiry separation | **Critical**                |
| termination/request cancellation separation              | **Critical**                |
| Proposal lineage exact-version preservation              | **Critical**                |
| Deal-stage separation                                    | **Critical**                |
| downstream workflows use verified domain events          | **Critical**                |
| Client Portal 053/070 reuse                              | **Critical**                |
| Library 099 reuse                                        | **Critical**                |
| section-level authorization                              | **Critical**                |
| sensitive signature-evidence permissions                 | **Critical**                |
| optimistic concurrency                                   | **Critical**                |
| permission-safe caching                                  | **Critical**                |
| partial subsystem failure handling                       | **Critical**                |
| Audit/outbox integration                                 | **Required**                |

---

# 8. Consolidation

Design 100 creates the highest legal-integrity risk in the Contract family if exact-version and evidence boundaries are weakened.

**Contract / ContractDetailView conflation**
Composition becomes another legal source of truth.

**Contract / ContractVersion conflation**
Agreement identity and exact legal terms collapse.

**Latest draft / issued version conflation**
Internal changes appear before signers.

**Latest draft / executed version conflation**
Unsigned amendment appears legally effective.

**Issued / executed conflation**
Sending for signature becomes legal execution.

**New version / old execution invalidation conflation**
Creating v4 rewrites v3 legal history.

**ContractVersion / rendered PDF conflation**
File representation replaces structured legal version.

**Draft artifact / executed artifact conflation**
Unsigned PDF appears signed.

**Artifact availability / execution truth conflation**
Storage outage marks Contract unsigned.

**ContractParty / Company conflation**
Current CRM edits rewrite legal-party history.

**ContractParty / Signer conflation**
Company and individual signature actor collapse.

**Signer / Contact conflation**
Contact updates rewrite signer evidence.

**Signer / User conflation**
Platform user is assumed legal signatory.

**Signer / PortalMembership conflation**
Signing grants portal access.

**Signer / SignatureEvent conflation**
Expected participant and evidence become one record.

**Signer viewed / signed conflation**
Engagement becomes execution.

**One signer signed / fully executed conflation**
Partial signature becomes complete agreement.

**All UI signer rows signed / verified execution conflation**
Frontend becomes legal authority.

**SignatureRequest / ContractVersion conflation**
Provider envelope becomes agreement version.

**SignatureRequest / Contract conflation**
Reissue creates duplicate agreement identity.

**Expired request / expired Contract conflation**
Signing deadline and legal term expiry collapse.

**Cancelled request / terminated Contract conflation**
Pre-execution cancellation becomes post-execution termination.

**SignatureRequest retry / duplicate provider envelope conflation**
Signers receive multiple requests.

**Provider timeout / failed request conflation**
Unknown outcome causes duplicate send.

**Provider event / signer state conflation**
One webhook becomes current business state directly.

**Provider event / Contract execution conflation**
External callback becomes legal truth without verification.

**Webhook retry / second signature conflation**
Duplicate provider callback counts twice.

**Out-of-order provider callback / state regression conflation**
Signed signer returns to Viewed/Pending.

**Unknown provider signer / expected signer conflation**
Evidence attaches to wrong person.

**Provider “completed” / execution verified conflation**
Platform does not verify exact version or signers.

**Signed events / content integrity conflation**
Signers may have signed a different document revision.

**Execution timestamp / last callback time conflation**
Legal execution time becomes wrong.

**Fully signed / effective conflation**
Future-effective Contract becomes active prematurely.

**Execution / Deal Won conflation**
Signature automatically closes commercial opportunity.

**Execution / onboarding started conflation**
Operational workflow starts before required effectiveness/other gates.

**Approval / signing conflation**
Internal authorization appears as external signature.

**Approval of v3 / v4 execution readiness conflation**
Unapproved version gets sent.

**Current Proposal / Contract terms conflation**
Proposal edits rewrite legal terms.

**Proposal accepted / Contract signed conflation**
Commercial acceptance skips legal execution.

**Deal owner / Contract execution authority conflation**
Sales ownership gains legal power.

**Contract owner / signer authority conflation**
Internal Contract assignee impersonates external signer.

**Portal user / signer authority conflation**
Portal session can sign for unrelated party.

**Signature event metadata / ordinary Contract-read permission conflation**
Sensitive authentication evidence leaks.

**Provider envelope ID / authorization conflation**
External ID grants access.

**Artifact ID / authorization conflation**
Direct file access bypasses Contract permissions.

**Signer replacement / simple field edit conflation**
Execution expectations silently change mid-request.

**Party change / draft metadata edit conflation**
Legal agreement scope changes without new version.

**Provider unavailable / Contract unsigned conflation**
Integration outage alters legal truth.

**Proposal unavailable / no Proposal lineage conflation**
Supporting service failure erases origin.

**Artifact unavailable / no executed artifact ever existed conflation**
Operational failure is mistaken for legal absence.

**Generic ContractDetail PATCH**
One endpoint can modify version, signer and execution truth directly.

**Manual “mark signed” button**
User bypasses provider/evidence resolver.

**Manual reconciliation / normal viewer permission conflation**
Ordinary user can force legal execution.

**Cache by Contract ID only**
v3/v4 and privileged execution evidence collide.

**100/019 duplicate Contract backend**
Original Contract Workspace and Detail diverge.

**100/070 duplicate signing engine**
Portal and Team use different signature truth.

**100/099 duplicate execution state**
Library and Detail disagree on signed/executed state.

**100/029 duplicate approval backend**
Contract Detail creates custom approval state.

**100/030 duplicate signed-file backend**
Execution stores files independently.

**100/096 duplicate Deal closure logic**
Contract signing owns Deal stage.

**100/097–098 duplicate Proposal lineage**
Contract references wrong commercial version.

No additional screen is required.

These are **exact ContractVersion control, legal-party/signer identity, signature-provider evidence, execution certification, immutable signed artifacts, effectiveness, Proposal/Deal lineage, authorization, concurrency and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL CONTRACT 360, EXACT-VERSION SIGNING, EXECUTION VERIFICATION & LEGAL-EVIDENCE ANCHOR**

**Domain directive:**
**Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ SignatureRequest ≠ SignatureEvent/Evidence ≠ Approval ≠ ExecutionState ≠ ExecutedArtifact ≠ EffectiveState/TermState ≠ Proposal/ProposalVersion ≠ Deal.**

**Identity directive:**
Design 019 remains the canonical Contract identity. Design 100 is a detail/execution composition over that exact Contract and never creates a separate SignedContract/ExecutedContract entity.

**Projection directive:**
`ContractDetailView` remains rebuildable and permission-safe. Parties, signers, execution progress, artifacts, Proposal/Deal context and provider state remain source-owned.

**Version directive:**
latest draft, latest issued and executed ContractVersions remain independently identifiable. “Latest” can never substitute for “executed.”

**Immutability directive:**
materially issued ContractVersions are protected, and executed ContractVersions are permanently immutable. Any later legal change requires explicit new-version/amendment lineage rather than mutation.

**Integrity directive:**
the version prepared, issued, signed, verified and stored should be cryptographically/fingerprint traceable to the same exact legal content wherever integration capabilities allow.

**Party directive:**
ContractParty represents version-bound legal-party evidence and remains distinct from mutable CRM Company/Client identity.

**Signer directive:**
Signer represents an execution requirement/participant for one exact ContractVersion and remains separate from Contact, User, PortalMembership and ContractParty.

**Signer-history directive:**
signer substitutions, requirement changes and signing order changes are explicit/version/request-safe and historical. They can never silently overwrite already-issued execution expectations.

**Approval directive:**
where required, canonical Design 029 approval targets the exact ContractVersion. Approval of one version never authorizes another version automatically and never equals signature/execution.

**Signature-request directive:**
every SignatureRequest references one exact immutable ContractVersion plus validated signer requirements. Reissue/retry preserves previous requests and never retargets an existing request to a newer version.

**Provider directive:**
signature vendors are adapters around canonical Contract execution. Provider-specific envelopes and recipient objects remain integration metadata/evidence—not parallel Contract business records.

**Idempotency directive:**
preparation, provider request creation, callbacks, reconciliation, execution finalization and executed-artifact retrieval are replay-safe. Retry/double-click must never create duplicate signing requests or duplicate execution.

**Unknown-outcome directive:**
provider timeout or ambiguous request creation results in reconciliation-required state. The system must reconcile before issuing another envelope when duplication is possible.

**Webhook directive:**
signature callbacks require provider verification, replay protection, tenant/provider binding and deduplication before they may contribute to execution evidence.

**Evidence directive:**
SignatureEvents are append-oriented evidence linked to exact request, signer and version. Provider events themselves never directly become canonical Contract execution state.

**Ordering directive:**
out-of-order provider callbacks are resolved through occurrence semantics and state-machine rules. Older Viewed/Invited events cannot regress a signer already proven Signed.

**Execution directive:**
canonical execution is resolved server-side from exact ContractVersion + expected SignatureRequest + required signers + verified evidence + integrity requirements. The frontend can display progress but cannot declare execution.

**Fully-signed directive:**
“all signatures observed” and “verified executed” remain distinct where artifact/evidence/integrity reconciliation is still outstanding.

**Finalization directive:**
execution finalization is idempotent and atomically pins the exact `executedVersionId` plus verified execution evidence/time within the Contract domain.

**Artifact directive:**
the signed executed artifact is an immutable Design 030 Asset/FileVersion linked to the exact ContractVersion and SignatureRequest. It never replaces ContractVersion as legal-domain truth and is never overwritten by later PDF generation.

**Artifact-failure directive:**
failure to retrieve/store the signed artifact remains a separate operational/legal-evidence condition. It must never automatically rewrite verified signature evidence into `Unsigned`.

**Effectiveness directive:**
verified execution, legal effectiveness, term expiration and termination remain separately modeled. Fully signed can still be “not effective yet.”

**Expiry directive:**
SignatureRequest expiry and Contract term expiry are unrelated state dimensions and must never share one ambiguous business field.

**Termination directive:**
terminating an executed Contract is a governed Contract-domain action and remains distinct from cancelling or expiring a pre-execution SignatureRequest.

**Proposal directive:**
Designs 097–098 remain canonical for Proposal lineage. Contract references the exact accepted/source ProposalVersion and becomes independent of later Proposal drafts.

**Deal directive:**
Design 096 remains authoritative for Deal stage/lifecycle. Verified Contract execution may satisfy a Deal gate or trigger reevaluation but cannot silently set the Deal to Won.

**Downstream directive:**
Billing, onboarding and other future workflows must consume canonical verified execution/effectiveness events rather than raw signature-provider callbacks or UI badges.

**Portal directive:**
Design 070 must use this same ContractVersion/Signer/SignatureRequest/Execution foundation through a client-safe projection. Client and Team signing histories can never diverge.

**Authorization directive:**
Contract read/edit, versioning, party management, signer management, signature send/cancel, reconciliation, execution evidence, executed-artifact access and termination remain independently server-authorized.

**Signer-security directive:**
external signer identity is established by the signing workflow/provider's trusted authentication evidence. Team User, Contact, email equality or PortalMembership never prove signing authority by themselves.

**Reconciliation directive:**
manual execution reconciliation is exceptional, permission-restricted and Audit-heavy. Ordinary users must never receive a simple “Mark as Signed” bypass around evidence validation.

**Concurrency directive:**
Contract/version mutations and SignatureRequest preparation use revision checks. A draft cannot be edited/replaced underneath an in-flight exact-version signature process.

**Partial-failure directive:**
Contract core, version data, stored parties/signers, stored evidence, live provider status, artifact storage, Proposal context and Deal context can fail independently. Related dependency failure never makes the Contract appear missing, unsigned, executed or effective falsely.

**Caching directive:**
Contract detail caches vary by membership, authorization revision, selected ContractVersion, Contract revision, SignatureRequest revision, execution revision and artifact revision. Contract ID alone is insufficient.

**Performance directive:**
load exact ContractVersion plus batched parties/signers and derived progress first; lazy-load large signature-event/Audit histories and provider diagnostics rather than polling/retrieving full provider history on every render.

**Activity directive:**
Contract Activity can summarize execution events but remains a projection and never substitutes for SignatureEvent, ApprovalDecision or verified Contract execution.

**Audit directive:**
version issuance, party/signer changes, approval, signature preparation/send/cancel, signer replacement, exceptional reconciliation, execution verification and termination require strong actor/version-aware Audit evidence while secrets remain excluded.

**Future-reuse directive:**
Designs **101–103** must consume canonical verified Contract/commercial lineage where invoice/payment eligibility depends on signed or effective terms and must never infer billing authority from a raw signature-provider callback.

**Overlap directive:**
Designs **019, 029–030, 053, 070, 096–103** must share one continuous **ProposalVersion → Contract → ContractVersion → Parties/Signers → SignatureRequest → Verified Evidence → ExecutedVersion → ExecutedArtifact → Effectiveness → Billing eligibility** lineage while preserving Proposal, Deal, signature execution, artifact storage and finance as independently canonical domains.

**Consolidation directive:**
**STANDARDIZE ONE CONTRACT EXECUTION FOUNDATION — CANONICAL CONTRACT IDENTITY + IMMUTABLE EXACT CONTRACTVERSIONS + EXPLICIT LATEST-DRAFT/LATEST-ISSUED/EXECUTED VERSION REFERENCES + VERSION-BOUND CONTRACTPARTIES/SIGNERS + PINNED APPROVAL + IDEMPOTENT SIGNATUREREQUESTS + VERIFIED/REPLAY-SAFE APPEND-ORIENTED SIGNATURE EVIDENCE + SERVER-AUTHORITATIVE EXECUTION RESOLUTION + ATOMIC EXECUTEDVERSION CERTIFICATION + IMMUTABLE ASSET-BACKED SIGNED ARTIFACT + DISTINCT EFFECTIVENESS/TERM STATE + CLIENT-SAFE SHARED PORTAL PROJECTION — AND NEVER ALLOW CURRENT CRM VALUES, PROVIDER CALLBACKS, SIGNER COUNTS, FRONTEND BADGES, NEWER DRAFTS, PROVIDER AVAILABILITY OR FILE-STORAGE STATE TO SUBSTITUTE FOR OR REWRITE VERIFIED LEGAL EXECUTION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **100 / 153** |
| **PASS**                                   |                        **100** |
| **STANDARDIZE decisions**                  |                         **98** |
| **Potential implementation-overlap flags** |                         **91** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**100 / 153 = 65.4% audited.**

## Canonical Contract execution architecture after Design 100

```text
                       CONTRACT
                 stable legal identity
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Draft v4      Issued v3     Historical v2
                          │
                          ↓
                   CONTRACT VERSION 3
                          │
              ┌───────────┼───────────┐
              ↓           ↓           ↓
           Parties      Signers    Approval
                          │
                          ↓
                  SignatureRequest
                          │
                   SignatureEvents
                          │
                          ↓
                Execution Resolver
                          │
                          ↓
                   VERIFIED v3
                          │
                          ↓
                 Executed Artifact
                          │
                          ↓
                 Effectiveness State
```

The legal-version invariant is now strict:

```text
Contract C-100

Executed v3
New draft v4 exists

Therefore:

Contract exists                 ✓
v3 executed                     ✓
v4 exists                       ✓
v4 executed                     ✕

“Latest” must NEVER be used
as a synonym for “executed.”
```

The signature boundary is equally strict:

```text
Signer A signed
Signer B signed
Signer C still pending

        ↓

Execution = PARTIALLY SIGNED

NOT:
Contract executed.
```

And even:

```text
A signed
B signed
C signed
```

can remain:

```text
FULLY SIGNED — VERIFICATION / ARTIFACT RECONCILIATION PENDING
```

until the platform verifies the exact version, request, signers, evidence, and integrity conditions.

Likewise:

```text
Verified Contract execution
        ≠
Contract currently effective
        ≠
Deal won
        ≠
Invoice paid
```

Each is a separate canonical business fact.

## Next Sequential Audit Target

### **Design 101 — Invoice Library / Invoice List**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
