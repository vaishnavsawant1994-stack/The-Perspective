# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 058 — Client Support / Support Requests

Its frozen identity is locked.

Design 058 should become the **canonical Client Portal support-request workspace** for questions, problems, service issues, and assistance requests deliberately raised by an authenticated Client.

Its core architectural boundary is:

> **SupportRequest ≠ Conversation ≠ Message ≠ ClientRequest ≠ Internal Task ≠ Incident ≠ Project Blocker ≠ Notification.**

The most important implementation rule is:

> **A SupportRequest is the case being managed. Conversation and Messages are the communication about that case. Internal Tasks are work generated to resolve it. Incidents are operational/system events that may affect many SupportRequests. None of these should become the same record.**

---

# 1. Classification

| Audit field                   | Classification                                                                                                        |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                 | **058**                                                                                                               |
| **Canonical name**            | **Client Support / Support Requests**                                                                                 |
| **Product area**              | Client Portal / Support / Service Operations                                                                          |
| **User surface**              | **Client Portal**                                                                                                     |
| **Screen class**              | Client Support Request Queue / Case Workspace                                                                         |
| **Classification**            | **Portal Workflow Anchor — Client Support & Service Case Family**                                                     |
| **Primary purpose**           | Let authorized Client users submit, track, communicate about, and understand the resolution state of support requests |
| **Primary canonical entity**  | **SupportRequest**                                                                                                    |
| **Communication dependency**  | Conversation + Message — Design 045                                                                                   |
| **Internal work dependency**  | Task — Design 034                                                                                                     |
| **Client-action distinction** | ClientRequest / ClientAction — Design 047                                                                             |
| **Project dependency**        | Designs 023 / 043 where support relates to a Project                                                                  |
| **Incident dependency**       | Future Design 147 — System Health / Status & Incident Management                                                      |
| **Notification dependency**   | Designs 061 / 064                                                                                                     |
| **Asset dependency**          | Designs 030 / 051 for attachments                                                                                     |
| **Audit dependency**          | Design 039                                                                                                            |
| **Parent shell**              | `ClientPortalShell` — Design 002                                                                                      |
| **Primary read model**        | `ClientSupportRequestsView`                                                                                           |
| **Template family**           | `ClientSupportCaseWorkspaceTemplate`                                                                                  |
| **Auth**                      | Required                                                                                                              |
| **Authorization**             | Portal membership + Client/account scope + SupportRequest entitlement                                                 |
| **Implementation priority**   | **High Client Service / Retention**                                                                                   |
| **Reuse level**               | **High across Messaging, Tasks, Notifications, Assets and Incidents**                                                 |

Design 058 should answer:

> **“What help did I request, what is its current service state, who is handling it, what communication has happened, whether anything is needed from me, and whether the problem has actually been resolved?”**

Canonical architecture:

```text
Client raises issue
       ↓
SupportRequest
       │
       ├── Conversation / Messages
       │
       ├── Attachments
       │
       ├── Internal Tasks
       │
       ├── Project/context
       │
       └── Incident linkage where applicable
                ↓
       Support workflow
                ↓
      Resolution / Closure
```

---

# 2. Reuse

## Reuse Design 045 for communication

Design 045 already established the platform Conversation + Message infrastructure.

A SupportRequest should therefore link to communication rather than reinventing:

* support comments,
* support chat messages,
* ticket replies,
* attachments,
* read state,
* delivery state.

Correct:

```text
SupportRequest SR-101
        ↓
Conversation C-440
        ↓
Messages
```

Not:

```text
SupportRequest
├── clientMessage1
├── clientMessage2
└── staffReplyText
```

inside the SupportRequest row.

---

## SupportRequest ≠ Conversation

This distinction is fundamental.

The SupportRequest owns:

* case identity,
* service state,
* classification,
* severity/priority where appropriate,
* assignment,
* resolution,
* SLA/service timing where applicable.

Conversation owns:

* dialogue,
* participants,
* Messages,
* read/delivery state.

One can reference the other.

---

## Reuse Design 034 for internal work

A support case may generate internal Tasks.

Example:

```text
SupportRequest:
“The final report download returns an error.”

        ↓

Internal Task:
“Investigate report artifact delivery failure.”

        ↓

Internal Task:
“Regenerate signed download artifact.”
```

Those Tasks stay internal.

The Client sees SupportRequest progress, not internal employee task boards.

---

## Internal Task ≠ SupportRequest

Permanent:

