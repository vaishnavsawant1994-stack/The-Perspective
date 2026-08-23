# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 093 — Reply Queue / Outreach Response Review

Design 093 should become the **canonical Team Workspace outreach-response review and triage surface** over the Conversation/Message infrastructure established by Design 014 and the Campaign/Delivery lineage established by Designs 090–092.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Conversation ≠ Message/Reply ≠ OutreachEnrollment ≠ Lead ≠ ReplyClassification ≠ ReviewDecision ≠ Assignment ≠ FollowUp/Task ≠ Campaign ≠ Notification.**

The central implementation rule is:

> **An inbound outreach response becomes one canonical inbound Message inside one canonical Conversation. Campaign, Enrollment and Lead references provide lineage/context only. Automated classification, human review, review assignment, Conversation read state, Lead/Enrollment actions and resulting Tasks/FollowUps remain separate state machines. Receiving or classifying a reply must never silently mutate Lead lifecycle, Campaign state, Enrollment state, ownership or work records.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **093**                                                                                                                                  |
| **Canonical name**                 | **Reply Queue / Outreach Response Review**                                                                                               |
| **Product area**                   | Team Workspace / Outreach / Inbox / Response Operations                                                                                  |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                         |
| **Screen class**                   | Cross-Domain Review Queue / Communication Triage Workspace                                                                               |
| **Classification**                 | **Canonical Outreach Reply Review, Classification & Response-Action Anchor**                                                             |
| **Primary purpose**                | Review inbound Campaign responses, classify them safely, assign review responsibility and trigger governed downstream Sales/work actions |
| **Canonical communication entity** | **Conversation + Message** — Design 014                                                                                                  |
| **Queue projection**               | **ReplyQueueEntry / ReplyReviewView**                                                                                                    |
| **Campaign dependency**            | Design 090                                                                                                                               |
| **Enrollment dependency**          | Design 090                                                                                                                               |
| **Provider ingestion dependency**  | Design 092                                                                                                                               |
| **Lead dependency**                | Designs 011 / 089                                                                                                                        |
| **Classification concept**         | **ReplyClassification**                                                                                                                  |
| **Human review entity**            | **ReviewDecision**                                                                                                                       |
| **Review responsibility entity**   | **ReplyReviewAssignment / Assignment**                                                                                                   |
| **Work dependencies**              | FollowUp — Design 015 / Task — Design 034                                                                                                |
| **Notification dependency**        | Design 080                                                                                                                               |
| **Primary query service**          | `ReplyQueueQueryService`                                                                                                                 |
| **Inbound ingestion service**      | `InboundReplyIngestionService`                                                                                                           |
| **Classification service**         | `ReplyClassificationService`                                                                                                             |
| **Review service**                 | `ReplyReviewService`                                                                                                                     |
| **Assignment service**             | `ReplyReviewAssignmentService`                                                                                                           |
| **Action orchestration**           | `ReplyActionOrchestrator`                                                                                                                |
| **Auth**                           | Required                                                                                                                                 |
| **Authorization**                  | OrganizationMembership + Conversation/review/Lead/Enrollment/work permissions                                                            |
| **Implementation priority**        | **Critical Response Integrity / Sales Action Governance / Duplicate-Inbound Prevention**                                                 |
| **Reuse level**                    | **Extremely High across Designs 014, 080, 089–094**                                                                                      |

Design 093 should answer:

> **“Which canonical inbound replies still need review, what Conversation and Message does each belong to, which Campaign/Enrollment/Lead context is safely associated, what did automated classification suggest, what did a human reviewer decide, who owns the review, and which explicit downstream action—if any—was actually created?”**

Canonical structure:

```text
Provider webhook / mailbox sync
             │
             ↓
       Provider evidence
             │
             ↓
      Inbound Message
             │
             ↓
       Conversation
             │
      ┌──────┼───────────┐
      ↓      ↓           ↓
 Campaign  Enrollment    Lead
 context    context     context
             │
             ↓
   ReplyClassification
      automated result
             │
             ↓
       ReviewDecision
        human decision
             │
      ┌──────┼─────────────┐
      ↓      ↓             ↓
 Assignment  Lead command  Enrollment command
                               │
                         ┌─────┴─────┐
                         ↓           ↓
                     FollowUp       Task
```

No layer in that chain replaces another.

---

# 2. Reuse

## Design 014 remains canonical for Conversation and Message

Design 093 must **not** create:

```text
ProviderReply
CampaignReply
OutreachReplyMessage
ReplyQueueMessage
```

as parallel communication truth.

Correct:

```text
Inbound provider response
        ↓
Message M-101
direction = inbound
        ↓
Conversation C-22
```

Design 093 reviews that Message.

---

## Reply is a Message role/context, not a second Message entity

Conceptually:

```text
Message
├── direction = inbound
├── conversationId
├── provider evidence
└── optional campaign/enrollment lineage
```

A “reply” is an inbound Message participating in a response context.

---

## Design 090 remains canonical Campaign/Enrollment authority

Campaign 360 owns:

```text
Campaign
→ Audience
→ Enrollment
→ outbound Message
```

Design 093 can link an inbound reply back to that execution lineage.

It does not own Campaign or Enrollment lifecycle.

---

## Design 092 remains provider-ingestion authority

Provider webhook/sync processing should feed one canonical inbound-message pipeline.

Design 093 must not build its own Gmail/Microsoft/provider inbox backend.

Correct:

```text
Design 092 provider layer
       ↓
verified/normalized inbound evidence
       ↓
Design 014 Conversation / Message
       ↓
Design 093 review queue
```

---

## Design 089 remains canonical Lead detail

A reply can be associated with:

```text
Lead L-100
```

but:

```text
Reply
≠
Lead
```

and:

```text
ReplyClassification
≠
LeadStatus
```

---

## Design 015 remains FollowUp authority

Choosing:

> Follow up next week

from response review should create/reference one canonical FollowUp.

It must not write:

```text
reply.nextAction = "follow up next week"
```

as a substitute for the work entity.

---

## Design 034 remains Task authority

Same principle for internal Tasks.

---

## Design 080 remains Notification authority

A notification such as:

> New positive outreach reply

can point toward Design 093.

But:

```text
Notification
≠
Reply
≠
ReviewAssignment
```

and marking the Notification read does not complete response review.

---

# 3. Entities

## Conversation

Conversation is the canonical communication thread/container.

It can contain:

