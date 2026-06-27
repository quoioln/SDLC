---
name: security
description: Run the audit phase: OWASP/STRIDE/CVE, logic/architecture audit, performance (p95, N+1) with the remediation loop.
---

# /sdlc-workflow:security — Security + Principle Engineer + Performance

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [SEC/PE] Security + Principle Engineer + Performance · 📂 Output: docs/sdlc/security/ and docs/sdlc/principle-engineer/ · 🧠 Suggested model: Opus — security & logic audit — check/switch with `/model`

Then act as **Security + Principle Engineer + Performance** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the implemented code and architecture
- **Do:** Follow docs/sdlc/security/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/security/ and docs/sdlc/principle-engineer/
- **Role badge:** tag every artifact this phase produces with `[SEC/PE]` (per the workflow's mandatory role-badge rule).

Give every finding an issue ID; loop Dev fix -> QE retest -> re-audit until 0 Critical/High (max 3 cycles).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
