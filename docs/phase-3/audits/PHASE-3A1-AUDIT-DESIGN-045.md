# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 045 — Client Messages

Design 045 should become the **canonical Client Portal messaging workspace** for authenticated communication between authorized Client Portal members and authorized internal Team Workspace participants.

Its most important architectural responsibility is to reuse the platform's canonical Conversation/Message infrastructure established around Design 014 while maintaining a strict boundary between **Client-visible conversation content and internal inbox metadata, internal notes, outreach replies, staff-only comments, provider diagnostics, and CRM activity**.

| Audit field                       | Classification                                                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                     | **045**                                                                                                                                                  |
| **Canonical name**                | **Client Messages**                                                                                                                                      |
| **Product area**                  | Client Portal / Communication / Collaboration                                                                                                            |
| **User surface**                  | **Client Portal**                                                                                                                                        |
| **Screen class**                  | Client-Safe Messaging Inbox / Conversation Workspace                                                                                                     |
| **Classification**                | **Portal Workspace Variant — Canonical Client Communication Family**                                                                                     |
| **Primary purpose**               | Let authorized Client Portal users view, search, open and participate in Client-safe conversations related to their account and Projects                 |
| **Primary entity**                | **Conversation / MessageThread**                                                                                                                         |
| **Core child entity**             | **Message**                                                                                                                                              |
| **Supporting entities**           | ConversationParticipant, MessageRecipient/Delivery, MessageAttachment, ReadReceipt/ReadState, Project, Client, PortalMembership, User, Asset/FileVersion |
| **Parent shell**                  | `ClientPortalShell` — Design 002                                                                                                                         |
| **Internal messaging foundation** | Design 014 — Unified Inbox / Replies                                                                                                                     |
| **Project integration**           | Design 043                                                                                                                                               |
| **Thread detail specialization**  | Design 074 — Client Message Thread Detail                                                                                                                |
| **Template family**               | `ClientMessagingWorkspaceTemplate`                                                                                                                       |
| **Composition**                   | `ClientMessagesComposition`                                                                                                                              |
| **Auth**                          | Required                                                                                                                                                 |
| **Authorization**                 | Portal membership + conversation participation/resource scope                                                                                            |
| **Implementation priority**       | **Critical Client Collaboration**                                                                                                                        |
| **Reuse level**                   | **Very High**                                                                                                                                            |

The governing invariant is:

> **Conversation ≠ Message ≠ Notification ≠ Internal Note ≠ Activity Event ≠ Outreach Reply.**

---

# 1. Functional responsibility

Design 045 should answer:

> **“What conversations do I have with The Perspective team, which messages are unread, which Project/account does each conversation belong to, who is participating, and where can I continue the discussion safely?”**

Canonical architecture:

```text
Canonical Messaging Infrastructure
        │
        ├── Conversation
        ├── Participants
        ├── Messages
        ├── Attachments
        ├── Read State
        └── Delivery State
              ↓
       Visibility / Audience Policy
              ↓
       Client-safe Projection
              ↓
Client Portal Authorization
              ↓
      Design 045
```

Design 045 is **not a second messaging backend**.

---

# 2. Design 014 vs Design 045

Design 014 already established the broad internal messaging foundation.

### Design 014 — Unified Inbox

Internal operators can potentially see:

* outreach conversations,
* provider metadata,
* lead/contact linkage,
* assignment,
* reply classification,
* internal workflow states.

### Design 045 — Client Messages

Client Portal users see only:

* conversations they are permitted to participate in,
* Client-visible participants,
* Client-visible message content,
* approved attachments,
* safe Project/account context.

Therefore:

```text
One messaging infrastructure
        │
        ├── Internal Inbox Projection — 014
        └── Client Messaging Projection — 045
```

**DO NOT CREATE TWO MESSAGE SYSTEMS.**

---

# 3. Conversation ≠ Message

A Conversation/Thread groups communication.

A Message is one immutable communication item inside that Thread.

```text
Conversation
├── Message 1
├── Message 2
├── Message 3
└── Message 4
```

