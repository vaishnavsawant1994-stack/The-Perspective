# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 078 — My Work / Personal Work Queue

Design 078 now begins the post-Client-Portal Team Workspace sequence. Its frozen identity is locked as **My Work / Personal Work Queue**. No exact route is being invented or finalized in Phase 3A.1.

Design 078 should become the **canonical personal cross-domain work aggregation surface** for the authenticated Team Workspace member.

Its governing boundary should be:

> **Task ≠ FollowUp ≠ Meeting ≠ ApprovalRequest/ApprovalParticipant ≠ ClientRequest ≠ Milestone ≠ Risk ≠ Blocker ≠ Notification ≠ WorkQueueEntry/Projection.**

The key architectural rule is:

> **Design 078 must aggregate work; it must not create a universal mutable “WorkItem” entity that replaces the source domains. Every queue entry must retain an exact canonical source entity, source state, responsibility/participant relationship, due semantics, permission context, and source-specific action.**

A user seeing something in **My Work** means:

> “Based on current source-domain state, assignment/participation and authorization, this item is relevant/actionable for me.”

It does **not** mean:

> “This has been converted into a generic Task.”

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **078**                                                                                                                                            |
| **Canonical name**                    | **My Work / Personal Work Queue**                                                                                                                  |
| **Product area**                      | Team Workspace / Personal Productivity / Cross-Domain Operations                                                                                   |
| **User surface**                      | **Authenticated Team Workspace**                                                                                                                   |
| **Screen class**                      | Personal Cross-Domain Work Queue / Attention Workspace                                                                                             |
| **Classification**                    | **Cross-Domain Personal Work Aggregation Anchor**                                                                                                  |
| **Primary purpose**                   | Give the current Team member one authorized view of work they own, must perform, must decide, or must follow up on across canonical source domains |
| **Primary source entity**             | None — intentionally cross-domain                                                                                                                  |
| **Canonical projection**              | **PersonalWorkQueueEntry / MyWorkEntry**                                                                                                           |
| **Canonical Task foundation**         | Design 034                                                                                                                                         |
| **Follow-up/Meeting foundation**      | Design 015                                                                                                                                         |
| **Approval foundation**               | Design 029                                                                                                                                         |
| **Project foundation**                | Design 023                                                                                                                                         |
| **Client Request dependency**         | Design 047 / later 116 where internal responsibility is relevant                                                                                   |
| **Risk/Blocker dependency**           | later Design 113                                                                                                                                   |
| **Project Task/Milestone dependency** | later Design 111                                                                                                                                   |
| **Notification relationship**         | Design 080 later — separate attention channel                                                                                                      |
| **Search relationship**               | Design 079 next — separate discovery system                                                                                                        |
| **Identity/member dependency**        | Designs 036 / 037                                                                                                                                  |
| **Parent shell**                      | `InternalAppShell` — Design 001                                                                                                                    |
| **Primary read model**                | `PersonalWorkQueueView`                                                                                                                            |
| **Primary query service**             | `PersonalWorkQueueQueryService`                                                                                                                    |
| **Auth**                              | Required                                                                                                                                           |
| **Authorization**                     | Current authenticated OrganizationMembership + source-resource authorization                                                                       |
| **Implementation priority**           | **Critical Cross-Domain Productivity / Assignment Integrity**                                                                                      |
| **Reuse level**                       | **Extremely High — aggregation over existing canonical entities**                                                                                  |

Design 078 should answer:

> **“What work currently requires my attention, what canonical thing does each item represent, why is it in my queue, when is it due, what is its real source-domain state, and what authorized action can I take next?”**

Conceptually:

```text
Canonical source domains
        │
        ├── Task
        ├── FollowUp
        ├── ApprovalParticipant obligation
        ├── Meeting-related responsibility
        ├── Project/Milestone responsibility
        ├── Client dependency follow-up
        ├── Risk/Blocker ownership
        └── other governed actionable sources
                    │
                    ↓
        Personal Work Projection Layer
                    │
                    ↓
           PersonalWorkQueueEntry[]
                    │
                    ↓
              Design 078
```

---

# 2. Reuse

## Design 034 remains the canonical Task domain

Design 034 established:

> **Task ≠ FollowUp ≠ Meeting ≠ Approval ≠ Stage ≠ Milestone ≠ ClientRequest ≠ Risk ≠ Blocker.**

Design 078 must preserve this entire boundary.

A Task appearing in My Work remains:

```text
Task T-101
```

It does not become:

```text
PersonalWorkItem PW-501
```

as a new mutable source of truth.

---

## Do not create a giant universal WorkItem table

This is the largest architectural risk in Design 078.

Avoid:

```text
WorkItem
├── type
├── title
├── status
├── dueDate
├── assignee
├── completed
└── source?
```

used as a replacement for:

* Tasks,
* Approvals,
* FollowUps,
* Meetings,
* Risks,
* Client dependencies.

That architecture would eventually force every domain into the weakest common denominator.

Correct:

```text
PersonalWorkQueueEntry
=
read projection
over canonical source entity
```

---

## Reuse Design 015 FollowUp

A FollowUp remains a FollowUp.

Example:

```text
FollowUp F-25
→ call prospect after proposal review
```

Design 078 can project:

> Follow up with Arjun Mehta

but completion must use the canonical FollowUp command/state.

Do not mutate a generic queue row to `completed=true`.

---

## Reuse Design 015 Meeting separately

A Meeting can appear in personal work context when it genuinely requires the current user's action or attention.

But:

```text
Meeting
≠
Task
```

Attendance, preparation, outcome capture, or follow-up must remain governed by their appropriate domain semantics.

