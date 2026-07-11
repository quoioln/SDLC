## SDLC Workflow

**Trigger on idea:** When the user sends an idea, feature request, or requirement, run the pipeline continuously: Phase 1 (PO) → 2 → … → Deploy → Maintenance. One role per phase (single agent = switch role each phase). Do not stop after one phase unless the user asks.

**Announce each phase (mandatory):** At the start of every phase / role switch, print a one-line banner — `🎭 Role: [ROLE] <title> · 📂 Output: <folder> · 🧠 Suggested model: <tier> — check/switch with /model`. Tiers: lead/analysis/audit roles → **Opus 4.8**; logic-bearing code & tests → **Sonnet 5** (near-Opus coding at ~60% of the price); mechanical work (boilerplate/CRUD/config/templated tests) → **Haiku 4.5**; escalate to **Fable 5** only for the hardest problems (novel architecture, critical security/logic audit — 2× Opus price, never the default). The workflow does not change the model for you — use `/model` (or spawn a sub-agent on that tier; switching a running agent's model breaks the prompt cache). See the current model via `/model` or `/status`.

**Memory requirement:** Before executing any new action, recall relevant memories (project context, user preferences, past decisions) to ensure continuity and avoid repeating mistakes.

**Phase toggles (sdlc-config):** `docs/sdlc/sdlc-config.md` is the persistent per-phase on/off switch (profiles: `full` / `standard` / `hotfix` / `docs-only`). Read it at pipeline start and at every handoff; skip disabled phases with a visible banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — then continue with the next enabled phase. Toggle by saying: "disable phase qe", "enable phase guideline", "profile hotfix", or "skip qe for this epic" (one-epic override; file untouched) — update the file and confirm in one line. **Guard:** security cannot be disabled when the epic touches money/auth/PII (suggest lowering the QE depth tier instead). **Dynamic roles (default ON — `mode: dynamic` in sdlc-config):** the roster auto-narrows by complexity tier — **Trivial** skips QE entirely (Dev verifies inline); **Small** runs QE **inline in the Dev role** at Smoke depth (run the tests + one-line result; no separate QE role switch, no sub-agent, no evidence ceremony); **Medium+** runs the full QE phase per its depth tier. Docs roles (PO/BA/Design/Architect/Tech-BA) auto-skip on Trivial/Small unless the requirement is unclear. Dynamic narrowing only *skips* (with the ⏭ banner) — it never enables a config-disabled phase, and the security guard still applies. Say **"static mode"** to always run every enabled phase; **"dynamic roles on"** to restore.

**Plugin engines — engage by task complexity:** if companion plugins are installed (superpowers, feature-dev, code-review, security-guidance, context7), use them as phase engines per docs/sdlc/INTEGRATION.md §2.4. Declare the tier up front: `🧩 Complexity: <tier> → engines: <list>`. **Trivial** (1 file, no new logic) → no engines, direct edit + verify. **Small** (bug fix / small feature, 1–3 files) → `systematic-debugging` + `verification-before-completion` for bugs, `test-driven-development` for features — nothing more. **Medium** (multi-module, 3–10 files) → add `writing-plans`, feature-dev explore/architecture, `context7`. **Large/Epic** (new subsystem, cross-cutting, money/auth/PII) → full set: `brainstorming`, feature-dev 7-phase, `subagent-driven-development`, `code-review`, `security-guidance`. Installed engine + tier reached → USE the engine, don't reimplement natively. Below the tier → skip the ceremony (it costs more than the task).

**Parallel by default, sequential only when required:** If two workstreams do NOT depend on each other's output, they MUST run in parallel.

1. **PO** — PRD, user stories, feasibility assessment → docs/sdlc/po/{epic-slug}/ (one folder per epic)
2. **Business BA** — FRS, NFR, Gherkin, process flows → docs/sdlc/ba/business/{epic-slug}/ (one folder per epic)
3. **Design (if app/web)** — Design specs + wireframes (**Anti AI**: no AI-looking designs) → docs/sdlc/design/{epic-slug}/; **PO + BA review** until approved
4. **Architect** — ADRs, C4 diagrams, security by design, engineering principles (SOLID, DRY, KISS, CQRS, Zero Trust, EDA, HA) → docs/sdlc/architecture/
5. **Technical BA** — API specs (OpenAPI 3.x), team breakdown → docs/sdlc/ba/technical/
6. **⚡ Phase 5a [QE]** + **⚡ Phase 5b [DEV]** — run in PARALLEL after Technical BA:
   - [QE]: test plan + test cases → docs/sdlc/qe/{epic-slug}/ (100% coverage target)
   - [DEV]: code + unit tests (100%) → docs/sdlc/dev/{role}/ — start immediately, do NOT wait for QE docs
7. **⚡ Phase 8** — [QE] + [SEC] + [PERF] audit SIMULTANEOUSLY after Dev complete:
   - Bug-fix loop → [DEV] fix → [QE] retest until 0 bugs
   - 🔁 Remediation loop: issue ID per finding, max 3 cycles, until 0 Critical/High issues
8. **Deploy** — Docker Compose + K8s + IaC → docs/sdlc/deploy/ (after all Phase 8 issues resolved)
9. **Maintenance** — Monitoring, bug fixes, patches, dependency updates → docs/sdlc/maintenance/

**Guideline (living docs):** Every new/changed feature must create or update its feature guideline → docs/sdlc/guideline/{epic-slug}.md (part of Definition of Done; Tech Lead enforces).

Design before Architect (UX drives tech). After Technical BA, Dev runs immediately — parallel with QE docs. See docs/sdlc/agents/