Do not store an entire conversation as one continuously edited text field.

---

# 4. Message history should be append-oriented

Once sent, the original communication should remain historically identifiable.

If message editing is supported by frozen product policy, preserve:

* edit state,
* edit timestamp,
* original/version history where required.

Never silently rewrite communication history.

---

# 5. Internal note ≠ Client Message

This is one of the highest-risk boundaries.

Example internal note:

> Client seems hesitant about the second payment.

This must never become a Client-visible Message.

Correct architecture:

```text
Internal Note
≠
Client-visible Message
```

Even if both appear near each other in the internal UI.

---

# 6. Comment ≠ Message

Project/Draft/Design comments may be tied to:

* exact DraftVersion,
* exact ProofVersion,
* approval/review context.

A Message is general conversation.

Do not turn every Design-review comment into a Client Message automatically.

They may generate a Notification or deep link, but source truth stays in the Review domain.

---

# 7. Notification ≠ Message

Design 064 later owns Client Notifications Center.

Example:

```text
Message:
“Your revised draft is ready.”

Notification:
“New message from Sarah.”
```

The Notification points to communication.

It is not another copy of the Message.

---

# 8. Activity Event ≠ Message

Design 063 later owns Client Activity / Account History.

An Activity item can say:

> Emma sent a new Project message.

That does not mean Activity owns the message body.

---

# 9. Outreach Reply ≠ Client Portal Message

Design 012–014 outreach communication relates to prospects/leads.

Design 045 relates to authenticated Client relationships.

They may share:

* Message primitives,
* thread rendering,
* attachment handling,
* delivery infrastructure.

But their business contexts and permissions differ.

---

# 10. CRM Contact ≠ Portal Participant automatically

A CRM Contact does not automatically become eligible to enter a Client conversation.

Correct:

```text
Contact
     ↓ optional linked identity
ClientPortalMembership
     ↓
ConversationParticipant
```

Active Portal participation should be explicit.

---

# 11. ConversationParticipant

Conceptually:

```text
ConversationParticipant
├── conversationId
├── participant type
├── identity reference
├── visibility
├── joinedAt
├── left/removedAt
└── notification preferences where appropriate
```

Exact schema belongs to Phase 3D.

---

# 12. Participant types must remain distinguishable

Potential participants include:

```text
CLIENT_PORTAL_MEMBER
INTERNAL_USER
SYSTEM
```

where legitimate.

Do not assume all participants belong to the same identity/Role system.

---

# 13. Client participant ≠ Internal Team member

Audit and UI should be able to identify:

> Client — Arjun Mehta

versus:

> Account Manager — Sarah Wilson

without pretending both belong to one organization membership table.

---

# 14. Conversation scope

A conversation may be associated with:

```text
Client / Account
Project
Contract
Invoice
Publication
Support request
```

depending on frozen use cases.

The relationship should be structured.

Avoid only:

```text
subject = "About magazine project"
```

with no canonical Project link.

---

# 15. Project message ≠ Project record

A Conversation associated with Project 123 remains a Conversation.

The Project remains Design 023's canonical Project.

---

# 16. Design 043 integration

Client Project Detail may show:

* latest conversation,
* unread count,
* “Message team” CTA.

Design 045 owns the broader conversation list/workspace.

```text
043 Project Detail
       ↓
Project-specific conversation query
       ↓
045 Client Messages
```

---

# 17. Design 074 relationship

Later:

**Design 074 — Client Message Thread Detail**

This is a major overlap checkpoint.

Expected architecture:

```text
Canonical Conversation Domain
        │
        ├── 045 Client Messages
        │   thread collection/inbox
        │
        └── 074 Thread Detail
            focused one-thread experience
```

One Conversation/Message engine.

**DO NOT MERGE SCREENS YET.**

---

# 18. Design 045 should remain collection-first

Its principal responsibilities should be:

* thread list,
* unread state,
* search/filter,
* context,
* recent message preview,
* participants,
* open thread.

The complete deep conversation experience can be specialized in Design 074.

---

# 19. Conversation title

A Thread can have a controlled subject/title.

