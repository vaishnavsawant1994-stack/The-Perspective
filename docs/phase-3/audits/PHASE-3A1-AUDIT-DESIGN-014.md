Correct. I retrieved the exact frozen identity and neighboring sequence before auditing it:

**Design 013 — Outreach Sequence Builder → Design 014 — Unified Inbox / Replies → Design 015 — Meetings & Follow-ups.**

So we continue strictly with:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 014 — Unified Inbox / Replies

| Audit field                 | Classification                                                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **014**                                                                                                                                                                                     |
| **Canonical name**          | **Unified Inbox / Replies**                                                                                                                                                                 |
| **Product area**            | Communications / Sales / Client Engagement                                                                                                                                                  |
| **User surface**            | Team Workspace                                                                                                                                                                              |
| **Screen class**            | Communication Inbox / Conversation Operations Workspace                                                                                                                                     |
| **Classification**          | **Unique Anchor — Unified Communication Workspace Family**                                                                                                                                  |
| **Primary purpose**         | Centralize inbound and outbound business conversations, correlate replies to Contacts/Leads/Campaigns, assign ownership, triage responses and turn conversations into actionable sales work |
| **Primary entities**        | **Conversation / Thread, Message**                                                                                                                                                          |
| **Supporting entities**     | Contact, Company, Lead, Campaign, Enrollment, SendingAccount, User, Meeting, FollowUp, Task, Attachment                                                                                     |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                                             |
| **Template family**         | `CommunicationInboxWorkspaceTemplate`                                                                                                                                                       |
| **Auth**                    | Required                                                                                                                                                                                    |
| **Permissions**             | Inbox/account/team/conversation scoped                                                                                                                                                      |
| **Implementation priority** | **Core / Critical**                                                                                                                                                                         |
| **Reuse level**             | Very High across Reply Queue, client messaging and notification/message-style surfaces                                                                                                      |

---

# 1. Functional responsibility

Design 014 answers:

> **“What conversations have arrived, who are they from, what business context do they belong to, who owns the response, and what should happen next?”**

It is the bridge between outbound activity and human sales action.

The canonical flow can be:

```text
Campaign / Manual communication
          ↓
Outbound Message
          ↓
External recipient
          ↓
Inbound Reply
          ↓
Provider / mailbox synchronization
          ↓
Canonical Message
          ↓
Conversation correlation
          ↓
Contact / Lead / Campaign context
          ↓
Human triage
          ↓
Reply / Meeting / Follow-up / Deal action
```

The central architectural rule is:

> **The Inbox is not merely a visual copy of Gmail or Outlook. It is the platform's canonical business-conversation layer built on top of connected communication providers.**

---

# 2. Conversation ≠ Message

This distinction must be frozen immediately.

### Conversation / Thread

Represents the ongoing communication context.

### Message

Represents one individual inbound or outbound communication event.

Conceptually:

```text
Conversation C-1024
│
├── Message 1 — OUTBOUND
├── Message 2 — INBOUND
├── Message 3 — OUTBOUND
└── Message 4 — INBOUND
```

Therefore:

```text
Conversation status
≠
Message delivery state
```

A thread may be **Open** while one outbound message inside it is **Delivered** and another inbound message is **Unread**.

---

# 3. Message direction must be explicit

Every canonical Message should know whether it is:

```text
INBOUND
OUTBOUND
```

Potentially system-generated messages can have an additional origin/type concept, but direction should remain unambiguous.

This becomes essential for:

* timeline rendering,
* unread counts,
* reply attribution,
* analytics,
* campaign matching,
* audit history.

---

# 4. Read state ≠ workflow state

A major implementation trap would be using one `status` for everything.

These are different:

### Read state

```text
READ
UNREAD
```

### Conversation workflow state

Conceptually:

```text
OPEN
PENDING
CLOSED
```

or whatever exact canonical states are later approved.

### Assignment state

```text
ASSIGNED
UNASSIGNED
```

### Message delivery state

For outbound messages:

```text
QUEUED
SENT
DELIVERED
BOUNCED
FAILED
```

Do not collapse them.

---

# 5. Canonical Inbox regions

Without redesigning the approved screen, implementation should normalize into reusable responsibilities.

### Inbox Navigation

Potential views can include approved concepts such as:

**All**
**Unread**
**Assigned to Me**
**Needs Reply**
**Sent / Outbound context**
**Archived/Closed where supported**

