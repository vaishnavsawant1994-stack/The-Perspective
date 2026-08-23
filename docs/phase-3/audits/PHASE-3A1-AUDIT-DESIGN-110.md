# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 110 — Workflow Template Detail / Stage Configuration

Design 110 should become the **canonical Team Workspace Workflow Template definition, version, stage-graph, transition, gate, and publication-governance surface** for configuring reusable delivery workflows that future Projects can instantiate.

It builds directly on the template identities established by Design 109 and must preserve the fundamental boundary between **reusable workflow definition** and **runtime Project execution**.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **WorkflowTemplate ≠ WorkflowTemplateVersion ≠ StageDefinition ≠ TransitionDefinition ≠ GateDefinition ≠ ConditionDefinition ≠ TaskDefinition ≠ MilestoneDefinition ≠ Project ≠ ProjectWorkflow ≠ ProjectStageInstance ≠ StageTransition ≠ GateEvaluation ≠ ApprovalRequest.**

The central implementation rule is:

> **Design 110 edits a draft WorkflowTemplateVersion and publishes an immutable reusable process definition. It never directly edits Project runtime stages. Stage ordering, transition permissions, gate requirements, optional task/milestone definitions, and workflow conditions must be explicit versioned configuration. Published versions remain immutable; Projects pin and instantiate exact versions; later workflow-template changes affect future Projects only unless a separately governed migration is intentionally introduced.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **110**                                                                                                                                                                           |
| **Canonical name**                    | **Workflow Template Detail / Stage Configuration**                                                                                                                                |
| **Product area**                      | Team Workspace / Projects / Workflow Configuration                                                                                                                                |
| **User surface**                      | **Authenticated Team Workspace**                                                                                                                                                  |
| **Screen class**                      | Template Detail / Versioned Workflow Builder / Stage Configuration Workspace                                                                                                      |
| **Classification**                    | **Canonical Workflow Template Version, Stage Graph, Transition & Gate Configuration Anchor**                                                                                      |
| **Primary purpose**                   | Inspect and configure one reusable Workflow Template, edit its draft version, validate stage/transition/gate definitions, and publish an immutable version for future Project use |
| **Primary identity**                  | **WorkflowTemplate** — Design 109                                                                                                                                                 |
| **Version identity**                  | **WorkflowTemplateVersion**                                                                                                                                                       |
| **Stage definition**                  | **StageDefinition**                                                                                                                                                               |
| **Transition definition**             | **TransitionDefinition**                                                                                                                                                          |
| **Gate definition**                   | **GateDefinition**                                                                                                                                                                |
| **Condition/config dependency**       | typed `ConditionDefinition` / policy references where required                                                                                                                    |
| **Optional work definitions**         | TaskDefinition / MilestoneDefinition where part of the frozen workflow configuration                                                                                              |
| **Runtime counterpart**               | **ProjectWorkflow / ProjectStageInstance** — Design 023                                                                                                                           |
| **Runtime transition**                | canonical Project workflow transition/history                                                                                                                                     |
| **Runtime gate evaluation**           | project-specific gate evaluation                                                                                                                                                  |
| **Approval dependency**               | Design 029 when a gate references an approval policy                                                                                                                              |
| **Project creation consumer**         | Design 108                                                                                                                                                                        |
| **Template library dependency**       | Design 109                                                                                                                                                                        |
| **Task/Milestone runtime dependency** | Design 034 / Design 111                                                                                                                                                           |
| **Builder primitive reuse**           | Design 013 builder primitives may be shared visually; domain engines remain separate                                                                                              |
| **Primary query service**             | `WorkflowTemplateDetailQueryService`                                                                                                                                              |
| **Workflow-template service**         | `WorkflowTemplateService`                                                                                                                                                         |
| **Version service**                   | `WorkflowTemplateVersionService`                                                                                                                                                  |
| **Validation service**                | `WorkflowDefinitionValidationService`                                                                                                                                             |
| **Publication service**               | `WorkflowTemplatePublicationService`                                                                                                                                              |
| **Parent shell**                      | `InternalAppShell` — Design 001                                                                                                                                                   |
| **Auth**                              | Required                                                                                                                                                                          |
| **Authorization**                     | Active OrganizationMembership + workflow-template read/edit/publish/archive permissions                                                                                           |
| **Implementation priority**           | **Critical Runtime-Safety / Workflow Version Integrity / Future Project Initialization**                                                                                          |
| **Reuse level**                       | **Extremely High across all Project workflow families**                                                                                                                           |

Design 110 should answer:

> **“What exact Workflow Template is this, which version is published, which draft is being edited, what stages exist, how can work move between those stages, which gates/requirements apply, is the definition structurally valid, and can this exact draft safely be published for future Projects?”**

Canonical definition/runtime structure:

```text
WorkflowTemplate WT-1
        │
        ├── v6 historical
        ├── v7 published
        └── v8 draft
               │
               ├── StageDefinition[]
               ├── TransitionDefinition[]
               ├── GateDefinition[]
               └── optional Task/Milestone definitions
                        │
                        ↓ publish
                WorkflowTemplate v8
                        │
                        ↓ future Project creation
                   ProjectWorkflow
                        │
                  ProjectStageInstance[]
                        │
                   runtime transitions
```

---

# 2. Reuse

## Design 109 remains the canonical Workflow Template library

Design 110 must open the exact:

```text
WorkflowTemplate.id
WorkflowTemplateVersion.id
```

established by Design 109.

Correct:

```text
Design 109
WorkflowTemplate WT-20
        ↓
Design 110
WT-20 / Draft v8
```

Do not create:

```text
WorkflowBuilderTemplate
StageConfigurationWorkflow
WorkflowDetailRecord
```

as separate business identities.

---

## Design 110 edits versions, not runtime Projects

Critical.

Correct:

```text
WorkflowTemplateVersion v8
        ↓ publish
future Project
        ↓ instantiate
ProjectWorkflow PW-100
```

Incorrect:

```text
Edit WorkflowTemplate v8
        ↓
change every active ProjectWorkflow
```

---

## Design 023 remains runtime Project workflow authority

Runtime facts such as:

* current stage,
* stage entry/exit times,
* actual transition history,
* blocked condition,
* runtime gate evaluation,

belong to the Project domain.

