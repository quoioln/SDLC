# Implementation roles by project type

Use only the roles that apply. Remove or ignore the rest. Tech Lead is cross-cutting; add discipline roles as needed.

## Model optimization strategy (3 tiers)

Pick the model by **task difficulty**, not by a fixed per-role rule:

| Role / task | Model tier | Why |
|-------------|-----------|-----|
| Tech Lead (lead) | **Highest** (e.g. Opus) | Planning, logic analysis, architecture decisions, code review |
| Implementation — **logic-bearing** (business logic, integration, refactor, branching/edge cases) | **Mid-tier** (e.g. Sonnet) | Needs real reasoning; cheap-but-wrong here forces an Opus rework cycle that costs more |
| Implementation — **mechanical** (boilerplate, CRUD, config, wiring, tests from a template, lint/format fixes) | **Cost-efficient** (e.g. Haiku) | Spec is fully prescribed → just execute; cheapest tier is enough |

Tech Lead defines all critical steps, logic, and specs first → implementation roles execute them. **Default implementation to the mid-tier (Sonnet) and drop to Haiku only when the work is purely mechanical** — this maximizes quality on thinking, keeps a safe default on execution, and reserves the cheapest tier for work that genuinely can't go wrong. Avoid defaulting everything to Haiku: the rework loop (Haiku writes → Opus fixes) usually costs more than getting it right once on Sonnet.

> **Switching models mid-session breaks the prompt cache.** To realize these savings cleanly, keep one agent on one model and **spawn a sub-agent on the cheaper tier** for the delegated subtask (the Tech Lead, on Opus, dispatches mechanical work to a Haiku sub-agent) rather than swapping the model of a running agent.

> **All roles must satisfy [Developer Quality Rules](./quality-rules.md) before opening a PR** (DoD, test quality, type-safety, error handling, performance budget, security, and i18n for UI). Tech Lead enforces it at review.

## By project type

| Project type        | Roles to use (all Senior 10+ except Tech Lead 15+) |
|---------------------|----------------------------------------------------|
| Web / full-stack    | Tech Lead, Senior Frontend, Senior Backend         |
| Mobile              | Tech Lead, Senior Mobile, Senior Backend           |
| API / backend only  | Tech Lead, Senior Backend                          |
| Library / SDK       | Tech Lead, Senior Dev (or Senior Backend)           |
| CLI / tooling       | Tech Lead, Senior Dev (or Senior Backend)           |
| Data / ML           | Tech Lead, Senior Backend, Senior Data/ML          |
| Embedded / IoT      | Tech Lead, Senior Embedded (+ Senior Backend if needed) |
| Platform / infra    | Tech Lead, Senior Platform (+ Senior Backend if needed) |
| Mixed               | Tech Lead + any of: Senior Frontend, Backend, Mobile, Embedded, Data/ML, Platform |

## Role folders (all implementation roles are Senior 10+ yrs)

- `tech-lead/` — Tech Lead (15+ yrs): tech stack, review & merge (all projects)
- `senior-developer/` — Senior Developer: generic implementation
- `frontend/` — Senior Frontend: Web UI
- `backend/` — Senior Backend: API, services, DB
- `mobile/` — Senior Mobile: iOS, Android, cross-platform
- `embedded/` — Senior Embedded: firmware, IoT
- `data-ml/` — Senior Data/ML: ETL, models, analytics
- `platform/` — Senior Platform: CI/CD, infra, observability
