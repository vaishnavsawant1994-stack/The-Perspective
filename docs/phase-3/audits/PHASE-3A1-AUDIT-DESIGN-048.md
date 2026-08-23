# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 048 — Client Questionnaires

Design 048 should become the **canonical Client Portal questionnaire completion workspace** for questionnaires formally assigned to an authenticated Client participant.

Its core architectural responsibility is to preserve the full questionnaire lifecycle:

> **Questionnaire Definition ≠ Questionnaire Version ≠ Questionnaire Assignment ≠ Questionnaire Response ≠ Response Revision ≠ Client Action.**

The Client must always answer the **exact questionnaire version that was assigned**, while historical responses remain reproducible even if the master questionnaire is edited later.

| Audit field                       | Classification                                                                                                                     |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                     | **048**                                                                                                                            |
| **Canonical name**                | **Client Questionnaires**                                                                                                          |
| **Product area**                  | Client Portal / Editorial / Intake / Collaboration                                                                                 |
| **User surface**                  | **Client Portal**                                                                                                                  |
| **Screen class**                  | Versioned Client Form / Structured Response Workspace                                                                              |
| **Classification**                | **Portal Workflow Anchor — Questionnaire Completion Family**                                                                       |
| **Primary purpose**               | Let authorized Client participants view, complete, save, submit, revise where permitted, and track questionnaires assigned to them |
| **Primary reusable entity**       | **QuestionnaireDefinition**                                                                                                        |
| **Version entity**                | **QuestionnaireVersion**                                                                                                           |
| **Assignment entity**             | **QuestionnaireAssignment**                                                                                                        |
| **Response entity**               | **QuestionnaireResponse**                                                                                                          |
| **Response history**              | **QuestionnaireResponseRevision** or equivalent version history                                                                    |
| **Supporting entities**           | QuestionDefinition, ResponseAnswer, Project, ClientPortalMembership, ClientRequest/ClientActionView, Asset/FileVersion             |
| **Internal editorial dependency** | Design 024 — Editorial Project                                                                                                     |
| **Client Action dependency**      | Design 047                                                                                                                         |
| **Project dependency**            | Design 043                                                                                                                         |
| **Future library overlap**        | Design 067 — Client Questionnaires Library                                                                                         |
| **Parent shell**                  | `ClientPortalShell` — Design 002                                                                                                   |
| **Template family**               | `ClientQuestionnaireWorkspaceTemplate`                                                                                             |
| **Composition**                   | `ClientQuestionnaireComposition`                                                                                                   |
| **Auth**                          | Required                                                                                                                           |
| **Authorization**                 | Portal membership + QuestionnaireAssignment/resource scope                                                                         |
| **Implementation priority**       | **Critical Editorial Intake / Client Collaboration**                                                                               |
| **Reuse level**                   | **Very High**                                                                                                                      |

The governing invariant is:

> **Master questionnaire changes must never rewrite a questionnaire already assigned or answered by a Client.**

---

# 1. Classification — Functional Responsibility

Design 048 should answer:

> **“Which questionnaire do I need to complete, why is it required, for which Project, which questions are mandatory, what have I already answered, can I save progress, what exactly will be submitted, and has my submission been accepted?”**

Canonical architecture:

```text
QuestionnaireDefinition
        ↓
QuestionnaireVersion
        ↓
QuestionnaireAssignment
        ↓
Client Portal authorization
        ↓
QuestionnaireResponse
        ↓
ResponseRevision / Submission
        ↓
Editorial consumption
```

Design 048 is a structured input workflow.

It is not a generic Notes form.

---

# 2. Definition ≠ Version

A questionnaire such as:

> Executive Profile Interview Questionnaire

is the reusable definition.

Its exact issued form might be:

```text
QuestionnaireVersion
v3
```

The definition can later receive v4.

Previously assigned Clients remain attached to v3.

---

# 3. Questionnaire edits must create controlled version semantics

Dangerous:

```text
QuestionnaireDefinition
├── question 1
├── question 2
└── question 3

Admin edits question 2 directly
↓
Every historical response now appears to answer the new question
```

Correct:

```text
Questionnaire Definition
        ↓
Version 3
        ↓
Assignment A
        ↓
Response A

Questionnaire Definition
        ↓
Version 4
        ↓
future Assignment B
```

Historical meaning remains stable.

---

# 4. Published/assignable version ≠ editable draft

If questionnaire authoring supports internal Drafts:

```text
Questionnaire draft
≠
issued QuestionnaireVersion
```

Once assigned to Clients, the exact version should become stable.

Internal questionnaire authoring itself belongs outside Design 048.

---

# 5. Assignment is first-class

A Client does not merely “open a questionnaire template.”

They receive an assignment.

Conceptually:

```text
QuestionnaireAssignment
├── questionnaireVersionId
├── projectId/context
├── client/account
├── assigned participant(s)
├── assignedBy
├── assignedAt
├── dueAt
├── assignment status
└── submission policy
```

Exact schema belongs to Phase 3D.

---

# 6. Assignment ≠ Client Action

Design 047 may render:

> Complete Executive Questionnaire.

That is a `ClientActionView`.

Its source is:

```text
QuestionnaireAssignment
```

The action projection must not become another questionnaire assignment table.

---

# 7. Assignment ≠ Response

A questionnaire may be assigned without any answer existing yet.

Correct:

```text
Assignment
    ↓
Response created when Client begins/saves
```

Not:

```text
Assignment.status = answers
```

---

# 8. Response ≠ Response Revision

Once the Client starts entering data, the platform needs a canonical response identity.

Conceptually:

```text
QuestionnaireResponse
      ↓
Response revisions / saves
```

This allows:

* draft persistence,
* submission,
* controlled revision,
* historical comparison.

---

# 9. Draft response ≠ submitted response

Permanent distinction:

```text
DRAFT
≠
SUBMITTED
```

The Client saving half-completed answers must not trigger downstream editorial automation as though they formally submitted.

---

# 10. Submitted ≠ accepted

A submission may require internal review.

Example:

```text
SUBMITTED
↓
Editorial review
↓
ACCEPTED
```

or:

```text
NEEDS_CLARIFICATION
```

if supported.

Do not automatically interpret submission as final editorial acceptance.

---

# 11. Accepted ≠ immutable forever necessarily

If editorial staff request clarification:

the response may reopen under controlled semantics.

The platform should preserve:

* original submission,
* requested revision,
* revised submission.

Do not overwrite the original answer history.

---

# 12. Response Revision

Conceptually:

```text
QuestionnaireResponseRevision
├── revision number
├── answers
├── authoredBy
├── savedAt/submittedAt
├── status/context
└── parent revision
```

Exact physical storage can vary.

The audit requires reproducible history.

---

# 13. Autosave ≠ formal revision necessarily

Autosave may update the current Draft safely without generating thousands of business-level revisions.

But formal submission/reopening should preserve meaningful checkpoints.

Phase 3D can decide storage granularity.

---

# 14. Autosave needs concurrency safety

Example:

```text
Client opens questionnaire in laptop.
Client opens same questionnaire on phone.
Both edit.
```

A stale autosave must not silently erase newer answers.

Revision or optimistic concurrency protection is required.

---

# 15. Question identity must be stable

Each question should have a stable identifier within the QuestionnaireVersion.

Do not rely on:

```text
questionIndex = 5
```

as the permanent answer identity.

Questions can be reordered.

---

# 16. Question label ≠ question identity

Changing:

> Tell us about your career.

to:

> Describe your professional journey.

in a new QuestionnaireVersion should not break historical answer lineage.

Stable IDs/version relationships matter.

---

# 17. Question types

Architecture should support the field types actually required by the frozen questionnaire experience, potentially including:

```text
short text
long text
single choice
multi-choice
date
number
file upload
```

Exact set belongs to Phase 3D.

Do not introduce a giant no-code form builder merely because multiple field types exist.

---

# 18. Validation belongs to QuestionnaireVersion

Validation may include:

* required,
* min/max length,
* allowed choices,
* file requirements.

These rules must travel with the assigned QuestionnaireVersion.

Do not fetch current template validation when submitting an older assignment.

---

# 19. Required ≠ unanswered

A required question may have a valid answer such as:

```text
0
false
```

depending on field type.

Validation must distinguish empty from valid falsy values.

---

# 20. Client-side validation ≠ authoritative validation

Frontend validation improves UX.

Backend submission must independently validate:

```text
response
against
assigned QuestionnaireVersion
```

Never trust the browser's `required` flags alone.

---

# 21. Conditional questions

If questionnaires support conditionally visible questions:

```text
Answer A
→ reveal Question B
```

the rule belongs to the QuestionnaireVersion.

Do not hard-code it inside Design 048 components.

---

# 22. Conditional visibility ≠ deleting answers automatically

If a previously answered conditional question becomes hidden after another answer changes:

the system needs explicit policy.

It should not silently destroy the answer without deterministic rules.

Exact behavior Phase 3D.

---

# 23. Progress percentage

If Design 048 shows:

> 65% complete

the definition must be explicit.

Potentially:

```text
answered applicable required/eligible questions
÷
total applicable questions
```

but exact methodology must be governed.

Do not calculate progress from page number alone.

---

# 24. Form page ≠ progress

A multi-step questionnaire may show:

> Step 3 of 5

while completion percentage differs because sections contain different numbers of questions.

Keep:

```text
navigation step
≠
completion progress
```

---

# 25. Response completeness ≠ submission eligibility

