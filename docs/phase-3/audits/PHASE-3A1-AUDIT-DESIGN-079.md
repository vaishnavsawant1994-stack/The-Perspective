# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 079 — Global Search / Universal Search Workspace

Design 079 should become the **canonical Team Workspace cross-domain discovery surface** for locating authorized canonical records across the platform without creating a second business-data model.

Its governing boundary is:

> **SearchQuery ≠ SearchResult ≠ CanonicalEntity ≠ SearchIndexDocument ≠ Authorization ≠ SavedSearch/View ≠ RecentSearch ≠ PersonalWork ≠ Navigation.**

The central implementation rule is:

> **Search may discover canonical entities, but it never becomes their source of truth. SearchIndexDocuments and SearchResults are projections optimized for retrieval. Every result must remain tied to a canonical source entity, every query must respect current tenant/resource authorization, and opening a result must perform fresh source-domain authorization regardless of what the search index previously contained.**

---

# 1. Classification

| Audit field                          | Classification                                                                                                                     |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                        | **079**                                                                                                                            |
| **Canonical name**                   | **Global Search / Universal Search Workspace**                                                                                     |
| **Product area**                     | Team Workspace / Discovery / Cross-Domain Retrieval                                                                                |
| **User surface**                     | **Authenticated Team Workspace**                                                                                                   |
| **Screen class**                     | Universal Search / Cross-Domain Discovery Workspace                                                                                |
| **Classification**                   | **Cross-Domain Search & Authorized Discovery Anchor**                                                                              |
| **Primary purpose**                  | Let the authenticated Team member locate authorized entities and records across canonical platform domains from one search surface |
| **Primary query concept**            | **SearchQuery**                                                                                                                    |
| **Primary result concept**           | **SearchResult**                                                                                                                   |
| **Index concept**                    | **SearchIndexDocument**                                                                                                            |
| **Canonical source**                 | Existing source-domain entities only                                                                                               |
| **Authorization dependency**         | Designs 037 + each source domain's resource policy                                                                                 |
| **Personal Work dependency**         | Design 078 — explicitly separate                                                                                                   |
| **Notification dependency**          | Design 080 later — explicitly separate                                                                                             |
| **Saved-view relationship**          | SavedSearch / SavedView if already supported by frozen design                                                                      |
| **Recent-search relationship**       | RecentSearch / SearchHistory if present                                                                                            |
| **Primary search service**           | `UniversalSearchService`                                                                                                           |
| **Indexing service**                 | `SearchIndexingService`                                                                                                            |
| **Authorization projection service** | `SearchAuthorizationResolver`                                                                                                      |
| **Parent shell**                     | `InternalAppShell` — Design 001                                                                                                    |
| **Auth**                             | Required                                                                                                                           |
| **Tenant scope**                     | Current authorized Organization / Workspace context                                                                                |
| **Implementation priority**          | **Critical Platform Discovery / Permission Isolation / Navigation Integrity**                                                      |
| **Reuse level**                      | **Extremely High across nearly every previously audited canonical domain**                                                         |

Design 079 should answer:

> **“Given what I typed and what I am currently authorized to see in this workspace, which canonical records are relevant, what kind of records are they, what safe summary can be shown, and where can I navigate to inspect the actual source entity?”**

Conceptually:

```text
User SearchQuery
      ↓
query parsing / normalization
      ↓
authorized search scope
      ↓
Search Index / Search Adapters
      ↓
SearchResult projection
      ↓
canonical source references
      ↓
Design 079
      ↓
open result
      ↓
fresh source authorization
      ↓
canonical detail surface
```

---

# 2. Reuse

## Search must reuse canonical domain identities

Design 079 can search across domains such as:

* Leads
* Companies
* Contacts
* Deals
* Proposals
* Contracts
* Invoices
* Clients
* Projects
* Tasks
* Meetings
* Approvals
* Assets
* Publications
* Distribution
* Reports
* Conversations
* Team members

but it must never create alternate versions of those records.

Do **not** create:

```text
SearchLead
SearchProject
SearchContract
SearchClient
SearchTask
```

as independent business entities.

---

## SearchResult is not the source entity

Correct:

```text
SearchResult
→ sourceType = CONTRACT
→ sourceId = C-101
```

Then the Contract domain remains authoritative.

SearchResult contains only enough information for:

* ranking,
* safe summary,
* result display,
* navigation.

---

## SearchIndexDocument is also not the source entity

Correct architecture:

```text
CanonicalEntity
      ↓
index projector
      ↓
SearchIndexDocument
```

Never:

```text
SearchIndexDocument
      ↓
edited by application
      ↓
canonical business truth
```

---

## Reuse Design 078 only as a separate discovery context

Design 078 answers:

> What work requires me?

Design 079 answers:

> What authorized records can I find?

Permanent:

```text
Search relevance
≠
personal responsibility
```

A highly relevant Project result should not appear in My Work merely because the user searched for it.

---

## Design 079 ≠ Design 080 Notifications

A Search Result is pulled by user intent.

A Notification is pushed/generated by a system event.

They are separate attention systems.

---

## Search ≠ Navigation registry

The search surface may include navigational destinations if frozen design supports them.

But:

```text
SearchResult
≠
RouteDefinition
```

Routing remains Phase 3B and the application navigation registry remains separate.

---

## Search should reuse source-domain labels and safe metadata

If the Contract domain calls something:

> Contract Version 3