```text
Conversation C1
├── outbound Message M1
├── inbound Message M2
├── outbound Message M3
└── inbound Message M4
```

Design 093 must not create one Conversation per Reply if the canonical thread already exists.

---

## Conversation ≠ Campaign

A Conversation may originate from Campaign outreach but subsequently continue beyond that Campaign's active lifecycle.

Archiving/completing a Campaign must not delete the Conversation.

---

## Conversation ≠ Enrollment

One Enrollment can establish communication lineage.

The resulting Conversation remains a communication entity.

---

## Conversation read state ≠ review state

Critical.

Possible:

```text
Conversation = READ
Reply review = PENDING
```

or:

```text
Conversation = UNREAD
Reply review = COMPLETED
```

depending on UI/user actions.

These are independent.

---

## Message / Reply

The inbound Message must preserve exact communication evidence such as conceptually:

```text
Message
├── id
├── conversationId
├── direction = inbound
├── sender participant/address snapshot
├── recipient snapshot
├── content
├── receivedAt/provider occurredAt
├── provider identity references
├── threading evidence
└── related Campaign/Enrollment lineage where resolved
```

---

## Current Contact email ≠ historical sender evidence

If a Contact changes email later, the original inbound Message still records the address/identity used at receipt time.

---

## Reply ≠ provider callback

Permanent.

The provider webhook/sync payload is external evidence used to ingest the canonical Message.

---

## Provider callback retry ≠ new Message

Critical.

A repeated provider callback for the same external email must resolve to the same canonical Message.

---

## Inbound dedupe identity

Use provider/account-scoped message identity where available, conceptually:

```text
organization
+
SendingAccount / ProviderConnection
+
providerMessageId
```

with additional provider/RFC message identifiers or content fingerprinting where required.

Do not deduplicate solely by:

* sender email,
* subject,
* received timestamp.

---

## Provider message ID must be namespace-scoped

Permanent.

```text
provider
+
provider account
+
providerMessageId
```

rather than treating external IDs as globally unique.

---

## Conversation threading

Prefer reliable provider/threading evidence such as:

* provider thread ID,
* `In-Reply-To`,
* `References`,
* canonical outbound provider-message linkage,

according to provider/channel support.

Do not thread replies solely by subject line.

---

## Unresolved threading ≠ reply deletion

If Conversation/Campaign attribution is uncertain:

persist the inbound Message safely.

It can enter:

> attribution/review required

rather than being discarded.

---

## Message ≠ OutreachEnrollment

An inbound Message may reference:

```text
enrollmentId = E-55
```

for lineage.

It never becomes the Enrollment.

---

## Enrollment linkage should derive from strong evidence

Prefer:

```text
inbound reply
→ provider/thread/reference
→ outbound Message
→ Enrollment
```

over:

```text
sender email
→ first Lead with same email
```

This prevents wrong Campaign attribution.

---

## Message ≠ Lead

Permanent.

A reply can exist before Lead resolution succeeds.

---

## Lead-linking failure ≠ reply-ingestion failure

Critical.

A canonical Message must survive even if:

* Lead service unavailable,
* Lead was merged,
* Contact resolution ambiguous.

---

## ReplyClassification

`ReplyClassification` represents an automated/rule/model assessment of the inbound reply.

Conceptually:

```text
ReplyClassification
├── replyMessageId
├── taxonomy/version
├── classifier type/version
├── category/result
├── confidence
├── classifiedAt
└── processing status
```

Exact categories belong to Phase 3D/frozen product rules.

---

## ReplyClassification ≠ Message

Permanent.

Classification describes the Message.

It never modifies the Message content.

---

## Classification ≠ human ReviewDecision

Critical.

Automated result:

> likely positive

is not the same as:

> reviewer confirms positive and chooses next action.

---

## Classification can be wrong

Therefore confidence/uncertainty must remain representable.

No automated classifier should silently rewrite CRM state merely because confidence is high.

---

## Classification taxonomy should be versioned

If categories/rules/model semantics change later:

historical classifications remain explainable.

---

## Reclassification ≠ deletion of prior result

Where history matters, a later classification should supersede/reference prior classification rather than rewriting what the earlier classifier produced.

---

## Classifier version ≠ Lead qualification policy

Permanent.

Response interpretation and Lead qualification are distinct business concerns.

---

## Classification ≠ LeadStatus

Absolute.

Even a clearly positive response should not execute:

```text
lead.status = QUALIFIED
```

merely by storing the classification.

---

## Classification ≠ Enrollment state

Likewise:

> negative

does not automatically stop Enrollment unless a governed response policy/command does so.

---

## Classification failure ≠ Reply failure

Critical.

Reply remains reviewable manually.

---

## Classifier unavailable ≠ no classification needed

Use:

> Classification unavailable

not:

> Neutral / No response.

---

## ReviewDecision

`ReviewDecision` is the authorized human/business decision about the reply.

Conceptually:

```text
ReviewDecision
├── replyMessageId
├── reviewer
├── reviewedAt
├── classification context
├── decision / interpretation
├── resulting action references
└── revision/supersession
```

Exact decision taxonomy belongs to Phase 3D.

---

## ReviewDecision should bind exact Message

Permanent.

If canonical Message corrections/versioning ever exist, the decision must identify the exact content revision reviewed.

---

## ReviewDecision ≠ classification override by mutation

A human disagreement should not rewrite:

```text
ReplyClassification.category
```

as though the model originally predicted differently.

Correct:

```text
Classification: X
Human ReviewDecision: Y
```

---

## ReviewDecision should be append-oriented

If decision changes later:

preserve prior review history and create a superseding/new decision according to policy.

---

## ReviewDecision ≠ Lead mutation

Permanent.

---

## ReviewDecision ≠ Enrollment mutation

Permanent.

---

## ReviewDecision ≠ Conversation read state

Permanent.

---

## “Review complete” ≠ “Conversation read”

Critical.

These actions need separate commands.

---

## “Review complete” ≠ Lead converted

Permanent.

---

## “Review complete” ≠ FollowUp completed

Permanent.

---

## Assignment

`ReplyReviewAssignment` represents operational responsibility for reviewing this reply.

Conceptually:

```text
ReplyReviewAssignment
├── replyMessageId / review item
├── assignee membership/user
├── assignedBy
├── assignedAt
├── assignment state
└── optional due/context where frozen
```

---

## Assignment ≠ Lead owner

Critical.

Assigning Sarah to review a reply does not change:

```text
Lead.owner
```

