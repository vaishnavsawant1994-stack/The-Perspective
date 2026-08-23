Confirmed. The frozen identities **042–077 are now locked** for the sequential Phase 3A.1 audit. The two `← NEXT` markers beside Designs 057 and 064 do **not** change our current sequence—we continue strictly from **Design 042** and will reach them in order.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 042 — My Projects

Design 042 should become the **canonical Client Portal project-list / project-discovery workspace**.

Its job is to let the current authenticated Client Portal member understand **which Projects they are authorized to access, what state each Project is in, what needs their attention, what is coming next, and where to continue into Project Detail**—without exposing the internal Team Workspace's Project 360, internal workflow machinery, risks, staff notes, or unauthorized Projects.

| Audit field                   | Classification                                                                                                                                     |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                 | **042**                                                                                                                                            |
| **Canonical name**            | **My Projects**                                                                                                                                    |
| **Product area**              | Client Portal / Projects / Client Delivery                                                                                                         |
| **User surface**              | **Client Portal**                                                                                                                                  |
| **Screen class**              | Client-Safe Project Library / Project List Workspace                                                                                               |
| **Classification**            | **Portal List Variant — Canonical Client Project Discovery Anchor**                                                                                |
| **Primary purpose**           | List, search, filter and navigate every Project the current Client Portal membership is authorized to access                                       |
| **Primary canonical entity**  | **Project** — Design 023                                                                                                                           |
| **Primary client projection** | `ClientProjectSummary`                                                                                                                             |
| **Supporting entities**       | Client, ClientPortalMembership, ProjectMembership/PortalProjectAccess, ClientRequest, ApprovalRequest, Milestone, Deliverable, AccountManager/User |
| **Parent shell**              | `ClientPortalShell` — Design 002                                                                                                                   |
| **Upstream dashboard**        | Design 041 — Client Portal Dashboard                                                                                                               |
| **Next-detail consumer**      | Design 043 — Client Project Detail                                                                                                                 |
| **Timeline consumer**         | Design 044 — Project Timeline / Progress                                                                                                           |
| **Template family**           | `ClientPortalListWorkspaceTemplate`                                                                                                                |
| **Composition**               | `ClientProjectsComposition`                                                                                                                        |
| **Auth**                      | Required                                                                                                                                           |
| **Authorization**             | Client membership + Project/resource scope                                                                                                         |
| **Implementation priority**   | **Core / Critical Client Portal**                                                                                                                  |
| **Reuse level**               | **Very High**                                                                                                                                      |

The governing invariant is:

> **Project ≠ Client-safe Project Summary ≠ Portal Project Access ≠ Client-visible Progress.**

---

# 1. Functional responsibility

Design 042 should answer:

> **“Which Projects can I access, which are active, which need something from me, what is coming next, which are complete, and where do I open each Project?”**

Canonical flow:

```text
Canonical Project Domain
Design 023
      ↓
Client / Portal Access Rules
      ↓
Client-safe Project Projection
      ↓
Design 042 — My Projects
      │
      ├── Active
      ├── Awaiting Your Action
      ├── Upcoming
      └── Completed
      ↓
Design 043 — Client Project Detail
```

Design 042 is therefore a **query/navigation workspace**.

It is not another Project-management engine.

---

# 2. Design 023 vs Design 042

### Design 023 — Project 360

Internal operational truth.

Can include:

* internal workflow stages,
* Tasks,
* staffing,
* blockers,
* risks,
* internal comments,
* financial/internal operational data,
* production details,
* approvals,
* dependencies.

### Design 042 — My Projects

External Client-safe Project library.

It should expose only intentionally authorized Project information.

Correct:

```text
Project
   ↓
ClientProjectProjectionService
   ↓
ClientProjectSummary
```

Incorrect:

```text
Project360View
   ↓
remove a few fields in React
   ↓
Client Portal
```

---

# 3. Project remains canonical

Do **not** create:

```text
ClientProject
```

as a second business Project record simply because the Client needs another representation.

Correct:

```text
Project
├── internal views
└── client-safe projections
```

One Project identity.

Different authorized views.

---

# 4. Client Project access must be explicit

A Client relationship alone should not necessarily mean:

> Every Portal member can see every Project.

The system may require:

```text
ClientPortalMembership
       +
Project access / entitlement
       ↓
visible Project set
```

