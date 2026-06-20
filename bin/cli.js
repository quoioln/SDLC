#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { homedir } from "node:os";
import { mkdir, writeFile, readFile, readdir, cp } from "node:fs/promises";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");
const TEMPLATES_DIR = join(PKG_ROOT, "templates");

// Non-destructive write tracking (brownfield-safe init).
let FORCE = false;
const writeSummary = { created: [], skipped: [], overwritten: [] };

async function writeFileSafe(absPath, content, label) {
  const exists = existsSync(absPath);
  if (exists && !FORCE) {
    writeSummary.skipped.push(label);
    return false;
  }
  await writeFile(absPath, content, "utf8");
  (exists ? writeSummary.overwritten : writeSummary.created).push(label);
  return true;
}

function printWriteSummary() {
  console.log(
    "\nFiles: " +
      writeSummary.created.length + " created, " +
      writeSummary.overwritten.length + " overwritten, " +
      writeSummary.skipped.length + " skipped."
  );
  if (writeSummary.skipped.length && !FORCE) {
    console.log("Skipped (already exist) — re-run with --force to overwrite:");
    for (const s of writeSummary.skipped) console.log("  ~ " + s);
  }
}

function preFlightCheck(cwd) {
  if (!existsSync(join(cwd, ".git"))) {
    console.log("Note: not a git repo. Consider `git init` first so you can review/revert changes.\n");
  } else {
    console.log("Tip: review `git status` after scaffolding before committing.\n");
  }
}

async function detectStacks(cwd) {
  const found = new Set();

  const pkgPath = join(cwd, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(await readFile(pkgPath, "utf8"));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      const names = Object.keys(deps);
      const has = (n) => names.includes(n);
      found.add("nodejs");
      if (has("typescript") || existsSync(join(cwd, "tsconfig.json"))) found.add("typescript");
      if (has("@nestjs/core")) found.add("nestjs");
      if (has("next")) found.add("nextjs");
      if (has("@angular/core")) found.add("angular");
      if (has("typeorm")) found.add("typeorm");
      if (has("kafkajs") || has("kafka-node")) found.add("kafka");
      if (has("amqplib") || has("amqp-connection-manager")) found.add("rabbitmq");
    } catch {
      // ignore malformed package.json
    }
  }

  let java = null;
  for (const f of ["pom.xml", "build.gradle", "build.gradle.kts"]) {
    const p = join(cwd, f);
    if (existsSync(p)) {
      java = await readFile(p, "utf8").catch(() => "");
      break;
    }
  }
  if (java != null) {
    found.add("java");
    if (/spring-boot/.test(java)) found.add("spring-boot");
    if (/spring-boot-starter-data-jpa|hibernate/.test(java)) found.add("spring-jpa");
    if (/quarkus/.test(java)) found.add("quarkus");
    if (/spring-kafka|kafka-clients/.test(java)) found.add("kafka");
    if (/spring-(boot-starter-)?amqp|rabbitmq/i.test(java)) found.add("rabbitmq");
  }

  for (const f of ["docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"]) {
    const p = join(cwd, f);
    if (existsSync(p)) {
      const c = await readFile(p, "utf8").catch(() => "");
      if (/kafka|confluentinc/i.test(c)) found.add("kafka");
      if (/rabbitmq/i.test(c)) found.add("rabbitmq");
    }
  }

  return [...found].filter((k) => TECH_STACKS[k]).sort();
}

async function main() {
  const cwd = process.cwd();
  const args = process.argv.slice(2);
  const command = args[0] || "init";

  if (command === "version" || command === "--version" || command === "-v") {
    const pkg = JSON.parse(await readFile(join(PKG_ROOT, "package.json"), "utf8"));
    console.log(pkg.version);
    process.exit(0);
  }

  if (command === "init") {
    FORCE = args.includes("--force") || args.includes("-f");
    console.log("Scaffolding SDLC workflow (project)" + (FORCE ? " [--force]" : "") + "...\n");
    try {
      preFlightCheck(cwd);
      await scaffold(cwd);
      await installClaudeSkill(cwd);
      await installAgentsMd(cwd);
      printWriteSummary();

      const detected = await detectStacks(cwd);
      if (detected.length) {
        console.log("\nDetected stack: " + detected.join(", "));
        console.log("→ Generate matching rules: npx sdlc-workflow tech " + detected.join(" "));
      } else {
        console.log("\nAdd stack rules: npx sdlc-workflow tech <stack...>   (or `tech detect`)");
      }

      console.log("\nExisting project? See docs/sdlc/ADOPTION.md for the brownfield adoption guide.");
      console.log("Run `npx sdlc-workflow install` to set up global skills (Cursor, Codex).");
      console.log("\nDone.");
    } catch (err) {
      console.error("Error:", err.message);
      process.exit(1);
    }
    return;
  }

  if (command === "tech") {
    try {
      await techCommand(cwd, args.slice(1));
    } catch (err) {
      console.error("Error:", err.message);
      process.exit(1);
    }
    return;
  }

  if (command === "install") {
    console.log("Installing SDLC workflow (global)...\n");
    try {
      const home = homedir();
      await installCursorSkill(home);
      await installCodexSkill(home);
      console.log("\nDone.");
      console.log("  - Cursor: ~/.cursor/skills/sdlc-workflow/");
      console.log("  - Codex: ~/.codex/AGENTS.md, ~/.agents/skills/sdlc-workflow/");
    } catch (err) {
      console.error("Error:", err.message);
      process.exit(1);
    }
    return;
  }

  console.log("Usage: npx sdlc-workflow <command>");
  console.log("");
  console.log("Commands:");
  console.log("  init     Scaffold SDLC docs and templates into current project");
  console.log("  tech     Generate stack-specific rules (java, spring-boot, kafka, …)");
  console.log("  install  Install global skills (Cursor, Codex) to home directory");
  console.log("  version  Print current version");
  console.log("");
  console.log("Examples:");
  console.log("  npx sdlc-workflow init                     # project-level setup");
  console.log("  npx sdlc-workflow tech java spring-boot kafka  # add stack rules");
  console.log("  npx sdlc-workflow tech list                # list available stacks");
  console.log("  npx sdlc-workflow install                  # global setup (~/.cursor, ~/.codex, ~/.agents)");
  console.log("  npx sdlc-workflow version");
  process.exit(1);
}

async function installCursorSkill(home) {
  const skillDir = join(home, ".cursor", "skills", "sdlc-workflow");
  await mkdir(skillDir, { recursive: true });
  await writeFile(join(skillDir, "SKILL.md"), CURSOR_SKILL_MD, "utf8");
  await writeFile(join(skillDir, "reference.md"), CURSOR_REFERENCE_MD, "utf8");
  console.log("  + ~/.cursor/skills/sdlc-workflow/ (skill installed)");
}

async function installClaudeSkill(cwd) {
  const claudeDir = join(cwd, ".claude");
  await mkdir(claudeDir, { recursive: true });
  const claudeMdPath = join(claudeDir, "CLAUDE.md");
  const sdlcContent = CLAUDE_SDLC_CONTENT;

  if (existsSync(claudeMdPath)) {
    const existing = await readFile(claudeMdPath, "utf8");
    if (existing.includes("## SDLC Workflow")) {
      console.log("  + .claude/CLAUDE.md (SDLC section already present)");
      return;
    }
    await writeFile(
      claudeMdPath,
      existing.trimEnd() + "\n\n" + sdlcContent,
      "utf8"
    );
  } else {
    await writeFile(claudeMdPath, sdlcContent, "utf8");
  }
  console.log("  + .claude/CLAUDE.md (Claude instructions)");
}

async function installAgentsMd(cwd) {
  const agentsPath = join(cwd, "AGENTS.md");
  const content = AGENTS_MD_CONTENT;
  if (existsSync(agentsPath)) {
    const existing = await readFile(agentsPath, "utf8");
    if (existing.includes("## SDLC Workflow")) {
      console.log("  + AGENTS.md (SDLC section already present)");
      return;
    }
    await writeFile(agentsPath, existing.trimEnd() + "\n\n" + content, "utf8");
  } else {
    await writeFile(agentsPath, content, "utf8");
  }
  console.log("  + AGENTS.md (Antigravity, Codex project)");

  const codexSkillDir = join(cwd, ".agents", "skills", "sdlc-workflow");
  await mkdir(codexSkillDir, { recursive: true });
  await writeFileSafe(join(codexSkillDir, "SKILL.md"), CURSOR_SKILL_MD, ".agents/skills/sdlc-workflow/SKILL.md");
  await writeFileSafe(join(codexSkillDir, "reference.md"), CURSOR_REFERENCE_MD, ".agents/skills/sdlc-workflow/reference.md");
}

async function installCodexSkill(home) {
  const codexDir = join(home, ".codex");
  const codexAgentsPath = join(codexDir, "AGENTS.md");
  const sdlcContent = CLAUDE_SDLC_CONTENT;
  await mkdir(codexDir, { recursive: true });
  if (existsSync(codexAgentsPath)) {
    const existing = await readFile(codexAgentsPath, "utf8");
    if (existing.includes("## SDLC Workflow")) {
      console.log("  + ~/.codex/AGENTS.md (SDLC section already present)");
    } else {
      await writeFile(
        codexAgentsPath,
        existing.trimEnd() + "\n\n" + sdlcContent,
        "utf8"
      );
      console.log("  + ~/.codex/AGENTS.md (Codex global)");
    }
  } else {
    await writeFile(codexAgentsPath, sdlcContent, "utf8");
    console.log("  + ~/.codex/AGENTS.md (Codex global)");
  }

  const agentsSkillDir = join(home, ".agents", "skills", "sdlc-workflow");
  await mkdir(agentsSkillDir, { recursive: true });
  await writeFile(join(agentsSkillDir, "SKILL.md"), CURSOR_SKILL_MD, "utf8");
  await writeFile(join(agentsSkillDir, "reference.md"), CURSOR_REFERENCE_MD, "utf8");
  console.log("  + ~/.agents/skills/sdlc-workflow/ (Codex global skill)");
}

async function scaffold(cwd) {
  const templates = join(TEMPLATES_DIR, "project");
  if (!existsSync(templates)) {
    await generateFromInline(cwd);
  } else {
    await cp(templates, join(cwd, "docs", "sdlc"), { recursive: true });
  }

  const cursorRulesDir = join(cwd, ".cursor", "rules");
  await mkdir(cursorRulesDir, { recursive: true });
  await writeFileSafe(
    join(cursorRulesDir, "sdlc-workflow.mdc"),
    CURSOR_RULE_CONTENT,
    ".cursor/rules/sdlc-workflow.mdc"
  );
}

async function generateFromInline(cwd) {
  const base = join(cwd, "docs", "sdlc");
  const dirs = [
    base,
    join(base, "po"),
    join(base, "ba", "business"),
    join(base, "ba", "technical"),
    join(base, "architecture"),
    join(base, "qe"),
    join(base, "qe", "qe-lead"),
    join(base, "qe", "senior-qe"),
    join(base, "design"),
    join(base, "dev", "tech-lead"),
    join(base, "dev", "senior-developer"),
    join(base, "dev", "frontend"),
    join(base, "dev", "backend"),
    join(base, "dev", "mobile"),
    join(base, "dev", "embedded"),
    join(base, "dev", "data-ml"),
    join(base, "dev", "platform"),
    join(base, "security"),
    join(base, "principle-engineer"),
    join(base, "agents"),
    join(base, "deploy"),
    join(base, "deploy", "k8s"),
    join(base, "maintenance"),
  ];

  for (const d of dirs) {
    await mkdir(d, { recursive: true });
  }

  const files = [
    ["SDLC-WORKFLOW.md", SDLC_WORKFLOW_MD],
    ["ORCHESTRATION.md", ORCHESTRATION_MD],
    ["reference.md", REFERENCE_MD],
    ["skill-mapping.md", SKILL_MAPPING_MD],
    ["ADOPTION.md", ADOPTION_MD],
    ["po/epic-brief.template.md", PO_EPIC_TEMPLATE],
    ["po/README.md", PO_README],
    ["ba/business/functional-requirement.template.md", BA_FR_TEMPLATE],
    ["ba/business/README.md", BA_BUSINESS_README],
    ["ba/technical/api-spec.template.md", TECH_API_TEMPLATE],
    ["ba/technical/team-breakdown.template.md", TECH_TEAM_TEMPLATE],
    ["ba/technical/README.md", BA_TECH_README],
    ["architecture/adr.template.md", ARCH_ADR_TEMPLATE],
    ["architecture/README.md", ARCH_README],
    ["qe/test-case.template.md", QE_TC_TEMPLATE],
    ["qe/README.md", QE_README],
    ["qe/qe-lead/README.md", QE_LEAD_README],
    ["qe/senior-qe/README.md", QE_SENIOR_README],
    ["design/README.md", DESIGN_README],
    ["design/design-spec.template.md", DESIGN_SPEC_TEMPLATE],
    ["dev/tech-lead/README.md", DEV_TECH_LEAD_README],
    ["dev/senior-developer/README.md", DEV_SENIOR_README],
    ["dev/implementation-roles.template.md", DEV_IMPLEMENTATION_ROLES_TEMPLATE],
    ["dev/quality-rules.md", DEV_QUALITY_RULES],
    ["dev/frontend/README.md", DEV_FRONTEND_README],
    ["dev/backend/README.md", DEV_BACKEND_README],
    ["dev/mobile/README.md", DEV_MOBILE_README],
    ["dev/embedded/README.md", DEV_EMBEDDED_README],
    ["dev/data-ml/README.md", DEV_DATA_ML_README],
    ["dev/platform/README.md", DEV_PLATFORM_README],
    ["security/README.md", SECURITY_README],
    ["principle-engineer/README.md", PRINCIPLE_ENGINEER_README],
    ["agents/README.md", AGENTS_README],
    ["deploy/README.md", DEPLOY_README],
    ["deploy/docker-compose.yml.template", DOCKER_COMPOSE_TEMPLATE],
    ["deploy/k8s/deployment.yaml.template", K8S_DEPLOYMENT_TEMPLATE],
    ["deploy/k8s/service.yaml.template", K8S_SERVICE_TEMPLATE],
    ["deploy/k8s/ingress.yaml.template", K8S_INGRESS_TEMPLATE],
    ["maintenance/README.md", MAINTENANCE_README],
  ];

  for (const [rel, content] of files) {
    await writeFileSafe(join(base, rel), content, "docs/sdlc/" + rel);
  }
}

const CURSOR_RULE_CONTENT = `---
description: SDLC multi-role workflow; on idea/request trigger pipeline through deployment (sub-agent per phase)
alwaysApply: false
globs: docs/sdlc/**/*, **/*.md
---

# SDLC Workflow

**On idea/feature request:** Trigger full pipeline continuously through deployment. Do not stop after one phase unless the user asks.

**Memory requirement:** Before executing any new action, recall relevant memories (project context, user preferences, past decisions) to ensure continuity and avoid repeating mistakes.

**Parallel by default, sequential only when required:** If two workstreams do NOT depend on each other's output, they MUST run in parallel.

---

## Sequential (dependency chain)

Phase 0 → Phase 1 [PO] → Phase 2 [BA] → Phase 3 [UX] → Phase 4 [SA] → Phase 5 Technical [BA]

---

## ⚡ Parallel Track A (Technical BA complete → spawn immediately)

> [DEV] AND [QE] run simultaneously. Do NOT wait for one to finish before starting the other.

│────
Technical BA complete
    ├──→ [DEV] implementation (all roles: [FE]/[BE]/[MOBILE]/[EMB]/[DATA]/[PLATFORM])
    └──→ [QE] test plan + test cases
         Both complete → Phase 8
│────

---

## ⚡ Parallel Track B ([DEV] complete → spawn immediately)

> [QE] + [SEC] + [PERF] audit the same artifact simultaneously.

│────
[DEV] complete
    ├──→ [QE] test execution
    ├──→ [SEC] security audit          ← ALL IN PARALLEL
    └──→ [PERF] performance audit
              ↓ Merge gate (sequential)
         ✅ QUALITY GATE PASSED → [OPS] Deploy
│────

---

## Phase sequence

1. **Phase 1** [PO] — PRD, user stories, feasibility → docs/sdlc/po/{epic-slug}/
2. **Phase 2** [BA] — FRS, NFR, Gherkin, process flows → docs/sdlc/ba/business/{epic-slug}/
3. **Phase 3** [UX] (if app/web) — Design specs + wireframes; [PO]+[BA] review until approved → docs/sdlc/design/{epic-slug}/
4. **Phase 4** [SA] — ADRs, C4 diagrams, security by design → docs/sdlc/architecture/
5. **Phase 5** Technical [BA] — API specs (OpenAPI 3.x), team breakdown → docs/sdlc/ba/technical/
6. **⚡ Phase 5a** [QE] + **⚡ Phase 5b** [DEV] — parallel after Technical BA
7. **⚡ Phase 8** [QE] + [SEC] + [PERF] — parallel audits after [DEV] complete → merge gate
8. **Phase 9** [OPS] — Docker Compose + K8s + IaC → docs/sdlc/deploy/
9. **Phase 10** — SHIPPED ✅
10. **Phase 11** Maintenance — monitoring, bug fixes, patches

---

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

---

## Remediation loop

Every issue must have an Issue ID (e.g. SEC-001). Track: 🔁 CYCLE 1 → 🔁 CYCLE 2 → 🔁 CYCLE 3. Max 3 cycles per issue.

**Each role runs as a sub-agent.** Design before Architect (UX drives tech). See docs/sdlc/SDLC-WORKFLOW.md and docs/sdlc/agents/
`;