It should not depend solely on the latest message body.

For Project conversations, contextual title may derive from:

```text
Project + topic
```

or another canonical representation.

---

# 20. Conversation type/category

If frozen UX groups threads by:

* Project,
* Billing,
* Contract,
* General,
* Support,

those should be structured categories/context.

Do not determine type through keyword parsing.

---

# 21. Unread ≠ conversation workflow state

Design 014 already established this distinction.

A conversation can be:

```text
Read state:
UNREAD

Conversation state:
OPEN
```

or:

```text
Read:
READ

State:
WAITING_FOR_CLIENT
```

if such workflow exists.

These remain separate dimensions.

---

# 22. Read state should be participant-specific

One message can be:

```text
Read by Client A
Unread by Client B
Read by Account Manager
```

Therefore do not place:

```text
message.isRead = true
```

as a universal truth if multiple recipients are supported.

Use participant/read-state semantics.

---

# 23. Thread unread count

Design 045's unread count should derive from:

```text
messages visible to current participant
minus
messages already read by current participant
```

Not a globally stored thread unread number.

---

# 24. Mark-as-read should be idempotent

Opening the same Message twice must not create:

* duplicate read events,
* duplicate activity,
* inconsistent unread counts.

---

# 25. Read receipt ≠ delivery receipt

These are distinct:

```text
Message sent
Message delivered
Message read
```

Exact provider/channel capability determines whether all are knowable.

Do not fabricate read receipts.

---

# 26. Sent ≠ delivered

If sending infrastructure fails after canonical Message creation, the system may conceptually have:

```text
Message:
CREATED

Delivery:
FAILED
```

The conversation history should communicate correct state.

---

# 27. Internal Portal messaging vs external email delivery

A Client Message may potentially trigger email notification/delivery.

But:

```text
Canonical Portal Message
≠
Email provider Message
```

The Portal message remains the canonical Client conversation record.

Email can be a delivery/notification mechanism where supported.

---

# 28. Provider message IDs

If external delivery is used, preserve:

```text
providerMessageId
delivery state
failure reason classification
```

in infrastructure—not arbitrary UI fields.

---

# 29. Reply correlation

If a Client replies through supported external email and it is imported into the same Portal Thread, robust correlation is required.

Never associate solely by subject text such as:

> Re: Magazine Project.

Use provider/message/thread identifiers and safe fallback rules.

---

# 30. Unknown sender protection

An email arriving from an unknown address must not automatically join an authenticated Client conversation.

Identity matching needs explicit policy.

This prevents data leakage into the wrong Client account.

---

# 31. Client membership revocation

If a Portal member loses access:

* historical sent messages remain,
* their identity remains visible historically,
* they can no longer fetch the Thread.

Access revocation ≠ message deletion.

---

# 32. Removing participant ≠ deleting history

Conversation history remains intact after a participant leaves where retention/business policy requires it.

---

# 33. Adding a new participant

Adding someone to a Conversation raises an important history question:

> Can the new participant see previous messages?

That must be explicitly defined by policy.

Do not assume yes.

The membership record may need a visibility/join boundary.

---

# 34. Project entitlement and conversation entitlement

A user who can view Project A does not automatically need access to every Project A conversation.

Examples:

* legal discussion,
* Finance discussion,
* executive-only conversation.

Conversation participation remains an additional authorization layer.

---

# 35. Conversation access must be server-authoritative

Conceptually:

```text
canPortalMemberReadConversation(
   membership,
   conversation
)
```

must evaluate:

* active Portal membership,
* Client/account,
* explicit participant membership,
* Project/resource scope,
* conversation visibility.

---

# 36. Knowing thread ID ≠ access

A Client cannot fetch another Client's conversation by manually entering its ID.

Every Thread endpoint performs fresh access checks.

---

# 37. Search authorization

Search must operate only over authorized conversations/messages.

Dangerous:

```text
search all messages
→ filter unauthorized hits afterwards
```

could leak:

* subjects,
* sender names,
* snippets.

Authorization scope must be applied first.

---

# 38. Full-text search

