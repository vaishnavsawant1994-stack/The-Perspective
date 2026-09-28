# Phase 4 — R6 CRM API Post-Falsification Checkpoint

**Record:** P4-R6-CRM-API-CHK-01  
**Date:** September 28, 2026  
**Frozen implementation contract:** `P4-R6-G0@730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`  
**Authorized implementation baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Historical deeper-qualified CRM core checkpoint:** `6fb17b35696c41d866d885ee160b20c64f20687a`  
**Initial qualified R6 API foundation:** `1a8019c843e45e6c03467d8d31c6f1d3ec658d01`  
**Qualified pre-gap CRM API head:** `ebb2bd201033fe59f54ef3bf87722e46056095c7`  
**Qualified CRM ownership boundary:** `0d42a6c8a07cecccafa780c21d51e0b9067439a6`  
**Qualified CRM domain review/update boundary:** `25f0ec0f5cef902cb0554b5c423ffccea7d59fa5`  
**Qualified browser-owned CRM route boundary:** `216942ad52b391c0fe88ffe88cd85b17c5a0c27e`  
**Exact whole-CRM post-falsification implementation head:** `f44c712bee77ebc62aae569381b6fe9b3d4a0200`  
**Communications API:** NOT STARTED FROM THIS CHECKPOINT  
**Providers/workers:** NOT STARTED  
**UI binding:** NOT STARTED  
**Step 7:** LOCKED  
**R7+:** NOT AUTHORIZED  
**Merge:** NOT AUTHORIZED

## 1. Checkpoint meaning

This record closes the R6 CRM browser/API tranche only.

The CRM API is implemented as a thin browser boundary over already-qualified CRM
domain commands and canonical R3/R4/R5/R6 authorization. It does not create a
parallel security layer and does not move worker/provider evidence ownership into
browser routes.

The authoritative request chain remains:

~~~text
R3 identity/session
→ R4 selected Team tenant
→ R5/R6 current authorization
→ server-loaded ResourceContext
→ canonical field/workflow policy
→ qualified CRM command/query
~~~

No browser request may establish owner organization, membership, scope, role,
permission, lifecycle truth, provider evidence, score truth, suppression
evidence, or other server-owned authority.

## 2. Exact qualification evidence

### Domain-command qualification

`ff2ec42ca7f51c47ac9ad39b9b6b60b90ef9f84e`

- R6 Implementation Qualification #190
- result: **SUCCESS**

This qualified the initial staged-record review, enrichment-fact review,
company update, contact update and lead update commands.

### Deeper domain falsification

`93d7a7f39fa63aaa7eb056df57b75d624162db34`

- R6 Implementation Qualification #191
- result: **FAILURE**
- classification: **TEST-HARNESS / FIXTURE DEFECT**
- 145/146 live PostgreSQL tests passed.
- the sole failure attempted to archive only the CRM company row and correctly
  triggered the existing `23514` R6 resource-envelope invariant.

The attack was retained. The fixture was repaired through canonical
`platform.update_r6_resource(...)` followed by synchronized CRM archival.

`25f0ec0f5cef902cb0554b5c423ffccea7d59fa5`

- R6 Implementation Qualification #192
- result: **SUCCESS**

No production CRM command was weakened by the #191 repair.

### Browser-owned route qualification

`6888ecfc2749889823e0a81b35ccee2bcc3e97c2`

- R6 Implementation Qualification #203
- result: **FAILURE**
- classification: **TEST-HARNESS CONFIGURATION DEFECT**
- the new direct handler harness omitted `PERSPECTIVE_PUBLIC_APP_ORIGIN`;
  the real same-origin guard correctly rejected every supposed trusted request
  with 403.
- production route/security defect established: **NO**.

The harness alone was repaired at:

`216942ad52b391c0fe88ffe88cd85b17c5a0c27e`

R6 Implementation Qualification #204:

- run: `36376482838`
- result: **SUCCESS**

The exact head passed migration verification, unit tests, deterministic seed,
live PostgreSQL falsification, lint, typecheck, production build and production
dependency audit.

### Whole-CRM API post-falsification

`f44c712bee77ebc62aae569381b6fe9b3d4a0200`

R6 Implementation Qualification #206:

- run: `36376931693`
- result: **SUCCESS**

The exact whole-CRM attack head passed the complete qualification chain,
including live PostgreSQL regressions and the inherited CRM/Communications/
Commercial security suites.

## 3. Browser-owned CRM command boundary

The browser/API boundary now owns only the qualified human operations:

1. `createLeadSource`
2. `createCompany`
3. `createContact`
4. `createLead`
5. `createExtractionJob` — queues request intent only
6. `requestEnrichment` — queues request intent only
7. `createLeadList`
8. `addLeadListMember`
9. `removeLeadListMember`
10. `transitionLeadLifecycle` through qualified human actions
11. `updateCompany`
12. `updateContact`
13. `updateLead`
14. `reviewStagedRecord`
15. `reviewEnrichmentFact`

