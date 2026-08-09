# Architecture

## Structure

```text
src/
  app/                  Routes, metadata, and route boundaries
  components/
    layout/             Site shell, containers, navigation, footer
    ui/                 Accessible low-level primitives
    common/             Reusable editorial composition helpers
    navigation/         Configuration-driven desktop menu presentation
    search/             Global overlay, result controls, result types, and discovery states
    home/               Homepage sections composed from domain components
    latest/             Latest-news lead, filters, feed, insertion, and sidebar
    news/               Cross-desk news leads, topic clusters, and coverage discovery
    topic/              Cross-category topic context, curation, voices, and related discovery
    category/           Reusable category headers, subnav, leads, modules, rankings, and CTAs
    perspective/        Author-led opinion leads, story lists, and editorial sections
    author/             Contributor mastheads, curation, expertise, and archives
    article/            Reusable listing patterns and the long-form story reader
    magazine/           Publication front door, issue covers, and focused visual/text Reader components
    person/             Reusable interview and profile-led presentation
  config/               Site identity, navigation, contact and footer data
  data/mock/            Small, typed fixtures for UI development
  features/             Future feature-level application modules
  hooks/                Shared client hooks only when required
  lib/                  Framework-agnostic utilities
  styles/               Future extracted style modules when global tokens are insufficient
  types/                Database-ready editorial domain models
public/images/           Organized local editorial assets
```

Directories for future component families are introduced only when the first real implementation needs them. Empty asset directories are retained because they define the approved local-media taxonomy.

## Component rules

- Pages compose shared components and do not duplicate the header, footer, cards, navigation data, containers, or typography rules.
- `layout` owns page structure, `ui` owns small accessible primitives, and domain folders own editorial presentation.
- Components accept typed data. Large datasets never live inside route files.
- Native semantic elements are preferred. Visible focus, keyboard access, useful alt text, and labelled navigation are baseline requirements.

## Server and Client Components

Components are Server Components by default. Add `"use client"` only at the narrowest interactive boundary requiring state, event handlers, browser APIs, or client-only hooks. Global navigation/search, newsletter validation, Latest feed controls, and article copy-link feedback are focused client islands; data selection and page composition remain server-side.

## Design system

Global tokens in `src/app/globals.css` define editorial colors, typography families, a complete responsive type hierarchy, section rhythm, interaction timing, focus behavior, divider hierarchy, shadows, and wide-display breakpoints. Tailwind utilities consume those tokens. The system favors square editorial surfaces, strong serif display typography, restrained accent color, thin rules, and deliberate whitespace over dashboard-like cards or decorative effects.

`PageContainer` exposes named `reading`, `article`, `standard`, `wide`, and `media` widths. Containers remain fluid from 320px through large displays while preventing uncontrolled line length. Sections should reorganize their grid and reading order rather than uniformly shrinking.

## Global shell

The header keeps static utility and masthead content server-rendered. Desktop navigation, reusable mega menus, the compact scroll header, global search, and mobile navigation own only their narrow interactive state. All labels, routes, submenu links, article references, promotional content, footer groups, social links, and popular topics originate in `src/config/site.ts` or typed centralized mock data.

The desktop header has utility, masthead, and primary-navigation rows. At tablet and mobile widths it becomes a dedicated three-part mobile header. After desktop users scroll beyond the full masthead, a compact fixed navigation appears. Search and mobile panels lock body scrolling, dismiss with Escape, restore trigger focus, and expose dialog semantics.

The footer is permanently structured around publication context, configured link groups, social access, edition architecture, and a local-only newsletter form. Its Zod validation and success response are UI demonstrations; no address is transmitted or stored.

## Mock data

`src/data/mock` exports small realistic arrays matching the domain types. These fixtures validate components during frontend work and are never accessed through fake API calls. A future repository/data-access layer can replace imports without changing presentation contracts.

`homepage.ts` is a composition layer: it selects article and person records by stable IDs without duplicating their content. Route files receive complete typed objects and remain responsible only for arranging page sections. Generated placeholder photography is stored locally under `public/images/articles` and consumed through `next/image` with explicit dimensions and responsive `sizes`.

