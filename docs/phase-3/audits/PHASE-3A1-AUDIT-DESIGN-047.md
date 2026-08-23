# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 047 — Tasks / Requests

Design 047 should become the **canonical Client Portal action/request workspace** for work that genuinely requires something from the Client.

Its most important architectural responsibility is preserving the distinction already established across Designs 034, 041–044:

> **Internal Task ≠ Client Request ≠ Client Action ≠ Approval ≠ Questionnaire Requirement.**

Design 047 should therefore **aggregate and present Client-facing obligations**, while keeping the originating domain record authoritative. It must never expose the internal Team Workspace Task system as though employees and Clients share one undifferentiated task list.

| Audit field                                | Classification                                                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                              | **047**                                                                                                                          |
| **Canonical name**                         | **Tasks / Requests**                                                                                                             |
| **Product area**                           | Client Portal / Projects / Collaboration / Dependencies                                                                          |
| **User surface**                           | **Client Portal**                                                                                                                |
| **Screen class**                           | Client Action Queue / Request & Dependency Workspace                                                                             |
| **Classification**                         | **Unique Portal Anchor — Client Request & Action Family**                                                                        |
| **Primary purpose**                        | Show Client-facing requests, obligations and required actions across authorized Projects/account contexts                        |
| **Primary canonical external-work entity** | **ClientRequest**                                                                                                                |
| **Primary aggregation concept**            | **ClientActionView / ClientActionResolver**                                                                                      |
| **Related canonical domains**              | ApprovalRequest, Questionnaire requirement/response, Asset/File request, Invoice/Payment requirement, Project, Meeting, Contract |
| **Internal work dependency**               | Design 034 — Tasks & Work Management                                                                                             |
| **Project dependency**                     | Designs 023 / 043                                                                                                                |
| **Approval dependency**                    | Design 029 / later 052                                                                                                           |
| **Questionnaire dependency**               | Design 048                                                                                                                       |
| **File dependency**                        | Design 030 / later 051                                                                                                           |
| **Parent shell**                           | `ClientPortalShell` — Design 002                                                                                                 |
| **Template family**                        | `ClientActionQueueWorkspaceTemplate`                                                                                             |
| **Composition**                            | `ClientTasksRequestsComposition`                                                                                                 |
| **Auth**                                   | Required                                                                                                                         |
| **Authorization**                          | Portal membership + Project/request/resource scope                                                                               |
| **Implementation priority**                | **Critical Client Collaboration**                                                                                                |
| **Reuse level**                            | **Very High**                                                                                                                    |

The governing invariant is:

> **Task ≠ ClientRequest ≠ ClientActionView ≠ ApprovalRequest ≠ QuestionnaireResponse ≠ Notification.**

---

# 1. Classification — Functional Responsibility

Design 047 should answer:

> **“What does The Perspective currently need from me, why is it needed, for which Project, when is it due, what is its current state, and where do I complete the actual action?”**

Canonical architecture:

```text
CANONICAL SOURCE DOMAINS
        │
        ├── ClientRequest
        ├── ApprovalRequest
        ├── Questionnaire Requirement
        ├── Requested Asset / File
        ├── Payment Requirement
        └── other explicitly Client-owned dependency
                  ↓
           Client Action Resolver
                  ↓
             ClientActionView
                  ↓
        Portal Authorization Scope
                  ↓
       Design 047 — Tasks / Requests
```

Design 047 is therefore both:

* a **ClientRequest workspace**, and
* an **aggregation surface for Client actions originating in other domains**.

It is not another universal task engine.

---

# 2. Internal Task ≠ Client Request

Design 034 established the canonical internal `Task`.

Example:

```text
Internal Task:
Review Client's portrait quality
Assigned to:
Designer
```

This is employee work.

A separate Client-facing obligation may be:

```text
ClientRequest:
Upload higher-resolution portrait
Requested from:
Client
```

These records can be related.

They are not the same thing.

---

# 3. Why the distinction matters

If the platform simply exposes internal Tasks to the Client:

Clients could see:

* internal assignees,
* deadlines,
* priorities,
* internal comments,
* staff blockers,
* operational failures,
* private process details.

That would violate the Client-safe architecture established in Designs 041–046.

Correct:

```text
Internal Task
      ↓ may generate / depend on
ClientRequest
```

not:

```text
Internal Task
      ↓
make visible in Client Portal
```

---

# 4. ClientRequest should be first-class

A canonical ClientRequest conceptually represents:

> **A specific piece of information, content, action, confirmation, or dependency requested from an external Client participant.**

Conceptually:

```text
ClientRequest
├── id
├── Client / Portal organization
├── Project/context
├── request type/category
├── title
├── safe description
├── requester
├── requested participant / audience
├── createdAt
├── dueAt
├── lifecycle state
├── completion/satisfaction context
└── source/related record
```

Exact schema and enums belong to Phase 3D.

---

# 5. ClientRequest ≠ ClientActionView

This distinction is central.

`ClientRequest` is a canonical business record.

`ClientActionView` is an aggregate projection.

Example:

```text
ClientActionView
├── ClientRequest: Upload portrait
├── ApprovalRequest: Approve Draft v4
├── Questionnaire: Complete founder questionnaire
└── Invoice: Payment required
```

Only the first item is literally a `ClientRequest`.

---

# 6. Do not create one giant ClientAction table

A tempting implementation would be:

```text
ClientAction
├── approval
├── questionnaire
├── file
├── payment
├── request
```

with duplicated status values.

That would create competing truth.

Preferred:

```text
Canonical source records
       ↓
Client Action Resolver
       ↓
normalized read projection
```

---

# 7. ClientActionView needs source lineage

Every action item should know:

```text
sourceType
sourceId
```

For example:

```text
Action:
Approve final cover

Source:
ApprovalRequest AP-102

Subject:
ProofVersion PV-4
```

This allows the action to deep-link to the correct source workflow.

---

# 8. Client Request ≠ Approval Request

Example:

```text
ClientRequest:
Please upload three executive photos.
```

versus:

```text
ApprovalRequest:
Approve final magazine proof v4.
```

Approval has:

* designated approver(s),
* exact version subject,
* formal decision semantics.

Do not model Approval as a generic Request.

---

# 9. Client Request ≠ Questionnaire requirement

Example:

```text
ClientRequest:
Please complete your executive profile questionnaire.
```

may be how the requirement is *presented*.

But the source remains:

```text
QuestionnaireDefinition/Version
+
QuestionnaireResponse state
```

Design 048 owns the actual Questionnaire interaction.

---

# 10. Client Request ≠ file requirement automatically

A request:

> Upload your profile images.

can be backed by a ClientRequest or structured asset requirement.

The uploaded Asset remains Design 030's canonical Asset/File record.

Do not store uploaded files inside the Request record itself.

---

# 11. Client Request ≠ payment obligation

If Design 047 shows:

> Payment required

the source should remain the canonical Invoice/Payment domain.

Design 047 should not create:

```text
ClientRequest.status = PAID
```

as a duplicate Finance state.

---

# 12. Notification ≠ Client Action

Example:

```text
ApprovalRequest
      ↓
ClientActionView
      ↓
Notification
```

There is one obligation.

The Notification is merely an attention/delivery mechanism.

Do not count:

* the approval,
* its action projection,
* its notification

as three separate Client tasks.

---

# 13. Dashboard consistency

Design 041 may display:

> **4 Actions Required**

Design 047 should return the corresponding four current authorized actions using the same `ClientActionResolver`.

Avoid:

```text
041 action count = query A
047 actions = query B
```

with inconsistent semantics.

---

# 14. Design 042 consistency

A Project card might show:

> 2 actions required.

Opening Design 047 filtered to that Project should reconcile to the same active source actions.

---

# 15. Design 043 consistency

Client Project Detail may show a compact Action Required section.

Design 047 owns the broader queue across Projects.

```text
043 Project Detail
      ↓ contextual summary
047 Tasks / Requests
      ↓ complete Client action collection
```

---

# 16. Design 044 consistency

A Client action may appear on the Project Timeline.

The timeline item must reference the same underlying source action.

No separate timeline request record.

---

# 17. Request status ≠ due condition

A `ClientRequest` might have lifecycle:

```text
OPEN
IN_PROGRESS
SUBMITTED
SATISFIED
CANCELLED
```

while its scheduling condition might be:

```text
DUE_SOON
OVERDUE
ON_TIME
```

These must remain separate dimensions.

Exact enums Phase 3D.

---

# 18. Open ≠ overdue

A request can be open and still have five days remaining.

Do not represent:

```text
OPEN
=
OVERDUE
```

---

# 19. Submitted ≠ satisfied

This is particularly important.

Example:

> Client uploads an image.

The request may become:

```text
SUBMITTED
```

but internal validation may reveal:

> Resolution too low.

It may not yet be:

```text
SATISFIED
```

Therefore:

> **submission ≠ acceptance/satisfaction.**

---

# 20. Uploaded ≠ accepted

Permanent Asset-related rule:

```text
File uploaded
     ↓
processing/security validation
     ↓
business validation
     ↓
Request satisfied
```

Do not auto-close every upload request immediately.

---

# 21. Questionnaire submitted ≠ accepted/completed workflow

A Client may submit a Questionnaire while staff still need clarification.

Questionnaire source state remains authoritative.

Design 047 consumes whatever actionable state the Questionnaire domain exposes.

---

# 22. Approval decision completes the approval action

An Approval action should disappear from the active action queue when the canonical ApprovalRequest reaches its terminal/current decision state.

Design 047 should not require a separate:

```text
clientAction.completed = true
```

write.

---

# 23. Payment completion

Likewise:

```text
Invoice payment settled
      ↓
Client Action resolver
      ↓
payment action no longer active
```

No duplicate completion checkbox.

---

# 24. Request owner / recipient

A ClientRequest should distinguish:

```text
requestedBy
requestedFrom
```

Internal requester and Client participant are not the same identity.

---

# 25. Requested from ≠ Client organization globally

