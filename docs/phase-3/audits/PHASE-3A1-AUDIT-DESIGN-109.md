# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 109 — Project Template / Workflow Template Library

Design 109 should become the **canonical Team Workspace reusable delivery-configuration library** for discovering and governing Project Templates and Workflow Templates that initialize future Projects, while preserving a strict separation between reusable definitions and runtime Project state.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **ProjectTemplate ≠ ProjectTemplateVersion ≠ WorkflowTemplate ≠ WorkflowTemplateVersion ≠ StageDefinition ≠ TransitionDefinition ≠ GateDefinition ≠ TaskDefinition ≠ MilestoneDefinition ≠ Project ≠ ProjectWorkflow ≠ ProjectStageInstance ≠ Task ≠ Milestone.**

The central implementation rule is:

> **Design 109 may present Project Templates and Workflow Templates in one reusable library experience, but it must never flatten them into one mutable template entity. ProjectTemplate defines reusable Project initialization context; WorkflowTemplate defines reusable workflow/stage behavior. Published template versions are immutable historical definitions, Projects pin exact versions at creation, runtime stages/tasks/milestones are instantiated records, and later template edits affect future Projects only unless an explicit governed migration is separately introduced.**

---

# 1. Classification

| Audit field                                | Classification                                                                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                              | **109**                                                                                                                                                                                    |
| **Canonical name**                         | **Project Template / Workflow Template Library**                                                                                                                                           |
| **Product area**                           | Team Workspace / Projects / Delivery Configuration                                                                                                                                         |
| **User surface**                           | **Authenticated Team Workspace**                                                                                                                                                           |
| **Screen class**                           | Template Library / Reusable Operational Configuration Workspace                                                                                                                            |
| **Classification**                         | **Canonical Project & Workflow Template Discovery, Version-Summary & Reuse Anchor**                                                                                                        |
| **Primary purpose**                        | Discover reusable Project and Workflow templates, inspect their current published/draft versions and availability, and select the correct exact versions for future Project initialization |
| **Primary entity family A**                | **ProjectTemplate**                                                                                                                                                                        |
| **Version family A**                       | **ProjectTemplateVersion**                                                                                                                                                                 |
| **Primary entity family B**                | **WorkflowTemplate**                                                                                                                                                                       |
| **Version family B**                       | **WorkflowTemplateVersion**                                                                                                                                                                |
| **Workflow definition dependencies**       | StageDefinition / TransitionDefinition / GateDefinition                                                                                                                                    |
| **Initialization definition dependencies** | TaskDefinition / MilestoneDefinition / project defaults                                                                                                                                    |
| **Project creation dependency**            | Design 108                                                                                                                                                                                 |
| **Project runtime dependency**             | Design 023                                                                                                                                                                                 |
| **Task dependency**                        | Design 034 / upcoming 111                                                                                                                                                                  |
| **Team/resource dependency**               | upcoming 112                                                                                                                                                                               |
| **Detail/configuration dependency**        | Design 110                                                                                                                                                                                 |
| **Library projection**                     | `TemplateLibraryEntry` / discriminated ProjectTemplate or WorkflowTemplate summary                                                                                                         |
| **Primary query service**                  | `DeliveryTemplateLibraryQueryService`                                                                                                                                                      |
| **Project-template service**               | `ProjectTemplateService`                                                                                                                                                                   |
| **Workflow-template service**              | `WorkflowTemplateService`                                                                                                                                                                  |
| **Version service**                        | domain-specific version services                                                                                                                                                           |
| **Usage resolver**                         | `TemplateUsageQueryService`                                                                                                                                                                |
| **Parent shell**                           | `InternalAppShell` — Design 001                                                                                                                                                            |
| **Auth**                                   | Required                                                                                                                                                                                   |
| **Authorization**                          | Active OrganizationMembership + template read/use/manage/publish permissions                                                                                                               |
| **Implementation priority**                | **Critical Reusable Delivery Configuration / Runtime Isolation / Version Integrity**                                                                                                       |
| **Reuse level**                            | **Extremely High across Project creation and all downstream Project workflows**                                                                                                            |

Design 109 should answer:

> **“Which reusable Project and Workflow templates exist, which exact versions are currently published for future use, which drafts or historical versions exist, what broad initialization/workflow purpose does each serve, and which version may safely be selected for a new Project without changing any existing Project?”**

Canonical structure:

```text
DELIVERY TEMPLATE LIBRARY
          │
          ├──────────────────────────┐
          ↓                          ↓
 ProjectTemplate               WorkflowTemplate
      │                              │
      ↓                              ↓
ProjectTemplateVersion       WorkflowTemplateVersion
      │                              │
      │                        ┌─────┼─────────┐
      │                        ↓     ↓         ↓
      │                    Stages Transitions Gates
      │
      └──────────────┬───────────────┘
                     ↓
              Project Intake
               Design 108
                     ↓
                 PROJECT
                     │
             ProjectWorkflow
                     │
          Runtime Tasks/Milestones
```

---

# 2. Reuse

## Design 108 remains the consumer

Design 108 already established:

```text
Project Intake
     ↓
ProjectTemplateVersion
+
WorkflowTemplateVersion
     ↓
ProjectCreationService
```

Design 109 provides those reusable definitions.

It does not create the Project itself.

---

## ProjectTemplate ≠ Project

Permanent.

Correct:

```text
ProjectTemplate PT-10
      ↓
ProjectTemplateVersion v4
      ↓ instantiate
Project PR-100
```

The template remains reusable.

The Project becomes its own runtime entity.

---

## WorkflowTemplate ≠ ProjectWorkflow

Permanent.

Correct:

```text
WorkflowTemplate WT-20
      ↓
WorkflowTemplateVersion v7
      ↓ instantiate
ProjectWorkflow PW-100
```

