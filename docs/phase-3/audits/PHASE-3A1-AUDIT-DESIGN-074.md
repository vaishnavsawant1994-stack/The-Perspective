# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 074 — Client Message Thread Detail

Its frozen identity and supplied route annotation **`/client/messages/[threadId]`** are locked. Exact route connections remain a **Phase 3B** concern and are not being redesigned here.

Design 074 should become the **canonical Client Portal Conversation/Thread detail surface** for viewing and participating in one authorized Conversation using the same messaging foundation already established by Design 014 and surfaced as a Client collection by Design 045.

Its governing boundary is:

> **Conversation/Thread ≠ Message ≠ MessageVersion/Edit ≠ Participant ≠ ReadState ≠ DeliveryState ≠ Attachment ≠ InternalNote ≠ Notification ≠ ActivityEvent ≠ ClientAction.**

The central implementation rule is:

> **Design 074 must preserve the Conversation as the durable communication container and each Message as durable communication evidence. Read, delivery, editing, notification, context, attachment, and workflow/action state are separate dimensions; none may silently rewrite another. Internal-only communication must be impossible to leak through the Client projection.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                            |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **074**                                                                                                                                                   |
| **Canonical name**                 | **Client Message Thread Detail**                                                                                                                          |
| **Product area**                   | Client Portal / Communication / Messaging                                                                                                                 |
| **User surface**                   | **Client Portal**                                                                                                                                         |
| **Screen class**                   | Conversation Entity Detail / Messaging Thread Workspace                                                                                                   |
| **Classification**                 | **Portal Entity Detail Variant — Client Conversation & Message Thread Family**                                                                            |
| **Primary purpose**                | Let an authorized Client participant read one Conversation, inspect its communication history and attachments, and send permitted Client-visible Messages |
| **Canonical messaging foundation** | Design 014                                                                                                                                                |
| **Client collection foundation**   | Design 045                                                                                                                                                |
| **Primary canonical aggregate**    | **Conversation / Thread**                                                                                                                                 |
| **Message entity**                 | **Message**                                                                                                                                               |
| **Edit/version entity**            | **MessageVersion / MessageEdit**                                                                                                                          |
| **Participation entity**           | **ConversationParticipant**                                                                                                                               |
| **Recipient attention entity**     | **ReadState / MessageReceipt**                                                                                                                            |
| **Transport entity**               | **DeliveryState / DeliveryAttempt**                                                                                                                       |
| **Attachment dependency**          | Design 030 — Asset / FileVersion                                                                                                                          |
| **Internal communication concept** | **InternalNote** — never Client-visible                                                                                                                   |
| **Notification dependency**        | Designs 061 / 064                                                                                                                                         |
| **Activity dependency**            | Design 063                                                                                                                                                |
| **Client Action dependency**       | Design 047 where a genuine response/action is required                                                                                                    |
| **Project dependency**             | Designs 023 / 043 / 066                                                                                                                                   |
| **Support dependency**             | Design 058                                                                                                                                                |
| **Contract dependency**            | Designs 053 / 070                                                                                                                                         |
| **Identity/access dependency**     | Designs 059 / 062                                                                                                                                         |
| **Parent shell**                   | `ClientPortalShell` — Design 002                                                                                                                          |
| **Primary read model**             | `ClientConversationThreadView`                                                                                                                            |
| **Template family**                | `ClientConversationThreadTemplate`                                                                                                                        |
| **Auth**                           | Required                                                                                                                                                  |
| **Authorization**                  | Active Portal membership + explicit Conversation participation/visibility + attachment/message-specific policy                                            |
| **Implementation priority**        | **Critical Client Communication / Privacy / Historical Evidence**                                                                                         |
| **Reuse level**                    | **Extremely High with Designs 014 and 045**                                                                                                               |

Design 074 should answer:

> **“Which Conversation am I in, who is legitimately participating, what Messages were exchanged and when, which ones I have read, which attachments belong to exact Messages, whether my latest Message was delivered, and can I safely reply without seeing internal-only communication?”**

Canonical architecture:

```text
Conversation
    │
    ├── Participant A
    ├── Participant B
    ├── Participant C
    │
    └── Message sequence
            │
            ├── Message 1
            │     ├── sender
            │     ├── MessageVersion(s)
            │     ├── Attachment(s)
            │     ├── DeliveryState(s)
            │     └── ReadState(s)
            │
            ├── Message 2
            └── Message 3
                    │
                    ↓
          Client-safe projection
                    │
                    ↓
                Design 074
```

---

# 2. Reuse

## Design 014 remains the canonical Messaging foundation

Design 014 already established the Unified Inbox / Replies architecture around:

* Conversation / Thread,
* Message,
* participant identity,
* read state,
* delivery state.

Design 074 must consume the **same canonical Conversation and Message records**.

Do **not** create:

```text
ClientThread
PortalMessage
SupportChatMessage
ProjectClientMessage
```

as parallel messaging engines.

Correct:

```text
Design 014
Unified Messaging Foundation
        │
        ├── internal/team projections
        │
        ├── Design 045
        │   Client Messages collection
        │
        └── Design 074
            Client exact thread detail
```

---

## Design 045 remains the Client Conversation collection

Design 045 answers:

> Which Client-visible Conversations can I access?

Design 074 answers:

> What happened inside this exact Conversation and can I reply?

They must reconcile on:

* Conversation ID,
* participants,
* latest Client-visible Message,
* unread state,
* context,
* timestamps.

---

## Design 074 ≠ Design 045

### Design 045

Conversation discovery/listing.

### Design 074

Exact Conversation history and reply experience.

Therefore Design 074 should not build a separate inbox/list data model.

---

## Reuse Design 058 for Support context without duplicating Messaging

A SupportRequest can be linked to a Conversation:

```text
SupportRequest SR-101
        │
        ↓
Conversation C-501
        │
        ↓
Messages
```

But:

> **SupportRequest ≠ Conversation.**

The SupportRequest owns case lifecycle.

The Conversation owns communication.

---

## Reuse Project context without making Project the Conversation

A Project may have several Conversations:

```text
Project P-101
├── Conversation C1 — general delivery
├── Conversation C2 — design discussion
└── Conversation C3 — specific support/context
```

