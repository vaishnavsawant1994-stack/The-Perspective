# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 065 — Client Media Projects / Media Center

Its frozen identity is locked. The previously supplied route annotation **`/client/media`** is also locked, but exact route architecture remains a **Phase 3B** concern and is not being re-decided here.

Design 065 should become the **canonical Client Portal cross-media discovery and portfolio surface** for media-related Projects that the current Portal member is authorized to see.

Its governing boundary is:

> **Project ≠ MediaProjectProjection ≠ EditorialProject ≠ MagazineIssue ≠ PodcastEpisode/Production ≠ VideoProject ≠ Event ≠ Publication ≠ Deliverable ≠ ClientMediaSummary.**

The most important implementation principle is:

> **Design 065 aggregates and normalizes Client-safe summaries from the canonical Project and specialized production domains. It must never become a second Project database, a second production workflow engine, or a generic “MediaProject” entity that replaces Magazine, Podcast, Video, Editorial, or Event identities.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                                                      |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **065**                                                                                                                                                                             |
| **Canonical name**                    | **Client Media Projects / Media Center**                                                                                                                                            |
| **Product area**                      | Client Portal / Media / Project Portfolio                                                                                                                                           |
| **User surface**                      | **Client Portal**                                                                                                                                                                   |
| **Screen class**                      | Cross-Media Discovery / Portfolio Workspace                                                                                                                                         |
| **Classification**                    | **Portal Collection Anchor — Client Media Portfolio & Cross-Production Discovery Family**                                                                                           |
| **Primary purpose**                   | Let authorized Clients discover and inspect their media engagements across Magazine, Editorial, Podcast, Video and Event production without exposing internal production complexity |
| **Canonical project entity**          | **Project** — Design 023                                                                                                                                                            |
| **Cross-media projection**            | **MediaProjectProjection / ClientMediaSummary**                                                                                                                                     |
| **Editorial dependency**              | EditorialProject — Design 024                                                                                                                                                       |
| **Magazine dependency**               | MagazineIssue / production — Design 025                                                                                                                                             |
| **Podcast dependency**                | Podcast production / Episode concepts — Design 026                                                                                                                                  |
| **Video dependency**                  | VideoProject — Design 027                                                                                                                                                           |
| **Event dependency**                  | Event / EventOccurrence — Design 028                                                                                                                                                |
| **Publication dependency**            | Design 031                                                                                                                                                                          |
| **Distribution dependency**           | Design 032                                                                                                                                                                          |
| **Deliverable dependency**            | Designs 030 / 051                                                                                                                                                                   |
| **Generic Client Project collection** | Design 042                                                                                                                                                                          |
| **Generic Client Project detail**     | Design 043                                                                                                                                                                          |
| **Media detail dependency**           | Next Design 066                                                                                                                                                                     |
| **Parent shell**                      | `ClientPortalShell` — Design 002                                                                                                                                                    |
| **Primary read model**                | `ClientMediaCenterView`                                                                                                                                                             |
| **Summary model**                     | `ClientMediaSummary`                                                                                                                                                                |
| **Template family**                   | `ClientMediaPortfolioTemplate`                                                                                                                                                      |
| **Auth**                              | Required                                                                                                                                                                            |
| **Authorization**                     | Active Portal membership + Client/account scope + Project/media resource entitlement                                                                                                |
| **Implementation priority**           | **High Client Delivery / Media Portfolio Discovery**                                                                                                                                |
| **Reuse level**                       | **Extremely High with Designs 023–028 and 042–043**                                                                                                                                 |

Design 065 should answer:

> **“Which media Projects and productions can I access, what type of media is each one, where is each engagement in its Client-visible lifecycle, what major deliverables or releases exist, and which media item should I open for deeper detail?”**

Canonical architecture:

```text
                         PROJECT
                       Design 023
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
   EditorialProject   Media production    Event context
      Design 024          domains          Design 028
                      ┌─────┼─────┐
                      ↓     ↓     ↓
                  Magazine Podcast Video
                    025     026    027
                           │
                           ↓
                Client-safe media mapping
                           │
                           ↓
                 ClientMediaSummary
                           │
                           ↓
                  DESIGN 065 MEDIA CENTER
```

---

# 2. Reuse

## Design 023 remains the canonical Project foundation

Every media engagement that belongs to the Project system should continue to use the canonical `Project` identity established by Design 023.

Design 065 must not create:

```text
ClientMediaProject
PortalMediaProject
MediaProjectV2
```

as another Project truth.

Correct:

```text
Project P-101
     │
     ├── Magazine production context
     └── ClientMediaSummary projection
```

---

## Design 065 ≠ Design 042

This distinction is critical.

### Design 042 — My Projects

Broad Client Project discovery:

> Which Projects can I access?

### Design 065 — Media Center

Media-focused Client discovery:

> Which media productions, releases and media-specific Project experiences can I access?

Therefore:

```text
Design 042
general Project collection

        ≠

Design 065
cross-media portfolio projection
```

They can show some of the same Project identities without becoming duplicate Project records.

---

## The same Project may appear in both 042 and 065

Example:

```text
Project P-101
“Executive Personal Magazine”

Design 042:
generic Project summary

Design 065:
media-oriented Magazine summary
```

Both must reconcile:

* Project identity,
* Client-safe status,
* access,
* dates,
* Project title.

The media summary can add specialized media context.

---

## Design 065 ≠ Design 066

### Design 065

Cross-media collection/discovery.

### Design 066

