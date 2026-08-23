# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 133 — Report Builder / Custom Report Configuration

Design 133 should become the **canonical Team Workspace Draft ReportVersion configuration, metric/source selection, section composition, visualization configuration, persistent filter definition, validation, and preview surface** built directly on the Reporting foundation established by **Design 033** and the exact Report/Version/Snapshot architecture established by **Designs 130–132**.

Design 133 must **not create a separate `CustomReport` domain, a generic analytics query builder, or an alternate metric engine**. Its job is to configure a **Draft `ReportVersion`**. Once that Version is finalized, approved, or released, its configuration and pinned snapshot become immutable; further changes require a new Draft ReportVersion.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Report ≠ ReportVersion ≠ DraftReportConfiguration ≠ ReportSourceBinding ≠ MetricDefinition ≠ MetricSelection ≠ DimensionSelection ≠ PersistentFilterDefinition ≠ ReportSectionDefinition ≠ VisualizationDefinition ≠ DraftPreviewSnapshot ≠ FinalReportDatasetSnapshot ≠ InteractiveReportViewState ≠ ReportTemplate ≠ ScheduledReportDefinition.**

The central implementation rule is:

> **The Builder edits configuration for one exact Draft ReportVersion. It may select authorized data sources, canonical MetricDefinitions, dimensions, persistent filters, sections, visualization settings, narrative configuration, and report-period parameters, but it must never execute arbitrary SQL/JavaScript, redefine canonical metrics, mutate finalized Versions, or treat preview data as final report evidence. Builder preview and finalization are separate operations: preview explores a Draft configuration; finalization performs fresh server validation and pins an exact immutable ReportDatasetSnapshot.**

---

# 1. Classification

| Audit field                              | Classification                                                                                                                                                                                                                                                                                                     |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                            | **133**                                                                                                                                                                                                                                                                                                            |
| **Canonical name**                       | **Report Builder / Custom Report Configuration**                                                                                                                                                                                                                                                                   |
| **Product area**                         | Team Workspace / Reporting / Report Authoring                                                                                                                                                                                                                                                                      |
| **User surface**                         | **Authenticated Team Workspace**                                                                                                                                                                                                                                                                                   |
| **Screen class**                         | Versioned Configuration Builder / Draft Report Authoring Workspace                                                                                                                                                                                                                                                 |
| **Classification**                       | **Canonical Draft ReportVersion Configuration, Metric/Dimension Selection & Validated Report-Composition Anchor**                                                                                                                                                                                                  |
| **Primary purpose**                      | Configure one Draft ReportVersion by selecting authorized source scope, canonical metrics, dimensions, persistent filters, sections, visualizations and presentation rules; validate the configuration; generate bounded previews; and hand the exact configuration into canonical snapshot/finalization workflows |
| **Canonical Reporting foundation**       | **Design 033**                                                                                                                                                                                                                                                                                                     |
| **Report Center dependency**             | Design 131                                                                                                                                                                                                                                                                                                         |
| **Interactive Detail dependency**        | Design 132                                                                                                                                                                                                                                                                                                         |
| **Final Distribution Report dependency** | Design 130                                                                                                                                                                                                                                                                                                         |
| **Primary entity**                       | **Report**                                                                                                                                                                                                                                                                                                         |
| **Editable identity**                    | **Draft ReportVersion**                                                                                                                                                                                                                                                                                            |
| **Configuration identity**               | `DraftReportConfiguration` / version-pinned report configuration                                                                                                                                                                                                                                                   |
| **Source configuration**                 | `ReportSourceBinding`                                                                                                                                                                                                                                                                                              |
| **Metric semantics**                     | Design 038 `MetricDefinition`                                                                                                                                                                                                                                                                                      |
| **Metric usage**                         | `MetricSelection`                                                                                                                                                                                                                                                                                                  |
| **Grouping semantics**                   | `DimensionSelection`                                                                                                                                                                                                                                                                                               |
| **Persistent query rules**               | `PersistentFilterDefinition`                                                                                                                                                                                                                                                                                       |
| **Section configuration**                | `ReportSectionDefinition`                                                                                                                                                                                                                                                                                          |
| **Visualization configuration**          | `VisualizationDefinition`                                                                                                                                                                                                                                                                                          |
| **Narrative configuration**              | version-pinned report content/configuration                                                                                                                                                                                                                                                                        |
| **Preview input**                        | `DraftPreviewSnapshot` / draft snapshot projection                                                                                                                                                                                                                                                                 |
| **Final data boundary**                  | `ReportDatasetSnapshot`                                                                                                                                                                                                                                                                                            |
| **Transient viewing boundary**           | Design 132 `InteractiveReportViewState`                                                                                                                                                                                                                                                                            |
| **Reusable template boundary**           | `ReportTemplate` only if present in frozen product; never identical to ReportVersion                                                                                                                                                                                                                               |
| **Scheduled report boundary**            | Design 134 `ScheduledReportDefinition`                                                                                                                                                                                                                                                                             |
| **Generated artifact dependency**        | Design 030                                                                                                                                                                                                                                                                                                         |
| **Approval dependency**                  | Designs 029 / 115                                                                                                                                                                                                                                                                                                  |
| **Primary query service**                | `ReportBuilderQueryService`                                                                                                                                                                                                                                                                                        |
| **Builder command service**              | `ReportBuilderService`                                                                                                                                                                                                                                                                                             |
| **Configuration validator**              | `ReportConfigurationValidator`                                                                                                                                                                                                                                                                                     |
| **Source registry**                      | `ReportSourceRegistry`                                                                                                                                                                                                                                                                                             |
| **Metric compatibility resolver**        | `ReportMetricCompatibilityResolver`                                                                                                                                                                                                                                                                                |
| **Filter validator**                     | `ReportFilterValidator`                                                                                                                                                                                                                                                                                            |
| **Preview service**                      | `ReportPreviewService`                                                                                                                                                                                                                                                                                             |
| **Draft snapshot service**               | `DraftReportSnapshotService`                                                                                                                                                                                                                                                                                       |
| **Finalization dependency**              | canonical `ReportVersionService` / Reporting service                                                                                                                                                                                                                                                               |
| **Parent shell**                         | `InternalAppShell` — Design 001                                                                                                                                                                                                                                                                                    |
| **Auth**                                 | Required                                                                                                                                                                                                                                                                                                           |
| **Authorization**                        | Active OrganizationMembership + Report Draft edit + source/metric access                                                                                                                                                                                                                                           |
| **Implementation priority**              | **Critical Metric Integrity / Query Safety / Finalized-Version Immutability**                                                                                                                                                                                                                                      |
| **Reuse level**                          | **Extremely High across all custom reports, scheduled reports, interactive Reports and client reporting**                                                                                                                                                                                                          |

Design 133 should answer:

> **“Which exact Draft ReportVersion am I configuring, what authorized data does it use, which canonical metrics and dimensions are included, which filters and sections are permanent parts of the report, are those selections semantically compatible and permission-safe, what will the Draft approximately look like, and is this configuration valid enough to produce a canonical snapshot and eventually become a finalized ReportVersion?”**

Canonical composition:

```text
Report R-20
   │
   ├── v3 RELEASED
   │
   └── v4 DRAFT
          │
          ↓
   DraftReportConfiguration
          │
    ┌─────┼───────────────────────────┐
    ↓     ↓          ↓        ↓       ↓
 Sources Metrics Dimensions Filters Sections
    │     │          │        │       │
    └─────┴──────────┴────────┴───────┘
                     │
                     ↓
          Configuration Validation
                     │
              ┌──────┴──────┐
              ↓             ↓
          Draft Preview    Validated Draft
                              │
                              ↓
                       Finalization flow
                              │
                              ↓
                  ReportDatasetSnapshot
                              │
                              ↓
                       Finalized Version
```

---

# 2. Reuse

## Design 033 remains the canonical Reporting domain

