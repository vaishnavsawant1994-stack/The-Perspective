Confirmed. The frozen identity is now locked:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 041 — Client Portal Dashboard

Design 041 should become the **canonical authenticated home/dashboard composition for the Client Portal**, rendered inside the separate `ClientPortalShell` established by Design 002.

Its most important architectural responsibility is not visual. It is the **security boundary between internal Team Workspace truth and the carefully authorized client-safe projection of that truth**.

The Client Dashboard may summarize Projects, approvals, actions required, deliverables, invoices/payments, Publications, Distribution, Reports, messages, and account activity—but it must never obtain those summaries by sending internal operational records to the browser and merely hiding sensitive fields.

| Audit field                      | Classification                                                                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                    | **041**                                                                                                                                                                                                     |
| **Canonical name**               | **Client Portal Dashboard**                                                                                                                                                                                 |
| **Product area**                 | Client Portal / Client Experience / Account Overview                                                                                                                                                        |
| **User surface**                 | **Client Portal**                                                                                                                                                                                           |
| **Screen class**                 | Client-Safe Dashboard / Account Overview Workspace                                                                                                                                                          |
| **Classification**               | **Unique Portal Anchor + Dashboard Family Variant**                                                                                                                                                         |
| **Primary purpose**              | Give an authenticated Client user a permission-safe overview of their active relationship, Projects, approvals, required actions, deliverables, billing, publishing/distribution progress and communication |
| **Primary business context**     | **ClientAccount / Client relationship context**                                                                                                                                                             |
| **Primary access context**       | **ClientPortalMembership**                                                                                                                                                                                  |
| **Primary read model**           | `ClientPortalDashboardView`                                                                                                                                                                                 |
| **Supporting canonical domains** | Project, ApprovalRequest, ClientRequest, Asset/FileVersion, Invoice, Payment, Publication, DistributionCampaign, Report, MessageThread, Activity                                                            |
| **Parent shell**                 | `ClientPortalShell` — Design 002                                                                                                                                                                            |
| **Dashboard reuse**              | Designs 003–007 dashboard primitives                                                                                                                                                                        |
| **Internal client source**       | Design 021 — Client 360                                                                                                                                                                                     |
| **Authorization dependency**     | Client Portal membership + client-scoped authorization                                                                                                                                                      |
| **Template family**              | `ClientPortalDashboardTemplate`                                                                                                                                                                             |
| **Composition**                  | `ClientPortalDashboardComposition`                                                                                                                                                                          |
| **Auth**                         | Required                                                                                                                                                                                                    |
| **Implementation priority**      | **Critical Client-Facing Foundation**                                                                                                                                                                       |
| **Reuse level**                  | **Very High across Client Portal screens**                                                                                                                                                                  |

The governing invariant is:

> **Internal Client record ≠ Client Portal Account ≠ Portal Membership ≠ Client-safe Dashboard Projection.**

---

# 1. Functional responsibility

Design 041 should answer the Client's immediate questions:

> **“What is currently happening with our work, what needs my attention, what is waiting for my approval, what can I access or download, what has gone live, what do I owe, and what should I do next?”**

The correct architecture is:

```text
INTERNAL CANONICAL DOMAINS
        │
        ├── Client
        ├── Projects
        ├── Approvals
        ├── Client Requests
        ├── Deliverables
        ├── Finance
        ├── Publishing
        ├── Distribution
        ├── Reports
        └── Messages
              ↓
        Client-safe Query Layer
              ↓
       Portal Authorization
              ↓
   ClientPortalDashboardView
              ↓
       DESIGN 041
```

Not:

```text
Internal Team API
      ↓
Send everything
      ↓
Hide sensitive cards in frontend
```

---

# 2. Design 002 vs Design 041

The distinction is fundamental.

### Design 002 — ClientShell

Persistent portal structure:

* portal navigation,
* Client identity/context,
* notifications,
* user menu,
* content container.

### Design 041 — Client Portal Dashboard

The dashboard content rendered inside that shell.

Correct:

```text
ClientPortalShell
      ↓
ClientPortalDashboardComposition
```

Design 041 must never recreate the entire portal shell.

---

# 3. Client 360 ≠ Client Portal Dashboard

Design 021 is internal.

Design 041 is external-facing.

### Internal Client 360 can contain

* account ownership,
* internal notes,
* Deal history,
* sales context,
* risk,
* collections context,
* staff assignments,
* internal activity.

### Client Dashboard should contain only authorized client-safe information.

Therefore:

> **Design 041 must never simply expose Design 021's read model.**

They share underlying canonical domains, not payloads.

---

# 4. Client ≠ Portal Membership

A company may be a Client without having an activated portal user.

Likewise several people can belong to one Client Portal organization/account.

Conceptually:

```text
Client / ClientAccount
        ↓
Portal Organization / Account
        ↓
ClientPortalMembership
        ↓
Portal User
```

Exact schema belongs to Phase 3D.

---

# 5. Company ≠ Client ≠ Portal Organization

The separation established earlier remains:

```text
Company
≠
Client relationship
≠
Portal access organization
```