Client Media Project Detail.

Expected architecture:

```text
Design 065
Media portfolio / collection
        ↓
selected media Project
        ↓
Design 066
Media-specific Client detail
```

One canonical Project/production backend.

No merge decision now.

---

## Reuse Design 024 for Editorial

Editorial-specific facts such as:

* Draft lifecycle,
* editorial readiness,
* Questionnaire connection,
* Client review,

remain Design 024 domain truth.

Design 065 only receives Client-safe summary information.

---

## Reuse Design 025 for Magazine production

Magazine-specific facts remain canonical:

```text
MagazineIssue
ReaderBuild
Cover/Page design
Proof versions
Publication readiness
```

Design 065 should not reproduce those as generic media fields.

---

## Reuse Design 026 for Podcast

Podcast-specific identities such as:

```text
Show
Episode
RecordingSession
MediaVersion
Transcript
```

remain Podcast domain concepts.

Design 065 receives a safe summary only.

---

## Reuse Design 027 for Video

Video production concepts such as:

* VideoProject,
* Shoot,
* FootageAsset,
* VideoVersion,

remain canonical there.

---

## Reuse Design 028 for Events

Event-specific:

* Event,
* EventOccurrence,
* Session,
* Registration,
* Attendance,

remain Event domain truth.

A media portfolio card does not become Event operations.

---

## Reuse Publishing rather than copying live-release state

If the media item is published:

Design 065 should consume Design 031 Publication truth.

Correct:

```text
MagazineIssue
     ↓
Publication
     ↓
Verified/current release summary
     ↓
ClientMediaSummary
```

Not:

```text
mediaProject.isPublished = true
```

as independently maintained truth.

---

## Reuse Distribution

Distribution state, where shown, comes from Design 032/055.

A Media Center card should not calculate distribution completion independently.

---

## Reuse Asset/Deliverable infrastructure

Cover images, thumbnails, artwork, final files or media previews—if present in the frozen design—should reuse:

```text
Asset
FileVersion
Deliverable
```

from Designs 030/051.

Design 065 does not own media-file storage.

---

# 3. Entities

## Project ≠ MediaProjectProjection

`Project` is the source business/work identity.

`MediaProjectProjection` is a cross-media read model.

Conceptually:

```text
MediaProjectProjection
├── projectId
├── client-safe title
├── media type
├── safe status
├── progress summary
├── representative visual
├── primary specialized resource reference
├── publication summary
└── current Client action summary
```

Exact fields belong to Phase 3D.

It should not become independently mutable.

---

## MediaProjectProjection should ideally be derived

Dangerous:

```text
media_projects table
├── own status
├── own title
├── own progress
└── own publication state
```

if those values duplicate canonical Project/production domains.

Prefer:

```text
Project
+
specialized production
+
Client-safe status resolver
        ↓
MediaProjectProjection
```

---

## Projection ≠ polymorphic mega-domain

Do not solve cross-media composition by creating:

```text
MediaProject {
  magazineFields...
  podcastFields...
  videoFields...
  eventFields...
}
```

with dozens of nullable columns.

That would flatten distinct production models into one fragile object.

---

## Project type ≠ production entity

A Project may be classified:

```text
MAGAZINE
PODCAST
VIDEO
EVENT
EDITORIAL
```

for discovery.

But the type is not the specialized resource itself.

Example:

```text
project.type = PODCAST
```

does not replace:

```text
PodcastProject / Episode / RecordingSession
```

---

## Project ≠ EditorialProject

Design 024's EditorialProject represents editorial-production specialization.

It may be linked to Project:

```text
Project
  ↓
EditorialProject
```

but they remain distinct identities.

---

## EditorialProject ≠ Draft

An Editorial media card cannot use the latest Draft as the Project identity.

Draft remains a versioned artifact within Editorial production.

---

## Project ≠ MagazineIssue

A Project could conceptually produce:

```text
MagazineIssue A
MagazineIssue B
```

depending on product structure.

Therefore avoid:

```text
project == magazineIssue
```

as a universal architectural assumption.

---

## MagazineIssue ≠ Publication

A finished MagazineIssue can exist before publication.

Permanent:

> **Produced media ≠ released media.**

---

## MagazineIssue ≠ ReaderBuild

ReaderBuild is a specific built artifact/version.

It does not become the Issue identity.

---

## Project ≠ Podcast Episode automatically

One Podcast-oriented Project may encompass:

* one Episode,
* multiple recordings,
* multiple derived assets,

depending on product design.

Do not make `Project.id` and `Episode.id` interchangeable.

---

## Podcast production ≠ Publication

An approved Episode/media version remains production output until a canonical Publication occurs.

---

## Project ≠ VideoProject automatically

They may have a one-to-one relationship in some workflows, but identity remains explicit.

Never rely on coincidental one-to-one cardinality as entity equivalence.

---

## VideoVersion ≠ VideoProject

Design 065 should not display:

> latest video version

as though it were the Project itself.

---

## Project ≠ Event

Event has its own temporal/operational identity.

A Project may organize an Event, but the Project does not replace EventOccurrence/Session truth.

---

## Event ≠ EventOccurrence

If a recurring/multi-date Event exists:

the media summary must not flatten all occurrences into one ambiguous date.

---

## MediaProjectProjection ≠ Deliverable

Deliverable is something released/handed to the Client.

MediaProjectProjection represents the overall engagement summary.

Example:

```text
Media Project:
Executive Magazine

Deliverables:
├── Final PDF
├── Reader link
└── cover artwork
```