The following seven qualified commands remain intentionally absent from every R6
browser route:

1. `stageExtractedRecord`
2. `recordEnrichmentFact`
3. `recordLeadScore`
4. `recordQualification`
5. `createDuplicateCandidate`
6. `createSuppressionEntry`
7. `suppressLead`

Their absence is an ownership/security boundary, not API incompleteness.

## 4. Human review evidence boundary

### Staged records

Human review may record only the decision and exact expected row version through
explicit approve/reject authorization actions.

It cannot rewrite:

- raw provider payload;
- normalized provider payload;
- source-record identity;
- provenance URL;
- confidence/evidence.

The qualified domain command records reviewer identity/time and increments the
row version while retaining original extraction evidence.

### Enrichment facts

Human review may record only accept/reject decision metadata against an exact
fact version.

It cannot rewrite:

- typed provider value;
- source URL;
- confidence;
- observation time;
- provider/job/target/field identity.

Provider output therefore remains immutable evidence; human acceptance is a
separate decision.

## 5. Qualified generic update boundary

### Company

Browser update fields are restricted to approved business identity fields:

- name;
- legal name;
- domain;
- website;
- industry;
- size band;
- revenue band;
- country.

Ownership, tenant, department, resource-envelope, linked-organization and
archive authority remain server/command owned.

### Contact

Browser update fields are restricted to:

- company relationship;
- title;
- relationship state;
- preferred channel.

Consent/contactability, email/phone PII, owner authority and archive truth are
not generic browser-editable fields.

The canonical field catalog also contains `personId` as a candidate mutable
contact field, but the qualified browser/domain update command deliberately does
not expose it at this checkpoint. The current schema gives `person_id` a global
IAM-person foreign key rather than the same-tenant composite relationship used
for CRM company/contact/lead links. This checkpoint does not introduce a new
cross-tenant identity-link path merely for field-policy parity.

### Lead

Browser update fields are restricted to:

- company relationship;
- contact relationship;
- lead-source relationship.

Lifecycle, source-record identity, scores, qualification state, legal/consent
evidence, converted-deal truth, ownership and archive state remain outside
generic PATCH.

## 6. Post-falsification coverage retained

Executable tests now cover the CRM API boundary for:

- full route inventory and browser/server command ownership;
- canonical permission/resource/action mapping;
- same-origin / CSRF rejection;
- strict mutation schemas;
- forged owner/membership/scope/role/surface fields;
- server-owned and provider-evidence field smuggling;
- malformed UUIDs;
- no-op update rejection;
- selected-tenant object lookup;
- cross-tenant / IDOR concealment;
- archived target concealment;
- cross-tenant relationship rejection;
- optimistic concurrency and stale-write conflict mapping;
- concurrent/opposing staged and enrichment review decisions;
- repeated review decision containment;
- preservation of original extraction/provider evidence;
- lifecycle command isolation from generic PATCH;
- contact-list direct email/phone PII exclusion;
- canonical readable-field projection;
- list pagination limit enforcement;
- resource-envelope agreement;
- absence of all seven worker/server evidence commands from browser routes;
- Proposal route/permission absence;
- dormant `template.manage`;
- retained 37-key R6 active permission ceiling.

The API accepts no browser-controlled organization/filter authority for database
tenant selection. CRM list/detail queries derive owner organization from the
authorized selected tenant and bind candidate lookups to that organization.

## 7. Frozen exclusions preserved

At this checkpoint:

- Communications API has not begun from this boundary;
- provider/webhook/worker execution remains a later separate authenticated
  boundary;
- no UI binding is authorized by this checkpoint;
- Proposal production remains R7-owned;
- `proposal.*` remains dormant;
- `template.manage` remains dormant;
- deal progression remains capped at `PROPOSAL_PREPARATION`;
- the R6 active authorization subset remains exactly 37 keys;
- R7+ remains locked;
- Design 154 remains locked;
- Step 7 remains locked;
- `main` remains frozen and no merge is authorized.

## 8. Control state

~~~text
P4-R6-G0                              FROZEN
main                                  2372418d... FROZEN
CRM domain post-falsification         25f0ec0f... QUALIFIED #192
CRM browser route boundary            216942ad... QUALIFIED #204
Whole CRM API attack head             f44c712b... QUALIFIED #206
CRM browser/server ownership          PINNED
Seven worker/server commands          BROWSER-INACCESSIBLE
37-key R6 permission ceiling          PRESERVED
proposal.*                            DORMANT
template.manage                       DORMANT
PROPOSAL_PREPARATION ceiling          PRESERVED
Communications API                    LOCKED UNTIL THIS RECORD QUALIFIES
Providers/workers                     NOT STARTED
UI binding                            NOT STARTED
Step 7                                LOCKED
R7+                                   LOCKED
main merge                            NOT AUTHORIZED
~~~

This checkpoint authorizes no scope beyond the CRM API tranche. Communications
API may begin only after this documentation-only checkpoint commit itself passes
the exact-head R6 qualification gate.
