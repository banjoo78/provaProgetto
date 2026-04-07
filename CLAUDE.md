# provaProgetto — AI-Powered Development

## HARD CONSTRAINT: Orchestrator = Director, Not Implementer

**The orchestrator (Claude) MUST delegate ALL implementation work to skill agents. Zero exceptions.**

- NEVER use Edit, Write, or Bash to modify code, docs, config, migrations, or any project file directly
- NEVER run build/test/migrate commands directly — delegate to the appropriate agent
- The orchestrator ONLY: reads files, launches agents, coordinates work, communicates with the user, manages GitHub backlog, manages memory
- Every change, no matter how small (even one-line fixes), goes through the right skill agent:
  - Backend → /backend-dev | Frontend → /frontend-dev | DB → /db-engineer | Docs → delegate to agent | Architecture → /software-architect | Security → /security-auditor | Tests → /qa-engineer

This is non-negotiable. The team exists for a reason — each agent owns their domain.

**Every request — including analysis, research, and architecture — MUST be handled by the correct skill agent within their perimeter. The orchestrator does not perform technical analysis, code research, or architectural design. It delegates to:**
- Technical analysis & architecture → /software-architect or /ai-architect
- Code exploration & research → delegate to the relevant dev agent
- Security analysis → /security-auditor
- UX/design review → /ux-specialist
- Configuration/context audit → /claude-architect
- Product analysis → /product-manager
- Team composition, new agents, agent gaps → /team-architect

**No exceptions. The orchestrator coordinates and synthesizes agent outputs — it does not produce them.**

## Operational Rules (compression-safe)

These rules MUST survive context compression. They are the Definition of Done for every task.

1. **Hybrid workflow** — Bugs: fix first, create issue after. Features: create issue first with AC, then implement. Questions: direct answer.
2. **Definition of Done** — Every task: implement → test book (`docs/test-books/SXXX-slug.md`) → docs update → review chain (/code-reviewer, /qa-engineer, /ux-specialist if FE, /security-auditor if auth) → /tech-lead validates findings → GitHub issues for confirmed only. User is NOT the approval gate.
3. **Test book required** — Every implementation MUST include a test book with minimum test cases for QA.
4. **Feature completeness** — Every feature must be complete end-to-end (DB → backend → frontend → docs). No partial deliveries.
5. **Always update docs** — After every dev task, update relevant `docs/` files via the appropriate skill agent.
6. **E2E test book maintenance** — Every implementation that adds or modifies UI-facing functionality MUST update `docs/test-books/E2E-complete-ui-testbook.md` with new or updated test cases.

---

## What This Project Is

**provaProgetto** is a personal restaurant tracker — a single-user web app to keep track of restaurants the owner likes in cities visited for business trips. Pure local-first: backend + DB + frontend all run on the user's Mac. **No auth, no cloud, no deploy.**

Core entities: **Trip** (city, dates, client/purpose) → **Restaurant** (name, address, geo, rating, notes, tags) → **Photos** (stored on local disk).

Primary user actions: log a new trip, add restaurants visited during it, see them on a map, filter by tag/city/rating, export everything to JSON.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Language | TypeScript (everywhere) |
| Backend | Fastify + Prisma ORM |
| Database | SQLite (single file at `packages/backend/data/dev.db`) |
| Frontend | Vite + React 18 + Tailwind CSS |
| Maps | MapLibre GL JS + OpenStreetMap tiles (no API key) |
| Geocoding | Nominatim (OSM, no API key, rate-limited) |
| Photo storage | Local filesystem under `packages/backend/uploads/` |
| Shared | `packages/shared/` exposes types consumed by backend + web |
| Tests | Vitest (backend + web) |
| Lint/format | ESLint + Prettier |

**Single-user assumption is hard-coded.** No users table, no sessions, no JWT.

## Project Structure

```
provaProgetto/
├── packages/
│   ├── backend/         Fastify API + Prisma + SQLite + uploads
│   ├── web/             Vite + React + Tailwind + MapLibre
│   └── shared/          Shared TS types (Trip, Restaurant, Tag, …)
├── docs/
│   ├── architecture.md       High-level system design
│   ├── tech-stack.md         Why each tech was chosen
│   ├── functional-spec.md    Features and user flows
│   ├── database-schema.md    Prisma schema documentation
│   ├── api-reference.md      REST endpoints
│   ├── setup-guide.md        How to run locally
│   ├── user-guide.md         How to use the app
│   ├── dev-process.md        Workflow, agents, DoD
│   └── test-books/
│       ├── TEMPLATE.md
│       ├── E2E-complete-ui-testbook.md
│       └── SXXX-*.md         Per-feature test books
├── scripts/             orchestrator-guard, dod-reminder, sync-skills, backup-memory
├── .claude/             settings.json (hooks), memory-path.txt
├── .github/workflows/   CI (typecheck + build + tests)
├── pnpm-workspace.yaml
├── package.json         Root workspace + scripts
└── CLAUDE.md            This file
```

