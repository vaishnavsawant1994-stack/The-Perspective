# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 087 — Contact Detail / Contact 360

Design 087 should become the **canonical Team Workspace Contact 360 composition surface** built around the stable Contact identity established by Design 086.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Contact ≠ ContactProfileProjection ≠ CommunicationAddress ≠ ContactCompanyRelationship ≠ Company ≠ Lead ≠ Deal/Opportunity ≠ ClientRelationship ≠ User/PortalIdentity ≠ Message/Conversation ≠ Meeting/FollowUp ≠ Task ≠ Note ≠ ActivityEvent.**

The central implementation rule is:

> **Contact 360 composes authorized CRM, employment, communication, commercial and interaction context around one canonical Contact. It must never become a second Contact entity or a giant mutable record containing copied emails, Companies, Leads, Deals, Messages, Meetings, Tasks, Notes, Portal state and Activity. Every section remains owned by its canonical source domain and independently authorized.**

---

# 1. Classification

| Audit field                      | Classification                                                                                                                     |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                    | **087**                                                                                                                            |
| **Canonical name**               | **Contact Detail / Contact 360**                                                                                                   |
| **Product area**                 | Team Workspace / CRM / Contacts                                                                                                    |
| **User surface**                 | **Authenticated Team Workspace**                                                                                                   |
| **Screen class**                 | Entity Detail / Cross-Domain Person 360 Workspace                                                                                  |
| **Classification**               | **Canonical Contact Entity Detail & Cross-Domain Relationship Composition Anchor**                                                 |
| **Primary purpose**              | Present a comprehensive, permission-safe operational view of one canonical CRM Contact and all relevant relationships/interactions |
| **Primary entity**               | **Contact** — Design 086                                                                                                           |
| **Primary read projection**      | **ContactProfileProjection / Contact360View**                                                                                      |
| **Communication dependency**     | **CommunicationAddress / ContactPoint**                                                                                            |
| **Employment dependency**        | **ContactCompanyRelationship**                                                                                                     |
| **Company dependency**           | Designs 084–085                                                                                                                    |
| **Lead dependency**              | Design 011 / later Design 089                                                                                                      |
| **Deal dependency**              | Designs 016–017                                                                                                                    |
| **Client dependency**            | Design 021                                                                                                                         |
| **Portal identity dependency**   | Designs 062 / 075–077                                                                                                              |
| **Messaging dependency**         | Designs 014 / 074                                                                                                                  |
| **Meeting/follow-up dependency** | Design 015                                                                                                                         |
| **Task dependency**              | Design 034                                                                                                                         |
| **Note dependency**              | contextual Note domain if present in frozen design                                                                                 |
| **Activity dependency**          | cross-domain Activity projection                                                                                                   |
| **Audit dependency**             | Design 039 — separate                                                                                                              |
| **Universal Search dependency**  | Design 079                                                                                                                         |
| **Primary query service**        | `Contact360QueryService`                                                                                                           |
| **Profile service**              | `ContactService` / `ContactProfileService`                                                                                         |
| **Relationship service**         | `ContactRelationshipService`                                                                                                       |
| **Auth**                         | Required                                                                                                                           |
| **Authorization**                | Active OrganizationMembership + Contact access + per-section source permissions                                                    |
| **Implementation priority**      | **Critical CRM Person Composition / Privacy / Historical Interaction Integrity**                                                   |
| **Reuse level**                  | **Extremely High across CRM, Sales, Client, communication and Work domains**                                                       |

Design 087 should answer:

> **“Who is this canonical Contact, what current and historical communication/employment identity do we know, which Companies/Leads/Deals/Client relationships are connected to them, what interactions and work involve them, and which of those details is this current Team member actually authorized to see or act on?”**

Conceptually:

```text
Contact C-100
      │
      ├── Profile
      ├── Communication addresses
      ├── Company relationships
      ├── Leads
      ├── Deals / opportunities
      ├── Client relationship
      ├── optional User / Portal linkage
      ├── Conversations / Messages
      ├── Meetings / FollowUps
      ├── Tasks
      ├── Notes
      └── Activity
              │
              ↓
        Contact360View
        read composition
              │
              ↓
          Design 087
```

---

# 2. Reuse

## Reuse Design 086 as the only canonical Contact identity

Design 087 must consume the exact same:

```text
Contact.id
```

used in Design 086.

Do not introduce:

```text
Contact360
ContactDetailEntity
Person360Record
CRMProfileContact
```

as new canonical business records.

A `Contact360View` is acceptable only as a **read composition**.

---

## Design 086 directory and Design 087 detail must share identity

Correct:

```text
Design 086
ContactDirectoryEntry
       │
       ↓ contactId
Design 087
Contact360View
       │
       ↓
Contact C-100
```

No migration/conversion is needed between list and detail.

---

## Reuse CommunicationAddress from Design 086

The Contact profile must not collapse all communication data into:

```text
contact.email
contact.phone
```

as the sole truth.

Design 087 should consume the canonical collection of:

* current addresses,
* secondary addresses,
* historical addresses,
* verification/deliverability states,
* provenance.

---

## Contact profile ≠ CommunicationAddress collection

Permanent.

The profile may display:

> Primary work email

but that is a projection from the canonical address collection.

---

## Reuse ContactCompanyRelationship

Current Company and current title must be derived from the employment/association relationship foundation.

Correct:

```text
Contact
   ↓
ContactCompanyRelationship
   ↓
Company
```

not:

```text
Contact.companyName
Contact.jobTitle
```

as immutable person identity.

---

## Design 087 ≠ Designs 084–085

Contact 360 can summarize related Company context.

Company 360 remains authoritative for the Company entity.

---

## Reuse Design 011 Lead domain

A Contact can be linked to canonical Leads.

Contact 360 may compose:

* open Leads,
* historical Leads,
* qualification status,

but Lead remains a separate entity.

---

## Reuse Designs 016–017 for Deals

A Contact can be:

* primary commercial contact,
* decision maker,
* stakeholder,

for one or more Deals.

Those relationship semantics belong to Deal/Contact relation policy.

Deal lifecycle must not become Contact lifecycle.

---

## Reuse Design 021 for Client relationship

A Contact may be associated with a Client relationship/account.

That is not the Contact itself.

---

## Reuse Design 062 for Portal membership

A Contact can exist without:

* User,
* AuthenticationIdentity,
* ClientPortalMembership.

If a Contact is explicitly linked to a platform User, Design 087 may show that safe relationship if frozen.

But Portal access remains governed entirely by the canonical User/Membership system.

