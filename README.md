# The Perspective

> **V1 program source of truth:** [The Perspective V1.0 Master Completion Bible](./docs/THE-PERSPECTIVE-V1-MASTER-COMPLETION-BIBLE.md)
>
> Accepted engineering baseline: R1–R4. R5 and later stages require separate authorization and checkpointed qualification.

The production foundation for a premium editorial publication, structured digital reader, and personal magazine platform. The planned public frontend V1 includes the permanent design system and responsive shell, editorial home and discovery routes, reusable Category and Topic architectures, contributor and Personal Magazine profiles, a URL-driven Personal Magazine collection, full editorial search, a long-form article reader, Magazine landing and category shelves, Premium and subscription positioning, a historical issue archive, and an accessible HTML magazine reader built on centralized data; database, authentication, CMS, CRM, real payments, and subscription enforcement are intentionally deferred.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production check, run `npm run lint` followed by `npm run build`; serve the completed build with `npm start`.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the local Next.js development server |
| `npm run lint` | Run ESLint across the project |
| `npm run build` | Create an optimized production build |
| `npm start` | Serve the production build |

## Project conventions

The root route is the 1200px, light-theme master editorial homepage. It owns a dense four-tier news header, 440px skyline-led leadership cover story, live/news/market dashboard, fully populated magazine and media shelves, discovery modules, membership, newsletter, and compact publication footer. This shell is isolated to `/`, so completed discovery and reader routes retain the shared site header and footer.

`/personal-magazines` is the permanent server-rendered collection for the configured Personal Magazine editions. Its optional `q` parameter performs normalized URL-driven discovery across canonical Person identity and edition framing without client-side search. `/personal-magazines/[slug]` statically renders the Arjun Mehta, Sophia Reynolds, and Daniel Kim editions. The collection and profiles reuse canonical people, articles, and local imagery; a dedicated Personal Magazine Reader, inquiry backend, CRM, authentication, payment, database, and generated PDF remain deliberately deferred. Stage 21 completes the planned public frontend V1, so the next work is a whole-system frontend audit rather than another public page.

Shared components live in `src/components`, domain types in `src/types`, site-wide content/configuration in `src/config`, and centralized temporary data in `src/data/mock`. Local visual assets belong below `public/images` in the appropriate editorial category. The root page is the master editorial homepage, `/latest` provides the filterable chronological newsroom feed, `/news` curates current stories and routes durable subjects into `/topic/[slug]`, `/business`, `/leadership`, and `/technology` remain first-class editorial desks, `/perspective` is the author-led Opinion and Ideas landing, `/magazine` is the issue-led publication front door, `/magazine/premium` is its canonical Premium-edition catalogue, `/magazine/subscribe` compares the future Reader, Digital, and Premium access levels, `/magazine/category/[slug]` provides statically generated theme shelves across canonical issues and stories, `/magazine/archive` provides URL-driven issue discovery, `/magazine/read/[slug]` provides structured visual and accessible issue reading, `/personal-magazines` provides person-led publication discovery, `/search` provides free-form local discovery, `/author/[slug]` provides the statically generated contributor archive, and `/article/[slug]` renders every editorial story—including magazine stories—through one typed reader architecture. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed decisions.