Simply having a Meeting on the calendar does not automatically mean it is an incomplete Task.

---

## Reuse Design 029 Approval engine

An Approval obligation can appear because:

```text
ApprovalRequest AR-10
→ ApprovalParticipant = current user
→ decision still required
```

The queue item is only the projection:

```text
Approval required
```

The formal source remains:

```text
ApprovalRequest
+
ApprovalParticipant
+
ApprovalDecision
```

---

## Reuse Project entities without flattening them

A Project-related responsibility may reference:

* Task,
* Milestone,
* Approval,
* Blocker,
* Risk,
* Client dependency.

Project context should enrich the queue entry.

It must not replace the source entity.

---

## Reuse Design 047 / later 116 carefully

A ClientRequest means:

> We are waiting on the Client for something.

That does not automatically mean the internal employee has a Task.

However, if an internal owner has responsibility to:

* monitor,
* remind,
* follow up,
* unblock,

the personal queue may contain a source-backed responsibility.

Avoid converting every ClientRequest automatically into a duplicate Task.

---

## Design 078 ≠ Design 080 Notifications Center

This distinction is fundamental.

### Design 078 — My Work

> Things requiring work, decision, follow-up or owned attention.

### Design 080 — Team Notifications Center

> Events/information delivered to the user's attention.

Permanent:

```text
Notification
≠
Work
```

A notification saying:

> Contract signed

does not become personal work.

Likewise, a Task remains work even if no notification exists.

---

## Design 078 ≠ Design 079 Global Search

### Design 078

Curated current work based on responsibility/actionability.

### Design 079

Search/discovery across authorized system entities.

Search result relevance does not imply personal responsibility.

---

## Reuse source-domain detail surfaces

Opening an item should lead conceptually to its canonical source/detail workflow.

Examples:

```text
Task
→ canonical Task/project detail

Approval
→ Approval detail

Deal FollowUp
→ Deal/follow-up context

Meeting
→ Meeting detail

Risk
→ Risk workspace
```

Exact navigation is Phase 3B, not finalized here.

---

# 3. Entities

## WorkQueueEntry is a projection, not a business entity

Conceptually:

```text
PersonalWorkQueueEntry
├── entryKey
├── sourceType
├── sourceId
├── sourceVersion/revision where useful
├── canonical context
├── whyItAppears
├── responsibility relation
├── current source status
├── due semantics
├── priority/urgency projection
├── available action
└── authorization context
```

It should be reconstructable from canonical source data.

---

## Queue entry ≠ source record

Permanent:

```text
PersonalWorkQueueEntry
≠
Task
≠
ApprovalRequest
≠
FollowUp
```

---

## Source identity must remain explicit

Every entry needs an exact source reference.

Avoid anonymous projection rows such as:

```text
"Review Magazine Draft"
```

with no authoritative entity identity.

Conceptually:

```text
sourceType = APPROVAL_REQUEST
sourceId = AR-204
```

or equivalent typed reference.

---

## SourceType should be governed

Do not allow arbitrary strings from clients.

Use a registry/discriminated union of supported queue source types.

---

## Current user ≠ assignee universally

Different source domains express responsibility differently.

### Task

```text
Task.assignee
```

### Approval

```text
ApprovalParticipant
```

### FollowUp

```text
FollowUp.owner
```

### Risk

```text
Risk.owner
```

Therefore:

> **Personal work membership must use a source-specific responsibility resolver.**

---

## Assignment ≠ participation

A Meeting participant is not necessarily assigned work.

An ApprovalParticipant is not a Task assignee.

A Project team member is not automatically responsible for every Project item.

---

## Project team membership ≠ My Work membership

Permanent.

Being on Project P101 does not make every Task/Milestone/Risk appear in the user's queue.

---

## Watching/following ≠ ownership

If the platform later supports watchers/followers:

```text
watching
≠
assigned
≠
action required
```

Do not mix them.

---

## Mentioned ≠ assigned

A mention in a comment/message should not automatically become a persistent WorkQueueEntry unless a governed personal-attention policy exists.

---

## Notification recipient ≠ Work owner

Permanent.

---

## `whyItAppears` should be source-derived

Examples conceptually:

```text
ASSIGNED_TO_ME
APPROVAL_REQUIRED_FROM_ME
FOLLOW_UP_OWNED_BY_ME
MILESTONE_RESPONSIBILITY
RISK_OWNER
BLOCKER_OWNER
```

This makes aggregation explainable.

Do not derive it from frontend guesswork.

---

## Work relevance ≠ source status

Example:

```text
Task status = IN_PROGRESS
Why in My Work = ASSIGNED_TO_ME
```

These are separate.

---

## Personal queue state ≠ source lifecycle

Avoid:

```text
queueItem.status = DONE
```

as an independent source truth.

If the Task is completed:

```text
Task.status = COMPLETED
```

then the projection naturally stops being active/current work according to queue policy.

---

## Completing queue entry ≠ completing source generically

A single generic:

```text
completeWorkItem()
```

is unsafe across all types.

Instead:

```text
completeTask()
decideApproval()
completeFollowUp()
resolveBlocker()
```

through source-domain commands.

---

## Queue dismissal ≠ source completion

If frozen UI supports hide/dismiss/snooze behavior later:

that personal presentation preference must remain separate from canonical business completion.

Do not infer such functionality if not in the frozen screen.

---

## Task status ≠ Approval state

Example:

```text
Task:
IN_PROGRESS

Approval:
PENDING_DECISION
```

They cannot share one universal lifecycle enum.

---

## Due date ≠ one universal semantic

Different sources can carry different timing concepts.

Examples:

```text
Task.dueAt
FollowUp.dueAt
Approval.respondBy
Meeting.startsAt
Milestone.targetAt
```

Design 078 can normalize them for sorting/display while preserving their original meaning.

---

## Display due time ≠ canonical timing semantics

A derived field such as:

```text
attentionAt
```

may support ordering.

It should not overwrite the source date.

---

## Overdue ≠ source lifecycle state

A Task can be:

```text
IN_PROGRESS + OVERDUE
```

A pending Approval can be overdue.

Due condition is derived from time + policy.

Keep separate from lifecycle.

---

## Due soon ≠ high priority necessarily

Time urgency and business priority remain distinct.

---

## Priority ≠ urgency

Example:

```text
Priority = HIGH
Due = next month
```

versus:

```text
Priority = NORMAL
Due = today
```

Queue ordering may consider both, but they are different dimensions.

---

## Source priority semantics can differ

A Task may have explicit priority.

A risk may have severity/exposure.

An Approval may have no priority but a deadline.

Do not force:

```text
Risk severity
=
Task priority
```

into one canonical field.

The queue can derive a display/attention weight without rewriting source meaning.

---

## Risk ≠ Blocker

Later Design 113 should preserve:

```text
Risk
≠
Blocker
```

A risk is possible exposure/problem.

A blocker is an active impediment.

Both may appear in personal work if owned.

---

## Milestone ≠ Task

A Milestone can be a Project checkpoint.

If the current user is accountable for it, Design 078 may project it.

Do not convert Milestone to Task.

---

## Meeting ≠ FollowUp

Meeting occurrence and post-meeting action remain distinct.

---

## Meeting completed ≠ follow-up completed

Permanent.

---

## ClientRequest ≠ internal Task

If the Client owes something:

```text
ClientRequest
```

remains the external dependency.

An internal FollowUp/Task to chase it may coexist but has its own identity.

---

## ApprovalRequest ≠ ApprovalParticipant obligation

One ApprovalRequest can have several participants.

Design 078 must calculate personal work using the **current user's participant obligation**, not merely the overall ApprovalRequest state.

Example:

```text
AR-10
├── Alice — APPROVED
├── Bob   — PENDING
└── Carol — PENDING
```

Alice should not continue seeing:

> Approval required from you.

even while aggregate request remains Pending.

---

## Parallel/sequence Approval policy matters

If Bob's approval is not yet actionable until Alice decides, Bob's queue membership must respect the Approval policy.

Do not expose an actionable decision prematurely.

---

## Source state may change while queue is open

The queue is inherently dynamic.

Examples:

* another user completes a Task reassignment,
* approval is withdrawn,
* FollowUp is completed elsewhere,
* Project closes,
* blocker is resolved.

Design 078 must refresh/reconcile.

---

## Completed historical work ≠ active queue

The primary My Work surface should represent current work according to frozen UI.

Historical work remains canonical in its source domain.

Do not duplicate all historical tasks into a permanent WorkQueue table.

---

## Queue counts are projections

If frozen UI has counts such as:

```text
Due Today
Overdue
Approvals
```

all counts must derive from the same authorization and work-entry resolver used by the list.

Avoid counters and rows disagreeing.

---

# 4. Permissions

Design 078 is especially sensitive because it combines information from many domains.

Authorization should conceptually evaluate:

```text
Authenticated User
+
active OrganizationMembership
+
source responsibility relationship
+
source resource authorization
+
source-specific visibility
+
current action eligibility
```

---

## Assigned-to-me ≠ authorized-to-view automatically

An invalid/stale assignment should never bypass resource security.

Even if:

```text
Task.assigneeId = currentUser
```

the server still needs current Organization/resource authorization.

---

## Authorized-to-view ≠ authorized-to-act

Permanent.

A user might be able to view an Approval but not be an ApprovalParticipant.

A Project Manager might view another person's Task but not complete it on their behalf.

---

## Queue membership requires both relevance and permission

Correct conceptual predicate:

```text
includeInMyWork(item, user)
=
isPersonallyRelevant(item, user)
AND
canViewSource(item, user)
```

Action CTA additionally requires:

```text
canPerformCurrentAction(item, user)
```

---

## Current user must come from session

Never allow:

```text
GET /my-work?userId=someoneElse
```

to become ordinary authorization.

Managers/team analytics belong elsewhere.

**My Work** is for the authenticated principal.

---

## Organization scope

The queue must be Organization/Workspace scoped.

No cross-tenant:

* Tasks,
* Approvals,
* Projects,
* Meetings,
* Clients.

---

## Multi-organization User safety

If one User belongs to multiple Organizations:

the current authenticated workspace context must govern the queue.

Do not aggregate work from unrelated organizations into one unsafe list unless an explicitly designed global account surface exists.

No such new surface is introduced here.

---

## Sensitive source metadata

A queue entry must not reveal more information than the user can read in the source domain.

Example:

A restricted Contract approval may allow:

> Contract approval required

but not expose confidential Contract terms unless authorized.

---

## Summary permission ≠ detail permission necessarily

If the product has limited summary visibility, the projection service must return only the permitted safe fields.

Do not fetch full source entity and then hide columns in the browser.

---

## Approval action

A generic permission such as:

```text
approval.read
```

does not authorize:

```text
decideApproval()
```

Current ApprovalParticipant eligibility remains required.

---

## Task completion

Only source-domain Task permissions determine whether:

* complete,
* reassign,
* edit due date,

are allowed.

Design 078 does not grant those capabilities itself.

---

## FollowUp completion

Same principle.

---

## Manager ≠ automatic actor impersonation

Managers can have oversight elsewhere.

