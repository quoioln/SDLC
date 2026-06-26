# Business BA

**One folder per epic/feature.** Do not put all epics/features in one file.

- Use the same epic/feature slug as PO: `docs/sdlc/ba/business/{epic-slug}/`
- Inside that folder: `functional-requirements.md`, `process-flows.md`, `use-cases.md` (or similar) for that epic only.

Example:
```
docs/sdlc/ba/business/
  job-scheduler-event-bus/
    functional-requirements.md
    process-flows.md
  user-auth/
    functional-requirements.md
```

## Analysis lenses (run these BEFORE writing FRs)

Apply each lens explicitly to find requirements you'd otherwise miss. These are the *methods*; the checklist below is the *output*.

- [ ] **Event Storming / process decomposition**: Map domain events ("OrderPlaced"), the commands that cause them, the actors, and the aggregates — before writing FRs. Surfaces flows and rules that prose requirements hide.
- [ ] **Decision tables**: For any rule with multiple conditions, build an exhaustive condition × action matrix. The empty cells are your missing requirements / undefined behaviour.
- [ ] **State machine per key entity**: Enumerate states, allowed transitions, and guards. Any transition not listed is explicitly forbidden — write that as a rule.
- [ ] **CRUD / authority matrix**: Actor × Entity × operation (Create/Read/Update/Delete). Each cell is an authz requirement; blanks reveal missing permission rules.
- [ ] **Edge-case taxonomy** (per input/field): boundary, null/empty, max length/size, wrong type, duplicate, **concurrency/race**, idempotency, partial failure, timeout. Each becomes a negative AC.
- [ ] **Data-flow + classification**: Trace each data element source → store → sink; classify PII/sensitivity and retention at each hop (feeds the data dictionary + compliance matrix).
- [ ] **Domain pack**: For the epic's domain(s), turn each applicable row of [domain-packs.md](../../domain-packs.md) into concrete FR/NFR + Gherkin AC, and add a **compliance-matrix** entry: regulation ↔ requirement ID ↔ test ID.

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
- [ ] **Handoff to Design (if app/web) or Architect**: Deliverables in `ba/business/{epic-slug}/`

Use functional-requirement.template.md for FRS items.
