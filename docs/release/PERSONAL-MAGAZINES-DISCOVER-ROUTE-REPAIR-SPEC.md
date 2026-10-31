# Personal Magazine discovery route repair specification

**Scope:** Frozen V1 route repair only. Do not change the Company/People Profile Network proposal or introduce a database migration, provider integration, or AI automation.

## Contract decision

The approved 57-page ledger calls route 19 `/personal-magazines/discover`, marks it a public page, says its design is folded into the landing page, and recommends ?Create distinct route using existing discovery component.? The V1 Master Completion Bible independently lists route 19 as a public route. This establishes a distinct canonical discovery URL; a redirect to `/personal-magazines` would not preserve the frozen route contract. The route is currently missing and is consumed by the `[slug]` profile route, which renders not-found content with an HTTP 200 streaming response.

## Minimal implementation

- Add `src/app/personal-magazines/discover/page.tsx` as a static public route using the existing `PersonalMagazineDiscoveryRedesign` and existing resolved edition data. Do not add a second discovery experience or alter the profile `[slug]` resolver.
- Give the route a unique title/description and canonical URL `/personal-magazines/discover`; keep `/personal-magazines` canonical on the collection page. Add the route to the sitemap only if the existing public-route sitemap contract includes it.
- Add a visible internal link to discovery from the Personal Magazines landing page and ensure any header/menu link targets the same canonical URL. Existing discovery links that intend a page-local anchor must resolve on the route or point to a real section; do not leave `#original-personal-magazine-content` dangling when the component is rendered alone.
- Review fallback people, category counts, sorting and region selectors. Do not present fabricated counts or non-functional controls as live inventory. Keep the current fixture-based disclosure boundary; link profile cards only to existing canonical editions or explicitly supported search results.
- Preserve all existing landing page discovery sections and its search behavior. Search from the discovery route may navigate to the existing `/personal-magazines?q=...` results contract; preserve URL encoding and the user-entered query.
- Do not alter unknown slug handling. Ensure an unknown `/personal-magazines/{slug}` remains a genuine not-found response with HTTP 404 and a not-found view.

## Acceptance test matrix

| Case | Request/action | Expected response or behavior |
| --- | --- | --- |
| Canonical discovery | GET `/personal-magazines/discover` | HTTP 200; discovery page heading and catalogue render; canonical link equals `/personal-magazines/discover`; no redirect |
| Route identity | Visit `/personal-magazines` then follow its discovery link | Browser URL becomes `/personal-magazines/discover`; landing page remains available at its own URL |
| Search submission | Search a known name/theme from discovery | URL encodes query and navigates to the documented `/personal-magazines?q=...` results page; result state and clear-search link work |
| Filter/category links | Activate each visible industry/theme link | Each link reaches the supported collection search state; no dead route, empty control, or unencoded query |
| Discovery card | Open a profile/edition card | Destination resolves to an existing canonical `/personal-magazines/{edition-slug}` page |
| Unknown profile slug | GET `/personal-magazines/definitely-not-a-real-edition` | HTTP 404 and not-found view; no soft-404 HTTP 200 |
| Page rendering | Chromium desktop at 1440x900 | No console errors, missing assets, horizontal overflow, or empty anchor destinations; keyboard search and links work |
| Responsive | Chromium 390x844 and 768x1024 | Hero, search, categories, cards and sidebar reflow without clipping or horizontal overflow; interactive targets remain usable |
| Cross-browser | Chromium, Firefox, WebKit at desktop and mobile widths | Core route, search and card navigation work consistently; record browser/version and exact candidate SHA |
| Metadata/indexing | Inspect rendered head and sitemap | Unique title/description; canonical identity correct; one sitemap entry if included by contract; no duplicate canonical URL |

## Release evidence

Run exact-head lint, typecheck, unit and applicable route tests, production build, and browser smoke on the candidate. Check rendered status and page content separately because the current failure streams a not-found view with HTTP 200. Keep V1.0 certification open until the broader R14 gates and independent review pass.
