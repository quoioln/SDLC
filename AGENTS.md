## SDLC Workflow

**Trigger:** When the user sends an **idea**, **feature request**, or **requirement**, run the full pipeline continuously through deployment. Do not stop after one phase unless the user asks.

**Announce each phase (mandatory):** print a one-line banner at the start of every phase / role switch — `🎭 Role: [ROLE] <title> · 📂 Output: <folder> · 🧠 Suggested model: <tier> — check/switch with /model`. Tiers: lead/analysis/audit → **Opus 4.8**; logic-bearing code & tests → **Sonnet 5** (near-Opus coding at ~60% of the price); mechanical work → **Haiku 4.5**; escalate to **Fable 5** only for the hardest problems (novel architecture, critical security/logic audit — 2× Opus price, never the default). The workflow does not change the model for you (use `/model` or spawn a sub-agent on that tier — switching a running agent's model breaks the prompt cache). Current model: `/model` or `/status`.

**Memory requirement:** Before executing any new action, recall relevant memories (project context, user preferences, past decisions) to ensure continuity and avoid repeating mistakes.

**Phase toggles (sdlc-config):** `docs/sdlc/sdlc-config.md` is the persistent per-phase on/off switch (profiles: `full` / `standard` / `hotfix` / `docs-only`). Read it at pipeline start and at every handoff; skip disabled phases with a visible banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — then continue with the next enabled phase. Toggle by saying: "disable phase qe", "enable phase guideline", "profile hotfix", or "skip qe for this epic" (one-epic override; file untouched). **Guard:** security cannot be disabled when the epic touches money/auth/PII.

**Parallel by default, sequential only when required.**

1. **Phase 1** [PO] — PRD, user stories, feasibility → docs/sdlc/po/{epic-slug}/
2. **Phase 2** [BA] — FRS, NFR, Gherkin, process flows → docs/sdlc/ba/business/{epic-slug}/
3. **Phase 3** [UX] (if app/web) — Design specs + wireframes; [PO]+[BA] review until approved → docs/sdlc/design/{epic-slug}/
4. **Phase 4** [SA] — ADRs, C4 diagrams, security by design → docs/sdlc/architecture/
5. **Phase 5** Technical [BA] — API specs (OpenAPI 3.x), team breakdown → docs/sdlc/ba/technical/
6. **⚡ Phase 5a** [QE] + **⚡ Phase 5b** [DEV] — parallel after Technical BA
7. **⚡ Phase 8** [QE] + [SEC] + [PERF] — parallel audits after [DEV] complete → merge gate
8. **Phase 9** [OPS] — Docker Compose + K8s + IaC → docs/sdlc/deploy/
9. **Phase 10** — SHIPPED ✅
10. **Phase 11** Maintenance — monitoring, bug fixes, patches

Design before Architect (UX drives tech). After Technical BA, [DEV] runs immediately — parallel with [QE] docs. See docs/sdlc/agents/
