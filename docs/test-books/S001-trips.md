# Test Book — S001: Trip CRUD

**GitHub issue**: banjoo78/provaProgetto#1
**Owner agents**: /db-engineer, /backend-dev, /frontend-dev
**Related docs**: [design/S001-trip-design.md](../design/S001-trip-design.md), [api-reference.md](../api-reference.md), [database-schema.md](../database-schema.md)

## Scope

End-to-end CRUD for `Trip`: create, read (list + single), update, delete. Includes the Prisma model, the 5 REST endpoints under `/api/trips`, and the React UI (list / detail / create / edit / delete confirmation). **Out of scope**: restaurants, photos, tags, filters, geocoding — those are S002+.

## Test cases

| ID | Type | Description | Steps | Expected | Status |
|---|---|---|---|---|---|
| TC-1 | unit | Service creates a trip | call `createTrip(validInput)` | row inserted, returns `Trip` with ISO date strings | ✅ |
| TC-2 | unit | Service lists trips by createdAt desc | create 2, call `listTrips()` | newest first | ✅ |
| TC-3 | unit | `getTrip(unknown)` throws TRIP_NOT_FOUND | call with id 9999 | `ApiError(TRIP_NOT_FOUND, 404)` | ✅ |
| TC-4 | unit | `updateTrip` patches a single field | create then patch `{ city }` | returns updated Trip with new city, other fields unchanged | ✅ |
| TC-5 | edge | PATCH violates merged date range | create then patch `{ endDate }` < existing startDate | throws `INVALID_DATE_RANGE`, 400 | ✅ |
| TC-6 | unit | `updateTrip(unknown)` throws TRIP_NOT_FOUND | patch id 9999 | ApiError 404 | ✅ |
| TC-7 | unit | `deleteTrip(unknown)` throws TRIP_NOT_FOUND | delete id 9999 | ApiError 404 | ✅ |
| TC-8 | unit | `deleteTrip` removes a row | create then delete then get | second get throws 404 | ✅ |
| TC-9 | integration | GET /api/trips empty | inject GET on empty DB | 200, `[]` | ✅ |
| TC-10 | integration | GET /api/trips populated | create 2 then GET | 200, 2 items | ✅ |
| TC-11 | integration | POST /api/trips happy path | inject POST with valid body | 201 + Trip | ✅ |
| TC-12 | edge | POST with empty city | inject POST `city=""` | 400 `VALIDATION_ERROR`, fieldErrors.city | ✅ |
| TC-13 | edge | POST with endDate < startDate | inject POST | 400 `VALIDATION_ERROR`, fieldErrors.endDate | ✅ |
| TC-14 | integration | GET /api/trips/:id happy | inject GET on existing id | 200 + Trip | ✅ |
| TC-15 | integration | GET /api/trips/:id 404 | id 99999 | 404 `TRIP_NOT_FOUND` | ✅ |
| TC-16 | edge | GET /api/trips/abc | non-numeric id | 400 `INVALID_ID` | ✅ |
| TC-17 | integration | PATCH happy | patch existing | 200 + updated | ✅ |
| TC-18 | integration | PATCH 404 | id 99999 | 404 | ✅ |
| TC-19 | edge | PATCH triggers INVALID_DATE_RANGE | patch endDate before existing start | 400 `INVALID_DATE_RANGE` | ✅ |
| TC-20 | integration | DELETE happy | delete existing | 204, empty body | ✅ |
| TC-21 | integration | DELETE 404 | id 99999 | 404 | ✅ |
| TC-22 | integration | GET /health | inject GET /health | 200 `{ ok: true }` | ✅ |
| TC-23 | unit (UI) | TripCard renders city, country, dates, client | render with sample trip | text appears in DOM | ✅ |
| TC-24 | unit (UI) | TripCard shows "In corso" badge when today ∈ range | render with start=yesterday end=tomorrow | badge present | ✅ |
| TC-25 | unit (UI) | TripCard hides badge for past trips | render with 2020 dates | no badge | ✅ |
| TC-26 | unit (UI) | TripCard links to /trips/:id | render | `<a href="/trips/1">` | ✅ |
| TC-27 | e2e | Create flow | open /trips/new, fill form, submit | redirect to /trips/:id, new card appears in list | ☐ |
| TC-28 | e2e | Edit flow | open detail, click "Modifica", change city, save | detail shows new city, list reflects change | ☐ |
| TC-29 | e2e | Delete flow | open detail, click "Elimina", confirm | redirected to list, card gone | ☐ |
| TC-30 | e2e | Cancel delete | open detail, click "Elimina", click "Annulla" | dialog closes, trip still present | ☐ |
| TC-31 | e2e | Empty state | fresh DB | "Nessun viaggio ancora" + CTA visible | ☐ |
| TC-32 | e2e | Form validation: empty city | submit with city="" | inline error, no API call | ☐ |
| TC-33 | e2e | Form validation: endDate < startDate | submit | inline error on endDate | ☐ |
| TC-34 | e2e | "In corso" badge | create a trip whose range contains today | badge appears in list and detail | ☐ |
| TC-35 | e2e | Date format dd/MM/yyyy | view a trip | dates render Italian format | ☐ |

### Test types
- **unit** → Vitest, service or pure component
- **integration** → Vitest + Fastify `app.inject()` + temp SQLite
- **edge** → boundary / error paths
- **e2e** → manual browser steps (Playwright deferred)

## Manual QA checklist

- [ ] `pnpm dev` boots backend on :3000 and web on :5173 without errors
- [ ] Empty state renders the welcome CTA
- [ ] Create → list → detail → edit → delete loop works
- [ ] Confirm dialog closes on Escape and on backdrop click
- [ ] Form shows server-side validation errors keyed to the right field
- [ ] "In corso" badge appears for trips overlapping today
- [ ] Dates display as `dd/MM/yyyy`
- [ ] No console errors in DevTools
- [ ] Resize to mobile (375px): cards stack to 1 column, form is usable

## Automated test counts

- Backend: **22 tests** (`packages/backend/tests/`) — all green
- Web: **4 tests** (`packages/web/src/components/TripCard.test.tsx`) — all green

## Regression risks

This is the first feature — no prior test books to re-run. Establishes patterns (error envelope, ApiError, query keys, route layout) that all subsequent stories will reuse.
