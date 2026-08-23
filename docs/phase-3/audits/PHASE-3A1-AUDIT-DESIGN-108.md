# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 108 — Project Intake / Project Creation Workspace

Design 108 should become the **canonical Team Workspace Project intake, delivery-context validation, commercial-scope handoff, template selection, and idempotent Project creation surface** built on the canonical Project foundation established by Design 023 and the Deal → Client → Onboarding handoff architecture standardized through Designs 106–107.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **ProjectIntake ≠ Project ≠ ProjectTemplate ≠ ProjectTemplateVersion ≠ WorkflowTemplate ≠ WorkflowTemplateVersion ≠ ClientRelationship ≠ Deal/WonDealHandoff ≠ ProposalVersion/ContractVersion/CommercialSnapshot ≠ Product/Package ≠ ClientOnboarding ≠ ProjectStage ≠ Task ≠ Milestone ≠ TeamAssignment.**

The central implementation rule is:

> **Project Intake prepares and validates the inputs for creating one canonical Project; it is not itself the Project, commercial agreement, workflow, task list, or onboarding process. Project creation must pin the exact client, commercial-source snapshot, ProjectTemplateVersion and WorkflowTemplateVersion used at creation; later Deal, Package, Contract, onboarding, or template changes must never silently rewrite the created Project. Creation must be idempotent, concurrency-safe, resumable where applicable, and must prevent duplicate Projects from retries or parallel handoff/intake flows.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **108**                                                                                                                                                                           |
| **Canonical name**                 | **Project Intake / Project Creation Workspace**                                                                                                                                   |
| **Product area**                   | Team Workspace / Projects / Delivery Setup                                                                                                                                        |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                                  |
| **Screen class**                   | Creation Workspace / Intake / Cross-Domain Project Initialization                                                                                                                 |
| **Classification**                 | **Canonical Project Intake, Scope-Source Validation & Idempotent Project Creation Anchor**                                                                                        |
| **Primary purpose**                | Prepare validated Project creation inputs, preserve exact Client/commercial/template lineage, and create one canonical Project without duplicating commercial or workflow domains |
| **Primary resulting entity**       | **Project** — Design 023                                                                                                                                                          |
| **Pre-creation context**           | **ProjectIntake / ProjectCreationDraft** if persistence is required by the frozen workflow                                                                                        |
| **Client dependency**              | **ClientRelationship** — Design 021                                                                                                                                               |
| **Company dependency**             | Designs 084–085                                                                                                                                                                   |
| **Commercial source dependency**   | Deal / ProposalVersion / ContractVersion / agreed CommercialSnapshot                                                                                                              |
| **Won Deal dependency**            | Design 106                                                                                                                                                                        |
| **Client Onboarding dependency**   | Designs 022 / 107                                                                                                                                                                 |
| **Catalog dependency**             | Designs 104–105 as source provenance only, never live scope truth                                                                                                                 |
| **Project template dependency**    | upcoming Design 109                                                                                                                                                               |
| **Workflow template dependency**   | upcoming Design 110                                                                                                                                                               |
| **Project stage dependency**       | Project workflow foundation from Design 023                                                                                                                                       |
| **Team/resource dependency**       | upcoming Design 112                                                                                                                                                               |
| **Task/milestone dependency**      | Design 034 / upcoming 111                                                                                                                                                         |
| **Primary query service**          | `ProjectIntakeQueryService`                                                                                                                                                       |
| **Creation service**               | `ProjectCreationService`                                                                                                                                                          |
| **Project service**                | canonical `ProjectService`                                                                                                                                                        |
| **Commercial source resolver**     | `ProjectCommercialSourceResolver`                                                                                                                                                 |
| **Template resolver**              | `ProjectTemplateResolver`                                                                                                                                                         |
| **Workflow instantiation service** | `ProjectWorkflowInstantiationService`                                                                                                                                             |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                                   |
| **Auth**                           | Required                                                                                                                                                                          |
| **Authorization**                  | Active OrganizationMembership + Project create + source/client/template permissions                                                                                               |
| **Implementation priority**        | **Critical Delivery Initialization / Scope Integrity / Duplicate-Project Prevention**                                                                                             |
| **Reuse level**                    | **Extremely High across Projects, templates, workflows, tasks, onboarding, staffing and delivery**                                                                                |

Design 108 should answer:

> **“Who is this Project for, what exact commercial commitment created it, what delivery configuration/template should initialize it, what Client/Company context applies, what required creation data is still missing, and can one canonical Project now be created safely without duplicating or rewriting any upstream business record?”**

Canonical composition:

```text
Deal / Client / Handoff
        │
        ↓
exact commercial source
ProposalVersion / ContractVersion /
agreed CommercialSnapshot
        │
        ↓
     Project Intake
        │
        ├── ClientRelationship
        ├── project purpose/type
        ├── ProjectTemplateVersion
        ├── WorkflowTemplateVersion
        ├── delivery dates/defaults
        └── initial operational context
                │
                ↓
        ProjectCreationService
                │
                ↓
             PROJECT
                │
        ┌───────┼─────────┐
        ↓       ↓         ↓
   Workflow   Tasks/    Team/Resources
   Instance   Milestones
```

---

# 2. Reuse

## Design 023 remains the canonical Project identity

Design 108 must create the exact same canonical entity used by:

* Project 360,
* editorial/media production,
* files,
* approvals,
* timelines,
* risks,
* deliverables,
* completion.

Correct:

```text
Design 108
    ↓
ProjectService.create(...)
    ↓
Project PR-100
    ↓
Design 023
```

Do not create:

```text
IntakeProject
WonDealProject
DeliveryProjectRecord
ProjectCreationProject
```

as parallel Project entities.

---

## Project Intake ≠ Project

Critical.

The intake workspace may contain incomplete or editable preparation data.

A Project is the canonical delivery entity after creation.

Valid:

```text
ProjectIntake = DRAFT
Project = does not yet exist
```

or:

```text
ProjectIntake = COMPLETED
Project = PR-100
```

---

## If intake persistence is unnecessary, do not invent a business entity

Important audit guardrail.

If the frozen Design 108 is a simple atomic creation form, `ProjectIntake` can remain UI/application draft state.

If it supports:

* save and resume,
* multi-step validation,
* cross-session handoff,
* approvals,
* asynchronous creation,

then a durable `ProjectIntake` record is justified.

Do not create a persistent entity merely because the screen is called “Intake.”

---

## Design 106 must not duplicate Project creation

Design 106 already established that Won Deal Handoff may create/link a canonical Project.

