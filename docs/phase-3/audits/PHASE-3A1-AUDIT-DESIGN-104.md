# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 104 — Products & Packages Library

Design 104 should become the **canonical Team Workspace commercial catalog discovery and offer-configuration library** for reusable Products, Packages, package composition, catalog pricing, availability, and commercial defaults used by Proposals, Contracts, and Invoices.

It must preserve the commercial-history boundary already established throughout Designs 018, 097–103:

> **Current catalog configuration must never rewrite historical Proposal, Contract, or Invoice terms.**

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Product ≠ ProductVersion/OfferingDefinition ≠ Package ≠ PackageVersion ≠ PackageItem ≠ Price/PriceBookEntry ≠ Currency ≠ Availability ≠ Discount/CommercialOverride ≠ ProposalLineSnapshot ≠ ContractTermsSnapshot ≠ InvoiceLine.**

The central implementation rule is:

> **Products and Packages are reusable catalog identities, not historical commercial documents. Their editable definitions, composition, pricing, descriptions, deliverables, and availability may evolve over time, but every ProposalVersion, ContractVersion, and issued Invoice must preserve the exact commercial snapshot that applied when that document was created or issued. Updating today's catalog can influence future sales only—it can never retroactively rewrite what was proposed, agreed, signed, or billed.**

---

# 1. Classification

| Audit field                      | Classification                                                                                                                                            |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                    | **104**                                                                                                                                                   |
| **Canonical name**               | **Products & Packages Library**                                                                                                                           |
| **Product area**                 | Team Workspace / Sales / Commercial Catalog                                                                                                               |
| **User surface**                 | **Authenticated Team Workspace**                                                                                                                          |
| **Screen class**                 | Commercial Catalog / Product & Package Collection Workspace                                                                                               |
| **Classification**               | **Canonical Product, Package, Catalog Pricing & Commercial Offering Library Anchor**                                                                      |
| **Primary purpose**              | Discover and manage reusable commercial offerings and package configurations without turning catalog data into historical Proposal/Contract/Invoice truth |
| **Primary catalog entity**       | **Product**                                                                                                                                               |
| **Product definition/version**   | **ProductVersion / OfferingDefinition** where versioning is required                                                                                      |
| **Package entity**               | **Package**                                                                                                                                               |
| **Package definition/version**   | **PackageVersion**                                                                                                                                        |
| **Package composition relation** | **PackageItem**                                                                                                                                           |
| **Pricing entity**               | **Price / PriceBookEntry**                                                                                                                                |
| **Currency**                     | explicit commercial currency context                                                                                                                      |
| **Availability**                 | catalog availability/sellability projection or policy                                                                                                     |
| **Proposal dependency**          | Designs 018 / 097–098                                                                                                                                     |
| **Contract dependency**          | Designs 019 / 099–100                                                                                                                                     |
| **Invoice dependency**           | Designs 020 / 101–103                                                                                                                                     |
| **Deal dependency**              | Designs 016–017 / 096                                                                                                                                     |
| **Upcoming detail dependency**   | Design 105                                                                                                                                                |
| **Library projection**           | `CatalogEntry / ProductPackageListEntry`                                                                                                                  |
| **Primary query service**        | `CommercialCatalogQueryService`                                                                                                                           |
| **Product service**              | `ProductCatalogService`                                                                                                                                   |
| **Package service**              | `PackageCatalogService`                                                                                                                                   |
| **Pricing service**              | `CatalogPricingService`                                                                                                                                   |
| **Availability resolver**        | `CatalogAvailabilityResolver`                                                                                                                             |
| **Snapshot service**             | `CommercialSnapshotService`                                                                                                                               |
| **Parent shell**                 | `InternalAppShell` — Design 001                                                                                                                           |
| **Auth**                         | Required                                                                                                                                                  |
| **Authorization**                | Active OrganizationMembership + catalog/product/package/pricing permissions                                                                               |
| **Implementation priority**      | **Critical Commercial Source-of-Truth / Historical Snapshot Integrity**                                                                                   |
| **Reuse level**                  | **Extremely High across Proposals, Contracts, Invoices, Sales and Reporting**                                                                             |

Design 104 should answer:

> **“Which Products and Packages are currently available for future commercial use, what does each offering contain, which catalog version/pricing currently applies, and which offerings can Sales use—without implying that changing the catalog changes existing Proposals, Contracts, or Invoices?”**

Canonical composition:

```text
COMMERCIAL CATALOG
       │
       ├── Product
       │      │
       │      └── ProductVersion / OfferingDefinition
       │
       └── Package
              │
              └── PackageVersion
                     │
                     ├── PackageItem → Product / offering reference
                     ├── PriceBookEntry
                     ├── commercial defaults
                     └── availability
                              │
                              ↓
                       FUTURE SALES USE
                              │
                  ┌───────────┼───────────┐
                  ↓           ↓           ↓
             Proposal     Contract     Invoice
                  │           │           │
                  ↓           ↓           ↓
              SNAPSHOT     SNAPSHOT    SNAPSHOT

Historical documents do NOT
dynamically read the current catalog.
```

---

# 2. Reuse

## Reuse Proposal commercial snapshot architecture

Design 018 and Design 097 already established the key invariant:

```text
Current Product / Package
        ≠
ProposalVersion snapshot
```

Design 104 becomes the canonical upstream catalog.

When a ProposalVersion is created:

```text
Current catalog offering
        ↓
CommercialSnapshotService
        ↓
ProposalVersion
```

The Proposal receives exact commercial terms/snapshots rather than a live pointer that changes later.

---

## ProposalVersion remains historical truth

Example:

```text
August catalog:
Executive Package = $1,000

Proposal v3 created:
Executive Package = $1,000

September catalog:
Executive Package = $1,500
```

Proposal v3 remains:

```text
$1,000
```

forever unless a new ProposalVersion is explicitly created.

---

## Design 098 approval remains exact-version based

Changing the Product/Package library after Proposal v3 was approved does not invalidate or alter:

```text
ApprovalRequest
subject = ProposalVersion v3
```

