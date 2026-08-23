# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 107 — Client Onboarding Checklist Detail

Design 107 should become the **canonical Team Workspace Client Onboarding instance-detail, checklist execution, dependency, responsibility, requirement, and onboarding-readiness surface** built directly on the Client Onboarding foundation established by Design 022 and the Won Deal Handoff boundary standardized in Design 106.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **ClientOnboarding ≠ OnboardingTemplate ≠ OnboardingTemplateVersion ≠ OnboardingStepDefinition ≠ OnboardingStepInstance ≠ Requirement ≠ Dependency ≠ ClientRequest ≠ Task ≠ QuestionnaireAssignment ≠ ApprovalRequest ≠ Project ≠ WonDealHandoff ≠ PortalMembership.**

The central implementation rule is:

> **A ClientOnboarding is one durable onboarding process for one exact client/project/handoff context. It must pin the exact OnboardingTemplateVersion selected at creation; instantiate its own step records; derive progress/readiness from those step instances and canonical source-domain requirements; and never rewrite itself from later template edits. Client actions, internal Tasks, Questionnaires, Approvals, files, and other dependencies may satisfy onboarding requirements, but they remain canonical entities in their own domains rather than becoming generic checklist booleans.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **107**                                                                                                                                                                                                                                                    |
| **Canonical name**                 | **Client Onboarding Checklist Detail**                                                                                                                                                                                                                     |
| **Product area**                   | Team Workspace / Clients / Onboarding / Delivery Setup                                                                                                                                                                                                     |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                                                                                                           |
| **Screen class**                   | Entity Detail / Guided Checklist / Dependency & Readiness Workspace                                                                                                                                                                                        |
| **Classification**                 | **Canonical Client Onboarding Instance, Checklist Execution & Readiness Anchor**                                                                                                                                                                           |
| **Primary purpose**                | Inspect and execute one onboarding process, understand required steps/dependencies, track client/internal responsibilities, and determine onboarding completion/readiness without duplicating Tasks, Requests, Questionnaires, Approvals, or Project state |
| **Primary entity**                 | **ClientOnboarding** — Design 022                                                                                                                                                                                                                          |
| **Template entity**                | **OnboardingTemplate**                                                                                                                                                                                                                                     |
| **Pinned definition**              | **OnboardingTemplateVersion**                                                                                                                                                                                                                              |
| **Template step definition**       | **OnboardingStepDefinition**                                                                                                                                                                                                                               |
| **Runtime checklist entity**       | **OnboardingStepInstance**                                                                                                                                                                                                                                 |
| **Requirement concept**            | **OnboardingRequirement / RequirementEvaluation**                                                                                                                                                                                                          |
| **Dependency relation**            | **OnboardingStepDependency**                                                                                                                                                                                                                               |
| **Client action dependency**       | **ClientRequest** — Design 047                                                                                                                                                                                                                             |
| **Internal work dependency**       | **Task** — Design 034                                                                                                                                                                                                                                      |
| **Questionnaire dependency**       | Designs 048 / 067                                                                                                                                                                                                                                          |
| **Approval dependency**            | Designs 029 / 052 / 115                                                                                                                                                                                                                                    |
| **Files/assets dependency**        | Designs 030 / 051 / 114                                                                                                                                                                                                                                    |
| **Project dependency**             | Design 023 / upcoming 108+                                                                                                                                                                                                                                 |
| **Client relationship dependency** | Design 021                                                                                                                                                                                                                                                 |
| **Won Deal Handoff dependency**    | Design 106                                                                                                                                                                                                                                                 |
| **Portal access dependency**       | Designs 062 / 075–077 where needed, but onboarding ≠ portal identity                                                                                                                                                                                       |
| **Primary query service**          | `ClientOnboardingDetailQueryService`                                                                                                                                                                                                                       |
| **Onboarding service**             | `ClientOnboardingService`                                                                                                                                                                                                                                  |
| **Step service**                   | `OnboardingStepService`                                                                                                                                                                                                                                    |
| **Requirement resolver**           | `OnboardingRequirementResolver`                                                                                                                                                                                                                            |
| **Progress resolver**              | `OnboardingProgressResolver`                                                                                                                                                                                                                               |
| **Readiness resolver**             | `OnboardingReadinessResolver`                                                                                                                                                                                                                              |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                                                                                                            |
| **Auth**                           | Required                                                                                                                                                                                                                                                   |
| **Authorization**                  | Active OrganizationMembership + onboarding/client/project/source-resource permissions                                                                                                                                                                      |
| **Implementation priority**        | **Critical Client Transition / Dependency Integrity / Delivery Readiness**                                                                                                                                                                                 |
| **Reuse level**                    | **Extremely High across Client, Project, Portal, Tasks, Requests, Questionnaires and Approvals**                                                                                                                                                           |

Design 107 should answer:

> **“Which exact onboarding process is this, which template version created it, what must the client and internal team still do, what is blocked by another requirement, which canonical source records satisfy each requirement, what has actually completed, and is this onboarding genuinely ready to finish?”**

Canonical structure:

```text
Won Deal Handoff H-1
        │
        ↓
ClientRelationship CR-1
        │
        ↓
ClientOnboarding ON-1
        │
        ├── pinned OnboardingTemplateVersion V3
        │
        ├── StepInstance S1
        ├── StepInstance S2
        ├── StepInstance S3
        └── StepInstance S4
                 │
        ┌────────┼───────────────┐
        ↓        ↓               ↓
 ClientRequest   Task     Questionnaire / Approval
        │        │               │
        └────────┼───────────────┘
                 ↓
       RequirementEvaluation
                 ↓
        Progress / Readiness
```

---

# 2. Reuse

## Design 022 remains the canonical Client Onboarding foundation

Design 107 must operate on the exact same:

```text
ClientOnboarding.id
```

established by Design 022.

Do not create:

```text
ClientOnboardingChecklist
OnboardingDetailRecord
WonDealOnboarding
ProjectOnboardingChecklist
```

as parallel onboarding identities.

---

## Design 106 creates or links the onboarding instance

Design 106 already established the correct flow:

```text
Deal WON
   ↓
WonDealHandoff
   ↓
ClientOnboarding created/linked
   ↓
Handoff may complete
```

Design 107 begins **after that canonical onboarding instance exists**.

---

## Handoff ≠ onboarding

Permanent.

Valid:

```text
WonDealHandoff = COMPLETED
ClientOnboarding = IN_PROGRESS
```

The Handoff was successful because it established the onboarding process.

It does not need to wait until every onboarding task is finished.

---

## Retry of Design 106 must reuse Design 107's same onboarding instance

If onboarding creation succeeded but the response was lost:

Design 106 must resolve the existing instance.

It must not create:

```text
ON-100
ON-101
ON-102
```

for the same handoff purpose.

---

## Template ≠ onboarding instance

Critical.

`OnboardingTemplate` answers:

> What reusable onboarding pattern exists?

`ClientOnboarding` answers:

> What onboarding process is actually happening for this Client/project?

---

## OnboardingTemplateVersion must be pinned

Correct:

```text
Onboarding ON-100
created from TemplateVersion V3
```

Later:

```text
TemplateVersion V4 published
```

ON-100 remains based on V3.

It does **not** silently gain new, removed, reordered, or changed steps.

