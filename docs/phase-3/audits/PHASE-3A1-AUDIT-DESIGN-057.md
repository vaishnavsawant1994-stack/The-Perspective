# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 057 — Client Renewal / Continuation Workspace

Its frozen identity is locked.

Design 057 should become the **canonical Client Portal continuation/renewal workspace** for an existing Client relationship after, or near the end of, a defined engagement.

Its job is to let an authorized Client understand available continuation options and the commercial state of a renewal without mutating the Project, Contract, Proposal, Report, or delivery history of the completed engagement.

The governing boundary is:

> **Completed Project ≠ Client Relationship ≠ Renewal Opportunity ≠ Renewal Proposal ≠ New Deal ≠ Contract Renewal/Extension ≠ New ContractVersion ≠ Subscription/Continuation Term.**

The most important implementation principle is:

> **Renewal is a new commercial continuation process linked to historical evidence. It is never implemented by reopening or rewriting the original Project, Proposal, Contract, Invoice, Publication, or Report.**

---

# 1. Classification

| Audit field                     | Classification                                                                                                                                              |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                   | **057**                                                                                                                                                     |
| **Canonical name**              | **Client Renewal / Continuation Workspace**                                                                                                                 |
| **Product area**                | Client Portal / Commercial Continuation / Retention                                                                                                         |
| **User surface**                | **Client Portal**                                                                                                                                           |
| **Screen class**                | Client Renewal / Continuation Opportunity Workspace                                                                                                         |
| **Classification**              | **Portal Workflow Anchor — Client Renewal & Continuation Family**                                                                                           |
| **Primary purpose**             | Let authorized Clients understand continuation opportunities, prior-engagement context, available renewal/commercial options and the next authorized action |
| **Primary relationship entity** | **Client / commercial relationship**                                                                                                                        |
| **Renewal context**             | **RenewalOpportunity / RenewalContext**                                                                                                                     |
| **Sales dependency**            | Deal — Design 016                                                                                                                                           |
| **Proposal dependency**         | Proposal / ProposalVersion — Design 018                                                                                                                     |
| **Contract dependency**         | Contract / ContractVersion — Designs 019 / 053                                                                                                              |
| **Project dependency**          | Project — Designs 023 / 043                                                                                                                                 |
| **Performance evidence**        | Reports / Metrics — Designs 033 / 056                                                                                                                       |
| **Delivery evidence**           | Publishing / Distribution — Designs 031–032 / 055                                                                                                           |
| **Finance dependency**          | Invoice / Payment — Designs 020 / 054                                                                                                                       |
| **Future handoff dependency**   | Design 106 — Client Conversion / Won Deal Handoff                                                                                                           |
| **Project-closeout overlap**    | Designs 120–123                                                                                                                                             |
| **Parent shell**                | `ClientPortalShell` — Design 002                                                                                                                            |
| **Primary read model**          | `ClientRenewalContinuationView`                                                                                                                             |
| **Template family**             | `ClientCommercialContinuationWorkspaceTemplate`                                                                                                             |
| **Auth**                        | Required                                                                                                                                                    |
| **Authorization**               | Portal membership + Client relationship scope + renewal/commercial entitlement                                                                              |
| **Implementation priority**     | **High Commercial Retention / Revenue Continuity**                                                                                                          |
| **Reuse level**                 | **Very High across CRM, Contract, Project, Reporting and Finance domains**                                                                                  |

Design 057 should answer:

> **“What engagement am I continuing from, what was delivered, what continuation options are available, what exact commercial proposal/term applies, what action is required from me, and what happens if I continue?”**

A safe high-level chain is:

```text
Historical Client Engagement
        │
        ├── Completed / closing Project
        ├── Executed Contract
        ├── Delivery history
        ├── Performance Report
        └── Finance history
                ↓
        Renewal / Continuation Context
                ↓
        Commercial Opportunity
                ↓
        Proposal / Offer
                ↓
      Client review / acceptance
                ↓
       Contract action if required
                ↓
     New continuation engagement
```

The historical engagement remains immutable.

---

# 2. Reuse

## Reuse the existing Client relationship

Design 057 must not create a second “renewal client.”

The same canonical Client relationship continues.

Correct:

```text
Client
  ├── Historical Project A
  ├── Historical Contract A
  └── Renewal Opportunity B
```

Incorrect:

```text
Client A
RenewalClient A
```

---

## Reuse the canonical Deal domain

Design 016 remains the canonical commercial opportunity/pipeline domain.

If a renewal becomes a sales opportunity, prefer:

```text
Deal
origin/context = renewal
```

or an explicit typed relationship to a `RenewalOpportunity`.

