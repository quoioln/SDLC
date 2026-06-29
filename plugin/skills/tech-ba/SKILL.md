---
name: tech-ba
description: Run the Technical BA phase: API specs (OpenAPI), DB schema, team breakdown, traceability to FRs.
---

# /sdlc-workflow:tech-ba — Technical BA

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [TECH-BA] Technical BA · 📂 Output: docs/sdlc/ba/technical/ · 🧠 Suggested model: Opus — API/contract design; Sonnet for routine spec filling — check/switch with `/model`

Then act as **Technical BA** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the Architect (+ Design) outputs
- **Do:** Follow docs/sdlc/ba/technical/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/ba/technical/
- **Role badge:** tag every artifact this phase produces with `[TECH-BA]` (per the workflow's mandatory role-badge rule).

## Next action — ask, then auto-advance

When this phase's output is complete:
1. **Recap** in one line — what was produced + the output path.
2. **Ask a checkpoint** (give the user a chance to steer): `✅ Technical BA done → next: Dev (QE docs run in parallel). Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next phase** unless the user intervened: run `/sdlc-workflow:dev` and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
