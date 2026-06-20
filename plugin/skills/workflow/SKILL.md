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

**Parallel tracks:**
- Track A (after Technical BA): [DEV] implementation + [QE] test plan — run SIMULTANEOUSLY
- Track B (after Dev complete): [QE] + [SEC] + [PERF] audits — run SIMULTANEOUSLY

**Note:** In Cursor there is a single agent per conversation. Adopt one role per sequential phase; spawn parallel tasks for Track A and Track B.

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
- **Tech Lead (15+ yrs)** — **highest model** (e.g. Opus): Planning, logic analysis, architecture decisions, tech stack, code review & merge.
- **Senior Frontend (10+ yrs)**: Web UI.
- **Senior Backend (10+ yrs)**: API, services, DB.
- **Senior Mobile (10+ yrs)**: iOS/Android/cross-platform.
- **Senior Embedded (10+ yrs)**: Firmware, IoT.
- **Senior Data/ML (10+ yrs)**: ETL, models, analytics.
- **Senior Platform (10+ yrs)**: CI/CD, infra.

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
