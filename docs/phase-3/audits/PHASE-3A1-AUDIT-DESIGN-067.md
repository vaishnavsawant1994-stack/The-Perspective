# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 067 — Client Questionnaires Library

Its frozen identity and supplied route annotation **`/client/questionnaires`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 067 should become the **canonical Client Portal cross-Project questionnaire discovery/library surface** for Questionnaire Assignments that the current Portal member is authorized to see or act on.

Its governing boundary is:

> **QuestionnaireDefinition ≠ QuestionnaireVersion ≠ QuestionnaireAssignment ≠ QuestionnaireResponse ≠ ResponseRevision ≠ LibraryEntry/Projection ≠ ClientAction ≠ Project.**

The central implementation rule is:

> **Design 067 does not create another Questionnaire system. It indexes and projects the exact QuestionnaireAssignments already governed by Design 048, across authorized Projects and Client contexts, while preserving each Assignment’s pinned QuestionnaireVersion, recipient, due state, Response/Revision history, and current obligation.**

---

# 1. Classification

| Audit field                         | Classification                                                                                                                                                 |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                       | **067**                                                                                                                                                        |
| **Canonical name**                  | **Client Questionnaires Library**                                                                                                                              |
| **Product area**                    | Client Portal / Questionnaires / Client Input                                                                                                                  |
| **User surface**                    | **Client Portal**                                                                                                                                              |
| **Screen class**                    | Cross-Project Questionnaire Assignment Library / Discovery Workspace                                                                                           |
| **Classification**                  | **Portal Collection Variant — Client Questionnaire Assignment Library Family**                                                                                 |
| **Primary purpose**                 | Let authorized Client users discover questionnaires across Projects, understand current completion/submission state, and open the exact assigned questionnaire |
| **Canonical workflow foundation**   | Design 048 — Client Questionnaires                                                                                                                             |
| **Reusable master entity**          | **QuestionnaireDefinition**                                                                                                                                    |
| **Immutable assigned schema**       | **QuestionnaireVersion**                                                                                                                                       |
| **Primary library business entity** | **QuestionnaireAssignment**                                                                                                                                    |
| **Answer container**                | **QuestionnaireResponse**                                                                                                                                      |
| **Historical submission entity**    | **QuestionnaireResponseRevision / ResponseRevision**                                                                                                           |
| **Library projection**              | **ClientQuestionnaireLibraryEntry**                                                                                                                            |
| **Project dependency**              | Designs 023 / 042 / 043                                                                                                                                        |
| **Media Project dependency**        | Designs 065 / 066                                                                                                                                              |
| **Client Action dependency**        | Design 047                                                                                                                                                     |
| **Editorial dependency**            | Design 024                                                                                                                                                     |
| **Asset dependency**                | Design 030 where questionnaire attachments are supported                                                                                                       |
| **Notification dependency**         | Designs 061 / 064                                                                                                                                              |
| **Activity dependency**             | Design 063                                                                                                                                                     |
| **Parent shell**                    | `ClientPortalShell` — Design 002                                                                                                                               |
| **Primary read model**              | `ClientQuestionnairesLibraryView`                                                                                                                              |
| **Template family**                 | `ClientQuestionnaireLibraryTemplate`                                                                                                                           |
| **Auth**                            | Required                                                                                                                                                       |
| **Authorization**                   | Active Portal membership + QuestionnaireAssignment entitlement/respondent policy + Project/context visibility                                                  |
| **Implementation priority**         | **Critical Client Input / Editorial Dependency / Workflow Completion**                                                                                         |
| **Reuse level**                     | **Extremely High with Design 048**                                                                                                                             |

Design 067 should answer:

> **“Which questionnaires are assigned within the Projects I am permitted to access, which exact questionnaire version applies to each assignment, what is its current response/submission state, what is due or overdue, which ones require something from me, and which assignment should I open?”**

Canonical architecture:

```text
QuestionnaireDefinition
        │
        ↓
QuestionnaireVersion
        │
        ↓
QuestionnaireAssignment
        │
        ├── Client / Project context
        ├── recipient/respondent
        ├── due date
        └── assignment policy
                │
                ↓
        QuestionnaireResponse
                │
                ↓
          ResponseRevision(s)

                │
                ↓
Client-safe Library Projection
                │
                ↓
ClientQuestionnaireLibraryEntry[]
                │
                ↓
             Design 067
```

---

# 2. Reuse

## Design 048 remains the canonical Questionnaire workflow

Design 048 already established the complete Questionnaire boundary:

> **QuestionnaireDefinition ≠ QuestionnaireVersion ≠ QuestionnaireAssignment ≠ QuestionnaireResponse ≠ QuestionnaireResponseRevision ≠ ClientAction.**

Design 067 must reuse it directly.

Do **not** create:

```text
ClientQuestionnaire
PortalQuestionnaire
QuestionnaireLibraryItem
```

as independently mutable business entities.

Correct:

```text
Canonical Questionnaire Domain — Design 048
                    │
          ┌─────────┴─────────┐
          ↓                   ↓
Completion Workspace     Cross-Project Library
Design 048               Design 067
```

---

## Design 067 should be Assignment-centric

For the Client Portal, the important item is generally not:

> “Here is Questionnaire Definition X.”

It is:

> “You have Assignment QA-402, based on QuestionnaireVersion QV-7, for Project P-102.”

Therefore the library entry should normally key from:

```text
QuestionnaireAssignment
```

rather than only from:

```text
QuestionnaireDefinition
```

---

## Reusable Definition ≠ Project-specific Assignment

The same master questionnaire can be reused:

```text
QuestionnaireDefinition
“Executive Interview Questionnaire”
        │
        ├── Assignment A → Project 101
        ├── Assignment B → Project 205
        └── Assignment C → Project 370
```

