# The Perspective

The production foundation for a premium editorial publication, magazine reader, and future personal magazine platform. The project includes the permanent master design system, responsive global shell, master homepage, chronological Latest News experience, reusable curated category architecture, and statically generated long-form article reader; database, authentication, CMS, and subscriptions are intentionally deferred.

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

Shared components live in `src/components`, domain types in `src/types`, site-wide content/configuration in `src/config`, and centralized temporary data in `src/data/mock`. Local visual assets belong below `public/images` in the appropriate editorial category. The root page is the master editorial homepage, `/latest` provides the filterable chronological newsroom feed, `/business` and `/leadership` are configuration-driven curated category landings, and `/article/[slug]` renders every article through one typed reader architecture. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed decisions.