“My Work” must not let them accidentally execute another employee's source action as if they were that person.

---

## Deactivated user/membership

If the Team membership is deactivated:

My Work becomes inaccessible.

Historical source assignments remain historical evidence according to source policy.

---

## Reassignment

If Task T1 moves:

```text
Alice → Bob
```

Alice's queue should lose it according to projection refresh.

No stale personal copy should remain actionable.

---

## Direct source IDs reauthorize

Even if a queue entry was previously returned, opening/actioning it requires fresh source authorization.

---

## Cache safety

One user's queue must never be cached/reused for another user's session.

---

# 5. States

Design 078 must keep **queue/query state, source lifecycle, personal relevance, due condition, current actionability, and partial-source health** separate.

### Queue/query state

```text
Loading
Available
Empty
Filter Empty
Loading More
Partial Results
Failed
```

### Personal relevance state

Conceptually:

```text
Assigned to Me
Owned by Me
Approval Required from Me
Follow-up Required
Waiting / Monitoring Responsibility
No Longer Relevant
```

### Due condition

```text
No Due Date
Upcoming
Due Today
Overdue
```

### Source lifecycle

Varies by domain:

```text
Task → TODO / IN_PROGRESS / COMPLETED
Approval → PENDING / APPROVED / REJECTED / ...
FollowUp → OPEN / DONE / CANCELLED
Meeting → SCHEDULED / COMPLETED / CANCELLED
```

Do not flatten them.

### Current actionability

```text
Action Available
Waiting on Dependency
Blocked
Action Restricted
Action No Longer Applicable
Action State Unavailable
```

These are independent dimensions.

---

## Empty queue ≠ query failure

Permanent.

---

## No overdue items ≠ overdue resolver unavailable

Critical.

---

## Zero approvals ≠ Approval service unavailable

Critical.

---

## Task service unavailable ≠ no Tasks

Critical.

---

## Approval service unavailable ≠ no Approvals

Critical.

---

## Partial service failure should remain partial

Example:

```text
Tasks       ✓
FollowUps   ✓
Approvals   ✕
Meetings    ✓
```

Design 078 should not claim:

> You're all caught up.

Instead, return known work plus unavailable/partial state.

---

## Completed ≠ no longer authorized

A completed Task may disappear from current queue because it no longer meets active-work policy.

That is different from authorization removal.

---

## Reassigned ≠ completed

If a work item leaves My Work because someone else now owns it:

do not label it completed.

---

## Approval withdrawn ≠ approved

An approval obligation can leave the queue due to withdrawal/supersession.

Preserve source outcome.

---

## Approval decided by current user ≠ aggregate Approval complete

The user's work may be complete while the overall ApprovalRequest remains pending other participants.

---

## Waiting ≠ completed

If a user has performed their step and another dependency remains:

personal queue policy may remove/reclassify it.

Do not mutate source lifecycle to Completed unless source domain says so.

---

## Blocked ≠ overdue

A blocked Task may be on time.

An overdue Task may not be blocked.

---

## Overdue ≠ failed

Permanent.

---

## Upcoming ≠ low importance

Permanent.

---

## No due date ≠ no urgency automatically

Other source factors may drive priority.

---

## Action unavailable ≠ completed

If authorization/service resolution fails:

do not make item disappear as “done.”

---

## Updated elsewhere

When another actor changes a source item:

Design 078 should reconcile through:

* refresh,
* event-driven invalidation,
* projection update,

without creating duplicate entries.

---

## State Coverage

Design 078 inherits Design 150 plus:

```text
My Work Loading
My Work Available
My Work Empty
My Work Filter Empty

My Work Partial Results
My Work Query Failed

Due Today
Upcoming
Overdue
No Due Date

Assigned to Me
Owned by Me
Approval Required from Me
Follow-up Required from Me

Action Available
Waiting on Dependency
Blocked
Action Restricted
Action State Unavailable

Item Reassigned
Item Completed Elsewhere
Approval Already Decided
Approval Withdrawn / Superseded
Item No Longer Relevant

Tasks Source Unavailable
Approvals Source Unavailable
FollowUps Source Unavailable
Other Work Source Partially Unavailable
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize **personal prioritization across heterogeneous work**, not imitate every source-domain table simultaneously.

Conceptually:

```text
My Work
↓
Summary / filters if frozen
↓
Personal Queue
    ├── work title
    ├── source type/context
    ├── Project / Client / Deal context
    ├── why it requires me
    ├── due condition
    ├── source state
    ├── priority/attention
    └── canonical next action
```

Only fields present in the frozen design should be rendered.

---

## Source type must remain understandable

A user should be able to distinguish:

* Task,
* Approval,
* Follow-up,
* Meeting-related work,
* Blocker,

without every item appearing as a generic task.

---

## Desktop should not become a universal editing grid

Avoid inline editing of every source concept through one generic row.

Actions should remain source-aware.

---

## Tablet

Following Design 152:

* dense rows reflow to compact cards where necessary,
* source/domain indicator remains visible,
* due state stays near the item,
* source context remains understandable,
* primary action remains touch-safe.

---

## Mobile

Priority:

```text
My Work
↓
Work Card
   ├── title
   ├── source type
   ├── Project/context
   ├── why it's mine
   ├── due state
   └── next action