const CURSOR_SKILL_MD = `---
name: sdlc-workflow
description: Multi-role SDLC workflow from user requirements through PO, Business BA, Architect, Technical BA, Dev teams, and QE. Use when user sends an idea, feature request, or requirement — trigger full pipeline through deployment. Use when user mentions SDLC, requirements, PO, BA, Architect, technical spec, phased development, or handoff between roles.
---

# SDLC Workflow (Multi-Role)

**Parallel by default, sequential only when required.** Each role runs as a sub-agent. Design before Architect (UX drives tech). After docs phase → Dev runs immediately.

## Trigger and orchestration (mandatory)

**When the user sends an idea, feature request, or new requirement:**
1. **Recall memory** — Before executing any new action, recall relevant memories (project context, user preferences, past decisions) to ensure continuity and avoid repeating mistakes.
2. **Trigger the pipeline** and run it **continuously through deployment**.
3. **One role per phase** for sequential phases. **Spawn parallel workstreams** when dependencies are independent.

**Parallel tracks:**
- Track A (after Technical BA): [DEV] implementation + [QE] test plan — run SIMULTANEOUSLY
- Track B (after Dev complete): [QE] + [SEC] + [PERF] audits — run SIMULTANEOUSLY

**Note:** In Cursor there is a single agent per conversation. Adopt one role per sequential phase; spawn parallel tasks for Track A and Track B.

**Sub-agent specs**: docs/sdlc/agents/

## Flow Overview

Sequential: Phase 0 → Phase 1 [PO] → Phase 2 [BA] → Phase 3 [UX] → Phase 4 [SA] → Phase 5 Technical [BA]
Parallel Track A: Technical BA complete → [DEV] + [QE] simultaneously
Parallel Track B: Dev complete → [QE] + [SEC] + [PERF] simultaneously → merge gate → [OPS] Deploy

**Determine current phase** before acting. If user sent an idea, assume Phase 0 and start from Phase 1.

---

## Phase 0: User Request / Discovery

**Trigger**: New feature request, bug report, or requirement from stakeholder.
**Output**: Initial request logged, ready for PO.

## Phase 1: PO (Product Owner)

**Role**: Prioritize, clarify business value, create product docs.
**Deliverables**: Epic/Feature brief, user stories, acceptance criteria, priority, dependencies.
**Output**: \`docs/sdlc/po/{epic-slug}/\` — **one folder per epic** (e.g. \`po/job-scheduler-event-bus/epic-brief.md\`). Do not put all epics in one file. **Handoff to Business BA.**

## Phase 2: Business BA (Business Analyst)

**Role**: Break down from business perspective.
**Deliverables**: Business process flows, functional requirements, use cases, glossary.
**Output**: \`docs/sdlc/ba/business/{epic-slug}/\` — **one folder per epic** (same slug as PO). Do not merge all epics into one file. **Handoff to Design (if app/web) or Architect.**

## Phase 3: Design (optional — app/web only)

**When:** Project has UI (web, mobile app). Skip for API-only, library, CLI, data/ML, platform without UI.

**Role**: Create UI/UX design specs (Markdown) and optional HTML wireframes from idea + PO + Business BA docs. Design **before** Architect so UX drives technical decisions. **Anti AI pattern**: designs must NOT look AI-generated.
**Output**: \`docs/sdlc/design/{epic-slug}/\` — design-spec.md + optional wireframes/.

**Review loop:**
1. **PO review**: Design aligns with epic brief, user stories, acceptance criteria?
2. **Business BA review**: Design matches functional requirements, process flows?
3. **If not approved**: Capture feedback → redesign → repeat until PO and BA approve.
4. **If approved** → **Handoff to Architect.**

## Phase 4: Architect

**Role**: Design system architecture and technology choices.
**Deliverables**: System context, container diagram, ADRs, tech stack, cross-cutting concerns.
**Engineering principles**: SOLID, DRY, KISS, SoC, High Availability, CQRS, Zero Trust, EDA, Statelessness, Disposability, Backing Services, Config, Codebase, Database Sharding/Partitioning, Logging & Tracing, Monitoring & Alerting.
**Input**: Business BA + Design (if app/web) — design informs architecture.
**Output**: \`docs/sdlc/architecture/\` — **Handoff to Technical BA.**

## Phase 5: Technical BA

**Role**: Translate business + architecture + design into implementable specs.
**Deliverables**: API specs, DB schema, team breakdown, acceptance criteria per ticket.
**Input**: Architect + Design (if app/web) — design informs API/screen contracts.
**Output**: \`docs/sdlc/ba/technical/\` — **Handoff to QE + Dev.**

## Phase 5a: QE (Docs phase)

**Role**: Create test plan, test cases before Dev implements.
**Deliverables**: Test plan, test cases.
**Output**: \`docs/sdlc/qe/{epic-slug}/\` — **one folder per epic** (same slug as PO/BA).
**⚡ Parallel with Phase 5b**: [DEV] starts implementation immediately after Technical BA — do NOT wait for QE docs to finish.

## Phase 5b: Dev Teams

**Trigger**: After Technical BA is complete (not after QE docs). **Dev runs implementation immediately.**
**⚡ Parallel with Phase 5a**: [DEV] AND [QE] test plan run simultaneously.

**Roles** (vary by project — use only what applies). All implementation roles are **Senior (10+ yrs)**:
- **Tech Lead (15+ yrs)** — **highest model** (e.g. Opus): Planning, logic analysis, architecture decisions, tech stack, code review & merge.
- **Senior Frontend (10+ yrs)**: Web UI.
- **Senior Backend (10+ yrs)**: API, services, DB.
- **Senior Mobile (10+ yrs)**: iOS/Android/cross-platform.
- **Senior Embedded (10+ yrs)**: Firmware, IoT.
- **Senior Data/ML (10+ yrs)**: ETL, models, analytics.
- **Senior Platform (10+ yrs)**: CI/CD, infra.

**⚡ All implementation roles run in parallel** — frontend does NOT wait for backend; they coordinate via API contract from Technical BA.

**Requirements**: Unit Test coverage **100%** (TDD/BDD); Clean Code, SOLID, DRY, KISS, SoC, POLS.
**Output**: Code + unit tests. **Handoff to Phase 8.**

## Phase 8: [QE] + [SEC] + [PERF] Quality Gates (⚡ fully parallel audits)

**Trigger**: After Dev completes implementation (code + 100% coverage).
**⚡ All three audits run SIMULTANEOUSLY on the same artifact.** Do NOT wait for one to finish before starting another.

- **[QE]**: Execute all test suites, enforce 100% coverage gate, report bugs (QE-001...).
- **[SEC]**: OWASP Top 10, STRIDE threat model, CVE scan, compliance (GDPR/PCI/SOC2). Report: SEC-001...
- **[PERF]**: Latency benchmarks (p95<500ms), N+1 detection, k6 load test. Report: PERF-001...

**Merge gate**: Collect all findings from all three. If Critical/High → 🔁 REMEDIATION LOOP → [DEV] fix → [QE] retest → re-audit. Max 3 cycles per issue.
**Quality Gate PASSED** → [OPS] Deploy.

## Phase 9: Deploy

**Trigger**: After Security + Principle Engineer sign-off.
**Role**: Deploy with **Docker Compose** (local/staging) and **Kubernetes** (production).
**Output**: \`docs/sdlc/deploy/\` — docker-compose.yml, k8s manifests.

## Quick Phase Checklist

| Phase | Role | Key Output |
|-------|------|------------|
| 0 | Discovery | Raw request |
| 1 | PO | PRD, user stories, feasibility assessment |
| 2 | Business BA | FRS, NFR, process flows |
| 3 | Design (if app/web) | Design specs + wireframes; PO+BA review until approved |
| 4 | Architect | ADRs, system diagrams, security by design |
| 5 | Technical BA | API specs, tech breakdown |
| 6 | QE (docs) | Test plan, test cases |
| 7 | Dev | Code, unit tests (100%), security shift-left |
| 8 | QE (testing + UAT) | Automation, UAT; **bug-fix loop** (QE finds bugs → Dev fix → QE retest) until 0 open bugs |
| 9 | Security + PE | Audit; **fix → retest → re-audit loop** (Dev fix → QE retest → re-audit) until 0 issues; sign-off → Deploy |
| 10 | Deploy | Docker Compose + K8s |
| 11 | Maintenance | Monitoring, bug fixes, patches, dependency updates |

**Sub-agents**: Each role = one sub-agent. Design before Architect (UX drives tech). See docs/sdlc/agents/
See reference.md for templates.
`;

const CURSOR_REFERENCE_MD = `# SDLC Workflow — Reference

## Execution model

**Parallel by default, sequential only when required.**

| Decision | Rule |
|----------|------|
| Sequential phases | Phase 0 → 1 → 2 → 3 → 4 → 5 Technical BA |
| Track A (after Technical BA) | [DEV] + [QE] run SIMULTANEOUSLY — do NOT wait |
| Dev parallel roles | [FE] + [BE] + [MOBILE] + [EMB] + [DATA] + [PLATFORM] all run simultaneously |
| Track B (after Dev complete) | [QE] + [SEC] + [PERF] run SIMULTANEOUSLY — merge gate only after all report |

## Folder structure: one per epic/feature

- **PO**: \`docs/sdlc/po/{epic-slug}/\` — one folder per epic. Files: epic-brief.md, user-stories.md. Do not put all epics in one file.
- **Business BA**: \`docs/sdlc/ba/business/{epic-slug}/\` — same slug as PO. Files: functional-requirements.md, process-flows.md. Do not merge all epics into one file.
- **Design (if app/web)**: \`docs/sdlc/design/{epic-slug}/\` — same slug as PO/BA. Design specs (Markdown) + optional HTML wireframes; PO+BA review until approved.
- **QE**: \`docs/sdlc/qe/{epic-slug}/\` — same slug as PO/BA. Files: test-plan.md, test-cases.md, automation. Do not put all epics in one file.

## PO: Epic Brief Template
# Epic: [Name]
## Problem / Success Metrics / User Stories / Acceptance Criteria / Priority

## Business BA: Functional Requirement
FR-001: [Title] — Description, Trigger, Process Flow, Output, Constraints

## Architect: ADR Template
# ADR-001: [Title] — Status, Context, Decision, Consequences

## Technical BA: API Spec
POST /api/v1/[resource] — Purpose, Request, Response, Contract

## Design (if app/web)
Design specs (Markdown) + optional HTML wireframes from idea + PO + BA (before Architect; UX drives tech). Output: docs/sdlc/design/{epic-slug}/. PO + BA review until approved; loop if not aligned. Handoff to Architect.

## QE: Test Case
TC-001: [Scenario] — Precondition, Steps, Expected, Links to AC

## QE Team (one folder per epic: qe/{epic-slug}/)
- QE Lead (15+ yrs automation) — **highest model** (e.g. Opus): test strategy, framework, automation architecture, review → docs/sdlc/qe/{epic-slug}/
- Senior QE (10+ yrs) — **cost-efficient model** (e.g. Haiku): write automation tests per QE Lead's strategy → docs/sdlc/qe/{epic-slug}/

## Dev Team
- Tech Lead (15+ yrs) — **highest model** (e.g. Opus): planning, logic, architecture decisions, code review → docs/sdlc/dev/tech-lead/
- Senior Dev (10+ yrs) — **cost-efficient model** (e.g. Haiku): execute code from Tech Lead specs, Unit Test 100% → docs/sdlc/dev/senior-developer/
- By project (all Senior 10+ yrs, cost-efficient model): Senior Frontend, Backend, Mobile, Embedded, Data/ML, Platform → docs/sdlc/dev/{role}/

## Security + Principle Engineer + Performance (after implementation)
- Security team [SEC]: OWASP Top 10, STRIDE, CVE, compliance → docs/sdlc/security/
- Principle Engineer [PE]: logic, architecture → docs/sdlc/principle-engineer/
- Performance Auditor [PERF]: p95<500ms, N+1, k6 → docs/sdlc/security/
- **Remediation loop**: Every issue has ID (SEC-001, PERF-003...). 🔁 CYCLE 1 → 2 → 3. Max 3 per issue.

## Deploy
After all Phase 8 issues resolved → Docker Compose + K8s + IaC. See docs/sdlc/deploy/

## Maintenance
After Deploy → ongoing: monitoring, bug fixes, patches, dependency updates, performance tuning. Significant new features → loop back to PO for new epic. See docs/sdlc/maintenance/
`;

const AGENTS_MD_CONTENT = `## SDLC Workflow

**Trigger:** When the user sends an **idea**, **feature request**, or **requirement**, run the full pipeline continuously through deployment. Do not stop after one phase unless the user asks.

**Memory requirement:** Before executing any new action, recall relevant memories (project context, user preferences, past decisions) to ensure continuity and avoid repeating mistakes.

**Parallel by default, sequential only when required.**

1. **Phase 1** [PO] — PRD, user stories, feasibility → docs/sdlc/po/{epic-slug}/
2. **Phase 2** [BA] — FRS, NFR, Gherkin, process flows → docs/sdlc/ba/business/{epic-slug}/
3. **Phase 3** [UX] (if app/web) — Design specs + wireframes; [PO]+[BA] review until approved → docs/sdlc/design/{epic-slug}/
4. **Phase 4** [SA] — ADRs, C4 diagrams, security by design → docs/sdlc/architecture/
5. **Phase 5** Technical [BA] — API specs (OpenAPI 3.x), team breakdown → docs/sdlc/ba/technical/
6. **⚡ Phase 5a** [QE] + **⚡ Phase 5b** [DEV] — parallel after Technical BA
7. **⚡ Phase 8** [QE] + [SEC] + [PERF] — parallel audits after [DEV] complete → merge gate
8. **Phase 9** [OPS] — Docker Compose + K8s + IaC → docs/sdlc/deploy/
9. **Phase 10** — SHIPPED ✅
10. **Phase 11** Maintenance — monitoring, bug fixes, patches

Design before Architect (UX drives tech). After Technical BA, [DEV] runs immediately — parallel with [QE] docs. See docs/sdlc/agents/
`;

const CLAUDE_SDLC_CONTENT = `## SDLC Workflow

**Trigger on idea:** When the user sends an idea, feature request, or requirement, run the pipeline continuously: Phase 1 (PO) → 2 → … → Deploy → Maintenance. One role per phase (single agent = switch role each phase). Do not stop after one phase unless the user asks.

**Memory requirement:** Before executing any new action, recall relevant memories (project context, user preferences, past decisions) to ensure continuity and avoid repeating mistakes.

**Parallel by default, sequential only when required:** If two workstreams do NOT depend on each other's output, they MUST run in parallel.

1. **PO** — PRD, user stories, feasibility assessment → docs/sdlc/po/{epic-slug}/ (one folder per epic)
2. **Business BA** — FRS, NFR, Gherkin, process flows → docs/sdlc/ba/business/{epic-slug}/ (one folder per epic)
3. **Design (if app/web)** — Design specs + wireframes (**Anti AI**: no AI-looking designs) → docs/sdlc/design/{epic-slug}/; **PO + BA review** until approved
4. **Architect** — ADRs, C4 diagrams, security by design, engineering principles (SOLID, DRY, KISS, CQRS, Zero Trust, EDA, HA) → docs/sdlc/architecture/
5. **Technical BA** — API specs (OpenAPI 3.x), team breakdown → docs/sdlc/ba/technical/
6. **⚡ Phase 5a [QE]** + **⚡ Phase 5b [DEV]** — run in PARALLEL after Technical BA:
   - [QE]: test plan + test cases → docs/sdlc/qe/{epic-slug}/ (100% coverage target)
   - [DEV]: code + unit tests (100%) → docs/sdlc/dev/{role}/ — start immediately, do NOT wait for QE docs
7. **⚡ Phase 8** — [QE] + [SEC] + [PERF] audit SIMULTANEOUSLY after Dev complete:
   - Bug-fix loop → [DEV] fix → [QE] retest until 0 bugs
   - 🔁 Remediation loop: issue ID per finding, max 3 cycles, until 0 Critical/High issues
8. **Deploy** — Docker Compose + K8s + IaC → docs/sdlc/deploy/ (after all Phase 8 issues resolved)
9. **Maintenance** — Monitoring, bug fixes, patches, dependency updates → docs/sdlc/maintenance/

Design before Architect (UX drives tech). After Technical BA, Dev runs immediately — parallel with QE docs. See docs/sdlc/agents/
`;

