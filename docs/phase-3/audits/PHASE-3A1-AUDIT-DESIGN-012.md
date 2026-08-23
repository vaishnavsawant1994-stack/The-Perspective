Correct. I retrieved the exact frozen identity from the **The Perspective Media Group 153-design roadmap**, not from the other project sequences.

The verified order is:

**Design 011 — Leads / Lead CRM → Design 012 — Outreach Campaigns / Outreach Hub → Design 013 — Outreach Sequence Builder.**

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 012 — Outreach Campaigns / Outreach Hub

| Audit field                 | Classification                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **012**                                                                                                                                                           |
| **Canonical name**          | **Outreach Campaigns / Outreach Hub**                                                                                                                             |
| **Product area**            | Sales / Outreach / Engagement                                                                                                                                     |
| **User surface**            | Team Workspace                                                                                                                                                    |
| **Screen class**            | Campaign List + Operational Outreach Workspace                                                                                                                    |
| **Classification**          | **Unique Anchor — Campaign Operations Family**                                                                                                                    |
| **Primary purpose**         | Create, monitor, organize and operate outbound outreach campaigns that engage eligible CRM leads/contacts through controlled sequences and sending infrastructure |
| **Primary entity**          | **OutreachCampaign**                                                                                                                                              |
| **Supporting entities**     | Lead, Contact, Company, LeadList/Segment, OutreachSequence, SequenceStep, SendingAccount, Message, Reply, Enrollment, FollowUp, Meeting, User                     |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                   |
| **Template family**         | `CampaignWorkspaceTemplate`                                                                                                                                       |
| **Auth**                    | Required                                                                                                                                                          |
| **Permissions**             | Outreach + campaign ownership/team scope                                                                                                                          |
| **Implementation priority** | **Core / Critical**                                                                                                                                               |
| **Reuse level**             | Very High across campaign, publishing, distribution and automation-management patterns                                                                            |

## 1. Functional responsibility

Design 012 answers:

> **“What outreach campaigns exist, who are they targeting, which are currently running, how are they performing, and which require intervention?”**

This screen represents the operational layer between CRM Leads and actual outbound communication:

```text
Canonical CRM Lead
       ↓
Eligibility / targeting
       ↓
Outreach Campaign
       ↓
Sequence
       ↓
Enrollment
       ↓
Messages / Steps
       ↓
Reply / Meeting / Follow-up
       ↓
Deal progression
```

The most important boundary is:

> **A Lead existing in CRM does not automatically mean the Lead is enrolled in outreach.**

Campaign enrollment must be an explicit, policy-controlled business action.

---

# 2. Campaign vs Sequence

This distinction needs to be frozen now because **Design 013 is Outreach Sequence Builder**.

### Campaign

Defines the business execution context:

**who is targeted, which sequence is used, ownership, schedule, campaign status and performance.**

### Sequence

Defines:

**what happens after enrollment and in what order.**

Conceptually:

```text
OutreachCampaign
├── Audience / Target Segment
├── Sequence
├── Sending Configuration
├── Schedule
├── Owners
├── Enrollments
└── Performance
```

and separately:

```text
OutreachSequence
├── Step 1
├── Wait
├── Step 2
├── Wait
└── Step 3
```

Therefore:

> **Campaign ≠ Sequence.**

Design 012 operates campaigns.
Design 013 builds the sequence logic.

They should share infrastructure but remain separate approved screens.

---

# 3. Campaign vs Enrollment

Another important separation:

A Campaign is one parent business object.

An Enrollment represents one Lead/Contact participating in that campaign.

Conceptually:

```text
Campaign: Executive Leadership Outreach

Enrollment 001 → Sarah / Acme
Enrollment 002 → Daniel / Nova
Enrollment 003 → Michael / Vector
...
```

Each enrollment can independently have:

**current step**
**next step date**
**paused state**
**reply state**
**completion state**
**failure state**

The Campaign's status must not be used as the individual recipient's status.

---

# 4. Canonical Outreach Hub regions

Without redesigning the approved screen, its implementation should normalize into several reusable areas.

