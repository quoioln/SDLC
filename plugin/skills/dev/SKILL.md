---
name: dev
description: Run the Dev phase: implement per spec with the full quality bar, 100% tests, and the living feature guideline.
---

# /sdlc-workflow:dev — Dev (Tech Lead + Senior)

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [DEV] Dev (Tech Lead + Senior) — skipped (disabled in sdlc-config)`, mark this phase's row ⏭ (+ reason) in `docs/sdlc/features/{epic-slug}.md`, and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name).

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [DEV] Dev (Tech Lead + Senior) · 📂 Output: code + tests; notes in docs/sdlc/dev/{role}/ · 🧠 Suggested model: Opus 4.8 (Tech Lead: plan/review) / Sonnet 5 (logic-bearing code) / Haiku 4.5 (mechanical: boilerplate, CRUD, config) — check/switch with `/model`

Then act as **Dev (Tech Lead + Senior)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the Technical BA spec; the rules in docs/sdlc/dev/quality-rules.md and any docs/sdlc/dev/tech/ stack files
- **Do:** Follow docs/sdlc/dev/tech-lead/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** code + tests; notes in docs/sdlc/dev/{role}/
- **Role badge:** tag every artifact this phase produces with `[DEV]` (per the workflow's mandatory role-badge rule).

## Next action — ask, then auto-advance

When this phase's output is complete:
1. **Recap** in one line — what was produced + the output path — and **update this phase's row** in the feature card `docs/sdlc/features/{epic-slug}.md` (status ✅ + artifact links + one-line note; create the card from `features/feature-card.template.md` if missing).
2. **Ask a checkpoint** (give the user a chance to steer): `✅ Dev (Tech Lead + Senior) done → next: QE (test + UAT). Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next ENABLED phase** unless the user intervened: consult `docs/sdlc/sdlc-config.md`, starting from `/sdlc-workflow:test`. If a phase is disabled there, print its skip banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — and move to the phase after it. Run the first enabled phase's command and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
