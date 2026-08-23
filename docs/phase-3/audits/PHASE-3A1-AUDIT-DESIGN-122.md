# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 122 — Project Retrospective / Lessons Learned

Design 122 should become the **canonical Team Workspace Project retrospective, structured lessons-learned, outcome-analysis, improvement-capture, and post-delivery learning surface** for understanding what happened during one Project and preserving useful learning without rewriting the Project’s historical truth.

It must consume the canonical Project and its finalized evidence from Designs 023 and 111–121—Tasks/Milestones, staffing/resources, Risks/Blockers, Deliverables, Approvals, Client dependencies, Change Requests, schedule variance, Activity/Audit, completion, and Handover—while preserving a strict separation between **facts that happened** and **human conclusions learned from those facts**.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **ProjectRetrospective ≠ RetrospectiveVersion/Session ≠ RetrospectiveObservation ≠ LessonLearned ≠ ImprovementProposal ≠ FollowUpTask ≠ ProjectFact ≠ ActivityEvent ≠ AuditEvent ≠ Risk/Blocker ≠ ChangeRequest ≠ PerformanceEvaluation ≠ ProjectCompletion ≠ Archive.**

The central implementation rule is:

> **A retrospective interprets Project evidence; it does not become that evidence. “The Project finished 9 days late” comes from canonical schedule/completion data. “We underestimated client review time” is a retrospective conclusion. “Require approval buffers in future templates” is an improvement proposal. If that proposal needs actual work, it becomes a canonical Task or a separately governed template/process change. Editing retrospective text must never rewrite Tasks, Risks, schedule history, Client Requests, Project completion, Handover, or Audit records.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                        |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **122**                                                                                                                                                               |
| **Canonical name**                 | **Project Retrospective / Lessons Learned**                                                                                                                           |
| **Product area**                   | Team Workspace / Projects / Learning & Continuous Improvement                                                                                                         |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                      |
| **Screen class**                   | Project Detail Variant / Post-Project Analysis & Learning Workspace                                                                                                   |
| **Classification**                 | **Canonical Project Retrospective, Structured Lesson & Improvement-Knowledge Anchor**                                                                                 |
| **Primary purpose**                | Capture evidence-linked Project observations, conclusions, lessons and improvement opportunities after or near completion without modifying canonical Project history |
| **Primary parent**                 | **Project** — Design 023                                                                                                                                              |
| **Retrospective entity**           | `ProjectRetrospective`                                                                                                                                                |
| **Retrospective revision/session** | `RetrospectiveVersion` or session/revision semantics where frozen workflow needs editing/history                                                                      |
| **Structured observation**         | `RetrospectiveObservation` / retrospective item                                                                                                                       |
| **Reusable lesson**                | `LessonLearned` where organization-level reuse is required                                                                                                            |
| **Improvement concept**            | `ImprovementProposal` / improvement recommendation                                                                                                                    |
| **Execution of improvements**      | canonical **Task** where actual work is required                                                                                                                      |
| **Canonical factual evidence**     | source-domain references                                                                                                                                              |
| **Project completion input**       | Design 120                                                                                                                                                            |
| **Final handover input**           | Design 121                                                                                                                                                            |
| **Schedule/variance input**        | Design 118                                                                                                                                                            |
| **Activity input**                 | Design 119                                                                                                                                                            |
| **Task/Milestone input**           | Design 111                                                                                                                                                            |
| **Resource/team input**            | Design 112                                                                                                                                                            |
| **Risk/Blocker input**             | Design 113                                                                                                                                                            |
| **Deliverable input**              | Design 114                                                                                                                                                            |
| **Approval input**                 | Design 115                                                                                                                                                            |
| **Client dependency input**        | Design 116                                                                                                                                                            |
| **Change-control input**           | Design 117                                                                                                                                                            |
| **Audit boundary**                 | Design 039                                                                                                                                                            |
| **Archive dependency**             | upcoming Design 123                                                                                                                                                   |
| **Search dependency**              | Design 079                                                                                                                                                            |
| **Primary query service**          | `ProjectRetrospectiveQueryService`                                                                                                                                    |
| **Retrospective service**          | `ProjectRetrospectiveService`                                                                                                                                         |
| **Evidence resolver**              | `RetrospectiveEvidenceResolver`                                                                                                                                       |
| **Lesson service**                 | `ProjectLessonService` / organizational lesson service if reusable lessons are first-class                                                                            |
| **Improvement service**            | `ProjectImprovementProposalService`                                                                                                                                   |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                       |
| **Auth**                           | Required                                                                                                                                                              |
| **Authorization**                  | Active OrganizationMembership + Project/retrospective permissions                                                                                                     |
| **Implementation priority**        | **High Historical Learning / Process Improvement / Knowledge Integrity**                                                                                              |
| **Reuse level**                    | **High across future templates, operations analysis, training, archive, search and management reporting**                                                             |

Design 122 should answer:

> **“What objectively happened on this Project, what went well or poorly, why the team believes it happened, what should be repeated or changed next time, which canonical evidence supports those conclusions, and which improvement ideas have become actual follow-up work?”**

Canonical composition:

```text
Completed / closing Project PR-100
          │
          ├── Schedule facts
          ├── Tasks / Milestones
          ├── Risks / Blockers
          ├── Change Requests
          ├── Approvals
          ├── Client dependencies
          ├── Deliverables / Handover
          └── Activity / Audit evidence
                    │
                    ↓
          RetrospectiveEvidenceResolver
                    │
                    ↓
            ProjectRetrospective
                    │
          ┌─────────┼──────────┐
          ↓         ↓          ↓
      Observation  Lesson   Improvement
          │         │          │
          └─────────┴──────┬───┘
                           ↓
                     optional Task
                for real follow-up work
```

---

# 2. Reuse

## Design 023 remains canonical Project authority

Design 122 references the exact same Project.

Do not create:

```text
RetrospectiveProject
PostMortemProject
LessonsProject
```

as duplicate Project identities.

---

## Retrospective ≠ Project Completion

Critical.

Design 120 determines whether the Project is Completed.

Design 122 evaluates and learns from what happened.

Correct:

```text
ProjectCompletionRecord
        ↓
Retrospective can consume it
```

