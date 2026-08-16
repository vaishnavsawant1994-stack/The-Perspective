# The Perspective — Reusable Component Mapping

Date: 13 August 2026  
Scope: map the approved 57 designs onto reusable systems in the current Next.js project.

## Target architecture

```text
App
├── SiteShell
│   ├── Public editorial systems
│   ├── MagazineSystem
│   ├── PersonalMagazineSystem
│   ├── PodcastSystem
│   ├── VideoSystem
│   ├── EventSystem
│   └── Company / public support pages
├── AuthShell
│   └── Login / Signup / Forgot / Verify states
├── MemberShell (server protected)
│   └── 11 member page modules
├── ErrorShell
│   └── 404 / route error / root error / maintenance
└── LegalPageLayout
    └── Privacy / Terms / Cookies / Editorial / Accessibility / Community
```

## Current-to-target family map

| Approved family | Pages | Current implementation evidence | Assessment | Target extraction |
| --- | ---: | --- | --- | --- |
| `SiteShell` | 1–32, 51–57 where applicable | Root `layout.tsx`, `HomepageRedesignHeader`, `GlobalMembershipNewsletter`, `GlobalPerspectiveFooter` | Shell exists but is unconditional and not route-aware | Route-group layouts for public, auth, member, error, and legal experiences; shared brand header/footer primitives |
| `HomePage` | 1 | `components/home/homepage-redesign.tsx` | Mature visual implementation | Keep page composition; replace direct fixture imports with a home payload contract |
| `LatestFeedPage` | 2 | `components/latest/latest-news-page.tsx` | Mature visual implementation | Extract URL-driven topic/filter/sort controls and feed pagination |
| `CategoryLandingPage` | 12 | `components/category/category-landing-page.tsx`, `business-redesign.tsx` | Reusable base exists, but Business diverges into a dedicated page | Consolidate hero, subnav, lead grid, rail, news shelves; category-specific modules are slots |
| `BlogLandingPage` | 7 | `components/perspective/blogs-redesign.tsx`, legacy `PerspectiveLandingPage` | Correct approved design exists under legacy route and appended legacy content | Make redesign the canonical page body and make legacy content optional/remove it |
| `TopicLandingPage` | 21 | `components/topic/topic-detail-redesign.tsx`, legacy topic component | Approved and legacy implementations coexist | Keep one topic page contract with optional experts/reports/events rails |
| `ArticleReaderPage` | 11 | `components/article/article-reader.tsx` | Shared article reader exists | Split article query, reading tools, premium gate, content renderer, and related modules |
| `AuthorDirectoryPage` | 8 | `components/author/authors-page.tsx` | Exists | Add expertise filters and author directory data contract |
| `AuthorProfilePage` | 22 | `author-profile-detail-redesign.tsx` plus legacy author page | Approved redesign exists | Use `Contributor` entity contract; separate biography, stats, archives, media |
| `PersonProfilePage` | 23 | `components/person/executive-profile-detail.tsx` | Exists | Use `Person` entity contract distinct from authors, with coverage/appearance relations |
| `SearchResultsPage` | 9 | `SearchRedesign`, local `lib/search` | UI exists; search is in-memory | Server search adapter, URL filter parser, result-type renderers, empty/error states |
| `MagazineSystem` | 3, 13–17 | `components/magazine/*`, including redesign/legacy pairs | Broadest system is visually complete but duplicated | Shared issue/cover/story models, landing, archive, category, premium, reader, plans; entitlement adapter |
| `PersonalMagazineSystem` | 4, 18–20 | `components/personal-magazine/*`; landing and discovery folded together | Visual modules exist; routing/composition is wrong | Separate landing, discovery, profile, create routes using shared cover/profile/process/lead components |
| `PodcastSystem` | 5, 24–25 | `components/podcast/*` | Landing/show/episode designs exist | Shared show/episode/guest models, player adapter, transcript, progress, platform links |
| `VideoSystem` | 6, 26 | `components/video/*` | Landing/detail designs exist | Shared video/short models, player adapter, chapters/transcript/progress |
| `EventSystem` | 10, 27 | `components/event/*` | Landing/detail designs exist | Shared event/speaker/session models; registration and ticket adapter |
| `CompanyPages` | 28–32 | About, contact, newsletter, help components; Page 30 absent | Four of five systems exist | Build Partner/Media Kit page; share metric, logo, lead-form, FAQ, and CTA primitives |
| `AuthShell` | 33–36 | `components/auth/auth-page.tsx`, `auth-forms.tsx` | Strong visual shell; demo-only behavior | Server-aware shell plus isolated login/signup/recovery/verification forms and auth-state adapters |
| `MemberShell` | 37–47 | One `components/member/member-experience.tsx` client component and one CSS module | All designs present but monolithic, public, fixture-only | Server layout, navigation, per-page server components, small client islands, member data services |
| `ErrorShell` | 48–50 | `utility-pages.tsx`, `not-found.tsx`, `error.tsx`, `/500`, maintenance | Visual family exists; root error/maintenance operation incomplete | Split not-found, error, global-error, maintenance; share recovery/search/status primitives |
| `LegalPageLayout` | 51–56 | One `LegalPage` switch in `utility-pages.tsx` | Visual family exists in one large component | Legal document schema, sticky contents, summary cards, accordion sections, controls and contact rail |
| `SitemapPage` | 57 | Hardcoded `SitemapPage` in `utility-pages.tsx` | Visual exists but drifts independently | Generate category cards and links from route registry |