---

## Deliverable ≠ Asset

Deliverable is business-release designation.

Asset/FileVersion is content/file infrastructure.

Design 051 already established this.

---

## Deliverable ≠ Publication

A Client can receive a final file without it being publicly published.

Similarly, something can be published without exposing every production-source deliverable.

---

## ClientMediaSummary ≠ Project status

`ClientMediaSummary` should carry a mapped safe presentation of Project/production state.

It must not introduce another status machine.

---

## Internal Project status ≠ Client-facing media status

Internal:

```text
DESIGN_QA
EDITORIAL_REVISION
WAITING_INTERNAL
```

may map to:

```text
In production
```

for the Client.

Use centralized Client-safe state mapping.

---

## Client media status mapping should be governed

Designs 041–044 already require centralized Client status mapping.

Design 065 should reuse or extend the same policy rather than inventing media-card-only labels.

---

## Specialized production state may enrich Project state

Example:

```text
Project:
ACTIVE

Magazine production:
CLIENT_PROOF_REVIEW

Client Media Summary:
“Design review”
```

The summary can be derived from the most relevant safe production context.

But the source states remain canonical.

---

## Media progress ≠ Project progress automatically

Do not show:

```text
70%
```

from arbitrary internal-stage count.

The existing canonical Project progress resolver should remain authoritative.

If the media-specific production has a more relevant Client-safe progress model, the relationship must be explicit.

No decorative progress math.

---

## Progress ≠ readiness

A Project can show 90% progress but still fail publication readiness because a required approval is missing.

Keep separate.

---

## Production-ready ≠ published

Design 055 invariant continues here.

A Media Center card must not display:

> Live

just because the production domain says ready.

---

## Published ≠ distributed

A media item's primary publication can be complete while distribution is still in progress.

---

## Published ≠ final deliverables downloaded

Client download/receipt remains separate.

---

## Publication status should derive from canonical Publication

If card shows:

```text
Published
Scheduled
Live
```

source should be Publication/Verification state, not media-production status.

---

## Live ≠ provider accepted

Where a live-link indicator exists, use canonical verified Placement/Publication state.

---

## Media type ≠ delivery channel

A Podcast is a media/production type.

Spotify, YouTube, Website, Newsletter etc. are Publication/Distribution targets/channels.

Do not mix them into one enum.

---

## Representative image ≠ production source file

A card thumbnail can be a derivative:

```text
Cover Asset
→ Client-safe thumbnail derivative
```

Do not expose original high-resolution/source files just because a card needs a visual.

---

## Thumbnail lineage

If media imagery changes between versions:

Design 065 can show a current Client-approved representative image.

Historical artifacts remain version-pinned elsewhere.

---

## ClientMediaSummary should carry source references

Conceptually:

```text
ClientMediaSummary
├── projectId
├── specializedType
├── specializedEntityId
├── client status
├── progress
├── publication reference
├── representative asset reference
└── current action references
```

This enables Design 066 to navigate without guessing identity.

---

## One Project may have several media outputs

Architecture should not assume one media output forever.

Potentially:

```text
Project P1
├── MagazineIssue
├── PodcastEpisode
└── VideoAsset
```

if bundled engagements exist.

The Media Center may choose:

* Project-level summary,
* media-output-level summaries,

according to the frozen design.

This audit does **not** change the frozen presentation.

The backend must simply avoid identity assumptions that make bundled media impossible.

---

## If card granularity is Project-level

Then:

```text
one ClientMediaSummary
→ Project
→ multiple media production references
```

is valid.

---

## If card granularity is media-output-level

Then each summary must still retain its canonical parent Project.

Do not create an independent media record without Project lineage.

---

## ClientMediaSummary ≠ database entity necessarily

It is best treated as a query/read projection unless Phase 3D finds a clear materialization need.

Even if materialized for performance, canonical source ownership remains elsewhere.

---

## Client Action ≠ media status

A Project may display:

> Design review

and separately:

> Action required: Approve proof.

The action comes from Design 047/052.

Do not encode “action required” as a Project lifecycle state.

---

## Questionnaire ≠ media Project

Design 067 later provides the Questionnaire library.

The Media Center may show Questionnaire-related action/status, but the Questionnaire remains its own domain.

---

## Draft ≠ media Project

Design 068 later surfaces Drafts Library.

The media card can summarize drafting progress without becoming Draft storage.

---

## Proof ≠ media Project

Design 069 likewise handles Designs/Proofs.

A Media Center card cannot become the review artifact itself.

---

## Contract/Invoice ≠ media Project

Even when a media Project is commercially linked:

Contract and Invoice remain independent canonical domains.

Do not add their status to media Project truth.

---

# 4. Permissions

Authorization should evaluate:

```text
Portal membership
+
Client/account scope
+
Project entitlement
+
specialized media-resource visibility
+
Client-safe subresource policy
```

---

## Same Client ≠ same Media Center

Different Portal members may see different media Projects.

Example:

```text
CEO
→ all authorized media engagements

Marketing Director
→ magazine + podcast Projects

Finance-only user
→ potentially no Media Center Projects
```

Design 065 must be recipient/member scoped.

---

## Design 042 Project access rules should reconcile

If a Project is visible in 042 and media-eligible:

Design 065 should not contradict its Project entitlement.

But media-specific subresources may still have additional restrictions.

---

## Project access ≠ every specialized artifact

A Client may see:

> Podcast Project

without access to:

* raw recording,
* internal transcript,
* internal edit versions.

---

## Project access ≠ production source files

Internal:

* Adobe project files,
* raw footage,
* source design files,
* audio stems,

remain protected unless explicitly released as Deliverables.

---

## Project access ≠ all media versions

Only deliberately Client-visible/released versions should appear.

---

## Media Center read ≠ review authority

Seeing a Draft/Proof status does not mean the user may comment/approve.

Formal permissions remain Designs 049/050/052.

---

## Media Center read ≠ publication authority

Design 065 should not grant:

```text
publishNow
retryPublication
changeDistribution
```

simply because the Project is visible.

---

## Media Center read ≠ download authority

Seeing a final thumbnail does not imply source-file/download access.

---

## Media Center read ≠ Contract/Finance access

Do not leak:

* package price,
* Invoice balance,
* Contract terms,

through media summaries unless the current user independently has those permissions and the frozen UI requires them.

---

## Specialized-resource authorization

If one Project has multiple media outputs:

the query needs to determine which specialized outputs are Client-visible to this membership.

Do not return all then filter in React.

---

## Search/filter authorization

If Design 065 includes media-type/search filters:

authorization runs before filtering.

The result set should never reveal hidden Project titles or media types.

---

## Thumbnail authorization

A card image itself can leak confidential content.

Only return Client-visible Asset derivatives.

---

## Live-link authorization

If a card shows a live publication link:

use Design 055/072 safe placement permissions.

Do not expose embargoed/private links.

---

## Historical completed media

Completed/archived Projects may remain visible according to Portal policy.

Completion does not imply public visibility.

---

# 5. States

Design 065 should keep Project, production, delivery, and action states distinct.

### Collection/query states

```text
Media Center Loading
Media Projects Available
No Media Projects
No Results for Filters
Loading More
Load More Failed
```

### Project-level Client states

Conceptually:

```text
Planning
In Production
Awaiting Client Input
In Review
Ready for Release
Completed
Archived
```

only as centralized Client-safe mappings, not a new canonical enum.

### Specialized media states

Internally remain domain-specific:

```text
Editorial state
Magazine state
Podcast state
Video state
Event state
```

### Publication states

```text
Not Published
Scheduled
Publishing
Published
Verified Live
```

from canonical Publishing.

### Client action state

```text
No Action Required
Action Required
Action Completed
Action Unavailable / Restricted
```

from canonical resolver.

These must not become one `mediaProject.status`.

---

## No Media Projects ≠ no Projects

A Client may have:

* consulting/workflow Projects,
* commercial records,
* other non-media Projects,

without anything qualifying for Media Center.

---

## No Media Projects ≠ service unavailable

Successful empty result and query failure remain separate.

---

## In Production ≠ ready to publish

Permanent.

---

## Ready to Publish ≠ scheduled

Eligibility does not imply a schedule exists.

---

## Scheduled ≠ live

Permanent.

---

## Published ≠ verified live if verification is pending

Use Design 031/055 semantics.

---

## Completed ≠ archived

A Project can be completed yet still available in Media Center.

Archival/access policy is separate.

---

## Project completed ≠ Publication removed

Historical Publications may remain accessible.

---

## Action required ≠ Project blocked automatically

A Client approval may be pending, but whether the Project is formally blocked is Project workflow truth.

---

## One subdomain failure ≠ Media Center failure

Example:

```text
Projects           ✓
Magazine summaries ✓
Podcast service    ✕
Video summaries    ✓
Publication        ✓
```

The Media Center should preserve known data and identify localized unavailable media context where possible.

---

## Thumbnail failure ≠ media Project missing

Use fallback visual safely.

Do not hide Project because representative Asset failed.

---

## Publication service unavailable ≠ production incomplete

If Publication summary cannot load:

show publication state unavailable rather than guessing:

> Not published.

---

## Action resolver unavailable ≠ no action required

Unknown is not none.

Critical:

```text
action data unavailable
≠
no action required
```

---

## Progress unavailable ≠ 0%

Do not coerce missing progress to zero.

---

## State Coverage

Design 065 inherits Design 150 plus:

```text
Media Center Loading
Media Center Available

No Media Projects
No Results for Filters

Media Project Available
Media Summary Partially Available

Representative Asset Loading
Representative Asset Unavailable

Project Status Available
Project Progress Unavailable

Publication Scheduled
Publication Processing
Publication Verified Live
Publication State Unavailable

Client Action Required
No Client Action Required
Client Action State Unavailable

Specialized Media Data Unavailable
Project Restricted
Project Access Revoked

Older Media Loading
Older Media Load Failed

Partial Media Service Failure
```

Again, these are separate dimensions.

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize cross-media discovery rather than production administration.

Conceptually:

```text
Media Center
↓
Portfolio Summary / Filters if frozen
↓
Media Project Grid/List
    ├── representative image
    ├── Project/media title
    ├── media type
    ├── Client-safe status
    ├── progress where frozen
    ├── publication/live summary
    ├── Client action indicator
    └── Open Media Project
```

The exact frozen composition remains unchanged.

---

## Desktop must avoid internal workflow density

Do not expose:

* full Editorial stage boards,
* raw production task lists,
* render jobs,
* shoot logistics,
* event run-of-show.

Design 065 is a Client portfolio surface.

---

## Tablet

Following Design 152:

* multi-column cards reduce cleanly,
* thumbnails remain proportional,
* title/media type/status stay visible,
* progress/action state does not get hidden,
* filters can collapse into a compact control.