---

## Reuse Designs 014/074 for communication

Contact 360 may summarize Conversations/Messages involving the Contact.

The source truth remains:

```text
Conversation
Message
Participant / recipient evidence
```

not embedded Contact communication history.

---

## Reuse Design 015 for Meetings/FollowUps

Contact interactions can include:

* upcoming Meeting,
* previous Meeting,
* overdue FollowUp,
* completed FollowUp.

Meeting and FollowUp remain distinct canonical entities.

---

## Reuse Design 034 for Tasks

Contact-related Tasks remain Tasks with typed Contact context.

---

## Notes remain contextual records

If frozen Design 087 includes notes, Notes remain separately authored/time-stamped/permissioned records.

Do not create:

```text
contact.notes = giantTextBlob
```

as the note system.

---

## Activity remains a projection

Contact Activity can aggregate meaningful events from canonical source domains.

It is not a second event database.

---

# 3. Entities

## Contact

The stable CRM person identity established in Design 086 remains unchanged.

---

## Contact ≠ ContactProfileProjection

Conceptually:

```text
Contact360View
├── contact
├── identitySummary
├── communicationSummary
├── companyRelationshipSummary
├── leadSummary
├── dealSummary
├── clientRelationshipSummary
├── portalRelationshipSummary
├── conversationSummary
├── meetingFollowUpSummary
├── taskSummary
├── noteSummary
├── activitySummary
└── sectionAvailability
```

This is a composed DTO/read model.

It is not another persistent person entity.

---

## ContactProfileProjection should be rebuildable

If a cached/materialized Contact 360 projection is lost:

rebuild from canonical sources.

No Contact data should disappear.

---

## Contact profile fields ≠ all person-related facts

Basic Contact-owned data can include things such as:

* current display name,
* preferred name,
* classification,
* CRM ownership,
* safe profile metadata,

according to frozen design.

But:

* employer,
* communication address,
* Lead status,
* Portal role,
* last Meeting

should not all become Contact columns simply for convenience.

---

## CommunicationAddress

Design 086's boundary remains:

> **Contact ≠ email/phone/contact channel.**

---

## One Contact can have many CommunicationAddresses

Example:

```text
Contact C-100
├── Email E1 — historical work
├── Email E2 — current work
├── Phone P1 — current
└── Phone P2 — historical
```

---

## Current/primary address ≠ permanent Contact identity

Permanent.

---

## Address verification ≠ Contact verification

A verified work email proves something about that address.

It does not prove every fact about the Contact.

---

## Address invalid/bounced ≠ Contact invalid

Permanent.

---

## Historical communication addresses should remain available as evidence

Changing:

```text
old@acme.com
→
new@globex.com
```

must not rewrite historical:

* email sends,
* Messages,
* Meetings,
* contracts,
* outreach records.

---

## Historical message recipient snapshot ≠ current CommunicationAddress

Critical.

A Message sent to:

```text
old@acme.com
```

remains evidence that it was sent there even after the Contact changes employer.

---

## ContactCompanyRelationship

This remains the canonical employment/association history.

---

## Current Company/title are projections

Conceptually:

```text
primaryCurrentCompany
primaryCurrentTitle
```

may be derived for display.

They are not the sole relationship truth.

---

## Contact can have multiple concurrent relationships

Examples:

```text
Founder → Company A
Board Member → Company B
Advisor → Company C
```

Architecture must support this even if the frozen design displays only one primary relationship.

---

## Relationship history ≠ Contact history blob

Each association retains:

* Company,
* role/title,
* effective dates,
* provenance.

---

## Employer change ≠ Contact recreation

Permanent.

---

## Employer change ≠ Company rename

Permanent.

---

## Company merge ≠ Contact merge

Permanent.

If Companies A/B merge, ContactCompanyRelationships are reconciled to the canonical Company lineage.

The person does not become a new Contact.

---

## Lead

Contact 360 can compose all authorized Leads linked to this person.

---

## Lead lifecycle ≠ Contact lifecycle

Permanent.

Examples:

```text
Lead DISQUALIFIED
Contact ACTIVE

Lead CONVERTED
Contact ACTIVE

Lead CLOSED
Contact ACTIVE
```

All valid.

---

## One Contact may have multiple Leads

Depending on CRM rules, a Contact can re-enter different commercial campaigns/opportunities over time.

Do not assume Contact = one Lead forever.

---

## Lead owner ≠ Contact owner necessarily

Separate responsibilities.

---

## Deal / Opportunity

A Contact can participate in several Deals.

Conceptually a relationship can preserve:

```text
DealContactRole
├── dealId
├── contactId
├── role
├── influence/decision context where supported
└── effective state
```

Exact model Phase 3D.

---

## DealContactRole ≠ ContactCompanyRelationship

Commercial opportunity role and employment relationship are different.

---

## Deal status ≠ Contact status

Permanent.

---

## Deal won/lost ≠ Contact created/deleted

Permanent.

---

## Deal amount ≠ Contact value

If Design 087 shows commercial summaries, they are derived.

Do not persist:

```text
contact.value = $500,000
```

as canonical person identity/state.

---

## ClientRelationship

A Contact can be associated with a canonical Client relationship.

Potentially:

```text
Contact
   ↓
ClientContactRelationship
   ↓
Client
```

---

## ClientContactRelationship ≠ ContactCompanyRelationship

A person can be employed at Company A and still have a separately modeled Client contact relationship.

Often related, never identical by assumption.

---

## Contact ≠ ClientPortalUser

Permanent.

---

## Contact ↔ User relationship

If explicitly linked:

```text
Contact
   ↓
ContactUserLink
   ↓
User
```

the link means:

> these two platform/CRM identities refer to the same known person under governed evidence.

It does **not** mean:

* Contact owns User authentication,
* User permissions are stored on Contact,
* Contact edits update credentials.

---

## User ≠ Portal membership

Even after a Contact→User link:

Portal membership remains another relationship.

---

## Portal role ≠ CRM Contact type

Permanent.

---

## Contact archived ≠ User disabled

Permanent.

---

## User disabled ≠ Contact archived

Permanent.

---

## Message / Conversation

A Conversation involving a Contact remains canonical communication state.

---

## Contact ≠ Conversation participant identity universally

The communication system may preserve:

* Contact reference,
* User reference,
* external participant identity,
* exact recipient/sender snapshot,

depending on channel.

Do not force all historical communication into only `contactId`.

---

## Conversation participation ≠ Portal membership

Permanent.

---

## Message read state ≠ Contact activity state

Permanent.

---

