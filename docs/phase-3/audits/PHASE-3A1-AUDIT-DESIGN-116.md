# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 116 — Project Client Requests / Dependency Tracker

Design 116 should become the **canonical Team Workspace Project-level client-dependency, ClientRequest status, responsibility, due-date, response/evidence, and delivery-impact tracking surface** for everything the internal team is waiting on from the client during a Project.

It must reuse the canonical `ClientRequest` domain established by Design 047, the same Project identity from Design 023, Client Portal actions from Designs 041–048, Project Tasks/Milestones from Design 111, Risks/Blockers from Design 113, Approval gates from Design 115, and file/deliverable state from Design 114.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Project ≠ ClientRequest ≠ ClientRequestRequirement/Response ≠ ClientDependencyProjection ≠ ClientActionView ≠ Internal Task ≠ FollowUp ≠ QuestionnaireAssignment ≠ ApprovalRequest ≠ Asset/Deliverable ≠ ProjectBlocker ≠ Milestone ≠ Notification.**

The central implementation rule is:

> **Design 116 tracks what the Project currently requires from the client; it never creates a second dependency/work system. “We need something from the client” is a canonical `ClientRequest`. Internal effort to chase, review, or process that dependency remains a Task/FollowUp. Questionnaire, Approval, file upload, meeting confirmation, and other source workflows remain canonical in their own domains. The ClientRequest may reference those source workflows and may become satisfied when their exact conditions are met, but it must not duplicate their state. Client delay may contribute to a ProjectBlocker, milestone gate, workflow gate, timeline impact, or Project health—but those remain independently governed.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                               |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **116**                                                                                                                                                                      |
| **Canonical name**                 | **Project Client Requests / Dependency Tracker**                                                                                                                             |
| **Product area**                   | Team Workspace / Projects / Client Dependencies                                                                                                                              |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                             |
| **Screen class**                   | Project Detail Variant / External Dependency & Client Action Workspace                                                                                                       |
| **Classification**                 | **Canonical Project Client-Dependency, Request Tracking & External-Actionability Anchor**                                                                                    |
| **Primary purpose**                | Track everything legitimately owed by the Client to progress one Project, including current status, due conditions, evidence, responsibility, and downstream delivery impact |
| **Primary parent**                 | **Project** — Design 023                                                                                                                                                     |
| **Primary external-action entity** | **ClientRequest** — Design 047                                                                                                                                               |
| **Portal action projection**       | **ClientActionView** — Designs 041/047                                                                                                                                       |
| **Request requirement/evidence**   | typed source requirement/reference                                                                                                                                           |
| **Internal work dependency**       | canonical Task — Designs 034 / 111                                                                                                                                           |
| **Follow-up dependency**           | Designs 015 / 095                                                                                                                                                            |
| **Questionnaire dependency**       | Designs 048 / 067                                                                                                                                                            |
| **Approval dependency**            | Designs 029 / 052 / 115                                                                                                                                                      |
| **Asset/file dependency**          | Designs 030 / 051 / 114                                                                                                                                                      |
| **Meeting dependency**             | Designs 046 / 094 where applicable                                                                                                                                           |
| **Risk/blocker dependency**        | Design 113                                                                                                                                                                   |
| **Timeline dependency**            | Design 118                                                                                                                                                                   |
| **Activity dependency**            | Design 119                                                                                                                                                                   |
| **Project closeout dependency**    | Design 120                                                                                                                                                                   |
| **Client Portal dependency**       | Designs 041–074                                                                                                                                                              |
| **Primary query service**          | `ProjectClientDependencyQueryService`                                                                                                                                        |
| **Client request service**         | canonical `ClientRequestService`                                                                                                                                             |
| **Requirement resolver**           | `ClientRequestRequirementResolver`                                                                                                                                           |
| **Actionability resolver**         | `ClientActionabilityResolver`                                                                                                                                                |
| **Delivery-impact resolver**       | `ProjectClientDependencyImpactResolver`                                                                                                                                      |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                              |
| **Auth**                           | Required                                                                                                                                                                     |
| **Authorization**                  | Active OrganizationMembership + Project/ClientRequest permissions                                                                                                            |
| **Implementation priority**        | **Critical External Dependency / Client Accountability / Project Flow Integrity**                                                                                            |
| **Reuse level**                    | **Extremely High across Portal, Project, Workflow, Risks, Approvals, Questionnaires and closeout**                                                                           |

Design 116 should answer:

> **“What exactly are we waiting on from the Client for this Project, who on the Client side is expected to act, what canonical source workflow fulfills each request, what is due or overdue, what is currently actionable, which dependencies are blocking delivery, and what has genuinely been satisfied?”**

Canonical structure:

```text
Project PR-100
      │
      └── ClientRequest[]
              │
              ├── Request purpose
              ├── responsible Client participant
              ├── dueAt / reminder policy
              ├── requirement/source reference
              │        │
              │        ├── QuestionnaireAssignment
              │        ├── ApprovalRequest
              │        ├── Asset/File upload
              │        ├── Meeting response
              │        └── other typed source
              │
              ├── current requirement evaluation
              └── project delivery impact
                       │
               ┌───────┼────────┐
               ↓       ↓        ↓
           Milestone  Gate   Risk/Blocker
```

---

# 2. Reuse

## Design 047 remains the canonical ClientRequest anchor

This is Design 116's strongest reuse requirement.

Design 047 already established:

> **Client asks us → SupportRequest**
> **We ask Client → ClientRequest**
> **Team work → Task**

Design 116 must use the same `ClientRequest.id`.

Correct:

```text
ClientRequest CRQ-100
├── Design 047 Client Tasks / Requests
├── Design 041 Client Dashboard action projection
├── Design 116 Project Dependency Tracker
└── Project/Portal timeline projections
```

Do not create:

```text
ProjectClientRequest
ProjectDependencyRequest
ClientDependencyItem
ClientChecklistItem
```

as separate runtime truths.

---

## ClientRequest ≠ Task

Permanent.

Example:

> “Please upload your final executive photos”
> → **ClientRequest**

Internal work:

> “Verify the uploaded photos meet specifications”
> → **Task**

The two may be linked.

They must remain different entities.

---

## ClientRequest ≠ FollowUp

Critical.

A ClientRequest represents the obligation/action expected from the client.

A FollowUp represents the internal relationship/sales/service action:

> call the client tomorrow about the overdue photo request.

Correct:

```text
ClientRequest CRQ-10 = OVERDUE
        ↓
FollowUp F-22 = call client Friday
```

Completing F-22 does not complete CRQ-10.

---

## ClientRequest ≠ Notification

Notification can tell the client:

> Your photo request is due tomorrow.

Reading/dismissing that Notification does not satisfy the ClientRequest.

---

## ClientRequest ≠ ClientActionView

`ClientActionView` from Design 047 remains an aggregate projection over different client-facing obligations.

ClientRequest is one canonical source type.

Do not persist:

```text
ClientActionView
```

