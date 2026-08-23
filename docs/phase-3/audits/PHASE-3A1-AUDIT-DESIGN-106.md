# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 106 — Client Conversion / Won Deal Handoff

Design 106 should become the **canonical Team Workspace commercial-to-delivery handoff surface** that converts the outcome of one already-governed Deal into the correct downstream Client relationship, project/onboarding context, and operational lineage without mutating Company, Contact, Proposal, Contract, Package, or Deal history into one another.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Deal ≠ DealStage/Lifecycle ≠ WonDealHandoff ≠ Company ≠ Contact ≠ ClientRelationship ≠ ClientContact ≠ Project ≠ ClientOnboarding ≠ Proposal/ProposalVersion ≠ Contract/ContractVersion ≠ Product/Package Snapshot ≠ ClientPortalMembership ≠ Invoice.**

The central implementation rule is:

> **“Won” is a Deal-domain fact; “Client” is a relationship/context; and “handoff” is a durable, idempotent orchestration that creates or links downstream canonical entities. Winning a Deal must never mutate Company into Client, Contact into User, Proposal into Contract, Contract into Project, or Package into fulfillment work. Existing Client relationships must be reused, exact commercial snapshots must be preserved, and partial downstream completion must be resumable without duplicating Clients, Projects, Onboarding records, Portal users, or billing records.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                              |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **106**                                                                                                                                                                     |
| **Canonical name**                 | **Client Conversion / Won Deal Handoff**                                                                                                                                    |
| **Product area**                   | Team Workspace / Sales → Client Delivery Transition                                                                                                                         |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                            |
| **Screen class**                   | Cross-Domain Transition / Controlled Handoff Workspace                                                                                                                      |
| **Classification**                 | **Canonical Won-Deal Conversion, Client-Relationship Establishment & Delivery-Handoff Anchor**                                                                              |
| **Primary purpose**                | Safely convert one won commercial opportunity into existing/new Client relationship context and downstream operational setup while preserving exact Deal/commercial history |
| **Source entity**                  | **Deal** — Designs 016–017 / 096                                                                                                                                            |
| **Source Deal closure**            | canonical Deal lifecycle / `DealWon` state                                                                                                                                  |
| **Handoff entity/process**         | **WonDealHandoff / ClientConversion**                                                                                                                                       |
| **Business identity dependency**   | **Company** — Designs 084–085                                                                                                                                               |
| **Person identity dependency**     | **Contact** — Designs 086–087                                                                                                                                               |
| **Client relationship dependency** | **Client / ClientRelationship** — Design 021                                                                                                                                |
| **Client-contact dependency**      | explicit ClientContact relation where required                                                                                                                              |
| **Proposal dependency**            | Designs 018 / 097–098                                                                                                                                                       |
| **Contract dependency**            | Designs 019 / 099–100                                                                                                                                                       |
| **Catalog dependency**             | Designs 104–105 through immutable commercial snapshots only                                                                                                                 |
| **Project dependency**             | Design 023 / upcoming Design 108                                                                                                                                            |
| **Onboarding dependency**          | Design 022 / upcoming Design 107                                                                                                                                            |
| **Portal access dependency**       | Designs 062 / 076, but not automatic identity conversion                                                                                                                    |
| **Billing dependency**             | Designs 020 / 101–103 only through explicit downstream policy                                                                                                               |
| **Primary query service**          | `WonDealHandoffQueryService`                                                                                                                                                |
| **Orchestration service**          | `WonDealHandoffService`                                                                                                                                                     |
| **Client relationship service**    | `ClientRelationshipService`                                                                                                                                                 |
| **Project creation service**       | canonical `ProjectService`                                                                                                                                                  |
| **Onboarding service**             | canonical `ClientOnboardingService`                                                                                                                                         |
| **Handoff policy**                 | `HandoffPolicy / HandoffPolicyVersion`                                                                                                                                      |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                             |
| **Auth**                           | Required                                                                                                                                                                    |
| **Authorization**                  | Active OrganizationMembership + Deal handoff + downstream resource permissions/policy                                                                                       |
| **Implementation priority**        | **Critical Commercial-to-Operations Integrity / Idempotent Cross-Domain Handoff**                                                                                           |
| **Reuse level**                    | **Extremely High across CRM, Clients, Contracts, Projects, Onboarding, Portal and Billing**                                                                                 |

Design 106 should answer:

> **“This Deal is won—what exact Company/Contacts/commercial agreement does it represent, does a Client relationship already exist, which downstream records need to be linked or created, what has already completed, and can the handoff finish without duplicating or rewriting anything historical?”**

Canonical structure:

```text
                          DEAL
                    canonical opportunity
                           │
                           ↓
                       WON state
                           │
                           ↓
                    WonDealHandoff
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
       Company        Commercial terms   Contacts
          │                │                │
          │         ProposalVersion /       │
          │         ContractVersion         │
          │                │                │
          └────────────┬───┴────────────────┘
                       ↓
              ClientRelationship
                       │
            ┌──────────┼──────────┐
            ↓          ↓          ↓
      ClientContact   Project   ClientOnboarding
                                   │
                                   ↓
                           future delivery work

Portal membership / Invoice
remain separate governed actions.
```

---

# 2. Reuse

## Design 096 remains authoritative for Deal stage/lifecycle

Design 106 must **consume** canonical Deal win state.

It must not independently perform:

```text
deal.stage = WON
```

or:

```text
deal.status = CLIENT
```

through conversion logic.

Correct:

```text
DealStageTransitionService
        ↓
Deal WON
        ↓
WonDealHandoffService
```

---

## Deal Won ≠ handoff completed

Critical.

Valid:

```text
Deal lifecycle = WON
Handoff = IN PROGRESS
```

or:

```text
Deal lifecycle = WON
Handoff = REQUIRES ATTENTION
```

Winning the commercial opportunity and operationalizing it are different business facts.

---

## Handoff failure ≠ Deal becomes unwon

Permanent.

If Project creation fails after the Deal is legitimately won, Design 106 must not revert commercial history.

---

## Design 021 remains canonical Client relationship/account context

Design 021 already established:

> **Company ≠ Contact ≠ Client ≠ Portal Organization ≠ Portal User.**

Design 106 must preserve that permanently.

---

## Company ≠ Client

A Company becomes related to the business as a Client through an explicit relationship/context.

Do not mutate:

```text
company.type = CLIENT
```

as the entire client model.

Preferred conceptual lineage:

```text
Company C-100
     │
     ↓
ClientRelationship CR-50
```

---

## Existing Client relationship must be reused

Critical.

Example:

```text
Company Globex

Deal D1 → won in January
Deal D2 → won in August
```

Correct:

```text
Company Globex
      ↓
ClientRelationship CR-1
      ├── Deal D1
      └── Deal D2
```

Not:

```text
Client Globex #1
Client Globex #2
```

for every won Deal.

---

