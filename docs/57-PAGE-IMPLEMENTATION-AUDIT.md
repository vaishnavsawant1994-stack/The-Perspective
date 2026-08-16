# The Perspective — 57-Page Implementation Audit

Audit date: 13 August 2026  
Audit inputs:

- `C:\Users\HP\Downloads\the-perspective-master-57-page-connection-route-map.md`
- `C:\Users\HP\Downloads\the-perspective-master-57-page-route-matrix.csv`
- `C:\Users\HP\.codex\attachments\96737d62-a472-4af6-93f3-a1b1b1170375\pasted-text.txt`
- Current project under `D:\The Perspective`

## Executive result

The project contains nearly all approved visual designs, but its route architecture and backend state do not yet match the master map.

| Audit dimension | Result |
| --- | --- |
| Approved designs | 57 |
| Canonical/framework routes already present | 41 |
| Implemented on a legacy or folded route | 15 |
| Completely missing design/route | 1 — Page 30, Advertise / Partner / Media Kit |
| Route files currently in `src/app` | 57, including legacy and unapproved routes |
| Production API routes | 1 — `/api/contact` |
| Real authentication/session provider | None |
| Database/content API | None; editorial data is local fixture data |
| Payment/subscription provider | None |
| Server-side protection for member routes | None; the existing proxy validates only magazine-reader slugs |
| Build-time single route registry | None |

The most important conclusion is that this is **not a 57-page visual rebuild**. It is a route normalization, shell extraction, data-contract, and backend integration project around a mostly implemented design set.

## Status language

- **Implemented** — approved visual page exists at the frozen route.
- **Route mismatch** — visual page exists, but not at the source-of-truth route.
- **Folded** — visual design is embedded in another approved page instead of having its own route.
- **Partial** — visual page exists but the reusable template, error boundary, or operational behavior is incomplete.
- **Missing** — no matching route/design exists.
- **Fixture** — content is local static/mock data.
- **Demo state** — interaction updates React/local browser state only.
- **Static / N/A** — no backend is required for the core document page, though operational controls may still need services.

## 57-page ledger

