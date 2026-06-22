---
name: init
description: Scaffold the SDLC workflow docs/templates into the current project via the bundled CLI (no npx). Explicit user command.
disable-model-invocation: true
---

# /sdlc-workflow:init

Run in the project root and report the summary:

`node "${CLAUDE_PLUGIN_ROOT}/cli/bin/cli.js" init $ARGUMENTS`

- Non-destructive: existing files are skipped. Pass `--force` to overwrite managed docs.
- On an existing repo it also writes `docs/sdlc/project-profile.md` and suggests stack rules.
- Fallback if Node is unavailable: `npx sdlc-workflow init`.
