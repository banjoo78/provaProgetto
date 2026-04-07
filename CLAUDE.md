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

## Project Structure

[TO BE FILLED: describe your project structure here]

Not specified

## Key Files

[TO BE FILLED: list key entry points and important files]

## Commands

[TO BE FILLED: common dev commands]

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