After instantiation, `PW-100` owns runtime execution state.

---

## ProjectTemplate ≠ WorkflowTemplate

This is the most important Design 109 distinction.

### ProjectTemplate

Defines reusable **Project initialization/configuration**.

Potentially includes, where present in the frozen design/model:

* project defaults,
* delivery type/context,
* recommended workflow,
* default milestone/task definitions,
* initialization configuration.

### WorkflowTemplate

Defines reusable **workflow behavior**:

* stage definitions,
* transitions,
* gates,
* process ordering/rules.

One may reference the other.

They are not interchangeable.

---

## One shared library UI is acceptable

A discriminated list entry may conceptually expose:

```text
TemplateLibraryEntry
├── type = PROJECT_TEMPLATE | WORKFLOW_TEMPLATE
├── canonicalId
├── name
├── currentPublishedVersion
├── draft state
├── lifecycle
├── usage summary
└── availability
```

This is a read projection.

It does not justify a generic mutable:

```text
Template {
  everythingJson
}
```

backend.

---

## Design 110 remains Workflow Template detail authority

Design 109 should discover/open Workflow Templates.

Design 110 later specializes:

* exact WorkflowTemplateVersion,
* stages,
* transitions,
* gate configuration.

Design 109 must not duplicate the workflow editor.

---

## ProjectTemplate detail can reuse the same family primitives

Even if no separately frozen ProjectTemplate Detail screen exists, ProjectTemplate-specific inspection/configuration must remain domain-aware within the approved existing design family.

Do not invent another screen during Phase 3A.1.

---

## Design 023 Project runtime remains independent

Existing Projects should continue to function if:

* ProjectTemplate is archived,
* WorkflowTemplate is archived,
* template service is temporarily unavailable.

Projects must retain instantiated runtime state and exact source-version lineage.

---

## Design 034 Tasks remain canonical runtime work

A TaskDefinition inside a template is not a Task.

Correct:

```text
TaskDefinition TD-4
       ↓ instantiate
Task T-902
```

---

## MilestoneDefinition ≠ Milestone

Same rule.

---

## StageDefinition ≠ ProjectStageInstance

Same rule.

---

## Package ≠ ProjectTemplate

Designs 104–105 remain commercial configuration.

A commercial Package may map to a ProjectTemplate.

It must never become the ProjectTemplate itself.

---

## Package ≠ WorkflowTemplate

Permanent.

---

## Template mapping ≠ historical commercial truth

If:

```text
Package PK1
→ recommended ProjectTemplate PT4
```

the mapping can affect future Project creation.

Changing that mapping later cannot alter:

* Contract,
* Project already created,
* Project workflow already instantiated.

---

# 3. Entities

## ProjectTemplate

`ProjectTemplate` is the stable identity of a reusable Project initialization pattern.

Conceptually:

```text
ProjectTemplate
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

## ProjectTemplate ≠ ProjectTemplateVersion

Permanent.

The stable template identity answers:

> Which reusable initialization pattern is this?

The version answers:

> What exact initialization configuration did this revision contain?

---

## ProjectTemplateVersion

Conceptually:

```text
ProjectTemplateVersion
├── id
├── projectTemplateId
├── version
├── project defaults
├── initialization definitions
├── recommended/pinned WorkflowTemplateVersion reference
├── TaskDefinition[]
├── MilestoneDefinition[]
├── lifecycle
├── createdBy
└── publishedAt
```

Exact schema belongs to Phase 3D.

---

## Published ProjectTemplateVersion should be immutable

Once selected for Project creation:

material configuration cannot change in place.

Future change:

```text
v4
→ create draft v5
→ publish v5
```

not:

```text
UPDATE v4
```

---

## Draft version ≠ published version

Critical.

Valid:

```text
Published = v4
Draft = v5
```

New Projects continue to use v4 by default until v5 is explicitly published/selected under policy.

---

## Latest created ≠ current published

Permanent.

---

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

---

## WorkflowTemplateVersion

Exact workflow definition.

Conceptually:

```text
WorkflowTemplateVersion
├── id
├── workflowTemplateId
├── version
├── StageDefinition[]
├── TransitionDefinition[]
├── GateDefinition[]
├── lifecycle
├── createdBy
└── publishedAt
```

---

## Published WorkflowTemplateVersion is immutable

Absolute for workflow semantics once used.

Changing:

* stage graph,
* transition rules,
* gates,
* requirements,

creates another version.

---

## StageDefinition

Reusable stage definition.

Conceptually:

```text
StageDefinition
├── id
├── workflowTemplateVersionId
├── stableKey
├── label
├── ordering/presentation
├── entry/exit metadata
└── configuration
```

---

## Stage label ≠ Stage identity

Renaming:

> Draft Review

to:

> Editorial Review

must not make them different runtime identities inside the same definition lineage unless the business deliberately creates a new stage definition.

Stable key/ID matters.

---

## Stage order ≠ transition graph

Critical.

A UI order of:

```text
A
B
C
```

does not necessarily prove:

```text
A → B → C
```

Transition semantics must be explicit.

---

## TransitionDefinition

Conceptually:

```text
TransitionDefinition
├── id
├── workflowTemplateVersionId
├── fromStageDefinitionId
├── toStageDefinitionId
├── conditions/gates
└── policy
```

---

## Transition ≠ visual connector

Permanent.

Backend transition rules remain explicit and server-authoritative.

---

## GateDefinition

Defines a reusable requirement/gate for a transition/stage.

Examples can conceptually reference:

* Approval policy,
* required milestone,
* required deliverable,
* readiness condition.

GateDefinition is configuration.

It is not the runtime Approval/Milestone itself.

---

## GateDefinition ≠ ApprovalRequest

Permanent.

---

## GateDefinition ≠ ProjectApprovalGate instance

Permanent.

---

## TaskDefinition

Reusable work-definition configuration.

Conceptually:

```text
TaskDefinition
├── projectTemplateVersionId
├── stableKey
├── title template
├── relative schedule/default
├── assignment rule/default
└── configuration
```

---

## TaskDefinition ≠ Task

Absolute.

---

## TaskDefinition completion state prohibited

Template definitions never store runtime:

```text
completedAt
assignee current state
```

for client Projects.

---

## MilestoneDefinition

Same reusable-definition boundary.

---

## Workflow version ≠ runtime workflow revision

Important.

A ProjectWorkflow may evolve operationally after instantiation:

* stage moves,
* deadlines,
* allowed corrections.

That runtime revision is independent from the source WorkflowTemplateVersion.

---

## Source version lineage

Every Project created from templates should preserve:

```text
sourceProjectTemplateVersionId
sourceWorkflowTemplateVersionId
```

while also storing instantiated runtime configuration.

---

## Source lineage ≠ live dependency

A Project should not require the current template to know its stages/tasks.

---

## Template lifecycle

Conceptually:

```text
Draft
Active
Inactive
Archived
```

for stable template identity.

Exact enums Phase 3D.

---

## Version lifecycle

Conceptually:

```text
Draft
Published
Superseded
Historical
```

---

## Template lifecycle ≠ version lifecycle

Valid:

```text
WorkflowTemplate = ACTIVE
Published version = v7
Historical versions = v1–v6
Draft version = v8
```

---

## Archived template ≠ historical version deleted

Absolute.

---

## Usage summary

A library may show:

* number of Projects using a version,
* last used,
* linked ProjectTemplate/WorkflowTemplate.

Those are read projections.

They must not become mutable counters relied on for history.

---

## Usage count ≠ permission to inspect Projects

Permanent.

Permission-filtered aggregation required.

---

## Version usage matters for destructive actions

A version referenced by historical Projects must not be destructively removed even if no longer current.

---

## Clone/Duplicate semantics

If frozen Design 109 contains duplication:

clone must create a new Template identity/version lineage.

It must never copy:

* runtime Project state,
* client-specific assignments,
* Task completion,
* Project activity.

---

# 4. Permissions

Design 109 should conceptually distinguish:

```text
projectTemplate.read
projectTemplate.use
projectTemplate.create
projectTemplate.editDraft
projectTemplate.publish
projectTemplate.archive

