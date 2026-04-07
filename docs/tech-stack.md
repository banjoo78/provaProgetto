# Tech Stack — Rationale

> Owned by /software-architect + /devops. Update whenever a tech choice changes.

Every choice below is optimized for **a personal local-first app built solo**. The constraints are: no users, no deploy, no budget, fast iteration, easy maintenance.

| Choice | Why | Alternatives rejected |
|---|---|---|
| **TypeScript everywhere** | One language, shared types, great DX | JS (no type safety), Python (extra runtime, fewer shared types) |
| **pnpm workspaces** | Simple monorepo, fast installs, strict deps | npm/yarn workspaces (slower), turborepo (overkill) |
| **Fastify** | Fast, tiny, great TS support, minimal magic | Express (slower, no native TS), NestJS (overkill), Hono (less mature on Node) |
| **Prisma** | Type-safe queries, great migrations, auto-generated client | Drizzle (less mature ecosystem), raw SQL (boilerplate), TypeORM (heavier) |
| **SQLite** | Single file, zero config, perfect for one user, backup = copy file | Postgres (needs Docker for one user), JSON file (no queries) |
| **Vite + React** | Fastest dev server, simple, no SSR overhead | Next.js (SSR not needed), Remix (SSR not needed), Svelte (smaller ecosystem for maps) |
| **Tailwind CSS** | Mobile-first responsive trivial, no CSS files to manage | CSS modules (more files), styled-components (runtime cost) |
| **MapLibre GL JS** | Free, OSS, no API key, vector tiles, smooth interaction | Google Maps (API key, billing), Leaflet (raster only, less smooth) |
| **OpenStreetMap tiles** | Free forever, no key | Mapbox (free tier but key + billing risk) |
| **Nominatim geocoding** | Free, no key, OSM data | Google Geocoding (key + billing), Mapbox Geocoding (key) |
| **Local filesystem for photos** | Trivial, fast, backup = copy folder | S3/MinIO (overkill for one user) |
| **Vitest** | Fast, Vite-native, Jest-compatible API | Jest (slower, more config) |
| **ESLint + Prettier** | Standard | — |

## Things explicitly NOT in the stack

- **No Docker** — SQLite + Node is enough on a Mac. Docker would slow dev startup.
- **No auth library** — single user, no login.
- **No state library** (Redux/Zustand) — React state + TanStack Query is enough.
- **No UI component library** (MUI/Chakra/shadcn) — Tailwind primitives + a few custom components keep the bundle small. May reconsider if forms get unwieldy.
- **No deployment platform** — runs on the user's Mac, period.

## Versions

To be locked when /devops scaffolds `package.json`. Target: latest stable as of project start.

- Node ≥ 20 LTS
- pnpm ≥ 9
- TypeScript ≥ 5.4
- Fastify ≥ 4
- Prisma ≥ 5
- React ≥ 18
- Vite ≥ 5
- Tailwind ≥ 3.4
- MapLibre GL JS ≥ 4
