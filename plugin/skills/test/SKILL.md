---
name: test
description: Run the QE phase: test plan/cases, execute unit/integration/E2E + visual-regression & layout checks, capture evidence, run the bug-fix loop to zero bugs, UAT + sign-off.
---

# /sdlc-workflow:test — QE (test execution)

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [QE] QE (test execution) — skipped (disabled in sdlc-config)` and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name).

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [QE] QE (test execution) · 📂 Output: docs/sdlc/qe/{epic-slug}/ — test-plan, test-cases, automation, evidence/ (screenshots/video/trace + report), uat-results, sign-off · 🧠 Suggested model: depth-tier: Smoke→Haiku 4.5 / Standard→Sonnet 5 / Full→Opus 4.8(Lead)+Sonnet 5(exec) — right-size to the feature; offload heavy execution to a sub-agent — check/switch with `/model`

Then act as **QE (test execution)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the Technical BA spec, the implemented code, and the QE rules in qe/qe-lead/README.md + qe/senior-qe/README.md
- **Do:** Follow docs/sdlc/qe/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/qe/{epic-slug}/ — test-plan, test-cases, automation, evidence/ (screenshots/video/trace + report), uat-results, sign-off
- **Role badge:** tag every artifact this phase produces with `[QE]` (per the workflow's mandatory role-badge rule).

FIRST pick a test depth tier (Smoke / Standard / Full — see qe/README.md) and right-size the rigor: Smoke (small/low-risk) = happy path + 1-2 edge cases on Haiku 4.5, NO cross-browser/visual-regression/responsive matrix; Standard (default) = unit+integration+key edges on Sonnet 5; Full (critical/UI-heavy) = full matrix, QE Lead (Opus 4.8) designs + Senior QE (Sonnet 5) executes. Do NOT run the Full enterprise matrix on a small feature — that is what burns a huge share of the session. Cost guard: run the heavy execution (browser automation, evidence capture) in a SUB-AGENT on the tier's model so its large output stays out of the main session context. Use provisioned test accounts/data (secrets from env/CI, never hardcoded; seed + isolate + tear down test data/accounts after the run). Cleanup is scoped to test data/accounts ONLY — evidence (screenshots/video/trace/report) is a deliverable: keep it in qe/{epic-slug}/evidence/, never delete it (even on passing runs). For Full tier verify no broken/misaligned layout, dropped columns, or broken inputs (visual regression + layout-integrity assertions per breakpoint). Loop with Dev until 0 open bugs, then sign off.

## Next action — ask, then auto-advance

When this phase's output is complete and its gate passes (**0 open bugs + QE sign-off**):
1. **Recap** in one line — what was produced + the output path.
2. **Ask a checkpoint** (give the user a chance to steer): `✅ QE (test execution) done → next: Security + PE audit. Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next ENABLED phase** unless the user intervened: consult `docs/sdlc/sdlc-config.md`, starting from `/sdlc-workflow:security`. If a phase is disabled there, print its skip banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — and move to the phase after it. Run the first enabled phase's command and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
