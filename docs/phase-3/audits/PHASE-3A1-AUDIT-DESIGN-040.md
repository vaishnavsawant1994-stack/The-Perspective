# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 040 — System / Organization Settings

Design 040 should become the **canonical organization-level configuration workspace for the Team Workspace**.

Its purpose is to manage persistent organization/workspace defaults and operational configuration that influence how the platform behaves across modules, without turning Settings into a dumping ground for Roles, integrations, employee management, secrets, API keys, billing, or personal user preferences.

| Audit field                  | Classification                                                                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                | **040**                                                                                                                                      |
| **Canonical name**           | **System / Organization Settings**                                                                                                           |
| **Product area**             | Administration / Organization Configuration / Platform Settings                                                                              |
| **User surface**             | Team Workspace                                                                                                                               |
| **Screen class**             | Organization Configuration + Administrative Settings Workspace                                                                               |
| **Classification**           | **Unique Anchor — Organization Settings & Configuration Family**                                                                             |
| **Primary purpose**          | Maintain organization-level identity, defaults, regional settings, operational preferences and supported platform configuration              |
| **Primary entity**           | **OrganizationSettings / WorkspaceSettings**                                                                                                 |
| **Core related entities**    | Organization, SettingDefinition, SettingValue, SettingsRevision/History where needed                                                         |
| **Supporting entities**      | OrganizationMembership, Role/Permission, AuditEvent, NotificationPolicy, BrandingAsset, Integration references, Feature/Module configuration |
| **Parent shell**             | `InternalAppShell` — Design 001                                                                                                              |
| **People dependency**        | Design 036                                                                                                                                   |
| **Authorization dependency** | Design 037                                                                                                                                   |
| **Audit dependency**         | Design 039                                                                                                                                   |
| **Asset dependency**         | Design 030                                                                                                                                   |
| **Template family**          | `OrganizationSettingsWorkspaceTemplate`                                                                                                      |
| **Composition**              | `SystemOrganizationSettingsComposition`                                                                                                      |
| **Auth**                     | Required                                                                                                                                     |
| **Authorization**            | Restricted administrative access                                                                                                             |
| **Implementation priority**  | **Critical Platform Administration**                                                                                                         |
| **Reuse level**              | **Platform-wide / Maximum**                                                                                                                  |

The central invariant is:

> **Organization ≠ OrganizationSettings ≠ UserPreferences ≠ Secrets ≠ IntegrationConfiguration ≠ AuthorizationPolicy.**

---

# 1. Functional responsibility

Design 040 should answer:

> **“How is this organization configured, which defaults apply across the workspace, what regional/operational preferences govern the product, who may modify them, and what configuration changed over time?”**

Conceptually:

```text
Organization
    ↓
Organization Settings
    │
    ├── General identity
    ├── Regional defaults
    ├── Workspace preferences
    ├── Operational defaults
    ├── Branding references
    ├── Module-level configuration
    └── Administrative policies
           ↓
     Platform behavior
```

This is configuration.

It is **not** a replacement for the domains whose behavior it influences.

---

# 2. Organization ≠ Settings

The canonical Organization represents the business/workspace itself.

Settings describe configurable behavior for that organization.

Correct:

```text
Organization
     ↓
OrganizationSettings
```

Avoid placing every configuration field directly onto one enormous `Organization` table.

---

# 3. Settings should be scoped

A useful conceptual hierarchy is:

```text
PLATFORM DEFAULT
      ↓
ORGANIZATION SETTING
      ↓
TEAM / MODULE POLICY where supported
      ↓
USER PREFERENCE
```

The exact levels supported in V1 belong to Phase 3D.

The important rule is:

> **Different configuration scopes must not silently overwrite one another.**

---

# 4. Organization setting ≠ user preference

Example:

### Organization setting

```text
Default timezone:
Asia/Kolkata
```

### User preference

```text
My display timezone:
Europe/London
```

Both can legitimately coexist.

Design 040 should manage organization defaults.

Personal UI preferences should remain user-scoped.

---

# 5. Organization locale ≠ browser locale

The user's browser may run:

```text
en-GB
```

while the organization default is:

```text
en-IN
```

and another employee prefers:

```text
en-US
```

Formatting behavior should follow an explicit precedence model.

---

# 6. Regional settings

Design 040 should establish or consume canonical organization defaults for things such as:

```text
timezone
locale
date format
time format
week start
default currency
number formatting
```

only where supported by the frozen product.

These values should be centralized.

Do not let individual modules invent their own timezone/currency defaults.

---

# 7. Default timezone ≠ event timezone

Design 035 already established this distinction.

Organization timezone can be the default for newly created records.

A specific:

* Meeting,
* Event,
* Publication,
* Recording,

may still have its own timezone context.

Changing the organization's timezone must **not reinterpret historical timestamps**.

---

# 8. Changing timezone must not mutate history

Dangerous:

```text
Organization timezone:
Asia/Kolkata
→ America/New_York

Result:
old Meeting timestamps rewritten
```

Incorrect.

Canonical timestamps remain intact.

Only future defaults/display behavior may change according to explicit rules.

---

# 9. Default currency ≠ historical transaction currency

Designs 007 and 020 established financial correctness.

Changing:

```text
Organization default currency:
USD → EUR
```

must not rewrite historical:

* Invoices,
* Payments,
* Contracts,
* Reports.

Existing financial records retain their original currency.

---

# 10. Currency setting is a default, not conversion

`defaultCurrency = USD`

does not mean:

> convert all EUR/GBP records into USD automatically.

Currency conversion remains a separate Finance/Analytics concern.

---

# 11. Branding settings

Organization configuration may include:

* logo,
* workspace name,
* brand mark,
* approved organization imagery,

depending on the frozen UI.

These should reference Design 030's canonical Asset/File infrastructure.

Correct:

```text
OrganizationSettings.logoAssetId
        ↓
Asset/FileVersion
```

No settings-specific upload system.

---

# 12. Branding asset ≠ public asset automatically

A logo displayed inside Team Workspace does not need to become an unrestricted public file.

Asset visibility rules remain canonical.

---

# 13. Organization name ≠ legal company name necessarily

Where the product supports both:

```text
Display Name:
The Perspective

Legal Name:
The Perspective Media Group Pvt. Ltd.
```

these should remain distinguishable.

Do not assume one string serves every:

* UI,
* invoice,
* Contract,
* legal document.

Exact supported fields belong to Phase 3D.

---

# 14. Configuration schema should be explicit

Avoid:

```text
organization.settings = {
  arbitraryJson: ...
}
```

as the entire configuration model.

A safer architecture uses known settings with:

```text
setting key
type
scope
default
validation
sensitivity
permission requirement
```

whether persisted as typed columns, typed groups, or a validated registry.

---

# 15. SettingDefinition / registry

Conceptually:

```text
SettingDefinition
├── key
├── category
├── value type
├── default
├── validation
├── scope
├── sensitivity
├── required permission
└── restart/reload behavior if relevant
```

This prevents uncontrolled configuration sprawl.

---

# 16. Settings categories are presentation

Design 040 may organize settings into sections such as:

```text
General
Regional
Workspace
Notifications
Modules
Branding
Security-related preferences
```

These categories are UI organization.

They should not determine independent storage silos by themselves.

---

# 17. Settings should have ownership boundaries

Some configuration belongs elsewhere even if accessible from Settings navigation.

Examples:

```text
People → Design 036
Roles → Design 037
Integrations → Designs 139–140
API Keys → Design 146
```

Design 040 may link to them.

It should not duplicate their administrative engines.

---

# 18. System Settings ≠ Roles & Permissions

Design 037 owns authorization.

Design 040 can contain:

```text
Default operational configuration
```

but not a second permission matrix.

Correct:

```text
Design 040
→ checks settings.manage

Design 037
→ defines who has settings.manage
```

---

# 19. Settings access is itself permissioned

Potential conceptual permissions:

```text
settings.read
settings.manage
settings.manage_sensitive
```

Exact names belong to Phase 3D.

Important:

> **View settings ≠ change settings.**

---

# 20. Settings categories may require separate authority

Someone allowed to change:

```text
branding
```

may not be authorized to change:

```text
financial defaults
security policy
workspace-wide operational settings
```

Design 037 should support appropriate permission separation.

---

# 21. Organization admin ≠ unrestricted platform admin

Design 040 is primarily organization-scoped.

A user administering Organization A must never alter Organization B.

```text
Organization admin
≠
global platform operator
```

This becomes especially important when Design 149 is audited.

---

# 22. Organization settings ≠ platform-global settings

Later frozen roadmap contains:

**Design 149 — Global Settings / Platform Configuration**

Therefore we already need a strong boundary:

```text
Design 040
Organization-scoped configuration

Design 149
Platform-level/global administration
```

These must not become the same authority layer.

---

# 23. Tenant isolation is critical

Every organization settings query/mutation must be scoped by canonical organization/tenant identity.

Never trust:

```text
organizationId
```

from an arbitrary client request without authorization.

---

# 24. Workspace ≠ Organization automatically

The product may ultimately treat Organization and Workspace as:

* one-to-one,
* one-to-many,
* equivalent in V1.

Phase 3D must decide.

