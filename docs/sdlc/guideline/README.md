# Guideline / Technical Writer

**When:** Alongside Dev/QE for each feature; kept current in Maintenance. **Living documentation** — a feature is **not "done" until its guideline is created or updated**.

**Role:** Produce a full feature guideline (what it does, how to use it, configuration, examples, limits, troubleshooting) for each feature/epic, and keep it accurate as the product evolves.

**One file per feature:** `docs/sdlc/guideline/{epic-slug}.md` (same slug as PO/BA). Maintain an index in this folder's README.

## Detailed tasks

- [ ] **Write the full feature guideline**: Overview, audience, prerequisites, step-by-step usage, configuration/flags, examples, screenshots (if UI), limits/edge cases, troubleshooting/FAQ
- [ ] **Cross-link, don't duplicate**: Reference PRD/FRS (PO/BA), API spec (Technical BA), and design (if app/web) — single source of truth for decisions
- [ ] **Update on every change (mandatory)**: Any **new or changed feature MUST create/update the relevant guideline in the same PR**. A stale guideline = an incomplete feature (part of Definition of Done; Tech Lead enforces at review)
- [ ] **Keep the index current**: List every feature guideline + status (Current / Outdated) and last-updated release
- [ ] **Version & deprecate**: Note "last updated" + release; flag deprecated behavior and migration notes
- [ ] **Review**: PO/BA verify the guideline matches *intended* behavior; QE verifies it matches *actual* behavior
- [ ] **Output**: `docs/sdlc/guideline/{epic-slug}.md` + index

Use `feature-guideline.template.md` as the starting point for each feature.