---

## Mobile

Priority:

```text
Media Center
↓
Media Card
   ├── representative visual
   ├── title
   ├── media type
   ├── current Client-safe state
   ├── progress / release summary
   ├── action indicator
   └── Open Project
↓
Next Media Card
```

Avoid dense tables.

---

## Mobile media identity

The media type should be explicit in text.

Do not communicate:

* Podcast,
* Magazine,
* Video,
* Event

only through icons.

---

## Mobile progress

If progress is present:

pair numerical/visual progress with semantic text where possible.

Do not rely solely on a progress bar.

---

## Mobile live status

Use:

> Published and verified

rather than only a green dot.

---

## Accessibility

Each media card should expose a meaningful semantic summary such as:

> Executive Leadership Magazine. Magazine Project. Design review. 72 percent complete. One approval requires your action.

only where those values exist in the frozen design and canonical source state.

---

## Thumbnail alt semantics

Representative media imagery should have purposeful alt text where informative, or be decorative if the textual title already provides complete identity.

---

# 7. Backend Requirements

## Query architecture

```text
Design 065
    ↓
ClientPortalSessionContext
    ↓
Media Portfolio Authorization
    ↓
ClientMediaCenterQueryService
    │
    ├── authorized Projects
    ├── Project type/classification
    ├── EditorialProject summaries
    ├── MagazineIssue summaries
    ├── Podcast production summaries
    ├── VideoProject summaries
    ├── Event summaries
    ├── canonical progress/status resolver
    ├── Publication/Distribution summaries
    ├── Client Action resolver
    └── representative Asset derivatives
    ↓
ClientMediaSummary[]
    ↓
ClientMediaCenterView
```

---

## Media qualification resolver

A central resolver should determine whether a Project belongs in Design 065.

Conceptually:

```text
isMediaProject(Project):
    based on canonical Project type
    and/or linked specialized production
```

Do not determine media eligibility from:

* Project title text,
* thumbnail,
* arbitrary frontend tags.

---

## Specialized adapter pattern

A useful implementation model:

```text
MediaSummaryAdapter
├── EditorialAdapter
├── MagazineAdapter
├── PodcastAdapter
├── VideoAdapter
└── EventAdapter
```

Each adapter can map its domain into the common Client-safe summary contract.

This preserves specialization without duplicating UI architecture.

---

## Common summary contract

Conceptually:

```text
ClientMediaSummary
├── projectId
├── mediaKind
├── specializedEntityReference
├── clientTitle
├── safeDescription
├── clientStatus
├── progress
├── representativeAsset
├── publicationSummary
├── deliverableSummary
├── currentActionSummary
└── updatedAt
```

Exact fields Phase 3D.

---

## Adapter output ≠ canonical storage

The adapters produce read models.

They do not own production mutations.

---

## Project status resolver

Reuse the centralized Client Project status/progress infrastructure established in Designs 041–044.

Do not maintain:

```text
mediaSummary.status
```

as independent manually updated truth.

---

## Specialized status mapping

Where media-specific context is useful:

```text
canonical Project status
+
specialized production state
        ↓
Client-safe media status resolver
```

The mapping must be centralized and testable.

---

## Media type registry

Use a controlled type registry/enumeration.

Conceptually:

```text
EDITORIAL
MAGAZINE
PODCAST
VIDEO
EVENT
```

possibly others if already present in the frozen product.

Do not derive type from filenames.

---

## Project→specialized entity relationships

The backend should explicitly model lineage:

```text
Project
→ EditorialProject
→ MagazineIssue
→ Podcast production
→ VideoProject
→ Event
```

according to applicable cardinalities.

Avoid opaque generic JSON references.

---

## Polymorphic reference safety

If a generic reference abstraction is used:

```text
resourceType
resourceId
```

it must be:

* allowlisted,
* server-resolved,
* tenant scoped,
* referentially validated.

Never accept arbitrary entity names/IDs from browser requests.

---

## Representative Asset resolver

Conceptually:

```text
Magazine → approved cover derivative
Podcast → approved artwork/episode image
Video → approved thumbnail
Event → approved event artwork
Editorial → approved representative media
```

where frozen UI needs imagery.

No inference from arbitrary latest uploaded Asset.

---

## Asset readiness

Only return:

```text
scan passed
processing complete
Client-visible
```

derivatives.

Do not expose unprocessed uploads.

---

## Publication summary resolver

Use canonical Design 031 state:

```text
Publication
PublicationTarget
Placement
Verification
```

to determine current safe release summary.

---

## Distribution summary resolver

If Design 065 frozen UI surfaces distribution context:

reuse Designs 032/055.

No duplicate channel aggregation.

---

## Deliverable summary resolver

Use Design 051 release/access infrastructure.

A deliverable count/status should be derived from explicitly Client-released deliverables.

---

## Client Action resolver

Reuse Design 047:

```text
Project/media context
      ↓
ClientActionResolver
      ↓
current relevant action(s)
```

Do not store:

```text
mediaProject.requiresAction
```

as independent mutable truth.

---

## Query authorization

Server flow:

```text
Portal membership
↓
authorized Project candidate scope
↓
authorized specialized resource scope
↓
safe projection
↓
filters/search/pagination
```

Do not query all Client media then frontend-filter.

---

## Search indexing

If search exists in Design 065:

index only Client-safe fields such as:

* Project title,
* media type,
* safe publication title,

with tenant/resource authorization.

---

## Pagination

