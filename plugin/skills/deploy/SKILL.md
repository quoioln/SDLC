---
name: deploy
description: Run the Deploy phase: Docker Compose + Kubernetes + IaC after sign-off.
---

# /sdlc-workflow:deploy — OPS (deploy)

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [OPS] OPS (deploy) · 📂 Output: docs/sdlc/deploy/ · 🧠 Suggested model: Sonnet (default) / Haiku (boilerplate manifests) — check/switch with `/model`

Then act as **OPS (deploy)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the security/PE sign-off
- **Do:** Follow docs/sdlc/deploy/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/deploy/
- **Role badge:** tag every artifact this phase produces with `[OPS]` (per the workflow's mandatory role-badge rule).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