`article-details.ts` adds long-form content to representative summaries without bloating the listing dataset. Article bodies use a discriminated block union for paragraphs, semantic headings, pull quotes, images, lists, callouts, and dividers. Remaining summaries receive a deterministic structured fallback, so every centralized article slug has a valid reader destination.

`topics.ts` stores concise Topic identity and explicit editorial curation by stable article and author IDs. `src/lib/topics.ts` combines those selections with deterministic tag, category, subcategory, title, and summary matching to derive current coverage. The resolver applies one ordered deduplication pass across the lead, supporting package, essential reading, analysis, opinion, latest coverage, and rankings; it never copies article records into Topic configuration.

`magazines.ts` keeps the publication brand (`Magazine`) distinct from its dated editions (`MagazineIssue`). Issues own stable slugs, deterministic publication dates, cover metadata, a canonical cover-story ID, featured article IDs, and simple labelled section groups. Resolvers filter those IDs through the shared article catalogue, so magazine stories and contributors continue to use `ArticleReader` and the existing Author system without duplicate content models. Personal Magazines remain presentations of centralized `PersonProfile` identities rather than being folded into the publication or issue types.

`magazine-readers.ts` keeps substantial reading-layout content separate as `MagazineReaderIssue`. Its discriminated `MagazinePage` union models only the cover, contents, editor note, section, feature, article, quote, image, and end layouts used by the publication. Reader helpers validate issue identity, availability, contiguous page numbers, unique IDs, sections, article references, and declared page count before resolving compact serializable article snapshots for presentation.

`business.ts`, `leadership.ts`, and `technology.ts` are category composition layers. They store stable article IDs, subcategory links, editorial section configuration, rankings, and category newsletter copy, then resolve those references against the shared article, person, and magazine records. Articles add optional `subcategory` metadata without changing broad-category filtering or article-reader behavior. Leadership and Technology reuse existing person identities for category-level people features rather than introducing route-specific profile markup.

`perspective.ts` is a separate author-led composition layer. It resolves stable article and author IDs for columnists, text-led arguments, the Big Essay, contributor spotlight, rankings, and the reusable Point/Counterpoint pattern. Opinion contributors live in the shared author model, and every essay continues to use the shared article reader.

`author-profiles.ts` keeps page curation separate from contributor identity. The shared `Author` record remains the single source for names, roles, biographies, expertise, avatars, and slugs, while profile configuration references only stable author/article IDs and topic treatments. `getArticlesByAuthor` derives the complete archive from article relationships; authors with published work receive public profiles, and newsroom contributors use the same route without duplicated page definitions. `Author` remains distinct from the executive/interview-subject `Person` model.

## Homepage composition

The `/` route is a Server Component with page-specific metadata and lightweight Website JSON-LD. It assembles sixteen editorial moments from reusable article, person, magazine, home-section, market, premium, and newsletter components. Interactive behavior remains confined to the existing global-shell islands and the shared newsletter form, keeping the content-heavy page statically renderable with minimal client JavaScript.

## Latest News composition

The `/latest` route is a Server Component with route-specific metadata. It passes a deterministic August 5–7, 2026 article edition into one focused client feed island for category filtering and batched reveal. Lead stories, chronological date groups, the In Depth insertion, ranked Most Read stories, magazine promotion, newsletter, and responsive desktop/sidebar composition all reuse centralized typed data and shared editorial primitives; no API or persistence layer is involved.

## News and Topics composition

The static `/news` route is an editorial discovery hub, distinct from the highly curated homepage and chronological `/latest` feed. `src/data/mock/news.ts` stores only stable selections and resolves existing article records into developing coverage, cross-desk leads, topic clusters, desk summaries, analysis, rankings, and latest updates. It introduces no duplicate article fixtures or client-side page filtering.

News is the primary Topic-discovery hub. Configured cross-category subjects use canonical `/topic/[slug]` destinations, while unsupported or free-form subjects retain working `/search` URLs. Permanent desks continue to use `/business`, `/leadership`, and `/technology`; Topic does not duplicate or replace those category routes. Every story continues to resolve through the shared `/article/[slug]` reader.

