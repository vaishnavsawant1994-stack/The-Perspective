# P4-R10-C1 — Media, events, and site distribution qualification

STATUS: **P4-R10-C1 — ACCEPTED AND MERGED.**

DATE: 2 October 2026

OWNER ACCEPTANCE: the owner's R10 end-to-end directive, after the exact-head gates in this file passed. This is not V1.0 certification and it does not start R11 implementation.

This record does not rewrite the G0 contract. The product behavior it accepts is commit `9e1e1c94cc3fbc05100a357e4419da422fe8b79f`. A later documentation commit that only cites this record is not a new product head.

## Authority

| Record | SHA / reference |
|---|---|
| Previous main | `024e4ae7d3b317fa86fbedc865bf7a44884f5b98` |
| G0 freeze | `ea29ee99d7dfa4fc0bdfa16cea58862688831724` |
| G0 acceptance | `2538ebb394787217e1150a1fe0cf0b3a0a8358f0` |
| Implementation authorization | `f77ee160b1b32ef151115ce2301ea5088768ab56` — `docs/phase-4/PHASE-4-R10-IMPLEMENTATION-AUTHORIZATION.md` |
| Implementation | `7daaf86b7ed53d8ba37d4920d099be07e2fe32cc` |
| Desk seed repair | `af2e96ba50e4b4769a7ca8a86e398b8484c3fa69` |
| Desk form repair | `9e1e1c94cc3fbc05100a357e4419da422fe8b79f` |
| Qualification head | `9e1e1c94cc3fbc05100a357e4419da422fe8b79f` |
| Pull request | #17 |
| Owner acceptance of this checkpoint | `docs/phase-4/PHASE-4-R10-IMPLEMENTATION-ACCEPTED.md` |
| Acceptance head merged by pull request #17 | `a88e11c870522914f599eb5b6b7f7e2e8741b06b` |
| Closure merge | Pull request #17, `289abd9f4258464fc294407e37d4e9f88cb68f01` |

`af2e96b` and `9e1e1c9` repair the qualification harness. They do not change the frozen command contract.

## What passed on `9e1e1c9` before acceptance

GitHub Actions, `ubuntu-latest`, PostgreSQL 16 service image (`postgres:16`). These runs authorize acceptance. There is no separate production deploy of this SHA.

| Workflow | Result | Run |
|---|---|---|
| R3 Review Qualification | success | [37038509229](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509229) |
| R3 Browser Qualification | success | [37038509167](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509167) |
| R4 Tenancy Qualification | success | [37038509233](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509233) |
| R4 Browser Qualification | success | [37038509130](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509130) |
| R5 Contract Enhanced Qualification | success | [37038509214](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509214) |
| R5 Implementation Qualification | success | [37038509215](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509215) |
| R5 Browser Qualification | success | [37038510331](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038510331) |
| R6 Implementation Qualification | success | [37038509293](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509293) |
| R7 Implementation Qualification | success | [37038509134](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509134) |
| R8 Implementation Qualification | success | [37038509275](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509275) |
| R9 Implementation Qualification, `qualify` and `reader` | success | [37038509196](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509196) |
| R10 Implementation Qualification, `qualify` and `desk` | success | [37038509164](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37038509164) |

R10 `qualify` on that run: migrations applied, `db:verify` reported `r10_verified: true` with `runtime_bypass_rls: false`, `db:drift` reported **No difference detected**, unit tests **71 files / 599 passed**, live PostgreSQL tests **30 files / 237 passed**, lint, typecheck, production build, and `npm audit --omit=dev --audit-level=high` reported **0 vulnerabilities**. The desk job printed `R10 desk qualification passed`.

`npm install` still reports 2 high findings in the development dependency tree. The production audit above is the release gate. Those development findings are outside this acceptance.

## Scope that this qualification covers

Podcast shows, episodes, guests, review, and schedule. Video projects through review, schedule, and exact-version prepare. Events, agenda items, participants, and team-recorded registrations. Distribution campaigns, site or external targets, and items. One launch that writes delivery evidence only for a published or archived R9 issue on the internal SITE channel, using the server-derived URL `/magazine/read/{slug}`. A public read of that verified URL. A worker that cannot forge delivery. Team desks that create and list and do not grant authority by being opened.

`distribution.launch` does not call `publication.publish` and does not change `production.projects.state`.

## Security evidence in those tests

Anonymous, invalid, and expired desk sessions are rejected. A membership without the command key cannot launch. Cross-tenant ids are concealed. Browser fields that name the actor, tenant, URL, or state are rejected. An external target cannot be marked delivered. A missing trusted provider returns fail-closed. The same idempotency key replays; a changed payload conflicts. Two live sessions produce one SITE delivery. A colliding audit rolls the launch back. The runtime role cannot insert past RLS. The public delivery read does not return a secret. Recent authentication older than the R6 window is denied.

## Intentionally not a second product surface

The frozen command surface is `/api/v1/r10`. The four desks can create a draft and list records the membership is allowed to see. Opening a desk does not grant `distribution.launch`. Launch, review, schedule, and the other frozen commands stay on the named API.

## Still locked

`analytics.distribution.view`, `report.*`, `renewal.*`, `publish.execute`, `magazine.reader.publish`, and every `client.*` key stay dormant. No new permission key was added. No external provider was marked successful. R11 search, SEO, analytics, reporting, automation, and renewal are not implemented. R12 portal replacement of fixture media pages is not implemented. V1.0 is not certified. Open pull requests #8 and #10 are not part of this acceptance.

## Merge

Pull request #17 was merged with a merge commit on 2 October 2026: `289abd9f4258464fc294407e37d4e9f88cb68f01`. It was not squashed. First parent `024e4ae7d3b317fa86fbedc865bf7a44884f5b98`. Second parent `a88e11c870522914f599eb5b6b7f7e2e8741b06b`.

`a88e11c` contains no product-code change after `9e1e1c9`. The twelve workflows were green again on that documentation head before the merge. Those runs authorized the merge. They do not replace the product table above.

| Workflow on `a88e11c` | Result | Run |
|---|---|---|
| R3 Review Qualification | success | [37062061098](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061098) |
| R3 Browser Qualification | success | [37062061060](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061060) |
| R4 Tenancy Qualification | success | [37062061539](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061539) |
| R4 Browser Qualification | success | [37062061032](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061032) |
| R5 Contract Enhanced Qualification | success | [37062061033](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061033) |
| R5 Implementation Qualification | success | [37062060937](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062060937) |
| R5 Browser Qualification | success | [37062061011](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061011) |
| R6 Implementation Qualification | success | [37062060999](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062060999) |
| R7 Implementation Qualification | success | [37062061038](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061038) |
| R8 Implementation Qualification | success | [37062061002](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061002) |
| R9 Implementation Qualification | success | [37062061013](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061013) |
| R10 Implementation Qualification | success | [37062061009](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37062061009) |

The permanent merged note is `docs/phase-4/PHASE-4-R10-ACCEPTED-MERGED.md`.

R11 may enter G0 planning. The unlock is `docs/phase-4/PHASE-4-R11-G0-PLANNING-UNLOCK.md`. R11 implementation is not authorized. V1.0 is not certified.
