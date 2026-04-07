# Setup Guide

> Owned by /devops. Update when commands or prerequisites change.

## Prerequisites

- **macOS** (project is Mac-only by design)
- **Node.js** ≥ 20 LTS
- **pnpm** ≥ 9 — install with `npm install -g pnpm`
- **Git**
- **GitHub CLI** (`gh`) — only if you want to use the issue/project workflows

That's it. No Docker, no Postgres, no Redis, no env files with API keys.

## First-time setup

```bash
cd ~/Desktop/provaProgetto
pnpm install
pnpm --filter backend db:migrate    # Creates packages/backend/data/dev.db
pnpm --filter backend db:seed       # Optional: load sample data
```

## Daily development

```bash
pnpm dev
```

Backend on <http://localhost:3000>, web on <http://localhost:5173>. Open the web URL in your browser.

## Useful commands

```bash
# Database
pnpm --filter backend db:studio     # Visual DB browser (Prisma Studio)
pnpm --filter backend db:reset      # Drops + recreates the DB

# Quality
pnpm typecheck                      # tsc --noEmit
pnpm lint                           # ESLint
pnpm test                           # Vitest

# Production build (still local)
pnpm build
```

## Backup

The whole app's state lives in two places:

1. `packages/backend/data/dev.db` — the SQLite file
2. `packages/backend/uploads/` — the photos folder

Copy both to backup. Or use the in-app **Export to JSON** button.

## Troubleshooting

- **Permission denied on the project folder** — run `sudo chown -R fabio:staff /Users/fabio/Desktop/provaProgetto` once.
- **`pnpm dev` says port already in use** — `lsof -ti:3000 | xargs kill -9`
- **Map shows blank tiles** — you're offline. MapLibre needs internet for OSM tiles.
- **Geocoding returns nothing** — Nominatim rate limit. Wait a few seconds and retry.

## Status

🚧 Most commands above will work after `/devops` scaffolds `package.json` and `pnpm-workspace.yaml` during the MVP.