Exact access model belongs to Phase 3D.

---

# 5. Same Client ≠ same Project visibility

Example:

```text
Client: TechNova
```

Portal users:

```text
CEO
→ all Projects

Marketing Director
→ Magazine + Video Projects

Finance Contact
→ billing-oriented access only
```

Their My Projects results may differ legitimately.

---

# 6. Dashboard count and My Projects must agree

Design 041 may show:

> Active Projects: 3

Opening Design 042's Active view should return the corresponding authorized set under the same definition/scope.

Avoid:

```text
Dashboard = activeProjectCount formula A
My Projects = Project status filter formula B
```

Canonical definitions must be shared.

---

# 7. “My Projects” ≠ ownership

The label **My Projects** means:

> Projects accessible to this Client Portal member.

It does not necessarily mean:

```text
project.ownerId = portalUserId
```

Portal users are generally external participants, not internal Project owners.

---

# 8. Internal Project Owner ≠ Client relationship owner

A Project can have:

```text
Internal Project Owner
Account Manager
Client Contact(s)
Portal Members
```

All are different relationships.

Design 042 may display an Account Manager/contact where approved, but must not collapse them.

---

# 9. Project category/type

Cards may show Project type such as:

* Personal Magazine,
* Podcast,
* Video,
* Event,
* other supported media product.

The type should come from canonical Project/product relationships.

Do not derive domain type from Project title text.

---

# 10. Active / Awaiting Action / Upcoming / Completed

These are best treated as **client-facing query groups/views**, not four independent Project statuses or tables.

```text
Authorized Projects
      ↓
Client-safe classification
      ├── Active
      ├── Awaiting Client Action
      ├── Upcoming
      └── Completed
```

One Project can potentially qualify for more than one UI concern depending on frozen behavior.

Example:

```text
Project:
ACTIVE

Client action:
PENDING APPROVAL
```

It may be both Active and highlighted as Awaiting Your Action.

---

# 11. Client category ≠ internal lifecycle

Internal Project lifecycle might include:

```text
ACTIVE
ON_HOLD
COMPLETED
CANCELLED
ARCHIVED
```

while the Portal uses simpler presentation categories.

Do not rewrite Project lifecycle to fit card tabs.

---

# 12. Client-facing status mapping

An internal state such as:

```text
EDITORIAL_DRAFT_REVIEW
```

might safely display:

> Content in Review

An internal state such as:

```text
PROVIDER_EXECUTION_RETRY
```

might not need to appear at all.

Client-facing state mapping must be intentional and centralized.

---

# 13. Frontend label replacement is not sufficient

Avoid:

```text
if status === INTERNAL_REVIEW:
  label = "In Progress"
```

implemented independently across Client screens.

Use a canonical client-facing Project state/presentation resolver.

---

# 14. Progress needs one definition

If cards show:

> 72% Complete

the percentage must come from a defined Project/workflow/readiness rule.

Not:

```text
completedTasks / allTasks
```

unless that is actually the approved Project progress model.

---

# 15. Client-facing progress ≠ internal readiness

Internal:

```text
Editorial readiness
Publishing readiness
Distribution readiness
```

are specialized operational metrics.

Overall Client Project progress may consume them but must not invent one arbitrary average.

---

# 16. Progress ≠ workflow stage

Two Projects at the same stage can have different progress if the model says so.

Conversely, a stage label alone does not inherently equal a numeric percentage.

Keep them distinct.

---

# 17. Upcoming Project

“Upcoming” requires a canonical definition.

Potentially:

* Project exists,
* access granted,
* start date in future,
* not yet operationally active.

Exact rule Phase 3D.

Do not hard-code:

```text
status = UPCOMING
```

unless that truly belongs to Project lifecycle.

---

# 18. Completed Project

Completed Projects must remain accessible where authorized.

Completion should not mean deletion.

Design 042 should support historical navigation to completed work.

---

# 19. Completed ≠ archived access removal

Internal Project may eventually become archived.

A Client may still need:

* final deliverables,
* Reports,
* Contracts,
* live links,
* historical messages.

Archiving operational work must not automatically destroy Client access.

---

# 20. Cancelled Projects

If canonical Projects support cancellation, the Client presentation must be explicitly defined.