---

## Assignment ≠ Task

A queue ownership assignment answers:

> Who reviews this reply?

A Task answers:

> What work must be completed?

These may be related, but they are not automatically the same object.

---

## Assignment ≠ Conversation participant

Permanent.

---

## Assignment ≠ authorization

Being assigned a reply cannot grant otherwise forbidden access.

Assignment service must verify that the target reviewer has sufficient permissions.

---

## Reassignment ≠ Lead reassignment

Permanent.

---

## FollowUp

If review determines a future sales follow-up is needed:

create canonical FollowUp.

Conceptually:

```text
ReviewDecision
      ↓
createFollowUp(...)
      ↓
FollowUp F-100
```

Record the reference on review/action history if needed.

---

## FollowUp ≠ review assignment

Permanent.

---

## FollowUp ≠ Enrollment

Permanent.

---

## Task

If internal work is required:

```text
ReviewDecision
      ↓
createTask(...)
      ↓
Task T-100
```

Task remains Design 034 truth.

---

## Task creation ≠ ReviewDecision itself

Permanent.

If Task service fails after a ReviewDecision:

do not pretend a Task exists.

---

## Downstream action result should be explicit

Example:

```text
Human decision recorded      ✓
Enrollment stop command      ✓
FollowUp creation            ✕
```

The system must surface the partial downstream-action condition.

Do not collapse all of that into:

> Reviewed successfully.

---

## Positive/negative response handling

Response interpretation can inform explicit actions.

Correct conceptually:

```text
ReviewDecision
      ↓
authorized command
      ├── LeadService
      ├── CampaignEnrollmentService
      ├── FollowUpService
      └── TaskService
```

Not:

```text
reply.category = "positive"
↓
hidden database triggers patch everything
```

---

## Lead state transition must use LeadService

If response review requires Lead transition:

```text
changeLeadStatus(...)
updateLeadQualification(...)
```

through canonical policy.

---

## Enrollment stop/pause must use EnrollmentService

If review requires stopping sequence execution:

```text
stopEnrollment(...)
```

or the canonical validated equivalent.

Do not directly patch enrollment status inside reply-review tables.

---

## Campaign ≠ response

One reply must not automatically change entire Campaign lifecycle.

---

## Negative response ≠ Campaign cancellation

Permanent.

---

## Positive response ≠ Campaign success globally

Permanent.

---

## Notification

Design 080 may create notification records for:

* new reply,
* review assignment,
* action required.

But:

```text
Notification read
≠
Conversation read
≠
Review complete
```

---

# 4. Permissions

Design 093 requires separate permissions for communication, review, assignment and downstream source-domain actions.

Conceptually:

```text
conversation.read
message.read

replyReview.read
replyReview.assign
replyReview.decide

replyClassification.read

lead.read
lead.changeStatus / qualify

campaign.read
enrollment.read
enrollment.manage

followUp.create
task.create
```

Exact permission names belong to Phase 3D.

---

## Reply queue visibility requires Message/Conversation authorization

A user should not receive reply previews from Conversations they cannot read.

---

## Review permission ≠ Lead edit

A support/outreach reviewer could potentially classify/review replies without authority to change Lead state.

---

## Review permission ≠ Enrollment management

Permanent.

---

## Assignment permission ≠ Lead assignment permission

Critical.

---

## Lead owner ≠ reply reviewer automatically

Operational responsibilities can differ.

---

## Assignment target must be authorized

A user cannot assign a sensitive reply to someone who cannot read its Conversation.

---

## Classification read ≠ Message read bypass

Automated classification labels themselves may reveal message meaning.

Do not show:

> “Interested in $100K deal”

to someone who cannot read the underlying authorized communication.

---

## Human decision requires authenticated reviewer identity

The browser must not supply authoritative:

```text
reviewedBy = anotherUser
```

Reviewer derives from current session/membership.

---

## Reassignment actor derives from session

Same.

---

## Lead action reauthorization

When ReviewDecision triggers/requests a Lead action:

Lead permission must be checked at command time.

---

## Enrollment action reauthorization

Same.

---

## FollowUp/Task creation reauthorization

Same.

---

## Review completion cannot bypass failed downstream authorization

Example:

```text
Reviewer can classify reply
but cannot stop Enrollment
```

The system should:

* record review if allowed,
* reject unauthorized Enrollment mutation,
* surface the result explicitly.

---

## Sensitive downstream fields

Reply screen access does not automatically grant:

* full Deal values,
* Contact private PII,
* raw provider metadata.

Use safe projections.

---

## Direct reply/message ID reauthorizes

Knowing an ID grants nothing.

---

## Direct Conversation ID reauthorizes

Permanent.

---

## Campaign/Enrollment links reauthorize on drill-down

Permanent.

---

## Cross-tenant reply association prohibited

An inbound provider event for Organization A must never link to Lead/Enrollment/Conversation in Organization B.

---

## Queue counts are permission-aware

“32 replies awaiting review” should count only the review items visible/assignable under current policy unless a governed aggregate permission says otherwise.

---

## Bulk review, if frozen design contains it

Must authorize and validate every reply independently.

No one top-level authorization decision can bypass row-level source restrictions.

---

# 5. States

Design 093 must keep **Message ingestion, Conversation read state, Campaign/Enrollment linkage, classification state, review state, assignment state and downstream action state** independent.

### Reply ingestion/linkage

Conceptually:

```text
Received
Canonical Message Created
Conversation Linked
Campaign/Enrollment Linked
Attribution Ambiguous
Attribution Unavailable
```

### Classification

```text
Not Classified
Queued
Classifying
Classified
Low Confidence / Needs Review
Failed
Unavailable
```

### Review state

```text
Unreviewed
In Review
Reviewed
Needs Re-review
```

### Assignment state

```text
Unassigned
Assigned
Reassigned
```

### Conversation read state

```text
Unread
Read
```

independent from review.

### Downstream action state

Conceptually:

```text
No Action Requested
Action Pending
Action Completed
Partially Completed
Action Failed
Action Restricted
```

Exact action taxonomy belongs to source domains.

---

## Reply received ≠ classified

Permanent.

---

## Classified ≠ reviewed

Permanent.

---

## High-confidence classification ≠ reviewed

Permanent.

---

## Reviewed ≠ Conversation read

Permanent.

---

## Conversation read ≠ reviewed

Permanent.

---

## Assigned ≠ in progress necessarily

Permanent.

---

