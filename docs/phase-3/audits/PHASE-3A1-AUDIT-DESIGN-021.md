Correct. We now move from the **commercial transaction layer** into the **ongoing customer relationship layer**.

The frozen sequence remains:

**Design 020 — Invoice / Payment Workspace → Design 021 — Client 360 / Client Detail Workspace → Design 022 — Client Onboarding Workspace.**

No redesign, no additional screen, and no sequence change.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 021 — Client 360 / Client Detail Workspace

| Audit field                 | Classification                                                                                                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**               | **021**                                                                                                                                                                                    |
| **Canonical name**          | **Client 360 / Client Detail Workspace**                                                                                                                                                   |
| **Product area**            | Client Management / Account Management / CRM                                                                                                                                               |
| **User surface**            | Team Workspace                                                                                                                                                                             |
| **Screen class**            | Record Detail / Relationship 360 Workspace                                                                                                                                                 |
| **Classification**          | **Entity Detail Variant — Canonical Client Relationship Anchor**                                                                                                                           |
| **Primary purpose**         | Provide the complete internal business view of one Client relationship across identity, contacts, commercial history, projects, billing, ownership, portal access, onboarding and activity |
| **Primary entity**          | **Client / ClientAccount**                                                                                                                                                                 |
| **Supporting entities**     | Company, Contact, Deal, Proposal, Contract, Invoice, Payment, Project, User/AccountOwner, PortalOrganization, PortalMembership, Activity                                                   |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                                            |
| **Parent template**         | `EntityDetailWorkspaceTemplate` — established by Design 017                                                                                                                                |
| **Composition**             | `Client360Composition`                                                                                                                                                                     |
| **Auth**                    | Required                                                                                                                                                                                   |
| **Permissions**             | Client/account + related-domain permission scopes                                                                                                                                          |
| **Implementation priority** | **Core / Critical**                                                                                                                                                                        |
| **Reuse level**             | **Extremely High**                                                                                                                                                                         |

---

# 1. Functional responsibility

Design 021 answers:

> **“Who is this Client, what is our complete relationship with them, what have they purchased, what work is active, what do they owe or have paid, who owns the relationship, what access do they have, and what needs attention next?”**

The lifecycle transition is now:

```text
PROSPECT
   ↓
Lead
   ↓
Deal
   ↓
Proposal
   ↓
Contract
   ↓
Invoice / Payment
   ↓
COMMERCIAL CONVERSION
   ↓
CLIENT RELATIONSHIP
   ↓
Onboarding
   ↓
Projects / Delivery
   ↓
Ongoing Relationship
```

The essential rule is:

> **A Client is not simply a renamed Lead, Deal, Company, or Contact.**

It represents an ongoing customer/business relationship.

---

# 2. Company ≠ Client

This is the most important distinction in Design 021.

### Company

Represents an organization as a CRM identity.

It can exist before any commercial relationship exists.

### Client

Represents the business/customer relationship between that organization/person and the workspace.

For example:

```text
Company
TechNova Solutions
│
├── existed as prospect
├── contacts discovered
├── leads created
├── deals pursued
└── eventually became
        ↓
      Client
```

Therefore:

```text
Company ≠ Client
```

Do not create a second duplicated Company record merely because the Company becomes a customer.

---

# 3. The Client should reference canonical identity

A clean conceptual model is:

```text
Company
   ↓
ClientAccount / ClientRelationship
```

or, where the customer is fundamentally an individual:

```text
Contact
   ↓
ClientRelationship
```

The exact cardinality belongs to Phase 3D.

The audit requirement is:

> Preserve underlying Company/Contact identity while introducing a separate Client relationship record.

---

# 4. Why the Client entity is necessary

If we only place:

```text
company.isClient = true
```

on Company, we lose important relationship-specific information such as:

**account owner**
**client since date**
**relationship lifecycle**
**onboarding state**
**portal relationship**
**commercial history**
**client health/context**
**internal account-management information**