the search result should not invent a different unrelated state taxonomy.

Likewise:

* Project state
* Invoice state
* Approval state
* Client name
* Lead status

should come from canonical projections/resolvers.

---

## Reuse canonical permission architecture

Design 037 remains the platform authorization foundation.

But each source domain still owns resource-level authorization.

Universal Search must not build one giant simplistic permission model such as:

```text
if user.canSearchEverything
```

that bypasses domain-specific rules.

---

# 3. Entities

## SearchQuery

`SearchQuery` is the user's expressed retrieval intent.

Conceptually:

```text
SearchQuery
├── raw input
├── normalized query
├── filters
├── active workspace context
├── requested entity types
├── pagination cursor
└── sort/ranking preferences
```

It does not become a persistent business object unless explicitly saved.

---

## Raw query ≠ normalized query

Example:

```text
Raw:
"  ACME contract  "

Normalized:
"acme contract"
```

Normalization can support retrieval.

The original user input may still be retained transiently for display/history where appropriate.

---

## SearchQuery ≠ SavedSearch

A one-time search is not automatically saved.

---

## SearchQuery ≠ RecentSearch

RecentSearch is optional history metadata about what the user searched previously.

It is not the live query itself.

---

## SearchQuery ≠ Filter/View definition

If the user searches:

> overdue Acme invoices

that does not automatically create a persistent Saved View.

---

## SearchResult

Conceptually:

```text
SearchResult
├── sourceType
├── sourceId
├── sourceRevision where useful
├── safe title
├── safe subtitle/context
├── result category
├── source status projection
├── result highlights
├── ranking score
├── access/navigation capability
└── freshness metadata
```

It remains a projection.

---

## SearchResult ≠ CanonicalEntity

Permanent.

If:

```text
SearchResult
title = "Acme Renewal Contract"
```

that title is only a projection of the Contract's canonical title/name.

Editing the result must not alter the Contract unless routed into the canonical Contract workflow.

---

## SearchResult should preserve source identity

Every result must have a stable canonical reference such as:

```text
sourceType = PROJECT
sourceId = P-201
```

or another typed discriminated source reference.

Avoid opaque result IDs that cannot be traced back reliably.

---

## Search result type must be governed

Do not use arbitrary client-supplied strings like:

```text
type = "anything"
```

Use a registered set of supported search source types.

---

## CanonicalEntity ≠ SearchIndexDocument

`CanonicalEntity` owns business state.

`SearchIndexDocument` owns retrieval representation.

Example:

```text
Project P-101
      ↓
SearchIndexDocument
{
  title,
  clientName,
  searchable terms,
  safe status,
  tenant/security fields,
  updatedAt
}
```

The Project remains authoritative.

---

## SearchIndexDocument can be denormalized

That is acceptable.

It may include duplicated safe fields for fast retrieval.

But the duplication must be:

* source-derived,
* rebuildable,
* disposable,
* revision-aware.

---

## SearchIndexDocument should never contain hidden internal fields merely for convenience

If the user is not permitted to see:

* internal legal note,
* Client confidential comment,
* private message,
* unreleased Draft,
* hidden Proof,
* restricted Finance note,

then indexing that content into a user-queryable search index can create leakage risk.

---

## Indexing permission metadata ≠ final authorization

The index may store tenant/resource visibility metadata to prune results.

But:

> **Index filtering is defense-in-depth, not the final authorization decision.**

Opening the canonical result still reauthorizes against the source domain.

---

## SearchIndexDocument may be stale

Critical:

```text
Canonical Project:
access revoked at 10:05

Search index:
still contains document from 10:03
```

The stale document must not allow the user to read the Project.

---

## Search result existence ≠ current access entitlement

A result can be stale between indexing and query time.

The query pipeline must current-authorize or safely post-filter server-side.

---

## Search result snippet is itself sensitive

Even if opening a result reauthorizes, leaking a title/snippet before authorization can expose sensitive data.

Therefore:

> **Authorization must occur before any sensitive result metadata is returned.**

---

## SearchIndexDocument deletion ≠ CanonicalEntity deletion

If an index rebuild removes a document accidentally:

the canonical record still exists.

---

## CanonicalEntity deletion/archive ≠ immediate physical index guarantee

Search must tolerate temporary lag but should reconcile quickly.

Archived/deleted entities should follow source-specific discoverability rules.

---

## SearchResult ranking score ≠ business priority

A high search rank means:

> relevant to this query.

It does not mean:

* high Task priority,
* high-risk Project,
* important Client,
* urgent Deal.

---

## Search relevance ≠ My Work actionability

Permanent.

---

## Search relevance ≠ authorization level

High textual relevance never overrides permissions.

---

## Search count ≠ exact global database count

Critical.

If Design 079 displays:

> 327 results

that may mean:

* indexed authorized matches,
* approximate total,
* capped result estimate,
* post-filtered count.

Unless the architecture explicitly guarantees exactness, do not claim an exact global database count.

---

## `totalResults` semantics must be documented

Conceptually one of:

```text
EXACT
APPROXIMATE
CAPPED
UNKNOWN
```

or equivalent behavior.

No misleading count claims.

---

## Search result highlight ≠ stored canonical text

Highlighting can be generated from:

* safe indexed text,
* source-derived snippets.

It must not expose hidden surrounding content.

---

## SearchIndexDocument should carry source revision/freshness information where practical

Example:

```text
sourceRevision = 42
indexedAt = ...
sourceUpdatedAt = ...
```

This helps detect stale index data.

---

## SavedSearch ≠ SavedView necessarily

A SavedSearch can preserve:

* text query,
* entity filters.

A SavedView can represent a structured domain-specific view.

Do not force both into one model unless deliberately standardized.

---

## RecentSearch ≠ audit record

A user's recent search list is personal convenience/history.

It should not automatically be treated as a security AuditEvent.

---

## RecentSearch can be sensitive

Search terms may include:

* Client names,
* invoices,
* personnel,
* confidential projects.

Retention and visibility should be limited appropriately.

---

## Navigation ≠ SearchResult

A result may carry a canonical navigation target descriptor.

But navigation remains application routing logic.

Search should not generate arbitrary URLs from indexed data.

---

## Search entity result ≠ command palette action

If the frozen design includes actions/commands, keep navigation/commands typed and registered.

Do not allow arbitrary executable actions sourced from search documents.

---

# 4. Permissions

Design 079 is one of the highest-risk read surfaces because it spans many domains.

Authorization should conceptually evaluate:

```text
Authenticated User
+
active OrganizationMembership
+
current workspace
+
source-domain visibility
+
resource-level authorization
+
field/snippet visibility
```

before returning each result.

---

## Search scope must come from session context

Do not trust:

```text
?organizationId=some-other-org
```

from the browser to define tenant scope.

---

## Multi-organization safety

If one User belongs to several Organizations:

Search should operate only within the currently authorized workspace context unless the product explicitly has a global cross-workspace surface.

No such new surface is introduced here.

---

## Search filters cannot expand access

A user filtering by:

> All Contracts

still sees only Contracts they can access.

---

## Result category access

Users may have permission to search:

* Projects,
* Clients,

but not:

* Finance,
* Audit,
* Team,
* Contracts.

The search service must respect source category permissions.

---

## Resource-level permission must still apply

Having permission:

```text
projects.read
```

may still not imply access to every Project if resource scopes exist.

---

## Search index tenant filter is not enough

Two projects in the same Organization can still have different restricted access.

Index documents need enough visibility metadata for efficient filtering, but final source authorization remains authoritative.

---

## Search snippet field-level privacy

A user may be allowed to know:

> Contract C-101 exists

without seeing:

> €500,000 termination penalty.

Search DTOs must use safe field projections.

---

## Search should not index Client-internal/private content broadly

Examples that require strict treatment:

* internal Client support notes,
* internal-only Drafts,
* unreleased Proofs,
* private Conversations,
* restricted invoices,
* Audit metadata,
* secure settings/secrets.

---

## InternalNote must remain excluded

Design 074's InternalNote isolation applies to search too.

Client/internal-only communication should not leak through universal search.

---

## Message search must be conversation-authorized

If Messages become searchable:

current ConversationParticipant authorization must be checked.

Same Organization membership is insufficient.

---

## Invoice search must be Finance-authorized

Design 071 principles apply.

---

## Contract search must preserve legal-access boundaries

Design 070 principles apply.

---

## Approval search must preserve participant/source permissions

Search visibility does not imply decision authority.

---

## Asset search must preserve file permissions

Search must not expose:

* restricted filenames,
* thumbnails,
* file previews

if the user cannot access the underlying Asset/FileVersion.

---

## Audit search requires dedicated permission

Design 039 remains high-sensitivity.

Do not mix Audit events into universal results for ordinary users.

---

## Team/person search

Searchable employee/member metadata must respect people-directory policy.

Do not expose private HR/security attributes.

---

## Search history is user-private by default

Another normal user should not be able to inspect someone else's RecentSearch list.

Manager/admin access, if ever required, would need explicit policy.

---

## Saved Search visibility

Personal SavedSearch should normally be owned by the current user unless shared-view functionality is explicitly modeled.

Do not infer sharing here.

---

## Opening result must reauthorize

Critical flow:

```text
SearchResult returned at T1
      ↓
permissions change
      ↓
user opens result at T2
      ↓
source detail endpoint reauthorizes
```

A previously returned result never becomes a durable access ticket.

---

## Search result cache must be permission-safe

Do not share cached result sets across:

* users,
* memberships,
* role/scope revisions.

---

## Search count must not leak unauthorized population size

A dangerous implementation:

```text
global matches = 500
authorized results returned = 3
```

while UI says:

> 500 results

can leak existence of restricted records.

Counts must be permission-aware.

---

# 5. States

Design 079 should separate **query lifecycle, result availability, index freshness, authorization filtering, count semantics, and source availability**.

### Search query state

```text
Idle
Typing
Ready
Searching
Completed
Failed
```

### Result state

```text
Results Available
No Results
Filter No Results
Partial Results
Result Removed / No Longer Accessible
```

### Index/source health

```text
Index Current
Index Updating
Index Stale
Search Source Partially Unavailable
Search Service Unavailable
```

### Count state

```text
Exact Count
Approximate Count
Capped Count
Count Unavailable
```

if the frozen design exposes counts.

### Result freshness/action state

```text
Current
Possibly Stale
Source Updated
Access Changed
Source Unavailable
```

These should not become one `search.status`.

---

## Empty query ≠ no results

Permanent.

The system should distinguish:

```text
no query entered
```

from:

```text
query entered, no matches
```

---

## No results ≠ search service failure

Critical.

---

## No results ≠ permission failure globally