Not:

```text
retrospective.completed = true
→ Project completed
```

---

## Retrospective may happen before or after final completion according to policy

Do not hard-code chronology unnecessarily.

Possible business flow:

```text
Delivery nearly complete
→ Retrospective drafted
→ Project completed
```

or:

```text
Project completed
→ Retrospective performed
```

The identities remain independent.

---

## Retrospective ≠ Activity Timeline

Design 119 answers:

> What happened?

Design 122 answers:

> What did we learn from what happened?

Example:

```text
Activity:
Client approval arrived 6 days late.

Retrospective:
We did not reserve enough review buffer
for executive stakeholders.
```

These are different facts.

---

## Retrospective ≠ Audit

Absolute.

Design 039 Audit is governed action evidence.

Retrospective content contains human interpretation and organizational learning.

Never use retrospective notes as compliance evidence in place of AuditEvent.

---

## Retrospective observation ≠ source fact

Critical.

Example:

```text
Canonical fact:
3 Change Requests added 12 days.

Retrospective observation:
Original discovery did not define
content scope precisely enough.
```

The second is a conclusion.

It must not replace the first.

---

## Design 118 remains schedule truth

If Retrospective says:

> Schedule variance was +9 days,

that value should come from the centralized schedule/variance resolver.

Do not manually store a competing:

```text
retrospective.delayDays = 9
```

as permanent truth unless it is a frozen snapshot with source evidence.

---

## Design 113 remains Risk/Blocker authority

Retrospective can analyze:

> Resource risk was identified too late.

It cannot:

* close Risk;
* reopen Blocker;
* change severity;
* delete Risk history.

---

## Design 117 remains Change Request authority

Retrospective can conclude:

> Too many late scope changes.

It must reference canonical ChangeRequest/Application history rather than recreating change counts manually.

---

## Design 121 remains Handover authority

Retrospective can analyze:

* delivery corrections;
* acknowledgement delays;
* superseding Handover.

It never edits handed-over versions or manifest history.

---

## Design 111 Tasks remain execution authority

If a retrospective improvement says:

> Update onboarding questionnaire template.

That statement is **not yet work execution**.

If the organization decides to act:

```text
ImprovementProposal
        ↓
Task T-300
```

TaskService owns the follow-up work.

---

## ImprovementProposal ≠ Task

Permanent.

A team can identify an improvement without committing to execute it.

---

## Lesson ≠ Improvement Proposal

Critical.

### Lesson

> Client image requirements should be locked earlier.

### Improvement Proposal

> Add an image-specification approval checkpoint to onboarding.

Related, not identical.

---

## Improvement Proposal ≠ template mutation

Absolute.

Designs 109–110 remain Project/Workflow Template authority.

A retrospective suggestion cannot directly change a published template.

---

## Improvement Proposal ≠ policy change

Likewise it cannot directly change:

* Closeout policy,
* Approval policy,
* RBAC,
* organizational settings.

Separate governed actions are required.

---

## Team retrospective ≠ employee performance review

This is one of Design 122's most important safety/architecture boundaries.

A retrospective may say:

> Design review responsibilities were unclear.

It must not automatically become:

> Employee X performed poorly.

Design 137 later handles Team Performance/Workload Analytics under its own semantics.

Project learning and employee evaluation must remain distinct.

---

# 3. Entities

## ProjectRetrospective

Stable Project-level retrospective identity.

Conceptually:

```text
ProjectRetrospective
├── id
├── organizationId
├── projectId
├── lifecycle
├── facilitator/owner?
├── startedAt?
├── finalizedAt?
├── finalizedBy?
├── retrospectivePolicy/version?
├── currentVersionId?
└── revision
```

Exact schema belongs to Phase 3D.

If the frozen design is lightweight, some of these can be simplified.

---

## One Project can normally have one canonical retrospective context

Potentially with many revisions/sessions.

Avoid accidentally creating:

```text
Retrospective 1
Retrospective 2
Retrospective 3
```

for simple edit retries.

If multiple retrospective sessions are genuinely required, model them deliberately.

---

## ProjectRetrospective ≠ RetrospectiveVersion

Where content goes through draft/final history:

```text
ProjectRetrospective R-10
├── v1 draft
├── v2 draft
└── v3 finalized
```

This preserves what was formally agreed/captured.

Do not force versioning if the frozen workflow does not need formal publication/finalization.

---

## Finalized retrospective should not be casually mutable

If retrospective is treated as organizational record:

material change after finalization should create:

* revision,
* amendment,
* correction.

Do not silently rewrite historical lessons.

---

## RetrospectiveObservation

Structured observation can represent categories such as:

* what went well;
* what did not;
* surprise;
* root cause;
* lesson;
* improvement.

Exact visible categories must follow frozen Design 122.

Do not invent them as required UI sections.

Conceptually:

```text
RetrospectiveObservation
├── id
├── retrospectiveId/versionId
├── type/category
├── statement
├── author
├── evidenceReferences[]
├── createdAt
└── revision
```

---

## Observation ≠ evidence

Permanent.

---

## EvidenceReference

Strongly recommended typed relation.

Conceptually:

```text
RetrospectiveEvidenceReference
├── retrospectiveItemId
├── sourceType
├── sourceId
├── sourceVersionId?
├── relation
└── capturedSourceRevision?
```

Possible sources:

* Task;
* Milestone;
* Risk;
* Blocker;
* Deliverable;
* ApprovalRequest;
* ClientRequest;
* ChangeRequestVersion/Application;
* CompletionRecord;
* FinalHandover;
* Activity/Audit reference where appropriate.

---

## EvidenceReference ≠ copied source state

Critical.

Retrospective should not own:

```text
taskWasLate = true
```

if source evidence already proves lateness.

---

## Evidence snapshot

If a Retrospective must remain reproducible years later, a safe evidence summary/snapshot can preserve:

* source identifier;
* exact version;
* historical label;
* relevant metric/value;
* captured timestamp.

But this remains retrospective evidence context, not the new canonical source record.

---

## LessonLearned

If lessons are meant to be reusable beyond one Project, `LessonLearned` can be first-class.

Conceptually:

```text
LessonLearned
├── id
├── organizationId
├── sourceProjectId
├── sourceRetrospectiveId
├── statement
├── category/tags
├── applicability/context
├── evidence references
├── lifecycle
├── published/finalizedAt?
└── revision
```

---

## Project lesson ≠ organization-wide doctrine automatically

Critical.

A lesson identified in one Project may be:

* provisional;
* Project-specific;
* organization-wide.

Do not automatically convert every retrospective opinion into global best practice.

---

## Lesson publication/promotion

If organization-wide reusable lessons exist:

promotion should be explicit.

Conceptually:

```text
Project observation
      ↓
Lesson candidate
      ↓ review/governance
Published organizational lesson
```

Do not invent a separate approval screen; reuse existing governance patterns if needed later.

---

## LessonLearned ≠ policy

Permanent.

Published lesson does not automatically alter process enforcement.

---

## ImprovementProposal

Conceptually:

```text
ImprovementProposal
├── id
├── retrospectiveId
├── lesson/observation reference
├── statement
├── target domain
├── owner?
├── priority?
├── lifecycle
├── linkedTaskId?
└── revision
```

Exact fields Phase 3D.

---

## Improvement Proposal lifecycle

Conceptually:

```text
PROPOSED
ACCEPTED
DECLINED
CONVERTED_TO_WORK
COMPLETED / IMPLEMENTED
```

if the frozen product needs tracking.

Do not freeze exact enum yet.

---

## Accepted improvement ≠ implemented improvement

Critical.

---

## Improvement implemented ≠ Lesson proven universally

Permanent.

An improvement can be tried without proving the lesson applies everywhere.

---

## Follow-up Task

Where real work exists:

```text
ImprovementProposal IP-10
        ↓
Task T-300
```

Preserve lineage.

---

## Task completion ≠ improvement effectiveness

Permanent.

Completing:

> Update workflow template

does not prove the change improved future outcomes.

---

## Root cause

If retrospective captures root-cause statements:

treat them as human analysis, not automatically established fact.

Potential:

```text
RootCauseAssessment
```

only if the product genuinely needs structured causal analysis.

Do not over-model speculative conclusions.

---

## Quantitative Project summary

The retrospective may show:

* planned vs actual duration;
* number of changes;
* blocker days;
* approval delay;
* deliverable revisions.

These should be read projections from canonical metrics.

Do not store manually editable duplicate metrics.

---

## Retrospective score

Avoid a generic:

```text
projectRetrospective.score = 78
```

unless the frozen design explicitly has a defined methodology.

A single arbitrary score would wrongly mix:

* schedule;
* quality;
* client;
* team;
* scope;
* finance.

---

## Sentiment ≠ performance

If comments are positive/negative, do not use sentiment as employee/team performance automatically.

---

# 4. Permissions

Design 122 should conceptually distinguish:

```text
projectRetrospective.read
projectRetrospective.create
projectRetrospective.edit
projectRetrospective.finalize

projectLesson.read
projectLesson.create
projectLesson.publish

projectImprovement.read
projectImprovement.manage

projectRetrospective.sensitiveEvidence.read
```

Exact keys belong to Phase 3D.

---

## Project read ≠ Retrospective read universally

Critical.

Retrospectives may contain:

* internal candid analysis;
* internal process failures;
* sensitive client notes;
* team/process observations.

Some Project users may need only delivery data.

---

## Retrospective read ≠ Audit read

Permanent.

---

## Retrospective edit ≠ source-domain edit

Absolute.

A person may edit a lesson without being able to:

* reopen Task;
* edit Approval;
* change ClientRequest;
* alter schedule;
* modify Handover.

---

## Finalize ≠ ordinary edit

If formal finalization exists, it should require explicit permission.

---

## Lesson publication ≠ Retrospective authoring

Potential separation.

Writing a Project lesson does not automatically authorize publishing it organization-wide.

---

## Improvement proposal ≠ Task assignment authority

If an improvement becomes a Task, TaskService permissions apply.

---

## Retrospective owner ≠ Project administrator

Permanent.

---

## Project manager ≠ employee performance administrator

Critical.

Retrospective access should not be used to bypass HR/performance permissions.

---

## Evidence deep links reauthorize

Seeing:

> Approval delay contributed to issue

does not grant access to Approval details if currently restricted.

---

## Sensitive evidence summaries

A Retrospective may safely say:

> Commercial approval delay occurred

without exposing:

* contract amount;
* billing details;
* confidential correspondence.

---

## Client access

Design 122 is an internal Team Workspace unless the frozen design explicitly says otherwise.

Do not expose candid retrospective material through Client Portal by default.

---

## Direct retrospective/item IDs reauthorize

Permanent.

---

## Cross-tenant lessons prohibited

Absolute.

---

## Organizational lessons

If lessons can be reused organization-wide:

tenant scope still applies unless an explicit higher-level/global knowledge model is deliberately introduced.

---

# 5. States

Design 122 must keep **Retrospective lifecycle, item state, lesson maturity, improvement state, source evidence availability, Project lifecycle, and implementation state** separate.

### Retrospective lifecycle

Conceptually:

```text
Not Started
Draft
In Review
Finalized
Amended
```

Exact taxonomy Phase 3D.

### Lesson state

Conceptually:

```text
Draft / Candidate
Validated / Finalized
Published / Reusable
Deprecated
```

only where reusable lessons are first-class.

### Improvement

```text
Proposed
Accepted
Declined
Converted to Work
Implemented
Unknown
```

### Evidence

```text
Available
Restricted
Unavailable
Historical
```

These must never collapse into one generic `retrospective.status`.

---

## Retrospective finalized ≠ Project completed

Absolute.

---

## Project completed ≠ Retrospective finalized

Permanent.

---

## Lesson captured ≠ improvement accepted

Permanent.

---

## Improvement accepted ≠ Task created necessarily

Permanent.

---

## Task created ≠ improvement implemented

Permanent.

---

## Task completed ≠ improvement successful

Permanent.

---

## Lesson published ≠ template changed

Absolute.

---

## Template changed ≠ lesson validated

Permanent.

---

## Evidence unavailable ≠ lesson false

Critical.

It may mean current source service is unavailable.

---

## Evidence restricted ≠ no evidence

Permanent.

