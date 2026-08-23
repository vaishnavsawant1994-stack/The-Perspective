# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 070 — Client Contract Detail & Digital Signing

Its frozen identity and supplied route annotation **`/client/contracts/[contractId]`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 070 should become the **canonical Client Portal contract-detail and digital-signing execution surface** for one authorized Contract and its exact issued ContractVersion.

Its governing boundary is:

> **Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ SignatureRequest ≠ SignatureEvent/Evidence ≠ Approval ≠ ExecutedArtifact ≠ ClientAction.**

The central implementation rule is:

> **Design 070 must always operate against an exact issued ContractVersion and an explicitly eligible Signer. Signing never acts on a mutable “latest contract,” and later Profile, Organization, role, or membership changes must never rewrite historical Contract-party, signer, signature, or executed-document evidence.**

---

# 1. Classification

| Audit field                               | Classification                                                                                                                                            |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                             | **070**                                                                                                                                                   |
| **Canonical name**                        | **Client Contract Detail & Digital Signing**                                                                                                              |
| **Product area**                          | Client Portal / Contracts / Digital Execution                                                                                                             |
| **User surface**                          | **Client Portal**                                                                                                                                         |
| **Screen class**                          | Contract Entity Detail + Digital Signing Workflow                                                                                                         |
| **Classification**                        | **Portal Entity Detail Variant — Contract Execution & Signing Family**                                                                                    |
| **Primary purpose**                       | Let an authorized Client inspect an exact issued ContractVersion, understand party/signing state, and perform formal signature actions only when eligible |
| **Canonical Contract foundation**         | Design 019                                                                                                                                                |
| **Client Contract collection foundation** | Design 053                                                                                                                                                |
| **Primary canonical entity**              | **Contract**                                                                                                                                              |
| **Immutable issued document entity**      | **ContractVersion**                                                                                                                                       |
| **Legal party entity**                    | **ContractParty**                                                                                                                                         |
| **Human signing role**                    | **Signer**                                                                                                                                                |
| **Signing workflow entity**               | **SignatureRequest**                                                                                                                                      |
| **Evidence entity**                       | **SignatureEvent / SignatureEvidence**                                                                                                                    |
| **Executed output**                       | **ExecutedContractArtifact**                                                                                                                              |
| **Approval dependency**                   | Design 029 / 052 where pre-sign approval exists                                                                                                           |
| **Client Action dependency**              | Design 047                                                                                                                                                |
| **Asset/File dependency**                 | Design 030                                                                                                                                                |
| **Profile dependency**                    | Design 059                                                                                                                                                |
| **Organization dependency**               | Design 060                                                                                                                                                |
| **Portal access dependency**              | Design 062                                                                                                                                                |
| **Notification dependency**               | Designs 061 / 064                                                                                                                                         |
| **Activity dependency**                   | Design 063                                                                                                                                                |
| **Internal Contract detail overlap**      | Designs 019 / 100                                                                                                                                         |
| **Parent shell**                          | `ClientPortalShell` — Design 002                                                                                                                          |
| **Primary read model**                    | `ClientContractDetailView`                                                                                                                                |
| **Template family**                       | `ClientContractExecutionDetailTemplate`                                                                                                                   |
| **Auth**                                  | Required                                                                                                                                                  |
| **Authorization**                         | Active Portal membership + Contract visibility + exact Signer eligibility for signature actions                                                           |
| **Implementation priority**               | **Critical Legal / Evidence / Commercial Execution**                                                                                                      |
| **Reuse level**                           | **Extremely High with Designs 019 and 053**                                                                                                               |

Design 070 should answer:

> **“Which exact ContractVersion am I viewing, who are the legal parties, who still needs to sign, am I personally an eligible Signer, what signature evidence already exists, whether the Contract is partially or fully executed, and which immutable executed artifact is authoritative?”**

Canonical architecture:

```text
Contract
   │
   ↓
ContractVersion
   │
   ├── ContractParty snapshots
   │
   ├── Signer assignments
   │
   └── issued document artifact
             │
             ↓
      SignatureRequest(s)
             │
             ↓
      SignatureEvent(s)
             │
             ↓
     Execution State Resolver
             │
             ↓
   ExecutedContractArtifact
             │
             ↓
          Design 070
```

---

# 2. Reuse

## Design 019 remains the canonical Contract execution engine

Design 019 established:

> **Contract ≠ ContractVersion ≠ Party ≠ Signer ≠ Approval ≠ SignatureRequest ≠ SignatureEvent.**

Design 070 must reuse that architecture directly.

Do **not** create:

```text
ClientContract
PortalContract
ClientSignature
SignedContractRecord
```

as independent Contract truth.

Correct:

```text
Design 019
Canonical Contract domain
        │
        ├── Design 053
        │   Client Contract library
        │
        └── Design 070
            Client Contract detail/signing
```

---

## Design 053 remains the Client Contract collection

Design 053 answers:

> Which Contracts can I access?

Design 070 answers:

> What is the exact state of this Contract and can I sign this exact version?

The same canonical `Contract` and `ContractVersion` must flow between them.

---

## Design 070 ≠ Design 100

Later:

**Design 100 — Contract Detail / Signing & Execution Detail**

Expected distinction:

```text
Design 070
Client-safe Contract execution

Design 100
Internal Contract operations/execution detail
```

Both consume the same Contract engine.

The Client surface must not expose internal:

* legal notes,
* routing diagnostics,
* provider debugging,
* internal approval comments,
* administrative overrides.

---

## Reuse Design 029 / 052 Approval

If Contract issuance or execution requires internal/client approval:

```text
ApprovalRequest
≠
SignatureRequest
```

An approved ContractVersion may become eligible for signing.

Approval itself is not legal signature evidence.

---

## Reuse Design 047 ClientAction

Potential current actions:

* Review Contract,
* Sign Contract,
* Complete required signature,
* Await another Signer.

These are projections of canonical Contract/Signer state.

Do not create:

```text
contract.requiresAction
```