const SDLC_WORKFLOW_MD = `# SDLC Workflow (Multi-Role)

Use this doc with **Claude** (copy to Custom Instructions / Projects) or **@ mention** in chat.
For Cursor, see .cursor/rules/sdlc-workflow.mdc

## Trigger and orchestration

- **When the user sends an idea, feature request, or requirement:** Start the pipeline and run it **continuously through deployment** (Phase 1 → 2 → … → 7). Do not handle everything in one main-agent response.
- **Memory requirement:** Before executing any new action, recall relevant memories (project context, user preferences, past decisions) to ensure continuity and avoid repeating mistakes.
- **One role per phase:** Execute each phase as that role only; write artifacts to the right folder; then continue to the next phase. In Cursor there is one agent — it simulates the pipeline by adopting one role per phase in sequence.
- **Do not stop** after PO or any single phase unless the user explicitly asks to stop. Run through to Deploy.

## Flow

\`\`\`
User Request → PO → Business BA → Design (if app/web) → Architect → Technical BA → QE (docs) → Dev → QE (testing + UAT) → [bug-fix loop until 0 bugs] → Security + PE audit → [fix → retest → re-audit loop until 0 issues] → Deploy → Maintenance
\`\`\`

## Phase Checklist

| Phase | Role | Key Output |
|-------|------|------------|
| 0 | Discovery | Raw request |
| 1 | PO | PRD, user stories, feasibility assessment |
| 2 | Business BA | FRS, NFR, process flows |
| 3 | Design (if app/web) | Design specs + wireframes; PO+BA review until approved |
| 4 | Architect | ADRs, system diagrams, security by design |
| 5 | Technical BA | API specs, tech breakdown |
| 6 | QE (docs) | Test plan, test cases |
| 7 | Dev | Code, unit tests (100%), security shift-left |
| 8 | QE (testing + UAT) | Automation, UAT; **bug-fix loop** (QE finds bugs → Dev fix → QE retest) until 0 open bugs |
| 9 | Security + PE | Audit; **fix → retest → re-audit loop** (Dev fix → QE retest → re-audit) until 0 issues; sign-off → Deploy |
| 10 | Deploy | Docker Compose + K8s |
| 11 | Maintenance | Monitoring, bug fixes, patches, dependency updates |

**Sub-agents**: Each role runs as a sub-agent. See docs/sdlc/agents/

## Phase Details

### Phase 1: PO
- Feasibility study (technical, operational, economic), epic brief, user stories, acceptance criteria
- Output: \`docs/sdlc/po/{epic-slug}/\` — **one folder per epic**; do not put all epics in one file

### Phase 2: Business BA
- Functional requirements (FR), **non-functional requirements (NFR)** (performance, scalability, availability, security, usability), process flows, use cases
- Output: \`docs/sdlc/ba/business/{epic-slug}/\` — **one folder per epic** (same slug as PO); do not merge into one file

### Phase 3: Design (optional — app/web only)
- Create design specs (Markdown) + optional HTML wireframes based on idea + PO + BA docs. **Design before Architect so UX drives tech.** **Anti AI pattern**: designs must NOT look AI-generated — prioritize unique, human-feeling aesthetics.
- Output: \`docs/sdlc/design/{epic-slug}/\` — design-spec.md + optional wireframes/
- **PO + Business BA review**: Both check design vs epic/FRS; if not aligned → feedback → redesign loop until approved
- When approved → handoff to Architect

### Phase 4: Architect
- System context, container diagram, ADRs, tech stack, **security by design** (threat model, auth architecture, encryption, secrets mgmt). **Engineering principles**: SOLID, DRY, KISS, SoC, High Availability, CQRS, Zero Trust, EDA, Statelessness, Backing Services, Config, Logging & Tracing, Monitoring & Alerting. Input: Business BA (FR + NFR) + Design (if app/web)
- Output: \`docs/sdlc/architecture/\`

### Phase 5: Technical BA
- API specs, DB schema, team breakdown. Input: Architect + Design (if app/web)
- Output: \`docs/sdlc/ba/technical/\`

### Phase 5a: QE (Docs)
- Test plan, test cases
- Output: \`docs/sdlc/qe/{epic-slug}/\` — **one folder per epic**; do not put all epics in one file
- **After docs phase → Dev team runs implementation immediately** (no extra gate)

### Phase 5b: Dev Teams
- **Tech Lead (15+ yrs)**: Tech stack, review & merge, **security review (Shift Left)**: OWASP check, dependency audit, SAST in CI. Output: \`docs/sdlc/dev/tech-lead/\`
- **Implementation roles** (all Senior 10+ yrs; use only what applies): Senior Dev, Senior Frontend, Senior Backend, Senior Mobile, Senior Embedded, Senior Data/ML, Senior Platform → \`docs/sdlc/dev/{role}/\`. See \`implementation-roles.template.md\`.
- **Requirement**: Unit Test coverage **100%** (TDD/BDD); Clean Code, SOLID, DRY, KISS, SoC, POLS; security practices (input validation, no hardcoded secrets)
- **Then**: QE starts testing phase

### Phase 6: QE (Testing — automation + UAT) → bug-fix loop
- **QE Lead (15+ yrs automation)**: Test strategy, framework choice, automation architecture; review test code. Output per epic: \`docs/sdlc/qe/{epic-slug}/\`
- **Senior QE (10+ yrs)**: Write automation tests per QE Lead's strategy. Output per epic: \`docs/sdlc/qe/{epic-slug}/\`
- **UAT (User Acceptance Testing)**: Verify implementation against original user stories and acceptance criteria from PO; confirm business requirements are met from end-user perspective. Output: \`qe/{epic-slug}/uat-results.md\`
- **Bug-fix loop**: If QE finds bugs or test failures → **Dev fixes** → **QE retests**. **Repeat until all tests pass and UAT approved (0 open bugs).** Only then → handoff to Security + PE
- **Handoff to Security + Principle Engineer** (only after 0 open bugs)

### Phase 7: Security + Principle Engineer (audit → fix → retest loop)
- **Security team**: Audit security risk (OWASP, auth, secrets, infra). Output: \`docs/sdlc/security/\`
- **Principle Engineer**: Audit logic, architecture alignment, correctness. Output: \`docs/sdlc/principle-engineer/\`
- **Fix → retest → re-audit loop**: If issues/vulnerabilities found → **Dev fixes** → **QE retests** (verify fix, no regression) → **Security + PE re-audit**. **Repeat until 0 issues/vulnerabilities remain.** Sign-off → **Handoff to Deploy**

### Phase 8: Deploy
- After Security + Principle Engineer sign-off → deploy with **Docker Compose** (local/staging) and **Kubernetes** (production)
- Output: \`docs/sdlc/deploy/\` — docker-compose.yml, k8s/

### Phase 9: Maintenance
- **Monitoring**: Health checks, error tracking, alerting, SLA dashboards
- **Bug fixes**: Triage, fix, test, deploy per severity
- **Dependency updates**: Regular security patches, library upgrades
- **Performance tuning**: Monitor vs NFR targets; optimize bottlenecks
- **Feature iteration**: Small enhancements from feedback; significant scope → new PO epic
- Output: \`docs/sdlc/maintenance/\` — runbooks, incident logs

See [reference.md](./reference.md) for templates.
`;

const ORCHESTRATION_MD = `# Pipeline Orchestration

## Trigger

When the user sends an **idea**, **feature request**, or **requirement**:
1. **Trigger the full pipeline** and run continuously through deployment.
2. **One role per phase** for sequential phases. **Spawn parallel workstreams** when dependencies are independent.
3. **Run through to Maintenance.** Do not stop after PO, BA, or Dev unless the user explicitly says to stop.

## 🚦 The Orchestrator's Most Important Rule

> **Parallel by default. Sequential only when required.**

Before running any two workstreams, ask: "Does workstream B depend on workstream A's output?"
- **Yes** → Run sequentially (A first, then B)
- **No** → **Run in parallel immediately**

## Execution Map

Sequential: Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 Technical BA
Parallel Track A: Technical BA complete → [DEV] + [QE] simultaneously
Parallel Track B: Dev complete → [QE] + [SEC] + [PERF] simultaneously → merge gate → [OPS] Deploy

## Checklist per run

### Sequential phases
- [ ] Phase 0 Discovery: raw request captured
- [ ] Phase 1 [PO]: artifacts in \`docs/sdlc/po/{epic-slug}/\`
- [ ] Phase 2 [BA]: \`docs/sdlc/ba/business/{epic-slug}/\`
- [ ] Phase 3 [UX] (if app/web): \`docs/sdlc/design/{epic-slug}/\`; [PO]+[BA] review until approved
- [ ] Phase 4 [SA]: \`docs/sdlc/architecture/\`
- [ ] Phase 5 Technical [BA]: \`docs/sdlc/ba/technical/\`

### ⚡ Parallel Track A (spawn immediately after Phase 5)
- [ ] Spawn [DEV] implementation (all roles: [FE]/[BE]/[MOBILE]/[EMB]/[DATA]/[PLATFORM])
- [ ] Spawn [QE] test plan + test cases in parallel
- [ ] Do NOT wait for one to finish before starting the other

### ⚡ Parallel Track B (spawn when [DEV] is complete)
- [ ] Spawn [QE] test execution
- [ ] Spawn [SEC] security audit
- [ ] Spawn [PERF] performance audit
- [ ] All three run simultaneously — merge gate only after all complete

### Post-merge
- [ ] Phase 9 [OPS]: \`docs/sdlc/deploy/\`
- [ ] Phase 10: Project Completion Package → SHIPPED ✅
- [ ] Phase 11 Maintenance
`;

const REFERENCE_MD = `# SDLC Workflow — Reference

## Execution model

**Parallel by default, sequential only when required.**

| Decision | Rule |
|----------|------|
| Sequential phases | Phase 0 → 1 → 2 → 3 → 4 → 5 Technical BA |
| Track A (after Technical BA) | [DEV] + [QE] run SIMULTANEOUSLY |
| Dev parallel roles | [FE] + [BE] + [MOBILE] + [EMB] + [DATA] + [PLATFORM] all simultaneously |
| Track B (after Dev complete) | [QE] + [SEC] + [PERF] run SIMULTANEOUSLY — merge gate after all report |

## Folder structure: one per epic/feature

- **PO**: \`docs/sdlc/po/{epic-slug}/\` — one folder per epic. Files: epic-brief.md, user-stories.md. Do not put all epics in one file.
- **Business BA**: \`docs/sdlc/ba/business/{epic-slug}/\` — same slug as PO. Files: functional-requirements.md, process-flows.md. Do not merge all epics into one file.
- **Design (if app/web)**: \`docs/sdlc/design/{epic-slug}/\` — same slug as PO/BA. Design specs (Markdown) + optional HTML wireframes; PO+BA review until approved.
- **QE**: \`docs/sdlc/qe/{epic-slug}/\` — same slug as PO/BA. Files: test-plan.md, test-cases.md, automation. Do not put all epics in one file.

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
`;

const ADOPTION_MD = `# SDLC Adoption Guide (existing / brownfield projects)

Use this when adding the SDLC workflow to a codebase that already exists and may be in production. The default pipeline (PO → … → Deploy) assumes greenfield; this guide adapts it so you don't have to stop the world.

## 1. Don't boil the ocean
- Apply the full quality bar to **new and changed code first**; improve legacy incrementally (see "Brownfield" in dev/quality-rules.md).
- Gate coverage on **changed lines (diff coverage)**, not the whole repo.
- Ratchet: coverage / lint / security may only go **up** — never regress.

## 2. Capture the current state (reverse-engineering)
- **As-is architecture**: write context + container diagrams from the code as it is today.
- **As-is ADRs**: record decisions already baked in (DB, frameworks, integration style), even retroactively, so future changes have context.
- **Tech-debt register**: list known debt, risks, and the "to-be" target; prioritize.
- **BA reverse-engineering**: derive FRs / process flows from current system behavior, not only from new ideas.

## 3. Establish a baseline
- Measure current test coverage, lint / static-analysis debt, dependency CVEs, and key performance numbers.
- Record them as the starting line; set realistic ratchet targets per quarter.

## 4. Map existing work into the structure
- Create one epic folder per existing feature area under \`po/{epic-slug}/\` (lightweight, retroactive).
- Detect your stack and generate matching rules: \`npx sdlc-workflow tech detect\` then \`npx sdlc-workflow tech <stack...>\`.

## 5. Roll out incrementally
- Enforce the gates in CI for changed files first; widen scope as debt shrinks.
- Use the **strangler-fig** approach when replacing legacy modules — wrap, divert traffic gradually, retire the old path.
- **Add characterization tests** before refactoring untested legacy: capture current behavior, then change safely.
- Don't rewrite working code just to apply a design pattern (see "avoid over-engineering").

## 6. Safe re-runs
- \`npx sdlc-workflow init\` is **non-destructive**: existing files are skipped (shown in the summary).
- Re-run with \`npx sdlc-workflow init --force\` to overwrite managed docs with newer template versions — then review the git diff.
`;

