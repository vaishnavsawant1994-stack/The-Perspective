# P4-R9-C1 — Publishing and magazine qualification

STATUS: **P4-R9-C1 — ACCEPTED AND MERGED.**

DATE: 2 October 2026

OWNER ACCEPTANCE: the owner’s R1–R9 closure directive, after the exact-head gates in this file passed. This is not V1.0 certification and it does not start R10.

The merge below is the closure merge. It does not rewrite the G0 contract.

## Authority

| Record | SHA / reference |
|---|---|
| G0 freeze | `ba0ebd914a8a95fefea7fe8aeabb536158f87705` |
| Implementation authorization | `docs/phase-4/PHASE-4-R9-IMPLEMENTATION-AUTHORIZATION.md` |
| Owner acceptance of this checkpoint | `docs/phase-4/PHASE-4-R9-IMPLEMENTATION-ACCEPTED.md` |
| R9 implementation merge | Pull request #13, `7cd38065610f7bac0d91c93eb75feff69b20e865` |
| Runtime qualification head | `6c294c016c93163720bb8c20e11c31bedf3e4175` |
| Evidence head (docs-only child of the runtime head) | `0eac350c0dca690357c4e43b6e03be64d8d4c251` |
| Acceptance head merged by pull request #15 | `3dafe22c8bb1be6546205079623200160c352a12` |
| Closure merge | Pull request #15, `a54c0fb5c7ac02be6c5c6225af5529456369c291` |
| Closure pull request | #15, base `7cd38065610f7bac0d91c93eb75feff69b20e865` |

The #13 merge put the implementation on `main`. It was not, by itself, the R1–R9 qualification. `0eac350` contains no product-code change after `6c294c0`. `3dafe22` contains no product-code change after `0eac350`. Pull request #15 merged `3dafe22` into `main` as `a54c0fb5c7ac02be6c5c6225af5529456369c291`. First parent `7cd38065610f7bac0d91c93eb75feff69b20e865`. Second parent `3dafe22c8bb1be6546205079623200160c352a12`.

## What passed on `3dafe22` before that merge

GitHub Actions, `ubuntu-latest`, PostgreSQL 16 service image (`postgres:16`). These are the runs that authorized the merge. There is no separate production deploy of this SHA.

| Workflow | Result | Run |
|---|---|---|
| R3 Review Qualification | success | [36982202816](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202816) |
| R3 Browser Qualification | success | [36982202866](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202866) |
| R4 Tenancy Qualification | success | [36982202908](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202908) |
| R4 Browser Qualification | success | [36982202840](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202840) |
| R5 Contract Enhanced Qualification | success | [36982202912](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202912) |
| R5 Implementation Qualification | success | [36982202820](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202820) |
| R5 Browser Qualification | success | [36982202930](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202930) |
| R6 Implementation Qualification | success | [36982202910](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202910) |
| R7 Implementation Qualification | success | [36982202834](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202834) |
| R8 Implementation Qualification | success | [36982202823](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202823) |
| R9 Implementation Qualification, `qualify` and `reader` | success | [36982202808](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36982202808) |

R9 `qualify` on that run: migrations applied, `db:drift` reported no difference, unit tests **70 files / 596 passed**, live PostgreSQL tests **28 files / 226 passed**, lint, typecheck, production build, and `npm audit --omit=dev --audit-level=high` reported **0 vulnerabilities**. The reader job printed `R9 reader qualification passed`.

## What passed on `0eac350`

GitHub Actions, `ubuntu-latest`, PostgreSQL 16 service image (`postgres:16`). That is this repository’s hosted qualification environment. There is no separate production deploy of this SHA.

