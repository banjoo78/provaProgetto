# S001 — Trip CRUD: Technical Design

> Owned by /software-architect. Spec for /db-engineer, /backend-dev, /frontend-dev to implement.
> GitHub: banjoo78/provaProgetto#1

## 1. Prisma model

Lives in `packages/backend/prisma/schema.prisma`.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./data/dev.db"
}

model Trip {
  id        Int      @id @default(autoincrement())
  city      String
  country   String?
  startDate DateTime
  endDate   DateTime
  client    String?
  purpose   String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([city])
  @@index([startDate])
}
```

**Notes**:
- SQLite stores `DateTime` as ISO-8601 strings under the hood. Prisma exposes them as JS `Date`. Backend serializes to ISO strings on the way out.
- `endDate ≥ startDate` is **not enforced at the DB level** (SQLite has weak CHECK support via Prisma). Enforced in the **Zod schema** + service layer.
- No explicit length limit — SQLite TEXT is unbounded; Zod caps at 200 chars per string field for sanity.

## 2. Shared TS types & Zod schemas

Lives in `packages/shared/src/trip.ts`.

```ts
import { z } from 'zod';

const trimmedString = (max: number) =>
  z.string().trim().min(1).max(max);

const optionalTrimmedString = (max: number) =>
  z.string().trim().max(max).optional().or(z.literal('').transform(() => undefined));

// ISO date string at the wire boundary; coerce to Date in service layer
const isoDate = z.string().datetime({ offset: true });

export const TripCreateInput = z
  .object({
    city: trimmedString(120),
    country: optionalTrimmedString(120),
    startDate: isoDate,
    endDate: isoDate,
    client: optionalTrimmedString(200),
    purpose: optionalTrimmedString(500),
    notes: optionalTrimmedString(5000),
  })
  .refine((d) => new Date(d.endDate) >= new Date(d.startDate), {
    message: 'endDate must be greater than or equal to startDate',
    path: ['endDate'],
  });

export type TripCreateInput = z.infer<typeof TripCreateInput>;

export const TripUpdateInput = TripCreateInput.partial().refine(
  (d) => {
    if (d.startDate && d.endDate) {
      return new Date(d.endDate) >= new Date(d.startDate);
    }
    return true;
  },
  { message: 'endDate must be greater than or equal to startDate', path: ['endDate'] },
);

export type TripUpdateInput = z.infer<typeof TripUpdateInput>;

// Response shape — dates always serialized as ISO strings
export interface Trip {
  id: number;
  city: string;
  country: string | null;
  startDate: string; // ISO 8601
  endDate: string;
  client: string | null;
  purpose: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}
```

**Validation rules implemented above**:
- `city` required, trimmed, 1–120 chars
- `startDate` and `endDate` required ISO datetime
- `endDate ≥ startDate` (refine)
- All optional strings: trimmed, capped, empty string normalized to `undefined`

`packages/shared/src/index.ts` re-exports everything from `trip.ts`:
```ts
export * from './trip';
```

## 3. REST endpoint contracts

Base path: `/api`. All responses are JSON. All bodies are JSON (no multipart in S001).

### GET /api/trips
- **Purpose**: list all trips, newest first (`ORDER BY createdAt DESC`)
- **Query params**: none in S001 (filters are S006)
- **Response 200**: `Trip[]`
- **Errors**: 500 only (DB failure)

### GET /api/trips/:id
- **Path param**: `id` (positive integer)
- **Response 200**: `Trip`
- **Response 404**: `{ error: { code: 'TRIP_NOT_FOUND', message: 'Trip 42 not found' } }`
- **Response 400**: invalid id format → `INVALID_ID`

### POST /api/trips
- **Body**: `TripCreateInput` (validated by Zod)
- **Response 201**: the created `Trip`
- **Response 400**: `VALIDATION_ERROR` with field details (see error format below)

### PATCH /api/trips/:id
- **Path param**: `id`
- **Body**: `TripUpdateInput` (all fields optional, but the resulting state must still satisfy `endDate ≥ startDate`)
- **Response 200**: the updated `Trip`
- **Response 404**: `TRIP_NOT_FOUND`
- **Response 400**: `VALIDATION_ERROR` or `INVALID_DATE_RANGE`

### DELETE /api/trips/:id
- **Path param**: `id`
- **Response 204**: empty body
- **Response 404**: `TRIP_NOT_FOUND`

> S001 deletes hard-delete the trip. From S002 onward, restaurants will reference `tripId` with `onDelete: SetNull` so deleting a trip preserves its restaurants as orphans.

## 4. Error format

Canonical envelope used by ALL error responses across the entire API:

```json
{
  "error": {
    "code": "TRIP_NOT_FOUND",
    "message": "Trip 42 not found",
    "details": {
      "fieldErrors": {
        "endDate": "endDate must be greater than or equal to startDate"
      }
    }
  }
}
```

`details` is optional. For Zod validation failures, `details.fieldErrors` is a flat `{ [path]: message }` map.

### Error codes used in S001
| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Body failed Zod schema |
| `INVALID_ID` | 400 | Path param `:id` is not a positive integer |
| `INVALID_DATE_RANGE` | 400 | endDate < startDate after PATCH merge |
| `TRIP_NOT_FOUND` | 404 | No trip with that id |
| `INTERNAL_ERROR` | 500 | Catch-all (Prisma exception, etc.) |

The error envelope is built by helpers in `packages/backend/src/lib/errors.ts`.

## 5. Backend file layout

```
packages/backend/
├── prisma/
│   ├── schema.prisma           # Trip model (above)
│   └── migrations/
│       └── (created by db:migrate)
├── src/
│   ├── server.ts               # Fastify entry — registers plugins, routes, error handler, listens on :3000
│   ├── lib/
│   │   ├── prisma.ts           # PrismaClient singleton
│   │   └── errors.ts           # ApiError class + buildErrorResponse + global error handler
│   ├── routes/
│   │   └── trips.ts            # Fastify plugin with all 5 trip routes; uses Zod via fastify-type-provider-zod
│   └── services/
│       └── tripService.ts      # Pure business logic over Prisma — list/get/create/update/delete
├── tests/
│   ├── trips.routes.test.ts    # Integration tests against temp SQLite
│   └── tripService.test.ts     # Unit tests
├── data/                       # SQLite file (gitignored)
├── package.json
└── tsconfig.json
```

**Layering**:
- `routes/trips.ts` is dumb: parses input, calls service, returns response, maps errors.
- `services/tripService.ts` owns business logic (validation refinements, error throwing).
- `lib/prisma.ts` is the single source of `PrismaClient` to avoid connection leaks in tests.

## 6. Frontend file layout

```
packages/web/
├── index.html
├── src/
│   ├── main.tsx                # React + Router + QueryClient mount
│   ├── App.tsx                 # Layout shell with nav
│   ├── routes.tsx              # React Router v6 route table
│   ├── lib/
│   │   ├── api.ts              # Typed fetch wrapper (apiClient.trips.list / get / create / …)
│   │   └── queryClient.ts      # TanStack Query client config
│   ├── pages/
│   │   ├── TripsListPage.tsx   # / — list of trips, "New trip" button, empty state
│   │   ├── TripDetailPage.tsx  # /trips/:id — show one trip, edit/delete buttons
│   │   └── TripFormPage.tsx    # /trips/new and /trips/:id/edit — same form, two modes
│   ├── components/
│   │   ├── TripCard.tsx        # Card used in TripsListPage
│   │   ├── EmptyState.tsx      # Reusable empty state with icon + CTA
│   │   ├── ConfirmDialog.tsx   # Generic confirm modal (reused for delete)
│   │   └── DateRangeInput.tsx  # Two date inputs side-by-side with validation
│   └── styles/
│       └── index.css           # Tailwind directives
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