```text
SupportRequest
≠
Task
```

A SupportRequest may:

* generate zero Tasks,
* generate one Task,
* generate many Tasks.

Closing one Task must not automatically close the SupportRequest unless the support workflow explicitly confirms resolution.

---

## Reuse Design 030 for attachments

Support attachments should use:

```text
SupportRequest / Message
        ↓
Asset / FileVersion
```

No support-specific blob store.

---

## Reuse Notifications

A support reply, status update, or request for Client information may generate a Notification.

But:

```text
SupportRequest
≠
Notification
```

and:

```text
Notification read
≠
SupportRequest resolved
```

---

## Reuse Incident infrastructure later

Design 147 will own platform/system incidents.

A SupportRequest can be related to an Incident:

```text
Incident INC-22
      ↓
affects
SupportRequest SR-101
SupportRequest SR-103
SupportRequest SR-117
```

Do not create a new Incident per Client ticket automatically.

---

## Design 043 relationship

If the case concerns Project 123:

```text
SupportRequest
→ Project 123
```

can provide context.

But Project access and SupportRequest access remain distinct.

---

## Design 047 relationship

A SupportRequest can produce a Client action such as:

> Please send the missing screenshot.

That Client action should come from the actual support/request state.

Do not turn the entire SupportRequest into a generic ClientRequest simply because the Client needs to respond.

---

# 3. Entities

## SupportRequest should be first-class

Conceptually:

```text
SupportRequest
├── id
├── Client/account
├── createdBy Portal member
├── Project/context where relevant
├── category/type
├── safe subject/title
├── safe description
├── service state
├── priority/severity if supported
├── assignment
├── createdAt
├── updatedAt
├── resolvedAt
├── closedAt
└── resolution context
```

Exact schema belongs to Phase 3D.

---

## SupportRequest ≠ ClientRequest

Design 047 `ClientRequest` means:

> Something The Perspective requires from the Client.

SupportRequest means:

> The Client is asking The Perspective for help.

Example:

```text
ClientRequest:
“Please upload your portrait.”

SupportRequest:
“My portrait upload keeps failing.”
```

These are opposite operational directions.

---

## Client Action can exist inside Support

A SupportRequest may temporarily require something from the Client:

```text
SupportRequest:
“We need a screenshot before we can continue.”

        ↓

ClientActionView:
“Upload requested screenshot.”
```

But the SupportRequest itself remains the case.

---

## SupportRequest ≠ Project Blocker

A support issue may block Project work, but:

```text
SupportRequest
≠
ProjectBlocker
```

Design 113 later owns Project Risks / Blockers.

A support case can be linked as a cause/context for a blocker.

---

## SupportRequest ≠ Incident

A Client says:

> “The portal is unavailable.”

This does not automatically mean there is a platform Incident.

It may be:

* user configuration,
* local browser issue,
* permission problem,
* isolated bug,
* genuine widespread incident.

Only the Incident domain determines that.

---

## Incident ≠ SupportRequest

Conversely, one Incident can generate many Client support cases.

Do not duplicate the operational incident into every ticket.

---

## SupportRequest ≠ bug/engineering issue automatically

A Client report can later be classified internally as:

* user education,
* configuration,
* content correction,
* billing issue,
* bug,
* incident.

The Client-facing SupportRequest remains the case.

---

## Support category ≠ routing destination

A category such as:

```text
Billing
Project
Files
Publishing
Account Access
Technical
Other
```

may help routing.

But category is not the same as:

* team,
* assignee,
* internal Queue.

Do not hard-wire “Billing” to one employee forever.

---

## Category should be controlled

Avoid unlimited free-text category values.

Use a governed category registry/enumeration appropriate to actual frozen UX.

---

## Priority ≠ Severity

If support architecture needs both:

**Priority** may mean:

> How quickly should staff handle this?

**Severity** may mean:

> How serious is the Client impact?

Do not necessarily collapse them.

Exact need belongs to Phase 3D.

---

## Client urgency ≠ internal priority automatically

A Client selecting:

> Urgent

should not necessarily produce internal P1 severity.

Support policy should map Client input safely.

---

## Service state ≠ waiting condition

A SupportRequest can be:

```text
OPEN
```

while:

```text
waitingOn = CLIENT
```

or:

```text
waitingOn = INTERNAL
```

These are different dimensions.

---

## Open ≠ assigned

A newly created request may exist before it has an internal assignee.

---

## Assigned ≠ in progress