Do not silently put Cancelled Projects into Completed unless business policy says they are equivalent from the Client perspective.

---

# 21. Awaiting Your Action

This should reuse the canonical **Client Action resolver** established in Design 041.

Potential sources:

```text
Client ApprovalRequest
ClientRequest
Questionnaire required
Asset upload required
Payment action
```

Do not independently scan internal workflow names for the word “client”.

---

# 22. Task ≠ Client action

Design 034 internal Tasks remain private unless explicitly converted into Client-facing obligations through a proper source domain.

Example:

```text
Internal Task:
Call Client about missing image
```

is not a Client action.

But:

```text
ClientRequest:
Upload high-resolution portrait
```

is.

---

# 23. Notifications ≠ Client action

A Notification is an alert/delivery mechanism.

It must not produce an additional action count.

```text
ClientRequest
   ↓
Notification
```

should count as one obligation, not two.

---

# 24. Pending Approval

Design 029 remains authoritative.

If a Project card says:

> Approval Required

it must correspond to a real current Client ApprovalRequest for that Portal member/context.

Do not infer it only from the Project stage.

---

# 25. Approval needs exact version lineage

For example:

```text
Magazine Proof v4
→ ApprovalRequest #AP-21
```

Design 042 may show:

> Proof approval required

but the actual detail/action must ultimately bind to that exact version.

---

# 26. Upcoming milestone

Cards may show a next due date/milestone.

The source should be canonical:

```text
Project Milestone
Client deadline
Client-visible schedule item
```

not a duplicated `nextDate` property manually maintained on the Portal record.

---

# 27. Next milestone ≠ next Client action

Example:

```text
Next milestone:
Publication — Sep 10
```

while:

```text
Client action:
Approve Design by Sep 4
```

Both can exist simultaneously.

Do not conflate them into one `nextStep`.

---

# 28. Account Manager

If the frozen design displays an Account Manager:

use a client-safe Employee/member projection from Design 036.

Expose only approved fields such as:

* name,
* role/title,
* approved profile image/contact method.

Do not expose employee workload, permissions, internal profile metadata, or Team data unnecessarily.

---

# 29. Account Manager ≠ Project Owner

Keep these concepts separate even if the same person sometimes occupies both roles.

---

# 30. Profile photo

Account Manager portraits reuse Design 030 Asset infrastructure.

Do not create a Client Portal image storage subsystem.

---

# 31. Search

Design 042 should support server-side search over permitted fields such as:

* Project name,
* product/type,
* safe project reference.

Search occurs **after membership scope is established**.

---

# 32. Search must not leak inaccessible Project names

Dangerous:

```text
search entire Project table
↓
then remove unauthorized results
```

because counts/autocomplete/timing can still leak information.

Apply access scope at query level.

---

# 33. Filters

Potential filters may include:

```text
status/presentation category
Project type
date
action required
```

according to frozen UI.

Filters are presentation/query state.

They are not authorization.

---

# 34. Saved filters are probably unnecessary unless frozen

Do not automatically copy internal CRM Saved Views into Client Portal.

The Client Projects workspace should stay appropriately simple.

This audit introduces no feature not already frozen.

---

# 35. Sorting

Useful canonical sort options can include:

* most recently updated,
* upcoming date,
* Project name,
* client-safe status.

Exact UX remains frozen.

Sorting should be server-side when datasets scale.

---

# 36. Pagination

A Client may eventually have many historical Projects.

Use server-side pagination/cursor loading rather than loading every Project ever created.

---

# 37. Card/list data should be lightweight

`ClientProjectSummary` should contain only what this screen needs.

Avoid fetching:

* all Tasks,
* full activity timeline,
* entire file collection,
* full Drafts,
* Finance records,

for every card.

Design 043 can load deeper information.

---

# 38. ClientProjectSummary

Conceptually:

```text
ClientProjectSummary
├── projectId
├── safe project name
├── project type
├── client-facing status
├── client-facing progress
├── next safe milestone
├── action-required summary
├── account manager summary
├── relevant dates
└── permitted navigation/actions
```

It is a projection.

Not another stored business record.

---

# 39. Card click

Opening a Project should navigate into canonical Design 043:

**Client Project Detail**

The detail screen then requests that Project under fresh authorization.

Do not rely on:

> It appeared in My Projects, therefore detail authorization can be skipped.

