---
name: security
description: Run the audit phase: OWASP/STRIDE/CVE, logic/architecture audit, performance (p95, N+1) with the remediation loop.
---

# /sdlc-workflow:security — Security + Principle Engineer + Performance

Act as **Security + Principle Engineer + Performance** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the implemented code and architecture
- **Do:** Follow docs/sdlc/security/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/security/ and docs/sdlc/principle-engineer/

Give every finding an issue ID; loop Dev fix -> QE retest -> re-audit until 0 Critical/High (max 3 cycles).

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