The user should not necessarily learn:

> There are matches, but you are unauthorized.

That can leak record existence.

A safe result may simply be no authorized matches.

---

## Partial source failure ≠ zero matches for that source

Example:

```text
Projects  ✓
Clients   ✓
Contracts ✕
Invoices  ✓
```

Do not claim:

> No Contracts found.

Represent partial search availability if frozen design supports it.

---

## Index stale ≠ source deleted

Permanent.

---

## Index miss ≠ canonical entity absence

An entity can exist before indexing catches up.

---

## Result returned ≠ source still accessible forever

Permanent.

---

## Result access revoked while search remains open

The result may disappear or fail safely on open.

It should never continue exposing sensitive details after refresh.

---

## Search count unavailable ≠ zero

Permanent.

---

## Approximate count ≠ exact count

Permanent.

---

## Filtered count ≠ global count

Permanent.

---

## Ranking change ≠ business state change

Search reordering can happen without any canonical entity mutation.

---

## Search history unavailable ≠ no search history

If RecentSearch service fails, do not misleadingly show an empty history if the UI differentiates service failure.

---

## Saved search missing ≠ query failure

Separate.

---

## State Coverage

Design 079 inherits Design 150 plus:

```text
Search Idle
Search Typing
Search Submitting
Search In Progress

Search Results Available
No Authorized Results
No Results for Current Filters

Search Partial Results
Search Service Unavailable
Search Index Updating
Search Index Stale

Result Current
Result Possibly Stale
Result Source Updated
Result No Longer Accessible
Result Source Unavailable

Exact Result Count
Approximate Result Count
Capped Result Count
Result Count Unavailable

Recent Searches Available
Recent Searches Unavailable

Saved Search Available
Saved Search Unavailable

Source Category Restricted
Source Category Temporarily Unavailable
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize fast cross-domain discovery while preserving entity type/context.

Conceptually:

```text
Global Search
↓
Search Input
↓
Filters / category selectors if frozen
↓
Results
    ├── entity type
    ├── title
    ├── safe context
    ├── canonical source status
    ├── highlights
    └── open result
```

Only frozen-design controls should render.

---

## Result type must remain obvious

A result named:

> Acme

could represent:

* Company,
* Client,
* Project,
* Contract,
* Lead.

The result should expose enough safe type/context to avoid ambiguity.

---

## Desktop should not flatten every entity into identical metadata

Search can standardize layout.

It should not pretend:

* Contract status,
* Project health,
* Invoice state,
* Task status

are one universal domain field.

---

## Filters should narrow search, not redefine authorization

UI filtering by:

* entity type,
* date,
* status,

must operate inside the already-authorized search scope.

---

## Tablet

Following Design 152:

* result metadata compacts,
* category/type remains visible,
* filters collapse appropriately,
* long context strings wrap safely,
* keyboard/search interaction stays usable.

---

## Mobile

Priority:

```text
Search
↓
Query
↓
Result Card
   ├── entity type
   ├── title
   ├── safe context
   ├── state
   └── open
↓
Next result
```

No desktop-style wide result grid.

---

## Mobile search ergonomics

Search field should:

* use proper input semantics,
* preserve query while opening/returning where appropriate,
* avoid accidental reset on keyboard close,
* show loading state accessibly.

---

## Highlights

Do not render unsafe raw HTML around matching terms.

Use sanitized/structured highlight segments.

---

## Long titles

Long:

* Contract titles,
* Project names,
* Client names,

should wrap/truncate safely without hiding result type.

---

## Accessibility

A result should communicate something equivalent to:

> Contract. Acme Media Partnership Agreement. Acme Corporation. Status: awaiting signature. Open Contract.

where authorized.

---

## Keyboard navigation

Desktop search should support predictable:

* focus into search field,
* result traversal,
* filter traversal,
* Enter/open behavior,

without bypassing standard accessibility patterns.

---

## Screen readers

Result type, title, state and context should be announced in meaningful order.

Do not rely solely on icons/colors to indicate result category.

---

# 7. Backend Requirements

## Search architecture

```text
Design 079
    ↓
Authenticated Workspace Context
    ↓
UniversalSearchService
    │
    ├── Query Parser
    ├── Search Scope Resolver
    ├── Authorization Filter
    ├── Search Engine / Source Adapters
    ├── Ranking
    ├── Safe Highlighting
    ├── Count Semantics
    └── Result Projection
    ↓
SearchResult[]
```

---

## Source indexing architecture

```text
Canonical Domain Event / Source Update
       ↓
Search Index Projector
       ↓
SearchIndexDocument
       ↓