## One Client can have many Deals

Permanent.

---

## Deal conversion ≠ Client recreation

Permanent.

---

## Contact ≠ ClientContact ≠ Portal User

A Contact associated with the winning Deal can be linked into the Client relationship as a ClientContact where appropriate.

That does not:

* create a User,
* create an AuthenticationIdentity,
* create a PortalMembership.

---

## Contact email equality cannot create Portal access

Designs 062/076 boundaries remain intact.

Portal access requires explicit Invitation/Activation/Membership workflow.

---

## Reuse Proposal exact-version lineage

If the Deal's agreed terms are represented by ProposalVersion v4:

```text
Deal
 ↓
Proposal P1
 ↓
ProposalVersion v4
```

Design 106 must preserve that exact version reference.

It must never resolve:

> latest Proposal version

during handoff.

---

## Reuse Contract exact-version lineage

If Contract execution governs the handoff:

```text
Contract C1
 ↓
Executed ContractVersion v3
```

Design 106 consumes **v3**.

A newer draft v4 is not the commercial/legal handoff source.

---

## Handoff eligibility ≠ Contract execution universally

Do not hard-code:

> Every won Deal must have a signed Contract.

Different commercial policies may permit different prerequisites.

Use a versioned `HandoffPolicy`.

But when Contract execution **is** required:

`provider signed` or `signature sent` is insufficient.

Use canonical verified Contract execution from Design 100.

---

## Reuse Product/Package snapshots

Designs 104–105 established:

```text
Current catalog
≠
historical commercial snapshot
```

Project/onboarding setup must seed from the exact commercial agreement snapshot.

Do not ask the current Package definition:

> What does this client get today?

when the client purchased an older PackageVersion/snapshot.

---

## Package ≠ Project

Permanent.

A Package can influence Project creation.

It does not itself become Project identity.

---

## Reuse Project domain

Design 023 remains canonical Project identity.

Design 106 may request creation/linkage of Project(s).

It must never create:

```text
WonDealProjectRecord
ClientConversionProject
```

as a second delivery system.

---

## Reuse Client Onboarding domain

Design 022 remains canonical ClientOnboarding.

Design 106 may instantiate or link an onboarding process.

It cannot store onboarding checklist state itself.

---

## Handoff ≠ onboarding

Permanent.

Handoff answers:

> Were the required downstream operational entities established?

Onboarding answers:

> Has the client completed/received the onboarding requirements?

---

## Handoff ≠ Project Intake

Design 108 will later specialize Project Intake/Creation.

Design 106 may seed the canonical intake inputs and request Project creation.

It must not duplicate all intake/workflow configuration.

---

## Handoff ≠ billing

Even if a won Deal eventually results in an Invoice:

```text
Deal WON
≠
Invoice issued
```

unless an explicit billing policy/workflow separately authorizes it.

---

# 3. Entities

## Deal

Deal remains the stable commercial opportunity identity.

Design 106 must preserve:

* Deal ID,
* Company/Contact relations,
* Proposal lineage,
* Contract lineage,
* amount/currency,
* selected commercial snapshot,
* closure history.

---

## Deal ≠ ClientRelationship

Permanent.

One represents:

> a commercial opportunity.

The other represents:

> an ongoing client/account relationship.

---

## Won Deal state

The Deal's won state must be canonical and already validated through Design 096's Deal transition service.

Design 106 should never infer Win merely from:

* Contract signed,
* Proposal accepted,
* Invoice created,
* user clicking Convert.

---

## WonDealHandoff / ClientConversion

A durable first-class orchestration record is justified.

Conceptually:

```text
WonDealHandoff
├── id
├── organizationId
├── dealId
├── handoffPolicyVersionId
├── source commercial references
├── state
├── initiatedBy
├── initiatedAt
├── completedAt
├── revision
└── downstream result references
```

---

## Handoff ≠ Deal

Permanent.

---

## Handoff ≠ Client

Permanent.

---

## Why a durable Handoff record matters

Without it, retries can create:

* duplicate ClientRelationships,
* duplicate Projects,
* duplicate Onboarding records,
* duplicate Portal invitations,
* duplicate billing actions.

The Handoff provides one resumable execution identity.

---

## One Deal should have one canonical completed handoff intent

Conceptually enforce uniqueness such as:

```text
organizationId + dealId + handoffPurpose
```

or equivalent final policy.

Retry resumes the existing Handoff rather than creating another conversion.

---

## Re-run ≠ duplicate conversion

Permanent.

---

## HandoffAttempt

Infrastructure retries do not necessarily need another business entity.

If attempt history is needed:

```text
Handoff
  ↓
execution attempts
```

should remain subordinate execution evidence.

The stable Handoff identity remains one.

---

## Handoff policy

`HandoffPolicyVersion` should define which prerequisites and outputs apply.

Potential requirements could include:

* Deal won,
* required commercial terms available,
* required Contract execution where applicable,
* valid Company,
* delivery configuration,
* required billing/client data.

Exact policy belongs to Phase 3D.

---

## HandoffPolicyVersion must be pinned

Later administrative policy changes cannot make yesterday's completed handoff inexplicable.

---

## Company

Design 084 remains canonical Company identity.

Design 106 reuses the Deal's validated Company relation.

---

## Company merge handling

If Company was merged before handoff:

resolve to the canonical surviving Company while preserving Deal's historical relation/provenance.

Do not create a new Company just because the original ID is superseded.

---

## ClientRelationship

`ClientRelationship` should represent the organization's commercial/service relationship with a Company/client account.

Conceptually:

```text
ClientRelationship
├── id
├── organizationId
├── companyId
├── lifecycle
├── relationshipSince
├── source lineage
├── owner/team context
└── revision
```

Exact model Phase 3D.

---

## ClientRelationship ≠ Company

Critical.

---

## ClientRelationship ≠ Deal

Critical.

---

## Client lifecycle ≠ Deal lifecycle

A Client relationship can remain active after:

* Deal D1 completed,
* Deal D2 lost,
* Deal D3 won.

---

## Existing ClientRelationship branch

Design 106 must support:

```text
Company already has ClientRelationship
```

as a normal successful path.

Not as:

> duplicate client error.

---

## New ClientRelationship branch

If no canonical relationship exists:

create it exactly once.

---

## Client identity resolution

Use exact Company identity and tenant-scoped Client relationship rules.

Do not resolve Client solely by:

* company name,
* contact email,
* domain.

---

## ClientContact

Where people need explicit relationship to the Client account:

```text
Contact
   ↓
ClientContact relation
```

rather than changing Contact type.

---

## ClientContact ≠ Contact

Permanent.

---

## ClientContact ≠ PortalMembership

Permanent.

---

## Existing Contact should be linked, not duplicated

If Deal primary contact already exists as Contact C-100:

create/reuse ClientContact relation.

Do not create:

```text
new ClientContactPerson record
```