const SKILL_MAPPING_MD = `# SDLC Skill & Agent Mapping

Đề xuất **skill** (gọi qua \`/\`) và **sub-agent** (gọi qua Agent tool) cho từng vai trò trong pipeline. Tier model theo quy ước workflow: **lead = model mạnh nhất (Opus)**, **execution = model tiết kiệm (Haiku)**.

> **Lưu ý:** Tên skill/agent dưới đây theo bộ skill của Claude Code; tùy môi trường (Cursor/Codex/Antigravity) tên gọi có thể khác — ánh xạ theo *mục đích* của từng cột.

---

## Phase 1 — PO (Product Owner) · Opus
| Mục đích | Skill / Agent |
|---|---|
| Tinh chỉnh ý tưởng thô | \`/idea-refine\` |
| Đào yêu cầu khi đề bài mơ hồ ("build me X") | \`/interview-me\` |
| Viết spec/PRD có cấu trúc | \`/spec\` (spec-driven-development) |

## Phase 2 — Business BA
| Mục đích | Skill / Agent |
|---|---|
| FRS, NFR, use case dạng spec | \`/spec\` (spec-driven-development) |
| Ghi lại quyết định nghiệp vụ | \`/documentation-and-adrs\` |

## Phase 3 — Design / UX (chỉ app/web)
| Mục đích | Skill / Agent |
|---|---|
| Design "Anti-AI", không trông như AI tạo ⭐ | \`/frontend-design\` |
| Layout/component chất lượng production | \`/frontend-ui-engineering\` |
| Wireframe / sync sang Figma | \`figma:figma-generate-design\`, \`figma:figma-use\` |

## Phase 4 — Architect · Opus
| Mục đích | Skill / Agent |
|---|---|
| ADR (rationale + trade-off) ⭐ | \`/documentation-and-adrs\` |
| Ranh giới module, hợp đồng FE/BE | \`/api-and-interface-design\` |
| Security by design (Zero Trust, threat model) | \`/security-and-hardening\` |
| C4 / sequence / ERD diagram | \`figma:figma-generate-diagram\` |
| Quyết định bám tài liệu chính thống | \`/source-driven-development\` |

## Phase 5 — Technical BA
| Mục đích | Skill / Agent |
|---|---|
| API spec (OpenAPI 3.x), type contract ⭐ | \`/api-and-interface-design\` |
| Team breakdown, chia task | \`/planning-and-task-breakdown\`, agent \`Plan\` |

## Phase 5a / 6 — QE (docs: test plan, test case)
| Mục đích | Skill / Agent |
|---|---|
| Thiết kế test suite, chiến lược ⭐ | agent \`agent-skills:test-engineer\` |
| TDD/BDD plan | \`/test\` (test-driven-development) |

> QE Lead = Opus, Senior QE = Haiku.

## Phase 5b / 7 — Dev (Tech Lead + Senior Dev)
| Vai trò | Skill / Agent |
|---|---|
| **Tech Lead** (Opus): plan, review | agent \`Plan\`, \`/plan\`, \`/code-review-and-quality\` |
| **Senior Dev** (Haiku): code từng bước | \`/build\`, \`/incremental-implementation\` |
| TDD bắt buộc (coverage 100%) | \`/test-driven-development\` |
| Bám docs framework | \`/source-driven-development\` |
| FE | \`/frontend-ui-engineering\` |
| BE / API | \`/api-and-interface-design\` |
| Logic rủi ro cao, irreversible | \`/doubt-driven-development\` |
| Debug khi build/test fail | \`/debugging-and-error-recovery\` |
| Commit/branch sạch | \`/git-workflow-and-versioning\` |
| Dọn code rườm rà | \`/simplify\` (code-simplification) |

## Phase 8 — QE testing + UAT (bug-fix loop)
| Mục đích | Skill / Agent |
|---|---|
| Viết/chạy test, đánh giá coverage | agent \`agent-skills:test-engineer\`, \`/test\` |
| UAT trong trình duyệt thật | \`/browser-testing-with-devtools\` |
| Xác minh fix chạy thật | \`/verify\` |
| Soát lỗi diff | \`/code-review\` |
| Truy nguyên bug | \`/debugging-and-error-recovery\` |

## Phase 9 — Security + Principle Engineer + Performance (audit loop)
| Vai trò | Skill / Agent |
|---|---|
| **[SEC]** OWASP/STRIDE/CVE ⭐ | agent \`agent-skills:security-auditor\`, \`/security-review\`, \`/security-and-hardening\` |
| **[PE]** audit logic/architecture | agent \`agent-skills:code-reviewer\`, \`/review\`, \`/doubt-driven-development\` |
| **[PERF]** p95<500ms, N+1 | agent \`agent-skills:web-performance-auditor\`, \`/webperf\`, \`/performance-optimization\` |

## Phase 10 — Deploy (OPS)
| Mục đích | Skill / Agent |
|---|---|
| CI/CD pipeline, quality gate ⭐ | \`/ci-cd-and-automation\` |
| Pre-launch checklist, rollout/rollback | \`/ship\` (shipping-and-launch) |
| Instrument trước khi lên prod | \`/observability-and-instrumentation\` |

## Phase 11 — Maintenance
| Mục đích | Skill / Agent |
|---|---|
| Monitoring, logging, alerting | \`/observability-and-instrumentation\` |
| Triage & fix bug | \`/debugging-and-error-recovery\` |
| Gỡ/migrate hệ thống cũ | \`/deprecation-and-migration\` |
| Tuning hiệu năng | \`/performance-optimization\` |
| Job định kỳ (check deploy, monitor) | \`/schedule\`, \`/loop\` |

---

## Xuyên suốt (mọi phase)
| Mục đích | Skill / Agent |
|---|---|
| Set up context khi bắt đầu session / đổi task | \`/context-engineering\` |
| Meta-skill: biết skill nào áp dụng | \`/using-agent-skills\` |
| Feature có dùng LLM / Claude API | \`/claude-api\` |
| Mọi thay đổi code (commit/branch/merge) | \`/git-workflow-and-versioning\` |
`;

const AGENTS_README = `# Sub-Agents

Every role in the SDLC runs as a **sub-agent**. Each phase is assigned to a corresponding sub-agent.
**Role badges are mandatory** — every artifact must identify which \`[ROLE]\` produced it.

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

\`\`\`
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
\`\`\`

See docs/sdlc/SDLC-WORKFLOW.md for full phase details.
`;

const SECURITY_README = `# Security Team | [SEC]

**When:** After [QE] quality gate passed (0 open bugs + 100% coverage). Runs **parallel** with [PERF] audit. **Before** Deploy.

**Quality Standard:** Zero tolerance for Critical severity. High must have documented mitigation or accepted-risk doc.

## Detailed Tasks

- [ ] **OWASP Top 10 checklist:** A01 Broken Access Control → A10 SSRF
- [ ] **STRIDE threat model:** Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege
- [ ] **SAST findings:** Static analysis (Semgrep, SonarQube, Bandit)
- [ ] **CVE scan:** npm audit / pip audit / trivy
- [ ] **Auth/Authorization review:** JWT, sessions, RBAC
- [ ] **Secrets management:** No hardcoded credentials; verify Vault/SSM
- [ ] **Compliance notes:** GDPR / PCI-DSS / SOC2 / HIPAA (activate per project type)

## Issue Tracking

Issue ID (SEC-001...), Severity (Critical/High/Medium/Low), Status, Owner, Mitigation.

## Merge Gate

Critical → 🔴 BLOCK. High without mitigation → 🔴 BLOCK. High with accepted-risk → ⚠️ CONDITIONAL.

See docs/sdlc/SDLC-WORKFLOW.md for full audit details.
`;

const PRINCIPLE_ENGINEER_README = `# Principle Engineer

**When:** After [QE] quality gate passed. Runs **parallel** with [SEC] + [PERF]. **Before** Deploy.

## Detailed Tasks

- [ ] **Logic audit:** Business logic correctness, edge cases, error handling, data flow
- [ ] **Architecture audit:** Alignment with ADRs, patterns, scalability, maintainability
- [ ] **Report:** Findings, recommendations → docs/sdlc/principle-engineer/

## Issue Tracking

Issue ID (PE-001...), Severity, Status, Owner.

## Merge Gate

Critical/High logic issues → 🔴 BLOCK → 🔁 CYCLE 1 → [DEV] fix → [QE] retest → re-audit. Max 3 cycles.
`;

const DEPLOY_README = `# [OPS] — Infrastructure & Deployment

**When:** After [SEC] + [PERF] + [PE] sign-off (all Critical/High = 0). **Before** Maintenance.

**Quality Standard:** All secrets in Vault/SSM. No hardcoded credentials. IaC must pass tfsec/checkov.

## Deployment

\`\`\`bash
docker compose up -d            # local / staging
kubectl apply -f k8s/          # production
\`\`\`

## Deliverables

- **Docker Compose + Kubernetes:** docker-compose.yml, k8s/deployment.yaml, service.yaml, ingress.yaml
- **Terraform (optional):** VPC, ECS/EKS, RDS, IAM, SSL, remote state backend
- **Ansible (optional):** Inventory, roles, playbooks, zero-downtime rolling deploy
- **CI/CD:** lint → test (100% coverage gate) → build → scan → deploy → smoke-test
- **IaC security:** tfsec / checkov — block if HIGH severity

## Gate

tfsec/checkov HIGH → 🔴 BLOCK. Secrets in source → 🔴 BLOCK. [SEC]/[PERF] unresolved → 🔴 BLOCK.

See docs/sdlc/SDLC-WORKFLOW.md for full details.
`;

const DOCKER_COMPOSE_TEMPLATE = `# Copy to docker-compose.yml and adjust image, env, ports.
# Single service (API, CLI, app) or add more services (api, worker, frontend, db) as needed.
services:
  app:
    image: your-registry/your-app:latest
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
  # Optional: add worker, frontend, db, etc.
  # worker:
  #   image: your-registry/worker:latest
  #   depends_on: [app]
`;

const K8S_DEPLOYMENT_TEMPLATE = `# deployment.yaml — adjust name, image, replicas. Duplicate for multi-service (api, worker, etc.).
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
        - name: app
          image: your-registry/your-app:latest
          ports:
            - containerPort: 8080
`;

const K8S_SERVICE_TEMPLATE = `# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  selector:
    app: app
  ports:
    - port: 80
      targetPort: 8080
  type: ClusterIP
`;

const K8S_INGRESS_TEMPLATE = `# ingress.yaml - optional, adjust host
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app
spec:
  ingressClassName: nginx
  rules:
    - host: app.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: app
                port:
                  number: 80
`;

const PO_EPIC_TEMPLATE = `# Epic: [Name]

## Project type
[Web app | Mobile app | API/backend only | Library/SDK | CLI/tool | Data/ML | Platform/infra | Mixed — pick one or describe]

## Problem
[What problem are we solving?]

## Success Metrics
- [Metric 1]
- [Metric 2]

## User Stories (or equivalent)
- **Web/Mobile**: As [persona], I want [action] so that [benefit].
- **API/Library**: As [consumer/integrator], I need [capability] so that [outcome].
- **CLI/Internal**: As [operator/developer], I run [command/workflow] to [result].
1. ...
2. ...

## Acceptance Criteria (High-level)
- [ ] Criterion 1
- [ ] Criterion 2

## Priority
Must have / Should have / Could have

## Feasibility Assessment
- **Technical**: [Can we build this with current tech/team? Any unknowns?]
- **Operational**: [Can we deploy, run, and support this? Any ops constraints?]
- **Economic**: [ROI justification; cost vs. value]
- **Go / No-go**: [Recommended | Needs further investigation | Not recommended]

## Dependencies & Risks
- ...
`;

const PO_README = `# PO (Product Owner)

**One folder per epic/feature.** Do not put all epics in one file.

- Create a folder per epic: \`docs/sdlc/po/{epic-slug}/\`
- Folder name = epic/feature slug (e.g. \`job-scheduler-event-bus\`, \`user-auth\`).
- Inside that folder: \`epic-brief.md\`, \`user-stories.md\`, \`prd.md\` (or similar) for that epic only.

## Detailed tasks

- [ ] **Feasibility study**: Assess technical feasibility (can we build it?), operational feasibility (can we run it?), economic feasibility (is the ROI worth it?). Document go/no-go recommendation
- [ ] **Clarify vision**: Capture business problem, goals, success metrics
- [ ] **Define scope**: Boundaries, in/out of scope, MVP vs later
- [ ] **Write epic brief**: Problem, success metrics, high-level approach, project type
- [ ] **Break into user stories**: As a [role], I want [goal] so that [benefit]; acceptance criteria per story
- [ ] **Prioritize**: Must / Should / Could have; order by value and risk
- [ ] **Identify dependencies**: External teams, systems, blockers
- [ ] **Call out risks**: Technical, schedule, compliance
- [ ] **Feasibility assessment**: Evaluate technical feasibility, resource availability, timeline viability, and budget constraints. Flag blockers early. Document go/no-go recommendation
- [ ] **Measurable success metrics**: Each metric has baseline + target + timeframe and traces to a business KPI / North Star
- [ ] **Prioritization framework**: Apply RICE or WSJF (not only MoSCoW); order by value vs effort vs risk
- [ ] **MVP & non-goals**: Define the smallest releasable slice; state explicit non-goals / out-of-scope
- [ ] **Definition of Ready (INVEST)**: Stories are Independent, Negotiable, Valuable, Estimable, Small, Testable before handoff; AC must be verifiable
- [ ] **Riskiest assumptions**: Identify the riskiest assumption per epic and how to validate (de-risk) it
- [ ] **Compliance & privacy at intake**: Classify data; flag GDPR / PCI / HIPAA / SOC2 obligations early
- [ ] **Rollout & post-launch measurement**: Release strategy + the analytics events/instrumentation needed to measure success metrics
- [ ] **Handoff to Business BA**: Deliverables in \`po/{epic-slug}/\`

Use epic-brief.template.md as starting point for each epic.
`;

const BA_FR_TEMPLATE = `## FR-001: [Title]

**Type**: [Feature | API/Contract | Data/Report | Compliance | Non-functional — pick one]

**Description**: [What the system must do]

**Trigger**: [When does this apply? — e.g. user action, API call, schedule, event]

**Process Flow**:
1. Step 1
2. Step 2
3. Step 3

**Output**: [Result]

**Constraints**: [Compliance, SLA, etc.]

**Acceptance Criteria (Gherkin)**:
\`\`\`gherkin
Scenario: [happy path]
  Given [precondition]
  When [action]
  Then [expected outcome]

Scenario: [edge / negative case]
  Given [precondition]
  When [invalid action]
  Then [error / rejection outcome]
\`\`\`

---

## NFR-001: [Title]

**Category**: [Performance | Scalability | Availability | Security | Usability | Accessibility | Compliance — pick one]

**Description**: [What quality attribute the system must meet]

**Metric / Target**: [e.g. response time < 200ms p95, 99.9% uptime, WCAG 2.1 AA]

**Measurement**: [How to verify — load test, monitoring, audit]

---
*Use for any project type: product feature (UI/API), library behaviour, CLI behaviour, data pipeline, or platform capability.*
`;

const BA_BUSINESS_README = `# Business BA

**One folder per epic/feature.** Do not put all epics/features in one file.

- Use the same epic/feature slug as PO: \`docs/sdlc/ba/business/{epic-slug}/\`
- Inside that folder: \`functional-requirements.md\`, \`process-flows.md\`, \`use-cases.md\` (or similar) for that epic only.

Example:
\`\`\`
docs/sdlc/ba/business/
  job-scheduler-event-bus/
    functional-requirements.md
    process-flows.md
  user-auth/
    functional-requirements.md
\`\`\`

## Detailed tasks

- [ ] **Read PO outputs**: Epic brief, user stories, acceptance criteria, feasibility assessment
- [ ] **Define functional requirements**: For each requirement: type, description, trigger, process flow, output, constraints (use FR-001, FR-002...)
- [ ] **Define non-functional requirements (NFR)**: Performance (response time, throughput), scalability (load targets), availability (SLA/uptime), security (auth, encryption, compliance), usability, accessibility. Use NFR-001, NFR-002...
- [ ] **Document process flows**: Step-by-step business flows (e.g. BPMN, flowcharts, numbered lists)
- [ ] **Write use cases**: Actor, goal, preconditions, main/alternate flows, postconditions
- [ ] **Maintain glossary**: Business terms, definitions, acronyms
- [ ] **Map to user stories**: Trace FRs + NFRs to user stories / AC
- [ ] **Gherkin acceptance criteria**: Each requirement/story has Given/When/Then AC + at least one edge case / negative scenario
- [ ] **Traceability matrix**: Maintain a requirement ↔ user story ↔ test case ID mapping
- [ ] **Business rules & negative scenarios**: Catalog business rules; document negative/exception scenarios separately
- [ ] **Data dictionary**: Fields, types, validation, retention, and PII classification
- [ ] **Entity lifecycle / state transitions**: Document states and allowed transitions for key entities
- [ ] **Open questions & assumptions log**: Track ambiguities, assumptions, and constraints with owners
- [ ] **Compliance mapping**: Map regulatory obligations (GDPR / PCI / etc.) to specific requirements
- [ ] **Reverse-engineer (brownfield)**: For existing systems, derive FRs and process flows from current system behavior — not only from new ideas
- [ ] **Handoff to Design (if app/web) or Architect**: Deliverables in \`ba/business/{epic-slug}/\`

Use functional-requirement.template.md for FRS items.
`;

const TECH_API_TEMPLATE = `# Interface / contract spec

Use the section that matches your project. Delete the rest.

---

## HTTP API (backend, BFF, webhooks)
### POST /api/v1/[resource]
**Purpose**: [One-line]
**Request**: Body (JSON schema), Headers (Auth, Content-Type)
**Response**: 200 payload, 4xx/5xx error format
**Contract**: OpenAPI spec

### GET /api/v1/[resource] (add other methods as needed)
**Purpose**: ...
**Query params**: ...
**Response**: ...

---

## Library / SDK (public API surface)
### Module/Class: [Name]
**Purpose**: [One-line]
**Input**: [Params, types]
**Output**: [Return type, behaviour]
**Contract**: TS types / JSDoc / docstring

---

## CLI (commands, flags)
### Command: \`[cmd] [sub] [flags]\`
**Purpose**: [One-line]
**Args**: [positional]
**Flags**: [--opt, env vars]
**Exit codes**: 0 success, non-zero errors
**Contract**: \`--help\` output / man page
`;