Design 040 should not use those terms inconsistently across backend models.

---

# 25. Settings inheritance needs one rule

If future architecture supports:

```text
Platform default
↓
Organization override
↓
User override
```

the effective-value calculation needs one centralized resolver.

Do not implement different precedence in each module.

---

# 26. Effective setting

Conceptually:

```text
resolveSetting(
  actor,
  organization,
  key
)
```

may determine:

```text
user override
→ otherwise organization value
→ otherwise platform default
```

only for settings that permit such overrides.

---

# 27. Not every setting is overridable

Examples:

Organization security policy may be mandatory.

Users should not override it.

Whereas:

```text
theme
date display
```

may legitimately be personal preferences.

The SettingDefinition should identify allowed scopes.

---

# 28. Settings validation belongs server-side

If week start must be:

```text
MONDAY | SUNDAY | ...
```

or timezone must be a valid IANA identifier,

the backend validates it.

Do not trust frontend dropdown constraints as the only protection.

---

# 29. Setting type safety

Avoid storing every setting as:

```text
"true"
"42"
"Asia/Kolkata"
```

with uncontrolled string parsing.

Typed values or typed validation reduce configuration errors.

---

# 30. Enum changes require migration compatibility

If a setting such as:

```text
weekStart
```

changes supported values later, existing organizations should continue to load safely.

Configuration schema/versioning needs upgrade handling.

---

# 31. Settings revision/history

Material configuration changes should be traceable.

Design 039 should consume events such as:

```text
Organization timezone changed
Default currency changed
Branding changed
Module setting changed
```

Design 040 does not need its own disconnected history engine.

---

# 32. Audit exact before/after safely

For appropriate settings:

```text
timezone
Asia/Kolkata → Europe/London
```

is safe and valuable to Audit.

For sensitive values:

the AuditEvent should store only redacted/safe change information.

---

# 33. Settings ≠ secrets

One of the strongest boundaries:

```text
Configuration
≠
Secret material
```

Examples that should **not** appear as ordinary settings values:

* OAuth access tokens,
* API private keys,
* SMTP passwords,
* webhook signing secrets.

---

# 34. Secrets should use protected secret storage

A setting may reference:

```text
integrationConnectionId
```

but the underlying secret belongs to protected Integration/Secrets infrastructure.

Design 040 should never expose raw credentials in ordinary JSON settings responses.

---

# 35. Integration Settings ≠ Integration Center

Later:

**139 — Integration Center / Connected Services**
**140 — Integration Detail / Connection Health**

Design 040 may expose broad preferences such as:

> Default integration behavior

where appropriate.

But:

```text
Connect Google
Rotate OAuth token
Inspect connection health
```

belongs to 139–140.

---

# 36. Notification defaults

Organization-level notification defaults may legitimately live partly in Settings.

Example:

```text
default notification behavior
```

But actual:

* individual notification inbox,
* delivery events,
* user-specific preferences,

remain separate concerns.

Design 061/080 and later notification systems should not be duplicated.

---

# 37. Organization defaults ≠ user notification preferences

Example:

```text
Organization:
Enable assignment notifications by default
```

vs:

```text
Emma:
Mute low-priority assignment notifications
```

These can coexist where policy permits.

The override model must be explicit.

---

# 38. Mandatory notifications

Some security or administrative notifications may not be user-disableable.

Example:

```text
Critical security change
```

Policy should distinguish:

```text
mandatory
default-enabled
user-configurable
```

rather than one Boolean.

---

# 39. Module defaults

Settings may provide defaults such as:

* default Project behavior,
* default working week,
* default scheduling assumptions,
* default publication timezone,

where genuinely part of frozen product behavior.

But the source domain should still validate/use them.

Settings does not become Project/Publishing truth.

---

# 40. Default ≠ existing-record mutation

Changing:

```text
default Project priority
```

should affect future Projects.

It should not silently rewrite all existing Projects.

Permanent rule:

> **A default influences future creation unless an explicit migration/bulk-update command says otherwise.**

---

# 41. Default workflow ≠ active workflow instance

If Settings chooses a default Project workflow template:

```text
defaultWorkflowTemplateId
```

existing Projects retain their captured Workflow version.

No hidden mutation.

---

# 42. Default publication settings ≠ Publication state

Settings can provide defaults.

Publishing Design 031 remains authoritative for each Publication.

Never set:

```text
autoPublished = true
```

purely because a Settings toggle changed without controlled domain rules.

---

# 43. Dangerous automation toggles

Any organization-wide setting that can cause external actions should be high impact.

Examples conceptually:

```text
automatic publishing
automatic distribution
automatic email sending
```

If such features exist, they require:

* explicit permissions,
* clear impact,
* audit,
* domain-specific validation.

Do not treat them as harmless UI toggles.

---

# 44. Feature availability ≠ user authorization

A module can be enabled for the organization while a particular user lacks permission to access it.

Correct:

```text
Module Enabled
+
User Authorized
=
User can access
```

Do not derive user permissions solely from feature/module settings.

---

# 45. Feature flag ≠ permanent product setting necessarily

Internal rollout/experimental feature flags are often platform-operator concerns.

They should not automatically appear in organization settings.

Design 149/platform configuration may own some of those later.

---

# 46. Module enable/disable semantics

If an organization-level module can be disabled:

the system must define whether that means:

* hide UI,
* block new records,
* preserve historical records,
* pause jobs.

Never equate:

```text
module disabled
```

with:

```text
delete module data
```

---

# 47. Disabling module ≠ deleting data

Example:

```text
Podcast module disabled
```

must not delete PodcastEpisodes.

Historical references, reports, and AuditEvents remain intact.

---

# 48. Settings affecting background jobs

Some settings may influence:

* reminders,
* scheduled publishing,
* reporting delivery,
* retention.

Changes must propagate server-side.

The browser cannot be the runtime source of configuration truth.

---

# 49. Configuration cache

Because settings are read frequently, caching is reasonable.

But:

```text
organizationId
+
setting version
```

must be part of safe cache behavior.

Never serve Organization A's settings to Organization B.

---

# 50. Settings invalidation

After an administrator changes a critical setting:

the effective configuration should update promptly.

Do not leave workers or APIs on stale settings indefinitely.

A versioned cache/invalidation strategy is required.

---

# 51. Configuration version

Conceptually, OrganizationSettings may maintain:

```text
revision
updatedAt
```

to support:

* concurrency,
* cache invalidation,
* audit correlation.

---

# 52. Concurrency

Example:

```text
Admin A changes timezone.
Admin B changes default currency.
```

A stale full-form save must not erase the other administrator's change.

This argues strongly against a giant:

```text
PUT /settings
{ all settings }
```

without revision-aware merge semantics.

---

# 53. Setting-group commands

Prefer targeted operations such as:

```text
updateRegionalSettings()
updateWorkspacePreferences()
updateBrandingSettings()
```

or validated setting change sets.

This reduces accidental cross-category overwrites.

---

# 54. High-risk settings require stronger confirmation

Examples may include:

* organization identity/legal setting,
* domain/URL configuration,
* sensitive security policy,
* destructive retention policy,
* disabling critical modules.

If supported, the UI should communicate impact before applying.

No redesign is required—this is command semantics.

---

# 55. Save ≠ applied everywhere instantly if jobs are involved

Some setting changes may require propagation.

Potential state:

```text
Saved
Propagation pending
Applied
```

where technically necessary.

Do not falsely show:

> Applied

before dependent services have acknowledged the update.

---

# 56. Most settings should apply synchronously where practical

Do not over-engineer every toggle into a background job.

Simple configuration changes should remain straightforward.

Use propagation state only for settings with real distributed impact.

---

# 57. Failed propagation ≠ failed persistence automatically

Example:

```text
Settings saved in canonical DB
Worker cache refresh failed
```

The workspace should distinguish:

* canonical save success,
* downstream propagation issue.

Exact behavior Phase 3D.

---

# 58. Partial failure

Example:

```text
General settings       ✓
Regional settings      ✓
Branding Asset service ✕
Notification defaults  ✓
```

Design 040 remains usable.

Only Branding displays degraded state.

---

# 59. Unknown setting value ≠ default

If Settings service cannot load the organization's timezone:

do not silently show:

```text
UTC
```

and allow Save.

That could overwrite the real value.

Correct state:

> Setting unavailable.

---

# 60. Default ≠ unavailable

The UI must distinguish:

```text
Using platform default
```

from:

```text
Could not load setting
```

This is critical for safe administration.

---

# 61. Restricted ≠ unavailable

A user without permission to view sensitive configuration should see:

> Restricted

not:

> No configuration exists.

---

# 62. Unsaved changes

If multiple setting fields are edited:

Design 040 needs clear dirty-state behavior.

Navigation away should not silently discard high-value configuration without warning where practical.

---

# 63. Reset to default

If supported:

```text
resetSettingToDefault()
```

should mean:

> remove organization override / restore canonical default behavior

not:

> set an arbitrary hard-coded frontend value.

---

# 64. “Factory reset” should not be implied

A reset action for one setting/category must not become a destructive entire-workspace reset.

No generic “Reset Organization” unless explicitly frozen and heavily controlled.

---

