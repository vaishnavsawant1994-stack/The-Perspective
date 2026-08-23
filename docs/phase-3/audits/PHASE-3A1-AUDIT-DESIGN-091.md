# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 091 — Outreach Templates Library

Design 091 should become the **canonical reusable Outreach content/template library** feeding the Sequence and Message-generation architecture already established by Designs 012–013 and reconciled in Design 090.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **OutreachTemplate ≠ TemplateVersion ≠ Sequence ≠ SequenceVersion ≠ Message ≠ Campaign ≠ Enrollment ≠ PersonalizationVariable ≠ GeneratedContent/RenderedMessage.**

The central implementation rule is:

> **An OutreachTemplate is a reusable authored content identity. A TemplateVersion is an exact immutable revision of that content once published or referenced by execution history. Sequences and Campaign execution must reference exact versions, while generated/rendered Messages become their own historical communication records. Editing, archiving, deleting, previewing, or re-rendering a Template must never rewrite an already-issued SequenceVersion or Message.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **091**                                                                                                         |
| **Canonical name**                    | **Outreach Templates Library**                                                                                  |
| **Product area**                      | Team Workspace / Outreach / Content Templates                                                                   |
| **User surface**                      | **Authenticated Team Workspace**                                                                                |
| **Screen class**                      | Reusable Content Library / Versioned Template Management Workspace                                              |
| **Classification**                    | **Canonical Outreach Template, Version & Personalization Content Anchor**                                       |
| **Primary purpose**                   | Manage reusable outreach content without conflating authored templates with Sequence execution or sent Messages |
| **Primary entity**                    | **OutreachTemplate**                                                                                            |
| **Version entity**                    | **TemplateVersion**                                                                                             |
| **Variable definition**               | **PersonalizationVariable / TemplateVariableDefinition**                                                        |
| **Preview/render result**             | **GeneratedContent / RenderedMessage**                                                                          |
| **Sequence dependency**               | Design 013                                                                                                      |
| **Campaign dependency**               | Designs 012 / 090                                                                                               |
| **Message dependency**                | Design 014 / Design 090                                                                                         |
| **Enrollment dependency**             | Design 090                                                                                                      |
| **Sending infrastructure dependency** | Design 092 later                                                                                                |
| **Primary library query service**     | `OutreachTemplateLibraryQueryService`                                                                           |
| **Template mutation service**         | `OutreachTemplateService`                                                                                       |
| **Version service**                   | `TemplateVersionService`                                                                                        |
| **Rendering service**                 | `OutreachTemplateRenderingService`                                                                              |
| **Variable registry**                 | `PersonalizationVariableRegistry`                                                                               |
| **Parent shell**                      | `InternalAppShell` — Design 001                                                                                 |
| **Auth**                              | Required                                                                                                        |
| **Authorization**                     | Active OrganizationMembership + template read/create/edit/publish/archive/use permissions                       |
| **Implementation priority**           | **Critical Message Reproducibility / Content Safety / Personalization Integrity**                               |
| **Reuse level**                       | **Extremely High across Designs 012–014 and 090–093**                                                           |

Design 091 should answer:

> **“Which reusable outreach templates exist, which exact versions are available or historically referenced, what variables are permitted, and which template revision can safely be used by a Sequence without changing already-generated Messages?”**

Canonical structure:

```text
OutreachTemplate
      │
      ├── TemplateVersion v1
      ├── TemplateVersion v2
      └── TemplateVersion v3
                │
                ↓ exact reference
         SequenceVersion
                │
                ↓
           Enrollment
                │
                ↓
      Message Generation Context
                │
       ┌────────┴────────┐
       ↓                 ↓
TemplateVersion     Personalization Data
       │                 │
       └────────┬────────┘
                ↓
        Rendered Content
                ↓
             Message
```

---

# 2. Reuse

## Design 013 remains the canonical Sequence engine

Design 091 does not create an alternate sequence system.

Correct:

```text
OutreachTemplate
      ↓
TemplateVersion
      ↓
SequenceVersion step references
      ↓
Design 013 execution semantics
```

A template provides reusable content.

A Sequence determines:

* step order,
* timing,
* channel/action behavior,
* versioned execution structure.

These are separate concerns.

---

## Template ≠ Sequence

Permanent.

A template might be reused by:

* several SequenceVersions,
* several Campaigns indirectly through those sequences.

It is not the campaign workflow itself.

---

## TemplateVersion ≠ SequenceVersion

Permanent.

Example:

```text
Template T1
├── TemplateVersion T1-v1
└── TemplateVersion T1-v2

Sequence S1
├── SequenceVersion S1-v3
│      Step 1 → T1-v1
└── SequenceVersion S1-v4
       Step 1 → T1-v2
```

This preserves independent histories.

---

## Design 012 remains Campaign authority

Campaign may ultimately execute content referenced through its pinned SequenceVersion.

Campaign should not own copied editable templates.

---

## Design 090 remains execution-history authority

Campaign 360 established:

```text
Campaign
→ CampaignVersion
→ SequenceVersion
→ Enrollment
→ Message
```

Design 091 must feed that architecture without changing its historical invariants.

---

## Design 014 remains Message/Conversation authority

A rendered/sent Message remains a canonical Message.

Do not create:

```text
SentTemplate
CampaignTemplateMessage
RenderedTemplateRecord
```

as alternate communication truth.

---

## Template Library ≠ Message Library

Design 091 is about reusable source content.

Design 014/090 are about concrete communication instances.

---

## Reuse one rendering engine

Templates, Sequence preview, Campaign preview, and actual Message generation should use the **same canonical variable/rendering semantics**.

Do not create:

```text
templatePreviewRenderer
campaignRenderer
sequenceRenderer
sendRenderer
```

with subtly different placeholder behavior.

Presentation wrappers may differ.

Rendering semantics must not.

---

# 3. Entities

## OutreachTemplate

`OutreachTemplate` is the stable reusable content identity.

Conceptually:

```text
OutreachTemplate
├── id
├── organizationId
├── name
├── content type/channel applicability
├── lifecycle
├── current draft/current version reference
├── owner
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## OutreachTemplate ≠ TemplateVersion

The Template is the stable identity.

Versions are revisions of its content/configuration.

Example:

```text
Template T-100
├── v1
├── v2
├── v3
└── v4
```

---

## Editing Template ≠ mutating published TemplateVersion

Critical.

Correct:

```text
Published v3
      ↓
user edits
      ↓
Draft / new v4
```

Not:

```text
UPDATE TemplateVersion v3
```

when v3 has already been referenced by execution/history.

---

## Immutable once historically referenced

At minimum, a TemplateVersion becomes immutable once it has been:

* published,
* referenced by a published SequenceVersion,
* used for generated/sent Message history,

according to the canonical lifecycle policy.

---

## Draft ≠ published version

A working draft can be mutable under revision control.

A historical execution version cannot.

---

## Draft edits must not affect active SequenceVersion

Permanent.

Example:

```text
SequenceVersion S3
→ TemplateVersion T2-v5

Template editor creates T2-v6 draft.

S3 remains on T2-v5.
```

---

## TemplateVersion

Conceptually:

```text
TemplateVersion
├── id
├── templateId
├── version/revision
├── subject where applicable
├── body/content
├── content format
├── variable references
├── channel applicability
├── createdBy
├── createdAt
├── publishedAt
└── immutable content hash
```

---

## TemplateVersion should preserve content integrity

A hash/fingerprint can help prove:

> This exact content was the referenced version.

Useful for:

* reproducibility,
* debugging,
* legal/compliance history.

---

## TemplateVersion ≠ Message

Permanent.

Template:

> reusable content source.

Message:

> concrete communication generated for a specific execution/recipient.

---

## Message should preserve exact generated content

Example:

TemplateVersion:

```text
Hi {{first_name}},

I enjoyed your recent work at {{company_name}}.
```

Rendered for Lead A:

```text
Hi Sarah,

I enjoyed your recent work at Globex.
```

The resulting Message must preserve that exact generated content.

Later:

* Contact renamed,
* Company renamed,
* template edited,

must not rewrite it.

---

## GeneratedContent / RenderedMessage

A render result is derived from:

```text
TemplateVersion
+
PersonalizationContext
+
rendering engine version/policy
```

Conceptually:

```text
RenderedContent
├── templateVersionId
├── renderingContext
├── rendered subject
├── rendered body
├── variable resolution results
├── warnings/errors
└── renderedAt
```

---

## RenderedContent ≠ canonical TemplateVersion

Permanent.

Previewing:

> Hi Sarah

does not modify:

> Hi {{first_name}}

inside the TemplateVersion.

---

## RenderedContent ≠ Message automatically

A preview can exist without sending or creating a canonical outbound Message.

Actual execution generates a Message under Campaign/Enrollment context.

---

## Preview ≠ send

Critical.

A user previewing a template must not:

* create Message delivery state,
* consume Campaign sequence progression,
* create DeliveryAttempt,
* update Lead “last contacted”.

---

## PersonalizationVariable

A PersonalizationVariable is a typed allowed input definition.

Conceptually:

```text
PersonalizationVariable
├── key
├── label
├── data type
├── source resolver
├── source domain
├── null policy
├── formatting rules
├── required permissions
├── required/optional state
└── schema version
```

---

## PersonalizationVariable ≠ arbitrary expression

Critical.

Allow:

```text
{{first_name}}
{{company_name}}
{{job_title}}
```

through a controlled registry.

Do not allow users to inject:

```text
{{ arbitrary_sql(...) }}
{{ eval(...) }}
{{ fetch("http://...") }}
```

or unrestricted code.

---

## Variable key ≠ database field name

The public template variable should resolve through an abstraction.

Example:

```text
{{company_name}}
```

does not need to expose:

```text
companies.legal_name
```

directly.

This protects schema evolution.

---

## Variable resolution should be typed

Examples:

### String

```text
first_name
```

### Date

```text
meeting_date
```

### Money

if ever supported, should use currency-aware formatting.

### URL

must be escaped/validated appropriately.

---

## Variable resolver ≠ permission bypass

A Template using:

```text
{{private_phone}}
```

must not expose a value simply because the variable exists.

Resolver authorization remains mandatory.

---

## Required variable ≠ optional variable

Permanent.

If required data is missing:

render must fail or enter explicit review state.

Do not silently send:

```text
Hello {{first_name}}
```

---

## Missing optional variable

Optional variables require a defined fallback/removal policy.

Do not improvise inconsistent frontend substitutions.

---

## Fallback content should be explicit

If supported:

```text
{{first_name | fallback:"there"}}
```

or a controlled equivalent can be represented through the safe rendering model.

Do not create hidden business fallback rules in the sending worker.

---

## Variable value ≠ source truth

Personalization context consumes current/snapshotted data.

It does not edit Contact/Lead/Company.

---

## Lead/Contact/Company changes after rendering

Permanent invariant:

```text
Message rendered at T1
↓
CRM data changes at T2
↓
historical Message remains exactly as rendered at T1
```

---

## Personalization context should preserve exact resolved values

For execution/debugging, Message-generation history should be able to explain:

```text
first_name → Sarah
company_name → Globex
job_title → CMO
```

without requiring current CRM state to reconstruct it.

This can be persisted as safe generation evidence associated with Message/render context.

---

## Safe snapshot ≠ duplicate CRM entity

Do not copy entire Contact/Company/Lead records.

Persist only required render-time values/evidence.

---

## Channel-specific template content

If Design 091 supports multiple channels, content format/channel applicability should remain explicit.

An Email template and another-channel template should not be assumed interchangeable.

Do not invent channel types beyond frozen product support.

---

## Subject ≠ body

For channels where a subject exists, validate independently.

---

## Rich-text/HTML source ≠ rendered executable HTML

If rich content is supported:

* sanitize,
* permit only safe tags/attributes,
* normalize links,
* prevent script/event-handler injection.

---

## Template assets ≠ arbitrary external resource execution

If assets are allowed later, they should reference canonical Asset/File infrastructure.

Do not embed uncontrolled executable resources.

---

## Template lifecycle

Conceptually:

```text
Draft
Published / Available
Archived
```

where appropriate.

Keep this separate from TemplateVersion state.

---

## Archived Template ≠ deleted historical TemplateVersion

Permanent.

---

## Deleted Template ≠ deleted Messages

Absolute.

---

## Deleted Template ≠ deleted SequenceVersions

Absolute.

If destructive deletion is allowed at all, referenced history must remain through retained versions/tombstone.

---

## Template rename ≠ version content change necessarily

Changing library metadata such as display name may not require changing historical content version, depending on canonical version policy.

Do not force every metadata operation into Message-history mutation.

---

# 4. Permissions

Design 091 should conceptually distinguish:

```text
template.read
template.create
template.editDraft
template.publish
template.archive
template.delete
template.use

