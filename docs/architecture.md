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

## Frontend stack details (locked during S001 design)

- **Router**: React Router v6 — standard, supports nested routes for `/trips/:id/restaurants/:rid` later.
- **Server state / data fetching**: **TanStack Query v5** — caching, refetch on focus, automatic invalidation on mutations. Avoids reimplementing fetch boilerplate across 7 stories.
- **Local UI state**: React `useState` / `useReducer` only.
- **URL state**: React Router params + search params (used for filters in S006).
- **No global client store** (no Redux/Zustand/Jotai). TanStack Query covers all server state needs.
- **API client**: thin typed wrapper around `fetch` in `packages/web/src/lib/api.ts`. Throws a structured `ApiError` on non-2xx. TanStack Query mutations wrap it.

## Backend conventions (locked during S001 design)

- **Layering**: `routes/` are thin (parse → service → respond), `services/` own business logic over Prisma, `lib/` holds the Prisma singleton and error helpers.
- **Validation**: Zod schemas live in `packages/shared/`, reused by backend (via `fastify-type-provider-zod`) and frontend.
- **Errors**: canonical envelope `{ error: { code, message, details? } }`. Codes are uppercase snake_case. See [design/S001-trip-design.md](design/S001-trip-design.md) §4.
- **Dates**: ISO 8601 strings at the wire boundary. Prisma `DateTime` ↔ JS `Date` internally.

## ADRs

1. **TanStack Query over plain fetch** (S001) — accepted ~13 KB cost for huge DX win across all 7 stories.
2. **No DB-level CHECK constraint for endDate ≥ startDate** (S001) — SQLite + Prisma support is weak; enforced in Zod + service.
3. **Hard delete for trips in S001** — soft delete deferred until a real need appears.
4. **UI language: Italian** — single user is Italian; no i18n framework needed.

## Open questions

_None yet — to be filled as architectural decisions are made._