A CRM Company becoming a Client should not automatically give every Company Contact access to the Portal.

Portal access must be explicit.

---

# 6. Contact ≠ Portal User

A Contact may exist in CRM but never receive Portal access.

Conversely, a Portal user should link to the appropriate canonical identity/contact context without requiring duplicated business identities.

Correct:

```text
Contact
    ↓ optional controlled link
PortalMembership
```

not:

```text
every Contact
=
Portal User
```

---

# 7. Portal membership is an authorization boundary

A Client Portal user should have access according to:

* Client/Portal organization,
* active membership,
* specific Portal Role/entitlement,
* Project/file/report visibility,
* account status.

Authentication alone is not enough.

---

# 8. Internal Role ≠ Client Portal Role

Design 037 established internal Team Workspace authorization.

Client Portal authorization must remain distinct.

Correct:

```text
Internal OrganizationMembership
+ Internal Role
≠
ClientPortalMembership
+ Portal permissions
```

Do not accidentally allow a Client Portal user into Team Workspace because both systems use a `roleId`.

---

# 9. Dashboard is an aggregation layer

Design 041 should not own:

* Project status,
* Approval status,
* Invoice balance,
* Publication state,
* Distribution performance.

It queries those canonical domains.

Conceptually:

```text
Project Service ───────┐
Approval Service ──────┤
Finance Service ───────┤
Publishing Service ────┤
Distribution Service ──┤
Report Service ────────┤
Messaging Service ─────┘
          ↓
ClientPortalDashboardQueryService
```

---

# 10. Dashboard count ≠ independent stored counter

If the visual shows:

```text
Active Projects: 3
Pending Approvals: 2
Actions Required: 4
Deliverables Ready: 6
```

those values must derive from canonical authorized data.

Do not maintain:

```text
client.activeProjectCount
client.pendingApprovalCount
```

as manually synchronized fields.

---

# 11. Internal total ≠ Client-visible total

Suppose internally the Client has:

```text
5 Projects
```

but Portal membership may access only:

```text
3 Projects
```

Then Design 041 should show:

> **3 Active Projects**

for that user.

Metrics are calculated **after authorization scope is applied**.

---

# 12. Portal dashboard counts can vary by user

Two users at the same Client can legitimately see different dashboard summaries.

Example:

```text
CEO Portal User:
all Client Projects

Marketing Director:
Marketing Projects only
```

Therefore Dashboard caching and aggregation must include membership/access scope.

---

# 13. Client Dashboard ≠ Executive Dashboard

Design 003 is internal organization-wide executive management.

Design 041 is client-facing account-specific overview.

They can reuse:

* KPI cards,
* progress indicators,
* activity components,
* charts where appropriate.

But their queries and security models are fundamentally different.

---

# 14. Reuse dashboard primitives, not internal compositions

Reusable:

`KpiCard`
`ProgressCard`
`StatusBadge`
`EntityMiniList`
`AttentionCard`
`ActivityFeed`

Not reusable wholesale:

```text
ExecutiveDashboardQuery
```

because it can contain organization-wide internal data.

---

# 15. Active Projects

The Dashboard may summarize authorized active Projects.

The source remains Design 023's canonical Project domain.

Client-safe Project summary can include:

* Project name,
* type,
* safe stage/progress,
* next Client action,
* due/relevant dates,
* allowed navigation.

---

# 16. Project status ≠ internal operational state automatically

Internal Project health may contain:

```text
AT_RISK
BLOCKED
Critical internal issue
```

The Client-facing representation needs an intentional policy.

Do not expose internal health/risk labels automatically.

A safe external status might instead come from a deliberate Client-visible progress projection.

---

# 17. Internal workflow stage ≠ Client-facing progress label

Example:

Internal:

```text
DESIGN_REVIEW_INTERNAL
```

Client-facing:

```text
Design in Progress
```

This is legitimate if the mapping is explicit.

Never rely on frontend string replacement of internal enums.

---

# 18. Client progress ≠ fake progress

The portal still cannot invent reassuring progress values.

If a Client-facing percentage exists, it must derive from a defined Project/readiness model.

No decorative:

```text
78% Complete
```

without a canonical formula.

---

# 19. Pending Approvals

Design 029 remains authoritative.

Client Dashboard can aggregate ApprovalRequests where:

```text
participant = current portal member
or
participant group = authorized Client approvers
```

depending on policy.

---

# 20. Approval count must be version-specific

If Design 041 says:

> **2 approvals pending**

those must correspond to actual current ApprovalRequests bound to exact subject versions.

The Dashboard must not infer pending approval merely because a Project is in an “approval” stage.

---

# 21. Client approval ≠ internal approval

Permanent boundary:

```text
Internal Approval
≠
Client Approval
```

Design 041 should expose only approval requests intended for that Client membership.

Internal approval queues never leak into the Portal.

---

# 22. Approval action must route to canonical Approval service

Clicking:

> Approve

should invoke Design 029's canonical decision command.

Not:

```text
PATCH dashboard
{ approvalDone: true }
```

---

# 23. Dashboard ≠ approval workspace

Design 041 can provide:

* count,
* urgent items,
* deep link,
* perhaps simple action if frozen.

Detailed review remains the relevant Client approval/detail surface.

The Dashboard stays an aggregation/navigation experience.

---

# 24. Actions Required

This metric needs one canonical definition.

Potential sources may include:

```text
Client ApprovalRequests
ClientRequests
Outstanding required uploads
Payment actions
Questionnaire responses
```

But the platform needs an explicit Client Action resolver.

---

# 25. Do not count internal Tasks as Client actions

Design 034 Task:

> Account manager must update headline.

should not appear to the Client.

Client-facing “Actions Required” must derive only from explicitly client-owned dependencies/actions.

---

# 26. ClientRequest ≠ Task

Already established in Project architecture:

```text
Internal Task
≠
Client Request / Dependency
```

Design 041 reinforces this distinction.

---

# 27. Next Client Action resolver

A canonical projection can conceptually aggregate:

```text
Pending Client Approvals
Pending Questionnaire
Requested Assets
Payment Requirement
Other explicit Client dependency
        ↓
ClientActionView
```

This is a read model—not one new mega-domain replacing source records.

---

# 28. Duplicate action prevention

If:

```text
ClientRequest:
Upload photos
```

also generates:

```text
Notification:
Upload photos
```

Design 041 should not count both as two actions.

Notification is delivery.

ClientRequest is the actionable source.

---

# 29. Deliverables Ready

This should come from canonical:

```text
Project deliverables
+
Asset/FileVersion
+
visibility/release state
```

not simply all Project files.

---

# 30. File uploaded ≠ Client deliverable

An employee uploading:

> raw interview notes.docx

does not make it a Client deliverable.

The source domain must explicitly classify/authorize the deliverable.

---

# 31. Deliverable ≠ latest Asset version

If a Client was provided:

```text
Final Magazine Proof v4
```

and internal work creates v5:

the Client Dashboard should not silently switch to v5 unless v5 has been intentionally released to them.

Exact-version references remain critical.

---

# 32. Deliverable readiness ≠ file existence

A file can exist while:

* still processing,
* unapproved,
* internal-only,
* superseded.

Therefore:

```text
Asset exists
≠
Client deliverable ready
```

---

# 33. Deliverable access uses Design 030

All downloadable Portal content should ultimately reference canonical:

```text
Asset
↓
FileVersion
↓
Client-visible usage/access
```

No Client Portal-specific file store.

---

# 34. Client-visible ≠ public

A Client deliverable may be visible in the authenticated Portal while remaining private on the internet.

Use short-lived/private authorized downloads where appropriate.

---

# 35. Preview ≠ download

Permissions may allow:

```text
Preview Report
```

but restrict:

```text
Download source document
```

where product policy requires.

Design 041 must respect Asset permissions.

---

# 36. Outstanding Balance

Finance data must come from canonical Invoice/Payment infrastructure.

Potential dashboard summary:

```text
Outstanding Balance
```

must use Finance's canonical definition.

Do not compute it independently from UI invoice rows.

---

# 37. Outstanding ≠ overdue

Permanent Finance distinction:

```text
Outstanding
≠
Overdue
```

A currently unpaid invoice may not yet be late.

If both appear, their definitions remain canonical.

---

# 38. Client financial scope

A Portal member may be authorized to see:

* all Client invoices,
* only Project-related invoices,
* no Finance information.

The Dashboard query must calculate finance cards after entitlement filtering.

---

# 39. Portal billing permission

Conceptual capabilities might later include:

```text
portal.finance.read
portal.invoice.download
portal.payment.perform
```

Exact names Phase 3D.

Being a Client Portal member does not automatically imply Finance access.

---

# 40. Client invoice ≠ internal Finance workspace

Portal users should receive a safe invoice projection:

* invoice number,
* date,
* amount/currency,
* due date,
* safe status,
* allowed artifact/payment actions.

They should not receive:

* internal reconciliation notes,
* Finance audit details,
* provider debugging state.

---

# 41. Publications

Design 031 remains authoritative.

Dashboard may summarize:

```text
Latest Publication
Scheduled
Published
Live
```

only where client-safe and relevant.

---

# 42. Scheduled internal release ≠ necessarily Client-visible

If the publication schedule is confidential/internal until approved:

Design 041 should not expose it automatically.

Client visibility needs an explicit policy.

---

# 43. Published ≠ verified live placement

Designs 031–032 established:

```text
Publication
≠
Distribution Placement
```

Client Dashboard should not combine them into one misleading “Live Everywhere” status.

---

# 44. Distribution summaries

If displayed, they should consume Design 032's verified/client-approved projections.

Potential safe data:

* campaign status,
* verified placements,
* verified/qualified metrics,
* report availability.

Internal failures/provider credentials never appear.

---

# 45. Estimated metrics remain estimated

If Design 041 contains a performance snapshot:

```text
Reach: 1.2M Estimated
```

the qualifier must survive.

The Portal is not permitted to convert estimated internal analytics into verified Client claims.

---

# 46. Reports

Design 033 remains the canonical Report domain.

The Dashboard can surface:

```text
Latest Report Ready
```