## Topic detail composition

The single `/topic/[slug]` route statically generates every centralized Topic and returns the shared not-found experience for unsupported slugs. A Topic is a curated cross-category subject, not a `CategoryLandingPage` configuration and not a rendered Search result set. The route resolves one typed `TopicLandingContent` object and stays responsible only for metadata, CollectionPage/ItemList structured data, invalid-slug handling, and page composition.

Topic pages combine a permanent subject masthead, lead package, date-sorted non-opinion coverage, essential reading, static editorial context, analysis, Perspectives, explicitly selected contributors, adjacent desk links, deterministic rankings, related Topics, premium context, and the shared newsletter form. Article tags and contributor expertise use a small destination helper: configured Topics route canonically, permanent categories keep their first-class routes, and all other labels fall back to Search rather than producing speculative paths.

## Magazine landing composition

The static `/magazine` route is the permanent front door for The Perspective Magazine. It resolves a single typed composition from centralized publication, issue, article, and people data, then presents the latest issue, canonical cover story, highlights, print-like section contents, previous issues, digital-reader context, Premium edition, Personal Magazines, archive preview, subscription context, and the shared Magazine Briefing form. The cover component supports controlled size variants and renders all critical masthead/headline text as HTML over existing optimized local imagery.

The current issue routes into `/magazine/read/august-2026`; historical covers remain non-reader previews until their issue records are explicitly marked `readerAvailable`. Magazine section labels route into permanent `/magazine/category/[slug]` shelves where configured, Archive actions route to `/magazine/archive`, Premium discovery routes to `/magazine/premium`, and Magazine subscription actions route to `/magazine/subscribe`. Standard Magazine search results use `/magazine`, Premium issue results use `/magazine/premium`, and referenced stories remain canonical `/article/[slug]` destinations.

## Premium Magazine composition

The static `/magazine/premium` route is the canonical editorial catalogue for published `MagazineIssue` records whose Premium metadata is true. A small configuration layer selects the hero, featured stories, voices, benefits, themes, and editorial comparison, while helpers resolve all issue and article relationships from the centralized records and validate the two-issue inventory. The server-rendered composition includes a Magazine masthead, hero, benefits, issue catalogue, public article selections, Premium voices, themes, archive context, Standard/Premium comparison, future-membership positioning, Magazine discovery, and the shared Magazine Briefing. Its CollectionPage/ItemList structured data describes publication issues without Offers.

Premium is intentionally separate from both the general Magazine landing and Subscription plan selection. It remains editorial metadata rather than an enforced entitlement: there is no user state, authentication, payment flow, Stripe model, or paywall. Reader calls to action require independent `readerAvailable` metadata plus configured Reader content; because neither Premium issue currently meets both conditions, neither exposes a Reader action.

## Magazine Subscription composition

The static `/magazine/subscribe` route explains the future Reader, Digital, and Premium product levels without transacting. Centralized `SubscriptionPlan` records store integer-cent monthly and annual demonstration prices, provider-neutral future product keys, marketing benefits, and cumulative machine-readable entitlements across the typed `public`, `digital`, and `premium` access tiers. Validation enforces unique plans and entitlements, zero Reader pricing, honest annual savings, valid routes, and Reader → Digital → Premium inheritance. The comparison table and entitlement preview derive from this source of truth.

The page remains server-rendered except for one billing-frequency client island that changes displayed prices using derived savings. Paid CTAs resolve to an explanatory status anchor; no checkout route, cookie, local storage, account, authentication, billing SDK, or access guard exists. A future backend can map authenticated subscription records and real provider price IDs onto the stable plan/product keys before enforcing the entitlement matrix. Subscription answers which access level fits the reader; Premium remains the edition catalogue. The next public stage is the Personal Magazine Profile detail architecture.

## Magazine Archive composition

