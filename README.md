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

## Quickstart — driving the workflow (example prompts)

After scaffolding (`init`) or installing the plugin, you drive the pipeline by **talking to the agent** (Claude Code / Cursor / Codex). Sending an idea triggers the full pipeline; each phase prints a `🎭 Role · 🧠 Suggested model` banner, asks a checkpoint, then auto-advances to the next phase.

> **Cost tip (read this first):** the workflow suggests a model tier per phase but does **not** switch models for you — use `/model`. Lead/analysis/audit → Opus 4.8; logic-bearing code/tests → Sonnet 5 (near-Opus coding at ~60% of the price); mechanical work → Haiku 4.5; Fable 5 only as an escalation for the hardest problems (2× Opus price — never the default). For QE on a **small** feature, ask for the **Smoke** depth tier (Haiku 4.5, no cross-browser/visual-regression matrix) so a tiny change doesn't burn the session.

### A) New project (greenfield)

```bash
# 1. Scaffold (CLI or plugin)
npx sdlc-workflow init           # or: /sdlc-workflow:init
```

Then send an idea — example prompts:

```text
# Full pipeline, end to end
Build a URL shortener with click analytics and a dashboard (web app).
Run the full SDLC pipeline from PO through Deploy. Treat it as one epic.

# Plugin form (explicit skill)
/sdlc-workflow:workflow Build a REST API for task management
(users, projects, tasks, due dates, reminders). Backend only.

# Start one phase at a time
/sdlc-workflow:po  Idea: a mobile app that splits group expenses.
# …then let it auto-advance, or call /sdlc-workflow:ba next.
```

Tips:
- Say **"web app"** or **"mobile"** so the Design phase (UX before Architect) kicks in.
- Name the domain (fintech, health, e-commerce…) so PO/BA pull the matching compliance pack from `docs/sdlc/domain-packs.md`.
- Want checkpoints between phases? The agent already asks before advancing — reply `stop` or `adjust <note>` to steer.

### Toggling phases on/off (sdlc-config)

`init` writes `docs/sdlc/sdlc-config.md` — the persistent on/off switch per phase. The agent reads it at every handoff; a disabled phase is skipped with a visible `⏭` banner (never silently). Toggle by talking to the agent:

```text
profile standard          # presets: full · standard (no Design/Guideline/Maintenance)
                          #          hotfix (Dev → QE Smoke → Security → Deploy) · docs-only
static mode               # run every enabled phase for every task
dynamic roles on          # (default) auto-narrow the roster per task — see below
disable phase guideline   # turn one phase off (persists across epics)
enable phase maintain     # turn it back on
skip qe for this epic     # one-epic override, config file untouched
show sdlc config          # print the active profile + mode + phase table
```

**Dynamic roles (default):** the roster auto-narrows from the task's complexity tier, so small tasks stop paying for expensive roles — **QE in particular**: Trivial tasks skip QE entirely (Dev verifies inline); Small tasks run QE **inline in the Dev role** at Smoke depth (run tests + one-line result — no role switch, no sub-agent, no evidence ceremony); Medium+ runs the full QE phase. Docs roles (PO/BA/Design/Architect/Tech-BA) auto-skip on Trivial/Small unless the requirement is unclear. Skipped roles always print a `⏭` banner, and dynamic mode can only skip — it never re-enables a phase you disabled.

Safety: the **security** phase can't be disabled while the epic touches money/auth/PII — the agent refuses and suggests lowering the QE depth tier instead. Calling a phase command explicitly (e.g. `/sdlc-workflow:test`) always runs it, config or not.

### When companion plugins kick in (task complexity tiers)

If you installed the companion plugins (`superpowers`, `feature-dev`, `code-review`, `security-guidance`, `context7`), the workflow engages them **by task complexity** — declared up front as `🧩 Complexity: <tier> → engines: <list>` (full table: `docs/sdlc/INTEGRATION.md` §2.4):

| Tier | Looks like | Engines used |
|------|-----------|--------------|
| **Trivial** | typo, config, 1 file, no new logic | none — direct edit + verify |
| **Small** | clear bug fix / small feature, 1–3 files | `systematic-debugging` + `verification-before-completion` (bugs), `test-driven-development` (features) |
| **Medium** | multi-module feature, 3–10 files | + `writing-plans`, feature-dev explore/architecture, `context7` |
| **Large/Epic** | new subsystem, cross-cutting, money/auth/PII | full set: `brainstorming`, feature-dev 7-phase, `subagent-driven-development`, `code-review`, `security-guidance` |

