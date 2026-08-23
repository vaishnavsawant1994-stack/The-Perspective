# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 084 — Company CRM / Company Directory

Design 084 should become the **canonical Team Workspace Company CRM collection and business-entity directory surface**.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Company ≠ Contact ≠ Lead ≠ Client ≠ Deal ≠ Organization/Tenant ≠ CompanyDomain ≠ CompanyAlias ≠ CompanyRelationship ≠ CompanySearch/ListProjection.**

The central implementation rule is:

> **Company is a stable CRM business-entity identity. Names, domains, aliases, Contacts, Leads, Deals, Client relationships, acquisition evidence and directory/search rows may describe or reference that Company, but none of them replaces its identity. Renaming a Company, changing its website/domain, moving a Contact, converting a Lead, or winning a Deal must never create a new Company implicitly or rewrite historical relationships.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                        | **084**                                                                                                                                            |
| **Canonical name**                   | **Company CRM / Company Directory**                                                                                                                |
| **Product area**                     | Team Workspace / CRM / Companies                                                                                                                   |
| **User surface**                     | **Authenticated Team Workspace**                                                                                                                   |
| **Screen class**                     | CRM Entity Directory / Company Collection Workspace                                                                                                |
| **Classification**                   | **Canonical Company CRM Directory & Business-Entity Identity Anchor**                                                                              |
| **Primary purpose**                  | Discover, filter, review and manage canonical CRM Company identities without conflating them with Leads, Contacts, Clients or tenant Organizations |
| **Primary entity**                   | **Company**                                                                                                                                        |
| **Name/history entity**              | **CompanyAlias / CompanyNameHistory**                                                                                                              |
| **Domain identity evidence**         | **CompanyDomain**                                                                                                                                  |
| **Company-to-company relation**      | **CompanyRelationship**                                                                                                                            |
| **Contact relationship**             | **ContactCompanyRelationship / EmploymentRelationship**                                                                                            |
| **Lead relationship**                | canonical Lead → Company reference                                                                                                                 |
| **Deal relationship**                | canonical Deal → Company/account relation                                                                                                          |
| **Client relationship**              | canonical Client relationship/account linked to Company where applicable                                                                           |
| **Acquisition/admission dependency** | Designs 008–011 / 083                                                                                                                              |
| **Detail companion**                 | Design 085 — Company Detail / Company 360                                                                                                          |
| **Contact CRM companions**           | Designs 086–087                                                                                                                                    |
| **Universal Search dependency**      | Design 079                                                                                                                                         |
| **Audit dependency**                 | Design 039                                                                                                                                         |
| **Primary read model**               | `CompanyDirectoryEntry`                                                                                                                            |
| **Primary query service**            | `CompanyDirectoryQueryService`                                                                                                                     |
| **Identity service**                 | `CompanyIdentityResolutionService`                                                                                                                 |
| **Mutation service**                 | `CompanyService`                                                                                                                                   |
| **Parent shell**                     | `InternalAppShell` — Design 001                                                                                                                    |
| **Auth**                             | Required                                                                                                                                           |
| **Authorization**                    | Active OrganizationMembership + Company/resource permission                                                                                        |
| **Implementation priority**          | **Critical CRM Identity / Dedupe / Relationship Integrity**                                                                                        |
| **Reuse level**                      | **Extremely High across Leads, Contacts, Deals, Clients and acquisition**                                                                          |

Design 084 should answer:

> **“Which canonical Companies exist in this CRM workspace, what are their current safe business identities, which Contacts/Leads/Deals/Client relationships belong to them, and how can I find the correct Company without creating duplicates from alternate names, domains or imported source records?”**

Canonical structure:

```text
Company
   │
   ├── CompanyAlias[]
   ├── CompanyDomain[]
   ├── CompanyRelationship[]
   │
   ├── ContactCompanyRelationship[]
   ├── Lead[]
   ├── Deal[]
   └── Client relationship where applicable
                │
                ↓
       CompanyDirectoryEntry
           read projection
                │
                ↓
           Design 084
```

---

# 2. Reuse

## Design 083 must admit into the same canonical Company identity

Design 083 established explicit CRM admission.

Correct:

```text
ProspectCandidate
      ↓
CRMAdmissionService
      ↓
CompanyIdentityResolutionService
      ↓
existing Company OR create canonical Company
```

Not:

```text
ProspectCandidate
      ↓
create ImportedCompany
      ↓
later migrate into Company CRM
```

There must be no temporary parallel Company backend.

---

## Design 008 source company text does not equal Company

Lead Finder may discover:

> Acme Corporation

as text/evidence.

That is not yet enough to establish a new canonical Company.

Correct:

```text
source observation
      ↓
normalized company evidence
      ↓
Company identity resolution
      ↓
Company
```

---

## Design 009 extraction records remain acquisition evidence

A RawObservation containing:

```text
company = "ACME"
```

does not become `Company ACME`.

The raw evidence remains immutable and may eventually resolve to an existing Company.

---

## Design 010 enrichment must contribute evidence, not replace Company identity

Enrichment may discover:

* website,
* employee size,
* industry,
* domain,
* headquarters,
* social profile.

Those are field proposals/evidence.

They do not create a second Company entity.

---

## Design 011 Lead CRM must reference Company

Lead should conceptually have a canonical relationship:

```text
Lead
  ↓
Company
```

rather than treating:

```text
lead.companyName
```

as the durable company identity.

A display snapshot/string may exist for history/import evidence, but canonical relationships should use `companyId` where resolved.

---

## Design 084 ≠ Design 085

### Design 084

Company collection/discovery.

### Design 085

Exact Company 360/entity detail.

They must share the exact same `Company.id`.

---

## Design 084 ≠ Design 086

### Design 084

Companies.

### Design 086

Contacts.

A Contact's employment at a Company is a relationship between two canonical entities.

It is not ownership of Company identity by the Contact.

---

## Reuse Design 079 for Universal Search

Company search results should point to canonical Company records.

Design 084's own directory filters/search and Design 079 Universal Search can share search projections/adapters, but neither becomes Company truth.

---

## Company ≠ Client

This boundary must remain permanent.