Do not force one `project.threadId`.

---

## Reuse Contract context without granting Conversation access automatically

A Conversation may relate to Contract C-20.

That does not mean every Contract viewer belongs to the Conversation.

---

## Reuse Design 030 for attachments

Every uploaded/shared Message attachment should use:

> **Asset ≠ FileVersion ≠ StorageObject**

from Design 030.

No messaging-specific blob/file backend.

---

## Reuse Design 064 for notifications

A new Message may generate:

> You received a new message.

But:

```text
NotificationRecord
≠
Message
```

Reading the notification does not necessarily read the Message.

---

## Reuse Design 063 for Client Activity

A meaningful communication event can feed Activity where appropriate.

But the Activity feed should not reproduce the entire Conversation.

---

## Reuse Design 047 only when communication produces genuine Client work

A Message can request:

> Please upload your approved headshot by Friday.

This may produce a canonical ClientRequest/ClientAction.

But the Message itself is not the action record.

---

# 3. Entities

## Conversation / Thread ≠ Message

`Conversation` is the durable communication container.

`Message` is one communication event within it.

Correct:

```text
Conversation C-101
├── Message M1
├── Message M2
├── Message M3
└── Message M4
```

A thread must support many Messages.

---

## Conversation identity should remain stable

The Conversation should retain one stable ID even as:

* new Messages arrive,
* participants change,
* read state changes,
* context labels change.

Do not create a new Conversation every time somebody replies.

---

## Message sender ≠ Conversation participant

A sender is the actor responsible for a particular Message.

Participant is the relationship granting involvement/access to the Conversation.

Conceptually:

```text
ConversationParticipant
├── conversationId
├── participant identity
├── role/context
├── joinedAt
├── leftAt / access state
└── visibility policy
```

while:

```text
Message
├── conversationId
├── senderId
├── sentAt
└── content
```

The concepts remain separate.

---

## Sender should normally have valid participation at send time

Server-side send logic must verify the sender is currently eligible to post.

Historical sender evidence remains after later participant removal.

---

## Removed participant ≠ deleted sender

If Sarah sent Message M10 and later loses Portal access:

```text
M10.sender
```

must still resolve historically.

Design 062 deactivation cannot delete Message authorship.

---

## Participant removal ≠ Message deletion

Historical messages remain according to retention/visibility policy.

---

## Participant ≠ User globally

The same User may participate in:

* Conversation A,
* not Conversation B.

Global account existence does not grant Conversation access.

---

## Same Client Organization ≠ Conversation participant

Critical.

A Client Portal user does not automatically see every Conversation owned by their company.

---

## Project membership ≠ Conversation participation

Also critical.

Having Project access does not automatically reveal:

* private executive thread,
* Finance discussion,
* Contract discussion,
* Support case thread.

---

## SupportRequest access ≠ Conversation access automatically

The relationship must be explicit and policy-governed.

---

## Contract access ≠ Conversation access automatically

Same principle.

---

## Conversation can have typed context references

Conceptually:

```text
ConversationContext
├── PROJECT
├── SUPPORT_REQUEST
├── CONTRACT
├── INVOICE
├── APPROVAL
└── other governed business context
```

if required.

These references provide context.

They do **not** grant authorization by themselves.

---

## Conversation context ≠ security scope

Permanent:

```text
conversation.projectId = P101
```

does not mean:

> everyone with `projects.read(P101)` can read this Conversation.

---

## Message ≠ MessageVersion/Edit

A sent Message is the stable communication record.

If editing is allowed, edits should preserve history.

Conceptually:

```text
Message M-101
├── Version 1 — original
├── Version 2 — edited
└── current presentation → Version 2
```

or equivalent append-oriented edit records.

---

## Editing ≠ rewriting history silently

If a Message originally said:

> Approve v3.

and later is edited to:

> Approve v4.

the system must not pretend it always said v4.

At minimum the system needs:

* original content preservation or edit evidence,
* edited timestamp,
* current visible version.

Exact retention/display policy Phase 3D.

---

## Edit window/policy should be governed

If editing is supported by the frozen product:

the backend should enforce policy around:

* who may edit,
* how long,
* whether already-actioned/legally significant Messages are editable,
* whether attachments may be changed.

Do not trust frontend controls.

---

## Message deletion ≠ hard deletion automatically

If deletion is supported, distinguish:

### Presentation removal

> Message removed/deleted.

from:

### Physical historical deletion

which may conflict with:

* contractual history,
* support records,
* Audit,
* legal retention.

A tombstone/redaction model is safer where history must be retained.

Exact retention policy Phase 3D.

---

## Deleted presentation ≠ deleted Audit evidence

Material communication events may remain auditable even when content is no longer shown.

---

## Deleted Message ≠ deleted Attachment automatically

Attachment lifecycle follows Asset retention/reference policy.

Removing Message presentation must not accidentally destroy a file referenced elsewhere.

---

## Message content ≠ InternalNote

This boundary is mandatory.

`InternalNote` is internal-team-only communication.

It must never be serialized into Client Message DTOs.

Correct:

```text
Conversation
├── Client-visible Message
├── Client-visible Message
├── INTERNAL NOTE   ← internal projection only
└── Client-visible Message
```

Design 074 sees only Client-authorized communication.

---

## InternalNote should be server-filtered

Never:

```text
send all entries to browser
→ hide internal note with CSS
```

Correct:

```text
authorization + visibility query
→ Client-visible entries only
```

---

## InternalNote ≠ Message with `hidden=true` in an unsafe generic payload

Physical storage may reuse some infrastructure, but the domain visibility distinction must be hard-enforced.

No accidental Client serialization path should exist.

---

## Message ≠ Notification

A Notification may say:

> New message from The Perspective team.

The actual content, sender, attachments, and thread state remain Messaging truth.

---

## Notification read ≠ Message read

Permanent.

A Client can dismiss/read the notification without opening the Conversation.

---

## Message ≠ ActivityEvent

Activity can say:

> New conversation started.

But it does not replace Message content/history.

---

## Message ≠ ClientAction

A Message can ask someone to do something.

The actual obligation belongs to:

* ClientRequest,
* ApprovalRequest,
* Questionnaire,
* payment obligation,
* another canonical domain.

---

## ReadState should be participant/message-specific

Conceptually:

```text
MessageReceipt / ReadState
├── messageId
├── participantId
├── deliveredAt
├── readAt
└── state
```

Exact physical schema Phase 3D.

---

## Conversation read state ≠ Message read state

A list can derive:

> Conversation unread

when one or more relevant Messages are unread.

Do not store a contradictory independent Conversation boolean without governed derivation.

---

## Message read ≠ replied

Permanent:

```text
READ
≠
REPLIED
```

---

## Message read ≠ resolved

Permanent.

A support/problem thread may remain unresolved after every Message is read.

---

## Message reply ≠ SupportRequest resolution

Replying:

> Thanks, we're checking.

does not resolve Design 058's SupportRequest.

---

## Message reply ≠ ClientAction completion

A Client Action may require:

> Upload final assets.

Sending:

> I'll do it tomorrow.

does not complete the action.

---

## DeliveryState ≠ ReadState

Permanent:

```text
DELIVERED
≠
READ
```

---

## Sent ≠ delivered

A Message can be accepted by the application's database but external delivery/recipient channel may still be pending.

For in-app Messaging, database persistence can establish in-app availability while email/push delivery remains separate.

---

## In-app Message ≠ email copy

If a Message also generates an email:

the email is a transport/notification representation.

The canonical Message remains one Message.

Do not duplicate the Conversation because an email was sent.

---

## DeliveryAttempt ≠ Message

Transport retries should not create duplicate visible Messages.

Correct:

```text
Message M10
├── DeliveryAttempt 1
└── DeliveryAttempt 2
```

not:

```text
Message M10
Message M11 duplicate
```

---

## Delivery failed ≠ Message deleted

If email notification/delivery fails, the in-app Message can still remain available.

---

## Message body needs structured safe content

Avoid allowing arbitrary unsanitized HTML.

Message content should use a controlled representation such as:

* safe rich text,
* sanitized HTML generated from editor schema,
* structured blocks.

Exact editor format Phase 3D.

---

## Rich text ≠ executable content

Client Messages must not allow arbitrary:

* scripts,
* event handlers,
* unsafe embeds.

---

## Link safety

User-generated Message links should be sanitized against unsafe protocols and rendered with safe external-link handling.

---

## Attachment ≠ Message

One Message may contain multiple attachments.

One Asset could potentially be referenced elsewhere.

Maintain explicit attachment references.

---

## MessageAttachment should pin exact FileVersion

Critical:

```text
MessageAttachment
→ Asset A
→ FileVersion F3
```

not:

```text
→ Asset latestVersion
```

If Asset changes later, the historical Message continues referencing the exact attached version.

---

## Attachment filename ≠ Asset identity

User-visible filename can change/present differently.

Canonical IDs remain stable.

---

## Attachment upload ≠ Message sent

A Client can upload an attachment into a pending composer state without having sent the Message yet.

These lifecycle states stay separate.

---

## Orphan upload handling

If upload succeeds but Message sending is abandoned:

Asset retention/cleanup policies should handle unattached uploads safely.

Do not attach automatically to an unrelated future Message.

---

## Attachment scan processing ≠ Message delivery

An attachment can be:

* uploading,
* processing/scanning,
* safe,
* rejected.

The Message-send policy should define whether send waits for safe processing.

---

## Malicious attachment ≠ Conversation failure

Reject/quarantine the file while preserving the rest of the system.

---

## Message timestamp distinctions

Potential timestamps include:

```text
createdAt
sentAt
deliveredAt
readAt
editedAt
```

These are different facts.

Do not collapse all into `timestamp`.

---

## Message ordering

Use deterministic server sequencing/time ordering.

Concurrent sends need stable ordering, conceptually:

```text
sentAt
+
message sequence / ID
```

---

## Client-generated temporary ID ≠ canonical Message ID

Optimistic UI may use a temporary client key.

The backend-issued Message ID remains canonical after persistence.

---

## Duplicate send prevention

If the Client taps Send twice or network retries:

the system should not create duplicate Messages.

Use idempotent message-send semantics.

---

## Reply-to Message ≠ Conversation identity

If threaded quoting/reply context exists:

```text
replyToMessageId
```

remains a relationship inside the Conversation.

It does not create a new Conversation unless the product explicitly supports subthreads.

No new subthread capability is introduced here.

---

## Conversation closed ≠ deleted

If closure/archive exists:

historical Messages remain.

Closure should affect future sending according to policy.

---

## Archived ≠ resolved

Especially when a Conversation is linked to Support.

Archive is presentation/lifecycle.

Resolution belongs to the relevant business domain.

---

# 4. Permissions

Authorization should evaluate:

```text
authenticated User
+
active ClientPortalMembership
+
ConversationParticipant eligibility
+
Conversation visibility policy
+
Message visibility
+
attachment access
+
send/reply capability
```

---

## Conversation-list access ≠ direct thread access forever

Even if Design 045 previously returned a Conversation:

Design 074 must reauthorize it when opened.

---

## Same Organization ≠ Conversation access

Permanent.

---

## Project access ≠ Conversation access

Permanent.

---

## SupportRequest access ≠ private staff notes

Even if a Client sees the SupportRequest, internal notes remain excluded.

---

## Contract visibility ≠ legal/private Conversation visibility automatically

Permanent.

---

## Read ≠ reply

Potential capabilities:

```text
conversation.read
conversation.reply
```

remain separate where product policy requires.

---

## Reply ≠ participant administration

Being able to send a Message does not mean the Client can add/remove participants.

---

## Portal Admin ≠ Conversation superuser

Design 062 administrators must not automatically read all private Client-user conversations.

---

## Participant management, if present, must be separately governed

Do not infer this feature if absent from the frozen design.

If present, server validates:

* actor authority,
* organization scope,
* target person,
* resource context.

---

## Sender identity comes from session

The browser must never submit:

```text
senderId = another user
```

as authoritative.

Backend derives sender from authenticated identity/membership.

---

## Message edit authorization

If edits exist:

only permitted author/system roles under policy can edit.

