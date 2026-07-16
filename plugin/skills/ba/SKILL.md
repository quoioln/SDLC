---
name: ba
description: Run the Business BA phase: functional + non-functional requirements, Gherkin acceptance criteria, process flows, traceability.
---

# /sdlc-workflow:ba — Business BA

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [BA] Business BA — skipped (disabled in sdlc-config)`, mark this phase's row ⏭ (+ reason) in `docs/sdlc/features/{epic-slug}.md`, and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name).

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [BA] Business BA · 📂 Output: docs/sdlc/ba/business/{epic-slug}/ · 🧠 Suggested model: Opus 4.8 — analysis & planning — check/switch with `/model`

Then act as **Business BA** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the PO outputs in docs/sdlc/po/{epic-slug}/
- **Do:** Follow docs/sdlc/ba/business/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/ba/business/{epic-slug}/
- **Role badge:** tag every artifact this phase produces with `[BA]` (per the workflow's mandatory role-badge rule).

First run the Analysis lenses in ba/business/README.md (Event Storming, decision tables, state machines, CRUD/authority matrix, edge-case taxonomy, data-flow + classification). For the epic's domain(s), turn each applicable row of docs/sdlc/domain-packs.md into FR/NFR + Gherkin AC + a compliance-matrix entry (regulation <-> requirement ID <-> test ID).

## Next action — ask, then auto-advance

When this phase's output is complete:
1. **Recap** in one line — what was produced + the output path — and **update this phase's row** in the feature card `docs/sdlc/features/{epic-slug}.md` (status ✅ + artifact links + one-line note; create the card from `features/feature-card.template.md` if missing).
2. **Ask a checkpoint** (give the user a chance to steer): `✅ Business BA done → next: Design (if app/web) — otherwise skip to /sdlc-workflow:architect. Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next ENABLED phase** unless the user intervened: consult `docs/sdlc/sdlc-config.md`, starting from `/sdlc-workflow:design`. If a phase is disabled there, print its skip banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — and move to the phase after it. Run the first enabled phase's command and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