A questionnaire can be 100% answered but still fail:

* file validation,
* confirmation,
* other submission constraints.

Submission eligibility should be server-derived.

---

# 26. Section ≠ workflow stage

Questionnaire sections organize questions.

They do not become Project workflow stages.

Example:

```text
About You
Career Journey
Leadership
Future Vision
```

are content sections.

---

# 27. Project linkage

A questionnaire assignment should reference its Project when relevant.

```text
QuestionnaireAssignment
→ Project 123
```

Design 043 can then surface its current status.

---

# 28. One questionnaire can be reused across many Projects

Correct:

```text
QuestionnaireDefinition
        ↓
Version
    ┌───┼────┐
    ↓   ↓    ↓
Assign A B    C
```

Do not duplicate the QuestionnaireDefinition for every Project.

---

# 29. Same Project can have multiple questionnaires

For example:

```text
Executive Interview Questionnaire
Podcast Preparation Questionnaire
Publication Details Questionnaire
```

Architecture should not assume one `project.questionnaireId`.

Use assignments.

---

# 30. Same questionnaire can be assigned to multiple Client members

Depending on product workflow:

* one executive might answer,
* multiple executives may have individual responses,
* one organization response may be shared.

The assignment model must make response ownership explicit.

---

# 31. Shared response vs individual response must be intentional

Do not accidentally allow two Client users to overwrite one response simply because they share a Client account.

If collaborative completion is unsupported, enforce single-response ownership appropriately.

If supported later, collaboration needs explicit semantics.

No collaboration feature is added by this audit.

---

# 32. Client account ≠ respondent

The Client organization is the business context.

The person who actually answered should remain attributable.

This matters editorially and for audit.

---

# 33. Respondent identity

A submitted response should preserve:

```text
submittedBy PortalMembership/User
submittedAt
```

even if that user later loses access.

Historical authorship survives offboarding.

---

# 34. Assignment reassignment

If a questionnaire is moved from one Client member to another:

history should preserve:

* original assignee,
* new assignee,
* reassignment actor/time.

Do not overwrite without trace.

---

# 35. Reassignment ≠ response ownership rewrite automatically

If Person A has already entered answers and assignment moves to Person B:

the workflow needs explicit semantics about whether B:

* continues the existing response,
* starts a new response.

Do not infer this automatically.

---

# 36. Questionnaire access ≠ Project access expansion

A Portal member assigned one questionnaire for Project A does not necessarily gain full Project A access.

Questionnaire assignment can be narrower than Project entitlement.

---

# 37. Project access ≠ questionnaire access automatically

A Portal user who can see Project A should not necessarily see every questionnaire assigned to the CEO.

Questionnaire assignments remain participant/resource scoped.

---

# 38. Design 047 relationship

Design 047 can show:

> Questionnaire required.

Design 048 owns:

* viewing,
* answering,
* saving,
* submitting.

One assignment/source record.

---

# 39. Design 041 consistency

Dashboard `Actions Required` count should include an active questionnaire only through the shared `ClientActionResolver`.

Do not separately count questionnaire assignments in the Dashboard and again as ClientRequests.

---

# 40. Design 042/043 consistency

My Projects or Project Detail may show:

> Questionnaire pending.

Opening it should deep-link to the exact QuestionnaireAssignment handled in Design 048.

---

# 41. Design 044 relationship

Project Timeline can display:

```text
Questionnaire requested
Questionnaire submitted
```

using source lineage to the same assignment/response.

Timeline does not own questionnaire status.

---

# 42. Design 067 relationship

Later frozen:

**Design 067 — Client Questionnaires Library**

Expected architecture:

```text
Canonical Questionnaire Domain
          │
          ├── Design 048
          │   contextual completion workspace
          │
          └── Design 067
              questionnaire collection/library
```

One Definition/Version/Assignment/Response engine.

No screen merge decision now.

---

# 43. Design 024 relationship

Editorial Production may consume completed questionnaire responses.

It must consume an exact response submission/revision.

Correct:

```text
QuestionnaireResponseRevision #3
      ↓
Editorial drafting/source material
```

Not:

```text
latest mutable response
```

---

# 44. AI drafting integration

If AI assists editorial drafting from Client answers:

AI should receive the deliberately selected submitted ResponseRevision.

It must not:

* use half-completed autosave content unintentionally,
* invent missing answers,
* overwrite original Client responses.

Original human answers remain preserved.

---

# 45. Original Client response ≠ AI-derived draft

Permanent provenance rule:

```text
Client Answer
≠
AI summary
≠
Editorial Draft
```

AI-generated text can reference the Client's answers while remaining a separate artifact.

---

# 46. Response answers should remain source evidence

Editors should be able to trace Draft content back to the Client's original submitted response where useful.

This improves editorial integrity.

---

# 47. Attachments