or:

```text
New Performance Report
```

for Reports whose exact versions are approved for Client access.

---

# 47. Draft Report ≠ Client-visible Report

Internal Report draft/review states should not leak.

Correct:

```text
Approved/final Client Report Version
      ↓
Client Dashboard
```

not:

```text
current internal Report draft
      ↓
Portal
```

---

# 48. Report version must be exact

A Dashboard link should point to:

```text
ReportVersion 4
```

or canonical current client-delivered version.

It must not ambiguously render “latest” and later change historical content.

---

# 49. Messages

If Design 041 surfaces message summaries, the source should be the Client communication/message domain.

Internal Unified Inbox Design 014 may share lower-level messaging infrastructure.

But Client conversations need safe thread projections.

---

# 50. Internal Inbox ≠ Client Portal messaging

Internal users may see:

* provider metadata,
* sales/outreach context,
* internal assignment,
* private notes.

Client users must see only their authorized conversation content.

---

# 51. Notification ≠ message

Portal Notifications and Portal Messages remain distinct.

A notification may say:

> New message received.

The MessageThread contains the actual conversation.

Do not duplicate thread content into notification truth.

---

# 52. Activity Feed

Design 041 can show a Client-facing activity feed.

But:

```text
Client Activity
≠
Internal Activity
≠
Audit Log
```

This distinction is critical.

---

# 53. Client-safe activity must be whitelisted

Possible visible events:

```text
Draft ready for review
Invoice issued
Payment received
Publication live
Report available
Client approval completed
```

Potentially hidden:

```text
Internal reassignment
Employee comment
Risk escalated
Provider retry
Role change
Internal failure
Margin updated
```

---

# 54. Never redact only after fetching

Dangerous:

```text
Backend returns internalActivity[]
Frontend filters category !== "internal"
```

Correct:

```text
ClientActivityQuery
→ selects only eligible client-safe events
```

---

# 55. Dashboard cache must be permission-safe

Potential cache identity must include:

```text
organization/client
portal membership
entitlements
data scope
```

Never cache a full Client dashboard and serve it to every Portal user regardless of membership differences.

---

# 56. Portal authorization must be server-side

Every Dashboard widget/query must enforce:

```text
authenticated portal actor
+
active portal membership
+
Client/Portal organization
+
resource entitlement
```

No security decisions based only on hidden sidebar items.

---

# 57. Client Portal session context

Canonical request context should know:

```text
Portal Actor
Portal Membership
Client/Portal Organization
Authorized Projects/scopes
Portal capabilities
```

This should be established centrally in ClientShell/session middleware/query context.

---

# 58. Portal membership status

Potential lifecycle distinctions:

```text
Invited
Active
Suspended/Disabled
Expired where applicable
```

Exact enum later.

The Dashboard should be accessible only for valid active membership according to policy.

---

# 59. Client offboarding/access revocation

If Client Portal access is removed:

existing sessions must stop receiving Portal data promptly.

This is similar to Design 037's internal permission revocation requirement.

---

# 60. Membership revocation ≠ Client deletion

Revoking one person's Portal access does not delete:

* Client,
* Projects,
* Reports,
* invoices,
* historical activity.

Access and business records remain separate.

---

# 61. Multiple Client users

A Client organization can have several portal members:

```text
CEO
Marketing Director
Finance Contact
Executive Assistant
```

They can have different privileges.

Design 041 cannot assume one Client = one login.

---

# 62. Portal Role ≠ job title

As with internal Roles:

```text
Finance Contact
```

may be a business descriptor.

Actual portal access must come from explicit permissions/role configuration.

---

# 63. Access to Project A ≠ Project B

Portal scope may be project-specific.

Example:

```text
Agency partner user
→ Project A only
```

Dashboard aggregation should only include Project A.

No cross-project leakage.

---

# 64. Direct deep-link security

If a Portal user manually opens a URL/record ID they cannot access:

server response must deny it.

Dashboard navigation is not the access control mechanism.

---

# 65. IDs must not imply authorization

Knowing:

```text
projectId = abc123
```

must never be enough to fetch it.

Every query performs client/member authorization.

---

# 66. Dashboard read model

A useful conceptual shape:

```text
ClientPortalDashboardView
├── Client/account summary
├── Current portal membership
├── active Project summaries
├── pending Client approvals
├── Client actions required
├── deliverables ready
├── Finance summary if permitted
├── recent Client-safe Publications
├── Distribution/report summaries
├── unread message/notification summaries
├── Client-safe activity
└── permission-aware CTAs
```

This is a composed read model.

It is **not** a new business entity.

---

# 67. Partial read-model composition

The Dashboard can compose services independently.

Example:

```text
Projects       ✓
Approvals      ✓
Finance        ✕
Deliverables   ✓
Reports        ✓
```

The Portal should remain useful.

Finance displays unavailable instead of destroying the whole Dashboard.

---

# 68. Partial failure must not leak internal diagnostics

Client-facing error:

> Billing information is temporarily unavailable.

Not:

```text
Stripe webhook reconciliation projection failed
```

Provider/internal infrastructure details remain internal.

---