## Message delivery ≠ Contact CommunicationAddress verification

Permanent.

---

## Meeting

Meeting remains the canonical scheduled interaction.

---

## Meeting participant ≠ Contact employment

Permanent.

---

## Meeting completed ≠ FollowUp completed

Permanent.

---

## FollowUp

FollowUp remains separately owned/actioned.

---

## Contact “next action” is derived

If the frozen Contact 360 displays:

> Next action: Follow up Friday

that should resolve from canonical FollowUp/Task/Meeting state.

No independent `contact.nextAction` truth.

---

## Task

A Task can reference Contact as typed context.

Task lifecycle remains Design 034's responsibility.

---

## Task assignee ≠ Contact

The Contact may be the subject/context while a Team member is assigned to perform the Task.

---

## Note

A Contact Note should be:

* authored,
* timestamped,
* visibility-scoped,
* linked to Contact context.

---

## Note ≠ Contact profile field

Permanent.

---

## Note ≠ Message

A private internal CRM note is not an external communication.

---

## Note ≠ ActivityEvent

Creating a Note may generate Activity, but they remain separate.

---

## ActivityEvent

Contact Activity can project events such as:

```text
Contact created
Communication address added
Employment changed
Lead created
Deal advanced
Meeting completed
Message received
FollowUp completed
Note added
Client relationship created
```

where authorized.

---

## ActivityEvent must preserve source identity

Conceptually:

```text
sourceType
sourceId
sourceEventId
occurredAt
safe actor
safe summary
```

---

## ActivityEvent ≠ AuditEvent

Design 039 remains separate.

---

## Historical interaction evidence must survive profile change

This is one of Design 087's strongest invariants.

If Contact changes:

* name,
* email,
* phone,
* employer,
* title,

the following must not be rewritten:

* historical Message addressing,
* Meeting participant snapshots,
* outreach deliveries/replies,
* Deal history,
* Proposal recipient evidence,
* Contract Signer evidence,
* Invoice/legal snapshots,
* Audit actors.

---

## Contact merge also must preserve historical evidence

A merge can update canonical navigation/reference targets.

It must not rewrite old evidence as though the surviving Contact had always been the original record.

---

# 4. Permissions

Design 087 requires **section-level and field-level authorization**.

Conceptually:

```text
canReadContactProfile
canReadCommunicationAddresses
canReadEmploymentHistory
canReadRelatedCompany
canReadLeads
canReadDeals
canReadClientRelationship
canReadUserPortalLink
canReadConversations
canReadMeetingsFollowUps
canReadTasks
canReadNotes
canReadActivity
```

---

## Contact access ≠ all-person-data access

Critical.

A Team user may see:

> Sarah Patel, CMO at Globex

without permission to see:

* personal phone,
* private email,
* Portal account state,
* confidential Deal values,
* internal Notes.

---

## Server-side section filtering is mandatory

Do not:

```text
GET Contact360
→ all data
→ frontend hides restricted cards
```

Sensitive sections must be authorized before inclusion.

---

## Communication fields need field-level privacy

Business email and private phone may have different visibility policies.

---

## Employment visibility ≠ Company edit authority

Viewing Contact's employer does not allow editing the Company.

---

## Lead access ≠ Lead mutation

Permanent.

---

## Deal visibility ≠ commercial value visibility necessarily

A user might know:

> Contact is part of Deal D1

without permission to see:

> $250,000.

---

## Client relationship visibility ≠ Portal administration

Permanent.

---

## Contact/User linkage visibility can be sensitive

Ordinary Sales users may not need:

* authentication provider details,
* account-security status,
* session information.

Contact 360 should expose only the safe relationship state needed by frozen UI.

---

## Contact 360 must never expose credentials

Absolute.

---

## Message access follows Conversation permission

Knowing the Contact does not grant access to every Conversation involving them.

---

## Meeting access follows Meeting policy

Same.

---

## Note visibility remains note-specific

Private Notes must remain private.

---

## Activity inherits source authorization

An Activity entry must be suppressed or safely generalized if its source is unauthorized.

---

## Activity count can leak restricted records

If the UI exposes:

> 27 interactions

the aggregation policy must be permission-aware.

---

## Direct related entity IDs reauthorize

Opening:

* Lead,
* Deal,
* Company,
* Message,
* Meeting,
* Task,

must perform fresh canonical authorization.

---

## Contact owner ≠ security authority

CRM ownership is operational responsibility.

It does not imply permission escalation.

---

## Edit Contact ≠ edit User

Permanent.

---

## Edit Contact ≠ edit ClientPortalMembership

Permanent.

---

## Edit Contact ≠ edit Company

Permanent.

---

## Edit Contact ≠ edit Deal

Permanent.

---

## Add Note ≠ edit Contact

Separate capability where appropriate.

---

## Create Task ≠ edit Contact

Separate.

---

## Cross-tenant composition prohibited

Every related entity joined into the 360 view must be verified against current tenant/workspace and valid relationship.

---

# 5. States

Design 087 must keep **Contact lifecycle, communication state, relationship state, related-domain lifecycle, section availability and composition state** separate.

### Contact lifecycle

```text
Active
Inactive
Archived
Merged
```

where applicable.

### Communication section

```text
Available
No Known Address
Restricted
Unavailable
```

with each address retaining its own verification/lifecycle state.

### Company relationship

```text
Current Relationship
Historical Relationship
Multiple Current Relationships
No Current Relationship
Relationship Unavailable
```

### Lead section

```text
Available
No Authorized Leads
Restricted
Unavailable
```

while each Lead retains canonical lifecycle.

### Deal section

Same principle.

### Client relationship

```text
Relationship Exists
No Relationship
Restricted
Unavailable
```

### User / Portal relationship

```text
No User Link
User Linked
Portal Membership Exists
No Portal Membership
Restricted
Unavailable
```

These remain independent.

### Interaction sections

Messages, Meetings, FollowUps, Tasks, Notes and Activity each have:

```text
Loading
Available
Empty
Restricted
Unavailable
Failed
```

as applicable.

---

## Contact available + Message service unavailable

The Contact remains available.

---

## Contact available + Deal service unavailable

The Contact remains available.

---

## One related-domain failure ≠ Contact missing

Permanent.

---

## No known email ≠ communication service failure

Permanent.

---

## No current Company ≠ Company service failure

Permanent.

---

## No Leads ≠ Lead service unavailable

Permanent.

---

## No Deals ≠ Deal service unavailable

Permanent.

---

## No Client relationship ≠ Client service unavailable

Permanent.

---