as another mutable dependency entity.

---

## QuestionnaireAssignment remains canonical

If the client dependency is:

> Complete onboarding questionnaire.

Correct:

```text
ClientRequest CRQ-20
      ↓ requirement/source
QuestionnaireAssignment QA-5
```

Questionnaire state remains canonical Designs 048/067.

---

## Questionnaire submitted ≠ ClientRequest satisfied universally

Policy may require:

* submitted,
* accepted,
* reviewed,
* corrected.

Use a typed Requirement resolver.

Do not blindly map:

```text
submitted = complete
```

for every request.

---

## ApprovalRequest remains canonical

If the client dependency is:

> Approve Proof v7.

Correct:

```text
ClientRequest CRQ-30
      ↓
ApprovalRequest A-40
subject = ProofVersion v7
```

Approval remains Design 029/052/115 truth.

---

## Approval approved ≠ ClientRequest completion through copied state

The ClientRequest Requirement resolver should read the canonical approval state.

It should not receive a second:

```text
clientRequest.approved = true
```

boolean.

---

## File/Asset upload remains canonical

If the request asks:

> Upload logo files.

The resulting files remain canonical:

```text
Asset
↓
FileVersion
```

Design 116 tracks whether the exact request requirement has been satisfied.

It does not own uploaded binaries.

---

## Asset exists ≠ Request satisfied universally

The requirement may need:

* specified file type,
* minimum count,
* correct version,
* accepted/reviewed asset.

Exact completion must be policy-driven.

---

## Meeting remains canonical

If the client must:

> Confirm interview meeting.

Meeting/RSVP remains Designs 046/094 truth.

ClientRequest can reference that requirement.

---

## Design 113 Risk/Blocker remains separate

An overdue ClientRequest may become Project-impacting.

Correct:

```text
ClientRequest CRQ-10
      ↓ overdue
ProjectBlocker B-4
source = CRQ-10
```

But:

```text
ClientRequest
≠
ProjectBlocker
```

No duplicate client dependency status in Risk service.

---

## Design 115 Approval Gate remains separate

A Project gate may depend on:

```text
ClientRequest satisfied
```

or directly on canonical Approval.

Gate evaluation consumes ClientRequest state.

Completing a ClientRequest must not directly transition the Project.

---

## Design 111 Milestone remains separate

A Milestone may require:

> all Client materials received.

That can be satisfied through ClientRequests.

But:

```text
ClientRequest complete
≠
Milestone achieved universally
```

Other milestone requirements may remain.

---

# 3. Entities

## ClientRequest

`ClientRequest` remains the stable external obligation identity.

Conceptually:

```text
ClientRequest
├── id
├── organizationId
├── clientRelationshipId
├── projectId / typed project context
├── requestType
├── title / description
├── lifecycle
├── responsible Client participant/context
├── dueAt?
├── requestedAt
├── fulfilledAt?
├── requirement definition/reference
├── createdBy
└── revision
```

Exact schema belongs to Phase 3D.

---

## ClientRequest ≠ ClientContact

Permanent.

The Request references the person/role expected to act.

It does not duplicate client identity.

---

## Responsible Client Contact ≠ Portal User

Critical.

Business responsibility:

> CEO must provide headshot

and Portal authority:

> which authenticated user can perform the action

remain independently resolved.

A Client Contact without Portal access may still be the business owner of the request.

---

## ClientRequest target/audience

Where the request is assigned to:

* one Client Contact,
* multiple participants,
* organization-wide client role,

the runtime model must preserve the exact intended responsibility.

Do not infer target from email matching.

---

## ClientRequest lifecycle

Conceptually:

```text
DRAFT
REQUESTED
IN_PROGRESS
FULFILLED
CANCELLED
SUPERSEDED
```

Exact enum Phase 3D.

Due condition remains separate.

---

## Requested ≠ Viewed

Permanent.

---

## Viewed ≠ In Progress necessarily

Permanent.

---

## In Progress ≠ Fulfilled

Permanent.

---

## Cancelled ≠ Fulfilled

Permanent.

---

## Superseded ≠ Cancelled

Useful distinction when a revised request replaces an earlier requirement.

---

## ClientRequestRequirement

A typed Requirement model is useful where completion depends on another canonical entity.

Conceptually:

```text
ClientRequestRequirement
├── clientRequestId
├── requirementType
├── sourceType
├── exactSourceId
├── exactSourceVersionId?
├── requiredState/policy
└── policyVersion
```

This may be embedded configuration rather than a separate table depending on Phase 3D.

---

## Requirement ≠ source entity

Permanent.

Example:

```text
Requirement:
Proof v7 must be approved by client

Source:
ApprovalRequest A-100
```

---

## Requirement must be exact-version aware where necessary

Critical.

If request says:

> approve Proof v7

then Proof v8 cannot silently satisfy it.

Likewise if the request is superseded to v8:

v7's fulfilled history remains.

---

## RequirementEvaluation

Derived/current state:

```text
ClientRequestRequirementEvaluation
├── requestId
├── result
├── source revision
├── evaluatedAt
├── freshness
└── reason
```

Conceptually:

```text
UNSATISFIED
PARTIAL
SATISFIED
UNKNOWN
UNAVAILABLE
```

---

## Requirement unavailable ≠ unsatisfied

Critical.

If Approval/File/Questionnaire service is unavailable:

> requirement state unavailable.

Do not blame the client with:

> still pending.

---

## Fulfillment

ClientRequest fulfillment should preserve evidence:

```text
fulfilledAt
fulfilledBy/source
source reference
source version/evidence
```

where appropriate.

---

## Fulfilled ≠ internally verified universally

Some ClientRequests may need:

1. client submission;
2. internal verification.

Architecture should support distinct semantics if required.

Do not collapse:

> client supplied something

into:

> Project requirement accepted.

---

## Response / submission

If ClientRequest itself allows a direct text response rather than source workflow:

that response can remain request-domain evidence.

If response is a Questionnaire, file upload, Approval, etc.:

reuse those domains.

---

## ClientRequestResponse ≠ Message

If the request has a structured response field:

do not automatically turn it into a Message.

Conversational discussion remains Conversation/Message.

---

## Comments/messages around request

Use canonical Conversation/Message or contextual comments according to platform architecture.

Do not hide communication inside status fields.

---

## Due date

`dueAt` is request obligation timing.

It remains separate from:

* Notification reminder,
* FollowUp dueAt,
* Project milestone target,
* Project stage deadline.

---

## Due condition

Derived:

```text
currentTime > dueAt
AND request still unresolved
```

under central timezone rules.

---

## Overdue ≠ lifecycle

Critical.

Valid:

```text
lifecycle = REQUESTED
due condition = OVERDUE
```

---

## Reminder schedule

If reminders exist:

```text
ReminderPolicy / DeliveryAttempt
```

remains Notification infrastructure.

Reminder sent ≠ request viewed/fulfilled.

---

## Client dependency projection

`ProjectClientDependencyEntry` can be a read model:

```text
ProjectClientDependencyEntry
├── ClientRequest
├── Client identity summary
├── source requirement
├── due condition
├── current actionability
├── delivery impact
└── blocker/gate/milestone references
```

It must remain rebuildable.

---

## Dependency status ≠ ClientRequest lifecycle

Example:

```text
ClientRequest = FULFILLED

Project dependency evaluation = NEEDS_INTERNAL_REVIEW
```

could be valid if business policy distinguishes receipt from accepted completion.

Do not overload request lifecycle.

---

## Client actionability

A request may be:

```text
REQUESTED
```

but not currently actionable because:

* prerequisite hasn't opened,
* Portal identity not active,
* newer request superseded it,
* source workflow unavailable.

Use centralized actionability resolution.

---

## ClientActionability ≠ permission

A request can be logically actionable but the current client user may not be authorized to perform it.

Portal must check both.

---

## Project delivery impact

Derived projection may indicate:

* informational,
* waiting,
* blocking,
* critical dependency,

under policy.

This is not Request lifecycle.

---

## Delivery impact ≠ ProjectBlocker

Critical.

A blocking-level ClientRequest may justify a ProjectBlocker.

It does not automatically become the same record.

---

## Request lineage

If a ClientRequest is replaced:

```text
CRQ-10 → superseded by CRQ-11
```

preserve lineage.

Do not edit CRQ-10 into a different request if the underlying requested subject/version/purpose changed materially.

---

# 4. Permissions

Design 116 should conceptually distinguish:

```text
clientRequest.read
clientRequest.create
clientRequest.editDraft
clientRequest.send
clientRequest.cancel
clientRequest.supersede
clientRequest.reassign
clientRequest.markVerified

clientDependency.read
clientDependency.evaluate
```

Exact permission names belong to Phase 3D.

---

## Project read ≠ ClientRequest create

Permanent.

---

## ClientRequest create ≠ send

Potentially distinct where review/control matters.

---

## Send ≠ fulfill

Absolute.

Internal users cannot mark a client-owned request fulfilled merely because it was sent.

---

## Request owner ≠ Client actor

Permanent.

Internal owner can manage the request.

Client participant fulfills it.

---

## Client Contact ≠ authorized Portal actor

Permanent.

Portal authorization separately resolves membership/permission.

---

## Request reassignment cannot create Portal membership

Absolute.

Changing business responsibility to another Client Contact does not automatically invite/activate them.

---

## Team user cannot impersonate client fulfillment

Critical.

If an internal administrative fulfillment/verification feature exists, it must be explicit and separately audited.

---

## Fulfillment from source domain reauthorizes there

Examples:

* approval → Approval permissions;
* questionnaire → Questionnaire permissions;
* upload → Asset permissions;
* meeting response → Meeting participation.

Design 116 cannot bypass them.

---

## Project owner ≠ all ClientRequest authority

Permanent.

---

## Request cancellation may require stronger permission

Especially after client has already submitted evidence.

Cancellation should preserve evidence/history.

---

## Direct ClientRequest ID reauthorizes

Permanent.

---

## Direct source IDs reauthorize

Permanent.

---

## Portal deep links must reauthorize

Knowing:

```text
/client/request/CRQ-100
```

or equivalent future route grants nothing.

---

## Cross-tenant request prohibited

Absolute.

ClientRelationship, Project, request participants, source workflow and attachments must remain in authorized tenant context.

---

## Cross-Project request reuse requires explicit modeling

One Client request might theoretically satisfy more than one Project.

Do not assume.

Default safe architecture:

* each Project requirement uses its own ClientRequest;
* shared source artifact may be referenced by multiple Requests.

Do not attach one request arbitrarily across Projects without explicit policy.

---

# 5. States

Design 116 must keep **ClientRequest lifecycle, due condition, requirement fulfillment, client actionability, source state, reminder state, delivery impact, and Project blocker/gate state** separate.

### ClientRequest lifecycle

Conceptually:

```text
Draft
Requested
In Progress
Fulfilled
Cancelled
Superseded
```

### Due condition

```text
No Due Date
Not Due
Due Soon
Due Today
Overdue
```

### Requirement evaluation

```text
Not Evaluated
Unsatisfied
Partially Satisfied
Satisfied
Unknown
Unavailable
```

### Client actionability

```text
Not Yet Actionable
Actionable
Completed
Superseded
Blocked
Unavailable
```

### Delivery impact

Conceptually:

```text
No Current Impact
Waiting
Blocking
Critical
Unknown
```

Exact policy Phase 3D.

These must never collapse into one generic `dependency.status`.

---

## Requested ≠ actionable universally

Permanent.

---

## Actionable ≠ authorized for current client user

Permanent.

---

## Viewed ≠ in progress universally

Permanent.

---

## Overdue ≠ blocked

Critical.

A request can be overdue but the Project may still continue.

---

## Blocking ≠ overdue

Permanent.

A newly requested mandatory item may block immediately.

---

## Overdue ≠ failed

Permanent.

---

## Fulfilled ≠ milestone achieved

Permanent.

---

## Fulfilled ≠ Project gate passed universally

Permanent.

---

## Fulfilled ≠ ProjectBlocker resolved universally

Critical.

Other blockers/evidence may remain.

---

## Fulfilled ≠ internally verified universally

Permanent where verification exists.

---

## Questionnaire submitted ≠ Request fulfilled automatically universally

Policy-dependent.

---

## Approval pending ≠ ClientRequest failed

Permanent.

---

## Approval rejected ≠ ClientRequest cancelled

Permanent.

It may mean:

* request remains unresolved,
* revision/new request needed.

---

## File uploaded ≠ File accepted

Permanent.

---

## Reminder sent ≠ Request viewed

Permanent.

---

## Reminder sent ≠ Request in progress

Permanent.

---

## Notification read ≠ ClientRequest complete

Absolute.

---

## Source unavailable ≠ Client failed to act

Critical.

---

## Source unavailable ≠ Request fulfilled

Absolute.

---

## Client Portal unavailable ≠ request cancelled

Permanent.

---

## Request superseded ≠ request fulfilled

Permanent.

Historical request remains as superseded evidence.

---

## State Coverage

Design 116 inherits Design 150 plus:

```text
Client Dependency Workspace Loading
Client Dependency Workspace Available
Client Dependency Workspace Empty
Client Dependency Workspace Restricted
Client Dependency Workspace Partial

Client Request Draft
Client Request Requested
Client Request In Progress
Client Request Fulfilled
Client Request Cancelled
Client Request Superseded

Request Not Due
Request Due Soon
Request Due Today
Request Overdue
Request Due State Unknown

Requirement Not Evaluated
Requirement Unsatisfied
Requirement Partial
Requirement Satisfied
Requirement Unknown
Requirement Unavailable

Client Action Not Yet Available
Client Action Available
Client Action Blocked
Client Action Completed
Client Action Superseded
Client Action Unavailable

Questionnaire Pending
Questionnaire Submitted
Questionnaire Requirement Unavailable

Approval Pending
Approval Approved
Approval Rejected
Approval Requirement Unavailable

Asset Upload Missing
Asset Upload Received
Asset Validation Pending
Asset Requirement Satisfied
Asset Requirement Unavailable

Meeting Response Pending
Meeting Confirmed
Meeting Requirement Unavailable

Project Impact None
Project Impact Waiting
Project Impact Blocking
Project Impact Critical
Project Impact Unknown

Project Blocker Linked
No Project Blocker
Project Blocker State Unavailable

Reminder Scheduled
Reminder Sent
Reminder Failed
Reminder State Unavailable

Client Request Updated Elsewhere
Source Requirement Updated Elsewhere
Client Participant Updated Elsewhere
Request Conflict
Partial Dependency Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **what the Client owes, by when, through what canonical action, and what Project impact exists**.

Conceptually:

```text
Project Client Dependencies
↓
Client Request
   ├── request/action
   ├── responsible client contact
   ├── due state
   ├── source workflow
   ├── requirement state
   ├── Project impact
   └── frozen-design actions
```

Only frozen Design 116 elements should render.

---

## Client-owned work must be visually distinct from internal work

Correct:

> **Waiting on Client:** Upload final headshots

Separate internal item:

> **Team Task:** Validate headshot resolution

Do not make both identical Task rows.

---

## Due and Project impact must remain separate

Correct:

> Overdue 3 days · Not currently blocking

or:

> Due tomorrow · Blocking design start

rather than one red/green status.

---

## Source workflow should remain explicit

Examples:

> Questionnaire
> Approval
> File upload
> Meeting confirmation

instead of reducing everything to generic:

> Client task.

---

## Responsible Client Contact and Portal status must remain separate

Where relevant:

> Business owner: Sarah Lee
> Portal action available to authorized client users

rather than implying the contact is automatically a Portal user.

---

## Blocker linkage should be visible without duplicating state

Example:

> Project Blocker B-12 references this overdue request.

Do not show:

> Client Request status = Blocked

if that is actually ProjectBlocker lifecycle.

---

## Tablet

Following Design 152:

* request title/responsible party remain first,
* due + requirement state stack,
* Project impact becomes compact metadata,
* source workflow detail can collapse,
* actions remain touch-safe.

---

## Mobile

Priority:

```text
What we need from Client
↓
Responsible person/context
↓
Due state
↓
How they complete it
↓
Current requirement state
↓
Project impact
↓
Allowed internal action
```

Avoid dense dependency matrices.

---

## Mobile action wording

Prefer exact intent:

> Send reminder
> Open Questionnaire
> View Approval
> Review uploaded files

instead of vague:

> Resolve dependency.

The source domain owns resolution.

---

## Accessibility

A dependency item could communicate:

> Client request CRQ-20 asks Sarah Lee to upload final executive photos. The request was due August 20 and is overdue by two days. No valid photo upload has yet satisfied the requirement. The request is currently blocking the Design milestone.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical dependency architecture

```text
Design 116
    ↓
Authenticated Workspace Context
    ↓
ProjectClientDependencyQueryService
    │
    ├── ProjectAdapter
    ├── ClientRequestAdapter
    ├── ClientParticipantAdapter
    ├── QuestionnaireAdapter
    ├── ApprovalAdapter
    ├── AssetAdapter
    ├── MeetingAdapter
    ├── Notification/ReminderAdapter
    ├── ProjectBlockerAdapter
    ├── ProjectGateAdapter
    └── DependencyImpactResolver
    ↓