A Company may exist in CRM as:

* prospect,
* target account,
* lead-associated company,
* deal company,

without being a Client.

When commercial conversion occurs:

```text
Company
   ↓
Client relationship/account context
```

can be created/linked.

Do not mutate:

```text
Company.type = CLIENT
```

as a replacement for the Client domain.

---

## Company ≠ tenant Organization

This is one of the most important Design 084 separations.

### Organization/Tenant

Represents the workspace/account using the platform.

### Company

Represents a business entity stored inside that workspace's CRM.

Correct:

```text
Organization/Tenant
"The Perspective Media Group"
       │
       └── CRM Companies
            ├── Acme Corp
            ├── Globex
            └── Example Ventures
```

Do not treat Acme's Company record as another platform tenant merely because it is a company.

---

# 3. Entities

## Company

`Company` should be the stable canonical CRM identity of a business/entity.

Conceptually:

```text
Company
├── id
├── organizationId / tenant scope
├── canonical display name
├── legal/business attributes
├── lifecycle state
├── createdAt
├── updatedAt
├── provenance references
└── revision
```

Exact schema belongs to Phase 3D.

---

## Company ID must survive name changes

Example:

```text
Company CO-100
2026: Acme Technologies
2028: Acme Intelligence
```

The identity remains:

```text
CO-100
```

Do not create another Company solely because the name changed.

---

## Company name ≠ Company identity

Permanent.

Names can be:

* duplicated,
* abbreviated,
* translated,
* misspelled,
* renamed,
* represented differently by different Sources.

---

## CompanyAlias

`CompanyAlias` can preserve alternate/historical names such as:

```text
Acme
Acme Corp.
Acme Corporation
Acme Technologies
```

without creating four Companies.

Conceptually:

```text
CompanyAlias
├── companyId
├── alias
├── normalizedAlias
├── aliasType
├── validFrom
├── validTo
└── provenance
```

---

## Alias ≠ Company

Permanent.

---

## Historical name ≠ duplicate Company

Permanent.

---

## Legal name ≠ display name necessarily

A Company may have:

```text
legalName
displayName
tradingName
```

with appropriate modeling.

Do not overload one mutable `name` field if historical/legal distinctions matter.

---

## CompanyDomain

A domain is useful identity evidence.

Conceptually:

```text
CompanyDomain
├── companyId
├── domain
├── domainType
├── verificationState
├── firstObservedAt
├── lastObservedAt
├── validFrom / validTo
└── provenance
```

---

## CompanyDomain ≠ Company

Permanent.

---

## Domain ≠ guaranteed globally unique Company key

Critical.

Examples:

* subsidiaries can share corporate domains,
* holding companies can share infrastructure,
* companies can have multiple domains,
* acquisitions preserve legacy domains,
* organizations can use third-party email domains.

Therefore:

```text
domain match
=
identity evidence
```

not:

```text
domain match
=
guaranteed same Company
```

---

## One Company can have many domains

Example:

```text
Acme Corp
├── acme.com
├── acme.ai
└── acme.co.uk
```

---

## Domain changes should preserve history

If:

```text
old domain = acme.io
new domain = acme.com
```

do not delete all historical association to `acme.io`.

---

## Primary domain ≠ authentication domain

Design 075 rules remain separate.

CRM CompanyDomain does not authenticate users.

---

## CompanyDomain ≠ tenant domain

A CRM Company's domain must never automatically create or grant access to a platform Organization.

---

## CompanyAlias and CompanyDomain are identity signals

Identity resolution can combine:

* legal name,
* normalized names,
* domains,
* external IDs,
* addresses,
* source profile IDs,
* known relationships.

No one field should become universal identity truth.

---

## External/source ID

Where available, the architecture should preserve provider-specific business IDs separately:

```text
CompanyExternalIdentity
├── provider
├── externalId
└── companyId
```

or equivalent.

Do not store one generic `externalId` assuming every provider uses the same namespace.

---

## Contact ≠ Company

Permanent.

---

## ContactCompanyRelationship / Employment

A Contact's association with a Company should be modeled explicitly.

Conceptually:

```text
ContactCompanyRelationship
├── contactId
├── companyId
├── relationshipType
├── title
├── department
├── startedAt
├── endedAt
├── isCurrent
└── provenance
```

---

## Contact `companyName` ≠ canonical employment relationship

Imported strings can remain evidence.

Once resolved, the canonical relationship uses IDs.

---

## One Company can have many Contacts

Permanent.

```text
Company
├── CEO
├── CFO
├── VP Marketing
├── Director
└── former employees
```

---

## One Contact can have multiple Company relationships

A Contact can have:

* current employer,
* board membership,
* previous employer,
* advisory role.

Do not assume one Contact has one immutable `companyId`.

---

## Employment ≠ Contact identity

Changing jobs does not create a new Contact.

---

## Contact job change ≠ Company rename

Permanent.

---

## Historical employment survives Company changes

If Company changes name/domain:

old Contact employment relationships remain attached to the same Company ID.

---

## Lead ≠ Company

A Company can have:

```text
Company
├── Lead L1
├── Lead L2
└── Lead L3
```

depending on CRM semantics.

Do not make Company itself the Lead.

---

## One Lead can reference Company plus Contact

Conceptually:

```text
Lead
├── companyId
└── contactId where resolved
```

without collapsing either entity.

---

## Lead source-company text may remain historical evidence

If Lead was originally acquired with:

> ACME Technologies

and Company later becomes:

> Acme Intelligence

the current Company link can show current name while the acquisition evidence still retains the historical source value.

---

## Deal ≠ Company

Deal represents a commercial opportunity.

Company represents the business entity involved.

One Company can have multiple Deals.

```text
Company CO-100
├── Deal D-1 — 2026 magazine
├── Deal D-2 — podcast
└── Deal D-3 — renewal
```

---

## Deal stage ≠ Company lifecycle

A lost Deal does not mean the Company is lost/deleted.

---

## Deal won ≠ Company becomes Client by mutation

Winning may create/link a canonical Client relationship/account.

Company itself remains Company.

---

## Client ≠ Company

Design 021 established Client as relationship/account context.