If questionnaire questions support file uploads:

reuse Design 030.

```text
Question Answer
   ↓
Asset/FileVersion reference
```

No questionnaire-specific file storage.

---

# 48. Uploaded file ≠ ready answer

The file may require:

```text
upload
→ storage
→ security scan
→ processing
→ ready
```

Submission should respect required attachment readiness.

---

# 49. Exact FileVersion must be pinned

Historical questionnaire submission must reference the exact uploaded version.

A later replacement must not silently rewrite the old submission.

---

# 50. File deletion/revocation

If a referenced Asset later becomes restricted/deleted under policy:

historical QuestionnaireResponse should still preserve meaningful reference metadata.

Do not make the response structurally corrupt.

---

# 51. Rich text

If long answers allow rich text, sanitize input.

Do not render arbitrary Client-provided HTML directly.

Formatting capabilities should be controlled.

---

# 52. Script injection / content safety

Questionnaire answers are user-generated content.

Every rendered response must protect against:

* HTML injection,
* script injection,
* unsafe embedded content.

This is a backend/frontend security requirement.

---

# 53. Character limits

Where a question has an answer limit:

the backend must validate actual canonical text length according to defined semantics.

Do not rely only on the visible browser counter.

---

# 54. Choice options belong to QuestionnaireVersion

If an issued question asks:

```text
Industry:
Technology
Finance
Healthcare
Other
```

and later the template changes choices, historical response still needs the old option set for interpretation.

---

# 55. Removed option ≠ invalid historical answer

An answer selected under QuestionnaireVersion 3 remains valid historically even if Version 4 removes that choice.

---

# 56. Submission confirmation

If the frozen design includes a final confirmation step:

the Client should know:

* what is being submitted,
* whether future edits are allowed,
* submission time.

No redesign is required; architecture should support controlled submission.

---

# 57. Submit should be idempotent

Double-clicking Submit must not create:

```text
Submission 1
Submission 2
Submission 3
```

for one intended response.

Use idempotency/current-state validation.

---

# 58. Network uncertainty

If Client clicks Submit and network drops:

the UI should be able to determine whether submission succeeded.

Never instruct the Client to submit blindly again and create duplicate records.

---

# 59. Submitted response becomes stable checkpoint

Once formally submitted:

the canonical submitted revision should remain immutable.

Future edits should create:

* reopened Draft,
* new revision,

rather than rewrite the submitted checkpoint.

---

# 60. Reopen

If internal staff requests changes:

conceptually:

```text
Submission v1
        ↓
Revision requested
        ↓
Draft revision v2
        ↓
Resubmission v2
```

Original v1 remains historically available.

---

# 61. Clarification request ≠ rejection necessarily

Editorial staff may request clarification without treating the entire Questionnaire as rejected.

Exact workflow enum belongs to Phase 3D.

Avoid a simplistic:

```text
ACCEPTED / REJECTED
```

if the business workflow needs nuance.

---

# 62. Client comments/communication

If clarification requires messaging:

reuse Design 045 Conversation infrastructure where appropriate.

Do not invent a second messaging system inside Questionnaire responses.

---

# 63. Notification integration

Questionnaire assignment, reminders, reopening and submission acknowledgement can create notifications.

But:

```text
QuestionnaireAssignment
≠
Notification
```

and:

```text
Notification read
≠
Questionnaire completed
```

---

# 64. Reminder logic

Due reminders should use shared scheduling/notification infrastructure.

Do not run Client-side reminder timers in Design 048.

---

# 65. Due date ≠ lifecycle

A Questionnaire can be:

```text
Assignment state:
OPEN

Due condition:
OVERDUE
```

These remain separate.

---

# 66. Date-only/timezone semantics

If due “September 10,” preserve date-only semantics.

If due at a precise time, use canonical timezone handling from Designs 035/040.

---

# 67. Overdue ≠ blocked Project automatically

A questionnaire becoming overdue may affect a Project dependency.

But Project health/blocking should be resolved by the Project workflow/dependency engine.

Design 048 must not directly change Project status from the browser.

---

# 68. Internal workflow dependency

A QuestionnaireAssignment may gate:

```text
Editorial Drafting
```

through explicit workflow dependency.

Correct:

```text
Response accepted
      ↓
dependency satisfied
      ↓
Workflow may advance
```

not:

```text
Questionnaire page
→ PATCH Project stage
```

---

# 69. Completion event

Canonical questionnaire submission/acceptance can emit domain events:

```text
QuestionnaireSubmitted
QuestionnaireAccepted
QuestionnaireRevisionRequested
```

These can feed:

* Client Action Resolver,
* Project dependency engine,
* Notifications,
* Activity,
* Audit.

---

# 70. Activity ≠ questionnaire truth

Design 063 may show:

> Executive Questionnaire submitted.