These are three separate business assignments even if they use the same Definition.

---

## Reuse exact QuestionnaireVersion

Each Assignment pins the exact QuestionnaireVersion issued at assignment time.

Correct:

```text
Assignment QA-101
→ QuestionnaireVersion QV-4
```

Not:

```text
Assignment QA-101
→ QuestionnaireDefinition
→ load latest version
```

If Definition later has QV-5, QA-101 remains on QV-4 unless a governed reassignment/supersession process explicitly changes it.

---

## Design 067 ≠ Design 048

### Design 048

Focused Questionnaire completion experience.

### Design 067

Cross-Project Questionnaire discovery/library.

Expected relationship:

```text
Design 067
Questionnaire Library
      ↓
QuestionnaireAssignment QA-101
      ↓
Design 048
Complete / Review that exact Assignment
```

One backend.

Different screen purpose.

---

## Design 067 should reconcile with Design 043

Design 043 can show:

> Questionnaire required for this Project.

Design 067 can show the same Assignment across the account.

Both must reconcile on:

* Assignment ID,
* exact QuestionnaireVersion,
* due date,
* response state,
* Client action state.

---

## Design 066 relationship

Design 066 may show the Questionnaire associated with a media Project.

Design 067 provides broader cross-Project discovery.

Correct:

```text
QuestionnaireAssignment QA-202
      │
      ├── appears in Design 066 Project detail
      └── appears in Design 067 Library
```

Same Assignment.

---

## Design 047 relationship

A QuestionnaireAssignment can produce a Client action when the current user genuinely needs to:

* start,
* continue,
* submit,
* revise,

according to canonical workflow.

But the ClientAction is a **projection**.

Correct:

```text
QuestionnaireAssignment
        ↓
Questionnaire source state
        ↓
ClientActionResolver
        ↓
ClientActionView
```

Not:

```text
ClientAction
→ questionnaire status source
```

---

## Design 041 dashboard consistency

If Design 041 says:

> 2 questionnaires need attention

and Design 067 is filtered to:

> Needs action

the definitions must reconcile.

No independent dashboard counting logic.

---

## Reuse Asset/FileVersion for attachments

If Questionnaire responses support image/file attachments:

```text
QuestionnaireResponse
      ↓
Asset / FileVersion
```

continues to use Design 030.

No questionnaire-specific file storage.

---

# 3. Entities

## QuestionnaireDefinition

`QuestionnaireDefinition` is the reusable conceptual questionnaire.

It may define:

* purpose,
* stable questionnaire identity,
* version lineage.

It is **not** what the Client directly submits answers against once an Assignment has been issued.

---

## QuestionnaireVersion

`QuestionnaireVersion` represents an immutable/schema-stable version.

Conceptually:

```text
QuestionnaireVersion
├── definitionId
├── version number / identity
├── questions
├── sections
├── validation rules
├── conditional logic
└── publication/effective metadata
```

Once assigned:

> the Assignment must retain this exact version.

---

## Definition edits never rewrite existing Assignments

Example:

```text
QV-3 assigned to Client A
QV-4 created next week
```

Client A's historical/active QA remains QV-3 unless explicitly superseded.

---

## QuestionnaireAssignment is first-class

Conceptually:

```text
QuestionnaireAssignment
├── assignmentId
├── questionnaireVersionId
├── Client/account
├── Project/context
├── intended respondent(s)
├── assignedAt
├── dueAt
├── assignment policy
├── lifecycle state
└── supersession/cancellation lineage
```

Exact schema belongs to Phase 3D.

---

## Assignment ≠ Response

An Assignment can exist before the Client has begun answering.

Correct:

```text
QuestionnaireAssignment
        ↓
maybe no Response yet
```

Therefore do not require a Response row simply to list the Questionnaire in Design 067.

---

## No Response ≠ missing Assignment

Library item can legitimately show:

> Not started.

The Assignment still exists.

---

## QuestionnaireResponse

A Response is the working answer container tied to:

* exact Assignment,
* respondent/context.

Do not attach free-floating Responses directly to QuestionnaireDefinition.

---

## Response ≠ ResponseRevision

A Response may have multiple meaningful checkpoints/revisions.

Conceptually:

```text
QuestionnaireResponse
├── current draft state
└── ResponseRevision 1 — submitted
    ResponseRevision 2 — resubmitted
```

Exact implementation may distinguish drafts/checkpoints differently.

---

## Draft response ≠ submitted response

Permanent:

```text
AUTOSAVED DRAFT
≠
SUBMITTED
```

A user entering 100% of answers is not sufficient evidence of submission.

---

## Submitted ≠ accepted

Design 048 already established:

```text
Submitted
        ↓
review/validation
        ↓
Accepted
```

if review/acceptance exists.

Do not label every submitted response:

> Complete

if the downstream workflow still requires acceptance.

---

## Accepted ≠ Project completed

A Questionnaire is one Project dependency.

Its acceptance must not automatically complete the Project.

---

## Revision requested ≠ rejected permanently

If the Client is asked to change one response:

```text
REVISION_REQUESTED
```

does not mean the entire questionnaire is invalid forever.

---

## Reopened ≠ new Assignment necessarily

A submitted Assignment can be reopened under governed rules.

The original submission history remains.

---

## Resubmission creates historical evidence

If an accepted/revision flow uses new ResponseRevision:

```text
Revision 1
submitted Aug 10

Revision 2
resubmitted Aug 12
```

do not overwrite Revision 1.

---

## Assignment lifecycle ≠ due condition

Important:

```text
Assignment:
IN_PROGRESS

Due condition:
OVERDUE
```