template.preview
template.variables.use

template.history.read
```

Exact keys belong to Phase 3D.

---

## Read ≠ edit

Permanent.

---

## Edit draft ≠ publish

Critical.

A copywriter may edit content without authority to make it executable in production Outreach.

---

## Publish ≠ Campaign launch

Permanent.

Publishing a TemplateVersion makes it available.

It does not:

* create SequenceVersion,
* enroll Leads,
* send Messages.

---

## Template use ≠ Template edit

A Campaign operator may be allowed to use approved templates while being unable to modify them.

---

## Template archive ≠ history deletion

Permanent.

---

## Template deletion needs referential protection

If Template has referenced versions:

ordinary deletion must not remove execution evidence.

---

## Variable authorization

The actor may be allowed to author:

```text
{{company_name}}
```

while a more sensitive variable requires additional permission.

The renderer must also enforce authorization at execution time.

---

## Template author permissions ≠ recipient data permissions automatically

A template author can define a permitted variable without necessarily seeing every recipient's resolved value.

---

## Preview permissions

Previewing against a real Lead/Contact must authorize access to that person/company data.

---

## Test preview ≠ access to arbitrary CRM records

A malicious request cannot submit another tenant's:

```text
leadId
contactId
companyId
```

to reveal resolved variable values.

---

## Cross-tenant templates prohibited

Templates and referenced versions remain tenant/workspace scoped.

---

## Shared/global templates

If platform-wide templates ever exist, that would require an explicit separate scope/permission model.

It is not introduced by this audit.

---

## Message content access remains Messaging permission

Being able to read TemplateVersion does not automatically grant access to Messages generated from it for sensitive recipients.

---

## Sequence access ≠ Template edit

Permanent.

---

## Campaign access ≠ Template edit

Permanent.

---

# 5. States

Design 091 must keep **Template lifecycle, draft/version state, validation state, publication state, reference/use state, render state, variable resolution state, and archive state** separate.

### Template lifecycle

```text
Active
Archived
```

where applicable.

### Template version state

Conceptually:

```text
Draft
Published
Superseded
Historical
```

### Validation state

```text
Valid
Invalid
Warning
Validation Pending
```

### Variable resolution

```text
Resolvable
Partially Resolvable
Missing Required Variable
Permission Restricted
Resolver Unavailable
```

### Preview/render state

```text
Not Rendered
Rendering
Rendered
Rendered With Warning
Failed
```

### Historical use state

```text
Unused
Referenced by Sequence
Used in Generated Message
```

These must not become one `template.status`.

---

## Draft ≠ invalid

A draft can be valid but unpublished.

---

## Published ≠ currently latest

A published historical version can remain referenced after a newer version exists.

---

## Superseded ≠ deleted

Permanent.

---

## Archived Template ≠ archived Messages

Permanent.

---

## Template valid ≠ all recipients renderable

Critical.

The syntax can be valid while Lead A is missing:

```text
company_name
```

---

## Missing required variable ≠ empty string

Permanent.

---

## Resolver unavailable ≠ missing data

Critical.

Example:

```text
Company service unavailable
```

must not produce:

```text
company_name = ""
```

and send.

---

## Restricted variable ≠ missing variable

Critical.

Permission failure should not be represented as ordinary empty content.

---

## Preview succeeded ≠ Campaign sending safe forever

Preview was generated against one context at one time.

Each actual Message generation validates the execution context again.

---

## Render succeeded ≠ Message sent

Permanent.

---

## Message generated ≠ delivered

Design 090 boundary continues.

---

## Template archived ≠ Sequence invalid historically

Historical SequenceVersions remain valid/reconstructable.

New Sequence creation/use may disallow archived templates according to policy.

---

## Template service failure ≠ Message history unavailable

Historical Messages contain exact generated content.

---

## State Coverage

Design 091 inherits Design 150 plus:

```text
Templates Loading
Templates Available
Templates Empty
Templates Restricted
Template Library Failed

