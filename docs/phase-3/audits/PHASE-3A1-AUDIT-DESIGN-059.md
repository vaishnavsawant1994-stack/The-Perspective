# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 059 — Client Profile & Account Settings

Its frozen identity is locked.

Design 059 should become the **canonical Client Portal personal-profile and user-preference workspace** for the currently authenticated person.

Its governing boundary is:

> **User Identity ≠ Portal Membership ≠ Client Contact ≠ Personal Profile ≠ User Preferences ≠ Organization Settings ≠ Authentication Credentials ≠ Authorization Roles.**

The most important implementation principle is:

> **Editing “My Profile” may change the current user’s permitted personal presentation/preferences, but it must never silently rewrite organization data, Portal access, legal evidence, CRM history, authentication security, or authorization.**

---

# 1. Classification

| Audit field                            | Classification                                                                                               |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Design ID**                          | **059**                                                                                                      |
| **Canonical name**                     | **Client Profile & Account Settings**                                                                        |
| **Product area**                       | Client Portal / Personal Account / Preferences                                                               |
| **User surface**                       | **Client Portal**                                                                                            |
| **Screen class**                       | Personal Profile + User Preference Settings Workspace                                                        |
| **Classification**                     | **Portal Settings Anchor — Personal Account & Preference Family**                                            |
| **Primary purpose**                    | Let the authenticated Client user manage their permitted personal profile fields and user-scoped preferences |
| **Canonical identity**                 | **User**                                                                                                     |
| **Portal relationship**                | **ClientPortalMembership**                                                                                   |
| **Profile entity**                     | **UserProfile / PersonalProfile**                                                                            |
| **Preference entity**                  | **UserPreferences**                                                                                          |
| **CRM relationship**                   | Contact — separate canonical concept                                                                         |
| **Organization dependency**            | Design 060                                                                                                   |
| **Notification preference dependency** | Design 061                                                                                                   |
| **Portal access dependency**           | Design 062                                                                                                   |
| **People identity foundation**         | Design 036                                                                                                   |
| **Authorization foundation**           | Design 037                                                                                                   |
| **Organization settings foundation**   | Design 040                                                                                                   |
| **Authentication/recovery overlap**    | Designs 075–077                                                                                              |
| **Asset dependency**                   | Design 030 for avatar/profile image where used                                                               |
| **Audit dependency**                   | Design 039 for material account/security changes where applicable                                            |
| **Parent shell**                       | `ClientPortalShell` — Design 002                                                                             |
| **Primary read model**                 | `ClientPersonalAccountView`                                                                                  |
| **Template family**                    | `PersonalAccountSettingsTemplate`                                                                            |
| **Auth**                               | Required                                                                                                     |
| **Authorization**                      | Current authenticated user + active Portal membership + field-level update policy                            |
| **Implementation priority**            | **Critical Identity / Account Integrity**                                                                    |
| **Reuse level**                        | **Very High across Identity, Portal Membership, Preferences and Settings**                                   |

Design 059 should answer:

> **“Who am I in this Portal, which personal information can I change myself, what preferences apply only to me, and which organization/access/security settings belong somewhere else?”**

Canonical separation:

```text
                    USER IDENTITY
                         │
            ┌────────────┼─────────────┐
            ↓            ↓             ↓
      PersonalProfile  Preferences  Auth Identity
            │
            │
            └──── user-scoped
                         │
                         ↓
                Portal Membership
                         │
                         ↓
               Client Organization
```

with these remaining independent:

```text
Client Contact
Authorization Roles
Organization Settings
Contract-party snapshots
Signer/Approver evidence
```

---

# 2. Reuse

## Reuse Design 036 identity infrastructure

Design 036 already established:

> **User ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ RoleAssignment.**

For the Client Portal, the equivalent principle remains:

```text
User
  ↓
ClientPortalMembership
  ↓
Client organization/context
```

Design 059 should not introduce a separate `ClientUserIdentity` authentication universe if the platform already has a canonical User identity.

---

## Reuse Design 037 authorization

Design 059 should **consume authorization**, never administer it.

