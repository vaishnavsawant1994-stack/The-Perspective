Phase 3A.1 — Master 153-Design Inventory Audit
Design 008 — Lead Finder

The exact frozen identity is:

Design 008 — Lead Finder

This is the first major screen after the initial dashboard family and begins the lead acquisition / prospect discovery layer of the Team Workspace.

Audit field	Classification
Design ID	008
Canonical name	Lead Finder
Product area	Sales / Prospecting / Lead Acquisition
User surface	Team Workspace
Screen class	Discovery / Search / Prospecting Workspace
Classification	Unique Anchor — Discovery Workspace Family
Primary purpose	Discover qualified companies and decision-makers before they become managed CRM leads
Primary entities	Prospect Candidate, Person/Contact Candidate, Company Candidate
Supporting entities	Source, Company, Contact, Lead, Lead List, Search/Filter Definition, Import/Extraction Job, User
Parent shell	InternalAppShell — Design 001
Template family	DiscoveryWorkspaceTemplate
Auth	Required
Permissions	Prospecting / Sales / data-access scoped
Implementation priority	Core / High
Reuse level	High for search/filter/result-selection patterns
1. Functional Responsibility

Design 008 answers:

“Who should we approach next?”

The Lead Finder is positioned before normal CRM management.

Its responsibility is to help authorized users discover potential prospects using criteria such as:

person / executive attributes
company attributes
industry
title / seniority
location
company size
source
relevance or qualification criteria
existing CRM status

The important conceptual boundary is:

External / discovered candidate
            ↓
       Lead Finder
            ↓
  Review / qualification
            ↓
Save / import into CRM
            ↓
Company + Contact + Lead

A search result is therefore not automatically a canonical Lead merely because it appeared in Lead Finder.

2. Why This Distinction Matters

Without this separation, every exploratory search could pollute the production CRM.

For example, a user might search:

CEOs in technology companies in Germany

and receive 500 candidate records.

Those 500 results should not instantly become 500 active CRM leads.

Instead:

500 discovered
      ↓
120 selected
      ↓
85 pass validation/deduplication
      ↓
85 imported
      ↓
canonical CRM records created/linked

This distinction will become important when we later audit:

Design 081 — Lead Sources / Source Management
Design 082 — Data Extraction Jobs / Extraction Runs
Design 083 — Extraction Review / Imported Records
Design 086 — Contact CRM / Contact Directory
Design 089 — Lead Detail / Lead 360

3. Canonical Lead Finder Regions

The approved screen should conceptually normalize into a number of reusable areas without redesigning its visual treatment.

Discovery Query / Search

Supports prospect search criteria and potentially saved search configurations.

Filter System

Potential filters include:

Job Title
Seniority
Department / Function
Industry
Company Size
Geography
Company / Domain
Source
Data availability
CRM presence

The exact supported filters must eventually come from actual source capabilities rather than being invented by the UI.

Discovery Results

Each result may represent:

candidate person
candidate company
source/provenance
relevant attributes
CRM match status
qualification state
Selection / Bulk Actions

Examples:

Select
Add to List
Save to CRM
Start Review / Import

Saved Searches / Lists

Where present in the design, these should reuse canonical saved-query and Lead List concepts rather than duplicate data.

4. Lead Finder Must Not Own the Source System

This separation is important:

Design 008 — Lead Finder

Uses sources to discover prospects.

Design 081 — Lead Sources / Source Management

Configures and manages where discovery data originates.

Therefore:

Lead Source Registry
        ↓
Discovery / acquisition services
        ↓
Lead Finder

Design 008 should not contain a second independent source-configuration system.

5. Lead Finder vs Data Extraction

Another critical distinction:

Lead Finder

Interactive prospect discovery.

Design 082 — Data Extraction Jobs

Bulk/background acquisition processing.

Design 083 — Extraction Review

Review and validation of imported/extracted records.

There may be a relationship such as:

Lead Finder
   ↓
Run/trigger acquisition where required
   ↓
Extraction Job
   ↓
Extraction Review
   ↓
CRM Import

But these remain separate responsibilities.

Consolidation decision

SHARE DATA-ACQUISITION INFRASTRUCTURE — DO NOT MERGE SCREENS.

6. Discovery Result vs Canonical CRM Record

We should establish this requirement now.

A discovery candidate can conceptually look like:

ProspectCandidate
├── candidateId
├── person data
├── company data
├── source
├── discoveredAt
├── provenance
├── confidence / completeness
├── crmMatch
└── importState

Once accepted, the canonical system may create or link:

Company
   ↕
Contact
   ↕
Lead

The Lead Finder should not maintain a permanent competing representation of CRM records after conversion.

7. Deduplication Requirement

