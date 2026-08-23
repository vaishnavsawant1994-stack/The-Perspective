# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 086 — Contact CRM / Contact Directory

Design 086 should become the **canonical Team Workspace Contact CRM collection and person-directory surface**.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Contact ≠ User ≠ AuthenticationIdentity ≠ Company ≠ ContactCompanyRelationship ≠ Lead ≠ ClientContact/ClientPortalUser ≠ CommunicationAddress ≠ ContactAlias/ExternalIdentity ≠ ContactDirectoryProjection.**

The central implementation rule is:

> **Contact is the stable CRM identity of a real-world person known to the business. Email addresses, phone numbers, external profiles, employers, Leads, Client relationships, Portal accounts and directory rows may reference or describe that person, but none of them becomes the Contact's identity. Changing an email, job title, employer, Company, Portal account or Lead lifecycle must never recreate the Contact or rewrite historical commercial evidence.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **086**                                                                                                                                            |
| **Canonical name**                 | **Contact CRM / Contact Directory**                                                                                                                |
| **Product area**                   | Team Workspace / CRM / Contacts                                                                                                                    |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                   |
| **Screen class**                   | CRM Person Directory / Contact Collection Workspace                                                                                                |
| **Classification**                 | **Canonical Contact CRM Directory & Person-Identity Anchor**                                                                                       |
| **Primary purpose**                | Discover, filter and manage canonical CRM person identities while preserving communication, employment, Lead, Client and authentication boundaries |
| **Primary entity**                 | **Contact**                                                                                                                                        |
| **Communication entity**           | **CommunicationAddress / ContactPoint**                                                                                                            |
| **Name/alias entity**              | **ContactAlias**                                                                                                                                   |
| **External identity entity**       | **ContactExternalIdentity**                                                                                                                        |
| **Employment relationship**        | **ContactCompanyRelationship**                                                                                                                     |
| **Company foundation**             | Designs 084–085                                                                                                                                    |
| **CRM admission foundation**       | Design 083                                                                                                                                         |
| **Lead relationship**              | Design 011 / upcoming 089                                                                                                                          |
| **Client relationship dependency** | Design 021                                                                                                                                         |
| **Portal User dependency**         | Design 062                                                                                                                                         |
| **Platform User/Auth dependency**  | Designs 036–037 / 059 / 075–077                                                                                                                    |
| **Detail companion**               | Design 087 — Contact Detail / Contact 360                                                                                                          |
| **Universal Search dependency**    | Design 079                                                                                                                                         |
| **Audit dependency**               | Design 039                                                                                                                                         |
| **Directory projection**           | `ContactDirectoryEntry`                                                                                                                            |
| **Identity resolution service**    | `ContactIdentityResolutionService`                                                                                                                 |
| **Primary query service**          | `ContactDirectoryQueryService`                                                                                                                     |
| **Mutation service**               | `ContactService`                                                                                                                                   |
| **Auth**                           | Required                                                                                                                                           |
| **Authorization**                  | Active OrganizationMembership + Contact/resource/field permissions                                                                                 |
| **Implementation priority**        | **Critical CRM Person Identity / Dedupe / Privacy / Relationship Integrity**                                                                       |
| **Reuse level**                    | **Extremely High across acquisition, Companies, Leads, Deals, Clients, messaging and Portal access**                                               |

Design 086 should answer:

> **“Which canonical people are known to this CRM workspace, what current and historical contact information do we have for them, which Companies are they associated with, which Leads/Client relationships reference them, and which existing Contact should new acquired evidence attach to instead of creating duplicates?”**

Canonical structure:

```text
Contact
   │
   ├── ContactAlias[]
   ├── CommunicationAddress[]
   ├── ContactExternalIdentity[]
   ├── ContactCompanyRelationship[]
   │
   ├── Lead relationships
   ├── Deal/person relationships where applicable
   ├── ClientContact relationship where applicable
   └── optional User / Portal identity link
                │
                ↓
       ContactDirectoryEntry
          read projection
                │
                ↓
           Design 086
```

---

# 2. Reuse

## Design 083 must admit into the same canonical Contact identity

Design 083 established explicit CRM admission and duplicate resolution.

Correct:

```text
ProspectCandidate
      ↓
CRMAdmissionService
      ↓
ContactIdentityResolutionService
      ↓
existing Contact OR create canonical Contact
```

Not:

```text
ProspectCandidate
      ↓
ImportedContact
      ↓
later convert ImportedContact into CRM Contact
```

There must be no staging Contact backend that survives admission as parallel truth.

---

## Designs 084–085 already establish the Company relationship model

Contact employment must reuse:

```text
Contact
    ↓
ContactCompanyRelationship
    ↓
Company
```

Design 086 must not retreat to:

```text
Contact.companyName = "Acme"
```

as canonical employment identity.

A source/display string can exist as evidence.

The actual CRM relationship should use canonical Contact and Company IDs.

---

## Design 086 ≠ Design 087

### Design 086

Contact collection/discovery.

### Design 087

Exact Contact 360/entity detail.

They must share the exact same:

```text
Contact.id
```

---

## Design 086 ≠ User directory

A CRM Contact may exist without:

* login,
* platform User,
* Team Workspace membership,
* Client Portal access.

Likewise, a platform User can exist without representing a Sales CRM Contact.

Do not turn Team identity into CRM person identity automatically.

---

## Design 086 ≠ AuthenticationIdentity

AuthenticationIdentity answers:

> Which identifier authenticates this User?

Contact answers:

> Which real-world person exists in our CRM?

A Contact email may equal a login email string.

The records remain distinct.

---

## Design 086 ≠ Client Portal user management

Design 062 owns:

* User,
* ClientPortalMembership,
* Invitation,
* Portal role/scope.

A Contact appearing in Client CRM does not automatically become a Portal User.

---

## Reuse Design 011 Lead domain

Lead should reference a canonical Contact where identity has been resolved.

Correct conceptually:

```text
Lead
├── contactId
└── companyId
```

without making the Lead itself the person record.

---

## Lead conversion must preserve Contact identity

If:

```text
Lead L-100
→ converted / won / moved downstream
```

Contact C-100 remains the same person.

Do not replace Contact identity with Lead status.

---