Template Active
Template Archived

Template Draft
Template Published
Template Superseded
Template Historical

Template Validation Pending
Template Valid
Template Warning
Template Invalid

Variables Valid
Variable Missing
Required Variable Missing
Variable Permission Restricted
Variable Resolver Unavailable

Preview Not Started
Preview Rendering
Preview Rendered
Preview Rendered With Warning
Preview Failed

Template Unused
Template Referenced by Sequence
Template Used in Message History

Template Updated Elsewhere
Template Version Conflict
Template No Longer Available for New Use

Partial Template Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize reusable content discovery while preserving clear version and execution boundaries.

Conceptually:

```text
Templates Library
↓
Template list
    ├── name
    ├── type/channel where frozen
    ├── current version
    ├── lifecycle
    ├── validation/use state
    └── template action

Selected template/version
↓
Content
↓
Variables
↓
Version/history context
↓
Preview if frozen
```

Only controls present in frozen Design 091 should render.

---

## Version visibility matters

If the frozen design exposes version context, users should understand:

> Editing creates a new revision; existing Campaign/Sequence history is unaffected.

Do not visually imply that “Edit” changes already-sent content.

---

## Template list ≠ Message list

Rows should emphasize reusable content identity.

Do not show delivery/reply lifecycle as though the Template itself were sent.

---

## Variable chips/tokens

If frozen design uses variable tokens:

they should display typed, valid registry keys.

Unknown variables should be visibly invalid rather than silently accepted.

---

## Preview

Preview should be clearly labeled as:

> Preview / rendered example

rather than canonical Template body.

---

## Tablet

Following Design 152:

* template list may become compact cards,
* editor and preview can stack,
* version state remains visible,
* variables remain touch-selectable,
* destructive archive/delete remains deliberate.

---

## Mobile

Priority:

```text
Template
↓
Template name / state
↓
Current version
↓
Content
↓
Variables
↓
Validation
↓
Preview
↓
Version/use context
```

Exact ordering follows the frozen responsive design system.

---

## Mobile variable editing

Variable tokens must not degrade into unvalidated plain text due to smaller screen constraints.

---

## Long content

Use appropriate scroll/wrapping within editor/preview.

Do not create page-level horizontal overflow.

---

## Accessibility

A template card could communicate:

> Executive introduction template. Published version 4. Valid. Uses first name and company name. Referenced by three Sequence versions. Open template.

where frozen authorized data supports it.

---

# 7. Backend Requirements

## Canonical template architecture

```text
Design 091
    ↓
OutreachTemplateLibraryQueryService
    │
    ├── OutreachTemplate
    ├── TemplateVersion summaries
    ├── validation state
    ├── variable references
    └── usage/reference summaries
    ↓
TemplateLibraryView
```

---

## Template mutation architecture

```text
OutreachTemplateService
      │
      ├── createTemplate()
      ├── updateDraft()
      ├── createVersion()
      ├── publishVersion()
      └── archiveTemplate()
```

Avoid generic unrestricted CRUD over historical versions.

---

## Draft revision/concurrency

Template editing should support optimistic concurrency:

```text
expectedDraftRevision
```

so two editors do not silently overwrite each other.

---

## Publishing

Publishing should:

1. validate content syntax;
2. validate registered variables;
3. validate channel/content rules;
4. ensure required policy passes;
5. create/finalize immutable version;
6. compute content fingerprint;
7. emit version-published event.

---

## Published versions should be immutable

No ordinary:

```text
UPDATE published_template_version
```

for content.

Fixes produce a new version.

---

## Sequence references exact TemplateVersion ID

Critical.

Do not store:

```text
templateId
```

and dynamically fetch “latest” during Campaign execution.

Correct execution reference:

```text
templateVersionId
```

---

## SequenceVersion immutability

When SequenceVersion is published:

its TemplateVersion references are pinned.

Later Template versions do not update that SequenceVersion.

---

## Message generation architecture

```text
Enrollment
   ↓
Pinned SequenceVersion
   ↓
Sequence Step
   ↓
Pinned TemplateVersion
   ↓
PersonalizationContextResolver
   ↓
TemplateRenderer
   ↓
validation
   ↓
canonical Message
```

