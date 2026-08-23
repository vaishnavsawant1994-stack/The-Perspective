Correct. We continue strictly with the frozen **Design 024 — Editorial Project / Editorial Workflow Workspace**.

This is the first major **product-specific execution workspace underneath the canonical Project 360**, so the most important architectural decision is to keep the Project as the delivery umbrella while Editorial owns its specialized content-production lifecycle.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 024 — Editorial Project / Editorial Workflow Workspace

| Audit field                  | Classification                                                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                | **024**                                                                                                                                                                  |
| **Canonical name**           | **Editorial Project / Editorial Workflow Workspace**                                                                                                                     |
| **Product area**             | Editorial / Content Production / Project Delivery                                                                                                                        |
| **User surface**             | Team Workspace                                                                                                                                                           |
| **Screen class**             | Product-Specific Workflow Execution Workspace                                                                                                                            |
| **Classification**           | **Unique Anchor — Editorial Production Workspace Family**                                                                                                                |
| **Primary purpose**          | Coordinate the editorial lifecycle for one Project from intake/questionnaire through drafting, review, client approval, assets, design handoff and publication readiness |
| **Primary execution entity** | **EditorialProject / EditorialWorkstream**                                                                                                                               |
| **Parent business entity**   | **Project** — Design 023                                                                                                                                                 |
| **Core child entities**      | EditorialWorkflowInstance, EditorialStageInstance, Questionnaire, QuestionnaireResponse, Draft, DraftVersion, EditorialReview, ApprovalRequest, AssetRequirement         |
| **Related entities**         | Client, Contact, User, Task, File/Asset, Design/Proof, Publication, DistributionCampaign, Activity                                                                       |
| **Parent shell**             | `InternalAppShell` — Design 001                                                                                                                                          |
| **Parent project**           | Project 360 — Design 023                                                                                                                                                 |
| **Template family**          | `ProductExecutionWorkspaceTemplate` + editorial composition                                                                                                              |
| **Composition**              | `EditorialWorkflowComposition`                                                                                                                                           |
| **Auth**                     | Required                                                                                                                                                                 |
| **Permissions**              | Project + editorial + review/approval + asset/client visibility scopes                                                                                                   |
| **Implementation priority**  | **Core / Critical**                                                                                                                                                      |
| **Reuse level**              | **Extremely High for editorial/content-production screens**                                                                                                              |

---

# 1. Functional responsibility

Design 024 answers:

> **“For the editorial portion of this Project, what content are we producing, which editorial stage are we in, what information has the Client supplied, which Draft Version is authoritative, what is waiting for internal review or Client approval, which assets are missing, and when is the editorial work genuinely ready for publication?”**

The architecture now becomes:

```text
PROJECT
Design 023
   ↓
Editorial workstream
   ↓
EDITORIAL PROJECT
Design 024
   │
   ├── Questionnaire
   ├── Research / Inputs
   ├── Draft
   ├── Draft Versions
   ├── Internal Review
   ├── Client Review
   ├── Approvals
   ├── Assets
   ├── Design Handoff
   └── Publication Readiness
```

The central rule is:

> **Project ≠ EditorialProject ≠ EditorialWorkflowInstance.**

---

# 2. Project remains the delivery umbrella

Design 023 established the canonical Project.

Design 024 does not create another competing Project system.

Correct:

```text
Project
├── commercial / client context
├── project team
├── global workflow context
└── EditorialProject
       ↓
   editorial execution
```

The Project remains responsible for the overall engagement.

EditorialProject is the specialized content-production context.

---

# 3. Why EditorialProject should exist separately

A Project may eventually contain multiple product-specific workstreams:

```text
Project
├── Editorial
├── Magazine Design
├── Podcast
├── Video
├── Publishing
└── Distribution
```

Therefore stuffing editorial-specific fields directly into `Project` would create a huge product-specific table.

Avoid:

```text
project.questionnaireReceived
project.currentDraftVersion
project.editorialReviewer
project.clientApproval
project.imagesReceived
```

as the sole architecture.

Prefer:

```text
Project
   ↓
EditorialProject
   ↓
Editorial-specific records
```

---

# 4. EditorialProject ≠ Workflow

The same pattern discovered in Design 023 applies here.

### EditorialProject

Represents the editorial execution context.

### Editorial Workflow Template

Defines the reusable editorial process.

### Editorial Workflow Instance

Represents the instantiated workflow for this particular EditorialProject.

Conceptually:

```text
EditorialWorkflowTemplate
          ↓
      instantiate
          ↓
EditorialWorkflowInstance
          ↓
EditorialProject
```

---

# 5. Template edits must not mutate live editorial projects

Suppose the master editorial process changes next month.

Active Editorial Projects must not suddenly acquire/remove stages silently.

Therefore:

```text
EditorialWorkflowTemplate Version
              ↓
WorkflowInstance snapshot/version
              ↓
EditorialProject
```

The same template-instance safety principle used in Designs 022–023 remains mandatory.

---

# 6. Canonical editorial lifecycle

The previously established editorial lifecycle contains stages along the lines of:

```text
Project Created
       ↓
IQ Generated
       ↓
IQ Sent
       ↓
IQ Received
       ↓
Draft Generated
       ↓
Draft Review
       ↓
Client Approval
       ↓
Images Received
       ↓
Design Started
       ↓
Design Review
       ↓
Design Approved
       ↓
Publication Ready
       ↓
Published
       ↓
Distribution
       ↓
Completed
```

The exact persisted stage configuration should belong to the canonical workflow definition rather than hard-coded frontend conditionals.

The critical architectural point is:

> **Stage represents workflow position; it does not replace Draft, Review, Approval, Asset, Publishing or Distribution state.**

---

# 7. Editorial lifecycle ≠ Project lifecycle

Example:

```text
Project:
ACTIVE

Editorial Stage:
CLIENT_APPROVAL
```

or:

```text
Project:
ACTIVE

Editorial Stage:
DESIGN_REVIEW
```

is valid.

Later the Project can still have publishing/distribution work after editorial production is complete.

Therefore:

```text
Project Status
≠
Editorial Workflow Stage
```

---

# 8. Editorial stage ≠ editorial health

An EditorialProject can be:

```text
Stage:
DRAFT_REVIEW

Health:
AT_RISK
```

because:

* reviewer overdue,
* Client deadline approaching,
* images still missing.

Another can be:

```text
Stage:
CLIENT_APPROVAL

Health:
HEALTHY
```

Health is operational condition, not workflow position.

---

# 9. Editorial stage ≠ waiting reason

One of the biggest traps is creating stages such as:

> CLIENT_APPROVAL_WAITING_FOR_IMAGES_AND_REVIEWER

Instead maintain:

```text
Stage:
CLIENT_APPROVAL

Blockers:
- Client response
- image assets
```

or relevant dependency structures.

This keeps the workflow manageable.

---

# 10. Questionnaire ≠ EditorialProject

A Questionnaire is one canonical information-gathering record.

Conceptually:

```text
EditorialProject
      ↓
Questionnaire
      ↓
QuestionnaireResponse
```

The workflow can use Questionnaire state as a requirement.

It should not duplicate all Questionnaire data into EditorialProject columns.

---

# 11. Questionnaire definition ≠ response

The system should distinguish:

### Questionnaire

Questions/template/version sent to the Client.

### QuestionnaireResponse

The Client's submitted answers.

Correct:

```text
Questionnaire
├── question definitions
└── QuestionnaireResponse
       └── answers
```

This becomes important if the Questionnaire itself changes.

---

# 12. Questionnaire sent ≠ received

These remain separate facts:

```text
Questionnaire:
SENT

Response:
NOT_RECEIVED
```

The Editorial workflow may therefore be:

```text
WAITING_ON_CLIENT
```

as an operational condition/dependency while still having a clear workflow stage.

---

# 13. Response received ≠ accepted

A Client may submit incomplete or unusable answers.

Therefore conceptually:

```text
Response
   ↓
Received
   ↓
Validation / editorial review
   ↓
Usable / needs clarification
```

where the approved process requires it.

Do not automatically consider any submission sufficient for Draft generation.

---

# 14. Questionnaire versioning

If questionnaire questions change later, historical EditorialProjects should preserve which version the Client answered.

Conceptually:

```text
QuestionnaireTemplate
├── v1
├── v2
└── v3

EditorialProject X → Questionnaire v2
```

This prevents later template edits from making old answers ambiguous.

---

# 15. Draft ≠ Draft Version

This is one of the most important Design 024 boundaries.

### Draft

The logical editorial article/content record.

### DraftVersion

One exact iteration.

```text
Draft
│
├── Version 1
├── Version 2
├── Version 3
└── Version 4
```

The system must be able to answer:

> Which exact version was internally approved?

and:

> Which exact version was approved by the Client?

---

# 16. Never overwrite Draft history