## No Portal membership ≠ Portal subsystem unavailable

Permanent.

---

## No Messages ≠ communication service failure

Permanent.

---

## Restricted Messages ≠ no Messages

Critical.

---

## Message service failure ≠ no interactions

Critical.

---

## Lead disqualified ≠ Contact inactive

Permanent.

---

## Deal lost ≠ Contact inactive

Permanent.

---

## Client relationship ended ≠ Contact archived

Permanent.

---

## Portal membership revoked ≠ Contact archived

Permanent.

---

## Communication address invalid ≠ Contact inactive

Permanent.

---

## Employer relationship ended ≠ Contact archived

Permanent.

---

## Task overdue ≠ Contact status changed

Permanent.

---

## FollowUp completed ≠ Contact closed

Permanent.

---

## Contact merged ≠ interaction history deleted

Permanent.

---

## Contact updated elsewhere

Profile edits should detect concurrent revision conflicts.

Related sections can update independently without forcing a Contact revision if canonical Contact itself did not change.

---

## State Coverage

Design 087 inherits Design 150 plus:

```text
Contact Loading
Contact Available
Contact Restricted
Contact No Longer Accessible
Contact Archived
Contact Merged

Contact Profile Available
Contact Profile Incomplete
Contact Profile Conflict

Communication Loading
Communication Available
No Known Communication Address
Communication Restricted
Communication Service Unavailable

Current Employment Available
Historical Employment Available
Multiple Current Relationships
No Current Company Relationship
Employment Restricted
Employment Service Unavailable

Leads Loading
Leads Available
No Authorized Leads
Leads Restricted
Lead Service Unavailable

Deals Loading
Deals Available
No Authorized Deals
Deals Restricted
Deal Service Unavailable

Client Relationship Loading
Client Relationship Exists
No Client Relationship
Client Relationship Restricted
Client Service Unavailable

User Link Available
No User Link
User Link Restricted
User Identity Service Unavailable

Portal Membership Exists
No Portal Membership
Portal State Restricted
Portal Service Unavailable

Conversations Loading
Conversations Available
No Authorized Conversations
Conversations Restricted
Messaging Service Unavailable

Meetings / FollowUps Loading
Interactions Available
No Current Interactions
Interactions Restricted
Interaction Service Unavailable

Tasks Loading
Tasks Available
No Current Tasks
Tasks Restricted
Task Service Unavailable

Notes Loading
Notes Available
No Notes
Notes Restricted
Notes Service Unavailable

Activity Loading
Activity Available
No Authorized Activity
Activity Restricted
Activity Service Unavailable

Contact Updated Elsewhere
Related Data Changed
Partial Contact 360 Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve the Contact as the primary person identity and compose related domains around them.

Conceptually:

```text
Contact identity
↓
Contact profile / safe communication
↓
Current Company / employment
↓
Cross-domain sections
   ├── Leads
   ├── Deals
   ├── Client
   ├── Conversations
   ├── Meetings / FollowUps
   ├── Tasks
   ├── Notes
   └── Activity
```

Only frozen-design sections should render.

---

## Person identity remains primary

The header should represent:

> Sarah Patel

not:

> [sarah@globex.com](mailto:sarah@globex.com)

or:

> Globex CMO Lead.

Email, employer and Lead status remain secondary context.

---

## Current Company/title should visually read as relationship

Correct:

> Sarah Patel
> Chief Marketing Officer · Globex

not as evidence that Company/title are immutable Contact identity fields.

---

## Communication methods should preserve semantic types

Where multiple addresses appear:

* work email,
* alternate email,
* phone,

must remain distinguishable.

---

## Historical addresses should not clutter current primary view

The backend preserves them.

The frozen UI determines whether they appear directly, under history, or in expanded detail.

No data loss is implied by compact presentation.

---

## Related domains should retain labels

A Deal card must look like a Deal.

A Task card must look like a Task.

A Message must remain communication.

Do not turn everything into generic “Contact activity.”

---

## Tablet

Following Design 152:

* Contact identity stays first,
* communication and Company summary stack,
* cross-domain sections become cards/compact lists,
* source-specific actions remain recognizable.

---

## Mobile

Priority:

```text
Contact
↓
Name
↓
Current role / Company
↓
Primary safe communication
↓
Leads / Deals
↓
Client context
↓
Interactions
↓
Tasks / Notes
↓
Activity
```

Exact ordering remains governed by frozen responsive system.

---

## Mobile communication privacy

Do not accidentally expose additional PII simply because a card expands differently on mobile.

---

## Mobile historical identity

If former employer/email data is shown, label it clearly as historical.

---

## Partial failure

One failed section must render locally.

Do not replace the entire mobile Contact page with:

> Something went wrong

because the Activity service failed.

---

## Accessibility

A Contact 360 could semantically communicate:

> Sarah Patel. Chief Marketing Officer at Globex. Primary work email available. Two active Leads. One active Deal. Client relationship exists. Three upcoming interactions.

only where authorized and canonical data supports it.

---

# 7. Backend Requirements

## Contact 360 composition architecture

```text
Design 087
    ↓
Authenticated Workspace Context
    ↓
Contact360QueryService
    │
    ├── ContactProfileAdapter
    ├── CommunicationAdapter
    ├── EmploymentAdapter
    ├── CompanyContextAdapter
    ├── LeadAdapter
    ├── DealAdapter
    ├── ClientRelationshipAdapter
    ├── UserPortalLinkAdapter
    ├── ConversationAdapter
    ├── MeetingFollowUpAdapter
    ├── TaskAdapter
    ├── NoteAdapter
    └── ActivityAdapter
    ↓