A Client administrator cannot arbitrarily rewrite another Client's Message.

---

## Message deletion authorization

Same principle.

Even authorized presentation removal must respect retention/legal policy.

---

## InternalNote creation/read authorization

Client users must have **zero** access.

Do not merely omit the button.

The API/query itself must reject/filter internal note resources.

---

## Attachment read requires Conversation/Message access

Knowing a FileVersion ID must never bypass Conversation visibility.

Conceptually:

```text
canReadAttachment
=
canReadConversation
+
canReadMessage
+
attachment access policy
```

---

## Attachment upload ≠ arbitrary Asset access

The Client can attach only Assets/files they are authorized to upload/use in that context.

---

## Cross-tenant attachment attack

Backend verifies every attachment reference belongs to the authorized Client/context or permitted upload session.

A Client cannot attach another tenant's Asset ID.

---

## Notification possession ≠ Message authorization

Clicking a stale Message notification performs fresh Conversation authorization.

---

## Search/snippet authorization

Any thread search or inbox preview must exclude:

* internal notes,
* unauthorized Messages,
* restricted attachments,
* hidden participant data.

---

## Participant data minimization

Design 074 should display only safe participant information such as:

* name,
* avatar,
* permitted role/context.

No broad User/Profile/CRM object leakage.

---

## Historical participant changes

If someone leaves the Conversation:

future access follows policy.

Historical participant and sender evidence remains preserved.

---

## Membership deactivation

Design 062 deactivation should revoke future Portal access promptly.

It must not:

* delete old Messages,
* change sender identity,
* erase read/delivery history,
* rewrite Audit evidence.

---

# 5. States

Design 074 must keep Conversation lifecycle, Message persistence, DeliveryState, ReadState, attachment processing, edit state, and business-context state separate.

### Conversation/query state

```text
Thread Loading
Thread Available
Thread Restricted
Thread Archived / Closed
Thread Unavailable
```

### Message send state

```text
Drafting
Sending
Sent
Send Failed
Send Outcome Unknown
```

### Delivery state

```text
Not Yet Delivered
Delivered
Delivery Delayed
Delivery Failed
```

where relevant.

### Read state

```text
Unread
Read
```

per participant/message.

### Edit/presentation state

```text
Original
Edited
Deleted / Redacted Presentation
```

where frozen functionality supports it.

### Attachment state

```text
Uploading
Processing / Scanning
Available
Upload Failed
Rejected / Unsafe
Unavailable
```

### Business-context state

Separate:

```text
Support Open / Resolved
ClientAction Pending / Complete
Contract Active
Project Active
```

etc.

These must never become one `message.status`.

---

## Sending ≠ sent

Permanent.

---

## Sent ≠ delivered

Permanent.

---

## Delivered ≠ read

Permanent.

---

## Read ≠ replied

Permanent.

---

## Replied ≠ resolved

Permanent.

---

## Read ≠ ClientAction complete

Permanent.

---

## Delivery failure ≠ Message absent

The in-app Message may still exist.

---

## Notification delivery failure ≠ Message delivery failure necessarily

Email/push notification transport is a separate system.

---

## Send timeout ≠ confirmed failure

If sending request times out after the backend may have persisted the Message:

enter an uncertain/reconciliation state rather than blindly resending.

This prevents duplicate Messages.

---

## Duplicate send reconciliation

Use the Client send-id/idempotency key to determine whether the Message already exists.

---

## Edited ≠ new Message

The same Message identity can have a new visible version/edit lineage.

---

## Deleted presentation ≠ historical nonexistence

A tombstoned Message remains part of the sequence/history according to policy.

---

## Internal Note ≠ hidden Client Message state

InternalNote should not appear at all in the Client result set.

---

## Attachment processing ≠ Message failure automatically

Depending on send policy, Message may wait or attachment may fail separately.

Do not show:

> Message failed

when only one attachment derivative preview is unavailable.

---

## Attachment unavailable ≠ Message deleted

Permanent.

---

## Conversation closed ≠ SupportRequest resolved automatically

Permanent.

---

## Conversation archived ≠ all Messages read

Permanent.

---

## Participant removed ≠ Conversation deleted

Permanent.

---

## Message history unavailable ≠ empty Conversation

Critical:

```text
history query failed
≠
no messages
```

---

## Read-state service unavailable ≠ unread/read assumption

Unknown remains unknown where necessary.

---

## New Message arrives while viewing thread

The thread should reconcile incrementally without:

* losing composer state,
* duplicating the Message,
* jumping focus unexpectedly.

---

## Updated Message while viewing

If editing is permitted and another version appears:

the UI should show the current version plus edited indication according to frozen design.

---

## State Coverage

Design 074 inherits Design 150 plus:

```text
Thread Loading
Thread Available
Thread Restricted
Thread Archived / Closed
Thread Unavailable

Messages Loading
Messages Available
Older Messages Loading
Older Messages Load Failed

Message Drafting
Message Sending
Message Sent
Message Send Failed
Message Outcome Unknown
Message Already Sent / Reconciled

Message Delivered
Delivery Delayed
Delivery Failed

Message Unread
Message Read
Read State Updating
Read State Update Failed

Message Edited
Message Removed / Redacted

Attachment Uploading
Attachment Processing
Attachment Available
Attachment Upload Failed
Attachment Rejected
Attachment Unavailable

New Message Received
Message Updated Elsewhere

Reply Restricted
Current Membership Revoked

Partial Messaging Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve chronological communication clarity.

Conceptually:

```text
Message Thread
↓
Conversation Header
├── safe thread/context title
├── participants
└── Project / Support / Contract context if frozen
↓
Message History
    ├── sender
    ├── exact message content
    ├── timestamp
    ├── edited indicator where relevant
    ├── attachments
    └── delivery/read state where frozen
↓
Reply Composer
    ├── text
    ├── attachments
    └── Send