Do not create a second independent:

```text
RenewalDeal
```

pipeline engine.

---

## RenewalOpportunity may be a commercial context, not a duplicate Deal

The architecture should distinguish:

```text
Renewal context
```

from:

```text
CRM Deal execution
```

A useful conceptual model is:

```text
RenewalOpportunity
├── Client
├── originating engagement
├── eligibility/context
├── recommended continuation
└── linked Deal where commercial negotiation begins
```

This avoids turning every eligible renewal into a fully active sales Deal prematurely.

Exact Phase 3D modeling can determine whether RenewalOpportunity is:

* a first-class entity, or
* a typed commercial context/projection around Deal.

But there must be **one commercial pipeline truth**.

---

## Reuse Proposal infrastructure

If the Client is offered:

* another magazine,
* additional PR,
* podcast package,
* recurring visibility program,
* revised package,

the formal commercial proposal should reuse Design 018.

Correct:

```text
RenewalOpportunity
       ↓
Proposal
       ↓
ProposalVersion
```

Not:

```text
renewal.offerJson
```

as a second proposal engine.

---

## Reuse Contract infrastructure

If continuation requires contractual execution, reuse Design 019/053/070.

Renewal does not need a second Contract model.

---

## Reuse Project creation/handoff

A successful continuation can eventually create:

* new Project,
* new Project term,
* new delivery engagement,

through the existing controlled Project/Client handoff architecture.

Do not reopen an archived Project merely to represent new paid work.

---

## Reuse Reports and performance evidence

Design 056 provides finalized Client performance evidence.

Design 057 may reference:

* prior outcomes,
* completed deliverables,
* verified distribution,
* final Reports,

to help explain renewal value.

It must consume the exact historical ReportVersion rather than recalculating past performance from live data.

---

## Reuse Client Action Resolver

Design 047 can surface Client actions such as:

* review continuation proposal,
* approve renewal,
* sign continuation Contract,
* complete payment,

but each action retains canonical source lineage.

Design 057 should not maintain duplicate `actionComplete` fields.

---

# 3. Entities

## Completed Project ≠ Client Relationship

A Project can end while the Client relationship continues.

```text
Project
COMPLETED
```

does not imply:

```text
Client Relationship
ENDED
```

The Client may have:

* another active Project,
* renewal opportunity,
* future engagement,
* ongoing reporting/access.

---

## Project completion should remain immutable history

Once Project A is completed/closed:

do not implement renewal by changing:

```text
Project A.status = ACTIVE
```

again.

A continuation should create appropriate new commercial/work records.

---

## RenewalOpportunity ≠ historical Project

Renewal references historical engagement evidence.

Conceptually:

```text
RenewalOpportunity
├── clientId
├── originatingProjectId
├── originatingContractId
├── eligibleAt / renewal window
├── commercial context
├── current state
└── linked Deal/Proposal
```

Exact fields later.

---

## RenewalOpportunity ≠ Deal necessarily

A Client may be eligible for renewal before Sales has opened a formal opportunity.

Therefore:

```text
Renewal eligible
≠
Deal created
```

This prevents pipeline inflation.

---

## Deal ≠ RenewalOpportunity

Once commercial negotiation becomes real:

```text
RenewalOpportunity
        ↓
Deal
```

Deal remains the canonical opportunity.

Renewal context explains why it exists.

---

## Renewal Proposal ≠ Deal

The Deal tracks the commercial opportunity.

The Proposal is a versioned commercial document.

```text
Renewal Deal
    ↓
Proposal
    ↓
ProposalVersion
```

Do not store proposal terms directly on Deal as the only evidence.

---

## Proposal ≠ Contract

Accepted continuation terms can lead to Contract formation.

They do not automatically become the legal Contract.

---

## Proposal acceptance ≠ Contract execution

Same invariant established earlier:

```text
Proposal accepted
        ↓
possible Contract
        ↓
ContractVersion
        ↓
signing/execution
```

---

## Renewal ≠ ContractVersion automatically

This boundary is especially important.

There are several possible legal outcomes:

```text
Renewal
├── new Contract
├── Contract extension
├── Amendment
└── new ContractVersion under governed policy
```

The exact legal mechanism belongs to Contract architecture/business policy.

Design 057 must not decide this by simply incrementing:

```text
contract.version++
```

---

## Executed Contract must never be edited in place

If original Contract says:

```text
Term:
Jan 1 – Dec 31
```

do not implement renewal by changing it to:

```text
Jan 1 – next Dec 31
```

inside the executed record.

That destroys legal history.

---

## Contract Extension ≠ new Contract automatically