because Proposal v3 already contains its own exact commercial snapshot.

---

## Reuse Contract snapshot architecture

Designs 019, 099, and 100 already require:

```text
Proposal commercial terms
        ↓
ContractVersion snapshot
```

ContractVersions must not dynamically read Product/Package records.

Therefore:

```text
Catalog update
≠
Contract amendment
```

Permanent.

---

## Reuse InvoiceLine snapshot architecture

Designs 020, 101, and 102 already require issued InvoiceLines to preserve exact billed terms.

Therefore:

```text
Product price today
≠
historical InvoiceLine amount
```

Design 104 is a future-offering source, not a historical billing engine.

---

## Reuse Deal domain

A Deal may select or reference a proposed Product/Package context.

But:

> **Deal ≠ Product ≠ Package.**

Changing the Deal's interested package does not edit the catalog.

Changing the catalog does not change Deal stage.

---

## Design 104 ≠ Proposal Template library

Products/Packages define **what is commercially offered**.

Proposal Templates define **how a proposal document is structured/presented**.

They may interact.

They are not the same entity.

---

## Design 104 ≠ Workflow Template library

Designs 109–110 later manage project/workflow templates.

A Package may eventually reference fulfillment/workflow configuration, but:

> **Commercial package ≠ workflow template.**

That distinction must remain permanent.

---

## Product ≠ Project type

Selling:

> Personal Magazine Package

does not itself create a Project.

Project creation happens through governed handoff/onboarding later.

---

## Package ≠ Contract

A Package is reusable catalog configuration.

Contract is one client-specific legal agreement.

---

## Package ≠ Invoice

A Package represents what can be sold.

Invoice represents what was actually billed.

---

# 3. Entities

## Product

`Product` should be the stable identity of a sellable commercial offering.

Conceptually:

```text
Product
├── id
├── organizationId
├── stable code / reference
├── display name
├── commercial category
├── lifecycle
├── currentDefinitionVersionId
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Product ID survives rename

Example:

```text
Product P-100
"Executive Personal Magazine"

later renamed:
"Executive Authority Magazine"
```

The Product remains:

```text
P-100
```

Do not create a new Product merely because marketing copy changed.

---

## Product name ≠ Product identity

Permanent.

---

## Product code ≠ database ID

Where product codes/SKUs exist:

```text
productCode
≠
product.id
```

The business reference can change under policy while system identity remains stable.

---

## Product ≠ ProductVersion

Critical.

The stable Product answers:

> Which catalog offering is this?

The version answers:

> What exactly did this offering mean at this point in commercial configuration?

---

## ProductVersion / OfferingDefinition

Where Product commercial definition changes materially over time, preserve a versioned definition.

Conceptually:

```text
ProductVersion
├── id
├── productId
├── revision/version
├── name/display snapshot
├── description
├── included benefits/deliverables
├── commercial defaults
├── version lifecycle
├── effectiveFrom
├── effectiveTo where needed
├── createdBy
└── createdAt
```

Exact versioning detail belongs to Phase 3D.

---

## ProductVersion ≠ ProposalLineSnapshot

Permanent.

ProductVersion is reusable catalog configuration.

ProposalLineSnapshot is customer/deal-specific immutable commercial evidence.

---

## ProductVersion can be archived without deleting history

If version v2 is no longer sold:

```text
Product v2 = historical / inactive
```

Any ProposalVersion that used its values remains valid.

---

## Product archive ≠ delete historical usage

Absolute.

---

## Package

`Package` is the stable identity of a reusable bundled commercial offer.

Conceptually:

```text
Package
├── id
├── organizationId
├── stable code
├── display name
├── lifecycle
├── currentPackageVersionId
├── createdAt
└── revision
```

---

## Package ≠ Product

Important.

A Product is a sellable offering unit/capability.

A Package is a commercial bundle/configuration.

One Package may contain multiple Products or benefits.

Do not force every package to be represented as a Product unless final domain modeling deliberately chooses a generalized Offering abstraction.

Phase 3A.1 should preserve the frozen Product/Package distinction.

---

## PackageVersion

Commercial package composition must be version-aware where material changes occur.

Conceptually:

```text
PackageVersion
├── id
├── packageId
├── revision
├── display snapshot
├── PackageItem[]
├── pricing context
├── commercial terms/defaults
├── effective dates
├── lifecycle
└── createdAt
```

---

## Package v1 ≠ Package v2

Example:

```text
Package v1
├── Magazine
├── Interview
└── Website feature

Package v2
├── Magazine
├── Interview
├── Website feature
└── Podcast
```

A Proposal created under v1 must not suddenly gain Podcast because the current Package is now v2.

---

## PackageItem

`PackageItem` describes the composition of an exact PackageVersion.

Conceptually:

```text
PackageItem
├── packageVersionId
├── product / benefit reference
├── quantity
├── configuration snapshot/default
├── ordering/display context
└── commercial role
```

---

## PackageItem ≠ InvoiceLine

Permanent.

PackageItem says:

> What the reusable package contains.

InvoiceLine says:

> What this specific client was billed.

---

## PackageItem ≠ Proposal line

Permanent.

---

## Package item quantity ≠ fulfillment progress

Example:

> 5 social posts included

does not mean:

> 3 of 5 social posts completed.

Fulfillment belongs to Projects/workflows.

---

## Product benefit ≠ Task

Permanent.

---

## Product deliverable definition ≠ Deliverable instance

Critical later for Project/Delivery modules.

Catalog:

```text
Magazine Cover Feature
```

Actual client delivery:

```text
Deliverable D-100
```

They are separate.

---

## Price / PriceBookEntry

Catalog pricing deserves its own controlled concept rather than one mutable number attached directly to Product/Package if pricing complexity requires it.

Conceptually:

```text
PriceBookEntry
├── id
├── subjectType
├── subjectVersionId
├── amount
├── currency
├── effectiveFrom
├── effectiveTo
├── pricing context
├── lifecycle
└── revision
```

Exact physical shape Phase 3D.

---

## Price ≠ Product

Permanent.

---

## Price ≠ Package

Permanent.

---

## Current price ≠ historical Proposal price

Absolute.

---

## Currency must be explicit

Correct:

```text
$1,000 USD
€1,000 EUR
```

are different commercial prices.

Never persist:

```text
price = 1000
```

without currency.

---

## PriceBookEntry ≠ currency-converted display

A user may view a converted value for convenience.

The canonical catalog Price still retains its original currency.

---

## Multiple prices

Architecture should not prevent legitimate future cases such as:

* region/currency-specific pricing,
* different effective periods,

but Phase 3A.1 does not invent extra pricing screens.

The key invariant is:

> Price selection must be governed and deterministic.

---

## Effective pricing

When creating a Proposal:

```text
PricingResolver
(product/package version, commercial context, date)
        ↓