The exact labels remain tied to the frozen design.

### Conversation List

Priority information:

**Contact / Sender**
**Company**
**Subject / latest message preview**
**Timestamp**
**Unread state**
**Owner**
**Campaign / Lead context**
**Attention indicators**

### Conversation Detail

Should show:

* chronological messages,
* sender/recipient context,
* related Lead/Contact/Company,
* campaign attribution,
* attachments,
* reply composer,
* contextual actions.

### Context / Action Panel

Where represented in the design, it can expose:

**Lead status**
**Company**
**Campaign**
**Owner**
**Previous activity**
**Meeting / follow-up actions**

But canonical record editing should remain owned by those modules.

---

# 6. Provider mailbox vs canonical conversation

The platform should not make provider-specific mailbox objects the internal domain model.

Correct:

```text
Gmail / Outlook / supported provider
             ↓
Provider Adapter
             ↓
Normalized Message
             ↓
Conversation Correlation
             ↓
Canonical Conversation
```

Incorrect:

```text
Application UI
   ↓
directly renders provider-specific payload everywhere
```

This abstraction lets the platform work consistently even when multiple mailbox providers are connected.

---

# 7. Provider IDs must still be preserved

Abstraction does not mean discarding provider references.

A canonical Message may need:

```text
provider
providerAccountId
providerMessageId
providerThreadId
internetMessageId
```

or equivalent normalized references.

These help with:

**deduplication**
**sync**
**reply threading**
**delivery state**
**troubleshooting**

They should remain infrastructure metadata rather than become the UI's domain identity.

---

# 8. Canonical message model

Conceptually:

```text
Message
├── id
├── organizationId
├── conversationId
├── direction
├── sender
├── recipients
├── subject
├── bodySnapshot
├── sentAt / receivedAt
├── providerMetadata
├── deliveryState
├── campaign/enrollment reference
├── attachments
└── createdAt
```

The exact fields will be finalized in Phase 3D.

A Message should represent historical communication and therefore normally behave as an immutable or append-oriented record after receipt/send.

---

# 9. Message content history

Once an external message has been sent:

> **The content that was actually sent must remain historically reconstructable.**

Changing an Outreach Template later must not alter Inbox history.

This reinforces the architecture established in Designs 012–013:

```text
Template Version
      ↓
Sequence Version
      ↓
Rendered Message Snapshot
      ↓
Message record
      ↓
Unified Inbox
```

---

# 10. Conversation correlation

Incoming communication needs to be mapped to the correct existing Conversation when possible.

Signals may include:

* provider thread identifier,
* standard email threading headers,
* previous provider message identifiers,
* sending account,
* sender/recipient combination,
* canonical outbound-message references.

The system should not rely solely on:

> same subject line

because unrelated messages can share a subject.

---

# 11. Contact identity correlation

After receiving an inbound Message:

```text
Sender address
     ↓
Identity resolution
     ↓
Known Contact?
```

Possible outcomes:

```text
Known Contact
    ↓
link Contact / Lead / Company context
```

or:

```text
Unknown Sender
    ↓
unresolved conversation
    ↓
review / create/link Contact if authorized
```

The system should not silently create canonical Contacts for every unknown sender without validation.

---

# 12. Campaign correlation

Outreach Replies need strong lineage:

```text
Campaign
   ↓
Enrollment
   ↓
Outbound Message
   ↓
Inbound Reply
```

If this correlation exists, Design 014 should expose it.

This makes attribution possible:

**Campaign → Reply → Meeting → Deal**

without guessing from email addresses later.

---

# 13. Reply detection is a runtime event

When a Reply arrives for an active Outreach Enrollment:

```text
Inbound Message
      ↓
Correlate Enrollment
      ↓
Reply event
      ↓
Outreach stop-policy evaluation
      ↓
Pending automated steps affected
```

This is the runtime mechanism anticipated during the Design 013 audit.

The Inbox displays and acts upon the reply.

It must not be responsible for manually stopping every pending Sequence job.

---

# 14. Unified Inbox vs Design 093 — Reply Queue

This is one of the most important consolidation findings.

### Design 014 — Unified Inbox / Replies

Broad communication workspace.

Purpose:

> **Read and manage business conversations across the Team Workspace.**

### Design 093 — Reply Queue / Outreach Response Review

Specialized sales-triage workspace.

Purpose:

> **Review campaign-generated responses requiring outreach-specific classification and action.**

Therefore:

```text
Canonical Message / Conversation Service
            │
            ├── Design 014
            │   Unified conversation experience
            │
            └── Design 093
                Outreach reply triage
```

### Audit decision

**ONE MESSAGE/CONVERSATION BACKEND — TWO PURPOSE-SPECIFIC UX SURFACES.**

Do not build separate reply databases.

---

# 15. Potential implementation-overlap flag

Design 014 and Design 093 are now formally flagged for later comparison.

They are **not screen-merge candidates yet**.

Their likely reusable elements include:

`ConversationList`
`MessageThread`
`ReplyComposer`
`ContactContext`
`AssignmentControl`
`ReplyClassificationBadge`

But Design 093 may provide additional high-volume triage behaviors not appropriate for the general Inbox.

---

# 16. Reply classification

Outreach-related replies may require structured interpretation.

Conceptually, classification can distinguish business meaning such as:

**positive intent**
**negative / not interested**
**needs follow-up**
**out-of-office / automatic response**
**unsubscribe request**
**unclear / manual review**

The exact canonical taxonomy should be finalized later.

The audit requirement is:

> **Reply classification must remain a separate structured attribute from Message content and Conversation status.**

---

# 17. Human vs automated classification

If AI or automation later assists with reply classification:

```text
Inbound Message
      ↓
Suggested Classification
      ↓
Confidence
      ↓
Human confirmation when required
```

The system should distinguish:

**system suggestion**
from
**confirmed business decision**.

No opaque AI result should silently trigger high-impact actions without appropriate policy.

---

# 18. Unsubscribe handling

An unsubscribe request has broader consequences than simply closing the current Conversation.

Conceptually:

```text
Unsubscribe Reply
       ↓
Confirm / detect canonical unsubscribe event
       ↓
Suppression service
       ↓
Communication eligibility updated
       ↓
Active outreach enrollments stopped as required
```

Design 014 surfaces the communication.

The canonical suppression service owns the communication restriction.

---

# 19. Out-of-office handling

An automatic out-of-office response is technically an inbound Message, but business meaning differs from a genuine human Reply.

The architecture should allow:

```text
Message Direction: INBOUND
Reply Classification: AUTO_RESPONSE
```

rather than incorrectly counting every inbound email as a positive response.

This is crucial for Campaign metrics.

---

# 20. Reply metrics

Terms such as:

**Replies**
**Unique Responders**
**Positive Replies**
**Reply Rate**

must use canonical definitions established across Outreach.

Design 014 should consume those definitions; it should not calculate them independently from whatever happens to be visible in the Inbox.

---

# 21. Assignment model

A Conversation may have an operational owner.

Conceptually:

```text
Conversation
├── assignedUser
├── assignedTeam
└── assignment history
```

This helps answer:

> **Who is responsible for responding?**

Conversation ownership does not necessarily change Lead ownership.

Example:

```text
Lead Owner: Aisha
Conversation temporarily assigned to: Daniel
```

These are related but distinct responsibilities.

---

# 22. Assignment history

Changes such as:

```text
Unassigned
   ↓
Aisha
   ↓
Daniel
```

should create meaningful activity history.

This matters for:

* accountability,
* SLA tracking,
* workload analytics,
* escalation.

---

# 23. SLA / response-time architecture

Inbox operations may need concepts such as:

**Waiting for us**
**Waiting for contact**
**Response overdue**

These should be derived from conversation/message history and configurable operational policy.

Do not store:

> `redBadge = true`

as business state.

Canonical timing logic should drive the UI.

---

# 24. Conversation status vs “waiting on”

Another useful distinction:

```text
Conversation Status: OPEN
Waiting On: TEAM
```

or:

```text
Conversation Status: OPEN
Waiting On: CONTACT
```

This produces better queue prioritization than overloading `OPEN`, `PENDING`, etc. with ambiguous meanings.

Exact implementation will be determined later.

---

# 25. Reply composer architecture

The Reply composer should use canonical Message sending infrastructure.

Correct:

```text
User composes Reply
       ↓
Server validation + permission
       ↓
Canonical Message created / queued
       ↓
Sending Service
       ↓
Connected Sending Account
       ↓
Provider
```

Not:

```text
Browser directly calls Gmail/Outlook API with credentials
```

---

# 26. Drafts

If reply drafts are supported, a Draft should be separate from a sent Message.