Search backend/index
```

The index should be rebuildable from canonical sources.

---

## Search Source Registry

A governed registry should conceptually define:

```text
SearchSourceDefinition
├── sourceType
├── canonical repository/service
├── index projector
├── safe searchable fields
├── safe display fields
├── authorization resolver
├── ranking configuration
└── navigation target descriptor
```

This is backend architecture, not a new UI screen.

---

## Do not build one giant SearchEntity table

Avoid:

```text
SearchEntity
{
  id,
  type,
  name,
  status,
  owner,
  dataJson
}
```

as the platform's actual operational backend.

An index/read model is acceptable.

A replacement business model is not.

---

## Index documents should be disposable/rebuildable

If the search index is lost:

rebuild from canonical source domains.

The system should not lose business records.

---

## Index updates should be idempotent

Repeated domain events should not create duplicate search documents.

Use stable identity conceptually:

```text
tenant/workspace
+
sourceType
+
sourceId
```

---

## Index update ordering

Out-of-order events must not overwrite newer index state with stale source snapshots.

Useful controls:

* source revision,
* event sequence,
* updatedAt checks.

---

## Deletion/tombstone events

When a canonical source is:

* deleted,
* archived,
* access-restricted,

the search projection should update accordingly.

---

## Permission changes require search visibility refresh

Not only source content changes matter.

Events such as:

```text
MembershipRoleChanged
ProjectScopeChanged
ConversationParticipantRemoved
ContractAccessRevoked
```

can affect what Search should return.

Search cannot assume indexed visibility remains correct forever.

---

## Two viable authorization models

### Model A — Query-time authorization

Search returns candidate IDs, then server authorization filters each candidate.

Advantages:

* strongest freshness.

Costs:

* may be expensive at scale.

### Model B — Security metadata in index + final reauthorization

Index stores:

* tenant,
* membership/role/resource-scope metadata,
* visibility classes,

for efficient pruning, then the server reauthorizes returned candidates.

Likely more scalable.

The invariant matters more than exact implementation:

> unauthorized result metadata must not be returned.

---

## Avoid browser-side filtering

Dangerous:

```text
server returns 100 matches
browser filters unauthorized 80
```

This leaks data.

Filtering must occur server-side.

---

## Result projection should be permission-aware

A source adapter returns only safe result fields.

Conceptually:

```text
projectSearchProjection(project, viewer)
```

not:

```text
fullProjectDTO
→ browser hides fields
```

---

## Search query normalization

Potential handling:

* case folding,
* whitespace normalization,
* tokenization,
* accent normalization,

according to language/search backend.

Do not mutate canonical source values.

---

## Fuzzy search

If fuzzy matching is supported, ranking can tolerate typos.

But fuzzy matching must not broaden authorization.

---

## Search filters

Filters should be typed:

```text
entityTypes
status
date range
owner
context
```

where frozen design supports them.

Reject unknown/unsafe fields rather than arbitrary query-to-database injection.

---

## Query parser injection safety

Search input must never become raw:

* SQL,
* Elasticsearch DSL,
* regex,
* full-text query syntax

without safe escaping/parser control.

---

## Regex denial-of-service

If regex-like search features exist internally, guard against pathological expressions.

No need to expose regex to user.

---

## Ranking

Ranking may combine:

* textual relevance,
* recency,
* exact match,
* entity importance,
* user's context.

But it must not alter canonical business priority.

---

## Personalization

If ranking is personalized, personalization must not disclose unauthorized data or create cross-user cache contamination.

No new personalized ranking feature is required.

---

## Search freshness

Useful metadata:

```text
indexedAt
sourceUpdatedAt
sourceRevision
```

can help detect lag.

---

## Fresh open flow

When user opens a result:

```text
SearchResult(sourceType, sourceId)
       ↓
canonical source detail service
       ↓
fresh authorization
       ↓
