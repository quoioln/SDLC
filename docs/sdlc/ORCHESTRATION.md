# Pipeline Orchestration

## Trigger

When the user sends an **idea**, **feature request**, or **requirement**:
1. **Trigger the full pipeline** and run continuously through deployment.
2. **One role per phase** for sequential phases. **Spawn parallel workstreams** when dependencies are independent.
3. **Run through to Maintenance.** Do not stop after PO, BA, or Dev unless the user explicitly says to stop.

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

## Version-control checkpoints (opt-in)

**Off by default.** Enable by telling the agent **"auto-commit per phase"** (aka checkpoint commits); disable with **"stop auto-commit"**. When on, the agent commits at each phase gate so you can track, review, and revert per phase.

### How to use
1. Say "auto-commit per phase" (optionally name a base branch).
2. The agent creates/uses a branch `epic/{epic-slug}` and commits at each phase gate.
3. After each commit it reports the **hash** so you can review (`git show <hash>`) or revert (`git revert <hash>`).
4. **Push and PR stay manual** — the agent never pushes or tags on its own.
5. Say "stop auto-commit" to go back to a single commit at the end.

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
