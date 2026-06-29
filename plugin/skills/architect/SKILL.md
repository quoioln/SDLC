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

## Next action — ask, then auto-advance

When this phase's output is complete:
1. **Recap** in one line — what was produced + the output path.
2. **Ask a checkpoint** (give the user a chance to steer): `✅ Architect done → next: Technical BA. Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next phase** unless the user intervened: run `/sdlc-workflow:tech-ba` and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