↓
Next item
```

No compressed multi-domain spreadsheet.

---

## Mobile source state clarity

Use text such as:

> Approval required
> Task due today
> Follow-up overdue

rather than only color-coded badges.

---

## Mobile priority vs due

Avoid visually conflating:

> High priority

and:

> Overdue

because they represent different dimensions.

---

## Long titles/context

Project names, Client names and task titles must wrap/truncate safely without horizontal overflow.

---

## Accessibility

A queue item should communicate something equivalent to:

> Approval required from you. Proposal for Acme Corporation. Due today. Open approval.

or:

> Task assigned to you. Prepare magazine draft. Executive Profile project. Due August 25. In progress.

where source data supports it.

---

## Keyboard navigation

Desktop users should be able to move predictably through:

* filters,
* work entries,
* source actions.

---

## Status not color-only

Due, blocked, approval-required and priority states need semantic text/icons accessible to assistive technology.

---

# 7. Backend Requirements

## Aggregation architecture

Design 078 needs a deliberate **projection/query layer**, not a generic business-domain table.

```text
Design 078
    ↓
Authenticated Team Context
    ↓
PersonalWorkQueueQueryService
    │
    ├── TaskWorkAdapter
    ├── FollowUpWorkAdapter
    ├── ApprovalWorkAdapter
    ├── MeetingWorkAdapter where genuinely actionable
    ├── ProjectWorkAdapter
    ├── ClientDependencyWorkAdapter
    ├── Risk/BlockerWorkAdapter
    └── future governed work-source adapters
    ↓
PersonalWorkQueueEntry[]
    ↓
sorting / filtering / pagination
    ↓
PersonalWorkQueueView
```

---

## Use typed source adapters

Each adapter should know:

1. how to find work relevant to the current user;
2. how to authorize it;
3. how to derive safe summary data;
4. how to derive due semantics;
5. how to derive current actionability;
6. where canonical source commands live.

This is safer than one huge SQL `UNION` with weak business logic embedded in presentation code.

---

## Work Source Registry

A governed registry can conceptually define:

```text
WorkSourceDefinition
├── sourceType
├── adapter/service
├── responsibility resolver
├── due resolver
├── status projection resolver
├── action resolver
├── permission resolver
└── ranking contribution
```

This is backend architecture, not a new user-facing screen.

---

## Do not copy full entities into the queue

Avoid persistent duplicates such as:

```text
PersonalWorkItem
{
  sourceTitleCopy,
  sourceStatusCopy,
  sourceDueDateCopy,
  sourceAssigneeCopy
}
```

unless a materialized read model is deliberately used with source-derived/replayable semantics.

If materialized, canonical source IDs/revisions remain authoritative.

---

## Materialized projection is acceptable

For scale, a materialized queue projection can be useful.

But it must be:

* source-derived,
* idempotently updated,
* replayable/rebuildable,
* revision-aware,
* never directly edited as business truth.

---

## Personal relevance resolver

Conceptually:

```text
resolvePersonalResponsibility(
    sourceEntity,
    currentMembership
)
```

must be source-specific.

Do not use one generic `assigneeId` assumption.

---

## Current action resolver

Conceptually:

```text
resolvePersonalWorkAction(
    sourceType,
    sourceState,
    responsibility,
    permission,
    dependency state
)
```

returns a safe action descriptor.

Examples:

```text
OPEN_TASK
DECIDE_APPROVAL
COMPLETE_FOLLOWUP
VIEW_BLOCKER
NO_ACTION
WAITING
UNAVAILABLE
```

The descriptor navigates/invokes canonical source workflows.

---

## No generic mutation endpoint

Prohibit architecture like:

```text
PATCH /my-work/:id
{
  status: "done"
}
```

because `done` means different things across domains.

Source-specific commands remain:

```text
completeTask()
decideApproval()
completeFollowUp()
resolveBlocker()
```

---

## Query should start from current user context

Conceptually:

```text
getMyWork(currentOrganizationMembership)
```

not:

```text
getWorkForUser(userId from browser)
```

---

## Authorization before aggregation

Prefer source queries that are already permission-scoped.

Do not fetch organization-wide sensitive work and filter it only in application/browser code.

---

## Cross-source deduplication

The same business situation can produce several legitimate entities.

Example:

```text
ClientRequest CR-10
+
FollowUp F-20
```

These are not necessarily duplicates.

Deduplication must be identity-aware rather than text/title matching.

---

## Avoid accidental double representation

However, if two adapters project the **same canonical entity**, only one queue entry should appear for the same responsibility.

Use stable key conceptually:

```text
(sourceType, sourceId, responsibilityType, currentMembership)
```

or equivalent.

---

## Sorting/ranking

Ordering can consider:

* overdue,
* due soon,
* explicit priority,
* source-specific severity,
* action availability.

But the ranking score itself is a projection.

It must not become source-domain priority.

---

## Ranking explainability

Do not create an opaque AI priority score that silently overrides business semantics.

If a derived attention score exists, retain source factors and deterministic policy.

No AI ranking feature is being added here.

---

## Timezone handling

Due conditions must use canonical Organization/User display timezone rules established by settings.

Store absolute/timed business data correctly.

Do not compare formatted strings in the browser.

---

## Date-only due semantics

If a source uses date-only deadlines:

do not accidentally mark it overdue at midnight UTC for a user operating in another timezone.

---

## Pagination

For large queues:

use stable cursor pagination/ranking.

Because multiple source domains are combined, pagination must preserve deterministic global ordering.

---

## Filter counts

If frozen UI includes filters/counts:

derive them from the same authorized queue snapshot/query policy.

---

## Event-driven projection updates

Useful canonical source events include:

```text
TaskAssigned
TaskCompleted
TaskReassigned

FollowUpCreated
FollowUpCompleted

ApprovalParticipantActivated
ApprovalDecisionRecorded
ApprovalWithdrawn

