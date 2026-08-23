Correct. We continue strictly with the frozen **Design 022 — Client Onboarding Workspace**. This audit treats onboarding as a persisted, auditable operational workflow—not as decorative checkboxes inside Client 360.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 022 — Client Onboarding Workspace

| Audit field                 | Classification                                                                                                                                                 |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **022**                                                                                                                                                        |
| **Canonical name**          | **Client Onboarding Workspace**                                                                                                                                |
| **Product area**            | Client Management / Onboarding / Operations                                                                                                                    |
| **User surface**            | Team Workspace                                                                                                                                                 |
| **Screen class**            | Guided Workflow / Checklist Execution Workspace                                                                                                                |
| **Classification**          | **Unique Anchor — Guided Onboarding Workflow Family**                                                                                                          |
| **Primary purpose**         | Coordinate all internal and client-dependent actions required to turn a newly converted Client into a delivery-ready, properly configured working relationship |
| **Primary entity**          | **ClientOnboarding**                                                                                                                                           |
| **Core child entities**     | OnboardingStep, OnboardingRequirement, OnboardingDependency                                                                                                    |
| **Supporting entities**     | Client, Company, Contact, User, OnboardingTemplate, PortalOrganization, PortalMembership, Project, Contract, Invoice, Payment, File, Activity                  |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                |
| **Template family**         | `GuidedWorkflowWorkspaceTemplate`                                                                                                                              |
| **Auth**                    | Required                                                                                                                                                       |
| **Permissions**             | Client/onboarding + assigned responsibility + administrative/portal scopes                                                                                     |
| **Implementation priority** | **Core / Critical**                                                                                                                                            |
| **Reuse level**             | **Very High**                                                                                                                                                  |

---

# 1. Functional responsibility

Design 022 answers:

> **“What exactly must happen before this Client is ready for full delivery, who is responsible for each requirement, what are we waiting on from the Client, what remains blocked, and when is onboarding truly complete?”**

The canonical transition is:

```text
Commercial Conversion
        ↓
Client Relationship
Design 021
        ↓
ClientOnboarding
Design 022
        ↓
Requirements + Steps + Dependencies
        ↓
Readiness Gates
        ↓
Onboarding Complete
        ↓
Project / Delivery Handoff
```

The central rule is:

> **Client ≠ ClientOnboarding.**

The Client is the ongoing relationship.

The onboarding record represents one controlled transition into operational delivery.

---

# 2. Client ≠ ClientOnboarding

A Client may exist for years.

An onboarding instance usually represents a bounded process.

Conceptually:

```text
Client
  │
  └── ClientOnboarding
        ├── Started
        ├── In Progress
        ├── Blocked
        └── Completed
```

Therefore we should not store the entire onboarding workflow as fields directly on `Client`.

Incorrect:

```text
client.onboardingStep1 = true
client.onboardingStep2 = false
client.portalActivated = true
client.projectCreated = false
```

Correct:

```text
Client
   ↓
ClientOnboarding
   ↓
OnboardingStep / Requirement / Dependency
```

This preserves history, accountability and extensibility.

---

# 3. Onboarding instance ≠ onboarding template

This distinction is critical.

### Onboarding Template

Defines the reusable starting process.

Example:

**Premium Personal Magazine Client Onboarding**

### ClientOnboarding

The actual onboarding process for one Client.

Conceptually:

```text
OnboardingTemplate
       ↓
Instantiate
       ↓
ClientOnboarding
```

The live onboarding instance must preserve its own workflow state.

It should not depend dynamically on whatever the Template looks like tomorrow.

---

# 4. Template edits must not mutate active onboarding

Suppose Template v2 contains:

```text
1. Confirm client details
2. Activate portal
3. Collect questionnaire
4. Collect assets
5. Create project
```

Twenty Clients are already being onboarded.

Tomorrow, Operations changes the Template to:

```text
1. Confirm client details
2. Compliance check
3. Activate portal
4. Collect questionnaire
5. Collect assets
6. Create project
```

Those existing Client workflows should **not silently change**.

A stronger model is:

```text
OnboardingTemplate
│
├── Version 1
├── Version 2
└── Version 3
```

with an onboarding instance referencing or snapshotting the version used when it was created.

### Audit directive

> **Template evolution and active onboarding execution must remain separated.**