---

## Source record changed later ≠ retrospective conclusion silently rewritten

Absolute.

If a factual source is corrected later:

mark evidence context/recompute derived metrics as needed.

Do not silently rewrite human conclusions.

---

## Archived Project ≠ Retrospective deleted

Important for Design 123.

---

## State Coverage

Design 122 inherits Design 150 plus:

```text
Project Retrospective Loading
Project Retrospective Available
Project Retrospective Empty
Project Retrospective Restricted
Project Retrospective Partial
Project Retrospective Unavailable

Retrospective Not Started
Retrospective Draft
Retrospective In Review
Retrospective Finalized
Retrospective Amended

Observation Draft
Observation Finalized

Evidence Available
Evidence Restricted
Evidence Unavailable
Evidence Historical
Evidence Updated / Corrected

Lesson Candidate
Lesson Finalized
Lesson Published / Reusable
Lesson Deprecated

Improvement Proposed
Improvement Accepted
Improvement Declined
Improvement Converted to Work
Improvement Implemented
Improvement State Unknown

Linked Task Open
Linked Task Completed
Linked Task Unavailable

Project Evidence Complete
Project Evidence Partial
Project Evidence Unavailable

Retrospective Updated Elsewhere
Retrospective Version Updated Elsewhere
Lesson Updated Elsewhere
Improvement Updated Elsewhere
Retrospective Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **facts → observations → lessons → improvements**, rather than presenting retrospective opinion as canonical Project status.

Conceptually:

```text
Project Retrospective
↓
Project outcome summary
   ├── schedule
   ├── key changes
   ├── major blockers
   ├── delivery / handover
   └── other frozen evidence
↓
Retrospective observations
↓
Lessons learned
↓
Improvement opportunities
↓
Follow-up work where created
```

Only frozen Design 122 sections should render.

---

## Objective evidence and human interpretation should look distinct

Example:

**Evidence**

> Final delivery was 8 days later than original baseline.

**Lesson**

> Client review buffers were too optimistic.

Do not make both look like identical database facts.

---

## Source evidence should remain inspectable

Where frozen design supports it:

> Evidence: Change Requests CR-12, CR-15; Approval A-20.

Deep links must reauthorize.

---

## Improvement work state should remain separate

Correct:

> Improvement: Add client approval buffer
> Follow-up Task: In Progress

not:

> Lesson In Progress.

---

## Finalized retrospective should appear historical/stable

If amendments are supported:

> Finalized v2 · amended after evidence correction

rather than silently changing content.

---

## Tablet

Following Design 152:

* summary evidence becomes compact cards;
* observations/lessons stack;
* evidence references collapse;
* improvement ownership/task status remains readable;
* edit/finalize controls remain deliberate.

---

## Mobile

Priority:

```text
Project outcome summary
↓
Key lessons
↓
What went well / needs improvement
↓
Evidence
↓
Improvement proposals
↓
Follow-up work
```

Avoid large spreadsheet-style retrospective matrices.

---

## Mobile evidence

Show compact:

> Evidence · 3 related Project records

with expandable source context rather than flooding the page.

---

## Accessibility

A retrospective lesson could communicate:

> Lesson L-12: client review buffers were underestimated. Evidence includes two late client approval requests and an eight-day forecast variance. The lesson has been accepted as a Project lesson. Improvement proposal IP-4 recommends adding a review buffer to future Project templates; implementation Task T-300 is still open.

where authorized canonical evidence supports it.

---

# 7. Backend Requirements

## Canonical retrospective architecture

```text
Design 122
    ↓
Authenticated Workspace Context
    ↓
ProjectRetrospectiveQueryService
    │
    ├── ProjectAdapter
    ├── CompletionAdapter
    ├── Task/MilestoneAdapter
    ├── ResourceAdapter
    ├── Risk/BlockerAdapter
    ├── Deliverable/HandoverAdapter
    ├── ApprovalAdapter
    ├── ClientRequestAdapter
    ├── ChangeRequestAdapter
    ├── ScheduleVarianceAdapter
    ├── ActivityAdapter
    └── Audit-safe EvidenceAdapter
    ↓