---

## One canonical rendering engine

The same core renderer should serve:

* template preview,
* sequence preview,
* Campaign execution.

Execution uses stricter authorization/snapshot requirements where appropriate.

---

## Template renderer should be deterministic

Given:

```text
TemplateVersion X
PersonalizationContext Y
RendererVersion Z
```

the output should be reproducible.

Avoid time/random/external-network side effects inside template rendering unless explicitly modeled and snapshotted.

---

## Renderer ≠ arbitrary execution engine

No:

* JavaScript eval,
* server-side code snippets,
* arbitrary network calls,
* unrestricted expressions.

---

## Personalization variable registry

Conceptually:

```text
PersonalizationVariableRegistry
├── first_name
├── last_name
├── company_name
├── job_title
└── ...
```

Each variable defines:

* source resolver,
* type,
* permission,
* null behavior,
* formatting.

Exact variable inventory follows product requirements; do not invent UI inventory in this audit.

---

## Variable resolver should be source-aware

Examples:

```text
first_name
→ Contact resolver

company_name
→ Company resolver

lead_owner
→ Lead/Team resolver
```

without copying all source data into template infrastructure.

---

## Resolver should use canonical IDs

Do not resolve primarily by:

* email strings,
* names,
* company strings

when canonical Lead/Contact/Company IDs are available.

---

## Variable authorization happens during render

Even if template syntax permits the variable, execution context must authorize it.

---

## Render-time context should be version/snapshot aware

The final Message-generation record should preserve enough information to explain which values were resolved.

---

## Required-variable preflight

Before Message creation/sending:

```text
validatePersonalizationContext()
```

must detect:

* missing required values,
* restricted values,
* resolver failures,
* invalid formatting.

---

## Broken placeholders must block send

Critical.

Do not silently send:

```text
Hi {{first_name}}
```

or:

```text
Hi ,
```

when `first_name` is required.

---

## Broken placeholder ≠ Message delivery failure

The failure occurs before transport.

Keep it in generation/personalization state.

---

## Optional fallback policy

Fallbacks must be part of the versioned template/rendering definition or centrally governed variable policy.

Do not invent fallbacks in provider adapters.

---

## HTML/content sanitation

If rich text exists:

sanitize at authoring/publish and/or rendering boundaries.

Protect against:

* `<script>`,
* event handlers,
* unsafe URLs,
* malformed markup.

---

## URL handling

Rendered dynamic links should validate allowed schemes.

Avoid:

```text
javascript:
data:
```

where inappropriate.

---

## Escaping

Variable substitution must use context-aware escaping.

A variable inserted into:

* plain text,
* HTML body,
* URL,

requires appropriate handling.

---

## Message content snapshot

Before delivery:

the canonical Message must store the final exact generated subject/body/content or immutable content reference.

It must not re-render from the template every time the Message is read.

---

## Personalization evidence

Preserve safe metadata such as:

```text
templateVersionId
rendererVersion
resolved variable keys
renderedAt
```

and exact generated Message content.

Do not needlessly persist every underlying CRM object.

---

## Template reference integrity

Deleting/archiving Template cannot break:

```text
SequenceVersion
→ TemplateVersion
```

or:

```text
Message
→ generation lineage
```

---

## Referential deletion rules

Never cascade from:

```text
OutreachTemplate deletion
```

to:

* SequenceVersion,
* Campaign,
* Enrollment,
* Message.

Referenced TemplateVersions should be retained.

---

## Archive instead of destructive delete

For historically referenced templates, archival is normally safer than destructive removal.

---

## Reference-count/read model

The library may show derived usage such as:

```text
used by 4 sequences
```

but that is a projection.

Do not maintain an editable `usageCount`.

---

## Usage count zero ≠ usage service unavailable

Permanent.

---

## Template clone/duplicate, if present in frozen design

Cloning should create a new Template identity/version lineage.

It must not share future mutable content state.

Do not invent this UI action if absent.

---

## Search

Design 079 may index:

* template name,
* safe metadata,

if templates are searchable.

Do not index full sensitive rendered recipient content through the Template entity.

---

## Audit

Material events can include:

```text
TemplateCreated
TemplateDraftUpdated
TemplateVersionPublished
TemplateArchived
```

according to audit policy.

High-frequency previews need not flood Audit.

---

## Events/outbox

Useful events:

```text
TemplateCreated
TemplateVersionCreated
TemplateVersionPublished
TemplateArchived
```

can invalidate library/search/sequence references.

---

## Caching

Template library caches should vary by:

```text
organizationMembershipId
template revision
version revision
authorization revision
```

Published immutable versions can be cached aggressively.

Drafts require revision-aware caching.

---

## Partial failure model

Example:

```text
Template core        ✓
Version history      ✓
Usage summary        ✕
Preview resolver     ✕
```

The Template remains available.

Show:

* usage unavailable,
* preview unavailable,

rather than:

> Template not found.

---

## Backend Requirement Matrix