---

# 5. Checklist ≠ individual Step

A checklist is the overall structured collection.

An individual Step is one actionable requirement.

Conceptually:

```text
ClientOnboarding
│
├── Step 1
├── Step 2
├── Step 3
├── Step 4
└── Step 5
```

Each Step may carry:

```text
title
description
responsible party
assignee
due date
state
dependencies
required evidence/information
completion metadata
```

The exact schema belongs to Phase 3D.

---

# 6. Step ≠ Requirement

These can be related but should not necessarily be identical.

### Step

An action someone performs.

Example:

> Configure Client Portal organization.

### Requirement

A condition/data/artifact that must exist.

Example:

> Signed Contract available.

A Step may satisfy a Requirement.

Conceptually:

```text
Requirement:
Signed contract required
       ↓
Satisfied by
       ↓
Canonical Contract = executed
```

Not every Requirement needs a user checking a box.

---

# 7. Canonical requirements should consume authoritative domain state

This is one of the strongest architectural rules for Design 022.

If onboarding requires:

> Contract signed

do not create:

```text
onboarding.contractSignedCheckbox = true
```

when Design 019 already knows the real Contract state.

Correct:

```text
Onboarding Requirement
       ↓
Contract Service
       ↓
Executed Contract?
       ↓
Satisfied / Unsatisfied
```

Likewise:

```text
Payment received
```

should derive from Design 020's canonical Finance domain where required.

---

# 8. Avoid duplicate truth

The following would be dangerous:

```text
Contract:
SIGNED

Onboarding checkbox:
Contract Signed = false
```

or:

```text
Invoice:
UNPAID

Onboarding checkbox:
Payment Received = true
```

Instead:

> **Externally verifiable onboarding requirements should derive from canonical source domains whenever possible.**

Manual steps remain manual only where there is no stronger source of truth.

---

# 9. Onboarding Step lifecycle

A Step needs an independent lifecycle.

Conceptually:

```text
NOT_STARTED
     ↓
IN_PROGRESS
     ↓
COMPLETED
```

with additional conditions such as:

```text
BLOCKED
SKIPPED
```

only where business policy supports them.

Exact enums belong to Phase 3D.

Important:

```text
Step lifecycle
≠
Due condition
```

---

# 10. Step state vs due condition

Example:

```text
State:
IN_PROGRESS

Due Condition:
OVERDUE
```

or:

```text
State:
NOT_STARTED

Due Condition:
DUE_SOON
```

Overdue should normally derive from:

```text
step not complete
+
dueAt < now
```

rather than becoming another permanent workflow state.

---

# 11. Step priority is another separate dimension

For example:

```text
Step:
Collect executive photographs

State:
BLOCKED

Priority:
HIGH

Due Condition:
OVERDUE
```

All three communicate different information.

Do not overload one status enum.

---

# 12. Internal responsibility ≠ client dependency

This distinction is fundamental to onboarding.

### Internal responsibility

Something the Team must do.

Example:

> Create the Client Portal workspace.

### Client dependency

Something the Client must supply, approve or complete.

Example:

> Upload executive photographs.

These should not be represented identically because operational reporting needs to answer:

> **Are we blocked because of us or because of the Client?**

---

# 13. Canonical dependency ownership

Conceptually:

```text
OnboardingDependency
├── source
├── requiredFrom
├── responsible internal owner
├── requestedAt
├── dueAt
├── receivedAt
├── state
└── related canonical record
```

Potential responsibility classifications include:

```text
INTERNAL
CLIENT
EXTERNAL
```

depending on final architecture.

Exact enum waits for Phase 3D.

---

# 14. Blocked reason needs structure

A Step should not simply show:

> Blocked

with no explanation.

Conceptually:

```text
Step:
Create magazine project

State:
BLOCKED

Blocked By:
Questionnaire not received
```

or:

```text
Blocked By:
Contract not executed
```

This enables actionable operations.

---

# 15. Client dependency ≠ generic status

A Client dependency can have its own lifecycle, for example conceptually:

```text
NOT_REQUESTED
REQUESTED
RECEIVED
VERIFIED
```

where appropriate.

But:

```text
Client dependency state
≠
Onboarding overall state
```

