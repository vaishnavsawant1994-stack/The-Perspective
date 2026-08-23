# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 105 — Product / Package Detail

Design 105 should become the **canonical Team Workspace commercial-offering detail, version, composition, pricing, availability, and controlled publication surface** for one Product or one Package, built directly on the catalog foundation established by Design 104.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary should be:

> **Product ≠ ProductVersion/OfferingDefinition ≠ Package ≠ PackageVersion ≠ PackageItem ≠ PriceBookEntry ≠ Availability ≠ CommercialOverride ≠ ProposalSnapshot ≠ ContractSnapshot ≠ InvoiceLine ≠ Project/Deliverable.**

The central implementation rule is:

> **Design 105 may use one reusable detail template for Product and Package records, but it must not collapse their domain identities. A Product or Package is a stable catalog identity; its published commercial definition is versioned; a PackageVersion must have deterministic composition; pricing and availability remain independently governed; and every Proposal, Contract, and Invoice created from the catalog must freeze its own exact commercial snapshot. Editing this detail screen can affect future commercial use only—it must never retroactively rewrite historical offers, agreements, invoices, or fulfillment records.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                        | **105**                                                                                                                                                                            |
| **Canonical name**                   | **Product / Package Detail**                                                                                                                                                       |
| **Product area**                     | Team Workspace / Sales / Commercial Catalog                                                                                                                                        |
| **User surface**                     | **Authenticated Team Workspace**                                                                                                                                                   |
| **Screen class**                     | Entity Detail / Catalog Configuration Workspace                                                                                                                                    |
| **Classification**                   | **Canonical Product/Package Detail, Version, Composition, Pricing & Availability Configuration Anchor**                                                                            |
| **Primary purpose**                  | Inspect and govern one Product or Package, its exact current/published definition, version history, package composition, pricing, availability and future-commercial-use readiness |
| **Primary identities**               | **Product** or **Package** — Design 104                                                                                                                                            |
| **Definition entities**              | **ProductVersion / PackageVersion**                                                                                                                                                |
| **Package composition**              | **PackageItem**                                                                                                                                                                    |
| **Pricing**                          | **PriceBookEntry**                                                                                                                                                                 |
| **Availability**                     | **OfferingAvailability / Availability resolution**                                                                                                                                 |
| **Commercial snapshot dependency**   | `CommercialSnapshotService`                                                                                                                                                        |
| **Proposal dependency**              | Designs 018 / 097–098                                                                                                                                                              |
| **Contract dependency**              | Designs 019 / 099–100                                                                                                                                                              |
| **Invoice dependency**               | Designs 020 / 101–103                                                                                                                                                              |
| **Library dependency**               | Design 104                                                                                                                                                                         |
| **Future project/workflow boundary** | Designs 108–110 and downstream Project delivery                                                                                                                                    |
| **Detail projection**                | `CatalogOfferingDetailView`                                                                                                                                                        |
| **Primary query service**            | `CatalogOfferingDetailQueryService`                                                                                                                                                |
| **Product service**                  | `ProductCatalogService`                                                                                                                                                            |
| **Package service**                  | `PackageCatalogService`                                                                                                                                                            |
| **Version service**                  | `CatalogVersionService`                                                                                                                                                            |
| **Pricing service**                  | `CatalogPricingService`                                                                                                                                                            |
| **Availability resolver**            | `CatalogAvailabilityResolver`                                                                                                                                                      |
| **Snapshot service**                 | `CommercialSnapshotService`                                                                                                                                                        |
| **Parent shell**                     | `InternalAppShell` — Design 001                                                                                                                                                    |
| **Auth**                             | Required                                                                                                                                                                           |
| **Authorization**                    | Active OrganizationMembership + catalog/version/composition/pricing/availability permissions                                                                                       |
| **Implementation priority**          | **Critical Commercial Configuration / Version Integrity / Downstream Snapshot Safety**                                                                                             |
| **Reuse level**                      | **Extremely High across Proposals, Contracts, Billing, Sales and future fulfillment setup**                                                                                        |

Design 105 should answer:

> **“What exact Product or Package is this, what is its currently published commercial definition, what previous versions existed, what does the Package contain, which exact price is currently valid, is it available for future Sales use, and what can safely be changed without altering historical client commitments?”**

Canonical composition:

```text
                    CATALOG OFFERING
                           │
                ┌──────────┴──────────┐
                ↓                     ↓
             PRODUCT               PACKAGE
                │                     │
          ProductVersion         PackageVersion
                                      │
                                 PackageItem[]
                                      │
                                      ↓
                              exact ProductVersion
                                   references
                │                     │
                └──────────┬──────────┘
                           ↓
                     PriceBookEntry
                           │
                     Availability
                           │
                           ↓
                  Future commercial use
                           │
                           ↓
               CommercialSnapshotService
                           │
              ┌────────────┼────────────┐
              ↓            ↓            ↓
       ProposalVersion ContractVersion InvoiceLine
```

---

# 2. Reuse

## Design 104 remains the canonical catalog collection

Design 104 and Design 105 must operate on exactly the same:

```text
Product.id
Package.id
```

Correct:

```text
Design 104
Product P-100
    ↓
Design 105
Product P-100 Detail
```

and:

```text
Design 104
Package PK-200
    ↓
Design 105
Package PK-200 Detail
```

Do not create:

```text
ProductDetailProduct
PackageDetailPackage
OfferingDetailRecord
```

as parallel domain objects.

---

## One detail template may be shared

At UI/composition level, a reusable:

```text
CatalogOfferingDetailTemplate
```

is appropriate.

It can share:

* identity/header primitives,
* lifecycle/version presentation,
* pricing,
* availability,
* history,
* activity.

But:

> **shared UI template ≠ shared mutable mega entity.**

Product-specific and Package-specific commands remain domain-aware.

---

## Product ≠ Package

Permanent.

A Product defines an individual commercial offering/capability.

A Package defines a reusable bundle/composition.

They may share catalog primitives.

They should not be collapsed merely because Design 105 visually supports both.

---

## Design 104 version model remains authoritative

Design 105 must not edit a published definition in place when a material commercial change requires a new version.

Correct:

```text
Product P1
├── ProductVersion v1
├── ProductVersion v2
└── ProductVersion v3
```

Not:

```text
Product P1 {
   mutableDescription,
   mutableBenefits,
   mutableEverything
}
```

where historical commercial meaning cannot be reconstructed.

---

## Proposal snapshot reuse remains mandatory

Designs 018 and 097–098 already established:

```text
Current catalog
    ↓
exact CommercialSnapshot
    ↓
ProposalVersion
```

Design 105 cannot become a live dependency of already-created ProposalVersions.

---

## Contract remains independent

Designs 019/099–100 remain Contract authority.

Editing Product/Package Detail:

```text
≠ Contract amendment
```

Permanent.

---

## Invoice remains independent

Designs 020/101–103 remain billing authority.

Changing Product price or Package content:

```text
≠ Invoice correction
```

Permanent.

---

## Project/fulfillment remains independent

A catalog Package may describe:

> Magazine + Podcast + Website Feature

but the actual client's:

* Project,
* Project task,
* deliverable,
* milestone,
* workflow stage

remain downstream operational entities.

Design 105 cannot become fulfillment state.

---

## Commercial offering ≠ Workflow Template

This becomes increasingly important before Designs 108–110.

A Package may later reference a recommended Project/Workflow Template.

But:

```text
Package
≠
WorkflowTemplate
```

Changing delivery workflow must not rewrite what was commercially promised, and changing Package pricing must not mutate operational workflow history.

---

# 3. Entities

## Product

`Product` remains the stable catalog identity.

Conceptually:

```text
Product
├── id
├── organizationId
├── stable reference/code
├── lifecycle
├── currentPublishedVersionId
├── currentDraftVersionId where applicable
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Product ≠ ProductVersion

Critical.

Product answers:

> Which reusable offering is this?

ProductVersion answers:

> What exactly did the offering contain/mean in this commercial revision?

---

## Product rename does not change identity

Example:

```text
P-100

v1:
Personal Executive Magazine

v2:
Executive Authority Magazine
```

Both still belong to Product `P-100`.

---

## ProductVersion

Conceptually:

```text
ProductVersion
├── id
├── productId
├── revision/version
├── display name
├── description
├── included commercial benefits
├── commercial defaults
├── effective context
├── lifecycle
├── createdBy
└── createdAt
```

---

## Published ProductVersion should be immutable for material semantics

Once a version is:

* published for Sales use,
* referenced in a downstream commercial snapshot,

material commercial definition changes should create another ProductVersion.

Do not rewrite the old one.

---

## Non-commercial display metadata

Purely presentational metadata may be separable from the immutable commercial definition if the final model needs that distinction.

But this exception must never allow materially client-relevant terms to change historically.

---

## ProductVersion v2 ≠ v1

Permanent.

---

## Package

`Package` remains the stable bundle identity.

Conceptually:

```text
Package
├── id
├── organizationId
├── stable reference/code
├── lifecycle
├── currentPublishedVersionId
├── currentDraftVersionId
├── createdAt
└── revision
```

---

## Package ≠ PackageVersion

Permanent.

---

## PackageVersion

`PackageVersion` must make exact commercial composition reproducible.

Conceptually:

```text
PackageVersion
├── id
├── packageId
├── revision
├── display name
├── description
├── PackageItem[]
├── commercial defaults
├── lifecycle
├── createdBy
└── createdAt
```

---

## Published PackageVersion must be deterministic

This creates an important rule:

> A historical PackageVersion must not change merely because one of its underlying Products later publishes a new ProductVersion.

Therefore the composition should pin exact commercial-definition lineage.

Preferred conceptual pattern:

```text
PackageVersion PV3
   ├── PackageItem → Product P1 / ProductVersion 2
   ├── PackageItem → Product P2 / ProductVersion 4
   └── PackageItem → Product P3 / ProductVersion 1
```

not merely:

```text
PackageItem → Product P1 → whatever ProductVersion is latest today
```

---

## PackageVersion does not auto-upgrade Products

Critical.

Example:

```text
PackageVersion v3
contains ProductVersion P1-v2
```

Later:

```text
Product P1-v3 published
```

PackageVersion v3 still contains:

```text
P1-v2
```

If the business wants the package to use P1-v3:

create/edit and publish a new PackageVersion.

---

## PackageItem

Conceptually:

```text
PackageItem
├── packageVersionId
├── productId
├── productVersionId
├── quantity
├── item configuration/defaults
├── ordering
└── commercial role
```

Exact fields depend on the final package model.

---

## PackageItem ≠ ProductVersion

Permanent.

PackageItem describes inclusion in a specific package.

---

## PackageItem ≠ Proposal line

Permanent.

---

## PackageItem ≠ Contract obligation

Permanent.

---

## PackageItem ≠ InvoiceLine

Permanent.

---

## PackageItem quantity ≠ fulfillment quantity completed

Critical.

Catalog:

> Includes 5 LinkedIn posts.

Fulfillment:

> 3 delivered, 2 pending.

Those are separate downstream facts.

---

## Package composition history must survive Product archive

If a referenced Product is later archived:

historical PackageVersions remain reconstructable.

Archive cannot destroy the referenced ProductVersion.

---

## Current package sellability may change

An archived/unavailable Product may make a currently marketed Package:

```text
Unavailable / Needs attention
```

according to availability policy.

But it does not alter the historical PackageVersion definition.

---

## PriceBookEntry

Pricing remains distinct from Product/Package versions.

Conceptually:

```text
PriceBookEntry
├── id
├── organizationId
├── subjectType = PRODUCT | PACKAGE
├── subjectVersionId
├── amount
├── currency
├── pricing scope/context
├── effectiveFrom
├── effectiveTo
├── lifecycle
└── revision
```

---

## Price targets exact offering definition

Preferred:

```text
PriceBookEntry
→ ProductVersion
```

or:

```text
PriceBookEntry
→ PackageVersion
```

rather than a permanently ambiguous price against “whatever is current”.

This preserves traceability.

---

## Version change ≠ price change necessarily

A Package's copy/benefits may change while its price remains the same.

Likewise price may change without altering Package composition.

Therefore:

> **definition version and pricing version are independent.**

---

## Price ≠ ProductVersion

Permanent.

---

## Price ≠ PackageVersion

Permanent.

---

## Current Price

`CurrentPrice` should be a resolver result:

```text
CatalogPricingService
    ↓