## Reuse Design 079 Universal Search

Universal search results should reference:

```text
sourceType = CONTACT
sourceId = C-100
```

Search documents/results never become Contact records.

---

# 3. Entities

## Contact

`Contact` is the stable canonical CRM identity of a person.

Conceptually:

```text
Contact
├── id
├── organizationId
├── canonical display name
├── lifecycle
├── createdAt
├── updatedAt
├── provenance references
└── revision
```

Exact physical schema belongs to Phase 3D.

---

## Contact ID must survive profile changes

Example:

```text
Contact C-100

2026
Sarah Patel
VP Marketing
Acme Corp
sarah@acme.com

2028
Sarah Patel
CMO
Globex
sarah@globex.com
```

The Contact remains:

```text
C-100
```

No new Contact should be created merely because employment/email/title changed.

---

## Contact ≠ name

Names can change.

Examples:

* legal name changes,
* preferred names,
* alternate spellings,
* transliteration.

The Contact ID remains stable.

---

## ContactAlias

`ContactAlias` can preserve:

* alternate names,
* prior names,
* source spellings,
* transliterations.

Conceptually:

```text
ContactAlias
├── contactId
├── alias
├── aliasType
├── normalizedAlias
├── effective dates
└── provenance
```

---

## Alias ≠ Contact identity

Permanent.

---

## Same name ≠ same Contact

Critical.

Two different people can have exactly the same name.

---

## Different names ≠ different Contact necessarily

A person's name can change or be represented differently across Sources.

---

## CommunicationAddress / ContactPoint

Email/phone/contact channels should be explicit entities or typed relationships.

Conceptually:

```text
CommunicationAddress
├── contactId
├── type
├── normalized value
├── display value
├── purpose
├── verification state
├── primary state
├── effective dates
├── source/provenance
└── lifecycle
```

Types may include according to actual product support:

* email,
* phone,
* other communication channels.

Exact enum Phase 3D.

---

## Contact ≠ email address

Permanent.

This is among the most important Contact invariants.

```text
Contact
≠
email string
```

---

## One Contact can have several emails

Example:

```text
Contact C-100
├── sarah@acme.com          historical work
├── sarah@globex.com        current work
└── sarah.personal@...      if legitimately stored/authorized
```

Do not make `email` the Contact's primary database identity.

---

## Primary email ≠ only email

`primary` is a preference/current communication designation.

It does not delete historical or alternate addresses.

---

## Email change ≠ Contact recreation

Permanent.

---

## CommunicationAddress ≠ AuthenticationIdentity

Even if:

```text
Contact email
=
User login email
```

they remain separate records with different lifecycle/security rules.

---

## Updating Contact email must not update login identity

Design 075 remains authoritative for AuthenticationIdentity.

---

## CommunicationAddress ≠ NotificationPreference

An address says:

> where communication could potentially be delivered.

NotificationPreference says:

> whether/type/channel communication should be delivered according to policy.

Different concepts.

---

## CommunicationAddress ≠ message history recipient evidence

Historical sent messages should preserve the address/recipient identity used at send time where required.

Changing current Contact email must not rewrite old Messages.

---

## Phone number ≠ Contact identity

Permanent.

Phone numbers can:

* change,
* be reassigned,
* be shared,
* be malformed.

They are useful identity evidence, not absolute identity.

---

## ContactExternalIdentity

External profiles/source identities should be provider-scoped.

Conceptually:

```text
ContactExternalIdentity
├── contactId
├── provider
├── externalId
├── profile URL where applicable
├── verification/confidence
├── firstObservedAt
├── lastObservedAt
└── provenance
```

---

## External ID must be provider-scoped

Do not store:

```text
externalId = "123"
```

without:

```text
provider = ...
```

because identifiers can collide across providers.

---

## ContactExternalIdentity ≠ AuthenticationIdentity

Permanent.

A LinkedIn/profile/provider identity is CRM evidence.

It is not automatically a login credential.

---

## ContactExternalIdentity ≠ Contact

One Contact may have several external identities.

---

## ContactCompanyRelationship

Designs 084–085 established the employment/association relationship.

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

## Changing employer must change relationship history

Correct:

```text
Contact C1

Relationship R1:
Company Acme
2019–2026

Relationship R2:
Company Globex
2026–present
```

Not:

```text
Contact C1.companyId
Acme → overwritten → Globex
```

with no history.

---

## Contact ≠ employment

Permanent.

Employment is temporal relationship data.

---

## Current title belongs to employment context where appropriate

A job title may belong to:

```text
ContactCompanyRelationship
```

rather than globally to Contact forever.

The Contact can also have a derived:

> current title

projection.

Do not duplicate mutable title truth across Contact and employment without policy.

---

## One Contact can have multiple current relationships

Possible cases:

* founder of Company A,
* board member of Company B,
* adviser to Company C.

Architecture should not force exactly one current Company unless product policy requires it.

---

## Company relationship type matters

Employment, board membership and advisory association should not all be flattened into:

```text
employee = true
```

Exact supported types Phase 3D.

---

## Company change ≠ new Contact

Permanent.

---

## Company merge ≠ Contact recreation

If Design 084 merges Company records:

ContactCompanyRelationship should be reconciled to canonical Company identity while preserving historical evidence.

---

## Lead

Contact may be associated with one or several Leads depending CRM semantics.

Permanent:

```text
Contact
≠
Lead
```

---

## One Contact may participate in multiple Leads/opportunities over time

Do not constrain:

```text
UNIQUE(contactId)
```

on Lead unless CRM semantics explicitly require one active Lead.

---

## Lead status ≠ Contact lifecycle

A Lead can be:

* disqualified,
* converted,
* inactive.

Contact remains a known CRM person.

---

## Disqualified Lead ≠ delete Contact

Permanent.

---

## Lead converted ≠ Contact converted

Permanent.

---

## ClientContact

A Contact can become associated with a Client relationship/account.

This should be an explicit relationship.

Conceptually:

```text
Contact
      ↓
ClientContactRelationship
      ↓
Client
```

or another canonical relationship model.

Contact itself does not become Client.

---

## ClientContact ≠ ClientPortalUser

Critical.

A person can be a known Client Contact without Portal access.

Example:

```text
Sarah Patel
→ Contact
→ ClientContact
→ NO Portal Membership
```

---

## ClientPortalUser ≠ Contact

A Portal User must have:

* User,
* AuthenticationIdentity,
* ClientPortalMembership.

It may be linked to a Contact when the business wants identity continuity.

But linkage is explicit.

---

## Contact-to-User linkage

Conceptually optional:

```text
ContactUserLink
├── contactId
├── userId
├── relationship/verification state
├── linkedAt
└── provenance
```

or equivalent.

Exact physical model Phase 3D.

The crucial rule:

> **Do not infer User = Contact merely because emails match.**

---

## Contact ≠ User

Permanent.

User lifecycle can include:

* authentication,
* memberships,
* security state.

Contact lifecycle can include:

* CRM relationships,
* communication details,
* business history.

---

## Deleting/deactivating User ≠ deleting Contact

Historical CRM person data may remain.

---

## Archiving Contact ≠ deleting User

Likewise.

---

## Contact profile changes ≠ historical signer changes

Design 070 Contract Signer evidence remains immutable.

If current Contact changes:

* name,
* title,
* email,

previous ContractParty/Signer snapshots stay unchanged.

---

## Contact profile changes ≠ historical message changes

Message sender/recipient evidence remains historical.

---

## Contact profile changes ≠ historical proposal/invoice snapshots

Permanent.

---

## Duplicate detection

Contact identity matching can consider:

```text
normalized name
email addresses
phone numbers
external provider identities
Company relationships
job titles
source profile IDs
provenance
```

but no single weak field should automatically control identity.

---

## DuplicateMatch ≠ automatic Contact merge

Design 083's rule continues.

Detection proposes.

Merge is governed.

---

## Exact email match ≠ always same person

Critical.

Reasons include:

* shared addresses,
* role accounts,
* recycled corporate addresses,
* data errors.

An exact verified provider-specific identity is stronger evidence, but still subject to identity policy.

---

## Name + Company match ≠ guaranteed same person

Large organizations can have people with the same name.

---

## Phone match ≠ guaranteed same person

Shared/company numbers exist.

---

## Duplicate resolution should preserve evidence

When two Contact records are merged:

all legitimate:

* aliases,
* communication addresses,
* employment history,
* Leads,
* Deal/person relationships,
* ClientContact links,
* provenance

must be reconciled.

---

## Contact merge ≠ hard delete

A dedicated merge lineage should preserve old Contact ID.

Conceptually:

```text
ContactMerge
sourceContactId
targetContactId
mergedAt
mergedBy
```

or equivalent.

---

## Historical snapshots must not be rewritten by Contact merge

Old:

* Contract Signer,
* Proposal recipient,
* Message participant,
* issued artifacts

retain their immutable/historical snapshots.

---

## Contact lifecycle

Potentially:

```text
Active
Inactive
Archived
Merged
```

where applicable.

Do not merge this with:

* Lead status,
* employment state,
* Portal User state,
* Client relationship state.

---

## ContactDirectoryProjection

Design 086's rows should be read projections.

Conceptually:

```text
ContactDirectoryEntry
├── contactId
├── current display name
├── current primary Company relationship
├── current title
├── safe primary communication address
├── Lead summary
├── Client summary
├── owner
└── lifecycle/data-quality state
```

only where present in frozen design.

---

## Directory row ≠ Contact

Permanent.

---

## Directory current Company ≠ only Company history

A row may show:

> Globex

as current employment while full history remains relational.

---

## Directory primary email ≠ Contact identity

Permanent.

---

## Directory counts are projections

If frozen design shows:

* open Leads,
* Deals,
* interactions,

these derive from canonical domains.

Do not store arbitrary mutable counters on Contact.

---

# 4. Permissions

Design 086 should conceptually distinguish:

```text
contact.read
contact.create
contact.edit
contact.archive

contact.communication.read
contact.communication.manage

contact.employment.read
contact.employment.manage

contact.externalIdentity.read
contact.externalIdentity.manage

contact.merge
contact.provenance.read

contact.clientRelationship.read
contact.userLink.manage
```

Exact permission names Phase 3D.

---

## Contact read ≠ communication-detail read

A user may know:

> Sarah Patel, CMO at Globex

without being authorized to see every:

* phone number,
* private email,
* personal address.

Field-level protection matters.

---

## Contact edit ≠ communication verification

Changing an email string is not proof that the email is valid/controlled.

Verification state remains separate.

---

## Contact edit ≠ merge

Critical.

Contact merge needs dedicated authority.

---

## Contact edit ≠ User management

Permanent.

---

## Contact edit ≠ AuthenticationIdentity management

Permanent.

---

## Contact edit ≠ Client Portal access management

Permanent.

---

## Contact edit ≠ Company edit

Employment linking does not authorize Company profile changes.

---

## Company permission ≠ Contact permission

Being allowed to view Company does not automatically expose every Contact field.

---

## Lead permission ≠ Contact permission

A Sales user may be permitted to see limited Lead contact context but not full CRM person history.

---

## ClientContact visibility ≠ Portal user administration

Permanent.

---

## CommunicationAddress privacy

The server should return only permitted addresses/channels.

Do not send all personal data then hide fields in frontend.

---

## Contact directory must be server-filtered

Search/filter results must obey current tenant/resource/field permissions.

---

## Contact directory count must be permission-aware

Do not leak hidden Contact population through:

> 1,247 Contacts

if the user can see only a restricted subset.

---

## Cross-tenant Contact resolution prohibited by default

Design 083 importing into Tenant A must not search private Contacts in Tenant B.

---

## Same real person across tenants ≠ shared CRM record by default

Conceptually:

```text
Tenant A → Contact Sarah
Tenant B → Contact Sarah
```

can be separate tenant-owned CRM records unless a global entity layer is deliberately designed later.

None is introduced here.

---

## Direct Contact ID reauthorizes

Knowing the ID grants nothing.

---

## Direct CommunicationAddress/ExternalIdentity IDs reauthorize

Same.

---

## Merge requires both Contact permissions

Actor must be authorized against all source/target records.

Cross-tenant merge is prohibited.

---

## Contact/User linking is security-sensitive

Linking CRM Contact to platform User can affect contextual identity display and should require dedicated authority.