For a growing media portfolio, use server pagination/cursors.

Do not assume every Client will always have a tiny Project set.

---

## Sorting

Possible sorting, if frozen, should use stable canonical fields:

* updated date,
* creation date,
* media type,
* Client-safe status.

Do not sort by frontend-generated text.

---

## Partial-domain failure architecture

A cross-domain aggregator must be fault-tolerant.

Conceptually:

```text
Project service = required core

Magazine enrichment = optional enrichment
Podcast enrichment = optional enrichment
Publication enrichment = optional enrichment
Action enrichment = optional enrichment
```

The exact criticality depends on implementation.

The entire Media Center should not disappear because one enrichment service fails.

---

## Caching

Because the view aggregates multiple domains, cache keys must include:

```text
Portal membership
Client/account
Project access revision
media summary revision
```

and any permission-sensitive subresource state.

---

## Cache invalidation

Relevant events can invalidate summaries:

```text
ProjectUpdated
DraftApproved
ProofApproved
MagazineBuildReady
PodcastEpisodeUpdated
VideoVersionReleased
EventUpdated
PublicationVerified
DeliverableReleased
ClientActionStateChanged
AccessScopeChanged
```

Exact event list Phase 3D.

---

## Avoid N+1 architecture

Do not load:

```text
50 Projects
×
8 downstream API queries each
```

from the browser/server page.

Use batched query/read-model architecture.

---

## Materialized projection option

If cross-domain aggregation becomes expensive, `ClientMediaSummary` may be materialized/read-model cached.

But:

> materialization ≠ canonical business ownership.

Rebuildable from source domains remains important.

---

## Event-driven projection

A scalable design could use:

```text
source domain events
       ↓
Media Summary projection updater
       ↓
ClientMediaSummary read model
```

with replay/idempotency.

Exact choice Phase 3D.

---

## Design 066 handoff

When a user opens a media item:

Design 066 receives stable canonical identifiers:

```text
projectId
+
media/specialized reference where needed
```

It should not infer specialized identity from card title/type alone.

---

## Backend Requirement Matrix

| Requirement                                   | Status                    |
| --------------------------------------------- | ------------------------- |
| Client Portal authentication                  | **Critical**              |
| Active Portal membership                      | **Critical**              |
| Client/account isolation                      | **Critical**              |
| Canonical Project reuse                       | **Critical**              |
| MediaProjectProjection as read model          | **Critical**              |
| ClientMediaSummary                            | **Critical**              |
| Design 023 Project identity                   | **Critical**              |
| Design 024 Editorial reuse                    | **Critical**              |
| Design 025 Magazine reuse                     | **Critical**              |
| Design 026 Podcast reuse                      | **Critical**              |
| Design 027 Video reuse                        | **Critical**              |
| Design 028 Event reuse                        | **Critical**              |
| Project/type vs specialized-entity separation | **Critical**              |
| Media type registry                           | **Critical**              |
| Project→specialized-resource lineage          | **Critical**              |
| Multi-output Project safety                   | **Required**              |
| Client-safe status mapping                    | **Critical**              |
| Canonical Project progress resolver           | **Critical**              |
| Progress/readiness separation                 | **Critical**              |
| Publication/production separation             | **Critical**              |
| Design 031 Publication reuse                  | **Critical**              |
| Design 032 Distribution reuse                 | **Required where shown**  |
| Provider-accepted/verified separation         | **Critical**              |
| Design 030 Asset reuse                        | **Critical**              |
| Client-visible representative-Asset resolver  | **Critical**              |
| Design 051 Deliverable reuse                  | **Critical**              |
| Deliverable/Publication separation            | **Critical**              |
| Design 047 ClientAction reuse                 | **Critical**              |
| Action/status separation                      | **Critical**              |
| Project/subresource authorization             | **Critical**              |
| Source-file restriction                       | **Critical**              |
| Client-visible version filtering              | **Critical**              |
| Permission-safe search                        | **Critical**              |
| Permission-safe thumbnails/live links         | **Critical**              |
| Batched aggregation / N+1 avoidance           | **Critical**              |
| Server-side pagination                        | **Required**              |
| Partial-domain failure handling               | **Critical**              |
| Permission-safe caching                       | **Critical**              |
| Projection invalidation                       | **Required**              |
| Replayable/materializable projection option   | **Required architecture** |
| Design 042 collection consistency             | **Critical**              |
| Design 043 detail consistency                 | **Critical**              |
| Design 066 detail reuse                       | **Critical architecture** |
| Designs 067–069 artifact/workflow integration | **Critical architecture** |

---

# 8. Consolidation

Design 065 exposes several major implementation risks.

**Project / MediaProject conflation**
A second Project entity is created only for media.

**Project / MediaProjectProjection conflation**
A read model becomes independently editable source truth.

**Generic-media mega-entity**
Magazine, Podcast, Video, Event and Editorial fields are flattened into one huge nullable schema.

**Project type / specialized entity conflation**
`type=PODCAST` is treated as the Podcast production itself.

**Project / EditorialProject conflation**
Editorial production loses its distinct workflow identity.

**Project / MagazineIssue conflation**
One Project is assumed to equal exactly one MagazineIssue forever.

**MagazineIssue / ReaderBuild conflation**
Rendered reader artifact replaces Issue identity.

**MagazineIssue / Publication conflation**
Production completion is shown as published.

**Project / PodcastEpisode conflation**
Project and Episode IDs become interchangeable.