PriceBookEntry
```

not a manually synchronized duplicated Product field.

---

## Current price ≠ only historical price

Permanent.

---

## Missing Price ≠ zero Price

Absolute.

Example:

```text
PriceBookEntry amount = 0 USD
```

can deliberately mean Free.

But:

```text
No applicable PriceBookEntry
```

means pricing is missing/unavailable.

---

## Currency

Every price requires explicit currency.

No naked decimal.

---

## Availability

Availability answers:

> Can this exact offering/version currently be used for a new commercial action?

It should consider relevant policies without becoming a copy of lifecycle.

Conceptually:

```text
CatalogAvailabilityResolver
├── identity lifecycle
├── version state
├── price availability
├── composition validity
├── required component availability
└── policy restrictions
```

---

## Availability ≠ lifecycle

Valid:

```text
Package lifecycle = ACTIVE
Availability = UNAVAILABLE
Reason = no applicable current price
```

---

## Availability ≠ price

Permanent.

---

## Availability ≠ Proposal eligibility forever

Proposal snapshot creation performs its own final validation at capture time.

A stale detail-page badge is never sufficient authority.

---

## CommercialOverride

Customer-specific negotiated pricing/terms never become fields on Design 105's global Product/Package definition.

Permanent:

```text
Catalog Package = $1,500

Proposal for Client A = $1,250
```

Design 105 remains:

```text
$1,500
```

---

## Usage projections

If the frozen Design 105 shows historical usage such as:

* used in Proposals,
* active Contracts,
* invoices,

those should be read-only derived references to downstream snapshots.

Do not create mutable:

```text
product.usedInProposalCount
```

as commercial truth.

---

## Usage count ≠ permission to open underlying documents

A user may be allowed to know:

> Package has historical usage

without permission to inspect every Client Proposal/Contract.

---

# 4. Permissions

Design 105 should conceptually distinguish:

```text
catalog.read

product.read
product.editDraft
product.publish
product.archive

package.read
package.editDraft
package.manageComposition
package.publish
package.archive

catalogPricing.read
catalogPricing.manage

catalogAvailability.read
catalogAvailability.manage
```

Exact keys belong to Phase 3D.

---

## Product read ≠ edit

Permanent.

---

## Product edit ≠ publish

Critical where published commercial definitions require governance.

---

## Package edit ≠ composition manage necessarily

Potentially distinct if composition changes are more commercially sensitive.

---

## Product edit ≠ Package edit

Permanent.

---

## Definition edit ≠ pricing edit

Critical.

A content/product manager should not gain pricing authority merely because they can edit Product descriptions/benefits.

---

## Pricing edit ≠ negotiated-discount authority

Permanent.

---

## Proposal discount authority ≠ catalog pricing authority

Critical.

---

## Package publish ≠ Proposal approval

Permanent.

Publishing a catalog Package means:

> available/eligible for future Sales use.

It does not authorize any specific client's Proposal.

---

## Catalog owner ≠ authorization role

Permanent.

---

## Product/Package historical usage read ≠ underlying commercial-document read

Permanent.

---

## Catalog read ≠ price read necessarily

If the product requires restricted pricing visibility, field-level price authorization must be supported.

---

## Current price visibility ≠ price-management authority

Permanent.

---

## Archive permission ≠ delete historical usage

Archive merely governs future use.

---

## Direct ProductVersion ID reauthorizes

Permanent.

---

## Direct PackageVersion ID reauthorizes

Permanent.

---

## Direct PriceBookEntry ID reauthorizes

Permanent.

---

## Cross-tenant PackageItem relation prohibited

Absolute.

---

## Cross-tenant pricing prohibited

Absolute.

---

## Browser cannot publish arbitrary version

Server must verify:

* version belongs to the Product/Package,
* version is valid,
* composition valid,
* actor authorized,
* expected revision current.

---

# 5. States

Design 105 must keep **entity lifecycle, definition-version state, draft/published relationship, pricing state, availability, package-composition validity, and historical usage** separate.

### Product lifecycle

```text
Draft
Active
Inactive
Archived
```

### ProductVersion

```text
Draft
Published
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
Published
Superseded
Historical
```

### Pricing

```text
No Applicable Price
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

### Package composition

```text
Valid
Needs Attention
Incomplete
Restricted
Unavailable
```

These must not collapse into one generic status.

---

## Product active ≠ ProductVersion draft

Permanent.

Valid:

```text
Product = ACTIVE
Published version = v3
Draft version = v4
```

---

## Draft v4 exists ≠ v4 is current published definition

Critical.

Exactly like Proposal/Contract version boundaries.

---

## Publishing v4 ≠ deleting v3

Permanent.

v3 becomes historical/superseded as appropriate.

---

## Package active ≠ composition valid

Permanent.

---

## Composition valid ≠ current Price exists

Permanent.

---

## Price active ≠ offering available

Permanent.

Other restrictions may apply.

---

## Price scheduled ≠ current price

Permanent.

---

## Price expired ≠ Product archived

Permanent.

---

## Product archived ≠ ProductVersion deleted

Absolute.

---

## Package archived ≠ historical PackageVersion invalid

Absolute.

---

## New ProductVersion ≠ PackageVersion auto-updated

Critical.

---

## New PackageVersion ≠ Proposal updated

Permanent.

---

## Product price changed ≠ Contract changed

Permanent.

---

## Price service unavailable ≠ zero

Absolute.

---

## Composition service unavailable ≠ Package empty

Absolute.

---

## Availability resolver unavailable ≠ offering unavailable

Use:

> Availability unknown/unavailable.

---

## Usage service unavailable ≠ zero usage

If usage summary exists:

```text
Usage unavailable
≠
Used 0 times
```

---

## State Coverage

Design 105 inherits Design 150 plus:

```text
Product Detail Loading
Product Detail Available
Product Detail Restricted

Package Detail Loading
Package Detail Available
Package Detail Restricted

Product Active
Product Inactive
Product Archived

Product Version Draft
Product Version Published
Product Version Superseded
Product Version Historical
New Product Draft Exists

Package Active
Package Inactive
Package Archived

Package Version Draft
Package Version Published
Package Version Superseded
Package Version Historical
New Package Draft Exists

Catalog Price Missing
Catalog Price Scheduled
Catalog Price Active
Catalog Price Expired
Pricing Unavailable

Offering Available
Offering Unavailable
Offering Restricted
Availability Unknown

Package Composition Valid
Package Composition Needs Attention
Package Composition Incomplete
Package Composition Unavailable

Referenced Product Archived
Referenced Product Version Historical
Referenced Product Restricted

Historical Usage Available
Historical Usage Restricted
Historical Usage Unavailable

Catalog Updated Elsewhere
Version Updated Elsewhere
Pricing Updated Elsewhere
Version Conflict
Partial Offering Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should make the **catalog identity + exact commercial definition currently being inspected** dominant.

For Product:

```text
Product identity
↓
Published/draft version
↓
Commercial definition
↓
Current pricing
↓
Availability
↓
Version history
↓
Historical usage if frozen
```

For Package:

```text
Package identity
↓
Published/draft version
↓
Package composition
↓
Current pricing
↓
Availability
↓
Version history
↓
Historical usage if frozen
```

---

## Product and Package can share shell, not semantics

A Product detail should not display fake empty Package composition controls.

A Package detail should clearly communicate it is a bundle.

Use discriminated composition inside the shared detail template.

---

## Exact version must remain visible

If:

```text
Published = v3
Draft = v4
```

the UI must not simply say:

> Version 4

and imply it is the currently sellable version.

---

## Current price should be explicitly contextual

Prefer semantics such as:

> Current catalog price: $1,500 USD

rather than:

> Price: $1,500

where version/effective-date ambiguity could matter.

---

## Package item versions should be understandable

Where frozen design exposes component details, the implementation should be capable of distinguishing:

> Product A — version 2

from merely:

> Product A

when exact composition matters.

---

## Tablet

Following Design 152:

* identity/version remains first,
* package composition becomes stacked rows/cards,
* price/availability remain prominent,
* version history compresses vertically,
* actions remain touch-safe.

---

## Mobile

Product priority:

```text
Product
↓
Published version
↓
Definition
↓
Current price + currency
↓
Availability
↓
Version/history
```

Package priority:

```text
Package
↓
Published version
↓
Current price + currency
↓
Availability
↓
Included products
↓
Version/history
```

---

## Mobile composition

Do not compress:

```text
Product
Version
Quantity
Availability
```

into an unreadable multi-column desktop table.

Use structured rows/cards.

---

## Pricing failure on mobile

Show:

> Pricing unavailable

not:

> $0.

---

## Accessibility

A Package detail could communicate:

> Executive Authority Package. Stable package PK-200. Published version 3. Draft version 4 exists but is not published. Version 3 contains four products. Current catalog price is 1,500 US dollars. Package is available for new commercial use.

where canonical authorized data supports it.

---

# 7. Backend Requirements

## Canonical detail architecture

```text
Design 105
    ↓
Authenticated Workspace Context
    ↓
CatalogOfferingDetailQueryService
    │
    ├── ProductAdapter
    │      └── ProductVersionAdapter
    │
    ├── PackageAdapter
    │      ├── PackageVersionAdapter
    │      └── PackageItemAdapter
    │
    ├── PricingAdapter
    ├── AvailabilityResolver
    └── downstream usage projection if present
    ↓