### Campaign Summary

Potential metrics:

**Total Campaigns**
**Active**
**Scheduled**
**Paused**
**Completed**
**Leads Enrolled**
**Messages Sent**
**Replies**
**Meetings Generated**

### Campaign List

Typical information:

**Campaign Name**
**Audience / Segment**
**Sequence**
**Owner**
**Status**
**Enrollment Count**
**Sent**
**Reply Rate**
**Positive Replies**
**Meetings**
**Last Activity**

### Filters

Examples:

**Status**
**Owner**
**Sequence**
**Target Segment**
**Date Range**
**Sending Account**
**Performance condition**

### Quick Actions

Potentially:

**Create Campaign**
**Duplicate Campaign**
**Pause**
**Resume**
**Open Results**
**View Replies**
**Open Sequence**

But all actions should call canonical services.

---

# 5. Canonical Campaign lifecycle

Campaign lifecycle should remain intentionally simple.

Conceptually:

```text
DRAFT
  ↓
READY
  ↓
SCHEDULED
  ↓
ACTIVE
  ↓
COMPLETED
```

with operational alternatives such as:

```text
PAUSED
CANCELLED
```

The exact frozen enum belongs to Phase 3D.

We should not create statuses like:

`ACTIVE_WITH_REPLIES_AND_TWO_FAILED_SENDS`

because those are derived conditions, not campaign lifecycle states.

---

# 6. Campaign lifecycle vs campaign health

Like the Operations Dashboard audit, lifecycle and health should remain separate.

Example:

```text
Campaign Status:
ACTIVE

Campaign Health:
NEEDS_ATTENTION
```

because:

* one sending account disconnected,
* bounce rate is high,
* several enrollments failed.

Another:

```text
Campaign Status:
ACTIVE

Campaign Health:
HEALTHY
```

This provides much cleaner domain logic.

---

# 7. Enrollment lifecycle

Each enrolled Lead/Contact requires its own state.

Conceptually, an enrollment may progress through states such as:

```text
ACTIVE
PAUSED
REPLIED
COMPLETED
STOPPED
FAILED
```

with its current sequence step stored separately.

Exact states should be finalized later.

The critical rule is:

> **Campaign status and Enrollment status must never be the same field.**

---

# 8. Communication eligibility gate

Before creating an enrollment, the backend must confirm the target is permitted to participate.

Conceptually:

```text
Lead selected
    ↓
Contact / Channel resolved
    ↓
Eligibility check
    ↓
Suppression check
    ↓
Verification / campaign policy
    ↓
Enroll
```

Potential reasons a target may be excluded:

**suppressed**
**unsubscribed**
**invalid/missing address**
**already enrolled**
**duplicate person**
**policy restriction**
**campaign-specific exclusion**

A Campaign must not bypass these controls because a user manually selected a Lead.

---

# 9. Enrollment idempotency

Repeated actions must not create accidental duplicate enrollments.

For example:

```text
Lead #123
   ↓
Enroll
   ↓
network timeout
   ↓
user retries
```

should normally result in:

> **one enrollment**

not:

> **two identical parallel sequences to the same person**

unless duplicate enrollment is explicitly supported under clearly separate campaign contexts.

This requires a canonical enrollment/idempotency strategy.

---

# 10. Lead List / Segment relationship

Design 012 may target Lead Lists or segments.

But the Campaign should preserve how its audience was determined.

Conceptually:

```text
Campaign
├── audienceSource
├── sourceList / segment
├── selection criteria snapshot
└── actual enrollments
```

This distinction matters because a dynamic Lead segment may change after the campaign begins.

The campaign's existing recipients should not unpredictably change unless that behavior is explicitly supported.

---

# 11. Audience snapshot requirement

Suppose a Campaign begins Monday with:

**500 qualified Leads.**

On Tuesday, the underlying Saved View now returns:

**540 Leads.**

Should the new 40 automatically enter the running campaign?

That cannot be left to frontend interpretation.

The campaign must have an explicit enrollment mode, conceptually such as:

**snapshot audience**
or
**continuous/dynamic enrollment**

if dynamic enrollment is later supported.

The default architecture should avoid silent audience drift.

---

# 12. Sequence versioning

This is one of the most important requirements.

Suppose Sequence Version 1 is:

```text
Email A
↓
Wait 3 days
↓
Email B
```

A manager edits the Sequence tomorrow to:

```text
Email A2
↓
Wait 5 days
↓
Email B2
```

What happens to Leads already running through the old campaign?

The platform must have explicit version semantics.

A strong conceptual architecture is:

```text
OutreachSequence
├── Version 1
├── Version 2
└── Version 3
```

Campaigns/enrollments reference the appropriate immutable or frozen version.

Otherwise historical behavior becomes impossible to reconstruct.

---

# 13. Campaign execution must not depend on the browser

Once a campaign is started:

```text
User closes laptop
```

outreach execution should continue through canonical backend scheduling/workers.

Correct architecture:

```text
Campaign
   ↓
Enrollment Scheduler
   ↓
Sequence Engine
   ↓
Job Queue
   ↓
Sending Service
```

Not:

```text
Browser tab → wait timer → send next email
```

This is a critical production requirement.

---

# 14. Canonical execution engine

Design 012 and Design 013 should share one outreach engine:

```text
Campaign
    ↓
Enrollment
    ↓
Sequence Version
    ↓
Current Step
    ↓
Eligibility Check
    ↓
Scheduler
    ↓
Sending Account
    ↓
Message
    ↓
Delivery Event / Reply
    ↓
Next-step decision
```

The UI manages the objects and monitors state; it does not execute timed communication logic itself.

---

# 15. Sending Account boundary

Campaigns can use Sending Accounts, but Design 012 should not own credential configuration.

Later **Design 092 — Sending Accounts / Email Connections** is responsible for that configuration.

Correct relationship:

```text
Sending Account Configuration
Design 092
       ↓
Canonical Sending Service
       ↓
Campaign
Design 012
```

Campaigns may select a permitted connection.

They should not contain duplicate OAuth/API credential management.

---

# 16. Message record requirement

An outbound message should be a canonical business record.

Conceptually:

```text
OutreachMessage
├── campaign
├── enrollment
├── sequenceStep
├── recipient
├── sendingAccount
├── renderedSubject
├── renderedBodySnapshot
├── scheduledAt
├── sentAt
├── providerMessageId
└── deliveryState
```

Why store rendered content?

Because templates may change later.

Historical communication needs to show exactly what was actually sent.

---

# 17. Template vs rendered message

Do not rely on the current template to represent historical communication.

Correct:

```text
Template
   ↓
Render at send time
   ↓
Message Snapshot
   ↓
Send
```

If the template changes tomorrow, yesterday's Message remains unchanged.

This becomes important for Design 091 — Outreach Templates Library.

---

# 18. Delivery state vs campaign state

A Message can individually have states such as:

**scheduled**
**sent**
**delivered**
**bounced**
**failed**

while the Campaign remains:

**ACTIVE**

Therefore:

```text
Campaign lifecycle
≠
Enrollment lifecycle
≠
Message delivery state
```

These must remain distinct.

---

# 19. Reply handling

When an inbound reply arrives:

```text
Provider
   ↓
Inbound Message
   ↓
Match Sending Account / Thread
   ↓
Match Contact
   ↓
Match Enrollment / Campaign
   ↓
Reply Classification / Queue
```

The result later feeds:

**Design 093 — Reply Queue / Outreach Response Review**

Design 012 can show aggregate reply counts, but should not duplicate the complete reply-management workspace.

---

# 20. Stop-on-reply behavior

A crucial outreach rule:

> If a recipient replies, scheduled follow-up messages often need to stop automatically.

This should be controlled by canonical Sequence/Campaign policy, not by UI assumptions.

Conceptually:

```text
Reply detected
   ↓
Enrollment update
   ↓
Pending automated steps cancelled/paused
```

The same principle applies to certain other terminal events where configured.

