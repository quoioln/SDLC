---
name: guideline
description: Write or update the living feature guideline for a new or changed feature (Definition of Done).
---

# /sdlc-workflow:guideline — Technical Writer (guideline)

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [DOC] Technical Writer (guideline) · 📂 Output: docs/sdlc/guideline/{epic-slug}.md + index · 🧠 Suggested model: Sonnet — technical writing — check/switch with `/model`

Then act as **Technical Writer (guideline)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the feature's PO/BA/Technical BA docs and the implemented behavior
- **Do:** Follow docs/sdlc/guideline/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/guideline/{epic-slug}.md + index
- **Role badge:** tag every artifact this phase produces with `[DOC]` (per the workflow's mandatory role-badge rule).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