| # | Approved page | Frozen route | Current implementation | Design status | Data / backend status | Required action |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | Home | `/` | `/` → `HomepageRedesign` | Implemented | Fixture content; no CMS | Bind curated home payload later |
| 2 | News / Latest News | `/latest` | `/latest` → `LatestNewsPage` | Implemented | Fixture feed; no live/CMS source | Keep route; define feed contract |
| 3 | Magazine Landing | `/magazine` | `/magazine` → `MagazineRedesign` plus legacy content | Implemented, composition-heavy | Fixture issues | Consolidate the redesign/legacy composition behind `MagazineSystem` |
| 4 | Personal Magazines Landing | `/personal-magazines` | `/personal-magazines` renders landing, discovery, and legacy collection content | Implemented, over-composed | Fixture profiles; no lead pipeline | Keep only Page 4 landing concerns on this route |
| 5 | Podcasts | `/podcasts` | `/podcasts` → `PodcastsPage` | Implemented | Fixture shows/episodes; no feed/audio service | Define podcast catalogue/player contract |
| 6 | Videos | `/videos` | `/videos` → `VideosPage` | Implemented | Fixture videos; no video/transcript service | Define video catalogue/player contract |
| 7 | Blogs | `/perspective` with `/blogs` alias | `/perspective` → `BlogsRedesign` plus legacy perspective content; `/blogs` is 404 | Route mismatch | Fixture articles | Preserve established `/perspective`; redirect `/blogs` to it |
| 8 | Authors | `/authors` | `/authors` → `AuthorsPage` | Implemented | Fixture contributors | Add contributor directory contract |
| 9 | Search Results | `/search?q={query}&type={type}&sort={sort}` | `/search` → `SearchRedesign` and local search library | Implemented | In-memory search only | Replace with indexed search service and URL-owned filters |
| 10 | Events & Summits | `/events` | `/events` → `EventsPage` | Implemented | Fixture events | Add event CMS/registration provider |
| 11 | Article Detail | `/article/[slug]` | `/article/[slug]` → `ArticleReader` | Implemented | Fixture article catalogue | Add CMS lookup, saved state, media/transcript services |
| 12 | News Category | `/{categorySlug}` | Concrete `/business`, `/leadership`, `/technology`; business has dedicated redesign | Partial template | Fixture categories | Extract one category template and a category registry; keep concrete routes if desired |
| 13 | Magazine Reader | `/magazine/read/[issueSlug]?page={n}&view={visual|text}` | `/magazine/read/[slug]` → reader variants | Implemented | Fixture pages; UI state only | Normalize param name and persist progress/access |
| 14 | Magazine Archive | `/magazine/archive?q={query}&year={year}&type={type}` | `/magazine/archive` → archive redesign | Implemented | Fixture issues and client filters | Add issue index/query contract |
| 15 | Magazine Category | `/magazine/category/[slug]` | Exact route and redesign | Implemented | Fixture category issues | Add category query contract |
| 16 | Premium Magazine Listing | `/magazine/premium` | Exact route and redesign | Implemented | Fixture premium status | Add entitlement enforcement |
| 17 | Magazine Subscription / Plans | `/subscribe` | Implemented at `/magazine/subscribe`; `/subscribe` is 404 | Route mismatch | Demo pricing; no checkout | Move canonical page to `/subscribe`; redirect old path; integrate billing |
| 18 | Personal Magazine Profile | `/personal-magazines/[slug]` | Exact route and redesign | Implemented | Fixture profiles | Add profile/issue CMS contract |
| 19 | Personal Magazine Discovery | `/personal-magazines/discover` | Design folded into `/personal-magazines`; canonical route is 404 | Folded route | Fixture discovery | Create distinct route using existing discovery component |
| 20 | Create Your Personal Magazine | `/personal-magazines/create` | Exact route | Implemented | Form/design only; no lead workflow | Add validated lead submission and CRM handoff |
| 21 | Topic Detail | `/topic/[slug]` | Exact route and redesign | Implemented | Fixture topics | Add topic aggregation contract |
| 22 | Author Profile | `/author/[slug]` | Exact route and redesign | Implemented | Fixture authors/articles | Add contributor/article joins |
| 23 | Executive / Person Profile | `/people/[slug]` | Exact route and redesign | Implemented | Fixture people/coverage | Add entity and coverage joins |
| 24 | Podcast Show Detail | `/podcasts/[showSlug]` | `/podcasts/[slug]` | Implemented | Fixture show/episodes | Normalize param name and add feed data |
| 25 | Podcast Episode Detail | `/podcasts/[showSlug]/[episodeSlug]` | Exact route structure | Implemented | Fixture episode/player/transcript | Add audio, progress, transcript, saves |
| 26 | Video Detail | `/videos/[slug]` | Exact route structure | Implemented | Fixture video/player/transcript | Add video hosting, progress, transcript, saves |
| 27 | Event / Summit Detail | `/events/[slug]` | Exact route and detail component | Implemented | Fixture event/speakers/agenda | Add registration/ticketing backend |
| 28 | About The Perspective | `/about` | Exact route | Implemented | Static / N/A | Move editable brand content to CMS later |
| 29 | Contact / Editorial Enquiries | `/contact` | Exact route plus `/api/contact` | Implemented | Minimal working API; no durable CRM/email shown | Add persistence, mail/CRM delivery, abuse protection |
| 30 | Advertise / Partner / Media Kit | `/advertise` | Route returns 404; no matching page component | Missing | Missing lead/media-kit workflow | Build from approved Page 30 design and connect lead form/download |
| 31 | Newsletter / Briefings Hub | `/newsletters` | Implemented at `/newsletter`; canonical route is 404 | Route mismatch | Demo subscribe controls | Move to `/newsletters`; redirect singular path; add ESP integration |
| 32 | Help Center | `/help` | Exact route | Implemented | Fixture guides/FAQs | Add searchable knowledge base/CMS |
| 33 | Login | `/login` | Exact route via `AuthPage` | Implemented | Demo validation and `localStorage`; no session | Add auth provider, server session, errors, `next` handling |
| 34 | Sign Up | `/signup` | Exact route via `AuthPage` | Implemented | Demo validation and `localStorage`; no account creation | Add identity provider, consent records, verification trigger |
| 35 | Forgot Password | `/forgot-password` | Exact route via `AuthPage` | Implemented | Demo sent/error state only | Add token issuance, email delivery, reset route |
| 36 | Email Verification | `/verify-email` | Exact route via `AuthPage` | Implemented | Static/demo states | Add verification token validation/resend/change email |
| 37 | Member Dashboard | `/my` | Implemented at `/my-perspective` | Route mismatch | Fixture member data; public, client-only | Create `/my`, server-protect it, load member dashboard data |
| 38 | Saved Articles | `/my/saved` | Implemented at `/my-perspective/saved` | Route mismatch | Demo state; no persistence | Canonical route, auth guard, saved-library API |
| 39 | Following | `/my/following` | Implemented at `/my-perspective/following` | Route mismatch | Demo state; no persistence | Canonical route, following/notification APIs |
| 40 | Newsletter Preferences | `/my/newsletters` | Implemented at `/my-perspective/newsletters` | Route mismatch | Demo toggles; no ESP sync | Canonical route, preference store, ESP sync |
| 41 | Subscription Management | `/my/subscription` | Implemented at `/my-perspective/subscription` | Route mismatch | Fixture plan; no billing provider | Canonical route, entitlement and billing portal integration |
| 42 | Billing & Payment History | `/my/billing` | Implemented at `/my-perspective/billing` | Route mismatch | Fixture transactions | Canonical route, invoices/payment methods/provider webhooks |
| 43 | Profile & Account Settings | `/my/settings` | Implemented at `/my-perspective/settings` | Route mismatch | Demo forms; no account persistence | Canonical route, profile/security/session APIs |
| 44 | Notifications Center | `/my/notifications` | Implemented at `/my-perspective/notifications` | Route mismatch | Fixture notifications | Canonical route, notification store/read state/delivery rules |
| 45 | Digital Magazine Library | `/my/magazines` | Implemented at `/my-perspective/magazines` | Route mismatch | Fixture entitlements/progress | Canonical route, entitlement/library/progress APIs |
| 46 | Event Registrations | `/my/events` | Implemented at `/my-perspective/events` | Route mismatch | Fixture tickets/events | Canonical route, registrations, tickets, calendar payloads |
| 47 | Help / Support Requests | `/my/support` | Implemented at `/my-perspective/support` | Route mismatch | Client-only ticket/reply state | Canonical route, private support ticket API, attachments |
| 48 | 404 / Not Found | framework not-found, optional `/404` | `src/app/not-found.tsx` → `ErrorStatePage` | Implemented | Static / N/A | Keep framework boundary; optional preview alias only if required |
| 49 | 500 / General Error | framework error/global-error, optional `/500` | `error.tsx` and `/500`; no `global-error.tsx` | Partial system coverage | Static / N/A | Add root `global-error.tsx`; retain `/500` as preview only |
| 50 | Maintenance | `/maintenance` | Exact route → `MaintenancePage` | Implemented | UI only; no operational switch/status service | Add maintenance rewrite/flag, status source, notification form |
| 51 | Privacy Policy | `/privacy` | Exact route via `LegalPage` | Implemented | Static policy; controls/downloads are presentation | Add versioned policy source and privacy-request workflows |
| 52 | Terms of Use | `/terms` | Exact route via `LegalPage` | Implemented | Static / N/A | Add version/effective-date governance |
| 53 | Cookie Policy | `/cookies` | Exact route via `LegalPage` | Implemented | Static UI; no consent manager | Add real consent store and preference enforcement |
| 54 | Editorial Standards | `/editorial-standards` | Exact route via `LegalPage` | Implemented | Static policy; correction CTA not integrated | Add corrections/complaints workflow and policy governance |
| 55 | Accessibility Statement | `/accessibility` | Exact route via `LegalPage` | Implemented | Static policy; report CTA not integrated | Add accessibility issue workflow and test evidence |
| 56 | Community Guidelines | `/community-guidelines` | Exact route via `LegalPage` | Implemented | Static policy; reporting/appeal not integrated | Add moderation report and appeal workflows |
| 57 | Sitemap | `/sitemap` | Exact route → hardcoded `SitemapPage` | Implemented but manually maintained | Static | Generate from the frozen route registry; add XML sitemap separately |