Conceptually:

```text
MessageDraft
      ↓
Send command
      ↓
Canonical Outbound Message
```

A draft can be edited.

A sent historical Message should not.

This separation simplifies synchronization and auditability.

---

# 27. Reply account selection

When multiple Sending Accounts exist, the platform must determine which account can validly send the Reply.

Usually the conversation's receiving/sending context should strongly inform this.

The Reply composer should not let an unauthorized user arbitrarily send from every connected mailbox.

Account access is permission-scoped.

---

# 28. Sending account boundary

As established previously:

### Design 092

Owns:

**Sending Accounts / Email Connections**

### Design 014

Consumes those connections.

Therefore:

```text
Design 092
Connection configuration
      ↓
Sending / Inbox infrastructure
      ↓
Design 014
Conversation operations
```

No duplicate OAuth/account connection screen should be implemented inside the Inbox.

---

# 29. Inbound synchronization architecture

Connected mailboxes require backend synchronization.

Conceptually:

```text
Provider
   ↓
Webhook / scheduled sync
   ↓
Inbox Sync Service
   ↓
Idempotent event processing
   ↓
Canonical Message
   ↓
Conversation correlation
```

The exact provider mechanism can vary.

The UI should not poll entire provider mailboxes directly.

---

# 30. Idempotent inbound processing

A provider may deliver the same webhook/event multiple times.

Example:

```text
Inbound provider event
      ↓
received twice
```

The result must be:

> **one canonical Message**

not two duplicate Inbox replies.

Provider message IDs and idempotency keys are therefore critical.

---

# 31. Sync cursor / checkpoint

For polling or recovery-based connectors, the platform needs durable synchronization state.

Conceptually:

```text
MailboxSyncState
├── accountId
├── cursor/checkpoint
├── lastSuccessfulSync
├── lastAttempt
└── syncHealth
```

This enables recovery without re-importing the mailbox from the beginning.

---

# 32. Provider outage behavior

If a mailbox provider becomes unavailable:

```text
Existing synced conversations   ✓
Historical messages             ✓
New synchronization             ✕ delayed
```

The Inbox should preserve existing data and show:

> synchronization temporarily delayed

rather than appearing completely empty.

This is an important Design 150 partial-failure case.

---

# 33. Attachments

Messages may contain attachments.

Canonical attachment handling should pass through the platform's secure file infrastructure.

The application should consider:

* file metadata,
* permissions,
* malware/security scanning where applicable,
* safe download/access,
* size limits,
* external-provider references or copies.

Attachments must not bypass the platform's authorization controls simply because they originated from email.

---

# 34. External content safety

Email content is untrusted external input.

Rendering should protect against:

* executable scripts,
* unsafe HTML,
* malicious links/content,
* tracking elements where policy requires,
* unsafe attachment behavior.

This is a security requirement, not a visual redesign.

---

# 35. Search architecture

Inbox search can eventually operate across approved fields such as:

**sender**
**recipient**
**subject**
**message content**
**Contact**
**Company**
**Campaign**

but query execution must be permission-scoped.

A user should not discover restricted conversations merely because global text search indexed them.

---

# 36. Pagination / incremental loading

A large Inbox should use server-side pagination or cursors.

Do not:

```text
load 200,000 Messages into browser
```

and filter locally.

Conversation list and message history may require separate pagination strategies.

---

# 37. Real-time updates

The Inbox benefits from near-real-time updates.

Architecturally:

```text
New canonical Message
      ↓
event / subscription layer
      ↓
authorized active clients
      ↓
Inbox refresh/update
```

But real-time delivery remains an enhancement over authoritative database state.

The platform must still work correctly after refresh/reconnect.

---

# 38. Optimistic send behavior

The UI may show a temporary sending state after a Reply is submitted.

But it must distinguish:

```text
SENDING
```

from:

```text
SENT
```

and:

```text
FAILED
```

A local optimistic bubble should never be mistaken for confirmed provider delivery.

---

# 39. Meeting conversion

A promising Reply may lead directly to:

**Schedule Meeting**

Correct architecture:

```text
Conversation
     ↓
Create Meeting action
     ↓
Canonical Meeting Service
     ↓
Meeting linked to
Contact / Lead / Conversation
```

Design 014 should not create a second calendar implementation.

This hands off naturally to Design 015.

---

# 40. Follow-up conversion

Likewise:

```text
Conversation
     ↓
Create Follow-up
     ↓
Canonical FollowUp / Task system
```

The resulting action should remain linked to the originating Conversation when useful.

This creates business lineage:

```text
Reply
 ↓
Follow-up
 ↓
Meeting
 ↓
Deal
```

---

# 41. Lead / Deal update boundary

A user may decide from a Reply that a Lead is now:

**qualified**

or ready for a Deal.

Design 014 can expose actions such as:

**Open Lead**
**Qualify Lead**
**Create Deal**

where approved.

But those actions must invoke canonical Lead/Deal services.

The Inbox must not independently mutate CRM states.

---

# 42. Internal notes vs external replies

If the product supports internal conversation notes, they must be unmistakably separate from outbound Messages.

Conceptually:

```text
Conversation Event
├── External Message
└── Internal Note
```

An internal note must never accidentally be transmitted to the external contact.

This is a high-risk UX/backend boundary.

---

# 43. Permission architecture

Potential permission dimensions later include:

```text
inbox.read
inbox.reply
inbox.assign
inbox.close
inbox.search
inbox.export
```

plus account scope such as:

```text
mailbox.read
mailbox.send
```

Exact names belong to Phase 3D.

Important:

```text
READ CONVERSATION
≠
SEND REPLY
≠
SEND FROM ANY ACCOUNT
```

---

# 44. Scope architecture

A user may have Inbox access restricted by:

**own conversations**
**assigned conversations**
**team mailboxes**
**specific connected accounts**
**organization-wide**

The backend must enforce this before returning Message content.

Frontend hiding is insufficient.

---

# 45. Export boundary

Conversation exports can expose significant client/prospect information.

Therefore:

```text
VIEW ≠ EXPORT
```

If exports are supported, they require:

* dedicated permission,
* tenant scope,
* audit event,
* data minimization rules where needed.

---

# 46. Reusable component mapping

Design 014 introduces or formalizes:

`CommunicationInboxShell`
`ConversationList`
`ConversationListItem`
`UnreadIndicator`
`ConversationStatusBadge`
`ConversationAssignee`
`MessageThread`
`MessageBubble/MessageCard`
`MessageMetadata`
`AttachmentCard`
`ReplyComposer`
`ConversationContextPanel`
`ContactContextCard`
`CampaignContextBadge`
`ReplyClassificationBadge`
`AssignmentControl`
`InboxFilterBar`

These sit above shared primitives from Design 153.

---

# 47. New reusable family

Our architecture now gains:

```text
Unified Communication Workspace Family
        │
        └── 014 Unified Inbox / Replies
```

Later **Design 093 — Reply Queue** should reuse much of this family.

Client-facing messaging surfaces may reuse lower-level Message/Thread components while applying completely different access scopes.

---

# 48. Responsive contract — Desktop

Desktop should preserve the productivity-oriented multi-pane experience where approved:

```text
Inbox / Conversation List
        │
        ├── Message Thread
        │
        └── Context / Actions
```

This is one of the places where desktop space materially improves productivity.

---

# 49. Responsive contract — Tablet

Following Design 152:

**Landscape tablet**

may preserve two panes.

**Portrait tablet**

can use:

```text
Conversation List
      ↓
select
      ↓
Conversation Detail
```

with contextual information in an overlay/drawer.

Touch targets and account/action menus must not rely on hover.

---

# 50. Responsive contract — Mobile

Following Design 151:

```text
Inbox List
   ↓
Tap Conversation
   ↓
Full-screen Thread
   ↓
Reply Composer
```

Related CRM context can live behind:

**Details / Context**

instead of permanently consuming screen width.

Important actions should remain reachable without shrinking the desktop three-column Inbox.

---

# 51. Mobile reply composer

The composer should account for:

* keyboard visibility,
* attachment controls,
* send action,
* draft preservation,
* account identity,
* safe-area spacing.

A large desktop rich-text toolbar should progressively simplify.

---

# 52. State coverage

Design 014 directly reuses Design 150 plus communication-specific states:

**Inbox Empty**
**No Unread Conversations**
**No Results After Filter/Search**
**Conversation Loading**
**Message History Loading**
**Reply Sending**
**Reply Failed**
**Mailbox Syncing**
**Mailbox Disconnected**
**Authentication Expired**
**Partial Provider Failure**
**Attachment Failed**
**Unknown Sender**
**Conversation Unassigned**
**Permission Restricted**
**Offline / Reconnecting**