Assignment only establishes responsibility.

It does not prove work started.

---

## In progress ≠ resolved

Obvious but mandatory.

---

## Resolved ≠ closed

This distinction is useful where frozen workflow supports Client confirmation or a closure delay.

Conceptually:

```text
RESOLVED
↓
Client can review / reopen window
↓
CLOSED
```

Exact lifecycle belongs to Phase 3D.

---

## Closed ≠ deleted

A closed SupportRequest remains historical service evidence.

---

## Reopened ≠ new SupportRequest necessarily

If the same unresolved issue returns quickly:

the workflow may reopen the same case.

If it is genuinely new, create a new SupportRequest.

Do not blindly create duplicates.

---

## Duplicate SupportRequests

If the Client submits the same issue multiple times:

the internal service layer may detect/link duplicates.

But do not silently delete Client-visible requests.

If merged operationally, preserve lineage.

---

## Parent/duplicate relationship

Conceptually:

```text
SR-105
duplicateOf
SR-101
```

could preserve history.

Exact implementation only if support workflow requires it.

---

## Assignment

Internal support assignment should reference Design 036 canonical Team member identity.

```text
SupportRequest
→ assignedTo User/OrgMember
```

Do not store employee name/email as unstructured text.

---

## Assignee ≠ Client-safe contact necessarily

The internal handler may not need to be exposed.

If the frozen screen displays a support representative, use a limited Client-safe workforce projection.

---

## Assignment history

If the case moves:

```text
Agent A
→ Agent B
→ Specialist Team
```

the material assignment history should remain reconstructable.

Do not overwrite without trace.

---

## SLA / service target

If support terms include response/resolution targets:

```text
response target
resolution target
```

should remain separate from SupportRequest lifecycle.

No SLA feature is invented unless frozen/contractually needed.

Architecture should avoid using one `dueDate` to mean everything.

---

## First response ≠ resolution

If SLA metrics are implemented:

```text
firstResponseAt
≠
resolvedAt
```

---

## Client reply ≠ support resolution

A new Client Message should never set:

```text
status = RESOLVED
```

unless business logic explicitly does so.

---

## Staff reply ≠ support resolution

Similarly, replying:

> “We are investigating.”

does not resolve the case.

---

## Resolution needs explicit semantics

Conceptually:

```text
SupportResolution
or
resolution fields
├── resolution type
├── safe Client-facing summary
├── resolvedBy
├── resolvedAt
└── related fix/reference
```

Exact modeling Phase 3D.

---

## Internal resolution notes ≠ Client-facing resolution

Internal note:

> Root cause: expired CDN signing key.

Client-safe resolution:

> Download access has been restored.

Do not return internal diagnostics automatically.

---

## Internal note ≠ Message

Support staff may need private notes.

Those must remain internal.

Do not model them as ordinary Messages then hide them with frontend CSS.

---

## Conversation visibility

If the SupportRequest's Conversation contains both:

* Client-visible messages,
* internal staff notes,

the query must server-filter correctly or use structurally distinct message visibility/type semantics.

---

## Message read state ≠ Support state

A Client reading the support reply does not change the SupportRequest lifecycle.

---

## Message delivery ≠ response SLA

A response might be created but fail delivery through one channel.

Service-response metrics should use explicit rules, not arbitrary Message state.

---

## Support attachments

Examples:

* screenshots,
* PDFs,
* error recordings,
* reference documents.

They use Asset/FileVersion.

---

## Attachment security

Client uploads still require:

* safe filename handling,
* MIME validation,
* security scanning,
* permission checks.

Reuse Design 051 rules.

---

## Attachment visibility

One attachment shared on SR-101 does not become globally visible in every Project or Client file view.

Usage/access context remains explicit.

---

## Project Support Request

A SupportRequest can link to:

```text
Project
Publication
Invoice
Contract
Report
File
```

through typed contextual references where useful.

Avoid embedding IDs only in free-text description.

---

## Billing support ≠ Invoice mutation

Example:

> “My Invoice amount looks wrong.”

SupportRequest can reference Invoice INV-101.

Support staff should resolve through canonical Finance commands.

Do not let support edit Invoice amount directly through generic ticket state.

---

## Publishing support ≠ Publication retry automatically

A support ticket:

> “Our live link is broken.”

may relate to Publication/Placement.

Actual fixes use Publishing/Distribution infrastructure.

The SupportRequest tracks the case.

---