Never allow an ordinary Contact editor to link:

```text
Contact Sarah
→ platform Super Admin User
```

through arbitrary userId tampering.

---

## User linkage does not grant permissions

Even a valid Contact ↔ User link does not create:

* Team role,
* ClientPortalMembership,
* permissions.

---

# 5. States

Design 086 must keep **Contact lifecycle, data quality, communication state, employment state, duplicate-resolution state, User/Portal linkage, and directory-query state** separate.

### Contact lifecycle

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
Conflicting Identity
```

### Communication state

Per address:

```text
Observed
Unverified
Verified
Invalid
Bounced / Undeliverable where applicable
Historical
```

### Employment state

```text
Current
Historical
Future / Scheduled where legitimately modeled
Unknown
```

### Duplicate-resolution state

```text
No Known Duplicate
Possible Duplicate
Duplicate Review Required
Merge In Progress
Merged
Resolution Unavailable
```

### User/Portal relation

```text
No User Link
User Linked

No Portal Membership
Portal Membership Exists
```

These are different relationships.

### Directory/query state

```text
Loading
Available
Empty
Filter Empty
Partial Results
Failed
```

---

## Active Contact ≠ active Lead

Permanent.

---

## Active Contact ≠ active Portal User

Permanent.

---

## Archived Contact ≠ disabled User

Permanent.

---

## Merged Contact ≠ hard-deleted person history

Permanent.

---

## Email invalid ≠ Contact invalid

Permanent.

---

## Email bounced ≠ Contact archived

Permanent.

---

## No email ≠ Contact invalid

A legitimate Contact can exist with:

* phone,
* external profile,
* source evidence,

and no known email.

---

## No Company ≠ invalid Contact

A person may be between roles or Company resolution may be pending.

---

## Former employee ≠ inactive Contact

Permanent.

---

## Company relationship ended ≠ Contact archived

Permanent.

---

## Lead disqualified ≠ Contact rejected

Permanent.

---

## Client relationship ended ≠ Contact archived

Permanent.

---

## User disabled ≠ Contact archived

Permanent.

---

## Portal Membership revoked ≠ Contact deleted

Permanent.

---

## Possible duplicate ≠ confirmed duplicate

Permanent.

---

## Duplicate resolver unavailable ≠ no duplicate

Critical.

---

## Zero related Leads ≠ Lead service unavailable

Critical.

---

## No User link ≠ User lookup unavailable

Critical.

---

## No Portal membership ≠ Portal service unavailable

Critical.

---

## State Coverage

Design 086 inherits Design 150 plus:

```text
Contacts Loading
Contacts Available
Contacts Empty
Contacts Filter Empty
Contacts Partial Results
Contact Directory Failed

Contact Active
Contact Inactive
Contact Archived
Contact Merged

Contact Data Complete
Contact Data Incomplete
Contact Needs Review
Contact Identity Conflict

Communication Address Verified
Communication Address Unverified
Communication Address Invalid
Communication Address Historical
No Communication Address

Current Company Relationship
Historical Company Relationship
No Current Company Relationship
Company Relationship Unknown

No Known Contact Duplicate
Possible Contact Duplicate
Duplicate Review Required
Duplicate Resolution Unavailable
Merge Processing
Contact Merged

No Platform User Link
Platform User Linked
User Link State Unavailable

No Portal Membership
Portal Membership Exists
Portal Membership State Unavailable

Lead Count Available
Lead Count Unavailable
Company Context Available
Company Context Unavailable

Contact Updated Elsewhere
Contact No Longer Accessible
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize person discovery while making **identity, Company relationship and communication context distinct**.

Conceptually:

```text
Contact Directory
↓
Search / filters if frozen
↓
Contact rows
    ├── canonical person name
    ├── current title
    ├── current Company
    ├── safe communication address
    ├── Lead / Client context
    ├── owner/status where frozen
    └── open Contact
```

Only fields present in frozen Design 086 should render.

---

## Person identity must remain primary

A Contact row should visually lead with:

> Sarah Patel

not:

> [sarah@globex.com](mailto:sarah@globex.com)

because email is not identity.

---

## Company should appear as relationship context

Correct:

> Sarah Patel
> CMO · Globex

not an implementation suggesting:

> Sarah Patel is embedded inside Globex.

---

## Multiple communications

If frozen UI supports multiple communication methods, designate current/primary carefully without hiding historical/secondary identity evidence in the backend.

---

## Portal/User state should not dominate CRM identity

If frozen design indicates Portal status:

show it as a relationship/status indicator.

Do not transform Contact into an account-management row.

---

## Tablet

Following Design 152:

* rows reflow to Contact cards,
* name remains primary,
* current Company/title stay together,
* primary safe email/phone wraps cleanly,
* duplicate/data-quality state remains visible.

---

## Mobile

Priority:

```text
Contact
↓
Person Name
↓
Current Title / Company
↓
Primary Safe Communication
↓
Lead / Client context
↓
Contact state
↓
Open Contact
```

No wide contact spreadsheet compressed onto mobile.

---

## Multiple Company relationships

Mobile directory may show only one current/primary relationship for compactness.

Full relationship history belongs to Design 087.

This is projection behavior, not data loss.

---

## Long names/emails/titles

Support:

* wrapping,
* truncation with accessible full value where needed,
* no horizontal overflow.

---

## Duplicate warning

Use text such as:

> Possible duplicate Contact

rather than a color-only badge.

---

## Accessibility

A directory row should communicate something equivalent to:

> Sarah Patel. Chief Marketing Officer at Globex. Work email [sarah@globex.com](mailto:sarah@globex.com). Two open Leads. Active Contact. Open Contact.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Contact architecture

```text
Design 086
    ↓
Authenticated Workspace Context
    ↓
ContactDirectoryQueryService
    │
    ├── Contact
    ├── current name/alias projection
    ├── current ContactCompanyRelationship
    ├── safe CommunicationAddress
    ├── Lead summary
    ├── ClientContact summary
    ├── optional User/Portal-link summary
    └── data-quality/duplicate signals
    ↓
ContactDirectoryEntry[]
```

---

## Canonical Contact repository/service

Mutations should target:

```text
ContactService
```

not `ContactDirectoryEntry`.

---

