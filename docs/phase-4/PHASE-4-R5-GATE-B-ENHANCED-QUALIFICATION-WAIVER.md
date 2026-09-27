# Phase 4 — R5 Gate-B Enhanced Qualification Waiver

**Record:** P4-R5-GATE-B-WAIVER-01  
**Date:** September 27, 2026  
**Program policy:** `GOV-REVIEW-01` merged on `main@1d4e387a9f9a6d43274bd0b05e175f49b8bf0718`  
**Substantive Gate-A package:** `99bb2ba1f94a9007314f208f7830553c231db700`  
**Gate-A approval/control head:** `58f74d0095c4f94207b293c917b1ce1dd4244d7f`  
**Independent external review:** NOT PERFORMED  
**Independent-review requirement:** OWNER-WAIVED under GOV-REVIEW-01  
**Replacement control:** ENHANCED QUALIFICATION  
**R5 implementation:** NOT AUTHORIZED  
**PR #4 merge:** NOT AUTHORIZED  
**R6+:** NOT AUTHORIZED

## 1. Owner waiver decision

The owner explicitly approved the following governance change:

> I approve replacing the mandatory independent-review requirement for R1–R13 with an Owner-Approved Enhanced Qualification Waiver. Apply that waiver to R5 Gate B. Independent external review remains recommended and remains mandatory for R14/V1.0 production certification.

This record applies that owner-approved waiver specifically to R5 Gate B.

Canonical waiver declaration:

```text
Independent external review: NOT PERFORMED
Independent-review requirement: OWNER-WAIVED under GOV-REVIEW-01
Replacement control: ENHANCED QUALIFICATION
R5 implementation: NOT AUTHORIZED
```

## 2. What is waived

Only the dependency on a separate external reviewer for R5 contract Gate B is waived.

The repository must continue to record the factual review state accurately:

- independent GitHub reviews: 0 unless a real review is later submitted;
- authoring-agent adversarial audits are not independent reviews;
- CI is not an independent review;
- owner approval is not an independent review.

## 3. What is not waived

The waiver does not remove:

- Gate-A owner-approved role/permission governance;
- adversarial/falsification review;
- threat-model coverage;
- blocking/high findings closure;
- exact-head qualification;
- R3/R4 regressions;
- contract consistency validation;
- P4-R5-G0 freeze;
- separate owner implementation authorization;
- implementation attack testing;
- P4-R5-C1 acceptance;
- R14/V1.0 mandatory external independent review.

## 4. R5 enhanced replacement gate

Before P4-R5-G0 may be frozen, R5 must satisfy all of the following on one exact contract candidate SHA:

1. Gate-A approved package remains intact;
2. authoring-agent adversarial review is reconciled after Gate-A approval;
3. a second enhanced adversarial/falsification audit is completed;
4. all BLOCKING/HIGH contract findings are closed or explicitly owner-accepted;
5. all 60 threat-model cases remain mapped to a control and planned negative test;
6. 170-key permission registry passes machine consistency validation;
7. 17 launch roles and 17 bundles pass machine consistency validation;
8. Team/Client/SELF assignability separation passes;
9. role-scope compatibility passes;
10. R01/R02 delegation ceilings and no-cross-tenant rule remain explicit;
11. R17/client capability-role separation passes;
12. no R6+ implementation or Design 154 appears in the contract branch;
13. R3 Core and Browser regressions pass;
14. R4 Core and Browser regressions pass;
15. dedicated R5 contract enhanced-qualification workflow passes;
16. exact candidate SHA and workflow IDs are recorded;
17. owner separately accepts the frozen P4-R5-G0 contract before implementation.

## 5. Required disposition

If the enhanced audit finds a substantive defect:

- repair the contract;
- create a new candidate SHA;
- rerun affected qualification;
- rerun the enhanced contract gate;
- update findings closure.

If no BLOCKING/HIGH findings remain and all exact-head gates are green, P4-R5-G0 may be prepared for owner freeze acceptance.

## 6. R14 exception

This waiver cannot be reused for R14/V1.0 final production certification.

R14/V1.0 requires genuine external independent review under `GOV-REVIEW-01`.