as a manually maintained Client-only flag.

---

## Reuse Design 030 Asset/FileVersion

Issued Contract documents and executed Contract artifacts must use the canonical file domain.

Conceptually:

```text
ContractVersion
      ↓
Issued Artifact
      ↓
Asset / FileVersion
```

and later:

```text
ExecutedContractArtifact
      ↓
Asset / FileVersion
```

No Contract-specific blob storage.

---

## Reuse Design 059/060 identity boundaries

Design 059 established:

> current personal profile ≠ historical signer evidence.

Design 060 established:

> current Organization profile ≠ historical Contract-party snapshot.

Design 070 must preserve both.

---

## Reuse Design 062 Portal access

Portal roles can permit access to Contracts generally.

But:

> Portal Role ≠ exact Signer assignment.

Design 062 cannot make someone a Signer merely by granting a Contract-related Portal role.

---

## Reuse Notifications and Activity separately

Contract signing events can produce:

```text
SignatureRequested
ContractSigned
ContractFullyExecuted
```

which may feed:

* Design 064 Notifications,
* Design 063 Activity,
* Design 039 Audit.

None of these replace the Contract domain.

---

# 3. Entities

## Contract ≠ ContractVersion

`Contract` is the stable commercial/legal agreement identity.

`ContractVersion` is the exact immutable textual/document version.

Conceptually:

```text
Contract C-101
├── ContractVersion v1
├── ContractVersion v2
└── ContractVersion v3
```

Only one exact issued version can be the subject of a given SignatureRequest.

---

## ContractVersion should become immutable once issued

Once sent for signature:

> its legally relevant content must not be editable in place.

Any material change must produce:

```text
ContractVersion v4
```

rather than modifying v3.

Otherwise:

* signatures become detached from what was seen,
* signer evidence becomes invalid,
* audit trail becomes ambiguous.

---

## Draft ContractVersion ≠ issued ContractVersion

Conceptually:

```text
DRAFT
ISSUED
SUPERSEDED
EXECUTED
VOIDED
```

or equivalent version lifecycle.

Exact enum Phase 3D.

But an unissued Draft must not be signable.

---

## Latest ContractVersion ≠ signable ContractVersion

Critical:

```text
Latest internal ContractVersion:
v5

Issued for signature:
v4
```

Design 070 must show/sign **v4**.

Never:

```text
contract.latestVersion
```

for signature execution.

Resolve:

```text
currentIssuedContractVersion
```

under canonical issuance/signing state.

---

## ContractParty ≠ Signer

A ContractParty is a legal/business party.

Example:

```text
ContractParty:
Acme Technologies GmbH
```

Signer:

```text
Jane Smith
CEO
```

Jane may sign on behalf of Acme.

They are not the same entity.

---

## Party snapshot ≠ current OrganizationProfile

At issuance:

```text
ContractPartySnapshot
├── legal name
├── registered address
├── registration identifiers
└── other issued legal data
```

must be preserved.

Later changes in Design 060 cannot rewrite it.

---

## Party ≠ Portal organization membership

A legal party can exist even if none of its representatives currently have Portal access.

Portal access is a separate technical relationship.

---

## Signer ≠ User

A Signer can reference a User where one exists.

But Signer is the **version-specific legal execution role**.

Conceptually:

```text
Signer
├── contractVersionId
├── partyId
├── userId / external identity reference
├── signer snapshot
├── signing order if applicable
└── eligibility/state
```

The stable User identity does not replace the Signer assignment.

---

## Signer snapshot ≠ current User Profile

At issuance/signing time, preserve relevant signer evidence such as:

* name,
* email/identity used,
* title/authority representation where required,
* party relationship.

If the user later changes Profile name/title:

historical Signer evidence remains unchanged.

---

## Job title ≠ signing authority

A current Profile saying:

> CEO

does not automatically make that person legally eligible to sign.

Eligibility comes from explicit Signer assignment/policy.

---

## Portal Contract permission ≠ Signer

A user may have:

```text
contracts.read
```

or even broad Contract-management capability.

That does not make them a Signer.

---

## Signer ≠ ApprovalParticipant

One person may be:

* internal approver,
* Client approver,
* legal Signer,

in different workflows.

These remain separate assignments.

---

## Approval ≠ signature

Permanent:

```text
ApprovalDecision APPROVED
≠
SignatureEvent SIGNED
```

An Approval can authorize proceeding.

Only Signature evidence proves signature.

---

## Contract viewed ≠ signed

If Design 070 tracks view state:

```text
VIEWED
```

means only that the document was opened/viewed according to reliable evidence.

It never implies:

* acceptance,
* signature,
* approval.

---

## Viewed ≠ legally acknowledged automatically

Do not infer legal acknowledgement from view telemetry unless a specific governed legal workflow establishes it.

---

## SignatureRequest ≠ SignatureEvent

`SignatureRequest` represents the request/process:

> Please sign ContractVersion v4.

`SignatureEvent` represents something that actually happened:

* request sent,
* viewed,
* signing started,
* signed,
* declined,
* expired,
* provider callback,
* verification.

Keep them distinct.

---

## SignatureRequest binds exact ContractVersion

Correct:

```text
SignatureRequest SR-22
→ ContractVersion CV-4
```

Never:

```text
SignatureRequest
→ Contract
→ current latest
```

---

## SignatureRequest ≠ signer evidence

A request proves the system asked.

It does not prove the person signed.

---

## SignatureEvent ≠ executed Contract

One Signer signing can produce valid signature evidence while other required Signers remain pending.

Therefore:

```text
one SIGNED event
≠
Contract fully executed
```

---

## Partial signing ≠ fully executed

Example:

```text
Required Signers:
A ✓
B ✓
C pending
```

State:

> Partially Signed / Awaiting Signatures

not:

> Executed.

---

## Execution should be policy-resolved

A ContractVersion is fully executed only when the execution policy's required Signers/signatures are satisfied.

Conceptually:

```text
required signing conditions
+
valid signature evidence
+
no blocking execution condition
       ↓
EXECUTED
```

Do not base it on:

```text
signatureCount > 0
```

or merely:

```text
all currently visible Portal users signed
```

---

## Signing order may matter

If sequential signing exists:

```text
Signer A
   ↓
Signer B
   ↓
Signer C
```

Signer B may not yet be eligible until A signs.

Do not expose active Sign CTA merely because B is a Signer.

No signing-order feature is added unless supported by frozen workflow; architecture must simply tolerate it.

---

## Declined ≠ rejected approval

A Signer declining to sign is part of signing workflow.

It is not an ApprovalDecision `REJECTED`.

---

## Expired SignatureRequest ≠ Contract cancelled automatically

The Contract may still exist and could potentially be reissued or have a new signing request according to policy.

Do not collapse request expiry into Contract lifecycle cancellation.

---

## SignatureEvent evidence should be append-oriented

Events such as:

```text
REQUEST_SENT
VIEWED
SIGNED
DECLINED
EXPIRED
VOIDED
```

should preserve history.

Do not overwrite:

```text
signature.status = SIGNED
```

as the only evidence.

---

## Provider event ≠ canonical business event automatically

External signature providers may emit callbacks.

These should be normalized into internal signature evidence after:

* authenticity verification,
* idempotency handling,
* ContractVersion matching,
* Signer matching.

---

## Provider accepted ≠ signed

An API call that successfully creates a signing envelope does not mean the Contract is signed.

---

## Provider “completed” ≠ blindly trusted final truth

The backend should verify expected:

* ContractVersion,
* signer set,
* evidence,
* executed document availability,

before canonical execution state becomes final.

---

## Signature evidence

Depending on provider/legal model, evidence may include:

* provider envelope/request ID,
* signer identity snapshot,
* signed timestamp,
* event sequence,
* cryptographic/document hash,
* signature certificate,
* audit trail artifact,
* source IP/device metadata where legally/operationally appropriate.

Exact evidence requirements Phase 3D.

Client DTO should expose only the safe subset.

---

## ContractVersion document hash

For legal integrity, the platform should be able to establish:

> The file signed is exactly ContractVersion v4.

A content/document hash or equivalent integrity reference is strongly advisable.

---

## Issued artifact ≠ executed artifact

The ContractVersion may initially have:

```text
IssuedContractArtifact
```

Then after all signatures:

```text
ExecutedContractArtifact
```

The executed artifact can include signature marks/certificates and is a new authoritative frozen output.

---

## ExecutedArtifact must be immutable

Once canonical execution is complete:

> the executed Contract artifact must never change in place.

A corrected/new agreement requires a new ContractVersion/amendment/renewal workflow.

---

## ExecutedArtifact ≠ current Contract template

Future edits to proposal/templates/contracts must not affect the signed artifact.

---

## ExecutedArtifact ≠ generated-on-demand from current fields

Never reconstruct a “signed Contract” by merging today's:

* Organization name,
* Profile title,
* Contract template,
* signer name.

The exact executed artifact must be retained.

---

## Contract amendment ≠ editing executed version

If business terms change after execution:

```text
Amendment / new ContractVersion
```

must be created with explicit lineage.

Executed v4 remains immutable.

---

## Renewal ≠ ContractVersion overwrite

Design 057 already established:

> Renewal/continuation does not mutate executed Contract history.

---

## ClientAction ≠ signing truth

A ClientAction such as:

> Sign Contract v4

is derived.

If another required condition changes or the request expires, actionability updates.

The ClientAction cannot itself mark the Contract signed.

---

## Notification ≠ signing evidence

A Notification:

> Contract signed successfully

is presentation/attention.

It is not the legal record.

---

## Activity ≠ execution evidence

Design 063 can show:

> Contract fully executed.

But execution truth remains Contract + Signature evidence.

---

# 4. Permissions

Design 070 requires layered authorization.

Conceptually:

```text
Portal membership
+
Contract visibility
+
exact ContractVersion visibility
+
party context
+
Signer eligibility
+
SignatureRequest state
+
current signing policy
```

---

## Contract read ≠ sign

Permanent:

```text
contracts.read
≠
contracts.sign
```

---

## Sign capability ≠ exact Signer assignment

Even a user with general signing capability must also be the eligible Signer for this exact ContractVersion/SignatureRequest.

---

## Portal Admin ≠ Signer

Design 062 Portal administration must never imply legal signing authority.

---

## Organization role ≠ signing authority

Being:

* CEO,
* Director,
* Owner,

in Profile/Organization data is descriptive unless explicitly incorporated into governed Signer assignment.

---

## Another member cannot sign on behalf of Signer casually

A Client user must never alter:

```text
signerId
```

in a request to sign as another person.

Current authenticated identity must be matched against canonical eligible Signer.

---

## Signer identity matching

Backend needs robust association between:

```text
authenticated User/AuthIdentity
```

and:

```text
Signer
```

for Portal-native signing.

Email equality alone should not be treated as sole authorization.

---

## Contract visibility may exceed signing eligibility

Other Client users may be allowed to view the Contract while only selected Signers may sign.

---

## Party visibility

A Signer for one party should see only Client-safe information.

Internal legal notes or private Counterparty administration data remain hidden.

---

## Executed artifact download permission

Potential separation:

```text
contract.read
≠
contract.download_executed
```

where the permission model requires it.

Use secure Asset/FileVersion access.

---

## Signature evidence visibility

Clients may see:

* who signed,
* when,
* execution status.

They should not automatically receive all raw provider/security evidence.

---

## Signature certificate/audit trail

If exposed for download, authorize separately and use exact FileVersion.

---

## Approval visibility

Internal approval records should not leak simply because signing is Client-visible.

Only Client-safe approval status, if frozen design needs it, should be exposed.

---

## Direct ContractVersion ID reauthorization

A user changing the request to an older/internal/unissued version must not gain access.

---

## Direct executed Artifact ID reauthorization

Knowing a FileVersion or provider envelope ID is insufficient.