Incorrect:

```text
draft.body = newBody
```

with no historical version.

Correct:

```text
Draft
   ↓
DraftVersion v4
```

when a meaningful new editorial revision is created.

This becomes critical for approvals, Client feedback and auditability.

---

# 17. Working revision vs published revision

Not every keystroke necessarily needs a new semantic Draft Version.

The implementation can distinguish:

### Working revision/autosave

Short-lived/current editor state.

### Semantic Draft Version

A meaningful version submitted for review or approval.

For example:

```text
Working Draft
   ↓
Submit for Internal Review
   ↓
DraftVersion v3
```

Exact save/version mechanics belong to Phase 3D.

---

# 18. Draft Version must be immutable once under approval

Suppose:

```text
Draft v3
↓
Client Approval Requested
```

Then v3 should become stable for that approval cycle.

If editorial changes the content:

```text
v3
↓
new edits
↓
v4
```

The Client's approval request must remain bound to v3.

---

# 19. Approval of v3 does not approve v4

This is a permanent rule.

```text
Draft v3
Client approved
```

does **not** imply:

```text
Draft v4
Client approved
```

even if v4 differs by only one paragraph.

Therefore:

```text
ApprovalRequest
   ↓
DraftVersion
```

not merely:

```text
ApprovalRequest
   ↓
Draft
```

---

# 20. Internal review ≠ Client review

This distinction was already identified during Design 005 and becomes operational here.

### Internal Review

Team editorial quality/control.

### Client Review

External Client feedback/approval.

Correct:

```text
DraftVersion
    │
    ├── InternalEditorialReview
    │
    └── ClientApprovalRequest
```

Do not use one `reviewStatus` for both.

---

# 21. Internal review states

Conceptually an internal review may support states such as:

```text
PENDING
IN_REVIEW
CHANGES_REQUESTED
APPROVED
```

Exact enums wait for Phase 3D.

The important rule:

> Review lifecycle belongs to the Review record, not to Draft's general lifecycle field.

---

# 22. Client approval states

Client approval can conceptually include:

```text
NOT_REQUESTED
PENDING
APPROVED
CHANGES_REQUESTED
DECLINED
```

depending on the approved business language.

Again, exact values wait.

But Client approval is independent from internal editorial review.

---

# 23. Internal approval should usually precede Client review

A strong workflow typically prevents unreviewed internal Drafts from reaching the Client.

Conceptually:

```text
DraftVersion
      ↓
Internal Review
      ↓
Internal Approved
      ↓
Client Review
```

Whether this is mandatory comes from the workflow configuration.

The UI should not be the only enforcement layer.

---

# 24. Editorial comments ≠ Draft content

Review comments should be first-class collaboration records.

Conceptually:

```text
ReviewComment
├── draftVersionId
├── author
├── body
├── location/reference
├── visibility
├── createdAt
└── resolvedAt
```

Do not embed all review feedback directly into Draft text.

---

# 25. Internal comments ≠ Client comments

Visibility is critical.

A Client should never see:

> “This executive's answer is weak; rewrite aggressively.”

if that comment was meant only for the editorial team.

Therefore:

```text
INTERNAL
≠
CLIENT_VISIBLE
```

must be structural, not based only on frontend hiding.

---

# 26. Comment visibility must be backend-enforced

When Client Portal or external review surfaces request Draft information:

the backend should return a client-safe projection.

Do not send internal comments and hide them with CSS.

This is a critical security/privacy requirement.

---

# 27. Draft source context

A Draft may originate from:

* Questionnaire responses,
* research,
* supplied biography,
* interview,
* editorial notes.

The platform should preserve provenance where useful.

For example:

```text
Draft
├── source Questionnaire
├── ResearchItems
└── supporting Files
```

without copying all source content into opaque text fields.

---

# 28. AI-generated assistance boundary

If AI later assists Draft generation:

```text
Questionnaire / Research
        ↓
AI Draft assistance
        ↓
DraftVersion
```

the resulting Draft still belongs to the canonical editorial domain.

The system should preserve:

* human edits,
* version history,
* approvals,
* editorial responsibility.

AI output should never bypass review/approval gates merely because generation succeeded.

---

# 29. Assets ≠ Draft

Images, portraits and brand materials belong to the File/Asset system.

Correct:

```text
EditorialProject
      ↓
AssetRequirement
      ↓
Asset/File
```

Do not attach binary files directly to DraftVersion records as arbitrary blobs.

---

# 30. Asset Requirement ≠ File

