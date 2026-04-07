# Test Book — SXXX: <Feature title>

> Copy this file to `SXXX-feature-slug.md` for every feature. Owned by /qa-engineer.

## Feature

**GitHub issue**: #N
**Owner agent**: /backend-dev | /frontend-dev | /db-engineer | …
**Related docs**: links to architecture / api-reference / database-schema sections

## Scope

One paragraph describing what is being tested and what is explicitly out of scope.

## Test cases

| ID | Type | Description | Steps | Expected | Status |
|---|---|---|---|---|---|
| TC-1 | unit | … | 1. … 2. … | … | ☐ |
| TC-2 | integration | … | 1. … 2. … | … | ☐ |
| TC-3 | e2e | … | 1. … 2. … | … | ☐ |
| TC-4 | edge | … | 1. … 2. … | … | ☐ |

### Test types
- **unit** — Vitest, isolated function/component
- **integration** — Vitest, exercises Fastify route + Prisma against a temp SQLite
- **e2e** — manual or Playwright steps in the browser
- **edge** — boundary conditions, error paths, validation failures

## Manual QA checklist

- [ ] Feature works on desktop (Chrome, Safari)
- [ ] Feature works on mobile viewport (iPhone-size, touch interaction)
- [ ] No console errors
- [ ] Loading and empty states render correctly
- [ ] Error messages are clear
- [ ] Data persists after refresh

## Regression risks

What existing functionality could this change break? List specific test cases from other test books that should be re-run.