Potential conceptual relationship:

```text
Company
      ↓
ClientAccount / ClientRelationship
```

A Client can expose delivery, contracts, Projects and Portal context while Company remains the underlying CRM business entity.

Exact cardinality belongs to Phase 3D.

---

## Company ≠ Organization/Tenant

Again:

```text
CRM Company
≠
workspace tenant Organization
```

Even when the legal name/domain happens to match.

Automatic identity equivalence is prohibited.

---

## CompanyRelationship

Company-to-company structures should use explicit edges.

Conceptually:

```text
CompanyRelationship
├── fromCompanyId
├── toCompanyId
├── relationshipType
├── directionality
├── effectiveFrom
├── effectiveTo
└── provenance
```

Potential types may include, where product/domain supports them:

* parent,
* subsidiary,
* affiliate,
* partner,
* investor/portfolio relationship.

Do not invent frozen UI controls from these conceptual possibilities.

---

## CompanyRelationship ≠ duplicate identity

Critical.

```text
Parent Company
↕
Subsidiary
```

are two Companies with a relationship.

They should not be merged simply because they share branding/domain.

---

## Parent ≠ owner tenant

A parent/subsidiary CRM relation does not affect platform Organization tenancy.

---

## CompanyRelationship can change over time

Acquisitions/divestitures happen.

Preserve effective history instead of rewriting the past.

---

## Company duplicate detection

Duplicate matching may evaluate:

```text
normalized name
aliases
domains
external IDs
address
location
known Contacts
source evidence
```

But detection creates a proposal/evidence state.

---

## Duplicate detection ≠ automatic merge

Permanent.

Correct:

```text
PossibleCompanyMatch
      ↓
review / governed resolution
```

not:

```text
similarity > threshold
      ↓
DELETE Company B
```

---

## Merge is a governed canonical operation

If Company merging is required:

it should preserve:

* canonical target Company,
* old Company identity/tombstone or merge lineage,
* aliases,
* domains,
* Contacts,
* Leads,
* Deals,
* Client relationships,
* provenance,
* Audit history.

---

## Merge ≠ hard delete

A merged Company should have enough lineage that old references can resolve safely.

---

## Merge target selection must be deliberate

Do not use:

* newest,
* oldest,
* alphabetical,

as uncontrolled automatic canonical choice.

The identity resolver/authorized user/policy determines the surviving Company.

---

## Merge must not rewrite historical snapshots

Historical:

* Proposal recipient,
* ContractParty,
* Invoice recipient,
* communication evidence,

may carry immutable snapshots.

Merging CRM Companies should not rewrite signed/issued historical documents.

---

## Company lifecycle ≠ Client relationship lifecycle

Company may have lifecycle such as:

```text
Active
Inactive
Archived
Merged
```

while Client relationship has its own:

* onboarding,
* active,
* renewal,
* closed,

semantics.

Do not combine them.

---

## Company lifecycle ≠ Lead status

Permanent.

---

## Company lifecycle ≠ Deal stage

Permanent.

---

## CompanySearch/ListProjection

Design 084's directory rows should be read projections.

Conceptually:

```text
CompanyDirectoryEntry
├── companyId
├── displayName
├── safe domain
├── industry
├── location
├── contactCount
├── openLeadCount
├── activeDealCount
├── clientRelationshipSummary
└── current safe status
```

where frozen design includes those fields.

---

## ListProjection ≠ Company entity

Permanent.

Counts, summaries and display fields may be derived/materialized.

They must not be independently edited as business truth.

---

## Company search rank ≠ Company importance

Design 079 ranking semantics remain separate.

---

## Company counts are projections

Examples:

```text
contacts = 12
open leads = 3
deals = 5
```

must derive from canonical relationships and consistent authorization.

Do not maintain arbitrary frontend counters.

---

# 4. Permissions

Design 084 should conceptually separate:

```text
company.read
company.create
company.edit
company.archive
company.identity.manage
company.alias.manage
company.domain.manage
company.relationship.manage
company.merge
company.provenance.read
company.sensitiveFields.read
```

Exact permission keys belong to Phase 3D.

---

## Company read ≠ edit

Permanent.

---

## Company edit ≠ merge

Critical.

Merging Company identities is far more destructive than changing a display field.

It needs dedicated authority.

---

## Company edit ≠ domain verification

Changing a website string is not the same as verifying ownership/association of a domain.

---

## Company manage ≠ Contact manage

A user allowed to update Company information should not automatically edit Contact profiles/employment relationships.

---

## Company manage ≠ Lead manage

Same.

---

## Company manage ≠ Deal manage

Same.

---

## Company manage ≠ Client admin

Company CRM access does not confer Client Portal or Client account administration.

---

## Company permission ≠ tenant Organization admin

Critical.

A CRM administrator managing Company records must not gain:

* workspace settings,
* users/roles,
* billing,
* Organization-level admin.

Designs 037/040/145 remain separate.

---

## Tenant scope

Every Company must be scoped to the platform Organization/Workspace that owns that CRM record.

Conceptually:

```text
Company.organizationId
```

is tenancy.

It is **not** the Company itself.

---

## Same external Company can exist in separate tenants

If two separate media organizations use the platform:

```text
Tenant A → Company Acme
Tenant B → Company Acme
```

these are separate CRM records unless the platform deliberately introduces a global shared entity layer, which is not being added here.

---

## Direct Company ID requires current authorization

Knowing `companyId` is not entitlement.

---

## Directory search/filter must remain permission-scoped

Counts/results must not leak restricted Companies.

---

## Sensitive fields can have finer permissions

Potential sensitive CRM fields:

* private internal notes,
* commercial value,
* relationship owner,
* source/provenance,
* contact details.

Directory projection should return only permitted fields.

---

## Merge reauthorizes every affected Company

If merging A into B:

the actor must be authorized for both records and relevant related data policy.

---

## Cross-tenant merge prohibited

Absolute.

---

## CompanyRelationship creation needs both-end validation

Both Companies must belong to the correct tenant and be authorized.

---

## Domain tampering

A user cannot attach another tenant's CompanyDomain by passing its ID.

Every relationship mutation revalidates ownership.

---