One missing item should not be stored by setting the entire Client lifecycle to `WAITING_FOR_IMAGES`.

---

# 16. Required information

Onboarding may require structured information such as:

* billing contact,
* primary editorial contact,
* company details,
* preferred publication timing,
* portal users,
* questionnaire response,
* asset requirements.

Where this information already belongs to Company, Contact, Project or another canonical entity, onboarding should reference/validate it rather than duplicate it.

---

# 17. Information request ≠ stored answer

Example:

```text
Requirement:
Primary billing contact required
```

should be satisfied by:

```text
ClientContact / Contact relationship
```

not by storing a second:

```text
onboarding.billingContactText
```

unless a deliberate historical snapshot is needed.

Again:

> **Onboarding orchestrates canonical data; it should not become a duplicate database.**

---

# 18. Files / assets

If onboarding requires uploads:

```text
logo
headshots
company deck
brand assets
```

those should use the canonical File/Asset infrastructure.

Conceptually:

```text
Onboarding Requirement
       ↓
File / Asset record
       ↓
Requirement satisfied
```

Do not store binary files directly inside onboarding records.

---

# 19. Required vs optional Steps

A checklist often needs:

```text
REQUIRED
OPTIONAL
```

semantics.

Completion/readiness must account for this distinction.

A Client should not be prevented from progressing because an optional Step remains open.

---

# 20. Conditional Steps

Some Steps may depend on package/client type.

For example:

```text
If Podcast included
    ↓
Collect podcast availability
```

The architecture should support controlled conditional inclusion from the onboarding template.

But conditions should remain declarative and allowlisted.

Design 022 should not execute arbitrary user code.

---

# 21. Step dependency graph

Some Steps can have prerequisites.

```text
Contract executed
      ↓
Portal activation
      ↓
Questionnaire
      ↓
Project creation
```

The backend should prevent invalid completion/order where the approved business process requires prerequisites.

However, onboarding should avoid becoming an unnecessarily complex generic automation engine.

A finite dependency graph is sufficient.

---

# 22. Dependency graph ≠ Sequence Builder engine

Design 013 already established a versioned Outreach execution engine.

Design 022 can reuse:

* dependency visualization,
* state primitives,
* validation patterns,

but:

```text
Outreach Sequence Runtime
≠
Client Onboarding Workflow
```

Outreach is timed communication automation.

Onboarding is human/system operational progression.

### Consolidation decision

**SHARE WORKFLOW UI PRIMITIVES — KEEP DOMAIN EXECUTION SEPARATE.**

---

# 23. Overall onboarding lifecycle

A conceptual lifecycle can be:

```text
NOT_STARTED
     ↓
IN_PROGRESS
     ↓
COMPLETED
```

with possible operational conditions:

```text
BLOCKED
```

depending on final data model.

The exact final enum comes in Phase 3D.

What matters now is:

> **Overall onboarding status is computed/transitioned independently from individual Step state.**

---

# 24. Onboarding progress

A simplistic progress value:

```text
7 / 10 = 70%
```

can be misleading if:

* some Steps are optional,
* some are gates,
* one critical requirement blocks everything.

Therefore onboarding can expose:

### Progress

How much work is complete.

### Readiness

Whether mandatory prerequisites for the next business transition are satisfied.

These are different.

---

# 25. Progress ≠ readiness

For example:

```text
Progress:
90%

Readiness:
NOT READY

Reason:
Required Contract execution missing
```

This is perfectly valid.

Likewise:

```text
Progress:
70%

Readiness:
READY FOR PROJECT CREATION
```

could be valid if remaining Steps are optional/post-handoff.

Do not treat a single percentage as the sole operational truth.

---

# 26. Readiness must be policy-driven

A canonical `OnboardingReadinessService` or equivalent should evaluate required gates.

Conceptually:

```text
Readiness
├── required Steps complete?
├── required Client dependencies received?
├── Contract requirements satisfied?
├── Payment requirement satisfied?
├── minimum Client information present?
├── Portal requirement satisfied if mandatory?
└── Project handoff requirements satisfied?
```

Exact rules depend on Package/workflow configuration.

---

# 27. Completion ≠ readiness for every sub-stage

Onboarding may have useful milestone readiness before total completion.

Examples:

