# R8 Domain and Workflow

Status: **FROZEN WITH P4-R8-G0 — IMPLEMENTATION NOT AUTHORIZED**
Contract: `PHASE-4-R8-G0-FREEZE.md`

## Aggregates

| Aggregate | Owns | Does not own |
|---|---|---|
| Project | Tenant, client account, accepted proposal, lifecycle, members | Platform membership, finance rows, public publication |
| Project membership | One membership inside one project and one project role | A role grant or a client login |
| Questionnaire | One project IQ, its sent versions, one received response | Client portal submission |
| Editorial work | The production content identity for one project | An immutable version |
| Draft | The current working copy | History |
| Draft version | Immutable issued text and the version number | Later edits |
| Editorial review | Internal reviewer, version, notes, resolution | Client approval |
| Client approval | One client decision on one exact version | Internal editorial approval |
| Asset | Project file, visibility, four rights flags | A license marketplace or a public URL |
| Task | Assignment, due state, same-project blockers | The project lifecycle |
| Milestone | A named production outcome and its completion | A draft version |
| Deliverable | A typed outcome that points at a version or asset | The version itself |
| Citation | A source attached to one draft version | A fact-check result or an approval |
| Fact check | A verification record on one draft version | A citation or an approval |
| Credit | A person and a frozen credit role on a project | Authorization |

## Frozen enumerations

Project role: `LEAD`, `EDITOR`, `PRODUCER`, `CONTRIBUTOR`, `CLIENT_CONTACT`.

Credit role: `AUTHOR`, `EDITOR`, `PHOTOGRAPHER`, `DESIGNER`, `CONTRIBUTOR`.

Milestone kind: `INTERVIEW_COMPLETE`, `DRAFT_COMPLETE`, `EDITORIAL_REVIEW_COMPLETE`, `CLIENT_APPROVAL`, `ASSETS_COMPLETE`, `DESIGN_COMPLETE`, `PUBLICATION_READY`.

Deliverable kind: `QUESTIONNAIRE`, `DRAFT`, `EDITORIAL_REVIEW`, `CLIENT_APPROVAL`, `ASSET_SET`, `DESIGN`, `PUBLICATION_HANDOFF`.

Task status: `OPEN`, `BLOCKED`, `COMPLETED`, `CANCELLED`.

Task priority: `LOW`, `NORMAL`, `HIGH`.

Questionnaire status: `DRAFT`, `GENERATED`, `SENT`, `RECEIVED`, `LOCKED`.

Review state: `OPEN`, `CHANGES_REQUESTED`, `RESOLVED`.

Client decision: `APPROVED`, `REJECTED`.

Asset visibility: `INTERNAL`, `CLIENT_VISIBLE`.

Rights flags are four independent booleans, not one status: `present`, `approved`, `licensed`, `cleared`. `cleared` may be true only when `approved` and `licensed` are already true. None of the four implies another by itself. Storage of a file sets `present` only.

## Project lifecycle

Forward transitions, and only these, are valid:

| From | To | Server condition |
|---|---|---|
| `PROJECT_CREATED` | `IQ_GENERATED` | A generated questionnaire version exists |
| `IQ_GENERATED` | `IQ_SENT` | That version was sent and has an outbox intent |
| `IQ_SENT` | `IQ_RECEIVED` | One response is bound to the sent version |
| `IQ_RECEIVED` | `DRAFT_GENERATED` | Draft version 1 exists |
| `DRAFT_GENERATED` | `EDITORIAL_REVIEW` | An open editorial review names an exact version |
| `EDITORIAL_REVIEW` | `CLIENT_REVIEW` | `editorial.approve` has approved that same version |
| `CLIENT_REVIEW` | `CLIENT_APPROVAL` | `approval.client.decide` approved that same version |
| `CLIENT_REVIEW` | `CLIENT_CHANGES_REQUESTED` | The client rejected that same version |
| `CLIENT_CHANGES_REQUESTED` | `DRAFT_GENERATED` | A newer draft version exists |
| `CLIENT_APPROVAL` | `ASSETS` | The approved version is still current |
| `ASSETS` | `DESIGN_STARTED` | At least one asset exists and every asset has `present` |
| `DESIGN_STARTED` | `DESIGN_REVIEW` | A design deliverable references the approved version |
| `DESIGN_REVIEW` | `DESIGN_APPROVED` | That deliverable is marked complete by `project.manage` |
| `DESIGN_APPROVED` | `PUBLICATION_READY` | At least one asset exists and every asset is `cleared` |
| `PUBLICATION_READY` | `PUBLISHED` | Marker only. No publish command |
| `PUBLISHED` | `DISTRIBUTION` | Marker only. No distribution command |
| `DISTRIBUTION` | `COMPLETED` | Marker only |

Any non-terminal state may move to `CANCELLED` through `project.manage` with a reason. `COMPLETED` and `CANCELLED` accept no later transition. No other edge exists. `workflow.move` is the only command that changes project state, except cancel.

Internal editorial approval is not client approval. Client approval is not publication. A design marker is not `design.approve`.

## Version rules

A questionnaire version is immutable once sent. Send binds the exact version and its digest. Receive binds that same version. A second response for the same sent version conflicts. Lock rejects further receive. The client HTTP submit path is not in R8. `client.questionnaire.edit` stays R12. The TEAM receive command records the client organization as the subject of the response. The browser does not assert that identity.

A working draft is mutable only before a version is issued from it. Issuing a version freezes that snapshot. Later work creates the next version. Review and client approval name a draft version id. They do not name "the current draft." A superseded version cannot be approved. Two decisions cannot exist for one version.

## Tasks and milestones

A task belongs to one project. A dependency edge stays inside that project. A task cannot complete while a blocker is `OPEN` or `BLOCKED`. Completing a task does not move the project. A milestone may refuse completion while a task that names that milestone is still open. Tasks are not a general project-management product.

A deliverable points at a questionnaire version, a draft version, a review, an approval, or an asset set. It is not a copy of that record.

## Client-safe projection

The client command may read and return only:

- project id and title
- client organization id already bound server-side
- draft version id, version number, and client-visible body
- the decision requested
- the recorded decision, actor membership, and server timestamp after commit

Everything else is denied, including internal review notes, fact-check notes, rights notes, audit payloads, storage keys, and assets whose visibility is `INTERNAL`.

## Activity versus audit

`project.activity.view` may return a redacted list of transition labels and timestamps. It must not read or return `audit.audit_events`. Every command in the API matrix that mutates writes an audit event in the same transaction as the business row. A failed audit rolls the business write back.
