# SDLC Adoption Guide (existing / brownfield projects)

Use this when adding the SDLC workflow to a codebase that already exists and may be in production. The default pipeline (PO → … → Deploy) assumes greenfield; this guide adapts it so you don't have to stop the world.

## 1. Don't boil the ocean
- Apply the full quality bar to **new and changed code first**; improve legacy incrementally (see "Brownfield" in dev/quality-rules.md).
- Gate coverage on **changed lines (diff coverage)**, not the whole repo.
- Ratchet: coverage / lint / security may only go **up** — never regress.

## 2. Capture the current state (reverse-engineering)
- **Scan first**: `npx sdlc-workflow scan` (also run automatically by `init`) writes `docs/sdlc/project-profile.md` — a mechanical inventory (stacks, structure, signals). Then follow `docs/sdlc/reverse-engineering.md` with the SDLC agent to turn those facts into understanding.
- **As-is architecture**: write context + container diagrams from the code as it is today.
- **As-is ADRs**: record decisions already baked in (DB, frameworks, integration style), even retroactively, so future changes have context.
- **Tech-debt register**: list known debt, risks, and the "to-be" target; prioritize.
- **BA reverse-engineering**: derive FRs / process flows from current system behavior, not only from new ideas.

## 3. Establish a baseline
- Measure current test coverage, lint / static-analysis debt, dependency CVEs, and key performance numbers.
- Record them as the starting line; set realistic ratchet targets per quarter.

## 4. Map existing work into the structure
- Create one epic folder per existing feature area under `po/{epic-slug}/` (lightweight, retroactive).
- Detect your stack and generate matching rules: `npx sdlc-workflow tech detect` then `npx sdlc-workflow tech <stack...>`.

## 5. Roll out incrementally
- Enforce the gates in CI for changed files first; widen scope as debt shrinks.
- Use the **strangler-fig** approach when replacing legacy modules — wrap, divert traffic gradually, retire the old path.
- **Add characterization tests** before refactoring untested legacy: capture current behavior, then change safely.
- Don't rewrite working code just to apply a design pattern (see "avoid over-engineering").

## 6. Safe re-runs
- `npx sdlc-workflow init` is **non-destructive**: existing files are skipped (shown in the summary).
- Re-run with `npx sdlc-workflow init --force` to overwrite managed docs with newer template versions — then review the git diff.