| Requirement                                          | Status                            |
| ---------------------------------------------------- | --------------------------------- |
| Authenticated Team Workspace                         | **Critical**                      |
| Canonical OutreachTemplate identity                  | **Critical**                      |
| Template/TemplateVersion separation                  | **Critical**                      |
| Template/Sequence separation                         | **Critical**                      |
| TemplateVersion/SequenceVersion separation           | **Critical**                      |
| TemplateVersion/Message separation                   | **Critical**                      |
| TemplateVersion/RenderedContent separation           | **Critical**                      |
| Preview/Message separation                           | **Critical**                      |
| Draft/published separation                           | **Critical**                      |
| Published historical version immutability            | **Critical**                      |
| Optimistic draft concurrency                         | **Critical**                      |
| Exact TemplateVersion references                     | **Critical**                      |
| No dynamic “latest template” during execution        | **Critical**                      |
| SequenceVersion pins TemplateVersion                 | **Critical**                      |
| Template edit never rewrites Sequence history        | **Critical**                      |
| Template edit never rewrites Message history         | **Critical**                      |
| Canonical variable registry                          | **Critical**                      |
| Typed PersonalizationVariable model                  | **Critical**                      |
| No arbitrary code/expression execution               | **Critical**                      |
| Variable/source-domain mapping                       | **Critical**                      |
| Variable permission enforcement                      | **Critical**                      |
| Required/optional variable semantics                 | **Critical**                      |
| Missing/restricted/unavailable distinction           | **Critical**                      |
| Required-variable preflight                          | **Critical**                      |
| Broken-placeholder send prevention                   | **Critical**                      |
| One canonical rendering engine                       | **Critical**                      |
| Deterministic/versioned renderer                     | **Critical**                      |
| Context-aware escaping                               | **Critical**                      |
| Rich-content sanitation                              | **Critical if rich content used** |
| Safe dynamic URL handling                            | **Critical**                      |
| Exact generated Message snapshot                     | **Critical**                      |
| Render-time personalization evidence                 | **Critical**                      |
| Current CRM change/history separation                | **Critical**                      |
| Archive/delete/history preservation                  | **Critical**                      |
| No cascade deletion of SequenceVersion               | **Critical**                      |
| No cascade deletion of Message                       | **Critical**                      |
| Usage summary as projection                          | **Required**                      |
| Template read/edit/publish/use permission separation | **Critical**                      |
| Preview target reauthorization                       | **Critical**                      |
| Tenant isolation                                     | **Critical**                      |
| Design 013 sequence-engine reuse                     | **Critical**                      |
| Design 014 Message-engine reuse                      | **Critical**                      |
| Design 090 Campaign execution reuse                  | **Critical**                      |
| Design 079 safe search integration                   | **Required if indexed**           |
| Audit integration                                    | **Required**                      |
| Partial dependency failure handling                  | **Critical**                      |

---

# 8. Consolidation

Design 091 exposes substantial content-versioning and personalization risks.

**Template / TemplateVersion conflation**
Editing reusable content rewrites historical versions.

**TemplateVersion / SequenceVersion conflation**
Content and workflow timing/version semantics become one entity.

**Template / Sequence conflation**
Reusable copy becomes campaign workflow.

**Template / Campaign conflation**
Every Campaign gets its own copied template backend.

**TemplateVersion / Message conflation**
Changing Template changes already-generated Messages.

**Template body / rendered body conflation**
Placeholder source is overwritten with personalized content.

**Preview / TemplateVersion conflation**
Preview values mutate canonical content.

**Preview / Message conflation**
Opening preview creates communication history.

**Render / send conflation**
Successfully rendering a template is treated as delivered communication.

**Template ID / exact version conflation**
Execution always loads latest mutable content.

**Latest TemplateVersion / published execution version conflation**
Active Campaign changes content unexpectedly.

**Draft / published version conflation**
Copywriter edits production content in place.

**Superseded / deleted conflation**
Historical version disappears when newer version exists.

**Archive / history deletion conflation**
Sequence and Message lineage breaks.

**Delete Template / cascade Message deletion**
Communication history is destroyed.

**Delete Template / cascade Sequence deletion**
Campaign execution becomes unreconstructable.

**Template rename / content-version rewrite conflation**
Metadata change needlessly alters historical content identity.

**PersonalizationVariable / database field conflation**
Templates depend directly on schema internals.

**Variable / arbitrary expression conflation**
Template engine becomes code execution surface.

**Variable / arbitrary network fetch conflation**
Rendering becomes SSRF/exfiltration mechanism.

**Variable existence / permission conflation**
Template exposes restricted Contact/Company data.

**Required variable / optional variable conflation**
Missing critical personalization sends malformed copy.

**Missing value / empty string conflation**
`Hi ,` is sent.

**Missing value / resolver unavailable conflation**
Service outage is treated as absent CRM data.

**Restricted value / missing value conflation**
Permission failure silently alters outbound content.

**Fallback / provider-side improvisation conflation**
Different delivery adapters generate different text.

**Variable value / source truth conflation**
Rendering writes values back to CRM.

**Current Contact data / historical Message content conflation**
Old sent Message changes after Contact edit.

**Current Company name / old rendered content conflation**
Historical communication becomes inaccurate.

**RenderedContent / canonical TemplateVersion conflation**
Personalized output overwrites reusable source.

**GeneratedContent / Message conflation**
Preview/test renders pollute Inbox history.

**Message / DeliveryAttempt conflation**
Template-generation failure is treated as provider failure.

**Personalization failure / send failure conflation**
Transport retry tries to “fix” missing variables.