---

## Signing deep link/token

If external provider signing URLs/tokens exist:

* short-lived,
* recipient-bound,
* ContractVersion-bound,
* Signer-bound,
* non-transferable as far as provider allows.

Do not expose reusable permanent signing URLs.

---

## Reauthentication

For high-assurance signing, the source Auth/signing policy may require:

* recent login,
* MFA/re-authentication,
* OTP or provider authentication.

Design 070 must respect that policy.

It should not implement insecure bypass merely because the user already has a Portal session.

---

## Signing from stale tab

When the user clicks Sign:

backend must revalidate:

* ContractVersion is still issued,
* SignatureRequest is active,
* Signer is still eligible,
* Contract has not been superseded/voided,
* no conflicting execution state exists.

---

## Cross-tenant protection

Every Contract, Party, Signer and SignatureRequest must belong to the current authorized Client relationship/context.

---

# 5. States

Design 070 must keep Contract lifecycle, Version state, SignatureRequest state, Signer state, execution state, and ClientAction separate.

### Contract/version state

```text
Draft
Issued
Superseded
Voided
Executed
Expired / Terminated where applicable
```

### Signature request state

```text
Not Requested
Preparing
Sent
Delivered / Available
Viewed
Signing In Progress
Signed
Declined
Expired
Cancelled / Voided
Failed
```

### Aggregate execution state

```text
Awaiting Signatures
Partially Signed
Fully Signed
Execution Processing
Executed
Execution Verification Failed
```

### Current-user state

```text
Viewer Only
Eligible to Sign
Waiting for Signing Order
Already Signed
Signature Declined
Signature Expired
Action Restricted
```

### Artifact state

```text
Issued Artifact Available
Executed Artifact Processing
Executed Artifact Available
Executed Artifact Verification Failed
```

These must not become one `contract.status`.

---

## Issued ≠ SignatureRequest sent

A ContractVersion may be issued before signature delivery has succeeded.

---

## Sent ≠ viewed

Permanent.

---

## Viewed ≠ signed

Permanent.

---

## Signing started ≠ signed

Permanent.

---

## Signed by current user ≠ fully executed

Permanent.

---

## All signatures collected ≠ executed artifact available necessarily

Possible short transition:

```text
All required signatures collected
↓
Execution artifact/certificate processing
↓
Executed
```

Do not show download before canonical artifact is ready.

---

## Executed artifact processing ≠ signing failed

The signatures can be valid while final artifact generation is still pending.

---

## Provider failure ≠ Contract void

A temporary provider outage does not cancel the Contract.

---

## Signature delivery failed ≠ Signer declined

Permanent.

---

## Request expired ≠ Contract rejected

Permanent.

---

## Superseded ContractVersion ≠ rejected Contract

Permanent.

---

## Voided ContractVersion ≠ deleted Contract

Historical records remain.

---

## Already signed ≠ action required

Current-user ClientAction should disappear/change appropriately.

---

## Another Signer pending

Current user may see:

> Your signature is complete. Waiting for 1 additional signature.

That is different from:

> Fully executed.

---

## Signer state unavailable ≠ not a Signer

Critical:

```text
Signer resolver unavailable
≠
Viewer only
```

---

## Signature provider unavailable ≠ unsigned

Unknown/provider state must be reconciled before retry.

---

## Timeout after signing

Critical high-stakes case.

If the user completes a provider signing flow but the Portal receives a timeout:

do **not** immediately instruct/sign again.

State should become something equivalent to:

> Signature confirmation pending.

Backend verifies provider status before allowing retry.

---

## Duplicate signature prevention

Signing commands/request callbacks must be idempotent.

The same Signer cannot create duplicate canonical signature evidence through retries.

---

## State Coverage

Design 070 inherits Design 150 plus:

```text
Contract Detail Loading
Contract Detail Available
Contract Restricted
Contract Version Unavailable

Issued Contract Version Available
Contract Version Superseded
Contract Version Voided

Signature Not Requested
Signature Request Preparing
Signature Request Sent
Signature Request Available
Contract Viewed

Eligible to Sign
Waiting for Signing Order
Signing In Progress
Signature Confirmation Pending
Signature Confirmed
Already Signed

Signature Declined
Signature Request Expired
Signature Request Cancelled
Signature Provider Unavailable
Signature Outcome Uncertain

Awaiting Other Signers
Partially Signed
All Required Signatures Collected

Executed Artifact Processing
Contract Fully Executed
Executed Artifact Available
Execution Verification Failed

Client Action Restricted
Partial Contract Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve legal clarity and execution state.

Conceptually:

```text
Contract Detail
↓
Contract Identity / Exact Version
├── Contract title/reference
├── issued date
├── exact ContractVersion
└── overall execution state
↓
Contract Document / Preview
↓
Parties & Signers
    ├── legal party
    ├── signer
    ├── signer state
    └── signed timestamp where applicable
↓
Current User Action
    └── Sign Contract / View status
↓
Executed Artifact
```

Only elements present in the frozen design should render.

---

## Exact version must stay visible

Especially near the Sign action.

The Client must understand:

> **You are signing Contract version 4.**

Avoid ambiguous:

> Sign Contract

without exact subject context where the UI can show it.

---

## Desktop should not expose provider administration

Do not expose:

* provider envelope debugging,
* webhook history,
* API response logs,
* internal routing failures,
* secret certificate internals.

---

## Tablet

Following Design 152:

* Contract metadata stacks cleanly,
* Signer table can become structured cards,
* exact version remains visible,
* Sign action remains prominent,
* document preview remains usable without horizontal overflow.

---

## Mobile

Priority:

```text
Contract
↓
Title / Contract reference
↓
Exact Version
↓
Execution State
↓
Your Signing Status
↓
Sign / View Signed Contract
↓
Parties & Other Signers
↓
Contract Document
↓
Executed Artifact
```

Do not bury the Signer's own required action beneath the entire legal document summary.

---

## Mobile signing safety

Before sending the user into a signature flow, clearly communicate:

* Contract identity,
* exact version,
* Signer identity/party,
* whether this is a formal signature action.

No ambiguous one-tap destructive behavior.

---

## Mobile partial signing

Use text:

> You signed on August 22. Waiting for 1 other signer.

not only completion icons.

---

## Accessibility

Signer/status rows should expose semantic text:

> Acme Technologies GmbH. Jane Smith. Signed August 22 at 10:32 AM.

Do not rely only on checkmarks.

---

## Document accessibility

The issued Contract artifact should use accessible document rendering/download where available.

If a PDF preview is used, downloadable accessible source/document should remain available according to frozen UX and permissions.

---

## Signature CTA accessibility

The action needs a clear accessible name:

> Sign Contract version 4

rather than:

> Continue.

---

# 7. Backend Requirements

## Read architecture

```text
Design 070
    ↓
