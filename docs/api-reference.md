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

### Trips
- `GET    /trips` — list all trips, newest first
- `GET    /trips/:id` — single trip with its restaurants
- `POST   /trips` — create trip
- `PATCH  /trips/:id` — update trip
- `DELETE /trips/:id` — delete trip (restaurants are kept, `tripId` set to null)

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