Two rules: installed + tier reached → the engine **must** be used (no reimplementing natively); below the tier → the ceremony is skipped (running brainstorming + writing-plans on a one-line fix costs more than the fix).

### Feature cards — one review hub per feature

Every feature/task gets one card in `docs/sdlc/features/{epic-slug}.md` (created at intake from the template). Each phase updates its own row at handoff — status `✅/🔄/⏭ + reason`, links to its artifacts, one-line note — so reviewing a feature means opening **one file**: it links the PRD, requirements, ADRs, API spec, tests + evidence, audit and guideline, and shows what ran vs what was deliberately skipped. Sign-offs (QE 0-bugs, Security 0 Critical/High, UAT) land on the card too.

### B) Existing project (brownfield)

```bash
# 1. init also SCANS the repo: writes project-profile.md, ADOPTION.md, reverse-engineering.md
npx sdlc-workflow init           # or: /sdlc-workflow:init
npx sdlc-workflow tech detect    # detect stack → add matching dev rules
```

Then point the agent at the existing code — example prompts:

```text
# Understand the codebase first (recommended on day one)
Reverse-engineer this repo using docs/sdlc/reverse-engineering.md:
derive the as-is architecture, a feature summary, retroactive ADRs,
and a tech-debt register. Use docs/sdlc/project-profile.md as the facts.

# Add a feature, reusing existing architecture
Add a feature: let users export their data as CSV. Run the SDLC pipeline
scoped to just this feature — reuse the current architecture, don't redesign.

# Small change → keep QE cheap
Fix: the login form rejects valid emails with a leading dot.
Run the QE phase at Smoke depth (Haiku 4.5), offload test execution to a sub-agent.

# Bug-fix loop
Bug: orders occasionally double-charge under concurrent checkout.
Use systematic debugging (reproduce → isolate → hypothesize → fix → verify),
then QE retest until 0 open bugs.
```

Tips:
- Run the **reverse-engineering** prompt before adding features so the agent has the as-is picture.
- For a focused change, say **"scoped to this feature, reuse the current architecture"** so it doesn't run the whole greenfield pipeline.
- Combine with the Superpowers + feature-dev plugins per `docs/sdlc/INTEGRATION.md` (per-phase engine + model tiers + fallback).

## Generated Structure

