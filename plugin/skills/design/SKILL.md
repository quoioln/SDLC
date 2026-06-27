---
name: design
description: Run the Design/UX phase (app/web): design spec, all UI states, WCAG 2.1 AA, i18n-ready, anti-AI aesthetics; PO+BA review.
---

# /sdlc-workflow:design — Design / UX

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [DESIGN] Design / UX · 📂 Output: docs/sdlc/design/{epic-slug}/ · 🧠 Suggested model: Opus — design judgment; Sonnet for production component code — check/switch with `/model`

Then act as **Design / UX** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the PO + Business BA outputs
- **Do:** Follow docs/sdlc/design/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/design/{epic-slug}/
- **Role badge:** tag every artifact this phase produces with `[DESIGN]` (per the workflow's mandatory role-badge rule).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
