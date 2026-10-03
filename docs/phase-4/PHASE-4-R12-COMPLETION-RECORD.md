# P4-R12-C1 — Client portal and member platform qualification

STATUS: **P4-R12-C1 — ACCEPTED AND MERGED.**

DATE: 3 October 2026

OWNER ACCEPTANCE: the owner's R12 directive, after the exact-head gates in this file passed. This is not V1.0 certification and it does not start R13 implementation.

The product behavior this record accepts is `e71a11fd3f96ce657781c7ff2d6dd78e5d460013`. A later documentation commit that only cites this record is not a new product head.

## Authority

| Record | SHA / reference |
|---|---|
| Previous main | `c6b928d4b159cc66eb768ad10be4a4ef9b1aea7a` |
| G0 freeze | `78a21b1e3be8554f1212b3f54e7dbc334cfeecff` |
| G0 acceptance | `4a12adff04b49efd9d4ad91b6c80dd6ee3a21003` |
| Implementation authorization | `c21368fc1b74a6814cdeb238792030bd87d1761b` — `docs/phase-4/PHASE-4-R12-IMPLEMENTATION-AUTHORIZATION.md` |
| Qualification head | `e71a11fd3f96ce657781c7ff2d6dd78e5d460013` |
| Pull request | #21 |
| Owner acceptance | `docs/phase-4/PHASE-4-R12-IMPLEMENTATION-ACCEPTED.md` |

## What passed on `e71a11fd3f96ce657781c7ff2d6dd78e5d460013`

GitHub Actions, `ubuntu-latest`, PostgreSQL 16 (`postgres:16`). There is no separate production deploy of this SHA.

| Workflow | Result | Run |
|---|---|---|
| R3 Review Qualification | success | [37102654085](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654085) |
| R3 Browser Qualification | success | [37102654098](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654098) |
| R4 Tenancy Qualification | success | [37102654106](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654106) |
| R4 Browser Qualification | success | [37102654150](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654150) |
| R5 Contract Enhanced Qualification | success | [37102654122](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654122) |
| R5 Implementation Qualification | success | [37102654097](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654097) |
| R5 Browser Qualification | success | [37102654115](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654115) |
| R6 Implementation Qualification | success | [37102654100](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654100) |
| R7 Implementation Qualification | success | [37102654132](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654132) |
| R8 Implementation Qualification | success | [37102654111](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654111) |
| R9 Implementation Qualification, `qualify` and `reader` | success | [37102654089](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654089) |
| R10 Implementation Qualification, `qualify` and `desk` | success | [37102654063](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654063) |
| R11 Implementation Qualification, `qualify` and `desk` | success | [37102654087](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654087) |
| R12 Implementation Qualification, `qualify` and `desk` | success | [37102654136](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102654136) |

R12 `qualify`: `r12_verified: true`, `runtime_bypass_rls: false`, drift **No difference detected**, unit tests **73 files / 607 passed**, live PostgreSQL tests **34 files / 249 passed**, lint, typecheck, production build, and `npm audit --omit=dev --audit-level=high` reported **0 vulnerabilities**. Desk job `111145085437` succeeded (`R12 desk qualification passed`).

`npm ci` still reports 7 high findings in the development tree. The production audit is the release gate. Dependabot findings on the default branch are outside that gate.

## Accepted surface

Client portal grants (invite, one-time hashed accept, revoke) bound to one commercial client account. Client reads of dashboard counts, project title and coarse status, approval version identity, non-draft invoice summaries, and signature-ready contract summaries. Client decisions only `APPROVED` or `REJECTED`, bound to the exact draft version through `production.r8_execute`. Member identity reuses the existing user. Member profile rename. Offers and checkout attempts that fail closed as `PROVIDER_UNAVAILABLE` and do not write `commercial.subscriptions`. Manual entitlements, granted only by the worker token, for published or archived issues. Member library and issue reads limited to that member. UI at `/client/desk` and `/my-perspective/library` only.

Activated read keys: `client.dashboard.view`, `client.project.view`, `client.approval.view`, `client.billing.view`, `client.contract.view`. Inherited unchanged: `client.portal.provision`, `client.portal.manage`, `approval.client.decide`. No new permission key.

## Still locked

`client.billing.pay`, `client.contract.sign`, `client.invite.accept`, and the other dormant `client.*` keys. No external payment provider. No webhook. No second subscription ledger. Fixture client and member screens other than the two routes above are not replaced. Personal Magazines are not the member library. No notification engine. No R13 admin, settings, storage, audit tooling, AI, backup, or deployment work. V1.0 is not certified. Open pull requests #8 and #10 are not part of this acceptance.

## Merge

Pull request #21 was merged with a merge commit on 3 October 2026: `c8a2351343d46f504b5831e9b28d8e71ce5c18aa`. It was not squashed. First parent `c6b928d4b159cc66eb768ad10be4a4ef9b1aea7a`. Second parent `7d85b452a34210279bcc800ab3bbb1c52260f7f9`.

`7d85b45` contains no product-code change after `e71a11f`. The inherited workflows were green again on that documentation head before the merge, including [R12 Implementation Qualification](https://github.com/vaishnavsawant1994-stack/The-Perspective/actions/runs/37102964028). The product qualification remains the `e71a11f` table above. The permanent merged note is `docs/phase-4/PHASE-4-R12-ACCEPTED-MERGED.md`.

R13 may enter G0 planning. The unlock is `docs/phase-4/PHASE-4-R13-G0-PLANNING-UNLOCK.md`. R13 implementation is not authorized. V1.0 is not certified.