ClientPortalSessionContext
    ↓
Contract Authorization
    ↓
ClientContractDetailQueryService
    │
    ├── Contract
    ├── exact issued ContractVersion
    ├── ContractParty snapshots
    ├── Signers
    ├── SignatureRequests
    ├── normalized SignatureEvents/Evidence
    ├── aggregate execution state
    ├── current-user Signer eligibility
    ├── issued artifact
    ├── executed artifact
    └── current ClientAction
    ↓
ClientContractDetailView
```

---

## Exact issued-version resolver

Conceptually:

```text
resolveClientContractVersion(
    contractId,
    membershipId
)
```

must return the exact version currently valid for this Client execution context.

Never select by maximum version number.

---

## Issuance command

When a ContractVersion is formally issued:

```text
issueContractVersion()
```

should freeze:

* version content,
* party snapshots,
* signer assignments,
* document artifact/hash,
* issuance metadata.

Do not calculate these from live Profile/Organization records at signing time later.

---

## Party snapshot creation

At issuance:

```text
current governed legal organization data
        ↓
ContractPartySnapshot
```

The snapshot becomes historical/version-specific.

Subsequent Organization edits do not alter it.

---

## Signer snapshot creation

At issuance/request creation:

```text
eligible person
+
relevant signing identity context
        ↓
Signer / SignerSnapshot
```

Subsequent Profile changes do not alter it.

---

## SignatureRequest creation

Use a narrow server command such as:

```text
createSignatureRequest(
    contractVersionId,
    signerIds
)
```

with all Signers resolved server-side.

The browser never supplies arbitrary legal Party/Signer data unchecked.

---

## Provider adapter

Use an abstraction:

```text
SignatureProviderAdapter
├── createRequest()
├── getSigningSession()
├── cancelRequest()
├── verifyWebhook()
├── fetchStatus()
├── fetchExecutedArtifact()
└── fetchEvidence()
```

so the Contract domain does not depend on one vendor.

---

## Provider request idempotency

Creating a SignatureRequest must tolerate retry without creating multiple envelopes/requests for the same canonical issuance intent.

---

## Webhook verification

Provider callbacks require:

* signature/authenticity verification,
* replay protection/idempotency,
* expected provider account,
* expected request/envelope ID,
* expected ContractVersion,
* expected Signer.

Do not trust unauthenticated webhook payloads.

---

## Provider event normalization

Conceptually:

```text
ProviderEvent
     ↓
Verification
     ↓
Normalized SignatureEvent
     ↓
Execution state resolver
```

Raw provider status strings must not leak throughout product logic.

---

## Signature evidence immutability

Canonical signature evidence should be append-oriented.

Avoid destructive overwrites.

---

## Signing-session generation

A request to begin signing should verify:

```text
current User
→ authorized Contract
→ exact active ContractVersion
→ matching eligible Signer
→ active SignatureRequest
→ current signing order/policy
```

before issuing a provider session/link.

---

## Short-lived signing session

Signing session URLs/tokens should be short-lived and recipient-specific.

Do not store them permanently in `Contract`.

---

## Current-state recheck

Before presenting or redirecting to signing:

re-fetch/revalidate current canonical execution state.

This protects against stale tabs and superseded versions.

---

## Signing completion reconciliation

After external signing:

```text
provider callback / return
        ↓
fetch/verify provider state
        ↓
normalize signature evidence
        ↓
recalculate aggregate execution state
```

Do not trust a browser redirect query such as:

```text
?status=signed
```

as legal evidence.

---

## Signature idempotency

A repeated callback must not create duplicate signed evidence.

Canonical uniqueness may involve:

```text
providerEventId
signatureRequestId
signerId
eventType
```

or equivalent.

---

## Execution state resolver

Conceptually:

```text
resolveContractExecutionState(
    contractVersion,
    required signers,
    valid signature evidence,
    signing policy
)
```

returns:

* awaiting,
* partially signed,
* all signatures collected,
* executed,

etc.

Frontend must not calculate this.

---

## Executed artifact acquisition

When all execution conditions are satisfied:

```text
Signature provider
      ↓
final signed document / certificate
      ↓
verify expected document/version
      ↓
Asset / FileVersion
      ↓
ExecutedContractArtifact
```

---

## Executed artifact integrity

Store:

* ContractVersion linkage,
* provider reference,
* content hash/checksum,
* completion timestamp,
* evidence linkage.

Do not simply replace the original issued file URL.

---

## Artifact immutability

The executed FileVersion is immutable.

Any later change creates new agreement/version/amendment artifacts.

---

## Approval gate

If Contract must be approved before signing:

```text
ApprovalRequest completed
      ↓
ContractVersion becomes eligible for issuance/signing
```

But ApprovalDecision itself never populates SignatureEvidence.

---

## ClientAction resolver

Conceptually:

```text
ContractVersion
+
Signer
+
SignatureRequest
+
Execution state
+
current user
       ↓