This distinction matters.

### AssetRequirement

> “Need 5 high-resolution executive photographs.”

### Asset/File

The actual uploaded material.

One requirement may be satisfied by several Files.

```text
AssetRequirement
   ↓
Asset 1
Asset 2
Asset 3
```

---

# 31. Asset requirement lifecycle

Conceptually:

```text
REQUIRED
REQUESTED
RECEIVED
REVIEWED
ACCEPTED
```

where appropriate.

Exact states wait for Phase 3D.

Again:

```text
Asset requirement state
≠
Editorial workflow stage
```

---

# 32. Received asset ≠ usable asset

A Client could upload:

* low resolution image,
* wrong format,
* image with poor rights,
* irrelevant image.

Therefore:

```text
RECEIVED
≠
ACCEPTED / READY
```

where quality review is needed.

This is important for genuine publication readiness.

---

# 33. Client dependency architecture

Design 024 should reuse the distinction discovered in Designs 022–023.

Potential Client dependencies:

**questionnaire response**
**images**
**fact confirmation**
**Draft approval**

Internal dependencies:

**research**
**editing**
**proofreading**
**design preparation**

The workspace must allow Operations to answer:

> Are we waiting on the Client or on our team?

---

# 34. Editorial Task ≠ workflow stage

A stage can contain multiple Tasks.

Example:

```text
Stage: Draft Review

Tasks:
├── Fact check
├── Copyedit
├── Executive tone review
└── Final internal approval
```

Tasks remain canonical Task records tied to the Project/Editorial context.

Do not create another editorial-only task engine.

---

# 35. Stage criteria

A workflow stage should be capable of having canonical entry/exit requirements.

Example:

```text
Exit Draft Review when:
- internal review approved
- blocking comments resolved
```

or:

```text
Exit Client Approval when:
- exact DraftVersion approved
```

These conditions belong in the workflow engine.

---

# 36. Manual stage movement must not bypass gates

Incorrect:

```text
user drags "Client Approval"
→ "Design Started"
```

and frontend simply updates stage.

Correct:

```text
Transition request
      ↓
WorkflowTransitionService
      ↓
required approval?
assets?
permissions?
blocking issues?
      ↓
transition
```

This should use the same underlying Project/workflow transition infrastructure as Design 023.

---

# 37. Editorial Project and Project workflow relationship

The platform needs one clear hierarchy.

A strong conceptual model:

```text
Project
   ↓
Project Workflow Instance
   ↓
Editorial workstream stage references
       ↓
EditorialProject
```

or:

```text
Project
   ↓
EditorialProject
       ↓
Editorial Workflow Instance
```

The exact cardinality belongs to Phase 3D.

The key requirement is:

> Do not maintain two unrelated “current stage” systems that can contradict each other.

---

# 38. Cross-workflow synchronization

If the overall Project stage depends on editorial state:

```text
EditorialProject
Publication Ready
      ↓
Project Workflow
Editorial phase complete
```

that should happen via canonical domain events / transition orchestration.

Not via UI components manually setting both statuses.

---

# 39. Design handoff

Design 024 reaches an important boundary when editorial content becomes ready for visual production.

Correct:

```text
Approved DraftVersion
      +
Accepted Assets
      ↓
Editorial readiness
      ↓
Design workstream
```

The Design system should consume the exact approved DraftVersion.

It should not always fetch:

> latest Draft

because a newer unapproved draft could exist.

---

# 40. Approved content snapshot

Design/production must know exactly what content it should use.

Conceptually:

```text
designSourceDraftVersionId
```

or equivalent.

This ensures:

```text
Design v2 uses Draft v5
```

rather than ambiguous:

```text
Design uses current draft
```

---

# 41. Design review ≠ editorial review

Once layout/design begins:

### Editorial Review

Focuses on written content.

### Design Review

Focuses on layout/visual execution.

Both may have approvals.

They should not share one generic `reviewStatus` even if they reuse the same Approval/Review primitives.

---

# 42. Design approved ≠ publication ready

A design might be approved while:

* metadata missing,
* release date unset,
* final file absent,
* publication requirements incomplete.

Therefore:

```text
Design Approved
≠
Publication Ready
```

Publication readiness needs its own canonical evaluation.

---

# 43. Publication readiness

A dedicated readiness model or service should evaluate required conditions.

Conceptually:

```text
PublicationReadiness
├── editorial Draft approved
├── Client approval satisfied
├── required assets accepted
├── final design approved
├── metadata complete
├── required files generated
└── other configured publishing gates
```