## Contact identity resolution service

Design 083 and 086 must share:

```text
ContactIdentityResolutionService
```

Conceptually:

```text
resolveContactIdentity(
    names,
    communicationAddresses,
    externalIdentities,
    companyRelationships,
    source evidence
)
```

returning something such as:

```text
EXACT_EXISTING
LIKELY_EXISTING
AMBIGUOUS
NEW_CONTACT_ALLOWED
REVIEW_REQUIRED
```

rather than blindly inserting.

---

## Identity resolution must be tenant-scoped

Critical.

---

## Contact name normalization

Useful for:

* search,
* dedupe,
* matching.

But normalized name is not identity.

---

## Communication normalization

Email normalization should respect email semantics carefully.

Phone normalization should use appropriate international canonical forms where enough context exists.

Normalization ≠ verification.

---

## Email verification state

If system verifies addresses:

store:

* verification status,
* method,
* verifiedAt,

separately from the value.

---

## Address history

When primary email changes:

the old address can transition to:

* historical,
* secondary,
* invalid,

according to evidence.

Do not silently overwrite.

---

## ContactPoint uniqueness must be nuanced

Avoid naïve global:

```text
UNIQUE(email)
```

because:

* shared addresses,
* role accounts,
* multiple tenant copies,
* historical reassignment

can make strict uniqueness unsafe.

Uniqueness/index policy must align with identity-resolution semantics.

---

## External identity uniqueness should be provider-aware

Potentially:

```text
tenant
+
provider
+
externalId
```

with policy around verified identity.

---

## Contact creation command

Conceptually:

```text
createContact(...)
```

should:

1. authorize;
2. normalize input;
3. run identity resolution;
4. require review when ambiguous;
5. create canonical Contact;
6. create communication/external/employment relationships;
7. preserve provenance;
8. emit events.

---

## Contact update command

Use allowlisted field/relationship commands.

Avoid generic unrestricted:

```text
PATCH /contact/:id
{ ...databaseRow }
```

---

## Name change

A controlled command can:

* update current canonical display name,
* preserve prior name as alias/history where appropriate,
* audit/provenance the change.

---

## Communication address commands

Conceptually:

```text
addContactCommunicationAddress()
setPrimaryCommunicationAddress()
markCommunicationAddressHistorical()
verifyCommunicationAddress()
```

Do not mutate Contact identity key.

---

## Employment commands

Reuse Design 084 relationship foundation:

```text
startContactCompanyRelationship()
updateContactCompanyRelationship()
endContactCompanyRelationship()
```

---

## Employer change transaction

Correct workflow:

```text
end prior employment relation
+
create new employment relation
+
update derived current-employment projection
```

without creating a new Contact.

---

## Multiple current relationships

Backend must not rely only on:

```text
contact.currentCompanyId
```

as sole relational truth.

A derived primary/current relationship can exist for UI efficiency.

Canonical history should remain relationship-based.

---

## Lead association

Lead must reference Contact by ID once resolved.

If a Lead initially carries unresolved acquisition data:

resolution can link it later while preserving original evidence.

---

## ClientContact association

Use an explicit relationship, not:

```text
contact.isClient = true
```

as a replacement for Client relationship state.

---

## Contact ↔ User linking

If supported:

link through a governed service such as:

```text
ContactIdentityLinkService
```

with:

* User existence validation,
* same intended business context,
* duplicate-link checks,
* authorization,
* Audit.

---

## Contact/User linking must not mutate authentication data

Never:

```text
linkContactToUser()
→ replace AuthenticationIdentity.email with contact.email
```

These systems remain separate.

---

## Contact/User linking must not create membership

Permanent.

---

## Portal membership creation remains Design 062

Even when a Contact is linked to a User.

---

## Contact merge service

If duplicate resolution requires merge:

```text
ContactMergeService.merge(source, target)
```

should reconcile:

* aliases,
* communication addresses,
* external identities,
* Company relationships,
* Leads,
* ClientContact links,
* relevant Deal/person links,
* provenance.

---

## Merge preserves old Contact IDs

Old identifiers should redirect/reference the canonical surviving Contact.

---

## Merge collision handling

Potential conflicts:

* two primary emails,
* overlapping employment,
* contradictory titles,
* different external IDs,
* conflicting User links.

These require explicit policy.

Do not blindly concatenate and mark success.

---

## User-link merge collision is especially sensitive

If:

```text
Contact A → User U1
Contact B → User U2
```

automatic Contact merge must **not** merge or reassign Users.

This requires manual/security-sensitive resolution.

---

## Historical communication snapshots remain untouched

If an old Message was sent to:

```text
old@email.com
```

the Message retains that historical delivery/recipient evidence even if Contacts merge.

---

## Historical Contract signer remains untouched

Permanent.

---

## Optimistic concurrency

Contact edits should use Contact revision/version.

Employment and communication relationships can have their own revisions.

---

## Directory projection

`ContactDirectoryEntry` should be:

* permission-safe,
* source-derived,
* disposable/rebuildable.

It must never receive canonical mutation commands.

---

## Current employment projection

For fast directory listing, a projection can derive:

```text
primaryCurrentCompany
primaryCurrentTitle
```

from canonical relationships.

If unavailable/ambiguous:

do not invent one.

---

## Related counts

If frozen design includes:

```text
openLeadCount
dealCount
clientRelationshipIndicator
```

these should be permission-aware source-derived aggregates.

---

## Zero vs unavailable

Same rule as prior designs.

---

## Pagination

Use cursor pagination at scale.

Useful indexes may include:

* tenant + normalized name,
* tenant + current Company projection,
* tenant + lifecycle,
* normalized communication address,
* source/owner fields required by frozen filters.

Exact physical indexing Phase 3D.

---

## Search integration

Design 079 can index safe:

* canonical name,
* aliases,
* current Company/title,
* permitted work email/external identity metadata.

Do not broadly index:

* private personal email,
* private phone,
* security-linked User data,

without explicit policy.

---

## Search result identity

Always:

```text
sourceType = CONTACT
sourceId = contactId
```

---

## Design 087 reuse

Contact 360 must consume:

* the same Contact,
* the same communication addresses,
* the same Company relationships,
* the same Lead/Client links.

No duplicate person profile.