```

The frozen design remains authoritative.

---

## Desktop must not expose internal notes

There should be no temporary rendering/flicker in which internal notes appear before Client-side filtering.

They must never arrive in the Client payload.

---

## Long histories

Use stable cursor pagination/loading of older Messages rather than loading the entire lifetime Conversation unnecessarily.

---

## Conversation chronology

Older Messages should load without reordering existing content unexpectedly.

---

## Tablet

Following Design 152:

* message bubbles/rows fit available width,
* participant/header metadata wraps cleanly,
* attachment cards remain readable,
* composer remains accessible above the keyboard where relevant,
* context information remains distinct from Message content.

---

## Mobile

Priority:

```text
Conversation
↓
Thread / Context
↓
Message History
↓
Attachment Cards
↓
Composer
↓
Send
```

The composer should remain usable without covering the latest Message.

---

## Mobile sender clarity

For multi-participant Conversations, sender identity must remain explicit.

Do not rely solely on left/right bubble position.

---

## Mobile edited state

Use accessible text:

> Edited

rather than subtle visual styling only.

---

## Mobile delivery/read state

If frozen design displays it:

use clear semantics such as:

* Sent
* Delivered
* Read

rather than icon-only ticks whose meaning may be ambiguous.

---

## Mobile attachment behavior

Attachment cards should display safe information:

* filename,
* file type,
* size where appropriate,
* processing/available state.

No full-width overflow from long filenames.

---

## Accessibility

A Message should communicate something equivalent to:

> Sarah Patel, August 22 at 1:14 PM. “The final cover looks good. Please proceed.” Edited.

where allowed.

---

## Chronological accessibility

Screen-reader reading order must match Message chronology.

Visual left/right alignment cannot alter semantic order.

---

## Composer accessibility

The send action should have a clear accessible label:

> Send message

and upload controls should communicate attachment processing state.

---

## Live updates

Incoming Messages should use non-disruptive announcements.

Do not force focus away from the composer.

---

# 7. Backend Requirements

## Read architecture

```text
Design 074
    ↓
ClientPortalSessionContext
    ↓
Conversation Authorization
    ↓
ClientConversationThreadQueryService
    │
    ├── Conversation
    ├── authorized Participants
    ├── Client-visible Messages
    ├── current MessageVersion
    ├── safe edit indicators
    ├── recipient ReadStates
    ├── safe DeliveryStates
    ├── exact Attachment FileVersions
    └── safe typed context
    ↓
ClientConversationThreadView
```

---

## Conversation authorization service

A central resolver should conceptually evaluate:

```text
canAccessConversation(
    membership,
    conversation,
    participant relationship,
    current policy
)
```

Do not authorize solely using:

* organization ID,
* Project ID,
* SupportRequest ID.

---

## Query must exclude internal notes at source

Correct query pipeline:

```text
Conversation
↓
participant authorization
↓
visibility classification
↓
Client-visible Message records only
↓
DTO
```

Not:

```text
all communication entries
↓
React filters internal=true
```

---

## ConversationParticipant model

Conceptually:

```text
ConversationParticipant
├── conversationId
├── participant type
├── user/membership identity
├── joinedAt
├── leftAt
├── participation state
└── permissions/context
```

Exact schema Phase 3D.

---

## Message model

Conceptually:

```text
Message
├── id
├── conversationId
├── sender participant/user reference
├── createdAt
├── sentAt
├── visibility class
├── currentVersionId
└── lifecycle/presentation state
```

---

## MessageVersion / edit history

If editing is supported:

```text
MessageVersion
├── messageId
├── version
├── content
├── editedAt
├── editedBy
└── edit reason/context where required
```

or equivalent append-oriented structure.

---

## Content sanitation

Backend must sanitize/validate rich message content.

Never depend solely on frontend sanitization.

---

## Message send command

Prefer a narrow command:

```text
sendConversationMessage(
    conversationId,
    clientRequestId,
    content,
    attachmentRefs
)
```

with sender derived from session.

---

## Message send idempotency

`clientRequestId` or equivalent should make retries idempotent.

Example:

```text
tap Send
↓
backend persists Message M101
↓
response connection fails
↓
client retries same request ID
↓
backend returns M101
```

not M102.

---

## Send must reauthorize current participation

The user may have been removed/deactivated while the page was open.

Every mutation performs current authorization.

---

## Message sequencing

Use a durable ordering scheme for concurrent messages.

Possible:

* server-generated sequence,
* sent timestamp + stable ID.

Do not trust Client device clocks for canonical ordering.

---

## Read-state architecture

Conceptually:

```text
MessageReadState / Receipt
├── messageId
├── participantId
├── deliveredAt
├── readAt
└── revision
```

or conversation-level read cursor where appropriate.

---

## Read cursor optimization

For large threads, a participant-specific:

```text
lastReadMessageSequence
```

can efficiently derive unread messages, provided exact semantics remain correct.

Exact physical model Phase 3D.

---

## Mark-read operation

Prefer an idempotent command such as:

```text
markConversationReadThrough(
    conversationId,
    messageSequence
)
```

rather than marking hundreds of Messages individually.

---

## New Message race with mark-read

Use a cutoff/sequence.

A Message arriving after the read cutoff remains unread.

---

## Read operation does not touch source workflows

`markConversationReadThrough()` must not:

* resolve SupportRequest,
* complete ClientAction,
* approve content,
* mark Notification read unless deliberately coordinated as a separate operation.

---

## Delivery architecture

If Messaging has external/email delivery:

```text
Message
  ↓
DeliveryAttempt
  ↓
provider
  ↓
DeliveryState
```

Transport retries never duplicate the canonical Message.

---

## Provider accepted ≠ recipient read

Permanent.

---

## Message email delivery and Notification delivery should not duplicate truth

If a Message triggers both:

* message transport email,
* generic notification email,

architecture needs a deliberate policy to avoid duplicate communications.

Exact notification orchestration Phase 3D.

---

## Attachment upload architecture

Conceptually:

```text
Client upload
    ↓
Asset
    ↓
FileVersion
    ↓
scan / processing
    ↓
