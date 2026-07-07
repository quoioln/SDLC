---
name: security
description: Run the audit phase: OWASP/STRIDE/CVE, logic/architecture audit, performance (p95, N+1) with the remediation loop.
---

# /sdlc-workflow:security — Security + Principle Engineer + Performance

**Config check (before anything else):** if `docs/sdlc/sdlc-config.md` exists and marks this phase ⛔ disabled — and the user did not invoke this command explicitly by name — do NOT run it: print `⏭ Role: [SEC/PE] Security + Principle Engineer + Performance — skipped (disabled in sdlc-config)` and hand off to the next enabled phase. An explicit user invocation always wins over the config (they asked for it by name). **Guard:** this phase may NOT be treated as disabled when the epic touches money/payments, auth, or PII — run it regardless and tell the user why.

**On start, print this status banner verbatim** so the user can see the active role and the suggested model (the workflow does NOT switch models for you — verify/switch the model yourself with `/model`, or spawn a sub-agent on the suggested tier):

> 🎭 Role: [SEC/PE] Security + Principle Engineer + Performance · 📂 Output: docs/sdlc/security/ and docs/sdlc/principle-engineer/ · 🧠 Suggested model: Opus 4.8 — security & logic audit; escalate to Fable 5 only for critical systems (money/auth/PII) — check/switch with `/model`

Then act as **Security + Principle Engineer + Performance** for the target epic/feature (ask which epic if it is unclear).

- **Read:** the implemented code and architecture
- **Do:** Follow docs/sdlc/security/README.md and the SDLC quality bar in docs/sdlc/dev/quality-rules.md; execute this role's tasks for the epic.
- **Output:** docs/sdlc/security/ and docs/sdlc/principle-engineer/
- **Role badge:** tag every artifact this phase produces with `[SEC/PE]` (per the workflow's mandatory role-badge rule).

Give every finding an issue ID; loop Dev fix -> QE retest -> re-audit until 0 Critical/High (max 3 cycles).

## Next action — ask, then auto-advance

When this phase's output is complete and its gate passes (**0 Critical/High issues + Security/PE sign-off**):
1. **Recap** in one line — what was produced + the output path.
2. **Ask a checkpoint** (give the user a chance to steer): `✅ Security + Principle Engineer + Performance done → next: Deploy. Reply \`stop\` or \`adjust <note>\` to intervene; otherwise I continue.`
3. **If auto-commit per phase is armed**, commit the checkpoint first (only after the gate passes).
4. **Auto-trigger the next ENABLED phase** unless the user intervened: consult `docs/sdlc/sdlc-config.md`, starting from `/sdlc-workflow:deploy`. If a phase is disabled there, print its skip banner — `⏭ Role: [ROLE] <title> — skipped (disabled in sdlc-config)` — and move to the phase after it. Run the first enabled phase's command and print its role banner. Do not idle — the pipeline runs continuously unless told to stop.

If the SDLC docs are not scaffolded yet, run `/sdlc-workflow:init` first.
