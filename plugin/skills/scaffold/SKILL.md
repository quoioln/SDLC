---
name: scaffold
description: Scaffold the SDLC workflow docs and templates into the current project using the sdlc-workflow CLI. Use when the user wants to set up SDLC docs, run init, detect the tech stack, add stack-specific rules, or onboard an existing/brownfield project.
---

# Scaffold the SDLC workflow

Run the `sdlc-workflow` CLI in the project root (Node 18+):

1. `npx sdlc-workflow init` — scaffold `docs/sdlc/`, `.cursor/rules/`, `.claude/CLAUDE.md`, `AGENTS.md`, `.agents/skills/`. Non-destructive (existing files skipped; `--force` to overwrite). On an existing repo it also writes `docs/sdlc/project-profile.md` (a mechanical scan) and suggests the matching stack rules.
2. `npx sdlc-workflow tech detect` then `npx sdlc-workflow tech <stack...>` — generate stack-specific rules (java, spring-boot, spring-jpa, quarkus, nestjs, nextjs, angular, typeorm, nodejs, typescript, kafka, rabbitmq).
3. Existing/brownfield project? Follow `docs/sdlc/reverse-engineering.md` to turn the scan + code into as-is architecture, a feature summary, retroactive ADRs, and a tech-debt register.

Then drive the pipeline using the `workflow` skill (one role per phase; parallel where independent).
