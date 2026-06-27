---
name: architect
description: Run the Architect phase: ADRs (with alternatives + trade-offs), C4 diagrams, security & observability by design, fitness functions.
---

# /sdlc-workflow:architect — Architect

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [ARCH] Architect · 📂 Output: docs/sdlc/architecture/ · 🧠 Suggested model: Opus — architecture & logic — check/switch with `/model`

Then act as **Architect** for the target epic/feature (ask which epic if it is unclear).

- **Read:** Business BA (+ Design if app/web)
- **Do:** Follow docs/sdlc/architecture/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/architecture/
- **Role badge:** tag every artifact this phase produces with `[ARCH]` (per the workflow's mandatory role-badge rule).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