Do not represent readiness only as:

```text
publicationReady = true
```

manually toggled by arbitrary users.

---

# 44. Readiness percentage ≠ readiness

Like onboarding:

```text
95% complete
```

does not necessarily mean:

```text
READY
```

if a mandatory final approval remains absent.

Critical gates outweigh percentage completion.

---

# 45. Publication readiness ≠ publishing

Design 024 can conclude:

> **This Editorial Project is ready to publish.**

Actual release management belongs later to:

**Design 124 — Publishing Queue / Publication Management Workspace**
**Design 125 — Publication Detail / Release Management**.

Correct:

```text
Editorial Project
      ↓
Publication Ready
      ↓
Publishing Domain
```

Do not make EditorialProject itself the publication record.

---

# 46. Published ≠ distributed

Likewise:

```text
Publication
   ↓
Published
```

is not the same as:

```text
Distribution
   ↓
Delivered across channels
```

Editorial may display downstream status but should consume it from the canonical domains.

---

# 47. Relationship to Design 005

Design 005 — Editorial Dashboard and Design 024 have intentionally different scopes.

### Design 005

Cross-project editorial overview:

> What editorial work across the organization needs attention?

### Design 024

One Editorial Project:

> What is happening inside this specific editorial workflow?

Correct:

```text
Design 005
Editorial Dashboard
       ↓
Design 024
Editorial Project / Workflow
```

Do not merge them.

---

# 48. Relationship to Design 023

Likewise:

### Design 023

Full cross-domain Project 360.

### Design 024

Editorial workstream execution.

```text
Design 023
Project 360
   ↓
Editorial tab/entry
   ↓
Design 024
Editorial Project Workspace
```

The Project 360 can summarize:

**Editorial Stage**
**Draft Status**
**Client Approval**
**Readiness**

but should not recreate the full editorial editor/review workflow.

---

# 49. Reusable component mapping

Design 024 should reuse:

`RecordHeader`
`RecordTabs`
`ActivityTimeline`
`OwnerControl`
`ProgressIndicator`
`WorkflowStageSummary`
`AssigneeControl`
`FileCard`
`ApprovalBadge`

and introduce/formalize editorial-specific composites:

`EditorialWorkflowHeader`
`EditorialStageTracker`
`QuestionnaireStatusCard`
`DraftVersionSelector`
`DraftEditorShell`
`DraftReviewPanel`
`ReviewCommentThread`
`ClientApprovalPanel`
`AssetRequirementList`
`EditorialDependencyCard`
`EditorialReadinessCard`
`PublicationReadinessSummary`

---

# 50. New reusable family

We now formally add:

```text
Product-Specific Execution Workspace Family
        │
        └── Editorial Production
            └── 024 Editorial Project / Workflow
```

This will become an important architectural pattern for other media products:

```text
Project
   ↓
Product-specific workstream
   ↓
Specialized execution workspace
```

while preserving one common Project domain.

---

# 51. Versioned content infrastructure

Design 024 also introduces a reusable pattern:

```text
VersionedContentRecord
├── logical content record
├── versions
├── reviews
├── approvals
└── publishing source
```

This can later help with:

* articles,
* scripts,
* captions,
* editorial documents,

without forcing Proposal/Contract legal document semantics onto content production.

---

# 52. Editorial Draft Version ≠ Proposal Version

Both use versioning but their domain meaning differs.

```text
DraftVersion
≠
ProposalVersion
≠
ContractVersion
```

They may share low-level primitives:

`VersionSelector`
`VersionHistory`
`DiffMetadata`
`ApprovalReference`

but their business rules remain separate.

---

# 53. Review infrastructure can be shared

A canonical Review foundation could support:

```text
Review
├── subject type
├── subject version
├── reviewer
├── status
├── comments
└── decision
```

while domain policies differentiate:

**Editorial Review**
**Design Review**
**Proposal Review**
**Client Review**

This is a strong Phase 3A standardization opportunity.

---

# 54. Approval infrastructure can be shared

Similarly:

```text
ApprovalRequest
├── subjectType
├── subjectVersion/reference
├── requestedBy
├── approver
├── decision
├── comments
└── timestamps
```

can serve multiple domains.

But:

> **Approval policy remains domain-specific.**

A Client approval of Draft content should not be treated identically to a manager approving a commercial discount.

---

# 55. Client Portal relationship

Clients may need to:

* answer Questionnaire,
* upload Assets,
* review Draft,
* request changes,
* approve content.

But Client Portal surfaces must use filtered client-safe projections.

Internal information such as:

**editorial notes**
**internal comments**
**staff assignments**
**AI generation prompts**
**internal readiness reasoning**

must not leak externally.

---

# 56. Client action ≠ internal action

The workspace should preserve this distinction structurally.

Examples:

```text
CLIENT:
Approve Draft v4
```

versus:

```text
INTERNAL:
Resolve copyedit comments
```

This is essential for both operational reporting and Client Portal rendering.

---

# 57. Permission architecture

Potential capabilities later include:

```text
editorial.read
editorial.edit
editorial.assign
editorial.move_stage

draft.read
draft.edit
draft.create_version
draft.submit_review

review.internal.perform
review.client.request

approval.manage

asset.requirement.manage
```

Exact permission names wait for Phase 3D.

---

# 58. Draft edit ≠ Draft approval

Important separation:

```text
EDIT CONTENT
≠
APPROVE CONTENT
```

An editor should not automatically be allowed to self-approve if the workflow policy requires independent review.

---

# 59. Internal review permission ≠ Client approval authority

Internal staff can mark:

> Internally approved

but cannot impersonate the Client's external approval unless an explicitly authorized override exists.

Any override should be auditable.

---

# 60. Stage transition permission

A user may be allowed to:

**edit Draft**

without being allowed to:

**advance Editorial workflow to Client Approval**

or:

**declare Publication Ready**.

Workflow transitions need their own permission checks.

---

# 61. Asset permissions

Users may have differentiated abilities:

**view asset**
**upload asset**
**replace asset**
**approve asset**
**delete asset**

Client-uploaded media can require additional constraints.

The File/Asset service remains authoritative.

---

# 62. Audit-critical overrides

If an administrator manually overrides:

* Client approval,
* missing asset,
* workflow gate,
* publication readiness,

the system should preserve:

```text
overrideBy
overrideAt
reason
affected requirement
```

Do not silently flip state.

---

# 63. Activity history

Meaningful EditorialProject events include:

**Editorial project created**
**Questionnaire generated**
**Questionnaire sent**
**Response received**
**Draft created**
**Draft Version created**
**Internal review requested**
**Changes requested**
**Internal approval completed**
**Client review requested**
**Client approved Draft Version**
**Client requested changes**
**Assets received**
**Asset rejected/accepted**
**Design handoff initiated**
**Design approval recorded**
**Publication readiness achieved**

These should link to canonical source records.

---

# 64. Activity ≠ review history

Review detail should remain in Review/Comment records.

Activity can summarize:

> Sarah approved Draft v4.

It should not become the only record proving that approval.

---

# 65. Audit history

Stronger audit history should preserve high-value events such as:

* Client approval/override,
* Draft version transitions,
* reviewer decisions,
* asset replacement,
* readiness overrides,
* stage transitions.

This is especially important where Client-approved content later becomes published material.

---

# 66. Concurrency — Draft editing

Multiple users may work on the same Draft.

The architecture needs either:

* collaborative editing semantics,
* document revision locking,
* optimistic concurrency,

depending on the approved implementation.

At minimum:

> stale saves must not silently erase another editor's work.

---

# 67. Concurrency — approval race

Example:

```text
Client approves Draft v4
          ↓
Editor simultaneously creates v5
```

The correct canonical result is:

```text
v4 = APPROVED
v5 = new/unapproved version
```

Approval must not drift to the latest version automatically.

---

# 68. Concurrency — stage transition

Example:

```text
User A:
tries Client Approval → Design Started

User B:
marks required asset rejected
```

The Workflow service must re-evaluate authoritative state before transition.

Browser state cannot decide.

---

# 69. Idempotency

External Client actions can retry.

For example:

```text
Client clicks Approve
network timeout
clicks again
```

Result:

> one canonical approval decision

not multiple duplicate approvals/activity records.

The same applies to Questionnaire submission and Asset upload completion events.

---

# 70. Partial failure behavior

Design 024 composes multiple domains.

Example:

```text
Editorial workflow       ✓
Drafts                   ✓
Questionnaire            ✓
Assets                   ✕
Approvals                ✓
Publication readiness    ✓/unknown
```

The whole workspace should remain usable.

Asset-related areas should show degraded state.

---

# 71. Unknown ≠ missing

If the Asset service is unavailable:

do not show:

> **No images received**

if the system simply cannot verify it.