**Podcast production / Publication conflation**
Approved audio is treated as released media.

**Project / VideoProject conflation**
Video specialization disappears into generic Project.

**VideoVersion / VideoProject conflation**
Latest edit becomes Project identity.

**Project / Event conflation**
Event occurrence/session semantics are lost.

**Event / EventOccurrence conflation**
Multi-date events collapse into ambiguous one-date Projects.

**MediaProject / Deliverable conflation**
Final file is treated as the entire Project.

**Deliverable / Asset conflation**
Any uploaded file becomes Client deliverable.

**Deliverable / Publication conflation**
Sending Client a file means it is publicly live.

**Media status / Project status conflation**
Another status enum diverges from Designs 041–044.

**Internal stage / Client status conflation**
Internal production terminology leaks into Portal.

**Progress / stage ordinal conflation**
Progress percentage is fabricated from number of workflow stages.

**Progress / readiness conflation**
90% progress is treated as publishable.

**Production-ready / published conflation**
Ready content appears live.

**Scheduled / published conflation**
Future release shown as completed.

**Provider accepted / verified live conflation**
API success produces a Live badge prematurely.

**Published / distributed conflation**
Primary publication means every channel is complete.

**Media type / channel conflation**
Podcast/Video/Magazine classification is mixed with YouTube/LinkedIn/etc.

**Representative image / source file conflation**
Card thumbnail exposes high-resolution/source production Asset.

**Latest Asset / approved representative Asset conflation**
Internal upload becomes Client-facing card visual accidentally.

**Action required / Project status conflation**
Pending approval turns Project lifecycle into a pseudo-task state.

**Questionnaire / media Project conflation**
Design 067's workflow becomes embedded into Project entity.

**Draft / media Project conflation**
Design 068 artifact becomes Project truth.

**Proof / media Project conflation**
Design 069 review artifact becomes Project truth.

**Project access / all media-resource access conflation**
One Project entitlement exposes raw footage, source design files and internal Drafts.

**Media read / approval authority conflation**
Any viewer can approve Proofs.

**Media read / publication authority conflation**
Any viewer can publish content.

**Media read / download authority conflation**
Thumbnail visibility grants source download.

**Media read / Finance/Contract visibility conflation**
Portfolio leaks prices and legal terms.

**Client organization / same Media Center conflation**
Every Client Portal user gets identical portfolio regardless of scope.

**Filter / permission conflation**
Media-type filter becomes security boundary.

**Thumbnail/live-link leakage**
Restricted Project content leaks through visuals or URLs.

**No media / no Projects conflation**
Media Center emptiness is interpreted as empty Client account.

**Unknown progress / 0% conflation**
Unavailable progress shows as not started.

**Publication service failure / not published conflation**
Unknown delivery state becomes false negative.

**Action resolver failure / no action conflation**
Client misses required approval because enrichment failed.

**N+1 aggregation architecture**
Every card causes multiple downstream queries, making the Portal slow/unreliable.

**Projection cache / authorization conflation**
Cached summaries are reused across members with different permissions.

**Materialized projection / source truth conflation**
Cache/read model becomes manually edited canonical data.

**065/042 duplicate Project collections**
General Projects and Media Center use different Project identities/status rules.

**065/066 duplicate media backend**
Media collection and Media Detail independently model production state.

**065/024–028 duplicate production engines**
Portal creates separate Magazine/Podcast/Video/Event workflow models.

**065/055 duplicate publishing truth**
Media card independently decides published/live state.

**065/067–069 duplicate content artifact models**
Questionnaire/Draft/Proof data is embedded directly into MediaProject rather than reusing canonical domains.

No additional screen is required.

These are **cross-media identity, projection, specialized production, status mapping, access, publication, asset, action and aggregation requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT CROSS-MEDIA PORTFOLIO & MEDIA PROJECT DISCOVERY ANCHOR**

**Domain directive:**
**Project ≠ MediaProjectProjection ≠ EditorialProject ≠ MagazineIssue ≠ PodcastProduction/Episode ≠ VideoProject ≠ Event ≠ Publication ≠ Deliverable ≠ ClientMediaSummary.**

**Project directive:**
Design 023 remains the single canonical Project identity/work foundation. Design 065 never creates a second media-specific Project backend.

**Projection directive:**
`ClientMediaSummary` / `MediaProjectProjection` is a Client-safe read model assembled from canonical Project and specialized production domains; it is not independently editable business truth.

**Specialization directive:**
Designs 024–028 remain authoritative for Editorial, Magazine, Podcast, Video and Event production. Media Center normalizes only the subset needed for cross-media discovery.

**Polymorphism directive:**
cross-media composition must not flatten all production models into one nullable mega-entity. Use typed relationships/adapters to specialized domains.

**Identity directive:**
Project type/classification is not the same thing as the linked specialized production entity. IDs and cardinalities remain explicit.

**Collection directive:**
Design 042 remains the general Client Project collection; Design 065 is a media-focused portfolio projection. The same canonical Project may legitimately appear in both with consistent identity/access/status.

**Detail directive:**
Design 066 consumes the same Project + specialized-resource lineage for deeper media detail. No second media backend is permitted between collection and detail.

**Status directive:**
Client-facing media status derives from centralized Project/client-status mapping enriched by the relevant specialized production state. Internal workflow stage values are never exposed as a second Client status engine.

**Progress directive:**
progress uses the canonical Project/progress resolver or an explicitly governed media-safe resolver. Stage count, elapsed time and arbitrary frontend percentages are prohibited.