can coexist.

Overdue is time-based.

It is not a substitute for workflow status.

---

## Overdue ≠ cancelled

Passing due date does not automatically cancel the Assignment.

---

## Overdue ≠ unsubmitted exclusively

Depending on policy, a submitted-but-awaiting correction Assignment can also have overdue-related semantics.

Exact rules belong to Phase 3D.

---

## Due date ≠ Project due date

QuestionnaireAssignment owns its own due context.

Changing Questionnaire due date should not silently change Project completion date.

---

## Assignment ≠ Project

One Project may have:

```text
QuestionnaireAssignment A
QuestionnaireAssignment B
QuestionnaireAssignment C
```

and one QuestionnaireDefinition may be used across many Projects.

No `project.questionnaireId` singular assumption.

---

## Project ≠ access authority automatically

A user with Project visibility is not necessarily the intended respondent.

Design 067 needs Questionnaire-specific authorization.

---

## Account ≠ respondent

Design 048 already established this.

The Client organization may have several Portal users.

A Questionnaire can be assigned to:

* one member,
* multiple permitted respondents,
* a role/group according to explicit policy.

Do not assume every account member can answer.

---

## Viewer ≠ respondent

A Client administrator may be able to view assignment status but not modify the Response, depending on policy.

---

## Respondent ≠ submitter necessarily

Where collaboration exists, several participants might edit while only an authorized participant can submit.

Do not infer submit authority from read/edit automatically.

Exact collaboration policy Phase 3D.

---

## LibraryEntry ≠ QuestionnaireAssignment

`ClientQuestionnaireLibraryEntry` is a safe presentation/read model.

Conceptually:

```text
ClientQuestionnaireLibraryEntry
├── assignmentId
├── questionnaire title
├── exact version
├── Project/context
├── assigned date
├── due date
├── response state
├── progress summary
├── current-user action
└── updatedAt
```

It does not own any of these states independently.

---

## LibraryEntry should reference Assignment ID

Opening a Library item should navigate using the canonical Assignment identity/context.

Do not identify the Assignment using:

* Questionnaire title,
* Project name,
* Definition ID alone.

---

## Multiple Assignments using same Definition must remain separate entries

Example:

```text
Executive Interview Questionnaire
├── Project A — Submitted
└── Project B — Not Started
```

One cannot be collapsed into the other just because Definition matches.

---

## Same Assignment should not appear twice because response has revisions

ResponseRevision history belongs inside Assignment detail/history.

Library should not create a separate card for each Revision unless the frozen design explicitly does so.

---

## Current state ≠ latest revision number alone

Example:

```text
Revision 2 submitted
Review requests revision
```

Current Assignment state may be:

> Revision requested

even though latest stored Revision is submitted.

Use canonical workflow state.

---

## Progress methodology must be explicit

Questionnaire progress should not be decorative.

Possible canonical calculation could consider:

```text
required visible questions answered
/
required visible questions
```

or a governed step model.

Exact methodology Phase 3D.

---

## Progress ≠ submission eligibility

A questionnaire can display:

> 100% answered

while still failing:

* validation,
* required attachment,
* declaration/consent,
* required final submit action.

Therefore:

```text
100% answered
≠
Submitted
```

---

## Conditional questions

If Q5 appears only when Q3 = Yes:

progress and validation must use the assigned QuestionnaireVersion's conditional rules.

Frontend cannot invent its own completion formula.

---

## Hidden conditional answers

When a question becomes hidden after an answer change:

do not silently destroy the previous answer unless policy explicitly defines it.

This matters when the response is reopened.

---

## Stable Question IDs

Question order/label are not identity.

Question-level answer persistence should key to stable Question IDs within the exact QuestionnaireVersion.

---

## Autosave ≠ business revision

Autosaving every keystroke does not necessarily create a formal ResponseRevision.

Operational draft persistence and meaningful submission revision are separate.

---

## Library updated timestamp

If shown, define whether it means:

* Assignment updated,
* Response draft saved,
* submission made,
* review changed.

Do not use one vague `updatedAt` without consistent meaning.

---

## Accepted response should preserve exact Revision

Downstream Editorial consumption should reference:

```text
accepted ResponseRevision
```

not whichever mutable draft happens to be current later.

---

## Editorial AI transformation ≠ Client Response

Design 024 may use the accepted answers to generate:

* AI summary,
* editorial Draft,
* article.

Permanent:

```text
Client Answer
≠
AI Summary
≠
Editorial Draft
```

Design 067 must preserve access to the actual questionnaire status, not derived editorial content.

---

## Questionnaire attachment ≠ Answer text

Attachments reference exact Asset/FileVersion.

Do not embed binary storage in response JSON.

---

## Attachment uploaded ≠ response submitted

A user attaching images does not complete the Questionnaire.

---

## ClientAction ≠ QuestionnaireAssignment

A ClientAction may be generated for the Assignment.

But:

```text
ClientAction dismissed/read/completed projection
```

must never be the authoritative Questionnaire workflow state.

---

## Notification ≠ Questionnaire action

Design 064 can notify:

> Questionnaire due tomorrow.

Reading/dismissing it does not alter Assignment.

---

## Activity ≠ Questionnaire status

Design 063 may show:

> Questionnaire submitted.

It derives from the canonical submission event.

---

# 4. Permissions

Authorization should evaluate:

```text
Portal membership
+
Client/account scope
+
QuestionnaireAssignment visibility
+
respondent/participant policy
+
Project/resource context
```

---

## Same Client ≠ same Questionnaire library

Two users in the same Client organization can legitimately see different Assignments.

Example:

```text
CEO
→ Executive Questionnaire

Marketing Director
→ Media Assets Questionnaire

Finance Contact
→ neither
```