## Assigned ≠ Lead reassigned

Permanent.

---

## Reply linked to Enrollment ≠ Enrollment changed

Permanent.

---

## Reply linked to Lead ≠ Lead status changed

Permanent.

---

## Positive classification ≠ Lead qualified

Permanent.

---

## Negative classification ≠ Lead disqualified

Permanent.

---

## Classification unavailable ≠ neutral response

Critical.

---

## Classification failed ≠ Message failed

Critical.

---

## Campaign linkage unavailable ≠ reply missing

Permanent.

---

## Lead service unavailable ≠ no Lead relation

Critical.

---

## FollowUp service unavailable ≠ no follow-up required

Critical.

---

## Task creation failed ≠ ReviewDecision failed necessarily

Permanent.

---

## Enrollment action failed ≠ Message lost

Permanent.

---

## Notification read ≠ review complete

Permanent.

---

## Duplicate provider callback ≠ duplicate Reply

Permanent.

---

## Unresolved attribution ≠ provider ingestion failure

The reply can remain safely reviewable while lineage is investigated.

---

## State Coverage

Design 093 inherits Design 150 plus:

```text
Reply Queue Loading
Reply Queue Available
Reply Queue Empty
Reply Queue Restricted

Inbound Reply Received
Conversation Linked
Conversation Link Ambiguous
Campaign / Enrollment Linked
Campaign Attribution Ambiguous
Attribution Unavailable

Conversation Unread
Conversation Read

Classification Not Started
Classification Queued
Classification In Progress
Classification Available
Classification Low Confidence
Classification Failed
Classification Service Unavailable

Reply Unreviewed
Reply In Review
Reply Reviewed
Reply Needs Re-review

Reply Unassigned
Reply Assigned
Reply Reassigned

Lead Context Available
Lead Context Restricted
Lead Service Unavailable

Campaign Context Available
Campaign Context Restricted
Campaign Service Unavailable

No Downstream Action
Downstream Action Pending
Downstream Action Completed
Downstream Action Partially Completed
Downstream Action Failed
Downstream Action Restricted

FollowUp Created
FollowUp Creation Failed
Task Created
Task Creation Failed

Provider Callback Duplicate
Provider Callback Invalid
Inbound Message Already Exists

Partial Reply Review Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **queue triage + reply context + deliberate action**, while preserving domain boundaries.

Conceptually, where supported by the frozen design:

```text
Reply Queue
↓
Reply entries
   ├── sender/contact context
   ├── reply excerpt
   ├── Campaign/Lead context
   ├── classification
   ├── review state
   └── assignment

Selected reply
   ├── canonical Conversation/Message
   ├── Campaign/Enrollment context
   ├── Lead context
   ├── automated classification
   ├── human review
   └── explicit downstream actions
```

No new frozen UI is implied.

---

## Automated classification and human decision must look different

Avoid one badge that silently becomes human truth.

Where both are shown:

```text
AI/rule classification: likely X
Human decision: Y
```

or equivalent semantics.

---

## Review state and read state should not share the same indicator

A reply can be:

> Read · Awaiting review.

That distinction must survive visually.

---

## Assignment should not look like Lead owner

Use review-context labeling.

Correct:

> Review assigned to Alice.

Not:

> Lead owner: Alice.

unless Lead ownership is independently shown.

---

## Downstream actions should remain typed

If frozen UI includes actions such as:

* create FollowUp,
* create Task,
* update Lead,
* stop Enrollment,

their labels should identify the target domain.

Avoid one ambiguous:

> Complete.

---

## Tablet

Following Design 152:

* reply queue can become compact cards,
* selected reply context stacks,
* classification/review remain visually distinct,
* downstream actions remain source-specific.

---

## Mobile

Priority:

```text
Reply
↓
Sender / Contact
↓
Reply content
↓
Campaign / Lead context
↓
Classification
↓
Review state
↓
Assignment
↓
Explicit action
```

Do not compress a desktop triage table horizontally.

---

## Mobile review completion

A prominent “Reviewed” action must not imply:

* mark Conversation read,
* stop Campaign,
* qualify Lead,
* create FollowUp

unless separate explicit operations were actually executed.

---

## Partial failure

If Lead or classification service fails:

the actual inbound Reply/Conversation should remain fully accessible where communication permissions allow.

---

## Accessibility

A queue entry could communicate:

> Reply from Sarah Patel. Campaign Executive Leaders Q4. Conversation unread. Automated classification available. Human review pending. Assigned to Alex.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical reply-ingestion architecture

```text
Provider webhook / mailbox sync
             ↓
Design 092 verification / normalization
             ↓
InboundReplyIngestionService
             │
             ├── deduplicate external message
             ├── resolve SendingAccount/tenant
             ├── resolve Conversation
             ├── create canonical inbound Message
             ├── resolve outbound Message lineage
             ├── resolve Enrollment/Campaign
             └── resolve Lead/Contact context
             ↓
          outbox/event
             ↓
   ReplyClassificationService
             ↓
     ReplyQueueProjector
             ↓
         Design 093
```

---

## Canonical Message must be created before optional classification

Critical.

Do not make inbound persistence depend on:

* Lead service,
* classifier,
* Campaign service,
* Task service.

The reply is communication truth and must survive those failures.

---

## Inbound message deduplication

Conceptually:

```text
dedupeInboundMessage(
    provider,
    providerAccount,
    providerMessageId
)
```

with fallback identifiers according to provider/channel semantics.

Repeated provider callbacks return/reuse the same canonical Message.

---

## At-least-once provider delivery

Assume provider notifications can be delivered more than once.

Handlers must be idempotent by design.

---

## Raw provider evidence vs Message

Provider payload may be retained according to policy for reconciliation/debugging.

It remains separate from canonical normalized Message.

---

## Conversation resolver

Conceptually:

```text
resolveConversation(inboundProviderEvidence)
```

should prefer:

1. provider thread relation;
2. original outbound providerMessageId;
3. RFC message/thread references;
4. other governed correlation evidence.

Do not rely merely on:

```text
sender email + subject
```

as universal threading logic.

---

## Unresolved Conversation handling

If correlation is ambiguous:

persist Message and create/retain safe unresolved review context.

Do not discard it.

---

## Campaign/Enrollment attribution

Preferred lineage:

```text
Inbound Message
      ↓
outbound Message reference/thread
      ↓
Enrollment
      ↓
Campaign
      ↓