If message-body search is supported later, indexing must be tenant/account/permission aware.

Search index itself becomes sensitive infrastructure.

No cross-Client searchable global corpus.

---

# 39. Message preview

Design 045 may show the latest safe snippet.

The preview must come from a Message visible to the current member.

Never generate a snippet from a hidden/internal message.

---

# 40. Internal/private message visibility

If the canonical Conversation infrastructure supports internal-only Messages within a broader internal thread, the Client projection must structurally exclude them.

Safer still: use explicit audience/visibility modeling so the Portal query cannot retrieve them.

---

# 41. Internal participants

The Client may see selected internal participants:

* Account Manager,
* Editor,
* Project Lead.

Do not expose every internal watcher/subscriber/assigned employee.

---

# 42. Internal participant profile projection

Reuse Design 036 through a Client-safe DTO containing only approved information:

```text
display name
safe title
profile image
```

Not:

* internal Role,
* Team workload,
* email if not intended,
* Department hierarchy.

---

# 43. Message attachments

All Message attachments should reuse Design 030.

Correct:

```text
Message
  ↓
MessageAttachment
  ↓
Asset/FileVersion
```

No chat-specific binary storage.

---

# 44. Attachment version must be exact

If:

```text
Message:
“Please review attached proposal.”
Attachment:
Proposal v2
```

a later Proposal v3 must not replace the historical attachment automatically.

Conversation history pins the exact FileVersion sent.

---

# 45. Attachment ≠ Project File visibility automatically

A Message attachment can be intentionally shared with conversation participants.

That does not necessarily expose the whole surrounding Project folder/library.

Access applies to the specific attachment/version according to policy.

---

# 46. Upload lifecycle

Client-uploaded attachments should use canonical:

```text
upload
→ store
→ security scan
→ metadata extraction
→ ready
```

Uploaded ≠ safe/ready.

---

# 47. Quarantined attachments

If malware scanning fails/quarantines the file:

the Message can still exist.

Attachment state should communicate:

> File unavailable while security check completes / failed.

Do not lose the Message.

---

# 48. Attachment preview ≠ original download

Design 030 rules continue:

```text
VIEW
≠
DOWNLOAD
```

where required.

---

# 49. Message composition

Sending should conceptually validate:

* active membership,
* conversation access,
* allowed recipients,
* body limits,
* attachment readiness,
* resource context.

All validation is server-side.

---

# 50. Sending should be idempotent

Double-clicking Send or retrying after network uncertainty should not create duplicate Messages.

Use client request/idempotency keys or equivalent backend strategy.

---

# 51. Optimistic UI caution

The UI may display:

> Sending…

before server confirmation.

It should not permanently present:

> Sent

until canonical Message creation succeeds.

---

# 52. Send failure ≠ Message disappearance

If a draft was not successfully sent, preserve user composition state where practical.

Do not silently discard long Client messages after transient failure.

---

# 53. Draft message ≠ sent message

If drafts are supported:

```text
MessageDraft
≠
Message
```

or use clear draft semantics.

Unsaved textarea content should not appear in Thread history as a real Message.

---

# 54. Draft visibility

A Client draft belongs only to the current author unless collaborative drafts are explicitly frozen—which we do not introduce here.

---

# 55. Message deletion

Do not casually support hard deletion of sent communication.

If product supports removal:

* retention,
* counterpart visibility,
* audit,
* legal history

need clear semantics.

No deletion capability is added by this audit.

---

# 56. Edit/delete permissions

If the frozen system supports message edits/removals, they should have their own capabilities.

Do not assume:

```text
message.send
=
message.delete
```

---

# 57. Conversation status

Potential conversation states such as:

```text
OPEN
RESOLVED
CLOSED
```

should remain distinct from:

* read state,
* assignment,
* Client action state.

Exact enums Phase 3D.

---

# 58. Message Thread ≠ Support Request

Design 058 later owns Client Support / Support Requests.

A Support Request may contain a conversation.

But:

```text
SupportRequest
≠
Conversation
```

Support has additional lifecycle:

* category,
* priority,
* status,
* assignment,
* resolution.

Use messaging infrastructure without collapsing the domains.

---

# 59. Conversation assignment

Internal assignment of a Client Thread to an Account Manager may be useful operationally.

That assignment is generally internal and should not necessarily be visible to the Client.

---

# 60. Client sees participants, not internal routing

Internal:

```text
Queue:
Client Success

Assigned:
Sarah

Escalation:
Finance
```

Client-safe:

> Sarah from The Perspective

where appropriate.

Routing metadata remains internal.

---

# 61. Notifications integration

New Client Message may trigger:

```text
Notification
```

through the shared notification infrastructure.

No Message-specific notification database.

Design 064 later consumes those notifications.

---

# 62. Email notification ≠ Email copy of conversation truth

If email notification contains a message preview, the Portal Thread remains authoritative.

Security-sensitive content should avoid excessive leakage into email notifications where policy requires.

---

# 63. Unread badge consistency

Unread counts shown in:

* Design 041 Dashboard,
* Design 002 ClientShell,
* Design 045 Client Messages,
* Design 064 Notifications Center where applicable,

must use one canonical Message read-state/query infrastructure.

Message count and Notification count remain separate.

---

# 64. Design 041 relationship

Dashboard may show:

```text
2 unread messages
```

and latest Client message.

Opening Messages should reconcile with Design 045.

No duplicate counters.

---

# 65. Design 043 relationship

Project Detail may show Project-specific messaging.

Design 045 can filter/focus on the same Conversation set by Project context.

One canonical Conversation identity.

---

# 66. Design 063 relationship

Client Activity may contain:

> Message sent

as a Client-safe activity event.

It should never duplicate entire conversation content as Activity truth.

---

# 67. Design 064 relationship

Notifications can deep-link into:

```text
Design 074 Thread Detail
```

or Design 045 collection.

Notification read state ≠ Message read state unless intentionally synchronized by product policy.

---

# 68. Design 074 detail reuse

Design 074 should reuse:

* `Conversation`,
* `Message`,
* Participants,
* Read state,
* Attachments,
* delivery state.

It may provide deeper:

* thread history,
* reply composer,
* attachment interaction.

No new message backend.

---

# 69. Permissions architecture

Potential Phase 3D Portal capabilities:

```text
portal.messages.read
portal.messages.send
portal.messages.attach_file
```

and perhaps management capabilities where frozen.

Internal permissions remain separate.

Key rule:

> **Portal messaging permission does not grant internal Inbox access.**

---

# 70. Conversation-level access

Even with:

```text
portal.messages.read
```

the actor sees only Conversations they are authorized to access.

Global capability + resource policy are both required.

---

# 71. Send ≠ attach

Where sensitive attachments exist:

```text
message.send
≠
file.upload/share
```

The platform can require both capabilities/context checks.

---

# 72. Send ≠ participant management

A member allowed to reply does not necessarily have permission to:

* add Client users,
* add internal staff,
* remove participants.

Participant management should be separately controlled if supported.

---

# 73. Audit integration

Important Client communication events can generate Design 039 AuditEvents where policy requires:

```text
Client message sent
Sensitive attachment shared
Conversation participant changed
Conversation access changed
```

Do not audit every typing event.

---

# 74. Actor context

Audit must distinguish:

```text
CLIENT_PORTAL_MEMBER
```

from:

```text
INTERNAL_USER
```

for sent messages.

This preserves accountability.

---

# 75. Activity vs audit

Client-facing activity:

> Sarah replied to your message.

Audit:

```text
actor
conversationId
action
timestamp
organization/client context
result
```

Different records/purposes.

---

# 76. Retention

Client communications may need retention after:

* Project completion,
* Portal access revocation,
* employee departure.

Do not delete Thread history merely because Project moved to Completed.

---

# 77. Project archive

Archived Project messages may remain accessible according to Portal policy.

Project archive ≠ Conversation deletion.

---

# 78. Client account termination

If the Client relationship ends:

retention/access rules should determine:

* whether Portal remains read-only temporarily,
* when access ends,
* how messages remain internally preserved.