Design 133 must not introduce:

```text
CustomReport
BuilderReport
AnalyticsReport
UserReport
```

as new parallel Report identities.

Correct:

```text
Report R-20
      │
      ├── v3 Released
      └── v4 Draft
              │
              ↓
         Design 133
```

The Builder edits **v4**.

It does not create another report domain.

---

## Design 131, 132, and 133 use the same ReportVersion

### Design 131

Discovers:

> Draft v4 exists.

### Design 132

Can view/explore:

> Draft v4.

### Design 133

Edits:

> Draft v4 configuration.

All three must reference the exact same:

```text
reportVersionId
```

---

## Builder ≠ Report Detail

Design 132 primarily explores a ReportVersion.

Design 133 changes a Draft ReportVersion's persistent configuration.

Temporary interactions in Design 132 must never become Builder configuration implicitly.

---

## `InteractiveReportViewState` ≠ `DraftReportConfiguration`

Critical.

Example:

In Design 132:

> Filter Channel = LinkedIn

is temporary exploration.

In Design 133:

> Permanent filter Channel IN [LinkedIn]

becomes part of the Draft Report definition.

These must be separate concepts.

---

## ReportVersion ≠ DraftReportConfiguration

The ReportVersion is the canonical report revision.

The Builder configuration describes what that Draft Version should contain/render.

Conceptually:

```text
ReportVersion v4
      │
      ↓
DraftReportConfiguration C-4
```

Exact physical persistence belongs to Phase 3D.

---

## Draft configuration ≠ final DatasetSnapshot

Absolute.

Configuration answers:

> What should be queried/included?

Snapshot answers:

> What exact data/evidence was frozen?

---

## Draft preview ≠ final Snapshot

This is one of Design 133's strongest boundaries.

Correct:

```text
Draft configuration
      ↓
Preview
      ↓
user edits configuration
      ↓
Preview changes
      ↓
finalize
      ↓
fresh validation
      ↓
new exact final snapshot
```

Incorrect:

> Preview values automatically become final report truth.

---

## MetricDefinition remains Design 038 authority

The Builder may let the user **select**:

* impressions;
* clicks;
* revenue;
* completion rate;
* other supported canonical metrics.

It cannot redefine those metrics locally.

---

## MetricSelection ≠ MetricDefinition

Critical.

### MetricDefinition

Defines:

> What does `IMPRESSIONS` mean?

### MetricSelection

Defines:

> Include `IMPRESSIONS` in Report v4.

---

## Visualization ≠ Metric semantics

Choosing:

> bar chart

instead of:

> line chart

does not change what the metric means.

---

## DimensionSelection ≠ arbitrary database field

Dimensions must come from a typed authorized registry.

Examples may include:

* Channel;
* Placement;
* Campaign;
* date bucket;

only where a given ReportType/source supports them.

Never expose database column names directly.

---

## Persistent Filter ≠ authorization policy

Critical.

A Builder filter can narrow data.

It cannot broaden what the user is authorized to include.

Correct:

```text
Authorized Client scope:
Acme only

Builder filter:
Channel = LinkedIn
```

Incorrect:

```text
filter clientId = another tenant
```

and assume the query is allowed.

---

## Persistent Filter ≠ interactive filter

Permanent.

---

## Builder query rules ≠ arbitrary SQL

Absolute.

No:

```text
SELECT *
FROM...
```

No user-supplied JavaScript/eval.

Use typed allowlisted AST/rule structures.

---

## Report source ≠ Integration credential

A Report can consume data produced by an Integration.

The Builder must not expose or store provider secrets as report configuration.

---

## Report source ≠ copied source data

`ReportSourceBinding` references canonical source scope.

The final Snapshot freezes the allowed data later.

---

## Report source binding ≠ source-domain ownership

Reporting never becomes the owner of:

* Project;
* Invoice;
* Placement;
* Publication;
* Client;
* Deal;

data.

---

## Report Template ≠ ReportVersion

If the frozen product supports reusable report templates:

### Template

Reusable starting/configuration structure.

### ReportVersion

A specific report revision for specific source scope/period.

Editing a Template later must not mutate ReportVersions already created from it.

---

## Template version should be pinned if used

If Report v4 originates from:

```text
ReportTemplateVersion TV-3
```

later TV-4 must not change v4 automatically.

Do not invent a template subsystem if the frozen Builder does not expose it.

---

## Design 134 scheduling remains separate

The Builder may create a report configuration that can later be scheduled.

But recurrence such as:

> every month on the first business day

belongs to Design 134.

---

## ScheduledReportDefinition ≠ ReportVersion configuration

A ScheduledReportDefinition should reference/pin a valid report configuration/template policy.

It owns:

* cadence;
* next run;
* execution context;
* delivery policy.

The Builder does not.

---

# 3. Entities

## Report

Same canonical identity.

---

## ReportVersion

Only a Draft Version is materially editable in Design 133.

Conceptually:

```text
ReportVersion
├── id
├── reportId
├── versionNumber
├── lifecycle
├── configurationRevision
├── reportingPeriod/config
├── datasetSnapshotId?
├── createdBy
├── createdAt
└── revision
```

---

## Finalized ReportVersion must be immutable

If Design 133 is opened against:

```text
v3 RELEASED
```

it should either:

* remain read-only, if frozen UI supports viewing;
* or require creation of a new Draft Version before editing.

Never PATCH v3.

---

## New Draft from released Version

If user wants to revise v3:

conceptually:

```text
v3 RELEASED
      ↓
create new Draft
      ↓
v4 DRAFT
```

v4 may copy reusable configuration.

It must not copy:

* Approval;
* ReportRelease;
* ClientDownload;
* final DatasetSnapshot as newly valid evidence.

---

## DraftReportConfiguration

Conceptually:

```text
DraftReportConfiguration
├── reportVersionId
├── sourceBindings[]
├── metricSelections[]
├── dimensionSelections[]
├── persistentFilters[]
├── sectionDefinitions[]
├── visualizationDefinitions[]
├── reportingPeriodConfig
├── narrative/configuration
├── display/layout settings
├── templateOrigin?
└── revision
```

---

## Configuration revision

Important for concurrent editing and snapshot generation.

A Preview should identify:

```text
configurationRevision = 18
```

A finalization cannot silently freeze revision 17 if user has already saved revision 18.

---

## SourceBinding

Typed, canonical source definition.

Conceptually:

```text
ReportSourceBinding
├── sourceType
├── sourceScope
├── sourceIds / typed criteria
├── bindingRevision
└── authorized dimensions/capabilities
```

Exact form depends on ReportType.

---

## SourceBinding ≠ raw query

Permanent.

---

## SourceBinding ≠ DatasetSnapshot

Permanent.

---

## MetricSelection

Conceptually:

```text
MetricSelection
├── metricDefinitionId
├── metricDefinitionVersion/policy
├── display role
├── allowed dimensions
├── calculation config where definition permits
└── ordering
```

---

## MetricSelection does not allow arbitrary formula override

If the canonical MetricDefinition supports parameters, those parameters must be typed and validated.

Do not allow:

```text
formula = "(x+y)/anything"
```

from arbitrary user text.

---

## Custom calculated metrics

If the frozen Builder supports them, they must use a **safe typed calculation DSL** and become versioned metric definitions/configuration with:

* explicit operands;
* units;
* formula version;
* validation;
* divide-by-zero behavior;
* provenance.

Do not assume this capability if not present in the frozen design.

---

## DimensionSelection

Conceptually:

```text
DimensionSelection
├── dimensionDefinitionId
├── grouping level
├── ordering
└── display configuration
```

---

## Dimension Definition

Prefer a registry:

```text
ReportDimensionDefinition
```

with:

* stable key;
* source compatibility;
* data type;
* privacy/sensitivity;
* allowed operators;
* hierarchy where applicable.

---

## DimensionDefinition ≠ database schema column

Absolute.