# 65. Organization deletion is out of scope unless frozen

Design 040 should not casually introduce:

```text
Delete entire organization
```

as a normal Settings operation.

That is a high-risk lifecycle/admin concern and would require explicit frozen scope.

No new feature is added during this audit.

---

# 66. Workspace branding vs public-site branding

Internal workspace logo/name may differ from:

* Magazine/public website branding,
* Client Portal branding,
* publication branding.

Design 040 should not assume one asset automatically controls all surfaces unless the product explicitly defines that inheritance.

---

# 67. Client Portal settings remain separate context

Design 002 and Client Portal screens represent an external-facing product shell.

Organization Settings can provide shared defaults where intended.

But internal Team configuration must never expose internal controls directly to Client Portal members.

---

# 68. Public site configuration ≠ internal settings automatically

The public editorial website may consume selected organization/brand data.

That should occur through explicit safe configuration/projection.

Internal administrative settings must not be serialized wholesale into public APIs.

---

# 69. Data sensitivity classification

Settings should conceptually support categories such as:

```text
public-safe
internal
admin-only
secret-reference
```

even if the exact implementation differs.

This prevents accidental exposure.

---

# 70. API response shaping

A low-privilege user calling:

```text
GET /settings
```

should not automatically receive every organization configuration field.

Backend projections must honor field/category permissions.

---

# 71. Settings reads can also be sensitive

Even read-only information such as:

* enabled integrations,
* security configuration,
* email domain policy,

can be useful to attackers.

Therefore `settings.read` itself should be scoped appropriately.

---

# 72. Audit events

Design 040 should emit material events such as:

```text
OrganizationSettingsUpdated
RegionalSettingsUpdated
BrandingSettingsUpdated
ModuleConfigurationChanged
NotificationPolicyChanged
```

with safe before/after information.

Design 039 remains the canonical investigation surface.

---

# 73. Audit actor

Every material configuration change should record:

```text
actor
organization
setting/category
old/new safe value
timestamp
outcome
```

where appropriate.

System-initiated migrations may also appear as system actors.

---

# 74. Settings migration ≠ administrator action

If software deployment migrates:

```text
setting schema v2 → v3
```

that should be distinguishable from:

> Emma changed the setting manually.

The actor/source context matters.

---

# 75. Environment configuration ≠ Organization Settings

Infrastructure values such as:

* database URL,
* Redis URL,
* deployment secrets,
* server ports,

are deployment/environment configuration.

They should never be editable from Design 040.

---

# 76. Organization Settings ≠ environment variables

This boundary prevents dangerous architecture such as:

```text
DATABASE_URL
STRIPE_SECRET_KEY
NEXTAUTH_SECRET
```

stored in an admin-settings table.

Those belong outside normal application configuration.

---

# 77. Billing/account subscription settings

If subscription/account billing exists, it should have a deliberate Billing/account-management domain.

Design 040 should not opportunistically absorb payment-provider subscription administration unless explicitly frozen.

---

# 78. API Keys

Design 146 later owns:

**API Keys / Webhooks / Developer Access**

Design 040 should not expose raw API-key management.

It may link to Developer settings.

No duplicate credential store.

---

# 79. Integration configuration

Designs 139–140 own connected services.

Design 040 may expose high-level organization defaults that reference integrations.

Example:

```text
default sending account:
connection_123
```

But connection authorization/health stays in Integration domain.

---

# 80. Notification administration

Design 143 later owns **System Notifications / Alert Rules Management**.

Design 040 should not become the alert-rule builder.

At most, it can maintain organization-level notification preferences/defaults already frozen in this screen.

---

# 81. Relationship to Design 145

Later:

**Design 145 — Workspace / Organization Administration**

This is a major overlap checkpoint.

Expected:

```text
Canonical Organization Domain
        │
        ├── Design 040
        │   System / Organization Settings
        │
        └── Design 145
            Workspace / Organization Administration
```

We do not merge them now.

But both must share:

* Organization,
* memberships where relevant,
* settings/configuration,
* organization lifecycle foundations.

---

# 82. Likely boundary with Design 145

Current architectural expectation:

### Design 040

Configuration/preferences.

### Design 145

Broader workspace/organization administration.

Exact consolidation waits until Design 145's sequential audit.

**Strong implementation-overlap flag only.**

---

# 83. Relationship to Design 149

Later:

**Design 149 — Global Settings / Platform Configuration**

This must remain a separate scope:

```text
040
Organization-scoped

149
Platform/global operator-scoped
```

A Team Workspace admin must never gain global SaaS/platform authority.

---

# 84. Organization admin ≠ platform super-admin

This is a permanent security boundary.

```text
organization.settings.manage
```