A request may be assigned to:

* one specific Portal member,
* a Client Portal Role/group,
* potentially any authorized Client member.

Exact policy Phase 3D.

Do not assume every request belongs to every Portal user.

---

# 26. Same Client ≠ same action queue

Example:

```text
CEO
→ Contract approval

Marketing Director
→ Draft/design approvals

Finance Contact
→ Invoice payment
```

All belong to the same Client account but can have different Design 047 queues.

---

# 27. Portal membership is mandatory

A ClientRequest may remain historically linked to a Client Contact even if that user later loses Portal access.

That does not allow deactivated membership to continue completing the request.

---

# 28. Reassignment

If the product allows moving a request from one Client participant to another:

```text
Client A
→ Client B
```

reassignment must preserve history.

Do not overwrite the original recipient without trace.

---

# 29. Reassignment ≠ duplication

A transferred request should generally remain one canonical request unless business policy explicitly requires a new request.

Otherwise counts/history become misleading.

---

# 30. Requester identity

Internal requester should use Design 036's canonical member identity.

Client Portal should receive only safe requester projection:

* name,
* approved role/title,
* avatar if intended.

No internal employee details.

---

# 31. Project context

Client Requests should normally be structurally linked to their Project/context where relevant.

Correct:

```text
ClientRequest
→ Project 123
```

Not only:

```text
description:
"Please upload images for magazine project."
```

---

# 32. Account-level requests

Some requests may be Client-wide rather than Project-specific.

Example:

> Update company billing information.

Architecture should not force every request to require `projectId`.

---

# 33. Request type

Potential conceptual categories include:

```text
INFORMATION
ASSET
CONFIRMATION
DOCUMENT
OTHER
```

but exact types should be defined only from actual product needs during Phase 3D.

Do not create dozens of arbitrary categories now.

---

# 34. Source-backed request type

Where an action originates from another domain, source type provides stronger semantics:

```text
APPROVAL
QUESTIONNAIRE
FILE_REQUEST
PAYMENT
```

This belongs primarily to the `ClientActionView`.

---

# 35. Priority

If frozen UI presents urgency/priority:

Client-facing priority should be explicit.

Do not expose Design 034's internal Task priority automatically.

---

# 36. Internal urgency ≠ Client priority

Internal team might mark:

> CRITICAL

because publication is blocked.

Client-safe UI might legitimately show:

> Needed by September 3.

Use Client-relevant urgency rather than leaking internal operational labels.

---

# 37. Due date

Due dates should be authoritative server-side values.

Do not calculate deadlines solely from:

```text
createdAt + frontend constant
```

---

# 38. Due date revisions

If a request deadline changes:

preserve history where material.

Do not make it appear that the original deadline never existed.

---

# 39. Due date ≠ Project milestone

A Client Request can have a deadline independent from the Project milestone.

Example:

```text
Request due:
Sep 2

Milestone:
Design Review — Sep 5
```

Both remain separate.

---

# 40. Overdue calculation requires timezone semantics

A due date/time must use canonical timezone/date-only rules from Designs 035/040.

Never rely solely on the Client browser clock.

---

# 41. Date-only request deadlines

If the request is due:

> September 5

store it as date-only where appropriate.

Do not turn it into midnight UTC and accidentally mark it overdue on September 4 for another timezone.

---

# 42. Completion evidence

A request may be satisfied by:

```text
FileVersion
QuestionnaireResponse
ApprovalDecision
Payment
Text response
other canonical record
```

Prefer a reference to that evidence rather than duplicating the evidence into the request.

---

# 43. Client text response

For simple information requests:

the product may support a direct textual response.

If so, that response should be stored as a structured response/submission associated with the ClientRequest.

Do not convert it into an internal Task comment.

---

# 44. Request conversation ≠ Message thread automatically

A ClientRequest can have discussion.

But:

```text
ClientRequest
≠
Conversation
```

If conversation is needed, link Design 045's canonical Conversation.

Do not duplicate messaging inside request comments unless frozen workflow explicitly requires separate comments.

---

# 45. Comment ≠ completion

A Client writing:

> I'll send this tomorrow.

does not satisfy:

> Upload 3 images.

Completion must be determined from the canonical requirement/source.

---

# 46. Request attachment

Attachments reuse Design 030:

```text
ClientRequest
    ↓
Submission / Attachment
    ↓
Asset/FileVersion
```

No request-specific binary storage.

---

# 47. Exact FileVersion matters

If a request was satisfied using:

```text
portrait-v2.jpg
```

later replacing that Asset with v3 must not rewrite historical completion evidence.

Pin exact versions where needed.

---

# 48. Requested asset ≠ Project file library access

A Client may upload one requested document without gaining access to all Project Files.

Write access to the request target does not imply broad Asset read permission.

---

# 49. Upload ≠ download

Permanent permission distinction:

```text
portal.files.upload
≠
portal.files.download
```

A Client may be allowed to submit requested material while not being allowed to download internal/restricted files.

---

# 50. Request creation

Whether Client users can create new requests for the internal team depends on the frozen product.