---

## Events/outbox

Useful events:

```text
ContactCreated
ContactUpdated
ContactRenamed
ContactCommunicationAddressAdded
ContactCommunicationAddressChanged
ContactCompanyRelationshipStarted
ContactCompanyRelationshipEnded
ContactExternalIdentityLinked
ContactMerged
ContactArchived
```

---

## Audit

Material identity/relationship changes should be audited.

Never write full sensitive communication values unnecessarily into Audit payloads if policy requires masking/minimization.

---

## Privacy / PII

Contact data can contain personal information.

Backend must support:

* least-privilege access,
* field minimization,
* appropriate retention,
* safe logs/analytics,
* tenant isolation.

---

## Partial subsystem failure

Example:

```text
Contact core       ✓
Employment         ✓
Lead summary       ✓
Portal link state  ✕
```

Return the Contact normally with:

> Portal-link state unavailable.

Do not mark:

> No Portal account.

---

## Backend Requirement Matrix

| Requirement                                                     | Status                    |
| --------------------------------------------------------------- | ------------------------- |
| Authenticated Team Workspace                                    | **Critical**              |
| Tenant isolation                                                | **Critical**              |
| Stable canonical Contact ID                                     | **Critical**              |
| Contact/User separation                                         | **Critical**              |
| Contact/AuthIdentity separation                                 | **Critical**              |
| Contact/ClientPortalUser separation                             | **Critical**              |
| Contact/Company separation                                      | **Critical**              |
| Contact/Lead separation                                         | **Critical**              |
| Contact/Client relationship separation                          | **Critical**              |
| Contact/name separation                                         | **Critical**              |
| ContactAlias support                                            | **Critical**              |
| CommunicationAddress first-class model                          | **Critical**              |
| Contact/email separation                                        | **Critical**              |
| Multiple email/phone support                                    | **Critical**              |
| Primary/current communication ≠ identity                        | **Critical**              |
| Communication normalization                                     | **Required**              |
| Normalization/verification separation                           | **Critical**              |
| Historical communication support                                | **Critical**              |
| No naïve global email uniqueness assumption                     | **Critical**              |
| ContactExternalIdentity model                                   | **Critical**              |
| Provider-scoped external IDs                                    | **Critical**              |
| External identity/AuthIdentity separation                       | **Critical**              |
| ContactCompanyRelationship reuse                                | **Critical**              |
| Temporal employment history                                     | **Critical**              |
| Employer change preserves Contact                               | **Critical**              |
| Multiple Company relationships support                          | **Critical architecture** |
| Current/title projection from relationships                     | **Critical**              |
| Lead references canonical Contact                               | **Critical**              |
| Lead lifecycle/Contact lifecycle separation                     | **Critical**              |
| Explicit ClientContact relationship                             | **Critical**              |
| ClientContact/Portal User separation                            | **Critical**              |
| Explicit Contact↔User link if used                              | **Critical**              |
| Email equality cannot auto-link User                            | **Critical**              |
| User link cannot create Membership                              | **Critical**              |
| Contact identity resolver shared with 083                       | **Critical**              |
| Tenant-scoped duplicate resolution                              | **Critical**              |
| Duplicate detection/merge separation                            | **Critical**              |
| Dedicated Contact merge service                                 | **Critical**              |
| Merge not hard delete                                           | **Critical**              |
| Merge lineage/old-ID resolution                                 | **Critical**              |
| Merge preserves communication/employment/Lead/Client provenance | **Critical**              |
| Merge does not rewrite historical Messages/Contracts            | **Critical**              |
| User-link merge conflicts handled safely                        | **Critical**              |
| Optimistic concurrency                                          | **Critical**              |
| Allowlisted mutation commands                                   | **Critical**              |
| ContactDirectoryEntry as read projection                        | **Critical**              |
| Permission-aware field projections                              | **Critical**              |
| Permission-aware aggregates                                     | **Critical**              |
| Zero/unavailable separation                                     | **Critical**              |
| Cursor pagination/indexing                                      | **Required at scale**     |
| Design 079 Universal Search reuse                               | **Critical**              |
| Design 087 same Contact identity                                | **Critical**              |
| Audit integration                                               | **Required**              |
| PII/privacy minimization                                        | **Critical**              |
| Partial subsystem failure handling                              | **Critical**              |

---

# 8. Consolidation

Design 086 exposes several major person-identity and privacy risks.

**Contact / email conflation**
Changing email creates another person.

**Email / primary key conflation**
Historical or shared addresses break identity.

**Email normalization / email ownership conflation**
Lowercasing/format cleanup is treated as verification.

**CommunicationAddress / Contact conflation**
One person cannot have multiple communication methods.

**Primary email / only email conflation**
Historical evidence disappears when address changes.

**Phone / Contact identity conflation**
Shared/reassigned phone creates false merge.

**Contact / User conflation**
Every CRM person becomes application account.

**Contact email / AuthenticationIdentity conflation**
CRM edit unexpectedly changes login credentials.

**Contact / ClientPortalUser conflation**
Known Client Contact gains Portal access automatically.

**ClientContact / ClientPortalMembership conflation**
Business relationship becomes security authorization.

**Email match / User-link conflation**
Unverified CRM email links Contact to wrong platform User.

**User link / Membership conflation**
CRM linkage grants tenant/Portal access.

**Contact / Company conflation**
Employee becomes Company identity.

**Contact company-name string / Company relationship conflation**
Employment breaks when Company renames.

**Employer change / new Contact conflation**
Career move creates duplicate person.

**Contact.currentCompanyId / full employment history conflation**
Former relationships disappear.

**Current title / Contact permanent field conflation**
Job title follows person forever after employer change.

**One Contact / one Company assumption**
Board/advisory/concurrent roles cannot be represented.

**Contact / Lead conflation**
Each sales lifecycle creates another person record.

**Lead disqualified / Contact invalid conflation**
Known person is deleted because one Lead failed.

**Lead converted / Contact converted conflation**
Person identity inherits Lead state.

**Contact / Client conflation**
Client relationship becomes person lifecycle.

**Client relationship ended / Contact archive conflation**
Person history disappears.

**ContactAlias / duplicate Contact conflation**
Alternate name creates second person.

