# Sub-Agents

Every role in the SDLC runs as a **sub-agent**. Each phase is assigned to a corresponding sub-agent.
**Role badges are mandatory** — every artifact must identify which `[ROLE]` produced it.

## 🚦 Parallel vs Sequential Orchestrator Rules

**The cardinal rule:** If two workstreams do NOT depend on each other's output, they MUST run in parallel.

### Sequential (mandatory — dependency chain)

Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 Technical BA
Each phase's output is the next phase's input. Skipping or reordering causes rework.

### Parallel: Track A — Implementation + Test Plan

> **Spawn immediately when Technical BA completes.** Do NOT wait for one to finish before starting the other.

Technical BA complete → [DEV] implementation + [QE] test plan run SIMULTANEOUSLY.
All implementation roles ([FE]/[BE]/[MOBILE]/[EMB]/[DATA]/[PLATFORM]) also run in parallel.

### Parallel: Track B — Quality Gates

> **Spawn immediately when [DEV] is complete.** All three agents audit the same artifact simultaneously.

[DEV] complete → [QE] + [SEC] + [PERF] run SIMULTANEOUSLY → merge gate → Deploy.

### Remediation Loop

Every issue must have an Issue ID (e.g. SEC-001). Track: 🔁 CYCLE 1 → 🔁 CYCLE 2 → 🔁 CYCLE 3. Max 3 cycles per issue.

## Role Sub-Agent Table

| Role | Input | Output | Parallel? |
|------|-------|--------|-----------|
| [PO] | User request | docs/sdlc/po/{epic-slug}/ | Sequential |
| [BA] | PO output | docs/sdlc/ba/business/{epic-slug}/ | Sequential |
| [UX] | BA output | docs/sdlc/design/{epic-slug}/ | Sequential |
| [SA] | BA + UX | docs/sdlc/architecture/ | Sequential |
| [BA] Tech | SA output | docs/sdlc/ba/technical/ | Sequential |
| [DEV] | Tech BA | docs/sdlc/dev/{role}/ | ⚡ Parallel with [QE] |
| [QE] | Tech BA | docs/sdlc/qe/{epic-slug}/ | ⚡ Parallel with [DEV] |
| [QE]+[SEC]+[PERF] | Dev output | TER, SAR, PAR | ⚡ Fully parallel |
| [OPS] | All Phase 8 passed | docs/sdlc/deploy/ | Sequential |

## Quality Standards

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

## Response Format (Mandatory)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 APEX — [PHASE NAME] | [ROLE BADGE]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 INPUT RECEIVED
[What was received from previous phase or business]

🔄 PROCESSING
[Current role's analysis/work]

📤 OUTPUT ARTIFACT: [Artifact Name]
[Full artifact content]

🚦 GATE STATUS
[ ] Pending review     [✅] Approved     [🔴] Blocked — reason: ...

⏭️ NEXT ACTION
[What triggers next, which role activates, what they need]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

See docs/sdlc/SDLC-WORKFLOW.md for full phase details.
