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