Lead
```

This is stronger than guessing via current Contact email.

---

## Attribution confidence / ambiguity

If multiple Campaign/Enrollment contexts are plausible:

surface attribution ambiguity rather than picking arbitrarily.

---

## Lead resolution

Resolve from canonical linked Enrollment/Message/Conversation context where possible.

Current Contact/Company identity changes should not break historical response lineage.

---

## Reply queue projection

`ReplyQueueEntry` should be a read projection:

```text
ReplyQueueEntry
├── replyMessageId
├── conversationId
├── safe sender/contact summary
├── Campaign/Enrollment summary
├── Lead summary
├── classification summary
├── review state
├── assignment
└── current actionability
```

It must not become another Reply entity.

---

## Queue projection rebuildability

If lost:

rebuild from canonical:

* Message,
* Conversation,
* classification,
* ReviewDecision,
* Assignment,
* relevant source references.

---

## Queue ordering

Define stable ordering using concepts such as:

* received time,
* review urgency/assignment,

where frozen business rules require them.

Do not let frontend invent incompatible ordering semantics.

---

## Classification pipeline

Conceptually:

```text
InboundMessageCreated
        ↓
ReplyClassificationService
        ↓
classifier/rules engine
        ↓
ReplyClassification
```

---

## Classification should be asynchronous

A slow or unavailable classifier must not block inbound-message ingestion.

---

## Classification idempotency

Repeated classification job delivery should not generate uncontrolled duplicate current results.

Use message + classifier/taxonomy/version identity.

---

## Classification lineage

Store enough metadata to identify:

```text
messageId
classifier/version
taxonomy/version
classification
confidence
classifiedAt
```

without storing hidden model chain-of-thought.

---

## Classification taxonomy registry

Use a versioned controlled taxonomy.

Do not allow random provider/model labels to become Lead statuses.

---

## Reclassification

If model/rules change:

new classification can be created/recomputed while historical review remains attributable to the prior context.

---

## Human ReviewDecision service

Prefer narrow command:

```text
reviewReply(
    replyMessageId,
    expectedReviewRevision,
    decision
)
```

or equivalent.

It should:

1. authorize reviewer;
2. verify exact Message;
3. ensure current review revision;
4. record human decision;
5. preserve automated classification separately;
6. emit review event.

---

## Review idempotency

Double-clicking “Reviewed” must not create duplicate decisions/actions.

Use operation/idempotency identity.

---

## Review optimistic concurrency

If Reviewer A and Reviewer B act simultaneously:

the second action should:

* detect changed review state,
* reload/reconcile,

rather than silently overwrite A's decision.

---

## Assignment service

Use explicit command:

```text
assignReplyReview(replyMessageId, assigneeMembershipId)
```

that:

* validates target tenant,
* verifies reviewer can access Conversation,
* preserves assignment history where required,
* does not touch Lead ownership.

---

## Assignment concurrency

Two simultaneous assignments require revision/last-write policy with audit/history.

---

## Conversation read command remains Messaging-owned

```text
markConversationRead(...)
```

or canonical messaging semantics remain separate from:

```text
completeReplyReview(...)
```

---

## Review completion should not implicitly mark all Messages read

Permanent backend rule unless an explicit UI command intentionally invokes both operations.

---

## Downstream action orchestration

After ReviewDecision, explicit requested actions can flow through:

```text
ReplyActionOrchestrator
    ├── LeadService
    ├── CampaignEnrollmentService
    ├── FollowUpService
    └── TaskService