# 69. Unknown ≠ zero

If Finance service fails:

do not show:

```text
Outstanding Balance
$0
```

That would be materially misleading.

Correct:

> Balance temporarily unavailable.

---

# 70. Unknown ≠ no pending approvals

Similarly, Approval service outage must not show:

> You're all caught up.

unless the query succeeded and genuinely returned no pending items.

---

# 71. Empty dashboard state

A legitimate newly activated Client account may have:

```text
No active Projects yet
```

This is different from a Project service failure.

Design 150 state patterns apply.

---

# 72. Dashboard attention hierarchy

Client attention should prioritize genuinely actionable items:

```text
Approvals requiring Client decision
Requested Client assets/information
Due payment where authorized
Ready deliverable
Upcoming important milestone
```

Internal staff problems should not appear as Client actions.

---

# 73. Main CTA must be derived from actual context

The dashboard should not have one hard-coded CTA.

Potential current primary action might derive from:

```text
Pending Client approval
↓ else
Required Client upload
↓ else
Payment due
↓ else
View active Project
```

Exact UX follows frozen design.

The architecture should support context-aware actions without inventing new workflow truth.

---

# 74. “All caught up” needs strong correctness

Only show this when all relevant actionable sources succeeded and returned no pending Client actions.

If one source is unavailable:

> Some account information could not be checked.

is safer.

---

# 75. Server-side aggregation

At scale, do not make the browser call 15 internal APIs and assemble the dashboard.

Prefer:

```text
ClientPortalDashboardQueryService
```

or equivalent BFF/query composition that:

* authenticates Portal actor,
* applies scope,
* invokes safe projections,
* returns one controlled response.

---

# 76. Internal service calls still enforce scope

A trusted server composition layer must not assume:

> It's server-side, therefore all data is safe.

Each projection or centralized policy must preserve the current Client membership scope.

---

# 77. Client-safe DTOs should be explicit

Avoid returning internal domain objects directly.

Prefer specific projection shapes such as:

```text
ClientProjectSummary
ClientApprovalSummary
ClientInvoiceSummary
ClientDeliverableSummary
```

with deliberate fields.

This substantially reduces accidental leakage.

---

# 78. Internal notes must never enter Client DTOs

Not even as:

```text
internalNotes: null
```

where avoidable.

Better:

> The Client DTO has no internalNotes field at all.

Schema separation is safer than frontend omission.

---

# 79. Portal write actions

Design 041 should remain primarily an overview/navigation surface.

If quick actions exist, they must route to canonical commands such as:

```text
decideApproval()
respondToClientRequest()
initiatePayment()
```

according to their source domains.

No generic:

```text
updateDashboard()
```

command.

---

# 80. Optimistic updates need caution

A Client clicking Approve may receive immediate feedback.

But the UI should only present final success after canonical Approval persistence succeeds.

Do not permanently update dashboard counts before server confirmation.

---

# 81. Idempotent client actions

High-value actions such as:

* approval,
* payment initiation,
* submission,

need idempotency/replay protection.

Double-clicking should not produce duplicate decisions/payments.

---

# 82. Client Portal audit

Material Client actions should generate canonical Design 039 AuditEvents where appropriate:

```text
Portal approval decided
Client file uploaded
Invoice payment initiated
Report downloaded
Portal access changed
```

Actor context must identify the Client Portal member.

---

# 83. Portal actor ≠ internal actor

Audit should preserve:

```text
Actor type:
CLIENT_PORTAL_MEMBER
```

or equivalent context.

Do not misattribute Client action to an internal Account Manager.

---

# 84. Audit event visibility

Client Portal users generally should not see the platform's security Audit Logs.

Design 039 remains an internal privileged surface.

Selected Client-safe activity can derive separately from canonical events/domain activity.

---

# 85. Relationship to Design 063

Later frozen design:

**Design 063 — Client Activity / Account History**

Expected architecture:

```text
Canonical Client-safe Activity
       │
       ├── Design 041
       │   small recent summary
       │
       └── Design 063
           deeper Client account history
```

One safe activity projection.

Different depth.

---

# 86. Relationship to Design 064

**Design 064 — Client Notifications Center**

Design 041 may show notification summaries/counts.

Design 064 owns the full notification experience.

No second notification model.

---

# 87. Relationship to Design 065–066

**065 — Client Media Projects / Media Center**
**066 — Client Media Project Detail**

Design 041 shows selected/current Project summaries.

Designs 065–066 provide deeper Client Project navigation/detail.

Same Project-safe projection infrastructure.

---

# 88. Relationship to Designs 067–069

Later Client Portal libraries:

* Questionnaires,
* Drafts,
* Designs/Proofs.

Design 041 may expose actionable/latest items.

Those screens own complete libraries.

One canonical source domain each.

---

# 89. Relationship to Designs 070–073

Later Client-specific details:

**070 Contract Detail & Digital Signing**
**071 Invoice / Payment Detail**
**072 Publishing / Live Links Detail**
**073 Distribution Detail**

Design 041 only summarizes them.

Never duplicate their detailed business logic on the dashboard.

---

# 90. Relationship to Design 074

