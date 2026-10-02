# P4-R11-G0 — ACCEPTED

STATUS: **G0 ACCEPTED — IMPLEMENTATION NOT AUTHORIZED BY THIS FILE**
DATE: 2 October 2026
FREEZE: `docs/phase-4/PHASE-4-R11-G0-FREEZE.md`
FREEZE SHA: `d738a893937ffa12261e48e2375730cd5c5a22b9`
BASE: `65f43283d50903335fabbc0853e1f6c617774042`

The owner's R11 directive required the freeze before implementation. This record accepts that freeze. It does not accept an implementation, and it does not implement R12.

Accepted scope is the freeze: robots for private prefixes, published-issue metadata, a public index rebuilt from the published projection, deduplicated observations, last-touch attribution, server-derived reports, renewal and upsell signals that do not mutate commercial rows, and automation whose only action is `CREATE_GROWTH_SIGNAL`.

Refused scope stays refused: new permission keys, external engagement, multi-touch attribution, commercial mutation, arbitrary automation code, draft indexing, and every R12 portal or subscription surface.

Implementation requires `docs/phase-4/PHASE-4-R11-IMPLEMENTATION-AUTHORIZATION.md` naming this acceptance.