const TECH_TEAM_TEMPLATE = `# Team breakdown

Use only the rows that apply to your project. Remove or leave blank unused teams.

## By project type

### Web / full‑stack (UI + API)
| Team     | Scope                         | Dependencies     |
|----------|--------------------------------|-------------------|
| Backend  | API, DB, business logic        | Technical spec    |
| Frontend | Web UI, API integration        | API contract      |

### Mobile
| Team     | Scope                         | Dependencies     |
|----------|--------------------------------|-------------------|
| Backend  | API, DB, business logic        | Technical spec    |
| Mobile   | App UI (iOS / Android / cross-platform), API integration | API contract |

### API / backend only (no UI)
| Team     | Scope                         | Dependencies     |
|----------|--------------------------------|-------------------|
| Backend  | API, DB, business logic, workers | Technical spec |

### Library / SDK
| Team     | Scope                         | Dependencies     |
|----------|--------------------------------|-------------------|
| Core     | Library/SDK implementation, public API | Technical spec |
| Bindings | Language bindings, wrappers (optional) | Core API spec |

### CLI / tooling
| Team     | Scope                         | Dependencies     |
|----------|--------------------------------|-------------------|
| CLI      | CLI app, commands, config     | Technical spec   |

### Data / ML / analytics
| Team     | Scope                         | Dependencies     |
|----------|--------------------------------|-------------------|
| Backend  | APIs, pipelines, storage      | Technical spec   |
| Data/ML  | Models, ETL, analytics, reporting | Data spec, API contract |

### DevOps / platform / infra
| Team     | Scope                         | Dependencies     |
|----------|--------------------------------|-------------------|
| Platform | Infra, CI/CD, observability    | Technical spec   |
| Backend  | APIs, services (if any)       | Technical spec   |

### Mixed (pick and combine)
| Team     | Scope                         | Dependencies     |
|----------|--------------------------------|-------------------|
| Backend  | API, DB, business logic       | Technical spec    |
| Frontend | Web UI, API integration       | API contract      |
| Mobile   | App UI, API integration       | API contract      |
| Data/ML  | Models, ETL, analytics        | Data spec, API    |
| Platform | Infra, CI/CD, deploy         | Technical spec    |
`;

const BA_TECH_README = `# Technical BA

API/interface specs, DB schema, team breakdown.
Templates support: HTTP API, library/SDK, CLI, and all project types (see api-spec and team-breakdown).

## Detailed tasks

- [ ] **Read Architect outputs**: ADRs, context/container diagrams, tech stack
- [ ] **Read Design (if app/web)**: design-spec.md + wireframes — design informs API contracts, screen specs
- [ ] **API/interface spec**: For each endpoint/class/command: purpose, request/response, contract (OpenAPI, TS types, CLI help)
- [ ] **DB schema**: Tables, columns, indexes, constraints; migrations approach
- [ ] **Team breakdown**: Map scope to teams (Backend, Frontend, Mobile, etc.) per project type; dependencies
- [ ] **Trace to FRs**: Map technical specs to functional requirements
- [ ] **Handoff to QE + Dev**: API spec, team breakdown in \`ba/technical/\`
`;

const ARCH_ADR_TEMPLATE = `# ADR-001: [Decision Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-xxx]

## Scope
[backend | frontend | mobile | library | CLI | data/ML | platform/infra | cross-cutting — one or more]

## Context
[Why we need this decision]

## Options Considered
| Option | Pros | Cons / Trade-offs |
|--------|------|-------------------|
| [Option A] | ... | ... |
| [Option B] | ... | ... |

## Decision
[What we decided, and why this option over the alternatives]

## Consequences
- Positive: ...
- Negative: ...
`;

const ARCH_README = `# Architect

ADRs, system diagrams, tech stack decisions.
Use adr.template.md for new ADRs.

## Detailed tasks

- [ ] **Read Business BA outputs**: Functional requirements, process flows, use cases
- [ ] **Read Design (if app/web)**: design-spec.md in \`design/{epic-slug}/\` — design informs architecture
- [ ] **Context diagram**: System boundary, external actors, integrations
- [ ] **Container diagram**: Main components/services and their responsibilities
- [ ] **Tech stack decisions**: Languages, frameworks, databases; document in ADRs
- [ ] **ADR per decision**: Context, decision, consequences (scope: backend, frontend, mobile, etc.)
- [ ] **Non-functional alignment**: Performance, security, scalability, compliance — reference NFRs from Business BA
- [ ] **Security by design (Shift Left)**: Threat model (STRIDE/attack surface), auth/authz architecture, data encryption at rest/transit, secrets management approach, dependency security policy. Document in ADR
- [ ] **Engineering principles alignment**: Verify architecture follows — SOLID, DRY, KISS, SoC, LoD, CoI, GRASP, High Availability, CQRS (if applicable), Zero Trust, EDA (if applicable), Statelessness, Disposability, Backing Services, Config (externalize), Database Sharding/Partitioning (if applicable), Codebase (single per service), Logging & Tracing, Monitoring & Alerting
- [ ] **ADR alternatives & trade-offs**: Each ADR records the options considered and rejected, with trade-offs — not just the chosen decision
- [ ] **C4 completeness**: Add a Component view for complex services + a Deployment diagram (beyond context/container)
- [ ] **Quality-attribute scenarios / fitness functions**: Make each NFR architecturally verifiable (stimulus → response → measure)
- [ ] **Capacity & scalability plan**: Expected load, scaling strategy (horizontal/vertical), identified bottlenecks
- [ ] **Failure modes & resilience**: Failure domains, fallback/degradation, disaster recovery with RTO/RPO targets
- [ ] **Data architecture**: Data flow, ownership, consistency model, storage choices
- [ ] **Observability architecture**: Define the logging standard (text + JSON formats; context schema — requestId/traceId/spanId/correlationId/userId; deep-redaction policy; W3C trace-context propagation across HTTP + message bus) plus metrics and tracing — OpenTelemetry as the unifying signal — as a deliverable
- [ ] **Cost & lock-in**: FinOps cost considerations and build-vs-buy / vendor lock-in noted in ADRs
- [ ] **As-is vs to-be (brownfield)**: For existing systems, capture current-state architecture + retroactive ADRs and a tech-debt register with a target state and migration path (e.g. strangler-fig)
- [ ] **Handoff to Technical BA**: Architecture docs, ADRs in \`architecture/\`
`;

const QE_TC_TEMPLATE = `## TC-001: [Scenario]

**Type**: [API | UI/E2E | Unit | Contract | CLI | Data/Regression — pick one]

**Precondition**: [State before test]

**Steps**:
1. Action 1
2. Action 2
3. Action 3

**Expected**: [Expected result]

**Links to**: AC-001, Story #42

---
*API: send request, assert status/body. UI: interact, assert DOM/visibility. CLI: run command, assert stdout/exit code. Contract: consumer/provider expectations.*
`;

const QE_README = `# QE (Quality Engineering)

**One folder per epic/feature.** Do not put all epics in one file.

- Use the same epic/feature slug as PO and Business BA: \`docs/sdlc/qe/{epic-slug}/\`
- Inside that folder: \`test-plan.md\`, \`test-cases.md\` (Phase 5a), and for Phase 6: automation notes, framework decision for that epic, etc.

## Detailed tasks (Docs phase — Phase 5a)

- [ ] **Read Technical BA spec**: API, team breakdown, FRs
- [ ] **Test plan**: Scope (unit, integration, E2E), coverage goals, risks
- [ ] **Test cases**: TC-001, TC-002... — precondition, steps, expected, links to AC
- [ ] **Handoff to Dev**: Test plan + test cases in \`qe/{epic-slug}/\` → Dev runs implementation

## Detailed tasks (Testing phase — Phase 6)

- [ ] **QE Lead**: Test strategy, framework, review test code
- [ ] **Senior QE**: Write automation tests per test plan
- [ ] **UAT (User Acceptance Testing)**: Verify against original user stories and acceptance criteria from PO; confirm business requirements are met from end-user perspective. Document UAT results in \`qe/{epic-slug}/uat-results.md\`
- [ ] **Bug-fix loop**: If bugs or test failures found → **Dev fixes** → **QE retests**. **Repeat until all tests pass and UAT approved (0 open bugs)**. Only then → handoff to Security + PE
- [ ] **Sign-off**: Regression pass, coverage met, UAT approved, 0 open bugs → release readiness in \`qe/{epic-slug}/\`

Example:
\`\`\`
docs/sdlc/qe/
  job-scheduler-event-bus/
    test-plan.md
    test-cases.md
    automation/   (Phase 6: Senior QE output)
  user-auth/
    test-plan.md
    test-cases.md
\`\`\`

Two phases:
1. **Docs phase** — Test plan, test cases per epic in \`qe/{epic-slug}/\`. Done → **Dev runs implementation immediately**.
2. **Testing phase** — After Dev completes unit tests: QE Lead (15+ yrs automation: strategy, framework, review) + Senior QE (automation) + **UAT** (verify against user stories/AC) output to the same \`qe/{epic-slug}/\` (or subfolders there).

Use test-case.template.md for test cases.
`;

const QE_LEAD_README = `# QE Lead (15+ years exp in test automation)

> **Model**: Use the **highest-tier model** (e.g. Claude Opus) for this role. QE Lead handles test strategy, framework decisions, automation architecture, and review — tasks that require maximum reasoning capability.

**Profile**: 15+ years of experience in test automation, test strategy, and quality engineering. Owns test automation strategy, framework selection, and quality gates across the project.

**Responsibilities**:
- **Test automation strategy**: Define scope of automation (unit, integration, E2E, API, performance), pyramid and tooling alignment with tech stack.
- **Framework and tooling**: Decide and document test frameworks (e.g. Playwright, Cypress, Jest, RestAssured, K6) and CI integration; justify choices in ADRs.
- **Automation architecture**: Design test structure, layers, fixtures, reporting, and flake prevention (retries, stability, env handling).
- **Review and standards**: Review test code for coverage, maintainability, and alignment with framework; define coding and naming standards for tests.
- **Quality gates**: Define and enforce gates (e.g. coverage thresholds, required suites before merge, regression criteria).

**Output**: Test framework ADR, automation strategy doc, review checklist, and per-epic guidance in \`docs/sdlc/qe/{epic-slug}/\`.

## Detailed tasks

- [ ] **Test automation strategy**: Document scope (unit/integration/E2E/API/performance), pyramid, alignment with tech stack
- [ ] **Framework ADR**: Choose and justify frameworks (Playwright, Cypress, Jest, etc.); document in ADR
- [ ] **Automation architecture**: Design folder structure, layers, fixtures, reporting, retries, env handling
- [ ] **Review checklist**: Coverage, maintainability, naming, alignment with framework
- [ ] **Quality gates**: Define thresholds (coverage, required suites before merge), regression criteria
- [ ] **Per-epic guidance**: Output to \`qe/{epic-slug}/\` per epic
`;

const QE_SENIOR_README = `# Senior QE (10+ years exp)

> **Model**: Use a **cost-efficient model** (e.g. Claude Haiku). Execute test implementation from QE Lead's strategy and specs.

**Responsibilities**:
- Write automation tests per test plan
- Implement E2E, integration, regression tests
- Follow QE Lead's framework decisions

## Detailed tasks

- [ ] **Read test plan**: Scope, coverage goals, test case IDs
- [ ] **Implement E2E tests**: UI flows, critical paths per QE Lead's framework
- [ ] **Implement API/integration tests**: Request/response, contracts
- [ ] **Implement regression suite**: Add to CI; ensure stability (retries, waits)
- [ ] **Report coverage**: Align with QE Lead's quality gates
- [ ] **Output**: Automation code and docs in \`qe/{epic-slug}/\`
`;

const DESIGN_README = `# Design (optional — app/web projects only)

**When:** After Business BA, **before** Architect and Technical BA. **Skip** for API-only, library, CLI, data/ML, platform projects without UI.

**Why before Architect:** UX drives technical decisions — design informs architecture and API specs.

**Anti AI pattern:** Designs must NOT look like they were generated by AI. Avoid generic, templated, overly symmetric, cookie-cutter layouts. Prioritize personality, asymmetry, intentional whitespace, brand-specific visual language, and human-feeling aesthetics.

**One folder per epic:** \`docs/sdlc/design/{epic-slug}/\` — same slug as PO/BA. Store design specs and wireframes there.

## Output format

- **design-spec.md** — Markdown design spec: screen inventory, component hierarchy, user flows, responsive breakpoints, interaction notes.
- **wireframes/*.html** (optional) — Static HTML/CSS wireframes; open in any browser, no external tools needed. Keep them simple (layout + structure, not pixel-perfect).

## Flow

1. **Design sub-agent**: Create UI/UX design specs based on idea + PO docs + Business BA FRS. Write \`design-spec.md\` describing every screen, component, and user flow. Optionally generate HTML wireframes for key screens.
2. **PO + Business BA review**: Both roles review the design spec against epic brief, user stories, functional requirements.
3. **Loop until approved**: If design does not match idea/docs → return to step 1 with feedback; redesign. Repeat until PO and BA approve.
4. **Handoff to Architect**: Once approved → proceed to Architect (design informs architecture and Technical BA).

## Detailed tasks

- [ ] **Anti AI check**: Ensure design does NOT look AI-generated — no generic hero sections, stock illustrations, perfectly symmetric grids, or bland templates. Aim for unique, human-feeling aesthetics
- [ ] **Gather context**: Read PO epic brief, BA FRS, user stories as input
- [ ] **Screen inventory**: List all screens/pages with purpose and key elements
- [ ] **Component hierarchy**: Define reusable components, layout structure, navigation
- [ ] **User flows**: Document step-by-step flows for each user story (include happy path + error states)
- [ ] **Responsive breakpoints**: Define mobile / tablet / desktop behavior
- [ ] **Mobile-first**: Design for the smallest viewport first, then enhance upward
- [ ] **Accessibility (WCAG 2.1 AA)**: Color contrast ≥ 4.5:1, full keyboard navigation, visible focus states, semantic structure, alt text, touch targets ≥ 44×44px
- [ ] **All UI states**: Specify loading / empty / error / success states for every async surface — not just the happy path
- [ ] **i18n-ready**: Leave room for ~+30–40% text expansion, support RTL (logical layout), locale-aware date/number/currency formats, no text baked into images
- [ ] **Interaction & motion spec**: Hover / active / disabled / focus states; transitions and motion notes
- [ ] **Design tokens (required)**: Define color / spacing / typography tokens — no hardcoded values (aligns with Dev "no hardcoded colors")
- [ ] **Usability check**: Validate against Nielsen heuristics (or a light usability test)
- [ ] **Write design-spec.md**: Full design spec in Markdown; output to \`design/{epic-slug}/\`
- [ ] **HTML wireframes** (optional): Generate static HTML/CSS wireframes for key screens in \`design/{epic-slug}/wireframes/\`
- [ ] **PO review**: Check design aligns with epic brief, user stories, acceptance criteria
- [ ] **Business BA review**: Check design matches functional requirements, process flows
- [ ] **If not approved**: Capture feedback; loop back to design step with specific changes
- [ ] **If approved**: Handoff to Architect; design in \`design/{epic-slug}/\`
`;

const DESIGN_SPEC_TEMPLATE = `# Design Spec: [Epic Name]

## Overview
[Brief description of what this design covers and the problem it solves]

## Screen Inventory

| # | Screen / Page | Purpose | Key Elements |
|---|--------------|---------|--------------|
| 1 | | | |

## User Flows

### Flow 1: [Flow Name]
1. User lands on [screen]
2. User [action] → [result]
3. ...

**Happy path:** ...
**Error states:** ...

## Component Hierarchy

\`\`\`
App
├── Layout
│   ├── Header (nav, user menu)
│   ├── Sidebar (optional)
│   └── Main Content
│       ├── [Component A]
│       └── [Component B]
└── Footer
\`\`\`

## Screen Details

### Screen: [Name]
- **URL / Route:** \`/path\`
- **Purpose:** ...
- **Layout:** [description or ASCII wireframe]
- **Components:** [list key components]
- **Interactions:** [click, hover, form submit behaviors]
- **Data:** [what data is displayed / submitted]

## Responsive Breakpoints

| Breakpoint | Width | Layout Changes |
|-----------|-------|---------------|
| Mobile | < 768px | Single column, hamburger nav |
| Tablet | 768–1024px | ... |
| Desktop | > 1024px | Full layout |

## Design Tokens (required)

- **Primary color:** ...
- **Typography:** ...
- **Spacing:** ...

## UI States

| State | Screen / Component | Behavior |
|-------|--------------------|----------|
| Loading | | |
| Empty | | |
| Error | | |
| Success | | |

## Accessibility (WCAG 2.1 AA)
- [ ] Color contrast ≥ 4.5:1 (text), ≥ 3:1 (large text / UI components)
- [ ] Full keyboard navigation + visible focus states
- [ ] Semantic structure / ARIA where needed; alt text for images
- [ ] Touch targets ≥ 44×44px

## Internationalization
- [ ] Layout tolerates ~+30–40% text expansion
- [ ] RTL supported (logical layout, mirrored where needed)
- [ ] Locale-aware date / number / currency formats
- [ ] No text baked into images

## Anti AI Checklist
- [ ] No generic/templated layouts — design feels unique and intentional
- [ ] No stock AI illustrations — use real or custom imagery
- [ ] Asymmetry and visual interest — not perfectly symmetric grids
- [ ] Brand-specific colors, typography, spacing — not default palettes
- [ ] Human-feeling micro-interactions and copy

## Notes
[Any additional context, constraints, or decisions]
`;