MessageAttachmentReference
```

---

## Attachment must pin exact FileVersion

Never resolve `Asset.latestVersion` when displaying historical Message attachments.

---

## Attachment security

Requirements:

* authorized upload session,
* MIME/type validation,
* malware scanning,
* size limits,
* storage isolation,
* safe filename handling,
* secure download URLs,
* tenant/context enforcement.

---

## Attachment mutation after send

A sent Message's attachment references should not silently change.

Replacing a file requires a new Message/edit policy with exact version lineage.

---

## InternalNote model

An internal-only communication record should carry an explicit visibility/audience classification.

Queries for Client Portal should structurally exclude it.

---

## Context references

Conversation context should use typed, validated references.

Conceptually:

```text
ConversationContextReference
├── type
├── entityId
└── relation type
```

The server validates tenant ownership and current visibility.

---

## Context does not grant access

When opening a Conversation linked to Project P101:

both Conversation policy and any source-resource policy needed for contextual metadata are checked.

---

## Reply/client-action integration

If a Message creates a genuine ClientRequest:

```text
Message / explicit request event
        ↓
ClientRequest
        ↓
ClientActionView
```

Do not parse arbitrary text and silently create workflow obligations without governed logic.

---

## Support integration

For Design 058:

```text
SupportRequest
        ↓