```text
READY_FOR_PORTAL
READY_FOR_EDITORIAL
READY_FOR_PROJECT_CREATION
ONBOARDING_COMPLETE
```

Architecturally these are better represented as gates/milestones rather than inventing dozens of overall status values.

---

# 28. Onboarding Milestones / Gates

A reusable concept could be:

```text
OnboardingGate
├── name
├── requirements
├── state
└── satisfiedAt
```

This supports:

* delivery readiness,
* portal readiness,
* production readiness,

without overloading the workflow status.

The exact persisted model waits for Phase 3D.

---

# 29. Portal activation ≠ onboarding itself

Portal activation is one possible onboarding requirement.

Correct:

```text
ClientOnboarding
      ↓
Portal Requirement
      ↓
Portal Organization / Membership Service
```

Not:

```text
Onboarding complete = portal login exists
```

unless the approved policy explicitly defines that as a mandatory gate.

---

# 30. Portal Organization remains canonical

From Design 021:

```text
Client
   ↓
PortalOrganization
   ↓
PortalMembership
```

Design 022 can initiate or monitor activation.

It must not create a second portal identity system.

---

# 31. Portal invitation flow

If onboarding includes:

> Invite primary Client contact

the flow should be:

```text
Onboarding Step
      ↓
Portal Membership / Invitation Service
      ↓
Invitation
      ↓
Accepted / Pending / Expired
      ↓
Requirement state reflected
```

The Step does not own portal credentials or password state.

---

# 32. Portal invite sent ≠ portal activated

For example:

```text
Invite:
SENT

Portal Membership:
PENDING
```

does not mean:

```text
Portal Activated:
YES
```

This distinction should remain visible where relevant.

---

# 33. Questionnaire relationship

If onboarding includes a Client questionnaire:

```text
Onboarding
   ↓
Questionnaire Request
   ↓
Questionnaire Response
```

the questionnaire should be a canonical record.

Do not store all answers as giant onboarding note fields.

This will later integrate strongly with editorial/project workflows.

---

# 34. Questionnaire sent ≠ questionnaire received

These must remain separate.

Example:

```text
Questionnaire:
SENT

Response:
NOT_RECEIVED
```

The onboarding Step might therefore be:

```text
WAITING_ON_CLIENT
```

or represented through dependency state rather than incorrectly marked complete.

---

# 35. Received ≠ verified

A Client submitting information does not always mean the requirement is usable.

Conceptually:

```text
Received
   ↓
Review / validation
   ↓
Accepted / Complete
```

if the approved workflow requires internal verification.

Again:

> **Receipt and requirement satisfaction can be separate states.**

---

# 36. Project creation boundary

One of the most important handoffs is:

```text
Onboarding readiness achieved
        ↓
Project creation / intake
```

But Design 022 should not contain a second bespoke Project creation engine.

Later:

**Design 108 — Project Intake / Project Creation Workspace**

owns canonical Project creation.

Correct:

```text
Design 022
Onboarding
     ↓
Project creation eligible
     ↓
Design 108 / Project Service
```

---

# 37. Project created ≠ onboarding completed automatically

A Project may be created while a few onboarding actions remain.

Example:

```text
Project:
ACTIVE

Onboarding:
IN_PROGRESS
```

This can be valid if business policy permits.

Therefore Project state and onboarding state remain independent.

---

# 38. Handoff record

The transition from Onboarding to Project delivery benefits from explicit lineage.

Conceptually:

```text
ClientOnboarding
      ↓
ProjectHandoff
      ↓
Project
```

or equivalent event/reference.

The system should be able to answer:

> Which onboarding process created this Project?

without reconstructing it from Activity text.

---

# 39. Relationship to Design 106

Design 106 handles:

**Won Deal → Client Conversion/Handoff**

Design 022 handles:

**Client → operational onboarding**

The distinction:

```text
106
Commercial conversion
      ↓
Client created/linked
      ↓
022
Client onboarding
      ↓
108
Project intake
```

These should be three controlled transitions—not one enormous “Convert Deal” action doing everything invisibly.

---

# 40. Relationship to Design 107

Later:

**Design 107 — Client Onboarding Checklist Detail**

is the strongest future overlap.

Current expected architecture:

```text
Canonical ClientOnboarding Domain
          │
          ├── Design 022
          │   Overall onboarding workspace
          │
          └── Design 107
              Checklist / detailed execution
```