const DEV_TECH_LEAD_README = `# Tech Lead (15+ years exp)

> **Model**: Use the **highest-tier model** (e.g. Claude Opus) for this role. Tech Lead handles planning, logic analysis, architecture decisions, and code review — tasks that require maximum reasoning capability.

**Responsibilities**:
- Decide tech stack, frameworks, libraries
- Define implementation plan, critical logic, and technical specs for implementation roles
- Review and merge code
- Ensure architecture alignment

## Detailed tasks

- [ ] **Read architecture and Technical BA spec**: ADRs, API spec, team breakdown
- [ ] **Tech stack decision**: Languages, frameworks, libraries; document in ADR
- [ ] **Implementation plan**: Define step-by-step tasks, critical logic, edge cases, and technical specs that implementation roles will execute
- [ ] **Project setup**: Repo structure, tooling, lint, format, CI baseline
- [ ] **Code review**: Architecture alignment, patterns, test coverage, security
- [ ] **Security review (Shift Left)**: OWASP Top 10 check, input validation, auth/authz, secrets not hardcoded, dependency audit (npm audit / pip audit / etc.), SAST scan in CI
- [ ] **Merge approval**: Enforce quality gates before merge (tests, coverage, security scan pass)
- [ ] **Tech guidance**: Resolve technical disputes; mentor team
- [ ] **Engineering principles enforcement**: Code review must verify — Clean Code, SOLID, DRY, KISS, SoC, LoD, CoI, GRASP, POLS, TDD/BDD. Architecture patterns: Statelessness, Disposability, Backing Services, Config externalization, Logging & Tracing, Monitoring & Alerting
- [ ] **Design pattern selection (context-driven)**: Evaluate whether a pattern genuinely fits the problem before applying it; choose by intent — Strategy (interchangeable algorithms/behaviors), Template Method (fixed skeleton + variable steps), Factory/Abstract Factory (decouple creation / product families), Builder (complex construction), Bridge (vary abstraction and implementation independently), Adapter (incompatible interfaces), Decorator (compose behavior), Observer/Pub-Sub (event reaction), Repository (persistence abstraction). Record the chosen pattern + rationale in an ADR or implementation note
- [ ] **Avoid over-engineering (anti pattern-itis)**: Prefer the simplest design that works (KISS/YAGNI); introduce a pattern only when it removes real duplication, decouples a real axis of change, or is needed for testability — never speculatively. Refactor toward a pattern when the third real case appears (rule of three)
- [ ] **Enforce quality gate**: Reject any PR that does not satisfy [Developer Quality Rules](../quality-rules.md) — DoD, test quality, type-safety, error handling, performance budget, security, i18n
- [ ] **Output**: ADRs, review checklist in \`dev/tech-lead/\`
`;

const DEV_SENIOR_README = `# Senior Developer (10+ years exp)

> **Model**: Use a **cost-efficient model** (e.g. Claude Haiku) for this role. Implementation is executed from Tech Lead's detailed specs — optimizing cost while maintaining quality through clear instructions.

**Responsibilities**:
- Implement features per Tech Lead's implementation plan and Technical BA spec
- Write code with Unit Test coverage **100%**
- Follow Tech Lead's tech decisions

## Detailed tasks

- [ ] **Read Technical BA spec**: API, schema, team breakdown
- [ ] **Implement feature**: Code per spec; follow Tech Lead stack. Adhere to: Clean Code, SOLID, DRY, KISS, SoC, LoD, CoI, GRASP, POLS
- [ ] **Security practices (Shift Left)**: Input validation, parameterized queries, no hardcoded secrets, follow Architect's security ADR
- [ ] **Unit tests (TDD/BDD)**: Coverage **100%**; TDD (write tests first) or BDD (behavior specs); edge cases, error paths, BSR (Behavior-Structure-Result)
- [ ] **PR**: Lint, tests, security scan passing; request Tech Lead review
- [ ] **Quality gate (mandatory)**: Satisfy [Developer Quality Rules](../quality-rules.md) before PR — DoD, test quality, type-safety, error handling, security, i18n
- [ ] **Output**: Code + implementation notes in \`dev/senior-developer/\`
`;

const DEV_IMPLEMENTATION_ROLES_TEMPLATE = `# Implementation roles by project type

Use only the roles that apply. Remove or ignore the rest. Tech Lead is cross-cutting; add discipline roles as needed.

## Model optimization strategy

| Role | Model tier | Why |
|------|-----------|-----|
| Tech Lead | **Highest** (e.g. Opus) | Planning, logic analysis, architecture decisions, code review |
| All implementation roles | **Cost-efficient** (e.g. Haiku) | Execute code from Tech Lead's detailed specs |

Tech Lead defines all critical steps, logic, and specs first → implementation roles execute them. This maximizes quality on thinking while reducing cost on execution.

> **All roles must satisfy [Developer Quality Rules](./quality-rules.md) before opening a PR** (DoD, test quality, type-safety, error handling, performance budget, security, and i18n for UI). Tech Lead enforces it at review.

## By project type

| Project type        | Roles to use (all Senior 10+ except Tech Lead 15+) |
|---------------------|----------------------------------------------------|
| Web / full-stack    | Tech Lead, Senior Frontend, Senior Backend         |
| Mobile              | Tech Lead, Senior Mobile, Senior Backend           |
| API / backend only  | Tech Lead, Senior Backend                          |
| Library / SDK       | Tech Lead, Senior Dev (or Senior Backend)           |
| CLI / tooling       | Tech Lead, Senior Dev (or Senior Backend)           |
| Data / ML           | Tech Lead, Senior Backend, Senior Data/ML          |
| Embedded / IoT      | Tech Lead, Senior Embedded (+ Senior Backend if needed) |
| Platform / infra    | Tech Lead, Senior Platform (+ Senior Backend if needed) |
| Mixed               | Tech Lead + any of: Senior Frontend, Backend, Mobile, Embedded, Data/ML, Platform |

## Role folders (all implementation roles are Senior 10+ yrs)

- \`tech-lead/\` — Tech Lead (15+ yrs): tech stack, review & merge (all projects)
- \`senior-developer/\` — Senior Developer: generic implementation
- \`frontend/\` — Senior Frontend: Web UI
- \`backend/\` — Senior Backend: API, services, DB
- \`mobile/\` — Senior Mobile: iOS, Android, cross-platform
- \`embedded/\` — Senior Embedded: firmware, IoT
- \`data-ml/\` — Senior Data/ML: ETL, models, analytics
- \`platform/\` — Senior Platform: CI/CD, infra, observability
`;

const DEV_FRONTEND_README = `# Senior Frontend (10+ years exp) — Web UI

> **Model**: Use a **cost-efficient model** (e.g. Claude Haiku). Execute from Tech Lead's specs.

**Responsibilities**:
- Implement web UI per design and API contract
- Unit Test coverage **100%**
- Follow Tech Lead's stack (e.g. React, Vue, Angular)

## Detailed tasks

- [ ] **Read Technical BA spec**: API contract, design (if any)
- [ ] **Implement components/screens**: Per spec; responsive, accessible
- [ ] **API integration**: Fetch, state, error handling
- [ ] **Unit tests (TDD/BDD)**: Components, hooks, utils — coverage **100%**; follow Clean Code, SOLID, DRY, KISS
- [ ] **PR**: Lint, tests; Tech Lead review
- [ ] **Quality gate (mandatory)**: Satisfy [Developer Quality Rules](../quality-rules.md) before PR — incl. **i18n** (no hardcoded strings, ICU, RTL, locale-aware formatting), a11y (WCAG 2.1 AA), and loading/empty/error states
- [ ] **Output**: Code + component/integration docs in \`dev/frontend/\`
`;

const DEV_BACKEND_README = `# Senior Backend (10+ years exp) — API, services

> **Model**: Use a **cost-efficient model** (e.g. Claude Haiku). Execute from Tech Lead's specs.

**Responsibilities**:
- Implement API, services, DB layer per Technical BA spec
- Unit Test coverage **100%**
- Follow Tech Lead's stack

## Detailed tasks

- [ ] **Read Technical BA spec**: API spec, DB schema
- [ ] **Implement endpoints**: Per spec; validation, auth, error responses
- [ ] **Implement DB layer**: Migrations, queries, transactions
- [ ] **Unit tests (TDD/BDD)**: Services, controllers, DB — coverage **100%**; follow Clean Code, SOLID, DRY, KISS
- [ ] **PR**: Lint, tests; Tech Lead review
- [ ] **Quality gate (mandatory)**: Satisfy [Developer Quality Rules](../quality-rules.md) before PR — DoD, test quality, type-safety, error handling, performance budget (no N+1, timeouts), security
- [ ] **Output**: Code + API/DB implementation notes in \`dev/backend/\`
`;

const DEV_MOBILE_README = `# Senior Mobile (10+ years exp) — iOS / Android / cross-platform

> **Model**: Use a **cost-efficient model** (e.g. Claude Haiku). Execute from Tech Lead's specs.

**Responsibilities**:
- Implement app UI and API integration per spec
- Unit Test coverage **100%**
- Follow Tech Lead's stack (e.g. React Native, Flutter, native)

## Detailed tasks

- [ ] **Read Technical BA spec**: API contract, screen flows
- [ ] **Implement screens/modules**: Per spec; platform parity (iOS/Android)
- [ ] **API integration**: Auth, state, offline (if required)
- [ ] **Unit tests (TDD/BDD)**: Components, logic — coverage **100%**; follow Clean Code, SOLID, DRY, KISS
- [ ] **PR**: Lint, tests; Tech Lead review
- [ ] **Quality gate (mandatory)**: Satisfy [Developer Quality Rules](../quality-rules.md) before PR — incl. **i18n/l10n** (no hardcoded strings, locale-aware formatting, RTL) and a11y
- [ ] **Output**: Code + screen/module docs in \`dev/mobile/\`
`;

const DEV_EMBEDDED_README = `# Senior Embedded (10+ years exp) — firmware, IoT

> **Model**: Use a **cost-efficient model** (e.g. Claude Haiku). Execute from Tech Lead's specs.

**Responsibilities**:
- Implement firmware, drivers, hardware interfaces per spec
- Tests as appropriate for target (unit, HW-in-loop)
- Follow Tech Lead's stack and safety constraints

## Detailed tasks

- [ ] **Read Technical BA spec**: Interfaces, timing, constraints
- [ ] **Implement modules/drivers**: Per spec; safety-critical compliance
- [ ] **Tests**: Unit, HW-in-loop as feasible
- [ ] **PR**: Lint, tests; Tech Lead review
- [ ] **Quality gate (mandatory)**: Satisfy [Developer Quality Rules](../quality-rules.md) before PR — DoD, test quality, type-safety, error handling, security
- [ ] **Output**: Code + module/interface docs in \`dev/embedded/\`
`;

const DEV_DATA_ML_README = `# Senior Data/ML (10+ years exp)

> **Model**: Use a **cost-efficient model** (e.g. Claude Haiku). Execute from Tech Lead's specs.

**Responsibilities**:
- Implement ETL, models, analytics pipelines per spec
- Tests and validation for data and model quality
- Follow Tech Lead's stack (e.g. Python, Spark, ML frameworks)

## Detailed tasks

- [ ] **Read Technical BA spec**: Data spec, API contract
- [ ] **Implement ETL/pipelines**: Ingestion, transforms, storage
- [ ] **Implement models**: Training, evaluation; model cards
- [ ] **Tests**: Data validation, model quality metrics
- [ ] **PR**: Lint, tests; Tech Lead review
- [ ] **Quality gate (mandatory)**: Satisfy [Developer Quality Rules](../quality-rules.md) before PR — DoD, test/data-validation quality, type-safety, error handling, security
- [ ] **Output**: Code + pipeline/model docs in \`dev/data-ml/\`
`;

const DEV_PLATFORM_README = `# Senior Platform (10+ years exp) — infra, CI/CD

> **Model**: Use a **cost-efficient model** (e.g. Claude Haiku). Execute from Tech Lead's specs.

**Responsibilities**:
- Implement CI/CD, infra as code, observability per spec
- Follow Tech Lead's stack and security requirements

## Detailed tasks

- [ ] **Read Technical BA spec**: Infra, deploy, observability requirements
- [ ] **Implement CI/CD**: Build, test, deploy pipelines
- [ ] **Infra as code**: Terraform/Pulumi/CloudFormation per spec
- [ ] **Observability**: Logging, metrics, traces, alerts
- [ ] **PR**: Lint; Tech Lead review
- [ ] **Quality gate (mandatory)**: Satisfy [Developer Quality Rules](../quality-rules.md) before PR — DoD, type-safety (IaC lint/tfsec), error handling, security, observability
- [ ] **Output**: Pipelines, infra code, runbooks in \`dev/platform/\`
`;

