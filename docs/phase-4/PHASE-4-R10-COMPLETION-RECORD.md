# P4-R10-C1 — Media, events, and site distribution qualification

STATUS: **P4-R10-C1 — ACCEPTED. NOT MERGED.**

DATE: 2 October 2026

OWNER ACCEPTANCE: the owner's R10 end-to-end directive, after the exact-head gates in this file passed. This is not V1.0 certification and it does not start R11 implementation.

This record does not rewrite the G0 contract. The product behavior it accepts is commit `9e1e1c94cc3fbc05100a357e4419da422fe8b79f`. A later documentation commit that only cites this record is not a new product head.

## Authority

| Record | SHA / reference |
|---|---|
| Previous main | `024e4ae7d3b317fa86fbedc865bf7a44884f5b98` |
| G0 freeze | `ea29ee99d7dfa4fc0bdfa16cea58862688831724` |
| G0 acceptance | `2538ebb394787217e1150a1fe0cf0b3a0a8358f0` |
| Implementation authorization | `f77ee160` — `docs/phase-4/PHASE-4-R10-IMPLEMENTATION-AUTHORIZATION.md` |
| Implementation | `7daaf86` |
| Desk seed repair | `af2e96b` |
| Desk form repair | `9e1e1c94cc3fbc05100a357e4419da422fe8b79f` |
| Qualification head | `9e1e1c94cc3fbc05100a357e4419da422fe8b79f` |
| Pull request | #17 |
| Owner acceptance of this checkpoint | `docs/phase-4/PHASE-4-R10-IMPLEMENTATION-ACCEPTED.md` |

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

Not merged. Acceptance of `9e1e1c9` does not by itself move `main`. Merge waits until the documentation commit that cites this record is itself green on the inherited workflows, and then uses a merge commit. R11 may enter G0 planning only after that merge is recorded. R11 implementation is not authorized by this file.