The request-rendered `/magazine/archive` route is the permanent issue-discovery surface. It awaits Next.js 16 `searchParams`, parses `q`, `year`, and `type`, and passes plain server-derived data into `MagazineArchivePage`; only the reused newsletter form requires a client boundary. GET search, year links, and All/Reader/Premium filters keep archive state shareable through ordinary URLs, while every variant canonicalizes to `/magazine/archive` and query variants are `noindex, follow`.

Archive helpers derive chronology, real years, counts, Reader and Premium groups, featured history, themes, story previews, and result sets directly from the canonical `MagazineIssue` array. Search uses the same lightweight normalization primitives as global Search and requires every query token to appear somewhere across issue metadata, section labels, or resolved article titles. Reader calls to action depend exclusively on `readerAvailable`; Premium remains metadata-only. The deterministic archive currently spans fourteen editions across 2025–2026, with existing local cover assets and canonical article records reused rather than duplicated. Established themes route to permanent Magazine categories; remaining themes retain working Archive search destinations.

## Magazine Category composition

The single `/magazine/category/[slug]` route statically generates Leadership, Business, Technology, The Perspective, and Special Editions from centralized `MagazineCategory` configuration. These pages are curated Magazine shelves, distinct from current newsroom desks and cross-category Topics: they resolve canonical `MagazineIssue` and `Article` records through explicit selections plus deterministic theme, section, keyword, and article-category matching.

Each category composes a Magazine-specific masthead and navigation, featured issue, issue-context story cards, curated issue grid, deduplicated text index, conditional Reader and Premium sections, historical issues, explicitly related categories, current-newsroom bridge, Archive query, conversion context, and the shared Magazine Briefing. Reader links require both canonical availability metadata and configured Reader content; Premium remains metadata-only. Archive themes and Magazine landing section labels use category routes where permanent shelves exist, while Premium calls to action use the dedicated catalogue.

## Magazine Reader composition

The single `/magazine/read/[slug]` route resolves only configured readable issues, generates issue metadata and PublicationIssue JSON-LD, clamps `page` deep links, returns 404 for invalid or unavailable issues, and supports `?view=text` without changing its canonical URL. A narrowly matched root proxy rejects unavailable Reader slugs before Next.js begins streaming, preserving a real HTTP 404 in production while sharing the same readable-slug resolver. The route and text view remain server-rendered; one focused `MagazineReader` client boundary owns current-page state, URL replacement, keyboard navigation, panels, zoom, fit mode, and progressive Fullscreen API state.

The primary Reader is structured HTML rather than PDF, canvas, screenshots, or a third-party flipbook. It mounts one full page at a time, represents thumbnails with lightweight semantic previews, preloads only the current page image, and adapts the same data into a full-width mobile layout with readable body type. The text view renders the complete issue as a linear document with one H1, section/story headings, figures, contents anchors, and canonical article links. Reader-specific shell CSS suppresses the normal site chrome while preserving a visible route back to Magazine.

## Category landing composition

The `/business`, `/leadership`, and `/technology` routes use the reusable `CategoryLandingPage` architecture. Each route remains a static Server Component responsible for metadata, shared CollectionPage/ItemList structured data, and passing one resolved configuration object into the category composer. Category components provide a restrained masthead, accessible scrollable subnavigation, asymmetric lead, story grid, configurable editorial-section treatments, optional people feature, In Depth feature, interview, category rankings, compact latest list, category-selected magazine, personal-magazine, or premium promotion, and shared newsletter form.

Category pages are curated discovery experiences; `/latest` remains the chronological filterable newsroom feed. Future Finance, Markets, Culture, and Lifestyle routes should supply new configuration and content selections to the category primitives, adding a new layout variant only when their editorial requirements cannot be expressed by the existing treatments.

## Perspective landing composition

The `/perspective` route deliberately does not use `CategoryLandingPage`. Its static `PerspectiveLandingPage` composition is author-led and argument-led, with a newspaper-style opinion lead, reusable contributor cards, typographic story lists, a print-like Big Essay, and the generic Point/Counterpoint module. It still reuses the global shell, topic subnavigation, ranked stories, premium promotion, newsletter, CollectionPage/ItemList helper, centralized authors/articles, and the shared `ArticleReader`.

## Author profile composition

