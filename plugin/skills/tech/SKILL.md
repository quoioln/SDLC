---
name: tech
description: Generate stack-specific SDLC rules (or detect/list) via the bundled CLI (no npx). Pass stacks as arguments. Explicit user command.
disable-model-invocation: true
---

# /sdlc-workflow:tech

Run in the project root with the requested stacks (or `detect` / `list`):

`node "${CLAUDE_PLUGIN_ROOT}/cli/bin/cli.js" tech $ARGUMENTS`

Examples: `/sdlc-workflow:tech detect` · `/sdlc-workflow:tech java spring-boot kafka` · `/sdlc-workflow:tech list`. Fallback: `npx sdlc-workflow tech $ARGUMENTS`.