Design 067 must be membership-specific.

---

## Project access ≠ Questionnaire response authority

A user may access Project P-101 without being permitted to edit QA-101.

---

## Questionnaire read ≠ edit

Potential capabilities:

```text
questionnaire.read
questionnaire.respond
questionnaire.submit
```

can remain distinct where product policy requires.

Exact names Phase 3D.

---

## Edit ≠ submit

Collaborative editing or review scenarios may permit editing without final submit authority.

Do not hard-code them together.

---

## Submit ≠ accept

Acceptance remains internal/reviewer workflow where applicable.

A Client cannot mark their own response accepted merely because they can submit it.

---

## Organization admin ≠ automatic respondent

Design 062 Portal administrator should not automatically answer every user's questionnaires.

Administration capability and respondent assignment remain separate.

---

## Library counts must use same authorization

If header says:

> 4 Questionnaires

that count must reflect the current member's authorized Library scope.

Do not count all Client account assignments and then hide entries.

---

## Client Action authorization

A Library entry should show:

> Continue

or:

> Submit

only if this current Portal member can actually perform the action.

---

## Assigned to another Client user

If policy allows shared status viewing but not editing:

the Library may show a safe state such as:

> Assigned to another team member

without exposing sensitive answers.

Exact presentation depends on frozen design.

---

## Response content is more sensitive than Assignment metadata

A user may potentially know:

> Executive Questionnaire exists

without being allowed to see all answers.

Assignment-list authorization and Response-content authorization can differ.

---

## No answer snippets by default

Design 067 is primarily discovery.

Avoid returning response contents/snippets unless the frozen design explicitly needs them and authorization permits them.

This reduces sensitive data exposure.

---

## Attachments need independent authorization

Knowing Assignment ID does not grant FileVersion access automatically.

Reuse Design 030 security.

---

## Direct Assignment ID reauthorization

Opening:

```text
QA-101
```

must validate the current user again.

A Library result is never an authorization token.

---

## Direct Response ID reauthorization

Same for Response/Revision IDs.

---

## Search authorization

Search over Questionnaire:

* title,
* Project,
* status,

must operate within already-authorized Assignment scope.

Do not leak hidden Project/questionnaire names.

---

## Cross-tenant protection

Every Assignment's:

* Client/account,
* Project,
* QuestionnaireVersion,

must be validated server-side.

A malicious user cannot substitute IDs from another Client.

---

## Definition visibility

A Client Assignment does not grant access to:

* internal template authoring,
* unused questions in another Version,
* template change history,

unless intentionally Client-visible.

---

# 5. States

Design 067 should keep query state, Assignment lifecycle, Response state, due condition, save state, and Client action separate.

### Library/query state

```text
Questionnaires Loading
Questionnaires Available
No Questionnaires
No Results for Filters
Loading More
Load More Failed
```

### Assignment/response state

Conceptually:

```text
Not Started
Draft / In Progress
Ready to Submit
Submitted
Awaiting Review
Accepted
Revision Requested
Reopened
Resubmitted
Cancelled
Superseded
```

Exact enum remains Phase 3D.

### Due condition

```text
No Due Date
Due Later
Due Soon
Due Today
Overdue
```

### Current-user action

```text
No Action
Start
Continue
Submit
Revise
Awaiting Other Party
Restricted
Action State Unavailable
```

### Draft persistence

```text
Saved
Autosaving
Save Failed
Conflict / Updated Elsewhere
```

These must not become one `questionnaire.status`.

---

## Not Started ≠ no Response error

No Response row yet is a valid state.

---

## Draft ≠ Submitted

Permanent.

---

## Ready to Submit ≠ Submitted

Permanent.

---

## Submitted ≠ Accepted

Permanent.

---

## Accepted ≠ Project complete

Permanent.

---

## Revision Requested ≠ Rejected

Permanent.

---

## Reopened ≠ new Questionnaire automatically

Preserve Assignment lineage.

---

## Resubmitted ≠ Accepted

It can await another review cycle.

---

## Overdue ≠ Incomplete lifecycle

Due condition overlays lifecycle.

---

## Submitted after due date

Potentially:

```text
Lifecycle: Submitted
Due condition: Submitted late / was overdue
```

depending on reporting policy.

Do not rewrite submission state to Overdue.

---

## Superseded ≠ Cancelled

A newer Assignment/Version replacing the old one is different from cancellation.

---

## Cancelled ≠ deleted

Historical Assignment can remain visible according to policy.

---

## No Questionnaires ≠ questionnaire service unavailable

Never show:

> No questionnaires

during a backend failure.

---

## Action resolver unavailable ≠ no action

Critical:

```text
Action state unavailable
≠
No action required
```

---

## Response service unavailable ≠ Not Started

If Assignment loads but Response lookup fails:

do not infer the Client has not started it.

---

## Project unavailable ≠ Questionnaire unavailable

A Library item can potentially remain accessible with reduced Project metadata if Questionnaire access is independently valid.

Policy decides.

---

## Autosave failed ≠ submission failed

Separate persistence operations.

---

## Submission uncertainty

If submit request times out:

the Client must be able to reconcile whether submission actually succeeded before retrying.

Use idempotent submission semantics.

---

## Conflict

Two authorized sessions can edit the same draft.

The backend needs concurrency/version checks to prevent silent answer overwrite.

---

## State Coverage

Design 067 inherits Design 150 plus:

```text
Questionnaire Library Loading
Questionnaire Library Available

No Questionnaires
No Results for Filters

Assignment Not Started
Assignment In Progress
Assignment Ready to Submit
Assignment Submitted
Assignment Awaiting Review
Assignment Accepted
Revision Requested
Assignment Reopened
Assignment Resubmitted
Assignment Cancelled
Assignment Superseded

Due Soon
Overdue

Response State Loading
Response State Unavailable

Current User Can Start
Current User Can Continue
Current User Can Submit
Current User Must Revise
Waiting on Review
Assigned to Another Participant
Action Restricted
Action State Unavailable

Draft Autosaving
Draft Saved
Draft Save Failed
Draft Conflict

Submission Processing
Submission Confirmed
Submission Outcome Uncertain
Submission Failed

Questionnaire Restricted
Project Context Restricted
Partial Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize cross-Project questionnaire scanning.

Conceptually:

```text
Questionnaires
↓
Summary / filters if frozen
↓
Questionnaire Library
    ├── Questionnaire title
    ├── Project / media context
    ├── Assignment date
    ├── exact/current assignment state
    ├── progress
    ├── due date / overdue condition
    ├── current-user action
    └── Open / Continue
```

The frozen visual composition remains unchanged.

---

## Desktop should not become template administration

Do not expose:

* QuestionnaireDefinition editor,
* Version publishing controls,
* conditional-rule builder,
* internal response review tooling.

Design 067 is a Client library.

---

## Tablet

Following Design 152:

* dense rows can become compact cards,
* Project/context remains visible,
* due/state/action remain easy to scan,
* filters can collapse,
* progress remains tied to the correct Assignment.

---

## Mobile

Priority:

```text
Questionnaires
↓
Questionnaire Card
   ├── title
   ├── Project
   ├── state
   ├── progress
   ├── due condition
   └── Start / Continue / View
↓
Next Questionnaire
```

Do not compress a desktop table horizontally.

---

## Mobile action clarity

Use source-specific action labels:

* Start Questionnaire
* Continue Questionnaire
* Review Submitted Answers
* Make Requested Revisions

rather than generic:

> Open

where the frozen design supports action labeling.

---

## Mobile overdue clarity

Do not use red color alone.

Use semantic text:

> Overdue by 2 days

where policy/frozen UI exposes it.

---

## Version clarity

If Questionnaire version is relevant in frozen UI/history, show a human-readable version reference.

Never expose it as only an opaque database ID.

---

## Accessibility

Each card/row should communicate something equivalent to:

> Executive Interview Questionnaire. Project Executive Magazine. In progress, 60 percent complete. Due August 28. Continue questionnaire.

where canonical data supports those fields.

---

## Progress accessibility

A progress bar needs semantic value/text.

Do not rely solely on visual fill.

---

# 7. Backend Requirements

## Library query architecture

```text
Design 067
    ↓
ClientPortalSessionContext
    ↓
Questionnaire Library Authorization
    ↓
ClientQuestionnaireLibraryQueryService
    │
    ├── authorized QuestionnaireAssignments
    ├── exact QuestionnaireVersions
    ├── safe QuestionnaireDefinition metadata
    ├── Project/media context
    ├── current Response state
    ├── latest relevant ResponseRevision
    ├── due condition
    ├── progress resolver
    └── current ClientAction
    ↓
ClientQuestionnaireLibraryEntry[]
    ↓
ClientQuestionnairesLibraryView
```

---

## Assignment is the query anchor

The primary query should conceptually begin from:

```text
authorized QuestionnaireAssignments
```

not all QuestionnaireDefinitions.

This ensures the Client sees what was actually assigned.

---

## Exact Version resolution

For each Assignment:

```text
assignment.questionnaireVersionId
```

must resolve directly.

Never:

```text
definition.latestVersion
```

for an existing Assignment.

---

## Response resolver

Conceptually:

```text
QuestionnaireAssignment
      ↓
QuestionnaireResponse
      ↓
current draft
+
latest submitted/accepted ResponseRevision
```

depending on workflow.

---

## Accepted Revision resolver

Downstream systems should be able to resolve:

```text
acceptedResponseRevisionId
```

or equivalent.

Do not infer accepted content from “latest Response.”

---

## Progress resolver

Centralize progress calculation.

Conceptually:

```text
resolveQuestionnaireProgress(
    assignment,
    exact questionnaire version,
    current response draft
)
```

It should account for:

* required questions,
* currently active conditional questions,
* validation semantics,

according to Design 048 policy.

---

## Due resolver

A central due-state service calculates:

```text
due condition
```

from:

* Assignment due date,
* canonical timezone/date semantics,
* lifecycle.

Do not calculate overdue differently in Design 041, 043, 047, 066 and 067.

---

## ClientAction integration

Conceptually:

```text
QuestionnaireAssignment
      ↓
current response/assignment state
      ↓
respondent authorization
      ↓