## Contract support ≠ Contract modification

Same principle for legal documents.

---

## Account-access support ≠ permission override

A Client reporting access problems does not justify bypassing RBAC inside Support.

Access changes must use the canonical Portal User/permission workflows later audited in Designs 059–062/075–077.

---

# 4. Permissions

Authorization should evaluate:

```text
Portal membership
+
Client/account scope
+
SupportRequest participation/visibility
+
related Project/resource scope where needed
```

---

## Same Client ≠ same SupportRequest visibility

A Client organization may choose:

* individual-private cases,
* Project-shared cases,
* organization-visible cases.

Exact policy belongs to Phase 3D.

Do not assume every Client user sees all tickets.

---

## Creator ≠ only viewer necessarily

The person who created the SupportRequest is its originator.

Visibility may include other authorized Client users.

But that must be explicit.

---

## Client Portal Admin ≠ Support superuser automatically

An organization admin may or may not be allowed to view all organization support cases.

Do not infer without policy.

---

## Support read ≠ create

Conceptually:

```text
portal.support.read
≠
portal.support.create
```

Exact names later.

---

## Read ≠ reply

A user might see a shared support case but not be allowed to respond on behalf of another executive.

If the product requires this distinction, architecture should support it.

---

## Reply ≠ close

Client permission to respond should not automatically grant authority to mark service case resolved/closed.

---

## Client resolution confirmation

If frozen UX allows:

> “Yes, this solved my issue.”

that should be a specific support command.

No generic status PATCH.

---

## Internal assignment permissions

Client users should never choose arbitrary internal employees unless explicitly designed.

Internal routing belongs to Support operations.

---

## Related-resource access

Knowing a SupportRequest references:

```text
Invoice INV-201
```

does not automatically grant Invoice visibility.

The SupportRequest projection should expose only Client-safe context that the user is authorized to see.

---

## Support category cannot bypass source permissions

A Billing ticket does not automatically grant Finance access.

---

## Internal note access

Only authorized internal users should receive internal resolution/triage notes.

Never include them in Portal DTOs.

---

## Search authorization

Support titles/messages can contain highly sensitive data.

Search must apply:

```text
authorized SupportRequest scope
→ search
```

not search globally then filter.

---

## Attachment authorization

A user may access an attachment only if they can access:

* its SupportRequest/Message context,
* the specific FileVersion.

---

## Direct attachment ID bypass prohibited

Knowing a FileVersion ID must not circumvent SupportRequest permission.

---

# 5. States

Design 058 should keep several state dimensions separate.

### Support lifecycle

Conceptually:

```text
NEW
OPEN
IN_PROGRESS
RESOLVED
CLOSED
REOPENED
CANCELLED
```

Exact enum Phase 3D.

### Waiting condition

```text
WAITING_ON_CLIENT
WAITING_ON_INTERNAL_TEAM
WAITING_ON_EXTERNAL_PROVIDER
NOT_WAITING
```

where useful.

### Assignment condition

```text
UNASSIGNED
ASSIGNED
ESCALATED
```

### Incident linkage

```text
NOT_INCIDENT_RELATED
POSSIBLY_RELATED
LINKED_TO_INCIDENT
```

internal semantics where applicable.

Do not merge all of these into `support.status`.

---

## New ≠ Open/In progress

Submission success does not mean an employee has begun handling the request.

---

## Waiting on Client ≠ resolved

If support asks for:

> Please upload a screenshot.

the case remains active.

Design 047 can surface a Client action.

---

## Waiting on provider ≠ support failure

Example:

> We are waiting for a third-party publication provider.

This is operational context, not necessarily a failed case.

---

## Resolved ≠ Closed

Keep separately if workflow uses a confirmation/reopen window.

---

## Reopened ≠ unresolved history deleted

Previously resolved timestamp/history remains.

---

## Cancelled ≠ resolved

A Client withdrawing a request does not prove the underlying issue was fixed.

---

## Duplicate ≠ resolved

A duplicate case may be linked/closed administratively while the original continues.

Do not claim “resolved” if it was merely consolidated.

---

## Incident-linked ≠ resolved

Linking a SupportRequest to an active Incident explains context.

The case remains open until service policy resolves it.

---

## Incident resolved ≠ SupportRequest auto-closed necessarily

The Client may still need:

* confirmation,
* cleanup,
* restored artifact,
* follow-up.

Support case resolution should evaluate its own state.

---

## No support requests ≠ support service unavailable