Design 110 never owns them.

---

## StageDefinition ≠ ProjectStageInstance

Permanent.

```text
StageDefinition SD-10
        ↓ instantiate for PR-1
ProjectStageInstance PSI-100

        ↓ instantiate for PR-2
ProjectStageInstance PSI-200
```

One template definition produces independent runtime stage instances.

---

## TransitionDefinition ≠ runtime StageTransition

Permanent.

A TransitionDefinition says:

> this movement is permitted under these conditions.

A runtime StageTransition says:

> Project PR-100 actually moved from A to B at this time by this actor/system.

---

## GateDefinition ≠ runtime GateEvaluation

Permanent.

A GateDefinition specifies a reusable rule.

A runtime GateEvaluation answers whether that rule passes for a particular Project at a particular time.

---

## GateDefinition ≠ ApprovalRequest

If a gate requires approval:

```text
GateDefinition
   ↓ references approval policy/config
runtime Project
   ↓
ApprovalRequest
```

The template must not contain the actual ApprovalRequest.

---

## Design 029 remains canonical Approval engine

Workflow configuration may reference an Approval policy/requirement.

It cannot create a second:

```text
stage.approved = true
```

approval backend.

---

## Design 111 remains runtime Task/Milestone authority

If WorkflowTemplate configuration contains TaskDefinition or MilestoneDefinition:

```text
TaskDefinition
      ≠
Task

MilestoneDefinition
      ≠
Milestone
```

Instantiation produces canonical runtime entities.

---

## Design 013 builder primitives can be reused

Design 013 — Outreach Sequence Builder and Design 110 can share low-level UI primitives such as:

* ordered nodes,
* connectors,
* configuration panels,
* validation markers,
* version/publish controls.

But their domain engines must remain separate:

```text
Outreach Sequence
≠
Project Workflow
```

Do not create one generic automation engine simply because both use a builder UI.

---

## Design 096 Deal stage configuration is analogous but separate

Deal pipeline/stage governance and Project workflow stages share concepts such as:

* stages,
* transitions,
* gates.

They are different domains.

Never reuse Deal stage entities as Project workflow stages.

---

## ProjectTemplate remains separate

A ProjectTemplateVersion may reference this exact WorkflowTemplateVersion.

That relationship should be version-pinned.

Design 110 must not mutate ProjectTemplate versions when the workflow changes.

---

# 3. Entities

## WorkflowTemplate

Stable reusable workflow identity.

Conceptually:

```text
WorkflowTemplate
├── id
├── organizationId
├── stable key/reference
├── name
├── lifecycle
├── currentPublishedVersionId
├── currentDraftVersionId?
├── createdAt
└── revision
```

---

## WorkflowTemplate ≠ WorkflowTemplateVersion

Permanent.

Template identity survives:

* renaming,
* publishing newer versions,
* archiving.

---

## WorkflowTemplateVersion

Exact reusable workflow definition.

Conceptually:

```text
WorkflowTemplateVersion
├── id
├── workflowTemplateId
├── version
├── lifecycle
├── StageDefinition[]
├── TransitionDefinition[]
├── GateDefinition[]
├── condition/policy references
├── createdBy
├── createdAt
└── publishedAt?
```

---

## Published version is immutable

Absolute for material process semantics.

Once v7 is published and/or used by Projects:

* stage identities,
* transitions,
* gates,
* conditions,

cannot be altered in place.

Create v8.

---

## Draft version ≠ published version

Valid:

```text
Published = v7
Draft     = v8
```

v8 can be incomplete/invalid while v7 remains valid for Project creation.

---

## Latest created ≠ current published

Permanent.

---

## StageDefinition

Stable stage identity **within one exact WorkflowTemplateVersion**.

Conceptually:

```text
StageDefinition
├── id
├── workflowTemplateVersionId
├── stableKey
├── label
├── description/config
├── displayOrder
├── stage role/type if required
└── metadata
```

---

## Stage label ≠ Stage identity

Critical.

Changing:

> Draft Review

to:

> Editorial Review

must not rely on the label as identity.

---

## Stage display order ≠ process transition graph

Absolute.

UI ordering can be:

```text
A
B
C
```

while valid process transitions could be:

```text
A → B
B → A
B → C
A → C
```

depending on policy.

Backend rules must be explicit.

---

## Start stage

If workflow semantics require one starting stage:

that must be explicit and validation-enforced.

Do not infer simply:

> first visually displayed stage.

---

## Terminal stage

Likewise, if terminal/completion stages exist:

mark them semantically.

Do not infer:

> last column = completed.

---

## Stage deletion in draft

Removing a StageDefinition from draft v8 affects v8 only.

It cannot delete runtime stages from Projects instantiated from v7.

---

## TransitionDefinition

Conceptually:

```text
TransitionDefinition
├── id
├── workflowTemplateVersionId
├── fromStageDefinitionId
├── toStageDefinitionId
├── condition references
├── gate references
├── transition policy
└── metadata
```

---

## TransitionDefinition ≠ Stage

Permanent.

---

## Transition direction must be explicit

Do not infer bidirectional transition because two stages are adjacent.

---

## Backward transition is not automatically prohibited

Likewise, do not assume workflows are strictly linear.

If backward movement is allowed, it must be explicitly configured.

If prohibited, validation/service rules enforce it.

---

## TransitionDefinition ≠ transition action history

Permanent.

No runtime:

```text
movedBy
movedAt
```

belongs in the template definition.

---

## ConditionDefinition

If stage/transition rules require conditions, they must use a **typed declarative rule model**, not arbitrary executable code.

Conceptually:

```text
ConditionDefinition
├── conditionType
├── field/source reference
├── operator
├── expected value/policy
└── versioned schema
```

---

## Arbitrary JavaScript/eval prohibited

Critical.

Do not store:

```text
if (project.whatever) { ... }
```

as user-configured executable code.

Use an allowlisted typed DSL/AST or explicit policy references.

---

## Condition ≠ authorization

Passing workflow condition never bypasses RBAC/permissions.

Permanent.

---

## GateDefinition

Reusable transition/readiness constraint.

Conceptually:

```text
GateDefinition
├── id
├── workflowTemplateVersionId
├── stableKey
├── gateType
├── subject/reference policy
├── requirement config
├── blocking semantics
└── metadata
```