Use:

> **Asset status unavailable**

This distinction matters because false “missing” state could block workflow incorrectly.

---

# 72. Lazy loading

The Editorial header/workflow summary can load first.

Heavy areas such as:

**Draft history**
**comments**
**assets**
**activity**

can load independently.

A Draft with thousands of comments or many versions must not delay basic Project context.

---

# 73. Read model

Design 024 is a strong candidate for:

```text
EditorialWorkspaceView
├── Project summary
├── EditorialProject
├── Workflow stage/status
├── Questionnaire summary
├── active Draft / Version
├── review summary
├── Client approval summary
├── asset readiness
├── design handoff status
├── publication readiness
├── blockers
├── next action
└── activity
```

This is a composed read model.

---

# 74. Do not PATCH the whole EditorialWorkspace

Avoid:

```text
PATCH /editorial-workspace
{
  questionnaireReceived: true,
  draftApproved: true,
  imagesReceived: true,
  publicationReady: true
}
```

Correct domain commands should look conceptually more like:

```text
submitQuestionnaireResponse()
createDraftVersion()
requestInternalReview()
submitReviewDecision()
requestClientApproval()
recordClientDecision()
attachAsset()
approveAsset()
transitionEditorialStage()
```

Each command owns one domain concern.

---

# 75. Backend architecture

Recommended conceptual architecture:

```text
Editorial Workspace UI
        ↓
EditorialWorkspaceQueryService
        ↓
Tenant + Permission Scope
        ↓
EditorialProject Domain
        │
        ├── Editorial Workflow Engine
        ├── Questionnaire Service
        ├── Draft / Version Service
        ├── Review Service
        ├── Approval Service
        ├── File / Asset Service
        ├── Task / Dependency Service
        └── Publication Readiness Service
        ↓
Canonical Project
Design 023
        ↓
Design / Publishing / Distribution domains
```

---

# 76. Backend requirements

| Requirement                             | Status       |
| --------------------------------------- | ------------ |
| Authentication                          | **Required** |
| Tenant isolation                        | **Critical** |
| Project + Editorial RBAC                | **Critical** |
| Canonical EditorialProject/workstream   | **Critical** |
| Project linkage                         | **Critical** |
| Workflow Template → Instance separation | **Critical** |
| Workflow stage transition service       | **Critical** |
| Questionnaire + version semantics       | **Required** |
| QuestionnaireResponse model             | **Critical** |
| Canonical Draft entity                  | **Critical** |
| Immutable semantic Draft Versions       | **Critical** |
| Draft concurrency protection            | **Critical** |
| Internal Review model                   | **Critical** |
| Client Review/Approval separation       | **Critical** |
| Version-specific approvals              | **Critical** |
| Review comments + visibility            | **Critical** |
| Asset Requirement model                 | **Required** |
| File/Asset integration                  | **Critical** |
| Client vs internal dependency model     | **Required** |
| Design handoff reference                | **Critical** |
| Publication readiness service           | **Critical** |
| Permission-aware Client projection      | **Critical** |
| Idempotent Client actions               | **Required** |
| Partial-failure support                 | **Required** |
| Activity history                        | **Required** |
| Audit history                           | **Required** |

---

# 77. Canonical editorial metrics

Later dashboards/analytics may need definitions such as:

**Editorial Projects Active**
**Drafts Awaiting Internal Review**
**Drafts Awaiting Client Review**
**Average Draft Turnaround Time**
**Client Approval Time**
**Projects Waiting on Client**
**Assets Missing**
**Publication Ready**
**Editorial Projects At Risk**

These definitions must stay consistent across:

**Design 005 Editorial Dashboard**
**Design 006 Operations Dashboard**
**Design 023 Project 360**
**Design 024 Editorial Workspace**
**Analytics / Reports**

---

# 78. Internal review time vs Client wait time

A strong data model should eventually make it possible to distinguish:

```text
Editorial duration:
12 days

Internal production:
7 days

Waiting on Client:
5 days
```

This becomes highly valuable operationally.

The architecture should preserve dependency ownership and timestamps even if V1 does not expose every metric.

---

# 79. Main implementation risks

The Design 024 audit flags several critical risks:

**Project/EditorialProject conflation**
Stuffing editorial-specific workflow data directly into the generic Project.

**Workflow/status conflation**
Trying to represent Draft, Client Approval, Assets and publication readiness through one current-stage field.

**Questionnaire duplication**
Copying Client answers into arbitrary project fields without canonical Questionnaire records.

