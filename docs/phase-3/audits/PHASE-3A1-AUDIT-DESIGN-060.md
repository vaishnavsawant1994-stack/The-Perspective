# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 060 — Client Organization / Company Settings

Its frozen identity is locked.

Design 060 should become the **canonical Client Portal organization-profile and organization-scoped settings workspace** for company information that an authorized Client administrator is permitted to manage.

Its governing boundary is:

> **Client Organization ≠ Portal Organization Context ≠ Organization Profile ≠ Organization Settings ≠ Personal Profile ≠ Billing/Legal Snapshot ≠ Portal Membership ≠ Authorization Policy.**

The most important implementation rule is:

> **Editing company settings may update explicitly self-service organization profile/configuration fields, but must never silently rewrite legal identities, executed Contract data, Invoice billing snapshots, historic Reports, user memberships, roles, permissions, or personal profiles.**

---

# 1. Classification

| Audit field                                | Classification                                                                                                             |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                              | **060**                                                                                                                    |
| **Canonical name**                         | **Client Organization / Company Settings**                                                                                 |
| **Product area**                           | Client Portal / Organization Administration / Company Settings                                                             |
| **User surface**                           | **Client Portal**                                                                                                          |
| **Screen class**                           | Organization Profile + Organization-Scoped Settings Workspace                                                              |
| **Classification**                         | **Portal Settings Anchor — Client Organization Configuration Family**                                                      |
| **Primary purpose**                        | Let appropriately authorized Client administrators manage permitted company profile fields and organization-level defaults |
| **Primary canonical entity**               | **Client Organization / Organization**                                                                                     |
| **Profile entity**                         | **OrganizationProfile**                                                                                                    |
| **Settings entity**                        | **OrganizationSettings**                                                                                                   |
| **Portal context**                         | **ClientPortalOrganizationContext** / existing Client relationship scope                                                   |
| **Personal-profile dependency**            | Design 059                                                                                                                 |
| **Portal-team dependency**                 | Design 062                                                                                                                 |
| **Settings foundation**                    | Design 040                                                                                                                 |
| **Authorization foundation**               | Design 037                                                                                                                 |
| **Client foundation**                      | Design 021 — Client 360                                                                                                    |
| **Asset dependency**                       | Design 030 for organization logo/branding assets where used                                                                |
| **Contract dependency**                    | Designs 019 / 053                                                                                                          |
| **Finance dependency**                     | Designs 020 / 054                                                                                                          |
| **Future internal administration overlap** | Design 145 — Workspace / Organization Administration                                                                       |
| **Parent shell**                           | `ClientPortalShell` — Design 002                                                                                           |
| **Primary read model**                     | `ClientOrganizationSettingsView`                                                                                           |
| **Template family**                        | `OrganizationProfileSettingsTemplate`                                                                                      |
| **Auth**                                   | Required                                                                                                                   |
| **Authorization**                          | Active Portal membership + organization-settings administration capability                                                 |
| **Implementation priority**                | **Critical Organization Integrity / Client Administration**                                                                |
| **Reuse level**                            | **Very High with Designs 021/037/040/059/062/145**                                                                         |

Design 060 should answer:

> **“Which company information represents our Client organization in the Portal, which fields may I change for the organization, which defaults apply to our Portal users, and which legal, billing, access, or personal settings require separate workflows?”**

Canonical separation:

```text
                  CLIENT ORGANIZATION
                         │
            ┌────────────┼────────────┐
            ↓            ↓            ↓
 OrganizationProfile OrganizationSettings Portal Context
            │            │
            │            └── organization defaults
            │
            └── self-service company presentation
                         │
             ┌───────────┼───────────┐
             ↓           ↓           ↓
       Portal Users   Contracts    Finance
        Design 062     053          054
```

while these remain separate:

```text
PersonalProfile
PortalMembership
AuthorizationRole
ContractPartySnapshot
Invoice/BillingSnapshot
Verified Legal Identity
```

---

# 2. Reuse

## Design 021 remains the Client relationship anchor

Design 021 already established:

> **Company ≠ Contact ≠ Client ≠ Portal Organization ≠ Portal User.**

Design 060 should reuse that Client/account foundation.

It must not create a second organization just because the Client can edit settings.

Correct:

```text
Canonical Organization / Client relationship
               │
       ┌───────┴────────┐
       ↓                ↓
Internal Client 360   Client-safe Org Settings
Design 021           Design 060
```

---

## Design 040 remains the organization-settings foundation

Design 040 established:

```text
Platform defaults
       ↓
Organization settings
       ↓
User preference overrides where permitted
```

Design 060 should be the Client-facing subset of that organization-level configuration model.

It should not create a separate:

```text
clientPortalSettings
```

configuration universe.

---

## Design 059 remains personal settings

The separation is:

```text
059
"My profile / my preferences"

060
"Our company / our organization defaults"
```

A company administrator changing the organization timezone default does not overwrite another user's explicit personal preference if that preference is allowed.

---

## Design 062 remains membership/access administration

Design 060 may configure organization information.

Design 062 owns:

* Portal users,
* invitations,
* roles,
* team access,
* membership lifecycle.

Do not let Design 060 edit membership or permission records.

---

## Design 037 remains Authorization

Organization administrators may have permission to edit Design 060.

But Design 060 cannot itself define or escalate authorization.

Correct:

```text
Authorization determines
who can edit Company Settings

Company Settings do not determine
Authorization
```

---

## Design 030 for company branding assets

If the frozen UI contains:

* logo,
* organization avatar,
* branding image,

reuse:

```text
OrganizationProfile
       ↓
Asset / FileVersion
```

No company-settings-specific storage.

---

## Design 145 later uses the same organization domain

Later frozen:

**Design 145 — Workspace / Organization Administration**

Expected relationship:

```text
ONE ORGANIZATION DOMAIN
        │
        ├── Design 060
        │   Client-safe self-service organization settings
        │
        └── Design 145
            Internal/platform organization administration
```

Same identity/configuration foundation, different permissions and operational depth.

No merge decision now.

---

# 3. Entities

## Client Organization ≠ Portal Organization Context

The business organization exists independently from one application view.

The Portal context determines:

> Which Client account/organization is this authenticated membership currently operating under?

Correct:

```text
Organization O-101
      ↓
Portal context for Membership M-12
```

Do not create a new organization record per Portal session.

---

## Organization ≠ Client relationship

A company/business entity may exist before it becomes an active Client.

`Client` can represent the commercial/service relationship.

Do not blindly collapse:

```text
Organization
=
Client lifecycle
```

Historical CRM/company identity and Client relationship state may differ.

---

## OrganizationProfile ≠ OrganizationSettings

This distinction should be explicit.

### OrganizationProfile

Descriptive/presentation data, for example where present:

```text
company display name
logo
website
industry/category
business contact information
public/business description
```

### OrganizationSettings

Behavior/default configuration, for example where frozen:

```text
default timezone
locale
date/time formatting
other organization-scoped Portal defaults
```

These are different concerns.

---

## OrganizationProfile ≠ PersonalProfile

Changing:

> Company logo

does not modify any user's avatar.

Changing:

> Company support phone

does not silently change an employee/user's personal phone.

---

## Display name ≠ legal name

One of the most important company-data boundaries.

An organization might present publicly as:

> Acme AI

while its Contract legal party is:

> Acme Technologies GmbH.

Therefore:

```text
organizationDisplayName
≠
legalEntityName
```

unless explicitly verified as the same value.

---

## Legal name changes require governed semantics

A casual Organization Settings edit should not silently change:

* executed Contracts,
* invoices already issued,
* signer evidence,
* tax records,
* payment records.

If legal identity change is supported, it needs a governed business/legal workflow.

No new legal-change screen is introduced here.

---

## Company profile change ≠ ContractPartySnapshot update

Example:

```text
Executed Contract:
Acme Technologies GmbH
Berlin
August 2026
```

Later the company updates its profile to:

> Acme Global GmbH.

The historical Contract remains unchanged.

---

## Company profile change ≠ Invoice snapshot update

Issued Invoice:

```text
Bill To:
Acme Technologies GmbH
Address X
```

must remain historically reproducible even if Design 060 later changes the company's current business address.

---

## Organization address ≠ billing address automatically

Possible concepts can differ:

```text
business address
billing address
registered/legal address
shipping/delivery address
```

Do not represent all of them with one mutable:

```text
organization.address
```

if the business requires contextual distinctions.

---

## Organization address ≠ Contract address snapshot

