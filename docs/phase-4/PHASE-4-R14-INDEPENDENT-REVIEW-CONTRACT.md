# R14 independent-review contract

STATUS: **CONTRACT — REVIEW NOT PERFORMED**

Authority: `docs/GOVERNANCE-REVIEW-POLICY.md` section 4.

R14/V1.0 production certification requires a reviewer who is independent of the authoring engineering agent. The owner-approved waiver used for R1–R13 does not apply.

## The reviewer must receive

- this G0 package
- the V1 surface document
- the candidate SHA
- qualification workflow URLs
- the permission registry
- migration and RLS verifier output
- known limitations, including absent providers, absent alerts, and absent production hosting

## The review record, when a real review happens, must include

- reviewer identity
- date
- reviewed full SHA
- scope
- findings with severity
- blockers versus non-blockers
- disposition

Severity labels, if the reviewer does not bring one, are Critical, High, Medium, Low, and Informational. The authoring agent must not downgrade a reviewer finding.

## What does not count

- This file.
- A file written by the same agent that implemented the candidate.
- A GitHub review submitted by `vaishnavsawant1994-stack` on its own pull request.
- A green workflow.
- An owner waiver.

`scripts/certification/verify-r14-claims.mjs` must fail the build if a document claims `v1_certified: true`, `V1.0 CERTIFIED`, or `THE PERSPECTIVE V1.0 COMPLETE` while `docs/release/INDEPENDENT-REVIEW.md` is missing. Presence of that file is necessary and still not sufficient: the workflow must keep printing `v1_certified: false` unless a human process outside this agent has recorded the review. The script must not create the review file.