RiskOwnerChanged
BlockerResolved
```

These can update/invalidate the personal work projection.

---

## Idempotent projection updates

Repeated source events must not create duplicate queue entries.

---

## Event ordering

Out-of-order events must not resurrect stale work incorrectly.

Projection update should use:

* source revision,
* event sequence,
* current-source reconciliation.

---

## Reconciliation job

Periodic reconciliation can compare materialized queue state against canonical source state.

This helps repair missed/out-of-order events.

---

## Partial-source failure

`PersonalWorkQueueQueryService` should support:

```text
entries
+
sourceHealth
+
partialFailure metadata
```

rather than returning one misleading empty array.

---

## Search vs My Work

Design 079 can search source entities independently.

Do not use global search index as the only source of personal work truth because indexes can be stale and may not capture participant/action semantics safely.

---

## Notification vs My Work

Design 080 can consume some of the same domain events.

But:

```text
Notification projector
≠
Personal Work projector
```

They have different inclusion/retention/read semantics.

---

## Cache strategy

Cache must vary by:

```text
organizationMembershipId
authorization revision
source revisions
work-query/filter state
```

Not merely User ID if the User belongs to multiple organizations.

---

## Source details loaded lazily/batched

Avoid an N+1 pattern where 50 queue entries trigger 50 Project/Client/detail requests.

Use:

* batched composition,
* safe summary projections,
* materialized read models where justified.

---

## Audit

Simply viewing My Work does not require heavy Audit logging.

Mutations invoked from the queue remain audited by their canonical source domains.

The queue itself should not invent duplicate Audit events for the same business command.

---

## Backend Requirement Matrix

| Requirement                                   | Status                    |
| --------------------------------------------- | ------------------------- |
| Authenticated Team Workspace context          | **Critical**              |
| Active OrganizationMembership                 | **Critical**              |
| Personal queue/session-user binding           | **Critical**              |
| Cross-domain projection architecture          | **Critical**              |
| No universal mutable WorkItem entity          | **Critical**              |
| Canonical Task reuse                          | **Critical**              |
| Canonical FollowUp reuse                      | **Critical**              |
| Canonical Approval reuse                      | **Critical**              |
| Meeting/Task separation                       | **Critical**              |
| Milestone/Task separation                     | **Critical**              |
| Risk/Blocker separation                       | **Critical**              |
| ClientRequest/internal Task separation        | **Critical**              |
| Notification/Work separation                  | **Critical**              |
| WorkQueueEntry as projection                  | **Critical**              |
| Typed source reference                        | **Critical**              |
| Typed Work Source Registry/adapters           | **Critical**              |
| Source-specific responsibility resolver       | **Critical**              |
| Source-specific status projection             | **Critical**              |
| Source-specific due resolver                  | **Critical**              |
| Source-specific action resolver               | **Critical**              |
| Assignment/participation separation           | **Critical**              |
| Project membership/work ownership separation  | **Critical**              |
| View/action permission separation             | **Critical**              |
| Authorization before aggregation              | **Critical**              |
| Organization/tenant isolation                 | **Critical**              |
| Multi-organization context safety             | **Critical**              |
| Source-specific mutation commands             | **Critical**              |
| No generic `completeWorkItem()`               | **Critical**              |
| Due condition/lifecycle separation            | **Critical**              |
| Priority/urgency separation                   | **Critical**              |
| Overdue/failure separation                    | **Critical**              |
| Participant-specific Approval actionability   | **Critical**              |
| Queue counts/list consistency                 | **Critical**              |
| Stable cross-source ordering                  | **Required**              |
| Cursor pagination                             | **Required at scale**     |
| Projection deduplication                      | **Critical**              |
| Event-driven invalidation/projection updates  | **Required**              |
| Idempotent projection updates                 | **Critical**              |
| Source revision/out-of-order protection       | **Critical**              |
| Reconciliation capability                     | **Required**              |
| Partial-source failure representation         | **Critical**              |
| Permission-safe caching                       | **Critical**              |
| Batched enrichment/N+1 protection             | **Critical**              |
| Materialized projection replayability if used | **Critical**              |
| Design 079 Search separation                  | **Critical**              |
| Design 080 Notification separation            | **Critical**              |
| Future Designs 095/111/113/115/116 reuse      | **Critical architecture** |

---

# 8. Consolidation

Design 078 exposes one of the largest cross-domain consolidation risks in the platform.

**Task / Personal Work conflation**
Everything in My Work becomes a Task.

**Universal WorkItem mega-entity**
Approvals, FollowUps, Meetings, Risks, Blockers and Tasks lose their domain semantics.

**WorkQueueEntry / source truth conflation**
Projection row becomes independently editable.

**Queue status / source lifecycle conflation**
One `TODO/DOING/DONE` enum is forced onto every domain.

**Generic complete action**
`completeWorkItem()` bypasses source-domain rules.

**Task / FollowUp conflation**
Sales follow-ups become generic tasks and lose follow-up semantics.

**Meeting / Task conflation**
Every calendar event becomes incomplete work.

**Meeting participation / ownership conflation**
Every attendee sees the meeting as assigned action.

**Meeting completed / FollowUp complete conflation**
Post-meeting obligations disappear.

**Approval / Task conflation**
Formal decision evidence becomes checkbox completion.

**ApprovalRequest / personal participant state conflation**
Approver who already decided still sees pending work because aggregate request remains pending.

**Approval read / decision authority conflation**
Viewer gets Approve action.

**ClientRequest / internal Task conflation**
Waiting on Client becomes employee-owned Task automatically.

**ClientRequest completion / internal follow-up completion conflation**
Employee reminder closes external dependency.

**Milestone / Task conflation**
Project checkpoint becomes mutable task row.

**Risk / Blocker conflation**
Potential exposure and active impediment share one state.

**Risk severity / Task priority conflation**
Different business signals are normalized destructively.

**Project membership / Task assignment conflation**
Every Project member receives every Project work item.

**Organization membership / personal responsibility conflation**
All organization work appears in My Work.

**Participant / assignee conflation**
Approval/Meeting participation is treated as Task assignment.

**Mention / assignment conflation**
Comment mention creates permanent work.

**Notification recipient / work owner conflation**
Every alert becomes actionable queue item.

**Notification read / work completion conflation**
Reading an alert removes canonical work.

**My Work / Notifications conflation**
Designs 078 and 080 become the same inbox.

**My Work / Search conflation**
Design 079 search results are interpreted as personal responsibility.

**Queue presence / authorization conflation**
Being assigned an inaccessible source resource bypasses permission checks.

**View / act conflation**
Visible queue entry grants source mutation permission.

**Manager visibility / impersonation conflation**
Manager can execute another person's formal action.

**User ID from browser / My Work identity conflation**
Endpoint becomes employee-work enumeration API.

**User / OrganizationMembership conflation**
Multi-organization accounts see mixed tenant data.

**Source due date / universal due date conflation**
Meeting start, approval deadline and task due date lose meaning.

**Due condition / lifecycle conflation**
Overdue becomes a Task status.

**Overdue / failed conflation**
Late work appears failed.

**Priority / urgency conflation**
Due-today normal task becomes same semantic as strategic high-priority work.

**No due date / low priority conflation**
Important undated work sinks incorrectly.

**Queue dismissal / source completion conflation**
Hiding personal presentation modifies business state.

**Reassignment / completion conflation**
Work leaving a user's queue is recorded as completed.

**Approval withdrawal / approval success conflation**
Queue item disappearing means approved.

**Partial service failure / empty queue conflation**
User is told “all caught up” while Approval service is down.

**Unavailable count / zero conflation**
Dashboard counters falsely show no work.

**Duplicate source projections**
Same Task appears twice through multiple adapters.

**Text-based deduplication**
Different legitimate business records with similar titles collapse incorrectly.

**Materialized projection / duplicate source database conflation**
My Work becomes another operational backend.

**Stale projection / current action conflation**
User acts on superseded/reassigned work.

**Out-of-order events / resurrection**
Completed Task reappears after stale assignment event.

**Global Search index / work truth conflation**
Stale search index drives critical assignments.

**Notification event / work projection conflation**
Notification retention determines task visibility.

**N+1 source enrichment**
Personal queue becomes slow as domains grow.

**Frontend cross-domain aggregation**
Browser receives broad organization data and filters it locally.

**Generic source API**
One unsafe endpoint mutates heterogeneous entities.

**078/034 duplicate Task backend**
My Work creates separate task records.

**078/015 duplicate FollowUp state**
Queue owns completion independently.

**078/029 duplicate Approval state**
Queue invents `approved=true`.

**078/080 duplicate attention engine**
Notifications and work become one inconsistent system.

**078/095/111/113/115/116 future duplication**
Later detailed work screens build separate identities because 078 prematurely flattened them.

No additional screen is required.

These are **cross-domain aggregation, responsibility, authorization, source-state preservation, personal actionability, timing semantics, projection consistency, and performance requirements**.

---

# 9. Implementation Verdict

## **PASS — CROSS-DOMAIN PERSONAL WORK AGGREGATION & ACTIONABILITY ANCHOR**

**Domain directive:**
**Task ≠ FollowUp ≠ Meeting ≠ ApprovalRequest/ApprovalParticipant ≠ ClientRequest ≠ Milestone ≠ Risk ≠ Blocker ≠ Notification ≠ PersonalWorkQueueEntry.**

**Aggregation directive:**
Design 078 is a cross-domain read/action projection over canonical source entities. It must never become a universal operational `WorkItem` backend.

**Task directive:**
Design 034 remains the single canonical Task model. A Task appearing in My Work stays the same Task.

**Source-identity directive:**
every queue entry preserves a typed canonical source reference and enough revision/context information to reauthorize and reconcile the underlying business record.

**Responsibility directive:**
“Why this is my work” is derived by source-specific responsibility resolvers: Task assignee, FollowUp owner, ApprovalParticipant, Risk owner, Blocker owner, or another governed responsibility relationship. One universal `assigneeId` model is prohibited.

**Participation directive:**
participation, assignment, ownership, watching, mention, Project membership and notification receipt remain different concepts. Only governed personal responsibility/actionability qualifies an item for My Work.

**Projection directive:**
`PersonalWorkQueueEntry` is reconstructable/source-derived. If materialized for performance, it remains replayable, revision-aware and never directly editable as business truth.

**Lifecycle directive:**
source lifecycle remains canonical. Task status, Approval state, FollowUp state, Meeting lifecycle, Risk state and Blocker state are never flattened into one generic `work.status`.

**Due directive:**
Task due dates, Approval deadlines, Meeting times, FollowUp dates and Milestone targets retain their source semantics. Design 078 may normalize them only for presentation/ranking.

**Priority directive:**
business priority, severity and time urgency remain separate. A derived personal attention rank must never rewrite source priority/severity.

**Action directive:**
Design 078 may expose the current authorized source-specific action, but execution invokes canonical source commands such as `completeTask()`, `decideApproval()` or `completeFollowUp()`. A generic `completeWorkItem()` command is prohibited.

**Approval directive:**
personal approval work is based on the current user's exact ApprovalParticipant obligation and policy sequencing, not merely the aggregate ApprovalRequest state.

**Client-dependency directive:**
ClientRequest remains an external dependency. Internal responsibility to monitor/follow up may be projected separately, but Design 078 must not silently convert every Client request into a Task.

**Authorization directive:**
queue inclusion requires both current personal relevance and source-resource visibility. Acting requires a second source-specific authorization check. Queue presence itself never grants permission.

**Principal directive:**
My Work is bound to the authenticated OrganizationMembership from session context. Browser-supplied arbitrary `userId` must never turn the screen into another employee's personal queue.

**Tenant directive:**
multi-organization Users receive work only for the active authorized workspace context unless a separately designed global account surface exists.

**Notification directive:**
Design 080 remains a separate Notification system. Notifications communicate events; Design 078 represents work. Reading/dismissing Notification never completes personal work.

**Search directive:**
Design 079 remains a separate discovery system. Search relevance never establishes assignment/actionability, and the search index is not the canonical work-responsibility engine.

**State directive:**
queue loading, empty state, source lifecycle, due condition, personal relevance, actionability and service availability remain independently modeled. Unknown source state must never become zero work or “all caught up.”

**Partial-failure directive:**
failure of one source domain returns partial queue state with source-health awareness rather than falsely removing that class of work.

**Event directive:**
canonical source events drive/invalidate personal-work projections idempotently, with source revisions/event ordering protecting against duplicate entries or resurrection of completed/reassigned work.

**Reconciliation directive:**
materialized projections, if used, should support periodic/source-triggered reconciliation against canonical state so missed events cannot permanently corrupt My Work.

**Performance directive:**
the queue should be server-aggregated through typed source adapters, batched safe enrichment, stable ranking/pagination and permission-aware caching rather than N+1 browser requests across every domain.

**Audit directive:**
Design 078 does not generate duplicate business Audit events. Actions launched from My Work remain audited by the canonical source domain.

**Future-reuse directive:**
later Designs **095, 111, 113, 115 and 116** must feed the same My Work projection using their canonical identities instead of creating alternate personal-work records.

**Responsive directive:**
desktop emphasizes rapid cross-domain scanning while retaining source identity, due condition and next action; mobile converts the heterogeneous queue into semantic cards without pretending every source is the same kind of Task.

**Overlap directive:**
Designs **015, 023, 029, 034, 047, 078, next 079–080, and later 095, 111, 113, 115–116** must share one source-derived personal-work projection layer without compromising their canonical domain entities.

**Consolidation directive:**
**STANDARDIZE ONE PERSONAL WORK PROJECTION LAYER — AUTHENTICATED ORGANIZATIONMEMBERSHIP + TYPED WORK-SOURCE ADAPTERS + SOURCE-SPECIFIC RESPONSIBILITY RESOLUTION + SOURCE-SPECIFIC STATUS/DUE/ACTION PROJECTION + EXACT SOURCE REFERENCES + PERMISSION-AWARE AGGREGATION + IDEMPOTENT EVENT/RECONCILIATION UPDATES — WHILE KEEPING TASKS, FOLLOWUPS, MEETINGS, APPROVALS, CLIENT REQUESTS, MILESTONES, RISKS, BLOCKERS AND NOTIFICATIONS AS THEIR OWN CANONICAL DOMAINS. DESIGN 078 MAY AGGREGATE THEM; IT MUST NEVER REPLACE THEM WITH A GIANT GENERIC WORKITEM MODEL.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **78 / 153** |
| **PASS**                                   |                         **78** |
| **STANDARDIZE decisions**                  |                         **76** |
| **Potential implementation-overlap flags** |                         **69** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**78 / 153 = 51.0% audited.**

### Canonical My Work architecture after Design 078

```text
                   CANONICAL SOURCE DOMAINS
                             │
       ┌──────────┬──────────┼──────────┬──────────┐
       ↓          ↓          ↓          ↓          ↓
      Task     FollowUp   Approval    Meeting    Project Work
                              │
                         ┌────┴────┐
                         ↓         ↓
                       Risk      Blocker
                             │
                             ↓
                  Work Source Adapters
                             │
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
      Responsibility      Permission     Actionability
         Resolver          Resolver         Resolver
              │              │              │
              └──────────────┼──────────────┘
                             ↓
                  PersonalWorkQueueEntry
                    READ PROJECTION ONLY
                             │
                             ↓
                       DESIGN 078