Therefore Design 108 must support both paths conceptually:

```text
A. Standalone / manual Project creation
B. Project creation invoked from WonDealHandoff
```

Both must converge on:

```text
ProjectCreationService
```

There must not be:

```text
HandoffProjectCreator
≠
ManualProjectCreator
```

with different Project semantics.

---

## Handoff-created Project ≠ another intake-created Project

Critical duplicate-prevention rule.

If Design 106 already created PR-100 for the handoff, opening Design 108 for that same source must resolve:

> Project already exists / continue existing Project context

rather than creating PR-101.

---

## Design 107 Onboarding ≠ Project creation

ClientOnboarding may be:

* incomplete,
* completed,
* blocked,

while the Project already exists depending on business policy.

Project creation eligibility should therefore use explicit creation policy—not infer:

```text
Onboarding completed → create Project
```

universally.

---

## Onboarding may be a prerequisite under policy

Where required:

```text
ProjectCreationPolicy
   ↓
requires ClientOnboarding readiness/completion
```

But that is a governed condition.

Not a hard-coded architectural identity.

---

## ClientRelationship remains canonical Client context

Design 108 reuses Design 021's:

```text
ClientRelationship.id
```

It does not copy client identity into another `ProjectClient` business entity.

---

## Company ≠ ClientRelationship ≠ Project

Permanent.

---

## Proposal/Contract remain upstream commercial evidence

Project creation consumes:

* exact accepted ProposalVersion,
* exact executed ContractVersion,
* or another governed agreed CommercialSnapshot,

according to business policy.

It never mutates those records.

---

## Current Deal ≠ Project scope source automatically

A Deal can continue receiving operational notes/CRM updates after Win.

Created Project scope must pin its own exact source lineage.

---

## Current Package ≠ Project scope

Designs 104–105 already froze:

> Current catalog ≠ historical commercial agreement.

Therefore Project creation must not ask today's Package:

> What should we deliver?

if the client purchased an earlier package/snapshot.

---

## Package ≠ ProjectTemplate

Critical.

A Package describes **what was sold**.

A ProjectTemplate describes **how delivery is initialized**.

They may be mapped.

They are not the same entity.

---

## Package ≠ WorkflowTemplate

Permanent.

---

## ProjectTemplate ≠ WorkflowTemplate

This becomes the key boundary for Designs 109–110.

### ProjectTemplate

Reusable project-level initialization configuration such as conceptually:

* project defaults,
* project structure,
* required modules/context,
* suggested workflow reference.

### WorkflowTemplate

Versioned stage/workflow process definition.

They may reference each other.

They must not be collapsed.

---

## ProjectTemplateVersion ≠ created Project

Permanent.

The Project copies/pins relevant configuration at creation.

Later template changes affect future Projects only.

---

## WorkflowTemplateVersion ≠ Project workflow runtime

Critical.

Correct:

```text
WorkflowTemplateVersion WTV-3
          ↓ instantiate
ProjectWorkflow PW-100
```

Not:

```text
Project dynamically reads current WorkflowTemplate
```

forever.

---

## Template publication after Project creation

Example:

```text
PR-100 created from WorkflowTemplate v3

Later:
WorkflowTemplate v4 published
```

PR-100 remains on its instantiated v3-derived workflow unless an explicit governed migration is performed.

---

## Design 034 remains canonical Task domain

Project creation/template instantiation can create canonical Tasks.

It cannot create:

```text
TemplateTask
```

as runtime work.

Template definitions and Task instances remain separate.

---

## Milestone definition ≠ Milestone instance

Same principle for Design 111.

---

## Design 112 Team Assignment remains separate

Project creation can seed/default:

* owner,
* team,
* roles,

if frozen design supports them.

But Project membership/resource assignment remains canonical downstream state.

---

# 3. Entities

## Project

`Project` remains the stable delivery/work identity.

Conceptually:

```text
Project
├── id
├── organizationId
├── clientRelationshipId
├── company context
├── project type/category
├── lifecycle
├── workflow status/stage context
├── source commercial lineage
├── sourceHandoffId?
├── sourceProjectTemplateVersionId?
├── sourceWorkflowTemplateVersionId?
├── start / target dates
├── owner/context
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Project ≠ ProjectStage

Permanent.

Design 023 already established:

> status ≠ stage ≠ health ≠ readiness.

Creation must preserve that.

Do not initialize:

```text
project.status = "Stage 1"
```

as the entire workflow model.

---

## Project ≠ Workflow

Permanent.

One Project has a workflow/runtime process.

The Project itself is not the stage graph.

---

## Project ≠ Task collection

Permanent.

---

## Project ≠ Milestone collection

Permanent.

---

## Project ≠ ClientOnboarding

Permanent.

---

## Project ≠ commercial document

Permanent.

---

## ProjectIntake

If persistent, it should represent an incomplete Project-creation intent.

Conceptually:

```text
ProjectIntake
├── id
├── organizationId
├── clientRelationshipId?
├── sourceHandoffId?
├── commercialSource references
├── selected ProjectTemplateVersion
├── selected WorkflowTemplateVersion
├── proposed delivery inputs
├── validation state
├── lifecycle
├── createdBy
└── revision
```

---

## ProjectIntake ≠ Project

Permanent.

---

## One intake should produce at most the intended Project output

Once created:

```text
ProjectIntake PI-10
     ↓