---

# 40. Deep-link authorization

A Portal user manually entering another `projectId` must receive access denial/not-found-safe behavior.

The Project list is not the security boundary.

---

# 41. Existence leakage

For unauthorized Project IDs, response policy should avoid unnecessarily revealing:

> Project exists but you don't have access.

Depending on product security policy, a safe not-found-like response may be preferred.

Exact API semantics Phase 3D.

---

# 42. Project creation

Design 042 is **My Projects**, not internal Project Intake Design 108.

Unless frozen UI explicitly contains Client-initiated Project creation, do not add:

> New Project

as an implementation requirement.

This screen should not duplicate internal Intake.

---

# 43. Project editing

Similarly, Portal users should not directly edit canonical internal Project:

* owner,
* workflow,
* health,
* production stage.

Their allowed actions are specialized:

* approvals,
* requested information,
* uploads,
* messages,
* payment.

---

# 44. Client action command routing

If a card exposes a quick action:

```text
Approve
Upload
Respond
Pay
```

it must route to the canonical source service.

No `updateClientProject()` mega-command should mutate unrelated domains.

---

# 45. Relationship to Design 043

Design 042:

> project collection / overview.

Design 043:

> one Project's Client-safe 360.

```text
042 My Projects
      ↓
043 Client Project Detail
```

One Project projection infrastructure at different detail levels.

---

# 46. Relationship to Design 044

Design 044 — Project Timeline / Progress should consume:

```text
Project
Workflow/Milestone history
Client-safe timeline mapping
```

Design 042 may show a compact progress summary only.

Do not duplicate the full timeline in every Project card.

---

# 47. Relationship to Design 047

**Client Tasks / Requests**

Design 042 may show:

> 2 actions required

Design 047 should provide the deeper request/action workspace.

Both use the canonical Client Action resolver/source records.

---

# 48. Relationship to Design 048

**Client Questionnaires**

A Project card may show:

> Questionnaire required

if one is actionable.

Design 048 handles actual questionnaire interaction.

No questionnaire engine inside Design 042.

---

# 49. Relationship to Designs 049–050

Draft and Design review actions can contribute to:

> Awaiting Your Action

but their full versioned review workspaces remain Designs 049/050.

---

# 50. Relationship to Design 051

Client Files & Assets owns broader accessible file navigation.

Design 042 may show a deliverable/action indicator but does not load the full asset library.

---

# 51. Relationship to Design 052

Client Approvals owns the complete approval collection.

Design 042 shows only Project-context summaries.

---

# 52. Relationship to Designs 053–054

Contracts and billing may be associated with Projects.

Design 042 should not expose financial/legal details merely because a Project exists.

Portal permissions still control them independently.

---

# 53. Relationship to Design 055

Publishing & Distribution status may eventually contribute to a completed/late-stage Project summary.

The Publishing/Distribution domains remain authoritative.

---

# 54. Relationship to Design 056

Final reports/downloads can be accessed through Project Detail or Reporting screens.

Design 042 remains a Project navigation surface.

---

# 55. Relationship to Design 057

Renewal/Continuation may become relevant after Project completion.

Do not turn Completed Project cards into a renewal engine.

Design 057 owns continuation/renewal workflow.

---

# 56. Relationship to Design 065

Later:

**Design 065 — Client Media Projects / Media Center**

This is a significant overlap checkpoint.

Current expectation:

```text
Canonical Client Project Projection
        │
        ├── Design 042
        │   broad My Projects
        │
        └── Design 065
            media-specialized project collection
```

We do not merge the screens now.

But they must not create separate Project records or access engines.

---

# 57. Potential distinction with Media Center

Design 042 likely serves the broad Client Project universe.

Design 065 can specialize around media production content/assets.

Exact distinction waits until Design 065's audit.

**Strong overlap flag; no merge yet.**

---

# 58. Relationship to Design 066

Design 066 — Client Media Project Detail should likewise consume the same canonical Project identity and media-specific projection.

No second Client Project database.

---

# 59. Permissions architecture

Potential Phase 3D Client Portal capabilities:

```text
portal.projects.read
portal.projects.read_assigned
portal.projects.view_progress
```

with Project resource scope.

Exact names later.

Core rule:

> **Portal membership does not imply every Project is visible.**

---