This is one of Design 008's most important backend requirements.

Before creating new records, the system needs to determine whether:

the company already exists,
the contact already exists,
an active lead already exists,
the same candidate has already been imported,
the record is present in another Lead List.

Conceptually:

Discovered Candidate
        ↓
Normalization
        ↓
Identity Matching
        ↓
┌──────────────┬───────────────┐
Existing       New
Record         Record
   ↓              ↓
Link/Update     Create

The user should not accidentally create:

John Smith
John Smith
John Smith

as three Contacts because three sources returned the same person.

8. Company Deduplication

Company matching should generally prefer stable identifiers where available, such as:

canonical domain
company identifier
normalized legal/company name + context

rather than relying on display name alone.

For example:

Acme Technologies
Acme Technologies Inc.
ACME Tech

may represent the same company.

That determination belongs to the canonical identity-resolution/import layer, not to UI string comparison.

9. Contact Deduplication

Potential matching signals can include, depending on source reliability:

normalized email
professional profile/source identifier
name + company
name + domain
other stable provider identifiers

The exact algorithm belongs later in data/backend architecture.

Design 008 establishes the requirement that deduplication must exist before CRM creation.

10. Provenance Is Mandatory

Every discovered prospect should retain where it came from.

Conceptually:

Candidate
├── Source
├── Source Record ID
├── Source URL where applicable
├── Discovered At
├── Extraction/Acquisition Method
└── Original evidence/metadata

This becomes important for:

data quality
refreshing
auditing
deduplication
compliance
source troubleshooting

A Contact should never simply appear in the CRM with no indication of origin when the system discovered it automatically.

11. Data Confidence vs Sales Qualification

These are different concepts.

Data confidence

How reliable/complete is the source data?

Sales qualification

How valuable/relevant is this prospect to the business?

For example:

Data Confidence: HIGH
Sales Qualification: LOW

is perfectly valid.

Likewise:

Data Confidence: MEDIUM
Sales Qualification: HIGH

may require enrichment before outreach.

The UI and backend must not collapse these into one generic “score.”

12. Lead Finder vs Lead Qualification

Design 008 helps discover candidates.

It may expose enough information to help users select them, but full lead lifecycle ownership belongs to CRM/Sales workflows after import.

Conceptually:

DISCOVERED
    ↓
SELECTED
    ↓
IMPORTED
    ↓
CRM LEAD
    ↓
QUALIFIED
    ↓
OUTREACH / DEAL

We should avoid creating two independent Lead statuses:

one in Lead Finder and another in CRM.

Use a small candidate/import lifecycle before conversion, then the canonical Lead lifecycle afterward.

13. Reusable Component Mapping

Design 008 introduces a different page family from the dashboards.

Shared global components include:

PageHeader
SearchInput
FilterButton
FilterChip
Dropdown
Checkbox
StatusBadge
Avatar
Pagination
EmptyState
LoadingSkeleton
ErrorState

Lead-discovery-specific composites may include:

ProspectSearchBar
DiscoveryFilterPanel
ProspectResultTable
ProspectResultCard
CompanyCandidateCell
ContactCandidateCell
SourceIndicator
DataCompletenessIndicator
CrmMatchIndicator
BulkSelectionBar
SaveToLeadListAction
ImportToCrmAction

The reusable hierarchy begins:

Design Tokens
      ↓
Search / Filter / Table primitives
      ↓
Discovery Components
      ↓
DiscoveryWorkspaceTemplate
      ↓
Design 008 — Lead Finder
14. New Page-Family Finding

Design 008 introduces our second major routed page family after Dashboards.

So far:

InternalAppShell
│
├── Dashboard Family
│   ├── 003 Executive
│   ├── 004 Sales
│   ├── 005 Editorial
│   ├── 006 Operations
│   └── 007 Finance
│
└── Discovery Workspace Family
    └── 008 Lead Finder

This is exactly why the 153-design audit is useful: we are beginning to reduce 153 visual designs into reusable implementation families.

15. Search Architecture

Lead Finder search should ideally use a canonical query contract.

Conceptually:

ProspectSearchQuery
├── text
├── personFilters
├── companyFilters
├── geographyFilters
├── sourceFilters
├── dataFilters
├── crmStateFilters
├── sort
├── cursor/page
└── pageSize

The UI should not build provider-specific queries directly.

Instead:

Lead Finder UI
      ↓
Discovery Query Service
      ↓
Source/Connector abstraction
      ↓
Normalized candidate results

This allows different source providers or extraction mechanisms to evolve without rewriting the Lead Finder interface.

16. Source Capability Awareness

Not every data source supports every filter.

For example, one source may provide:

company + industry + location

while another provides:

person + job title + company

Therefore the backend needs a capability-aware query system.

The UI should not promise a filter that a selected source cannot actually honor unless the system can emulate it after acquisition.

This will connect strongly to Design 081's source-management architecture.

17. Saved Search Architecture

If searches are saved, we should save the query definition, not the current result list.

Conceptually:

SavedProspectSearch
├── name
├── owner
├── filters/query
├── source scope
├── createdAt
└── lastRunAt

Results may change over time.

This distinction matters because:

Saved Search ≠ Lead List

A Saved Search describes how to discover records.

A Lead List contains selected/canonical records.

Do not merge those concepts.

18. Bulk Actions

Lead Finder naturally supports bulk workflows.

Candidate actions may include:

Select All on Page
Add Selected to List
Import Selected
Assign Owner after import
Start enrichment after import

Bulk operations should use a server-side job/service for larger selections rather than issuing hundreds of browser requests.

Conceptually:

Selected Candidates
       ↓
Bulk Import Request
       ↓
Background Job
       ↓
Normalize
       ↓
Deduplicate
       ↓
Validate
       ↓
Create/Link Records
       ↓
Import Result

This can later reuse infrastructure from Designs 082–083 and 148.

19. Permission Architecture

Potential scopes include:

Sales Admin / Manager

May be able to:

discover broadly
import prospects
create lists
assign ownership
view team prospecting activity
Sales Representative

May be restricted to:

permitted searches
their lists
permitted imports
their resulting leads
Editorial / Operations / Finance users

Should not automatically receive prospecting capability simply because they have Team Workspace access.

Potential permission dimensions eventually include:

lead_finder.read
lead_finder.search
lead_finder.import
lead_finder.bulk_import
lead_finder.export
lead_finder.assign

Exact permission names belong to Phase 3D.

20. Export Is a Separate Permission

This is important for sensitive prospect data.

A user permitted to view Lead Finder results should not automatically be permitted to:

download thousands of records as CSV.

Therefore:

VIEW ≠ EXPORT

Bulk export should have:

separate authorization,
audit logging,
potential record limits,
tenant controls.
21. Compliance / Suppression Awareness

The Lead Finder should be capable of checking canonical suppression or exclusion rules before prospect records are used for outreach.

Examples may include:

unsubscribed/suppressed contact,
do-not-contact state,
blocked domain,
previously excluded record.

The Lead Finder does not need to own all outreach-compliance rules, but it should not knowingly send clearly suppressed records into automated outreach as if nothing were wrong.

This later connects to Outreach workflows.

22. Quick-Action Architecture

Suitable actions can include:

Search Prospects
Save Search
Add to Lead List
Import to CRM
Start Enrichment
Review Import

But each should invoke a canonical capability.

For example:

Import to CRM
      ↓
Canonical Import Service
      ↓
Deduplication
      ↓
Company / Contact / Lead

not browser-side creation of raw CRM records.

23. Responsive Contract
Desktop

Best suited to the full discovery workspace:

search + filter sidebar/panel + dense result table + selection actions

Tablet — Design 152

The interface should adapt with:

condensed filters,
1–2-column layout,
filter drawer/sheet,
priority result attributes,
persistent but touch-friendly bulk actions.
Mobile — Design 151

Results should transform primarily into prospect cards.

Priority content:

Person / Company
Role / Industry
Location
Source / confidence
CRM match
Select / Save

Filters should move to a mobile bottom sheet/full-screen filter experience.

A 12-column desktop prospecting table should not simply be horizontally squeezed onto a 390px screen.

24. State Coverage

Design 008 inherits Design 150 and requires several discovery-specific states:

Initial / Start Search
Search Loading
No Results
No Results After Filters
Partial Source Failure
Source Unavailable
Rate-Limited Source
Already Exists in CRM
Duplicate Candidate
Import In Progress
Import Partially Completed
Permission Restricted
Network Failure

These states have different meanings and should not be represented by one generic error screen.

25. Partial Source Failure

This is particularly important when discovery aggregates multiple sources.

Example:

Source A       ✓ 127 candidates
Source B       ✓ 64 candidates
Source C       ✕ temporarily unavailable

The UI should not necessarily discard the 191 valid candidates.

Instead it can communicate that results are partial.

This connects directly to the system-state architecture established by Design 150.

26. Backend Requirements

Recommended conceptual architecture:

LeadFinder
    ↓
ProspectDiscoveryService
    ↓
Permission / Tenant Scope
    ↓
Source Capability Router
    ↓
┌─────────┬─────────┬─────────┐
Source A  Source B  Source C
└─────────┴─────────┴─────────┘
    ↓
Normalization
    ↓
Deduplication / Identity Matching
    ↓