createdProjectId = PR-100
```

Retry must return PR-100.

---

## Intake completion ≠ Project lifecycle completion

Absolute.

---

## Project commercial source

Project should preserve exact source lineage such as conceptually:

```text
ProjectCommercialSource
├── dealId?
├── proposalVersionId?
├── contractVersionId?
├── commercialSnapshot reference
├── package/product source provenance
└── sourceCapturedAt
```

This can be normalized relationships rather than one generic table.

---

## Source lineage ≠ live dependency

Critical.

The Project must remain interpretable if:

* Proposal service unavailable,
* Contract archived,
* Package archived.

Store enough agreed scope snapshot/provenance at Project creation.

---

## Project initial scope

Initial Project scope derives from agreed commercial terms plus authorized delivery configuration.

It becomes Project-domain operational truth.

Later:

```text
Project Change Request
```

may modify Project scope.

That does not rewrite:

* Proposal,
* Contract,
* original commercial snapshot.

---

## Initial scope ≠ Contract

Permanent.

---

## Project scope ≠ current Package definition

Permanent.

---

## ProjectTemplate

Design 109 will become canonical reusable Project template identity.

Conceptually:

```text
ProjectTemplate
├── id
├── organizationId
├── name
├── lifecycle
├── currentPublishedVersionId
└── revision
```

Design 108 should only consume it.

---

## ProjectTemplateVersion

Exact reusable Project initialization definition.

Conceptually:

```text
ProjectTemplateVersion
├── id
├── projectTemplateId
├── version
├── project defaults
├── workflow template reference
├── initialization definitions
├── lifecycle
└── publishedAt
```

---

## ProjectTemplateVersion must be pinned

Absolute.

Never:

```text
Project → ProjectTemplate → latest
```

for historical initialization.

---

## WorkflowTemplate

Design 110 remains the reusable workflow-definition identity.

---

## WorkflowTemplateVersion

Exact stage/process definition used for initialization.

Conceptually:

```text
WorkflowTemplateVersion
├── id
├── workflowTemplateId
├── version
├── StageDefinition[]
├── transition rules
├── gate definitions
└── publishedAt
```

---

## WorkflowTemplateVersion ≠ ProjectWorkflow

Permanent.

---

## ProjectWorkflow

Runtime workflow for the created Project.

Conceptually:

```text
ProjectWorkflow
├── id
├── projectId
├── sourceWorkflowTemplateVersionId
├── runtime stages
├── current stage/context
├── startedAt
└── revision
```

Exact form Phase 3D.

---

## StageDefinition ≠ ProjectStageInstance

Same template/runtime boundary.

---

## Template TaskDefinition ≠ Task

Permanent.

---

## Template MilestoneDefinition ≠ Milestone

Permanent.

---

## Project dates

Project start/target dates become runtime Project data.

They may be suggested from:

* Contract,
* template,
* onboarding,
* handoff.

But after creation they are Project-owned operational state.

---

## Contract start date ≠ Project start date necessarily

Permanent.

---

## Project target date ≠ Contract term end

Permanent.

---

## Client relationship

Project belongs to an authorized ClientRelationship/context.

Do not infer Project client merely from free-text Company name.

---

## Existing Project resolution

Where source lineage indicates an existing Project:

resolve it canonically.

Do not use Project name as duplicate detection.

---

## Project purpose / output key

To prevent duplicates, Project creation may need a stable creation purpose such as:

```text
sourceHandoffId + projectPurpose
```

or:

```text
projectIntakeId
```

rather than:

```text
project name + client name
```

Exact unique constraints Phase 3D.

---

## Intake validation result

Validation should be a derived result such as:

```text
ProjectCreationReadiness
├── READY
├── BLOCKED
├── INVALID
└── UNKNOWN
```

with structured reasons.

Do not store a user-editable:

```text
intake.ready = true
```

as authority.

---

# 4. Permissions

Design 108 should conceptually distinguish:

```text
project.read
project.create

projectIntake.read
projectIntake.create
projectIntake.edit
projectIntake.submit

client.read

commercialSource.read

projectTemplate.read
workflowTemplate.read

projectTemplate.use
workflowTemplate.use

projectTeam.assignInitial

project.createFromHandoff
```

Exact permission keys belong to Phase 3D.

---

## Project read ≠ create

Permanent.

---

## Project create ≠ Deal handoff authority

Permanent.

A user can create permitted manual/internal Projects without being able to convert Won Deals.

---

## Handoff permission ≠ arbitrary Project creation

Permanent.

---

## Client access ≠ Project creation authority

Permanent.

---

## Project creation authority ≠ template administration

Critical.

A Project Manager may **use** a published ProjectTemplate without permission to edit that template.

---

## Template read ≠ template use

Potentially distinct where restricted operational templates exist.

---

## WorkflowTemplate use ≠ edit/publish

Permanent.

---

## Package access ≠ ProjectTemplate edit

Permanent.

---

## Contract read ≠ Project create necessarily

Permanent.

---

## Commercial source selection must be server-authoritative

The browser cannot choose:

```text
contractVersionId = convenient older version
```

to change delivery obligations.

Server validates authoritative source under policy.

---

## Browser-selected ClientRelationship reauthorizes

Never trust arbitrary client ID.

Validate:

* tenant,
* source Deal/Handoff association where applicable,
* current permissions,
* business policy.

---

## Team assignment ≠ security authorization

If intake chooses an initial Project owner/team:

assignment does not bypass Design 036/037 authorization rules.

---

## Direct TemplateVersion ID reauthorizes

Knowing ID grants nothing.

---

## Cross-tenant Project creation prohibited

Absolute.

All of:

* Client,
* Handoff,
* Proposal/Contract,
* template,
* workflow,
* team references

must belong to the same authorized tenant/context.

---

# 5. States

Design 108 must keep **Intake lifecycle, Project creation readiness, validation state, Project lifecycle, template availability, workflow initialization, and downstream creation state** independent.

### ProjectIntake lifecycle, if persistent

```text
Draft
In Review / Prepared
Ready
Submitted
Converted to Project
Cancelled
```

Exact vocabulary Phase 3D.

### Creation readiness

```text
Not Ready
Ready
Blocked
Invalid
Unknown
```

### Commercial source

```text
Available
Verified
Restricted
Unavailable
Conflict
```

### Template selection

```text
Not Selected
Selected
Available
Superseded
Unavailable
Restricted
```

### Creation execution

```text
Not Started
Creating
Created
Outcome Unknown
Failed
Requires Attention
```

### Workflow initialization

```text
Not Started
Initializing
Initialized
Partial / Failed
```

These must never collapse into one generic `projectCreation.status`.

---

## Intake draft ≠ Project Draft

Critical.

Before canonical Project exists:

> Project Intake is draft.

After Project exists:

> Project lifecycle belongs to Project domain.

---

## Ready ≠ Project created

Permanent.

---

## Submitted ≠ created

Permanent.

Creation may fail or become outcome-unknown.

---

## Project created ≠ workflow fully initialized universally

Critical.

If workflow initialization is asynchronous:

```text
Project = CREATED
Workflow initialization = PENDING
```

may be valid.

The Project must not disappear.

---

## Workflow initialization failure ≠ Project creation rollback automatically

Permanent.

Use partial creation/recovery policy.

---

## Template unavailable ≠ no template selected

Critical.

A pinned selected version may be temporarily unavailable from a service.

Do not silently choose a different latest template.

---

## Template superseded ≠ invalid historical selection

Permanent.

A previously pinned version can remain valid for an already-started intake depending on policy.

---

## Current template changed ≠ intake source changed

Permanent.

---

## Commercial source unavailable ≠ use current Package

Absolute.

---

## Onboarding incomplete ≠ Project creation blocked universally

Only if the pinned creation policy says so.

---

## Client existing ≠ Project existing

Permanent.

---

## Project service timeout ≠ Project not created

Critical.

Use outcome-unknown reconciliation.

---

## Duplicate Project found by source lineage ≠ error universally

Could mean:

> Project already created; reuse it.

---

## State Coverage

Design 108 inherits Design 150 plus:

```text
Project Intake Loading
Project Intake Available
Project Intake Restricted

