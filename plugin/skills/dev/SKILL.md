---
name: dev
description: Run the Dev phase: implement per spec with the full quality bar, 100% tests, and the living feature guideline.
---

# /sdlc-workflow:dev — Dev (Tech Lead + Senior)

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [DEV] Dev (Tech Lead + Senior) · 📂 Output: code + tests; notes in docs/sdlc/dev/{role}/ · 🧠 Suggested model: Opus (Tech Lead: plan/review) / Sonnet (logic-bearing code) / Haiku (mechanical: boilerplate, CRUD, config) — check/switch with `/model`

Then act as **Dev (Tech Lead + Senior)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the Technical BA spec; the rules in docs/sdlc/dev/quality-rules.md and any docs/sdlc/dev/tech/ stack files
- **Do:** Follow docs/sdlc/dev/tech-lead/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** code + tests; notes in docs/sdlc/dev/{role}/
- **Role badge:** tag every artifact this phase produces with `[DEV]` (per the workflow's mandatory role-badge rule).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