**Readiness directive:**
progress, production readiness, publication state and distribution state remain separate dimensions.

**Publication directive:**
Design 031 remains canonical for Scheduled/Published/Verified-live truth. Production-ready never means published, and provider acceptance never means verified live.

**Distribution directive:**
Design 032/055 remains canonical for channel distribution. Published media can still have distribution pending.

**Deliverable directive:**
Designs 030/051 remain canonical for Assets/FileVersions and Client Deliverables. A media Project summary never turns arbitrary production files into Client deliverables.

**Asset directive:**
representative images/thumbnails use deliberately Client-visible processed Asset derivatives; raw footage, source design files, internal recordings and unapproved artwork remain protected.

**Action directive:**
Design 047 remains canonical for current Client obligations. Media Center may summarize an action but never stores its own `requiresAction` truth or completes source workflows.

**Artifact directive:**
Questionnaires, Drafts and Proofs remain the canonical domains surfaced later by Designs 067–069. Media Center references/summarizes them without absorbing their version/state models.

**Authorization directive:**
Portal membership, Project scope, specialized-resource visibility, Artifact visibility, live-link access and action authority are all server-enforced independently. Same Client organization does not imply identical Media Center results for every user.

**Search directive:**
media search/type filters operate only inside the already authorized Project/resource scope and can never reveal hidden titles, thumbnails or media types.

**Aggregation directive:**
the backend should use batched/adapted read models or materialized projections where useful rather than an N+1 web of per-card service queries.

**Materialization directive:**
if ClientMediaSummary is materialized for performance, it remains replayable/rebuildable from canonical domains and never becomes source business ownership.

**Failure directive:**
specialized-production enrichment, thumbnail, publication, progress or action-resolution failures are localized. Unknown values never become false `0%`, `Not Published`, or `No Action Required`.

**Responsive directive:**
desktop supports rich cross-media portfolio discovery; mobile reduces this to media identity → type → Client-safe status → progress/release/action → detail without exposing internal production boards.

**Overlap directive:**
Designs **023–032, 041–044, 047, 051–056 and 065–073** must ultimately share one canonical Project + specialized production + Asset + Publication + Deliverable + Client-action foundation while using distinct Client-safe projections.

**Consolidation directive:**
**STANDARDIZE ONE CROSS-MEDIA CLIENT PROJECTION LAYER — CANONICAL PROJECT + TYPED SPECIALIZED PRODUCTION REFERENCES + CENTRAL CLIENT STATUS/PROGRESS MAPPING + CLIENT-SAFE REPRESENTATIVE ASSET + PUBLICATION/DISTRIBUTION SUMMARY + DELIVERABLE SUMMARY + CLIENT ACTION SUMMARY — AND DO NOT CREATE A SECOND `MEDIAPROJECT` WORKFLOW/DATABASE OR COLLAPSE MAGAZINE, PODCAST, VIDEO, EDITORIAL AND EVENT PRODUCTION INTO ONE GENERIC DOMAIN.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **65 / 153** |
| **PASS**                                   |                         **65** |
| **STANDARDIZE decisions**                  |                         **63** |
| **Potential implementation-overlap flags** |                         **56** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**65 / 153 = 42.5% audited.**

### Canonical media architecture after Design 065

```text
                       PROJECT
                     Design 023
                         │
       ┌─────────────────┼─────────────────┐
       ↓                 ↓                 ↓
 EditorialProject    MagazineIssue      Podcast
   Design 024         Design 025       Design 026
                         │
              ┌──────────┴──────────┐
              ↓                     ↓
         VideoProject             Event
         Design 027             Design 028
              │
              └──────────┬──────────┘
                         ↓
            CLIENT-SAFE MEDIA ADAPTERS
                         ↓
                 ClientMediaSummary
                         ↓
           DESIGN 065 — MEDIA CENTER
                         ↓
                  DESIGN 066
               Media Project Detail
```

Delivery remains separate:

```text
Production Domain
      ↓
Approved / eligible exact artifact
      ↓
Publication — Design 031
      ↓
Distribution — Design 032
      ↓
Verified Client-safe summary
      ↓
Design 065
```

And artifact/workflow domains remain separate:

```text
Questionnaire → Design 067
Draft         → Design 068
Proof/Design  → Design 069
Contract      → Designs 053 / 070
Invoice       → Designs 054 / 071
Publishing    → Design 072
Distribution  → Design 073
Messages      → Design 074
```

Design 065 only **organizes and discovers** these media engagements; it does not absorb their domain models.

# Next Sequential Audit Target

## **Design 066 — Client Media Project Detail**

Its frozen identity and supplied route annotation are already locked.

The next audit must preserve the detail-composition boundary:

> **Project ≠ ClientMediaProjectDetail ≠ Specialized Production Entity ≠ Workflow/Progress ≠ Questionnaire ≠ DraftVersion ≠ ProofVersion ≠ Deliverable ≠ Publication ≠ Distribution ≠ ClientAction.**

It will need to reconcile **Design 043's generic Client Project Detail** with **Design 065's cross-media projection** and **Designs 024–028's specialized production domains**, making Design 066 a **media-specialized Client-safe composition over canonical sources rather than another Project 360 backend**.

After Design 066 we continue strictly:

**067 Client Questionnaires Library → 068 Client Drafts Library → 069 Client Designs / Proofs Library → 070 Client Contract Detail & Digital Signing → … → 077 Client Access Recovery**

with the unchanged audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