Contact360View
```

This is a **read composition layer**.

---

## Query must anchor on canonical Contact ID

Conceptually:

```text
getContact360(contactId, currentMembership)
```

First:

```text
authorize canonical Contact
```

Then resolve each related section under its own policy.

---

## No giant Contact360 table

Avoid:

```text
Contact360Record
{
  contact,
  emailsJson,
  companiesJson,
  leadsJson,
  dealsJson,
  messagesJson,
  meetingsJson,
  tasksJson,
  notesJson,
  activityJson
}
```

as operational source truth.

A materialized read projection is acceptable only if:

* source-derived,
* rebuildable,
* revision-aware,
* permission-safe.

---

## Section-result contract

A useful composition pattern is conceptually:

```text
SectionResult<T>
├── availability
├── data
├── count semantics
├── freshness
└── authorization state
```

This prevents:

```text
[]
```

from ambiguously meaning:

* no records,
* no permission,
* service failed.

---

## Contact core should load independently

If canonical Contact query succeeds:

related subsystem failure should not block Contact identity from rendering.

---

## Profile mutations use ContactService

Do not mutate through:

```text
PATCH /contact360
```

---

## Communication adapter

Should query canonical CommunicationAddress records and return field-safe projections.

Do not derive communication solely from:

* recent Message,
* Lead email field,
* Portal login email.

---

## Primary communication resolver

If frozen UI shows one primary contact method:

centralize the rule.

For example, resolve based on:

* current state,
* purpose,
* verification/deliverability,
* explicit primary designation.

Do not let each screen choose a different email.

---

## Historical-address preservation

Changing primary address updates projection but never historical Message/outreach recipient snapshots.

---

## Employment adapter

Use ContactCompanyRelationship.

Never join solely on:

```text
contact.companyName
```

---

## Current relationship resolver

If several active Company relationships exist:

use a governed primary/current relationship policy.

Do not arbitrarily choose first DB row.

---

## Lead adapter

Query canonical Leads linked by Contact identity.

Return only authorized fields/states.

---

## Deal adapter

Use explicit Contact↔Deal relationship or canonical Deal/Lead relationship semantics.

Do not infer every Company Deal automatically belongs personally to this Contact.

---

## Client relationship adapter

Use explicit Contact↔Client relationship.

Do not infer Client status from Company alone.

---

## User/Portal link adapter

Return only safe relationship information such as, if frozen:

* platform account linked,
* Portal access exists.

Do not return:

* credential material,
* auth provider token,
* session tokens,
* security internals.

---

## Contact/User link does not drive security

Design 075/062 remain authoritative.

---

## Conversation adapter

Should query canonical Conversations where this Contact is legitimately associated as participant/contact context.

Do not search by current email string alone.

That would lose historical communication after address changes and can include messages for reassigned/shared emails.

---

## Historical participant identifiers

Messaging domain should preserve exact participant/recipient evidence at communication time.

Contact 360 can resolve those historical records back to Contact when a governed relation exists.

---

## Conversation authorization

Every returned Conversation summary must pass current source authorization.

---

## Meeting adapter

Should use canonical participant/Contact relationships.

Do not infer Meetings solely from title/string matching.

---

## FollowUp adapter

Use canonical FollowUp ownership/context.

A FollowUp about Contact remains distinct from Meeting.

---

## Task adapter

Use typed Contact context/reference.

Do not return every Task belonging to Contact's Company.

---

## Notes adapter

Use:

* typed Contact context,
* audience/visibility policy,
* authored immutable history.

---

## Activity adapter

Aggregate authorized events around Contact from canonical domains.

Potential source events:

```text
ContactUpdated
CommunicationAddressChanged
EmploymentRelationshipChanged
LeadCreated
DealContactAdded
DealStageChanged
MeetingCompleted
FollowUpCompleted
MessageReceived
TaskCompleted
NoteCreated
ClientContactLinked
```

---

## Activity source references

Every entry should preserve exact source identity.

---

## Activity deduplication

Same event appearing through:

* Contact,
* Lead,
* Company,

should not create duplicate timeline entries if the canonical event is identical.

Use source-event identity.

---

## Activity ordering

Use canonical occurrence time + stable tie-breaker.

---

## Historical interactions vs current profile

Contact 360 can resolve current display name/avatar for convenience, but historical evidence should preserve event-time facts when required.

Example:

> Email sent to [old@acme.com](mailto:old@acme.com)

should not be rewritten to only show [new@globex.com](mailto:new@globex.com).

---

## Interaction summary resolvers

If frozen UI displays:

* last contacted,
* next meeting,
* next follow-up,
* unread conversation count,

define each centrally.

---

## “Last contacted” semantics

Must specify which events count:

* sent Message,
* received reply,
* completed Meeting,
* phone/contact attempt,

according to product policy.

Do not let frontend infer from any random Activity entry.

---

## “Next action” semantics

Should reuse canonical work/follow-up resolver rather than storing another Contact field.

---

## Aggregates

Potential frozen summary metrics such as:

* open Lead count,
* active Deal count,
* total interaction count,

must have governed definitions and permissions.

---

## Currency safety

If Deal value summaries exist:

* decimal safe,
* currency aware,
* no naïve cross-currency summing.

---

## Optimistic concurrency

Contact profile edits inherit Design 086 revision semantics.

Communication and employment relationship mutations can have independent revision controls.

---

## Source-specific mutations

Examples:

```text
update Contact profile
→ ContactService

add email
→ ContactCommunicationService

change employer
→ ContactCompanyRelationshipService

advance Lead
→ LeadService

advance Deal
→ DealService

send Message
→ MessagingService

schedule Meeting
→ MeetingService

complete FollowUp
→ FollowUpService

complete Task
→ TaskService