must not imply:

```text
platform.settings.manage
```

even if both screens use similar UI components.

---

# 85. Relationship to Design 036

Design 036 owns:

* members,
* Teams,
* Departments,
* manager relationships.

Design 040 can choose defaults involving those entities where appropriate.

It should not duplicate Team/People administration.

---

# 86. Relationship to Design 037

Design 037 determines who can:

* view settings,
* edit settings,
* manage sensitive settings.

Design 040 consumes that authorization.

No settings-local “Admin” Boolean.

---

# 87. Relationship to Design 039

Every high-value setting mutation emits AuditEvents.

Design 040 should not maintain independent configuration-history records as the only audit mechanism.

---

# 88. Relationship to Design 030

Logo/brand/supporting images use Asset/FileVersion infrastructure.

Do not store base64/logo binary directly in Settings rows.

---

# 89. Relationship to Design 035

Timezone/week-start defaults can influence Calendar display/creation.

Calendar owns actual scheduled records.

Changing Settings never rewrites historical Meeting/Publication times.

---

# 90. Relationship to Finance

Default currency/financial display preferences can influence future/default behavior.

Invoices and Payments remain immutable historical financial records with their own currency.

---

# 91. Relationship to Reporting / Analytics

Organization preferences may influence:

* reporting timezone,
* default date ranges,
* display currency.

But Reports retain exact snapshot/reporting semantics from Design 033.

Analytics retains canonical metric semantics from Design 038.

---

# 92. Reusable settings components

Design 040 establishes/formalizes:

`SettingsNavigation`
`SettingsSection`
`SettingsGroup`
`SettingsField`
`SettingsToggle`
`SettingsSelect`
`SettingsTextInput`
`SettingsTimezoneSelector`
`SettingsLocaleSelector`
`SettingsCurrencySelector`
`SettingsAssetPicker`
`SettingsSaveBar`
`SettingsDirtyState`
`SettingsValidationMessage`
`SettingsPermissionNotice`
`SettingsPropagationState` where needed
`SensitiveSettingWarning`

These components should later support Designs 145/149 where appropriate.

---

# 93. Settings navigation ≠ new routes yet

Phase 3A.1 does **not** decide whether categories use:

```text
/settings/general
/settings/regional
```

or tabs/sections within one route.

Exact routing belongs to Phase 3B.

We are auditing responsibilities, not final URLs.

---

# 94. Responsive — Desktop

Desktop should preserve a clear configuration hierarchy:

```text
Settings Header
↓
Settings Navigation
+
Settings Content
    ├── section title
    ├── descriptions
    ├── controls
    └── save state
```

Dense configuration should remain readable rather than becoming one enormous form.

---

# 95. Responsive — Tablet

Following Design 152:

* settings navigation can collapse into a drawer/dropdown,
* content stays single/dual-column where appropriate,
* Save action remains clear,
* complex selectors use sheets/dialogs,
* warnings stay adjacent to relevant controls.

---

# 96. Responsive — Mobile

Following Design 151:

```text
Settings
↓
Category List
↓
Open Category
↓
Grouped Controls
↓
Validation / Explanation
↓
Save
```

Avoid shrinking desktop side-navigation beside a narrow form.

---

# 97. Mobile dangerous changes

High-impact configuration changes should clearly expose:

* setting name,
* current value,
* new value,
* impact where material.

No tiny ambiguous toggles for destructive/global behavior.

---

# 98. Accessibility

Settings controls require:

* explicit labels,
* descriptions,
* validation association,
* keyboard support,
* non-color error states.

Toggle state cannot rely only on visual color.

---

# 99. State coverage

Design 040 inherits Design 150 plus settings-specific states:

```text
Settings Loading
Settings Loaded

Saving
Saved
Save Failed

Unsaved Changes
Validation Error

Using Platform Default
Organization Override Active

Propagation Pending
Propagation Failed

Setting Restricted
Setting Unavailable
Dependent Service Unavailable

Concurrent Update
Stale Settings Revision

Asset Upload/Selection Failed

Permission Restricted
Partial Service Failure
```

These are not one persisted Settings lifecycle enum.

---

# 100. Empty Settings page is almost always suspicious

Unlike a content list:

> No Settings

is rarely a legitimate organization state.

If the registry/configuration cannot load:

show an error/degraded state.

Do not render an empty panel.

---

# 101. Setting unavailable ≠ platform default

Critical:

```text
could not fetch organization's timezone
```

must not become:

```text
timezone = UTC
```

in the form.

Otherwise pressing Save could destroy valid configuration.

---

# 102. Concurrent update

Example:

```text
Admin A:
changes currency

Admin B:
changes timezone
```

