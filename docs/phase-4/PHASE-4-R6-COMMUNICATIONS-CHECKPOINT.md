# Phase 4 — R6 Communications Post-Falsification Checkpoint

**Record:** P4-R6-COMMS-CHK-01  
**Date:** September 27, 2026  
**Frozen implementation contract:** `P4-R6-G0@730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`  
**Authorized implementation baseline:** `main@2372418d80fa07f633a0e4adc99a21b1f7d8300a`  
**Historical deeper-qualified CRM predecessor:** `6fb17b35696c41d866d885ee160b20c64f20687a`  
**Exact deeper-qualified Communications implementation checkpoint:** `1b848b26fe42a4ea1c4afd619f5622402e641f06`  
**Step 4 Commercial at time of checkpoint:** NOT STARTED  
**P4-R6-C1:** NOT ACCEPTED  
**Merge:** NOT AUTHORIZED  
**R7+:** NOT AUTHORIZED  
**Design 154:** NOT AUTHORIZED  
**V1.0 certification:** NOT AUTHORIZED

## 1. Checkpoint meaning

`1b848b26fe42a4ea1c4afd619f5622402e641f06` is the historical R6 Communications implementation checkpoint after dedicated database-backed Communications falsification and repair.

Its meaning is immutable:

- CRM predecessor `6fb17b35696c41d866d885ee160b20c64f20687a` remains the deeper-qualified CRM checkpoint.
- Communications implementation and falsification descend from that CRM checkpoint.
- this record does not rewrite the meaning of either historical SHA;
- later R6 Commercial / authorization / API / UI work must not retroactively redefine this Communications qualification;
- this checkpoint does not authorize R7+, Proposal production, `template.manage`, Design 154, merge, or P4-R6-C1 acceptance.

## 2. Exact qualification evidence

The exact Communications checkpoint:

`1b848b26fe42a4ea1c4afd619f5622402e641f06`

passed:

- workflow: **R6 Implementation Qualification #71**
- run: `36318042339`
- job: `108616375138`
- result: **SUCCESS**

The complete exact-head chain passed:

- frozen R6 implementation-scope verification;
- Prisma validate/generate;
- clean R2→R6 migration replay;
- database verification and drift;
- unit tests;
- deterministic inherited seed + seed assertions;
- live PostgreSQL database and Communications falsification tests;
- lint;
- typecheck;
- production build;
- production dependency audit.

## 3. Communications falsification chronology

### 3.1 Initial Communications attack / fixture failure

`a1bb58c42c4299a46863bc502f3d483ea57486a3`

R6 Implementation Qualification #62:

- run `36316871961`
- job `108613139346`
- result: **FAILURE**
- classification: **TEST-HARNESS DEFECT**
- demonstrated issue: Communications test fixture referenced undefined `primaryUserId`.
- production security defect established by this failure: **NO**.

The fixture was repaired without weakening production controls.

### 3.2 First production-safety failure

`097a60ef1fa3e6b5a779f19ad3e708bd78dc88d8`

R6 Implementation Qualification #64:

- run `36317057694`
- job `108613648965`
- result: **FAILURE**
- classification: **DEMONSTRATED PRODUCTION DEFECTS**

The attack suite proved four real Communications gaps:

1. caller-controlled suppression identity could bypass canonical destination suppression;
2. campaign recipients could be mutated after campaign approval;
3. dispatch safety allowed a paused campaign to proceed;
4. direct outbound message creation could manufacture sent truth without authoritative provider evidence.

These were repaired rather than reclassified as harness failures.

### 3.3 Server-owned dispatch identity hardening

Production hardening subsequently:

- closed the four #64 defects;
- removed caller-owned channel/hash dispatch claims;
- derived dispatch channel from the canonical campaign sequence;
- derived destination/hash from canonical persisted contact data.

Intermediate red heads during this repair were not treated as qualified checkpoints.

### 3.4 Canonical-suppression fixture isolation

`ac811063aae044d8710751dcb406170c450bd777`

R6 Implementation Qualification #68:

- run `36317601848`
- job `108615148895`
- result: **FAILURE**
- classification: **TEST-HARNESS / FIXTURE ISOLATION DEFECT**
- demonstrated issue: two tests created the same live canonical suppression row and collided on the intended uniqueness constraint.
- production security defect established by this failure: **NO**.

The falsification fixture was isolated before deeper provider/race attacks were added.

### 3.5 Deeper Communications falsification

Attack-suite head:

`3789edf983452eebf76a8ff8a7c6623f09e9abf1`

R6 Implementation Qualification #70:

- run `36317822375`
- job `108615776133`
- result: **FAILURE**
- classification: **DEMONSTRATED PRODUCTION DEFECTS**

The deeper attack suite proved five additional real defects:

1. an exact provider callback replay returned conflict instead of an idempotent prior result;
2. forged provider identity and unknown provider event status were accepted as evidence;
3. a recipient in `REPLIED` state could still pass future dispatch safety;
4. an approved campaign's sequence could still be mutated;
5. direct external inbound/outbound message truth could be written from caller-supplied provider identifiers.

The same deeper suite also demonstrated that the following controls were already holding:

- cross-tenant campaign/list/sequence/sending-account relationships deny and roll back resource envelopes;
- foreign recipient identity denies without campaign-recipient residue;
- DNC/suppression is rechecked at dispatch time;
- sender health is rechecked at dispatch time;
- post-scheduling contactability changes stop dispatch;
- duplicate recipient races resolve to one canonical row;
- recipient delivery state remains monotonic;
- foreign conversation linkage denies and resource registration rolls back;
- stale/illegal conversation transitions deny;
- malformed/illegal meeting transitions deny;
- cross-tenant meeting linkage denies and rolls back its meeting resource envelope;
- runtime deletion of active suppression evidence is denied;
- `template.manage` remains dormant and only approved same-tenant immutable template versions may be referenced;
- Step 3 cannot transition campaign launch into provider-running state.

## 4. Minimal production repairs after deeper attack

The final repair commit:

`1b848b26fe42a4ea1c4afd619f5622402e641f06`

closed only the demonstrated Communications gaps:

- provider/event identity is normalized and validated against the campaign's canonical sending account;
- provider event type is restricted to the allowed delivery vocabulary;
- exact provider callback replay returns the prior immutable evidence result;
- same provider event ID with changed evidence returns `CONFLICT`;
- `REPLIED` is a dispatch stop state;
- sequence mutation is denied after a campaign referencing that sequence has reached readiness/approval or later protected lifecycle;
- direct message repository writes are internal-note-only until the authenticated provider/worker boundary exists;
- external sent/received truth therefore cannot be manufactured by a caller supplying provider IDs.

No Proposal/Product/Package/Contract/Invoice/Payment/Subscription/Entitlement production behavior was added.

## 5. Falsification coverage retained

The Communications tranche now has executable evidence for the applicable frozen threat families including:

- A37–A44 contactability/DNC/suppression race boundaries;
- A46 frozen approved audience behavior;
- A47 approved sequence/template configuration immutability boundary;
- A48 dispatch-time sender health;
- A49 duplicate recipient race containment;
- A53 paused/stopped campaign dispatch denial;
- A54 no client-manufactured sent truth;
- provider callback replay/dedupe and changed-evidence conflict;
- provider identity/event-vocabulary rejection;
- cross-tenant conversation/message and meeting linkage;
- lifecycle stale-write / illegal-transition guards;
- rollback/no-resource-residue behavior.

Threats that require the later authenticated provider/webhook/worker implementation remain obligations for the later provider/API tranche and full A01–A120 qualification; this checkpoint does not claim those future boundaries are implemented.

## 6. Frozen R6 exclusions preserved

At this checkpoint:

- Proposal production remains R7-owned;
- Deal progression ceiling remains `PROPOSAL_PREPARATION`;
- `template.manage` remains exact stage `R6+` and dormant;
- the 37-key R6 active authorization subset has not been activated prematurely;
- R7+ remains locked;
- Design 154 remains locked;
- V1.0 certification remains locked.

## 7. Control state

~~~text
P4-R6-G0                               FROZEN
Historical CRM checkpoint              6fb17b35696c41d866d885ee160b20c64f20687a
Historical Communications checkpoint   1b848b26fe42a4ea1c4afd619f5622402e641f06
Communications Qualification #71       SUCCESS
Communications falsification            COMPLETE FOR STEP-3 IMPLEMENTATION BOUNDARY

Step 4 Commercial R6 core               NOT STARTED AT THIS CHECKPOINT
37-key R6 authorization activation      NOT STARTED
Provider/API/UI tranche                 NOT STARTED
Full A01–A120 final qualification       NOT COMPLETE
P4-R6-C1                                NOT ACCEPTED
Merge                                   NOT AUTHORIZED
R7+                                     NOT AUTHORIZED
Design 154                              NOT AUTHORIZED
V1.0 certification                      NOT AUTHORIZED
~~~

## 8. Next legitimate tranche

Only after this Communications checkpoint is preserved may implementation advance to **Step 4 — Commercial R6 core**.

That tranche remains bounded by frozen P4-R6-G0:

- pipelines;
- deal stages;
- deals;
- lead→deal conversion;
- client-account conversion/relationship foundations;
- hard ceiling at `PROPOSAL_PREPARATION`;
- no Proposal production;
- no R7-owned commercial persistence or behavior.