add Note
→ NoteService
```

Never one generic Contact360 mutation.

---

## Cross-domain transaction boundary

Contact 360 should not attempt one distributed transaction across:

* Contact,
* Lead,
* Deal,
* Messaging,
* Task,
* Client.

Each canonical domain owns its transaction.

Projection updates afterward.

---

## Event-driven invalidation

Events such as:

```text
ContactUpdated
ContactCommunicationAddressChanged
ContactCompanyRelationshipChanged
LeadUpdated
DealUpdated
ClientContactChanged
PortalMembershipChanged
MessageCreated
MeetingUpdated
FollowUpUpdated
TaskUpdated
NoteCreated
```

can invalidate relevant sections.

---

## Permission-safe caching

Cache should vary by:

```text
organizationMembershipId
contactId
authorization revision
contact revision
related source revisions
```

Never just `contactId`.

---

## Section-level caches

Useful because:

* profile changes slowly,
* Messages/Activity change frequently,
* Portal link rarely changes.

---

## N+1 protection

Avoid loading:

* every Message,
* every Lead,
* every Meeting,

individually for the initial 360 view.

Use:

* summary projections,
* batched queries,
* lazy pagination.

---

## Large section pagination

High-value Contacts can accumulate years of:

* messages,
* meetings,
* Leads,
* Notes.

Initial Contact 360 should not load all history.

---

## Merge handling

If Design 086 merged Contact C-old → C-new:

Contact 360 should:

* resolve old ID to canonical target,
* preserve merge lineage,
* prevent stale old record edits.

---

## Archived Contact handling

Archived Contact can remain historically viewable where policy allows.

Current editing/actions may be restricted.

---

## Partial failure model

Example:

```text
Contact core       ✓
Communication      ✓
Employment         ✓
Leads              ✓
Deals              ✕
Client             ✓
Portal link        ✓
Messages           ✕
Meetings           ✓
Tasks              ✓
Activity           ✓
```

Return the Contact 360 with Deals/Messages explicitly unavailable.

Do not return:

> Contact not found.

---

## Search integration

Design 079 indexes safe canonical Contact metadata.

Do not index the full Contact 360 composite containing:

* private Messages,
* Notes,
* Deal values,
* Portal account details.

---

## Audit

Profile/employment/communication changes continue their canonical Audit behavior.

Actions launched from Contact 360 are audited by their source domains.

Do not duplicate every source action as an extra Contact AuditEvent.

---

## Backend Requirement Matrix

| Requirement                                     | Status                 |
| ----------------------------------------------- | ---------------------- |
| Authenticated Team Workspace                    | **Critical**           |
| Canonical Contact ID from 086                   | **Critical**           |
| Contact360View as read projection               | **Critical**           |
| No second Contact entity                        | **Critical**           |
| Contact/ProfileProjection separation            | **Critical**           |
| Contact/CommunicationAddress separation         | **Critical**           |
| Multiple communication addresses                | **Critical**           |
| Historical communication preservation           | **Critical**           |
| Current/primary communication resolver          | **Critical**           |
| Contact/Company separation                      | **Critical**           |
| ContactCompanyRelationship reuse                | **Critical**           |
| Current Company/title as derived projection     | **Critical**           |
| Multiple/historical employment relationships    | **Critical**           |
| Contact/Lead separation                         | **Critical**           |
| Contact/Deal separation                         | **Critical**           |
| Explicit Contact↔Deal relation semantics        | **Critical**           |
| Contact/ClientRelationship separation           | **Critical**           |
| Contact/User separation                         | **Critical**           |
| Contact/PortalMembership separation             | **Critical**           |
| Safe Contact↔User relationship projection       | **Critical if linked** |
| No auth credentials/session data in Contact 360 | **Critical**           |
| Contact/Conversation separation                 | **Critical**           |
| Conversation participant authorization          | **Critical**           |
| Historical message recipient evidence           | **Critical**           |
| Contact/Meeting separation                      | **Critical**           |
| Meeting/FollowUp separation                     | **Critical**           |
| Contact/Task separation                         | **Critical**           |
| Contact/Note separation                         | **Critical**           |
| Note/Message separation                         | **Critical**           |
| Contact/Activity separation                     | **Critical**           |
| Activity/Audit separation                       | **Critical**           |
| Activity source references                      | **Critical**           |
| Historical interaction evidence preservation    | **Critical**           |
| Section-level source authorization              | **Critical**           |
| Field-level PII authorization                   | **Critical**           |
| Restricted/empty/unavailable distinction        | **Critical**           |
| Core Contact independent of section failure     | **Critical**           |
| Partial Contact 360 result contract             | **Critical**           |
| Source-specific mutation services               | **Critical**           |
| No generic Contact360 mega-PATCH                | **Critical**           |
| Optimistic concurrency                          | **Critical**           |
| Event-driven section invalidation               | **Required**           |
| Permission-safe caching                         | **Critical**           |
| Section-level caching                           | **Required at scale**  |
| N+1 prevention                                  | **Critical**           |
| Section pagination/lazy loading                 | **Required at scale**  |
| Merge redirect/resolution                       | **Critical**           |
| Archived Contact behavior                       | **Required**           |
| Safe Design 079 search integration              | **Critical**           |
| Audit without duplicate source events           | **Required**           |

---

# 8. Consolidation

Design 087 creates substantial risk of turning Contact 360 into another monolithic CRM database.

**Contact / Contact360View conflation**
Composite screen becomes canonical person record.

**Contact profile / CommunicationAddress conflation**
One current email overwrites full communication history.

**Primary email / Contact identity conflation**
Changing address changes person identity.

**Current address / historical message recipient conflation**
Old communications appear sent to new address.

**Contact / Company conflation**
Employer data becomes person identity.

**Current Company / full employment history conflation**
Career changes erase prior relationships.

**Current title / immutable Contact field conflation**
Old job title persists after employer move.

**One Contact / one Company assumption**
Board/advisory/concurrent roles disappear.

**Contact / Lead conflation**
Sales qualification becomes person status.

**Lead disqualified / Contact inactive conflation**
Person disappears because one campaign failed.

**Lead converted / Contact converted conflation**
Contact lifecycle inherits Sales state.

**Contact / Deal conflation**
Opportunity stage/value becomes person state.

**Deal lost / Contact lost conflation**
Commercial failure deletes relationship history.

**Deal value / Contact value conflation**
Person receives arbitrary monetary score as canonical field.

**Company Deal / Contact Deal conflation**
Every Company opportunity is attributed to every Contact at Company.

**Contact / ClientRelationship conflation**
Client commercial state becomes person identity.

**ClientContact / Portal User conflation**
Known business contact gains security account.

**Contact / User conflation**
CRM changes mutate authentication state.

**Contact/User link / Portal membership conflation**
Linking person creates access.

**Portal membership revoked / Contact inactive conflation**
Security action alters CRM person lifecycle.

**Contact / Conversation conflation**
Message history becomes nested mutable Contact data.

**Current email / conversation lookup conflation**
Historical Conversations disappear after email change.

**Conversation participant / Portal membership conflation**
External communication access becomes security membership.

**Message delivery / CommunicationAddress verification conflation**
One delivered message marks address permanently verified.

**Message read / Contact activity completion conflation**
Recipient state changes CRM lifecycle.

**Contact / Meeting conflation**
Scheduled interaction becomes Contact status.

**Meeting completed / FollowUp complete conflation**
Post-meeting obligations disappear.

**Contact / FollowUp conflation**
Next action becomes mutable Contact field.

**Contact / Task conflation**
Internal employee work becomes person status.

**Task overdue / Contact unhealthy conflation**
Work timing changes CRM identity/state.

**Contact / Note conflation**
Internal Notes become profile fields.

**Note / Message conflation**
Private CRM commentary can be sent externally/leaked.

**Note / Activity conflation**
Deleting timeline item deletes Note.

**Activity / source record conflation**
Timeline becomes business truth.

**Activity / Audit conflation**
Compliance/security data leaks through Contact 360.

**Last activity / arbitrary UI access conflation**
Viewing Contact changes "last contacted."

**Last contacted / any Activity conflation**
Internal edit is interpreted as sales communication.

**Next action / Contact field conflation**
Task/FollowUp state becomes duplicated.

**Contact access / every section access conflation**
Person visibility leaks Deals, Notes, Messages or Portal state.

**Contact read / PII read conflation**
Directory user receives private phone/email.

**Deal existence / Deal value permission conflation**
Commercially sensitive values leak.

**Contact page permission / Message permission conflation**
Any Contact viewer reads private Conversations.

**Contact page permission / Note permission conflation**
Private notes leak.

**Contact owner / security authority conflation**
Sales owner grants themselves more permissions.

**Edit Contact / edit User conflation**
CRM operation changes login account.

**Edit Contact / edit Company conflation**
Employment editor mutates Company profile.

**Edit Contact / edit Deal conflation**
Contact editor changes opportunity state.

**Add Note / edit Contact conflation**
Different permissions collapse.

**Empty Messages / messaging outage conflation**
Screen shows “No conversations” when service failed.

**No Portal access / Portal service outage conflation**
Security state is misstated.

**No Deals / Deal service unavailable conflation**
Commercial history appears empty.

**Restricted section / empty section conflation**
User learns or misinterprets hidden business state.

**One related-domain failure / Contact missing conflation**
Message outage makes person disappear.

**Contact360 mega-record**
Messages/Deals/Tasks become stale duplicated JSON.

**Contact360 mega-PATCH**
One endpoint bypasses domain permissions/lifecycles.

**Distributed mega-transaction**
Simple profile edit attempts to synchronize every CRM system.

**Cache keyed only by Contact**
High-privilege Contact 360 leaks to restricted users.

**Full 360 indexed in Universal Search**
Private Messages/Notes/Deal data leak through search.

**Current profile / historical Contract signer conflation**
Changing current name/title/email rewrites legal evidence.

**Contact merge / interaction evidence rewrite conflation**
Old communication appears to originate from surviving profile data.

**087/086 duplicate Contact backend**
Directory and detail drift.

**087/084–085 duplicate employment model**
Contact and Company views disagree about current employer.

**087/011 duplicate Lead state**
Contact page invents Sales lifecycle.

**087/016–017 duplicate Deal model**
Opportunity state copied into person profile.

**087/014 duplicate messaging backend**
Conversation history copied into Contact.

**087/015 duplicate Meeting/FollowUp backend**
Interaction state becomes Contact-specific duplicate records.

**087/034 duplicate Task backend**
Contact 360 owns work status.

No additional screen is required.

These are **cross-domain Contact composition, PII protection, employment-history integrity, interaction evidence, source authorization, historical snapshots, partial failure and mutation-boundary requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL CONTACT 360, PERSON RELATIONSHIP & CROSS-DOMAIN INTERACTION DETAIL ANCHOR**

**Domain directive:**
**Contact ≠ ContactProfileProjection ≠ CommunicationAddress ≠ ContactCompanyRelationship ≠ Company ≠ Lead ≠ Deal/Opportunity ≠ ClientRelationship ≠ User/PortalIdentity ≠ Message/Conversation ≠ Meeting/FollowUp ≠ Task ≠ Note ≠ ActivityEvent.**

**Identity directive:**
Design 086 remains the sole canonical Contact identity foundation. Design 087 is a read/composition workspace around that Contact ID and must never create a second mutable Contact/Person360 record.

**Projection directive:**
`Contact360View` is reconstructable from canonical domains. Materialization/caching may improve performance but cannot become independent person truth.

**Profile directive:**
Contact-owned profile information remains separate from communication methods, employment relationships, sales lifecycles, Portal identities and interaction records.

**Communication directive:**
CommunicationAddresses remain first-class historical/current contact methods. Design 087 may show a primary address, but it must preserve secondary/historical addresses and must never treat current email/phone as Contact identity.

**Historical-communication directive:**
current email, phone, name or employment changes never rewrite historical Message recipient/sender evidence, outreach delivery, Meeting evidence or other interaction snapshots.

**Employment directive:**
current Company/title are derived from canonical temporal ContactCompanyRelationships. Changing employer ends/starts relationships rather than creating a new Contact or overwriting employment history.

**Multi-relationship directive:**
architecture must permit multiple current/historical Company relationships even when the frozen 360 UI chooses one primary relationship for compact presentation.

**Company directive:**
Company remains its own canonical entity. Contact 360 can navigate/display Company context but never copies Company state into Contact truth.

**Lead directive:**
Leads remain Sales entities associated with Contact. Lead qualification, conversion, rejection and ownership never become Contact lifecycle.

**Deal directive:**
Deals/opportunities remain commercial entities. Contact involvement is represented through explicit Deal-contact/stakeholder relationship semantics, not inferred from Company membership alone.

**Client directive:**
ClientContact/ClientRelationship remains a separate commercial relationship. Ending or changing Client relationship never changes Contact identity.

**User directive:**
Contact stays distinct from platform User. Optional Contact↔User linkage is a governed relationship only and does not transfer profile fields, roles or security identity automatically.

**Portal directive:**
ClientPortalMembership, Portal roles, authentication identities and sessions remain governed by Designs 062 and 075–077. Contact 360 may show safe linkage status only and cannot grant/revoke Portal access by editing Contact.

**Messaging directive:**
Conversations/Messages remain canonical communication entities. Contact 360 composes permission-safe summaries/history but never owns Message content, delivery state or participant authorization.

**Meeting directive:**
Meetings remain scheduling entities. Contact participation never becomes Contact lifecycle.

**Follow-up directive:**
FollowUps remain action entities. “Next follow-up” can be derived for display but must not become an independent mutable Contact field.

**Task directive:**
Tasks remain Design 034 entities with typed Contact context. Completing/overduing a Task never changes Contact lifecycle.

**Note directive:**
Contact Notes remain contextual authored records with their own visibility/history. Internal Notes must never become external Messages or Contact profile fields.

**Activity directive:**
Contact Activity is a permission-aware cross-domain projection retaining canonical source references. Activity never replaces Messages, Meetings, Leads, Deals, Tasks, Notes or Audit.

**Audit directive:**
Design 039 remains canonical governance evidence. Actions launched from Contact 360 continue to be audited by their source domains without duplicate generic Contact360 Audit records.

**Historical-evidence directive:**
Contact profile/employment/communication changes and Contact merges never rewrite historical ContractSigner/ContractParty, Proposal recipient, Invoice, Message, Meeting, Approval or other issued/recorded evidence.

**Authorization directive:**
Contact shell access never implies access to all sections. Communication PII, Leads, Deals, Client context, Portal linkage, Messages, Notes, Tasks and Activity are independently server-authorized before composition.

**Field-security directive:**
PII and commercially sensitive fields use least-privilege projections. The backend must not send private email/phone, Deal values, Portal security data or private Notes merely to hide them in the frontend.

**Aggregate directive:**
interaction counts, open Lead counts, active Deal counts, “last contacted” and “next action” are governed projections with explicit semantics. `0`, `restricted`, `unknown`, and `unavailable` remain distinct.

**Partial-failure directive:**
Contact core identity remains renderable when any related subsystem fails. Design 087 returns per-section health/availability rather than a false empty state or global “Contact not found.”

**Mutation directive:**
all edits/actions invoke source-specific services. A generic `PATCH Contact360` capable of mutating Contact, Deal, Message, Task, User and Client state is prohibited.

**Transaction directive:**
Contact 360 is not a distributed transaction boundary. Each source domain commits independently and emits events; the composed view reconciles afterward.

**Concurrency directive:**
Contact profile, CommunicationAddress, ContactCompanyRelationship and related-domain changes retain their own revision/concurrency controls. One section should not overwrite unrelated newer state.

**Caching directive:**
Contact360 caches must be scoped by OrganizationMembership, authorization revision, Contact identity and relevant source revisions. Caching only by Contact ID is prohibited.

**Performance directive:**
use batched summary adapters, lazy/paginated interaction history, section-level caches and event-driven invalidation rather than loading the person's full lifetime CRM/communication history on every request.

**Merge directive:**
Contact merges resolve old IDs to canonical surviving identity for current navigation while preserving old-source lineage and historical interaction/signer evidence.

**Search directive:**
Design 079 may index safe canonical Contact/profile/business-context metadata, but the full permission-sensitive Contact360 composite must never become a general SearchIndexDocument.

**Future-reuse directive:**
later Lead, Deal, Meeting, follow-up, Client conversion and communication screens must continue referencing the same Contact ID and source domains rather than creating per-feature person copies.

**Overlap directive:**
Designs **011, 014–017, 021, 034, 039, 062, 075–079, 083–087 and later 089, 094–096, 106** must compose around one canonical Contact identity while preserving Company, Lead, Deal, Client, User, PortalMembership, Conversation, Meeting, FollowUp, Task, Note and Activity as distinct domains.

**Consolidation directive:**
**STANDARDIZE ONE CONTACT 360 COMPOSITION FOUNDATION — CANONICAL CONTACT IDENTITY + PERMISSION-SAFE CONTACT PROFILE + HISTORICAL/CURRENT COMMUNICATION ADDRESSES + TEMPORAL CONTACT-COMPANY RELATIONSHIPS + CANONICAL LEAD/DEAL/CLIENT REFERENCES + OPTIONAL EXPLICIT USER/PORTAL LINKAGE + SOURCE-OWNED CONVERSATIONS/MEETINGS/FOLLOWUPS/TASKS/NOTES + SOURCE-REFERENCED ACTIVITY + SECTION-LEVEL AUTHORIZATION + PARTIAL-FAILURE-AWARE COMPOSITION — AND NEVER ALLOW THE 360 VIEW, CURRENT EMAIL, CURRENT EMPLOYER, SALES STATE, PORTAL STATE, INTERACTION HISTORY OR ACTIVITY TIMELINE TO BECOME A SECOND MUTABLE CONTACT BACKEND.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **87 / 153** |
| **PASS**                                   |                         **87** |
| **STANDARDIZE decisions**                  |                         **85** |
| **Potential implementation-overlap flags** |                         **78** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**87 / 153 = 56.9% audited.**

### Canonical Contact 360 architecture after Design 087

```text
                         CONTACT
                  canonical CRM person
                            │
       ┌────────────────────┼────────────────────┐
       ↓                    ↓                    ↓
    Profile         CommunicationAddress   Employment Relations
                                                │
                                                ↓
                                             Company
                            │
          ┌─────────────────┼─────────────────────┐
          ↓                 ↓                     ↓
        Leads              Deals             ClientRelation
                                                  │
                                                  ↓
                                          optional User Link
                                                  │
                                                  ↓
                                           User / Portal
                            │
          ┌─────────────────┼────────────────────────────┐
          ↓                 ↓                            ↓
    Conversations     Meetings / FollowUps             Tasks
          │                                             │
          └─────────────────┬───────────────────────────┘
                            ↓
                         Activity
                      read projection
