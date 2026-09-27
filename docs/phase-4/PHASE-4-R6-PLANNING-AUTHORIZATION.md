# Phase 4 — R6 CRM & Commercial Engine Planning Authorization

**Record:** P4-R6-AUTH-PLANNING-01  
**Date:** September 27, 2026  
**Authorized planning baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Planning branch:** `phase4/r6-crm-commercial-g0-20260927`  
**R1–R5:** ACCEPTED  
**P4-R5-C1:** ACCEPTED + MERGED  
**R6 production implementation:** NOT AUTHORIZED  
**R7+:** NOT AUTHORIZED  
**Design 154:** NOT AUTHORIZED  
**V1.0 production certification:** NOT AUTHORIZED

## 1. Owner authorization

The owner explicitly authorized:

> I authorize R6 CRM & Commercial Engine planning and Gate-G0 contract work against main@2372418d80fa07f633a0e4adc99a21b1f7d8300a. Preserve all accepted R1–R5 architecture and behavior. Do not begin R6 production implementation until P4-R6-G0 is separately frozen and implementation is separately authorized. Do not start R7+, Design 154, or V1.0 certification.

This record is the authority for R6 repository audit, requirement recovery, contract drafting, threat modeling, falsification planning, Gate-A preparation, and machine qualification of the planning package only.

It is not authority to change R6 production schema, production APIs, domain services, routed business behavior, workers, integrations, or runtime authorization activation.

## 2. Frozen inherited boundary

R6 planning must preserve without reinterpretation:

- P4-R1-C1 repository/runtime foundation;
- P4-R2-C1 PostgreSQL/Prisma persistence and migration discipline;
- P4-R3-C1 identity/session/MFA/invitation/recovery;
- P4-R4-C1 explicit organization context and tenant isolation;
- P4-R5-C1 authorization/RBAC/resource policy;
- `Organization` as durable tenant boundary;
- selected `OrganizationMembership` as request tenant context;
- restricted database role and RLS safety floor;
- current-database authority resolution;
- complete same-grant R5 authorization paths;
- trusted server-side ResourceContext;
- explicit field/action/workflow obligations;
- immutable/redacted authorization evidence;
- future-stage permissions dormant unless the owning stage is explicitly activated.

R6 planning may define domain resources that consume these controls. It may not weaken or duplicate them.

## 3. Authorized planning operations

Allowed now:

1. inspect the real repository and accepted control state;
2. recover frozen Phase-2C/2D/2E/2F requirements;
3. map the 151-screen UI responsibilities relevant to R6;
4. map current Prisma/API/module implementation;
5. map R5 R6-stage permissions and role grants;
6. define R6 domain ownership and lifecycle boundaries;
7. define tenant/resource/field/action authorization requirements;
8. define database/RLS/migration requirements;
9. define API/service contracts;
10. define idempotency/outbox/audit rules;
11. define threat model and executable falsification plan;
12. draft Gate-A decisions and P4-R6-G0 candidate contract;
13. add planning-only verification tooling/workflows if required for G0 qualification.

Not allowed now:

- CRM/comms/commercial production tables;
- R6 runtime domain services;
- R6 business API endpoints;
- production UI data binding;
- workers or provider dispatch;
- activating R6 permissions in production;
- production data migration;
- R7 contracts/invoices/payments/subscriptions;
- R8+ work;
- Design 154;
- V1.0 certification.

## 4. Required transition

~~~text
main@2372418d...
  accepted R1–R5 planning baseline
        ↓
R6 planning authorization — THIS RECORD
        ↓
R6 pre-design audit
        ↓
requirement recovery / scope decisions
        ↓
R6 domain + lifecycle + authorization contracts
        ↓
R6 threat model / falsification plan
        ↓
Gate-A decisions
        ↓
enhanced contract qualification
        ↓
P4-R6-G0 candidate
        ↓
explicit owner freeze/acceptance
        ↓
separate R6 implementation authorization
        ↓
ONLY THEN production implementation
~~~

No later step may be inferred from completion of an earlier step.