selected PriceBookEntry
        ↓
ProposalSnapshot
```

The selected price and resolution evidence should then be frozen.

---

## Effective date ≠ createdAt

Permanent.

A price can be configured today to become effective next month.

---

## Price expiration ≠ Product archive

Permanent.

---

## Availability

Commercial availability should remain distinct from entity lifecycle.

Conceptually:

```text
Product lifecycle = ACTIVE
Availability       = NOT_CURRENTLY_SELLABLE
```

could be valid depending on business rules.

---

## Availability ≠ deletion

Permanent.

---

## Archived ≠ unavailable historically

An archived package may remain visible in:

* Proposal history,
* Contract lineage,
* reporting.

---

## Catalog lifecycle

Conceptually:

```text
Draft
Active
Inactive
Archived
```

Exact canonical enums belong to Phase 3D.

---

## Catalog lifecycle ≠ pricing lifecycle

A Product can be active while one old PriceBookEntry has expired and another is active.

---

## Catalog lifecycle ≠ package availability

Permanent.

---

## Discount / CommercialOverride

A Sales-negotiated discount must not edit the Product's canonical price.

Correct:

```text
Catalog price = $1,500
Proposal-specific commercial override = $1,250
```

The Proposal snapshot records the actual offer.

Catalog remains $1,500.

---

## Discount ≠ PriceBookEntry mutation

Critical.

---

## Discount ≠ Invoice correction

Permanent.

---

## Proposal-specific override ≠ catalog version

Permanent.

A negotiated customer price does not create a new global PackageVersion.

---

## Historical commercial snapshot

The most important downstream entity pattern is conceptually:

```text
CommercialSnapshot
├── source Product/Package IDs
├── source version IDs
├── selected PriceBookEntry ID
├── displayed name
├── description/benefits
├── quantity
├── unit price
├── currency
├── negotiated override
├── resulting total
└── capturedAt
```

Exact snapshots may be domain-specific rather than one generic table.

Do not necessarily create one cross-domain mega `CommercialSnapshot` entity.

The architectural invariant is the same.

---

## Proposal snapshot ≠ Contract snapshot

A Contract may copy agreed terms into its own ContractVersion.

It should not keep depending on Proposal data dynamically.

---

## Contract snapshot ≠ InvoiceLine

Invoice records the billed obligation.

Even if all three originate from one Package, they remain separate historical evidence.

---

# 4. Permissions

Design 104 should conceptually distinguish:

```text
catalog.read

product.read
product.create
product.edit
product.publishOrActivate
product.archive

package.read
package.create
package.edit
package.publishOrActivate
package.archive

catalogPricing.read
catalogPricing.manage

catalogAvailability.manage
```

Exact permission names belong to Phase 3D.

---

## Catalog read ≠ edit

Permanent.

---

## Product edit ≠ pricing edit

Critical.

A content/catalog manager may edit:

* description,
* included benefits,

without authority to alter prices.

---

## Package edit ≠ Product edit

Permanent.

---

## Pricing manage ≠ Proposal discount authority

Different commercial powers.

---

## Proposal discount authority ≠ global price edit

Critical.

A Sales manager allowed to offer a 10% negotiated discount must not gain permission to change the catalog price for every customer.

---

## Catalog owner ≠ commercial approval authority

Permanent.

---

## Product creator ≠ publish/activate authority necessarily

Where approval/governance requires separation.

---

## Catalog visibility ≠ historical Proposal visibility

A user able to see current Products cannot automatically inspect every client Proposal that used them.

---

## Historical Proposal access ≠ current catalog edit permission

Permanent.

---

## Contract access ≠ Package edit permission

Permanent.

---

## Invoice access ≠ pricing administration

Permanent.

---

## Direct Product ID reauthorizes

Knowing ID grants nothing.

---

## Direct PackageVersion ID reauthorizes

Permanent.

---

## Cross-tenant package composition prohibited

Package belonging to Organization A cannot include Product from Organization B.

---

## Cross-tenant PriceBookEntry prohibited

Absolute.

---

## Pricing permission should protect side channels

Users without price visibility should not infer confidential prices through:

* sorting,
* hidden totals,
* filters,
* API response payloads.

---

## Archive/deactivate permission can be sensitive

Removing an offering from future Sales can materially affect operations.

Keep it separately authorized from ordinary editing if policy requires.

---

# 5. States

Design 104 must keep **Product lifecycle, ProductVersion state, Package lifecycle, PackageVersion state, pricing state, availability, and historical-use state** separate.

### Product lifecycle

Conceptually:

```text
Draft
Active
Inactive
Archived
```

### ProductVersion

```text
Draft
Published / Active
Superseded
Historical
```

### Package lifecycle

```text
Draft
Active
Inactive
Archived
```

### PackageVersion

```text
Draft
Published / Active
Superseded
Historical
```

### Pricing

```text
No Price
Scheduled
Active
Expired
Superseded
Unavailable
```

### Availability

```text
Available
Unavailable
Scheduled
Restricted
Unknown
```

These must never collapse into one generic `product.status`.

---

## Draft Product ≠ unavailable historical Product

Permanent.

---

## Active Product ≠ currently sellable price exists

Critical.

Possible:

```text
Product = ACTIVE
Price = UNAVAILABLE
```

which means catalog item exists but cannot safely be priced for a new Proposal.

---

## Active price ≠ Product active automatically

Permanent.

---

## Package active ≠ every Product item available

Critical.

A PackageAvailabilityResolver should detect if required package components are unavailable.

---

## Required Product unavailable ≠ package deleted

Permanent.

---

## Archived Product ≠ historical Proposal invalid

Absolute.

---

## Archived Package ≠ Contract invalid

Absolute.

---

## Price expired ≠ Proposal expired

Critical.

Catalog price expiry governs future price selection.

Proposal expiry belongs to the exact issued ProposalVersion.

---

## New PackageVersion ≠ old Proposal updated

Permanent.

---

## New Product price ≠ open Proposal automatically repriced

Critical.

Whether an editable draft Proposal explicitly refreshes pricing must require governed action.

Never silently rewrite its commercial numbers.

---

## Catalog service unavailable ≠ historical Proposal unavailable

Permanent.

Historical documents should remain self-contained enough to survive catalog outages.

---

## Price resolver unavailable ≠ zero price

Absolute.

---

## No Price ≠ free Product

Critical.

```text
Price unavailable
≠
Price = 0
```

---

## Package composition unavailable ≠ empty Package

Critical.

---

## State Coverage

Design 104 inherits Design 150 plus:

```text
Catalog Library Loading
Catalog Library Available
Catalog Library Empty
Catalog Library Restricted
Catalog Library Partial