ProjectRetrospectiveView
```

Retrospective mutations remain separate from source-domain mutations.

---

## Create Retrospective

Conceptually:

```text
createProjectRetrospective(
    projectId,
    expectedProjectRevision,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. validate Project;
3. enforce one canonical active retrospective context where policy requires;
4. capture initial evidence baseline/references if needed;
5. create Draft retrospective;
6. emit Audit/outbox.

---

## Creation idempotency

Critical.

Retry cannot create several retrospectives for the same explicit Project retrospective intent.

---

## Retrospective eligibility

Policy may allow creation:

* near completion;
* after completion;
* after Handover.

Do not hard-code one global timing unless the product defines it.

---

## Evidence Resolver

Conceptually:

```text
RetrospectiveEvidenceResolver.resolve(projectId)
```

should produce permission-safe evidence such as:

```text
planned duration
actual duration
schedule variance
Task completion summary
Milestones
Risks/Blockers
ChangeRequest count/impact
Approval delays
ClientRequest delays
Deliverable revisions
Handover corrections
```

according to the frozen design.

---

## Central metrics reuse

Do not calculate:

```text
projectDelay
changeCount
averageApprovalDelay
```

independently inside Design 122 if canonical metric/resolver definitions already exist.

Use Design 038 metric registry/Project source services where appropriate.

---

## Evidence freshness

Include:

```text
calculatedAt
sourceRevisions
metricDefinitionVersion
```

where derived metrics matter.

---

## Completion evidence should use immutable ProjectCompletionRecord

If Project is completed:

read Design 120's CompletionRecord rather than guessing completion from current lifecycle alone.

---

## Handover evidence should use exact FinalHandover

Design 121 remains the authoritative delivery record.

---

## Evidence correction

If historical source fact is corrected:

the Retrospective can indicate:

> Evidence updated since Retrospective v1.

Do not silently mutate finalized retrospective conclusions.

---

## Add Observation

Conceptually:

```text
addRetrospectiveObservation(
    retrospectiveId,
    type,
    statement,
    evidenceReferences[],
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. validate retrospective editable;
3. validate same-Project/same-tenant evidence;
4. ensure evidence links are permission-safe;
5. persist structured item;
6. emit Audit/activity where appropriate.

---

## Evidence references validated server-side

The browser cannot attach another tenant's:

* Contract;
* Task;
* ClientRequest;
* employee profile.

---

## Free text safety

Retrospectives may contain sensitive/internal text.

Backend should support:

* authorization;
* retention;
* safe search indexing;
* no accidental Portal exposure.

---

## Finalize retrospective

Conceptually:

```text
finalizeProjectRetrospective(
    retrospectiveId,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. verify required retrospective content if any;
3. freeze/finalize exact revision;
4. preserve author/time;
5. emit Audit/outbox.

Do not mutate Project completion.

---

## Finalization idempotency

Critical.

---

## Amend finalized retrospective

If supported:

create a new version/amendment with reason.

Do not modify finalized content invisibly.

---

## Lessons

If first-class reusable lessons exist:

```text
promoteRetrospectiveItemToLesson(
    retrospectiveItemId,
    applicability,
    expectedRevision,
    idempotencyKey
)
```

should preserve:

* source Project;
* source retrospective;
* evidence lineage.

---

## Lesson promotion ≠ source deletion

The original retrospective item remains.

---

## Lesson deduplication

Do not automatically merge lessons because text looks similar.

Potential duplicate detection can assist human governance but should not destroy provenance.

---

## Improvement Proposal creation

Conceptually:

```text
createImprovementProposal(
    retrospectiveId,
    sourceObservationOrLessonId,
    proposal,
    expectedRevision,
    idempotencyKey
)
```

---

## Improvement → Task

If accepted for execution:

```text
TaskService.create(...)
```

with typed lineage:

```text
sourceType = RETROSPECTIVE_IMPROVEMENT
sourceId = IP-10
```

---

## Task creation idempotency

Repeated “Create follow-up Task” cannot create duplicates for the same execution intent.

---

## Task completion remains TaskService truth

Retrospective queries linked Task state.

It does not manually mark improvement implemented based on a checkbox if implementation depends on that Task.

---

## Template improvement

If proposal recommends changing Project/Workflow template:

use Design 109/110 services separately.

Correct:

```text
Improvement Proposal
      ↓ approved follow-up
TemplateService creates draft version
```

Not:

```text
finalize retrospective
→ edit published template
```

---

## Policy improvement

Same principle for:

* Approval policy;
* Closeout policy;
* notifications;
* permissions.

Retrospective is suggestion/learning, not configuration authority.

---

## Root-cause analysis

If the frozen design includes root-cause fields:

capture:

* author;
* confidence/qualification where useful;
* evidence references.

Do not label a human hypothesis as system-certified fact.

---

## Employee attribution

Retrospective entries should avoid becoming shadow performance records.

If an observation references an assignee:

it should describe the Project process/event.

Employee performance scoring belongs elsewhere.

---

## Sensitive people data

Do not automatically index candid retrospective comments into broad employee search/analytics.

---

## Anonymous input

Do not invent anonymous retrospective contribution unless frozen design requires it.

If supported later, anonymity must be genuine and governance-aware—not simply hide the display name while preserving easily exposed actor data.

---

## Activity integration

Design 119 may project:

```text
ProjectRetrospectiveCreated
RetrospectiveFinalized
LessonPublished
ImprovementConvertedToTask
```

Activity does not store the full retrospective as its only content.

---

## Audit

Material actions should capture:

* retrospective creation/finalization/amendment;
* lesson publication/deprecation;
* improvement promotion to work;
* sensitive administrative deletion/redaction where permitted.

---

## Search

Design 079 may index:

* lesson title/text;
* Project;
* approved/reusable tags,

subject to permissions.

Draft/internal sensitive retrospective comments should not automatically become broad searchable organizational knowledge.

---

## Search result ≠ lesson authority

Stale indexed content never determines whether a lesson is final/published.

---

## Analytics

Design 038/135–137 may consume aggregated retrospective classifications where safely defined.

Do not feed raw candid comments into employee performance scoring automatically.

---

## Retrospective analytics ≠ performance evaluation

Absolute.

---

## Archive integration

Design 123 should preserve retrospective and lessons history.

Archiving Project must not delete:

* retrospective;
* finalized lessons;
* improvement lineage;
* linked follow-up Task history.

---

## Project archive read behavior

Archived retrospective may become read-only according to policy while organization-level published lessons remain reusable.

---

## Idempotency

Required for:

* Retrospective creation;
* finalize;
* lesson promotion;
* improvement proposal;
* Task conversion;
* amendment.

---

## Optimistic concurrency

Critical.

Example:

```text
User A edits Lesson 3
User B finalizes Retrospective
```

Server must detect revision conflict rather than silently losing A's edit.

---

## Caching

Retrospective caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
retrospectiveRevision
retrospectiveVersion
lessonRevision
improvementRevision
evidence/source revisions
```

---

## Finalized retrospective can be cached strongly

But linked source current-state expansions still require appropriate freshness/authorization.

---

## Performance

Use:

* one compact Project outcome summary;
* batched evidence adapters;
* lazy source/evidence expansion;
* paginated/limited Activity history;
* reusable metrics.

Do not load full Project lifetime source records to show a retrospective summary.

---

## Partial failure contract

Example:

```text
Retrospective core   ✓
Completion evidence  ✓
Schedule metrics     ✓
Risk/Blocker         ✓
Approval metrics     ✕
Handover              ✓
```

Correct:

> Retrospective is available; approval-related evidence is currently unavailable.

Incorrect:

> No approval delays occurred.

Another:

```text
Finalized Retrospective ✓
Source Task service      ✕
```

Correct:

> Historical lesson remains available; linked Task detail is temporarily unavailable.

Not:

> Lesson has no evidence.

---

## Backend Requirement Matrix

| Requirement                                     | Status                                 |
| ----------------------------------------------- | -------------------------------------- |
| Canonical Project reuse from 023                | **Critical**                           |
| Retrospective/Project separation                | **Critical**                           |
| Retrospective/Project Completion separation     | **Critical**                           |
| Retrospective/Activity separation               | **Critical**                           |
| Retrospective/Audit separation                  | **Critical**                           |
| Observation/source fact separation              | **Critical**                           |
| Lesson/source fact separation                   | **Critical**                           |
| Lesson/ImprovementProposal separation           | **Critical**                           |
| ImprovementProposal/Task separation             | **Critical**                           |
| Improvement/Template mutation separation        | **Critical**                           |
| Improvement/policy mutation separation          | **Critical**                           |
| Retrospective/employee performance separation   | **Critical**                           |
| Typed evidence references                       | **Critical**                           |
| Exact source/version evidence where material    | **Critical**                           |
| Evidence current/unavailable distinction        | **Critical**                           |
| Evidence source reauthorization                 | **Critical**                           |
| Central metric/variance reuse                   | **Critical**                           |
| Design 111 Task/Milestone reuse                 | **Critical**                           |
| Design 112 staffing/resource reuse              | **Critical**                           |
| Design 113 Risk/Blocker reuse                   | **Critical**                           |
| Design 114 Deliverable reuse                    | **Critical**                           |
| Design 115 Approval reuse                       | **Critical**                           |
| Design 116 ClientRequest reuse                  | **Critical**                           |
| Design 117 ChangeRequest reuse                  | **Critical**                           |
| Design 118 schedule/variance reuse              | **Critical**                           |
| Design 119 Activity/Audit history reuse         | **Critical**                           |
| Design 120 CompletionRecord reuse               | **Critical**                           |
| Design 121 FinalHandover reuse                  | **Critical**                           |
| Retrospective finalization immutability         | **Critical if finalized state exists** |
| Amendment preserves prior version               | **Critical if amendment supported**    |
| Organizational lesson promotion explicit        | **Critical if reusable lessons exist** |
| Lesson/current policy separation                | **Critical**                           |
| Task conversion idempotency                     | **Critical**                           |
| Retrospective creation/finalization idempotency | **Critical**                           |
| Optimistic concurrency                          | **Critical**                           |
| Sensitive retrospective authorization           | **Critical**                           |
| Client Portal isolation                         | **Critical**                           |
| Cross-tenant evidence prohibition               | **Critical**                           |
| Search indexing permission safety               | **Critical**                           |
| Archive retention                               | **Critical architecture**              |
| Audit/outbox integration                        | **Required**                           |
| Partial dependency failure handling             | **Critical**                           |

---

# 8. Consolidation

Design 122 creates significant risk if **historical Project facts, subjective analysis, lessons, improvement work, and employee performance** are flattened into one “postmortem” document.

**Retrospective / Project conflation**
Post-project notes become Project state.

**Retrospective / Project Completion conflation**
Finalizing lessons completes Project.

**Project Completed / Retrospective complete conflation**
Retrospective becomes mandatory lifecycle automatically.

**Retrospective / Activity Timeline conflation**
Chronological facts and interpretation merge.

**Retrospective / Audit conflation**
Opinion becomes compliance evidence.

**ActivityEvent / Lesson conflation**
One event is treated as organizational learning.

**Observation / source fact conflation**
Human conclusion rewrites canonical evidence.

**Root-cause opinion / proven causality conflation**
Hypothesis is represented as verified system fact.

**Evidence summary / source record conflation**
Retrospective becomes duplicate Task/Risk/Approval data store.

**Current source state / historical evidence conflation**
Later source changes rewrite old retrospective context.

**Schedule variance / manual retrospective metric conflation**
Two different delay calculations appear.

**Planned/actual dates / retrospective text conflation**
Narrative becomes schedule authority.

**Risk lesson / RiskAssessment conflation**
Retrospective modifies historical Risk severity.

**Blocker lesson / Blocker resolution conflation**
Learning action closes issue.

**Change Request analysis / ChangeRequest state conflation**
Retrospective alters scope-change evidence.

**Deliverable lesson / Deliverable readiness conflation**
Opinion changes final output status.

**Approval feedback / ApprovalDecision conflation**
Retrospective comment becomes formal approval.

**Client-dependency analysis / ClientRequest state conflation**
“Client was slow” becomes request lifecycle truth.

**Handover analysis / FinalHandover evidence conflation**
Retrospective rewrites what Client received.

**Lesson / ImprovementProposal conflation**
Observation becomes commitment.

**ImprovementProposal / Task conflation**
Every suggestion becomes assigned work.

**Improvement accepted / implemented conflation**
Decision becomes execution.

**Task created / improvement implemented conflation**
Planned work appears complete.

**Task completed / improvement effective conflation**
Execution is assumed to have solved root cause.

**Lesson / Project Template conflation**
Learning directly edits future templates.

**Lesson / Workflow policy conflation**
Opinion changes runtime rules.

**Lesson / Approval policy conflation**
Retrospective author changes governance.

**Lesson / Closeout policy conflation**
One Project rewrites completion standards.

**Lesson / organization doctrine conflation**
One team's opinion becomes universal best practice.

**Project-specific lesson / reusable lesson conflation**
Context is lost.

**Lesson similarity / duplicate merge conflation**
Distinct evidence/provenance disappears.

**Retrospective author / Lesson publisher conflation**
Anyone can establish organization-wide guidance.

**Retrospective / employee performance review conflation**
Project process analysis becomes HR rating.

**Negative comment / low employee performance conflation**
Candid retrospective damages performance records automatically.

**Workload evidence / performance rating conflation**
High workload becomes poor performance.

**Retrospective sentiment / Team score conflation**
Text sentiment becomes KPI.

**Project manager / HR authority conflation**
Retrospective permissions bypass performance governance.

**Evidence visibility / source visibility conflation**
Sensitive Contracts/HR/finance details leak.

**Internal retrospective / Client Portal history conflation**
Candid Team analysis is exposed externally.

**Draft retrospective / finalized record conflation**
Work-in-progress lessons appear authoritative.

**Finalized retrospective / freely editable note conflation**
Historical learning changes silently.

**Amendment / overwrite conflation**
No evidence of what was originally finalized.

**Evidence unavailable / no evidence conflation**
Temporary service outage invalidates lessons.

**Evidence restricted / no evidence conflation**
Permissions create false historical gaps.

**Source correction / automatic lesson rewrite conflation**
Human conclusions change without review.

**Archived Project / deleted retrospective conflation**
Organizational learning disappears.

**Archive / lesson deprecation conflation**
Project archive makes reusable lesson invalid.

**Activity entry / retrospective item conflation**
Narrative appears twice with different ownership.

**Audit event / retrospective note conflation**
Sensitive governance data copied into free text.

**Search index / lesson truth conflation**
Stale draft appears as published lesson.

**Draft retrospective / global search indexing conflation**
Sensitive candid content leaks broadly.

**Retrospective metrics / Analytics metric definitions conflation**
Local calculations disagree with dashboards.

**Raw retrospective comments / employee analytics conflation**
Subjective comments become performance scoring input.

**Generic `Lesson` free-text array on Project**
No provenance, lifecycle, evidence, or reuse semantics.

**Generic `Retrospective JSON` blob**
No typed evidence or safe future reuse.

**Generic Retrospective mega-PATCH**
Lessons, Tasks, templates, Project state and source evidence mutate together.

**122/111 duplicate follow-up work**
Retrospective becomes Task manager.

**122/113 duplicate Risk history**
Lessons become Risk records.

**122/117 duplicate improvement/change control**
Improvement directly changes Project/process.

**122/118 duplicate metrics/schedule truth**
Retrospective owns schedule variance.

**122/119 duplicate Project history**
Narrative becomes event log.

**122/120 duplicate completion state**
Finalizing retrospective closes Project.

**122/121 duplicate delivery history**
Retrospective stores handed-over files.

**122/123 archive deletion coupling**
Archived Project loses lessons learned.

No additional screen is required.

These are **Project-learning identity, source-evidence reuse, fact/opinion separation, lesson/improvement/work separation, finalization/versioning, sensitive access, organizational knowledge promotion, employee-performance isolation, and archival-retention requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT RETROSPECTIVE, STRUCTURED LESSON & CONTINUOUS-IMPROVEMENT KNOWLEDGE ANCHOR**

**Domain directive:**
**ProjectRetrospective ≠ RetrospectiveVersion/Session ≠ RetrospectiveObservation ≠ LessonLearned ≠ ImprovementProposal ≠ FollowUpTask ≠ ProjectFact ≠ ActivityEvent ≠ AuditEvent ≠ Risk/Blocker ≠ ChangeRequest ≠ PerformanceEvaluation ≠ ProjectCompletion ≠ Archive.**

**Project directive:**
Design 023 remains canonical Project identity. Design 122 observes and learns from the Project without changing its core state.

**Completion directive:**
Design 120 remains Project completion authority. Retrospective creation/finalization never marks the Project Completed, and Project completion does not silently finalize the Retrospective.

**Handover directive:**
Design 121 remains final-delivery authority. Retrospective may analyze handover delays/corrections/acknowledgement but never modifies an issued Handover or exact delivered artifacts.

**Activity directive:**
Design 119 remains chronological factual history. Design 122 consumes those facts to create interpretation; it never becomes another Project Activity feed.

**Audit directive:**
Design 039 remains governance/security evidence. Retrospective commentary can reference Audit-safe evidence where authorized but never substitutes for an AuditEvent.

**Fact/opinion directive:**
canonical Project facts and retrospective conclusions remain structurally distinct. The platform must be able to explain, “This happened” separately from “The team believes this is why.”

**Evidence directive:**
retrospective observations and lessons use typed canonical source references and exact source/version identities where material rather than manually duplicated state.

**Evidence-snapshot directive:**
where historical reproducibility matters, a Retrospective may capture safe source labels/metrics/revisions as evidence context, but those snapshots never become new Task/Risk/Approval/Deliverable truth.

**Metric directive:**
schedule variance, Task completion, Change counts, approval delays and other quantitative summaries must reuse canonical resolvers/metric definitions. Design 122 must not invent alternate formulas.

**Schedule directive:**
Design 118 remains authoritative for planned/forecast/actual dates and schedule variance. Retrospective interpretation cannot alter them.

**Task directive:**
Design 111 remains authoritative for Project work. Retrospective action suggestions become canonical Tasks only through explicit Task creation.

**Improvement directive:**
an ImprovementProposal represents a suggested organizational/process change and remains separate from actual work, template configuration and implementation outcome.

**Implementation directive:**
accepted improvement ≠ implemented improvement. If work is required, completion is proven by canonical Task/configuration/change-management evidence.

**Lesson directive:**
a `LessonLearned`, where reusable lessons are required, preserves its source Project/Retrospective/evidence and remains distinct from policy, template configuration and universal organizational truth.

**Promotion directive:**
Project-specific insight becomes an organization-wide reusable lesson only through explicit promotion/governance. Every retrospective comment is not automatically company doctrine.

**Template directive:**
Designs 109–110 remain template authority. A retrospective improvement may initiate a template draft/change but never mutates a published template directly.

**Policy directive:**
Approval, closeout, RBAC, notification or other policies cannot be changed merely by accepting a lesson. Their canonical configuration/governance flows remain authoritative.

**Risk directive:**
Design 113 remains Risk/Blocker authority. Retrospective comments about risks do not alter severity, materialization, resolution or historical RiskAssessment evidence.

**Client-dependency directive:**
Design 116 remains ClientRequest authority. Retrospective discussion of client responsiveness does not modify request lifecycle or blame the Client when source evidence is unavailable.

**Change-control directive:**
Design 117 remains Project Change authority. Retrospective lessons may inspire future Change Requests/process changes but never rewrite historical applied scope.

**Deliverable directive:**
Design 114 remains Deliverable/artifact authority. Quality/delivery observations cannot alter exact review, Approval, release or Handover evidence.

**Approval directive:**
Design 115/029 remain formal Approval authority. Retrospective statements cannot be interpreted as ApprovalDecision evidence.

**Performance-isolation directive:**
Project Retrospective is not an employee performance-review system. Candid process observations, lesson sentiment and workload evidence must never automatically create Team-member performance ratings or disciplinary conclusions.

**Analytics directive:**
future Team Performance/Workload analytics may consume carefully governed structured operational metrics, but raw retrospective free text must not automatically feed performance scoring.

**Version directive:**
where a Retrospective can be finalized, finalized content becomes historically stable. Later material correction produces amendment/new version rather than silent overwrite.

**Finalization directive:**
finalizing a Retrospective means the learning record is finalized—not that Project lifecycle, Archive, Tasks, Deliverables or Handover have changed.

**Source-correction directive:**
later correction of canonical Project evidence may mark Retrospective evidence stale/updated, but human conclusions require explicit review rather than automatic rewriting.

**Identity directive:**
Retrospective author/facilitator, Lesson publisher, Improvement owner, Task assignee and Project owner remain distinct responsibilities.

**Authorization directive:**
Retrospective read/edit/finalize, Lesson publication, improvement management and sensitive source-evidence access remain independently server-authorized.

**Internal-visibility directive:**
Design 122 is an internal Team learning surface unless frozen requirements explicitly say otherwise. Candid Retrospective content is never reused directly in Client Portal history.

**Search directive:**
only permission-safe finalized/published lessons and appropriate Retrospective metadata should be broadly searchable. Draft/sensitive commentary is never automatically indexed as organizational knowledge.

**Idempotency directive:**
Retrospective creation, finalization, amendment, lesson promotion, improvement creation and follow-up Task conversion are replay-safe.

**Concurrency directive:**
editing, finalization, lesson promotion and amendment use expected revisions so one user cannot silently finalize while another user's changes are lost.

**Tenant directive:**
Project, Retrospective, evidence references, lessons, improvements and follow-up Tasks remain strictly tenant-scoped.

**Caching directive:**
retrospective caches vary by Project authorization, Retrospective/version, lesson/improvement and source-evidence revisions. Finalized text may be strongly cached while current linked-source expansions remain freshly authorized.

**Partial-failure directive:**
Task, schedule, Risk, Approval, Handover and other evidence services may fail independently. `Unavailable` never becomes “no problem occurred,” “no evidence,” or a rewritten lesson.

**Performance directive:**
use compact canonical outcome summaries, batched typed evidence adapters and lazy evidence/history expansion rather than loading full Project lifetime histories into every Retrospective view.

**Archive directive:**
Design 123 must retain Project Retrospective, finalized lessons, evidence lineage, Improvement proposals and linked work history when the Project is archived. Archive cannot be implemented as retrospective deletion.

**Activity directive:**
Design 119 may project Retrospective creation/finalization and lesson/improvement governance events, while source content remains in Design 122.

**Audit directive:**
Retrospective finalization/amendment, organization-level lesson publication/deprecation, sensitive redaction and improvement-to-work promotion produce appropriate actor/source-aware Audit evidence.

**Future-reuse directive:**
Design **123 — Project Archive / Completed Project Detail** must present the completed Project as an immutable/historical composition using canonical Project completion, Handover, Retrospective, Deliverable, Approval, Activity and other evidence. It must not clone those entities into an `ArchivedProject` data model or delete their source histories.

**Overlap directive:**
Designs **023, 039, 079, 111–123, 135–138** must preserve one continuous **canonical Project facts → completion/handover/activity evidence → permission-safe retrospective evidence → observations → lessons → optional improvement proposals → canonical follow-up work/configuration changes** lineage while keeping historical facts, human interpretation, organizational knowledge, employee performance and runtime Project state independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT RETROSPECTIVE & LEARNING FOUNDATION — CANONICAL PROJECT EVIDENCE REFERENCES + DISTINCT FACT/OBSERVATION/LESSON/IMPROVEMENT SEMANTICS + OPTIONAL FINALIZED RETROSPECTIVE VERSION HISTORY + EXPLICIT PROJECT-LESSON TO ORGANIZATIONAL-LESSON PROMOTION + CANONICAL TASK CONVERSION FOR REAL IMPROVEMENT WORK + CENTRAL METRIC/VARIANCE REUSE + STRICT ACTIVITY/AUDIT/PERFORMANCE SEPARATION + SENSITIVE INTERNAL VISIBILITY + ARCHIVE-PRESERVED EVIDENCE LINEAGE — AND NEVER ALLOW SUBJECTIVE POSTMORTEM TEXT, SENTIMENT, MANUAL DELAY COUNTS, LESSONS, FOLLOW-UP CHECKBOXES OR RETROSPECTIVE FINALIZATION TO SUBSTITUTE FOR OR REWRITE CANONICAL PROJECT, TASK, RISK, APPROVAL, CLIENTDEPENDENCY, CHANGE, SCHEDULE, HANDOVER, COMPLETION, EMPLOYEE-PERFORMANCE OR AUDIT TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **122 / 153** |
| **PASS**                                   |                        **122** |
| **STANDARDIZE decisions**                  |                        **120** |
| **Potential implementation-overlap flags** |                        **113** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**122 / 153 = 79.7% audited.**

### Canonical Retrospective architecture after Design 122

```text
PROJECT PR-100
      │
      ├── Completion Record
      ├── Schedule variance
      ├── Tasks / Milestones
      ├── Risks / Blockers
      ├── Approvals
      ├── Client Requests
      ├── Change Requests
      └── Final Handover
                │
                ↓
         Canonical evidence
                │
                ↓
       Project Retrospective
                │
        ┌───────┼─────────┐
        ↓       ↓         ↓
 Observation  Lesson  Improvement Proposal
                            │
                    when actual work is approved
                            ↓
                         Task
```

The strongest semantic distinction is now:

```text
FACT:
Project completed 8 days
later than baseline.

        ≠

OBSERVATION:
Client review took longer
than expected.

        ≠

LESSON:
Executive-review buffers
must be planned earlier.

        ≠

IMPROVEMENT:
Add a formal review buffer
to future workflow templates.

        ≠

IMPLEMENTATION:
Task / Template change
actually performs the work.
```

Project learning and employee evaluation also remain isolated:

```text
Retrospective:
“Design responsibilities
were unclear.”

        ≠

Employee Performance:
“Designer performed poorly.”

The first does not prove
or create the second.
```

And finalization is intentionally non-destructive:

```text
Retrospective finalized
        ≠
Project completed
        ≠
Project archived
        ≠
Template changed
        ≠
Improvement implemented.
```

Each remains a separately governed canonical fact.

## Next Sequential Audit Target

### **Design 123 — Project Archive / Completed Project Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