---

## PersistentFilterDefinition

Use typed AST.

Conceptually:

```text
AND
├── Channel IN [LinkedIn, Newsletter]
└── PlacementState = VERIFIED
```

No raw executable expressions.

---

## Filter definition should identify semantic fields

Not implementation columns.

---

## Filter operators must be type-safe

Examples:

* number: `>`, `<`, range;
* enum: `IN`;
* date: bounded period;
* text: defined search operator.

Do not permit nonsensical comparisons.

---

## Filter ≠ permission

Permanent.

---

## ReportSectionDefinition

Defines ordered report composition.

Conceptually:

```text
ReportSectionDefinition
├── stable sectionId
├── sectionType
├── title
├── metric/visual refs
├── layout config
├── narrative config
└── ordering
```

---

## Display order ≠ identity

Critical.

Reordering a section must not create unrelated section identities unless a new Version/config revision requires it.

---

## VisualizationDefinition

Conceptually:

```text
VisualizationDefinition
├── visualizationId
├── visualizationType
├── metricRefs[]
├── dimensionRefs[]
├── display options
├── sort policy
└── accessibility metadata
```

---

## Visualization type changes do not alter underlying MetricSelection

Permanent.

---

## Visualization compatibility must be validated

Example:

A pie chart may not be suitable for:

* high-cardinality time-series;
* non-additive measures;

depending on defined rules.

Do not rely solely on frontend selection availability.

---

## Narrative configuration

If the Builder includes text/narrative sections, they belong to Draft ReportVersion content.

They may reference frozen report metrics by stable placeholders rather than manually duplicating values.

Example conceptually:

```text
{{metric:IMPRESSIONS_TOTAL}}
```

if templating exists.

---

## Narrative ≠ metric source truth

Permanent.

---

## DraftPreviewSnapshot

Conceptually:

```text
DraftPreviewSnapshot
├── reportVersionId
├── configurationRevision
├── sourceRevisionManifest
├── builtAt
├── previewData
├── completeness
└── freshness
```

It is explicitly non-final.

---

## Preview Snapshot may be replaceable

Unlike finalized ReportDatasetSnapshot.

---

## Preview Snapshot ≠ Client-visible snapshot

Absolute.

---

## Final ReportDatasetSnapshot

Produced only through the canonical finalization process established in Designs 130–132.

---

## BuilderState

UI state such as:

* selected section;
* open configuration panel;
* dragged item;
* unsaved field edits;

does not belong in canonical ReportConfiguration unless persisted intentionally.

---

# 4. Permissions

Design 133 should conceptually distinguish:

```text
reportBuilder.read
reportBuilder.editDraft

reportSource.read
reportSource.bind

reportMetric.read
reportMetric.select
reportDimension.select

reportPreview.run

reportVersion.createDraft
reportVersion.finalize

reportTemplate.read
reportTemplate.manage

reportSourceEvidence.preview
```

Exact permission identifiers belong to Phase 3D.

---

## Builder access ≠ edit every Draft

Critical.

Every `reportVersionId` must be individually reauthorized.

---

## Draft read ≠ Draft edit

Permanent.

---

## Draft edit ≠ finalization

Absolute.

---

## Finalize ≠ Approval

Permanent.

---

## Approval ≠ release

Permanent.

---

## Metric select ≠ MetricDefinition administration

Critical.

Users can select `IMPRESSIONS`.

They cannot change what `IMPRESSIONS` means unless separately authorized in the metric-governance domain.

---

## Source bind ≠ source-domain administration

Permanent.

A user can include an authorized Campaign in a Report without being able to modify the Campaign.

---

## Source selection must be permission-safe

Search/pickers should expose only eligible/authorized source entities.

---

## Source picker result ≠ authorization forever

On save/preview/finalization, server reauthorizes selected sources.

---

## Dimension access may be more restrictive than source access

Example conceptually:

A user may access aggregated Team performance but not individual employee-level dimensions.

Do not assume:

> access to source = access to every breakdown.

---

## Sensitive dimensions need independent governance

Permanent.

---

## Preview permission ≠ raw data export permission

Preview can provide bounded authorized values without granting complete raw dataset export.

---

## Builder filter parameters cannot bypass tenant/resource policy

Absolute.

---

## Report Template edit ≠ ReportVersion edit

If Templates exist.

---

## Template usage ≠ Template administration

Permanent.

---

## Client Portal users do not use internal Builder

Absolute.

---

## Direct IDs reauthorize

Every:

* Report;
* ReportVersion;
* source entity;
* MetricDefinition;
* dimension;
* TemplateVersion;

must be validated server-side.

---

## Cross-tenant source binding prohibited

Absolute.

A Report cannot bind a Project/Campaign/Client/Placement from another tenant even if an ID is manually supplied.

---

# 5. States

Design 133 must keep **ReportVersion lifecycle, configuration validity, Builder persistence state, source availability, metric compatibility, preview state, and finalization readiness** independent.

### ReportVersion

```text
Draft
Finalized
Approval Pending
Approved
Released
Superseded
```

Only Draft is normally editable.

### Configuration validity

Conceptually:

```text
Valid
Invalid
Warning
Unknown
```

### Builder persistence

If relevant to frozen implementation:

```text
Saved
Unsaved
Saving
Save Failed
Conflict
```

Do not force these states if the frozen UI does not expose save status.

### Source binding

```text
Available
Restricted
Unavailable
Invalid
Unknown
```

### Metric compatibility

```text
Compatible
Incompatible
Warning
Unknown
```

### Preview

```text
Not Generated
Building
Ready
Partial
Stale
Failed
```

### Finalization readiness

```text
Ready
Blocked
Unknown
```

These must never collapse into one generic `builder.status`.

---

## Draft ≠ Valid

A Draft can be invalid.

---

## Valid ≠ Preview generated

Permanent.

---

## Preview Ready ≠ Finalization Ready

Critical.

Preview may succeed while:

* required Approval source is missing;
* report period invalid;
* another section has incompatible metric;
* source permissions changed.

---

## Preview success ≠ final Snapshot success

Absolute.

---

## Preview stale ≠ configuration invalid

Permanent.

It may simply require explicit preview rebuild.

---

## Source unavailable ≠ source has zero data

Absolute.

---

## Source returns zero matching rows ≠ source unavailable

Permanent.

---

## Metric incompatible ≠ metric unavailable

Critical.

`Incompatible` means:

> this metric cannot be used with the selected source/dimension/configuration.

`Unavailable` means:

> semantic configuration is valid but no current trustworthy data is available.

---

## Warning ≠ Block

Permanent.

---

## Unsaved UI changes ≠ canonical Draft revision

If unsaved state exists.

---

## Save conflict ≠ ReportVersion invalid

Permanent.

---

## Finalized Version ≠ editable Draft

Absolute.

---

## Newer Draft exists ≠ current released Version modified

Permanent.

---

## State Coverage

Design 133 inherits Design 150 plus:

```text
Report Builder Loading
Report Builder Available
Report Builder Restricted
Report Builder Partial
Report Builder Unavailable

Draft Version Editable
Draft Version Read Only
Version Finalized
Version Released
New Draft Required

Configuration Valid
Configuration Invalid
Configuration Warning
Configuration State Unknown

Source Available
Source Restricted
Source Unavailable
Source Invalid
Source State Unknown

Metric Compatible
Metric Incompatible
Metric Warning
Metric State Unknown

Dimension Allowed
Dimension Restricted
Dimension Incompatible

Filter Valid
Filter Invalid
Filter Unsupported

Preview Not Generated
Preview Building
Preview Ready
Preview Empty
Preview Partial
Preview Stale
Preview Failed

Finalization Ready
Finalization Blocked
Finalization Readiness Unknown

Draft Updated Elsewhere
Configuration Revision Conflict
Metric Definition Updated
Source Permission Changed
Source Data Changed
Preview Became Stale
```

---

