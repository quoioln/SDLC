---
name: scaffold
description: Scaffold the SDLC workflow docs and templates into the current project using the bundled sdlc-workflow CLI (no npx, no network). Use when the user wants to set up SDLC docs, run init, detect the tech stack, add stack-specific rules, scan an existing repo, or onboard a brownfield project.
---

# Scaffold the SDLC workflow

This plugin **bundles the `sdlc-workflow` CLI**, so run it directly with the project's Node (18+) — no `npx` and no network. Run from the project root:

1. `node "${CLAUDE_PLUGIN_ROOT}/cli/bin/cli.js" init` — scaffold `docs/sdlc/`, `.cursor/rules/`, `.claude/CLAUDE.md`, `AGENTS.md`, `.agents/skills/`. Non-destructive (existing files skipped; add `--force` to overwrite). On an existing repo it also writes `docs/sdlc/project-profile.md` and suggests the matching stack rules.
2. `node "${CLAUDE_PLUGIN_ROOT}/cli/bin/cli.js" tech detect` then `node "${CLAUDE_PLUGIN_ROOT}/cli/bin/cli.js" tech <stack...>` — generate stack-specific rules (java, spring-boot, spring-jpa, quarkus, nestjs, nextjs, angular, typeorm, nodejs, typescript, kafka, rabbitmq).
3. `node "${CLAUDE_PLUGIN_ROOT}/cli/bin/cli.js" scan` — (re)generate the repo profile.
4. Existing/brownfield project? Follow `docs/sdlc/reverse-engineering.md` to turn the scan + code into as-is architecture, a feature summary, retroactive ADRs, and a tech-debt register.

`${CLAUDE_PLUGIN_ROOT}` is substituted by Claude Code to this plugin's install path. Fallback if Node isn't available: `npx sdlc-workflow <cmd>`.

Then drive the pipeline with the `workflow` skill (one role per phase; parallel where independent).