---

## Template update ≠ live onboarding mutation

Absolute.

---

## Template definition ≠ runtime state

Template might define:

> Collect brand assets.

Runtime instance records:

> pending / completed / blocked for Globex onboarding.

Never store client-specific completion on the template.

---

## StepDefinition ≠ StepInstance

Permanent.

Conceptually:

```text
TemplateVersion V3
   ↓
StepDefinition SD-1
   ↓ instantiate
Onboarding ON-100
   ↓
StepInstance SI-1001
```

Changing SD-1 later cannot rewrite SI-1001.

---

## Reuse ClientRequest

If onboarding requires:

> Client uploads logo

the external dependency can be represented canonically as a `ClientRequest`.

Correct:

```text
OnboardingStepInstance
        ↓ references
ClientRequest CRQ-20
```

Not:

```text
step.clientCompleted = true
```

if the actual source-of-truth is a ClientRequest workflow.

---

## Reuse internal Task

If onboarding requires:

> Internal team verify submitted assets

that internal work remains canonical `Task`.

Onboarding can reference/aggregate it.

It does not create another task system.

---

## ClientRequest ≠ Task

Design 047/034 boundary remains strict:

> We ask Client → ClientRequest
> Team needs to work → Task

Design 107 must not collapse both into “checklist item.”

---

## Reuse Questionnaire domain

If onboarding requires completion of a Questionnaire:

```text
OnboardingStepInstance
        ↓ requirement
QuestionnaireAssignment QA-10
```

Questionnaire progress/submission remains canonical Designs 048/067.

---

## Questionnaire submitted ≠ onboarding step necessarily complete

The step may require:

* Questionnaire submitted,
* then reviewed,
* or additional prerequisite,

depending on its Requirement policy.

Completion must go through the onboarding requirement resolver.

---

## Reuse Approval domain

If a step depends on Approval:

```text
OnboardingRequirement
       ↓
ApprovalRequest
```

Approval state remains canonical Design 029.

Do not duplicate:

```text
step.approved = true
```

as independent truth.

---

## Reuse Files/Assets

Uploaded files remain canonical Assets/FileVersions.

An onboarding requirement may reference:

> required Asset exists and is accepted/released.

The file itself does not become an OnboardingStep.

---

## Reuse Project domain

Design 023 remains canonical Project.

Onboarding can be:

* client-level,
* project-related,

according to the frozen product model.

But Project status and Onboarding status remain independent.

---

## Onboarding completed ≠ Project started

Permanent.

---

## Project started ≠ onboarding completed

Permanent.

Different businesses may allow overlap.

The dependency must be policy-driven rather than inferred from visual sequence.

---

## Reuse Portal identity/access foundation

If a client must access Portal to complete requests:

Portal Membership is an access prerequisite.

It is not Onboarding identity.

Correct:

```text
PortalMembership active
        ↓ enables
ClientRequest / Questionnaire interaction
```

Not:

```text
PortalMembership active
→ onboarding complete
```

---

# 3. Entities

## ClientOnboarding

`ClientOnboarding` is the stable runtime process identity.

Conceptually:

```text
ClientOnboarding
├── id
├── organizationId
├── clientRelationshipId
├── projectId? / context
├── sourceHandoffId?
├── onboardingTemplateVersionId
├── lifecycle
├── startedAt
├── completedAt
├── owner/context
├── revision
└── source lineage
```

Exact schema belongs to Phase 3D.

---

## ClientOnboarding ≠ ClientRelationship

Permanent.

A Client relationship can survive many onboarding/delivery cycles.

---

## One ClientRelationship ≠ exactly one onboarding forever

Important.

A repeat client may require:

* initial relationship onboarding,
* later project-specific onboarding,
* new-service onboarding.

Do not enforce global:

```text
UNIQUE(clientRelationshipId)
```

unless the final business policy truly requires it.

Uniqueness should be contextual, for example around:

```text
sourceHandoff / Project / onboarding purpose
```

as finalized in Phase 3D.

---

## ClientOnboarding ≠ Project

Permanent.

---

## ClientOnboarding ≠ WonDealHandoff

Permanent.

---

## OnboardingTemplate

Stable reusable configuration identity.

Conceptually:

```text
OnboardingTemplate
├── id
├── organizationId
├── name
├── lifecycle
├── currentPublishedVersionId
└── revision
```

---

## OnboardingTemplate ≠ OnboardingTemplateVersion

Permanent.

---

## OnboardingTemplateVersion

The exact frozen definition instantiated into an onboarding process.

Conceptually:

```text
OnboardingTemplateVersion
├── id
├── templateId
├── version
├── StepDefinition[]
├── dependency definition
├── requirement policy
├── publishedAt
└── immutable definition
```

---

## Published TemplateVersion should be immutable

Once used to instantiate onboarding:

changing it would rewrite historical process definitions.

Future changes create another TemplateVersion.

---

## OnboardingStepDefinition

Describes reusable step semantics.

Conceptually:

```text
OnboardingStepDefinition
├── id
├── templateVersionId
├── stable key
├── label/description
├── responsibility type
├── requirement definition
├── dependency definition
├── ordering/presentation
└── completion policy
```

---

## Step label ≠ Step identity

Renaming:

> Upload Assets

to:

> Submit Brand Assets

must not destroy historical identity.

Use stable IDs/keys.

---

## Step order ≠ Step identity

Permanent.

Reordering future TemplateVersion does not rewrite existing instances.

---

## OnboardingStepInstance

Runtime instance for one onboarding.

Conceptually:

```text
OnboardingStepInstance
├── id
├── clientOnboardingId
├── stepDefinitionId
├── templateVersionId
├── lifecycle/state
├── responsible party/context
├── dueAt?
├── startedAt?
├── completedAt?
├── completion evidence/reference
├── revision
└── override/supersession lineage
```

---

## StepInstance ≠ Task

Critical.

A step may **reference** Task T-100.

It does not become T-100.

---

## StepInstance ≠ ClientRequest

Permanent.

---

## StepInstance ≠ QuestionnaireAssignment

Permanent.

---

## StepInstance ≠ ApprovalRequest

Permanent.

---

## Step state can be derived or controlled depending on step type

There are conceptually two categories:

### Source-driven step

Completion comes from another canonical entity:

```text
Questionnaire submitted
Approval approved
ClientRequest completed
```

### Manual onboarding step

Completion may be directly recorded within the onboarding domain if it genuinely has no separate source entity.

Do not create fake Tasks/Requests for every simple checklist item.

Likewise, do not reduce real source-domain workflows to booleans.

---

## Requirement

`OnboardingRequirement` describes what must be true for a step to satisfy its completion/readiness condition.

Conceptually:

```text
OnboardingRequirement
├── stepInstance/definition context
├── requirementType
├── source reference
├── required state
├── optionality
└── policy/version context
```

---

## Requirement ≠ Dependency

Important.

### Requirement

> Questionnaire must be submitted.

### Dependency

> Step B cannot start until Step A completes.

These are different constraints.

---

## RequirementEvaluation

Should be a derived/current evaluation:

```text
RequirementEvaluation
├── requirementId
├── result
├── evaluatedAt
├── source revision
├── freshness
└── reason
```

---

## Requirement result ≠ source entity state

A requirement can evaluate:

> SATISFIED

because canonical ApprovalRequest is Approved.

But the ApprovalRequest remains the source truth.

---

## Requirement unknown ≠ failed

Critical.

If Approval service is unavailable:

```text
Requirement = UNKNOWN / UNAVAILABLE
```

not:

```text
FAILED
```

---

## Dependency

Explicit step dependency should conceptually be:

```text
OnboardingStepDependency
├── predecessorStep
├── successorStep
├── dependency condition
└── policy
```

---

## Dependency ≠ visual ordering

Critical.

Step A appearing above Step B does not necessarily mean B is blocked by A.

Only explicit dependency relations create execution constraints.

---

## Dependency graph needs cycle prevention

A template must not publish:

```text
A depends on B
B depends on C
C depends on A
```

unless the engine has explicit semantics for such cycles—which onboarding checklist architecture generally should reject.

---

## Blocked ≠ incomplete

Permanent.

A step may be incomplete but immediately actionable.

Another may be incomplete because a prerequisite blocks it.

---

## Responsibility

Responsibility might represent conceptually:

* Client,
* internal Team,
* system/external dependency.

But responsibility ≠ authorization.

---

## Assigned Team member ≠ permission

Design 034/036/037 boundaries persist.

A user responsible for completing/reviewing a step cannot automatically access every Client/Project resource referenced by it.

---

## Client responsibility ≠ PortalMembership

A step can be client-owned even before portal activation, but it cannot be actioned through Portal until an authorized client identity exists.

---

## Due date

Step due dates can be:

* template-relative,
* calculated at onboarding instantiation,
* manually adjusted if policy permits.

Once instantiated, later template changes must not silently alter historical due dates.

---

## Due date ≠ completion deadline source always

Exact SLA/escalation semantics belong to policy.

---

## Overdue

Derived:

```text
current time > dueAt
AND step still actionable/incomplete
```

subject to policy.

---

## Overdue ≠ blocked

Permanent.

---

## Overdue ≠ failed

Permanent.

---

## Completion

Step completion should preserve:

* completedAt,
* actor/system,
* source evidence,
* exact source version where relevant.

---

## Complete ≠ Approved

Permanent.

A step titled “Review assets” may complete after internal review, but formal Approval remains a different entity where required.

---

## Step completion correction/reopen

If policy allows reopening:

do not erase previous completion.

Conceptually preserve:

```text
Completed
↓
Reopened
↓
Completed again
```

through state history/events.

---

## Reopened step ≠ onboarding reset

Permanent.

---

## Optional step ≠ completed step

Critical.

An optional/skipped/not-required step should not be falsely displayed historically as “completed.”

Maintain distinct semantics such as:

```text
NOT_REQUIRED
SKIPPED
COMPLETED
```

where applicable.

---

## Progress

Progress must be derived centrally.

Do not store manually:

```text
onboarding.progress = 75
```

as editable truth.

---

## Progress numerator/denominator need policy

For example:

* required steps only,
* weighted vs unweighted,
* optional steps excluded.

One canonical resolver must serve all surfaces.

---

## 4 of 5 steps ≠ 80% automatically if weighted policy exists

Exact calculation belongs to Phase 3D.

The architecture must support centralized semantics.

---

## Progress ≠ Readiness

Critical.

Example:

```text
Progress = 90%
Readiness = BLOCKED
```

because the remaining 10% contains a mandatory legal/asset requirement.

---

## Readiness

`OnboardingReadinessResolver` answers:

> Can this onboarding be considered complete/ready under the pinned policy?

It should evaluate:

* required StepInstances,
* RequirementEvaluations,
* dependencies,
* unresolved exceptions,
* required approvals/client actions.

---

## Ready ≠ completed

Permanent.

A readiness check can return:

> ready to complete

before an explicit completion command occurs.

---

## Completion ≠ Project readiness universally

Permanent.

Onboarding completion can feed another Project gate.

It does not automatically move Project stage unless explicit Project-domain policy acts.

---

## ClientOnboarding lifecycle

Conceptually:

```text
NOT_STARTED
IN_PROGRESS
BLOCKED
READY_TO_COMPLETE
COMPLETED
CANCELLED
ARCHIVED
```

Exact enums Phase 3D.

---

## Lifecycle ≠ progress percentage

Permanent.

---

# 4. Permissions

Design 107 should conceptually distinguish:

```text
clientOnboarding.read
clientOnboarding.start
clientOnboarding.complete
clientOnboarding.cancel

onboardingStep.read
onboardingStep.completeManual
onboardingStep.reopen
onboardingStep.override

clientRequest.read
clientRequest.create/manage

task.read
task.create/manage

questionnaire.read
approval.read
asset.read

onboardingTemplateContext.read
```

Exact permission names belong to Phase 3D.

---

## Onboarding read ≠ step completion

Permanent.

---

## Step completion ≠ onboarding completion

Critical.

A user allowed to complete one assigned step need not be able to close the whole onboarding.

---

## Task assignee ≠ onboarding administrator

Permanent.

---

## ClientRequest owner ≠ onboarding override authority

Permanent.

---

## Project access ≠ onboarding edit authority

Permanent.

---

## Client access ≠ all onboarding source-resource access

Section-level source authorization is required.

---

## Onboarding administrator ≠ Approval authority

Critical.

They cannot force:

```text
ApprovalRequest = APPROVED
```

from Design 107.

---

## Onboarding override ≠ source-domain override

If an authorized onboarding override exists, it can affect the requirement resolution under explicit policy.

It must not rewrite:

* Questionnaire response,
* Approval decision,
* ClientRequest,
* Task,
* File evidence.

---

## Override requires special authority

If the product supports it:

```text
clientOnboarding.overrideRequirement
```

should be separate from normal step completion.

---

## Override must preserve reason/evidence

Never a hidden boolean bypass.

---

## Client action authorization remains Portal/domain-specific

Team user cannot impersonate the Client to complete:

* Questionnaire,
* approval,
* client request,

unless the underlying source domain explicitly supports an internal administrative action.

---

## Assignment ≠ authorization

Permanent.

---

## Direct Onboarding ID reauthorizes

Knowing ID grants nothing.

---

## Direct StepInstance ID reauthorizes

Permanent.

---

## Direct source-resource ID reauthorizes

Permanent.

---

## Cross-tenant source references prohibited

Absolute.

A ClientOnboarding in Organization A cannot reference:

* Task,
* ClientRequest,
* QuestionnaireAssignment,
* ApprovalRequest,
* Project

from Organization B.

---

# 5. States

Design 107 must keep **Onboarding lifecycle, StepInstance state, requirement state, dependency/block state, responsibility, due condition, source-action state, progress, and completion readiness** independent.

### Onboarding lifecycle

Conceptually:

```text
Not Started
In Progress
Blocked
Ready to Complete
Completed
Cancelled
Archived
```

### Step state

```text
Not Started
Available
In Progress
Blocked
Completed
Skipped / Not Required
Reopened
Needs Attention
```

### Requirement evaluation

```text
Not Evaluated
Unsatisfied
Satisfied
Partially Satisfied
Unknown
Unavailable
Overridden
```

### Dependency state

```text
Unblocked
Blocked
Dependency Unknown
```

### Due condition

```text
No Due Date
Not Due
Due Soon
Due Today
Overdue
```