# 6. Responsive Behavior

## Desktop

Design 133 is naturally one of the more complex internal workspaces.

The frozen UI may use a palette/canvas/configuration layout, but the architectural priority should remain:

```text
Report / Draft Version
↓
Sources + reporting scope
↓
Metrics / dimensions
↓
Sections / visualizations
↓
Persistent filters
↓
Validation
↓
Preview
↓
Finalization readiness
```

Only the frozen Design 133 panels and controls should be implemented.

---

## Draft Version identity must remain visible

The user must know:

> Editing Report R-20 · Draft v4

rather than merely:

> Custom Report.

This protects finalized v3.

---

## Source scope should remain visible

The Builder should make it clear which canonical data context the report uses.

Example:

> Distribution Campaign DC-100 · Campaign Version v2

where applicable.

---

## Metric selections should communicate semantics

Where useful:

> Impressions
> Metric definition: provider-reported impressions

not an ambiguous free-text field.

---

## Persistent filters should look different from Preview filters

If both exist in frozen UI, this distinction is critical.

### Persistent Builder filter

Part of the ReportVersion.

### Preview-only interaction

Temporary.

Do not style them as the same mutation.

---

## Validation feedback should be contextual

Prefer:

> Engagement Rate cannot be grouped by this selected dimension because the current metric definition does not support that aggregation.

rather than:

> Invalid configuration.

---

## Preview should identify its scope

Example:

> Preview generated from Draft configuration revision 18.

Conceptually important even if revision ID is not visibly shown.

---

## Drag/drop, if frozen design supports it

Dragging a report section changes **presentation/order**.

It does not:

* modify metric definitions;
* change source identity;
* finalize the report.

---

## Accessible alternative to drag/drop

Keyboard controls should permit:

* move up/down;
* reposition;
* select configuration.

Do not make report composition mouse-only.

---

## Tablet

Following Design 152:

* Draft/report identity remains top;
* Builder panels can become tabs/drawers;
* active section remains central;
* configuration controls remain reachable;
* preview can move below configuration;
* no essential state hidden only behind hover.

---

## Mobile

Complex report authoring may need a stacked workflow while preserving functionality available in the frozen responsive system:

```text
Draft version
↓
Source
↓
Metrics
↓
Dimensions
↓
Filters
↓
Sections
↓
Preview
↓
Validation
```

Avoid squeezing three desktop panes side-by-side.

---

## Mobile section reordering

If drag is unreliable:

provide accessible ordered controls.

---

## Mobile preview

Preview should use the same responsive chart/report primitives as Design 132 where possible.

---

## Accessibility

A Builder state could communicate:

> Editing Client Performance Report, Draft version 4. The report uses Distribution Campaign DC-100. Four metrics and two dimensions are selected. One configuration error prevents finalization: Engagement Rate is incompatible with the selected Placement aggregation. The current preview was generated before the latest metric change and is stale.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical Builder architecture

```text
Design 133
    ↓
Authenticated Workspace Context
    ↓
ReportBuilderQueryService
    │
    ├── ReportAdapter
    ├── ReportVersionAdapter
    ├── ReportSourceRegistry
    ├── MetricRegistryAdapter
    ├── DimensionRegistryAdapter
    ├── TemplateAdapter if applicable
    └── DraftConfigurationAdapter
    ↓
ReportBuilderView
```

Writes:

```text
ReportBuilderService
        │
        ├── update source bindings
        ├── update metric selections
        ├── update dimensions
        ├── update filters
        ├── update sections
        └── update visual config
```

Validation:

```text
ReportConfigurationValidator
```

Preview:

```text
ReportPreviewService
        ↓
DraftPreviewSnapshot
```

Finalization:

```text
fresh validation
        ↓
canonical snapshot build
        ↓
ReportDatasetSnapshot
        ↓
finalized ReportVersion
```

---

## Builder load

Conceptually:

```text
getReportBuilder(
    reportId,
    reportVersionId,
    currentMembership
)
```

should:

1. authenticate;
2. authorize Report;
3. authorize exact ReportVersion;
4. verify lifecycle/editability;
5. load Draft configuration;
6. load allowed ReportSource definitions;
7. load allowed MetricDefinitions;
8. load allowed dimensions;
9. load validation state;
10. load latest Preview summary if relevant;
11. return current Version/configuration revision.

---

## Edit commands should be targeted

Prefer:

```text
updateReportSources(...)
updateReportMetrics(...)
updateReportFilters(...)
updateReportSection(...)
reorderReportSections(...)
updateVisualization(...)
```

or a structured revision-safe configuration update.

Avoid unrestricted:

```text
PATCH /reports/:id
{
  ...anything
}
```

---

## Configuration updates need optimistic concurrency

Every mutation should include:

```text
expectedConfigurationRevision
```

or equivalent.

Example:

```text
User A edits metrics at revision 18.
User B edits filters from stale revision 17.
```

Do not silently overwrite A's changes.

---

## Conflict handling

Return structured conflict requiring:

* reload;
* merge/reapply;
* explicit resolution.

Do not last-write-wins blindly for complex Builder configuration.

---

## Autosave

If the frozen design supports autosave, it still uses revision-safe canonical commands.

Autosave ≠ permission bypass.

Do not assume autosave if not part of frozen UX.

---

## Configuration validation

Central:

```text
ReportConfigurationValidator.validate(
    reportVersionId,
    configurationRevision
)
```

should check at least:

* exact source validity;
* source authorization;
* source/report-type compatibility;
* metric availability/compatibility;
* dimension compatibility;
* filter syntax/types;
* metric-dimension aggregation compatibility;
* report-period validity;
* visualization compatibility;
* required sections/configuration;
* unsupported combinations.

---

## Validator must be server-authoritative

Frontend validation improves UX.

It does not authorize/finalize the report.

---

## Structured validation results

Prefer:

```text
ERROR
WARNING
INFO
```

with:

* code;
* affected section/metric/filter;
* explanation.

Not one:

> Invalid report.

---

## ReportSourceRegistry

Central typed registry:

```text
ReportSourceDefinition
├── sourceType
├── allowed ReportTypes
├── allowed metrics
├── allowed dimensions
├── filter capabilities
├── permissions
├── snapshot adapter
└── schema/version
```

---

## Source Registry ≠ source database

It describes reporting capabilities.

Canonical domains still own their records.

---

## No arbitrary cross-domain joins

Critical.

Builder cannot allow users to invent arbitrary joins:

```text
Invoices.customer_email = Employees.email
```

or similar.

Cross-domain reporting relationships must be pre-defined/typed.

---

## Typed relationship registry

Where ReportTypes legitimately combine domains, the Reporting system should define supported joins/relations centrally.

---

## Metric compatibility resolver

Conceptually:

```text
ReportMetricCompatibilityResolver.resolve(
    sourceBindings,
    metricDefinitionId,
    dimensions,
    periodConfig
)
```

returns:

```text
COMPATIBLE
WARNING
INCOMPATIBLE
UNKNOWN
```

with reason.

---

## Metric semantic version changes

If a selected MetricDefinition materially changes while Draft v4 is being edited:

Builder should surface:

> Metric definition changed.

The Draft must explicitly validate/pin intended version at snapshot/finalization.

Finalized reports remain pinned to their historical metric version.

---

## Dimension Registry

Same typed safety as Metric Registry.

Never trust arbitrary field names from the client.

---

## Filter AST

Conceptual safe form:

```text
{
  type: "AND",
  clauses: [
    {
      dimension: "CHANNEL",
      operator: "IN",
      values: [...]
    }
  ]
}
```

The exact transport schema belongs to Phase 3D.

---

## No arbitrary `eval`

Absolute.

---

## Filter complexity limits

To protect the query engine:

* maximum nesting;
* maximum clauses;
* bounded `IN` lists;
* supported operators.

Do not allow Builder rules to create pathological queries.

---

## Source authorization

