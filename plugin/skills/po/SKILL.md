---
name: po
description: Run the Product Owner phase: PRD, user stories, feasibility, measurable success metrics for an epic.
---

# /sdlc-workflow:po — Product Owner

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [PO] Product Owner — skipped (disabled in sdlc-config)` and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name).

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [PO] Product Owner · 📂 Output: docs/sdlc/po/{epic-slug}/ · 🧠 Suggested model: Opus 4.8 — analysis & planning — check/switch with `/model`

Then act as **Product Owner** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the idea / feature request
- **Do:** Follow docs/sdlc/po/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/po/{epic-slug}/
- **Role badge:** tag every artifact this phase produces with `[PO]` (per the workflow's mandatory role-badge rule).

First run the Analysis lenses in po/README.md (Jobs-to-be-Done, 5 Whys, Impact Mapping, Opportunity-Solution Tree, assumption mapping, Kano, RICE/WSJF) — methods first, then write. Classify the domain and pull obligations from docs/sdlc/domain-packs.md into intake (compliance + must-have requirements + domain risks).

## Next action — ask, then auto-advance

When this phase's output is complete:
1. **Recap** in one line — what was produced + the output path.
2. **Ask a checkpoint** (give the user a chance to steer): `✅ Product Owner done → next: Business BA. Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next ENABLED phase** unless the user intervened: consult `docs/sdlc/sdlc-config.md`, starting from `/sdlc-workflow:ba`. If a phase is disabled there, print its skip banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — and move to the phase after it. Run the first enabled phase's command and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