**Template validation / recipient renderability conflation**
Syntax-valid template is assumed valid for every Lead.

**HTML source / executable browser content conflation**
Script/event injection reaches recipients or internal preview.

**Dynamic URL / unrestricted protocol conflation**
Unsafe links enter outbound Messages.

**Usage count / canonical state conflation**
Derived reference count becomes mutable template metadata.

**Template author / CRM data access conflation**
Copywriter sees sensitive recipient fields through preview.

**Template edit / publish authority conflation**
Unapproved content becomes executable immediately.

**Template use / edit authority conflation**
Campaign operator can modify approved copy.

**Template access / Message access conflation**
Reusable copy permission leaks recipient conversations.

**Template Library / Message Library conflation**
Content authoring and communication history become one workspace/domain.

**Multiple rendering engines**
Preview, Sequence and send output diverge.

**Renderer current version / historical render conflation**
Old Message cannot be reproduced/explained.

**Template cache / draft revision conflation**
User previews stale content.

**Cross-tenant preview**
Template resolver leaks another tenant's Lead/Contact data.

**091/013 duplicate Sequence content backend**
Sequence Builder stores parallel mutable copies.

**091/014 duplicate Message content backend**
Template library becomes communication source truth.

**091/090 duplicate Campaign content state**
Campaign embeds editable Template content.

**091/092 provider formatting duplication**
Sending Account/provider adapter mutates content semantics.

No additional screen is required.

These are **content identity, immutable versioning, sequence reference integrity, personalization safety, rendering reproducibility, permission isolation, historical message preservation and archive/delete semantics**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL OUTREACH TEMPLATE, VERSIONING & PERSONALIZATION CONTENT ANCHOR**

**Domain directive:**
**OutreachTemplate ≠ TemplateVersion ≠ Sequence ≠ SequenceVersion ≠ Message ≠ Campaign ≠ Enrollment ≠ PersonalizationVariable ≠ GeneratedContent/RenderedMessage.**

**Identity directive:**
`OutreachTemplate` is the stable reusable content identity. It is never a Message, Sequence, Campaign or Enrollment.

**Version directive:**
material content revisions create new TemplateVersions. Published or historically referenced versions become immutable and remain permanently attributable to the executions that used them.

**Draft directive:**
draft content can remain editable under optimistic concurrency, but draft edits never mutate the last published/historically referenced TemplateVersion.

**Sequence directive:**
Design 013 remains canonical for Sequence/SequenceVersion. SequenceVersion references exact TemplateVersion IDs rather than resolving “latest template” during execution.

**Campaign directive:**
Designs 012/090 remain canonical for Campaign execution. Campaigns consume pinned SequenceVersions and never maintain a second editable Template backend.

**Message directive:**
Design 014 remains canonical Message/Conversation infrastructure. Message generation produces an exact concrete communication record whose rendered content remains historical even after all underlying Template/CRM data changes.

**Render directive:**
GeneratedContent/RenderedMessage is derived output from **TemplateVersion + authorized PersonalizationContext + renderer version/policy**. Preview/render output never becomes the TemplateVersion.

**Preview directive:**
preview does not create Message, Enrollment progression, DeliveryAttempt, Lead activity, or “last contacted” state.

**Personalization directive:**
variables come from a typed, versioned, allowlisted `PersonalizationVariableRegistry` mapping stable template keys to canonical Lead/Contact/Company/etc. resolvers.

**Execution-safety directive:**
the template engine permits no arbitrary JavaScript, SQL, ORM predicate, server-side code or unrestricted network call. Personalization is declarative and controlled.

**Permission directive:**
variable availability never bypasses source-domain permissions. Real-data preview and execution resolve recipient context under current tenant/resource authorization.

**Required-variable directive:**
missing required personalization, restricted values, resolver outage and formatting failure are explicit pre-send errors. They must never silently produce raw placeholders or malformed messages.

**Fallback directive:**
optional fallback behavior is explicit and versioned through template/variable policy; provider adapters must not invent inconsistent substitutions.

**Rendering directive:**
preview, Sequence preview and production Message generation reuse one canonical rendering semantic engine. Execution may apply stricter authorization/snapshot policies, but placeholder behavior must remain consistent.

**Determinism directive:**
given an exact TemplateVersion, personalization values and renderer version, output should be reproducible without hidden external side effects.

**Content-safety directive:**
rich text/HTML and dynamic values use context-aware escaping, sanitization and safe-link validation so templates cannot become XSS or unsafe-protocol vectors.

**Snapshot directive:**
the canonical Message stores exact generated subject/body/content or an immutable equivalent. Reading a historical Message never re-renders from current Template/Contact/Company state.

**Personalization-evidence directive:**
generation lineage preserves exact TemplateVersion, renderer/version context and enough resolved-value evidence to explain historical output without duplicating complete CRM entities.

**CRM-history directive:**
Contact name/email/title changes, Company renames, Lead updates and Template edits never rewrite previously generated or sent Messages.

**Archive directive:**
archiving a Template prevents or limits future use according to policy but preserves all TemplateVersions referenced by SequenceVersion/Message history.

**Deletion directive:**
destructive Template deletion must never cascade into SequenceVersions, Campaigns, Enrollments or Messages. Historically referenced versions require retention/tombstone semantics.

