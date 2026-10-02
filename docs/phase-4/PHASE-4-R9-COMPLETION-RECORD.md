# P4-R9-C1 — Publishing and magazine qualification

STATUS: **QUALIFIED ON THE RUNTIME HEAD BELOW. NOT YET THE MERGED ACCEPTANCE COMMIT.**

This file records evidence that already exists. It does not rewrite the G0 contract. R10 is not started.

## Authority

| Record | SHA / reference |
|---|---|
| G0 freeze | `ba0ebd914a8a95fefea7fe8aeabb536158f87705` |
| Implementation authorization | `docs/phase-4/PHASE-4-R9-IMPLEMENTATION-AUTHORIZATION.md` |
| R9 implementation merge | Pull request #13, `7cd38065610f7bac0d91c93eb75feff69b20e865` |
| Runtime qualification head | `6c294c016c93163720bb8c20e11c31bedf3e4175` |
| Closure pull request | #15 |

The #13 merge put the implementation on `main`. It was not, by itself, the R1–R9 qualification. The runtime head above is that qualification candidate.

## What passed on `6c294c0`

GitHub Actions, `ubuntu-latest`, PostgreSQL 16 service image. That is the repository's hosted qualification environment. There is no separate production deploy of this SHA.

| Workflow | Result | Run |
|---|---|---|
| R3 Review Qualification | success | [36980668384](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668384) |
| R3 Browser Qualification | success | [36980668409](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668409) |
| R4 Tenancy Qualification | success | [36980668334](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668334) |
| R4 Browser Qualification | success | [36980668341](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668341) |
| R5 Contract Enhanced Qualification | success | [36980668397](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668397) |
| R5 Implementation Qualification | success | [36980668332](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668332) |
| R5 Browser Qualification | success | [36980668340](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668340) |
| R6 Implementation Qualification | success | [36980668330](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668330) |
| R7 Implementation Qualification | success | [36980668421](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668421) |
| R8 Implementation Qualification | success | [36980668436](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668436) |
| R9 Implementation Qualification, `qualify` | success | [36980668351](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/36980668351) |
| R9 Implementation Qualification, `reader` | success | same run, reader job |

R9 `qualify` on that run: migrations applied, `db:verify`, `db:drift`, unit tests **70 files / 596 passed**, live PostgreSQL tests **28 files / 226 passed**, lint, typecheck, production build, and production dependency audit. The reader job passed `scripts/publishing/verify-r9-reader.mjs` against the production server at mobile 390×844 and desktop 1280×900, including the unpublished-slug 404, ArrowLeft/ArrowRight, next page, thumbnails, zoom, and fullscreen control. PostgreSQL roles used by the database tests remain `NOSUPERUSER` and `NOBYPASSRLS`.

## Scope that this qualification covers

Publishing ledger, issues, assembly, placements, cover, preparation, readiness, scheduling, publication, immutable snapshots, public projection, the existing magazine reader, personal shelves, and sponsored-placement rights through `file.version`. `publication.publish` does not move the R8 project state.

## Security evidence in those tests

Anonymous, invalid, and expired desk sessions are rejected. A reader, a client membership, and the dormant keys `magazine.reader.publish` and `publish.execute` cannot publish. Cross-origin mutation is rejected. Browser fields `actor`, `ready`, and `organizationId` are rejected. A draft cannot be marked ready, published, archived, or scheduled in the past. A foreign issue id is concealed. An unpublished slug is absent from the public issue route. The same idempotency key replays; a changed payload conflicts. The due worker fails closed without its token. The earlier database suite on this head still covers one snapshot under two live publish sessions, a later draft that does not change the published body, and a due schedule whose clearance was removed.

## Intentionally not a second product surface

The frozen contract's command surface is `/api/v1/r9`. The publishing desk page can create a draft and list issues the membership is allowed to see. It does not grant publisher by being opened, and it is not a second authority system. Assembly, scheduling, publication, and archive remain the named API commands.

## Still locked

`magazine.reader.publish` and `publish.execute` stay dormant. R10 distribution is not implemented. V1.0 is not certified.

## Acceptance

Do not read this file as `P4-R9-C1 — ACCEPTED` until the closure commit that contains it has the same required workflows green and is merged. Pull request #14 is documentation that this branch already contains; it must not be merged separately.
