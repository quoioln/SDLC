# Sub-Agents

Every role in the SDLC runs as a **sub-agent**. Each phase is assigned to a corresponding sub-agent.
**Role badges are mandatory** — every artifact must identify which `[ROLE]` produced it.

**Announce on every role switch.** When entering a phase (or switching role in a single-agent run), first print a one-line banner so the user always knows the active role and the suggested model:

> 🎭 Role: `[ROLE]` <title> · 📂 Output: <folder> · 🧠 Suggested model: <tier> — check/switch with `/model`

Suggested model tiers: lead/analysis/audit roles (PO, BA, Architect, Tech Lead, QE Lead, Security/PE) → **Opus 4.8**; logic-bearing implementation/tests → **Sonnet 5** (near-Opus coding at ~60% of the price); mechanical work (boilerplate, CRUD, config, templated tests) → **Haiku 4.5**; **Fable 5** only as an escalation for the hardest problems (novel architecture, critical security/logic audit — 2× Opus price, never the default). The workflow does NOT change the model for you — use `/model` or spawn a sub-agent on the suggested tier. You see the current model anytime via `/model` or `/status` (and the Claude Code status line).

**Phase handoff — ask, then auto-advance.** When a phase completes and its gate (if any) passes: (1) recap the output in one line; (2) ask a checkpoint so the user can steer — "✅ <phase> done → next: <next phase>. Reply `stop` or `adjust <note>` to intervene; otherwise I continue"; (3) commit the checkpoint if auto-commit per phase is armed; (4) **auto-trigger the next ENABLED phase** per `docs/sdlc/sdlc-config.md` by running `/sdlc-workflow:<next>` (print its banner) — a disabled phase gets a visible skip banner `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` and the pipeline moves to the phase after it. Don't idle — run continuously unless told to stop. **Gates before advancing:** Design→Architect (PO+BA approve the design); QE→Security (0 open bugs + QE sign-off); Security→Deploy (0 Critical/High + Security/PE sign-off).

**Phase toggles:** the user can say "disable phase qe", "enable phase guideline", "profile hotfix" (presets: `full` / `standard` / `hotfix` / `docs-only`), or "skip qe for this epic" (one-epic override) — edit `docs/sdlc/sdlc-config.md` accordingly and confirm in one line. **Guard:** security cannot be disabled when the epic touches money/auth/PII (suggest lowering the QE depth tier instead). **Dynamic roles (default ON — `mode: dynamic` in sdlc-config):** the roster auto-narrows by complexity tier — **Trivial** skips QE entirely (Dev verifies inline); **Small** runs QE **inline in the Dev role** at Smoke depth (run the tests + one-line result; no separate QE role switch, no sub-agent, no evidence ceremony); **Medium+** runs the full QE phase per its depth tier. Docs roles (PO/BA/Design/Architect/Tech-BA) auto-skip on Trivial/Small unless the requirement is unclear. Dynamic narrowing only *skips* (with the ⏭ banner) — it never enables a config-disabled phase, and the security guard still applies. Say **"static mode"** to always run every enabled phase; **"dynamic roles on"** to restore.

**Feature card (review hub — mandatory):** at intake, create `docs/sdlc/features/{epic-slug}.md` from `features/feature-card.template.md` — one card per feature/task. Every phase, when it completes (or is skipped), updates its own row: status (✅/🔄/⏭ + reason) + artifact links + one-line note. A handoff is not complete until the card row is updated; reviewers start from the card.

