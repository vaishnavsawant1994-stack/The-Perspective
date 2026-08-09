# The Perspective

The production foundation for a premium editorial publication, magazine reader, and future personal magazine platform. The project includes the permanent master design system, responsive global shell, master homepage, chronological Latest News experience, a cross-desk News and Topics hub, reusable curated category architecture, an author-led Opinion and Ideas destination, statically generated contributor profiles, a full editorial search experience, and a statically generated long-form article reader; database, authentication, CMS, and subscriptions are intentionally deferred.

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

Shared components live in `src/components`, domain types in `src/types`, site-wide content/configuration in `src/config`, and centralized temporary data in `src/data/mock`. Local visual assets belong below `public/images` in the appropriate editorial category. The root page is the master editorial homepage, `/latest` provides the filterable chronological newsroom feed, `/news` curates current stories and topics across desks, `/business`, `/leadership`, and `/technology` are configuration-driven curated category landings, `/perspective` is the author-led Opinion and Ideas landing, `/search` provides URL-driven local discovery across editorial records, `/author/[slug]` provides the statically generated contributor archive, and `/article/[slug]` renders every article through one typed reader architecture. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed decisions.