---

## GateDefinition ≠ GateEvaluation

Permanent.

---

## GateEvaluation

Runtime, Project-specific, potentially freshness-aware:

```text
GateEvaluation
├── projectId
├── projectWorkflowId
├── gateDefinitionId
├── result
├── evaluatedAt
├── source revisions
└── reason
```

This belongs to runtime Project workflow, not Design 110 configuration.

---

## Gate result must support unknown

Critical.

Conceptually:

```text
PASS
BLOCKED
UNKNOWN
```

A dependency outage is not PASS.

---

## Approval gate

If a GateDefinition requires formal approval:

```text
GateDefinition
     ↓ runtime requirement
ApprovalRequest
```

Approval remains exact-subject/version based under Design 029.

---

## TaskDefinition

If present:

```text
TaskDefinition
├── id
├── workflow/project template version context
├── stableKey
├── title/default
├── relative timing
├── assignment rule/default
└── trigger/stage context
```

---

## TaskDefinition ≠ Task

Permanent.

---

## Relative timing ≠ actual Task due date

Example:

Template:

> due 2 days after entering Design Review.

Runtime:

> PR-100 Task due September 8.

The runtime Task owns the concrete date.

---

## Assignment rule ≠ assigned user

A reusable template may say:

> assign Project Designer role.

It must not permanently store:

> assign Sarah Smith

as runtime truth unless that is intentionally a fixed reusable default and still revalidated during instantiation.

---

## MilestoneDefinition

Same template/runtime distinction.

---

## Stage entry/exit rules

If the frozen design includes stage rules:

they belong in the exact WorkflowTemplateVersion.

Runtime actual entry/exit evidence remains Project-specific.

---

## Workflow validation result

Could conceptually be:

```text
WorkflowDefinitionValidation
├── workflowTemplateVersionId
├── versionRevision
├── result
├── issue codes
├── validatedAt
└── validatorVersion
```

It is a derived/cacheable result.

Not a user-controlled boolean.

---

## Validation ≠ publication

A valid draft still needs an explicit publish command.

---

## Version usage

Projects should retain:

```text
sourceWorkflowTemplateVersionId
```

for provenance.

---

## Usage ≠ dynamic control

A Project referencing v7 does not continue reading v7 for runtime current state.

Its workflow was instantiated from v7.

---

# 4. Permissions

Design 110 should conceptually distinguish:

```text
workflowTemplate.read
workflowTemplate.use

workflowTemplate.create
workflowTemplate.editDraft
workflowTemplate.manageStages
workflowTemplate.manageTransitions
workflowTemplate.manageGates

workflowTemplate.publish
workflowTemplate.archive
```

Exact keys belong to Phase 3D.

---

## Read ≠ edit

Permanent.

---

## Use ≠ edit

Critical.

Project creators may consume published workflows without changing them.

---

## Edit draft ≠ publish

Critical.

Publishing changes future delivery behavior and deserves stronger governance.

---

## Stage edit ≠ gate-policy administration necessarily

Where gate configuration references sensitive approval/policy rules, permission can be narrower.

---

## Runtime Project stage permission ≠ WorkflowTemplate edit permission

Absolute.

A Project Manager allowed to move Project PR-100 between stages cannot modify the shared WorkflowTemplate.

---

## Template publisher ≠ runtime approver

Permanent.

---

## WorkflowTemplate owner ≠ security authority

Permanent.

---

## Browser-selected stage IDs must be version-bound

A StageDefinition ID from another:

* version,
* WorkflowTemplate,
* tenant,

must be rejected.

---

## Cross-version transition references prohibited

A TransitionDefinition in v8 cannot point to:

```text
StageDefinition from v7
```

unless an explicit immutable shared-definition model is intentionally adopted.

Default safe architecture: all graph definitions belong to the exact version.

---

## Cross-tenant references prohibited

Absolute.

---

## Direct version ID reauthorizes

Knowing a draft/published version ID grants nothing.

---

## Publish request cannot spoof actor

Actor derives from authenticated OrganizationMembership.

---

## Validation result cannot be supplied as authority by browser

Server revalidates before publish.

---

# 5. States

Design 110 must keep **Template lifecycle, Version lifecycle, validation, publication readiness, definition editing state, and runtime Project state** separate.

### WorkflowTemplate lifecycle

```text
Draft
Active
Inactive
Archived
```

### WorkflowTemplateVersion

```text
Draft
Published
Superseded
Historical
```

### Validation

```text
Not Validated
Valid
Invalid
Needs Attention
Validation Stale
Validation Unavailable
```

### Publication readiness

```text
Not Ready
Ready to Publish
Blocked
Unknown
```

### Draft edit/concurrency state

```text
Clean
Unsaved / Pending save
Saving
Saved
Conflict
Updated Elsewhere
```

Exact UI behavior only if present in frozen design.

---

## Draft ≠ invalid

Permanent.

A draft can be valid but unpublished.

---

## Invalid draft ≠ published version invalid

Critical.

Valid:

```text
v7 published = VALID
v8 draft     = INVALID
```

Future Projects can continue using v7.

---

## Valid ≠ publish-ready universally

Permissions/policy or other constraints may still block publication.

---

## Ready to publish ≠ published

Permanent.

---

## Published ≠ available for new Projects universally

Availability/use policy remains separate.

---

## Superseded ≠ deleted

Permanent.

---

## Archived template ≠ archived Projects

Absolute.

---

## Stage removed from draft ≠ runtime stage removed

Absolute.

---

## Transition removed from v8 ≠ transition removed from v7 Projects

Absolute.

---

## Gate changed in draft ≠ active Project gate changed

Absolute.

---

## Validation unavailable ≠ valid

Critical.

---

## Gate source unavailable at runtime ≠ template invalid

Important.

A valid template can exist even while a runtime source service is temporarily unavailable.

Template definition validity and runtime gate evaluation are different.

---

## State Coverage

Design 110 inherits Design 150 plus:

```text
Workflow Template Loading
Workflow Template Available
Workflow Template Restricted

Published Version Available
No Published Version
Draft Version Available
No Draft Version

Workflow Version Draft
Workflow Version Published
Workflow Version Superseded
Workflow Version Historical

Workflow Validation Not Run
Workflow Validation Valid
Workflow Validation Invalid
Workflow Validation Needs Attention
Workflow Validation Stale
Workflow Validation Unavailable

Publication Not Ready
Publication Ready
Publication Blocked
Publication Unknown

Stage Configuration Valid
Stage Configuration Invalid
Stage Reference Missing

Transition Configuration Valid
Transition Configuration Invalid
Transition Dead End / Conflict
Transition Reference Missing

Gate Configuration Valid
Gate Configuration Invalid
Gate Policy Restricted
Gate Dependency Unavailable

Draft Saving
Draft Saved
Draft Conflict
Draft Updated Elsewhere

Workflow Published Elsewhere
Version Conflict
Partial Workflow Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **exact version + workflow structure + configuration validity**.

Conceptually:

```text
Workflow Template
↓
Published v7 / Draft v8
↓
Workflow structure
   ├── stages
   ├── transitions
   └── gates
↓
Selected configuration
↓
Validation
↓
Publish action
```

Only elements present in frozen Design 110 should render.

---

## Stage order and transition graph must not visually collapse

If the design uses ordered columns/list:

the UI can use order for readability, but it must still indicate configured transition relationships correctly.

---

## Selected version must always be explicit

Correct:

> Editing Draft v8
> Published v7 remains active

Not:

> Workflow v8

without lifecycle context.

---

## Published versions should be clearly non-editable

If a user inspects v7:

the interface should not imply that editing it in place is possible.

Editing should operate on a draft/new version according to domain policy.

---

## Gate state should communicate configuration, not runtime result

Design 110 should say conceptually:

> Approval gate required before Design Approved

not:

> Gate passed

because pass/fail belongs to a particular Project.

---

## Tablet

Following Design 152:

* version context remains top-level,
* stage configuration stacks horizontally/vertically as practical,
* detail configuration can become drawers/cards,
* validation remains visible,
* publish action stays deliberate.

---

## Mobile

Priority:

```text
Workflow Template
↓
Editing Draft / Published version
↓
Stages
↓
Selected stage configuration
↓
Allowed transitions
↓
Gate configuration
↓
Validation
↓
Publish
```

Avoid attempting to squeeze a desktop-wide workflow graph into an unreadable miniature.

A structured stage list/detail pattern is acceptable for mobile adaptation while retaining exact semantics.

---

## Accessibility

A workflow definition could communicate:

> Editorial Delivery Workflow, draft version 8. Published version 7 remains active. Draft version 8 contains seven stages and nine configured transitions. Two transitions require approval gates. Validation currently reports one blocking transition error, so version 8 cannot be published.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical workflow-template architecture

```text
Design 110
    ↓
Authenticated Workspace Context
    ↓
WorkflowTemplateDetailQueryService
    │
    ├── WorkflowTemplateAdapter
    ├── WorkflowTemplateVersionAdapter
    ├── StageDefinitionAdapter
    ├── TransitionDefinitionAdapter
    ├── GateDefinitionAdapter
    ├── optional Task/Milestone Definition adapters
    ├── ValidationAdapter
    └── UsageSummaryAdapter
    ↓