The backend should support revision-safe updates.

Ideally independent setting groups do not overwrite one another.

---

# 103. Stale form protection

If settings changed since the current user opened the page:

the UI should not blindly replace newer values with stale data.

A revision/version check is appropriate.

---

# 104. Backend query model

A useful composed read model:

```text
OrganizationSettingsView
├── organization identity
├── effective settings
├── organization overrides
├── platform defaults
├── validation metadata
├── permission visibility
├── dependent-service state
└── current revision
```

This is a configuration read model.

---

# 105. Do not expose one giant generic PATCH

Dangerous:

```text
PATCH /organization
{
  name,
  timezone,
  currency,
  roles,
  integrations,
  secretKey,
  notificationRules,
  members,
  modules
}
```

This mixes unrelated security domains.

Prefer explicit commands/change groups such as:

```text
updateOrganizationIdentity()
updateRegionalSettings()
updateWorkspacePreferences()
updateBrandingSettings()
updateModuleDefaults()
updateNotificationDefaults()
```

with permission checks.

---

# 106. Backend architecture

```text
System / Organization Settings UI
              ↓
OrganizationSettingsQueryService
              ↓
Tenant + Permission Scope
              ↓
Organization Configuration Domain
              │
              ├── Organization
              ├── Setting Registry
              ├── Organization Overrides
              ├── Effective Setting Resolver
              └── Configuration Revision
              │
              ├── Authorization Service
              ├── Asset/File Service
              ├── Notification Service
              ├── Integration references
              ├── Module domain services
              ├── Cache / Invalidation
              └── Audit Service
```

---

# 107. Backend requirements

| Requirement                             | Status                    |
| --------------------------------------- | ------------------------- |
| Authentication                          | **Critical**              |
| Organization/tenant isolation           | **Critical**              |
| Settings-specific RBAC                  | **Critical**              |
| Canonical Organization entity           | **Critical**              |
| OrganizationSettings/config model       | **Critical**              |
| Typed Setting Registry                  | **Critical**              |
| Setting validation                      | **Critical**              |
| Scope/inheritance semantics             | **Critical**              |
| Organization vs user setting separation | **Critical**              |
| Platform-default resolution             | **Required**              |
| Regional settings                       | **Required**              |
| Timezone-safe semantics                 | **Critical**              |
| Currency-default safety                 | **Critical**              |
| Historical-record protection            | **Critical**              |
| Branding via Asset/File                 | **Required**              |
| Sensitive setting classification        | **Critical**              |
| Secrets excluded from normal settings   | **Critical**              |
| Integration-reference abstraction       | **Required**              |
| Settings cache/versioning               | **Required**              |
| Cache invalidation                      | **Critical**              |
| Revision/concurrency protection         | **Critical**              |
| Server-authoritative mutations          | **Critical**              |
| Safe defaults                           | **Critical**              |
| Partial-service failure support         | **Required**              |
| Audit-event generation                  | **Critical**              |
| Design 039 integration                  | **Critical**              |
| Design 145 reuse                        | **Critical architecture** |
| Design 149 scope separation             | **Critical**              |

---

# 108. Canonical Settings categories

Without inventing additional frozen screens, the architecture should be capable of cleanly representing supported groups such as:

### Organization

* display identity,
* legal/business identity where actually required.

### Regional

* timezone,
* locale,
* date/time,
* currency defaults.

### Workspace

* operational/default preferences.

### Branding

* approved organization assets.

### Notifications

* organization-level defaults/policy where supported.

### Module Defaults

* only configuration legitimately shared across modules.

The exact field inventory is deferred to Phase 3D against the frozen visual.

---

# 109. Main implementation risks

Design 040 exposes several significant architectural risks:

**Organization/Settings conflation**
Every new configuration field is added directly to one giant Organization row.

**Organization/User preference conflation**
Changing personal display preferences changes everyone.

**Organization/Platform settings conflation**
Workspace administrators gain SaaS-global authority.

**Settings/Secrets conflation**
OAuth/API credentials stored in ordinary Settings JSON.

**Settings/Integration conflation**
Design 040 duplicates Designs 139–140.

**Settings/RBAC conflation**
A second permissions system appears inside Settings.

**Settings/People conflation**
Employee/Team administration duplicated from Design 036.

**Default/existing-record conflation**
Changing a default silently rewrites historical Projects, invoices or Publications.

**Timezone/history mutation**
Changing organization timezone corrupts historical scheduled data.

**Currency/history mutation**
Changing default currency rewrites old financial records.

**Feature-disable/delete conflation**
Turning off a module deletes data.

**Unavailable/default conflation**
Backend error rendered as default value and accidentally saved.

