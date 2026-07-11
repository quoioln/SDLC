# QE (Quality Engineering)

**One folder per epic/feature.** Do not put all epics in one file.

- Use the same epic/feature slug as PO and Business BA: `docs/sdlc/qe/{epic-slug}/`
- Inside that folder: `test-plan.md`, `test-cases.md` (Phase 5a), and for Phase 6: automation notes, framework decision for that epic, etc.

## Detailed tasks (Docs phase — Phase 5a)

- [ ] **Read Technical BA spec**: API, team breakdown, FRs
- [ ] **Test plan**: Scope (unit, integration, E2E), coverage goals, risks
- [ ] **Test cases**: TC-001, TC-002... — precondition, steps, expected, links to AC
- [ ] **Handoff to Dev**: Test plan + test cases in `qe/{epic-slug}/` → Dev runs implementation

## Test depth tier — CHOOSE FIRST (right-size the rigor to the feature)

**Do NOT run the full enterprise matrix on a small feature** — that is the #1 cause of a tiny change burning a huge token/context budget. Pick the lowest tier the feature's risk allows and state it at the start:

| Tier | When | Scope | Model |
|------|------|-------|-------|
| **Smoke** | Small / low-risk change, non-UI or trivial UI, internal tooling | Happy path + 1–2 negative/edge cases. **No** cross-browser, **no** visual regression, **no** responsive matrix. Evidence = screenshot on failure only | **Haiku 4.5**, effort low |
| **Standard** (default) | Normal feature | Unit + integration + key edge cases; for UI, **one** representative breakpoint check. Evidence on failures + final report | **Sonnet 5**, effort medium |
| **Full** | Critical path, money/auth/PII, or UI-heavy/public | Full matrix: cross-browser × responsive breakpoints × visual regression × layout integrity × a11y; full evidence (screenshot/video/trace) | QE Lead (**Opus 4.8**) designs → Senior QE (**Sonnet 5**) executes |

- **Default to Smoke/Standard.** Escalate to **Full** only when the feature is genuinely critical or UI-heavy — never by default.
- **Dynamic mode (sdlc-config, default ON):** for **Trivial** tasks the QE phase is skipped entirely — Dev verifies inline (`/verify`). For **Small** tasks QE runs **inline in the Dev role** at Smoke depth: run the tests, report one line — no separate QE role switch, no sub-agent, no evidence ceremony. The full QE phase (this README's process) applies from **Medium** up. See `docs/sdlc/sdlc-config.md` → Mode.
- **Cost guard:** offload the heavy test execution to a **sub-agent** on the tier's model. Browser/trace/screenshot output is large; running it in a sub-agent keeps it out of the main session context (this is what prevents a small feature from eating ~40% of the session).
- The cross-browser / visual-regression / responsive-matrix items in qe-lead/README.md apply to **Full tier only**; Smoke/Standard skip them.

## Detailed tasks (Testing phase — Phase 6)

- [ ] **Pick the test depth tier** (Smoke / Standard / Full) per the table above and state it + the model used up front
- [ ] **QE Lead**: Test strategy, framework, review test code
- [ ] **Senior QE**: Write automation tests per test plan
- [ ] **UAT (User Acceptance Testing)**: Verify against original user stories and acceptance criteria from PO; confirm business requirements are met from end-user perspective. Document UAT results in `qe/{epic-slug}/uat-results.md`
- [ ] **Test accounts & data**: Provision per-environment test accounts/roles (secrets via env/CI store, never hardcoded); seed + isolate + clean up **test data** (no prod data/PII). Cleanup is scoped to data/accounts only — **evidence (screenshots/video/trace) is kept, never deleted**
- [ ] **Evidence**: Capture screenshot/video/trace for UI/E2E (request-response logs for API), publish an HTML report, retain as CI artifacts linked to TC IDs → `qe/{epic-slug}/evidence/`
- [ ] **Bug-fix loop**: If bugs or test failures found → **Dev fixes** → **QE retests**. **Repeat until all tests pass and UAT approved (0 open bugs)**. Only then → handoff to Security + PE
- [ ] **Sign-off**: Regression pass, coverage met, UAT approved, evidence attached, 0 open bugs → release readiness in `qe/{epic-slug}/`

Example:
```
docs/sdlc/qe/
  job-scheduler-event-bus/
    test-plan.md
    test-cases.md
    automation/   (Phase 6: Senior QE output)
    evidence/     (Phase 6: screenshots, videos, traces, HTML report)
  user-auth/
    test-plan.md
    test-cases.md
```

Two phases:
1. **Docs phase** — Test plan, test cases per epic in `qe/{epic-slug}/`. Done → **Dev runs implementation immediately**.
2. **Testing phase** — After Dev completes unit tests: QE Lead (15+ yrs automation: strategy, framework, review) + Senior QE (automation) + **UAT** (verify against user stories/AC) output to the same `qe/{epic-slug}/` (or subfolders there).

Use test-case.template.md for test cases.