workflowTemplate.read
workflowTemplate.use
workflowTemplate.create
workflowTemplate.editDraft
workflowTemplate.publish
workflowTemplate.archive
```

Exact keys belong to Phase 3D.

---

## Read ≠ use

Potentially important.

A user may be allowed to inspect a template but not initialize new Projects from it.

---

## Use ≠ edit

Permanent.

---

## Edit draft ≠ publish

Critical.

Publishing reusable workflow changes can affect all future Projects.

---

## ProjectTemplate edit ≠ WorkflowTemplate edit

Permanent.

---

## Project creation permission ≠ template administration

Critical.

A user creating Projects should normally consume published definitions, not modify shared templates.

---

## Project owner ≠ template owner/administrator

Permanent.

---

## Workflow stage operator ≠ WorkflowTemplate editor

Permanent.

Moving a runtime Project between stages never grants permission to modify the shared workflow definition.

---

## Archive permission ≠ delete permission

Archived templates remain historical configuration.

---

## Direct TemplateVersion ID reauthorizes

Knowing a version ID grants nothing.

---

## Historical version read may differ from current use permission

A historical version may be inspectable for audit/reconstruction but unavailable for new Project creation.

---

## Browser cannot force unpublished version use

Design 108/server must verify that any supplied TemplateVersion is valid and permitted for the creation context.

---

## Cross-tenant references prohibited

Absolute.

A ProjectTemplate in Organization A cannot:

* reference WorkflowTemplateVersion in Organization B,
* contain definitions from Organization B,
* be used to create Project in Organization B.

---

## Usage summaries must be permission-safe

Counts cannot leak confidential Client/Project existence.

---

# 5. States

Design 109 must keep **Template lifecycle, Version lifecycle, draft/publication state, use availability, reference validity, and usage state** separate.

### ProjectTemplate lifecycle

```text
Draft
Active
Inactive
Archived
```

### ProjectTemplateVersion

```text
Draft
Published
Superseded
Historical
```

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

### Usage availability

```text
Available for New Projects
Restricted
Unavailable
Historical Only
Unknown
```

### Definition validity

```text
Valid
Needs Attention
Invalid
Validation Unknown
```

These must not collapse into one generic `template.status`.

---

## Active template ≠ valid current version

Critical.

Possible:

```text
Template = ACTIVE
Published version = INVALID / NEEDS ATTENTION
```

which should block unsafe future use.

---

## Published ≠ automatically usable

Permanent.

A published version can later become restricted by policy.

---

## Draft ≠ inactive template

Permanent.

---

## Draft v8 exists ≠ v8 current

Critical.

---

## Superseded ≠ deleted

Permanent.

---

## Historical ≠ unusable for reconstruction

Permanent.

---

## Archived ≠ existing Project invalid

Absolute.

---

## WorkflowTemplate archived ≠ ProjectWorkflow archived

Absolute.

---

## New WorkflowTemplateVersion ≠ runtime workflow migrated

Critical.

---

## New ProjectTemplateVersion ≠ existing Project reinitialized

Absolute.

---

## StageDefinition changed in v8 ≠ stage changed in Projects on v7

Permanent.

---

## Template service unavailable ≠ Project configuration unavailable

Existing Projects must rely on their runtime state.

---

## Usage service unavailable ≠ zero usage

Permanent.

---

## Validation unavailable ≠ valid

Critical.

---

## State Coverage

Design 109 inherits Design 150 plus:

```text
Template Library Loading
Template Library Available
Template Library Empty
Template Library Restricted
Template Library Partial