Product Draft
Product Active
Product Inactive
Product Archived

Product Version Draft
Product Version Active
Product Version Superseded
Product Version Historical

Package Draft
Package Active
Package Inactive
Package Archived

Package Version Draft
Package Version Active
Package Version Superseded
Package Version Historical

Catalog Price Missing
Catalog Price Scheduled
Catalog Price Active
Catalog Price Expired
Catalog Price Superseded
Pricing Service Unavailable

Offering Available
Offering Unavailable
Offering Scheduled
Availability Restricted
Availability Unknown

Package Composition Available
Package Composition Partial
Package Composition Invalid / Needs Attention
Package Composition Unavailable

Catalog Updated Elsewhere
Catalog Version Conflict
Partial Catalog Summary Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **commercial catalog discovery**, not Proposal/Invoice history.

Conceptually:

```text
Products & Packages Library
↓
Catalog entries
   ├── Product / Package identity
   ├── current definition/version
   ├── composition summary
   ├── current price + currency
   ├── availability
   ├── lifecycle
   └── frozen-design action
```

Only elements present in frozen Design 104 should render.

---

## Product vs Package should remain explicit

Do not make both visually indistinguishable if the frozen design differentiates them.

A user should understand:

> Product

versus:

> Package containing multiple offerings.

---

## Current price must be labeled as current catalog pricing

Avoid ambiguous:

> $1,500

if historical transactions use other prices.

Semantics should be:

> Current price: $1,500 USD

where the frozen design provides price context.

---

## Archived/historical products should not resemble deleted records

If shown:

> Archived

should communicate:

> Not available for future use

rather than:

> No longer exists.

---

## Tablet

Following Design 152:

* catalog tables can become compact rows/cards,
* Product/Package type remains visible,
* current price/currency remains clear,
* composition summary wraps/stacks,
* availability/lifecycle stays distinct.

---

## Mobile

Priority:

```text
Product / Package
↓
Type
↓
Current version / availability
↓
Current price + currency
↓
Package contents summary
↓
Lifecycle
↓
Primary frozen action
```

Do not compress a complex catalog grid horizontally.

---

## Mobile price clarity

Always keep amount + currency together:

> $1,500 USD

rather than just:

> 1,500.

---

## Partial failure

If pricing service is unavailable:

still show:

* Product identity,
* description,
* package composition where available,
* lifecycle.

Display:

> Pricing unavailable

not:

> $0.

---

## Accessibility

A catalog entry could communicate:

> Executive Authority Package. Active package, version 4. Contains four products. Current catalog price 1,500 US dollars. Available for new proposals.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical commercial catalog architecture

```text
Design 104
    ↓
Authenticated Workspace Context
    ↓
CommercialCatalogQueryService
    │
    ├── ProductAdapter
    ├── ProductVersionAdapter
    ├── PackageAdapter
    ├── PackageVersionAdapter
    ├── PackageCompositionAdapter
    ├── PricingAdapter
    └── AvailabilityResolver
    ↓
CatalogEntry[]
```

`CatalogEntry` remains a read projection.

---

## No giant generic Offering record unless deliberately standardized later

Avoid prematurely collapsing:

```text
Product
Package
Price
PackageItem
```

into one mutable mega entity solely for UI convenience.

A shared interface/read projection is fine.

Canonical domain distinctions remain.

---

## Stable Product identity

Product mutation commands operate on stable Product ID.

Material commercial-definition changes should preserve appropriate version history.

---

## Product update command

Conceptually:

```text
updateProductDraft(
    productId,
    expectedRevision,
    changes
)
```

should:

1. authorize;
2. validate tenant;
3. validate editable lifecycle/version;
4. validate allowed fields;
5. preserve prior published definition;
6. create/update draft/version according to policy;
7. emit Audit/outbox.

---

## Generic Product PATCH should not rewrite historical definitions

Critical.

---

## Package update command

Conceptually:

```text
updatePackageDraft(
    packageId,
    expectedRevision,
    compositionChanges
)
```

must validate PackageItem references and tenant boundaries.

---

## Package composition validation

At minimum validate:

* referenced Product exists,
* same tenant,
* permitted lifecycle,
* quantities/configuration valid,
* no invalid duplicate/cycle semantics according to final model.

---

## Package nesting

Do not assume recursive Package-inside-Package composition unless the frozen/current product model requires it.

If later supported, explicit cycle protection is mandatory.

Phase 3A.1 does not invent it.

---

## Package version publication

Material package composition changes should publish/create a new exact PackageVersion instead of mutating a version already used as historical commercial source.