WorkflowTemplateDetailView
```

Mutations go through dedicated version/configuration commands.

---

## No generic workflow JSON PATCH

Avoid canonical API like:

```text
PATCH workflowTemplate
{
  stages: [...],
  transitions: [...],
  gates: [...]
}
```

with no revision/domain validation.

Use typed commands/services under one draft version.

---

## Draft version creation

Conceptually:

```text
createWorkflowTemplateDraft(
    workflowTemplateId,
    sourceVersionId?,
    expectedTemplateRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. verify WorkflowTemplate;
3. verify source version;
4. clone immutable definition into a new draft;
5. create new definition IDs/lineage as required;
6. preserve published version;
7. emit Audit/outbox.

---

## Draft clone ≠ shared mutable child rows

Critical.

If v8 was cloned from v7, editing v8's StageDefinition must never change v7.

Use immutable/version-owned definition records or equivalent copy-on-write semantics.

---

## Add stage command

Conceptually:

```text
addStageDefinition(
    workflowTemplateVersionId,
    stageInput,
    expectedVersionRevision
)
```

must:

* authorize,
* verify draft,
* validate unique stable key,
* create stage within same version,
* invalidate previous validation.

---

## Update stage command

Only draft stages may be materially edited.

Published version mutation rejected server-side.

---

## Remove stage command

Before removal from draft, validate dependent:

* transitions,
* gates,
* Task/Milestone definitions,

and either reject or require explicit coordinated removal.

Do not leave dangling references.

---

## Reorder stage command

Reordering presentation must not implicitly rewrite TransitionDefinitions.

This is critical.

---

## Transition command

Conceptually:

```text
addTransitionDefinition(
    versionId,
    fromStageId,
    toStageId,
    conditions?,
    gates?,
    expectedRevision
)
```

must verify:

* both stages belong to exact version,
* no invalid duplicate transition,
* graph constraints,
* tenant/version ownership.

---

## Transition deletion

Deletes only draft definition relation.

Never runtime history.

---

## Typed conditions

Use allowlisted schemas such as:

```text
ConditionType
FieldReference
Operator
Value
PolicyReference
```

Do not execute arbitrary user-authored code.

---

## Condition schema versioning

If condition DSL changes later:

historical WorkflowTemplateVersions must remain interpretable.

Pin:

```text
conditionSchemaVersion
```

or equivalent.

---

## Gate configuration

Conceptually:

```text
configureGateDefinition(
    versionId,
    transition/stage context,
    gateType,
    policy reference,
    expectedRevision
)
```

must validate the referenced policy/domain.

---

## Gate references exact policy/version where required

Example:

```text
ApprovalPolicyVersion AP-v3
```

rather than:

```text
ApprovalPolicy → latest
```

when historical workflow behavior must remain reproducible.

---

## Gate runtime evaluation is not stored in template

Absolute.

---

## Workflow graph validator

Use centralized:

```text
WorkflowDefinitionValidationService.validate(versionId)
```

It should validate at minimum:

1. exact version ownership;
2. required stage semantics;
3. unique stable keys;
4. valid transition endpoints;
5. no dangling references;
6. configured start behavior;
7. terminal/completion semantics where required;
8. graph reachability according to policy;
9. illegal cycles where prohibited;
10. gate definitions;
11. condition schemas;
12. Task/Milestone definition references;
13. tenant integrity.

---

## Cycles require policy, not blanket assumptions

Some real workflows may permit:

```text
Review → Draft
```

rework loops.

Therefore do not simply ban all cycles.

Instead distinguish:

* valid configured rework loops,
* unintended/unreachable/deadlocked cycles.

Exact rules Phase 3D.

---

## Reachability validation

A published stage should not be accidentally impossible to reach unless deliberately configured.

---

## Dead-end validation

Non-terminal stages should not unexpectedly have no allowed outgoing path.

---

## Transition ambiguity

If multiple transitions can apply simultaneously, that may be valid.

If selection requires priority, priority semantics must be explicit.

Do not depend on array order accidentally.

---

## Publish command

Conceptually:

```text
publishWorkflowTemplateVersion(
    workflowTemplateId,
    versionId,
    expectedTemplateRevision,
    expectedVersionRevision,
    idempotencyKey
)
```

must:

1. authenticate/authorize;
2. verify version belongs to template;
3. verify Draft state;
4. rerun fresh validation;
5. reject on blocking issues;
6. freeze definition;
7. atomically mark version Published;
8. update `currentPublishedVersionId`;
9. supersede previous current version appropriately;
10. emit Audit/outbox;
11. invalidate template-use caches.

---

## Fresh validation before publish

Cached `VALID` cannot be trusted after:

* stage edit,
* transition edit,
* gate edit.

Use current revision.

---

## Publication atomicity

Critical.

Never expose:

```text
currentPublishedVersionId = v8
```

before v8 is frozen/Published successfully.

---

## Publication idempotency

Repeated publish request returns same published result.

No duplicate version/event effects.

---

## Publish race

Two drafts competing to publish must use revision/locking checks.

One cannot silently overwrite the other as current.

---

## Runtime instantiation

Design 108's Project creation should call:

```text
instantiateProjectWorkflow(
    projectId,
    workflowTemplateVersionId,
    idempotencyKey
)
```

which creates:

```text
ProjectWorkflow
ProjectStageInstance[]
runtime gate references/evaluation context
```

and any configured canonical runtime work definitions.

---

## Runtime instantiation must use exact version

Never:

```text
workflowTemplate.currentPublishedVersionId
```

after Project creation has pinned a version.

---

## Runtime provenance

Store:

```text
sourceWorkflowTemplateVersionId
sourceStageDefinitionId
sourceTransitionDefinitionId where needed
```

for audit/reconstruction.

---

## Runtime independence

After instantiation:

ProjectWorkflow transitions use copied/instantiated version rules or exact immutable source definition.

They must never follow the template's **new current version**.

---

## Runtime StageTransition service

Design 023/runtime engine should conceptually perform:

```text
transitionProjectStage(
    projectId,
    targetStageInstanceId,
    expectedWorkflowRevision,
    idempotencyKey
)
```

using the exact runtime/source-version rules.

Design 110 does not execute this command.

---

## Runtime gate evaluation

Project transition calls centralized runtime gate evaluators.

If a gate source is:

* unavailable,
* stale,
* unknown,

the transition should fail safe according to policy.

---

## Frontend drag/drop is never authority

If Design 110 uses visual drag/drop for configuration:

dragging creates a draft configuration command.

If runtime screens later use drag/drop:

they call the canonical runtime transition command.

No client-only state mutation.

---

## TaskDefinition instantiation

If stage configuration creates work:

```text
TaskDefinition
    ↓
TaskService.createFromDefinition(...)
```

with idempotency and source lineage.

---

## MilestoneDefinition instantiation

Same.

---

## Relative schedule resolution

Template-relative durations are resolved at runtime against explicit anchors.

Example:

```text
Task due +2 days after stage entered
```

The template stores the rule.

The Project Task stores the actual due date.

---

## Assignment-rule resolution

Template rule such as:

> Project Editor

is resolved against canonical Project Team/Role assignments at runtime.

Do not copy security permissions from template.

---

## Template usage query

Design 110 may show usage if frozen:

```text
getWorkflowVersionUsage(versionId)
```

permission-safe and version-specific.

---

## Usage does not block draft editing

Editing v8 is safe even while v7 has 500 Projects.

But destructive mutation of v7 remains prohibited.

---

## Archival

Archiving WorkflowTemplate:

* blocks/limits future use,
* preserves published versions,
* preserves active Projects,
* never disables runtime workflow automatically.

---

## Search

Design 079 may index safe template metadata.

Search is never:

* validation authority,
* publication authority,
* runtime transition authority.

---

## Audit

Material actions should include:

```text
WorkflowDraftCreated
StageDefinitionAdded
StageDefinitionChanged
TransitionDefinitionChanged
GateDefinitionChanged
WorkflowValidationFailed
WorkflowTemplateVersionPublished
WorkflowTemplateArchived
```

according to audit-noise policy.

---

## Activity

Human-readable configuration activity may summarize changes.

Activity ≠ immutable version definition ≠ Audit.

---

## Events/outbox

Useful canonical events:

```text
WorkflowTemplateDraftCreated
WorkflowTemplateVersionPublished
WorkflowTemplateArchived
```

Consumers:

* Design 108 template availability,
* Design 109 library,
* Search,
* notifications.

They do **not** update active Projects.

---

## Caching

Detail caches should vary by:

```text
organizationMembershipId
workflowTemplateId
selectedVersionId
authorizationRevision
templateRevision
versionRevision
validationRevision
usageRevision
```

---

## Immutable version caching

Published versions can be strongly cached by exact version ID.

Drafts require revision-aware invalidation.

---

## Performance

Use:

* one template/version load,
* batched stages/transitions/gates,
* graph validation on save/publish as appropriate,
* lazy usage/history,
* no runtime Project loading for configuration except permission-safe summary.

---

## Partial failure contract

Example:

```text
Workflow core      ✓
Draft version      ✓
Stages             ✓
Transitions        ✓
Gate policy service✕
Validation         partial
Usage              ✓
```

Correct:

> Draft available. Gate policy cannot currently be validated. Publication readiness unknown/blocked.

Incorrect:

> Workflow valid.

---

## Backend Requirement Matrix

| Requirement                                             | Status                                |
| ------------------------------------------------------- | ------------------------------------- |
| Canonical WorkflowTemplate reuse from 109               | **Critical**                          |
| WorkflowTemplate/WorkflowTemplateVersion separation     | **Critical**                          |
| Draft/published separation                              | **Critical**                          |
| Latest/current-published separation                     | **Critical**                          |
| Published version immutability                          | **Critical**                          |
| Draft copy isolation from source version                | **Critical**                          |
| StageDefinition/runtime StageInstance separation        | **Critical**                          |
| Stage stable ID/label separation                        | **Critical**                          |
| Stage display order/transition graph separation         | **Critical**                          |
| Explicit start/terminal semantics                       | **Critical where required**           |
| TransitionDefinition/runtime StageTransition separation | **Critical**                          |
| Transition endpoint validation                          | **Critical**                          |
| GateDefinition/runtime GateEvaluation separation        | **Critical**                          |
| GateDefinition/ApprovalRequest separation               | **Critical**                          |
| Exact policy/version references                         | **Critical where applicable**         |
| Typed ConditionDefinition                               | **Critical**                          |
| Arbitrary JS/eval prohibited                            | **Critical**                          |
| Condition schema versioning                             | **Critical**                          |
| TaskDefinition/Task separation                          | **Critical if configured**            |
| MilestoneDefinition/Milestone separation                | **Critical if configured**            |
| Assignment rule/User authorization separation           | **Critical**                          |
| Relative schedule/runtime due date separation           | **Critical**                          |
| Central graph validation service                        | **Critical**                          |
| Dangling-reference prevention                           | **Critical**                          |
| Reachability validation                                 | **Critical**                          |
| Dead-end validation                                     | **Critical**                          |
| Cycle semantics explicit                                | **Critical**                          |
| Fresh validation before publish                         | **Critical**                          |
| Validation revision awareness                           | **Critical**                          |
| Publication atomicity                                   | **Critical**                          |
| Publication idempotency                                 | **Critical**                          |
| Publication concurrency protection                      | **Critical**                          |
| Runtime instantiation exact-version pinning             | **Critical**                          |
| Runtime provenance                                      | **Critical**                          |
| Runtime independence after creation                     | **Critical**                          |
| No active-Project auto-update on publish                | **Critical**                          |
| Template archive/runtime separation                     | **Critical**                          |
| Design 108 consumer revalidation                        | **Critical**                          |
| Design 023 runtime authority                            | **Critical**                          |
| Design 029 approval reuse                               | **Critical where gates use approval** |
| Design 111 Task/Milestone reuse                         | **Critical architecture**             |
| Design 112 assignment reuse                             | **Critical architecture**             |
| Cross-tenant references prohibited                      | **Critical**                          |
| Permission separation read/use/edit/publish             | **Critical**                          |
| Permission-safe usage summaries                         | **Required if present**               |
| Search not workflow authority                           | **Critical**                          |
| Audit/outbox integration                                | **Required**                          |
| Partial dependency failure handling                     | **Critical**                          |

---

# 8. Consolidation

Design 110 has a high risk of conflating **workflow design-time configuration** with **Project runtime execution**.

**WorkflowTemplate / WorkflowTemplateVersion conflation**
Stable reusable identity and exact definition collapse.

**Published version / Draft version conflation**
Unpublished edits affect future production workflows.

**Latest version / current published conflation**
Newest draft becomes live accidentally.

**Draft clone / shared child-record conflation**
Editing v8 mutates v7.

**Published version / mutable configuration conflation**
Historical Projects become unreconstructable.

**WorkflowTemplate / ProjectWorkflow conflation**
Shared configuration becomes runtime workflow.

**WorkflowTemplateVersion / runtime workflow revision conflation**
Project execution state becomes template version state.

**StageDefinition / ProjectStageInstance conflation**
Template stage stores client-specific state.

**Stage label / Stage identity conflation**
Rename breaks history and transitions.

**Stage order / transition graph conflation**
Dragging a column silently changes process logic.

**First visual stage / start-stage conflation**
Presentation determines workflow semantics.

**Last visual stage / terminal-stage conflation**
UI ordering determines completion.

**Stage removal in draft / runtime stage deletion conflation**
Active Projects lose stages.

**TransitionDefinition / StageDefinition conflation**
Stage adjacency becomes transition permission.

**Visual connector / canonical transition conflation**
Backend process rule exists only in UI.

**Transition configuration / runtime transition history conflation**
Template stores who moved a Project and when.

**Backward movement / invalid transition conflation**
Rework loops cannot be represented.

**Any cycle / invalid graph conflation**
Legitimate revision loops get prohibited blindly.

**Uncontrolled cycle / valid rework loop conflation**
Workflow can deadlock.

**Array order / transition priority conflation**
Ambiguous branching behaves unpredictably.

**GateDefinition / GateEvaluation conflation**
Reusable rule stores runtime pass/fail.

**GateDefinition / ApprovalRequest conflation**
Template configuration becomes formal client/project approval.

**Approval policy / latest policy conflation**
Historical workflow behavior changes when policy edits.

**Gate unavailable / gate failed conflation**
Dependency outage becomes business rejection.

**Gate unavailable / gate passed conflation**
System fails open.

**ConditionDefinition / executable code conflation**
User-authored arbitrary logic becomes security/runtime risk.

**Condition / authorization conflation**
Workflow rule bypasses RBAC.

**Condition schema change / historical-rule rewrite conflation**
Old WorkflowVersions become uninterpretable.

**TaskDefinition / Task conflation**
Reusable work configuration stores runtime completion.

**MilestoneDefinition / Milestone conflation**
Template carries Project-specific progress.

**Relative schedule / actual due date conflation**
Template edit shifts live Project deadlines.

**Assignment rule / assigned User conflation**
Reusable role default becomes security assignment.

**Template publisher / runtime approver conflation**
Configuration authority becomes approval authority.

**Runtime stage operator / workflow editor conflation**
Project user changes global workflow.

**Project owner / template publisher conflation**
Operational responsibility grants organization-wide process control.

**Valid draft / published conflation**
Validation automatically changes production configuration.

**Validation cached / current validation conflation**
Edited draft publishes using stale success.

**Validation unavailable / valid conflation**
System fails open.

**Invalid draft / published version invalid conflation**
Existing safe workflow becomes unusable.

**Publication / ordinary save conflation**
Draft edits instantly affect future Projects.

**Publish retry / duplicate publication conflation**
Version pointers/events corrupt.

**Publish race / last-write-wins conflation**
Two drafts both believe they are current.

**Workflow publication / active Project migration conflation**
Mass runtime mutation occurs.

**Template archive / runtime workflow disablement conflation**
Active Projects stop working.

**Runtime instantiation / current-template lookup conflation**
Project created from v7 starts following v8.

**Runtime definition ID / runtime instance ID conflation**
Multiple Projects share stage records.

**Runtime transition / frontend drag state conflation**
Client moves Project without server validation.

**ProjectTemplateVersion / current WorkflowTemplate conflation**
Project template silently upgrades workflows.

**ProjectTemplate / WorkflowTemplate conflation**
Initialization defaults and stage graph become one object.

**WorkflowTemplate / Package conflation**
Commercial offering becomes delivery process.

**Builder UI / builder domain conflation**
Outreach Sequence Builder and Workflow Builder share one unsafe execution engine.

**Sequence condition / workflow transition condition conflation**
Domain-specific semantics are lost.

**Deal stage / Project stage conflation**
Sales pipeline and delivery workflow reuse wrong entities.

**Search index / current workflow configuration conflation**
Stale indexed version is used for Project creation.

**Usage count / runtime authority conflation**
Template summary is treated as Project state.

**Usage unavailable / zero conflation**
Impact of changes is hidden.

**Generic JSON workflow blob**
Stages, transitions, gates and conditions become weakly validated.

**Generic workflow mega-PATCH**
Published and draft semantics can be bypassed.

**110/109 duplicate WorkflowTemplate backend**
Library and Detail disagree.

**110/108 duplicate Project initialization state**
Project Intake authors workflow definitions.

**110/023 duplicate ProjectWorkflow backend**
Template Detail controls runtime stage state.

**110/029 duplicate Approval engine**
Gate configuration stores approvals directly.

**110/034/111 duplicate Task/Milestone runtime**
Definitions become work records.

**110/112 assignment default / TeamAssignment conflation**
Template configuration becomes real staffing/access.

No additional screen is required.

These are **Workflow Template identity, immutable versioning, explicit stage graph semantics, transition/gate configuration, typed conditions, definition/runtime isolation, publication safety, authorization, and Project instantiation requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL WORKFLOW TEMPLATE VERSION, STAGE GRAPH, TRANSITION & GATE CONFIGURATION ANCHOR**

**Domain directive:**
**WorkflowTemplate ≠ WorkflowTemplateVersion ≠ StageDefinition ≠ TransitionDefinition ≠ GateDefinition ≠ ConditionDefinition ≠ TaskDefinition ≠ MilestoneDefinition ≠ Project ≠ ProjectWorkflow ≠ ProjectStageInstance ≠ StageTransition ≠ GateEvaluation ≠ ApprovalRequest.**

**Identity directive:**
Design 109 remains the canonical WorkflowTemplate library. Design 110 opens and configures those exact WorkflowTemplate/WorkflowTemplateVersion identities and never creates another workflow-definition domain.

**Version directive:**
WorkflowTemplate is stable identity; WorkflowTemplateVersion is the exact reusable process definition. Draft, current published and historical versions remain explicitly distinct.

**Draft-isolation directive:**
a new draft version is fully isolated from the published source definition. Editing draft v8 cannot mutate v7 child stages/transitions/gates through shared mutable rows.

**Immutability directive:**
once a WorkflowTemplateVersion is published and/or referenced by Projects, its material process definition is immutable. Changes produce another version.

**Stage directive:**
StageDefinition uses stable identity independent from labels/display order. Reordering a UI list does not implicitly change allowed workflow transitions.

**Start/terminal directive:**
workflow start/completion semantics are explicitly configured/validated rather than inferred from first/last visual position.

**Transition directive:**
all allowed stage movements are represented by explicit TransitionDefinitions. Runtime movement must use the exact instantiated/source-version transition rules rather than adjacency or client drag state.

**Cycle directive:**
workflow validation distinguishes deliberate rework loops from unintended deadlocks; it must neither blindly prohibit all cycles nor permit arbitrary cyclic graphs without validation.

**Gate directive:**
GateDefinition is reusable workflow policy/configuration; runtime GateEvaluation remains Project-specific, current, and freshness-aware.

**Approval directive:**
when a gate requires formal approval, it references canonical approval policy/configuration and runtime Design 029 ApprovalRequests. It never stores approval outcome inside the template.

**Unknown-gate directive:**
runtime source unavailability results in `UNKNOWN/BLOCKED` according to policy, never an implicit pass.

**Condition directive:**
workflow conditions use typed, allowlisted declarative schemas or policy references. Arbitrary user-authored JavaScript/eval is prohibited.

**Condition-version directive:**
condition schema/policy semantics remain version-aware so historical WorkflowTemplateVersions stay interpretable.

**Authorization directive:**
workflow conditions and gates do not replace RBAC. Passing a workflow rule never grants permission to access or mutate the underlying Project/resource.

**Task directive:**
TaskDefinition remains reusable configuration and instantiates canonical Design 034 Task records with independent runtime identities, schedules, assignments and completion.

**Milestone directive:**
MilestoneDefinition follows the same template/runtime boundary and never carries client-specific completion state.

**Assignment directive:**
template assignment rules/defaults resolve against canonical Project Team/Resource assignments at runtime and never themselves grant security roles.

**Schedule directive:**
relative template timing rules become concrete runtime dates upon stage/project events. Editing a template later never shifts dates in existing Projects.

**Validation directive:**
`WorkflowDefinitionValidationService` validates structural integrity, stage identities, transition endpoints, reachability, intended cycle semantics, gates, conditions and references using the current exact draft revision.

**Fresh-validation directive:**
publication always reruns validation against the latest draft revision. Cached `Valid` state cannot authorize publication after subsequent edits.

**Publication directive:**
publishing is an explicit authorized transition—not ordinary save. It atomically freezes the exact version, updates the current-published pointer, preserves the prior version and emits durable events.

**Publication-idempotency directive:**
repeated publication requests return the existing published result rather than creating duplicate versions or inconsistent current pointers.

**Concurrency directive:**
draft edits and publication use expected-revision/transactional safeguards so simultaneous editors or competing draft publications cannot silently overwrite each other.

**ProjectTemplate directive:**
where ProjectTemplateVersion references workflow configuration, it must preserve an exact WorkflowTemplateVersion relation. Publishing a newer Workflow version does not mutate already-published ProjectTemplateVersions.

**Instantiation directive:**
Design 108 creates runtime ProjectWorkflow/StageInstances from one exact pinned WorkflowTemplateVersion and preserves definition provenance.

**Runtime-independence directive:**
after Project creation, runtime ProjectWorkflow state is independent. Active Projects never query the template's current version to decide what their stages are.

**No-auto-migration directive:**
publishing v8 affects future eligible Project creation only. Projects created from v7 stay on their v7-derived runtime workflow until an explicit migration capability is separately governed.

**Runtime-transition directive:**
Design 023/runtime Project services remain authoritative for actual stage changes. Design 110 configures permitted behavior but never records Project transitions.

**Archive directive:**
archiving the WorkflowTemplate removes/limits future selection but preserves all version history and never disables or deletes existing Project workflows.

**Builder-reuse directive:**
Design 013 and Design 110 may share visual builder primitives, but Outreach Sequence and Project Workflow remain separate typed execution domains with separate validators/services.

**Deal-stage directive:**
Deal pipeline stages from Design 096 remain separate from Project workflow stages even if shared low-level stage/transition UI primitives exist.

**Tenant directive:**
WorkflowTemplate, versions, stages, transitions, gates, referenced policy/template definitions and future Project use are strictly tenant-scoped.

**Permission directive:**
read, use, draft edit, stage/transition/gate configuration, publish and archive authorities remain independently server-enforced. Project operators do not automatically become template administrators.

**Search directive:**
Design 079 may index safe workflow-template metadata but Search never determines exact publish state, validation, version usability or runtime workflow behavior.

**Caching directive:**
draft caches are revision-aware; published immutable versions may be cached by exact version ID; current-version and validation caches are invalidated atomically on publication/configuration changes.

**Partial-failure directive:**
workflow core, stage/transition data, external gate policies, validation and usage can fail independently. Missing gate-policy validation can never be interpreted as a valid/publishable workflow.

**Performance directive:**
load one exact version with batched stages/transitions/gates; avoid loading complete Project runtime data into the builder; use lazy usage/history where present.

**Audit directive:**
draft/version creation, material stage/transition/gate changes, publication and archival produce actor/version-aware Audit evidence while actual Project stage movements stay in Project runtime history.

**Future-reuse directive:**
Design **111 — Project Tasks / Milestones Detail** must consume canonical Task/Milestone runtime instances produced by Project initialization/workflow behavior and must never treat TaskDefinition/MilestoneDefinition from Design 110 as live client work.

**Overlap directive:**
Designs **023, 029, 034, 108–112** plus shared builder primitives from Design **013** must preserve one continuous **WorkflowTemplate → WorkflowTemplateVersion → Stage/Transition/Gate/Task/Milestone Definitions → Project creation → runtime ProjectWorkflow/StageInstances/Tasks/Milestones → runtime evaluations/transitions** lineage while keeping reusable configuration and Project execution independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE WORKFLOW TEMPLATE CONFIGURATION FOUNDATION — STABLE WORKFLOWTEMPLATE IDENTITY + IMMUTABLE PUBLISHED WORKFLOWTEMPLATEVERSIONS + ISOLATED DRAFT COPIES + STABLE STAGEDEFINITIONS + EXPLICIT TRANSITIONDEFINITIONS + TYPED VERSION-AWARE CONDITIONS + GATEDEFINITIONS REFERENCING CANONICAL POLICIES + CENTRAL GRAPH VALIDATION + ATOMIC/IDEMPOTENT PUBLICATION + EXACT-VERSION RUNTIME INSTANTIATION + COMPLETE DEFINITION PROVENANCE + STRICT TEMPLATE/RUNTIME SEPARATION — AND NEVER ALLOW UI ORDER, DRAG STATE, “LATEST” VERSION LOOKUPS, ARBITRARY CODE, TEMPLATE PUBLICATION, GATE CONFIGURATION OR SHARED BUILDER COMPONENTS TO MUTATE EXISTING PROJECT WORKFLOWS OR SUBSTITUTE FOR CANONICAL RUNTIME TRANSITIONS, APPROVALS, TASKS, MILESTONES OR AUTHORIZATION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **110 / 153** |
| **PASS**                                   |                        **110** |
| **STANDARDIZE decisions**                  |                        **108** |
| **Potential implementation-overlap flags** |                        **101** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**110 / 153 = 71.9% audited.**

### Canonical workflow architecture after Design 110

```text
WORKFLOW TEMPLATE WT-1
        │
        ├── v7 PUBLISHED
        │      ├── Stage A
        │      ├── Stage B
        │      ├── Stage C
        │      ├── Transitions
        │      └── Gates
        │
        └── v8 DRAFT
               ├── Stage A
               ├── Stage B
               ├── Stage C
               ├── Stage D
               ├── revised transitions
               └── revised gates
```

The draft/published boundary is strict:

```text
v8 exists
   ≠
v8 published
   ≠
v8 usable by default
   ≠
v8 applied to Projects on v7
```

Runtime creation remains:

```text
WorkflowTemplateVersion v7
           ↓
       instantiate
           ↓
ProjectWorkflow PW-100
           │
     ┌─────┼─────┐
     ↓     ↓     ↓
 Stage A Stage B Stage C
 instances

PW-100 now owns runtime execution.
```

Publishing a newer version does not mutate that runtime:

```text
Publish Workflow v8
        ↓

Future Project → may use v8

Existing PR-100/PW-100
        → remains v7-derived
```

And stage semantics remain explicit:

```text
Display order:

A
B
C

does NOT automatically mean:

A → B → C

Allowed movement comes from
TransitionDefinition records.
```

Likewise:

```text
GateDefinition:
“Formal approval required”

        ≠

ApprovalRequest
        ≠
ApprovalDecision
        ≠
runtime GateEvaluation
```

Each remains separately canonical.

## Next Sequential Audit Target

### **Design 111 — Project Tasks / Milestones Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
