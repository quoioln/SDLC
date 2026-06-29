---
name: ba
description: Run the Business BA phase: functional + non-functional requirements, Gherkin acceptance criteria, process flows, traceability.
---

# /sdlc-workflow:ba — Business BA

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [BA] Business BA · 📂 Output: docs/sdlc/ba/business/{epic-slug}/ · 🧠 Suggested model: Opus — analysis & planning — check/switch with `/model`

Then act as **Business BA** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the PO outputs in docs/sdlc/po/{epic-slug}/
- **Do:** Follow docs/sdlc/ba/business/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/ba/business/{epic-slug}/
- **Role badge:** tag every artifact this phase produces with `[BA]` (per the workflow's mandatory role-badge rule).

First run the Analysis lenses in ba/business/README.md (Event Storming, decision tables, state machines, CRUD/authority matrix, edge-case taxonomy, data-flow + classification). For the epic's domain(s), turn each applicable row of docs/sdlc/domain-packs.md into FR/NFR + Gherkin AC + a compliance-matrix entry (regulation <-> requirement ID <-> test ID).

## Next action — ask, then auto-advance

When this phase's output is complete:
1. **Recap** in one line — what was produced + the output path.
2. **Ask a checkpoint** (give the user a chance to steer): `✅ Business BA done → next: Design (if app/web) — otherwise skip to /sdlc-workflow:architect. Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next phase** unless the user intervened: run `/sdlc-workflow:design` and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