Exact lifecycle Phase 3D.

---

# 79. State coverage

Design 045 inherits Design 150 plus messaging-specific states:

```text
Messages Loading
No Conversations Yet
No Results

Conversation Unread
Conversation Read

Message Sending
Message Sent
Message Send Failed

Attachment Uploading
Attachment Scanning
Attachment Ready
Attachment Quarantined
Attachment Unavailable

Connection/Delivery Delayed
External Delivery Failed

Conversation Restricted
Conversation Access Revoked
Participant Removed

Search Failed
Partial Service Failure
```

These are not one Message status enum.

---

# 80. Empty ≠ unavailable

Correct:

> No messages yet.

only when the authorized query succeeds.

Messaging outage:

> Messages are temporarily unavailable.

Never show an empty inbox during service failure.

---

# 81. Unread count unavailable ≠ zero

If read-state service fails:

do not render:

```text
0 unread
```

as factual.

---

# 82. Message failed ≠ Conversation failed

One failed outgoing Message should not make the entire Thread unusable.

The Client should still see previous conversation history.

---

# 83. Attachment failure ≠ Message failure

A Message can remain readable even if its attachment preview/processing failed.

Localize the error to the attachment.

---

# 84. Partial service failure

Example:

```text
Conversation core  ✓
Messages           ✓
Attachments        ✕
Read receipts      ✓
```

Design 045 stays operational.

Only attachment controls degrade.

---

# 85. Read model

A useful collection model:

```text
ClientMessagesView
├── current Portal membership
├── authorized Conversations
├── safe participant summaries
├── Project/account context
├── latest visible Message
├── unread counts
├── message timestamp
├── attachment indicator
├── search/filter state
└── permission-aware actions
```

Design 074 then loads:

```text
ClientConversationDetailView
```

for one selected Thread.

---

# 86. Avoid giant internal Conversation DTO

Dangerous:

```text
GET /client/messages
→ internal Conversation
→ outreach metadata
→ assignment
→ internal notes
→ provider debug
→ Client filters it
```

Correct:

```text
ClientConversationSummary
```

with only Portal-safe fields.

---

# 87. Backend architecture

```text
Design 045 — Client Messages
          ↓
ClientPortalSessionContext
          ↓
Portal Messaging Authorization
          ↓
ClientConversationQueryService
          │
          ├── Conversation
          ├── Participants
          ├── Messages
          ├── Read State
          ├── Attachment references
          ├── Project/Client context
          └── Safe participant projections
          ↓
ClientConversationSummary[]
```

Sending:

```text
Client Portal
     ↓
sendClientMessage()
     ↓
permission + membership check
     ↓
canonical Message persistence
     ↓
delivery/notification
     ↓
activity/audit
```

---

# 88. Backend requirements

| Requirement                           | Status                                           |
| ------------------------------------- | ------------------------------------------------ |
| Client Portal authentication          | **Critical**                                     |
| Active Portal membership              | **Critical**                                     |
| Client/account isolation              | **Critical**                                     |
| Conversation-level authorization      | **Critical**                                     |
| Canonical Conversation entity         | **Critical**                                     |
| Canonical Message entity              | **Critical**                                     |
| Internal/Client projection separation | **Critical**                                     |
| Participant model                     | **Critical**                                     |
| Participant type distinction          | **Critical**                                     |
| Project/account context               | **Required**                                     |
| Participant-specific read state       | **Critical**                                     |
| Delivery vs read-state separation     | **Required**                                     |
| Safe Client Conversation DTO          | **Critical**                                     |
| Server-side search                    | **Required**                                     |
| Permission-safe search index          | **Critical if full-text search exists**          |
| Exact attachment FileVersion          | **Critical**                                     |
| Design 030 Asset integration          | **Critical**                                     |
| Attachment scanning                   | **Critical**                                     |
| Idempotent message sending            | **Critical**                                     |
| Unknown-sender protection             | **Critical if email ingestion exists**           |
| Provider correlation                  | **Required if external email replies supported** |
| Notification integration              | **Required**                                     |
| Design 063 activity integration       | **Required**                                     |
| Audit attribution                     | **Required**                                     |
| Membership revocation handling        | **Critical**                                     |
| Retention/history preservation        | **Required**                                     |
| Partial service failure               | **Critical**                                     |
| Designs 014/074 infrastructure reuse  | **Critical**                                     |