The source remains QuestionnaireResponse.

---

# 71. Audit integration

Important events can feed Design 039:

```text
QuestionnaireAssigned
QuestionnaireReassigned
QuestionnaireSubmitted
QuestionnaireReopened
QuestionnaireRevisionSubmitted
```

Audit should not copy every answer body indiscriminately.

---

# 72. Sensitive response data

Questionnaire answers can contain:

* personal biography,
* confidential business strategy,
* unreleased information,
* direct quotes.

Access must be tightly permissioned.

---

# 73. Portal visibility

Only intended respondent(s)/authorized Client members should see the full Response.

Do not assume every member of the Client company should access an executive's private questionnaire.

---

# 74. Internal access

Internal Team Workspace access should likewise be permissioned by Project/editorial responsibilities.

Not every employee should automatically browse every Client Questionnaire.

---

# 75. Export permission

If responses can be exported/downloaded:

```text
questionnaire.read
≠
questionnaire.export
```

where appropriate.

Export can increase data-exfiltration risk.

No export feature is introduced unless frozen.

---

# 76. Search privacy

Design 067 later may search Questionnaires.

Search indexes should not expose answer snippets to unauthorized Client/Internal users.

Questionnaire content can be highly sensitive.

---

# 77. Response ownership after member deactivation

If the respondent is deactivated:

their historical submitted response remains.

Do not delete or anonymize it automatically in a way that breaks editorial provenance.

---

# 78. Assignment access revocation

If assignment is withdrawn or Portal membership revoked:

future access stops promptly.

Historical internal records remain.

---

# 79. Assignment cancellation

Cancelled/withdrawn questionnaire should remain distinct from:

```text
COMPLETED
```

because the Client did not satisfy it.

---

# 80. Superseded assignment

A QuestionnaireAssignment can potentially become obsolete if a new version is issued instead.

Example:

```text
Questionnaire v3 assignment
→ superseded

Questionnaire v4 assignment
→ active
```

Do not leave both active in Design 047.

---

# 81. Superseded ≠ deleted

Historical v3 assignment/response remains traceable.

---

# 82. Version migration

Do **not** automatically migrate partially completed answers from v3 to v4 unless the product defines a controlled mapping.

Question IDs, validation, and semantics may have changed.

---

# 83. If migration exists, preserve provenance

Any migrated answer should retain:

```text
source response
source question
target question
migration method
```

But this is advanced architecture, not a requirement to introduce a migration feature now.

---

# 84. Draft autosave

Autosave should:

* debounce safely,
* preserve local user experience,
* validate server authorization,
* handle revisions,
* surface failure.

Never silently tell the Client:

> Saved

before authoritative persistence.

---

# 85. Offline/connection failure

If autosave fails:

the UI should clearly indicate unsaved content.

Do not let the user close the page believing the response is safe.

---

# 86. Save conflict

If the response changed elsewhere:

the system should not overwrite newer answers blindly.

Use response revision/concurrency checks.

---

# 87. Partial file failure

Example:

```text
Text answers     ✓
Attachment #1    ✓
Attachment #2    ✕
```

The questionnaire can preserve text answers while preventing final submission if the failed attachment is required.

---

# 88. Validation error ≠ server outage

Correct states:

```text
Please answer Question 7.
```

versus:

```text
Questionnaire could not be saved right now.
```

Never present infrastructure failure as user validation failure.

---

# 89. State coverage

Design 048 inherits Design 150 plus questionnaire-specific states:

```text
Questionnaires Loading
Questionnaire Available

Not Started
Draft In Progress
Autosaving
Saved
Save Failed

Ready to Submit
Validation Error
Submitting
Submitted

Submitted — Awaiting Review
Accepted
Revision Requested
Reopened
Resubmitted

Assignment Overdue
Assignment Cancelled
Assignment Superseded

Attachment Uploading
Attachment Processing
Attachment Failed

Questionnaire Restricted
Assignment Revoked
Response Conflict

Questionnaire Version Unavailable
Partial Service Failure
```

These are not one giant status enum.

---

# 90. Not started ≠ no assignment

A valid assignment can exist with zero response data.

The UI should not interpret:

```text
response == null
```

as:

> No questionnaire assigned.

---

# 91. No questionnaire ≠ service unavailable

If the query succeeds and no assignment exists:

> No questionnaire currently assigned.

If the service fails:

> Questionnaires are temporarily unavailable.

Distinct states are mandatory.

---

# 92. Draft empty ≠ submission absent

A Client may intentionally open the Questionnaire but answer nothing.

Assignment state and response state should remain independently understandable.

---

# 93. Submitted ≠ Action still required

Once canonical submission is accepted according to action policy, Design 047 should stop treating it as active.

If revision is requested, the action can become active again through source state.

---

# 94. Permission architecture