with copied identity.

---

## ClientContact role/title ≠ PortalRole

Critical.

“Executive Sponsor” or “Billing Contact” in Client relationship is business context.

It does not grant portal authorization.

---

## Proposal/Contract source snapshot

Handoff should preserve exact agreed commercial inputs.

Conceptually:

```text
HandoffCommercialSource
├── dealId
├── acceptedProposalVersionId?
├── executedContractVersionId?
├── package/product snapshot refs
├── amount/currency snapshot
└── captured source provenance
```

This may be a structured relation rather than one physical entity.

---

## Source snapshot ≠ current catalog

Permanent.

---

## Source snapshot ≠ Project mutable scope

Project can derive its initial scope from agreed commercial terms.

Later approved Project scope changes belong to Project/Change Request domains.

They do not rewrite Contract/Proposal.

---

## Project

Design 023 remains canonical.

Handoff may request:

```text
ProjectService.createProjectFromHandoff(...)
```

or equivalent.

---

## One Deal ≠ necessarily one Project

Important architecture guardrail.

A commercial agreement may eventually produce:

* one Project,
* multiple Projects,
* no immediate Project,

depending on commercial model.

Do not hard-code `deal.projectId` as universal architecture unless Phase 3D explicitly establishes one-to-one policy.

---

## HandoffOutput relation

Conceptually useful:

```text
HandoffOutput
├── handoffId
├── outputType
├── outputId
├── creation/link mode
└── completedAt
```

This allows the Handoff to record:

* existing ClientRelationship linked,
* Project created,
* Onboarding created,

without duplicating those entities.

---

## HandoffOutput ≠ downstream entity

Permanent.

---

## ClientOnboarding

Design 022 remains canonical onboarding process.

A Handoff can create one onboarding instance from an exact template snapshot/policy.

---

## Onboarding creation must be idempotent

Retrying handoff cannot produce:

```text
Onboarding #1
Onboarding #2
Onboarding #3
```

for the same intended client/project context.

---

## Onboarding ≠ Handoff completion necessarily

Critical.

Correct:

```text
Handoff = COMPLETED
Onboarding = IN PROGRESS
```

The handoff can be complete because onboarding was successfully established.

It does not wait for the client to finish onboarding.

---

## Portal Invitation

If future/frozen handoff behavior includes inviting client users:

that must invoke Design 062/076's canonical Invitation workflow.

Design 106 must never directly create:

```text
ClientPortalMembership = ACTIVE
```

from Contact email.

---

## Portal invitation created ≠ Portal membership activated

Permanent.

---

## Invoice

If billing initiation is part of configured downstream operations:

Invoice creation must call canonical InvoiceService.

Do not store:

```text
handoff.invoiceStatus
```

as another finance truth.

---

# 4. Permissions

Design 106 should conceptually distinguish:

```text
deal.read
deal.handoff.read
deal.handoff.initiate
deal.handoff.retry
deal.handoff.resolve

client.read
client.create
client.linkExisting

clientContact.manage

project.create
clientOnboarding.create

portalInvitation.create
billing.create
```

Exact permission keys belong to Phase 3D.

---

## Deal read ≠ handoff initiate

Permanent.

---

## Deal edit ≠ handoff initiate

Permanent.

---

## Handoff permission ≠ Deal-Won transition permission

Critical.

A user may be allowed to operationalize an already-won Deal without having authority to mark Deals Won.

---

## Deal owner ≠ Client creation authority

Permanent.

---

## Deal owner ≠ Project creation authority necessarily

Permanent.

---

## Handoff actor cannot choose arbitrary Company

Server verifies Company relationship from canonical Deal context or approved correction workflow.

---

## Browser-selected ClientRelationship must be validated

Never trust:

```text
clientId = arbitraryClientId
```

from frontend.

Validate:

* tenant,
* Company relationship,
* current access,
* intended merge/link policy.

---

## Client link ≠ permission grant

Connecting a Deal to a ClientRelationship does not grant the user access to every Client resource.

---

## ClientContact link ≠ Portal permission

Permanent.

---

## Project creation must reauthorize

The orchestrator must invoke ProjectService under an authorized system/user context.

Handoff permission cannot bypass Project-domain safeguards.

---

## Onboarding creation must reauthorize/policy-check

Permanent.

---

## Portal invitation requires separate authority

If present.

---

## Invoice creation requires finance/billing policy

Handoff cannot bypass Invoice issuance authority.

---

## Existing Client reuse must not bypass visibility rules

A user may be allowed to hand off to an existing ClientRelationship through a safe resolver without necessarily viewing every sensitive Client field.

---

## Direct Handoff ID reauthorizes

Knowing ID grants nothing.

---

## Direct Project/Client IDs reauthorize

Permanent.

---

## Cross-tenant linkage prohibited

Absolute.

A Deal in Organization A cannot create/link:

* ClientRelationship in B,
* Project in B,
* Onboarding in B.

---

## Historical source access ≠ edit authority

Being able to inspect accepted ProposalVersion or executed ContractVersion does not allow modification.

---

# 5. States

Design 106 must keep **Deal lifecycle, Handoff readiness, Handoff execution state, Client relationship state, Project creation state, Onboarding state, Portal invitation state, and billing state** independent.

### Deal lifecycle

From canonical Deal domain:

```text
OPEN
WON
LOST
...
```

### Handoff readiness

Conceptually:

```text
NOT_READY
READY
BLOCKED
UNKNOWN
```

### Handoff execution

```text
NOT_STARTED
IN_PROGRESS
PARTIALLY_COMPLETED
COMPLETED
FAILED
REQUIRES_ATTENTION
```

### Client relationship output

```text
EXISTING_CLIENT_LINKED
NEW_CLIENT_CREATED
CLIENT_LINK_PENDING
CLIENT_LINK_FAILED
```

### Project output

```text
NOT_REQUIRED
PENDING
CREATED
LINKED_EXISTING
FAILED
```

### Onboarding output

```text
NOT_REQUIRED
PENDING
CREATED
FAILED
```

### Portal access

If relevant:

```text
NOT_REQUESTED
INVITATION_CREATED
INVITATION_ACCEPTED
FAILED
```

### Billing output

If relevant:

```text
NOT_REQUESTED
ELIGIBLE
REQUESTED
CREATED
FAILED
```

These must never collapse into one generic `conversion.status`.

---

## Deal Won ≠ Handoff Ready necessarily

Critical.

A Deal may be legitimately won while required operational data is incomplete.

---

## Ready ≠ started

Permanent.

---

## Handoff started ≠ ClientRelationship created

Permanent.

---

## Client created ≠ Handoff completed

Permanent.

Other required outputs may still be pending.

---

## Existing Client linked ≠ duplicate

Permanent.

That is a successful path.

---

## Handoff completed ≠ Onboarding completed

Critical.

---

## Handoff completed ≠ Project completed

Absolute.

