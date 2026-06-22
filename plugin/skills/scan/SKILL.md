---
name: scan
description: Scan the existing repo into docs/sdlc/project-profile.md via the bundled CLI (no npx). Explicit user command.
disable-model-invocation: true
---

# /sdlc-workflow:scan

Run in the project root:

`node "${CLAUDE_PLUGIN_ROOT}/cli/bin/cli.js" scan`

Writes `docs/sdlc/project-profile.md` (languages, structure, signals, deps). Then follow `docs/sdlc/reverse-engineering.md` for the as-is understanding. Fallback: `npx sdlc-workflow scan`.