Design 047's title **Tasks / Requests** does not automatically mean Clients can create arbitrary work for staff.

This audit does **not** add that capability.

---

# 51. Client-created request ≠ internal Task automatically

If future/frozen behavior permits Client-generated requests:

the canonical ClientRequest can trigger internal workflow/Task creation through explicit rules.

Do not directly insert uncontrolled records into Design 034's Task board.

---

# 52. Internal Task linkage

A ClientRequest may create or block one or more internal Tasks.

Conceptually:

```text
ClientRequest
     ↓ dependency
Internal Task(s)
```

But the Client Portal should not see those internal Tasks.

---

# 53. Closing internal Task ≠ ClientRequest satisfied automatically

Example:

```text
Internal Task:
Review uploaded headshots
→ completed
```

This may confirm the ClientRequest is satisfied.

But the relationship must be deliberate.

Do not universally map Task completion to Client Request completion.

---

# 54. Design 034 relationship

Design 034 remains the one canonical internal Task infrastructure.

Design 047 does **not** share the same `Task` record indiscriminately.

Correct architecture:

```text
INTERNAL WORK
Task — Design 034

EXTERNAL DEPENDENCY
ClientRequest — Design 047 / 116

AGGREGATION
ClientActionView — Designs 041/042/043/047
```

---

# 55. Design 078 relationship

Later:

**Design 078 — My Work / Personal Work Queue**

Design 078 aggregates internal:

* Tasks,
* FollowUps,
* approvals,
* Meetings,
* etc.

Design 047 aggregates external Client obligations.

They can share queue/list components and action-resolution patterns.

They should not share one persisted `WorkItem` table.

---

# 56. Design 095 relationship

Later:

**Design 095 — Follow-up Queue / Follow-up Detail Workspace**

A FollowUp is internal CRM work.

It remains distinct from a ClientRequest.

Do not expose sales follow-ups to Clients.

---

# 57. Design 116 relationship

Later:

**Design 116 — Project Client Requests / Dependency Tracker**

This is the strongest overlap.

Expected architecture:

```text
Canonical ClientRequest Domain
        │
        ├── Design 047
        │   Client-facing request/action workspace
        │
        └── Design 116
            Internal request/dependency management
```

**One ClientRequest domain. Two audiences.**

No merge decision yet.

---

# 58. Internal Design 116 may show more

Design 116 can legitimately show:

* internal requester,
* Project dependency,
* workflow impact,
* blocking Tasks,
* escalation,
* internal notes,
* overdue risk.

Design 047 should expose only Client-safe request information and completion interaction.

---

# 59. Design 048 relationship

A Questionnaire requirement can appear in Design 047.

Opening it should route into:

**Design 048 — Client Questionnaires**

The Questionnaire domain remains authoritative.

---

# 60. Design 049–050 relationship

Draft/Design review actions may appear:

```text
Review Draft v4
Review Proof v3
```

But the actual review experiences remain Designs 049 and 050.

Design 047 only aggregates/deep-links.

---

# 61. Design 051 relationship

File Requests can deep-link into the specific upload/files context.

Design 051 owns broader Client Files & Assets.

---

# 62. Design 052 relationship

Approval actions deep-link to Client Approvals.

The formal decision remains Design 029's canonical Approval infrastructure.

---

# 63. Design 053 relationship

Contract-signature requirement may be represented as an action.

Source:

```text
Contract / Signing Request
```

not generic ClientRequest completion.

---

# 64. Design 054 relationship

Payment requirement may be represented as an action.

Finance remains canonical.

Design 047 must never manipulate Invoice payment state itself.

---

# 65. Design 057 relationship

Renewal/Continuation may eventually create Client actions.

Design 057 remains the Renewal domain.

Design 047 can aggregate the resulting external obligation if appropriate.

---

# 66. Design 107 relationship

Internal:

**Client Onboarding Checklist Detail**

may contain onboarding requirements.

Client-facing requests generated from onboarding should reuse the same ClientRequest/action infrastructure where appropriate.

No onboarding-specific duplicate request system.

---

# 67. Action groups

The UI may group actions as:

```text
Needs Your Attention
In Progress
Completed
```

or similar frozen categories.

These are query/presentation views.

They must not become three physical tables.

---

# 68. Completed actions

Completed ClientRequests/actions can remain accessible historically where useful.

Completion should not delete the source record.

---

# 69. Completed action ≠ deleted action

Permanent rule:

```text
Completed
≠
Deleted
```

Historical accountability and Project context should remain.

---

# 70. Cancelled request

If internal staff withdraw a request:

```text
CANCELLED
```

should remain distinct from:

```text
COMPLETED
```

A cancelled requirement was not satisfied.

---

# 71. Superseded request

A request can become obsolete because a newer artifact/requirement replaces it.

Example:

> Approve Draft v3

superseded by:

> Approve Draft v4.

The current queue should remove v3 as active while retaining historical lineage.

---

# 72. Duplicate action prevention

The Client Action Resolver should deduplicate semantically identical source representations.

Example:

```text
ApprovalRequest
+
Notification about approval
```

