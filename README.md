# sdlc-workflow

Scaffold SDLC workflow docs and templates into your project. Works with **Cursor**, **Claude**, **Antigravity**, and **Codex**.

## Flow

```
User Request → PO → Business BA → Design (if app/web) → Architect → Technical BA → QE (docs) → Dev → QE (testing + UAT) → [bug-fix loop until 0 bugs] → Security + PE audit → [fix → retest → re-audit loop until 0 issues] → Deploy → Maintenance
```

- **Trigger:** When you send an **idea** or **feature request**, the agent should run the **full pipeline** (PO → … → Deploy) in sequence, one sub-agent/role per phase — not handle everything in one go or stop after one phase. See `docs/sdlc/ORCHESTRATION.md`.
- **Design (optional):** For app/web projects, after Business BA → create **design specs** (Markdown) + optional **HTML wireframes**; **PO + Business BA review** until approved; then Architect + Technical BA. UX drives technical decisions.
- **QE bug-fix loop:** After QE finds bugs → Dev fixes → QE retests → repeat until 0 open bugs.
- **Security + Principle Engineer:** After QE sign-off (0 bugs) → security + logic audit; **fix → retest → re-audit loop** (Dev fixes → QE retests → re-audit) until 0 issues/vulnerabilities; sign-off before Deploy.
- **Each role runs as a sub-agent** (see `docs/sdlc/agents/`).
- **After completion** → deploy immediately with **Docker Compose** (local/staging) and **Kubernetes** (production) — `docs/sdlc/deploy/`.
- **Maintenance:** After Deploy → monitoring, bug fixes, patches, dependency updates, performance tuning — `docs/sdlc/maintenance/`.
- **QE (docs)**: Test plan, test cases
- **Dev**: After docs phase → **run implementation immediately**. Tech Lead (review, merge) + Senior Dev (implement, Unit Test ≥90%)
- **QE (testing)**: QE Lead (15+ yrs automation: strategy, framework, review) + Senior QE (10+ yrs, write automation tests)

## Usage

### `init` — Project setup

In your project directory:

```bash
npx sdlc-workflow init
```

Creates project-level files:
- `docs/sdlc/` — SDLC docs, templates, and phase folders
- `.cursor/rules/sdlc-workflow.mdc` — Cursor rule
- `.claude/CLAUDE.md` — Claude Code instructions
- `AGENTS.md` — Antigravity, Codex (universal project guidance)
- `.agents/skills/sdlc-workflow/` — Codex repo skill

**Existing / brownfield projects:** `init` is **non-destructive** — existing files are skipped and listed in the summary (re-run with `--force` to overwrite managed docs with newer templates, then review the diff). It also:
- **detects your stack** (from `package.json`, `pom.xml`, `build.gradle`, compose files) and suggests the matching `tech` command;
- **scans the repo** into `docs/sdlc/project-profile.md` — a mechanical inventory (languages, structure, monorepo, tests/CI/Docker/k8s/IaC signals, API hints, top deps);
- writes `docs/sdlc/ADOPTION.md` (brownfield adoption guide) and `docs/sdlc/reverse-engineering.md` (a prompt for the SDLC **agent** to turn the profile + code into as-is architecture, feature summary, retroactive ADRs, and a tech-debt register).

The CLI produces **facts**; the agent produces the **understanding**.

```bash
npx sdlc-workflow init            # safe: skips existing files, scans existing repos
npx sdlc-workflow init --force    # overwrite managed docs with current templates
npx sdlc-workflow scan            # (re)generate docs/sdlc/project-profile.md
```

### `tech` — Stack-specific rules

Generate quality rules tailored to your stack. They **extend** `docs/sdlc/dev/quality-rules.md` (the general bar always holds) and are written to `docs/sdlc/dev/tech/`.

```bash
npx sdlc-workflow tech java spring-boot kafka   # add rules for these stacks
npx sdlc-workflow tech list                      # list available stacks
npx sdlc-workflow tech                           # interactive selection (TTY)
```

Available: `java`, `typescript`, `nodejs`, `spring-boot`, `spring-jpa`, `quarkus`, `nestjs`, `nextjs`, `angular`, `typeorm`, `kafka`, `rabbitmq` (aliases: `node`, `ts`, `spring`, `jpa`, `next`, `nest`, `rabbit`, `ng`). Re-running regenerates the listed stacks and keeps the rest; an index is written to `dev/tech/README.md`.

### `install` — Global setup

```bash
npx sdlc-workflow install
```

Installs global skills (run once per machine):
- `~/.cursor/skills/sdlc-workflow/` — Cursor skill
- `~/.codex/AGENTS.md` — Codex global instructions
- `~/.agents/skills/sdlc-workflow/` — Codex global skill

## Generated Structure