ClientActionResolver
```

This should determine whether the current member has:

* Start,
* Continue,
* Submit,
* Revise,

or no action.

---

## No giant `completeQuestionnaire()` shortcut

Submission should remain explicit:

```text
submitQuestionnaireResponse()
```

against:

* Assignment,
* exact Version,
* current Response revision/state.

Do not simply patch:

```text
assignment.status = COMPLETE
```

from the browser.

---

## Submission idempotency

If the Client presses Submit and the network times out:

retry must not create duplicate ResponseRevisions or duplicate downstream events.

Use an idempotent submission operation.

---

## Optimistic concurrency for drafts

Draft writes should carry:

* response revision/version/ETag,
* updatedAt token,
* or equivalent concurrency state.

This prevents silent lost updates.

---

## Autosave architecture

Autosave should be:

* debounced/batched appropriately,
* validated,
* recoverable,
* conflict-aware.

It must not create hundreds of formal business revisions unnecessarily.

---

## Validation

Backend validates answers against the **exact assigned QuestionnaireVersion**.

Never trust Client-side validation alone.

---

## Conditional logic

Backend must apply the Version's canonical conditional rules when validating submission.

Frontend and backend need the same schema semantics.

---

## Search architecture

Search can index safe Assignment metadata:

* Questionnaire title,
* Project title,
* Client-safe status.

Do not index confidential answer content by default.

---

## Pagination

Use server-side pagination/cursor semantics.

A Client may eventually have many historical QuestionnaireAssignments.

---

## Filters

Potential filters, only if frozen:

* Project,
* state,
* due condition,
* action required.

They are query criteria, not authorization.

---

## Counts

Any summary counts should derive from the same filtered/authorized Assignment query.

Examples:

```text
Total
Needs Action
Submitted
Completed/Accepted
Overdue
```

according to frozen UI.

No separate counting tables with drift.

---

## Library projection can be materialized

If cross-Project query volume becomes large:

```text
ClientQuestionnaireLibraryProjection
```

could be materialized.

But it must remain:

* source-derived,
* replayable,
* permission-aware.

Never manually update it as business truth.

---

## Event-driven invalidation

Relevant events include conceptually:

```text
QuestionnaireAssigned
QuestionnaireDraftStarted
QuestionnaireResponseSubmitted
QuestionnaireResponseAccepted
QuestionnaireRevisionRequested
QuestionnaireReopened
QuestionnaireSuperseded
QuestionnaireCancelled
PortalScopeChanged
```

Exact names later.

---

## Notification integration

Due reminders/submission updates can feed Designs 061/064.

Notification read state never updates Assignment state.

---

## Activity integration

Meaningful events can feed Design 063:

> Questionnaire submitted.

Activity is derived from canonical Questionnaire event.

---

## Project/workflow integration

Submission or acceptance may satisfy a Project dependency.

Correct:

```text
Questionnaire domain event
        ↓
Project dependency/workflow evaluator
        ↓
Project state may progress
```

Not:

```text
Design 067 frontend
→ PATCH Project stage
```

---

## Editorial integration

Design 024 should consume the exact accepted ResponseRevision.

Correct lineage:

```text
QuestionnaireAssignment
      ↓
Accepted ResponseRevision
      ↓
Editorial input
      ↓
AI-assisted transformation if used
      ↓