Even if today's registered address is used to create a future Contract, historical Contracts preserve their own party snapshot.

---

## Tax identifier ≠ ordinary profile field

Tax/VAT/company registration IDs may be:

* verified,
* sensitive,
* legally significant.

If they appear in frozen Design 060, editing them should follow specific validation/governance.

Do not treat them like changing a website URL.

---

## Verified company field ≠ self-asserted field

A useful conceptual distinction may be:

```text
organizationProfileField
value
verification state/source
```

for legally or operationally significant fields.

Exact verification model belongs to Phase 3D.

Do not invent verification for every field.

---

## Company website ≠ verified domain identity

A Client entering:

> [https://example.com](https://example.com)

does not automatically prove ownership of:

> example.com.

If domain verification matters later for security/integrations, it requires dedicated verification.

---

## Organization email domain ≠ authentication domain automatically

Changing company domain must not:

* change every user's login email,
* automatically authorize new users,
* rewrite historical Contact addresses.

---

## Industry/profile data ≠ CRM enrichment truth automatically

Design 021/084–087 may contain CRM enrichment data.

Client-entered company profile information should have explicit source/provenance if synchronized to CRM.

Do not silently overwrite high-confidence internal business data without policy.

---

## Organization profile source of truth

For self-service fields, the Client-entered OrganizationProfile can become authoritative for that specific field.

For other fields, CRM/internal/legal systems may remain authoritative.

The source must be explicit by field/domain.

---

## OrganizationSettings ≠ arbitrary JSON

Avoid:

```text
organization.settings = {
  anythingTheBrowserSends: true
}
```

Prefer a SettingDefinition registry from Design 040:

```text
SettingDefinition
├── key
├── type
├── scope
├── default
├── validation
├── sensitivity
├── client-editable?
└── user-overridable?
```

---

## Organization settings need type validation

Examples:

```text
timezone → valid IANA timezone
locale → supported locale
week-start → supported enum
```

The backend validates them.

---

## Organization setting ≠ historical document metadata

Changing default locale from:

```text
en-US
```

to:

```text
de-DE
```

does not re-render historical Contracts/Invoices as though they were originally issued in another locale.

---

## Default timezone ≠ historical timezone

Same principle.

Changing organization timezone changes future/default display/business behavior where allowed.

It does not rewrite:

* Meeting timestamps,
* Approval timestamps,
* Contract timestamps,
* publication timestamps.

---

## Default currency ≠ transaction currency

If organization settings include a preferred/default currency:

```text
organization.defaultCurrency
```

does not change existing:

```text
Invoice.currency
Payment.currency
Contract monetary snapshot
```

Historical Finance remains immutable.

---

## Default currency change ≠ FX conversion

Never rewrite:

> USD 1,500

as:

> EUR 1,500

because company settings changed.

---

## Organization branding ≠ publication brand automatically

If the Client organization logo changes:

past published magazines, Reports, signed Contracts, or delivered artifacts should not all dynamically re-render unless designed to use current branding.

Historical artifacts pin exact Asset/FileVersions.

---

## Organization logo FileVersion

Correct:

```text
OrganizationProfile
→ current logo Asset

Historical Report/Contract
→ exact logo FileVersion if embedded
```

This preserves both current profile and historical artifact truth.

---

## Portal Organization Context ≠ Authorization Policy

Portal context answers:

> Which organization am I operating within?

Authorization answers:

> What may this membership do?

Never infer rights simply from knowing the organization ID.

---

## PortalMembership ≠ OrganizationSettings

Changing company settings does not:

* add users,
* activate users,
* remove users,
* change membership scopes.

---

## AuthorizationPolicy ≠ OrganizationPreference

An organization cannot disable backend security by changing a preference.

Security-critical policy belongs to dedicated authorization/security configuration.

---

## Module visibility preference ≠ authorization

If the product later allows UI/module preferences:

hiding a module is presentation.

It must not become the enforcement boundary.

---

## Organization deactivation ≠ Profile deletion

If a Client relationship or Portal organization is deactivated:

organization history may remain for:

* Contracts,
* Invoices,
* Reports,
* Audit,
* Projects.

Do not physically delete company data automatically.

---

## Organization rename history

A current display-name change can update present Portal presentation.

Historical legal/commercial artifacts remain linked to the same stable Organization ID plus their own snapshots.

---

## Stable organization ID

Never use:

* company name,
* website domain,
* email domain,

as the permanent primary identity.

Use a stable canonical organization ID.

---

# 4. Permissions

Design 060 requires stronger authorization than ordinary personal settings.

The basic rule is:

> **Only memberships explicitly authorized to administer organization settings may change self-service organization fields.**

---

## Membership in organization ≠ settings administrator

A normal Client participant should not automatically edit:

* company name,
* defaults,
* branding.

Conceptually:

```text
portal.organization.read
≠
portal.organization.manage
```

Exact names Phase 3D.

---

## Portal Administrator capability

Design 062 may assign a Client Portal role capable of managing organization settings.

That permission comes from canonical Authorization.

Design 060 does not decide who is admin.

---

## Organization manage ≠ Portal user manage

Possible separation:

```text
organization.manage_profile
≠
portal.users.manage
```

A company communications manager might update logo/profile without being authorized to invite users.

---

## Organization manage ≠ Role administration

Likewise:

```text
organization.manage
≠
portal.roles.assign
```

---

## Organization manage ≠ Finance administration

Company-profile editing does not authorize:

* Invoice changes,
* payments,
* refunds,
* billing corrections.

---

## Organization manage ≠ Contract authority

Editing company settings does not grant:

* Contract approval,
* legal signing,
* Contract amendment rights.

---

## Organization manage ≠ legal-data modification

Even authorized Portal organization administrators may be allowed to change:

* logo,
* website,
* public business information,

while legal fields remain read-only or governed.

Authorization should support field/category-level policies where necessary.

---

## Self-service field allowlist

Like Design 059, Design 060 should never expose a generic organization PATCH.

Dangerous:

```text
PATCH /organizations/:id
{ ...browserObject }
```

Correct:

```text
updateMyOrganizationProfile(allowedFields)
updateMyOrganizationSettings(allowedSettings)
```

against organization derived from the authenticated Portal context.

---

## Organization ID tampering

The backend must not trust:

```text
organizationId
```

from a form alone.

It should verify:

```text
current membership
→ active Portal organization
→ manage entitlement
```

before any mutation.

---

## Protected fields

Client self-service updates should reject attempts to modify protected/internal fields such as:

```text
tenantId
clientLifecycleStatus
organizationStatus
billingAccountId
legalVerificationState
riskScore
internalOwnerId
rolePolicies
permissions
createdBy
```

or equivalent.

Exact fields later.

---

## Company field visibility

Some fields may be visible to all Portal members while editable only to administrators.

Read and edit remain distinct permissions.

---

## Legal/billing fields

A company admin might view:

> Billing legal entity: Acme GmbH.

but any edit should route through Finance/legal governance if required.

Never infer edit permission from read visibility.

---

## Related organization data

Design 060 must not expose:

* internal CRM notes,
* revenue,
* Sales owner,
* renewal probability,
* internal segmentation,
* risk scores.

Use a Client-safe organization projection.

---

## Search/autocomplete

If settings include country/timezone/etc., generic reference-data search is fine.

But organization lookup must not expose other Client organizations.

---

# 5. States

Design 060 needs separate state dimensions.

### Organization profile state

```text
Organization Loading
Organization Available
Editing
Saving
Saved
Validation Error
Save Failed
Updated Elsewhere
```

### Branding/asset state

```text
Logo Uploading
Logo Processing
Logo Ready
Logo Failed
```

### Settings state

```text
Using Platform Default
Organization Override Active
Setting Save Failed
Setting Unsupported
```

### Governance state

```text
Field Editable
Field Read Only
Field Requires Verification
Verification Pending
Field Change Restricted
```

where relevant.

### Access state

```text
Organization Settings Restricted
Membership Revoked
Organization Portal Access Disabled
```

These must not become one `organization.status`.

---

## Profile save failed ≠ organization disabled

Technical mutation failure does not imply the Client organization is inactive.

---

## Logo failure ≠ company-profile failure

Text/company settings can remain saved while an uploaded logo fails processing.

---

## Verification pending ≠ save failed

A legally significant requested change can be successfully submitted yet await verification.

Do not describe it as an error.

---

## Read-only ≠ unavailable

A Client may be allowed to see a legal company field while not being permitted to modify it.

---

## Organization inactive ≠ Contract invalid automatically

Historical Contracts remain legal/history records according to their own domain.

---

## Organization setting unavailable ≠ user preference unavailable

A temporary organization-settings failure should not necessarily break Design 059 personal Profile.

---

## No logo ≠ no organization

Logo is optional presentation metadata unless explicitly required.

---

## Organization service unavailable ≠ user unauthorized

Technical failure and access denial require separate states.

---

## Conflict handling

If two authorized administrators edit OrganizationProfile at the same time:

use optimistic concurrency/versioning to avoid silent overwrite where fields collide.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve a clear organization-administration hierarchy:

```text
Company Settings
↓
Organization Profile
├── logo / visual identity if frozen
├── display/company information
├── website/business details
└── permitted organization contact fields
↓
Organization Defaults
├── timezone
├── locale
├── date/time preferences
└── other frozen organization settings
↓
Governed / Read-only Information
    where present
```

The exact frozen UI remains unchanged.

It must not become an internal CRM or tenant-admin console.

---

## Tablet

Following Design 152:

* multi-column organization forms stack cleanly,
* logo/profile summary stays visible,
* grouped settings remain clearly separated,
* Save controls remain obvious,
* read-only/legal fields are distinguishable from editable fields.

---

## Mobile

Priority:

```text
Company Settings
↓
Company Identity
↓
Editable Organization Profile
↓
Organization Defaults
↓
Read-only / Governed company information
↓
Save
```

No desktop settings matrix should be compressed horizontally.

---

## Mobile field ownership clarity

The UI should make it clear when a field is:

* yours to edit,
* organization-wide,
* read only,
* governed elsewhere.

This prevents users assuming all company information is casually editable.

---

## Accessibility

Each field needs:

* label,
* scope/context,
* validation,
* read-only/editable semantics.

For organization-wide settings, help text should make scope clear, for example:

> Applies as the default to your organization.

Do not rely only on a lock icon to communicate read-only status.

---

# 7. Backend Requirements

## Query architecture

```text
Design 060
    ↓
ClientPortalSessionContext
    ↓
Organization Settings Authorization
    ↓
ClientOrganizationSettingsQueryService
    │
    ├── canonical Organization
    ├── OrganizationProfile
    ├── allowed OrganizationSettings
    ├── effective/default values
    ├── current user's administration capability
    ├── Client-safe governed fields
    └── Logo Asset projection
    ↓
ClientOrganizationSettingsView
```

---

## Update architecture

Profile:

```text
updateClientOrganizationProfile()
```

Settings:

```text
updateClientOrganizationSettings()
```

should be separate/narrow commands rather than one arbitrary mutation.

---

## Server-side update flow

```text
authenticate
↓
derive Portal membership
↓
derive current Organization
↓
verify organization-management capability
↓
load field/setting definitions
↓
allowlist editable fields
↓
validate values
↓
check concurrency/version
↓
persist
↓
invalidate scoped caches
↓
emit Activity/Audit where required
```

---

## Legal field updates

If a field is legal/verified:

```text
Design 060
      ↓
governed change request / dedicated domain workflow
```

rather than direct ordinary Profile mutation.

No new screen is implied.

---

## Billing information updates

Where billing details are actually owned by Finance:

```text
Organization Settings
       ↓
display/link/reference
       ↓
Finance-controlled billing record
```

Do not update issued Invoice snapshots.

---

## Contract party data

Future Contracts may use the current verified legal organization profile as input when generating a new ContractVersion.

Once issued:

```text
ContractPartySnapshot
```

becomes independent historical evidence.

---

## Setting resolution

Use Design 040 infrastructure:

```text
effectiveSetting =
    organization override
    else platform default
```

and then Design 059 may layer a user override only for explicitly user-overridable settings.

---

## Settings metadata

Each organization setting should know:

```text
scope = ORGANIZATION
clientEditable = true/false
userOverridable = true/false
sensitive = true/false
validation type
```

This prevents accidental scope confusion.

---

## Cache safety

Organization settings may be cached by:

```text
organizationId
settings revision
```

but personal effective-preference results may also depend on User override.

Do not reuse organization-effective settings as if they were the final value for every user.

---

## Cache invalidation

Changing an organization default should invalidate:

* relevant organization setting cache,
* effective settings for users who inherit it.

Users with explicit overrides remain unaffected.

---

## Avatar/logo pipeline

If logo upload exists:

```text
Client uploads logo
        ↓
Asset service
        ↓
security scan
        ↓
image processing
        ↓
approved derivative
        ↓
OrganizationProfile logo reference
```

Never point the organization profile at unprocessed raw input.

---

## Client-safe CRM synchronization

If self-service profile changes synchronize into CRM/Client 360:

the event should be explicit:

```text
OrganizationProfileUpdated
        ↓
field-governed CRM synchronization
```

Do not hide a broad two-way mutation.

---

## Historical evidence protection

Organization update services must never cascade-update:

```text
ContractPartySnapshot
InvoiceRecipientSnapshot
ReportVersion
ApprovalDecision evidence
Signature evidence
historical Publication metadata
```

unless the source domain deliberately creates a new version/revision.

---

## Activity

Design 063 can later show appropriate events such as:

> Company profile updated.

Sensitive field changes may require carefully limited descriptions.

---

## Audit

Material administrative changes can feed Design 039:

```text
OrganizationProfileUpdated
OrganizationSettingChanged
OrganizationLogoChanged
```

with:

* actor,
* Organization,
* changed field identifiers,
* safe before/after metadata where appropriate.

Sensitive values should not be indiscriminately copied.

---

## Backend Requirement Matrix

| Requirement                                              | Status                                  |
| -------------------------------------------------------- | --------------------------------------- |
| Client Portal authentication                             | **Critical**                            |
| Active Portal membership                                 | **Critical**                            |
| Stable canonical Organization identity                   | **Critical**                            |
| Client relationship reuse                                | **Critical**                            |
| Portal Organization Context separation                   | **Critical**                            |
| OrganizationProfile model                                | **Critical**                            |
| OrganizationSettings model                               | **Critical**                            |
| PersonalProfile separation                               | **Critical**                            |
| PortalMembership separation                              | **Critical**                            |
| AuthorizationPolicy separation                           | **Critical**                            |
| Organization settings-admin capability                   | **Critical**                            |
| Field-level self-service allowlist                       | **Critical**                            |
| Organization ID tampering protection                     | **Critical**                            |
| Mass-assignment protection                               | **Critical**                            |
| Display name/legal name separation                       | **Critical**                            |
| Current profile/legal snapshot separation                | **Critical**                            |
| Billing snapshot protection                              | **Critical**                            |
| ContractParty snapshot protection                        | **Critical**                            |
| Stable historical organization identity                  | **Critical**                            |
| Business/billing/legal address separation where required | **Critical**                            |
| Verified vs self-asserted field support where needed     | **Required**                            |
| Design 040 SettingDefinition reuse                       | **Critical**                            |
| Setting type/scope validation                            | **Critical**                            |
| Organization default/user override semantics             | **Critical**                            |
| Default timezone historical-safety                       | **Critical**                            |
| Default currency historical-safety                       | **Critical if currency setting exists** |
| Design 030 Asset reuse for logo                          | **Required if logo exists**             |
| Logo scan/processing                                     | **Critical if upload exists**           |
| Client-safe CRM synchronization                          | **Required if synchronized**            |
| Optimistic concurrency                                   | **Required**                            |
| Client-safe data projection                              | **Critical**                            |
| Cache invalidation                                       | **Required**                            |
| Activity integration                                     | **Required**                            |
| Audit integration                                        | **Required**                            |
| Designs 021/037/040 reuse                                | **Critical**                            |
| Designs 059/061/062 integration                          | **Critical architecture**               |
| Design 145 backend reuse                                 | **Critical architecture**               |

---

# 8. Consolidation

Design 060 exposes several major implementation risks.

**Organization / Client conflation**
Business organization and Client relationship lifecycle become one record/state.

**Organization / Portal Context conflation**
Session/account context creates duplicate organization identity.

**OrganizationProfile / OrganizationSettings conflation**
Descriptive company data and behavioral defaults are stored in one untyped blob.

**OrganizationProfile / PersonalProfile conflation**
Company changes overwrite individual user data.

**Display name / legal name conflation**
Casual branding update rewrites legal identity.

**Current company data / ContractParty snapshot conflation**
Executed Contracts change when company profile changes.

**Current company data / Invoice snapshot conflation**
Issued Invoices retrospectively change recipient details.

**Business address / legal address conflation**
One mutable address is used for every domain.

**Business address / billing address conflation**
Company profile change alters Finance information unintentionally.

**Tax identifier / ordinary profile field conflation**
Sensitive verified identifier can be casually edited.

**Website/domain / identity verification conflation**
Entering a domain proves ownership automatically.

**Company domain / authentication domain conflation**
Changing website/domain rewrites user login identities.

**Client-entered profile / CRM-enrichment conflation**
Self-service edits overwrite canonical CRM/enrichment data without provenance.

**OrganizationSettings / arbitrary JSON conflation**
Browser can inject unsupported/sensitive configuration.

**Organization default / user preference conflation**
One company change overwrites explicit user settings.

**Organization timezone / historical timestamp conflation**
Changing default timezone rewrites Meeting/Approval history.

**Default currency / transaction currency conflation**
Company preference rewrites historical Invoice/Payment money.

**Default currency / FX conversion conflation**
USD values become EUR values without conversion.

**Current logo / historical artifact branding conflation**
Old Report/Contract visually changes when company logo changes.

**Folder/logo Asset / identity conflation**
Brand Asset change alters Organization identity.

**Portal Membership / OrganizationSettings conflation**
Settings page starts creating/removing Client users.

**Organization administrator / authorization administrator conflation**
Company-profile access grants role-management capability.

**Organization manage / Contract authority conflation**
Company admin gains legal signing authority.

**Organization manage / Finance authority conflation**
Company admin gains payment/refund ability.

**Organization manage / Portal user management conflation**
Any settings administrator can invite/remove users without explicit entitlement.

**Read / edit conflation**
Visible legal information becomes editable.

**Mass-assignment vulnerability**
Client sends `tenantId`, `riskScore`, `clientStatus`, or role fields through generic Organization PATCH.

**Organization ID tampering**
Client modifies another organization's settings.

**Module visibility / authorization conflation**
Hiding UI is treated as backend security.

**Organization disabled / history deleted conflation**
Contracts, Invoices and Reports disappear with account lifecycle change.

**Organization rename / new identity conflation**
Simple display-name update creates duplicate company records.

**060/059 duplicate settings ownership**
Personal and organization values drift.

**060/061 duplicate notification configuration**
Company-level defaults and personal notification preferences become one store.

**060/062 duplicate membership/access engine**
Company settings manages Portal users and roles.

**060/145 duplicate Organization administration**
Client and internal admin surfaces create separate Organization models.

No additional screen is required.

These are **organization identity, configuration scope, legal/billing snapshot, authorization, preference-inheritance and historical-integrity requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT ORGANIZATION PROFILE & ORGANIZATION-SCOPED SETTINGS ANCHOR**

**Domain directive:**
**Client Organization ≠ Portal Organization Context ≠ OrganizationProfile ≠ OrganizationSettings ≠ PersonalProfile ≠ Billing/Legal Snapshot ≠ PortalMembership ≠ AuthorizationPolicy.**

**Identity directive:**
one stable canonical Organization identity underlies the Client relationship and Portal context; names, domains and branding remain mutable attributes rather than identity keys.

**Client directive:**
Design 021 remains the canonical Client/company relationship foundation. Design 060 is the Client-safe self-service organization administration surface.

**Profile directive:**
OrganizationProfile owns explicitly self-service company presentation/business fields only.

**Settings directive:**
OrganizationSettings owns organization-scoped defaults/configuration and reuses Design 040's typed SettingDefinition/scope model.

**Personal directive:**
Design 059 remains authoritative for the individual user's own Profile and preferences; organization changes never silently rewrite personal account data.

**Membership directive:**
Design 062 owns Portal membership/team access. Design 060 neither invites/deactivates users nor changes membership roles.

**Authorization directive:**
Design 037/062 determines who can administer organization settings. Company-settings administration never itself grants roles, legal signing, Finance authority or user-administration rights.

**Legal directive:**
current organization profile data remains distinct from ContractParty and signing-time legal snapshots. Executed legal history never changes when the company profile changes.

**Finance directive:**
organization profile/billing preferences do not rewrite issued Invoice recipient snapshots, Payment records, currencies or historical Finance data.

**Address directive:**
business, billing and legal addresses remain contextual concepts where the product requires them; one profile field must not silently overwrite every domain.

**Verification directive:**
legally significant or verified organization fields, if present, use governed change/verification semantics rather than ordinary profile mutations.

**Preference directive:**
organization defaults resolve beneath user overrides only where a SettingDefinition explicitly permits user customization.

**Timezone directive:**
changing the organization default timezone affects future/default display behavior and never rewrites historical business timestamps.

**Currency directive:**
changing an organization-default currency, if supported, never changes existing Contract/Invoice/Payment currency or performs implicit FX conversion.

**Asset directive:**
company logos/branding reuse Design 030's Asset/FileVersion pipeline; historical documents pin exact assets where historical visual fidelity matters.

**Security directive:**
all self-service organization writes use session-derived organization context, field allowlists, typed validation and mass-assignment protection. Arbitrary generic Organization PATCH endpoints are prohibited.

**Synchronization directive:**
any CRM/Client-360 synchronization from self-service Profile changes must be explicit, field-governed and provenance-aware rather than hidden two-way synchronization.

**Reliability directive:**
read-only, verification-pending, save-failed, logo-processing-failed, membership-restricted and organization-service-unavailable states remain distinct.

**Responsive directive:**
desktop separates organization profile, defaults and governed information; mobile preserves company identity → editable fields → organization defaults → Save without exposing internal CRM/tenant administration.

**Overlap directive:**
Designs **021, 030, 037, 040, 053–054, 059–062 and 145** must consume one canonical Organization/Profile/Settings foundation while keeping membership, authorization, legal snapshots and Finance independently owned.

**Consolidation directive:**
**STANDARDIZE ONE ORGANIZATION FOUNDATION — STABLE ORGANIZATION ID + ORGANIZATIONPROFILE + TYPED ORGANIZATIONSETTINGS + PORTAL ORGANIZATION CONTEXT + ASSET-BACKED BRANDING + GOVERNED LEGAL/BILLING REFERENCES — WHILE KEEPING PERSONAL PROFILE, MEMBERSHIP, RBAC, CONTRACT SNAPSHOTS AND FINANCE SNAPSHOTS STRICTLY SEPARATE. DO NOT BUILD A SECOND CLIENT-COMPANY OR SETTINGS SYSTEM FOR THE PORTAL.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **60 / 153** |
| **PASS**                                   |                         **60** |
| **STANDARDIZE decisions**                  |                         **58** |
| **Potential implementation-overlap flags** |                         **51** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**60 / 153 = 39.2% audited.**

### Canonical organization architecture after Design 060

```text
                    ORGANIZATION
                         │
        ┌────────────────┼────────────────┐
        ↓                ↓                ↓
 OrganizationProfile OrganizationSettings Client Relationship
        │                │                │
        │                ↓                ↓
        │        Platform defaults     Projects /
        │          Design 040          Contracts /
        │                              Finance
        │
        ↓
 Brand Assets
 Design 030
```

Portal identity/access remains separate:

```text
Organization
    ↓
ClientPortalMembership
    ↓
Authorization / Role
 Designs 062 / 037
```

and historical legal/financial truth remains snapshot-based:

```text
CURRENT ORGANIZATION PROFILE
            │
            ├── future governed use
            ↓
      New Contract / Invoice

HISTORICAL CONTRACT PARTY SNAPSHOT
HISTORICAL INVOICE RECIPIENT SNAPSHOT
HISTORICAL SIGNER EVIDENCE
            │
            └── NEVER rewritten by Design 060
```

# Next Sequential Audit Target

## **Design 061 — Client Notifications / Notification Preferences**

Its frozen identity is already locked.

The next audit must preserve the notification-preference boundary:

> **Notification Event ≠ Notification Record ≠ Delivery Attempt ≠ Channel ≠ Notification Preference ≠ Organization Default ≠ Read State ≠ Client Action ≠ Message.**

It will also need to distinguish **personal notification preferences from organization-wide defaults**, while ensuring that turning off a notification channel does not suppress mandatory security, legal, billing, or transactional communications where product policy requires delivery.

After Design 061 we continue strictly:

**062 Client Portal Users / Team Access → 063 Client Activity / Account History → 064 Client Notifications Center → 065 Client Media Projects / Media Center → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