A Profile form must not be able to write:

```text
roleId
permissions
portalRole
organizationId
isAdmin
```

because those belong to access administration.

Design 062 owns Client Portal Users / Team Access.

---

## Reuse Design 040 setting-resolution principles

Design 040 established setting scopes such as:

```text
platform default
      ↓
organization setting
      ↓
user preference where override allowed
```

Design 059 should reuse this resolution approach for applicable personal preferences.

---

## Reuse Design 030 for avatar/profile images

If the frozen design contains a profile image:

```text
UserProfile
    ↓
Avatar reference
    ↓
Asset / FileVersion
```

Do not create profile-specific blob storage.

---

## Design 060 relationship

Design 059:

> **My personal account**

Design 060:

> **The Client organization/company**

These must remain separate.

Changing:

> My job title display

must not automatically rewrite the legal/company profile unless an explicit organization-admin workflow exists.

---

## Design 061 relationship

Design 059 may show general account preferences, but detailed Notification channel/preferences belong to:

**061 — Client Notifications / Notification Preferences**

Do not create two competing notification-preference stores.

---

## Design 062 relationship

Design 062 owns:

* Portal users,
* invitations,
* team access,
* Portal roles/scopes.

Design 059 cannot grant its own access.

---

## Designs 075–077 relationship

Later:

* 075 Client Sign In
* 076 Portal Activation / Accept Invite
* 077 Client Access Recovery

These own authentication/access lifecycle.

Design 059 may expose account/security entry points only if present in the frozen UI, but authentication credential changes must use the canonical auth subsystem.

---

# 3. Entities

## User Identity ≠ Personal Profile

`User` is the stable authenticated identity.

`PersonalProfile` contains mutable presentation/account information.

Conceptually:

```text
User
├── stable identity
├── auth linkage
└── lifecycle

PersonalProfile
├── display name
├── preferred name
├── avatar
├── permitted personal contact/display fields
└── profile metadata
```

Do not make the mutable display name the primary identity key.

---

## Email ≠ identity automatically

This is critical.

A person's email can be used for:

* login,
* communication,
* CRM Contact data,
* Contract signer evidence.

Those are not necessarily one mutable field.

Never model:

```text
user.id = email
```

conceptually.

Use a stable internal ID.

---

## Login email ≠ profile contact email necessarily

If the product allows changing a personal communication email, that does not automatically mean:

> Change authentication login credential.

Credential changes require the authentication subsystem and verification policy.

---

## User ≠ Portal Membership

One User can conceptually have:

```text
User U1
├── PortalMembership Client A
└── PortalMembership Client B
```

where the business ever supports multiple organizations.

Therefore:

> membership-specific roles/context must not live directly on the global User record.

---

## Portal Membership ≠ Client Contact

CRM Contact represents a business/person record.

PortalMembership represents access.

A Contact may exist without Portal access.

A Portal user may have historical/contact linkage, but these remain distinct concepts.

---

## Contact email ≠ login email automatically

Changing a CRM Contact email internally should not unexpectedly change the user's authentication login.

Likewise, changing a personal login email should not silently rewrite historical CRM correspondence.

Any synchronization must be explicit and governed.

---

## Contact ≠ PersonalProfile

A CRM Contact can contain business enrichment:

* company,
* role,
* lead source,
* relationship history,
* enrichment fields.

Design 059 must not expose or overwrite those as personal account settings.

---

## Personal Profile ≠ Organization profile

Example:

```text
PersonalProfile:
Vaishnav Sawant
Editorial Director

Organization:
Perspective Media GmbH
Berlin, Germany
```

Editing the first does not rewrite the second.

Design 060 owns Client organization/company settings.

---

## Organization display role ≠ authorization role

A profile field such as:

> Marketing Director

is descriptive.

It must not grant:

```text
portal.approvals.decide
```

or any other permission.

Permanent:

> **Job title ≠ RoleAssignment.**

---

## UserPreferences ≠ OrganizationSettings

Examples of plausible user-scoped preferences:

```text
preferred locale
personal timezone/display timezone
date/time display
interface preferences
```

only where supported by frozen UI.

Organization-wide defaults remain Design 040/060 territory.

---

## User preference ≠ canonical business timezone

If a Client changes their personal display timezone:

historical:

* Contract times,
* Meeting times,
* Approval timestamps,
* Invoice due dates,

must not be rewritten.

The preference affects presentation/default behavior only where permitted.

---

## User preference ≠ shared Project configuration

A Client changing their personal display preferences cannot modify Project behavior for teammates.

---

## Authentication Credentials ≠ Profile

Credentials can include:

* password,
* passkey,
* authentication email,
* MFA factors,
* sessions,
* recovery mechanisms.

These belong to the authentication/security subsystem.

Design 059 must not treat them as ordinary editable profile fields.

---

## Password ≠ profile attribute

Never persist:

```text
profile.password
```

or route password changes through a general profile update endpoint.

---

## Authentication email changes require verification

If the system eventually allows login-email changes, the safe conceptual flow is:

```text
request credential email change
        ↓
verify new address
        ↓
security checks
        ↓
change AuthIdentity
```

not:

```text
PATCH /profile
{ email: "..." }
```

This audit adds no new security screen.

---

## Authorization Role ≠ Personal Preference

The user cannot choose:

> Administrator

from Profile settings.

Roles and entitlements remain server-managed through Design 062/037.

---

## Portal Membership status ≠ Profile status

A perfectly valid Profile can belong to a:

```text
SUSPENDED
DEACTIVATED
EXPIRED
```

membership.

Editing profile data does not reactivate access.

---

## Profile completion ≠ membership activation

Filling every Profile field cannot bypass activation/invitation state.

---

## Personal Profile change ≠ ContractParty update

This is a legal-history boundary.

Suppose:

```text
Contract signed:
Michael Weber
CEO
August 2
```

and later Michael changes his Profile title to:

> Chairman.

The historical Contract must still reflect signing-time evidence.

---

## Profile change ≠ Signer evidence update

Likewise, Design 053 established signing-time identity evidence.

Historical:

```text
SignerSnapshot
```

or equivalent legal evidence remains immutable.

---

## Profile change ≠ Approval evidence update

If an ApprovalDecision recorded:

> Sarah Jones — Marketing Director

at decision time, later profile changes must not rewrite historical Approval evidence.

The canonical Approval actor linkage can resolve current identity while preserving meaningful decision-time context.

---

## Profile change ≠ Message authorship rewrite

Historical Messages may display current avatar/name according to product policy, but authorship remains linked to stable User identity.

Do not lose who authored the Message because display metadata changes.

---

## Profile change ≠ Audit history rewrite

AuditEvents must retain actor identity.

Changing the person's display name should not alter historical actor IDs or forensic truth.

---

## Avatar Asset ≠ user identity

Changing profile image affects presentation only.

It never creates a new User.

---

## Avatar FileVersion

If historical artifacts need an old avatar, they should not depend on `latest avatar`.

Most live profile surfaces can resolve current avatar; formal legal evidence should not.

---

## Display name vs legal name

If both exist in the product, distinguish:

```text
display/preferred name
```

from:

```text
verified/legal name
```

Design 059 must not let a casual presentation-field edit rewrite legally relied-on identity evidence.

Exact identity-verification requirements belong to Phase 3D.

---

## Phone number

If the frozen design includes phone:

determine whether it is:

* personal profile contact information,
* verified authentication/recovery factor,
* CRM Contact field.

One displayed phone field must not silently mutate all three domains.

---

## Address

Similarly:

> My personal address

is not automatically:

* Client organization address,
* Contract legal address,
* Invoice billing address.

Those require explicit contextual ownership.

---

## UserPreferences should be scoped

Conceptually:

```text
UserPreferences
├── userId
├── locale
├── timezone preference
├── display preferences
└── other allowed user-scoped choices
```

Exact fields later.

Avoid a free-form unvalidated JSON bucket for security-sensitive configuration.

---

## Preference inheritance

Where applicable:

```text
Organization default
        ↓
User override
```

But only for settings marked user-overridable.

A user cannot override:

* security policy,
* legal billing currency,
* RBAC rules,

merely because settings inheritance exists.

---

## Null preference ≠ explicit value

A missing user override can mean:

> inherit organization default.

That differs from an explicit selected value.

---

## Organization default change

If the organization default changes:

users without overrides inherit the new value.

Users with explicit overrides retain their chosen preference where allowed.

---

## User deactivation ≠ Profile deletion

If Portal access is removed:

the historical User/Profile may remain for:

* Contract evidence,
* Approval evidence,
* Messages,
* Activity,
* Audit.

Access lifecycle and data retention remain separate.

---

## Account deletion

If user-account deletion/privacy workflows ever exist, they require dedicated policy around legal/audit retention.

Design 059's presence does not imply a generic destructive:

> Delete all my history

operation.

No such feature is added by this audit.

---

# 4. Permissions

Design 059's main rule should be:

> **A user may update only explicitly self-editable fields belonging to their own profile/preference scope.**

---

## Self-edit ≠ arbitrary User update

Dangerous:

```text
PATCH /users/:id
{ ...browserPayload }
```

Correct:

```text
updateMyProfile(whitelistedFields)
```

with actor derived from authenticated session.

---

## Never trust userId from the form

The backend should determine:

```text
currentUserId
```

from the authenticated session.

A malicious Client must not change:

```text
userId = someone_else
```

and edit another profile.

---

## Field-level allowlist is mandatory

A Profile update command should reject attempts to mutate:

```text
organizationId
portalMembershipId
roleId
permissions
status
isAdmin
verified
contractPartyId
billingAccess
```

or other protected fields.

This prevents mass-assignment vulnerabilities.

---

## Profile read ≠ Profile update

Some surfaces may show another Client participant's safe profile.

That never implies the viewer can edit it.

---

## Personal Profile edit ≠ organization administration

```text
profile.update_self
≠
organization.manage
```

---

## Profile edit ≠ Portal Team management

```text
profile.update_self
≠
portal.users.manage
```

---

## Profile edit ≠ Role management

```text
profile.update_self
≠
portal.roles.assign
```

---

## Profile edit ≠ credential management

```text
profile.update_self
≠
auth.credentials.change
```

---

## Profile edit ≠ notification administration

Personal notification preferences can be delegated to Design 061.

Organization notification policy remains separate.

---

## Portal Membership authorization

Design 059 should generally require:

```text
authenticated User
+
active/eligible Portal Membership
```

according to Portal access policy.

A deactivated membership cannot use Profile settings to reactivate itself.

---

## Multi-membership context

If one User belongs to multiple Client organizations:

global Profile fields can apply across contexts.

Membership-specific preferences/context must remain correctly scoped.

Do not accidentally update all memberships when changing one organization-scoped property.

---

## Client-safe profile exposure

Other Client Portal participants should receive only approved fields.

Do not expose:

* recovery email,
* authentication metadata,
* MFA information,
* internal IDs,
* security status,

through general profile DTOs.

---

## Profile search

If users appear in Design 062/team lists:

search should use Client-safe membership projections rather than full User/Auth records.

---

## Security logs

Material authentication credential changes, when performed through dedicated auth workflows, should be audited appropriately.

Normal cosmetic profile edits may use lighter activity/audit policy.

---

# 5. States

Design 059 needs separation across identity, profile, membership, and preference state.

### Profile persistence

```text
Profile Loading
Profile Available
Editing
Saving
Saved
Save Failed
Validation Error
Conflict / Updated Elsewhere
```

### Membership/access

```text
Membership Active
Membership Restricted
Membership Suspended / Deactivated
Portal Access Revoked
```

### Avatar/file

```text
Avatar Uploading
Avatar Processing
Avatar Ready
Avatar Upload Failed
```

### Preference resolution

```text
Using Organization Default
Personal Override Active
Preference Save Failed
```

### Authentication-linked state where visible

```text
Credential Change Requires Dedicated Flow
Verification Pending
```

