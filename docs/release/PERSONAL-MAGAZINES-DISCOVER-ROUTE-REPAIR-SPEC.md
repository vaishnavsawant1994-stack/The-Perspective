# Personal Magazine discovery route repair

**Scope:** Frozen V1 route repair only. Implementation is on `docs/personal-magazines-discover-route-spec`; PR #41 remains a draft pending exact-head GitHub checks and owner review. No Company/People Profile Network routes, database migrations, provider integrations, or AI automation are included.

## Contract decision

The approved 57-page ledger calls route 19 `/personal-magazines/discover`, marks it a public page, says its design is folded into the landing page, and recommends `Create distinct route using existing discovery component`. The V1 Master Completion Bible independently lists route 19 as a public route. This establishes a distinct canonical discovery URL; a redirect to `/personal-magazines` would not preserve the frozen route contract. The original defect was the missing page module being consumed by the `[slug]` profile route. That route now renders the new discovery page; unknown slugs retain their not-found behavior.

## Minimal implementation

- Implement `src/app/personal-magazines/discover/page.tsx` using `PersonalMagazineDiscoveryRedesign` and resolved edition data. The profile `[slug]` resolver remains unchanged.
- Add a unique title/description and `/personal-magazines/discover` canonical metadata; keep `/personal-magazines` on the collection page. Add the discovery route to the public sitemap.
- Add a visible discovery link from the Personal Magazines landing page. Existing page-local anchors now target the actual collection-intro section.
- Remove fallback profile cards, invented category/inventory counts, non-functional sort/region selectors and an unverified testimonial from the shared discovery experience. Cards now link to existing canonical editions; industry links derive from resolved edition expertise.
- Preserve all existing landing page discovery sections and its search behavior. Search from the discovery route may navigate to the existing `/personal-magazines?q=...` results contract; preserve URL encoding and the user-entered query.
- Keep unknown slug handling unchanged; verify an unknown `/personal-magazines/{slug}` returns HTTP 404 and the not-found view.
- Correct the shared canonical origin to the project’s verified production domain, `https://the-perspective-liart.vercel.app`; Vercel’s project domain list reports this as the project’s production alias.

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

- `npm ci`: completed from the lockfile; zero vulnerabilities reported.
- `npm run typecheck`: passed after implementation.
- Full unit suite: 625/625 passed with the documented local-only dummy auth/database settings before the final copy/metadata adjustments.
- Production build: passed on Next.js 16.4.3; route table includes `/personal-magazines/discover`.
- Local production-server smoke: discovery returned HTTP 200 and the expected heading; canonical was `https://the-perspective-liart.vercel.app/personal-magazines/discover`; unknown slug returned HTTP 404 with not-found content; sitemap contains the production discovery URL.
- Desktop visual inspection: local page opened at `http://localhost:4317/personal-magazines/discover` and displayed its catalogue.
- Cross-browser and mobile viewport checks remain pending; exact-head GitHub qualification for the implementation branch is pending.

V1.0 certification remains open until the broader R14 gates and independent review pass.
