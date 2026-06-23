# SDLC Workflow — Reference

## Execution model

**Parallel by default, sequential only when required.**

| Decision | Rule |
|----------|------|
| Sequential phases | Phase 0 → 1 → 2 → 3 → 4 → 5 Technical BA |
| Track A (after Technical BA) | [DEV] + [QE] run SIMULTANEOUSLY — do NOT wait |
| Dev parallel roles | [FE] + [BE] + [MOBILE] + [EMB] + [DATA] + [PLATFORM] all run simultaneously |
| Track B (after Dev complete) | [QE] + [SEC] + [PERF] run SIMULTANEOUSLY — merge gate only after all report |

## Folder structure: one per epic/feature

- **PO**: `docs/sdlc/po/{epic-slug}/` — one folder per epic. Files: epic-brief.md, user-stories.md. Do not put all epics in one file.
- **Business BA**: `docs/sdlc/ba/business/{epic-slug}/` — same slug as PO. Files: functional-requirements.md, process-flows.md. Do not merge all epics into one file.
- **Design (if app/web)**: `docs/sdlc/design/{epic-slug}/` — same slug as PO/BA. Design specs (Markdown) + optional HTML wireframes; PO+BA review until approved.
- **QE**: `docs/sdlc/qe/{epic-slug}/` — same slug as PO/BA. Files: test-plan.md, test-cases.md, automation. Do not put all epics in one file.

## PO: Epic Brief Template
# Epic: [Name]
## Problem / Success Metrics / User Stories / Acceptance Criteria / Priority

## Business BA: Functional Requirement
FR-001: [Title] — Description, Trigger, Process Flow, Output, Constraints

## Architect: ADR Template
# ADR-001: [Title] — Status, Context, Decision, Consequences

## Technical BA: API Spec
POST /api/v1/[resource] — Purpose, Request, Response, Contract

## Design (if app/web)
Design specs (Markdown) + optional HTML wireframes from idea + PO + BA (before Architect; UX drives tech). Output: docs/sdlc/design/{epic-slug}/. PO + BA review until approved; loop if not aligned. Handoff to Architect.

## QE: Test Case
TC-001: [Scenario] — Precondition, Steps, Expected, Links to AC

## QE Team (one folder per epic: qe/{epic-slug}/)
- QE Lead (15+ yrs automation) — **highest model** (e.g. Opus): test strategy, framework, automation architecture, review → docs/sdlc/qe/{epic-slug}/
- Senior QE (10+ yrs) — **cost-efficient model** (e.g. Haiku): write automation tests per QE Lead's strategy → docs/sdlc/qe/{epic-slug}/

## Dev Team
- Tech Lead (15+ yrs) — **highest model** (e.g. Opus): planning, logic, architecture decisions, code review → docs/sdlc/dev/tech-lead/
- Senior Dev (10+ yrs) — **cost-efficient model** (e.g. Haiku): execute code from Tech Lead specs, Unit Test 100% → docs/sdlc/dev/senior-developer/
- By project (all Senior 10+ yrs, cost-efficient model): Senior Frontend, Backend, Mobile, Embedded, Data/ML, Platform → docs/sdlc/dev/{role}/

## Security + Principle Engineer + Performance (after implementation)
- Security team [SEC]: OWASP Top 10, STRIDE, CVE, compliance → docs/sdlc/security/
- Principle Engineer [PE]: logic, architecture → docs/sdlc/principle-engineer/
- Performance Auditor [PERF]: p95<500ms, N+1, k6 → docs/sdlc/security/
- **Remediation loop**: Every issue has ID (SEC-001, PERF-003...). 🔁 CYCLE 1 → 2 → 3. Max 3 per issue.

## Deploy
After all Phase 8 issues resolved → Docker Compose + K8s + IaC. See docs/sdlc/deploy/

## Maintenance
After Deploy → ongoing: monitoring, bug fixes, patches, dependency updates, performance tuning. Significant new features → loop back to PO for new epic. See docs/sdlc/maintenance/
