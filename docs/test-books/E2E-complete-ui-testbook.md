# E2E — Complete UI Test Book

> Owned by /qa-engineer. **Every implementation that adds or modifies UI MUST update this file.** This is the canonical full-app UI regression suite.

## Scope

Every user-facing flow in the app, end-to-end, executed manually or via Playwright. Per-feature test books (`SXXX-*.md`) cover detailed unit/integration tests; this file covers the complete user-perceivable behavior.

## Test environment

- Backend running on `localhost:3000` with seeded data
- Web running on `localhost:5173`
- Browser: latest Chrome on Mac
- Mobile viewport: iPhone 14 Pro emulated in DevTools (390×844)

## Test cases

| ID | Area | Description | Status |
|---|---|---|---|
| E01 | Trips | Empty state: visit `/` with no trips → see "Nessun viaggio ancora" + CTA button | ☐ |
| E02 | Trips | Create a trip via `/trips/new` → after submit, redirected to `/trips/:id`, card visible in list | ☐ |
| E03 | Trips | Open a trip from the list → all fields render correctly with `dd/MM/yyyy` dates | ☐ |
| E04 | Trips | Edit a trip via `/trips/:id/edit` → changes persist, list reflects update | ☐ |
| E05 | Trips | Delete a trip → confirm dialog appears, after confirming, redirected to list, card removed | ☐ |
| E06 | Trips | Cancel delete → dialog closes via "Annulla" button, Escape key, and backdrop click; trip still present | ☐ |
| E07 | Trips | Form validation: empty `city` → inline error, no API call | ☐ |
| E08 | Trips | Form validation: `endDate` < `startDate` → inline error on endDate field | ☐ |
| E09 | Trips | "In corso" badge shows on a trip whose `[startDate, endDate]` contains today (in list and detail) | ☐ |
| E10 | Trips | Mobile viewport (390px): list cards stack to single column, form is fully usable | ☐ |

### Template row

```
| EXX | Trips | User can create a trip with city, dates, and client | ☐ |
```

## Sections to populate during MVP

- **E1–E10** Trip CRUD
- **E11–E25** Restaurant CRUD (incl. photo upload)
- **E26–E35** Map view & interaction
- **E36–E45** Filters & search
- **E46–E50** Export
- **E51–E55** Mobile viewport responsiveness
- **E56–E60** Error states & empty states

## Smoke checklist (run before every commit that touches UI)

- [ ] App loads without console errors
- [ ] Map renders with tiles visible
- [ ] List of trips loads
- [ ] Adding a trip works
- [ ] Adding a restaurant works
- [ ] Photo upload works
- [ ] Filters update results
- [ ] Mobile viewport works (test at 390px wide)
