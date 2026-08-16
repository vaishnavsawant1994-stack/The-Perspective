# The Perspective — Route Freeze v1

Status: **Proposed implementation freeze based on the approved 57-page master map**  
Date: 13 August 2026

This document resolves the difference between approved routes and the routes currently implemented in the repository. It is the implementation contract for navigation, redirects, authentication return paths, canonical metadata, sitemaps, and future backend APIs.

## Freeze principles

1. One approved design has one canonical page route.
2. Legacy paths remain available only as permanent redirects unless explicitly retained below.
3. The header, footer, breadcrumbs, cards, CTAs, HTML sitemap, and XML sitemap consume one typed route registry.
4. Dynamic entity URLs use stable slugs and return the framework not-found boundary for unknown entities.
5. Query state remains in the URL for search, archive filters, sort order, and magazine reader page/view.
6. `/my/*` is a private namespace protected on the server. A client-only shell is not an auth boundary.
7. Authentication preserves the requested destination through `/login?next=<encoded-relative-path>`.
8. Premium visibility and access are different concerns: public catalogue pages may show Premium items, but protected content requires server-side entitlement checks.
9. Framework error files are operational boundaries; `/500` is only a manual preview route.
10. Content links may use only registered routes or validated dynamic entity URLs.

## Canonical route registry

### Public editorial and discovery

| Family | Canonical routes |
| --- | --- |
| Home and feeds | `/`, `/latest`, `/search` |
| Editorial sections | `/business`, `/leadership`, `/technology`, `/perspective` |
| Entity detail | `/article/[slug]`, `/topic/[slug]`, `/author/[slug]`, `/people/[slug]` |
| Directories | `/authors` |

The master matrix names Page 7 as `/blogs`, while the master document also explicitly instructs the implementation to preserve the established `/perspective` route. The freeze resolves that conflict by retaining **`/perspective` as canonical** and exposing `/blogs` as a permanent alias.

### Magazine system

| Page | Canonical route |
| --- | --- |
| Magazine landing | `/magazine` |
| Reader | `/magazine/read/[issueSlug]` |
| Archive | `/magazine/archive` |
| Category | `/magazine/category/[slug]` |
| Premium listing | `/magazine/premium` |
| Plans | `/subscribe` |

Supported reader query parameters:

- `page=<positive-integer>`
- `view=visual|text`

Supported archive query parameters:

- `q=<string>`
- `year=<four-digit-year>`
- `type=all|reader|premium|special`
- `sort=latest|oldest`

### Personal Magazine system

| Page | Canonical route |
| --- | --- |
| Landing | `/personal-magazines` |
| Discovery | `/personal-magazines/discover` |
| Profile | `/personal-magazines/[slug]` |
| Create / Get Featured | `/personal-magazines/create` |

Route precedence must reserve `discover` and `create` before resolving a profile slug.

### Podcast, video, and event systems

| Page | Canonical route |
| --- | --- |
| Podcasts | `/podcasts` |
| Podcast show | `/podcasts/[showSlug]` |
| Podcast episode | `/podcasts/[showSlug]/[episodeSlug]` |
| Videos | `/videos` |
| Video detail | `/videos/[slug]` |
| Events | `/events` |
| Event detail | `/events/[slug]` |

### Company, commercial, and public support

| Page | Canonical route |
| --- | --- |
| About | `/about` |
| Contact | `/contact` |
| Advertise / Partner / Media Kit | `/advertise` |
| Newsletters | `/newsletters` |
| Help Center | `/help` |

### Authentication

| Page | Canonical route |
| --- | --- |
| Login | `/login` |
| Sign up | `/signup` |
| Forgot password | `/forgot-password` |
| Verify email | `/verify-email` |

Allowed auth query parameters:

- `next=<encoded-relative-path>` for login/signup return flow
- `token=<opaque-token>` for verification/reset flows where required
- `email=<email-address>` only if privacy review approves exposing it in the URL

### Private member namespace

| Page | Canonical route |
| --- | --- |
| Dashboard | `/my` |
| Saved | `/my/saved` |
| Following | `/my/following` |
| Newsletter preferences | `/my/newsletters` |
| Subscription | `/my/subscription` |
| Billing | `/my/billing` |
| Settings | `/my/settings` |
| Notifications | `/my/notifications` |
| Magazine library | `/my/magazines` |
| Events | `/my/events` |
| Support tickets | `/my/support` |

Every route in this namespace requires an authenticated server session. Subscription and billing routes additionally require a member/customer record; magazine access requires entitlement evaluation.

### System, legal, and utility

