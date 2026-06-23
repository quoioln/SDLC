# SDLC Workflow — Reference

## Execution model

**Parallel by default, sequential only when required.**

| Decision | Rule |
|----------|------|
| Sequential phases | Phase 0 → 1 → 2 → 3 → 4 → 5 Technical BA |
| Track A (after Technical BA) | [DEV] + [QE] run SIMULTANEOUSLY |
| Dev parallel roles | [FE] + [BE] + [MOBILE] + [EMB] + [DATA] + [PLATFORM] all simultaneously |
| Track B (after Dev complete) | [QE] + [SEC] + [PERF] run SIMULTANEOUSLY — merge gate after all report |

## Folder structure: one per epic/feature

- **PO**: `docs/sdlc/po/{epic-slug}/` — one folder per epic. Files: epic-brief.md, user-stories.md. Do not put all epics in one file.
- **Business BA**: `docs/sdlc/ba/business/{epic-slug}/` — same slug as PO. Files: functional-requirements.md, process-flows.md. Do not merge all epics into one file.
- **Design (if app/web)**: `docs/sdlc/design/{epic-slug}/` — same slug as PO/BA. Design specs (Markdown) + optional HTML wireframes; PO+BA review until approved.
- **QE**: `docs/sdlc/qe/{epic-slug}/` — same slug as PO/BA. Files: test-plan.md, test-cases.md, automation. Do not put all epics in one file.

## Quality standards

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

## Remediation loop

Every issue must have an Issue ID (e.g. SEC-001). Track: 🔁 CYCLE 1 → 🔁 CYCLE 2 → 🔁 CYCLE 3. Max 3 cycles per issue.