# 60. Viewing Project ≠ viewing all Project subresources

A user may be able to open the Project while lacking:

* invoices,
* Contracts,
* sensitive Reports,
* some deliverables.

Therefore:

```text
project.read
≠
invoice.read
≠
contract.read
≠
deliverable.download
```

Design 043 and later screens must preserve these subresource boundaries.

---

# 61. Card information must respect subresource permissions

If a member cannot see Finance:

do not show:

> Outstanding invoice

on the Project card.

Even the existence of a financial obligation can be sensitive.

---

# 62. Client-safe Project visibility

Server-side access should conceptually evaluate:

```text
canPortalMemberAccessProject(
  membership,
  project
)
```

using:

* Client/account relationship,
* explicit Project scope,
* membership status,
* Portal Role/entitlements.

---

# 63. Permission-safe aggregates

Counts such as:

```text
4 Active
2 Completed
1 Awaiting Action
```

must be calculated over the **same authorized Project set**.

Never calculate organization-level totals and hide card details afterward.

---

# 64. Caching

Cache keys must include relevant:

```text
portal organization/client
membership
project entitlement scope
filters
```

A cached CEO Project list must never be served to a restricted assistant user.

---

# 65. Membership revocation

If a user's Project access is revoked:

Design 042 must stop returning that Project promptly.

Existing client/browser caches should not preserve long-lived unauthorized access.

---

# 66. Project access removal ≠ Project deletion

Removing Portal access does not modify the canonical Project.

It changes authorization only.

Historical Project/business records remain intact.

---

# 67. State coverage

Design 042 inherits Design 150 plus Client Project-specific states:

```text
Projects Loading
Projects Ready

No Projects Yet
No Active Projects
No Completed Projects
No Projects Matching Filters

Project Active
Project Upcoming
Project Completed

Client Action Required
Approval Required
Requested Information Required

Project Data Partially Available
Project Progress Unavailable

Permission Restricted
Project Access Revoked
Account/Membership Restricted

Search Failed
Partial Service Failure
```

These are not one Project status enum.

---

# 68. No Project ≠ Project service unavailable

Correct:

> You don't have any active Projects right now.

only when the authorized Project query succeeds.

If Project service fails:

> Projects are temporarily unavailable.

Never show an empty success state during an outage.

---

# 69. No action ≠ action service unavailable

If Client Action resolver fails:

do not mark every Project:

> No action required.

Use an unknown/degraded state.

---

# 70. Progress unavailable ≠ 0%

If workflow/progress data cannot be computed:

do not render:

```text
0% Complete
```

Show that progress is unavailable.

---

# 71. Partial failure

Example:

```text
Project core       ✓
Progress           ✓
Client Actions     ✕
Account Manager    ✓
```

The Project list remains usable.

Only action indicators become unavailable.

---

# 72. Client-safe error language

Portal:

> Action status is temporarily unavailable.

Not:

> Approval read-model consumer failed at Kafka offset 8422.

Technical diagnostics stay internal.

---

# 73. Responsive — Desktop

Desktop should preserve an easy-to-scan Project library:

```text
My Projects Header
↓
Project category/status summary
↓
Search / Filters
↓
Active / Awaiting Action / Upcoming / Completed
↓
Project Cards / List
    ├── Project identity
    ├── Type
    ├── Progress
    ├── Status
    ├── Important date
    ├── Action required
    └── Account manager
```

Portal simplicity should take priority over internal operational density.

---

# 74. Responsive — Tablet

Following the frozen responsive systems:

* cards reduce to two/one columns,
* filters become compact sheets,
* primary Project metadata stays visible,
* account manager/details stack cleanly,
* action-required labels remain prominent.

---

# 75. Responsive — Mobile

Prioritize:

```text
My Projects
↓
Status tabs/filter
↓
Action Required Projects
↓
Active Projects
↓
Project Card
    ↓
    Name / Type
    Status
    Progress
    Next Date
    Required Action
↓
Open Project
```

Do not compress desktop tables.

---

# 76. Mobile information hierarchy

On a narrow screen, prioritize:

1. Project identity.
2. Action required.
3. Current status/progress.
4. Relevant date.
5. Open Project.

Lower-priority metadata can move deeper.

---

# 77. Accessibility

Project state cannot rely solely on:

* progress-ring color,
* card border color,
* icon.

Use textual labels:

> 72% complete
> Approval required
> Due September 8

Cards and filters must be keyboard/screen-reader accessible.

---

# 78. Read model

A useful query shape:

```text
ClientProjectsView
├── membership/account context
├── authorized Project summaries
├── presentation categories
├── client-facing status
├── client-facing progress
├── Client action summaries
├── safe milestone/date
├── Account Manager summaries
├── pagination
└── permission-aware links/actions
```

Again:

**read composition, not source truth.**

---

# 79. Avoid giant Portal Project API

Dangerous:

```text
GET /client/projects
→ entire internal Project object
→ Tasks
→ internal risk
→ finance
→ workflow
→ comments
```

Prefer a deliberately small:

```text
ClientProjectSummaryQuery
```

and load Design 043 detail separately.

---

# 80. Mutation boundary

Design 042 itself should have little/no Project mutation.

Any action routes to source commands:

```text
decideClientApproval()
submitQuestionnaire()
uploadRequestedAsset()
respondToClientRequest()
initiateInvoicePayment()
```

No generic:

```text
updateClientProject()
```

for cross-domain actions.

---

# 81. Backend architecture

```text
Design 042 — My Projects
        ↓
ClientPortalSessionContext
        ↓
ClientPortalAuthorization
        ↓
ClientProjectsQueryService
        ↓
Project Access Scope
        │
        ├── Project Domain
        ├── Client Action Resolver
        ├── Approval Service
        ├── Milestone / Workflow projection
        └── People safe projection
        ↓
ClientProjectSummary[]
```

Detail navigation then enters Design 043.

---

# 82. Backend requirements

| Requirement                             | Status                    |
| --------------------------------------- | ------------------------- |
| Client Portal authentication            | **Critical**              |
| Portal membership validation            | **Critical**              |
| Client/organization isolation           | **Critical**              |
| Project-level entitlement               | **Critical**              |
| Canonical Project reuse                 | **Critical**              |
| Client-safe Project DTO                 | **Critical**              |
| Client-facing status mapping            | **Critical**              |
| Defined Client Project progress         | **Critical**              |
| Client Action resolver reuse            | **Critical**              |
| Approval integration                    | **Required**              |
| Milestone/schedule integration          | **Required**              |
| Account Manager safe projection         | **Required**              |
| Search/filter/pagination                | **Critical**              |
| Server-side authorization before search | **Critical**              |
| Permission-safe aggregates              | **Critical**              |
| Permission-safe caching                 | **Critical**              |
| Membership/access revocation            | **Critical**              |
| Deep-link authorization                 | **Critical**              |
| Partial service failure                 | **Critical**              |
| Unknown/zero/empty distinction          | **Critical**              |
| Design 041 count consistency            | **Critical**              |
| Design 043 detail reuse                 | **Critical**              |
| Designs 065–066 Project reuse           | **Critical architecture** |

---

# 83. Main implementation risks

Design 042 flags several important risks:

**Project/ClientProject duplication**
Portal receives a second Project business table.

**Internal/Client Project projection conflation**
Project 360 is exposed with frontend redaction.

**Client/Project access conflation**
Every member of Client A can see every Client A Project.

**My Projects/ownership conflation**
Portal membership treated as Project owner.

**Internal/client status conflation**
Internal workflow codes leak directly into Client UI.

**Progress fabrication**
Percentage is decorative rather than canonical.

**Progress/stage conflation**
Stage number is converted mechanically into percent complete.

**Active/action category conflation**
Project tabs become competing Project statuses.

**Task/ClientAction conflation**
Internal employee work becomes a Client responsibility.

**Notification/action duplication**
One obligation is counted twice.

**Milestone/action conflation**
Next Project date and Client obligation become one field.

**Search leakage**
Unauthorized Project names appear through search/autocomplete.

**Aggregate leakage**
Counts include Projects the Portal member cannot access.

**Finance leakage on Project cards**
Billing information displayed to non-finance Portal users.

**Deep-link trust**
Any known Project ID becomes accessible.

**Access removal/deletion conflation**
Removing Portal access modifies/deletes the Project.

**Unknown/empty conflation**
Service outage displayed as “No Projects.”

**Unknown/progress-zero conflation**
Progress failure becomes 0%.