A legally valid extension may be represented differently from a brand-new agreement.

Architecture should preserve explicit relationship semantics such as:

```text
original Contract
     ↓
extension / amendment / successor Contract
```

rather than assuming all renewals are identical.

---

## New ContractVersion ≠ renewal term automatically

ContractVersion represents document/version identity.

A continuation term represents the new commercial/service period.

The two may be linked but are not identical.

---

## Continuation Term

Where recurring/term-based engagement exists, a conceptual continuation term may represent:

```text
ContinuationTerm
├── Client relationship
├── start date
├── end date
├── commercial package/reference
├── governing Contract
├── originating renewal
└── status
```

Exact need/schema belongs to Phase 3D.

Do not introduce it if the frozen product only uses discrete Projects/Contracts.

---

## Subscription ≠ Contract

If future continuation is subscription-like:

```text
Subscription / recurring service term
≠
Contract
```

Contract may govern the subscription, but operational recurring entitlement/billing remains separate.

This audit does not add a new subscription product.

---

## Renewal window ≠ Contract expiry

A renewal campaign may begin:

> 60 days before Contract end.

That is a commercial timing rule.

The Contract expiry/effective term remains legal truth.

---

## Eligibility ≠ action required

A Client can be eligible for continuation without needing to do anything immediately.

Design 047 should only receive a ClientAction when a genuine action is required.

---

## Renewal opportunity state ≠ Deal stage

Example:

```text
Renewal:
ELIGIBLE

Deal:
QUALIFICATION
```

or:

```text
Renewal:
OFFERED

Deal:
PROPOSAL_SENT
```

These are separate conceptual dimensions.

Do not force one enum across both.

---

## Relationship health ≠ renewal status

Internal account-health scoring may influence renewal strategy.

That does not become Client-facing renewal state automatically.

Do not expose internal:

* churn risk,
* probability,
* sales confidence,
* internal score,

unless frozen design intentionally does.

---

## Performance ≠ renewal entitlement

Strong performance may support renewal messaging.

It should not automatically authorize or create a commercial continuation.

Business rules decide eligibility.

---

## Prior ReportVersion should be exact

If Design 057 references:

> Your campaign generated 125K verified impressions

that value should trace to an exact finalized historical ReportVersion/metric snapshot.

Do not recalculate it from current lifetime metrics.

---

## Prior publication/distribution evidence

Similarly, continuation context may reference:

* verified publication,
* placements,
* channels,
* delivered assets.

These remain historical source-domain records.

---

## Historical Finance ≠ new renewal Invoice

Past payments should remain linked to the prior engagement.

New continuation billing creates new canonical Invoice obligations.

Do not reuse old Invoice IDs.

---

## Prior balance ≠ renewal amount

If the Client still owes money from the previous engagement:

that remains the existing Invoice/Finance domain.

Do not roll it silently into the renewal offer unless an explicit commercial process does so.

---

## Renewal amount ≠ historical Contract amount

The continuation offer can:

* increase,
* decrease,
* change package,
* add services.

Historical Contract amount remains historical.

---

## Package change ≠ Project mutation

If the Client renews from:

> Standard Magazine

to:

> Premium Magazine + Podcast

create new commercial/delivery context.

Do not modify the completed Project's package retrospectively.

---

## Product/package identity

Designs 104–105 later establish Products & Packages.

Renewal/continuation should reuse those canonical package definitions where applicable.

Do not embed arbitrary package copies everywhere without snapshot/version rules.

---

## Offer snapshot

A Proposal or continuation offer must preserve the commercial terms actually offered.

If package definition changes later, the Client's historical offer should remain reconstructable.

---

## Renewal acceptance ≠ new Project created instantly necessarily

Commercial acceptance may still require:

* Contract,
* signature,
* payment,
* onboarding/handoff.

The Project creation rule should be explicit.

---

## New Deal won ≠ new Project automatically

Design 106 later owns won-deal handoff.

Correct:

```text
Renewal Deal WON
      ↓
controlled handoff
      ↓
Client / Contract / Project / onboarding setup
```

No frontend direct Project creation as a side effect of one status toggle.

---

## Renewal declined ≠ Client relationship ended

A Client can decline this continuation while remaining:

* a historical Client,
* Portal user,
* potential future customer.

Do not deactivate the Client automatically.

---

## Renewal expired ≠ Client declined

If an offer expires without action:

```text
EXPIRED
≠
DECLINED
```

No negative intent should be invented.

---

## Renewal withdrawn ≠ Client declined

The business may withdraw/replace an offer.

That remains separate from Client rejection.

---

## Renewal superseded

If Offer v1 is replaced by ProposalVersion v2:

old commercial evidence remains historical.

Do not overwrite the first offer.

---

# 4. Permissions

Design 057 should authorize based on:

```text
Portal membership
+
Client relationship
+
renewal/continuation entitlement
+
linked Proposal/Contract/resource access
```

---

## Same Client ≠ same renewal access

Example:

```text
CEO
→ sees continuation proposal

Marketing Director
→ sees performance evidence
→ cannot accept commercial terms

Finance Contact
→ may see billing obligations
→ cannot negotiate package
```

Different Portal members can legitimately receive different Design 057 capabilities.

---

## Client relationship access ≠ renewal authority

A Client user who can see the account should not automatically accept continuation terms.

---

## Renewal read ≠ Proposal acceptance

Conceptually:

```text
portal.renewal.read
≠
portal.proposals.accept
```

Exact Phase 3D permissions later.

---

## Proposal read ≠ Contract sign

Permanent:

```text
proposal.read/accept
≠
contract.sign
```

---

## Renewal view ≠ payment authority

A Client executive can review renewal without having authority to initiate Finance operations.

---

## Portal Admin ≠ commercial approver

Design 062 Portal-team administration must not grant:

* Proposal acceptance,
* Contract approval,
* signing,
* payment.

---

## Project membership ≠ renewal access

A Client project contributor may finish their work but have no commercial authority.

Therefore:

```text
project.read
≠
renewal.read
```

unless explicitly granted.

---

## Historical Report access does not automatically imply renewal access

Design 056 and Design 057 remain distinct permission surfaces.

---

## Internal sales data must remain private

Design 057 must never expose Client-side:

* renewal probability,
* forecast amount,
* internal negotiation notes,
* competitor discussion,
* account health score,
* sales owner's private strategy,
* margin,
* discount floor,
* expected close date unless intentionally Client-facing.

---

## Internal Deal stage should be mapped safely

Client-facing language might conceptually be:

```text
Continuation available
Proposal ready
Awaiting your response
Agreement in progress
Confirmed
```

while internal Deal stages remain Sales terminology.

Do not expose internal pipeline mechanics directly.

---

## Commercial pricing visibility

Only users authorized for the renewal Proposal should receive:

* price,
* discount,
* package terms,
* billing schedule.

Do not return commercial values to unauthorized Project members.

---

## Search/filter authorization

If Design 057 includes history/options, authorization applies before commercial information is returned.

---

# 5. States

Design 057 needs separate state dimensions rather than one `renewal.status`.

### Renewal/continuation context

```text
Not Yet Eligible
Eligible
Continuation Available
Offer In Preparation
Offer Available
Awaiting Client Action
Accepted
Declined
Expired
Withdrawn
Superseded
Completed / Converted
```

Exact enum later.

### Linked Deal state

```text
Qualification
Proposal
Negotiation
Won
Lost
```

remains Design 016 truth.

### Proposal state

```text
Draft
Issued
Viewed
Accepted
Declined
Expired
Superseded
```

remains Design 018 truth.

### Contract state

```text
Preparing
Issued
Approval Required
Signature Required
Partially Signed
Executed
```

remains Design 019 truth.

These states are linked but not merged.

---

## Eligible ≠ offer available

The system may know:

> Client is eligible to renew.

while commercial staff have not yet prepared terms.

---

## Offer available ≠ accepted

Obvious but critical.

---

## Viewed ≠ accepted

Opening the renewal workspace cannot commit the Client commercially.

---

## Accepted Proposal ≠ executed continuation

Proposal acceptance can still require Contract/Finance/handoff.

---

## Contract executed ≠ Project started

The new Project may require onboarding or scheduled start.

---

## New Project created ≠ original Project reopened

Always preserve distinct identities.

---

## Declined ≠ lost relationship

Renewal may be declined but Client remains valid.

---

## Expired ≠ declined

No invented Client intent.

---

## Superseded ≠ rejected

A newer commercial offer replacing an older one does not mean the Client rejected the old offer.

---

## No renewal available ≠ system unavailable

Successful result:

> There are no continuation options available right now.

Failure:

> Renewal information is temporarily unavailable.

Separate states.

---

## Performance unavailable ≠ no performance

If Report/Delivery services fail:

Design 057 must not claim:

> No results were delivered.

It should localize the unavailable evidence.

---

## Historical Project unavailable ≠ renewal invalid automatically

If Project summary service temporarily fails while Renewal record loads:

the Client can still see known renewal information with degraded historical context.

---

## Proposal service failure ≠ offer declined

Never collapse technical failure into business state.

---

## Contract service failure ≠ renewal cancelled

Same principle.

---

## Partial failure