Project Intake Draft
Project Intake Ready
Project Intake Submitted
Project Intake Converted
Project Intake Cancelled

Creation Not Ready
Creation Ready
Creation Blocked
Creation Invalid
Creation Readiness Unknown

Client Context Available
Client Context Restricted
Client Context Unavailable

Commercial Source Verified
Commercial Source Restricted
Commercial Source Unavailable
Commercial Source Conflict

Project Template Not Selected
Project Template Selected
Project Template Superseded
Project Template Restricted
Project Template Unavailable

Workflow Template Not Selected
Workflow Template Selected
Workflow Template Superseded
Workflow Template Restricted
Workflow Template Unavailable

Project Creation Not Started
Project Creating
Project Created
Project Creation Outcome Unknown
Project Creation Failed
Project Already Exists

Workflow Initialization Pending
Workflow Initialization In Progress
Workflow Initialized
Workflow Initialization Failed

Onboarding Prerequisite Satisfied
Onboarding Prerequisite Pending
Onboarding Prerequisite Unavailable

Project Intake Updated Elsewhere
Template Updated Elsewhere
Commercial Source Updated Elsewhere
Project Creation Conflict
Partial Intake Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **creation context and source integrity**, not recreate Project 360.

Conceptually:

```text
Project Intake
↓
Client / Company
↓
Commercial source
↓
Project purpose / delivery definition
↓
ProjectTemplateVersion
↓
WorkflowTemplateVersion
↓
Initial dates / team defaults if frozen
↓
Creation validation
↓
Create Project
```

Only frozen Design 108 elements should render.

---

## Client and commercial source must remain visible

Where project comes from a Won Deal:

> Client: Globex
> Commercial source: Executed Contract v3

is safer than:

> Package: Executive Package

because the latter may refer to current mutable catalog state.

---

## Template version needs explicit context

Where frozen Design 108 exposes template selection:

> Project Template: Magazine Production v4
> Workflow: Editorial Delivery v7

rather than vague:

> Template: Magazine.

---

## Current vs pinned template distinction

If a newer version exists after selection:

> Selected: v4
> Newer v5 available

must not silently change the intake.

---

## Readiness blockers should be explainable

Examples:

> Client relationship missing
> Exact commercial source unavailable
> Workflow template not selected
> Required onboarding condition incomplete

Use structured reasons rather than disabled Create button with no explanation.

---

## Tablet

Following Design 152:

* Client/commercial source stack first,
* template selection stacks,
* creation validation becomes compact cards,
* advanced initialization settings can collapse,
* primary creation action remains prominent.

---

## Mobile

Priority:

```text
Client
↓
Commercial source
↓
Project type/purpose
↓
Project Template
↓
Workflow Template
↓
Required dates/context
↓
Creation blockers
↓
Create / Continue
```

Do not compress the intake into a wide desktop form/table.

---

## Mobile duplicate-resolution UX

If Project already exists for the exact source:

the correct frozen-state behavior should be conceptually:

> Project already created — open existing Project

not:

> Create Project again.

---

## Accessibility

A creation state could communicate:

> New Project for Globex. Source is executed Contract version 3 from Deal D-104. Project Template Magazine Production version 4 and Workflow Template Editorial Delivery version 7 are selected. All required creation checks pass. No existing Project was found for this handoff purpose.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical intake architecture

```text
Design 108
    ↓
Authenticated Workspace Context
    ↓
ProjectIntakeQueryService
    │
    ├── ClientRelationshipAdapter
    ├── Deal/HandoffAdapter
    ├── ProposalAdapter
    ├── ContractAdapter
    ├── CommercialSnapshotAdapter
    ├── OnboardingAdapter
    ├── ProjectTemplateAdapter
    ├── WorkflowTemplateAdapter
    └── ProjectCreationReadinessResolver
    ↓
ProjectIntakeView
```

Creation goes through:

```text
ProjectCreationService
```

---

## No generic Project mega-POST

Avoid client sending complete nested authority such as:

```text
{
  client: {...},
  contract: {...},
  workflow: {...},
  tasks: [...],
  team: [...],
  project: {...}
}
```

and trusting it as canonical.

The server should resolve authoritative references.

---

## Creation-readiness resolver

Conceptually:

```text
ProjectCreationReadinessResolver.resolve(
    intake/source context
)
```

should validate:

1. authorized ClientRelationship;
2. source Handoff/Deal where applicable;
3. exact authoritative commercial source;
4. selected ProjectTemplateVersion;
5. selected WorkflowTemplateVersion;
6. required initialization data;
7. required onboarding/client conditions under policy;
8. duplicate/existing Project lineage;
9. permissions;
10. cross-tenant integrity.

---

## Readiness reasons should be structured

Examples:

```text
CLIENT_REQUIRED
COMMERCIAL_SOURCE_UNAVAILABLE
CONTRACT_NOT_VERIFIED
PROJECT_ALREADY_EXISTS
PROJECT_TEMPLATE_REQUIRED
WORKFLOW_TEMPLATE_REQUIRED
ONBOARDING_PREREQUISITE_PENDING
INVALID_DATE_CONFIGURATION
```

rather than only free-text.

---

## Commercial source resolver

Conceptually:

```text
ProjectCommercialSourceResolver.resolve(
    dealId?,
    handoffId?,
    explicit source context
)
```

should determine the authoritative:

```text
accepted ProposalVersion
executed ContractVersion
agreed CommercialSnapshot
```

according to policy.

---

## Browser cannot pick favorable source

Critical.

If executed Contract v3 is authoritative, request cannot substitute Proposal v2 merely because it has a lower price or different scope.

---

## Source must be pinned before creation

Once Project creation begins:

```text
sourceContractVersionId = CV3
```

must remain CV3.

Do not re-resolve “latest” during later worker steps.

---

## Project creation command

Conceptually:

```text
createProject(
    creationIntentId / intakeId / handoffId,
    expectedRevision,
    approved user inputs,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. load authoritative source context;
3. re-evaluate readiness;
4. detect existing Project output;
5. pin ClientRelationship;
6. pin exact commercial source;
7. pin exact ProjectTemplateVersion;
8. pin exact WorkflowTemplateVersion;
9. validate project dates/defaults;
10. create canonical Project;
11. persist source lineage;
12. initialize runtime ProjectWorkflow;
13. instantiate required runtime definitions;
14. record output back to intake/handoff;
15. emit Audit/outbox.

---

## Creation idempotency

Critical.

Repeated:

* clicks,
* API retries,
* worker retry,
* Design 106 retry,

must resolve to the same intended Project.

---

## Database uniqueness

Use a stable source/purpose uniqueness constraint where applicable.

Do not rely on:

* project name,
* Client name.

---

## Creation outcome unknown

Example:

```text
Project DB commit succeeded
response lost
```

Correct:

```text
PROJECT_CREATION_OUTCOME_UNKNOWN
↓
reconcile by creation intent/handoff/idempotency key
```

Incorrect:

```text
create another Project
```

---

## Project + runtime workflow initialization

Where feasible inside the same Project-domain boundary, create:

```text
Project
+
ProjectWorkflow
+
runtime stage structure
```

transactionally enough to avoid half-initialized Projects.

If asynchronous initialization is necessary:

Project should have explicit:

```text
INITIALIZING
INITIALIZATION_FAILED
```

operational state rather than disappearing.

---

## Template definition snapshotting

Project should retain:

```text
sourceProjectTemplateVersionId
sourceWorkflowTemplateVersionId
```

plus instantiated runtime data.

The Project must remain operational if template services later fail.

---

## Runtime workflow must not query template for current stages

Absolute.

After instantiation:

```text
ProjectWorkflow
```

owns its runtime stage state.

---

## Template change after creation

No silent migration.

Any migration to a newer WorkflowTemplateVersion must be an explicit governed operation designed later if required.

Design 108 does not invent a migration screen.

---

## ProjectTemplate selection

The server must validate:

* same tenant,
* published/usable version,
* compatible project type/context,
* user authorized to use.

---

## WorkflowTemplate selection

Same.

---

## ProjectTemplate→WorkflowTemplate mapping

If ProjectTemplate defines a default WorkflowTemplateVersion:

Design 108 may preselect/resolve it.

But the exact version used must still be pinned at creation.

---

## User override of workflow

If frozen design permits choosing another workflow:

server validates allowed compatibility.

Do not allow arbitrary WorkflowTemplateVersion by ID manipulation.

---

## Project naming

Project display name is not Project identity.

Duplicate names may be legitimate.

Duplicate prevention uses canonical source lineage/purpose, not strings.

---

## Dates

Creation must validate canonical date/time semantics such as:

* start before target where applicable,
* Client/Contract scheduling constraints,
* timezone/calendar semantics.

Exact rules belong to Phase 3D.

---

## Contract date ≠ Project date

Do not copy blindly unless a mapped creation rule explicitly says so.

---

## Team assignment

If Design 108 includes initial owner/team selection:

invoke canonical Team/Project assignment service.

Do not store only:

```text
project.assigneeIds[]
```

without Design 112's relationship/permission architecture.

---

## Initial Task/Milestone instantiation

Where template initialization creates Tasks/Milestones:

```text
TaskDefinition
     ↓ instantiate
Task
```

and:

```text
MilestoneDefinition
     ↓ instantiate
Milestone
```

Canonical runtime entities only.

---

## Task creation idempotency

Template retry must not duplicate Tasks.

Use stable lineage:

```text
projectId + templateDefinitionId
```

or equivalent.

---

## Milestone creation idempotency

Same.

---

## Project workflow stage instantiation

Each runtime stage should retain source definition/version lineage while being independently mutable according to runtime rules.

---

## Handoff integration

If creation originates from Design 106:

```text
WonDealHandoff
      ↓
ProjectCreationService
      ↓
Project PR-100
      ↓
HandoffOutput
```

The Handoff records output reference only.

It does not own Project state.

---

## Onboarding integration

If Project creation is an onboarding prerequisite or consumer:

query canonical Design 107 readiness/state.

Do not use onboarding progress percentage as a binary eligibility shortcut.

---

## Catalog integration

If ProjectTemplate selection is mapped from Package:

use explicit version-aware mapping.

Correct:

```text
Agreed PackageSnapshot
       ↓
ProjectInitializationMapping
       ↓
ProjectTemplateVersion
```

Not:

```text
Current Package
       ↓