Potential outcome after Design 107 audit may be:

* same domain,
* same reusable checklist components,
* different depth/context.

### Current decision

**DO NOT MERGE YET.**

---

# 41. Internal vs Client-visible Steps

Some onboarding requirements are internal only.

Example:

> Assign Editorial Lead.

Other requirements may be Client-visible:

> Upload your executive photographs.

Therefore each Step/Requirement needs a visibility policy.

Conceptually:

```text
INTERNAL_ONLY
CLIENT_VISIBLE
```

or a richer access policy where needed.

Client visibility must be enforced at query level.

---

# 42. Client-visible Step ≠ Client-editable Step

A Client might be allowed to see:

> Contract verification complete

without being able to modify it.

Likewise:

```text
VISIBLE
≠
ACTIONABLE_BY_CLIENT
```

Permissions/actor responsibility remain separate.

---

# 43. Responsibility model

Each Step should answer:

> **Who owns getting this done?**

Potentially:

```text
responsibleParty
assigneeUser
assigneeTeam
```

where applicable.

The system should distinguish:

**responsible internal person**
from
**person we are waiting on**.

---

# 44. Assignment history

If responsibility changes:

```text
Emma
 ↓
Daniel
```

preserve meaningful assignment history.

This becomes useful for:

* accountability,
* workload,
* overdue analysis,
* operational reporting.

---

# 45. Escalation / notification boundary

Onboarding can emit events such as:

```text
Step overdue
Client dependency overdue
Critical gate blocked
Onboarding completed
```

But the actual notification/escalation system belongs to shared platform infrastructure.

Design 022 should not implement another notification engine.

---

# 46. Reminders to the Client

If Client reminders are supported, the canonical flow should be:

```text
Onboarding Dependency
       ↓
Reminder policy/event
       ↓
Communication / Notification service
```

not arbitrary browser timers.

Repeated reminders must respect communication preferences/permissions.

---

# 47. Completion command

Onboarding completion should be server-authoritative.

Conceptually:

```text
Complete Onboarding
       ↓
Permission check
       ↓
Required gates evaluated
       ↓
Required Steps satisfied
       ↓
Dependencies resolved
       ↓
Completion persisted
       ↓
Activity/audit event
```

The frontend cannot simply set:

```text
status = COMPLETED
```

if mandatory gates remain unmet.

---

# 48. Manual override

If authorized administrators can complete or bypass a normally required Step, the architecture must preserve:

```text
overrideBy
overrideAt
reason
```

where business policy permits overrides.

Do not silently change a Requirement from missing to complete.

Overrides are operationally important.

---

# 49. Skip ≠ complete

If optional Steps can be skipped:

```text
SKIPPED
```

must be distinguished from:

```text
COMPLETED
```

especially for future analytics.

Otherwise the platform cannot tell:

> completed successfully

from:

> intentionally not required.

---

# 50. Reopening onboarding

If an onboarding process is reopened after completion, preserve:

* original completion date,
* reopening event,
* reason,
* actor.

Do not erase the first completion history.

Exact policy belongs to Phase 3D.

---

# 51. Reusable component mapping

Design 022 introduces or formalizes:

`GuidedWorkflowWorkspace`
`OnboardingProgressHeader`
`ReadinessIndicator`
`ChecklistSection`
`OnboardingStepRow`
`OnboardingStepCard`
`RequirementBadge`
`DependencyBadge`
`BlockedReason`
`AssigneeControl`
`DueDateIndicator`
`ClientDependencyCard`
`WorkflowGateCard`
`CompletionSummary`
`OnboardingActivityTimeline`

Shared primitives include:

`PageHeader`
`ProgressBar`
`StatusBadge`
`Avatar`
`Drawer`
`Modal`
`EmptyState`
`LoadingState`
`ErrorState`

---

# 52. New reusable family

We now formally add:

```text
Guided Workflow / Checklist Execution Family
        │
        └── 022 Client Onboarding Workspace
```

This family can later help with:

* Project onboarding/checklists,
* client handoff,
* readiness workflows,
* operational checklists,

while domain rules remain separate.

---

# 53. Builder vs executor distinction

This is important.

### Design 013

Builds reusable Outreach Sequence definitions.

### Design 022