These belong to the client relationship rather than company identity.

---

# 5. Client ≠ Deal

A Client can have many Deals over time.

```text
Client
│
├── Deal A — Personal Magazine
├── Deal B — Podcast Package
└── Deal C — Annual Authority Package
```

Therefore:

> **Winning another Deal for an existing Client should generally attach that Deal to the existing Client relationship rather than create another duplicate Client.**

The canonical conversion service must perform this resolution.

---

# 6. Conversion ownership belongs elsewhere

Design 021 is the resulting Client workspace.

It should **not** independently convert a Deal into a Client.

Later:

**Design 106 — Client Conversion / Won Deal Handoff**

owns the controlled conversion workflow.

Correct architecture:

```text
Deal Won
   ↓
Design 106 / Conversion Service
   ↓
Existing Client relationship?
   │
   ├── YES → link new commercial records
   │
   └── NO  → create canonical Client relationship
   ↓
Design 021 — Client 360
```

This prevents duplicate Client creation.

---

# 7. Client ≠ Contact

A Contact remains a person.

A Client relationship can include many Contacts:

```text
Client: TechNova
│
├── Sarah — Decision Maker
├── Arjun — Billing Contact
├── Elena — Project Contact
└── Ravi — Portal User
```

Contact roles should be represented through relationship metadata rather than duplicate Contact records.

---

# 8. Client Contact role architecture

Conceptually:

```text
ClientContact
├── clientId
├── contactId
├── relationshipRole
├── isPrimary
├── isBillingContact
├── isProjectContact
└── other approved metadata
```

Exact fields belong to Phase 3D.

This allows one canonical Contact to play different roles for the Client.

---

# 9. Client ≠ Client Portal organization

Another critical boundary:

```text
Client
≠
ClientPortalOrganization
```

The **Client** is the internal business relationship.

The **Client Portal organization/account** is an external access container.

They can be linked:

```text
Client
   ↓
Portal Organization
   ↓
Portal Memberships
   ↓
External Users
```

but they are not the same object.

---

# 10. Client ≠ Portal user

Similarly:

```text
Contact
≠
Portal User
≠
Portal Membership
```

A Contact may exist without portal access.

A Contact can later receive an invitation.

The resulting authenticated portal identity/membership must remain separately controlled.

---

# 11. Portal access architecture

Design 021 may summarize:

**Portal enabled**
**Users invited**
**Active users**
**Pending invites**

but deeper portal administration belongs to the frozen Client Portal/administration screens later in the roadmap.

Design 021 should consume canonical access data rather than maintaining:

```text
client.portalPassword
```

or other unsafe shortcuts.

---

# 12. Client 360 is internal

The entire Client 360 workspace is an internal Team Workspace surface.

It may include:

* commercial history,
* financial summaries,
* internal notes,
* account strategy,
* risks,
* project health,
* outstanding actions.

These must **not automatically appear in the Client Portal**.

The Client Portal gets explicitly approved data through its own permission/query boundary.

---

# 13. Client relationship status

Client relationship lifecycle needs its own state.

Conceptually, it might distinguish states such as:

```text
NEW
ACTIVE
DORMANT
INACTIVE
```

or whatever final vocabulary is frozen in Phase 3D.

The exact enum is not being invented here.

The requirement is:

```text
Client relationship status
≠
Project status
≠
Invoice status
≠
Portal access state
```

---

# 14. Client status ≠ onboarding state

Example:

```text
Client Relationship:
ACTIVE

Onboarding:
IN_PROGRESS
```

or:

```text
Client Relationship:
ACTIVE

Onboarding:
COMPLETED
```

Both are valid.

Therefore onboarding must not be represented by the Client lifecycle field.

Design 022 will own that workflow.

---

# 15. Client status ≠ account health

Likewise:

```text
Client Status:
ACTIVE

Account Health:
AT_RISK
```

can be valid.

Health may derive from signals such as:

* overdue obligations,
* blocked Projects,
* unresolved Client requests,
* inactivity,
* delivery risks.

If Account Health exists in the approved product, it should be its own derived operational dimension.

---

# 16. Client status ≠ Portal status

Example:

```text
Client:
ACTIVE

Portal:
NOT_ACTIVATED
```

or:

```text
Client:
ACTIVE

Portal:
ACTIVE
```

Again, separate concerns.

---

# 17. Client 360 composition

Without redesigning the approved screen, implementation should normalize around reusable areas.

### Client Header

Typical canonical context:

**Client name**
**Company/person identity**
**Account owner**
**Client relationship state**
**Client since**
**Primary contact**
**Onboarding context**
**Portal access summary**

### Relationship summary

Potentially:

**active Projects**
**commercial history**
**open actions**
**billing summary**

### Related-record areas

Conceptually:

**Overview**
**Contacts**
**Projects**
**Commercial / Deals**
**Contracts**
**Invoices / Payments**
**Portal / Access summary**
**Activity**

Exact approved tab labels remain unchanged.

---

# 18. Reuse Design 017 rather than create another 360 framework

Design 021 should be implemented as:

```text
EntityDetailWorkspaceTemplate
        ↓
Client360Composition
```

not:

```text
brand-new unrelated Client page architecture
```

Major reusable components include:

`RecordHeader`
`RecordTabs`
`RecordMetricStrip`
`RelatedEntityCard`
`RelatedRecordsTable`
`ActivityTimeline`
`OwnerControl`
`RecordActionMenu`
`NotesPanel`

This validates the architecture established during Design 017.

---

# 19. Company information remains Company-owned

Design 021 can display:

**Company name**
**industry**
**domain**
**location**

but edits to canonical organization identity should use the Company service.

We must not maintain:

```text
Client.companyName
Company.name
```

as two independently editable values.

---

# 20. Historical client snapshots are a separate concern

There are cases where historical records need frozen context.

For example, an executed Contract may preserve:

> TechNova Solutions, Address X

even if the Company's CRM address changes later.

That is handled through Contract/Invoice snapshots.

It does not justify duplicating all Company information into the Client record.

---

# 21. Deal history

Design 021 should show all permitted Deals associated with this Client.

Conceptually:

```text
Client
├── Won Deal 1
├── Won Deal 2
├── Open Renewal/Upsell Deal
└── Lost historical Deal
```

These remain canonical Deal records.

The Client 360 summarizes them.

It does not copy them into `client.dealsJson`.

---

# 22. Proposal history

Likewise:

```text
Client
 ↓
Deals
 ↓
Proposals / Proposal Versions
```

Proposal history remains owned by the Proposal domain.

The Client 360 exposes contextual summaries and links.

---

# 23. Contract history

A Client may eventually have multiple Contracts:

```text
Client
├── Contract 2026
├── Amendment / New Contract
└── Contract 2027
```

Design 021 can show execution state/contract value where permitted.

The canonical records remain in the Contract domain.

---

# 24. Invoice and Payment summary

Client 360 should not maintain another billing ledger.

Correct:

```text
Invoice / Payment Domain
        ↓
Client Finance Summary Query
        ↓
Client 360
```

Potential authorized summaries include:

**total invoiced**
**collected**
**outstanding**
**overdue**

using the same definitions established by Designs 007 and 020.

---

# 25. Permission-sensitive financial aggregation

If the current user lacks Finance visibility:

```text
Client Header        ✓
Contacts             ✓
Projects             ✓
Financial details    ✕
```

Then the backend must not return the hidden financial values.

The UI hiding them is not sufficient.

---

# 26. Multi-currency client history

A Client could potentially have commercial records in more than one currency.

Therefore:

> **Client lifetime value cannot simply sum `$ + € + £`.**