canonical entity
```

Never:

```text
SearchResult snapshot
→ treated as source detail
```

---

## Result count semantics

The backend should explicitly know whether counts are:

* exact,
* approximate,
* capped.

This may come from the search engine.

The UI must not overstate certainty.

---

## Permission-aware counting

Count unauthorized candidates only after safe filtering/authorization semantics.

Do not leak hidden population size.

---

## Pagination

Prefer stable cursor/search-after semantics for large result sets.

Offset pagination can be acceptable for smaller result sets but becomes unstable as ranking/index changes.

---

## Search result deduplication

The same canonical entity should not appear multiple times merely because several index documents represent:

* title,
* attachment,
* related metadata,

unless the UI deliberately supports nested matches.

Primary result dedup should use canonical entity identity.

---

## Distinct entities with same name must not collapse

Example:

```text
Acme Corp — Company
Acme Renewal — Deal
Acme — Client account
```

Text similarity is not identity.

---

## Search child-content hit

If matching content resides in a child entity, the result can include safe context:

```text
Message match
→ Conversation C1
```

or:

```text
Attachment match
→ Project P1
```

But source/result identity must remain explicit.

---

## SavedSearch persistence

If frozen design includes it:

```text
SavedSearch
├── owner membership/user
├── query
├── filters
├── createdAt
└── updatedAt
```

It stores the search definition, not frozen result membership.

---

## Running SavedSearch later must reauthorize

A saved query from last month cannot bypass current permissions.

---

## RecentSearch persistence

If used:

* minimal retention,
* user-scoped,
* privacy-aware,
* deletable according to product policy.

---

## Search telemetry

Analytics can capture:

* query performance,
* no-result rate,
* result clicks,

but should avoid unnecessary retention of raw sensitive queries.

---

## Search Audit

Ordinary searches usually should not create heavy Design 039 Audit events.

Searches involving highly sensitive audit/security datasets may have separate policy.

No broad query logging should accidentally become a privacy problem.

---

## Partial-source strategy

UniversalSearchService can return:

```text
results
+
sourceHealth
+
partialFailure metadata
```

where relevant.

This avoids falsely claiming no matches from a failing source.

---

## N+1 prevention

Do not fetch every source entity separately after search if 100 results are returned.

Use:

* indexed safe result summaries,
* batched reauthorization,
* batched source enrichment where required.

---

## Search cache

Cache must vary by:

```text
organizationMembershipId
authorization revision
query/filter
search index revision/freshness
```

Not only raw query text.

---

## Cache after permission change

Role/scope revocation must invalidate or bypass stale cached search responses.

---

## Index isolation

If using an external search engine:

tenant/security isolation must be designed explicitly.

Do not depend only on obscurity of document IDs.

---

## Search engine outage

Canonical application remains operational.

Search can degrade while:

* direct navigation,
* source list/detail screens

still work.

Search is not the system-of-record dependency.

---

## Reindexing

Full reindex should be:

* resumable,
* idempotent,
* safe for live traffic,
* permission-aware.

---

## Backend Requirement Matrix

| Requirement                                  | Status                                |
| -------------------------------------------- | ------------------------------------- |
| Authenticated Team Workspace                 | **Critical**                          |
| Active OrganizationMembership                | **Critical**                          |
| Session-derived tenant scope                 | **Critical**                          |
| UniversalSearchService                       | **Critical**                          |
| SearchQuery/CanonicalEntity separation       | **Critical**                          |
| SearchResult/CanonicalEntity separation      | **Critical**                          |
| SearchIndexDocument/source truth separation  | **Critical**                          |
| No giant operational SearchEntity model      | **Critical**                          |
| Typed Search Source Registry                 | **Critical**                          |
| Canonical source reference on every result   | **Critical**                          |
| Index rebuildability                         | **Critical**                          |
| Idempotent indexing                          | **Critical**                          |
| Revision/out-of-order protection             | **Critical**                          |
| Canonical delete/archive propagation         | **Critical**                          |
| Permission-change visibility propagation     | **Critical**                          |
| Server-side authorization filtering          | **Critical**                          |
| No browser-side security filtering           | **Critical**                          |
| Field/snippet permission filtering           | **Critical**                          |
| Tenant isolation in search index             | **Critical**                          |
| Resource-scope authorization                 | **Critical**                          |
| Fresh authorization on result open           | **Critical**                          |
| Search index stale-data protection           | **Critical**                          |
| Sensitive-content indexing policy            | **Critical**                          |
| InternalNote search exclusion                | **Critical**                          |
| Message conversation-level authorization     | **Critical**                          |
| Finance/Contract/Audit search policy         | **Critical**                          |
| Asset/thumbnail authorization                | **Critical**                          |
| Safe query parsing/escaping                  | **Critical**                          |
| Search DSL/SQL injection protection          | **Critical**                          |
| Fuzzy search authorization preservation      | **Critical**                          |
| Typed filters                                | **Required**                          |
| Ranking/business-priority separation         | **Critical**                          |
| PersonalWork/search separation               | **Critical**                          |
| Notification/search separation               | **Critical**                          |
| Navigation/search separation                 | **Critical**                          |
| Permission-aware result counts               | **Critical**                          |
| Exact/approximate/capped count semantics     | **Critical**                          |
| Canonical result deduplication               | **Critical**                          |
| Stable pagination/search-after               | **Required at scale**                 |
| SavedSearch reruns reauthorize               | **Critical if saved search exists**   |
| RecentSearch privacy isolation               | **Critical if recent history exists** |
| Permission-safe caching                      | **Critical**                          |
| Cache invalidation on authorization revision | **Critical**                          |
| Partial-source failure representation        | **Required**                          |
| Search-engine outage degradation             | **Required**                          |
| Resumable/idempotent reindexing              | **Required at scale**                 |
| Search telemetry privacy controls            | **Required**                          |
| N+1/batched authorization protection         | **Critical**                          |

---

# 8. Consolidation

Design 079 exposes several major cross-domain architectural risks.

**SearchResult / CanonicalEntity conflation**
Search projection becomes editable business truth.

**SearchIndexDocument / source record conflation**
Search engine becomes system of record.

**Universal SearchEntity mega-model**
All domain entities are flattened into one weak generic schema.

**Index deletion / source deletion conflation**
Search outage/loss destroys business data.

**Canonical source update / immediate index truth conflation**
Index lag is ignored.

**Stale index / current access conflation**
Revoked resources remain visible/searchable.

**Index-level ACL / final authorization conflation**
Stale security metadata grants access.

**Source authorization only on open**
Sensitive title/snippet leaks before detail authorization.

**Browser-side filtering**
Unauthorized records are delivered to the client and merely hidden.

**Tenant filter / resource authorization conflation**
Same-organization restricted resources leak.

**Search category permission / resource permission conflation**
Can search Projects becomes can see every Project.

**SearchResult existence / entitlement conflation**
Finding result becomes access token.

**Search rank / business priority conflation**
Highly relevant result is treated as high-priority work.

**Search relevance / My Work conflation**
Design 079 populates Design 078 automatically.

**Search / Notifications conflation**
Pull-based discovery and push-based attention become one system.

**Search / Navigation registry conflation**
Indexed route text becomes executable navigation definition.

**Search result URL / arbitrary redirect conflation**
Search document injects unsafe route/URL.

**Search count / exact database count conflation**
Approximate index estimate is presented as authoritative total.

**Global count / authorized count conflation**
Result count leaks hidden records.

**No-result / permission denial conflation**
User learns restricted records exist.

**No-result / source failure conflation**
Search outage appears as empty database.

**Index miss / entity absence conflation**
Recently created source record appears nonexistent.

**Index stale / entity deleted conflation**
Old search document is treated as valid source.

**Search snippet / harmless metadata conflation**
Confidential information leaks through snippets.

**InternalNote / searchable Message conflation**
Private team communication leaks through universal search.

**Conversation membership / Organization membership conflation**
Private Messages appear in search.

**Invoice category access / Finance authority conflation**
Search exposes billing data to non-Finance users.

**Contract search / legal access conflation**
Restricted agreement metadata leaks.

**Audit search / generic employee search conflation**
Sensitive Audit events become broadly discoverable.

**Asset name / Asset access conflation**
Confidential filenames/thumbnails leak.

**SavedSearch / SavedResultSet conflation**
Saved query freezes stale/unauthorized records.

**SavedSearch / SavedView conflation**
Different concepts become one unstructured query blob.

**RecentSearch / Audit conflation**
Personal search history becomes permanent compliance log.

**RecentSearch / shared history conflation**
Users see each other's confidential queries.

**Query parser / raw database query conflation**
User input becomes SQL/search-engine DSL injection.

**Regex/fuzzy matching / access expansion conflation**
Broader matching bypasses authorization.

**Highlight / raw HTML conflation**
Search result becomes XSS vector.

**Ranking score / source status conflation**
Retrieval score is displayed/stored as business state.

**Cross-source duplicate documents / duplicate entities**
One canonical entity appears multiple times.

**Text-based dedupe / identity dedupe conflation**
Different Acme records collapse because names match.

**Search child match / parent identity conflation**
Attachment/message hit is attributed to wrong source entity.

**Cached query / current permission conflation**
Old search response survives role revocation.

**Cache keyed only by query**
One user's result set leaks to another.

**External search engine / security boundary conflation**
Tenant isolation depends solely on document naming.

**Search engine outage / platform outage conflation**
Users cannot navigate canonical lists because search became required infrastructure.

**Reindex job / live mutation conflation**
Index rebuild writes back to canonical data.

**079/078 duplicate attention semantics**
Search results become work items.

**079/080 duplicate notification semantics**
Search index becomes alert store.

**079/source domains duplicate business models**
Every canonical entity gets a second operational representation.

No additional screen is required.

These are **cross-domain retrieval, indexing, source identity, permission filtering, stale-data safety, privacy, result-count semantics, ranking, caching, and navigation integrity requirements**.

---

# 9. Implementation Verdict

## **PASS — AUTHORIZED CROSS-DOMAIN SEARCH, INDEX & CANONICAL ENTITY DISCOVERY ANCHOR**

**Domain directive:**
**SearchQuery ≠ SearchResult ≠ CanonicalEntity ≠ SearchIndexDocument ≠ Authorization ≠ SavedSearch/View ≠ RecentSearch ≠ PersonalWork ≠ Navigation.**

**Canonical-source directive:**
every search result references an existing canonical source entity. Design 079 never becomes another CRM, Project, Contract, Invoice, Task, Message, or Client backend.

**Index directive:**
SearchIndexDocument is a disposable, denormalized, rebuildable read projection optimized for retrieval. It never owns business lifecycle or becomes system of record.

**Identity directive:**
every indexed/searchable result carries a typed canonical source identity sufficient to deduplicate, reauthorize and navigate to the actual source domain.

**Source-registry directive:**
searchable domains are governed through typed Search Source adapters/registry that define safe searchable fields, result projection, authorization and navigation metadata rather than arbitrary JSON indexing.

**Authorization directive:**
search results are server-filtered using current workspace, resource and field-level authorization before sensitive metadata is returned. Browser-side hiding is prohibited as a security mechanism.

**Tenant directive:**
the active OrganizationMembership from the authenticated session defines search tenant/workspace scope. Browser-provided organization IDs cannot expand it.

**Freshness directive:**
index documents may be stale; therefore index visibility is never the final access decision. Current source authorization remains authoritative.

**Open-result directive:**
opening any SearchResult performs fresh canonical source authorization. A previously returned result is never a persistent access credential.

**Snippet directive:**
titles, subtitles, highlights, thumbnails and snippets are themselves protected data and must come from permission-safe source/index projections.

**Internal-content directive:**
internal notes, unreleased content, private conversations, sensitive Finance/legal/Audit material and restricted files are excluded or specially authorized according to their canonical domain policies.

**Index-security directive:**
tenant/resource security metadata may be stored in the search index for efficient pruning, but stale index ACL metadata cannot replace current source-domain permission checks.

**Count directive:**
result counts are permission-aware and explicitly exact, approximate, capped or unavailable according to backend guarantees. Global unauthorized match counts must never leak through the UI.

**Ranking directive:**
search ranking expresses query relevance only. It does not become Task priority, Deal value, Project urgency, risk severity or personal actionability.

**My Work directive:**
Design 078 remains the personal responsibility/actionability system. Search relevance never creates or completes personal work.

**Notification directive:**
Design 080 remains the push-attention/event system. Search documents/results never become Notification records.

**Navigation directive:**
SearchResult may expose a typed canonical navigation target, but application route definitions remain outside the search index. Arbitrary stored URLs/commands are prohibited.

**Saved-search directive:**
if frozen functionality includes SavedSearch, it stores query/filter definition only. Every future run re-evaluates current authorization rather than replaying a stale result set.

**Recent-search directive:**
RecentSearch remains personal convenience metadata, not Audit or authorization history, and should receive privacy-conscious retention and access controls.

**Indexing directive:**
canonical source changes and permission changes update/invalidate search projections through idempotent, revision-aware indexing. Out-of-order events cannot overwrite newer indexed state.

**Rebuild directive:**
the entire search index must be rebuildable from canonical source domains. Losing or rebuilding search infrastructure can reduce discovery capability but never destroy business records.

**Search-query directive:**
user query text and filters are parsed through controlled typed search APIs. Raw SQL, raw search-engine DSL and unsanitized executable query syntax are prohibited.

**Highlight directive:**
match highlighting uses safe structured text/sanitization and never renders arbitrary indexed HTML.

**Dedup directive:**
result deduplication uses canonical source identity, not textual similarity. Distinct entities with similar names remain distinct.

**Partial-failure directive:**
if one source/index partition fails while others succeed, Design 079 exposes partial search availability rather than claiming that the failed domain contains zero authorized matches.

**Caching directive:**
search caching varies by OrganizationMembership, authorization revision, query/filter state and relevant index revision. Role/scope changes invalidate or bypass stale cached results.

**Performance directive:**
Design 079 should use indexed safe summaries, batched authorization/enrichment, stable pagination and permission-aware ranking rather than executing N+1 source-detail queries or loading broad organization datasets into the browser.

**Search-engine directive:**
an external search engine is an optimization layer, not a trust boundary or canonical store. Search-engine outage degrades Universal Search while canonical application records and direct source screens remain operational.

**Audit/privacy directive:**
ordinary search activity does not need heavy platform Audit logging, and raw sensitive query terms should not be retained indefinitely merely for analytics.

**Future-reuse directive:**
all later CRM, Project, Publishing, Distribution, Reporting, Administration and Operations screens should become searchable through the same source-adapter/index architecture rather than implementing independent global-search systems.

**Overlap directive:**
Designs **001, 011, 014–040, 078–080 and the later CRM/Project/Publishing/Reporting/Admin surfaces** should ultimately feed one authorized universal search projection without surrendering canonical source identity or source-domain authorization.

**Consolidation directive:**
**STANDARDIZE ONE UNIVERSAL SEARCH LAYER — AUTHENTICATED WORKSPACE CONTEXT + TYPED SEARCH SOURCE REGISTRY + REBUILDABLE SEARCHINDEXDOCUMENTS + CANONICAL SOURCE REFERENCES + SERVER-SIDE PERMISSION/FIELD FILTERING + SAFE QUERY PARSING + RELEVANCE RANKING + PERMISSION-AWARE COUNTS + CURRENT-SOURCE REAUTHORIZATION ON OPEN — WHILE KEEPING SEARCHQUERY, SEARCHRESULT, INDEX DOCUMENTS, SAVED/RECENT SEARCH, PERSONAL WORK, NOTIFICATIONS, NAVIGATION AND EVERY CANONICAL BUSINESS ENTITY STRICTLY SEPARATE. SEARCH MAY DISCOVER THE PLATFORM; IT MUST NEVER BECOME THE PLATFORM'S SOURCE OF TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **79 / 153** |
| **PASS**                                   |                         **79** |
| **STANDARDIZE decisions**                  |                         **77** |
| **Potential implementation-overlap flags** |                         **70** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**79 / 153 = 51.6% audited.**

### Canonical Universal Search architecture after Design 079

```text
                  CANONICAL SOURCE DOMAINS
                           │
     ┌────────────┬────────┼─────────┬─────────────┐
     ↓            ↓        ↓         ↓             ↓
   Leads       Clients   Projects  Contracts     Tasks ...
     │            │        │         │             │
     └────────────┴────────┼─────────┴─────────────┘
                           ↓
                 Search Source Registry
                           │
                           ↓
                  Index Projection Layer
                           │
                           ↓
                 SearchIndexDocument
                    READ PROJECTION
                           │
                           ↓
                    Search Engine
                           │
                           ↓
                  Candidate Results
                           │
                           ↓
               Current Authorization
                           │
                           ↓
                    SearchResult[]
                           │
                           ↓
                      Design 079
                           │
                           ↓
                    Open Result
                           │
                           ↓
              Fresh Source Authorization
                           │
                           ↓
                 Canonical Detail Screen