const DEV_QUALITY_RULES = `# Developer Quality Rules

Mandatory quality bar for **all implementation roles**. Tech Lead enforces at review; every Senior role must satisfy this **before opening a PR**. Applies **on top of** the existing baseline (100% branch coverage, TDD/BDD, Clean Code, SOLID, DRY, KISS, SoC, security shift-left).

> **Stack-specific rules** (Java, Spring Boot, Kafka, TypeScript, NestJS, Next.js, …) live in \`tech/\` — generate them with \`npx sdlc-workflow tech <stack...>\`. The general bar here always holds; stack files add language/framework rules on top.

## 1. Definition of Done (gate before PR)
- [ ] Tests pass locally; **100% branch** coverage (not just line).
- [ ] Lint + formatter + type-check: **0 warnings** (CI treats warnings as errors).
- [ ] No \`TODO\`/\`FIXME\`, dead code, commented-out blocks, or debug \`console.log\`/prints left.
- [ ] Public API / technical-decision changes reflected in docs or an ADR.
- [ ] Author has self-reviewed the diff before requesting review.

## 2. Test quality (beyond the % number)
- Coverage ≠ quality: **≥ 3 negative/edge cases per happy path**; every assertion checks real behavior (no empty asserts).
- **AAA** (Arrange-Act-Assert); one reason to fail per test; test names describe behavior.
- **Zero flaky**: no dependence on wall-clock, run order, or network; mock external I/O.
- (Recommended) **mutation testing** on core-logic modules to catch fake tests.

## 3. Type safety & static analysis
- **Strict mode** maxed out (TS \`strict\`, mypy \`--strict\`, etc.). **No \`any\`/\`@ts-ignore\`** without an inline justification + issue ID.
- SAST (Semgrep/SonarQube) in CI; **block on any High finding**.

## 4. Error handling, logging & observability (shift-left, at code time)

### Error handling
- **No swallowed errors** (empty \`catch {}\`); log with context or re-throw meaningfully — never lose the original cause.
- **Classify errors**: expected/business (→ 4xx, no stack trace, WARN/INFO) vs unexpected (→ 5xx, full stack, ERROR); map both to a consistent error response (problem+json).
- Validate input **at the boundary** (API edge); fail fast with a clear message.
- Critical write operations must be **idempotent** where retries are possible.

### Logging — format & levels
- **Two output formats**: human-readable **text** for local/dev and **JSON** for staging/prod (machine-parseable for aggregation). Switch via config/env (e.g. \`LOG_FORMAT=json|text\`) — never edit call sites to change format.
- **Correct levels**: ERROR (actionable failure) · WARN (recoverable/degraded) · INFO (lifecycle + business events) · DEBUG (diagnostics, off in prod) · TRACE (verbose). Level configurable **per logger/package** at runtime.
- **One structured event per line**: a stable message + key/value fields; never string-interpolate data into the message (keeps logs queryable, low-cardinality).
- **Timestamps in UTC ISO-8601**; every line carries service name, environment, and version/commit.

### Context propagation (MDC / async-local storage)
- Every log line carries: **requestId**, **traceId**, **spanId**, **correlationId**, **userId** + **username** (when authenticated), **clientIp** (if relevant).
- Populate via MDC (Logback), AsyncLocalStorage (Node), or context vars — **set at request entry, cleared at exit**, surviving async boundaries.
- **Cross-service propagation**: forward **W3C Trace Context** (\`traceparent\`/\`tracestate\`) + correlationId on every outbound call — HTTP headers **and** message headers (Kafka/RabbitMQ). Inbound middleware reads them or generates new ones, stitching logs across microservices into one trace.

### Deep redaction — never log sensitive data
- **Deny-by-default**: redact passwords, tokens/secrets/API keys, \`Authorization\` headers, cookies, and PII (email, phone, national id, full card PAN, CVV, health/financial data).
- **Deep/recursive redaction** of nested objects and arrays — not just top-level keys; match by key-name patterns **and** typed annotations; mask fully (\`***\`) or partially (e.g. card last-4).
- Redact **in the logging layer** (a serializer/redactor) so a stray log call can't leak; also redact stack traces and request/response bodies.
- **Don't log full bodies** by default — allowlist safe fields; log ids/sizes instead. Align redaction with the data classification from BA and GDPR/PCI.
- **Prevent log injection**: strip/escape CR/LF in user-supplied values before logging.

### Request/response logging middleware (filter / interceptor)
- A single middleware logs **every request**: method, **templated route** (not raw path with ids — avoids cardinality blow-up), status code, **duration in ms**, requestId/traceId, userId, response size, outcome.
- Log **completion** at INFO (2xx/3xx), WARN (4xx), ERROR (5xx); include exception type + redacted message on failure; optional DEBUG line at start.
- **Skip or sample** health-check/noise endpoints. Emit a **latency metric + error counter** alongside the log (logs + metrics share the traceId).

### ORM / database logging (config, not ad-hoc)
- Configurable channels: **migration** (INFO — log applied versions), **DDL/schema** (INFO non-prod), **query** (DEBUG only, **off in prod**), **bound parameters** (DEBUG and **redacted** — never log PII params in prod), **slow query** (WARN above a threshold, e.g. 200–500ms), **errors** (ERROR with SQL + sanitized params).
- **Never enable full SQL/param logging in prod** (perf cost + PII leak) — rely on slow-query logs + metrics. See \`tech/\` stack files for concrete config.

### HTTP client / service-to-service logging
- Log every outbound call: target service, method, **sanitized URL** (no secrets/PII in query string), status, **duration**, retry count, propagated traceId.
- On failure, log status + **sanitized** response body; correlate with timeout/circuit-breaker state. **Redact** \`Authorization\`/cookie headers — never log full bearer tokens.

### Operability gates
- **No PII/secret in logs** is a release gate (scan or review).
- Logs ↔ traces ↔ metrics correlate by traceId; prefer **OpenTelemetry** as the unifying signal.
- Define **retention + sampling** (sample high-volume DEBUG; always keep ERROR).
- Write logs to **stdout** (12-factor); the platform ships/aggregates them — the app does not manage log files.

## 5. Performance budget (at code time — not only Phase 8)
- **No N+1 queries**; use batch/eager-load; every list query has **pagination + index**.
- All external I/O is **async/non-blocking** and has a **timeout**.
- Avoid premature optimization, but stay conscious of complexity (no O(n²) on large data).

## 6. Security (beyond OWASP baseline)
- **Least privilege** for tokens/DB/roles; **deny by default**.
- Output encoding against XSS; **parameterized queries** mandatory (never string-concat SQL).
- Secrets only via env/Vault/SSM; **secret-scan** (gitleaks) blocks at pre-commit + CI.

## 7. Git & PR hygiene
- **Conventional Commits**; atomic commits; **PR ≤ ~400 lines** of diff (split larger ones).
- Each PR maps to one user story / issue ID; do **not** mix refactor + feature in one PR.
- Branch protection: no merge while CI is red; squash to keep history clean.

## 8. Dependencies
- **Pin versions** (commit the lockfile); \`npm/pip audit\` blocks High/Critical.
- Don't add a dependency for something small you can write; remove unused deps.

## 9. Documentation
- Public functions/classes have a **docstring** (purpose, params, return, throws).
- README/setup runs from scratch; ADRs updated when technical direction changes.

## 10. Frontend / UI (if applicable)
- **WCAG 2.1 AA**; keyboard-navigable; semantic HTML.
- No hardcoded colors/spacing — use **design tokens**.
- Handle **loading / empty / error** states for every async UI.

## 11. Internationalization (i18n) & Localization (l10n) — if UI/text-facing
**When:** Any user-facing text (web, mobile, emails, CLI messages).
- [ ] **No hardcoded user-facing strings** — all text via an i18n catalog (keys, not literals); lint rule fails the build on literal UI text.
- [ ] **Externalize from day one** — even single-language projects route text through the i18n layer so adding locales later is non-breaking.
- [ ] **ICU MessageFormat** for plurals/gender/select; **never concatenate translated fragments** (word order differs per language).
- [ ] **Locale-aware formatting** — dates, numbers, currency, units via \`Intl\`/locale APIs, never manual formatting.
- [ ] **RTL support** — logical CSS properties (\`margin-inline\`, \`text-align: start\`), \`dir\` attribute; test Arabic/Hebrew.
- [ ] **Layout tolerates ~+30–40% text expansion** vs English; no fixed-width controls that clip translations.
- [ ] **UTF-8 everywhere**; correct \`lang\`/charset attributes; no text baked into images (provide translatable alt text).
- [ ] **Translation keys carry context** for translators; no reusing one key across different contexts.
- [ ] **Pseudolocalization** in QA to catch hardcoded strings and truncation before real locales are added.

## 12. Backend / API & data services (if applicable)

### A. API contract & compatibility
- [ ] **Version the API** (\`/v1\`); no breaking change without a version bump. Deprecations carry a \`Sunset\` header + timeline.
- [ ] **Consistent error schema** (RFC 7807 \`application/problem+json\`); **semantically correct HTTP status codes** (404 vs 403 vs 409 vs 422).
- [ ] **Mass-assignment protection**: bind via DTO/allowlist fields; never map a request body straight onto an entity.
- [ ] (Public API) **consumer-driven contract tests** so clients don't break on change.

### B. Resilience & operability
- [ ] **Idempotency-Key** for non-idempotent endpoints (resource creation, payments) so retries are safe.
- [ ] **Retry with exponential backoff + jitter**; **circuit breaker** for downstreams; **bulkhead** to isolate pools.
- [ ] **Graceful shutdown**: drain in-flight requests, close pools; separate **liveness / readiness / health** probes.

### C. Data integrity & concurrency
- [ ] **Explicit transaction boundaries** with the correct **isolation level**; guard races with **optimistic/pessimistic locking** (avoid lost updates, deadlocks).
- [ ] **Zero-downtime migrations** (expand/contract), **reversible**, forward-only in prod; **never edit an applied migration**.
- [ ] **Money as integer minor units / decimal** (never float); **store timestamps in UTC**.

### D. Throughput protection
- [ ] **Rate limiting / throttling** + **request body size limits**.
- [ ] **Connection pool** sized appropriately; **query timeout** on every query.
- [ ] **Caching** with explicit TTL + **invalidation strategy**; support **ETag / conditional requests** where it fits.

### E. Authorization depth (beyond authentication)
- [ ] **Object-level authorization** on every resource access (prevent **IDOR/BOLA**) — not just "is the caller logged in".
- [ ] **CORS allowlist**; **CSRF** protection for cookie-based auth; **security headers**; **SSRF** guard on outbound URLs.

### F. Eventing / async (if a message bus is used)
- [ ] **Outbox pattern** / transactional messaging to keep DB and events consistent.
- [ ] **Idempotent consumers**; **dead-letter queue**; assume **at-least-once** delivery.

### G. Test depth
- [ ] **Integration tests against a real DB** (e.g. Testcontainers), not only mocks.

## 13. Design patterns & abstraction
- **Fit the context, not the textbook**: a pattern must solve a real, present problem (duplication, a changing axis, testability) — otherwise prefer the simpler direct solution (KISS/YAGNI).
- **Choose by intent**: Strategy (interchangeable algorithms/behaviors), Template Method (fixed skeleton + variable steps), Factory / Abstract Factory (decouple creation / product families), Builder (complex/stepwise construction), Bridge (vary abstraction and implementation independently), Adapter (bridge incompatible interfaces), Decorator (compose behavior without subclass explosion), Observer / Pub-Sub (react to events), Repository / Unit of Work (persistence abstraction).
- **Rule of three**: refactor toward a pattern when the third real case appears — not speculatively on the first.
- **Document the decision**: record the pattern + rationale (and rejected alternatives) in an ADR or implementation note; name classes/abstractions after the pattern's intent.
- **Stay idiomatic**: prefer language/framework-native idioms where they express the same intent more simply (e.g. a higher-order function instead of a Strategy class, the DI container instead of a hand-rolled Factory).
- **Patterns serve SOLID**: use them to honor SRP/OCP/DIP — never let a pattern add indirection that obscures the code.

## 14. Working in existing / legacy code (brownfield)
- **New and changed code meets the full bar**; do not block on pre-existing debt.
- **Diff coverage**: enforce 100% coverage on **changed lines**, not on the whole legacy repo.
- **Ratchet, don't regress**: coverage, lint, and security findings may only improve over time — a gate fails on regression, not on absolute legacy debt.
- **Boy Scout rule**: leave each touched file a little better (naming, a test, a small refactor), scoped to your change.
- **Characterization tests first**: before refactoring untested legacy, capture current behavior with tests, then change safely.
- **Strangler-fig** for replacement: wrap the old path, divert traffic incrementally, retire it — no big-bang rewrites.
- **Don't rewrite working code** just to apply a pattern (see §13) or to chase 100% on untouched legacy.
- **Document as-is** decisions (retroactive ADRs) so future work has context — see \`../ADOPTION.md\`.
`;

const MAINTENANCE_README = `# Maintenance

**When:** After Deploy — ongoing throughout the product lifecycle.

**Role:** Monitor production health, fix bugs, apply patches, upgrade dependencies, and evolve features based on user feedback.

## Detailed tasks

- [ ] **Monitoring setup**: Health checks, error tracking (Sentry, Datadog, etc.), alerting, SLA dashboards
- [ ] **Bug triage**: Prioritize production bugs; severity classification (P0–P3)
- [ ] **Bug fixes**: Follow Dev workflow (branch → fix → unit test → PR → review → deploy)
- [ ] **Dependency updates**: Regular security patches, library upgrades; run audit tools
- [ ] **Performance tuning**: Monitor metrics vs NFR targets; optimize bottlenecks
- [ ] **Feature iteration**: Small enhancements from user feedback → loop back to PO for new epics if scope is significant
- [ ] **Documentation**: Keep runbooks, incident logs, and post-mortems up to date
- [ ] **Output**: Patches, updates, runbooks in \`docs/sdlc/maintenance/\`
`;

// ── tech command ──────────────────────────────────────────────────────────

const CATEGORY_ORDER = ["language", "backend", "frontend", "persistence", "messaging"];
const CATEGORY_LABELS = {
  language: "Languages & runtimes",
  backend: "Backend frameworks",
  frontend: "Frontend frameworks",
  persistence: "Persistence / ORM",
  messaging: "Messaging",
};
const TECH_ALIASES = {
  node: "nodejs",
  ts: "typescript",
  spring: "spring-boot",
  springboot: "spring-boot",
  jpa: "spring-jpa",
  hibernate: "spring-jpa",
  springdata: "spring-jpa",
  next: "nextjs",
  nest: "nestjs",
  rabbit: "rabbitmq",
  ng: "angular",
};

async function techCommand(cwd, args) {
  const sub = (args[0] || "").toLowerCase();
  if (sub === "list" || sub === "--list" || sub === "-l") {
    printTechList();
    return;
  }
  if (sub === "detect") {
    const detected = await detectStacks(cwd);
    if (detected.length) {
      console.log("Detected stack: " + detected.join(", "));
      console.log("→ npx sdlc-workflow tech " + detected.join(" "));
    } else {
      console.log("No known stack detected from package.json / pom.xml / build.gradle / compose files.");
      printTechList();
    }
    return;
  }

  let requested = args;
  if (requested.length === 0) {
    if (process.stdin.isTTY) {
      requested = await promptTechSelection();
    }
    if (requested.length === 0) {
      console.log("Usage: npx sdlc-workflow tech <stack...>   (e.g. tech java spring-boot kafka)\n");
      printTechList();
      return;
    }
  }

  const resolved = [];
  const unknown = [];
  for (const raw of requested) {
    const key = TECH_ALIASES[raw.toLowerCase()] || raw.toLowerCase();
    if (TECH_STACKS[key]) {
      if (!resolved.includes(key)) resolved.push(key);
    } else {
      unknown.push(raw);
    }
  }
  if (unknown.length) {
    console.error("Unknown stack(s): " + unknown.join(", ") + "\n");
    printTechList();
    process.exit(1);
  }

  const techDir = join(cwd, "docs", "sdlc", "dev", "tech");
  await mkdir(techDir, { recursive: true });
  for (const key of resolved) {
    await writeFile(join(techDir, key + ".md"), TECH_STACKS[key].body, "utf8");
    console.log("  + docs/sdlc/dev/tech/" + key + ".md");
  }

  const entries = await readdir(techDir);
  const existing = entries
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => f.slice(0, -3))
    .filter((k) => TECH_STACKS[k]);
  await writeFile(join(techDir, "README.md"), buildTechIndex(existing), "utf8");
  console.log("  + docs/sdlc/dev/tech/README.md (index)");
  console.log("\nDone. Stack rules extend docs/sdlc/dev/quality-rules.md.");
}

function printTechList() {
  console.log("Available tech stacks (npx sdlc-workflow tech <stack...>):\n");
  for (const cat of CATEGORY_ORDER) {
    const keys = Object.keys(TECH_STACKS)
      .filter((k) => TECH_STACKS[k].category === cat)
      .sort();
    if (!keys.length) continue;
    console.log("  " + CATEGORY_LABELS[cat] + ":");
    for (const k of keys) console.log("    " + k.padEnd(14) + TECH_STACKS[k].name);
    console.log("");
  }
  console.log(
    "Aliases: " +
      Object.entries(TECH_ALIASES)
        .map(([a, k]) => a + " → " + k)
        .join(", ")
  );
}