```
docs/sdlc/
├── SDLC-WORKFLOW.md          # Main workflow (use with Claude)
├── reference.md
├── skill-mapping.md          # Recommended skills/agents per SDLC role
├── ADOPTION.md               # Brownfield adoption guide (existing projects)
├── reverse-engineering.md    # Agent prompt: derive as-is architecture from code
├── project-profile.md        # Auto-generated repo scan (created by init/scan on existing repos)
├── po/                       # Product Owner (one folder per epic: po/{epic-slug}/)
│   ├── epic-brief.template.md
│   └── README.md
├── ba/
│   ├── business/             # Business BA (one folder per epic: ba/business/{epic-slug}/)
│   │   ├── functional-requirement.template.md
│   │   └── README.md
│   └── technical/            # Technical BA
│       ├── api-spec.template.md
│       ├── team-breakdown.template.md
│       └── README.md
├── design/                   # Design (optional, app/web): after BA, before Architect; design specs + wireframes; PO+BA review until approved
│   └── README.md
├── architecture/             # Architect
│   ├── adr.template.md
│   └── README.md
├── qe/                       # QE (one folder per epic: qe/{epic-slug}/)
│   ├── test-case.template.md
│   ├── README.md
│   ├── qe-lead/              # QE Lead 15+ yrs automation: strategy, framework, review (output per epic)
│   │   └── README.md
│   └── senior-qe/            # Senior QE 10+ yrs: automation (output per epic)
│       └── README.md
├── dev/                      # Dev team (all Senior 10+ yrs; roles vary by project)
│   ├── implementation-roles.template.md
│   ├── quality-rules.md      # Mandatory dev quality bar (DoD, tests, security, perf, i18n, backend/API)
│   ├── tech-lead/            # Tech Lead 15+ yrs
│   ├── senior-developer/    # Senior Dev 10+ yrs (generic)
│   ├── frontend/             # Senior Frontend 10+ yrs — Web UI
│   ├── backend/              # Senior Backend 10+ yrs
│   ├── mobile/               # Senior Mobile 10+ yrs
│   ├── embedded/             # Senior Embedded 10+ yrs — firmware, IoT
│   ├── data-ml/              # Senior Data/ML 10+ yrs
│   └── platform/             # Senior Platform 10+ yrs — CI/CD, infra
├── security/                 # Security team: audit security risk (after implementation)
│   └── README.md
├── guideline/                # Technical Writer: full feature guidelines (living docs; update on every feature change)
│   ├── feature-guideline.template.md
│   └── README.md
├── principle-engineer/       # Principle engineer: audit logic, architecture (after implementation)
│   └── README.md
├── agents/                   # Sub-agent specs (each role = sub-agent)
│   └── README.md
├── deploy/                   # After Security + PE sign-off (fix loop until no issues) → Docker Compose + K8s
│   ├── README.md
│   ├── docker-compose.yml.template
│   └── k8s/
│       ├── deployment.yaml.template
│       ├── service.yaml.template
│       └── ingress.yaml.template
└── maintenance/              # After Deploy → monitoring, bug fixes, patches, runbooks
    └── README.md

.cursor/rules/
└── sdlc-workflow.mdc         # Cursor rule

AGENTS.md                     # Antigravity, Codex (universal)
.agents/skills/sdlc-workflow/ # Codex repo skill
```

## Use with Cursor

The rule `.cursor/rules/sdlc-workflow.mdc` activates when working with `docs/sdlc/**` or `*.md`. Global skill: `~/.cursor/skills/sdlc-workflow/`.

## Use with Claude

- **Claude Code** (project): `.claude/CLAUDE.md` — Claude loads it when you open this project.
- **Claude.ai** (web): Copy `docs/sdlc/SDLC-WORKFLOW.md` into Custom Instructions or @ mention it.

## Install as a Claude Code plugin

This repo is also a single-plugin Claude Code **marketplace**, so you can install the workflow as a plugin (no `npx` needed) — it adds the `/sdlc-workflow:workflow` skill (the full pipeline) and `/sdlc-workflow:scaffold` (bridges to the CLI):

```shell
/plugin marketplace add quoioln/SDLC
/plugin install sdlc-workflow@sdlc-workflow
```

**No `npx` needed:** the plugin **bundles the CLI** at `plugin/cli/bin/cli.js` and exposes discrete slash commands that run it offline (version pinned to the installed plugin):

| Intent | Plugin command (no npx) | npx fallback |
|--------|--------------------------|--------------|
| Scaffold docs/templates | `/sdlc-workflow:init` (`--force` to overwrite) | `npx sdlc-workflow init` |
| Detect / add stack rules | `/sdlc-workflow:tech detect` · `/sdlc-workflow:tech java spring-boot kafka` | `npx sdlc-workflow tech …` |
| Scan an existing repo | `/sdlc-workflow:scan` | `npx sdlc-workflow scan` |
| Guided setup (agent picks steps) | `/sdlc-workflow:scaffold` | — |
| Drive the full pipeline | `/sdlc-workflow:workflow` | — |

The `init`/`tech`/`scan` commands are explicit (user-triggered); `scaffold` and `workflow` are model-invocable so the agent can run them during a task. All resolve `${CLAUDE_PLUGIN_ROOT}` to the installed plugin path.

Layout: `.claude-plugin/marketplace.json` (root) lists the plugin at `./plugin`, which holds `plugin/.claude-plugin/plugin.json`, `plugin/skills/`, and the bundled `plugin/cli/`. These files are generated from the CLI's source of truth — run `npx sdlc-workflow plugin` to (re)generate them.

## Use with Antigravity

`AGENTS.md` at project root — Antigravity reads it (priority: AGENTS.md → GEMINI.md). Universal format, works across agentic IDEs.

## Use with Codex

- **Project**: `AGENTS.md` + `.agents/skills/sdlc-workflow/`
- **Global**: `~/.codex/AGENTS.md` + `~/.agents/skills/sdlc-workflow/`

## Release

1. Add `NPM_TOKEN` (npm access token) to repo **Settings → Secrets → Actions**.
2. Push a version tag:

   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

3. GitHub Action validates the plugin/marketplace files, publishes to npm, and creates a GitHub Release.

> The release workflow runs `.github/scripts/validate-plugin.mjs`, which **fails the release** if `plugin/.claude-plugin/plugin.json` or `.claude-plugin/marketplace.json` version doesn't match the tag. Before tagging a new version: bump `package.json`, run `npx sdlc-workflow plugin` to regenerate the plugin files, and commit — otherwise the git-distributed plugin would ship a stale version.

## License

MIT