only if such information appears in the frozen screen.

These must **not** become one `account.status` enum.

---

## Profile incomplete ≠ access denied

A missing avatar or job title should not automatically disable the account unless an explicit onboarding rule exists.

---

## Save failed ≠ account deactivated

Technical Profile-save failure is not an identity/access failure.

---

## Avatar failed ≠ Profile save failed

If the avatar processor fails while textual profile changes succeed:

preserve the text update and report the image problem separately.

---

## Preference failure ≠ Profile corruption

A failed timezone/preference update should not roll back unrelated saved Profile fields unless the mutation was explicitly transactional.

---

## Membership revoked ≠ Profile deleted

The Profile can remain historically while Portal access is denied.

---

## Authentication verification pending ≠ Profile unverified generally

Do not overload one vague `verified` Boolean to represent:

* email verification,
* identity verification,
* Portal activation,
* Contract signer verification.

These are different concepts.

---

## Profile updated elsewhere

Two active sessions can edit Profile simultaneously.

Use optimistic concurrency/revision semantics where helpful to avoid silent overwrites.

---

## Empty optional field ≠ missing identity

An optional field such as avatar/title being blank should not produce:

> User not found.

---

## Organization data unavailable

If Design 059 shows a small organization reference and Organization service fails:

Profile editing can remain usable if safe.

Use localized degradation.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve a simple personal-settings hierarchy:

```text
Profile & Account
↓
Personal Profile
├── avatar if frozen
├── name/display fields
├── personal contact/display information
└── other self-editable fields
↓
Personal Preferences
├── locale/timezone/display choices where frozen
└── user-scoped settings
↓
Account / security references where frozen
```

It should not become an organization-admin or RBAC screen.

---

## Tablet

Following Design 152:

* multi-column forms stack logically,
* avatar/profile summary remains clear,
* Save actions stay prominent,
* preference groups remain separated,
* explanatory text distinguishes user vs company-level settings.

---

## Mobile

Priority:

```text
Profile
↓
Avatar / Identity Summary
↓
Personal Information
↓
Preferences
↓
Save
↓
Account/security entry points if present
```

Do not compress desktop settings into tiny two-column fields.

---

## Mobile destructive/security actions

If the frozen design contains any sensitive account actions:

they must remain clearly separated from ordinary Profile Save.

A user should never accidentally trigger a credential or access operation while changing their avatar.

---

## Accessibility

Every form control requires:

* explicit label,
* current value,
* help text where needed,
* validation association,
* required/optional semantics.

Success/error states must be programmatically announced.

---

## Avatar accessibility

Profile image upload requires:

* accessible action text,
* upload progress/state,
* fallback initials/icon,
* no dependence on the image to communicate identity.

---

# 7. Backend Requirements

## Read architecture

```text
Design 059
    ↓
ClientPortalSessionContext
    ↓
Current User + Membership Authorization
    ↓
ClientPersonalAccountQueryService
    │
    ├── User
    ├── PersonalProfile
    ├── current PortalMembership summary
    ├── UserPreferences
    ├── Organization-default preference resolution
    └── Avatar Asset projection
    ↓
ClientPersonalAccountView
```

---

## Write architecture

Use narrow commands:

```text
updateMyPersonalProfile()
updateMyUserPreferences()
updateMyAvatar()
```

according to frozen fields.

Do **not** use:

```text
PATCH /user
{ arbitraryObject }
```

---

## Protected-field enforcement

The update service should:

```text
authenticate actor
↓
derive current User
↓
validate active Portal context
↓
allowlist self-editable fields
↓
validate values
↓
persist Profile/Preferences
↓
invalidate safe caches
↓
emit appropriate activity/audit events
```

---

## Authentication changes

If Design 059 contains a security entry:

```text
Profile screen
    ↓
dedicated Auth command/workflow
```

Credentials must remain behind:

* reauthentication where required,
* verification,
* rate limits,
* session/security controls.

No password or MFA mutation through Profile service.

---

## Identity-linking architecture

If User and CRM Contact are linked:

```text
User
 ↔ controlled identity/contact linkage
Contact
```

Synchronization rules must explicitly identify:

* source of truth,
* allowed direction,
* conflict handling.

Do not maintain hidden two-way synchronization of every field.

---

## Historical snapshot protection

Profile writes must never cascade updates into immutable evidence tables such as:

```text
ContractPartySnapshot
SignerEvidence
ApprovalDecision actor snapshot
AuditEvent actor context
historical Proposal recipient
```

Stable User linkage can remain, but historical facts remain preserved.

---

## Avatar pipeline

```text
Client selects image
      ↓
upload authorization
      ↓
Asset/FileVersion
      ↓
scan/processing
      ↓
approved avatar derivative
      ↓
PersonalProfile avatar reference
```

The Profile should not point to an unsafe/unprocessed upload.

---

## Preference resolution service

Conceptually:

```text
resolvePreference(key):
    user override if allowed/present
    else organization default
    else platform default
```

The resolver should know which settings permit user override.

---

## Cache safety

Profile/preference cache keys should use User identity and applicable membership/context.

Never cache:

> current Client profile

by organization alone.

---

## Session effects

Changing a display name/avatar may require session/UI cache refresh.

It must not force privilege changes.

Changing authorization still requires canonical Role/Membership updates and fresh entitlement evaluation elsewhere.

---

## Activity integration

Design 063 may later show safe account events such as:

> Profile updated.

But sensitive changes may require reduced details.

Activity remains distinct from Audit.

---

## Audit integration

Potential material events:

```text
PersonalProfileUpdated
UserPreferenceUpdated
AvatarChanged
```

according to auditing policy.

Security credential events should come from the auth subsystem.

---

## Backend Requirement Matrix

| Requirement                                   | Status                               |
| --------------------------------------------- | ------------------------------------ |
| Client Portal authentication                  | **Critical**                         |
| Current-user derivation from session          | **Critical**                         |
| Active Portal membership validation           | **Critical**                         |
| Canonical User reuse                          | **Critical**                         |
| PortalMembership separation                   | **Critical**                         |
| Client Contact separation                     | **Critical**                         |
| PersonalProfile model                         | **Critical**                         |
| UserPreferences model                         | **Critical**                         |
| OrganizationSettings separation               | **Critical**                         |
| AuthCredential separation                     | **Critical**                         |
| Authorization Role separation                 | **Critical**                         |
| Self-update field allowlist                   | **Critical**                         |
| Mass-assignment protection                    | **Critical**                         |
| User ID tampering prevention                  | **Critical**                         |
| Profile/organization update separation        | **Critical**                         |
| Profile/RBAC update separation                | **Critical**                         |
| Profile/auth update separation                | **Critical**                         |
| Multi-membership-safe scoping                 | **Critical**                         |
| Stable User identity independent from email   | **Critical**                         |
| Controlled User ↔ Contact linkage             | **Critical**                         |
| Historical Contract-party snapshot protection | **Critical**                         |
| Historical signer-evidence protection         | **Critical**                         |
| Historical approval-evidence protection       | **Critical**                         |
| Audit actor preservation                      | **Critical**                         |
| Design 030 Asset reuse for avatar             | **Required if avatar exists**        |
| Upload scan/processing                        | **Critical if avatar upload exists** |
| User preference inheritance/resolution        | **Required**                         |
| Organization default fallback                 | **Required**                         |
| User override policy                          | **Required**                         |
| Optimistic concurrency                        | **Required**                         |
| Validation/sanitization                       | **Critical**                         |
| Permission-safe profile projections           | **Critical**                         |
| Cache invalidation                            | **Required**                         |
| Activity integration                          | **Required**                         |
| Audit integration                             | **Required**                         |
| Designs 036/037/040 reuse                     | **Critical**                         |
| Designs 060–062 integration                   | **Critical architecture**            |
| Designs 075–077 Auth reuse                    | **Critical architecture**            |

---

# 8. Consolidation

Design 059 exposes several major implementation risks.

**User / Profile conflation**
Mutable display fields become canonical identity.