Must happen:

1. while searching/selecting source;
2. when saving source binding;
3. when previewing;
4. when finalizing/snapshotting.

---

## Permission loss

If user configured source yesterday but loses access today:

Builder must not continue preview/finalization from stale authorization.

Return:

> Source restricted.

---

## Permission loss ≠ delete source binding automatically

Important.

The configuration may remain historical Draft metadata, but it becomes blocked/restricted until authorized remediation.

---

## Preview

Conceptually:

```text
generateReportPreview(
    reportVersionId,
    configurationRevision,
    previewScope?,
    idempotencyKey
)
```

should:

1. authorize;
2. validate configuration;
3. pin exact configuration revision;
4. query only authorized source scope;
5. execute canonical metric/dimension rules;
6. produce DraftPreviewSnapshot;
7. preserve data availability/provenance;
8. return preview status.

---

## Preview may be bounded

For large datasets, preview can use:

* bounded period;
* sampled/limited detail;
* preaggregated representative data;

**only if clearly marked as preview semantics**.

Do not pretend sampled data is final report evidence.

Exact preview policy belongs to Phase 3D.

---

## Preview ≠ finalization

Absolute.

---

## Preview data must never release to Client

Permanent.

---

## Preview stale detection

Preview should become stale when:

* configuration revision changes;
* source changes materially;
* metric definition changes;
* preview freshness threshold expires.

Stale preview remains a preview—it does not invalidate the Draft itself automatically.

---

## Preview query failure ≠ configuration invalid

Critical.

Provider/source infrastructure may be temporarily unavailable.

Return:

> Preview unavailable.

not:

> Invalid configuration,

unless validation itself failed.

---

## Draft Snapshot

If Design 132 preview/exploration of Draft requires richer data, DraftPreviewSnapshot/DraftSnapshot may be stored with exact configuration revision.

It remains replaceable.

---

## Finalization preflight

Before finalization, do **not** trust:

* last successful preview;
* cached validation;
* frontend `isValid`.

Run fresh:

```text
ReportConfigurationValidator
```

and source authorization.

---

## Finalization process

Conceptually:

```text
finalizeReportVersion(
    reportVersionId,
    expectedVersionRevision,
    expectedConfigurationRevision,
    idempotencyKey
)
```

should:

1. authorize finalization;
2. verify Version is Draft;
3. fresh-validate configuration;
4. fresh-authorize source bindings;
5. pin MetricDefinition/calculation versions;
6. resolve reporting period;
7. build exact canonical ReportDatasetSnapshot;
8. verify Snapshot completeness/policy;
9. pin exact configuration revision;
10. transition ReportVersion to finalized;
11. emit Audit/outbox.

---

## Finalization is one governed boundary

Once committed:

```text
Draft configuration revision 24
+
DatasetSnapshot DS-10
```

become historical Version evidence.

---

## Finalization idempotency

Critical.

Network retry cannot create:

* multiple Snapshots;
* multiple finalized Version transitions.

---

## Outcome unknown

If finalization may have committed but response is lost:

reconcile by ReportVersion/idempotency key before retry.

---

## Snapshot build failure

ReportVersion remains Draft unless finalization transaction semantics explicitly commit another safe state.

Do not mark finalized if the exact DatasetSnapshot was not successfully established.

---

## Snapshot/Version transaction

The Version must never finalize referencing:

* wrong configuration revision;
* incomplete unrelated Snapshot.

Use transaction/coordination.

---

## Report period

One-off Builder may configure an explicit period.

For recurring reports, Design 134 may supply relative period policy.

Builder and Scheduler must not both independently decide report-period semantics.

---

## Parameterized period configuration

If frozen reporting supports parameterized templates, conceptually:

```text
PREVIOUS_MONTH
PREVIOUS_QUARTER
CUSTOM_FIXED_RANGE
```

should be safe typed policy.

But recurrence/run resolution belongs to Design 134.

Do not store arbitrary date scripts.

---

## Report Template support

If frozen Builder supports templates:

```text
ReportTemplate
└── ReportTemplateVersion
```

should be distinct from:

```text
Report
└── ReportVersion
```

A ReportVersion can record its source TemplateVersion.

Later Template changes never mutate the ReportVersion.

---

## Template publication

Published TemplateVersion immutable.

Draft Template editing separate from report finalization.

Do not overbuild if Templates are not in the frozen design.

---

## Section ordering

Use stable section IDs and explicit order.

Do not rely solely on array index as identity.

---

## Section deletion

Deleting a Draft section removes it from Draft configuration.

It must not delete:

* MetricDefinition;
* source record;
* artifact;
* historical finalized Version sections.

---

## Metric removal

Removing a MetricSelection from Draft v4 does not remove the metric from:

* Metric Registry;
* v3 historical report;
* source analytics.

---

## Visualization removal

Same principle.

---

## Draft Version duplication

If user starts v4 from v3:

copy only reusable report configuration.

Do not inherit:

```text
Approval
ReportRelease
ClientDownload
final Snapshot validity
```

---

## Design 132 integration

Builder save updates Draft Version configuration.

Design 132 viewing v4 should invalidate/rebuild Draft preview state as appropriate.

Released v3 remains untouched.

---

## Design 134 integration

Scheduled Report creation should reference an exact reusable report/template configuration policy.

Design 134 must not reach into mutable Builder UI state such as:

> whatever the user currently has open.

---

## Scheduled execution pins configuration

A scheduled generation should know which:

* TemplateVersion;
* Report configuration revision/version;
* source policy;
* metric definitions;
* period policy;

it is supposed to use.

Exact execution architecture is next Design 134.

---

## Client access

No Draft Builder content enters Design 056.

Only explicit approved/released ReportVersion does.

---

## Artifact generation

Builder Preview may render previews.

Official generated artifact remains exact ReportVersion/Snapshot output after appropriate finalization/approval lifecycle.

---

## Preview artifact ≠ released artifact

Absolute.

---

## Activity

Meaningful report creation/finalization can project Activity.

Individual drag/drop/filter/config changes should not flood Project Activity.

---

## Audit

Audit can capture:

* Draft Version creation;
* finalization;
* Template publication if applicable;
* sensitive source scope changes where governance requires.

Do not necessarily Audit every keystroke/drag.

Draft change history/version revisions can remain application/config history.

---

## Observability

Track:

* validation latency/errors;
* preview query latency;
* Snapshot build failures;
* query complexity;
* source adapter errors.

These never become Report business data.

---

## Idempotency

Required for:

* Draft creation;
* configuration commands where retries can duplicate sections/items;
* Preview generation;
* finalization;
* Template publication if applicable.

---

## Stable operation IDs

For adding Builder elements, client-generated stable IDs/idempotency keys can prevent duplicate section creation on network retry.

---

## Caching

Builder caches should vary by:

```text
organizationMembershipId
authorizationRevision
reportVersionId
reportVersionRevision
configurationRevision
ReportSourceRegistry revision
MetricDefinition version set
DimensionRegistry revision
TemplateVersion if applicable
previewRevision
```

---

## Preview cache

Must pin exact:

```text
configurationRevision
```

A Preview generated for revision 18 cannot be presented as current after revision 19.

---

## Performance

Use:

* capability registries;
* cached source metadata;
* bounded searchable pickers;
* debounced validation where appropriate;
* server aggregation for previews;
* lazy preview sections;
* preview query budgets.

Avoid rebuilding the entire large report on every tiny visual-only setting change where not necessary.

---

## Cost/complexity controls

Report Builder can become an expensive query generator.

Server should enforce:

* max dimensions;
* max grouping cardinality;
* query time budgets;
* row limits;
* period limits where applicable;
* asynchronous preview for expensive queries.

---

## Query complexity ≠ validation error universally

Some valid configurations may simply require asynchronous processing.

Keep:

> valid but processing-heavy

separate from:

> semantically invalid.

---

## Partial failure contract

