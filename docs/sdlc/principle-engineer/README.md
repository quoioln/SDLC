# Principle Engineer

**When:** After [QE] quality gate passed. Runs **parallel** with [SEC] + [PERF]. **Before** Deploy.

## Detailed Tasks

- [ ] **Logic audit:** Business logic correctness, edge cases, error handling, data flow
- [ ] **Architecture audit:** Alignment with ADRs, patterns, scalability, maintainability
- [ ] **Report:** Findings, recommendations → docs/sdlc/principle-engineer/

## Issue Tracking

Issue ID (PE-001...), Severity, Status, Owner.

## Merge Gate

Critical/High logic issues → 🔴 BLOCK → 🔁 CYCLE 1 → [DEV] fix → [QE] retest → re-audit. Max 3 cycles.