Potential Phase 3D Client capabilities:

```text
portal.questionnaires.read
portal.questionnaires.respond
portal.questionnaires.submit
portal.questionnaires.view_history
```

Exact names later.

Internal capabilities might include:

```text
questionnaires.assign
questionnaires.review
questionnaires.request_revision
```

But internal and Client authorization remain separate.

---

# 95. Read ≠ respond

A Client executive assistant may potentially see that a questionnaire exists but not be authorized to answer on behalf of the executive.

```text
read
≠
respond
```

---

# 96. Respond ≠ submit

If collaborative or delegated drafting is supported later:

someone may contribute Draft content while only an authorized respondent formally submits.

The architecture should not force these concepts together.

No collaboration UI is added here.

---

# 97. Submit ≠ reopen

A Client should not arbitrarily reopen a formally accepted questionnaire unless workflow explicitly permits it.

Reopening is a separate controlled action.

---

# 98. Backend query model

Conceptually:

```text
ClientQuestionnaireView
├── assignment
├── questionnaire version
├── sections/questions
├── validation rules
├── current Draft/Response revision
├── progress
├── due condition
├── attachment references
├── submission eligibility
├── response history if permitted
└── available actions
```

This is a composed read model.

---

# 99. Avoid sending master Definition for rendering

Dangerous:

```text
GET current QuestionnaireDefinition
+
GET Client Response
```

because the definition may have changed after assignment.

Correct:

```text
QuestionnaireAssignment
     ↓
exact QuestionnaireVersion
     ↓
Response
```

---

# 100. Mutation architecture

Avoid:

```text
PATCH /client/questionnaire
{
  answers,
  submitted,
  accepted,
  projectStage
}
```

Prefer explicit commands:

```text
saveQuestionnaireDraft()
submitQuestionnaireResponse()
```

Internal commands:

```text
assignQuestionnaire()
requestQuestionnaireRevision()
acceptQuestionnaireResponse()
```

Each command validates actor + assignment + version + current response revision.

---

# 101. Backend architecture

```text
Design 048
    ↓
ClientPortalSessionContext
    ↓
Questionnaire Authorization
    ↓
QuestionnaireAssignmentQuery
    ↓
exact QuestionnaireVersion
    ↓
QuestionnaireResponseService
    │
    ├── Draft persistence
    ├── Validation
    ├── Response revisions
    ├── Attachments
    └── Submission
    ↓
Domain Events
    ├── ClientActionResolver
    ├── Editorial Workflow
    ├── Notifications
    ├── Activity
    └── Audit
```

---

# 102. Backend requirements

| Requirement                                         | Status                                             |
| --------------------------------------------------- | -------------------------------------------------- |
| Client Portal authentication                        | **Critical**                                       |
| Active Portal membership                            | **Critical**                                       |
| Questionnaire-level authorization                   | **Critical**                                       |
| Canonical QuestionnaireDefinition                   | **Critical**                                       |
| Immutable/versioned QuestionnaireVersion            | **Critical**                                       |
| QuestionnaireAssignment                             | **Critical**                                       |
| Assignment participant targeting                    | **Critical**                                       |
| QuestionnaireResponse                               | **Critical**                                       |
| Response revision/history                           | **Critical**                                       |
| Stable Question IDs                                 | **Critical**                                       |
| Version-bound validation                            | **Critical**                                       |
| Draft vs submitted distinction                      | **Critical**                                       |
| Submitted vs accepted distinction                   | **Critical**                                       |
| Reopen/revision workflow                            | **Required**                                       |
| Autosave                                            | **Required if frozen UI uses it**                  |
| Optimistic concurrency                              | **Critical**                                       |
| Progress calculation                                | **Required**                                       |
| Conditional-question rule engine                    | **Required only if questionnaire uses conditions** |
| Asset/FileVersion attachment integration            | **Critical where uploads exist**                   |
| Security scan before required attachment acceptance | **Critical**                                       |
| Exact attachment version                            | **Critical**                                       |
| Project relationship                                | **Critical**                                       |
| Client Action Resolver integration                  | **Critical**                                       |
| Editorial workflow integration                      | **Critical**                                       |
| Domain-event emission                               | **Required**                                       |
| Notification integration                            | **Required**                                       |
| Audit integration                                   | **Required**                                       |
| Historical respondent attribution                   | **Critical**                                       |
| Sensitive-response access controls                  | **Critical**                                       |
| XSS/content sanitization                            | **Critical**                                       |
| Idempotent submission                               | **Critical**                                       |
| Partial failure support                             | **Critical**                                       |
| Design 067 infrastructure reuse                     | **Critical architecture**                          |

---

# 103. Responsive Behavior — Desktop

Desktop should preserve the complete structured completion experience:

```text
Questionnaire Header
↓
Project / Assignment Context
↓
Progress + Due State
↓
Sections / Navigation
↓
Questions
    ├── prompt
    ├── instructions
    ├── answer control
    ├── validation
    └── attachment if required
↓
Save / Submission State
↓
Submit
```

The goal is focused completion, not internal editorial complexity.

---

# 104. Responsive — Tablet

Following Design 152:

* section navigation can collapse,
* questions remain comfortably readable,
* long-answer fields stay sufficiently large,
* progress remains visible,
* attachment/upload state remains clear,
* Save/Submit remains reachable.

---

# 105. Responsive — Mobile

Priority:

```text
Questionnaire
↓
Project / Due Date
↓
Progress
↓
Current Section
↓
Question
↓
Answer
↓
Validation
↓
Next Question / Section
↓
Save State
↓
Final Review / Submit
```

Do not squeeze desktop two-column question layouts onto narrow screens.

---

# 106. Mobile long-form responses

Long text answers must provide enough vertical space for meaningful writing.

Avoid tiny single-line fields for executive interview responses.

---

# 107. Mobile autosave visibility

The Client should be able to tell:

```text
Saving…
Saved
Save failed
```

without losing focus or having a giant blocking notification after every answer.

---

# 108. Accessibility

Every question requires:

* programmatic label,
* instructions,
* required/optional state,
* associated validation,
* accessible progress.

Do not communicate required questions only with a red asterisk.

Choice groups need correct semantic grouping.

---

# 109. Keyboard/navigation safety

The Questionnaire should support logical tab order.

Do not automatically submit or move to the next question on unexpected Enter behavior in long-form fields.

---

# 110. Main Implementation Risks

Design 048 exposes several major risks.

**Definition/version conflation**
Editing master Questionnaire rewrites active/historical Client assignments.

**Assignment/response conflation**
No distinction between “requested” and “answered.”

**Response/revision conflation**
Submitted answers are silently overwritten later.

**Draft/submitted conflation**
Autosaved partial content enters editorial workflow.

**Submitted/accepted conflation**
Client submission prematurely advances Project workflow.

**Question label/identity conflation**
Reordering questions disconnects historical answers.

**Current-template validation bug**
Old assignment is validated against newer questionnaire rules.

**Required/falsy-value bug**
Valid `0` or `false` answers treated as unanswered.

**Conditional-visibility data loss**
Hidden conditional answers are destroyed unexpectedly.

**Form-step/progress conflation**
Page 3 of 5 rendered as 60% complete regardless of actual answer state.

**Questionnaire/ClientAction conflation**
Generic action table duplicates assignment state.

**Questionnaire/ClientRequest duplication**
A questionnaire is represented simultaneously as assignment and generic request without source lineage.

**Project/questionnaire permission conflation**
Any Project viewer sees private executive responses.

**Client account/respondent conflation**
Every Client user can modify another person's questionnaire.

**Reassignment/response-ownership conflation**
Changing assignee silently changes who authored existing answers.

**Questionnaire/AI draft conflation**
AI-generated editorial text replaces original Client answers.

**Latest-response bug**
Editorial consumes mutable current Draft instead of exact submitted revision.

**Attachment/file conflation**
Uploaded files stored outside canonical Asset system.

**Uploaded/ready conflation**
Unsafe file accepted before scanning.

**Latest-file bug**
Historical response attachment changes when Asset receives new version.

**Autosave concurrency loss**
Laptop/phone sessions overwrite each other.

**Save-state dishonesty**
UI says Saved before server persistence.

**Submit duplication**
Network retry creates multiple submissions.

**Cancelled/completed conflation**
Withdrawn questionnaire appears fulfilled.

**Superseded/current conflation**
Old questionnaire assignment remains active beside new version.

**Due/lifecycle conflation**
Overdue is stored as questionnaire status.

**Overdue/Project-blocked conflation**
Frontend changes Project status because Questionnaire is late.

**Notification/completion conflation**
Reading reminder marks questionnaire complete.

**Activity/questionnaire conflation**
Activity event becomes response source.

**048/067 duplicate Questionnaire engines**
Library gets a second assignment/response backend.

No additional design is required.

These are **versioning, submission, provenance, security, workflow, and form-engine requirements**.

# Design 048 Audit Verdict

## **PASS — VERSIONED CLIENT QUESTIONNAIRE & STRUCTURED RESPONSE ANCHOR**

**Domain directive:** **QuestionnaireDefinition ≠ QuestionnaireVersion ≠ QuestionnaireAssignment ≠ QuestionnaireResponse ≠ ResponseRevision ≠ ClientAction.**

**Definition directive:** QuestionnaireDefinition is the reusable master identity; every issued Client questionnaire references an exact stable QuestionnaireVersion.

**Version directive:** editing a master Questionnaire creates controlled new-version semantics and never rewrites active or historical assignments/responses.