---

## Handoff completed ≠ Portal activated

Permanent.

---

## Invitation created ≠ membership active

Design 076 remains intact.

---

## Handoff completed ≠ Invoice paid

Absolute.

---

## Partial completion ≠ full failure

Critical.

Example:

```text
ClientRelationship  ✓
Project             ✓
Onboarding          ✕
```

should become:

> Partially completed / requires attention.

Do not delete the Client and Project.

---

## Failed step ≠ rollback successful unrelated domains

Permanent.

---

## Retry ≠ recreate completed outputs

Critical.

---

## Handoff failure ≠ Deal Lost

Absolute.

---

## Existing Client service unavailable ≠ no Client exists

Critical.

Never create a duplicate Client merely because lookup service is unavailable.

---

## Project service unavailable ≠ no Project required

Permanent.

---

## Contract service unavailable ≠ no Contract

Critical where Contract is a prerequisite.

---

## Commercial source unavailable ≠ use latest Package

Absolute.

---

## Handoff state coverage

Design 106 inherits Design 150 plus:

```text
Handoff Loading
Handoff Available
Handoff Restricted

Deal Won
Deal Not Won
Deal State Changed Elsewhere

Handoff Not Ready
Handoff Ready
Handoff Blocked
Handoff Readiness Unknown

Handoff Not Started
Handoff In Progress
Handoff Partially Completed
Handoff Completed
Handoff Failed
Handoff Requires Attention

Existing Client Found
No Existing Client Found
Client Lookup Unavailable
Client Linked
Client Created
Client Link Failed

Client Contact Linked
Client Contact Already Linked
Client Contact Link Failed

Project Not Required
Project Pending
Project Created
Existing Project Linked
Project Creation Failed
Project Service Unavailable

Onboarding Not Required
Onboarding Pending
Onboarding Created
Onboarding Creation Failed
Onboarding Service Unavailable

Portal Invitation Not Required
Portal Invitation Created
Portal Invitation Pending Activation
Portal Access Active
Portal Action Failed

Commercial Source Verified
Commercial Source Restricted
Commercial Source Unavailable
Commercial Source Conflict

Handoff Updated Elsewhere
Handoff Retry Required
Partial Handoff Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize the **handoff lineage and readiness**, not another Deal 360 duplication.

Conceptually:

```text
Won Deal
↓
Commercial source / agreement
↓
Company + key Contacts
↓
Existing Client resolution
↓
Handoff readiness
↓
Downstream setup
   ├── ClientRelationship
   ├── ClientContact
   ├── Project
   └── Onboarding
↓
Execution progress / exceptions
```

Only frozen Design 106 sections/actions should render.

---

## Deal and Client should be visually distinct

Correct:

> Deal: Executive Authority Package — WON
> Client: Globex — Existing relationship

Not:

> Deal converted into Client.

That wording encourages the wrong domain model.

---

## Existing Client should be a normal positive state

Where frozen UI surfaces it:

> Existing Client relationship will be reused.

Avoid framing it as a collision/error.

---

## Exact commercial source should be visible where relevant

Examples:

> Accepted Proposal v3

or:

> Executed Contract v2

where those are the canonical handoff sources.

Do not say merely:

> Package: Executive

if that would imply use of current mutable catalog configuration.

---

## Partial handoff must be understandable

Example:

```text
Client relationship   Created
Project               Created
Onboarding            Failed — Retry
```

Do not collapse into:

> Conversion failed.

---

## Tablet

Following Design 152:

* Deal identity and Client resolution remain prominent,
* commercial source stacks,
* downstream output cards stack,
* status/actions remain touch-safe,
* exception detail can collapse.

---

## Mobile

Priority:

```text
Deal WON
↓
Company / Client resolution
↓
Commercial source
↓
Handoff readiness
↓
Client relationship
↓
Project
↓
Onboarding
↓
Errors / retry
```

No wide process table squeezed horizontally.

---

## Mobile idempotency UX

If the user retries a partial handoff:

the UI should communicate conceptually:

> Continue setup

rather than:

> Convert again.

This reflects the stable Handoff identity.

---

## Accessibility

A handoff state could communicate:

> Deal D-104 for Globex is won. An existing Client relationship was found and linked. Project PR-81 was created. Client onboarding creation failed and requires retry. No duplicate Client or Project will be created by retrying.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical handoff architecture

```text
Design 106
    ↓
Authenticated Workspace Context
    ↓
WonDealHandoffQueryService
    │
    ├── DealAdapter
    ├── CompanyAdapter
    ├── ContactAdapter
    ├── ProposalAdapter
    ├── ContractAdapter
    ├── CommercialSnapshotAdapter
    ├── ClientRelationshipAdapter
    ├── ProjectAdapter
    └── OnboardingAdapter
    ↓