---

# 89. Responsive — Desktop

Desktop should preserve an efficient two-pane or equivalent frozen composition:

```text
Messages Header
↓
Search / Filters
↓
Conversation List
        +
Selected Conversation / Preview
↓
Participants / Project Context
↓
Reply / Attachment Actions
```

Design 045 remains simpler and Client-oriented compared with the dense internal Unified Inbox.

---

# 90. Responsive — Tablet

Following Design 152 principles:

* conversation list and detail can use master/detail,
* opening a Thread can fill most of the screen,
* search/filter becomes compact,
* attachments remain touch-safe,
* Project context stays visible without crowding messages.

---

# 91. Responsive — Mobile

Mobile priority:

```text
Messages
↓
Unread / Recent Threads
↓
Conversation Card
   ├── Participant
   ├── Project/Context
   ├── Latest snippet
   └── Time / Unread
↓
Open Thread
↓
Message History
↓
Reply Composer
```

Conversation list and Thread detail should become separate navigation states rather than squeezed side-by-side.

---

# 92. Mobile composer safety

Before sending attachments, clearly show:

* file name,
* upload/security state,
* selected Thread/context.

Avoid accidental attachment sharing to the wrong Project conversation.

---

# 93. Accessibility

Messaging must support:

* semantic sender names,
* timestamps,
* unread text/status,
* keyboard navigation,
* accessible message composer,
* attachment descriptions,
* non-color delivery states.

Unread cannot be represented only by a colored dot.

---

# 94. Main implementation risks

Design 045 exposes several major risks:

**Internal/Client messaging conflation**
Internal Unified Inbox payload exposed directly in Client Portal.

**Conversation/Message conflation**
Thread history stored as one mutable text object.

**Internal note/Message conflation**
Staff-only notes become visible to Client.

**Review comment/Message conflation**
Draft/Design comments lose exact-version context.

**Notification/Message conflation**
Notification content duplicates conversation truth.

**Outreach/Client communication conflation**
Sales prospect replies and authenticated Client threads share inappropriate workflows.

**Contact/Portal participant conflation**
Every CRM Contact gains conversation access.

**Project entitlement/Conversation entitlement conflation**
Viewing Project grants every Project conversation.

**Global read-state bug**
One participant reading a Message marks it read for everyone.

**Sent/delivered/read conflation**
Provider state represented inaccurately.

**Unknown-sender correlation**
External email inserted into wrong Client conversation.

**Subject-line correlation**
Threads incorrectly joined by `Re:` titles.

**Latest-attachment bug**
Historical Message attachment silently changes to newer FileVersion.

**Project-file/attachment conflation**
Sharing one attachment exposes whole Project file library.

**Uploaded/ready conflation**
Unsafe attachment becomes downloadable before scanning.

**Duplicate sends**
Network retry creates repeated Client Messages.

**Participant-history leakage**
New participant automatically sees old restricted conversation history.

**Search leakage**
Unauthorized message subjects/snippets appear through search.

**Portal/internal participant leakage**
Internal routing/assignment data exposed.

**Membership revocation failure**
Former Client user continues fetching conversations.

**Message/activity/audit duplication**
Three systems become competing histories.

**045/074 duplicate messaging engines**
Thread Detail receives another Conversation backend.

None requires another design.

They require correct messaging identity, projection, attachment, permission, and delivery architecture.

# Design 045 Audit Verdict

## **PASS — CLIENT-SAFE MESSAGING & CONVERSATION WORKSPACE ANCHOR**

**Domain directive:** **Conversation ≠ Message ≠ Notification ≠ Internal Note ≠ Activity ≠ Outreach Reply.**

**Reuse directive:** Design 045 must reuse the canonical Conversation/Message infrastructure established around Design 014 while exposing a completely separate Client-safe projection.