**Client Message Thread Detail**

Design 041 may show unread message/last thread preview.

Design 074 handles conversation detail.

One client-safe communication service.

---

# 91. Relationship to Designs 075–077

Authentication surfaces:

**075 Client Sign In**
**076 Portal Activation / Accept Invite**
**077 Access Recovery**

These establish/recover Portal authentication.

Design 041 consumes the resulting authenticated Client Portal session.

It does not implement login itself.

---

# 92. Relationship to Design 060–062

Later:

**060 Client Organization / Company Settings**
**061 Client Notifications / Notification Preferences**
**062 Client Portal Users / Team Access**

These will administer client-side account configuration/access.

Design 041 reads current membership/account context but does not duplicate those settings/admin workflows.

---

# 93. Client Portal Dashboard family

Design 041 establishes a reusable portal-dashboard pattern:

```text
ClientPortalDashboardTemplate
├── Account context
├── KPI summaries
├── Attention required
├── Current Projects
├── Deliverables
├── Finance if allowed
├── Recent activity
└── Safe navigation
```

This remains separate from internal admin dashboards.

---

# 94. Reusable components

Likely reusable components include:

`ClientDashboardHeader`
`ClientAccountSummary`
`ClientKpiCard`
`ClientAttentionCard`
`ClientProjectCard`
`ClientApprovalCard`
`ClientActionRequiredCard`
`ClientDeliverableCard`
`ClientFinanceSummary`
`ClientPublicationSummary`
`ClientReportCard`
`ClientActivityFeed`
`PortalEmptyState`
`PortalRestrictedState`

Shared generic primitives may come from the platform Design System.

---

# 95. Client-specific visual semantics

Reusing low-level components does not mean exposing internal operational badges.

Example:

Internal:

```text
BLOCKED — awaiting provider retry
```

Client-safe:

```text
Distribution in progress
```

only if truthful and policy-approved.

Client language should be derived from an explicit presentation mapping.

---

# 96. Permissions architecture

Potential Phase 3D portal capabilities might conceptually include:

```text
portal.dashboard.read

portal.projects.read
portal.approvals.read
portal.approvals.decide

portal.deliverables.read
portal.deliverables.download

portal.finance.read
portal.invoice.download
portal.payment.perform

portal.reports.read
portal.reports.download

portal.messages.read
portal.messages.send
```

Exact names later.

Key principle:

> **Portal access is capability- and resource-scoped, not one universal `isClient=true`.**

---

# 97. Portal admin ≠ internal administrator

A Client company Portal administrator may manage their own Portal users in Design 062.

That does not grant:

* Team Workspace access,
* internal Client records,
* Role/Permission administration,
* global settings.

Permanent isolation is required.

---

# 98. Client user invitations

Design 062/076 will own invitation/activation detail.

Design 041 can display account context only after valid membership.

Pending invitees should not be included in active-user/dashboard permission calculations incorrectly.

---

# 99. Responsive — Desktop

Desktop should preserve the approved account-overview composition:

```text
Client Portal Header
↓
Account / Welcome Context
↓
Key Status Cards
↓
Actions Required
↓
Current Projects
↓
Deliverables / Approvals
↓
Finance / Reports / Publishing summaries
↓
Recent Client-safe Activity
```

The dashboard should prioritize clarity rather than internal operational density.

---

# 100. Responsive — Tablet

Following Design 152 principles adapted to Client Portal:

* KPI cards reflow,
* Project cards become two-column/single-column,
* action-required remains high priority,
* side information stacks,
* tables become compact lists,
* no hidden critical approval/payment action.

---

# 101. Responsive — Mobile

Following Design 151 principles:

```text
Client Account
↓
Actions Required
↓
Pending Approvals
↓
Current Projects
↓
Deliverables Ready
↓
Billing Summary if permitted
↓
Reports / Live Content
↓
Recent Activity
```

The Client should be able to understand account status within a short scroll.

---

# 102. Mobile action priority

High-value Client actions such as:

* Approve,
* Upload required file,
* Pay invoice,

must show enough context before execution.

No ambiguous icon-only action.

---

# 103. Mobile finance safety

A Payment CTA should clearly identify:

```text
Invoice
Amount
Currency
```

before sending the Client into a payment flow.

Never rely only on a generic:

> Pay Now

with uncertain invoice context.

---

# 104. Accessibility

Dashboard status cannot rely only on:

* green/red,
* icon shape,
* chart color.

Cards require semantic text such as:

```text
2 approvals require your action
```

Keyboard navigation and screen-reader order must follow importance.

---

# 105. Loading states

Design 041 inherits Design 150 but should avoid a long blocking spinner.

Widget-level loading can be appropriate when services compose independently.

Example:

```text
Projects        loading
Approvals       ready
Finance         loading
Activity        ready
```

---

# 106. Portal-specific states

Required conceptual states include:

```text
Dashboard Loading
Dashboard Ready

No Active Projects
No Pending Approvals
No Client Actions Required
No Deliverables Yet
No Reports Yet

Project Summary Available
Deliverable Ready

Finance Restricted
Finance Unavailable

Approval Service Unavailable
Project Service Unavailable

Membership Restricted
Membership Revoked
Account Suspended

Partial Data
Stale Performance Data
Permission Restricted
Partial Service Failure
```