Successful empty query:

> You have no support requests.

Failure:

> Support is temporarily unavailable.

---

## No replies ≠ no SupportRequest

A newly submitted case may have zero staff replies.

---

## Message unavailable ≠ SupportRequest missing

If Conversation service fails:

SupportRequest metadata can still be displayed with communication degraded.

---

## Attachment unavailable ≠ entire case unavailable

Localize the failure.

---

## Related source unavailable

Example:

```text
Support case     ✓
Invoice context  ✕
Messages         ✓
```

The case should remain usable.

---

## Client submission failure

If creating a SupportRequest fails:

do not show a ticket number or success state until canonical persistence succeeds.

---

## Duplicate create retry

Client presses Submit twice due to network uncertainty.

Creation should be idempotent enough to avoid accidental duplicate cases.

---

## State Coverage

Design 058 inherits Design 150 plus support-specific states:

```text
Support Loading
Support Available

No Support Requests
No Results for Filters

Support Request Submitting
Support Request Created
Support Request Creation Failed

New
Open
In Progress
Waiting on Client
Waiting on Support Team
Waiting on External Provider

Resolved
Closed
Reopened
Cancelled

Response Available
No Replies Yet
Reply Sending
Reply Sent
Reply Failed

Attachment Uploading
Attachment Processing
Attachment Failed

Related Incident Active
Related Incident Resolved
Incident Information Unavailable

Support Request Restricted
Related Resource Restricted
Access Revoked

Support Updated Elsewhere
Partial Service Failure
```

These are not one giant enum.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve a clear service-case experience:

```text
Client Support
↓
Support Summary / New Request CTA if frozen
↓
Search / Filters
↓
Support Request List
    ├── reference
    ├── subject
    ├── category
    ├── Project/context
    ├── current state
    ├── waiting condition
    ├── updated date
    └── Open
↓
Selected Support Request
    ├── safe case context
    ├── conversation
    ├── attachments
    └── current required action
```

It should remain much simpler than an internal helpdesk/admin console.

---

## Tablet

Following Design 152:

* request table can become stacked cards,
* selected case can open in drawer/focused panel,
* conversation remains readable,
* reply composer remains accessible,
* attachment controls stay touch-safe,
* Client action/status remains visible.

---

## Mobile

Priority:

```text
Support
↓
Open Requests
↓
Support Card
   ├── Request reference
   ├── Subject
   ├── State
   ├── Last update
   └── Open
↓
Case Detail
   ├── Problem summary
   ├── Current state
   ├── Conversation
   ├── Attachments
   └── Reply / Required Client action
```

Do not squeeze a desktop ticket table onto mobile.

---

## Mobile new request

If creation is present in the frozen design, mobile should keep:

* category,
* subject,
* problem description,
* Project/context,
* attachment,

clear and touch-safe.

No new fields are introduced by this audit.

---

## Mobile conversation

Support messages should use the same accessible responsive conversation patterns as Design 045.

Do not build a separate chat system.

---

## Accessibility

Support status should use semantic text:

> In progress
> Waiting for your response
> Resolved August 20
> Related service incident active

Do not rely only on colored priority/status chips.

---

## Attachment accessibility

Uploaded evidence should expose:

* filename,
* type,
* upload/processing state,
* available action.

---

# 7. Backend Requirements

## Query architecture

```text
Design 058
    ↓
ClientPortalSessionContext
    ↓
Support Authorization
    ↓
ClientSupportQueryService
    │
    ├── SupportRequest
    ├── Client-safe assignment projection
    ├── related Project/resource context
    ├── Conversation
    ├── Messages
    ├── Attachments
    ├── Client-required action
    └── Incident summary where authorized
    ↓
ClientSupportRequestsView
```

---

## Support creation path

```text
Client submits support request
        ↓
authenticate
        ↓
authorize Client/account/context
        ↓
validate category/subject/body
        ↓
create SupportRequest
        ↓
create/link Conversation
        ↓
link attachments
        ↓
routing/assignment workflow
        ↓
Notifications / Activity / Audit
```

The operation should be idempotent enough to avoid duplicate tickets from retries.

---

## Messaging path

```text
SupportRequest
      ↓
Conversation
      ↓
Client Message
      ↓
Notification to support team
```

The Message does not mutate Support lifecycle by itself unless explicit support rules react to it.

---

## Internal work path

```text
SupportRequest
      ↓
internal triage
      ↓
Task(s)
      ↓
work completed
      ↓
support agent evaluates resolution
      ↓
SupportRequest resolved
```