Example:

```text
Renewal context     ✓
Historical Report   ✓
Proposal             ✓
Contract summary     ✕
Finance summary      ✓
```

Design 057 should remain usable with a localized Contract state failure.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve a clear continuation narrative:

```text
Renewal / Continuation
↓
Previous Engagement Summary
├── Project
├── delivered outcome
├── relevant Report/performance evidence
└── completed term
↓
Continuation / Renewal Option
├── package/service
├── commercial term
├── proposed dates
├── price where authorized
└── current status
↓
Required Next Action
↓
Proposal / Contract / Payment context as applicable
```

The exact frozen visual remains unchanged.

The architectural goal is **commercial clarity**, not exposing the internal Sales CRM.

---

## Tablet

Following Design 152:

* historical evidence and renewal offer stack cleanly,
* pricing/term details remain legible,
* commercial actions remain prominent,
* supporting Report/Contract references can move to expandable panels,
* no internal Deal pipeline board should appear.

---

## Mobile

Priority:

```text
Renew / Continue
↓
Previous Engagement
↓
What You Received
↓
Continuation Option
    ├── Package
    ├── Term
    ├── Price where authorized
    └── Start/renewal context
↓
Current Commercial State
↓
Required Action
```

Do not compress a CRM opportunity table into the Client Portal.

---

## Mobile decision safety

Before high-impact actions such as:

* accepting Proposal,
* approving Contract,
* signing,
* payment,

the Client should see the exact:

* package,
* amount,
* term,
* ProposalVersion/Contract context,

appropriate to that canonical source workflow.

---

## Accessibility

Renewal state cannot rely only on chips/colors.

Use explicit text such as:

> Renewal proposal available
> Awaiting your response
> Proposal accepted — agreement preparation in progress
> Renewal offer expired

Commercial CTAs need explicit labels.

---

# 7. Backend Requirements

## Query architecture

```text
Design 057
    ↓
ClientPortalSessionContext
    ↓
Renewal Authorization
    ↓
ClientRenewalQueryService
    │
    ├── Client relationship
    ├── originating Project
    ├── Contract/term context
    ├── delivery evidence
    ├── finalized Report evidence
    ├── RenewalOpportunity / context
    ├── linked Deal
    ├── linked ProposalVersion
    ├── linked ContractVersion
    └── safe Finance context where applicable
    ↓
ClientRenewalContinuationView
```

---

## Commercial continuation architecture

```text
Existing Client Relationship
          ↓
Historical Engagement
          ↓
Renewal Eligibility / Trigger
          ↓
RenewalOpportunity
          ↓
Deal where commercial pipeline is warranted
          ↓
Proposal / ProposalVersion
          ↓
Client commercial response
          ↓
Contract / Extension / Amendment
          ↓
Signature / execution where required
          ↓
Won-deal / continuation handoff
          ↓
New Project / New Term / New Engagement
```

At no point should the old Project or Contract be rewritten as if the original engagement never ended.

---

## Renewal trigger

Potential triggers may come from:

* Project approaching completion,
* Contract term approaching end,
* scheduled account review,
* explicit staff action,

depending on frozen workflow.

Exact trigger policy belongs to Phase 3D.

Do not hard-code a universal:

```text
project.completed → create renewal immediately
```

without business rules.

---

## Eligibility resolver

A server-side `RenewalEligibilityResolver` or equivalent can evaluate canonical facts.

Conceptually:

```text
Client relationship
Project state
Contract term
existing active renewal
commercial policy
```

But it should produce a governed result rather than allowing frontend heuristic logic.

---

## Prevent duplicate active renewals

The backend should prevent accidental:

```text
Renewal A for Project 123
Renewal B for Project 123
Renewal C for Project 123
```

when all represent the same continuation cycle.

Idempotency/business uniqueness is required.

---

## Renewal cycles

If the Client renews repeatedly:

```text
Original Engagement
      ↓
Renewal Cycle 1
      ↓
Renewal Cycle 2
      ↓
Renewal Cycle 3
```

each cycle should remain historically distinguishable.

Do not overwrite one reusable `client.renewalStatus`.

---

## Relationship lineage

A useful lineage could become:

```text
Project P1
Contract C1
      ↓
Renewal R1
      ↓
Deal D2
Proposal P2
Contract C2
Project P2
      ↓
Renewal R2
```

This provides long-term commercial history.

---

## Historical evidence must be immutable references

If renewal justification includes:

* ReportVersion RV-3,
* Publication PUB-4,
* Contract C1,
* Project P1,

pin those exact identities.

Do not dynamically show whatever current records replaced them.

---

## Proposal commands remain in Proposal domain

