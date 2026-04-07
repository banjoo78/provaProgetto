# Architecture

> Owned by /software-architect. Update whenever system design changes.

## Overview

provaProgetto is a **single-user, local-first web application**. Three layers, all running on the user's Mac:

```
┌─────────────────────────────────────────────────────┐
│  Browser (http://localhost:5173)                    │
│  ┌────────────────────────────────────────────┐    │
│  │  Vite + React + Tailwind + MapLibre GL     │    │
│  └─────────────────┬──────────────────────────┘    │
└────────────────────┼────────────────────────────────┘
                     │ HTTP (JSON, fetch)
                     │ + static files (/uploads/*)
┌────────────────────▼────────────────────────────────┐
│  Fastify (http://localhost:3000)                    │
│  ┌────────────────────────────────────────────┐    │
│  │  REST routes  ←→  services  ←→  Prisma     │    │
│  │  multipart upload → uploads/*.jpg          │    │
│  │  Nominatim proxy (geocoding)               │    │
│  └─────────────────┬──────────────────────────┘    │
└────────────────────┼────────────────────────────────┘
                     │ Prisma Client
┌────────────────────▼────────────────────────────────┐
│  SQLite (packages/backend/data/dev.db)              │
│  Tables: Trip, Restaurant, Photo, Tag, _RestTag     │
└─────────────────────────────────────────────────────┘
```

## Design principles

1. **Local-first** — no network round trips except map tiles and geocoding.
2. **Single user** — no auth, no users table, no multi-tenancy.
3. **Type-safe end-to-end** — `packages/shared` exposes the canonical TS types; backend exports Zod schemas, frontend imports types.
4. **Boring tech** — Fastify, Prisma, React, Vite. No experiments.
5. **Zero secrets, zero API keys** — OpenStreetMap + Nominatim are free without keys. Photos live on disk.
6. **Fast feedback loop** — `pnpm dev` runs everything; SQLite means no Docker required.

## Key flows

### Add a restaurant during a trip
1. User creates a Trip (city, dates, optional client).
2. From the Trip page, user clicks "Add restaurant".
3. User types name + address; frontend calls `/api/geocode?q=…` (Fastify proxies to Nominatim).
4. Frontend shows the address candidates on a mini-map; user picks one.
5. User adds rating, notes, tags, optional photos (uploaded via multipart).
6. POST `/api/trips/:id/restaurants` → backend persists Restaurant + photo metadata.

### View map
- GET `/api/restaurants` returns all restaurants with lat/lng.
- Frontend renders MapLibre with one marker per restaurant; clicking opens a side panel.
- Filters (city, tag, rating) re-query the API.

### Export
- GET `/api/export` returns the entire dataset as JSON (trips + restaurants + photos as base64 or paths).

## Boundaries

- **No background jobs.** Everything is request/response.
- **No real-time.** No WebSocket, no polling.
- **No external storage.** Photos always on local disk under `packages/backend/uploads/`.
- **No emails, no notifications.**
- **No CI deploy step.** CI only typechecks, lints, and runs tests.

## Open questions

_None yet — to be filled as architectural decisions are made._