Example:

```text
Draft configuration      ✓
Metric Registry          ✓
Source A                  ✓
Source B                  ✕
```

Correct:

> Draft configuration is available; Source B cannot currently be previewed. Finalization readiness is unknown/blocked according to source requirement policy.

Incorrect:

> Source B contains zero data.

Another:

```text
Configuration valid     ✓
Preview service         ✕
```

Correct:

> Configuration is valid; preview is temporarily unavailable.

Not:

> Report invalid.

Another:

```text
Preview revision 18     ✓
Current config          revision 19
```

Correct:

> Existing preview is stale and does not represent the current Draft.

Not:

> Preview is current.

---

## Backend Requirement Matrix

| Requirement                                             | Status                          |
| ------------------------------------------------------- | ------------------------------- |
| Design 033 canonical Report reuse                       | **Critical**                    |
| Designs 131–132 same ReportVersion reuse                | **Critical**                    |
| No CustomReport parallel domain                         | **Critical**                    |
| Only Draft ReportVersion materially editable            | **Critical**                    |
| Finalized/released Version immutability                 | **Critical**                    |
| DraftReportConfiguration/ReportVersion separation       | **Critical**                    |
| Interactive view state/Builder configuration separation | **Critical**                    |
| Preview/final Snapshot separation                       | **Critical**                    |
| Preview never becomes release evidence                  | **Critical**                    |
| Design 038 MetricDefinition reuse                       | **Critical**                    |
| MetricSelection/MetricDefinition separation             | **Critical**                    |
| Visualization/Metric semantics separation               | **Critical**                    |
| Typed Dimension Registry                                | **Critical**                    |
| Dimension/database-column separation                    | **Critical**                    |
| Typed Filter AST                                        | **Critical**                    |
| No arbitrary SQL/JS/eval                                | **Critical**                    |
| Filter/authorization separation                         | **Critical**                    |
| SourceBinding/source-domain ownership separation        | **Critical**                    |
| Source selection permission-safe                        | **Critical**                    |
| Reauthorization on save/preview/finalize                | **Critical**                    |
| Cross-tenant source binding prohibited                  | **Critical**                    |
| Server-authoritative configuration validation           | **Critical**                    |
| Metric/dimension compatibility validation               | **Critical**                    |
| Visualization compatibility validation                  | **Critical**                    |
| Stable section/visualization identities                 | **Critical**                    |
| Configuration revisioning                               | **Critical**                    |
| Optimistic concurrency                                  | **Critical**                    |
| No blind last-write-wins                                | **Critical**                    |
| Preview pinned to configuration revision                | **Critical**                    |
| Preview stale detection                                 | **Critical**                    |
| Draft/final Snapshot distinction                        | **Critical**                    |
| Fresh validation before finalization                    | **Critical**                    |
| Metric-definition version pinning                       | **Critical**                    |
| Final Snapshot pins exact configuration revision        | **Critical**                    |
| Finalization idempotency                                | **Critical**                    |
| Finalization unknown-outcome reconciliation             | **Critical**                    |
| ReportTemplate/ReportVersion separation                 | **Critical if templates exist** |
| TemplateVersion pinning                                 | **Critical if templates exist** |
| Design 134 ScheduledReportDefinition separation         | **Critical architecture**       |
| Scheduled execution cannot use mutable UI state         | **Critical architecture**       |
| Design 056 Client Draft isolation                       | **Critical**                    |
| Preview artifact/released artifact separation           | **Critical**                    |
| Query complexity/resource limits                        | **Critical**                    |
| Server-side preview aggregation                         | **Critical**                    |
| Audit/observability separation                          | **Required**                    |
| Partial dependency failure handling                     | **Critical**                    |

---

# 8. Consolidation

Design 133 is one of the highest-risk architecture screens because a poorly designed "custom report builder" can accidentally become an unrestricted query system, duplicate Analytics, and destroy report-version immutability.

**Design 033 / Design 133 Report duplication**
Builder creates separate CustomReport identities.

**ReportVersion / Builder configuration conflation**
Version lifecycle and editable configuration become one unstructured blob.

**Draft / finalized Version conflation**
Released reports remain editable.

**Edit released v3 / create Draft v4 conflation**
Client history is rewritten.

**Design 132 interactive filter / Design 133 persistent filter conflation**
Temporary exploration silently changes report definition.

**Interactive ViewState / DraftReportConfiguration conflation**
Personal UI state becomes organizational report truth.

**Preview / final Snapshot conflation**
Approximate/current data becomes frozen evidence.

**Preview success / Finalization success conflation**
Stale preview bypasses fresh validation.

**Preview stale / configuration invalid conflation**
Old preview appears as report error.

**Source binding / DatasetSnapshot conflation**
Query definition becomes frozen data.

**Source binding / copied source data conflation**
Reporting starts owning Project/Distribution/Finance entities.

**Source access / source administration conflation**
Report author gains domain mutation rights.

**Source picker visibility / durable authorization conflation**
Previously visible source remains accessible after permission loss.

**Filter / authorization conflation**
User changes filters to access unauthorized data.

**Filter field / database column conflation**
Internal schema and sensitive fields leak.

**Filter AST / arbitrary SQL conflation**
Builder becomes unsafe database console.

**Typed rule / JavaScript eval conflation**
Arbitrary code execution enters reporting.

**Cross-domain relation / arbitrary join conflation**
Users invent semantically incorrect joins.

**MetricSelection / MetricDefinition conflation**
Selecting a metric lets author redefine it.

**MetricDefinition / visualization conflation**
Changing chart changes metric semantics.

**Metric label / metric identity conflation**
Renaming UI label creates new calculation meaning.

**Custom metric / arbitrary formula conflation**
Unvalidated arithmetic creates misleading reports.

**Metric compatibility / metric availability conflation**
Semantically invalid metric is presented as no data.

**Dimension / database field conflation**
Sensitive fields become group-by options.

**Dimension selection / source access conflation**
Aggregate access permits person-level drill-down.

**Persistent filter / reporting period conflation**
Temporary or fixed date rules become ambiguous.

**Builder period / scheduled cadence conflation**
Design 133 starts owning recurring execution.

**Fixed period / relative scheduled period conflation**
"Previous month" semantics become inconsistent.

**ReportTemplate / ReportVersion conflation**
Template edits alter existing reports.

**Template latest / pinned TemplateVersion conflation**
Historical Report changes after template update.

**Template usage / Template administration conflation**
Report author edits global reusable template.

**Section order / section identity conflation**
Reordering creates/deletes semantic sections.

**Section deletion / metric deletion conflation**
Removing a card removes MetricDefinition globally.

**Visualization deletion / data deletion conflation**
Presentation change alters source data.

**Builder preview / Client report conflation**
Draft values leak to Client.

**Preview artifact / released artifact conflation**
Internal preview PDF appears officially delivered.

**Draft Snapshot / final Snapshot conflation**
Mutable evidence gets treated as immutable.

**Snapshot refresh / UI refresh conflation**
Ordinary page reload changes report data.

**Filter refresh / Snapshot rebuild conflation**
Every interaction mutates evidence.

**Configuration valid / Preview ready conflation**
No preview means invalid report.

**Preview failed / configuration invalid conflation**
Source outage appears as builder error.

**Warning / hard blocker conflation**
Optional compatibility concern prevents valid reports.

**Save state / validation state conflation**
Saved Draft appears semantically valid.

**Autosave / authorization conflation**
Background writes bypass explicit server permission checks.

**Last-write-wins / concurrency control conflation**
Two users silently destroy each other's report config.

**Configuration revision / ReportVersion number conflation**
Every keystroke becomes new ReportVersion.

**Draft config revision / historical ReportVersion conflation**
In-progress edits pollute business version history.

**MetricDefinition update / Draft auto-upgrade conflation**
Draft changes semantic meaning silently.

**MetricDefinition update / finalized report recalculation conflation**
Released report changes retroactively.