---

# 21. Meeting relationship

If outreach results in a Meeting:

```text
Campaign
   ↓
Enrollment
   ↓
Reply
   ↓
Meeting
```

the relationship should remain traceable for attribution.

That enables reporting such as:

**Campaign → Meetings Generated → Deals → Revenue**

without duplicating Meeting records.

---

# 22. Campaign attribution

Design 012 must preserve enough data for downstream metrics such as:

**reply rate**
**positive reply rate**
**meeting conversion rate**
**deal conversion**
**revenue attribution**

But metric definitions must be centralized.

For example:

```text
Reply Rate =
Unique responding enrollments
÷
eligible delivered recipients
```

may be different from:

```text
Replies
÷
messages sent
```

The exact formula will be frozen later.

The UI must not invent its own definition.

---

# 23. Suppression and unsubscribe

Outreach must integrate with canonical suppression.

Conceptually:

```text
Unsubscribe
    ↓
Suppression Record
    ↓
Eligibility Service
    ↓
All future campaign checks
```

This should not merely set:

```text
campaignEnrollment = paused
```

because the communication preference can affect future campaigns too.

Suppression should be a broader canonical communication rule.

---

# 24. Bounce handling

A bounce is a Message/channel event.

Potential downstream implications:

```text
Hard Bounce
     ↓
Channel invalidity / suppression review

Soft Bounce
     ↓
Retry policy / provider logic
```

Design 012 may surface campaign-level bounce metrics and high-bounce warnings.

Detailed handling belongs to the canonical sending infrastructure.

---

# 25. Sending-rate / provider limits

The Campaign must not blindly execute:

> send 50,000 messages immediately

if provider/account limits prohibit it.

The scheduler needs to respect:

**sending windows**
**rate limits**
**daily limits**
**account health**
**provider limits**

Potentially:

```text
Campaign demand
    ↓
Scheduler
    ↓
Account capacity
    ↓
Rate-controlled jobs
```

The page can show expected campaign execution but does not implement throttling itself.

---

# 26. Time-zone architecture

Scheduled outreach needs explicit time-zone semantics.

Potential choices can include:

**campaign owner's timezone**
**workspace timezone**
**recipient-local timezone**

depending on final product scope.

What cannot happen is ambiguous scheduling.

A setting such as:

> Send at 9:00 AM

must eventually identify *whose* 9:00 AM.

That belongs in Campaign/Sequence configuration and backend scheduling.

---

# 27. Reusable component mapping

Shared primitives:

`PageHeader`
`KpiCard`
`DataTable`
`FilterBar`
`SearchInput`
`StatusBadge`
`ProgressBar`
`Avatar`
`DropdownMenu`
`BulkActionBar`
`Pagination`
`EmptyState`
`LoadingState`
`ErrorState`

Campaign-specific composites:

`CampaignStatusBadge`
`CampaignHealthIndicator`
`CampaignPerformanceRow`
`AudienceSummary`
`EnrollmentSummary`
`SequenceReference`
`SendingAccountIndicator`
`ReplyMetric`
`MeetingMetric`
`CampaignActionMenu`

The implementation hierarchy becomes:

```text
Design Tokens
     ↓
List / Dashboard primitives
     ↓
Campaign Components
     ↓
CampaignWorkspaceTemplate
     ↓
Design 012
```

---

# 28. List-workspace reuse

Design 012 visually shares important infrastructure with Design 011:

**search**
**filters**
**saved presentation state**
**tables**
**bulk actions**
**pagination**

Therefore we should reuse the canonical enterprise list foundation established by Design 011.

Conceptually:

```text
ListWorkspaceBase
├── Lead CRM configuration
└── Outreach Campaign configuration
```

But Design 012 is **not a CRM Lead list**.

Its entity, actions and domain logic are different.

### Consolidation decision

**REUSE LIST INFRASTRUCTURE — KEEP DOMAIN WORKSPACE SEPARATE.**

---

# 29. Permission architecture

Potential permission dimensions later include:

```text
campaign.read
campaign.create
campaign.edit
campaign.launch
campaign.pause
campaign.resume
campaign.cancel
campaign.enroll
campaign.remove_enrollment
campaign.export
```

Sequence permissions should remain separate:

```text
sequence.read
sequence.create
sequence.edit
sequence.publish
```

Exact names belong to Phase 3D.

Important separation:

```text
EDIT CAMPAIGN
≠
LAUNCH CAMPAIGN
```

A user may be allowed to prepare a campaign but not authorize live outbound sends.

---

# 30. Launch approval boundary

Because launching outreach has external consequences, organizations may require an approval capability.

The architecture should not make such controls impossible.

Conceptually:

```text
Campaign DRAFT
    ↓
Configuration complete
    ↓
READY
    ↓
Authorized launch
    ↓
ACTIVE / SCHEDULED
```

Whether formal approval is mandatory is a business-policy decision later.

But **launch must always be authorization-controlled**.

---

# 31. Pause vs Cancel

These are materially different.

### Pause

Campaign may continue later.

Pending eligible work is retained.

### Cancel

Campaign is intentionally terminated.

Therefore:

```text
PAUSED ≠ CANCELLED
```

The backend should define exactly what happens to queued jobs for each action.

---

# 32. Concurrency

Two operators might modify the same Campaign.

Example:

```text
User A edits audience
User B launches campaign
```

The platform must avoid starting with partially stale configuration.

Version/concurrency checks are therefore required around significant campaign mutations and launch.

---

# 33. Campaign immutability after launch

Not all campaign fields should necessarily remain freely editable after live execution begins.

Changes to:

**audience**
**sequence version**
**sending account**
**schedule**

can materially change ongoing behavior.

The backend needs explicit rules about:

* editable fields while Active,
* which changes affect new enrollments only,
* which require pause,
* which are prohibited.

This cannot be left to frontend form disabling alone.

---

# 34. Bulk enrollment architecture

Enrolling thousands of Leads should use backend operations.

Correct:

```text
Audience
   ↓
Enrollment Job
   ↓
Eligibility checks
   ↓
Deduplication
   ↓
Create enrollments
   ↓
Result summary
```

not:

```text
browser loop × 10,000
```

Partial result example:

```text
5,000 selected

4,386 enrolled
  294 suppressed
  172 duplicates
   98 invalid contact details
   50 failed
```

The successful 4,386 should remain valid.

---

# 35. Relationship to Design 091 — Outreach Templates

Design 091 owns reusable message templates.

Design 013 can reference those templates when constructing Sequence steps.

Design 012 references the resulting Sequence.

Correct hierarchy:

```text
Template
Design 091
   ↓
Sequence
Design 013
   ↓
Campaign
Design 012
   ↓
Rendered Messages
```

There should not be three independent content/template systems.

---

# 36. Relationship to Design 093 — Reply Queue

Design 012 shows:

**Replies: 126**

Design 093 handles:

**which replies need review, what they mean, assignment and response actions.**

Therefore:

```text
Design 012
Campaign-level reply summary
        ↓
Design 093
Canonical reply operations
```

Do not merge them.

---

# 37. Relationship to Sales Dashboard

Design 004 may show:

**Outreach activity**
**reply rate**
**meetings generated**

But the flow should be:

```text
Design 004
Sales summary
    ↓
Design 012
Outreach campaigns
    ↓
Campaign / Reply / Meeting records
```

The same canonical metric definitions must power both.

---

# 38. Relationship to Lead CRM

Design 011 can initiate:

**Enroll in Campaign**

But Design 012 owns the campaign execution context.

The CRM should not implement its own outreach sequence logic.

Similarly, Campaign should not maintain duplicated Contact/Lead identity data.

It references canonical CRM entities.

---

# 39. Relationship to Automation Monitor

Campaign execution may use job/automation infrastructure, but it is not the same product abstraction as general platform Automation.

Later:

**Design 141 — Automation / Workflow Runs Monitor**

can observe relevant system runs if appropriate.

But users should not need to manipulate generic automation internals simply to operate an outreach campaign.

