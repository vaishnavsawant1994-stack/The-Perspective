# Architecture

## Structure

```text
src/
  app/                  Routes, metadata, and route boundaries
  components/
    layout/             Site shell, containers, navigation, footer
    ui/                 Accessible low-level primitives
    common/             Reusable editorial composition helpers
    article/            Future article presentation components
    magazine/           Future magazine presentation components
    person/             Future profile presentation components
    search/             Future search presentation components
  config/               Site identity, navigation, contact and footer data
  data/mock/            Small, typed fixtures for UI development
  features/             Future feature-level application modules
  hooks/                Shared client hooks only when required
  lib/                  Framework-agnostic utilities
  styles/               Future extracted style modules when global tokens are insufficient
  types/                Database-ready editorial domain models
public/images/           Organized local editorial assets
```

Directories for future component families are introduced only when the first real implementation needs them. Empty asset directories are retained because they define the approved local-media taxonomy.

## Component rules

- Pages compose shared components and do not duplicate the header, footer, cards, navigation data, containers, or typography rules.
- `layout` owns page structure, `ui` owns small accessible primitives, and domain folders own editorial presentation.
- Components accept typed data. Large datasets never live inside route files.
- Native semantic elements are preferred. Visible focus, keyboard access, useful alt text, and labelled navigation are baseline requirements.

## Server and Client Components

Components are Server Components by default. Add `"use client"` only at the narrowest interactive boundary requiring state, event handlers, browser APIs, or client-only hooks. Currently, only mobile navigation and the route error boundary need that directive. Data fetching should remain server-side wherever possible.

## Design system

Global tokens in `src/app/globals.css` define editorial colors, typography families, responsive display scales, focus behavior, shadows, and wide-display breakpoints. Tailwind utilities consume those tokens. The system favors square editorial surfaces, strong serif display typography, restrained accent color, thin rules, and deliberate whitespace over dashboard-like cards or decorative effects.

Containers remain fluid from 320px through large displays, with maximum widths at 1600px, 1920px, and 2560px breakpoints. Sections should reorganize their grid and reading order rather than uniformly shrinking.

## Mock data

`src/data/mock` exports small realistic arrays matching the domain types. These fixtures validate components during frontend work and are never accessed through fake API calls. A future repository/data-access layer can replace imports without changing presentation contracts.

## Future database architecture

When Supabase is introduced, PostgreSQL records will map to the types in `src/types`. Server-only repository modules should translate database rows to domain objects. Browser database access should be limited to features that genuinely need real-time client behavior. Authentication, storage policies, validation schemas, migrations, and Row Level Security will be designed together in that later phase; none are stubbed in the foundation.

Likely entities include profiles, authors, articles, categories, tags, article tags, magazines, issues, pages, plans, subscriptions, saved articles, reading history, media, and SEO metadata.