The single `/author/[slug]` route statically generates every centralized author with published work. It resolves identity and editorial selections through shared helpers, returns the global not-found experience for unsupported slugs, and emits contributor-specific metadata plus sanitized ProfilePage/Person JSON-LD. The Server Component composition combines a controlled masthead, featured essay, latest work, topic expertise, essential reading, complete date-sorted archive, curated rankings, Perspective context, premium promotion, and newsletter. Only archives longer than twelve articles expose a focused client-side Load More control; profile identity and editorial content remain server-rendered.

Perspective cards, homepage Opinion bylines, article headers, and author biographies already use canonical author slugs. Global search limits contributor results to public authors and labels them separately from articles and `Person` subjects, completing the Perspective-to-article-to-author reading loop.

## Search composition

The `/search` route is a request-time Server Component because it reads asynchronous `searchParams`. Its canonical URL remains `/search`, while `q`, `type`, and `sort` make query, filtering, and ordering shareable through ordinary GET navigation. Search pages are intentionally `noindex, follow` and omit structured data because they are utility result views rather than durable editorial documents.

`src/lib/search.ts` derives one compact in-memory index from centralized article summaries, public contributors, people, and magazine issues. The same normalized, weighted, deterministic search function powers the global overlay and full results route without importing full article bodies into client code. Article and contributor results use canonical routes; people link only when a published interview destination exists; standard Magazine results use `/magazine`, and Premium issue results use `/magazine/premium`. The only search-results client island manages batched Load More disclosure.

## Implemented route inventory

- `/perspective` — author-led Opinion and Ideas landing with essays, columnists, and curated debate
- `/` — master editorial homepage
- `/latest` — chronological, client-filterable newsroom feed
- `/news` — cross-desk editorial discovery for current stories, topics, and coverage areas
- `/business` — curated Business category landing
- `/leadership` — curated Leadership category landing with executive interviews and people-led publishing promotion
- `/technology` — curated Technology category landing with infrastructure, enterprise, cybersecurity, startup, and future-tech coverage
- `/article/[slug]` — statically generated article reader for every centralized article record
- `/author/[slug]` — statically generated contributor profile and editorial archive
- `/search` — URL-driven editorial search across articles, contributors, people, and magazine issues
- `/topic/[slug]` — statically generated cross-category editorial Topic hub
- `/magazine` — static issue-led Magazine landing and future product-system front door
- `/magazine/premium` — static Premium-edition catalogue derived from canonical Magazine issues and public stories
- `/magazine/subscribe` — static subscription-plan comparison with demonstration pricing and future entitlement metadata
- `/magazine/archive` — URL-driven chronological issue archive with search, year, Reader, and Premium filters
- `/magazine/category/[slug]` — statically generated Magazine theme shelf across canonical issues, articles, Reader availability, and Premium state
- `/magazine/read/[slug]` — reusable structured digital issue reader; August 2026 currently available

Subcategory and Perspective topic destinations shown in navigation are reserved future routes. A contributor index remains intentionally deferred; canonical profile links resolve directly through `/author/[slug]`.

## Article reader composition

The `/article/[slug]` route resolves typed article details by slug, returns the global not-found experience for invalid values, and statically generates every mock article during the production build. Dynamic metadata and sanitized Article/NewsArticle JSON-LD derive from the resolved record. The reusable reader composes a content-driven header, responsive hero, share/TOC rail, constrained body renderer, tags, author bio, deterministic related stories, ranked Most Read list, magazine promotion, and newsletter. Only the copy-link control hydrates; long-form text and essential metadata render directly in HTML.

## Future database architecture

When Supabase is introduced, PostgreSQL records will map to the types in `src/types`. Server-only repository modules should translate database rows to domain objects. Browser database access should be limited to features that genuinely need real-time client behavior. Authentication, storage policies, validation schemas, migrations, and Row Level Security will be designed together in that later phase; none are stubbed in the foundation.

Likely entities include profiles, authors, articles, categories, tags, article tags, magazines, issues, pages, plans, subscriptions, saved articles, reading history, media, and SEO metadata.