If consolidated reporting is supported, it needs canonical reporting-currency rules.

Otherwise display values grouped by currency.

Design 021 should consume Finance reporting logic instead of inventing its own arithmetic.

---

# 27. Client ≠ Project

A Client can have:

```text
0..N Projects
```

and Projects have independent lifecycles.

Example:

```text
Client: ACTIVE

Project A: COMPLETED
Project B: ACTIVE
Project C: PLANNED
```

The Client does not become “Completed” just because one Project finishes.

---

# 28. Project relationship

Correct:

```text
Client
 ↓
Project(s)
```

with potentially:

* originating Deal,
* Contract,
* project owner/team,
* project status,
* delivery state.

Design 021 consumes Project summaries.

It does not implement project workflow itself.

---

# 29. Project creation boundary

Design 021 may allow an authorized entry action such as opening/starting project-related workflows where already approved.

But canonical Project creation should go through:

**Project Intake / Project Creation**

later represented explicitly by Design 108.

No Client-page-specific Project database should exist.

---

# 30. Account owner ≠ Deal owner

This distinction is critical after conversion.

### Deal owner

Responsible for the commercial opportunity.

### Client account owner

Responsible for the ongoing Client relationship.

Example:

```text
Deal Owner:
Michael

Client Account Owner:
Emma
```

This is completely valid.

Do not automatically assume permanent ownership inheritance.

---

# 31. Account owner ≠ Project owner

Likewise:

```text
Client Account Owner:
Emma

Project Owner:
Daniel
```

Client relationship ownership and delivery ownership are independent.

---

# 32. Ownership handoff

When a Client Account Owner changes:

```text
Emma
 ↓
Daniel
```

preserve:

**old owner**
**new owner**
**actor**
**timestamp**

Assignment history matters for accountability and later account-management analytics.

---

# 33. Client onboarding relationship

Design 021 can expose the Client's onboarding summary:

```text
Not Started
In Progress
Completed
Needs Attention
```

only according to the canonical onboarding system.

It should not implement separate onboarding checkboxes.

The actual onboarding workflow begins in:

**Design 022 — Client Onboarding Workspace.**

---

# 34. Design 021 → Design 022 boundary

The relationship should be:

```text
Client 360
Design 021
     ↓
Open / Continue Onboarding
     ↓
Client Onboarding Workspace
Design 022
```

Design 021 answers:

> **What is the overall Client relationship?**

Design 022 answers:

> **What exactly must be completed to onboard this Client?**

Keep them separate.

---

# 35. Later Design 107 overlap

The frozen roadmap also contains:

**Design 107 — Client Onboarding Checklist Detail.**

This introduces an important future overlap flag.

Expected architecture:

```text
Canonical Client Onboarding Domain
          │
          ├── 022
          │   onboarding workspace
          │
          └── 107
              checklist/deeper onboarding detail
```

We do **not** merge them now.

Design 107 must receive its own audit first.

---

# 36. Portal administration boundary

Later Client Portal-related designs cover areas including:

* Client organization/company settings,
* notification preferences,
* portal users/team access,
* account history,
* activation/recovery.

Design 021 may summarize those systems where appropriate.

It must **not recreate their administration workflows inside Client 360**.

---

# 37. Client contacts vs Portal memberships

Example:

```text
Client Contacts: 7
Portal Users: 3
```

That is perfectly valid.

Some Client Contacts may never need Portal access.

Some portal-access rules can differ from internal Contact relationship roles.

---

# 38. Commercial history should be queried, not copied

Avoid:

```text
Client
├── totalDeals = mutable
├── totalContracts = mutable
├── totalPaid = mutable
└── activeProjects = mutable
```

unless those are deliberately managed cached projections.

Canonical values should derive from their source domains or maintained read models with explicit consistency rules.

---

# 39. Client 360 read model

Design 021 is a strong candidate for a composed read model:

```text
Client360View
├── Client relationship
├── Company/person summary
├── Contacts
├── Account owner
├── Onboarding summary
├── Project summary
├── Commercial summary
├── Contract summary
├── Billing summary
├── Portal summary
└── Recent activity
```

This is appropriate for reading.

Writes should still go to the correct domain services.

---

# 40. Do not mutate the composed read model

Incorrect:

```text
PATCH /client360
{
  company: ...,
  invoice: ...,
  project: ...,
  portalUsers: ...
}
```

Correct:

```text
ClientService
CompanyService
ProjectService
InvoiceService
PortalMembershipService
```

each remain authoritative for their domain.

The 360 view is composition, not a mega-domain.

---

# 41. Activity architecture

The Client timeline can aggregate meaningful cross-domain events such as:

```text
Client created
Onboarding started
Contact added
Deal won
Contract signed
Invoice issued
Payment received
Project created
Project completed
Portal user invited
Client owner changed
```

But each event links to its canonical source record.

---

# 42. Client Activity ≠ duplicate database of everything

For example:

```text
Payment
   ↓
Client Activity Event
```

The Activity event says:

> Payment received.

The `Payment` record still contains the actual financial truth.

The timeline should never become the only source of domain data.

---

# 43. Internal notes

Client-account notes may be valuable for:

* relationship context,
* preferences,
* account strategy,
* handoff notes.

They should use canonical internal Note infrastructure.

Internal notes must not automatically become Client Portal-visible content.

---

# 44. Client relationship history should persist

If a Client becomes dormant/inactive:

> Do not delete the Client relationship.

Historical:

* Deals,
* Contracts,
* Projects,
* Invoices,
* Payments,
* Contacts,

must remain reachable under appropriate permissions.

---

# 45. Existing Client + new Deal

An important deduplication case:

```text
Company already has Client relationship
        ↓
new Deal won
```

The system should normally:

```text
link Deal → existing Client
```

rather than:

```text
create Client #2 accidentally
```

unless the business architecture intentionally supports separate client accounts for the same Company.

That cardinality must be explicit in Phase 3D.

---

# 46. Record-level permission architecture

Potential capabilities include:

```text
client.read
client.edit
client.assign
client.archive

client.contacts.read
client.notes.read
client.notes.create
```

with related-domain rights remaining separate.

Exact permission names belong to Phase 3D.

---

# 47. Related-domain permissions

A Client user might be authorized for:

```text
Client overview      ✓
Contacts             ✓
Projects             ✓
Contracts            ✓
Invoices             ✕
Payments             ✕
Portal administration ✕
```

Each related query must independently enforce authorization.

This is one of the most important Client 360 backend requirements.

---

# 48. Scope architecture

Possible internal scope can include:

**own Clients**
**team Clients**
**department Clients**
**organization Clients**

Account managers may receive Client access based on assignment.

Finance can receive relevant financial access without automatically gaining permission to edit account-management notes.

---

# 49. Global search access

Design 021 will eventually be reachable from:

**Clients directory**
**Global Search**
**Company 360**
**Deal**
**Project**
**Contract / Invoice**

but all navigation routes must respect the same Client permission rules.

Exact paths remain Phase 3B work.

---

# 50. Partial failure behavior

A 360 workspace must not collapse because one downstream service fails.

Example:

```text
Client core          ✓
Contacts             ✓
Projects             ✓
Contracts            ✓
Finance summary      ✕
Portal summary       ✓
```

Correct behavior:

> Client 360 remains usable and Finance section shows a scoped retry/error state.

Incorrect:

> Entire Client page = error.

This follows the Design 150 system-state contract.

---

# 51. Performance / lazy loading

The page should load the Client core record/header first.

Then:

```text
Overview
Contacts
Projects
Finance
Activity
Portal
```

can use independently cached/lazy queries as appropriate.