current WorkflowTemplate
```

---

## Project initialization mapping

A mapping layer may be needed conceptually:

```text
CommercialOffering → recommended ProjectTemplate
```

but it must be version-aware and downstream-safe.

It is configuration, not commercial truth.

---

## Mapping change ≠ existing Project migration

Absolute.

---

## Project creation Audit

Material evidence should include:

```text
ProjectCreationStarted
ProjectCreated
ProjectCreationFailed
ProjectCreationReconciled
ProjectTemplateVersionSelected
WorkflowTemplateVersionSelected
```

with source lineage.

---

## Activity

Project Activity may show:

> Project created from Contract v3 / Handoff H-1.

Activity remains a projection.

---

## Events/outbox

Useful canonical events:

```text
ProjectCreated
ProjectWorkflowInitialized
ProjectInitializationFailed
ProjectTeamInitialized
ProjectTasksInitialized
```

Downstream screens consume these.

---

## Notification integration

Design 080 may notify:

* Project created,
* initialization failed,
* manual configuration required.

Notification state never changes Project initialization truth.

---

## Search

Design 079 may index newly created Project after canonical commit.

Search result must never be treated as proof that creation failed/succeeded.

---

## Caching

Project Intake caches should vary by:

```text
organizationMembershipId
intakeId / source context
authorizationRevision
deal/handoff/client revisions
commercialSourceRevision
projectTemplateRevision
workflowTemplateRevision
onboardingRevision
```

---

## Never cache “READY” indefinitely

Readiness can change if:

* source Contract changes,
* Handoff changes,
* template archived,
* permission changes.

Creation must revalidate server-side.

---

## Performance

Use:

* exact source references,
* batched template summaries,
* readiness aggregate,
* lazy full template preview,
* no full Task/Milestone generation until creation.

---

## Partial failure contract

Example:

```text
Client                  ✓
Commercial source       ✓
Project Template        ✓
Workflow Template       ✓
Onboarding check        ✕
```

Correct:

> Project intake available. Onboarding prerequisite cannot currently be verified. Creation readiness unknown/blocked according to policy.

Not:

> Onboarding incomplete.

Another example:

```text
Project created          ✓
Workflow init            ✕
```

Correct:

> Project created; initialization requires attention.

Not:

> Project creation failed — create again.

---

## Backend Requirement Matrix

| Requirement                                             | Status                           |
| ------------------------------------------------------- | -------------------------------- |
| Canonical Project reuse from 023                        | **Critical**                     |
| ProjectIntake/Project separation                        | **Critical**                     |
| Persistent Intake only if workflow requires it          | **Critical modeling discipline** |
| Design 106/108 shared ProjectCreationService            | **Critical**                     |
| Handoff-created/manual Project convergence              | **Critical**                     |
| Duplicate Project prevention                            | **Critical**                     |
| Project creation idempotency                            | **Critical**                     |
| DB-level source-purpose uniqueness where applicable     | **Critical**                     |
| Unknown creation outcome reconciliation                 | **Critical**                     |
| ClientRelationship/Project separation                   | **Critical**                     |
| Company/ClientRelationship separation                   | **Critical**                     |
| Exact ProposalVersion lineage                           | **Critical where applicable**    |
| Exact ContractVersion lineage                           | **Critical where applicable**    |
| Current catalog/historical commercial source separation | **Critical**                     |
| Project initial scope/commercial document separation    | **Critical**                     |
| Package/ProjectTemplate separation                      | **Critical**                     |
| Package/WorkflowTemplate separation                     | **Critical**                     |
| ProjectTemplate/WorkflowTemplate separation             | **Critical**                     |
| ProjectTemplate/Project separation                      | **Critical**                     |
| WorkflowTemplateVersion/ProjectWorkflow separation      | **Critical**                     |
| Exact ProjectTemplateVersion pinning                    | **Critical**                     |
| Exact WorkflowTemplateVersion pinning                   | **Critical**                     |
| Later template edits do not alter Project               | **Critical**                     |
| Runtime workflow instantiated from exact version        | **Critical**                     |
| Template TaskDefinition/Task separation                 | **Critical**                     |
| Template MilestoneDefinition/Milestone separation       | **Critical**                     |
| Task/Milestone initialization idempotency               | **Critical**                     |
| Project status/stage separation                         | **Critical**                     |
| Project workflow/Project identity separation            | **Critical**                     |
| Onboarding/Project creation separation                  | **Critical**                     |
| Onboarding prerequisite policy-driven                   | **Critical**                     |
| Fresh readiness check before creation                   | **Critical**                     |
| Server-authoritative source resolution                  | **Critical**                     |
| Browser cannot choose favorable commercial version      | **Critical**                     |
| Source references pinned before creation                | **Critical**                     |
| ProjectTemplate compatibility validation                | **Critical**                     |
| WorkflowTemplate compatibility validation               | **Critical**                     |
| Cross-tenant references prohibited                      | **Critical**                     |
| Initial team assignment via canonical service           | **Critical if present**          |
| Project creation concurrency protection                 | **Critical**                     |
| Partial initialization recovery                         | **Critical**                     |
| No blind rollback/recreate after partial initialization | **Critical**                     |
| Audit/outbox integration                                | **Required**                     |
| Permission-safe intake composition                      | **Critical**                     |
| Design 109 template reuse                               | **Critical architecture**        |
| Design 110 workflow reuse                               | **Critical architecture**        |
| Designs 111–118 runtime Project reuse                   | **Critical architecture**        |

---

# 8. Consolidation

Design 108 creates a major boundary risk because it translates upstream commercial/client context into operational Project state.

**ProjectIntake / Project conflation**
Incomplete intake becomes runtime delivery record.

**Project creation form / Project source truth conflation**
Frontend payload overrides canonical Client/commercial sources.

**WonDealHandoff / Project conflation**
Sales-to-operations orchestration becomes delivery entity.

**Handoff retry / Project recreation conflation**
One Deal creates multiple Projects.

**Manual create path / Handoff create path divergence**
Different Project models appear.

**Project name / Project identity conflation**
Duplicate detection uses display strings.

**Client / Project conflation**
Project state becomes Client lifecycle.

**Company / ClientRelationship conflation**
Project attaches directly to mutable business identity without relationship context.

**Current Deal / Project scope conflation**
Later CRM edits change delivery scope.

**Proposal / Project conflation**
Commercial proposal becomes operational entity.

**Latest Proposal / agreed ProposalVersion conflation**
New draft changes active delivery.

**Contract / Project conflation**
Legal agreement becomes delivery runtime.

**Latest ContractVersion / executed version conflation**
Unsigned amendment changes Project scope.

**Current Package / Project scope conflation**
Catalog update alters delivery obligations.

**Package / ProjectTemplate conflation**
What was sold becomes how delivery is initialized.

**Package / WorkflowTemplate conflation**
Commercial bundle becomes process definition.

**Product benefit / Project deliverable conflation**
Reusable promise becomes actual fulfillment instance.

**ProjectTemplate / Project conflation**
Template lifecycle becomes runtime Project lifecycle.

**ProjectTemplate latest / pinned version conflation**
Existing Project changes when template publishes.

**ProjectTemplate / WorkflowTemplate conflation**
Project defaults and stage process become one mutable object.

**WorkflowTemplate / ProjectWorkflow conflation**
Runtime stages dynamically follow reusable template.

**WorkflowTemplateVersion / current workflow state conflation**
Template edits move active Project stages.

**StageDefinition / ProjectStageInstance conflation**
One template change updates all projects.

**TaskDefinition / Task conflation**
Template task becomes runtime work record.

**MilestoneDefinition / Milestone conflation**
Reusable definition gains client-specific completion.

**Template publish / Project migration conflation**
Every Project silently upgrades.

**Template archive / Project invalidation conflation**
Historical runtime loses definition.

**Project status / Project stage conflation**
Lifecycle and workflow progress collapse.

**Project stage / readiness conflation**
Being at a stage implies required gates passed.

**Project / ClientOnboarding conflation**
Onboarding progress becomes delivery progress.

**Onboarding 100% / Project creation authority conflation**
Frontend percentage determines creation.

**Onboarding service unavailable / incomplete conflation**
Outage blocks for wrong reason or creates false state.

**Onboarding incomplete / creation blocked universally conflation**
Business policy becomes hard-coded.

**Commercial source unavailable / current Package fallback conflation**
Project gets wrong scope.

**Browser-selected Proposal/Contract version / source authority conflation**
User can deliberately select favorable terms.

**Browser-selected Client / trusted Project owner context conflation**
Project attached to wrong Client.

**Browser-selected TemplateVersion / eligibility authority conflation**
Archived/unapproved template used.

**Latest template lookup / exact-version pinning conflation**
Concurrent publish changes initialization mid-request.

**Project created / workflow initialized conflation**
Partial initialization disappears.

**Workflow initialization failed / Project creation failed conflation**
Retry creates duplicate Project.

**Project DB timeout / no Project conflation**
Network error duplicates Project.

**Project created / Handoff complete conflation**
Other handoff requirements are ignored.

**Project created / Onboarding complete conflation**
Delivery starts and onboarding closes incorrectly.

**Project created / Tasks complete conflation**
Runtime work definitions confused with instances.

**Initial team assignment / authorization conflation**
Assigned users automatically gain forbidden permissions.

**Project owner / global template admin conflation**
Project manager can alter reusable process definitions.

**Template use / template edit permission conflation**
Ordinary user modifies shared operations configuration.

**Project date / Contract date conflation**
Legal/effective dates copied blindly into delivery.

**Project target date / Contract term expiry conflation**
Operational deadline changes legal term.

**Current commercial mapping / historical Project initialization conflation**
Mapping changes rewrite past projects.

**Package→Template mapping / identity conflation**
Package is treated as workflow.

**Creation readiness / editable boolean conflation**
Frontend can force create.

**Readiness cache / creation authority conflation**
Stale green state bypasses new blocker.

**Generic nested Project create payload**
Client controls Client, Contract, workflow, Tasks, Team simultaneously.

**One distributed create transaction across domains**
Project creation becomes fragile across Client/Onboarding/Team services.

**Cross-tenant template usage**
One organization's workflow seeds another's Project.

**Cross-tenant Client source**
Project created for wrong tenant.

**ActivityEvent / Project creation evidence conflation**
Timeline text becomes source truth.

**Notification / initialization state conflation**
Dismissal resolves failure.

**Search index / Project existence conflation**
Index lag triggers duplicate creation.

**Cache / canonical creation outcome conflation**
Stale intake says Project absent after successful creation.

**108/023 duplicate Project backend**
Project 360 and Project Creation disagree.

**108/106 duplicate Project creation engine**
Won Deal Handoff and manual creation diverge.

**108/107 duplicate onboarding logic**
Project creation stores its own onboarding progress.

**108/104–105 duplicate commercial source**
Project reads current catalog.

**108/109 duplicate ProjectTemplate state**
Intake owns template editing.

**108/110 duplicate WorkflowTemplate state**
Intake owns stage configuration.

**108/111 duplicate Task/Milestone runtime**
Creation form creates noncanonical work objects.

**108/112 duplicate Team Assignment state**
Intake stores another resource model.

No additional screen is required.

These are **Project intake identity, exact commercial-source pinning, canonical Project creation, template/runtime separation, workflow initialization, idempotency, duplicate prevention, authorization, concurrency, and partial-initialization requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT INTAKE, SOURCE-VALIDATION & IDEMPOTENT PROJECT CREATION ANCHOR**

**Domain directive:**
**ProjectIntake ≠ Project ≠ ProjectTemplate ≠ ProjectTemplateVersion ≠ WorkflowTemplate ≠ WorkflowTemplateVersion ≠ ClientRelationship ≠ Deal/WonDealHandoff ≠ ProposalVersion/ContractVersion/CommercialSnapshot ≠ Product/Package ≠ ClientOnboarding ≠ ProjectStage ≠ Task ≠ Milestone ≠ TeamAssignment.**

**Project directive:**
Design 023 remains the sole canonical Project identity. Design 108 prepares and invokes Project creation; it never establishes a parallel IntakeProject/DealProject domain.

**Intake directive:**
`ProjectIntake` is justified as persistent business state only when the frozen workflow requires save/resume, multi-step validation or asynchronous orchestration. Otherwise it remains application/form state rather than unnecessary domain storage.

**Creation-service directive:**
manual Design 108 creation and Design 106 Won Deal Handoff creation must converge on one canonical `ProjectCreationService`.

**Duplicate-prevention directive:**
if an exact source/Handoff has already created the intended Project, Design 108 resolves and reuses that Project rather than creating another one.

**Idempotency directive:**
Project creation, workflow initialization and template-defined runtime instantiation are replay-safe. Repeated clicks, retries, worker restarts and uncertain network responses cannot create duplicate Projects, Tasks, Milestones or workflow stages.

**Unknown-outcome directive:**
when Project creation may have committed but the response was lost, the platform reconciles by stable creation intent/Handoff lineage before attempting another create.

**Client directive:**
canonical `ClientRelationship` from Design 021 remains the Project's client/account context. Company, Client relationship and Project are never collapsed.

**Commercial-source directive:**
Project initialization pins the exact authoritative agreed commercial source—ProposalVersion, executed ContractVersion and/or CommercialSnapshot—according to policy.

**Source-security directive:**
the browser cannot arbitrarily choose an older Proposal/Contract version or different Client to influence Project scope. Source resolution and validation remain server-authoritative.

**Catalog directive:**
Designs 104–105 represent mutable future offerings. Project initial scope never derives dynamically from the current Product/Package catalog when an exact historical agreement exists.

**Scope directive:**
the Project receives an initial operational scope derived from agreed commercial evidence. Later Project scope changes use Project/Change Request domains and never rewrite Proposal/Contract history.

**Package directive:**
Package remains commercial configuration and is never the Project, ProjectTemplate, WorkflowTemplate or actual Deliverable.

**Project-template directive:**
Design 109 remains canonical for reusable Project templates. Design 108 pins one exact `ProjectTemplateVersion` at creation and never dynamically follows the template's latest version afterward.

**Workflow-template directive:**
Design 110 remains canonical for workflow configuration. One exact `WorkflowTemplateVersion` is pinned and instantiated into runtime ProjectWorkflow state.

**Runtime directive:**
created Project workflows, stages, Tasks and Milestones become canonical runtime entities. They retain template provenance but are independent from later template edits.

**No-auto-upgrade directive:**
publishing ProjectTemplate v5 or WorkflowTemplate v8 never mutates a Project created from v4/v7. Any migration, if ever supported, requires an explicit governed operation.

**Task directive:**
template TaskDefinitions instantiate canonical Design 034 Tasks. They never remain runtime “template task” objects.

**Milestone directive:**
template milestone definitions instantiate canonical Project Milestones and do not carry client-specific state in the reusable template.

**Project-state directive:**
Project lifecycle, workflow stage, health, readiness and initialization state remain independently modeled. Project creation cannot flatten them into a single status.

**Onboarding directive:**
Design 107 remains authoritative for ClientOnboarding. Onboarding may be a Project creation prerequisite under versioned policy but never becomes Project identity or lifecycle.

**Readiness directive:**
`ProjectCreationReadinessResolver` performs server-side validation over Client, commercial source, templates, onboarding/policy, permissions and duplicate lineage. Readiness is derived and never a browser-editable boolean.

**Fresh-validation directive:**
the final create command re-evaluates readiness immediately before committing. Cached/visual readiness is not authorization.

**Template-compatibility directive:**
ProjectTemplate and WorkflowTemplate selections must be same-tenant, usable, compatible and authorized; arbitrary version IDs supplied by the browser are insufficient.

**Pinning directive:**
once creation starts, exact Client/commercial/template references remain pinned throughout initialization. Worker steps never re-run “latest” lookups halfway through.

**Initialization directive:**
Project + essential runtime workflow initialization should be transactionally consistent within the Project domain where practical. If initialization must be asynchronous, partial initialization is explicit and resumable instead of causing duplicate Project recreation.

**Handoff directive:**
Design 106 records Project output/reference from this same creation engine but never owns Project state.

**Team directive:**
initial owner/team defaults, if frozen Design 108 includes them, use canonical Project Team/Resource Assignment infrastructure. Assignment remains separate from authorization.

**Date directive:**
Project start/target dates are operational Project data, even when seeded from Contract/template context. Contract effective date and Project schedule remain distinct.

**Tenant directive:**
Client, Company, Deal/Handoff, Proposal/Contract, ProjectTemplate, WorkflowTemplate, Team and Project must all resolve inside the same authorized tenant boundary.

**Concurrency directive:**
Project creation, intake edits, template selections and runtime initialization use expected revisions/database constraints to prevent conflicting creation or double initialization.

**Partial-failure directive:**
Client, commercial source, onboarding, templates and initialization can fail independently. Dependency unavailability never becomes false absence, alternate “latest” data, or permission to create with guessed scope.

**Search directive:**
Design 079 may discover Projects after canonical creation but Search/index visibility is never used to determine whether a Project exists for idempotency purposes.

**Caching directive:**
intake caches vary by membership authorization, source/Handoff revisions, Client/commercial source revisions, template revisions and onboarding state. Cached `READY` or `Project absent` values are never authoritative at mutation time.

**Activity directive:**
Project creation and initialization events may project into Activity but Activity remains observational and never substitutes for Project/intake/runtime state.

**Audit directive:**
creation intent, selected exact commercial/template versions, Project creation, reconciliation after uncertain outcome and material initialization failures generate source-aware Audit evidence.

**Future-reuse directive:**
Design **109 — Project Template / Workflow Template Library** must provide the canonical reusable project/workflow configuration consumed here, while Design 108 remains a consumer/creator surface rather than another template-authoring backend.

**Overlap directive:**
Designs **023, 034, 104–112** plus **106–107** must preserve one continuous **Won Deal / ClientRelationship / agreed CommercialSnapshot → Project Intake → exact ProjectTemplateVersion + WorkflowTemplateVersion → canonical Project → runtime Workflow/Stages → Tasks/Milestones/Team** lineage while keeping commercial agreement, onboarding, reusable configuration and runtime delivery independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT CREATION FOUNDATION — CANONICAL PROJECT IDENTITY + OPTIONAL DURABLE PROJECTINTAKE ONLY WHEN WORKFLOW REQUIRES IT + SERVER-AUTHORITATIVE CLIENT/COMMERCIAL-SOURCE RESOLUTION + EXACT AGREED PROPOSAL/CONTRACT SNAPSHOT PINNING + EXACT PROJECTTEMPLATEVERSION/WORKFLOWTEMPLATEVERSION PINNING + IDEMPOTENT SOURCE-AWARE PROJECT CREATION + RUNTIME WORKFLOW/TASK/MILESTONE INSTANTIATION + UNKNOWN-OUTCOME RECONCILIATION + PARTIAL-INITIALIZATION RECOVERY + STRICT TEMPLATE/RUNTIME SEPARATION — AND NEVER ALLOW RETRIES, “LATEST” TEMPLATE/CATALOG LOOKUPS, CLIENT-SUPPLIED SOURCE IDS, ONBOARDING PERCENTAGES OR PARTIAL INITIALIZATION FAILURE TO CREATE DUPLICATE PROJECTS OR REWRITE HISTORICAL COMMERCIAL/DELIVERY TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **108 / 153** |
| **PASS**                                   |                        **108** |
| **STANDARDIZE decisions**                  |                        **106** |
| **Potential implementation-overlap flags** |                         **99** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**108 / 153 = 70.6% audited.**

### Canonical Project-creation architecture after Design 108

```text
             CLIENT RELATIONSHIP
                     │
                     ↓
          EXACT COMMERCIAL SOURCE
         Proposal / Contract snapshot
                     │
                     ↓
               PROJECT INTAKE
                     │
          ┌──────────┴──────────┐
          ↓                     ↓