```

But the orchestrator must call canonical domain commands rather than directly changing their tables.

---

## No generic “apply response” database mutation

Avoid:

```text
UPDATE reply, lead, enrollment, task
SET ...
```

inside one generic endpoint.

---

## Lead change command

Any response-driven Lead transition must:

* reauthorize,
* validate Lead revision/current state,
* execute Lead-domain invariants,
* produce Lead-domain Audit/event.

---

## Enrollment action command

Stopping/pausing sequence execution must go through Design 090's canonical Enrollment state machine.

---

## Positive reply ≠ hidden auto-conversion

Creating a Deal or changing qualification requires explicit governed Lead/Deal workflow.

Design 093 must not bypass Design 096/Deal architecture.

---

## Negative reply ≠ hidden hard delete

A negative response may justify explicit Lead/Enrollment actions according to policy.

It must not delete:

* Lead,
* Conversation,
* Message,
* provenance.

---

## FollowUp creation

Conceptually:

```text
createFollowUpFromReply(
   replyMessageId,
   lead/contact context,
   requested details
)
```

should create a normal canonical FollowUp with a source reference to the reply.

---

## Task creation

Same principle:

```text
createTaskFromReply(...)
```

returns canonical Task ID.

---

## Downstream action idempotency

Review retry must not create:

* two Tasks,
* two FollowUps,
* repeated Enrollment stops.

Use stable action request/idempotency identities.

---

## Partial action outcome

If multiple independent actions are requested:

record/surface each result separately.

Example:

```text
ReviewDecision            succeeded
Lead update               succeeded
Enrollment stop           succeeded
FollowUp creation         failed
```

Do not report an ambiguous full success.

---

## Distributed transaction boundary

Do not hold one database transaction across:

* Messaging,
* Lead,
* Campaign,
* Task systems

if they are separate services/domains.

Use durable command/outbox/saga-style coordination where appropriate.

---

## ReviewDecision persists independently of notification

Notification service failure cannot roll back review.

---

## Notification integration

Events such as:

```text
InboundReplyReceived
ReplyAssigned
ReplyReviewRequired
```

can feed Design 080.

Notification records remain independent.

---

## Queue count resolver

Header/sidebar badge and Design 093 queue counts should use the same server-authoritative review-state resolver.

Do not derive one from:

* unread Conversations,

and another from:

* unreviewed replies.

They are different metrics.

---

## Search

If Design 079 indexes safe reply/conversation metadata:

authorization must be strict.

Do not make complete outbound/inbound Message content globally searchable unless explicitly governed.

---

## Audit

Material review operations can include:

```text
ReplyReviewAssigned
ReplyReviewDecisionRecorded
LeadActionRequestedFromReply
EnrollmentActionRequestedFromReply
FollowUpCreatedFromReply
TaskCreatedFromReply
```

according to audit policy.

Automated classification jobs are operational/model history rather than necessarily human Audit events.

---

## Activity

A human review decision or follow-up creation may generate useful Activity projections.

Activity ≠ Audit ≠ Message.

---

## Historical retention

Archiving a Campaign, Lead, SendingAccount, or Template must not delete inbound Message/Conversation history needed for response evidence.

---

## Contact merge handling

If Contact records merge after the reply:

current Contact navigation may resolve to the survivor.

Historical inbound sender/address evidence remains unchanged.

---

## Lead conversion handling

If Lead later converts to a Deal:

the original reply remains linked to historical Lead/Campaign/Enrollment lineage.

Do not move/delete it into the Deal domain.

---

## Performance

Use:

* paginated reply queue,
* batched safe Lead/Campaign summaries,
* projected current classification/review/assignment,
* lazy Conversation history,
* indexed review state/assignment/receivedAt.

Do not load every full Conversation for the initial queue.

---

## Permission-safe caching

Cache varies by:

```text
organizationMembership
authorization revision
reply queue filters
review revision
assignment revision
```

Do not cache one unrestricted queue per tenant for all users.

---

## Partial dependency failure

Example:

```text
Conversation/Message   ✓
Campaign context       ✓
Lead context           ✕
Classification         ✕
Work service           ✕
```

Design 093 should still show:

* actual reply content,
* Conversation,
* Campaign context where authorized,
* “Lead unavailable”,
* “Classification unavailable”,
* work actions unavailable.

The canonical Reply must never disappear.

---

## Backend Requirement Matrix

| Requirement                                                 | Status                |
| ----------------------------------------------------------- | --------------------- |
| Canonical Conversation reuse from 014                       | **Critical**          |
| Canonical Message reuse from 014                            | **Critical**          |
| Provider Reply/Message separation                           | **Critical**          |
| Inbound callback/message idempotency                        | **Critical**          |
| Provider/account-scoped dedupe IDs                          | **Critical**          |
| No subject-only threading                                   | **Critical**          |
| Conversation threading via strong evidence                  | **Critical**          |
| Unresolved reply retention                                  | **Critical**          |
| Campaign/Enrollment attribution separate from Message       | **Critical**          |
| Attribution ambiguity supported                             | **Critical**          |
| Reply/Enrollment separation                                 | **Critical**          |
| Reply/Lead separation                                       | **Critical**          |
| Lead resolution failure cannot drop reply                   | **Critical**          |
| ReplyQueueEntry as read projection                          | **Critical**          |
| Classification/Message separation                           | **Critical**          |
| Classification/LeadStatus separation                        | **Critical**          |
| Classification/Enrollment state separation                  | **Critical**          |
| Automated classification/Human decision separation          | **Critical**          |
| Versioned classification taxonomy                           | **Critical**          |
| Classification confidence/uncertainty                       | **Critical**          |
| Async classification                                        | **Critical**          |
| Classification failure/manual review continuity             | **Critical**          |
| ReviewDecision first-class history                          | **Critical**          |
| Review decision idempotency                                 | **Critical**          |
| Review optimistic concurrency                               | **Critical**          |
| Review/read-state separation                                | **Critical**          |
| Assignment/Lead owner separation                            | **Critical**          |
| Assignment/Task separation                                  | **Critical**          |
| Assignment authorization                                    | **Critical**          |
| Explicit Lead commands                                      | **Critical**          |
| Explicit Enrollment commands                                | **Critical**          |
| Positive/negative interpretation ≠ automatic state mutation | **Critical**          |
| FollowUp creation uses canonical Design 015 model           | **Critical**          |
| Task creation uses canonical Design 034 model               | **Critical**          |
| Downstream action idempotency                               | **Critical**          |
| Partial downstream-action results                           | **Critical**          |
| No generic multi-domain mega-PATCH                          | **Critical**          |
| Durable/outbox coordination                                 | **Required**          |
| Notification/Reply separation                               | **Critical**          |
| Notification read/Review complete separation                | **Critical**          |
| Tenant isolation                                            | **Critical**          |
| Section/source authorization                                | **Critical**          |
| Permission-aware queue counts                               | **Critical**          |
| Historical Message evidence preservation                    | **Critical**          |
| Contact/Lead later changes do not rewrite reply             | **Critical**          |
| Campaign archive does not delete replies                    | **Critical**          |
| Pagination/indexing                                         | **Required at scale** |
| Permission-safe caching                                     | **Critical**          |
| Audit integration                                           | **Required**          |
| Partial dependency failure handling                         | **Critical**          |

---

# 8. Consolidation

Design 093 exposes serious risks if communication, AI classification, review workflow and Sales state are collapsed.

**Provider reply / canonical Message conflation**
Each provider creates a different reply entity.

**Provider callback / inbound Message conflation**
Repeated webhook creates duplicate reply.

**Webhook retry / new Message conflation**
Provider delivery guarantees duplicate Inbox items.

**Provider message ID / global ID conflation**
Different accounts/providers collide.

**Sender email / Message identity conflation**
Two messages from same sender collapse.

**Subject / Conversation identity conflation**
Unrelated emails with same subject thread together.

**Current email / historical threading conflation**
Contact changes address and old Conversation disappears.

**Reply / Conversation conflation**
Every inbound Message creates another thread.

**Conversation / Campaign conflation**
Campaign completion deletes ongoing communication.

**Conversation / Enrollment conflation**
Sequence execution and communication lifecycle become one.

**Reply / Enrollment conflation**
Inbound Message state directly overwrites Enrollment.

**Reply / Lead conflation**
Message becomes CRM record.

**Lead-resolution failure / reply-ingestion failure conflation**
Valid customer response disappears because CRM is unavailable.

**Campaign attribution failure / reply deletion conflation**
Unmatched replies are lost.

**Ambiguous attribution / arbitrary attribution conflation**
Reply attaches to wrong Campaign/Lead.

**ReplyClassification / Message conflation**
Machine label overwrites communication evidence.

**Classification / LeadStatus conflation**
Model prediction directly changes CRM lifecycle.

**Classification / qualification conflation**
“Interested” automatically marks Lead qualified.

**Classification / Enrollment state conflation**
“Negative” automatically mutates sequence state without policy.

**Automated classification / ReviewDecision conflation**
AI prediction is treated as human-approved action.

**High confidence / human approval conflation**
Unreviewed model result gains business authority.

**Classification failure / reply failure conflation**
Reply vanishes when classifier is unavailable.

**Classifier unavailable / neutral response conflation**
Unknown is interpreted as “no interest.”

**New classifier version / historical classification rewrite conflation**
Old decisions become unexplained.

**Human override / classification rewrite conflation**
System falsely records model as having predicted human decision.

**ReviewDecision / Message mutation conflation**
Review changes original reply text.

**Reviewed / read conflation**
Completing workflow manipulates Inbox read state.

**Read / reviewed conflation**
Opening email removes it from review queue.

**Reviewed / Lead converted conflation**
Simple review completion creates Sales conversion.

**Review assignment / Lead owner conflation**
Triage responsibility changes CRM ownership.

**Assignment / Task conflation**
Queue ownership creates duplicate Work items.

**Assignment / authorization conflation**
Assigning a reply bypasses Conversation permission.

**Assignment / Conversation participant conflation**
Internal reviewer becomes external thread participant.

**Reassignment / Lead reassignment conflation**
Operational queue routing changes Sales ownership.

**FollowUp / reply next-action field conflation**
Work is embedded as untracked reply metadata.

**Task / ReviewDecision conflation**
Completing review automatically completes internal work.

**Task creation failure / review failure conflation**
Valid review is lost because work service failed.

**Review success / all side effects success conflation**
Partial downstream failures are hidden.

**Positive response / Lead qualification conflation**
Reply interpretation bypasses qualification policy.

**Positive response / Deal creation conflation**
Reply automatically creates Opportunity.

**Negative response / Lead deletion conflation**
Historical CRM person/opportunity evidence is destroyed.

**Negative response / Campaign cancellation conflation**
One recipient stops entire Campaign.

**Reply / Notification conflation**
Dismissed notification removes review obligation.

**Notification read / Conversation read conflation**
Attention system changes messaging state.

**Notification read / Review complete conflation**
User clears alert and reply disappears from queue.

**Queue count / unread count conflation**
Sidebar and review queue disagree operationally.

**Conversation read state / workflow state conflation**
Messaging and triage cannot evolve independently.

**Lead access / Conversation access conflation**
Sales record permission leaks private communication.

**Conversation access / Lead edit conflation**
Inbox reader can mutate CRM.

**Review permission / Enrollment permission conflation**
Reviewer can stop Campaign execution without authority.

**Review permission / Task creation permission conflation**
Triage role creates arbitrary work.

**Classification label / sensitive-content leak**
Unauthorized user learns message intent through queue metadata.

**Cross-tenant provider event association**
Reply is attached to another customer's Campaign.

**Browser-supplied reviewer identity**
User falsifies who made ReviewDecision.

**Browser-supplied assignee identity without validation**
Reply is routed to unauthorized membership.

**Direct reply ID / authorization token conflation**
Knowing ID exposes Message.

**Bulk review / one authorization check conflation**
Restricted Conversations are mutated.

**Mega response endpoint**
One mutation updates reply, Lead, Campaign, Enrollment and Task tables directly.

**Distributed mega-transaction**
Messaging truth becomes dependent on CRM/work availability.

**Classification service dependency on ingestion**
AI outage drops customer communication.

**Lead service dependency on ingestion**
CRM outage drops reply.

**Work service dependency on review display**
Task outage hides Conversation.

**Campaign archive / Reply deletion conflation**
Customer communication history is destroyed.

**Lead conversion / Reply migration conflation**
Old reply is moved into Deal and loses original lineage.

**Contact merge / sender snapshot rewrite conflation**
Historical sender address becomes current Contact address.

**Reply queue projection / canonical Reply conflation**
Deleting/rebuilding queue loses Messages.

**Queue cache / authorization token conflation**
Higher-privilege user's reply data leaks to another reviewer.

**093/014 duplicate Inbox backend**
Reply Queue and Unified Inbox disagree on Message truth.

**093/090 duplicate Enrollment lifecycle**
Reply workflow invents Campaign state.

**093/092 duplicate provider ingestion**
Reply Queue processes raw provider callbacks independently.

**093/089 duplicate Lead state**
Response classification becomes CRM lifecycle.

**093/015 duplicate FollowUp model**
Reply screen creates another next-action system.

**093/034 duplicate Task model**
Review assignment becomes second Task backend.

**093/080 duplicate Notification model**
New reply alert and review obligation become one record.

No additional screen is required.

These are **communication identity, inbound deduplication, Conversation attribution, classification governance, human review, assignment, source-domain actioning, work creation, authorization and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL OUTREACH REPLY REVIEW, HUMAN DECISION & RESPONSE-ACTION ANCHOR**

**Domain directive:**
**Conversation ≠ Message/Reply ≠ OutreachEnrollment ≠ Lead ≠ ReplyClassification ≠ ReviewDecision ≠ Assignment ≠ FollowUp/Task ≠ Campaign ≠ Notification.**

**Communication directive:**
Design 014 remains the sole canonical Conversation/Message infrastructure. Every provider-originated inbound response becomes one canonical inbound Message rather than a provider-specific Reply entity.

**Provider-ingestion directive:**
Design 092 remains responsible for provider verification and normalized integration evidence. Provider webhook/sync retries must deduplicate to the same canonical inbound Message.

**Threading directive:**
Conversation resolution should use strong provider/thread/message-reference evidence whenever available. Sender address or subject alone must never be universal threading identity.

**Retention directive:**
when Campaign/Enrollment/Lead attribution cannot yet be resolved, the Message is still retained and reviewable. Association failure never means communication loss.

**Lineage directive:**
inbound Message can reference outbound Message → Enrollment → Campaign → Lead lineage without becoming any of those entities.

**Reply/Lead directive:**
Lead state remains canonical in Designs 011/089. Receiving, reading, classifying, assigning or reviewing a Reply never silently mutates Lead status, qualification, owner or conversion.

**Enrollment directive:**
Enrollment state remains Design 090's domain. Positive/negative/other response interpretation can request a governed Enrollment command, but classification itself never pauses/stops/completes Enrollment.

**Campaign directive:**
one recipient reply never directly changes entire Campaign lifecycle.

**Classification directive:**
`ReplyClassification` is a versioned automated/rule/model assessment of an exact Message, with explicit processing/confidence semantics. It never modifies Message content or CRM state.

**AI/human boundary directive:**
automated classification remains permanently distinct from authorized human `ReviewDecision`. A human disagreement is recorded as a human decision, not by rewriting what the classifier originally produced.

**Classifier-failure directive:**
classification is asynchronous and optional to communication integrity. Classifier outage/failure must leave the Reply fully available for manual review.

**Review directive:**
`ReviewDecision` records the authenticated reviewer, exact Reply, decision context, timestamp and any explicit resulting action references. It is append-oriented/idempotent and revision-protected.

**Read-state directive:**
Conversation unread/read state remains Messaging state. `Reviewed` and `Read` must never be represented by one flag or one backend command.

**Assignment directive:**
review assignment determines who is responsible for triage only. It does not change Lead ownership, Task assignment, Conversation participants, roles or permissions.

**Work directive:**
if response review creates FollowUp or Task work, it must create canonical Design 015/034 entities with typed source references back to the Reply. Reply metadata cannot substitute for real work records.

**Action directive:**
response-driven Lead, Enrollment, FollowUp and Task effects invoke their canonical domain services with fresh authorization, state validation and idempotency. Design 093 never directly patches their tables.

**Positive/negative directive:**
response sentiment/intent can inform a human/governed action, but positive ≠ qualified Lead ≠ Deal created and negative ≠ disqualified/deleted Lead ≠ Campaign cancelled.

**Partial-action directive:**
human review completion and downstream action execution remain separately observable. If Lead update succeeds but FollowUp creation fails, the system must preserve and show that partial result rather than claim full success.

**Concurrency directive:**
simultaneous reviewers/assignees require optimistic revision or equivalent concurrency handling so one human cannot silently overwrite another's ReviewDecision.

**Idempotency directive:**
provider retries, classifier retries, review submission retries, FollowUp/Task creation retries and Enrollment action retries must all be replay-safe and must not create duplicate Messages or work.

**Authorization directive:**
Reply visibility, review authority, assignment, Lead mutation, Enrollment mutation and work creation are independently server-authorized. Page/queue access cannot bypass source-domain permissions.

**Privacy directive:**
classification summaries, Lead/Campaign projections and queue counts must not leak restricted Message content or hidden CRM records.

**Notification directive:**
Design 080 can alert a user that a Reply arrived or was assigned, but Notification read/dismissal never changes Conversation read state, review state or source-domain actionability.

**Queue directive:**
`ReplyQueueEntry` is a permission-safe rebuildable projection over canonical Message, Conversation, classification, ReviewDecision and Assignment records. It is never an editable second Reply backend.

**Partial-failure directive:**
Message/Conversation remains authoritative and visible when Lead, Campaign, classifier, assignment or work services fail. Each unavailable dependency is surfaced locally instead of turning the Reply into “not found” or fake empty context.

**Historical-evidence directive:**
later Contact email/employer changes, Lead conversion, Campaign archive or SendingAccount reconnection never rewrite the exact historical inbound Message, participant/address evidence or outreach lineage.

**Caching/performance directive:**
use permission-safe paginated queue projections, batched Campaign/Lead summaries, lazy Conversation history and indexed review/assignment state instead of loading every complete thread for initial triage.

**Audit directive:**
human assignment/review and explicit downstream source-domain actions generate appropriate Audit evidence, while automated classification/provider ingestion retain their own operational/model provenance.

**Future-reuse directive:**
Design 094 Meeting Detail / Meeting Outcome Workspace must consume canonical Meetings and any meeting creation/context resulting from outreach/Lead workflows rather than introducing response-specific Meeting records.

**Overlap directive:**
Designs **014–015, 034, 080, 089–094** must share one continuous **Inbound Message → Conversation → Campaign/Enrollment/Lead Context → Classification → Human Review → Explicit Source-Domain Action** lineage while preserving communication, CRM, Campaign, review and work identities independently.

**Consolidation directive:**
**STANDARDIZE ONE OUTREACH RESPONSE-REVIEW FOUNDATION — CANONICAL INBOUND MESSAGE/CONVERSATION + PROVIDER-VERIFIED IDEMPOTENT INGESTION + STRONG OUTBOUND-MESSAGE/CAMPAIGN/ENROLLMENT CORRELATION + VERSIONED AUTOMATED REPLYCLASSIFICATION + EXPLICIT HUMAN REVIEWDECISION + INDEPENDENT REVIEW ASSIGNMENT + SOURCE-DOMAIN LEAD/ENROLLMENT COMMANDS + CANONICAL FOLLOWUP/TASK CREATION + PERMISSION-AWARE REPLY QUEUE PROJECTION — AND NEVER ALLOW PROVIDER CALLBACKS, CLASSIFIER LABELS, READ STATE, REVIEW ASSIGNMENT, NOTIFICATIONS OR REVIEW COMPLETION TO SILENTLY BECOME LEAD LIFECYCLE, CAMPAIGN STATE, ENROLLMENT STATE OR WORK COMPLETION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **93 / 153** |
| **PASS**                                   |                         **93** |
| **STANDARDIZE decisions**                  |                         **91** |
| **Potential implementation-overlap flags** |                         **84** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**93 / 153 = 60.8% audited.**

### Canonical Outreach response architecture after Design 093

```text
                 PROVIDER
                    │
          webhook / mailbox sync
                    ↓
          verified provider event
                    ↓
             INBOUND MESSAGE
              canonical truth
                    ↓
               CONVERSATION
                    │
      ┌─────────────┼──────────────┐
      ↓             ↓              ↓
   Campaign      Enrollment       Lead
   context        context        context
                    │
                    ↓
            ReplyClassification
              automated result
                    │
                    ↓
              ReviewDecision
                human truth
                    │
        ┌───────────┼───────────┐
        ↓           ↓           ↓
 Lead command   Enrollment    FollowUp /
                 command        Task
```

The critical classification boundary is:

```text
Automated classification
        ↓
“Likely positive”

        ≠

Human ReviewDecision
        ↓
“Confirmed — create follow-up”
```

And even the human decision remains distinct from the actual source-domain action:

```text
ReviewDecision recorded         ✓
Enrollment stop requested       ✓
Lead update                     ✓
FollowUp creation               ✕

RESULT:
Review decision remains valid.
FollowUp is explicitly FAILED / RETRYABLE.

NOT:
everything marked “Reviewed successfully.”
```

The provider retry rule is equally strict:

```text
Provider sends callback #1
        ↓
Inbound Message M-100 created

Provider retries same callback
        ↓
dedupe by provider/account/message identity

RESULT:
reuse M-100

NOT:
create M-101 duplicate reply
```

And queue/read state remain independent:

```text
Conversation = READ
Review = PENDING

or

Conversation = UNREAD
Review = COMPLETED
```

Both are valid.

## Next Sequential Audit Target

### **Design 094 — Meeting Detail / Meeting Outcome Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged contract.
