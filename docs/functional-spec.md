# Functional Spec

> Owned by /product-manager. Lives next to GitHub issues — issues are the source of truth for individual stories; this file is the bird's-eye view.

## Vision

Keep a personal, searchable record of restaurants I like in cities I visit for business trips, so when I go back I never have to remember "what was that good place near the office last time?"

## User

One person: me. No accounts, no sharing, no permissions. The app trusts whoever opens it on `localhost`.

## MVP scope

The MVP is "done" when I can:

1. **Log a trip** — city, start/end date, optional client/purpose
2. **Add a restaurant** to a trip — name, address (with autocompletion via Nominatim), rating 1–5, free-text notes, tags (free-form), optional photos
3. **See all restaurants on a map** — pins on MapLibre, click for details
4. **Filter** — by city, by tag, by minimum rating, by trip
5. **Edit / delete** trips and restaurants
6. **Export everything to JSON** — backup safety net

That's the entire MVP. Ship it, then iterate.

## Out of scope (forever or for now)

- ❌ Multi-user / sharing — never
- ❌ Cloud sync — never
- ❌ Social features (likes, comments, public lists) — never
- ❌ Reservation booking — never
- ❌ Recommendations / "similar restaurants" — not now
- ❌ Native mobile app — not now (responsive web is enough)
- ❌ Offline support — not now (Mac is always on)

## User journeys

### J1 — Logging a new trip
> *I just landed in Milano for a 3-day client visit.*
1. Open the app on Mac.
2. Click "New trip" → form: city (Milano), dates (Apr 15–17), client ("Acme SpA").
3. Trip created, navigates to trip page.

### J2 — Adding a restaurant after dinner
> *Just had a great pizza, want to log it before I forget.*
1. From the active Milano trip page, click "Add restaurant".
2. Type name "Da Mario" → type address "Via Roma 12" → autocomplete shows candidates → pick one.
3. Rating 5, note "best margherita ever, ask for Tonio", tags `pizza`, `cheap`, `walk-in-ok`.
4. Drag in 2 photos from Finder.
5. Save. Restaurant appears on the trip's list and on the global map.

### J3 — Going back six months later
> *Going back to Milano. What did I like last time?*
1. Click "Trips" → filter by city "Milano" → see all past trips.
2. Click any → see all restaurants visited.
3. Or: open the map, filter `city=Milano`, see all pins.
4. Or: filter `tag=pizza, rating≥4` to find dinner-worthy places.

### J4 — Backup before reinstalling Mac
1. Click "Export" → downloads `provaProgetto-backup.json`.
2. Save the file + the `uploads/` folder somewhere safe.

## Success criteria

The app is successful if I actually use it during my next 3 trips and don't abandon it. That's the only metric that matters.
