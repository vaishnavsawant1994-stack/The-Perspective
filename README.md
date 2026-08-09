# The Perspective

The production foundation for a premium editorial publication, structured digital reader, and personal magazine platform. The project includes the permanent master design system, responsive global shell, master homepage, chronological Latest News experience, a cross-desk News discovery hub, reusable curated Category and Topic architectures, an author-led Opinion and Ideas destination, statically generated contributor profiles, a full editorial search experience, a long-form article reader, a premium Magazine landing, permanent Magazine category shelves, a URL-driven historical issue archive, and an accessible HTML magazine reader built on centralized issue data; database, authentication, CMS, payments, and subscriptions are intentionally deferred.

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

Shared components live in `src/components`, domain types in `src/types`, site-wide content/configuration in `src/config`, and centralized temporary data in `src/data/mock`. Local visual assets belong below `public/images` in the appropriate editorial category. The root page is the master editorial homepage, `/latest` provides the filterable chronological newsroom feed, `/news` curates current stories and routes durable subjects into `/topic/[slug]`, `/business`, `/leadership`, and `/technology` remain first-class editorial desks, `/perspective` is the author-led Opinion and Ideas landing, `/magazine` is the issue-led publication front door, `/magazine/category/[slug]` provides statically generated theme shelves across canonical issues and stories, `/magazine/archive` provides URL-driven issue discovery, `/magazine/read/[slug]` provides structured visual and accessible issue reading, `/search` provides free-form local discovery, `/author/[slug]` provides the statically generated contributor archive, and `/article/[slug]` renders every editorial story—including magazine stories—through one typed reader architecture. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed decisions.