Project Template Draft
Project Template Active
Project Template Inactive
Project Template Archived

Project Template Version Draft
Project Template Version Published
Project Template Version Superseded
Project Template Version Historical

Workflow Template Draft
Workflow Template Active
Workflow Template Inactive
Workflow Template Archived

Workflow Version Draft
Workflow Version Published
Workflow Version Superseded
Workflow Version Historical

Template Available for New Projects
Template Historical Only
Template Restricted
Template Unavailable
Template Availability Unknown

Template Definition Valid
Template Definition Needs Attention
Template Definition Invalid
Template Validation Unavailable

Draft Version Exists
No Draft Version
Newer Published Version Exists

Usage Available
Usage Restricted
Usage Unavailable

Template Updated Elsewhere
Version Published Elsewhere
Template Version Conflict
Partial Template Summary Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should emphasize **template type, exact current version, use status, and safe future applicability**.

Conceptually:

```text
Template Library
↓
Template entries
   ├── Project Template / Workflow Template type
   ├── name/reference
   ├── current published version
   ├── draft version indicator
   ├── lifecycle
   ├── availability for new Projects
   ├── validation summary
   └── usage summary where frozen
```

Only frozen Design 109 elements/actions should render.

---

## Project vs Workflow Template must remain explicit

Do not render both as an unlabeled generic “Template”.

A user should know whether they are choosing:

> Project initialization configuration

or:

> Workflow/stage process configuration.

---

## Published vs Draft must remain visible

Correct:

> Published v7
> Draft v8 exists

Not:

> Version 8

if v8 cannot yet be used.

---

## Availability and lifecycle require separate labels

Correct:

> Active · Available for new Projects

or:

> Active · Restricted

rather than one ambiguous badge.

---

## Usage must not imply automatic migration

Example:

> Used by 24 Projects

does not imply:

> editing template updates 24 Projects.

---

## Tablet

Following Design 152:

* type/name remain primary,
* published/draft version stacks,
* lifecycle/availability remain separate,
* usage summary can collapse,
* actions remain touch-safe.

---

## Mobile

Priority:

```text
Template name
↓
Template type
↓
Published version
↓
Draft indicator
↓
Availability
↓
Lifecycle
↓
Validation
↓
Primary frozen action
```

No wide configuration table squeezed horizontally.

---

## Accessibility

A library entry could communicate:

> Editorial Production Workflow Template. Published version 7. Draft version 8 exists and is not published. Version 7 is available for new Projects and is currently referenced by 24 Projects.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical template-library architecture

```text
Design 109
    ↓
Authenticated Workspace Context
    ↓
DeliveryTemplateLibraryQueryService
    │
    ├── ProjectTemplateAdapter
    ├── ProjectTemplateVersionAdapter
    ├── WorkflowTemplateAdapter
    ├── WorkflowTemplateVersionAdapter
    ├── DefinitionValidationAdapter
    └── TemplateUsageAdapter
    ↓
TemplateLibraryEntry[]
```

Library entries remain read projections.

---

## No generic mutable Template mega-table for convenience

Avoid:

```text
Template {
  type,
  stagesJson,
  projectDefaultsJson,
  tasksJson,
  milestonesJson,
  workflowJson
}
```

as the sole canonical model if it erases critical domain distinctions.

Shared low-level versioning infrastructure is acceptable.

Canonical types remain discriminated.

---

## ProjectTemplate creation

Conceptually:

```text
createProjectTemplate(...)
```

creates stable identity.

Draft version is created separately or transactionally according to the chosen model.

---

## WorkflowTemplate creation

Same principle.

---

## Draft version creation

Conceptually:

```text
createProjectTemplateDraft(
    projectTemplateId,
    sourceVersionId?,
    expectedTemplateRevision
)
```

and:

```text
createWorkflowTemplateDraft(...)
```

should preserve the published version untouched.

---

## Draft idempotency

If business rules allow only one open draft per template, enforce that server-side.

If multiple drafts are permitted, their identities must remain explicit.

Exact rule belongs to Phase 3D.

---

## Publication command

Conceptually:

```text
publishTemplateVersion(
    templateId,
    templateVersionId,
    expectedTemplateRevision,
    expectedVersionRevision,
    idempotencyKey
)
```

must:

1. authorize publish;
2. validate exact type and ownership;
3. confirm version belongs to template;
4. validate draft/publishable state;
5. run domain-specific definition validation;
6. atomically promote current published version;
7. preserve old published version;
8. emit Audit/outbox;
9. invalidate future-use caches.

---

## Publication idempotency

Critical.

Retry cannot produce inconsistent current-version pointers.

---

## Publication atomicity

Never:

```text
template.currentPublishedVersionId = v8
```

while:

```text
v8.state = DRAFT
```

because half the transaction failed.

---

## Workflow definition validation

Before publishing a WorkflowTemplateVersion, validate at minimum:

* referenced stages exist;
* transitions point to valid stages;
* transition graph obeys policy;
* no prohibited transition cycles/dead ends;
* required start/terminal semantics exist where policy requires;
* gates reference valid definitions/policies;
* stable keys are unique;
* no cross-tenant references.

Exact rules become Design 110 / Phase 3D.

---

## ProjectTemplate definition validation

Before publishing a ProjectTemplateVersion, validate:

* referenced WorkflowTemplateVersion exists and is allowed;
* task/milestone definitions are valid;
* project defaults are internally compatible;
* no cross-tenant references;
* required configuration is complete.

---

## Template references should pin exact versions

If:

```text
ProjectTemplateVersion PT-v4
→ WorkflowTemplate WT
```

the preferred historical relation is:

```text
PT-v4
→ WorkflowTemplateVersion WT-v7
```

