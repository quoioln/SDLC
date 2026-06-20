# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`sdlc-workflow` is a zero-dependency npm CLI (ESM, Node ≥18) that **scaffolds SDLC documentation and templates into other projects**. It is not an application — it generates files for Cursor, Claude Code, Antigravity, and Codex. The two subcommands:

- `npx sdlc-workflow init` — project-level scaffold into the current directory (`docs/sdlc/`, `.cursor/rules/`, `.claude/CLAUDE.md`, `AGENTS.md`, `.agents/skills/`).
- `npx sdlc-workflow install` — global scaffold into `~` (`~/.cursor/skills/`, `~/.codex/AGENTS.md`, `~/.agents/skills/`).

## Architecture — the one thing to know

**`bin/cli.js` is the single source of truth for ALL generated content.** Every file the CLI emits lives as an inline template-literal `const` near the bottom of that file (`CLAUDE_SDLC_CONTENT`, `CURSOR_RULE_CONTENT`, `SDLC_WORKFLOW_MD`, `*_README`, `*_TEMPLATE`, etc. — ~44 constants). There is **no `templates/` directory**, so `scaffold()` always falls through to `generateFromInline()`, which writes those constants to disk.

Consequences when editing:

- **To change what users get, edit the string constants in `bin/cli.js` — not the files under `docs/sdlc/`.** The `docs/sdlc/`, `.cursor/`, `AGENTS.md`, `.agents/`, and `.claude/CLAUDE.md` files in *this* repo are self-scaffolded output (the project was run on itself). Editing them does not change the shipped package.
- Content is **duplicated** across constants by design (e.g. the workflow appears in `CLAUDE_SDLC_CONTENT`, `CURSOR_RULE_CONTENT`, `SDLC_WORKFLOW_MD`, and `AGENTS_MD_CONTENT` in different phrasings). A workflow change usually means updating several constants to stay consistent.
- `package.json` `files` ships only `bin/` and `README.md` — `docs/sdlc/` is **not** published. The CLI regenerates everything from the inline constants at install time.
- The `installClaudeSkill` / `installAgentsMd` / `installCodexSkill` helpers are **idempotent and non-destructive**: if a target file already contains `## SDLC Workflow`, they skip it; otherwise they append. Preserve this guard when adding new install targets.

> Note: `.claude/CLAUDE.md` in this repo is the **shipped product content** (the `CLAUDE_SDLC_CONTENT` constant rendered to disk), not repo-development guidance. Keep repo-dev guidance here in the root `CLAUDE.md`.

## Common commands

```bash
node bin/cli.js init        # test the project scaffold locally (writes into CWD)
node bin/cli.js install     # test the global scaffold (writes into your home dir)
node bin/cli.js version     # prints package.json version
npm install                 # no runtime deps; just sets up for publish
```

There is **no build, lint, or test setup** — the package is plain ESM shipped as-is. Verify changes by running `node bin/cli.js init` in a throwaway directory and inspecting the output.

## Releasing

Publishing is tag-driven via `.github/workflows/release.yml`: pushing a `v*` tag runs `npm version` from the tag, `npm publish --provenance`, and creates a GitHub Release. Bump `version` in `package.json` in a normal commit, then tag:

```bash
git tag v1.2.10 && git push origin v1.2.10
```

Requires the `NPM_TOKEN` repo secret.