---

## Historical usage pinning

When ProposalVersion is created, persist source lineage such as conceptually:

```text
productId
productVersionId

packageId
packageVersionId

priceBookEntryId
```

plus the actual customer-specific commercial snapshot.

This preserves both:

* source provenance,
* immutable downstream terms.

---

## Source lineage ≠ dynamic dependency

Critical.

Storing `packageVersionId` is helpful for traceability.

The Proposal must still retain enough snapshot data that later catalog unavailability does not make the Proposal unreconstructable.

---

## Pricing service

Conceptually:

```text
CatalogPricingService.resolvePrice(
    offeringVersion,
    commercialContext,
    effectiveAt
)
```

returns a specific canonical `PriceBookEntry`.

---

## Pricing resolver must be deterministic

For identical valid inputs, one unambiguous current price should be selected.

If several candidate prices conflict:

return:

> pricing conflict / unavailable

rather than choosing randomly.

---

## Price effective dating

At most one applicable canonical price should win under the same pricing scope unless an explicit priority model exists.

Database/service constraints should prevent ambiguous overlapping records where appropriate.

---

## Price changes are append/version based

Correct:

```text
Price P1
$1,000
valid until Aug 31

Price P2
$1,500
valid from Sep 1
```

Not:

```text
UPDATE P1
SET amount = 1500
```

when historical pricing provenance matters.

---

## Price zero is valid only when explicit

Critical.

```text
amount = 0
```

can represent an intentionally free offering.

It must be distinguishable from:

```text
price missing
pricing unavailable
```

---

## Currency handling

Use currency-aware decimal values.

No floating point.

---

## Price conversion

If UI later displays converted currencies:

conversion remains presentation/derived context unless the commercial snapshot intentionally uses the converted offered currency.

Do not overwrite catalog PriceBookEntry.

---

## Commercial snapshot service

This is one of the most important backend services.

Conceptually:

```text
CommercialSnapshotService.captureForProposal(
    product/package selections,
    pricing context,
    customer/deal context
)
```

should return:

```text
exact Product/Package source IDs
exact source version IDs
exact selected pricing record
captured names/descriptions/benefits
quantities
unit price
currency
negotiated overrides
calculated totals
capturedAt
```

The Proposal then owns that snapshot.

---

## Snapshot creation must be atomic enough

The system must avoid:

```text
read Package v3
price changes
read new price
```

producing an internally inconsistent Proposal snapshot.

Use:

* exact version IDs,
* pricing revision/effective selection,
* transaction/snapshot isolation as appropriate.

---

## Snapshot idempotency

Retrying Proposal creation/version creation should not produce conflicting duplicate snapshots for the same operation.

---

## Price override

If negotiated pricing is permitted:

```text
Catalog price
        ↓
authorized override
        ↓
Proposal snapshot
```

The override:

* records actor/reason where policy requires,
* never mutates PriceBookEntry.

---

## Pricing permission enforcement

The server validates whether actor can:

* use catalog price,
* override price,
* apply discount.

Frontend controls are not authority.

---

## Discount limits

If discount limits/approval thresholds exist in the product, enforce server-side.

Do not invent exact percentages in this audit.

---

## Proposal creation should not use “latest” blindly

Avoid:

```text
getLatestPackageVersion(packageId)
```

during historical retries.

For a new commercial action, resolve explicit current eligible version once, then pin it.

---

## Contract creation does not re-resolve current catalog

Critical.

Contract derived from Proposal uses:

```text
accepted ProposalVersion snapshot
```

not:

```text
current PackageVersion
```

---

## Invoice creation does not re-resolve current catalog blindly

If Invoice is generated from Contract/Proposal terms:

use the exact agreed/billable source snapshot.

Do not resolve today's price.

---

## Product deletion

Prefer archive/deactivation over destructive deletion once referenced historically.

If physical deletion exists at all, referential-integrity checks must prevent deletion of records needed for historical evidence.

---

## Package deletion

Same rule.

---

## Price history retention

PriceBookEntries referenced by Proposal/commercial snapshot lineage must remain historically identifiable.

---

## Search integration

Design 079 may index safe:

* Product name,
* Package name,
* code,
* category,
* lifecycle,

where appropriate.

Do not index restricted pricing where user lacks pricing permission.

---

## Audit

Material catalog actions should include:

```text
ProductCreated
ProductVersionPublished
ProductArchived

PackageCreated
PackageVersionPublished
PackageArchived

CatalogPriceCreated
CatalogPriceChanged / Superseded
CatalogAvailabilityChanged
```

with actor and exact version context.

---

## Activity

Catalog Activity can present those actions operationally.

Activity ≠ canonical version history ≠ Audit.

---

## Events/outbox

Useful canonical events:

```text
ProductVersionPublished
PackageVersionPublished
PriceBookEntryActivated
CatalogOfferingArchived
CatalogAvailabilityChanged
```

Downstream systems may invalidate caches/readiness from them.

They must not mutate historical commercial snapshots.

---

## Cache behavior

Current catalog entries can be cached aggressively if keyed by:

```text
organizationId
authorization scope
catalog revision
pricing revision
availability revision
```

---

## Historical snapshot independence

Historical Proposal/Contract/Invoice reads should **not** require current catalog availability.

Critical production requirement.

If Product service is down:

an issued Proposal must still render from its snapshot.

---

## N+1 prevention

Batch:

* Product versions,
* Package composition,
* current prices,
* availability.

Do not query every PackageItem and Price individually for each list entry.

---

## Pagination

Server-side cursor pagination if catalog grows large.

---

## Filtering/sorting

Where frozen Design 104 contains filters, server-side fields may include:

* Product vs Package,
* lifecycle,
* category,
* availability,

and pricing fields only under correct permissions.

---

## Partial failure contract

Example:

```text
Product core        ✓
Current definition  ✓
Package composition ✓
Pricing             ✕
Availability        ✓
```

Design 104 should show:

> Executive Package
> Active
> 4 included products
> Price unavailable

Not:

> $0.

Another example:

```text
Package core        ✓
Composition service ✕
Price               ✓
```

show:

> Package composition unavailable

not:

> Package contains 0 products.

---

## Backend Requirement Matrix

| Requirement                                            | Status                                  |
| ------------------------------------------------------ | --------------------------------------- |
| Canonical Product identity                             | **Critical**                            |
| Product/ProductVersion separation                      | **Critical where materially versioned** |
| Canonical Package identity                             | **Critical**                            |
| Package/PackageVersion separation                      | **Critical**                            |
| Product/Package separation                             | **Critical**                            |
| Package/PackageItem separation                         | **Critical**                            |
| PackageItem/ProposalLine separation                    | **Critical**                            |
| PackageItem/InvoiceLine separation                     | **Critical**                            |
| Product benefit/Deliverable instance separation        | **Critical**                            |
| Catalog offering/Project separation                    | **Critical**                            |
| Price/Product separation                               | **Critical**                            |
| Price/Package separation                               | **Critical**                            |
| Explicit amount + currency                             | **Critical**                            |
| Decimal-safe price arithmetic                          | **Critical**                            |
| Price history/version preservation                     | **Critical**                            |
| Current price/historical Proposal price separation     | **Critical**                            |
| Price missing/free price separation                    | **Critical**                            |
| Pricing resolver deterministic                         | **Critical**                            |
| Effective pricing semantics                            | **Critical**                            |
| Product lifecycle/price lifecycle separation           | **Critical**                            |
| Catalog lifecycle/availability separation              | **Critical**                            |
| Archive/delete separation                              | **Critical**                            |
| Historical referenced records retained                 | **Critical**                            |
| Proposal snapshot independent of current catalog       | **Critical**                            |
| Proposal snapshot pins source version                  | **Critical**                            |
| Contract does not re-resolve current catalog           | **Critical**                            |
| Invoice does not re-resolve current catalog            | **Critical**                            |
| Current CRM/catalog change does not rewrite Proposal   | **Critical**                            |
| Current catalog change does not rewrite Contract       | **Critical**                            |
| Current catalog change does not rewrite Invoice        | **Critical**                            |
| Negotiated override/catalog price separation           | **Critical**                            |
| Discount permission/global-price permission separation | **Critical**                            |
| Server-side pricing authorization                      | **Critical**                            |
| Snapshot consistency/atomicity                         | **Critical**                            |
| Snapshot idempotency                                   | **Critical**                            |
| Cross-tenant composition prohibited                    | **Critical**                            |
| Cross-tenant pricing prohibited                        | **Critical**                            |
| Optimistic concurrency                                 | **Critical**                            |
| Version publication/history                            | **Critical**                            |
| Permission-safe library projection                     | **Critical**                            |
| Pricing field-level authorization                      | **Critical**                            |
| Search permission safety                               | **Required**                            |
| Audit/outbox integration                               | **Required**                            |
| N+1 prevention                                         | **Critical**                            |
| Cursor pagination                                      | **Required at scale**                   |
| Historical document independence from catalog uptime   | **Critical**                            |
| Design 105 detail reuse                                | **Critical architecture**               |
| Designs 097–103 snapshot consistency                   | **Critical**                            |

---

# 8. Consolidation

Design 104 creates a major risk of accidentally turning a **mutable sales catalog** into the source of historical commercial truth.

**Product / ProductVersion conflation**
Stable offering and exact historical definition collapse.

**Product name / identity conflation**
Rename creates duplicate Product.

**Package / Product conflation**
Bundle and sellable unit lose their distinct semantics.

**Package / PackageVersion conflation**
Changing composition rewrites prior package definition.

**Package / PackageItem conflation**
Package becomes unstructured JSON.

**PackageItem / ProposalLine conflation**
Reusable composition becomes client-specific offer.

**PackageItem / InvoiceLine conflation**
Catalog inclusion becomes billed obligation.

**Product benefit / Project Deliverable conflation**
Catalog promise becomes fulfillment instance.

**Product / Project conflation**
Selling an offering creates delivery project implicitly.

**Package / WorkflowTemplate conflation**
Commercial offer and operational workflow become one object.

**Package current version / Proposal snapshot conflation**
Editing package rewrites negotiation history.

**Product description / Proposal historical copy conflation**
Marketing copy change alters old Proposal.

**Current Package contents / Contract terms conflation**
New benefit appears in signed Contract.

**Current Product/Package / InvoiceLine conflation**
Catalog change alters billed service.

**Current price / historical Proposal price conflation**
Repricing retroactively changes client offer.

**Current price / signed Contract price conflation**
Catalog change alters agreed terms.

**Current price / issued Invoice amount conflation**
Catalog price change alters receivable.

**Price / Product conflation**
One mutable `product.price` destroys price history.

**Price amount / currency conflation**
1,000 USD and 1,000 EUR become indistinguishable.

**Missing price / zero price conflation**
Pricing outage makes Product free.

**Price expired / Product archived conflation**
Pricing schedule disables catalog identity.

**Product active / price available conflation**
Active item appears safely sellable without price.

**Package active / package valid conflation**
Required component may be unavailable.

**Availability / lifecycle conflation**
Temporary unavailability deletes Product.

**Archive / delete conflation**
Historical commercial source disappears.

**Package archive / Contract invalidation conflation**
Signed agreement appears to reference deleted content.

**Price replacement / history rewrite conflation**
No evidence remains of what Sales saw.

**Price effective date / created date conflation**
Future prices activate incorrectly.

**Overlapping price records / deterministic selection conflation**
Different users receive different prices unpredictably.

**Catalog price / negotiated Proposal price conflation**
One client's discount changes everyone's price.

**Discount / PriceBook mutation conflation**
Negotiation becomes global catalog edit.

**Discount authority / pricing-admin authority conflation**
Sales rep changes enterprise-wide pricing.

**Proposal-specific override / PackageVersion conflation**
Customer negotiation creates unnecessary global package revision.

**Proposal creation / live catalog dependency conflation**
Historical Proposal cannot render when catalog service is down.