Conversation
```

Replying updates communication only.

Support lifecycle changes through Support commands.

---

## Contract integration

For Design 070:

Contract-linked Conversation remains communication context.

No Message can serve as `SignatureEvidence` merely because the sender says:

> I agree.

unless a separately governed legal workflow explicitly treats it as such, which this audit does not introduce.

---

## Approval integration

Likewise:

> Looks good

in a Message is not an ApprovalDecision.

---

## Activity integration

Meaningful Conversation events may feed Design 063, but avoid noisy Activity for every:

* typing event,
* read receipt,
* delivery retry.

---

## Notification integration

`MessageCreated` may feed Notification infrastructure.

Notification generation failure must never roll back the canonical Message.

---

## Audit integration

Material events may include:

```text
ConversationCreated
ParticipantAdded
ParticipantRemoved
MessageSent
MessageEdited
MessageRedacted
AttachmentAdded
```

where audit policy requires.

Read receipts generally need not become heavy Audit events.

---

## Historical identity preservation

Message should reference stable sender identity/snapshot sufficient to survive:

* profile changes,
* membership deactivation,
* account changes.

Do not use mutable display name as sender identity.

---

## Search

If thread search exists:

search only Client-visible Message versions/content after authorization.

InternalNote content must never enter the Client-search index.

---

## Pagination

Use cursor/sequence pagination for older Messages.

Avoid offset pagination in active high-volume threads where inserts can cause duplication/skips.

---

## Real-time delivery

If real-time updates are supported:

* subscription must be authorized,
* each incoming event must be tenant/conversation scoped,
* membership revocation should terminate/reject future events.

Do not trust subscription channel name alone as authorization.

---

## Permission-safe caching

Cache dimensions should include:

```text
conversationId
membershipId
participant revision
message sequence/version
permission revision
```

Private thread payloads must never be shared across unrelated members.

---

## Backend Requirement Matrix

| Requirement                                            | Status                                   |
| ------------------------------------------------------ | ---------------------------------------- |
| Client Portal authentication                           | **Critical**                             |
| Active Portal membership                               | **Critical**                             |
| Canonical Conversation reuse                           | **Critical**                             |
| Canonical Message reuse                                | **Critical**                             |
| Conversation/Message separation                        | **Critical**                             |
| One Conversation → many Messages                       | **Critical**                             |
| ConversationParticipant entity                         | **Critical**                             |
| Sender/Participant separation                          | **Critical**                             |
| Organization membership/Conversation access separation | **Critical**                             |
| Project context/Conversation access separation         | **Critical**                             |
| Support context/Conversation access separation         | **Critical**                             |
| Contract context/Conversation access separation        | **Critical**                             |
| MessageVersion/Edit lineage                            | **Critical if editing exists**           |
| Silent historical overwrite prevention                 | **Critical**                             |
| Tombstone/redaction semantics where deletion exists    | **Critical**                             |
| InternalNote hard separation                           | **Critical**                             |
| Server-side Client visibility filtering                | **Critical**                             |
| Message/Notification separation                        | **Critical**                             |
| Notification read/Message read separation              | **Critical**                             |
| Message/Activity separation                            | **Critical**                             |
| Message/ClientAction separation                        | **Critical**                             |
| Read/reply separation                                  | **Critical**                             |
| Read/resolved separation                               | **Critical**                             |
| Delivery/read separation                               | **Critical**                             |
| Recipient-specific ReadState                           | **Critical**                             |
| Idempotent read updates                                | **Required**                             |
| Send idempotency                                       | **Critical**                             |
| Send-outcome reconciliation                            | **Critical**                             |
| Server-authoritative sender identity                   | **Critical**                             |
| Current-participant reauthorization on send            | **Critical**                             |
| Durable Message ordering                               | **Critical**                             |
| Safe rich-text sanitation                              | **Critical**                             |
| Link sanitization                                      | **Critical**                             |
| Asset/FileVersion attachment reuse                     | **Critical**                             |
| Exact FileVersion pinning                              | **Critical**                             |
| Malware/attachment scanning                            | **Critical**                             |
| Secure attachment download                             | **Critical**                             |
| Cross-tenant attachment validation                     | **Critical**                             |
| Internal-note exclusion from search/index              | **Critical**                             |
| Client-safe participant projection                     | **Critical**                             |
| Historical sender preservation                         | **Critical**                             |
| Membership-deactivation/history separation             | **Critical**                             |
| Cursor/sequence pagination                             | **Required**                             |
| Real-time subscription authorization                   | **Critical if real-time enabled**        |
| Notification integration                               | **Required**                             |
| Activity integration                                   | **Required**                             |
| Audit integration                                      | **Required/Critical for material edits** |
| Permission-safe caching                                | **Critical**                             |
| Partial service degradation                            | **Critical**                             |
| Design 014 backend reuse                               | **Critical**                             |
| Design 045 collection/detail consistency               | **Critical**                             |
| Design 058 Support reuse                               | **Critical**                             |

---

# 8. Consolidation

Design 074 exposes several major implementation risks.

**Conversation / Message conflation**
Every reply creates a new thread.

**One Conversation / one Message assumption**
Thread history cannot grow properly.

**Message sender / Participant conflation**
Participant relationships are lost.

**User / Participant conflation**
Any account member automatically gains thread access.

**Same Client / same Conversation access conflation**
Private Client discussions leak across organization users.

**Project access / Conversation access conflation**
Every Project viewer reads every Project-linked conversation.

**SupportRequest / Conversation conflation**
Case lifecycle and communication become one entity.

**Contract / Conversation conflation**
Legal-resource access reveals private communication.

**Context reference / authorization conflation**
Typed context ID becomes security grant.

**Message / MessageVersion conflation**
Editing rewrites historical communication.

**Edit / silent overwrite**
Recipient cannot know what originally existed.

**Edit timestamp / sent timestamp conflation**
Historical chronology becomes inaccurate.

**Message deletion / historical deletion conflation**
Communication evidence disappears.

**Presentation redaction / physical deletion conflation**
Retention and user-facing removal become indistinguishable.

**Deleted Message / Attachment deletion conflation**
Referenced files are unintentionally destroyed.

**Message / InternalNote conflation**
Private internal communication reaches Client Portal.

**InternalNote hidden by frontend**
Sensitive data is transmitted then visually concealed.

**Message / Notification conflation**
Notification becomes communication source.

**Notification read / Message read conflation**
Dismissing alert marks communication read.

**Message / Activity conflation**
Account History duplicates full conversations.

**Message / ClientAction conflation**
Any request sentence becomes workflow state.

**Read / reply conflation**
Opening Message is considered answered.

**Read / resolved conflation**
Support issue closes when messages are read.

**Reply / ClientAction completion conflation**
Text response finishes unrelated structured obligation.

**Sent / delivered conflation**
Database persistence is treated as transport delivery.

**Delivered / read conflation**
Provider success implies human viewing.

**DeliveryAttempt / Message conflation**
Transport retry creates duplicate visible Message.

**Email copy / Message conflation**
One communication appears as multiple canonical Messages.

**Send timeout / confirmed failure conflation**
Client retries and duplicates message.

**Client device timestamp / canonical ordering conflation**
Conversation chronology becomes inconsistent.

**Read state / Conversation truth conflation**
One global unread boolean conflicts across participants.

**Mark-all-read race**
New Messages are marked read without being seen.

**Attachment / Message conflation**
File upload itself sends communication.

**Attachment / Asset conflation**
Message points to mutable latest file.

**Asset latest version / historical attachment conflation**
Old Message attachment changes when Asset is replaced.

**Upload / safe-to-share conflation**
Malware/unprocessed file becomes immediately downloadable.

**Attachment filename / identity conflation**
Mutable display filename is treated as file identity.

**Message visibility / Attachment visibility conflation**
Direct FileVersion URL bypasses thread access.

**Cross-tenant Asset reference**
Client attaches another organization's file by guessed ID.

**Internal note / Client search index conflation**
Private content leaks through search snippets.

**Portal Admin / conversation superuser conflation**
Access administrator reads all private messages.

**Participant removal / sender deletion conflation**
Historical messages lose attribution.

**Membership deactivation / Message deletion conflation**
Old communication disappears when user loses Portal access.

**Profile update / historical sender conflation**
Message authorship becomes dependent on current profile fields.

**Message “I approve” / ApprovalDecision conflation**
Informal text becomes formal approval evidence.

**Message “I agree” / Contract signature conflation**
Conversation substitutes for signing workflow.

**Archive / resolution conflation**
Thread presentation state closes Support/business lifecycle.

**Conversation closed / Support resolved conflation**
Communication workflow controls service-case state.

**Real-time channel / authorization conflation**
Knowing subscription topic leaks messages.

**Cached Conversation / participant authorization conflation**
One member receives another participant's private payload.

**074/014 duplicate messaging backend**
Client thread creates separate Message records.

**074/045 duplicate Conversation state**
Collection and detail disagree on unread/participant/latest Message.

**074/058 duplicate Support messaging**
Support creates its own chat system.

**074/064 duplicate notification/message semantics**
New Message and Notification are treated as one record.

No additional screen is required.

These are **conversation identity, participant authorization, immutable communication evidence, read/delivery semantics, internal-note isolation, attachment security, idempotent sending, and cross-domain context requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT CONVERSATION, MESSAGE HISTORY & SECURE THREAD DETAIL ANCHOR**

**Domain directive:**
**Conversation/Thread ≠ Message ≠ MessageVersion/Edit ≠ Participant ≠ ReadState ≠ DeliveryState ≠ Attachment ≠ InternalNote ≠ Notification ≠ ActivityEvent ≠ ClientAction.**

**Reuse directive:**
Design 014 remains the single canonical Messaging foundation, Design 045 remains the Client Conversation collection, and Design 074 becomes the exact Client-safe thread-detail projection over the same Conversation and Message records.

**Conversation directive:**
one stable Conversation can contain many Messages and participant relationships. Replies append Messages; they do not create new Conversations arbitrarily.

**Participant directive:**
ConversationParticipant is an explicit authorization/participation relationship. Same Client organization, Project access, SupportRequest access, Contract access, or Portal-admin status never automatically grants Conversation access.

**Sender directive:**
Message sender is derived from the authenticated participant at send time and remains immutable historical attribution even after Profile changes, participant removal, or membership deactivation.

**Context directive:**
Project, Support, Contract, Invoice or other typed context helps classify/link a Conversation but never serves as the Conversation authorization rule itself.

**Message directive:**
each Message is durable communication evidence with canonical ordering, sender, content, timestamps, and exact attachments.

**Edit directive:**
if Message editing exists in the frozen design, edits preserve MessageVersion/Edit lineage and an `edited` indication; content is never silently rewritten as though the new text were original.

**Deletion directive:**
if deletion/removal exists, user-facing removal is separated from historical/Audit retention through governed tombstone/redaction semantics rather than uncontrolled hard deletion.

**Internal-note directive:**
InternalNote remains an internal-only communication concept. Client query services, search indexes, APIs and real-time subscriptions must structurally exclude internal notes before Client serialization.

**Read directive:**
ReadState is recipient/participant-specific attention state. Reading a Message never implies reply, Support resolution, ClientAction completion, Approval, payment, signature, or any other source workflow change.

**Delivery directive:**
Message persistence, transport DeliveryAttempt, DeliveryState and human ReadState remain separate. Email/push/provider delivery success never equals Message read.

**Idempotency directive:**
sending uses a Client request/idempotency key so double taps, network retries or uncertain responses cannot create duplicate canonical Messages.

**Uncertain-send directive:**
a send timeout is reconciled using the idempotency key before allowing a genuinely new send; the platform must not blindly duplicate the communication.

**Ordering directive:**
canonical server-side Message sequence/order is authoritative. Client device clocks never decide durable chronology.

**Attachment directive:**
Message attachments reuse Design 030 Asset/FileVersion and pin the exact FileVersion that was actually attached. Later Asset revisions never mutate historical Message attachments.

**Attachment-security directive:**
uploads require tenant/context authorization, size/type validation, malware scanning and secure download authorization. Direct FileVersion IDs or URLs never bypass Conversation access.

**Notification directive:**
Design 064 notifications about Messages are recipient attention signals only. Notification read/dismissal never alters canonical Message content or Message ReadState unless a deliberate separate operation explicitly does so.

**Activity directive:**
Design 063 may project selected communication milestones but never becomes a Conversation archive.

**ClientAction directive:**
structured obligations mentioned in communication remain canonical ClientRequest/Approval/Questionnaire/Payment/etc. records. A Message can reference or trigger governed creation of an action but never substitutes for its source-domain state.

**Support directive:**
Design 058 SupportRequest owns support lifecycle, while Designs 014/045/074 own communication. Sending/replying to a Support Conversation does not automatically resolve the case.

**Approval directive:**
informal Message text such as “approved” or “looks good” never becomes Design 052 ApprovalDecision unless the formal Approval workflow is executed.

**Contract directive:**
informal Message consent never substitutes for Design 070 SignatureRequest/SignatureEvidence.

**Access-revocation directive:**
Design 062 membership changes affect future access/session authorization but never erase historical sender identity, Message evidence, attachments, or Audit records.

**Real-time directive:**
if live thread updates are implemented, every subscription is participant/tenant-authorized and revocation must prevent subsequent message delivery.

**Failure directive:**
Message-history failure, delivery failure, ReadState failure, attachment failure, notification failure and canonical send failure remain distinct. Empty thread, unread, undelivered, or no attachment must never be inferred from unavailable services.

**Responsive directive:**
desktop prioritizes safe participant context → chronological Message history → attachments → reply composer; mobile preserves the same semantic chronology and sender identity while keeping the composer and incoming-message updates accessible.

**Internal reuse directive:**
Project, Support, Contract, Client Portal and Team Workspace communication must ultimately consume the same Conversation/Message foundation with audience-specific projections, not separate messaging systems.

**Overlap directive:**
Designs **014, 030, 039, 045, 047, 058, 061–064, 066, 070 and 074** must ultimately consume one canonical Conversation + Participant + Message + MessageVersion + Receipt/ReadState + DeliveryAttempt + Attachment foundation while preserving InternalNote, Notification, Activity and ClientAction as separate concepts.

**Consolidation directive:**
**STANDARDIZE ONE PLATFORM MESSAGING FOUNDATION — STABLE CONVERSATION + EXPLICIT PARTICIPANTS + APPEND-ORIENTED MESSAGES + GOVERNED MESSAGE EDIT/VERSION HISTORY + PARTICIPANT-SPECIFIC READ STATE + SEPARATE DELIVERY ATTEMPTS + EXACT ASSET/FILEVERSION ATTACHMENTS + HARD INTERNALNOTE AUDIENCE ISOLATION + IDEMPOTENT MESSAGE SEND + TYPED BUSINESS-CONTEXT REFERENCES — AND NEVER ALLOW PROJECT/ORGANIZATION MEMBERSHIP, NOTIFICATION STATE, INFORMAL MESSAGE TEXT, FRONTEND HIDING, OR MUTABLE FILE/PROFILE DATA TO BECOME COMMUNICATION AUTHORIZATION OR HISTORICAL MESSAGE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **74 / 153** |
| **PASS**                                   |                         **74** |
| **STANDARDIZE decisions**                  |                         **72** |
| **Potential implementation-overlap flags** |                         **65** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**74 / 153 = 48.4% audited.**

### Canonical messaging architecture after Design 074

```text
                       CONVERSATION
                            │
              ┌─────────────┼─────────────┐
              ↓             ↓             ↓
        Participant A  Participant B  Participant C
                            │
                            ↓
                         Messages
                            │
             ┌──────────────┼───────────────┐
             ↓              ↓               ↓
      MessageVersion    Attachments      Receipts
        / Edits         FileVersion      ├── Delivered
                                         └── Read
