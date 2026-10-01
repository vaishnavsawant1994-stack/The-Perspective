# P4-R8-G0 — Editorial & Client Production Freeze

STATUS: **DRAFT FOR OWNER FREEZE — IMPLEMENTATION NOT AUTHORIZED**
PHASE: R8
NAME: Editorial & Client Production Workflow
BASE: `main` `304e696c2f38d5b5af4d48607fdbbfcb5423aece` (R7 accepted and merged)
R7 MERGE: `d1ab24b6fb6ec7828c7691940040d59d8e40fca8`
R7 RECORD: `docs/phase-4/PHASE-4-R7-ACCEPTED-MERGED.md`
PLANNING AUTHORIZATION: 1 October 2026 program instruction
IMPLEMENTATION: **NOT AUTHORIZED**
R9–R14: **STILL LOCKED**
NO DESIGN 154
NO PAGE 58+

This file is the controlling R8 contract. The companion documents in this same commit are part of the freeze:

- `PHASE-4-R8-INVENTORY.md`
- `PHASE-4-R8-DOMAIN-AND-WORKFLOW.md`
- `PHASE-4-R8-API-OPERATION-MATRIX.md`
- `PHASE-4-R8-DATABASE-CONTRACT.md`
- `PHASE-4-R8-SECURITY-AND-QUALIFICATION.md`

If those documents disagree with this file, this file wins until an owner addendum says otherwise.

## Two authorizations

Authorization A is this planning package. It allows the inventory, the domain contract, the workflow, the API matrix, the database contract, the security contract, and this freeze. It does not allow tables, migrations, routes, permission activation, or production behavior.

Authorization B is a later, separate message. Only that message may authorize implementation, and only against this frozen package. No R8 code may start in the gap between the two.

## Objective

R8 is the production system that takes one accepted commercial engagement into editorial and client production. It connects qualified R7 commercial state to a future R9 publishing engine. It does not implement that engine.

The production order is:

Project → Interview Questionnaire → Draft → Editorial Review → Client Review → Client Approval → Assets → Design marker → Publication-ready marker → Published marker → Distribution marker → Completed.

`PUBLISHED` and `DISTRIBUTION` in this release are workflow markers only. They do not publish, schedule, or distribute anything.

## Scope freeze

R8 includes only:

- a tenant-scoped Project that references one accepted Proposal and one live client account
- project membership that does not grant platform authority
- one canonical workflow and its append-only transitions
- tasks and same-project dependencies
- milestones and deliverables
- interview questionnaires, immutable sent versions, and TEAM receive/lock
- an editorial work, a working draft, and immutable draft versions
- internal editorial review and internal editorial approval
- client approval of one exact draft version
- production assets, asset versions, and a four-flag rights record
- citations and fact checks
- production credits
- client-safe projection rules
- audit evidence separate from any activity timeline

## Non-scope freeze

R8 does not include:

- R9 publishing, magazine, issue, page, proof, reader, or public binding
- `publication.publish` and every `publish.*` key
- R10 distribution, podcast, video, and event operations
- R11 search, SEO, analytics, and automation
- R12 client-portal pages and every `client.*` key except `approval.client.decide`
- R13 enterprise administration and R14 production certification
- a second authorization system, a second tenant, or a second database
- catalogue, packages, subscriptions, entitlements, refunds, or any new finance command
- credit notes and dormant R7 contract preparation
- a rights marketplace, a generic project-management product, or a workflow-template designer
- email delivery beyond an outbox intent
- binding the existing display-only `/app/projects`, `/app/editorial`, `/app/magazine/projects`, and `/client/projects` pages to production data

Existing visual routes stay display-only.

## Reuse, not a new stack

R8 uses the current PostgreSQL database, Prisma migration chain, `platform.resources`, `platform.idempotency_receipts`, `platform.outbox_events`, and `audit.audit_events`. Commands live under the existing module and `/api/v1/r8` route conventions. Authorization continues through the R5 evaluator. The active stage set is not changed by this freeze.

`platform.resources.project_id` is a nullable column with no foreign key and no project table. It is not a Project. R8 must not treat it as project identity. A production Project gets its own row and its own `resource_id`, following the commercial aggregate pattern.

Person, User Account, Organization Membership, and Project Membership stay four different records. A project member is not a platform role. A credit is not a permission. A client-contact label on a project does not authorize `approval.client.decide`.

## Permission freeze

No new permission key is created by this freeze. The example names in the planning instruction (`questionnaire.send`, `draft.version`, `approval.approve`, `asset.upload`, `workflow.transition`, `milestone.complete`, `task.complete`, `design.start`, and the rest of that list) are not registry keys and must not be added.

These existing keys are the only keys an implementation authorization may activate, and only for the commands in the API matrix:

| Key | Surface | R8 command boundary |
|---|---|---|
| `project.view` | TEAM | Project, milestone, deliverable, and credit reads |
| `project.create` | TEAM | Create one project from an accepted proposal |
| `project.manage` | TEAM | Edit mutable project fields, cancel, milestones, deliverables, credits |
| `project.assign` | TEAM | Add or end a project membership |
| `project.activity.view` | TEAM | Activity projection only. Not audit evidence |
| `workflow.move` | TEAM | The only project lifecycle transition |
| `questionnaire.view` | TEAM | Questionnaire, version, and response reads |
| `questionnaire.edit` | TEAM | Create, generate, send, receive, and lock |
| `task.view` | TEAM | Task and dependency reads |
| `task.edit` | TEAM | Create, edit, assign, and complete a task |
| `draft.view` | TEAM | Editorial work, working draft, and version reads |
| `draft.edit` | TEAM | Create the work, edit the working draft, issue an immutable version |
| `editorial.view` | TEAM | Review, citation, and fact-check reads |
| `editorial.dashboard.view` | TEAM | List projection only |
| `editorial.review` | TEAM | Open a review, comment, request changes, resolve, citation, fact check |
| `editorial.approve` | TEAM | Internal approval of one exact draft version |
| `approval.view` | TEAM | Read client-approval evidence |
| `approval.client.decide` | CLIENT | The only client approve or reject command |
| `file.view` | TEAM | Asset metadata and authorized file reads |
| `file.version` | TEAM | Upload a version, attach it, set rights flags |

These keys stay dormant even where the registry stamp says R8 or R8/R9:

| Key | Why it stays dormant |
|---|---|
| `approval.decide` | A second staff decision would be confused with client approval |
| `approval.override` | No override path is authorized |
| `workflow.template.manage` | One canonical machine. No template product |
| `calendar.view` | Not an editorial production command |
| `design.*` | R9 design and magazine work |
| `publish.*`, `publication.publish`, `magazine.*` | R9 |
| `distribution.*` | R10 |
| `podcast.*`, `video.*`, `event.*` | Not R8. The R8/R9 stamp is not a grant |
| `client.*` except `approval.client.decide` | R12 portal completion |

`approval.client.decide` is the one client command in R8. It does not authorize portal pages.

Implementation must add the registry `audit` obligation to `project.create`, `project.manage`, `questionnaire.edit`, `task.edit`, `draft.edit`, and `file.version` before those commands can be called qualified. This freeze does not edit `registry.ts`.

## Commercial source

`project.create` may bind only a current-tenant Proposal whose current version is `ACCEPTED`, whose client account is live, and whose client organization matches that account. The server re-resolves the proposal, version, account, and client organization. The browser cannot supply tenant, ownership, source, or `ACCEPTED`.

One non-cancelled project exists for one proposal. A cancelled project keeps its history and does not free the proposal for a second project in this release.

Contract, invoice, and payment may be stored later as references. They are not required to create a project, and they cannot by themselves create one. R8 does not mutate commercial or finance rows.

## Workflow freeze

The canonical project states, in order, are:

`PROJECT_CREATED`, `IQ_GENERATED`, `IQ_SENT`, `IQ_RECEIVED`, `DRAFT_GENERATED`, `EDITORIAL_REVIEW`, `CLIENT_REVIEW`, `CLIENT_APPROVAL`, `ASSETS`, `DESIGN_STARTED`, `DESIGN_REVIEW`, `DESIGN_APPROVED`, `PUBLICATION_READY`, `PUBLISHED`, `DISTRIBUTION`, `COMPLETED`.

Two additional states are frozen because the linear spine cannot express them:

- `CLIENT_CHANGES_REQUESTED` — the client rejected an exact version or requested changes. This is not approval.
- `CANCELLED` — terminal. History remains. No further transition is valid.

Valid transitions, the actor, the version binding, and the fail-closed rules are in `PHASE-4-R8-DOMAIN-AND-WORKFLOW.md`. A skipped state fails. A browser-supplied status fails. `COMPLETED` and `CANCELLED` do not reopen.

Design, published, and distribution states do not call an R9 or R10 command.

## Client boundary

Internal production truth is not a client payload. A client request passes authentication, CLIENT membership on the project's client organization, `approval.client.decide`, a server-built resource context, and a field projection. The projection may contain the project title, the client-visible draft version body, the version identity, the requested decision, and the recorded decision. It must not contain internal notes, internal comments, audit rows, rights notes, fact-check notes, other tenants, or assets that are not client-visible.

Client approval records who decided, which draft version, when, and whether the decision was `APPROVED` or `REJECTED`. TEAM authority cannot call it. A rejected version is not approved. A later version requires a new decision.

## Database, security, and acceptance

The database contract, RLS rule, concurrency rule, hostile matrix, defect rule, and qualification sequence are frozen in the companion documents. Qualification is exact-head and hosted. A local build is not qualification. Owner acceptance of the implementation is a later gate. R9 stays locked until that acceptance is merged.

## Gate

This document is G0. Implementation starts only after the owner freezes this contract and sends a separate implementation authorization. Until then, every R8 permission above remains dormant and no `/api/v1/r8` route exists.
