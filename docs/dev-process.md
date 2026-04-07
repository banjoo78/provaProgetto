# Development Process

> Owned by /tech-lead. Update whenever workflow rules change.

## Golden rule

**The orchestrator (Claude) never writes code.** Every change — even one-line fixes — goes through the right skill agent. See [CLAUDE.md](../CLAUDE.md) for the hard constraint and the agent directory.

## Workflow

### Bugs
1. Reproduce → /debug-agent isolates root cause
2. Fix → relevant dev agent
3. Test → /qa-engineer adds/updates a test in the relevant test book
4. Review → /code-reviewer
5. Validate findings → /tech-lead
6. **Then** create a GitHub issue (post-fix) so the bug is logged

### Features
1. /product-manager writes a GitHub issue with acceptance criteria, label `story`, points, sprint, epic
2. /software-architect designs (DB schema delta, API contract, key components)
3. /db-engineer ships the migration
4. /backend-dev implements endpoints
5. /frontend-dev implements UI
6. /ux-specialist reviews the UI (mobile-first, responsive)
7. /qa-engineer creates `docs/test-books/SXXX-slug.md` and updates `E2E-complete-ui-testbook.md`
8. /security-auditor reviews if file uploads or path handling are touched
9. /code-reviewer reviews the diff
10. /tech-lead validates all findings, decides what's blocking
11. Docs updated by the responsible agents (architecture, api-reference, database-schema, user-guide as needed)
12. Commit references the issue (`closes #N`)

### Questions
Direct answer from the orchestrator if it's a clarification. If it needs technical depth, delegate.

## Definition of Done

Every task is "done" only when all of these are true:

- [ ] Implementation complete
- [ ] Tests added/updated and passing
- [ ] Test book file exists in `docs/test-books/`
- [ ] `E2E-complete-ui-testbook.md` updated if UI changed
- [ ] Relevant docs updated (architecture, api-reference, database-schema, user-guide, setup-guide)
- [ ] /code-reviewer approved
- [ ] /qa-engineer approved
- [ ] /ux-specialist approved (if frontend touched)
- [ ] /security-auditor approved (if uploads, paths, or external data touched)
- [ ] /tech-lead validated findings
- [ ] GitHub issue closed by the commit

`scripts/dod-reminder.sh` is the manual checklist. The orchestrator-guard hook (`scripts/orchestrator-guard.sh`) blocks commits of `.ts/.tsx/.js/.jsx/.py/.go/.rs/.sql` files made directly by the orchestrator.

## Agent directory

See the **Team Composition** section in [CLAUDE.md](../CLAUDE.md) for the full list of 15 core agents and what each owns in this project.

## Cross-notification

When an agent finishes work, they auto-invoke any agent listed in CLAUDE.md's "Cross-Notification Rules" table whose trigger fired. They include a short impact summary (files touched, contracts changed, breaking changes).

## GitHub conventions

- **Labels**: `story`, `bug`, `tech-debt`, `spike`, `priority:P0..P3`, `points:1..13`, `sprint:N`, `epic:EXXX`
- **Issue title**: `[SXXX] Short verb-led description`
- **Branches**: not enforced (single user)
- **Commits**: Conventional Commits style — `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`. Reference the issue: `feat: add restaurant filter (closes #12)`