These are not one persisted Dashboard status.

---

# 107. “Nothing needs your attention” correctness

This message should only appear if:

* all applicable action sources succeeded,
* none contain pending Client actions.

If Approval is unavailable:

the dashboard cannot safely claim nothing is pending.

---

# 108. Stale performance data

If Distribution/Analytics metrics are delayed:

show:

```text
Updated 8 hours ago
```

or equivalent freshness.

Do not imply live/current performance.

---

# 109. Safe error messages

Portal users should receive:

> Some project information is temporarily unavailable.

Internal staff may receive provider/service diagnostics elsewhere.

Do not expose:

* stack traces,
* integration identifiers,
* internal queue failures,
* employee names involved in errors.

---

# 110. Backend architecture

```text
Client Portal Dashboard UI
          ↓
ClientPortalSessionContext
          ↓
ClientPortalAuthorization
          ↓
ClientPortalDashboardQueryService
          │
          ├── Client-safe Project Query
          ├── Client Approval Query
          ├── Client Action Resolver
          ├── Deliverable Query
          ├── Client-safe Finance Query
          ├── Client Publication Query
          ├── Client Distribution Query
          ├── Client Report Query
          ├── Client Message/Notification Query
          └── Client Activity Query
                    ↓
          ClientPortalDashboardView
```

Canonical operational writes remain inside their source domains.

---

# 111. Backend requirements

| Requirement                              | Status                                      |
| ---------------------------------------- | ------------------------------------------- |
| Client Portal authentication             | **Critical**                                |
| Portal membership validation             | **Critical**                                |
| Client/account isolation                 | **Critical**                                |
| Portal-specific authorization            | **Critical**                                |
| Internal/Portal Role separation          | **Critical**                                |
| Project/resource-level scoping           | **Critical**                                |
| Client-safe DTO/projection layer         | **Critical**                                |
| Server-side dashboard aggregation        | **Critical**                                |
| Project integration                      | **Critical**                                |
| Approval integration                     | **Critical**                                |
| Client Action resolver                   | **Critical**                                |
| Deliverables + Asset/File integration    | **Critical**                                |
| Exact FileVersion access                 | **Critical**                                |
| Finance-safe projection                  | **Critical**                                |
| Invoice/payment permission separation    | **Critical**                                |
| Publication-safe projection              | **Required**                                |
| Distribution-safe projection             | **Required**                                |
| Metric provenance/freshness preservation | **Critical**                                |
| ReportVersion integration                | **Critical**                                |
| Messaging/notification summaries         | **Required**                                |
| Client-safe activity projection          | **Critical**                                |
| Permission-safe caching                  | **Critical**                                |
| Membership revocation handling           | **Critical**                                |
| Idempotent client actions                | **Critical**                                |
| Audit actor attribution                  | **Required/Critical for sensitive actions** |
| Partial service failure                  | **Critical**                                |
| Unknown/zero distinction                 | **Critical**                                |
| Design 002 ClientShell reuse             | **Critical**                                |

---

# 112. Main implementation risks

Design 041 exposes one of the most important security boundaries in the entire platform.

**Internal/Client projection conflation**
Design 021 Client 360 payload is reused directly in the Portal.

**Client/PortalMembership conflation**
Every CRM Contact gains Portal access.

**Internal Role/Portal Role conflation**
Client user accidentally receives Team Workspace authorization.

**Dashboard/source-of-truth conflation**
Dashboard stores duplicate Project/Approval/Finance status.

**Widget-security inconsistency**
Each dashboard card implements different authorization logic.

**Aggregate leakage**
Portal user sees totals from Projects they cannot access.

**Frontend-only redaction**
Internal notes/data reach browser and are hidden visually.

**Project health leakage**
Internal risks/blockers exposed without intentional Client policy.

**Internal/Client approval conflation**
Internal approval requests appear to Client.

**Task/ClientAction conflation**
Employee Tasks become Client obligations.

**Deliverable/file conflation**
Every Project Asset becomes downloadable.

**Latest-version bug**
Client sees internal newer file instead of released FileVersion.

**Client-visible/public conflation**
Private deliverable exposed via permanent public URL.

**Finance scope leakage**
Non-financial Portal user receives Client balances/invoices.

**Outstanding/overdue conflation**
Finance status shown inaccurately.

**Draft/final Report conflation**
Unapproved internal report becomes client-visible.

**Publication/Distribution conflation**
Canonical publication and promotional placements shown as one lifecycle.

**Verified/estimated metric conflation**
Estimated performance represented as factual Client results.

**Internal activity leakage**
Employee comments, retries, risk events reach Client activity.

**Notification/action double counting**
One obligation appears multiple times.

**Unknown/zero conflation**
Finance/service outage appears as zero balance/no actions.

**Permission-unsafe dashboard cache**
One Client user's broader dashboard is served to another.

**Portal admin/internal admin conflation**
Client Portal administrator receives internal administration capabilities.

