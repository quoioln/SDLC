---
name: test
description: Run the QE phase: test plan/cases, execute unit/integration/E2E + visual-regression & layout checks, capture evidence, run the bug-fix loop to zero bugs, UAT + sign-off.
---

# /sdlc-workflow:test — QE (test execution)

Act as **QE (test execution)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the Technical BA spec, the implemented code, and the QE rules in qe/qe-lead/README.md + qe/senior-qe/README.md
- **Do:** Follow docs/sdlc/qe/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/qe/{epic-slug}/ — test-plan, test-cases, automation, evidence/ (screenshots/video/trace + report), uat-results, sign-off

Use provisioned test accounts/data (secrets from env/CI, never hardcoded; seed + isolate + tear down test data/accounts after the run). Cleanup is scoped to test data/accounts ONLY — evidence (screenshots/video/trace/report) is a deliverable: keep it in qe/{epic-slug}/evidence/, never delete it (even on passing runs). Verify no broken/misaligned layout, dropped columns, or broken inputs (visual regression + layout-integrity assertions per breakpoint). Loop with Dev until 0 open bugs, then sign off.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