must produce one action.

---

# 73. Resolver should be deterministic

Given the same:

* Portal member,
* authorized resources,
* source records,

the Client Action Resolver should return the same active action set.

Avoid page-specific heuristic counts.

---

# 74. ClientActionView

A conceptual normalized projection:

```text
ClientActionView
├── actionKey
├── sourceType
├── sourceId
├── Client/Project context
├── title
├── safe description
├── due date
├── urgency condition
├── current action state
├── action CTA
├── completion evidence reference
└── permitted interaction
```

This is a read model.

---

# 75. Source state remains authoritative

Example:

```text
ClientActionView.state = REQUIRED
```

should be derived from:

```text
ApprovalRequest.status = PENDING
```

not independently persisted and manually synchronized.

---

# 76. Action CTA should come from source semantics

Examples:

```text
Approval
→ Review & Decide

Questionnaire
→ Complete Questionnaire

File Request
→ Upload Files

Payment
→ View Invoice / Pay
```

Do not use one generic:

> Complete Task

for all action types if it obscures the actual domain operation.

---

# 77. Available action ≠ executable forever

Between render and click:

* another approver may act,
* request may be withdrawn,
* invoice may be paid,
* membership may be revoked.

All commands perform fresh server validation.

---

# 78. Idempotency

High-value actions must tolerate repeated submission safely.

Examples:

* approval,
* questionnaire submission,
* file upload completion,
* payment initiation.

Design 047 does not weaken source-domain idempotency.

---

# 79. Search

Design 047 can search authorized requests/actions by fields such as:

* title,
* Project,
* request type.

Authorization scope must apply before search.

---

# 80. Search must not leak hidden Projects/actions

A Client user must not discover:

> Contract Signature Required

for a Contract they do not have permission to access merely through search/autocomplete.

---

# 81. Filters

Potential filters may include, according to frozen UI:

```text
Project
Due condition
Action type
Status/presentation category
```

These are query filters.

Not authorization.

---

# 82. Sorting

Useful server-side ordering may prioritize:

1. overdue,
2. due soon,
3. normal open actions,
4. completed/history.

Exact frozen presentation remains unchanged.

Urgency calculation needs canonical due semantics.

---

# 83. Count consistency

Counts displayed in:

* ClientShell,
* Dashboard,
* My Projects,
* Project Detail,
* Design 047,

must reconcile where they represent the same action population.

One resolver/query foundation is mandatory.

---

# 84. Permission architecture

Potential Phase 3D Portal capabilities could conceptually include:

```text
portal.requests.read
portal.requests.respond

portal.questionnaires.read
portal.questionnaires.submit

portal.approvals.read
portal.approvals.decide

portal.files.upload

portal.finance.read
portal.payment.perform
```

Exact names later.

Key rule:

> **Seeing an action does not automatically grant permission to perform it.**

---

# 85. Request visibility ≠ completion authority

A Client executive may see that:

> Marketing Questionnaire pending

without personally being the intended respondent.

Design 047 can display contextual information while CTA authorization remains participant-specific.

---

# 86. Approval visibility ≠ approval authority

Same principle:

```text
approval.read
≠
approval.decide
```

A Client observer can see an approval is pending without being an approver.

---

# 87. Payment visibility ≠ payment authority

Likewise:

```text
invoice.read
≠
payment.perform
```

Do not show operational payment CTA solely because billing information is visible.

---

# 88. Request reassignment permissions

If Client Portal admins can assign requests to Client colleagues, that should be an explicit permission.

Do not assume every recipient can reassign requests.

No new reassignment UI is introduced unless frozen.

---

# 89. Client Portal admin ≠ internal request administrator

A Portal administrator managing Client-side users does not gain authority to:

* change internal due dates,
* cancel internal requests,
* change workflow impact,
* alter Project dependencies.

---

# 90. Audit integration

Material actions may emit Design 039 AuditEvents:

```text
ClientRequestCreated
ClientRequestAssigned
ClientRequestSubmitted
ClientRequestSatisfied
ClientRequestCancelled
ClientRequestReassigned
```

plus canonical events from:

* Approval,
* Finance,
* Questionnaire,
* Asset,

where those domains are the actual source.

---

# 91. Avoid duplicate audit events

If an Approval completes:

the Approval domain should emit the formal:

```text
ApprovalDecisionRecorded
```

Design 047 should not emit another contradictory:

```text
ClientTaskCompleted
```

unless the aggregate event has a clear separate purpose.

Audit truth should preserve source semantics.

---

# 92. Client-safe activity

Design 063 may display:

> You submitted the requested images.

That activity can reference the ClientRequest/Asset event.

Again, Activity is presentation/history—not the source record.

---

# 93. Notification integration

Request creation/due reminders can create Notifications.

But:

```text
Request
≠
Notification
```

and:

```text
Notification read
≠
Request completed
```

---

# 94. Reminder scheduling

If reminders exist:

they should derive from the request/action due state using the shared Notification scheduling infrastructure.

Do not maintain separate Client Request cron logic in the browser.

---

