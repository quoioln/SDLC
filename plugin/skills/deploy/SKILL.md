---
name: deploy
description: Run the Deploy phase: Docker Compose + Kubernetes + IaC after sign-off.
---

# /sdlc-workflow:deploy — OPS (deploy)

Act as **OPS (deploy)** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the security/PE sign-off
- **Do:** Follow docs/sdlc/deploy/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/deploy/

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
