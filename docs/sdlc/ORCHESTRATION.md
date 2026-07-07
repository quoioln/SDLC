# Pipeline Orchestration

## Trigger

When the user sends an **idea**, **feature request**, or **requirement**:
1. **Trigger the full pipeline** and run continuously through deployment.
2. **One role per phase** for sequential phases. **Spawn parallel workstreams** when dependencies are independent.
3. **Announce each phase (mandatory):** print a one-line banner at the start of every phase / role switch — `🎭 Role: [ROLE] <title> · 📂 Output: <folder> · 🧠 Suggested model: <tier> — check/switch with /model`. Tiers: lead/analysis/audit → **Opus 4.8**; logic-bearing code & tests → **Sonnet 5** (near-Opus coding at ~60% of the price); mechanical work → **Haiku 4.5**; escalate to **Fable 5** only for the hardest problems (novel architecture, critical security/logic audit — 2× Opus price, never the default). The workflow does not change the model for you (use `/model` or spawn a sub-agent on that tier — switching a running agent's model breaks the prompt cache). Current model: `/model` or `/status`.
4. **Phase handoff — ask, then auto-advance.** When a phase completes and its gate (if any) passes: recap the output in one line → ask a checkpoint ("✅ <phase> done → next: <next>. Reply `stop`/`adjust` to intervene; else I continue") → commit if auto-commit per phase is armed → **auto-trigger the next phase** (`/sdlc-workflow:<next>` with its banner). Gates: Design→Architect (PO+BA approve); QE→Security (0 open bugs + sign-off); Security→Deploy (0 Critical/High + sign-off).
5. **Run through to Maintenance.** Do not stop after PO, BA, or Dev unless the user explicitly says to stop.

## 🚦 The Orchestrator's Most Important Rule

> **Parallel by default. Sequential only when required.**

Before running any two workstreams, ask: "Does workstream B depend on workstream A's output?"
- **Yes** → Run sequentially (A first, then B)
- **No** → **Run in parallel immediately**

## Execution Map

Sequential: Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 Technical BA
Parallel Track A: Technical BA complete → [DEV] + [QE] simultaneously
Parallel Track B: Dev complete → [QE] + [SEC] + [PERF] simultaneously → merge gate → [OPS] Deploy

## Checklist per run

### Sequential phases
- [ ] Phase 0 Discovery: raw request captured
- [ ] Phase 1 [PO]: artifacts in `docs/sdlc/po/{epic-slug}/`
- [ ] Phase 2 [BA]: `docs/sdlc/ba/business/{epic-slug}/`
- [ ] Phase 3 [UX] (if app/web): `docs/sdlc/design/{epic-slug}/`; [PO]+[BA] review until approved
- [ ] Phase 4 [SA]: `docs/sdlc/architecture/`
- [ ] Phase 5 Technical [BA]: `docs/sdlc/ba/technical/`

### ⚡ Parallel Track A (spawn immediately after Phase 5)
- [ ] Spawn [DEV] implementation (all roles: [FE]/[BE]/[MOBILE]/[EMB]/[DATA]/[PLATFORM])
- [ ] Spawn [QE] test plan + test cases in parallel
- [ ] Do NOT wait for one to finish before starting the other

### ⚡ Parallel Track B (spawn when [DEV] is complete)
- [ ] Spawn [QE] test execution
- [ ] Spawn [SEC] security audit
- [ ] Spawn [PERF] performance audit
- [ ] All three run simultaneously — merge gate only after all complete

### Post-merge
- [ ] Phase 9 [OPS]: `docs/sdlc/deploy/`
- [ ] Phase 10: Project Completion Package → SHIPPED ✅
- [ ] Phase 11 Maintenance

## Phase toggles (sdlc-config)

**All phases on by default** (`full` profile). `docs/sdlc/sdlc-config.md` is the persistent on/off switch the agent reads at pipeline start and at every handoff — a disabled phase is skipped with a visible `⏭` banner, never silently.

### Quick toggle

| Action | What to say to the agent |
|--------|--------------------------|
| 🔀 Switch profile | **"profile standard"** — presets: `full` (all 11 phases) / `standard` (skips Design, Guideline, Maintenance) / `hotfix` (Dev → QE Smoke → Security → Deploy) / `docs-only` (PO → BA → Architect → Technical BA) |
| ⛔ Disable one phase | **"disable phase qe"** (po, ba, design, architect, tech-ba, dev, test/qe, security, deploy, guideline, maintain) |
| ✅ Enable one phase | **"enable phase guideline"** |
| ⏸ One epic only | **"skip qe for this epic"** — current epic only, config file untouched |
| 👀 Inspect | **"show sdlc config"** |

The agent edits `sdlc-config.md` (profile line + phase table), confirms the new state in one line, and applies it from the next handoff. **Guard:** the security phase cannot be disabled while the epic touches money/payments, auth, or PII — the agent refuses and suggests lowering the QE depth tier instead. Full details and the phase table live in `docs/sdlc/sdlc-config.md`.

## Version-control checkpoints (opt-in)

**Off by default.** Enable by telling the agent **"auto-commit per phase"** (aka checkpoint commits); disable with **"stop auto-commit"**. When on, the agent commits at each phase gate so you can track, review, and revert per phase.

### Quick toggle

| Action | What to say to the agent |
|--------|--------------------------|
| ✅ Enable | **"auto-commit per phase"** (optionally: "auto-commit per phase, branch base: develop") |
| 🛑 Disable | **"stop auto-commit"** |
| ⏸ Pause one phase | **"skip commit this phase"** |

The agent acknowledges the current mode at the start of each phase so you always know whether commits are armed.

### How to use
1. Say **"auto-commit per phase"** (optionally specify a base branch, e.g. "base: develop").
2. The agent creates/uses a branch `epic/{epic-slug}` and commits at each phase gate.
3. After each commit it reports the **hash** so you can review (`git show <hash>`) or revert (`git revert <hash>`).
4. **Push and PR stay manual** — the agent never pushes or tags on its own.
5. Say **"stop auto-commit"** to return to a single commit at the end (default mode).
6. Say **"skip commit this phase"** to skip the checkpoint for just the current phase without disabling the mode.

### Rules when enabled
- **Branch per epic** (`epic/{epic-slug}` off the default branch) — never commit the pipeline straight to main/master.
- **Commit only when the phase gate passes** — never commit a red/incomplete state (Dev: build+tests green; QE: 0 open bugs; SEC/PE: 0 Critical/High or documented accepted-risk).
- **One commit per docs phase**; inside Dev, **one commit per task** (each green). Keep diffs atomic (≤ ~400 lines).
- **No auto-push, no auto-tag.** **Secret-scan + respect .gitignore** before every commit — never commit secrets/PII or test credentials.

### Conventional messages (phase + epic + issue/TC id)
| Phase | Example |
|-------|---------|
| PO | `docs(po): {epic} — PRD, user stories, feasibility` |
| Business BA | `docs(ba): {epic} — FRS/NFR + Gherkin AC` |
| Design | `docs(design): {epic} — spec + states + a11y` |
| Architect | `docs(arch): {epic} — ADRs + C4` |
| Technical BA | `docs(tech-ba): {epic} — API spec + schema` |
| Dev | `feat(dev): {epic} — <task> (tests green)` |
| QE | `test(qe): {epic} — suite + evidence (0 bugs)` |
| Security/PE | `fix(sec): {epic} — SEC-001 …` / `docs(audit): {epic} — report` |
| Deploy | `chore(deploy): {epic} — compose + k8s` |
| Guideline | `docs(guideline): {epic} — feature guideline` |

`git log --oneline` then reads as the pipeline timeline; revert a phase with `git revert <hash>` and let the remediation loop redo it. This complements — does not replace — the quality gates.