A Client with ten years of activity should not block header rendering while thousands of related records are fetched.

---

# 52. Cache invalidation / freshness

Because Design 021 aggregates multiple domains, it should expose freshness consistently.

For example, after a Payment is recorded:

```text
Payment Service
    ↓
financial projection/cache invalidated
    ↓
Client 360 financial summary refreshes
```

Do not independently maintain stale browser-only totals.

---

# 53. Concurrency

Client Account ownership and core relationship metadata may be edited by multiple team members.

Example:

```text
User A changes Account Owner
User B changes Client status
```

Commands need revision/concurrency protection where stale overwrites would be destructive.

Cross-domain writes should remain isolated rather than one giant Client update.

---

# 54. Responsive contract — Desktop

Desktop should preserve the approved rich 360 workspace:

```text
Client Header
      ↓
Relationship / key metrics
      ↓
Tabs / sections
      ↓
Main Client context
      +
related commercial/project/account data
```

This is the fullest account-management experience.

---

# 55. Responsive contract — Tablet

Following Design 152:

* Client header reflows,
* metric cards move to fewer columns,
* tab navigation remains scrollable/touch-safe,
* secondary context moves to drawers,
* related-record tables reduce to priority fields,
* finance/project details remain permission-aware.

---

# 56. Responsive contract — Mobile

Following Design 151, prioritize:

```text
Client Identity
↓
Account Owner / Status
↓
Next Action / Attention
↓
Primary Contacts
↓
Active Projects
↓
Onboarding
↓
Commercial Summary
↓
Billing Summary
↓
Activity
```

A desktop multi-column 360 should become a sequential account summary.

---

# 57. Mobile action hierarchy

Highest-value actions should remain obvious:

**Open/continue onboarding**
**Contact client**
**Open active Project**
**Create/see next action**

Administrative actions can move into **More**.

No critical action should require hover.

---

# 58. State coverage

Design 021 inherits Design 150 plus Client-specific states:

**Client Loading**
**Client Not Found**
**Client Archived/Inactive**
**New Client / Minimal Relationship Data**
**No Contacts**
**No Projects Yet**
**No Contracts**
**No Invoices**
**No Activity Yet**
**Onboarding Not Started**
**Onboarding In Progress**
**Portal Not Configured**
**Portal Invite Pending**
**Related Service Failure**
**Record Updated Elsewhere**
**Permission Restricted**
**Partial Data Failure**

These states must preserve semantic meaning.

---

# 59. Positive empty state examples

> **No outstanding invoices**

is positive.

It is not the same as:

> **Finance data unavailable.**

Likewise:

> **No active projects yet**

is not the same as:

> **Project service failed.**

This distinction must be maintained throughout the 360.

---

# 60. Backend architecture

Recommended conceptual architecture:

```text
Client 360 UI
      ↓
Client360QueryService
      ↓
Tenant + Permission Scope
      ↓
Canonical Client Relationship
      │
      ├── Company / Contact Service
      ├── Deal / Proposal Service
      ├── Contract Service
      ├── Invoice / Payment Service
      ├── Project Service
      ├── Onboarding Service
      ├── Portal Membership Service
      └── Activity Service
```

Commands remain domain-specific:

```text
ClientService
├── update relationship metadata
├── assign account owner
└── lifecycle operation

ContactService
ProjectService
PortalMembershipService
...
```

---

# 61. Backend requirements

