---
name: test
description: Run the QE phase: test plan/cases, execute unit/integration/E2E + visual-regression & layout checks, capture evidence, run the bug-fix loop to zero bugs, UAT + sign-off.
---

# /sdlc-workflow:test — QE (test execution)

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [QE] QE (test execution) · 📂 Output: docs/sdlc/qe/{epic-slug}/ — test-plan, test-cases, automation, evidence/ (screenshots/video/trace + report), uat-results, sign-off · 🧠 Suggested model: depth-tier: Smoke→Haiku / Standard→Sonnet / Full→Opus(Lead)+Sonnet(exec) — right-size to the feature; offload heavy execution to a sub-agent — check/switch with `/model`

Then act as **QE (test execution)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the Technical BA spec, the implemented code, and the QE rules in qe/qe-lead/README.md + qe/senior-qe/README.md
- **Do:** Follow docs/sdlc/qe/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/qe/{epic-slug}/ — test-plan, test-cases, automation, evidence/ (screenshots/video/trace + report), uat-results, sign-off
- **Role badge:** tag every artifact this phase produces with `[QE]` (per the workflow's mandatory role-badge rule).

FIRST pick a test depth tier (Smoke / Standard / Full — see qe/README.md) and right-size the rigor: Smoke (small/low-risk) = happy path + 1-2 edge cases on Haiku, NO cross-browser/visual-regression/responsive matrix; Standard (default) = unit+integration+key edges on Sonnet; Full (critical/UI-heavy) = full matrix, QE Lead (Opus) designs + Senior QE (Sonnet) executes. Do NOT run the Full enterprise matrix on a small feature — that is what burns a huge share of the session. Cost guard: run the heavy execution (browser automation, evidence capture) in a SUB-AGENT on the tier's model so its large output stays out of the main session context. Use provisioned test accounts/data (secrets from env/CI, never hardcoded; seed + isolate + tear down test data/accounts after the run). Cleanup is scoped to test data/accounts ONLY — evidence (screenshots/video/trace/report) is a deliverable: keep it in qe/{epic-slug}/evidence/, never delete it (even on passing runs). For Full tier verify no broken/misaligned layout, dropped columns, or broken inputs (visual regression + layout-integrity assertions per breakpoint). Loop with Dev until 0 open bugs, then sign off.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