not:

```text
PT-v4
→ current WorkflowTemplate version
```

---

## Workflow publication does not mutate ProjectTemplateVersion

Example:

```text
PT-v4 references WT-v7

WT-v8 published later
```

PT-v4 continues to reference WT-v7.

To adopt WT-v8:

create/publish another ProjectTemplateVersion or use an explicit compatible selection at Project creation under policy.

---

## Template-use resolver

Design 108 should conceptually call:

```text
resolveUsableProjectTemplateVersion(...)
resolveUsableWorkflowTemplateVersion(...)
```

which verify:

* tenant,
* published status,
* availability,
* compatibility,
* permissions,
* policy.

---

## Search/list result cannot be used directly as authority

The server must reload/validate exact version when Design 108 creates a Project.

---

## Runtime instantiation

Project creation invokes definitions from exact pinned versions.

Conceptually:

```text
ProjectTemplateVersion
        ↓
initial Project configuration

WorkflowTemplateVersion
        ↓
ProjectWorkflow
        ↓
ProjectStageInstance[]
```

and:

```text
TaskDefinition
      ↓
Task
```

```text
MilestoneDefinition
      ↓
Milestone
```

---

## Runtime IDs must be new canonical IDs

Never reuse:

```text
StageDefinition.id
```

as runtime:

```text
ProjectStageInstance.id
```

The runtime record keeps `sourceDefinitionId`.

---

## Runtime provenance

Each instantiated entity should retain appropriate lineage:

```text
sourceTemplateVersionId
sourceDefinitionId
```

without remaining dynamically controlled by the template.

---

## Idempotent instantiation

Project initialization retries must not create:

* duplicate stages,
* duplicate Tasks,
* duplicate Milestones.

Stable lineage keys/unique constraints required.

---

## Template archive

Conceptually:

```text
archiveWorkflowTemplate(...)
```

or ProjectTemplate equivalent should:

* prevent new use according to policy;
* preserve versions;
* preserve Project lineage;
* not mutate existing runtime workflows;
* emit Audit/outbox.

---

## Hard delete protection

Referenced published/historical versions should not be destructively deleted.

If deletion exists for unused drafts, verify no downstream references first.

---

## Usage query

Conceptually:

```text
getTemplateUsageSummary(templateVersionId)
```

can aggregate:

* Project count,
* latest use,
* active/historical use,

subject to permissions.

---

## Usage summary should be version-aware

Critical.

Knowing:

> WorkflowTemplate WT used by 100 Projects

is less useful than distinguishing versions where needed:

```text
v6 → 30 Projects
v7 → 70 Projects
```

for migration/audit analysis.

---

## Usage count not canonical write field

Do not increment/decrement manually as the only source.

Use projection/query materialization.

---

## Template validation state

Can be cached/materialized, but should include:

```text
validatedVersionRevision
validatedAt
validatorVersion
```

where relevant.

A changed draft invalidates previous validation.

---

## Invalid draft ≠ invalid published version

Critical.

Example:

```text
Published v7 = valid
Draft v8 = invalid
```

New Projects can continue using v7.

Do not make the whole WorkflowTemplate globally invalid.

---

## Template changes and active Projects

No events such as:

```text
WorkflowTemplateVersionPublished
→ update all Projects
```

are allowed.

Instead publication only affects future eligible selection/cache.

---

## Explicit migration remains separate

If runtime template migration is ever required, it must be a deliberately governed Project migration capability.

Design 109 does not invent it.

---

## Optimistic concurrency

Draft edits/publication/archive actions use expected revisions.

Two editors cannot silently overwrite each other's workflow definitions.

---

## Publication race

Two drafts cannot both become current published version through last-write-wins.

---

## Archive/publish race

Atomic lifecycle/version validation required.

---

## Audit

Material actions:

```text
ProjectTemplateCreated
ProjectTemplateVersionPublished
ProjectTemplateArchived

WorkflowTemplateCreated
WorkflowTemplateVersionPublished
WorkflowTemplateArchived
```

plus material draft configuration changes as appropriate.

---

## Activity

Operational template Activity may summarize those actions.

Activity ≠ version history ≠ Audit.

---

## Events/outbox

Useful events:

```text
ProjectTemplateVersionPublished
WorkflowTemplateVersionPublished
ProjectTemplateArchived
WorkflowTemplateArchived
```

Consumers:

* Design 108 readiness/cache,
* Search,
* admin notifications.

They must not mutate runtime Projects.

---

## Search integration

Design 079 can index:

* template name,
* type,
* lifecycle,
* current version.

Search should not index/publish restricted workflow internals indiscriminately.

Search is not template authority.

---

## Notification integration

Design 080 may surface:

* template publication,
* invalid draft,
* archived version affecting future setup,

if configured.

Notification state never changes template state.

---

## Caching

Template-library caches should vary by:

```text
organizationMembershipId
authorizationRevision
template type
template revision
publishedVersion revision
validation revision
usage projection revision
```

---

## Immutable version caching

Published immutable versions can be cached aggressively by exact version ID.

Drafts require revision-aware invalidation.

---

## Performance

Use:

* server-side pagination,
* indexed template type/lifecycle,
* batched current-version loads,
* aggregated usage summaries,
* no loading complete stage/task definitions for every library row.

Detailed definitions belong to Design 110/detail experiences.

---

## Partial failure contract

Example:

```text
Template identity       ✓
Published version       ✓
Draft summary           ✓
Usage service           ✕
Validation service      ✓
```

Render:

> Workflow Template v7 — Published and valid
> Usage unavailable

Not:

> Used by 0 Projects.

Another:

```text
Template core           ✓
Validation service      ✕
```

show:

> Validation unavailable

not:

> Valid.

---

## Backend Requirement Matrix