DraftVersion
```

Original Client answers remain preserved.

---

## Permission-safe caching

Cache keys must account for:

```text
membershipId
Client/account
Assignment authorization revision
Project scope
Response state revision
```

Do not reuse a Client administrator's broad questionnaire list for another restricted user.

---

## Partial failure handling

Example:

```text
Assignments       ✓
Project metadata   ✓
Response service   ✕
Action resolver    ✓
```

Do not label every Assignment:

> Not started.

Return response state unavailable for affected entries.

---

## Backend Requirement Matrix

| Requirement                                       | Status                               |
| ------------------------------------------------- | ------------------------------------ |
| Client Portal authentication                      | **Critical**                         |
| Active Portal membership                          | **Critical**                         |
| Canonical QuestionnaireDefinition reuse           | **Critical**                         |
| Immutable QuestionnaireVersion                    | **Critical**                         |
| Exact assigned QuestionnaireVersion               | **Critical**                         |
| Canonical QuestionnaireAssignment reuse           | **Critical**                         |
| Assignment-centric Library query                  | **Critical**                         |
| Assignment/Response separation                    | **Critical**                         |
| QuestionnaireResponse model                       | **Critical**                         |
| ResponseRevision history                          | **Critical**                         |
| Draft/submitted separation                        | **Critical**                         |
| Submitted/accepted separation                     | **Critical**                         |
| Revision-request/rejection separation             | **Critical**                         |
| Reopened/resubmission support                     | **Critical**                         |
| Reusable Definition/Project Assignment separation | **Critical**                         |
| Multi-Assignment-per-Project support              | **Critical**                         |
| Same Definition across Projects                   | **Critical**                         |
| Account/respondent separation                     | **Critical**                         |
| Read/respond/submit permission separation         | **Critical**                         |
| Exact accepted ResponseRevision                   | **Critical**                         |
| Stable Question IDs                               | **Critical**                         |
| Version-specific validation                       | **Critical**                         |
| Conditional-question logic                        | **Critical**                         |
| Central progress resolver                         | **Critical**                         |
| Progress/submission separation                    | **Critical**                         |
| Assignment due-state resolver                     | **Critical**                         |
| Due condition/lifecycle separation                | **Critical**                         |
| Autosave                                          | **Required**                         |
| Optimistic concurrency                            | **Critical**                         |
| Idempotent submission                             | **Critical**                         |
| Attachment Asset/FileVersion reuse                | **Critical where attachments exist** |
| Design 047 ClientAction reuse                     | **Critical**                         |
| Action state/Questionnaire truth separation       | **Critical**                         |
| Project dependency integration                    | **Critical**                         |
| Editorial accepted-response integration           | **Critical**                         |
| Permission-safe search                            | **Critical**                         |
| Server pagination                                 | **Required**                         |
| Permission-safe counts                            | **Critical**                         |
| Permission-safe caching                           | **Critical**                         |
| Partial service degradation                       | **Critical**                         |
| Event-driven projection invalidation              | **Required**                         |
| Design 048 backend reuse                          | **Critical**                         |
| Designs 043/066 consistency                       | **Critical**                         |
| Design 063 Activity integration                   | **Required**                         |
| Design 064 Notification integration               | **Required**                         |

---

# 8. Consolidation

Design 067 exposes several major implementation risks.

**Definition / Version conflation**
Template edits rewrite active Client questionnaires.

**Definition / Assignment conflation**
Reusable questionnaire becomes Project-specific record.

**Assignment / Response conflation**
Questionnaire does not exist until user starts typing.

**Response / ResponseRevision conflation**
Submitted history is overwritten by later edits.

**Draft / Submitted conflation**
Autosaved answers are treated as formally submitted.

**100%-answered / Submitted conflation**
Progress completion triggers submission automatically.

**Submitted / Accepted conflation**
Client submission bypasses review/acceptance.

**Revision Requested / Rejected conflation**
Editable correction cycle becomes terminal failure.

**Reopened / new Assignment conflation**
One historical assignment fragments into multiple unnecessary records.

**Resubmitted / Accepted conflation**
Second submission is considered automatically approved.

**Due condition / lifecycle conflation**
Overdue becomes a Questionnaire status replacing In Progress/Submitted.

**Overdue / Cancelled conflation**
Expired due date destroys the Assignment.

**Assignment due date / Project due date conflation**
Questionnaire reminder changes Project deadline.

**Project / QuestionnaireAssignment conflation**
Project supports only one questionnaire.

**Account / respondent conflation**
Every Portal user can answer every Client questionnaire.

**Viewer / respondent conflation**
Status visibility grants edit capability.

**Edit / Submit conflation**
Any collaborator can finalize the response.

**Portal Admin / respondent conflation**
Client access administrator can answer on behalf of anyone.

**Latest QuestionnaireVersion bug**
Existing Assignment silently upgrades when template changes.

**Latest Response / Accepted Response conflation**
Editorial consumes an unaccepted draft because it is newest.

**Latest ResponseRevision / current Assignment state conflation**
Library displays incorrect lifecycle.

**Stable Question ID / label conflation**
Renaming/reordering questions breaks stored answers.

**Conditional question / static progress conflation**
Progress percentage ignores dynamic visibility rules.

**Hidden answer / deleted answer conflation**
Conditional UI destroys valid historical Client input.

**Autosave / formal revision conflation**
Every keystroke pollutes response-version history.

**Attachment upload / Questionnaire submission conflation**
Adding files completes the questionnaire.

**ClientAction / Questionnaire truth conflation**
Action dismissal/completion controls Assignment status.

**Notification / Questionnaire truth conflation**
Reading reminder marks Questionnaire completed.

**Activity / Questionnaire truth conflation**
History entry becomes submission evidence.

**LibraryEntry / Assignment conflation**
Read-model fields become independently editable.

**Same Definition / same Library item conflation**
Assignments across several Projects are collapsed into one card.

**Response revisions / duplicate Library entries**
One Assignment appears several times because of resubmission history.

**Questionnaire read / answer-content read conflation**
Library leaks sensitive responses to status-only viewers.

**Project access / Questionnaire access conflation**
Any Project viewer can inspect/modify Questionnaire responses.

**Direct Assignment ID bypass**
User guesses another Client's Assignment ID.

**Direct ResponseRevision ID bypass**
Historical answers become exposed without Assignment authorization.

**Search leakage**
Restricted questionnaire/Project titles appear in search.

**No response / service failure conflation**
Response outage is shown as Not Started.

**Action resolver unavailable / no action conflation**
Required Client work disappears.

**Progress unavailable / 0% conflation**
Unknown progress looks like not started.

**Submit timeout / duplicate submission**
Retry creates multiple ResponseRevisions.

**Concurrent editing / lost update**
Two users overwrite each other's draft answers.

**Frontend Project-stage mutation**
Questionnaire submission directly patches Project status.

**Editorial transformation / original answer conflation**
AI/editorial rewrite replaces the Client's original response.

**067/048 duplicate Questionnaire engine**
Library creates a new assignment/response model.

**067/043 duplicate Project-questionnaire state**
Project detail stores separate Questionnaire status.

**067/066 duplicate media-questionnaire state**
Media detail and Library disagree about current assignment.

**067/047 duplicate action state**
Questionnaire library manually maintains `requiresAction`.

No additional screen is required.

These are **versioning, assignment identity, response history, respondent authorization, progress, due-state, Client action, and cross-Project discovery requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT CROSS-PROJECT QUESTIONNAIRE ASSIGNMENT LIBRARY & DISCOVERY ANCHOR**

**Domain directive:**
**QuestionnaireDefinition ≠ QuestionnaireVersion ≠ QuestionnaireAssignment ≠ QuestionnaireResponse ≠ ResponseRevision ≠ ClientQuestionnaireLibraryEntry ≠ ClientAction ≠ Project.**

**Reuse directive:**
Design 048 remains the single canonical Questionnaire engine. Design 067 is a cross-Project Client-safe collection/read projection over that engine.

**Definition directive:**
QuestionnaireDefinition remains reusable across Projects and Clients; it never becomes the Project-specific assignment record.

**Version directive:**
every QuestionnaireAssignment pins an exact immutable QuestionnaireVersion. Template changes never rewrite or silently upgrade already issued Assignments.

**Assignment directive:**
QuestionnaireAssignment is the canonical item represented in the Library and owns assignment context, recipient, Project, due date and policy.

**Response directive:**
Assignment and Response remain separate. A valid Assignment can exist with no Response when it has not yet been started.

**Revision directive:**
meaningful submitted/resubmitted states preserve exact ResponseRevision history. Later changes never overwrite earlier submitted evidence.

**Lifecycle directive:**
Draft/In Progress, Ready to Submit, Submitted, Awaiting Review, Accepted, Revision Requested, Reopened, Resubmitted, Cancelled and Superseded remain deliberate workflow concepts rather than one vague “complete” flag.

**Due directive:**
due/overdue is an independent time condition layered over Assignment lifecycle and never substitutes for response state.

**Progress directive:**
questionnaire progress uses one canonical Version-aware, conditional-question-aware resolver; 100% answered does not imply formal submission.

**Respondent directive:**
Client account membership is not respondent authority. Read, respond and submit capabilities remain separately enforceable against the exact Assignment.

**Portal-admin directive:**
Design 062 access administration never automatically makes an administrator respondent or submitter for another Client member's questionnaire.

**Library directive:**
`ClientQuestionnaireLibraryEntry` is a read model keyed to the canonical Assignment. Multiple Assignments using the same reusable Definition remain separate entries.

**Project directive:**
one Project can own several QuestionnaireAssignments, and one QuestionnaireDefinition can be assigned across many Projects. No singular `project.questionnaireId` architecture is permitted.

**Action directive:**
Design 047's `ClientActionResolver` determines whether this member currently needs to Start, Continue, Submit or Revise an Assignment. The action projection never becomes Questionnaire truth.

**Editorial directive:**
Design 024 consumes the exact accepted ResponseRevision. Original Client answers remain immutable evidence distinct from AI summaries and generated DraftVersions.

**Attachment directive:**
Questionnaire attachments reuse Design 030 Asset/FileVersion infrastructure, and upload completion never implies response submission.

**Submission directive:**
formal submission is a server-authoritative, validation-aware and idempotent command against the exact Assignment/Version/Response state.

**Concurrency directive:**
draft autosave and collaborative/session editing require revision/conflict protection so concurrent changes cannot silently overwrite Client input.

**Search directive:**
Design 067 searches and filters only already-authorized QuestionnaireAssignments and does not index sensitive answer content by default.

**Consistency directive:**
Designs 041, 043, 047, 066 and 067 must use the same Assignment state, due-state, progress and current-action definitions so counts and labels cannot drift.

**Failure directive:**
Response unavailable, progress unavailable, action state unavailable, Project context unavailable and a genuine Not Started state remain separate. Unknown values never become false `Not Started`, `0%`, or `No Action`.

**Responsive directive:**
desktop supports cross-Project questionnaire scanning and filtering; mobile reduces each item to title → Project → state → progress → due condition → current permitted action without exposing template administration.

**Overlap directive:**
Designs **024, 043, 047–048, 063–067 and later Questionnaire-consuming Project/workflow surfaces** must ultimately share one QuestionnaireDefinition + immutable Version + Assignment + Response + Revision + Progress + Due + ClientAction foundation.

**Consolidation directive:**
**STANDARDIZE ONE VERSIONED QUESTIONNAIRE ENGINE — REUSABLE QUESTIONNAIREDEFINITION + IMMUTABLE QUESTIONNAIREVERSION + PROJECT/CLIENT-SCOPED QUESTIONNAIREASSIGNMENT + RESPONDENT POLICY + QUESTIONNAIRERESPONSE + RESPONSE REVISION HISTORY + VERSION-AWARE VALIDATION + AUTOSAVE/CONCURRENCY + SUBMISSION/ACCEPTANCE + DUE/PROGRESS RESOLVERS + CLIENT ACTION PROJECTION — AND BUILD DESIGN 067 ONLY AS AN AUTHORIZED CROSS-PROJECT LIBRARY OVER THAT ENGINE, NEVER AS A SECOND QUESTIONNAIRE BACKEND.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **67 / 153** |
| **PASS**                                   |                         **67** |
| **STANDARDIZE decisions**                  |                         **65** |
| **Potential implementation-overlap flags** |                         **58** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**67 / 153 = 43.8% audited.**

### Canonical Questionnaire architecture after Design 067

```text
                QuestionnaireDefinition
                         │
                         ↓
                QuestionnaireVersion
                  immutable schema
                         │
                         ↓
               QuestionnaireAssignment
              ┌──────────┼───────────┐
              ↓          ↓           ↓
           Project    Respondent    Due/Policy
              │
              ↓
          QuestionnaireResponse
              │
       ┌──────┴─────────────┐
       ↓                    ↓
  Current Draft      ResponseRevision(s)
                           │
                   Submitted / Accepted
                           │
                           ↓
                   Editorial Consumption
                       Design 024