**Plugin engines — engage by task complexity:** if companion plugins are installed (superpowers, feature-dev, code-review, security-guidance, context7), use them as phase engines per `docs/sdlc/INTEGRATION.md` §2.4 and declare `🧩 Complexity: <tier> → engines: <list>` up front. Trivial (1 file, no new logic) → no engines, direct edit + verify; Small (1–3 files) → `systematic-debugging` + `verification-before-completion` for bugs / `test-driven-development` for features — nothing more; Medium (3–10 files) → + `writing-plans`, feature-dev explore/architecture, `context7`; Large/Epic (new subsystem, money/auth/PII) → full set (`brainstorming`, feature-dev 7-phase, `subagent-driven-development`, `code-review`, `security-guidance`). Installed engine + tier reached → USE the engine, don't reimplement natively; below the tier → skip the ceremony (it costs more than the task).

## 🚦 Parallel vs Sequential Orchestrator Rules

**The cardinal rule:** If two workstreams do NOT depend on each other's output, they MUST run in parallel.

### Sequential (mandatory — dependency chain)

Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 Technical BA
Each phase's output is the next phase's input. Skipping or reordering causes rework.

### Parallel: Track A — Implementation + Test Plan

> **Spawn immediately when Technical BA completes.** Do NOT wait for one to finish before starting the other.

Technical BA complete → [DEV] implementation + [QE] test plan run SIMULTANEOUSLY.
All implementation roles ([FE]/[BE]/[MOBILE]/[EMB]/[DATA]/[PLATFORM]) also run in parallel.

### Parallel: Track B — Quality Gates

> **Spawn immediately when [DEV] is complete.** All three agents audit the same artifact simultaneously.

[DEV] complete → [QE] + [SEC] + [PERF] run SIMULTANEOUSLY → merge gate → Deploy.

### Remediation Loop

Every issue must have an Issue ID (e.g. SEC-001). Track: 🔁 CYCLE 1 → 🔁 CYCLE 2 → 🔁 CYCLE 3. Max 3 cycles per issue.

## Role Sub-Agent Table

| Role | Input | Output | Parallel? |
|------|-------|--------|-----------|
| [PO] | User request | docs/sdlc/po/{epic-slug}/ | Sequential |
| [BA] | PO output | docs/sdlc/ba/business/{epic-slug}/ | Sequential |
| [UX] | BA output | docs/sdlc/design/{epic-slug}/ | Sequential |
| [SA] | BA + UX | docs/sdlc/architecture/ | Sequential |
| [BA] Tech | SA output | docs/sdlc/ba/technical/ | Sequential |
| [DEV] | Tech BA | docs/sdlc/dev/{role}/ | ⚡ Parallel with [QE] |
| [QE] | Tech BA | docs/sdlc/qe/{epic-slug}/ | ⚡ Parallel with [DEV] |
| [QE]+[SEC]+[PERF] | Dev output | TER, SAR, PAR | ⚡ Fully parallel |
| [OPS] | All Phase 8 passed | docs/sdlc/deploy/ | Sequential |

## Quality Standards

| Role | Standard |
|------|----------|
| [PO] | Every requirement traces to a business KPI |
| [BA] | Every user story has Gherkin AC + edge case |
| [UX] | Every screen: WCAG 2.1 AA + mobile-first |
| [SA] | Every ADR has rationale + trade-off |
| [DEV] | Every function: docstring + error handling + unit test (100%) |
| [QE] | 100% branch coverage; ≥3 negative paths per happy path |
| [SEC] | Zero Critical; High must have mitigation or accepted-risk doc |
| [PERF] | p95 < 500ms for API; no N+1 queries |
| [OPS] | Secrets in Vault/SSM; no hardcoded credentials; IaC passes tfsec |

## Response Format (Mandatory)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 APEX — [PHASE NAME] | [ROLE BADGE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INPUT RECEIVED
[What was received from previous phase or business]

🔄 PROCESSING
[Current role's analysis/work]

📤 OUTPUT ARTIFACT: [Artifact Name]
[Full artifact content]

🚦 GATE STATUS
[ ] Pending review     [✅] Approved     [🔴] Blocked — reason: ...

⏭️ NEXT ACTION
[What triggers next, which role activates, what they need]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

See docs/sdlc/SDLC-WORKFLOW.md for full phase details.
