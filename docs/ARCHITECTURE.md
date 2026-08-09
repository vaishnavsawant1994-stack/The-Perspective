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
    search/             Global search trigger, overlay, and local suggestions
    home/               Homepage sections composed from domain components
    latest/             Latest-news lead, filters, feed, insertion, and sidebar
    category/           Reusable category headers, subnav, leads, modules, rankings, and CTAs
    perspective/        Author-led opinion leads, story lists, and editorial sections
    article/            Reusable listing patterns and the long-form story reader
    magazine/           Issue, cover, and personal-publication presentation
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

`business.ts`, `leadership.ts`, and `technology.ts` are category composition layers. They store stable article IDs, subcategory links, editorial section configuration, rankings, and category newsletter copy, then resolve those references against the shared article, person, and magazine records. Articles add optional `subcategory` metadata without changing broad-category filtering or article-reader behavior. Leadership and Technology reuse existing person identities for category-level people features rather than introducing route-specific profile markup.

`perspective.ts` is a separate author-led composition layer. It resolves stable article and author IDs for columnists, text-led arguments, the Big Essay, contributor spotlight, rankings, and the reusable Point/Counterpoint pattern. Opinion contributors live in the shared author model, and every essay continues to use the shared article reader.

## Homepage composition

The `/` route is a Server Component with page-specific metadata and lightweight Website JSON-LD. It assembles sixteen editorial moments from reusable article, person, magazine, home-section, market, premium, and newsletter components. Interactive behavior remains confined to the existing global-shell islands and the shared newsletter form, keeping the content-heavy page statically renderable with minimal client JavaScript.

## Latest News composition

The `/latest` route is a Server Component with route-specific metadata. It passes a deterministic August 5–7, 2026 article edition into one focused client feed island for category filtering and batched reveal. Lead stories, chronological date groups, the In Depth insertion, ranked Most Read stories, magazine promotion, newsletter, and responsive desktop/sidebar composition all reuse centralized typed data and shared editorial primitives; no API or persistence layer is involved.

## Category landing composition

The `/business`, `/leadership`, and `/technology` routes use the reusable `CategoryLandingPage` architecture. Each route remains a static Server Component responsible for metadata, shared CollectionPage/ItemList structured data, and passing one resolved configuration object into the category composer. Category components provide a restrained masthead, accessible scrollable subnavigation, asymmetric lead, story grid, configurable editorial-section treatments, optional people feature, In Depth feature, interview, category rankings, compact latest list, category-selected magazine, personal-magazine, or premium promotion, and shared newsletter form.

Category pages are curated discovery experiences; `/latest` remains the chronological filterable newsroom feed. Future Finance, Markets, Culture, and Lifestyle routes should supply new configuration and content selections to the category primitives, adding a new layout variant only when their editorial requirements cannot be expressed by the existing treatments.

## Perspective landing composition

The `/perspective` route deliberately does not use `CategoryLandingPage`. Its static `PerspectiveLandingPage` composition is author-led and argument-led, with a newspaper-style opinion lead, reusable contributor cards, typographic story lists, a print-like Big Essay, and the generic Point/Counterpoint module. It still reuses the global shell, topic subnavigation, ranked stories, premium promotion, newsletter, CollectionPage/ItemList helper, centralized authors/articles, and the shared `ArticleReader`.

## Implemented route inventory

- `/perspective` — author-led Opinion and Ideas landing with essays, columnists, and curated debate
- `/` — master editorial homepage
- `/latest` — chronological, client-filterable newsroom feed
- `/business` — curated Business category landing
- `/leadership` — curated Leadership category landing with executive interviews and people-led publishing promotion
- `/technology` — curated Technology category landing with infrastructure, enterprise, cybersecurity, startup, and future-tech coverage
- `/article/[slug]` — statically generated article reader for every centralized article record

Subcategory and Perspective topic destinations shown in navigation are reserved future routes. Author links likewise reserve `/author/[slug]` for the next stage. They are intentionally represented as real links without placeholder page implementations.

## Article reader composition

The `/article/[slug]` route resolves typed article details by slug, returns the global not-found experience for invalid values, and statically generates every mock article during the production build. Dynamic metadata and sanitized Article/NewsArticle JSON-LD derive from the resolved record. The reusable reader composes a content-driven header, responsive hero, share/TOC rail, constrained body renderer, tags, author bio, deterministic related stories, ranked Most Read list, magazine promotion, and newsletter. Only the copy-link control hydrates; long-form text and essential metadata render directly in HTML.

## Future database architecture

When Supabase is introduced, PostgreSQL records will map to the types in `src/types`. Server-only repository modules should translate database rows to domain objects. Browser database access should be limited to features that genuinely need real-time client behavior. Authentication, storage policies, validation schemas, migrations, and Row Level Security will be designed together in that later phase; none are stubbed in the foundation.

Likely entities include profiles, authors, articles, categories, tags, article tags, magazines, issues, pages, plans, subscriptions, saved articles, reading history, media, and SEO metadata.
