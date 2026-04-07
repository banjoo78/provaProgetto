# Database Schema

> Owned by /db-engineer. Source of truth is `packages/backend/prisma/schema.prisma` once it exists. Update this file whenever the schema changes.

## Engine

SQLite — single file at `packages/backend/data/dev.db`. Backed by Prisma.

## Target schema (to be implemented during MVP)

### Trip
| Column | Type | Notes |
|---|---|---|
| id | Int / autoincrement | PK |
| city | String | Required |
| country | String? | Optional |
| startDate | DateTime | Required |
| endDate | DateTime | Required, ≥ startDate |
| client | String? | Free-form (e.g. "Acme SpA") |
| purpose | String? | Free-form |
| notes | String? | Markdown allowed |
| createdAt | DateTime | default now |
| updatedAt | DateTime | @updatedAt |

Indexes: `city`, `startDate`

### Restaurant
| Column | Type | Notes |
|---|---|---|
| id | Int / autoincrement | PK |
| tripId | Int | FK → Trip.id, onDelete: SetNull (a restaurant can outlive a deleted trip) |
| name | String | Required |
| address | String | Required (display string) |
| city | String | Denormalized from address for fast filtering |
| latitude | Float | Required (from Nominatim) |
| longitude | Float | Required |
| rating | Int | 1–5, required |
| notes | String? | Markdown allowed |
| visitedAt | DateTime? | Optional precise timestamp |
| createdAt | DateTime | default now |
| updatedAt | DateTime | @updatedAt |

Indexes: `tripId`, `city`, `rating`

### Tag
| Column | Type | Notes |
|---|---|---|
| id | Int / autoincrement | PK |
| name | String | Unique, lowercased on insert |

Many-to-many with Restaurant via implicit join table (`_RestaurantToTag`).

### Photo
| Column | Type | Notes |
|---|---|---|
| id | Int / autoincrement | PK |
| restaurantId | Int | FK → Restaurant.id, onDelete: Cascade |
| filename | String | Stored under `packages/backend/uploads/`, randomized name |
| originalName | String | What the user uploaded |
| mimeType | String | image/jpeg, image/png, image/webp only |
| sizeBytes | Int | For listing |
| createdAt | DateTime | default now |

Indexes: `restaurantId`

## Migration policy

- Every schema change goes through `prisma migrate dev --name <slug>`.
- Migrations live in `packages/backend/prisma/migrations/` and ARE committed.
- The dev DB (`data/dev.db`) is gitignored.
- A `db:seed` script creates a few sample trips + restaurants for fresh installs.

## Open questions
_None yet._
