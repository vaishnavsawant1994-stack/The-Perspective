# Phase 4 — Engineering Implementation Reconciliation

**Current state (3 October 2026):** R1–R12 were accepted on earlier merges. R13 was qualified on `f56ec78eb7304e8883507cf5fe579302e770ec2c` and merged by pull request #23 at `fe0cbc0221dfa4b67c7304bfbbfcb75733b53101`. The checkpoint is [P4-R13-C1](./PHASE-4-R13-COMPLETION-RECORD.md). R14 G0 / V1.0 certification planning is unlocked in [PHASE-4-R14-G0-PLANNING-UNLOCK.md](./PHASE-4-R14-G0-PLANNING-UNLOCK.md). R14 implementation is not authorized. V1.0 is not certified. The status line and bullets below are the historical R5 index. They are not the current checkpoint.

Status: **R1–R5 accepted; R5 implementation merged; R6 remains separately locked**

- [Repository-Wide Implementation Reconciliation](./PHASE-4-REPOSITORY-WIDE-IMPLEMENTATION-RECONCILIATION.md)
- [P4-R0 Review & Remediation Gate](./PHASE-4-P4-R0-REVIEW-AND-REMEDIATION-GATE.md)
- [R1 Checkpoint](./PHASE-4-R1-CHECKPOINT.md)
- [R2 Implementation Contract](./PHASE-4-R2-IMPLEMENTATION-CONTRACT.md)
- [R2 Checkpoint](./PHASE-4-R2-CHECKPOINT.md)
- [R3 Implementation Contract](./PHASE-4-R3-IMPLEMENTATION-CONTRACT.md)
- [R3 Checkpoint](./PHASE-4-R3-CHECKPOINT.md)
- [R4 Implementation Contract](./PHASE-4-R4-IMPLEMENTATION-CONTRACT.md)
- [R4 Checkpoint](./PHASE-4-R4-CHECKPOINT.md)
- [R5 Implementation Contract](./PHASE-4-R5-IMPLEMENTATION-CONTRACT.md)
- [R5 Authorization Threat Model](./PHASE-4-R5-AUTHORIZATION-THREAT-MODEL.md)
- [R5 Implementation Threat Coverage](./PHASE-4-R5-IMPLEMENTATION-THREAT-COVERAGE.md)
- [R5 Closure Package](./PHASE-4-R5-CLOSURE-CANDIDATE.md)
- [R5 Checkpoint](./PHASE-4-R5-CHECKPOINT.md)

- Frozen baseline: Designs 001–153
- Current checkpoint: **P4-R5-C1 — ACCEPTED + MERGED**
- Frozen R5 contract: `2914e76b22468137630a4d444adb5431209fb5aa`
- Accepted R5 implementation: `8823c63c1a03281d91d5085bba07206186380f6c`
- R5 implementation merge on main: `748f6af4ce4c9868c2441125cd0480cf8abc34d4`
- R5 closure-documentation merge on main: `6add999609736e788d9bdaf8ddc690445f6d36e7`
- R2: accepted authoritative persistence baseline
- R3: accepted authentication/session/MFA boundary with automated + Chromium qualification
- R4: accepted organization-context selection and PostgreSQL tenant isolation
- R5: accepted Authorization / RBAC / Resource Policy boundary; Q01–Q07 closed; exact-head and prospective-merge qualification complete
- Independent external review for R5: not performed; owner-waived under GOV-REVIEW-01 and replaced by enhanced qualification
- Production certification: not ready
- R6+: **not authorized**
- Design 154: **not authorized**
- R14/V1.0 independent external review: still mandatory

P4-R1-C1 through P4-R5-C1 are accepted.

R5 preserves the R3 authenticated-identity boundary and R4 tenant boundary, then adds current-database authorization resolution, complete same-grant paths, explicit DENY precedence, scope/resource/action/constraint enforcement, field and Client-safe projection policy, protected role administration controls, transactional authority revalidation, immutable/redacted authorization evidence, and dormant future-stage permission vocabulary.

The accepted R5 implementation was merged with a merge commit so exact accepted SHA `8823c63c1a03281d91d5085bba07206186380f6c` remains a direct parent of `748f6af4ce4c9868c2441125cd0480cf8abc34d4`. The permanent R5 closure records were then merged documentation-only at `6add999609736e788d9bdaf8ddc690445f6d36e7`.

R6 must be authorized separately after final R5 merged-state closure. This README does not authorize R6, Design 154, or V1.0 production certification.