# 95. Reminder sent ≠ action handled

A Reminder delivery event cannot modify ClientRequest completion.

---

# 96. Partial failure

Example:

```text
ClientRequest service    ✓
Approval service         ✓
Questionnaire service    ✕
Finance service          ✓
```

Design 047 should remain useful.

Questionnaire actions can show an unavailable/degraded state.

---

# 97. Unknown ≠ completed

If Questionnaire source cannot load:

do not remove its action and assume:

> Completed.

---

# 98. Unknown ≠ no actions

If one or more required action sources fail:

do not claim:

> You're all caught up.

That message is valid only when all applicable source queries succeed.

---

# 99. Restricted ≠ completed

If the current member lacks permission to perform an action:

the system should distinguish:

* action exists but is not assigned/performable by this user,
* action does not exist,
* action is complete.

Exact visibility depends on Portal policy.

---

# 100. Submission failed ≠ request completed

A Client submitting information should see success only after canonical persistence succeeds.

Optimistic UI must reconcile with the server.

---

# 101. File scanning failure ≠ request completion

If upload finishes but security scan fails:

the Asset Request should remain unresolved according to business policy.

---

# 102. Concurrent completion

Example:

```text
Client A opens request.

Client B satisfies it.

Client A clicks Submit.
```

The server must detect current state and return a safe:

> This request has already been completed.

rather than creating duplicate completion.

---

# 103. Request updated elsewhere

If due date, recipient, or requirement changes while the Client has the screen open:

the UI should reconcile against current revision/source state.

---

# 104. State coverage

Design 047 inherits Design 150 plus request/action-specific states:

```text
Tasks / Requests Loading
Actions Available

No Actions Required
No Requests Yet
No Results for Filters

Request Open
Request In Progress
Request Submitted
Request Satisfied
Request Cancelled
Request Superseded

Due Soon
Overdue

Approval Required
Questionnaire Required
File Upload Required
Payment Required

Action Restricted
Action Assigned to Another Client Member

Submission In Progress
Submission Failed
Submission Accepted
Submission Needs Revision

Source Status Unavailable
Partial Action Data
Access Revoked
Partial Service Failure
```

These are not one universal status enum.

---

# 105. Empty ≠ unavailable

Correct:

> No actions currently require your attention.

only when all relevant authorized sources were successfully evaluated.

Service failure requires an unavailable/partial message.

---

# 106. No requests ≠ no actions

A Client may have:

```text
0 ClientRequests
```

but still have:

```text
2 ApprovalRequests
1 Questionnaire
```

Therefore:

> No Requests

and:

> No Actions Required

are different states.

---

# 107. Submitted ≠ completed

The visual state system should make this distinction understandable if the frozen workflow requires review/validation.

Example:

> Submitted — awaiting review

instead of prematurely:

> Completed.

---

# 108. Responsive — Desktop

Desktop should preserve a clear cross-Project action queue:

```text
Tasks / Requests Header
↓
Summary / Action Counts
↓
Search / Filters
↓
Needs Your Attention
↓
Request / Action List
    ├── Action type
    ├── Project
    ├── Safe description
    ├── Due date
    ├── Status
    ├── Requested by
    └── CTA
↓
Completed / History where frozen
```

The surface should stay simpler than the internal Design 034 task manager.

---

# 109. Responsive — Tablet

Following Design 152:

* action cards replace dense tables where needed,
* filters move to compact controls,
* due date and CTA remain visible,
* Project context remains prominent,
* long request descriptions collapse cleanly.

---

# 110. Responsive — Mobile

Priority:

```text
Tasks / Requests
↓
Needs Your Attention
↓
Action Card
    ├── Action type
    ├── Project
    ├── What is needed
    ├── Due date
    └── Complete/Open Action
↓
Other Open Requests
↓
Completed History
```

No internal kanban/task-management complexity should be forced onto mobile.

---

# 111. Mobile action safety

Before:

* approving,
* submitting,
* uploading,
* paying,

the Client should clearly understand:

* Project/context,
* exact requested action,
* relevant version/amount/file requirement.

No ambiguous icon-only CTAs.

---

# 112. Accessibility

Action state must use explicit text:

> Approval required
> Due September 5
> Submitted — awaiting review
> Completed

Do not communicate urgency solely through red/orange color.

All action cards and controls require keyboard/screen-reader access.

---

# 113. Read model

A useful query response:

```text
ClientTasksRequestsView
├── current Portal membership
├── canonical ClientRequests
├── normalized ClientActionViews
├── Project/account context
├── safe requester summaries
├── due conditions
├── source status
├── permitted CTA
├── completion evidence references
├── filters/counts
└── partial-data state
```

This is a composed read model.

---

# 114. Mutation architecture

Do not expose:

```text
PATCH /client/tasks/:id
{
  complete: true
}
```

for every action type.

Use source-specific commands:

```text
respondToClientRequest()
submitClientRequest()
submitQuestionnaire()
decideApproval()
uploadRequestedAsset()
initiatePayment()
```

and appropriate internal commands such as:

```text
markClientRequestSatisfied()
cancelClientRequest()
```

for authorized Team Workspace actors.

---

# 115. Backend architecture

```text
Design 047
    ↓
ClientPortalSessionContext
    ↓
Portal Authorization
    ↓
ClientActionQueryService
    │
    ├── ClientRequestQuery
    ├── ApprovalQuery
    ├── QuestionnaireQuery
    ├── AssetRequirementQuery
    ├── FinanceRequirementQuery
    └── other approved Client dependencies
    ↓
ClientActionResolver
    ↓
dedupe + permission + due-state normalization
    ↓
ClientTasksRequestsView
```

Writes return to the originating domain.

---

# 116. Backend requirements

| Requirement                                | Status                     |
| ------------------------------------------ | -------------------------- |
| Client Portal authentication               | **Critical**               |
| Active Portal membership                   | **Critical**               |
| Client/account isolation                   | **Critical**               |
| Project/resource scoping                   | **Critical**               |
| Canonical ClientRequest domain             | **Critical**               |
| Internal Task / ClientRequest separation   | **Critical**               |
| Client Action Resolver                     | **Critical**               |
| Source lineage                             | **Critical**               |
| Approval integration                       | **Critical**               |
| Questionnaire integration                  | **Critical**               |
| Asset/File requirement integration         | **Critical**               |
| Finance/payment action integration         | **Critical where exposed** |
| Canonical Project relationship             | **Critical**               |
| Recipient/participant targeting            | **Critical**               |
| Request lifecycle                          | **Critical**               |
| Submitted vs satisfied separation          | **Critical**               |
| Due-condition calculation                  | **Critical**               |
| Date/timezone correctness                  | **Critical**               |
| Exact completion evidence reference        | **Required**               |
| Safe requester projection                  | **Required**               |
| Server-side search/filter                  | **Required**               |
| Cross-source action deduplication          | **Critical**               |
| Dashboard/Project action-count consistency | **Critical**               |
| Source-specific commands                   | **Critical**               |
| Idempotent submissions/actions             | **Critical**               |
| Concurrency/current-state validation       | **Critical**               |
| Membership/access revocation               | **Critical**               |
| Notification/reminder integration          | **Required**               |
| Audit integration                          | **Required**               |
| Partial-source failure handling            | **Critical**               |
| Design 034 separation/reuse                | **Critical**               |
| Design 116 infrastructure reuse            | **Critical architecture**  |

---

# 117. Consolidation — Main Implementation Risks

Design 047 exposes several major architectural risks.

**Internal Task / ClientRequest conflation**
Internal employee Tasks are exposed directly to Clients.

**ClientRequest / ClientAction conflation**
One mega action table duplicates Approval, Questionnaire, Asset and Finance truth.

**Request / Approval conflation**
Formal version-specific approval becomes generic task completion.

**Request / Questionnaire conflation**
Questionnaire workflow is reduced to a Boolean.

**Notification / Action conflation**
One requirement is counted twice.

**Task comment / Client response conflation**
Client submission is stored as an internal Task comment.

**Uploaded / satisfied conflation**
Any uploaded file immediately closes the requirement.

**Submitted / completed conflation**
Staff review/validation is bypassed.

**Project visibility / action visibility conflation**
Every Project member sees every sensitive Client action.

**Action visibility / action authority conflation**
Observer can approve/pay/submit.

**Client account / recipient conflation**
Every Client Portal user receives every request.

**Internal priority leakage**
Operations urgency is exposed as Client-facing priority.

**Due-state/lifecycle conflation**
Overdue becomes a Request lifecycle status.

**Date-only/timezone bug**
Requirements become overdue on the wrong date.

**Completion-evidence duplication**
File, approval or payment result is copied into ClientRequest instead of referenced.

**Message / Request conflation**
General conversation becomes task completion.

**Internal Task completion / Client Request satisfaction conflation**
Employee checking a Task automatically closes the Client obligation.

**Project milestone / Request deadline conflation**
Two different dates are stored as one `dueDate`.

**Cancelled / completed conflation**
Withdrawn Client request appears successfully fulfilled.

**Superseded/current-action conflation**
Old Draft/Proof approval remains active.

**Dashboard/047 count drift**
Different screens use different definitions of “action required.”

**Generic `/client/tasks/:id/complete` endpoint**
Every domain loses its own validation semantics.

**Unknown / complete conflation**
Source outage removes action from the queue.

**Zero requests / zero actions conflation**
No `ClientRequest` records falsely produces “all caught up.”

**047/116 duplicate ClientRequest systems**
Internal dependency tracker gets a second model.

**047/078 giant WorkItem model**
Internal and Client-facing work are collapsed into one persisted super-entity.

No additional design is required.

These are **work-domain, projection, source-of-truth, permission and lifecycle requirements**.

# Design 047 Audit Verdict

## **PASS — CLIENT REQUEST & CROSS-DOMAIN ACTION QUEUE ANCHOR**

**Domain directive:** **Internal Task ≠ ClientRequest ≠ ClientActionView ≠ ApprovalRequest ≠ Questionnaire Requirement ≠ Notification.**