| Requirement                                  | Status       |
| -------------------------------------------- | ------------ |
| Authentication                               | **Required** |
| Tenant isolation                             | **Critical** |
| Client RBAC / record scope                   | **Critical** |
| Canonical Client relationship entity         | **Critical** |
| Canonical Company/Contact linkage            | **Critical** |
| Deal-to-existing-Client resolution           | **Critical** |
| Account ownership + history                  | **Required** |
| Client lifecycle separate from onboarding    | **Critical** |
| Client lifecycle separate from Project state | **Critical** |
| Client 360 composed read model               | **Required** |
| Permission-aware related queries             | **Critical** |
| Commercial history integration               | **Required** |
| Contract integration                         | **Required** |
| Invoice/Payment integration                  | **Required** |
| Project integration                          | **Critical** |
| Onboarding relationship                      | **Critical** |
| Portal organization/membership linkage       | **Critical** |
| Activity aggregation                         | **Required** |
| Internal notes visibility rules              | **Required** |
| Partial-failure support                      | **Required** |
| Lazy/paginated related data                  | **Required** |
| Concurrency protection                       | **Required** |
| Audit history                                | **Required** |

---

# 62. Canonical Client metrics

Where shown in the approved design, Client-level metrics should come from canonical domains.

Potential definitions include:

**Active Projects**
**Completed Projects**
**Total Contracted Value**
**Total Invoiced**
**Collected**
**Outstanding**
**Open Deals**
**Client Since**
**Next Action**

They must use the same definitions as their originating Project, Finance and Sales systems.

---

# 63. Do not invent one opaque “Client value”

A single number like:

> **Client Value: $225,000**

is meaningless unless the system defines whether it means:

* lifetime contracted,
* invoiced,
* collected,
* current active contracts,
* won Deal value.

Phase 3D must give each financial metric a precise definition.

---

# 64. Relationship to later Company 360

Later:

**Design 085 — Company Detail / Company 360**

will create a significant structural overlap.

Correct conceptual distinction:

### Company 360

> Everything we know about the organization.

### Client 360

> Everything about our active/historical customer relationship with that organization.

They share:

`EntityDetailWorkspaceTemplate`
`Contacts`
`Activity`
`Commercial summaries`

but remain separate domain compositions.

---

# 65. Relationship to Design 060

Later:

**Design 060 — Client Organization / Company Settings**

is focused on client organization configuration/settings.

Design 021 should not duplicate those settings.

It can provide context/navigation into them when appropriate.

---

# 66. Relationship to Design 106

Later:

**Design 106 — Client Conversion / Won Deal Handoff**

is the producer of a Client relationship from commercial conversion.

Design 021 is a primary consumer of the resulting canonical Client record.

Therefore:

```text
106
Conversion
   ↓
Client entity
   ↓
021
Client 360
```

not two separate Client creation models.

---

# 67. Relationship to Design 107

Design 107 later provides deeper onboarding checklist operation.

Together with Design 022:

```text
Client
 │
 ├── 021 Client 360
 │
 └── Onboarding Domain
       ├── 022 Client Onboarding Workspace
       └── 107 Checklist Detail
```

One canonical onboarding domain should serve all three contexts.

---

# 68. Main implementation risks

The Design 021 audit flags several critical risks:

**Company/Client conflation**
Turning `Company` into every aspect of the customer relationship.

**Client/Deal conflation**
Creating a new Client for every won Deal.

**Client/Portal conflation**
Treating internal Client records as external authentication accounts.

**Contact/Portal-user conflation**
Automatically giving every Contact login access.

**Duplicate financial state**
Copying Invoice/Payment totals into independently mutable Client fields.

**Project-state leakage**
Marking the Client “completed” because a Project completes.

**Ownership conflation**
Assuming Deal Owner, Account Owner and Project Owner are permanently identical.

**Permission leakage**
A generic Client 360 endpoint returning restricted Finance or Contract information.

**Mega-object mutation**
One `/client360` write endpoint changing Company, Projects, Portal users and Finance together.

**Duplicate conversion**
A second won Deal creating another Client for the same underlying Company.

**Portal data leakage**
Internal account notes appearing in Client-facing surfaces.

**360 performance collapse**
Loading every historical record before rendering the Client header.

**Metric ambiguity**
Displaying undefined “Client Value” calculations inconsistent with Finance.

None require another visual design.

They require correct relationship architecture.