ClientActionResolver
```

Possible states:

* Sign,
* Wait,
* Already Signed,
* No Action,
* Action Restricted,
* Unavailable.

---

## Notification integration

Potential events:

```text
ContractIssued
SignatureRequested
SignerCompleted
ContractFullyExecuted
SignatureRequestExpired
```

can generate notifications according to Design 061 policy.

Mandatory legal/transactional communications remain policy-driven.

---

## Activity integration

Safe events can feed Design 063:

> Contract signed by Jane Smith.

> Contract fully executed.

Activity remains projection only.

---

## Audit integration

Material events should generate Design 039 Audit events such as:

```text
ContractVersionIssued
SignatureRequestCreated
SignatureRequested
SignatureCompleted
SignatureDeclined
SignatureRequestExpired
ContractFullyExecuted
ContractVoided
```

with safe actor/target/evidence references.

---

## Never log secrets

Do not log:

* signing tokens,
* provider secrets,
* private certificate material,
* raw authentication secrets.

---

## Concurrency

Multiple Signers can act concurrently.

Execution-state calculation must be transactionally safe/idempotent.

Two nearly simultaneous signatures must not produce:

* duplicate execution transitions,
* conflicting artifacts,
* lost events.

---

## Signature-order concurrency

If sequential:

Signer B's actionability must update immediately after Signer A completes.

---

## Supersession

If ContractVersion v4 is superseded by v5 before execution:

active SignatureRequests for v4 must follow explicit policy, usually becoming:

* cancelled/voided,
* read-only historical.

They must never silently switch to v5.

---

## Stale Sign CTA protection

If v4 is superseded while user is on Design 070:

sign request must fail safely and refresh current state.

---

## Contract renewal/amendment lineage

New ContractVersion/amendment references the prior executed agreement where appropriate.

Historical executed artifacts remain immutable.

---

## Permission-safe caching

Cache keys must include:

```text
contractId
contractVersionId
membershipId
Signer state revision
execution revision
permission revision
```

Never reuse a Signer's action-enabled payload for a non-Signer viewer.

---

## Partial failure handling

Example:

```text
Contract metadata   ✓
Issued artifact     ✓
Signature provider  ✕
Execution history   ✓
```

Design 070 can still display the Contract and known historical state while showing:

> Signing service temporarily unavailable.

Do not change execution state to Unsigned/Declined.

---

## Backend Requirement Matrix

| Requirement                                 | Status                    |
| ------------------------------------------- | ------------------------- |
| Client Portal authentication                | **Critical**              |
| Active Portal membership                    | **Critical**              |
| Canonical Contract reuse                    | **Critical**              |
| Canonical ContractVersion reuse             | **Critical**              |
| Contract/ContractVersion separation         | **Critical**              |
| Exact issued ContractVersion resolver       | **Critical**              |
| Issued-version immutability                 | **Critical**              |
| Draft/issued separation                     | **Critical**              |
| Latest/internal vs issued separation        | **Critical**              |
| ContractParty entity                        | **Critical**              |
| Immutable ContractParty snapshot            | **Critical**              |
| Party/Signer separation                     | **Critical**              |
| Signer entity                               | **Critical**              |
| Immutable Signer snapshot/evidence          | **Critical**              |
| Profile/signer historical separation        | **Critical**              |
| Organization/party historical separation    | **Critical**              |
| Role/Signer separation                      | **Critical**              |
| Approval/Signature separation               | **Critical**              |
| SignatureRequest entity                     | **Critical**              |
| SignatureRequest/exact version binding      | **Critical**              |
| SignatureEvent/Evidence                     | **Critical**              |
| SignatureRequest/evidence separation        | **Critical**              |
| Viewed/signed separation                    | **Critical**              |
| Partial/full execution separation           | **Critical**              |
| Execution policy resolver                   | **Critical**              |
| Signing-order support where applicable      | **Required architecture** |
| Provider abstraction                        | **Critical**              |
| Provider webhook verification               | **Critical**              |
| Provider-event normalization                | **Critical**              |
| Idempotent provider request creation        | **Critical**              |
| Idempotent webhook/event processing         | **Critical**              |
| Browser-return/provider-evidence separation | **Critical**              |
| Signing-session reauthorization             | **Critical**              |
| Short-lived recipient-bound signing session | **Critical**              |
| Stale-tab/current-state validation          | **Critical**              |
| Duplicate-signature prevention              | **Critical**              |
| Signed outcome reconciliation               | **Critical**              |
| Executed artifact entity                    | **Critical**              |
| Executed artifact immutability              | **Critical**              |
| Executed artifact/file hash integrity       | **Critical**              |
| Asset/FileVersion reuse                     | **Critical**              |
| Secure artifact download                    | **Critical**              |
| Supersession/void handling                  | **Critical**              |
| Stale Sign CTA protection                   | **Critical**              |
| Design 047 ClientAction reuse               | **Critical**              |
| Design 029/052 Approval reuse               | **Critical**              |
| Design 053 library/detail consistency       | **Critical**              |
| Design 100 internal-detail reuse            | **Critical architecture** |
| Notification integration                    | **Required**              |
| Activity integration                        | **Required**              |
| Audit integration                           | **Critical**              |
| Permission-safe caching                     | **Critical**              |
| Partial provider failure handling           | **Critical**              |
| Concurrent signer safety                    | **Critical**              |

---

# 8. Consolidation

Design 070 exposes several especially serious implementation risks.

**Contract / ContractVersion conflation**
Issued legal content remains mutable.

**Latest Version / Issued Version conflation**
Client signs an internal/newer version that was never issued.

**Draft / Issued Version conflation**
Unapproved Draft becomes signable.

**ContractVersion / generated-current-template conflation**
Document viewed today is reconstructed from mutable present-day fields.

**ContractParty / Organization conflation**
Current company edits rewrite historical legal party identity.

**Party / Signer conflation**
Person and legal entity become interchangeable.

**Signer / User conflation**
Global User identity becomes version-specific signing evidence.

**Signer snapshot / current Profile conflation**
Later title/name changes rewrite signature history.

**Job title / legal signing authority conflation**
CEO title automatically grants signing rights.

**Portal Admin / Signer conflation**
Client access administrator can sign every Contract.

**Contract read / sign conflation**
Any Contract viewer gets a Sign button.

**Approval / signature conflation**
ApprovalDecision is treated as legal execution.

**Reviewer / Signer conflation**
Client review role automatically grants signature authority.

**Viewed / signed conflation**
Opening the document is logged as legal acceptance.

**Viewed / acknowledged conflation**
Analytics telemetry becomes contract evidence.

**SignatureRequest / SignatureEvent conflation**
Sending the request is recorded as completed signature.

**SignatureRequest / signer evidence conflation**
No proof exists that Signer actually acted.

**Provider request accepted / signed conflation**
Successful API request becomes Signed status.

**Provider redirect / evidence conflation**
Browser query parameter becomes legal evidence.

**One signature / fully executed conflation**
Partial signing is shown as complete.

**Signature count / execution policy conflation**
Simple count ignores required signer policy/order.

**Signer A signed / Signer B eligible conflation**
Sequential signing rules are ignored.

**Expired request / Contract rejected conflation**
Request expiry changes legal Contract outcome.

**Declined signature / rejected approval conflation**
Different workflows lose meaning.

**Provider status / canonical Contract status conflation**
Vendor-specific strings spread into core business logic.

**Raw provider event / verified evidence conflation**
Unverified webhook controls Contract state.

**Provider “completed” / verified execution conflation**
Final state is trusted without checking expected ContractVersion/signers/artifact.

**Issued Artifact / Executed Artifact conflation**
Unsigned document URL is overwritten with signed PDF.

**Executed Artifact / current template conflation**
Signed Contract is re-rendered from mutable data.

**Executed Artifact mutation**
Historical legal evidence changes in place.

**Contract amendment / edit executed Contract conflation**
Executed terms are changed retroactively.

**Renewal / overwrite Contract conflation**
New commercial term destroys previous agreement lineage.

**Profile update / signer history conflation**
Changing personal settings rewrites Signer snapshot.

**Organization update / party history conflation**
Changing company settings rewrites issued legal identity.

**Membership deactivation / signature removal conflation**
Former user's valid signature disappears.

**Role change / signature authority history conflation**
Today's RBAC rewrites yesterday's legal act.

**ClientAction / signature truth conflation**
Completing/dismissing action marks Contract signed.

**Notification / execution truth conflation**
Read receipt changes signature status.

**Activity / legal evidence conflation**
Activity line is used instead of SignatureEvent/evidence.

**Direct ContractVersion bypass**
Client guesses unissued/superseded version ID.

**Direct artifact bypass**
Signed document FileVersion becomes accessible without Contract authorization.

**Permanent signing URL leakage**
One URL can be forwarded/reused indefinitely.

**Signer-ID tampering**
Client submits another Signer's ID to sign on their behalf.

**Email equality / signer authorization conflation**
Matching email alone grants signing authority.

**Stale-tab signature**
Client signs a superseded/voided version.

**Timeout / retry duplicate signature**
Uncertain provider response causes duplicate request/signature attempts.

**Concurrent signer race**
Two signatures create conflicting execution transition/artifact.

**Webhook replay**
Provider callback creates duplicate legal evidence.

**Generic Contract PATCH**
Client can set `signed=true`, `executed=true`, or mutate parties.

**070/019 duplicate Contract engine**
Portal creates separate contract/version/signature truth.

**070/053 duplicate Client Contract state**
Library and detail disagree about execution state.

**070/100 duplicate signing engine**
Internal and Client Contract detail use different provider/evidence models.

No additional screen is required.

These are **legal-version identity, party/signer evidence, execution policy, provider verification, immutable artifact, authorization, concurrency, and historical-integrity requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT EXACT-VERSION CONTRACT EXECUTION, DIGITAL SIGNING & IMMUTABLE EVIDENCE ANCHOR**

**Domain directive:**
**Contract ≠ ContractVersion ≠ ContractParty ≠ Signer ≠ SignatureRequest ≠ SignatureEvent/Evidence ≠ Approval ≠ ExecutedArtifact ≠ ClientAction.**

**Reuse directive:**
Design 019 remains the single canonical Contract execution engine, Design 053 remains the Client Contract collection, and Design 070 is the Client-safe exact-version detail/signing surface over those same entities.

**Version directive:**
every signing workflow binds to one exact immutable issued ContractVersion. “Latest Contract” is never a valid legal execution selector.

**Issuance directive:**
issuing a ContractVersion freezes the exact document, party snapshots, signer assignments, and integrity references required for that execution lifecycle.

**Party directive:**
ContractParty represents the legal entity/party to the agreement and remains distinct from the human Signer and from the current mutable OrganizationProfile.

**Signer directive:**
Signer is an explicit version-specific execution assignment. Portal role, job title, company position, Profile data, and generic Contract permission never substitute for Signer eligibility.

**Profile-history directive:**
later Design 059 personal-profile changes never rewrite issued Signer identity snapshots or historical signature evidence.

**Organization-history directive:**
later Design 060 company-profile/legal-address changes never rewrite issued ContractParty snapshots or executed Contract artifacts.

**Approval directive:**
formal business approval and legal signature remain separate. An approved Contract is merely eligible to proceed; only canonical signature evidence records actual signing.

**View directive:**
document view/open events never imply signature or acceptance.

**Request directive:**
SignatureRequest represents an invitation/workflow to sign and binds the exact ContractVersion + Signer. It never counts as signature evidence.

**Evidence directive:**
SignatureEvents/Evidence are append-oriented, provider-verified, idempotent and tied to exact Signer + ContractVersion identity.

**Execution directive:**
partial signing remains distinct from full execution. Aggregate execution state is resolved server-side from required signers, valid evidence, signing policy, and any sequencing requirements.

**Provider directive:**
signature providers remain behind a normalized adapter. Raw provider statuses, redirects, callbacks, and envelope semantics do not become canonical Contract state without verification.

**Webhook directive:**
provider callbacks are authenticated, replay-safe, idempotent, and validated against expected ContractVersion, SignatureRequest and Signer before affecting execution.

**Uncertain-outcome directive:**
a signing timeout or provider ambiguity enters confirmation/reconciliation state; the system verifies before retrying so duplicate signatures/requests are not created.

**Artifact directive:**
the final executed Contract is a dedicated immutable `ExecutedContractArtifact` backed by exact Asset/FileVersion and integrity/hash evidence. It is never reconstructed from current Profile, Organization or template data.

**Amendment directive:**
post-execution changes require an explicit amendment/new ContractVersion lineage. Executed versions are never edited in place.

**Access directive:**
Contract read, artifact download, signing capability, and exact Signer eligibility remain independent server-side permissions/policies.

**Reauthorization directive:**
starting a signing session always revalidates the current membership, exact ContractVersion, Signer eligibility, request state, signing order, and supersession/void state. Stale Client pages never confer authority.

**Session directive:**
signing URLs/sessions are short-lived and recipient/version-specific rather than permanent transferable links.

**ClientAction directive:**
Design 047 only projects whether the current Signer should act; action state never records signature truth.

**Notification directive:**
Designs 061/064 can deliver signature requests/status updates, including mandatory legal/transactional communication where policy requires, but notification read/dismissal never changes execution.

**Activity directive:**
Design 063 may record safe execution milestones but never replaces Signature evidence.

**Audit directive:**
issuance, SignatureRequest creation, signing, decline, expiry, void/supersession and full execution produce durable Audit records without logging signing secrets/tokens.

**Concurrency directive:**
multiple Signers and provider callbacks must be handled transactionally/idempotently so simultaneous signing cannot create duplicate finalization or conflicting executed artifacts.

**Failure directive:**
Contract visibility, provider availability, signer-state availability, signing confirmation, execution-artifact processing and full execution remain separate states. Provider failure never becomes `Declined`, `Unsigned`, or `Voided` by assumption.

**Responsive directive:**
desktop prioritizes exact ContractVersion, legal parties, signer states, document and execution action; mobile prioritizes exact version → current-user signer state → Sign action → other signer progress → immutable executed artifact.

**Overlap directive:**
Designs **019, 029–030, 047, 052–053, 057, 059–064, 070 and later 099–100** must ultimately consume one canonical Contract + immutable Version + Party + Signer + SignatureRequest + SignatureEvidence + ExecutedArtifact foundation.

**Consolidation directive:**
**STANDARDIZE ONE CONTRACT EXECUTION FOUNDATION — CANONICAL CONTRACT + IMMUTABLE ISSUED CONTRACTVERSION + LEGAL PARTY SNAPSHOTS + EXPLICIT SIGNER ASSIGNMENTS + VERSION-BOUND SIGNATURE REQUESTS + VERIFIED APPEND-ONLY SIGNATURE EVIDENCE + SERVER-RESOLVED PARTIAL/FULL EXECUTION + IMMUTABLE EXECUTED ARTIFACT + CLIENT ACTION PROJECTION — AND NEVER ALLOW CURRENT PROFILE/ORGANIZATION/RBAC DATA, “LATEST VERSION,” PROVIDER REDIRECTS, OR GENERIC CONTRACT PATCHES TO BECOME LEGAL EXECUTION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **70 / 153** |
| **PASS**                                   |                         **70** |
| **STANDARDIZE decisions**                  |                         **68** |
| **Potential implementation-overlap flags** |                         **61** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**70 / 153 = 45.8% audited.**

### Canonical Contract execution architecture after Design 070

```text
                         CONTRACT
                            │
                            ↓
                    ContractVersion
                    exact + immutable
                            │
          ┌─────────────────┼──────────────────┐
          ↓                 ↓                  ↓
    ContractParty       Signer(s)       Issued Artifact
      snapshots         snapshots          + hash
          │                 │
          │                 ↓
          │          SignatureRequest
          │                 │
          │                 ↓
          │          SignatureEvent /
          │             Evidence
          │                 │
          └─────────────────┼─────────────────┐
                            ↓                 │
                   Execution Resolver         │
                            ↓                 │
                 Partially / Fully Signed     │
                            ↓                 │
                  Executed Contract Artifact ←┘
                     immutable evidence