## CRM admission permissions

Design 083 import service cannot create/link a Company unless the import actor/system intent has appropriate Company admission permission.

---

## Search visibility

Design 079 Universal Search only indexes/returns Company fields allowed by search policy.

---

# 5. States

Design 084 should keep **Company lifecycle, data-quality state, duplicate-resolution state, domain state, CRM relationship state and directory-query state** separate.

### Company lifecycle

Conceptually:

```text
Active
Inactive
Archived
Merged
```

where applicable.

### Data-quality state

```text
Complete
Incomplete
Needs Review
Conflicting Data
```

where derived/needed.

### Duplicate-resolution state

```text
No Known Duplicate
Possible Duplicate
Duplicate Review Required
Merge In Progress
Merged
Resolution Unavailable
```

### Domain state

```text
No Domain
Observed
Unverified
Verified
Legacy
Conflicting
```

### Client relationship state

Separate, for example:

```text
No Client Relationship
Client Relationship Exists
```

without converting Company lifecycle into Client lifecycle.

### Directory/query state

```text
Loading
Available
Empty
Filter Empty
Partial Results
Failed
```

These must not become one `company.status`.

---

## Active Company ≠ active Client

Permanent.

---

## Inactive Company ≠ lost Lead

Permanent.

---

## Archived Company ≠ deleted history

Permanent.

---

## Merged Company ≠ hard deleted Company

Permanent.

---

## Possible duplicate ≠ duplicate confirmed

Permanent.

---

## Duplicate confirmed ≠ merge completed

Permanent.

---

## Domain verified ≠ Company verified globally

A domain association can be verified while other Company attributes remain uncertain.

---

## Domain missing ≠ Company invalid

Permanent.

---

## Company name changed ≠ Company recreated

Permanent.

---

## Company domain changed ≠ Company recreated

Permanent.

---

## Company client relationship ended ≠ Company archived automatically

Permanent.

---

## No Contacts ≠ Company invalid

A Company can exist before any Contact is known.

---

## No Leads ≠ Company inactive

Permanent.

---

## No Deals ≠ Company invalid

Permanent.

---

## Zero Contact count ≠ Contact service unavailable

Critical.

---

## Zero Deal count ≠ Deal service unavailable

Critical.

---

## Partial enrichment ≠ absent Company data

Unknown/unavailable fields remain explicit.

---

## Duplicate resolver outage ≠ no duplicates

Critical.

---

## State Coverage

Design 084 inherits Design 150 plus:

```text
Companies Loading
Companies Available
Companies Empty
Companies Filter Empty
Companies Partial Results
Company Directory Failed

Company Active
Company Inactive
Company Archived
Company Merged

Company Data Complete
Company Data Incomplete
Company Needs Review
Company Data Conflict

No Known Duplicate
Possible Company Duplicate
Duplicate Review Required
Duplicate Resolution Unavailable
Merge Processing
Company Merged

Company Domain Missing
Company Domain Observed
Company Domain Unverified
Company Domain Verified
Company Domain Legacy
Company Domain Conflict

No Client Relationship
Client Relationship Exists

Contact Count Available
Contact Count Unavailable
Lead Count Available
Lead Count Unavailable
Deal Count Available
Deal Count Unavailable

Company Updated Elsewhere
Company No Longer Accessible
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize efficient Company discovery and CRM context.

Conceptually:

```text
Company Directory
↓
Search / filters if frozen
↓
Company rows
    ├── Company identity
    ├── safe domain
    ├── industry / location
    ├── Contact summary
    ├── Lead/Deal summary
    ├── Client relationship indicator
    ├── owner/state where frozen
    └── canonical Company action
```

Only fields actually present in the frozen Design 084 should render.

---

## Company identity should remain primary

Do not make a Lead name or Contact name visually appear to be the canonical Company identity.

---

## Domain should be secondary evidence

Avoid layouts that make:

> acme.com

look like the record's database identity.

The Company name/entity remains primary.

---

## Client relationship should not replace Company state

If frozen design shows a Client indicator:

use it as a relationship signal such as:

> Client

not as the Company's sole lifecycle state.

---

## Counts should remain contextual

Examples:

* Contacts 12
* Open Leads 3
* Deals 5

are derived summaries.

They should not be editable inline.

---

## Tablet

Following Design 152:

* directory rows can reflow into cards,
* Company name remains first,
* domain/industry/location follow,
* related counts compact,
* status and duplicate-warning state remain visible.

---

## Mobile

Priority:

```text
Company
↓
Canonical Company Name
↓
Domain / industry
↓
Relationship summary
├── Contacts
├── Leads
└── Deals
↓
Company lifecycle / quality indicator
↓
Open Company
```

No wide CRM spreadsheet compressed into a phone.

---

## Mobile duplicate warning

If duplicate state appears in frozen design:

use explicit:

> Possible duplicate company

not icon/color only.

---

## Long Company names

Support:

* wrapping,
* accessible truncation,
* stable secondary metadata.

Do not make long legal names cause horizontal overflow.

---

## Domain display

Strip unsafe/noisy URL presentation where appropriate and never expose query credentials/tokens.

---

## Accessibility

A directory row should communicate something equivalent to:

> Acme Corporation. Technology company. Primary domain acme.com. 12 Contacts, 3 open Leads, 2 active Deals. Active Company. Open Company.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical Company architecture

```text
Design 084
    ↓
Authenticated Workspace Context
    ↓
CompanyDirectoryQueryService
    │
    ├── Company
    ├── canonical display identity
    ├── CompanyAlias summary
    ├── CompanyDomain summary
    ├── Contact relationship counts
    ├── Lead counts
    ├── Deal counts
    ├── Client relationship summary
    └── duplicate/data-quality signals
    ↓