```

And the critical invariant is:

```text
My Work entry disappears
        │
        ├── source completed
        ├── source reassigned
        ├── responsibility ended
        ├── approval decided/withdrawn
        └── authorization changed

        ≠

“set generic WorkItem.completed = true”
```

The **Client Portal sequence 041–077 remains complete**, and Phase 3A.1 has now crossed the halfway point at **78 / 153**.

# Next Sequential Audit Target

## **Design 079 — Global Search / Universal Search Workspace**

The next audit must preserve the likely search boundary:

> **SearchQuery ≠ SearchResult ≠ CanonicalEntity ≠ SearchIndexDocument ≠ Authorization ≠ SavedSearch/View ≠ RecentSearch ≠ PersonalWork ≠ Navigation.**

It will need to reconcile cross-domain discovery with the canonical entities already audited while preserving:

* search result ≠ duplicate business record,
* index document ≠ canonical source entity,
* search visibility must never exceed source-resource authorization,
* stale index data must not grant access,
* result count ≠ exact global database count unless policy guarantees it,
* search relevance ≠ personal work/actionability,
* direct result opening must reauthorize the canonical source,
* no giant cross-domain “SearchEntity” backend that replaces canonical domain models.

The sequence continues strictly with **Design 079 only next**, under the unchanged audit contract.