WonDealHandoffView
```

Mutations go through:

```text
WonDealHandoffService
```

not a cross-domain mega-PATCH.

---

## Readiness evaluation

Use conceptually:

```text
evaluateHandoffReadiness(dealId)
```

which validates:

1. Deal exists and is canonical;
2. Deal is actually Won;
3. Company identity is valid;
4. required commercial source is exact and available;
5. required Contract/Proposal conditions under `HandoffPolicyVersion`;
6. required client/project/onboarding inputs;
7. current actor authorization/policy.

---

## Readiness ≠ execution

Permanent.

---

## Handoff policy must be versioned

`HandoffPolicyVersion` determines requirements.

A Handoff pins the exact policy used when initiated.

---

## Handoff initiation

Conceptually:

```text
initiateWonDealHandoff(
    dealId,
    expectedDealRevision,
    handoffPolicyVersion,
    approved input,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. reload Deal;
3. verify Deal still Won;
4. resolve exact Company;
5. verify commercial lineage;
6. resolve/create stable Handoff identity;
7. persist source references;
8. queue/execute downstream steps;
9. return progress state.

---

## Handoff idempotency

This is critical.

Repeated:

* button clicks,
* page retries,
* outbox redelivery,
* worker restarts

must all resolve to the same Handoff intent.

---

## Unique Deal handoff identity

Use a database uniqueness constraint/policy around the canonical source intent.

Frontend idempotency keys alone are not enough.

---

## Handoff is a saga/orchestration, not one giant DB transaction

Critical.

The system must not hold one transaction across:

* CRM,
* Client,
* Project,
* Onboarding,
* Portal,
* Billing.

Use durable orchestration + outbox + idempotent downstream commands.

---

## Step model

Conceptually:

```text
WonDealHandoff
├── ResolveClient
├── LinkClientContacts
├── CreateProject
├── CreateOnboarding
├── optional downstream actions
└── FinalizeHandoff
```

These can be execution records/projections rather than user-facing entities.

---

## Completed steps remain completed

If later step fails:

```text
ResolveClient       ✓
CreateProject       ✓
CreateOnboarding    ✕
```

retry must resume at the failed step.

---

## No compensating deletion by default

Do not:

* delete ClientRelationship,
* delete Project,

just because later Onboarding fails.

Those records may already be valid canonical business entities.

---

## Explicit compensation only

If a rare step truly requires reversal, invoke the downstream domain's explicit cancellation/archive command.

Never delete records directly from the Handoff orchestrator.

---

## Existing Client resolution

Conceptually:

```text
resolveClientRelationship(companyId)
```

must be tenant-scoped and canonical.

---

## Client service outage

If resolution cannot be trusted:

```text
CLIENT_LOOKUP_UNAVAILABLE
```

and stop.

Do not assume no existing Client and create a duplicate.

---

## Client creation idempotency

Conceptually:

```text
ensureClientRelationship(
    companyId,
    sourceDealId,
    handoffId
)
```

should return either:

```text
existing ClientRelationship
```

or:

```text
newly created ClientRelationship
```

safely under concurrency.

---

## Concurrent conversions for same Company

Critical.

Example:

```text
Deal D1 won
Deal D2 won
```

at nearly same time for the same Company.

Both Handoffs must converge to one canonical ClientRelationship if policy says one Company→one active Client relationship.

Use database uniqueness/transactional resolution.

---

## Contact linking

Conceptually:

```text
ensureClientContact(
    clientRelationshipId,
    contactId,
    relationship role/context
)
```

No duplicate Contact creation.

---

## Contact relationship history

If contact role changes later:

update/version the ClientContact relationship.

Do not rewrite Contact identity.

---

## Portal access is explicit

If the Handoff is configured to invite client users:

```text
InvitationService.createInvitation(...)
```

must use Design 062/076 boundaries.

No direct Membership creation.

---

## Portal invitation idempotency

Repeated Handoff processing must not send multiple active equivalent invitations unintentionally.

---

## Project creation

Conceptually:

```text
createProjectFromHandoff(
    handoffId,
    clientRelationshipId,
    exactCommercialSource,
    projectInput,
    idempotencyKey
)
```

must:

* authorize/policy-check;
* pin exact commercial snapshot;
* avoid duplicates;
* create canonical Project;
* preserve Handoff/Deal source lineage.

---

## Project creation ≠ current Package lookup

Absolute.

The Project may use Package/Product source provenance.

Its initial obligations must derive from the **agreed commercial snapshot**, not current catalog.

---

## Project commercial source lineage

Conceptually:

```text
Project
├── sourceDealId
├── sourceProposalVersionId?
├── sourceContractVersionId?
└── agreedCommercialSnapshot reference
```

according to final schema.

---

## Project scope is downstream mutable domain state

Later Change Requests can alter Project scope.

They must not rewrite original Deal/Contract history.

---

## Onboarding creation

Conceptually:

```text
createClientOnboardingFromHandoff(...)
```

must pin:

* ClientRelationship,
* Project where applicable,
* onboarding template/version,
* Handoff/Deal lineage.

---

## Onboarding template version

Design 022 already requires onboarding template snapshots/versioning.

Design 106 must not resolve “latest onboarding template” again on retry after the Handoff has already selected/pinned one unless policy explicitly restarts the step.

---

## Project template/workflow linkage

Upcoming Designs 108–110 may use:

* ProjectTemplate,
* WorkflowTemplateVersion.

If Handoff selects one, exact version should be pinned before Project creation.

Do not let later template edits rewrite created Projects.

---

## Product/Package→Project mapping

If commercial catalog items map to operational templates:

use an explicit mapping/configuration layer.

Do not make:

```text
Package = WorkflowTemplate
```

the architecture.

---

## Commercial source selection

Server should resolve authoritative precedence/policy.

Example possibilities:

```text
executed ContractVersion
accepted ProposalVersion
Deal commercial snapshot
```

depending on configured process.

Do not let the browser arbitrarily choose whichever gives preferable terms.

---

## Contract verification

If Handoff requires signed Contract:

use:

```text
ContractExecutionResolver
```

canonical verified state.

Never raw provider callback or “2/2 signed” frontend count.

---

## Deal source revision

Handoff initiation should pin/check Deal revision so a stale conversion screen cannot operate after Deal was reopened/lost/changed.

---

## Deal changed after handoff begins

Important.

If Deal remains Won and non-material metadata changes:

Handoff may continue.

If commercial source or closure validity changes:

mark:

```text
REQUIRES_ATTENTION
```

according to policy.

Do not silently restart from latest data.

---

## Handoff source immutability

Once Handoff begins, exact commercial source references must remain pinned.

Example:

```text
Proposal v3 chosen
```

Later:

```text
Proposal v4 created
```

Handoff remains sourced from v3 unless an explicit reset/new governed handoff action occurs.

---

## Duplicate Project prevention

Use a durable uniqueness/idempotency relationship such as:

```text
handoffId + projectPurpose
```

rather than checking names.

---

## Duplicate Onboarding prevention

Same.

---

## Handoff completion resolver

Conceptually:

```text
resolveHandoffCompletion(handoffId)
```

evaluates required outputs under the pinned policy.

It does not rely on frontend checkboxes.

---

## Handoff completion ≠ downstream workflow completion

Reiterate:

```text
Project created        ✓
Onboarding created     ✓

Handoff COMPLETED
```

even though:

```text
Project = ACTIVE
Onboarding = 10% COMPLETE
```

---

## Failure classification

Errors should be classified:

```text
validation
permission
conflict
dependency unavailable
retryable infrastructure
permanent business rule
```

to support safe retry.

---

## Unknown outcome handling

Example:

```text
ProjectService request sent
network response lost
```

Do not immediately create another Project.

Reconcile by idempotency/handoff source before retry.

---

## Durable queue/worker support

Cross-domain setup may require asynchronous execution.

Use durable job/outbox semantics with:

* leases,
* retry limits,
* dead-letter/requires-attention state.

---

## Handoff worker crash

Must resume from stored step/result state.

Not restart conversion from scratch.

---

## Audit

Material actions should record:

```text
WonDealHandoffInitiated
ExistingClientLinked
ClientRelationshipCreated
ClientContactLinked
ProjectCreatedFromDeal
OnboardingCreatedFromDeal
HandoffStepFailed
HandoffRetried
WonDealHandoffCompleted
```

with actor/source lineage.

---

## Activity

Deal/Client/Project Activity can project these events.

Activity remains distinct from:

* Handoff,
* Audit,
* downstream business records.

---

## Notifications

Design 080 may notify:

* handoff ready,
* handoff requires attention,
* project/onboarding setup failed.

Notification read state never changes Handoff.

---

## My Work integration

If a failed/manual handoff creates an operational responsibility:

Design 078 can project a canonical Task/approval as appropriate.

Do not make the Handoff itself a generic mutable WorkItem.

---

## Search

Design 079 may index safe Handoff status/reference where helpful.

But Search cannot be used to resolve Client identity or source commercial terms.

---

## Caching

Handoff Detail caching should vary by:

```text
organizationMembershipId
dealId
handoffId
authorizationRevision
dealRevision
handoffRevision
clientRevision
commercialSourceRevision
project/onboarding result revisions
```

---

## Performance

Use:

* one Handoff aggregate read,
* batched Client/Contact lookup,
* exact Proposal/Contract references,
* summarized downstream outputs,
* lazy detailed downstream histories.

Do not rebuild Project/Onboarding full workspaces inside the Handoff page.

---

## Partial failure contract

Example:

```text
Deal                   ✓
Company                ✓
Commercial source      ✓
ClientRelationship     ✓
Project                ✓
Onboarding             ✕
Portal invite          not required
```

Correct result:

> **Handoff partially completed — Client and Project established; Onboarding requires retry.**

Incorrect:

> Conversion failed.

And never:

> rollback Client + Project.

---

## Backend Requirement Matrix

| Requirement                                      | Status                        |
| ------------------------------------------------ | ----------------------------- |
| Canonical Deal reuse from 016–017/096            | **Critical**                  |
| Deal Won/Handoff separation                      | **Critical**                  |
| Handoff failure/Deal lifecycle separation        | **Critical**                  |
| First-class durable Handoff identity             | **Critical**                  |
| Handoff idempotency                              | **Critical**                  |
| DB-level duplicate-conversion protection         | **Critical**                  |
| Handoff policy/version pinning                   | **Critical**                  |
| Readiness/execution separation                   | **Critical**                  |
| Company/ClientRelationship separation            | **Critical**                  |
| Existing Client reuse                            | **Critical**                  |
| Concurrent Client creation dedupe                | **Critical**                  |
| Contact/ClientContact separation                 | **Critical**                  |
| ClientContact/PortalMembership separation        | **Critical**                  |
| Contact identity reuse/no duplicate person       | **Critical**                  |
| Deal/Client lifecycle separation                 | **Critical**                  |
| Proposal exact-version lineage                   | **Critical**                  |
| Contract exact executed-version lineage          | **Critical where applicable** |
| Current catalog/historical agreement separation  | **Critical**                  |
| Package/Project separation                       | **Critical**                  |
| Project creation via canonical ProjectService    | **Critical**                  |
| Project creation idempotency                     | **Critical**                  |
| One Deal→many Projects possibility preserved     | **Required architecture**     |
| Handoff/Onboarding separation                    | **Critical**                  |
| Onboarding via canonical service                 | **Critical**                  |
| Onboarding creation idempotency                  | **Critical**                  |
| Exact onboarding-template version                | **Critical**                  |
| Portal Invitation/Membership separation          | **Critical**                  |
| No direct PortalMembership creation              | **Critical**                  |
| Portal invite idempotency                        | **Critical if included**      |
| Handoff/Invoice separation                       | **Critical**                  |
| Billing via canonical InvoiceService only        | **Critical if included**      |
| Handoff as saga, not distributed transaction     | **Critical**                  |
| Durable step/result tracking                     | **Critical**                  |
| Resume after partial failure                     | **Critical**                  |
| Completed-step non-recreation                    | **Critical**                  |
| Explicit compensation only                       | **Critical**                  |
| Unknown downstream outcome reconciliation        | **Critical**                  |
| Durable queue/outbox                             | **Critical**                  |
| Worker crash recovery                            | **Critical**                  |
| Optimistic/revision concurrency                  | **Critical**                  |
| Cross-tenant links prohibited                    | **Critical**                  |
| Server-authoritative commercial source selection | **Critical**                  |
| Handoff source pinned after initiation           | **Critical**                  |
| Design 021 Client reuse                          | **Critical**                  |
| Design 022/107 Onboarding reuse                  | **Critical**                  |
| Design 023/108 Project reuse                     | **Critical**                  |
| Designs 062/076 Portal access reuse              | **Critical**                  |
| Designs 097–105 commercial lineage reuse         | **Critical**                  |
| Permission-safe composition                      | **Critical**                  |
| Audit/outbox integration                         | **Critical**                  |
| Partial dependency failure handling              | **Critical**                  |

---

# 8. Consolidation

Design 106 exposes major cross-domain duplication risk because it sits exactly where Sales becomes Client delivery.

**Deal / Client conflation**
Won opportunity mutates into account identity.

**Company / Client conflation**
Business identity and commercial relationship collapse.

**Deal Won / Handoff complete conflation**
Commercial success appears operationally delivered.

**Handoff failure / Deal Lost conflation**
Operational error rewrites Sales history.

**Deal status / Client lifecycle conflation**
Pipeline state controls account relationship.

**ClientRelationship / Company flag conflation**
`company.isClient=true` becomes entire client model.

**One Won Deal / one new Client conflation**
Repeat customer gets duplicated.

**Existing Client / duplicate error conflation**
Valid repeat-business path fails.

**Company name/domain / Client identity conflation**
Loose matching creates wrong/duplicate Client.

**Contact / ClientContact conflation**
CRM person identity becomes relationship record.

**Contact / Portal User conflation**
External business person automatically receives authentication identity.

**ClientContact role / PortalRole conflation**
Billing contact or executive sponsor gains security permissions.

**Contact email / PortalMembership conflation**
Matching email grants client access.

**Portal invitation / active membership conflation**
Invitation bypasses activation.

**Deal owner / Client access authority conflation**
Sales ownership grants unrelated Client permissions.

**Deal owner / Project creation authority conflation**
Commercial ownership bypasses operations governance.

**Handoff permission / Won-stage permission conflation**
Operations user can mark Deal Won.

**Proposal / Contract conflation**
Accepted offer becomes executed legal agreement.

**Proposal latest / accepted ProposalVersion conflation**
New draft changes handoff terms.

**Contract latest / executed ContractVersion conflation**
Unsigned amendment changes delivery scope.

**Provider signed event / verified Contract execution conflation**
Handoff begins from unverified legal state.

**Current Package / agreed Package snapshot conflation**
Catalog update changes what client receives.

**Package / Project conflation**
Commercial bundle becomes delivery identity.

**PackageItem / Deliverable instance conflation**
Reusable promise becomes actual client deliverable.

**Package / WorkflowTemplate conflation**
Commercial terms and process mechanics become one record.

**Catalog update / Project scope update conflation**
Changing package alters active client work.

**Project scope / Contract terms conflation**
Operational change rewrites legal agreement.

**Handoff / Project conflation**
Cross-domain orchestration becomes delivery record.

**Handoff / Onboarding conflation**
Setup process and client onboarding progress collapse.

**Handoff complete / Onboarding complete conflation**
Conversion remains open for weeks/months unnecessarily.

**Handoff complete / Project complete conflation**
Won Deal appears unconverted until final delivery.

**Handoff / Portal activation conflation**
Operational setup grants authentication.

**Handoff / billing conflation**
Won Deal silently creates Invoice.

**Contract execution / Invoice issuance conflation**
Legal milestone directly bills without explicit policy.

**Client creation / Invoice creation transaction conflation**
Finance failure rolls back valid Client relationship.

**Distributed mega-transaction**
CRM + Client + Project + Portal + Finance lock together.

**Partial failure / total rollback conflation**
Valid downstream entities are deleted.

**Partial completion / full success conflation**
Missing Onboarding is hidden.

**Partial completion / full failure conflation**
Valid Client/Project are recreated on retry.

**Retry / new Handoff conflation**
One Deal produces several conversions.

**Retry / duplicate Client conflation**
Repeated click creates several Client accounts.

**Retry / duplicate Project conflation**
Same agreement creates multiple delivery Projects.

**Retry / duplicate Onboarding conflation**
Multiple checklists start.

**Retry / duplicate Invitation conflation**
Client receives repeated invites.

**Unknown Project create outcome / retry blindly conflation**
Network timeout creates duplicate Projects.

**Unknown Client creation outcome / “not found” conflation**
Dependency failure duplicates client.

**Client lookup unavailable / no existing Client conflation**
Major duplicate-account risk.

**Current Package lookup on retry / pinned commercial source conflation**
Second attempt creates different scope than first.

**Current onboarding template / pinned template conflation**
Retry creates different onboarding process.

**Current workflow template / created Project truth conflation**
Later template edit changes resumed handoff.

**Handoff step record / downstream entity conflation**
Orchestrator owns Project/Onboarding state.

**Handoff state / Notification state conflation**
Dismiss alert marks conversion resolved.

**Handoff state / Task state conflation**
Generic work queue becomes orchestration source truth.

**ActivityEvent / Handoff state conflation**
Timeline string becomes execution engine.

**AuditEvent / Handoff result conflation**
Compliance record becomes orchestration state.

**Browser-selected Client / trusted identity conflation**
Request tampering links Deal to wrong account.

**Browser-selected Proposal/Contract version / authoritative commercial source conflation**
User picks favorable terms.

**Handoff source / “latest” commercial version conflation**
Commercial history drifts during processing.

**Cross-tenant Client linkage**
Deal handed to another organization's client.

**Cross-tenant Project creation**
Delivery leaks across tenant boundary.

**Handoff cache / stale execution truth conflation**
UI says step pending after it already created entity and user retries.

**106/021 duplicate Client backend**
Client 360 and conversion create different account identities.

**106/022/107 duplicate Onboarding backend**
Handoff owns checklist state.

**106/023/108 duplicate Project backend**
Conversion creates private project entities.

**106/062/076 duplicate Portal access backend**
Won Deal directly creates client users.

**106/096 duplicate Deal closure logic**
Handoff independently marks win.

**106/097–100 duplicate commercial-document state**
Conversion stores its own accepted/signed status.

**106/104–105 duplicate package truth**
Handoff reads current catalog instead of agreed snapshot.

No additional screen is required.

These are **Deal-to-Client identity, durable conversion orchestration, repeat-client resolution, commercial-source pinning, Project/Onboarding creation, Portal/Billing separation, saga/idempotency, concurrency, permission and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL WON-DEAL CONVERSION, CLIENT-RELATIONSHIP & DELIVERY-HANDOFF ANCHOR**

**Domain directive:**
**Deal ≠ DealStage/Lifecycle ≠ WonDealHandoff ≠ Company ≠ Contact ≠ ClientRelationship ≠ ClientContact ≠ Project ≠ ClientOnboarding ≠ Proposal/ProposalVersion ≠ Contract/ContractVersion ≠ Product/Package Snapshot ≠ ClientPortalMembership ≠ Invoice.**

**Deal directive:**
Designs 016–017/096 remain authoritative for Deal identity, stage, and Won lifecycle. Design 106 consumes Won state and never independently patches the Deal into a client state.

**Win/handoff directive:**
Deal Won and Handoff Completed are separate facts. Operational setup failure can never rewrite a legitimately Won Deal to Open/Lost.

**Handoff-identity directive:**
each conversion uses a durable, tenant-scoped `WonDealHandoff` identity tied to the exact Deal and pinned HandoffPolicyVersion. Retry resumes this record rather than creating another conversion.

**Readiness directive:**
server-side readiness determines whether this Deal can currently be handed off. Readiness and execution remain separate and commercial prerequisites are policy/version driven rather than hard-coded into the UI.

**Company directive:**
canonical Company identity remains unchanged. Winning a Deal never transforms Company into another duplicated “Client company” record.

**Client directive:**
Client is an explicit ClientRelationship/account context attached to canonical Company. Existing Client relationships are reused and repeat business produces additional Deals/Projects—not duplicate Client identities.

**Concurrent-client directive:**
simultaneous Won Deals for the same Company must converge safely on the correct ClientRelationship under transactional uniqueness/identity-resolution policy.

**Contact directive:**
canonical Contact identities are reused. ClientContact is an explicit relationship role and never a duplicated person.

**Portal-identity directive:**
ClientContact, Contact email, Deal participation, or Won status never creates User, AuthenticationIdentity or ClientPortalMembership automatically.

**Invitation directive:**
if portal onboarding is requested, Design 062/076's canonical Invitation → activation → Membership workflow is used. Invitation creation and Membership activation remain separate.

**Commercial-source directive:**
handoff pins the exact authoritative ProposalVersion, ContractVersion and/or agreed commercial snapshot selected under policy. It never uses “latest” versions after initiation.

**Contract directive:**
where executed Contract is a required prerequisite, Design 100's verified executed ContractVersion—not provider callbacks or frontend signer counts—is the legal evidence used.

**Catalog directive:**
Designs 104–105 remain mutable future catalog configuration. Handoff scope derives from agreed historical commercial snapshots, never from current Product/Package definitions or today's price.

**Project directive:**
Design 023/108 remain authoritative for Project identity. Handoff requests canonical Project creation/linkage and records the result; it never creates a parallel DealProject entity.

**Project-cardinality directive:**
architecture must not assume every Deal always maps to exactly one Project unless Phase 3D explicitly establishes that business rule.

**Project-scope directive:**
initial Project scope can seed from the exact agreed commercial snapshot, while later Project Change Requests remain operational changes that never rewrite Proposal/Contract history.

**Onboarding directive:**
Design 022/107 remain authoritative for ClientOnboarding. Handoff creates/links an onboarding instance using an exact template/version but does not own checklist progress.

**Completion directive:**
Handoff completion means the required downstream entities have been successfully established—not that Onboarding, Project delivery, Portal activation, billing, or payment has completed.

**Billing directive:**
Invoice creation remains a separate canonical finance action under Designs 020/101–103. Deal Won or Handoff Completed never silently issues or pays an Invoice.

**Saga directive:**
Won Deal handoff is a durable saga/orchestration across Client, Project, Onboarding, Portal, and optional Billing domains—not one distributed ACID transaction.

**Partial-success directive:**
completed downstream outputs remain valid if a later step fails. A Project created successfully is not deleted merely because Onboarding creation failed.

**Resume directive:**
retry continues from recorded step results and never recreates already-successful Client, Project, Onboarding, Invitation, or billing outputs.

**Unknown-outcome directive:**
if a downstream request may have succeeded but its response was lost, Handoff reconciles by stable idempotency/source lineage before retrying. Blind recreation is prohibited.

**Idempotency directive:**
Handoff initiation, Client creation/linking, ClientContact linking, Project creation, Onboarding creation and any optional Portal/Billing actions must all be replay-safe.

**Concurrency directive:**
Deal revision, Handoff revision, Client relationship uniqueness and downstream output creation are concurrency-protected so parallel users/workers cannot create conflicting conversion results.

**Pinned-source directive:**
once processing starts, later Proposal drafts, Contract drafts, Package versions, prices, onboarding templates or workflow templates never silently change this Handoff's source inputs.

**Template directive:**
if Project/Onboarding templates are selected, the exact template/version is pinned before creation. Later template edits affect future work only.

**Authorization directive:**
Deal handoff, Client creation/linking, Contact relationship changes, Project creation, Onboarding creation, Portal invitation and billing remain independently governed. Handoff orchestration cannot become a permission bypass.

**Tenant directive:**
Deal, Company, ClientRelationship, Contact, Project, Onboarding, Portal and billing references are strictly tenant-scoped. Cross-tenant linkage is prohibited.

**Actor directive:**
Handoff initiator and material manual resolutions derive from authenticated OrganizationMembership, never arbitrary browser-supplied user IDs.

**Failure directive:**
dependency outage is never interpreted as absence. `Client lookup unavailable` cannot become `No existing client`; `commercial source unavailable` cannot become `Use current Package`; `Project timeout` cannot become `create another Project`.

**Audit directive:**
conversion initiation, Client creation/linking, Contact linking, Project/Onboarding creation, retries, exceptions and completion produce actor/source-aware Audit evidence while each downstream domain retains its own history.

**Activity directive:**
Deal, Client and Project Activity may project handoff events but Activity remains observational and never replaces the Handoff or downstream canonical records.

**Notification directive:**
Design 080 may notify users that a handoff is ready, partially completed, or requires attention; notification state never resolves or retries the Handoff.

**Caching directive:**
handoff caches vary by Deal/Handoff/membership authorization revisions and downstream result revisions. Stale cache state must never cause an already-completed step to be re-executed.

**Performance directive:**
use one Handoff aggregate, batched Client/Contact resolution, exact commercial references, summarized downstream outputs and lazy detailed histories rather than embedding full Client/Project/Onboarding workspaces.

**Future-reuse directive:**
Design **107 — Client Onboarding Checklist Detail** must consume the exact `ClientOnboarding` instance established by Design 106/022 and must never create a second onboarding identity simply because the handoff originated from a Won Deal.

**Overlap directive:**
Designs **016–023, 062, 076, 096–110** must preserve one continuous **Deal → Won → WonDealHandoff → Company → ClientRelationship → exact commercial agreement → Project / ClientOnboarding → later Portal/Billing operations** lineage while keeping Sales, identity, legal, delivery, onboarding, authorization and finance lifecycles independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE WON-DEAL HANDOFF FOUNDATION — CANONICAL WON DEAL + DURABLE VERSION-PINNED HANDOFF IDENTITY + EXISTING-CLIENT-FIRST COMPANY→CLIENTRELATIONSHIP RESOLUTION + EXPLICIT CLIENTCONTACT LINKS + EXACT PROPOSAL/CONTRACT/COMMERCIAL SNAPSHOT PROVENANCE + IDEMPOTENT CANONICAL PROJECT/ONBOARDING CREATION + OPTIONAL PORTAL/BILLING THROUGH THEIR OWN SERVICES + DURABLE PARTIAL-SUCCESS SAGA EXECUTION + UNKNOWN-OUTCOME RECONCILIATION + NON-DESTRUCTIVE RETRY/RESUME — AND NEVER ALLOW DEAL WIN, COMPANY FLAGS, CONTACT EMAILS, CURRENT PACKAGE DATA, RETRIES OR CROSS-DOMAIN UI ACTIONS TO CREATE DUPLICATE CLIENTS, USERS, PROJECTS, ONBOARDINGS, INVOICES OR TO REWRITE HISTORICAL COMMERCIAL TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **106 / 153** |
| **PASS**                                   |                        **106** |
| **STANDARDIZE decisions**                  |                        **104** |
| **Potential implementation-overlap flags** |                         **97** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**106 / 153 = 69.3% audited.**

### Canonical Won Deal handoff architecture after Design 106

```text
                         DEAL D-100
                              │
                         lifecycle = WON
                              │
                              ↓
                    WON DEAL HANDOFF H-1
                              │
                   exact source versions
                              │
          ┌───────────────────┼──────────────────┐
          ↓                   ↓                  ↓
      Company C1      ProposalVersion PV3   ContractVersion CV2
          │                                      executed
          ↓
 Resolve ClientRelationship
          │
   ┌──────┴─────────┐
   ↓                ↓
existing CR1     create CR1
   └──────┬─────────┘
          ↓
 ClientRelationship CR1
          │
    ┌─────┼──────────────┐
    ↓     ↓              ↓
Contacts Project       Onboarding
        PR-100           ON-100
```

The most important repeat-client rule is now explicit:

```text
Company Globex

Deal D1 → WON
        ↓
ClientRelationship CR-1

Later:

Deal D2 → WON
        ↓
Reuse ClientRelationship CR-1

NOT:

Globex Client #1
Globex Client #2
```

The handoff and onboarding boundaries are equally strict:

```text
Client relationship created    ✓
Project created                ✓
Onboarding record created      ✓

Handoff = COMPLETED

while:

Project = ACTIVE
Onboarding = IN PROGRESS

This is valid.
```

Partial failure must remain resumable:

```text
ClientRelationship     ✓
Project                ✓
Onboarding             ✕

Handoff = PARTIALLY COMPLETED

Retry:
    resumes Onboarding step

Retry does NOT create:
    another Client
    another Project
```

And commercial history stays pinned:

```text
Deal agreed Package snapshot:
$1,000

Current catalog today:
$1,500

Handoff / Project seed:
agreed $1,000 snapshot

NOT:
today's $1,500 catalog state.
```

Finally, the access boundary remains absolute:

```text
Contact
    ≠
ClientContact
    ≠
Portal Invitation
    ≠
ClientPortalMembership
    ≠
AuthenticationIdentity
```

Winning a Deal never bypasses that chain.

## Next Sequential Audit Target

### **Design 107 — Client Onboarding Checklist Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