No automatic `allTasksComplete → SupportRequestClosed` without explicit policy.

---

## Client Action path

```text
SupportRequest
      ↓
needs Client input
      ↓
ClientActionResolver
      ↓
Design 047
```

When Client provides the requested information, canonical Support state reevaluates.

---

## Incident path

```text
SupportRequest(s)
       ↓
possible common operational issue
       ↓
Incident — Design 147
       ↓
Client-safe Incident summary
       ↓
SupportRequest context
```

Incident remains source truth for outage/incident state.

---

## Support reference number

Client-facing support reference should be stable and server-generated.

Do not use a raw database integer as a security boundary.

---

## Routing

Support routing may consider:

* category,
* Project,
* Client,
* service type.

Routing decisions stay server-side/internal.

Do not encode assignment logic in React.

---

## SLA timers

If support SLAs exist:

timer calculation must be server-authoritative and use canonical business/timezone/calendar semantics.

Avoid browser-only timers.

No SLA feature is required unless frozen/business rules require it.

---

## Notifications

Potential events:

```text
SupportRequestCreated
SupportReplyReceived
SupportWaitingOnClient
SupportResolved
SupportReopened
```

can feed Notifications.

---

## Activity

Design 063 may later show Client-safe events such as:

> Support request SR-101 created.

> Support request SR-101 resolved.

This remains an Activity projection.

---

## Audit

Material operations can feed Design 039:

```text
SupportRequestCreated
SupportAssigned
SupportEscalated
SupportResolved
SupportClosed
SupportReopened
```

Avoid putting sensitive message/attachment bodies directly into Audit.

---

## Search

Search should operate over authorized:

* subject,
* safe description,
* case reference,
* Project/context.

Full-message search must remain permission-scoped.

---

## Backend Requirement Matrix

| Requirement                                | Status                               |
| ------------------------------------------ | ------------------------------------ |
| Client Portal authentication               | **Critical**                         |
| Active Portal membership                   | **Critical**                         |
| Client/account isolation                   | **Critical**                         |
| SupportRequest-level authorization         | **Critical**                         |
| Canonical SupportRequest entity            | **Critical**                         |
| Stable support reference                   | **Required**                         |
| Support lifecycle model                    | **Critical**                         |
| Waiting-condition separation               | **Critical**                         |
| Client/internal audience separation        | **Critical**                         |
| Design 045 Conversation reuse              | **Critical**                         |
| Design 045 Message reuse                   | **Critical**                         |
| Internal note vs Client Message separation | **Critical**                         |
| Design 034 Task reuse for internal work    | **Critical**                         |
| Task/SupportRequest lifecycle separation   | **Critical**                         |
| Design 047 ClientAction integration        | **Critical**                         |
| ClientRequest/SupportRequest separation    | **Critical**                         |
| Project/resource contextual linkage        | **Required**                         |
| Design 030 Asset/FileVersion reuse         | **Critical for attachments**         |
| Attachment scanning/security               | **Critical**                         |
| Internal assignment identity reuse         | **Required**                         |
| Assignment history                         | **Required**                         |
| Client-safe assignee projection            | **Required if shown**                |
| Incident linkage                           | **Critical when applicable**         |
| Incident/SupportRequest separation         | **Critical**                         |
| Client-safe Incident projection            | **Critical where shown**             |
| Idempotent SupportRequest creation         | **Critical**                         |
| Idempotent reply/message operations        | **Critical**                         |
| Server-side routing                        | **Required**                         |
| SLA/service-target support                 | **Required only if product uses it** |
| Permission-safe search                     | **Critical**                         |
| Permission-safe attachment access          | **Critical**                         |
| Notification integration                   | **Required**                         |
| Activity integration                       | **Required**                         |
| Audit integration                          | **Required**                         |
| Partial service degradation handling       | **Critical**                         |
| Design 045 backend reuse                   | **Critical**                         |
| Design 034 backend reuse                   | **Critical**                         |
| Design 147 future incident reuse           | **Critical architecture**            |

---

# 8. Consolidation

Design 058 exposes several important implementation risks.

**SupportRequest / Conversation conflation**
Ticket lifecycle becomes Message-thread state.

**SupportRequest / Message conflation**
Every reply becomes a new support case.

**SupportRequest / ClientRequest conflation**
Client asking for help is modeled as a request from the business to the Client.

