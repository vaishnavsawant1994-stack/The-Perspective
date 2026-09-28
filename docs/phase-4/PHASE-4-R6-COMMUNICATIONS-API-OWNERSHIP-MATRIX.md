# Phase 4 — R6 Communications API Ownership Matrix

**Record:** P4-R6-COMMS-API-OWNERSHIP-01  
**Date:** September 28, 2026  
**Starting checkpoint:** `08b587b66db445e5063973a7e6444f69e017aaeb` — qualified CRM API post-falsification checkpoint (#207)  
**Frozen contract:** `P4-R6-G0@730d2280fafe29c756ba7e0b09ff7e8e5c9496a6`

## 1. Boundary rule

A Communications browser route may expose only a human-owned command whose
authority is reconstructed from the current authenticated Team context and
trusted persisted ResourceContext.

Provider callbacks, delivery evidence, dispatch-time safety, sender/provider
truth, recipient progression from provider events, credentials and worker
execution are not browser-owned merely because a Communications domain function
exists.

The canonical browser chain remains:

~~~text
same-origin request
→ R3 identity/session
→ R4 selected Team tenant
→ R5/R6 permission/action/resource/field/workflow policy
→ server-owned ResourceContext
→ qualified Communications command/query
~~~

## 2. Existing Communications core command ownership

| Command | Ownership | Browser status | Authority / reason |
|---|---|---|---|
| `createSendingAccount` | browser/API-owned administration | route required | `emailaccount.manage:create`; credentials/provider secrets remain external |
| `createSequence` | browser/API-owned | route required | `sequence.manage:create` |
| `addSequenceStep` | browser/API-owned preparation, subject to version semantics | route deferred until version contract is proved | `sequence.manage`; approved immutable template version only |
| `createCampaign` | browser/API-owned | route exists | `campaign.manage:create` |
| `addCampaignRecipient` | internal/server audience materialization | no direct browser route | recipients must derive from authorized lead-list/audience preparation, not caller-manufactured identities |
| `buildCampaignApprovalSnapshotInTransaction` | internal/server | no browser route | canonical frozen approval evidence builder |
| `computeCampaignApprovalSnapshot` | internal/server preparation primitive | no direct browser mutation route | snapshot evidence is server-derived |
| `transitionCampaign` | shared with separate trusted entrypoints | browser subset exists | human READY/APPROVED/SCHEDULED/PAUSED/CANCELLED actions; RUNNING/COMPLETED remain execution/system controlled |
| `evaluateDispatchSafety` | worker/server-owned | no browser route | execution-time suppression/contactability/sender-health authority |
| `recordDeliveryEvent` | provider/webhook-owned | no browser route | immutable provider event evidence and recipient progression |
| `createConversation` | internal/provider/system-owned foundation | no ordinary browser create route | inbound/provider thread identity cannot be caller-manufactured |
| `transitionConversation` | browser/API-owned human handling subset | route required | `reply.handle` / explicit workflow actions |
| `recordMessage` | shared; current domain command is human internal-note only | internal-note browser route may use it | production function rejects INBOUND/OUTBOUND/provider IDs; outbound send needs a separate qualified command/outbox boundary |
| `createMeeting` | browser/API-owned | route required | `meeting.edit:create` |
| `transitionMeeting` | browser/API-owned command transitions | route required after history semantics qualification | `meeting.edit`; reschedule must preserve immutable history |

## 3. Existing browser API

Already present before this tranche:

- campaign list/create;
- campaign submit/approve/schedule/pause/cancel transition route;
- campaign launch request route through the R6 outbox/idempotency boundary.

These routes do not authorize provider dispatch or provider evidence creation.

## 4. Required Communications domain/API gaps

The frozen R6 contract requires more than the currently exposed campaign routes.
The following gaps must be resolved at the domain/query layer before route
exposure where applicable:

1. sending-account safe list/detail and qualified create/update/disable/test
   semantics without credential material;
2. sequence list/detail and version-safe create/update/create-version/archive
   semantics;
3. campaign detail and guarded draft update semantics;
4. audience preparation/materialization from the authorized lead-list rather
   than direct caller-supplied campaign recipients;
5. conversation list/detail projections with message-body authorization kept
   separate;
6. reply assignment/reassignment commands;
7. reply handling commands for resolve/reopen/classification/stop-sequence as
   contracted;
8. internal-note browser command using the current INTERNAL-only message
   primitive;
9. outbound `message.send` command through an idempotent outbox/provider
   boundary; browser must never record SENT truth directly;
10. message read projection separating external/shared content, internal notes,
    PII addresses and provider metadata;
11. meeting list/detail/create/update and valid lifecycle commands;
12. reschedule semantics with immutable schedule-change history rather than
    history overwrite.

No HTTP route may be created merely to make every domain function browser
callable.

## 5. Non-browser invariants

The browser API must not directly call or manufacture inputs for:

- `addCampaignRecipient`;
- `buildCampaignApprovalSnapshotInTransaction`;
- `computeCampaignApprovalSnapshot`;
- `evaluateDispatchSafety`;
- `recordDeliveryEvent`;
- provider-created inbound/outbound message evidence;
- provider external IDs or event IDs as browser authority;
- campaign recipient delivery state;
- sender health/sync truth;
- credentials, webhook secrets or provider auth errors.

The launch request may enqueue an authorized side effect. The later worker must
reload current state and recheck dispatch safety; browser approval is never
dispatch execution authority.

## 6. Dormant / future boundaries

- `template.manage` remains `R6+` and dormant.
- Runtime template create/edit/version/approve/archive remains prohibited.
- Sequences may reference only an existing approved immutable template version.
- General `calendar.view` remains R8 and is not activated for R6 meetings.
- Proposal production remains R7-owned.
- The active R6 permission ceiling remains exactly 37 keys.
- No provider/worker implementation, UI binding, Step 7, R7+, Design 154 or
  `main` merge is authorized by this matrix.

## 7. Required falsification before Communications API checkpoint

The Communications API tranche is not complete until executable attacks cover:

- unauthenticated/expired/missing-tenant requests;
- cross-origin/CSRF mutation attempts;
- forged org/membership/role/surface/scope claims;
- cross-tenant campaign/list/sequence/sender/conversation/message/meeting IDs;
- field smuggling of credentials/provider IDs/evidence/state;
- template mutation or unapproved template references;
- stale row versions and concurrent lifecycle commands;
- campaign approval/version invalidation;
- direct RUNNING/COMPLETED browser lifecycle attempts;
- direct provider delivery/event injection;
- direct campaign-recipient creation/state mutation;
- direct INBOUND/OUTBOUND sent/received truth creation;
- internal-note leakage into external/client projections;
- sender health and suppression/contactability bypass;
- duplicate/replayed outbound side effects and idempotency conflicts;
- conversation assignment/resolve/reopen workflow bypass;
- meeting illegal transition/reschedule-history overwrite;
- pagination/filter/detail inference and PII/provider-metadata leakage.

Only a fully green exact-head qualification after that falsification may produce
a permanent Communications API checkpoint.
