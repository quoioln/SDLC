# Reverse-Engineering an Existing Codebase

**For the SDLC agent (Claude / Cursor / Codex).** Use this when onboarding the workflow onto a codebase that already exists. The CLI writes a **mechanical** scan to `docs/sdlc/project-profile.md` (facts only — stacks, structure, signals). Your job is the **understanding**: read that profile **and the code**, then produce the as-is picture below. Cite files; never guess.

## Inputs
- `docs/sdlc/project-profile.md` — auto-generated facts (run `npx sdlc-workflow scan` to refresh).
- The source code itself: entry points, modules, config, tests, migrations.

## Produce (as-is — current reality, not the target)
1. **Feature / capability summary** → `docs/sdlc/ba/business/_as-is/feature-summary.md`
   - What the system does, grouped by capability; primary users/consumers; key flows.
2. **As-is architecture (C4)** → `docs/sdlc/architecture/_as-is/`
   - Context (system + external actors/integrations), container (services/datastores/queues), notable components; how services communicate (HTTP/gRPC/message bus) and where state lives.
3. **Module / package map** → `architecture/_as-is/module-map.md`
   - Top modules, responsibilities, inter-module dependencies, layering (or lack of).
4. **Integration map** → `architecture/_as-is/integrations.md`
   - External systems, APIs consumed/exposed, message topics/queues, third-party SDKs.
5. **Retroactive ADRs** → `architecture/adr/` (use adr.template.md)
   - One per significant decision already baked in (DB, framework, auth, messaging): Context = why it likely exists, Decision = current state, Consequences = observed trade-offs.
6. **Tech-debt register** → `architecture/_as-is/tech-debt.md`
   - Known debt, risks, missing tests, security/observability gaps; severity + suggested to-be target.
7. **Quality baseline** → `docs/sdlc/qe/_as-is/baseline.md`
   - Current coverage, lint/SAST debt, dependency CVEs, key perf numbers — the starting line for ratcheting (dev/quality-rules.md §14).

## Method
- Start from entry points and config; follow imports to map modules.
- Read tests to learn intended behavior; read migrations/schema to learn the data model.
- Prefer evidence (file paths, code) over assumption; mark unknowns explicitly.
- Keep **as-is** separate from **to-be** — document current reality, don't fix while documenting.

## Then
- Hand the as-is docs to PO/BA to frame new epics, and to the Architect for the to-be ADRs + migration path (strangler-fig). Apply the full quality bar to new/changed code per `docs/sdlc/dev/quality-rules.md` (§14 brownfield).
