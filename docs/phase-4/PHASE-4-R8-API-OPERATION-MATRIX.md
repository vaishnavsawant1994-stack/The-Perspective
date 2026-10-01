# R8 API Operation Matrix

Status: **FROZEN WITH P4-R8-G0 — NO ROUTE IS IMPLEMENTED**
Contract: `PHASE-4-R8-G0-FREEZE.md`

Routes below are the future `/api/v1/r8` surface. This document does not create them. Generic PATCH, PUT, and DELETE of lifecycle or status are forbidden. Each mutation is one named command.

Shared rules for every mutation:

- same-origin POST for TEAM commands
- authenticated selected organization
- server-built resource context
- permission from the table, not from the body
- tenant taken from the session
- expected row version where the row is mutable
- idempotency key on every create, transition, approval, upload, and receive
- same key and same payload replays
- same key and different payload conflicts
- audit in the same transaction
- unknown or foreign ids are concealed

Client approval uses the existing CLIENT session rule from proposal acceptance. TEAM authority cannot substitute.

## Project and workflow

| Operation | Method and path | Permission | Input the caller may send | Server owns | Denied |
|---|---|---|---|---|---|
| List projects | `GET /projects` | `project.view` | limit | tenant filter and field projection | foreign tenant rows |
| Project detail | `GET /projects/:projectId` | `project.view` | id | canonical project | missing or foreign id |
| Create project | `POST /projects` | `project.create` | `proposalId`, expected proposal version | client account, organization, source, initial state `PROJECT_CREATED` | unaccepted proposal, foreign proposal, second live project |
| Edit project | `POST /projects/:projectId/edit` | `project.manage` | title, expected row version | tenant, source, client, state | status, source, or tenant in the body |
| Cancel project | `POST /projects/:projectId/cancel` | `project.manage` | reason, expected row version | terminal `CANCELLED` | cancel of `COMPLETED`, empty reason |
| Assign member | `POST /projects/:projectId/members` | `project.assign` | membership id, project role | same-tenant membership check | a role grant, a client login |
| End membership | `POST /projects/:projectId/members/:membershipId/end` | `project.assign` | expected row version | end timestamp | foreign membership |
| Activity | `GET /projects/:projectId/activity` | `project.activity.view` | id | redacted labels | audit rows |
| Transition | `POST /projects/:projectId/transition` | `workflow.move` | expected state, expected row version | next state and transition row | skipped state, browser target that is not the one valid next state, design or publish side effect |

The transition body names the state the caller believes is current. The server computes the only legal next state. The caller does not choose an arbitrary target.

## Questionnaire, tasks, milestones, deliverables

| Operation | Method and path | Permission | Input the caller may send | Server owns | Denied |
|---|---|---|---|---|---|
| Questionnaire read | `GET /projects/:projectId/questionnaires/:questionnaireId` | `questionnaire.view` | ids | version and response projection | foreign project |
| Create questionnaire | `POST /projects/:projectId/questionnaires` | `questionnaire.edit` | title | project binding, `DRAFT` | a second IQ on the project |
| Generate version | `POST /questionnaires/:questionnaireId/generate` | `questionnaire.edit` | expected row version | version number and digest | generate after lock |
| Send | `POST /questionnaires/:questionnaireId/send` | `questionnaire.edit` | version id, expected row version | outbox intent, `SENT` | send of an ungenerated version, proof of email |
| Receive | `POST /questionnaires/:questionnaireId/receive` | `questionnaire.edit` | version id, response body, expected row version | client organization subject, `RECEIVED` | a second response, a client browser actor, a body that names the client |
| Lock | `POST /questionnaires/:questionnaireId/lock` | `questionnaire.edit` | expected row version | `LOCKED` | lock before receive |
| Task list | `GET /projects/:projectId/tasks` | `task.view` | project id | tenant filter | foreign tasks |
| Create task | `POST /projects/:projectId/tasks` | `task.edit` | title, priority, due date, optional blocker task id, optional milestone id | assignee unset, `OPEN` or `BLOCKED` | a blocker from another project |
| Edit task | `POST /tasks/:taskId/edit` | `task.edit` | title, priority, due date, expected row version | status | completion through edit |
| Assign task | `POST /tasks/:taskId/assign` | `task.edit` | project membership id, expected row version | same-project member | foreign member |
| Complete task | `POST /tasks/:taskId/complete` | `task.edit` | expected row version | `COMPLETED` | an open blocker |
| Milestone list | `GET /projects/:projectId/milestones` | `project.view` | project id | frozen kinds only | — |
| Create milestone | `POST /projects/:projectId/milestones` | `project.manage` | kind | one row per kind per project | a free-form kind |
| Complete milestone | `POST /milestones/:milestoneId/complete` | `project.manage` | expected row version | completion time | open task that names it |
| Deliverable list | `GET /projects/:projectId/deliverables` | `project.view` | project id | references | the pointed-at body, unless that command's own read allows it |
| Create deliverable | `POST /projects/:projectId/deliverables` | `project.manage` | kind and the target id | type check against the target | a target from another project |
| Complete deliverable | `POST /deliverables/:deliverableId/complete` | `project.manage` | expected row version | completion | completion when the target is missing |