CatalogOfferingDetailView
```

---

## Detail projection remains read-only composition

Avoid:

```text
CatalogOfferingDetailRecord {
   product,
   package,
   price,
   composition,
   availability
}
```

as canonical mutable source truth.

---

## Type-discriminated detail query

Conceptually:

```text
getCatalogOfferingDetail(
    offeringType,
    offeringId,
    selectedVersionId?,
    currentMembership
)
```

The type must be validated against the actual canonical entity.

Do not let a Product ID be interpreted as Package ID through client tampering.

---

## Product draft creation

Conceptually:

```text
createProductVersionDraft(
    productId,
    sourceVersionId?,
    expectedProductRevision
)
```

should:

1. authorize;
2. load Product;
3. verify tenant;
4. resolve source version if cloning;
5. create new draft definition;
6. preserve published version;
7. emit event/Audit.

---

## Package draft creation

Same principle:

```text
createPackageVersionDraft(...)
```

Existing published PackageVersion remains untouched.

---

## Publish ProductVersion

Conceptually:

```text
publishProductVersion(
    productId,
    productVersionId,
    expectedProductRevision,
    expectedVersionRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. confirm version belongs to Product;
3. confirm version remains Draft/publishable;
4. validate commercial definition;
5. preserve previous published version;
6. atomically set the new published/current definition reference;
7. mark prior version superseded/historical according to policy;
8. emit Audit/outbox.

---

## Publish is idempotent

Retry cannot publish twice or corrupt current-version pointers.

---

## Published-version pointer + lifecycle transition atomicity

Never permit:

```text
Product says current = v4

but

v4 remains Draft
```

because publication partially failed.

---

## Publish PackageVersion

Package publication requires stronger validation.

Conceptually:

```text
publishPackageVersion(...)
```

must validate every required `PackageItem`.

---

## PackageItem validation

At publication:

* referenced Product exists;
* same organization;
* exact ProductVersion exists;
* ProductVersion is valid for reference;
* quantity/config valid;
* required items are resolvable;
* no invalid duplicate relations according to policy;
* no unsupported recursive/cyclic composition.

---

## Exact ProductVersion pinning is critical

A published PackageVersion should not depend on:

```text
product.currentPublishedVersionId
```

for historical composition.

Instead:

```text
PackageItem.productVersionId
```

or equivalent immutable snapshot/reference should be pinned.

---

## Updating component Product requires explicit Package revision

Correct:

```text
Package v3
uses Product A v2

Product A v3 published
        ↓
Package v3 unchanged

To use A v3:
create/publish Package v4
```

This eliminates cascading historical mutation.

---

## Price creation

Conceptually:

```text
createPriceBookEntry(
    offeringVersionId,
    amount,
    currency,
    effective window/context,
    expectedPricingRevision
)
```

---

## Price values use decimal-safe storage

Absolute.

---

## Price overlap validation

For the same:

```text
offeringVersion
pricing scope
currency
```

ambiguous overlapping effective records should be prevented or resolved through an explicit deterministic priority policy.

Never random selection.

---

## Price publication/activation

Changing a price must preserve prior PriceBookEntry history.

Do not update historical amount in place when provenance matters.

---

## Scheduled price

A future PriceBookEntry can coexist with current price.

Therefore:

```text
currentPrice
≠
latestCreatedPrice
```

Critical.

---

## Pricing resolver

Conceptually:

```text
resolveCatalogPrice(
    offeringVersionId,
    commercialContext,
    effectiveAt
)
```

must return:

```text
exact PriceBookEntry
```

plus resolution metadata.

---

## No applicable price

Return explicit:

```text
NO_APPLICABLE_PRICE
```

not amount `0`.

---

## Availability resolver

Conceptually:

```text
resolveOfferingAvailability(
    offeringId,
    offeringVersionId,
    effectiveAt,
    commercialContext
)
```

may evaluate:

* Product/Package lifecycle,
* version publication state,
* current pricing availability,
* package composition validity,
* explicit availability policy.

---

## Availability resolver must be server-authoritative

Frontend cannot decide a Package is sellable merely because:

> lifecycle = ACTIVE.

---

## Availability ≠ Proposal creation authorization

When actual Proposal creation happens, `CommercialSnapshotService` must revalidate current eligibility.

This protects against stale UI.

---

## Commercial snapshot capture

This remains the strongest cross-domain requirement.

Conceptually:

```text
captureCommercialSnapshot(
    offeringSelection,
    deal/client context,
    commercial overrides,
    current actor
)
```

should:

1. authorize use of Product/Package;
2. resolve exact eligible offering version;
3. resolve exact PackageItems/ProductVersions;
4. resolve exact applicable PriceBookEntry;
5. validate currency;
6. authorize any override/discount;
7. calculate exact offer values;
8. snapshot names/descriptions/benefits/quantities;
9. persist source provenance;
10. return immutable snapshot payload to ProposalVersion creation.

---

## Snapshot capture must be concurrency-safe

Example race:

```text
Package v3 read
Price P1 read
Package v4 publishes concurrently
Price P2 activates concurrently
```

The snapshot must still be internally consistent.

Pin exact:

```text
PackageVersion
ProductVersions
PriceBookEntry
```

before finalizing.

---

## Snapshot does not use “latest” after pinning

Absolute.

---

## Proposal reopening/editing

If an existing draft Proposal deliberately refreshes catalog pricing/content:

that must be an explicit governed Proposal action creating/updating its own draft/version semantics.

Catalog update never pushes changes silently.

---

## Contract creation

Contract uses agreed Proposal snapshot.

It does not invoke:

```text
resolveCatalogPrice()
```

again for agreed commercial terms.

---

## Invoice creation

Invoice uses exact billable commercial source.

It does not invoke current catalog pricing to reinterpret the agreement.

---

## Archive Product

Conceptually:

```text
archiveProduct(productId, expectedRevision)
```

should:

* authorize,
* mark future lifecycle appropriately,
* preserve ProductVersions,
* preserve Package/Proposal/Contract/Invoice lineage,
* re-evaluate current Package availability where necessary,
* emit event/Audit.

---

## Archive Package

Same principle.

---

## Archive ≠ cascade delete

Absolute.

---

## Product archive impact on Package

If current PackageVersion uses that Product:

`CatalogAvailabilityResolver` may mark the Package:

> needs review/unavailable for future use

according to policy.

It must not mutate the PackageVersion's historical composition.

---

## Historical usage query

If present in frozen detail:

query downstream snapshot references in a permission-aware manner.

Do not reconstruct historical usage from current mutable Product names/prices.

---

## Usage count and data visibility

Count calculation must not leak restricted:

* Clients,
* Deals,
* Contract values.

Use permission-safe aggregates.

---

## Optimistic concurrency

All draft/config/pricing edits need expected revision.

Example:

User A edits Package composition while User B publishes.

One must fail/reload rather than silently overwrite.

---

## Version-publication race

Two drafts cannot both become `currentPublishedVersionId` through last-write-wins.

Use atomic version/current-pointer update.

---

## Price-edit race

Concurrent price changes need conflict/overlap validation under transaction.

---

## Events/outbox

Useful events:

```text
ProductVersionCreated
ProductVersionPublished
ProductArchived

PackageVersionCreated
PackageVersionPublished
PackageArchived

PackageCompositionChanged
PriceBookEntryCreated
PriceBookEntryActivated
PriceBookEntryExpired
CatalogAvailabilityChanged
```

---

## Notification integration

Design 080 may notify catalog administrators about:

* invalid package,
* scheduled price activation,
* offering requiring attention,

if frozen product rules support notifications.

Notification does not own catalog truth.

---

## Search integration

Design 079 may index safe Product/Package metadata.

The Search index must never be used to resolve canonical pricing or current version.

---

## Activity

Catalog Activity can show version/pricing changes.

Activity remains distinct from:

* ProductVersion,
* PackageVersion,
* PriceBookEntry,
* Audit.

---

## Audit

Material operations should record:

* Product/Package version creation,
* publication,
* composition changes,
* price creation/supersession,
* archival,
* material availability changes.

Exact old/new commercial values should be safely recorded where policy permits without leaking them to unauthorized users.

---

## Cache behavior

Detail caches should vary by:

```text
organizationMembershipId
offeringId
offeringType
selectedVersionId
authorizationRevision
offeringRevision
versionRevision
pricingRevision
availabilityRevision
```

---

## Never cache current price indefinitely

Current price depends on:

* effective time,
* pricing revision,
* context.

Time-based activation/expiry requires correct invalidation/TTL scheduling.

---

## Historical definitions can cache aggressively

Published immutable ProductVersion/PackageVersion content can be cached safely by exact version ID, subject to permissions.

---

## Performance

Use:

* exact Product/Package version queries,
* batched PackageItem/ProductVersion resolution,
* indexed effective pricing,
* precomputed safe availability summaries,
* lazy history/usage.

Do not repeatedly reconstruct downstream historical documents.

---

## Partial failure contract

Example:

```text
Package core         ✓
Published version    ✓
Package composition  ✓
Pricing              ✕
Availability resolver partial
Historical usage     ✕
```

Design 105 still renders:

> Package PK-200
> Published v3
> 4 included products
> Pricing unavailable
> Availability cannot be fully evaluated
> Historical usage unavailable

Not:

> Price $0
> Package unavailable
> Used 0 times.

---

## Backend Requirement Matrix

| Requirement                                        | Status                    |
| -------------------------------------------------- | ------------------------- |
| Design 104 canonical Product/Package reuse         | **Critical**              |
| Product/ProductVersion separation                  | **Critical**              |
| Package/PackageVersion separation                  | **Critical**              |
| Product/Package domain separation                  | **Critical**              |
| Shared detail template/domain-model separation     | **Critical**              |
| Published-version immutability                     | **Critical**              |
| Draft/published version distinction                | **Critical**              |
| Stable currentPublishedVersion reference           | **Critical**              |
| Version publication atomicity                      | **Critical**              |
| Version publication idempotency                    | **Critical**              |
| Publication concurrency protection                 | **Critical**              |
| PackageItem first-class                            | **Critical**              |
| PackageVersion pins exact ProductVersion lineage   | **Critical**              |
| Product new version does not mutate PackageVersion | **Critical**              |
| Package composition validation                     | **Critical**              |
| Cross-tenant PackageItem prohibition               | **Critical**              |
| Product/archive history preservation               | **Critical**              |
| Package/archive history preservation               | **Critical**              |
| PriceBookEntry/offering definition separation      | **Critical**              |
| Pricing exact-version provenance                   | **Critical**              |
| Decimal-safe prices                                | **Critical**              |
| Explicit currency                                  | **Critical**              |
| Missing price/$0 separation                        | **Critical**              |
| Effective price/date semantics                     | **Critical**              |
| Current price/latest-created price separation      | **Critical**              |
| Pricing overlap/conflict validation                | **Critical**              |
| Price history retention                            | **Critical**              |
| Lifecycle/availability separation                  | **Critical**              |
| Composition validity/availability separation       | **Critical**              |
| Server-authoritative availability resolver         | **Critical**              |
| Catalog price/customer override separation         | **Critical**              |
| Pricing edit/discount permission separation        | **Critical**              |
| Commercial snapshot exact-version pinning          | **Critical**              |
| Snapshot atomic consistency                        | **Critical**              |
| Snapshot idempotency                               | **Critical**              |
| Proposal independence from later catalog updates   | **Critical**              |
| Contract independence from current catalog         | **Critical**              |
| Invoice independence from current catalog          | **Critical**              |
| Package/WorkflowTemplate separation                | **Critical architecture** |
| Product benefit/Deliverable instance separation    | **Critical architecture** |
| Permission-safe downstream usage summaries         | **Required if present**   |
| Optimistic concurrency                             | **Critical**              |
| Search not pricing authority                       | **Critical**              |
| Permission-safe caching                            | **Critical**              |
| Time-aware price-cache invalidation                | **Critical**              |
| Audit/outbox integration                           | **Required**              |
| Partial dependency failure handling                | **Critical**              |

---

# 8. Consolidation

Design 105 exposes the most important detail-level risks in the commercial catalog family.

**Product / ProductDetailView conflation**
Detail composition becomes second Product backend.

**Package / PackageDetailView conflation**
UI projection becomes commercial source truth.

**Product / Package conflation**
Shared UI template erases bundle-vs-offering semantics.

**Product / ProductVersion conflation**
Current editable definition rewrites historical meaning.

**Package / PackageVersion conflation**
Package composition changes retroactively.

**Published version / Draft version conflation**
Unpublished commercial changes appear sellable.

**Latest version / current published version conflation**
Newest draft accidentally becomes Sales truth.

**Publishing / mutable PATCH conflation**
No immutable version history remains.

**Product rename / Product recreation conflation**
Stable business identity duplicates.

**Package rename / Package recreation conflation**
Historical package references fragment.

**PackageItem / Product conflation**
Composition relation disappears.

**PackageItem / ProductVersion conflation**
Package cannot preserve which exact definition it included.

**PackageVersion / current ProductVersion conflation**
Product update mutates old Package definition.

**Product v3 publication / Package auto-upgrade conflation**
Historical Package changes without its own version.

**PackageItem / Proposal line conflation**
Reusable bundle composition becomes client offer.

**PackageItem / InvoiceLine conflation**
Catalog inclusion becomes billing evidence.

**Package quantity / fulfillment progress conflation**
Included amount becomes delivery progress.

**Product benefit / Deliverable instance conflation**
Catalog promise becomes actual client artifact.

**Package / Project conflation**
Commercial configuration becomes fulfillment work.

**Package / WorkflowTemplate conflation**
Sales promise and operational process collapse.

**Product archive / ProductVersion deletion conflation**
Historical evidence disappears.

**Package archive / PackageVersion deletion conflation**
Old Proposal cannot reconstruct source.

**Product archived / historical Package invalid conflation**
Old bundle becomes broken retrospectively.

**Product archived / current Package still automatically sellable conflation**
Future commercial eligibility is not reevaluated.

**Price / ProductVersion conflation**
Definition change and price change become inseparable.

**Price / PackageVersion conflation**
Pricing update creates unnecessary composition revision.

**Current price / latest-created PriceBookEntry conflation**
Future scheduled price activates early.

**Price amount / currency conflation**
Commercial values become ambiguous.

**Missing price / free price conflation**
Service/configuration error becomes `$0`.

**Price expired / Product inactive conflation**
Pricing lifecycle disables identity.

**Product active / offering available conflation**
Missing price still appears sellable.

**Package active / composition valid conflation**
Broken component configuration remains sellable.

**Availability / lifecycle conflation**
Temporary restriction archives Product.

**Availability badge / Proposal authorization conflation**
Stale UI state permits invalid sale.

**Catalog price / negotiated price conflation**
Client-specific discount changes global catalog.

**Price management / discount authority conflation**
Sales rep gains system-wide pricing control.

**Proposal override / new PackageVersion conflation**
One customer's negotiation alters catalog version history.

**CommercialSnapshot / live Product pointer conflation**
Proposal later changes with catalog.

**ProductVersion provenance / dynamic dependency conflation**
Historical Proposal fails when Product service is down.

**PackageVersion provenance / latest lookup conflation**
Old Proposal gains newer Product content.

**PriceBookEntry provenance / current-price lookup conflation**
Historical Proposal reprices itself.

**Catalog update / Proposal revision conflation**
Global change silently edits client's draft/issued version.

**Catalog update / Proposal approval invalidation conflation**
Approved snapshot changes underneath ApprovalRequest.

**Catalog update / Contract amendment conflation**
Global config silently alters signed agreement.

**Catalog update / Invoice correction conflation**
Future price update changes issued bill.

**Contract creation / current catalog resolution conflation**
Agreed Proposal terms are ignored.

**Invoice creation / current catalog resolution conflation**
Current price replaces Contract/agreed price.

**Snapshot capture / multiple “latest” calls conflation**
Mixed versions enter one Proposal.

**Concurrent package/price publication / inconsistent snapshot conflation**
Proposal gets v3 composition plus v4 price accidentally.

**Browser-selected PriceBookEntry / pricing authority conflation**
Client tampers with price selection.

**Browser-selected ProductVersion / eligibility authority conflation**
Old/unauthorized version is sold.

**Generic Product PATCH / published history conflation**
Historical definitions mutate.

**Generic Package PATCH / published composition conflation**
Old bundles change.

**Generic Price PATCH / price history conflation**
Cannot reproduce previous quote.

**Price overlap / valid deterministic pricing conflation**
Different requests resolve different applicable prices.

**Catalog read / pricing read conflation**
Sensitive prices leak.

**Product edit / pricing edit conflation**
Content editor changes money.

**Product owner / publication authority conflation**
Operational ownership becomes commercial governance.

**Package edit / underlying Product edit conflation**
Package manager modifies Product master data.

**Historical usage count / document access conflation**
Catalog viewer gains customer visibility.

**Historical usage unavailable / zero usage conflation**
Outage creates false analytics.

**Search result / canonical current version conflation**
Stale index drives Sales decisions.

**Search result price / PricingResolver conflation**
Cached Search price becomes quote authority.

**Price cache / effective-time semantics conflation**
Expired/scheduled price stays active.

**Catalog service failure / historical-document failure conflation**
Issued documents become unavailable.

**Pricing failure / $0 conflation**
Commercial loss risk.

**Composition failure / empty Package conflation**
Sales sells incomplete package.

**105/104 duplicate Product/Package backend**
Library and Detail diverge.

**105/018 duplicate Proposal product model**
Proposal creates its own catalog identities.

**105/097–098 duplicate Proposal commercial truth**
Approval sees live catalog instead of exact snapshot.

**105/099–100 duplicate Contract commercial configuration**
Signed terms depend on Product detail.

**105/101–103 duplicate Invoice pricing model**
Finance recalculates from Product detail.

**105/109–110 Package/WorkflowTemplate conflation**
Commercial package and operational template become one entity.

No additional screen is required.

These are **catalog-detail identity, exact version publication, deterministic package composition, version-aware pricing, availability, snapshot integrity, downstream historical independence, permissions, concurrency, and fulfillment-boundary requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PRODUCT/PACKAGE DETAIL, VERSION, COMPOSITION & PRICING GOVERNANCE ANCHOR**

**Domain directive:**
**Product ≠ ProductVersion/OfferingDefinition ≠ Package ≠ PackageVersion ≠ PackageItem ≠ PriceBookEntry ≠ Availability ≠ CommercialOverride ≠ ProposalSnapshot ≠ ContractSnapshot ≠ InvoiceLine ≠ Project/Deliverable.**

**Identity directive:**
Design 104 remains the canonical Product/Package collection foundation. Design 105 opens those exact stable Product/Package IDs and never creates separate detail entities.

**Template directive:**
Product and Package may use one reusable detail template and shared primitives, but canonical Product, ProductVersion, Package, PackageVersion and PackageItem semantics remain independently modeled.

**Product-version directive:**
materially published Product definitions are versioned and historically immutable. A new definition creates/publishes a new ProductVersion rather than rewriting the meaning of the prior version.

**Package-version directive:**
material Package composition changes create a new PackageVersion. Published PackageVersions remain deterministic and historically reproducible.

**Composition directive:**
every published PackageVersion must identify exactly which Product/ProductVersion definitions it contains. It must never depend on a runtime “latest ProductVersion” lookup for historical composition.

**No-auto-upgrade directive:**
publishing Product v3 does not update Package v2/v3 automatically. A Package must explicitly publish another PackageVersion to adopt the newer Product definition.

**Quantity directive:**
PackageItem quantity/configuration describes the reusable commercial promise and remains separate from client fulfillment progress, Tasks, Milestones and actual Deliverables.

**Workflow directive:**
commercial Package and future Project/WorkflowTemplate remain separate. A Package can reference or seed operational configuration later, but neither owns the other's lifecycle or history.

**Pricing directive:**
PriceBookEntry remains independent from Product/Package definitions and uses decimal-safe amount + explicit currency + effective context/version provenance.

**Current-price directive:**
`current price` is a deterministic PricingResolver result, not simply the newest PriceBookEntry or a mutable Product field.

**Zero-price directive:**
intentional zero/free pricing, no applicable price and pricing-service unavailability are three different states.

**Effective-pricing directive:**
future scheduled prices, current prices and expired historical prices may coexist. Overlapping ambiguous pricing for one scope must fail safely or follow an explicit deterministic priority policy.

**Price-history directive:**
price changes preserve previous PriceBookEntries instead of rewriting prices required for historical commercial provenance.

**Availability directive:**
Product/Package lifecycle, version publication, price validity, composition validity and current sales availability remain separate state dimensions.

**Availability-safety directive:**
stale UI availability is never sufficient authorization to sell. Actual Proposal snapshot capture performs a fresh server-side eligibility/pricing check.

**Archive directive:**
archiving a Product/Package removes or limits future commercial use without deleting ProductVersions, PackageVersions, pricing provenance, or downstream references.

**Historical-package directive:**
archiving an underlying Product can affect current Package sellability but can never mutate the PackageVersion that historically included it.

**Override directive:**
negotiated customer-specific price/discount belongs to the Proposal/commercial snapshot. It never modifies the global Product, Package, PackageVersion, or PriceBookEntry.

**Authorization directive:**
catalog read, definition editing, version publication, Package composition, pricing administration, availability control and negotiated commercial overrides remain independently server-authorized.

**Pricing-security directive:**
permission to discount one Deal/Proposal does not grant permission to edit global PriceBook entries; permission to edit Product content does not grant pricing authority.

**Snapshot directive:**
`CommercialSnapshotService` is the mandatory boundary between mutable current catalog configuration and immutable client-specific Proposal commercial evidence.

**Snapshot-consistency directive:**
snapshot capture pins one internally consistent set of ProductVersion, PackageVersion, PackageItem and PriceBookEntry identities under concurrency protection. Sequential “latest” lookups must never produce mixed commercial revisions.

**Snapshot-provenance directive:**
downstream Proposal snapshots preserve exact Product/Package/version/pricing provenance while carrying enough copied commercial data to remain reconstructable when the catalog is archived or unavailable.

**Proposal directive:**
Designs 018/097–098 retain complete authority over ProposalVersion content/approval. Catalog edits never silently refresh, reprice, supersede or invalidate an existing ProposalVersion.

**Contract directive:**
Designs 019/099–100 retain authority over legal terms. Contract creation consumes agreed Proposal/commercial snapshots and never resolves today's catalog values again.

**Invoice directive:**
Designs 020/101–103 retain authority over issued billing. Invoice creation consumes the agreed billable source and never recalculates historical obligation from current Product/Package pricing.

**Concurrency directive:**
draft editing, publication, Package composition and pricing modifications use revision/transaction safeguards. Concurrent users cannot silently publish conflicting versions or overlapping prices.

**Publication directive:**
publishing a version atomically validates it, changes the appropriate current-published pointer, preserves previous versions, and emits durable events/Audit. Generic mutable `PATCH` must not bypass this transition.

**Idempotency directive:**
version publication and commercial snapshot capture are replay-safe. Retries cannot create duplicate publications or differing snapshots for one operation.

**Search directive:**
Design 079 may index safe Product/Package metadata but Search never becomes an authority for current version, availability or commercial price.

**Caching directive:**
current catalog/pricing caches are revision-, permission-, context-, and time-aware. Immutable historical versions can be cached by exact version ID, but effective pricing cannot be cached past activation/expiry boundaries incorrectly.

**Partial-failure directive:**
offering identity, version, composition, pricing, availability and usage projections can fail independently. `Pricing unavailable` never becomes `$0`; `composition unavailable` never becomes empty; `usage unavailable` never becomes zero.

**Performance directive:**
use exact-version reads, batched PackageItem/ProductVersion resolution, indexed effective-price queries and lazy history/usage rather than N+1 catalog/domain calls.

**Audit directive:**
material Product/Package version publication, composition changes, pricing changes, archival and availability-policy changes generate actor/version-aware Audit evidence while downstream commercial documents retain their own immutable history.

**Future-reuse directive:**
Design **106 — Client Conversion / Won Deal Handoff** must consume exact Deal/Proposal/Contract/Product/Package commercial lineage without treating Product/Package selection itself as proof of a won Deal, Client relationship, Contract execution, Project creation, or billing authorization.

**Overlap directive:**
Designs **018–020, 096–106** must preserve one continuous **Product/Package → Exact Catalog Version → Deterministic Price → Proposal Commercial Snapshot → Contract Terms Snapshot → Invoice Billing Snapshot → Client/Project Handoff** lineage while keeping catalog configuration, negotiation, legal agreement, billing and operational fulfillment independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PRODUCT/PACKAGE DETAIL FOUNDATION — STABLE PRODUCT/PACKAGE IDENTITIES + IMMUTABLE PUBLISHED PRODUCTVERSION/PACKAGEVERSION DEFINITIONS + PACKAGEITEMS PINNING EXACT PRODUCTVERSION LINEAGE + INDEPENDENT EFFECTIVE-DATED CURRENCY-SAFE PRICEBOOK ENTRIES + SERVER-DERIVED AVAILABILITY + NON-DESTRUCTIVE ARCHIVAL + AUTHORIZED CUSTOMER-SPECIFIC OVERRIDES + CONCURRENCY-SAFE COMMERCIAL SNAPSHOT CAPTURE + COMPLETE DOWNSTREAM SOURCE PROVENANCE — AND NEVER ALLOW “LATEST” LOOKUPS, PRODUCT AUTO-UPGRADES, CATALOG PRICE EDITS, ARCHIVAL, SEARCH/CACHE STATE OR DETAIL-PAGE MUTATIONS TO REWRITE EXISTING PACKAGE COMPOSITION OR HISTORICAL PROPOSAL, CONTRACT, INVOICE, PROJECT, OR DELIVERABLE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **105 / 153** |
| **PASS**                                   |                        **105** |
| **STANDARDIZE decisions**                  |                        **103** |
| **Potential implementation-overlap flags** |                         **96** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**105 / 153 = 68.6% audited.**

### Canonical Product/Package architecture after Design 105

```text
PRODUCT P1
   │
   ├── ProductVersion v1
   ├── ProductVersion v2
   └── ProductVersion v3

PACKAGE PK1
   │
   ├── PackageVersion v1
   ├── PackageVersion v2
   └── PackageVersion v3
            │
            ├── PackageItem → Product P1 / ProductVersion v2
            ├── PackageItem → Product P2 / ProductVersion v4
            └── PackageItem → Product P3 / ProductVersion v1

PackageVersion v3
        │
        ↓
PriceBookEntry PB7
$1,500 USD
        │
        ↓
CommercialSnapshot
        │
   ┌────┼─────┐
   ↓    ↓     ↓
Proposal Contract Invoice
```

The strongest Package-version invariant is now:

```text
Package v3
contains Product A v2

Later:
Product A v3 published

RESULT:

Product current version = v3
Package v3 still uses   = Product A v2

To use Product A v3:
publish Package v4.

NO automatic mutation.
```

Pricing remains equally independent:

```text
Package v3
composition unchanged

Price P1
$1,000 USD
valid until Aug 31

Price P2
$1,500 USD
valid from Sep 1

Definition version
        ≠
pricing version.
```

And the downstream commercial boundary remains immutable:

```text
Current Package: $1,500

Old Proposal:    $1,000
Signed Contract: $1,000
Issued Invoice:  $1,000

Editing Design 105 today
changes FUTURE commercial use only.

It does not rewrite
Proposal,
Contract,
or Invoice history.
```

## Next Sequential Audit Target

### **Design 106 — Client Conversion / Won Deal Handoff**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