async function promptTechSelection() {
  printTechList();
  const { createInterface } = await import("node:readline/promises");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question("\nEnter stacks (space/comma separated), or blank to cancel: ");
  rl.close();
  return answer
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildTechIndex(keys) {
  const sorted = keys.slice().sort();
  const lines = [];
  lines.push("# Tech Stack Rules");
  lines.push("");
  lines.push(
    "Stack-specific quality rules that **extend** the general [Developer Quality Rules](../quality-rules.md). Apply both: the general bar always holds; the files below add language/framework-specific rules. Tech Lead enforces them at review."
  );
  lines.push("");
  lines.push("## Active stacks");
  lines.push("");
  lines.push("| Stack | Category | Rules |");
  lines.push("|-------|----------|-------|");
  for (const k of sorted) {
    const s = TECH_STACKS[k];
    if (!s) continue;
    lines.push("| " + s.name + " | " + CATEGORY_LABELS[s.category] + " | [" + k + ".md](./" + k + ".md) |");
  }
  lines.push("");
  lines.push("## Add or update stacks");
  lines.push("");
  lines.push(
    "Run `npx sdlc-workflow tech <stack...>` — re-running regenerates the listed stacks; files for other stacks are kept."
  );
  lines.push("");
  lines.push("Available: " + Object.keys(TECH_STACKS).sort().join(", "));
  lines.push("");
  lines.push("List with details: `npx sdlc-workflow tech list`");
  lines.push("");
  return lines.join("\n");
}

const TECH_STACKS = {
  java: {
    name: "Java",
    category: "language",
    body: `# Java — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md). Apply alongside the general bar.

- **JDK 17+ / LTS**; prefer **records** for immutable DTOs and **sealed** types for closed hierarchies.
- **Null-safety**: return **Optional** for absent values; never use Optional for fields or parameters; annotate nullability (JSpecify / JSR-305) where adopted.
- **Immutability by default**: final fields, no setters on value objects.
- **Exceptions**: never swallow; wrap with context, don't lose the cause; no control flow via exceptions; custom exceptions carry meaningful messages.
- **Streams** for transformation, not side effects; prefer a plain loop in hot paths where it is clearer or faster.
- **equals/hashCode** consistent (or use records); avoid Lombok on JPA entities.
- **Resource management**: try-with-resources for everything Closeable.
- **Concurrency**: prefer java.util.concurrent and immutable shared state over synchronized; no blocking calls inside reactive/async contexts.
- **Time/money**: java.time with UTC Instant (never Date/Calendar); BigDecimal for money.
- **Build & static analysis**: Maven/Gradle with locked versions; SpotBugs + PMD + Checkstyle + Error Prone in CI; format with Spotless/google-java-format.
- **Tests**: JUnit 5 + AssertJ, Mockito for collaborators, Testcontainers for integration.
`,
  },
  typescript: {
    name: "TypeScript",
    category: "language",
    body: `# TypeScript — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md). Apply alongside the general bar.

- **strict** fully on, plus noUncheckedIndexedAccess, exactOptionalPropertyTypes, noImplicitOverride.
- **No any and no ts-ignore** without an inline justification + issue ID; prefer unknown + narrowing.
- **Discriminated unions** with exhaustive switch (assertNever helper); avoid a default branch for known unions.
- **Validate external data at the boundary** with a schema library (zod/valibot) and infer types from the schema — one source of truth.
- **type-only imports** (import type); enable verbatimModuleSyntax to avoid accidental runtime imports.
- **Readonly by default** for data; immutable updates.
- **No non-null assertion (!)** to silence the compiler — fix the type.
- **Avoid casts (as)**; if unavoidable, isolate and comment why.
- **Prefer string-literal unions or const objects** over enums.
- **ESLint** (typescript-eslint strict-type-checked) + Prettier in CI with 0 warnings.
`,
  },
  nodejs: {
    name: "Node.js",
    category: "language",
    body: `# Node.js — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md). Apply alongside the general bar.

- **Never block the event loop**: offload CPU-bound work to worker_threads; stream large I/O instead of buffering.
- **Handle every promise**: no floating promises; register handlers for unhandledRejection/uncaughtException that log and exit — never swallow.
- **AbortController + timeout** on every outbound call (fetch, DB, HTTP).
- **Config via env** (12-factor); validate env at startup and fail fast on missing/invalid config.
- **Structured logging** (pino/winston) with a correlation id; no console.log in production paths.
- **Security**: secure headers (helmet), validate and sanitize input, never pass user input to eval/child_process, no secrets in code.
- **Graceful shutdown**: handle SIGTERM, stop accepting connections, drain in-flight work, close DB pools.
- **Backpressure**: use streams for large payloads; never load whole files into memory.
- **Dependency hygiene**: commit the lockfile, npm audit gate, minimal deps, pin engines in package.json.
- **Modern runtime**: ESM modules; native fetch/AbortSignal (Node 18+).

## Logging config
- **pino** (fast JSON) with **redact** paths for deep masking (e.g. authorization, password, *.token, req.headers.cookie); pretty transport for dev only, JSON in prod.
- **AsyncLocalStorage** carries requestId/traceId/userId across async without threading them through calls.
- **pino-http** (or a middleware) logs method, route, status, and responseTime; generates or forwards the request id.
- Propagate **traceparent** on outbound fetch/axios; wire the OpenTelemetry SDK.
- Log to **stdout** only — never manage log files in the app.
`,
  },
  "spring-boot": {
    name: "Spring Boot",
    category: "backend",
    body: `# Spring Boot — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md) and the backend section. Apply alongside the general bar.

- **Layering**: controller → service → repository; no business logic in controllers; DTOs at the boundary (never expose entities).
- **Constructor injection only** (no field @Autowired); keep components stateless.
- **Config**: typed @ConfigurationProperties over scattered @Value; profiles per environment; secrets via env/Vault, not application.yml.
- **Validation**: @Valid + Bean Validation on request DTOs; a global @ControllerAdvice mapping to RFC 7807 ProblemDetail responses.
- **Transactions**: @Transactional at the service layer with explicit readOnly; understand propagation; never on controllers.
- **Observability**: Actuator liveness/readiness/health; Micrometer metrics; tracing with correlation id.
- **Security**: Spring Security with method-level authorization, deny by default, CSRF for cookie auth, CORS allowlist, object-level checks (no IDOR).
- **Resilience**: timeouts on RestClient/WebClient; Resilience4j (retry, circuit breaker, bulkhead) for downstreams.
- **Tests**: slice tests (@WebMvcTest, @DataJpaTest) over full @SpringBootTest; Testcontainers for the real DB (do not use H2 to stand in for DB-specific behavior).

## Logging & observability config
- **Logback** with two profiles: a plain pattern for dev and **JSON** (logstash-logback-encoder) for prod; toggle via Spring profile or LOG_FORMAT.
- **MDC filter** (OncePerRequestFilter) populates requestId, traceId, spanId, correlationId, userId/username at entry and clears them in a finally block.
- **Micrometer Tracing + OpenTelemetry/Brave** propagates W3C traceparent on RestClient/WebClient outbound and reads it inbound.
- **Request logging**: a filter or interceptor (StopWatch) logging method, templated route, status, and duration; reserve Actuator http-exchanges for non-prod.
- **Redaction**: a Logback masking converter (or logstash masking) for sensitive fields; never log request bodies or the Authorization header.
- **Levels per package** via logging.level.*; never DEBUG SQL in prod.
`,
  },
  "spring-jpa": {
    name: "Spring Data JPA / Hibernate",
    category: "persistence",
    body: `# Spring Data JPA / Hibernate — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md) and the backend section. Apply alongside the general bar.

- **Never expose entities over the API** — map to DTOs/projections.
- **Avoid N+1**: use fetch joins, @EntityGraph, or projections; keep associations LAZY and verify with SQL logging.
- **Disable open-session-in-view** in production (spring.jpa.open-in-view=false).
- **Transaction boundaries** at the service layer; keep them short; understand the flush/session lifecycle.
- **Pagination** with Pageable on every list query; never load unbounded collections.
- **Optimistic locking** with @Version for concurrent updates; handle OptimisticLockException.
- **Schema migrations** via Flyway/Liquibase; never ddl-auto=update/create in production (validate only).
- **Bidirectional relations**: manage both sides; understand cascade and orphanRemoval before using them.
- **Bulk operations** via modifying queries/batch; don't load entities just to delete them.
- **Indexes** on foreign keys and query predicates; review generated SQL for hot paths.

## Logging config
- **SQL**: logging.level.org.hibernate.SQL=DEBUG in non-prod only — **never in prod**.
- **Bound parameters**: logging.level.org.hibernate.orm.jdbc.bind=TRACE in dev only — params may contain PII, keep off in prod.
- **Slow query**: use datasource-proxy / p6spy (or Hibernate session metrics) with a threshold logged at WARN (~300ms).
- **Migrations**: Flyway/Liquibase log applied versions at INFO.
- Prefer **statistics + slow-query log + metrics** over full SQL logging in prod.
`,
  },
  quarkus: {
    name: "Quarkus",
    category: "backend",
    body: `# Quarkus — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md) and the backend section. Apply alongside the general bar.

- **Build-time DI** (CDI/Arc): constructor injection; avoid reflection-heavy patterns that break native image.
- **Native image readiness**: register reflection where required and build/test the native image in CI, not only JVM mode.
- **Reactive vs imperative**: choose one consistently per endpoint; on reactive (Mutiny) never block the event loop — annotate blocking work with @Blocking.
- **Panache**: keep persistence thin; still map to DTOs at the boundary; avoid N+1 with fetch joins.
- **Config**: MicroProfile Config with typed @ConfigMapping; profiles; secrets via env/Vault.
- **Resilience**: SmallRye Fault Tolerance (@Retry, @CircuitBreaker, @Timeout) on downstreams.
- **Observability**: SmallRye Health (liveness/readiness), Micrometer metrics, OpenTelemetry tracing.
- **Validation**: Hibernate Validator on DTOs; exception mappers returning problem+json.
- **Testing**: Dev Services / Testcontainers for integration; native-mode smoke tests.
- **Startup/memory**: leverage fast startup; avoid eager heavy initialization.

## Logging config
- **quarkus.log.console.json=true** for prod (JSON); a pattern/plain format for dev.
- Levels via quarkus.log.category."...".level; never DEBUG SQL/Hibernate in prod.
- **quarkus.hibernate-orm.log.sql** in dev only; bound params off in prod.
- **OpenTelemetry** extension propagates traceparent on the REST client and reads it inbound; add MDC keys to the log format.
- **Access log** (quarkus.http.access-log.enabled) with a pattern including status + duration.
`,
  },
  nestjs: {
    name: "NestJS",
    category: "backend",
    body: `# NestJS — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md), the backend section, and [TypeScript rules](./typescript.md). Apply alongside the general bar.

- **Module boundaries**: feature modules exporting only what's needed; no circular deps (prefer redesign over forwardRef).
- **DI via providers**; thin controllers → services; no business logic in controllers.
- **DTOs + class-validator/class-transformer**; a global ValidationPipe with whitelist + forbidNonWhitelisted (anti mass-assignment).
- **Cross-cutting via the right primitive**: Guards (authz), Interceptors (transform/logging/correlation id), Pipes (validation), global ExceptionFilter → problem+json.
- **Config**: @nestjs/config with schema validation (zod/Joi) at startup; fail fast.
- **Async**: never block; handle rejections; OnApplicationShutdown / enableShutdownHooks for graceful shutdown.
- **Security**: helmet, rate limiting (@nestjs/throttler), CORS allowlist, object-level authorization (no IDOR/BOLA).
- **Persistence**: repository pattern; map entities → DTOs; avoid N+1 (see ORM rules).
- **Testing**: unit-test services with mocked providers; e2e with Testcontainers; coverage per the general bar.
- **TypeScript bar applies**: strict, no any.

## Logging config
- Use **nestjs-pino** (JSON + redact) as the app logger; bind requestId/traceId/userId via AsyncLocalStorage.
- A **LoggingInterceptor** logs each request (method, route, status, duration); a global **ExceptionFilter** logs errors (redacted) and returns problem+json.
- Propagate trace context on HttpService/axios via OpenTelemetry.
- Configure levels via env; no query logging in prod (see TypeORM rules).
`,
  },
  nextjs: {
    name: "Next.js (App Router)",
    category: "frontend",
    body: `# Next.js (App Router) — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md), the frontend/i18n sections, and [TypeScript rules](./typescript.md). Apply alongside the general bar.

- **Server Components by default**; add 'use client' only where interactivity is needed; keep client bundles small.
- **Deliberate data fetching & caching**: choose force-cache vs no-store vs revalidate per call; document the rendering strategy (SSG/ISR/SSR) for each route.
- **Server Actions are public endpoints**: validate input (zod), authorize inside the action, never trust the client.
- **Secrets stay server-side**: only NEXT_PUBLIC_* reach the browser.
- **Core Web Vitals**: next/image, next/font, dynamic import for heavy client code, minimize client JS; budget LCP/CLS/INP.
- **Metadata/SEO**: the Metadata API per route; correct canonical/OG tags.
- **State UX**: provide error.tsx, loading.tsx, not-found.tsx and Suspense boundaries per segment.
- **Accessibility & i18n**: semantic HTML / WCAG 2.1 AA; i18n routing with no hardcoded strings.
- **Route handlers**: validate, authorize, and set correct status/caching headers.
- **TypeScript bar applies**: strict, no any.
`,
  },
  angular: {
    name: "Angular",
    category: "frontend",
    body: `# Angular — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md), the frontend/i18n sections, and [TypeScript rules](./typescript.md). Apply alongside the general bar.

- **Standalone components** + lazy-loaded routes; keep feature areas isolated.
- **OnPush change detection** by default; prefer **signals** or the async pipe over manual subscriptions.
- **RxJS hygiene**: unsubscribe (takeUntilDestroyed / async pipe); no nested subscribes; transform with operators, don't put logic in subscribe.
- **Typed reactive forms** for non-trivial forms; validate and show error states.
- **Smart/dumb split**: typed @Input/@Output; no logic in templates.
- **State**: a predictable store (NgRx or signal store) for shared state; immutable updates.
- **HTTP**: interceptors for auth/error/correlation id; timeouts; typed responses; handle loading/empty/error states.
- **Security**: rely on Angular sanitization; never bypassSecurityTrust with untrusted input; enable XSRF protection for cookie auth.
- **Performance**: trackBy on lists, lazy loading, @defer blocks, avoid heavy pipes in templates.
- **Accessibility & i18n**: WCAG 2.1 AA; Angular i18n or transloco with no hardcoded strings. **TypeScript bar applies** (strict).
`,
  },
  typeorm: {
    name: "TypeORM",
    category: "persistence",
    body: `# TypeORM — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md), the backend section, and [TypeScript rules](./typescript.md). Apply alongside the general bar.

- **Migrations only**: never synchronize=true in production; commit and review generated migrations; make them reversible.
- **Avoid N+1**: load relations explicitly with QueryBuilder joins; inspect logged SQL in dev.
- **Transactions**: wrap multi-write operations (QueryRunner / transaction helper); keep them short; handle rollback.
- **Pagination** (take/skip or cursor) on every list query; never findAll unbounded.
- **Don't expose entities over the API** — map to DTOs; beware lazy relations serializing unexpectedly.
- **Indexes** via @Index on query predicates and foreign keys; enforce unique constraints in the DB, not just the app.
- **Concurrency**: @VersionColumn for optimistic locking.
- **Connection pool** sized appropriately; query timeouts; close on shutdown.
- **Avoid global eager: true**; load explicitly.
- **Parameterize** all queries; never interpolate user input into raw SQL.

## Logging config
- **logging**: dev uses ["error","warn","migration"] (+ "query"/"schema" locally only); **prod restricts to ["error","warn","migration"]**.
- **maxQueryExecutionTime**: set (e.g. 300ms) so slow queries are logged as warnings.
- **Never log parameters with PII in prod** — supply a custom Logger that redacts bound params.
- Migrations log at INFO; query logging is DEBUG-only and off in prod.
`,
  },
  kafka: {
    name: "Apache Kafka",
    category: "messaging",
    body: `# Apache Kafka — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md) and the backend eventing section. Apply alongside the general bar.

- **Idempotent producer** (enable.idempotence=true, acks=all) to avoid duplicates.
- **Explicit delivery semantics**: design consumers to be **idempotent** assuming at-least-once; use transactions/EOS only when justified.
- **Manual offset commit** after successful processing; never auto-commit before the work is done.
- **Dead-letter topic** for poison messages + a retry-topic strategy with backoff and a retry cap.
- **Schema management**: Schema Registry (Avro/Protobuf) with compatibility rules; version events; no breaking schema changes.
- **Partitioning/key strategy** documented where ordering matters.
- **Outbox pattern** for DB ↔ Kafka consistency (no dual-write).
- **Error handling**: distinguish retriable vs non-retriable; don't block the consumer group on one bad record.
- **Observability**: consumer lag, processing latency, and DLQ alerts.
- **Config & shutdown**: tune max.poll.records/timeouts to processing time; close the consumer and commit on graceful shutdown.
- **Context propagation**: carry W3C traceparent + correlationId in **message headers**; consumers restore them into MDC so logs correlate across services.
`,
  },
  rabbitmq: {
    name: "RabbitMQ",
    category: "messaging",
    body: `# RabbitMQ — Quality Rules

Extends [Developer Quality Rules](../quality-rules.md) and the backend eventing section. Apply alongside the general bar.

- **Manual ack** after successful processing; nack/reject with a deliberate requeue policy on failure; no auto-ack for important work.
- **Idempotent consumers** (assume redelivery / at-least-once).
- **Dead-letter exchange (DLX)** + retry with TTL/backoff and a retry cap to avoid poison-message loops.
- **Durability**: durable queues + persistent messages for data that must survive a broker restart; enable publisher confirms.
- **Prefetch (QoS)** set to bound unacked messages per consumer (fair dispatch).
- **Exchange/routing design** (topic/direct/fanout) documented and versioned.
- **Outbox pattern** for DB ↔ broker consistency (no dual-write).
- **Connection/channel management**: long-lived connections, one channel per thread, automatic recovery, graceful shutdown.
- **Observability**: queue depth, unacked count, DLQ alerts, consumer health.
- **Security**: per-service vhost and credentials, least privilege, TLS.
- **Context propagation**: carry traceparent + correlationId in **message/AMQP headers**; consumers restore them into MDC so logs correlate across services.
`,
  },
};

main();
