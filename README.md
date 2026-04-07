# provaProgetto

A personal restaurant tracker — log the restaurants I like in cities I visit for business trips, view them on a map, filter by tag/city/rating.

**Single user. Local-first. No cloud, no auth, no deploy.**

## Stack

- **Monorepo**: pnpm workspaces
- **Backend**: Fastify + Prisma + SQLite
- **Frontend**: Vite + React + Tailwind + MapLibre GL
- **Maps**: OpenStreetMap (no API key)
- **Geocoding**: Nominatim (no API key)
- **Tests**: Vitest

See [docs/tech-stack.md](docs/tech-stack.md) for the rationale.

## Quick start

```bash
pnpm install
pnpm --filter backend db:migrate
pnpm dev
```

Then open <http://localhost:5173>.

Full setup instructions: [docs/setup-guide.md](docs/setup-guide.md).

## Documentation

- [Architecture](docs/architecture.md)
- [Tech stack rationale](docs/tech-stack.md)
- [Functional spec](docs/functional-spec.md)
- [Database schema](docs/database-schema.md)
- [API reference](docs/api-reference.md)
- [Setup guide](docs/setup-guide.md)
- [User guide](docs/user-guide.md)
- [Dev process](docs/dev-process.md)
- [Test books](docs/test-books/)

## How this project is built

This project is developed by a team of AI skill agents coordinated by an orchestrator.
The orchestrator never writes code directly — it delegates to the right specialist
(backend-dev, frontend-dev, db-engineer, ux-specialist, etc.).

See [CLAUDE.md](CLAUDE.md) for the operational rules and team composition.