## Shell extraction

### 1. Public `SiteShell`

Responsibilities:

- utility bar and market snapshot;
- masthead, global search, profile/actions;
- primary navigation and active state;
- optional breaking/news rail;
- consistent content container/gutters;
- public newsletter/membership/footer modules only when the page design calls for them;
- mobile nav and search sheet;
- canonical link and structured navigation metadata.

Current issue: the root layout renders the same header, membership/newsletter block, and footer for every route. Auth, member, system, and legal designs need control over which global sections appear.

Recommended route groups:

```text
src/app/
├── (public)/layout.tsx
├── (auth)/layout.tsx
├── my/layout.tsx
├── (legal)/layout.tsx
└── layout.tsx          # document/body providers only
```

URL paths remain unchanged; route groups only organize layouts.

### 2. `AuthShell`

Shared shell:

- editorial brand/benefit panel;
- magazine/device artwork;
- form card;
- security/help reassurance rail;
- focused footer;
- mobile single-column form-first order.

Individual modules:

- `LoginForm`
- `SignupForm`
- `ForgotPasswordForm`
- `VerificationState`

The current `auth-forms.tsx` should not own authentication through `localStorage`. Forms should call server actions or an identity-provider adapter and render typed pending/success/error states.

### 3. `MemberShell`

Server layout responsibilities:

- require session;
- load lightweight member identity and entitlement summary;
- member navigation and active state;
- consistent desktop side navigation/mobile member navigation;
- footer and account-wide support links.

Split the current monolith into:

```text
components/member/
├── member-shell.tsx
├── member-nav.tsx
├── dashboard/
├── saved/
├── following/
├── newsletters/
├── subscription/
├── billing/
├── settings/
├── notifications/
├── magazines/
├── events/
└── support/
```

Client components should be limited to filters, toggles, player/progress actions, editable forms, and support conversation submission. Page data should be loaded server-side.

### 4. `LegalPageLayout`

Shared schema:

```ts
type LegalDocument = {
  slug: string;
  label: string;
  title: string;
  summary: string;
  effectiveAt: string;
  updatedAt: string;
  heroAsset: string;
  highlights: Highlight[];
  sections: LegalSection[];
  controls?: LegalControl[];
  relatedRoutes: RouteKey[];
};
```

This allows six policies to share layout while content can later come from versioned files or a CMS. Operational buttons such as privacy requests, cookie controls, corrections, accessibility reports, and community reports require separate service adapters.

## Shared domain contracts

The current fixture files should be normalized into domain models before a CMS/database is selected.