Executes an instantiated Client onboarding workflow.

Therefore:

```text
Workflow Definition / Template
        ↓
Workflow Instance / Execution
```

must remain separate architecture.

The same distinction will be important later in Project workflow templates.

---

# 54. Onboarding template administration

Design 022 is not necessarily where master onboarding templates are authored.

If template administration exists later, it should modify:

```text
OnboardingTemplate
```

while Design 022 operates:

```text
ClientOnboarding
```

Do not mix template editing into every active Client onboarding workspace unless specifically approved.

---

# 55. Permission architecture

Potential capability dimensions later include:

```text
onboarding.read
onboarding.start
onboarding.edit
onboarding.assign
onboarding.complete_step
onboarding.override_requirement
onboarding.complete
```

with related capabilities such as:

```text
portal.invite
project.create
```

remaining separate.

Exact permission names belong to Phase 3D.

Important:

```text
EDIT ONBOARDING
≠
OVERRIDE REQUIRED GATE
≠
CREATE PROJECT
≠
ADMINISTER PORTAL USERS
```

---

# 56. Responsibility does not automatically grant unrelated permissions

A user assigned:

> Activate Client Portal

still needs the actual Portal permission required to perform that operation.

Similarly, a user assigned:

> Create Project

must still have Project creation authority.

Workflow assignment does not bypass downstream RBAC.

---

# 57. Client-side permissions

External Client users may have capability for specific requirements such as:

* upload assets,
* complete questionnaire,
* provide information.

But they should not gain access to:

* internal owner assignments,
* blocked-by-team notes,
* internal risk comments,
* operational overrides.

Client Portal queries need explicit visibility filters.

---

# 58. Tenant isolation

Every onboarding record must be scoped to the correct organization/workspace.

Client Portal users must only ever see onboarding information related to their authorized Client/Portal organization.

Cross-client leakage here would expose sensitive commercial and project data.

---

# 59. Activity history

Meaningful events include:

**Onboarding created**
**Onboarding started**
**Step assigned**
**Step started**
**Client information requested**
**Dependency received**
**Requirement satisfied**
**Step blocked/unblocked**
**Step completed**
**Portal invitation sent/accepted**
**Readiness gate satisfied**
**Project created/handoff completed**
**Onboarding completed**
**Override applied**

The timeline should link to canonical source records where applicable.

---

# 60. Activity ≠ source domain

Example:

```text
Contract executed
      ↓
Onboarding Requirement satisfied
      ↓
Onboarding Activity Event
```

The Contract remains the authoritative source.

The activity simply explains what happened during onboarding.

---

# 61. Audit requirements

Stronger audit coverage is particularly important for:

* requirement overrides,
* skipped required steps,
* completion,
* assignee changes,
* portal access initiation,
* Project handoff,
* changes to source workflow/template version.

This protects workflow integrity.

---

# 62. Concurrency

Two operators may work on the same onboarding process.

Example:

```text
User A completes Step 4
User B marks Step 4 blocked
```

or:

```text
User A changes assignee
User B completes using stale state
```

The backend should use revision/concurrency checks for meaningful state transitions.

---

# 63. Client submission concurrency

A Client may submit required information while an internal user is viewing a stale workspace.

The new submission should create a canonical event/update, and the Team workspace should refresh/notify appropriately.

It must not be overwritten by the older browser state.

---

# 64. Idempotency

Client submissions and external events may retry.

For example:

```text
Portal invite accepted event
received twice
```

must not complete two Steps, create two memberships or duplicate Activity events.

Event processing needs idempotency.

---

# 65. Partial failure behavior

A complex onboarding workspace may depend on several services.

Example:

```text
Onboarding core        ✓
Client                  ✓
Contract state          ✓
Portal service          ✕
Project readiness       ✓
```

The entire onboarding workspace should remain usable.

Only Portal-related requirements should show degraded/unknown state.

Do not convert:

> **Portal status unavailable**

into:

> **Portal not activated.**

---

# 66. Unknown ≠ incomplete

This distinction is essential.

For a system-backed requirement:

```text
Contract Service unavailable
```

the Requirement state should conceptually be:

> **Unable to verify**

not automatically:

> **Incomplete**

Otherwise outages can incorrectly block or distort readiness.

---

