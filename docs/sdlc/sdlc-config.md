# SDLC Config — phase toggles & profiles

**Purpose:** the persistent on/off switch for pipeline phases. The agent reads this file when the pipeline is triggered and at **every phase handoff**. A phase marked ⛔ is skipped — the agent prints a visible banner and moves to the next enabled phase. **Nothing is ever skipped silently.**

> ⏭ Role: `[ROLE]` <title> — skipped (disabled in sdlc-config)

## Active profile

> **Profile:** `full`

When the profile changes, the agent rewrites the **Current phase state** table below from the matching profile column, then applies any per-phase overrides you ask for afterwards.

## Quick toggles (say this to the agent)

| Action | What to say |
|--------|-------------|
| Switch profile | **"profile standard"** (also: `full`, `hotfix`, `docs-only`) |
| Disable one phase | **"disable phase qe"** (works for: po, ba, design, architect, tech-ba, dev, test/qe, security, deploy, guideline, maintain) |
| Enable one phase | **"enable phase guideline"** |
| One epic only | **"skip qe for this epic"** — current epic only; this file is not edited |
| Show current state | **"show sdlc config"** — the agent prints the active profile + phase table |

The agent updates this file (profile line and/or table), then confirms the new state in one line.

## Profiles

| Phase | `full` (default) | `standard` | `hotfix` | `docs-only` |
|-------|:---:|:---:|:---:|:---:|
| po | ✅ | ✅ | ⛔ | ✅ |
| ba | ✅ | ✅ | ⛔ | ✅ |
| design | ✅ (auto: app/web only) | ⛔ | ⛔ | ⛔ |
| architect | ✅ | ✅ | ⛔ | ✅ |
| tech-ba | ✅ | ✅ | ⛔ | ✅ |
| dev | ✅ | ✅ | ✅ | ⛔ |
| test (QE) | ✅ | ✅ | ✅ (Smoke depth) | ⛔ |
| security | ✅ | ✅ | ✅ | ⛔ |
| deploy | ✅ | ✅ | ✅ | ⛔ |
| guideline | ✅ | ⛔ | ⛔ | ⛔ |
| maintain | ✅ | ⛔ | ⛔ | ⛔ |

- `full` — the complete 11-phase pipeline.
- `standard` — day-to-day feature work: skips Design, Guideline, Maintenance.
- `hotfix` — straight to code: Dev → QE (Smoke depth) → Security → Deploy.
- `docs-only` — analysis without implementation: PO → BA → Architect → Technical BA.

## Current phase state (source of truth)

This table is what the agent actually reads at each handoff. It starts as a copy of the active profile column; per-phase toggles edit rows here (**an override in this table wins over the profile**).

| Phase | Enabled | Note |
|-------|:---:|------|
| po | ✅ | |
| ba | ✅ | |
| design | ✅ | auto-skips for non-UI projects |
| architect | ✅ | |
| tech-ba | ✅ | |
| dev | ✅ | |
| test (QE) | ✅ | |
| security | ✅ | |
| deploy | ✅ | |
| guideline | ✅ | |
| maintain | ✅ | |

## Rules

- **Security guard (non-negotiable):** the `security` phase cannot be disabled while the epic touches **money/payments, auth, or PII** — the agent must refuse the toggle, keep it ✅, and suggest lowering the QE depth tier instead if cost is the concern. Outside those domains it may be disabled like any other phase.
- **Never skip silently:** every disabled phase still prints the ⏭ banner at its slot so the pipeline stays auditable.
- **Missing inputs:** when a later phase needs a disabled phase's output (e.g. Dev needs the Technical BA API spec), the running phase states which input is missing, works from the best available source (existing docs, code, the user's message) — or asks the user if it cannot proceed safely.
- **Scope:** this file is per-project and safe to commit. `init` never overwrites it once it exists (only `init --force` does — review the git diff after).