ProjectTemplateVersion   WorkflowTemplateVersion
          │                     │
          └──────────┬──────────┘
                     ↓
            ProjectCreationService
                     │
                     ↓
                 PROJECT
                     │
          ┌──────────┼───────────┐
          ↓          ↓           ↓
    ProjectWorkflow  Tasks    Milestones
          │
      Runtime Stages
```

The template/runtime boundary is now strict:

```text
Project PR-100
created from:

ProjectTemplate v4
WorkflowTemplate v7

Later:
ProjectTemplate v5 published
WorkflowTemplate v8 published

RESULT:

PR-100 remains based on
v4 + v7 runtime initialization.

No automatic migration.
```

The commercial-source rule is equally strict:

```text
Client agreed:
ContractVersion v3

Current Package today:
different price / benefits

Project creation uses:
ContractVersion v3 / agreed snapshot

NOT:
current catalog.
```

And duplicate prevention must survive uncertain execution:

```text
Create Project request
        ↓
Project PR-100 committed
        ↓
network response lost

Correct:
reconcile creation intent
→ find PR-100
→ reuse PR-100

Incorrect:
create PR-101
```

Finally:

```text
Project Intake READY
        ≠
Project created

Project created
        ≠
Workflow initialization complete

Workflow initialized
        ≠
Project completed

Onboarding complete
        ≠
Project created automatically

Package
        ≠
ProjectTemplate
        ≠
WorkflowTemplate
        ≠
Project
```

Each remains a separate canonical fact.

## Next Sequential Audit Target

### **Design 109 — Project Template / Workflow Template Library**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
