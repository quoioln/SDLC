---
name: guideline
description: Write or update the living feature guideline for a new or changed feature (Definition of Done).
---

# /sdlc-workflow:guideline — Technical Writer (guideline)

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [DOC] Technical Writer (guideline) — skipped (disabled in sdlc-config)` and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name).

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [DOC] Technical Writer (guideline) · 📂 Output: docs/sdlc/guideline/{epic-slug}.md + index · 🧠 Suggested model: Sonnet 5 — technical writing — check/switch with `/model`

Then act as **Technical Writer (guideline)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the feature's PO/BA/Technical BA docs and the implemented behavior
- **Do:** Follow docs/sdlc/guideline/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/guideline/{epic-slug}.md + index
- **Role badge:** tag every artifact this phase produces with `[DOC]` (per the workflow's mandatory role-badge rule).

## Next action

This is a cross-cutting phase — no fixed next phase. Recap what was produced, then ask the user what they want next.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