# 67. Lazy / composed read model

A useful read model:

```text
ClientOnboardingWorkspaceView
├── Client summary
├── Onboarding instance
├── Template/version context
├── Steps
├── Requirements
├── Dependencies
├── Readiness gates
├── Portal summary
├── Project handoff summary
└── Activity
```

But writes remain explicit domain commands.

---

# 68. Do not use a generic mega-update

Avoid:

```text
PATCH /onboarding
{
  contractSigned: true,
  paymentReceived: true,
  portalCreated: true,
  projectCreated: true
}
```

because Contract, Payment, Portal and Project already have canonical services.

Instead:

```text
OnboardingService
├── update workflow-owned step
├── assign
├── acknowledge dependency
├── override requirement
└── complete onboarding
```

while system-backed requirements are consumed from source domains.

---

# 69. Backend architecture

Recommended structure:

```text
Client Onboarding UI
        ↓
Onboarding Query / Command Layer
        ↓
Tenant + Permission Scope
        ↓
ClientOnboarding Domain
        │
        ├── Onboarding Instance
        ├── Steps
        ├── Requirements
        ├── Dependencies
        ├── Assignments
        └── Readiness Gates
        │
        ├── Client Service
        ├── Contract Service
        ├── Invoice / Payment Service
        ├── Portal Service
        ├── Questionnaire / File Service
        └── Project Service
```

Template creation remains logically separate:

```text
OnboardingTemplate
       ↓
Instantiate
       ↓
ClientOnboarding
```

---

# 70. Backend requirements

| Requirement                          | Status                        |
| ------------------------------------ | ----------------------------- |
| Authentication                       | **Required**                  |
| Tenant isolation                     | **Critical**                  |
| Onboarding RBAC                      | **Critical**                  |
| Canonical ClientOnboarding entity    | **Critical**                  |
| Template/instance separation         | **Critical**                  |
| Template version/snapshot semantics  | **Critical**                  |
| Persisted Steps                      | **Critical**                  |
| Required/optional semantics          | **Required**                  |
| Dependency model                     | **Critical**                  |
| Internal vs Client responsibility    | **Critical**                  |
| Canonical domain-backed requirements | **Critical**                  |
| Readiness/gate evaluation            | **Critical**                  |
| Portal integration                   | **Required**                  |
| Questionnaire/data integration       | **Required where applicable** |
| File/asset integration               | **Required where applicable** |
| Project handoff integration          | **Critical**                  |
| Completion validation                | **Critical**                  |
| Override auditability                | **Critical**                  |
| Assignment history                   | **Required**                  |
| Concurrency protection               | **Required**                  |
| Event idempotency                    | **Required**                  |
| Partial-service failure handling     | **Required**                  |
| Activity timeline                    | **Required**                  |
| Audit history                        | **Required**                  |

---

# 71. Canonical onboarding metrics

Later dashboards/operations may need:

**Clients Onboarding**
**Average Onboarding Time**
**Onboarding Completed**
**Onboarding Overdue**
**Blocked Onboardings**
**Waiting on Client**
**Waiting on Internal Team**
**Readiness Rate**

Definitions must be centralized.

For example:

> **Blocked**

must have the same meaning in Design 022 and Operations/Analytics.

---

# 72. Client delay vs internal delay

This becomes an important reporting distinction.

Example:

```text
Onboarding duration:
14 days

Client waiting time:
8 days

Internal processing time:
6 days
```

Even if V1 does not expose all metrics immediately, the underlying dependency/ownership model should make them possible.

This is far more useful than a simple:

> onboarding took 14 days.

---

# 73. Main implementation risks

The Design 022 audit flags several high-priority risks:

**Client/Onboarding conflation**
Putting dozens of workflow fields directly on Client.

**Template/instance conflation**
Editing a master checklist silently changing active Client onboarding.

**Checkbox architecture**
Treating onboarding as boolean UI state rather than persisted workflow records.

**Duplicate truth**
Manually checking “Contract signed” when Contract already has authoritative state.

**Progress/readiness conflation**
Using 100% checklist completion as the only business gate.

**Internal/client dependency conflation**
Operations unable to determine who is causing delay.

**Portal/onboarding conflation**
Treating Portal activation as the entire onboarding process.

**Project/onboarding conflation**
Project creation automatically overwriting onboarding lifecycle.