| Domain | Required core model |
| --- | --- |
| Editorial | `Article`, `ArticleSection`, `Category`, `Topic`, `SearchResult` |
| Identity | `Contributor`, `Person`, `Company`, `Expertise` |
| Magazine | `MagazineIssue`, `MagazinePage`, `MagazineStoryRef`, `Entitlement`, `ReadingProgress` |
| Personal Magazine | `PersonalMagazine`, `ProfileMilestone`, `Chapter`, `LeadSubmission` |
| Podcast | `PodcastShow`, `PodcastEpisode`, `AudioAsset`, `TranscriptCue` |
| Video | `Video`, `VideoChapter`, `VideoAsset`, `TranscriptCue`, `Clip` |
| Event | `Event`, `Session`, `Speaker`, `Registration`, `Ticket` |
| Member | `MemberProfile`, `SavedItem`, `Follow`, `NewsletterPreference`, `Notification` |
| Commerce | `Plan`, `Subscription`, `Invoice`, `PaymentMethod`, `Entitlement` |
| Support | `HelpArticle`, `SupportTicket`, `SupportMessage`, `Attachment` |
| Trust | `ConsentRecord`, `PrivacyRequest`, `CorrectionRequest`, `ModerationReport` |

## Reusable visual primitives

The designs repeatedly use these patterns and should not reimplement them per page:

- `PageContainer` and responsive gutters;
- `SectionHeader` with title/action/optional tabs;
- `EditorialCard` variants: feature, standard, compact, ranked;
- `MediaCard` variants: video, short, podcast episode, collection;
- `EntityCard` variants: author, person, speaker, company;
- `MagazineCover`, `MagazineIssueCard`, `CoverShelf`;
- `FilterBar`, `ChipList`, `SortSelect`, `SearchField`;
- `StatsStrip`, `RankedList`, `Timeline`, `ProgressBar`;
- `NewsletterSignup`, `MembershipCTA`, `AppDownload`;
- `EmptyState`, `ErrorState`, `AccessState`, `LoadingSkeleton`;
- `LegalTableOfContents`, `LegalSectionAccordion`, `PolicyControlRail`;
- `MemberPageHeader`, `MemberStatStrip`, `MemberRightRail`;
- `FormField`, `FormMessage`, `ConsentCheckbox`, `SubmitButton`.

Primitives should accept semantic data and variants, not route-specific hardcoded labels.

## Data and backend adapter boundaries

Avoid coupling page components directly to a future provider. Define interfaces first:

```text
contentRepository      articles, categories, topics, authors, people
magazineRepository     issues, pages, categories, premium catalogue
mediaRepository        podcasts, videos, assets, transcripts
eventRepository        events, sessions, speakers
searchService          query, facets, suggestions
authService            session, login, signup, recovery, verification
memberRepository       saves, follows, preferences, progress, notifications
billingService         plans, subscriptions, invoices, entitlements
supportService         help content, tickets, attachments
consentService         cookie/privacy/communication choices
leadService            contact, advertise, Personal Magazine leads
```

The page families consume these interfaces. Initial adapters can return fixtures; later adapters can use a CMS, database, email platform, payment provider, or media host without redesigning components.

## Component priority order

1. **Typed route registry and link cleanup** — prevents further 404/SEO drift.
2. **Route-group shell extraction** — removes unconditional global composition.
3. **Member route migration + real auth guard** — closes the highest security gap.
4. **Split the member monolith** — makes backend integration tractable.
5. **Separate Personal Magazine landing and discovery** — restores approved information architecture.
6. **Create Advertise/Media Kit page** — closes the only missing approved design.
7. **Normalize Magazine domain and entitlements** — largest connected commercial system.
8. **Normalize content/media/event contracts** — supports CMS/search/player integrations.
9. **Version legal content and connect trust workflows**.
10. **Generate sitemaps/navigation from the route registry**.

## Definition of component-complete

A reusable family is complete only when:

- every assigned approved page renders through it or documented slots;
- route-specific data is supplied through typed props/repository results;
- fixture data is not embedded in layout primitives;
- mobile behavior matches the master matrix;
- loading, empty, not-found, error, signed-out, and unauthorized states exist;
- links use the route registry;
- interactions have accessible names, keyboard behavior, and focus states;
- a visual regression story or route screenshot exists for desktop and mobile;
- backend calls are isolated behind an adapter with typed errors.