---

# 40. Responsive contract

### Desktop

Preserve a productivity-oriented campaign workspace:

**summary metrics → tabs/filters → campaign table → performance → actions**

### Tablet — Design 152

Adapt with:

* 2-column KPI layout,
* reduced campaign columns,
* filter drawer,
* touch-friendly campaign menus,
* detail overlay where appropriate.

### Mobile — Design 151

Campaigns should primarily become cards showing:

**Campaign Name**
**Status / Health**
**Audience**
**Sent**
**Reply Rate**
**Meetings**
**Next Scheduled Activity**

Primary actions:

**Open**
**Pause/Resume where authorized**
**More**

A large desktop performance table should not simply be compressed.

---

# 41. State coverage

Design 012 reuses Design 150 and requires outreach-specific states:

**No Campaigns Yet**
**Draft Campaign**
**Audience Empty**
**Sequence Missing**
**Sending Account Missing**
**Campaign Ready**
**Scheduled**
**Running**
**Paused**
**Completed**
**Cancelled**
**Partial Enrollment Failure**
**Sending Account Disconnected**
**Provider Rate Limited**
**Campaign Needs Attention**
**Permission Restricted**
**Network/API Failure**

Configuration problems must differ from execution failures.

For example:

> **No Sending Account selected**

is not a provider outage.

---

# 42. Partial service failure

Suppose a running campaign has:

```text
Campaign data      ✓
Enrollment data    ✓
Replies            ✓
Sending provider   ✕ temporarily unavailable
```

The screen should preserve available history and clearly indicate that live sending information is degraded.

It must not display:

**0 messages sent**

if the true state is:

**sending status currently unavailable**.

---

# 43. Backend architecture

Recommended conceptual architecture:

```text
Outreach Hub UI
      ↓
Campaign Query / Command Services
      ↓
Tenant + Permission Scope
      ↓
Campaign Domain
      │
      ├── Audience
      ├── Enrollment
      ├── Sequence Version
      ├── Sending Configuration
      └── Campaign Lifecycle
      ↓
Outreach Execution Engine
      ↓
Scheduler / Queue
      ↓
Sending Service
      ↓
Provider Adapters
      ↓
Delivery / Reply Events
```

---

# 44. Backend requirements

| Requirement                     | Status                    |
| ------------------------------- | ------------------------- |
| Authentication                  | **Required**              |
| Tenant isolation                | **Critical**              |
| Outreach RBAC                   | **Critical**              |
| Campaign domain service         | **Critical**              |
| Enrollment entity               | **Critical**              |
| Audience eligibility            | **Critical**              |
| Suppression integration         | **Critical**              |
| Sequence versioning             | **Critical**              |
| Background scheduling           | **Critical**              |
| Idempotent enrollment           | **Critical**              |
| Sending-provider abstraction    | **Critical**              |
| Rate-limit handling             | **Required**              |
| Sending-window/timezone support | **Required architecture** |
| Message snapshots               | **Critical**              |
| Reply correlation               | **Critical**              |
| Bulk enrollment service         | **Required**              |
| Concurrency protection          | **Required**              |
| Audit/activity history          | **Required**              |
| Server-side metrics             | **Required**              |

---

# 45. Audit / activity history

Important campaign events should include:

**Campaign created**
**Campaign configured**
**Audience changed**
**Sequence assigned**
**Campaign scheduled**
**Campaign launched**
**Campaign paused**
**Campaign resumed**
**Campaign cancelled**
**Bulk enrollment performed**
**Sending account changed**
**Sequence version changed where allowed**
**Provider failure occurred**

Individual communication events belong to Message/Enrollment activity rather than bloating the Campaign audit log with every low-level operation.

---

# 46. Canonical metric contract

The following terms need one platform definition:

**Enrolled**
**Sent**
**Delivered**
**Bounced**
**Replied**
**Positive Reply**
**Reply Rate**
**Positive Reply Rate**
**Meeting Booked**
**Meeting Conversion Rate**
**Completed Enrollment**

Those definitions must be shared across:

**Design 004 Sales Dashboard**
**Design 012 Outreach Hub**
**Design 090 Campaign Detail**
**Design 093 Reply Queue**
**Analytics**
**Reports**

---

# 47. Main implementation risks

The audit flags several critical risks:

**Campaign/Sequence conflation**
Treating the campaign and its execution definition as one object.

**Campaign/Enrollment conflation**
One recipient's state changing the parent Campaign status.

**Browser-owned sequencing**
Timed outreach depending on an open browser.

**Duplicate enrollment**
Retries sending multiple sequences to the same target.

**Audience drift**
Dynamic source lists silently modifying live Campaign recipients.

**Sequence mutation**
Editing a live Sequence changing historical/pending behavior unpredictably.

**Suppression bypass**
CRM presence incorrectly treated as communication permission.

**Template-history loss**
Historical messages relying on current editable template content.

**Sending-provider coupling**
Campaign components containing provider-specific logic.

**Permission weakness**
Anyone who can edit a Campaign automatically being able to launch it.

**Metric drift**
Different screens defining “reply rate” differently.

None require another design.

They require domain and execution architecture.

# Design 012 Audit Verdict

## **PASS — CAMPAIGN OPERATIONS ANCHOR**

**Template directive:** Design 012 establishes the reusable `CampaignWorkspaceTemplate` and should reuse the enterprise list/table infrastructure established by Design 011.

**Domain directive:** **Campaign ≠ Sequence ≠ Enrollment ≠ Message.**

**Execution directive:** Campaign timing and sequence execution operate entirely through canonical backend schedulers/jobs.

**Audience directive:** Enrollment requires eligibility, suppression and duplicate checks.

**Versioning directive:** Running Campaigns reference controlled Sequence versions so historical execution remains reproducible.

**Message directive:** Store the rendered content actually sent rather than relying only on mutable templates.

**Permission directive:** Viewing, editing, enrolling, launching, pausing, cancelling and exporting require independently enforceable permissions.

**Integration directive:** Sending account credentials and provider connectivity remain owned by the canonical integration/sending system.

**Reliability directive:** Enrollment and send workflows require idempotency, rate-limit handling and partial-failure behavior.

**Consolidation directive:** **STANDARDIZE LIST INFRASTRUCTURE WITH DESIGN 011 AND OUTREACH EXECUTION INFRASTRUCTURE WITH DESIGNS 013, 090–093; DO NOT MERGE THEIR APPROVED SCREENS.**

# Phase 3A.1 — Running Audit

| Result                                     |                           Count |
| ------------------------------------------ | ------------------------------: |
| **Audited**                                |                    **12 / 153** |
| **PASS**                                   |                          **12** |
| **STANDARDIZE decisions**                  |                          **10** |
| **Potential implementation-overlap flags** |                           **3** |
| **MERGE screen candidates**                | **0 pending later comparisons** |
| **FIX BEFORE CODE**                        |                           **0** |
| **New designs**                            |                           **0** |

### Reusable implementation architecture so far

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
└── Campaign Operations Family
    └── 012 Outreach Campaigns / Outreach Hub
```

And the canonical business flow now extends to:

```text
DISCOVER
008 Lead Finder
   ↓
EXTRACT
009 Data Extraction
   ↓
ENRICH
010 Contact / Data Enrichment
   ↓
CRM
011 Leads / Lead CRM
   ↓
TARGET / ENROLL
012 Outreach Campaigns
   ↓
SEQUENCE EXECUTION
013 Outreach Sequence Builder + execution engine
   ↓
REPLY / MEETING / FOLLOW-UP
   ↓
DEAL
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 013: Outreach Sequence Builder Audit**

The frozen next identity is **Design 013 — Outreach Sequence Builder**.

This next audit is especially important because it must define the reusable **step/condition/wait execution model, sequence versioning, template references, safe editing of live sequences, stopping conditions and scheduler handoff** without turning the UI itself into the execution engine.

We continue with exactly the same contract and with **no redesign, no extra page and no sequence changes.**