```
docs/sdlc/
├── SDLC-WORKFLOW.md          # Main workflow (use with Claude)
├── sdlc-config.md            # Phase toggles & profiles (full/standard/hotfix/docs-only) — say "disable phase qe" / "profile hotfix"
├── features/                 # Review hub — one card per feature/task linking every phase artifact + status
│   ├── feature-card.template.md
│   └── README.md
├── reference.md
├── skill-mapping.md          # Recommended skills/agents per SDLC role
├── INTEGRATION.md            # Combine SDLC with Superpowers + feature-dev plugins (per-phase engine + model tiers)
├── domain-packs.md           # Industry analysis & compliance packs (fintech/health/e-commerce…) for PO/BA
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

### Update to the latest version

The plugin is **version-pinned** (it updates only when `plugin.json`'s `version` is bumped and the marketplace is refreshed). To get the newest release:

```shell
/plugin marketplace update sdlc-workflow   # re-fetch the marketplace catalog
/plugin install sdlc-workflow@sdlc-workflow # reinstall the bumped version
/reload-plugins                             # apply without restarting
```

- Run `/plugin marketplace update` first — without it, install still sees the old pinned version.
- `/reload-plugins` is enough for skill text changes mid-session; for new MCP servers/hooks, restart Claude Code.
- Check the installed version anytime in the `/plugin` manager (or compare against `package.json` in the repo).
- **Maintainers:** a new version isn't available to users until you `git push` and tag it — `git push origin master && git tag vX.Y.Z && git push origin vX.Y.Z` (the release workflow validates the plugin version matches the tag).

**No `npx` needed:** the plugin **bundles the CLI** at `plugin/cli/bin/cli.js` and exposes discrete slash commands that run it offline (version pinned to the installed plugin):

| Intent | Plugin command (no npx) | npx fallback |
|--------|--------------------------|--------------|
| Scaffold docs/templates | `/sdlc-workflow:init` (`--force` to overwrite) | `npx sdlc-workflow init` |
| Detect / add stack rules | `/sdlc-workflow:tech detect` · `/sdlc-workflow:tech java spring-boot kafka` | `npx sdlc-workflow tech …` |
| Scan an existing repo | `/sdlc-workflow:scan` | `npx sdlc-workflow scan` |
| Guided setup (agent picks steps) | `/sdlc-workflow:scaffold` | — |
| Drive the full pipeline | `/sdlc-workflow:workflow` | — |

The `init`/`tech`/`scan` commands are explicit (user-triggered); `scaffold` and `workflow` are model-invocable so the agent can run them during a task. All resolve `${CLAUDE_PLUGIN_ROOT}` to the installed plugin path.

**Per-phase execution commands** (model-driven — run one role's work per the scaffolded docs, not the CLI):

```
/sdlc-workflow:po  ·  :ba  ·  :design  ·  :architect  ·  :tech-ba  ·  :dev
/sdlc-workflow:test  ·  :security  ·  :deploy  ·  :guideline  ·  :maintain
```

For example `/sdlc-workflow:test` has Claude act as QE — execute unit/integration/E2E + visual-regression & layout-integrity checks, use provisioned test accounts/data, capture evidence, and run the bug-fix loop to zero open bugs.

Layout: `.claude-plugin/marketplace.json` (root) lists the plugin at `./plugin`, which holds `plugin/.claude-plugin/plugin.json`, `plugin/skills/`, and the bundled `plugin/cli/`. These files are generated from the CLI's source of truth — run `npx sdlc-workflow plugin` to (re)generate them.

## Companion plugins (Superpowers + feature-dev) — optional

SDLC is the **orchestrator** (business → ops). You can plug in technical **engines** per phase: [Superpowers](https://github.com/obra/superpowers) (brainstorming, writing-plans, TDD, debugging…), `feature-dev`, `code-review`, `security-guidance`, `context7`. They **augment** the workflow — if one isn't installed, that phase falls back to the SDLC template (no hard-fail). Full guideline (per-phase engine + model tiers + fallback): **`docs/sdlc/INTEGRATION.md`**.

### Install (verified on `claude-plugins-official`, 06/2026)

```shell
/plugin install feature-dev@claude-plugins-official
/plugin install code-review@claude-plugins-official
/plugin install security-guidance@claude-plugins-official
/plugin install superpowers@claude-plugins-official
/plugin install context7@claude-plugins-official        # recommended
```

- When installing, Claude Code asks for **scope** — pick **user** to load the plugin in every session on this machine (vs **project** for this repo only).
- `claude-plugins-official` is preloaded — no `marketplace add` needed for these.
- **superpowers** also ships from the author's marketplace (latest first): `/plugin marketplace add obra/superpowers-marketplace` then `/plugin install superpowers@superpowers-marketplace`. Pick **one** source.

### Update / verify

```shell
/plugin marketplace update <marketplace>    # re-fetch catalog — required first
/plugin install <plugin>@<marketplace>      # reinstall the bumped version
/reload-plugins                             # apply without restarting
```

Open `/plugin` to confirm each is **enabled**.

### Which plugin for which phase

| Plugin | Phases | Role |
|--------|--------|------|
| `superpowers` | PO · Technical BA · Dev · QE · Bug-fix · Deploy | brainstorming, writing-plans, TDD, subagent-driven, requesting-code-review, systematic-debugging, finishing-a-development-branch |
| `feature-dev` | Architect · Dev | 7-phase: explore → architecture → implement → review |
| `code-review` | QE (testing) | quality gate on the diff |
| `security-guidance` | Dev → Security (realtime) | three-layer vulnerability check, runs automatically |
| `context7` | Architect · Dev | docs lookup, framework-accurate code |

> ⚠️ **`code-review` is ambiguous:** Claude Code has a built-in `/code-review` skill **and** the official `code-review` plugin — pick one and note it in `.claude/CLAUDE.md`. See `docs/sdlc/INTEGRATION.md` §8 for the full per-phase mapping.

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