These must not be collapsed into one generic error.

---

# 53. Empty vs unavailable

Important difference:

> **No new replies**

is positive/normal.

Versus:

> **Mailbox has not synchronized**

which is an availability problem.

The UI must never represent provider failure as an empty Inbox.

---

# 54. Concurrency

Two team members may open the same Conversation.

Potential conflicts include:

```text
User A assigns to self
User B assigns to another user
```

or:

```text
User A sends reply
User B sends a reply seconds later
```

The platform should expose sufficiently fresh state and apply appropriate concurrency/assignment rules.

It should not silently overwrite assignments.

---

# 55. Duplicate-human-reply risk

For high-value sales conversations, duplicate team replies can be embarrassing.

Potential architecture can expose:

**currently being handled by X**
or recent reply state.

Exact collaboration behavior belongs later, but Design 014 should not make safe concurrency impossible.

---

# 56. Backend architecture

Recommended conceptual structure:

```text
Unified Inbox UI
       ↓
Conversation Query / Command Service
       ↓
Tenant + Permission Scope
       ↓
Canonical Conversation / Message Domain
       │
       ├── Conversation correlation
       ├── Assignment
       ├── Read/workflow state
       ├── Draft/reply
       └── Context linking
       ↓
Communication Infrastructure
       │
       ├── Inbox Sync Service
       ├── Sending Service
       ├── Provider Adapters
       └── Attachment/File Service
       ↓
External Mail Provider(s)
```

Outreach event integration:

```text
Message / Reply Event
      ↓
Outreach Runtime
      ↓
Enrollment stop/transition logic
```

CRM integration:

```text
Conversation
      ↓
Contact / Lead / Company / Campaign links
```

---

# 57. Backend requirements

| Requirement                     | Status                    |
| ------------------------------- | ------------------------- |
| Authentication                  | **Required**              |
| Tenant isolation                | **Critical**              |
| Conversation/mailbox RBAC       | **Critical**              |
| Canonical Conversation entity   | **Critical**              |
| Canonical Message entity        | **Critical**              |
| Provider adapter abstraction    | **Critical**              |
| Inbound sync service            | **Critical**              |
| Idempotent inbound processing   | **Critical**              |
| Thread correlation              | **Critical**              |
| Contact identity correlation    | **Required**              |
| Campaign/enrollment correlation | **Critical for Outreach** |
| Sending service                 | **Critical**              |
| Provider secrets server-side    | **Critical**              |
| Message snapshots/history       | **Critical**              |
| Assignment history              | **Required**              |
| Attachment security             | **Required**              |
| Search/pagination               | **Required**              |
| Partial failure handling        | **Required**              |
| Real-time event updates         | Recommended / High-value  |
| Audit/activity history          | **Required**              |

---

# 58. Audit/activity history

Important events can include:

**Conversation assigned**
**Conversation reassigned**
**Conversation closed/reopened**
**Reply sent**
**Reply failed**
**Meeting created from conversation**
**Follow-up created**
**Classification changed**
**Contact/Lead linked**
**Mailbox sync failure**

The actual external Messages are themselves canonical records and should not need to be duplicated wholesale inside a generic audit log.

---

# 59. Canonical source of truth

One especially important architectural decision:

### Provider

Source of truth for provider-level transport facts.

### Platform Message domain

Source of truth for platform business context and normalized communication history.

### CRM

Source of truth for Contact / Lead / Deal lifecycle.

### Outreach

Source of truth for Campaign / Enrollment execution.

### Inbox

A composition over these canonical systems.

That prevents Design 014 from becoming a second CRM and a second Campaign engine.

---

# 60. Relationship to Design 015

The next frozen screen is:

**Design 015 — Meetings & Follow-ups.**

Design 014 hands actionable conversations into that system.

The relationship is:

```text
INBOUND REPLY
Design 014
    ↓
Needs human action
    ↓
MEETING / FOLLOW-UP
Design 015
```

But the Message remains linked so users can understand why the Meeting or Follow-up exists.

---

# 61. Main implementation risks

The audit flags several high-priority risks:

**Provider coupling**
Building the UI directly against Gmail/Outlook-specific payloads.

**Conversation/Message conflation**
Treating an entire thread as one mutable Message.

**Status overload**
Read state, assignment, workflow state and delivery state merged together.