## 7. Routing & data fetching decisions

### Frontend router: **React Router v6** ✅
- De facto standard for Vite + React
- File layout decoupled from URL structure (we want this for nested routes later: `/trips/:id/restaurants/:rid`)
- Bundle cost is acceptable (~10 KB gzipped)
- **Alternatives rejected**: TanStack Router (newer, smaller community), no router (impossible past 2 pages)

### Data fetching: **TanStack Query (@tanstack/react-query) v5** ✅
For 7 stories that all hit the same backend, plain fetch + hooks would mean reimplementing caching, refetch on focus, mutation invalidation, loading/error states 7 times. TanStack Query gives all of this for free.

- Caching keyed by query → seamless cross-page consistency (TripsListPage and TripDetailPage share data)
- Mutations with `invalidateQueries` → after POST/PATCH/DELETE, list refetches automatically
- ~13 KB gzipped — acceptable

**Alternatives rejected**:
- Plain fetch + hooks: too much repeated boilerplate; loading/error/refetch logic everywhere
- SWR: equivalent to TanStack Query but smaller community; no compelling reason
- Redux Toolkit Query: server state in a global store is overkill for this app

### State management: **React state only** ✅
- Local UI state: `useState`, `useReducer`
- Server state: TanStack Query (handles caching, no need for Redux)
- URL state: React Router params + search params (filters in S006)
- **No** Redux, Zustand, Jotai, MobX — would be net negative

### API client style: typed thin wrapper around `fetch`
`packages/web/src/lib/api.ts` exposes:
```ts
export const apiClient = {
  trips: {
    list: () => fetchJson<Trip[]>('/api/trips'),
    get: (id: number) => fetchJson<Trip>(`/api/trips/${id}`),
    create: (data: TripCreateInput) => fetchJson<Trip>('/api/trips', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: TripUpdateInput) => fetchJson<Trip>(`/api/trips/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: number) => fetchJson<void>(`/api/trips/${id}`, { method: 'DELETE' }),
  },
};
```
`fetchJson` handles JSON parse + throws a typed `ApiError` on non-2xx with the structured error body. TanStack Query mutations wrap these.

## 8. Open decisions for the user

These are small but worth flagging since the user is Italian:

1. **Date display format** — Recommend Italian `dd/MM/yyyy` (e.g. "15/04/2026"). Stored as ISO at the wire/DB level. Use `Intl.DateTimeFormat('it-IT')`.
2. **Notes rendering** — Plain text for MVP (no markdown). Markdown can come later if needed; saves a `react-markdown` dep.
3. **Trip "active" indicator** — Should the UI highlight a trip whose `[startDate, endDate]` contains today? **Recommend yes**, as a small visual badge ("In corso"). Trivial to implement.
4. **Default sort** — Newest `createdAt` first. Could also be by `startDate` desc — recommend `createdAt` since it's more "what did I add last".
5. **Currency / language** — UI in **Italian** (matches user's language). Strings should be hard-coded Italian for MVP; no i18n framework.

If no objection raised, defaults above will be used.

## 9. What's NOT in this design

- Restaurants, tags, photos, map, filters, export — those are S002–S007.
- Authentication — never (single-user app).
- Soft delete — hard delete is fine for one user.
- Pagination — datasets are small.
- Rate limiting — local-only, no abuse vector.
