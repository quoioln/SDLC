---
name: maintain
description: Run Maintenance: monitoring, bug triage/fix, dependency updates, performance tuning, guideline updates.
---

# /sdlc-workflow:maintain — Maintenance

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [MAINT] Maintenance — skipped (disabled in sdlc-config)`, mark this phase's row ⏭ (+ reason) in `docs/sdlc/features/{epic-slug}.md`, and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name).

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [MAINT] Maintenance · 📂 Output: docs/sdlc/maintenance/ · 🧠 Suggested model: Sonnet 5 (triage/fixes) / Haiku 4.5 (routine dep bumps) — check/switch with `/model`

Then act as **Maintenance** for the target epic/feature (ask which epic if it is unclear).

- **Read:** production signals and the existing docs
- **Do:** Follow docs/sdlc/maintenance/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/maintenance/
- **Role badge:** tag every artifact this phase produces with `[MAINT]` (per the workflow's mandatory role-badge rule).

## Next action

This is a terminal phase — no fixed next phase. Recap what was produced, then ask the user what they want next.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