**041/063–074 duplicate Client Portal services**
Later Client Portal screens create separate Project, file, Finance, reporting or activity backends.

None requires another visual design.

They require **strict Client-safe projection architecture**.

# Design 041 Audit Verdict

## **PASS — CANONICAL CLIENT PORTAL DASHBOARD & CLIENT-SAFE AGGREGATION ANCHOR**

**Shell directive:** Design 041 always renders within Design 002's canonical `ClientPortalShell`; it never recreates Portal navigation/authentication chrome.

**Identity directive:** **Client ≠ Portal Organization ≠ Contact ≠ Portal Membership ≠ Portal User.**

**Authorization directive:** every Dashboard query is scoped by authenticated Client Portal membership and resource-level entitlement before data is aggregated.

**Role directive:** Client Portal authorization remains completely separate from Design 037's internal Team Workspace Roles.

**Projection directive:** internal domain objects are never sent wholesale to the Client browser. Design 041 consumes explicit **client-safe DTOs/read projections**.

**Dashboard directive:** counts, progress and statuses are derived from canonical source domains; the Dashboard stores no competing business truth.

**Project directive:** Design 023 remains canonical Project truth while Design 041 exposes only intentional Client-safe progress/context.

**Approval directive:** only Client ApprovalRequests intended for the current Portal member/context appear; internal approvals remain private.

**Action directive:** Client “Actions Required” aggregate explicit Client obligations and never infer action from internal Tasks or Notifications.

**Asset directive:** Client deliverables reuse Design 030's Asset/FileVersion infrastructure and exact released versions; uploaded/internal files never become Client deliverables automatically.

**Finance directive:** invoice/balance summaries come from canonical Finance services, respect Portal finance permissions, and preserve outstanding/overdue/currency semantics.

**Publishing directive:** Design 031 remains canonical Publication truth; Design 041 receives only approved Client-facing release information.

**Distribution directive:** Client performance/placement summaries reuse Design 032's verified, provenance-aware data and never expose internal execution failures or credentials.

**Reporting directive:** only exact approved/final Client ReportVersions from Design 033 are surfaced; internal report drafts remain invisible.

**Activity directive:** Client activity is an explicit safe projection and remains separate from internal Activity and Design 039 Audit Logs.

**Failure directive:** zero, empty, restricted, unavailable and stale remain distinct. A downstream outage can never produce a false “all caught up,” `$0 balance`, or “no approvals” message.

**Caching directive:** dashboard caching must include Client organization, membership and entitlement scope.

**Audit directive:** sensitive Portal actions preserve the Client Portal actor identity in Design 039's canonical Audit infrastructure.

**Responsive directive:** desktop provides a comprehensive account overview; mobile prioritizes actions required → approvals → Projects → deliverables → billing/reporting without compressing internal-style tables.

**Overlap directive:** Designs **041 and 060–074** must ultimately consume one Client Portal identity, authorization, Project projection, Finance projection, Asset access, Report delivery, messaging and Client-safe activity foundation.

**Consolidation directive:** **STANDARDIZE ONE CLIENT-PORTAL-SAFE QUERY + MEMBERSHIP AUTHORIZATION + CLIENT ACTION + PROJECT SUMMARY + DELIVERABLE + FINANCE + REPORT + ACTIVITY PROJECTION INFRASTRUCTURE — DO NOT BUILD SEPARATE CLIENT DATA BACKENDS FOR THE DASHBOARD AND LATER PORTAL SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **41 / 153** |
| **PASS**                                   |                         **41** |
| **STANDARDIZE decisions**                  |                         **39** |
| **Potential implementation-overlap flags** |                         **32** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**41 / 153 = 26.8% audited.**

### Client Portal architecture after Design 041

```text
                     INTERNAL DOMAINS
                           │
       ┌───────────────────┼────────────────────┐
       ↓                   ↓                    ↓
   Projects             Finance            Publishing
   Approvals            Assets             Distribution
   Client Requests      Reports            Messages
       │                   │                    │
       └───────────────────┼────────────────────┘
                           ↓
                 CLIENT-SAFE PROJECTIONS
                           ↓
               Portal Membership + RBAC
                           ↓
                   CLIENT PORTAL SHELL
                        Design 002
                           ↓
                CLIENT PORTAL DASHBOARD
                        Design 041
```

And the shared platform foundations now include:

```text
029 → Approval
030 → Asset / File
031 → Publishing
032 → Distribution
033 → Reporting
034 → Tasks / Work
035 → Calendar / Scheduling
036 → People / Workforce
037 → Roles / Permissions
038 → Analytics / Metrics
039 → Audit / Accountability
040 → Organization Settings
041 → Client Portal Dashboard / Safe Projection Layer
```

# Next Sequential Audit Target

## **Design 042**

The exact frozen identity of **Design 042 has not yet been established in the verified sequence**, so we stop at the identity gate again.

We should **not infer Design 042** merely because Design 041 begins the Client Portal section, and we should not assume it is Projects, Approvals, Messages, Files, Profile, Contracts, Billing, or any other Client Portal surface.

Once its exact frozen identity is confirmed, we continue with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