**Assignment directive:** QuestionnaireAssignment explicitly records which version, Project/account context and Client participant received the questionnaire.

**Response directive:** a response has its own canonical identity and meaningful revision/submission history; autosaved Draft content and submitted content remain distinct.

**Submission directive:** saved Draft ≠ submitted ≠ internally accepted. Each transition has explicit business semantics.

**Revision directive:** formal submitted checkpoints remain historically stable; requested corrections create new revisions/reopened Drafts rather than rewriting prior submissions.

**Question directive:** questions use stable IDs within their assigned version, so labels/order can evolve without corrupting historical answer lineage.

**Validation directive:** the backend validates responses against the exact QuestionnaireVersion assigned to that Client—not against the current master template.

**Progress directive:** Questionnaire progress is derived from applicable answer completeness and is not mechanically equated with page/section position.

**Client Action directive:** Designs 041–047 surface questionnaire obligations through the shared `ClientActionResolver`; Design 048 remains the source workflow.

**Project directive:** Questionnaire completion can satisfy explicit Project dependencies but the Questionnaire screen never directly patches Project workflow state.

**Editorial directive:** internal editorial/AI workflows consume an exact submitted ResponseRevision, preserving the original Client response separately from AI summaries and Drafts.

**Asset directive:** file-based answers reuse Design 030's Asset/FileVersion + security processing infrastructure and pin exact historical versions.

**Identity directive:** Client account, assignment recipient and actual respondent remain separately attributable.

**Security directive:** Project visibility alone does not grant access to sensitive Questionnaire responses; Questionnaire assignments and response permissions remain participant/resource scoped.

**Autosave directive:** Draft saving is server-authoritative, concurrency-safe and must visibly distinguish saved, saving and failed states.

**Idempotency directive:** formal submission is replay-safe and current-state validated so network retry cannot generate duplicate submissions.

**Notification directive:** assignment/reminder notifications derive from questionnaire state but never become completion truth.

**Audit directive:** assignment, submission, revision and acceptance events use Design 039's canonical Audit infrastructure without indiscriminately duplicating sensitive answer bodies.

**Responsive directive:** desktop supports structured long-form completion; mobile becomes section → question → answer → save → submission flow without compressing desktop layouts.

**Overlap directive:** Designs **024, 041–048 and 067** must use one canonical Questionnaire Definition + Version + Assignment + Response + Revision + validation infrastructure.

**Consolidation directive:** **STANDARDIZE ONE VERSIONED QUESTIONNAIRE ENGINE WITH EXACT ASSIGNMENT VERSIONING + RESPONSE REVISION + VALIDATION + AUTOSAVE + SUBMISSION + ASSET ATTACHMENT + CLIENT-ACTION/EDITORIAL INTEGRATION — DO NOT BUILD SEPARATE QUESTIONNAIRE BACKENDS FOR PROJECTS, CLIENT PORTAL, EDITORIAL OR THE LATER QUESTIONNAIRE LIBRARY.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **48 / 153** |
| **PASS**                                   |                         **48** |
| **STANDARDIZE decisions**                  |                         **46** |
| **Potential implementation-overlap flags** |                         **39** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**48 / 153 = 31.4% audited.**

### Canonical questionnaire architecture after Design 048

```text
             QUESTIONNAIRE DEFINITION
                       │
                       ↓
              QUESTIONNAIRE VERSION
                       │
                       ↓
             QUESTIONNAIRE ASSIGNMENT
                       │
             ┌─────────┴──────────┐
             ↓                    ↓
       Client Action 047     Client Project 043
             │
             ↓
     DESIGN 048 QUESTIONNAIRE
             │
             ↓
       RESPONSE / DRAFT
             │
             ↓
      SUBMITTED REVISION
             │
       ┌─────┼──────────┐
       ↓     ↓          ↓
   Editorial Project  Activity  Audit
       024                         039
```

The critical evidence chain is now:

```text
QuestionnaireVersion
        ↓
QuestionnaireAssignment
        ↓
QuestionnaireResponse
        ↓
Submitted ResponseRevision
        ↓
Editorial / AI-assisted Draft
```

The **original Client answer always remains preserved independently from the derived editorial output.**

# Next Sequential Audit Target

## **Design 049 — Client Draft Review**

Its frozen identity is already locked.

The next audit must preserve another core version-control boundary:

> **Draft ≠ DraftVersion ≠ Review ≠ ReviewComment ≠ ApprovalRequest ≠ ApprovalDecision.**

After Design 049 we continue strictly:

**050 Client Design Review → 051 Client Files & Assets → 052 Client Approvals → 053 Client Contracts → 054 Client Invoices & Payments → 055 Client Publishing & Distribution → 056 Client Reports & Downloads → … → 077 Client Access Recovery**

with the unchanged audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**