Do not expose:

```text
acceptRenewal()
```

that directly modifies Proposal, Contract and Project simultaneously.

Prefer canonical source-specific commands such as:

```text
acceptProposal()
decideApproval()
beginContractSigning()
```

according to actual stage.

---

## Conversion/handoff command

Once commercial prerequisites are complete, a controlled handoff service can coordinate:

```text
Deal
Contract
Client
Project
Onboarding
```

Design 106 later specializes this area.

The process must be idempotent.

---

## Avoid duplicate Project creation

A repeated webhook/page refresh/status retry after renewal success must not create two continuation Projects.

---

## Avoid duplicate Contracts

Likewise, retries must not produce multiple successor Contracts accidentally.

---

## Renewal cancellation/decline events

Potential canonical events:

```text
RenewalOpportunityCreated
RenewalOfferAvailable
RenewalProposalAccepted
RenewalProposalDeclined
RenewalExpired
RenewalSuperseded
RenewalConverted
```

Exact vocabulary later.

These can feed:

* Client Action,
* Activity,
* Notifications,
* Audit,
* CRM.

---

## Notification integration

Potential Client notifications:

```text
Continuation option available
Proposal ready
Renewal action required
Contract ready for signature
Continuation confirmed
```

Notification remains attention infrastructure.

---

## Client Activity integration

Design 063 may eventually show:

> Renewal proposal became available.

> Continuation agreement signed.

Those events reference canonical commercial records.

---

## Audit integration

Material commercial events should feed Design 039:

```text
RenewalCreated
RenewalLinkedToDeal
ProposalIssued
ProposalAccepted
ContinuationContractCreated
RenewalConverted
RenewalWithdrawn
```

Audit does not replace Deal/Proposal/Contract history.

---

## Backend Requirement Matrix

| Requirement                                      | Status                               |
| ------------------------------------------------ | ------------------------------------ |
| Client Portal authentication                     | **Critical**                         |
| Active Portal membership                         | **Critical**                         |
| Client/account isolation                         | **Critical**                         |
| Renewal-level authorization                      | **Critical**                         |
| Canonical Client relationship reuse              | **Critical**                         |
| Historical Project linkage                       | **Critical**                         |
| Historical Contract linkage                      | **Critical**                         |
| Exact ReportVersion/performance evidence linkage | **Critical**                         |
| Delivery/Publication history linkage             | **Required**                         |
| RenewalOpportunity/context model                 | **Critical**                         |
| Renewal cycle lineage                            | **Critical**                         |
| Renewal eligibility resolver                     | **Critical**                         |
| Duplicate-renewal prevention                     | **Critical**                         |
| Deal domain reuse                                | **Critical when opportunity opened** |
| Proposal/ProposalVersion reuse                   | **Critical**                         |
| Contract/ContractVersion reuse                   | **Critical**                         |
| Approval reuse where applicable                  | **Critical**                         |
| Signature workflow reuse where applicable        | **Critical**                         |
| Finance reuse where applicable                   | **Critical**                         |
| Product/package reuse                            | **Required where applicable**        |
| Historical engagement immutability               | **Critical**                         |
| Completed Project non-mutation                   | **Critical**                         |
| Executed Contract non-mutation                   | **Critical**                         |
| Proposal snapshot/version integrity              | **Critical**                         |
| Contract extension/amendment lineage             | **Critical**                         |
| New engagement/Project handoff                   | **Critical**                         |
| Idempotent conversion/handoff                    | **Critical**                         |
| Client Action Resolver integration               | **Critical**                         |
| Safe Client-facing commercial status mapping     | **Critical**                         |
| Internal Sales-data exclusion                    | **Critical**                         |
| Permission-safe pricing projection               | **Critical**                         |
| Notification integration                         | **Required**                         |
| Activity integration                             | **Required**                         |
| Audit integration                                | **Critical**                         |
| Partial domain failure handling                  | **Critical**                         |
| Designs 016/018/019 backend reuse                | **Critical**                         |
| Design 056 Report reuse                          | **Critical**                         |
| Designs 106/120–123 future reuse                 | **Critical architecture**            |

---

# 8. Consolidation

Design 057 exposes several important implementation risks.

**Completed Project / Client Relationship conflation**
Closing Project accidentally closes the Client relationship.

**Renewal / old Project conflation**
Original Project is reopened and rewritten.

**RenewalOpportunity / Deal conflation**
Every eligible Client instantly pollutes the active Deal pipeline.

**RenewalDeal duplication**
A second sales pipeline is created for renewals.

**Deal / Proposal conflation**
Commercial terms stored only on opportunity record.