Candidate Result Model

For CRM conversion:

Selected Candidate
      ↓
Import Service
      ↓
Validation
      ↓
Deduplication
      ↓
Company / Contact / Lead
      ↓
Audit + provenance

Backend classification:

Requirement	Status
Authentication	Required
Tenant isolation	Required
Prospecting RBAC	Required
Source abstraction	Required
Normalization	Required
Deduplication	Critical
Provenance	Critical
Bulk processing	Required
Import idempotency	Critical
Search pagination	Required
Rate-limit handling	Required where external sources exist
Audit logging	Required
Export controls	Required
27. Idempotent Import Requirement

Repeated import actions must not produce duplicate CRM records.

For example:

Candidate C-1048
      ↓
Import clicked
      ↓
network timeout
      ↓
user retries

The safe result should still be:

one canonical imported prospect

rather than:

two Leads + two Contacts

The import service needs an idempotency/identity strategy.

28. Audit Trail

Important acquisition events should be traceable:

Search performed where auditing is required
Candidate selected
Candidate imported
Candidate matched existing CRM record
Bulk import executed
Export performed
Source failure
Import rejected/failed

Particularly sensitive events such as bulk export should feed later into:

Design 138 — System Audit Logs / Compliance Activity

29. Relationship to CRM

The clean architecture is:

DISCOVERY
Design 008 — Lead Finder
        ↓
ACQUISITION / VALIDATION
Designs 081–083
        ↓
CANONICAL CRM
Company / Contact / Lead
Designs 084–089
        ↓
ENGAGEMENT
Outreach / Reply / Meeting / Follow-up
        ↓
COMMERCIAL
Deal / Proposal / Contract

Not every Lead Finder interaction must travel through every screen manually, but those layers should remain architecturally distinct.

30. Relationship to Design 148 — Data Import / Export Administration

Design 008 deals with business-user prospect acquisition.

Design 148 handles platform-level import/export administration across broader data domains.

They may share:

validation infrastructure,
job execution,
import status components,
failure/download results.

But:

Lead Finder must not become the global import administration system.

And Design 148 should not replace the prospecting UX.

31. Main Implementation Risks

This audit identifies several significant risks:

CRM pollution
Every search result becoming a Lead automatically.

Duplicate records
Missing identity matching across sources.

Provider coupling
Lead Finder UI written specifically around one source.

Lost provenance
No record of where discovered data came from.

Data-confidence confusion
Treating data quality and sales qualification as one score.

Permission leakage
Unauthorized staff accessing/exporting prospect datasets.

Bulk-operation fragility
Hundreds of direct client-side create requests.

Partial failure masking
A failed source appearing as “zero results.”

Status duplication
Maintaining separate discovery and CRM Lead lifecycles after import.

Saved-search/List confusion
Treating dynamic queries as static CRM lists.

These require architectural safeguards, not another design.

Design 008 Audit Verdict
PASS — UNIQUE DISCOVERY WORKSPACE ANCHOR

Template directive: Design 008 establishes the reusable DiscoveryWorkspaceTemplate family rather than extending the Dashboard family.

Data directive: Discovered candidates remain temporary/acquisition-layer records until explicitly accepted into canonical CRM.

Identity directive: Deduplication and identity resolution are mandatory before Company, Contact or Lead creation.

Source directive: Lead Finder consumes an abstract source/discovery layer; it does not own source configuration.

Provenance directive: Automatically discovered/imported records retain source and acquisition metadata.

Permission directive: Search, import, bulk import and export must support separate authorization.

Responsive directive: Desktop result tables adapt to touch-friendly tablet layouts and mobile candidate cards rather than simply shrinking.

Consolidation directive: STANDARDIZE WITH THE FUTURE DISCOVERY/IMPORT INFRASTRUCTURE — DO NOT MERGE WITH LEAD SOURCES, EXTRACTION JOBS, EXTRACTION REVIEW, OR CRM.

Phase 3A.1 — Running Audit
Result	Count
Audited	8 / 153
PASS	8
STANDARDIZE decisions	6
MERGE screen candidates	0
FIX BEFORE CODE	0
New designs	0
Canonical implementation families discovered
Authenticated Presentation
│
├── 001 InternalAppShell
│   │
│   ├── Dashboard Family
│   │   ├── 003 Executive / Admin
│   │   ├── 004 Sales
│   │   ├── 005 Editorial
│   │   ├── 006 Operations
│   │   └── 007 Finance
│   │
│   └── Discovery Workspace Family
│       └── 008 Lead Finder
│
└── 002 ClientPortalShell

So after only eight designs, we have already reduced six routed screens into two principal reusable page families plus two application shells, without eliminating any approved screen.

