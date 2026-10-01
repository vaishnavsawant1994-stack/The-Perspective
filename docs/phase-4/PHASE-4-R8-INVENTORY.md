# R8 Inventory

Status: **PLANNING INPUT TO P4-R8-G0 — IMPLEMENTATION NOT AUTHORIZED**
Base: `main` `304e696c2f38d5b5af4d48607fdbbfcb5423aece`
Contract: `PHASE-4-R8-G0-FREEZE.md`

This inventory records what already exists and what R8 must add. It grants nothing.

## What R1–R7 already provide

| Existing piece | Reuse in R8 | Must not be reused as |
|---|---|---|
| Organization, membership, role, permission, session | The only identity and tenant authority | A project membership or a credit |
| `platform.resources` | One resource row per production aggregate, as commercial aggregates already do | A Project. `project_id` is not a project |
| `platform.idempotency_receipts` | Claim, payload hash, replay, and conflict | A second receipt store |
| `platform.outbox_events` | Questionnaire send intent | Proof that email was delivered |
| `audit.audit_events` | Security and business evidence | The activity timeline |
| R5 evaluator, field policy, workflow policy, scopes | The only authorization path | A parallel R8 policy engine |
| R6 client account and client organization | The project client binding | A portal session |
| R7 accepted proposal | The only create source | A draft, a deal alone, or a browser status |
| Display-only project and editorial routes | Unbound fixtures | Production API bindings |

There is no project, questionnaire, draft, review, approval, asset, task, milestone, deliverable, citation, or credit table in the operational schema. Mock editorial pages are not records.

## Identity split

```text
Person
  ≠ User Account
  ≠ Organization Membership
  ≠ Project Membership
  ≠ Credit
```

A Person may be named on a credit without holding a login. A project membership names one organization membership and one frozen project role. It does not change `MembershipRole`.

## Registry keys already stamped R8

The registry already contains the keys listed in the G0 permission freeze. They are dormant while the active stage set does not include R8. This inventory does not change that set.

Keys stamped R8 that this G0 refuses to activate are also listed in the freeze: `approval.decide`, `approval.override`, `workflow.template.manage`, and `calendar.view`.

## Keys that look related but belong later

| Keys | Stage stamp | R8 decision |
|---|---|---|
| `design.approve`, `design.cover.view`, `design.cover.edit`, `design.layout.manage` | R9 | Design workflow markers only. No design command |
| `magazine.*`, `publish.*`, `publication.publish` | R9 | Not a publishing engine |
| `distribution.*` | R10 | Not a distribution engine |
| `podcast.*`, `video.*`, `event.*` | R8/R9 | The stamp is not permission to build media |
| `client.project.view`, `client.draft.view`, `client.draft.review`, `client.questionnaire.view`, `client.questionnaire.edit`, `client.asset.view`, `client.asset.upload`, `client.task.view`, `client.task.complete`, `client.approval.view`, `client.design.*` | R12 | Portal completion stays R12 |
| `approval.client.decide` | R8 | The only client command this G0 includes |

## What R8 must define before any code

The domain document defines the entities. The API matrix defines each command. The database contract defines tables, uniqueness, and RLS. The security document defines the attacks those commands must fail.

No route, migration, or permission activation is part of this inventory.