## Existing routes outside the frozen 57

These current paths are not separate approved templates in the master matrix:

| Current route | Current role | Freeze recommendation |
| --- | --- | --- |
| `/news` | Separate legacy news landing | Redirect to `/latest` unless product explicitly approves it as an additional page |
| `/perspective` | Existing editorial/blog canonical | Retain as canonical because the master document explicitly says to preserve it; make `/blogs` an alias |
| `/magazine/subscribe` | Existing subscription page | Redirect permanently to `/subscribe` |
| `/newsletter` | Existing newsletter hub | Redirect permanently to `/newsletters` |
| `/my-perspective/*` | Existing member experience | Redirect to equivalent `/my/*` path after auth-aware canonical routes exist |
| `/500` | Manual error preview | Keep for QA only; production errors use framework boundaries |

## High-risk findings

1. **No route registry:** header, footer, `siteConfig`, redesign components, and legacy components each own paths independently.
2. **Known 404 links exist:** examples include `/premium`, `/finance`, `/markets`, `/culture`, `/lifestyle`, `/sign-in`, business subpaths, and perspective subpaths.
3. **Global shell is unconditional:** the root layout always adds the same membership newsletter and footer to public, auth, member, error, and legal pages, even when those designs already contain their own conversion/footer regions.
4. **Member pages are public:** the existing `src/proxy.ts` validates only `/magazine/read/:slug`; it does not perform session checks or protect the current `/my-perspective/*` routes.
5. **Auth is a demo:** login/signup store email values in `localStorage`; forgot/verify are local visual states.
6. **One API route:** only `/api/contact` exists. There are no APIs for saved items, following, newsletters, billing, notifications, library, events, support, consent, or editorial workflows.
7. **Monolithic member implementation:** all 11 member pages and their fixtures live in one large client component.
8. **Duplicate redesign/legacy composition:** several routes append old content after the new approved design. This was useful during design development but should be separated before production.
9. **No production data layer:** there is no CMS client, database ORM, auth provider, payment SDK, email provider, or observability SDK in `package.json`.
10. **Sitemap is not authoritative:** it is a visual hardcoded page, not generated from the route source of truth.

## Audit acceptance gates

The implementation should not be considered route-complete until all of these pass:

- Every frozen public path returns its intended design.
- Every legacy path either redirects to one frozen path or is explicitly approved as an extra page.
- Every internal link resolves to a frozen route, a valid dynamic entity, or an external URL.
- `/my/*` redirects unauthenticated users to `/login?next=<encoded-path>` and restores the destination after authentication.
- Entitlement checks happen on the server for Premium magazine/article access.
- Error boundaries, maintenance routing, and not-found behavior are verified independently from their preview pages.
- The HTML sitemap and XML sitemap are generated from the same route registry.
- Desktop, tablet, and mobile visual regression checks pass for each reusable page family, not only each individual route.

## Visual QA limitation

This audit verified source structure, rendered HTTP status, component composition, and backend signals. The in-app browser inspection plugin could not initialize because its packaged `browser-safety.md` dependency was missing. A screenshot-level pixel audit should therefore be run as a separate acceptance gate once the browser tooling is available.