CompanyDirectoryEntry[]
```

---

## Company repository

Canonical mutations should target:

```text
CompanyRepository
```

or equivalent domain/service boundary.

Directory/search read models must not become mutation endpoints.

---

## Company identity resolution service

Designs 083 and 084 should share:

```text
CompanyIdentityResolutionService
```

Conceptually:

```text
resolveCompanyIdentity(
    normalizedName,
    aliases,
    domains,
    external IDs,
    source evidence,
    address/context
)
```

returning something like:

```text
EXACT_EXISTING
LIKELY_EXISTING
AMBIGUOUS
NEW_COMPANY_ALLOWED
REVIEW_REQUIRED
```

rather than blindly creating records.

---

## Company identity resolver must be tenant-scoped

Never match private Companies across tenants by default.

---

## Normalized name index

Useful for candidate matching/search:

```text
normalizedCompanyName
```

but it is an index/evidence field.

It is not canonical identity.

---

## Alias index

Company aliases should contribute to:

* search,
* duplicate detection,
* admission resolution.

---

## Domain normalization

Store normalized host/domain representation appropriately:

```text
www.acme.com
https://acme.com/
ACME.COM
```

may normalize to:

```text
acme.com
```

while preserving source evidence where needed.

---

## Domain normalization ≠ domain verification

Permanent.

---

## Domain verification

If the system has verification semantics:

store method/evidence/timestamp separately.

Do not mark verified simply because an extraction source returned the domain.

---

## Historical domain records

When replacing primary domain:

keep prior domain association as:

* legacy,
* historical,
* secondary,

according to policy.

---

## Company creation command

Prefer narrow command:

```text
createCompany(...)
```

which:

1. authorizes;
2. normalizes identity evidence;
3. invokes duplicate resolver;
4. creates canonical Company if safe;
5. records provenance;
6. emits events.

---

## Company update command

Use explicit allowlisted fields.

Avoid unrestricted generic:

```text
PATCH /company/:id
{ any database field }
```

---

## Optimistic concurrency

Company profile edits should use:

* version/revision,
* `updatedAt` precondition,
* or equivalent.

Prevent one user silently overwriting another's recent update.

---

## Name change

Conceptually:

```text
changeCompanyName()
```

may:

* update current display/legal name,
* preserve former name as historical alias,
* audit change.

Do not rewrite historical Contracts/Invoices/Deals.

---

## CompanyAlias service

Use controlled commands such as:

```text
addCompanyAlias()
retireCompanyAlias()
```

rather than copying alias strings into arbitrary related records.

---

## CompanyDomain service

Conceptually:

```text
addCompanyDomain()
setPrimaryCompanyDomain()
verifyCompanyDomain()
retireCompanyDomain()
```

where supported.

---

## Domain uniqueness constraints must be nuanced

Do **not** blindly enforce:

```text
UNIQUE(domain)
```

globally across all Companies if real business structures can share domains.

At minimum uniqueness is tenant-aware, and even tenant-scoped exclusivity may need exceptions/relationship review.

Exact constraint Phase 3D.

---

## ContactCompanyRelationship service

Employment/association should use explicit relationship commands.

Conceptually:

```text
linkContactToCompany()
updateEmploymentRelationship()
endEmploymentRelationship()
```

Do not update Company identity when Contact changes title.

---

## Contact transfer/job change

Correct:

```text
Contact C1
Company A relationship → ended
Company B relationship → started
```

not:

```text
Contact's Company record renamed from A to B
```

---

## Lead association

Lead should reference canonical Company ID.

If an unresolved Lead initially has company text:

later Company resolution can link it without deleting original acquisition evidence.

---

## Deal association

Deals should reference Company using canonical identity plus historical snapshots where needed for documents/reporting.

---

## Client conversion

When Deal/Lead becomes Client:

```text
Company
   ↓