| Workflow | Result | Run |
|---|---|---|
| R3 Review Qualification | success | [36981264327](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264327) |
| R3 Browser Qualification | success | [36981264432](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264432) |
| R4 Tenancy Qualification | success | [36981264483](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264483) |
| R4 Browser Qualification | success | [36981264404](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264404) |
| R5 Contract Enhanced Qualification | success | [36981264394](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264394) |
| R5 Implementation Qualification | success | [36981264530](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264530) |
| R5 Browser Qualification | success | [36981264381](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264381) |
| R6 Implementation Qualification | success | [36981264634](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264634) |
| R7 Implementation Qualification | success | [36981264374](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264374) |
| R8 Implementation Qualification | success | [36981264410](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264410) |
| R9 Implementation Qualification, `qualify` | success | [36981264398](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36981264398) |
| R9 Implementation Qualification, `reader` | success | same run, job `110756090929` |

R9 `qualify` on that run: migrations applied, `db:verify`, `db:drift` reported no difference, unit tests **70 files / 596 passed**, live PostgreSQL tests **28 files / 226 passed**, lint, typecheck, production build, and `npm audit --omit=dev --audit-level=high` reported **0 vulnerabilities**. The reader job passed `scripts/publishing/verify-r9-reader.mjs` against the production server and printed `R9 reader qualification passed`.

The same twelve workflows were already green on runtime head `6c294c0` (runs 36980668330 through 36980668436, R9 run [36980668351](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668351)). `0eac350` re-ran them after the evidence note. Those earlier runs are not a substitute for the table above.

## What passed on the runtime head, and is unchanged at `0eac350`

PostgreSQL roles used by the database tests remain `NOSUPERUSER` and `NOBYPASSRLS`. The reader script checks mobile 390×844 and desktop 1280×900, including the unpublished-slug 404, ArrowLeft/ArrowRight, next page, thumbnails, zoom, and the fullscreen control.

## Scope that this qualification covers

Publishing ledger, issues, assembly, placements, cover and design state, preparation, readiness, scheduling, publication, immutable snapshots, public projection, the existing magazine reader, personal shelves, and sponsored-placement rights through the existing `file.version` key. `publication.publish` does not call `workflow.move` and does not change `production.projects.state`.

## Security evidence in those tests

Anonymous, invalid, and expired desk sessions are rejected. A reader, a client membership, and the dormant keys `magazine.reader.publish` and `publish.execute` cannot publish. Cross-origin mutation is rejected. Browser fields `actor`, `ready`, and `organizationId` are rejected. A draft cannot be marked ready, published, archived, or scheduled in the past. A foreign issue id is concealed. An unpublished slug is absent from the public issue route. The same idempotency key replays; a changed payload conflicts. The due worker fails closed without its token. The database suite covers one snapshot under two live publish sessions, a later draft that does not change the published body, and a due schedule whose clearance was removed: no snapshot, and the issue returns to `ISSUE_READY`.

One inherited repair is included and was not used to weaken an assertion. `createDeal` retries a serializable conflict when `sourceLeadId` is set, so two sessions still produce one canonical deal. R4 Tenancy Qualification passed on `0eac350` with that assertion intact.

## Intentionally not a second product surface

The frozen contract’s command surface is `/api/v1/r9`. The publishing desk page can create a draft and list issues the membership is allowed to see. Opening it does not grant publisher. Assembly, scheduling, publication, archive, and the other frozen commands stay on the named API. That is the contract surface, not a missing release gate.

## Still locked

`magazine.reader.publish` and `publish.execute` stay dormant. No new permission key was added. R10 distribution, checkout, portal expansion, and any other R10 application are not implemented. V1.0 is not certified. Open pull requests #8 and #10 are not part of this acceptance.

## Merge

Pull request #15 was merged with a merge commit on 2 October 2026: `a54c0fb5c7ac02be6c5c6225af5529456369c291`. It was not squashed. Pull request #14 was not given its own merge onto `main`. GitHub marked #14 merged because its head `e423841f2e4dab5b1bc08e952d6e0eeb65cb9871` is already contained in #15. The red R4 run on that earlier documentation head is superseded by the green R4 run on `3dafe22`. Open pull requests #8 and #10 are not part of this acceptance.

R10 may enter G0 planning only after this record. R10 implementation is not authorized.
