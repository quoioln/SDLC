---
name: deploy
description: Run the Deploy phase: Docker Compose + Kubernetes + IaC after sign-off.
---

# /sdlc-workflow:deploy — OPS (deploy)

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [OPS] OPS (deploy) — skipped (disabled in sdlc-config)`, mark this phase's row ⏭ (+ reason) in `docs/sdlc/features/{epic-slug}.md`, and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name).

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [OPS] OPS (deploy) · 📂 Output: docs/sdlc/deploy/ · 🧠 Suggested model: Sonnet 5 (default) / Haiku 4.5 (boilerplate manifests) — check/switch with `/model`

Then act as **OPS (deploy)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the security/PE sign-off
- **Do:** Follow docs/sdlc/deploy/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/deploy/
- **Role badge:** tag every artifact this phase produces with `[OPS]` (per the workflow's mandatory role-badge rule).

## Next action — ask, then auto-advance

When this phase's output is complete:
1. **Recap** in one line — what was produced + the output path — and **update this phase's row** in the feature card `docs/sdlc/features/{epic-slug}.md` (status ✅ + artifact links + one-line note; create the card from `features/feature-card.template.md` if missing).
2. **Ask a checkpoint** (give the user a chance to steer): `✅ OPS (deploy) done → next: Maintenance. Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next ENABLED phase** unless the user intervened: consult `docs/sdlc/sdlc-config.md`, starting from `/sdlc-workflow:maintain`. If a phase is disabled there, print its skip banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — and move to the phase after it. Run the first enabled phase's command and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