Client relationship/account
```

should preserve the same Company ID.

No Company duplication during handoff.

Design 106 later must reuse this.

---

## CompanyRelationship service

Typed relationship edges should validate:

* both Companies exist,
* same tenant,
* no invalid self-link unless explicitly supported,
* relationship type constraints,
* duplicate edge handling,
* temporal validity.

---

## Relationship cycles

For hierarchical relations such as parent/subsidiary:

backend should detect impossible/unwanted cycles where applicable.

---

## Company merge service

If merge is supported, use a dedicated service:

```text
CompanyMergeService.merge(sourceCompany, targetCompany)
```

not generic delete.

The transaction should reconcile:

* aliases,
* domains,
* Contact relationships,
* Leads,
* Deals,
* Client links,
* provenance,
* search projections,
* duplicate records.

---

## Merge lineage

Preserve:

```text
MergedCompanyRedirect
sourceCompanyId
targetCompanyId
mergedAt
mergedBy
```

or equivalent.

Old identifiers should resolve safely rather than break historical links.

---

## Merge collision handling

If both Companies have:

* primary domains,
* conflicting legal names,
* duplicate Contact relationships,
* multiple Client relationships,

the merge policy must resolve explicitly.

Do not simply copy all values blindly.

---

## Merge concurrency

Company merge needs strong transaction/concurrency controls.

No other process should concurrently:

* admit a Candidate into source Company,
* change domains,
* create relationships,

without safe reconciliation.

---

## Company merge vs CRM document history

Never rewrite historical snapshots in:

* ContractVersion,
* Invoice,
* Proposal,
* executed artifacts.

Those retain the identity/evidence captured at issuance.

Canonical current Company linkage can still point to merged target where appropriate.

---

## Provenance

Company fields should retain evidence lineage from:

* acquisition Source,
* enrichment,
* import/review,
* manual CRM edits.

---

## Manual CRM edit provenance

A human edit should be identified as such.

Do not pretend changed industry/domain/name came from original Source.

---

## Directory projection

`CompanyDirectoryEntry` should be:

* permission-safe,
* reconstructable,
* source-derived,
* optimized for listing.

It should never accept direct business mutations.

---

## Company counts

Counts such as:

```text
contactCount
openLeadCount
activeDealCount
```

should derive via:

* aggregate query,
* maintained projection,
* materialized read model.

They must remain source-derived.

---

## Count authorization

If user cannot read restricted Deals:

the Deal count must not leak their existence unless policy explicitly permits aggregate visibility.

---

## Partial aggregate failure

Example:

```text
Company core       ✓
Contact count      ✓
Lead count         ✓
Deal count         ✕
```

Return:

> Deal count unavailable

not:

> 0 Deals.

---

## Pagination

Directory should use indexed cursor pagination at scale.

Likely useful indexes include:

* organizationId + normalized company name,
* organizationId + lifecycle,
* organizationId + domain,
* owner/industry/createdAt where frozen filters require them.

Exact indexes Phase 3D.

---

## Sorting

Stable deterministic secondary sort is needed when names/scores tie.

---

## Universal Search integration

Design 079 index document should use:

```text
sourceType = COMPANY
sourceId = companyId
```

and safe aliases/domains for retrieval.

Search document remains disposable.

---

## Search index updates

Events such as:

```text
CompanyCreated
CompanyRenamed
CompanyAliasAdded
CompanyDomainChanged
CompanyArchived
CompanyMerged
```

should update/invalidate the search index.

---

## Design 083 admission integration

Company admission from extraction should invoke the same identity resolver and Company service.

No direct SQL/company creation inside import worker.

---

## Design 085 detail reuse

Company Detail should load the same canonical Company and relationship services, not create a separate Company 360 record.

---

## Audit

Material events:

```text
CompanyCreated
CompanyUpdated
CompanyRenamed
CompanyArchived
CompanyAliasAdded
CompanyDomainChanged
CompanyRelationshipCreated
CompanyMerged
```

should produce appropriate Audit history.

---

## Activity ≠ Audit

If CRM activity later shows:

> Company renamed

that is a user-facing operational projection.

Design 039 Audit remains governance evidence.

---

## Backend Requirement Matrix

| Requirement                                       | Status                |
| ------------------------------------------------- | --------------------- |
| Authenticated Team Workspace                      | **Critical**          |
| Tenant/Organization isolation                     | **Critical**          |
| Canonical Company entity                          | **Critical**          |
| Stable Company ID                                 | **Critical**          |
| Company/name separation                           | **Critical**          |
| Company/Organization-Tenant separation            | **Critical**          |
| Company/Client separation                         | **Critical**          |
| Company/Lead separation                           | **Critical**          |
| Company/Contact separation                        | **Critical**          |
| Company/Deal separation                           | **Critical**          |
| CompanyAlias entity/history                       | **Critical**          |
| Rename preserves identity                         | **Critical**          |
| CompanyDomain entity                              | **Critical**          |
| Domain/Company identity separation                | **Critical**          |
| Multi-domain Company support                      | **Critical**          |
| Historical/legacy domain support                  | **Critical**          |
| Domain normalization                              | **Required**          |
| Domain verification separate from normalization   | **Critical**          |
| No unsafe global domain uniqueness assumption     | **Critical**          |
| ContactCompanyRelationship model                  | **Critical**          |
| Current/historical employment support             | **Critical**          |
| One Company → many Contacts                       | **Critical**          |
| One Contact → multiple Company relationships      | **Critical**          |
| Lead → canonical Company relation                 | **Critical**          |
| Multiple Leads per Company                        | **Critical**          |
| Deal → canonical Company relation                 | **Critical**          |
| Multiple Deals per Company                        | **Critical**          |
| Company→Client relationship reuse                 | **Critical**          |
| CRM Company/tenant Organization isolation         | **Critical**          |
| CompanyRelationship typed edges                   | **Required**          |
| CompanyRelationship/merge separation              | **Critical**          |
| Duplicate detection/merge separation              | **Critical**          |
| Company identity resolver                         | **Critical**          |
| Tenant-scoped duplicate matching                  | **Critical**          |
| Explainable identity evidence                     | **Critical**          |
| Design 083 admission reuses resolver              | **Critical**          |
| Existing Company reuse during import              | **Critical**          |
| Duplicate Company prevention                      | **Critical**          |
| Dedicated merge authority                         | **Critical**          |
| Merge not hard delete                             | **Critical**          |
| Merge lineage/redirect                            | **Critical**          |
| Merge preserves Contacts/Leads/Deals/Client links | **Critical**          |
| Merge preserves provenance                        | **Critical**          |
| Merge does not rewrite historical snapshots       | **Critical**          |
| Company update optimistic concurrency             | **Critical**          |
| Allowlisted mutation commands                     | **Critical**          |
| Field provenance/manual edit lineage              | **Required**          |
| CompanyDirectoryEntry as projection               | **Critical**          |
| Directory projection/source separation            | **Critical**          |
| Permission-aware counts                           | **Critical**          |
| Zero/unavailable count separation                 | **Critical**          |
| Cursor pagination/indexing                        | **Required at scale** |
| Design 079 Universal Search reuse                 | **Critical**          |
| Design 085 same Company identity                  | **Critical**          |
| Designs 086–087 same Contact/Company relations    | **Critical**          |
| Audit integration                                 | **Required**          |
| Partial aggregate/service failure handling        | **Critical**          |

---

# 8. Consolidation

Design 084 exposes several major CRM identity risks.

**Company / company-name string conflation**
Every spelling variation creates another Company.

**Company / Source observation conflation**
Acquired company text becomes canonical CRM identity immediately.

**Company / ProspectCandidate conflation**
Prospect discovery creates business entity without resolution.

**Company / Contact conflation**
One employee becomes the Company record.

**Contact employment / Company identity conflation**
Contact changing employer mutates Company identity.

**Company / Lead conflation**
Every Company is treated as one Lead.

**Lead company text / Company identity conflation**
CRM relationships break after renames.

**Company / Deal conflation**
Commercial opportunity state mutates Company lifecycle.

**Lost Deal / inactive Company conflation**
One unsuccessful sale removes the business entity.

**Company / Client conflation**
Prospect Company becomes Client simply by changing Company status.

**Client offboarding / Company deletion conflation**
Historical CRM business identity disappears.

**Company / Organization-Tenant conflation**
External CRM business gets platform workspace privileges.

**Matching email domain / tenant access conflation**
Company domain creates authentication/Organization membership.

**Tenant Organization name / Company name conflation**
Platform's own company and a CRM Company are silently merged.

**CompanyDomain / Company identity conflation**
Changing domain creates another Company.

**Domain uniqueness / legal identity conflation**
Parent/subsidiary sharing domain are merged incorrectly.

**Domain normalized / domain verified conflation**
Formatting cleanup becomes proof of ownership.

**New primary domain / historical domain deletion**
Old provenance and Contact evidence disappears.

**CompanyAlias / duplicate Company conflation**
Historical/trading names create multiple businesses.

**Rename / recreate conflation**
Relationships split across old/new Company IDs.

**Legal name / display name conflation**
Current display preference rewrites legal/historical identity.

**CompanyRelationship / duplicate identity conflation**
Parent and subsidiary are merged.

**Parent relationship / tenant hierarchy conflation**
CRM hierarchy changes workspace authorization.

**Relationship change / Company identity rewrite**
Acquisitions/divestitures destroy historical edges.

**Possible duplicate / confirmed duplicate conflation**
Fuzzy matcher creates destructive merge.

**Duplicate detection / merge conflation**
High similarity automatically deletes one Company.

**Merge / hard delete conflation**
Old Company IDs and lineage break.

**Merge / historical document rewrite conflation**
Executed Contracts/Invoices change party names retroactively.

**Merge target / arbitrary record choice conflation**
Canonical identity selected by age/alphabetical order.

**Merge / field copy-all conflation**
Conflicting domains/names/relationships are duplicated blindly.

**Company status / Client status conflation**
CRM and service relationship lifecycles become one enum.

**Company status / Lead status conflation**
Lead qualification drives Company existence.

**Company status / Deal stage conflation**
Pipeline transitions mutate business identity.

**Contact count / Contact truth conflation**
Derived summary becomes mutable number.

**Zero Contacts / unavailable aggregation conflation**
Service outage appears as no known people.

**Zero Deals / unavailable conflation**
Commercial data outage appears as no opportunities.

**Directory row / Company entity conflation**
Read-model fields become directly editable truth.

**List projection / duplicate backend conflation**
Directory maintains its own Company copies.

**Universal Search result / Company truth conflation**
Search index becomes CRM backend.

**Design 083 import / Company creation bypass**
Import workers create Companies without canonical identity resolution.

**Same name / same Company conflation**
Different legitimate companies collapse.

**Punctuation difference / different Company conflation**
Same business duplicates.

**Cross-tenant duplicate resolution**
One customer's CRM data influences another tenant's Company identity.

**Company edit / merge permission conflation**
Normal CRM editor can perform destructive identity merges.

**Company admin / tenant admin conflation**
CRM access grants workspace administration.

**Company edit / Contact edit conflation**
Company manager changes employee identity/data without permission.

**Company read / sensitive commercial visibility conflation**
Directory leaks Deal/client values.

**Alias/domain IDs / tenant validation omission**
Cross-tenant relationship tampering becomes possible.

**Company merge concurrency**
New Lead/Contact relationships attach to losing Company mid-merge.

**CRM admission race**
Two imported Candidates create duplicate Companies simultaneously.

**084/083 duplicate Company identity resolver**
Directory and import disagree about duplicate Companies.

**084/085 duplicate Company backend**
Directory and detail use separate records.

**084/086 duplicate employment model**
Contact CRM stores independent company strings.

**084/011 duplicate Lead-company linkage**
Lead CRM and Company CRM disagree on account identity.

No additional screen is required.

These are **Company identity, naming/domain evidence, tenant separation, Contact employment, Lead/Deal/Client relationships, duplicate resolution, merge safety, provenance and directory-projection requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL COMPANY CRM DIRECTORY & BUSINESS-ENTITY IDENTITY ANCHOR**

**Domain directive:**
**Company ≠ Contact ≠ Lead ≠ Client ≠ Deal ≠ Organization/Tenant ≠ CompanyDomain ≠ CompanyAlias ≠ CompanyRelationship ≠ CompanySearch/ListProjection.**

**Identity directive:**
Company is the stable canonical CRM business-entity identity. Names, domains, aliases, Contacts, Leads, Deals and imported source strings describe/reference it but never replace its identity.

**Tenant directive:**
CRM Company is always distinct from the platform's Organization/Tenant. A Company's name, website or email domain must never create a workspace tenant, membership or authorization relationship.

**Name directive:**
Company identity survives legal/display/trading-name changes. Historical and alternate names are preserved through CompanyAlias/name-history semantics rather than duplicate Company creation.

**Domain directive:**
CompanyDomain is an associated identity/evidence record, not the Company's primary key. One Company may have many current/historical domains, and domain matching alone cannot guarantee legal/entity identity.

**Domain-history directive:**
domain changes preserve legacy/historical associations instead of rewriting source, Lead or Contact history.

**Authentication directive:**
CRM Company domains are unrelated to AuthenticationIdentity or Client Portal access unless a separately governed identity/access system explicitly uses them. Design 084 never infers Portal authority from domain ownership.

**Contact directive:**
Contacts remain canonical people. Their employment/association with Companies is modeled through explicit temporal ContactCompanyRelationship records; changing employment never recreates the Contact or Company.

**Lead directive:**
Leads remain canonical Sales CRM entities and reference Companies where resolved. Company name strings acquired before resolution remain evidence rather than durable identity.

**Deal directive:**
Deals remain opportunity entities linked to Company/account context. Deal stage/loss/win never determines Company identity or existence.

**Client directive:**
Client remains the commercial/service relationship established in Designs 021+ and linked to Company where appropriate. A Company does not become a Client merely by changing a generic Company status.

**Admission directive:**
Design 083 must always use the same CompanyIdentityResolutionService before Company creation/linking. Repeated acquisition/import must reuse existing canonical Companies rather than create duplicates.

**Duplicate directive:**
duplicate detection creates explainable match evidence only. Names, aliases, domains and fuzzy similarity never cause an uncontrolled destructive merge.

**Merge directive:**
Company merge, when required, is a separately authorized canonical operation preserving merge lineage, old identifiers, aliases, domains, Contacts, Leads, Deals, Client relationships and provenance.

**Historical-evidence directive:**
Company rename/domain change/merge never rewrites immutable historical Proposal, Contract, Invoice, payment, signer or other issued-document snapshots.

**Relationship directive:**
parent, subsidiary, affiliate or other Company-to-Company relations remain typed temporal relationships, not identity equivalence.

**Lifecycle directive:**
Company lifecycle remains separate from Lead status, Deal stage, Client lifecycle, duplicate-resolution state and domain-verification state.

**Directory directive:**
Design 084's CompanyDirectoryEntry is a permission-safe read projection derived from canonical Company and relationship data. It can be materialized for performance but never becomes independently editable source truth.

**Count directive:**
Contact/Lead/Deal counts and other aggregates are source-derived and permission-aware; unavailable aggregate data must never silently become zero.

**Authorization directive:**
Company read, edit, archive, identity/domain/alias management, CompanyRelationship management and merge authority remain separately enforceable. CRM Company administration never grants Organization/Tenant administration.

**Concurrency directive:**
Company updates, admission and merge operations require revision/transactional protection so simultaneous import, relationship mutation or merge cannot split canonical identity.

**Provenance directive:**
Company fields and identity evidence should preserve lineage from extraction, CRM admission, enrichment and manual edits while keeping current canonical values separate from historical evidence.

**Search directive:**
Design 079 may index safe Company aliases/domains and current directory metadata using canonical Company IDs, but SearchIndexDocuments remain disposable projections.

**Detail directive:**
Design 085 must use the exact same Company identity and relationship services; Company Directory and Company 360 are two projections over one entity, not separate records.

**Contact-CRM directive:**
Designs 086–087 must reuse the same ContactCompanyRelationship/employment foundation instead of storing isolated company-name strings as canonical employment truth.

**Future conversion directive:**
later won-deal/client-handoff workflows, especially Design 106, must preserve the same Company identity while creating/linking Client relationship context rather than duplicating the business entity.

**Audit directive:**
Company creation, rename, alias/domain changes, archive, relationship changes and merge operations generate appropriate Audit evidence independently from CRM activity/provenance projections.

**Failure directive:**
Company core data, duplicate resolution, Contact/Lead/Deal aggregates, enrichment and search indexing may fail independently. `Unavailable` must never become `No Contacts`, `No Deals`, `No Duplicate`, or a different Company identity.

**Overlap directive:**
Designs **008–011, 021, 079, 083–087 and later 106** must ultimately share one stable Company identity and relationship foundation while preserving ProspectCandidate, Contact, Lead, Deal, Client and tenant Organization as distinct entities.

**Consolidation directive:**
**STANDARDIZE ONE CANONICAL COMPANY CRM FOUNDATION — STABLE TENANT-SCOPED COMPANY IDENTITY + HISTORICAL/ALTERNATE COMPANYALIASES + MULTI-DOMAIN COMPANYDOMAIN EVIDENCE + TEMPORAL CONTACT-COMPANY EMPLOYMENT RELATIONSHIPS + CANONICAL LEAD/DEAL/CLIENT LINKS + EXPLAINABLE COMPANY IDENTITY RESOLUTION + GOVERNED NON-DESTRUCTIVE DUPLICATE/MERGE WORKFLOW + PROVENANCE-PRESERVING ADMISSION — AND NEVER ALLOW A COMPANY NAME, DOMAIN, CONTACT EMPLOYMENT, LEAD STRING, DEAL STATE, CLIENT STATUS, SEARCH ROW OR PLATFORM TENANT RECORD TO BECOME COMPANY IDENTITY BY ACCIDENT.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **84 / 153** |
| **PASS**                                   |                         **84** |
| **STANDARDIZE decisions**                  |                         **82** |
| **Potential implementation-overlap flags** |                         **75** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**84 / 153 = 54.9% audited.**

### Canonical Company architecture after Design 084

```text
                    ORGANIZATION / TENANT
                     platform workspace
                            │
                            │ owns CRM data
                            ↓
                         COMPANY
                    canonical CRM identity
                            │
      ┌─────────────────────┼─────────────────────┐
      ↓                     ↓                     ↓
 CompanyAlias[]       CompanyDomain[]      CompanyRelationship[]
      │                     │                     │
      │                     │                     │
      └──────────────┬──────┴──────────────┬──────┘
                     ↓                     ↓
            Contact Relationships        Leads
                     │                     │
                     ↓                     ↓
                  Contacts               Deals
                                           │
                                           ↓
                                  Client Relationship
