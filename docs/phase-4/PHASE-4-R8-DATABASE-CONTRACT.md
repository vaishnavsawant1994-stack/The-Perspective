# R8 Database Contract

Status: **FROZEN WITH P4-R8-G0 — NO MIGRATION IS AUTHORIZED**
Contract: `PHASE-4-R8-G0-FREEZE.md`

## Placement

R8 tables go in a new PostgreSQL schema named `production`, in the existing database. They do not go in `commercial`, `crm`, or a second database. Each aggregate root has:

- `id uuid`
- `resource_id uuid` unique, referencing `platform.resources`
- `owner_organization_id uuid`
- `row_version integer` not null, starting at 1, on mutable roots
- `created_at timestamptz`
- unique `(id, owner_organization_id)`

Child rows carry `owner_organization_id` and a foreign key that includes the owner's id, so a child cannot point at another tenant's parent.

`platform.resources.project_id` stays nullable and without a foreign key in this contract. It is not backfilled. It is not the project key.

The runtime role must not have direct insert, update, or delete on these tables. Mutations go through `SECURITY DEFINER` functions in `production`, same pattern as the R7 invoice and proposal commands. Reads used by HTTP go through tenant-scoped functions or policies that still require the selected organization. RLS is enabled and forced.

## Tables

`production.projects`

- source proposal id, source proposal version id, client account id, client organization id
- state, title, row version
- unique open project per proposal: one partial unique index on `proposal_id` where `state <> 'CANCELLED'`
- check that `state` is one of the frozen states

`production.project_members`

- project id, organization membership id, project role, ended_at
- unique active membership: one partial unique index on `(project_id, membership_id)` where `ended_at` is null
- project role check against the frozen list

`production.project_transitions`

- project id, from state, to state, actor membership id, reason, project row version, occurred_at
- append-only. No update and no delete grant, including to the table owner through the application role
- the transition function inserts this row in the same transaction that updates `projects.state`

`production.milestones`

- project id, kind, completed_at, row version
- unique `(project_id, kind)`

`production.deliverables`

- project id, kind, target type, target id, completed_at, row version
- target id is checked by the command, not trusted from a polymorphic free join across tenants

`production.questionnaires`

- project id, status, current version id nullable, row version
- unique `(project_id)`

`production.questionnaire_versions`

- questionnaire id, version number, body, digest, sent_at
- unique `(questionnaire_id, version_number)`
- update and delete are denied after `sent_at` is not null

`production.questionnaire_responses`

- questionnaire version id, client organization id, body, received_at
- unique `(questionnaire_version_id)`

`production.editorial_works`

- project id
- unique `(project_id)`

`production.drafts`

- work id, body, row version
- unique `(work_id)`

`production.draft_versions`

- draft id, version number, body, digest, issued_at
- unique `(draft_id, version_number)`
- no update and no delete

`production.editorial_reviews`

- draft version id, reviewer membership id, state, row version
- one open review per version: partial unique index where `state = 'OPEN'`

`production.editorial_review_notes`

- review id, author membership id, body, created_at
- append-only

`production.editorial_approvals`

- draft version id, actor membership id, approved_at
- unique `(draft_version_id)`

`production.client_approvals`

- draft version id, actor membership id, client organization id, decision, decided_at
- unique `(draft_version_id)`

`production.assets`

- project id, visibility, present, approved, licensed, cleared, row version
- check: `cleared` implies `approved` and `licensed`
- check: visibility in `INTERNAL`, `CLIENT_VISIBLE`

`production.asset_versions`

- asset id, version number, digest, storage key, byte size
- unique `(asset_id, version_number)`
- storage key is server-generated
- no update and no delete

`production.citations`

- draft version id, source label, locator, created_at
- append-only

`production.fact_checks`

- draft version id, status, reviewer membership id, note, recorded_at
- status in `UNVERIFIED`, `VERIFIED`, `DISPUTED`
- a later fact check inserts a new row. It does not overwrite the prior row

`production.credits`

- project id, person id, credit role
- unique `(project_id, person_id, credit_role)`
- credit role check against the frozen list

`production.tasks`

- project id, milestone id nullable, assignee membership id nullable, title, priority, due date, status, row version
- status in `OPEN`, `BLOCKED`, `COMPLETED`, `CANCELLED`

`production.task_dependencies`

- task id, blocker task id
- both tasks must share the project. The command checks that. A check constraint also rejects `task_id = blocker_task_id`
- unique `(task_id, blocker_task_id)`

## RLS

Every table has `ENABLE` and `FORCE ROW LEVEL SECURITY`. The policy expression matches `owner_organization_id` to the transaction setting `app.organization_id`, the same setting R7 uses. A missing setting matches nothing. The definer functions that mutate set the organization and still re-check the row's organization inside the function.

Cross-schema writes are denied. A production function must not update `commercial` proposal, contract, invoice, payment, or ledger rows.

## Migration rule

The implementation authorization, when it exists, adds one migration chain from the then-current head. `prisma migrate diff` must report no drift. Existing R2 through R7 migrations are not edited. Rollback of a failed command leaves no project, version, transition, approval, asset, or completed receipt.
