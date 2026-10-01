# P4-R8-I0 — R8 Implementation Authorization

STATUS: **IMPLEMENTATION AUTHORIZED AGAINST THE ACCEPTED G0 ONLY**
DATE: 1 October 2026
AUTHORIZATION: The owner directed the full R8 working plan, including this separate implementation grant, after G0 acceptance.
G0: `docs/phase-4/PHASE-4-R8-G0-ACCEPTED.md`
G0 PLANNING HEAD: `c56754e4ffa0186ffe54594ba9b5b14c1142d35b`
BRANCH: `phase4/r8-g0-editorial-production-freeze-20261001`
R9: **LOCKED**

## Authorized

Implement only the commands, states, tables, RLS rules, and tests named by the accepted G0 package. Activate only the twenty registry keys the freeze names. Add the missing `audit` obligation on `project.create`, `questionnaire.edit`, `task.edit`, `draft.edit`, and `file.version`. `project.manage` already requires audit.

## Not authorized

No new permission key. No activation of `approval.decide`, `approval.override`, `workflow.template.manage`, `calendar.view`, any `design.*`, `publish.*`, `publication.publish`, `magazine.*`, `distribution.*`, `podcast.*`, `video.*`, `event.*`, or R12 `client.*` key. No client questionnaire route. No publishing engine, distribution provider, media platform, portal pages, second authorization system, or second tenant. `PUBLISHED` and `DISTRIBUTION` remain markers.

Existing R1–R7 behavior stays closed. Display-only project and editorial pages stay unbound.

## Qualification

A local build is not acceptance. The implementation head must pass the R8 exact-head qualification before a checkpoint may call it qualified. Owner acceptance of the implementation and the merge come after that checkpoint, not before.