**Source change / Builder auto-refresh conflation**
Draft preview changes without trace.

**Source correction / finalized report correction conflation**
Historical report silently updates.

**Raw query capability / Report Builder conflation**
Security, tenancy and semantic integrity collapse.

**Builder / Analytics dashboard conflation**
Design 038 and 133 become competing metric engines.

**Builder / Interactive Detail conflation**
Design 132 and 133 become the same mutable page.

**Builder / Scheduled Reports conflation**
Design 134 becomes duplicated.

**Report configuration / ScheduledReportDefinition conflation**
Recurring rule and report definition become one entity.

**Scheduled Report / mutable Draft conflation**
Next scheduled run changes whenever someone edits Builder.

**Client access / Draft edit conflation**
Client Report release follows Builder automatically.

**Finalize / Approve conflation**
Author bypasses governance.

**Approve / Release conflation**
Builder exposes report immediately.

**Validation cache / final authority conflation**
Stale validation allows invalid finalization.

**Browser-side validator / server validator conflation**
Client manipulates rules.

**Query complexity / semantic invalidity conflation**
Large-but-valid report cannot be processed intelligently.

**High-cardinality dimension / unrestricted query conflation**
Builder can overload backend.

**Browser-side preview / server authorization conflation**
Raw sensitive dataset is sent to browser for local report building.

**Generic `report_config JSON` without schema/version**
No typed validation, migration, or compatibility guarantees.

**Generic `data_source` string**
No source authority/permissions/version semantics.

**Generic `metric_formula` text**
Metric governance disappears.

**Generic `filters` free-form object**
Authorization/query safety collapses.

**Generic `isValid=true`**
Cached frontend boolean becomes finalization authority.

**133/033 duplicate Reporting domain**
Foundation forks.

**133/038 duplicate Metric Registry/formulas**
Report calculations diverge from Analytics.

**133/056 Client Draft leakage**
Portal sees Builder content.

**133/130 duplicate final snapshot logic**
Builder creates final reports independently.

**133/131 duplicate Report identity**
Library and Builder disagree.

**133/132 interactive-state duplication**
Temporary views and permanent config merge.

**133/134 duplicate scheduling**
Builder owns recurrence.

No additional screen is required.

These are **Draft ReportVersion configuration, safe source/metric/dimension registries, typed filters, persistent-vs-interactive state, preview/final Snapshot separation, server-authoritative validation, concurrency, Template boundaries, and scheduled-report handoff requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL DRAFT REPORTVERSION CONFIGURATION, METRIC/DIMENSION SELECTION & VALIDATED REPORT-COMPOSITION ANCHOR**

**Domain directive:**
**Report ≠ ReportVersion ≠ DraftReportConfiguration ≠ ReportSourceBinding ≠ MetricDefinition ≠ MetricSelection ≠ DimensionSelection ≠ PersistentFilterDefinition ≠ ReportSectionDefinition ≠ VisualizationDefinition ≠ DraftPreviewSnapshot ≠ FinalReportDatasetSnapshot ≠ InteractiveReportViewState ≠ ReportTemplate ≠ ScheduledReportDefinition.**

**Foundation directive:**
Design 033 remains the single canonical Reporting domain. Design 133 edits configuration belonging to one exact Draft ReportVersion and never creates a parallel `CustomReport` business entity.

**Draft-only directive:**
material Builder edits are allowed only against an editable Draft ReportVersion. Finalized, Approved, Released, Superseded and historical Versions remain immutable.

**Revision directive:**
changing released v3 requires creation of a new Draft v4; v3's DatasetSnapshot, Approval, artifact, release and Client history remain untouched.

**Configuration directive:**
`DraftReportConfiguration` is a structured, schema-versioned configuration linked to exact ReportVersion identity—not an unrestricted untyped JSON blob.

**Configuration-revision directive:**
Draft configuration maintains its own revision so collaborative edits, preview generation and finalization can pin exactly what configuration was used.

**Concurrency directive:**
Builder writes use optimistic concurrency. Complex Report configuration must never rely on silent last-write-wins.

**Interactive-state directive:**
temporary filters, sorting, grouping and exploration from Design 132 remain `InteractiveReportViewState`; only explicit Builder configuration changes alter Draft ReportVersion behavior.

**Persistent-filter directive:**
Builder filters are typed persistent report configuration and remain distinct from permissions, transient preview filters, and source-domain authorization.

**Query-safety directive:**
the Builder uses allowlisted typed source, metric, dimension, filter and calculation definitions. Arbitrary SQL, JavaScript, eval, raw database columns and executable query expressions are prohibited.

**Source-registry directive:**
one `ReportSourceRegistry` defines supported canonical Reporting source types, authorized dimensions, metric compatibility, snapshot adapters and allowed relationships.

**Source-ownership directive:**
Reporting references Project, Distribution, Finance, Client, Publishing and other domains without copying or becoming owner of those source entities.

**Join directive:**
cross-domain report relationships are predefined and typed. Users cannot invent arbitrary table joins.

**Source-authorization directive:**
source authorization occurs during discovery, selection, save, Preview and finalization. A previously selected source does not remain permanently authorized after permission changes.

**Permission-loss directive:**
loss of source permission makes the Draft restricted/blocked as appropriate; it does not silently delete configuration or substitute zero data.

**Metric-registry directive:**
Design 038 remains the canonical Metric Registry. Design 133 selects MetricDefinitions but cannot redefine their semantics.

**Metric-selection directive:**
`MetricSelection` describes use/presentation of a canonical MetricDefinition in this Draft ReportVersion; it is never a new metric identity.

**Metric-version directive:**
material MetricDefinition/calculation changes are explicitly detected and exact semantic versions are pinned during report snapshot/finalization.

**Dimension directive:**
Report dimensions come from a typed `ReportDimensionDefinition` registry with stable keys, supported operators, sensitivity and source compatibility; they are never raw DB fields.

**Sensitive-dimension directive:**
permission to use aggregated source data does not automatically permit sensitive lower-level grouping dimensions.

**Compatibility directive:**
one `ReportMetricCompatibilityResolver` validates Source + Metric + Dimension + period combinations and returns structured Compatible/Warning/Incompatible/Unknown results.

**Filter directive:**
persistent filters use a bounded typed AST with data-type-safe operators, nesting/clause limits and server validation.

**Filter-security directive:**
filters can only narrow the already-authorized source scope. They can never create or broaden authorization.

**Visualization directive:**
VisualizationDefinition controls representation; MetricDefinition continues to control semantic calculation.

**Visualization-validation directive:**
chart/table configurations are validated against selected Metric/Dimension semantics rather than trusting frontend controls alone.

**Section directive:**
Report sections use stable identities and explicit ordering. Reordering/removing Draft sections never mutates canonical MetricDefinitions, source data, or historical Version content.

**Narrative directive:**
narrative/text configuration is Draft ReportVersion content and remains interpretation of report data rather than metric authority.

**Preview directive:**
`DraftPreviewSnapshot` is explicitly provisional, configuration-revision-bound, replaceable, and never Client-facing or final report evidence.

**Preview-scope directive:**
if preview uses bounded/sample/preaggregated data for performance, that limitation is explicit and can never be mistaken for final Snapshot completeness.

**Preview-staleness directive:**
Preview generated from configuration revision 18 is stale after revision 19 and cannot be shown as current without qualification.

**Preview-failure directive:**
Preview infrastructure/source failure is distinct from invalid Report configuration.

**Final-snapshot directive:**
final ReportDatasetSnapshot is created only through canonical finalization after fresh server validation, source authorization, metric-version pinning and exact reporting-period resolution.

**Fresh-validation directive:**
frontend `isValid`, cached validation and successful Preview are never sufficient to finalize a ReportVersion.

**Snapshot-pinning directive:**
finalization pins one exact Draft configuration revision to one exact immutable DatasetSnapshot.

