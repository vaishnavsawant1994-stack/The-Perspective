# P4-R8-G0 ACCEPTED

STATUS: **OWNER ACCEPTED AS THE PLANNING CONTRACT — IMPLEMENTATION NOT AUTHORIZED BY THIS FILE**
DATE: 1 October 2026
BRANCH: `phase4/r8-g0-editorial-production-freeze-20261001`
G0 COMMIT REVIEWED: `c56754e4ffa0186ffe54594ba9b5b14c1142d35b`
PARENT: `main` `304e696c2f38d5b5af4d48607fdbbfcb5423aece`
PLANNING AUTHORIZATION: 1 October 2026

The owner directed completion of the R8 working plan, including this G0 acceptance, after the six planning documents were checked against R1–R7. This file accepts the planning contract. It does not authorize implementation. That grant is only `PHASE-4-R8-IMPLEMENTATION-AUTHORIZATION.md`.

## Accepted package

- `PHASE-4-R8-G0-FREEZE.md` is the controlling contract.
- `PHASE-4-R8-INVENTORY.md`
- `PHASE-4-R8-DOMAIN-AND-WORKFLOW.md`
- `PHASE-4-R8-API-OPERATION-MATRIX.md`
- `PHASE-4-R8-DATABASE-CONTRACT.md`
- `PHASE-4-R8-SECURITY-AND-QUALIFICATION.md`

## Review result

The package already states that the G0 document itself does not authorize implementation. It reuses the R5 authorization chain, PostgreSQL, RLS, idempotency receipts, outbox, and audit. It does not add a permission key. It leaves `approval.decide`, `approval.override`, `workflow.template.manage`, `calendar.view`, design, publishing, distribution, media, and R12 portal keys dormant. Client questionnaire submission stays `client.questionnaire.edit` at R12. `PUBLISHED` and `DISTRIBUTION` are markers.

The conceptual names in the execution note (`QUESTIONNAIRE_PENDING`, `CLIENT_APPROVED`, `DESIGN`) are not a rename. The frozen states remain `IQ_GENERATED`, `IQ_SENT`, `IQ_RECEIVED`, `DRAFT_GENERATED`, `CLIENT_APPROVAL`, `DESIGN_STARTED`, `DESIGN_REVIEW`, and `DESIGN_APPROVED`, plus `CLIENT_CHANGES_REQUESTED` and `CANCELLED`.

`iam.people` has no organization column. A credit may name an existing person. It does not create a tenant or a permission. Asset visibility stays the frozen text pair `INTERNAL` and `CLIENT_VISIBLE`. It does not reuse `platform.Visibility`, which has different labels.

## R9

R9 stays locked. This acceptance does not unlock it.
