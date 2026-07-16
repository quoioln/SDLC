---
name: sdlc-workflow
description: Multi-role SDLC workflow from user requirements through PO, Business BA, Architect, Technical BA, Dev teams, and QE. Use when user sends an idea, feature request, or requirement — trigger full pipeline through deployment. Use when user mentions SDLC, requirements, PO, BA, Architect, technical spec, phased development, or handoff between roles.
---

# SDLC Workflow (Multi-Role)

**Parallel by default, sequential only when required.** Each role runs as a sub-agent. Design before Architect (UX drives tech). After docs phase → Dev runs immediately.

## Trigger and orchestration (mandatory)

**When the user sends an idea, feature request, or new requirement:**
1. **Recall memory** — Before executing any new action, recall relevant memories (project context, user preferences, past decisions) to ensure continuity and avoid repeating mistakes.
2. **Trigger the pipeline** and run it **continuously through deployment**.
3. **One role per phase** for sequential phases. **Spawn parallel workstreams** when dependencies are independent.
4. **Announce each phase with a status banner (mandatory).** At the start of every phase — and on every role switch in a single-agent run — print this one line first, so the user always sees the active role and the suggested model:
   > 🎭 Role: `[ROLE]` <title> · 📂 Output: <folder> · 🧠 Suggested model: <tier> — check/switch with `/model`

   **Suggested model tiers:** lead / analysis / audit roles ([PO], [BA], [ARCH], Tech Lead, QE Lead, [SEC/PE]) → **Opus 4.8**; logic-bearing implementation & tests → **Sonnet 5** (near-Opus coding quality at ~60% of the price); mechanical work (boilerplate, CRUD, config, templated tests) → **Haiku 4.5**; **Fable 5** is an escalation tier only — reserve it for the hardest problems (novel/complex architecture, security audit of critical systems) since it costs 2× Opus. The workflow does **NOT** change the model for you — switch with `/model` or spawn a sub-agent on the suggested tier (switching a running agent's model breaks the prompt cache; a sub-agent does not). You can see the current model anytime via `/model` or `/status` (and the Claude Code status line).
5. **Phase handoff — ask, then auto-advance.** When a phase completes and its gate (if any) passes: (a) **recap** the output in one line; (b) **ask a checkpoint** so the user can steer — "✅ <phase> done → next: <next phase>. Reply `stop` or `adjust <note>` to intervene; otherwise I continue"; (c) **commit** the checkpoint if auto-commit per phase is armed; (d) **auto-trigger the next phase** by running `/sdlc-workflow:<next>` (print its banner). Don't idle — run continuously unless told to stop. **Gates before advancing:** Design→Architect needs PO+BA approval; QE→Security needs 0 open bugs + sign-off; Security→Deploy needs 0 Critical/High + sign-off.
6. **Phase toggles (sdlc-config).** `docs/sdlc/sdlc-config.md` is the persistent per-phase on/off switch (profiles: `full` / `standard` / `hotfix` / `docs-only`). Consult it at pipeline start and at every handoff; skip disabled phases with a visible banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — then continue with the next enabled phase. The user toggles by saying "disable phase qe" / "enable phase guideline" / "profile hotfix" / "skip qe for this epic" (one-epic override; file untouched) — update the file and confirm in one line. **Guard:** security cannot be disabled when the epic touches money/auth/PII (suggest lowering the QE depth tier instead). **Dynamic roles (default ON — `mode: dynamic` in sdlc-config):** the roster auto-narrows by complexity tier — **Trivial** skips QE entirely (Dev verifies inline); **Small** runs QE **inline in the Dev role** at Smoke depth (run the tests + one-line result; no separate QE role switch, no sub-agent, no evidence ceremony); **Medium+** runs the full QE phase per its depth tier. Docs roles (PO/BA/Design/Architect/Tech-BA) auto-skip on Trivial/Small unless the requirement is unclear. Dynamic narrowing only *skips* (with the ⏭ banner) — it never enables a config-disabled phase, and the security guard still applies. Say **"static mode"** to always run every enabled phase; **"dynamic roles on"** to restore.
7. **Plugin engines — engage by task complexity.** If companion plugins are installed (superpowers, feature-dev, code-review, security-guidance, context7), use them as phase engines per docs/sdlc/INTEGRATION.md §2.4 and declare the tier up front: `🧩 Complexity: <tier> → engines: <list>`. **Trivial** (1 file, no new logic) → no engines, direct edit + verify. **Small** (bug fix / small feature, 1–3 files) → `systematic-debugging` + `verification-before-completion` for bugs, `test-driven-development` for features — nothing more. **Medium** (multi-module, 3–10 files) → add `writing-plans`, feature-dev explore/architecture, `context7`. **Large/Epic** (new subsystem, cross-cutting, money/auth/PII) → full set: `brainstorming`, feature-dev 7-phase, `subagent-driven-development`, `code-review`, `security-guidance`. Installed engine + tier reached → USE the engine, don't reimplement natively; below the tier → skip the ceremony (it costs more than the task).
8. **Feature card (review hub — mandatory).** At intake, create `docs/sdlc/features/{epic-slug}.md` from `features/feature-card.template.md` — one card per feature/task. Every phase, when it completes (or is skipped), updates its own row: status (✅/🔄/⏭ + reason) + artifact links + one-line note. A handoff is not complete until the card row is updated; reviewers start from the card.

**Parallel tracks:**
- Track A (after Technical BA): [DEV] implementation + [QE] test plan — run SIMULTANEOUSLY
- Track B (after Dev complete): [QE] + [SEC] + [PERF] audits — run SIMULTANEOUSLY

**Note:** In Cursor there is a single agent per conversation. Adopt one role per sequential phase; spawn parallel tasks for Track A and Track B.

**Version control (opt-in):** Phase checkpoint commits are **off by default**.
- **Enable:** user says "auto-commit per phase" → work on `epic/{slug}`, commit at each phase gate (only after it passes), report the hash, never auto-push.
- **Disable:** user says "stop auto-commit" → return to default (single commit at end or none).
- **Skip one phase:** user says "skip commit this phase" → skip the checkpoint for this phase only.
- Acknowledge the current mode (armed / disarmed) at the start of each phase.
See ORCHESTRATION.md → Version-control checkpoints for the full toggle guide and conventional message table.

**Sub-agent specs**: docs/sdlc/agents/

## Flow Overview

Sequential: Phase 0 → Phase 1 [PO] → Phase 2 [BA] → Phase 3 [UX] → Phase 4 [SA] → Phase 5 Technical [BA]
Parallel Track A: Technical BA complete → [DEV] + [QE] simultaneously
Parallel Track B: Dev complete → [QE] + [SEC] + [PERF] simultaneously → merge gate → [OPS] Deploy

**Determine current phase** before acting. If user sent an idea, assume Phase 0 and start from Phase 1.

---

## Phase 0: User Request / Discovery

**Trigger**: New feature request, bug report, or requirement from stakeholder.
**Output**: Initial request logged, ready for PO.

## Phase 1: PO (Product Owner)

**Role**: Prioritize, clarify business value, create product docs.
**Deliverables**: Epic/Feature brief, user stories, acceptance criteria, priority, dependencies.
**Output**: `docs/sdlc/po/{epic-slug}/` — **one folder per epic** (e.g. `po/job-scheduler-event-bus/epic-brief.md`). Do not put all epics in one file. **Handoff to Business BA.**

## Phase 2: Business BA (Business Analyst)

**Role**: Break down from business perspective.
**Deliverables**: Business process flows, functional requirements, use cases, glossary.
**Output**: `docs/sdlc/ba/business/{epic-slug}/` — **one folder per epic** (same slug as PO). Do not merge all epics into one file. **Handoff to Design (if app/web) or Architect.**

## Phase 3: Design (optional — app/web only)

**When:** Project has UI (web, mobile app). Skip for API-only, library, CLI, data/ML, platform without UI.

**Role**: Create UI/UX design specs (Markdown) and optional HTML wireframes from idea + PO + Business BA docs. Design **before** Architect so UX drives technical decisions. **Anti AI pattern**: designs must NOT look AI-generated.
**Output**: `docs/sdlc/design/{epic-slug}/` — design-spec.md + optional wireframes/.

**Review loop:**
1. **PO review**: Design aligns with epic brief, user stories, acceptance criteria?
2. **Business BA review**: Design matches functional requirements, process flows?
3. **If not approved**: Capture feedback → redesign → repeat until PO and BA approve.
4. **If approved** → **Handoff to Architect.**

## Phase 4: Architect

**Role**: Design system architecture and technology choices.
**Deliverables**: System context, container diagram, ADRs, tech stack, cross-cutting concerns.
**Engineering principles**: SOLID, DRY, KISS, SoC, High Availability, CQRS, Zero Trust, EDA, Statelessness, Disposability, Backing Services, Config, Codebase, Database Sharding/Partitioning, Logging & Tracing, Monitoring & Alerting.
**Input**: Business BA + Design (if app/web) — design informs architecture.
**Output**: `docs/sdlc/architecture/` — **Handoff to Technical BA.**

## Phase 5: Technical BA

**Role**: Translate business + architecture + design into implementable specs.
**Deliverables**: API specs, DB schema, team breakdown, acceptance criteria per ticket.
**Input**: Architect + Design (if app/web) — design informs API/screen contracts.
**Output**: `docs/sdlc/ba/technical/` — **Handoff to QE + Dev.**

## Phase 5a: QE (Docs phase)

**Role**: Create test plan, test cases before Dev implements.
**Deliverables**: Test plan, test cases.
**Output**: `docs/sdlc/qe/{epic-slug}/` — **one folder per epic** (same slug as PO/BA).
**⚡ Parallel with Phase 5b**: [DEV] starts implementation immediately after Technical BA — do NOT wait for QE docs to finish.

## Phase 5b: Dev Teams

**Trigger**: After Technical BA is complete (not after QE docs). **Dev runs implementation immediately.**
**⚡ Parallel with Phase 5a**: [DEV] AND [QE] test plan run simultaneously.

**Roles** (vary by project — use only what applies). All implementation roles are **Senior (10+ yrs)**:
- **Tech Lead (15+ yrs)** — **highest model** (e.g. Opus 4.8): Planning, logic analysis, architecture decisions, tech stack, code review & merge.
- **Senior Frontend (10+ yrs)**: Web UI.
- **Senior Backend (10+ yrs)**: API, services, DB.
- **Senior Mobile (10+ yrs)**: iOS/Android/cross-platform.
- **Senior Embedded (10+ yrs)**: Firmware, IoT.
- **Senior Data/ML (10+ yrs)**: ETL, models, analytics.
- **Senior Platform (10+ yrs)**: CI/CD, infra.

**Model tier (all implementation roles, 3 mức theo độ khó):** default **mid-tier** (e.g. Sonnet 5) for logic-bearing work (business logic, integration, refactor, edge cases); drop to **cost-efficient** (e.g. Haiku 4.5) for mechanical work (boilerplate, CRUD, config, tests from a template). Opus 4.8 stays with the Tech Lead; escalate to Fable 5 only for the hardest problems (2× Opus price — never the default). To realize the saving without breaking the prompt cache, spawn a cheaper-tier sub-agent for the delegated subtask rather than switching a running agent's model.

**⚡ All implementation roles run in parallel** — frontend does NOT wait for backend; they coordinate via API contract from Technical BA.

**Requirements**: Unit Test coverage **100%** (TDD/BDD); Clean Code, SOLID, DRY, KISS, SoC, POLS.
**Output**: Code + unit tests. **Handoff to Phase 8.**

## Phase 8: [QE] + [SEC] + [PERF] Quality Gates (⚡ fully parallel audits)

**Trigger**: After Dev completes implementation (code + 100% coverage).
**⚡ All three audits run SIMULTANEOUSLY on the same artifact.** Do NOT wait for one to finish before starting another.

- **[QE]**: Execute all test suites, enforce 100% coverage gate, report bugs (QE-001...).
- **[SEC]**: OWASP Top 10, STRIDE threat model, CVE scan, compliance (GDPR/PCI/SOC2). Report: SEC-001...
- **[PERF]**: Latency benchmarks (p95<500ms), N+1 detection, k6 load test. Report: PERF-001...

**Merge gate**: Collect all findings from all three. If Critical/High → 🔁 REMEDIATION LOOP → [DEV] fix → [QE] retest → re-audit. Max 3 cycles per issue.
**Quality Gate PASSED** → [OPS] Deploy.

## Phase 9: Deploy

**Trigger**: After Security + Principle Engineer sign-off.
**Role**: Deploy with **Docker Compose** (local/staging) and **Kubernetes** (production).
**Output**: `docs/sdlc/deploy/` — docker-compose.yml, k8s manifests.

## Quick Phase Checklist

| Phase | Role | Key Output |
|-------|------|------------|
| 0 | Discovery | Raw request |
| 1 | PO | PRD, user stories, feasibility assessment |
| 2 | Business BA | FRS, NFR, process flows |
| 3 | Design (if app/web) | Design specs + wireframes; PO+BA review until approved |
| 4 | Architect | ADRs, system diagrams, security by design |
| 5 | Technical BA | API specs, tech breakdown |
| 6 | QE (docs) | Test plan, test cases |
| 7 | Dev | Code, unit tests (100%), security shift-left |
| 8 | QE (testing + UAT) | Automation, UAT; **bug-fix loop** (QE finds bugs → Dev fix → QE retest) until 0 open bugs |
| 9 | Security + PE | Audit; **fix → retest → re-audit loop** (Dev fix → QE retest → re-audit) until 0 issues; sign-off → Deploy |
| 10 | Deploy | Docker Compose + K8s |
| 11 | Maintenance | Monitoring, bug fixes, patches, dependency updates |

**Sub-agents**: Each role = one sub-agent. Design before Architect (UX drives tech). See docs/sdlc/agents/
See reference.md for templates.