**Oversized Project queries**
Every card loads Tasks/files/activity/finance unnecessarily.

**042/065 duplicate project libraries**
Media Center creates a second Client Project engine.

None requires another design.

They require correct Project projection and Portal authorization architecture.

# Design 042 Audit Verdict

## **PASS — CLIENT PORTAL PROJECT LIBRARY & PROJECT-SAFE PROJECTION ANCHOR**

**Domain directive:** **Project ≠ ClientProjectSummary ≠ PortalProjectAccess ≠ Client-visible Progress.**

**Project directive:** Design 023 remains the one canonical Project domain; Design 042 never creates a separate Client Project business record.

**Access directive:** every Project in My Projects is selected through the current `ClientPortalMembership` and resource entitlement before aggregation, searching, filtering or counting.

**Projection directive:** Client cards consume deliberately small `ClientProjectSummary` DTOs rather than internal Project 360 objects with frontend redaction.

**Status directive:** internal workflow/project states and Client-facing status labels remain separate through one canonical presentation mapping.

**Progress directive:** Client-visible Project progress requires one governed calculation; it is never decorative and never mechanically inferred from card position or raw stage number.

**Category directive:** Active, Awaiting Your Action, Upcoming and Completed are Project-library/query presentations, not four independent Project tables or competing lifecycle systems.

**Action directive:** “Awaiting Your Action” reuses Design 041's Client Action resolver and canonical Approval/Request/Questionnaire/etc. domains. Internal Tasks and Notifications are not duplicated as Client actions.

**Milestone directive:** next milestone/date and next Client action remain distinct concepts.

**People directive:** Account Manager information comes through a limited client-safe Design 036 projection, never the internal Employee profile.

**Detail directive:** Design 042 is the collection/navigation surface; Design 043 owns the deeper one-Project Client view.

**Timeline directive:** Design 044 owns detailed Project timeline/progress while 042 exposes only summary progress.

**Permission directive:** viewing a Project does not automatically grant Finance, Contract, Report, File or other subresource permissions.

**Failure directive:** empty, restricted, unavailable, action-unknown and progress-unknown remain separate states.

**Caching directive:** cache scope includes Portal account/membership and Project entitlements; broader Client-user results cannot leak to narrower users.

**Responsive directive:** desktop presents a clear Project library while mobile prioritizes action required → Project identity → progress/status → relevant date → open Project.

**Overlap directive:** Designs **042, 043, 044, 047–056 and 065–066** must reuse one canonical Project identity, Portal entitlement, Client-safe status/progress and Project projection infrastructure.

**Consolidation directive:** **STANDARDIZE ONE CLIENT-PORTAL PROJECT ACCESS + CLIENT-SAFE PROJECT SUMMARY + STATUS MAPPING + PROGRESS + CLIENT-ACTION PROJECTION INFRASTRUCTURE — DO NOT BUILD SEPARATE CLIENT PROJECT MODELS FOR MY PROJECTS, PROJECT DETAIL, TIMELINE OR MEDIA CENTER.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **42 / 153** |
| **PASS**                                   |                         **42** |
| **STANDARDIZE decisions**                  |                         **40** |
| **Potential implementation-overlap flags** |                         **33** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**42 / 153 = 27.5% audited.**

### Client Portal Project architecture after Design 042

```text
                CANONICAL PROJECT DOMAIN
                     Design 023
                         │
            Client-safe state/progress
                         │
                  Project Entitlement
                         │
                         ↓
               CLIENT PORTAL PROJECTS
                         │
             ┌───────────┼────────────┐
             ↓           ↓            ↓
          Design 041   Design 042   Design 043
          Dashboard    My Projects   Project Detail
                                       │
                                       ↓
                                  Design 044
                              Timeline / Progress
```

We now have the frozen Client Portal sequence locked through **Design 077**, so the immediate next audit has no identity ambiguity:

# Next Sequential Audit Target

## **Design 043 — Client Project Detail**

After that, strictly:

**044 — Project Timeline / Progress → 045 — Client Messages → 046 — Meetings → 047 — Tasks / Requests → ... → 077 — Client Access Recovery**

We do **not** jump to the `← NEXT` annotations at Designs 057 or 064; those are reached only when their sequential turn arrives.

For Design 043, the audit remains exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no extra screen and no sequence change.**