**Proposal / Contract conflation**
Accepted offer becomes legally executed agreement automatically.

**Proposal acceptance / Contract execution conflation**
Signing/legal steps are bypassed.

**Renewal / ContractVersion conflation**
Executed Contract simply gets a new version number without governed legal semantics.

**Contract extension / Contract mutation conflation**
Original end date/terms are edited in place.

**ContinuationTerm / Contract conflation**
Operational service period and legal agreement become one record.

**Subscription / Contract conflation**
Recurring service semantics are forced into Contract status.

**Historical Contract/current Contract conflation**
Renewal UI points to mutable latest Contract rather than originating agreement.

**Historical Report/live Analytics conflation**
Renewal evidence changes over time because live metrics are used.

**Performance / renewal eligibility conflation**
Strong metric automatically creates/accepts renewal.

**Prior Finance / renewal billing conflation**
Old Invoice balances are overwritten into new continuation billing.

**Prior Contract amount / renewal price conflation**
Historical commercial amount is edited to new price.

**Package change / Project mutation conflation**
Completed Project's package is retrospectively changed.

**Eligibility / action-required conflation**
Client Action queue shows non-actionable commercial opportunities.

**Renewal status / Deal stage conflation**
One enum tries to describe relationship and Sales pipeline simultaneously.

**Relationship health / Client-facing renewal status conflation**
Internal churn/risk/confidence data leaks into Portal.

**Project access / commercial authority conflation**
Any Project participant can see/accept renewal.

**Portal Admin / commercial authority conflation**
Client access administrator can accept pricing/Contracts.

**Report access / renewal access conflation**
Performance viewer receives confidential commercial terms.

**Renewal read / Proposal acceptance conflation**
Viewing offer grants authority to accept it.

**Proposal acceptance / payment authority conflation**
Commercial approver can trigger Finance automatically.

**Expired / declined conflation**
No response appears as Client rejection.

**Withdrawn / declined conflation**
Internal withdrawal is attributed to Client.

**Superseded / rejected conflation**
New offer makes previous Proposal look rejected.

**Declined / Client relationship ended conflation**
Client is deactivated after rejecting one renewal.

**Won Deal / Project creation conflation**
CRM stage change directly creates incomplete/duplicate Project.

**Duplicate conversion**
Retry creates multiple Contracts/Projects.

**Renewal cycle overwrite**
Repeated annual renewals update one `client.renewalStatus` field and destroy history.

**Client Action duplication**
Proposal, Contract and payment requirements are also duplicated as generic renewal tasks.

**057/016 duplicate pipeline**
Renewal workspace gets a separate Deal engine.

**057/018 duplicate proposal engine**
Renewal offers use custom JSON instead of ProposalVersion.

**057/019 duplicate Contract engine**
Continuation agreement gets separate legal-document logic.

**057/106 duplicate conversion workflow**
Renewal completion and won-deal handoff independently create Clients/Projects.

No new screen is required.

These are **commercial-continuation, historical-lineage, sales, Proposal, Contract, authorization and handoff requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT RENEWAL, CONTINUATION & COMMERCIAL SUCCESSION ANCHOR**

**Domain directive:**
**Completed Project ≠ Client Relationship ≠ RenewalOpportunity ≠ Deal ≠ Proposal ≠ ProposalVersion ≠ Contract renewal/extension ≠ ContractVersion ≠ ContinuationTerm.**

**Relationship directive:**
Project completion never destroys the Client relationship. Renewal is a new commercial continuation context linked to the existing Client.

**Historical directive:**
the original Project, Contract, delivery evidence, Finance history and ReportVersions remain immutable. Renewal only references them.

**Renewal directive:**
RenewalOpportunity/context identifies an eligible continuation cycle without automatically becoming a CRM Deal.

**Deal directive:**
once a real commercial opportunity exists, Design 016's canonical Deal pipeline is reused rather than creating a separate renewal pipeline.

**Proposal directive:**
all formal continuation offers use Design 018's Proposal + immutable ProposalVersion infrastructure; commercial terms are never stored only as mutable renewal fields.

**Contract directive:**
continuation uses Design 019's canonical Contract infrastructure. New Contract, amendment, extension and successor Contract remain explicit legal relationships and never mutate historical executed agreements.

**Version directive:**
creating another ContractVersion is not, by itself, sufficient semantics for a renewal. Legal and commercial lineage must explicitly explain the relationship to the prior agreement.

**Term directive:**
where recurring continuation periods exist, operational continuation/subscription terms remain conceptually distinct from the governing Contract.

**Project directive:**
a renewed engagement creates a controlled new Project/term/engagement where required. Completed Project records are never reopened merely to represent new revenue.