| Requirement                                                 | Status                    |
| ----------------------------------------------------------- | ------------------------- |
| ProjectTemplate canonical identity                          | **Critical**              |
| ProjectTemplate/ProjectTemplateVersion separation           | **Critical**              |
| WorkflowTemplate canonical identity                         | **Critical**              |
| WorkflowTemplate/WorkflowTemplateVersion separation         | **Critical**              |
| ProjectTemplate/WorkflowTemplate separation                 | **Critical**              |
| Shared library UI/domain separation                         | **Critical**              |
| Draft/published version separation                          | **Critical**              |
| Latest-created/current-published separation                 | **Critical**              |
| Published-version immutability                              | **Critical**              |
| Historical-version retention                                | **Critical**              |
| Template lifecycle/version lifecycle separation             | **Critical**              |
| StageDefinition/runtime stage separation                    | **Critical**              |
| TransitionDefinition/runtime transition behavior separation | **Critical**              |
| GateDefinition/Approval or runtime gate separation          | **Critical**              |
| TaskDefinition/Task separation                              | **Critical**              |
| MilestoneDefinition/Milestone separation                    | **Critical**              |
| ProjectTemplateVersion pins exact WorkflowTemplateVersion   | **Critical where linked** |
| Template publication atomicity                              | **Critical**              |
| Template publication idempotency                            | **Critical**              |
| Publication concurrency protection                          | **Critical**              |
| Workflow graph validation                                   | **Critical**              |
| Project-template reference validation                       | **Critical**              |
| Cross-tenant references prohibited                          | **Critical**              |
| Exact-version use resolver                                  | **Critical**              |
| Unpublished version use prohibited by default/policy        | **Critical**              |
| Design 108 revalidation before Project creation             | **Critical**              |
| Runtime instantiation from exact versions                   | **Critical**              |
| Runtime provenance retained                                 | **Critical**              |
| Runtime instances independent after creation                | **Critical**              |
| Instantiation idempotency                                   | **Critical**              |
| Later template publication does not mutate Projects         | **Critical**              |
| Archive does not mutate existing Projects                   | **Critical**              |
| Hard-delete protection for referenced versions              | **Critical**              |
| Version-aware usage summary                                 | **Required**              |
| Permission-safe usage counts                                | **Critical**              |
| Validation state/revision awareness                         | **Critical**              |
| Invalid draft/current published separation                  | **Critical**              |
| Read/use/edit/publish permission separation                 | **Critical**              |
| Search not template authority                               | **Critical**              |
| Permission-safe caching                                     | **Critical**              |
| Audit/outbox integration                                    | **Required**              |
| Partial dependency failure handling                         | **Critical**              |
| Design 110 detail/configuration reuse                       | **Critical architecture** |
| Designs 111–123 runtime isolation                           | **Critical architecture** |

---

# 8. Consolidation

Design 109 creates significant architectural risk if reusable definitions and runtime Project state are flattened.

**ProjectTemplate / WorkflowTemplate conflation**
Project initialization and process behavior become one ambiguous object.

**Shared UI / shared domain identity conflation**
One library screen encourages one generic mutable Template backend.

**ProjectTemplate / Project conflation**
Reusable configuration becomes client Project.

**WorkflowTemplate / ProjectWorkflow conflation**
Reusable stage definition becomes runtime workflow.

**ProjectTemplate / ProjectTemplateVersion conflation**
Published history disappears.

**WorkflowTemplate / WorkflowTemplateVersion conflation**
Process history disappears.

**Latest-created / current-published conflation**
Unpublished draft is used for production.

**Draft / published conflation**
Editors change future live behavior accidentally.

**Published version / mutable draft conflation**
Historical Projects lose reproducibility.

**Template archive / version deletion conflation**
Project provenance disappears.

**Template archived / existing Project invalid conflation**
Active delivery breaks because source config is retired.

**Workflow v8 publication / Project v7 migration conflation**
All existing Projects silently change stages.

**ProjectTemplate v5 publication / existing Project reinitialization conflation**
Tasks/milestones duplicate.

**StageDefinition / ProjectStageInstance conflation**
Template stage contains runtime client state.

**Stage label / Stage identity conflation**
Rename corrupts transition/history.

**Stage order / transition graph conflation**
UI reordering alters business workflow accidentally.

**TransitionDefinition / visual arrow conflation**
Backend process rules become presentation-only.

**GateDefinition / ApprovalRequest conflation**
Reusable rule becomes client-specific approval instance.

**GateDefinition / gate result conflation**
Template configuration stores runtime pass/fail.

**TaskDefinition / Task conflation**
Template work definition accumulates assignees/completion.

**TaskDefinition / Task ID reuse conflation**
Multiple Projects share same task identity.

**MilestoneDefinition / Milestone conflation**
Template gets client progress.

**ProjectTemplateVersion / latest WorkflowTemplate conflation**
Published ProjectTemplate changes when WorkflowTemplate publishes.

**ProjectTemplate v4 / Workflow v8 auto-upgrade conflation**
Historical initialization becomes non-deterministic.

**Workflow graph validation / runtime trial-and-error conflation**
Invalid cycle reaches client Project.

**Draft invalid / whole Template invalid conflation**
Valid published version becomes unusable.

**Published / usable conflation**
Policy-restricted template gets used.

**Template read / template use conflation**
Viewer can instantiate restricted workflow.

**Template use / template edit conflation**
Project creator changes global configuration.

**Runtime stage operator / workflow administrator conflation**
Delivery user alters shared process.

**Project owner / template publisher conflation**
Operational ownership grants configuration governance.

**Package / ProjectTemplate conflation**
Commercial bundle becomes operational template.

**Package / WorkflowTemplate conflation**
Sales terms and stage process collapse.

**Commercial mapping / template identity conflation**
Mapping change rewrites template itself.