**SupportRequest / Task conflation**
Internal employee work is exposed directly to the Client.

**Task completion / Support resolution conflation**
Closing one internal Task closes the whole case.

**SupportRequest / Incident conflation**
Every technical ticket creates a platform Incident.

**Incident / SupportRequest conflation**
One outage is duplicated into many independent incident records.

**Incident resolved / Support resolved conflation**
Cases close automatically even when Client follow-up remains.

**SupportRequest / Project Blocker conflation**
A service case directly becomes Project risk/blocker truth.

**Support category / assignment conflation**
Category hard-codes one internal assignee/team.

**Client urgency / internal severity conflation**
Client “urgent” input automatically creates P1 incident priority.

**Service state / waiting condition conflation**
`WAITING_ON_CLIENT` becomes the only support lifecycle state.

**Assigned / in-progress conflation**
Assignment is treated as proof active work began.

**Resolved / Closed conflation**
No opportunity to distinguish resolution from administrative closure.

**Closed / deleted conflation**
Service history disappears.

**Cancelled / resolved conflation**
Withdrawn ticket is reported as successfully solved.

**Duplicate / resolved conflation**
Merged ticket appears solved when only consolidated.

**Client reply / resolution conflation**
Any Client response closes case.

**Staff reply / resolution conflation**
“We're investigating” marks case resolved.

**Internal note / Message conflation**
Private support diagnostics leak into Portal.

**Conversation read / Support state conflation**
Reading reply changes case lifecycle.

**Notification / SupportRequest conflation**
Read notification is treated as action handled.

**Attachment / global Client File visibility conflation**
One support screenshot appears throughout Client file library.

**Attachment FileVersion bypass**
Direct asset ID ignores SupportRequest authorization.

**Billing support / Finance mutation conflation**
Support agent edits Invoice directly through ticket.

**Publishing support / Publication state conflation**
Ticket action directly retries/releases Publication.

**Account support / RBAC override conflation**
Support system bypasses canonical access-management controls.

**Project access / Support access conflation**
Every Project member sees every support case.

**Client account / support visibility conflation**
All Client users receive all cases regardless of privacy.

**Portal Admin / support superuser conflation**
Organization admin automatically sees private support issues.

**Related-resource visibility leak**
Support summary exposes Invoice/Contract/Project data user cannot otherwise access.

**Search leakage**
Ticket titles/messages reveal confidential information across Client users.

**Support creation retry duplication**
Network retry generates several tickets.

**Message outage / case missing conflation**
Conversation failure removes SupportRequest from UI.

**Attachment failure / case failure conflation**
One broken upload makes entire ticket unusable.

**No requests / service unavailable conflation**
Support backend outage appears as empty inbox.

**Support history / Audit conflation**
Audit becomes ticket history or vice versa.

**058/045 duplicate messaging engine**
Support builds its own reply/comment subsystem.

**058/034 duplicate task engine**
Support invents ticket-specific internal Tasks.

**058/147 duplicate incident engine**
Support creates its own system-outage model.

No additional screen is required.

These are **support-case identity, communication, work-management, incident, permission, attachment, and lifecycle requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT SUPPORT REQUEST & SERVICE CASE MANAGEMENT ANCHOR**

**Domain directive:**
**SupportRequest ≠ Conversation ≠ Message ≠ ClientRequest ≠ Internal Task ≠ Incident ≠ Project Blocker ≠ Notification.**

**Support directive:**
SupportRequest is the canonical service-case entity and owns case identity, Client/context, lifecycle, assignment and resolution semantics.

**Messaging directive:**
Design 045 remains the single Conversation + Message infrastructure. Support communication references a SupportRequest without becoming its lifecycle record.

**ClientRequest directive:**
Design 047's ClientRequest continues to represent obligations requested from the Client. A SupportRequest represents assistance requested by the Client. These directional semantics must remain distinct.

**Task directive:**
Design 034 remains the canonical internal Task engine. Support cases may create/link internal Tasks, but Clients never see those Tasks as their support case.

**Resolution directive:**
internal Task completion, Client reply, staff reply, notification read, or Incident resolution never independently prove SupportRequest resolution.

**Incident directive:**
system/service incidents remain Design 147's canonical operational entities. Multiple SupportRequests may reference one Incident without duplicating it.

**Project directive:**
SupportRequest may reference Project/resources as context but never becomes Project status, blocker or workflow truth.