```

Internal communication remains outside the Client projection:

```text
Conversation Communication
        │
        ├── Client-visible Message
        ├── Client-visible Message
        ├── InternalNote
        └── Client-visible Message

                 ↓ Client projection

        Message
        Message
        Message

InternalNote never crosses the boundary.
```

And communication remains separate from workflow state:

```text
Message
  ├── may produce Notification
  ├── may appear in Activity
  ├── may reference ClientAction
  ├── may relate to SupportRequest
  ├── may relate to Project
  └── may relate to Contract

But Message is none of those entities.
```

# Next Sequential Audit Target

## **Design 075 — Client Sign In**

Its frozen identity and supplied route annotation **`/client/login`** are already locked.

The next audit must preserve the authentication boundary:

> **User ≠ AuthenticationIdentity ≠ Credential ≠ AuthenticationSession ≠ ClientPortalMembership ≠ Organization ≠ Invitation ≠ Authorization ≠ Recovery State.**

It will need to reconcile Designs **059, 062 and 070–074** with the upcoming authentication sequence while preserving:

* successful authentication ≠ authorized Client Portal membership,
* login email/identifier ≠ mutable Client Contact/Profile email,
* credential validation ≠ permission evaluation,
* disabled/deactivated membership ≠ deleted User/AuthIdentity,
* authentication errors must avoid account enumeration,
* session creation must bind the correct User and active Client Portal context,
* sign-in must not silently activate a pending invitation,
* recovery belongs to Design 077 rather than becoming generic login mutation.

After Design 075 we continue strictly:

**076 Client Portal Activation / Accept Invite → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