There is no `questionnaire.submit` route.

## Draft, review, approval

| Operation | Method and path | Permission | Input the caller may send | Server owns | Denied |
|---|---|---|---|---|---|
| Draft read | `GET /projects/:projectId/draft` | `draft.view` | project id | working copy and version list | foreign project |
| Version read | `GET /draft-versions/:versionId` | `draft.view` | id | immutable body | a version outside the tenant |
| Create work and draft | `POST /projects/:projectId/draft` | `draft.edit` | none | one work and one working draft | a second work |
| Edit working draft | `POST /drafts/:draftId/edit` | `draft.edit` | body, expected row version | the working copy only | an edit of an issued version |
| Issue version | `POST /drafts/:draftId/versions` | `draft.edit` | expected draft row version | version number and digest | issue when the working copy is empty |
| Open review | `POST /draft-versions/:versionId/reviews` | `editorial.review` | none | reviewer membership, `OPEN` | review of a superseded version |
| Add note | `POST /reviews/:reviewId/notes` | `editorial.review` | note body | author and time | a note after resolve |
| Request changes | `POST /reviews/:reviewId/request-changes` | `editorial.review` | expected row version | `CHANGES_REQUESTED` | a resolved review |
| Resolve review | `POST /reviews/:reviewId/resolve` | `editorial.review` | expected row version | `RESOLVED` | resolve by the client |
| Editorial approve | `POST /draft-versions/:versionId/editorial-approval` | `editorial.approve` | expected version | internal approval evidence | approval of a different or superseded version, client approval |
| Approval read | `GET /draft-versions/:versionId/approval` | `approval.view` | version id | decision evidence | internal notes |
| Client decision | `POST /draft-versions/:versionId/client-decision` | `approval.client.decide` | `APPROVED` or `REJECTED` | client membership, version, server time | TEAM caller, wrong version, second decision |

`editorial.approve` does not move the project. `workflow.move` does, and only after the approval row exists. The client decision does not move the project by itself. The following `workflow.move` checks the decision.

## Assets, evidence, credits

| Operation | Method and path | Permission | Input the caller may send | Server owns | Denied |
|---|---|---|---|---|---|
| Asset read | `GET /projects/:projectId/assets/:assetId` | `file.view` | ids | metadata and bytes when visibility allows | another project's file, an internal file on a client path |
| Upload version | `POST /projects/:projectId/assets` | `file.version` | file bytes and filename | storage key, digest, `present` | caller storage key, caller rights |
| Set rights | `POST /assets/:assetId/rights` | `file.version` | which flag and true or false, expected row version | the check that `cleared` requires `approved` and `licensed` | a single status string |
| Set visibility | `POST /assets/:assetId/visibility` | `file.version` | `INTERNAL` or `CLIENT_VISIBLE` | the stored flag | visibility as authorization |
| Citation read | `GET /draft-versions/:versionId/citations` | `editorial.view` | version id | citation rows | fact-check notes |
| Add citation | `POST /draft-versions/:versionId/citations` | `editorial.review` | source label and locator | version binding | a citation that approves the draft |
| Fact-check read | `GET /draft-versions/:versionId/fact-checks` | `editorial.view` | version id | status and reviewer | approval |
| Record fact check | `POST /draft-versions/:versionId/fact-checks` | `editorial.review` | status and note | reviewer membership | a status of approved |
| Fact-check status | frozen values | — | `UNVERIFIED`, `VERIFIED`, `DISPUTED` | — | any other string |
| Credit read | `GET /projects/:projectId/credits` | `project.view` | project id | person and credit role | permissions |
| Add credit | `POST /projects/:projectId/credits` | `project.manage` | person id and credit role | same-tenant person | a free-form role, a role grant |

Fact-check status is evidence. It is not `editorial.approve` and not client approval.

## Concurrency

| Case | Required result |
|---|---|
| Two client decisions on one version | one decision, the other conflicts, no mixed approval |
| Two edits of one working draft | one commit, the stale row version conflicts, no silent overwrite |
| Two transitions from one project state | one transition, the other conflicts |
| Two receives of one sent questionnaire | one response |
| Replayed upload with the same key and bytes | one asset version |
| Replayed upload with the same key and different bytes | conflict, no second version |
| Failed audit or failed constraint | no business row, no transition, no receipt completion |

Idempotency uses `platform.idempotency_receipts`. Scope is the command name plus the tenant.