```

None of those branches becomes Contact identity.

The historical-interaction invariant is equally important:

```text
2026
Sarah Patel
VP Marketing · Acme
sarah@acme.com
      ↓
Messages / Meetings / Deals / Contract evidence recorded

2028
Sarah Patel
CMO · Globex
sarah@globex.com

Contact ID remains the same.

2026 evidence remains exactly historical.
It is NOT rewritten to:
“CMO at Globex / sarah@globex.com”
```

And partial composition remains mandatory:

```text
Contact core       ✓
Communication      ✓
Employment         ✓
Leads              ✓
Deals              ✕ unavailable
Client             ✓
Portal link        ✓
Messages           ✕ unavailable
Meetings           ✓
Tasks              ✓
Activity           ✓

RESULT:
Contact 360 still renders.

Deals and Messages are marked unavailable.

NOT:
“Contact not found.”
```

# Next Sequential Audit Target

## **Design 088 — Lead Lists / Segmentation Workspace**

The next audit should preserve the list/segment boundary:

> **Lead ≠ LeadList ≠ ListMembership ≠ SegmentDefinition ≠ SegmentEvaluation ≠ SavedView ≠ Filter ≠ CampaignAudience ≠ ProspectCandidate ≠ Contact/Company.**

It should reconcile Design **011's canonical Lead CRM** with Companies/Contacts and upcoming Lead detail while preserving:

* LeadList is a grouping/collection of canonical Leads, not a copied Lead database,
* static list membership ≠ dynamic segment membership,
* SegmentDefinition ≠ evaluated result snapshot,
* one Lead can belong to multiple lists/segments,
* removing a Lead from a list ≠ deleting or disqualifying the Lead,
* deleting/archiving a list ≠ deleting its Leads,
* segment filters must operate only over authorized Leads,
* dynamic segment membership must be evaluated from current canonical Lead/Company/Contact fields under versioned filter semantics,
* campaign audience/export snapshots must pin an exact evaluated membership rather than changing silently as a dynamic segment changes,
* ProspectCandidate still remains pre-CRM and must not enter Lead lists until canonical CRM admission,
* no duplicate Lead records inside lists or segmentation tables.

The sequence continues strictly with **Design 088 only next**, under the unchanged audit contract.