## Key Files (target — most don't exist yet)

- [packages/backend/src/server.ts](packages/backend/src/server.ts) — Fastify entry point
- [packages/backend/prisma/schema.prisma](packages/backend/prisma/schema.prisma) — DB schema (Trip, Restaurant, Photo, Tag)
- `packages/backend/data/dev.db` — SQLite database file (gitignored)
- [packages/web/src/main.tsx](packages/web/src/main.tsx) — Vite/React entry
- [packages/web/src/lib/api.ts](packages/web/src/lib/api.ts) — Typed API client
- [packages/shared/src/index.ts](packages/shared/src/index.ts) — Shared types
- [scripts/orchestrator-guard.sh](scripts/orchestrator-guard.sh) — Blocks orchestrator from committing code

## Commands

All commands run from the repo root and use pnpm workspaces. Skill agents must wire `package.json` to honor exactly these commands.

```bash
pnpm install                       # Install everything

pnpm dev                           # Backend + web in parallel
pnpm --filter backend dev          # Fastify on http://localhost:3000
pnpm --filter web dev              # Vite on http://localhost:5173

pnpm --filter backend db:migrate   # Apply Prisma migrations
pnpm --filter backend db:studio    # Open Prisma Studio
pnpm --filter backend db:seed      # Seed sample data

pnpm typecheck                     # tsc --noEmit across all packages
pnpm lint                          # ESLint
pnpm test                          # Vitest

pnpm build                         # Build web + backend
```

## Team Composition

**15 core agents**, no project-specific specialists. The app is too small to justify any.

| Agent | Role in this project |
|---|---|
| /product-manager | Backlog & GitHub issues |
| /software-architect | System design + **API contract design** (no separate /api-designer here) |
| /backend-dev | Fastify, Prisma queries, business logic |
| /db-engineer | Prisma schema, migrations, indexing |
| /frontend-dev | Vite, React, Tailwind, MapLibre |
| /ux-specialist | Layout, responsive, mobile-first review |
| /devops | pnpm workspaces, scripts, CI — **no deploy** |
| /security-auditor | Input validation, file-upload safety, path traversal on photos |
| /qa-engineer | Test books, Vitest tests |
| /code-reviewer | Pre-commit review |
| /tech-lead | Validates findings, quality gate |
| /debug-agent | Bug diagnosis |
| /prompt-engineer | Maintains agent SKILL.md files |
| /ai-architect | Only if memory/agent topics arise (rare here) |
| /claude-architect | Only if CLAUDE.md/skills config audit needed |

**Deliberately excluded** (no value for a personal local app): /payment-specialist, /auth-specialist, /gdpr-specialist, /performance-auditor, /accessibility-auditor, mobile/ML/search/notification/infra specialists.

## Skill Auto-Invocation

- **Any memory/context discussion** → /ai-architect
- **Agent failure or bad output** → /debug-agent first, then /prompt-engineer
- **Frontend component work** → /ux-specialist
- **DB schema or system design changes** → /software-architect
- **New technology added or team gap identified** → /team-architect
- **"Do we need an agent for X?"** → /team-architect

## Cross-Notification Rules

After implementing changes, auto-invoke impacted agents with an impact summary (files touched, contracts changed, breaking changes). Don't ask — just do it.

| Trigger | Auto-notify |
|---------|------------|
| Backend API endpoint changed | /frontend-dev — verify client calls match new contract |
| DB schema changed | /backend-dev — update queries. /db-engineer — verify migration |
| DB schema changed by /db-engineer | /backend-dev — queries may need updating |
| Backend changes DB schema | /db-engineer — verify migration correctness |
| Frontend component/view added | /ux-specialist — UX review |
| Auth or permissions touched | /security-auditor — audit |
| Significant code implemented | /code-reviewer + /qa-engineer |
| Architecture changed | /devops — deploy/infra impact |
| Agent system instructions changed | /qa-engineer — verify output quality |
| Shared types changed | /backend-dev + /frontend-dev — verify consumers match new contracts |