**Assignment = permission assumption**
Assigned users bypassing Project/Portal RBAC.

**Outage → incomplete bug**
Unavailable downstream services incorrectly showing requirements as failed.

**Required-step override without audit**
Users silently bypassing onboarding safeguards.

**Client data leakage**
Internal onboarding notes/assignments exposed through Client Portal.

**Design 022/107 duplication**
Building two independent onboarding engines.

None requires another visual design.

They require canonical workflow architecture.

# Design 022 Audit Verdict

## **PASS — GUIDED CLIENT ONBOARDING WORKFLOW ANCHOR**

**Template directive:** Design 022 establishes the reusable `GuidedWorkflowWorkspaceTemplate` for persisted checklist/readiness workflows.

**Domain directive:** **Client ≠ ClientOnboarding ≠ OnboardingTemplate ≠ OnboardingStep ≠ Requirement ≠ Dependency.**

**Template directive:** Active onboarding instances bind to a controlled Template version/snapshot; editing the master Template must not silently rewrite active workflows.

**Canonical-truth directive:** Contract, Payment, Portal, Questionnaire, File and Project requirements should consume their authoritative domain state instead of duplicate onboarding booleans.

**Responsibility directive:** Internal responsibilities and Client dependencies remain explicitly distinguishable.

**Progress directive:** Completion percentage and operational readiness are separate concepts.

**Gate directive:** Readiness/completion is evaluated by canonical required gates rather than frontend checkbox counts.

**Portal directive:** Portal activation/invitation is a linked onboarding requirement using the canonical Portal service—not a second authentication implementation.

**Project directive:** Onboarding readiness hands off into the canonical Project Intake/Create flow; Design 022 does not implement an independent Project engine.

**Permission directive:** Workflow assignment never bypasses downstream Project, Portal, Finance or Client permissions.

**Resilience directive:** Downstream service outage must produce **unknown/unavailable**, not falsely mark a requirement incomplete.

**History directive:** Step transitions, dependency receipt, assignments, overrides, readiness gates and completion retain Activity/Audit history.

**Reuse directive:** Designs **022 and 107** must share one canonical ClientOnboarding domain and checklist components.

**Consolidation directive:** **STANDARDIZE GUIDED WORKFLOW + CHECKLIST + READINESS INFRASTRUCTURE — DO NOT MERGE DESIGN 022 WITH CLIENT 360, WON-DEAL HANDOFF, PROJECT INTAKE OR DESIGN 107 UNTIL THOSE COMPARISONS ARE COMPLETE.**

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **22 / 153** |
| **PASS**                                   |                         **22** |
| **STANDARDIZE decisions**                  |                         **20** |
| **Potential implementation-overlap flags** |                         **13** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Reusable architecture through Design 022

```text
InternalAppShell
│
├── Dashboard Family                         003–007
├── Data Acquisition Family                  008–009
├── Data Quality / Enrichment                010
├── CRM List Workspace                       011
├── Campaign Operations                      012
├── Versioned Workflow Builder               013
├── Unified Communication                    014
├── Action & Scheduling                      015
├── Pipeline Board                           016
├── Entity Detail / 360                      017
├── Versioned Commercial Document            018
├── Contract Execution Workspace             019
├── Billing & Payment Workspace              020
├── Client Relationship / 360                021
└── Guided Workflow / Checklist Execution
    └── 022 Client Onboarding Workspace
```

The conversion-to-delivery chain is now structurally separated:

```text
DEAL WON
   ↓
Accepted Proposal
   ↓
Executed Contract
   ↓
Billing / Payment
   ↓
Client Conversion
   ↓
CLIENT
Design 021
   ↓
ONBOARDING INSTANCE
Design 022
   │
   ├── Internal Steps
   ├── Client Dependencies
   ├── Canonical Requirements
   ├── Portal Activation
   ├── Information / Assets
   └── Readiness Gates
   ↓
PROJECT HANDOFF / INTAKE
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 023 Audit**

For **Design 023**, we should first retrieve its **exact frozen identity from the approved 153-design inventory** and only then audit it.

I will **not infer or invent the Design 023 name** from the surrounding workflow. Once its frozen identity is verified, we continue with the exact same contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no new screen and no sequence change.**