```

But:

```text
Company
≠
Organization/Tenant

Company
≠
Client

Company
≠
Lead

Company
≠
Contact
```

The Company ID is the stable CRM anchor tying those relationships together.

The acquisition/admission path is now:

```text
RawObservation
      ↓
NormalizedRecord
      ↓
ProspectCandidate
      ↓
Duplicate / Identity Resolution
      ↓
ReviewDecision
      ↓
ImportRecord
      ↓
CompanyIdentityResolutionService
      │
      ├── Existing Company → LINK
      │
      └── No safe match    → CREATE
      ↓
Canonical Company
```

And the critical identity rule remains:

```text
Name changed       → SAME COMPANY
Domain changed     → SAME COMPANY
Contact changed job→ CONTACT RELATIONSHIP CHANGES
Deal lost          → SAME COMPANY
Client relationship ended → SAME COMPANY

None require a new Company identity.
```

# Next Sequential Audit Target

## **Design 085 — Company Detail / Company 360**

The next audit should preserve the Company-detail composition boundary:

> **Company ≠ CompanyProfileProjection ≠ ContactCompanyRelationship ≠ Contact ≠ Lead ≠ Deal ≠ ClientRelationship ≠ ActivityEvent ≠ Note ≠ Task ≠ CompanyDomain/Alias ≠ CompanyRelationship.**

It should reconcile Design **084's canonical Company identity** with Leads, Contacts, Deals and Client context while preserving:

* Company 360 is a composition/read workspace, not a second Company entity,
* Company profile data ≠ Contacts/Leads/Deals owned records,
* Contact employment/history remains relational rather than embedded Company data,
* Lead and Deal lifecycle remain their own domains,
* Client relationship/account state remains separate from Company identity,
* Company notes/tasks/activity do not become Company fields,
* domain/alias/history remain identity evidence rather than mutable Company keys,
* sensitive sections require their own source permissions,
* partial failure in one related domain must not make the Company appear missing.

The sequence continues strictly with **Design 085 only next**, under the unchanged audit contract.
