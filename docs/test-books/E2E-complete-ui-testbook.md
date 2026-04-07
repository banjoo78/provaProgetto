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
| _none yet_ | _MVP not started_ | _Will populate as features ship_ | — |

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