```

The critical historical boundary remains:

```text
CURRENT DATA
├── User Profile — Design 059
├── Organization Profile — Design 060
├── Portal Role — Design 062
└── Membership State

          ≠

HISTORICAL CONTRACT EVIDENCE
├── ContractParty snapshot
├── Signer snapshot
├── exact issued ContractVersion
├── SignatureEvents/Evidence
└── ExecutedContractArtifact
```

Current account changes may affect **future access**, but they never rewrite an already issued or executed legal agreement.

# Next Sequential Audit Target

## **Design 071 — Client Invoice / Payment Detail**

Its frozen identity and supplied route annotation **`/client/billing/[invoiceId]`** are already locked.

The next audit must preserve the billing-detail boundary:

> **Invoice ≠ InvoiceVersion/Artifact ≠ InvoiceLine ≠ Payment ≠ PaymentAttempt ≠ Transaction ≠ ProviderEvent ≠ Refund ≠ Reconciliation ≠ OutstandingBalance ≠ ClientAction.**

It must reconcile **Design 020's canonical Finance/payment foundation** with **Design 054's Client Billing collection** while preserving:

* issued Invoice snapshot ≠ current Client/Organization profile,
* Invoice total ≠ outstanding balance,
* partial payment ≠ paid in full,
* Payment ≠ PaymentAttempt,
* provider acceptance ≠ settled/reconciled payment,
* failed/uncertain attempt must be verified before retry,
* Refund ≠ deletion/reversal of historical Payment,
* invoice artifact and historical currency/amounts remain immutable.

After Design 071 we continue strictly:

**072 Client Publishing / Live Links Detail → 073 Client Distribution Detail → 074 Client Message Thread Detail → 075 Client Sign In → 076 Client Portal Activation / Accept Invite → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