### Readiness

```text
Not Ready
Ready
Blocked
Unknown
```

These must never collapse into one generic onboarding status.

---

## Not started ≠ blocked

Permanent.

---

## Blocked ≠ failed

Permanent.

---

## Incomplete ≠ overdue

Permanent.

---

## Overdue ≠ blocked

Permanent.

---

## ClientRequest sent ≠ ClientRequest completed

Permanent.

---

## Questionnaire draft ≠ submitted

Permanent.

---

## Questionnaire submitted ≠ reviewed

Permanent where review matters.

---

## Approval pending ≠ onboarding requirement failed

Permanent.

It is simply unsatisfied/pending.

---

## Approval rejected ≠ onboarding cancelled automatically

Critical.

It may block or require corrective action.

The Onboarding lifecycle remains separately governed.

---

## Task completed ≠ step completed universally

If a step has multiple requirements:

```text
Task complete ✓
Client asset received ✕
```

Step remains incomplete.

---

## All visible checkboxes complete ≠ onboarding complete automatically

Critical.

The backend readiness resolver must consider canonical required state, not browser representation.

---

## Ready to Complete ≠ Completed

Permanent.

---

## Completed ≠ Project completed

Absolute.

---

## Completed ≠ Handoff completed retroactively

Design 106 handoff may already have completed earlier.

---

## Completed ≠ Portal membership active

Permanent.

---

## Source service unavailable ≠ requirement failed

Absolute.

---

## Source service unavailable ≠ requirement satisfied

Absolute.

---

## Step state unknown ≠ not started

Permanent.

---

## Optional/not-required ≠ completed

Permanent.

---

## Template changed ≠ onboarding stale automatically

Existing onboarding is intentionally pinned to its exact TemplateVersion.

---

## State Coverage

Design 107 inherits Design 150 plus:

```text
Onboarding Loading
Onboarding Available
Onboarding Restricted
Onboarding No Longer Accessible
Partial Onboarding Detail Available

Onboarding Not Started
Onboarding In Progress
Onboarding Blocked
Onboarding Ready to Complete
Onboarding Completed
Onboarding Cancelled
Onboarding Archived

Step Not Started
Step Available
Step In Progress
Step Blocked
Step Completed
Step Reopened
Step Skipped
Step Not Required
Step Needs Attention

Requirement Not Evaluated
Requirement Unsatisfied
Requirement Partially Satisfied
Requirement Satisfied
Requirement Unknown
Requirement Unavailable
Requirement Overridden

Dependency Satisfied
Dependency Blocked
Dependency State Unknown

Step Not Due
Step Due Soon
Step Due Today
Step Overdue
Step Due State Unknown

Client Request Pending
Client Request Completed
Client Request Service Unavailable

Task Pending
Task Completed
Task Service Unavailable

Questionnaire Pending
Questionnaire Submitted
Questionnaire Service Unavailable

Approval Pending
Approval Approved
Approval Rejected
Approval Service Unavailable

Asset Requirement Missing
Asset Requirement Satisfied
Asset Service Unavailable

Progress Available
Progress Stale
Progress Unavailable

Readiness Not Ready
Readiness Ready
Readiness Blocked
Readiness Unknown

Onboarding Updated Elsewhere
Step Updated Elsewhere
Source Requirement Updated Elsewhere
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **what is required, who owns it, what blocks it, and which canonical source proves completion**.

Conceptually:

```text
Client Onboarding
↓
Client / Project context
↓
Template/version context
↓
Progress + readiness
↓
Checklist
   ├── Step
   ├── responsibility
   ├── requirement
   ├── dependency
   ├── due state
   ├── source state
   └── allowed action
↓
Exceptions / blocked requirements
↓
Completion history
```

Only frozen Design 107 elements should render.

---

## Progress and readiness need separate presentation

Correct:

> Progress: 80%
> Readiness: Blocked — Contract asset still required

Not:

> 80% complete

if a mandatory requirement prevents completion.

---

## Client-owned and Team-owned work should be visibly distinguishable

Where frozen UI supports responsibility:

```text
Client action
Internal team action
System/external dependency
```

should not appear as identical checkboxes.

---

## Source-driven steps should expose source semantics

Example:

> Questionnaire — Submitted

rather than:

> Checklist item checked.

---

## Blocked step should explain dependency

Where authorized:

> Blocked until Company Profile questionnaire is submitted.

Avoid unexplained disabled controls.

---

## Overdue and blocked must not share one visual state

A step can be:

> Blocked but not overdue

or:

> Available and overdue.

---

## Version context should remain available

The implementation should be capable of communicating:

> Onboarding created from Template v3

particularly for troubleshooting/history.

---

## Tablet

Following Design 152:

* progress/readiness remain top-level,
* checklist rows stack,
* responsibility/dependency become compact metadata,
* source actions remain touch-safe,
* detailed evidence can collapse.

---

## Mobile

Priority:

```text
Client / Project
↓
Progress
↓
Readiness
↓
Next actionable step
↓
Client-owned actions
↓
Internal actions
↓
Blocked / overdue items
↓
Completed items
```

Do not compress a wide checklist grid horizontally.

---

## Mobile next-action logic

If the frozen design presents a next action, it should come from a centralized resolver.

Do not assume:

> first incomplete step = next step.

A first incomplete step may be blocked while a later step is actionable.

---

## Accessibility

An onboarding detail could communicate:

> Globex onboarding is 75 percent complete but not ready to finish. Six of eight required steps are satisfied. Brand assets are awaiting client submission. Internal account setup is blocked until those assets arrive. One internal review task is overdue.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical onboarding detail architecture

```text
Design 107
    ↓
Authenticated Workspace Context
    ↓
ClientOnboardingDetailQueryService
    │
    ├── ClientOnboardingAdapter
    ├── TemplateVersionAdapter
    ├── StepInstanceAdapter
    ├── RequirementAdapter
    ├── DependencyAdapter
    ├── ClientRequestAdapter
    ├── TaskAdapter
    ├── QuestionnaireAdapter
    ├── ApprovalAdapter
    ├── AssetAdapter
    ├── ProjectAdapter
    ├── ProgressResolver
    └── ReadinessResolver
    ↓