**Draft overwrite**
Losing version history through one mutable body field.

**Approval version drift**
Client approval of v3 being treated as approval of v4.

**Internal/client review conflation**
One review status exposing internal operations to Clients.

**Internal-comment leakage**
Client Portal receiving hidden editorial notes/comments.

**Asset/file conflation**
“Images received” checkbox without authoritative File/Asset records.

**Received/usable asset conflation**
Low-quality assets counting as readiness.

**Design using latest Draft instead of approved Draft**
Production picking up unapproved content.

**Design approved/publication-ready conflation**
Skipping required publishing prerequisites.

**Frontend stage transitions**
UI bypassing review/approval gates.

**Duplicate workflow engines**
Project stage and Editorial stage evolving independently with contradictory state.

**False missing-state during service outage**
Unavailable Asset/Approval service reported as incomplete.

None requires another visual screen.

They require correct product-execution architecture.

# Design 024 Audit Verdict

## **PASS — EDITORIAL PRODUCTION WORKSPACE ANCHOR**

**Template directive:** Design 024 establishes the first canonical `ProductExecutionWorkspaceTemplate` composition underneath Project 360, specialized for Editorial production.

**Domain directive:** **Project ≠ EditorialProject ≠ EditorialWorkflowInstance ≠ Draft ≠ DraftVersion.**

**Workflow directive:** Editorial workflow stages are server-authoritative runtime stages derived from a controlled Workflow Template/Instance architecture.

**Questionnaire directive:** Questionnaire definitions, responses and editorial validation remain canonical records rather than boolean Project fields.

**Version directive:** Editorial content uses meaningful Draft Versions; review and approval must always reference the exact version under consideration.

**Review directive:** Internal editorial review and Client review are separate workflows with separate visibility and decision semantics.

**Approval directive:** Client approval of one Draft Version never transfers automatically to a later version.

**Visibility directive:** Internal comments, notes, AI/editing context and team-only review data must be removed at backend projection level before Client Portal delivery.

**Asset directive:** Asset Requirements and uploaded Files/Assets remain separate canonical entities; received does not necessarily mean accepted/usable.

**Dependency directive:** Waiting on Client and waiting on internal team remain structurally distinguishable.

**Design-handoff directive:** Design/production must consume the exact approved Draft Version, not an ambiguous “latest draft.”

**Readiness directive:** Publication readiness is a canonical gate calculation over required editorial, Client, asset and design conditions—not a manually toggled frontend flag.

**Publishing directive:** Editorial readiness hands off to the canonical Publishing domain; EditorialProject is not itself the Publication record.

**Reuse directive:** Design 005, Design 023 and Design 024 share one canonical Editorial/Project domain while preserving cross-project dashboard, Project 360 and detailed editorial-workspace responsibilities.

**Consolidation directive:** **STANDARDIZE VERSIONED CONTENT + REVIEW + APPROVAL + ASSET-READINESS INFRASTRUCTURE — DO NOT MERGE EDITORIAL WORKFLOW WITH PROJECT 360, DESIGN REVIEW, PUBLISHING OR DISTRIBUTION WORKSPACES.**

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **24 / 153** |
| **PASS**                                   |                         **24** |
| **STANDARDIZE decisions**                  |                         **22** |
| **Potential implementation-overlap flags** |                         **15** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Reusable architecture through Design 024

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
│   ├── Deal Detail                          017
│   ├── Client 360                           021
│   └── Project 360                          023
├── Versioned Commercial Document            018
├── Contract Execution Workspace             019
├── Billing & Payment Workspace              020
├── Guided Workflow / Checklist              022
└── Product-Specific Execution
    └── Editorial Production
        └── 024 Editorial Project / Workflow
```

We have now reached the first complete **delivery-production architecture**:

```text
PROJECT
Design 023
   ↓
EDITORIAL WORKSTREAM
Design 024
   │
   ├── Questionnaire
   ├── Draft / Versions
   ├── Internal Review
   ├── Client Review
   ├── Client Approval
   ├── Assets
   ├── Design Handoff
   └── Publication Readiness
   ↓
DESIGN / PRODUCTION
   ↓
PUBLISHING
   ↓
DISTRIBUTION
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 025 Audit**

For **Design 025**, we should first retrieve its **exact frozen identity from the approved 153-design inventory** before performing any audit.

I will not derive Design 025 from the editorial workflow or assume it is the next production screen. Once the frozen identity is verified, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no new screen and no sequence change.**