**User / PortalMembership conflation**
Organization-specific access is stored directly on global User.

**User / Contact conflation**
CRM Contact and authenticated account become one record.

**Email / stable identity conflation**
Changing email breaks historical ownership and references.

**Login email / contact email conflation**
Ordinary Profile edit silently changes authentication.

**Profile / Organization conflation**
Changing personal information rewrites Client company data.

**Job title / authorization-role conflation**
Editing “Director” grants permissions.

**Personal preference / Organization setting conflation**
One user's timezone changes company-wide behavior.

**User preference / business truth conflation**
Display timezone rewrites Meetings, Contracts or due dates.

**Profile / Authentication credential conflation**
Password/MFA fields handled through generic Profile PATCH.

**Profile / Portal activation conflation**
Completing Profile activates a suspended membership.

**Portal Admin / self-profile conflation**
Client team administrator can alter own permissions through Profile.

**Mass-assignment vulnerability**
Browser submits `roleId`, `organizationId`, `isAdmin`, etc. through generic update endpoint.

**User ID tampering**
Client edits another person's Profile by changing request ID.

**Contact synchronization corruption**
Hidden two-way sync rewrites CRM data unexpectedly.

**Profile change / ContractParty history conflation**
Current company/name data rewrites executed legal document context.

**Profile change / Signer evidence conflation**
Later title/name change rewrites signing history.

**Profile change / Approval evidence conflation**
Historical approver evidence changes retroactively.

**Profile change / Audit actor conflation**
Forensic history loses stable actor identity.

**Avatar / identity conflation**
New image accidentally creates/reassigns user identity.

**Avatar / raw storage conflation**
Unsafe uploaded image becomes immediately public/usable.

**Personal phone / recovery factor conflation**
Editing phone silently alters MFA/recovery configuration.

**Personal address / billing/legal address conflation**
Profile update changes Contract or Invoice address.

**Null preference / explicit override conflation**
“Inherit organization default” becomes indistinguishable from selected value.

**Organization default / user override conflation**
Admin setting overwrites explicit personal choices unexpectedly.

**Profile save / permission refresh conflation**
Changing name alters entitlements or authorization cache.

**Membership revoked / Profile deleted conflation**
Legal and communication history disappears after access removal.

**Profile Activity / Security Audit conflation**
Cosmetic updates and credential events receive identical security semantics.

**059/060 duplicate settings domain**
Personal and Company settings store the same values in competing places.

**059/061 duplicate preference storage**
Notification preferences exist both in Profile and Notification settings.

**059/062 duplicate membership/RBAC logic**
Profile screen becomes a second Portal access-management surface.

**059/075–077 duplicate auth subsystem**
Profile endpoint manages passwords, activation and recovery independently.

No additional screen is required.

These are **identity, profile, preference, membership, authorization, legal-history and authentication-boundary requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT PERSONAL PROFILE, USER PREFERENCE & ACCOUNT-SCOPE ANCHOR**

**Domain directive:**
**User Identity ≠ Portal Membership ≠ Client Contact ≠ PersonalProfile ≠ UserPreferences ≠ OrganizationSettings ≠ AuthenticationCredentials ≠ AuthorizationRoles.**

**Identity directive:**
one stable canonical User identity underlies the account; mutable email, name, title or avatar must never become the primary identity key.

**Membership directive:**
Client Portal access belongs to explicit PortalMembership context. Profile changes never activate, deactivate, move or privilege that membership.

**Contact directive:**
CRM Contact remains a separate business record. Any User↔Contact synchronization must be deliberate, field-specific and source-of-truth governed.

**Profile directive:**
Design 059 owns only fields explicitly permitted for self-service personal presentation/account editing.

**Preference directive:**
UserPreferences contain user-scoped settings only, using organization/platform defaults where overrides are allowed.

**Organization directive:**
Design 060 owns company/organization-level data. Personal Profile edits must never rewrite company identity, organization configuration or shared settings.

**Authorization directive:**
Designs 037/062 remain authoritative for Roles and Portal access. Job title, Profile completion and Portal administration are never substitutes for permissions.