**Mapping change / active Project migration conflation**
Existing Projects adopt new process automatically.

**Template selection / browser authority conflation**
User supplies unpublished/foreign version ID.

**Search result / usable template authority conflation**
Stale index drives Project initialization.

**Usage count / direct mutable counter conflation**
Counts drift from actual Project lineage.

**Usage unavailable / zero conflation**
Outage hides impact of template change.

**Usage permission / Project access conflation**
Template administrator sees restricted Client Projects.

**Validation unavailable / valid conflation**
System fails open.

**Template service unavailable / Project unavailable conflation**
Existing runtime work stops because source definition cannot load.

**Current template dependence / instantiated runtime conflation**
Every Project page queries current shared template.

**Task instantiation retry / duplicate Task conflation**
Initialization produces duplicate work.

**Milestone instantiation retry / duplicate Milestone conflation**
Project timeline duplicates milestones.

**Workflow initialization retry / duplicate stages conflation**
One Project gets repeated stages.

**Definition ID / runtime ID conflation**
Different Projects share records.

**Template publication / distributed Project update conflation**
Publishing triggers mass unsafe writes.

**Archive / cascade delete conflation**
Historical references disappear.

**Generic Template JSON blob**
Project/workflow semantics become unvalidated, hard to migrate, and impossible to authorize precisely.

**Generic Template PATCH**
Published workflow definitions mutate in place.

**Generic `status` field**
Template lifecycle, version publication, usability, and validity collapse.

**109/108 duplicate template selection state**
Project Intake starts authoring template definitions.

**109/110 duplicate WorkflowTemplate backend**
Library and Detail disagree.

**109/023 duplicate runtime workflow state**
Templates own Project stage execution.

**109/034/111 duplicate Task/Milestone state**
Template definitions become runtime work.

**109/104–105 Package/template conflation**
Commercial and operational configuration merge.

**109/112 template default assignment / TeamAssignment conflation**
Reusable default becomes real resource assignment.

No additional screen is required.

These are **template identity, ProjectTemplate/WorkflowTemplate separation, immutable versioning, definition/runtime isolation, exact-version Project initialization, permissions, validation, usage, concurrency, and historical-reproducibility requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT & WORKFLOW TEMPLATE LIBRARY, VERSION-DISCOVERY & RUNTIME-ISOLATION ANCHOR**

**Domain directive:**
**ProjectTemplate ≠ ProjectTemplateVersion ≠ WorkflowTemplate ≠ WorkflowTemplateVersion ≠ StageDefinition ≠ TransitionDefinition ≠ GateDefinition ≠ TaskDefinition ≠ MilestoneDefinition ≠ Project ≠ ProjectWorkflow ≠ ProjectStageInstance ≠ Task ≠ Milestone.**

**Identity directive:**
ProjectTemplate and WorkflowTemplate are independent, stable, tenant-scoped reusable configuration identities. Design 109 may display them together but never collapses them into one generic mutable template entity.

**Library directive:**
`TemplateLibraryEntry` is a discriminated, permission-safe read projection only. It cannot own editable template/version/runtime truth.

**Project-template directive:**
ProjectTemplate defines reusable Project initialization context and remains distinct from Project, Package, WorkflowTemplate and runtime delivery state.

**Workflow-template directive:**
WorkflowTemplate defines reusable stage/process behavior and remains distinct from ProjectTemplate and instantiated ProjectWorkflow.

**Version directive:**
material reusable configuration lives in immutable published `ProjectTemplateVersion` and `WorkflowTemplateVersion` records. Draft and published versions remain independently identifiable.

**Published-version directive:**
`latest created`, `current draft`, and `current published` must never be treated as synonyms.

**Immutability directive:**
once a template version is published and/or referenced by a Project, its material initialization/workflow definition is historically immutable. Changes produce a new version.

**Reference directive:**
where a ProjectTemplateVersion depends on Workflow configuration, it should pin the exact intended `WorkflowTemplateVersion`, not dynamically follow the WorkflowTemplate's current version.

**No-auto-upgrade directive:**
publishing WorkflowTemplate v8 never changes ProjectTemplateVersion v4 that referenced v7, nor any Project already initialized from v7.

**Definition/runtime directive:**
StageDefinition, TransitionDefinition, GateDefinition, TaskDefinition and MilestoneDefinition are reusable configuration—not runtime client records.

**Runtime directive:**
Project creation instantiates independent ProjectWorkflow, ProjectStage, Task and Milestone records with new runtime IDs and retained source-definition provenance.

**Runtime-independence directive:**
after creation, the Project remains operational without querying the current template for its live stage/task state. Templates provide provenance and future initialization—not ongoing mutable runtime truth.

**Stage directive:**
stable stage identity is independent from labels/order. Workflow transition semantics are explicit and never inferred solely from UI ordering.

**Transition directive:**
workflow transitions are server-governed definitions and cannot be reduced to visual arrows or unrestricted frontend stage changes.

**Gate directive:**
GateDefinition remains reusable rule/configuration. Runtime ApprovalRequests, milestones, deliverables or gate evaluations remain independent source-domain/runtime entities.

**Task directive:**
TaskDefinition instantiates canonical Design 034 Tasks. Template definitions never carry client assignees/completion state.

**Milestone directive:**
MilestoneDefinition instantiates canonical Project milestones and remains independent from runtime dates/completion.

**Validation directive:**
WorkflowTemplate publication requires structural validation of stages, transitions, gates and references. ProjectTemplate publication requires valid project initialization and exact workflow references.

**Invalid-draft directive:**
an invalid draft never invalidates a previously valid published version. Future Projects may continue using the published version according to policy.

**Publication directive:**
publication is an authorized, revision-safe, atomic and idempotent transition that updates the exact current-published pointer while preserving prior versions.