# Design 021 Audit Verdict

## **PASS — CANONICAL CLIENT RELATIONSHIP / 360 WORKSPACE ANCHOR**

**Template directive:** Design 021 reuses the canonical `EntityDetailWorkspaceTemplate` established by Design 017 through a dedicated `Client360Composition`.

**Identity directive:** **Company ≠ Contact ≠ Client ≠ Portal Organization ≠ Portal User.**

**Relationship directive:** Client represents the ongoing commercial/customer relationship while Company/Contact remain canonical identities.

**Conversion directive:** Won Deal conversion must resolve an existing Client relationship before creating another one; Design 106 owns the controlled handoff.

**Ownership directive:** Deal Owner, Client Account Owner and Project Owner remain separate roles with preserved handoff history.

**Lifecycle directive:** Client lifecycle, onboarding state, account health, Portal state, Project state and financial state remain independent dimensions.

**Commercial directive:** Deal, Proposal and Contract history is composed from canonical records rather than duplicated into Client-specific copies.

**Financial directive:** Client-level Invoice/Payment totals derive from the canonical Finance domain and obey Finance permissions and currency rules.

**Project directive:** Projects remain independent delivery records linked to the Client; Design 021 summarizes rather than reimplements Project workflow.

**Portal directive:** Client Portal organization, memberships and authentication remain separate access-domain entities tied to the Client relationship.

**Permission directive:** Every related Client 360 area—Finance, Contracts, Projects, Portal administration—must independently enforce its own authorization.

**Performance directive:** Client 360 should use a composed read model with lazy/paginated related-domain queries and section-level partial-failure handling.

**Reuse directive:** Company 360, Contact 360, Lead 360 and other detail workspaces should continue reusing the structural 360 infrastructure while keeping domain semantics independent.

**Consolidation directive:** **STANDARDIZE ENTITY-360 + CLIENT-RELATIONSHIP INFRASTRUCTURE — DO NOT MERGE CLIENT 360 WITH COMPANY 360, PORTAL ADMINISTRATION, CLIENT CONVERSION OR ONBOARDING WORKSPACES.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **21 / 153** |
| **PASS**                                   |                         **21** |
| **STANDARDIZE decisions**                  |                         **19** |
| **Potential implementation-overlap flags** |                         **12** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

### Reusable architecture through Design 021

```text
InternalAppShell
│
├── Dashboard Family                         003–007
├── Data Acquisition Family                  008–009
├── Data Quality / Enrichment                010
├── CRM List Workspace                       011
├── Campaign Operations                      012
├── Versioned Workflow Builder               013
├── Unified Communication                    014
├── Action & Scheduling                      015
├── Pipeline Board                           016
├── Entity Detail / 360                      017
├── Versioned Commercial Document            018
├── Contract Execution Workspace             019
├── Billing & Payment Workspace              020
└── Client Relationship / 360
    └── 021 Client 360 / Client Detail
```

The canonical conversion chain is now clean:

```text
PROSPECT IDENTITY
      ↓
Lead
      ↓
Deal
      ↓
Proposal Version
      ↓
Contract Version
      ↓
Invoice / Payment
      ↓
Conversion / Handoff
      ↓
CLIENT RELATIONSHIP
      │
      ├── Company / Contacts
      ├── Account Ownership
      ├── Commercial History
      ├── Projects
      ├── Billing
      ├── Portal Relationship
      └── Activity
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 022: Client Onboarding Workspace Audit**

The frozen next identity is **Design 022 — Client Onboarding Workspace**.

That audit should establish the canonical separation between **Client, ClientOnboarding, onboarding template/checklist, onboarding step, required information, client dependency, internal responsibility, completion/readiness, portal activation and Project creation/handoff**, while ensuring onboarding is a real persisted workflow rather than a collection of unrelated checkboxes inside Client 360.

We continue with the identical audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no additional screen and no sequence change.**

