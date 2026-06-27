---
name: maintain
description: Run Maintenance: monitoring, bug triage/fix, dependency updates, performance tuning, guideline updates.
---

# /sdlc-workflow:maintain — Maintenance

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [MAINT] Maintenance · 📂 Output: docs/sdlc/maintenance/ · 🧠 Suggested model: Sonnet (triage/fixes) / Haiku (routine dep bumps) — check/switch with `/model`

Then act as **Maintenance** for the target epic/feature (ask which epic if it is unclear).

- **Read:** production signals and the existing docs
- **Do:** Follow docs/sdlc/maintenance/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/maintenance/
- **Role badge:** tag every artifact this phase produces with `[MAINT]` (per the workflow's mandatory role-badge rule).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