**Evidence directive:**
renewal messaging may consume exact finalized ReportVersions, verified delivery history and completed Project evidence without recalculating historical performance.

**Finance directive:**
prior Invoice/Payment history remains attached to the previous engagement; new continuation obligations use new canonical Finance records.

**Package directive:**
a continuation may change package/services without rewriting historical package truth.

**Action directive:**
Design 047 surfaces only genuine Client obligations from Proposal, Approval, Contract, Payment or other canonical source records. Renewal eligibility alone is not a Client task.

**Authorization directive:**
renewal visibility, Proposal acceptance, Contract approval/signing and payment authority remain independent capabilities. Project membership or Portal administration never implies commercial authority.

**Client-safe directive:**
internal Deal probability, account-health scores, churn risk, Sales notes, margins, negotiation limits and forecast data must never leak into the Client Portal.

**Conversion directive:**
successful renewal proceeds through a controlled, idempotent commercial handoff compatible with Design 106 rather than directly patching Project/Client state.

**Cycle directive:**
every renewal cycle retains its own lineage so multiple successive renewals remain reconstructable rather than overwriting one Client-level status field.

**Failure directive:**
not eligible, no offer, offer available, expired, declined, superseded, Proposal unavailable, Contract unavailable and system unavailable remain distinct conditions.

**Responsive directive:**
desktop presents historical value + continuation terms + next action clearly; mobile prioritizes prior engagement → renewal offer → term/price → current state → canonical action without exposing the internal CRM.

**Overlap directive:**
Designs **016, 018–020, 023, 033, 043, 047, 053–057, 096–106 and 120–123** must ultimately preserve one commercial/Project/Contract history while sharing controlled renewal lineage and handoff infrastructure.

**Consolidation directive:**
**STANDARDIZE ONE COMMERCIAL SUCCESSION MODEL — EXISTING CLIENT RELATIONSHIP + IMMUTABLE HISTORICAL ENGAGEMENT + RENEWAL CONTEXT/CYCLE + CANONICAL DEAL + VERSIONED PROPOSAL + CONTRACT/EXTENSION LINEAGE + CONTROLLED WON-DEAL HANDOFF + NEW ENGAGEMENT — AND DO NOT REOPEN COMPLETED PROJECTS, EDIT EXECUTED CONTRACTS, OR BUILD A SECOND RENEWAL-SPECIFIC CRM/PROPOSAL/CONTRACT ENGINE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **57 / 153** |
| **PASS**                                   |                         **57** |
| **STANDARDIZE decisions**                  |                         **55** |
| **Potential implementation-overlap flags** |                         **48** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**57 / 153 = 37.3% audited.**

### Canonical Renewal / Continuation architecture after Design 057

```text
                 CLIENT RELATIONSHIP
                         │
                         ↓
              HISTORICAL ENGAGEMENT
              ┌──────────┼──────────┐
              ↓          ↓          ↓
           Project    Contract    Report /
                                 Delivery
              └──────────┬──────────┘
                         ↓
                 RENEWAL CONTEXT
                         │
                         ↓
                Renewal Opportunity
                         │
                real commercial intent
                         ↓
                       Deal
                         │
                         ↓
                 ProposalVersion
                         │
                         ↓
               Client commercial action
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
       Contract / Extension      No continuation
              │
              ↓
        Execution / Signing
              │
              ↓
      Controlled Commercial Handoff
              │
              ↓
        NEW Project / Term /
           Engagement
```

The critical historical rule is:

```text
OLD PROJECT        → remains completed
OLD CONTRACT       → remains executed/history
OLD REPORT         → remains exact frozen version
OLD INVOICES       → remain historical Finance truth

                    ↓ linked by lineage

NEW RENEWAL
NEW DEAL
NEW PROPOSAL
NEW LEGAL CONTINUATION
NEW PROJECT / TERM
```

# Next Sequential Audit Target

## **Design 058 — Client Support / Support Requests**

Its frozen identity is already locked.

The next audit must preserve the support boundary:

> **SupportRequest ≠ Conversation ≠ Message ≠ ClientRequest ≠ Internal Task ≠ Incident ≠ Project Blocker ≠ Notification.**

It will need to reuse the messaging foundation from **Design 045**, Task/work infrastructure from **Design 034** where internal work is generated, and preserve a distinct canonical SupportRequest lifecycle without turning support tickets into generic Messages or Project Tasks.

After Design 058 we continue strictly:

**059 Client Profile & Account Settings → 060 Client Organization / Company Settings → 061 Client Notifications / Notification Preferences → 062 Client Portal Users / Team Access → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