**Assignment directive:**
support ownership references canonical internal workforce identities; reassignment preserves history while Client-facing staff details remain deliberately limited.

**Communication directive:**
internal support notes and Client-visible Messages are structurally separated server-side so diagnostics cannot leak through Portal DTOs.

**Attachment directive:**
support screenshots/documents reuse Design 030's Asset/FileVersion + scan/security infrastructure and retain SupportRequest-specific access context.

**Action directive:**
when support genuinely needs something from the Client, the shared `ClientActionResolver` may surface that obligation without converting the SupportRequest into a generic task.

**Authorization directive:**
Client account membership, Project access, SupportRequest visibility, reply capability, related-resource access and attachment access remain separately enforceable.

**Lifecycle directive:**
new, open, assigned, in progress, waiting, resolved, closed, reopened, cancelled and incident-linked conditions remain explicitly distinguishable rather than collapsed into one status value.

**Reliability directive:**
empty support history, restricted case, unavailable Conversation, failed attachment, related-resource outage and support-service failure remain distinct conditions.

**Idempotency directive:**
new SupportRequest creation and message/reply operations must tolerate retries without accidental duplicate cases or replies.

**Notification directive:**
support updates can generate shared Notifications, but Notification state never becomes Support state.

**Audit directive:**
case creation, assignment, escalation, resolution, closure and reopening can feed Design 039 while SupportRequest history remains the canonical business service history.

**Responsive directive:**
desktop provides Client support queue + focused case/conversation; mobile becomes request card → case state → conversation → attachment/action without reproducing an internal helpdesk console.

**Overlap directive:**
Designs **030, 034, 039, 043, 045, 047, 058, 061, 063–064 and 147** must share one Asset, Task, Messaging, Notification, Audit and Incident foundation while keeping SupportRequest as its own canonical case domain.

**Consolidation directive:**
**STANDARDIZE ONE CLIENT SUPPORT CASE DOMAIN — SUPPORTREQUEST + CLIENT/PROJECT CONTEXT + ASSIGNMENT + LIFECYCLE + RESOLUTION + LINKED CANONICAL CONVERSATION/MESSAGES + INTERNAL TASKS + ASSET ATTACHMENTS + OPTIONAL INCIDENT REFERENCE + CLIENT ACTION/NOTIFICATION INTEGRATION — AND DO NOT BUILD SUPPORT AS A SECOND MESSAGING SYSTEM, TASK ENGINE, CLIENTREQUEST SYSTEM OR INCIDENT PLATFORM.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **58 / 153** |
| **PASS**                                   |                         **58** |
| **STANDARDIZE decisions**                  |                         **56** |
| **Potential implementation-overlap flags** |                         **49** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**58 / 153 = 37.9% audited.**

### Canonical Support architecture after Design 058

```text
                   SUPPORT REQUEST
                      Design 058
                          │
          ┌───────────────┼────────────────┐
          ↓               ↓                ↓
   Conversation        Internal Task     Attachment
    Design 045          Design 034        Design 030
          │
          ↓
       Messages
                          │
                          ↓
                   Internal resolution
                          │
            ┌─────────────┴────────────┐
            ↓                          ↓
      Client Action               Incident Link
       Design 047                 Design 147
   when input is needed           when applicable
```

The critical separation is:

```text
CLIENT ASKS US FOR HELP
        ↓
SupportRequest

WE ASK CLIENT FOR SOMETHING
        ↓
ClientRequest / ClientAction

OUR TEAM MUST DO WORK
        ↓
Internal Task

WE COMMUNICATE
        ↓
Conversation / Message

PLATFORM-WIDE OPERATIONAL FAILURE
        ↓
Incident
```

# Next Sequential Audit Target

## **Design 059 — Client Profile & Account Settings**

Its frozen identity is already locked.

The next audit must preserve the personal-account boundary:

> **User Identity ≠ Portal Membership ≠ Client Contact ≠ Personal Profile ≠ User Preferences ≠ Organization Settings ≠ Authentication Credentials ≠ Authorization Roles.**

It must also ensure that changing a Client user's own profile/preferences does **not** silently modify:

* the Client organization,
* Contract-party snapshots,
* historical signer/approver evidence,
* RBAC/Portal roles,
* authentication/security credentials unless handled by their dedicated subsystem.

After Design 059 we continue strictly:

**060 Client Organization / Company Settings → 061 Client Notifications / Notification Preferences → 062 Client Portal Users / Team Access → 063 Client Activity / Account History → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