```

The Client surfaces remain separated:

```text
Design 067
Questionnaires Library
        ↓
“Which Assignments exist across my authorized Projects?”

Design 048
Questionnaire Completion
        ↓
“Complete this exact Assignment and Version.”

Design 047
Client Actions
        ↓
“What questionnaire action currently requires me?”

Design 043 / 066
Project Details
        ↓
“How does this Assignment relate to this specific Project?”
```

All four consume the **same QuestionnaireAssignment and Response state**.

# Next Sequential Audit Target

## **Design 068 — Client Drafts Library**

Its frozen identity and supplied route annotation **`/client/drafts`** are already locked.

The next audit must preserve the Draft-library boundary:

> **Draft ≠ DraftVersion ≠ ClientReleasedVersion ≠ ReviewSession ≠ ReviewComment ≠ ApprovalRequest ≠ LibraryEntry/Projection ≠ Project ≠ ClientAction.**

It will need to reconcile **Design 049’s exact-version Client Draft Review workflow** with a broader cross-Project Draft library while preserving:

* latest internal Draft ≠ latest Client-released Draft,
* every review binds an exact DraftVersion,
* feedback/comment ≠ formal ApprovalDecision,
* superseded version ≠ rejected version,
* Library entries remain projections over canonical Draft/Version/Review state,
* no second Draft backend for the Client library.

After Design 068 we continue strictly:

**069 Client Designs / Proofs Library → 070 Client Contract Detail & Digital Signing → 071 Client Invoice / Payment Detail → 072 Client Publishing / Live Links Detail → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
