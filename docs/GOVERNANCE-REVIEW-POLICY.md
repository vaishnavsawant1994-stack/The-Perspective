# The Perspective — Review Governance Amendment

**Record:** GOV-REVIEW-01  
**Date:** September 27, 2026  
**Baseline:** `main@3e9418deb42c449cf3ae97da85a076e51c9c9089`  
**Status:** OWNER-APPROVED GOVERNANCE AMENDMENT  
**Applies to:** R1–R13 stage-gate review requirements  
**Does not weaken:** exact-head qualification, security testing, owner acceptance, R14/V1.0 external review

## 1. Owner decision

The owner approved the following governance change:

> I approve replacing the mandatory independent-review requirement for R1–R13 with an Owner-Approved Enhanced Qualification Waiver. Apply that waiver to R5 Gate B. Independent external review remains recommended and remains mandatory for R14/V1.0 production certification.

This is a governance change, not a claim that an independent review occurred.

## 2. New R1–R13 review rule

For R1–R13, a stage that otherwise requires independent external review may satisfy that review gate in one of two ways:

### Path A — Independent Review

A genuinely separate reviewer performs the required review and submits findings/approval tied to an exact reviewed SHA.

### Path B — Owner-Approved Enhanced Qualification Waiver

The owner may explicitly waive the independent-review requirement for that stage.

The waiver is valid only when all of the following are true:

1. the owner identifies the exact stage/gate being waived;
2. the owner explicitly states that no independent review is being claimed;
3. the contract/design/code under review has already undergone an adversarial authoring-agent review;
4. blocking/high findings from that review are resolved or explicitly accepted by the owner;
5. negative security/falsification tests appropriate to the stage are defined and executed;
6. exact-head automated qualification is green;
7. browser/real-user qualification is included where relevant;
8. database/migration/tenant checks are included where relevant;
9. the waiver and replacement evidence are permanently recorded;
10. a separate owner acceptance/freeze/implementation authorization remains required where the release contract calls for it.

The waiver replaces only the independent reviewer dependency. It does not waive technical or owner gates.

## 3. Enhanced qualification minimum

When Path B is used, the replacement evidence must include, as applicable:

- adversarial contract/code audit;
- explicit threat/failure matrix;
- positive and negative authorization/security tests;
- cross-tenant/IDOR tests;
- field/projection and direct-API bypass tests;
- stale-authority/revocation/TOCTOU tests where relevant;
- unit/service/API/database tests;
- browser/E2E tests;
- migration verification and drift checks;
- dependency/security checks;
- lint and strict TypeScript;
- production build;
- exact-head workflow evidence;
- documented findings closure;
- explicit owner acceptance of the waiver outcome.

A stage may define stricter replacement evidence.

## 4. R14 / V1.0 exception

The waiver is not available for R14 final production certification.

R14/V1.0 requires genuine external independent review as part of production-readiness certification.

That review must be performed by a reviewer who is independent from the authoring engineering agent and must cover the final production candidate.

R14 may add multiple independent reviewers or specialized security review if warranted.

## 5. No retroactive fiction

Historical stages remain recorded exactly as they occurred.

This amendment does not:

- convert an authoring-agent audit into an independent review;
- claim that a skipped historical review occurred;
- rewrite existing GitHub review counts;
- invalidate previously accepted R1–R4 evidence;
- authorize any currently locked implementation by itself.

Where a prior stage was accepted under an earlier rule, its historical record remains unchanged.

## 6. Required waiver record

Every future R1–R13 use of Path B must record:

- stage/gate;
- owner waiver statement;
- exact substantive candidate SHA;
- exact qualification/control SHA if different;
- authoring/adversarial audit reference;
- required enhanced-qualification matrix;
- workflow IDs/results;
- findings and closure;
- final stage disposition.

The record must state explicitly:

```text
Independent external review: NOT PERFORMED
Independent-review requirement: OWNER-WAIVED under GOV-REVIEW-01
Replacement control: ENHANCED QUALIFICATION
```

## 7. R5 application

The owner has explicitly directed that this policy be applied to R5 Gate B.

The R5 waiver does not by itself freeze P4-R5-G0 or authorize implementation.

R5 must still complete its stage-specific enhanced qualification, close all blocking/high findings, establish an exact frozen contract SHA, and receive separate owner implementation authorization.

## 8. Governing principle

For R1–R13:

```text
Independent review
        OR
Owner-approved enhanced qualification waiver
```

For R14/V1.0:

```text
Independent external review
        REQUIRED
```

This amendment preserves human ownership while avoiding an artificial external-review dependency for every pre-production engineering stage.