```

And the most important security invariant remains:

```text
Search index says:
“User may see Project P101”

          ↓

Current source authorization says:
“Access was revoked”

          ↓

RESULT MUST NOT GRANT ACCESS
```

The index can accelerate discovery.

It never outranks current authorization.

## Next Sequential Audit Target

### **Design 080 — Team Notifications Center**

The next audit should preserve the notification boundary:

> **DomainEvent ≠ NotificationRecord ≠ Recipient ≠ NotificationType ≠ ReadState ≠ DeliveryAttempt ≠ DeliveryChannel ≠ NotificationPreference ≠ ClientAction/WorkItem ≠ ActivityEvent ≠ AuditEvent.**

It should reconcile the notification infrastructure already established in Designs **061 and 064** with the authenticated Team Workspace while preserving:

* notification ≠ personal work,
* read ≠ source action completed,
* dismissal ≠ source deletion,
* delivery ≠ read,
* one source event can produce multiple recipient-specific NotificationRecords,
* recipient authorization must be checked before notification generation and again before sensitive deep-link access,
* mandatory/security notifications cannot be suppressed by ordinary preferences,
* notification provider failure must not corrupt in-app notification truth,
* no second notification backend for Team Workspace.

The sequence continues strictly with **Design 080 only next**, under the unchanged audit contract.