**Proposal snapshot / source pointer conflation**
Old Proposal dynamically resolves latest Product definition.

**Proposal v3 / current Package v5 conflation**
Approved Proposal terms change.

**Contract creation / current price resolution conflation**
Accepted Proposal $1,000 becomes Contract $1,500.

**Invoice creation / current price resolution conflation**
Agreed Contract $1,000 produces Invoice $1,500.

**Catalog update / Contract amendment conflation**
Global configuration creates legal amendment.

**Catalog update / Invoice correction conflation**
Global price edit changes issued bill.

**Product archive / historical proposal deletion conflation**
Commercial evidence disappears.

**PriceBookEntry deletion / historical price provenance loss**
Cannot explain earlier Proposal.

**Package composition / arbitrary cross-tenant reference conflation**
One tenant can sell another tenant's Product.

**Product edit / pricing edit permission conflation**
Content editor changes commercial value.

**Pricing visibility / catalog read conflation**
Sensitive pricing leaks.

**Catalog owner / authorization conflation**
Operational owner gains broad pricing authority.

**Proposal owner / Product edit authority conflation**
Sales user modifies master catalog.

**Contract viewer / Package management conflation**
Legal access gains catalog administration.

**Invoice viewer / pricing admin conflation**
Finance reader changes future Sales pricing.

**Catalog list projection / canonical entity conflation**
Search/list row becomes editable source truth.

**Search index / catalog source truth conflation**
Stale search result used as pricing authority.

**Client-side price calculation / canonical pricing conflation**
Frontend chooses commercial amount.

**Client-side discount / authorized discount conflation**
Browser can tamper with offered price.

**Price resolver failure / free offering conflation**
Failed service returns zero.

**Package composition failure / empty Package conflation**
Dependency outage removes benefits.

**“Latest version” / exact eligible version conflation**
Concurrent update produces inconsistent Proposal snapshot.

**Snapshot capture / sequential live reads conflation**
Name from v2 + price from v3 ends in one Proposal.

**Catalog deletion / historical referential cascade**
Proposal/Contract/Invoice evidence is destroyed.

**Generic Product PATCH / version publication conflation**
Published commercial definition rewritten in place.

**Generic Package PATCH / historical composition mutation**
Old package contents change.

**104/018 duplicate commercial offering state**
Proposal Builder stores its own product catalog.

**104/020 duplicate billing item definitions**
Invoice invents another Product backend.

**104/097 duplicate package snapshot truth**
Proposal Library derives historical values from current catalog.

**104/099–100 duplicate Contract commercial terms**
Contract keeps live catalog pointers.

**104/101–103 duplicate Invoice pricing truth**
Finance recalculates from current Product price.

**104/105 duplicate Product/Package backend**
Library and Detail diverge.

No additional screen is required.

These are **catalog identity, versioned offering definitions, package composition, pricing history, availability, authorization, commercial snapshotting, downstream document independence, and historical commercial-evidence requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PRODUCT, PACKAGE, CATALOG PRICING & COMMERCIAL OFFERING LIBRARY ANCHOR**

**Domain directive:**
**Product ≠ ProductVersion/OfferingDefinition ≠ Package ≠ PackageVersion ≠ PackageItem ≠ Price/PriceBookEntry ≠ Currency ≠ Availability ≠ Discount/CommercialOverride ≠ ProposalLineSnapshot ≠ ContractTermsSnapshot ≠ InvoiceLine.**

**Identity directive:**
Product and Package are stable tenant-scoped catalog identities. Names, descriptions, composition and pricing can evolve without recreating or rewriting the underlying identity.

**Version directive:**
material changes to published Product definitions or Package composition preserve version history rather than mutating previously referenced definitions in place.

**Package directive:**
Package remains a reusable commercial bundle distinct from individual Products and from any client-specific Proposal, Contract, Invoice, Project, Task or Deliverable instance.

**Composition directive:**
PackageItems describe exact PackageVersion composition and remain distinct from Proposal lines, Contract obligations, InvoiceLines, project Deliverables and work completion.

**Pricing directive:**
catalog pricing is represented through explicit currency-aware commercial pricing records/resolution, not one history-destroying mutable number embedded directly into Product or Package.

**Money directive:**
all prices use decimal-safe arithmetic with explicit currency. `No price`, `pricing unavailable`, and intentionally `0/free` are separate states.

**Effective-pricing directive:**
current pricing is selected deterministically under explicit effective-date/context rules. Ambiguous overlapping pricing must fail safely rather than silently choose a price.

**Price-history directive:**
changing a catalog price creates/supersedes pricing history rather than rewriting values needed to explain previous commercial decisions.

**Availability directive:**
offering lifecycle, version lifecycle, price lifecycle and current sales availability remain separate state dimensions. Temporary unavailability never deletes catalog identity.

**Archive directive:**
archiving a Product, Package or Price removes or limits future use according to policy but never destroys historical Proposal/Contract/Invoice references.

**Snapshot directive:**
future Proposals consume Product/Package catalog values through a canonical `CommercialSnapshotService` that freezes the exact source version, selected pricing, names, contents, quantities, currency and authorized commercial overrides into the ProposalVersion.

**Source-lineage directive:**
downstream snapshots should retain Product/Package/version/pricing provenance for traceability while still being self-contained enough that catalog downtime or later catalog edits cannot change or prevent reconstruction of historical documents.

**Proposal directive:**
Designs 018/097–098 remain canonical for Proposal commercial terms. A Product/Package change never alters an existing ProposalVersion, its approval, client issuance or acceptance.

**Negotiation directive:**
a customer-specific discount or negotiated override belongs to that commercial document/context and never mutates the global PriceBookEntry or PackageVersion.

**Contract directive:**
Designs 019/099–100 remain canonical for Contract terms. Contract creation uses the exact accepted Proposal/agreed commercial snapshot rather than resolving today's current Product/Package price.

**Invoice directive:**
Designs 020/101–103 remain canonical for billing. InvoiceLines preserve exact billable snapshots and never dynamically follow current Product/Package definitions or prices.

