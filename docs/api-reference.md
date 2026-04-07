# API Reference

> Owned by /software-architect (contracts) + /backend-dev (implementation). Update whenever a route changes.

Base URL: `http://localhost:3000/api`

All responses are JSON unless noted. All bodies are JSON unless noted (photo upload uses multipart).

## Conventions

- Errors: `{ "error": { "code": "STRING", "message": "human-readable" } }` with HTTP 4xx/5xx
- Dates: ISO 8601 strings
- IDs: integers
- Pagination: not used in MVP (datasets are small)

## Target endpoints (to be implemented during MVP)

### Trips — **LOCKED for S001** (full contract in [design/S001-trip-design.md](design/S001-trip-design.md))

| Method | Path | Body | Success | Errors |
|---|---|---|---|---|
| GET | `/api/trips` | — | 200 `Trip[]` (newest first by createdAt) | 500 |
| GET | `/api/trips/:id` | — | 200 `Trip` | 400 `INVALID_ID`, 404 `TRIP_NOT_FOUND` |
| POST | `/api/trips` | `TripCreateInput` (Zod) | 201 `Trip` | 400 `VALIDATION_ERROR` / `INVALID_DATE_RANGE` |
| PATCH | `/api/trips/:id` | `TripUpdateInput` (Zod, partial) | 200 `Trip` | 400, 404 |
| DELETE | `/api/trips/:id` | — | 204 (empty) | 400, 404 |

S001 returns trips standalone — restaurants are added in S002 (and the GET will then optionally include nested restaurants depending on the route).

### Restaurants
- `GET    /restaurants` — list all, supports query filters: `?city=&tag=&minRating=&tripId=`
- `GET    /restaurants/:id` — single restaurant with photos and tags
- `POST   /trips/:id/restaurants` — create a restaurant under a trip
- `PATCH  /restaurants/:id` — update
- `DELETE /restaurants/:id` — delete (cascades to photos)

### Photos
- `POST   /restaurants/:id/photos` — multipart upload (field `file`, max 5 MB, jpeg/png/webp)
- `DELETE /photos/:id` — delete a photo (also removes the file on disk)
- Static: `GET /uploads/:filename` — served by Fastify static

### Tags
- `GET    /tags` — list all tags with usage counts

### Geocoding (proxy)
- `GET    /geocode?q=…` — proxies Nominatim, rate-limited to 1 req/sec, cached

### Export
- `GET    /export` — returns the entire dataset as JSON (trips + restaurants + tags + photo metadata)

## Validation

All inputs validated with **Zod schemas** defined in `packages/shared/` and reused on both ends. Backend rejects with HTTP 400 + structured error.

## Status

🚧 Not implemented yet — this is the contract `/software-architect` + `/backend-dev` will honor.