ClientOnboardingDetailView
```

This is a read composition.

---

## Onboarding instantiation

The canonical creation operation belongs to Design 022/106 services.

Conceptually:

```text
createClientOnboarding(
    clientRelationshipId,
    projectId?,
    sourceHandoffId?,
    onboardingTemplateVersionId,
    idempotencyKey
)
```

should:

1. authorize/policy-check;
2. validate ClientRelationship;
3. validate Project/context where applicable;
4. validate exact TemplateVersion;
5. create stable `ClientOnboarding`;
6. instantiate StepInstances from exact StepDefinitions;
7. instantiate dependency/requirement references;
8. calculate initial due/context values;
9. preserve source lineage;
10. emit Audit/outbox.

---

## Creation idempotency

Critical.

Retry from Design 106 must return the same intended ClientOnboarding.

---

## Template snapshot/pinning

`ClientOnboarding` must store exact:

```text
onboardingTemplateVersionId
```

and instantiated runtime step definitions/references as required for historical independence.

Never:

```text
templateId → latest version
```

during normal onboarding reads.

---

## Runtime onboarding should survive template deletion/archive

Historical process remains usable/reconstructable.

---

## Step instance generation atomicity

Creation should never produce:

```text
Onboarding exists
but half its required StepInstances are missing
```

without a detectable/recoverable initialization state.

Prefer transactionally creating the core onboarding + runtime steps within the onboarding domain.

---

## Dependency validation at template publication

Before TemplateVersion can be used:

* referenced step IDs exist,
* no illegal cycles,
* requirements are valid,
* source-type configuration is valid.

Do not discover structural template corruption only after a client handoff.

---

## Step completion service

For genuinely onboarding-owned manual steps:

```text
completeManualStep(
    onboardingId,
    stepInstanceId,
    expectedStepRevision,
    evidence?,
    idempotencyKey
)
```

should:

1. authorize;
2. validate step belongs to onboarding;
3. validate step is manually completable;
4. validate dependencies;
5. validate required evidence;
6. append/record completion;
7. recompute progress/readiness;
8. emit event/Audit.

---

## Source-owned step cannot be manually completed

Critical.

If completion source is:

```text
ApprovalRequest
```

then:

```text
completeManualStep()
```

must reject.

The source state must satisfy the Requirement.

---

## “Check every box” API prohibited

Do not implement:

```text
PATCH /onboarding/:id
{
  steps: [
    { id: 1, completed: true },
    { id: 2, completed: true }
  ]
}
```

for heterogeneous source-driven steps.

It bypasses source-domain invariants.

---

## Requirement resolver

Conceptually:

```text
OnboardingRequirementResolver.evaluate(
    onboardingId,
    stepInstanceId
)
```

should resolve typed requirements via source adapters.

Examples:

```text
ClientRequestRequirementAdapter
TaskRequirementAdapter
QuestionnaireRequirementAdapter
ApprovalRequirementAdapter
AssetRequirementAdapter
```

---

## Requirement evaluation needs source revision/freshness

If source changes after evaluation:

cached requirement state should invalidate/recompute.

---

## Unknown source result fails safe

If a mandatory requirement cannot be evaluated:

readiness becomes:

```text
UNKNOWN / BLOCKED
```

according to policy.

Never silently satisfied.

---

## Requirement adapters ≠ duplicated source-domain logic

Example:

Questionnaire adapter asks canonical Questionnaire service:

> is assignment submitted/accepted?

It should not recalculate questionnaire validity from copied JSON.

---

## Progress resolver

Use one canonical:

```text
OnboardingProgressResolver
```

for:

* Design 107,
* Client 360,
* Project summaries,
* dashboards,
* Portal projections where applicable.

---

## Progress must be reconstructable

A materialized `progressPercent` is acceptable as cache/projection only.

Canonical truth remains steps/requirements.

---

## Progress zero ≠ unavailable

Permanent.

---

## Readiness resolver

Conceptually:

```text
OnboardingReadinessResolver.resolve(onboardingId)
```

should evaluate:

* required steps,
* requirement state,
* dependencies,
* waived/optional semantics,
* blocking exceptions.

It returns typed reasons.

---

## Readiness reason codes

Prefer structured:

```text
QUESTIONNAIRE_REQUIRED
CLIENT_ASSET_MISSING
APPROVAL_PENDING
BLOCKING_STEP_INCOMPLETE
SOURCE_UNAVAILABLE
```

rather than free-text-only backend logic.

UI maps them to copy.

---

## Complete onboarding command

Conceptually:

```text
completeClientOnboarding(
    onboardingId,
    expectedOnboardingRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. reload canonical onboarding;
3. evaluate fresh readiness;
4. reject if not ready;
5. atomically mark lifecycle completed;
6. set completion evidence/time;
7. emit `ClientOnboardingCompleted`;
8. trigger downstream projections/events.

---

## Frontend cannot declare readiness

Absolute.

---

## Completion idempotency

Repeated complete action must return the already-completed result, not create duplicate completion events/effects.

---

## Completion event ≠ Project transition directly

`ClientOnboardingCompleted` can invalidate/evaluate a Project gate.

An explicit Project-domain command/policy owns any Project state change.

---

## Reopening onboarding

If supported:

use explicit command with:

* authority,
* reason,
* history.

Do not simply clear:

```text
completedAt = null
```

and erase previous completion.

---

## Step reopen

Same principle.

---

## Override/waiver

If business allows exceptional waiver:

conceptually:

```text
overrideOnboardingRequirement(
    requirementId,
    reason,
    expectedRevision
)
```

must:

* require elevated permission,
* identify exact requirement,
* preserve source state unchanged,
* record actor/reason/evidence,
* affect requirement resolution only under policy,
* create Audit evidence.

---

## Waiver ≠ source completion

Critical.

Example:

```text
ApprovalRequest = REJECTED
Onboarding requirement = OVERRIDDEN
```

could be distinguishable if policy permits.

Never rewrite Approval to Approved.

---

## Due date calculation

When template uses relative schedules:

calculate concrete StepInstance due dates at onboarding creation or specified anchor events.

Preserve exact scheduling basis.

---

## Template due date change ≠ existing step due date change

Permanent.

---

## Due date update

If manual adjustment is allowed:

record actor/reason/history.

Do not silently overwrite planned schedule.

---

## ClientRequest creation

If a StepDefinition requires a ClientRequest:

creation must use canonical ClientRequest service and be idempotently linked to the StepInstance.

---

## ClientRequest retry

Do not send/create duplicate requests on worker/network retry.

Use stable:

```text
onboardingId + stepInstanceId + requestPurpose
```

or equivalent idempotency lineage.

---

## Task creation

Same pattern:

```text
OnboardingStep
      ↓
canonical Task
```

Idempotent source linkage.

---

## Questionnaire assignment

Likewise:

```text
OnboardingStep
      ↓
canonical QuestionnaireAssignment
```

exact QuestionnaireVersion pinned by its own domain.

---

## Approval creation

Likewise:

```text
OnboardingStep
      ↓
ApprovalRequest
```

exact subject/version according to Approval engine.

---

## Source-event integration

Canonical source events can invalidate onboarding requirement/progress projections:

```text
ClientRequestCompleted
TaskCompleted
QuestionnaireSubmitted
ApprovalResolved
AssetReceived
```

---

## Eventual consistency

Progress/readiness projections may refresh asynchronously.

But the **complete onboarding command must perform a fresh authoritative readiness evaluation** before committing.

---

## Race condition

Example:

```text
UI shows all steps ready.
Before click:
Approval is withdrawn.
```

Server completion must fail/reload.

Never trust stale UI readiness.

---

## Onboarding concurrency

Two users completing/reopening the same manual step must use expected revision/idempotency semantics.

---

## Dependency race

If predecessor becomes incomplete/reopened while successor action is occurring:

server should revalidate the dependency at mutation time.

---

## Client Portal projection

If clients can see onboarding-related actions through Portal:

they should receive safe projections based on:

* ClientRequest,
* Questionnaire,
* Files,
* Approvals,

not internal Team notes/tasks.

Design 107 remains internal Team detail unless frozen design indicates otherwise.

---

## Internal notes/comments

If present in frozen Design 107, reuse canonical contextual comment/activity patterns.

Do not store internal notes inside client-visible source entities.

---

## Activity

Useful events:

```text
ClientOnboardingStarted
OnboardingStepStarted
OnboardingStepCompleted
OnboardingStepReopened
OnboardingRequirementSatisfied
OnboardingRequirementOverridden
ClientOnboardingReady
ClientOnboardingCompleted
ClientOnboardingCancelled
```

Activity remains projection.

---

## Audit

Material actions should include:

* onboarding creation,
* template/version selection,
* manual step completion,
* step reopen,
* requirement override,
* due-date changes,
* onboarding completion/cancellation.

System-derived progress recomputations do not need noisy human Audit entries each time.

---

## Notification integration

Design 080 may notify:

* client action overdue,
* onboarding blocked,
* onboarding ready,
* requirement source failed,

under notification policy.

Notification state never changes onboarding.

---

## My Work integration

Design 078 can project:

* assigned Tasks,
* approval responsibilities,
* manual onboarding actions.

It must not introduce another checklist entity.

---

## Search integration

Design 079 may index safe:

* Client onboarding name/context,
* Client,
* Project,
* lifecycle,

but Search does not calculate progress/readiness.

---

## Caching

`ClientOnboardingDetailView` caches should vary by:

```text
organizationMembershipId
clientOnboardingId
authorizationRevision
onboardingRevision
stepRevision aggregate
requirement/source revisions
project/client revisions
```

---

## Progress cache invalidation

Events from source domains must invalidate/recompute affected onboarding projections.

---

## Performance

Use:

* one onboarding/step query,
* batched source references by type,
* aggregated progress/readiness,
* lazy Activity/Audit history,
* no N+1 call per checklist row.

---

## Partial failure contract

Example:

```text
Onboarding core       ✓
Step instances        ✓
ClientRequest service ✓
Task service          ✓
Questionnaire service ✕
Approval service      ✓
Asset service         ✓
```

Correct:

> Onboarding available. Questionnaire-dependent requirement cannot currently be evaluated. Overall readiness unknown/blocked according to policy.

Incorrect:

> Questionnaire incomplete.

And certainly not:

> 100% complete.

---

## Backend Requirement Matrix

| Requirement                                            | Status                     |
| ------------------------------------------------------ | -------------------------- |
| Canonical ClientOnboarding reuse from 022              | **Critical**               |
| Design 106 Handoff-created instance reuse              | **Critical**               |
| Handoff/Onboarding separation                          | **Critical**               |
| ClientOnboarding/ClientRelationship separation         | **Critical**               |
| ClientOnboarding/Project separation                    | **Critical**               |
| Template/instance separation                           | **Critical**               |
| Template/TemplateVersion separation                    | **Critical**               |
| Exact TemplateVersion pinning                          | **Critical**               |
| Published TemplateVersion immutability                 | **Critical**               |
| StepDefinition/StepInstance separation                 | **Critical**               |
| Stable StepDefinition identity                         | **Critical**               |
| Runtime step instantiation consistency                 | **Critical**               |
| Template edit does not rewrite active onboarding       | **Critical**               |
| Step/Task separation                                   | **Critical**               |
| Step/ClientRequest separation                          | **Critical**               |
| Step/QuestionnaireAssignment separation                | **Critical**               |
| Step/ApprovalRequest separation                        | **Critical**               |
| Step/Asset separation                                  | **Critical**               |
| Requirement/Dependency separation                      | **Critical**               |
| Dependency cycle prevention                            | **Critical**               |
| Explicit dependency ≠ visual order                     | **Critical**               |
| Source-owned/manual-step distinction                   | **Critical**               |
| Source-owned steps cannot be manually checked complete | **Critical**               |
| Typed Requirement adapters                             | **Critical**               |
| Requirement freshness/source revision                  | **Critical**               |
| Unknown requirement/failure separation                 | **Critical**               |
| Centralized Progress resolver                          | **Critical**               |
| Progress/readiness separation                          | **Critical**               |
| Centralized Readiness resolver                         | **Critical**               |
| Fresh readiness check before completion                | **Critical**               |
| Onboarding completion idempotency                      | **Critical**               |
| Step completion idempotency                            | **Critical**               |
| Step/onboarding optimistic concurrency                 | **Critical**               |
| Reopen preserves history                               | **Critical if supported**  |
| Override/waiver separately governed                    | **Critical if supported**  |
| Override does not mutate source entity                 | **Critical**               |
| Due-date/overdue semantics centralized                 | **Required**               |
| Responsibility/authorization separation                | **Critical**               |
| Client action/PortalMembership separation              | **Critical**               |
| Canonical Task reuse                                   | **Critical**               |
| Canonical ClientRequest reuse                          | **Critical**               |
| Canonical Questionnaire reuse                          | **Critical**               |
| Canonical Approval reuse                               | **Critical**               |
| Canonical Asset reuse                                  | **Critical**               |
| Source entity creation idempotency                     | **Critical**               |
| Source-event projection invalidation                   | **Critical**               |
| Project-state separation                               | **Critical**               |
| Completion event does not directly mutate Project      | **Critical**               |
| Cross-tenant source links prohibited                   | **Critical**               |
| Client-safe Portal projection                          | **Critical where exposed** |
| Permission-safe composition                            | **Critical**               |
| Partial failure handling                               | **Critical**               |
| Audit/outbox integration                               | **Required**               |
| Design 108+ Project reuse                              | **Critical architecture**  |

---

# 8. Consolidation

Design 107 exposes significant risk of turning a multi-domain onboarding process into a simplistic mutable checkbox list.

**ClientOnboarding / checklist projection conflation**
UI rows become source truth.

**ClientOnboarding / OnboardingTemplate conflation**
Reusable definition carries client-specific state.

**Template / TemplateVersion conflation**
Editing template rewrites historical onboarding.

**Latest template / pinned TemplateVersion conflation**
Active client gains new steps unexpectedly.

**StepDefinition / StepInstance conflation**
Template completion state leaks across clients.

**Step label / identity conflation**
Rename breaks history.

**Step order / dependency conflation**
Visual sequence becomes workflow rule.

**Requirement / Dependency conflation**
Source condition and step blocking become one concept.

**Dependency graph / display ordering conflation**
Reordering UI changes execution semantics.

**Circular dependencies / valid checklist conflation**
Onboarding becomes permanently blocked.

**Step / Task conflation**
Generic checklist duplicates work-management backend.

**Step / ClientRequest conflation**
External client action becomes internal work record.

**ClientRequest / Task conflation**
Who owes the action becomes ambiguous.

**Step / QuestionnaireAssignment conflation**
Submission lifecycle is replaced with checkbox.

**Step / ApprovalRequest conflation**
Formal approval becomes checklist completion.

**Step / Asset conflation**
File existence becomes mutable boolean.

**Source event / step state conflation**
External domain record is copied and drifts.

**Source-driven step / manual step conflation**
User can manually bypass Approval/Questionnaire requirements.

**“Check complete” / actual source evidence conflation**
Auditability disappears.

**Task completed / onboarding step complete conflation**
Additional requirements are ignored.

**Questionnaire submitted / reviewed requirement conflation**
Wrong source state satisfies step.

**Approval pending / failed requirement conflation**
Waiting becomes failure.

**Approval rejected / onboarding cancelled conflation**
One requirement changes entire process lifecycle.

**Requirement unavailable / unsatisfied conflation**
Service outage becomes client fault.

**Requirement unavailable / satisfied conflation**
System fails open.

**Optional / completed conflation**
Skipped work looks completed historically.

**Blocked / incomplete conflation**
No distinction between actionable and dependent work.

**Blocked / failed conflation**
Waiting step appears erroneous.

**Overdue / blocked conflation**
Time and dependency states collapse.

**Overdue / failed conflation**
Late action becomes workflow failure.

**Responsibility / authorization conflation**
Assigned person gains security access.

**Client responsibility / PortalMembership conflation**
Client-owned step creates access rights.

**ClientContact / Portal user conflation**
Business role becomes authentication identity.

**Progress / readiness conflation**
90% complete appears operationally ready.

**Step count / progress policy conflation**
Optional/weighted steps produce wrong percentage.

**Progress mutable field / canonical step state conflation**
User can manually set 100%.

**Readiness / completion conflation**
Passing checks automatically completes process.

**Frontend readiness / server readiness conflation**
Stale UI bypasses withdrawn Approval.

**Onboarding completed / Handoff completed conflation**
Design 106 remains pending unnecessarily.

**Onboarding completed / Project started conflation**
Client process directly mutates delivery state.

**Onboarding completed / Project completed conflation**
Setup and fulfillment collapse.

**Onboarding completed / Portal active conflation**
Workflow state becomes access state.

**ClientOnboarding / Project conflation**
Project status and onboarding progress merge.

**One Client / one onboarding forever conflation**
Repeat engagements cannot be represented.

**Won Deal / onboarding identity conflation**
Every conversion retry creates new checklist.

**Handoff retry / onboarding recreation conflation**
Duplicate onboarding instances appear.

**Template due date / instance due date conflation**
Template edit shifts existing client deadlines.

**Due-date update / history rewrite conflation**
Cannot explain previous overdue state.

**Reopened step / previous completion deletion conflation**
History disappears.

**Requirement override / source completion conflation**
ApprovalRejected becomes Approved invisibly.

**Override / ordinary step-completion permission conflation**
Any user bypasses onboarding controls.

**Override / no rationale conflation**
Governance evidence disappears.

**ClientRequest retry / duplicate request conflation**
Client receives repeated requests.

**Task creation retry / duplicate Task conflation**
Team work duplicates.

**Questionnaire retry / duplicate assignment conflation**
Client receives several forms.

**Approval retry / duplicate ApprovalRequest conflation**
Formal authorization forks.

**Source-event delivery retry / duplicate progress update conflation**
Event-at-least-once semantics corrupt counters.

**Onboarding source cache / current source truth conflation**
Old Approval state allows completion.

**Source service unavailable / no source record conflation**
Duplicate Request/Questionnaire may be created.

**Cross-tenant requirement reference**
Onboarding depends on another organization's resource.

**Client Portal projection / internal checklist conflation**
Internal tasks/notes leak to client.

**Notification / onboarding state conflation**
Dismissed reminder completes step.

**My Work projection / OnboardingStep entity conflation**
Personal queue becomes second onboarding backend.

**ActivityEvent / onboarding truth conflation**
Timeline text substitutes checklist state.

**AuditEvent / source evidence conflation**
Audit log substitutes Approval/Questionnaire/Task state.

**Generic onboarding mega-PATCH**
One payload can mark Tasks, Requests, Approvals, Questionnaires and steps complete.

**107/022 duplicate onboarding backend**
Original onboarding workspace and detail diverge.

**107/034 duplicate Task backend**
Checklist owns internal work.

**107/047 duplicate ClientRequest backend**
Checklist owns client dependencies.

**107/048/067 duplicate Questionnaire state**
Submission truth diverges.

**107/029/052 duplicate Approval state**
Formal authorization is copied.

**107/106 duplicate Handoff state**
Onboarding progress becomes conversion progress.

**107/108+ duplicate Project state**
Checklist controls delivery lifecycle.

No additional screen is required.

These are **onboarding identity, pinned template versioning, runtime steps, typed requirements, dependencies, canonical source-domain reuse, progress/readiness, override governance, idempotency, authorization and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL CLIENT ONBOARDING INSTANCE, CHECKLIST EXECUTION, DEPENDENCY & READINESS ANCHOR**

**Domain directive:**
**ClientOnboarding ≠ OnboardingTemplate ≠ OnboardingTemplateVersion ≠ OnboardingStepDefinition ≠ OnboardingStepInstance ≠ Requirement ≠ Dependency ≠ ClientRequest ≠ Task ≠ QuestionnaireAssignment ≠ ApprovalRequest ≠ Project ≠ WonDealHandoff ≠ PortalMembership.**

**Identity directive:**
Design 022 remains the sole canonical ClientOnboarding foundation. Design 107 opens and executes that exact onboarding instance and never creates a secondary checklist/onboarding entity.

**Handoff directive:**
Design 106 creates or links the onboarding instance idempotently. Handoff completion and onboarding completion remain separate; retrying a partial Won Deal Handoff must reuse the same onboarding record.

**Template directive:**
every ClientOnboarding pins one exact `OnboardingTemplateVersion`. Later template publication/editing affects future onboarding instances only.

**Template-version directive:**
published/referenced TemplateVersions and StepDefinitions are historically immutable. Active onboarding never dynamically resolves the latest template.

**Instantiation directive:**
onboarding creation instantiates runtime `OnboardingStepInstance` records from the exact pinned definition, preserving stable step identity, requirement configuration, dependencies, scheduling context and source lineage.

**Step directive:**
StepInstance is onboarding runtime state—not Task, ClientRequest, QuestionnaireAssignment, ApprovalRequest, Asset or Project state.

**Source-domain directive:**
real source workflows remain canonical in their own domains. Onboarding references and evaluates them rather than copying their lifecycle into arbitrary checklist booleans.

**Manual/source-driven directive:**
a genuinely manual onboarding step may be completed through the Onboarding service, but a source-driven step can only be satisfied through its canonical source entity or a separately authorized onboarding waiver. Generic “check complete” bypass is prohibited.

**Client-request directive:**
client-owned dependencies reuse canonical `ClientRequest`; internal team work reuses canonical `Task`. These identities remain distinct even when presented together in the checklist.

**Questionnaire directive:**
Questionnaire requirements reuse exact `QuestionnaireAssignment`/QuestionnaireVersion semantics from Designs 048/067. Draft/submitted/reviewed states cannot be replaced by an onboarding checkbox.

**Approval directive:**
formal approval requirements reuse Design 029's exact ApprovalRequest state. Onboarding administrators cannot manufacture an approval result.

**Asset directive:**
file requirements resolve against canonical Asset/FileVersion records rather than copied file-exists booleans.

**Requirement directive:**
typed `OnboardingRequirement` evaluation answers whether required source conditions are currently satisfied. Requirement state remains distinct from source state and from step dependencies.

**Dependency directive:**
explicit dependency relations—not visual row order—govern whether a step can proceed. Template publication validates dependency references and prevents invalid cycles.

**Freshness directive:**
RequirementEvaluations are source-revision/freshness aware. A stale cached Approval/Task/Questionnaire result cannot authorize onboarding completion after the source changed.

**Unknown-state directive:**
source outage or uncertain evidence yields `Unknown/Unavailable`, never false `Satisfied` or false `Failed`.

**Responsibility directive:**
Client/Team/system responsibility is operational context and never grants authorization. Assignment to a user does not bypass source-resource permissions.

**Progress directive:**
one centralized `OnboardingProgressResolver` derives progress from canonical runtime steps under a defined required/optional/weighting policy. Progress is rebuildable projection data, not user-editable truth.

**Readiness directive:**
progress and readiness remain separate. `OnboardingReadinessResolver` evaluates mandatory requirements, dependencies, exceptions and waivers and produces structured blockers.

**Completion directive:**
final onboarding completion is an explicit authorized, idempotent command that performs a fresh server-side readiness evaluation immediately before changing lifecycle state.

**Stale-client directive:**
frontend readiness/checkmarks are never authoritative. If a required Approval is withdrawn or source state changes before completion, the server rejects the stale completion request.

**Reopen directive:**
if reopening steps/onboarding is supported, prior completion evidence remains historical. Reopening never deletes the fact that the item was previously completed.

**Override directive:**
exceptional requirement waiver/override, if supported, requires separate elevated authority, exact requirement targeting, actor, reason and Audit. It changes onboarding requirement resolution without rewriting the canonical source entity.

**Due directive:**
instance due dates and overdue conditions are concrete runtime state derived under canonical scheduling policy. Later template due-date changes never silently modify an existing onboarding.

**Idempotency directive:**
onboarding creation, step completion, onboarding completion, and automatic creation/linkage of Tasks, ClientRequests, Questionnaires and Approvals must all be replay-safe.

**Concurrency directive:**
StepInstance and ClientOnboarding lifecycle mutations use expected revisions/transactional safeguards; concurrent users cannot silently overwrite completion/reopen actions.

**Portal directive:**
client-facing onboarding actions use client-safe projections of canonical Requests, Questionnaires, Approvals and Assets. Internal Tasks, notes, dependencies or permissions must never leak merely because they appear in Team Design 107.

**Access directive:**
PortalMembership remains an authentication/authorization prerequisite where needed and is never itself onboarding completion evidence unless an explicit typed requirement says so.

**Project directive:**
Design 023 and Designs 108+ remain authoritative for Project lifecycle. Client onboarding readiness/completion may feed Project gates/events but can never directly mutate Project stage through generic onboarding code.

**Event directive:**
source events such as `ClientRequestCompleted`, `TaskCompleted`, `QuestionnaireSubmitted`, `ApprovalResolved`, and asset events invalidate/recalculate onboarding projections rather than directly patching arbitrary percentages.

**Partial-failure directive:**
Onboarding core, StepInstances, Requests, Tasks, Questionnaires, Approvals, Assets and Project context can fail independently. A dependency outage never becomes a false incomplete/satisfied step, zero progress, or onboarding-not-found.

**Caching directive:**
onboarding caches vary by membership/authorization revision, onboarding/step revisions and relevant source-domain revisions. Cached readiness must never substitute for fresh completion-time validation.

**Performance directive:**
load onboarding/steps once, batch source references by domain type, centralize progress/readiness aggregation and lazy-load detailed Activity/Audit rather than N+1 querying every checklist item.

**Activity directive:**
human-readable onboarding Activity remains a projection and never replaces StepInstance history, source entities or formal Audit evidence.

**Audit directive:**
onboarding creation, template/version selection, manual completion, reopening, requirement waiver, due-date modification, cancellation and final completion generate actor/version-aware Audit evidence.

**Future-reuse directive:**
Design **108 — Project Intake / Project Creation Workspace** must consume the canonical Project/client/commercial lineage established by Designs 023, 106 and 107 and must not treat onboarding checklist data as a second Project or commercial-scope source.

**Overlap directive:**
Designs **021–023, 029, 034, 047–052, 062, 067, 106–110** must share one continuous **WonDealHandoff → ClientRelationship → ClientOnboarding → exact TemplateVersion → StepInstances → canonical Requests/Tasks/Questionnaires/Approvals/Assets → Onboarding Readiness → Project Delivery** lineage while keeping onboarding, access, work, review, approval and Project lifecycle independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE CLIENT ONBOARDING EXECUTION FOUNDATION — CANONICAL CLIENTONBOARDING IDENTITY + PINNED IMMUTABLE ONBOARDINGTEMPLATEVERSION + INSTANTIATED STEPINSTANCES + EXPLICIT DEPENDENCY GRAPH + TYPED SOURCE-BACKED REQUIREMENTS + DISTINCT CLIENTREQUEST/TASK/QUESTIONNAIRE/APPROVAL/ASSET ENTITIES + CENTRAL PROGRESS/READINESS RESOLVERS + AUTHORIZED MANUAL STEPS/WAIVERS + FRESH COMPLETION-TIME VALIDATION + IDEMPOTENT SOURCE-ENTITY CREATION + NON-DESTRUCTIVE REOPEN/HISTORY — AND NEVER ALLOW TEMPLATE EDITS, UI CHECKBOXES, TASK ASSIGNMENT, PORTAL ACCESS, STALE CACHES OR SOURCE-SERVICE FAILURE TO REWRITE CANONICAL ONBOARDING, APPROVAL, CLIENT, PROJECT, OR COMMERCIAL TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **107 / 153** |
| **PASS**                                   |                        **107** |
| **STANDARDIZE decisions**                  |                        **105** |
| **Potential implementation-overlap flags** |                         **98** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**107 / 153 = 69.9% audited.**

### Canonical onboarding architecture after Design 107

```text
              ONBOARDING TEMPLATE
                       │
                 Template v3
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      Step Def A   Step Def B   Step Def C
          │            │            │
          └────────────┼────────────┘
                       ↓ instantiate once
               ClientOnboarding ON-1
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
      Step A-1      Step B-1     Step C-1
          │            │            │
          ↓            ↓            ↓
   ClientRequest      Task     Questionnaire
                                       │
                                   Approval
          │            │            │
          └────────────┼────────────┘
                       ↓
             Requirement Resolver
                       ↓
              Progress / Readiness
```

The template-version invariant is now strict:

```text
Onboarding ON-1
created from Template v3

Later:
Template v4 adds 2 new steps

RESULT:

ON-1 remains a v3 onboarding.

It does NOT silently gain
the v4 steps.
```

The checklist/source boundary is equally strict:

```text
ApprovalRequest = PENDING

Therefore:

Onboarding requirement = UNSATISFIED / PENDING

NOT:

user manually checks the onboarding box
and thereby makes Approval approved.
```

And progress can never substitute for readiness:

```text
8 of 9 requirements satisfied
Progress = 89%

Remaining requirement:
Signed commercial approval

Readiness = BLOCKED

89% complete
≠
ready to complete.
```

Finally, Design 106 and Design 107 now have a clean handoff boundary:

```text
WonDealHandoff
      ↓
creates ClientOnboarding ON-1
      ↓
Handoff = COMPLETED

ClientOnboarding ON-1
      ↓
continues independently
      ↓
IN_PROGRESS
      ↓
READY_TO_COMPLETE
      ↓
COMPLETED
```

No duplicate conversion or onboarding identity is required.

## Next Sequential Audit Target

### **Design 108 — Project Intake / Project Creation Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