**Authentication directive:**
passwords, login credentials, MFA, sessions, activation and recovery remain in the dedicated authentication subsystem and Designs 075–077. They are never generic Profile fields.

**Email directive:**
login identity, communication email and CRM Contact email remain separately governed even if they currently happen to share the same value.

**Legal-history directive:**
Profile changes must never retroactively rewrite ContractParty snapshots, signer evidence, ApprovalDecision evidence, executed documents or other immutable historical facts.

**Audit directive:**
stable actor identity survives display-name/profile changes so Contract, Approval, Message and Audit histories remain reconstructable.

**Security directive:**
self-service updates use server-derived current User identity, strict field allowlists and mass-assignment protection. The browser can never submit role, organization, verification or entitlement changes through Profile updates.

**Avatar directive:**
avatar/profile imagery reuses Design 030's Asset/FileVersion + processing pipeline and remains presentation data, not identity evidence.

**Multi-membership directive:**
where one User participates in multiple Client organizations, global User/Profile data and membership-specific context remain correctly separated.

**Reliability directive:**
Profile unavailable, save failed, preference failure, avatar-processing failure, membership restricted and authentication verification states remain distinct.

**Responsive directive:**
desktop separates personal Profile, preferences and account/security references; mobile becomes identity summary → personal fields → preferences → Save without mixing company/RBAC administration.

**Overlap directive:**
Designs **030, 036–040, 045, 053, 059–062 and 075–077** must share one canonical User/Identity foundation while preserving strict Profile, Membership, Organization, Authorization and Authentication boundaries.

**Consolidation directive:**
**STANDARDIZE ONE USER-IDENTITY FOUNDATION WITH SEPARATE PERSONALPROFILE + USERPREFERENCES + CLIENTPORTALMEMBERSHIP + CONTACT LINKAGE + ORGANIZATION SETTINGS + AUTH IDENTITY + ROLE ASSIGNMENTS — AND DO NOT USE THE CLIENT PROFILE SCREEN AS A GENERIC MUTATION SURFACE FOR ORGANIZATION DATA, PORTAL ACCESS, LEGAL EVIDENCE, CRM CONTACTS OR SECURITY CREDENTIALS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **59 / 153** |
| **PASS**                                   |                         **59** |
| **STANDARDIZE decisions**                  |                         **57** |
| **Potential implementation-overlap flags** |                         **50** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**59 / 153 = 38.6% audited.**

### Canonical personal-account architecture after Design 059

```text
                     CANONICAL USER
                          │
            ┌─────────────┼─────────────┐
            ↓             ↓             ↓
     PersonalProfile  UserPreferences  AuthIdentity
            │             │             │
            │             │             └── credentials /
            │             │                 MFA / recovery
            │             │
            │      organization defaults
            │             ↑
            │        Design 040/060
            │
            ↓
     ClientPortalMembership
            │
       ┌────┼─────────┐
       ↓    ↓         ↓
     Client Roles   Scope   Access State
      037/062
```

while business/historical identity remains separately linked:

```text
User
 ├── CRM Contact linkage
 ├── Message authorship
 ├── Approval actor
 ├── Contract signer identity
 └── Audit actor

CURRENT PROFILE CHANGES
        ↓
must never rewrite
        ↓
HISTORICAL LEGAL / APPROVAL / AUDIT EVIDENCE
```

# Next Sequential Audit Target

## **Design 060 — Client Organization / Company Settings**

Its frozen identity is already locked.

The next audit must preserve the organization boundary:

> **Client Organization ≠ Portal Organization Context ≠ Organization Profile ≠ Organization Settings ≠ Personal Profile ≠ Billing/Legal Snapshot ≠ Portal Membership ≠ Authorization Policy.**

It will also need to preserve which company fields may be self-service editable versus which legal, billing, contractual, or verified organization facts require their own governed domain workflows.

After Design 060 we continue strictly:

**061 Client Notifications / Notification Preferences → 062 Client Portal Users / Team Access → 063 Client Activity / Account History → 064 Client Notifications Center → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