**Same name / same Contact conflation**
Different people merge.

**Different name / different Contact conflation**
Name change duplicates one person.

**ContactExternalIdentity / Contact conflation**
Each provider profile creates another Contact.

**External ID without provider namespace**
Different platforms collide.

**External identity / AuthenticationIdentity conflation**
CRM provider profile becomes login identity.

**Exact email / guaranteed duplicate conflation**
Shared/recycled address produces destructive merge.

**Phone match / guaranteed duplicate conflation**
Shared company number merges people.

**Name + Company / guaranteed identity conflation**
Large-company namesakes merge incorrectly.

**DuplicateMatch / destructive merge conflation**
Detection deletes one Contact automatically.

**Merge / hard delete conflation**
Old Contact references break.

**Merge / historical evidence rewrite conflation**
Messages/Contracts change participant identity retroactively.

**Merge / User merge conflation**
Two CRM Contacts linked to different Users cause dangerous account merge.

**Contact lifecycle / employment state conflation**
Former employee appears archived.

**Contact lifecycle / Portal state conflation**
Revoked Portal user appears deleted from CRM.

**Portal User disabled / Contact inactive conflation**
Authentication security affects CRM history.

**Contact directory row / Contact entity conflation**
Read model becomes editable truth.

**Current employer projection / canonical employment conflation**
Directory convenience field overwrites relationship history.

**Directory primary email / Contact identity conflation**
List sort/filter field becomes identity key.

**Directory count / canonical relationship conflation**
Lead count is manually edited.

**Zero Lead count / unavailable Lead service conflation**
Outage appears as no sales history.

**Company access / Contact PII access conflation**
Viewing Company exposes private Contact data.

**Contact read / communication read conflation**
Directory user sees every phone/email.

**Contact edit / Authentication management conflation**
Sales user changes login identity.

**Contact edit / Portal access management conflation**
CRM user grants Portal role.

**Contact edit / Company edit conflation**
Employment manager changes Company record.

**Contact edit / merge permission conflation**
Normal editor performs destructive identity resolution.

**Cross-tenant contact matching**
One tenant's private CRM data influences another.

**Bulk import race**
Two imported Candidates create duplicate Contacts.

**Check-then-create duplicate race**
Concurrent workers bypass identity resolver.

**Contact/User link arbitrary userId tampering**
CRM editor links executive Contact to privileged internal User.

**Search indexing / PII leakage**
Private email/phone becomes universally searchable.

**Current Contact profile / historical Message evidence conflation**
Old Message recipient changes after email update.

**Current Contact profile / Contract signer snapshot conflation**
Legal history changes after job/email update.

**086/083 duplicate Contact resolver**
Import and CRM directory disagree on person identity.

**086/084–085 duplicate employment model**
Company CRM and Contact CRM store different employer truth.

**086/087 duplicate Contact backend**
Directory and 360 use separate person records.

**086/011 duplicate Lead-person identity**
Lead CRM stores an independent copy of person details.

No additional screen is required.

These are **person identity, communication-address modeling, employment history, User/Auth separation, Client Portal separation, duplicate resolution, privacy, merge safety and directory-projection requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL CONTACT CRM DIRECTORY, PERSON IDENTITY & COMMUNICATION-RELATIONSHIP ANCHOR**

**Domain directive:**
**Contact ≠ User ≠ AuthenticationIdentity ≠ Company ≠ ContactCompanyRelationship ≠ Lead ≠ ClientContact/ClientPortalUser ≠ CommunicationAddress ≠ ContactAlias/ExternalIdentity ≠ ContactDirectoryProjection.**

**Identity directive:**
Contact is the stable tenant-scoped CRM identity of a person. Name, email, phone, Company, title, Lead or Portal status never becomes the Contact's primary identity.

**Name directive:**
name changes, aliases, source spellings and alternate representations preserve the same Contact through explicit alias/history semantics rather than duplicate person creation.

**Communication directive:**
email addresses, phone numbers and other contact methods are first-class typed CommunicationAddresses/ContactPoints associated with Contact and capable of current, primary, historical, verified, invalid and source-provenance states.

**Email directive:**
email is identity evidence and communication routing—not Contact identity. Changing an email never recreates Contact and never changes AuthenticationIdentity automatically.

**Authentication directive:**
Contact remains strictly separate from User and AuthenticationIdentity. CRM edits cannot change login credentials, sessions or security identity.

**Portal directive:**
Contact and ClientContact do not imply Portal User or ClientPortalMembership. Portal access continues exclusively through Designs 062 and 075–077.

**User-link directive:**
if Contact↔User linkage is required, it is an explicit governed relationship. Matching email strings alone never establish it, and linking never creates roles, permissions or membership.

**Company directive:**
Contact employment/association uses the temporal ContactCompanyRelationship foundation from Designs 084–085. Employer/job changes update relationship history rather than recreating Contact.

**Employment directive:**
current Company/title can be derived for directory presentation, but canonical employment truth remains relational and historical. One Contact can support multiple current/historical Company relationships where business reality requires it.

**Lead directive:**
Lead remains a separate Sales entity referencing Contact where resolved. Lead qualification, conversion, disqualification or deletion does not redefine Contact identity.

**Client directive:**
ClientContact is an explicit commercial relationship around the Contact, not the Contact itself and not a security principal.

**External-identity directive:**
provider/social/source identifiers remain provider-scoped ContactExternalIdentities and must never be confused with AuthenticationIdentity.

**Admission directive:**
Design 083 and Design 086 must share one `ContactIdentityResolutionService`. Acquisition/import should link to an existing Contact when safely resolved rather than creating another person record.

**Duplicate directive:**
duplicate detection produces explainable identity evidence. Same name, same Company, email similarity, phone similarity or fuzzy scores cannot trigger uncontrolled destructive merges.

**Merge directive:**
Contact merge, when required, is a separately authorized canonical operation preserving aliases, CommunicationAddresses, external identities, Company relationships, Leads, ClientContact relationships and provenance while retaining merge lineage for old IDs.

**User-merge safety directive:**
Contact merge must never merge platform Users or AuthenticationIdentities automatically. Conflicting Contact→User links require separate security-sensitive resolution.