**Transaction directive:**
the system must never finalize a ReportVersion against a Snapshot built from a different configuration revision.

**Finalization directive:**
finalization remains separate from Approval and Release.

**Idempotency directive:**
Draft creation, duplicate section/item commands where applicable, Preview generation, finalization and Template publication are replay-safe.

**Unknown-outcome directive:**
if finalization may have committed but the response was lost, reconcile the ReportVersion/idempotency key before repeating finalization.

**Template directive:**
if reusable Report Templates exist in the frozen Builder, `ReportTemplate` and immutable `ReportTemplateVersion` remain separate from Report/ReportVersion. ReportVersions pin exact TemplateVersion lineage and never mutate when Templates change later.

**Template-permission directive:**
Template use and Template administration remain separate permissions.

**Scheduled-report directive:**
Design 134 owns recurrence, run execution identity, future period resolution and delivery scheduling. Design 133 only produces reusable report configuration suitable for later scheduling.

**Scheduled-configuration directive:**
a ScheduledReportDefinition must pin an exact stable Report/Template configuration policy; it can never execute "whatever is currently open/edited in the Builder."

**Period directive:**
one-off fixed report periods can be configured here, while recurring relative-period resolution remains governed by Design 134. Arbitrary date scripts are prohibited.

**Builder/detail directive:**
Design 132 explores ReportVersions and Draft/final Snapshots; Design 133 owns permanent Draft configuration. Temporary interactive exploration never silently writes back to Builder configuration.

**Library directive:**
Design 131 continues to discover the same Report/ReportVersion and reflects Draft Version changes through shared canonical projections.

**Client directive:**
Design 056 sees only explicitly released ReportVersions/artifacts. Draft Builder configuration, Preview values and Preview artifacts never become Client-visible through existence alone.

**Artifact directive:**
Builder Preview artifacts and official ReportVersion artifacts remain distinct. Formal generated artifacts continue through Design-030/report lifecycle against an exact finalized Snapshot.

**Authorization directive:**
Builder read, Draft edit, source bind, metric/dimension selection, Preview, finalization, Template use/manage, Approval and Release remain independently server-authorized.

**Tenant directive:**
Report, Version, source bindings, source entities, metrics, dimensions, Templates and Preview/Snapshot data remain strictly tenant-scoped.

**Complexity directive:**
the backend enforces safe report query budgets, dimension/cardinality limits, period limits, filter complexity and asynchronous processing where needed so Custom Reporting cannot become an uncontrolled analytical workload.

**Performance directive:**
use typed registries, cached capability metadata, bounded source pickers, incremental validation, debounced/batched Preview queries, lazy Preview sections and server-side aggregation rather than loading raw source datasets into the browser.

**Accessibility directive:**
Builder composition must have keyboard-accessible alternatives to drag/drop and must not depend exclusively on pointer interaction for section ordering/configuration.

**Activity directive:**
ordinary Builder edits/dragging/filter configuration do not flood platform Activity; meaningful report lifecycle transitions remain source events.

**Audit directive:**
Draft creation, finalization, Template publication and sensitive governed source/configuration actions can produce Audit evidence while keystroke-level editing remains configuration history/telemetry rather than Audit noise.

**Observability directive:**
validation failures, query latency, preview failures and Snapshot-build performance remain operational telemetry and never become report evidence.

**Partial-failure directive:**
Builder configuration, Metric Registry, individual sources, Preview and validation may fail independently. `Unavailable` can never become `0`, `Invalid`, `Compatible`, or Finalization Ready without evidence.

**Future-reuse directive:**
Design **134 — Scheduled Reports / Report Delivery Management** must reuse the canonical Report/ReportVersion configuration produced here and introduce a separate versioned `ScheduledReportDefinition` plus execution/run lineage for recurrence, relative reporting periods, generation, Approval/release policy and delivery. It must never overwrite an existing released ReportVersion each cycle or execute mutable Builder UI state implicitly.

**Overlap directive:**
Designs **030, 033, 038, 056, 130–134** must preserve one continuous **canonical Report → Draft ReportVersion → typed DraftReportConfiguration → authorized source bindings + canonical MetricDefinitions/dimensions/filters/sections → validated Draft Preview → fresh finalization → immutable ReportDatasetSnapshot → finalized/approved/released Version → exact artifact/client access**, while keeping Templates, interactive view state and scheduled execution independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE REPORT BUILDER FOUNDATION — DESIGN-033 CANONICAL REPORT/REPORTVERSION IDENTITY + DRAFT-ONLY STRUCTURED CONFIGURATION + CONFIGURATION REVISIONING/OPTIMISTIC CONCURRENCY + TYPED REPORT SOURCE/RELATION REGISTRY + DESIGN-038 METRIC REGISTRY + SAFE DIMENSION REGISTRY + BOUNDED FILTER AST + SERVER-AUTHORITATIVE COMPATIBILITY/VALIDATION + REVISION-PINNED NON-FINAL PREVIEW + FRESH FINALIZATION INTO EXACT IMMUTABLE SNAPSHOT + OPTIONAL PINNED REPORTTEMPLATEVERSION + DESIGN-134 SEPARATE SCHEDULEDREPORTDEFINITION — AND NEVER ALLOW CUSTOMREPORT ENTITIES, RAW SQL/JS, DATABASE COLUMN NAMES, CLIENT-SIDE `ISVALID`, LIVE PREVIEW VALUES, UI FILTERS, LATEST METRIC/TEMPLATE LOOKUPS, UNSCOPED SOURCE IDS OR MUTABLE SCHEDULED BUILDER STATE TO SUBSTITUTE FOR OR REWRITE CANONICAL REPORTVERSION, CONFIGURATION, SNAPSHOT, METRIC OR RELEASE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **133 / 153** |
| **PASS**                                   |                        **133** |
| **STANDARDIZE decisions**                  |                        **131** |
| **Potential implementation-overlap flags** |                        **124** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**133 / 153 = 86.9% audited.**

### Canonical Report Builder architecture after Design 133

```text
REPORT R-20
     │
     ├── v3 RELEASED
     │
     └── v4 DRAFT
            │
            ↓
    Draft Configuration
            │
      ┌─────┼──────────────┐
      ↓     ↓      ↓       ↓
   Sources Metrics Filters Sections
      │     │      │       │
      └─────┴──────┴───────┘
                  │
                  ↓
             Validation
                  │
           ┌──────┴──────┐
           ↓             ↓
        Preview      Finalization
                         │
                         ↓
                Frozen Snapshot
                         │
                         ↓
                   Finalized v4
```

The strongest Draft/Released rule is now explicit:

```text
Report R-20

v3 = Released
v4 = Draft

Builder edits:
v4 only.

Changing v4
does NOT change:

v3 Snapshot
v3 Approval
v3 PDF
v3 Client Release
```

Temporary exploration and permanent report configuration remain separate:

```text
Design 132:

User filters
Channel = LinkedIn

Temporary view only.

        ≠

Design 133:

Builder defines
Channel IN [LinkedIn]

Persistent Draft
ReportVersion configuration.
```

Preview and final report evidence are also explicitly separated:

```text
Configuration revision 18
        ↓
Preview P-18

User edits report
        ↓
Configuration revision 19

P-18 is now STALE.

Finalization must:

fresh validate revision 19
        ↓
build new exact Snapshot
        ↓
pin revision 19

It must NEVER finalize
from P-18.
```

And the Builder is not an unrestricted database/query system:

```text
Allowed:

Canonical Source Registry
        ↓
Canonical Metrics
        ↓
Allowed Dimensions
        ↓
Typed Filters
        ↓
Validated Query Plan

Not allowed:

Raw SQL
Arbitrary JS / eval
Unknown database columns
Cross-tenant IDs
Unrestricted joins
```

## Next Sequential Audit Target

### **Design 134 — Scheduled Reports / Report Delivery Management**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
