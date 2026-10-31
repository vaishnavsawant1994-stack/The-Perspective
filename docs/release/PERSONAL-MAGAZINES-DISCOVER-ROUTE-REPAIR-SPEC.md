# Personal Magazine discovery route repair

**Scope:** Frozen V1 route repair only. Implementation is on `docs/personal-magazines-discover-route-spec`; PR #41 remains a draft pending exact-head GitHub checks, responsive/cross-browser acceptance, and owner review. Candidate base is `main@fb7c87ed4bcc6eacbb047ce3a9925213ae5b8ab2` (PR #39 Node 24 CI release). No Company/People Profile Network routes, database migrations, provider integrations, or AI automation are included.

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
- Verify generated `/robots.txt` points to `https://the-perspective-liart.vercel.app/sitemap.xml`. The currently deployed pre-PR #41 build still points at the placeholder `theperspective.example`; this is a confirmed production indexing defect and will be corrected when this route fix is released.

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
| Robots sitemap origin | GET `/robots.txt` | Sitemap directive uses the verified production host, never `theperspective.example` |

## Release evidence

- `npm ci`: passed from the lockfile on Node.js 24.20.0; audit reported 0 vulnerabilities.
- `npm run lint`: passed with 0 errors and 3 existing warnings. `npm run typecheck`, `npm run db:validate`, and `npm audit`: passed with no findings.
- Unit suite: 625/625 passed with local-only sessions configuration, a test key, and a closed database URL at `127.0.0.1:1`; no database connection was made.
- Next.js 16.4.3 production build passed and generated 475 static pages; the route table includes `/personal-magazines/discover`, `/robots.txt`, and `/sitemap.xml`.
- Local production-build smoke: discovery returned 200 with the expected heading and canonical; sitemap/robots used the verified production host; an unknown profile slug returned HTTP 404.
- Playwright 1.55.0 cross-browser acceptance on the local production build: Chromium 140.0.7339.16, Firefox 141.0, and WebKit 26.0 passed discovery, search submission, category navigation, edition-card navigation, and unknown-slug 404. At 390x844, 768x1024, and 1440x900 there was no horizontal overflow or broken image. Initial discovery loads had no page or console errors. Chromium and WebKit log the expected 404 resource diagnostic only when the deliberately unknown slug is requested; Firefox did not.
- Desktop and mobile full-page screenshots were visually inspected; the responsive layout stacks controls and cards without clipping.
- Code candidate `d3790fc8f82302709e6e31eb4cbea065536e2576` merges `main@fb7c87ed4bcc6eacbb047ce3a9925213ae5b8ab2`. The documentation-only current PR head is `60d0f5b8c2e05eb375000f033a395abeea665911`. The exact current head passed 16/16 Node 24 R3-R14 workflows and Vercel Preview.
- Vercel Preview deployment `dpl_HLrn287kBRBQbfzJyRA4TkRy7Mf7` is READY at `https://the-perspective-9t3e2vqz6-vishnu26.vercel.app`. Current-head preview smoke: discovery 200 with unique title, canonical and heading; `/robots.txt` points to `https://the-perspective-liart.vercel.app/sitemap.xml`; `/sitemap.xml` includes discovery and has no `.example` host; unknown profile slug is HTTP 404.
- Production on `main@fb7c87e` still serves a soft 404 for discovery and `.example` URLs in `robots.txt`/sitemap. The candidate's shared `siteConfig.url` correction addresses both discovery metadata and robots/sitemap output; it has not been deployed to production.
- Responsive and cross-browser checks are complete for the stated viewports and tested journeys. PR #41 remains draft and unmerged pending owner review and fresh required checks after this evidence update.

V1.0 certification remains open until the broader R14 gates and independent review pass.