**Historical-evidence directive:**
Contact name/email/employment edits and Contact merges never rewrite historical Message sender/recipient evidence, ContractParty/Signer snapshots, Proposal/Invoice evidence or prior Audit events.

**Lifecycle directive:**
Contact lifecycle remains independent from employment state, Lead lifecycle, Client relationship state, User security state, Portal membership state and communication-address validity.

**Directory directive:**
`ContactDirectoryEntry` is a permission-safe read projection over canonical Contact and related data. It can expose current employer/title/primary communication summaries while remaining disposable and non-editable as source truth.

**Privacy directive:**
Contact profile and communication data are personal data. Directory payloads should use least-privilege field projections, server-side filtering, safe logging and tenant isolation rather than sending full PII to the browser.

**Authorization directive:**
Contact read/edit, communication-address access, employment management, external identity management, Client/User linkage and destructive merge permissions remain separately enforced.

**Aggregate directive:**
Lead/Deal/Client summaries and counts are permission-aware projections. `0`, `restricted`, `unknown`, and `service unavailable` must remain distinct.

**Concurrency directive:**
Contact creation/import, identity resolution, communication updates, Company relationship changes and merges require transactional/revision protection so concurrent workflows cannot create duplicate or split person identities.

**Search directive:**
Design 079 may index safe authorized Contact identity data and aliases/current business context using canonical Contact IDs. Private communication data and platform security identity should not become broadly searchable metadata.

**Detail directive:**
Design 087 must use the same Contact, CommunicationAddress, ExternalIdentity and ContactCompanyRelationship records rather than building another Contact 360 profile backend.

**Future-reuse directive:**
later Lead/Deal/Client/communication screens must continue referencing the same Contact identity while maintaining their own domain state and immutable historical snapshots.

**Audit directive:**
Contact creation, identity/profile changes, communication updates, employment changes, User-link changes, archival and merges generate appropriate Audit evidence without unnecessarily leaking sensitive PII.

**Failure directive:**
Contact core identity, employment, Lead summaries, User-link state, Portal state, duplicate resolver and search indexing can fail independently. Failure of a related subsystem must never become `No Company`, `No Leads`, `No User`, `No Portal Membership`, or a different Contact identity.

**Overlap directive:**
Designs **011, 021, 036–037, 059, 062, 075–079, 083–087 and later 089/094/096/106** should all reuse one stable Contact identity while preserving User, AuthenticationIdentity, Company, Lead, Client, PortalMembership and communication records as distinct domains.

**Consolidation directive:**
**STANDARDIZE ONE CANONICAL CONTACT CRM FOUNDATION — STABLE TENANT-SCOPED CONTACT IDENTITY + CONTACTALIASES + MULTI-ADDRESS COMMUNICATION MODEL + PROVIDER-SCOPED EXTERNAL IDENTITIES + TEMPORAL CONTACT-COMPANY RELATIONSHIPS + CANONICAL LEAD/CLIENT LINKS + EXPLICIT OPTIONAL USER LINK + EXPLAINABLE CONTACT IDENTITY RESOLUTION + GOVERNED NON-DESTRUCTIVE MERGE + PROVENANCE-PRESERVING CRM ADMISSION — AND NEVER ALLOW AN EMAIL, PHONE, EMPLOYER, JOB TITLE, LEAD ROW, CLIENT RELATIONSHIP, PORTAL ACCOUNT, AUTHENTICATION IDENTITY OR DIRECTORY PROJECTION TO BECOME PERSON IDENTITY BY ACCIDENT.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **86 / 153** |
| **PASS**                                   |                         **86** |
| **STANDARDIZE decisions**                  |                         **84** |
| **Potential implementation-overlap flags** |                         **77** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**86 / 153 = 56.2% audited.**

### Canonical Contact architecture after Design 086

```text
                       CONTACT
                 canonical CRM person
                        │
      ┌─────────────────┼──────────────────┐
      ↓                 ↓                  ↓
 ContactAlias[]   CommunicationAddress[]  ExternalIdentity[]
                        │
                        ↓
             ContactCompanyRelationship[]
                        │
                        ↓
                     Company
                        │
       ┌────────────────┼─────────────────┐
       ↓                ↓                 ↓
      Leads        ClientContact       Deal context
                        │
                        ↓
                 optional explicit
                   ContactUserLink
                        │
                        ↓
                       User
                        │
                AuthenticationIdentity
                        │
                ClientPortalMembership
```

But these lower relationships do **not** collapse upward:

```text
Contact
≠ User
≠ AuthenticationIdentity
≠ Portal Membership

Contact
≠ Lead
≠ Company
≠ Client
```

And the employment invariant is now explicit:

```text
Sarah changes employer

OLD:
Contact C-100
→ Acme relationship ends

NEW:
Contact C-100
→ Globex relationship starts

Contact ID remains C-100.
```

Likewise:

```text
Email changes
→ CommunicationAddress changes

Name changes
→ Contact/Alias history changes

Lead closes
→ Lead state changes

Portal membership revoked
→ Portal access changes

NONE OF THESE
→ create a new Contact.
```

# Next Sequential Audit Target

## **Design 087 — Contact Detail / Contact 360**

The next audit should preserve the Contact-detail composition boundary:

> **Contact ≠ ContactProfileProjection ≠ CommunicationAddress ≠ ContactCompanyRelationship ≠ Company ≠ Lead ≠ Deal/Opportunity ≠ ClientRelationship ≠ User/PortalIdentity ≠ Message/Conversation ≠ Meeting/FollowUp ≠ Task ≠ Note ≠ ActivityEvent.**

It should reconcile Design **086's canonical Contact identity** with Company, Lead, Client, communication and interaction context while preserving:

* Contact 360 is a composition workspace, not a second Contact entity,
* Contact profile ≠ CommunicationAddress collection,
* current Company/title are relationship projections, not immutable Contact fields,
* Lead and Deal lifecycles remain their own domains,
* Client relationship and Portal identity remain separate from Contact,
* messages, meetings, follow-ups, tasks and notes remain canonical source records,
* historical interaction evidence survives Contact profile/employer/email changes,
* sensitive sections require independent source permissions,
* one related-domain failure must not make the canonical Contact appear missing.

The sequence continues strictly with **Design 087 only next**, under the unchanged audit contract.