**Concurrency directive:**
parallel draft editing, publication and archival use optimistic/transactional safeguards. Two versions cannot silently become current through last-write-wins.

**Use directive:**
Design 108 revalidates exact template/version usability at Project creation time. Library/search state or a browser-supplied version ID is never sufficient authority.

**Instantiation directive:**
Project initialization pins exact ProjectTemplateVersion and WorkflowTemplateVersion identities and instantiates runtime records idempotently.

**Retry directive:**
initialization retries must reuse source-definition lineage and uniqueness keys so stages, Tasks and Milestones cannot be duplicated.

**Archive directive:**
archiving a template prevents/limits future use according to policy but never deletes versions, changes existing Projects, or destroys provenance.

**Deletion directive:**
referenced published/historical template versions require non-destructive retention. Hard deletion, if allowed at all, should be limited to safe unreferenced drafts.

**Package directive:**
Designs 104–105 remain commercial catalog authority. Package-to-ProjectTemplate mappings are explicit configuration and never collapse Product/Package commercial truth into delivery-template identity.

**Migration directive:**
template publication never migrates existing Projects automatically. Any runtime migration, if later required, must be an explicit separately governed capability.

**Permission directive:**
template read, use, draft edit, publish and archive remain distinct privileges. Project creation or runtime stage operation does not grant global template administration.

**Tenant directive:**
ProjectTemplate, WorkflowTemplate, their versions, references and downstream Project initialization remain strictly tenant-scoped.

**Usage directive:**
usage counts are version-aware, permission-safe projections. They help assess impact but never grant access to underlying restricted Projects.

**Search directive:**
Design 079 may discover safe template metadata, but Search indexes never determine current published version, validity, or use eligibility.

**Caching directive:**
library caches vary by membership authorization, template/version/validation/usage revisions. Published immutable versions may be cached by exact ID; mutable drafts remain revision-sensitive.

**Partial-failure directive:**
template identity, published version, draft summary, validation, and usage may fail independently. `Validation unavailable` cannot become `Valid`, and `Usage unavailable` cannot become `0`.

**Performance directive:**
Design 109 loads compact version/availability/usage summaries with server pagination and batched current-version queries; complete stage/task/workflow definitions belong to detail/configuration surfaces rather than every list row.

**Audit directive:**
template creation, version publication, archival, and other material configuration changes generate actor/version-aware Audit evidence. Runtime Project actions remain in their own Project history.

**Future-reuse directive:**
Design **110 — Workflow Template Detail / Stage Configuration** must operate on the exact canonical `WorkflowTemplate` and `WorkflowTemplateVersion` identities established here, while preserving published-version immutability and runtime separation.

**Overlap directive:**
Designs **023, 034, 104–112** must preserve one continuous **Commercial Mapping → ProjectTemplateVersion + WorkflowTemplateVersion → Project Creation → ProjectWorkflow/StageInstances → Tasks/Milestones/Team** lineage while keeping commercial catalog, reusable delivery configuration and runtime Project execution independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE DELIVERY TEMPLATE LIBRARY FOUNDATION — DISTINCT STABLE PROJECTTEMPLATE/WORKFLOWTEMPLATE IDENTITIES + IMMUTABLE PUBLISHED VERSIONS + EXPLICIT CURRENT-PUBLISHED/CURRENT-DRAFT REFERENCES + EXACT CROSS-TEMPLATE VERSION PINNING + VALIDATED STAGE/TRANSITION/GATE/TASK/MILESTONE DEFINITIONS + PERMISSION-SAFE VERSION-AWARE USAGE PROJECTIONS + IDEMPOTENT RUNTIME INSTANTIATION + NON-DESTRUCTIVE ARCHIVAL — AND NEVER ALLOW SHARED LIBRARY UI, “LATEST” LOOKUPS, TEMPLATE PUBLICATION, ARCHIVAL, SEARCH/CACHE STATE OR TEMPLATE EDITING TO MUTATE EXISTING PROJECTS, WORKFLOWS, STAGES, TASKS, MILESTONES OR HISTORICAL DELIVERY CONFIGURATION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **109 / 153** |
| **PASS**                                   |                        **109** |
| **STANDARDIZE decisions**                  |                        **107** |
| **Potential implementation-overlap flags** |                        **100** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**109 / 153 = 71.2% audited.**

### Canonical template architecture after Design 109

```text
PROJECT TEMPLATE PT-1
        │
        ├── v1
        ├── v2
        └── v3 published
                 │
                 └── references exact
                     WorkflowTemplateVersion WT-v7

WORKFLOW TEMPLATE WT-1
        │
        ├── v6 historical
        ├── v7 published
        └── v8 draft
                 │
                 ├── StageDefinitions
                 ├── TransitionDefinitions
                 └── GateDefinitions
```

Project creation then remains deterministic:

```text
Project PR-100
created from:

ProjectTemplate v3
WorkflowTemplate v7

        ↓ instantiate

ProjectWorkflow PW-100
ProjectStageInstances
Tasks
Milestones
```

Later:

```text
WorkflowTemplate v8 published

RESULT:

Future Projects may use v8.

PR-100 remains on its
v7-derived runtime workflow.

NO automatic migration.
```

The Project/Workflow-template distinction is now strict:

```text
ProjectTemplate
    = how a Project is initialized

WorkflowTemplate
    = how its reusable process/stages are defined

Project
    = actual delivery entity

ProjectWorkflow
    = actual runtime process

These are four different things.
```

And version state remains explicit:

```text
WorkflowTemplate WT-1

Published version = v7
Draft version     = v8

Therefore:

v8 exists
      ≠
v8 usable
      ≠
v8 applied to existing Projects
```

## Next Sequential Audit Target

### **Design 110 — Workflow Template Detail / Stage Configuration**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