**Authorization directive:**
template read, edit-draft, publish, archive/delete, preview and production-use capabilities remain separately enforceable. Template authorship never implies Campaign sending authority.

**Concurrency directive:**
draft edits use revision protection; publication finalizes an exact version atomically so two editors cannot produce ambiguous execution history.

**Reference-integrity directive:**
TemplateVersion→SequenceVersion→Enrollment→Message lineage remains reconstructable even after the Template is superseded or archived.

**Partial-failure directive:**
Template core, version history, usage summary, variable resolver and preview can fail independently. Preview/usage failure must never make an otherwise valid Template appear missing.

**Caching directive:**
published immutable TemplateVersions can be aggressively cached; draft/library projections remain authorization- and revision-aware.

**Search directive:**
Design 079 may index safe Template metadata where useful, while rendered recipient-specific data and sensitive personalization context remain excluded from general template search.

**Audit directive:**
Template creation, material edits, version publication and archival generate appropriate Audit evidence; routine previews need not flood Design 039.

**Future-reuse directive:**
Design 092 Sending Accounts must only transport already-generated canonical Message content and must not introduce provider-specific template semantics that mutate TemplateVersion/rendering behavior. Design 093 consumes resulting Conversation/reply state rather than template state.

**Overlap directive:**
Designs **012–014 and 090–093** must share one continuous **TemplateVersion → SequenceVersion → Enrollment → Rendered Message → Delivery → Reply** lineage while keeping reusable content, execution workflow, communication and transport infrastructure separate.

**Consolidation directive:**
**STANDARDIZE ONE OUTREACH CONTENT FOUNDATION — STABLE OUTREACHTEMPLATE IDENTITY + IMMUTABLE HISTORICALLY REFERENCED TEMPLATEVERSIONS + EXACT SEQUENCEVERSION REFERENCES + TYPED/AUTHORIZED PERSONALIZATION VARIABLE REGISTRY + ONE DETERMINISTIC SAFE RENDERING ENGINE + REQUIRED-VARIABLE PREFLIGHT + EXACT GENERATED MESSAGE SNAPSHOTS + NON-DESTRUCTIVE ARCHIVE/HISTORY RETENTION — AND NEVER ALLOW TEMPLATE EDITS, “LATEST” LOOKUPS, PREVIEWS, PERSONALIZATION FAILURES, PROVIDER ADAPTERS OR CRM PROFILE CHANGES TO REWRITE SEQUENCE EXECUTION OR HISTORICAL MESSAGE CONTENT.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **91 / 153** |
| **PASS**                                   |                         **91** |
| **STANDARDIZE decisions**                  |                         **89** |
| **Potential implementation-overlap flags** |                         **82** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**91 / 153 = 59.5% audited.**

### Canonical Outreach content lineage after Design 091

```text
                   OUTREACH TEMPLATE
                    stable identity
                          │
             ┌────────────┼────────────┐
             ↓            ↓            ↓
          v1           v2            v3
                    TemplateVersions
                          │
                    exact reference
                          ↓
                    SequenceVersion
                          │
                          ↓
                      Enrollment
                          │
                          ↓
               Personalization Context
                          │
           ┌──────────────┴──────────────┐
           ↓                             ↓
   TemplateVersion                  CRM values
           │                             │
           └──────────────┬──────────────┘
                          ↓
                     SAFE RENDERER
                          ↓
                  exact rendered content
                          ↓
                       MESSAGE
                          ↓
                  DeliveryAttempts
                          ↓
                  Conversation / Reply
```

The historical rule is now strict:

```text
Template v3 used to generate Message M100
        ↓
Template later becomes v4
        ↓
Contact changes employer
        ↓
Company changes name

M100 remains exactly what was generated from v3.
```

And the failure boundary is:

```text
Required variable missing
        ↓
PERSONALIZATION / GENERATION FAILURE

NOT:
send "{{first_name}}"

NOT:
provider delivery failure

NOT:
Campaign failure

NOT:
Lead failure
```

## Next Sequential Audit Target

### **Design 092 — Sending Accounts / Email Connections**

The next audit should preserve the connection boundary:

> **SendingAccount ≠ ProviderConnection ≠ Credential/Token ≠ MailboxIdentity ≠ Campaign ≠ Enrollment ≠ Message ≠ DeliveryAttempt ≠ ProviderEvent ≠ ConnectionHealth ≠ SendingPolicy/Limit.**

It should reconcile Designs **012–014 and 090–091** while preserving:

* SendingAccount is a reusable sending identity/connection, not a Campaign,
* provider connection ≠ raw credential/token,
* Mailbox identity ≠ platform User/Contact,
* Campaign/Sequence references SendingAccount or governed selection policy without owning credentials,
* Message ≠ DeliveryAttempt,
* one Message can have multiple attempts without duplicate sends,
* provider acceptance ≠ delivery,
* connection health ≠ Campaign lifecycle,
* rate limits/sending limits must be enforced centrally and cannot be bypassed by manual Campaign actions,
* credential rotation/reconnection must not rewrite historical Message/Delivery evidence,
* provider callbacks must be verified, normalized, replay-safe and idempotent,
* no provider-specific duplicate Message/Campaign backend.

The sequence continues strictly with **Design 092 only next**, under the unchanged audit contract.