ProjectClientDependencyView
```

Mutations use canonical ClientRequest/source-domain services.

---

## ClientRequest creation

Conceptually:

```text
createClientRequest(
    projectId,
    clientRelationshipId,
    requestType,
    responsibleClientContext,
    requirementDefinition,
    dueAt?,
    expectedProjectRevision,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. validate Project;
3. validate ClientRelationship belongs to Project;
4. validate responsible client identity/context;
5. validate requirement/source configuration;
6. validate due/timezone;
7. create canonical ClientRequest;
8. optionally provision required source workflow through its canonical service;
9. emit Audit/outbox.

---

## Request creation idempotency

Critical.

Retries must not create repeated client requests such as:

> Upload headshots
> Upload headshots
> Upload headshots

for the same generation intent.

---

## Template/onboarding generated ClientRequests

If a Project/Onboarding template automatically requires client actions:

use stable source lineage:

```text
projectId
+ sourceRequirementDefinitionId
+ requestPurpose
```

or equivalent.

Initialization retry must reuse the existing ClientRequest.

---

## ClientRequest source workflow provisioning

Examples:

### Questionnaire-backed request

```text
ClientRequest
   ↓
QuestionnaireService.createAssignment(...)
```

### Approval-backed request

```text
ClientRequest
   ↓
ApprovalService.createApprovalRequest(...)
```

### Upload-backed request

ClientRequest defines accepted Asset/upload requirement; binary handling remains AssetService.

---

## Provisioning must be idempotent

If source workflow creation succeeded but response was lost:

reconcile before creating another Questionnaire/Approval/etc.

---

## ClientRequest lifecycle service

Use targeted commands:

```text
sendClientRequest(...)
cancelClientRequest(...)
supersedeClientRequest(...)
reassignClientRequest(...)
```

not one unrestricted generic PATCH.

---

## Send request

Conceptually:

```text
sendClientRequest(
    requestId,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. validate request readiness;
3. resolve authorized recipient/Portal context;
4. mark/request delivery through Notification/messaging infrastructure;
5. preserve request lifecycle separately from delivery attempts.

---

## Request sent ≠ Notification delivered

Critical.

Delivery attempts belong to notification/message infrastructure.

---

## Notification failure ≠ ClientRequest cancelled

Permanent.

---

## Reminder service

If reminders are present:

```text
ClientRequestReminderPolicy
```

or source notification policy should control reminder timing.

Do not store reminder state as ClientRequest fulfillment.

---

## Duplicate reminders

Retries/provider callbacks must not send accidental repeated reminders beyond configured policy.

---

## Requirement resolver

Central:

```text
ClientRequestRequirementResolver.evaluate(requestId)
```

dispatches typed source adapters.

Examples:

```text
QuestionnaireRequirementAdapter
ApprovalRequirementAdapter
AssetRequirementAdapter
MeetingRequirementAdapter
DirectResponseRequirementAdapter
```

---

## Requirement adapters reuse source truth

Questionnaire adapter asks canonical Questionnaire domain.

Approval adapter asks Design 029 engine.

Asset adapter evaluates canonical Asset/FileVersion evidence.

Meeting adapter evaluates canonical Meeting/RSVP evidence.

Do not reproduce source business rules.

---

## Requirement version pinning

Where request is tied to exact version:

```text
ProofVersion v7
QuestionnaireVersion q3
```

that exact version remains pinned.

Never resolve latest at evaluation time.

---

## Requirement evaluation freshness

Include:

```text
sourceRevision
evaluatedAt
freshness
```

or equivalent so cached states can be invalidated.

---

## Source service unavailable

Return:

```text
UNKNOWN / UNAVAILABLE
```

and fail safe.

Do not mark client overdue/failed based on missing system data beyond the known due condition.

---

## Automatic fulfillment

A source-backed Request may transition to Fulfilled when:

```text
RequirementEvaluation = SATISFIED
```

if the request policy allows automatic fulfillment.

This should be explicit and idempotent.

---

## Automatic fulfillment ≠ source mutation

Permanent.

The flow is:

```text
Source changes
↓
Requirement re-evaluates
↓
ClientRequest may become Fulfilled
```

not:

```text
ClientRequest fulfilled
↓
patch source to completed
```

---

## Internal verification

If required:

```text
source received
→ requirement RECEIVED
→ verification Task/command
→ request FULFILLED
```

Do not infer acceptance from mere submission.

Exact implementation depends on final policy.

---

## Supersession

When the requested subject materially changes:

```text
CRQ-20 for Proof v7
↓ superseded by
CRQ-21 for Proof v8
```

preserve both.

Never retarget CRQ-20 and rewrite history.

---

## Reassignment

Changing responsible Client Contact:

* preserves prior responsibility history where required,
* validates new contact/client relation,
* does not automatically grant Portal membership.

---

## Client identity changes

If contact merges or leaves:

resolve through canonical Contact/ClientContact identity and preserve historical actor/request evidence.

---

## Portal projection

Design 047/041 should use centralized:

```text
ClientActionabilityResolver
```

which considers:

* request lifecycle,
* source requirement,
* prerequisite,
* participant authorization,
* supersession,
* service availability.

---

## Portal actionability must be current

Deep links re-evaluate.

A request may have been fulfilled/superseded since the dashboard loaded.

---

## Project impact resolver

Conceptually:

```text
ProjectClientDependencyImpactResolver.resolve(requestId)
```

may consider:

* due state,
* linked stage/milestone/gate,
* source requirement,
* Project schedule dependencies,
* blocker linkage.

---

## Impact does not mutate Project directly

Critical.

It can feed:

* Project Health,
* Design 113 Risk/Blocker,
* Design 118 Timeline,
* workflow Gate Evaluation.

---

## ProjectBlocker integration

If client delay materially blocks delivery:

an explicit policy/user action may:

```text
create/link ProjectBlocker
source = ClientRequest
```

Use Design 113 service.

Do not set:

```text
clientRequest.status = BLOCKER
```

as the same state.

---

## Blocker resolution after request fulfillment

When request fulfills:

Blocker service may re-evaluate whether its impediment is resolved.

Do not directly set Blocker resolved from ClientRequest transaction unless an explicit typed policy invokes the canonical resolver.

---

## Workflow Gate integration

Design 115 runtime gate may include:

```text
ClientRequestRequirement CRQ-20 = SATISFIED
```

Gate re-evaluates.

It still uses Project transition service for actual movement.

---

## Milestone integration

Design 111 Milestone Requirement can consume request state.

Milestone achievement remains its own command/evaluation.

---

## Project closeout

Design 120 may require:

```text
all mandatory ClientRequests fulfilled/cancelled appropriately
```

under closeout policy.

This does not mean Design 116 completes the Project.

---

## Task integration

Internal work to:

* chase client,
* validate response,
* process assets,

uses TaskService.

Do not attach internal Task completion as fake Client fulfillment.

---

## FollowUp integration

Relationship follow-up remains FollowUpService.

A reminder/call can reference ClientRequest.

Completing FollowUp leaves the Request unchanged unless source requirement is actually fulfilled.

---

## Conversation integration

Client discussion remains Conversation/Message.

A Message:

> “I'll upload tomorrow”

does not fulfill the request unless the Request definition specifically expects a text response and the source workflow records it.

---

## Calendar integration

ClientRequest due dates can project into Design 035.

Calendar changes, if supported, route through ClientRequestService.

---

## Timeline integration

Design 118 may visualize:

* request date,
* due date,
* fulfillment date,
* dependency impact.

Timeline is a projection.

---

## Activity

Design 119 can project:

```text
ClientRequestCreated
ClientRequestSent
ClientRequestFulfilled
ClientRequestOverdue
ClientRequestSuperseded
```

Activity remains observational.

---

## Audit

Material actions should capture:

* request creation,
* sending,
* reassignment,
* cancellation,
* supersession,
* internal verification/override if supported.

Routine automated reminders need not create noisy Audit entries beyond operational delivery logs.

---

## Notifications

Design 080/061 infra handles:

* initial request notification,
* reminder,
* overdue notification,
* fulfillment confirmation.

Notification preferences must not suppress mandatory operational/legal notices where policy says mandatory.

---

## My Work

Design 078 may project internal:

* Task to follow up,
* approval responsibility,
* review action.

It should not make the ClientRequest itself an internal user's Task unless there is a separate explicit responsibility projection.

---

## Idempotent source events

Repeated:

```text
QuestionnaireSubmitted
ApprovalCompleted
AssetUploaded
```

events must not:

* fulfill same request twice,
* create duplicate Blockers,
* send duplicate completion notifications.

---

## Concurrency

Important races:

### Client fulfills while Team cancels request

Use expected revisions/policy and preserve both event evidence.

### Request superseded while old Portal page submits response

Server rejects/redirects according to source workflow state; it cannot apply fulfillment to the new Request automatically.

### Reassign vs fulfillment

Historical responsible party and actual acting user remain clear.

---

## Bulk operations

If frozen Design 116 supports bulk reminders/cancellation:

each Request must be individually:

* authorized,
* current-state validated,
* source-safe.

Return partial results.

---

## Caching

Project Client Dependency caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
clientRequestRevision aggregate
source requirement revisions
client participant revision
blocker/gate/milestone revisions
```

---

## Due-state calculation should not be permanently cached

Timezone/current-time-derived overdue state must refresh appropriately.

---

## Performance

Use:

* Project-scoped ClientRequest indexes,
* batched responsible Client summaries,
* source requirements grouped by adapter type,
* aggregate due/blocking counts,
* lazy request history/messages/evidence.

Avoid one network/source query per dependency row.

---

## Partial failure contract

Example:

```text
Project                ✓
ClientRequests         ✓
Questionnaires         ✓
Approvals              ✕
Assets                 ✓
Client contacts        ✓
```

Correct:

> Client dependency CRQ-30 is visible. Its approval-backed requirement state is currently unavailable.

Incorrect:

> Client approval pending.

Another:

```text
Request core           ✓
Portal membership svc  ✕
```

Correct:

> Request exists; current client action availability cannot be verified.

Not:

> Client cannot act.

---

## Backend Requirement Matrix

| Requirement                                      | Status                        |
| ------------------------------------------------ | ----------------------------- |
| Design 047 canonical ClientRequest reuse         | **Critical**                  |
| ClientRequest/Task separation                    | **Critical**                  |
| ClientRequest/FollowUp separation                | **Critical**                  |
| ClientRequest/Notification separation            | **Critical**                  |
| ClientRequest/ClientActionView separation        | **Critical**                  |
| ClientRequest/Questionnaire separation           | **Critical**                  |
| ClientRequest/ApprovalRequest separation         | **Critical**                  |
| ClientRequest/Asset separation                   | **Critical**                  |
| ClientRequest/Meeting separation                 | **Critical**                  |
| ClientRequest/ProjectBlocker separation          | **Critical**                  |
| ClientRequest/Milestone separation               | **Critical**                  |
| Request lifecycle/due-state separation           | **Critical**                  |
| Request lifecycle/actionability separation       | **Critical**                  |
| Request lifecycle/Project-impact separation      | **Critical**                  |
| Typed requirement/source references              | **Critical**                  |
| Exact-version requirement pinning                | **Critical where applicable** |
| Requirement/source-state separation              | **Critical**                  |
| Requirement Unknown/Unsatisfied separation       | **Critical**                  |
| Source freshness/revision awareness              | **Critical**                  |
| Automatic fulfillment policy                     | **Critical**                  |
| Fulfillment/source mutation separation           | **Critical**                  |
| Submission/internal verification separation      | **Critical where applicable** |
| Responsible ClientContact/PortalUser separation  | **Critical**                  |
| Business responsibility/authorization separation | **Critical**                  |
| Request creation idempotency                     | **Critical**                  |
| Template-generated request idempotency           | **Critical if generated**     |
| Source workflow provisioning idempotency         | **Critical**                  |
| Reminder/request lifecycle separation            | **Critical**                  |
| Notification delivery/request state separation   | **Critical**                  |
| Supersession history                             | **Critical**                  |
| Reassignment history                             | **Required where relevant**   |
| Project blocker integration through Design 113   | **Critical**                  |
| Gate integration through Design 115              | **Critical**                  |
| Milestone integration through Design 111         | **Critical**                  |
| Design 118 timeline projection reuse             | **Critical architecture**     |
| Design 119 Activity reuse                        | **Critical architecture**     |
| Design 120 closeout separation                   | **Critical architecture**     |
| Portal actionability reauthorization             | **Critical**                  |
| Cross-tenant request/source links prohibited     | **Critical**                  |
| Optimistic concurrency                           | **Critical**                  |
| Bulk action per-item authorization               | **Critical if present**       |
| Audit/outbox integration                         | **Required**                  |
| Partial dependency failure handling              | **Critical**                  |

---

# 8. Consolidation

Design 116 carries a high risk of turning every client dependency into a generic checkbox or internal Task.

**ClientRequest / Project dependency conflation**
Read projection becomes source entity.

**ClientRequest / Task conflation**
Client obligation becomes team work.

**ClientRequest / FollowUp conflation**
Chasing client becomes proof client fulfilled request.

**ClientRequest / Notification conflation**
Reminder delivery becomes request completion.

**ClientRequest / Message conflation**
Conversation becomes structured requirement evidence.

**ClientRequest / ClientActionView conflation**
Portal aggregate becomes mutable source truth.

**ClientRequest / QuestionnaireAssignment conflation**
Questionnaire workflow disappears into a checkbox.

**Questionnaire submitted / Request fulfilled conflation**
Review/verification requirements are bypassed.

**ClientRequest / ApprovalRequest conflation**
Formal approval becomes generic client action.

**Approval approved / Request source-state copy conflation**
Duplicate approval booleans drift.

**Approval rejected / ClientRequest cancelled conflation**
Revision/rework path disappears.

**ClientRequest / Asset upload conflation**
Request state owns files.

**File uploaded / Request fulfilled conflation**
Wrong/unsafe asset satisfies dependency.

**File exists / accepted asset conflation**
Validation/review is bypassed.

**ClientRequest / Meeting conflation**
Scheduling/RSVP state copied.

**ClientRequest / ProjectBlocker conflation**
External obligation and current delivery impediment collapse.

**Overdue Request / Blocker conflation**
Every late request becomes a ProjectBlocker automatically.

**Blocking request / Request lifecycle conflation**
`BLOCKING` becomes another lifecycle status.

**ProjectBlocker resolved / ClientRequest fulfilled conflation**
Risk service mutates external obligation.

**ClientRequest fulfilled / Blocker resolved conflation**
Other delivery impediment may remain.

**ClientRequest / Milestone conflation**
One client action becomes Project checkpoint.

**Request complete / Milestone achieved conflation**
Other requirements ignored.

**ClientRequest / Approval Gate conflation**
External dependency becomes gate engine.

**Request complete / Project stage transition conflation**
Workflow moves without canonical transition command.

**Requested / Viewed conflation**
Notification/message activity becomes request state.

**Viewed / In Progress conflation**
Opening page means work started.

**In Progress / Fulfilled conflation**
Partial submission becomes completion.

**Cancelled / Fulfilled conflation**
No-response/cancelled obligation counts as done.

**Superseded / Fulfilled conflation**
Old request falsely satisfies current requirement.

**Superseded request / retargeted request conflation**
Historical subject/version is rewritten.

**Due state / lifecycle conflation**
Overdue becomes a lifecycle value.

**Overdue / client failure conflation**
System/source outage blamed on client.

**Due date / reminder date conflation**
Notification schedule becomes contractual/request deadline.

**Reminder sent / Request viewed conflation**
Delivery attempt becomes user action.

**Reminder read / Request fulfilled conflation**
Notification interaction changes Project state.

**Business ClientContact / Portal User conflation**
Request target automatically gets account/access.

**Contact email / Portal authorization conflation**
Email equality grants action authority.

**Request reassignment / Portal membership creation conflation**
Changing owner changes authentication.

**Internal owner / Client actor conflation**
Team member can fulfill client obligation.

**Project owner / ClientRequest administrator conflation**
Project responsibility grants unrestricted client-action mutation.

**Source workflow unavailable / Requirement unsatisfied conflation**
Infrastructure failure appears as client delay.

**Source workflow unavailable / Requirement satisfied conflation**
System fails open.

**Portal unavailable / ClientRequest cancelled conflation**
Access problem erases business requirement.

**Client response submitted / internally verified conflation**
Team acceptance step disappears.

**Direct response / Conversation Message conflation**
Structured evidence and chat mix.

**Current Proof / exact requested ProofVersion conflation**
Client approves/submits against wrong revision.

**Latest QuestionnaireVersion / assigned QuestionnaireVersion conflation**
Request changes silently.

**Latest Asset / required exact AssetVersion conflation**
Wrong content satisfies dependency.

**Request source pointer / latest source lookup conflation**
History becomes nondeterministic.

**Client dependency impact / Project health conflation**
One overdue request directly writes health.

**Project impact / Request status conflation**
“Critical” becomes request lifecycle.

**Project blocker link / duplicated source state conflation**
Blocker and request drift.

**Task “chase client” complete / Client dependency complete conflation**
Internal activity falsely satisfies external need.

**FollowUp complete / request fulfilled conflation**
Call outcome replaces client action.

**My Work entry / ClientRequest conflation**
Internal personal queue becomes another request entity.

**Calendar event / ClientRequest deadline conflation**
Schedule projection becomes independent deadline truth.

**Timeline item / ClientRequest conflation**
Gantt marker becomes source record.

**ActivityEvent / Request history conflation**
Human-readable log replaces lifecycle evidence.

**AuditEvent / fulfillment evidence conflation**
Governance log substitutes source response.

**Search index / request current state conflation**
Stale indexed state drives dependency logic.

**Notification preference / request requirement conflation**
Client disabling reminders suppresses mandatory business obligation.

**Request retry / duplicate request conflation**
One Project dependency appears multiple times.

**Source provisioning retry / duplicate Questionnaire conflation**
Client gets several assignments.

**Source provisioning retry / duplicate ApprovalRequest conflation**
Approval workflow forks.

**Source event retry / repeated fulfillment conflation**
Notifications/Blockers duplicate.

**Concurrent supersession / old-page fulfillment conflation**
Old response accidentally satisfies new request.

**Cross-Project request reuse / implicit shared state conflation**
Completing one Project's request closes another unexpectedly.

**Cross-tenant ClientRequest/source reference**
Client dependency links another organization's records.

**Generic `ProjectDependency` mega-entity**
Tasks, approvals, questionnaires, files, client requests and blockers lose ownership boundaries.

**Generic dependency `status`**
Lifecycle, due, requirement, actionability and impact collapse.

**Generic Project dependency mega-PATCH**
ClientRequest, Approval, file, Task and Blocker state mutate together.

**116/047 duplicate ClientRequest backend**
Portal and Project views disagree.

**116/111 duplicate Task/Milestone state**
Client dependency workspace becomes work manager.

**116/113 duplicate Blocker state**
Overdue requests become independent blocker truth.

**116/114 duplicate file state**
Request owns uploads.

**116/115 duplicate Approval state**
Dependency tracker stores approved flag.

**116/118 duplicate timeline state**
Request due dates drift from Project timeline.

**116/119 duplicate history state**
Activity becomes request source truth.

**116/120 duplicate closeout logic**
No open requests automatically completes Project.

No additional screen is required.

These are **ClientRequest identity, external-vs-internal responsibility, typed source requirements, exact-version fulfillment, due/actionability/impact separation, Portal authorization, blocker/gate integration, idempotency, concurrency, and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT CLIENT-DEPENDENCY, CLIENTREQUEST TRACKING & EXTERNAL-ACTIONABILITY ANCHOR**

**Domain directive:**
**Project ≠ ClientRequest ≠ ClientRequestRequirement/Response ≠ ClientDependencyProjection ≠ ClientActionView ≠ Internal Task ≠ FollowUp ≠ QuestionnaireAssignment ≠ ApprovalRequest ≠ Asset/Deliverable ≠ ProjectBlocker ≠ Milestone ≠ Notification.**

**ClientRequest directive:**
Design 047 remains the single canonical ClientRequest domain. Design 116 composes Project-specific dependency context over those exact records and never creates `ProjectClientRequest` duplicates.

**Responsibility directive:**
ClientRequest means the Client owes an action. Internal execution remains Task; relationship chasing remains FollowUp; communication remains Message/Conversation; formal approval remains ApprovalRequest.

**Portal directive:**
Designs 041/047 expose the same ClientRequest through safe `ClientActionView` projections. Portal actions never create a second client-dependency lifecycle.

**Identity directive:**
business responsibility can reference ClientContact/client role while actual Portal execution requires separately authorized PortalMembership/User context. Contact/email equality never grants action rights.

**Requirement directive:**
source-backed ClientRequests use typed exact requirement references to canonical Questionnaires, ApprovalRequests, Assets/FileVersions, Meetings or other supported workflows rather than copied completion booleans.

**Version directive:**
where the request concerns exact content/version—Proof v7, QuestionnaireVersion q3, exact document version—that version remains pinned for the lifetime of that Request.

**No-latest directive:**
Request fulfillment never dynamically evaluates “latest” when the original client obligation targeted a different immutable version.

**Evaluation directive:**
one centralized `ClientRequestRequirementResolver` evaluates current canonical source state and returns `Satisfied`, `Partial`, `Unsatisfied`, `Unknown`, or `Unavailable` with freshness/evidence.

**Unknown-state directive:**
source service failure never becomes client non-compliance, fulfillment, cancellation, or Project readiness.

**Fulfillment directive:**
source-backed Request fulfillment may be automatically derived from a satisfied requirement only under explicit request policy. ClientRequest fulfillment never mutates its source domain in reverse.

**Verification directive:**
client submission and internal acceptance/verification may remain distinct where business rules require it. Upload/submission alone cannot automatically mean accepted dependency.

**Questionnaire directive:**
Designs 048/067 remain Questionnaire authority. ClientRequest may require exact QuestionnaireAssignment state but never owns submission progress.

**Approval directive:**
Designs 029/052/115 remain Approval authority. Approval decisions remain exact-version formal evidence and cannot be replaced by `ClientRequest.approved`.

**Asset directive:**
Designs 030/051/114 remain file/Deliverable authority. ClientRequest can require an Asset/version but never owns or directly exposes the uploaded binary.

**Meeting directive:**
meeting confirmation/attendance remains canonical Meeting state. Request tracking merely evaluates the exact configured meeting requirement.

**Lifecycle directive:**
Request lifecycle, due/overdue condition, source requirement state, current client actionability, reminder delivery and Project impact remain independent dimensions.

**Overdue directive:**
overdue means the deadline has passed while the request remains unresolved. It does not itself mean Project blocked, client failed, or request lifecycle changed.

**Impact directive:**
`ProjectClientDependencyImpactResolver` determines whether the dependency is informational, waiting, blocking, critical, or unknown according to Project context. Impact never rewrites Request lifecycle.

**Blocker directive:**
Design 113 remains canonical ProjectBlocker authority. A ClientRequest may be the source of a Blocker, but Request and Blocker remain separate records and separately resolved lifecycles.

**Gate directive:**
Design 115 may consume ClientRequest satisfaction as one gate input. Fulfilled Request makes a gate condition eligible/passable but never directly performs the Project stage transition.

**Milestone directive:**
Design 111 may consume ClientRequest state as a Milestone requirement. One fulfilled request does not automatically achieve the Milestone.

**Task directive:**
internal chase/review/process work remains canonical Tasks. Completing those Tasks never fabricates client fulfillment.

**Follow-up directive:**
sales/service relationship FollowUps remain Designs 015/095 and can reference a ClientRequest without becoming its fulfillment evidence.

**Notification directive:**
initial request delivery, reminders and overdue notices use canonical Notification infrastructure. Sent/read/dismissed notification states never modify Request fulfillment.

**Reminder directive:**
request due date and reminder schedule remain different facts. Reminder retries are idempotent and governed by notification policy.

**Actionability directive:**
client-side actionability is server-resolved from current Request/source/prerequisite/supersession state and current Portal authorization. A stale dashboard/deep link is never mutation authority.

**Supersession directive:**
material changes to requested purpose/subject/version create a new/superseding Request rather than rewriting the previous obligation and its historical evidence.

**Reassignment directive:**
changing responsible Client Contact preserves business lineage and never automatically creates/deletes authentication identities or Portal memberships.

**Creation directive:**
manual, Project-template, Onboarding, and other legitimate Request creation paths converge on one canonical `ClientRequestService`.

**Idempotency directive:**
ClientRequest creation, source workflow provisioning, sending, reminders, source-event fulfillment and supersession are replay-safe. Retries cannot duplicate requests, QuestionnaireAssignments, ApprovalRequests, uploads or completion notifications.

**Concurrency directive:**
request fulfillment, cancellation, supersession and reassignment use expected revisions/transactional safeguards so stale Portal submissions or parallel Team actions cannot silently rewrite current obligations.

**Tenant directive:**
Project, ClientRelationship, ClientRequest, responsible contacts, source workflows and attachments remain strictly tenant/security scoped.

**Permission directive:**
Project read, ClientRequest create/send/cancel/reassign, source-domain mutation and internal verification remain independently server-authorized.

**No-impersonation directive:**
internal Team users cannot silently submit client-owned actions. Any administrative exception must use a distinct authorized action and preserve actor/reason.

**Closeout directive:**
Design 120 may require mandatory ClientRequests to be appropriately resolved before Project completion, but “no open ClientRequests” alone never completes the Project.

**Timeline directive:**
Design 118 projects Request dates/impact using the same canonical records. Timeline visual objects never become another dependency store.

**Activity directive:**
Design 119 may project Request creation/sending/fulfillment/supersession, but Activity never substitutes for ClientRequest lifecycle or source evidence.

**Audit directive:**
request creation, sending, reassignment, cancellation, supersession, administrative verification/override, and other material governance actions generate actor/source-aware Audit evidence.

**Search directive:**
Design 079 may index safe request metadata, but Search index state never determines fulfillment, due state, actionability, or authorization.

**Caching directive:**
dependency caches vary by Project/Request/source/participant/blocker/gate revisions and authorization. Time-derived overdue conditions and source actionability refresh appropriately; cached green states are never workflow authority.

**Partial-failure directive:**
ClientRequest core, Portal identity, Questionnaire, Approval, Asset, Meeting, Blocker and Notification systems can fail independently. `Unavailable` can never be transformed into `Pending`, `Fulfilled`, `No blocker`, `No approver`, or “Client failed to respond.”

**Performance directive:**
use Project-scoped ClientRequest indexes, batched participant summaries, typed grouped source adapters, aggregate dependency counts and lazy evidence/history instead of N+1 source requests per row.

**Future-reuse directive:**
Design **117 — Project Change Requests / Scope Change Workspace** must remain a separate Project governance domain. A ClientRequest may trigger or supply evidence for a ChangeRequest, but client feedback or requested changes must never rewrite Project scope, commercial agreement, Deliverables, timeline, or contract directly through Design 116.

**Overlap directive:**
Designs **023, 029, 034, 047–052, 095, 111–121** must preserve one continuous **Project → ClientRequest → exact source requirement → Client Portal action → canonical Questionnaire/Approval/Asset/Meeting response → Request fulfillment → Milestone/Gate/Blocker/Timeline/Closeout projection** lineage while keeping client obligation, internal work, formal approval, Project workflow and delivery impact independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT CLIENT-DEPENDENCY FOUNDATION — CANONICAL DESIGN-047 CLIENTREQUEST IDENTITY + PROJECT CONTEXT + DISTINCT RESPONSIBLE CLIENTCONTACT/PORTAL AUTHORITY + TYPED EXACT-VERSION SOURCE REQUIREMENTS + CENTRAL REQUIREMENT/ACTIONABILITY/PROJECT-IMPACT RESOLVERS + SEPARATE DUE/REMINDER/LIFECYCLE STATE + CANONICAL QUESTIONNAIRE/APPROVAL/ASSET/MEETING REUSE + EXPLICIT BLOCKER/GATE/MILESTONE INTEGRATION + IDEMPOTENT REQUEST/SOURCE-PROVISIONING/SUPERSESSION + NON-DESTRUCTIVE HISTORY — AND NEVER ALLOW INTERNAL TASKS, FOLLOWUPS, REMINDERS, PORTAL EMAIL MATCHING, SOURCE OUTAGES, “LATEST” VERSION LOOKUPS, OVERDUE BADGES OR GENERIC DEPENDENCY CHECKBOXES TO SUBSTITUTE FOR OR REWRITE CLIENTREQUEST, APPROVAL, ASSET, PROJECT WORKFLOW, PROJECT BLOCKER OR CLOSEOUT TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **116 / 153** |
| **PASS**                                   |                        **116** |
| **STANDARDIZE decisions**                  |                        **114** |
| **Potential implementation-overlap flags** |                        **107** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**116 / 153 = 75.8% audited.**

### Canonical Project client-dependency architecture after Design 116

```text
PROJECT PR-100
      │
      └── CLIENT REQUEST CRQ-20
                │
                ├── Responsible Client Contact
                ├── Due Date
                └── Requirement
                       ↓
                Proof v7 Approval
                       ↓
                ApprovalRequest A-10
                       ↓
                 Client decides
                       ↓
                Requirement satisfied
                       ↓
                ClientRequest fulfilled
```

The external/internal work boundary is now strict:

```text
ClientRequest:
“Upload final headshots”

        ≠

Task:
“Validate uploaded headshots”

        ≠

FollowUp:
“Call client tomorrow about
the overdue request.”
```

Completing the Task or FollowUp does **not** satisfy the ClientRequest.

Exact-version safety also remains intact:

```text
CRQ-20 asks client to approve:
Proof v7

Client approves v7
        ↓
CRQ-20 may become fulfilled

Later:
Proof v8 created

RESULT:

v7 fulfillment remains historical.

v8 is a new requirement/request
when policy requires it.

CRQ-20 is never silently retargeted.
```

Due state and Project impact remain independent:

```text
Request A:
Overdue 5 days
Project impact = Waiting

Request B:
Due tomorrow
Project impact = Blocking

Therefore:

Overdue
≠
Blocking.
```

And blocker integration remains source-linked:

```text
ClientRequest CRQ-30 = OVERDUE
          │
          ↓
ProjectBlocker B-12
source = CRQ-30

CRQ-30
    ≠
B-12

Fulfilling CRQ-30
may cause B-12 to be re-evaluated,
but does not rewrite B-12 directly.
```

## Next Sequential Audit Target

### **Design 117 — Project Change Requests / Scope Change Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