**Duplicate inbound events**
Provider retries generating duplicate Replies.

**Broken threading**
Matching only by subject rather than robust provider/header context.

**CRM pollution**
Unknown senders automatically creating canonical Contacts.

**Outreach duplication**
Designs 014 and 093 getting separate Reply databases.

**Suppression failure**
An unsubscribe Reply not affecting future outreach eligibility.

**Historical-content mutation**
Editable templates altering past messages.

**Secret exposure**
Mailbox/provider credentials accessible to frontend code.

**False empty state**
Provider outage presented as zero Replies.

**Internal-note leakage**
Internal collaboration content accidentally sent externally.

**Permission leakage**
Users gaining access to entire team mailboxes through a generic Inbox query.

These need architectural controls, not new design screens.

# Design 014 Audit Verdict

## **PASS — UNIFIED COMMUNICATION WORKSPACE ANCHOR**

**Template directive:** Design 014 establishes the reusable `CommunicationInboxWorkspaceTemplate`.

**Domain directive:** **Conversation ≠ Message ≠ Contact ≠ Lead ≠ Campaign Enrollment.**

**Provider directive:** Connected communication providers operate behind canonical synchronization/sending adapters.

**History directive:** Sent and received Messages preserve the actual communication content and provider lineage.

**Correlation directive:** Replies should link to the correct Conversation, Contact, Lead, Campaign and Enrollment wherever reliable lineage exists.

**Outreach directive:** Inbound Replies emit canonical events consumed by the Outreach runtime for stop/transition logic; Inbox components do not manually implement Sequence execution.

**Suppression directive:** Unsubscribe/safety events flow into the canonical communication-eligibility system.

**Assignment directive:** Conversation ownership is separate from Lead ownership and retains assignment history.

**Permission directive:** Conversation read access, reply permission, assignment rights, account access and export must be independently enforceable.

**Reliability directive:** Inbound processing requires idempotency, sync checkpoints, provider-health states and partial-failure behavior.

**Security directive:** External message HTML and attachments are untrusted content and require safe rendering/storage/access controls.

**Consolidation directive:** **DESIGN 014 AND DESIGN 093 MUST SHARE ONE CANONICAL MESSAGE/CONVERSATION BACKEND AND REUSABLE THREAD COMPONENTS; DO NOT MERGE THEIR APPROVED UX SURFACES UNTIL DESIGN 093 IS AUDITED.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                           Count |
| ------------------------------------------ | ------------------------------: |
| **Audited**                                |                    **14 / 153** |
| **PASS**                                   |                          **14** |
| **STANDARDIZE decisions**                  |                          **12** |
| **Potential implementation-overlap flags** |                           **5** |
| **MERGE screen candidates**                | **0 pending later comparisons** |
| **FIX BEFORE CODE**                        |                           **0** |
| **New designs**                            |                           **0** |

### Reusable page families discovered so far

```text
InternalAppShell
│
├── Dashboard Family
│   └── 003–007
│
├── Data Acquisition Family
│   ├── 008 Lead Finder
│   └── 009 Data Extraction
│
├── Data Quality / Enrichment Family
│   └── 010 Contact / Data Enrichment
│
├── CRM List Workspace Family
│   └── 011 Leads / Lead CRM
│
├── Campaign Operations Family
│   └── 012 Outreach Campaigns
│
├── Versioned Workflow Builder Family
│   └── 013 Outreach Sequence Builder
│
└── Unified Communication Workspace Family
    └── 014 Unified Inbox / Replies
```

The end-to-end sales engagement chain is now:

```text
DISCOVERY
008
 ↓
EXTRACTION
009
 ↓
ENRICHMENT
010
 ↓
CRM LEAD
011
 ↓
CAMPAIGN
012
 ↓
SEQUENCE DEFINITION
013
 ↓
MESSAGE EXECUTION
backend runtime
 ↓
REPLY / CONVERSATION
014
 ↓
MEETING / FOLLOW-UP
015
 ↓
DEAL PROGRESSION
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 015: Meetings & Follow-ups Audit**

The exact frozen next identity is **Design 015 — Meetings & Follow-ups**.

That audit should establish the canonical separation between **Meeting, Follow-up, Task, scheduling state, outcome, next action, Lead/Contact/Deal linkage and calendar synchronization**, while reusing the existing workspace/component infrastructure and without redesigning or changing the approved sequence.