**Task directive:** Design 034 remains the canonical internal Task engine. Client-facing obligations are never created by simply making internal Tasks visible externally.

**Request directive:** `ClientRequest` becomes the canonical explicit external dependency/request record for information, files, confirmation or other Client-owned requirements.

**Aggregation directive:** `ClientActionView` is a read projection over ClientRequest, Approval, Questionnaire, File requirement, Finance and other legitimate source domains—not a second persisted action truth store.

**Lineage directive:** every aggregated action retains `sourceType + sourceId` so completion, history and deep-linking resolve to the actual canonical domain record.

**Approval directive:** ApprovalRequests remain exact-version formal decisions and are never reduced to generic task completion.

**Questionnaire directive:** questionnaire definition/version/response remains canonical to Design 048; Design 047 only surfaces its actionable state.

**Asset directive:** requested uploads use Design 030 Asset/FileVersion infrastructure; uploaded, scanned, submitted and business-accepted states remain distinguishable.

**Finance directive:** payment actions derive from canonical Invoice/Payment state. Design 047 never writes Finance lifecycle itself.

**Action directive:** Client Action counts used across Designs 041–044 and 047 must come from one canonical `ClientActionResolver`.

**Recipient directive:** belonging to the Client account does not automatically expose every request. Participant/Role/Project/resource targeting remains explicit.

**Lifecycle directive:** open, submitted, satisfied, cancelled and superseded semantics remain distinct from due/overdue scheduling conditions.

**Evidence directive:** completion references canonical evidence—ApprovalDecision, QuestionnaireResponse, FileVersion, Payment, etc.—instead of duplicating that evidence into the request.

**Command directive:** Client actions use source-specific commands such as `decideApproval()`, `submitQuestionnaire()` or `uploadRequestedAsset()` rather than a universal `completeTask()` endpoint.

**Idempotency directive:** submissions and high-impact actions remain replay-safe and revalidate current source state at execution time.

**Failure directive:** no requests, no actions, restricted action, source unavailable, submitted, satisfied and completed remain distinct states. Partial source failure can never produce a false “all caught up.”

**Notification directive:** reminders/notifications derive from Requests and actions but never become the action source of truth.

**Audit directive:** material request creation, reassignment, submission, satisfaction and cancellation feed Design 039 while formal source-domain actions retain their own canonical AuditEvents.

**Responsive directive:** desktop provides a clear cross-Project Client action queue while mobile prioritizes action type → Project → requirement → due date → safe CTA, without reproducing internal task-management complexity.

**Overlap directive:** Designs **034, 041–044, 047, 048–054, 078, 095, 107 and 116** must preserve explicit work-domain boundaries while sharing Client Action resolution and common queue/list primitives where appropriate.

**Consolidation directive:** **STANDARDIZE ONE CANONICAL `ClientRequest` + CROSS-DOMAIN `ClientActionResolver` + SOURCE-LINEAGE + RECIPIENT/SCOPE + DUE-STATE + COMPLETION-EVIDENCE INFRASTRUCTURE — DO NOT BUILD A SECOND TASK ENGINE FOR CLIENTS AND DO NOT COLLAPSE APPROVALS, QUESTIONNAIRES, FILE REQUESTS OR PAYMENTS INTO GENERIC TASK RECORDS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **47 / 153** |
| **PASS**                                   |                         **47** |
| **STANDARDIZE decisions**                  |                         **45** |
| **Potential implementation-overlap flags** |                         **38** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**47 / 153 = 30.7% audited.**

### Canonical work/action architecture after Design 047

```text
                 INTERNAL WORK
                     Task
                  Design 034
                      │
                      │ may depend on
                      ↓
                 ClientRequest
                      │
              ┌───────┼──────────┐
              │       │          │
              ↓       ↓          ↓
          Approval  Questionnaire Asset Request
              │       │          │
              └───────┼──────────┤
                      ↓          Finance
                CLIENT ACTION RESOLVER
                      ↓
               ClientActionView
                      │
       ┌──────────────┼────────────────┐
       ↓              ↓                ↓
 041 Dashboard   042/043 Projects   047 Tasks/Requests
```

And the strongest future internal/external pairing is now:

```text
ClientRequest
     │
     ├── Design 047
     │   Client-facing action/request workspace
     │
     └── Design 116
         Internal Project Client Requests /
         Dependency Tracker
```

# Next Sequential Audit Target

## **Design 048 — Client Questionnaires**

Its frozen identity is already locked.

The next audit will need to preserve another critical boundary:

> **Questionnaire Definition ≠ Questionnaire Version ≠ Questionnaire Assignment/Request ≠ Questionnaire Response ≠ Response Revision ≠ Client Action.**

After Design 048 we continue strictly:

**049 Client Draft Review → 050 Client Design Review → 051 Client Files & Assets → 052 Client Approvals → 053 Client Contracts → 054 Client Invoices & Payments → 055 Client Publishing & Distribution → 056 Client Reports & Downloads → … → 077 Client Access Recovery**

with the unchanged audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**