**Projection directive:** internal inbox metadata, internal notes, CRM/outreach state, staff routing and provider diagnostics must never enter Client Portal DTOs.

**Identity directive:** CRM Contact, Client Portal membership, internal User and ConversationParticipant remain separate concepts.

**Authorization directive:** Client Portal capability plus explicit Conversation/resource participation determines access; Project visibility alone does not automatically expose every Project conversation.

**Read-state directive:** unread/read state is participant-specific and remains separate from delivery state and Conversation workflow state.

**Message directive:** sent communication is append-oriented historical truth; drafts, sent Messages and delivery records remain distinct.

**Delivery directive:** Portal Message truth remains separate from optional email/provider delivery; sent, delivered and read states are never fabricated or collapsed.

**Attachment directive:** all attachments consume Design 030's exact Asset/FileVersion infrastructure, scanning and visibility policy; a historical Message always pins the exact shared version.

**Search directive:** search executes only over already authorized conversations/messages so subjects, senders and snippets cannot leak across Client boundaries.

**Send directive:** `sendClientMessage()` is server-authoritative and idempotent; double-click/network retry must not create duplicate Messages.

**Membership directive:** removing Portal/Conversation access preserves historical communication while immediately revoking future access.

**Notification directive:** new-message notifications reuse the shared Notification infrastructure; Notification read state and Message read state remain separate concepts unless explicitly synchronized by policy.

**Activity directive:** Client Activity may reference communication events but never becomes the conversation store.

**Audit directive:** material Client communication actions preserve the correct Client Portal actor identity in Design 039 where audit policy requires it.

**Support directive:** Design 058 Support Requests may consume Messaging, but SupportRequest remains a separate lifecycle/domain.

**Responsive directive:** desktop supports conversation-list/detail productivity while mobile becomes thread list → focused Thread → reply flow rather than compressing both panes.

**Overlap directive:** Designs **014, 045, 058, 063–064 and 074** must reuse one canonical messaging/read-state/attachment/delivery foundation while maintaining internal, Client, Support, Activity and Notification boundaries.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE CONVERSATION + MESSAGE + PARTICIPANT + READ-STATE + ATTACHMENT + DELIVERY INFRASTRUCTURE WITH STRICT INTERNAL/CLIENT PROJECTIONS — DO NOT BUILD SEPARATE MESSAGE DATABASES FOR UNIFIED INBOX, CLIENT PORTAL, PROJECTS, SUPPORT OR THREAD DETAIL.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **45 / 153** |
| **PASS**                                   |                         **45** |
| **STANDARDIZE decisions**                  |                         **43** |
| **Potential implementation-overlap flags** |                         **36** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**45 / 153 = 29.4% audited.**

### Canonical messaging architecture after Design 045

```text
               CANONICAL MESSAGE DOMAIN
                        │
       ┌────────────────┼─────────────────┐
       │                │                 │
       ↓                ↓                 ↓
 Conversation       Participants       Messages
                                          │
                              ┌───────────┼───────────┐
                              ↓           ↓           ↓
                          Read State   Attachments   Delivery
                              │           │
                              │       Asset 030
                              │
        ┌─────────────────────┴──────────────────────┐
        ↓                                            ↓
INTERNAL PROJECTION                           CLIENT PROJECTION
Design 014                                    Design 045
Unified Inbox                                 Client Messages
                                                     │
                                                     ↓
                                               Design 074
                                             Thread Detail
```

# Next Sequential Audit Target

## **Design 046 — Meetings**

Its frozen identity is already locked.

After Design 046 we continue strictly:

**047 Tasks / Requests → 048 Client Questionnaires → 049 Client Draft Review → 050 Client Design Review → 051 Client Files & Assets → 052 Client Approvals → 053 Client Contracts → 054 Client Invoices & Payments → 055 Client Publishing & Distribution → 056 Client Reports & Downloads → … → 077 Client Access Recovery**

For **Design 046**, the audit remains exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no extra screen, no skipping and no sequence change.**

