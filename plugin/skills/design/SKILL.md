---
name: design
description: Run the Design/UX phase (app/web): design spec, all UI states, WCAG 2.1 AA, i18n-ready, anti-AI aesthetics; PO+BA review.
---

# /sdlc-workflow:design — Design / UX

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [DESIGN] Design / UX — skipped (disabled in sdlc-config)` and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name).

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [DESIGN] Design / UX · 📂 Output: docs/sdlc/design/{epic-slug}/ · 🧠 Suggested model: Opus 4.8 — design judgment; Sonnet 5 for production component code — check/switch with `/model`

Then act as **Design / UX** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the PO + Business BA outputs
- **Do:** Follow docs/sdlc/design/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/design/{epic-slug}/
- **Role badge:** tag every artifact this phase produces with `[DESIGN]` (per the workflow's mandatory role-badge rule).

## Next action — ask, then auto-advance

When this phase's output is complete and its gate passes (**PO + BA approve the design**):
1. **Recap** in one line — what was produced + the output path.
2. **Ask a checkpoint** (give the user a chance to steer): `✅ Design / UX done → next: Architect. Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next ENABLED phase** unless the user intervened: consult `docs/sdlc/sdlc-config.md`, starting from `/sdlc-workflow:architect`. If a phase is disabled there, print its skip banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — and move to the phase after it. Run the first enabled phase's command and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