| Page | Canonical route/boundary |
| --- | --- |
| Not found | framework `not-found.tsx` |
| General route error | framework `error.tsx` |
| Root error | framework `global-error.tsx` |
| Error preview | `/500` (non-indexed QA route) |
| Maintenance | `/maintenance` |
| Privacy | `/privacy` |
| Terms | `/terms` |
| Cookies | `/cookies` |
| Editorial standards | `/editorial-standards` |
| Accessibility | `/accessibility` |
| Community guidelines | `/community-guidelines` |
| HTML sitemap | `/sitemap` |
| XML sitemap | framework metadata sitemap output |

## Redirect and alias table

| From | To | Behavior | Reason |
| --- | --- | --- | --- |
| `/blogs` | `/perspective` | Permanent redirect | Approved label alias; preserve established canonical route |
| `/magazine/subscribe` | `/subscribe` | Permanent redirect | Consolidate plan selection |
| `/newsletter` | `/newsletters` | Permanent redirect | Normalize hub route to master matrix |
| `/my-perspective` | `/my` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/saved` | `/my/saved` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/following` | `/my/following` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/newsletters` | `/my/newsletters` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/subscription` | `/my/subscription` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/billing` | `/my/billing` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/settings` | `/my/settings` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/notifications` | `/my/notifications` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/magazines` | `/my/magazines` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/events` | `/my/events` | Auth-aware permanent redirect | Normalize member namespace |
| `/my-perspective/support` | `/my/support` | Auth-aware permanent redirect | Normalize member namespace |
| `/sign-in` | `/login` | Permanent redirect | Remove broken legacy auth link |
| `/premium` | `/magazine/premium` | Permanent redirect | Remove broken legacy Premium link |
| `/news` | `/latest` | Proposed permanent redirect | The 57-page set defines one News/Latest feed; retain only if separately approved |

Redirect implementation must use the current Next.js 16 conventions documented in `node_modules/next/dist/docs/01-app/02-guides/redirecting.md`. Redirect targets must be internal relative paths or allowlisted external URLs.

## Broken legacy destinations to eliminate

The following paths are currently referenced in code but do not belong to the approved route set and do not have implemented destinations:

- `/finance`
- `/markets`
- `/culture`
- `/lifestyle`
- `/business/companies`
- `/business/economy`
- `/business/entrepreneurship`
- `/business/markets`
- `/business/startups`
- `/business/global-business`
- `/perspective/business`
- `/perspective/leadership`
- `/perspective/technology`
- `/perspective/culture`
- `/team`
- `/contributors`
- `/careers`

Cards for these concepts should link to a registered category/topic/search query, for example `/search?q=markets`, `/topic/artificial-intelligence`, or the relevant approved category page. They should not create accidental page templates.

## Typed route registry target

Create one server-safe module such as `src/config/routes.ts` with:

- canonical static routes;
- builders for article, author, person, topic, magazine issue, podcast, video, and event routes;
- legacy redirect entries;
- public/private metadata;
- sitemap inclusion;
- navigation visibility;
- required entitlement/auth policy;
- optional analytics page identifier.

Conceptual API:

```ts
export const routes = {
  home: () => "/",
  latest: () => "/latest",
  perspective: () => "/perspective",
  article: (slug: string) => `/article/${encodeURIComponent(slug)}`,
  magazineIssue: (slug: string, page?: number) =>
    `/magazine/read/${encodeURIComponent(slug)}${page ? `?page=${page}` : ""}`,
  login: (next?: string) => next ? `/login?next=${encodeURIComponent(next)}` : "/login",
  member: {
    home: () => "/my",
    saved: () => "/my/saved",
  },
} as const;
```

Dynamic builders must validate slugs at the content/data boundary. Do not concatenate user-controlled values into redirects without validation.

## Auth and entitlement routing contract

1. A request to `/my/saved` without a session redirects to `/login?next=%2Fmy%2Fsaved`.
2. Login validates `next` as a relative allowlisted path.
3. Successful authentication returns to the validated `next` destination; default is `/my`.
4. A user may view `/magazine/premium` while signed out.
5. Opening protected Premium content checks entitlement server-side.
6. A signed-out user is sent to login with `next` preserved.
7. A signed-in user without entitlement is sent to `/subscribe?next=<destination>`.
8. Checkout success returns to the original content or `/my/subscription`.

## Route-freeze acceptance tests

- Route manifest contains every frozen route and no unknown navigation target.
- Canonical pages emit self-referencing canonical metadata.
- Aliases issue the expected permanent redirect and never render duplicate content.
- Unknown slugs produce the framework 404 page.
- Search/archive/reader state survives refresh and back/forward navigation.
- All member routes are inaccessible without a real server session.
- All public Help Center links remain public; private ticket links use `/my/support`.
- Sitemap UI and XML sitemap are generated from the same registry.
