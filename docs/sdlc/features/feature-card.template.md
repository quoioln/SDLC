# Feature: [Name]

- **Slug**: {epic-slug} · **Branch/PR**: epic/{epic-slug} · PR #—
- **Status**: 🔄 in progress <!-- ✅ shipped · ⏸ paused · ❌ dropped -->
- **Complexity**: [Trivial|Small|Medium|Epic] · **QE depth**: [Smoke|Standard|Full] · **Mode**: [dynamic|static] · **Profile**: [full|standard|hotfix|docs-only]
- **Started**: YYYY-MM-DD · **Shipped**: —
- **One-liner**: [what this delivers, for whom]

## Pipeline trace (each phase updates its own row at handoff)

| Phase | Status | Artifacts | Note |
|-------|:---:|-----------|------|
| PO | | [epic-brief](../po/{epic-slug}/epic-brief.md) | |
| Business BA | | [functional-requirement](../ba/business/{epic-slug}/functional-requirement.md) | |
| Design | | [design-spec](../design/{epic-slug}/design-spec.md) | |
| Architect | | [ADR](../architecture/{epic-slug}/adr.md) | |
| Technical BA | | [api-spec](../ba/technical/{epic-slug}/api-spec.md) · [team-breakdown](../ba/technical/{epic-slug}/team-breakdown.md) | |
| Dev | | implementation notes · PR | |
| QE | | [test-plan](../qe/{epic-slug}/test-plan.md) · [test-cases](../qe/{epic-slug}/test-cases.md) · [evidence](../qe/{epic-slug}/evidence/) · [uat](../qe/{epic-slug}/uat-results.md) | open bugs: — |
| Security + PE | | [security](../security/) · [principle-engineer](../principle-engineer/) | Critical/High: — |
| Deploy | | [deploy](../deploy/) | env: — |
| Guideline | | [guideline](../guideline/{epic-slug}.md) | |
| Maintenance | | [maintenance](../maintenance/) | |

> Status legend: ✅ done · 🔄 in progress · ⏭ skipped (state the reason) · ❌ blocked. Adjust artifact paths to where this project actually wrote them.

## Key decisions
<!-- one line each, link the doc that holds the rationale: "JWT over sessions — ADR-002" -->
- …

## Open items / risks
- …

## Sign-offs
- QE (0 open bugs): — · Security/PE (0 Critical/High): — · UAT: —