**Historical-evidence directive:**
the immutable chain must remain:

```text
Catalog at commercial decision time
        ↓
ProposalVersion snapshot
        ↓
accepted/agreed terms
        ↓
ContractVersion snapshot
        ↓
billable terms
        ↓
InvoiceLine snapshot
```

Changes at the top can never propagate backward into already-created lower layers.

**Authorization directive:**
catalog read, Product edit, Package edit, pricing administration, availability management and customer-specific commercial overrides remain independently server-authorized.

**Pricing-security directive:**
a user allowed to negotiate one Proposal must never implicitly gain permission to change the global catalog price. Likewise, general catalog viewers need not receive restricted price data.

**Tenant directive:**
Product, Package, PackageItem and PriceBookEntry references are strictly tenant-scoped. Cross-tenant package composition or price attachment is prohibited.

**Concurrency directive:**
catalog definition, package composition and pricing mutations use expected-revision/concurrency safeguards. A commercial snapshot must never combine inconsistent data from concurrent versions.

**Snapshot-consistency directive:**
Proposal snapshot capture pins exact eligible Product/Package/Pricing revisions in one consistent operation rather than independently requesting “latest” values at different times.

**Idempotency directive:**
commercial snapshot creation and downstream Proposal-version creation must be replay-safe so retries cannot generate inconsistent duplicate commercial states.

**Historical-availability directive:**
Proposal, Contract and Invoice rendering must remain independent from current catalog availability. A Product service outage or archived Package can never make an already-issued commercial document unreconstructable.

**Search directive:**
Design 079 may index safe Product/Package metadata while respecting pricing visibility. Search results never become pricing authority.

**Caching directive:**
catalog caches vary by tenant, authorization scope, Product/Package revision, pricing revision and availability revision. Historical downstream snapshots should use their own immutable data instead of repeatedly consulting the live catalog.

**Performance directive:**
use batched version/composition/pricing queries, indexed catalog references and server-side pagination/filtering rather than per-row Product/Package/Price N+1 calls.

**Partial-failure directive:**
Product identity, definition, composition, pricing and availability can fail independently. `Pricing unavailable` can never become `$0`, and `composition unavailable` can never become an empty Package.

**Audit directive:**
Product/Package creation, published version changes, pricing changes/supersession, archival and material availability changes generate actor/version-aware Audit evidence while commercial downstream snapshots preserve their independent history.

**Future-reuse directive:**
Design 105 must consume these same canonical Product/Package/version/pricing identities and specialize one offering's detail/configuration without creating a separate Product/Package backend.

**Overlap directive:**
Designs **018–020, 096–105** must share one continuous **Product/Package Catalog → Versioned Offering → Price Resolution → Proposal Snapshot → Contract Snapshot → InvoiceLine Snapshot** lineage while preserving catalog configuration, negotiation, legal agreement and financial billing as independently canonical domains.

**Consolidation directive:**
**STANDARDIZE ONE COMMERCIAL CATALOG FOUNDATION — STABLE TENANT-SCOPED PRODUCT/PACKAGE IDENTITIES + VERSIONED OFFERING/COMPOSITION DEFINITIONS + EXPLICIT PACKAGEITEM RELATIONS + CURRENCY/DECIMAL-SAFE VERSION-AWARE PRICEBOOK ENTRIES + DISTINCT AVAILABILITY/LIFECYCLE STATE + SERVER-AUTHORIZED NEGOTIATED OVERRIDES + CONSISTENT COMMERCIAL SNAPSHOT CAPTURE + EXACT SOURCE VERSION/PRICE PROVENANCE + NON-DESTRUCTIVE ARCHIVAL/HISTORY RETENTION — AND NEVER ALLOW CURRENT CATALOG NAMES, CONTENTS, PRICES, AVAILABILITY, “LATEST” VERSION LOOKUPS OR CLIENT-SIDE DISCOUNTS TO REWRITE OR SUBSTITUTE FOR HISTORICAL PROPOSAL, CONTRACT, OR INVOICE TERMS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **104 / 153** |
| **PASS**                                   |                        **104** |
| **STANDARDIZE decisions**                  |                        **102** |
| **Potential implementation-overlap flags** |                         **95** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**104 / 153 = 68.0% audited.**

### Canonical commercial catalog architecture after Design 104

```text
                    PRODUCT
                stable identity
                      │
                      ↓
                ProductVersion

                    PACKAGE
                stable identity
                      │
                      ↓
                PackageVersion
                      │
                 PackageItems
                      │
                      ↓
               PriceBookEntry
                      │
                      ↓
             Current catalog offer
                      │
                      ↓
             CommercialSnapshot
                      │
       ┌──────────────┼──────────────┐
       ↓              ↓              ↓
ProposalVersion  ContractVersion  InvoiceLine
```

The most important catalog-history rule is now explicit:

```text
Package v3
Price = $1,000
        ↓
Proposal v5 created
Snapshot = $1,000

Later:

Package v4
Price = $1,500

RESULT:

Current catalog             = $1,500
Proposal v5                 = $1,000
Contract from v5            = agreed snapshot
Invoice from agreement      = exact billed snapshot

Nothing historical changes.
```

The package-composition boundary is equally strict:

```text
Package v1:
Magazine
Interview
Website Feature

Package v2:
Magazine
Interview
Website Feature
Podcast

Existing Proposal using v1
does NOT gain Podcast
because v2 now exists.
```

And negotiated pricing remains separate from master pricing:

```text
Current catalog:
$1,500

Authorized client-specific Proposal:
$1,250

RESULT:

Catalog price = $1,500
Proposal price = $1,250

NOT:
catalog price changed to $1,250.
```

Finally:

```text
Price unavailable
       ≠
$0 / Free

Package archived
       ≠
Historical Proposal invalid

Catalog changed
       ≠
Contract amended

Catalog changed
       ≠
Invoice corrected
```

Each remains a separate canonical business fact.

## Next Sequential Audit Target

### **Design 105 — Product / Package Detail**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