**Giant settings JSON**
No type safety, validation, discoverability or permission separation.

**Mega-PATCH concurrency**
One admin's save overwrites another's unrelated change.

**Stale-cache configuration**
Workers continue using revoked/changed settings.

**Raw public settings exposure**
Internal admin configuration leaks through public APIs.

**Uncontrolled sensitive fields**
Every settings reader receives security-related configuration.

**Missing audit trail**
High-impact settings change without actor/history.

**040/145 duplicate organization models**
Later Workspace Administration builds another organization backend.

**040/149 scope collapse**
Organization Settings and global platform configuration use the same authority.

None requires an additional design.

They require strict configuration-domain boundaries.

# Design 040 Audit Verdict

## **PASS — ORGANIZATION CONFIGURATION & SETTINGS ANCHOR**

**Domain directive:** **Organization ≠ OrganizationSettings ≠ UserPreferences ≠ Secrets ≠ Integrations ≠ AuthorizationPolicy.**

**Scope directive:** organization configuration, personal preferences and platform-global configuration remain separate scopes with one explicit precedence/inheritance model where applicable.

**Default directive:** changing organization defaults affects future/default behavior; it never silently rewrites historical Meetings, Projects, financial records, Publications or Reports.

**Timezone directive:** organization timezone is a default/display context, not permission to reinterpret existing timestamps.

**Currency directive:** default currency never mutates historical Invoice/Payment currency and never implies automatic currency conversion.

**Schema directive:** settings use a governed typed registry/validated model rather than uncontrolled miscellaneous JSON.

**Authorization directive:** read, manage and sensitive-settings authority are independently enforced through Design 037; organization administrators never automatically become global platform administrators.

**Secrets directive:** OAuth credentials, passwords, API secrets and signing secrets are explicitly excluded from ordinary Settings storage and responses.

**Asset directive:** logos and branding media reuse Design 030's canonical Asset/FileVersion infrastructure.

**Integration directive:** connected-service authorization and health remain Designs 139–140 responsibilities; Design 040 may only reference integrations/defaults where needed.

**People directive:** Team, Department and member administration remain Design 036's domain.

**Audit directive:** material configuration mutations emit canonical Design 039 AuditEvents with safe before/after context.

**Concurrency directive:** settings use revision-aware and category-safe commands so simultaneous administrative changes do not overwrite unrelated configuration.

**Failure directive:** unavailable configuration, inherited platform default, explicit organization override and restricted configuration remain distinct states.

**Security directive:** settings APIs return only fields/categories authorized for the actor; sensitive internal configuration is never exposed merely because the user can access the Settings route.

**Responsive directive:** desktop uses structured category navigation and grouped configuration; tablet/mobile progressively collapse navigation without sacrificing labels, warnings or safe Save behavior.

**Overlap directive:** Designs **040, 139–140, 145, 146 and 149** must share clear configuration/integration/organization boundaries while avoiding duplicate settings stores and privilege models.

**Consolidation directive:** **STANDARDIZE ONE ORGANIZATION-SCOPED SETTINGS REGISTRY + TYPED VALUE + DEFAULT/OVERRIDE + VALIDATION + REVISION + AUTHORIZATION + AUDIT INFRASTRUCTURE — DO NOT BUILD SEPARATE SETTINGS SYSTEMS FOR PROJECTS, FINANCE, PUBLISHING, PEOPLE, INTEGRATIONS OR LATER ADMIN SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **40 / 153** |
| **PASS**                                   |                         **40** |
| **STANDARDIZE decisions**                  |                         **38** |
| **Potential implementation-overlap flags** |                         **31** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**40 / 153 = 26.1% audited.**

### Administrative architecture after Design 040

```text
                    ORGANIZATION
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     People 036     Authorization 037  Settings 040
          │              │              │
          │              │              ├── General
          │              │              ├── Regional
          │              │              ├── Workspace Defaults
          │              │              ├── Branding
          │              │              └── Module Preferences
          │              │
          └──────────────┴───────┬──────┘
                                 ↓
                           Audit Events 039
```

The shared platform foundation now contains:

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
040 → Organization Settings / Configuration
```

## Next Sequential Audit Target

We should now move to **Design 041**, but unlike Designs 036–040, its exact frozen identity has **not been established in the current verified sequence**.

Therefore the next step is strictly:

> **Retrieve/confirm the exact frozen identity of Design 041 from the approved 153-design inventory before auditing it.**

We should **not infer Design 041** from System / Organization Settings or assume it is another Settings, Client Portal, Profile, Integration, Security, public-site, or operational screen.

Once its exact frozen identity is confirmed, we continue with the same contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

